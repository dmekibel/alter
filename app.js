/* ALTER v1.3 — RPG character: sub-attribute self-assessment + pixel avatar,
   gamified picker, Toggl multitask timers, Streaks habits, auto-adjust schedule, proactive. $0. */
(function () {
  "use strict";
  // ---- TTS: iOS-safe browser speech for the guided modules ($0, on-device, no API). Robustness per research:
  //   lazy voice load (event + poll), gesture-bound unlock via a silent primer, cancel-before-speak,
  //   short-chunk + watchdog (dodge the ~15s cutoff & missing onend), hard ref (anti-GC), stop on hide/lock. ----
  var TTS = (function () {
    var synth = window.speechSynthesis || null;
    var supported = !!synth && typeof window.SpeechSynthesisUtterance === "function";
    var voices = [], chosen = null, unlocked = false, curU = null, wd = null, polls = 0;
    var PREF = ["Samantha", "Ava", "Allison", "Serena", "Karen", "Moira", "Fiona", "Tessa", "Google UK English Female", "Google US English", "Microsoft Aria Online (Natural)", "Microsoft Jenny"];
    function load() { if (!supported) return; var l = synth.getVoices(); if (l && l.length) { voices = l; chosen = null; } }
    function resolve() {
      if (chosen) return chosen;
      if (!voices.length) load();
      var i, j;
      for (i = 0; i < PREF.length; i++) for (j = 0; j < voices.length; j++) if (voices[j].name === PREF[i]) { chosen = voices[j]; return chosen; }
      for (j = 0; j < voices.length; j++) if (voices[j].lang && voices[j].lang.indexOf("en") === 0) { chosen = voices[j]; return chosen; }
      return null; // null voice is valid — the OS default still speaks
    }
    function initVoices() {
      if (!supported) return; load();
      try { synth.addEventListener("voiceschanged", load); } catch (e) { synth.onvoiceschanged = load; }
      var p = setInterval(function () { load(); if (voices.length || ++polls > 12) clearInterval(p); }, 250); // ~3s
    }
    function unlock() { if (!supported || unlocked) return; try { synth.cancel(); var u = new SpeechSynthesisUtterance(" "); u.volume = 0.01; synth.speak(u); unlocked = true; } catch (e) {} }
    function clearWd() { if (wd) { clearTimeout(wd); wd = null; } }
    function chunk(text) {
      if (text.length <= 200) return [text];
      var parts = text.match(/[^.!?]+[.!?]*\s*/g) || [text], out = [], buf = "", k;
      for (k = 0; k < parts.length; k++) { if ((buf + parts[k]).length > 200 && buf) { out.push(buf); buf = ""; } buf += parts[k]; }
      if (buf) out.push(buf); return out;
    }
    function speakChunks(chunks, i, opts) {
      if (i >= chunks.length) { if (opts.onend) try { opts.onend(); } catch (e) {} return; }
      var u = new SpeechSynthesisUtterance(chunks[i]), v = resolve();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
      u.rate = opts.rate != null ? opts.rate : 0.85; u.pitch = opts.pitch != null ? opts.pitch : 0.95; u.volume = opts.volume != null ? opts.volume : 0.95;
      curU = u; // hold ref so GC can't kill onend/onerror mid-speech
      function next() { clearWd(); curU = null; speakChunks(chunks, i + 1, opts); }
      u.onend = next; u.onerror = next;
      clearWd(); var est = Math.max(3500, chunks[i].length * 95); wd = setTimeout(function () { curU = null; speakChunks(chunks, i + 1, opts); }, est + 2000);
      try { synth.speak(u); } catch (e) { next(); }
    }
    function speak(text, opts) {
      if (!supported || !text) return; opts = opts || {};
      try { synth.cancel(); } catch (e) {} // single utterance in flight
      var chunks = chunk(String(text));
      setTimeout(function () { speakChunks(chunks, 0, opts); }, 60); // let cancel() settle on iOS
    }
    function stop() { if (!supported) return; clearWd(); curU = null; try { synth.cancel(); } catch (e) {} }
    if (typeof document !== "undefined") { document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); }); window.addEventListener("pagehide", stop); }
    initVoices();
    return { supported: supported, unlock: unlock, speak: speak, stop: stop };
  })();
  // per-module voice profiles (rate/pitch/volume) — calmer/slower than a screen reader, per the meditation-TTS UX research
  var VPROF = {
    med: { rate: 0.80, pitch: 0.92, volume: 0.90 }, relax: { rate: 0.80, pitch: 0.92, volume: 0.90 },
    eft: { rate: 0.88, pitch: 0.95, volume: 0.92 }, mantra: { rate: 0.78, pitch: 0.90, volume: 0.85 },
    breath: { rate: 0.85, pitch: 0.92, volume: 0.90 }
  };
  function voiceOn() { return typeof S === "undefined" || !S || S.voice !== false; } // default ON
  function say(text, prof) { if (voiceOn()) TTS.speak(text, prof); }
  // 🔊/🔇 toggle for guided overlays — top-left, mirrors the skip button. Lets David mute mid-session.
  function addVoiceToggle(ov) {
    if (!TTS.supported) return null;
    var b = document.createElement("button"); b.className = "bw-voice"; b.type = "button";
    function paint() { b.textContent = voiceOn() ? "🔊" : "🔇"; }
    paint();
    b.onclick = function (e) { e.stopPropagation(); if (S) { S.voice = !voiceOn(); save(); } paint(); if (!voiceOn()) TTS.stop(); };
    ov.appendChild(b); return b;
  }
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_plan2", SCHEMA = 1, lastSaveErr = 0;
  var DAY_END = 24 * 60;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  var DAYSTART = 4 * 60; // the day rolls over at 4am — the dead of night, when you're asleep, so you never SEE the date change; a 1–2am activity still belongs to the night before (David 2026-06-26)
  function logicalK(d) { var x = new Date(d); if (x.getHours() * 60 + x.getMinutes() < DAYSTART) x.setDate(x.getDate() - 1); return key(x); } // which LOGICAL day a timestamp belongs to (before 4am → the previous date)
  function todayK() { return logicalK(new Date()); }
  function tomK() { var d = new Date(); if (d.getHours() * 60 + d.getMinutes() < DAYSTART) d.setDate(d.getDate() - 1); d.setDate(d.getDate() + 1); return key(d); }
  function uid() { return "x" + Math.random().toString(36).slice(2, 8); }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); } // wall-clock minutes (0–1439) — for elapsed/timers
  function logicalNowMin() { var m = nowMin(); return m < DAYSTART ? m + 1440 : m; } // minutes within the 4am→4am window — the timeline's notion of "now"
  function toWin(m) { return m < DAYSTART ? m + 1440 : m; } // map a 0–1439 clock minute into the 4am-start window
  // YOUR day = wake → bedtime (from onboarding) — top of the timeline ≈ when you wake, bottom ≈ when you sleep (David 2026-06-26)
  function wakeHour() { var w = (S.profile && S.profile.wake) || "", m = { "before 6": 5, "6–7": 6, "7–8": 7, "8–9": 8, "9–10": 9, "later": 10, "varies": 6 }; return m[w] != null ? m[w] : 6; }
  function bedHour() { var b = (S.profile && S.profile.sleep) || "", m = { "before 10": 22, "10–11": 23, "11–12": 24, "12–1": 25, "1–2": 26, "later": 27, "varies": 24 }; return m[b] != null ? m[b] : 24; }
  function dayWindow() { var s = Math.max(4, wakeHour() - 3); return { startH: s, endH: s + 24 }; } // FULL 24h window starting ~3h before wake → each day TILES seamlessly into the next (bottom hour == next day's top hour), so there's no 2am–4am hole at the boundary (the "missing 3" + background break). You still LAND on now/wake; scroll up reveals the quiet early hours. (David 2026-06-27)
  function hm(t) { if (!t) return 0; var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt(min) { min = Math.round(min) % 1440; var h = Math.floor(min / 60), m = min % 60; var ap = h < 12 ? "am" : "pm"; h = h % 12 || 12; return h + ":" + pad(m) + ap; }
  function dur(m) { if (m < 60) return m + "m"; var h = Math.floor(m / 60), mm = m % 60; return h + "h" + (mm ? " " + mm + "m" : ""); }
  function daysSince(k) { if (!k) return 999; return Math.round((new Date(todayK() + "T00:00:00") - new Date(k + "T00:00:00")) / 86400000); }
  function lastDays(n) { var o = [], d = new Date(); for (var i = 0; i < n; i++) { o.push(key(d)); d.setDate(d.getDate() - 1); } return o; }
  function kd(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function keyAdd(k, n) { var d = kd(k); d.setDate(d.getDate() + n); return key(d); }
  function monthAdd(k, n) { var d = kd(k); d.setDate(1); d.setMonth(d.getMonth() + n); return key(d); }
  function startOfWeek(k) { var d = kd(k); d.setDate(d.getDate() - d.getDay()); return key(d); }
  function relLabel(k) { if (k === todayK()) return "Today"; if (k === tomK()) return "Tomorrow"; if (k === keyAdd(todayK(), -1)) return "Yesterday"; return kd(k).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }); }
  function dayLabelFull(k) { var rl = relLabel(k); if (rl === "Today" || rl === "Tomorrow" || rl === "Yesterday") return rl + " · " + kd(k).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }); return rl; } // Tomorrow/Today/Yesterday also show weekday + date (David 2026-06-24)
  function relShort(k) { return kd(k).toLocaleDateString([], { month: "short", day: "numeric" }); }
  function blockStatus(dk, b) { var bs = hm(b.time), be = bs + (b.mins || 30), dl = (S && S.log && S.log[dk]) || [], ov = false, bd = domainOf(b); for (var i = 0; i < dl.length; i++) { var ls = hm(dl[i].time), le = ls + (dl[i].mins || 0); if (ls < be && le > bs && domainOf(dl[i]) === bd) { ov = true; break; } } if (b.done || ov) return "ok"; if (dk < todayK()) return "miss"; if (dk === todayK() && be <= logicalNowMin()) return "miss"; return "plan"; } // "done" only if you actually did the SAME domain; otherwise a passed plan goes ghost/dark (David 2026-06-23)
  var viewK = todayK(), zoomMode = "day", pendingScrollNow = true, nowLineEl = null;

  var DEFAULT_HABITS = [{ id: "move", e: "🏃", l: "Move", type: "build", per: 0, color: "#ff8a1e" }, { id: "deep", e: "🧠", l: "Deep work", type: "build", per: 0, color: "#2a9fe0" }, { id: "tidy", e: "🧹", l: "Tidy space", type: "build", per: 0, color: "#ff8a1e" }, { id: "teeth", e: "🪥", l: "Brush teeth", type: "build", per: 0, color: "#48d0e0" }, { id: "read", e: "📖", l: "Read", type: "build", per: 3, color: "#9a5cf0" }, { id: "breathe", e: "🌬️", l: "Breathe", type: "build", per: 0, color: "#6a5cf0" }];
  var TIDY_SUB = ["Make the bed", "Clear the table", "Do laundry", "Sweep / vacuum", "Clear the desk", "Take out trash"];
  // SHORT-TERM goal decomposition (David: "split complex cleaning into subtasks — dishes, vacuum…"): any complex activity → concrete steps
  var SUBTASKS = {
    "clean": ["Do dishes", "Vacuum", "Laundry", "Make the bed", "Wipe surfaces", "Take out trash"],
    "tidy": ["Do dishes", "Vacuum", "Laundry", "Make the bed", "Clear the desk", "Take out trash"],
    "chores": ["Do dishes", "Vacuum", "Laundry", "Take out trash", "Wipe surfaces"],
    "cook": ["Plan the meal", "Prep ingredients", "Cook", "Plate up", "Clean the kitchen"],
    "meal prep": ["Plan meals", "Shop", "Batch cook", "Portion + store"],
    "groceries": ["Make a list", "Go to the store", "Put it away"],
    "deep work": ["Pick the ONE thing", "Phone away", "25-min sprint", "Short break", "Wrap + note next step"],
    "study": ["Gather materials", "Review notes", "Practice problems", "Quiz yourself"],
    "errands": ["List the errands", "Group by area", "Head out", "Tick them off"],
    "laundry": ["Sort", "Wash", "Dry", "Fold + put away"]
  };
  function subtasksFor(title) { var t = (title || "").toLowerCase(); for (var k in SUBTASKS) { if (t.indexOf(k) !== -1) return SUBTASKS[k]; } return null; }
  // CLEANING & CHORES — a stateful subsystem (David): a digital trace of your space; tracks how long since each chore, prioritizes overdue, keeps a clean space a priority
  var CHORES_DEF = [
    { id: "dishes", l: "Dishes", ti: "ti-bowl", every: 1 }, { id: "bed", l: "Make the bed", ti: "ti-bed", every: 1 },
    { id: "trash", l: "Take out trash", ti: "ti-trash", every: 3 }, { id: "surfaces", l: "Wipe surfaces", ti: "ti-spray", every: 4 },
    { id: "floor", l: "Floors — vacuum / sweep", ti: "ti-wind", every: 7 }, { id: "laundry", l: "Laundry", ti: "ti-wash-machine", every: 7 }, { id: "bathroom", l: "Bathroom", ti: "ti-bath", every: 8 }
  ];
  function spaceDone() { S.space = S.space || { done: {} }; S.space.done = S.space.done || {}; return S.space.done; }
  function choreFresh(c) { var last = spaceDone()[c.id], d = last ? daysSince(last) : 999, ratio = d / c.every; return { days: d, last: last, ratio: ratio, state: ratio < 0.75 ? "fresh" : ratio < 1.4 ? "due" : "overdue" }; }
  function choreMark(c) { spaceDone()[c.id] = todayK(); var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: c.l, mins: 10, catK: "energy", color: DOM.upkeep.c, domain: "upkeep" }); S.lastTidy = todayK(); doneMap(todayK()).tidy = true; try { earn(10, {}); } catch (e) {} save(); }
  function spaceScore() { var ok = 0; CHORES_DEF.forEach(function (c) { if (choreFresh(c).state !== "overdue") ok++; }); return Math.round(ok / CHORES_DEF.length * 100); }
  function mostOverdueChore() { var od = CHORES_DEF.filter(function (c) { return choreFresh(c).state === "overdue"; }).sort(function (a, b) { return choreFresh(b).ratio - choreFresh(a).ratio; }); return od[0] || null; }
  function choresSheet() {
    var ov = add(document.body, "div", "bento-ov"), card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head"), hq = add(head, "div", "bento-q"), xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); renderToday(); };
    ov.addEventListener("click", function (e) { if (e.target === ov) { ov.remove(); renderToday(); } });
    var body = add(card, "div", "bento-body");
    function render() {
      hq.innerHTML = '<i class="ti ti-home"></i> Your space · ' + spaceScore() + '% fresh'; body.innerHTML = "";
      add(body, "div", "sughead", "tap to mark done · overdue floats to the top");
      CHORES_DEF.slice().sort(function (a, b) { return choreFresh(b).ratio - choreFresh(a).ratio; }).forEach(function (c) {
        var f = choreFresh(c), row = add(body, "div", "chore " + f.state); row.innerHTML = '<i class="ti ' + c.ti + ' chore-i"></i>';
        var mid = add(row, "div", "chore-mid"); add(mid, "div", "chore-l", c.l); var bar = add(mid, "div", "chore-bar"), fi = add(bar, "i"); fi.style.width = Math.min(100, Math.round(f.ratio * 100)) + "%"; fi.style.background = f.state === "overdue" ? "#ff7a6e" : f.state === "due" ? "#ffc83d" : "#34d39a";
        add(row, "div", "chore-d", f.days >= 999 ? "never" : f.days === 0 ? "today" : f.days + "d ago");
        var go = add(row, "button", "chore-go"); go.textContent = f.days === 0 ? "✓" : "do it"; go.disabled = f.days === 0; go.onclick = function () { choreMark(c); render(); };
      });
    }
    render();
  }
  var DURS = [15, 30, 45, 60, 90, 120];
  var MORNING_RITUAL = { t: "☀️ Morning bookend", steps: [
    { l: "Make your bed", e: "🛏️", log: { title: "Make the bed", catK: "energy", color: "#ff8a1e", habitId: "tidy", mins: 3 } },
    { l: "Quick tidy", e: "🧹", log: { title: "Tidy", catK: "energy", color: "#ff8a1e", habitId: "tidy", mins: 5 } },
    { l: "Journal a few lines", e: "📓", log: { title: "Journal", catK: "love", color: "#ff4fa0", mins: 5 } },
    { l: "Name today's ONE thing", e: "🎯", action: "plan" },
    { l: "Three deep breaths", e: "🌬️", log: { title: "Breathe", catK: "energy", color: "#ff8a1e", habitId: "breathe", mins: 2 } }
  ] };
  var EVENING_RITUAL = { t: "🌙 Evening bookend", steps: [
    { l: "What went well today?", e: "🙏", log: { title: "Gratitude", catK: "love", color: "#ff4fa0", mins: 4 } },
    { l: "Tidy your space", e: "🧹", log: { title: "Tidy", catK: "energy", color: "#ff8a1e", habitId: "tidy", mins: 5 } },
    { l: "Set tomorrow's ONE thing", e: "🎯", action: "planTom" },
    { l: "Put the phone to bed", e: "📵" }
  ] };
  var WINDDOWN = { t: "😴 Wind down", steps: [
    { l: "Dim the lights", e: "🌙" },
    { l: "Tidy the surfaces", e: "🧹", log: { title: "Tidy", catK: "energy", color: "#ff8a1e", habitId: "tidy", mins: 4 } },
    { l: "Phone out of reach", e: "📵" },
    { l: "Head toward bed", e: "🛏️" }
  ] };
  var PRIOS = [{ v: 3, l: "Must", c: "#ff4fa0" }, { v: 2, l: "Should", c: "#8a5cf0" }, { v: 1, l: "Nice", c: "#b9b0cf" }];
  function prioC(v) { for (var i = 0; i < PRIOS.length; i++) if (PRIOS[i].v === v) return PRIOS[i].c; return "#8a5cf0"; }
  var FACES = ["😞", "😕", "😐", "🙂", "💪"];
  var CATS = [
    { k: "energy", label: "Energy", e: "⚡", color: "#ff8a1e", groups: [
      { g: "Fitness", tasks: [{ l: "Run", e: "🏃", id: "move" }, { l: "Gym", e: "🏋️", id: "move" }, { l: "Outdoor gym", e: "💪", id: "move" }, { l: "Go outside", e: "🌤️" }, { l: "Walk", e: "🚶" }, { l: "Yoga", e: "🧘" }, { l: "Stretch", e: "🤸" }, { l: "Cycle", e: "🚴" }, { l: "Swim", e: "🏊" }, { l: "Sports", e: "⚽" }, { l: "Hike", e: "🥾" }] },
      { g: "Body", tasks: [{ l: "Brush teeth", e: "🪥" }, { l: "Wash up", e: "🧼" }, { l: "Cold shower", e: "🧊" }, { l: "Shower", e: "🚿" }, { l: "Skincare", e: "🧴" }, { l: "Meditate", e: "🧘" }, { l: "Breathe", e: "🌬️", id: "breathe" }, { l: "Sauna", e: "♨️" }, { l: "Sun", e: "☀️" }] },
      { g: "Sleep", tasks: [{ l: "Sleep", e: "😴" }, { l: "Nap", e: "💤" }, { l: "Wind down", e: "🌙" }, { l: "Wake early", e: "⏰" }] },
      { g: "Food", tasks: [{ l: "Breakfast", e: "🥣" }, { l: "Lunch", e: "🥪" }, { l: "Dinner", e: "🍲" }, { l: "Snack", e: "🍎" }, { l: "Coffee", e: "☕" }, { l: "Cook", e: "🍳" }, { l: "Eat healthy", e: "🥗" }, { l: "Hydrate", e: "💧" }, { l: "Vitamins", e: "💊" }, { l: "Protein", e: "🥩" }, { l: "Meal prep", e: "🍱" }] },
      { g: "Space", tasks: [{ l: "Tidy", e: "🧹", id: "tidy" }, { l: "Clean room", e: "🧼", id: "tidy" }, { l: "Laundry", e: "🧺", id: "tidy" }, { l: "Dishes", e: "🍽️" }, { l: "Make bed", e: "🛏️", id: "tidy" }, { l: "Groceries", e: "🛒" }] }
    ] },
    { k: "work", label: "Work", e: "💼", color: "#2a9fe0", groups: [
      { g: "Focus", tasks: [{ l: "Deep work", e: "🧠", id: "deep" }, { l: "Claude code", e: "🤖", id: "deep" }, { l: "Programming", e: "💻", id: "deep" }, { l: "Writing", e: "✍️" }, { l: "Study", e: "📚" }, { l: "Research", e: "🔬" }] },
      { g: "Create", tasks: [{ l: "AI art", e: "🪄" }, { l: "Midjourney", e: "🖼️" }, { l: "Design", e: "🎨" }, { l: "Video", e: "🎬" }, { l: "Reel", e: "🎞️" }, { l: "LinkedIn post", e: "💼" }, { l: "Music prod", e: "🎚️" }, { l: "Content", e: "📲" }] },
      { g: "Admin", tasks: [{ l: "Email", e: "📧" }, { l: "Meetings", e: "👥" }, { l: "Calls", e: "📞" }, { l: "Planning", e: "🗒️" }, { l: "Errands", e: "🧾" }] },
      { g: "Money", tasks: [{ l: "Budget", e: "💵" }, { l: "Invoice", e: "🧾" }, { l: "Sell", e: "📈" }, { l: "Apply", e: "📨" }, { l: "Side hustle", e: "💰" }] },
      { g: "Ship", tasks: [{ l: "Ship / send", e: "✦", id: "send" }, { l: "Publish", e: "🚀" }, { l: "Outreach", e: "🤝" }] }
    ] },
    { k: "love", label: "Love", e: "❤️", color: "#ff4fa0", groups: [
      { g: "People", tasks: [{ l: "Partner", e: "💑" }, { l: "Family", e: "👨‍👩‍👧" }, { l: "Friends", e: "🧑‍🤝‍🧑" }, { l: "Hang out", e: "🫂" }, { l: "Cafe", e: "☕" }, { l: "Call", e: "📞" }, { l: "Date", e: "💕" }, { l: "Text back", e: "💬" }] },
      { g: "Self-love", tasks: [{ l: "Journal", e: "📓" }, { l: "Gratitude", e: "🙏" }, { l: "Therapy", e: "🛋️" }, { l: "Affirmations", e: "🪞" }, { l: "Reflect", e: "🌙" }] },
      { g: "Give", tasks: [{ l: "Help", e: "🤲" }, { l: "Quality time", e: "⏳" }, { l: "Hug", e: "🫂" }, { l: "Compliment", e: "💐" }] }
    ] },
    { k: "hobby", label: "Hobbies", e: "🎈", color: "#9a5cf0", groups: [
      { g: "Music", tasks: [{ l: "Guitar", e: "🎸" }, { l: "Piano", e: "🎹" }, { l: "Sing", e: "🎤" }, { l: "Make music", e: "🎼" }, { l: "Listen", e: "🎧" }] },
      { g: "Art", tasks: [{ l: "Draw", e: "✏️" }, { l: "Paint", e: "🖌️" }, { l: "Photo", e: "📷" }, { l: "Craft", e: "🧵" }] },
      { g: "Play", tasks: [{ l: "TV", e: "📺" }, { l: "Movie", e: "🎬" }, { l: "Relax", e: "😌" }, { l: "Games", e: "🕹️" }, { l: "Board games", e: "🎲" }, { l: "Puzzle", e: "🧩" }] },
      { g: "Mind", tasks: [{ l: "Read", e: "📖", id: "read" }, { l: "Language", e: "🗣️" }, { l: "Podcast", e: "🎙️" }, { l: "Chess", e: "♟️" }] },
      { g: "Outdoors", tasks: [{ l: "Nature", e: "🌲" }, { l: "Garden", e: "🌱" }, { l: "Travel", e: "✈️" }, { l: "Explore", e: "🗺️" }] }
    ] },
    { k: "vice", label: "Vices", e: "💀", color: "#ff4d4d", groups: [
      { g: "Digital", tasks: [{ l: "Instagram", e: "📱" }, { l: "TikTok", e: "📲" }, { l: "Scrolling", e: "📰" }, { l: "YouTube", e: "▶️" }, { l: "Doomscroll", e: "😵" }, { l: "Porn", e: "🔞" }] },
      { g: "Substance", tasks: [{ l: "Weed", e: "🌿" }, { l: "Cigarettes", e: "🚬" }, { l: "Vape", e: "💨" }, { l: "Alcohol", e: "🍷" }, { l: "Caffeine", e: "☕" }] },
      { g: "Other", tasks: [{ l: "Sugar", e: "🍬" }, { l: "Junk food", e: "🍔" }, { l: "Shopping", e: "🛍️" }, { l: "Gambling", e: "🎰" }, { l: "Procrastinate", e: "🐌" }] }
    ] }
  ];
  var OCCUPATIONS = [
    { k: "artist", l: "Artist / Creative", e: "🎨", work: [
      { g: "Create", tasks: [{ l: "Make art", e: "🎨" }, { l: "Sketch", e: "✏️" }, { l: "Edit / refine", e: "🖌️" }, { l: "Experiment", e: "🧪" }] },
      { g: "Sell", tasks: [{ l: "List work", e: "🏷️" }, { l: "Message buyers", e: "💬" }, { l: "Invoice", e: "🧾" }, { l: "Pitch", e: "📨" }] },
      { g: "Grow", tasks: [{ l: "Post content", e: "📲" }, { l: "Network", e: "🤝" }, { l: "Engage / reply", e: "💬" }, { l: "Study craft", e: "📚" }] }
    ] },
    { k: "dev", l: "Developer / Builder", e: "💻", work: [
      { g: "Build", tasks: [{ l: "Code", e: "💻" }, { l: "Debug", e: "🐞" }, { l: "Design / plan", e: "📐" }] },
      { g: "Ship", tasks: [{ l: "Deploy", e: "🚀" }, { l: "Test", e: "🧪" }, { l: "Review", e: "👀" }] },
      { g: "Grow", tasks: [{ l: "Outreach", e: "🤝" }, { l: "Demo / sell", e: "📈" }, { l: "Post update", e: "📲" }] }
    ] },
    { k: "founder", l: "Founder / Hustler", e: "🚀", work: [
      { g: "Build", tasks: [{ l: "Product work", e: "🛠️" }, { l: "Deep work", e: "🧠" }, { l: "Plan", e: "🗒️" }] },
      { g: "Sell", tasks: [{ l: "Outreach", e: "🤝" }, { l: "Sales call", e: "📞" }, { l: "Close deal", e: "💰" }, { l: "Invoice", e: "🧾" }] },
      { g: "Grow", tasks: [{ l: "Content", e: "📲" }, { l: "Network", e: "🌐" }, { l: "Fundraise", e: "💵" }] }
    ] },
    { k: "writer", l: "Writer / Creator", e: "✍️", work: [
      { g: "Make", tasks: [{ l: "Write", e: "✍️" }, { l: "Edit", e: "📝" }, { l: "Research", e: "🔎" }] },
      { g: "Publish", tasks: [{ l: "Post", e: "📲" }, { l: "Newsletter", e: "📧" }, { l: "Film / record", e: "🎬" }] },
      { g: "Grow", tasks: [{ l: "Engage / reply", e: "💬" }, { l: "Network", e: "🤝" }, { l: "Monetize", e: "💰" }] }
    ] },
    { k: "student", l: "Student", e: "📚", work: [
      { g: "Learn", tasks: [{ l: "Study", e: "📚" }, { l: "Lectures", e: "🎧" }, { l: "Practice", e: "✏️" }] },
      { g: "Produce", tasks: [{ l: "Assignment", e: "📝" }, { l: "Project", e: "🛠️" }, { l: "Revise", e: "🔁" }] },
      { g: "Plan", tasks: [{ l: "Organize", e: "🗒️" }, { l: "Office hours", e: "🧑‍🏫" }, { l: "Group work", e: "👥" }] }
    ] },
    { k: "office", l: "Office / Pro", e: "💼", work: [
      { g: "Focus", tasks: [{ l: "Deep work", e: "🧠" }, { l: "Analysis", e: "📊" }, { l: "Writing", e: "✍️" }] },
      { g: "Coordinate", tasks: [{ l: "Meetings", e: "👥" }, { l: "Email", e: "📧" }, { l: "Calls", e: "📞" }] },
      { g: "Deliver", tasks: [{ l: "Ship work", e: "🚀" }, { l: "Review", e: "👀" }, { l: "Plan", e: "🗒️" }] }
    ] },
    { k: "other", l: "Something else", e: "✨", work: null }
  ];
  var OCC_BY_K = {}; OCCUPATIONS.forEach(function (o) { OCC_BY_K[o.k] = o; });
  var CONTEXT = { morning: ["Brush teeth", "Make art", "Shower", "Journal", "Breathe", "Run"], afternoon: ["Nap", "Walk", "Eat healthy", "Stretch", "Deep work"], evening: ["Gratitude", "Cook", "Walk", "Tidy"], night: ["Wind down", "Brush teeth", "Read", "Stretch"] };
  var TITLE2CAT = {}, TITLE2META = {};
  CATS.forEach(function (c) { c.groups.forEach(function (g) { g.tasks.forEach(function (t) { TITLE2CAT[t.l.toLowerCase()] = c.k; TITLE2META[t.l.toLowerCase()] = { title: t.l, catK: c.k, emoji: t.e, color: c.color, habitId: t.id || null }; }); }); });
  OCCUPATIONS.forEach(function (o) { if (o.work) o.work.forEach(function (g) { g.tasks.forEach(function (t) { var lc = t.l.toLowerCase(); if (!TITLE2CAT[lc]) { TITLE2CAT[lc] = "work"; TITLE2META[lc] = { title: t.l, catK: "work", emoji: t.e, color: "#2a9fe0", habitId: null }; } }); }); });
  function activeCats() { var o = OCC_BY_K[(typeof S !== "undefined" && S && S.profile) ? S.profile.occ : null]; return CATS.map(function (c) { if (c.k === "work" && o && o.work) return { k: c.k, label: c.label, e: c.e, color: c.color, groups: o.work }; return c; }); }
  var HABIT2CAT = { move: "energy", breathe: "energy", tidy: "energy", deep: "work", send: "work", read: "hobby" };
  // ---- 8-DOMAIN taxonomy (DESIGN-BRIEF §24) — the canonical palette. Colors live at the CATEGORY level and drive EVERY calendar bubble (plan, real, celebration). ----
  // Domain palette — the ORIGINAL varied/beautiful set restored (David 2026-06-25: collapsing the energy family to orange made it "ugly orange"). Each domain its own colour; drift is the solid dark-red.
  var DOM = {
    move:    { l: "Move",    e: "🏃", c: "#ff8a3a", light: "#ffa24a", dark: "#ff741a", ring: "#ffcf9a", ink: "#4a2400", ti: "ti-run" },
    nourish: { l: "Nourish", e: "🍎", c: "#34d39a", light: "#5fe0b2", dark: "#22c089", ring: "#9fe8cf", ink: "#0a3326", ti: "ti-bowl-spoon" },
    focus:   { l: "Focus",   e: "🎯", c: "#36b3f0", light: "#5ec4f5", dark: "#22a6e8", ring: "#aadcf8", ink: "#08283c", ti: "ti-brain" },
    create:  { l: "Create",  e: "🎨", c: "#b07aff", light: "#c7adff", dark: "#9a5cf0", ring: "#ddccff", ink: "#241548", ti: "ti-palette" },
    connect: { l: "Connect", e: "💛", c: "#ff5fa0", light: "#ff7ab0", dark: "#ff4f96", ring: "#ffb3d6", ink: "#4a1126", ti: "ti-users" },
    play:    { l: "Play",    e: "🎮", c: "#d99f30", light: "#f0c860", dark: "#c08a22", ring: "#f2d894", ink: "#4a3000", ti: "ti-device-gamepad-2" },
    restore: { l: "Restore", e: "🌙", c: "#2ab8c4", light: "#5fd6df", dark: "#1f9aa6", ring: "#a3e4e9", ink: "#06343a", ti: "ti-moon" },
    upkeep:  { l: "Upkeep",  e: "🧹", c: "#7f9bc4", light: "#9fb6d8", dark: "#6781a8", ring: "#c4d4e8", ink: "#16243a", ti: "ti-broom" },
    drift:   { l: "Drift",   e: "🌫️", c: "#4a3d54", light: "#b3a7bf", dark: "#241b2e", ring: "#6a5c75", ink: "#d8ccdf", ti: "ti-windmill" }   // cool slate-mauve "fog" smudge + readable lilac text (was invisible black-on-black) (David 2026-06-27)
  };
  var CAT2DOM = { energy: "move", work: "focus", love: "connect", hobby: "play", vice: "drift" };
  // ordered keyword → domain (specific/multi-word first, then generic); first substring hit wins. Maps any activity title onto a domain.
  var DKW = [
    ["deep work","focus"],["make art","create"],["make music","create"],["music prod","create"],["cold shower","upkeep"],["wind down","restore"],["brush teeth","upkeep"],["board game","play"],["text back","connect"],["quality time","connect"],["meal prep","nourish"],["side hustle","focus"],["eat healthy","nourish"],["make the bed","upkeep"],
    ["run","move"],["gym","move"],["walk","move"],["yoga","move"],["stretch","move"],["cycl","move"],["bike","move"],["swim","move"],["sport","move"],["hike","move"],["danc","move"],["workout","move"],["exercise","move"],
    ["breakfast","nourish"],["lunch","nourish"],["dinner","nourish"],["cook","nourish"],["snack","nourish"],["coffee","nourish"],["hydrat","nourish"],["grocer","nourish"],["protein","nourish"],["vitamin","nourish"],["eat","nourish"],["meal","nourish"],
    ["code","focus"],["program","focus"],["study","focus"],["admin","focus"],["email","focus"],["meeting","focus"],["plan","focus"],["research","focus"],["analy","focus"],["debug","focus"],["review","focus"],["budget","focus"],["invoice","focus"],["apply","focus"],["ship","focus"],["publish","focus"],["outreach","focus"],["sell","focus"],["money","focus"],["assignment","focus"],["project","focus"],["office","focus"],["work","focus"],
    ["paint","create"],["draw","create"],["sketch","create"],["guitar","create"],["piano","create"],["sing","create"],["craft","create"],["photo","create"],["video","create"],["design","create"],["content","create"],["youtube","create"],["midjourney","create"],["write","create"],["writing","create"],["music","create"],["art","create"],["build","create"],
    ["family","connect"],["friend","connect"],["call","connect"],["date","connect"],["hang","connect"],["help","connect"],["communit","connect"],["partner","connect"],["hug","connect"],["compliment","connect"],["network","connect"],["social","connect"],["people","connect"],
    ["game","play"],["movie","play"],["watch","play"],["puzzle","play"],["chess","play"],["podcast","play"],["listen","play"],["travel","play"],["explore","play"],["hobby","play"],["read","play"],
    ["sleep","restore"],["nap","restore"],["meditat","restore"],["breath","restore"],["bath","restore"],["nature","restore"],["journal","restore"],["pray","restore"],["gratitude","restore"],["reflect","restore"],["therapy","restore"],["affirm","restore"],["sauna","restore"],["relax","restore"],["rest","restore"],
    ["shower","upkeep"],["groom","upkeep"],["clean","upkeep"],["tidy","upkeep"],["laundry","upkeep"],["dish","upkeep"],["errand","upkeep"],["doctor","upkeep"],["wash","upkeep"],["skincare","upkeep"],["chore","upkeep"],
    ["scroll","drift"],["doomscroll","drift"],["instagram","drift"],["tiktok","drift"],["porn","drift"],["weed","drift"],["cigarette","drift"],["smok","drift"],["vape","drift"],["alcohol","drift"],["sugar","drift"],["junk","drift"],["shopping","drift"],["gambl","drift"],["procrastinat","drift"],["vibe","drift"],["zone out","drift"],["mindless","drift"]
  ];
  function domainOf(it) {
    if (!it) return "focus";
    if (it.domain && DOM[it.domain]) return it.domain;
    var t = (it.title || "").toLowerCase();
    for (var i = 0; i < DKW.length; i++) if (t.indexOf(DKW[i][0]) !== -1) return DKW[i][1];
    var ck = it.catK || TITLE2CAT[t] || (it.habitId ? HABIT2CAT[it.habitId] : null);
    if (ck && CAT2DOM[ck]) return CAT2DOM[ck];
    return "focus";
  }
  function domColor(it) { return DOM[domainOf(it)].c; }
  var GOLD = "#ffd54a", CORAL = "#c4607f"; // GOLD = on-plan match (inset ring) · drift = mauve (honest, never hidden)
  function esc(s) { return (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function mixHex(a, b, t) { a = a.replace("#", ""); b = b.replace("#", ""); function p(h, i) { return parseInt(h.substr(i, 2), 16); } function m(i) { return Math.round(p(a, i) * (1 - t) + p(b, i) * t); } return "rgb(" + m(0) + "," + m(2) + "," + m(4) + ")"; }
  function mixDark(hex) { return mixHex(hex, "#160510", 0.82); } // very dark domain tint — ghost (missed) fill
  // activity title → Tabler icon (1:1 with the mockups); falls back to the domain's icon
  var TIMAP = [
    ["shower","ti-bath"],["bath","ti-bath"],["wash","ti-droplet"],["skincare","ti-droplet"],["bed","ti-bed"],["sleep","ti-bed"],["nap","ti-bed"],["wind down","ti-moon"],
    ["breakfast","ti-coffee"],["lunch","ti-coffee"],["dinner","ti-tools-kitchen-2"],["cook","ti-tools-kitchen-2"],["meal","ti-tools-kitchen-2"],["coffee","ti-coffee"],["snack","ti-cookie"],["hydrate","ti-droplet"],["water","ti-droplet"],["grocer","ti-shopping-cart"],["eat","ti-bowl-spoon"],
    ["run","ti-run"],["gym","ti-barbell"],["walk","ti-walk"],["yoga","ti-yoga"],["stretch","ti-stretching"],["cycle","ti-bike"],["bike","ti-bike"],["swim","ti-swimming"],["hike","ti-mountain"],["sport","ti-ball-football"],["danc","ti-dance"],
    ["deep work","ti-brain"],["program","ti-code"],["code","ti-code"],["study","ti-book"],["research","ti-microscope"],["email","ti-mail"],["meeting","ti-users"],["call","ti-phone"],["admin","ti-clipboard"],["plan","ti-clipboard"],["budget","ti-coin"],["invoice","ti-file-invoice"],["work","ti-briefcase"],
    ["paint","ti-palette"],["draw","ti-pencil"],["sketch","ti-pencil"],["write","ti-pencil"],["design","ti-palette"],["music","ti-music"],["guitar","ti-guitar-pick"],["piano","ti-piano"],["sing","ti-microphone-2"],["youtube","ti-brand-youtube"],["video","ti-video"],["photo","ti-camera"],["content","ti-device-mobile"],["midjourney","ti-sparkles"],
    ["family","ti-users"],["friend","ti-users"],["partner","ti-heart"],["date","ti-heart"],["hug","ti-heart"],["help","ti-heart-handshake"],["text","ti-message"],["network","ti-users-group"],["people","ti-users"],
    ["game","ti-device-gamepad-2"],["movie","ti-movie"],["watch","ti-device-tv"],["puzzle","ti-puzzle"],["chess","ti-chess"],["podcast","ti-headphones"],["listen","ti-headphones"],["travel","ti-plane"],["explore","ti-map"],["read","ti-book"],
    ["meditat","ti-moon"],["breath","ti-wind"],["journal","ti-notebook"],["pray","ti-pray"],["nature","ti-tree"],["gratitude","ti-heart"],["reflect","ti-moon"],["therapy","ti-armchair"],["sauna","ti-flame"],["rest","ti-moon"],
    ["clean","ti-broom"],["tidy","ti-broom"],["laundry","ti-wash-machine"],["dish","ti-bowl"],["brush","ti-dental"],["teeth","ti-dental"],["groom","ti-razor"],["errand","ti-shopping-bag"],["doctor","ti-stethoscope"],["chore","ti-broom"],
    ["scroll","ti-windmill"],["vibe","ti-windmill"],["instagram","ti-brand-instagram"],["tiktok","ti-brand-tiktok"],["weed","ti-plant"],["cigarette","ti-cigarette"],["smok","ti-cigarette"],["alcohol","ti-bottle"],["procrastinat","ti-windmill"],["break","ti-coffee"]
  ];
  function tiClass(item) { var t = (item && item.title || "").toLowerCase(); for (var i = 0; i < TIMAP.length; i++) if (t.indexOf(TIMAP[i][0]) !== -1) return TIMAP[i][1]; return DOM[domainOf(item)].ti; }
  function tiIcon(item) { return '<i class="ti ' + tiClass(item) + '"></i>'; }
  // ---- STREAK + escalating on-plan CELEBRATION (mockups 024/032) ----
  function comboTier(s) { return s >= 6 ? 4 : s >= 4 ? 3 : s >= 2 ? 2 : 1; }
  function streakColor(s) { return mixHex("#ffe14a", "#ff2a12", Math.min(1, s / 8)); } // yellow→red as it heats
  function streakTier(n) { // yellow → red → EPIC → SUPER EPIC → LEGENDARY (David's image 2)
    if (n >= 20) return { grad: "linear-gradient(90deg,#ff5f9e,#ffd24a,#46e2a4,#4ab6f0,#b07aff)", glow: "0 0 16px rgba(180,122,255,.75)", name: "LEGENDARY", txt: "#ffe07a", cls: "legendary" };
    if (n >= 12) return { grad: "linear-gradient(90deg,#a23aff,#6a1ad0)", glow: "0 0 15px rgba(150,60,255,.7)", name: "SUPER EPIC", txt: "#c79bff", cls: "superepic" };
    if (n >= 8) return { grad: "linear-gradient(90deg,#ff2a5a,#c01030)", glow: "0 0 14px rgba(255,42,74,.7)", name: "EPIC", txt: "#ff6f8f", cls: "epic" };
    if (n >= 6) return { grad: "linear-gradient(90deg,#ff7a2a,#ff3a18)", glow: "0 0 10px rgba(255,80,30,.5)", name: "", txt: "#ff8a4a", cls: "" };
    if (n >= 4) return { grad: "linear-gradient(90deg,#ffd23a,#ff9a2a)", glow: "0 0 8px rgba(255,150,40,.45)", name: "", txt: "#ffb84a", cls: "" };
    return { grad: "linear-gradient(90deg,#ffe14a,#ffd23a)", glow: "0 0 7px rgba(255,210,60,.4)", name: "", txt: "#ffe14a", cls: "" };
  }
  function curStreak() { if (!S || !S.game) return 0; if (S.game.streakDay && S.game.streakDay !== todayK()) return 0; return S.game.streak || 0; }
  function bumpStreak() { S.game = S.game || { spark: 0, total: 0, ups: {} }; if (S.game.streakDay !== todayK()) S.game.streak = 0; S.game.streak = (S.game.streak || 0) + 1; S.game.streakDay = todayK(); save(); return S.game.streak; }
  function coolStreak() { if (S && S.game && S.game.streak) { S.game.streak = Math.max(0, S.game.streak - 1); save(); } }
  function celebrate(color, streak) {
    var tier = comboTier(streak), pts = [10, 25, 60, 150][tier - 1];
    try { earn(pts, {}); } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(tier >= 3 ? [12, 30, 18, 30, 24] : [10, 24, 14]); } catch (e) {} // tactile celebration beat (David 2026-06-24 night)
    var ov = add(document.body, "div", "cele-ov");
    var box = add(ov, "div", "cele-box" + (tier >= 4 ? " fire" : "")); box.style.background = color || "#36b3f0";
    box.style.boxShadow = "0 0 0 " + (2 + tier) + "px " + (tier >= 3 ? "#ff7a1a" : "#ffd54a") + ",0 0 " + (10 + tier * 6) + "px " + (tier >= 3 ? "#ff5a1a" : "#ffd54a");
    box.innerHTML = '<i class="ti ti-circle-check"></i>';
    var n = 3 + tier * 2;
    for (var i = 0; i < n; i++) { var ang = (i / n) * 6.28 + (i % 2), dist = 70 + (i % 3) * 30; var st = add(ov, "i", "cele-star ti " + (tier >= 3 && i % 2 ? "ti-flame" : "ti-star")); st.style.setProperty("--dx", (Math.cos(ang) * dist) + "px"); st.style.setProperty("--dy", (Math.sin(ang) * dist) + "px"); st.style.color = tier >= 3 ? (i % 2 ? "#ff7a1a" : "#ffd54a") : "#ffd54a"; st.style.animationDelay = (i * 0.03) + "s"; }
    add(ov, "div", "cele-pts", "+" + pts);
    add(ov, "div", "cele-combo", tier >= 4 ? "ON FIRE · x" + streak : tier >= 3 ? "🔥 streak x" + streak : tier >= 2 ? "combo x" + streak : "on plan!");
    setTimeout(function () { ov.classList.add("out"); setTimeout(function () { ov.remove(); }, 300); }, 1500);
  }
  function planActiveNow(dom) { var bl = blocks(todayK()), n = logicalNowMin(); for (var i = 0; i < bl.length; i++) { var s = hm(bl[i].time), e = s + (bl[i].mins || 30); if (n >= s - 20 && n < e + 20 && domainOf(bl[i]) === dom && !bl[i].done) return bl[i]; } return null; }
  function onPlanBlockFor(t, dk) { var dom = domainOf(t); if (dom === "drift") return null; var d0 = new Date(t.start), s = d0.getHours() * 60 + d0.getMinutes(), e = s + Math.max(1, Math.round((Date.now() - t.start) / 60000)); var bl = blocks(dk); for (var i = 0; i < bl.length; i++) { var bs = hm(bl[i].time), be = bs + (bl[i].mins || 30); if (bs < e && be > s && domainOf(bl[i]) === dom && !bl[i].done) return bl[i]; } return null; } // the plan block this finished activity fulfilled (David 2026-06-24 night: reward DOING what you planned)
  function maybeCelebrateTrack(t) { var dom = domainOf(t); if (dom === "drift") { coolStreak(); return; } if (planActiveNow(dom)) celebrate(DOM[dom].c, bumpStreak()); }
  // ---- PLANNING suggestion engine (mockups 037/039/040): reasoned hero + alts, each with a WHY; never a blank day ----
  var SUG_POOL = {
    morning: [["Breakfast", "nourish", "fuel up for the day"], ["Shower", "upkeep", "start fresh"], ["Deep work", "focus", "your peak focus window"], ["Walk", "move", "get the body moving"], ["Meditate", "restore", "center before you start"]],
    afternoon: [["Lunch", "nourish", "it's around noon"], ["Deep work", "focus", "afternoon focus block"], ["Walk", "move", "you've sat a while"], ["Draw", "create", "✦ toward your Artist goal"], ["Errands", "upkeep", "knock out the small stuff"]],
    evening: [["Dinner", "nourish", "wind toward evening"], ["Walk", "move", "an evening stroll"], ["Connect", "connect", "reach out to someone"], ["Read", "play", "unwind a little"], ["Tidy", "upkeep", "reset your space"]],
    night: [["Wind down", "restore", "ease toward sleep"], ["Journal", "restore", "reflect on today"], ["Read", "play", "calm the mind"], ["Sleep", "restore", "rest is heroic too"]]
  };
  function sugNext(k) {
    var have = {}; blocks(k).forEach(function (b) { have[(b.title || "").toLowerCase()] = 1; });
    var out = [];
    // §16/mockup 010: today pulls from your ACTIVE goals — surface each active goal's next undone step
    if (k === todayK()) { activeGoals().forEach(function (g) { var st = (g.subtasks || []).filter(function (s) { return !s.done; })[0]; if (st && !have[st.title.toLowerCase()]) out.push({ title: st.title, domain: g.domain || "focus", why: "from your " + g.title + " goal", mins: 30 }); }); }
    if (k === todayK()) { var od = mostOverdueChore(); if (od && !have[od.l.toLowerCase()]) { var f = choreFresh(od); out.push({ title: od.l, domain: "upkeep", why: "your space needs it · " + (f.days >= 999 ? "never done" : f.days + "d"), mins: 15 }); } }
    (SUG_POOL[phase()] || SUG_POOL.afternoon).forEach(function (c) { if (!have[c[0].toLowerCase()]) out.push({ title: c[0], domain: c[1], why: c[2], mins: c[1] === "focus" ? 90 : 30 }); });
    return out.slice(0, 4);
  }
  function nextFreeTime(k) {
    var bl = blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var t = (k === todayK()) ? Math.max(logicalNowMin(), DAYSTART) : 8 * 60;
    bl.forEach(function (b) { var s = hm(b.time), e = s + (b.mins || 30); if (t < e && t + 30 > s) t = e; });
    t = Math.min(1410, Math.round(t / 15) * 15); return pad(Math.floor(t / 60)) + ":" + pad(t % 60);
  }
  function addSuggested(k, s) { var dom = s.domain || "focus"; blocks(k).push({ id: uid(), time: nextFreeTime(k), mins: s.mins || 30, title: s.title, prio: 2, color: DOM[dom].c, catK: s.catK || null, domain: dom, done: false }); reflow(k); save(); renderToday(); }
  function renderSuggest(k) {
    var SB = el("suggestBar"); if (!SB) return; SB.innerHTML = "";
    if (k !== todayK() && k !== tomK()) { SB.style.display = "none"; return; } SB.style.display = "";
    var sug = sugNext(k); if (!sug.length) return;
    try {
      add(SB, "div", "sughead", "suggested next ▸");
      var row = add(SB, "div", "sugrow");
      sug.forEach(function (s, i) { var D = DOM[s.domain] || DOM.focus, c = add(row, "div", "sugchip" + (i === 0 ? " hero" : "")); c.style.background = D.c; c.style.color = D.ink; if (i === 0) c.style.boxShadow = "0 0 13px " + D.c; c.innerHTML = '<i class="ti ' + tiClass({ title: s.title, domain: s.domain }) + '"></i> ' + esc(s.title) + ' · ' + dur(s.mins) + '<div class="sugwhy">' + esc(s.why) + '</div>'; c.onclick = function () { addSuggested(k, s); }; });
      var door = add(SB, "button", "sugdoor"); door.innerHTML = '<i class="ti ti-layout-grid"></i> all my activities';
      door.onclick = function () { bentoPicker({ title: "Plan what?", onPick: function (x) { addSuggested(k, { title: x.title, domain: x.domain || domainOf(x), mins: 30, catK: x.catK }); } }); };
    } catch (err) { console.error("SUGERR", err && err.message, JSON.stringify(sug)); }
  }
  // ---- HOME: top live-tracker strip + pull-down plan|real (mockups 005/006/007, §13) ----
  function pullElapsed(t) { var m = Math.max(0, Math.floor((Date.now() - t.start) / 60000)); return Math.floor(m / 60) + ":" + pad(m % 60); }
  function liveSpan(t) { return '<span class="live-elapsed" data-tid="' + t.id + '">' + elapsedStr(t) + '</span>'; } // ticks every second via the 1s loop (elapsedStr = m:ss)
  function activeTimers() { return (S.timers || []).filter(function (t) { return (t.dayK || key(new Date(t.start))) === todayK(); }); }
  // SWITCH task = stop the current one (logs it) then start the new one — single current activity (David: switching is a real function)
  function startOrSwitch() { var run = activeTimers(); bentoPicker({ title: run.length ? "Switch to?" : "What are you doing?", multi: true, onPickMulti: function (sel) { run.forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimerMulti(t, sel); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); }, onPick: function (x) { run.forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, x); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); } }); }
  // ALWAYS OFFER NEXT (§23/§15): the earliest still-open planned block (upcoming or in-progress, not done/missed) — getting "back on plan" is one tap
  function nextPlannedBlock(k) { var best = null; blocks(k).forEach(function (b) { if (!b.title || blockStatus(k, b) !== "plan") return; if (best === null || hm(b.time) < hm(best.time)) best = b; }); return best; } // skip empty (unchosen) placeholder bubbles
  function startPlanned(b) { activeTimers().forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, { title: b.title, color: b.color, catK: b.catK }); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); } // 1-tap on-plan: matches the block's domain → gold + streak
  // PLAN A BREAK (§23): consciously declare what you're about to do — pick ANY activity + a duration → it inserts as a PINNED block at NOW, the plan reflows around it, and tracking starts. Conscious = streak-safe (the key distinction is planned-vs-drift, not work-vs-leisure).
  function planBreak() { bentoPicker({ title: "Replan from now — what, for how long?", onPick: function (x) { durationSheet(x.title, function (mins) { var k = todayK(), now = logicalNowMin(), dom = domainOf(x);
        // REPLAN (David 2026-06-25): the new plan owns NOW → the future. Any block the present line is currently splitting gets its future half ERASED (truncated to end at now → it stays as the past ghost half).
        blocks(k).forEach(function (b) { if (b.done) return; var bs = hm(b.time), be = bs + (b.mins || 30); if (bs < now && be > now) b.mins = Math.max(5, now - bs); });
        var nb = { id: uid(), time: pad(Math.floor(now / 60)) + ":" + pad(now % 60), mins: mins, title: x.title, prio: 2, color: x.color || DOM[dom].c, catK: x.catK || null, domain: dom, done: false, pin: true };
        blocks(k).push(nb); reflow(k); save(); // pinned at now → reflow pushes the following (movable) blocks down to make room (shorten-by-priority comes with the non-negotiable system)
        activeTimers().forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, { title: x.title, color: nb.color, catK: x.catK }); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); }); } }); }
  // ENHANCE PLAN — fill in the day-to-day fundamentals you haven't planned/done yet (David 2026-06-24)
  var FUNDAMENTALS = [{ t: "Shower", d: "upkeep", m: 15, slot: 420 }, { t: "Breakfast", d: "nourish", m: 25, slot: 480 }, { t: "Meditate", d: "restore", m: 15, slot: 510 }, { t: "Lunch", d: "nourish", m: 40, slot: 750 }, { t: "Walk", d: "move", m: 20, slot: 900 }, { t: "Tidy", d: "upkeep", m: 15, slot: 1020 }, { t: "Dinner", d: "nourish", m: 45, slot: 1110 }];
  function getFund() { return (S.profile && S.profile.fundamentals && S.profile.fundamentals.length) ? S.profile.fundamentals : FUNDAMENTALS; } // user-customised set, else the default
  function enhancePlan(k) {
    k = k || todayK();
    var have = {}; blocks(k).forEach(function (b) { have[(b.title || "").toLowerCase()] = 1; }); logs(k).forEach(function (e) { have[(e.title || "").toLowerCase()] = 1; });
    var added = [], now = (k === todayK()) ? logicalNowMin() : 0;
    getFund().forEach(function (f) {
      if (have[f.t.toLowerCase()]) return;
      var t0 = Math.max(f.slot, now + 5); if (t0 + f.m > 1430) t0 = f.slot;
      blocks(k).push({ id: uid(), time: pad(Math.floor(t0 / 60)) + ":" + pad(t0 % 60), mins: f.m, title: f.t, prio: 1, color: DOM[f.d].c, domain: f.d, done: false });
      added.push(f.t);
    });
    reflow(k); save(); renderToday(); if (el("pullSheet") && el("pullSheet").classList.contains("on")) buildPull();
    toast(added.length ? '✨ added ' + added.length + ' fundamental' + (added.length > 1 ? 's' : '') + ': ' + added.join(", ") : "✓ fundamentals already covered");
  }
  function durationSheet(label, cb) { var ov = add(document.body, "div", "dur-ov"); var card = add(ov, "div", "dur-card"); var q = add(card, "div", "dur-q"); q.innerHTML = '<i class="ti ti-clock"></i> ' + esc(label) + ' — how long?'; var row = add(card, "div", "dur-row"); [15, 30, 45, 60, 90, 120].forEach(function (m) { var c = add(row, "button", "dur-chip", m < 60 ? m + "m" : (m % 60 ? (m / 60).toFixed(1) : (m / 60)) + "h"); c.onclick = function () { ov.remove(); cb(m); }; }); var x = add(card, "button", "dur-x", "cancel"); x.onclick = function () { ov.remove(); }; ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); }); }
  // ---- GOALS pillar (§16, mockups 009/010): capture → decompose (guided, manual = free) → schedule steps down into the day-calendar; active goals pull into planning ----
  // §19 Tier-1 (always-on, $0): first-principles decomposition TEMPLATES — the free floor that turns any goal into steps WITHOUT a key. The brain (Tier-2/paid) tailors these later.
  var DECOMP_TEMPLATES = [
    { kw: ["learn", "skill", "piano", "guitar", "language", "study", "course", "draw", "paint", "practice"], steps: ["Pick the tiniest 2-min daily rep", "Choose ONE resource to follow", "Block one real session this week", "Do the tiny rep daily", "Review what stuck — monthly"] },
    { kw: ["fit", "gym", "run", "lean", "weight", "strong", "health", "exercise", "move", "yoga"], steps: ["Pick a movement you enjoy", "Schedule 3 short sessions this week", "Set a 5-min daily move (never zero)", "Prep the night before", "Check energy weekly"] },
    { kw: ["portfolio", "finish", "ship", "launch", "project", "build", "website", "reel", "app", "write", "book"], steps: ["List exactly what's left", "Pick the next concrete piece", "Block weekly deep-work", "Set a finish line (done > perfect)", "Share / send it out"] },
    { kw: ["save", "money", "budget", "spend", "debt", "finance"], steps: ["Set a monthly spending cap", "List your fixed costs", "Pick ONE thing to cut", "5-min weekly money check", "Move a little to savings monthly"] },
    { kw: ["business", "linkedin", "audience", "grow", "brand", "client", "sell", "post", "youtube", "channel"], steps: ["Define the one offer / message", "Pick a daily posting slot", "Batch a week of content at once", "Engage 10 min/day", "Review reach monthly"] },
    { kw: ["calm", "peace", "stress", "anxiet", "sleep", "rest", "meditat", "mindful"], steps: ["Pick a tiny daily reset (2-min breath)", "Set a wind-down cue at night", "Protect a no-screen hour", "Notice one trigger this week", "Reflect weekly — what helped"] },
    { kw: ["love", "relationship", "friend", "date", "connect", "family"], steps: ["Name who to invest in", "Schedule one real hangout this week", "Set a tiny daily reach-out", "Be present — phone away", "Reflect — who energizes you"] }
  ];
  function decomposeGoal(g) { var t = (g.title || "").toLowerCase(); for (var i = 0; i < DECOMP_TEMPLATES.length; i++) { if (DECOMP_TEMPLATES[i].kw.some(function (k) { return t.indexOf(k) !== -1; })) return DECOMP_TEMPLATES[i].steps.slice(); } return ["Define what “done” looks like", "Pick the next concrete step", "Schedule it into this week", "Set a finish line", "Review progress monthly"]; }
  function activeGoals() { return (S.goals || []).filter(function (g) { return g.active; }); }
  function ensureGoalDefaults() { if (!S.goals || !S.goals.length) return; if (!S.goals.some(function (g) { return ("active" in g); })) { S.goals.forEach(function (g, i) { g.active = i < 3; }); save(); } } // first run: top few active (Newport cap, §17)
  function typeAdd(parent, ph, cb) { var w = add(parent, "div", "goal-add"); var inp = document.createElement("input"); inp.type = "text"; inp.placeholder = ph; inp.className = "goal-input"; w.appendChild(inp); var b = add(w, "button", "goal-addb"); b.innerHTML = '<i class="ti ti-plus"></i>'; function go() { var v = inp.value.trim(); if (v) { cb(v); inp.value = ""; } } b.onclick = go; inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } }); }
  function pickSheet(q, opts, cb) { var ov = add(document.body, "div", "dur-ov"); var card = add(ov, "div", "dur-card"); var qq = add(card, "div", "dur-q"); qq.innerHTML = q; var row = add(card, "div", "dur-row"); opts.forEach(function (o) { var c = add(row, "button", "dur-chip", o.label); c.onclick = function () { ov.remove(); cb(o.val); }; }); var x = add(card, "button", "dur-x", "cancel"); x.onclick = function () { ov.remove(); }; ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); }); }
  function scheduleSubtask(g, st) { pickSheet('<i class="ti ti-calendar-plus"></i> Schedule “' + esc(st.title) + '” — when?', [{ label: "Today", val: 0 }, { label: "Tomorrow", val: 1 }, { label: "In 3 days", val: 3 }], function (off) { var d = new Date(); d.setDate(d.getDate() + off); var k = key(d), dom = g.domain || "focus"; blocks(k).push({ id: uid(), time: nextFreeTime(k), mins: 30, title: st.title, prio: 2, color: DOM[dom].c, catK: null, domain: dom, done: false, goalId: g.title }); reflow(k); st.schedK = k; save(); renderToday(); toast('📅 scheduled — ' + (off === 0 ? "today" : off === 1 ? "tomorrow" : "in 3 days") + ' · on your calendar'); }); }
  function goalsSheet() {
    ensureGoalDefaults();
    var ov = add(document.body, "div", "goal-ov"); var card = add(ov, "div", "goal-card"); var view = null;
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    function header(title, withBack) { var head = add(card, "div", "goal-head"); if (withBack) { var bk = add(head, "button", "goal-back"); bk.innerHTML = '<i class="ti ti-chevron-left"></i>'; bk.onclick = function () { view = null; draw(); }; } var h = add(head, "div", "goal-q"); h.innerHTML = title; var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); }; return head; }
    function draw() { card.innerHTML = ""; if (!view) drawMap(); else drawGoal(view); }
    function drawMap() {
      var head = header('<i class="ti ti-target"></i> Your goals', false);
      var chip = document.createElement("span"); chip.className = "goal-audit"; chip.innerHTML = '<i class="ti ti-chart-line"></i> ' + activeGoals().length + ' active'; head.insertBefore(chip, head.lastChild);
      var body = add(card, "div", "goal-body");
      if (!(S.goals && S.goals.length)) add(body, "div", "goal-empty", "No goals yet — add what you're working toward.");
      var grid = add(body, "div", "goal-grid");
      (S.goals || []).forEach(function (g) {
        var dom = DOM[g.domain || "focus"], gc = add(grid, "div", "goal-cardx" + (g.active ? " on" : ""));
        var dl = add(gc, "div", "goal-dom"); dl.style.color = dom.c; dl.innerHTML = '<i class="ti ' + dom.ti + '"></i> ' + dom.l;
        var tt = add(gc, "div", "goal-title"); if (g.active) { tt.style.background = dom.c; tt.style.color = dom.ink; tt.style.borderColor = "#160510"; } tt.innerHTML = (g.active ? '<i class="ti ti-player-play-filled"></i> ' : '') + tiIcon(g) + ' ' + esc(g.title);
        var subs = g.subtasks || [];
        if (subs.length) { var tg = add(gc, "div", "goal-tags"); subs.slice(0, 6).forEach(function (st) { var s = add(tg, "span", "goal-tag" + (st.done ? " done" : "")); s.textContent = (st.done ? "✓ " : "") + st.title; }); }
        else add(gc, "div", "goal-tagnone", "tap to break it down →");
        gc.onclick = function () { view = g; draw(); };
      });
      typeAdd(body, "a goal you're working toward…", function (v) { (S.goals = S.goals || []).push({ title: v, domain: domainOf({ title: v }), subtasks: [], active: activeGoals().length < 3 }); save(); draw(); });
      add(body, "div", "goal-foot", "few active · do fewer, finish more — Slow Productivity");
    }
    function drawGoal(g) {
      var dom = DOM[g.domain || "focus"];
      header('<i class="ti ' + dom.ti + '"></i> ' + esc(g.title), true);
      var body = add(card, "div", "goal-body");
      var ab = add(body, "button", "goal-active-btn" + (g.active ? " on" : "")); ab.innerHTML = g.active ? '<i class="ti ti-star-filled"></i> Active — pulls into your days' : '<i class="ti ti-star"></i> On hold — tap to activate'; ab.onclick = function () { g.active = !g.active; save(); draw(); renderSuggest(todayK()); };
      var hint = add(body, "div", "goal-hint"); hint.innerHTML = '<i class="ti ti-subtask"></i> break it into steps → schedule them into your days';
      var bd = add(body, "button", "goal-breakdown"); bd.innerHTML = '<i class="ti ti-wand"></i> Break it down for me'; bd.onclick = function () { var have = {}; (g.subtasks || []).forEach(function (s) { have[s.title.toLowerCase()] = 1; }); decomposeGoal(g).forEach(function (st) { if (!have[st.toLowerCase()]) (g.subtasks = g.subtasks || []).push({ title: st, done: false }); }); save(); draw(); };
      add(body, "div", "goal-tier", "free: first-principles starter · 🧠 brain tailors it to you");
      var sl = add(body, "div", "goal-steps");
      (g.subtasks || []).forEach(function (st, i) {
        var row = add(sl, "div", "goal-step" + (st.done ? " done" : ""));
        var ck = add(row, "button", "gs-check"); ck.innerHTML = st.done ? '<i class="ti ti-circle-check-filled"></i>' : '<i class="ti ti-circle"></i>'; ck.onclick = function () { st.done = !st.done; save(); draw(); };
        add(row, "div", "gs-title", st.title);
        if (st.schedK) { var sd = add(row, "span", "gs-on"); sd.innerHTML = '<i class="ti ti-calendar-check"></i>'; }
        var sc = add(row, "button", "gs-sched"); sc.innerHTML = '<i class="ti ti-calendar-plus"></i>'; sc.onclick = function () { scheduleSubtask(g, st); };
        var dd = add(row, "button", "gs-del"); dd.innerHTML = '<i class="ti ti-x"></i>'; dd.onclick = function () { g.subtasks.splice(i, 1); save(); draw(); };
      });
      typeAdd(body, "add a step or milestone…", function (v) { (g.subtasks = g.subtasks || []).push({ title: v, done: false }); save(); draw(); });
      var dg = add(body, "button", "goal-delete", "✕ delete this goal"); dg.onclick = function () { var i = S.goals.indexOf(g); if (i >= 0) S.goals.splice(i, 1); save(); view = null; draw(); };
    }
    draw();
  }
  // ---- IDENTITY MINDMAP (§21, mockups 017/018): "see your life" — domains as planets sized by where your days actually go; vices shown honestly ----
  function lifeInvest() { var inv = {}; DOM_ORDER.forEach(function (d) { inv[d] = 0; }); lastDays(30).forEach(function (k) { logs(k).forEach(function (e) { var d = domainOf(e); if (inv[d] != null) inv[d] += (e.mins || 0); }); blocks(k).forEach(function (b) { if (b.done) { var d2 = domainOf(b); if (inv[d2] != null) inv[d2] += (b.mins || 0) * 0.5; } }); }); return inv; }
  function mindmapSheet() {
    var ov = add(document.body, "div", "mind-ov"); var card = add(ov, "div", "mind-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-affiliate"></i> Your life'; var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
    var body = add(card, "div", "mind-body");
    add(body, "div", "mind-sub", "who you're being — where your days actually go (30d)");
    var stage = add(body, "div", "mind-stage");
    var inv = lifeInvest(), maxInv = 0; DOM_ORDER.forEach(function (d) { maxInv = Math.max(maxInv, inv[d]); });
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("class", "mind-lines"); svg.setAttribute("preserveAspectRatio", "none"); stage.appendChild(svg);
    var n = DOM_ORDER.length;
    DOM_ORDER.forEach(function (d, i) {
      var D = DOM[d], a = (-90 + i * (360 / n)) * Math.PI / 180, R = 34, x2 = 50 + R * Math.cos(a), y2 = 50 + R * Math.sin(a);
      var ln = document.createElementNS("http://www.w3.org/2000/svg", "line"); ln.setAttribute("x1", "50"); ln.setAttribute("y1", "50"); ln.setAttribute("x2", x2); ln.setAttribute("y2", y2); ln.setAttribute("stroke", d === "drift" ? "#5a3850" : "#160510"); ln.setAttribute("stroke-width", "1.1"); if (d === "drift") ln.setAttribute("stroke-dasharray", "2 2"); svg.appendChild(ln);
      var sz = 44 + (maxInv ? (inv[d] / maxInv) : 0) * 34;
      var node = add(stage, "div", "mind-node" + (d === "drift" ? " drift" : "")); node.style.left = x2 + "%"; node.style.top = y2 + "%"; node.style.width = sz + "px"; node.style.height = sz + "px"; node.style.background = d === "drift" ? mixDark(D.c) : "radial-gradient(circle at 35% 30%," + D.light + "," + D.c + ")"; node.style.color = D.ink; node.style.fontSize = Math.round(sz * 0.42) + "px";
      node.innerHTML = '<i class="ti ' + D.ti + '"></i>'; add(node, "span", "mind-lab", D.l);
      node.onclick = function () { ov.remove(); bentoPicker({ title: D.l + " — what?", multi: true, onPickMulti: function (sel) { var tt = startTrackerNow(); assignTimerMulti(tt, sel); maybeCelebrateTrack(tt); renderLiveTracker(); renderToday(); }, onPick: function (xx) { var tt = startTrackerNow(); assignTimer(tt, xx); maybeCelebrateTrack(tt); renderLiveTracker(); renderToday(); } }); };
    });
    var you = add(stage, "div", "mind-you"); you.innerHTML = '<i class="ti ti-mood-smile"></i>';
    add(body, "div", "goal-foot", "bigger = more of your life · tap a planet to do something there");
  }
  // ---- MASTERPIECE DAYS / presets (David 2026-06-24): cookie-cutter day plans — apply to today/tomorrow, save your own, name them ----
  var DAY_PRESETS = [
    { name: "Full Day", blocks: [{ h: "08:00", m: 30, t: "Breakfast", d: "nourish" }, { h: "08:45", m: 40, t: "Laundry", d: "upkeep" }, { h: "09:30", m: 75, t: "Outdoor gym", d: "move" }, { h: "11:00", m: 30, t: "Swim", d: "move" }, { h: "11:45", m: 20, t: "Meditate", d: "restore" }, { h: "12:30", m: 45, t: "Lunch", d: "nourish" }, { h: "13:30", m: 150, t: "Claude code", d: "focus" }, { h: "16:00", m: 90, t: "Cafe", d: "connect" }, { h: "17:45", m: 20, t: "Call", d: "connect" }, { h: "18:30", m: 60, t: "Dinner", d: "nourish" }, { h: "20:00", m: 75, t: "TV", d: "play" }, { h: "21:30", m: 30, t: "Wind down", d: "restore" }] },
    { name: "Deep Work Day", blocks: [{ h: "07:00", m: 45, t: "Morning routine", d: "upkeep" }, { h: "08:00", m: 120, t: "Deep work", d: "focus" }, { h: "10:00", m: 20, t: "Break", d: "restore" }, { h: "10:30", m: 120, t: "Deep work", d: "focus" }, { h: "12:30", m: 45, t: "Lunch", d: "nourish" }, { h: "13:30", m: 90, t: "Deep work", d: "focus" }, { h: "15:00", m: 30, t: "Walk", d: "move" }, { h: "15:45", m: 90, t: "Admin / shallow", d: "focus" }, { h: "18:00", m: 45, t: "Dinner", d: "nourish" }, { h: "19:00", m: 60, t: "Read", d: "play" }, { h: "21:30", m: 30, t: "Wind down", d: "restore" }] },
    { name: "Balanced Day", blocks: [{ h: "07:00", m: 40, t: "Gym", d: "move" }, { h: "08:00", m: 30, t: "Breakfast", d: "nourish" }, { h: "09:00", m: 120, t: "Deep work", d: "focus" }, { h: "11:30", m: 60, t: "Design", d: "create" }, { h: "12:30", m: 60, t: "Lunch", d: "nourish" }, { h: "14:00", m: 120, t: "Deep work", d: "focus" }, { h: "16:30", m: 45, t: "Call", d: "connect" }, { h: "18:00", m: 60, t: "Dinner", d: "nourish" }, { h: "19:30", m: 90, t: "Guitar", d: "play" }, { h: "21:30", m: 30, t: "Meditate", d: "restore" }] },
    { name: "Recovery Day", blocks: [{ h: "08:30", m: 45, t: "Slow morning", d: "restore" }, { h: "09:30", m: 45, t: "Yoga", d: "move" }, { h: "10:30", m: 60, t: "Go outside", d: "move" }, { h: "12:00", m: 60, t: "Lunch", d: "nourish" }, { h: "13:30", m: 90, t: "Nap", d: "restore" }, { h: "15:30", m: 60, t: "Read", d: "play" }, { h: "17:00", m: 60, t: "Friends", d: "connect" }, { h: "18:30", m: 60, t: "Dinner", d: "nourish" }, { h: "20:00", m: 75, t: "Wind down", d: "restore" }] }
  ];
  function applyDayPreset(k, arr) { S.blocks[k] = arr.map(function (x) { var d = x.d || x.domain || "focus"; return { id: uid(), time: x.h || x.time, mins: x.m || x.mins, title: x.t || x.title, prio: x.prio || 2, color: (DOM[d] && DOM[d].c) || x.color || "#8a5cf0", domain: d, done: false }; }); reflow(k); save(); }
  function saveDayAsPreset(k, name) { S.presets = S.presets || []; S.presets.push({ name: name, blocks: blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).map(function (b) { return { h: b.time, m: b.mins, t: b.title, d: domainOf(b) }; }) }); save(); }
  // HABIT STACKS (renamed from "masterpiece days", David 2026-06-24): tapping a stack opens it to view/edit; you apply it explicitly. Build custom stacks too.
  function stackDetail(stack, k, custom) {
    var ov = add(document.body, "div", "goal-ov"), card = add(ov, "div", "goal-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    function draw() {
      card.innerHTML = "";
      var head = add(card, "div", "goal-head");
      var back = add(head, "button", "goal-back"); back.innerHTML = '<i class="ti ti-chevron-left"></i>'; back.onclick = function () { ov.remove(); presetsSheet(k); };
      var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-stack-2"></i> ' + esc(stack.name);
      var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
      var body = add(card, "div", "goal-body");
      var hint = add(body, "div", "goal-hint"); hint.innerHTML = custom ? '<i class="ti ti-pencil"></i> add or remove activities, then apply it to any day' : '<i class="ti ti-eye"></i> a ready-made stack — look it over, then apply it (or save a copy to customize)';
      var steps = add(body, "div", "goal-steps"), arr = stack.blocks;
      arr.slice().sort(function (a, b) { return hm(a.h || a.time) - hm(b.h || b.time); }).forEach(function (bl) {
        var dom = bl.d || bl.domain || domainOf({ title: bl.t || bl.title }), D = DOM[dom] || DOM.focus;
        var row = add(steps, "div", "goal-step");
        var ic = add(row, "span", "gs-on"); ic.style.color = D.c; ic.innerHTML = '<i class="ti ' + tiClass({ title: bl.t || bl.title, domain: dom }) + '"></i>';
        var t = add(row, "span", "gs-title"); t.innerHTML = esc(bl.t || bl.title) + ' <span style="opacity:.55;font-weight:600">· ' + fmt(hm(bl.h || bl.time)) + ' · ' + dur(bl.m || bl.mins) + '</span>';
        if (custom) { var del = add(row, "button", "gs-del"); del.innerHTML = '<i class="ti ti-x"></i>'; del.onclick = function () { var i = arr.indexOf(bl); if (i >= 0) arr.splice(i, 1); save(); draw(); }; }
      });
      if (!arr.length) add(body, "div", "goal-empty", custom ? "empty stack — add your activities below" : "no activities");
      if (custom) { var addb = add(body, "button", "goal-breakdown"); addb.style.background = "#36b3f0"; addb.style.color = "#08283c"; addb.innerHTML = '<i class="ti ti-plus"></i> add activity'; addb.onclick = function () { bentoPicker({ title: "Add to " + stack.name, onPick: function (a) { var sorted = arr.slice().sort(function (x, y) { return hm(x.h) - hm(y.h); }), last = sorted[sorted.length - 1], st = last ? hm(last.h) + (last.m || 30) : 480; st = Math.min(1410, st); arr.push({ h: pad(Math.floor(st / 60)) + ":" + pad(st % 60), m: 30, t: a.title, d: a.domain }); save(); draw(); } }); }; }
      var ap = add(body, "button", "goal-breakdown"); ap.style.background = "#34d39a"; ap.style.color = "#0c3d29"; ap.style.marginTop = "12px"; ap.innerHTML = '<i class="ti ti-calendar-plus"></i> apply to ' + esc(relLabel(k).toLowerCase()); ap.disabled = !arr.length;
      ap.onclick = function () { if (!arr.length) return; applyDayPreset(k, arr); ov.remove(); if (el("pullSheet")) buildPull(); renderToday(); toast("✨ " + stack.name + " — " + relLabel(k).toLowerCase() + " planned"); };
      if (custom) {
        var ren = add(body, "button", "goal-delete"); ren.innerHTML = "rename this stack"; ren.onclick = function () { ren.style.display = "none"; typeAdd(body, "new name…", function (v) { stack.name = v; save(); draw(); }); };
        var dl = add(body, "button", "goal-delete"); dl.style.color = "#d0708a"; dl.innerHTML = "delete this stack"; dl.onclick = function () { var i = (S.presets || []).indexOf(stack); if (i >= 0) S.presets.splice(i, 1); save(); ov.remove(); presetsSheet(k); };
      } else { var cp = add(body, "button", "goal-delete"); cp.style.color = "#9fd0ee"; cp.innerHTML = "save a copy to customize"; cp.onclick = function () { S.presets = S.presets || []; var copy = { name: stack.name + " (mine)", blocks: arr.map(function (b) { return { h: b.h || b.time, m: b.m || b.mins, t: b.t || b.title, d: b.d || b.domain }; }) }; S.presets.push(copy); save(); ov.remove(); stackDetail(copy, k, true); }; }
    }
    draw();
  }
  function presetsSheet(k) {
    var ov = add(document.body, "div", "goal-ov"), card = add(ov, "div", "goal-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    function draw() {
      card.innerHTML = "";
      var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-stack-2"></i> Habit stacks'; var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
      var body = add(card, "div", "goal-body");
      var sub = add(body, "div", "goal-hint"); sub.innerHTML = '<i class="ti ti-stack-2"></i> a stack = a ready-made set of activities — tap one to look inside, edit, then apply to ' + relLabel(k).toLowerCase();
      var bld = add(body, "button", "goal-breakdown"); bld.style.background = "#b07aff"; bld.style.color = "#241548"; bld.style.marginBottom = "12px"; bld.innerHTML = '<i class="ti ti-plus"></i> build a custom stack'; bld.onclick = function () { S.presets = S.presets || []; var ns = { name: "My stack", blocks: [] }; S.presets.push(ns); save(); ov.remove(); stackDetail(ns, k, true); };
      var prevK = keyAdd(k, -1); // one-tap reuse: copy the previous day's plan
      if (blocks(prevK).length) { var cb = add(body, "button", "preset-row"); var cnm = add(cb, "span", "preset-name"); cnm.innerHTML = '<i class="ti ti-copy"></i> Copy ' + esc(relLabel(prevK)) + "'s plan"; add(cb, "span", "preset-meta", blocks(prevK).length + " blocks"); cb.onclick = function () { applyDayPreset(k, blocks(prevK).map(function (b) { return { h: b.time, m: b.mins, t: b.title, d: domainOf(b) }; })); ov.remove(); if (el("pullSheet")) buildPull(); renderToday(); toast("📋 copied " + relLabel(prevK).toLowerCase() + "'s plan"); }; }
      DAY_PRESETS.forEach(function (p) { var b = add(body, "button", "preset-row"); var nm = add(b, "span", "preset-name"); nm.innerHTML = '<i class="ti ti-stack-2"></i> ' + esc(p.name); add(b, "span", "preset-meta", p.blocks.length + " · view"); b.onclick = function () { ov.remove(); stackDetail(p, k, false); }; });
      (S.presets || []).forEach(function (p) { var b = add(body, "button", "preset-row mine"); var nm = add(b, "span", "preset-name"); nm.innerHTML = '<i class="ti ti-bookmark"></i> ' + esc(p.name); var del = add(b, "span", "preset-del"); del.innerHTML = '<i class="ti ti-x"></i>'; del.onclick = function (e) { e.stopPropagation(); var i = S.presets.indexOf(p); if (i >= 0) S.presets.splice(i, 1); save(); draw(); }; b.onclick = function (e) { if (e.target === del || del.contains(e.target)) return; ov.remove(); stackDetail(p, k, true); }; });
      if (blocks(k).length) { var sh = add(body, "div", "goal-hint"); sh.textContent = "save " + relLabel(k).toLowerCase() + "'s plan as a reusable stack:"; typeAdd(body, "name this stack…", function (v) { saveDayAsPreset(k, v); draw(); toast("💾 saved “" + v + "”"); }); }
    }
    draw();
  }
  // HABITS notebook page — manage your activity library anytime (recreates onboarding's stock-your-life) — David 2026-06-24
  function habitsSheet() {
    var ov = add(document.body, "div", "bento-ov"), card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head"); var hq = add(head, "div", "bento-q"); hq.innerHTML = '<i class="ti ti-checkup-list"></i> Your habits'; var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); };
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var body = add(card, "div", "bento-body"), adding = false;
    function draw() {
      body.innerHTML = "";
      add(body, "div", "sughead", "everything you can plan or track — remove your own with ✕, or add new");
      var by = bentoByDomain();
      DOM_ORDER.forEach(function (d) {
        var acts = by[d]; if (!acts || !acts.length) return; var D = DOM[d];
        var sh = add(body, "div", "habit-dh"); sh.style.color = D.light; sh.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + D.l;
        var row = add(body, "div", "habit-row");
        acts.forEach(function (a) {
          var custom = (S.acts || []).filter(function (c) { return (c.title || "").toLowerCase() === (a.title || "").toLowerCase(); })[0];
          var chip = add(row, "span", "bchip"); if (a.domain !== "drift") { chip.style.background = D.c; chip.style.color = D.ink; }
          chip.innerHTML = '<i class="ti ' + tiClass(a) + '"></i> ' + esc(a.title);
          if (custom) { var del = document.createElement("i"); del.className = "ti ti-x habit-del"; chip.appendChild(del); del.onclick = function (e) { e.stopPropagation(); S.acts = (S.acts || []).filter(function (c) { return c !== custom; }); save(); draw(); }; }
        });
      });
      if (!adding) { var ab = add(body, "div", "bento-add"); ab.innerHTML = '<i class="ti ti-plus"></i> add a habit / activity'; ab.onclick = function () { adding = true; draw(); }; }
      else {
        var frm = add(body, "div", "habit-addform");
        var inp = document.createElement("input"); inp.type = "text"; inp.className = "bento-input"; inp.placeholder = "name it (e.g. Climbing, Therapy)…"; frm.appendChild(inp);
        add(frm, "div", "bento-lbl", "category");
        var crow = add(frm, "div", "bento-cats"), chosen = { d: "focus" };
        DOM_ORDER.forEach(function (d) { var D = DOM[d], c = add(crow, "span", "bento-pick" + (d === chosen.d ? " on" : ""), D.l); c.style.background = D.c; c.style.color = D.ink; c.onclick = function () { chosen.d = d; Array.prototype.forEach.call(crow.children, function (n) { n.classList.remove("on"); }); c.classList.add("on"); }; });
        var go = add(frm, "button", "bento-save"); go.innerHTML = 'add <i class="ti ti-check"></i>'; go.onclick = function () { var nm = inp.value.trim(); if (!nm) { inp.focus(); return; } S.acts = S.acts || []; if (!(S.acts.some(function (c) { return c.title.toLowerCase() === nm.toLowerCase(); }) || TITLE2CAT[nm.toLowerCase()])) S.acts.push({ title: nm, catK: null, domain: chosen.d }); save(); adding = false; draw(); toast("added " + nm); };
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
      }
    }
    draw();
  }
  // ---- THE NOTEBOOK (David 2026-06-23): the single menu door (bottom-left, above the stick). Every menu roots from here, each X-able. No more top-drag / scattered taps. ----
  function notebookSheet() {
    var ov = add(document.body, "div", "nb-ov"); var card = add(ov, "div", "nb-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-notebook"></i> Notebook'; var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
    var body = add(card, "div", "nb-body");
    var run = activeTimers(), cur = run[run.length - 1];
    var items = [
      { ic: "ti-calendar", l: "Today", sub: "plan & track your day", c: "#36b3f0", fn: function () { ov.remove(); openPull(); } },
      { ic: "ti-player-play-filled", l: cur ? "Switch activity" : "Start tracking", sub: cur ? ("now: " + esc(cur.title || "tracking")) : "what are you doing?", c: "#ff5fa0", fn: function () { ov.remove(); startOrSwitch(); } },
      { ic: "ti-checkup-list", l: "Habits", sub: "add or remove your activities", c: "#ff8a3d", fn: function () { ov.remove(); habitsSheet(); } },
      { ic: "ti-stack-2", l: "Habit stacks", sub: "build & apply day presets", c: "#ff5fa0", fn: function () { ov.remove(); presetsSheet(todayK()); } },
      { ic: "ti-target", l: "Goals", sub: "break down & schedule", c: "#34d39a", fn: function () { ov.remove(); goalsSheet(); } },
      { ic: "ti-affiliate", l: "Your life", sub: "see who you're being", c: "#b07aff", fn: function () { ov.remove(); mindmapSheet(); } },
      { ic: "ti-brain", l: "Brain", sub: "free AI (optional)", c: "#7f9bc4", fn: function () { ov.remove(); brainSheet(); } },
      { ic: "ti-sun", l: "Wake & bedtime", sub: wakeBedSub(), c: "#ffb02e", fn: function () { ov.remove(); wakeBedSheet(); } },
      { ic: "ti-sparkles", l: "Redo setup", sub: "re-run onboarding", c: "#ffc83d", fn: function () { ov.remove(); onboard(); } }
    ];
    items.forEach(function (it) { var b = add(body, "button", "nb-item"); var ico = add(b, "span", "nb-ic"); ico.style.background = it.c; ico.innerHTML = '<i class="ti ' + it.ic + '"></i>'; var tx = add(b, "div", "nb-tx"); add(tx, "div", "nb-l", it.l); var s = add(tx, "div", "nb-sub"); s.innerHTML = it.sub; b.onclick = it.fn; });
  }
  // 1-tap wake/bed re-set — same ranges as onboarding step 6, but standalone; live-rebuilds the timeline window so you SEE the day reframe (David 2026-06-26)
  var WAKE_OPTS = ["before 6", "6–7", "7–8", "8–9", "9–10", "later", "varies"];
  var BED_OPTS = ["before 10", "10–11", "11–12", "12–1", "1–2", "later", "varies"];
  function fmtHour(h) { h = ((Math.round(h) % 24) + 24) % 24; var ap = h < 12 ? "am" : "pm"; var x = h % 12 || 12; return x + ap; } // 0–28 → "5am" / "1am"
  function wakeBedSub() { var P = S.profile || {}; if (!P.wake && !P.sleep) return "set your day's frame"; return "up " + (P.wake || "?") + " · bed " + (P.sleep || "?"); }
  function wakeBedSheet() {
    S.profile = S.profile || {}; var P = S.profile;
    var ov = add(document.body, "div", "nb-ov"); var card = add(ov, "div", "nb-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-sun"></i> Wake &amp; bedtime';
    var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
    var body = add(card, "div", "nb-body"); var wrap = add(body, "div", "");
    function chip(p, label, on) { var s = add(p, "span", "ob-ch" + (on ? " on" : "")); s.innerHTML = label; return s; }
    function commit() { save(); draw(); if (timelineIsHome()) buildPull(); else renderToday(); }
    function draw() {
      wrap.innerHTML = "";
      var sb = add(wrap, "div", "ob-lbl"); sb.style.cssText = "margin:0 0 4px;text-transform:none;font-size:12px;color:#caa0bd;letter-spacing:0;"; sb.textContent = "rough is fine — the timeline frames your day from these.";
      add(wrap, "div", "ob-lbl", "I USUALLY WAKE");
      var ur = add(wrap, "div", "ob-row"); WAKE_OPTS.forEach(function (t) { var c = chip(ur, t, P.wake === t); c.onclick = function () { P.wake = t; commit(); }; });
      add(wrap, "div", "ob-lbl", "I USUALLY SLEEP");
      var br = add(wrap, "div", "ob-row"); BED_OPTS.forEach(function (t) { var c = chip(br, t, P.sleep === t); c.onclick = function () { P.sleep = t; commit(); }; });
      add(wrap, "div", "ob-lbl", "SHARPEST");
      var lr = add(wrap, "div", "ob-row"); [["lark", "Morning", "ti-sun"], ["owl", "Night", "ti-moon"], ["mixed", "It varies", "ti-windmill"]].forEach(function (o) { var c = chip(lr, '<i class="ti ' + o[0 + 2] + '"></i> ' + o[1], P.peak === o[0]); c.onclick = function () { P.peak = o[0]; P.lark = (o[0] !== "owl"); commit(); }; });
      var dw = dayWindow(); var hint = add(wrap, "div", ""); hint.style.cssText = "margin-top:15px;padding:11px 13px;border-radius:13px;background:#1c0512;border:2px solid #160510;color:#ffd9ec;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px;"; hint.innerHTML = '<i class="ti ti-clock-hour-9" style="color:#ffb02e;font-size:17px;"></i> your day on the timeline: <b style="color:#ffe3f1;">' + fmtHour(dw.startH) + ' → ' + fmtHour(dw.endH) + '</b>';
    }
    draw();
  }
  var pullK = null, pullZoom = "day", pullHourPx = 64, pullFocusK = null; // pullFocusK = the day currently centered in the scroll (drives the header label + ‹ › paging) — David 2026-06-24
  function setHourPx(delta) { animateHourPx(pullHourPx + delta); }
  // Smooth hour-zoom that rebuilds ONLY the day-card timelines — the header (and the zoom slider you're dragging) stay intact, so a slider/pinch never destroys itself mid-gesture (David 2026-06-25)
  function zoomTimeline(nv, curOnly) {
    var pb = el("pullBody"); if (!pb) return; nv = Math.max(20, Math.min(520, Math.round(nv))); var old = pullHourPx; if (nv === old) return;
    var sc = pb.querySelector(".day-card.cur .day-cardscroll"), vh = sc ? sc.clientHeight : 0, prevTop = sc ? sc.scrollTop : 0, fy = vh * 0.42, anchor = prevTop + fy;
    pullHourPx = nv;
    var cards = pb.querySelectorAll(curOnly ? ".day-card.cur" : ".day-card");
    for (var i = 0; i < cards.length; i++) { var _secs = cards[i].querySelectorAll(".day-sec"); for (var _j = 0; _j < _secs.length; _j++) { var sec = _secs[_j], dk = sec.dataset.dk; calendarView(sec, dk, dk === todayK(), true); } }
    var cs = pb.querySelector(".day-card.cur .day-cardscroll"); nowLineEl = cs ? cs.querySelector(".nowline") : null;
    if (cs) cs.scrollTop = Math.max(0, anchor * (nv / old) - fy); // keep the time under the viewport-centre put
  }
  // Density by bubble height (text → icon → sliver). Module-level so the LIVE pinch can re-grade every frame, not just the commit re-render (David 2026-06-26)
  function degradeCard(card) { var h = parseFloat(card.style.height) || 26; card.classList.remove("lbl-c", "lbl-i", "lbl-s", "nosub"); if (h < 9) card.classList.add("lbl-s"); else if (h < 22) card.classList.add("lbl-i"); else if (h < 42) card.classList.add("lbl-c"); card.dataset.gate = h < 16 ? "menu" : h < 48 ? "move" : "full"; }
  // LIVE content reflow during a pinch: re-grade every bubble by its new height (text hides/shows seamlessly) and rebuild the right symbol-rail (thin bars' icons appear/move LIVE, not snapping in on release). Reads only inline styles (no forced layout). Makes the commit a visual no-op = no bounce. (David 2026-06-26)
  function liveReflowCal(cal) {
    var nl = cal.querySelector(".nowline"), band = null; if (nl) { var nt = parseFloat(nl.style.top) || 0; band = [nt - 6, nt + 30]; }
    var oldChips = cal.querySelectorAll(".railchip"); for (var i = 0; i < oldChips.length; i++) oldChips[i].remove();
    var blks = cal.querySelectorAll(".calblk:not(.live)"), items = []; // exclude the live bubble — the commit render never rails it, so including it here made the rail re-space (rearrange) on release (David 2026-06-27)
    for (var j = 0; j < blks.length; j++) { var c = blks[j]; degradeCard(c); if ((c.classList.contains("lbl-i") || c.classList.contains("lbl-s")) && c.dataset.ic) items.push({ y: (parseFloat(c.style.top) || 0) + (parseFloat(c.style.height) || 4) / 2, ic: c.dataset.ic, c: c.dataset.c || "#8a5cf0", ink: c.dataset.ink || "#fff" }); }
    items.sort(function (a, b) { return a.y - b.y; });
    var _rf = items.length ? (items[0].y - 8) : 0, _rpitch = items.length > 1 ? Math.max(18, ((items[items.length - 1].y - 8) - _rf) / (items.length - 1)) : 18; // EVEN-distribute rail icons (match the commit render — David 2026-06-27)
    for (var m = 0; m < items.length; m++) { var it = items[m], y = _rf + m * _rpitch; var chip = add(cal, "div", "railchip"); chip.style.top = y + "px"; chip.style.background = it.c; chip.style.color = it.ink; chip.innerHTML = '<i class="ti ' + it.ic + '"></i>'; } // PURE even spacing (match the commit render) — David 2026-06-27
  }
  var _zoomRaf = 0, _zoomPending = 0, _zoomAnchor = null, _zoomScroll = null, _zoomEndedAt = 0; // _zoomEndedAt = when the last pinch ended → suppress an accidental bubble-open from a finger that was resting on a bubble during rapid micro-zooms (David 2026-06-27)
  // LIVE zoom (slider drag + pinch): reposition the EXISTING nodes by their cached minute — no DOM teardown, no transition → past bubbles snap into place; anchorY (pinch thumb-midpoint) keeps the time under your fingers put (David 2026-06-25)
  function relayoutHourPx(nv, anchorY, scrollTop) {
    var pb = el("pullBody"); if (!pb) return; nv = Math.max(20, Math.min(520, Math.round(nv)));
    var sc = pb.querySelector(".day-card.cur .day-cardscroll"), vh = sc ? sc.clientHeight : 0, prevTop = sc ? sc.scrollTop : 0, old = pullHourPx;
    if (nv === old && scrollTop == null) return; // nothing to do (no zoom, no pan)
    pb.classList.add("zooming");
    if (nv !== old) {
      pullHourPx = nv;
      var cals = pb.querySelectorAll(".day-card.cur .day-sec .cal"); // the cur card is a STACK → live-zoom every day-section, not just the first (David 2026-06-26)
      for (var ci = 0; ci < cals.length; ci++) { var cal = cals[ci];
        var startH = +cal.dataset.startH; if (isNaN(startH)) startH = 6; var endH = +cal.dataset.endH; if (isNaN(endH)) endH = 30;
        cal.style.height = ((endH - startH) * nv + 10) + "px";
        var list = cal.querySelectorAll("[data-mn]");
        for (var i = 0; i < list.length; i++) { var e = list[i], mn = +e.dataset.mn, off = +(e.dataset.off || 0); e.style.top = ((mn - startH * 60) / 60 * nv + off) + "px"; if (e.dataset.dur != null) e.style.height = Math.max(5, (+e.dataset.dur) / 60 * nv - 4) + "px"; } // SAME floor/margin as the render → live + commit heights match → no bounce on release
        liveReflowCal(cal); // re-grade bubbles + rebuild the symbol-rail live this frame → text/icons reflow seamlessly as you pinch, and the commit changes nothing (no bounce)
      }
    }
    if (sc) { if (scrollTop != null && typeof scrollTop === "object") { var _as = sc.querySelector('.day-sec[data-dk="' + scrollTop.dk + '"]'); if (_as) { var _anchorY = _as.offsetTop + (scrollTop.calOff || 0) + (scrollTop.min - scrollTop.startH * 60) / 60 * nv; sc.scrollTop = Math.max(0, _anchorY - scrollTop.fy); } } else if (scrollTop != null) sc.scrollTop = Math.max(0, scrollTop); else { var fy = (anchorY == null) ? vh * 0.42 : Math.max(0, Math.min(vh, anchorY - sc.getBoundingClientRect().top)); sc.scrollTop = Math.max(0, (prevTop + fy) * (nv / old) - fy); } }
  }
  function zoomCommit() { var pb = el("pullBody"); if (!pb) return; var sc = pb.querySelector(".day-card.cur .day-cardscroll"); if (sc) sc.style.scrollSnapType = "none"; pb.classList.remove("zooming"); var prevTop = sc ? sc.scrollTop : 0; var cards = pb.querySelectorAll(".day-card"); for (var i = 0; i < cards.length; i++) { var _secs = cards[i].querySelectorAll(".day-sec"); for (var _j = 0; _j < _secs.length; _j++) { var sec = _secs[_j], dk = sec.dataset.dk; calendarView(sec, dk, dk === todayK(), true); } } var cs = pb.querySelector(".day-card.cur .day-cardscroll"); nowLineEl = cs ? cs.querySelector(".nowline") : null; if (cs) { cs.style.scrollSnapType = "none"; cs.style.overflowY = ""; cs.scrollTop = prevTop; var _rs = function () { cs.style.scrollSnapType = ""; pb.removeEventListener("pointerdown", _rs); }; pb.addEventListener("pointerdown", _rs); } } // settle: one crisp re-render at the final zoom. THE BOUNCE FIX: proximity scroll-snap re-engaging on pinch-release yanked the scroll to the nearest day detent (a 47-54px jump). Disable snap BEFORE restoring the scroll (else the scrollTop set snaps), keep it off after release, and restore the day-crossing "wall" only on the next touch — so releasing a zoom never snaps. (David 2026-06-26)
  function zoomLive(nv, anchorY, scrollTop) { _zoomPending = nv; _zoomAnchor = anchorY; _zoomScroll = scrollTop; if (_zoomRaf) return; _zoomRaf = requestAnimationFrame(function () { _zoomRaf = 0; relayoutHourPx(_zoomPending, _zoomAnchor, _zoomScroll); }); } // throttle live drag/pinch to one cheap reposition+scroll per frame
  // Hour-density zoom = a CRISP re-layout (the hours redistribute, bubbles stay their natural shape) — NOT a pixel-stretch. Anchored so the time under the focus point stays put. (David 2026-06-24)
  function animateHourPx(nv, focusScreenY) { // crisp re-layout zoom — anchored to the CURRENT day-card's scroll (paged view) so the time under your focus stays put (David 2026-06-24)
    var pb = el("pullBody"); if (!pb) return; var old = pullHourPx;
    nv = Math.max(20, Math.min(520, Math.round(nv))); if (nv === old) return;
    var sc = pb.querySelector(".day-card.cur .day-cardscroll"), vh = sc ? sc.clientHeight : 0, prevTop = sc ? sc.scrollTop : 0;
    var fy = (focusScreenY == null) ? vh * 0.42 : (focusScreenY - (sc ? sc.getBoundingClientRect().top : 0));
    var anchor = prevTop + fy;
    pullHourPx = nv; buildPull();
    var sc2 = el("pullBody").querySelector(".day-card.cur .day-cardscroll"); if (sc2) sc2.scrollTop = Math.max(0, anchor * (nv / old) - fy);
  }
  // smooth zoom between day/week/month — a self-completing CSS keyframe entrance (never gets stuck invisible; ends at the natural visible state) — David 2026-06-24
  function zoomAnim(dir) {
    buildPull();
    var p = el("pullBody"); if (!p) return;
    p.style.animation = "none"; void p.offsetHeight; // restart the animation each zoom
    p.style.animation = (dir > 0 ? "zoomBroad" : "zoomClose") + " .26s cubic-bezier(.2,.7,.3,1)";
    p.addEventListener("animationend", function () { p.style.animation = ""; }, { once: true });
  }
  function pageSlide(dir) { // Apple-Photos day swipe: animate the pager from WHEREVER the finger left it to the prev/next card, then rebuild centered there (David 2026-06-24; smoothed 2026-06-26)
    var pb = el("pullBody"), pgr = pb && pb.querySelector(".day-pager");
    if (!pgr) { pullFocusK = keyAdd(pullFocusK || todayK(), dir); _scrollToFocus = true; buildPull(); return; }
    if (pgr._sliding) return; pgr._sliding = 1; _paging = 1; // never double-fire a turn; suppress the continuous recenter until the new day's scroll settles
    var target = (dir > 0 ? -66.6667 : 0), cur = -33.3333, m = /translateX\(\s*([-0-9.]+)%/.exec(pgr.style.transform || ""); if (m) cur = parseFloat(m[1]);
    pgr.style.transition = "none"; pgr.style.transform = "translateX(" + cur + "%)"; void pgr.offsetWidth; // pin the start at the finger's last position, force a reflow → the tween always has a real distance (no freeze)
    pgr.style.transition = "transform .26s cubic-bezier(.3,.7,.25,1)"; pgr.style.transform = "translateX(" + target + "%)";
    var done = false; function fin() { if (done) return; done = true; clearTimeout(to); pgr.removeEventListener("transitionend", fin); pullFocusK = keyAdd(pullFocusK || todayK(), dir); _scrollToFocus = true; buildPull(); setTimeout(function () { _paging = 0; }, 80); } // _scrollToFocus (NOT pendingScrollNow, which would trip buildPull's reset-to-today guard) jumps the vertical scroll onto the new day so the continuous recenter agrees and doesn't bounce
    pgr.addEventListener("transitionend", fin);
    var to = setTimeout(fin, Math.abs(target - cur) < 1 ? 24 : 300); // duration-matched fallback; if the finger already reached the target the transition won't fire → finish next frame instead of freezing 320ms
  }
  var _infRebuild = 0;
  function attachInfinite(sc) { // CONTINUOUS timeline: the day-buffer recenters on whatever day you've scrolled to and the week-strip tracks it — so you just keep scrolling into yesterday/tomorrow with NO edge and NO cut (David 2026-06-26)
    if (sc._inf) return; sc._inf = 1; var raf = 0;
    sc.addEventListener("scroll", function () {
      if (!_navLock && sc.scrollTop > 24 && document.body.classList.contains("tab-day")) document.body.classList.add("nav-collapsed"); // Apple-Music: the moment you actually scroll the timeline, Goals/You tuck behind the Today pill and the live tracker drops beside it (David 2026-06-26)
      if (raf || _infRebuild || _paging || _pinching) return; // never recenter mid-page-turn or mid-pinch (that was the old bounce / the pinch snap-to-today) — David 2026-06-26
      raf = requestAnimationFrame(function () { raf = 0;
        var cy = sc.scrollTop + sc.clientHeight * 0.4, secs = sc.querySelectorAll(".day-sec"), centerDk = null, centerIdx = -1;
        for (var i = 0; i < secs.length; i++) { if (secs[i].offsetTop <= cy) { centerDk = secs[i].dataset.dk; centerIdx = i; } }
        if (!centerDk) return;
        setStripSel(centerDk); setTodayBtn(el("pullTodayBtn"), centerDk === todayK()); // header tracks the centred day on EVERY scroll (cheap, no rebuild) so it always knows which day you're in
        if ((centerIdx <= 0 || centerIdx >= secs.length - 1) && centerDk !== pullFocusK) { _infRebuild = 1; pullFocusK = centerDk; pendingScrollNow = false; buildPull(); setTimeout(function () { _infRebuild = 0; }, 160); } // recenter the buffer ONLY when you reach its very EDGE — inside the ±3-day window scrolling is pure native scroll, never a mid-day rebuild (kills the "confused where the day starts" jitter) — David 2026-06-26
      });
    });
  }
  // The top-right pill is "Today" when you've scrolled/paged away, and flips to "Now" once today is centered — tap it from any scroll position to jump straight to the now-line (David 2026-06-26)
  function setTodayBtn(btn, isToday) { if (!btn) return; btn.innerHTML = isToday ? '<i class="ti ti-clock-bolt"></i> Now' : '<i class="ti ti-current-location"></i> Today'; btn.classList.toggle("is-now", isToday); btn.style.display = ""; }
  function scrollToNow() { var pb = el("pullBody"); var sc = pb && pb.querySelector(".day-card.cur .day-cardscroll"); var nl = sc && sc.querySelector(".nowline"); if (nl && nl.offsetParent !== null) { _paging = 1; nl.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(function () { _paging = 0; }, 520); } else { pullFocusK = todayK(); pendingScrollNow = true; buildPull(); } } // jump to the present moment within today; _paging suppresses the continuous recenter DURING the smooth scroll so a mid-scroll rebuild can't destroy the now-line (the "now-line disappears" bug) — David 2026-06-26
  function jumpToToday() { // the Today/Now pill: tap it to come back to today with a SWIPE animation in today's direction (David 2026-06-26)
    var foc = pullFocusK || todayK(), tod = todayK();
    if (foc === tod) { scrollToNow(); return; } // already on today → jump to now
    var diff = Math.round((kd(tod) - kd(foc)) / 86400000), dir = diff > 0 ? 1 : -1; // dir = which way today is
    if (Math.abs(diff) === 1) { pageSlide(dir); return; } // one day away → the normal day swipe carries you back
    var pb = el("pullBody"), pgr = pb && pb.querySelector(".day-pager"); // further away → a quick directional slide, then land on today at the now-line
    if (!pgr || pgr._sliding) { pullK = tod; pullFocusK = tod; pendingScrollNow = true; buildPull(); return; }
    pgr._sliding = 1; _paging = 1;
    pgr.style.transition = "transform .24s cubic-bezier(.3,.7,.25,1)"; pgr.style.transform = "translateX(" + (dir > 0 ? -66.6667 : 0) + "%)";
    var done = false; function fin() { if (done) return; done = true; clearTimeout(to); pgr.removeEventListener("transitionend", fin); pullK = tod; pullFocusK = tod; pendingScrollNow = true; buildPull(); setTimeout(function () { _paging = 0; }, 80); }
    pgr.addEventListener("transitionend", fin); var to = setTimeout(fin, 260);
  }
  // Apple-Calendar mini week strip: the 7 days of focus's week (Sun→Sat), weekday letter over the date number; selected day filled, today tinted; tap to jump (David 2026-06-26)
  function weekStrip(host, focusK) {
    var sow = startOfWeek(focusK), tk = todayK(), L = "SMTWTFS";
    for (var i = 0; i < 7; i++) { (function (dk) {
      var d = kd(dk), wd = d.getDay(), sel = (dk === focusK), isT = (dk === tk);
      var cell = add(host, "button", "pws-day" + (sel ? " sel" : "") + (isT ? " today" : "")); cell.dataset.dk = dk;
      add(cell, "span", "pws-l", L.charAt(wd)); add(cell, "span", "pws-n", String(d.getDate()));
      cell.onclick = function () { if (dk === (pullFocusK || tk)) { if (dk === tk) scrollToNow(); return; } pullFocusK = dk; pendingScrollNow = (dk === tk); buildPull(); };
    })(keyAdd(sow, i)); }
  }
  function setStripSel(dk) { var cells = document.querySelectorAll(".pull-weekstrip .pws-day"), found = false; for (var i = 0; i < cells.length; i++) { var m = cells[i].dataset.dk === dk; cells[i].classList.toggle("sel", m); if (m) found = true; } if (!found) { var host = document.querySelector(".pull-weekstrip"); if (host) { host.innerHTML = ""; weekStrip(host, dk); } } var _dl = el("pullDayLabel"); if (_dl) _dl.textContent = relLabel(dk); } // the top day-label (Today/Yesterday/Tomorrow/date) tracks the centred day on every scroll + swipe (David 2026-06-27) // live-move the week-strip highlight to the day you're heading to; if that day crossed into a NEW week, rebuild the strip on that week so the highlight follows instead of vanishing/sticking on the old week (David 2026-06-27)
  var _paging = 0, _scrollToFocus = false, _navLock = 0, _pinching = 0; // _pinching suppresses the continuous-scroll recenter for the whole 2-finger gesture (a mid-pinch rebuild was destroying nodes and snapping the view back to today — the "zoom locks at the top" bug, confirmed by repro); _paging suppresses the recenter during a horizontal page turn; _scrollToFocus jumps the vertical scroll onto the new focus day after a page turn; _navLock blocks the Apple-Music nav-collapse during programmatic scrolls
  // the ⋯ overflow: day tools that used to sit in their own bar row (Plan day / enhance / clear / undo / test) — keeps the header at 2 rows (David 2026-06-26)
  function dayToolsMenu(anchor) {
    var head = el("pullHead"); if (!head) return; var ex = head.querySelector(".pull-toolsmenu"); if (ex) { ex.remove(); return; } // tap again = close
    var k = pullFocusK || todayK();
    var menu = add(head, "div", "pull-toolsmenu");
    var r = anchor.getBoundingClientRect(), hr = head.getBoundingClientRect();
    menu.style.top = (r.bottom - hr.top + 5) + "px"; menu.style.right = Math.max(4, hr.right - r.right) + "px";
    function item(cls, ic, label, fn) { var b = add(menu, "button", "ptm-item" + (cls ? " " + cls : "")); b.innerHTML = '<i class="ti ' + ic + '"></i> ' + label; b.onclick = function (e) { e.stopPropagation(); menu.remove(); fn(); }; }
    item("plan", "ti-calendar-plus", "Plan day", function () { planDay(k); });
    item("", "ti-wand", "Enhance plan", function () { enhancePlan(k); });
    item("", "ti-eraser", "Clear day", function () { pushUndo(); S.blocks[k] = []; reflow(k); save(); buildPull(); toast("🧹 cleared " + relLabel(k).toLowerCase() + " — Undo in ⋯"); });
    item("", "ti-arrow-back-up", "Undo", function () { popUndo(); });
    item("dev", "ti-flask", "Test day", function () { fillTestDay(); });
    setTimeout(function () { function close(e) { if (!menu.contains(e.target) && e.target !== anchor) { try { menu.remove(); } catch (er) {} document.removeEventListener("pointerdown", close, true); } } document.addEventListener("pointerdown", close, true); }, 0);
  }
  // PLAN DAY — the future-only setup entry (David 2026-06-25): pick activities or a habit stack → they land on the timeline (drag to arrange). Stacks live INSIDE here now; the below-now button is gone.
  function distributePlan(k, sel) {
    if (!sel || !sel.length) return;
    pushUndo();
    var arr = blocks(k), start = 8 * 60;
    arr.forEach(function (b) { start = Math.max(start, hm(b.time) + (b.mins || 30)); });
    if (k === todayK()) start = Math.max(start, logicalNowMin());
    sel.forEach(function (x) { if (!x) return; var dom = domainOf(x); arr.push({ id: uid(), time: pad(Math.floor(start / 60)) + ":" + pad(start % 60), mins: 30, title: x.title, color: x.color || DOM[dom].c, catK: x.catK || null, domain: dom, prio: 2 }); start += 30; });
    reflow(k); save(); renderToday(); buildPull(); toast("📋 placed on " + relLabel(k).toLowerCase());
  }
  // EDIT-FUNDAMENTALS menu (David 2026-06-25): customise the recurring basics that "Daily fundamentals" drops in (saved per-profile, falls back to the default set)
  function fundamentalsMenu() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "Daily fundamentals");
    add(B, "div", "lbl", "Your recurring basics — “Daily fundamentals” fills these into a day.");
    var list = add(B, "div", "fund-list");
    function draw() {
      list.innerHTML = ""; var arr = getFund();
      arr.forEach(function (f, i) { var row = add(list, "div", "fund-row"); var sw = add(row, "span", "fund-sw"); sw.style.background = (DOM[f.d] || DOM.focus).c; add(row, "span", "fund-n", f.t + " · " + f.m + "m"); var rm = add(row, "button", "fund-x"); rm.innerHTML = '<i class="ti ti-x"></i>'; rm.onclick = function () { var a = getFund().slice(); a.splice(i, 1); S.profile = S.profile || {}; S.profile.fundamentals = a; save(); draw(); }; });
      var ab = add(list, "button", "add2"); ab.innerHTML = '<i class="ti ti-plus"></i> add a fundamental'; ab.style.margin = "6px 0 0"; ab.onclick = function () { bentoPicker({ title: "Add a daily fundamental", onPick: function (x) { if (!x) return; var a = getFund().slice(); a.push({ t: x.title, d: domainOf(x), m: 30, slot: 720 }); S.profile = S.profile || {}; S.profile.fundamentals = a; save(); draw(); } }); };
    }
    draw();
    if (S.profile && S.profile.fundamentals) { var rs = add(B, "button", "add2"); rs.innerHTML = '<i class="ti ti-rotate"></i> reset to defaults'; rs.style.margin = "8px 0 0"; rs.onclick = function () { delete S.profile.fundamentals; save(); fundamentalsMenu(); }; }
    add(B, "button", "done2", "Done").onclick = function () { planDay(todayK()); };
  }
  function planDay(k) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "Plan " + relLabel(k).toLowerCase());
    add(B, "div", "lbl", "Pick activities or drop in a stack — they land on your timeline to arrange.");
    var f = add(B, "button", "add2"); f.innerHTML = '<i class="ti ti-stars"></i> Daily fundamentals'; f.style.margin = "4px 0 0"; f.onclick = function () { closeSheet(); enhancePlan(k); };
    var fe = add(B, "button", "add2"); fe.innerHTML = '<i class="ti ti-settings"></i> edit fundamentals'; fe.style.cssText = "margin:0 0 8px;font-size:11.5px;padding:7px;opacity:.85;"; fe.onclick = function () { fundamentalsMenu(); };
    var p = add(B, "button", "add2"); p.innerHTML = '<i class="ti ti-checkbox"></i> Pick activities'; p.style.margin = "4px 0"; p.onclick = function () { bentoPicker({ title: "Pick everything for " + relLabel(k).toLowerCase(), multi: true, onPickMulti: function (sel) { distributePlan(k, sel); }, onPick: function (x) { if (x) distributePlan(k, [x]); } }); };
    var s = add(B, "button", "add2"); s.innerHTML = '<i class="ti ti-stack-2"></i> Use a habit stack'; s.style.margin = "4px 0"; s.onclick = function () { presetsSheet(k); };
    add(B, "button", "done2", "Done").onclick = function () { closeSheet(); };
  }
  function buildPull() {
    var head = el("pullHead"), pb = el("pullBody"); if (!pb) return;
    var k = pullK || todayK();
    var run = activeTimers(), t = run[run.length - 1];
    function stepK(dir) { var d = kd(k); if (pullZoom === "week") d.setDate(d.getDate() + dir * 7); else d.setMonth(d.getMonth() + dir); pullK = key(d); buildPull(); }
    function zoom(dir) { var o = ["day", "week", "month"], i = Math.max(0, Math.min(2, o.indexOf(pullZoom) + dir)); if (o[i] === pullZoom) return; pullZoom = o[i]; if (pullZoom === "day") { pullK = todayK(); pendingScrollNow = true; } zoomAnim(dir); } // dir +1 = zoom OUT (day→week→month), -1 = zoom IN — animated
    if (head) {
      head.innerHTML = "";
      var top = add(head, "div", "pull-top");
      if (pullZoom === "day") {
        // ROW 1 — LEFT: day/week/month scope (where "Today" used to sit); the WEEK button is also your "go back to the week" (David 2026-06-26)
        var segL = add(top, "div", "scope-seg");
        [["day", "ti-list"], ["week", "ti-layout-columns"], ["month", "ti-layout-grid"]].forEach(function (s) { var sb = add(segL, "button", "scope-b" + (pullZoom === s[0] ? " on" : "")); sb.innerHTML = '<i class="ti ' + s[1] + '"></i>'; sb.onclick = function () { if (pullZoom === s[0]) return; var o = ["day", "week", "month"], dir = o.indexOf(s[0]) > o.indexOf(pullZoom) ? 1 : -1; pullZoom = s[0]; if (pullZoom === "day") pullK = todayK(); pendingScrollNow = true; zoomAnim(dir); }; });
        // ROW 1 — CENTER: which day you're on — Today / Yesterday / Tomorrow, else weekday + date (David 2026-06-27)
        var dl = add(top, "div", "pull-daylabel"); dl.id = "pullDayLabel"; dl.textContent = relLabel(pullFocusK || todayK()); dl.style.cssText = "flex:1;min-width:0;text-align:center;font-family:'Jost',sans-serif;font-weight:800;font-size:15px;color:#ffe3f1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px;letter-spacing:.3px;";
        // ROW 1 — RIGHT: Now pill + ONE ⋯ tools button (Plan day / enhance / clear / undo / test) → the bar stays at 2 rows, most of the screen is calendar (David 2026-06-26)
        var rt = add(top, "div", "pull-rt");
        var tdb2 = add(rt, "button", "pull-today"); tdb2.id = "pullTodayBtn"; tdb2.onclick = function () { jumpToToday(); }; setTodayBtn(tdb2, (pullFocusK || todayK()) === todayK());
        var tools = add(rt, "button", "pull-toolsbtn"); tools.innerHTML = '<i class="ti ti-dots"></i>'; tools.setAttribute("aria-label", "day tools"); tools.onclick = function (e) { e.stopPropagation(); dayToolsMenu(tools); };
        // ROW 2 — the mini week strip
        weekStrip(add(head, "div", "pull-weekstrip"), pullFocusK || todayK());
      } else {
        add(top, "div", "pull-date", pullZoom === "week" ? "Weeks" : "Months");
        var rt = add(top, "div", "pull-rt");
        var tdb = add(rt, "button", "pull-today"); tdb.innerHTML = '<i class="ti ti-current-location"></i> Today'; tdb.onclick = findToday; // "find yourself" → smooth-scroll back to the current week/month
        var seg = add(rt, "div", "scope-seg");
        [["day", "ti-list"], ["week", "ti-layout-columns"], ["month", "ti-layout-grid"]].forEach(function (s) { var sb = add(seg, "button", "scope-b" + (pullZoom === s[0] ? " on" : "")); sb.innerHTML = '<i class="ti ' + s[1] + '"></i>'; sb.onclick = function () { if (pullZoom === s[0]) return; var o = ["day", "week", "month"], dir = o.indexOf(s[0]) > o.indexOf(pullZoom) ? 1 : -1; pullZoom = s[0]; if (pullZoom === "day") pullK = todayK(); pendingScrollNow = true; zoomAnim(dir); }; });
        var cx = add(rt, "button", "pull-x"); cx.innerHTML = '<i class="ti ti-x"></i>'; cx.onclick = closePull;
      }
    }
    var _curSc0 = pb.querySelector(".day-card.cur .day-cardscroll"); var keepTop = _curSc0 ? _curSc0.scrollTop : pb.scrollTop, _wsc0 = pb.querySelector(".week-scroller"), keepLeft = _wsc0 ? _wsc0.scrollLeft : 0; // preserve scroll across the minute-tick rebuild (per-card in paged day view)
    var keepAnchor = null; if (_curSc0) { var _secs0 = _curSc0.querySelectorAll(".day-sec"), _cy0 = keepTop + _curSc0.clientHeight * 0.4; for (var _ai = 0; _ai < _secs0.length; _ai++) { if (_secs0[_ai].offsetTop <= _cy0) keepAnchor = { dk: _secs0[_ai].dataset.dk, off: keepTop - _secs0[_ai].offsetTop }; } } // remember WHICH day + offset is under the viewport, so a rebuild restores the exact same view in the continuous stack (David 2026-06-26)
    pb.classList.toggle("paged", pullZoom === "day");
    pb.classList.remove("zooming"); // never inherit a stale zoom-suppress class across a rebuild (would freeze all timeline transitions) — David 2026-06-25
    pb.innerHTML = "";
    var onDayPick = function (dk) { pullK = dk; pullZoom = "day"; pendingScrollNow = true; zoomAnim(-1); };
    if (pullZoom === "week") { // horizontal giant-list of weeks: swipe side-to-side; Today recenters (David 2026-06-24)
      var wsc = add(pb, "div", "week-scroller"), sw0 = startOfWeek(todayK());
      for (var wi = -4; wi <= 4; wi++) { (function (wk) { var page = add(wsc, "div", "week-page" + (wk === sw0 ? " now" : "")); add(page, "div", "wk-plab", wk === sw0 ? "This week" : "Week of " + relShort(wk)); weekGrid(page, wk, onDayPick); })(keyAdd(sw0, wi * 7)); }
      if (pendingScrollNow) { var wpNow = wsc.querySelector(".week-page.now"); if (wpNow) wsc.scrollLeft = wpNow.offsetLeft; pendingScrollNow = false; } // center on this week (synchronous)
      else wsc.scrollLeft = keepLeft;
    }
    else if (pullZoom === "month") { // vertical giant-list of months: scroll up/down; Today recenters (David 2026-06-24)
      var mb = kd(todayK()); mb.setDate(1);
      for (var mi = -4; mi <= 4; mi++) { (function (mk, isNow) { var page = add(pb, "div", "month-page" + (isNow ? " now" : "")); add(page, "div", "mo-plab", kd(mk).toLocaleDateString([], { month: "long", year: "numeric" })); monthGrid(page, mk, onDayPick); })(key(new Date(mb.getFullYear(), mb.getMonth() + mi, 1)), mi === 0); }
      if (pendingScrollNow) { var mpNow = pb.querySelector(".month-page.now"); if (mpNow) pb.scrollTop = mpNow.offsetTop; pendingScrollNow = false; } // center on this month (synchronous — offsetTop forces layout)
      else pb.scrollTop = keepTop;
    }
    else { // CONTINUOUS day view: the CUR card is a multi-day STACK you scroll through seamlessly (no cut); prev/next single-day cards exist only for the horizontal side-slide (Apple-Photos) — David 2026-06-26
      if (pendingScrollNow || !pullFocusK) pullFocusK = pullK || todayK();
      var focus = pullFocusK, R = 3; // ±3 days of buffer → you can scroll several days smoothly before any rebuild (no mid-day jitter) — David 2026-06-26
      var pager = add(pb, "div", "day-pager");
      function dayHeadInfo(hd, dk) { if (dk > todayK()) { var apb = add(hd, "button", "day-sepauto"); apb.innerHTML = '<i class="ti ti-stack-2"></i> stacks'; apb.onclick = function () { presetsSheet(dk); }; } else if (blocks(dk).length) { var _bl = blocks(dk), _dn = 0; _bl.forEach(function (b) { if (blockStatus(dk, b) === "ok") _dn++; }); var db = add(hd, "span", "day-done" + (_dn >= _bl.length ? " all" : "")); db.innerHTML = '<i class="ti ti-circle-check-filled"></i> ' + _dn + '/' + _bl.length + ' done'; } }
      [-1, 0, 1].forEach(function (off) {
        var dk = keyAdd(focus, off), isT = (dk === todayK());
        var card = add(pager, "div", "day-card" + (isT ? " today" : "") + (off === 0 ? " cur" : "")); card.dataset.dk = dk;
        var lh = add(card, "div", "lanehead"); add(lh, "span", "lhx plan", "PLAN"); add(lh, "span", "lhx real", "REAL");
        var sc = add(card, "div", "day-cardscroll");
        if (off === 0) { // CUR → a CONTINUOUS vertical stack (focus-R..focus+R): you scroll freely within a day AND see the neighbour as you reach the edge; scrolling into it makes it the day. attachInfinite recenters the buffer (David picked continuous-done-right, 2026-06-26)
          for (var d = -R; d <= R; d++) { var sk = keyAdd(focus, d), skT = (sk === todayK());
            var sep = add(sc, "div", "day-stacksep" + (skT ? " today-sep" : "")); add(sep, "span", "dss-lab", dayLabelFull(sk)); dayHeadInfo(sep, sk);
            var ssec = add(sc, "div", "day-sec"); ssec.dataset.dk = sk; calendarView(ssec, sk, skT, true); }
          attachInfinite(sc);
        } else { var sep = add(sc, "div", "day-stacksep" + (isT ? " today-sep" : "")); add(sep, "span", "dss-lab", dayLabelFull(dk)); dayHeadInfo(sep, dk); var sec = add(sc, "div", "day-sec"); sec.dataset.dk = dk; calendarView(sec, dk, isT, true); } // preview (off ±1) MATCHES the continuous-stack structure — stacksep INSIDE the scroll (not a fixed day-cardhead) — so when the slide lands and the day rebuilds into the stack, the day-section sits at the SAME Y = no bounce on arrival (David 2026-06-27)
      })
      ; // forEach
      pager.style.transform = "translateX(-33.3333%)"; // show the middle (current) card
      var curScroll = pager.querySelector(".day-card.cur .day-cardscroll");
      nowLineEl = curScroll ? curScroll.querySelector(".nowline") : null;
      if (curScroll) {
        if (pendingScrollNow) { var _nl = curScroll.querySelector(".nowline") || curScroll.querySelector('.day-sec[data-dk="' + focus + '"]'); var _ctr = _nl && _nl.classList && _nl.classList.contains("nowline"); var _doNow = function () { if (_nl && _nl.offsetParent !== null) _nl.scrollIntoView({ block: _ctr ? "center" : "start" }); }; _doNow(); requestAnimationFrame(_doNow); pendingScrollNow = false; _scrollToFocus = false; } // SYNCHRONOUS first, then re-assert in rAF: the ±R buffer's scrollTop 0 is focus-3 days, so deferring the scroll to rAF painted the WRONG day for one frame then jumped — position before first paint (David 2026-06-27)
        else if (_scrollToFocus) { _scrollToFocus = false; var _fnl = (focus === todayK()) ? curScroll.querySelector(".nowline") : null, _ft = curScroll.querySelector('.day-sec[data-dk="' + focus + '"]'); var _fsep = (_ft && _ft.previousElementSibling && _ft.previousElementSibling.classList.contains("day-stacksep")) ? _ft.previousElementSibling : null; var _doFoc = function () { if (_fnl && _fnl.offsetParent !== null) _fnl.scrollIntoView({ block: "center" }); else if (_fsep) curScroll.scrollTop = Math.max(0, _fsep.offsetTop); else if (_ft) curScroll.scrollTop = Math.max(0, _ft.offsetTop - 4); }; _doFoc(); requestAnimationFrame(_doFoc); } // a horizontal page turn lands the new focus day FROM ITS TOP on the FIRST frame (no post-release jump) — its day-label separator at the viewport top, so you see that one day from the beginning, not focus-3 first (David 2026-06-27)
        else if (keepAnchor) { var _t = curScroll.querySelector('.day-sec[data-dk="' + keepAnchor.dk + '"]'); curScroll.scrollTop = _t ? (_t.offsetTop + keepAnchor.off) : keepTop; }
        else curScroll.scrollTop = keepTop;
        _navLock = 1; setTimeout(function () { _navLock = 0; }, 650); // the programmatic scroll-to-now/anchor must NOT trigger the nav-collapse — only a real user scroll after the view settles does (David 2026-06-26)
      }
      setStripSel(focus); setTodayBtn(el("pullTodayBtn"), focus === todayK());
    }
    if (!pb._gw) { // physical gestures, wired once: two-finger PINCH = hour-density zoom · one-finger horizontal SWIPE = page to prev/next day (David 2026-06-24)
      pb._gw = 1;
      var ptrs = {}, pVD0 = 0, pHP0 = 0, pHPLast = 0, pMid0 = 0, pScroll0 = 0, pContTop = 0, pAnchorContent = 0, pAnchorSecDk = null, pAnchorMin = 0, pAnchorStartH = 6, pAnchorCalOff = 0, sX = 0, sY = 0, single = false, swOn = false, swPgr = null, swW = 1, swLastX = 0, swPrevX = 0;
      function pvdist() { var v = Object.keys(ptrs).map(function (i) { return ptrs[i]; }); return v.length < 2 ? 0 : Math.abs(v[0].y - v[1].y); } // VERTICAL finger distance → zoom only stretches up/down (David 2026-06-25)
      function pmidY() { var v = Object.keys(ptrs).map(function (i) { return ptrs[i]; }); return v.length < 2 ? null : (v[0].y + v[1].y) / 2; }
      pb.addEventListener("pointerdown", function (e) {
        if (e.isPrimary) { ptrs = {}; pVD0 = 0; single = false; swOn = false; swPgr = null; _pinching = 0; if (_zoomRaf) { cancelAnimationFrame(_zoomRaf); _zoomRaf = 0; } pb.classList.remove("zooming"); var _frs = pb.querySelector(".day-card.cur .day-cardscroll"); if (_frs && _frs.style.overflowY) _frs.style.overflowY = ""; } // also un-freeze the scroll if a prior pinch ended without a clean commit // a fresh gesture clears any stale/stuck pointers + zoom-suppress class (David 2026-06-25)
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; var n = Object.keys(ptrs).length;
        if (n === 1) { single = true; sX = e.clientX; sY = e.clientY; swOn = false; swW = pb.clientWidth || 1; swPgr = (pullZoom === "day" && !(e.target.closest && e.target.closest(".grip,.gript,.calx,.live-stop,button"))) ? pb.querySelector(".day-pager") : null; } // a quick HORIZONTAL swipe pages the day even starting on a bubble (the bubble only edits on a near-stationary tap); VERTICAL drags fall through to the continuous scroll which changes days on its own (David 2026-06-26)
        else if (n === 2) { single = false; swOn = false; _pinching = 1; if (swPgr) { swPgr.style.transition = "transform .15s"; swPgr.style.transform = "translateX(-33.3333%)"; } swPgr = null; var _ct = pb.querySelectorAll(".day-card.cur .nowline, .day-card.cur .nowcirc, .day-card.cur .nowread, .day-card.cur .nowtime"); for (var _cti = 0; _cti < _ct.length; _cti++) _ct[_cti].style.transform = ""; /* clear the per-second-creep transform before zooming — else its leftover translateY offsets the now-line during the pinch and snaps on commit (the fast-zoom "jump") — David 2026-06-27 */ var _sc = pb.querySelector(".day-card.cur .day-cardscroll"); pb.classList.add("zooming"); if (_sc) { _sc.scrollTop = _sc.scrollTop; _sc.style.overflowY = "hidden"; } /* CUT any in-flight momentum scroll the instant 2 fingers land (overflow:hidden halts iOS momentum; reading+writing scrollTop snaps it) so a pinch always wins over a coasting flick — zoomLive drives scrollTop programmatically during the pinch anyway, and overflow is restored on commit. Also flag .zooming NOW so a finger resting on a bubble can't select/scale it before the first zoom frame (David 2026-06-27) */ pVD0 = Math.max(8, pvdist()); pHP0 = pHPLast = pullHourPx; pMid0 = pmidY(); pScroll0 = _sc ? _sc.scrollTop : 0; pContTop = _sc ? _sc.getBoundingClientRect().top : 0; pAnchorContent = pScroll0 + (pMid0 - pContTop); var _asec = null, _ass = _sc ? _sc.querySelectorAll(".day-sec") : []; for (var _ai = 0; _ai < _ass.length; _ai++) { if (_ass[_ai].offsetTop <= pAnchorContent) _asec = _ass[_ai]; } if (!_asec && _ass.length) _asec = _ass[0]; pAnchorSecDk = _asec ? _asec.dataset.dk : null; var _acal = _asec ? _asec.querySelector(".cal") : null; pAnchorStartH = _acal ? (+_acal.dataset.startH || 6) : 6; pAnchorCalOff = (_acal && _asec) ? (_acal.getBoundingClientRect().top - _asec.getBoundingClientRect().top) : 0; var _contentInCal = (pAnchorContent - (_asec ? _asec.offsetTop : 0)) - pAnchorCalOff; pAnchorMin = pAnchorStartH * 60 + (_contentInCal / pHP0) * 60; } // 2 fingers → PINCH+PAN, both live (iPhone Photos). Anchor by the exact MINUTE under the finger midpoint + which day-section, then re-place it via the same linear (min→px) formula the bubbles use. (Anchoring by FRACTION-of-section-height drifts because the section height carries a constant +10px margin that doesn't scale → worst at the zoom extremes; minute-anchoring is exact at every zoom — David 2026-06-26)
      });
      pb.addEventListener("pointermove", function (e) {
        if (ptrs[e.pointerId]) { ptrs[e.pointerId].x = e.clientX; ptrs[e.pointerId].y = e.clientY; }
        if (!single && pVD0 > 0 && Object.keys(ptrs).length >= 2 && pullZoom === "day") { var vd = Math.max(8, pvdist()); pHPLast = Math.max(20, Math.min(520, Math.round(pHP0 * (vd / pVD0)))); var mid = pmidY(); zoomLive(pHPLast, null, { dk: pAnchorSecDk, min: pAnchorMin, startH: pAnchorStartH, calOff: pAnchorCalOff, fy: mid - pContTop }); e.preventDefault(); return; } // pinch (vertical) zooms + midpoint pans, together; minute-anchored so the exact time under your fingers stays put at every zoom level (David 2026-06-26)
        if (single && swPgr && pullZoom === "day") { if (document.querySelector(".calblk.dragging")) { swPgr = null; return; } /* a bubble is being dragged (long-press) → the page must NOT also swipe to prev/next day at the same time (David 2026-06-27) */ if (Object.keys(ptrs).length >= 2) { swPgr = null; return; } var dx = e.clientX - sX, dy = e.clientY - sY;
          if (swOn) { swPrevX = swLastX; swLastX = e.clientX; e.preventDefault(); swPgr.style.transform = "translateX(" + (-33.3333 + (dx / swW) * (100 / 3)) + "%)"; setStripSel((Math.abs(dx) > swW * 0.33) ? keyAdd(pullFocusK || todayK(), dx < 0 ? 1 : -1) : (pullFocusK || todayK())); return; } // horizontal swipe follows the finger AND the week-strip highlight moves LIVE to the day you're heading toward (David 2026-06-26); track finger motion so a flick at release pages the way it's ACTUALLY moving
          if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.4) { swOn = true; swPrevX = swLastX = e.clientX; swPgr.style.transition = "none"; e.preventDefault(); return; } // commit to a horizontal page
          if (Math.abs(dy) > 10) { swPgr = null; return; } // a vertical drag is just the continuous scroll → let native scroll own it
        }
      }, { passive: false });
      function gend(e) {
        var wasPinch = !single && pVD0 > 0, ex = e.clientX; delete ptrs[e.pointerId]; var n = Object.keys(ptrs).length;
        if (wasPinch && n < 2 && pullZoom === "day") { if (_zoomRaf) { cancelAnimationFrame(_zoomRaf); _zoomRaf = 0; relayoutHourPx(_zoomPending || pHPLast, _zoomAnchor, _zoomScroll); } pVD0 = 0; single = false; _pinching = 0; _zoomEndedAt = Date.now(); pullHourPx = pHPLast; zoomCommit(); return; } // settle: crisp re-render at the final zoom, keeping the panned scroll. FAST-RELEASE JUMP FIX (David 2026-06-27): a quick pinch ends with the final throttled frame still PENDING — cancelling it left the DOM at the previous frame's zoom while commit preserved that stale scrollTop. Now we apply that final frame synchronously (re-anchoring scrollTop to the minute under the fingers) BEFORE committing, so release never jumps.
        if (single && n === 0 && pullZoom === "day") {
          var dx = (swLastX || ex) - sX, flick = swLastX - swPrevX;
          if (swOn && swPgr) { var th = swW * 0.2, dir = 0; if (Math.abs(flick) > 8) dir = (flick < 0 ? 1 : -1); else if (dx < -th) dir = 1; else if (dx > th) dir = -1; if (dir) pageSlide(dir); else { swPgr.style.transition = "transform .2s"; swPgr.style.transform = "translateX(-33.3333%)"; setStripSel(pullFocusK || todayK()); } } // a real flick at release wins over net displacement → a fast swipe pages the way the finger is ACTUALLY moving, never the opposite (David 2026-06-27)
          swOn = false; swPgr = null; single = false;
        }
      }
      pb.addEventListener("pointerup", gend); pb.addEventListener("pointercancel", gend);
      pb.addEventListener("touchmove", function (e) { if (_pinching || e.touches.length >= 2) e.preventDefault(); }, { passive: false }); // a 2-finger gesture is OURS (pinch+pan) — block the browser's native 2-finger scroll so it can't fight the handler (bubbles are touch-action:pan-y, which otherwise lets native 2-finger scroll run at the same time = the jumpy/wrong scroll when both thumbs are on bubbles) — David 2026-06-27
    }
  }
  function findToday() { // "find yourself" in week/month: smooth-scroll back to the current page — David 2026-06-24
    var pb = el("pullBody"); if (!pb) return;
    var wsc = pb.querySelector(".week-scroller"); if (wsc) { var wp = wsc.querySelector(".week-page.now"); if (wp) wsc.scrollTo({ left: wp.offsetLeft, behavior: "smooth" }); return; }
    var mp = pb.querySelector(".month-page.now"); if (mp) pb.scrollTo({ top: mp.offsetTop, behavior: "smooth" });
  }
  function openPull() { pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; buildPull(); var ps = el("pullSheet"), bd = el("pullBackdrop"); if (ps) { ps.style.transition = ""; ps.classList.add("on"); ps.style.transform = ""; } if (bd) { bd.style.transition = ""; bd.classList.add("on"); bd.style.opacity = ""; } }
  function closePull() { if (_zoomRaf) { cancelAnimationFrame(_zoomRaf); _zoomRaf = 0; } var _pb = el("pullBody"); if (_pb) _pb.classList.remove("zooming"); var ps = el("pullSheet"), bd = el("pullBackdrop"); if (ps) { ps.style.transition = ""; ps.classList.remove("on"); ps.style.transform = ""; } if (bd) { bd.style.transition = ""; bd.classList.remove("on"); bd.style.opacity = ""; } } // closing mid-pinch must not leave transitions frozen (David 2026-06-25)
  function fillTestDay() { // DEV: a realistic MIXED day — 3 truly-adjacent matched (a streak), a skipped miss, a drift, live + future (David 2026-06-25)
    pushUndo();
    var k = todayK(), now = logicalNowMin(), CATR = { move: "energy", focus: "work", play: "hobby", connect: "love", create: "art", nourish: "food", restore: "rest" };
    function ts(m) { m = Math.max(0, Math.min(1799, Math.round(m))); return pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    var bl = [], lg = [];
    function plan(d, t, start, mins, done) { var D = DOM[d]; bl.push({ id: uid(), time: ts(start), mins: mins, title: t, domain: d, color: D.c, prio: 2, done: !!done }); }
    function real(d, t, start, mins) { var D = DOM[d]; lg.push({ id: uid(), time: ts(start), mins: mins, title: t, catK: CATR[d] || null, color: D.c, domain: d }); }
    function matched(d, t, start, mins) { plan(d, t, start, mins, true); real(d, t, start, mins); }
    var cur = Math.max(wakeHour() * 60, now - 300); // keep the demo's past run inside your wake→bed window (David 2026-06-26)
    // 3 TRULY ADJACENT matched activities, edge-to-edge (any kind counts) = a real streak of 3
    matched("move", "Workout", cur, 45); cur += 45;
    matched("nourish", "Breakfast", cur, 30); cur += 30;
    matched("focus", "Deep work", cur, 60); cur += 60;
    // PARTIAL — planned 60 of "Project work", did 25 then drifted: the matched 25min shines, the rest splits to ghost-plan | drift
    plan("focus", "Project work", cur, 60, false); real("focus", "Project work", cur, 25); real("drift", "Scroll", cur + 25, 30); cur += 60;
    // MISS — planned but skipped → dark ghost
    plan("play", "Read", cur, 30, false); cur += 35;
    real("nourish", "Coffee", cur, 8); cur += 18; // a quick standalone log → thin full-width line + name beside it
    real("connect", "Quick text", now - 60, 2); // a quick log sitting clear ABOVE the straddling Focus block (not jammed against the now-line — David 2026-06-25)
    // LIVE, straddling now, on plan — ~40 min into a 90-min block so the charging battery is clearly half-full
    plan("focus", "Focus block", now - 50, 90, false); // planned 50 min ago; you started tracking 30 min ago → first 20 min ghost, last 30 charged
    // FUTURE (matte)
    plan("create", "Make art", now + 80, 60, false);
    plan("move", "Evening walk", now + 170, 45, false);
    S.blocks[k] = bl; S.log[k] = lg;
    S.timers = []; // NO tracking in the test → the straddling Focus block reads ghost-past (failed) + matte-future, split by the present line (David 2026-06-25)
    S.game = S.game || {}; S.game.streak = 3; S.game.streakDay = k;
    save(); pullFocusK = todayK(); pendingScrollNow = true; renderAll(); buildPull(); setTimeout(scrollToNow, 70); toast("🧪 test day — streak ×3 · a miss · a drift · live · future"); // land ON the now-line, not thrown away from the present (David 2026-06-27)
  }
  function renderLiveDock() { // the pull-up live-tracker panel (Today only, while tracking) — David 2026-06-25
    var dk = el("liveDock"); if (!dk) return;
    var run = activeTimers(), t = run[run.length - 1];
    var ad = el("ldAct"), su = el("ldSub"), elx = el("ldEl"), st = el("ldStop");
    var nb0 = nextPlannedBlock(todayK());
    dk.classList.add("on"); dk.classList.toggle("noplan", !nb0); // no plan today → only Plan + Drift make sense (Replan hidden — nothing to re-plan) — David 2026-06-25
    if (!t) { // IDLE — nothing tracking: the dock is a "start" bar
      dk.classList.add("idle"); dk.classList.toggle("hasplan", !!nb0); // Play IS "start the plan" → the separate Plan button is redundant and hidden (David 2026-06-26)
      if (nb0) { var _pD = DOM[domainOf(nb0)] || DOM.focus; if (st) { st.innerHTML = '<i class="ti ti-player-play-filled"></i>'; st.style.setProperty("background", _pD.c, "important"); st.style.setProperty("color", _pD.ink, "important"); } if (ad) ad.innerHTML = tiIcon(nb0) + ' <b>' + esc(nb0.title) + '</b>'; if (su) su.textContent = "▶ start your plan"; } // the play button wears the upcoming activity's colour; pressing it = you agree to do the plan and start tracking it
      else { if (st) { st.innerHTML = '<i class="ti ti-player-play"></i>'; st.style.removeProperty("background"); st.style.removeProperty("color"); } if (ad) ad.innerHTML = '<i class="ti ti-clock"></i> Not tracking'; if (su) su.textContent = "tap ▶ or pick below to start"; }
      if (elx) { elx.textContent = ""; elx.removeAttribute("data-tid"); }
    } else {
      dk.classList.remove("idle"); dk.classList.remove("hasplan"); if (st) { st.innerHTML = '<i class="ti ti-player-stop"></i>'; st.style.removeProperty("background"); st.style.removeProperty("color"); }
      var dom = domainOf(t), D = DOM[dom] || DOM.focus, drift = (dom === "drift");
      var d0 = new Date(t.start), s0 = d0.getHours() * 60 + d0.getMinutes(), e0 = nowMin(), on = false;
      if (!drift) blocks(todayK()).forEach(function (b) { var bs = hm(b.time), be = bs + (b.mins || 30); if (s0 < be && e0 > bs && domainOf(b) === dom) on = true; });
      var badge = on ? '<span style="font-size:8px;font-weight:700;color:' + D.ink + ';background:' + D.c + ';border:1.5px solid #160510;border-radius:9px;padding:1px 6px">ON PLAN</span>' : (drift ? '<span style="font-size:8px;font-weight:700;color:#ece6f2;background:' + DOM.drift.c + ';border:1.5px solid #160510;border-radius:9px;padding:1px 6px">DRIFT</span>' : '');
      if (ad) ad.innerHTML = tiIcon(t) + ' ' + esc(t.title || "Tracking") + ' ' + badge;
      if (su) su.textContent = on ? "matches your plan" : (drift ? "off plan — logged honestly" : "tracking · no plan");
      if (elx) { elx.setAttribute("data-tid", t.id); elx.textContent = elapsedStr(t); }
    }
    if (!dk._wired) { dk._wired = 1;
      el("ldStop").onclick = function () { var r = activeTimers(); if (r.length) { stopTimer(r[r.length - 1].id); } else { var nb = nextPlannedBlock(todayK()); if (nb) startPlanned(nb); else startOrSwitch(); } }; // Play = start the plan (sync up + track it); no plan → pick one — David 2026-06-26
      el("ldSw").onclick = function () { startOrSwitch(); };
      el("ldPlan").onclick = function () { var nb = nextPlannedBlock(todayK()); if (nb) startPlanned(nb); else startOrSwitch(); };
      el("ldReplan").onclick = function () { planBreak(); };
      el("ldDrift").onclick = function () { startOrSwitch(); };
      var _info = dk.querySelector(".ld-info"), _grab = dk.querySelector(".ld-grab"); // tap the dock body/handle → expand to the full RING tracker (David 2026-06-27)
      if (_info) _info.onclick = function () { openTrackerFull(); };
      if (_grab) _grab.onclick = function () { openTrackerFull(); };
      var _tx = el("tfClose"); if (_tx) _tx.onclick = function () { closeTrackerFull(); };
    }
    if (TF_OPEN) renderTrackerFull(); // keep the expanded ring in sync whenever the dock re-renders
  }
  function renderLiveTracker() {
    var lt = el("liveTracker"), lb = el("ltLabel"), lh = el("ltHint"); renderLiveDock(); if (!lt || !lb) return;
    document.body.classList.add("tracker");
    var run = activeTimers(), t = run[run.length - 1];
    if (t) { var D = DOM[domainOf(t)]; lb.innerHTML = '<i class="ti ti-player-play-filled" style="color:' + D.c + '"></i> ' + esc(t.title || "Tracking") + ' · ' + liveSpan(t); lt.classList.add("live"); } // dark strip (matches the pull-down for one consistent color); the activity shows in the icon's color
    else { lb.innerHTML = '<i class="ti ti-clock"></i> What are you doing now?'; lt.classList.remove("live"); }
    if (lh) lh.innerHTML = '<i class="ti ti-chevron-down"></i>'; // just a chevron signifier — clear it's pullable, no text (David 2026-06-24)
    if (!lt._wired) { lt._wired = 1;
      // SMOOTH pull-down (David 2026-06-23): drag the strip down to reveal today — finger-follow, consistent color, never forces a habit choice.
      lt.addEventListener("pointerdown", function (ev) {
        var sy = ev.clientY, sx = ev.clientX, moved = false, ps = el("pullSheet"), bd = el("pullBackdrop");
        pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; buildPull(); if (ps) ps.style.transition = "none"; if (bd) bd.style.transition = "none";
        var H = (ps && ps.offsetHeight) || Math.round(window.innerHeight * 0.9);
        function mv(e) { if (!moved && (Math.abs(e.clientY - sy) > 4 || Math.abs(e.clientX - sx) > 4)) moved = true; if (moved && ps) { var bottom = Math.max(0, Math.min(H, e.clientY)); ps.style.transform = "translateY(" + ((bottom - H) / H * 100) + "%)"; if (bd) { bd.classList.add("on"); bd.style.opacity = Math.max(0, Math.min(0.82, bottom / H * 0.82)); } } } // sheet's bottom edge tracks the finger 1:1 (smooth)
        function up(e) { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); if (ps) ps.style.transition = ""; if (bd) bd.style.transition = ""; if (!moved) { if (ps && ps.classList.contains("on")) closePull(); else openPull(); return; } if (e.clientY > H * 0.35 && ps) { ps.classList.add("on"); ps.style.transform = ""; if (bd) { bd.classList.add("on"); bd.style.opacity = ""; } } else { closePull(); } } // tap = TOGGLE the journal (open if closed, close if open); pull past 35% → reveal — David 2026-06-24
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      });
      var bd = el("pullBackdrop"); if (bd) bd.addEventListener("click", closePull);
      var pg = el("pullGrab"); if (pg) pg.addEventListener("pointerdown", function (ev) { ev.preventDefault(); var sy = ev.clientY, ps = el("pullSheet"), bd2 = el("pullBackdrop"), H = (ps && ps.offsetHeight) || 600, moved = false; if (ps) ps.style.transition = "none"; if (bd2) bd2.style.transition = "none"; function mv(e) { var dy = e.clientY - sy; if (Math.abs(dy) > 3) moved = true; var fr = Math.max(0, Math.min(1, -dy / H)); if (ps) ps.style.transform = "translateY(" + (-fr * 100) + "%)"; if (bd2) bd2.style.opacity = String(0.82 * (1 - fr)); } function up(e) { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); if (ps) ps.style.transition = ""; if (bd2) bd2.style.transition = ""; var dy = e.clientY - sy; if (!moved || -dy > H * 0.28) closePull(); else { if (ps) { ps.classList.add("on"); ps.style.transform = ""; } if (bd2) bd2.style.opacity = ""; } } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }); // drag the bottom handle UP to close — same smooth finger-follow (David 2026-06-24)
    }
  }
  // ===== EXPANDED LIVE TRACKER — the reward RING (David 2026-06-27) =====
  // circle-in-circle: a colored activity DISC (the "album", channel 1 = WHAT) inside a radial reward RING (channel 2 = the verdict:
  // green on-plan, gold declared-break, dim off-plan). NOT square-in-circle, NOT the rejected crystal/diamond.
  var TF_OPEN = false;
  function openTrackerFull() { var tf = el("trackerFull"); if (!tf) return; TF_OPEN = true; renderTrackerFull(); tf.classList.add("on"); }
  function closeTrackerFull() { var tf = el("trackerFull"); if (!tf) return; TF_OPEN = false; tf.classList.remove("on"); }
  function trackerState() { // derive the matrix state from live data (S1 on-plan / S4 off-plan / S6 idle; break+reconcile come next)
    var run = activeTimers(), t = run[run.length - 1];
    if (!t) return { id: "idle", t: null };
    var dom = domainOf(t); if (dom === "drift") return { id: "off", t: t, dom: dom, drift: true };
    var d0 = new Date(t.start), s0 = d0.getHours() * 60 + d0.getMinutes(), e0 = nowMin(), onb = null;
    blocks(todayK()).forEach(function (b) { var bs = hm(b.time), be = bs + (b.mins || 30); if (s0 < be && e0 > bs && domainOf(b) === dom && !b.done) onb = b; });
    return { id: onb ? "onplan" : "off", t: t, dom: dom, block: onb };
  }
  function tfStripe(C) { return "repeating-linear-gradient(45deg," + C + "," + C + " 9px," + mixHex(C, "#160510", 0.42) + " 9px," + mixHex(C, "#160510", 0.42) + " 18px)"; } // vivid striped activity tile (matches the timeline-bubble texture, brighter for the hero)
  function nextUpBlock(afterMin) { var best = null; blocks(todayK()).forEach(function (b) { if (!b.title) return; var bs = hm(b.time); if (bs >= afterMin && blockStatus(todayK(), b) === "plan") { if (!best || bs < hm(best.time)) best = b; } }); return best; } // the next still-to-do planned block after a given minute → the "what's next" pointer
  function setTFNext(afterMin) { var nx = el("tfNext"); if (!nx) return; var nu = nextUpBlock(afterMin); if (nu) { nx.style.display = ""; nx.innerHTML = '<i class="ti ti-arrow-right"></i> next <b>' + esc(nu.title) + '</b> · ' + fmt(hm(nu.time)); nx.onclick = function () { startPlanned(nu); renderTrackerFull(); }; } else { nx.style.display = "none"; nx.onclick = null; } }
  function tfDomMinsToday(dom) { var s = 0; (logs(todayK()) || []).forEach(function (l) { if (!dom || domainOf(l) === dom) s += (l.mins || 0); }); return s; } // minutes logged today (optionally for one domain) — the "accumulation" glance
  function tfSwitchTargets(curTitle) { var ct = (curTitle || "").toLowerCase(), used = {}, res = []; used[ct] = 1; // upcoming planned blocks first (jump-ahead), then recent distinct logged activities (resume)
    blocks(todayK()).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { if (res.length >= 3 || !b.title) return; if (blockStatus(todayK(), b) !== "plan" || hm(b.time) < nowMin() - 5) return; var k = b.title.toLowerCase(); if (used[k]) return; used[k] = 1; res.push({ title: b.title, dom: domainOf(b), block: b }); });
    (logs(todayK()) || []).slice().reverse().forEach(function (l) { if (res.length >= 3 || !l.title) return; var k = l.title.toLowerCase(); if (used[k]) return; used[k] = 1; res.push({ title: l.title, dom: domainOf(l), act: l }); });
    return res;
  }
  function tfSwitchTo(item) { activeTimers().forEach(function (rt) { stopTimer(rt.id); }); if (item.block) { startPlanned(item.block); } else { startTimer({ title: item.title, catK: (item.act && item.act.catK) || null, color: (DOM[item.dom] || DOM.focus).c }); var r = activeTimers(); if (r.length) maybeCelebrateTrack(r[r.length - 1]); renderLiveTracker(); renderToday(); } renderTrackerFull(); }
  function renderSwitchChips(curTitle) { var w = el("tfSwitch"); if (!w) return; w.innerHTML = ""; var tg = tfSwitchTargets(curTitle); if (!tg.length) { w.style.display = "none"; return; } w.style.display = ""; add(w, "span", "tf-swlab", "SWITCH TO"); tg.forEach(function (o) { var D = DOM[o.dom] || DOM.focus, c = add(w, "button", "tf-chip"); c.innerHTML = '<i class="ti ' + (o.block ? tiClass(o.block) : (o.act ? tiClass(o.act) : D.ti)) + '" style="color:' + D.light + '"></i> ' + esc(o.title); c.onclick = (function (it) { return function () { tfSwitchTo(it); }; })(o); }); }
  function renderTrackerFull() {
    var tf = el("trackerFull"); if (!tf || !TF_OPEN) return;
    var _ck = el("tfClock"); if (_ck) _ck.textContent = fmt(nowMin()).toUpperCase(); // current wall-clock time
    var S0 = trackerState(), t = S0.t, tile = el("tfTile"), streak = (S.game && S.game.streak) || 0;
    tf.classList.remove("st-onplan", "st-break", "st-off", "st-idle");
    if (!t) { tf.classList.add("st-idle"); var nb = nextPlannedBlock(todayK()); var ND = nb ? (DOM[domainOf(nb)] || DOM.focus) : DOM.focus;
      el("tfTitle").textContent = nb ? nb.title : "Nothing tracking";
      el("tfVerdict").textContent = nb ? "ready when you are" : "";
      el("tfTime").textContent = nb ? fmt(hm(nb.time)) : "—"; el("tfTime").removeAttribute("data-tid");
      el("tfCtx").textContent = nb ? ("planned " + dur(nb.mins || 30)) : "tap Start to begin tracking";
      el("tfSpark").innerHTML = '🔥 <b>×' + streak + '</b> · ⏱ <b>' + dur(tfDomMinsToday(null)) + '</b>';
      if (tile) { tile.style.background = tfStripe(ND.c); tile.style.filter = "saturate(.5) brightness(.78)"; tile.innerHTML = '<i class="ti ' + (nb ? tiClass(nb) : "ti-clock") + '"></i>'; }
      setRing(0, "#6a5870"); setTFNext(nb ? (hm(nb.time) + (nb.mins || 30)) : nowMin()); renderSwitchChips(""); renderTFControls("idle");
      return;
    }
    var D = DOM[S0.dom] || DOM.focus, drift = !!S0.drift, onplan = S0.id === "onplan";
    tf.classList.add(onplan ? "st-onplan" : "st-off");
    if (tile) { tile.style.background = tfStripe(D.c); tile.style.filter = ""; tile.innerHTML = tiIcon(t); }
    el("tfTitle").textContent = t.title || "Tracking";
    el("tfVerdict").textContent = onplan ? "on plan · winning" : (drift ? "drifting" : "off plan");
    el("tfTime").setAttribute("data-tid", t.id); el("tfTime").textContent = elapsedStr(t);
    // context = pacing: how long is left in the planned block, and when it ends
    if (S0.block) { var bs = hm(S0.block.time), be = bs + (S0.block.mins || 30), rem = be - nowMin(); el("tfCtx").textContent = (rem > 0 ? rem + "m left" : "over by " + (-rem) + "m") + " · ends " + fmt(be); }
    else el("tfCtx").textContent = drift ? "off your plan" : "no plan — free tracking";
    var elMin = (Date.now() - t.start) / 60000, target = (S0.block && S0.block.mins) || 60, p = Math.max(0, Math.min(1, elMin / target));
    var onAct = tfDomMinsToday(S0.dom) + Math.round(elMin);
    el("tfSpark").innerHTML = '🔥 <b>×' + streak + '</b> · ⏱ <b>' + dur(onAct) + '</b>';
    setRing(p, onplan ? "#28cf86" : "#6a5870");
    setTFNext(S0.block ? (hm(S0.block.time) + (S0.block.mins || 30)) : nowMin());
    renderSwitchChips(t.title);
    renderTFControls(onplan ? "onplan" : "off");
  }
  function setRing(p, col) { var ring = el("tfRing"); if (!ring) return; var pct = Math.max(0, Math.min(100, Math.round(p * 100))); ring.style.background = "conic-gradient(" + (col || "#28cf86") + " 0% " + pct + "%, rgba(255,255,255,.10) " + pct + "% 100%)"; } // flat green/grey conic band — no glow (David's no-neon rule); fills clockwise with elapsed
  function tfDone() { var run = activeTimers(); if (run.length) stopTimer(run[run.length - 1].id); closeTrackerFull(); } // finish the activity → logs it + fires the on-plan reward (stopTimer), then drop back to the day
  function renderTFControls(state) { var c = el("tfCtrls"); if (!c) return; c.innerHTML = "";
    function prim(ic, lab, fn) { var x = add(c, "button", "tf-b tf-done"); x.innerHTML = '<i class="ti ' + ic + '"></i>' + lab; x.onclick = fn; return x; }
    function b(r, ic, lab, fn) { var x = add(r, "button", "tf-b"); x.innerHTML = '<i class="ti ' + ic + '"></i>' + lab; x.onclick = fn; return x; }
    var r = function () { return add(c, "div", "tf-row"); };
    if (state === "idle") { prim("ti-player-play-filled", "Start", function () { var n = nextPlannedBlock(todayK()); if (n) startPlanned(n); else startOrSwitch(); renderTrackerFull(); }); var r0 = r(); b(r0, "ti-list-search", "Pick something", function () { startOrSwitch(); renderTrackerFull(); }); return; }
    if (state === "onplan") { prim("ti-circle-check", "Done", tfDone); var r1 = r(); b(r1, "ti-player-pause", "Pause", function () { planBreak(); }); b(r1, "ti-switch-horizontal", "Switch", function () { startOrSwitch(); renderTrackerFull(); }); b(r1, "ti-windmill", "Off-plan", function () { startOrSwitch(); renderTrackerFull(); }); return; }
    prim("ti-arrow-back-up", "Back on plan", function () { var n = nextPlannedBlock(todayK()); if (n) startPlanned(n); else startOrSwitch(); renderTrackerFull(); }); var r2 = r(); b(r2, "ti-check", "Keep it", function () { startOrSwitch(); renderTrackerFull(); }); b(r2, "ti-switch-horizontal", "Switch", function () { startOrSwitch(); renderTrackerFull(); }); b(r2, "ti-player-stop", "Stop", tfDone);
  }
  // ---- ONBOARDING (mockups 041/043, §8): guardian → vibe → gender+age → life-stage → prefill bento → goals → rhythm → world born ----
  var LIFESTAGES = [
    { k: "student", l: "Student", ti: "ti-backpack", c: "#36b3f0", occ: "student" }, { k: "parent", l: "Parent", ti: "ti-baby-carriage", c: "#ff5fa0", occ: "other" },
    { k: "founder", l: "Founder", ti: "ti-rocket", c: "#b07aff", occ: "founder" }, { k: "employee", l: "9-to-5 job", ti: "ti-briefcase", c: "#7f9bc4", occ: "office" },
    { k: "freelancer", l: "Freelancer", ti: "ti-device-laptop", c: "#34d39a", occ: "dev" }, { k: "creative", l: "Creative", ti: "ti-palette", c: "#ffc83d", occ: "artist" },
    { k: "developer", l: "Developer", ti: "ti-code", c: "#36b3f0", occ: "dev" }, { k: "writer", l: "Writer", ti: "ti-pencil", c: "#b07aff", occ: "writer" },
    { k: "caregiver", l: "Caregiver", ti: "ti-heart-handshake", c: "#2ab8c4", occ: "other" }, { k: "manager", l: "Manager", ti: "ti-users", c: "#7f9bc4", occ: "office" },
    { k: "teacher", l: "Teacher", ti: "ti-school", c: "#34d39a", occ: "office" }, { k: "healthcare", l: "Healthcare", ti: "ti-stethoscope", c: "#ff5fa0", occ: "office" },
    { k: "sales", l: "Sales / Biz", ti: "ti-trending-up", c: "#ff8a3a", occ: "founder" }, { k: "service", l: "Service / Hospitality", ti: "ti-coffee", c: "#ff8a3a", occ: "office" },
    { k: "trades", l: "Trades / Hands-on", ti: "ti-tools", c: "#7f9bc4", occ: "office" }, { k: "athlete", l: "Athlete", ti: "ti-run", c: "#ff8a3a", occ: "other" },
    { k: "musician", l: "Musician", ti: "ti-music", c: "#b07aff", occ: "artist" }, { k: "jobseeker", l: "Job-seeking", ti: "ti-search", c: "#ffc83d", occ: "other" },
    { k: "remote", l: "Remote worker", ti: "ti-home", c: "#34d39a", occ: "dev" }, { k: "retired", l: "Retired", ti: "ti-umbrella", c: "#2ab8c4", occ: "other" },
    { k: "homemaker", l: "Homemaker", ti: "ti-home-cog", c: "#ff5fa0", occ: "other" }, { k: "figuring", l: "Figuring it out", ti: "ti-compass", c: "#ff8a3a", occ: "other" }
  ];
  var VIBES2 = [ { k: "thriving", l: "Thriving", ti: "ti-flame", c: "#34d39a" }, { k: "coasting", l: "Coasting", ti: "ti-windmill", c: "#ffc83d" }, { k: "stuck", l: "Stuck", ti: "ti-anchor", c: "#7f9bc4" }, { k: "overwhelmed", l: "Overwhelmed", ti: "ti-urgent", c: "#c4607f" } ];
  var GOAL_SEED = [ { l: "Make art", d: "create", ti: "ti-palette" }, { l: "Grow my business", d: "focus", ti: "ti-briefcase" }, { l: "Get fit", d: "move", ti: "ti-barbell" }, { l: "Learn a skill", d: "create", ti: "ti-bulb" }, { l: "Read more", d: "play", ti: "ti-book" }, { l: "Save money", d: "focus", ti: "ti-coin" }, { l: "Sleep better", d: "restore", ti: "ti-moon" }, { l: "Find love", d: "connect", ti: "ti-heart" }, { l: "Eat healthier", d: "nourish", ti: "ti-apple" }, { l: "Quit a bad habit", d: "drift", ti: "ti-ban" }, { l: "Grow my audience", d: "create", ti: "ti-users" }, { l: "Feel calmer", d: "restore", ti: "ti-wind" } ];
  var EXTRAS2 = ["Get coffee", "Snack", "Water", "Stretch", "Text back", "Tidy 5m", "Vitamins", "Skincare"];
  function stageSuggest(age) { return (age === "teens" || age === "20s") ? "student" : age === "30s" ? "founder" : (age === "40s" || age === "50s") ? "employee" : "figuring"; }
  var STAGE_BASE = { move: ["Walk", "Gym"], nourish: ["Breakfast", "Lunch", "Cook"], connect: ["Call", "Friends"], play: ["Read"], restore: ["Sleep", "Meditate"], upkeep: ["Shower", "Tidy"] };
  var STAGE_EXTRA = {
    student: [["Study", "focus"], ["Deep work", "focus"], ["Assignment", "focus"], ["Group work", "connect"]],
    parent: [["Family", "connect"], ["Play with kids", "connect"], ["Meal prep", "nourish"], ["Errands", "upkeep"], ["Laundry", "upkeep"]],
    founder: [["Deep work", "focus"], ["Claude code", "focus"], ["Outreach", "focus"], ["Plan", "focus"]],
    employee: [["Deep work", "focus"], ["Meetings", "focus"], ["Email", "focus"], ["Commute", "upkeep"]],
    freelancer: [["Deep work", "focus"], ["Programming", "focus"], ["Invoice", "focus"], ["Outreach", "focus"]],
    creative: [["Draw", "create"], ["Paint", "create"], ["Make art", "create"], ["Design", "create"]],
    developer: [["Code", "focus"], ["Claude code", "focus"], ["Debug", "focus"], ["Programming", "focus"]],
    writer: [["Writing", "create"], ["Research", "focus"], ["Edit", "create"]],
    caregiver: [["Help", "connect"], ["Errands", "upkeep"], ["Appointments", "upkeep"], ["Journal", "restore"]],
    manager: [["Meetings", "focus"], ["Email", "focus"], ["Plan", "focus"], ["Calls", "connect"]],
    teacher: [["Lesson plan", "focus"], ["Grade", "focus"], ["Teach", "connect"]],
    healthcare: [["Shift", "focus"], ["Patients", "connect"], ["Notes", "focus"]],
    sales: [["Outreach", "focus"], ["Calls", "connect"], ["Close deal", "focus"]],
    service: [["Shift", "focus"], ["Customers", "connect"]],
    trades: [["Job site", "focus"], ["Build", "create"], ["Tools", "upkeep"]],
    athlete: [["Train", "move"], ["Gym", "move"], ["Recovery", "restore"], ["Stretch", "move"]],
    musician: [["Practice", "create"], ["Make music", "create"], ["Perform", "create"]],
    jobseeker: [["Apply", "focus"], ["Network", "connect"], ["Study", "focus"]],
    remote: [["Deep work", "focus"], ["Meetings", "focus"], ["Email", "focus"]],
    retired: [["Walk", "move"], ["Garden", "play"], ["Hobby", "play"]],
    homemaker: [["Meal prep", "nourish"], ["Clean", "upkeep"], ["Laundry", "upkeep"], ["Errands", "upkeep"]],
    figuring: [["Journal", "restore"], ["Explore", "play"], ["Study", "focus"]]
  };
  function onboard() {
    var data = { gender: "", age: "", vibe: "", stages: {}, customStages: [], kept: {}, _pref: "", goals: {}, wake: "7–8", bed: "11–12", peak: "lark" };
    var step = 0, STEPS = 8;
    var ov = add(document.body, "div", "ob-ov"), card = add(ov, "div", "ob-card");
    var bar = add(card, "div", "ob-bar"), barF = add(bar, "i");
    var body = add(card, "div", "ob-body"), foot = add(card, "div", "ob-foot");
    function chip(p, label, on, color, ink) { var s = add(p, "span", "ob-ch" + (on ? " on" : "")); if (color) { s.style.background = on ? color : mixDark(color); s.style.color = on ? (ink || "#160510") : color; } s.innerHTML = label; return s; }
    function keys(o) { return Object.keys(o).filter(function (k) { return o[k]; }); }
    function seedKept() { data.kept = {}; for (var d in STAGE_BASE) STAGE_BASE[d].forEach(function (t) { data.kept[t] = true; }); keys(data.stages).forEach(function (sk) { (STAGE_EXTRA[sk] || []).forEach(function (a) { data.kept[a[0]] = true; }); var st = LIFESTAGES.filter(function (x) { return x.k === sk; })[0]; if (st) { var o = OCC_BY_K[st.occ]; if (o && o.work) o.work.forEach(function (g) { g.tasks.slice(0, 3).forEach(function (t) { data.kept[t.l] = true; }); }); } }); }
    function typeRow(placeholder, onAdd) { add(body, "div", "ob-lbl", "✦ MISSING SOMETHING? TYPE IT"); var arow = add(body, "div", "ob-addrow"); var inp = document.createElement("input"); inp.className = "ob-input"; inp.placeholder = placeholder; arow.appendChild(inp); var ab = add(arow, "button", "ob-addbtn"); ab.innerHTML = '<i class="ti ti-plus"></i> add'; ab.onclick = function () { var v = inp.value.trim(); if (!v) { inp.focus(); return; } onAdd(v); draw(); }; inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ab.onclick(); }); }
    function next() { if (step < STEPS - 1) { step++; draw(); } else finish(); }
    function finish() {
      S.profile = S.profile || {}; var P = S.profile;
      var sel = keys(data.stages).map(function (k) { return LIFESTAGES.filter(function (x) { return x.k === k; })[0]; }).filter(Boolean);
      P.gender = data.gender; P.age = data.age; P.vibe = data.vibe; P.stages = keys(data.stages); P.occ = sel.length ? sel[0].occ : "other";
      P.goals = keys(data.goals).join(", "); P.wake = data.wake; P.sleep = data.bed; P.peak = data.peak; P.lark = (data.peak !== "owl"); P.set = true;
      S.acts = S.acts || []; keys(data.kept).forEach(function (t) { if (!TITLE2CAT[t.toLowerCase()] && !S.acts.filter(function (a) { return a.title === t; })[0]) S.acts.push({ title: t, catK: null, domain: domainOf({ title: t }) }); });
      S.goals = keys(data.goals).map(function (g) { var seed = GOAL_SEED.filter(function (x) { return x.l === g; })[0]; return { title: g, domain: seed ? seed.d : "focus", subtasks: [] }; });
      save(); ov.remove(); renderAll(); viewK = todayK(); zoomMode = "day"; var d = document.querySelector('#nav .nb[data-tab="day"]'); if (d) d.click(); toast("✨ Your world is ready — plan your first day");
    }
    function draw() {
      barF.style.width = Math.round((step + 1) / STEPS * 100) + "%"; body.innerHTML = ""; foot.innerHTML = "";
      body.className = (step === 0 || step === 7) ? "ob-body center" : "ob-body";
      if (step === 0) { add(body, "i", "ti ti-sparkles ob-spk"); var f = add(body, "div", "ob-face"); add(f, "span", "ob-eye l"); add(f, "span", "ob-eye r"); add(body, "div", "ob-q", "Hi, I'm Sage."); add(body, "div", "ob-sb", "your guardian. I'll help you become who you want to be — one day at a time."); }
      if (step === 1) { add(body, "div", "ob-q", "How's life feeling?"); add(body, "div", "ob-sb", "no wrong answer"); var col = add(body, "div", "ob-col"); VIBES2.forEach(function (v) { var c = chip(col, '<i class="ti ' + v.ti + '"></i> ' + v.l, data.vibe === v.k, v.c, "#160510"); c.onclick = function () { data.vibe = v.k; draw(); }; }); }
      if (step === 2) { add(body, "div", "ob-q", "A little about you"); add(body, "div", "ob-sb", "helps me suggest a starting point"); add(body, "div", "ob-lbl", "YOU ARE"); var gr = add(body, "div", "ob-row"); [["f", "she"], ["m", "he"], ["o", "they"], ["", "skip"]].forEach(function (g) { var c = chip(gr, g[1], data.gender === g[0]); c.onclick = function () { data.gender = g[0]; draw(); }; }); add(body, "div", "ob-lbl", "AGE"); var ar = add(body, "div", "ob-row"); ["teens", "20s", "30s", "40s", "50s", "60+"].forEach(function (a) { var c = chip(ar, a, data.age === a); c.onclick = function () { data.age = a; if (!keys(data.stages).length) data.stages[stageSuggest(a)] = true; draw(); }; }); }
      if (step === 3) { add(body, "div", "ob-q", "What's your life like?"); add(body, "div", "ob-sb", "pick ALL that fit — you can be more than one (parent + worker…) · or type your own"); if (!keys(data.stages).length && data.age) data.stages[stageSuggest(data.age)] = true; var gr = add(body, "div", "ob-row"); LIFESTAGES.forEach(function (s) { var on = data.stages[s.k], c = chip(gr, '<i class="ti ' + s.ti + '"></i> ' + s.l + (on ? ' ✓' : ''), on, s.c, "#160510"); c.onclick = function () { data.stages[s.k] = !data.stages[s.k]; draw(); }; }); (data.customStages || []).forEach(function (v) { var ck = "custom:" + v, on = data.stages[ck], c = chip(gr, '<i class="ti ti-user"></i> ' + esc(v) + (on ? ' ✓' : ''), on, "#ff8a3a", "#4a2400"); c.onclick = function () { data.stages[ck] = !data.stages[ck]; draw(); }; }); typeRow("your role / situation…", function (v) { data.customStages.push(v); data.stages["custom:" + v] = true; }); }
      if (step === 4) { add(body, "div", "ob-q", "Stock your life ✨"); add(body, "div", "ob-sb", "tap everything you do — or want to do · type anything that's missing"); var sig = keys(data.stages).sort().join(","); if (data._pref !== sig) { data._pref = sig; seedKept(); } var lib = {}; allActivities().forEach(function (a) { (lib[a.domain] = lib[a.domain] || []).push(a.title); }); keys(data.kept).forEach(function (t) { var dm = domainOf({ title: t }); if ((lib[dm] || (lib[dm] = [])).indexOf(t) < 0) lib[dm].push(t); }); DOM_ORDER.forEach(function (d) { var acts = lib[d]; if (!acts || !acts.length) return; var D = DOM[d], sec = add(body, "div", "ob-libsec"); add(sec, "div", "ob-dh", D.l.toUpperCase()).style.color = D.light; var w = add(sec, "div", "ob-row"); acts.forEach(function (t) { var on = data.kept[t]; var c = chip(w, esc(t) + (on ? ' ✓' : ''), on, D.c, D.ink); c.onclick = function () { data.kept[t] = !data.kept[t]; draw(); }; }); }); typeRow("e.g. Rock climbing, Volunteer, Therapy…", function (v) { S.acts = S.acts || []; if (!TITLE2CAT[v.toLowerCase()] && !S.acts.filter(function (a) { return a.title.toLowerCase() === v.toLowerCase(); })[0]) S.acts.push({ title: v, catK: null, domain: domainOf({ title: v }) }); data.kept[v] = true; save(); }); }
      if (step === 5) { add(body, "div", "ob-q", "What are you working toward?"); add(body, "div", "ob-sb", "pick a few — fewer is better · type your own"); var gr = add(body, "div", "ob-row"); GOAL_SEED.forEach(function (g) { var on = data.goals[g.l], D = DOM[g.d]; var c = chip(gr, '<i class="ti ' + g.ti + '"></i> ' + g.l + (on ? ' ✓' : ''), on, D.c, D.ink); c.onclick = function () { data.goals[g.l] = !data.goals[g.l]; draw(); }; }); keys(data.goals).forEach(function (g) { if (!GOAL_SEED.filter(function (x) { return x.l === g; })[0]) { var c = chip(gr, '<i class="ti ti-star"></i> ' + esc(g) + ' ✓', true, "#ff8a3a", "#4a2400"); c.onclick = function () { data.goals[g] = false; draw(); }; } }); typeRow("a goal of your own…", function (v) { data.goals[v] = true; }); }
      if (step === 6) { add(body, "div", "ob-q", "Your daily rhythm"); add(body, "div", "ob-sb", "rough is fine — pick a range"); add(body, "div", "ob-lbl", "I USUALLY WAKE"); var ur = add(body, "div", "ob-row"); ["before 6", "6–7", "7–8", "8–9", "9–10", "later", "varies"].forEach(function (t) { var c = chip(ur, t, data.wake === t); c.onclick = function () { data.wake = t; draw(); }; }); add(body, "div", "ob-lbl", "I USUALLY SLEEP"); var brr = add(body, "div", "ob-row"); ["before 10", "10–11", "11–12", "12–1", "1–2", "later", "varies"].forEach(function (t) { var c = chip(brr, t, data.bed === t); c.onclick = function () { data.bed = t; draw(); }; }); add(body, "div", "ob-lbl", "SHARPEST"); var lr = add(body, "div", "ob-row"); [["lark", "Morning", "ti-sun", "#ffc83d", "#5a3a00"], ["owl", "Night", "ti-moon", "#9a7cff", "#241548"], ["mixed", "It varies", "ti-windmill", "#7f9bc4", "#16243a"]].forEach(function (o) { var on = data.peak === o[0], c = chip(lr, '<i class="ti ' + o[2] + '"></i> ' + o[1], on, o[3], o[4]); c.onclick = function () { data.peak = o[0]; draw(); }; }); }
      if (step === 7) { var w = add(body, "div", "ob-world"); w.innerHTML = '<i class="ti ti-sparkles"></i>'; add(body, "div", "ob-q", "Your world is ready ✨"); add(body, "div", "ob-sb", "seeded with your life. let's make today count."); }
      var b = add(foot, "button", "ob-btn" + (step === STEPS - 1 ? " go" : "")); b.textContent = step === 0 ? "Let's go ▸" : step === STEPS - 1 ? "Plan your first day ▸" : "Next ▸"; b.onclick = next;
      if (step > 0 && step < STEPS - 1) { var bk = add(foot, "button", "ob-back", "◂ back"); bk.onclick = function () { step--; draw(); }; }
      var skip = add(foot, "button", "ob-skip", "skip"); skip.onclick = function () { ov.remove(); };
    }
    draw();
  }
  var VIRTUES = [
    { k: "zest", l: "Zest", e: "⚡", c: "#ff8a1e", grow: "move your body" },
    { k: "disc", l: "Discipline", e: "⚔️", c: "#3a9ae6", grow: "show up to a habit or deep work" },
    { k: "love", l: "Love", e: "❤️", c: "#ff4fa0", grow: "reach out to someone you love" },
    { k: "courage", l: "Courage", e: "🦁", c: "#ffcf3a", grow: "ship the thing you're avoiding" },
    { k: "wisdom", l: "Wisdom", e: "🦉", c: "#7a6cf0", grow: "read or study something real" },
    { k: "curiosity", l: "Curiosity", e: "🔭", c: "#23c98a", grow: "make or explore something new" },
    { k: "gratitude", l: "Gratitude", e: "🙏", c: "#ff7ab0", grow: "note what you're grateful for" },
    { k: "hope", l: "Hope", e: "🌅", c: "#48d0e0", grow: "plan tomorrow" }
  ];
  var VCLASS = { zest: "The Vital", disc: "The Disciplined", love: "The Lover", courage: "The Brave", wisdom: "The Sage", curiosity: "The Explorer", gratitude: "The Grateful", hope: "The Hopeful" };
  function virtueOf(e) {
    var t = (e.title || "").toLowerCase(), c = e.catK || TITLE2CAT[t] || (e.habitId ? HABIT2CAT[e.habitId] : null);
    if (/gratitude|journal|reflect|affirmation/.test(t)) return "gratitude";
    if (/^plan|planning/.test(t)) return "hope";
    if (e.habitId === "send" || /ship|send|outreach|publish|pitch|apply/.test(t)) return "courage";
    if (e.habitId === "read" || /read|study|research|learn|language|podcast/.test(t)) return "wisdom";
    if (/create|midjourney|design|video|music|content|write|draw|paint|photo|craft|guitar|piano|sing/.test(t)) return "curiosity";
    if (c === "energy") return "zest";
    if (c === "love") return "love";
    if (c === "hobby") return "curiosity";
    if (c === "work") return "disc";
    return null;
  }

  var S;
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null, timers: [], baseline: null, profile: null, game: { spark: 0, total: 0, ups: {}, garden: [] } }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } if (S.v == null) S.v = 0; S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; S.habits = S.habits.filter(function (h) { return h.id !== "send"; }); S.habits.forEach(function (h) { if (!h.type) h.type = "build"; if (h.per == null) h.per = 0; if (!h.color) h.color = "#8a5cf0"; }); S.game = S.game || { spark: 0, total: 0, ups: {} }; S.game.ups = S.game.ups || {}; S.game.garden = S.game.garden || []; S.brain = S.brain || { engine: "off", key: "" }; S.microState = S.microState || {}; S.mood = S.mood || {}; S.timers.forEach(function (t) { if (!t.dayK) t.dayK = logicalK(new Date(t.start)); }); var _tk = todayK(); S.timers = S.timers.filter(function (t) { return t.dayK === _tk && t.title !== "Tracking…"; }); S.v = SCHEMA; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { var n = Date.now(); if (n - lastSaveErr > 8000) { lastSaveErr = n; toast("⚠️ Couldn't save — storage may be full. Back up your data via 🧠."); } } }
  // multi-level UNDO for timeline edits — snapshot BEFORE each mutating action so an accidental move/resize/delete/clear is one tap to recover (David 2026-06-25)
  var undoStack = [];
  function pushUndo() { try { var snap = JSON.stringify({ blocks: S.blocks, log: S.log, timers: S.timers, game: S.game }); if (undoStack.length && undoStack[undoStack.length - 1] === snap) return; undoStack.push(snap); if (undoStack.length > 25) undoStack.shift(); } catch (e) {} } // dedupe identical consecutive snapshots so just-looking never piles up no-op undo steps
  function popUndo() { if (!undoStack.length) { toast("nothing to undo"); return; } try { var s = JSON.parse(undoStack.pop()); S.blocks = s.blocks; S.log = s.log; S.timers = s.timers; S.game = s.game; save(); pendingScrollNow = false; renderAll(); buildPull(); toast("↶ undone" + (undoStack.length ? " · " + undoStack.length + " more" : "")); } catch (e) {} }
  // DRAG-TO-TRASH (David 2026-06-25): while dragging a bubble, a bin appears bottom-middle; drop on it to delete
  function trashEl() { var t = el("trashZone"); if (!t) { t = document.createElement("div"); t.id = "trashZone"; t.innerHTML = '<i class="ti ti-trash"></i>'; document.body.appendChild(t); } return t; }
  function showTrash() { var t = trashEl(); var dock = el("liveDock"), nav = el("nav"), refTop = null; if (dock && dock.classList.contains("on") && dock.offsetParent !== null) refTop = dock.getBoundingClientRect().top; else if (nav && nav.offsetParent !== null) refTop = nav.getBoundingClientRect().top; if (refTop != null) t.style.bottom = Math.max(70, window.innerHeight - refTop + 12) + "px"; t.classList.add("on"); } // sit the bin right ABOVE the bottom dock (or nav) wherever it currently is, not floating high up (David 2026-06-27)
  function hideTrash() { var t = el("trashZone"); if (t) t.classList.remove("on", "armed"); }
  function overTrash(x, y) { var t = el("trashZone"); if (!t || !t.classList.contains("on")) return false; var r = t.getBoundingClientRect(), hit = x >= r.left - 24 && x <= r.right + 24 && y >= r.top - 24 && y <= r.bottom + 24; t.classList.toggle("armed", hit); return hit; }
  function toast(msg) { var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.classList.add("show"); }, 10); setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 320); }, 2600); }
  function copyFallback(json) { var ta = document.createElement("textarea"); ta.value = json; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("📋 backup copied"); } catch (e) { toast("⚠️ couldn't copy — use Download"); } ta.remove(); }
  function exportData(mode) {
    var json = JSON.stringify({ app: "ALTER", schema: SCHEMA, exportedAt: new Date().toISOString(), data: JSON.parse(localStorage.getItem(KEY) || JSON.stringify(S)) }); // versioned envelope = future-proof (a later app reads schema + migrates); import accepts this OR a raw old backup (David 2026-06-27)
    if (mode === "download") { var blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "alter-backup-" + key(new Date()) + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); toast("⬇ backup downloaded"); }
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(json).then(function () { toast("📋 backup copied — keep it safe"); }, function () { copyFallback(json); }); }
    else copyFallback(json);
  }
  function parseBackup(txt) { var obj; try { obj = JSON.parse(txt); } catch (e) { toast("⚠️ not valid backup JSON"); return null; } var d = (obj && obj.data) ? obj.data : obj; if (!d || (!d.habits && !d.blocks && !d.log)) { toast("⚠️ doesn't look like an ALTER backup"); return null; } return d; }
  // FUTURE-PROOF MERGE: combine a backup into the current data (instead of replacing). Days union by id, habits dedupe by name (remapping their done-history), game takes the best, and ANY unknown future field is carried over untouched — so backups stay importable as the app grows. (David 2026-06-27)
  function mergeImport(d) {
    var norm = function (s) { return (s || "").toLowerCase().trim(); };
    var remap = {}, byTitle = {}; (S.habits || []).forEach(function (h) { byTitle[norm(h.l)] = h.id; });
    (d.habits || []).forEach(function (h) { var t = norm(h.l); if (byTitle[t]) { remap[h.id] = byTitle[t]; } else { S.habits.push(h); byTitle[t] = h.id; remap[h.id] = h.id; } }); // a custom habit that now ships prebuilt (same name) dedupes into the existing one
    ["blocks", "log"].forEach(function (m) { S[m] = S[m] || {}; var src = d[m] || {}; Object.keys(src).forEach(function (day) { var have = {}; S[m][day] = S[m][day] || []; S[m][day].forEach(function (x) { have[x.id] = 1; }); (src[day] || []).forEach(function (x) { if (!have[x.id]) S[m][day].push(x); }); }); }); // union by id
    S.habitDone = S.habitDone || {}; var sd = d.habitDone || {}; Object.keys(sd).forEach(function (day) { var tgt = S.habitDone[day] = S.habitDone[day] || {}, src = sd[day] || {}; Object.keys(src).forEach(function (id) { var nid = remap[id] || id; if (tgt[nid] == null) tgt[nid] = src[id]; }); }); // remap done-history onto the deduped habit ids
    ["mood", "microState"].forEach(function (m) { S[m] = S[m] || {}; var src = d[m] || {}; Object.keys(src).forEach(function (day) { if (S[m][day] == null) S[m][day] = src[day]; }); });
    if (d.game) { S.game = S.game || { spark: 0, total: 0, ups: {}, garden: [] }; S.game.spark = Math.max(S.game.spark || 0, d.game.spark || 0); S.game.total = Math.max(S.game.total || 0, d.game.total || 0); S.game.ups = S.game.ups || {}; var du = d.game.ups || {}; Object.keys(du).forEach(function (k) { S.game.ups[k] = Math.max(S.game.ups[k] || 0, du[k] || 0); }); if (d.game.garden && (!S.game.garden || !S.game.garden.length)) S.game.garden = d.game.garden; }
    var handled = { habits: 1, blocks: 1, log: 1, habitDone: 1, mood: 1, microState: 1, game: 1, timers: 1, v: 1 };
    Object.keys(d).forEach(function (k) { if (!handled[k] && S[k] == null) S[k] = d[k]; }); // carry any unknown future field
    save(); load(); renderAll(); buildPull(); toast("⧉ merged in — nothing overwritten");
  }
  function restoreUI(B) {
    var w = add(B, "div"); w.style.marginTop = "10px"; add(w, "div", "lbl", "paste a backup (or pick a file), then Merge to combine or Restore to replace:");
    var ta = document.createElement("textarea"); ta.placeholder = "paste backup JSON here…"; ta.style.cssText = "width:100%;height:88px;background:#161020;color:#ece4f7;border:2.5px solid #4a4068;border-radius:14px;padding:11px;font-size:12px;font-family:inherit;"; w.appendChild(ta);
    var fi = document.createElement("input"); fi.type = "file"; fi.accept = "application/json,.json"; fi.style.cssText = "margin:8px 0;font-size:12px;color:#caa0bd;"; w.appendChild(fi); fi.onchange = function () { var f = fi.files && fi.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { ta.value = r.result; toast("📄 loaded — now Merge or Restore"); }; r.readAsText(f); };
    var row = add(w, "div"); row.style.cssText = "display:flex;gap:8px;";
    var mg = add(row, "button", "done2", "⧉ Merge in"); mg.style.flex = "1"; mg.onclick = function () { var d = parseBackup(ta.value.trim()); if (d) mergeImport(d); };
    var rs = add(row, "button", "done2", "♻ Replace"); rs.style.cssText = "flex:1;background:#3a2147;"; rs.onclick = function () { var d = parseBackup(ta.value.trim()); if (!d) return; if (!window.confirm("Replace ALL current data with this backup?")) return; localStorage.setItem(KEY, JSON.stringify(d)); location.reload(); };
  }
  function blocks(k) { return (S.blocks[k] = S.blocks[k] || []); }
  function logs(k) { return (S.log[k] = S.log[k] || []); }
  function doneMap(k) { return (S.habitDone[k] = S.habitDone[k] || {}); }
  function phase() { var h = new Date().getHours(); return h < 5 ? "night" : h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function undone() { var dm = doneMap(todayK()); return S.habits.filter(function (h) { return !dm[h.id]; }); }
  function messy() { return daysSince(S.lastTidy) >= 2; }
  function streak(id) { var d = new Date(); if (!(S.habitDone[key(d)] || {})[id]) d.setDate(d.getDate() - 1); var n = 0; for (;;) { if ((S.habitDone[key(d)] || {})[id]) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }
  function weekDone(id) { var n = 0; lastDays(7).forEach(function (k) { if ((S.habitDone[k] || {})[id]) n++; }); return n; }
  function catOf(e) { return e.catK || TITLE2CAT[(e.title || "").toLowerCase()] || (e.habitId ? HABIT2CAT[e.habitId] : null); }
  function isTidy(e) { return e.habitId === "tidy" || /tidy|laundry|bed|table|desk|trash|vacuum|sweep|clean|dishes/i.test(e.title || ""); }
  function habitCount(id, days) { var n = 0; days.forEach(function (k) { if ((S.habitDone[k] || {})[id]) n++; }); return n; }
  var FITSET = {}; CATS[0].groups[0].tasks.forEach(function (t) { FITSET[t.l.toLowerCase()] = 1; });
  function weeklyWorkouts() { var n = habitCount("move", lastDays(7)); lastDays(7).forEach(function (k) { logs(k).forEach(function (e) { if (FITSET[(e.title || "").toLowerCase()]) n++; }); }); return n; }

  function virtues() {
    var d14 = lastDays(14), xp = {}; VIRTUES.forEach(function (v) { xp[v.k] = 0; });
    d14.forEach(function (k) { logs(k).forEach(function (e) { var v = virtueOf(e); if (v) xp[v] += (e.mins || 0); }); var dm = S.habitDone[k] || {}; Object.keys(dm).forEach(function (id) { if (dm[id]) { var hb = S.habits.filter(function (z) { return z.id === id; })[0]; var hv = (hb ? virtueOf({ title: hb.l, catK: hb.cat, habitId: hb.id }) : null) || { move: "zest", breathe: "zest", deep: "disc", tidy: "disc", read: "wisdom", send: "courage" }[id]; if (hv) xp[hv] += 18; xp.disc += 6; } }); });
    blocks(todayK()).forEach(function (b) { if (b.done) xp.hope += 12; });
    var focus = (S.profile && S.profile.focus) || [], bvx = (S.profile && S.profile.base && S.profile.base.virtue) || {};
    var out = VIRTUES.map(function (v) { var x = (xp[v.k] || 0) + (bvx[v.k] || 0), foc = focus.indexOf(v.k) !== -1; var lv = 1 + Math.floor(x / 90) + (foc ? 1 : 0); var glow = Math.min(1, 0.4 + lv * 0.085); return { k: v.k, l: v.l, e: v.e, c: v.c, grow: v.grow, lv: lv, glow: glow, focus: foc, x: x }; });
    return { list: out, level: Math.round(out.reduce(function (a, s) { return a + s.lv; }, 0) / out.length), top: out.slice().sort(function (a, b) { return b.lv - a.lv; })[0] };
  }

  // keyword → emoji so EVERY option gets a relevant icon
  var EMOJI_KW = [["park", "🌳"], ["outdoor", "🌳"], ["garden", "🌿"], ["walk", "🚶"], ["nature", "🌳"], ["chill", "😌"], ["relax", "😌"], ["lounge", "😌"], ["rest", "😴"], ["nap", "😴"], ["sleep", "😴"], ["build", "🛠️"], ["code", "💻"], ["program", "💻"], ["app", "📱"], ["ship", "🚀"], ["design", "🎨"], ["write", "✍️"], ["work", "💼"], ["money", "💰"], ["sell", "💸"], ["sale", "💸"], ["client", "🤝"], ["pitch", "📊"], ["outreach", "📣"], ["meet", "🗣️"], ["call", "📞"], ["email", "✉️"], ["admin", "🗂️"], ["read", "📚"], ["learn", "📚"], ["study", "📖"], ["gym", "🏋️"], ["run", "🏃"], ["lift", "🏋️"], ["workout", "🏋️"], ["move", "🤸"], ["stretch", "🧘"], ["yoga", "🧘"], ["eat", "🍽️"], ["cook", "🍳"], ["coffee", "☕"], ["food", "🍔"], ["friend", "👥"], ["social", "👥"], ["date", "💞"], ["family", "👨‍👩‍👧"], ["game", "🎮"], ["play", "🎮"], ["music", "🎵"], ["guitar", "🎸"], ["meditate", "🧘"], ["breathe", "🌬️"], ["journal", "📓"], ["tidy", "🧹"], ["clean", "🧹"], ["shop", "🛒"], ["errand", "🧾"], ["drive", "🚗"], ["commute", "🚗"], ["scroll", "📱"], ["watch", "📺"], ["shower", "🚿"]];
  function emojiFor(m) {
    if (m && m.emoji) return m.emoji;
    var t = ((m && m.title) || "").toLowerCase();
    for (var i = 0; i < EMOJI_KW.length; i++) if (t.indexOf(EMOJI_KW[i][0]) >= 0) return EMOJI_KW[i][1];
    return ({ work: "💼", energy: "⚡", love: "❤️", body: "💪", mind: "🧠", vice: "⚠️" })[m && m.catK] || "✨";
  }
  // clever default "vibes" — the life-domains you actually spend time in (seed the picker, multi-select friendly)
  var VIBES = [
    { title: "Building ALTER", catK: "work", emoji: "🛠️", color: "#2a9fe0" },
    { title: "Deep work", catK: "work", emoji: "💻", color: "#2a9fe0" },
    { title: "Making money", catK: "work", emoji: "💰", color: "#28cf86" },
    { title: "Chilling", catK: "energy", emoji: "😌", color: "#ff8a1e" },
    { title: "Park / outdoors", catK: "energy", emoji: "🌳", color: "#28cf86" },
    { title: "Move / gym", catK: "body", emoji: "🏋️", color: "#ff8a1e" },
    { title: "Eat", catK: "energy", emoji: "🍽️", color: "#ff8a1e" },
    { title: "Time with people", catK: "love", emoji: "👥", color: "#ff4fa0" },
    { title: "Learn / read", catK: "work", emoji: "📚", color: "#8a5cf0" },
    { title: "Rest", catK: "energy", emoji: "😴", color: "#9a5cf0" }
  ];
  function frequent(n) {
    n = n || 8;
    var cnt = {}; lastDays(30).forEach(function (k) { logs(k).forEach(function (e) { if (catOf(e) !== "vice") cnt[e.title] = (cnt[e.title] || 0) + 1; }); });
    blocks(todayK()).concat(blocks(tomK())).forEach(function (b) { cnt[b.title] = (cnt[b.title] || 0) + 1; });
    var seen = {}, out = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (t) { seen[t.toLowerCase()] = 1; return TITLE2META[t.toLowerCase()] || { title: t, catK: TITLE2CAT[t.toLowerCase()] || "work", emoji: "", color: "#8a5cf0", habitId: null }; });
    VIBES.forEach(function (v) { if (out.length < n && !seen[v.title.toLowerCase()]) out.push(v); });
    return out.slice(0, n);
  }

  function schedule(k) {
    var pend = blocks(k).filter(function (b) { return !b.done; }).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    function fit(list) { var cur = logicalNowMin(), out = []; list.forEach(function (b) { var st = Math.max(cur, hm(b.time)); out.push({ b: b, st: st }); cur = st + (b.mins || 30); }); return { sched: out, end: cur }; }
    var active = pend.slice(), bumped = [], r = fit(active);
    while (r.end > DAY_END && active.length) { var lp = 99, idx = 0; for (var i = 0; i < active.length; i++) { var pr = active[i].prio || 2; if (pr < lp) { lp = pr; idx = i; } else if (pr === lp && hm(active[i].time) >= hm(active[idx].time)) idx = i; } bumped.push(active.splice(idx, 1)[0]); r = fit(active); }
    return { sched: r.sched, bumped: bumped, over: Math.max(0, r.end - DAY_END) };
  }

  function proactive() {
    var p = phase(), und = undone(), sc = schedule(todayK()), out = { chips: [] };
    if (sc.bumped.length) { out.kicker = "running tight"; out.line = "Over by " + dur(sc.over) + " today."; out.sub = "I bumped " + sc.bumped.length + " low-priority " + (sc.bumped.length === 1 ? "slot" : "slots") + " so what matters survives."; out.primary = { label: "Review today", fn: function () { window.scrollTo({ top: 320, behavior: "smooth" }); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); return out; }
    if (p === "night") { out.kicker = "tonight"; out.line = "It's late — let's wind down."; out.sub = "tidy the surfaces, phone away, head toward bed."; out.primary = { label: "Wind down 😴", fn: function () { ritualSheet(WINDDOWN); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else if (p === "morning") { out.kicker = "this morning"; out.line = "Good morning — let's recommit."; out.sub = "60 seconds: who you're being, your one thing, gratitude — then I frame your day."; out.primary = { label: "Morning recommit ☀️", fn: recommitSheet }; out.chips.push({ label: "Quick bookend ✅", fn: function () { ritualSheet(MORNING_RITUAL); } }); out.chips.push({ label: "Plan your day", fn: function () { planSheet(todayK(), "today"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else if (p === "evening") { out.kicker = "this evening"; out.line = "Evening — close the day well."; out.sub = "reflect on today, tidy up, set tomorrow's one thing."; out.primary = { label: "Evening bookend 🌙", fn: function () { ritualSheet(EVENING_RITUAL); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else { if (!blocks(todayK()).length) { out.kicker = p; out.line = "No plan yet — shape the day."; out.sub = "block your next few hours."; out.primary = { label: "What should I do next? ✨", fn: function () { suggestSheet(todayK()); } }; } else if (und.length) { out.kicker = p; out.line = und.length + (und.length === 1 ? " habit left." : " habits left."); out.sub = "knock one out while you've got momentum."; out.primary = { label: "What are you doing?", fn: nowSheet }; } else { out.kicker = p; out.line = "On track. Nice."; out.sub = "get ahead on tomorrow?"; out.primary = { label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }; } if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    if (S.profile && S.profile.exWant && p !== "night") { var ww = weeklyWorkouts(); if (ww < S.profile.exWant) out.chips.push({ label: "🏃 workout (" + ww + "/" + S.profile.exWant + " this wk)", fn: nowSheet }); }
    return out;
  }

  // ---- ui helpers --------------------------------------------------------
  function add(p, tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; p.appendChild(e); return e; }
  function dot(c) { var s = document.createElement("span"); s.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + c; return s; }
  function bigCat(c) { var d = document.createElement("div"); d.className = "bigcat"; d.style.background = c.color; d.innerHTML = '<div class="bce">' + c.e + '</div><div class="bcl">' + c.label + "</div>"; return d; }
  function subCard(c, gr) { var d = document.createElement("div"); d.className = "subcat"; d.style.borderColor = c.color; d.innerHTML = '<div class="bce">' + (gr.tasks[0].e || "•") + '</div><div class="scl">' + gr.g + "</div>"; return d; }
  function taskTile(parent, meta, selected, onClick) { var x = add(parent, "div", "gtile" + (selected ? " on" : "")); x.style.borderColor = meta.color; if (selected) x.style.background = meta.color; add(x, "div", "ge", meta.emoji || "•"); add(x, "div", "gl", meta.title); x.onclick = onClick; return x; }

  // ---- virtue constellation (character tree) -----------------------------
  var tctx, TW = 300, TH = 250, TT0 = performance.now(), treeNodes = [];
  function treeFit() { var c = el("tree"); if (!c) return; tctx = c.getContext("2d"); var wrap = c.parentNode; var cssW = Math.min(380, (wrap ? wrap.clientWidth : 320) - 6) || 320; var dpr = window.devicePixelRatio || 1; TW = cssW; TH = Math.round(cssW * 0.84); c.style.width = TW + "px"; c.style.height = TH + "px"; c.width = Math.round(TW * dpr); c.height = Math.round(TH * dpr); tctx.setTransform(dpr, 0, 0, dpr, 0, 0); tctx.imageSmoothingEnabled = true; }
  function hexA(hex, a) { var h = hex.replace("#", ""); return "rgba(" + parseInt(h.substr(0, 2), 16) + "," + parseInt(h.substr(2, 2), 16) + "," + parseInt(h.substr(4, 2), 16) + "," + a + ")"; }
  function treeLoop() { if (!tctx) { requestAnimationFrame(treeLoop); return; } drawTree(); requestAnimationFrame(treeLoop); }
  function drawTree() {
    var t = (performance.now() - TT0) / 1000; tctx.clearRect(0, 0, TW, TH);
    var cx = TW / 2, cy = TH / 2, R = Math.min(TW, TH) * 0.37; treeNodes = [];
    var list = vState ? vState.list : VIRTUES.map(function (v) { return { k: v.k, l: v.l, e: v.e, c: v.c, lv: 1, glow: 0.4, focus: false }; });
    list.forEach(function (v, i) { var a = -Math.PI / 2 + i * Math.PI / 4, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; tctx.beginPath(); tctx.moveTo(cx, cy); tctx.lineTo(x, y); tctx.strokeStyle = "rgba(190,160,235," + (0.08 + v.glow * 0.16) + ")"; tctx.lineWidth = 1.5; tctx.stroke(); });
    var gc = (S.game && S.game.ups && S.game.ups.gold) ? "255,210,80" : "180,142,224"; var cp = 0.55 + Math.sin(t * 1.5) * 0.12; var cg = tctx.createRadialGradient(cx, cy, 2, cx, cy, 32); cg.addColorStop(0, "rgba(255,255,255,0.92)"); cg.addColorStop(0.45, "rgba(" + gc + "," + cp + ")"); cg.addColorStop(1, "rgba(" + gc + ",0)"); tctx.fillStyle = cg; tctx.beginPath(); tctx.arc(cx, cy, 32, 0, 7); tctx.fill();
    tctx.fillStyle = "#fff"; tctx.font = "700 17px 'Baloo 2',sans-serif"; tctx.textAlign = "center"; tctx.textBaseline = "middle"; tctx.fillText(vState ? "Lv " + vState.level : "✦", cx, cy);
    list.forEach(function (v, i) {
      var a = -Math.PI / 2 + i * Math.PI / 4, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      var pulse = 1 + Math.sin(t * 1.8 + i * 0.7) * 0.08, rad = (9 + v.lv * 1.5) * pulse; treeNodes.push({ k: v.k, x: x, y: y, r: rad + 16 });
      var g = tctx.createRadialGradient(x, y, 1, x, y, rad + 12); g.addColorStop(0, hexA(v.c, 0.95)); g.addColorStop(0.5, hexA(v.c, v.glow * 0.5)); g.addColorStop(1, hexA(v.c, 0)); tctx.fillStyle = g; tctx.beginPath(); tctx.arc(x, y, rad + 12, 0, 7); tctx.fill();
      tctx.fillStyle = v.c; tctx.beginPath(); tctx.arc(x, y, rad * 0.5, 0, 7); tctx.fill();
      if (v.focus) { tctx.strokeStyle = "#fff"; tctx.lineWidth = 2; tctx.beginPath(); tctx.arc(x, y, rad + 4, 0, 7); tctx.stroke(); }
      tctx.font = "15px sans-serif"; tctx.fillText(v.e, x, y);
      tctx.fillStyle = "rgba(240,235,250,0.95)"; tctx.font = "700 10px 'Baloo 2',sans-serif"; tctx.fillText(v.l, x, y + rad + 11);
    });
  }
  function treeTap(ev) { if (!vState || !tctx) return; var c = el("tree"), rect = c.getBoundingClientRect(); var x = ev.clientX - rect.left, y = ev.clientY - rect.top; for (var i = 0; i < treeNodes.length; i++) { var n = treeNodes[i]; if ((x - n.x) * (x - n.x) + (y - n.y) * (y - n.y) < n.r * n.r) { var v = vState.list.filter(function (z) { return z.k === n.k; })[0]; if (v) virtueDetail(v); return; } } }
  function actCount(re) { var n = 0; lastDays(30).forEach(function (k) { logs(k).forEach(function (e) { if (re.test((e.title || "").toLowerCase())) n++; }); var dm = S.habitDone[k] || {}; S.habits.forEach(function (h) { if (dm[h.id] && re.test(h.l.toLowerCase())) n++; }); }); return n; }
  function bestStreak() { var m = 0; S.habits.forEach(function (h) { var s = streak(h.id); if (s > m) m = s; }); return m; }
  function planCount() { var n = 0; lastDays(30).forEach(function (k) { (S.blocks[k] || []).forEach(function (b) { if (b.done) n++; }); }); return n; }
  var PERKS = {
    zest: [{ n: "Athlete", e: "🏃", desc: "move your body", r: [3, 8, 18, 35], m: function () { return actCount(/run|gym|walk|yoga|cycl|swim|sport|hike|move|workout|stretch/); } }, { n: "Cold Iron", e: "🧊", desc: "cold showers & breathwork", r: [2, 6, 14], m: function () { return actCount(/cold|sauna|ice|breathe/); } }, { n: "Well-Fed", e: "🥗", desc: "eat & sleep well", r: [4, 12, 28], m: function () { return actCount(/healthy|cook|protein|hydrate|sleep|nap|meal|vitamin/); } }],
    disc: [{ n: "Deep Focus", e: "🧠", desc: "deep work sessions", r: [3, 10, 25, 50], m: function () { return actCount(/deep|program|cod|study|research|focus|writ/); } }, { n: "Unbroken", e: "🔥", desc: "keep your streaks alive", r: [3, 7, 14, 30], m: bestStreak }, { n: "Clean Space", e: "🧹", desc: "tidy your space", r: [3, 10, 22], m: function () { return actCount(/tidy|laundry|clean|dish|bed|sweep|vacuum/); } }],
    love: [{ n: "Connector", e: "💞", desc: "reach out to people", r: [3, 9, 20], m: function () { return actCount(/partner|family|friend|call|date|text|hug|quality|people/); } }, { n: "Open Heart", e: "🪞", desc: "journal & reflect", r: [3, 9, 20], m: function () { return actCount(/journal|gratitude|therapy|affirm|reflect/); } }],
    courage: [{ n: "Shipper", e: "✦", desc: "ship & send things", r: [2, 6, 15, 30], m: function () { return actCount(/ship|send|publish|outreach|pitch|apply|post|sell|launch|deploy|demo/); } }, { n: "Bold", e: "🦁", desc: "do the scary thing", r: [2, 6, 14], m: function () { return actCount(/cold|ice|interview|ask|pitch|confront|sales|call/); } }],
    wisdom: [{ n: "Scholar", e: "📖", desc: "read & study", r: [3, 10, 24, 48], m: function () { return actCount(/read|study|research|learn|language|podcast|lecture/); } }, { n: "Sharp Mind", e: "♟️", desc: "chess, puzzles, practice", r: [2, 7, 16], m: function () { return actCount(/chess|puzzle|practice|sudoku/); } }],
    curiosity: [{ n: "Creator", e: "🎨", desc: "make something new", r: [3, 10, 24, 48], m: function () { return actCount(/art|draw|paint|music|guitar|piano|sing|design|video|content|make|writ|craft|midjourney|photo/); } }, { n: "Explorer", e: "🧭", desc: "explore & discover", r: [2, 7, 16], m: function () { return actCount(/nature|travel|explore|garden|hike|new/); } }],
    gratitude: [{ n: "Grateful", e: "🙏", desc: "note what you're grateful for", r: [3, 10, 24], m: function () { return actCount(/gratitude|grateful|thank/); } }, { n: "Present", e: "🌙", desc: "meditate & breathe", r: [2, 8, 18], m: function () { return actCount(/meditat|breathe|present|reflect/); } }],
    hope: [{ n: "Architect", e: "🗒️", desc: "plan your days", r: [3, 10, 25], m: planCount }, { n: "Visionary", e: "🌅", desc: "set goals & intentions", r: [2, 7, 16], m: function () { return actCount(/plan|goal|vision|dream|intention/); } }]
  };
  var OCC_PERK = { artist: { v: "curiosity", n: "Master Artist", e: "🎨", desc: "make & ship art", re: /art|draw|paint|design|midjourney|sketch/, r: [5, 15, 35, 70] }, dev: { v: "curiosity", n: "Master Builder", e: "💻", desc: "build & ship code", re: /cod|program|build|deploy|debug|ship/, r: [5, 15, 35, 70] }, founder: { v: "courage", n: "The Closer", e: "🤝", desc: "sell, pitch, close", re: /sell|close|outreach|sales|deal|pitch|invoice/, r: [3, 10, 25, 50] }, writer: { v: "curiosity", n: "Wordsmith", e: "✍️", desc: "write & publish", re: /writ|edit|publish|post|newsletter/, r: [5, 15, 35, 70] }, student: { v: "wisdom", n: "Top Student", e: "📚", desc: "study & produce", re: /study|assignment|revise|practice|lecture/, r: [5, 15, 35, 70] }, office: { v: "disc", n: "The Operator", e: "💼", desc: "focus & deliver", re: /deep|analysis|meeting|ship|review|report/, r: [5, 15, 35, 70] } };
  function occPerk(vk) { var o = OCC_PERK[(S.profile && S.profile.occ)]; if (o && o.v === vk) return { n: o.n, e: o.e, desc: o.desc, r: o.r, m: function () { return actCount(o.re); } }; return null; }
  function virtueDetail(v) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", v.e + " " + v.l + " · Lv " + v.lv);
    var sub = add(B, "div", "lbl", "skills you level by living — do the thing, it ranks up"); sub.style.fontSize = "13px";
    var op = occPerk(v.k), perks = (PERKS[v.k] || []).slice(); if (op) perks.unshift(op);
    var basePerk = (S.profile && S.profile.base && S.profile.base.perk) || {};
    perks.forEach(function (p) {
      var val = p.m() + (basePerk[p.n] || 0), rank = 0, i; for (i = 0; i < p.r.length; i++) if (val >= p.r[i]) rank = i + 1; var mastered = rank >= p.r.length;
      var card = add(B, "div", "perk" + (rank > 0 ? " on" : "")); add(card, "div", "pke", p.e);
      var mid = add(card, "div"); mid.style.flex = "1"; var hd = add(mid, "div", "pkh"); add(hd, "span", "pkn", p.n);
      var pips = add(hd, "span", "pkpips"); for (i = 0; i < p.r.length; i++) { var pip = add(pips, "i"); if (i < rank) pip.className = "on"; }
      add(mid, "div", "pkd", mastered ? "Mastered ✓ · Rank " + rank : "▸ " + p.desc + " — " + (p.r[rank] - val) + " more to rank " + (rank + 1));
      var bar = add(mid, "div", "pkbar"), prev = rank > 0 ? p.r[rank - 1] : 0, nxt = mastered ? p.r[p.r.length - 1] : p.r[rank], frac = mastered ? 1 : Math.max(0.05, Math.min(1, (val - prev) / ((nxt - prev) || 1))); var bi = add(bar, "i"); bi.style.width = Math.round(frac * 100) + "%"; bi.style.background = v.c;
    });
    add(B, "button", "done2", "Do it now ▶").onclick = function () { closeSheet(); nowSheet(); };
  }

  // ---- the pixel guardian (the mirror) -----------------------------------
  var SW = 64, SH = 80;
  var SKY = { night: ["#0c1330", "#241a46"], morning: ["#16345e", "#3a2a55"], afternoon: ["#163e63", "#2a2150"], evening: ["#241640", "#3c1733"] };
  var gctx, GW = 0, GH = 0, gspr = null, gsx = null, GT0 = performance.now();
  // walkable character + camera (ported from Heaven Inc walk model)
  var px = 24, py = 96, pface = 1, walkF = 0, walkT = 0, moveX = 0, moveY = 0, jid = null, kdn = {}, pInit = false;
  var camX = 0, camY = 0; // free-look camera pan offset (drag the world to look around; moving the guy re-centers) — David 2026-06-24
  var jz = 0, jvz = 0;  // jump height + vertical velocity (top-down hop)
  function jumping() { return jz > 0 || jvz !== 0; }
  function skateOk() { return !!(S.game && S.game.ups && S.game.ups.board); }
  function tricksOk() { return !!(S.game && S.game.ups && S.game.ups.tricks); }
  function doJump() { if (jz <= 0 && jvz <= 0) { jvz = (skateOn && skateOk()) ? 10.5 : 7.5; bodySpin = 0; flipState = null; } }  // skate = bigger air (studio-sim -3.5 vs -2.5)
  // skate + trick state (ported from studio-sim)
  var skateOn = false, skateAng = null, pvx = 0, pvy = 0, bodySpin = 0, flipState = null, trickCombo = 0, trickMsg = null, trickMsgT = 0, shake = 0, dust = [];
  var BOARD_FLIPS = { "up": { n: "KICKFLIP", dur: 12 }, "down": { n: "HEELFLIP", dur: 12 }, "left": { n: "BS 180", dur: 10 }, "right": { n: "FS 180", dur: 10 }, "up+left": { n: "VARIAL FLIP", dur: 14 }, "up+right": { n: "HARDFLIP", dur: 14 }, "down+left": { n: "INWARD HEEL", dur: 14 }, "down+right": { n: "TRE FLIP", dur: 16 } };
  var zoom = 1, pinch0 = 0, zoom0 = 1;
  function hx2(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) { var A = hx2(a), B = hx2(b); return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * t) + "," + Math.round(A[1] + (B[1] - A[1]) * t) + "," + Math.round(A[2] + (B[2] - A[2]) * t) + ")"; }
  function gdisc(g, cx, cy, r, col) { g.fillStyle = col; for (var y = -r; y <= r; y++) { var w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y))); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }
  function gring(g, cx, cy, rx, ry, col, th) { th = th || 1; g.fillStyle = col; for (var a = 0; a < 6.3; a += 0.1) { g.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), th, th); } }
  function guardianFit() {
    var c = el("guardian"); if (!c) return;
    var wrap = c.parentNode, cssW = (wrap ? wrap.clientWidth : 340) || 340;
    var cssH = Math.max(300, Math.round(Math.min(window.innerHeight * 0.52, cssW * 1.18)));
    GW = cssW; GH = cssH;
    gctx = fitPixelCanvas(c, cssW, cssH, PXG); ensureHero();
  }
  // ---- virtual joystick (ported from Heaven Inc input.js) + keyboard fallback ----
  function setupJoy() {
    var zone = el("joy"), stick = el("joyStick"); if (!zone || !stick) return;
    var cxj = 0, cyj = 0, jdownT = 0, jmoved = false;
    zone.addEventListener("touchstart", function (e) {
      e.preventDefault(); var tch = e.changedTouches[0]; jid = tch.identifier;
      var r = zone.getBoundingClientRect(); cxj = r.left + r.width / 2; cyj = r.top + r.height / 2;
      jdownT = Date.now(); jmoved = false;
    }, { passive: false });
    zone.addEventListener("touchmove", function (e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var tch = e.changedTouches[i]; if (tch.identifier !== jid) continue;
        var dx = tch.clientX - cxj, dy = tch.clientY - cyj, d = Math.sqrt(dx * dx + dy * dy), cl = Math.min(d, 42), a = Math.atan2(dy, dx);
        if (d > 12) jmoved = true;
        stick.style.transform = "translate(" + (Math.cos(a) * cl) + "px," + (Math.sin(a) * cl) + "px)";
        var mag = Math.max(0, Math.min(1, (d - 5) / 37)); moveX = Math.cos(a) * mag; moveY = Math.sin(a) * mag;   // analog: push further = move faster
      }
    }, { passive: false });
    function end(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === jid) { if (!jmoved && Date.now() - jdownT < 250 && skateOk()) skateOn = !skateOn; jid = null; moveX = 0; moveY = 0; stick.style.transform = "translate(0,0)"; } }
    zone.addEventListener("touchend", end); zone.addEventListener("touchcancel", end);
    var KEYS = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
    window.addEventListener("keydown", function (e) { var k = (e.key || "").toLowerCase(); if (KEYS.indexOf(k) < 0) return; kdn[k] = true; updKeys(); });
    window.addEventListener("keyup", function (e) { var k = (e.key || "").toLowerCase(); if (KEYS.indexOf(k) < 0) return; kdn[k] = false; updKeys(); });
  }
  function updKeys() {
    if (jid != null) return; var x = 0, y = 0;
    if (kdn.w || kdn.arrowup) y--; if (kdn.s || kdn.arrowdown) y++; if (kdn.a || kdn.arrowleft) x--; if (kdn.d || kdn.arrowright) x++;
    if (x && y) { var l = Math.sqrt(2); x /= l; y /= l; }
    moveX = x; moveY = y;
  }
  // ---- camera zoom: pinch (mobile) + wheel (desktop) + ＋/－ buttons ----
  function setupZoom() {
    var stage = el("gameMode"); if (!stage) return;
    function dist(a, b) { var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY; return Math.sqrt(dx * dx + dy * dy); }
    function clampZ(z) { return Math.max(0.6, Math.min(2.6, z)); }
    stage.addEventListener("touchstart", function (e) { if (e.touches.length === 2 && jid == null && jid2 == null) { pinch0 = dist(e.touches[0], e.touches[1]); zoom0 = zoom; } }, { passive: false });
    stage.addEventListener("touchmove", function (e) { if (e.touches.length === 2 && pinch0 > 0 && jid == null && jid2 == null) { e.preventDefault(); zoom = clampZ(zoom0 * (dist(e.touches[0], e.touches[1]) / pinch0)); } }, { passive: false });
    stage.addEventListener("touchend", function (e) { if (e.touches.length < 2) pinch0 = 0; });
    stage.addEventListener("wheel", function (e) { e.preventDefault(); zoom = clampZ(zoom * (e.deltaY < 0 ? 1.1 : 0.9)); }, { passive: false });
    var zi = el("zoomIn"), zo = el("zoomOut");
    if (zi) zi.onclick = function () { zoom = clampZ(zoom * 1.2); };
    if (zo) zo.onclick = function () { zoom = clampZ(zoom / 1.2); };
  }
  // right thumb (twin-stick, Heaven Inc style): aims the fairy's facing
  function setupJoy2() {
    var zone = el("joy2"), stick = el("joyStick2"); if (!zone || !stick) return;
    var cx2 = 0, cy2 = 0, j2t = 0, j2moved = false;
    zone.addEventListener("touchstart", function (e) { e.preventDefault(); var tc = e.changedTouches[0]; jid2 = tc.identifier; var r = zone.getBoundingClientRect(); cx2 = r.left + r.width / 2; cy2 = r.top + r.height / 2; j2t = Date.now(); j2moved = false; }, { passive: false });
    zone.addEventListener("touchmove", function (e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var tc = e.changedTouches[i]; if (tc.identifier !== jid2) continue;
        var dx = tc.clientX - cx2, dy = tc.clientY - cy2, d = Math.sqrt(dx * dx + dy * dy), cl = Math.min(d, 42), a = Math.atan2(dy, dx);
        if (d > 12) j2moved = true;
        stick.style.transform = "translate(" + (Math.cos(a) * cl) + "px," + (Math.sin(a) * cl) + "px)";
        var mag = Math.max(0, Math.min(1, (d - 5) / 37)); moveX2 = Math.cos(a) * mag; moveY2 = Math.sin(a) * mag;
      }
    }, { passive: false });
    function end(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === jid2) { if (!j2moved && Date.now() - j2t < 250) doJump(); jid2 = null; moveX2 = 0; moveY2 = 0; stick.style.transform = "translate(0,0)"; } }
    zone.addEventListener("touchend", end); zone.addEventListener("touchcancel", end);
  }
  // ============ full-screen GAME MODE — top-down island the guardian walks ============
  var wctx, WGW = 0, WGH = 0, hspr = null, hsx = null, gameOn = false, ghudT = 0;
  var HSW = 40, HSH = 58, RG = 240, RS = 286, PXG = 3;
  // real fairy sprite sheets (AI-generated, animated via Kling, sliced to frames)
  var FAIRY = { idle: null, fly: null, face: null, dir: null }, FAIRY_META = { idle: { fw: 201, fh: 300, n: 13 }, fly: { fw: 223, fh: 300, n: 13 }, face: { fw: 210, fh: 300, n: 8 }, dir: { fw: 207, fh: 300, n: 8 } };
  var moveX2 = 0, moveY2 = 0, jid2 = null, FACE_DIR = 1, FACE_OFF = -Math.PI / 2;  // right thumb (twin-stick) + 8-way facing calibration (down→front)
  // spr-dir.png rows are David's hand-picked spin frames, already in compass order
  // (S,SW,W,NW,N,NE,E,SE) = his timestamped screenshots: front 1.43s, left 1.86, back-left 2.29,
  // back 2.91, back-right 3.43, right 3.68, front-right 3.96 (SW reuses front). No mirroring.
  var DIR2CELL = [0, 1, 2, 3, 4, 5, 6, 7];
  function loadFairy() { ["idle", "fly", "face", "dir"].forEach(function (k) { var im = new Image(); im.src = "assets/spr-" + k + ".png?v=4"; FAIRY[k] = im; }); }
  // Cuphead world assets (AI-generated, 1930s rubber-hose)
  var WORLD_IMG = {}, waterPat = null, grassPat = null, grassBlob = null, sandBlob = null, darkBlob = null;
  function loadWorld() {
    var srcs = { water: "cup-water2.png", grass: "cup-grass2.png", tree: "obj-tree.png", cabin: "obj-cabin.png", bush: "obj-bush.png", rock: "obj-rock.png", chest: "obj-chest.png", sign: "obj-sign.png" };
    Object.keys(srcs).forEach(function (k) { var im = new Image(); im.src = "assets/" + srcs[k] + "?v=3"; WORLD_IMG[k] = im; });
  }
  function drawObj(ctx, img, x, y, h) {
    if (!img || !img.complete || !img.naturalWidth) return;
    var w = h * img.naturalWidth / img.naturalHeight;
    ctx.fillStyle = "rgba(30,22,14,0.16)"; ctx.beginPath(); ctx.ellipse(x, y, w * 0.34, h * 0.07, 0, 0, 7); ctx.fill();
    ctx.drawImage(img, Math.round(x - w / 2), Math.round(y - h), w, h);
  }
  // low-res backing store + CSS upscale (image-rendering:pixelated) = true pixel-art look (Heaven Inc model)
  function fitPixelCanvas(c, cssW, cssH, px) {
    c.style.width = cssW + "px"; c.style.height = cssH + "px";
    var dpr = window.devicePixelRatio || 1;          // full-res now: detailed AI sprites carry the pixel look (no more chunky buffer → no zoom blur)
    c.width = Math.round(cssW * dpr); c.height = Math.round(cssH * dpr);
    var ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = true;
    return ctx;
  }
  function ensureHero() { if (!hspr) { hspr = document.createElement("canvas"); hspr.width = HSW; hspr.height = HSH; hsx = hspr.getContext("2d"); } }
  function worldFit() {
    var c = el("world"); if (!c) return;
    WGW = window.innerWidth; WGH = window.innerHeight;
    wctx = fitPixelCanvas(c, WGW, WGH, PXG); ensureHero();
  }
  // detailed pixel hero: dark outline, arms at sides, lean proportions, walk cycle
  function paintHero(t, st, wf, moving) {
    var g = hsx, cx = HSW >> 1, col = st.color, dk = mix(col, "#000000", 0.34), lt = mix(col, "#ffffff", 0.22), OUT = "#23192e";
    g.clearRect(0, 0, HSW, HSH);
    var y0 = moving ? -Math.abs(Math.round(Math.sin(t * 9))) : 0;   // step bob
    var sw = moving ? (wf ? 1 : -1) : 0;                            // 1 = left leg leads
    var lL = sw > 0 ? 2 : 0, rL = sw < 0 ? 2 : 0;                   // leg shorten when leading
    // ---- dark outline silhouette ----
    g.fillStyle = OUT;
    g.fillRect(cx - 8, 7 + y0, 16, 17);          // head
    g.fillRect(cx - 7, 23 + y0, 14, 16);         // torso
    g.fillRect(cx - 10, 24 + y0, 4, 14);         // left arm
    g.fillRect(cx + 6, 24 + y0, 4, 14);          // right arm
    g.fillRect(cx - 6, 38 + y0, 5, 18 - lL);     // left leg
    g.fillRect(cx + 1, 38 + y0, 5, 18 - rL);     // right leg
    // ---- hair ----
    g.fillStyle = "#43301e"; g.fillRect(cx - 7, 8 + y0, 14, 6); g.fillRect(cx - 7, 8 + y0, 3, 11); g.fillRect(cx + 4, 8 + y0, 3, 11);
    g.fillStyle = "#5e4329"; g.fillRect(cx - 7, 8 + y0, 14, 2);
    // ---- face ----
    g.fillStyle = "#efc196"; g.fillRect(cx - 4, 12 + y0, 8, 11);
    g.fillStyle = "#d8a87c"; g.fillRect(cx + 2, 12 + y0, 2, 11);
    // eyes (small, close) + mouth
    g.fillStyle = OUT; if (st.blink) { g.fillRect(cx - 3, 17 + y0, 2, 1); g.fillRect(cx + 1, 17 + y0, 2, 1); } else { g.fillRect(cx - 3, 16 + y0, 2, 2); g.fillRect(cx + 1, 16 + y0, 2, 2); g.fillStyle = "#fff"; g.fillRect(cx - 3, 16 + y0, 1, 1); g.fillRect(cx + 1, 16 + y0, 1, 1); }
    g.fillStyle = "#9c5746"; g.fillRect(cx - 1, 20 + y0, 2, 1);
    // ---- torso (tunic): lit side, shadow side, belt ----
    g.fillStyle = col; g.fillRect(cx - 6, 24 + y0, 12, 14);
    g.fillStyle = lt; g.fillRect(cx - 6, 24 + y0, 3, 13);
    g.fillStyle = dk; g.fillRect(cx + 3, 24 + y0, 3, 13);
    g.fillStyle = "#2a2030"; g.fillRect(cx - 6, 35 + y0, 12, 2);
    // ---- arms (sleeves) + hands ----
    g.fillStyle = dk; g.fillRect(cx - 9, 25 + y0, 3, 10); g.fillRect(cx + 6, 25 + y0, 3, 10);
    g.fillStyle = "#efc196"; g.fillRect(cx - 9, 34 + y0, 3, 3); g.fillRect(cx + 6, 34 + y0, 3, 3);
    // ---- legs (pants) + boots ----
    g.fillStyle = "#34304e"; g.fillRect(cx - 5, 39 + y0, 4, 13 - lL); g.fillRect(cx + 2, 39 + y0, 4, 13 - rL);
    g.fillStyle = "#1d1628"; g.fillRect(cx - 6, 51 + y0 - lL, 5, 5); g.fillRect(cx + 1, 51 + y0 - rL, 5, 5);
    // ---- halo ----
    g.strokeStyle = st.gold ? "#ffd54a" : "#bfe6ff"; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, 4 + y0 + Math.round(Math.sin(t * 2)), 8, 3, 0, 0, 7); g.stroke();
  }
  function plantSpriteAt(ctx, x, y, ty) {
    var P = ["#46e2a4", "#ff6fc0", "#9a5cf0", "#ffc24a", "#4fb0ff"][ty % 5], xx = Math.round(x), yy = Math.round(y);
    ctx.fillStyle = "#2f6b4a"; ctx.fillRect(xx - 1, yy - 12, 3, 12);
    ctx.fillStyle = "#3f8a5e"; ctx.fillRect(xx - 4, yy - 8, 3, 2); ctx.fillRect(xx + 2, yy - 10, 3, 2);
    ctx.fillStyle = P; ctx.beginPath(); ctx.arc(xx + 0.5, yy - 15, 5, 0, 7); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(xx - 1, yy - 17, 2, 2);
  }
  function drawRock(ctx, x, y) {
    ctx.fillStyle = "rgba(20,30,15,0.2)"; ctx.beginPath(); ctx.ellipse(x, y + 7, 13, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#7f8492"; ctx.beginPath(); ctx.ellipse(x, y, 13, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#9aa0ad"; ctx.beginPath(); ctx.ellipse(x - 3, y - 3, 6, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#5e636f"; ctx.fillRect(x - 9, y + 4, 18, 2);
  }
  function drawTreeSprite(ctx, x, y) {
    ctx.fillStyle = "rgba(20,40,15,0.22)"; ctx.beginPath(); ctx.ellipse(x + 4, y + 4, 21, 7, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#6b4a2c"; ctx.fillRect(x - 4, y - 28, 9, 30); ctx.fillStyle = "#553a22"; ctx.fillRect(x - 4, y - 28, 3, 30);
    ctx.fillStyle = "#2f6330"; ctx.beginPath(); ctx.arc(x, y - 46, 26, 0, 7); ctx.fill();
    ctx.fillStyle = "#3f8036"; ctx.beginPath(); ctx.arc(x - 8, y - 50, 19, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x + 12, y - 44, 17, 0, 7); ctx.fill();
    ctx.fillStyle = "#5aa040"; ctx.beginPath(); ctx.arc(x - 3, y - 55, 13, 0, 7); ctx.fill();
    ctx.fillStyle = "#86c45a"; ctx.beginPath(); ctx.arc(x - 9, y - 57, 7, 0, 7); ctx.fill();
  }
  function drawCabin(ctx, x, y) {
    ctx.fillStyle = "rgba(20,30,15,0.2)"; ctx.beginPath(); ctx.ellipse(x + 6, y + 5, 48, 10, 0, 0, 7); ctx.fill();
    var w = 70, h = 44, lx = x - w / 2, ty = y - h;
    ctx.fillStyle = "#5e3c22"; ctx.beginPath(); ctx.moveTo(lx - 12, ty + 8); ctx.lineTo(x, ty - 30); ctx.lineTo(lx + w + 12, ty + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#7a4f2e"; ctx.beginPath(); ctx.moveTo(lx - 8, ty + 6); ctx.lineTo(x, ty - 25); ctx.lineTo(lx + w + 8, ty + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#5e3c22"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, ty - 22); ctx.lineTo(x, ty + 4); ctx.stroke();
    ctx.fillStyle = "#a06f40"; ctx.fillRect(lx, ty + 4, w, h - 4);
    ctx.fillStyle = "#7d5430"; for (var i = 9; i < h; i += 9) ctx.fillRect(lx, ty + 4 + i, w, 2);
    ctx.fillStyle = "#8a5d34"; ctx.fillRect(lx - 4, ty + 4, 6, h - 4); ctx.fillRect(lx + w - 2, ty + 4, 6, h - 4);
    ctx.fillStyle = "#3a2614"; ctx.fillRect(x - 9, y - 22, 18, 22);
    ctx.fillStyle = "#caa23a"; ctx.fillRect(x + 4, y - 12, 2, 3);
  }
  function drawChest(ctx, x, y) {
    ctx.fillStyle = "rgba(20,30,15,0.2)"; ctx.beginPath(); ctx.ellipse(x, y + 3, 17, 5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#7a4a24"; ctx.fillRect(x - 14, y - 13, 28, 15);
    ctx.fillStyle = "#9c6233"; ctx.fillRect(x - 14, y - 22, 28, 10);
    ctx.fillStyle = "#5a3318"; ctx.fillRect(x - 14, y - 12, 28, 2);
    ctx.fillStyle = "#e8c24a"; ctx.fillRect(x - 14, y - 22, 28, 2); ctx.fillRect(x - 14, y, 28, 2); ctx.fillRect(x - 2, y - 18, 4, 9);
  }
  function drawFence(ctx, x, y, segs) {
    ctx.fillStyle = "#9c6b3f"; ctx.fillRect(x, y - 11, segs * 22, 4); ctx.fillRect(x, y - 4, segs * 22, 4);
    for (var i = 0; i <= segs; i++) { var fx = x + i * 22; ctx.fillStyle = "#7d5430"; ctx.fillRect(fx, y - 15, 5, 19); ctx.fillStyle = "#a07a48"; ctx.fillRect(fx, y - 15, 5, 3); }
  }
  function drawCampfire(ctx, t, x, y) {
    var fl = 0.6 + 0.4 * Math.sin(t * 8);
    var glow = ctx.createRadialGradient(x, y, 4, x, y, 50); glow.addColorStop(0, "rgba(255,170,60," + (0.3 * fl) + ")"); glow.addColorStop(1, "rgba(255,170,60,0)"); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, 50, 0, 7); ctx.fill();
    ctx.strokeStyle = "#6b4a2e"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 10, y + 6); ctx.lineTo(x + 10, y + 2); ctx.moveTo(x + 10, y + 6); ctx.lineTo(x - 10, y + 2); ctx.stroke();
    ctx.fillStyle = "#ff7a2a"; ctx.beginPath(); ctx.moveTo(x, y - 18 - fl * 4); ctx.quadraticCurveTo(x - 8, y - 2, x - 5, y - 1); ctx.quadraticCurveTo(x + 8, y - 4, x, y - 18 - fl * 4); ctx.fill();
    ctx.fillStyle = "#ffd24a"; ctx.beginPath(); ctx.moveTo(x, y - 11 - fl * 3); ctx.quadraticCurveTo(x - 4, y - 2, x - 2, y - 1); ctx.quadraticCurveTo(x + 5, y - 3, x, y - 11 - fl * 3); ctx.fill();
  }
  var ISLAND = [[0, 0, 1], [-0.5, -0.32, 0.52], [0.54, -0.22, 0.56], [0.32, 0.5, 0.52], [-0.46, 0.46, 0.5], [0.02, -0.62, 0.46], [0, 0.64, 0.42]];
  // ---- tile-based island (squares, not circles): precompute the grid once ----
  var TILE = 26, SAND = null, GRASS = null, GRASSD = null, SHALLOW = null;
  function blobInside(wx, wy, scale) {
    for (var i = 0; i < ISLAND.length; i++) { var b = ISLAND[i], dx = wx - b[0] * RG, dy = wy - b[1] * RG, r = RG * b[2] * scale; if (dx * dx + dy * dy < r * r) return true; }
    return false;
  }
  function buildIsland() {
    SAND = []; GRASS = []; GRASSD = []; SHALLOW = [];
    var lim = Math.ceil(RG * 1.4 / TILE);
    for (var iy = -lim; iy <= lim; iy++) for (var ix = -lim; ix <= lim; ix++) {
      var wx = ix * TILE, wy = iy * TILE, g = blobInside(wx, wy, 0.92), s = blobInside(wx, wy, 1.06), sh = blobInside(wx, wy, 1.2);
      if (g) { GRASS.push([wx, wy]); if (((ix * 7 + iy * 13) & 3) === 0) GRASSD.push([wx, wy]); }
      if (s) SAND.push([wx, wy]); else if (sh) SHALLOW.push([wx, wy]);
    }
    // smooth organic island blobs (no more pixelated tile edges)
    grassBlob = new Path2D(); sandBlob = new Path2D(); darkBlob = new Path2D();
    ISLAND.forEach(function (b) { var cx = b[0] * RG, cy = b[1] * RG, r = RG * b[2]; grassBlob.moveTo(cx + r * 0.97, cy); grassBlob.arc(cx, cy, r * 0.97, 0, 7); sandBlob.moveTo(cx + r * 1.08, cy); sandBlob.arc(cx, cy, r * 1.08, 0, 7); darkBlob.moveTo(cx + r * 1.13, cy); darkBlob.arc(cx, cy, r * 1.13, 0, 7); });
  }
  function chevrons(ctx, W, H, t) {
    ctx.fillStyle = "rgba(228,242,253,0.6)";
    var o = [[0, 1], [1, 0], [2, 1], [3, 0], [4, 1]];
    for (var k = 0; k < 18; k++) {
      var bx = (k * 149 + (k % 3) * 47) % W, by = ((k * 103 + t * 6) % (H + 30)) - 15;
      for (var j = 0; j < 5; j++) ctx.fillRect(bx + o[j][0] * PXG, by + o[j][1] * PXG, PXG, PXG);
    }
  }
  // ---- one shared world renderer: drives BOTH the You-tab preview and full-screen game ----
  function renderWorld(ctx, W, H, vz, moving, t) {
    ensureHero();
    var col = (vState && vState.top) ? vState.top.c : "#8a5cf0";
    var st = { lv: vState ? vState.level : 1, color: col, gold: !!(S.game && S.game.ups && S.game.ups.gold), blink: (t % 4) > 3.85 };
    var mood = currentMood();
    // ocean: scrolling Cuphead water texture
    var wImg = WORLD_IMG.water, WS = 230;
    if (!waterPat && wImg && wImg.complete && wImg.naturalWidth) {
      var wc = document.createElement("canvas"); wc.width = WS; wc.height = WS; wc.getContext("2d").drawImage(wImg, 0, 0, WS, WS);
      waterPat = ctx.createPattern(wc, "repeat");
    }
    ctx.fillStyle = "#6f8a93"; ctx.fillRect(0, 0, W, H); // base ocean color behind everything (no gaps)
    ctx.save(); ctx.translate(W / 2 + (shake ? (Math.random() - 0.5) * shake * 2.4 : 0), H * 0.6 + (shake ? (Math.random() - 0.5) * shake * 2.4 : 0)); ctx.scale(vz, vz); ctx.translate(-(px + camX), -(py + camY)); // camX/camY = free-look pan (look around without moving the guy); character sits lower (David)
    if (waterPat) { var hw = W / vz, hh = H / vz, cxw = px + camX, cyw = py + camY; ctx.fillStyle = waterPat; ctx.fillRect(cxw - hw, cyw - hh, hw * 2, hh * 2); } // ocean tiles in WORLD space → zooms & pans at the SAME speed as the island (David 2026-06-24)
    if (!grassBlob) buildIsland();
    var GS = 200;
    // smooth Cuphead island: dark ink coastline → sandy beach → painted grass
    ctx.fillStyle = "#33271a"; ctx.fill(darkBlob);
    ctx.fillStyle = "#d9c89a"; ctx.fill(sandBlob);
    if (!grassPat && WORLD_IMG.grass && WORLD_IMG.grass.complete && WORLD_IMG.grass.naturalWidth) {
      var gc = document.createElement("canvas"); gc.width = GS; gc.height = GS; gc.getContext("2d").drawImage(WORLD_IMG.grass, 0, 0, GS, GS); grassPat = ctx.createPattern(gc, "repeat");
    }
    ctx.save(); ctx.clip(grassBlob); ctx.fillStyle = grassPat || "#a8b06a"; ctx.fillRect(-RG * 1.8, -RG * 1.8, RG * 3.6, RG * 3.6); ctx.restore();
    ctx.strokeStyle = "rgba(120,92,58,0.4)"; ctx.lineWidth = 13; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-58, -8); ctx.quadraticCurveTo(-30, 70, 18, 150); ctx.stroke();
    // Cuphead painted object cutouts (drawn back-to-front by y)
    // depth-sorted objects: those whose base is above the fairy draw behind her; those below draw in front (tall trees hide her)
    var OBJS = [[WORLD_IMG.tree, -152, -84, 158], [WORLD_IMG.tree, 190, -30, 148], [WORLD_IMG.cabin, -58, 2, 132], [WORLD_IMG.bush, 78, -136, 60], [WORLD_IMG.bush, -120, 72, 56], [WORLD_IMG.tree, 150, 74, 156], [WORLD_IMG.rock, -36, 124, 50], [WORLD_IMG.chest, -130, 28, 48], [WORLD_IMG.sign, 14, 44, 60]];
    OBJS.forEach(function (o) { if (o[2] <= py) drawObj(ctx, o[0], o[1], o[2], o[3]); });
    var gden = (S.game && S.game.garden) || [];
    for (var fi = 0; fi < gden.length; fi++) { var fa = fi * 2.39996 + 1, frr = 56 + (fi % 5) * 22, fx = Math.cos(fa) * frr, fy = Math.sin(fa) * frr; plantSpriteAt(ctx, fx, fy, gden[fi].t); }
    var jsc = 1 - Math.min(0.45, jz * 0.011);
    ctx.fillStyle = "rgba(20,30,15,0.25)"; ctx.beginPath(); ctx.ellipse(px, py + 2, 14 * jsc, 5 * jsc, 0, 0, 7); ctx.fill();
    var aur = ctx.createRadialGradient(px, py - 20, 4, px, py - 20, 54); aur.addColorStop(0, hexA(col, 0.12)); aur.addColorStop(1, hexA(col, 0)); ctx.fillStyle = aur; ctx.beginPath(); ctx.arc(px, py - 20, 54, 0, 7); ctx.fill();
    // 8-way facing from David's hand-picked spin frames (spr-dir.png, compass order, no mirroring → crown + wand correct).
    // Aim → direction cell; idle → front (row 0). Front = the 0s frame (per David).
    var aimX = (moveX2 !== 0 || moveY2 !== 0) ? moveX2 : moveX, aimY = (moveX2 !== 0 || moveY2 !== 0) ? moveY2 : moveY;
    var aiming = (aimX !== 0 || aimY !== 0), dr = FAIRY.dir, hHs = 132;
    if (aimX > 0.12) pface = 1; else if (aimX < -0.12) pface = -1;
    if (dr && dr.complete && dr.naturalWidth) {
      var ms = FAIRY_META.dir, row = 0;
      if (aiming) { var ang = Math.atan2(aimY, aimX), fk = (((Math.round((ang * FACE_DIR + FACE_OFF) / (Math.PI / 4))) % 8) + 8) % 8; row = DIR2CELL[fk]; }
      var hWs = hHs * ms.fw / ms.fh;
      if (bodySpin) { ctx.save(); ctx.translate(px, py - jz); ctx.rotate(bodySpin * Math.PI / 180); ctx.translate(-px, -(py - jz)); }
      ctx.drawImage(dr, 0, row * ms.fh, ms.fw, ms.fh, Math.round(px - hWs / 2), Math.round(py - hHs + 16 - jz), hWs, hHs);
      if (bodySpin) ctx.restore();
    } else {
      paintHero(t, st, walkF, moving);
      var hs = 2.3, hdw = HSW * hs, hdh = HSH * hs;
      ctx.drawImage(hspr, 0, 0, HSW, HSH, Math.round(px - hdw / 2), Math.round(py - hdh + 9), hdw, hdh);
    }
    OBJS.forEach(function (o) { if (o[2] > py) drawObj(ctx, o[0], o[1], o[2], o[3]); });  // objects in front of the fairy occlude her
    if (hasShippedToday()) { var sb = ctx.createRadialGradient(px, py - 16, 8, px, py - 16, 76); sb.addColorStop(0, "rgba(70,226,164,0.16)"); sb.addColorStop(1, "rgba(70,226,164,0)"); ctx.fillStyle = sb; ctx.beginPath(); ctx.arc(px, py - 16, 76, 0, 7); ctx.fill(); }
    for (var di = dust.length - 1; di >= 0; di--) { var dp = dust[di]; dp.x += dp.vx; dp.y += dp.vy; dp.vy += 0.13; dp.life--; if (dp.life <= 0) { dust.splice(di, 1); continue; } ctx.globalAlpha = Math.max(0, dp.life / 16); ctx.fillStyle = "#cdbfa6"; ctx.beginPath(); ctx.arc(dp.x, dp.y, 2.6, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
    ctx.restore();
    if (trickMsgT > 0) { trickMsgT--; ctx.save(); ctx.globalAlpha = Math.min(1, trickMsgT / 18); ctx.font = "800 30px 'Baloo 2',sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 5; ctx.strokeStyle = "#3a2540"; ctx.fillStyle = trickMsg === "BAIL!" ? "#ff6b6b" : "#ffd24a"; ctx.strokeText(trickMsg, W / 2, H * 0.3); ctx.fillText(trickMsg, W / 2, H * 0.3); ctx.restore(); }
    if (mood < 2) { ctx.fillStyle = "rgba(210,216,228," + ((2 - mood) * 0.1) + ")"; ctx.fillRect(0, 0, W, H); }
    if (gameOn) {
      var mmR = 42, mcx = 16 + mmR, mcy = 18 + mmR, msc = mmR / RS;
      ctx.save();
      ctx.beginPath(); ctx.arc(mcx, mcy, mmR, 0, 7); ctx.fillStyle = "rgba(30,12,30,0.55)"; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = "#3a2540"; ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.arc(mcx, mcy, mmR - 1, 0, 7); ctx.clip();
      ctx.beginPath(); ctx.arc(mcx, mcy, RG * msc, 0, 7); ctx.fillStyle = "#9aae5e"; ctx.fill();
      [[-58, 2, "#caa15a"], [14, 44, "#ffd24a"], [150, 74, "#46c46a"], [-130, 28, "#ffb23a"]].forEach(function (o) { ctx.beginPath(); ctx.arc(mcx + o[0] * msc, mcy + o[1] * msc, 2.6, 0, 7); ctx.fillStyle = o[2]; ctx.fill(); });
      ctx.beginPath(); ctx.arc(mcx + px * msc, mcy + py * msc, 3.4, 0, 7); ctx.fillStyle = "#ff5fa8"; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.restore(); ctx.restore();
    }
  }
  function drawWorld() {
    if (!gameOn || !wctx) return;
    var t = (performance.now() - GT0) / 1000;
    var SPD = 4.3 * (skateOk() ? 1.6 : 1), moving;
    if (moveX !== 0 || moveY !== 0) { camX *= 0.86; camY *= 0.86; if (Math.abs(camX) < 0.6) camX = 0; if (Math.abs(camY) < 0.6) camY = 0; } // walking eases the camera smoothly back to follow the guy (no hard snap) — David 2026-06-24
    if (skateOn && skateOk()) {
      // carving skate physics (ported from studio-sim): gradual turn + momentum + grip/drift + glide
      var mln = Math.hypot(moveX, moveY);
      if (mln > 0.05) {
        var ta = Math.atan2(moveY, moveX);
        if (skateAng === null) skateAng = ta;
        else { var df = ta - skateAng; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2; var ad = Math.abs(df); if (ad > Math.PI * 0.75) skateAng = ta; else skateAng += df * (ad > Math.PI * 0.3 ? 0.15 : 0.06); }
        pvx = pvx * 0.9 + Math.cos(skateAng) * SPD * 0.13; pvy = pvy * 0.9 + Math.sin(skateAng) * SPD * 0.13;
      } else { pvx *= 0.985; pvy *= 0.985; }
      var vs = Math.hypot(pvx, pvy);
      if (vs > 0.3 && skateAng !== null) { var bc = Math.cos(skateAng), bs = Math.sin(skateAng), al = pvx * bc + pvy * bs, pe = -pvx * bs + pvy * bc, dr = Math.abs(pe) / (Math.abs(al) + Math.abs(pe) + 0.01), gr = 0.92 - dr * 0.3; pvx = al * bc - pe * gr * bs; pvy = al * bs + pe * gr * bc; }
      pvx = Math.max(-7, Math.min(7, pvx)); pvy = Math.max(-7, Math.min(7, pvy)); px += pvx; py += pvy;
      moving = vs > 0.15; if (Math.abs(pvx) > 0.1) pface = pvx > 0 ? 1 : -1;
    } else {
      skateAng = null; pvx = 0; pvy = 0; moving = (moveX !== 0 || moveY !== 0);
      if (moving) { px += moveX * SPD; py += moveY * SPD; if (moveX > 0.15) pface = 1; else if (moveX < -0.15) pface = -1; walkT++; if (walkT > 8) { walkT = 0; walkF = 1 - walkF; } }
    }
    if (jvz !== 0 || jz > 0) {
      jz += jvz; jvz -= 0.95;
      if (jz > 24 && tricksOk()) {  // mid-air tricks on the right stick (gated on the trick-deck unlock)
        if (moveX2 < -0.4) bodySpin += 9; else if (moveX2 > 0.4) bodySpin -= 9;
        if (!flipState && skateOn && skateOk()) {
          var fu = moveY2 < -0.45, fd = moveY2 > 0.45, fl = moveX2 < -0.45, fr = moveX2 > 0.45, fkk = "";
          if (fu && fl) fkk = "up+left"; else if (fu && fr) fkk = "up+right"; else if (fd && fl) fkk = "down+left"; else if (fd && fr) fkk = "down+right"; else if (fu) fkk = "up"; else if (fd) fkk = "down"; else if (fl) fkk = "left"; else if (fr) fkk = "right";
          if (fkk && BOARD_FLIPS[fkk]) flipState = { n: BOARD_FLIPS[fkk].n, dur: BOARD_FLIPS[fkk].dur, t: 0, landed: false };
        }
      }
      if (flipState) { flipState.t++; if (flipState.t >= flipState.dur) flipState.landed = true; }
      if (jz <= 0) {
        jz = 0; jvz = 0;
        if (flipState || Math.abs(bodySpin) >= 150) {
          var landed = flipState ? flipState.landed : true;
          if (landed) { trickCombo++; var pts = trickCombo * 10; if (S.game) { S.game.spark = (S.game.spark || 0) + pts; S.game.total = (S.game.total || 0) + pts; } trickMsg = (flipState ? flipState.n : (Math.abs(bodySpin) >= 330 ? "360 SPIN" : "180 SPIN")) + (trickCombo > 1 ? " x" + trickCombo : "") + " +" + pts; trickMsgT = 70; shake = 4 + trickCombo * 2; for (var dd = 0; dd < 6; dd++) dust.push({ x: px + (Math.random() - 0.5) * 18, y: py + 4, vx: (Math.random() - 0.5) * 2.4, vy: -Math.random() * 1.2, life: 16 }); save(); renderGame(); }
          else { trickMsg = "BAIL!"; trickMsgT = 40; shake = 6; trickCombo = 0; }
        }
        bodySpin = 0; flipState = null;
      }
    }
    if (shake > 0.3) shake *= 0.82; else shake = 0;
    var bound = RS - 8, d = Math.sqrt(px * px + py * py); if (d > bound) { px = px / d * bound; py = py / d * bound; }
    renderWorld(wctx, WGW, WGH, zoom, moving, t);
    // moody night tint — grass & water shift purple (David 2026-06-24)
    wctx.save(); wctx.globalCompositeOperation = "multiply"; wctx.globalAlpha = 0.6; wctx.fillStyle = "#4a3a85"; wctx.fillRect(0, 0, WGW, WGH); wctx.globalCompositeOperation = "soft-light"; wctx.globalAlpha = 0.5; wctx.fillStyle = "#7a4fd0"; wctx.fillRect(0, 0, WGW, WGH); wctx.restore();
    if (ghudT++ % 30 === 0) updGameHud();
    requestAnimationFrame(drawWorld);
  }
  function updGameHud() {
    var h = el("gameHud"); if (!h) return;
    var sp = (S.game && S.game.spark) || 0;
    var PROMPTS = [];
    var hint = "← tap to head back", best = 999;
    for (var i = 0; i < PROMPTS.length; i++) { var d = Math.hypot(px - PROMPTS[i][0], py - PROMPTS[i][1]); if (d < 74 && d < best) { best = d; hint = PROMPTS[i][2]; } }
    h.innerHTML = "✨ " + sp + " Spark" + (hasShippedToday() ? " · 🌱 your island grew today" : " · ship 1 real thing to grow your island") + "<br><span style='opacity:.82;font-size:12px'>" + hint + "</span>";
  }
  function openGame() {
    var gm = el("gameMode"); if (!gm) return;
    gm.classList.add("on"); worldFit(); updGameHud(); wireWorldTap();
    document.body.classList.add("gaming"); document.body.style.overflow = "hidden";
    if (!gameOn) { gameOn = true; requestAnimationFrame(drawWorld); }
  }
  function closeGame() {
    var gm = el("gameMode"); if (gm) gm.classList.remove("on");
    document.body.classList.remove("gaming");
    gameOn = false; moveX = 0; moveY = 0; document.body.style.overflow = "";
  }
  // ---- game-as-home: tap the character → diegetic action hub ----
  function goTab(t) { document.body.classList.add("overworld"); if (!gameOn) openGame(); var nb = document.querySelector('#nav .nb[data-tab="' + t + '"]'); if (nb) nb.click(); if (t === "day") { pendingScrollNow = true; renderToday(); } }
  function closeFeature() { document.body.classList.remove("overworld"); if (!gameOn) openGame(); }
  function heroMenu() { mindmapSheet(); } // tap the fairy → identity "see your life" mindmap (§13: center = who am I; the pull-down day-hub lives on the top tracker strip).
  var worldTapWired = false;
  // diegetic access points — walk up to a building and tap it to open its menu (Sims-style)
  var WORLD_SPOTS = [
    { x: -58, y: 2, r: 62, fn: function () { closeGame(); brainSheet(); } },  // cabin → brain / settings / profile
    { x: 14, y: 44, r: 48, fn: function () { goTab("day"); } },               // notice board → plan your day
    { x: 150, y: 74, r: 66, fn: function () { goTab("self"); } },             // tree → skills / character
    { x: -130, y: 28, r: 46, fn: function () { goTab("grow"); } }             // chest → habits
  ];
  function wireWorldTap() { // drag the world to PAN the camera around the island (free-look, doesn't move the guy) — David 2026-06-24
    if (worldTapWired) return; worldTapWired = true; var w = el("world"); if (!w) return;
    var pts = {}; // track active pointers so a two-finger PINCH never also pans (David 2026-06-24)
    function npts() { return Object.keys(pts).length; }
    function rel(ev) { delete pts[ev.pointerId]; }
    w.addEventListener("pointerup", rel); w.addEventListener("pointercancel", rel); document.addEventListener("pointerup", rel); document.addEventListener("pointercancel", rel);
    w.addEventListener("pointerdown", function (ev) {
      pts[ev.pointerId] = 1;
      if (ev.target !== w) return; // only pan when grabbing the world itself — never from a zoom/joystick/notebook button on top
      if (pinch0 > 0 || npts() >= 2) return; // a pinch-zoom is in progress → don't pan (fixes zoom-and-pan-at-once) — David 2026-06-24
      var sx = ev.clientX, sy = ev.clientY, lx = sx, ly = sy, moved = false, lim = (typeof RS !== "undefined" ? RS : 200) * 1.3;
      function mv(e) { if (pinch0 > 0 || npts() >= 2) { up(); return; } if (!moved) { if (Math.abs(e.clientX - sx) < 6 && Math.abs(e.clientY - sy) < 6) return; moved = true; } var dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; camX = Math.max(-lim, Math.min(lim, camX - dx / zoom)); camY = Math.max(-lim, Math.min(lim, camY - dy / zoom)); } // a 2nd finger lands → abandon the pan, it's a pinch; require a real drag (>6px) so a tap never pans
      function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); }
      document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
    });
  }
  function paintGuardian(t, st) {
    var g = gsx, cxc = 32; g.clearRect(0, 0, SW, SH);
    var robe = mix("#4a36a0", st.color, 0.22), robeD = mix("#2c2068", st.color, 0.16), robeH = mix("#7d66da", st.color, 0.22);
    var skin = "#ffd9b4", skinD = "#e7b186";
    var bTop = 38, bBot = 78;
    for (var y = bTop; y <= bBot; y++) { var f = (y - bTop) / (bBot - bTop); var hw = Math.round(9 + f * 13); g.fillStyle = robeD; g.fillRect(cxc - hw - 1, y, 2 * hw + 2, 1); g.fillStyle = robe; g.fillRect(cxc - hw, y, 2 * hw, 1); g.fillStyle = robeH; g.fillRect(cxc - hw + 1, y, 3, 1); }
    gdisc(g, cxc - 17, 60, 4, skinD); gdisc(g, cxc - 17, 59, 3, skin);
    gdisc(g, cxc + 17, 60, 4, skinD); gdisc(g, cxc + 17, 59, 3, skin);
    gdisc(g, cxc, 27, 16, robeD); gdisc(g, cxc, 27, 15, robe); gdisc(g, cxc, 23, 12, robeH);
    gdisc(g, cxc, 30, 12, skinD); gdisc(g, cxc, 30, 11, skin);
    var ey = 30, exl = cxc - 5, exr = cxc + 5;
    if (st.blink) { g.fillStyle = "#3a2a4a"; g.fillRect(exl - 2, ey, 4, 2); g.fillRect(exr - 1, ey, 4, 2); }
    else { [exl, exr].forEach(function (ex) { gdisc(g, ex, ey, 3, "#ffffff"); gdisc(g, ex, ey, 2, st.color); gdisc(g, ex, ey, 1, "#1c1030"); g.fillStyle = "#fff"; g.fillRect(ex + 1, ey - 2, 1, 1); }); }
    g.fillStyle = "#ff9ec4"; g.fillRect(cxc - 10, 34, 3, 2); g.fillRect(cxc + 7, 34, 3, 2);
    g.fillStyle = "#c47a64"; g.fillRect(cxc - 2, 36, 4, 1); g.fillRect(cxc - 3, 35, 1, 1); g.fillRect(cxc + 2, 35, 1, 1);
    var hy = 9 + Math.round(Math.sin(t * 2) * 1), hc = st.gold ? "#ffd54a" : "#bfe6ff";
    gring(g, cxc, hy, 11, 4, hc, 1);
  }
  function plantSprite(x, y, t) {
    var P = ["#46e2a4", "#ff6fc0", "#9a5cf0", "#ffc24a", "#4fb0ff"][t % 5], xx = Math.round(x), yy = Math.round(y);
    gctx.fillStyle = "#2f6b4a"; gctx.fillRect(xx - 1, yy - 12, 3, 12);
    gctx.fillStyle = "#3f8a5e"; gctx.fillRect(xx - 4, yy - 8, 3, 2); gctx.fillRect(xx + 2, yy - 10, 3, 2);
    gctx.fillStyle = P; gctx.beginPath(); gctx.arc(xx + 0.5, yy - 15, 5, 0, 7); gctx.fill();
    gctx.fillStyle = "rgba(255,255,255,.55)"; gctx.fillRect(xx - 1, yy - 17, 2, 2);
  }
  function drawGarden(baseY, width) {
    var g = (S.game && S.game.garden) || [], n = g.length; if (!n) return; var W = width || GW;
    for (var i = 0; i < n; i++) { var frac = n === 1 ? 0.5 : i / (n - 1), gx = W * (0.06 + frac * 0.88), gy = baseY + 5 + (i % 2) * 4; plantSprite(gx, gy, g[i].t); }
  }
  function plantGarden() {
    if (!hasShippedToday()) { toast("ship one real thing today — then your world grows 🌱"); return; }
    var n = (S.game.garden || []).length, cost = 20 * (n + 1);
    if (S.game.spark < cost) { toast("not enough Spark yet — earn a little more"); return; }
    S.game.spark -= cost; S.game.garden.push({ t: n % 5 }); save(); renderGame(); toast("🌱 planted — your world grew");
  }
  var MOODS = [{ e: "🌫️", l: "Foggy" }, { e: "🌥️", l: "Heavy" }, { e: "⛅", l: "Okay" }, { e: "☀️", l: "Clear" }, { e: "✨", l: "Radiant" }];
  function currentMood() { var m = S && S.mood && S.mood[todayK()]; return m ? m.lvl : 2; }
  function drawGuardian() {
    if (!gctx) { requestAnimationFrame(drawGuardian); return; }
    var t = (performance.now() - GT0) / 1000;
    renderWorld(gctx, GW, GH, 1.15, false, t);   // the You-tab preview IS the world (window into the same island)
    requestAnimationFrame(drawGuardian);
  }
  function setMood(i) { S.mood = S.mood || {}; S.mood[todayK()] = { lvl: i, t: Date.now() }; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Mood: " + MOODS[i].l, mins: 1, catK: "love", color: "#9a5cf0" }); earn(2, { catK: "love" }); save(); renderMood(); renderGame(); }
  function renderMood() { var M = el("moodRow"); if (!M) return; M.innerHTML = ""; var cur = currentMood(); add(M, "div", "qlab", "🌦️ your inner weather — how do you feel?"); var row = add(M, "div", "moods"); MOODS.forEach(function (m, i) { var c = add(row, "div", "mood" + (cur === i ? " on" : "")); add(c, "div", "moode", m.e); add(c, "div", "moodl", m.l); c.onclick = function () { setMood(i); }; }); }

  // ---- render ------------------------------------------------------------
  function renderHeader() { el("date").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); var p = phase(); el("hello").textContent = (p === "morning" ? "Good morning" : p === "afternoon" ? "Good afternoon" : p === "evening" ? "Good evening" : "Hey") + " 👋"; }
  function renderHero() { var cap = el("guardianCap"); if (cap) { if (S.profile && S.profile.set && vState) cap.innerHTML = "<b>" + (VCLASS[vState.top.k] || "Awakening") + "</b> · Lv " + vState.level + "  ·  ✨ " + S.game.spark.toLocaleString(); else cap.textContent = "your mirror — it grows when you do"; } var pr = proactive(), h = el("hero"); h.innerHTML = ""; add(h, "div", "ht", pr.kicker); add(h, "div", "hl", pr.line); add(h, "div", "hs", pr.sub); add(h, "button", "hp", pr.primary.label).onclick = pr.primary.fn; if (pr.chips.length) { var c = add(h, "div", "chips"); pr.chips.forEach(function (ch) { add(c, "div", "chip", ch.label).onclick = ch.fn; }); } }

  var vState = null;
  function renderChar() {
    var L = el("charFoot"); L.innerHTML = "";
    if (!(S.profile && S.profile.set)) { el("statLvl").textContent = ""; vState = null; renderPulls(); var b = add(L, "button", "done2", "✨ Set up your world →"); b.onclick = onboard; return; }
    var v = virtues(); vState = v;
    el("statLvl").textContent = (VCLASS[v.top.k] || "") + " · Lv " + v.level;
    var P = S.profile, parts = []; if (P.age) parts.push("🧬 " + P.age + (P.gender ? " " + ({ m: "♂", f: "♀", o: "⚧" }[P.gender] || "") : "")); if (P.goals) parts.push("🎯 " + P.goals); if (parts.length) add(L, "div", "pfline", parts.join("   ·   "));
    var h = add(L, "div", "lbl", "tap a star to open its skill tree ✨"); h.style.textAlign = "center"; h.style.marginTop = "4px";
    var sv = add(L, "button", "add", "📊 calibrate my levels"); sv.style.cssText = "margin:10px auto 0;display:block;"; sv.onclick = surveySheet;
    var bn = add(L, "button", "add", "🧠 brain (free AI)"); bn.style.cssText = "margin:8px auto 0;display:block;"; bn.onclick = brainSheet;
    var ml = add(L, "button", "add", "🌳 See your life"); ml.style.cssText = "margin:8px auto 0;display:block;"; ml.onclick = mindmapSheet; // the identity mindmap (§21)
    var wb = add(L, "button", "add", "🌅 Wake & bedtime"); wb.style.cssText = "margin:8px auto 0;display:block;"; wb.onclick = wakeBedSheet; // 1-tap re-set of the day frame (David 2026-06-26)
    var rs = add(L, "button", "add", "✨ Redo setup"); rs.style.cssText = "margin:8px auto 0;display:block;"; rs.onclick = onboard; // re-run onboarding anytime (David asked)
    var re = add(L, "button", "add", "edit"); re.style.cssText = "margin:8px auto 0;display:block;"; re.onclick = charSheet;
    renderPulls();
  }
  function renderPulls() {
    var d7 = lastDays(7), vm = {}; d7.forEach(function (k) { logs(k).forEach(function (e) { if (catOf(e) === "vice") vm[e.title] = (vm[e.title] || 0) + (e.mins || 0); }); });
    var pulls = Object.keys(vm).map(function (t) { var min = vm[t], r = min < 30 ? { l: "light", e: "🌱", c: "#23c98a" } : min < 150 ? { l: "moderate", e: "🌀", c: "#ff9f1c" } : { l: "heavy", e: "🔥", c: "#ff7a4d" }; return { title: t, min: min, rate: r }; }).sort(function (a, b) { return b.min - a.min; });
    var pl = el("pullList"), lab = el("pullLab"); pl.innerHTML = "";
    if (pulls.length) { lab.style.display = "flex"; pulls.forEach(function (v) { var r = add(pl, "div", "pull"); r.appendChild(dot(v.rate.c)); add(r, "div", null, v.rate.e + " " + v.title).style.flex = "1"; var t = add(r, "div", null, v.rate.l + " · " + dur(v.min) + "/wk"); t.style.cssText = "font-family:var(--bub);font-weight:800;font-size:13px;color:" + v.rate.c; }); } else lab.style.display = "none";
  }

  // ---- the game: spark currency + compounding upgrades -------------------
  function hasShippedToday() { var lg = logs(todayK()), i; for (i = 0; i < lg.length; i++) if (virtueOf(lg[i]) === "courage") return true; var bl = blocks(todayK()); for (i = 0; i < bl.length; i++) if (bl[i].done && virtueOf(bl[i]) === "courage") return true; return false; }
  function earn(base, ctx) { var got = Math.max(1, Math.round(base)); S.game.spark += got; S.game.total += got; save(); var sp = el("spark"); if (sp) { sp.style.transition = "none"; sp.style.transform = "scale(1.14)"; setTimeout(function () { sp.style.transition = "transform .3s"; sp.style.transform = "scale(1)"; renderGame(); }, 30); try { var r0 = sp.getBoundingClientRect(); var fl = document.createElement("div"); fl.className = "spark-float"; fl.textContent = "+" + got; fl.style.left = (r0.left + r0.width / 2 + (Math.random() * 26 - 13)) + "px"; fl.style.top = (r0.top + 2) + "px"; document.body.appendChild(fl); setTimeout(function () { try { fl.remove(); } catch (e) {} }, 950); } catch (e) {} } } // floating +N feedback so earning Spark feels good (David 2026-06-24 night)
  function renderGame() {
    var sp = el("spark"); if (!sp) return; var L = el("upgrades"); if (L) L.innerHTML = "";
    if (!(S.profile && S.profile.set)) { sp.textContent = ""; return; }
    var shipped = hasShippedToday();
    sp.innerHTML = "✨ " + S.game.spark.toLocaleString() + " <span style='font-size:11px;opacity:.7;font-weight:600;'>Spark</span>" + (shipped ? " <span style='font-size:12px;color:#46e2a4;'>· 🌱 today grew</span>" : " <span style='font-size:11px;color:#ffc24a;'>· ship 1 thing to grow</span>");
    if (L) {
      var n = (S.game.garden || []).length, cost = 20 * (n + 1);
      var pb = add(L, "button", "done2", "🌱 Plant in your world · ✨" + cost); pb.style.marginTop = "8px"; pb.disabled = !shipped || S.game.spark < cost; pb.onclick = plantGarden;
      var h = add(L, "div", "lbl", shipped ? (n + " planted — your world fills as you do") : "ship one real thing today, then plant"); h.style.cssText = "font-size:12px;text-align:center;margin-top:6px;";
      var bcost = 120;
      if (!(S.game.ups && S.game.ups.board)) {
        var sb = add(L, "button", "done2", "🛹 Build a skateboard · ✨" + bcost); sb.style.marginTop = "8px"; sb.disabled = S.game.spark < bcost;
        sb.onclick = function () { if (S.game.spark < bcost) return; S.game.spark -= bcost; S.game.ups = S.game.ups || {}; S.game.ups.board = true; save(); renderGame(); };
      } else {
        add(L, "div", "lbl", "🛹 Skateboard built — tap the left pad to skate").style.cssText = "font-size:12px;text-align:center;margin-top:6px;";
        var tcost = 400;
        if (!(S.game.ups && S.game.ups.tricks)) {
          var tb = add(L, "button", "done2", "🛼 Trick deck · ✨" + tcost); tb.style.marginTop = "8px"; tb.disabled = S.game.spark < tcost;
          tb.onclick = function () { if (S.game.spark < tcost) return; S.game.spark -= tcost; S.game.ups = S.game.ups || {}; S.game.ups.tricks = true; save(); renderGame(); };
        } else { add(L, "div", "lbl", "🛼 Trick deck — jump while skating, flick the right stick for flips & spins").style.cssText = "font-size:12px;text-align:center;margin-top:6px;"; }
      }
    }
  }

  var MICRO = [
    { e: "💧", l: "Drink water", catK: "energy", mins: 1, sp: 3 },
    { e: "🧍", l: "Stand & move", catK: "energy", mins: 2, sp: 3 },
    { e: "🌬️", l: "2-min breath", catK: "energy", mins: 2, sp: 5, habitId: "breathe", breath: true },
    { e: "🤸", l: "Quick stretch", catK: "energy", mins: 2, sp: 4 },
    { e: "🧘", l: "Mindfulness check", catK: "love", mins: 2, sp: 5 },
    { e: "🙏", l: "One gratitude", catK: "love", mins: 1, sp: 4 },
    { e: "📞", l: "Reach someone", catK: "love", mins: 3, sp: 6 },
    { e: "☀️", l: "Step outside", catK: "energy", mins: 3, sp: 4 },
    { e: "🪥", l: "Tidy one thing", catK: "energy", mins: 3, sp: 3, habitId: "tidy" },
    { e: "📵", l: "Phone down 10m", catK: "energy", mins: 10, sp: 5 },
    { e: "🧘", l: "Relax all muscles", catK: "energy", mins: 2, sp: 5, relax: true },
    { e: "🧘", l: "Meditate", catK: "love", mins: 5, sp: 8, med: true },
    { e: "👆", l: "Tapping (EFT)", catK: "love", mins: 3, sp: 7, tap: true },
    { e: "🗣️", l: "Mantra", catK: "love", mins: 3, sp: 7, mantra: true }
  ];
  var MICROPHASE = { morning: [2, 11, 13, 7], afternoon: [10, 1, 11, 12], evening: [11, 12, 6, 8], night: [2, 13, 11, 9] };
  function microState() { var k = todayK(); S.microState = S.microState || {}; return (S.microState[k] = S.microState[k] || {}); }
  function microTap(mi, chip) {
    var st = microState(), cur = st[mi], m = MICRO[mi], col = m.catK === "love" ? "#ff4fa0" : "#ff8a1e";
    if (m.breath && !cur) { breathwork(4); return; }   // guided breathwork moment (logs itself on finish)
    if (m.relax && !cur) { relaxMoment(); return; }     // Psycho-Cybernetics relax-all-muscles + mindful moment
    if (m.med && !cur) { meditation(); return; }         // adaptive guided meditation — now in David's 4 teachers' voices
    if (m.tap && !cur) { tapping(); return; }            // EFT tapping body-map (exact 9-point order, tap-only)
    if (m.mantra && !cur) { mantraPlayer(); return; }    // David's own affirmation — the keystone willpower-free step
    if (!cur) {
      var t = nextFreeMin(todayK()), id = uid();
      blocks(todayK()).push({ id: id, time: pad(Math.floor(t / 60)) + ":" + pad(t % 60), mins: Math.max(5, m.mins), title: m.l, prio: 1, color: col, done: false });
      reflow(todayK()); st[mi] = { s: "planned", bid: id }; save(); renderQuick(); renderToday();
    } else if (cur.s === "planned") {
      var bl = blocks(todayK()); for (var i = 0; i < bl.length; i++) if (bl[i].id === cur.bid) { bl[i].done = true; break; }
      var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: m.l, mins: m.mins, catK: m.catK, color: col, habitId: m.habitId || null });
      if (m.habitId) doneMap(todayK())[m.habitId] = true;
      earn(m.sp, { catK: m.catK }); st[mi] = { s: "done" }; save();
      if (chip) chip.classList.add("won"); setTimeout(function () { renderQuick(); renderGame(); renderToday(); }, 360);
    }
  }
  // guided breathwork: paced orb (inhale/hold/exhale) + synced tone + cues, then logs + rewards
  function breathwork(cycles, onDone) {
    cycles = cycles || 4;
    TTS.unlock(); // gesture-bound (chip tap) — unlock the speech engine in the same synchronous tick
    var PH = [["Breathe in", 4000, "in"], ["Hold", 4000, "hold"], ["Breathe out", 6000, "out"], ["Rest", 2000, "rest"]];
    var ov = document.createElement("div"); ov.id = "breatheOv";
    ov.innerHTML = '<button class="bw-x">skip</button><div class="bw-orb"></div><div class="bw-label">Get comfy…</div><div class="bw-sub">follow the orb</div>';
    document.body.appendChild(ov); addVoiceToggle(ov);
    var orb = ov.querySelector(".bw-orb"), lab = ov.querySelector(".bw-label"), sub = ov.querySelector(".bw-sub");
    var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
    try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 200; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); } } catch (e) { actx = null; }
    var done = false, tmr = null;
    function finish(skip) {
      if (done) return; done = true; if (tmr) clearTimeout(tmr); TTS.stop();
      if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.35); osc.stop(actx.currentTime + 0.45); } catch (e) {} }
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Breathe", mins: 2, catK: "energy", color: "#6a5cf0", habitId: "breathe" }); doneMap(todayK())["breathe"] = true; earn(6, { catK: "energy" }); save(); renderAll(); }
      if (onDone) onDone();
    }
    ov.querySelector(".bw-x").onclick = function () { finish(true); };
    var cyc = 0, phi = 0;
    setTimeout(step, 900);
    function step() {
      if (done) return;
      if (cyc >= cycles) { lab.textContent = "Done ✓"; sub.textContent = "carry the calm with you"; orb.style.transition = "transform 1.2s ease"; orb.style.transform = "scale(.7)"; tmr = setTimeout(function () { finish(false); }, 1500); return; }
      var p = PH[phi], dur = p[1], kind = p[2];
      lab.textContent = p[0]; sub.textContent = "cycle " + (cyc + 1) + " / " + cycles;
      if (kind !== "rest") say(p[0], VPROF.breath); // speak the short phase cue; silence holds the count

      orb.style.transition = "transform " + (dur / 1000) + "s cubic-bezier(.45,0,.4,1)";
      if (kind === "in") orb.style.transform = "scale(1.32)"; else if (kind === "out") orb.style.transform = "scale(.5)";
      if (actx) { var now = actx.currentTime, t = dur / 1000; osc.frequency.cancelScheduledValues(now); osc.frequency.setValueAtTime(osc.frequency.value, now); gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(gain.gain.value, now);
        if (kind === "in") { osc.frequency.linearRampToValueAtTime(340, now + t); gain.gain.linearRampToValueAtTime(0.06, now + 0.4); }
        else if (kind === "out") { osc.frequency.linearRampToValueAtTime(165, now + t); gain.gain.linearRampToValueAtTime(0.02, now + t); }
        else { gain.gain.linearRampToValueAtTime(kind === "hold" ? 0.05 : 0.01, now + 0.3); } }
      phi++; if (phi >= PH.length) { phi = 0; cyc++; }
      tmr = setTimeout(step, dur);
    }
  }
  // Psycho-Cybernetics ARRIVAL as a standalone: relax all muscles + a mindful moment (the universal opener of every stack module)
  function relaxMoment(onDone) {
    TTS.unlock();
    var STEPS = [["Settle in…", "let your eyes soften", 2600], ["Soften your forehead", "and unclench your jaw", 3400], ["Drop your shoulders", "let them fall", 3400], ["Soften your chest", "and your belly", 3400], ["Let your arms go heavy", "down to your fingertips", 3400], ["Release your legs", "all the way to your feet", 3400], ["Your whole body is heavy and calm", "nothing to do, nowhere to be", 3800], ["One mindful moment", "just be here, now", 5200]];
    var ov = document.createElement("div"); ov.id = "breatheOv";
    ov.innerHTML = '<button class="bw-x">skip</button><div class="bw-orb"></div><div class="bw-label">Relax…</div><div class="bw-sub"></div>';
    document.body.appendChild(ov); addVoiceToggle(ov);
    var orb = ov.querySelector(".bw-orb"), lab = ov.querySelector(".bw-label"), sub = ov.querySelector(".bw-sub");
    orb.style.animation = "breathe 9s ease-in-out infinite";
    var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
    try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 150; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); gain.gain.linearRampToValueAtTime(0.03, actx.currentTime + 1.6); } } catch (e) { actx = null; }
    var done = false, i = 0, tmr = null;
    function finish(skip) {
      if (done) return; done = true; if (tmr) clearTimeout(tmr); TTS.stop();
      if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4); osc.stop(actx.currentTime + 0.5); } catch (e) {} }
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Mindful moment", mins: 2, catK: "energy", color: "#9a5cf0" }); earn(5, { catK: "energy" }); save(); renderAll(); }
      if (onDone) onDone();
    }
    ov.querySelector(".bw-x").onclick = function () { finish(true); };
    function step() { if (done) return; if (i >= STEPS.length) { lab.textContent = "Done ✓"; sub.textContent = "carry the calm with you"; tmr = setTimeout(function () { finish(false); }, 1500); return; } lab.textContent = STEPS[i][0]; sub.textContent = STEPS[i][1]; say(STEPS[i][0] + ", " + STEPS[i][1], VPROF.relax); tmr = setTimeout(step, STEPS[i][2]); i++; }
    setTimeout(step, 700);
  }
  // adaptive guided meditation: YOU choose how often it re-anchors you (for a 0-attention-span mind) + modular focus + tiny durations
  function meditation() {
    var FREQ = { often: 11, some: 24, spacious: 42 };  // seconds between gentle re-anchoring cues
    // David's actual 4-in-1: each guide is an ORDERED sequence in that teacher's own voice (drawn from his transcripts in meditation-scripts/),
    // and once it reaches the end it rests on the last 3 lines so a long sit still feels guided. orb = breathe-animation seconds.
    var GUIDES = {
      harris: { name: "witness", who: "Sam Harris", orb: 8, seq: ["Feel yourself sitting here", "Let gravity settle you into your seat", "Find the breath — the tip of the nose, or the belly", "No need to control it — just let it come and go", "When the mind wanders, gently bring it back to the breath", "Notice a thought arise… and watch where it goes", "Notice the sounds — they arise on their own", "Let each sound reveal the space it appears in", "Simply witness whatever arises and passes", "Nothing falls outside this — just be aware"] },
      headspace: { name: "reset", who: "Headspace", orb: 8, seq: ["Soft focus — just aware of the space around you", "A few big breaths… in through the nose, out through the mouth", "Let the body soften with each out-breath", "Nothing to do, nothing to respond to — just time for you", "Feel the weight of the body pressing down", "Nothing to change — just noticing how the body feels", "Find the breath rising and falling", "One on the in-breath… two on the out-breath", "Feel that sense of space with each exhale", "Thoughts come — that's fine. Gently back to the breath", "Now let the mind be completely free"] },
      blackstone: { name: "embody", who: "Blackstone", orb: 10, seq: ["Calm, even breath — nothing happening but this breath", "Come down into your feet — deep contact", "Attune to the quality of self inside your feet", "Inhabit your legs… your hips… settle down into them", "Inhabit your belly — attune to the quality of power there", "Inhabit your chest — attune to the quality of love", "Let the breath move gently through the heart", "Inhabit your whole body at once — this is yours", "Find the space outside your body, in the room", "Inside and outside are one continuous space", "Feel that you ARE that space"] },
      adya: { name: "rest", who: "Adyashanti", orb: 12, seq: ["There's nothing to do here", "Awareness is already present — you don't make it happen", "Relinquish the doer — pat it on the head, it's irrelevant", "Not the watcher, not the witness — just resting", "Let everything be exactly as it is, right now", "The mind says 'understand one more thing' — don't take the bait", "Just rest as awareness", "Whenever you've drifted, simply rest again", "Nothing for the mind to do… and that's okay", "You and awareness are not two"] }
    };
    var cfg = { mins: 5, freq: "often", guide: "harris" };
    var ov = document.createElement("div"); ov.id = "breatheOv"; document.body.appendChild(ov);
    function build() {
      ov.innerHTML = "";
      var x = add(ov, "button", "bw-x", "close"); x.onclick = function () { TTS.stop(); if (ov.parentNode) ov.remove(); };
      var box = add(ov, "div"); box.style.cssText = "width:88%;max-width:420px;color:#efeaff;font-family:var(--bub);text-align:center;";
      box.innerHTML = '<div style="font-size:26px;font-weight:800;">🧘 Meditate</div><div style="font-size:13px;color:#bcb0e8;margin-bottom:12px;">even a tiny one counts</div>';
      function row(title, opts, key) {
        var lbl = add(box, "div", null, title); lbl.style.cssText = "font-size:12px;color:#bcb0e8;font-weight:700;margin:13px 0 7px;text-transform:uppercase;letter-spacing:.5px;";
        var r = add(box, "div"); r.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;justify-content:center;";
        opts.forEach(function (o) { var b = add(r, "button", null, o[0]); b.style.cssText = "border:2.5px solid #6a5a9a;border-radius:14px;padding:9px 14px;font-family:var(--bub);font-weight:800;font-size:14px;cursor:pointer;color:#efeaff;background:" + (cfg[key] === o[1] ? "#9a7cff" : "rgba(255,255,255,.06)") + ";"; b.onclick = function () { cfg[key] = o[1]; build(); }; });
      }
      row("how long", [["2 min", 2], ["5 min", 5], ["10 min", 10]], "mins");
      row("remind me", [["often", "often"], ["some", "some"], ["spacious", "spacious"]], "freq");
      row("guide", [["witness", "harris"], ["reset", "headspace"], ["embody", "blackstone"], ["rest", "adya"]], "guide");
      var who = add(box, "div", null, "with " + GUIDES[cfg.guide].who); who.style.cssText = "font-size:11px;color:#9c8fc4;margin-top:6px;font-style:italic;";
      var begin = add(box, "button", null, "Begin ▶"); begin.style.cssText = "margin-top:18px;background:#9a7cff;color:#fff;border:3px solid #3a2540;border-radius:18px;padding:13px 28px;font-family:var(--bub);font-weight:800;font-size:17px;cursor:pointer;box-shadow:0 5px 0 #3a2540;"; begin.onclick = run;
      var hint = add(box, "div", null, "0 attention span? pick “often” — I’ll gently bring you back every few seconds, so you can’t fail."); hint.style.cssText = "font-size:11.5px;color:#9c8fc4;margin-top:15px;line-height:1.45;";
    }
    function run() {
      TTS.unlock(); // gesture-bound: this runs inside the "Begin ▶" tap
      ov.innerHTML = '<button class="bw-x">skip</button><div class="bw-orb"></div><div class="bw-label"></div><div class="bw-sub"></div>';
      addVoiceToggle(ov);
      var orb = ov.querySelector(".bw-orb"), lab = ov.querySelector(".bw-label"), sub = ov.querySelector(".bw-sub");
      var G = GUIDES[cfg.guide];
      orb.style.animation = "breathe " + G.orb + "s ease-in-out infinite";
      var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
      try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 110; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); gain.gain.linearRampToValueAtTime(0.025, actx.currentTime + 2); } } catch (e) { actx = null; }
      var seq = G.seq, tail = seq.slice(-3), ci = 0, total = cfg.mins * 60, elapsed = 0, done = false, cueT = null, tickT = null, sT = null;
      function cue() { if (done) return; var line = ci < seq.length ? seq[ci] : tail[(ci - seq.length) % tail.length]; lab.textContent = line; say(line, VPROF.med); ci++; sub.textContent = ""; if (sT) clearTimeout(sT); sT = setTimeout(function () { if (!done) sub.textContent = "…"; }, 3500); }
      function finish(skip) { if (done) return; done = true; TTS.stop(); if (cueT) clearInterval(cueT); if (tickT) clearInterval(tickT); if (sT) clearTimeout(sT); if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.6); osc.stop(actx.currentTime + 0.75); } catch (e) {} } if (skip) { if (ov.parentNode) ov.remove(); return; } lab.textContent = "Done ✓"; sub.textContent = "well done"; orb.style.animation = ""; orb.style.transition = "transform 1.4s ease"; orb.style.transform = "scale(.7)"; setTimeout(function () { if (ov.parentNode) ov.remove(); var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Meditation · " + GUIDES[cfg.guide].who, mins: cfg.mins, catK: "love", color: "#9a5cf0" }); earn(Math.max(6, cfg.mins * 2), { catK: "love" }); save(); renderAll(); }, 1700); }
      ov.querySelector(".bw-x").onclick = function () { finish(true); };
      cue(); cueT = setInterval(cue, FREQ[cfg.freq] * 1000); tickT = setInterval(function () { elapsed++; if (elapsed >= total) finish(false); }, 1000);
    }
    build();
  }
  // EFT tapping — exact 9-point order (setup on side-of-hand, then eyebrow→side-of-eye→under-eye→under-nose→chin→collarbone→under-arm→top-of-head, looped). Tap-only: pick a feeling, no typing.
  function tapping() {
    var FEELINGS = [["stressed", "this stress"], ["anxious", "this anxiety"], ["stuck", "this stuckness"], ["frustrated", "this frustration"], ["sad", "this sadness"], ["tired", "this tiredness"], ["restless", "this restlessness"], ["down", "this heaviness"]];
    var PTS = [["Eyebrow", "start of the eyebrow, by the nose"], ["Side of eye", "on the bone, outer corner"], ["Under eye", "on the bone under the pupil"], ["Under nose", "between nose and lip"], ["Chin", "in the crease under your lip"], ["Collarbone", "just below where it meets"], ["Under arm", "a hand-width below the armpit"], ["Top of head", "the crown of your head"]];
    var cfg = { feel: FEELINGS[0], rounds: 2 };
    var ov = document.createElement("div"); ov.id = "breatheOv"; document.body.appendChild(ov);
    function build() {
      ov.innerHTML = "";
      var x = add(ov, "button", "bw-x", "close"); x.onclick = function () { TTS.stop(); if (ov.parentNode) ov.remove(); };
      var box = add(ov, "div"); box.style.cssText = "width:88%;max-width:420px;color:#efeaff;font-family:var(--bub);text-align:center;";
      box.innerHTML = '<div style="font-size:26px;font-weight:800;">👆 Tapping</div><div style="font-size:13px;color:#bcb0e8;margin-bottom:6px;">EFT — tap the points, let it move through you</div>';
      var lbl = add(box, "div", null, "what's bumping you?"); lbl.style.cssText = "font-size:12px;color:#bcb0e8;font-weight:700;margin:14px 0 8px;text-transform:uppercase;letter-spacing:.5px;";
      var r = add(box, "div"); r.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;justify-content:center;";
      FEELINGS.forEach(function (f) { var b = add(r, "button", null, f[0]); b.style.cssText = "border:2.5px solid #6a5a9a;border-radius:14px;padding:9px 13px;font-family:var(--bub);font-weight:800;font-size:14px;cursor:pointer;color:#efeaff;background:" + (cfg.feel === f ? "#ff7ab8" : "rgba(255,255,255,.06)") + ";"; b.onclick = function () { cfg.feel = f; build(); }; });
      var begin = add(box, "button", null, "Begin ▶"); begin.style.cssText = "margin-top:22px;background:#ff7ab8;color:#fff;border:3px solid #3a2540;border-radius:18px;padding:13px 28px;font-family:var(--bub);font-weight:800;font-size:17px;cursor:pointer;box-shadow:0 5px 0 #3a2540;"; begin.onclick = run;
      var hint = add(box, "div", null, "Tap each point ~7× with two fingers. No need to believe it — just tap and say the words."); hint.style.cssText = "font-size:11.5px;color:#9c8fc4;margin-top:15px;line-height:1.45;";
    }
    function run() {
      TTS.unlock(); // gesture-bound: inside the "Begin ▶" tap
      ov.innerHTML = '<button class="bw-x">skip</button><div class="bw-orb"></div><div class="bw-label"></div><div class="bw-sub"></div>';
      addVoiceToggle(ov);
      var orb = ov.querySelector(".bw-orb"), lab = ov.querySelector(".bw-label"), sub = ov.querySelector(".bw-sub");
      var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
      try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 180; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); } } catch (e) { actx = null; }
      function blip(freq) { if (!actx) return; var now = actx.currentTime; osc.frequency.setValueAtTime(freq, now); gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.006, now + 0.4); }
      var steps = [], setupLine = "Even though I feel " + cfg.feel[0] + ", I deeply and completely accept myself.";
      for (var s = 0; s < 3; s++) steps.push({ pt: "Setup — side of hand", say: setupLine, setup: true });
      for (var rd = 0; rd < cfg.rounds; rd++) PTS.forEach(function (p) { steps.push({ pt: p[0], loc: p[1], say: "“" + cfg.feel[1] + "”" }); });
      steps.push({ pt: "Take a slow breath", say: "and notice how it feels now", end: true });
      var i = 0, done = false, tmr = null;
      function finish(skip) {
        if (done) return; done = true; if (tmr) clearTimeout(tmr); TTS.stop();
        if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.3); osc.stop(actx.currentTime + 0.4); } catch (e) {} }
        if (skip) { if (ov.parentNode) ov.remove(); return; }
        lab.textContent = "Done ✓"; sub.textContent = "let it settle"; orb.style.animation = ""; orb.style.transition = "transform 1.2s ease"; orb.style.transform = "scale(.7)";
        setTimeout(function () { if (ov.parentNode) ov.remove(); var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Tapping (EFT)", mins: 3, catK: "love", color: "#ff7ab8" }); earn(7, { catK: "love" }); save(); renderAll(); }, 1500);
      }
      ov.querySelector(".bw-x").onclick = function () { finish(true); };
      function step() {
        if (done) return;
        if (i >= steps.length) { finish(false); return; }
        var st = steps[i];
        lab.textContent = st.pt; sub.textContent = st.say + (st.loc ? "  ·  " + st.loc : "");
        orb.style.animation = st.end ? "breathe 6s ease-in-out infinite" : "breathe 1s ease-in-out infinite";
        say(st.setup ? st.say : st.pt + ". " + st.say, VPROF.eft);
        blip(st.setup ? 165 : (st.end ? 150 : 175 + i * 6));
        i++; tmr = setTimeout(step, st.setup ? (voiceOn() ? 6400 : 5200) : (st.end ? 5600 : 4400));
      }
      orb.style.animation = "breathe 1s ease-in-out infinite";
      setTimeout(step, 700);
    }
    build();
  }
  // Mantra — David's own first-person affirmation as a calm teleprompter (the keystone willpower-free step of his stack). Read along or speak it.
  function mantraPlayer() {
    var LINES = ["I have absolute trust in myself.", "My instincts are unerring, my thoughts are clear,", "and my feelings guide me wisely.", "I am the sole authority on what is best for me.", "I love myself unconditionally.", "I embrace my mistakes and imperfections fully,", "and continue to love who I am.", "I hold deep respect for myself", "and unwavering confidence in my abilities.", "I vow to keep evolving — never ceasing to improve.", "I push beyond my comfort zone every single day.", "I will do whatever it takes to become a greater man.", "I bring joy to others. My aura radiates positivity.", "I am athletic, intelligent, loving, and ambitious —", "yet I savor life and cherish this beautiful planet.", "I deserve the very best.", "My life is phenomenal — spontaneous and overflowing with love.", "I find joy within myself, and don't take things too seriously.", "Every mistake is a teacher. If something needs redoing — fantastic.", "I do not judge reality; I accept it.", "I am indifferent to others' opinions of me.", "I am the master of my life,", "fully aware of what's best for me.", "What would I do if I wasn't afraid?"];
    TTS.unlock();
    var ov = document.createElement("div"); ov.id = "breatheOv"; ov.innerHTML = '<button class="bw-x">skip</button>'; document.body.appendChild(ov); addVoiceToggle(ov);
    var box = add(ov, "div"); box.style.cssText = "width:86%;max-width:440px;color:#f3e9ff;font-family:var(--bub);text-align:center;font-size:23px;font-weight:800;line-height:1.5;text-shadow:0 2px 12px rgba(0,0,0,.45);min-height:130px;display:flex;align-items:center;justify-content:center;transition:opacity .5s;";
    var sub = add(ov, "div", null, "say it out loud, or just read along"); sub.style.cssText = "color:#bcb0e8;font-family:var(--bub);font-size:12px;margin-top:20px;letter-spacing:.5px;";
    var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
    try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 150; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); gain.gain.linearRampToValueAtTime(0.028, actx.currentTime + 1.8); } } catch (e) { actx = null; }
    var i = 0, done = false, tmr = null;
    function finish(skip) {
      if (done) return; done = true; if (tmr) clearTimeout(tmr); TTS.stop();
      if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.5); osc.stop(actx.currentTime + 0.6); } catch (e) {} }
      if (ov.parentNode) ov.remove();
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Mantra", mins: 3, catK: "love", color: "#ff7ab8" }); earn(7, { catK: "love" }); save(); renderAll(); }
    }
    ov.querySelector(".bw-x").onclick = function () { finish(true); };
    function step() {
      if (done) return;
      if (i >= LINES.length) { box.style.opacity = "0"; tmr = setTimeout(function () { if (done) return; box.textContent = "✓"; box.style.fontSize = "44px"; box.style.opacity = "1"; sub.textContent = "that's who you are"; tmr = setTimeout(function () { finish(false); }, 1700); }, 500); return; }
      var line = LINES[i], last = i === LINES.length - 1;
      box.style.opacity = "0";
      tmr = setTimeout(function () { if (done) return; box.textContent = line; box.style.opacity = "1"; say(line, VPROF.mantra); }, 450);
      var dur = Math.max(voiceOn() ? 4200 : 3000, line.length * (voiceOn() ? 115 : 62)) + (last ? 2800 : 0); // let the spoken line finish
      i++; var nxt = setTimeout(step, dur); tmr = nxt;
    }
    setTimeout(step, 700);
  }
  function renderQuick() {
    var Q = el("quick"); if (!Q) return; Q.innerHTML = ""; var st = microState();
    (MICROPHASE[phase()] || [0, 1, 5, 3]).forEach(function (mi) {
      var m = MICRO[mi], ms = st[mi], c = add(Q, "div", "qw" + (ms && ms.s === "done" ? " won" : ms && ms.s === "planned" ? " planned" : ""));
      add(c, "div", "qwe", m.e); add(c, "div", "qwl", m.l);
      add(c, "div", "qws", ms && ms.s === "done" ? "✓ done" : ms && ms.s === "planned" ? "tap = ✓" : "+" + m.sp + "✨");
      c.onclick = function () { microTap(mi, c); };
    });
  }
  function fmtHour(h) { h = h % 24; var ap = h < 12 ? "am" : "pm"; var hh = h % 12; if (hh === 0) hh = 12; return hh + ap; }
  function blockEmoji(title) {
    var m = TITLE2META[(title || "").toLowerCase()]; if (m && m.emoji) return m.emoji;
    var t = (title || "").toLowerCase(), map = [["bed", "🛏️"], ["breakfast", "🍳"], ["lunch", "🥪"], ["dinner", "🍽️"], ["wind down", "🌙"], ["break", "☕"], ["hobby", "🎈"], ["ship", "✦"], ["send", "✦"], ["move", "🏃"], ["walk", "🚶"], ["gym", "🏋️"], ["run", "🏃"], ["deep", "🧠"], ["code", "💻"], ["vibe", "🎧"], ["work", "🧠"], ["read", "📖"], ["clean", "🧹"], ["tidy", "🧹"], ["laundry", "🧺"], ["shower", "🚿"], ["meditat", "🧘"], ["journal", "📓"], ["sleep", "😴"], ["eat", "🍽️"], ["weed", "🌿"], ["smoke", "🚬"], ["game", "🕹️"], ["music", "🎵"], ["call", "📞"], ["plan", "🗒️"]];
    for (var i = 0; i < map.length; i++) if (t.indexOf(map[i][0]) !== -1) return map[i][1];
    return "🗓️";
  }
  function timeFromY(y, startH, HP) { var mins = startH * 60 + y / HP * 60; mins = Math.max(0, Math.min(1800,Math.round(mins / 15) * 15)); return pad(Math.floor(mins / 60)) + ":" + pad(mins % 60); } // 6am-start day → allow placing all the way to 6am next day (1800)
  function radialMenu(opts, onPick, onCancel, multi) {
    var ov = document.createElement("div"); ov.className = "radial";
    var items = opts.slice(0, 8), n = items.length || 1, sel = [];
    var cx = window.innerWidth / 2, cy = Math.min(window.innerHeight * 0.44, 360), R = Math.min(window.innerWidth, 380) * 0.31;
    var ctr = document.createElement("div"); ctr.className = "ritem rmore"; ctr.style.left = (cx - 36) + "px"; ctr.style.top = (cy - 36) + "px"; ctr.innerHTML = '<div class="rie">⋯</div><div class="ril">more</div>';
    function refresh() { ctr.querySelector(".rie").textContent = sel.length ? "✓" : "⋯"; ctr.querySelector(".ril").textContent = sel.length ? "go · " + sel.length : "more"; }
    items.forEach(function (m, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      var b = document.createElement("div"); b.className = "ritem"; b.style.left = (x - 36) + "px"; b.style.top = (y - 36) + "px"; b.style.borderColor = m.color || "#8a5cf0";
      b.innerHTML = '<div class="rie">' + emojiFor(m) + '</div><div class="ril">' + m.title + '</div>';
      b.onclick = function (e) {
        e.stopPropagation();
        if (multi) { var idx = sel.indexOf(m); if (idx >= 0) { sel.splice(idx, 1); b.classList.remove("on"); b.style.background = ""; } else { sel.push(m); b.classList.add("on"); b.style.background = m.color || "#8a5cf0"; } refresh(); }
        else { ov.remove(); onPick(m); }
      };
      ov.appendChild(b);
    });
    ctr.onclick = function (e) { e.stopPropagation(); ov.remove(); if (multi && sel.length) onPick(sel); else onPick(null); };
    ov.appendChild(ctr);
    if (multi) { var hint = document.createElement("div"); hint.className = "rhint"; hint.textContent = "tap a few — multitasking welcome ✓"; ov.appendChild(hint); }
    ov.onclick = function () { ov.remove(); if (onCancel) onCancel(); };
    document.body.appendChild(ov);
  }
  function pickOne(cb) { pickerSheet({ title: function () { return "What is it?"; }, frequent: true, custom: true, onTask: function (t) { closeSheet(); cb(t); } }); }
  function assignBlock(b, m, k) { pushUndo(); b.title = m.title; b.color = m.color || b.color; b.catK = m.catK || b.catK; save(); reflow(k); renderToday(); }
  function assignTimer(t, m) { t.title = m.title; t.catK = m.catK; t.color = m.color || t.color; t.emoji = emojiFor(m); t.habitId = m.habitId || null; save(); renderToday(); renderNow(); }
  function assignTimerMulti(t, metas) { if (!metas || !metas.length) return; t.title = metas.map(function (m) { return m.title; }).join(" + "); t.emoji = metas.map(function (m) { return emojiFor(m); }).join(""); t.catK = metas[0].catK; t.color = metas[0].color || t.color; t.habitId = metas[0].habitId || null; t.tags = metas.map(function (m) { return m.title; }); save(); renderToday(); renderNow(); }
  function startTrackerNow() { S.timers.push({ id: uid(), title: "Tracking…", catK: null, emoji: "⏱️", color: "#ff5fa8", start: Date.now(), dayK: todayK() }); save(); return S.timers[S.timers.length - 1]; }
  function layoutLane(items) {
    items.sort(function (a, b) { return a.s - b.s; });
    var cl = [], cur = [], curEnd = -1;
    items.forEach(function (it) { if (cur.length && it.s >= curEnd) { cl.push(cur); cur = []; curEnd = -1; } cur.push(it); curEnd = Math.max(curEnd, it.e); });
    if (cur.length) cl.push(cur);
    cl.forEach(function (g) { var ends = []; g.forEach(function (it) { var placed = false; for (var c = 0; c < ends.length; c++) { if (it.s >= ends[c]) { it.col = c; ends[c] = it.e; placed = true; break; } } if (!placed) { it.col = ends.length; ends.push(it.e); } }); g.forEach(function (it) { it.cols = ends.length; }); });
  }
  // edge-resize on touch needs a deliberate HOLD first, exactly like pick-up-to-move — so a finger that lands on a grip while scrolling scrolls instead of resizing (David 2026-06-25)
  function gripHold(ev, card, beginResize, onTap) {
    if (card.dataset.gate && card.dataset.gate !== "full") return; // too thin to resize → DON'T stopPropagation, let it bubble to the card body so the touch becomes a move/menu, not a resize (David 2026-06-25)
    ev.stopPropagation();
    if (ev.pointerType !== "touch") { ev.preventDefault(); beginResize(ev.clientY); return; } // mouse = immediate resize
    var scE = (card.closest && card.closest(".day-cardscroll")) || el("pullBody");
    var sy = ev.clientY, sx = ev.clientX, lastY = sy, scrolling = false, t0 = Date.now();
    function mv(e) { var ady = Math.abs(e.clientY - sy), adx = Math.abs(e.clientX - sx); if (!scrolling && (ady > 12 || adx > 12)) { scrolling = true; if (holdT) { clearTimeout(holdT); holdT = null; } } if (scrolling && scE) { e.preventDefault(); scE.scrollTop -= (e.clientY - lastY); } lastY = e.clientY; }
    function up() { var quick = !!holdT && !scrolling && (Date.now() - t0 < 270) && Math.abs(lastY - sy) < 6; if (holdT) { clearTimeout(holdT); holdT = null; } document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); if (quick && onTap) onTap(); } // a quick tap on the grip (no hold, no drag) opens the editor instead of dead-ending — easier to hit a bubble's bottom edge (David 2026-06-25)
    var holdT = setTimeout(function () { if (scrolling || _pinching) return; holdT = null; document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} beginResize(lastY); }, 270);
    document.addEventListener("pointermove", mv, { passive: false }); document.addEventListener("pointerup", up);
  }
  function calendarView(L, k, showNow, noHead) {
    L.innerHTML = ""; nowLineEl = null;
    var bls = blocks(k).slice(), lgs = logs(k).slice();
    var _sk = curStreak(); if (_sk > 0 && k === todayK()) { var sb = add(L, "div", "streakbar"); sb.style.cssText = "display:flex;align-items:center;margin:2px 0 9px;"; var sl = add(sb, "span", "streaklbl"); sl.innerHTML = '<i class="ti ti-flame"></i> ' + _sk + ' in a row'; sl.style.cssText = "display:inline-flex;align-items:center;gap:5px;font-family:'Jost',sans-serif;font-weight:700;font-size:12px;letter-spacing:.3px;color:#ffb3d6;background:#3a1228;border:1.5px solid #5a1c3c;border-radius:999px;padding:3px 11px;"; } // minimal berry chip — no gradient/glow/tier-name (David 2026-06-25)
    if (!noHead) { var lh = add(L, "div", "lanehead"); add(lh, "span", "lhx plan", "PLAN"); add(lh, "span", "lhx real", "REAL"); } // continuous day view passes noHead — one shared header lives above (David 2026-06-24)
    var minS = 7 * 60, maxE = 22 * 60; bls.concat(lgs).forEach(function (b) { var s = hm(b.time); minS = Math.min(minS, s); maxE = Math.max(maxE, s + (b.mins || 30)); });
    var now = logicalNowMin(), _dw = dayWindow(), startH = _dw.startH, endH = _dw.endH, HP = pullHourPx; // YOUR day = wake → bedtime (from onboarding); the SAME window for every day so the sections are uniform and stack into one continuous scroll-into-it timeline (David 2026-06-26)
    var cal = add(L, "div", "cal"); cal.style.height = ((endH - startH) * HP + 10) + "px"; cal.dataset.startH = startH; cal.dataset.endH = endH; // cached so live-zoom can reposition nodes without a rebuild
    // DAY/NIGHT (David 2026-06-27, v5): tint PER-HOUR to match the actual clock — deep indigo night, rose dawn, cool calm day, red dusk — so midnight reads DARK and noon cool (not one ambient wash). A moon + stars live in the NIGHT-hour rows themselves (always, not "now"). Smooth keyframe-interpolated, %-based so it scales with zoom.
    (function () {
      var sky = add(cal, "div", "skybg"); sky.style.cssText = "position:absolute;left:0;right:0;top:0;bottom:0;z-index:0;pointer-events:none;border-radius:inherit;overflow:hidden;";
      var KF = [[0, [22, 18, 44]], [5, [29, 24, 54]], [6.5, [37, 17, 40]], [8, [42, 12, 27]], [12, [48, 13, 30]], [16, [42, 12, 27]], [18, [40, 17, 38]], [20, [31, 25, 56]], [22, [27, 22, 50]], [24, [22, 18, 44]]]; // DAY = deep wine-RED, NIGHT = deep navy-BLUE — sampled from David's reference images, 2026-06-27 // DAY = deep wine-RED (#280b19-ish), NIGHT = deep navy-BLUE (#1f1939-ish) — sampled from David's two reference images, 2026-06-27; the sky runs blue(night) → red(day) → blue(night) // night deep-indigo (kept) · day = living cool blue (was a dull gray-indigo) · dawn softer rose · dusk a smooth magenta-purple BRIDGE not a muddy red — fixes the day-meh + bad-transition (David 2026-06-27)
      function skyAt(c) { c = ((c % 24) + 24) % 24; for (var i = 0; i < KF.length - 1; i++) { if (c >= KF[i][0] && c <= KF[i + 1][0]) { var t = (c - KF[i][0]) / (KF[i + 1][0] - KF[i][0]), a = KF[i][1], b = KF[i + 1][1]; return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * t) + "," + Math.round(a[1] + (b[1] - a[1]) * t) + "," + Math.round(a[2] + (b[2] - a[2]) * t) + ")"; } } return "rgb(16,14,38)"; }
      var stops = []; for (var h = startH; h <= endH; h += 0.5) { stops.push(skyAt(h) + " " + ((h - startH) / (endH - startH) * 100).toFixed(1) + "%"); }
      sky.style.background = "linear-gradient(180deg," + stops.join(",") + ")";
      var moonAt = -1, span = endH - startH;
      for (var hh = startH; hh < endH; hh++) { var cc = ((hh % 24) + 24) % 24; if (!(cc >= 20 || cc < 5)) continue; if (moonAt < 0 && cc >= 20) moonAt = hh; var yTop = (hh - startH) / span * 100; for (var si = 0; si < 2; si++) { var sx = [14, 44, 72, 30, 60, 86][(hh * 2 + si) % 6], sy = yTop + (si + 1) / 3 * (100 / span), sz = si % 2 ? 1.4 : 2.2; var str = add(sky, "div", "skystar"); str.style.cssText = "position:absolute;left:" + sx + "%;top:" + sy.toFixed(1) + "%;width:" + sz + "px;height:" + sz + "px;border-radius:50%;background:rgba(235,240,255,.66);box-shadow:0 0 3px rgba(190,205,255,.55);"; } }
      if (moonAt < 0) for (var h2 = startH; h2 < endH; h2++) { var c2 = ((h2 % 24) + 24) % 24; if (c2 >= 20 || c2 < 5) { moonAt = h2; break; } }
      if (moonAt >= 0) { var _mn = add(sky, "div", "skymoon"); _mn.style.cssText = "position:absolute;right:16px;top:calc(" + ((moonAt - startH) / span * 100).toFixed(1) + "% + 10px);width:18px;height:18px;border-radius:50%;background:transparent;box-shadow:inset -6px -2px 0 0 #e6ecff;"; }
    })();
    var railItems = [], nowRightBand = null; // bars too thin to label inline → their symbol goes to the right-side rail, stacked in order; nowRightBand = the Y-band the NOW readout occupies on the right so rail chips dodge it (David 2026-06-25)
    var _SHOWHALF = HP >= 84, _NUMHALF = HP >= 150, _SHOWQTR = HP >= 210, _NUMQTR = HP >= 270; // minimal gutter: hours always numbered; :30 is a bare DASH until you zoom in (then it gains a number); :15/:45 dashes only appear deeper still (David 2026-06-25)
    for (var mm = startH * 60; mm <= endH * 60; mm += 15) { var _t = ((mm - startH * 60) / 60 * HP), _hh = Math.floor(mm / 60), _mn = mm % 60;
      if (_mn === 0) { var _ln = add(cal, "div", "calhour"); _ln.style.top = _t + "px"; _ln.dataset.mn = mm; var _hl = add(cal, "div", "calhrl", "" + ((_hh % 12) || 12)); _hl.style.top = (_t - 8) + "px"; _hl.dataset.mn = mm; _hl.dataset.off = -8; }
      else if (_mn === 30) { if (_NUMHALF) { var _s2 = add(cal, "div", "calsub", ((_hh % 12) || 12) + ":30"); _s2.style.top = (_t - 7) + "px"; _s2.dataset.mn = mm; _s2.dataset.off = -7; } else if (_SHOWHALF) { var _l2 = add(cal, "div", "calhalf"); _l2.style.top = _t + "px"; _l2.dataset.mn = mm; } } // a bare DASH until zoomed in, then it becomes a number (no dash) — never both
      else { if (_NUMQTR) { var _s3 = add(cal, "div", "calsub", ":" + pad(_mn)); _s3.style.top = (_t - 7) + "px"; _s3.dataset.mn = mm; _s3.dataset.off = -7; } else if (_SHOWQTR) { var _l3 = add(cal, "div", "calhalf"); _l3.style.top = _t + "px"; _l3.dataset.mn = mm; } }
    }
    if (showNow && now >= startH * 60 && now <= endH * 60) { var _ny = ((now - startH * 60) / 60 * HP); var _nrun = activeTimers(), _lv = _nrun[_nrun.length - 1], _lD = _lv ? (DOM[domainOf(_lv)] || DOM.focus) : null, _lc = _lD ? _lD.c : "#ff5fa8"; var nl = add(cal, "div", "nowline"); nl.style.top = _ny + "px"; nl.style.borderTopColor = "#ff5fa8"; nl.style.boxShadow = "0 0 11px #ff5fa8"; nl.dataset.mn = now; nowLineEl = nl; nowRightBand = [_ny - 6, _ny + 30]; var nc = add(cal, "div", "nowcirc"); nc.style.top = (_ny - 8) + "px"; nc.style.background = _lc; nc.style.color = _lD ? _lD.ink : "#4a1126"; nc.dataset.mn = now; nc.dataset.off = -8; nc.innerHTML = _lv ? tiIcon(_lv) : '<i class="ti ti-clock"></i>'; if (_lv) { var _ls = toWin(new Date(_lv.start).getHours() * 60 + new Date(_lv.start).getMinutes()); if ((logicalNowMin() - _ls) / 60 * HP < 22) { var nr = add(cal, "div", "nowread"); nr.style.top = (_ny + 7) + "px"; nr.style.color = _lc; nr.dataset.mn = now; nr.dataset.off = 7; nr.innerHTML = tiIcon(_lv) + ' <span class="cn-t">' + esc(_lv.title || "Tracking") + '</span> · <span class="live-elapsed" data-tid="' + _lv.id + '">' + elapsedStr(_lv) + '</span>'; } } else { var np = add(cal, "div", "nowtime"); np.style.top = (_ny + 5) + "px"; np.dataset.mn = now; np.dataset.off = 5; np.style.left = "auto"; np.style.right = "6px"; np.innerHTML = '<b style="letter-spacing:.5px">NOW</b> ' + fmt(now); } } // now-line + icon circle (no label under it) + a right-side readout: current activity in its colour + elapsed (David 2026-06-25)
    // temporal anchors so you're never lost in time: midnight · wake · noon · bed (David 2026-06-24)
    function hrToMin(s, pm) { if (!s) return null; var m = ("" + s).match(/\d+/); if (!m) return null; var n = +m[0]; if (pm && n < 12) n += 12; if (n >= 24) n -= 24; return n * 60; }
    [["midnight", 0, "ti-clock-hour-12", "#5f8dd6"], ["wake", hrToMin(S.profile && S.profile.wake, false), "ti-sunrise", "#ffae6a"], ["noon", 720, "ti-sun-high", "#ffd24a"], ["bed", hrToMin(S.profile && S.profile.sleep, true), "ti-moon", "#9a8cff"], ["midnight", 1440, "ti-clock-hour-12", "#5f8dd6"]].forEach(function (tm) {
      if (tm[1] == null || tm[1] < startH * 60 || tm[1] > endH * 60) return;
      var ml = add(cal, "div", "timemark"); ml.style.top = ((tm[1] - startH * 60) / 60 * HP) + "px"; ml.dataset.mn = tm[1]; ml.style.borderTopColor = tm[3] + "55";
      var lb = add(ml, "span", "timemark-lab"); lb.style.color = tm[3]; lb.innerHTML = '<i class="ti ' + tm[2] + '"></i> ' + tm[0];
    });
    function place(card, mins, durv, lane) { card.style.top = ((mins - startH * 60) / 60 * HP) + "px"; card.style.height = Math.max(5, durv / 60 * HP - 4) + "px"; card.dataset.mn = mins; card.dataset.dur = durv; if (lane === "P") { card.style.left = "26px"; card.style.right = "calc(50% + 4px)"; } else { card.style.left = "calc(50% + 4px)"; card.style.right = "4px"; } } // bars are their TRUE time-height (low floor) so back-to-back bubbles can't overlap; the label then adapts to the height (David 2026-06-25)
    // LABEL INTELLIGENCE by bar height (David 2026-06-25): tall = icon+name (+subtitle) · medium = icon+name one line · thin = icon/emoji only · too-thin = name on the SIDE
    function degrade(card) { degradeCard(card); } // delegates to the module-level grader (shared with the live pinch reflow) — name only on TALL bars (≥22) so zoom-out stays minimal; resize only on genuinely tall bars (≥48) so a small bubble rearranges instead of stretching (David 2026-06-25)
    function rr() { renderToday(); }
    function editBlk(b) { if (_pinching || (Date.now() - _zoomEndedAt) < 380) return; blockEdit(b, k); } // ANY bubble opens the full editor — BUT never from a finger that was resting on a bubble during a pinch / just after rapid micro-zooms (the accidental-select bug) — David 2026-06-27
    var planCards = [], burnedSomething = false;
    var _liveT = (showNow && k === todayK()) ? (function () { var r = activeTimers(); return r[r.length - 1]; })() : null, _convFused = false; // the activity being tracked NOW → its straddling plan block becomes the matte→shining conversion block (David 2026-06-25)
    function topFor(m) { return ((m - startH * 60) / 60 * HP); }
    function settle() { planCards.forEach(function (pc) { pc.card.style.top = topFor(hm(pc.b.time)) + "px"; pc.card.style.height = Math.max(14, (pc.b.mins || 30) / 60 * HP - 4) + "px"; degrade(pc.card); }); }
    function preview(ex, ds, de) { planCards.filter(function (pc) { return pc.card !== ex; }).sort(function (a, c) { return hm(a.b.time) - hm(c.b.time); }).reduce(function (cur, pc) { var dur = pc.b.mins || 30, s = hm(pc.b.time); if (cur >= 0 && s < cur) s = cur; if (s < de && s + dur > ds) s = de; pc.card.style.top = topFor(s) + "px"; return s + dur; }, -1); }
    function overlapLog(bs, be) { for (var i = 0; i < lgs.length; i++) { var ls = hm(lgs[i].time), le = ls + (lgs[i].mins || 0); if (ls < be && le > bs) return true; } return false; }
    var _bsorted = bls.sort(function (a, b) { return hm(a.time) - hm(b.time); }); _bsorted.forEach(function (b, _bi) {
      var bs = hm(b.time), be = bs + (b.mins || 30), status = blockStatus(k, b);
      // PLAN lane, 3 states (§23, mockups 030/031/034): sched = two-tone diagonal hatch · cele = activity-colored celebration · ghost = domain-outlined hollow
      var dom = domainOf(b), D = DOM[dom];
      // PARTIAL MATCH (David 2026-06-25): a same-domain log covers only PART of the plan → that span shines (matched), the rest of the block falls back to ghost-plan | drift (split)
      var _pm = (status === "ok" && !b.done) ? matchedSpan(b, dom) : null, partial = (_pm && _pm.cov < (be - bs) - 5) ? _pm : null;
      // BURNING TIMELINE (David 2026-06-23): future plan = BRIGHT/lit (a note coming), the now-line sweeping past it burns bright→dark, past = DARK. Burnt sticks — a plan pushed from the past stays dark until actually done (then it celebrates).
      var newlyPassed = false;
      if (status === "miss" && !b.passed) { b.passed = true; newlyPassed = true; burnedSomething = true; }
      var newlyCele = false;
      if (status === "ok" && !partial && !b.celed) { b.celed = true; burnedSomething = true; if (showNow && k === todayK()) newlyCele = true; } // celebrate-pop ONCE, at the moment of completion — never replay it on every re-render (that scale-pop replaying on completed past plans was the "bounce" on zoom); past completions are marked celebrated silently (David 2026-06-26)
      var dark = (status !== "ok" && (b.passed || status === "miss")) || !!partial; // a partial's BASE is a ghost (the part you planned but didn't keep)
      var _straddle = showNow && k === todayK() && bs < now && be > now && status !== "ok" && !partial; // the present line splits this block (past ghost half + matte future half) — David 2026-06-25
      var stt = (status === "ok" && !partial) ? "cele" : dark ? "ghost" : "sched";
      var card = add(cal, "div", "calblk lane " + stt + (b.pin ? " pin" : "") + (newlyPassed ? " burning" : "") + (newlyCele ? " celepop" : "") + (!b.title ? " emptyblk" : ""));
      place(card, bs, b.mins || 30, "P");
      if (stt === "sched" && (k > todayK() || (k === todayK() && bs >= now))) { card.style.right = "4px"; card.classList.add("futurebar"); } // future plan = ONE full-width bar — no real lane exists yet (David 2026-06-25)
      if (status === "ok" && !partial) { card.style.right = "4px"; card.classList.add("fusedbar"); } // FULLY matched = ONE connected full-width bar (plan + real fused) (David 2026-06-25)
      // (the live activity is NOT drawn as an extending block — the present is the now-line + its right-side readout; David 2026-06-25)
      // (no gap-cap — the floor-5/margin-4 height already leaves a gap to the next block; capping made live-zoom heights differ from the commit and caused the bounce — David 2026-06-25)
      if (partial) { var _pre = _pm.start - bs, _post = be - _pm.end, _uS, _uE; if (_post >= _pre) { _uS = _pm.end; _uE = be; } else { _uS = bs; _uE = _pm.start; } card.style.top = topFor(_uS) + "px"; card.style.height = Math.max(5, (_uE - _uS) / 60 * HP - 4) + "px"; card.dataset.mn = _uS; card.dataset.dur = (_uE - _uS); } // the UNFULFILLED remainder breaks off into its OWN ghost bubble (the matched part is its own shining bubble) — David 2026-06-25
      card.dataset.ic = tiClass(b); card.dataset.c = D.c; card.dataset.ink = D.ink; // carried so the LIVE pinch reflow can rebuild this bar's rail icon without recomputing its domain (David 2026-06-26)
      degrade(card); if (card.classList.contains("lbl-i") || card.classList.contains("lbl-s")) railItems.push({ y: parseFloat(card.style.top) + (parseFloat(card.style.height) || 4) / 2, ic: tiClass(b), c: D.c, ink: D.ink, open: (function (bb) { return function () { editBlk(bb); }; })(b) }); // too thin to label → its symbol goes to the right rail; tap the chip to open it (David 2026-06-25)
      if (status === "ok" && !partial) { // DONE = deep-jewel diagonal STRIPES (the old metallic look, darkened for night) + ink edge — NO neon glow, NO shine; the now-line stays the brightest thing (David 2026-06-27)
        card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 3px 0 #160510";
      } else if (dark) { // missed/ghost — domain-tinted-dark hollow + a clear domain OUTLINE (kept — David likes this close up)
        card.style.background = mixHex(D.c, "#160510", 0.86); card.style.borderColor = mixHex(D.c, "#160510", 0.32); card.style.boxShadow = "none";
      } else { // future = planned: DIMMER deep stripes, fainter the further ahead, ink edge (David 2026-06-27)
        card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.74) + "," + mixHex(D.c, "#160510", 0.74) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "0 2px 0 #160510";
        var _ahead = (bs - now) / 60; card.style.opacity = String(showNow ? Math.max(0.6, 0.95 - Math.max(0, _ahead) * 0.05) : 0.82);
      }
      if (_straddle) { // STRADDLING NOW (David 2026-06-27): the GHOST half (not done) is a standalone fully-rounded bubble; the TRACKED half is CONTINUOUS with the future (no gap at the now-line — the line just shows printing + the battery: bright charged-past, dim future).
        var _trk = _liveT && domainOf(_liveT) === dom, _tsd = _trk ? new Date(_liveT.start) : null, _tsm = _trk ? Math.max(bs, Math.min(now, _tsd.getHours() * 60 + _tsd.getMinutes())) : now; // _tsm = when tracking started (= now if not tracking → whole past half is ghost)
        var _matte = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.74) + "," + mixHex(D.c, "#160510", 0.74) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 18px)", _R = "13px";
        card.classList.add("convbar"); card.style.filter = "none"; card.style.opacity = "1";
        if (_trk) { // TRACKING → the GHOST separates from the active bubble (this is when it breaks off and gets its rounded bottom) — David 2026-06-27
          if (_tsm > bs + 0.5) { card.style.height = Math.max(5, (_tsm - bs) / 60 * HP - 4) + "px"; card.dataset.mn = bs; card.dataset.dur = (_tsm - bs); card.style.background = mixHex(D.c, "#160510", 0.86); card.style.borderColor = mixHex(D.c, "#160510", 0.32); card.style.borderRadius = _R; card.style.boxShadow = "0 3px 0 #160510"; } // GHOST = untracked past (bs → _tsm) = the CARD, now a standalone FULLY-rounded narrow plan-lane bubble (keeps the plan name)
          else { card.style.height = "0px"; card.style.border = "none"; card.style.background = "none"; card.style.boxShadow = "none"; } // started exactly at the block top → no ghost head
          var _hasTrk = now > _tsm + 0.5;
          if (_hasTrk) { var _segH = (now - _tsm) / 60 * HP, _seg = add(cal, "div", "matchseg"); _seg.style.top = topFor(_tsm) + "px"; _seg.style.height = _segH + "px"; _seg.style.left = "26px"; _seg.style.right = "4px"; _seg.dataset.mn = _tsm; _seg.dataset.dur = (now - _tsm); _seg.style.borderRadius = _R + " " + _R + " 0 0"; _seg.style.borderBottom = "none"; _seg.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; _seg.style.borderColor = "#160510"; _seg.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09)"; if (_segH >= 15) { var _ssc = add(_seg, "div", "mscn"); _ssc.style.color = D.light; _ssc.innerHTML = tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span> <i class="ti ti-circle-check"></i>'; } else if (_segH >= 7) { var _se = add(_seg, "div", "msemoji"); _se.innerHTML = tiIcon(b); _se.style.cssText = "position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;color:#fff2f9;"; } } // (2a) TRACKED stretch = bright activity-colour, rounded TOP, SQUARE bottom (flows into the future — no gap); thin sliver → emoji only, no pink
          var _fw = add(cal, "div", "futwide"); _fw.style.cssText = "position:absolute;left:26px;right:4px;box-sizing:border-box;z-index:1;pointer-events:none;box-shadow:0 2px 0 #160510;border:2px solid #160510;"; _fw.style.top = topFor(now) + "px"; _fw.style.height = Math.max(5, (be - now) / 60 * HP - 4) + "px"; _fw.style.background = _matte; _fw.style.borderRadius = _hasTrk ? ("0 0 " + _R + " " + _R) : _R; if (_hasTrk) _fw.style.borderTop = "none"; _fw.dataset.mn = now; _fw.dataset.dur = (be - now); // (2b) FUTURE half = full-width matte, CONTINUOUS with the tracked bar above (square top when tracked → the now-line is the battery divider, not a gap)
        } else { // NOT tracking → ONE continuous bar in the plan lane: ghost-dark top + matte future-bottom, split ONLY by the now-line crossing it. It was correct this way before — the bubble separates only on Play (David 2026-06-27)
          card.style.background = "none"; card.style.borderColor = "#160510"; card.style.boxShadow = "0 3px 0 #160510"; var _ch = Math.max(5, (be - bs) / 60 * HP - 4);
          var _cg = add(card, "div", "convghost"); _cg.style.height = ((now - bs) / 60 * HP / _ch * 100) + "%"; _cg.style.background = mixHex(D.c, "#160510", 0.86); _cg.style.boxShadow = "inset 0 0 0 2px " + mixHex(D.c, "#160510", 0.32);
          var _fut = add(card, "div", "convfut"); _fut.style.top = ((now - bs) / 60 * HP / _ch * 100) + "%"; _fut.style.background = _matte;
        }
        _convFused = true;
      }
      if (partial) { // overlay the MATCHED span — a full-width shining segment over both lanes; the rest of the block stays ghost (left) with the drift in the right lane = the split
        var _mh = Math.max(5, (_pm.end - _pm.start) / 60 * HP - 4); // same floor/margin → no bounce
        var seg = add(cal, "div", "matchseg"); seg.style.top = topFor(_pm.start) + "px"; seg.style.height = _mh + "px"; seg.style.left = "26px"; seg.style.right = "4px";
        seg.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; seg.style.borderColor = "#160510"; seg.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 2px 0 #160510";
        seg.dataset.mn = _pm.start; seg.dataset.dur = (_pm.end - _pm.start);
        var _sc = add(seg, "div", "mscn"); _sc.style.color = D.light; _sc.innerHTML = (_mh >= 15 ? (tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span> ') : '') + '<i class="ti ti-circle-check"></i>'; // matched span: icon + name + ✓ (no shine — David disliked the internal reflections)
      }
      var ink = D.light; // ALL bubbles are now dark-hollow → bright domain-light text everywhere (legible + cool, per David's ghost-look preference, 2026-06-27)
      var cn = add(card, "div", "cn"); cn.style.color = ink; if (_straddle) cn.style.fontWeight = "800";
      var _sn = (b.subs || []).length, _dc = (b.subs || []).filter(function (s) { return s.done; }).length;
      cn.innerHTML = !b.title ? '<i class="ti ti-hand-finger"></i> tap to choose' : ((b.pin ? '<i class="ti ti-pin"></i> ' : "") + tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span>' + (_sn ? ' <span class="step-n">' + _dc + '/' + _sn + '</span>' : "") + (status === "ok" && !partial ? ' <i class="ti ti-sparkles" style="color:' + D.c + '"></i>' : ""));
      if (status === "miss") { var ms = add(card, "div", "csub", "missed"); ms.style.color = "rgba(255,240,249,.45)"; } // muted "missed" (David's image 4)
      var pc = { b: b, card: card }; planCards.push(pc);
      var xb = add(card, "div", "calx"); xb.innerHTML = '<i class="ti ti-x"></i>';
      xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
      xb.addEventListener("click", function (ev) { ev.stopPropagation(); pushUndo(); var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); var p2 = planCards.indexOf(pc); if (p2 >= 0) planCards.splice(p2, 1); card.style.transform = "scale(.4)"; card.style.opacity = "0"; setTimeout(function () { card.remove(); reflow(k); save(); renderToday(); }, 150); });
      var grip = add(card, "div", "grip"), gripT = add(card, "div", "gript");
      card.addEventListener("pointerdown", function (ev) {
        if (ev.target === xb || ((ev.target === grip || ev.target === gripT) && card.dataset.gate === "full")) return; // a thin (gated) card's grip falls through to here → move/menu, not resize
        var touch = ev.pointerType === "touch", scE = (card.closest && card.closest(".day-cardscroll")) || el("pullBody"); if (!touch) ev.preventDefault(); // mouse drags immediately
        var sy0 = ev.clientY, sx0 = ev.clientX, lastY = ev.clientY, sm0 = hm(b.time), moved = false, picked = !touch && card.dataset.gate !== "menu", scrolling = false, holdT = null, ct0 = card.querySelector(".ct"), dragMin = sm0, snapped = false;
        var _bpast = blockPast(k, b), _freeDrag = _bpast && showNow, _calEl = card.closest(".cal"); function overReal(cx) { if (!_calEl) return false; var r = _calEl.getBoundingClientRect(); return cx > r.left + r.width * 0.5; } // past + two lanes → the bubble can cross into the real (right) lane
        var _bs = sm0, _be = sm0 + (b.mins || 30), _onNow = showNow && k === todayK() && _bs < now && _be > now, _isPast = showNow && k === todayK() && _be <= now; // straddling-NOW = the live block (stays put); fully-past = reorderable like the future (David 2026-06-26: completed blocks must move up/down again)
        var _started = _onNow, _floor = (showNow && k === todayK() && !_isPast) ? Math.ceil(now / 15) * 15 : 0, _ceil = _isPast ? Math.floor(now / 15) * 15 : 1740; // ONLY the live straddling block is frozen now; future blocks keep the now-line floor; a past block can reorder freely but stops at NOW (ceiling) so it can't slide into the future
        if (touch) holdT = setTimeout(function () { if (scrolling || card.dataset.gate === "menu" || _started || _pinching) return; picked = true; holdT = null; card.classList.add("lift"); card.classList.add("dragging"); card._dragBlock = function (ev) { ev.preventDefault(); }; document.addEventListener("touchmove", card._dragBlock, { passive: false }); try { if (navigator.vibrate) navigator.vibrate(9); } catch (e) {} }, _bpast ? 460 : 280); // long-press → DRAG mode: block native scroll so the vertical drag moves the block instead of scrolling it (David 2026-06-27)
        function clean() { if (holdT) { clearTimeout(holdT); holdT = null; } if (card._dragBlock) { document.removeEventListener("touchmove", card._dragBlock, { passive: false }); card._dragBlock = null; } document.removeEventListener("pointermove", mv2); document.removeEventListener("pointerup", up2); document.removeEventListener("pointercancel", cancel); card.classList.remove("lift"); card.classList.remove("dragging"); hideTrash(); }
        function mv2(e) {
          if (_pinching) { if (holdT) { clearTimeout(holdT); holdT = null; } moved = false; picked = false; card.classList.remove("lift", "dragging"); card.style.transform = ""; card.style.zIndex = ""; hideTrash(); return; } // a second finger = pinch: abandon any bubble drag/scroll and let the zoom own it (the resize loop repositions the bubble) — David 2026-06-26
          if (touch && !picked) { if (Math.abs(e.clientY - sy0) > 8 || Math.abs(e.clientX - sx0) > 8) { if (holdT) { clearTimeout(holdT); holdT = null; } } return; } // ANY finger move = native scroll (vertical, buttery) or a page-swipe (pb owns horizontal) → drop the pick-up hold. Only a STILL long-press becomes a drag. (David 2026-06-27)
          if (card.dataset.gate === "menu" || _started) return; // too tiny to move, OR already begun (static — can't reorder past the present) — only its tap-menu acts
          var dy = e.clientY - sy0, dx = e.clientX - sx0; if (!moved && (Math.abs(dy) > 3 || Math.abs(dx) > 3)) { moved = true; if (!snapped) { snapped = true; pushUndo(); } card.classList.add("lift"); card.classList.add("dragging"); } if (moved) { e.preventDefault(); showTrash(); overTrash(e.clientX, e.clientY); dragMin = Math.max(_floor, Math.min(_ceil, sm0 + Math.round((dy / HP * 60) / 15) * 15)); card.style.top = topFor(dragMin) + "px"; if (ct0) ct0.textContent = fmt(dragMin) + "–" + fmt(dragMin + (b.mins || 30)); if (_freeDrag) { card.style.transform = "translateX(" + dx + "px) scale(1.04)"; card.style.zIndex = "30"; card.classList.toggle("over-real", dx > 45); card.classList.toggle("over-plan", !!b.done && dx < -45); } else preview(card, dragMin, dragMin + (b.mins || 30)); } // a past bubble isn't lane-locked — it floats under the finger so you can fling it to the bin OR across lanes (David 2026-06-25)
        }
        function up2(e) { var wasMoved = moved, wasScroll = scrolling, trashed = wasMoved && e && overTrash(e.clientX, e.clientY); var dxEnd = e ? e.clientX - sx0 : 0, fling = _freeDrag && wasMoved && !trashed && Math.abs(dxEnd) > 45;
          var _scWrap = card.closest(".day-cardscroll"), _tgtSec = null; if (wasMoved && !trashed && e && _scWrap) { var _ss = _scWrap.querySelectorAll(".day-sec"); for (var _q = 0; _q < _ss.length; _q++) { var _r = _ss[_q].getBoundingClientRect(); if (e.clientY >= _r.top && e.clientY < _r.bottom) _tgtSec = _ss[_q]; } } var _tgtDk = _tgtSec ? _tgtSec.dataset.dk : null, crossDay = !!_tgtDk && _tgtDk !== k; // dropped over a DIFFERENT day's section in the continuous stack → move it to that day (David 2026-06-26)
          card.style.transform = ""; card.style.zIndex = ""; card.classList.remove("over-real"); card.classList.remove("over-plan"); clean();
          if (trashed) { var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); reflow(k); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate([8, 30, 8]); } catch (e2) {} toast("🗑 deleted"); }
          else if (crossDay) { var _tc = _tgtSec.querySelector(".cal"), _cr = _tc.getBoundingClientRect(), _sh = +_tc.dataset.startH; var _tm = hm(timeFromY(e.clientY - _cr.top, isNaN(_sh) ? 6 : _sh, HP)); var a4 = blocks(k), i4 = a4.indexOf(b); if (i4 >= 0) a4.splice(i4, 1); b.time = pad(Math.floor(_tm / 60)) + ":" + pad(_tm % 60); blocks(_tgtDk).push(b); reflow(k); reflow(_tgtDk); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} toast("moved to " + relLabel(_tgtDk).toLowerCase()); } // re-homed to another day
          else if (fling && b.done) { // a COMPLETED fused bar (planned + done): fling RIGHT → real only (finished but UNPLANNED) · fling LEFT → plan only (UNCOMPLETED) — David 2026-06-25
            var bs2 = hm(b.time), be2 = bs2 + (b.mins || 30), dm = domainOf(b), LG = logs(k), mi = -1; for (var li = 0; li < LG.length; li++) { var ls = hm(LG[li].time), le = ls + (LG[li].mins || 0); if (ls < be2 && le > bs2 && domainOf(LG[li]) === dm) { mi = li; break; } }
            if (dxEnd > 0) { if (mi < 0) logs(k).push({ id: uid(), time: b.time, mins: b.mins || 30, title: b.title, domain: dm, color: b.color || (DOM[dm] || DOM.focus).c, catK: b.catK || null }); var a2 = blocks(k), bi = a2.indexOf(b); if (bi >= 0) a2.splice(bi, 1); reflow(k); reflowLogs(k); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} toast("kept as real — unplanned"); }
            else { if (mi >= 0) logs(k).splice(mi, 1); b.done = false; reflow(k); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} toast("marked not done — just a plan"); }
          }
          else if (fling && dxEnd > 0) { var dmv = domainOf(b), tnow = pad(Math.floor(dragMin / 60)) + ":" + pad(dragMin % 60); logs(k).push({ id: uid(), time: tnow, mins: b.mins || 30, title: b.title, domain: dmv, color: b.color || (DOM[dmv] || DOM.focus).c, catK: b.catK || null, prio: b.prio || 2 }); var a3 = blocks(k), bi3 = a3.indexOf(b); if (bi3 >= 0) a3.splice(bi3, 1); reflow(k); reflowLogs(k); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} toast("moved to real"); } // a plan flung all the way RIGHT RELOCATES into the real lane (it doesn't fuse to the middle — fusing is a side-stretch) (David 2026-06-25)
          else if (wasMoved) { b.time = pad(Math.floor(dragMin / 60)) + ":" + pad(dragMin % 60); reflow(k); save(); renderToday(); }
          else if (!wasScroll && e && Math.abs(e.clientX - sx0) < 12 && Math.abs(e.clientY - sy0) < 12) editBlk(b); } // bin → delete · fling → convert · moved → reorder · only a near-STATIONARY tap edits (a swipe across the bubble pages the day instead) — David 2026-06-26
        function cancel() { clean(); }
        document.addEventListener("pointermove", mv2, { passive: false }); document.addEventListener("pointerup", up2); document.addEventListener("pointercancel", cancel);
      });
      grip.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) {
        card.classList.add("dragging"); pushUndo();
        var sy = startY, sm = b.mins || 30, ct = card.querySelector(".ct");
        function mv(e) { var v = Math.max(5, Math.min(720, Math.round((sm + (e.clientY - sy) / HP * 60) / 5) * 5)); b.mins = v; card.style.height = Math.max(18, v / 60 * HP - 4) + "px"; if (ct) ct.textContent = fmt(hm(b.time)) + "–" + fmt(hm(b.time) + v); preview(card, hm(b.time), hm(b.time) + v); }
        function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflow(k); save(); renderToday(); } // past or future, growing a block reorders the neighbours (David 2026-06-25)
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      }, function () { editBlk(b); }); });
      gripT.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) {
        card.classList.add("dragging"); pushUndo();
        var sy = startY, sm = b.mins || 30, sStart = hm(b.time), endM = sStart + sm, ct = card.querySelector(".ct");
        function mv(e) { var ns = Math.max(0, Math.min(endM - 5, sStart + Math.round(((e.clientY - sy) / HP * 60) / 5) * 5)); var nm = endM - ns; b.time = pad(Math.floor(ns / 60)) + ":" + pad(ns % 60); b.mins = nm; card.style.top = topFor(ns) + "px"; card.style.height = Math.max(18, nm / 60 * HP - 4) + "px"; if (ct) ct.textContent = fmt(ns) + "–" + fmt(endM); preview(card, ns, endM); }
        function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflow(k); save(); renderToday(); }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      }, function () { editBlk(b); }); });
    });
    if (burnedSomething) save(); // persist the burn so a passed plan stays dark across renders / when pushed forward
    // (removed the below-now "plan today" button on the left — planning starts from the Plan day button up top now; David 2026-06-25)
    // a REAL item is "on-plan" (→ gold) when it overlaps a PLAN block of the SAME domain (§24 Guitar-Hero win); drift is shown honestly, never hidden
    function onPlanMatch(it, dom) { for (var i = 0; i < bls.length; i++) { var s2 = hm(bls[i].time), e2 = s2 + (bls[i].mins || 30); if (it.s < e2 && it.e > s2 && domainOf(bls[i]) === dom) return true; } return false; }
    function fusedIntoPlan(it, dom) { for (var i = 0; i < bls.length; i++) { var s2 = hm(bls[i].time), e2 = s2 + (bls[i].mins || 30); if (it.s < e2 && it.e > s2 && domainOf(bls[i]) === dom && blockStatus(k, bls[i]) === "ok") return true; } return false; } // matched & complete → the plan bar goes full-width and represents BOTH lanes; don't draw this real log separately (David 2026-06-25)
    function matchedSpan(b, dom) { var s = null, e = null, bs = hm(b.time), be = bs + (b.mins || 30); for (var i = 0; i < lgs.length; i++) { var ls = hm(lgs[i].time), le = ls + (lgs[i].mins || 0); if (ls < be && le > bs && domainOf(lgs[i]) === dom) { var cs = Math.max(bs, ls), ce = Math.min(be, le); if (s === null || cs < s) s = cs; if (e === null || ce > e) e = ce; } } return s === null ? null : { start: s, end: e, cov: e - s }; } // bounding span where same-domain real logs cover the plan block (David 2026-06-25)
    var acts = [];
    lgs.forEach(function (e) { var s = hm(e.time); acts.push({ kind: "log", ref: e, s: s, e: s + (e.mins || 15) }); });
    if (showNow) S.timers.forEach(function (t) { if (logicalK(new Date(t.start)) !== k) return; var d = new Date(t.start), s = toWin(d.getHours() * 60 + d.getMinutes()); acts.push({ kind: "timer", ref: t, s: s, e: Math.max(s, logicalNowMin()) }); }); // live bubble spans start → NOW exactly (never +5 into the future) so it stays BEHIND the now-line and starts ~0, growing as time prints (David 2026-06-27)
    layoutLane(acts);
    var liveBottom = topFor(now); // where the "start new" slot anchors — below the live bubble's real bottom (a young timer floors to 62px & would otherwise cover it)
    acts.forEach(function (it) {
      if (it.kind === "log" && fusedIntoPlan(it, domainOf(it.ref))) return; // matched: shown as the fused full-width plan bar, not a separate real bar (David 2026-06-25)
      if (it.kind === "timer" && _convFused) return; // tracking ON-PLAN: the plan's straddle already drew the WIDE matched bar (plan+reality fused) + detached the ghost — don't ALSO draw the narrow live bubble (that duplicate was why the print looked narrow instead of wide) — David 2026-06-27
      var card = add(cal, "div", "calblk lane act" + (it.kind === "timer" ? " live" : "")), colW = 50 / it.cols;
      var cardH;
      if (it.kind === "timer") { cardH = Math.max(0, (it.e - it.s) / 60 * HP - 2); card.style.top = topFor(it.s) + "px"; card.style.height = cardH + "px"; card.dataset.mn = it.s; card.dataset.dur = (it.e - it.s); card.dataset.baseh = cardH; liveBottom = Math.max(liveBottom, topFor(it.s) + cardH); } // starts ~0 (invisible) at the now-line and grows UPWARD behind it as time passes — no minimum size, no extending below now (David 2026-06-27) // LIVE bubble PRINTS into the past: grows from its start down to the now-line as time passes, starting as a thin sliver (too small for text → the now-line readout covers the "what" until it's tall enough to switch to on-bubble text) — David 2026-06-27
      else { cardH = Math.max(5, (it.e - it.s) / 60 * HP - 4); card.style.top = topFor(it.s) + "px"; card.style.height = cardH + "px"; card.dataset.mn = it.s; liveBottom = Math.max(liveBottom, topFor(it.s) + cardH); } // floor-5/margin-4, no cap → matches the live-zoom relayout exactly (no bounce)
      card.style.left = "calc(50% + 4px)"; card.style.right = "4px"; card.style.width = "auto"; // one activity at a time — real lane is always full width, never split into multitasking columns (David 2026-06-23)
      if (it.kind === "log") {
        var e = it.ref, dom = domainOf(e), D = DOM[dom], drift = (dom === "drift"), onp = !drift && onPlanMatch(it, dom);
        card.style.background = drift ? mixHex(D.c, "#160510", 0.5) : onp ? ("repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)") : mixHex(D.c, "#160510", 0.84); card.style.borderColor = onp ? "#160510" : mixHex(D.c, "#160510", 0.34); card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.08),0 3px 0 #160510,0 5px 12px rgba(0,0,0,.4)"; // matched real = deep stripes · drift = dark mauve · no neon/shine (David 2026-06-27)
        if (onp) card.classList.add("onplan"); else if (drift) card.classList.add("drift");
        var cn = add(card, "div", "cn"); cn.style.color = D.light; cn.innerHTML = tiIcon(e) + ' <span class="cn-t">' + esc(e.title) + '</span>' + (onp ? ' <i class="ti ti-sparkles" style="color:' + D.c + '"></i>' : "");
        card.dataset.dur = it.e - it.s; card.dataset.ic = tiClass(e); card.dataset.c = D.c; card.dataset.ink = D.ink; degrade(card);
        if (card.classList.contains("lbl-i") || card.classList.contains("lbl-s")) railItems.push({ y: parseFloat(card.style.top) + (parseFloat(card.style.height) || 4) / 2, ic: tiClass(e), c: D.c, ink: D.ink, open: (function (ee) { return function () { logEdit(ee, k); }; })(e) }); // too thin to label → its symbol goes to the right rail; tap the chip to open it (David 2026-06-25)
        if (drift) { var dl = add(card, "div", "csub", "drifted"); dl.style.color = D.ink; }
        var xb = add(card, "div", "calx"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); }); xb.addEventListener("click", function (ev) { ev.stopPropagation(); pushUndo(); var a = logs(k), i = a.indexOf(e); if (i >= 0) a.splice(i, 1); save(); renderToday(); });
        function gapAdj() { var bk = Array.prototype.slice.call(cal.querySelectorAll(".backfill")); var oT = parseFloat(card.style.top) || 0, oB = oT + (parseFloat(card.style.height) || 0), above = null, below = null; bk.forEach(function (sl) { var t = parseFloat(sl.style.top) || 0, h = parseFloat(sl.style.height) || 0, b = t + h; if (b <= oT + 10 && (!above || b > above.b)) above = { el: sl, top: t, b: b }; if (t >= oB - 10 && (!below || t < below.t)) below = { el: sl, bottom: t + h, t: t }; }); return function (nT, nB) { if (above) above.el.style.height = Math.max(0, nT - above.top - 4) + "px"; if (below) { below.el.style.top = nB + "px"; below.el.style.height = Math.max(0, below.bottom - nB - 4) + "px"; } }; } // the empty "+" backfill gaps above/below this real item follow it live while you drag/resize (David 2026-06-25)
        var lg = add(card, "div", "grip"); lg.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) { pushUndo(); card.classList.add("dragging"); var sy = startY, sm = e.mins || 15, cs = card.querySelector(".csub"), ga = gapAdj(); function mv(e2) { var v = Math.max(5, Math.round((sm + (e2.clientY - sy) / HP * 60) / 5) * 5); e.mins = v; var hpx = Math.max(24, v / 60 * HP - 3); card.style.height = hpx + "px"; if (cs) cs.textContent = fmt(it.s) + "–" + fmt(it.s + v); ga(parseFloat(card.style.top) || 0, (parseFloat(card.style.top) || 0) + hpx); } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflowLogs(k); save(); renderToday(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }, function () { logEdit(e, k); }); }); // .dragging suppresses the height transition so the drag tracks the finger instantly; reflowLogs reorders overlapped real items (David 2026-06-25)
        var lgT = add(card, "div", "gript"); lgT.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) { pushUndo(); card.classList.add("dragging"); var sy = startY, endM = it.e, cs = card.querySelector(".csub"), ga = gapAdj(); function mv(e2) { var ns = Math.max(0, Math.min(endM - 5, it.s + Math.round(((e2.clientY - sy) / HP * 60) / 5) * 5)); var nm = endM - ns; e.time = pad(Math.floor(ns / 60)) + ":" + pad(ns % 60); e.mins = nm; var tpx = topFor(ns); card.style.top = tpx + "px"; card.style.height = Math.max(24, nm / 60 * HP - 3) + "px"; if (cs) cs.textContent = fmt(ns) + "–" + fmt(endM); ga(tpx, topFor(endM)); } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflowLogs(k); save(); renderToday(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }, function () { logEdit(e, k); }); }); // drag the top edge → move the START earlier/later (end fixed); reflowLogs reorders overlapped real items (David 2026-06-24)
        card.addEventListener("pointerdown", function (ev) { // hold to rearrange a past activity · drag = scroll · tap = re-label/menu (David 2026-06-24)
          if (ev.target === xb || ((ev.target === lg || ev.target === lgT) && card.dataset.gate === "full")) return;
          var touch = ev.pointerType === "touch", scE = (card.closest && card.closest(".day-cardscroll")) || el("pullBody"); if (!touch) ev.preventDefault();
          var sy = ev.clientY, sx = ev.clientX, lastY = ev.clientY, sm0 = it.s, dur = e.mins || 15, moved = false, picked = !touch && card.dataset.gate !== "menu", scrolling = false, holdT = null, cur2 = sm0, snapped = false, _freeDrag = showNow, _ga = null; function overPlan(cx) { var r = cal.getBoundingClientRect(); return cx < r.left + r.width * 0.5; } // a real item can cross LEFT into the plan lane
          if (touch) holdT = setTimeout(function () { if (scrolling || card.dataset.gate === "menu" || _pinching) return; picked = true; holdT = null; card.classList.add("lift"); card.classList.add("dragging"); card._dragBlock = function (ev) { ev.preventDefault(); }; document.addEventListener("touchmove", card._dragBlock, { passive: false }); try { if (navigator.vibrate) navigator.vibrate(9); } catch (e2) {} }, 280); // long-press → DRAG mode: block native scroll so the drag moves the bubble (David 2026-06-27)
          function relabel() { bentoPicker({ title: "What is it?", onPick: function (x) { e.title = x.title; e.color = x.color; e.catK = x.catK; save(); renderToday(); } }); }
          function clean() { if (holdT) { clearTimeout(holdT); holdT = null; } if (card._dragBlock) { document.removeEventListener("touchmove", card._dragBlock, { passive: false }); card._dragBlock = null; } document.removeEventListener("pointermove", mv2); document.removeEventListener("pointerup", up2); document.removeEventListener("pointercancel", cancel); card.classList.remove("lift"); card.classList.remove("dragging"); hideTrash(); }
          function mv2(ev2) {
            if (_pinching) { if (holdT) { clearTimeout(holdT); holdT = null; } moved = false; picked = false; card.classList.remove("lift", "dragging"); card.style.transform = ""; card.style.zIndex = ""; hideTrash(); return; } // pinch wins — drop the bubble drag/scroll (David 2026-06-26)
            if (touch && !picked) { if (Math.abs(ev2.clientY - sy) > 8 || Math.abs(ev2.clientX - sx) > 8) { if (holdT) { clearTimeout(holdT); holdT = null; } } return; } // any move = native scroll / page-swipe → drop the hold; only a still long-press becomes a drag (David 2026-06-27)
            if (card.dataset.gate === "menu") return; // too tiny to move — only its tap-menu acts
            var dy = ev2.clientY - sy, dx = ev2.clientX - sx; if (!moved && (Math.abs(dy) > 3 || Math.abs(dx) > 3)) { moved = true; if (!snapped) { snapped = true; pushUndo(); } card.classList.add("lift"); card.classList.add("dragging"); if (_freeDrag) _ga = gapAdj(); } if (moved) { ev2.preventDefault(); showTrash(); overTrash(ev2.clientX, ev2.clientY); cur2 = Math.max(0, Math.min(logicalNowMin() - dur, sm0 + Math.round((dy / HP * 60) / 5) * 5)); var tpx = topFor(cur2); card.style.top = tpx + "px"; if (_freeDrag) { card.style.transform = "translateX(" + dx + "px) scale(1.04)"; card.style.zIndex = "30"; card.classList.toggle("over-plan", dx < -45); if (_ga) _ga(tpx, tpx + (parseFloat(card.style.height) || 0)); } }
          }
          function up2(ev3) { var wasMoved = moved, wasScroll = scrolling, trashed = wasMoved && ev3 && overTrash(ev3.clientX, ev3.clientY); var dxEnd = ev3 ? ev3.clientX - sx : 0, droppedPlan = _freeDrag && wasMoved && !trashed && dxEnd < -45; card.style.transform = ""; card.style.zIndex = ""; card.classList.remove("over-plan"); clean();
            if (trashed) { var a = logs(k), i = a.indexOf(e); if (i >= 0) a.splice(i, 1); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate([8, 30, 8]); } catch (e2) {} toast("🗑 deleted"); }
            else if (droppedPlan) { e.time = pad(Math.floor(cur2 / 60)) + ":" + pad(cur2 % 60); var dmv = domainOf(e); blocks(k).push({ id: uid(), time: e.time, mins: e.mins || dur, title: e.title, domain: dmv, color: e.color || (DOM[dmv] || DOM.focus).c, catK: e.catK || null, prio: e.prio || 2, done: false }); var la = logs(k), li2 = la.indexOf(e); if (li2 >= 0) la.splice(li2, 1); reflow(k); reflowLogs(k); save(); renderToday(); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e2) {} toast("moved to plan"); } // a real bubble flung all the way LEFT RELOCATES into the plan lane (becomes just a plan) — fusing is a side-stretch (David 2026-06-25)
            else if (wasMoved) { e.time = pad(Math.floor(cur2 / 60)) + ":" + pad(cur2 % 60); reflowLogs(k); save(); renderToday(); } else if (!wasScroll && ev3 && Math.abs(ev3.clientX - sx) < 12 && Math.abs(ev3.clientY - sy) < 12) logEdit(e, k); } // only a near-STATIONARY tap edits — a swipe across the bubble pages the day (David 2026-06-26)
          function cancel() { clean(); }
          document.addEventListener("pointermove", mv2, { passive: false }); document.addEventListener("pointerup", up2); document.addEventListener("pointercancel", cancel);
        });
      } else {
        var t = it.ref, dom = domainOf(t), D = DOM[dom], drift = (dom === "drift"), onp = !drift && onPlanMatch(it, dom);
        card.style.background = drift ? mixHex(D.c, "#160510", 0.5) : onp ? ("repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)") : mixHex(D.c, "#160510", 0.84); card.style.borderColor = onp ? "#160510" : mixHex(D.c, "#160510", 0.34); card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.08),0 3px 0 #160510"; // live on-plan = deep stripes · no neon/shine (David 2026-06-27)
        if (onp) card.classList.add("onplan"); else if (drift) card.classList.add("drift");
        var cn = add(card, "div", "cn"); cn.style.color = D.light; cn.innerHTML = '<i class="ti ti-player-play-filled"></i> <span class="cn-t">' + esc(t.title) + '</span> · <span class="live-elapsed" data-tid="' + t.id + '">' + elapsedStr(t) + '</span>';
        card.dataset.ic = tiClass(t); card.dataset.c = D.c; card.dataset.ink = D.ink; degrade(card); // density by height: a short sliver hides its text (the now-line readout shows it); once tall enough the title+elapsed live ON the bubble (David 2026-06-27)
        // live controls now live in the pull-up dock (#liveDock) — no redundant in-card stop (David 2026-06-25)
        var gT = add(card, "div", "gript");
        gT.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); card.classList.add("dragging"); var sy = ev.clientY, s0 = t.start, ct = card.querySelector(".ct"); var d0s = new Date(t.start), startMin0 = d0s.getHours() * 60 + d0s.getMinutes(); var prevLog = null, prevEnd = -1; lgs.forEach(function (L) { var le = hm(L.time) + (L.mins || 0); if (le <= startMin0 && le > prevEnd) { prevEnd = le; prevLog = L; } }); var floorMin = prevLog ? hm(prevLog.time) : startH * 60; var fb = new Date(t.start); fb.setHours(Math.floor(floorMin / 60), floorMin % 60, 0, 0); var floorMs = fb.getTime(); function mv(e3) { var dmin = Math.round(((e3.clientY - sy) / HP * 60) / 5) * 5, ns = Math.max(floorMs, Math.min(Date.now(), s0 + dmin * 60000)); t.start = ns; var nd = new Date(ns), tsm = nd.getHours() * 60 + nd.getMinutes(); var topPx = topFor(tsm); card.style.top = topPx + "px"; card.style.height = Math.max(24, Math.max(5, (Date.now() - ns) / 60000) / 60 * HP - 3) + "px"; if (ct) ct.textContent = fmt(tsm); var bk = cal.querySelectorAll(".backfill"); for (var bi = 0; bi < bk.length; bi++) { var sl = bk[bi], sTop = parseFloat(sl.style.top) || 0, sH = parseFloat(sl.style.height) || 0; if (sTop < topPx && sTop + sH > topPx) { sl.style.height = Math.max(0, topPx - sTop - 4) + "px"; sl.style.opacity = (topPx - sTop < 22) ? "0" : "1"; } } } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); var nm2 = new Date(t.start).getHours() * 60 + new Date(t.start).getMinutes(); if (prevLog && nm2 < prevEnd) { var ps = hm(prevLog.time), trimmed = nm2 - ps; if (trimmed < 5) { var ix = logs(k).indexOf(prevLog); if (ix >= 0) logs(k).splice(ix, 1); } else prevLog.mins = trimmed; } save(); renderToday(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }); // extend into the past → the previous activity's end shifts to match (never side-by-side)
        card.addEventListener("click", function (ev) { if (ev.target === gT) return; startOrSwitch(); }); // tap the running activity → switch (David 2026-06-23)
      }
    });
    // BACKFILL — ANY untracked gap in the REAL lane is a tap-to-fill invitation (§7/§14, David 2026-06-23): you're placed WHERE you tap (tap-Y → that time), then you stretch it.
    if (showNow && k === todayK()) {
      var ivs = acts.map(function (it) { return [it.s, it.e]; }).sort(function (a, b) { return a[0] - b[0]; });
      var cur = startH * 60, gaps = [];
      ivs.forEach(function (g) { if (g[0] - cur >= 10) gaps.push([cur, g[0]]); cur = Math.max(cur, g[1]); });
      if (now - cur >= 10) gaps.push([cur, now]);
      gaps.forEach(function (g) {
        var slot = add(cal, "div", "backfill"); slot.style.top = topFor(g[0]) + "px"; slot.style.height = Math.max(20, (g[1] - g[0]) / 60 * HP - 4) + "px"; slot.style.left = "calc(50% + 4px)"; slot.style.right = "4px"; slot.dataset.mn = g[0]; slot.dataset.dur = (g[1] - g[0]); // tag so the backfill "+" tracks zoom like everything else (David 2026-06-25)
        slot.innerHTML = '<i class="ti ti-plus"></i>'; slot.style.opacity = ".38"; slot.style.fontSize = "12px"; // subtle forgot-to-track tap, not a loud prompt (David 2026-06-25)
        slot.addEventListener("click", function (e) {
          var gs, gm;
          if ((g[1] - g[0]) <= 75) { gs = g[0]; gm = g[1] - g[0]; } // small/medium gap → fill it COMPLETELY, no leftover slivers (David 2026-06-23)
          else { var rect = cal.getBoundingClientRect(); gs = hm(timeFromY(e.clientY - rect.top, startH, HP)); gs = Math.max(g[0], Math.min(g[1] - 30, gs)); gm = g[1] - gs; } // big gap → fill from where you tapped DOWN to the present-side end: large enough, and only the gap ABOVE stays a "fill it in" (never a sliver below — that's closest to now) — David 2026-06-24
          bentoPicker({ title: "What were you doing?", onPick: function (x) { logs(k).push({ id: uid(), time: pad(Math.floor(gs / 60)) + ":" + pad(gs % 60), mins: gm, title: x.title, color: x.color, catK: x.catK }); save(); renderToday(); } });
        });
      });
    }
    // "start new" slot removed — starting/switching now lives in the pull-up dock (#liveDock); nothing clutters below the now-line (David 2026-06-25)
    cal.addEventListener("pointerdown", function (ev) {
      if (!cal.contains(ev.target)) return;
      if (ev.target.closest && ev.target.closest(".calblk, .backfill, .railchip, .nowread, .nowtime")) return; // a bubble/control is not a create gesture
      var dy = ev.clientY, dx = ev.clientX, t0 = Date.now();
      var rect0 = cal.getBoundingClientRect(), lx0 = ev.clientX - rect0.left;
      var downM = hm(timeFromY(dy - rect0.top, startH, HP)); // the time you pressed at
      var isFuture = (k > todayK()) || !showNow || downM >= logicalNowMin();
      var rightTrack = !isFuture && showNow && lx0 > rect0.width * 0.5; // present/past REAL lane → tap-to-track, not create
      var planSide = isFuture || lx0 <= rect0.width * 0.5;
      var moved = false, done = false, holdT = null;
      function makeBlock() { var snap = Math.max(0, Math.min(1410, Math.round(downM / 5) * 5)); var id = uid(); blocks(k).push({ id: id, time: pad(Math.floor(snap / 60)) + ":" + pad(snap % 60), mins: 30, title: "", prio: 2, color: "#8a5cf0", done: false }); reflow(k); save(); renderToday(); var nb = blocks(k).filter(function (b) { return b.id === id; })[0]; if (nb) editBlk(nb); } // a 30-min empty bubble + its editor; the slider sizes it (drag-on-timeline can't beat the scroller, so we don't try) — David 2026-06-26
      // PRESS-AND-HOLD-to-create REMOVED (David 2026-06-27, "I don't like it") — empty bubbles are made by a deliberate quick TAP only (in up()), never an accidental hold. holdT stays null; the done/holdT guards below are harmless no-ops.
      function mv(e) { if (!moved && (Math.abs(e.clientY - dy) > 12 || Math.abs(e.clientX - dx) > 12)) { moved = true; if (holdT) { clearTimeout(holdT); holdT = null; } } } // a drag means you're scrolling → cancel the create
      function up(e) {
        if (holdT) { clearTimeout(holdT); holdT = null; }
        document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
        if (done) return; // already created on the hold
        if (moved || Date.now() - t0 > 500) return; // scrolled / lingering → not a deliberate tap
        if (rightTrack) { bentoPicker({ title: "What are you doing?", multi: true, onPickMulti: function (sel) { var _t = startTrackerNow(); assignTimerMulti(_t, sel); maybeCelebrateTrack(_t); }, onPick: function (x) { var _t = startTrackerNow(); assignTimer(_t, x); maybeCelebrateTrack(_t); } }); }
        else makeBlock(); // quick tap on empty plan / future → new bubble + editor
      }
      document.addEventListener("pointermove", mv, { passive: true }); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", up);
    });
    // RIGHT SYMBOL RAIL — the symbols of bars too thin to label, stacked in order, never overlapping (David 2026-06-25)
    railItems.sort(function (a, b) { return a.y - b.y; });
    var _rn = railItems.length, _rf = _rn ? (railItems[0].y - 8) : 0, _rpitch = _rn > 1 ? Math.max(18, ((railItems[_rn - 1].y - 8) - _rf) / (_rn - 1)) : 18; // EVEN-distribute the rail icons across their span — pinning each to its block's y made the future (sparse, irregular times) unevenly spaced while the dense past looked even (David 2026-06-27)
    railItems.forEach(function (it, _ri) { var y = _rf + _ri * _rpitch; var chip = add(cal, "div", "railchip"); chip.style.top = y + "px"; chip.style.background = it.c; chip.style.color = it.ink; chip.innerHTML = '<i class="ti ' + it.ic + '"></i>'; if (it.open) { chip.style.pointerEvents = "auto"; chip.style.cursor = "pointer"; chip.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); }); chip.addEventListener("click", function (ev) { ev.stopPropagation(); it.open(); }); } }); // PURE even spacing: y = first + i*pitch, every gap identical (no per-block pinning, no now-dodge pile-up) — even from first chip to last across past AND future (David 2026-06-27)
  }
  function weekGrid(L, baseK, onDay) {
    baseK = baseK || viewK; onDay = onDay || function (dk) { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
    var d0 = startOfWeek(baseK), row = add(L, "div", "weekrow");
    for (var i = 0; i < 7; i++) { (function (dk) {
      var col = add(row, "div", "wkcol" + (dk === todayK() ? " today" : "")), d = kd(dk);
      add(col, "div", "wkh", ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()] + " " + d.getDate());
      var strip = add(col, "div", "wkstrip");
      blocks(dk).forEach(function (b) { var bs = hm(b.time), y = Math.max(0, (bs - 360) / (18 * 60) * 100), h = Math.max(2, (b.mins || 30) / (18 * 60) * 100), st = blockStatus(dk, b), bb = add(strip, "div", "wkb"); bb.style.top = y + "%"; bb.style.height = h + "%"; bb.style.background = st === "ok" ? "#46e2a4" : st === "miss" ? "#5e2f49" : (b.color || "#ff5fa0"); });
      col.onclick = function () { onDay(dk); };
    })(keyAdd(d0, i)); }
  }
  function monthGrid(L, baseK, onDay) {
    baseK = baseK || viewK; onDay = onDay || function (dk) { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
    var f = kd(baseK); f.setDate(1); var startDow = f.getDay(), y = f.getFullYear(), mo = f.getMonth(), dim = new Date(y, mo + 1, 0).getDate(), grid = add(L, "div", "mogrid");
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (w) { add(grid, "div", "mowh", w); });
    for (var p = 0; p < startDow; p++) add(grid, "div", "mocell empty");
    for (var day = 1; day <= dim; day++) { (function (dk, day) {
      var cell = add(grid, "div", "mocell" + (dk === todayK() ? " today" : "")); add(cell, "div", "mod", "" + day);
      var bl = blocks(dk), done = 0; bl.forEach(function (b) { if (blockStatus(dk, b) === "ok") done++; });
      if (bl.length) { var d2 = add(cell, "div", "modot"), sc = done / bl.length; d2.style.background = sc >= 1 ? "#46e2a4" : sc > 0 ? "#ffc24a" : "#5e2f49"; }
      cell.onclick = function () { onDay(dk); };
    })(y + "-" + pad(mo + 1) + "-" + pad(day), day); }
  }
  function timelineIsHome() { return document.body.classList.contains("tab-day") && !document.body.classList.contains("gaming"); } // Today tab in the normal app = the always-open rich pull-timeline (David 2026-06-24)
  function renderToday() {
    if (timelineIsHome()) { buildPull(); return; } // the original pull-down timeline IS the Today view now — don't render the retired inline calendar (David 2026-06-24)
    var dl = el("dnLabel"); if (dl) dl.textContent = zoomMode === "day" ? relLabel(viewK) : zoomMode === "week" ? ("Week of " + relShort(startOfWeek(viewK))) : kd(viewK).toLocaleDateString([], { month: "long", year: "numeric" });
    document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.classList.toggle("on", z.dataset.z === zoomMode); });
    var dp = el("planToday"), tt = el("todayTitle"), L = el("todayList");
    var adh = el("adhereChip"); if (adh) adh.style.display = "none";
    var sgb0 = el("suggestBar"); // suggestions are tap-triggered now (via + add), not always-on (David 2026-06-23)
    if (zoomMode === "week") { L.innerHTML = ""; weekGrid(L); tt.textContent = "This week — tap a day"; if (dp) dp.style.display = "none"; if (sgb0) sgb0.style.display = "none"; return; }
    if (zoomMode === "month") { L.innerHTML = ""; monthGrid(L); tt.textContent = "Tap a day"; if (dp) dp.style.display = "none"; if (sgb0) sgb0.style.display = "none"; return; }
    if (dp) dp.style.display = ""; tt.textContent = relLabel(viewK);
    calendarView(L, viewK, viewK === todayK());
    if (adh) { var _bl = blocks(viewK), _n = 0; _bl.forEach(function (b) { if (blockStatus(viewK, b) === "ok") _n++; }); adh.textContent = "✨ " + _n + " on plan"; adh.style.display = _bl.length ? "" : "none"; }
    if (el("pullSheet") && el("pullSheet").classList.contains("on")) buildPull(); // tool-above (pull-down) stays identical to the journal
    if (pendingScrollNow && nowLineEl) { var _nl = nowLineEl; requestAnimationFrame(function () { if (_nl.offsetParent !== null) { _nl.scrollIntoView({ block: "center" }); pendingScrollNow = false; } }); }
  }
  function subtaskSheet(title, k) {
    var subs = subtasksFor(title); if (!subs) return false; k = k || todayK();
    var dom = domainOf({ title: title }), D = DOM[dom];
    var ov = add(document.body, "div", "bento-ov"), card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head"); add(head, "div", "bento-q", "Break down: " + title); var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); };
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var bd = add(card, "div", "bento-body"); add(bd, "div", "sughead", "tap a step to drop it into your plan");
    var added = {}, wrap = add(bd, "div", "sugrow"); wrap.style.gridTemplateColumns = "1fr";
    subs.forEach(function (s) { var c = add(wrap, "div", "sugchip"); c.style.background = D.c; c.style.color = D.ink; c.innerHTML = '<i class="ti ' + tiClass({ title: s, domain: dom }) + '"></i> ' + esc(s); c.onclick = function () { if (added[s]) return; added[s] = 1; c.style.opacity = ".55"; c.innerHTML = '<i class="ti ti-check"></i> ' + esc(s) + ' · added'; blocks(k).push({ id: uid(), time: nextFreeTime(k), mins: 20, title: s, prio: 2, color: D.c, domain: dom, done: false }); reflow(k); save(); renderToday(); }; });
    var foot = add(card, "div", "bento-foot"); var ab = add(foot, "button", "bento-go"); ab.innerHTML = '<i class="ti ti-list-check"></i> add all steps'; ab.onclick = function () { subs.forEach(function (s) { if (!added[s]) blocks(k).push({ id: uid(), time: nextFreeTime(k), mins: 20, title: s, prio: 2, color: D.c, domain: dom, done: false }); }); reflow(k); save(); renderToday(); ov.remove(); }; return true;
  }
  function editorSheet(o, k, isLog) { // unified activity editor — merged hero (name = switch), draggable scrubber, auto-save (David 2026-06-25)
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); el("sheet").classList.add("edsheet"); el("sheet").classList.add("edpro"); pushUndo();
    var _sx = el("sheetX"); if (_sx) _sx.style.display = "none"; // editor exits by tapping above or swiping down — the top-right slot is the TRASH now (David 2026-06-26)
    var trashTop = add(B, "button", "ed-trash-top"); trashTop.innerHTML = '<i class="ti ti-trash"></i>'; trashTop.setAttribute("aria-label", "delete"); trashTop.onclick = function () { var a = isLog ? logs(k) : blocks(k); var ix = a.indexOf(o); if (ix >= 0) a.splice(ix, 1); save(); closeSheet(); renderAll(); };
    var DEF = isLog ? 15 : 30;
    function D() { return DOM[domainOf(o)] || DOM.focus; }
    function dlbl(m) { return m < 60 ? m + "m" : (m % 60 ? (Math.floor(m / 60) + "h " + (m % 60) + "m") : (m / 60 + "h")); }
    function commit() { if (isLog) reflowLogs(k); else if (!blockPast(k, o)) reflow(k); save(); renderToday(); } // every change applies live — no Save button
    // HERO — the activity name IS the switch button, in its own colour
    var hero = add(B, "button", "ed-hero");
    function paintHero() { if (!o.title) { hero.classList.add("ed-hero-empty"); hero.style.removeProperty("background"); hero.style.removeProperty("color"); hero.style.removeProperty("border-color"); hero.innerHTML = '<span class="ed-heroname"><i class="ti ti-plus"></i> choose activity</span><i class="ti ti-chevron-right ed-swap"></i>'; return; } hero.classList.remove("ed-hero-empty"); var d = D(); hero.style.setProperty("background", d.c, "important"); hero.style.setProperty("color", d.ink, "important"); hero.style.setProperty("border-color", "#160510", "important"); hero.innerHTML = '<span class="ed-heroname"><i class="ti ' + tiClass(o) + '"></i> ' + esc(o.title) + '</span><i class="ti ti-switch-horizontal ed-swap"></i>'; } // empty bubble → a dashed "choose activity" prompt; filled → the activity in its own colour (David 2026-06-26)
    paintHero();
    hero.onclick = function () { bentoPicker({ title: "Switch to…", onPick: function (x) { o.title = x.title; o.catK = x.catK || null; o.color = x.color || o.color; if (x.domain) o.domain = x.domain; paintHero(); commit(); } }); };
    // SCRUBBER — drag the segment to move, pull the right edge to resize
    // LENGTH — one simple slider, 30s → 12h (log-scaled so tiny lengths are easy to land) — David 2026-06-25
    var MINM = 0.5, MAXM = 720;
    function snapMin(v) { return v < 5 ? Math.round(v * 2) / 2 : v < 60 ? Math.round(v / 5) * 5 : Math.round(v / 15) * 15; }
    function posToMin(p) { return snapMin(MINM * Math.pow(MAXM / MINM, p / 1000)); }
    function minToPos(m) { m = Math.max(MINM, Math.min(MAXM, m)); return Math.round(1000 * Math.log(m / MINM) / Math.log(MAXM / MINM)); }
    function lenLbl(m) { return m < 1 ? Math.round(m * 60) + "s" : m < 60 ? ((m % 1 ? m.toFixed(1) : m) + "m") : (Math.floor(m / 60) + "h" + (Math.round(m % 60) ? " " + Math.round(m % 60) + "m" : "")); }
    add(B, "div", "ed-hint", "length — slide from 30s to 12h");
    var sld = document.createElement("input"); sld.type = "range"; sld.min = "0"; sld.max = "1000"; sld.step = "1"; sld.value = minToPos(o.mins || DEF); sld.className = "ed-slider"; B.appendChild(sld);
    var read = add(B, "div", "ed-read");
    function layout() { var bs = hm(o.time), dur = o.mins || DEF; read.innerHTML = '<b>' + lenLbl(dur) + '</b> <span class="ed-dur">· ends ' + fmt(bs + dur) + '</span>'; }
    layout();
    sld.addEventListener("input", function () { o.mins = posToMin(+sld.value); layout(); });
    sld.addEventListener("change", function () { o.mins = posToMin(+sld.value); commit(); });
    // PRIORITY (segmented) + PIN (plan only)
    var prow = add(B, "div", "ed-prow");
    var seg3 = add(prow, "div", "ed-seg3"); PRIOS.forEach(function (p) { var c = add(seg3, "div", "ed-prio" + (p.v === (o.prio || 2) ? " on" : ""), p.l); c.onclick = function () { o.prio = p.v; Array.prototype.forEach.call(seg3.children, function (n) { n.classList.remove("on"); }); c.classList.add("on"); commit(); }; });
    if (!isLog) { var pinb = add(prow, "button", "ed-pin" + (o.pin ? " on" : "")); pinb.innerHTML = '<i class="ti ti-pin"></i>'; pinb.onclick = function () { o.pin = !o.pin; pinb.classList.toggle("on"); commit(); }; }
    // STEPS (plan only) — collapsed behind a toggle
    if (!isLog) {
      o.subs = o.subs || [];
      var stExp = add(B, "div", "ed-steps"); var stHead = add(stExp, "button", "ed-stephead"); var stBody = add(stExp, "div", "ed-stepbody"); stBody.style.display = o.subs.length ? "block" : "none";
      function stHeadTxt() { stHead.innerHTML = '<span><i class="ti ti-puzzle"></i> steps' + (o.subs.length ? ' · ' + o.subs.length : '') + '</span><i class="ti ti-chevron-' + (stBody.style.display === "none" ? "down" : "up") + '"></i>'; }
      stHeadTxt(); stHead.onclick = function () { stBody.style.display = stBody.style.display === "none" ? "block" : "none"; stHeadTxt(); };
      (function drawSteps() {
        stBody.innerHTML = "";
        o.subs.forEach(function (s, i) {
          var r = add(stBody, "div", "step-row" + (s.done ? " sdone" : ""));
          var ck = add(r, "button", "step-ck" + (s.done ? " on" : "")); ck.innerHTML = s.done ? '<i class="ti ti-check"></i>' : ""; ck.onclick = function () { s.done = !s.done; save(); drawSteps(); };
          add(r, "span", "step-t", s.t);
          var up = add(r, "button", "step-mv"); up.innerHTML = '<i class="ti ti-chevron-up"></i>'; up.disabled = i === 0; up.onclick = function () { var x = o.subs.splice(i, 1)[0]; o.subs.splice(i - 1, 0, x); save(); drawSteps(); };
          var dn = add(r, "button", "step-mv"); dn.innerHTML = '<i class="ti ti-chevron-down"></i>'; dn.disabled = i === o.subs.length - 1; dn.onclick = function () { var x = o.subs.splice(i, 1)[0]; o.subs.splice(i + 1, 0, x); save(); drawSteps(); };
          var rm = add(r, "button", "step-rm"); rm.innerHTML = '<i class="ti ti-x"></i>'; rm.onclick = function () { o.subs.splice(i, 1); save(); drawSteps(); stHeadTxt(); };
        });
        var ab = add(stBody, "button", "step-add"); ab.innerHTML = '<i class="ti ti-plus"></i> add a step'; ab.onclick = function () { bentoPicker({ title: "Add a step to " + o.title, onPick: function (x) { o.subs.push({ t: x.title, done: false }); save(); drawSteps(); stHeadTxt(); } }); };
      })();
    }
    // MARK DONE (plan only)
    if (!isLog) {
      var didit = add(B, "button", "ed-didit" + (o.done ? " on" : "")); function ddTxt() { didit.innerHTML = o.done ? '<i class="ti ti-circle-check"></i> did it · tap to undo' : '<i class="ti ti-circle"></i> mark done'; } ddTxt();
      didit.onclick = function () { o.done = !o.done; didit.classList.toggle("on"); ddTxt(); if (o.done) { var _st = bumpStreak(); celebrate(D().c, _st); } else coolStreak(); commit(); };
    }
    // FOOTER — auto-save means no Save; just Done + delete
    var foot = add(B, "div", "ed-foot");
    var done = add(foot, "button", "ed-done"); done.innerHTML = '<i class="ti ti-check"></i> Done'; done.onclick = function () { closeSheet(); renderAll(); }; // trash moved to top-right; exit also via tap-above / swipe-down (David 2026-06-26)
  }
  function blockEdit(b, k) { editorSheet(b, k, false); }
  function logEdit(e, k) { editorSheet(e, k, true); }
  function renderHabits() {
    var L = el("habitList"); if (!L) return; L.innerHTML = ""; var dm = doneMap(todayK()), done = 0; // Habits menu removed — same thing as the bento (David 2026-06-23)
    S.habits.forEach(function (hb) {
      var on = !!dm[hb.id]; if (on) done++;
      var r = add(L, "div", "hab" + (on ? " done" : "")); add(r, "div", "he", hb.e); add(r, "div", "hn", hb.l);
      if (hb.type === "quit") { var tag = add(r, "span", "htag", "quit"); tag.style.background = "#ff4d4d"; tag.style.marginRight = "6px"; }
      if (hb.per > 0) { var wk = weekDone(hb.id); var wd = add(r, "div", "wkdots"); for (var i = 0; i < hb.per; i++) { var di = add(wd, "i"); if (i < wk) di.style.background = hb.color; } }
      else { var sk = streak(hb.id); if (sk > 1) { var s = add(r, "div", null, "🔥 " + sk); s.style.cssText = "font-family:var(--bub);font-size:13px;color:#e0791c;font-weight:800;margin-right:4px;"; } }
      var ck = add(r, "div", "ck" + (on ? " on" : ""), on ? "✓" : ""); ck.style.borderColor = hb.color;
      var del = add(r, "div", "del", "✕"); del.onclick = function (e) { e.stopPropagation(); var i = S.habits.indexOf(hb); if (i >= 0) S.habits.splice(i, 1); save(); renderHabits(); };
      r.onclick = function () { toggleHabit(hb.id); };
    });
    el("habitProg").textContent = done + "/" + S.habits.length;
  }
  function toggleHabit(id) { var dm = doneMap(todayK()); dm[id] = !dm[id]; if (id === "tidy" && dm[id]) S.lastTidy = todayK(); if (dm[id]) earn(12, {}); save(); renderHabits(); renderHero(); renderChar(); renderGame(); }

  function renderStats() {
    var L = el("statsList"); if (!L) return; L.innerHTML = "";
    var days = lastDays(14).reverse();
    S.habits.forEach(function (h) {
      var r = add(L, "div", "hmrow"); add(r, "div", "hmn", h.e + " " + h.l);
      var grid = add(r, "div", "hmdots");
      days.forEach(function (k) { var d = add(grid, "i"); if ((S.habitDone[k] || {})[h.id]) d.style.background = h.color; });
      var s = streak(h.id); if (s > 1) add(r, "div", "hms", "🔥" + s);
    });
    var tot = 0; lastDays(7).forEach(function (k) { logs(k).forEach(function (e) { tot += e.mins || 0; }); });
    var sm = add(L, "div", "lbl", "last 7 days: " + dur(tot) + " tracked · best streak 🔥" + bestStreak()); sm.style.marginTop = "12px";
  }
  function renderAll() { renderHeader(); renderNow(); renderChar(); renderGame(); renderHero(); renderMood(); renderQuick(); renderToday(); renderHabits(); renderStats(); renderLiveTracker(); }

  // ---- BENTO picker (1:1 from mockup 019) — domain-clustered, expand-in-place, type-once add ----
  var DOM_ORDER = ["move", "nourish", "focus", "create", "connect", "play", "restore", "upkeep", "drift"];
  function allActivities() {
    var out = [], seen = {};
    function push(title, catK, habitId, group) { var lc = (title || "").toLowerCase(); if (!lc || seen[lc]) return; seen[lc] = 1; var dom = domainOf({ title: title, catK: catK, habitId: habitId }); out.push({ title: title, catK: catK || null, habitId: habitId || null, domain: dom, color: DOM[dom].c, group: group || null }); }
    CATS.forEach(function (c) { c.groups.forEach(function (g) { g.tasks.forEach(function (t) { push(t.l, c.k, t.id, g.g); }); }); }); // the full base library — every domain, all sub-groups
    var o = OCC_BY_K[(S.profile && S.profile.occ)]; if (o && o.work) o.work.forEach(function (g) { g.tasks.forEach(function (t) { push(t.l, "work", null, g.g); }); }); // + your life-stage's work
    (S.acts || []).forEach(function (a) { push(a.title, a.catK, null, "Mine"); });
    return out;
  }
  function bentoByDomain() { var by = {}; DOM_ORDER.forEach(function (d) { by[d] = []; }); allActivities().forEach(function (a) { (by[a.domain] = by[a.domain] || []).push(a); }); return by; }
  function isPinned(a) { return (S.pinned || []).indexOf((a.title || "").toLowerCase()) >= 0; } // pin any activity → it floats to the top + front (David 2026-06-24)
  function togglePin(a) { S.pinned = S.pinned || []; var t = (a.title || "").toLowerCase(), i = S.pinned.indexOf(t); if (i >= 0) S.pinned.splice(i, 1); else S.pinned.push(t); save(); }
  function bentoPicker(opts) {
    opts = opts || {};
    var multi = !!opts.multi, sel = [], by = bentoByDomain(), view = { cat: null }, foot = null, searchQ = "";
    var fq = {}; try { frequent(16).forEach(function (m) { fq[(m.title || "").toLowerCase()] = 1; }); } catch (e) {}
    var ov = add(document.body, "div", "bento-ov");
    var card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head");
    add(head, "div", "bento-q", opts.title || "What are you doing?");
    var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>';
    var body = add(card, "div", "bento-body");
    function close() { ov.remove(); }
    xb.onclick = close;
    ov.addEventListener("click", function (e) { if (e.target === ov) { close(); if (opts.onCancel) opts.onCancel(); } });
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } }
    function actChip(a, container, big) {
      var D = DOM[a.domain], on = sel.indexOf(a) >= 0, pin = isPinned(a);
      var s = add(container, "span", "bchip" + (big ? " big" : "") + (on ? " sel" : "") + (a.domain === "drift" ? " vice" : "") + (pin ? " pinned" : ""));
      if (a.domain !== "drift") { s.style.background = D.c; s.style.color = D.ink; }
      s.innerHTML = ((pin && !big) ? '<i class="ti ti-pin" style="opacity:.5;font-size:.85em"></i> ' : '') + '<i class="ti ' + tiClass(a) + '"></i> ' + esc(a.title) + (on ? ' <i class="ti ti-check"></i>' : ''); // ✓ when picked, 📌 when pinned — no yellow (David 2026-06-24)
      var holdT = null, held = false; // press & hold any chip → pin / unpin it (tap-only, no keyboard) — David 2026-06-24
      s.addEventListener("pointerdown", function () { held = false; holdT = setTimeout(function () { held = true; holdT = null; togglePin(a); toast(isPinned(a) ? "📌 pinned to the top" : "unpinned"); render(); }, 450); });
      function cancelHold() { if (holdT) { clearTimeout(holdT); holdT = null; } }
      s.addEventListener("pointermove", cancelHold); s.addEventListener("pointerup", cancelHold); s.addEventListener("pointercancel", cancelHold);
      s.onclick = function (e) { e.stopPropagation(); if (held) { held = false; return; } commit(a); };
      return s;
    }
    function actOf(m) { var t = (m.title || "").toLowerCase(); for (var d = 0; d < DOM_ORDER.length; d++) { var arr = by[DOM_ORDER[d]] || []; for (var i = 0; i < arr.length; i++) if ((arr[i].title || "").toLowerCase() === t) return arr[i]; } var dm = m.domain || domainOf(m); return { title: m.title, catK: m.catK || null, habitId: m.habitId || null, domain: dm, color: (DOM[dm] || DOM.focus).c }; } // frequent()/search → a real activity obj with a domain so the chip colors right (David 2026-06-24)
    function renderOverview() {
      // SEARCH (scrolls away with the content now) + PINNED row (your most-important — pin anything to bring it here & to the front) — David 2026-06-24
      var sb = add(body, "div", "bento-search"); add(sb, "span", "bento-sicon").innerHTML = '<i class="ti ti-search"></i>';
      var si = document.createElement("input"); si.type = "text"; si.className = "bento-sinput"; si.placeholder = "search activities…"; si.value = searchQ; sb.appendChild(si);
      var pinList = []; DOM_ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { if (isPinned(a)) pinList.push(a); }); }); // grouped by domain so the colours cluster
      var pinned = add(body, "div", "bento-pinned");
      if (pinList.length) { add(pinned, "span", "bento-qlbl", "★ Pinned"); pinList.forEach(function (a) { actChip(a, pinned, true).classList.add("fav"); }); }
      else { pinned.className = "bento-pinhint"; pinned.innerHTML = '<i class="ti ti-pin"></i> press &amp; hold any activity to pin your favourites up here'; }
      var results = add(body, "div", "bento-results"); results.style.display = "none";
      var gridWrap = add(body, "div", "bento-gridwrap");
      DOM_ORDER.forEach(function (d) {
        var acts = (by[d] || []).slice(); if (!acts.length) return;
        acts.sort(function (x, y) { return (isPinned(y) ? 1 : 0) - (isPinned(x) ? 1 : 0); }); // pinned → the front (David 2026-06-24)
        var D = DOM[d], mc = add(gridWrap, "div", "bento-cat"); mc.style.background = mixHex(D.c, "#160510", 0.72); mc.style.borderColor = mixHex(D.c, "#160510", 0.4);
        var lab = add(mc, "div", "bento-catl", D.l.toUpperCase()); lab.style.color = D.light; lab.onclick = function () { view.cat = d; render(); };
        var wrap = add(mc, "div", "bento-chips");
        var SHOWN = 6; acts.slice(0, SHOWN).forEach(function (a) { actChip(a, wrap, false); }); // 2-column grid: show the top few + a "+N" to open the rest (David's image 1)
        var rest = acts.length - SHOWN;
        if (rest > 0) { var more = add(wrap, "span", "bchip more"); more.style.background = mixHex(D.c, "#160510", 0.5); more.style.color = D.light; more.textContent = "+" + rest; more.onclick = function () { view.cat = d; render(); }; }
        else { var adc = add(wrap, "span", "bchip addc"); adc.innerHTML = '<i class="ti ti-plus"></i>'; adc.onclick = addNew; }
      });
      var addb = add(body, "div", "bento-add"); addb.innerHTML = '<i class="ti ti-plus"></i> add activity'; addb.onclick = addNew;
      function drawResults(q) {
        if (!q) { results.style.display = "none"; results.innerHTML = ""; gridWrap.style.display = ""; pinned.style.display = ""; addb.style.display = ""; return; }
        gridWrap.style.display = "none"; pinned.style.display = "none"; addb.style.display = "none"; results.style.display = ""; results.innerHTML = "";
        var ql = q.toLowerCase(), hits = [], seen2 = {};
        DOM_ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { var t = (a.title || "").toLowerCase(); if (t.indexOf(ql) >= 0 && !seen2[t]) { seen2[t] = 1; hits.push(a); } }); });
        hits.sort(function (a, b) { return a.title.toLowerCase().indexOf(ql) - b.title.toLowerCase().indexOf(ql); });
        hits.slice(0, 60).forEach(function (a) { actChip(a, results, false); });
        var ab = add(results, "span", "bchip addc"); ab.innerHTML = '<i class="ti ti-plus"></i> "' + esc(q) + '"'; ab.onclick = function () { S.acts = S.acts || []; S.acts.push({ title: q, catK: null, domain: "focus" }); save(); by = bentoByDomain(); commit({ title: q, catK: null, habitId: null, domain: "focus", color: DOM.focus.c }); };
      }
      si.oninput = function () { searchQ = si.value; drawResults(searchQ.trim()); };
      si.onkeydown = function (e) { if (e.key === "Enter") { var first = results.querySelector(".bchip:not(.addc)"); if (first && searchQ.trim()) first.click(); } };
      drawResults(searchQ.trim());
    }
    function renderExpanded(d) {
      var D = DOM[d];
      var strip = add(body, "div", "bento-strip");
      var back = add(strip, "span", "bento-back"); back.innerHTML = '<i class="ti ti-chevron-left"></i>'; back.onclick = function () { view.cat = null; render(); };
      DOM_ORDER.forEach(function (dd) { if (!by[dd] || !by[dd].length) return; var t = add(strip, "span", "bento-tab" + (dd === d ? " on" : ""), DOM[dd].l.toLowerCase()); t.style.color = DOM[dd].light; if (dd === d) { t.style.background = mixDark(DOM[dd].c); } t.onclick = function () { view.cat = dd; render(); }; });
      var pane = add(body, "div", "bento-pane"); pane.style.borderColor = D.c;
      var h = add(pane, "div", "bento-paneh"); h.style.color = D.light; h.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + D.l;
      var groups = {}, order = []; by[d].forEach(function (a) { var gn = a.group || "More"; if (!groups[gn]) { groups[gn] = []; order.push(gn); } groups[gn].push(a); });
      order.forEach(function (gn) { if (order.length > 1) { var sh = add(pane, "div", "bento-subh", gn); sh.style.color = D.light; } var g = add(pane, "div", "bento-tiles"); groups[gn].forEach(function (a) { actChip(a, g, true); }); });
      var ar = add(pane, "div", "bento-tiles"); var addt = add(ar, "span", "bchip big addt"); addt.innerHTML = '<i class="ti ti-plus"></i> add'; addt.onclick = addNew;
    }
    function addNew() {
      view.cat = null; body.innerHTML = ""; if (foot) { foot.remove(); foot = null; }
      add(body, "div", "bento-newh", "New activity");
      var inp = document.createElement("input"); inp.type = "text"; inp.className = "bento-input"; inp.placeholder = "name it once…"; body.appendChild(inp);
      add(body, "div", "bento-hint2", "type the name (once) → it becomes a bubble you tap forever");
      add(body, "div", "bento-lbl", "category");
      var crow = add(body, "div", "bento-cats"), chosen = { d: "focus" };
      DOM_ORDER.forEach(function (d) { var D = DOM[d], c = add(crow, "span", "bento-pick" + (d === chosen.d ? " on" : ""), D.l); c.style.background = D.c; c.style.color = D.ink; c.onclick = function () { chosen.d = d; Array.prototype.forEach.call(crow.children, function (n) { n.classList.remove("on"); }); c.classList.add("on"); }; });
      var go = add(body, "button", "bento-save"); go.innerHTML = 'add <i class="ti ti-check"></i>';
      go.onclick = function () { var nm = inp.value.trim(); if (!nm) { inp.focus(); return; } S.acts = S.acts || []; S.acts.push({ title: nm, catK: null, domain: chosen.d }); save(); by = bentoByDomain(); var a = { title: nm, catK: null, habitId: null, domain: chosen.d, color: DOM[chosen.d].c }; if (multi) { sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } };
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
    }
    function renderFoot() {
      if (!multi) return;
      if (!foot) foot = add(card, "div", "bento-foot");
      foot.innerHTML = "";
      var b = add(foot, "button", "bento-go"); b.innerHTML = '<i class="ti ti-player-play-filled"></i> Start ' + (sel.length ? sel.length : ""); b.disabled = !sel.length;
      b.onclick = function () { if (!sel.length) return; close(); if (opts.onPickMulti) opts.onPickMulti(sel.slice()); else sel.forEach(opts.onPick); };
    }
    function render() { body.innerHTML = ""; if (view.cat) renderExpanded(view.cat); else renderOverview(); }
    render(); renderFoot();
  }

  // ---- picker (shared) ---------------------------------------------------
  function pickerSheet(opts) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    var picked = {}, view = { cat: null, group: null }, CT = activeCats();
    function count() { return Object.keys(picked).length; }
    var titleEl = null, footEl = null;
    function syncFoot() { if (titleEl) titleEl.textContent = opts.title(count()); if (footEl) { footEl.innerHTML = ""; if (opts.foot) opts.foot(footEl, picked, count()); } }
    // tile click toggles selection IN PLACE for multi-select (no full re-render — kills the flicker/scroll-loss);
    // single-pick callers act + may redraw once.
    function mkTile(parent, meta) {
      var ky = meta.catK + "|" + meta.title;
      var x = taskTile(parent, meta, !!picked[ky], function () {
        if (opts.multi) {
          if (picked[ky]) delete picked[ky]; else picked[ky] = meta;
          var sel = !!picked[ky]; x.classList.toggle("on", sel); x.style.background = sel ? meta.color : "";
          if (opts.onTask) opts.onTask(meta, picked);
          syncFoot();
        } else if (opts.onTask) opts.onTask(meta, picked, draw);
      });
      return x;
    }
    function draw() {
      B.innerHTML = "";
      titleEl = add(B, "div", "sttl", opts.title(count())); if (opts.head) opts.head(B, draw);
      if (view.cat == null) {
        var ph2 = phase(), ctx = (CONTEXT[ph2] || []).map(function (t) { return TITLE2META[t.toLowerCase()]; }).filter(Boolean);
        if (ctx.length) { add(B, "div", "lbl", (ph2 === "morning" ? "🌅" : ph2 === "evening" ? "🌆" : ph2 === "night" ? "🌙" : "☀️") + " good right now"); var xg = add(B, "div", "tilegrid"); ctx.forEach(function (t) { mkTile(xg, t); }); }
        if (opts.frequent) { var fr = frequent(6); if (fr.length) { add(B, "div", "lbl", "⭐ frequent"); var fg = add(B, "div", "tilegrid"); fr.forEach(function (t) { mkTile(fg, t); }); } }
        add(B, "div", "lbl", "pick a category"); var cg = add(B, "div", "catgrid"); CT.forEach(function (c) { var card = bigCat(c); card.onclick = function () { view.cat = c; view.group = null; draw(); }; cg.appendChild(card); });
        if (opts.custom) { var cf = add(B, "div", "frm"); var ct = document.createElement("input"); ct.type = "text"; ct.placeholder = "…or type a task"; cf.appendChild(ct); var go = add(cf, "button", "go", "+"); go.onclick = function () { var v = ct.value.trim(); if (!v) return; var m = { title: v, catK: "work", emoji: "", color: "#8a5cf0", habitId: null }; if (opts.multi) { picked[m.catK + "|" + m.title] = m; ct.value = ""; syncFoot(); } else if (opts.onTask) opts.onTask(m, picked, draw); }; }
      } else if (view.group == null) {
        var bk = add(B, "button", "add", "← categories"); bk.style.marginBottom = "10px"; bk.onclick = function () { view.cat = null; draw(); }; add(B, "div", "lbl", view.cat.e + " " + view.cat.label); var sg = add(B, "div", "catgrid"); view.cat.groups.forEach(function (gr) { var card = subCard(view.cat, gr); card.onclick = function () { view.group = gr; draw(); }; sg.appendChild(card); });
      } else {
        var bk2 = add(B, "button", "add", "← " + view.cat.label); bk2.style.marginBottom = "10px"; bk2.onclick = function () { view.group = null; draw(); }; add(B, "div", "lbl", view.group.g); var tg = add(B, "div", "tilegrid"); view.group.tasks.forEach(function (t) { mkTile(tg, { title: t.l, catK: view.cat.k, emoji: t.e, color: view.cat.color, habitId: t.id || null }); });
      }
      footEl = add(B, "div", "pickfoot"); syncFoot();
    }
    draw();
  }
  function nowSheet() { pickerSheet({ title: function (n) { return n ? "Start " + n + (n === 1 ? " timer" : " timers") + " ⏱️" : "What are you doing? ⏱️"; }, frequent: true, custom: true, multi: true, foot: function (B, picked, n) { if (n) add(B, "button", "done2", "Start " + n + " ▶").onclick = function () { Object.keys(picked).forEach(function (k) { startTimer(picked[k]); }); closeSheet(); renderNow(); }; } }); }
  function suggestDay(k) {
    var T = [
      { h: "07:30", m: 15, t: "Make the bed", c: "#ff8a1e", p: 2 }, { h: "08:00", m: 30, t: "Breakfast", c: "#ff8a1e", p: 2 },
      { h: "09:00", m: 90, t: "Deep work", c: "#2a9fe0", p: 3 }, { h: "10:45", m: 45, t: "Move", c: "#ff8a1e", p: 3 },
      { h: "12:00", m: 45, t: "Lunch", c: "#ff8a1e", p: 2 }, { h: "13:00", m: 90, t: "Deep work", c: "#2a9fe0", p: 3 },
      { h: "15:00", m: 30, t: "Break", c: "#9a5cf0", p: 1 }, { h: "16:00", m: 60, t: "Deep work", c: "#2a9fe0", p: 3 },
      { h: "18:30", m: 45, t: "Dinner", c: "#ff8a1e", p: 2 }, { h: "20:00", m: 60, t: "Hobby", c: "#9a5cf0", p: 1 },
      { h: "22:00", m: 30, t: "Wind down", c: "#48d0e0", p: 2 }
    ];
    S.blocks[k] = T.map(function (x) { return { id: uid(), time: x.h, mins: x.m, title: x.t, prio: x.p, color: x.c, done: false }; }); save();
  }
  function blockPast(k, b) { return k < todayK() || (k === todayK() && hm(b.time) + (b.mins || 30) <= logicalNowMin()); } // a finished/past block: feels set-in-stone (longer hold to move) but still REORDERS on overlap (David 2026-06-25)
  function reflowLogs(k) { // REAL lane: editing a log so it overlaps the next one pushes the neighbours forward instead of stacking on top (David 2026-06-25)
    var L = logs(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }); var cur = -1, changed = false;
    L.forEach(function (e) { var dur = e.mins || 15, s = cur < 0 ? hm(e.time) : Math.max(hm(e.time), cur); s = Math.min(1410, s); var nt = pad(Math.floor(s / 60)) + ":" + pad(s % 60); if (nt !== e.time) { e.time = nt; changed = true; } cur = s + dur; });
    if (changed) save(); return changed;
  }
  function reflow(k) {
    var all = blocks(k).slice();
    var pins = all.filter(function (b) { return b.pin; }).map(function (b) { return { s: hm(b.time), e: hm(b.time) + (b.mins || 30) }; }).sort(function (a, b) { return a.s - b.s; });
    var flex = all.filter(function (b) { return !b.pin; }).sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var changed = false, cur = -1;
    flex.forEach(function (b) {
      var dur = b.mins || 30;
      if (k === todayK() && hm(b.time) <= logicalNowMin()) { cur = Math.max(cur, hm(b.time) + dur); return; } // already STARTED today → fixed in place; a future edit must never reshuffle the past (David 2026-06-25)
      var s = cur < 0 ? hm(b.time) : Math.max(hm(b.time), cur), moved = true, guard = 0;
      while (moved && guard++ < 60) { moved = false; for (var i = 0; i < pins.length; i++) { if (s < pins[i].e && s + dur > pins[i].s) { s = pins[i].e; moved = true; } } }
      s = Math.min(1410, s);
      var nt = pad(Math.floor(s / 60)) + ":" + pad(s % 60);
      if (nt !== b.time) { b.time = nt; changed = true; }
      cur = s + dur;
    });
    if (changed) save();
    return changed;
  }
  function nextFreeMin(k) {
    var base = (k === todayK()) ? Math.ceil(logicalNowMin() / 15) * 15 : 8 * 60, last = base;
    blocks(k).forEach(function (b) { var e = hm(b.time) + (b.mins || 30); if (e > last) last = e; });
    return Math.min(1410, Math.max(base, last));
  }
  function suggestNext(k) {
    var have = {}; blocks(k).forEach(function (b) { have[(b.title || "").toLowerCase()] = 1; });
    var dm = doneMap(todayK()), out = [], seen = {};
    function push(m) { if (!m) return; var t = (m.title || "").toLowerCase(); if (!t || seen[t] || have[t]) return; seen[t] = 1; out.push(m); }
    if (k === todayK()) S.habits.forEach(function (h) { if (!dm[h.id] && h.type !== "quit") push(TITLE2META[h.l.toLowerCase()] || { title: h.l, catK: HABIT2CAT[h.id] || "work", emoji: h.e, color: h.color, habitId: h.id }); });
    (CONTEXT[phase()] || []).forEach(function (t) { push(TITLE2META[t.toLowerCase()]); });
    var hr = new Date().getHours(); if (hr >= 9 && hr < 18) { var o = OCC_BY_K[(S.profile && S.profile.occ)], wg = (o && o.work) ? o.work : CATS[1].groups; if (wg[0]) wg[0].tasks.slice(0, 2).forEach(function (t) { push(TITLE2META[t.l.toLowerCase()] || { title: t.l, catK: "work", emoji: t.e, color: "#2a9fe0", habitId: null }); }); }
    frequent(6).forEach(push);
    return out.slice(0, 6);
  }
  function saveMasterpiece(k) { S.profile = S.profile || {}; S.profile.masterpiece = blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).map(function (b) { return { time: b.time, mins: b.mins, title: b.title, color: b.color, prio: b.prio }; }); save(); }
  function fillMasterpiece(k) { if (!(S.profile && S.profile.masterpiece)) return; S.blocks[k] = S.profile.masterpiece.map(function (x) { return { id: uid(), time: x.time, mins: x.mins, title: x.title, prio: x.prio || 2, color: x.color, done: false }; }); save(); }
  function suggestSheet(k) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "✨ What's next?");
    add(B, "div", "lbl", "best things to do from here — tap to drop one in");
    if (brainCfg().engine !== "off" && brainCfg().key) { var bb = add(B, "button", "done2", "🧠 ask my brain what's best"); bb.style.marginBottom = "10px"; var bo = add(B, "div", "lbl", ""); bo.style.fontSize = "13px"; bb.onclick = function () { bo.textContent = "thinking…"; askBrain(brainContext(), function (t, err) { bo.textContent = t || ("⚠️ " + (err || "failed")); }); }; }
    var list = add(B, "div");
    function draw() {
      list.innerHTML = ""; var sg = suggestNext(k), start = nextFreeMin(k);
      if (!sg.length) { add(list, "div", "empty", "You're set for now — add anything you like below."); }
      sg.forEach(function (m) {
        var d0 = m.habitId === "move" ? 45 : 30, r = add(list, "div", "sgrow"); add(r, "div", "sge", m.emoji || "•");
        var mid = add(r, "div"); mid.style.flex = "1"; add(mid, "div", "sgn", m.title); add(mid, "div", "sgt", fmt(start) + " · " + d0 + "m");
        r.onclick = function () { blocks(k).push({ id: uid(), time: pad(Math.floor(start / 60)) + ":" + pad(start % 60), mins: d0, title: m.title, prio: 2, color: m.color || "#8a5cf0", done: false }); save(); draw(); renderToday(); };
      });
    }
    draw();
    add(B, "div", "lbl", "or");
    var mp = !!(S.profile && S.profile.masterpiece && S.profile.masterpiece.length);
    add(B, "button", "done2", mp ? "🌟 Fill my masterpiece day" : "🌟 Suggest a full day").onclick = function () { if (mp) fillMasterpiece(k); else suggestDay(k); closeSheet(); renderToday(); };
    if (blocks(k).length) { var sv = add(B, "button", "add", "💾 Save this as my masterpiece day"); sv.style.cssText = "display:block;margin:10px auto 0;"; sv.onclick = function () { saveMasterpiece(k); sv.textContent = "✓ saved — your masterpiece"; }; }
  }
  function skeletonDay(k, oneThing) {
    var hasMp = S.profile && S.profile.masterpiece && S.profile.masterpiece.length;
    if (hasMp) { fillMasterpiece(k); }
    else { var T = [{ h: "08:00", m: 30, t: "Breakfast", c: "#ff8a1e", p: 2 }, { h: "09:00", m: 90, t: oneThing || "Deep work", c: "#2a9fe0", p: 3 }, { h: "11:00", m: 45, t: "Move", c: "#ff8a1e", p: 3 }, { h: "13:00", m: 45, t: "Lunch", c: "#ff8a1e", p: 2 }, { h: "18:30", m: 45, t: "Dinner", c: "#ff8a1e", p: 2 }, { h: "21:30", m: 30, t: "Wind down", c: "#48d0e0", p: 2 }]; S.blocks[k] = T.map(function (x) { return { id: uid(), time: x.h, mins: x.m, title: x.t, prio: x.p, color: x.c, done: false }; }); }
    if (oneThing) { var have = false; blocks(k).forEach(function (b) { if (b.title.toLowerCase() === oneThing.toLowerCase()) have = true; }); if (!have) blocks(k).push({ id: uid(), time: "09:00", mins: 90, title: oneThing, prio: 3, color: "#2a9fe0", done: false, star: true }); }
    reflow(k); save();
  }
  function gratefulFlow(onDone) {
    var grats = [];
    function gather() {
      var B = el("sheetBody"); B.innerHTML = ""; openSheet();
      add(B, "div", "sttl", "🙏 Grateful Flow");
      add(B, "div", "lbl", "Stutz & Michels' practice — name a few specific things. small is good.");
      var frm = add(B, "div", "frm"); var gi = document.createElement("input"); gi.type = "text"; gi.placeholder = "something you're grateful for…"; frm.appendChild(gi); var go = add(frm, "button", "go", "+");
      var ul = add(B, "div");
      function redraw() { ul.innerHTML = ""; grats.forEach(function (g, i) { var r = add(ul, "div", "subi"); add(r, "div", null, "🙏 " + g).style.flex = "1"; var x = add(r, "div", "del", "✕"); x.onclick = function () { grats.splice(i, 1); redraw(); }; }); }
      go.onclick = function () { var v = gi.value.trim(); if (v) { grats.push(v); gi.value = ""; redraw(); } };
      var saved = (S.profile && S.profile.gratList) || ["my health", "a warm bed", "someone who loves me"];
      add(B, "div", "lbl", "or tap a familiar one"); var pc = add(B, "div", "pchips"); saved.forEach(function (g) { var x = add(pc, "div", "pchip", g); x.onclick = function () { if (grats.indexOf(g) < 0) { grats.push(g); redraw(); } }; });
      add(B, "button", "done2", "Begin feeling →").onclick = function () { if (!grats.length) grats.push("this very moment"); S.profile = S.profile || {}; var l = S.profile.gratList || []; grats.forEach(function (g) { if (l.indexOf(g) < 0) l.unshift(g); }); S.profile.gratList = l.slice(0, 12); save(); feelCycle(0); };
    }
    function feelCycle(i) {
      var n = Math.min(grats.length, 5);
      if (i >= n) { source(); return; }
      var B = el("sheetBody"); B.innerHTML = "";
      add(B, "div", "sttl", "🙏 " + grats[i]);
      add(B, "div", "lbl", "close your eyes. don't just think it — feel it land in your body. (" + (i + 1) + " of " + n + ")");
      add(B, "div", "breathorb");
      add(B, "button", "done2", "I feel it ▶").onclick = function () { feelCycle(i + 1); };
    }
    function source() {
      var B = el("sheetBody"); B.innerHTML = "";
      add(B, "div", "sttl", "✨ Let it rise");
      add(B, "div", "lbl", "now stop naming reasons. just feel grateful — for nothing, for everything. sense it radiating from the center of your chest.");
      add(B, "div", "breathorb breathorb--slow");
      add(B, "button", "done2", "Done 🙏").onclick = function () { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Grateful Flow", mins: 5, catK: "love", color: "#ff4fa0" }); earn(12, { catK: "love" }); save(); if (onDone) onDone(); else { closeSheet(); renderAll(); } };
    }
    gather();
  }
  function recommitSheet() {
    var st = { step: 0, ident: {}, virt: [], hab: {} };
    S.habits.forEach(function (h) { if (h.per === 0 && h.type !== "quit") st.hab[h.id] = true; });
    function quickGrat(done) { var B = el("sheetBody"); B.innerHTML = ""; add(B, "div", "sttl", "🙏 One gratitude"); add(B, "div", "lbl", "name one thing — then take a slow breath and actually feel it."); var gi = document.createElement("input"); gi.type = "text"; gi.placeholder = "my health, this quiet morning…"; gi.style.cssText = "width:100%;"; B.appendChild(gi); add(B, "div", "breathorb"); add(B, "button", "done2", "Felt it ✓").onclick = function () { var v = gi.value.trim(), d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Gratitude" + (v ? " — " + v : ""), mins: 2, catK: "love", color: "#ff4fa0" }); earn(5, { catK: "love" }); save(); done(); }; }
    function finalize() {
      var k = todayK(), d = new Date(), any = false;
      if (S.profile) { S.profile.todayIdentity = Object.keys(st.ident); S.profile.todayVirtues = st.virt; }
      logs(k).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Morning recommit", mins: 3, catK: "love", color: "#ff4fa0" }); earn(8, { catK: "love" });
      Object.keys(st.hab).forEach(function (id) { if (st.hab[id]) { any = true; var h = null; S.habits.forEach(function (x) { if (x.id === id) h = x; }); if (h) { var t = nextFreeMin(k); blocks(k).push({ id: uid(), time: pad(Math.floor(t / 60)) + ":" + pad(t % 60), mins: 30, title: h.l, prio: 2, color: h.color, done: false }); reflow(k); } } });
      if (!any && !blocks(k).length) skeletonDay(k, "");
      save(); closeSheet(); viewK = todayK(); zoomMode = "day"; pendingScrollNow = true;
      document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.dataset.tab === "day"); });
      document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-day"); });
      renderAll();
    }
    function draw() {
      var B = el("sheetBody"); B.innerHTML = ""; openSheet();
      var bar = add(B, "div", "obarT"); add(bar, "i").style.width = Math.round(st.step / 3 * 100) + "%";
      if (st.step === 0) {
        add(B, "div", "sttl", "☀️ Who are you today?"); add(B, "div", "lbl", "the identity you're stepping into — tap a few.");
        var ic = add(B, "div", "pchips"); ["Focused", "Disciplined", "Calm", "Bold", "Loving", "Creative", "Grateful", "Unstoppable"].forEach(function (t) { var x = add(ic, "div", "pchip" + (st.ident[t] ? " on" : ""), t); x.onclick = function () { if (st.ident[t]) delete st.ident[t]; else st.ident[t] = 1; x.classList.toggle("on"); }; });
      } else if (st.step === 1) {
        add(B, "div", "sttl", "🌟 Which virtues?"); add(B, "div", "lbl", "the virtues you'll embody today.");
        var g = add(B, "div", "tilegrid"); VIRTUES.forEach(function (v) { var on = st.virt.indexOf(v.k) !== -1; var x = add(g, "div", "gtile" + (on ? " on" : "")); x.style.borderColor = v.c; if (on) x.style.background = v.c; add(x, "div", "ge", v.e); add(x, "div", "gl", v.l); x.onclick = function () { var i = st.virt.indexOf(v.k); if (i !== -1) st.virt.splice(i, 1); else st.virt.push(v.k); draw(); }; });
      } else if (st.step === 2) {
        add(B, "div", "sttl", "✅ Commit to today"); add(B, "div", "lbl", "which habits are you committing to? they'll land on your day.");
        S.habits.forEach(function (h) { var on = !!st.hab[h.id]; var r = add(B, "div", "subi"); var ck = add(r, "div", "ck" + (on ? " on" : ""), on ? "✓" : ""); ck.style.borderColor = h.color; add(r, "div", null, h.e + "  " + h.l).style.flex = "1"; r.onclick = function () { st.hab[h.id] = !st.hab[h.id]; draw(); }; });
      } else {
        add(B, "div", "sttl", "🙏 Close with gratitude"); add(B, "div", "lbl", "the Stutz & Michels way — or a quick one.");
        add(B, "button", "done2", "🙏 Grateful Flow (full)").onclick = function () { gratefulFlow(finalize); };
        var qb = add(B, "button", "add", "⚡ quick gratitude instead"); qb.style.cssText = "display:block;margin:12px auto 0;"; qb.onclick = function () { quickGrat(finalize); };
      }
      if (st.step < 3) {
        var nav = add(B, "div", "frm"); nav.style.marginTop = "14px";
        if (st.step > 0) add(nav, "button", "add", "← back").onclick = function () { st.step--; draw(); };
        var nx = add(nav, "button", "done2", "Next →"); nx.style.flex = "1"; nx.onclick = function () { st.step++; draw(); };
      }
    }
    draw();
  }
  function planSheet(k, label, atTime) {
    var cfg = { mins: 60, prio: 2 }; if (atTime) { cfg.time = atTime; } else { var d = new Date(); d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0); cfg.time = pad(d.getHours()) + ":" + pad(d.getMinutes()); }
    function advance() { var m = hm(cfg.time) + cfg.mins; if (m >= 1439) m = 1439; cfg.time = pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    pickerSheet({ title: function () { return "Plan " + label; }, frequent: true, custom: true,
      head: function (B, draw) {
        var sg = add(B, "button", "done2", "✨ What should I do next?"); sg.style.marginBottom = "10px"; sg.onclick = function () { closeSheet(); suggestSheet(k); };
        var frm = add(B, "div", "frm"); var time = document.createElement("input"); time.type = "time"; time.value = cfg.time; time.onchange = function () { cfg.time = time.value; }; frm.appendChild(time); var dl = document.createElement("span"); dl.style.cssText = "align-self:center;font-weight:800;font-family:var(--bub);"; dl.textContent = "• " + dur(cfg.mins); frm.appendChild(dl);
        add(B, "div", "lbl", "duration"); var c2 = add(B, "div", "pchips"); DURS.forEach(function (m) { var x = add(c2, "div", "pchip" + (m === cfg.mins ? " on" : ""), m < 60 ? m + "m" : (m / 60) + "h"); x.onclick = function () { cfg.mins = m; draw(); }; });
        add(B, "div", "lbl", "priority — lowest gets dropped if you run out of time"); var c3 = add(B, "div", "pchips"); PRIOS.forEach(function (p) { var x = add(c3, "div", "pchip" + (p.v === cfg.prio ? " on" : ""), p.l); x.onclick = function () { cfg.prio = p.v; draw(); }; });
        add(B, "div", "lbl", "tap to drop it at " + fmt(hm(cfg.time)) + " — they stack back-to-back");
      },
      onTask: function (t, picked, draw) { blocks(k).push({ id: uid(), time: cfg.time, mins: cfg.mins, title: t.title, prio: cfg.prio, color: t.color || prioC(cfg.prio), done: false }); advance(); reflow(k); save(); draw(); },
      foot: function (B) { var list = add(B, "div"); list.style.marginTop = "10px"; blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { var r = add(list, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + b.mins)); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio))); add(ti, "span", null, b.title); var del = add(r, "div", "del", "✕"); del.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); planSheet(k, label); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; } });
  }

  // ---- timers ------------------------------------------------------------
  function startTimer(p) { S.timers.push({ id: uid(), title: p.title, catK: p.catK, emoji: p.emoji || "", habitId: p.habitId || null, color: p.color || "#8a5cf0", start: Date.now(), dayK: todayK() }); save(); }
  function stopTimer(id) { var i = -1; S.timers.forEach(function (t, k) { if (t.id === id) i = k; }); if (i < 0) return; var t = S.timers[i]; if ((Date.now() - t.start) / 1000 < 15) { S.timers.splice(i, 1); save(); renderAll(); toast("⏱ too short — discarded"); return; } var dk = t.dayK || key(new Date(t.start)), mins = Math.max(1, Math.round((Date.now() - t.start) / 60000)), d = new Date(t.start); logs(dk).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: t.title, mins: mins, habitId: t.habitId, catK: t.catK, color: t.color }); if (t.habitId) doneMap(dk)[t.habitId] = true; if (isTidy(t)) S.lastTidy = dk; earn(mins, { catK: t.catK }); var opb = onPlanBlockFor(t, dk); if (opb) { /* do NOT mark opb.done — that forced the WHOLE block to read complete (gold full-width into the future). The pushed log already records the real span; matchedSpan/partial renders exactly what was covered, leaving the untracked remainder as ghost/future. Reward staying on-plan without predicting the future. (David 2026-06-27) */ var _obs = hm(opb.time), _obe = _obs + (opb.mins || 30), _covered = mins >= (_obe - _obs) - 5; var bonus = Math.max(12, Math.round(mins * 0.4)); earn(bonus, {}); if (_covered) { try { celebrate((DOM[domainOf(t)] || DOM.focus).c, bumpStreak()); } catch (e) {} } toast(_covered ? "✨ completed your plan · +" + bonus + " Spark" : "✓ on-plan stretch tracked · +" + bonus + " Spark"); } S.timers.splice(i, 1); save(); renderAll(); } // reward completing a PLANNED activity: light it gold + bonus Spark + a streak (David 2026-06-24 night)
  function elapsedStr(t) { var s = Math.floor((Date.now() - t.start) / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ":" + pad(m) : m) + ":" + pad(ss); }
  function renderNow() {
    var C = el("nowCard"); if (!C) return; C.innerHTML = ""; // legacy "Tracking now" card removed — the live timer lives in the timeline (David 2026-06-23)
    if (S.timers.length) { add(C, "div", "nl", "▶ Tracking now (" + S.timers.length + ")"); S.timers.forEach(function (t) { var r = add(C, "div", "blk"); r.style.marginBottom = "8px"; r.appendChild(dot(t.color)); add(r, "div", "ti", (t.emoji ? t.emoji + " " : "") + t.title); var rd = add(r, "div"); rd.id = "tr_" + t.id; rd.style.cssText = "font-family:var(--bub);font-weight:800;font-size:17px;color:#c47a00;margin-right:4px;"; rd.textContent = elapsedStr(t); var stp = add(r, "div", "del", "⏹"); stp.style.cssText = "font-size:20px;cursor:pointer;color:var(--ink);"; stp.onclick = function () { stopTimer(t.id); }; }); add(C, "button", null, "+ add activity").id = "nowBtn"; el("nowBtn").onclick = nowSheet; }
    else { add(C, "div", "nl", "⏱️ Right now"); add(C, "div", "ns", "tap to start a timer — stack several if you're multitasking."); var bb = add(C, "button", null, "What are you doing?"); bb.id = "nowBtn"; bb.onclick = nowSheet; }
  }

  // ---- character creation (multi-step) -----------------------------------
  function openSheet() { el("sheet").classList.add("on"); el("sheet").classList.remove("edsheet"); var _sx = el("sheetX"); if (_sx) _sx.style.display = ""; } // default: not the edit sheet (blockEdit/logEdit re-add edsheet); restore the ✕ that the editor hides — keeps the berry restyle scoped to the activity editor only (David 2026-06-25)
  function closeSheet() { el("sheet").classList.remove("on"); el("sheet").classList.remove("edsheet"); }
  function charSheet() {
    var B = el("sheetBody"); var step = 0, STEPS = 3, inputs = {};
    var prof = S.profile ? JSON.parse(JSON.stringify(S.profile)) : {}; prof.focus = prof.focus || []; prof.gender = prof.gender || "";
    openSheet();
    function numIn(ph, val) { var i = document.createElement("input"); i.type = "number"; i.placeholder = ph; if (val != null) i.value = val; i.style.cssText = "width:80px;"; return i; }
    function collect() { if (inputs.age) prof.age = inputs.age.value ? +inputs.age.value : null; if (inputs.g) prof.goals = inputs.g.value.trim() || null; }
    function draw() {
      collect(); inputs = {}; B.innerHTML = ""; var bar = add(B, "div", "obarT"); add(bar, "i").style.width = Math.round(step / (STEPS - 1) * 100) + "%";
      if (step === 0) {
        add(B, "div", "sttl", "✨ Begin your character"); add(B, "div", "lbl", "just the basics");
        var f1 = add(B, "div", "frm"); inputs.age = numIn("age", prof.age); f1.appendChild(inputs.age); var gw = add(f1, "div", "pchips"); gw.style.margin = "0"; [["m", "♂"], ["f", "♀"], ["o", "⚧"]].forEach(function (g) { var x = add(gw, "div", "pchip" + (prof.gender === g[0] ? " on" : ""), g[1]); x.onclick = function () { prof.gender = g[0]; draw(); }; });
        add(B, "div", "lbl", "🎯 what are you chasing? (optional)"); inputs.g = document.createElement("input"); inputs.g.type = "text"; inputs.g.placeholder = "get lean, ship the app, find peace…"; inputs.g.style.cssText = "width:100%;"; if (prof.goals) inputs.g.value = prof.goals; B.appendChild(inputs.g);
      } else if (step === 1) {
        add(B, "div", "sttl", "💼 What's your work?"); add(B, "div", "lbl", "so the app tailors your deep-work habits to you");
        var og = add(B, "div", "tilegrid"); OCCUPATIONS.forEach(function (o) { var on = prof.occ === o.k; var x = add(og, "div", "gtile" + (on ? " on" : "")); x.style.borderColor = "#2a9fe0"; if (on) x.style.background = "#2a9fe0"; add(x, "div", "ge", o.e); add(x, "div", "gl", o.l); x.onclick = function () { prof.occ = o.k; draw(); }; });
      } else {
        add(B, "div", "sttl", "🌟 Your path"); add(B, "div", "lbl", "which virtues call you most right now? pick up to 3 — you'll still grow them all");
        var grid = add(B, "div", "tilegrid"); VIRTUES.forEach(function (v) { var on = prof.focus.indexOf(v.k) !== -1; var x = add(grid, "div", "gtile" + (on ? " on" : "")); x.style.borderColor = v.c; if (on) x.style.background = v.c; add(x, "div", "ge", v.e); add(x, "div", "gl", v.l); x.onclick = function () { var idx = prof.focus.indexOf(v.k); if (idx !== -1) prof.focus.splice(idx, 1); else if (prof.focus.length < 3) prof.focus.push(v.k); draw(); }; });
      }
      var nav = add(B, "div", "frm"); nav.style.marginTop = "10px";
      if (step > 0) { add(nav, "button", "add", "← back").onclick = function () { step--; draw(); }; }
      var nx = add(nav, "button", "done2", step === STEPS - 1 ? "Awaken ✨" : "Next →"); nx.style.flex = "1";
      nx.onclick = function () { collect(); if (step < STEPS - 1) { step++; draw(); } else { prof.set = true; S.profile = prof; save(); closeSheet(); renderChar(); surveySheet(); } };
    }
    draw();
  }

  function brainCfg() { S.brain = S.brain || { engine: "off", key: "", model: "" }; if (S.brain.model == null) S.brain.model = ""; if (S.brain.model === "mistralai/mistral-7b-instruct:free") S.brain.model = ""; return S.brain; }
  function askBrain(prompt, cb) {
    var c = brainCfg();
    if (c.engine === "off" || !c.key) { cb(null, "no brain configured"); return; }
    if (c.engine === "gemini") {
      fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(c.key), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { var t = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text; if (t) cb(t.trim()); else cb(null, (j && j.error && j.error.message) || "no response"); })
        .catch(function (e) { cb(null, String(e)); });
    } else if (c.engine === "openrouter") {
      fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + c.key, "HTTP-Referer": "https://dmekibel.github.io/alter/", "X-Title": "ALTER" }, body: JSON.stringify({ model: c.model || "meta-llama/llama-3.2-3b-instruct:free", messages: [{ role: "user", content: prompt }] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (t) cb(t.trim()); else cb(null, (j && j.error && j.error.message) || "no response"); })
        .catch(function (e) { cb(null, String(e)); });
    } else {
      fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + c.key }, body: JSON.stringify({ model: c.model || "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (t) cb(t.trim()); else cb(null, (j && j.error && j.error.message) || "no response"); })
        .catch(function (e) { cb(null, String(e)); });
    }
  }
  function brainContext() {
    var k = todayK(), pl = blocks(k).map(function (b) { return b.time + " " + b.title + (b.done ? " ✓" : ""); }).join(", ") || "nothing planned", und = undone().map(function (h) { return h.l; }).join(", ") || "none";
    return "You are ALTER, a warm no-shame life coach. Time now: " + fmt(nowMin()) + ". My occupation: " + ((S.profile && S.profile.occ) || "unknown") + ". My goal: " + ((S.profile && S.profile.goals) || "—") + ". Today's plan: " + pl + ". Undone habits: " + und + ". In 2 short sentences, tell me the single best thing to do next right now, and why. Be specific, kind, no lists.";
  }
  function brainSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); var c = brainCfg();
    add(B, "div", "sttl", "🧠 Brain — free");
    add(B, "div", "lbl", "plug in an AI so ALTER can actually think. swap engines anytime; start free.");
    add(B, "div", "lbl", "engine");
    var er = add(B, "div", "pchips"); [["off", "Off"], ["openrouter", "OpenRouter · free"], ["groq", "Groq · free"], ["gemini", "Gemini"]].forEach(function (o) { var x = add(er, "div", "pchip" + (c.engine === o[0] ? " on" : ""), o[1]); x.onclick = function () { c.engine = o[0]; c.model = ""; save(); brainSheet(); }; });
    if (c.engine !== "off") {
      var site = c.engine === "gemini" ? "Google AI Studio" : c.engine === "groq" ? "Groq" : "OpenRouter";
      var keyurl = c.engine === "gemini" ? "aistudio.google.com/apikey" : c.engine === "groq" ? "console.groq.com/keys" : "openrouter.ai/keys";
      add(B, "div", "lbl", "paste your " + site + " key");
      var ki = document.createElement("input"); ki.type = "text"; ki.placeholder = "paste key…"; ki.value = c.key || ""; ki.style.cssText = "width:100%;"; ki.oninput = function () { c.key = ki.value.trim(); save(); }; B.appendChild(ki);
      var hint = add(B, "div", "lbl", "get one free: " + keyurl); hint.style.fontSize = "12px";
      if (c.engine === "openrouter" || c.engine === "groq") {
        if (c.engine === "openrouter") { var pn = add(B, "div", "lbl", "⚠️ free models error until you enable them — go to openrouter.ai/settings/privacy and turn ON the free-model / prompt-logging toggle, then Test."); pn.style.cssText = "font-size:12px;color:#ffc24a;line-height:1.4;"; }
        add(B, "div", "lbl", "model");
        var models = c.engine === "openrouter" ? ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.3-70b-instruct:free", "deepseek/deepseek-chat-v3-0324:free", "google/gemma-2-9b-it:free", "meta-llama/llama-3.2-3b-instruct:free", "openai/gpt-4o-mini", "openai/gpt-4o"] : ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "gemma2-9b-it"];
        var cur = c.model || models[0], sel = document.createElement("select"); sel.className = "msel";
        models.forEach(function (mn) { var o = document.createElement("option"); o.value = mn; o.textContent = mn; if (cur === mn) o.selected = true; sel.appendChild(o); });
        var oc = document.createElement("option"); oc.value = "__c"; oc.textContent = "custom…"; if (models.indexOf(cur) < 0) oc.selected = true; sel.appendChild(oc); B.appendChild(sel);
        var mi = document.createElement("input"); mi.type = "text"; mi.placeholder = "or paste a model id"; mi.value = models.indexOf(cur) < 0 ? cur : ""; mi.style.cssText = "width:100%;font-size:13px;margin-top:8px;";
        sel.onchange = function () { if (sel.value !== "__c") { c.model = sel.value; mi.value = ""; save(); } };
        mi.oninput = function () { c.model = mi.value.trim(); save(); }; B.appendChild(mi);
      }
      var test = add(B, "button", "done2", "🧪 Test the brain"); var out = add(B, "div", "lbl", ""); out.style.minHeight = "20px";
      test.onclick = function () { out.textContent = "thinking…"; askBrain("Reply with exactly: ALTER brain online.", function (t, err) { out.textContent = t ? ("✓ " + t) : ("✕ " + (err || "failed")); }); };
    }
    add(B, "div", "divlab").innerHTML = "<span>💾 Back up your life</span>";
    var bl = add(B, "div", "lbl", "your data lives only on this device — back it up so nothing can erase it."); bl.style.fontSize = "12px";
    var br = add(B, "div", "frm");
    add(br, "button", "add", "📋 Copy").onclick = function () { exportData("copy"); };
    add(br, "button", "add", "⬇ Download").onclick = function () { exportData("download"); };
    add(br, "button", "add", "♻ Restore").onclick = function () { restoreUI(B); };
  }
  var SURVEYQ = [
    { q: "How often do you work out?", v: "zest", p: "Athlete", e: "🏃" },
    { q: "How dialed-in are your sleep & food?", v: "zest", p: "Well-Fed", e: "🥗" },
    { q: "How strong is your deep-work focus?", v: "disc", p: "Deep Focus", e: "🧠" },
    { q: "How tidy do you keep your space?", v: "disc", p: "Clean Space", e: "🧹" },
    { q: "How connected are you with loved ones?", v: "love", p: "Connector", e: "💞" },
    { q: "How often do you make or create things?", v: "curiosity", p: "Creator", e: "🎨" },
    { q: "How much do you read & learn?", v: "wisdom", p: "Scholar", e: "📖" },
    { q: "How often do you ship / put work out there?", v: "courage", p: "Shipper", e: "✦" },
    { q: "How consistent are your mornings & planning?", v: "hope", p: "Architect", e: "🗒️" },
    { q: "How present & grateful do you feel?", v: "gratitude", p: "Grateful", e: "🙏" }
  ];
  var SCALE = ["Rarely", "Sometimes", "Often", "Always"];
  function applySurvey() { S.profile = S.profile || {}; var ans = S.profile.survey || {}, bv = {}, bp = {}; SURVEYQ.forEach(function (Q, qi) { var a = ans[qi]; if (a) { bv[Q.v] = (bv[Q.v] || 0) + a * 60; bp[Q.p] = (bp[Q.p] || 0) + a * 5; } }); S.profile.base = { virtue: bv, perk: bp }; S.profile.set = true; save(); }
  function surveySheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    S.profile = S.profile || {}; var ans = S.profile.survey = S.profile.survey || {}, answered = 0;
    SURVEYQ.forEach(function (_, qi) { if (ans[qi] != null) answered++; });
    add(B, "div", "sttl", "📊 Build your self-map");
    add(B, "div", "lbl", "just the fundamentals first — add more whenever you like. mapped " + answered + "/" + SURVEYQ.length + ".");
    var batch = [], qi, editing = false; for (qi = 0; qi < SURVEYQ.length && batch.length < 4; qi++) if (ans[qi] == null) batch.push(qi);
    if (!batch.length) { editing = true; for (qi = 0; qi < SURVEYQ.length && batch.length < 4; qi++) batch.push(qi); add(B, "div", "lbl", "✓ your whole map is built — tap to fine-tune."); }
    batch.forEach(function (qx) { var Q = SURVEYQ[qx]; add(B, "div", "qline", Q.e + "  " + Q.q); var row = add(B, "div", "facerow2"); SCALE.forEach(function (lbl, si) { var x = add(row, "div", "sv" + (ans[qx] === si ? " on" : ""), lbl); x.onclick = function () { ans[qx] = si; applySurvey(); Array.prototype.forEach.call(row.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); }; }); });
    if (!editing && answered + batch.length < SURVEYQ.length) { var mb = add(B, "button", "add", "➕ map a few more"); mb.style.cssText = "display:block;margin:4px auto 8px;"; mb.onclick = function () { applySurvey(); surveySheet(); }; }
    add(B, "button", "done2", "Done for now ✓").onclick = function () { applySurvey(); closeSheet(); renderChar(); renderGame(); };
  }
  function tidySheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Tidy up — one step at a time"); var picked = {}; TIDY_SUB.forEach(function (lbl, i) { var r = add(B, "div", "subi"); var ck = add(r, "div", "ck"); add(r, "div", null, lbl).style.flex = "1"; r.onclick = function () { if (picked[i]) return; picked[i] = true; ck.className = "ck on"; ck.textContent = "✓"; S.lastTidy = todayK(); doneMap(todayK()).tidy = true; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: lbl, mins: 10, habitId: "tidy", catK: "energy", color: "#ff8a1e" }); save(); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; }
  function ritualSheet(r) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", r.t); add(B, "div", "lbl", "tap each as you do it — small steps");
    var done = {};
    r.steps.forEach(function (s, i) {
      var row = add(B, "div", "subi"); var ck = add(row, "div", "ck"); add(row, "div", null, s.e + "  " + s.l).style.flex = "1";
      row.onclick = function () { if (done[i]) return; done[i] = true; ck.className = "ck on"; ck.textContent = "✓";
        if (s.log) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: s.log.title, mins: s.log.mins || 5, catK: s.log.catK, color: s.log.color, habitId: s.log.habitId }); if (s.log.habitId) doneMap(todayK())[s.log.habitId] = true; if (s.log.habitId === "tidy") S.lastTidy = todayK(); earn(s.log.mins || 5, { catK: s.log.catK }); save(); }
        if (s.action === "plan") { closeSheet(); planSheet(todayK(), "today"); }
        if (s.action === "planTom") { closeSheet(); planSheet(tomK(), "tomorrow"); }
      };
    });
    add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); };
  }
  function yesterdaySheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "📓 Yesterday");
    var yk = keyAdd(todayK(), -1), lg = logs(yk), dm = S.habitDone[yk] || {};
    var doneH = S.habits.filter(function (h) { return dm[h.id]; });
    if (!lg.length && !doneH.length) { add(B, "div", "empty", "Nothing logged yesterday — a fresh page today."); return; }
    if (doneH.length) { add(B, "div", "lbl", "✅ habits kept"); doneH.forEach(function (h) { var r = add(B, "div", "hab"); add(r, "div", "he", h.e || "⭐"); add(r, "div", "hn", h.l); }); }
    if (lg.length) { var tot = 0; add(B, "div", "lbl", "⏱️ what you did"); lg.forEach(function (e) { tot += e.mins || 0; var r = add(B, "div", "logi"); add(r, "div", "lt", e.time || ""); add(r, "div", "ln", e.title || ""); add(r, "div", "lm", dur(e.mins || 0)); }); add(B, "div", "lbl", "total tracked: " + dur(tot)); }
  }
  function habitSheet() {
    // No typing: pick habits straight from the activity library (category → group → emoji tiles),
    // multi-select, one frequency for the batch, build/quit inferred (vices → quit).
    var cfg = { per: 0 };
    pickerSheet({
      title: function (n) { return n ? "Add " + n + (n === 1 ? " habit" : " habits") + " ✨" : "Pick your habits ✨"; },
      frequent: true, custom: false, multi: true,
      head: function (B) {
        add(B, "div", "lbl", "how often");
        var c2 = add(B, "div", "pchips");
        [["Daily", 0], ["2× wk", 2], ["3× wk", 3], ["4× wk", 4], ["5× wk", 5], ["6× wk", 6]].forEach(function (t) {
          var x = add(c2, "div", "pchip" + (cfg.per === t[1] ? " on" : ""), t[0]);
          x.onclick = function () { cfg.per = t[1]; Array.prototype.forEach.call(c2.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); };
        });
      },
      foot: function (B, picked, n) {
        if (!n) return;
        add(B, "button", "done2", "Add " + n + (n === 1 ? " habit" : " habits") + " ✨").onclick = function () {
          Object.keys(picked).forEach(function (k) {
            var t = picked[k];
            if (S.habits.some(function (h) { return h.l === t.title; })) return;
            S.habits.push({ id: uid(), e: t.emoji || "⭐", l: t.title, cat: t.catK, type: (t.catK === "vice" ? "quit" : "build"), per: cfg.per, color: t.color || "#ff8a1e" });
          });
          save(); closeSheet(); renderHabits();
        };
      }
    });
  }

  function init() {
    load(); loadFairy(); loadWorld(); treeFit(); requestAnimationFrame(treeLoop); guardianFit(); setupJoy(); setupJoy2(); setupZoom(); requestAnimationFrame(drawGuardian);
    var tc = el("tree"); if (tc) tc.addEventListener("click", treeTap);
    window.addEventListener("resize", function () { treeFit(); guardianFit(); if (gameOn) worldFit(); });
    var _lastMin = nowMin();
    setInterval(function () {
      S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); });
      var ce = document.querySelectorAll(".live-elapsed[data-tid]"); for (var ci = 0; ci < ce.length; ci++) { var ct = (S.timers || []).filter(function (x) { return x.id === ce[ci].getAttribute("data-tid"); })[0]; if (ct) ce[ci].textContent = elapsedStr(ct); }
      if (TF_OPEN) { var _tc = el("tfClock"); if (_tc) _tc.textContent = fmt(nowMin()).toUpperCase(); } // keep the tracker's wall-clock live
      // per-second now-line creep REMOVED (David 2026-06-27): it moved the now-line by transform but NOT the static block-splits below it, so as the line crept past the ghost/future boundary the matte stripes peeked above it, and its leftover transform fed the fast-zoom jump. The planner updates the now-line per-minute (below); true seconds-precision printing belongs in Tracker Mode's dedicated per-second render, where every now-anchored element redraws together.
      var nm = nowMin(); if (nm !== _lastMin) { _lastMin = nm; if (!document.querySelector(".calblk.dragging") && !document.querySelector("#pullBody.zooming")) { var _pb = el("pullBody"), _sc = _pb ? _pb.scrollTop : 0; renderToday(); if (_pb) _pb.scrollTop = _sc; } } // burning timeline: each minute re-sweep — but never tear down the timeline mid-drag OR mid-zoom (David 2026-06-25)
    }, 1000);
    el("planToday").onclick = function () { var t = nextFreeMin(viewK), id = uid(); blocks(viewK).push({ id: id, time: pad(Math.floor(t / 60)) + ":" + pad(t % 60), mins: 60, title: "New", prio: 2, color: "#8a5cf0", done: false }); reflow(viewK); save(); renderToday(); var nb = blocks(viewK).filter(function (b) { return b.id === id; })[0]; bentoPicker({ title: "Plan what?", onPick: function (x) { assignBlock(nb, x, viewK); }, onCancel: function () { var a = blocks(viewK), bi = a.indexOf(nb); if (bi >= 0) { a.splice(bi, 1); reflow(viewK); save(); renderToday(); } } }); };
    var og = el("openGoals"); if (og) og.onclick = goalsSheet;
    var _gg = el("goGoals"); if (_gg) _gg.onclick = goalsSheet;                       // Goals tab → goals
    var _gp = el("goPresets"); if (_gp) _gp.onclick = function () { presetsSheet(todayK()); }; // Goals tab → masterpiece days / presets
    var _gh = el("goHabits"); if (_gh) _gh.onclick = habitsSheet;                     // Goals tab → habits manager
    var _gb2 = el("goBrain2"); if (_gb2) _gb2.onclick = brainSheet;                    // You tab → brain (free AI)
    var _gr2 = el("goRedo2"); if (_gr2) _gr2.onclick = onboard;                        // You tab → redo onboarding
    var _ah = el("addHabit"); if (_ah) _ah.onclick = habitSheet;
    var gr = el("gear"); if (gr) gr.onclick = brainSheet;
    var gb = el("gameBtn"); if (gb) gb.onclick = openGame;
    var ew = el("enterWorld"); if (ew) ew.onclick = openGame;
    var gx = el("gameExit"); if (gx) gx.onclick = closeGame;
    var fc = el("featClose"); if (fc) fc.onclick = closeFeature;
    var fb = el("featBackdrop"); if (fb) fb.onclick = closeFeature;
    var jb = el("jumpBtn"); if (jb) { jb.onclick = doJump; jb.addEventListener("touchstart", function (e) { e.preventDefault(); doJump(); }, { passive: false }); }
    var nbtn = el("notebookBtn"); if (nbtn) nbtn.onclick = notebookSheet; // the single menu door
    el("dnPrev").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, -1) : zoomMode === "week" ? keyAdd(viewK, -7) : keyAdd(viewK, -1); renderToday(); };
    el("dnNext").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, 1) : zoomMode === "week" ? keyAdd(viewK, 7) : keyAdd(viewK, 1); renderToday(); };
    document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.onclick = function () { zoomMode = z.dataset.z; if (zoomMode === "day") pendingScrollNow = true; renderToday(); }; });
    document.querySelectorAll("#growTabs .zt").forEach(function (z) { z.onclick = function () { var g = z.dataset.g; document.querySelectorAll("#growTabs .zt").forEach(function (x) { x.classList.toggle("on", x === z); }); el("habitsPane").style.display = g === "habits" ? "" : "none"; el("statsPane").style.display = g === "stats" ? "" : "none"; }; });
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); }; // tap above the card = exit
    var sx = el("sheetX"); if (sx) sx.onclick = closeSheet; var sh = document.querySelector(".shandle"); if (sh) sh.onclick = closeSheet;
    (function () { // swipe the card DOWN to dismiss — armed only when the card is scrolled to its top, so it never fights inner scrolling (David 2026-06-26)
      var scard = document.querySelector("#sheet .scard"); if (!scard) return; var sdOn = false, sdY = 0;
      scard.addEventListener("pointerdown", function (e) { sdOn = scard.scrollTop <= 1; sdY = e.clientY; if (sdOn) scard.style.transition = "none"; });
      scard.addEventListener("pointermove", function (e) { if (!sdOn) return; var dy = e.clientY - sdY; if (dy > 0 && scard.scrollTop <= 0) { scard.style.transform = "translateY(" + dy + "px)"; if (dy > 6) e.preventDefault(); } else if (dy < -2) { sdOn = false; scard.style.transition = ""; scard.style.transform = ""; } }, { passive: false });
      function sdEnd(e) { if (!sdOn) return; sdOn = false; var dy = (e.clientY || sdY) - sdY; scard.style.transition = ""; if (dy > 90) { closeSheet(); setTimeout(function () { scard.style.transform = ""; }, 260); } else scard.style.transform = ""; }
      scard.addEventListener("pointerup", sdEnd); scard.addEventListener("pointercancel", sdEnd);
    })();
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); }); document.addEventListener("dblclick", function (e) { e.preventDefault(); });
    document.querySelectorAll("#nav .nb").forEach(function (b) { if (!b.dataset.tab) return; b.onclick = function () { var t = b.dataset.tab; if (document.body.classList.contains("nav-collapsed")) { document.body.classList.remove("nav-collapsed"); _navLock = 1; setTimeout(function () { _navLock = 0; }, 650); if (t === "day") return; } document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === b); }); document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-" + t); }); document.body.classList.remove("tab-goals", "tab-day", "tab-self"); document.body.classList.add("tab-" + t); window.scrollTo(0, 0); if (t === "self") { treeFit(); guardianFit(); } if (t === "day") { pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; buildPull(); } }; }); // tapping the collapsed Today pill EXPANDS the nav (Goals/You slide back, tracker lifts above); body.tab-* drives which screen the always-open timeline shows on (David 2026-06-24/26)
    var ntk = el("navTrack"); if (ntk) ntk.onclick = nowSheet;
    document.body.classList.add("tab-day"); pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; // Today (the always-open rich timeline) is the home
    renderAll();
    // 3-tab shell (v438): the original pull-down timeline IS the Today tab, always open; the strip + pull-gesture live only in the garden now.
    if (!(S.profile && S.profile.set)) setTimeout(onboard, 350); // first-run onboarding (mockups 041/043)
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
