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
  var KEY = "alter_plan2", SCHEMA = 3, lastSaveErr = 0;
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
    drift:   { l: "Drift",   e: "🌫️", c: "#565b66", light: "#b8bcc6", dark: "#2a2d34", ring: "#7a808c", ink: "#cdd2db", ti: "ti-windmill" }   // neutral COOL-GRAY "void/wasted" — colorless vs the jewel domains, not muddy mauve (David 2026-06-27)
  };
  var CAT2DOM = { energy: "move", work: "focus", love: "connect", hobby: "play", vice: "drift" };
  // 5 SUPERCATEGORIES (David 2026-06-29): Energy · Work · Love · Hobbies · Other — the compact layer ABOVE the 8 domains. Tabler icons, never emojis. Drives the bento picker overview (+ onboarding + plan flow). Each domain belongs to exactly one supercat. (Hobbies split back OUT of Love — Love = people, Hobbies = creating/play.)
  var SUPERCAT = [
    { k: "energy",  l: "Energy",  ti: "ti-bolt",      c: "#ff8a3a", domains: ["move", "nourish", "restore"] },
    { k: "work",    l: "Work",    ti: "ti-briefcase", c: "#36b3f0", domains: ["focus"] },
    { k: "love",    l: "Love",    ti: "ti-heart",     c: "#ff5fa0", domains: ["connect"] },                  // people & relationships only
    { k: "hobbies", l: "Hobbies", ti: "ti-palette",   c: "#b07aff", domains: ["create", "play"] },           // creating + play — the things you love DOING
    { k: "other",   l: "Other",   ti: "ti-dots",      c: "#9a8cc4", domains: ["upkeep", "drift"] }            // chores/upkeep + habits-to-drop
  ];
  var DOM2SUPER = {}; SUPERCAT.forEach(function (sc) { sc.domains.forEach(function (d) { DOM2SUPER[d] = sc.k; }); });
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
  // ===== JOURNEY ENGINE (CKPT-4, David 2026-06-28): PURE functions that DECIDE (never render), READ by nothing yet (S.guide.mode defaults 'off' → inert until CKPT-7). Additive, no SCHEMA bump. =====
  function readiness() { // a pure 0..1 read of recent follow-through — cached per logical-day in S.guide.cache; never writes anything else
    var g = (S.guide || {}); if (g.cache && g.cache.computedK === todayK() && typeof g.cache.r === "number") return g.cache.r;
    var days = lastDays(14), planned = 0, kept = 0;
    days.forEach(function (dk) { (((S.blocks || {})[dk]) || []).forEach(function (b) { if (!b.title) return; planned++; if (blockStatus(dk, b) === "ok") kept++; }); });
    var follow = planned ? kept / planned : 0;
    var bkDays = 0; days.forEach(function (dk) { var e = (S.bk || {})[dk] || {}; if ((e.am && e.am.done) || (e.pm && e.pm.done)) bkDays++; });
    var bkRate = bkDays / 14, streakN = Math.min(1, curStreak() / 8);
    var r = Math.max(0, Math.min(1, follow * 0.55 + bkRate * 0.25 + streakN * 0.20));
    if (S.guide) { S.guide.cache = { computedK: todayK(), r: r }; } // cache only (no save() — pure read path; persisted lazily by the next save())
    return r;
  }
  // ===== WAVE 1 — the VECTOR read (David 2026-06-28): extends the scalar readiness() into a profile with ENERGY (the gate) + RECOVERY (the equanimity signal). Pure; reads only data already in S; surfaced ONLY as warm voice, never a number. The energy-first gate (Johnson Step 1 + david-framework "regulate first, then think" + Principle 7) is the law that makes ALTER a guardian, not a menu.
  function profile() {
    var energy = currentMood(); // 0..4, reuse the shipped mood read — no quiz (refine later: capture in the AM / infer from sleep)
    var lowEnergy = energy <= 1 || (S.profile && S.profile.lowStart && energy <= 2); // honor an "Overwhelmed/Stuck" onboarding answer at neutral mood too, until they log clearly higher energy (David 2026-06-29)
    var days = lastDays(14), chron = days.slice().reverse(); // oldest → newest
    function keptOn(dk) { return ((S.blocks || {})[dk] || []).some(function (b) { return b.title && blockStatus(dk, b) === "ok"; }); }
    function missOn(dk) { return ((S.blocks || {})[dk] || []).some(function (b) { return b.title && blockStatus(dk, b) === "miss"; }); }
    function activeOn(dk) { return (logs(dk) || []).length > 0 || keptOn(dk) || missOn(dk); }
    var missDays = 0, bounced = 0;
    for (var i = 0; i < chron.length - 1; i++) { if (missOn(chron[i])) { missDays++; for (var j = i + 1; j < chron.length; j++) { if (activeOn(chron[j])) { if (keptOn(chron[j])) bounced++; break; } } } }
    var recovery = missDays ? bounced / missDays : 0;
    var y = days[1], t = days[0];
    var roughY = missOn(y) || (!keptOn(y) && !(logs(y) || []).length);
    var goodT = keptOn(t) || (logs(t) || []).length > 0;
    return { r: readiness(), energy: energy, lowEnergy: lowEnergy, recovery: recovery, missDays: missDays, bouncedBack: roughY && goodT };
  }
  function journeyNode() { // monotonic sticky floor: max(first failing gate, max(S.guide.unlocked)) — never removes from unlocked = reward-never-shame as math
    var g = (S.guide || {}), r = readiness();
    var gate = r >= 0.75 ? 4 : r >= 0.55 ? 3 : r >= 0.35 ? 2 : r >= 0.15 ? 1 : 0; // first failing gate → the node readiness alone would suggest
    var floor = 0; (g.unlocked || []).forEach(function (n) { if (typeof n === "number" && n > floor) floor = n; });
    return Math.max(gate, floor);
  }
  // ===== JOURNEY CURRICULUM (JX-NODES, David 2026-06-28): the 6-node spine. Each node = one daily action + a reward-never-shame next-step card. `done(k)` is a PURE read of today's real signals → drives the one-obvious-next-step + landing. `act()` picks which stage the cockpit wears (or which sheet it opens). Voice: warm, never should/must/missed/behind. =====
  // ===== JOURNEY CURRICULUM (Phase 1 Drop 1, 2026-06-30): 8-node spine aligned 1:1 to the 8 LANDMARKS (O→VII course arc). done() = pure read of existing state; act() = opens existing surfaces. No new stages; no SCHEMA bump. =====
  var JOURNEY = [
    { id: 0, key: "why", title: "Why You're Here", line: "Name what you actually want. One sentence — your real reason.",
      cta: "Name your why", done: function (k) { return (logs(k) || []).length > 0 || (blocks(k) || []).some(function (b) { return b.done; }); }, act: function () { closeTrackerFull(); nowSheet(); } },
    { id: 1, key: "optimus", title: "Who You Are", line: "Meet your best self — the version who already has what you want.", timed: "morning",
      cta: "Open the morning", done: function (k) { var e = (S.bk || {})[k] || {}; return !!(e.am && e.am.done) || (blocks(k) || []).some(function (b) { return b.done; }); }, act: function () { enterStage("am", { byTap: true }); } },
    { id: 2, key: "obstacle", title: "The Obstacle OS", line: "What's in the way IS the way. Name the obstacle — it becomes fuel.",
      cta: "Start the morning", done: function (k) { var e = (S.bk || {})[k] || {}; return !!(e.am && e.am.done); }, act: function () { enterStage("am", { byTap: true }); } },
    { id: 3, key: "bigthree", title: "Your Big Three", line: "Energy, work, love — map today across all three.", timed: "morning",
      cta: "Open the morning", done: function (k) { var e = (S.bk || {})[k] || {}; return !!(e.am && e.am.done); }, act: function () { enterStage("am", { byTap: true }); } },
    { id: 4, key: "masterpiece", title: "Masterpiece Day", line: "Open the day on purpose. Close it with one honest line. Repeat.", timed: "morning",
      cta: "Start the morning", done: function (k) { var e = (S.bk || {})[k] || {}; return !!(e.am && e.am.done); }, act: function () { enterStage("am", { byTap: true }); } },
    { id: 5, key: "algorithms", title: "Your Algorithms", line: "Plan tomorrow's one thing tonight — make the good stuff automatic.",
      cta: "Name tomorrow's one thing", done: function (k) { return (blocks(tomK()) || []).some(function (b) { return b.title; }); }, act: function () { closeTrackerFull(); planSheet(tomK(), "tomorrow"); } },
    { id: 6, key: "fundamentals", title: "The Fundamentals", line: "Eat, move, sleep, breathe — the foundation everything else rests on.",
      cta: "Close the day", done: function (k) { var e = (S.bk || {})[k] || {}; return !!(e.pm && e.pm.done) || !!(e.pm && e.pm.reflect) || ((e.journal || []).length > 0); }, act: function () { enterStage("pm", { trackTitle: "Reflection", byTap: true }); } },
    { id: 7, key: "soulforce", title: "Soul Force", line: "You've walked the road. This is who you are now — carry it forward.",
      cta: "Carry on", done: function (k) { return true; }, act: function () { closeTrackerFull(); } }
  ];
  function journeyActionDoneToday() { var n = journeyNode(), node = JOURNEY[Math.max(0, Math.min(JOURNEY.length - 1, n))]; try { return !!node.done(todayK()); } catch (e) { return false; } }
  function journeyTick() { // once per logical day: persist the inferred node as a sticky floor in S.guide.unlocked so an existing user (David) is met at his true level + never demotes. PURE-driven by readiness(); writes only the floor.
    var g = S.guide; if (!g) return; var k = todayK(); if (g.tickK === k) return; g.tickK = k;
    var n = journeyNode(); g.unlocked = g.unlocked || []; if (g.unlocked.indexOf(n) < 0) { for (var i = 0; i <= n; i++) if (g.unlocked.indexOf(i) < 0) g.unlocked.push(i); } // append-only sticky floor up to the inferred node (cold-infers David straight to mastery on first guided open; never re-locks)
    /* Return-after-miss (SCHEMA 3, mirror-not-price): if yesterday earned 0 SF actions, quietly earn +1 on the NEXT open and show a forward-only guardian line — no "you missed" framing, no streak penalty. */
    var ydk = keyAdd(k, -1); var yesterdayActs = (S.sf && S.sf.actions && S.sf.actions[ydk]) || []; if (!yesterdayActs.length) { try { earn(1, { label: "return" }); toast("✦ Today's a fresh step."); } catch (e) {} }
    save();
  }
  // ===== JOURNEY PATH (Duolingo-style daily trail, David 2026-06-28): the VISIBLE daily journey. A full-screen winding node-trail of today's real sequence — Plan → fundamentals/undone habits → planned blocks (time order) → bookend. PURE-derives node states from today's real signals (block.done / habit done / matching log). Reward-never-shame: upcoming = calm-dim, never red/locked. Auto-scrolls the CURRENT node into view so the next thing is literally in front of you. =====
  var _jpDoneSet = {}; // #5: tracks which node keys were already done on last drawJourney — so we fire the burst exactly once per completion, not every redraw. keyed by "dayK:nodeKey".
  function jpNodeCompletionBurst(nodeEl, pts) { // #5: micro-celebration on the node element. Scale-pop (CSS class) + floating ✦+N spark. DEVICE-UNTESTED feel.
    if (!nodeEl) return;
    nodeEl.classList.add("jp-just-done"); setTimeout(function () { try { nodeEl.classList.remove("jp-just-done"); } catch (e) {} }, 600);
    try {
      var r = nodeEl.getBoundingClientRect();
      var fl = document.createElement("div"); fl.className = "jp-node-spark";
      fl.textContent = "✦ +" + pts; fl.style.left = (r.left + r.width / 2) + "px"; fl.style.top = (r.top + r.height * 0.3) + "px";
      document.body.appendChild(fl); setTimeout(function () { try { fl.remove(); } catch (e) {} }, 880);
    } catch (e) {}
  }
  function jpNodes() { // returns the ADAPTIVE ordered node list for today — shaped by your self-help stage (profile/journeyNode) AND your goals (today's AM virtue + one-thing). Each {key,emoji,title,line,color,done,act}.
    var k = todayK(), nodes = [], dm = doneMap(k), planned = (blocks(k) || []).filter(function (b) { return b.title; });
    var pf = profile(), jn = journeyNode(); // pf.lowEnergy = body-first gate · jn = curriculum stage (which guided nodes have unlocked)
    var am = ((S.bk || {})[k] || {}).am || {}, goalV = am.virtue || "", gv = goalV ? vlabel(goalV) : null, gvName = gv ? gv.l : ""; // today's GOAL signal
    var oneThing = (am.oneThing || "").trim();
    function matchesGoal(b) { return goalV && virtueOf(b) === goalV; } // does this block serve today's chosen virtue?
    function isOneThing(title) { var x = (title || "").toLowerCase().trim(), y = oneThing.toLowerCase(); return !!y && (x === y || (x.length > 3 && (x.indexOf(y) >= 0 || y.indexOf(x) >= 0))); }

    // AWAY / OFF-DAY MODE (David 2026-06-29 — his beach/Shabbat/travel rhythm): when you flag yourself away, the journey becomes ONE calm rest-stone — no task pressure, streaks held — so a trip never feels like falling behind.
    if (S.away) { nodes.push({ key: "away", emoji: "🌴", title: "You're away", line: "Resting / travelling — no pressure, nothing's slipping, your streaks are safe. Tap here when you're back.", color: DOM.restore.c, done: true, act: function () { S.away = false; S.awaySince = null; save(); drawJourney(true); toast("👋 welcome back — let's ease in"); } }); return nodes; }

    // #6 FIX: settle is NO LONGER the headline opener. It's a gentle secondary node inserted AFTER the first real forward step when energy is low.
    // Build a lazy settle-node reference; jpNodes() inserts it after the first real step below.
    var settleNode = null;
    if (pf.lowEnergy) {
      var settled = !!dm.breathe || (logs(k) || []).some(function (l) { return domainOf(l) === "restore"; });
      settleNode = { key: "settle", emoji: "🫧", title: "Settle", line: "Low fuel — a breath or two before you push. Optional, but kind.",
        color: DOM.restore.c, done: settled, act: function () { closeJourney(); try { partXTriage(); } catch (e) { try { breathwork(2); } catch (e2) {} } } };
    }

    // SELF-HELP ADAPT 2 — the MORNING ritual joins the trail once it's unlocked (journeyNode >= 2). A beginner never sees it; as you progress it appears as the day's opener.
    if (jn >= 2) { nodes.push({ key: "am", emoji: "🌅", title: "Open the morning", line: gvName ? "Who you're being today: " + gvName + ". Open the day on purpose." : "Who you're being, your one thing — open the day on purpose.",
      color: DOM.create.c, done: !!am.done, act: function () { closeJourney(); try { enterStage("am", { byTap: true }); } catch (e) {} } });
      if (settleNode) { nodes.push(settleNode); settleNode = null; } // settle slots in as 2nd node when am is 1st
    }

    // Plan your day — copy ADAPTS to the goal + to your recovery (reward-never-shame).
    nodes.push({ key: "plan", emoji: "🗺️", title: "Plan your day",
      line: planned.length ? (gvName ? "Mapped toward being " + gvName + " — tap to reshape it." : "Your day's mapped — tap to reshape it.")
        : (pf.bouncedBack ? "You came back yesterday — that bounce is the skill. Let's map today." : gvName ? "Map today around being " + gvName + " — pick a few things." : "Map out today — pick a few things and let them wait for you."),
      color: DOM.focus.c, done: planned.length > 0 && !(S.timers || []).some(function (t) { return t.dayK === todayK() && t.title === "Plan your day"; }), act: function () { closeJourney(); shapeFlow(k); } }); // stays the live cockpit while you're TRACKING the planning (David 2026-07-02)
    if (settleNode) { nodes.push(settleNode); settleNode = null; } // #6: settle falls in as 2nd node after Plan (when AM not unlocked); still available but not the headline

    // GOAL ADAPT — your ONE THING as its own keystone node (only if you named one in the morning AND it isn't already a planned block).
    if (oneThing && !planned.some(function (b) { return isOneThing(b.title); })) {
      nodes.push({ key: "onething", emoji: "⭐", title: oneThing, catK: null, line: "Your one thing today — the vote that matters most.",
        color: DOM.focus.c, done: (logs(k) || []).some(function (l) { return isOneThing(l.title); }), act: function () { startTimer({ title: oneThing, emoji: "⭐", color: DOM.focus.c }); closeJourney(); try { goTab("day"); } catch (e) {} renderAll(); toast("▶ started " + oneThing); } });
    }

    // GOAL ⇄ JOURNEY (David 2026-06-29 — the spine): each active goal projects its NEXT move onto the trail, so the journey advances your goals, not just today's blocks. A metric goal → "log your number"; a step goal → its smallest undone step. Skips moves already on today's plan (the block node covers those). Capped so the trail never floods.
    var gSeen = {};
    (staleGoals(3) || []).forEach(function (g) {
      var gc = (DOM[g.domain] || DOM.focus).c, gti = (DOM[g.domain] || DOM.focus).ti, m = g.metric;
      if (m && m.target != null && m.current != null) {
        var hit = m.dir === "down" ? m.current <= m.target : m.current >= m.target;
        if (hit) { // metric goal complete → a trophy node celebrates the win on the trail (still tappable to keep logging)
          nodes.push({ key: "goalhit:" + g.title, emoji: "🏆", icon: "ti-trophy", title: g.title, catK: null,
            line: "Target reached — " + fmtNum(m.target) + " " + (m.unit || "") + ". 🎉", color: gc, done: true,
            act: function () { try { logMetric(g, function () { drawJourney(); }); } catch (e) {} } });
          return;
        }
        var loggedToday = (m.hist || []).some(function (h) { return h.k === k; });
        nodes.push({ key: "goalm:" + g.title, emoji: "📈", icon: "ti-chart-line", title: g.title, catK: null,
          line: fmtNum(m.current) + " → " + fmtNum(m.target) + " " + (m.unit || "") + " · " + metricPct(m) + "% there — tap to log today.",
          color: gc, done: loggedToday, act: function () { try { logMetric(g, function () { drawJourney(); }); } catch (e) {} } });
        return; // one node per goal — the number IS the move today
      }
      var st = (g.subtasks || []).filter(function (s) { return !s.done; })[0];
      if (st && !gSeen[st.title.toLowerCase()] && !planned.some(function (b) { return (b.title || "").toLowerCase() === st.title.toLowerCase(); })) {
        gSeen[st.title.toLowerCase()] = 1;
        nodes.push({ key: "goalst:" + g.title, emoji: "🎯", icon: gti, title: st.title, catK: null,
          line: "Next on " + g.title + " — tap to start it now.",
          color: gc, done: (logs(k) || []).some(function (l) { return (l.title || "").toLowerCase() === st.title.toLowerCase(); }),
          act: function () { goalTouch(g); save(); startTimer({ title: st.title, color: gc }); closeJourney(); try { goTab("day"); } catch (e) {} renderAll(); toast("▶ " + st.title); } });
      }
    });

    // Fundamentals / habits — done stays visible with a check so the trail fills behind you. BODY-FIRST: when energy is low, body/restore habits sort to the front.
    var habs = (S.habits || []).filter(function (h) { return h.type !== "quit"; });
    if (pf.lowEnergy) { var BODY = /move|breath|walk|run|stretch|water|drink|sleep|rest|medit|sun|cold|shower|wash|tidy/i; habs = habs.slice().sort(function (a, b) { return (BODY.test(b.l) ? 1 : 0) - (BODY.test(a.l) ? 1 : 0); }); }
    var HAB_ICON = { move: "ti-run", deep: "ti-brain", tidy: "ti-sparkles", teeth: "ti-dental", read: "ti-book", breathe: "ti-wind" }; // explicit Tabler symbols for the default habits (title-only inference mislabels them)
    habs.forEach(function (h) {
      nodes.push({ key: "hab:" + h.id, emoji: h.e || "✨", icon: HAB_ICON[h.id] || tiClass({ title: h.l }), title: h.l, line: "A small basic — tap when it's done.",
        color: h.color || DOM.upkeep.c, done: !!dm[h.id], act: function () { var was = !!doneMap(k)[h.id]; toggleHabit(h.id); var c = h.color || DOM.upkeep.c; if (!was && doneMap(k)[h.id]) { try { celebrateGated(c, bumpStreak()); } catch (e) {} } drawJourney(); } });
    });

    // Planned blocks — GOAL ADAPT: blocks that serve today's chosen virtue sort to the front, then time order. (each = do it: start a timer; done when its block is done.)
    planned.slice().sort(function (a, b) { var ga = matchesGoal(a) ? 0 : 1, gb = matchesGoal(b) ? 0 : 1; return ga !== gb ? ga - gb : hm(a.time) - hm(b.time); }).forEach(function (b) {
      var dom = domainOf(b), st = blockStatus(k, b), isDone = st === "ok";
      nodes.push({ key: "blk:" + b.id, emoji: (DOM[dom] || DOM.focus).e, icon: tiClass(b), title: b.title, catK: b.catK, line: (matchesGoal(b) && gvName ? "Toward " + gvName + " · " : "") + b.time + " · tap to start it now.",
        color: b.color || (DOM[dom] || DOM.focus).c, done: isDone, act: function () {
          if (isDone) { closeJourney(); blockEdit(b, k); return; } // already done → open it to review/edit
          startTimer({ title: b.title, catK: b.catK, emoji: (DOM[dom] || DOM.focus).e, color: b.color || (DOM[dom] || DOM.focus).c });
          closeJourney(); try { goTab("day"); } catch (e) {} renderAll(); toast("▶ started " + b.title);
        } });
    });

    // SELF-HELP ADAPT 3 — the REFLECT node closes the trail once it's unlocked (journeyNode >= 3).
    if (jn >= 3) { var e = (S.bk || {})[k] || {}, pmDone = !!(e.pm && e.pm.done) || !!(e.pm && e.pm.reflect) || ((e.journal || []).length > 0);
      nodes.push({ key: "pm", emoji: "🌙", title: "Close the day", line: "One honest line. A line is enough.", color: DOM.restore.c, done: pmDone, act: function () { closeJourney(); try { enterStage("pm", { trackTitle: "Reflection", byTap: true }); } catch (e) {} } }); }

    return nodes;
  }
  function prefersReducedMotion() { return false; } // David wants animations to ALWAYS play — even with iOS "Reduce Motion" on (v659); that setting was making the app look static
  // PORTAL REVEAL (v648): punch a surface open through a circle growing from a focal point (e.g. the now-line). clip-path only → paint-time, never disturbs scroll/pinch. One-shot; clears itself on animationend.
  function playReveal(elm, focal) {
    if (!elm || prefersReducedMotion()) return;
    try {
      var r = elm.getBoundingClientRect(), x = 50, y = 42;
      var f = focal && focal.getBoundingClientRect ? focal.getBoundingClientRect() : null;
      if (f && f.width) { x = Math.max(0, Math.min(100, Math.round((f.left + f.width / 2 - r.left) / r.width * 100))); y = Math.max(0, Math.min(100, Math.round((f.top + f.height / 2 - r.top) / r.height * 100))); }
      elm.style.setProperty("--rx", x + "%"); elm.style.setProperty("--ry", y + "%");
      elm.classList.remove("sfc-reveal"); void elm.offsetWidth; elm.classList.add("sfc-reveal");
      var done = function () { elm.classList.remove("sfc-reveal"); elm.style.removeProperty("--rx"); elm.style.removeProperty("--ry"); elm.removeEventListener("animationend", h); }; // belt + suspenders: animationend OR a timeout, so the clip-path can never linger
      var h = function (e) { if (e.animationName === "sfcReveal") done(); };
      elm.addEventListener("animationend", h);
      setTimeout(done, 520);
    } catch (e) {}
  }
  // TIMELINE BLOCK CASCADE (v649): the visible "your day arrives" moment — the day's blocks pop in, staggered, radiating OUT from the now-line. Fires only on OPEN (called from revealTimeline), never on scroll/minute-rebuild. Animates only the blocks in view; cleans the classes after.
  function cascadeTimelineBlocks() {
    if (prefersReducedMotion()) return;
    try {
      var pb = el("pullBody"); var cur = pb && pb.querySelector(".day-card.cur .day-cardscroll"); if (!cur) return;
      var cr = cur.getBoundingClientRect();
      var blks = [].slice.call(cur.querySelectorAll(".calblk:not(.live)")).filter(function (b) { if (b.offsetParent === null) return false; var r = b.getBoundingClientRect(); return r.bottom > cr.top - 30 && r.top < cr.bottom + 30; });
      var nl = cur.querySelector(".nowline"); var nlr = nl ? nl.getBoundingClientRect() : null; var ny = nlr ? (nlr.top + nlr.height / 2) : (cr.top + cr.height * 0.42);
      blks.sort(function (a, b) { var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return Math.abs((ra.top + ra.height / 2) - ny) - Math.abs((rb.top + rb.height / 2) - ny); });
      blks.forEach(function (b, i) { b.classList.remove("casc-blk"); void b.offsetWidth; b.style.animationDelay = (i * 60) + "ms"; b.classList.add("casc-blk"); }); // bigger stagger → blocks land ONE BY ONE radiating from the now-line (v661)
      setTimeout(function () { blks.forEach(function (b) { b.classList.remove("casc-blk"); b.style.animationDelay = ""; }); }, blks.length * 60 + 700);
    } catch (e) {}
  }
  function revealTimeline() { try { setTimeout(function () { cascadeTimelineBlocks(); }, 40); } catch (e) {} } // the planner's blocks cascade in on open. (Dropped the clip-path "portal" — it read as a broken circular wipe on dark; the journey now crossfades out to reveal the planner instead. David 2026-07-02 v659)
  // STEPPING-STONES (David v659, Duolingo): when the journey opens (incl. app cold-open), its path nodes POP in one-by-one. We animate the inner .jp-bub (not the .jp-node, which carries the winding translateX) so the pop never fights the path positioning.
  function cascadeJourney() {
    if (prefersReducedMotion()) return;
    try {
      var trail = el("jpTrail"); if (!trail) return;
      var items = [].slice.call(trail.querySelectorAll(".jp-bub, .jp-unit, .jt-b"));
      if (!items.length) return;
      // Duolingo stepping-stones: pop in ONE BY ONE, rippling OUT from the node you're on (the current one lands first, then neighbours up & down).
      var cur = trail.querySelector(".jp-node.cur .jp-bub") || items[0];
      var cy = cur.getBoundingClientRect().top;
      items.sort(function (a, b) { return Math.abs(a.getBoundingClientRect().top - cy) - Math.abs(b.getBoundingClientRect().top - cy); });
      items.forEach(function (it, i) { it.classList.remove("jp-pop"); void it.offsetWidth; it.style.animationDelay = (i * 95) + "ms"; it.classList.add("jp-pop"); }); // 95ms gap → each stone clearly lands after the previous, not all at once
      setTimeout(function () { items.forEach(function (it) { it.classList.remove("jp-pop"); it.style.animationDelay = ""; }); }, items.length * 95 + 800);
    } catch (e) {}
  }
  // STAGGERED CASCADE (v648): make a set of just-rendered nodes arrive one-by-one with a spring.
  function cascadeIn(nodes) { if (prefersReducedMotion() || !nodes) return; for (var i = 0; i < nodes.length; i++) { var k = nodes[i]; if (!k || !k.style) continue; k.classList.add("casc-item"); k.style.animationDelay = (i * 38) + "ms"; } }
  // ===== START SCREEN (v652): the animated launch screen — gates entry every cold open with Continue (load save) / New game (fresh) + a language pick. The living guardian sprite + entrance animations live in CSS. =====
  var _ssShown = false;
  // ===== i18n (v656): DISPLAY-LAYER translator. Verified the app NEVER reads rendered text for logic (0 textContent reads) → swapping displayed text CAN'T break functionality; only UI length needs a visual check per surface. Unmatched strings fall back to English; the dictionary grows. =====
  var LANGS = [
    { code: "en", name: "English", flag: "🇬🇧" }, { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "es", name: "Español", flag: "🇪🇸" }, { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" }, { code: "it", name: "Italiano", flag: "🇮🇹" }, { code: "pt", name: "Português", flag: "🇵🇹" }
  ];
  // flat, designed flags (SVG) — not the glossy emoji (David v660)
  var SS_FLAGS = {
    en: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#012169"/><path d="M0 0L30 22M30 0L0 22" stroke="#fff" stroke-width="4.4"/><path d="M0 0L30 22M30 0L0 22" stroke="#C8102E" stroke-width="2"/><rect x="12.5" width="5" height="22" fill="#fff"/><rect y="8.5" width="30" height="5" fill="#fff"/><rect x="13.5" width="3" height="22" fill="#C8102E"/><rect y="9.5" width="30" height="3" fill="#C8102E"/></svg>',
    ru: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#fff"/><rect y="7.33" width="30" height="7.34" fill="#0039A6"/><rect y="14.67" width="30" height="7.33" fill="#D52B1E"/></svg>',
    es: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#AA151B"/><rect y="5.5" width="30" height="11" fill="#F1BF00"/></svg>',
    fr: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#fff"/><rect width="10" height="22" fill="#0055A4"/><rect x="20" width="10" height="22" fill="#EF4135"/></svg>',
    de: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#1a1a1a"/><rect y="7.33" width="30" height="7.34" fill="#DD0000"/><rect y="14.67" width="30" height="7.33" fill="#FFCE00"/></svg>',
    it: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#fff"/><rect width="10" height="22" fill="#009246"/><rect x="20" width="10" height="22" fill="#CE2B37"/></svg>',
    pt: '<svg viewBox="0 0 30 22" preserveAspectRatio="none"><rect width="30" height="22" fill="#DA291C"/><rect width="12" height="22" fill="#046A38"/><circle cx="12" cy="11" r="2.6" fill="#FFD100" stroke="#fff" stroke-width="0.6"/></svg>'
  };
  function flagSVG(code) { return SS_FLAGS[code] || SS_FLAGS.en; }
  var I18N = { ru: {
    "Continue": "Продолжить", "Load save": "Загрузить", "Start fresh": "Начать заново", "Load game": "Загрузить игру", "New game": "Новая игра", "Start": "Начать", "Begin": "Начать", "Erase & start over?": "Стереть и начать заново?",
    "your guardian-angel life sim": "твой ангел-хранитель — симулятор жизни",
    "Tap again to erase EVERYTHING": "Нажми ещё раз, чтобы стереть ВСЁ", "Erase save & start fresh?": "Стереть сохранение и начать заново?",
    "Planner": "Планер", "Journey": "Путь", "Game": "Игра", "Goals": "Цели", "Today": "Сегодня", "Now": "Сейчас", "You": "Ты", "Tomorrow": "Завтра", "Yesterday": "Вчера",
    "Energy": "Энергия", "Work": "Работа", "Love": "Любовь", "Other": "Другое",
    "Move": "Движение", "MOVE": "ДВИЖЕНИЕ", "Nourish": "Питание", "NOURISH": "ПИТАНИЕ", "Focus": "Фокус", "FOCUS": "ФОКУС", "Create": "Творчество", "CREATE": "ТВОРЧЕСТВО", "Connect": "Общение", "CONNECT": "ОБЩЕНИЕ", "Play": "Отдых", "PLAY": "ОТДЫХ", "Restore": "Восстановление", "RESTORE": "ВОССТАНОВЛЕНИЕ", "Upkeep": "Быт", "UPKEEP": "БЫТ", "Drift": "Дрейф", "DRIFT": "ДРЕЙФ",
    "What are you doing?": "Чем ты занят?", "Plan what?": "Что планируем?", "Switch to?": "Переключиться на?", "search activities…": "поиск занятий…", "add activity": "добавить занятие", "Recent": "Недавние", "★ Pinned": "★ Закреплённые", "Been meaning to": "Давно собирался",
    "Done": "Готово", "Save": "Сохранить", "Skip": "Пропустить", "skip": "пропустить", "Cancel": "Отмена", "Add": "Добавить", "Back": "Назад", "Plan": "План", "Track": "Трекинг", "Follow": "По плану", "Replan": "Перепланировать", "Stop": "Стоп",
    "Let's go": "Поехали", "Hi, I'm Sage.": "Привет, я Сэйдж.", "your guardian. I'll help you become who you want to be — one day at a time.": "твой хранитель. Помогу стать тем, кем ты хочешь быть — день за днём.",
    "PLAN": "ПЛАН", "REAL": "ФАКТ", "noon": "полдень", "Plan / shape today": "Спланировать день", "Clear day": "Очистить день", "Brain": "Мозг", "Start over": "Начать заново", "New activity": "Новое занятие", "category": "категория", "Goals & focus": "Цели и фокус"
  } };
  function curLang() { if (typeof S !== "undefined" && S) { if (S.langCode) return S.langCode; if (S.lang) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].name === S.lang) return LANGS[i].code; } } return "en"; }
  function langMeta(code) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i]; return LANGS[0]; }
  Object.assign(I18N.ru, {"(mood only)": "(только настроение)", "+ add activity": "+ добавить занятие", "+5 min": "+5 мин", "0 attention span? pick “often” — I’ll gently bring you back every few seconds, so you can’t fail.": "Не можешь сосредоточиться? Выбери «часто» — я мягко возвращаю тебя каждые пару секунд, ошибиться нельзя.", "10 min": "10 мин", "180 SPIN": "ВРАЩЕНИЕ 180", "2 min": "2 мин", "2-min breath": "2 мин дыхания", "360 SPIN": "ВРАЩЕНИЕ 360", "5 min": "5 мин", "60 seconds: who you're being, your one thing, gratitude — then I frame your day.": "60 секунд: кто ты, главное дело, благодарность — и я задам день.", "9-to-5 job": "Офис 9–17", "A Black Sun rises": "Восходит Чёрное солнце", "A STRENGTH TO LEAN ON": "СИЛА, НА КОТОРУЮ ОПЕРЕТЬСЯ", "A couple of plans drifted past — what does that tell you about today, gently?": "Пара планов уплыла — что это мягко говорит о дне?", "A line about today is enough. What stood out?": "Хватит одной строки о дне. Что запомнилось?", "A little about you": "Немного о тебе", "A plan or two slid by today — anything worth noticing about why?": "Пара планов сегодня уплыла — стоит ли заметить, почему?", "A quiet beach": "Тихий берег", "A quiet day. What's one thing you'd like tomorrow to hold?": "Тихий день. Что хочешь увидеть в завтра?", "A soft day — and rest is part of the work. What would you like tomorrow to hold?": "Мягкий день — отдых тоже работа. Что хочешь в завтра?", "A virtue": "Добродетель", "AGE": "ВОЗРАСТ", "AI art": "ИИ-арт", "Active Love": "Активная любовь", "Active — pulls into your days": "Активна — входит в твои дни", "Add a daily fundamental": "Добавить основу дня", "Add a step to": "Добавить шаг к", "Adjust": "Изменить", "Admin": "Дела", "Admin / shallow": "Дела / рутина", "Affirmations": "Аффирмации", "Alcohol": "Алкоголь", "Always": "Всегда", "Analysis": "Анализ", "And it stays with you, long after you open your eyes.": "И это остаётся с тобой, когда ты откроешь глаза.", "Anything left undone to carry into tomorrow? (Set it down here so you can rest.)": "Что-то осталось на завтра? (Запиши и отдыхай.)", "Apply": "Заявка", "Architect": "Архитектор", "Arrange them": "Расставить", "Arrange your day": "Расставь свой день", "Art": "Искусство", "Artist / Creative": "Художник / Креатив", "Assignment": "Задание", "Athlete": "Атлет", "Avoiding it? → reverse the desire": "Избегаешь? → разверни желание", "Avoiding something": "Избегаю чего-то", "Awaken ✨": "Пробудиться ✨", "Awakening": "Пробуждение", "BAIL!": "СРЫВ!", "Back to it": "Вернуться", "Balanced Day": "Сбалансированный день", "Bathroom": "Ванная", "Become who you are": "Стань собой", "Become who you're being": "Стань тем, кто ты есть", "Begin": "Начать", "Begin feeling →": "Начать чувствовать →", "Begin ▶": "Начать ▶", "Black Sun": "Чёрное солнце", "Board games": "Настолки", "Body": "Тело", "Bold": "Смел", "Brain": "Мозг", "Break": "Перерыв", "Break down:": "Разбить:", "Break it down for me": "Разбей за меня", "Break's up": "Пауза кончилась", "Breakfast": "Завтрак", "Breathe": "Дыхание", "Breathe in": "Вдох", "Breathe out": "Выдох", "Breathe with me": "Подыши со мной", "Breathe with me ▶": "Дыши со мной ▶", "Brush teeth": "Почистить зубы", "Budget": "Бюджет", "Build": "Создавать", "Cafe": "Кафе", "Caffeine": "Кофеин", "Call": "Звонок", "Calls": "Звонки", "Calm": "Спокоен", "Capture": "Захват", "Capture it 💡": "Записать 💡", "Caregiver": "Опекун", "Carried to tomorrow — it'll be waiting.": "Перенёс на завтра — будет ждать.", "Carry it into the next thing": "Неси это дальше", "Carry to tomorrow": "На завтра", "Chess": "Шахматы", "Cigarettes": "Сигареты", "Claim it": "Засчитать", "Clean Space": "Порядок", "Clean room": "Убрать комнату", "Clear": "Ясно", "Clear day": "Очистить день", "Clear the mind": "Очисти ум", "Close": "Закрыть", "Close deal": "Закрыть сделку", "Close the day 🌙": "Закрыть день 🌙", "Coasting": "По течению", "Code": "Код", "Coffee": "Кофе", "Cold Iron": "Холодное железо", "Cold shower": "Холодный душ", "Coming back up… 1": "Поднимаешься… 1", "Coming soon.": "Скоро.", "Commit": "Подтвердить", "Compliment": "Комплимент", "Concentration": "Концентрация", "Connector": "Связной", "Content": "Контент", "Continue": "Дальше", "Cook": "Готовка", "Coordinate": "Координация", "Couldn't save — storage may be full. Back up your data via 🧠.": "Не удалось сохранить — память переполнена. Сделай бэкап через 🧠.", "Courage": "Смелость", "Craft": "Рукоделие", "Create": "Творчество", "Create plan": "Создать план", "Creative": "Творческий", "Creator": "Творец", "Curiosity": "Любопытство", "Cycle": "Велосипед", "DRIFT": "ДРЕЙФ", "Daily fundamentals": "Основа дня", "Date": "Свидание", "Day": "День", "Debug": "Отладка", "Decide it now, while you're calm — so tomorrow-you wakes to it already chosen.": "Реши сейчас, пока спокоен — завтрашний ты проснётся с готовым выбором.", "Deep Focus": "Глубокий фокус", "Deep Work Day": "День фокуса", "Deep work": "Глубокая работа", "Deliver": "Сдавать", "Demo / sell": "Демо / продажа", "Deploy": "Деплой", "Design": "Дизайн", "Design / plan": "Дизайн / план", "Developer": "Разработчик", "Developer / Builder": "Разработчик", "Digital": "Гаджеты", "Dim the lights": "Приглуши свет", "Dinner": "Ужин", "Discipline": "Дисциплина", "Disciplined": "Дисциплинирован", "Dishes": "Посуда", "Do it now ▶": "Сделать сейчас ▶", "Done": "Готово", "Done for now ✓": "Пока готово ✓", "Done ✓": "Готово ✓", "Done 🙏": "Готово 🙏", "Doomscroll": "Думскроллинг", "Down the steps… 10": "Вниз по ступеням… 10", "Drag ⠿ to reorder · tap a length · set what matters most. They land back-to-back from your next free slot — fine-tune times on the timeline.": "Тяни ⠿ для порядка · выбери длину · отметь важное. Встанут подряд от ближайшего свободного слота — время поправишь на ленте.", "Draining my drive": "Гасит мой запал", "Draw": "Рисовать", "Drift": "Дрейф", "Drink water": "Выпить воды", "Drop your shoulders": "Опусти плечи", "EFT — tap the points, let it move through you": "EFT — постукивай по точкам, пропусти через себя", "EVERYTHING ELSE": "ВСЁ ОСТАЛЬНОЕ", "Eat healthier": "Питаться лучше", "Eat healthy": "Здоровая еда", "Edit": "Правки", "Edit / refine": "Правки", "Email": "Почта", "End": "Стоп", "End break": "Закончить", "Energy": "Энергия", "Energy · Family · Service — who you're BEING, why, what you'll do.": "Энергия · Семья · Служение — кто ты, зачем, что сделаешь.", "Engage / reply": "Отвечать", "Enhance plan": "Улучшить план", "Erase save & start fresh?": "Стереть и начать заново?", "Errands": "Поручения", "Evening Reflection": "Вечерняя рефлексия", "Evening reflection": "Вечерняя рефлексия", "Evening — close the day well.": "Вечер — заверши день хорошо.", "Everything here works by committing a little time to it — that's how it tracks you. Let's start small: tap 5 minutes to plan your day.": "Здесь всё работает так: выделяешь немного времени — и это отслеживается. Начнём с малого: нажми 5 минут, чтобы спланировать день.", "Everything here works by committing a little time — that's how it tracks you. Tap 5 minutes to begin.": "Здесь всё работает на выделении времени — так это и отслеживается. Нажми 5 минут, чтобы начать.", "Everything open, no nudges. This is yours.": "Всё открыто, без подсказок. Это твоё.", "Exit world": "Выйти из мира", "Experiment": "Эксперимент", "Explore": "Исследовать", "Explorer": "Исследователь", "Eyes open, soft gaze": "Глаза открыты, мягкий взгляд", "Family": "Семья", "Feel calmer": "Стать спокойнее", "Feel him scream at you": "Услышь его крик", "Feel it through": "Прочувствуй до конца", "Feel the bond": "Почувствуй связь", "Feel the forward motion": "Почувствуй движение вперёд", "Feel the void underneath": "Почувствуй пустоту внутри", "Felt it ✓": "Почувствовал ✓", "Figuring it out": "В поиске себя", "Film / record": "Съёмка / запись", "Find love": "Найти любовь", "Finding my rhythm": "Ищу свой ритм", "Finish ✓": "Завершить ✓", "First — commit a time": "Сначала — выдели время", "First — let's get the body back online": "Сначала вернём тело в строй", "First — one thing you're grateful for, right now.": "Сначала — за что ты благодарен прямо сейчас.", "First, clear what's live": "Сначала разряди живое", "Fitness": "Фитнес", "Five specific things — one at a time, felt, not a dry list.": "Пять конкретных вещей — по одной, прочувствованно.", "Five specific things — one at a time. Don't list; FEEL each one for a breath before the next.": "Пять конкретных вещей — по одной. Не перечисляй, ПРОЧУВСТВУЙ каждую.", "Five-Minute Foundation": "Пятиминутка-основа", "Floors — vacuum / sweep": "Полы — пылесос / веник", "Focus": "Фокус", "Focused": "Сосредоточен", "Foggy": "Туман", "Follow": "По плану", "Food": "Еда", "Founder": "Основатель", "Founder / Hustler": "Фаундер", "Frame the day": "Задай день", "Free / Adaptive": "Свободно / Адаптивно", "Freelancer": "Фрилансер", "Friends": "Друзья", "Full Day": "Полный день", "Fun-Do List": "Список радостей", "Fundraise": "Привлечь деньги", "Gambling": "Азарт", "Game": "Игра", "Games": "Игры", "Garden": "Сад", "Get an idea out of your head and onto the page.": "Вынеси идею из головы на страницу.", "Get coffee": "Кофе", "Get comfy…": "Устройся удобно…", "Get fit": "В форму", "Get it out of your head and onto the page. Capture the idea — clear the RAM.": "Выгрузи мысль на бумагу — освободи голову.", "Give": "Дарить", "Give that energy outward": "Отдай энергию наружу", "Go outside": "На улицу", "Goals": "Цели", "Good evening": "Добрый вечер", "Good morning": "Доброе утро", "Good morning — let's recommit.": "Доброе утро — настройся заново.", "Good morning.": "Доброе утро.", "Grace": "Лёгкость", "Grateful": "Благодарен", "Grateful Flow": "Поток благодарности", "Gratitude": "Благодарность", "Groceries": "Продукты", "Groq · free": "Groq · бесплатно", "Group work": "Групповая работа", "Grow": "Рост", "Grow my audience": "Растить аудиторию", "Grow my business": "Развить бизнес", "Guidance": "Ведение", "Guided": "С ведением", "Guitar": "Гитара", "Gym": "Зал", "Habit": "Привычка", "Habit stacks": "Стопки привычек", "Habits": "Привычки", "Hang out": "Тусовка", "Head toward bed": "Иди в кровать", "Healthcare": "Медицина", "Heavy": "Тяжело", "Help": "Помощь", "Here's your next step": "Вот твой следующий шаг", "Hi, I'm Sage.": "Привет, я Сейдж.", "Hike": "Поход", "Hobbies": "Хобби", "Hobby": "Хобби", "Hold": "Задержка", "Homemaker": "Домохозяин", "Hope": "Надежда", "How connected are you with loved ones?": "Насколько ты близок с родными?", "How consistent are your mornings & planning?": "Насколько стабильны утра и планирование?", "How dialed-in are your sleep & food?": "Насколько в порядке сон и питание?", "How do you want to journal?": "Как поведём дневник?", "How long?": "Сколько?", "How much do you read & learn?": "Сколько ты читаешь и учишься?", "How much should I lead? Change it anytime — choosing less is itself leveling up.": "Насколько вести тебя? Меняй когда угодно — выбрать меньше тоже рост.", "How often do you make or create things?": "Как часто ты творишь?", "How often do you ship / put work out there?": "Как часто ты выпускаешь работу в мир?", "How often do you work out?": "Как часто ты тренируешься?", "How present & grateful do you feel?": "Насколько ты в моменте и благодарен?", "How strong is your deep-work focus?": "Насколько крепка твоя глубокая концентрация?", "How tidy do you keep your space?": "Насколько чисто у тебя в пространстве?", "How's life feeling?": "Как тебе жизнь?", "Hug": "Объятие", "Hydrate": "Вода", "I USUALLY SLEEP": "ОБЫЧНО ЛОЖУСЬ", "I USUALLY WAKE": "ОБЫЧНО ВСТАЮ", "I am joyful, connected, and encouraging.": "Я радостен, связан с людьми и вдохновляю.", "I am willing to act in the presence of fear.": "Я готов действовать даже в страхе.", "I appreciate all the blessings and gifts in my life.": "Я ценю все дары и блага своей жизни.", "I come alive when…": "я оживаю, когда…", "I dominate my fundamentals so I have Heroic energy.": "Я владею основами и полон героической энергии.", "I feel it ▶": "Я чувствую ▶", "I forge antifragile confidence with every action I take.": "Каждым действием я кую неуязвимую уверенность.", "I greet you with one next step each day.": "Каждый день один следующий шаг.", "I have inspiring goals, agency, and pathways.": "У меня есть вдохновляющие цели, воля и пути.", "I keep some days, drop others": "Где-то держусь, где-то нет", "I know the ultimate game and how to play it well.": "Я знаю главную игру и как играть в неё хорошо.", "I mostly follow through": "В основном довожу до конца", "I pay attention to what's working and what needs work.": "Я замечаю, что работает, а что нуждается в работе.", "I want to build the basics": "Хочу освоить основы", "I'll place these on your timeline and carry your intention through the day.": "Размещу это на ленте и пронесу твоё намерение через день.", "I'm already calm — skip to labeling": "Я спокоен — сразу к названию", "I'm grateful for…": "Я благодарен за…", "If-then plans are how intentions become action.": "Планы «если-то» превращают намерения в действие.", "In 3 days": "Через 3 дня", "Inner Authority": "Внутренняя сила", "Invoice": "Счёт", "It fills you from inside": "Оно наполняет тебя изнутри", "It varies": "По-разному", "It's late — let's wind down.": "Поздно — пора расслабиться.", "Jeopardy": "Угроза", "Job-seeking": "В поиске работы", "Journal": "Дневник", "Journal a few lines": "Запиши пару строк", "Journey": "Путь", "Junk food": "Фастфуд", "Just starting": "Только начинаю", "Just track": "Просто трекать", "Just track instead": "Лучше трекать", "Keystone Habits": "Ключевые привычки", "Language": "Язык", "Laundry": "Стирка", "Learn": "Учёба", "Learn a skill": "Освоить навык", "Lectures": "Лекции", "Let go": "Отпустить", "Let go — no trace, no weight.": "Отпущено — без следа и груза.", "Let your arms go heavy": "Пусть руки станут тяжёлыми", "Let your body settle": "Дай телу осесть", "Let's close the day.": "Закроем день.", "Let's go ▸": "Поехали ▸", "Let's set who you wake as.": "Решим, кем ты проснёшься.", "Lift the lens": "Смени взгляд", "Light": "Лёгкое", "LinkedIn post": "Пост в LinkedIn", "List work": "Выставить работы", "Listen": "Слушать", "Lock it": "Зафиксировать", "Lock my keystones 🗝️": "Зафиксировать опоры 🗝️", "Love": "Любовь", "Love × great-at × world-needs → your one thing.": "Любовь × талант × нужда мира → твоё дело.", "Loving": "Любящий", "Lunch": "Обед", "Make": "Создавать", "Make art": "Творить", "Make bed": "Заправить кровать", "Make music": "Музыка", "Make the bed": "Заправить постель", "Make your bed": "Заправь кровать", "Make your best your new baseline — these are the three to protect.": "Сделай лучшее нормой — вот три, что стоит беречь.", "Manager": "Менеджер", "Mantra": "Мантра", "Mark done": "Отметить", "Master Artist": "Мастер-художник", "Master Builder": "Мастер-строитель", "Mastered ✓ · Rank": "Освоено ✓ · Ранг", "Mastery": "Мастерство", "Meal prep": "Заготовки", "Meditate": "Медитация", "Meditation ·": "Медитация ·", "Meetings": "Встречи", "Message buyers": "Написать покупателям", "Micro-wins to do today — not a to-do list. Cross them off.": "Микро-победы на сегодня — не дела, а радости. Вычёркивай.", "Mind": "Ум", "Mindful moment": "Момент осознанности", "Mindfulness check": "Проверка осознанности", "Monetize": "Монетизация", "Money": "Деньги", "Month": "Месяц", "Months": "Месяцы", "Morning": "Утро", "Morning bookend 🌅": "Утренний ритуал 🌅", "Morning recommit": "Утреннее намерение", "Morning recommit ☀️": "Утренний настрой ☀️", "Morning rituals": "Утренние ритуалы", "Morning routine": "Утренний ритуал", "Move": "Движение", "Movie": "Кино", "Music": "Музыка", "Music prod": "Музыка", "Musician": "Музыкант", "Must": "Надо", "My stack": "Мой набор", "My toolbox": "Мои инструменты", "NOW": "СЕЙЧАС", "Name it — that's the skill": "Назови это — в этом навык", "Name today's ONE thing": "Назови ГЛАВНОЕ на сегодня", "Name tomorrow's one thing.": "Назови главное на завтра.", "Nap": "Дрёма", "Nature": "Природа", "Network": "Нетворкинг", "New": "Новое", "New game": "Новая игра", "Newsletter": "Рассылка", "Next": "Далее", "Next role →": "Следующая роль →", "Next — savor it 🙏": "Далее — насладись 🙏", "Next →": "Дальше →", "Next ▶": "Дальше ▶", "Next ▸": "Далее ▸", "Nice": "Можно", "Night": "Ночь", "No goals yet — add what you're working toward.": "Целей пока нет — добавь, к чему стремишься.", "No plan yet — what's today at its best?": "Плана нет — каким будет лучший день?", "No reflections yet — your first one starts the thread.": "Пока нет записей — первая начнёт нить.", "Not a to-do list — a FUN-do list. Small wins you'll enjoy crossing off today.": "Не список дел — список радостей. Маленькие победы в удовольствие.", "Not mine": "Не моё", "Not the world — the inner block: the habit, fear, story.": "Не мир — внутренний блок: привычка, страх, история.", "Not tracking": "Не отслеживаю", "Notebook": "Блокнот", "Nothing logged yesterday — a fresh page today.": "Вчера ничего не записано — сегодня чистая страница.", "Nothing matches that.": "Ничего не найдено.", "Nothing picked — plan whenever you're ready.": "Ничего не выбрано — спланируй, когда будешь готов.", "Nothing to re-story — you stayed close to the plan.": "Переосмыслять нечего — ты держался плана.", "Nothing tracking": "Ничего не идёт", "Nothing written that day.": "В тот день ничего не записано.", "Now": "Сейчас", "OBSTACLE — what INSIDE you gets in the way?": "ПРЕПЯТСТВИЕ — что ВНУТРИ тебя мешает?", "ON FIRE · x": "В ОГНЕ · x", "ON PLAN": "ПО ПЛАНУ", "OUTCOME — picture it done. How does it look & feel?": "РЕЗУЛЬТАТ — представь, что готово. Как это выглядит и ощущается?", "Off": "Выкл", "Office / Pro": "Офис / Профи", "Office hours": "Приёмные часы", "Often": "Часто", "Okay": "Норм", "On a break": "На паузе", "On hold — tap to activate": "На паузе — нажми для активации", "On plan — keep going": "По плану — продолжай", "On track. Nice.": "Всё по плану. Класс.", "One good thing happened today, even a small one — what was it?": "Сегодня случилось что-то хорошее, пусть мелкое — что?", "One gratitude": "Одна благодарность", "One honest line.": "Одна честная строчка.", "One mindful moment": "Один осознанный миг", "One slow breath first": "Сначала медленный вдох", "Open Heart": "Открытое сердце", "Open eyes ✓": "Открыть глаза ✓", "Open reflection — the angel mirrors your patterns and asks.": "Открытая рефлексия — ангел отражает паттерны и спрашивает.", "OpenRouter · free": "OpenRouter · бесплатно", "Organize": "Организация", "Other": "Другое", "Outdoor gym": "Уличный зал", "Outdoors": "Природа", "Outreach": "Контакты", "Overwhelmed": "На пределе", "PLAN": "ПЛАН", "PLAN IT": "СПЛАНИРОВАТЬ", "PLAN — an if-then: when the obstacle hits, I will…": "ПЛАН — если-то: когда придёт препятствие, я…", "Paint": "Живопись", "Parent": "Родитель", "Part X is the part that pulls you off. It's not you. Which one's loud?": "Часть Х тянет тебя в сторону. Это не ты. Что сейчас громче?", "Partner": "Партнёр", "Pause": "Пауза", "Penetration": "Проникновение", "People": "Люди", "Phone down 10m": "Телефон в сторону 10м", "Phone out of reach": "Убери телефон подальше", "Photo": "Фото", "Piano": "Пианино", "Pick a way in — or just write. There's no one right way; find yours.": "Выбери подход — или просто пиши. Правильного пути нет, найди свой.", "Pick one meaningful, challenging-but-doable goal.": "Выбери важную, но достижимую цель.", "Picture yourself moving through your day steady, capable, and at ease.": "Представь, как идёшь сквозь день спокойно, уверенно, легко.", "Pitch": "Питч", "Plan": "План", "Plan / shape day": "Спланировать день", "Plan / shape today": "Спланировать день", "Plan now — what, for how long?": "Спланировать — что и насколько?", "Plan the rest of my day ☀️": "Спланировать остаток дня ☀️", "Plan today ☀️": "План на день ☀️", "Plan tomorrow": "План на завтра", "Plan what?": "Запланировать что?", "Plan your day": "План на день", "Plan your days": "Планируй дни", "Plan your first day ▸": "Спланируй первый день ▸", "Planner": "План", "Planning": "Планирование", "Play": "Отдых", "Podcast": "Подкаст", "Porn": "Порно", "Post": "Пост", "Post content": "Постить контент", "Post update": "Обновление", "Practice": "Практика", "Present": "В моменте", "Pretty steady": "Довольно стабильно", "Procrastinate": "Прокрастинация", "Produce": "Делать", "Product work": "Продукт", "Programming": "Программирование", "Project": "Проект", "Project your Shadow": "Спроецируй свою Тень", "Protein": "Белок", "Publish": "Публикация", "Pulling me to numb out": "Тянет онеметь", "Pulls (vices, last 7d)": "Срывы (пороки, 7 дней)", "Purpose": "Предназначение", "Put the phone to bed": "Отложи телефон", "Puzzle": "Пазл", "Quality time": "Время вместе", "Quick stretch": "Быстрая растяжка", "Quick tidy": "Быстрая уборка", "Quieter — the timeline leads, I just hint.": "Тише — ведёт таймлайн, я лишь подсказываю.", "Quit a bad habit": "Бросить привычку", "REAL": "ФАКТ", "Radiant": "Сияние", "Rarely": "Редко", "Re-story the drift.": "Переосмысли срыв.", "Reach someone": "Связаться с кем-то", "Read": "Чтение", "Read more": "Больше читать", "Really visualize the best result of achieving it.": "Ярко представь лучший итог.", "Recent": "Недавние", "Recovery Day": "День восстановления", "Redo setup": "Сбросить настройку", "Reel": "Рилс", "Reflect": "Рефлексия", "Reflection": "Итоги дня", "Reflection 🌙": "Рефлексия 🌙", "Relax": "Отдых", "Relax all muscles": "Расслабить мышцы", "Relax…": "Расслабься…", "Release your legs": "Отпусти ноги", "Remote worker": "Удалёнка", "Replan": "Перепланировать", "Replan from now — what, for how long?": "Перепланировать с этого момента — что и насколько?", "Replan — what, for how long?": "Что и насколько?", "Research": "Исследование", "Rest": "Покой", "Rest now": "Отдыхай", "Rest now — I've got the morning.": "Отдыхай — утро за мной.", "Resume": "Продолжить", "Retired": "На пенсии", "Reversal of Desire": "Разворот желания", "Review": "Ревью", "Review today": "Обзор дня", "Revise": "Повторение", "Right call": "Верно решил", "Right call — kept as a conscious choice.": "Верно — осознанный выбор.", "Right now, in this relaxed state, your mind is open and receptive.": "Сейчас, в этом расслаблении, твой ум открыт и восприимчив.", "Run": "Пробежка", "SHARPEST": "ПИК БОДРОСТИ", "START": "СТАРТ", "SWITCH TO": "ПЕРЕКЛЮЧИТЬ НА", "Sales / Biz": "Продажи", "Sales call": "Звонок клиенту", "Sauna": "Сауна", "Save": "Сохранить", "Save money": "Копить", "Save my fun-do 🎉": "Сохранить список 🎉", "Save my purpose 🧭": "Сохранить цель 🧭", "Save the Big 3 🎯": "Сохранить Большую тройку 🎯", "Save the foundation 🌅": "Сохранить основу 🌅", "Save the morning ☀️": "Сохранить утро ☀️", "Save your WOOP 🎈": "Сохранить WOOP 🎈", "Save — let it land 🙏": "Сохранить — пусть осядет 🙏", "Scholar": "Учёный", "Scrolling": "Скроллинг", "See the pain as a cloud": "Увидь боль как облако", "See your best self today — and the small steps from here to there. (Science: imagining your best self reliably lifts optimism & hope.)": "Увидь себя лучшим сегодня — и шаги отсюда туда. (Образ лучшего себя поднимает оптимизм и надежду.)", "See your best self today — gratitude, your #1 thing, who you're being.": "Увидь лучшего себя сегодня — благодарность, главное дело, кто ты.", "Self-Hypnosis": "Самогипноз", "Self-love": "Любовь к себе", "Sell": "Продажи", "Service": "Дело", "Service / Hospitality": "Сервис", "Set it for tomorrow": "Задать на завтра", "Set tomorrow's ONE thing": "Назови ГЛАВНОЕ на завтра", "Settings": "Настройки", "Settle": "Успокоиться", "Settle in…": "Устройся…", "Sharp Mind": "Острый ум", "Ship": "Релиз", "Ship / send": "Отправить", "Ship work": "Сдать работу", "Shipper": "Релизёр", "Shopping": "Шопинг", "Should": "Стоит", "Show up": "Прийти", "Shower": "Душ", "Side hustle": "Подработка", "Sing": "Пение", "Sketch": "Скетч", "Skincare": "Уход за кожей", "Skip for now": "Пока пропустить", "Sleep": "Сон", "Sleep better": "Лучше спать", "Slow morning": "Медленное утро", "Snack": "Перекус", "Soften your chest": "Расслабь грудь", "Soften your forehead": "Расслабь лоб", "Something else": "Что-то ещё", "Something went right today — what was it, even a small thing?": "Что-то удалось сегодня — что, пусть и мелочь?", "Sometimes": "Иногда", "Space": "Дом", "Spark": "Искры", "Sports": "Спорт", "Stage": "Этап", "Stalled right after a win": "Замер после победы", "Stand & move": "Встать и размяться", "Start": "Старт", "Start now": "Начать сейчас", "Start over": "Начать заново", "Start tracking": "Начать отслеживание", "Steady the body": "Успокой тело", "Step outside": "Выйти на воздух", "Stock your life ✨": "Наполни жизнь ✨", "Stretch": "Растяжка", "Stuck": "В тупике", "Stuck on a hurt": "Застрял на обиде", "Student": "Студент", "Study": "Учёба", "Study craft": "Учить ремесло", "Stutz & Michels' practice — name a few specific things. small is good.": "практика Стаца и Майклза — назови несколько конкретных вещей. Мелочи годятся.", "Substance": "Вещества", "Sugar": "Сахар", "Sun": "Солнце", "Swim": "Плавание", "Switch activity": "Сменить активность", "Switch to?": "Переключить на?", "Switch to…": "Сменить на…", "TV": "ТВ", "Take out trash": "Вынести мусор", "Tap a day": "Выбери день", "Tap again to erase EVERYTHING": "Нажми снова, чтобы стереть ВСЁ", "Tap each point ~7× with two fingers. No need to believe it — just tap and say the words.": "Постукивай по каждой точке ~7 раз двумя пальцами. Верить не обязательно — просто стучи и произноси слова.", "Tapping (EFT)": "Тэппинг (EFT)", "Teacher": "Учитель", "Test": "Тест", "Test day": "Тестовый день", "Text back": "Ответить", "That's Part X — a hurt that hardened. Not you.": "Это Часть Х — застывшая обида. Не ты.", "That's Part X — avoidance. Not you.": "Это Часть Х — избегание. Не ты.", "That's Part X — lethargy. Not you.": "Это Часть Х — апатия. Не ты.", "That's Part X — the exoneration fantasy. Not you.": "Это Часть Х — иллюзия «заслужил отдых». Не ты.", "That's Part X — the pull to numb. Not you.": "Это Часть Х — тяга онеметь. Не ты.", "That's the day, well closed.": "День достойно завершён.", "The 3 habits you do on your BEST days. Make your best your baseline.": "3 привычки твоих лучших дней. Сделай лучшее нормой.", "The Big 3": "Большая тройка", "The Brave": "Храбрый", "The Closer": "Закрывающий", "The Disciplined": "Дисциплинированный", "The Explorer": "Исследователь", "The Grateful": "Благодарный", "The Hopeful": "Полный надежд", "The Lover": "Любящий", "The Operator": "Оператор", "The Sage": "Мудрец", "The Vital": "Живой", "The Vortex": "Вихрь", "The day took its own route for a stretch — no judgment, what was calling you?": "День какое-то время шёл своим путём — без осуждения, что звало тебя?", "The day went its own way for a bit — what pulled your attention?": "День ненадолго свернул сам — что притянуло внимание?", "The reading room": "Комната чтения", "Therapy": "Терапия", "They begin to rise": "Они начинают подниматься", "They grow and expand": "Они растут и ширятся", "They're out of your head": "Он покинул твою голову", "Think of a day you were genuinely at your best. What did you DO that day? Name the habit that, if you'd guess, was behind it.": "Вспомни день, когда ты был лучшим. Что ты делал? Назови привычку, что была за этим.", "This REPLACES all your current data with this backup — continue?": "Это ЗАМЕНИТ все текущие данные бэкапом — продолжить?", "This is simply who you are now — it needs no effort, it's already yours.": "Это просто ты теперь — без усилий, это уже твоё.", "This week": "Эта неделя", "This week — tap a day": "Эта неделя — выбери день", "Three deep breaths": "Три глубоких вдоха", "Thriving": "На подъёме", "Tidy": "Уборка", "Tidy 5m": "Прибраться 5м", "Tidy one thing": "Прибрать одно", "Tidy the surfaces": "Протри поверхности", "Tidy up — one step at a time": "Уборка — шаг за шагом", "Tidy up 🧹": "Прибраться 🧹", "Tidy your space": "Прибери пространство", "Today": "Сегодня", "Today complete — beautiful ✨": "День завершён — красота ✨", "Today's journey": "Путь дня", "Together: “LISTEN!”": "Вместе: «СЛУШАЙ!»", "Tomorrow": "Завтра", "Toolbox": "Инструменты", "Tools": "Инструменты", "Top Student": "Лучший студент", "Track it": "Отслеживать", "Tracking": "Отсчёт", "Tracking…": "Идёт отсчёт…", "Trades / Hands-on": "Ремесло", "Transmission": "Передача", "Travel": "Путешествия", "Twelve suns around you": "Двенадцать солнц вокруг", "Unbroken": "Непрерывный", "Undo": "Отменить", "Unstoppable": "Неудержим", "Use it ▶": "Использовать ▶", "Use the spark": "Используй искру", "Use the tool ▶": "Применить инструмент ▶", "Vape": "Вейп", "Vices": "Пороки", "Video": "Видео", "Visionary": "Визионер", "Vitamins": "Витамины", "WISH — your #1 most important thing right now.": "ЖЕЛАНИЕ — самое важное прямо сейчас.", "Wake & bedtime": "Подъём и сон", "Wake as someone…": "Проснуться как…", "Wake early": "Ранний подъём", "Walk": "Прогулка", "Wash up": "Умыться", "Water": "Вода", "Weed": "Травка", "Week": "Неделя", "Week of": "Неделя с", "Weeks": "Недели", "Well-Fed": "Сытый", "What are you doing now?": "Чем ты занят сейчас?", "What are you doing?": "Чем ты занят?", "What are you working toward?": "К чему ты идёшь?", "What could you be GREAT at?": "В чём ты можешь быть ВЕЛИКИМ?", "What do you LOVE to do?": "Что ты ЛЮБИШЬ делать?", "What does the WORLD need (and pay for)?": "Что нужно МИРУ (и за что платят)?", "What is it?": "Что это?", "What slid by isn't a verdict — it's a choice you get to make now.": "Что упущено — не приговор, а выбор, что ты делаешь сейчас.", "What went WELL today? (Even one small thing — wins count.)": "Что удалось сегодня? (Даже мелочь — победа есть победа.)", "What went well today?": "Что было хорошего сегодня?", "What went well · what you'd improve · what to carry. No guilt.": "Что удалось · что улучшить · что взять с собой. Без вины.", "What were you doing?": "Чем ты занимался?", "What will you DO today?": "Что ты СДЕЛАЕШЬ сегодня?", "What would you do a little better next time? Curious, not critical — win or learn, never lose.": "Что сделал бы чуть лучше? С интересом, без критики — побеждай или учись.", "What's the plan?": "Какой план?", "What's your life like?": "Какая у тебя жизнь?", "Where are you starting?": "С чего начинаешь?", "Where they overlap — your ONE thing.": "Где всё сходится — твоё ГЛАВНОЕ.", "Who are you becoming?": "Кем ты становишься?", "Who are you being today?": "Кем ты будешь сегодня?", "Who are you committed to BEING here?": "Кем ты решил БЫТЬ здесь?", "Who do you want to be today?": "Кем ты хочешь быть сегодня?", "Why does it matter?": "Почему это важно?", "Willingness": "Готовность", "Wind down": "Расслабление", "Wind down 😴": "Расслабиться 😴", "Wipe surfaces": "Протереть поверхности", "Wisdom": "Мудрость", "Wish · Outcome · Obstacle · Plan — for your #1 goal.": "Желание · Итог · Препятствие · План — для главной цели.", "With every breath, that calm, capable feeling grows stronger and more natural.": "С каждым вдохом это спокойствие крепнет и становится естественным.", "Wordsmith": "Мастер слова", "Work": "Работа", "Write": "Писать", "Writer": "Писатель", "Writer / Creator": "Писатель / Автор", "Writing": "Письмо", "YOU ARE": "ТЫ", "YOUR ONE THING TODAY": "ТВОЁ ГЛАВНОЕ СЕГОДНЯ", "Yoga": "Йога", "You kept the thread going — what made showing up feel possible today?": "Ты удержал нить — что сделало явку возможной сегодня?", "You kept the thread today — what made it feel doable?": "Ты удержал нить — что сделало это посильным?", "You poured real hours in today — what part of that felt most like you?": "Ты вложил настоящие часы — что в этом было больше всего твоим?", "You put real time in today — what felt best about it?": "Ты вложил время сегодня — что было приятнее всего?", "You're on a roll — what's been keeping the momentum going?": "Ты на волне — что держит этот разгон?", "You're set for now — add anything you like below.": "Пока всё — добавь что угодно ниже.", "Your #1 thing today — the one move future-you would thank you for.": "Главное на сегодня — за что будущий ты скажет спасибо.", "Your character": "Твой персонаж", "Your daily habits": "Твои привычки", "Your daily rhythm": "Твой ритм дня", "Your deathbed self": "Ты на смертном одре", "Your goals": "Твои цели", "Your habits": "Твои привычки", "Your journey": "Твой путь", "Your journey is being designed — coming soon": "Твой путь в разработке — скоро", "Your life": "Твоя жизнь", "Your next step": "Твой шаг", "Your one thing": "Твоё главное", "Your recurring basics — “Daily fundamentals” fills these into a day.": "Твоя рутина — «Основа дня» заполнит её в день.", "Your space": "Твоё пространство", "Your whole body is heavy and calm": "Всё тело тяжёлое и спокойное", "Your world is ready — your journey's all set": "Твой мир готов — путь намечен", "Your world is ready ✨": "Твой мир готов ✨", "Zest": "Кураж", "a goal of your own…": "своя цель…", "a goal you're working toward…": "цель, к которой стремишься…", "a grievance is still live — Grateful Flow stays parked until Active Love clears it. that's by design.": "обида ещё жива — Поток благодарности ждёт, пока Активная любовь её разрядит. Так задумано.", "a habit of your own…": "своя привычка…", "a line is enough": "хватит и строчки", "a line is enough — or a few": "хватит строчки — или пары", "a little win…": "маленькая победа…", "a ready-made stack — look it over, then apply it (or save a copy to customize)": "готовый набор — посмотри и применяй (или сохрани копию)", "a stack = a ready-made set of activities — tap one to look inside, edit, then apply to": "набор — готовый список активностей; нажми, отредактируй и применяй к", "a still, safe place inside — and here you read the words that take hold": "тихое безопасное место внутри — здесь ты читаешь слова, что укореняются", "a warm bed": "тёплая постель", "a year ago": "год назад", "active": "активно", "add": "добавить", "add a fundamental": "добавить основу", "add a habit / activity": "добавить привычку", "add a step": "добавить шаг", "add a step or milestone…": "добавь шаг или этап…", "add activity": "добавить", "add all steps": "добавить все шаги", "add another": "добавить ещё", "add or remove activities, then apply it to any day": "добавь/убери активности и применяй к дню", "add or remove your activities": "добавляй и убирай дела", "add step": "добавить шаг", "added": "добавлено", "after this — “": "после этого — «", "age": "возраст", "all my activities": "все мои занятия", "all the way down now, deeply relaxed, completely at ease": "до самого низа, глубоко расслаблен, совершенно спокоен", "all the way to your feet": "до самых стоп", "and unclench your jaw": "и разожми челюсть", "and your belly": "и живот", "anxious": "тревога", "anything that doesn't fit the Big 3.": "что не вошло в три главных.", "away": "отсутствовал", "back": "назад", "back to": "назад к", "backup copied": "бэкап скопирован", "backup copied — keep it safe": "бэкап скопирован — сохрани его", "backup downloaded": "бэкап скачан", "be specific — a moment, a person, a detail": "конкретно — миг, человек, деталь", "because…": "потому что…", "bed": "сон", "before 10": "до 10", "before 6": "до 6", "best things to do from here — tap to drop one in": "что лучше сделать сейчас — нажми, чтобы добавить", "bigger = more of your life · sprigs = your sub-habits · tap a planet to do something there": "больше = больше жизни · ветки = под-привычки · нажми планету, чтобы действовать", "break down & schedule": "разбить и запланировать", "break over": "пауза окончена", "break's up — tap to resume": "пауза кончилась — нажми, чтобы продолжить", "build & apply day presets": "создавай и применяй пресеты дня", "build & ship code": "пиши и выпускай код", "build a custom stack": "свой набор", "cancel": "отмена", "carry forward…": "перенести на завтра…", "carry it forward": "неси это дальше", "carry the calm with you": "сохрани спокойствие", "category": "категория", "chess, puzzles, practice": "шахматы, головоломки, практика", "choose activity": "выбрать дело", "close your eyes. don't just think it — feel it land in your body. (": "закрой глаза. Не просто думай — почувствуй это в теле. (", "cold showers & breathwork": "холодный душ и дыхание", "combo x": "комбо x", "couldn't copy — use Download": "не скопировалось — скачай файл", "couldn't open that one": "не удалось открыть", "couldn't restore — storage may be full; your data is unchanged": "не удалось заменить — память полна; данные не тронуты", "cycle": "цикл", "day tools": "инструменты дня", "deep work sessions": "сессии глубокой работы", "delete": "удалить", "delete this stack": "удалить набор", "did it · tap to undo": "сделано · тап чтобы отменить", "direct that love at the person who wronged you — see them bathed in it. Not forgiving — generating an infinite force, because it serves YOUR liberation": "направь любовь на обидчика — увидь его в её сиянии. Не прощение — бесконечная сила ради ТВОЕЙ свободы", "discharge it for YOUR liberation — Active Love": "разряди ради ТВОЕЙ свободы — Активная любовь", "do gratitude anyway": "всё равно к благодарности", "do it": "сделать", "do the scary thing": "делай страшное", "doesn't look like an ALTER backup": "это не похоже на бэкап ALTER", "down": "уныние", "down to your fingertips": "до кончиков пальцев", "drifted": "дрейф", "drifting": "дрейф", "drifting a while — tap to get back on plan": "дрейфуешь — нажми, чтобы вернуться к плану", "drop the shoulders, settle — you can't speak from your core on a wound-up body": "опусти плечи, успокойся — из глубины не говорить на взводе", "duration": "длительность", "e.g. Rock climbing, Volunteer, Therapy…": "напр. Скалолазание, Волонтёрство, Терапия…", "e.g. ship the build": "напр. выпустить сборку", "eat & sleep well": "ешь и спи хорошо", "edit": "править", "elapsed": "прошло", "embody": "тело", "empty stack — add your activities below": "пусто — добавь активности ниже", "engine": "движок", "erase everything on this device and begin from zero. back up first — this can't be undone.": "стереть всё на устройстве и начать с нуля. Сначала сохрани — это необратимо.", "even a tiny one counts": "даже короткая считается", "explore & discover": "исследуй и открывай", "feel it grow": "почувствуй, как растёт", "feel love flowing through your whole body — not at anyone yet, just the raw force, radiating from your chest": "почувствуй любовь во всём теле — пока ни к кому, просто чистую силу из груди", "feel the love enter them and fill them completely — and as it does, feel the Outflow return to you, greater than what you sent": "почувствуй, как любовь наполняет его — и возвращается к тебе ещё большей", "feel yourself pass through and out the far side into light": "почувствуй, как проходишь насквозь к свету", "few active · do fewer, finish more — Slow Productivity": "меньше активных · делай меньше, доводи до конца", "fill the void from the inside, not the screen — Black Sun": "заполни пустоту изнутри, не экраном — Чёрное солнце", "focus & deliver": "фокус и результат", "follow the orb": "следуй за сферой", "free AI (optional)": "бесплатный ИИ (опц.)", "free AI tailoring (optional)": "бесплатная ИИ-настройка (опц.)", "free: first-principles starter · 🧠 brain tailors it to you": "бесплатно: базовый старт · 🧠 мозг подстроит под тебя", "from that void, an orb of dark light lifts — the compressed Life Force itself": "из пустоты поднимается шар тёмного света — сжатая жизненная сила", "frustrated": "злость", "fully back, calm and clear, carrying it with you": "полностью вернулся, спокоен и ясен", "gap": "пробел", "get ahead on tomorrow?": "забежать в завтра?", "get lean, ship the app, find peace…": "похудеть, выпустить приложение, найти покой…", "get one free:": "получи бесплатно:", "go a little deeper": "копнуть глубже", "go all the way in — let the cloud surround you": "войди внутрь — пусть облако окутает тебя", "go deeper ✨": "глубже ✨", "go ·": "вперёд ·", "guide": "гид", "he": "он", "he has run out of present moments. He is looking back at THIS one — the one you're about to waste": "у него не осталось мгновений. Он смотрит на ЭТО — то, что ты вот-вот растратишь", "he knows the value of this moment because he has none left. Let his urgency enter you": "он знает цену этому мигу, ведь у него их нет. Впусти его срочность", "heavy": "сильная", "held · streak safe": "пауза · серия цела", "helps me suggest a starting point": "поможет выбрать старт", "how long": "сколько", "if [obstacle], then I will…": "если [препятствие], то я…", "importance": "важность", "in a row": "подряд", "it's already true": "это уже правда", "journal & reflect": "веди дневник и размышляй", "just be here, now": "просто будь здесь и сейчас", "just naming it was enough": "хватило просто назвать", "just the basics": "только основы", "just the fundamentals first — add more whenever you like. mapped": "сначала основы — добавишь ещё когда захочешь. Отмечено", "keep your streaks alive": "держи серии живыми", "kept as real — unplanned": "оставлено как факт — без плана", "last 7 days:": "за 7 дней:", "later": "позже", "left": "осталось", "length — slide, step ＋, or tap a chip": "длительность — ползунок, ＋ или чип", "less": "свернуть", "let it lock in": "дай этому закрепиться", "let it settle": "пусть осядет", "let them fall": "пусть упадут", "let your eyes soften": "пусть глаза смягчатся", "let's get it out of you — the things you want (and keep avoiding).": "Давай вытащим то, чего хочешь (и избегаешь).", "lift the energy — twelve suns, the Vortex": "подними энергию — двенадцать солнц, Вихрь", "light": "лёгкая", "loaded — now Merge or Restore": "загружено — теперь Слить или Заменить", "loaded — now Merge or Restore.": "загружено — теперь Слить или Заменить.", "m left": "м осталось", "make & ship art": "создавай и выпускай арт", "make something new": "создай новое", "mark done": "отметить готовым", "marked not done — just a plan": "отмечено невыполненным — просто план", "matches your plan": "совпадает с планом", "meditate & breathe": "медитируй и дыши", "merged in — nothing overwritten": "слито — ничего не перезаписано", "midnight": "полночь", "min": "мин", "missed": "пропущено", "model": "модель", "moderate": "умеренная", "more": "ещё", "move toward it — Reversal of Desire": "иди навстречу — Разворот желания", "move toward the cloud — say it, mean it": "иди к облаку — скажи это и почувствуй", "move your body": "двигай телом", "moved to": "перенесено на", "moved to plan": "перенесено в план", "moved to real": "перенесено в факт", "my health": "моё здоровье", "my health, this quiet morning…": "моё здоровье, это тихое утро…", "my main inner obstacle is…": "моё главное внутреннее препятствие…", "my one thing is…": "моё главное — это…", "my real strengths are…": "мои сильные стороны…", "name it (e.g. Climbing, Therapy)…": "название (напр. Скалолазание)…", "name one thing — then take a slow breath and actually feel it.": "назови одно — потом медленно вдохни и правда почувствуй.", "name this stack…": "назови набор…", "never": "никогда", "next": "далее", "no activities": "нет активностей", "no plan tonight": "на ночь нет плана", "no plan — free tracking": "без плана — свободно", "no sub-habits yet — break it into smaller steps": "нет шагов — разбей на мелкие", "no wrong answer": "нет неверных ответов", "no wrong answer — it just sets where your journey opens": "нет неверных ответов — это лишь старт пути", "noon": "полдень", "not enough Spark yet — earn a little more": "не хватает Искры — заработай ещё чуть", "not the craving itself — the emptiness driving it. The deprivation that wants to be filled from outside": "не саму тягу — пустоту под ней. Нехватку, что ищет заполнения извне", "not valid backup JSON": "битый JSON бэкапа", "note what you're grateful for": "отмечай, за что благодарен", "nothing to do, nowhere to be": "ничего не нужно, некуда спешить", "nothing to undo": "нечего отменять", "now stop naming reasons. just feel grateful — for nothing, for everything. sense it radiating from the center of your chest.": "перестань называть причины. Просто будь благодарен — ни за что, за всё. Почувствуй, как это льётся из груди.", "off plan": "вне плана", "off plan — logged honestly": "вне плана — записано честно", "off your plan": "вне плана", "often": "часто", "on my best days I…": "в лучшие дни я…", "on plan": "по плану", "on plan · winning": "по плану · отлично", "on plan!": "по плану!", "one slow round of breath, then we name what's loud. the order matters — you can't reframe a wound-up nervous system (Stutz).": "один медленный круг дыхания, потом назовём, что давит. Порядок важен — нельзя переосмыслить взвинченную нервную систему (Стац).", "one thing I'd refine — gently…": "что бы я мягко поправил…", "one… beginning to return": "один… начинаешь возвращаться", "or": "или", "or paste a model id": "или вставь id модели", "or tap a familiar one": "или нажми привычное", "over by": "превышение на", "paste a backup (or pick a file), then Merge to combine or Restore to replace:": "вставь бэкап (или выбери файл), затем Слить или Заменить:", "paste backup JSON here…": "вставь JSON бэкапа сюда…", "paste key…": "вставь ключ…", "paste your": "вставь свой ключ", "paused": "пауза", "pick ALL that fit — you can be more than one (parent + worker…) · or type your own": "выбери всё, что подходит (родитель + работа…) · или впиши своё", "pick a couple — present tense, the you you're growing into · type your own": "выбери пару — в настоящем, кем растёшь · впиши своё", "pick a few — fewer is better · type your own": "выбери пару — меньше лучше · впиши своё", "pick the small basics you want to keep showing up for · type your own": "выбери основы, к которым хочешь возвращаться · впиши своё", "picture a calm shore — warm light, the slow rhythm of the water": "представь спокойный берег — тёплый свет, медленный ритм воды", "picture twelve suns arranged in a circle, surrounding you": "представь двенадцать солнц по кругу вокруг тебя", "plan & track your day": "планируй и отслеживай день", "plan your days": "планируй дни", "planned": "запланировано", "plug in an AI so ALTER can actually think. swap engines anytime; start free.": "подключи ИИ, чтобы ALTER думал. Движок меняй когда угодно; старт бесплатный.", "priority — lowest gets dropped if you run out of time": "приоритет — низший отбросится, если не хватит времени", "pull up to close": "потяни вверх, чтобы закрыть", "quit": "бросить", "re-run onboarding": "пройти знакомство заново", "reach out to people": "тянись к людям", "read & study": "читай и учись", "read it slowly": "читай медленно", "ready to come back": "готов вернуться", "ready when you are": "готов, когда ты готов", "reflect on today, tidy up, set tomorrow's one thing.": "Подумай о дне, прибери, задай главное на завтра.", "remind me": "напоминать", "rename this stack": "переименовать набор", "reset": "сброс", "reset to defaults": "сбросить по умолчанию", "rest": "покой", "rest — I've got the morning": "отдыхай — утро за мной", "restless": "беспокойство", "resume": "продолжить", "rough is fine — pick a range": "примерно — выбери диапазон", "rough is fine — the timeline frames your day from these.": "примерно — таймлайн строит день по этому.", "running tight": "цейтнот", "sad": "грусть", "save": "сохранить", "save a copy to customize": "сохранить копию", "say it out loud, or just read along": "произнеси вслух или просто читай", "search reflections…": "искать в записях…", "see it": "увидь это", "see the version of yourself you're most ashamed of — weak, imperfect, broken — a vivid image standing right in front of you": "увидь себя, которого стыдишься — слабого, сломленного — ярко, прямо перед собой", "see who you're being": "посмотри, кто ты сейчас", "seeded with your life. let's make today count.": "наполнен твоей жизнью. Сделаем день важным.", "sell, pitch, close": "продавай, питчи, закрывай", "send it back out into your day — that's where it wants to go": "верни её в свой день — туда ей и нужно", "set": "задано", "set aside — come back any time": "отложено — вернись когда угодно", "set goals & intentions": "ставь цели и намерения", "set your day's frame": "задай рамки дня", "she": "она", "ship & send things": "выпускай и отправляй", "ship 1 thing to grow": "выпусти 1 дело для роста", "ship one real thing today — then your world grows 🌱": "выпусти одно настоящее дело — и мир вырастет 🌱", "ship one real thing today, then plant": "выпусти настоящее дело — потом сади", "shoulders drop… jaw unclenches… each breath a little slower": "плечи опускаются… челюсть расслабляется… дыхание медленнее", "skills you level by living — do the thing, it ranks up": "навыки растут от жизни — делай, и они качаются", "skip": "пропустить", "slowly they lift around you": "медленно встают вокруг", "so the app tailors your deep-work habits to you": "чтобы приложение подстроило привычки под тебя", "some": "иногда", "someone who loves me": "тот, кто любит меня", "something you're grateful for…": "за что ты благодарен…", "spacious": "редко", "stacks": "наборы", "starts": "старт", "starts at — tap −/＋ to nudge": "начало — жми −/＋ для сдвига", "steps": "шаги", "stressed": "стресс", "stuck": "застрял", "study & produce": "учись и создавай", "sub-habit (e.g. Define the ONE thing)…": "шаг (напр. Главное дело)…", "suggested next ▸": "далее ▸", "suggested now": "сейчас", "switch": "сменить", "tap = ✓": "тап = ✓", "tap Start to begin tracking": "нажми Старт, чтобы начать", "tap a few — multitasking welcome ✓": "выбери несколько — мультизадачность ок ✓", "tap a star to open its skill tree ✨": "нажми звезду — откроется древо навыков ✨", "tap a step to drop it into your plan": "тап по шагу — добавить в план", "tap everything you do — or want to do · type anything that's missing": "отметь всё, чем занят — или хочешь · впиши, чего нет", "tap to break it down →": "нажми, чтобы разбить →", "tap to choose": "тап для выбора", "tap to drop it at": "нажми, чтобы поставить на", "tap to mark done · overdue floats to the top": "нажми — отметить · просроченное вверху", "tap to resume your goal": "нажми, чтобы вернуться к цели", "tap to start a timer — stack several if you're multitasking.": "нажми, чтобы запустить таймер — можно несколько сразу.", "tap to track": "нажми, чтобы отслеживать", "tap ▶ or pick below to start": "нажми ▶ или выбери ниже", "ten… nine… eight… each number takes you deeper and calmer": "десять… девять… восемь… с каждым числом глубже и спокойнее", "test day — streak ×3 · a miss · a drift · live · future": "тестовый день — серия ×3 · пропуск · дрейф · сейчас · впереди", "that's who you are": "вот кто ты есть", "the Stutz & Michels way — or a quick one.": "по Стацу и Майклзу — или коротко.", "the best outcome is…": "лучший исход — это…", "the idea is…": "идея в том…", "the identity you're stepping into — tap a few.": "личность, в которую входишь — выбери несколько.", "the loop is discharged — that was for you, not for them": "петля разряжена — это было для тебя", "the one move that'd make today count…": "шаг, ради которого день будет важен…", "the one thing…": "главное…", "the right move for the moment you're in — sourced from your Field Guide. Using one on a hard day is the win.": "верный ход для текущего момента — из твоего Field Guide. Применить в тяжёлый день — уже победа.", "the thing you're avoiding — picture it as a cloud right in front of you": "то, чего избегаешь — представь облаком прямо перед собой", "the virtues you'll embody today.": "добродетели, что воплотишь сегодня.", "the void fills from within, not from the screen or the snack — you're full": "пустота заполняется изнутри, а не экраном или едой — ты полон", "the work quietly stops after a win — Jeopardy snaps you back": "работа тихо встаёт после победы — Угроза вернёт тебя", "the world needs…": "миру нужно…", "the you you're becoming…": "кем ты становишься…", "there's a grievance still running — gratitude won't land on top of it. Active Love discharges it first (for YOUR liberation, 60s), then gratitude lights up.": "обида ещё работает — благодарность на ней не приживётся. Сначала Активная любовь (ради ТВОЕЙ свободы, 60с), потом загорится благодарность.", "they": "они", "they swell outward — feel the non-physical energy pour in and fill you": "они расходятся — почувствуй, как энергия наполняет тебя", "thinking…": "думаю…", "this evening": "сегодня вечером", "this is you. Not your enemy. Your other half. Feel the connection between you and the Shadow": "это ты. Не враг. Твоя половина. Почувствуй связь с Тенью", "this morning": "сегодня утром", "this urgency is real, not manufactured. Use it — launch the next thing right now": "эта срочность настоящая. Используй её — начни следующее прямо сейчас", "this very moment": "этот самый миг", "tidy the surfaces, phone away, head toward bed.": "Прибери поверхности, отложи телефон, в кровать.", "tidy your space": "прибери пространство", "time's up": "время вышло", "tired": "усталость", "today": "сегодня", "today I'll…": "сегодня я…", "today, the one thing is…": "сегодня главное — это…", "tonight": "сегодня вечером", "total tracked:": "всего отслежено:", "tracked · best streak 🔥": "учтено · рекорд 🔥", "tracking": "отслеживается", "tracking · no plan": "идёт · без плана", "up": "подъём", "varies": "по-разному", "waits": "ждёт", "wake": "подъём", "welcome back": "с возвращением", "well done": "молодец", "what I most want is…": "больше всего я хочу…", "what are you doing?": "что делаешь?", "what went well…": "что удалось…", "what's bumping you?": "что тебя цепляет?", "when:": "когда:", "which habits are you committing to? they'll land on your day.": "какие привычки берёшь? Встанут в твой день.", "which virtues call you most right now? pick up to 3 — you'll still grow them all": "какие добродетели зовут сильнее? Выбери до 3 — расти будешь во всех", "who you're being — where your days actually go (30d)": "кто ты есть — куда уходят твои дни (30д)", "with": "с", "witness": "свидетель", "write & publish": "пиши и публикуй", "you and the Shadow speak with one voice. The Force of Self-Expression flows — your authority comes from inside, not from their approval": "ты и Тень говорите в один голос. Твоя сила — изнутри, не из чужого одобрения", "you don't need to close your eyes — just read along, slowly, in your mind or aloud": "не закрывай глаза — просто читай медленно, про себя или вслух", "you labeled it — that's the whole skill 🙏": "ты назвал это — в этом весь навык 🙏", "you stepped away — no shame": "ты отвлёкся — без вины", "you're back online — move": "ты снова в строю — действуй", "you're moving again — that's the whole point": "ты снова в движении — в этом весь смысл", "your activities — tap one to edit, ✕ to remove, or add a new one": "активности — нажми, чтобы изменить, ✕ убрать, или добавь новую", "your data lives only on this device — back it up so nothing can erase it.": "твои данные только на этом устройстве — сохрани, чтобы их ничто не стёрло.", "your day on the timeline:": "твой день на таймлайне:", "your guardian-angel life sim": "твой ангел-хранитель — симулятор жизни", "your guardian. I'll help you become who you want to be — one day at a time.": "твой хранитель. Помогу стать тем, кем ты хочешь — день за днём.", "your intention": "твоё намерение", "your mirror — it grows when you do": "твоё зеркало — растёт вместе с тобой", "your role / situation…": "твоя роль / ситуация…", "your virtues — they level by living. tap one to open its skill tree": "твои добродетели растут от жизни. нажми, чтобы открыть навыки", "{lagv} stayed quiet today — is it asking for a little room tomorrow?": "{lagv} молчала сегодня — может, просит места в завтра?", "· added": "· добавлено", "· ends": "· до", "“Bring it on!”": "«Давай!»", "“I love pain!”": "«Я люблю боль!»", "“Pain sets me free!”": "«Боль освобождает меня!»", "…4, 5 — eyes bright": "…4, 5 — глаза ясные", "…because?": "…потому что?", "…or type your own move": "…или впиши свой шаг", "← all entries": "← все записи", "← back": "← назад", "← tap to head back": "← нажми, чтобы вернуться", "⏱ too short — discarded": "⏱ слишком коротко — отброшено", "⏱️ Right now": "⏱️ Прямо сейчас", "⏱️ what you did": "⏱️ что ты сделал", "▶ Tracking now (": "▶ Идёт сейчас (", "▶ start your plan": "▶ начать план", "▶ started": "▶ начато", "◂ back": "◂ назад", "☀️ Morning bookend": "☀️ Утренний ритуал", "☀️ Who are you today?": "☀️ Кто ты сегодня?", "♻ Replace": "♻ Заменить", "♻ Restore": "♻ Восстановить", "⚔️ Character": "⚔️ Персонаж", "⚠️ free models error until you enable them — go to openrouter.ai/settings/privacy and turn ON the free-model / prompt-logging toggle, then Test.": "⚠️ бесплатные модели дают ошибку, пока не включишь их — зайди на openrouter.ai/settings/privacy и включи переключатель бесплатных моделей / логов, потом Тест.", "⚡ quick gratitude instead": "⚡ быстрая благодарность", "⚡ quick wins — tap for instant Spark": "⚡ быстрые победы — жми за Искрой", "✅ Commit to today": "✅ Возьми на сегодня", "✅ habits kept": "✅ привычки сохранены", "✓ done": "✓ готово", "✓ on-plan stretch tracked · +": "✓ по плану засчитано · +", "✓ saved — your masterpiece": "✓ сохранено", "✓ your whole map is built — tap to fine-tune.": "✓ карта готова — нажми для правки.", "✕ delete this goal": "✕ удалить цель", "✦ MISSING SOMETHING? TYPE IT": "✦ ЧЕГО-ТО НЕТ? ВПИШИ", "✨ Begin your character": "✨ Создай персонажа", "✨ Everything else": "✨ Всё остальное", "✨ Let it rise": "✨ Дай ей подняться", "✨ Redo setup": "✨ Заново настроить", "✨ Set up your world →": "✨ Настрой свой мир →", "✨ What should I do next?": "✨ Что мне сделать дальше?", "✨ What's next?": "✨ Что дальше?", "✨ completed your plan · +": "✨ план выполнен · +", "➕ map a few more": "➕ отметить ещё", "⧉ Merge in": "⧉ Слить", "⬇ Download": "⬇ Скачать", "＋ add": "＋ добавить", "🌅 Wake & bedtime": "🌅 Подъём и сон", "🌅 morning intention": "🌅 утреннее намерение", "🌙 Evening bookend": "🌙 Вечерний ритуал", "🌙 reflections": "🌙 размышления", "🌟 Fill my masterpiece day": "🌟 Заполнить идеальный день", "🌟 Suggest a full day": "🌟 Предложить день", "🌟 Which virtues?": "🌟 Какие добродетели?", "🌟 Your path": "🌟 Твой путь", "🌦️ your inner weather — how do you feel?": "🌦️ твоя внутренняя погода — как ты?", "🌱 Plant in your world · ✨": "🌱 Посадить в мир · ✨", "🌱 planted — your world grew": "🌱 посажено — твой мир вырос", "🌱 today grew": "🌱 день вырос", "🌳 See your life": "🌳 Взгляд на жизнь", "🎮 enter your world": "🎮 войти в свой мир", "🎯 what are you chasing? (optional)": "🎯 к чему стремишься? (по желанию)", "👆 Tapping": "👆 Постукивание", "💗 Active Love ▶": "💗 Активная любовь ▶", "💼 What's your work?": "💼 Чем занимаешься?", "💾 Back up your life": "💾 Сохрани свою жизнь", "💾 Save this as my masterpiece day": "💾 Сохранить как идеальный день", "📊 Build your self-map": "📊 Построй карту себя", "📊 calibrate my levels": "📊 Откалибровать уровни", "📋 Copy": "📋 Копировать", "📓 Yesterday": "📓 Вчера", "📔 Journal": "📔 Дневник", "📝 notes": "📝 заметки", "🔥 streak x": "🔥 серия x", "🕰️ On this day": "🕰️ В этот день", "🗑 deleted": "🗑 удалено", "🗺️ Today's journey": "🗺️ Путь дня", "😴 Wind down": "😴 Отход ко сну", "🙏 Close with gratitude": "🙏 Заверши благодарностью", "🙏 Grateful Flow": "🙏 Поток благодарности", "🙏 Grateful Flow (full)": "🙏 Поток благодарности (полный)", "🙏 One gratitude": "🙏 Одна благодарность", "🛹 Build a skateboard · ✨": "🛹 Собрать скейт · ✨", "🛹 Skateboard built — tap the left pad to skate": "🛹 Скейт готов — нажми левый джойстик", "🛼 Trick deck · ✨": "🛼 Трюковая дека · ✨", "🛼 Trick deck — jump while skating, flick the right stick for flips & spins": "🛼 Трюки — прыгай на скейте, правый стик для флипов и вращений", "🧘 Meditate": "🧘 Медитация", "🧠 Brain — free": "🧠 Мозг — бесплатно", "🧠 ask my brain what's best": "🧠 спросить мой мозг", "🧠 brain (free AI)": "🧠 Мозг (бесплатный ИИ)", "🧠 thinking…": "🧠 думаю…", "🧪 Test the brain": "🧪 Проверить мозг", "🧰 Your toolbox": "🧰 Твой инструментарий"}); // v657: comprehensive Russian dictionary (700+ strings, parallel-agent translated across the whole app+game)
  // more core strings + dynamic patterns (kept out of the big literal for readability)
  Object.assign(I18N.ru, {
    "Your journey": "Твой путь", "Plan your day": "Спланируй день", "PLAN IT": "СПЛАНИРОВАТЬ", "Plan it": "Спланировать", "Map out today — pick a few things and let them wait for you.": "Распланируй сегодня — выбери пару дел, и они подождут тебя.", "Today complete — beautiful ✨": "День завершён — красота ✨",
    "Not tracking": "Не отслеживается", "Create plan": "Создать план", "Just track": "Просто трекать", "Review today": "Обзор дня", "Settle": "Передышка", "Settle first": "Сначала передышка",
    "Brush teeth": "Почистить зубы", "Tidy space": "Прибраться", "Tidy": "Уборка", "Deep work": "Глубокая работа", "Make bed": "Заправить кровать", "Run": "Пробежка", "Walk": "Прогулка", "Read": "Чтение", "Workout": "Тренировка", "Breathe": "Дыхание", "Meditate": "Медитация", "Sleep": "Сон", "Lunch": "Обед", "Dinner": "Ужин", "Breakfast": "Завтрак",
    "add a habit / activity": "добавить привычку / занятие", "add your own…": "добавь своё…", "name it once…": "назови один раз…", "name it (e.g. Climbing, Therapy)…": "назови (напр. Скалолазание, Терапия)…",
    "Redo setup": "Перенастроить", "Back up your life": "Сохрани свою жизнь", "Copy": "Копировать", "Download": "Скачать", "Restore": "Восстановить", "Test the brain": "Проверить мозг",
    "your mirror — it grows when you do": "твоё зеркало — оно растёт вместе с тобой", "Set up your world →": "Настрой свой мир →"
  });
  Object.assign(I18N.ru, {"(mood only)": "(только настроение)", "+ add activity": "+ добавить занятие", "+5 min": "+5 мин", ", I deeply and completely accept myself.": ", я глубоко и полностью принимаю себя.", "-day thread, still going.": "-дневная нить, всё ещё тянется.", ". I'm with you — what matters now?": ". Я рядом — что сейчас важно?", ". I've got the morning — rest now.": ". Утро на мне — отдыхай.", ". Streak safe.": ". Серия цела.", "/wk": "/нед", "0 attention span? pick “often” — I’ll gently bring you back every few seconds, so you can’t fail.": "Совсем не можешь сосредоточиться? Выбери «часто» — я буду мягко возвращать тебя каждые пару секунд, провалиться невозможно.", "10 min": "10 мин", "2 min": "2 мин", "2-min breath": "Дыхание 2 мин", "2× wk": "2×/нед", "3× wk": "3×/нед", "4× wk": "4×/нед", "5 min": "5 мин", "5× wk": "5×/нед", "60 seconds: who you're being, your one thing, gratitude — then I frame your day.": "60 секунд: кем ты будешь, твоё главное, благодарность — и я настрою день.", "6× wk": "6×/нед", "9-to-5 job": "Работа 9–18", "A Black Sun rises": "Восходит Чёрное солнце", "A STRENGTH TO LEAN ON": "СИЛА, НА КОТОРУЮ ОПЕРЁШЬСЯ", "A couple of plans drifted past — what does that tell you about today, gently?": "Пара планов уплыла мимо — что это мягко говорит о твоём дне?", "A few big breaths… in through the nose, out through the mouth": "Несколько глубоких вдохов… носом вдох, ртом выдох", "A free, open day — that's allowed too.": "Свободный, открытый день — так тоже можно.", "A free-form day — nothing was on the books, and that's fine. Rest is part of the work.": "Свободный день — в планах ничего, и это нормально. Отдых тоже работа.", "A fresh page today.": "Сегодня чистый лист.", "A line about today is enough. What stood out?": "Хватит и строчки о сегодня. Что запомнилось?", "A little about you": "Немного о тебе", "A plan or two slid by": "Пара планов проскользнула мимо", "A plan or two slid by today — anything worth noticing about why?": "Пара планов сегодня проскользнула мимо — есть что заметить о причинах?", "A quiet beach": "Тихий берег", "A quiet day. What's one thing you'd like tomorrow to hold?": "Тихий день. Что одно ты хотел бы оставить на завтра?", "A soft day — and rest is part of the work, not a gap in it.": "Тихий день — и отдых это часть работы, а не дыра в ней.", "A soft day — and rest is part of the work. What would you like tomorrow to hold?": "Тихий день — а отдых это часть работы. Что хотел бы оставить на завтра?", "A virtue": "Добродетель", "AGE": "ВОЗРАСТ", "About": "Около", "Active Love": "Активная любовь", "Add": "Добавить", "Add a step to": "Добавить шаг к", "Add habits ✨": "Добавить привычки ✨", "Adjust": "Поправить", "Already waiting tomorrow:": "Уже ждёт на завтра:", "Always": "Всегда", "And it stays with you, long after you open your eyes.": "И это остаётся с тобой надолго после того, как ты откроешь глаза.", "Anything left undone to carry into tomorrow? (Set it down here so you can rest.)": "Осталось что-то незакрытое на завтра? (Выгрузи сюда — и отдыхай.)", "Architect": "Архитектор", "Arrange them": "Расставь их", "Arrange your day": "Собери свой день", "Athlete": "Атлет", "Attune to the quality of self inside your feet": "Почувствуй себя внутри своих стоп", "Avoiding it? → reverse the desire": "Откладываешь? → разверни желание", "Avoiding something": "Что-то избегаю", "Awaken ✨": "Пробудиться ✨", "Awakening": "Пробуждение", "Awareness is already present — you don't make it happen": "Осознанность уже здесь — её не нужно создавать", "Back to it": "Вернуться к делу", "Become who you're being": "Стать тем, кем ты становишься", "Been meaning to": "Давно собирался", "Begin": "Начать", "Begin feeling →": "Начать чувствовать →", "Begin your character": "Создай своего персонажа", "Begin ▶": "Начать ▶", "Black Sun": "Чёрное солнце", "Bold": "Смелый", "Brain — free": "Мозг — бесплатно", "Break": "Перерыв", "Break down:": "Разбить:", "Breakfast": "Завтрак", "Breathe": "Дыхание", "Breathe in": "Вдох", "Breathe out": "Выдох", "Breathe with me": "Подыши со мной", "Breathe with me ▶": "Дыши со мной ▶", "Build your self-map": "Составь карту себя", "Calm": "Спокойный", "Calm, even breath — nothing happening but this breath": "Спокойное, ровное дыхание — есть только оно", "Capture": "Поймать мысль", "Capture it 💡": "Записать 💡", "Captured": "Записано", "Caregiver": "Забочусь о близких", "Carried to tomorrow — it'll be waiting.": "Перенёс на завтра — будет ждать.", "Carry forward": "Перенести", "Carry it into the next thing": "Перенеси это в следующее дело", "Carry to tomorrow": "На завтра", "Chin": "Подбородок", "Claim it": "Засчитать", "Clean Space": "Чистое пространство", "Clear": "Ясно", "Clear the mind": "Очистить ум", "Close": "Закрыть", "Close the day 🌙": "Завершить день 🌙", "Close with gratitude": "Заверши благодарностью", "Coasting": "Плыву по течению", "Collarbone": "Ключица", "Come down into your feet — deep contact": "Опустись вниманием в стопы — глубокий контакт", "Coming back up… 1": "Поднимаемся обратно… 1", "Commit to today": "Возьми курс на сегодня", "Concentration": "Концентрация", "Connector": "Связной", "Continue": "Продолжить", "Courage": "Смелость", "Create plan": "Создать план", "Creative": "Творческий", "Creator": "Творец", "Curiosity": "Любопытство", "Daily": "Каждый день", "Day ×": "День ×", "Decide it now, while you're calm — so tomorrow-you wakes to it already chosen.": "Реши сейчас, на спокойную голову — чтобы завтрашний ты проснулся с уже готовым выбором.", "Deep Focus": "Глубокий фокус", "Deep work": "Глубокий фокус", "Developer": "Разработчик", "Dinner": "Ужин", "Discipline": "Дисциплина", "Disciplined": "Дисциплинированный", "Do it now ▶": "Сделать сейчас ▶", "Done": "Готово", "Done for now ✓": "Пока хватит ✓", "Done ✓": "Готово ✓", "Done 🙏": "Готово 🙏", "Down the steps… 10": "Вниз по ступеням… 10", "Drag ⠿ to reorder · tap a length · set what matters most. They land back-to-back from your next free slot — fine-tune times on the timeline.": "Тащи ⠿, чтобы переставить · тапни длину · отметь, что важнее. Они встанут друг за другом с ближайшего свободного окна — точное время поправишь на таймлайне.", "Draining my drive": "Высасывает запал", "Drink water": "Выпить воды", "Drop your shoulders": "Опусти плечи", "EFT — tap the points, let it move through you": "EFT — простукивай точки, дай этому пройти сквозь тебя", "EVERYTHING ELSE": "ВСЁ ОСТАЛЬНОЕ", "Eat healthier": "Питаться лучше", "End": "Закончить", "End break": "Закончить перерыв", "Energy": "Энергия", "Energy · Family · Service — who you're BEING, why, what you'll do.": "Энергия · Семья · Служение — кем ты БУДЕШЬ, зачем, что сделаешь.", "Even one thing kept is a vote for who you're becoming.": "Даже одно удержанное дело — голос за того, кем ты становишься.", "Even though I feel": "Хоть я и чувствую", "Evening Reflection": "Вечернее размышление", "Evening — close the day well.": "Вечер — закрой день красиво.", "Every mistake is a teacher. If something needs redoing — fantastic.": "Каждая ошибка — учитель. Надо переделать? Отлично.", "Eyebrow": "Бровь", "Eyes open, soft gaze": "Глаза открыты, взгляд мягкий", "Feel calmer": "Стать спокойнее", "Feel him scream at you": "Услышь, как он кричит тебе", "Feel it through": "Прожить это", "Feel that sense of space with each exhale": "Чувствуй простор с каждым выдохом", "Feel that you ARE that space": "Почувствуй, что ты И ЕСТЬ это пространство", "Feel the bond": "Почувствуй связь", "Feel the forward motion": "Почувствуй движение вперёд", "Feel the void underneath": "Почувствуй пустоту под этим", "Feel the weight of the body pressing down": "Почувствуй, как тело давит вниз своим весом", "Feel yourself sitting here": "Почувствуй, как ты сидишь здесь", "Felt it ✓": "Почувствовал ✓", "Figuring it out": "Ещё разбираюсь", "Find love": "Найти любовь", "Find the breath rising and falling": "Найди дыхание — как оно поднимается и опадает", "Find the breath — the tip of the nose, or the belly": "Найди дыхание — у кончика носа или в животе", "Find the space outside your body, in the room": "Почувствуй пространство вокруг тела, в комнате", "Finding my rhythm": "Нащупываю ритм", "Finish ✓": "Завершить ✓", "First — let's get the body back online": "Сначала — вернём тело в строй", "First — one thing you're grateful for, right now.": "Сначала — за что ты благодарен прямо сейчас.", "First, clear what's live": "Сначала разберись с тем, что горит", "Five specific things — one at a time, felt, not a dry list.": "Пять конкретных вещей — по одной, прочувствованно, не сухой список.", "Five specific things — one at a time. Don't list; FEEL each one for a breath before the next.": "Пять конкретных вещей — по одной. Не перечисляй, ПОЧУВСТВУЙ каждую на вдох, прежде чем идти дальше.", "Five-Minute Foundation": "Фундамент за пять минут", "Focused": "Сосредоточенный", "Foggy": "Туман", "Founder": "Фаундер", "Frame the day": "Настрой день", "Free / Adaptive": "Свободно / Под тебя", "Freelancer": "Фрилансер", "Fun-Do List": "Список в радость", "Fun-do": "В радость", "Game": "Игра", "Get an idea out of your head and onto the page.": "Выгрузи идею из головы на бумагу.", "Get coffee": "Кофе", "Get comfy…": "Устройся поудобнее…", "Get fit": "Прийти в форму", "Get it out of your head and onto the page. Capture the idea — clear the RAM.": "Выгрузи из головы на бумагу. Поймай мысль — освободи оперативку.", "Give that energy outward": "Отдай эту энергию наружу", "Goals": "Цели", "Good afternoon": "Добрый день", "Good evening": "Добрый вечер", "Good morning": "Доброе утро", "Good morning — let's recommit.": "Доброе утро — давай настроимся заново.", "Good morning.": "Доброе утро.", "Good morning. A fresh page — who are you today?": "Доброе утро. Чистый лист — кто ты сегодня?", "Grace": "Лёгкость", "Grateful": "Благодарный", "Grateful Flow": "Поток благодарности", "Grateful for": "Благодарен за", "Gratitude": "Благодарность", "Great at": "Силён в", "Groq · free": "Groq · бесплатно", "Grow my audience": "Растить аудиторию", "Grow my business": "Растить бизнес", "Habit": "Привычка", "Healthcare": "Медицина", "Heavy": "Тяжело", "Hey": "Привет", "Hi, I'm Sage.": "Привет, я Сейдж.", "Hobby": "Хобби", "Hold": "Задержи", "Homemaker": "Домашние дела", "Hope": "Надежда", "How connected are you with loved ones?": "Насколько ты близок с дорогими людьми?", "How consistent are your mornings & planning?": "Насколько стабильны твои утра и планирование?", "How dialed-in are your sleep & food?": "Насколько у тебя налажены сон и питание?", "How do you want to journal?": "Как хочешь записать?", "How much do you read & learn?": "Сколько ты читаешь и учишься?", "How often do you make or create things?": "Как часто ты что-то создаёшь?", "How often do you ship / put work out there?": "Как часто ты выпускаешь работу в мир?", "How often do you work out?": "Как часто ты тренируешься?", "How present & grateful do you feel?": "Насколько ты в моменте и благодарен?", "How strong is your deep-work focus?": "Насколько силён твой фокус в глубокой работе?", "How tidy do you keep your space?": "Насколько ты держишь порядок вокруг?", "How's life feeling?": "Как тебе живётся?", "I USUALLY SLEEP": "ОБЫЧНО ЛОЖУСЬ", "I USUALLY WAKE": "ОБЫЧНО ВСТАЮ", "I am athletic, intelligent, loving, and ambitious —": "Я спортивный, умный, любящий и амбициозный —", "I am indifferent to others' opinions of me.": "Мне всё равно, что обо мне думают.", "I am joyful, connected, and encouraging.": "Я радостен, близок с людьми и вдохновляю их.", "I am the master of my life,": "Я хозяин своей жизни", "I am the sole authority on what is best for me.": "Только я знаю, что для меня лучше.", "I am willing to act in the presence of fear.": "Я готов действовать даже в присутствии страха.", "I appreciate all the blessings and gifts in my life.": "Я ценю все дары и блага в своей жизни.", "I bring joy to others. My aura radiates positivity.": "Я дарю радость другим. От меня исходит свет.", "I bumped": "Я сдвинул", "I come alive when…": "я оживаю, когда…", "I deserve the very best.": "Я достоин самого лучшего.", "I do not judge reality; I accept it.": "Я не сужу реальность — я принимаю её.", "I dominate my fundamentals so I have Heroic energy.": "Я держу основы на максимуме — и потому полон героической энергии.", "I embrace my mistakes and imperfections fully,": "Я полностью принимаю свои ошибки и несовершенства", "I feel it ▶": "Чувствую ▶", "I find joy within myself, and don't take things too seriously.": "Я нахожу радость в себе и не воспринимаю всё слишком серьёзно.", "I forge antifragile confidence with every action I take.": "С каждым действием я кую несокрушимую уверенность.", "I have absolute trust in myself.": "Я полностью доверяю себе.", "I have inspiring goals, agency, and pathways.": "У меня есть вдохновляющие цели, воля и пути к ним.", "I hold deep respect for myself": "Я глубоко уважаю себя", "I keep some days, drop others": "Где-то держусь, где-то срываюсь", "I know the ultimate game and how to play it well.": "Я знаю главную игру и умею играть в неё хорошо.", "I love": "Люблю", "I love myself unconditionally.": "Я люблю себя безусловно.", "I mostly follow through": "В основном довожу до конца", "I pay attention to what's working and what needs work.": "Я замечаю, что работает, а над чем стоит поработать.", "I push beyond my comfort zone every single day.": "Каждый день я выхожу за пределы зоны комфорта.", "I vow to keep evolving — never ceasing to improve.": "Я обещаю расти — и никогда не переставать становиться лучше.", "I want to build the basics": "Хочу заложить базу", "I will do whatever it takes to become a greater man.": "Я сделаю всё, чтобы стать сильнее как человек.", "I'd improve (kindly)": "Подправил бы (по-доброму)", "I'll place these on your timeline and carry your intention through the day.": "Я расставлю это на твоей ленте и пронесу твоё намерение через день.", "I'm already calm — skip to labeling": "Я уже спокоен — сразу к называнию", "I'm grateful for…": "Я благодарен за…", "I'm here. What matters now?": "Я здесь. Что сейчас важно?", "If-then plans are how intentions become action.": "Планы «если-то» превращают намерения в действия.", "Inhabit your belly — attune to the quality of power there": "Войди в живот — почувствуй силу, что живёт там", "Inhabit your chest — attune to the quality of love": "Войди в грудь — почувствуй любовь, что живёт там", "Inhabit your legs… your hips… settle down into them": "Войди в ноги… в бёдра… опустись в них", "Inhabit your whole body at once — this is yours": "Войди во всё тело сразу — оно твоё", "Inner Authority": "Внутренняя опора", "Inside and outside are one continuous space": "Внутри и снаружи — одно непрерывное пространство", "It fills you from inside": "Оно наполняет тебя изнутри", "It varies": "По-разному", "It's late — let's wind down.": "Уже поздно — давай расслабляться.", "Jeopardy": "На кону", "Job-seeking": "В поиске работы", "Journey": "Путь", "Just rest as awareness": "Просто будь осознанностью", "Just starting": "Только начинаю", "Just track": "Просто трекать", "Just track instead": "Лучше просто трекать", "Keystone #": "Опора №", "Keystone Habits": "Опорные привычки", "Last night you set: “{int}”. Still your one thing?": "Вчера вечером ты задал: «{int}». Всё ещё твоё главное?", "Last time you chose:": "В прошлый раз ты выбрал:", "Learn a skill": "Освоить навык", "Let each sound reveal the space it appears in": "Пусть каждый звук покажет пространство, в котором звучит", "Let everything be exactly as it is, right now": "Пусть всё будет ровно так, как есть, прямо сейчас", "Let go": "Отпустить", "Let go — no trace, no weight.": "Отпустил — ни следа, ни груза.", "Let gravity settle you into your seat": "Пусть тяжесть мягко усадит тебя", "Let it rise": "Дай этому подняться", "Let the body soften with each out-breath": "Пусть тело расслабляется с каждым выдохом", "Let the breath move gently through the heart": "Пусть дыхание мягко проходит через сердце", "Let your arms go heavy": "Пусть руки станут тяжёлыми", "Let your body settle": "Дай телу осесть", "Let's close the day.": "Завершим день.", "Let's close the day. Rest is part of the work.": "Завершим день. Отдых — тоже часть работы.", "Let's go ▸": "Поехали ▸", "Let's set who you wake as.": "Давай решим, кем ты проснёшься.", "Lift the lens": "Сменить оптику", "Load game": "Загрузить игру", "Lock it": "Закрепить", "Lock my keystones 🗝️": "Закрепить опоры 🗝️", "Love": "Любовь", "Love × great-at × world-needs → your one thing.": "Любишь × силён × нужно миру → твоё главное.", "Loving": "Любящий", "Low on fuel today — let's settle the body first. Everything else can wait.": "Сегодня мало сил — сначала успокоим тело. Остальное подождёт.", "Lunch": "Обед", "Make art": "Творить", "Make the bed": "Заправить кровать", "Make your best your new baseline — these are the three to protect.": "Сделай свой максимум новой нормой — вот три привычки, которые стоит беречь.", "Manager": "Менеджер", "Mantra": "Мантра", "Mastered ✓ · Rank": "Освоено ✓ · Ранг", "Meditate": "Медитация", "Meditation ·": "Медитация ·", "Micro-wins to do today — not a to-do list. Cross them off.": "Микропобеды на сегодня — не список дел. Вычёркивай их.", "Mindful moment": "Минутка осознанности", "Mindfulness check": "Проверка осознанности", "Mood:": "Настроение:", "Morning": "Утром", "Morning bookend 🌅": "Утренний ритуал 🌅", "Morning recommit": "Утреннее обновление обета", "Morning recommit ☀️": "Утренний настрой ☀️", "Move": "Размяться", "Musician": "Музыкант", "My #1 thing": "Моё главное", "My instincts are unerring, my thoughts are clear,": "Моё чутьё безошибочно, мысли ясны,", "My life is phenomenal — spontaneous and overflowing with love.": "Моя жизнь восхитительна — спонтанна и полна любви.", "My one thing": "Моё главное", "NOW": "СЕЙЧАС", "Name it — that's the skill": "Назови это — в этом и навык", "Name tomorrow's one thing.": "Назови главное на завтра.", "New": "Новое", "New activity": "Новое занятие", "New game": "Новая игра", "Next": "Дальше", "Next role →": "Следующая роль →", "Next — savor it 🙏": "Дальше — насладись 🙏", "Next →": "Дальше →", "Next ▶": "Дальше ▶", "Next ▸": "Дальше ▸", "Next:": "Дальше:", "Next: everything else": "Дальше: всё остальное", "Night": "Ночью", "No judgment — what would've made it 10% easier to show up?": "Без осуждения — что сделало бы появиться на 10% легче?", "No need to control it — just let it come and go": "Не управляй им — просто позволь приходить и уходить", "No plan yet — what's today at its best?": "Плана пока нет — каким сегодня может быть лучший день?", "No reflections yet — your first one starts the thread.": "Размышлений пока нет — первое запустит нить.", "Not a to-do list — a FUN-do list. Small wins you'll enjoy crossing off today.": "Не список дел, а список в радость. Маленькие победы, которые приятно вычеркнуть сегодня.", "Not mine": "Не моё", "Not the watcher, not the witness — just resting": "Не наблюдатель, не свидетель — просто покой", "Not the world — the inner block: the habit, fear, story.": "Не внешний мир — внутренний стопор: привычка, страх, история в голове.", "Nothing falls outside this — just be aware": "Ничто не остаётся вне этого — просто будь осознан", "Nothing for the mind to do… and that's okay": "Уму нечем заняться… и это нормально", "Nothing logged yesterday — a fresh page today.": "Вчера ничего не записано — сегодня чистая страница.", "Nothing matches that.": "Ничего не нашлось.", "Nothing picked — plan whenever you're ready.": "Ничего не выбрано — спланируешь, когда будешь готов.", "Nothing to change — just noticing how the body feels": "Ничего не меняй — просто замечай, как чувствует себя тело", "Nothing to do, nothing to respond to — just time for you": "Ничего не нужно делать, не на что отвечать — это время для тебя", "Nothing to re-story — you stayed close to the plan.": "Переписывать нечего — ты держался плана.", "Nothing written that day.": "В тот день ничего не записано.", "Notice a thought arise… and watch where it goes": "Заметь, как рождается мысль… и проследи, куда она уходит", "Notice the sounds — they arise on their own": "Заметь звуки — они возникают сами собой", "Now": "Сейчас", "Now let the mind be completely free": "А теперь отпусти ум совсем", "OBSTACLE — what INSIDE you gets in the way?": "ПРЕПЯТСТВИЕ — что ВНУТРИ тебя мешает?", "OUTCOME — picture it done. How does it look & feel?": "РЕЗУЛЬТАТ — представь, что готово. Как это выглядит и ощущается?", "Obstacle (inner)": "Препятствие (внутри)", "Off": "Выкл", "Often": "Часто", "Okay": "Нормально", "On this day": "В этот день", "On track. Nice.": "Идёшь по плану. Класс.", "One good thing happened today, even a small one — what was it?": "Сегодня случилось что-то хорошее, пусть и маленькое — что именно?", "One gratitude": "Одна благодарность", "One honest line.": "Одна честная строчка.", "One mindful moment": "Один осознанный миг", "One on the in-breath… two on the out-breath": "Раз на вдохе… два на выдохе", "One slow breath first": "Сначала один медленный вдох", "One thing:": "Главное:", "Open eyes ✓": "Открыть глаза ✓", "Open reflection — the angel mirrors your patterns and asks.": "Открытое размышление — хранитель отражает твои паттерны и спрашивает.", "OpenRouter · free": "OpenRouter · бесплатно", "Other": "Другое", "Outcome": "Результат", "Over by": "Перебор на", "Overwhelmed": "Накрывает", "PLAN": "ПЛАН", "PLAN — an if-then: when the obstacle hits, I will…": "ПЛАН — если-то: когда помеха придёт, я…", "Parent": "Родитель", "Part X is the part that pulls you off. It's not you. Which one's loud?": "Часть Х — это то, что сбивает тебя с пути. Это не ты. Что сейчас громче?", "Pause": "Пауза", "Penetration": "Проникновение", "Phone down 10m": "Без телефона 10м", "Pick a way in — or just write. There's no one right way; find yours.": "Выбери подход — или просто пиши. Правильного способа нет, найди свой.", "Pick one meaningful, challenging-but-doable goal.": "Возьми одну значимую цель — непростую, но достижимую.", "Pick your habits ✨": "Выбери привычки ✨", "Picture yourself moving through your day steady, capable, and at ease.": "Представь, как проживаешь свой день — устойчиво, уверенно и спокойно.", "Plan": "Запланировать", "Plan (if-then)": "План (если-то)", "Plan now — what, for how long?": "Спланировать сейчас — что и насколько?", "Plan the rest of my day ☀️": "Спланировать остаток дня ☀️", "Plan today ☀️": "Спланировать день ☀️", "Plan tomorrow": "Спланировать завтра", "Plan what?": "Что планируем?", "Plan your day": "Спланируй день", "Plan your first day ▸": "Спланируй первый день ▸", "Planner": "Планер", "Pretty steady": "Довольно стабильно", "Project your Shadow": "Спроецируй свою Тень", "Pulling me to numb out": "Тянет отключиться", "Purpose": "Призвание", "Quick stretch": "Быстрая растяжка", "Quit a bad habit": "Бросить вредную привычку", "REAL": "БЫЛО", "Radiant": "Сияю", "Rarely": "Редко", "Re-story the drift.": "Перепиши историю.", "Reach someone": "Связаться с кем-то", "Read more": "Больше читать", "Really visualize the best result of achieving it.": "По-настоящему вообрази лучший итог.", "Recent": "Недавнее", "Reflection": "Размышление", "Reflection 🌙": "Размышление 🌙", "Relax all muscles": "Расслабить все мышцы", "Relax…": "Расслабься…", "Release your legs": "Отпусти ноги", "Relinquish the doer — pat it on the head, it's irrelevant": "Отпусти того, кто делает — потрепи его по голове, он тут лишний", "Remote worker": "Удалёнка", "Replan": "Перепланировать", "Replan from now — what, for how long?": "Перепланировать с этого момента — что и насколько?", "Rest": "Покой", "Rest now": "Отдыхать", "Resume": "Продолжить", "Retired": "На пенсии", "Reversal of Desire": "Разворот желания", "Review today": "Посмотреть сегодня", "Right call": "Так и надо", "Right call — kept as a conscious choice.": "Так и надо — это был осознанный выбор.", "Right now": "Прямо сейчас", "Right now, in this relaxed state, your mind is open and receptive.": "Прямо сейчас, в этом покое, твой ум открыт и восприимчив.", "SHARPEST": "БОДРЕЕ ВСЕГО", "Sales / Biz": "Продажи / Бизнес", "Save": "Сохранить", "Save money": "Копить", "Save my fun-do 🎉": "Сохранить список в радость 🎉", "Save my purpose 🧭": "Сохранить призвание 🧭", "Save the Big 3 🎯": "Сохранить Большую тройку 🎯", "Save the foundation 🌅": "Заложить фундамент 🌅", "Save the morning ☀️": "Сохранить утро ☀️", "Save your WOOP 🎈": "Сохранить WOOP 🎈", "Save — let it land 🙏": "Сохранить — пусть осядет 🙏", "Say a little more — what's the part of that you'd want tomorrow-you to remember?": "Расскажи чуть больше — что из этого завтрашний ты захотел бы помнить?", "Scholar": "Учёный", "See the pain as a cloud": "Увидь боль как облако", "See your best self today — and the small steps from here to there. (Science: imagining your best self reliably lifts optimism & hope.)": "Представь себя в лучшей форме сегодня — и маленькие шаги до туда. (Наука: образ лучшего себя реально поднимает оптимизм и надежду.)", "See your best self today — gratitude, your #1 thing, who you're being.": "Увидь себя лучшего сегодня — благодарность, главное дело, кем ты будешь.", "Self-Hypnosis": "Самогипноз", "Service / Hospitality": "Сервис / Общепит", "Set it for tomorrow": "Назначить на завтра", "Set up your world →": "Настроить свой мир →", "Settle in…": "Устройся…", "Setup — side of hand": "Настройка — ребро ладони", "Shipper": "Выпускающий", "Side of eye": "Уголок глаза", "Simply witness whatever arises and passes": "Просто наблюдай, как всё приходит и уходит", "Skincare": "Уход за кожей", "Skip": "Пропустить", "Sleep better": "Лучше спать", "Snack": "Перекус", "Soft focus — just aware of the space around you": "Мягкий взгляд — просто чувствуй пространство вокруг", "Soften your chest": "Расслабь грудь", "Soften your forehead": "Расслабь лоб", "Something went right today — what was it, even a small thing?": "Сегодня что-то удалось — что именно, пусть и мелочь?", "Sometimes": "Иногда", "Spark": "Искры", "Stalled right after a win": "Заглох сразу после победы", "Stand & move": "Встать и размяться", "Start": "Начать", "Start now": "Начать сейчас", "Start over": "Начать заново", "Steady the body": "Успокоить тело", "Step outside": "Выйти на воздух", "Still true?": "Всё ещё так?", "Stock your life ✨": "Наполни жизнь ✨", "Stop": "Стоп", "Stretch": "Растяжка", "Stuck": "Застрял", "Stuck on a hurt": "Застрял на обиде", "Student": "Студент", "Stutz & Michels' practice — name a few specific things. small is good.": "практика Стаца и Майклза — назови несколько конкретных вещей. мелочи тоже считаются.", "Switch to?": "Переключиться на?", "Switch to…": "Переключиться на…", "Take a slow breath": "Сделай медленный вдох", "Tap a day": "Тапни день", "Tap again to erase EVERYTHING": "Жми ещё раз, чтобы стереть ВСЁ", "Tap each point ~7× with two fingers. No need to believe it — just tap and say the words.": "Простучи каждую точку ~7 раз двумя пальцами. Верить необязательно — просто стучи и проговаривай.", "Tapping (EFT)": "Тэппинг (EFT)", "Teacher": "Учитель", "Text back": "Ответить в чате", "That's Part X — a hurt that hardened. Not you.": "Это Часть Х — обида, что окаменела. Не ты.", "That's Part X — avoidance. Not you.": "Это Часть Х — избегание. Не ты.", "That's Part X — lethargy. Not you.": "Это Часть Х — вялость. Не ты.", "That's Part X — the exoneration fantasy. Not you.": "Это Часть Х — иллюзия «я заслужил отдых». Не ты.", "That's Part X — the pull to numb. Not you.": "Это Часть Х — тяга отключиться. Не ты.", "That's the day, well closed.": "Вот и день — закрыт как надо.", "The 3 habits you do on your BEST days. Make your best your baseline.": "Три привычки твоих ЛУЧШИХ дней. Сделай максимум нормой.", "The Big 3": "Большая тройка", "The Brave": "Храбрец", "The Disciplined": "Дисциплинированный", "The Explorer": "Исследователь", "The Grateful": "Благодарный", "The Hopeful": "Надеющийся", "The Lover": "Любящий", "The Sage": "Мудрец", "The Vital": "Живчик", "The Vortex": "Вихрь", "The day drifted for a bit": "День немного унесло в сторону", "The day took its own route for a stretch — no judgment, what was calling you?": "День какое-то время шёл своей дорогой — без осуждения, что тебя звало?", "The day went its own way for a bit — what pulled your attention?": "День ненадолго свернул не туда — что перетянуло внимание?", "The mind says 'understand one more thing' — don't take the bait": "Ум твердит «пойми ещё одну вещь» — не ведись", "The reading room": "Комната для чтения", "There's nothing to do here": "Здесь нечего делать", "They begin to rise": "Они начинают подниматься", "They grow and expand": "Они растут и ширятся", "They're out of your head": "Он вышел из твоей головы", "Think of a day you were genuinely at your best. What did you DO that day? Name the habit that, if you'd guess, was behind it.": "Вспомни день, когда ты был в лучшей форме. Что ты тогда ДЕЛАЛ? Назови привычку, которая, кажется, за этим стояла.", "This REPLACES all your current data with this backup — continue?": "Это ПЕРЕЗАПИШЕТ все твои данные этим бэкапом — продолжить?", "This is simply who you are now — it needs no effort, it's already yours.": "Это просто то, кто ты есть теперь — без усилий, это уже твоё.", "This morning you leaned toward “{int}” — how did that land?": "Утром ты тянулся к «{int}» — как оно вышло?", "This morning you reached for “{int}” — how did living it feel?": "Утром ты потянулся к «{int}» — каково было этим жить?", "This week — tap a day": "Эта неделя — тапни день", "Thoughts come — that's fine. Gently back to the breath": "Мысли приходят — и ладно. Мягко вернись к дыханию", "Thriving": "На подъёме", "Tidy 5m": "Прибраться 5м", "Tidy one thing": "Прибрать одну вещь", "Tidy up — one step at a time": "Прибраться — по шагу за раз", "Tidy up 🧹": "Прибраться 🧹", "Today": "Сегодня", "Together: “LISTEN!”": "Вместе: «СЛУШАЙ!»", "Tomorrow opens with one clear move:": "Завтра начнётся с одного ясного шага:", "Top of head": "Макушка", "Toward": "К цели:", "Tracking": "Идёт отсчёт", "Tracking…": "Идёт отсчёт…", "Trades / Hands-on": "Руками / Ремесло", "Transmission": "Передача", "Twelve suns around you": "Двенадцать солнц вокруг тебя", "Under arm": "Под мышкой", "Under eye": "Под глазом", "Under nose": "Под носом", "Unstoppable": "Неудержимый", "Use it ▶": "Использовать ▶", "Use the spark": "Используй искру", "Use the tool ▶": "Использовать инструмент ▶", "Vitamins": "Витамины", "WISH — your #1 most important thing right now.": "ЖЕЛАНИЕ — самое важное для тебя прямо сейчас.", "Wake as": "Проснуться как", "Wake as someone…": "Проснуться кем-то…", "Water": "Вода", "Week of": "Неделя с", "Well-Fed": "Хорошо питается", "Went well": "Получилось", "What are you doing?": "Чем ты занят?", "What are you working toward?": "К чему ты идёшь?", "What could you be GREAT at?": "В чём ты можешь стать ЛУЧШИМ?", "What do you LOVE to do?": "Что ты ОБОЖАЕШЬ делать?", "What does the WORLD need (and pay for)?": "Что нужно МИРУ (и за что платят)?", "What is it?": "Что это?", "What made that click — and how would you set up tomorrow to repeat it?": "Что сработало — и как настроить завтра, чтобы повторить?", "What makes that morning anchor hard to keep — and what would make it easier tomorrow?": "Почему утренний якорь так сложно удержать — и что облегчило бы его завтра?", "What slid by isn't a verdict — it's a choice you get to make now.": "То, что упустил, — не приговор, а выбор, который можешь сделать сейчас.", "What took the most out of you — and what, even small, would refill the tank?": "Что вымотало сильнее всего — и что, пусть мелочь, наполнило бы бак?", "What went WELL today? (Even one small thing — wins count.)": "Что сегодня ПОЛУЧИЛОСЬ? (Даже мелочь — победа есть победа.)", "What went well · what you'd improve · what to carry. No guilt.": "Что получилось · что подправил бы · что перенести. Без вины.", "What were you doing?": "Чем ты был занят?", "What will you DO today?": "Что ты СДЕЛАЕШЬ сегодня?", "What would I do if I wasn't afraid?": "Что бы я сделал, если бы не боялся?", "What would you do a little better next time? Curious, not critical — win or learn, never lose.": "Что в следующий раз сделал бы чуть лучше? С интересом, без упрёка — побеждаешь или учишься, проигрыша нет.", "What's loud right now?": "Что сейчас громче всего?", "What's next?": "Что дальше?", "What's the one move today that future-you would thank you for?": "Какой один шаг сегодня — за который будущий ты скажет спасибо?", "What's the plan?": "Что планируем?", "What's underneath that — and what's the one piece that's actually yours to move?": "Что под этим — и какая часть реально в твоих руках?", "What's your life like?": "Какая у тебя жизнь?", "What's your work?": "Чем ты занимаешься?", "When it slips, what's usually in the way — and is the plan-time even the right one?": "Когда срывается — что обычно мешает? И вообще, время в плане то самое?", "When the mind wanders, gently bring it back to the breath": "Ум уплыл? Мягко верни его к дыханию", "Whenever you've drifted, simply rest again": "Уплыл? Просто снова отпусти себя в покой", "Where are you starting?": "С чего начинаешь?", "Where they overlap — your ONE thing.": "Где всё сходится — твоё ГЛАВНОЕ.", "Which virtues?": "Какие добродетели?", "Who I'm being": "Кем я являюсь", "Who are you becoming?": "Кем ты становишься?", "Who are you being today?": "Кем ты будешь сегодня?", "Who are you committed to BEING here?": "Кем ты решил здесь БЫТЬ?", "Who are you today?": "Кто ты сегодня?", "Who do you want to be today?": "Кем ты хочешь быть сегодня?", "Why does it matter?": "Почему это важно?", "Willingness": "Готовность", "Wind down": "Расслабиться перед сном", "Wind down 😴": "Расслабиться 😴", "Wisdom": "Мудрость", "Wish": "Желание", "Wish · Outcome · Obstacle · Plan — for your #1 goal.": "Желание · Результат · Препятствие · План — для главной цели.", "With every breath, that calm, capable feeling grows stronger and more natural.": "С каждым вдохом это спокойное, уверенное чувство крепнет и становится всё естественнее.", "Work": "Работа", "World needs": "Миру нужно", "Writer": "Писатель", "YOU ARE": "ТЫ", "YOUR ONE THING TODAY": "ТВОЁ ГЛАВНОЕ НА СЕГОДНЯ", "You and awareness are not two": "Ты и осознанность — не двое", "You came back. That bounce — not the streak — is the skill.": "Ты вернулся. Этот отскок, а не серия, и есть навык.", "You keep planning “{t}” for {time}, but it tends to land about {n} min later. Worth a look?": "Ты всё планируешь «{t}» на {time}, но обычно это случается примерно на {n} мин позже. Стоит присмотреться?", "You kept the thread going — what made showing up feel possible today?": "Ты удержал нить — что сделало возможным появиться сегодня?", "You kept the thread today — what made it feel doable?": "Сегодня ты удержал нить — что сделало это посильным?", "You met the day and named what mattered. Rest now — I've got the morning.": "Ты прожил день и назвал то, что важно. Отдыхай — утро на мне.", "You poured real hours in today — what part of that felt most like you?": "Сегодня ты вложил настоящие часы — какая их часть была больше всего тобой?", "You put real time in today — what felt best about it?": "Сегодня ты вложил реальное время — что в этом было лучше всего?", "You showed up for": "Ты выложился на", "You're being": "Ты сейчас —", "You're on a roll — what's been keeping the momentum going?": "Ты на ходу — что держит этот разгон?", "You're set for now — add anything you like below.": "Пока всё схвачено — добавь что угодно ниже.", "Your #1 thing today — the one move future-you would thank you for.": "Главное на сегодня — то, за что будущий ты скажет спасибо.", "Your best days almost all start with a morning {dom}. Worth protecting tomorrow?": "Почти все твои лучшие дни начинаются с утреннего {dom}. Стоит уберечь это завтра?", "Your brighter days tend to have more {dom}. Maybe it's feeding you.": "В твои светлые дни обычно больше {dom}. Похоже, это тебя питает.", "Your character": "Твой персонаж", "Your daily habits": "Твои ежедневные привычки", "Your daily rhythm": "Твой ритм дня", "Your deathbed self": "Ты на смертном одре", "Your one thing": "Твоё главное", "Your path": "Твой путь", "Your toolbox": "Твой набор инструментов", "Your whole body is heavy and calm": "Всё тело тяжёлое и спокойное", "Your world is ready ✨": "Твой мир готов ✨", "Zest": "Задор", "a goal of your own…": "своя цель…", "a grievance is still live — Grateful Flow stays parked until Active Love clears it. that's by design.": "обида ещё жива — Поток благодарности подождёт, пока Активная любовь её не разрядит. так задумано.", "a habit of your own…": "своя привычка…", "a hand-width below the armpit": "на ладонь ниже подмышки", "a line is enough": "хватит и строчки", "a line is enough — or a few": "хватит строчки — или нескольких", "a little win…": "маленькая победа…", "a named feeling (anxious / stuck / frustrated / sad) you want to move through": "конкретное чувство (тревога / тупик / злость / грусть), которое хочешь прожить и отпустить", "a negative-thought loop with no live grievance — light a different room": "петля негативных мыслей без живой обиды — зажги другую комнату", "a still, safe place inside — and here you read the words that take hold": "тихое, безопасное место внутри — здесь ты читаешь слова, которые укореняются", "a warm bed": "тёплая постель", "a year ago": "год назад", "acute stress, a spike, or right before something hard — any transition crash": "острый стресс, всплеск или прямо перед чем-то трудным — любой провал на переходе", "add": "добавить", "add a step": "добавить шаг", "add activity": "добавить занятие", "add all steps": "добавить все шаги", "add another": "добавить ещё", "add your own…": "добавь своё…", "after this — “": "сразу после — «", "age": "возраст", "all the way down now, deeply relaxed, completely at ease": "до самого низа, в глубоком расслаблении, полностью спокоен", "all the way to your feet": "до самых ступней", "an intention": "намерение", "and continue to love who I am.": "и продолжаю любить себя таким, какой есть.", "and my feelings guide me wisely.": "а чувства ведут меня мудро.", "and notice how it feels now": "и заметь, как теперь ощущается", "and unclench your jaw": "и разожми челюсть", "and unwavering confidence in my abilities.": "и непоколебимо верю в свои силы.", "and your belly": "и живот", "anxious": "тревожно", "anything that doesn't fit the Big 3.": "всё, что не вошло в Большую тройку.", "back": "назад", "be specific — a moment, a person, a detail": "конкретнее — момент, человек, деталь", "because I love the craft": "потому что люблю это дело", "because I'd respect myself": "потому что зауважаю себя", "because it feels alive": "потому что так живо", "because it's who I am": "потому что это я", "because…": "потому что…", "bed": "отбой", "before 10": "до 10", "before 6": "до 6", "before a hard conversation or performance, or when you freeze up": "перед трудным разговором или выступлением, или когда тебя клинит", "best things to do from here — tap to drop one in": "лучшее, что можно сделать прямо сейчас — тапни, чтобы добавить", "between nose and lip": "между носом и губой", "break's up": "перерыв окончен", "carry forward…": "перенести на завтра…", "carry it forward": "неси это дальше", "carry the calm with you": "унеси спокойствие с собой", "category": "категория", "choose activity": "выбрать занятие", "close your eyes. don't just think it — feel it land in your body. (": "закрой глаза. не просто думай — почувствуй, как это отзывается в теле. (", "couldn't open that one": "не получилось открыть это", "custom…": "своя…", "cycle": "цикл", "days ago": "дн. назад", "delete": "удалить", "demoralized and stuck — or right after a win, when the work quietly stops": "руки опустились — или сразу после победы, когда работа тихо встаёт", "did it · tap to undo": "сделано · тап, чтобы отменить", "direct that love at the person who wronged you — see them bathed in it. Not forgiving — generating an infinite force, because it serves YOUR liberation": "направь эту любовь на того, кто тебя ранил — увидь его в её свете. Это не прощение — это безграничная сила, и она ради ТВОЕГО освобождения", "discharge it for YOUR liberation — Active Love": "разряди её ради ТВОЕГО освобождения — Активная любовь", "do gratitude anyway": "всё равно к благодарности", "down": "придавлен", "down to your fingertips": "до самых кончиков пальцев", "drifted": "занесло", "drop the shoulders, settle — you can't speak from your core on a wound-up body": "опусти плечи, успокойся — нельзя говорить из глубины с зажатым телом", "duration": "длительность", "e.g. Rock climbing, Volunteer, Therapy…": "напр. скалолазание, волонтёрство, терапия…", "e.g. ship the build": "напр. выкатить сборку", "edit": "править", "embody": "телесность", "engine": "движок", "erase everything on this device and begin from zero. back up first — this can't be undone.": "стереть всё на этом устройстве и начать с нуля. сначала сделай копию — отменить будет нельзя.", "even a tiny one counts": "даже крошечная — уже победа", "feel it grow": "почувствуй, как растёт", "feel love flowing through your whole body — not at anyone yet, just the raw force, radiating from your chest": "почувствуй, как любовь течёт через всё тело — пока ни к кому, просто чистая сила, исходящая из груди", "feel the love enter them and fill them completely — and as it does, feel the Outflow return to you, greater than what you sent": "почувствуй, как любовь входит в него и наполняет целиком — и в этот миг ощути, как поток возвращается к тебе, сильнее, чем ты отдал", "feel yourself pass through and out the far side into light": "почувствуй, как проходишь насквозь и выходишь с другой стороны на свет", "fill the void from the inside, not the screen — Black Sun": "заполни пустоту изнутри, а не экраном — Чёрное солнце", "follow the orb": "следи за шаром", "from that void, an orb of dark light lifts — the compressed Life Force itself": "из этой пустоты поднимается шар тёмного света — сжатая Жизненная сила", "frustrated": "бешусь", "fully aware of what's best for me.": "и точно знаю, что для меня лучше.", "fully back, calm and clear, carrying it with you": "полностью вернулся, спокоен и ясен, неся это с собой", "get ahead on tomorrow?": "забежать вперёд на завтра?", "get lean, ship the app, find peace…": "подсушиться, выпустить приложение, обрести покой…", "get one free:": "получить бесплатно:", "go a little deeper": "копнуть чуть глубже", "go all the way in — let the cloud surround you": "входи до конца — пусть облако окутает тебя", "go deeper ✨": "глубже ✨", "go ·": "погнали ·", "guide": "проводник", "habit": "привычку", "habit left.": "привычка осталась.", "habits": "привычек", "habits kept": "выполненные привычки", "habits left.": "привычек осталось.", "he": "он", "he has run out of present moments. He is looking back at THIS one — the one you're about to waste": "у него больше не осталось «сейчас». Он смотрит на ЭТОТ миг — тот, что ты вот-вот растратишь", "he knows the value of this moment because he has none left. Let his urgency enter you": "он знает цену этому мигу, ведь у него их не осталось. Впусти его жажду в себя", "heavy": "сильная", "helps me suggest a starting point": "так подскажу, с чего начать", "how long": "сколько", "how often": "как часто", "if [obstacle], then I will…": "если [помеха], то я…", "importance": "важность", "in a row": "подряд", "in the crease under your lip": "в складке под губой", "it's already true": "это уже правда", "just be here, now": "просто будь здесь и сейчас", "just below where it meets": "чуть ниже её соединения", "just naming it was enough": "просто назвать — уже достаточно", "just the basics": "только основное", "just the fundamentals first — add more whenever you like. mapped": "сначала только основа — остальное добавишь когда захочешь. отмечено", "kept as real — unplanned": "засчитано как сделанное — без плана", "knock one out while you've got momentum.": "закрой одну, пока есть запал.", "later": "позже", "length — slide, step ＋, or tap a chip": "длина — двигай ползунок или тапни кружок", "let it lock in": "дай этому закрепиться", "let it settle": "дай этому улечься", "let them fall": "пусть упадут", "let your eyes soften": "пусть глаза расслабятся", "let's get it out of you — the things you want (and keep avoiding).": "давай вытащим — то, чего хочешь (и что всё откладываешь).", "lethargy, a mid-day crash, or the flat gap between tasks": "вялость, дневной спад или пустота между делами", "lift the energy — twelve suns, the Vortex": "подними энергию — двенадцать солнц, Вихрь", "light": "лёгкая", "low-priority": "низкоприоритетный", "make or explore something new": "создать или открыть что-то новое", "mark done": "отметить готовым", "marked not done — just a plan": "снята отметка — снова просто план", "midnight": "полночь", "missed": "пропущено", "model": "модель", "moderate": "умеренная", "more": "ещё", "more to rank": "до ранга", "morning intention": "утреннее намерение", "move toward it — Reversal of Desire": "иди навстречу — Разворот желания", "move toward the cloud — say it, mean it": "иди в облако — скажи это и вложись по-настоящему", "move your body": "размять тело", "moved to": "перенесено на", "moved to plan": "возвращено в план", "moved to real": "засчитано как сделанное", "my health": "моё здоровье", "my health, this quiet morning…": "моё здоровье, это тихое утро…", "my main inner obstacle is…": "моя главная внутренняя помеха — это…", "my one thing is…": "моё главное — это…", "my real strengths are…": "мои настоящие сильные стороны…", "name it once…": "назови один раз…", "name one thing — then take a slow breath and actually feel it.": "назови одно — потом сделай медленный вдох и по-настоящему это почувствуй.", "no wrong answer": "неправильных ответов нет", "no wrong answer — it just sets where your journey opens": "неправильного ответа нет — это лишь точка старта твоего пути", "noon": "полдень", "not enough Spark yet — earn a little more": "Искры пока не хватает — заработай ещё чуть-чуть", "not the craving itself — the emptiness driving it. The deprivation that wants to be filled from outside": "не саму тягу — а пустоту за ней. Нехватку, что хочет, чтобы её заполнили извне", "note what you're grateful for": "записать, за что благодарен", "notes": "заметки", "nothing to do, nowhere to be": "ничего не нужно делать, некуда спешить", "nothing to undo": "отменять нечего", "now stop naming reasons. just feel grateful — for nothing, for everything. sense it radiating from the center of your chest.": "теперь перестань искать причины. просто будь благодарен — ни за что и за всё сразу. почувствуй, как это исходит из центра груди.", "of": "из", "of real, chosen time": "по-настоящему своего времени", "often": "часто", "on my best days I…": "в свои лучшие дни я…", "on plan": "по плану", "on the bone under the pupil": "на кости под зрачком", "on the bone, outer corner": "на кости, у внешнего уголка", "one slow round of breath, then we name what's loud. the order matters — you can't reframe a wound-up nervous system (Stutz).": "один медленный круг дыхания, потом назовём, что громче всего. порядок важен — нельзя переосмыслить взвинченную нервную систему (Стац).", "one thing I'd refine — gently…": "что бы я подправил — мягко…", "one… beginning to return": "раз… начинаешь возвращаться", "or": "или", "or paste a model id": "или вставь id модели", "or tap a familiar one": "или тапни знакомое", "paste a backup (or pick a file), then Merge to combine or Restore to replace:": "вставь бэкап (или выбери файл), затем «Влить», чтобы объединить, или «Заменить», чтобы перезаписать:", "paste backup JSON here…": "вставь JSON бэкапа сюда…", "paste key…": "вставь ключ…", "paste your": "вставь свой ключ", "pick ALL that fit — you can be more than one (parent + worker…) · or type your own": "отметь ВСЁ, что подходит — можешь быть и тем, и тем (родитель + работа…) · или впиши своё", "pick a couple — present tense, the you you're growing into · type your own": "выбери пару — в настоящем времени, тот, кем растёшь · впиши своё", "pick a few — fewer is better · type your own": "выбери пару — меньше значит лучше · впиши своё", "pick the small basics you want to keep showing up for · type your own": "выбери базовые мелочи, к которым хочешь возвращаться · впиши своё", "picture a calm shore — warm light, the slow rhythm of the water": "представь спокойный берег — тёплый свет, неспешный ритм воды", "picture twelve suns arranged in a circle, surrounding you": "представь двенадцать солнц по кругу, окружающих тебя", "plan tomorrow": "спланировать завтра", "planted — your world fills as you do": "посажено — мир наполняется вместе с тобой", "plug in an AI so ALTER can actually think. swap engines anytime; start free.": "подключи ИИ, чтобы ALTER правда соображал. движок можно менять когда угодно; начни бесплатно.", "press & hold any activity to pin your favourites up here": "зажми любое занятие, чтобы закрепить любимые здесь", "priority — lowest gets dropped if you run out of time": "приоритет — самое низкое отпадёт, если не хватит времени", "quit": "бросаю", "reach out to someone you love": "написать тому, кого любишь", "read it slowly": "читай медленно", "read or study something real": "почитать или поучить что-то стоящее", "reflect on today, tidy up, set tomorrow's one thing.": "оглянись на день, прибери, задай главное на завтра.", "reflections": "размышления", "remind me": "напоминать", "reset": "перезагрузка", "rest": "покой", "rest — I've got the morning.": "отдыхай — утро на мне.", "restless": "не на месте", "right before something you've been avoiding": "прямо перед тем, что ты откладывал", "rough is fine — pick a range": "примерно — норм, выбери диапазон", "running tight": "впритык", "sad": "грустно", "say it out loud, or just read along": "произнеси вслух или просто читай про себя", "scattered, racing mind — when you can't detect what's off": "разбросанный, несущийся ум — когда не понять, что не так", "search activities…": "искать занятия…", "search reflections…": "искать в размышлениях…", "see it": "увидь это", "see the version of yourself you're most ashamed of — weak, imperfect, broken — a vivid image standing right in front of you": "увидь ту версию себя, которой ты больше всего стыдишься — слабую, несовершенную, сломанную — ярким образом прямо перед собой", "seeded with your life. let's make today count.": "наполнен твоей жизнью. сделаем сегодня важным.", "send it back out into your day — that's where it wants to go": "верни её в свой день — туда она и стремится", "set": "задано", "she": "она", "ship 1 thing to grow": "сделай 1 дело, чтобы расти", "ship one real thing today — then your world grows 🌱": "сделай сегодня одно настоящее дело — и твой мир подрастёт 🌱", "ship one real thing today, then plant": "сделай сегодня одно настоящее дело, потом сажай", "ship the thing you're avoiding": "выкатить то, что откладываешь", "shoulders drop… jaw unclenches… each breath a little slower": "плечи опускаются… челюсть расслабляется… каждый вдох чуть медленнее", "show up to a habit or deep work": "явиться к привычке или глубокому фокусу", "skills you level by living — do the thing, it ranks up": "навыки качаются жизнью — делаешь дело, оно растёт", "skip": "пропустить", "slot": "слот", "slots": "слотов", "slowly they lift around you": "медленно они восходят вокруг тебя", "so the app tailors your deep-work habits to you": "чтобы приложение подстроило привычки глубокой работы под тебя", "so what matters survives.": ", чтобы важное уцелело.", "some": "иногда", "someone who loves me": "тот, кто меня любит", "something you're grateful for…": "за что ты благодарен…", "spacious": "редко", "start of the eyebrow, by the nose": "начало брови, у переносицы", "starts at — tap −/＋ to nudge": "начало — жми −/＋, чтобы подвинуть", "steps": "шаги", "stood out.": "— выделилось.", "stressed": "на нервах", "stuck": "в тупике", "suggested now": "то, что нужно", "switch": "сменить", "tap = ✓": "тап = ✓", "tap a few — multitasking welcome ✓": "тапни несколько — многозадачность приветствуется ✓", "tap a star to open its skill tree ✨": "нажми на звезду — откроется дерево навыков ✨", "tap a step to drop it into your plan": "тапни шаг, чтобы добавить его в план", "tap everything you do — or want to do · type anything that's missing": "отметь всё, что делаешь — или хочешь · впиши чего не хватает", "tap to choose": "тапни, чтобы выбрать", "tap to drop it at": "тапни, чтобы добавить на", "tap to head back": "нажми, чтобы вернуться", "tap to start a timer — stack several if you're multitasking.": "тапни, чтобы запустить таймер — можно несколько, если многозадачишь.", "tension, pre-sleep, or pre-focus": "напряжение, перед сном или перед фокусом", "ten… nine… eight… each number takes you deeper and calmer": "десять… девять… восемь… с каждым числом глубже и спокойнее", "that's who you are": "вот кто ты есть", "the Stutz & Michels way — or a quick one.": "по Стацу и Майклзу — или по-быстрому.", "the best outcome is…": "лучший исход — это…", "the crown of your head": "темя", "the day.": "день.", "the idea is…": "идея в том, что…", "the identity you're stepping into — tap a few.": "образ, в который ты входишь — тапни несколько.", "the loop is discharged — that was for you, not for them": "петля разряжена — это было для тебя, не для него", "the morning identity step, low self-trust, or pre-performance": "утренний шаг к себе, просевшее самодоверие или перед выступлением", "the one move that'd make today count…": "один шаг, ради которого день не зря…", "the one thing…": "главное дело…", "the pull to scroll / snack / numb — the “I deserve this” voice": "тянет залипнуть / перекусить / отключиться — голос «я это заслужил»", "the right move for the moment you're in — sourced from your Field Guide. Using one on a hard day is the win.": "нужный ход для момента, в котором ты сейчас — собрано из твоего Field Guide. Воспользоваться им в тяжёлый день — уже победа.", "the thing you're avoiding — picture it as a cloud right in front of you": "то, что ты откладываешь — представь это облаком прямо перед собой", "the virtues you'll embody today.": "качества, которые ты воплотишь сегодня.", "the void fills from within, not from the screen or the snack — you're full": "пустота заполняется изнутри, а не экраном или едой — ты полон", "the work quietly stops after a win — Jeopardy snaps you back": "после победы работа тихо встаёт — «На кону» возвращает тебя", "the world needs…": "миру нужно…", "the you you're becoming…": "тот, кем становишься…", "there's a grievance still running — gratitude won't land on top of it. Active Love discharges it first (for YOUR liberation, 60s), then gratitude lights up.": "обида всё ещё крутится — благодарность поверх неё не ляжет. Сначала её разрядит Активная любовь (ради ТВОЕГО освобождения, 60 сек), а потом загорится благодарность.", "they": "они", "they swell outward — feel the non-physical energy pour in and fill you": "они разрастаются — почувствуй, как нездешняя энергия вливается и наполняет тебя", "thinking…": "думаю…", "this anxiety": "эту тревогу", "this evening": "этим вечером", "this frustration": "это раздражение", "this heaviness": "эту тяжесть", "this is you. Not your enemy. Your other half. Feel the connection between you and the Shadow": "это ты. Не враг. Твоя вторая половина. Почувствуй связь между тобой и Тенью", "this morning": "этим утром", "this restlessness": "это беспокойство", "this sadness": "эту грусть", "this stress": "это напряжение", "this stuckness": "этот затык", "this tiredness": "эту усталость", "this urgency is real, not manufactured. Use it — launch the next thing right now": "эта жажда настоящая, не выдуманная. Используй её — запусти следующее прямо сейчас", "tidy the surfaces, phone away, head toward bed.": "прибери поверхности, убери телефон, двигай к кровати.", "timer": "таймер", "timers": "таймеров", "tired": "вымотан", "to": "на", "to install a new self-image, or to wind down at night": "чтобы установить новый образ себя или расслабиться на ночь", "today": "сегодня", "today I'll…": "сегодня я…", "today grew": "день подрос", "today's virtue": "добродетель дня", "today, the one thing is…": "сегодня главное — это…", "today.": "сегодня.", "tonight": "сегодня вечером", "too short — discarded": "слишком коротко — отброшено", "total tracked:": "всего засчитано:", "type the name (once) → it becomes a bubble you tap forever": "напиши название (один раз) → и оно станет кнопкой, которую потом только тапаешь", "unpinned": "откреплено", "varies": "по-разному", "wake": "подъём", "well done": "молодец", "what I most want is…": "больше всего я хочу…", "what are you chasing? (optional)": "к чему ты стремишься? (необязательно)", "what went well…": "что получилось…", "what you did": "чем ты занимался", "what's bumping you?": "что цепляет?", "when someone's living rent-free in your head and you can't stop rehearsing the argument": "когда кто-то засел в голове и ты снова и снова прокручиваешь спор", "when:": "когда:", "which habits are you committing to? they'll land on your day.": "какие привычки берёшь сегодня? они встанут в твой день.", "which virtues call you most right now? pick up to 3 — you'll still grow them all": "какие добродетели зовут тебя сильнее всего сейчас? выбери до 3 — растить будешь всё равно все", "with": "вместе с", "witness": "наблюдение", "yet I savor life and cherish this beautiful planet.": "и при этом смакую жизнь и берегу эту прекрасную планету.", "you and the Shadow speak with one voice. The Force of Self-Expression flows — your authority comes from inside, not from their approval": "ты и Тень говорите в один голос. Сила самовыражения течёт — твоя опора внутри, а не в чужом одобрении", "you don't need to close your eyes — just read along, slowly, in your mind or aloud": "глаза закрывать не нужно — просто читай за мной, медленно, про себя или вслух", "you labeled it — that's the whole skill 🙏": "ты это назвал — в этом весь навык 🙏", "you'd wake as": "проснуться как", "you're back online — move": "ты снова в строю — вперёд", "you're moving again — that's the whole point": "ты снова в движении — в этом весь смысл", "your data lives only on this device — back it up so nothing can erase it.": "твои данные хранятся только на этом устройстве — сделай копию, чтобы их ничто не стёрло.", "your guardian. I'll help you become who you want to be — one day at a time.": "твой хранитель. Помогу тебе стать тем, кем хочешь — день за днём.", "your intention": "твоё намерение", "your mirror — it grows when you do": "твоё зеркало — оно растёт вместе с тобой", "your one thing is": "твоё главное —", "your role / situation…": "твоя роль / ситуация…", "your virtues — they level by living. tap one to open its skill tree": "твои добродетели растут от того, как ты живёшь. нажми на любую — откроется дерево навыков", "{lagv} stayed quiet today — is it asking for a little room tomorrow?": "{lagv} сегодня молчала — может, просит чуть места завтра?", "· added": "· добавлено", "· ship 1 real thing to grow your island": "· сделай 1 настоящее дело, чтобы остров рос", "· 🌱 your island grew today": "· 🌱 твой остров сегодня подрос", "— just information, not a verdict. We'll re-story it next.": "— это просто данные, не приговор. Дальше перепишем историю.", "— strong on": "— особенно в", "— they stack back-to-back": "— они встают друг за другом", "“Bring it on!”": "«Давай, я готов!»", "“I love pain!”": "«Я люблю боль!»", "“Pain sets me free!”": "«Боль освобождает меня!»", "…4, 5 — eyes bright": "…4, 5 — глаза ясные", "…because?": "…потому что?", "…or type your own move": "…или впиши свой шаг", "← all entries": "← все записи", "← back": "← назад", "↶ undone": "↶ отменено", "⏱ too short — discarded": "⏱ слишком коротко — отброшено", "⏱️ Right now": "⏱️ Прямо сейчас", "⏱️ what you did": "⏱️ чем ты занимался", "▶ Tracking now (": "▶ Сейчас идёт (", "▶ started": "▶ начато", "◂ back": "◂ назад", "☀️ Who are you today?": "☀️ Кто ты сегодня?", "★ Pinned": "★ Закреплённые", "♻ Replace": "♻ Заменить", "♻ Restore": "♻ Восстановить", "⚠️ Couldn't save — storage may be full. Back up your data via 🧠.": "⚠️ Не сохранилось — память может быть забита. Сделай бэкап через 🧠.", "⚠️ couldn't copy — use Download": "⚠️ не скопировалось — нажми «Скачать»", "⚠️ couldn't restore — storage may be full; your data is unchanged": "⚠️ не вышло восстановить — память забита; твои данные не тронуты", "⚠️ doesn't look like an ALTER backup": "⚠️ не похоже на бэкап ALTER", "⚠️ free models error until you enable them — go to openrouter.ai/settings/privacy and turn ON the free-model / prompt-logging toggle, then Test.": "⚠️ бесплатные модели выдают ошибку, пока их не включишь — зайди на openrouter.ai/settings/privacy, включи тумблер free-model / prompt-logging, потом жми Тест.", "⚠️ not valid backup JSON": "⚠️ это не валидный JSON бэкапа", "⚡ quick gratitude instead": "⚡ или быстрая благодарность", "✅ Commit to today": "✅ Возьми курс на сегодня", "✅ habits kept": "✅ выполненные привычки", "✓ done": "✓ сделано", "✓ on-plan stretch tracked · +": "✓ отрезок по плану засчитан · +", "✓ saved — your masterpiece": "✓ сохранено — твой идеал", "✓ your whole map is built — tap to fine-tune.": "✓ карта собрана целиком — тапни, чтобы донастроить.", "✦ MISSING SOMETHING? TYPE IT": "✦ ЧЕГО-ТО НЕТ? ВПИШИ", "✨ Begin your character": "✨ Создай своего персонажа", "✨ Everything else": "✨ Всё остальное", "✨ Let it rise": "✨ Дай этому подняться", "✨ Redo setup": "✨ Пройти настройку заново", "✨ Set up your world →": "✨ Настроить свой мир →", "✨ What should I do next?": "✨ Что мне сделать дальше?", "✨ What's next?": "✨ Что дальше?", "✨ Your world is ready — your journey's all set": "✨ Твой мир готов — путь намечен", "✨ completed your plan · +": "✨ план выполнен · +", "➕ map a few more": "➕ отметить ещё немного", "⧉ Merge in": "⧉ Влить", "⧉ merged in — nothing overwritten": "⧉ всё влилось — ничего не затёрто", "⬇ Download": "⬇ Скачать", "⬇ backup downloaded": "⬇ бэкап скачан", "🌅 Wake & bedtime": "🌅 Подъём и отбой", "🌅 morning intention": "🌅 утреннее намерение", "🌙 reflections": "🌙 размышления", "🌟 Fill my masterpiece day": "🌟 Развернуть мой идеальный день", "🌟 Suggest a full day": "🌟 Предложить целый день", "🌟 Which virtues?": "🌟 Какие добродетели?", "🌟 Your path": "🌟 Твой путь", "🌦️ your inner weather — how do you feel?": "🌦️ твоя внутренняя погода — как ты?", "🌱 Plant in your world · ✨": "🌱 Посадить в своём мире · ✨", "🌱 planted — your world grew": "🌱 посажено — твой мир подрос", "🌳 See your life": "🌳 Взгляни на свою жизнь", "🎯 what are you chasing? (optional)": "🎯 к чему ты стремишься? (необязательно)", "👆 Tapping": "👆 Тэппинг", "💗 Active Love ▶": "💗 Активная любовь ▶", "💼 What's your work?": "💼 Чем ты занимаешься?", "💾 Back up your life": "💾 Сделай резервную копию своей жизни", "💾 Save this as my masterpiece day": "💾 Сохранить как мой идеальный день", "📄 loaded — now Merge or Restore": "📄 загружено — теперь Влить или Заменить", "📅 planned": "📅 запланировано", "📊 Build your self-map": "📊 Составь карту себя", "📊 calibrate my levels": "📊 откалибровать уровни", "📋 Copy": "📋 Копировать", "📋 backup copied": "📋 бэкап скопирован", "📋 backup copied — keep it safe": "📋 бэкап скопирован — храни в надёжном месте", "📌 pinned to the top": "📌 закреплено наверху", "📓 Yesterday": "📓 Вчера", "📔 Journal": "📔 Дневник", "📝 notes": "📝 заметки", "🕓 been meaning to": "🕓 давно собирался", "🕰️ On this day": "🕰️ В этот день", "🗑 deleted": "🗑 удалено", "🗺️ Today's journey": "🗺️ Путь на сегодня", "🙏 Close with gratitude": "🙏 Заверши благодарностью", "🙏 Grateful Flow": "🙏 Поток благодарности", "🙏 Grateful Flow (full)": "🙏 Поток благодарности (полный)", "🙏 One gratitude": "🙏 Одна благодарность", "🛹 Build a skateboard · ✨": "🛹 Собрать скейтборд · ✨", "🛹 Skateboard built — tap the left pad to skate": "🛹 Скейт собран — нажми левый джойстик, чтобы кататься", "🛼 Trick deck · ✨": "🛼 Дека для трюков · ✨", "🛼 Trick deck — jump while skating, flick the right stick for flips & spins": "🛼 Дека для трюков — прыгай на скейте, дёрни правый стик для флипов и вращений", "🧘 Meditate": "🧘 Медитация", "🧠 Brain — free": "🧠 Мозг — бесплатно", "🧠 ask my brain what's best": "🧠 спросить мозг, что лучше", "🧠 brain (free AI)": "🧠 мозг (бесплатный ИИ)", "🧪 Test the brain": "🧪 Проверить мозг", "🧰 Your toolbox": "🧰 Твой набор инструментов"}); // v658: natural-Russian re-translation (quality pass) + curated fixes (REAL=БЫЛО not Факт, Deep work=Глубокий фокус) — overrides the v657 literals
  // RU translations for everything added in the v664–675 build wave (David 2026-06-29) — so Mom's end-to-end is real. Role-group keys are UPPERCASE because they render via .toUpperCase().
  Object.assign(I18N.ru, {
    "Clean my home": "Прибраться дома", "Lose weight": "Сбросить вес", "Make music": "Писать музыку", "Make videos": "Снимать видео", "Write a book": "Написать книгу", "Make money": "Зарабатывать", "Filmmaker": "Режиссёр", "Edit footage": "Смонтировать", "Write script": "Написать сценарий", "Film": "Снять", "Post a video": "Выложить видео", "Less weed": "Меньше травы", "Less gaming": "Меньше игр",
    "Set a 5-min timer — just start": "Поставь таймер на 5 минут — просто начни", "Clear ONE surface (the kitchen counter)": "Освободи ОДНУ поверхность (кухонную столешницу)", "Just the dishes in the sink": "Только посуду в раковине", "Put one load of laundry in": "Закинь одну стирку", "Pick up 10 things off the floor": "Подними 10 вещей с пола", "Tomorrow: one more small zone": "Завтра — ещё одна маленькая зона",
    "Feels too big?": "Кажется неподъёмным?", "Let's make it impossible to fail.": "Давай сделаем так, чтобы провалиться было невозможно.", "No pressure. You can stop right after.": "Без давления. Можешь остановиться сразу после.", "I'll try this →": "Попробую это →", "reverse the desire →": "перевернуть желание →", "not now": "не сейчас",
    "Just put on your workout clothes. That's the whole job — no gym, no trainer, your own floor.": "Просто надень спортивную одежду. Это вся задача — без зала, без тренера, прямо на полу у себя.", "Set a 2-minute timer and clear ONE small spot. Stop when it rings.": "Поставь таймер на 2 минуты и расчисти ОДНО маленькое место. Звонок — стоп.", "Just open the file and look for 2 minutes. You can close it right after.": "Просто открой файл и посмотри 2 минуты. Можешь закрыть сразу после.", "Open the project and play it through once. That's all.": "Открой проект и проиграй его разок целиком. Это всё.", "Open the doc and write one ugly sentence. Bad on purpose.": "Открой документ и напиши одно корявое предложение. Нарочно плохо.", "Put one mark on the page. Just one.": "Поставь одну отметку на странице. Всего одну.", "One tiny lesson — 2 minutes. Then you're done.": "Один крошечный урок — 2 минуты. И всё, готово.", "Write just the first line. You can delete it later.": "Напиши только первую строчку. Потом сможешь удалить.", "Do the smallest possible piece for 2 minutes. Badly is completely fine.": "Сделай самый маленький кусочек за 2 минуты. Плохо — это совершенно нормально.",
    "Put on workout clothes": "Надеть спортивное", "Make one mark": "Поставить одну отметку", "Write one ugly sentence": "Написать одно корявое предложение", "Draft one line": "Набросать одну строчку",
    "What's your life like?": "Какая у тебя жизнь?", "pick all that fit — you can be more than one · or type your own": "выбери всё, что подходит — можно несколько · или впиши своё", "your role / situation…": "твоя роль / ситуация…",
    "LONG-TERM GOALS": "ДОЛГОСРОЧНЫЕ ЦЕЛИ", "DAILY HABITS": "ЕЖЕДНЕВНЫЕ ПРИВЫЧКИ", "MORE": "ЕЩЁ", "✨ SUGGESTED FOR YOU": "✨ ПОДОБРАНО ДЛЯ ТЕБЯ", "✦ ADD A GOAL": "✦ ДОБАВИТЬ ЦЕЛЬ", "✦ ADD A HABIT": "✦ ДОБАВИТЬ ПРИВЫЧКУ",
    "WORK & CAREER": "Работа и карьера", "Creative": "Творчество", "CREATIVE": "ТВОРЧЕСТВО", "CARE & HOME": "Забота и дом", "LEARNING & FIGURING": "Учёба и поиск", "BODY & LIFE": "Тело и жизнь",
    "Energy": "Энергия", "Hobbies": "Хобби", "Other": "Другое",
    "your body, food, rest — the fuel": "тело, еда, отдых — твоё топливо", "career, focus, money — what you build": "карьера, фокус, деньги — то, что ты строишь", "people & relationships — who you invest in": "люди и отношения — в кого ты вкладываешься", "creating & play — the things you love doing": "творчество и игра — то, что ты любишь делать", "chores, upkeep, habits to drop": "дела по дому, быт, привычки, от которых пора уйти",
    "Track a number": "Следить за числом", "Break it down for me": "Разбей это для меня", "log today": "отметить сегодня",
    "Weight": "Вес", "Balance": "Баланс", "Followers": "Подписчики", "Books read": "Прочитано книг", "Distance": "Дистанция", "Steps": "Шаги", "Debt": "Долг", "Progress": "Прогресс",
    "Welcome back": "С возвращением", "HOW'S YOUR ENERGY NOW?": "КАК ТВОЯ ЭНЕРГИЯ СЕЙЧАС?", "WHICH GOALS STILL MATTER?": "КАКИЕ ЦЕЛИ ВСЁ ЕЩЁ ВАЖНЫ?", "Ease me back in ▸": "Верни меня в ритм ▸",
    "hold as many as you like — I rotate the stalest onto your journey so none gets forgotten": "держи столько, сколько хочешь — самые забытые я подниму в твой путь, чтобы ни одна не потерялась",
    "Your daily habits": "Твои ежедневные привычки", "Your daily rhythm": "Твой ежедневный ритм", "Your world is ready ✨": "Твой мир готов ✨", "seeded with your life. let's make today count.": "наполнен твоей жизнью. давай сделаем этот день стоящим.",
    "Smallest piece · 2 min": "Самый маленький кусочек · 2 мин", "Clear one small spot · 2 min": "Расчисти одно местечко · 2 мин", "Open the file · look 2 min": "Открой файл · посмотри 2 мин", "Open project · play once": "Открой проект · проиграй разок", "One 2-min lesson": "Один урок на 2 мин",
    "You're away": "Тебя нет на месте", "I'm away / resting": "Я в отъезде / отдыхаю", "I'm back": "Я вернулся"
  });
  var I18N_PATTERNS = { ru: [ [/^It's been (.+)\. No guilt — seasons happen, and that you came back is the whole skill\.$/, "Тебя не было $1. Без вины — у всего свои сезоны, и то, что ты вернулся — и есть главное умение."], [/(\d+)\s+of\s+(\d+)\s+today/g, "$1 из $2 сегодня"], [/(\d+)\s+of\s+(\d+)/g, "$1 из $2"] ] };
  function tr(s) { var L = curLang(); if (L === "en" || !I18N[L]) return s; var k = (s == null ? "" : ("" + s)).trim(); var v = I18N[L][k]; return v != null ? v : s; }
  function translateTree(root) {
    var L = curLang(); if (L === "en" || !I18N[L] || !root || !root.nodeType) return;
    var dict = I18N[L], pats = I18N_PATTERNS[L] || [];
    function tn(n) { var raw = n.nodeValue; if (!raw) return; var k = raw.trim(); if (!k) return; var v = dict[k]; if (v != null && v !== k) { n.nodeValue = raw.replace(k, v); return; } var nv = raw, hit = false; for (var pi = 0; pi < pats.length; pi++) { if (pats[pi][0].test(nv)) { nv = nv.replace(pats[pi][0], pats[pi][1]); hit = true; } } if (hit) n.nodeValue = nv; }
    try {
      if (root.nodeType === 3) { tn(root); return; }
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n; while ((n = w.nextNode())) tn(n);
      if (root.querySelectorAll) { var ph = root.querySelectorAll("input[placeholder],textarea[placeholder]"); for (var p = 0; p < ph.length; p++) { var pk = (ph[p].getAttribute("placeholder") || "").trim(); if (dict[pk] != null) ph[p].setAttribute("placeholder", dict[pk]); } }
    } catch (e) {}
  }
  function i18nObserve() { // re-translate freshly-rendered subtrees. SYNCHRONOUS (a microtask that runs BEFORE the browser paints) → English never shows for a frame → no EN→RU flicker on scroll/now-line ticks (David 2026-07-02). Only runs when a non-English language is active → zero cost for English.
    if (!window.MutationObserver) return;
    var mo = new MutationObserver(function (muts) {
      if (curLang() === "en") return;
      for (var i = 0; i < muts.length; i++) { var a = muts[i].addedNodes; for (var j = 0; j < a.length; j++) translateTree(a[j]); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  function setLang(code) { var same = (curLang() === code); S.langCode = code; var m = langMeta(code); S.lang = m.name; try { save(); } catch (e) {} try { document.documentElement.lang = code; } catch (e) {} if (same) { translateTree(document.body); return; } location.replace("index.html?cb=" + Date.now()); } // CHANGING language reloads from the English source then re-translates → fixes "can't switch back from Russian" (the live translator only goes EN→target, it can't reverse already-translated text) — David v661
  function ssLangLabel() { var fl = el("ssLangFlag"); if (fl) fl.innerHTML = flagSVG(curLang()); } // flag only — no language word (David v660)
  function showLangMenu() {
    var ss = el("startScreen"); if (!ss) return; var old = el("ssLangMenu"); if (old) { old.remove(); return; }
    var ov = add(ss, "div", "ss-langmenu"); ov.id = "ssLangMenu";
    LANGS.forEach(function (L) { var row = add(ov, "button", "ss-langrow" + (L.code === curLang() ? " on" : "")); row.innerHTML = '<span class="ss-flag">' + flagSVG(L.code) + '</span><span>' + L.name + '</span>' + (L.code === curLang() ? ' <i class="ti ti-check"></i>' : ''); row.onclick = function () { setLang(L.code); ssLangLabel(); ov.remove(); }; });
    setTimeout(function () { var h = function (e) { if (ov && !ov.contains(e.target) && e.target.id !== "ssLang" && (!e.target.closest || !e.target.closest("#ssLang"))) { ov.remove(); document.removeEventListener("pointerdown", h, true); } }; document.addEventListener("pointerdown", h, true); }, 0);
  }
  function showStartScreen() {
    var ss = el("startScreen"); if (!ss) { _ssShown = false; return; }
    _ssShown = true;
    var has = !!(S.profile && S.profile.set);
    var prim = el("ssPrimary"), nb = el("ssNew"), ln = el("ssLangName"), lb = el("ssLang");
    if (prim) prim.innerHTML = has ? '<i class="ti ti-player-play-filled"></i> Continue' : '<i class="ti ti-player-play-filled"></i> Start'; // BIG primary: Continue a save, or Start a fresh one (→ onboarding)
    if (nb) { nb.style.display = ""; nb.innerHTML = '<i class="ti ti-rotate-2"></i> Start fresh'; } // not "game" — it's a life app, not a game (David v660)
    ssLangLabel();
    ss.classList.add("on");
    if (prim) prim.onclick = function () { ssEnter(has); };
    if (lb) lb.onclick = function (e) { if (e) e.stopPropagation(); showLangMenu(); }; // flag picker (incl. Русский)
    if (curLang() !== "en") translateTree(ss); // translate the start screen into the chosen language
    if (nb) { var armed = false, t = null; nb.onclick = function () { if (!armed) { armed = true; nb.innerHTML = '<i class="ti ti-alert-triangle"></i> Erase &amp; start over?'; if (t) clearTimeout(t); t = setTimeout(function () { armed = false; nb.innerHTML = '<i class="ti ti-rotate-2"></i> Start fresh'; }, 4000); return; } if (t) clearTimeout(t); try { localStorage.clear(); } catch (e) {} try { sessionStorage.clear(); } catch (e) {} location.replace("index.html?cb=" + Date.now()); }; } // two-tap: wipes everything → reload → onboarding
    var lf = el("ssLoad"), fi = el("ssFile");
    if (lf && fi) { // LOAD GAME = upload a backup file (the exported .json) → restore → reload into it
      lf.onclick = function () { fi.value = ""; fi.click(); };
      fi.onchange = function () {
        var f = fi.files && fi.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () { var d = parseBackup(String(r.result || "")); if (!d) { try { alert("That doesn't look like an ALTER backup file."); } catch (e) {} return; } try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { try { alert("Couldn't load — storage may be full."); } catch (e2) {} return; } location.replace("index.html?cb=" + Date.now()); };
        r.onerror = function () { try { alert("Couldn't read that file."); } catch (e) {} };
        r.readAsText(f);
      };
    }
  }
  function ssEnter(has) {
    var ss = el("startScreen");
    if (ss) { ss.classList.add("leaving"); setTimeout(function () { ss.classList.remove("on"); ss.classList.remove("leaving"); }, 440); } // zoom-fade out → reveal the app underneath
    if (!has) { try { onboard(); } catch (e) {} } // new user → onboarding
    else { setTimeout(function () { try { if (document.body.classList.contains("journey-open")) cascadeJourney(); else revealTimeline(); } catch (e) {} try { maybeWelcomeBack(); } catch (e) {} }, 470); } // returning → AFTER the start screen has fully cleared (~440ms), the journey cascades; if they've been gone ≥2wk, the gentle Welcome-Back re-gauge appears (David 2026-06-29)
  }
  function openJourney() {
    var p = el("journeyPath"); if (!p) return; p.classList.remove("jp-leaving"); p.classList.add("on"); document.body.classList.add("journey-open"); // body scroll is permanently locked in CSS now (body{height:100vh;overflow:hidden}) — no per-screen overflow toggling (v640)
    document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.id === "navJourney"); }); // keep the nav highlight honest: Journey is what's showing
    try { if (S.guide && S.guide.mode === "guided") journeyTick(); } catch (e) {}
    drawJourney(true); cascadeJourney(); // stepping-stones pop in on open (v659)
  }
  function closeJourney() { // crossfade the journey OUT to reveal the planner (v659 — replaces the broken portal wipe), then cascade the planner's blocks
    var p = el("journeyPath"); document.body.classList.remove("journey-open");
    document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.dataset.tab === "day"); });
    var gaming = document.body.classList.contains("gaming");
    if (p && p.classList.contains("on")) { p.classList.add("jp-leaving"); setTimeout(function () { p.classList.remove("on"); p.classList.remove("jp-leaving"); if (!gaming) revealTimeline(); }, 280); }
    else if (!gaming) revealTimeline();
  }
  // ===== 3-PANE CAROUSEL (David 2026-06-30): Apple-Photos finger-following slide between Planner | Journey | Game. The current pane + the incoming neighbour move TOGETHER under the thumb and snap on release — no crossfade, no mid-swipe redraw (that was the v679 jank). The planner's chrome (#nav + #liveDock) are separate fixed siblings, so the planner pane slides as a GROUP; journey/game carry their own chrome inside, so they slide as one element. Vertical scroll / pinch / taps still belong to the pane (we only hijack a committed HORIZONTAL gesture, and bail on a 2nd finger or an interactive target). =====
  var PANE_GUARD = ".calblk,.grip,.gript,.calx,.live-stop,.jp-bub,.jp-durchip,.jp-ckbtn,.jp-hmbtn,.jc-cta,.ld-grab,.ld-stop,.ld-b,.ld-sw,input,textarea,button,.tf-chip,.scope-b,#joy,#joy2,#gameNav,#gnToggle,#gameExit";
  var PANE_ORDER = ["planner", "journey", "game"];
  function curPaneName() { var b = document.body.classList; return b.contains("gaming") ? "game" : b.contains("journey-open") ? "journey" : "planner"; }
  function paneGroup(n) { // the element(s) that SLIDE for this pane. #nav is the ONE persistent bottom menu (fixed, on top) shared across all 3 panes — it never slides; only the page content does (David 2026-06-30).
    if (n === "planner") return [el("pullSheet"), el("liveDock")].filter(Boolean);
    if (n === "journey") return [el("journeyPath")].filter(Boolean);
    return [el("gameMode")].filter(Boolean);
  }
  function setGroupX(n, x, z) { paneGroup(n).forEach(function (e) { e.style.setProperty("transform", "translateX(" + x + "px)", "important"); if (z != null) e.style.zIndex = z; }); }
  function setGroupFrame(n, x, op, sc, z) { paneGroup(n).forEach(function (e) { e.style.setProperty("transform", "translateX(" + x + "px)" + (sc != null ? " scale(" + sc + ")" : ""), "important"); if (op != null) e.style.opacity = op; if (z != null) e.style.zIndex = z; }); }
  function clearGroup(n) { paneGroup(n).forEach(function (e) { e.style.transform = ""; e.style.removeProperty("transform"); e.style.opacity = ""; e.style.zIndex = ""; e.style.transition = ""; e.style.willChange = ""; }); }
  function panePrime(n, show) { // make a pane RENDERABLE beside the current one during a drag — WITHOUT its entrance animation (no portal, no cascade)
    if (n === "journey") { var jp = el("journeyPath"); if (jp) jp.classList.add("on"); }
    else if (n === "game") { var gm = el("gameMode"); if (gm) { gm.classList.add("on"); try { worldFit(); } catch (e) {} if (!gameOn) { gameOn = true; requestAnimationFrame(drawWorld); } try { gameNavSetup(); } catch (e) {} } }
    // planner is always rendered (display:flex behind), nothing to prime
  }
  function setPaneRest(n) { // commit the canonical rest-state for pane n, NO entrance animation; clear all drag transforms
    ["planner", "journey", "game"].forEach(clearGroup);
    document.body.classList.remove("pane-dragging", "nav-collapsed"); // never carry the planner's scrolled corner-pill state into another pane (the persistent menu must stay full there)
    var jp = el("journeyPath"), gm = el("gameMode"), b = document.body.classList;
    if (n === "planner") { b.remove("journey-open", "gaming"); if (jp) jp.classList.remove("on", "jp-leaving"); if (gm) gm.classList.remove("on", "gn-open"); gameOn = false; document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.dataset.tab === "day"); }); try { revealTimeline(); } catch (e) {} }
    else if (n === "journey") { b.remove("gaming"); if (gm) gm.classList.remove("on", "gn-open"); gameOn = false; b.add("journey-open"); if (jp) jp.classList.add("on"); document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.id === "navJourney"); }); try { drawJourney(false); } catch (e) {} }
    else { b.remove("journey-open"); if (jp) jp.classList.remove("on", "jp-leaving"); if (gm) gm.classList.add("on"); b.add("gaming"); document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.dataset.tab === "self"); }); try { worldFit(); } catch (e) {} if (!gameOn) { gameOn = true; requestAnimationFrame(drawWorld); } try { gameNavSetup(); } catch (e) {} }
  }
  var _paneAnim = false;
  function initPaneCarousel() {
    var sx = 0, sy = 0, on = false, armed = false, multi = false, cur = null, nbr = null, sign = 0, W = 1;
    function reset() { if (!_paneAnim) ["planner", "journey", "game"].forEach(function (p) { paneGroup(p).forEach(function (el2) { el2.style.willChange = ""; }); }); on = false; armed = false; multi = false; cur = null; nbr = null; sign = 0; }
    document.addEventListener("pointerdown", function (e) {
      if (_paneAnim) { armed = false; return; }
      if (!e.isPrimary) { multi = true; armed = false; if (on) cancelDrag(); return; }
      multi = false; on = false; cur = null;
      armed = !(e.target && e.target.closest && e.target.closest(PANE_GUARD));
      sx = e.clientX; sy = e.clientY; W = window.innerWidth || 390;
      if (armed) paneGroup(curPaneName()).forEach(function (el2) { el2.style.willChange = "transform"; }); // pre-promote the current pane's layer on touch-down so the first drag frames don't stutter
    }, true);
    function beginDrag(dir) { // dir -1 = swipe left (→ next pane) · +1 = swipe right (→ prev pane)
      cur = curPaneName(); var idx = PANE_ORDER.indexOf(cur);
      var tgtIdx = idx + (dir < 0 ? 1 : -1); sign = dir;
      nbr = (tgtIdx >= 0 && tgtIdx < PANE_ORDER.length) ? PANE_ORDER[tgtIdx] : null;
      document.body.classList.add("pane-dragging");
      paneGroup(cur).forEach(function (el2) { el2.style.transition = "none"; el2.style.willChange = "transform"; });
      if (nbr) { panePrime(nbr); paneGroup(nbr).forEach(function (el2) { el2.style.transition = "none"; el2.style.willChange = "transform"; });
        setGroupFrame(nbr, (dir < 0 ? W : -W), 0.5, 0.91, 299); } // neighbour parked one screen over, dimmed + scaled-back in depth
      setGroupFrame(cur, 0, 1, 1, 300);
    }
    document.addEventListener("pointermove", function (e) {
      if (!armed || multi) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!on) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { armed = false; return; } // vertical → it's a scroll
        if (Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.4) { on = true; beginDrag(dx < 0 ? -1 : 1); }
        else return;
      }
      e.preventDefault();
      var d = e.clientX - sx;
      if (!nbr) { d = d * 0.32; setGroupX(cur, d); return; } // edge pane → rubber-band, no commit
      var f = Math.min(1, Math.abs(d) / W); // 0..1 progress
      // DEPTH PARALLAX: both pages stay edge-connected (translate 1:1) but gain Z-depth — the leaving page recedes (scales back + dims into shadow), the incoming page rises forward (scales up + brightens) from under the seam gradient. (David 2026-06-30)
      setGroupFrame(cur, d, 1 - 0.5 * f, 1 - 0.09 * f);
      setGroupFrame(nbr, (sign < 0 ? W : -W) + d, 0.5 + 0.5 * f, 0.91 + 0.09 * f);
    }, { passive: false });
    function settle(toCommit) {
      _paneAnim = true;
      var EAS = "transform .3s cubic-bezier(.22,.9,.3,1), opacity .3s ease";
      paneGroup(cur).forEach(function (el2) { el2.style.transition = EAS; });
      if (nbr) paneGroup(nbr).forEach(function (el2) { el2.style.transition = EAS; });
      if (toCommit && nbr) { setGroupFrame(cur, (sign < 0 ? -W : W), 0.5, 0.91); setGroupFrame(nbr, 0, 1, 1); } // finish: leaving page recedes fully off, incoming rises flush + bright
      else { setGroupFrame(cur, 0, 1, 1); if (nbr) setGroupFrame(nbr, (sign < 0 ? W : -W), 0.5, 0.91); } // cancel: spring both back to depth
      var landed = toCommit && nbr ? nbr : cur;
      setTimeout(function () { setPaneRest(landed); _paneAnim = false; }, 320);
    }
    function cancelDrag() { if (on) settle(false); reset(); }
    document.addEventListener("pointerup", function (e) {
      if (armed && on && cur) { var dx = e.clientX - sx; var commit = !!nbr && (Math.abs(dx) > W * 0.26); settle(commit); }
      reset();
    });
    document.addEventListener("pointercancel", function () { cancelDrag(); });
  }
  // ===== WELCOME-BACK RE-ASSESSMENT (David 2026-06-29): David drifts off-path for weeks then returns — the journey must NOT resume stale. Detect a lapse (≥14d since last activity) → a gentle, anti-shame re-gauge: energy now? · which goals still matter? · ease back gentle. Recalibrate (lowStart gate, prune paused goals) without demoting progress. =====
  function daysSinceK(k) { try { var a = (k || "").split("-"), d = new Date(+a[0], +a[1] - 1, +a[2]); var t = new Date(); t.setHours(0, 0, 0, 0); return Math.max(0, Math.round((t - d) / 86400000)); } catch (e) { return 0; } }
  function lastActiveK() { var tk = todayK(), ks = {}; Object.keys(S.log || {}).forEach(function (k) { if ((S.log[k] || []).length) ks[k] = 1; }); Object.keys(S.bk || {}).forEach(function (k) { var e = S.bk[k] || {}; if ((e.am && e.am.done) || (e.pm && e.pm.done) || ((e.journal || []).length)) ks[k] = 1; }); Object.keys(S.blocks || {}).forEach(function (k) { if ((S.blocks[k] || []).some(function (b) { return b.done; })) ks[k] = 1; }); return Object.keys(ks).filter(function (k) { return k < tk; }).sort().pop() || null; }
  function maybeWelcomeBack() { try { if (!(S.profile && S.profile.set)) return; if (S.lastWelcomeBackK === todayK()) return; var last = lastActiveK(); if (!last) return; var gap = daysSinceK(last); if (gap < 14) return; welcomeBackSheet(gap); } catch (e) {} }
  function welcomeBackSheet(gap) {
    S.lastWelcomeBackK = todayK(); save(); // once per return
    var weeks = Math.floor(gap / 7), human = weeks >= 1 ? (weeks + " week" + (weeks > 1 ? "s" : "")) : (gap + " days");
    var ov = add(document.body, "div", "ob-ov"), card = add(ov, "div", "ob-card");
    var body = add(card, "div", "ob-body"), foot = add(card, "div", "ob-foot");
    add(body, "i", "ti ti-sparkles ob-spk");
    add(body, "div", "ob-q", "Welcome back");
    add(body, "div", "ob-sb", "It's been " + human + ". No guilt — seasons happen, and that you came back is the whole skill.");
    add(body, "div", "ob-lbl", "HOW'S YOUR ENERGY NOW?");
    var er = add(body, "div", "ob-row"), pick = { v: "" };
    VIBES2.forEach(function (v) { var c = add(er, "span", "ob-ch"); c.innerHTML = '<i class="ti ' + v.ti + '"></i> ' + v.l; c.onclick = function () { pick.v = v.k; Array.prototype.forEach.call(er.children, function (x) { x.classList.remove("on"); }); c.classList.add("on"); c.style.background = v.c; c.style.color = "#160510"; }; });
    var act = activeGoals();
    if (act.length) { add(body, "div", "ob-lbl", "WHICH GOALS STILL MATTER?"); var gr = add(body, "div", "ob-row"); act.forEach(function (g) { g._wbKeep = true; var c = add(gr, "span", "ob-ch on"); c.textContent = g.title; c.onclick = function () { g._wbKeep = !g._wbKeep; c.classList.toggle("on", g._wbKeep); }; }); }
    var b = add(foot, "button", "ob-btn go", "Ease me back in ▸");
    b.onclick = function () {
      if (pick.v) { S.profile.vibe = pick.v; S.profile.lowStart = (pick.v === "overwhelmed" || pick.v === "stuck"); } else { S.profile.lowStart = true; } // default: gentle re-entry (body-first gate leads)
      (S.goals || []).forEach(function (g) { if ("_wbKeep" in g) { g.active = g._wbKeep; delete g._wbKeep; } }); // paused goals quietly go on-hold; kept goals stay (rotation resurfaces the stalest)
      save(); ov.remove(); renderAll();
      try { if (document.body.classList.contains("journey-open")) { drawJourney(true); cascadeJourney(); } else openJourney(); } catch (e) {}
      toast("🌅 fresh start — one gentle step at a time");
    };
  }
  function appVer() { try { var s = document.querySelector('script[src*="app.js"]'); var m = s && s.src.match(/v=(\d+)/); return "v" + (m ? m[1] : "?"); } catch (e) { return "v?"; } } // reads the live cache-buster → the actual build loaded
  function timeCommit(n, onGo) { // commit a time to an activity → that's how ALTER tracks. First-ever use is a gentle tutorial that walks you to 5 minutes. (David 2026-07-02)
    var tut = !(S.guide && S.guide.tutCommit);
    var ov = add(document.body, "div", "bento-ov");
    var card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head");
    add(head, "div", "bento-q", tut ? "First — commit a time" : "How long?");
    if (!tut) { var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); }; }
    var body = add(card, "div", "bento-body");
    add(body, "div", "bento-orderhint", tut ? "Everything here works by committing a little time to it — that's how it tracks you. Let's start small: tap 5 minutes to plan your day." : "How long will you give “" + esc(n.title) + "”?");
    var grid = add(body, "div", "tc-grid");
    [5, 10, 15, 30, 45, 60].forEach(function (m) {
      var b = add(grid, "button", "tc-btn" + (tut && m !== 5 ? " tc-dim" : "") + (tut && m === 5 ? " tc-glow" : ""));
      b.innerHTML = "<b>" + m + "</b><span>min</span>";
      b.onclick = function () { if (tut && m !== 5) return; if (tut) { S.guide = S.guide || {}; S.guide.tutCommit = true; save(); } ov.remove(); onGo(m); };
    });
  }
  var jpHabMenuKey = null, jpCommitKey = null; // which habit circle has its 3-way menu open · which circle is in the time-commitment beat (David 2026-06-28 / 2026-07-02)
  function jpStart(n) { // START a circle: DOING/PLAN → the cockpit blooms into the time-commitment beat (commit a time = how it tracks); HABIT → its 3-way menu
    if (n.key === "plan" || n.key === "onething" || (n.key && n.key.indexOf("blk:") === 0)) { jpCommitKey = n.key; jpHabMenuKey = null; drawJourney(true); return; }
    if (n.key && n.key.indexOf("hab:") === 0) { jpHabMenuKey = n.key; drawJourney(true); return; }
    if (n.act) n.act();
  }
  var JP_DUR = [ // context-aware presets per activity (minutes; 0.5 = 30s). Tap one (Duolingo-fast); "custom" opens the 30s–12h dial.
    [/^plan/, [5, 10, 15]], [/deep|focus|study|writ|cod|work/, [25, 50, 90]], [/medit|breath|reflect|journal|gratitude|pray/, [2, 5, 10]],
    [/walk|run|move|gym|exercis|yoga|stretch|swim/, [15, 30, 60]], [/read|learn/, [15, 30, 45]], [/sleep|nap|rest|wind/, [30, 60, 480]], [/tidy|clean|chore|dish|laundry/, [5, 15, 30]]
  ];
  function jpDurations(n) { var t = (n.title || "").toLowerCase(); if (n.key === "plan") return [5, 10, 15]; for (var i = 0; i < JP_DUR.length; i++) if (JP_DUR[i][0].test(t)) return JP_DUR[i][1]; return [15, 30, 60]; }
  function durLbl(m) { return m < 1 ? Math.round(m * 60) + "s" : m < 60 ? m + "m" : (m % 60 === 0 ? (m / 60) + "h" : (m / 60).toFixed(1) + "h"); }
  function jpCommitGo(n, mins) { if (!(S.guide && S.guide.tutCommit)) { S.guide = S.guide || {}; S.guide.tutCommit = true; save(); } jpCommitKey = null; startTimer({ title: n.title, color: n.color, catK: n.catK || null, commit: mins }); if (n.key === "plan") { try { shapeFlow(todayK()); } catch (e) {} } drawJourney(true); }
  function jpDurSlider(ckp, n) { // CUSTOM: a 30s–12h dial (log scale → resolution where it matters)
    var old = ckp.querySelector(".jp-durchips"); if (old) old.remove(); var h2 = ckp.querySelector(".jp-ckhint"); if (h2) h2.remove();
    var wrap = add(ckp, "div", "jp-durslider"); var read = add(wrap, "div", "jp-durread");
    var sl = add(wrap, "input", "jp-durrange"); sl.type = "range"; sl.min = "0"; sl.max = "100"; sl.value = "45";
    function secs(v) { var lo = Math.log(30), hi = Math.log(43200); return Math.round(Math.exp(lo + (hi - lo) * (v / 100))); }
    function fmtS(s) { return s < 60 ? s + "s" : s < 3600 ? Math.round(s / 60) + "m" : (s / 3600 % 1 === 0 ? (s / 3600) + "h" : (s / 3600).toFixed(1) + "h"); }
    function upd() { read.textContent = fmtS(secs(+sl.value)); } sl.oninput = upd; upd();
    var go = add(wrap, "button", "jp-durgo"); go.textContent = "Commit"; go.style.background = n.color; go.onclick = function () { jpCommitGo(n, secs(+sl.value) / 60); };
  }
  var JP_CHAPTERS = [ // the long-term GROWTH ARC = 8 LANDMARKS (O→VII course arc). Each has a short title, one-line why subtitle, and icon. Active = today's chapter; past = trophied milestones; future = dim aspiration. (Phase 1 Drop 1, 2026-06-30)
    { t: "Why You're Here",    why: "Get clear on what you actually want.",             ic: "ti-flame" },
    { t: "Who You Are",        why: "Meet your best self and name your strengths.",      ic: "ti-user-star" },
    { t: "The Obstacle OS",    why: "Turn what's in your way into fuel.",               ic: "ti-shield-bolt" },
    { t: "Your Big Three",     why: "Energy, work, love — the shape of a good day.",    ic: "ti-layout-columns" },
    { t: "Masterpiece Day",    why: "Architect a day worth repeating.",                  ic: "ti-crown" },
    { t: "Your Algorithms",    why: "Make the good stuff automatic.",                    ic: "ti-refresh" },
    { t: "The Fundamentals",   why: "Eat, move, sleep, breathe — the foundation.",      ic: "ti-heart-rate-monitor" },
    { t: "Soul Force",         why: "Live it. This is who you've become.",              ic: "ti-star" }
  ];
  var JP_ICON = { plan: "ti-map-2", settle: "ti-wind", am: "ti-sunrise", pm: "ti-moon", onething: "ti-star" }; // node-key → Tabler symbol (no emojis — match the day-viewer language)
  var _jpDoneSetSeeded = false; // #5: on first drawJourney call, pre-seed _jpDoneSet with already-done nodes so the burst only fires for NEW completions this session, not on app open
  function drawJourney(autoScroll) {
    var trail = el("jpTrail"); if (!trail) return; trail.innerHTML = "";
    var jn = Math.max(0, Math.min(JP_CHAPTERS.length - 1, journeyNode()));
    var nodes = jpNodes(), real = nodes.filter(function (n) { return !!n.title; });
    // #5: seed the done-set on first call so bursts only fire for completions that happen THIS session
    if (!_jpDoneSetSeeded) { _jpDoneSetSeeded = true; real.forEach(function (n) { if (n.done && n.key) _jpDoneSet[todayK() + ":" + n.key] = 1; }); }
    var doneN = real.filter(function (n) { return n.done; }).length, total = real.length;
    var curIdx = -1; for (var i = 0; i < real.length; i++) { if (!real[i].done) { curIdx = i; break; } } // first undone today = CURRENT
    var allDone = curIdx < 0;
    var sub = el("jpSub"); if (sub) sub.textContent = (allDone ? "Today complete — beautiful ✨" : doneN + " of " + total + " today") + "  ·  " + appVer(); // version tag so we can confirm which build is actually loaded (David 2026-07-02)
    var spk = el("jpSpark"); if (spk) { var spkn = spk.querySelector(".spark-n"); if (spkn) spkn.textContent = ((S.game && S.game.spark) || 0).toLocaleString(); }
    var pf = el("jpProgFill"); if (pf) pf.style.width = (total ? Math.round(doneN / total * 100) : 0) + "%";
    var gi = 0, curEl = null; // gi = continuous coin index → the winding S-curve flows across chapters
    var _burstQueue = []; // #5: nodes to burst-animate after the DOM is built (can't fire during build — elements aren't in viewport yet)
    var _dk = todayK();
    function banner(state, klabel, title, ic, why) { var u = add(trail, "div", "jp-unit " + state); var ix = add(u, "div", "ju-ic"); ix.innerHTML = '<i class="ti ' + ic + '"></i>'; var tx = add(u, "div", "ju-txt"); add(tx, "div", "ju-k", klabel); add(tx, "div", "ju-t", title); if (why) { var ws = add(tx, "div", "ju-why", why); ws.style.cssText = "font-size:11px;opacity:.62;margin-top:2px;line-height:1.3;"; } return u; }
    function trophy(state, glyph) { var t = add(trail, "div", "jp-trophy " + state); var b = add(t, "div", "jt-b"); b.innerHTML = '<i class="ti ' + glyph + '"></i>'; return t; }
    function coin(state, n, idx) {
      var node = add(trail, "div", "jp-node " + state);
      node.style.transform = "translateX(" + (state === "cur" ? 0 : Math.sin(idx * 0.72) * 72).toFixed(0) + "px)"; // winding path; the CURRENT node stays CENTERED (the focal point — fixes the "shifted right" look) (David 2026-07-02)
      var bub = add(node, "div", "jp-bub");
      var icon = state === "locked" ? "ti-lock" : (n.icon || JP_ICON[n.key] || tiClass({ title: n.title, color: n.color }));
      bub.innerHTML = '<i class="ti ' + icon + '"></i>';
      if (state !== "locked") { bub.style.background = (state === "cur") ? tfStripe(n.color) : n.color; bub.style.borderColor = mixHex(n.color, "#160510", 0.45); } // current = striped hero tile (timeline language); others = flat domain color
      if (state === "done") {
        var ck = add(node, "div", "jp-check"); ck.innerHTML = '<i class="ti ti-check"></i>';
        // #5: detect undone→done transition; queue a burst for after DOM layout (DEVICE-UNTESTED feel)
        var dsetKey = _dk + ":" + n.key;
        if (!_jpDoneSet[dsetKey] && n.key) { _jpDoneSet[dsetKey] = 1; _burstQueue.push({ el: node, pts: 15 }); }
      }
      if (n.act && state !== "locked" && state !== "cur") bub.onclick = n.act;
      if (state === "cur") {
        curEl = node;
        var runT = (S.timers || []).filter(function (x) { return x.dayK === todayK() && x.title === n.title; })[0]; // a live timer for THIS activity?
        bub.onclick = function () { jpStart(n); };
        if (jpCommitKey === n.key) { // THE TIME-COMMITMENT BEAT — the circle zooms into the cockpit ring + asks how long, in place (no popup). David 2026-07-02
          bub.style.display = "none";
          var tut = !(S.guide && S.guide.tutCommit);
          var ckc = add(node, "div", "jp-cockpit jp-zoomin");
          var rgc = add(ckc, "div", "jp-ring"); var dsc = add(rgc, "div", "jp-rdisc"); dsc.style.background = tfStripe(n.color); dsc.innerHTML = '<i class="ti ' + icon + '"></i>';
          add(ckc, "div", "jp-ckq", tut ? "First — commit a time" : "How long?");
          if (tut) add(ckc, "div", "jp-ckhint", "Everything here works by committing a little time — that's how it tracks you. Tap 5 minutes to begin.");
          var chips = add(ckc, "div", "jp-durchips");
          jpDurations(n).forEach(function (m) { var c = add(chips, "button", "jp-durchip" + (tut && m !== 5 ? " dim" : "") + (tut && m === 5 ? " glow" : "")); c.textContent = durLbl(m); c.onclick = function () { if (tut && m !== 5) return; jpCommitGo(n, m); }; });
          var cu = add(chips, "button", "jp-durchip cust" + (tut ? " dim" : "")); cu.innerHTML = '<i class="ti ti-dots"></i>'; cu.onclick = function () { if (tut) return; jpDurSlider(ckc, n); };
        } else if (runT) { // the now IS the cockpit — expand the circle into the live ring + timer, in place
          bub.style.display = "none";
          var ckp = add(node, "div", "jp-cockpit jp-zoomin");
          var rg = add(ckp, "div", "jp-ring"); var ds = add(rg, "div", "jp-rdisc"); ds.style.background = tfStripe(n.color); ds.innerHTML = '<i class="ti ti-player-pause"></i>'; ds.title = "tracking"; // the icon flips to a PAUSE while it's playing (David 2026-07-02)
          add(ckp, "div", "jp-cktitle", n.title);
          var tmw = add(ckp, "div", "jp-cktimer"); tmw.innerHTML = '<span class="live-elapsed" data-tid="' + runT.id + '">' + elapsedStr(runT) + '</span>';
          var mx = add(ckp, "div", "jp-ckmatrix");
          var dn = add(mx, "button", "jp-ckbtn done"); dn.innerHTML = '<i class="ti ti-check"></i> Done'; dn.onclick = function () { stopTimer(runT.id); if (n.key.indexOf("blk:") === 0) { var bid = n.key.slice(4); (blocks(todayK()) || []).forEach(function (b) { if (b.id === bid) b.done = true; }); save(); } drawJourney(true); };
          // FOLLOW / REPLAN / DRIFT matrix — the live triad next to Done (reward-never-shame; David 2026-06-28)
          var fl = add(mx, "button", "jp-ckbtn follow small"); fl.innerHTML = '<i class="ti ti-player-play"></i> Follow'; fl.onclick = function () { try { toast("✦ on plan — keep going"); } catch (e) {} };
          var rp = add(mx, "button", "jp-ckbtn replan small"); rp.innerHTML = '<i class="ti ti-calendar-event"></i> Replan'; rp.onclick = function () { if (n.key.indexOf("blk:") === 0) { var bid = n.key.slice(4), bb = (blocks(todayK()) || []).filter(function (b) { return b.id === bid; })[0]; if (bb) { closeJourney(); blockEdit(bb, todayK()); return; } } planBreak("Replan — what, for how long?"); };
          var dr = add(mx, "button", "jp-ckbtn drift small"); dr.innerHTML = '<i class="ti ti-wind"></i> Drift'; dr.onclick = function () { stopTimer(runT.id); coolStreak(); try { toast("you stepped away — no shame"); } catch (e) {} drawJourney(true); };
          var tl = add(mx, "button", "jp-ckbtn small"); tl.style.background = "#3a1226"; tl.style.color = "#ffd9ea"; tl.innerHTML = '<i class="ti ti-briefcase"></i> Tools'; tl.onclick = function () { try { openToolbox(); } catch (e) {} }; // the grimoire, from the cockpit (David 2026-06-29)
        } else if (n.key && n.key.indexOf("hab:") === 0 && jpHabMenuKey === n.key) {
          // HABIT 3-way inline menu — opened by tapping START on a habit circle (David 2026-06-28)
          bub.style.display = "none";
          var hm2 = add(node, "div", "jp-habmenu"); add(hm2, "div", "jp-hmtitle", n.title);
          var b1 = add(hm2, "button", "jp-hmbtn"); b1.style.background = n.color; b1.innerHTML = '<i class="ti ti-circle-check"></i> Mark done';
          b1.onclick = function () { jpHabMenuKey = null; var was = !!doneMap(todayK())[n.key.slice(4)]; toggleHabit(n.key.slice(4)); if (!was && doneMap(todayK())[n.key.slice(4)]) { try { celebrateGated(n.color, bumpStreak()); } catch (e) {} } drawJourney(true); };
          var b2 = add(hm2, "button", "jp-hmbtn"); b2.style.background = mixHex(n.color, "#fff", 0.18); b2.innerHTML = '<i class="ti ti-stopwatch"></i> Track it'; b2.onclick = function () { jpHabMenuKey = null; startTimer({ title: n.title, color: n.color, habitId: n.key.slice(4) }); drawJourney(true); };
          var b3 = add(hm2, "button", "jp-hmbtn skip"); b3.innerHTML = '<i class="ti ti-player-skip-forward"></i> Skip for now'; b3.onclick = function () { jpHabMenuKey = null; try { toast("set aside — come back any time"); } catch (e) {} drawJourney(true); };
        } else {
          var card = add(node, "div", "jp-card");
          add(card, "div", "jc-t", n.title);
          if (n.line) add(card, "div", "jc-l", n.line);
          var cta = add(card, "button", "jc-cta"); cta.textContent = n.key === "plan" ? "PLAN IT" : "START"; cta.style.background = n.color; cta.onclick = function () { jpStart(n); };
        }
      } else if (n.title) { add(node, "div", "jp-cap" + (state === "locked" ? " locked" : ""), n.title); }
    }

    // Assembled TOP→BOTTOM = a climb UP: future (aspiration) on top → TODAY → past (foundation) at the bottom.
    // FUTURE chapters — locked, Mastery highest, descending toward today
    for (var f = JP_CHAPTERS.length - 1; f > jn; f--) {
      banner("locked", "Unit " + (f + 1), JP_CHAPTERS[f].t, "ti-lock", JP_CHAPTERS[f].why);
      for (var z = 0; z < 3; z++) coin("locked", { emoji: "★", title: "" }, gi++);
      trophy("locked", "ti-lock");
    }
    // ACTIVE chapter = TODAY. Banner on top, then today's reward summit, then today's steps ASCENDING (latest up high; current/done lower, so you climb toward them)
    banner("active", "Today · Unit " + (jn + 1), JP_CHAPTERS[jn].t, JP_CHAPTERS[jn].ic, JP_CHAPTERS[jn].why);
    var endT = trophy(allDone ? "done" : "locked", allDone ? "ti-trophy" : "ti-gift"); // today's reward summit
    for (var r = real.length - 1; r >= 0; r--) { var rn = real[r]; coin(rn.done ? "done" : (r === curIdx ? "cur" : "up"), rn, gi++); }
    if (!curEl) curEl = endT;
    // PAST chapters — completed milestones, tappable to review (gentle recap). Foundation at the very bottom.
    for (var c = jn - 1; c >= 0; c--) {
      (function(ci) {
        var ch = JP_CHAPTERS[ci], cjn = JOURNEY[ci];
        var pu = banner("done", "Unit " + (ci + 1) + " · complete", ch.t, ch.ic, ch.why);
        // make the past banner tappable → open the chapter's surface for review
        if (pu && cjn && cjn.act) { pu.style.cursor = "pointer"; pu.title = "Tap to revisit"; pu.onclick = function () { try { toast("✦ revisiting " + ch.t); cjn.act(); } catch (e) {} }; }
        trophy("done", "ti-trophy");
      })(c);
    }

    if (autoScroll && curEl) { var doScroll = function () { try { var sc = el("jpScroll"); if (sc) sc.scrollTop = Math.max(0, curEl.offsetTop - sc.clientHeight * 0.42); } catch (e) {} }; setTimeout(doScroll, 60); setTimeout(doScroll, 320); } // run twice — once early, once after the icon font settles layout (else it lands short)
    // #5: fire completion bursts after layout settles (DEVICE-UNTESTED feel — the pop + float animate on the node after it scrolls into view)
    if (_burstQueue.length) { var _bq = _burstQueue.slice(); setTimeout(function () { _bq.forEach(function (b) { try { jpNodeCompletionBurst(b.el, b.pts); } catch (e) {} }); }, 380); }
  }
  function bumpStreak() { S.game = S.game || { spark: 0, total: 0, ups: {} }; if (S.game.streakDay !== todayK()) S.game.streak = 0; S.game.streak = (S.game.streak || 0) + 1; S.game.streakDay = todayK(); save(); return S.game.streak; }
  function coolStreak() { /* anti-shame law (David): drift is DATA, never punishment — a streak is never broken by drifting. No-op kept as a hook so call-sites stay meaningful. (2026-06-29: was decrementing the streak, which contradicted "never a breakable streak") */ }
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
  function celebrateGated(color, streak) { // GENTLE bookend reward, GATED once-per-logical-day so journal+PM+AM don't triple-fire the full burst (CKPT-5, David 2026-06-28)
    S.guide = S.guide || {}; var k = todayK();
    if (S.guide.celeK === k) { try { earn(8, {}); } catch (e) {} try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {} return; } // already fired today → quiet Spark only, no second burst
    S.guide.celeK = k; celebrate(color, streak || 1);
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
    if (k === todayK()) { staleGoals(3).forEach(function (g) { var st = (g.subtasks || []).filter(function (s) { return !s.done; })[0]; if (st && !have[st.title.toLowerCase()]) out.push({ title: st.title, domain: g.domain || "focus", why: "from your " + g.title + " goal", mins: 30 }); }); }
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
  function markFutureBlock(b, dk) { if (dk > todayK()) b.plannedAhead = true; return b; } // reward-economy helper: any block planted on a future day gets plannedAhead=true so planned-then-done can fire celebrate() (SCHEMA 3, 2026-06-30)
  function addSuggested(k, s) { var dom = s.domain || "focus"; var nb = markFutureBlock({ id: uid(), time: nextFreeTime(k), mins: s.mins || 30, title: s.title, prio: 2, color: DOM[dom].c, catK: s.catK || null, domain: dom, done: false }, k); blocks(k).push(nb); reflow(k); save(); renderToday(); }
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
  function startOrSwitch() { var run = activeTimers(); bentoPicker({ title: run.length ? "Switch to?" : "What are you doing?", onPick: function (x) { run.forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, x); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); } }); } // single-tap: tap an activity = start it (one activity at a time; no multi-select confirm step) — David 2026-06-27
  // ALWAYS OFFER NEXT (§23/§15): the earliest still-open planned block (upcoming or in-progress, not done/missed) — getting "back on plan" is one tap
  function nextPlannedBlock(k) { var best = null; blocks(k).forEach(function (b) { if (!b.title || blockStatus(k, b) !== "plan") return; if (best === null || hm(b.time) < hm(best.time)) best = b; }); return best; } // skip empty (unchosen) placeholder bubbles
  function startPlanned(b) { activeTimers().forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, { title: b.title, color: b.color, catK: b.catK }); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); } // 1-tap on-plan: matches the block's domain → gold + streak
  // PLAN A BREAK (§23): consciously declare what you're about to do — pick ANY activity + a duration → it inserts as a PINNED block at NOW, the plan reflows around it, and tracking starts. Conscious = streak-safe (the key distinction is planned-vs-drift, not work-vs-leisure).
  function planBreak(title) { bentoPicker({ title: title || "Replan from now — what, for how long?", onPick: function (x) { durationSheet(x.title, function (mins) { var k = todayK(), now = logicalNowMin(), dom = domainOf(x);
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
    { kw: ["clean", "tidy", "mess", "declutter", "house", "home", "room", "kitchen", "floor", "dishes", "laundry", "chore", "organize", "organise"], steps: ["Set a 5-min timer — just start", "Clear ONE surface (the kitchen counter)", "Just the dishes in the sink", "Put one load of laundry in", "Pick up 10 things off the floor", "Tomorrow: one more small zone"] },
    { kw: ["portfolio", "finish", "ship", "launch", "project", "build", "website", "reel", "app", "write", "book"], steps: ["List exactly what's left", "Pick the next concrete piece", "Block weekly deep-work", "Set a finish line (done > perfect)", "Share / send it out"] },
    { kw: ["save", "money", "budget", "spend", "debt", "finance"], steps: ["Set a monthly spending cap", "List your fixed costs", "Pick ONE thing to cut", "5-min weekly money check", "Move a little to savings monthly"] },
    { kw: ["business", "linkedin", "audience", "grow", "brand", "client", "sell", "post", "youtube", "channel"], steps: ["Define the one offer / message", "Pick a daily posting slot", "Batch a week of content at once", "Engage 10 min/day", "Review reach monthly"] },
    { kw: ["calm", "peace", "stress", "anxiet", "sleep", "rest", "meditat", "mindful"], steps: ["Pick a tiny daily reset (2-min breath)", "Set a wind-down cue at night", "Protect a no-screen hour", "Notice one trigger this week", "Reflect weekly — what helped"] },
    { kw: ["love", "relationship", "friend", "date", "connect", "family"], steps: ["Name who to invest in", "Schedule one real hangout this week", "Set a tiny daily reach-out", "Be present — phone away", "Reflect — who energizes you"] }
  ];
  function decomposeGoal(g) { var t = (g.title || "").toLowerCase(); for (var i = 0; i < DECOMP_TEMPLATES.length; i++) { if (DECOMP_TEMPLATES[i].kw.some(function (k) { return t.indexOf(k) !== -1; })) return DECOMP_TEMPLATES[i].steps.slice(); } return ["Define what “done” looks like", "Pick the next concrete step", "Schedule it into this week", "Set a finish line", "Review progress monthly"]; }
  function activeGoals() { return (S.goals || []).filter(function (g) { return g.active; }); }
  // GOAL HEALTH + ROTATION (David 2026-06-29 spine): hold as MANY goals as you want; surface only the STALEST few each day so a big portfolio never floods and no goal is silently forgotten.
  function goalLastK(g) { var ks = []; if (g.lastK) ks.push(g.lastK); if (g.metric && g.metric.hist) g.metric.hist.forEach(function (h) { ks.push(h.k); }); return ks.sort().pop() || ""; } // newest interaction day; "" = never touched → sorts first
  function staleGoals(n) { var gs = (S.goals || []).filter(function (g) { return g.active; }); gs.sort(function (a, b) { var ka = goalLastK(a), kb = goalLastK(b); return ka < kb ? -1 : ka > kb ? 1 : 0; }); return n ? gs.slice(0, n) : gs; }
  function goalTouch(g) { if (g) { g.lastK = todayK(); } } // stamp a goal as worked-on today (drives rotation)
  function ensureGoalDefaults() { if (!S.goals || !S.goals.length) return; if (!S.goals.some(function (g) { return ("active" in g); })) { S.goals.forEach(function (g) { g.active = true; }); save(); } } // legacy data: activate all — rotation (staleGoals) handles the surfacing now, no hard cap (David 2026-06-29)
  // ===== TINY-STEP GUARDIAN (David 2026-06-29 Wave B): the "Feels too big? / I'm scared to start" move. Shrinks a fear-gated goal to ONE 2-min impossible-to-fail step + offers the body-first Reversal of Desire. Routes via state, hands ONE tool — no menu. Anti-shame copy. Serves Mom (fear-gated sports), Sister (overwhelm), Brother (avoidance). =====
  function tinyStep(g) {
    var t = (g.title || "").toLowerCase();
    var M = [
      [/sport|gym|fit|run|exercise|workout|move|weight|yoga|buff|train/, "Put on workout clothes", "Just put on your workout clothes. That's the whole job — no gym, no trainer, your own floor."],
      [/clean|tidy|house|home|room|mess|kitchen|floor|dish|laundry|declutter|organ/, "Clear one small spot · 2 min", "Set a 2-minute timer and clear ONE small spot. Stop when it rings."],
      [/footage|edit|film|movie|reel|video/, "Open the file · look 2 min", "Just open the file and look for 2 minutes. You can close it right after."],
      [/music|song|track|record|mix|beat/, "Open project · play once", "Open the project and play it through once. That's all."],
      [/script|writ|book|story|chapter|portfolio|essay|proposal|blog/, "Write one ugly sentence", "Open the doc and write one ugly sentence. Bad on purpose."],
      [/paint|draw|art|sketch|illustrat/, "Make one mark", "Put one mark on the page. Just one."],
      [/english|learn|study|language|duolingo|read/, "One 2-min lesson", "One tiny lesson — 2 minutes. Then you're done."],
      [/post|youtube|audience|brand|social|linkedin|outreach/, "Draft one line", "Write just the first line. You can delete it later."]
    ];
    for (var i = 0; i < M.length; i++) if (M[i][0].test(t)) return { short: M[i][1], line: M[i][2] };
    return { short: "Smallest piece · 2 min", line: "Do the smallest possible piece for 2 minutes. Badly is completely fine." };
  }
  function tooBigSheet(g) {
    g.blocker = "big"; save(); // remember it felt big — future flows can stay gentle
    var ts = tinyStep(g);
    var ov = add(document.body, "div", "dur-ov"), card = add(ov, "div", "dur-card tb-shrink");
    add(card, "div", "tb-shrink-h", "Let's make it impossible to fail.");
    add(card, "div", "tb-shrink-step", ts.line);
    add(card, "div", "tb-shrink-sub", "No pressure. You can stop right after.");
    var row = add(card, "div", "dur-row");
    var go = add(row, "button", "dur-chip tb-go", "I'll try this →");
    go.onclick = function () { ov.remove(); var dom = g.domain || "focus", k = todayK(); blocks(k).push({ id: uid(), time: nextFreeTime(k), mins: 10, title: ts.short, prio: 3, star: true, color: DOM[dom].c, catK: null, domain: dom, done: false, goalId: g.title }); reflow(k); save(); renderToday(); toast("✨ tiniest step is on today — you've got this"); };
    var rev = add(row, "button", "dur-chip", "reverse the desire →"); rev.onclick = function () { ov.remove(); try { reversalOfDesire(null); } catch (e) {} };
    var x = add(card, "button", "dur-x", "not now"); x.onclick = function () { ov.remove(); };
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
  }
  function typeAdd(parent, ph, cb) { var w = add(parent, "div", "goal-add"); var inp = document.createElement("input"); inp.type = "text"; inp.placeholder = ph; inp.className = "goal-input"; w.appendChild(inp); var b = add(w, "button", "goal-addb"); b.innerHTML = '<i class="ti ti-plus"></i>'; function go() { var v = inp.value.trim(); if (v) { cb(v); inp.value = ""; } } b.onclick = go; inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } }); }
  function pickSheet(q, opts, cb) { var ov = add(document.body, "div", "dur-ov"); var card = add(ov, "div", "dur-card"); var qq = add(card, "div", "dur-q"); qq.innerHTML = q; var row = add(card, "div", "dur-row"); opts.forEach(function (o) { var c = add(row, "button", "dur-chip", o.label); c.onclick = function () { ov.remove(); cb(o.val); }; }); var x = add(card, "button", "dur-x", "cancel"); x.onclick = function () { ov.remove(); }; ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); }); }
  function scheduleSubtask(g, st) { pickSheet('<i class="ti ti-calendar-plus"></i> Schedule "' + esc(st.title) + '" — when?', [{ label: "Today", val: 0 }, { label: "Tomorrow", val: 1 }, { label: "In 3 days", val: 3 }], function (off) { var d = new Date(); d.setDate(d.getDate() + off); var k = key(d), dom = g.domain || "focus"; blocks(k).push(markFutureBlock({ id: uid(), time: nextFreeTime(k), mins: 30, title: st.title, prio: 2, color: DOM[dom].c, catK: null, domain: dom, done: false, goalId: g.title }, k)); reflow(k); st.schedK = k; goalTouch(g); save(); renderToday(); toast('📅 scheduled — ' + (off === 0 ? "today" : off === 1 ? "tomorrow" : "in 3 days") + ' · on your calendar'); }); }
  // ===== TRACKABLE GOAL METRICS (David 2026-06-29): a goal can be a NUMBER moving toward a target (weight 90→75↓, savings→target↑, followers↑). Auto-detected from the title + manually addable. Lives alongside subtasks. =====
  var METRIC_GUESS = [
    { kw: /weight|lose.*(weight|kg|lb)|slim|leaner|body\s*fat|\bbmi\b/, unit: "kg", dir: "down", label: "Weight" },
    { kw: /debt|pay\s*off|loan|owe/, unit: "$", dir: "down", label: "Debt" },
    { kw: /money|save|saving|bank|income|revenue|cash|budget|earn|rich|profit/, unit: "$", dir: "up", label: "Balance" },
    { kw: /audience|follower|subscriber|\bfans\b|reach|instagram|youtube|tiktok|grow.*(audience|brand|channel)/, unit: "followers", dir: "up", label: "Followers" },
    { kw: /\bread\b|book/, unit: "books", dir: "up", label: "Books read" },
    { kw: /run|marathon|distance|\bkm\b|miles|\b5k\b|10k/, unit: "km", dir: "up", label: "Distance" },
    { kw: /\bsteps?\b/, unit: "steps", dir: "up", label: "Steps" }
  ];
  function guessMetric(title) { var t = (title || "").toLowerCase(); for (var i = 0; i < METRIC_GUESS.length; i++) { if (METRIC_GUESS[i].kw.test(t)) { var m = METRIC_GUESS[i]; return { label: m.label, unit: m.unit, dir: m.dir, start: null, current: null, target: null, hist: [] }; } } return null; }
  function attachGuessedMetric(g) { if (g && !g.metric) { var m = guessMetric(g.title); if (m) g.metric = m; } return g; }
  function fmtNum(n) { if (n == null) return "–"; return (Math.round(n * 10) / 10).toString(); }
  function metricPct(m) { if (m.start == null || m.target == null || m.current == null) return 0; var span = m.target - m.start; if (span === 0) return 100; return Math.max(0, Math.min(100, Math.round((m.current - m.start) / span * 100))); }
  function numSheet(q, initial, unit, cb) { var ov = add(document.body, "div", "dur-ov"), card = add(ov, "div", "dur-card"); var qq = add(card, "div", "dur-q"); qq.innerHTML = q; var arow = add(card, "div", "ob-addrow"); var inp = document.createElement("input"); inp.type = "number"; inp.inputMode = "decimal"; inp.className = "ob-input"; if (initial != null) inp.value = initial; if (unit) inp.placeholder = unit; arow.appendChild(inp); var sv = add(card, "button", "dur-chip", "Save"); function go() { var v = parseFloat(inp.value); if (isNaN(v)) { inp.focus(); return; } ov.remove(); cb(v); } sv.onclick = go; inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); }); var x = add(card, "button", "dur-x", "cancel"); x.onclick = function () { ov.remove(); }; ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); }); setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60); }
  function metricSetup(g, redraw) { var m = g.metric; numSheet('<i class="ti ti-flag"></i> ' + esc(m.label) + ' — where are you NOW?' + (m.unit ? ' (' + esc(m.unit) + ')' : ''), m.current, m.unit, function (now) { m.current = now; m.start = now; numSheet('<i class="ti ti-target"></i> Your target?' + (m.unit ? ' (' + esc(m.unit) + ')' : ''), m.target, m.unit, function (tg) { m.target = tg; m.dir = tg < now ? "down" : "up"; m.hist = m.hist || []; m.hist.push({ k: todayK(), v: now }); save(); redraw(); toast("🎯 tracking " + esc(m.label).toLowerCase()); }); }); }
  function logMetric(g, redraw) { var m = g.metric; numSheet('<i class="ti ti-chart-line"></i> ' + esc(m.label) + ' now?' + (m.unit ? ' (' + esc(m.unit) + ')' : ''), m.current, m.unit, function (v) { var prev = m.current; m.current = v; if (m.start == null) m.start = v; m.hist = m.hist || []; m.hist.push({ k: todayK(), v: v }); if (m.hist.length > 60) m.hist.shift(); goalTouch(g); save(); redraw(); var hit = m.target != null && (m.dir === "down" ? v <= m.target : v >= m.target); var wasHit = m.target != null && prev != null && (m.dir === "down" ? prev <= m.target : prev >= m.target); if (hit && !wasHit) { try { celebrateGated((DOM[g.domain] || DOM.focus).c, 6); } catch (e) {} toast("🏆 " + esc(g.title) + " — target reached!"); } else { toast(hit ? "🎉 at your target!" : "📈 logged · " + fmtNum(v) + " " + m.unit); } }); }
  function metricSection(g, body, redraw) {
    if (!g.metric) { var addb = add(body, "button", "goal-metric-add"); addb.innerHTML = '<i class="ti ti-chart-line"></i> Track a number'; addb.onclick = function () { g.metric = guessMetric(g.title) || { label: "Progress", unit: "", dir: "up", start: null, current: null, target: null, hist: [] }; save(); metricSetup(g, redraw); }; return; }
    var m = g.metric;
    if (m.target == null) { var setb = add(body, "button", "goal-metric-add"); setb.innerHTML = '<i class="ti ti-chart-line"></i> Set up ' + esc(m.label.toLowerCase()) + ' tracking'; setb.onclick = function () { metricSetup(g, redraw); }; return; }
    var box = add(body, "div", "goal-metric");
    var top = add(box, "div", "gm-top"); top.innerHTML = '<span class="gm-label"><i class="ti ti-chart-line"></i> ' + esc(m.label) + '</span><span class="gm-vals">' + fmtNum(m.start) + ' → <b>' + fmtNum(m.current) + '</b> → ' + fmtNum(m.target) + ' ' + esc(m.unit) + '</span>';
    var bar = add(box, "div", "gm-bar"); var fill = add(bar, "i"); fill.style.width = metricPct(m) + "%";
    var row = add(box, "div", "gm-row"); var lg = add(row, "button", "gm-log"); lg.innerHTML = '<i class="ti ti-plus"></i> log today'; lg.onclick = function () { logMetric(g, redraw); }; add(row, "span", "gm-pct", metricPct(m) + "%");
  }
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
        var pct = (g.metric && g.metric.target != null && g.metric.current != null) ? metricPct(g.metric) : (subs.length ? Math.round(subs.filter(function (s) { return s.done; }).length / subs.length * 100) : 0);
        var pb = add(gc, "div", "goal-prog"); var pbf = add(pb, "i"); pbf.style.width = pct + "%"; pbf.style.background = dom.c; // the goal's growing arc — how far along (metric % or steps done)
        gc.onclick = function () { view = g; draw(); };
      });
      typeAdd(body, "a goal you're working toward…", function (v) { var go = { title: v, domain: domainOf({ title: v }), subtasks: [], active: true }; try { decomposeGoal(go).forEach(function (st) { go.subtasks.push({ title: st, done: false }); }); } catch (e) {} attachGuessedMetric(go); (S.goals = S.goals || []).push(go); save(); draw(); }); // auto-break on add too (David 2026-06-29 Wave B)
      add(body, "div", "goal-foot", "hold as many as you like — I rotate the stalest onto your journey so none gets forgotten");
    }
    function drawGoal(g) {
      var dom = DOM[g.domain || "focus"];
      header('<i class="ti ' + dom.ti + '"></i> ' + esc(g.title), true);
      var body = add(card, "div", "goal-body");
      var ab = add(body, "button", "goal-active-btn" + (g.active ? " on" : "")); ab.innerHTML = g.active ? '<i class="ti ti-star-filled"></i> Active — pulls into your days' : '<i class="ti ti-star"></i> On hold — tap to activate'; ab.onclick = function () { g.active = !g.active; save(); draw(); renderSuggest(todayK()); };
      metricSection(g, body, draw); // trackable number (weight / bank / followers) — auto-detected, logged with a tap (David 2026-06-29)
      var hint = add(body, "div", "goal-hint"); hint.innerHTML = '<i class="ti ti-subtask"></i> break it into steps → schedule them into your days';
      var brow = add(body, "div", "goal-brow");
      var bd = add(brow, "button", "goal-breakdown"); bd.innerHTML = '<i class="ti ti-wand"></i> Break it down for me'; bd.onclick = function () { var have = {}; (g.subtasks || []).forEach(function (s) { have[s.title.toLowerCase()] = 1; }); decomposeGoal(g).forEach(function (st) { if (!have[st.toLowerCase()]) (g.subtasks = g.subtasks || []).push({ title: st, done: false }); }); save(); draw(); };
      var tb = add(brow, "button", "goal-toobig"); tb.innerHTML = '😰 Feels too big?'; tb.onclick = function () { tooBigSheet(g); };
      add(body, "div", "goal-tier", "free: first-principles starter · 🧠 brain tailors it to you");
      var sl = add(body, "div", "goal-steps");
      (g.subtasks || []).forEach(function (st, i) {
        var row = add(sl, "div", "goal-step" + (st.done ? " done" : ""));
        var ck = add(row, "button", "gs-check"); ck.innerHTML = st.done ? '<i class="ti ti-circle-check-filled"></i>' : '<i class="ti ti-circle"></i>'; ck.onclick = function () { st.done = !st.done; if (st.done) goalTouch(g); save(); draw(); };
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
      // SUB-BRANCHES: any custom activity in this domain that owns sub-habits branches outward from its planet — "see a life through its habits" (David 2026-06-27)
      var subs = (S.acts || []).filter(function (s) { return s.domain === d && s.children && s.children.length; });
      subs.forEach(function (sa, si) {
        var nsub = sa.children.length, base = a + (si - (subs.length - 1) / 2) * 0.38;
        sa.children.forEach(function (kid, ki) {
          var ka = base + (ki - (nsub - 1) / 2) * 0.16, KR = R + 17, kx = 50 + KR * Math.cos(ka), ky = 50 + KR * Math.sin(ka);
          var kl = document.createElementNS("http://www.w3.org/2000/svg", "line"); kl.setAttribute("x1", x2); kl.setAttribute("y1", y2); kl.setAttribute("x2", kx); kl.setAttribute("y2", ky); kl.setAttribute("stroke", "#3a1730"); kl.setAttribute("stroke-width", "0.7"); svg.appendChild(kl);
          var kn = add(stage, "div", "mind-sub-node"); kn.style.left = kx + "%"; kn.style.top = ky + "%"; kn.style.background = mixDark(D.c); kn.style.borderColor = D.dark; kn.title = kid;
        });
      });
    });
    var you = add(stage, "div", "mind-you"); you.innerHTML = '<i class="ti ti-mood-smile"></i>';
    add(body, "div", "goal-foot", "bigger = more of your life · sprigs = your sub-habits · tap a planet to do something there");
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
    var body = add(card, "div", "bento-body"), adding = false, openSub = null, openDom = {}; // openSub = parent whose sub-editor shows; openDom = which domains are expanded past the first few (David 2026-06-28)
    var CAP = 8; // calm: show a few chips per domain, the rest behind one "+N more" so the page stops shouting (David 2026-06-28)
    function isCustom(a) { return (S.acts || []).some(function (c) { return (c.title || "").toLowerCase() === (a.title || "").toLowerCase(); }); }
    function draw() {
      body.innerHTML = "";
      add(body, "div", "sughead", "your activities — tap one to edit, ✕ to remove, or add a new one");
      var by = bentoByDomain();
      DOM_ORDER.forEach(function (d) {
        var acts = (by[d] || []).slice(); if (!acts.length) return; var D = DOM[d];
        acts.sort(function (x, y) { return (isCustom(x) ? 0 : 1) - (isCustom(y) ? 0 : 1); }); // your own first — those are the ones you actually edit/remove here
        var sh = add(body, "div", "habit-dh"); sh.style.color = D.light; sh.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + D.l;
        var row = add(body, "div", "habit-row");
        var expanded = !!openDom[d], shown = expanded ? acts : acts.slice(0, CAP);
        shown.forEach(function (a) {
          var custom = (S.acts || []).filter(function (c) { return (c.title || "").toLowerCase() === (a.title || "").toLowerCase(); })[0];
          var kids = (custom && custom.children) || [];
          var chip = add(row, "span", "bchip"); if (a.domain !== "drift") { chip.style.background = D.c; chip.style.color = D.ink; }
          chip.innerHTML = '<i class="ti ' + tiClass(a) + '"></i> ' + esc(a.title) + (kids.length ? ' <span class="bchip-n">' + kids.length + '</span>' : '');
          if (custom) { chip.style.cursor = "pointer"; chip.onclick = function () { openSub = (openSub === custom ? null : custom); adding = false; draw(); }; var del = document.createElement("i"); del.className = "ti ti-x habit-del"; chip.appendChild(del); del.onclick = function (e) { e.stopPropagation(); S.acts = (S.acts || []).filter(function (c) { return c !== custom; }); openSub = null; save(); draw(); }; }
        });
        var rest = acts.length - shown.length;
        if (rest > 0) { var mo = add(row, "span", "bchip more"); mo.style.background = mixHex(D.c, "#160510", 0.5); mo.style.color = D.light; mo.textContent = "+" + rest + " more"; mo.onclick = function () { openDom[d] = true; draw(); }; }
        else if (expanded && acts.length > CAP) { var le = add(row, "span", "bchip more"); le.style.background = mixHex(D.c, "#160510", 0.5); le.style.color = D.light; le.textContent = "less"; le.onclick = function () { openDom[d] = false; draw(); }; }
        if (openSub && openSub.domain === d) drawSubEditor(body, openSub, D);
      });
      if (!adding) { var ab = add(body, "div", "bento-add"); ab.innerHTML = '<i class="ti ti-plus"></i> add a habit / activity'; ab.onclick = function () { adding = true; draw(); }; }
      else {
        var frm = add(body, "div", "habit-addform");
        var inp = document.createElement("input"); inp.type = "text"; inp.className = "bento-input"; inp.placeholder = "name it (e.g. Climbing, Therapy)…"; frm.appendChild(inp);
        add(frm, "div", "bento-lbl", "category");
        var crow = add(frm, "div", "bento-cats"), chosen = { d: "focus" };
        DOM_ORDER.forEach(function (d) { var D = DOM[d], c = add(crow, "span", "bento-pick" + (d === chosen.d ? " on" : ""), D.l); c.style.background = D.c; c.style.color = D.ink; c.onclick = function () { chosen.d = d; Array.prototype.forEach.call(crow.children, function (n) { n.classList.remove("on"); }); c.classList.add("on"); }; });
        var go = add(frm, "button", "bento-save"); go.innerHTML = 'add <i class="ti ti-check"></i>'; go.onclick = function () { var nm = inp.value.trim(); if (!nm) { inp.focus(); return; } S.acts = S.acts || []; if (!(S.acts.some(function (c) { return c.title.toLowerCase() === nm.toLowerCase(); }) || TITLE2CAT[nm.toLowerCase()])) S.acts.push({ title: nm, catK: null, domain: chosen.d, children: [] }); save(); adding = false; draw(); toast("added " + nm); };
        setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
      }
    }
    // sub-habit editor for ONE parent: lists its children as mini-chips, add/remove tap-driven (David 2026-06-27)
    function drawSubEditor(parent_, p, D) {
      var pan = add(parent_, "div", "subhab-pan"); pan.style.borderColor = D.c;
      var hd = add(pan, "div", "subhab-hd"); hd.style.color = D.light; hd.innerHTML = '<i class="ti ' + tiClass(p) + '"></i> ' + esc(p.title) + ' — sub-habits';
      p.children = p.children || [];
      var srow = add(pan, "div", "habit-row");
      if (!p.children.length) add(srow, "div", "subhab-empty", "no sub-habits yet — break it into smaller steps");
      p.children.forEach(function (kid, i) { var k = add(srow, "span", "bchip sub"); k.style.background = D.dark; k.style.color = "#fff"; k.innerHTML = '<i class="ti ti-corner-down-right"></i> ' + esc(kid); var kd = document.createElement("i"); kd.className = "ti ti-x habit-del"; k.appendChild(kd); kd.onclick = function (e) { e.stopPropagation(); p.children.splice(i, 1); save(); draw(); }; });
      var sf = add(pan, "div", "habit-addform");
      var si = document.createElement("input"); si.type = "text"; si.className = "bento-input"; si.placeholder = "sub-habit (e.g. Define the ONE thing)…"; sf.appendChild(si);
      var sg = add(sf, "button", "bento-save"); sg.innerHTML = 'add step <i class="ti ti-check"></i>'; sg.onclick = function () { var nm = si.value.trim(); if (!nm) { si.focus(); return; } if (p.children.some(function (c) { return c.toLowerCase() === nm.toLowerCase(); })) { si.value = ""; return; } p.children.push(nm); save(); draw(); };
      setTimeout(function () { try { si.focus(); } catch (e) {} }, 60);
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
  var _ttapT = 0, _ttapX = 0, _ttapY = 0; // double-tap-to-zoom tracking on the timeline (David 2026-07-02)
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
  // ONE source of truth for a bar's pixel height (David 2026-06-27): true time-height MINUS a 4px margin, floored at a small minimum — but CLAMPED to never exceed the true slot (durMin/60*HP). The clamp is what kills the back-to-back overlap at zoom-out: a 5min bar at low zoom used to floor to 5px and eat into the next bubble; now it can never be taller than its own slot, so abutting bubbles always abut, never overlap. Tall bars (true-4 >= MINBAR) are UNCHANGED (= the old Math.max(5, …/60*HP-4) for anything >=9px tall). Used by place(), the straddle/partial/real heights AND the live-pinch relayout so live + commit stay byte-identical (no zoom-bounce). MINBAR matches the old floor (5) so nothing shifts for normal bars.
  var MINBAR = 5;
  function barH(durMin, HP) { var t = durMin / 60 * HP; return Math.min(t, Math.max(MINBAR, t - 4)); }
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
        for (var i = 0; i < list.length; i++) { var e = list[i], mn = +e.dataset.mn, off = +(e.dataset.off || 0); e.style.top = ((mn - startH * 60) / 60 * nv + off) + "px"; if (e.dataset.dur != null) e.style.height = barH(+e.dataset.dur, nv) + "px"; } // barH = SAME floor/margin/clamp as the render → live + commit heights match → no bounce on release (David 2026-06-27)
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
  // smooth zoom between day/week/month — buttery CROSSFADE+SCALE: freeze the OUTGOING scope as a snapshot overlay, build the new scope underneath, then crossfade opacity + scale the new view INTO place (zoom-out grows past→present; zoom-in shrinks toward it) so the day appears to fold into its slot in the week and the week into the month. GPU transform+opacity only — no layout thrash, no glow (locked palette). Double-guarded cleanup so a ghost snapshot can never stick. (David 2026-06-27 — replaces the flat single-keyframe pop)
  var _zoomSnapTO = 0;
  function zoomAnim(dir) {
    var p = el("pullBody");
    if (!p) { buildPull(); return; }
    // tear down any in-flight snapshot from a rapid double-zoom so two ghosts can never stack
    var stale = p.querySelector(".zoom-snap"); if (stale) stale.remove(); if (_zoomSnapTO) { clearTimeout(_zoomSnapTO); _zoomSnapTO = 0; }
    // 1) freeze the CURRENT (outgoing) view as a visual-only overlay BEFORE buildPull wipes it
    var snap = document.createElement("div"); snap.className = "zoom-snap";
    var kids = p.childNodes, frag = document.createDocumentFragment();
    for (var i = 0; i < kids.length; i++) frag.appendChild(kids[i].cloneNode(true));
    snap.appendChild(frag);
    // 2) build the new scope (this wipes p and repopulates it)
    buildPull();
    p = el("pullBody"); if (!p) return;
    // 3) layer the frozen outgoing snapshot ON TOP of the freshly-built new view
    p.appendChild(snap);
    // 4) crossfade + scale. Zoom OUT (dir>0): new view starts a touch LARGER (1.08) and settles to 1 → the day "lands" into the bigger frame; the snapshot shrinks+fades. Zoom IN (dir<0): new view starts smaller (0.92) and grows to 1; snapshot grows+fades. Mirror the snapshot the opposite way so the two meet seamlessly.
    var inScale = dir > 0 ? 1.08 : 0.92, outScale = dir > 0 ? 0.9 : 1.12, EASE = "cubic-bezier(.2,.7,.3,1)", DUR = 0.30;
    p.style.willChange = "transform, opacity";
    p.style.transition = "none"; p.style.opacity = "0"; p.style.transform = "scale(" + inScale + ")";
    snap.style.transition = "none"; snap.style.opacity = "1"; snap.style.transform = "scale(1)";
    void p.offsetHeight; // flush the start state so the transition has somewhere to animate FROM
    p.style.transition = "opacity " + DUR + "s " + EASE + ", transform " + DUR + "s " + EASE;
    snap.style.transition = "opacity " + DUR + "s " + EASE + ", transform " + DUR + "s " + EASE;
    p.style.opacity = "1"; p.style.transform = "scale(1)";
    snap.style.opacity = "0"; snap.style.transform = "scale(" + outScale + ")";
    var done = false;
    function fin() { if (done) return; done = true; clearTimeout(_zoomSnapTO); _zoomSnapTO = 0; p.removeEventListener("transitionend", fin); try { snap.remove(); } catch (e) {} p.style.transition = ""; p.style.transform = ""; p.style.opacity = ""; p.style.willChange = ""; } // restore the live view to its natural state; drop the snapshot
    p.addEventListener("transitionend", fin);
    _zoomSnapTO = setTimeout(fin, DUR * 1000 + 120); // fallback so a missed transitionend never strands the snapshot (mirrors pageSlide's double-guard)
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
      cell.onclick = function () { if (dk === (pullFocusK || tk)) { if (dk === tk) scrollToNow(); return; } pullFocusK = dk; if (dk === tk) pendingScrollNow = true; else _scrollToFocus = true; buildPull(); }; // jump the scroll ONTO the picked day (was missing → the buffer recentred but the view never moved) — David 2026-07-02
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
    item("plan", "ti-route", "Today's journey", function () { openJourney(); }); // JOURNEY PATH — the Duolingo-style daily trail; the prominent door (David 2026-06-28)
    item("plan", "ti-sun-high", (k === todayK() ? "Plan / shape today" : "Plan / shape day"), function () { shapeFlow(k); }); // THE ONE PLANNING FLOW — merged Shape+Plan, bento multi-select → order step (David 2026-06-28). Also the timeline meta-button + the once/day no-plan auto-push.
    item("", "ti-briefcase", "My toolbox", function () { openToolbox(); }); // WISDOM TOOLBOX entry (TB-SHEET) — opens the cockpit 'tool' stage
    item("", "ti-stack-2", "Habit stacks", function () { presetsSheet(k); }); // habit-stack drop-in (was inside the old Plan day sheet)
    item("", "ti-wand", "Enhance plan", function () { enhancePlan(k); });
    item("", "ti-eraser", "Clear day", function () { pushUndo(); S.blocks[k] = []; reflow(k); save(); buildPull(); toast("🧹 cleared " + relLabel(k).toLowerCase() + " — Undo in ⋯"); });
    item("", "ti-arrow-back-up", "Undo", function () { popUndo(); });
    item("", "ti-book", "Journal", function () { journalSheet(); }); // JOURNAL-SURFACE: chronological feed + on-this-day + pattern mirror (browse/history → #sheet is OK here)
    item("", "ti-compass", "Guidance", function () { guidanceSheet(); });
    item("", "ti-brain", "Brain", function () { brainSheet(); });        // AI tailoring — relocated out of the game/You surface (David 2026-06-28)
    item("", S.away ? "ti-plane-inflight" : "ti-plane", S.away ? "I'm back" : "I'm away / resting", function () { S.away = !S.away; S.awaySince = S.away ? todayK() : null; save(); toast(S.away ? "🌴 Away on — rest easy, your streaks are held" : "👋 welcome back — let's ease in"); try { if (document.body.classList.contains("journey-open")) drawJourney(true); } catch (e) {} }); // travel/off-day mode (David 2026-06-29)
    item("", "ti-sparkles", "Redo setup", function () { onboard(); });   // re-run onboarding — relocated from the old You-tab menu
    item("dev", "ti-flask", "Test day", function () { fillTestDay(); });
    setTimeout(function () { function close(e) { if (!menu.contains(e.target) && e.target !== anchor) { try { menu.remove(); } catch (er) {} document.removeEventListener("pointerdown", close, true); } } document.addEventListener("pointerdown", close, true); }, 0);
  }
  // ===== GUIDANCE DIAL (JX-GUIDANCE-TOGGLE, David 2026-06-28): the autonomy knob — Guided / Light / Off. Clones the brainSheet engine-picker idiom (pchips). Default 'off' restores today's behavior + reveals everything; choosing less is framed as leveling up, never desertion. Off silences journey nudges but the engine keeps computing silently. =====
  function guidanceSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    var g = S.guide = S.guide || { mode: "off", seedTier: 0, unlocked: [], cache: {}, offeredK: null };
    add(B, "div", "sttl", "Guidance");
    add(B, "div", "lbl", "How much should I lead? Change it anytime — choosing less is itself leveling up.");
    var opts = [["guided", "Guided", "I greet you with one next step each day."], ["light", "Light", "Quieter — the timeline leads, I just hint."], ["off", "Off", "Everything open, no nudges. This is yours."]];
    var er = add(B, "div", "pchips");
    opts.forEach(function (o) { var x = add(er, "div", "pchip" + (g.mode === o[0] ? " on" : ""), o[1]); x.onclick = function () {
      var was = g.mode; g.mode = o[0]; if (g.cache) g.cache = {}; save();
      if ((o[0] === "light" || o[0] === "off") && was === "guided") { try { earn(12, {}); } catch (e) {} try { celebrateGated(DOM.restore.c, 1); } catch (e) {} } // graduation: taking the wheel is readiness-positive, gently rewarded (once/day)
      guidanceSheet();
    }; });
    var cur = opts.filter(function (o) { return o[0] === g.mode; })[0];
    if (cur) add(B, "div", "lbl", cur[2]).style.cssText = "color:#e6cfe0;font-size:13px;";
    add(B, "button", "done2", "Done").onclick = closeSheet;
  }
  // PLAN DAY — the future-only setup entry (David 2026-06-25): pick activities or a habit stack → they land on the timeline (drag to arrange). Stacks live INSIDE here now; the below-now button is gone.
  function distributePlan(k, sel) {
    // FIX #3d: gap-fill from earliest free slot, not after ALL existing blocks.
    // Build a sorted list of occupied [start, end] ranges from existing blocks, then
    // for each new item find the earliest minute (≥ dayStart and ≥ now) where it fits.
    if (!sel || !sel.length) return;
    pushUndo();
    var arr = blocks(k);
    var dayStart = (k === todayK()) ? Math.max(8 * 60, logicalNowMin()) : 8 * 60;
    // snapshot existing occupied ranges (sorted by start time)
    var occupied = arr.map(function (b) { var s = hm(b.time); return { s: s, e: s + (b.mins || 30) }; }).sort(function (a, b) { return a.s - b.s; });
    function findSlot(fromMin, dur) {
      // find the earliest minute ≥ fromMin where dur minutes fit around all occupied ranges
      var t = fromMin, guard = 0;
      while (guard++ < 200) {
        var ok = true;
        for (var i = 0; i < occupied.length; i++) {
          if (t < occupied[i].e && t + dur > occupied[i].s) { t = occupied[i].e; ok = false; break; } // overlaps → jump past
        }
        if (ok) return t;
      }
      return t; // fallback: end of last block
    }
    var cursor = dayStart;
    sel.forEach(function (x) {
      if (!x) return;
      var dom = domainOf(x), mins = x.mins || 30, prio = x.prio || 2;
      var slot = findSlot(cursor, mins);
      slot = Math.min(1410, slot);
      arr.push({ id: uid(), time: pad(Math.floor(slot / 60)) + ":" + pad(slot % 60), mins: mins, title: x.title, color: x.color || DOM[dom].c, catK: x.catK || null, domain: dom, prio: prio });
      // add this new block to occupied so subsequent items fill around it too
      occupied.push({ s: slot, e: slot + mins }); occupied.sort(function (a, b) { return a.s - b.s; });
      cursor = slot + mins; // next item tries from where this one ends (packs tightly but still skips occupied)
    }); // honour the editor's chosen length + importance (David 2026-06-28)
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
    add(B, "button", "done2", "Done").onclick = function () { closeSheet(); shapeFlow(todayK()); }; // → the one planning flow (was the old planDay sheet)
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
        // SCOPE SWITCHER STAYS LEFT in EVERY view (day/week/month) — it used to live on the RIGHT in week/month, so it jumped sides vs day view (David flagged it 2026-06-27). Now it's the first child of `top`, same left position as day view.
        var seg = add(top, "div", "scope-seg");
        [["day", "ti-list"], ["week", "ti-layout-columns"], ["month", "ti-layout-grid"]].forEach(function (s) { var sb = add(seg, "button", "scope-b" + (pullZoom === s[0] ? " on" : "")); sb.innerHTML = '<i class="ti ' + s[1] + '"></i>'; sb.onclick = function () { if (pullZoom === s[0]) return; var o = ["day", "week", "month"], dir = o.indexOf(s[0]) > o.indexOf(pullZoom) ? 1 : -1; pullZoom = s[0]; if (pullZoom === "day") pullK = todayK(); pendingScrollNow = true; zoomAnim(dir); }; });
        add(top, "div", "pull-date", pullZoom === "week" ? "Weeks" : "Months");
        var rt = add(top, "div", "pull-rt");
        var tdb = add(rt, "button", "pull-today"); tdb.innerHTML = '<i class="ti ti-current-location"></i> Today'; tdb.onclick = findToday; // "find yourself" → smooth-scroll back to the current week/month
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
        if (n === 1) { single = true; sX = e.clientX; sY = e.clientY; swOn = false; swW = pb.clientWidth || 1; swPgr = null; } // HORIZONTAL day-slide RETIRED (David 2026-06-30): the horizontal axis now switches the 3 panes (Planner/Journey/Game) via paneSwipe; day nav = vertical continuous-scroll + week strip. Vertical drags still fall through to the continuous scroll which changes days.
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
    if (S.brk) { // ON A BREAK — a declared pause is running; the goal waits. Don't say "not tracking" — show the countdown + a one-tap resume (David 2026-06-27)
      dk.classList.add("idle"); dk.classList.remove("hasplan"); var _bD = DOM[S.brk.dom] || DOM.restore, _br = S.brk.start + S.brk.mins * 60000 - Date.now(), _bup = _br <= 0;
      if (st) { st.innerHTML = '<i class="ti ti-player-play-filled"></i>'; st.style.setProperty("background", _bD.c, "important"); st.style.setProperty("color", _bD.ink, "important"); st.style.removeProperty("--ldrim"); }
      if (ad) ad.innerHTML = '<i class="ti ti-coffee"></i> On a break' + (S.brk.title ? ' · ' + esc(S.brk.title) + ' waits' : '');
      if (su) su.textContent = _bup ? "break's up — tap to resume" : "tap to resume your goal";
      if (elx) { elx.removeAttribute("data-tid"); elx.classList.add("ld-brkcd"); elx.setAttribute("data-brk", "1"); elx.textContent = fmtCD(Math.max(0, _br)); } // its own live hook — the 1s loop updates [data-brk] like it does .live-elapsed
    } else if (!t) { // IDLE — nothing tracking: the dock is a "start" bar
      dk.classList.add("idle"); dk.classList.toggle("hasplan", !!nb0); // Play IS "start the plan" → the separate Plan button is redundant and hidden (David 2026-06-26)
      if (nb0) { var _pD = DOM[domainOf(nb0)] || DOM.focus; if (st) { st.innerHTML = '<i class="ti ti-player-play-filled"></i>'; st.style.setProperty("background", _pD.c, "important"); st.style.setProperty("color", _pD.ink, "important"); st.style.removeProperty("--ldrim"); } if (ad) ad.innerHTML = tiIcon(nb0) + ' <b>' + esc(nb0.title) + '</b>'; if (su) su.textContent = "▶ start your plan"; } // the play button wears the upcoming activity's colour; pressing it = you agree to do the plan and start tracking it
      else { if (st) { st.innerHTML = '<i class="ti ti-player-play"></i>'; st.style.removeProperty("background"); st.style.removeProperty("color"); st.style.removeProperty("--ldrim"); } if (ad) ad.innerHTML = '<i class="ti ti-clock"></i> Not tracking'; if (su) su.textContent = "tap ▶ or pick below to start"; }
      if (elx) { elx.textContent = ""; elx.removeAttribute("data-tid"); elx.classList.remove("ld-brkcd"); elx.removeAttribute("data-brk"); }
    } else {
      dk.classList.remove("idle"); dk.classList.remove("hasplan");
      var dom = domainOf(t), D = DOM[dom] || DOM.focus, drift = (dom === "drift");
      var d0 = new Date(t.start), s0 = d0.getHours() * 60 + d0.getMinutes(), e0 = nowMin(), on = false;
      if (!drift) blocks(todayK()).forEach(function (b) { var bs = hm(b.time), be = bs + (b.mins || 30); if (s0 < be && e0 > bs && domainOf(b) === dom) on = true; });
      // FOLDED BUTTON = a MINI of the big ring (David 2026-06-28): a small STRIPED activity circle (same texture/colour as #tfTile) wearing the activity icon; a thin GREEN rim when on-plan = the mini reward band. It morphs into #tfRing on open. (Tapping it still stops the timer.)
      if (st) { st.innerHTML = tiIcon(t); st.style.setProperty("background", tfStripe(D.c), "important"); st.style.setProperty("color", D.ink || "#160510", "important"); st.style.setProperty("--ldrim", on ? "rgba(40,207,134,.95)" : "rgba(0,0,0,0)"); }
      var badge = on ? '<span style="font-size:8px;font-weight:700;color:' + D.ink + ';background:' + D.c + ';border:1.5px solid #160510;border-radius:9px;padding:1px 6px">ON PLAN</span>' : (drift ? '<span style="font-size:8px;font-weight:700;color:#ece6f2;background:' + DOM.drift.c + ';border:1.5px solid #160510;border-radius:9px;padding:1px 6px">DRIFT</span>' : '');
      if (ad) ad.innerHTML = tiIcon(t) + ' ' + esc(t.title || "Tracking") + ' ' + badge;
      var driftMin = Math.floor((Date.now() - t.start) / 60000), nudge = !on && driftMin >= 10; // off-plan (drift or no covering block) for 10+ min → a gentle "back?" offer (David 2026-06-27)
      if (su) { su.textContent = nudge ? "drifting a while — tap to get back on plan" : (on ? "matches your plan" : (drift ? "off plan — logged honestly" : "tracking · no plan")); su.classList.toggle("ld-nudge", nudge); }
      if (elx) { elx.setAttribute("data-tid", t.id); elx.classList.remove("ld-brkcd"); elx.removeAttribute("data-brk"); elx.textContent = elapsedStr(t); }
    }
    renderDockSeg(); // the folded seg row MIRRORS the expanded tracker's secondary controls (same shared matrix) — David 2026-06-28
    if (!dk._wired) { dk._wired = 1;
      el("ldStop").onclick = function () { if (S.brk) { tfResumeBreak(); return; } var r = activeTimers(); if (r.length) { stopTimer(r[r.length - 1].id); } else { var nb = nextPlannedBlock(todayK()); if (nb) startPlanned(nb); else startOrSwitch(); } }; // on a break → resume the goal; else Play = start the plan / Stop = stop — David 2026-06-26
      el("ldSw").onclick = function () { startOrSwitch(); };
      var _info = dk.querySelector(".ld-info"), _grab = dk.querySelector(".ld-grab"), _sub = el("ldSub"); // tap the dock body/handle → expand to the full RING tracker (David 2026-06-27)
      if (_sub) { _sub.onclick = function (e) { if (!_sub.classList.contains("ld-nudge")) return; e.stopPropagation(); var nb = nextPlannedBlock(todayK()); if (nb) startPlanned(nb); else planBreak(); }; } // nudge sub-line tap = get back on plan (1-tap), else fall through to the info-tap (David 2026-06-27)
      if (_info) { _info.style.touchAction = "none"; _info.addEventListener("pointerdown", function (e) { tfDrag(e, true); }); } // TAP or DRAG-UP the dock body → expand via the shared-element morph (tap-to-open restored — David 2026-06-28)
      if (_grab) { _grab.style.touchAction = "none"; _grab.addEventListener("pointerdown", function (e) { tfDrag(e, true); }); } // tap or drag the dock handle UP → expand (morph)
      var _tx = el("tfClose"); if (_tx) _tx.onclick = function () { closeTrackerFull(); };
      var _bd = el("tfBackdrop"); if (_bd) _bd.onclick = function () { closeTrackerFull(); }; // tap the calendar peek above the sheet → close
      var _tg = el("tfGrab"); if (_tg) { _tg.style.touchAction = "none"; _tg.addEventListener("pointerdown", function (e) { tfDrag(e, false); }); } // drag the tracker handle DOWN → close (finger-follow)
      var _stg = document.querySelector("#trackerFull .tf-stage"); if (_stg) { _stg.style.touchAction = "none"; _stg.addEventListener("pointerdown", function (e) { if (e.target.closest("button,.tf-chip,.tf-title.switchable,textarea,input,[contenteditable],#tfStageBody")) return; tfDrag(e, false); }); } // CKPT-3: also bail on stage inputs/scroll so a textarea tap or stage scroll isn't eaten by tfDrag(down) (the iOS-keyboard rule) // drag DOWN anywhere on the central ring/area → close (reachable, no need to reach the top handle); taps on buttons/chips/pill still work
    }
    if (TF_OPEN) renderTrackerFull(); // keep the expanded ring in sync whenever the dock re-renders
  }
  function renderDockSeg() { // FOLDED seg row = the EXPANDED tracker's secondary controls, compact (one shared matrix → folded == expanded per state) — David 2026-06-28
    var seg = document.querySelector("#liveDock .ld-seg"); if (!seg) return;
    var st = trackerState().id, sec = trackerControls(st); // FULL per-state set, identical to the expanded tracker (folded == expanded; nothing dropped; play/stop circle is a bonus quick-action) — David 2026-06-28
    seg.innerHTML = "";
    sec.forEach(function (x) { var bn = add(seg, "button", "ld-b"); bn.innerHTML = '<i class="ti ' + x.icon + '"></i> ' + x.label; bn.onclick = x.fn; });
    seg.style.display = sec.length ? "" : "none"; // nothing secondary for this state → no empty row (collapsed-corner rule still hides it via CSS)
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
  var TF_OPEN = false, TF_ANIM = false, _ringP = 0, _ringRaf = 0; // TF_ANIM = a morph is in flight → guards against a second open/close firing mid-animation (the "expands all over again" bug — David 2026-06-28)
  // ===== COCKPIT STAGE MODE (CKPT-2, David 2026-06-28): a SINGLE transient axis layered on TOP of trackerState(). null/'track' = today's centered ring (the 6 trackerState branches, UNCHANGED). Non-null = a guided flow that corner-poses the ring + fills #tfStageBody. Reset on close + at the top of load() so a crash never strands a half-built flow with a dangling timer. Default null + S.guide.mode 'off' = byte-for-byte today (no auto-trigger this wave). =====
  var TF_MODE = null, TF_MODE_USERSET = false, TF_BLOCKID = null;
  // ===== SHARED-ELEMENT MORPH (FLIP) — the folded dock's mini elements FLY/GROW into their big counterparts, and back (David 2026-06-28) =====
  // Replaces the old height-rise + content-crossfade. Pairs: mini #ldStop circle → big #tfRing circle (UNIFORM scale only — never distort);
  // mini #ldAct → big #tfTitle; mini #ldEl → big #tfTime; mini .ld-seg → big #tfCtrls. Secondary content (verdict/ctx/chips/clock/spark) just fades.
  var TF_PAIRS = [["ldStop", "tfRing", true], ["ldAct", "tfTitle", false], ["ldEl", "tfTime", false], [".ld-seg", "tfCtrls", false]]; // [miniSel, bigId, isCircle]
  function _tfNode(sel) { return sel.charAt(0) === "." ? document.querySelector("#liveDock " + sel) : el(sel); }
  // For each pair: measure the BIG element's final rect (Last) and the MINI element's rect (First); return the inverse transform that
  // makes the big element START at the mini position+size. Circles use a single uniform scale (width ratio) so they never stretch.
  function _flipStart(big, mini) { // rectangular pairs: top-left FLIP (transform-origin:0 0) — translate the big's corner onto the mini's, scale to the mini's size. Returns numeric components so the morph can be lerped frame-by-frame.
    var b = big.getBoundingClientRect(), m = mini.getBoundingClientRect();
    if (!b.width || !m.width) return null;
    return { tx: m.left - b.left, ty: m.top - b.top, sx: m.width / b.width, sy: m.height / b.height };
  }
  function _flipStartCircle(big, mini) { // circle pairs: UNIFORM scale only (no distortion), centres coincide
    var b = big.getBoundingClientRect(), m = mini.getBoundingClientRect(); if (!b.width || !m.width) return null;
    var s = Math.min(m.width / b.width, m.height / b.height);
    var mcx = m.left + m.width / 2, mcy = m.top + m.height / 2;
    // transform-origin is 0 0; scale about top-left then correct so the CENTRES coincide
    var dx = mcx - (b.left + b.width / 2 * s), dy = mcy - (b.top + b.height / 2 * s);
    return { tx: dx, ty: dy, sx: s, sy: s }; // uniform: sx===sy
  }
  function _tfTf(c, f) { // serialize a flip component at fraction f (0 = mini start, 1 = big/identity), lerping each component toward identity
    var g = 1 - f; return "translate(" + (c.tx * g) + "px," + (c.ty * g) + "px) scale(" + (c.sx + (1 - c.sx) * f) + "," + (c.sy + (1 - c.sy) * f) + ")";
  }
  function _tfPairs() { // measure all pairs now; returns [{big, c}] where c is the flip components (circle = uniform). Big rects must already be at full layout (tf .on).
    var out = []; TF_PAIRS.forEach(function (p) { var big = el(p[1]), mini = _tfNode(p[0]); if (!big || !mini) return;
      var c = p[2] ? _flipStartCircle(big, mini) : _flipStart(big, mini); if (!c) return; out.push({ big: big, c: c }); }); return out;
  }
  function tfSetFrac(f, pairs) { // DRAG-DRIVEN morph: place every big element at its lerped position for fraction f (no transition — under the finger). Background opacity tracks f.
    var tf = el("trackerFull"); if (!tf) return; f = Math.max(0, Math.min(1, f));
    (pairs || _tfPairs()).forEach(function (q) { q.big.style.transform = _tfTf(q.c, f); q.big.style.opacity = (0.001 + 0.999 * f).toFixed(3); });
    tf.style.opacity = f.toFixed(3);
  }
  function tfMorph(opening, done) { // run the FLIP forward (opening) or reverse (closing) via CSS transition; call done() at the end
    var tf = el("trackerFull"); if (!tf) { if (done) done(); return; }
    var pairs = _tfPairs();
    tf.classList.add("tf-morphing"); pairs.forEach(function (q) { q.big.classList.add("tf-morph"); }); // arm the elements
    if (opening) { pairs.forEach(function (q) { q.big.style.transform = _tfTf(q.c, 0); q.big.style.opacity = "0.001"; }); tf.classList.remove("tf-bg"); tf.style.opacity = "0"; } // OPEN: start AT the mini spot, transparent bg
    else { pairs.forEach(function (q) { q.big.style.transform = ""; q.big.style.opacity = ""; }); tf.classList.remove("tf-bg"); tf.style.opacity = ""; } // CLOSE: start AT the big spot (identity), bg shown
    void tf.offsetHeight; // FORCE REFLOW so the start state registers before the transition (rAF is throttled in the headless preview — this repo relies on this)
    tf.classList.add("tf-bg");
    if (opening) { tf.style.opacity = "1"; pairs.forEach(function (q) { q.big.style.transform = ""; q.big.style.opacity = ""; }); } // → fly to the big spots + fade bg in
    else { tf.style.opacity = "0"; pairs.forEach(function (q) { q.big.style.transform = _tfTf(q.c, 0); q.big.style.opacity = "0.001"; }); } // → shrink back into the mini spots + fade bg out
    var fin = function () { tf.removeEventListener("transitionend", fin); clearTimeout(to);
      tf.classList.remove("tf-morphing"); pairs.forEach(function (q) { q.big.classList.remove("tf-morph"); q.big.style.transform = ""; q.big.style.opacity = ""; });
      if (done) done(); };
    var to = setTimeout(fin, 460); tf.addEventListener("transitionend", function te(e) { if (e.target === tf && e.propertyName === "opacity") { tf.removeEventListener("transitionend", te); fin(); } });
  }
  function tfSettle(pairs, f0, toOpen, done) { // RELEASE: animate the remaining fraction from f0 → (toOpen?1:0) via the CSS transition, reusing the void-reflow trick (rAF is throttled in the preview)
    var tf = el("trackerFull"); if (!tf) { if (done) done(); return; }
    tf.classList.remove("tf-bg"); // ensure the start state is set WITHOUT a transition
    tfSetFrac(f0, pairs); void tf.offsetHeight; // register start
    tf.classList.add("tf-bg"); // now transitions are live
    var f1 = toOpen ? 1 : 0;
    pairs.forEach(function (q) { q.big.style.transform = toOpen ? "" : _tfTf(q.c, 0); q.big.style.opacity = toOpen ? "" : "0.001"; });
    tf.style.opacity = String(f1);
    var fin = function () { tf.removeEventListener("transitionend", te); clearTimeout(to);
      tf.classList.remove("tf-morphing"); pairs.forEach(function (q) { q.big.classList.remove("tf-morph"); q.big.style.transform = ""; q.big.style.opacity = ""; });
      if (done) done(); };
    function te(e) { if (e.target === tf && e.propertyName === "opacity") fin(); }
    var to = setTimeout(fin, 460); tf.addEventListener("transitionend", te);
  }
  function openTrackerFull() { var tf = el("trackerFull"), dk = el("liveDock"), bd = el("tfBackdrop"); if (!tf) return;
    if (TF_OPEN || TF_ANIM) return; // ONE clean expand per gesture — never re-open while open or mid-morph (David 2026-06-28)
    TF_OPEN = true; TF_ANIM = true; S._claimDismissed = false; _ringP = 0; renderTrackerFull();
    tf.style.height = ""; tf.style.borderRadius = ""; tf.classList.remove("tf-bg"); tf.classList.add("on"); if (bd) bd.classList.add("on");
    if (dk) dk.classList.add("ld-morphing"); // hide the mini dock elements during the morph (their big twins are flying)
    tfMorph(true, function () { TF_ANIM = false; }); }
  function closeTrackerFull() { var tf = el("trackerFull"), dk = el("liveDock"), bd = el("tfBackdrop"); if (!tf) return;
    if (!TF_OPEN || TF_ANIM) return; TF_ANIM = true; if (bd) bd.classList.remove("on");
    // CRITICAL FLIP GUARD (CKPT-2): clear the stage mode + un-stage the ring BEFORE tfMorph(false), so the close FLIP never measures a corner-posed ring and flies to the wrong spot. (David 2026-06-28)
    TF_MODE = null; TF_MODE_USERSET = false; tf.classList.remove("tf-staged");
    tfMorph(false, function () { tf.classList.remove("on", "tf-bg"); tf.style.height = ""; tf.style.opacity = ""; tf.style.borderRadius = ""; if (dk) dk.classList.remove("ld-morphing"); TF_OPEN = false; TF_ANIM = false; }); }
  function tfDrag(ev, opening) { // folded: drag UP on the dock → expand (FINGER-FOLLOWED morph). open: drag DOWN on the sheet → close (morph). A real drag past threshold commits; otherwise it snaps back. A plain tap plays the full animated morph. (David 2026-06-28)
    ev.preventDefault(); var tf = el("trackerFull"); if (!tf) return; var sy = ev.clientY, H = window.innerHeight || 800, moved = false;
    if (opening && (TF_OPEN || TF_ANIM)) return; if (!opening && (!TF_OPEN || TF_ANIM)) return;
    var TARGET = H * 0.42, dk = el("liveDock"), bd = el("tfBackdrop"), pairs = null, dragging = false; // TARGET = drag distance that = fully open (f=1)
    function begin() { // arm the drag-morph: lay the sheet out full-size (so the big rects are real), measure pairs, snap everything to f=0 under the finger — NO transition yet
      if (dragging) return; dragging = true; TF_ANIM = true; S._claimDismissed = false; _ringP = 0; renderTrackerFull();
      tf.style.height = ""; tf.style.borderRadius = ""; tf.classList.remove("tf-bg"); tf.classList.add("on"); if (bd) bd.classList.add("on");
      if (dk) dk.classList.add("ld-morphing"); tf.classList.add("tf-morphing");
      pairs = _tfPairs(); pairs.forEach(function (q) { q.big.classList.add("tf-morph"); });
      void tf.offsetHeight; tfSetFrac(0, pairs); // start collapsed-into-the-mini-spot
    }
    function mv(e) { var dy = e.clientY - sy; if (!moved && Math.abs(dy) > 4) moved = true;
      if (opening) { if (-dy > 4) { if (!dragging) begin(); if (dragging) tfSetFrac((-dy) / TARGET, pairs); } } // grow UNDER the finger in real time
    }
    function up(e) { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); var dy = e.clientY - sy;
      if (opening) {
        if (!moved) { if (dragging) { /* never started a real drag */ } openTrackerFull_fromDrag(dragging, pairs); return; } // plain tap → full animated morph
        var f = Math.max(0, Math.min(1, (-dy) / TARGET));
        if (!dragging) { if (-dy > H * 0.06) openTrackerFull(); return; } // tiny flick before begin armed → just open
        if (f >= 0.35) { tfSettle(pairs, f, true, function () { TF_OPEN = true; TF_ANIM = false; }); } // past threshold → finish opening
        else { tfSettle(pairs, f, false, function () { tf.classList.remove("on", "tf-bg"); tf.style.height = ""; tf.style.opacity = ""; tf.style.borderRadius = ""; if (bd) bd.classList.remove("on"); if (dk) dk.classList.remove("ld-morphing"); TF_OPEN = false; TF_ANIM = false; }); } // snap back closed
      }
      else { if (moved && dy > H * 0.10) closeTrackerFull(); } } // drag DOWN past threshold → close; a tap on the sheet body does nothing
    function openTrackerFull_fromDrag(wasArmed, pr) { // tap path: if we already armed (laid out + measured), just run the full morph from f=0; else go through the normal open
      if (!wasArmed) { openTrackerFull(); return; }
      tfSettle(pr, 0, true, function () { TF_OPEN = true; TF_ANIM = false; });
    }
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }
  function claimableBlock() { // the single most-likely plan block covering a passed/straddling gap with NO matching real log — the welcome-back "claim" target
    var k = todayK(), now = logicalNowMin(), best = null;
    blocks(k).forEach(function (b) { if (!b.title) return; var bs = hm(b.time), be = bs + (b.mins || 30); if (bs >= now) return; if (b.done || blockStatus(k, b) === "ok") return; if (be <= bs) return; if (!best || bs > hm(best.time)) best = b; }); // most-recent unfulfilled block whose start is already behind now
    if (!best) return null; var bs = hm(best.time), be = bs + (best.mins || 30); return { block: best, gapStartMin: bs, gapEndMin: Math.min(be, now) };
  }
  function avoidedBlock() { // a STARRED or high-prio plan block whose start has slid past the now-line, still undone, with no real coverage — the Reversal-of-Desire target (TB-DRIFT-HANDOFF)
    var k = todayK(), now = logicalNowMin(), best = null;
    blocks(k).forEach(function (b) { if (!b.title || b.done) return; if (!(b.star || (b.prio || 0) >= 3)) return; var bs = hm(b.time); if (bs >= now) return; if (blockStatus(k, b) === "ok") return; if (!best || bs > hm(best.time)) best = b; });
    return best;
  }
  function trackerState() { // derive the matrix state from live data (on-plan / off / idle / break / breakup / claim / night)
    if (S.brk) { var bend = S.brk.start + S.brk.mins * 60000; return { id: (Date.now() < bend ? "break" : "breakup"), brk: S.brk }; } // a declared break is running (or its time is up)
    var run = activeTimers(), t = run[run.length - 1];
    if (!t) { // nothing tracking → check for a claimable gap (welcome-back), then logical-night (off-hours), else idle
      if (!S._claimDismissed) { var cb = claimableBlock(); if (cb) return { id: "claim", block: cb.block, gapStartMin: cb.gapStartMin, gapEndMin: cb.gapEndMin }; }
      var ln = logicalNowMin(); if (ln >= bedHour() * 60 || ln < DAYSTART + 60) return { id: "night" }; // after bedtime or before ~5am → calm nightlight
      return { id: "idle", t: null };
    }
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
    var _sfEl = el("sfReadout"); if (_sfEl) { var _sfv = sfNow(); _sfEl.innerHTML = "✦ Soul Force <b>" + _sfv.sf + "</b>"; } // B: live Soul Force readout (updates on every cockpit render)
    // COCKPIT PRE-BRANCH (CKPT-2): if a guided stage mode is active, corner-pose the ring (CSS .tf-staged) + delegate the freed area to #tfStageBody, then RETURN. With TF_MODE null (default) this is a no-op and the existing 6-state body below runs UNTOUCHED → zero behavior change. (David 2026-06-28)
    tf.classList.toggle("tf-staged", !!TF_MODE);
    if (TF_MODE) {
      var _ck2 = el("tfClock"); if (_ck2) _ck2.textContent = fmt(nowMin()).toUpperCase();
      var _say2 = el("tfSay"); if (_say2) _say2.textContent = ""; // during a guided flow the stage IS the guardian's voice — clear the heartbeat line
      var _S0 = trackerState(), _t = _S0.t; // keep the corner puck a LIVE mini-tracker: show WHAT + running mm:ss off the live timer
      var _tt2 = el("tfTitle"); if (_tt2) { _tt2.classList.remove("switchable"); _tt2.style.background = ""; _tt2.style.color = ""; _tt2.style.borderColor = ""; _tt2.onclick = null; _tt2.textContent = _t ? (_t.title || "Tracking") : (stageLabel(TF_MODE) || ""); }
      var _ti2 = el("tfTile"); if (_ti2) { var _D2 = _t ? (DOM[domainOf(_t)] || DOM.restore) : DOM.restore; _ti2.style.background = tfStripe(_D2.c); _ti2.style.filter = ""; _ti2.innerHTML = _t ? tiIcon(_t) : '<i class="ti ' + (_D2.ti || "ti-moon") + '"></i>'; }
      var _tm2 = el("tfTime"); if (_tm2) { if (_t) { _tm2.setAttribute("data-tid", _t.id); _tm2.textContent = elapsedStr(_t); } else { _tm2.removeAttribute("data-tid"); _tm2.textContent = ""; } }
      var _elMin2 = _t ? (Date.now() - _t.start) / 60000 : 0, _p2 = _t ? Math.max(0, Math.min(1, _elMin2 / 60)) : 1;
      setRing(_p2, _t ? "#28cf86" : DOM.restore.c);
      renderStage(TF_MODE); renderTFControls(TF_MODE);
      return;
    }
    var _ck = el("tfClock"); if (_ck) _ck.textContent = fmt(nowMin()).toUpperCase(); // current wall-clock time
    var _say = el("tfSay"); if (_say) _say.textContent = bkContinuity(); // soul-layer heartbeat: the guardian speaks what it remembers, on every open
    renderStageChips(); // TRACK-mode entry doors (Journal …) — calm chips under the controls; CSS hides them once a stage is active
    var S0 = trackerState(), t = S0.t, tile = el("tfTile"), streak = (S.game && S.game.streak) || 0;
    tf.classList.remove("st-onplan", "st-break", "st-off", "st-idle", "st-claim", "st-night");
    var _tt0 = el("tfTitle"); if (_tt0) { _tt0.classList.remove("switchable"); _tt0.style.background = ""; _tt0.style.color = ""; _tt0.style.borderColor = ""; _tt0.onclick = null; } // reset the title-pill (only the active states make it a tappable colored switch-pill)
    if (S0.id === "claim") { tf.classList.add("st-claim"); var CB = S0.block, CD = DOM[domainOf(CB)] || DOM.focus, gap = Math.max(1, logicalNowMin() - S0.gapStartMin);
      if (tile) { tile.style.background = tfStripe(CD.c); tile.style.filter = ""; tile.innerHTML = '<i class="ti ' + tiClass(CB) + '"></i>'; }
      el("tfTitle").textContent = CB.title;
      el("tfVerdict").textContent = "welcome back";
      el("tfTime").removeAttribute("data-tid"); el("tfTime").textContent = dur(gap);
      el("tfElabel").textContent = "away";
      el("tfCtx").textContent = "gap " + fmt(S0.gapStartMin) + "–now";
      el("tfSpark").innerHTML = '🔥 <b>×' + streak + '</b>';
      setRing(1, CD.c); renderSwitchChips(""); renderTFControls("claim");
      return;
    }
    if (S0.id === "night") { tf.classList.add("st-night");
      if (tile) { tile.style.background = tfStripe("#5a4a86"); tile.style.filter = "saturate(.4) brightness(.7)"; tile.innerHTML = '<i class="ti ti-moon"></i>'; }
      el("tfTitle").textContent = "rest";
      el("tfVerdict").textContent = "no plan tonight";
      el("tfTime").removeAttribute("data-tid"); el("tfTime").textContent = "";
      el("tfElabel").textContent = "";
      el("tfCtx").textContent = "rest — I've got the morning";
      el("tfSpark").innerHTML = "";
      setRing(1, "#5a4a86"); renderSwitchChips(""); renderTFControls("night");
      return;
    }
    if (S0.id === "idle") { tf.classList.add("st-idle"); var nb = nextPlannedBlock(todayK()); var ND = nb ? (DOM[domainOf(nb)] || DOM.focus) : DOM.focus;
      el("tfTitle").textContent = nb ? nb.title : "Nothing tracking";
      el("tfVerdict").textContent = nb ? "ready when you are" : "";
      el("tfTime").textContent = nb ? fmt(hm(nb.time)) : "—"; el("tfTime").removeAttribute("data-tid");
      el("tfCtx").textContent = nb ? ("planned " + dur(nb.mins || 30)) : "tap Start to begin tracking";
      el("tfSpark").innerHTML = '🔥 <b>×' + streak + '</b> · ⏱ <b>' + dur(tfDomMinsToday(null)) + '</b>';
      if (tile) { tile.style.background = tfStripe(ND.c); tile.style.filter = "saturate(.5) brightness(.78)"; tile.innerHTML = '<i class="ti ' + (nb ? tiClass(nb) : "ti-clock") + '"></i>'; }
      el("tfElabel").textContent = nb ? "starts" : "";
      setRing(0, "#6a5870"); setTFNext(nb ? (hm(nb.time) + (nb.mins || 30)) : nowMin()); renderSwitchChips(""); renderTFControls("idle");
      return;
    }
    if (S0.id === "break" || S0.id === "breakup") { tf.classList.add("st-break"); var B = S0.brk, _bend = B.start + B.mins * 60000, _rem = _bend - Date.now(), _up = _rem <= 0;
      if (tile) { tile.style.background = tfStripe("#e8b53a"); tile.style.filter = ""; tile.innerHTML = '<i class="ti ti-coffee"></i>'; }
      el("tfTitle").textContent = _up ? "Break's up" : "On a break";
      el("tfVerdict").textContent = _up ? "ready to come back" : "held · streak safe";
      el("tfTime").removeAttribute("data-tid"); el("tfTime").textContent = fmtCD(Math.max(0, _rem));
      el("tfElabel").textContent = _up ? "time's up" : "left";
      el("tfCtx").textContent = B.title ? ((_up ? "back to " : "resume ") + B.title) : (_up ? "break over" : "paused");
      el("tfSpark").innerHTML = '🔥 <b>×' + streak + '</b> · ☕ break';
      setRing(_up ? 1 : Math.max(0, Math.min(1, (Date.now() - B.start) / (B.mins * 60000))), "#e8b53a");
      renderSwitchChips(B.title); renderTFControls(_up ? "breakup" : "break");
      return;
    }
    var D = DOM[S0.dom] || DOM.focus, drift = !!S0.drift, onplan = S0.id === "onplan";
    tf.classList.add(onplan ? "st-onplan" : "st-off");
    if (tile) { tile.style.background = tfStripe(D.c); tile.style.filter = ""; tile.innerHTML = tiIcon(t); }
    var _tt = el("tfTitle"); _tt.innerHTML = esc(t.title || "Tracking") + ' <i class="ti ti-switch-horizontal" style="font-size:.66em;opacity:.65"></i>'; _tt.classList.add("switchable"); _tt.style.background = mixHex(D.c, "#160510", 0.5); _tt.style.color = D.light; _tt.style.borderColor = "#160510"; _tt.onclick = function () { tfPickTrack("Switch to?"); }; // the activity name IS a colored pill = the switch button (David 2026-06-27)
    el("tfVerdict").textContent = onplan ? "on plan · winning" : (drift ? "drifting" : "off plan");
    el("tfTime").setAttribute("data-tid", t.id); el("tfTime").textContent = elapsedStr(t); el("tfElabel").textContent = "elapsed";
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
  // ===== COCKPIT FUNNELS (CKPT-2, David 2026-06-28): one door in (enterStage), one out (exitStage), one dispatcher (renderStage), one pure router (stageModeFor). Wired to NOTHING that auto-triggers this wave — defaults keep TF_MODE null. =====
  function stageLabel(mode) { return ({ am: "Morning", pm: "Reflection", journal: "Journal", journey: "Your next step", tool: "Toolbox", sleepmath: "Sleep Math", rx: "Rx", track: "" })[mode] || ""; }
  function enterStage(mode, opts) { // the single entry door every guided flow uses
    opts = opts || {};
    if (opts.trackTitle) { startTimer({ title: opts.trackTitle, catK: "restore", color: DOM.restore.c, flow: mode }); var r = activeTimers(); TF_BLOCKID = r.length ? r[r.length - 1].id : null; } // the ring lights + will slide aside in the SAME gesture (guidance+tracking fused); finish stops it
    TF_MODE = mode; TF_MODE_USERSET = !!opts.byTap;
    if (!TF_OPEN) openTrackerFull(); else renderTrackerFull();
  }
  function exitStage(commit) { // the single exit door: write the flow's data (if commit), stop the flow timer (logs a Restore block + earns Spark), GENTLE+gated celebrate, un-corner the ring
    var mode = TF_MODE;
    if (commit && mode === "journal") { // persist the journal entry onto the bookend baton: additive, no SCHEMA bump, rides export/import/undo
      // JOURNALING 101 (David 2026-06-28): build the RICH typed record {type,label,entries[],summary,mood,ts}. Back-compat: also write q/text so the
      // existing feed (journalEntries/journalSheet) keeps rendering; q=type label, text=summary. Empty flow (no entries, no mood) writes nothing.
      var sb = el("tfStageBody");
      var rec0 = sb ? jtBuildRecord(sb) : null;
      if (rec0) { var rec = bk(todayK()); rec.journal = (rec.journal || []).concat([{ type: rec0.type, label: rec0.label, entries: rec0.entries, summary: rec0.summary, q: rec0.label, text: rec0.summary, mood: rec0.mood, ts: rec0.ts }]);
        rec.pm = rec.pm || {}; if (rec0.summary) rec.pm.reflect = rec0.summary; if (rec0.mood != null) rec.pm.mood = rec0.mood; save(); }
    }
    if (commit && mode === "pm") { // PM bookend (multi-beat) → bk(todayK()).pm = {reflect, mood, q, ts, done}. Marks done so the evening hero never nags twice/day.
      var sbp = el("tfStageBody"), tap = sbp && sbp.querySelector("textarea");
      var txt = (tap ? tap.value.trim() : "") || (sbp && sbp.dataset.reflect) || ""; // close beat has no textarea → fall back to the value flushed when leaving the ask beat
      var qp = (sbp && sbp.dataset.q) || "", mp = (sbp && sbp.dataset.mood != null && sbp.dataset.mood !== "") ? +sbp.dataset.mood : null;
      var recp = bk(todayK()); recp.pm = recp.pm || {}; recp.pm.reflect = txt; recp.pm.q = qp; if (mp != null) recp.pm.mood = mp; recp.pm.ts = Date.now(); recp.pm.done = true;
      if (txt || mp != null) { recp.journal = (recp.journal || []).concat([{ q: qp, text: txt, mood: mp, ts: Date.now() }]); } // also feed the journal feed, like the journal door does
      save();
    }
    if (commit && mode === "am") { // AM bookend → bk(todayK()).am = {identity[], virtue, why, goalKey, goalMove, oneThing, ts, done}. Writes the live profile + does the SAFE flow-down (skeletonDay / blocks.push / reflow). No #sheet, no calendarView touch.
      var sba = el("tfStageBody"); var idents = (sba && sba.dataset.ident) ? sba.dataset.ident.split("|").filter(Boolean) : [];
      var virt = (sba && sba.dataset.virtue) || "", why = (sba && sba.dataset.why) || "";
      var goalKey = (sba && sba.dataset.goalKey) || "", goalMove = (sba && sba.dataset.goalMove) || "", oneThing = (sba && sba.dataset.oneThing) || "";
      var amK = todayK(), reca = bk(amK); reca.am = reca.am || {};
      reca.am.identity = idents; reca.am.virtue = virt; reca.am.why = why;
      reca.am.goalKey = goalKey; reca.am.goalMove = goalMove; reca.am.oneThing = oneThing; reca.am.ts = Date.now(); reca.am.done = true;
      if (S.profile) { if (idents.length) S.profile.todayIdentity = idents.slice(); if (virt) S.profile.todayVirtues = [virt]; } // keep the canonical profile in sync (no divergent copy)
      // FLOW-DOWN (a): the ONE thing → a starred prio-3 block (de-duped) via the already-safe write path
      try {
        var theOne = oneThing || goalMove;
        if (theOne) {
          var have = (blocks(amK) || []).some(function (b) { return (b.title || "").toLowerCase() === theOne.toLowerCase(); });
          if (!have) { if (!(blocks(amK) || []).some(function (b) { return b.title; })) { skeletonDay(amK, theOne); } else { var t1 = nextFreeMin(amK); blocks(amK).push({ id: uid(), time: pad(Math.floor(t1 / 60)) + ":" + pad(t1 % 60), mins: 90, title: theOne, prio: 3, color: "#2a9fe0", done: false, star: true, fromAM: true }); reflow(amK); } }
        }
        // FLOW-DOWN: the goal-move (if distinct from the one-thing) → a pushed block, de-duped
        if (goalMove && goalMove.toLowerCase() !== (theOne || "").toLowerCase()) {
          var have2 = (blocks(amK) || []).some(function (b) { return (b.title || "").toLowerCase() === goalMove.toLowerCase(); });
          if (!have2) { var dom2 = domainOf({ title: goalMove }), t2 = nextFreeMin(amK); blocks(amK).push({ id: uid(), time: pad(Math.floor(t2 / 60)) + ":" + pad(t2 % 60), mins: 30, title: goalMove, prio: 2, color: (DOM[dom2] || DOM.focus).c, domain: dom2, done: false, goalId: goalKey || null, fromAM: true }); reflow(amK); }
        }
      } catch (e) {}
      save();
      // FLOW-DOWN (c) the chosen-virtue glyph is rendered additively at the bubble label via amVirtueGlyph() (no write here).
      try { renderToday(); if (el("pullSheet") && el("pullSheet").classList.contains("on")) buildPull(); } catch (e) {} // repaint so the new blocks + glyph show
    }
    if (mode === "journal") { var sbj = el("tfStageBody"); if (sbj) { ["jpicked", "jtype", "jstep", "jdata", "q", "mood", "vfive", "v_energy", "v_family", "v_service", "freeSeeded"].forEach(function (kk) { delete sbj.dataset[kk]; }); } } // reset journal flow so a re-open starts at the picker, not mid-stale-template
    if (TF_BLOCKID) { try { stopTimer(TF_BLOCKID); } catch (e) {} TF_BLOCKID = null; } // logs a Restore "Reflection" block + earns Spark (no covered-plan, so its own celebrate won't fire)
    if (commit && mode) { try { celebrateGated(DOM.restore.c, curStreak() || 1); } catch (e) {} } // GENTLE reward for showing up, gated once/logical-day across am/pm/journal
    TF_MODE = null; TF_MODE_USERSET = false;
    if (TF_OPEN) renderTrackerFull();
  }
  function stageModeFor() { // PURE ordered early-return ladder — never OR'd (or the stage flaps across 1s ticks). Read by NOTHING this wave (no auto-mount); here so CKPT-7 can wire landing.
    if (TF_MODE_USERSET) return TF_MODE; // explicit tap wins this open-session
    var run = activeTimers(), t = run[run.length - 1]; if (t && t.flow) return t.flow; // a running guided timer's tag drives the stage so a redraw re-derives the right panel
    var g = (S.guide || {}); if (g.mode === "guided" && !journeyActionDoneToday()) return "journey"; // one-obvious-next-step: only when today's node action isn't done yet (else fall through to today's track ring)
    return null; // track
  }
  function renderStage(mode) { // dispatcher: writes ONLY #tfStageBody, IDEMPOTENT via dataset.mode guard so the 1s live-tick never wipes a textarea mid-flow
    var sb = el("tfStageBody"); if (!sb) return;
    if (mode === "tool") { sb.dataset.mode = "tool"; toolboxStageStep(sb); return; } // toolbox: no text inputs to preserve, so re-render each tick → the skill-ladder pips stay live after a tool finishes (TB-SHEET)
    if (sb.dataset.mode === mode && sb.childNodes.length) return; // already mounted this mode → leave content (inputs) alive
    sb.dataset.mode = mode || "";
    switch (mode) {
      case "journal": journalStageStep(sb); break;
      case "journey": journeyStageStep(sb); break;
      case "pm": pmStageStep(sb); break;   // PM bookend: mirror the day back, then ask the one right question
      case "am": amStageStep(sb); break;   // AM bookend: greet, reflect last night's seed, set who you wake as + intrinsic why
      case "sleepmath": sleepMathStep(sb); break;   // D-1: AutoCalc / Sleep Math
      case "rx": rxStep(sb); break;   // D-2: Rx Pad (prescription)
      default:                              // 'tool' handled by the early return above (toolboxStageStep)
        sb.innerHTML = '<div class="tf-stagecard"><div class="tfs-h">' + esc(stageLabel(mode) || "Stage") + '</div><div class="tfs-sub">Coming soon.</div></div>'; break;
    }
  }
  // ===== JOURNEY STAGE (JX-PROACTIVE-GATE, David 2026-06-28): the ONE next-step card. Reward-never-shame — one warm line + one primary CTA that runs the node's act() (enterStage/sheet). Greets by name of the node, never a pile of chips, never a nag. =====
  function journeyStageStep(sb) {
    var n = journeyNode(), node = JOURNEY[Math.max(0, Math.min(JOURNEY.length - 1, n))];
    var card = add(sb, "div", "tf-stagecard"); card.style.display = "flex"; card.style.flexDirection = "column"; card.style.gap = "12px";
    var greet = (phase() === "morning") ? "Good morning" : (phase() === "evening" || phase() === "night") ? "Good evening" : "Here's your next step";
    add(card, "div", "tfs-sub", greet).style.opacity = ".8";
    add(card, "div", "tfs-h", node.title);
    add(card, "div", "tfs-sub").textContent = node.line;
    var b = add(card, "button", "tf-b tf-done"); b.style.marginTop = "4px"; b.innerHTML = '<i class="ti ti-arrow-right"></i>' + esc(node.cta);
    b.onclick = function () { try { node.act(); } catch (e) {} };
  }
  // ===== JOURNAL STAGE (CKPT-5, David 2026-06-28): the fusion proof — guidance IS tracking. One adaptive question + a textarea + an optional mood face, rendered into #tfStageBody while the Reflection ring tracks in the corner. Built ONCE (renderStage's dataset.mode guard skips rebuild), so the 1s live-tick never wipes what you're typing. =====
  function openToolbox() { enterStage("tool", { byTap: true }); } // WISDOM TOOLBOX (TB-SHEET): open the cockpit 'tool' stage — corner-poses the ring, fills #tfStageBody with the kit. No trackTitle: the toolbox is a shelf, individual tools track themselves on finish.
  function openJournal() { enterStage("journal", { trackTitle: "Reflection", byTap: true }); } // the Journal chip's door: lights the ring + slides it aside + fills the stage in one gesture
  function renderStageChips() { // the BASE (track-mode) entry doors into guided flows — visible + tappable (not gesture-only). Built fresh each track render (cheap, no inputs to preserve). (CKPT-5)
    var w = el("tfStageChips"); if (!w) return; w.innerHTML = "";
    if (profile().lowEnergy) { var st = add(w, "button", "tf-chip"); st.innerHTML = '<i class="ti ti-wind" style="color:' + DOM.restore.light + '"></i> Settle'; st.onclick = function () { try { breathwork(4); } catch (e) {} }; } // ENERGY-FIRST GATE: low fuel → lead with one body reset before the cognitive doors (suggest, never wall)
    var c = add(w, "button", "tf-chip"); c.innerHTML = '<i class="ti ti-feather" style="color:' + DOM.restore.light + '"></i> Journal'; c.onclick = openJournal;
    // AM / PM bookend doors (David 2026-06-28) — greet, never auto-trap; a one-tap chip opens the stage
    var am = add(w, "button", "tf-chip"); am.innerHTML = '<i class="ti ti-sun-high" style="color:#ffc83d"></i> Morning'; am.onclick = function () { enterStage("am", { trackTitle: "Morning bookend", byTap: true }); };
    var pm = add(w, "button", "tf-chip"); pm.innerHTML = '<i class="ti ti-moon" style="color:' + DOM.restore.light + '"></i> Reflection'; pm.onclick = function () { enterStage("pm", { trackTitle: "Reflection", byTap: true }); };
    var tb = add(w, "button", "tf-chip"); tb.innerHTML = '<i class="ti ti-briefcase" style="color:' + DOM.restore.light + '"></i> Toolbox'; tb.onclick = openToolbox; // WISDOM TOOLBOX entry door (TB-SHEET)
    var sm = add(w, "button", "tf-chip"); sm.innerHTML = '<i class="ti ti-bed" style="color:' + DOM.restore.light + '"></i> Sleep Math'; sm.onclick = function () { enterStage("sleepmath", { byTap: true }); }; // D-1: AutoCalc entry door
    var rx = add(w, "button", "tf-chip"); rx.innerHTML = '<i class="ti ti-clipboard-heart" style="color:' + DOM.restore.light + '"></i> Daily Rx'; rx.onclick = function () { RX_ACTIVE = "fundamental"; enterStage("rx", { byTap: true }); }; // D-2: Rx Pad entry door
  }
  // ===== D-1: SLEEP MATH (AutoCalc primitive instance) — _course/BUILD-SPEC.md §D. Pure calc; saves to S.course.sleepMath; live recompute via input handlers (idempotent stage = inputs survive the 1s tick). =====
  function smMin(hhmm) { var p = (hhmm || "").split(":"); if (p.length < 2) return null; return (+p[0]) * 60 + (+p[1]); }
  function sleepMathStep(sb) {
    var saved = (S.course && S.course.sleepMath) || {}, wake = saved.wake || "07:00", hrs = saved.hours || 8;
    sb.innerHTML = "";
    var card = add(sb, "div", "tf-stagecard"); card.setAttribute("style", JR_CARD + "display:flex;flex-direction:column;gap:12px;");
    var _smh = add(card, "div", "tfs-h"); _smh.innerHTML = '<i class="ti ti-moon"></i> Sleep Math'; _smh.style.cssText = "font-weight:800;font-size:17px;";
    add(card, "div", "tfs-sub", "Work back from your wake time to find when to wind down.").style.cssText = "opacity:.72;font-size:13px;margin-top:-7px;";
    var row1 = add(card, "label"); row1.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;";
    add(row1, "span", null, "Wake at");
    var wIn = add(row1, "input"); wIn.type = "time"; wIn.value = wake; wIn.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:9px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;padding:7px 10px;-webkit-appearance:none;");
    var row2 = add(card, "label"); row2.style.cssText = "display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px;";
    add(row2, "span", null, "Hours of sleep");
    var stp = add(row2, "div"); stp.style.cssText = "display:flex;align-items:center;gap:12px;";
    var minus = add(stp, "button", null, "–"), hv = add(stp, "b", null, String(hrs)), plus = add(stp, "button", null, "+");
    minus.setAttribute("style", "width:32px;height:32px;border-radius:8px;border:none;background:#3a2147;color:#fff;font-size:18px;font-weight:700;");
    plus.setAttribute("style", "width:32px;height:32px;border-radius:8px;border:none;background:#3a2147;color:#fff;font-size:18px;font-weight:700;");
    hv.style.cssText = "min-width:34px;text-align:center;font-size:17px;";
    var res = add(card, "div"); res.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-top:4px;";
    function line(lbl) { var r = add(res, "div"); r.style.cssText = "display:flex;justify-content:space-between;font-size:15px;border-top:1px solid #2a1730;padding-top:8px;"; var _ls = add(r, "span"); _ls.innerHTML = lbl; _ls.style.opacity = ".8"; var v = add(r, "b"); v.style.color = DOM.restore.light; return v; }
    var oShut = line('<i class="ti ti-wind"></i> Wind down'), oSun = line('<i class="ti ti-device-mobile-off"></i> Screens off'), oBed = line('<i class="ti ti-bed"></i> In bed by');
    function compute() { var wm = smMin(wIn.value); if (wm == null) return; var bed = ((wm - (hrs * 60 + 60)) % 1440 + 1440) % 1440, sun = (bed - 60 + 1440) % 1440, shut = (bed - 120 + 1440) % 1440; oBed.textContent = fmt(bed); oSun.textContent = fmt(sun); oShut.textContent = fmt(shut); S.course = S.course || {}; S.course.sleepMath = { wake: wIn.value, hours: hrs }; save(); }
    wIn.oninput = compute;
    minus.onclick = function () { hrs = Math.max(4, hrs - 1); hv.textContent = hrs; compute(); };
    plus.onclick = function () { hrs = Math.min(12, hrs + 1); hv.textContent = hrs; compute(); };
    compute();
  }
  // ===== D-2: Rx PAD (prescription primitive) — _course/BUILD-SPEC.md §D. Config-driven; saves to S.course.rx[id]. Auto-height textareas via oninput (iOS ignores resize:vertical). =====
  var RX_CONFIGS = {
    fundamental: { title: "Daily Rx", icon: "ti-clipboard-heart", sub: "Your prescription — three moves, no more.", fields: [
      { k: "self", label: "#1 Self-Care", ph: "the one thing that keeps you you (e.g. 8h sleep)" },
      { k: "start", label: "#1 to Start", ph: "the highest-leverage thing to begin" },
      { k: "stop", label: "#1 to Stop", ph: "the kryptonite to cut" } ] }
  };
  var RX_ACTIVE = "fundamental";
  function rxAutoH(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + "px"; }
  function rxStep(sb) {
    var cfg = RX_CONFIGS[RX_ACTIVE] || RX_CONFIGS.fundamental;
    S.course = S.course || {}; S.course.rx = S.course.rx || {}; var saved = S.course.rx[RX_ACTIVE] = S.course.rx[RX_ACTIVE] || {};
    sb.innerHTML = "";
    var card = add(sb, "div", "tf-stagecard"); card.setAttribute("style", JR_CARD + "display:flex;flex-direction:column;gap:13px;");
    var _rxh = add(card, "div", "tfs-h"); _rxh.innerHTML = '<i class="ti ' + (cfg.icon || "ti-clipboard-heart") + '"></i> ' + cfg.title; _rxh.style.cssText = "font-weight:800;font-size:17px;";
    add(card, "div", "tfs-sub", cfg.sub).style.cssText = "opacity:.72;font-size:13px;margin-top:-7px;";
    cfg.fields.forEach(function (f) {
      var wrap = add(card, "div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:5px;";
      add(wrap, "div", null, f.label).style.cssText = "font-size:13px;font-weight:700;color:" + DOM.restore.light + ";";
      var ta = add(wrap, "textarea"); ta.rows = 1; ta.placeholder = f.ph || ""; ta.value = saved[f.k] || ""; ta.setAttribute("style", JR_TA);
      rxAutoH(ta); ta.oninput = function () { rxAutoH(ta); saved[f.k] = ta.value.trim(); save(); };
    });
  }
  // ===== JOURNALING 101 — shared style + small builders (David 2026-06-28) =====
  var JR_TA = "width:100%;box-sizing:border-box;background:#1c0f20;border:2px solid #160510;border-radius:11px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;line-height:1.4;padding:11px 12px;resize:none;outline:none;-webkit-appearance:none;";
  var JR_CARD = "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:10px 12px;line-height:1.45;";
  function jrTA(card, ph, rows, val) { var ta = add(card, "textarea", "jr-ta"); ta.placeholder = ph || ""; ta.rows = rows || 3; ta.setAttribute("style", JR_TA); if (val) ta.value = val; return ta; }
  function jrPips(card, step, total) { var pips = add(card, "div"); pips.style.cssText = "display:flex;gap:6px;align-self:center;margin-bottom:2px;"; for (var i = 0; i < total; i++) { var dt = add(pips, "i"); dt.style.cssText = "width:7px;height:7px;border-radius:50%;display:block;background:" + (i <= step ? DOM.restore.light : "#3a2230") + ";"; } }
  function jrData(sb) { try { return JSON.parse(sb.dataset.jdata || "{}"); } catch (e) { return {}; } } // structured-entry accumulator (list/keyed templates)
  function jrSetData(sb, d) { sb.dataset.jdata = JSON.stringify(d || {}); }
  // VIRTUE-PICK row — present-tense Declaration (SN-232) surfaces under the chosen virtue. Returns nothing; writes sb.dataset[key].
  function jrVirtueRow(card, sb, key, declEl) {
    var vg = add(card, "div"); vg.style.cssText = "display:flex;flex-wrap:wrap;gap:7px;";
    VIRTUES.forEach(function (v) {
      var on = sb.dataset[key] === v.k, b = add(vg, "button", "tf-chip");
      b.innerHTML = '<span style="font-size:1.05em">' + v.e + '</span> ' + v.l;
      if (on) { b.style.borderColor = v.c; b.style.color = v.c; }
      b.onclick = (function (vk) { return function () {
        sb.dataset[key] = (sb.dataset[key] === vk) ? "" : vk;
        Array.prototype.forEach.call(vg.querySelectorAll(".tf-chip"), function (x) { x.style.borderColor = ""; x.style.color = ""; });
        if (sb.dataset[key]) { var vv = VIRTUES.filter(function (z) { return z.k === sb.dataset[key]; })[0]; b.style.borderColor = vv ? vv.c : ""; b.style.color = vv ? vv.c : ""; }
        if (declEl) declEl.textContent = sb.dataset[key] ? "“" + (VIRTUE_DECLARATIONS[sb.dataset[key]] || "") + "”" : ""; // the present-tense Declaration (Johnson: declaration, not affirmation)
      }; })(v.k);
    });
  }
  function jrMoodRow(card, sb) { // optional mood faces — same as the original journal
    var moodWrap = add(card, "div", "jr-moodrow"); moodWrap.setAttribute("style", "display:flex;gap:8px;justify-content:space-between;margin-top:2px;");
    MOODS.forEach(function (m, i) {
      var f = add(moodWrap, "button", "jr-mood"); f.setAttribute("style", "flex:1;background:#241328;border:2px solid " + (sb.dataset.mood === String(i) ? DOM.restore.light : "#160510") + ";border-radius:11px;box-shadow:0 2px 0 #160510;font-size:22px;padding:7px 0;cursor:pointer;line-height:1;");
      f.textContent = m.e; f.title = m.l;
      f.onclick = (function (idx) { return function () { var on = sb.dataset.mood === String(idx); sb.dataset.mood = on ? "" : String(idx); Array.prototype.forEach.call(moodWrap.querySelectorAll(".jr-mood"), function (b, bi) { b.style.borderColor = (!on && bi === idx) ? DOM.restore.light : "#160510"; b.style.transform = (!on && bi === idx) ? "translateY(1px)" : ""; }); }; })(i);
    });
  }
  // ENTRY POINT: picker on first mount, then the chosen type's flow. Idempotent across the 1s tick via renderStage's dataset.mode guard;
  // multi-beat flows rebuild sb explicitly on advance (jtGoStep), like the AM/PM bookends.
  function journalStageStep(sb) {
    if (sb.dataset.mood == null) sb.dataset.mood = "";
    if (sb.dataset.jpicked !== "1") { // seed adaptive pre-select ONCE, then show the picker
      if (!sb.dataset.jtype) sb.dataset.jtype = pickJournalType();
      jrRenderPicker(sb); return;
    }
    jtGoStep(sb, +(sb.dataset.jstep || 0));
  }
  // THE TYPE PICKER (Johnson's palette). The adaptive pre-select is highlighted + labelled "suggested now"; the user's favorite floats to the top.
  // "there is no THE way — what is YOUR way" (Nietzsche, big idea #11): nothing is forced, every type is one tap, any can be favorited.
  function jrRenderPicker(sb) {
    sb.innerHTML = "";
    var card = add(sb, "div", "tf-stagecard"); card.style.display = "flex"; card.style.flexDirection = "column"; card.style.gap = "10px";
    add(card, "div", "tfs-h", "How do you want to journal?");
    var sub = add(card, "div", "tfs-sub", "Pick a way in — or just write. There's no one right way; find yours."); sub.style.cssText = "font-size:13px;color:#cfa8c4;";
    var suggested = sb.dataset.jtype || pickJournalType();
    var fav = S.journalFav;
    var order = JTYPES.slice().sort(function (a, b) { var af = (a.id === fav) ? 0 : 1, bf = (b.id === fav) ? 0 : 1; return af - bf; }); // favorite first
    var grid = add(card, "div"); grid.style.cssText = "display:flex;flex-direction:column;gap:8px;";
    order.forEach(function (t) {
      var row = add(grid, "button", "tf-chip"); var isSug = t.id === suggested, isFav = t.id === fav;
      row.style.cssText = "display:flex;align-items:flex-start;gap:10px;text-align:left;padding:10px 12px;border-radius:12px;border:2px solid " + (isSug ? DOM.restore.light : "#160510") + ";background:#1c0f20;width:100%;box-sizing:border-box;";
      var ic = add(row, "div"); ic.style.cssText = "font-size:20px;line-height:1.2;flex:0 0 auto;"; ic.textContent = t.e;
      var txt = add(row, "div"); txt.style.cssText = "flex:1;min-width:0;";
      var h = add(txt, "div"); h.style.cssText = "font-size:14px;color:#ffe3f1;display:flex;align-items:center;gap:6px;flex-wrap:wrap;";
      h.appendChild(document.createTextNode(t.label));
      if (isSug) { var pill = add(h, "span"); pill.textContent = "suggested now"; pill.style.cssText = "font-size:10px;color:" + DOM.restore.light + ";border:1px solid " + DOM.restore.light + ";border-radius:8px;padding:1px 6px;opacity:.9;"; }
      if (isFav) { var fp = add(h, "span"); fp.textContent = "★"; fp.style.cssText = "color:#ffc83d;font-size:12px;"; }
      add(txt, "div", null, t.blurb).style.cssText = "font-size:12px;color:#b89bb4;line-height:1.35;margin-top:2px;";
      // favorite toggle (the user's way surfaces first next time)
      var star = add(row, "button"); star.innerHTML = isFav ? "★" : "☆"; star.style.cssText = "flex:0 0 auto;background:none;border:none;color:" + (isFav ? "#ffc83d" : "#6a5566") + ";font-size:17px;cursor:pointer;padding:0 2px;line-height:1;";
      star.onclick = function (ev) { ev.stopPropagation(); S.journalFav = (S.journalFav === t.id) ? null : t.id; save(); jrRenderPicker(sb); };
      row.onclick = function () { sb.dataset.jtype = t.id; sb.dataset.jpicked = "1"; sb.dataset.jstep = "0"; jrSetData(sb, {}); jtGoStep(sb, 0); };
    });
  }
  function jtGoStep(sb, n) { sb.dataset.jstep = String(Math.max(0, n)); jtRenderBeat(sb); }
  // THE FLOW RENDERER — dispatches by type. Each renderer paints sb fresh (so beats can rebuild on advance) and uses jtFrame for the shared chrome (title, switch-type chip, back link).
  function jtRenderBeat(sb) {
    sb.innerHTML = "";
    var t = jtype(sb.dataset.jtype), step = +(sb.dataset.jstep || 0);
    var card = add(sb, "div", "tf-stagecard"); card.style.display = "flex"; card.style.flexDirection = "column"; card.style.gap = "12px";
    // header row: type label + a quiet "switch" chip (always escapable — never trapped in one template)
    var hrow = add(card, "div"); hrow.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
    add(hrow, "div", "tfs-h", t.e + " " + t.label).style.margin = "0";
    var sw = add(hrow, "button", "tf-chip"); sw.innerHTML = '<i class="ti ti-switch-horizontal"></i> switch'; sw.style.cssText = "opacity:.7;font-size:12px;flex:0 0 auto;";
    sw.onclick = function () { sb.dataset.jpicked = ""; jrRenderPicker(sb); };
    var src = add(card, "div", "tfs-sub", t.src); src.style.cssText = "font-size:11px;color:#7e6378;margin-top:-6px;"; // cite Johnson, quietly
    var R = JT_RENDERERS[t.id] || JT_RENDERERS.free;
    R(card, sb, step);
  }
  function jtNext(card, label, onTap) { var b = add(card, "button", "tf-b tf-done"); b.style.marginTop = "4px"; b.innerHTML = '<i class="ti ti-arrow-right"></i>' + esc(label); b.onclick = onTap; return b; }
  function jtBack(card, sb, step) { if (step <= 0) return; var b = add(card, "button", "tf-chip"); b.style.cssText = "align-self:flex-start;opacity:.7;"; b.innerHTML = '<i class="ti ti-arrow-left"></i> back'; b.onclick = function () { jtGoStep(sb, step - 1); }; }
  function jtSave(card, label) { var b = add(card, "button", "tf-b tf-done"); b.style.marginTop = "4px"; b.innerHTML = '<i class="ti ti-circle-check"></i> ' + esc(label || "Save"); b.onclick = function () { exitStage(true); }; return b; }
  // flush a textarea into jdata under a key on every input (so a beat advance / final commit always has the latest)
  function jtBind(ta, sb, key) { ta.addEventListener("input", function () { var d = jrData(sb); d[key] = ta.value.trim(); jrSetData(sb, d); }); }

  // ===== THE TEMPLATE RENDERERS (each cites Johnson; reward-never-shame copy) =====
  var JT_RENDERERS = {
    // 1) FIVE-MINUTE FOUNDATION (big idea #1): best-self visioning — gratitude · #1 thing · who-I'm-being(+Declaration). Short, 3 beats.
    five: function (card, sb, step) {
      var d = jrData(sb); jrPips(card, step, 3);
      if (step === 0) {
        add(card, "div", "tfs-sub", "See your best self today — and the small steps from here to there. (Science: imagining your best self reliably lifts optimism & hope.)").style.cssText = "font-size:13px;color:#cfa8c4;";
        add(card, "div", "tfs-sub", "First — one thing you're grateful for, right now.").style.fontSize = "13px";
        var ta = jrTA(card, "I'm grateful for…", 2, d.grat); jtBind(ta, sb, "grat");
        jtNext(card, "Next", function () { d.grat = ta.value.trim(); jrSetData(sb, d); jtGoStep(sb, 1); });
      } else if (step === 1) {
        add(card, "div", "tfs-sub", "Your #1 thing today — the one move future-you would thank you for.").style.fontSize = "13px";
        var ta1 = jrTA(card, "today, the one thing is…", 2, d.one); jtBind(ta1, sb, "one");
        jtNext(card, "Next", function () { d.one = ta1.value.trim(); jrSetData(sb, d); jtGoStep(sb, 2); }); jtBack(card, sb, 1);
      } else {
        add(card, "div", "tfs-sub", "Who are you being today?").style.fontSize = "13px";
        var decl = add(card, "div", "tfs-sub"); decl.style.cssText = "font-size:13px;color:" + DOM.restore.light + ";line-height:1.5;min-height:1.2em;"; decl.textContent = sb.dataset.vfive ? "“" + (VIRTUE_DECLARATIONS[sb.dataset.vfive] || "") + "”" : "";
        jrVirtueRow(card, sb, "vfive", decl);
        jrMoodRow(card, sb);
        jtSave(card, "Save the foundation 🌅"); jtBack(card, sb, 2);
      }
    },
    // 2) THE BIG 3 (big idea #4): Energy · Family · Service. For each role: who I'm BEING (+virtue), why, what I'll do.
    big3: function (card, sb, step) {
      var roles = [ { k: "energy", e: "⚡", l: "Energy", q: "your own body, mind, vitality" }, { k: "family", e: "❤️", l: "Family", q: "the people closest to you" }, { k: "service", e: "🌍", l: "Service", q: "your work, your contribution to the world" } ];
      var d = jrData(sb); jrPips(card, step, 3); var r = roles[Math.min(step, 2)], rd = d[r.k] || (d[r.k] = {});
      add(card, "div", "tfs-sub", r.e + " " + r.l + " — " + r.q).style.cssText = "font-size:13px;color:#cfa8c4;";
      add(card, "div", "tfs-sub", "Who are you committed to BEING here?").style.fontSize = "13px";
      var decl = add(card, "div", "tfs-sub"); decl.style.cssText = "font-size:13px;color:" + DOM.restore.light + ";line-height:1.5;min-height:1.2em;"; var vkey = "v_" + r.k; if (sb.dataset[vkey]) decl.textContent = "“" + (VIRTUE_DECLARATIONS[sb.dataset[vkey]] || "") + "”";
      jrVirtueRow(card, sb, vkey, decl);
      add(card, "div", "tfs-sub", "Why does it matter?").style.fontSize = "13px";
      var taW = jrTA(card, "because…", 2, rd.why); taW.oninput = function () { rd.why = taW.value.trim(); d[r.k] = rd; jrSetData(sb, d); };
      add(card, "div", "tfs-sub", "What will you DO today?").style.fontSize = "13px";
      var taD = jrTA(card, "today I'll…", 2, rd.what); taD.oninput = function () { rd.what = taD.value.trim(); d[r.k] = rd; jrSetData(sb, d); };
      function commitRole() { rd.virtue = sb.dataset[vkey] || ""; rd.why = taW.value.trim(); rd.what = taD.value.trim(); d[r.k] = rd; jrSetData(sb, d); }
      if (step < 2) jtNext(card, "Next role →", function () { commitRole(); jtGoStep(sb, step + 1); });
      else { jrMoodRow(card, sb); jtSave(card, "Save the Big 3 🎯"); }
      jtBack(card, sb, step);
    },
    // 3) GRATITUDE (big idea #1 / PERMA): five SPECIFIC things, one at a time, savored. Johnson: regular gratitude ≈ 25% happier.
    grat: function (card, sb, step) {
      var d = jrData(sb); var list = d.items || (d.items = []); var idx = Math.min(step, 4); jrPips(card, idx, 5);
      add(card, "div", "tfs-sub", "Five specific things — one at a time. Don't list; FEEL each one for a breath before the next.").style.cssText = "font-size:13px;color:#cfa8c4;";
      // show what's banked so far (savor)
      if (list.filter(Boolean).length) { var done = add(card, "div"); done.style.cssText = JR_CARD; list.forEach(function (it, i) { if (it) add(done, "div", "tfs-sub", (i + 1) + ". " + it).style.cssText = "font-size:13px;color:#e6cfe0;line-height:1.6;"; }); }
      add(card, "div", "tfs-sub", "#" + (idx + 1) + " — I'm grateful for…").style.fontSize = "13px";
      var ta = jrTA(card, "be specific — a moment, a person, a detail", 2, list[idx] || "");
      ta.oninput = function () { list[idx] = ta.value.trim(); d.items = list; jrSetData(sb, d); };
      if (idx < 4) jtNext(card, "Next — savor it 🙏", function () { list[idx] = ta.value.trim(); d.items = list; jrSetData(sb, d); jtGoStep(sb, step + 1); });
      else { jrMoodRow(card, sb); jtSave(card, "Save — let it land 🙏"); }
      jtBack(card, sb, step);
    },
    // 4) EVENING REFLECTION (big idea #2, Masterpiece PM): went well · I'd improve (curious, NEVER guilt) · carry forward.
    evening: function (card, sb, step) {
      var d = jrData(sb); jrPips(card, step, 3);
      // a warm mirror of the day at the top (reuses bookendMirror — neutral, never a deficit)
      if (step === 0) { var mr = bookendMirror(todayK()); var m = add(card, "div"); m.style.cssText = JR_CARD + "color:#e6cfe0;font-size:13px;"; m.textContent = bookendMirrorLine(mr); }
      if (step === 0) {
        add(card, "div", "tfs-sub", "What went WELL today? (Even one small thing — wins count.)").style.fontSize = "13px";
        var ta = jrTA(card, "what went well…", 3, d.well); jtBind(ta, sb, "well");
        jtNext(card, "Next", function () { d.well = ta.value.trim(); jrSetData(sb, d); jtGoStep(sb, 1); });
      } else if (step === 1) {
        add(card, "div", "tfs-sub", "What would you do a little better next time? Curious, not critical — win or learn, never lose.").style.cssText = "font-size:13px;color:#cfa8c4;";
        var ta1 = jrTA(card, "one thing I'd refine — gently…", 3, d.improve); jtBind(ta1, sb, "improve");
        jtNext(card, "Next", function () { d.improve = ta1.value.trim(); jrSetData(sb, d); jtGoStep(sb, 2); }); jtBack(card, sb, 1);
      } else {
        add(card, "div", "tfs-sub", "Anything left undone to carry into tomorrow? (Set it down here so you can rest.)").style.fontSize = "13px";
        var ta2 = jrTA(card, "carry forward…", 3, d.carry); jtBind(ta2, sb, "carry");
        jrMoodRow(card, sb);
        jtSave(card, "Close the day 🌙"); jtBack(card, sb, 2);
      }
    },
    // 5) WOOP (big idea #6, Oettingen): Wish · Outcome (visualize) · Obstacle (INNER) · Plan (if-then) for the #1 goal.
    woop: function (card, sb, step) {
      var d = jrData(sb); jrPips(card, step, 4);
      var beats = [
        { k: "wish",     h: "WISH — your #1 most important thing right now.", p: "what I most want is…", help: "Pick one meaningful, challenging-but-doable goal." },
        { k: "outcome",  h: "OUTCOME — picture it done. How does it look & feel?", p: "the best outcome is…", help: "Really visualize the best result of achieving it." },
        { k: "obstacle", h: "OBSTACLE — what INSIDE you gets in the way?", p: "my main inner obstacle is…", help: "Not the world — the inner block: the habit, fear, story." },
        { k: "plan",     h: "PLAN — an if-then: when the obstacle hits, I will…", p: "if [obstacle], then I will…", help: "If-then plans are how intentions become action." }
      ];
      var b = beats[Math.min(step, 3)];
      add(card, "div", "tfs-h2", b.h).style.cssText = "font-size:14px;color:#ffe3f1;";
      add(card, "div", "tfs-sub", b.help).style.cssText = "font-size:12px;color:#b89bb4;";
      var ta = jrTA(card, b.p, 2, d[b.k]); ta.oninput = function () { d[b.k] = ta.value.trim(); jrSetData(sb, d); };
      if (step < 3) jtNext(card, "Next", function () { d[b.k] = ta.value.trim(); jrSetData(sb, d); jtGoStep(sb, step + 1); });
      else { jrMoodRow(card, sb); jtSave(card, "Save your WOOP 🎈"); }
      jtBack(card, sb, step);
    },
    // 6) KEYSTONE HABITS (big idea #5): name the 3 habits you do on your BEST days → make your best your baseline.
    keystone: function (card, sb, step) {
      var d = jrData(sb); var list = d.items || (d.items = []); jrPips(card, Math.min(step, 2), 3);
      add(card, "div", "tfs-sub", "Think of a day you were genuinely at your best. What did you DO that day? Name the habit that, if you'd guess, was behind it.").style.cssText = "font-size:13px;color:#cfa8c4;";
      if (list.filter(Boolean).length) { var done = add(card, "div"); done.style.cssText = JR_CARD; list.forEach(function (it, i) { if (it) add(done, "div", "tfs-sub", "🗝️ " + it).style.cssText = "font-size:13px;color:#e6cfe0;line-height:1.6;"; }); }
      var idx = Math.min(step, 2);
      add(card, "div", "tfs-sub", "Keystone #" + (idx + 1)).style.fontSize = "13px";
      var ta = jrTA(card, "on my best days I…", 2, list[idx] || ""); ta.oninput = function () { list[idx] = ta.value.trim(); d.items = list; jrSetData(sb, d); };
      if (idx < 2) jtNext(card, "Next", function () { list[idx] = ta.value.trim(); d.items = list; jrSetData(sb, d); jtGoStep(sb, step + 1); });
      else { add(card, "div", "tfs-sub", "Make your best your new baseline — these are the three to protect.").style.cssText = "font-size:12px;color:#cfa8c4;"; jtSave(card, "Lock my keystones 🗝️"); }
      jtBack(card, sb, step);
    },
    // 7) FREE / ADAPTIVE — the original engine: pattern-mirror + the adaptive prompt + optional depth + brain-deepen.
    free: function (card, sb, step) {
      var q = sb.dataset.q || pickPrompt("journal"); sb.dataset.q = q;
      var pat = pickPattern();
      if (pat) { var mir = add(card, "div", "tfs-sub"); mir.innerHTML = '<i class="ti ti-sparkles" style="color:' + DOM.restore.light + ';margin-right:5px"></i>' + esc(pat.line); mir.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-left:3px solid " + DOM.restore.light + ";border-radius:11px;padding:10px 12px;line-height:1.45;font-size:13px;color:#e6cfe0;"); }
      var qel = add(card, "div", "tfs-sub"); qel.textContent = q;
      var ta = jrTA(card, "a line is enough", 4, "");
      var prev = ((S.bk || {})[todayK()] || {}).pm; if (prev && prev.reflect && !sb.dataset.freeSeeded) { ta.value = prev.reflect; sb.dataset.freeSeeded = "1"; }
      jtBind(ta, sb, "free");
      var deeper = add(card, "div", "tfs-sub"); deeper.setAttribute("style", "display:none;background:#1c0f20;border:2px dashed #2a1830;border-radius:11px;padding:9px 12px;line-height:1.4;font-size:13px;color:#cbb3c6;");
      var fuChip = add(card, "button", "tf-chip"); fuChip.innerHTML = '<i class="ti ti-arrow-down-right"></i> go a little deeper'; fuChip.setAttribute("style", "display:none;align-self:flex-start;opacity:.8;font-size:13px;");
      ta.addEventListener("input", function () { if (ta.value.trim().length >= 6 && fuChip.style.display === "none" && deeper.style.display === "none") fuChip.style.display = ""; });
      fuChip.onclick = function () { deeper.textContent = followupQ(ta.value, pat); deeper.style.display = ""; fuChip.style.display = "none"; ta.focus(); };
      if (brainCfg().engine !== "off" && brainCfg().key) {
        var bd = add(card, "button", "tf-chip"); bd.innerHTML = '<i class="ti ti-sparkles"></i> go deeper ✨'; bd.setAttribute("style", "align-self:flex-start;opacity:.7;font-size:13px;color:" + DOM.restore.light + ";");
        bd.onclick = function () { bd.disabled = true; bd.innerHTML = '<i class="ti ti-loader"></i> thinking…';
          askBrain(journalBrainContext(q, ta.value, pat), function (t, err) { bd.disabled = false; bd.innerHTML = '<i class="ti ti-sparkles"></i> go deeper ✨'; if (t) { var nq = t.split("\n")[0].replace(/^["']|["']$/g, "").trim(); if (nq) { sb.dataset.q = nq; qel.textContent = nq; ta.focus(); } } }); };
      }
      jrMoodRow(card, sb);
      jtSave(card, "Save");
    },
    // lighter modes — single beat:
    // 8) FUN-DO (big idea #9): micro-wins, not a to-do list. Each line = a small win to cross off (the progress principle).
    fundo: function (card, sb, step) {
      var d = jrData(sb); var list = d.items || (d.items = [""]);
      add(card, "div", "tfs-sub", "Not a to-do list — a FUN-do list. Small wins you'll enjoy crossing off today.").style.cssText = "font-size:13px;color:#cfa8c4;";
      var wrap = add(card, "div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:7px;";
      function rebuild() { wrap.innerHTML = ""; list.forEach(function (it, i) { var ta = add(wrap, "input"); ta.value = it || ""; ta.placeholder = "a little win…"; ta.setAttribute("style", JR_TA + "font-size:14px;"); ta.oninput = function () { list[i] = ta.value.trim(); d.items = list; jrSetData(sb, d); }; });
        var addb = add(wrap, "button", "tf-chip"); addb.innerHTML = '<i class="ti ti-plus"></i> add another'; addb.style.cssText = "align-self:flex-start;opacity:.8;"; addb.onclick = function () { list.push(""); d.items = list; jrSetData(sb, d); rebuild(); }; }
      rebuild();
      jtSave(card, "Save my fun-do 🎉");
    },
    // 9) CAPTURE (big idea #9, GTD): get one idea out of your head onto the page so the mind is clear.
    capture: function (card, sb, step) {
      var d = jrData(sb);
      add(card, "div", "tfs-sub", "Get it out of your head and onto the page. Capture the idea — clear the RAM.").style.cssText = "font-size:13px;color:#cfa8c4;";
      var ta = jrTA(card, "the idea is…", 5, d.text); jtBind(ta, sb, "text");
      jtSave(card, "Capture it 💡");
    },
    // 10) PURPOSE / Hedgehog (big idea #10): love × great-at × world-needs → your one thing.
    purpose: function (card, sb, step) {
      var d = jrData(sb); jrPips(card, Math.min(step, 3), 4);
      var beats = [
        { k: "love",  h: "What do you LOVE to do?", p: "I come alive when…" },
        { k: "great", h: "What could you be GREAT at?", p: "my real strengths are…" },
        { k: "world", h: "What does the WORLD need (and pay for)?", p: "the world needs…" },
        { k: "one",   h: "Where they overlap — your ONE thing.", p: "my one thing is…" }
      ];
      var b = beats[Math.min(step, 3)];
      add(card, "div", "tfs-h2", b.h).style.cssText = "font-size:14px;color:#ffe3f1;";
      if (step === 3 && (d.love || d.great || d.world)) { var ov = add(card, "div"); ov.style.cssText = JR_CARD + "font-size:12px;color:#b89bb4;line-height:1.6;"; ["love", "great", "world"].forEach(function (kk) { if (d[kk]) add(ov, "div", null, kk + ": " + d[kk]); }); }
      var ta = jrTA(card, b.p, 2, d[b.k]); ta.oninput = function () { d[b.k] = ta.value.trim(); jrSetData(sb, d); };
      if (step < 3) jtNext(card, "Next", function () { d[b.k] = ta.value.trim(); jrSetData(sb, d); jtGoStep(sb, step + 1); });
      else jtSave(card, "Save my purpose 🧭");
      jtBack(card, sb, step);
    }
  };
  // BUILD the rich entry record for the active type from sb.dataset/jdata. Returns {type, label, entries:[{label,text}], summary, mood, ts} or null if empty.
  function jtBuildRecord(sb) {
    var t = jtype(sb.dataset.jtype), d = jrData(sb), mood = (sb.dataset.mood != null && sb.dataset.mood !== "") ? +sb.dataset.mood : null;
    var entries = [], vlab = function (vk) { return vk ? (VIRTUES.filter(function (v) { return v.k === vk; })[0] || {}).l : ""; };
    var declFor = function (vk) { return vk ? (vlab(vk) + " — “" + (VIRTUE_DECLARATIONS[vk] || "") + "”") : ""; };
    function push(l, txt) { if (txt && String(txt).trim()) entries.push({ label: l, text: String(txt).trim() }); }
    if (t.id === "five") { push("Grateful for", d.grat); push("My #1 thing", d.one); push("Who I'm being", declFor(sb.dataset.vfive)); }
    else if (t.id === "big3") { [["energy", "⚡ Energy"], ["family", "❤️ Family"], ["service", "🌍 Service"]].forEach(function (r) { var rd = d[r[0]] || {}; var vk = rd.virtue || sb.dataset["v_" + r[0]] || ""; var parts = []; if (vk) parts.push("Being: " + declFor(vk)); if (rd.why) parts.push("Why: " + rd.why); if (rd.what) parts.push("Do: " + rd.what); if (parts.length) push(r[1], parts.join("  ·  ")); }); }
    else if (t.id === "grat") { (d.items || []).forEach(function (it, i) { push("Grateful #" + (i + 1), it); }); }
    else if (t.id === "evening") { push("Went well", d.well); push("I'd improve (kindly)", d.improve); push("Carry forward", d.carry); }
    else if (t.id === "woop") { push("Wish", d.wish); push("Outcome", d.outcome); push("Obstacle (inner)", d.obstacle); push("Plan (if-then)", d.plan); }
    else if (t.id === "keystone") { (d.items || []).forEach(function (it, i) { push("Keystone #" + (i + 1), it); }); }
    else if (t.id === "fundo") { (d.items || []).forEach(function (it, i) { push("Fun-do", it); }); }
    else if (t.id === "capture") { push("Captured", d.text); }
    else if (t.id === "purpose") { push("I love", d.love); push("Great at", d.great); push("World needs", d.world); push("My one thing", d.one); }
    else { push("Reflection", d.free); } // free
    if (!entries.length && mood == null) return null;
    var summary = entries.map(function (e) { return e.text; }).join(" · ");
    return { type: t.id, label: t.label, entries: entries, summary: summary, mood: mood, ts: Date.now() };
  }
  // ADAPTIVE-DEPTH follow-up: a deeper, optional second question computed from the answer's signals + the surfaced pattern. Offline, warm, never forced.
  function followupQ(answer, pat) {
    var a = (answer || "").toLowerCase();
    if (pat && pat.id === "slip") return "When it slips, what's usually in the way — and is the plan-time even the right one?";
    if (pat && pat.id === "goodDay") return "What makes that morning anchor hard to keep — and what would make it easier tomorrow?";
    if (/tired|exhaust|drain|low|heavy|foggy/.test(a)) return "What took the most out of you — and what, even small, would refill the tank?";
    if (/proud|good|great|won|shipped|focus|flow|click/.test(a)) return "What made that click — and how would you set up tomorrow to repeat it?";
    if (/stress|anx|worr|overwhelm|behind/.test(a)) return "What's underneath that — and what's the one piece that's actually yours to move?";
    if (/skip|miss|didn'?t|couldn'?t|failed|drift/.test(a)) return "No judgment — what would've made it 10% easier to show up?";
    return "Say a little more — what's the part of that you'd want tomorrow-you to remember?";
  }
  // BRAIN-DEEPEN context: richer than brainContext — the picked prompt + a 14-day pattern digest + the entry-so-far, asked to rewrite ONE warmer/sharper question.
  function journalBrainContext(q, entry, pat) {
    var pats = journalPatterns().slice(0, 3).map(function (p) { return p.line; }).join(" / ") || "none yet";
    var mr = bookendMirror(todayK());
    return "You are ALTER, a warm, no-shame reflective companion (never a coach, never preachy). My day: showed up for " + mr.kept + " of " + mr.planned + " plans"
      + (mr.drift ? ", some drift" : "") + ". Patterns you've noticed in me lately: " + pats + ". The reflection question on screen is: \"" + q + "\"."
      + (entry && entry.trim() ? " So far I wrote: \"" + entry.trim().slice(0, 400) + "\"." : "")
      + " Rewrite the ONE question warmer and more personal to me, or ask one gently deeper follow-up. Reply with ONLY the single question, no preamble, under 20 words, never shaming.";
  }
  // ===== PM / AM BOOKEND STAGES (David 2026-06-28): mirror the journal pattern exactly. Built ONCE per open (renderStage's dataset.mode guard skips rebuild) so the 1s live-tick never wipes inputs. =====
  // reward-never-shame copy lint: a miss is NEUTRAL data, never guilt; drift renders in the cool-gray DOM.drift, never red.
  var DRIFT_GRAY = "#565b66"; // the calm "quiet/drift" ink — never red, never a frown
  var AM_WHYS = [ // INTRINSIC only (SDT): autonomy/identity reasons. NO extrinsic option exists by design.
    "because it's who I am", "because it feels alive", "because I'd respect myself", "because I love the craft"
  ];
  function vlabel(kk) { for (var i = 0; i < VIRTUES.length; i++) if (VIRTUES[i].k === kk) return VIRTUES[i]; return null; }
  // THE CONTINUITY HEARTBEAT (soul-layer seam #1, David 2026-06-28 soul-first spine): ONE line the guardian speaks on open that proves it REMEMBERS you — drawn from the bk baton + recent data. Pure-read, reward-never-shame, never throws. This is the thing the swarm-built legs lacked: the felt sense of being known across days.
  function bkContinuity() {
    try {
      var k = todayK(), rec = (S.bk || {})[k] || {}, am = rec.am || {}, ph = phase(), streak = curStreak();
      var pf = profile();
      if (pf.lowEnergy) return "Low on fuel today — let's settle the body first. Everything else can wait."; // ENERGY-FIRST GATE: regulate before think (the guardian noticing, not pushing)
      if (pf.bouncedBack) return "You came back. That bounce — not the streak — is the skill."; // RECOVERY named (the Equanimity Game): the most churn-prone moment becomes the most rewarded
      if (ph === "morning") {
        if (am.done) { var v = vlabel(am.virtue); return "Good morning. Today you're being " + (v ? v.l : "yourself") + (am.oneThing ? " — your one thing: " + esc(am.oneThing) : "") + "."; }
        if (am.oneThing) return "Last night you set: “" + esc(am.oneThing) + "”. Still your one thing?";
        var ym = bookendMirror(lastDays(2)[1]); if (ym.planned > 0) return "Good morning. Yesterday you showed up for " + ym.kept + " of " + ym.planned + ". A fresh page — who are you today?";
        return "Good morning. A fresh page — who are you today?";
      }
      if (ph === "evening" || ph === "night") {
        var mr = bookendMirror(k);
        if (mr.planned > 0) return "Let's close the day — you showed up for " + mr.kept + " of " + mr.planned + (mr.streakSafe ? ". Streak safe." : ".");
        if (mr.totMin > 0) return "Let's close the day — " + dur(mr.totMin) + " lived on purpose.";
        return "Let's close the day. Rest is part of the work.";
      }
      if (am.done) { var v2 = vlabel(am.virtue); return "You're being " + (v2 ? v2.l : "yourself") + " today" + (am.oneThing ? " — " + esc(am.oneThing) : "") + "."; }
      if (streak > 0) return "Day ×" + streak + ". I'm with you — what matters now?";
      return "I'm here. What matters now?";
    } catch (e) { return ""; }
  }
  function bookendMirror(k) { // PM-MIRROR: read the day back from data already in S — pure read, touches no timeline render
    k = k || todayK(); var bl = blocks(k) || [], kept = 0, drift = 0, missed = 0, domMin = {}, missBlocks = [];
    bl.forEach(function (b) { if (!b.title) return; var st = blockStatus(k, b); if (st === "ok") kept++; else if (st === "miss") { missed++; missBlocks.push(b); } });
    var run = activeTimers(); run.forEach(function (t) { if (domainOf(t) === "drift") drift++; });
    (logs(k) || []).forEach(function (l) { var d = domainOf(l); if (d === "drift") { drift++; } domMin[d] = (domMin[d] || 0) + (l.mins || 0); });
    var planned = bl.filter(function (b) { return b.title; }).length;
    // strongest + quietest non-drift domain (warm phrasing, never a deficit)
    var strong = "", quiet = "", best = -1; DOM_ORDER.forEach(function (d) { var m = domMin[d] || 0; if (m > best) { best = m; strong = d; } });
    var totMin = 0; for (var dkey in domMin) { if (dkey !== "drift") totMin += domMin[dkey] || 0; }
    return { kept: kept, missed: missed, drift: drift, planned: planned, domMin: domMin, strong: strong, totMin: totMin, missBlocks: missBlocks, streak: curStreak(), streakSafe: (curStreak() > 0) };
  }
  function bookendMirrorLine(mr) { // warm summary; quiet/empty day reads warm, never a zero
    var DOMl = function (d) { return (DOM[d] && DOM[d].l) || d; };
    if (!mr.planned) return "A free-form day — nothing was on the books, and that's fine. Rest is part of the work.";
    var head = "You showed up for " + mr.kept + " of " + mr.planned;
    var strong = (mr.strong && (mr.domMin[mr.strong] || 0) > 0) ? " — strong on " + DOMl(mr.strong) : "";
    var streak = mr.streakSafe ? ". Streak safe." : ".";
    return head + strong + streak;
  }
  // ===== PM BOOKEND — MULTI-BEAT (CKPT-PM, David 2026-06-28): the full evening close runs INSIDE the cockpit stage. =====
  // Beats advance on the primary button via pmAdvance(); the Reflection ring keeps tracking throughout. One panel rebuilt per beat
  // (renderStage's dataset.mode guard keeps the 1s tick from wiping inputs; pmAdvance rebuilds explicitly). reward-never-shame: a
  // miss/drift is NEUTRAL data in DRIFT_GRAY, never red, never guilt. ALL tomorrow writes go through the safe path (skeletonDay /
  // blocks(tomK()).push + reflow(tomK())) — never calendarView/buildPull.
  var PM_BEATS = ["mirror", "restory", "ask", "plan", "close"];
  function pmHasDrift(mr) { return (mr.missBlocks && mr.missBlocks.length) || mr.drift; }
  function pmStageStep(sb) { // entry: reset to beat 0, then render. Called once per open (renderStage rebuilds only on mode change).
    sb.dataset.step = "0"; sb.dataset.mood = ""; sb.dataset.carry = ""; sb.dataset.reflect = ""; sb.dataset.oneThing = "";
    pmRenderBeat(sb);
  }
  function pmAdvance() { // primary-button handler: persist this beat's transient input, advance the step, rebuild — or commit+close on the last beat
    var sb = el("tfStageBody"); if (!sb) return;
    var step = Math.max(0, Math.min(PM_BEATS.length - 1, +(sb.dataset.step || 0)));
    var mr = bookendMirror(todayK());
    // flush the ask beat's transient inputs onto dataset so the later 'close' commit (no textarea in the DOM) still has them
    if (PM_BEATS[step] === "ask") { var ta = sb.querySelector("textarea"); if (ta) sb.dataset.reflect = ta.value.trim(); }
    if (step >= PM_BEATS.length - 1) { exitStage(true); return; } // final beat (close) → commit pm record + GENTLE celebrate + un-corner
    // skip the re-story beat entirely when there's nothing to re-story
    var next = step + 1;
    if (PM_BEATS[next] === "restory" && !pmHasDrift(mr)) next++;
    sb.dataset.step = String(next);
    pmRenderBeat(sb);
  }
  function pmBeatName(sb) { var step = Math.max(0, Math.min(PM_BEATS.length - 1, +(sb.dataset.step || 0))); return PM_BEATS[step]; }
  function pmPrimaryLabel() { var sb = el("tfStageBody"); if (!sb) return "Continue"; return (pmBeatName(sb) === "close") ? "Rest now" : "Continue"; }
  function pmRenderBeat(sb) {
    var k = todayK(), mr = bookendMirror(k), beat = pmBeatName(sb);
    sb.innerHTML = "";
    var card = add(sb, "div", "tf-stagecard"); card.style.display = "flex"; card.style.flexDirection = "column"; card.style.gap = "12px";
    // beat dots — soft progress, never a counter you can fail
    var live = PM_BEATS.filter(function (b) { return b !== "restory" || pmHasDrift(mr); });
    var dots = add(card, "div"); dots.setAttribute("style", "display:flex;gap:6px;align-items:center;");
    live.forEach(function (b) { var d = add(dots, "div"); var on = (b === beat); d.setAttribute("style", "width:" + (on ? 18 : 7) + "px;height:7px;border-radius:4px;background:" + (on ? DOM.restore.light : "#3a2640") + ";transition:all .2s;"); });
    if (beat === "mirror") pmBeatMirror(card, sb, mr, k);
    else if (beat === "restory") pmBeatRestory(card, sb, mr, k);
    else if (beat === "ask") pmBeatAsk(card, sb, mr, k);
    else if (beat === "plan") pmBeatPlan(card, sb, mr, k);
    else pmBeatClose(card, sb, mr, k);
    try { renderTFControls("pm"); } catch (e) {} // refresh the primary label ("Continue" → "Rest now")
  }
  // ---- BEAT 1: MIRROR (richer) — kept/drifted/missed, domain minutes, streak, a standout note. Pure read, no timeline touch.
  function pmBeatMirror(card, sb, mr, k) {
    var DOMl = function (d) { return (DOM[d] && DOM[d].l) || d; };
    add(card, "div", "tfs-h", "Let's close the day.");
    var mir = add(card, "div", "tfs-sub"); mir.textContent = bookendMirrorLine(mr);
    mir.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:11px 13px;line-height:1.45;");
    // a second warm beat: time invested + a standout win OR a quiet-day note (never a zero, never shame)
    var extra = "";
    if (mr.totMin >= 30) extra = "About " + dur(mr.totMin) + " of real, chosen time" + (mr.strong && (mr.domMin[mr.strong] || 0) > 0 ? " — your " + DOMl(mr.strong) + " stood out." : ".");
    else if (mr.kept >= 1) extra = "Even one thing kept is a vote for who you're becoming.";
    else extra = "A soft day — and rest is part of the work, not a gap in it.";
    var ex = add(card, "div", "tfs-sub"); ex.textContent = extra; ex.style.lineHeight = "1.45";
    if (mr.streak >= 2) { var stk = add(card, "div", "tfs-sub"); stk.textContent = "🔥 " + mr.streak + "-day thread, still going."; stk.style.color = DOM.restore.light; stk.style.fontSize = "13px"; }
    if (pmHasDrift(mr)) { var note = add(card, "div", "tfs-sub"); note.textContent = (mr.drift ? "The day drifted for a bit" : "A plan or two slid by") + " — just information, not a verdict. We'll re-story it next."; note.style.color = DRIFT_GRAY; note.style.fontSize = "13px"; }
  }
  // ---- BEAT 2: RE-STORY DRIFT (PM-RESTORY) — three calm taps per missed/drifted block. Drift in cool-gray, never red, never guilt.
  function pmBeatRestory(card, sb, mr, k) {
    add(card, "div", "tfs-h", "Re-story the drift.");
    add(card, "div", "tfs-sub", "What slid by isn't a verdict — it's a choice you get to make now.").style.color = DRIFT_GRAY;
    var list = add(card, "div"); list.setAttribute("style", "display:flex;flex-direction:column;gap:9px;");
    var rows = (mr.missBlocks || []).slice();
    if (!rows.length) { add(list, "div", "tfs-sub", "Nothing to re-story — you stayed close to the plan."); return; }
    rows.forEach(function (b) {
      var row = add(list, "div"); row.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 11px;display:flex;flex-direction:column;gap:8px;");
      var ttl = add(row, "div"); ttl.setAttribute("style", "color:" + DRIFT_GRAY + ";font-size:14px;");
      ttl.innerHTML = '<i class="ti ti-circle-dashed"></i> ' + esc(b.title) + ' · ' + esc(fmt(hm(b.time)));
      var btns = add(row, "div"); btns.setAttribute("style", "display:flex;gap:6px;flex-wrap:wrap;");
      var done = function (label) { row.innerHTML = ""; row.style.opacity = ".6"; var d = add(row, "div", "tfs-sub", label); d.style.color = DRIFT_GRAY; d.style.fontSize = "13px"; };
      var bRight = add(btns, "button", "tf-chip"); bRight.innerHTML = '<i class="ti ti-check"></i> Right call';
      bRight.onclick = function () { try { pushUndo(); b.done = true; b.intentional = true; save(); } catch (e) {} done("Right call — kept as a conscious choice."); }; // mark intentional so it stops reading as a miss; no log
      var bCarry = add(btns, "button", "tf-chip"); bCarry.innerHTML = '<i class="ti ti-arrow-right"></i> Carry to tomorrow';
      bCarry.onclick = function () { pmCarryToTomorrow(b); var c = (sb.dataset.carry || "").split("|").filter(Boolean); c.push(b.title); sb.dataset.carry = c.join("|"); done("Carried to tomorrow — it'll be waiting."); };
      var bLet = add(btns, "button", "tf-chip"); bLet.innerHTML = '<i class="ti ti-wind"></i> Let go';
      bLet.onclick = function () { try { pushUndo(); var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); reflow(k); save(); renderToday(); } catch (e) {} done("Let go — no trace, no weight."); };
    });
  }
  // ---- BEAT 3: ASK (adaptive) — pickPrompt over the PM bank + textarea + mood.
  function pmBeatAsk(card, sb, mr, k) {
    var q = pickPrompt("pm", journalCtx()); sb.dataset.q = q;
    add(card, "div", "tfs-h", "One honest line.");
    add(card, "div", "tfs-sub").textContent = q;
    var ta = add(card, "textarea", "jr-ta"); ta.placeholder = "a line is enough — or a few"; ta.rows = 4;
    ta.setAttribute("style", "width:100%;box-sizing:border-box;background:#1c0f20;border:2px solid #160510;border-radius:11px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;line-height:1.4;padding:11px 12px;resize:none;outline:none;-webkit-appearance:none;");
    var prev = ((S.bk || {})[k] || {}).pm; if (prev && prev.reflect) ta.value = prev.reflect;
    var moodWrap = add(card, "div", "jr-moodrow"); moodWrap.setAttribute("style", "display:flex;gap:8px;justify-content:space-between;");
    MOODS.forEach(function (m, i) {
      var f = add(moodWrap, "button", "jr-mood");
      f.setAttribute("style", "flex:1;background:#241328;border:2px solid #160510;border-radius:11px;box-shadow:0 2px 0 #160510;font-size:22px;padding:7px 0;cursor:pointer;line-height:1;");
      f.textContent = m.e; f.title = m.l;
      if ((prev && prev.mood === i) || sb.dataset.mood === String(i)) { f.style.borderColor = DOM.restore.light; }
      f.onclick = (function (idx) { return function () { var on = sb.dataset.mood === String(idx); sb.dataset.mood = on ? "" : String(idx); Array.prototype.forEach.call(moodWrap.querySelectorAll(".jr-mood"), function (b, bi) { b.style.borderColor = (!on && bi === idx) ? DOM.restore.light : "#160510"; b.style.transform = (!on && bi === idx) ? "translateY(1px)" : ""; }); }; })(i);
    });
  }
  // ---- BEAT 4: PRE-COMMIT TOMORROW (PM-PLAN, Odysseus) — name tomorrow's ONE thing → starred prio-3 block on tomK() via the safe path.
  function pmBeatPlan(card, sb, mr, k) {
    add(card, "div", "tfs-h", "Name tomorrow's one thing.");
    add(card, "div", "tfs-sub", "Decide it now, while you're calm — so tomorrow-you wakes to it already chosen.");
    var carry = (sb.dataset.carry || "").split("|").filter(Boolean);
    if (carry.length) { var cc = add(card, "div", "tfs-sub"); cc.style.color = DRIFT_GRAY; cc.style.fontSize = "13px"; cc.textContent = "Already waiting tomorrow: " + carry.join(", ") + "."; }
    var inp = add(card, "input"); inp.type = "text"; inp.placeholder = "e.g. ship the build";
    inp.setAttribute("style", "width:100%;box-sizing:border-box;background:#1c0f20;border:2px solid #160510;border-radius:11px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;padding:11px 12px;outline:none;-webkit-appearance:none;");
    if (sb.dataset.oneThing) inp.value = sb.dataset.oneThing;
    var done = ((S.bk || {})[tomK()] || {}).am || {};
    var status = add(card, "div", "tfs-sub"); status.style.fontSize = "13px"; status.style.color = DOM.restore.light;
    if (done.oneThing) status.textContent = "✓ Set for tomorrow: " + done.oneThing;
    var setBtn = add(card, "button", "tf-chip"); setBtn.style.marginTop = "2px"; setBtn.innerHTML = '<i class="ti ti-star"></i> Set it for tomorrow';
    setBtn.onclick = function () { var v = (inp.value || "").trim(); if (!v) { inp.focus(); return; } sb.dataset.oneThing = v; pmPlantOneThing(v); status.textContent = "✓ Set for tomorrow: " + v + " — starred and waiting."; };
  }
  // ---- BEAT 5: CLOSE — warm forward line. (commit happens in exitStage when the primary fires from this beat.)
  function pmBeatClose(card, sb, mr, k) {
    add(card, "div", "tfs-h", "That's the day, well closed.");
    var one = ((S.bk || {})[tomK()] || {}).am || {}, line;
    if (one.oneThing) line = "Tomorrow opens with one clear move: " + one.oneThing + ". I've got the morning — rest now.";
    else line = "You met the day and named what mattered. Rest now — I've got the morning.";
    var l = add(card, "div", "tfs-sub"); l.textContent = line; l.style.lineHeight = "1.5";
    l.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:12px 14px;line-height:1.5;");
  }
  // ---- safe tomorrow-write helpers (PM-PLAN / PM-RESTORY) — ONLY skeletonDay / blocks(tomK()).push + reflow(tomK()); never the live timeline render
  function pmPlantOneThing(title) {
    var tk = tomK();
    if (!(blocks(tk) || []).length) { skeletonDay(tk, title); } // empty tomorrow → seed a skeleton with the one thing as the starred deep-work block
    else { var have = false; blocks(tk).forEach(function (b) { if ((b.title || "").toLowerCase() === title.toLowerCase()) have = true; }); if (!have) { blocks(tk).push(markFutureBlock({ id: uid(), time: "09:00", mins: 90, title: title, prio: 3, color: "#2a9fe0", domain: "focus", done: false, star: true }, tk)); reflow(tk); } }
    var rec = bk(tk); rec.am = rec.am || {}; rec.am.oneThing = title; save();
  }
  function pmCarryToTomorrow(b) {
    var tk = tomK(); var have = false; blocks(tk).forEach(function (x) { if ((x.title || "").toLowerCase() === (b.title || "").toLowerCase()) have = true; });
    if (!have) { var t = nextFreeMin(tk); blocks(tk).push(markFutureBlock({ id: uid(), time: pad(Math.floor(t / 60)) + ":" + pad(t % 60), mins: b.mins || 30, title: b.title, prio: b.prio || 2, color: b.color || (DOM[domainOf(b)] || DOM.focus).c, domain: domainOf(b), catK: b.catK || null, done: false, carried: true }, tk)); reflow(tk); save(); }
  }
  // ===== AM BOOKEND — FULL MORNING RITUAL (David 2026-06-28) =====
  // Multi-beat flow rendered ENTIRELY into #tfStageBody (no #sheet). One internal step index (sb.dataset.amStep);
  // the 'Morning bookend' ring tracks throughout (lit by enterStage's trackTitle). The dataset preserves all picks
  // across beats and across the 1s live-tick. Beats: 0 GREET+HARVEST · 1 AIM (virtue → intrinsic why) ·
  // 2 BIG GOAL+move · 3 FLOW-DOWN/CLOSE confirm. exitStage('am', commit) reads sb.dataset.{ident,virtue,why,
  // goalKey,goalMove,oneThing} and does the SAFE flow-down (skeletonDay / blocks(k).push / reflow). NO #sheet, no calendarView touch.
  function amRotateGoal() { // surface ONE active goal, rotated by day so all get attention over the week
    var gs = activeGoals(); if (!gs.length) return null;
    var idx = Math.floor(Date.now() / 86400000) % gs.length; return gs[idx];
  }
  function amVirtueGlyph(b) { // FLOW-DOWN (c): a dim glyph appended to a matched bubble label — PURE additive innerHTML, zero geometry. Reward-only, never a deficit mark.
    try { var am = ((S.bk || {})[todayK()] || {}).am || {}; if (!am.virtue || !am.done) return "";
      if (virtueOf(b) !== am.virtue) return ""; var v = VIRTUES.filter(function (z) { return z.k === am.virtue; })[0]; if (!v) return "";
      return ' <span class="am-vglyph" style="opacity:.5;font-size:.85em" title="today\'s virtue">' + v.e + '</span>';
    } catch (e) { return ""; }
  }
  function amStep(sb) { return Math.max(0, Math.min(3, parseInt(sb.dataset.amStep || "0", 10) || 0)); }
  function amGoStep(sb, n) { sb.dataset.amStep = String(Math.max(0, Math.min(3, n))); amStageStep(sb); } // rebuild this beat (amStageStep clears #tfStageBody itself)
  function amStageStep(sb) {
    var k = todayK(), rec = (S.bk || {})[k] || {}, prevAm = rec.am || {};
    // seed every field ONCE per logical day (first mount) from this morning's record OR a PM-planted seed written last night under today's key
    if (sb.dataset.amSeeded !== k) {
      var seedIdent = (prevAm.identity && prevAm.identity.length) ? prevAm.identity.slice()
                    : ((S.profile && S.profile.todayIdentity) ? S.profile.todayIdentity.slice() : []);
      sb.dataset.ident = seedIdent.join("|");
      sb.dataset.virtue = prevAm.virtue || (S.profile && S.profile.todayVirtues && S.profile.todayVirtues[0]) || "";
      sb.dataset.why = prevAm.why || "";
      sb.dataset.goalKey = prevAm.goalKey || ""; sb.dataset.goalMove = prevAm.goalMove || ""; sb.dataset.oneThing = prevAm.oneThing || "";
      sb.dataset.amStep = "0"; sb.dataset.amSeeded = k;
    }
    sb.innerHTML = "";
    var step = amStep(sb);
    var card = add(sb, "div", "tf-stagecard"); card.style.display = "flex"; card.style.flexDirection = "column"; card.style.gap = "12px";
    // progress pips (4 beats) — soft, never a "you're behind" bar
    var pips = add(card, "div"); pips.style.cssText = "display:flex;gap:6px;align-self:center;margin-bottom:2px;";
    for (var pi = 0; pi < 4; pi++) { var dt = add(pips, "i"); dt.style.cssText = "width:7px;height:7px;border-radius:50%;display:block;background:" + (pi <= step ? DOM.restore.light : "#3a2230") + ";"; }
    function nextBtn(label, onTap) { var b = add(card, "button", "tf-b tf-done"); b.style.marginTop = "4px"; b.innerHTML = '<i class="ti ti-arrow-right"></i>' + esc(label); b.onclick = onTap; return b; }
    function backLink() { if (step <= 0) return; var bk2 = add(card, "button", "tf-chip"); bk2.style.cssText = "align-self:flex-start;opacity:.7;"; bk2.innerHTML = '<i class="ti ti-arrow-left"></i> back'; bk2.onclick = function () { amGoStep(sb, step - 1); }; }

    if (step === 0) {
      // ----- BEAT 0: GREET + HARVEST last night's seed -----
      add(card, "div", "tfs-h", "Good morning.");
      var mr = bookendMirror((lastDays(2) || [])[1]); // a one-line read of YESTERDAY
      var yLine = mr.planned ? ("Yesterday you showed up for " + mr.kept + " of " + mr.planned + (mr.strong && (mr.domMin[mr.strong] || 0) > 0 ? " — strong on " + ((DOM[mr.strong] && DOM[mr.strong].l) || mr.strong) : "") + ".")
                             : "A fresh page today.";
      add(card, "div", "tfs-sub").textContent = yLine;
      var seedVirt = sb.dataset.virtue, seedIdent = (sb.dataset.ident || "").split("|").filter(Boolean);
      var hasSeed = !!(seedVirt || seedIdent.length || sb.dataset.oneThing);
      if (hasSeed) {
        var vlab = seedVirt ? (VCLASS[seedVirt] || (VIRTUES.filter(function (v) { return v.k === seedVirt; })[0] || {}).l || "") : "";
        var parts = []; if (vlab) parts.push("you'd wake as " + vlab); if (sb.dataset.oneThing) parts.push("your one thing is " + sb.dataset.oneThing);
        var rb = add(card, "div", "tfs-sub"); rb.textContent = "Last time you chose: " + (parts.join(", ") || "an intention") + ". Still true?";
        rb.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:10px 12px;line-height:1.45;");
        nextBtn("Lock it", function () { amGoStep(sb, 2); }); // honor the seed → straight to the BIG GOAL beat
        var adj = add(card, "button", "tf-chip"); adj.style.cssText = "align-self:center;opacity:.85;"; adj.textContent = "Adjust"; adj.onclick = function () { amGoStep(sb, 1); };
      } else {
        add(card, "div", "tfs-sub").textContent = "Let's set who you wake as.";
        nextBtn("Begin", function () { amGoStep(sb, 1); });
      }
    } else if (step === 1) {
      // ----- BEAT 1: AIM — identity/virtue → intrinsic why -----
      add(card, "div", "tfs-h", "Who do you want to be today?");
      add(card, "div", "tfs-sub", "Wake as someone…").style.fontSize = "13px";
      var vg = add(card, "div", "am-vrow"); vg.setAttribute("style", "display:flex;flex-wrap:wrap;gap:7px;");
      VIRTUES.forEach(function (v) {
        var on = sb.dataset.virtue === v.k, b = add(vg, "button", "tf-chip");
        b.innerHTML = '<span style="font-size:1.05em">' + v.e + '</span> ' + v.l;
        if (on) { b.style.borderColor = v.c; b.style.color = v.c; }
        b.onclick = (function (vk) { return function () { sb.dataset.virtue = (sb.dataset.virtue === vk) ? "" : vk;
          Array.prototype.forEach.call(vg.querySelectorAll(".tf-chip"), function (x) { x.style.borderColor = ""; x.style.color = ""; });
          if (sb.dataset.virtue) { var vv = VIRTUES.filter(function (z) { return z.k === sb.dataset.virtue; })[0]; b.style.borderColor = vv ? vv.c : ""; b.style.color = vv ? vv.c : ""; }
        }; })(v.k);
      });
      // INTRINSIC-WHY chip row (SDT) — autonomy/identity reasons ONLY; no extrinsic option
      add(card, "div", "tfs-sub", "…because?").style.fontSize = "13px";
      var wg = add(card, "div", "am-whyrow"); wg.setAttribute("style", "display:flex;flex-wrap:wrap;gap:7px;");
      AM_WHYS.forEach(function (w) {
        var on = sb.dataset.why === w, b = add(wg, "button", "tf-chip"); b.textContent = w;
        if (on) { b.style.borderColor = DOM.restore.light; b.style.color = DOM.restore.light; }
        b.onclick = (function (ww) { return function () { sb.dataset.why = (sb.dataset.why === ww) ? "" : ww;
          Array.prototype.forEach.call(wg.querySelectorAll(".tf-chip"), function (x) { x.style.borderColor = ""; x.style.color = ""; });
          if (sb.dataset.why) { b.style.borderColor = DOM.restore.light; b.style.color = DOM.restore.light; }
        }; })(w);
      });
      nextBtn("Next", function () { amGoStep(sb, 2); });
      backLink();
    } else if (step === 2) {
      // ----- BEAT 2: BIG GOAL + smallest move -----
      var g = amRotateGoal();
      if (!g) {
        add(card, "div", "tfs-h", "Your one thing");
        add(card, "div", "tfs-sub").textContent = "What's the one move today that future-you would thank you for?";
        var ta0 = add(card, "textarea", "jr-ta"); ta0.rows = 2; ta0.placeholder = "the one thing…"; ta0.value = sb.dataset.oneThing || sb.dataset.goalMove || "";
        ta0.setAttribute("style", "width:100%;box-sizing:border-box;background:#1c0f20;border:2px solid #160510;border-radius:11px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;line-height:1.4;padding:11px 12px;resize:none;outline:none;-webkit-appearance:none;");
        ta0.oninput = function () { sb.dataset.oneThing = ta0.value.trim(); };
        nextBtn("Next", function () { sb.dataset.oneThing = ta0.value.trim(); amGoStep(sb, 3); });
        backLink();
      } else {
        sb.dataset.goalKey = g.title;
        add(card, "div", "tfs-h", "Toward " + g.title);
        add(card, "div", "tfs-sub").textContent = "You're building toward " + g.title + ". What's one small move today?";
        var taG; // declared first so subtask chips can mirror into it
        var subs = (g.subtasks || []).filter(function (s) { return !s.done; }).slice(0, 3);
        if (subs.length) { var sw = add(card, "div"); sw.style.cssText = "display:flex;flex-wrap:wrap;gap:7px;"; subs.forEach(function (s) { var c = add(sw, "button", "tf-chip"); c.textContent = s.title; if (sb.dataset.goalMove === s.title) { c.style.borderColor = DOM.restore.light; c.style.color = DOM.restore.light; } c.onclick = (function (tt) { return function () { sb.dataset.goalMove = (sb.dataset.goalMove === tt) ? "" : tt; if (taG) taG.value = sb.dataset.goalMove; Array.prototype.forEach.call(sw.querySelectorAll(".tf-chip"), function (x) { x.style.borderColor = ""; x.style.color = ""; }); if (sb.dataset.goalMove) { c.style.borderColor = DOM.restore.light; c.style.color = DOM.restore.light; } }; })(s.title); }); }
        taG = add(card, "textarea", "jr-ta"); taG.rows = 2; taG.placeholder = "…or type your own move"; taG.value = sb.dataset.goalMove || "";
        taG.setAttribute("style", "width:100%;box-sizing:border-box;background:#1c0f20;border:2px solid #160510;border-radius:11px;color:#ffe3f1;font-family:'Jost',sans-serif;font-size:15px;line-height:1.4;padding:11px 12px;resize:none;outline:none;-webkit-appearance:none;");
        taG.oninput = function () { sb.dataset.goalMove = taG.value.trim(); };
        nextBtn("Next", function () { sb.dataset.goalMove = taG.value.trim(); amGoStep(sb, 3); });
        backLink();
      }
    } else {
      // ----- BEAT 3: FLOW-DOWN summary + CLOSE (confirm) -----
      add(card, "div", "tfs-h", "Frame the day");
      var seedVirt2 = sb.dataset.virtue, vlab2 = seedVirt2 ? (VCLASS[seedVirt2] || (VIRTUES.filter(function (v) { return v.k === seedVirt2; })[0] || {}).l || "") : "";
      var sumParts = [];
      if (vlab2) sumParts.push("Wake as " + vlab2 + (sb.dataset.why ? " " + sb.dataset.why : ""));
      var theOne = sb.dataset.oneThing || sb.dataset.goalMove;
      if (theOne) sumParts.push("One thing: " + theOne);
      if (sb.dataset.goalKey && sb.dataset.goalMove && sb.dataset.goalMove !== theOne) sumParts.push("Toward " + sb.dataset.goalKey + ": " + sb.dataset.goalMove);
      var sumc = add(card, "div", "tfs-sub"); sumc.innerHTML = sumParts.length ? sumParts.map(function (p) { return esc(p); }).join("<br>") : "A free, open day — that's allowed too.";
      sumc.setAttribute("style", "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:10px 12px;line-height:1.6;");
      add(card, "div", "tfs-sub").textContent = "I'll place these on your timeline and carry your intention through the day.";
      card.lastChild.style.cssText = "font-size:12px;color:#cfa8c4;";
      // Save commits via exitStage('am', true) — same as the trackerControls 'am' primary; mirrored here as the obvious finish.
      nextBtn("Save the morning ☀️", function () { exitStage(true); });
      backLink();
    }
  }
  function setRing(p, col, instant) { var ring = el("tfRing"); if (!ring) return; var target = Math.max(0, Math.min(1, p)); col = col || "#28cf86";
    function paint(f) { var pct = (Math.max(0, Math.min(1, f)) * 100).toFixed(1); ring.style.background = "conic-gradient(" + col + " 0% " + pct + "%, rgba(255,255,255,.10) " + pct + "% 100%)"; }
    if (_ringRaf) { cancelAnimationFrame(_ringRaf); _ringRaf = 0; }
    if (instant || Math.abs(target - _ringP) < 0.01) { _ringP = target; paint(target); return; }
    function step() { var d = target - _ringP; if (Math.abs(d) < 0.006) { _ringP = target; paint(target); _ringRaf = 0; return; } _ringP += d * 0.16; paint(_ringP); _ringRaf = requestAnimationFrame(step); }
    _ringRaf = requestAnimationFrame(step); // GUITAR-HERO fill: glide the green up to the live % (and from 0 on open) so being on-task visibly charges the ring (David 2026-06-27)
  }
  function tfDone() { var run = activeTimers(); closeTrackerFull(); if (run.length) stopTimer(run[run.length - 1].id); } // finish the activity → close, then log it + fire the on-plan reward (stopTimer)
  function fmtCD(ms) { var s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ":" + pad(m) : m) + ":" + pad(ss); } // countdown m:ss (or h:mm:ss)
  function tfStartBreak() { var run = activeTimers(), t = run[run.length - 1], g = t ? { title: t.title, dom: domainOf(t), catK: t.catK, color: t.color } : null; durationSheet("Break", function (mins) { if (t) stopTimer(t.id); S.brk = { title: g ? g.title : "", dom: g ? g.dom : "focus", catK: g ? g.catK : null, color: g ? g.color : "#36b3f0", start: Date.now(), mins: mins }; save(); renderLiveTracker(); renderToday(); renderTrackerFull(); }); } // declared break: log what you did so far, then hold a timed pause with the goal waiting
  function tfResumeBreak() { var B = S.brk; S.brk = null; save(); if (B && B.title) startTimer({ title: B.title, catK: B.catK, color: B.color }); renderLiveTracker(); renderToday(); renderTrackerFull(); } // come back → restart the paused goal
  function tfEndBreak() { S.brk = null; save(); renderLiveTracker(); renderToday(); renderTrackerFull(); } // end the break without resuming → idle
  function tfBreakPlus(m) { if (S.brk) { S.brk.mins += m; save(); renderTrackerFull(); } }
  function tfHasPlan() { return (blocks(todayK()) || []).some(function (b) { return b.title; }); } // is there a plan today at all?
  function tfReplan() { planBreak(tfHasPlan() ? "Replan from now — what, for how long?" : "Plan now — what, for how long?"); } // pick an activity (single tap) → pick minutes → it owns now→future + starts tracking
  function tfPickTrack(title) { bentoPicker({ title: title || "Switch to?", onPick: function (x) { activeTimers().forEach(function (rt) { stopTimer(rt.id); }); var t = startTrackerNow(); assignTimer(t, x); maybeCelebrateTrack(t); renderLiveTracker(); renderToday(); renderTrackerFull(); } }); } // single-tap: tap an activity = start tracking it now (no second Play tap, no plan change)
  function tfCreatePlan() { bentoPicker({ title: "Plan what?", onPick: function (x) { durationSheet(x.title, function (mins) { var k = todayK(), now = logicalNowMin(), dom = domainOf(x); var nb = { id: uid(), time: pad(Math.floor(now / 60)) + ":" + pad(now % 60), mins: mins, title: x.title, prio: 2, color: x.color || (DOM[dom] || DOM.focus).c, catK: x.catK || null, domain: dom, done: false }; blocks(k).push(nb); reflow(k); save(); renderToday(); renderTrackerFull(); toast("📅 planned " + esc(x.title) + " · " + dur(mins)); }); } }); } // NO-PLAN "Create plan": pick activity → choose minutes → a FUTURE plan block (does NOT start tracking; you tap Start when ready) — David 2026-06-27
  function tfClaim() { var cb = claimableBlock(); if (!cb) { S._claimDismissed = true; renderTrackerFull(); return; } // collect the gap as a real log, reward it, then keep tracking the same activity forward (David 2026-06-27)
    var b = cb.block, dom = domainOf(b), D = DOM[dom] || DOM.focus, gapMin = Math.max(1, logicalNowMin() - cb.gapStartMin), sd = new Date(); sd.setHours(0, 0, 0, 0); sd = new Date(sd.getTime() + cb.gapStartMin * 60000);
    logs(todayK()).push({ id: uid(), time: pad(sd.getHours()) + ":" + pad(sd.getMinutes()), title: b.title, mins: gapMin, catK: b.catK, color: b.color || D.c, habitId: b.habitId || null }); // the welcome-back WRITE-PATH: heal the gap
    earn(Math.max(4, Math.round(gapMin / 3)), { catK: b.catK }); bumpStreak(); S._claimDismissed = false; save();
    var nt = startTrackerNow(); assignTimer(nt, { title: b.title, color: b.color || D.c, catK: b.catK }); maybeCelebrateTrack(nt); renderLiveTracker(); renderToday(); renderTrackerFull(); // continue forward
  }
  function tfClaimDismiss() { S._claimDismissed = true; save(); renderTrackerFull(); } // "not mine" → clear the claim, fall through to idle/night
  function tfNightBreathe() { if (typeof breathwork === "function") breathwork(4); else toast("rest — I've got the morning."); } // calm chip: a 4-cycle breath, or a gentle line
  // ===== ONE shared decision matrix (David 2026-06-28) =====
  // The SINGLE source of truth for what controls a tracker state offers. Both the EXPANDED ring (renderTFControls)
  // AND the FOLDED dock seg (renderLiveDock) render from this, so the two surfaces ALWAYS show the same actions
  // (same labels, same handlers, same order) → the .ld-seg ↔ #tfCtrls morph pairs the buttons 1:1.
  // Returns an ordered array of { icon, label, fn, primary }. Exactly one entry is primary (= the big #tfDone button
  // expanded / the play-stop circle in the folded dock). The rest are the secondary seg/row actions.
  function trackerControls(state) {
    switch (state) {
      case "claim":
        return [{ icon: "ti-circle-check", label: "Claim it", fn: tfClaim, primary: true },
                { icon: "ti-x", label: "Not mine", fn: tfClaimDismiss }];
      case "night":
        return [{ icon: "ti-wind", label: "Breathe with me", fn: tfNightBreathe, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: closeTrackerFull }];
      case "idle": {
        var n = nextPlannedBlock(todayK());
        if (n) return [{ icon: "ti-player-play-filled", label: "Start", fn: function () { startPlanned(n); renderTrackerFull(); }, primary: true },
                       { icon: "ti-list-search", label: "Just track", fn: function () { tfPickTrack("What are you doing?"); } },
                       { icon: "ti-arrows-shuffle", label: "Replan", fn: tfReplan }];
        return [{ icon: "ti-calendar-plus", label: "Create plan", fn: tfCreatePlan, primary: true },
                { icon: "ti-list-search", label: "Just track", fn: function () { tfPickTrack("What are you doing?"); } }];
      }
      case "break":
        return [{ icon: "ti-player-play-filled", label: "Resume", fn: tfResumeBreak, primary: true },
                { icon: "ti-plus", label: "+5 min", fn: function () { tfBreakPlus(5); } },
                { icon: "ti-x", label: "End break", fn: tfEndBreak }];
      case "breakup":
        return [{ icon: "ti-arrow-back-up", label: "Back to it", fn: tfResumeBreak, primary: true },
                { icon: "ti-plus", label: "+5 min", fn: function () { tfBreakPlus(5); } },
                { icon: "ti-x", label: "End", fn: tfEndBreak }];
      case "onplan": // Switch removed — the colored title pill IS the switch now (David 2026-06-27)
        return [{ icon: "ti-circle-check", label: "Done", fn: tfDone, primary: true },
                { icon: "ti-player-pause", label: "Pause", fn: tfStartBreak },
                { icon: "ti-arrows-shuffle", label: "Replan", fn: tfReplan }];
      // ===== COCKPIT GUIDED MODES (CKPT-3, David 2026-06-28): same {icon,label,fn,primary} shape → renderTFControls AND renderDockSeg render them + the morph pairs them 1:1. Wave-1 = minimal [Done -> exitStage]; real beat-controls land in CKPT-5/6/8. =====
      case "journal":
        return [{ icon: "ti-circle-check", label: "Save", fn: function () { exitStage(true); }, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: function () { exitStage(false); } }]; // Close = abandon: stop the timer WITHOUT writing a journal entry, ring un-corners
      case "journey": // the next-step card owns its primary CTA (in #tfStageBody); the bar just offers an escape + a do-anytime track door (never traps)
        return [{ icon: "ti-list-search", label: "Just track instead", fn: function () { TF_MODE = null; TF_MODE_USERSET = true; renderTrackerFull(); }, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: closeTrackerFull }];
      case "pm-mirror": case "pm-ask": case "am-greet":
        return [{ icon: "ti-circle-check", label: "Done", fn: function () { exitStage(true); }, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: closeTrackerFull }];
      case "sleepmath": case "rx":
        return [{ icon: "ti-circle-check", label: "Done", fn: function () { exitStage(false); }, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: closeTrackerFull }];
      case "tool":
        return [{ icon: "ti-chevron-down", label: "Close", fn: closeTrackerFull, primary: true }];
      // ===== AM / PM bookend controls (David 2026-06-28): Save commits the bookend record + GENTLE gated celebrate; Close abandons (no write), ring un-corners. Added at the END so sibling-mode merges stay trivial. =====
      case "pm": // MULTI-BEAT: primary ADVANCES the beat (pmAdvance commits on the final 'close' beat); Close abandons (no write), ring un-corners
        return [{ icon: "ti-arrow-right", label: pmPrimaryLabel(), fn: pmAdvance, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: function () { exitStage(false); } }];
      case "am":
        return [{ icon: "ti-circle-check", label: "Save", fn: function () { exitStage(true); }, primary: true },
                { icon: "ti-chevron-down", label: "Close", fn: function () { exitStage(false); } }];
      default: { // OFF-PLAN: no nonsensical "back on plan" — CREATE a plan (none yet) or REPLAN (change the one you have); both pick activity + minutes (David 2026-06-27)
        var first = tfHasPlan() ? { icon: "ti-arrows-shuffle", label: "Replan", fn: tfReplan, primary: true }
                                : { icon: "ti-calendar-plus", label: "Create plan", fn: tfCreatePlan, primary: true };
        return [first, { icon: "ti-player-stop", label: "Stop", fn: tfDone }]; // Switch removed — the title pill is the switch (David 2026-06-27)
      }
    }
  }
  function renderTFControls(state) { var c = el("tfCtrls"); if (!c) return; c.innerHTML = "";
    var ctrls = trackerControls(state), prim = ctrls.filter(function (x) { return x.primary; }), sec = ctrls.filter(function (x) { return !x.primary; });
    prim.forEach(function (x) { var bn = add(c, "button", "tf-b tf-done"); bn.innerHTML = '<i class="ti ' + x.icon + '"></i>' + x.label; bn.onclick = x.fn; });
    if (sec.length) { var row = add(c, "div", "tf-row"); sec.forEach(function (x) { var bn = add(row, "button", "tf-b"); bn.innerHTML = '<i class="ti ' + x.icon + '"></i>' + x.label; bn.onclick = x.fn; }); }
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
    { k: "musician", l: "Musician", ti: "ti-music", c: "#b07aff", occ: "artist" }, { k: "filmmaker", l: "Filmmaker", ti: "ti-movie", c: "#b07aff", occ: "artist" }, { k: "jobseeker", l: "Job-seeking", ti: "ti-search", c: "#ffc83d", occ: "other" },
    { k: "remote", l: "Remote worker", ti: "ti-home", c: "#34d39a", occ: "dev" }, { k: "retired", l: "Retired", ti: "ti-umbrella", c: "#2ab8c4", occ: "other" },
    { k: "homemaker", l: "Homemaker", ti: "ti-home-cog", c: "#ff5fa0", occ: "other" }, { k: "figuring", l: "Figuring it out", ti: "ti-compass", c: "#ff8a3a", occ: "other" }
  ];
  var VIBES2 = [ { k: "thriving", l: "Thriving", ti: "ti-flame", c: "#34d39a" }, { k: "coasting", l: "Coasting", ti: "ti-windmill", c: "#ffc83d" }, { k: "stuck", l: "Stuck", ti: "ti-anchor", c: "#7f9bc4" }, { k: "overwhelmed", l: "Overwhelmed", ti: "ti-urgent", c: "#c4607f" } ];
  var GOAL_SEED = [ { l: "Make art", d: "create", ti: "ti-palette" }, { l: "Grow my business", d: "focus", ti: "ti-briefcase" }, { l: "Get fit", d: "move", ti: "ti-barbell" }, { l: "Learn a skill", d: "create", ti: "ti-bulb" }, { l: "Read more", d: "play", ti: "ti-book" }, { l: "Save money", d: "focus", ti: "ti-coin" }, { l: "Sleep better", d: "restore", ti: "ti-moon" }, { l: "Find love", d: "connect", ti: "ti-heart" }, { l: "Eat healthier", d: "nourish", ti: "ti-apple" }, { l: "Quit a bad habit", d: "drift", ti: "ti-ban" }, { l: "Grow my audience", d: "create", ti: "ti-users" }, { l: "Feel calmer", d: "restore", ti: "ti-wind" }, { l: "Clean my home", d: "upkeep", ti: "ti-home" }, { l: "Lose weight", d: "move", ti: "ti-scale" }, { l: "Make music", d: "create", ti: "ti-music" }, { l: "Make videos", d: "create", ti: "ti-video" }, { l: "Write a book", d: "create", ti: "ti-book" }, { l: "Make money", d: "focus", ti: "ti-cash" } ];
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
    filmmaker: [["Edit footage", "create"], ["Write script", "create"], ["Film", "create"], ["Post a video", "create"]],
    jobseeker: [["Apply", "focus"], ["Network", "connect"], ["Study", "focus"]],
    remote: [["Deep work", "focus"], ["Meetings", "focus"], ["Email", "focus"]],
    retired: [["Walk", "move"], ["Garden", "play"], ["Hobby", "play"]],
    homemaker: [["Meal prep", "nourish"], ["Clean", "upkeep"], ["Laundry", "upkeep"], ["Errands", "upkeep"]],
    figuring: [["Journal", "restore"], ["Explore", "play"], ["Study", "focus"]]
  };
  function onboard() {
    var data = { gender: "", age: "", vibe: "", stages: {}, customStages: [], kept: {}, _pref: "", goals: {}, wake: "7–8", bed: "11–12", peak: "lark", identity: [], customIdent: [], virtue: "", oneThing: "", habitsSel: {}, customHabits: [], level: "" };
    var step = 0, STEPS = 7; // 0 intro · 1 vibe · 2 you · 3 roles · 4 goals-light · 5 rhythm · 6 ready (2026-06-30: replaced 5 heavy category screens with one calm multi-select)
    // role buckets so "What's your life like?" reads as a few calm labeled rows, not 23 flat chips (David 2026-06-29)
    var ROLE_GROUPS = [
      { l: "Work & Career", ti: "ti-briefcase", c: "#36b3f0", ks: ["founder", "employee", "freelancer", "developer", "remote", "manager", "sales", "teacher", "healthcare", "service", "trades"] },
      { l: "Creative", ti: "ti-palette", c: "#ffc83d", ks: ["creative", "writer", "musician", "filmmaker"] },
      { l: "Care & Home", ti: "ti-heart", c: "#ff5fa0", ks: ["parent", "caregiver", "homemaker"] },
      { l: "Learning & Figuring", ti: "ti-school", c: "#34d39a", ks: ["student", "jobseeker", "figuring"] },
      { l: "Body & Life", ti: "ti-leaf", c: "#9a8cc4", ks: ["athlete", "retired"] }
    ];
    // role → goals it tends to imply: the onboarding surfaces these FIRST, marked ✨, so the app feels like it already gets you (David 2026-06-29 — adaptive onboarding)
    var ROLE_GOALS = {
      filmmaker: ["Make videos", "Make money", "Grow my audience"], musician: ["Make music", "Grow my audience", "Make money"],
      creative: ["Make art", "Grow my audience"], writer: ["Write a book", "Make art"],
      founder: ["Grow my business", "Make money"], freelancer: ["Grow my business", "Make money"], sales: ["Grow my business", "Make money"],
      developer: ["Make money", "Learn a skill"], remote: ["Make money", "Learn a skill"], manager: ["Grow my business"],
      athlete: ["Get fit", "Lose weight"], student: ["Learn a skill", "Read more"], jobseeker: ["Grow my business", "Learn a skill"],
      homemaker: ["Clean my home", "Eat healthier"], parent: ["Clean my home", "Feel calmer"], caregiver: ["Feel calmer"],
      retired: ["Read more", "Feel calmer"], figuring: ["Feel calmer", "Learn a skill"], teacher: ["Read more"], healthcare: ["Feel calmer"]
    };
    var EXTRA_HABITS = [{ id: "water", e: "💧", l: "Drink water", type: "build", per: 0, color: "#48d0e0" }, { id: "walk", e: "🚶", l: "Walk", type: "build", per: 0, color: "#ff8a1e" }, { id: "journal", e: "📓", l: "Journal", type: "build", per: 0, color: "#9a5cf0" }, { id: "stretch", e: "🤸", l: "Stretch", type: "build", per: 0, color: "#ff8a1e" }, { id: "meditate", e: "🧘", l: "Meditate", type: "build", per: 0, color: "#6a5cf0" }, { id: "noscroll", e: "📵", l: "No doomscroll", type: "quit", per: 0, color: "#7f9bc4" }, { id: "noweed", e: "🌿", l: "Less weed", type: "quit", per: 0, color: "#7f9bc4" }, { id: "nogame", e: "🎮", l: "Less gaming", type: "quit", per: 0, color: "#7f9bc4" }];
    var ov = add(document.body, "div", "ob-ov"), card = add(ov, "div", "ob-card");
    var bar = add(card, "div", "ob-bar"), barF = add(bar, "i");
    var body = add(card, "div", "ob-body"), foot = add(card, "div", "ob-foot");
    function chip(p, label, on, color, ink) { var s = add(p, "span", "ob-ch" + (on ? " on" : "")); if (color) { s.style.background = on ? color : mixDark(color); s.style.color = on ? (ink || "#160510") : color; } s.innerHTML = label; return s; }
    function keys(o) { return Object.keys(o).filter(function (k) { return o[k]; }); }
    function seedKept() { data.kept = {}; for (var d in STAGE_BASE) STAGE_BASE[d].forEach(function (t) { data.kept[t] = true; }); keys(data.stages).forEach(function (sk) { (STAGE_EXTRA[sk] || []).forEach(function (a) { data.kept[a[0]] = true; }); var st = LIFESTAGES.filter(function (x) { return x.k === sk; })[0]; if (st) { var o = OCC_BY_K[st.occ]; if (o && o.work) o.work.forEach(function (g) { g.tasks.slice(0, 3).forEach(function (t) { data.kept[t.l] = true; }); }); } }); }
    function typeRow(placeholder, onAdd, label) { add(body, "div", "ob-lbl", label || "✦ MISSING SOMETHING? TYPE IT"); var arow = add(body, "div", "ob-addrow"); var inp = document.createElement("input"); inp.className = "ob-input"; inp.placeholder = placeholder; arow.appendChild(inp); var ab = add(arow, "button", "ob-addbtn"); ab.innerHTML = '<i class="ti ti-plus"></i> add'; ab.onclick = function () { var v = inp.value.trim(); if (!v) { inp.focus(); return; } onAdd(v); draw(); }; inp.addEventListener("keydown", function (e) { if (e.key === "Enter") ab.onclick(); }); }
    // ONE calm multi-select step: "What do you want help with?" — all GOAL_SEED chips, role-suggested ones floated first (✨), skippable, plus a type-your-own row. Replaces the 5 heavy per-category screens. Habits stay silently auto-seeded. (2026-06-30)
    function drawGoalsLight() {
      add(body, "div", "ob-q", "What do you want help with?");
      add(body, "div", "ob-sb", "tap anything that resonates — or skip, no pressure");
      // auto-seed default habits silently (user never sees the habit picker during onboarding now)
      if (!data._habInit) { data._habInit = true; DEFAULT_HABITS.forEach(function (h) { data.habitsSel[h.id] = true; }); seedKept(); }
      // build suggested set from roles
      var sugg = {}; keys(data.stages).forEach(function (rk) { (ROLE_GOALS[rk] || []).forEach(function (gl) { sugg[gl] = 1; }); });
      var suggested = GOAL_SEED.filter(function (g) { return sugg[g.l]; });
      var rest = GOAL_SEED.filter(function (g) { return !sugg[g.l]; });
      function goalChip(p, g, star) {
        var on = data.goals[g.l]; var D = DOM[g.d] || DOM.focus;
        var c = chip(p, (star ? '✨ ' : '') + '<i class="ti ' + g.ti + '"></i> ' + g.l + (on ? ' ✓' : ''), on, D.c, D.ink);
        c.onclick = function () { data.goals[g.l] = !data.goals[g.l]; draw(); };
      }
      if (suggested.length) {
        add(body, "div", "ob-lbl", "✨ SUGGESTED FOR YOU").style.color = "#ffd98a";
        var sgr = add(body, "div", "ob-row"); suggested.forEach(function (g) { goalChip(sgr, g, true); });
        add(body, "div", "ob-lbl", "MORE IDEAS");
      } else {
        add(body, "div", "ob-lbl", "WHAT MATTERS TO YOU");
      }
      var gr = add(body, "div", "ob-row"); rest.forEach(function (g) { goalChip(gr, g, false); });
      // show any custom goals the user has typed
      var customGoalKeys = keys(data.goals).filter(function (g) { return !GOAL_SEED.filter(function (x) { return x.l === g; })[0]; });
      if (customGoalKeys.length) {
        var cgr = add(body, "div", "ob-row");
        customGoalKeys.forEach(function (g) { var c = chip(cgr, '<i class="ti ti-star"></i> ' + esc(g) + ' ✓', true, "#ff8a3a", "#4a2400"); c.onclick = function () { data.goals[g] = false; draw(); }; });
      }
      typeRow("something else on your mind…", function (v) { data.goals[v] = true; }, "✦ ADD YOUR OWN");
    }
    function next() { if (step < STEPS - 1) { step++; draw(); } else finish(); }
    function finish() {
      // guard: if the user skipped step 4 entirely, still seed default habits + kept activities silently
      if (!data._habInit) { data._habInit = true; DEFAULT_HABITS.forEach(function (h) { data.habitsSel[h.id] = true; }); seedKept(); }
      S.profile = S.profile || {}; var P = S.profile;
      var sel = keys(data.stages).map(function (k) { return LIFESTAGES.filter(function (x) { return x.k === k; })[0]; }).filter(Boolean);
      P.gender = data.gender; P.age = data.age; P.vibe = data.vibe; P.lowStart = (data.vibe === "overwhelmed" || data.vibe === "stuck"); P.stages = keys(data.stages); P.occ = sel.length ? sel[0].occ : "other"; // wire the once-dead vibe: an overwhelmed/stuck onboarder gets the body-first low-energy gate until real mood data arrives (David 2026-06-29 readiness test)
      P.goals = keys(data.goals).join(", "); P.wake = data.wake; P.sleep = data.bed; P.peak = data.peak; P.lark = (data.peak !== "owl"); P.set = true;
      S.acts = S.acts || []; keys(data.kept).forEach(function (t) { if (!TITLE2CAT[t.toLowerCase()] && !S.acts.filter(function (a) { return a.title === t; })[0]) S.acts.push({ title: t, catK: null, domain: domainOf({ title: t }) }); });
      S.goals = keys(data.goals).map(function (g, _gi) { var seed = GOAL_SEED.filter(function (x) { return x.l === g; })[0]; var go = { title: g, domain: seed ? seed.d : domainOf({ title: g }), subtasks: [], active: true }; try { decomposeGoal(go).forEach(function (st) { go.subtasks.push({ title: st, done: false }); }); } catch (e) {} attachGuessedMetric(go); return go; }); // mark the first few active so they immediately pull onto the journey + daily suggestions (David 2026-06-29 spine) // auto-break every goal into its loving steps at birth — the smallest one flows into daily suggestions; no buried "Break it down" button to find (David 2026-06-29 Wave B)
      // ===== ONBOARDING → JOURNEY SEED (David 2026-06-28): write what the journey path reads so a new user's trail is THEIRS, not generic demo circles. All additive, guarded. =====
      // 1) HABITS the user chose → S.habits (so the journey's habit circles are theirs). Fall back to defaults if they cleared everything.
      var allHabDefs = DEFAULT_HABITS.concat(EXTRA_HABITS).concat(data.customHabits);
      var picked = allHabDefs.filter(function (h) { return data.habitsSel[h.id]; }).map(function (h) { return { id: h.id, e: h.e, l: h.l, type: h.type || "build", per: h.per || 0, color: h.color || "#8a5cf0" }; });
      if (picked.length) S.habits = picked;
      // 2) BIG-3 IDENTITY / virtue / one-thing → seed today's AM bookend so the journey's ⭐ keystone + virtue-matching light up.
      var idents = (data.identity || []).slice(0, 3), virt = data.virtue || "", oneT = (data.oneThing || "").trim();
      if (idents.length || virt || oneT) {
        var reca = bk(todayK()); reca.am = reca.am || {};
        reca.am.identity = idents; reca.am.virtue = virt; reca.am.oneThing = oneT; reca.am.why = ""; reca.am.ts = Date.now(); reca.am.done = true;
        if (idents.length) P.todayIdentity = idents.slice(); if (virt) P.todayVirtues = [virt];
      }
      // 3) STARTING LEVEL → seed S.guide.unlocked floor so journeyNode() opens at the right chapter; keep mode guided so the path engine drives the cockpit.
      S.guide = S.guide || { mode: "guided", seedTier: 0, unlocked: [], cache: {}, offeredK: null };
      S.guide.mode = "guided";
      var lvl = data.vibe === "thriving" ? 4 : data.vibe === "coasting" ? 2 : data.vibe === "stuck" ? 1 : 0; // infer the journey's opening chapter from how life feels — no separate "where are you starting?" question (David 2026-06-29)
      S.guide.unlocked = S.guide.unlocked || []; for (var _i = 0; _i <= lvl; _i++) if (S.guide.unlocked.indexOf(_i) < 0) S.guide.unlocked.push(_i);
      // 4) SEED TODAY'S PLAN from their one-thing + chosen activities so the journey isn't empty — they finish standing on a populated path. Uses the SAFE skeletonDay path (never touches calendarView render).
      try {
        if (!(blocks(todayK()) || []).some(function (b) { return b.title; })) {
          skeletonDay(todayK(), oneT || "");
          var keptActs = keys(data.kept).slice(0, 3);
          keptActs.forEach(function (t) {
            if ((blocks(todayK()) || []).some(function (b) { return (b.title || "").toLowerCase() === t.toLowerCase(); })) return;
            var dm = domainOf({ title: t }), tm = nextFreeMin(todayK());
            blocks(todayK()).push({ id: uid(), time: pad(Math.floor(tm / 60)) + ":" + pad(tm % 60), mins: 30, title: t, prio: 2, color: (DOM[dm] || DOM.focus).c, domain: dm, done: false });
          });
          reflow(todayK());
        }
      } catch (e) {}
      save(); ov.remove(); renderAll(); viewK = todayK(); zoomMode = "day"; try { openJourney(); } catch (e) {} toast("✨ Your world is ready — your journey's all set"); // land on the JOURNEY (cascaded stepping-stones), not the planner, after onboarding (David v661)
    }
    function draw() {
      barF.style.width = Math.round((step + 1) / STEPS * 100) + "%"; body.innerHTML = ""; foot.innerHTML = "";
      body.className = (step === 0 || step === 6) ? "ob-body center" : "ob-body";
      if (step === 0) { add(body, "i", "ti ti-sparkles ob-spk"); var f = add(body, "div", "ob-face"); add(f, "span", "ob-eye l"); add(f, "span", "ob-eye r"); add(body, "div", "ob-q", "Hi, I'm Sage."); add(body, "div", "ob-sb", "your guardian. I'll help you become who you want to be — one day at a time."); }
      if (step === 1) { add(body, "div", "ob-q", "How's life feeling?"); add(body, "div", "ob-sb", "no wrong answer"); var col = add(body, "div", "ob-col"); VIBES2.forEach(function (v) { var c = chip(col, '<i class="ti ' + v.ti + '"></i> ' + v.l, data.vibe === v.k, v.c, "#160510"); c.onclick = function () { data.vibe = v.k; draw(); }; }); }
      if (step === 2) { add(body, "div", "ob-q", "A little about you"); add(body, "div", "ob-sb", "helps me suggest a starting point"); add(body, "div", "ob-lbl", "YOU ARE"); var gr = add(body, "div", "ob-row"); [["f", "she"], ["m", "he"], ["o", "they"], ["", "skip"]].forEach(function (g) { var c = chip(gr, g[1], data.gender === g[0]); c.onclick = function () { data.gender = g[0]; draw(); }; }); add(body, "div", "ob-lbl", "AGE"); var ar = add(body, "div", "ob-row"); ["teens", "20s", "30s", "40s", "50s", "60+"].forEach(function (a) { var c = chip(ar, a, data.age === a); c.onclick = function () { data.age = a; if (!keys(data.stages).length) data.stages[stageSuggest(data.age)] = true; draw(); }; }); }
      if (step === 3) {
        add(body, "div", "ob-q", "What's your life like?"); add(body, "div", "ob-sb", "pick all that fit — you can be more than one · or type your own");
        if (!keys(data.stages).length && data.age) data.stages[stageSuggest(data.age)] = true;
        ROLE_GROUPS.forEach(function (grp) {
          var sec = add(body, "div", "ob-libsec"); var dh = add(sec, "div", "ob-dh"); dh.innerHTML = '<i class="ti ' + grp.ti + '"></i> ' + grp.l.toUpperCase(); dh.style.color = grp.c;
          var w = add(sec, "div", "ob-row");
          grp.ks.forEach(function (k) { var s = LIFESTAGES.filter(function (x) { return x.k === k; })[0]; if (!s) return; var on = data.stages[s.k]; var c = chip(w, '<i class="ti ' + s.ti + '"></i> ' + s.l + (on ? ' ✓' : ''), on, s.c, "#160510"); c.onclick = function () { data.stages[s.k] = !data.stages[s.k]; draw(); }; });
        });
        var cw = add(body, "div", "ob-row"); (data.customStages || []).forEach(function (v) { var ck = "custom:" + v, on = data.stages[ck], c = chip(cw, '<i class="ti ti-user"></i> ' + esc(v) + (on ? ' ✓' : ''), on, "#ff8a3a", "#4a2400"); c.onclick = function () { data.stages[ck] = !data.stages[ck]; draw(); }; });
        typeRow("your role / situation…", function (v) { data.customStages.push(v); data.stages["custom:" + v] = true; });
      }
      if (step === 4) drawGoalsLight();
      if (step === 5) { add(body, "div", "ob-q", "Your daily rhythm"); add(body, "div", "ob-sb", "rough is fine — pick a range"); add(body, "div", "ob-lbl", "I USUALLY WAKE"); var ur = add(body, "div", "ob-row"); ["before 6", "6–7", "7–8", "8–9", "9–10", "later", "varies"].forEach(function (t) { var c = chip(ur, t, data.wake === t); c.onclick = function () { data.wake = t; draw(); }; }); add(body, "div", "ob-lbl", "I USUALLY SLEEP"); var brr = add(body, "div", "ob-row"); ["before 10", "10–11", "11–12", "12–1", "1–2", "later", "varies"].forEach(function (t) { var c = chip(brr, t, data.bed === t); c.onclick = function () { data.bed = t; draw(); }; }); add(body, "div", "ob-lbl", "SHARPEST"); var lr = add(body, "div", "ob-row"); [["lark", "Morning", "ti-sun", "#ffc83d", "#5a3a00"], ["owl", "Night", "ti-moon", "#9a7cff", "#241548"], ["mixed", "It varies", "ti-windmill", "#7f9bc4", "#16243a"]].forEach(function (o) { var on = data.peak === o[0], c = chip(lr, '<i class="ti ' + o[2] + '"></i> ' + o[1], on, o[3], o[4]); c.onclick = function () { data.peak = o[0]; draw(); }; }); }
      if (step === 6) { var w = add(body, "div", "ob-world"); w.innerHTML = '<i class="ti ti-sparkles"></i>'; add(body, "div", "ob-q", "Your world is ready ✨"); add(body, "div", "ob-sb", "seeded with your life. let's make today count."); }
      var b = add(foot, "button", "ob-btn" + (step === STEPS - 1 ? " go" : "")); b.textContent = step === 0 ? "Let's go ▸" : step === STEPS - 1 ? "Plan your first day ▸" : "Next ▸"; b.onclick = next;
      if (step > 0 && step < STEPS - 1) { var bk = add(foot, "button", "ob-back", "◂ back"); bk.onclick = function () { step--; draw(); }; }
      var skip = add(foot, "button", "ob-skip", "skip"); skip.onclick = function () { ov.remove(); try { openJourney(); } catch (e) {} }; // skip → reveal the journey with the stepping-stones cascade too (David v661)
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
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } if (S.v == null) S.v = 0; var prevSchema = S.v; S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; S.habits = S.habits.filter(function (h) { return h.id !== "send"; }); S.habits.forEach(function (h) { if (!h.type) h.type = "build"; if (h.per == null) h.per = 0; if (!h.color) h.color = "#8a5cf0"; }); S.game = S.game || { spark: 0, total: 0, ups: {} }; S.game.ups = S.game.ups || {}; S.game.garden = S.game.garden || []; S.brain = S.brain || { engine: "off", key: "" }; S.microState = S.microState || {}; S.mood = S.mood || {}; S.acts = S.acts || []; S.acts.forEach(function (a) { if (a.children == null) a.children = []; }); /* sub-habits: a custom activity can own children (Deep work → Define the ONE thing, No phone…) — default [] so old data is safe (David 2026-06-27) */ S.bk = S.bk || {}; S.guide = S.guide || { mode: "off", seedTier: 0, unlocked: [], cache: {}, offeredK: null }; S.tools = S.tools || {}; S.tools.use = S.tools.use || {}; S.tools.last = S.tools.last || {}; S.tools.fav = S.tools.fav || []; S.tools.recents = S.tools.recents || []; /* WISDOM TOOLBOX (TB-STATE, David 2026-06-28): additive top-level store keyed by toolId — use[id] = COMPLETED reps (Willingness<3 / Habit<12 / Grace ladder), last[id]=todayK of last finish (drives once/day drift-handoff gate). NO SCHEMA bump (matches S.mood/S.acts/S.bk/S.guide precedent); every read guards (S.tools||{}); rides export/import + undo for free. */ /* COCKPIT (CKPT-4): additive top-level objects matching the S.mood/S.acts precedent — NO SCHEMA bump, rides export/import/undo. Default mode 'off' = inert until the dial is flipped. */ TF_MODE = null; TF_MODE_USERSET = false; TF_BLOCKID = null; /* reset transient stage on every load so a crash never strands a half-built flow */ S.timers.forEach(function (t) { if (!t.dayK) t.dayK = logicalK(new Date(t.start)); }); var _tk = todayK(); S.timers = S.timers.filter(function (t) { return t.dayK === _tk && t.title !== "Tracking…"; });
    /* ===== F-0 (SCHEMA 1→2, David 2026-06-30): consolidated migration — keystone for the Heroic-course build (_course/BUILD-SPEC.md §2). Adds scaffolding fields/keys ONLY; zero behavior change. prevSchema captured near top of load(). ===== */
    if (prevSchema < 2) {
      Object.keys(S.bk).forEach(function (dk) { var day = S.bk[dk]; if (!day) return;
        if (day.am) { if (!day.am.vm) day.am.vm = { rungs: [], focusVirtue: "", ts: null }; if (day.am.compassFocus === undefined) day.am.compassFocus = null; }
        if (day.pm && !day.pm.wol) day.pm.wol = { wentWell: "", needsWork: "", optimize: "", dayRating: "" };
      });
      S.habits.forEach(function (h) {
        if (h.trigger === undefined) h.trigger = ""; if (h.anchor === undefined) h.anchor = ""; if (h.celebrate === undefined) h.celebrate = "";
        if (h.domain === undefined) h.domain = null; if (h.plusOne === undefined) h.plusOne = ""; if (h.deleteConfig === undefined) h.deleteConfig = null;
        if (h.chain === undefined) h.chain = { best: 0, debt: 0 };
      });
      if (!S.vmStreak) S.vmStreak = { current: 0, best: 0, lastDate: null };
    }
    /* ===== F-1 (SCHEMA 2→3, 2026-06-30): plannedAhead field — marks blocks created for a future day so the reward economy can fire the planned-then-done celebrate(). Migration sets existing blocks to false (safe default). New blocks get plannedAhead=true at creation time when dayKey > todayK(). ===== */
    if (prevSchema < 3) {
      Object.keys(S.blocks || {}).forEach(function (dk) {
        (S.blocks[dk] || []).forEach(function (b) { if (b.plannedAhead === undefined) b.plannedAhead = false; });
      });
    }
    /* additive top-level keys (every load, idempotent — match S.bk/S.tools precedent, no bump needed for these) */
    S.sf = S.sf || { history: {}, actions: {} }; S.scorecard = S.scorecard || { weeks: {} }; S.alg = S.alg || { list: [], catalysts: {} }; S.course = S.course || {}; S.cdj = S.cdj || {}; S.guide.nodeHistory = S.guide.nodeHistory || {}; if (S.guide.onboard2 === undefined) S.guide.onboard2 = null; if (S.profile) S.profile.viaTop5 = S.profile.viaTop5 || [];
    S.v = SCHEMA; }
  function bk(k) { S.bk = S.bk || {}; return (S.bk[k] = S.bk[k] || { am: {}, pm: {} }); } // bookend baton accessor — guarded lazy shape (CKPT-4)
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
    if (mode === "download") { var blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "alter-backup-" + key(new Date()) + "-v" + SCHEMA + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); toast("⬇ backup downloaded"); }
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
    // NEWER FEATURES (journey/guide, bookends, tools, custom activities, profile/goals): load() defaults these to non-null empties, so the generic S[k]==null carry below would silently DROP a backup's values. Take the backup's copy whenever ours is still empty/default, so these round-trip on Merge too (David 2026-06-28).
    var emptyish = function (v) { if (v == null) return true; if (Array.isArray(v)) return v.length === 0; if (typeof v === "object") return Object.keys(v).length === 0; return false; };
    ["bk", "guide", "tools", "acts", "profile", "presets"].forEach(function (m) { if (d[m] != null && emptyish(S[m])) S[m] = d[m]; });
    var handled = { habits: 1, blocks: 1, log: 1, habitDone: 1, mood: 1, microState: 1, game: 1, timers: 1, v: 1, bk: 1, guide: 1, tools: 1, acts: 1, profile: 1, presets: 1 };
    Object.keys(d).forEach(function (k) { if (!handled[k] && S[k] == null) S[k] = d[k]; }); // carry any unknown future field
    save(); load(); renderAll(); buildPull(); toast("⧉ merged in — nothing overwritten");
  }
  function restoreUI(B) {
    var w = add(B, "div"); w.style.marginTop = "10px"; add(w, "div", "lbl", "paste a backup (or pick a file), then Merge to combine or Restore to replace:");
    var ta = document.createElement("textarea"); ta.placeholder = "paste backup JSON here…"; ta.style.cssText = "width:100%;height:88px;background:#161020;color:#ece4f7;border:2.5px solid #4a4068;border-radius:14px;padding:11px;font-size:12px;font-family:inherit;"; w.appendChild(ta);
    var fi = document.createElement("input"); fi.type = "file"; fi.accept = "application/json,.json"; fi.style.cssText = "margin:8px 0;font-size:12px;color:#caa0bd;"; w.appendChild(fi); fi.onchange = function () { var f = fi.files && fi.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { ta.value = r.result; toast("📄 loaded — now Merge or Restore"); }; r.readAsText(f); };
    var row = add(w, "div"); row.style.cssText = "display:flex;gap:8px;";
    var mg = add(row, "button", "done2", "⧉ Merge in"); mg.style.flex = "1"; mg.onclick = function () { var d = parseBackup(ta.value.trim()); if (d) mergeImport(d); };
    var rs = add(row, "button", "done2", "♻ Replace"); rs.style.cssText = "flex:1;background:#3a2147;"; rs.onclick = function () { var d = parseBackup(ta.value.trim()); if (!d) return; if (!window.confirm("This REPLACES all your current data with this backup — continue?")) return; var prev = localStorage.getItem(KEY); try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { try { if (prev != null) localStorage.setItem(KEY, prev); } catch (e2) {} toast("⚠️ couldn't restore — storage may be full; your data is unchanged"); return; } location.reload(); }; // atomic: snapshot → write → on failure roll back so a bad write never strands David with empty/partial data. reload re-runs load() which migrates the backup up to SCHEMA.
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
    else if (p === "morning") { out.kicker = "this morning"; out.line = "Good morning — let's recommit."; out.sub = "60 seconds: who you're being, your one thing, gratitude — then I frame your day."; out.primary = { label: "Morning recommit ☀️", fn: recommitSheet }; out.chips.push({ label: "Morning bookend 🌅", fn: function () { enterStage("am", { trackTitle: "Morning bookend", byTap: true }); } }); out.chips.push({ label: "Plan your day", fn: function () { planSheet(todayK(), "today"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); } // AM bookend door (David 2026-06-28): one-tap into the cockpit morning stage — greet, never auto-trap
    else if (p === "evening") { out.kicker = "this evening"; out.line = "Evening — close the day well."; out.sub = "reflect on today, tidy up, set tomorrow's one thing."; out.primary = { label: "Reflection 🌙", fn: function () { enterStage("pm", { trackTitle: "Reflection", byTap: true }); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); } // PM bookend (David 2026-06-28): replaces the dumb EVENING_RITUAL #sheet with the cockpit Reflection stage
    else { if (!blocks(todayK()).length) { out.kicker = p; out.line = "No plan yet — what's today at its best?"; out.sub = "let's get it out of you — the things you want (and keep avoiding)."; out.primary = { label: "Plan today ☀️", fn: function () { shapeFlow(todayK()); } }; } else if (und.length) { out.kicker = p; out.line = und.length + (und.length === 1 ? " habit left." : " habits left."); out.sub = "knock one out while you've got momentum."; out.primary = { label: "What are you doing?", fn: nowSheet }; } else { out.kicker = p; out.line = "On track. Nice."; out.sub = "get ahead on tomorrow?"; out.primary = { label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }; } if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    // PLAN-THE-REST meta-button (David 2026-06-28): when today HAS a plan but little ahead of the now-line (≤2 future blocks), offer one-tap into the same beautiful flow to fill the rest of the day. Skipped at night (winding down). Front of the chip row.
    if (p !== "night" && blocks(todayK()).some(function (b) { return b.title; })) { var _now = logicalNowMin(), ahead = blocks(todayK()).filter(function (b) { return b.title && hm(b.time) + (b.mins || 30) > _now; }).length; if (ahead <= 2) out.chips.unshift({ label: "Plan the rest of my day ☀️", fn: function () { shapeFlow(todayK()); } }); }
    if (S.profile && S.profile.exWant && p !== "night") { var ww = weeklyWorkouts(); if (ww < S.profile.exWant) out.chips.push({ label: "🏃 workout (" + ww + "/" + S.profile.exWant + " this wk)", fn: nowSheet }); }
    // WISDOM TOOLBOX — drift handoff (TB-DRIFT-HANDOFF): when a starred/high-prio block has slid past the now-line undone, the angel offers Reversal of Desire — the in-the-moment 'move toward the avoided thing' move. Gated ONCE per logical-day (S.tools.last.reversal), and only when the toolbox is reachable. Verdict copy only — no timeline geometry.
    var _av = avoidedBlock(); if (_av && (S.tools && S.tools.last && S.tools.last.reversal) !== todayK()) { out.chips.push({ label: "Avoiding it? → reverse the desire", fn: function () { reversalOfDesire(_av); } }); }
    out.chips.unshift({ label: "🗺️ Today's journey", fn: openJourney }); // JOURNEY PATH meta-door — the Duolingo-style daily trail, front of the chip row (David 2026-06-28)
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
  function nightAmt() { // 0 = full day, ~0.58 = deep night — smooth dusk/dawn ramps (drives the island's dynamic lighting)
    var h = new Date().getHours() + new Date().getMinutes() / 60, MAX = 0.64;
    if (h >= 7 && h < 18) return 0;                          // day
    if (h >= 18 && h < 21) return MAX * (h - 18) / 3;        // dusk ramp up
    if (h >= 5 && h < 7) return MAX * (7 - h) / 2;           // dawn ramp down
    return MAX;                                              // night (21→5)
  }
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
    // ===== DYNAMIC / VOLUMETRIC LIGHTING (David 2026-06-28, redo): a POOL of light around you that falls into real darkness at the edges (line-of-sight feel), warm ADDITIVE glow so lit areas stay rich-not-grey, soft shadows cast off the big objects, and dust motes drifting in the light for actual volume. =====
    var _night = nightAmt();
    if (_night > 0.03) {
      function w2s(wx, wy) { return [W / 2 + (wx - (px + camX)) * vz, H * 0.6 + (wy - (py + camY)) * vz]; }
      var GL = w2s(px, py - 12), maxR = Math.max(W, H), fl = 0.93 + Math.sin(t * 3.2) * 0.07; // guardian light + flicker
      ctx.save();
      // 1) VIGNETTE DARKNESS centered on you: clear at your feet → deep dark at the edges (you see around you, black beyond)
      var dg = ctx.createRadialGradient(GL[0], GL[1], 36 * vz * fl, GL[0], GL[1], maxR * 0.66);
      dg.addColorStop(0, "rgba(7,6,20,0)"); dg.addColorStop(0.5, "rgba(7,6,20," + (_night * 0.72) + ")"); dg.addColorStop(1, "rgba(4,3,12," + Math.min(0.96, _night + 0.36) + ")");
      ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
      // 2) SOFT SHADOWS: the cabin + big trees throw a dark blob away from your light (cheap volumetric depth)
      [[-58, 2, 46], [-152, -84, 40], [190, -30, 40], [150, 74, 40]].forEach(function (o) { var s = w2s(o[0], o[1]), dx = s[0] - GL[0], dy = s[1] - GL[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, len = (o[2] * vz) + d * 0.5, mx = s[0] + ux * len * 0.5, my = s[1] + uy * len * 0.5; ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.atan2(uy, ux)); var sg = ctx.createLinearGradient(-len / 2, 0, len / 2, 0); sg.addColorStop(0, "rgba(3,2,10," + (_night * 0.5) + ")"); sg.addColorStop(1, "rgba(3,2,10,0)"); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, 0, len / 2, o[2] * vz * 0.55, 0, 0, 7); ctx.fill(); ctx.restore(); });
      // 3) WARM ADDITIVE GLOW — lit areas read rich amber, not dim grey
      ctx.globalCompositeOperation = "lighter";
      [[px, py - 12, 160, 1], [-58, 2, 96, 0.75]].forEach(function (L) { var s = w2s(L[0], L[1]), f = 0.92 + Math.sin(t * 3.5 + L[0]) * 0.08, r = L[2] * vz * f, g = ctx.createRadialGradient(s[0], s[1], 0, s[0], s[1], r); var a = _night / 0.64 * L[3]; g.addColorStop(0, "rgba(255,190,108," + (0.30 * a) + ")"); g.addColorStop(0.45, "rgba(255,148,66," + (0.12 * a) + ")"); g.addColorStop(1, "rgba(255,140,60,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s[0], s[1], r, 0, 7); ctx.fill(); });
      // 4) DUST MOTES drifting in the beam — the volumetric tell
      for (var mi = 0; mi < 10; mi++) { var ph = mi * 2.4, mr = (40 + (mi % 5) * 22) * vz, ma = ph + t * (0.25 + (mi % 3) * 0.06), mx2 = GL[0] + Math.cos(ma) * mr, my2 = GL[1] + Math.sin(ma) * mr * 0.7, tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.7 + mi)); ctx.fillStyle = "rgba(255,210,150," + (0.5 * tw * _night / 0.64) + ")"; ctx.beginPath(); ctx.arc(mx2, my2, 1.6 * vz * tw, 0, 7); ctx.fill(); }
      ctx.restore();
    }
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
    // (purple night tint removed — David 2026-06-28: island shows in its natural warm pixel colors)
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
    gm.classList.add("on"); worldFit(); updGameHud(); wireWorldTap(); try { playReveal(gm); } catch (e) {} // portal-reveal the game on open (v648)
    document.body.classList.add("gaming"); // body scroll locked by CSS (v640)
    if (!gameOn) { gameOn = true; requestAnimationFrame(drawWorld); }
    gameNavSetup(); gm.classList.add("gn-open"); // start with the bar SHOWN — it folds to the corner button once you actually pan/scroll the world (David 2026-07-02)
  }
  function gameNavSetup() { // the game menu FOLDS to a single corner button; tap it to bring up the Planner·Journey·Game bar (thumbsticks rise above it); any play touch folds it back (David 2026-07-02)
    var gm = el("gameMode"); if (!gm || gm._navWired) return; gm._navWired = true;
    function openMenu() { gm.classList.add("gn-open"); }
    function foldMenu() { gm.classList.remove("gn-open"); }
    var tg = el("gnToggle"); if (tg) tg.onclick = openMenu;
    var _gnSx = 0, _gnSy = 0, _gnTrack = false;
    gm.addEventListener("pointerdown", function (e) { if (e.target && e.target.closest && e.target.closest("#gameNav, #gnToggle, #gameExit")) return; _gnSx = e.clientX; _gnSy = e.clientY; _gnTrack = true; }, true);
    gm.addEventListener("pointermove", function (e) { if (!_gnTrack) return; if (Math.abs(e.clientX - _gnSx) > 10 || Math.abs(e.clientY - _gnSy) > 10) { _gnTrack = false; foldMenu(); } }, true); // the bar STAYS until you actually scroll/pan/play — a real DRAG (not a tap) folds it to the corner button (David 2026-07-02)
    gm.addEventListener("pointerup", function () { _gnTrack = false; }, true);
    gm.addEventListener("pointercancel", function () { _gnTrack = false; }, true);
    var p = el("gnPlanner"); if (p) p.onclick = function () { closeGame(); closeJourney(); };
    var j = el("gnJourney"); if (j) j.onclick = function () { closeGame(); openJourney(); };
    var g = el("gnGame"); if (g) g.onclick = foldMenu; // already in the game → just fold the menu
  }
  function closeGame() {
    var gm = el("gameMode"); if (gm) gm.classList.remove("on");
    document.body.classList.remove("gaming");
    gameOn = false; moveX = 0; moveY = 0; // do NOT reset body.overflow here — it must stay locked (this reset was the thing that un-pinned the body and reintroduced the gap) (v640)
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
    { x: 150, y: 74, r: 66, fn: function () { characterCard(); } },           // tree → character card (the self tab is now the game itself, David 2026-06-28)
    { x: -130, y: 28, r: 46, fn: function () { goTab("grow"); } }             // chest → habits
  ];
  function wireWorldTap() { // TWO-FINGER drag pans the camera around the island (David 2026-06-30): ONE finger is reserved for the 3-pane spine swipe (Journey ⇄ Game), so the world only pans with two fingers — which also composes naturally with the pinch-zoom (pan + zoom together, like the planner).
    if (worldTapWired) return; worldTapWired = true; var w = el("world"); if (!w) return;
    var pts = {}; // active pointers that started ON the world surface (id → {x,y})
    function npts() { return Object.keys(pts).length; }
    function mid() { var v = Object.keys(pts).map(function (i) { return pts[i]; }); return v.length < 2 ? null : { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 }; }
    var panning = false, lmx = 0, lmy = 0, lim = (typeof RS !== "undefined" ? RS : 200) * 1.3;
    function rel(ev) { if (pts[ev.pointerId]) delete pts[ev.pointerId]; if (npts() < 2) panning = false; }
    w.addEventListener("pointerup", rel); w.addEventListener("pointercancel", rel); document.addEventListener("pointerup", rel); document.addEventListener("pointercancel", rel);
    w.addEventListener("pointerdown", function (ev) {
      if (ev.target !== w) return; // only the world surface itself — never a joystick/zoom/notebook button on top
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      if (npts() >= 2 && !panning) { var m = mid(); if (m) { panning = true; lmx = m.x; lmy = m.y; } } // second finger down → begin a midpoint-tracked pan
    });
    document.addEventListener("pointermove", function (e) {
      if (pts[e.pointerId]) { pts[e.pointerId].x = e.clientX; pts[e.pointerId].y = e.clientY; }
      if (!panning || npts() < 2) return;
      var m = mid(); if (!m) return; var dx = m.x - lmx, dy = m.y - lmy; lmx = m.x; lmy = m.y;
      camX = Math.max(-lim, Math.min(lim, camX - dx / zoom)); camY = Math.max(-lim, Math.min(lim, camY - dy / zoom));
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
  // CHARACTER CARD (David 2026-06-27): tap the guardian → a clean berry card of who you're becoming — class, level, virtue stars + their skill trees. Reuses virtues()/VCLASS/virtueDetail.
  function characterCard() {
    if (!(S.profile && S.profile.set)) { onboard(); return; }
    var v = virtues(); vState = v;
    var ov = add(document.body, "div", "bento-ov"), card = add(ov, "div", "bento-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var head = add(card, "div", "bento-head"); var hq = add(head, "div", "bento-q"); hq.innerHTML = '<i class="ti ti-shield-star"></i> ' + (VCLASS[v.top.k] || "Your character"); var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); };
    var body = add(card, "div", "bento-body");
    var P = S.profile, bits = ["Lv " + v.level]; if (P.age) bits.push(P.age + (P.gender ? " " + ({ m: "♂", f: "♀", o: "⚧" }[P.gender] || "") : "")); if (P.occ) bits.push(esc(P.occ));
    add(body, "div", "char-sub", bits.join(" · ") + " · ✨ " + (S.game.spark || 0).toLocaleString());
    add(body, "div", "sughead", "your virtues — they level by living. tap one to open its skill tree");
    var grid = add(body, "div", "char-grid");
    v.list.slice().sort(function (a, b) { return b.lv - a.lv; }).forEach(function (vv) {
      var t = add(grid, "button", "char-vrow" + (vv.focus ? " foc" : "")); t.style.borderColor = vv.c;
      var ic = add(t, "span", "char-vic"); ic.style.background = mixDark(vv.c); ic.style.color = vv.c; ic.textContent = vv.e;
      var mid = add(t, "div", "char-vmid"); var nm = add(mid, "div", "char-vn"); nm.innerHTML = esc(vv.l) + ' <span class="char-vlv" style="color:' + vv.c + '">Lv ' + vv.lv + (vv.focus ? ' ★' : '') + '</span>';
      var bar = add(mid, "div", "char-vbar"); var bi = add(bar, "i"); bi.style.width = Math.round((vv.glow || 0.4) * 100) + "%"; bi.style.background = vv.c;
      add(t, "i", "ti ti-chevron-right char-vchev");
      t.onclick = function () { ov.remove(); virtueDetail(vv); };
    });
  }
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
  /* ===== B: SOUL FORCE score + "THAT'S LIKE ME" ping (David 2026-06-30, _course/BUILD-SPEC.md §B). Additive; reads existing state; no shape change. Labels are placeholders — rename anytime. ===== */
  var TLM_PHRASES = ["That's like me.", "That's like me. ✦", "That's so like me."];
  var _tlmTimer = null;
  function pickTLM(domain) { return TLM_PHRASES[Math.floor(Date.now() / 2000) % TLM_PHRASES.length]; }
  function triggerTLM(ctx) { var chip = el("tlmChip"); if (!chip) return; chip.textContent = (ctx && ctx.tlm) || pickTLM(ctx && ctx.domain); chip.classList.remove("show"); void chip.offsetWidth; chip.classList.add("show"); if (_tlmTimer) clearTimeout(_tlmTimer); _tlmTimer = setTimeout(function () { chip.classList.remove("show"); }, 2100); }
  function logSF(ctx) { var dk = todayK(); S.sf = S.sf || { history: {}, actions: {} }; S.sf.actions = S.sf.actions || {}; (S.sf.actions[dk] = S.sf.actions[dk] || []).push({ t: Date.now(), label: (ctx && ctx.label) || "", domain: (ctx && ctx.domain) || null }); var ks = Object.keys(S.sf.actions); if (ks.length > 45) { ks.sort(); ks.slice(0, ks.length - 40).forEach(function (k) { delete S.sf.actions[k]; }); } }
  function sfNow(dk) {
    dk = dk || todayK();
    var hb = (S.habits || []).filter(function (h) { return h.type === "build"; }), done = S.habitDone[dk] || {};
    var e = hb.length ? Math.round(hb.filter(function (h) { return done[h.id]; }).length / hb.length * 100) : 50;
    var blocks = (S.blocks[dk] || []).filter(function (b) { return b.time != null && b.mins; }), nm = nowMin();
    var elp = blocks.filter(function (b) { return b.time <= nm; });
    var f = elp.length ? Math.round(elp.filter(function (b) { return b.done; }).length / elp.length * 100) : 50;
    var acts = (S.sf && S.sf.actions && S.sf.actions[dk]) || [];
    var w = acts.length ? Math.min(acts.length * 15, 100) : ((S.bk[dk] && S.bk[dk].am && S.bk[dk].am.done) ? 70 : 30);
    var streak = curStreak(), c = Math.max(0.5, Math.min(streak, 10));
    var sf = Math.round(Math.pow((e * f * w) / 1e6, c / 10) * 100);
    sf = Math.max(10, sf); if (streak < 7) sf = Math.min(99, sf);
    return { sf: sf, e: e, f: f, w: w };
  }
  function earn(base, ctx) { var got = Math.max(1, Math.round(base)); S.game.spark += got; S.game.total += got; logSF(ctx); save(); triggerTLM(ctx);
    var jspk = el("jpSpark"); if (jspk) { var jn = jspk.querySelector(".spark-n"); if (jn) jn.textContent = (S.game.spark || 0).toLocaleString(); jspk.classList.remove("bump"); void jspk.offsetWidth; jspk.classList.add("bump"); if (document.body.classList.contains("journey-open")) { try { var jr = jspk.getBoundingClientRect(); var jf = document.createElement("div"); jf.className = "spark-float"; jf.textContent = "+" + got; jf.style.left = (jr.left + jr.width / 2 - 8) + "px"; jf.style.top = (jr.top + 4) + "px"; document.body.appendChild(jf); setTimeout(function () { try { jf.remove(); } catch (e) {} }, 950); } catch (e) {} } } // persistent Spark counter pulses + floats +N (David 2026-07-02)
    var sp = el("spark"); if (sp) { sp.style.transition = "none"; sp.style.transform = "scale(1.14)"; setTimeout(function () { sp.style.transition = "transform .3s"; sp.style.transform = "scale(1)"; renderGame(); }, 30); try { var r0 = sp.getBoundingClientRect(); var fl = document.createElement("div"); fl.className = "spark-float"; fl.textContent = "+" + got; fl.style.left = (r0.left + r0.width / 2 + (Math.random() * 26 - 13)) + "px"; fl.style.top = (r0.top + 2) + "px"; document.body.appendChild(fl); setTimeout(function () { try { fl.remove(); } catch (e) {} }, 950); } catch (e) {} } } // floating +N feedback so earning Spark feels good (David 2026-06-24 night)
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
  // ===== JOURNALING 101 (David 2026-06-28): a PALETTE of Brian Johnson journal TYPES, not one forced template.
  // Sourced from the actual Journaling 101 transcript (_specs/JOURNALING-101-brian-johnson-transcript.md) + KB SN-232/SN-239 (brian-johnson.md).
  // Johnson's meta-principle (Nietzsche, 11th big idea): "there is no THE way — what is YOUR way." So types are SWITCHABLE + FAVORITABLE;
  // the angel only PRE-SELECTS a sensible default by time-of-day + state — it never traps you in one template. Reward-never-shame throughout:
  // the evening "what I'd improve" beat is curious & kind (Johnson: "win or learn, never lose"); quiet days read warm.
  // The 8 Virtue Declarations — SN-232, Johnson's final distillation of Areté. PRESENT-TENSE DECLARATIONS (not future-tense affirmations). Keyed to VIRTUES.
  var VIRTUE_DECLARATIONS = {
    wisdom:    "I know the ultimate game and how to play it well.",
    disc:      "I forge antifragile confidence with every action I take.",
    love:      "I am joyful, connected, and encouraging.",
    courage:   "I am willing to act in the presence of fear.",
    gratitude: "I appreciate all the blessings and gifts in my life.",
    hope:      "I have inspiring goals, agency, and pathways.",
    curiosity: "I pay attention to what's working and what needs work.",
    zest:      "I dominate my fundamentals so I have Heroic energy."
  };
  // The journal-type registry. Each type is a guided flow keyed by id; jtRenderBeat drives the multi-beat ones.
  // icon = tabler glyph, e = emoji, label, blurb = one-line "what this is". `src` cites the Johnson idea it's modeled on (transcript big-idea #).
  var JTYPES = [
    { id: "five",     icon: "ti-sunrise",        e: "🌅", label: "Five-Minute Foundation", blurb: "See your best self today — gratitude, your #1 thing, who you're being.", src: "Johnson big idea #1" },
    { id: "big3",     icon: "ti-versions",       e: "🎯", label: "The Big 3",              blurb: "Energy · Family · Service — who you're BEING, why, what you'll do.",   src: "Johnson big idea #4" },
    { id: "grat",     icon: "ti-heart-handshake",e: "🙏", label: "Gratitude",              blurb: "Five specific things — one at a time, felt, not a dry list.",          src: "Johnson big idea #1 / PERMA" },
    { id: "evening",  icon: "ti-moon-stars",     e: "🌙", label: "Evening Reflection",     blurb: "What went well · what you'd improve · what to carry. No guilt.",        src: "Johnson big idea #2 (Masterpiece PM)" },
    { id: "woop",     icon: "ti-target-arrow",   e: "🎈", label: "WOOP",                   blurb: "Wish · Outcome · Obstacle · Plan — for your #1 goal.",                 src: "Johnson big idea #6 (Oettingen)" },
    { id: "keystone", icon: "ti-key",            e: "🗝️", label: "Keystone Habits",        blurb: "The 3 habits you do on your BEST days. Make your best your baseline.", src: "Johnson big idea #5" },
    { id: "free",     icon: "ti-feather",        e: "🪶", label: "Free / Adaptive",        blurb: "Open reflection — the angel mirrors your patterns and asks.",          src: "the original adaptive mode" },
    // lighter modes (single-beat capture)
    { id: "fundo",    icon: "ti-confetti",       e: "🎉", label: "Fun-Do List",           blurb: "Micro-wins to do today — not a to-do list. Cross them off.",           src: "Johnson big idea #9" },
    { id: "capture",  icon: "ti-bulb",           e: "💡", label: "Capture",                blurb: "Get an idea out of your head and onto the page.",                      src: "Johnson big idea #9 (GTD)" },
    { id: "purpose",  icon: "ti-compass",        e: "🧭", label: "Purpose",                blurb: "Love × great-at × world-needs → your one thing.",                      src: "Johnson big idea #10 (Hedgehog)" }
  ];
  function jtype(id) { for (var i = 0; i < JTYPES.length; i++) if (JTYPES[i].id === id) return JTYPES[i]; return JTYPES[6]; } // default → free
  // ADAPTIVE PRE-SELECT (the angel picks the right template by phase + state; the user is always free to switch). Reward-never-shame: low/drift state → gentle Free, never a "fix yourself" type.
  function pickJournalType() {
    var ph = phase(), ctx = journalCtx();
    if (ctx.drift || (ctx.streak === 0 && ctx.kept === 0 && ctx.missCount === 0)) return "free"; // low-motivation / nothing-happened → open, never a demanding template
    if (ph === "morning") return ctx.lastInt ? "big3" : "five"; // already recommitted today → go deeper with Big 3; else the Five-Minute Foundation
    if (ph === "evening" || ph === "night") return "evening";
    if (ph === "afternoon") return ctx.mins >= 120 ? "evening" : "free";
    return "free";
  }
  // ===== ADAPTIVE JOURNAL PROMPTS (CKPT-5/PM-ASK, David 2026-06-28): scored rule bank modeled on WISDOM/MICRO. Each {q, when:fn(ctx)->bool, weight}. pickPrompt fires the single highest-weight match over real signals (drift>miss>streak>big-win>quiet>generic). Reward-never-shame: drift/miss are NEUTRAL data, never guilt. =====
  // phase tags: a rule fires for a requested phase if its `ph` array includes that phase (or `ph` is absent = shared by journal+pm).
  // The PM rules (ph:["pm"]) are the evening-reflection question bank (PM-ASK); they never surface in the freeform Journal door.
  var JPROMPTS = [
    { id: "drift",    q: "The day went its own way for a bit — what pulled your attention?",           when: function (c) { return c.drift; },                 weight: 90 },
    { id: "lastint",  q: "This morning you leaned toward “" + "{int}" + "” — how did that land?", when: function (c) { return !!c.lastInt; },             weight: 85 },
    { id: "miss",     q: "A plan or two slid by today — anything worth noticing about why?",            when: function (c) { return c.missCount >= 2; },         weight: 70 },
    { id: "bigstreak",q: "You're on a roll — what's been keeping the momentum going?",                  when: function (c) { return c.streak >= 5; },            weight: 65 },
    { id: "streak",   q: "You kept the thread today — what made it feel doable?",                       when: function (c) { return c.streak >= 2 && c.kept >= 2; }, weight: 55 },
    { id: "bigwin",   q: "You put real time in today — what felt best about it?",                       when: function (c) { return c.mins >= 180; },            weight: 60 },
    { id: "kept",     q: "Something went right today — what was it, even a small thing?",               when: function (c) { return c.kept >= 1; },              weight: 40 },
    { id: "quiet",    q: "A quiet day. What's one thing you'd like tomorrow to hold?",                  when: function (c) { return true; },                     weight: 10 },
    // ===== PM reflection bank (PM-ASK, David 2026-06-28): warm, never-shame; a miss is neutral data. Priority ladder drift>miss>intent>lagVirtue>bigwin>streak>kept>quiet. =====
    { id: "pm-drift",  ph: ["pm"], q: "The day took its own route for a stretch — no judgment, what was calling you?",        when: function (c) { return c.drift; },               weight: 92 },
    { id: "pm-miss",   ph: ["pm"], q: "A couple of plans drifted past — what does that tell you about today, gently?",       when: function (c) { return c.missCount >= 2; },      weight: 78 },
    { id: "pm-intent", ph: ["pm"], q: "This morning you reached for “" + "{int}" + "” — how did living it feel?",   when: function (c) { return !!c.lastInt; },           weight: 74 },
    { id: "pm-lagv",   ph: ["pm"], q: "{lagv} stayed quiet today — is it asking for a little room tomorrow?",               when: function (c) { return !!c.lagVirtue; },         weight: 66 },
    { id: "pm-bigwin", ph: ["pm"], q: "You poured real hours in today — what part of that felt most like you?",            when: function (c) { return c.mins >= 180; },         weight: 62 },
    { id: "pm-streak", ph: ["pm"], q: "You kept the thread going — what made showing up feel possible today?",             when: function (c) { return c.streak >= 2 && c.kept >= 1; }, weight: 50 },
    { id: "pm-kept",   ph: ["pm"], q: "One good thing happened today, even a small one — what was it?",                     when: function (c) { return c.kept >= 1; },           weight: 38 },
    { id: "pm-quiet",  ph: ["pm"], q: "A soft day — and rest is part of the work. What would you like tomorrow to hold?",   when: function (c) { return true; },                  weight: 12 }
  ];
  function journalCtx() { // real signals from today's data — pure read, no writes
    var k = todayK(), bl = blocks(k) || [], drift = false, missCount = 0, kept = 0;
    bl.forEach(function (b) { if (!b.title) return; var st = blockStatus(k, b); if (st === "ok") kept++; else if (st === "miss") missCount++; });
    var run = activeTimers(); run.forEach(function (t) { if (domainOf(t) === "drift") drift = true; });
    (logs(k) || []).forEach(function (l) { if (domainOf(l) === "drift") drift = true; });
    var yK = (lastDays(2) || [])[1], yBk = (S.bk || {})[yK] || {}, lastInt = (yBk.am && (yBk.am.why || (yBk.am.identity && yBk.am.identity[0]))) || ((S.bk || {})[k] && S.bk[k].am && S.bk[k].am.why) || "";
    return { drift: drift, missCount: missCount, kept: kept, streak: curStreak(), mins: tfDomMinsToday(null), lastInt: lastInt, lagVirtue: lagVirtueLabel() };
  }
  function lagVirtueLabel() { // the lowest-glow virtue today = the one "quiet" today (warm prompt only, never a deficit bar) — pure read
    try { var vs = (typeof virtues === "function") ? virtues() : null; if (!vs || !vs.length) return ""; var lo = vs.slice().sort(function (a, b) { return (a.x || 0) - (b.x || 0); })[0]; return lo ? lo.l : ""; } catch (e) { return ""; }
  }
  function pickPrompt(phase, ctx) { // highest-weight matching rule for the requested phase; sensible default if none (the 'quiet' generic always matches)
    ctx = ctx || journalCtx(); var best = null;
    JPROMPTS.forEach(function (p) { if (p.ph) { if (p.ph.indexOf(phase) === -1) return; } else if (phase === "pm") { return; } // pm uses ONLY ph:["pm"] rules; journal uses the shared (no-ph) rules
      try { if (p.when(ctx) && (!best || p.weight > best.weight)) best = p; } catch (e) {} });
    if (!best) return "A line about today is enough. What stood out?";
    return best.q.replace("{int}", esc(ctx.lastInt || "your intention")).replace("{lagv}", esc(ctx.lagVirtue || "A virtue"));
  }
  // ===== PATTERN-MIRROR (the learning angel, David 2026-06-28): journalPatterns() scans lastDays(21) of S.log/S.bk/S.blocks for CONSERVATIVE, gated truths.
  // A pattern only surfaces if it recurs >=6 times across >=14 distinct active days, with a confidence field. Below threshold the angel stays SILENT — better silent than wrong.
  // Reward-never-shame: every line is curious, never a verdict ("worth a look?"), never "you should". Cached to S.bkPatterns so it computes once/logical-day, not per render.
  function journalPatterns() {
    var cache = S.bkPatterns || (S.bkPatterns = {});
    if (cache.computedK === todayK() && cache.items) return cache.items; // once/day
    var days = lastDays(21), spanDays = {}, items = [];
    function lab(d) { return (DOM[d] && DOM[d].l) || d; }
    var slip = {};        // blockTitle -> recurring slip-time tracker
    var domByMood = {};   // mood(0-4) -> { dom -> mins }  (mood<->domain correlation)
    var goodDayDoms = {}; // dom -> count of "good" days that opened with it (what precedes good days)
    var goodDayN = 0, moodN = 0;
    days.forEach(function (k) {
      var lg = (S.log && S.log[k]) || [], bl = (S.blocks && S.blocks[k]) || [], rec = (S.bk && S.bk[k]) || {};
      var hadData = lg.length || (rec.pm && (rec.pm.reflect || rec.pm.mood != null));
      if (hadData) spanDays[k] = 1;
      // 1) recurring slip: a planned block whose matching same-domain log landed notably later
      bl.forEach(function (b) {
        if (!b.title) return; var t = (b.title || "").trim().toLowerCase(); if (!t) return;
        var ph = hm(b.time), bd = domainOf(b), match = null;
        lg.forEach(function (l) { if (domainOf(l) === bd && (l.title || "").trim().toLowerCase() === t) match = l; });
        if (match) { var s = slip[t] || (slip[t] = { dom: bd, plan: ph, deltas: [], days: {} }); s.deltas.push(hm(match.time) - ph); s.days[k] = 1; s.plan = ph; }
      });
      // 2) mood <-> domain: on days with a recorded mood, which domain got the most time
      if (rec.pm && rec.pm.mood != null) {
        moodN++; var dm = domByMood[rec.pm.mood] || (domByMood[rec.pm.mood] = {});
        lg.forEach(function (l) { var d = domainOf(l); if (d === "drift") return; dm[d] = (dm[d] || 0) + (l.mins || 0); });
      }
      // 3) what precedes good days: good = mood>=3 OR kept>=2; tally pre-noon domains on those days
      var kept = 0; bl.forEach(function (b) { if (b.title && blockStatus(k, b) === "ok") kept++; });
      var good = (rec.pm && rec.pm.mood != null && rec.pm.mood >= 3) || kept >= 2;
      if (good) { goodDayN++; var seen = {}; lg.forEach(function (l) { if (hm(l.time) < 720) { var d = domainOf(l); if (d !== "drift" && !seen[d]) { seen[d] = 1; goodDayDoms[d] = (goodDayDoms[d] || 0) + 1; } } }); }
    });
    var totalSpan = Object.keys(spanDays).length, GATE_N = 6, GATE_DAYS = 14;
    if (totalSpan >= GATE_DAYS) {
      Object.keys(slip).forEach(function (t) {
        var s = slip[t]; if (Object.keys(s.days).length < GATE_N) return;
        var avg = s.deltas.reduce(function (a, b) { return a + b; }, 0) / s.deltas.length; if (avg < 45) return;
        var late = s.deltas.filter(function (d) { return d >= 30; }); if (late.length < GATE_N) return;
        items.push({ id: "slip", conf: Math.min(0.95, late.length / Math.max(1, s.deltas.length)), n: late.length,
          line: "You keep planning “" + esc(t) + "” for " + fmt(s.plan) + ", but it tends to land about " + (Math.round(avg / 30) * 30) + " min later. Worth a look?" });
      });
      if (moodN >= GATE_N) {
        var bright = {}; [3, 4].forEach(function (mi) { var dm = domByMood[mi]; if (dm) Object.keys(dm).forEach(function (d) { bright[d] = (bright[d] || 0) + dm[d]; }); });
        var top = "", best = 0; Object.keys(bright).forEach(function (d) { if (bright[d] > best) { best = bright[d]; top = d; } });
        if (top && best >= 60) items.push({ id: "moodDom", conf: Math.min(0.85, moodN / 14), n: moodN, line: "Your brighter days tend to have more " + esc(lab(top)) + ". Maybe it's feeding you." });
      }
      if (goodDayN >= GATE_N) {
        var topG = "", bestG = 0; Object.keys(goodDayDoms).forEach(function (d) { if (goodDayDoms[d] > bestG) { bestG = goodDayDoms[d]; topG = d; } });
        if (topG && bestG >= GATE_N) items.push({ id: "goodDay", conf: Math.min(0.9, bestG / Math.max(1, goodDayN)), n: bestG, line: "Your best days almost all start with a morning " + esc(lab(topG)) + ". Worth protecting tomorrow?" });
      }
    }
    items.sort(function (a, b) { return (b.conf || 0) - (a.conf || 0); });
    cache.computedK = todayK(); cache.items = items; save();
    return items;
  }
  function pickPattern() { var it = journalPatterns(); return it && it.length ? it[0] : null; } // the single most-confident truth, or null (stay silent)
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
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Breathe", mins: 2, catK: "energy", color: "#6a5cf0", habitId: "breathe" }); doneMap(todayK())["breathe"] = true; earn(6, { catK: "energy" }); tickTool("breathe"); save(); renderAll(); }
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
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Mindful moment", mins: 2, catK: "energy", color: "#9a5cf0" }); earn(5, { catK: "energy" }); tickTool("relax"); save(); renderAll(); }
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
      function finish(skip) { if (done) return; done = true; TTS.stop(); if (cueT) clearInterval(cueT); if (tickT) clearInterval(tickT); if (sT) clearTimeout(sT); if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.6); osc.stop(actx.currentTime + 0.75); } catch (e) {} } if (skip) { if (ov.parentNode) ov.remove(); return; } lab.textContent = "Done ✓"; sub.textContent = "well done"; orb.style.animation = ""; orb.style.transition = "transform 1.4s ease"; orb.style.transform = "scale(.7)"; setTimeout(function () { if (ov.parentNode) ov.remove(); var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Meditation · " + GUIDES[cfg.guide].who, mins: cfg.mins, catK: "love", color: "#9a5cf0" }); earn(Math.max(6, cfg.mins * 2), { catK: "love" }); tickTool("meditate"); save(); renderAll(); }, 1700); }
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
        setTimeout(function () { if (ov.parentNode) ov.remove(); var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Tapping (EFT)", mins: 3, catK: "love", color: "#ff7ab8" }); earn(7, { catK: "love" }); tickTool("tapping"); save(); renderAll(); }, 1500);
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
      if (!skip) { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Mantra", mins: 3, catK: "love", color: "#ff7ab8" }); earn(7, { catK: "love" }); tickTool("mantra"); save(); renderAll(); }
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
  // SWIPE-SELECT (David 2026-06-28): tightly-packed small bubbles have overlapping tap-targets that collide. A long-press that STARTS on a small bubble whose neighbours are also small enters pick-mode: dragging the finger up/down across the cluster highlights one bubble at a time (.swfocus → it grows + its icon enlarges); release opens the focused one. It does NOT fight the regression-contract vertical scroll: it only arms after a still 240ms hold (any move before that = let native scroll happen), and it only arms when the bubble is part of a SMALL-bubble cluster (≥2 adjacent small bubbles). Returns true if it took over the gesture.
  function swipeSelectStart(ev, card, openFn) {
    if (ev.pointerType !== "touch") return false;
    if (!(card.classList.contains("lbl-i") || card.classList.contains("lbl-s"))) return false;
    var cal = card.closest(".cal"); if (!cal) return false;
    // collect THIS column's small bubbles (same lane side) sorted by Y — the cluster is small bubbles whose visual boxes nearly touch
    var smalls = [], all = cal.querySelectorAll(".calblk.lbl-i, .calblk.lbl-s");
    for (var i = 0; i < all.length; i++) { var c = all[i]; if (!c._swOpen) continue; smalls.push(c); }
    smalls.sort(function (a, b) { return (parseFloat(a.style.top) || 0) - (parseFloat(b.style.top) || 0); });
    if (smalls.length < 2) return false;
    // require at least one OTHER small bubble adjacent (within 26px) to THIS one → it's a genuine cluster, not a lone small bubble
    var ct = (parseFloat(card.style.top) || 0) + (parseFloat(card.style.height) || 4) / 2, hasNeighbour = false;
    for (var j = 0; j < smalls.length; j++) { if (smalls[j] === card) continue; var oc = (parseFloat(smalls[j].style.top) || 0) + (parseFloat(smalls[j].style.height) || 4) / 2; if (Math.abs(oc - ct) < 26) { hasNeighbour = true; break; } }
    if (!hasNeighbour) return false;
    var calRect = cal.getBoundingClientRect(), sy = ev.clientY, sx = ev.clientX, armed = false, focus = null, holdT = null, moved = false;
    function pickAt(clientY) { var y = clientY - calRect.top, best = null, bestD = 1e9; for (var m = 0; m < smalls.length; m++) { var s = smalls[m], st = parseFloat(s.style.top) || 0, h = parseFloat(s.style.height) || 4, cen = st + h / 2; var d = (y < st - 9) ? (st - y) : (y > st + h + 9) ? (y - (st + h)) : 0; if (d < bestD) { bestD = d; best = s; } } if (bestD > 80) return; if (best !== focus) { if (focus) focus.classList.remove("swfocus"); focus = best; if (focus) { focus.classList.add("swfocus"); try { if (navigator.vibrate) navigator.vibrate(6); } catch (e) {} } } }
    function arm() { holdT = null; armed = true; if (card._dragBlock) {} card._swBlock = function (e) { e.preventDefault(); }; document.addEventListener("touchmove", card._swBlock, { passive: false }); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} pickAt(sy); }
    function mv(e) { if (!armed) { if (Math.abs(e.clientY - sy) > 9 || Math.abs(e.clientX - sx) > 9) { if (holdT) { clearTimeout(holdT); holdT = null; } cleanup(false); } return; } e.preventDefault(); moved = true; pickAt(e.clientY); }
    function cleanup(removeFocus) { if (holdT) { clearTimeout(holdT); holdT = null; } if (card._swBlock) { document.removeEventListener("touchmove", card._swBlock, { passive: false }); card._swBlock = null; } document.removeEventListener("pointermove", mv, { passive: false }); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", cancel); if (removeFocus && focus) focus.classList.remove("swfocus"); }
    function up(e) { var f = focus, wasArmed = armed; cleanup(false); if (wasArmed) { setTimeout(function () { if (f) f.classList.remove("swfocus"); }, 90); if (f && f._swOpen) f._swOpen(); } else { var dy = e ? Math.abs(e.clientY - sy) : 0, dx = e ? Math.abs(e.clientX - sx) : 0; if (dy < 9 && dx < 9 && card._swOpen) card._swOpen(); } } // armed → open the focused bubble · a plain still tap (released before the 240ms arm) → open THIS bubble, preserving normal tap-to-open on a small bubble (David 2026-06-28)
    function cancel() { cleanup(true); }
    holdT = setTimeout(arm, 240);
    document.addEventListener("pointermove", mv, { passive: false }); document.addEventListener("pointerup", up); document.addEventListener("pointercancel", cancel);
    return true;
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
      if (mm === endH * 60) continue; // BOUNDARY HOUR (David 2026-06-28): the bottom tick == startH (e.g. 28:00 == 4am) repeats the SAME hour the NEXT stacked day-section draws at its top → drawing it here printed "4am" twice + doubled the hour-line. Skip it; tiling stays seamless because the next day-section provides that row. (also fixes the reported 2–4am background break.)
      if (_mn === 0) { var _ln = add(cal, "div", "calhour"); _ln.style.top = _t + "px"; _ln.dataset.mn = mm; var _hl = add(cal, "div", "calhrl", "" + ((_hh % 12) || 12)); _hl.style.top = (_t - 8) + "px"; _hl.dataset.mn = mm; _hl.dataset.off = -8; }
      else if (_mn === 30) { if (_NUMHALF) { var _s2 = add(cal, "div", "calsub", ((_hh % 12) || 12) + ":30"); _s2.style.top = (_t - 7) + "px"; _s2.dataset.mn = mm; _s2.dataset.off = -7; } else if (_SHOWHALF) { var _l2 = add(cal, "div", "calhalf"); _l2.style.top = _t + "px"; _l2.dataset.mn = mm; } } // a bare DASH until zoomed in, then it becomes a number (no dash) — never both
      else { if (_NUMQTR) { var _s3 = add(cal, "div", "calsub", ":" + pad(_mn)); _s3.style.top = (_t - 7) + "px"; _s3.dataset.mn = mm; _s3.dataset.off = -7; } else if (_SHOWQTR) { var _l3 = add(cal, "div", "calhalf"); _l3.style.top = _t + "px"; _l3.dataset.mn = mm; } }
    }
    if (showNow && now >= startH * 60 && now <= endH * 60) { var _ny = ((now - startH * 60) / 60 * HP); var _nrun = activeTimers(), _lv = _nrun[_nrun.length - 1], _lD = _lv ? (DOM[domainOf(_lv)] || DOM.focus) : null, _lc = _lD ? _lD.c : "#ff5fa8"; var nl = add(cal, "div", "nowline"); nl.style.top = _ny + "px"; nl.style.borderTopColor = "#ff5fa8"; nl.style.boxShadow = "0 0 13px #ff5fa8"; nl.dataset.mn = now; nowLineEl = nl; nowRightBand = [_ny - 6, _ny + 30]; /* now-line stays the brightest thing on the timeline (David 2026-06-27) */ var nc = add(cal, "div", "nowcirc"); nc.style.top = (_ny - 8) + "px"; nc.style.background = _lc; nc.style.color = _lD ? _lD.ink : "#4a1126"; nc.dataset.mn = now; nc.dataset.off = -8; nc.innerHTML = _lv ? tiIcon(_lv) : '<i class="ti ti-clock"></i>'; if (_lv) { var _ls = toWin(new Date(_lv.start).getHours() * 60 + new Date(_lv.start).getMinutes()); if ((logicalNowMin() - _ls) / 60 * HP < 22) { var nr = add(cal, "div", "nowread"); nr.style.top = (_ny + 7) + "px"; nr.style.color = _lc; nr.dataset.mn = now; nr.dataset.off = 7; nr.innerHTML = tiIcon(_lv) + ' <span class="cn-t">' + esc(_lv.title || "Tracking") + '</span> · <span class="live-elapsed" data-tid="' + _lv.id + '">' + elapsedStr(_lv) + '</span>'; } } else { var np = add(cal, "div", "nowtime"); np.style.top = (_ny + 5) + "px"; np.dataset.mn = now; np.dataset.off = 5; np.style.left = "auto"; np.style.right = "6px"; np.innerHTML = '<b style="letter-spacing:.5px">NOW</b> ' + fmt(now); } } // now-line + icon circle (no label under it) + a right-side readout: current activity in its colour + elapsed (David 2026-06-25)
    // temporal anchors so you're never lost in time: midnight · wake · noon · bed (David 2026-06-24)
    function hrToMin(s, pm) { if (!s) return null; var m = ("" + s).match(/\d+/); if (!m) return null; var n = +m[0]; if (pm && n < 12) n += 12; if (n >= 24) n -= 24; return n * 60; }
    var _nowBand = Math.max(12, 26 / Math.max(20, HP) * 60); // minutes within which the NOW marker visually overlaps a temporal anchor (≈26px tall now-circle/label) — David 2026-06-28
    [["midnight", 0, "ti-clock-hour-12", "#5f8dd6"], ["wake", hrToMin(S.profile && S.profile.wake, false), "ti-sun-high", "#ffae6a"], ["noon", 720, "ti-sun-high", "#ffd24a"], ["bed", hrToMin(S.profile && S.profile.sleep, true), "ti-moon", "#9a8cff"], ["midnight", 1440, "ti-clock-hour-12", "#5f8dd6"]].forEach(function (tm) {
      if (tm[1] == null || tm[1] < startH * 60 || tm[1] > endH * 60) return;
      var _isMid = tm[0] === "midnight";
      // Z-STACKING + NO-OVERLAP (David 2026-06-28): when NOW sits right on the midnight marker, HIDE midnight entirely so the two never cover each other — the now-line (brighter, higher z) wins and draws ON TOP.
      if (_isMid && showNow && Math.abs(tm[1] - now) < _nowBand) return;
      var ml = add(cal, "div", "timemark"); ml.style.top = ((tm[1] - startH * 60) / 60 * HP) + "px"; ml.dataset.mn = tm[1]; ml.style.borderTopColor = tm[3] + "55";
      var lb = add(ml, "span", "timemark-lab"); lb.style.color = tm[3]; lb.innerHTML = '<i class="ti ' + tm[2] + '"></i> ' + tm[0];
      if (_isMid) { lb.style.left = "auto"; lb.style.right = "0"; } // midnight label on the RIGHT side so it can't sit under a left-aligned plan bubble (David 2026-06-28)
    });
    function place(card, mins, durv, lane) { card.style.top = ((mins - startH * 60) / 60 * HP) + "px"; card.style.height = barH(durv, HP) + "px"; card.dataset.mn = mins; card.dataset.dur = durv; if (lane === "P") { card.style.left = "26px"; card.style.right = "calc(50% + 4px)"; } else { card.style.left = "calc(50% + 4px)"; card.style.right = "4px"; } } // bars are their TRUE time-height (low floor) so back-to-back bubbles can't overlap; the label then adapts to the height (David 2026-06-25)
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
      if (partial) { var _pre = _pm.start - bs, _post = be - _pm.end, _uS, _uE; if (_post >= _pre) { _uS = _pm.end; _uE = be; } else { _uS = bs; _uE = _pm.start; } card.style.top = topFor(_uS) + "px"; card.style.height = barH(_uE - _uS, HP) + "px"; card.dataset.mn = _uS; card.dataset.dur = (_uE - _uS); } // the UNFULFILLED remainder breaks off into its OWN ghost bubble (the matched part is its own shining bubble) — David 2026-06-25
      card.dataset.ic = tiClass(b); card.dataset.c = D.c; card.dataset.ink = D.ink; // carried so the LIVE pinch reflow can rebuild this bar's rail icon without recomputing its domain (David 2026-06-26)
      degrade(card); if (card.classList.contains("lbl-i") || card.classList.contains("lbl-s")) { card._swOpen = (function (bb) { return function () { editBlk(bb); }; })(b); } // small bubble → carries its open-fn so the swipe-select cluster gesture can open it (David 2026-06-28)
      if (status === "ok" && !partial) { // DONE = deep-jewel diagonal STRIPES (the old metallic look, darkened for night) + ink edge — NO neon glow, NO shine; the now-line stays the brightest thing (David 2026-06-27)
        card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 3px 0 #160510";
      } else if (dark) { // missed/ghost — domain-tinted-dark hollow + a clear domain OUTLINE (kept — David likes this close up)
        card.style.background = mixHex(D.c, "#160510", 0.86); card.style.borderColor = mixHex(D.c, "#160510", 0.32); card.style.boxShadow = "none";
      } else { // future = planned: DIMMER deep stripes, fainter the further ahead, ink edge (David 2026-06-27)
        card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.74) + "," + mixHex(D.c, "#160510", 0.74) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "0 2px 0 #160510";
        var _ahead = (bs - now) / 60; card.style.opacity = String(showNow ? Math.max(0.6, 0.95 - Math.max(0, _ahead) * 0.05) : 0.82);
      }
      if (_straddle) { // STRADDLING NOW (David 2026-06-27): the GHOST half (not done) is a standalone fully-rounded bubble; the TRACKED half is CONTINUOUS with the future (no gap at the now-line — the line just shows printing + the battery: bright charged-past, dim future).
        var _trk = _liveT && domainOf(_liveT) === dom, _tsd = _trk ? new Date(_liveT.start) : null, _tsm = _trk ? Math.max(bs, Math.min(now, toWin(_tsd.getHours() * 60 + _tsd.getMinutes()))) : now; // _tsm = when tracking started, in the SAME 4am-window units as bs/now (David 2026-06-28: was raw wall-clock minutes — across midnight that collapsed the ghost to bs, so pressing start wrongly filled the un-done PAST half solid. toWin keeps the pre-start past GHOSTED and lets only the now→ leading edge print, matching "matched grows into the past".) (= now if not tracking → whole past half is ghost)
        var _matte = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.74) + "," + mixHex(D.c, "#160510", 0.74) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 9px," + mixHex(D.c, "#160510", 0.82) + " 18px)", _R = "13px";
        card.classList.add("convbar"); card.style.filter = "none"; card.style.opacity = "1";
        if (_trk) { // TRACKING → the GHOST separates from the active bubble (this is when it breaks off and gets its rounded bottom) — David 2026-06-27
          if (_tsm > bs + 0.5) { card.style.height = barH(_tsm - bs, HP) + "px"; card.dataset.mn = bs; card.dataset.dur = (_tsm - bs); card.style.background = mixHex(D.c, "#160510", 0.86); card.style.borderColor = mixHex(D.c, "#160510", 0.32); card.style.borderRadius = _R; card.style.boxShadow = "0 3px 0 #160510"; } // GHOST = untracked past (bs → _tsm) = the CARD, now a standalone FULLY-rounded narrow plan-lane bubble (keeps the plan name)
          else { card.style.height = "0px"; card.style.border = "none"; card.style.background = "none"; card.style.boxShadow = "none"; } // started exactly at the block top → no ghost head
          var _hasTrk = now > _tsm + 0.5;
          if (_hasTrk) { var _segH = (now - _tsm) / 60 * HP, _seg = add(cal, "div", "matchseg"); _seg.style.top = topFor(_tsm) + "px"; _seg.style.height = _segH + "px"; _seg.style.left = "26px"; _seg.style.right = "4px"; _seg.dataset.mn = _tsm; _seg.dataset.dur = (now - _tsm); _seg.style.borderRadius = _R + " " + _R + " 0 0"; _seg.style.borderBottom = "none"; _seg.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; _seg.style.borderColor = "#160510"; _seg.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09)"; if (_segH >= 15) { var _ssc = add(_seg, "div", "mscn"); _ssc.style.color = D.light; _ssc.innerHTML = tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span> <i class="ti ti-circle-check"></i>'; } else if (_segH >= 7) { var _se = add(_seg, "div", "msemoji"); _se.innerHTML = tiIcon(b); _se.style.cssText = "position:absolute;right:7px;top:50%;transform:translateY(-50%);font-size:11px;line-height:1;color:#fff2f9;"; } } // (2a) TRACKED stretch = bright activity-colour, rounded TOP, SQUARE bottom (flows into the future — no gap); thin sliver → emoji only, no pink
          if (!_hasTrk) { var _fw = add(cal, "div", "futwide"); _fw.style.cssText = "position:absolute;left:26px;right:4px;box-sizing:border-box;z-index:1;pointer-events:none;border:2px solid " + mixHex(D.c, "#160510", 0.46) + ";opacity:.5;"; _fw.style.top = topFor(now) + "px"; _fw.style.height = barH(be - now, HP) + "px"; _fw.style.background = "transparent"; _fw.style.borderRadius = _R; _fw.dataset.mn = now; _fw.dataset.dur = (be - now); } // (2b) Once the charge has STARTED (_hasTrk), render NOTHING below the now-line — the now-line is the live leading edge, no bubble peeks past it. Only before tracking begins is the planned-ahead block hinted as a faint hollow outline. (David 2026-06-27)
        } else { // NOT tracking → ONE continuous bar in the plan lane: ghost-dark top + matte future-bottom, split ONLY by the now-line crossing it. It was correct this way before — the bubble separates only on Play (David 2026-06-27)
          card.style.background = "none"; card.style.borderColor = "#160510"; card.style.boxShadow = "0 3px 0 #160510"; var _ch = Math.max(5, (be - bs) / 60 * HP - 4);
          var _cg = add(card, "div", "convghost"); _cg.style.height = ((now - bs) / 60 * HP / _ch * 100) + "%"; _cg.style.background = mixHex(D.c, "#160510", 0.86); _cg.style.boxShadow = "inset 0 0 0 2px " + mixHex(D.c, "#160510", 0.32);
          var _fut = add(card, "div", "convfut"); _fut.style.top = ((now - bs) / 60 * HP / _ch * 100) + "%"; _fut.style.background = _matte;
        }
        _convFused = true;
      }
      if (partial) { // overlay the MATCHED span — a full-width shining segment over both lanes; the rest of the block stays ghost (left) with the drift in the right lane = the split
        var _mh = barH(_pm.end - _pm.start, HP); // same floor/margin/clamp → no bounce
        var seg = add(cal, "div", "matchseg"); seg.style.top = topFor(_pm.start) + "px"; seg.style.height = _mh + "px"; seg.style.left = "26px"; seg.style.right = "4px";
        seg.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; seg.style.borderColor = "#160510"; seg.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 2px 0 #160510";
        seg.dataset.mn = _pm.start; seg.dataset.dur = (_pm.end - _pm.start);
        var _sc = add(seg, "div", "mscn"); _sc.style.color = D.light; _sc.innerHTML = (_mh >= 15 ? (tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span> ') : '') + '<i class="ti ti-circle-check"></i>'; // matched span: icon + name + ✓ (no shine — David disliked the internal reflections)
      }
      var ink = D.light; // ALL bubbles are now dark-hollow → bright domain-light text everywhere (legible + cool, per David's ghost-look preference, 2026-06-27)
      var cn = add(card, "div", "cn"); cn.style.color = ink; if (_straddle) cn.style.fontWeight = "800";
      var _sn = (b.subs || []).length, _dc = (b.subs || []).filter(function (s) { return s.done; }).length;
      cn.innerHTML = !b.title ? '<i class="ti ti-hand-finger"></i> tap to choose' : ((b.pin ? '<i class="ti ti-pin"></i> ' : "") + tiIcon(b) + ' <span class="cn-t">' + esc(b.title) + '</span>' + (_sn ? ' <span class="step-n">' + _dc + '/' + _sn + '</span>' : "") + (status === "ok" && !partial ? ' <i class="ti ti-sparkles" style="color:' + D.c + '"></i>' : "") + amVirtueGlyph(b)); /* AM FLOW-DOWN (c): dim today's-virtue glyph — PURE additive concat, no geometry */
      if (status === "miss") { var ms = add(card, "div", "csub", b.plannedAhead ? "want to Replan it?" : "want to log it?"); ms.style.color = "rgba(255,240,249,.45)"; } // Blizzard-invert (SCHEMA 3): no "missed" label — forward-only framing per Design Principles Law 7
      // ARMED AT PRESENT (David 2026-06-27): a FUTURE plan slid UP until its start bumps the now-line → a round Play affordance appears ON the bubble. Tap = startPlanned(b): tracking begins charging from now, so it "prints in both lanes" (plan stays left, the tracked half flows down the right via the existing straddle/matched render). Shows only when the block sits at/just-after now, is still a plan (not done/matched), isn't the live straddling block, and nothing of its own domain is already tracking. Render-driven (not a transient flag) so it survives the full-DOM rebuild a drop triggers. (regression contract #2: bs >= now means it never crossed into the past)
      var _nowFloor = Math.ceil(now / 15) * 15, _trkDom = !!(_liveT && domainOf(_liveT) === dom);
      var _armed = showNow && k === todayK() && b.title && status === "plan" && !partial && !_straddle && !_trkDom && bs >= now && bs <= _nowFloor + 1;
      if (_armed) { var pbtn = add(card, "div", "calplay"); pbtn.innerHTML = '<i class="ti ti-player-play-filled"></i>'; pbtn.style.setProperty("background", D.c, "important"); pbtn.style.setProperty("color", D.ink, "important"); pbtn.setAttribute("aria-label", "Start now");
        pbtn.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); }); // don't let the bubble's drag/tap handler swallow the play press
        pbtn.addEventListener("click", function (ev) { ev.stopPropagation(); startPlanned(b); try { if (navigator.vibrate) navigator.vibrate([8, 24, 8]); } catch (e) {} }); }
      var pc = { b: b, card: card }; planCards.push(pc);
      var xb = add(card, "div", "calx"); xb.innerHTML = '<i class="ti ti-x"></i>';
      xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
      xb.addEventListener("click", function (ev) { ev.stopPropagation(); pushUndo(); var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); var p2 = planCards.indexOf(pc); if (p2 >= 0) planCards.splice(p2, 1); card.style.transform = "scale(.4)"; card.style.opacity = "0"; setTimeout(function () { card.remove(); reflow(k); save(); renderToday(); }, 150); });
      var grip = add(card, "div", "grip"), gripT = add(card, "div", "gript");
      card.addEventListener("pointerdown", function (ev) {
        if (ev.target === xb || ((ev.target === grip || ev.target === gripT) && card.dataset.gate === "full")) return; // a thin (gated) card's grip falls through to here → move/menu, not resize
        if (swipeSelectStart(ev, card, null)) return; // small bubble in a cluster → the swipe-select gesture owns this touch (arms on a still hold; any move before that releases it back to native scroll) — David 2026-06-28
        var touch = ev.pointerType === "touch", scE = (card.closest && card.closest(".day-cardscroll")) || el("pullBody"); if (!touch) ev.preventDefault(); // mouse drags immediately
        var sy0 = ev.clientY, sx0 = ev.clientX, lastY = ev.clientY, sm0 = hm(b.time), moved = false, picked = !touch && card.dataset.gate !== "menu", scrolling = false, holdT = null, ct0 = card.querySelector(".ct"), dragMin = sm0, snapped = false, _bumpedNow = false;
        var _bpast = blockPast(k, b), _freeDrag = _bpast && showNow, _calEl = card.closest(".cal"); function overReal(cx) { if (!_calEl) return false; var r = _calEl.getBoundingClientRect(); return cx > r.left + r.width * 0.5; } // past + two lanes → the bubble can cross into the real (right) lane
        var _bs = sm0, _be = sm0 + (b.mins || 30), _onNow = showNow && k === todayK() && _bs < now && _be > now, _isPast = showNow && k === todayK() && _be <= now; // straddling-NOW = the live block (stays put); fully-past = reorderable like the future (David 2026-06-26: completed blocks must move up/down again)
        var _started = _onNow, _floor = (showNow && k === todayK() && !_isPast) ? Math.min(sm0, Math.ceil(now / 15) * 15) : 0, _ceil = _isPast ? Math.floor(now / 15) * 15 : 1740; // ONLY the live straddling block is frozen now; future blocks keep the now-line floor; a past block can reorder freely but stops at NOW (ceiling) so it can't slide into the future. (David 2026-06-28: floor must never exceed the block's OWN start — a block sitting in the gap between now and the next quarter-hour [start < ceil(now/15)] was getting pinned UP to that quarter line and couldn't be dragged DOWN/later. min(sm0,…) lets it always move later while the now-line still blocks it from crossing UP into the past.)
        if (touch) holdT = setTimeout(function () { if (scrolling || card.dataset.gate === "menu" || _started || _pinching) return; picked = true; holdT = null; card.classList.add("lift"); card.classList.add("dragging"); card._dragBlock = function (ev) { ev.preventDefault(); }; document.addEventListener("touchmove", card._dragBlock, { passive: false }); try { if (navigator.vibrate) navigator.vibrate(9); } catch (e) {} }, _bpast ? 460 : 280); // long-press → DRAG mode: block native scroll so the vertical drag moves the block instead of scrolling it (David 2026-06-27)
        function clean() { if (holdT) { clearTimeout(holdT); holdT = null; } if (card._dragBlock) { document.removeEventListener("touchmove", card._dragBlock, { passive: false }); card._dragBlock = null; } document.removeEventListener("pointermove", mv2); document.removeEventListener("pointerup", up2); document.removeEventListener("pointercancel", cancel); card.classList.remove("lift"); card.classList.remove("dragging"); hideTrash(); }
        function mv2(e) {
          if (_pinching) { if (holdT) { clearTimeout(holdT); holdT = null; } moved = false; picked = false; card.classList.remove("lift", "dragging"); card.style.transform = ""; card.style.zIndex = ""; hideTrash(); return; } // a second finger = pinch: abandon any bubble drag/scroll and let the zoom own it (the resize loop repositions the bubble) — David 2026-06-26
          if (touch && !picked) { if (Math.abs(e.clientY - sy0) > 8 || Math.abs(e.clientX - sx0) > 8) { if (holdT) { clearTimeout(holdT); holdT = null; } } return; } // ANY finger move = native scroll (vertical, buttery) or a page-swipe (pb owns horizontal) → drop the pick-up hold. Only a STILL long-press becomes a drag. (David 2026-06-27)
          if (card.dataset.gate === "menu" || _started) return; // too tiny to move, OR already begun (static — can't reorder past the present) — only its tap-menu acts
          var dy = e.clientY - sy0, dx = e.clientX - sx0; if (!moved && (Math.abs(dy) > 3 || Math.abs(dx) > 3)) { moved = true; if (!snapped) { snapped = true; pushUndo(); } card.classList.add("lift"); card.classList.add("dragging"); } if (moved) { e.preventDefault(); showTrash(); overTrash(e.clientX, e.clientY); dragMin = Math.max(_floor, Math.min(_ceil, sm0 + Math.round((dy / HP * 60) / 15) * 15)); card.style.top = topFor(dragMin) + "px"; if (ct0) ct0.textContent = fmt(dragMin) + "–" + fmt(dragMin + (b.mins || 30)); if (_freeDrag) { card.style.transform = "translateX(" + dx + "px) scale(1.04)"; card.style.zIndex = "30"; card.classList.toggle("over-real", dx > 45); card.classList.toggle("over-plan", !!b.done && dx < -45); } else preview(card, dragMin, dragMin + (b.mins || 30));
            if (!_freeDrag && !_isPast && sm0 > _floor) { var _atNow = dragMin <= _floor; if (_atNow && !_bumpedNow) { _bumpedNow = true; card.classList.add("armed-now"); try { if (navigator.vibrate) navigator.vibrate(14); } catch (e3) {} } else if (!_atNow && _bumpedNow) { _bumpedNow = false; card.classList.remove("armed-now"); } } } // BUMP THE PRESENT (David 2026-06-27): a future block dragged up until its start hits the now-floor (it can't cross into the past — _floor IS the clamp) snaps against the now-line; one tactile bump + .armed-now glow signals "ready — release, then tap Play". Re-render after drop draws the round Play button. (regression contract #2 intact: _floor = ceil(now/15), so the start can never go past now)
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
      else { cardH = barH(it.e - it.s, HP); card.style.top = topFor(it.s) + "px"; card.style.height = cardH + "px"; card.dataset.mn = it.s; liveBottom = Math.max(liveBottom, topFor(it.s) + cardH); } // barH floor/margin/clamp → matches the live-zoom relayout exactly (no bounce) (David 2026-06-27)
      card.style.left = "calc(50% + 4px)"; card.style.right = "4px"; card.style.width = "auto"; // one activity at a time — real lane is always full width, never split into multitasking columns (David 2026-06-23)
      if (it.kind === "log") {
        var e = it.ref, dom = domainOf(e), D = DOM[dom], drift = (dom === "drift"), onp = !drift && onPlanMatch(it, dom);
        card.style.background = drift ? mixHex(D.c, "#160510", 0.5) : onp ? ("repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)") : mixHex(D.c, "#160510", 0.84); card.style.borderColor = onp ? "#160510" : mixHex(D.c, "#160510", 0.34); card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.08),0 3px 0 #160510,0 5px 12px rgba(0,0,0,.4)"; // matched real = deep stripes · drift = dark mauve · no neon/shine (David 2026-06-27)
        if (onp) card.classList.add("onplan"); else if (drift) card.classList.add("drift");
        var cn = add(card, "div", "cn"); cn.style.color = D.light; cn.innerHTML = tiIcon(e) + ' <span class="cn-t">' + esc(e.title) + '</span>' + (onp ? ' <i class="ti ti-sparkles" style="color:' + D.c + '"></i>' : "");
        card.dataset.dur = it.e - it.s; card.dataset.ic = tiClass(e); card.dataset.c = D.c; card.dataset.ink = D.ink; degrade(card);
        if (card.classList.contains("lbl-i") || card.classList.contains("lbl-s")) { card._swOpen = (function (ee) { return function () { logEdit(ee, k); }; })(e); } // small bubble → carries its open-fn for the swipe-select cluster gesture (David 2026-06-28)
        if (drift) { var dl = add(card, "div", "csub", "drifted"); dl.style.color = D.ink; }
        var xb = add(card, "div", "calx"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); }); xb.addEventListener("click", function (ev) { ev.stopPropagation(); pushUndo(); var a = logs(k), i = a.indexOf(e); if (i >= 0) a.splice(i, 1); save(); renderToday(); });
        function gapAdj() { var bk = Array.prototype.slice.call(cal.querySelectorAll(".backfill")); var oT = parseFloat(card.style.top) || 0, oB = oT + (parseFloat(card.style.height) || 0), above = null, below = null; bk.forEach(function (sl) { var t = parseFloat(sl.style.top) || 0, h = parseFloat(sl.style.height) || 0, b = t + h; if (b <= oT + 10 && (!above || b > above.b)) above = { el: sl, top: t, b: b }; if (t >= oB - 10 && (!below || t < below.t)) below = { el: sl, bottom: t + h, t: t }; }); return function (nT, nB) { if (above) above.el.style.height = Math.max(0, nT - above.top - 4) + "px"; if (below) { below.el.style.top = nB + "px"; below.el.style.height = Math.max(0, below.bottom - nB - 4) + "px"; } }; } // the empty "+" backfill gaps above/below this real item follow it live while you drag/resize (David 2026-06-25)
        var lg = add(card, "div", "grip"); lg.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) { pushUndo(); card.classList.add("dragging"); var sy = startY, sm = e.mins || 15, cs = card.querySelector(".csub"), ga = gapAdj(); function mv(e2) { var v = Math.max(5, Math.round((sm + (e2.clientY - sy) / HP * 60) / 5) * 5); e.mins = v; var hpx = Math.max(24, v / 60 * HP - 3); card.style.height = hpx + "px"; if (cs) cs.textContent = fmt(it.s) + "–" + fmt(it.s + v); ga(parseFloat(card.style.top) || 0, (parseFloat(card.style.top) || 0) + hpx); } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflowLogs(k); save(); renderToday(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }, function () { logEdit(e, k); }); }); // .dragging suppresses the height transition so the drag tracks the finger instantly; reflowLogs reorders overlapped real items (David 2026-06-25)
        var lgT = add(card, "div", "gript"); lgT.addEventListener("pointerdown", function (ev) { gripHold(ev, card, function (startY) { pushUndo(); card.classList.add("dragging"); var sy = startY, endM = it.e, cs = card.querySelector(".csub"), ga = gapAdj(); function mv(e2) { var ns = Math.max(0, Math.min(endM - 5, it.s + Math.round(((e2.clientY - sy) / HP * 60) / 5) * 5)); var nm = endM - ns; e.time = pad(Math.floor(ns / 60)) + ":" + pad(ns % 60); e.mins = nm; var tpx = topFor(ns); card.style.top = tpx + "px"; card.style.height = Math.max(24, nm / 60 * HP - 3) + "px"; if (cs) cs.textContent = fmt(ns) + "–" + fmt(endM); ga(tpx, topFor(endM)); } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflowLogs(k); save(); renderToday(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); }, function () { logEdit(e, k); }); }); // drag the top edge → move the START earlier/later (end fixed); reflowLogs reorders overlapped real items (David 2026-06-24)
        card.addEventListener("pointerdown", function (ev) { // hold to rearrange a past activity · drag = scroll · tap = re-label/menu (David 2026-06-24)
          if (ev.target === xb || ((ev.target === lg || ev.target === lgT) && card.dataset.gate === "full")) return;
          if (swipeSelectStart(ev, card, null)) return; // small real bubble in a cluster → swipe-select owns the touch (David 2026-06-28)
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
          var gw = g[1] - g[0], rect = cal.getBoundingClientRect(), gs = hm(timeFromY(e.clientY - rect.top, startH, HP));
          gs = Math.max(g[0], Math.min(g[1] - 5, gs)); var gm = Math.min(20, gw); gm = Math.min(gm, g[1] - gs); // STUB, not the whole gap: seed ~20 min at the tapped time, then grow it with the grips/stepper (David 2026-06-27)
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
      function makeBlock() { var snap = Math.max(0, Math.min(1410, Math.round(downM / 5) * 5)); var id = uid(); blocks(k).push({ id: id, time: pad(Math.floor(snap / 60)) + ":" + pad(snap % 60), mins: 60, title: "", prio: 2, color: "#8a5cf0", done: false }); reflow(k); save(); renderToday(); bentoPicker({ title: "What's the plan?", onPick: function (x) { var nb = blocks(k).filter(function (b) { return b.id === id; })[0]; if (!nb) return; nb.title = x.title; nb.color = x.color || (DOM[x.domain] || DOM.focus).c; nb.catK = x.catK || null; nb.domain = x.domain || domainOf(x); reflow(k); save(); renderToday(); }, onCancel: function () { var a = blocks(k), i = a.map(function (b) { return b.id; }).indexOf(id); if (i >= 0) { a.splice(i, 1); reflow(k); save(); renderToday(); } } }); } // tap an empty slot → a 30-min bubble lands AT the tapped time, then the bento opens immediately (single-tap to pick) and the activity appears in place; tap the placed bubble AGAIN to open the full editor. Dismiss the bento with no pick → the empty stub is removed (no litter). (David 2026-06-27 — was: created the stub then jumped straight into the full editor)
      function fireCreate() { if (rightTrack) bentoPicker({ title: "What are you doing?", multi: true, onPickMulti: function (sel) { var _t = startTrackerNow(); assignTimerMulti(_t, sel); maybeCelebrateTrack(_t); }, onPick: function (x) { var _t = startTrackerNow(); assignTimer(_t, x); maybeCelebrateTrack(_t); } }); else makeBlock(); }
      // ADD an activity = a deliberate LONG-PRESS now (a quick tap is reserved for DOUBLE-TAP-to-zoom) — David 2026-07-02
      holdT = setTimeout(function () { if (moved || _pinching) return; holdT = null; done = true; try { if (navigator.vibrate) navigator.vibrate(11); } catch (e) {} fireCreate(); }, 360);
      function mv(e) { if (!moved && (Math.abs(e.clientY - dy) > 6 || Math.abs(e.clientX - dx) > 6)) { moved = true; if (holdT) { clearTimeout(holdT); holdT = null; } } } // any slide = scrolling → cancel the create-hold; scroll stays smooth
      function up(e) {
        if (holdT) { clearTimeout(holdT); holdT = null; }
        document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up);
        if (done || moved) return; // created on the hold, or it was a scroll
        var now = Date.now(); if (now - t0 > 360) { _ttapT = 0; return; } // a long hold that didn't fire → ignore
        if (_ttapT && now - _ttapT < 320 && Math.abs(ev.clientX - _ttapX) < 44 && Math.abs(ev.clientY - _ttapY) < 44) { _ttapT = 0; if (pullZoom === "day") animateHourPx(pullHourPx < 110 ? 150 : 64, ev.clientY); } // DOUBLE-TAP → zoom in/out one-handed (replaces the two-finger pinch) — David 2026-07-02
        else { _ttapT = now; _ttapX = ev.clientX; _ttapY = ev.clientY; }
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
    // START TIME — nudge earlier/later in 5-min steps; start+end are always shown (David 2026-06-27)
    var _floorS = 0, _ceilS = 1740;
    add(B, "div", "ed-hint", "starts at — tap −/＋ to nudge");
    var trow = add(B, "div", "ed-trow");
    var tdn = add(trow, "button", "ed-tnudge"); tdn.innerHTML = '<i class="ti ti-minus"></i>';
    var tlbl = add(trow, "div", "ed-tlbl");
    var tup = add(trow, "button", "ed-tnudge"); tup.innerHTML = '<i class="ti ti-plus"></i>';
    function setStart(ns) { ns = Math.max(_floorS, Math.min(_ceilS, Math.round(ns / 5) * 5)); o.time = pad(Math.floor(ns / 60)) + ":" + pad(ns % 60); }
    tdn.onclick = function () { setStart(hm(o.time) - 5); layout(); commit(); };
    tup.onclick = function () { setStart(hm(o.time) + 5); layout(); commit(); };
    add(B, "div", "ed-hint", "length — slide, step ＋, or tap a chip");
    var sld = document.createElement("input"); sld.type = "range"; sld.min = "0"; sld.max = "1000"; sld.step = "1"; sld.value = minToPos(o.mins || DEF); sld.className = "ed-slider"; B.appendChild(sld);
    var read = add(B, "div", "ed-read");
    function layout() { var bs = hm(o.time), dur = o.mins || DEF; tlbl.innerHTML = '<i class="ti ti-clock"></i> ' + fmt(bs); read.innerHTML = '<b>' + lenLbl(dur) + '</b> <span class="ed-dur">· ' + fmt(bs) + '–' + fmt(bs + dur) + '</span>'; sld.value = minToPos(dur); if (typeof crow !== "undefined" && crow) Array.prototype.forEach.call(crow.children, function (n, i) { n.classList.toggle("on", [15, 30, 45, 60, 90, 120][i] === dur); }); }
    layout();
    sld.addEventListener("input", function () { o.mins = posToMin(+sld.value); layout(); });
    sld.addEventListener("change", function () { o.mins = posToMin(+sld.value); commit(); });
    // The slider IS the duration control — the steppers + chips were redundant clutter (David 2026-07-02 "the time slider is enough").
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
      didit.onclick = function () { o.done = !o.done; didit.classList.toggle("on"); ddTxt(); if (o.done) { var _st = bumpStreak(); if (o.plannedAhead) { /* planned-then-done tier — block was planted before today */ celebrate(D().c, _st); try { earn(2, { label: "planned-then-done" }); } catch (e) {} toast("✦ You planned it. You showed up. That's the game."); } else { /* Tracking tier — done without pre-plan: quiet earn(8) + standard celebrate */ try { earn(8, { label: "tracking" }); } catch (e) {} celebrate(D().c, _st); } } else coolStreak(); commit(); };
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
    var multi = !!opts.multi, sel = [], by = bentoByDomain(), view = { cat: null, grp: null }, foot = null, searchQ = "";
    // DOM scope: when opts.domains is set (Big-3 staged flow), only show those domains' categories (David 2026-06-28)
    var ORDER = (opts.domains && opts.domains.length) ? DOM_ORDER.filter(function (d) { return opts.domains.indexOf(d) >= 0; }) : DOM_ORDER;
    // preselect: titles already picked (e.g. stepping Back into a beat) → seed sel from the matching activity objects so chips show as on (David 2026-06-28)
    if (multi && opts.preselect && opts.preselect.length) { var pset = {}; opts.preselect.forEach(function (t) { pset[(t || "").toLowerCase()] = 1; }); ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { if (pset[(a.title || "").toLowerCase()] && sel.indexOf(a) < 0) sel.push(a); }); }); }
    var fq = {}; try { frequent(16).forEach(function (m) { fq[(m.title || "").toLowerCase()] = 1; }); } catch (e) {}
    var ov = add(document.body, "div", "bento-ov bento-sheet");
    var card = add(ov, "div", "bento-card bento-sheet");
    var head = add(card, "div", "bento-head");
    if (opts.onBack) { var bb0 = add(head, "button", "bento-x"); bb0.innerHTML = '<i class="ti ti-chevron-left"></i>'; bb0.style.marginRight = "8px"; bb0.onclick = function () { close(); opts.onBack(); }; }
    add(head, "div", "bento-q", opts.title || "What are you doing?");
    var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>';
    var body = add(card, "div", "bento-body");
    function close() { ov.remove(); }
    xb.onclick = close;
    ov.addEventListener("click", function (e) { if (e.target === ov) { close(); if (opts.onCancel) opts.onCancel(); } });
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } }
    function actChip(a, container, big, soft) {
      var D = DOM[a.domain], on = sel.indexOf(a) >= 0, pin = isPinned(a);
      var s = add(container, "span", "bchip" + (big ? " big" : "") + (soft ? " soft" : "") + (on ? " sel" : "") + (a.domain === "drift" ? " vice" : "") + (pin ? " pinned" : ""));
      // SOFT = welcoming muted tile (colored ICON accent + light text on a dark-tinted bg) — kills the "wall of solid orange" in a category list (David 2026-07-02). Solid fill stays for short varied rows (Recent/Pinned/search) and the selected state.
      var iconStyle = "";
      if (a.domain !== "drift") {
        if (soft && !on) { s.style.background = mixHex(D.c, "#1c0a17", 0.85); s.style.color = "#f7e9f1"; s.style.borderColor = "#34132a"; iconStyle = ' style="color:' + D.c + '"'; }
        else { s.style.background = D.c; s.style.color = D.ink; }
      }
      s.innerHTML = ((pin && !big) ? '<i class="ti ti-pin" style="opacity:.5;font-size:.85em"></i> ' : '') + '<i class="ti ' + tiClass(a) + '"' + iconStyle + '></i> ' + esc(a.title) + (on ? ' <i class="ti ti-check"></i>' : ''); // ✓ when picked, 📌 when pinned — no yellow (David 2026-06-24)
      var holdT = null, held = false; // press & hold any chip → pin / unpin it (tap-only, no keyboard) — David 2026-06-24
      s.addEventListener("pointerdown", function () { held = false; holdT = setTimeout(function () { held = true; holdT = null; togglePin(a); toast(isPinned(a) ? "📌 pinned to the top" : "unpinned"); render(); }, 450); });
      function cancelHold() { if (holdT) { clearTimeout(holdT); holdT = null; } }
      s.addEventListener("pointermove", cancelHold); s.addEventListener("pointerup", cancelHold); s.addEventListener("pointercancel", cancelHold);
      s.onclick = function (e) { e.stopPropagation(); if (held) { held = false; return; } commit(a); };
      return s;
    }
    function actOf(m) { var t = (m.title || "").toLowerCase(); for (var d = 0; d < DOM_ORDER.length; d++) { var arr = by[DOM_ORDER[d]] || []; for (var i = 0; i < arr.length; i++) if ((arr[i].title || "").toLowerCase() === t) return arr[i]; } var dm = m.domain || domainOf(m); return { title: m.title, catK: m.catK || null, habitId: m.habitId || null, domain: dm, color: (DOM[dm] || DOM.focus).c }; } // frequent()/search → a real activity obj with a domain so the chip colors right (David 2026-06-24)
    function renderScoped() {
      // BIG-3 staged reminder card (light, one line) — only on the overview, above search (David 2026-06-28)
      if (opts.headNode) body.appendChild(opts.headNode);
      // SEARCH (scrolls away with the content now) + PINNED row (your most-important — pin anything to bring it here & to the front) — David 2026-06-24
      var sb = add(body, "div", "bento-search"); add(sb, "span", "bento-sicon").innerHTML = '<i class="ti ti-search"></i>';
      var si = document.createElement("input"); si.type = "text"; si.className = "bento-sinput"; si.placeholder = "search activities…"; si.value = searchQ; sb.appendChild(si);
      var pinList = []; ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { if (isPinned(a)) pinList.push(a); }); }); // grouped by domain so the colours cluster
      var pinned = add(body, "div", "bento-pinned");
      if (pinList.length) { add(pinned, "span", "bento-qlbl", "★ Pinned"); pinList.forEach(function (a) { actChip(a, pinned, true).classList.add("fav"); }); }
      else { pinned.className = "bento-pinhint"; pinned.innerHTML = '<i class="ti ti-pin"></i> press &amp; hold any activity to pin your favourites up here'; }
      // "you've been meaning to…" — the inferred procrastination list, surfaced prominently right under the pins (David 2026-06-28). actOf() maps each to a real activity obj so chips colour by domain + toggle-select like any other.
      if (opts.priority && opts.priority.length) { var pr = add(body, "div", "bento-pinned"); add(pr, "span", "bento-qlbl", '🕓 been meaning to'); opts.priority.forEach(function (m) { actChip(actOf(m), pr, true); }); }
      var results = add(body, "div", "bento-results"); results.style.display = "none";
      var gridWrap = add(body, "div", "bento-gridwrap");
      ORDER.forEach(function (d) {
        var acts = (by[d] || []).slice(); if (!acts.length) return;
        acts.sort(function (x, y) { return (isPinned(y) ? 1 : 0) - (isPinned(x) ? 1 : 0); }); // pinned → the front (David 2026-06-24)
        var D = DOM[d], mc = add(gridWrap, "div", "bento-cat"); mc.style.background = mixHex(D.c, "#160510", 0.72); mc.style.borderColor = mixHex(D.c, "#160510", 0.4);
        var lab = add(mc, "div", "bento-catl", D.l.toUpperCase()); lab.style.color = D.light; lab.onclick = function () { view.cat = d; view.grp = null; render(); };
        var wrap = add(mc, "div", "bento-chips");
        var SHOWN = 6; acts.slice(0, SHOWN).forEach(function (a) { actChip(a, wrap, false); }); // 2-column grid: show the top few + a "+N" to open the rest (David's image 1)
        var rest = acts.length - SHOWN;
        if (rest > 0) { var more = add(wrap, "span", "bchip more"); more.style.background = mixHex(D.c, "#160510", 0.5); more.style.color = D.light; more.textContent = "+" + rest; more.onclick = function () { view.cat = d; view.grp = null; render(); }; }
        else { var adc = add(wrap, "span", "bchip addc"); adc.innerHTML = '<i class="ti ti-plus"></i>'; adc.onclick = addNew; }
      });
      var addb = add(body, "div", "bento-add"); addb.innerHTML = '<i class="ti ti-plus"></i> add activity'; addb.onclick = addNew;
      function drawResults(q) {
        if (!q) { results.style.display = "none"; results.innerHTML = ""; gridWrap.style.display = ""; pinned.style.display = ""; addb.style.display = ""; return; }
        gridWrap.style.display = "none"; pinned.style.display = "none"; addb.style.display = "none"; results.style.display = ""; results.innerHTML = "";
        var ql = q.toLowerCase(), hits = [], seen2 = {};
        ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { var t = (a.title || "").toLowerCase(); if (t.indexOf(ql) >= 0 && !seen2[t]) { seen2[t] = 1; hits.push(a); } }); });
        hits.sort(function (a, b) { return a.title.toLowerCase().indexOf(ql) - b.title.toLowerCase().indexOf(ql); });
        hits.slice(0, 60).forEach(function (a) { actChip(a, results, false); });
        var ab = add(results, "span", "bchip addc"); ab.innerHTML = '<i class="ti ti-plus"></i> "' + esc(q) + '"'; ab.onclick = function () { S.acts = S.acts || []; S.acts.push({ title: q, catK: null, domain: "focus" }); save(); by = bentoByDomain(); commit({ title: q, catK: null, habitId: null, domain: "focus", color: DOM.focus.c }); };
      }
      si.oninput = function () { searchQ = si.value; drawResults(searchQ.trim()); };
      si.onkeydown = function (e) { if (e.key === "Enter") { var first = results.querySelector(".bchip:not(.addc)"); if (first && searchQ.trim()) first.click(); } };
      drawResults(searchQ.trim());
    }
    function groupsOf(d) { var groups = {}, order = []; (by[d] || []).forEach(function (a) { var gn = a.group || "More"; if (!groups[gn]) { groups[gn] = []; order.push(gn); } groups[gn].push(a); }); return { groups: groups, order: order }; }
    function renderExpanded(d) {
      var D = DOM[d], gd = groupsOf(d);
      // top strip: back (steps up ONE level) + a breadcrumb + lateral domain tabs
      var strip = add(body, "div", "bento-strip");
      var back = add(strip, "span", "bento-back"); back.innerHTML = '<i class="ti ti-chevron-left"></i>'; back.onclick = function () { if (view.grp) { view.grp = null; } else { view.cat = null; } render(); };
      var crumb = add(strip, "span", "bento-crumb"); crumb.style.color = D.light;
      crumb.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + esc(D.l) + (view.grp ? ' <i class="ti ti-chevron-right" style="opacity:.55;font-size:.85em"></i> ' + esc(view.grp) : '');
      if (view.grp) { crumb.style.cursor = "pointer"; crumb.onclick = function () { view.grp = null; render(); }; } // tap the breadcrumb domain → back to its sub-groups
      ORDER.forEach(function (dd) { if (!by[dd] || !by[dd].length) return; var t = add(strip, "span", "bento-tab" + (dd === d ? " on" : ""), DOM[dd].l.toLowerCase()); t.style.color = DOM[dd].light; if (dd === d) { t.style.background = mixDark(DOM[dd].c); } t.onclick = function () { view.cat = dd; view.grp = null; render(); }; });
      var pane = add(body, "div", "bento-pane"); pane.style.borderColor = D.c;
      // LEVEL 2: more than one sub-group AND none chosen yet → show the sub-category list (drill down one more) — David 2026-06-27
      if (gd.order.length > 1 && !view.grp) {
        var h = add(pane, "div", "bento-paneh"); h.style.color = D.light; h.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + D.l;
        var gl = add(pane, "div", "bento-tiles");
        gd.order.forEach(function (gn) { var t = add(gl, "span", "bchip big grp"); t.style.background = mixHex(D.c, "#160510", 0.55); t.style.color = D.light; t.style.borderColor = mixHex(D.c, "#160510", 0.2); t.innerHTML = '<i class="ti ti-folder"></i> ' + esc(gn) + ' <span class="grp-n">' + gd.groups[gn].length + '</span>'; t.onclick = function () { view.grp = gn; render(); }; });
        var addt0 = add(gl, "span", "bchip big addt"); addt0.innerHTML = '<i class="ti ti-plus"></i> add'; addt0.onclick = addNew;
        return;
      }
      // LEVEL 3 (or a single-group domain): the activities. Single tap = pick (commit).
      var gn = view.grp || gd.order[0], acts = gd.groups[gn] || by[d] || [];
      var h2 = add(pane, "div", "bento-paneh"); h2.style.color = D.light; h2.innerHTML = '<i class="ti ' + D.ti + '"></i> ' + esc(gn);
      var g = add(pane, "div", "bento-tiles"); acts.forEach(function (a) { actChip(a, g, true); });
      // type-in fallback: add a niche activity right here → goes into this domain (reuses S.acts) — David 2026-06-27
      var tin = add(pane, "div", "bento-typein");
      var ti = document.createElement("input"); ti.type = "text"; ti.className = "bento-tinput"; ti.placeholder = "add your own…"; tin.appendChild(ti);
      var tgo = add(tin, "button", "bento-tadd"); tgo.innerHTML = '<i class="ti ti-plus"></i>';
      function addTyped() { var nm = ti.value.trim(); if (!nm) { ti.focus(); return; } S.acts = S.acts || []; if (!S.acts.filter(function (x) { return (x.title || "").toLowerCase() === nm.toLowerCase(); })[0]) S.acts.push({ title: nm, catK: null, domain: d }); save(); by = bentoByDomain(); var a = { title: nm, catK: null, habitId: null, domain: d, color: DOM[d].c }; if (multi) { if (sel.indexOf(a) < 0) sel.push(a); ti.value = ""; render(); renderFoot(); } else { close(); opts.onPick(a); } }
      tgo.onclick = addTyped; ti.onkeydown = function (e) { if (e.key === "Enter") addTyped(); };
    }
    function addNew() {
      view.cat = null; view.grp = null; body.innerHTML = ""; if (foot) { foot.remove(); foot = null; }
      add(body, "div", "bento-newh", "New activity");
      var inp = document.createElement("input"); inp.type = "text"; inp.className = "bento-input"; inp.placeholder = "name it once…"; body.appendChild(inp);
      add(body, "div", "bento-hint2", "type the name (once) → it becomes a bubble you tap forever");
      add(body, "div", "bento-lbl", "category");
      var crow = add(body, "div", "bento-cats"), chosen = { d: (ORDER.indexOf("focus") >= 0 ? "focus" : ORDER[0]) };
      ORDER.forEach(function (d) { var D = DOM[d], c = add(crow, "span", "bento-pick" + (d === chosen.d ? " on" : ""), D.l); c.style.background = D.c; c.style.color = D.ink; c.onclick = function () { chosen.d = d; Array.prototype.forEach.call(crow.children, function (n) { n.classList.remove("on"); }); c.classList.add("on"); }; });
      var go = add(body, "button", "bento-save"); go.innerHTML = 'add <i class="ti ti-check"></i>';
      go.onclick = function () { var nm = inp.value.trim(); if (!nm) { inp.focus(); return; } S.acts = S.acts || []; S.acts.push({ title: nm, catK: null, domain: chosen.d }); save(); by = bentoByDomain(); var a = { title: nm, catK: null, habitId: null, domain: chosen.d, color: DOM[chosen.d].c }; if (multi) { sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } };
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
    }
    function renderFoot() {
      if (!multi) return;
      if (!foot) foot = add(card, "div", "bento-foot");
      foot.innerHTML = "";
      if (opts.onSkip) { var sk = add(foot, "button", "bento-skip"); sk.innerHTML = 'Skip <i class="ti ti-player-skip-forward"></i>'; sk.onclick = function () { close(); opts.onSkip(); }; }
      var b = add(foot, "button", "bento-go"); b.innerHTML = opts.goLabel ? (opts.goIcon || '<i class="ti ti-arrow-right"></i>') + ' ' + opts.goLabel + (sel.length ? ' (' + sel.length + ')' : '') : ('<i class="ti ti-player-play-filled"></i> Start ' + (sel.length ? sel.length : "")); b.disabled = !sel.length && !opts.allowEmptyGo;
      b.onclick = function () { if (!sel.length && !opts.allowEmptyGo) return; close(); if (opts.onPickMulti) opts.onPickMulti(sel.slice()); else sel.forEach(opts.onPick); };
    }
    // OVERVIEW (David v647): the ORIGINAL beautiful striped bento cards — but SPLIT INTO 4 TABS (Energy/Work/Love/Other) so you only ever see one category's cards at a time (not overwhelming, still the bento box we designed). Each card's chips SCROLL. Recent + search on top. (Plan beats still use renderScoped.)
    function renderOverview() {
      if (opts.headNode) body.appendChild(opts.headNode);
      var sb = add(body, "div", "bento-search"); add(sb, "span", "bento-sicon").innerHTML = '<i class="ti ti-search"></i>';
      var si = document.createElement("input"); si.type = "text"; si.className = "bento-sinput"; si.placeholder = "search activities…"; si.value = searchQ; sb.appendChild(si);
      var pinList = []; ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { if (isPinned(a)) pinList.push(a); }); });
      var pinned = add(body, "div", "bento-pinned");
      if (pinList.length) { add(pinned, "span", "bento-qlbl", "★ Pinned"); pinList.forEach(function (a) { actChip(a, pinned, true).classList.add("fav"); }); }
      var recent = add(body, "div", "bento-pinned");
      try { var fr = frequent(8); if (fr.length) { add(recent, "span", "bento-qlbl", "Recent"); fr.forEach(function (m) { actChip(actOf(m), recent, true); }); } } catch (e) {}
      if (opts.priority && opts.priority.length) { var pr = add(body, "div", "bento-pinned"); add(pr, "span", "bento-qlbl", "Been meaning to"); opts.priority.forEach(function (m) { actChip(actOf(m), pr, true); }); }
      // THE 4 TABS — only the active supercategory's striped cards render
      if (!view.tab) view.tab = "energy";
      var tabsEl = add(body, "div", "bento-tabrow");
      SUPERCAT.forEach(function (sc) { var t = add(tabsEl, "span", "bento-tab" + (sc.k === view.tab ? " on" : ""), sc.l); t.style.color = (sc.k === view.tab ? "#fff" : sc.c); if (sc.k === view.tab) { t.style.background = mixDark(sc.c); t.style.borderColor = mixHex(sc.c, "#160510", 0.25); } t.onclick = function () { view.tab = sc.k; render(); }; });
      var results = add(body, "div", "bento-results"); results.style.display = "none";
      var gridWrap = add(body, "div", "bento-gridwrap");
      var activeSc = SUPERCAT.filter(function (s) { return s.k === view.tab; })[0] || SUPERCAT[0];
      activeSc.domains.forEach(function (d) {
        var acts = (by[d] || []).slice(); if (!acts.length) return;
        acts.sort(function (x, y) { return (isPinned(y) ? 1 : 0) - (isPinned(x) ? 1 : 0); });
        var D = DOM[d], mc = add(gridWrap, "div", "bento-cat"); mc.style.background = mixHex(D.c, "#160510", 0.72); mc.style.borderColor = mixHex(D.c, "#160510", 0.4);
        var lab = add(mc, "div", "bento-catl", D.l.toUpperCase()); lab.style.color = D.light;
        var wrap = add(mc, "div", "bento-chips"); acts.forEach(function (a) { actChip(a, wrap, false); }); // ALL chips — the strip scrolls (David v647)
        var adc = add(wrap, "span", "bchip addc"); adc.innerHTML = '<i class="ti ti-plus"></i>'; adc.onclick = addNew;
      });
      cascadeIn(gridWrap.children); // the striped cards spring in, staggered (v648)
      var addb = add(body, "div", "bento-add"); addb.innerHTML = '<i class="ti ti-plus"></i> add activity'; addb.onclick = addNew;
      function drawResults(q) {
        if (!q) { results.style.display = "none"; results.innerHTML = ""; gridWrap.style.display = ""; tabsEl.style.display = ""; pinned.style.display = ""; recent.style.display = ""; addb.style.display = ""; return; }
        gridWrap.style.display = "none"; tabsEl.style.display = "none"; pinned.style.display = "none"; recent.style.display = "none"; addb.style.display = "none"; results.style.display = ""; results.innerHTML = "";
        var ql = q.toLowerCase(), hits = [], seen2 = {};
        ORDER.forEach(function (d) { (by[d] || []).forEach(function (a) { var t = (a.title || "").toLowerCase(); if (t.indexOf(ql) >= 0 && !seen2[t]) { seen2[t] = 1; hits.push(a); } }); });
        hits.sort(function (a, b) { return a.title.toLowerCase().indexOf(ql) - b.title.toLowerCase().indexOf(ql); });
        hits.slice(0, 60).forEach(function (a) { actChip(a, results, false); });
        var ab = add(results, "span", "bchip addc"); ab.innerHTML = '<i class="ti ti-plus"></i> "' + esc(q) + '"'; ab.onclick = function () { S.acts = S.acts || []; S.acts.push({ title: q, catK: null, domain: "focus" }); save(); by = bentoByDomain(); commit({ title: q, catK: null, habitId: null, domain: "focus", color: DOM.focus.c }); };
      }
      si.oninput = function () { searchQ = si.value; drawResults(searchQ.trim()); };
      si.onkeydown = function (e) { if (e.key === "Enter") { var first = results.querySelector(".bchip:not(.addc)"); if (first && searchQ.trim()) first.click(); } };
      drawResults(searchQ.trim());
    }
    function render() {
      body.innerHTML = "";
      if (view.cat) { renderExpanded(view.cat); return; }            // deep per-domain view (still reachable)
      if (opts.domains && opts.domains.length) { renderScoped(); return; } // plan beats: scoped to specific domains → direct list
      renderOverview();                                              // the tabbed striped bento box
    }
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
        if (opts.priority && opts.priority.length) { add(B, "div", "lbl", "🕓 you've been meaning to…"); var pg2 = add(B, "div", "tilegrid"); opts.priority.forEach(function (t) { mkTile(pg2, t); }); } // the inferred procrastination list, surfaced first (David 2026-06-28)
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
  // ===== THE DAILY ELICITOR (David 2026-06-28): the app's first move on open is to get today's activities OUT of you — especially the ones you keep avoiding — and keep an always-ready, startable, editable plan. Not "type a list" you maintain; it DERIVES what you're procrastinating from your last few days + asks, one-tap. =====
  function avoidedActs() { // inferred procrastination: activities planned in the last 3 days that didn't get done + aren't already in/done today
    var out = [], seen = {}, tk = todayK(), have = {}, dm = {};
    blocks(tk).forEach(function (b) { if (b.title) have[b.title.toLowerCase()] = 1; });
    (logs(tk) || []).forEach(function (l) { if (l.title) dm[l.title.toLowerCase()] = 1; });
    lastDays(4).slice(1).forEach(function (dk) {
      blocks(dk).forEach(function (b) { if (!b.title) return; var key = b.title.toLowerCase(); if (blockStatus(dk, b) === "ok" || seen[key] || have[key] || dm[key]) return; seen[key] = 1; out.push({ title: b.title, catK: b.catK || null, emoji: "", color: b.color || (DOM[domainOf(b)] || DOM.focus).c, habitId: b.habitId || null }); });
    });
    return out.slice(0, 6);
  }
  // THE ONE PLANNING FLOW (David 2026-06-28, Brian-Johnson BIG-3 STAGED): instead of one overwhelming bento, a guided four-beat sequence —
  // ⚡ ENERGY (move+nourish+restore) · 💼 WORK (focus+create) · ❤️ LOVE (connect) · ✨ Everything else (play+upkeep+the rest) — each beat opening with a LIGHT
  // one-line identity+virtue reminder (Johnson "who am I being") then a domain-scoped bento. Picks accumulate across beats → the order/length/importance editor (orderStep).
  // Back/skip per beat, never forced. No ugly white pickerSheet, no instant drop.
  var BIG3 = [
    { id: "energy", emoji: "🔥", label: "Energy", domains: ["move", "nourish", "restore"], virtue: "zest" },
    { id: "work", emoji: "💼", label: "Work", domains: ["focus", "create"], virtue: "disc" },
    { id: "love", emoji: "❤️", label: "Love", domains: ["connect"], virtue: "love" }
  ];
  // a LIGHT reminder line for a beat — pulls today's identity + virtue if set, else a gentle prompt. Never a form. (Johnson: who am I being + the virtue)
  function big3Reminder(beat) {
    var am = ((S.bk || {})[todayK()] || {}).am || {};
    var vk = (am.virtue) || (S.profile && S.profile.todayVirtues && S.profile.todayVirtues[0]) || beat.virtue;
    var v = VIRTUES.filter(function (x) { return x.k === vk; })[0] || VIRTUES.filter(function (x) { return x.k === beat.virtue; })[0];
    var idents = (am.identity && am.identity.length) ? am.identity : ((S.profile && S.profile.todayIdentity) || []);
    var who = idents.length ? ("You're being " + esc(idents.slice(0, 2).join(" & "))) : null;
    var line = v ? (v.e + " " + v.l + " — " + v.grow) : null;
    return { who: who, line: line, vc: v ? v.c : "#ffb3d9" };
  }
  // a beat's title card pushed into the bento body — light, one line. (rendered via opts.headNode)
  function big3HeadNode(beat) {
    var wrap = document.createElement("div"); wrap.className = "big3-remind";
    var r = big3Reminder(beat);
    var top = add(wrap, "div", "big3-rtop"); top.innerHTML = '<span class="big3-remoji">' + beat.emoji + '</span> <span class="big3-rlbl">' + esc(beat.label.toUpperCase()) + '</span>';
    if (r.who) { var w = add(wrap, "div", "big3-rwho"); w.textContent = r.who; }
    if (r.line) { var l = add(wrap, "div", "big3-rline"); l.style.color = r.vc; l.textContent = r.line; }
    return wrap;
  }
  function shapeFlow(k) {
    k = k || todayK(); S.shapeK = todayK();
    var acc = []; // accumulated picks across all beats (preserves chosen order; deduped by title)
    var avoided = avoidedActs();
    var ELSE_DOMAINS = ["play", "upkeep"]; // "everything else" = the remaining DOM domains (and anything uncategorized lands in focus, already shown in WORK)
    // titles already in acc that belong to a set of domains — for Back preselect
    function accTitlesFor(domains) { return acc.filter(function (a) { return domains.indexOf(domainOf(a)) >= 0; }).map(function (a) { return a.title; }); }
    // commit a beat: drop this beat's old domain contributions, then append the fresh picks (so removing-on-Back actually removes; order preserved)
    function commitBeat(domains, picks) { acc = acc.filter(function (a) { return domains.indexOf(domainOf(a)) < 0; }); (picks || []).forEach(function (p) { if (p && !acc.some(function (a) { return (a.title || "").toLowerCase() === (p.title || "").toLowerCase(); })) acc.push(p); }); }
    function runBeat(i) {
      if (i >= BIG3.length) { runElse(); return; }
      var beat = BIG3[i];
      bentoPicker({
        title: beat.emoji + " " + beat.label,
        multi: true, domains: beat.domains, headNode: big3HeadNode(beat), preselect: accTitlesFor(beat.domains),
        // surface the "been meaning to…" items that belong to THIS beat's domains
        priority: avoided.filter(function (m) { return beat.domains.indexOf(domainOf(m)) >= 0; }),
        goLabel: (i < BIG3.length - 1 ? "Next: " + BIG3[i + 1].label : "Next: everything else"), goIcon: '<i class="ti ti-arrow-right"></i>',
        allowEmptyGo: true, // can step forward with nothing picked (never force)
        onBack: i > 0 ? function () { runBeat(i - 1); } : null,
        onPickMulti: function (sel) { commitBeat(beat.domains, sel); runBeat(i + 1); },
        onSkip: function () { runBeat(i + 1); }
      });
    }
    function runElse() {
      bentoPicker({
        title: "✨ Everything else",
        multi: true, domains: ELSE_DOMAINS, preselect: accTitlesFor(ELSE_DOMAINS), headNode: (function () { var w = document.createElement("div"); w.className = "big3-remind"; var t = add(w, "div", "big3-rtop"); t.innerHTML = '<span class="big3-remoji">✨</span> <span class="big3-rlbl">EVERYTHING ELSE</span>'; add(w, "div", "big3-rline").textContent = "anything that doesn't fit the Big 3."; return w; })(),
        priority: avoided.filter(function (m) { var d = domainOf(m); return BIG3.every(function (b) { return b.domains.indexOf(d) < 0; }); }),
        goLabel: "Arrange them", goIcon: '<i class="ti ti-adjustments-horizontal"></i>',
        allowEmptyGo: true,
        onBack: function () { runBeat(BIG3.length - 1); },
        onPickMulti: function (sel) { commitBeat(ELSE_DOMAINS, sel); if (!acc.length) { toast("Nothing picked — plan whenever you're ready."); return; } orderStep(k, acc); },
        onSkip: function () { if (!acc.length) { toast("Nothing picked — plan whenever you're ready."); return; } orderStep(k, acc); }
      });
    }
    runBeat(0);
  }
  // ORDER / LENGTH / IMPORTANCE EDITOR (David 2026-06-28): a minimalist mini-timeline of the chosen activities. Per row, three convenient controls —
  //   • REORDER: drag the ⠿ handle (pointer-drag, touch + mouse).
  //   • LENGTH: quick chips 15/30/45/60/90 (default 30); row height hints at length (mini-timeline feel).
  //   • IMPORTANCE: 1–3 pips → block.prio 1/2/3 (default 2). reward-never-shame: warm amber pips, never red.
  // Scrollable (max-height + overflow-y:auto + overscroll-behavior:contain). Commit → distributePlan honours order + mins + prio via the safe path (blocks push + reflow).
  var LEN_CHIPS = [15, 30, 45, 60, 90];
  function orderStep(k, sel) {
    sel = (sel || []).filter(Boolean); if (!sel.length) return;
    sel.forEach(function (a) { if (a.mins == null) a.mins = 30; if (a.prio == null) a.prio = 2; }); // seed defaults on the chosen items
    var ov = add(document.body, "div", "bento-ov");
    var card = add(ov, "div", "bento-card");
    var head = add(card, "div", "bento-head");
    add(head, "div", "bento-q", "Arrange your day");
    var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>';
    var body = add(card, "div", "bento-body");
    add(body, "div", "bento-orderhint", "Drag ⠿ to reorder · tap a length · set what matters most. They land back-to-back from your next free slot — fine-tune times on the timeline.");
    var list = add(body, "div", "bento-orderlist editor");
    function paint() {
      list.innerHTML = "";
      sel.forEach(function (a, i) {
        var dom = a.domain || domainOf(a), D = DOM[dom] || DOM.focus, accent = (dom === "drift") ? "#7a808c" : D.c;
        var row = add(list, "div", "bento-orow editrow"); row.dataset.i = i;
        row.style.minHeight = Math.round(44 + (a.mins / 90) * 26) + "px"; // height hints at length
        // top line: handle · color swatch · title · importance pips
        var topL = add(row, "div", "edit-top");
        var hd = add(topL, "span", "bento-ohandle"); hd.innerHTML = '<i class="ti ti-grip-vertical"></i>';
        var sw = add(topL, "span", "bento-osw"); sw.style.background = accent;
        add(topL, "span", "bento-on", a.title);
        // importance pips (low/med/high → prio 1/2/3) — tap to cycle; pips render filled up to prio
        var pips = add(topL, "span", "edit-pips"); pips.title = "importance";
        for (var p = 1; p <= 3; p++) { (function (pv) { var dt = add(pips, "i", "edit-pip" + (a.prio >= pv ? " on" : "")); dt.onclick = function (e) { e.stopPropagation(); a.prio = pv; paint(); }; })(p); }
        // bottom line: length chips
        var lenRow = add(row, "div", "edit-len");
        LEN_CHIPS.forEach(function (m) { var c = add(lenRow, "span", "edit-lchip" + (a.mins === m ? " on" : "")); c.textContent = m + "m"; if (a.mins === m) { c.style.background = accent; c.style.color = D.ink || "#160510"; } c.onclick = function (e) { e.stopPropagation(); a.mins = m; paint(); }; });
        hd.addEventListener("pointerdown", function (ev) { startDrag(ev, i, row); });
      });
    }
    var dragging = null;
    function startDrag(ev, idx, dragEl) {
      ev.preventDefault(); dragging = true;
      dragEl.classList.add("drag"); dragEl.style.zIndex = "6";
      var grabOff = ev.clientY - dragEl.getBoundingClientRect().top; // pointer offset inside the row
      function place(clientY) { dragEl.style.transition = "none"; dragEl.style.transform = ""; var nat = dragEl.getBoundingClientRect().top; dragEl.style.transform = "translateY(" + ((clientY - grabOff) - nat) + "px) scale(1.03)"; } // finger-follow (transform-independent natural top)
      function flip(fn) { var sibs = Array.prototype.slice.call(list.children).filter(function (r) { return r !== dragEl; }), b = sibs.map(function (r) { return r.getBoundingClientRect().top; }); fn(); sibs.forEach(function (r, i) { var d = b[i] - r.getBoundingClientRect().top; if (d) { r.style.transition = "none"; r.style.transform = "translateY(" + d + "px)"; requestAnimationFrame(function () { r.style.transition = "transform .2s cubic-bezier(.2,.8,.3,1)"; r.style.transform = ""; }); } }); } // siblings slide smoothly into place
      function move(e) {
        e.preventDefault(); place(e.clientY);
        var dmid = dragEl.getBoundingClientRect().top + dragEl.offsetHeight / 2, sibs = Array.prototype.slice.call(list.children).filter(function (r) { return r !== dragEl; });
        for (var s = 0; s < sibs.length; s++) { var rc = sibs[s].getBoundingClientRect(), mid = rc.top + rc.height / 2, pos = dragEl.compareDocumentPosition(sibs[s]);
          if (dmid > mid && (pos & 4)) { (function (n) { flip(function () { list.insertBefore(dragEl, n.nextSibling); }); })(sibs[s]); place(e.clientY); break; } // drag center dropped below a row that's after it → move past it
          if (dmid < mid && (pos & 2)) { (function (n) { flip(function () { list.insertBefore(dragEl, n); }); })(sibs[s]); place(e.clientY); break; } // drag center rose above a row that's before it → move before it
        }
      }
      function up() { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
        var order = Array.prototype.slice.call(list.children).map(function (r) { return +r.dataset.i; }), ns = order.map(function (oi) { return sel[oi]; });
        sel.length = 0; for (var z = 0; z < ns.length; z++) sel.push(ns[z]); // commit the new DOM order back to sel
        dragging = null; dragEl.style.zIndex = ""; paint();
      }
      document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
    }
    paint();
    var foot = add(card, "div", "bento-foot");
    var go = add(foot, "button", "bento-go"); go.innerHTML = '<i class="ti ti-check"></i> Add ' + sel.length + ' to ' + (k === todayK() ? "today" : relLabel(k).toLowerCase());
    go.onclick = function () { ov.remove(); distributePlan(k, sel); };
    xb.onclick = function () { ov.remove(); };
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
  }
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
  // PAST has DIVERGED from plan when, for TODAY, the plan and the real (tracked) lanes disagree in the past region: a missed plan, a partial match, or a drift log. When diverged the two are "disjoint timelines" — too messy to auto-reorder safely — so the past stays frozen (set-in-stone, the original contract). When the past is CLEAN (everything matched / on-plan), past blocks may reorder like the future. (David 2026-06-27: "reorder in the past just like the future UNLESS the plan mismatches — then pause.")
  function pastDiverged(k) {
    if (k !== todayK()) return false; // only today has a live plan↔real split; other days are pure history (already reorderable)
    var now = logicalNowMin();
    var bl = blocks(k); for (var i = 0; i < bl.length; i++) { var b = bl[i], be = hm(b.time) + (b.mins || 30); if (be <= now) { var st = blockStatus(k, b); if (st === "miss") return true; var dom = domainOf(b), pm = (st === "ok" && !b.done) ? matchedSpanFor(k, b, dom) : null; if (pm && pm.cov < (b.mins || 30) - 5) return true; } } // a missed or partially-matched past plan = divergence
    var lg = logs(k); for (var j = 0; j < lg.length; j++) { var e = lg[j], ee = hm(e.time) + (e.mins || 0); if (ee <= now && domainOf(e) === "drift") return true; } // a past drift log = you went off-plan = divergence
    return false;
  }
  // module-scope bounding span of same-domain real coverage over a plan block (the in-render matchedSpan is closure-scoped; this mirrors it for pastDiverged) — David 2026-06-27
  function matchedSpanFor(k, b, dom) { var lgs = logs(k), s = null, e = null, bs = hm(b.time), be = bs + (b.mins || 30); for (var i = 0; i < lgs.length; i++) { var ls = hm(lgs[i].time), le = ls + (lgs[i].mins || 0); if (ls < be && le > bs && domainOf(lgs[i]) === dom) { var cs = Math.max(bs, ls), ce = Math.min(be, le); if (s === null || cs < s) s = cs; if (e === null || ce > e) e = ce; } } return s === null ? null : { start: s, end: e, cov: e - s }; }
  function reflow(k) {
    var all = blocks(k).slice();
    var pins = all.filter(function (b) { return b.pin; }).map(function (b) { return { s: hm(b.time), e: hm(b.time) + (b.mins || 30) }; }).sort(function (a, b) { return a.s - b.s; });
    var flex = all.filter(function (b) { return !b.pin; }).sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var changed = false, cur = -1;
    var _now = logicalNowMin(), _today = (k === todayK()), _pastFrozen = _today && pastDiverged(k); // when the past↔plan diverged, freeze the past (original set-in-stone behavior); when clean, the past reorders like the future (David 2026-06-27)
    flex.forEach(function (b) {
      var dur = b.mins || 30;
      var _bs = hm(b.time), _be = _bs + dur, _straddlesNow = _today && _bs <= _now && _be > _now, _isPast = _today && _be <= _now;
      if (_today && _straddlesNow) { cur = Math.max(cur, _be); return; } // the LIVE straddling block never moves — set-in-stone (regression contract)
      if (_isPast && _pastFrozen) { cur = Math.max(cur, _be); return; } // diverged past → frozen exactly as before (David 2026-06-25 contract)
      var s = cur < 0 ? _bs : Math.max(_bs, cur), moved = true, guard = 0;
      while (moved && guard++ < 60) { moved = false; for (var i = 0; i < pins.length; i++) { if (s < pins[i].e && s + dur > pins[i].s) { s = pins[i].e; moved = true; } } }
      if (_isPast) s = Math.min(s, Math.max(_bs, _now - dur)); // a reordering PAST block can shift to close a gap/overlap but NEVER crosses the now-line into the future (regression contract #2) — David 2026-06-27
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
    else { var T = [{ h: "08:00", m: 30, t: "Breakfast", c: "#ff8a1e", p: 2 }, { h: "09:00", m: 90, t: oneThing || "Deep work", c: "#2a9fe0", p: 3 }, { h: "11:00", m: 45, t: "Move", c: "#ff8a1e", p: 3 }, { h: "13:00", m: 45, t: "Lunch", c: "#ff8a1e", p: 2 }, { h: "18:30", m: 45, t: "Dinner", c: "#ff8a1e", p: 2 }, { h: "21:30", m: 30, t: "Wind down", c: "#48d0e0", p: 2 }]; S.blocks[k] = T.map(function (x) { return markFutureBlock({ id: uid(), time: x.h, mins: x.m, title: x.t, prio: x.p, color: x.c, done: false }, k); }); }
    if (oneThing) { var have = false; blocks(k).forEach(function (b) { if (b.title.toLowerCase() === oneThing.toLowerCase()) have = true; }); if (!have) blocks(k).push(markFutureBlock({ id: uid(), time: "09:00", mins: 90, title: oneThing, prio: 3, color: "#2a9fe0", done: false, star: true }, k)); }
    reflow(k); save();
  }
  // ===== WISDOM TOOLBOX (TB-*, David 2026-06-28): the cockpit 'tool' stage mode. Adopts the six already-shipping runners under David's 8-Layer Self-Help Stack with KB-EXACT 'when to use me' lines, adds Stutz's Reversal of Desire + a Blair eyes-open self-hypnosis shell + a Part-X triage front door. Reward-never-shame: using a tool on a hard day IS the win. NOT a third menu — it renders into #tfStageBody via renderStage('tool'). =====
  // The kit's single source of truth. layer = David's 8-Layer Self-Help Stack section; when = KB-EXACT verbatim 'when to use me'; fn launches the runner (the six adopted + the new ones). gateNode reserved for TB-JOURNEY-UNLOCK (all unlocked this wave). (TB-STATE)
  var TOOLS = [
    { id: "breathe",  layer: "Steady the body",        name: "Breathe",          emoji: "🌬️", thinker: "Huberman · Johnson", when: "acute stress, a spike, or right before something hard — any transition crash", fn: function () { breathwork(4); } },
    { id: "relax",    layer: "Steady the body",        name: "Relax all muscles", emoji: "🧘", thinker: "Maltz — Psycho-Cybernetics", when: "tension, pre-sleep, or pre-focus", fn: function () { relaxMoment(); } },
    { id: "meditate", layer: "Clear the mind",          name: "Meditate",          emoji: "🧘", thinker: "Harris · Headspace · Blackstone · Adyashanti", when: "scattered, racing mind — when you can't detect what's off", fn: function () { meditation(); } },
    { id: "tapping",  layer: "Feel it through",         name: "Tapping (EFT)",     emoji: "👆", thinker: "EFT — Craig", when: "a named feeling (anxious / stuck / frustrated / sad) you want to move through", fn: function () { tapping(); } },
    { id: "reversal", layer: "Feel it through",         name: "Reversal of Desire",emoji: "🔥", thinker: "Stutz — Tool 1", when: "right before something you've been avoiding", fn: function () { reversalOfDesire(null); } },
    { id: "activelove",layer: "Feel it through",        name: "Active Love",       emoji: "💗", thinker: "Stutz — Tool 2", when: "when someone's living rent-free in your head and you can't stop rehearsing the argument", fn: function () { activeLove(); } },
    { id: "blacksun", layer: "Feel it through",         name: "Black Sun",         emoji: "🌑", thinker: "Stutz — Tool 6", when: "the pull to scroll / snack / numb — the “I deserve this” voice", fn: function () { blackSun(); } },
    { id: "vortex",   layer: "Feel it through",         name: "The Vortex",        emoji: "🌪️", thinker: "Stutz — Tool 7", when: "lethargy, a mid-day crash, or the flat gap between tasks", fn: function () { vortex(); } },
    { id: "jeopardy", layer: "Feel it through",         name: "Jeopardy",          emoji: "⏳", thinker: "Stutz — Tool 5", when: "demoralized and stuck — or right after a win, when the work quietly stops", fn: function () { jeopardy(); } },
    { id: "mantra",   layer: "Become who you're being", name: "Mantra",            emoji: "🗣️", thinker: "Murphy · Goddard", when: "the morning identity step, low self-trust, or pre-performance", fn: function () { mantraPlayer(); } },
    { id: "innerauth",layer: "Become who you're being", name: "Inner Authority",   emoji: "🦁", thinker: "Stutz — Tool 3", when: "before a hard conversation or performance, or when you freeze up", fn: function () { innerAuthority(); } },
    { id: "selfhyp",  layer: "Become who you're being", name: "Self-Hypnosis",     emoji: "🌀", thinker: "Blair — eyes-open induction", when: "to install a new self-image, or to wind down at night", fn: function () { selfHypnosis(); } },
    { id: "grateful", layer: "Lift the lens",           name: "Grateful Flow",     emoji: "🙏", thinker: "Stutz — Tool 4", when: "a negative-thought loop with no live grievance — light a different room", fn: function () { gratefulFlow(); } }
  ];
  var TOOL_LAYERS = ["Steady the body", "Clear the mind", "Feel it through", "Become who you're being", "Lift the lens"]; // David's stack order — lower layers gate higher (can't reframe a dysregulated body)
  function toolboxStageStep(sb) { // renders the kit into #tfStageBody (the 'tool' cockpit stage). Reuses .tf-stagecard / .tf-chip material + berry palette. No new menu, no timeline touch.
    sb.innerHTML = "";
    var head = add(sb, "div", "tf-stagecard");
    add(head, "div", "tfs-h", "🧰 Your toolbox");
    add(head, "div", "tfs-sub", "the right move for the moment you're in — sourced from your Field Guide. Using one on a hard day is the win.");
    var sos = add(head, "button", "tf-chip"); sos.style.marginTop = "11px"; sos.innerHTML = '<i class="ti ti-urgent"></i> What\'s loud right now?'; sos.onclick = function () { partXTriage({ hot: (currentMood() <= 1) || haveLiveGrievance() }); };
    // Favorites / Recents pinned row
    var pins = []; (S.tools && S.tools.fav || []).forEach(function (id) { if (pins.indexOf(id) < 0) pins.push(id); }); (S.tools && S.tools.recents || []).forEach(function (id) { if (pins.indexOf(id) < 0) pins.push(id); });
    pins = pins.slice(0, 4);
    if (pins.length) { var pwrap = add(sb, "div"); add(pwrap, "div", "tfs-sub", "Recent"); var prow = add(pwrap, "div"); prow.style.cssText = "display:flex;gap:7px;flex-wrap:wrap;"; pins.forEach(function (id) { var T = TOOLS.filter(function (x) { return x.id === id; })[0]; if (!T) return; var c = add(prow, "button", "tf-chip"); c.innerHTML = T.emoji + " " + esc(T.name); c.onclick = function () { runTool(T); }; }); }
    TOOL_LAYERS.forEach(function (layer) {
      var inLayer = TOOLS.filter(function (t) { return t.layer === layer; }); if (!inLayer.length) return;
      add(sb, "div", "tfs-sub", layer).style.cssText = "margin-top:6px;font-weight:800;color:#ffb3d9;letter-spacing:.3px;";
      inLayer.forEach(function (t) {
        var card = add(sb, "button", "tf-stagecard"); card.style.cssText = "text-align:left;cursor:pointer;width:100%;display:block;";
        var top = add(card, "div"); top.style.cssText = "display:flex;align-items:center;gap:8px;";
        add(top, "span", null, t.emoji).style.cssText = "font-size:20px;flex:none;";
        var nm = add(top, "div"); nm.style.flex = "1"; add(nm, "div", "tfs-h", t.name).style.marginBottom = "1px"; add(nm, "div", "tfs-sub", t.thinker).style.fontSize = "11px";
        var pips = add(top, "span"); pips.style.cssText = "display:flex;gap:3px;flex:none;"; var rung = toolRung(t.id); for (var p = 0; p < 3; p++) { var dt = add(pips, "i"); dt.style.cssText = "width:7px;height:7px;border-radius:50%;background:" + (p < rung ? "#ff8a3a" : "#3a2230") + ";display:block;"; } if (rung) { var rl = add(top, "span"); rl.textContent = toolRungLabel(rung); rl.style.cssText = "font-size:9px;color:#b596ad;flex:none;"; }
        add(card, "div", "tfs-sub", "when: " + t.when).style.cssText = "margin-top:7px;font-size:12px;color:#cfa8c4;";
        card.onclick = function () { runTool(t); };
      });
    });
  }
  function runTool(t) { try { t.fn(); } catch (e) { toast("couldn't open that one"); } } // launch a tool from the grid (it logs its own use on finish via tickTool)
  function tickTool(id) { // log a COMPLETED rep (counts up only — never a breakable streak). Called from each runner's finish() handler. De-duped per logical-day per microState precedent so re-running twice/day doesn't double-count the ladder.
    S.tools = S.tools || {}; S.tools.use = S.tools.use || {}; S.tools.last = S.tools.last || {}; S.tools.recents = S.tools.recents || [];
    var k = todayK();
    if (S.tools.last[id] !== k) { S.tools.use[id] = (S.tools.use[id] || 0) + 1; } // one ladder tick per day per tool (the de-dupe); repeated same-day finishes still log+earn (those happen in the runner), just don't inflate the rep count
    S.tools.last[id] = k;
    S.tools.recents = [id].concat(S.tools.recents.filter(function (x) { return x !== id; })).slice(0, 6);
    save();
  }
  function toolRung(id) { var u = (S.tools && S.tools.use && S.tools.use[id]) || 0; return u >= 12 ? 3 : u >= 3 ? 2 : u >= 1 ? 1 : 0; } // Willingness(1) → Habit(2) → Grace(3) — Stutz's practice ladder (3-pip)
  function toolRungLabel(r) { return ({ 1: "Willingness", 2: "Habit", 3: "Grace" })[r] || ""; }
  // a small #breatheOv beat-runner that clones the breathwork/relaxMoment idiom: orb + TTS + optional WebAudio drone + one-tap-advance beats, then a finish() that logs a tracked Restore + earns Spark + GENTLE celebrate + ticks the ladder. Shared by Reversal of Desire + Part-X tools so each new Stutz tool is tiny.
  function beatRunner(opts) {
    // opts: { id, title, beats:[{lab, sub, orb?}], logTitle, catK, color, spark, voiceProf, drone, onFinish(skipped) }
    TTS.unlock(); // gesture-bound (the tap that opened this) — unlock speech in the same synchronous tick
    var voiceProf = opts.voiceProf || VPROF.relax, col = opts.color || DOM.restore.c;
    var ov = document.createElement("div"); ov.id = "breatheOv";
    ov.innerHTML = '<button class="bw-x">skip</button><div class="bw-orb"></div><div class="bw-label"></div><div class="bw-sub"></div><button class="done2 bw-next" style="max-width:260px;margin:30px auto 0;display:block;">Next ▶</button>';
    document.body.appendChild(ov); addVoiceToggle(ov);
    var orb = ov.querySelector(".bw-orb"), lab = ov.querySelector(".bw-label"), sub = ov.querySelector(".bw-sub"), nextB = ov.querySelector(".bw-next");
    var AC = window.AudioContext || window.webkitAudioContext, actx = null, osc = null, gain = null;
    if (opts.drone !== false) { try { if (AC) { actx = new AC(); osc = actx.createOscillator(); gain = actx.createGain(); osc.type = "sine"; osc.frequency.value = 160; gain.gain.value = 0; osc.connect(gain); gain.connect(actx.destination); osc.start(); gain.gain.linearRampToValueAtTime(0.03, actx.currentTime + 1.6); } } catch (e) { actx = null; } }
    var i = 0, done = false;
    function finish(skip) {
      if (done) return; done = true; TTS.stop();
      if (actx) { try { gain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4); osc.stop(actx.currentTime + 0.5); } catch (e) {} }
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      if (!skip) {
        var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: opts.logTitle || opts.title, mins: 2, catK: opts.catK || "love", color: col });
        earn(opts.spark || 6, { catK: opts.catK || "love" }); tickTool(opts.id);
        try { celebrateGated(col, curStreak() || 1); } catch (e) {} // GENTLE, gated once/day — reward-never-shame
        save(); renderAll();
      }
      if (opts.onFinish) opts.onFinish(skip);
    }
    ov.querySelector(".bw-x").onclick = function () { finish(true); };
    function paint() {
      if (done) return;
      if (i >= opts.beats.length) { lab.textContent = "Done ✓"; sub.textContent = "carry it forward"; nextB.style.display = "none"; orb.style.transition = "transform 1.2s ease"; orb.style.transform = "scale(.7)"; setTimeout(function () { finish(false); }, 1400); return; }
      var b = opts.beats[i];
      lab.textContent = b.lab; sub.textContent = b.sub || "";
      orb.style.transition = "transform 1.1s ease"; orb.style.transform = b.orb === "in" ? "scale(1.3)" : b.orb === "out" ? "scale(.6)" : "scale(1)";
      say((b.lab + (b.sub ? ". " + b.sub : "")), voiceProf);
      nextB.textContent = (i === opts.beats.length - 1) ? (opts.lastLabel || "Finish ✓") : "Next ▶";
    }
    nextB.onclick = function () { if (done) return; i++; paint(); };
    setTimeout(paint, 500);
  }
  // REVERSAL OF DESIRE — Stutz Tool 1 (master-guide L172-190), david-framework L4 / Force of Forward Motion. When-to-use (verbatim): right before something you've been avoiding (the Comfort Zone). The flagship trigger→tool tool: avoidance is the most common daily Part X mode. (TB-REVERSAL)
  function reversalOfDesire(avoidedBlock) {
    beatRunner({
      id: "reversal", title: "Reversal of Desire", logTitle: "Reversal of Desire", catK: "energy", color: "#ff8a3a", spark: 6, voiceProf: VPROF.breath,
      beats: [
        { lab: "See the pain as a cloud", sub: "the thing you're avoiding — picture it as a cloud right in front of you", orb: "in" },
        { lab: "“Bring it on!”", sub: "move toward the cloud — say it, mean it", orb: "in" },
        { lab: "“I love pain!”", sub: "go all the way in — let the cloud surround you", orb: "" },
        { lab: "“Pain sets me free!”", sub: "feel yourself pass through and out the far side into light", orb: "out" },
        { lab: "Feel the forward motion", sub: "you're moving again — that's the whole point", orb: "" }
      ], lastLabel: "Finish ✓",
      onFinish: function (skip) {
        if (skip) return;
        if (avoidedBlock) { setTimeout(function () { try { startPlanned(avoidedBlock); toast("▶ started " + esc(avoidedBlock.title)); } catch (e) {} }, 50); } // "start the thing" — jump straight into the avoided block
      }
    });
    if (avoidedBlock) toast("after this — “" + esc(avoidedBlock.title) + "”"); // tiny pre-frame so the close action isn't a surprise
  }
  // ===== TB-STUTZ-FANOUT (David 2026-06-28): the remaining Stutz arsenal. Each a beatRunner clone with VERBATIM KB cues (phil-stutz-master-guide.md). Each logs a tracked Restore + earns Spark + GENTLE celebrateGated + ticks the skill ladder. Reward-never-shame: using one on a hard day IS the win. =====
  // ACTIVE LOVE — Stutz Tool 2 (master-guide L194-211), L4 / Outflow. When-to-use (verbatim): when someone "takes up residence in your head" and you can't stop rehearsing the argument (the Maze). Framed as self-interest, NOT virtue — this frees YOU. MUST precede Grateful Flow while a grievance is live (master-guide L119). Concentration → Transmission → Penetration.
  function activeLove() {
    beatRunner({
      id: "activelove", title: "Active Love", logTitle: "Active Love", catK: "love", color: "#ff4fa0", spark: 7, voiceProf: VPROF.mantra,
      beats: [
        { lab: "Concentration", sub: "feel love flowing through your whole body — not at anyone yet, just the raw force, radiating from your chest", orb: "in" },
        { lab: "Transmission", sub: "direct that love at the person who wronged you — see them bathed in it. Not forgiving — generating an infinite force, because it serves YOUR liberation", orb: "" },
        { lab: "Penetration", sub: "feel the love enter them and fill them completely — and as it does, feel the Outflow return to you, greater than what you sent", orb: "out" },
        { lab: "They're out of your head", sub: "the loop is discharged — that was for you, not for them" }
      ], lastLabel: "Finish ✓"
    });
  }
  // INNER AUTHORITY — Stutz Tool 3 (master-guide L215-232), L5 / Force of Self-Expression. When-to-use (verbatim): before a hard conversation or performance, or when you freeze out of fear the Shadow will be exposed. WITH a breath pre-roll (regulate first). Partners the Shadow, never shames it.
  function innerAuthority() {
    beatRunner({
      id: "innerauth", title: "Inner Authority", logTitle: "Inner Authority", catK: "love", color: "#8a5cf0", spark: 7, voiceProf: VPROF.mantra,
      beats: [
        { lab: "One slow breath first", sub: "drop the shoulders, settle — you can't speak from your core on a wound-up body", orb: "in" },
        { lab: "Project your Shadow", sub: "see the version of yourself you're most ashamed of — weak, imperfect, broken — a vivid image standing right in front of you", orb: "" },
        { lab: "Feel the bond", sub: "this is you. Not your enemy. Your other half. Feel the connection between you and the Shadow", orb: "in" },
        { lab: "Together: “LISTEN!”", sub: "you and the Shadow speak with one voice. The Force of Self-Expression flows — your authority comes from inside, not from their approval", orb: "" }
      ], lastLabel: "Finish ✓"
    });
  }
  // JEOPARDY — Stutz Tool 5 (master-guide L257-273), the META-TOOL. When-to-use (verbatim): demoralized and can't use any other tool, OR right after a success (the Exoneration Fantasy — Stutz's #1 documented relapse, L121). Angel-offered after a celebrate()/win. Deathbed self → the scream → use the spark.
  function jeopardy(launchAfter) {
    beatRunner({
      id: "jeopardy", title: "Jeopardy", logTitle: "Jeopardy", catK: "energy", color: "#ff8a3a", spark: 6, voiceProf: VPROF.breath,
      beats: [
        { lab: "Your deathbed self", sub: "he has run out of present moments. He is looking back at THIS one — the one you're about to waste", orb: "" },
        { lab: "Feel him scream at you", sub: "he knows the value of this moment because he has none left. Let his urgency enter you", orb: "in" },
        { lab: "Use the spark", sub: "this urgency is real, not manufactured. Use it — launch the next thing right now" }
      ], lastLabel: "Use it ▶",
      onFinish: function (skip) { if (!skip && typeof launchAfter === "function") setTimeout(launchAfter, 50); } // hand the spark straight into whatever's next
    });
  }
  // BLACK SUN — Stutz Tool 6 (master-guide L277-291), Coming Alive / counters self-gratification mode. When-to-use (verbatim): the pull to scroll/snack/numb, the "I deserve this / one break won't hurt" voice. A body-first tool — can precede labeling. Void → orb of dark light → fills from inside → give outward.
  function blackSun() {
    beatRunner({
      id: "blacksun", title: "Black Sun", logTitle: "Black Sun", catK: "energy", color: "#6a4fd0", spark: 6, voiceProf: VPROF.breath,
      beats: [
        { lab: "Feel the void underneath", sub: "not the craving itself — the emptiness driving it. The deprivation that wants to be filled from outside", orb: "out" },
        { lab: "A Black Sun rises", sub: "from that void, an orb of dark light lifts — the compressed Life Force itself", orb: "in" },
        { lab: "It fills you from inside", sub: "the void fills from within, not from the screen or the snack — you're full", orb: "in" },
        { lab: "Give that energy outward", sub: "send it back out into your day — that's where it wants to go" }
      ], lastLabel: "Finish ✓"
    });
  }
  // VORTEX — Stutz Tool 7 (master-guide L295-311), Coming Alive / counters lethargy mode. When-to-use (verbatim): lethargy/flatness, mid-day crash, and above all TRANSITIONS between tasks (the unguarded window, L311). Restores the observer so labeling becomes possible. Twelve suns → rise → grow and expand → energy fills you.
  function vortex() {
    beatRunner({
      id: "vortex", title: "The Vortex", logTitle: "The Vortex", catK: "energy", color: "#ff8a3a", spark: 6, voiceProf: VPROF.breath,
      beats: [
        { lab: "Twelve suns around you", sub: "picture twelve suns arranged in a circle, surrounding you", orb: "" },
        { lab: "They begin to rise", sub: "slowly they lift around you", orb: "in" },
        { lab: "They grow and expand", sub: "they swell outward — feel the non-physical energy pour in and fill you", orb: "in" },
        { lab: "Carry it into the next thing", sub: "you're back online — move" }
      ], lastLabel: "Finish ✓"
    });
  }
  // SELF-HYPNOSIS — Blair eyes-open induction (fieldguide KB SN-141/SN-143): reading a hypnotic script aloud IS the induction. Sourced from David's KB, not invented. Body-scan → descent → reading-room → the SN-143 5-section suggestion template → emergence. Eyes-open: it READS the script (you read along / aloud). (TB-SELFHYPNOSIS)
  function selfHypnosis() {
    // SN-143 5-section suggestion template, instantiated with a calm, identity-neutral default goal ("steady, capable, at ease"). David can later swap in confidence/calm/sleep scripts; the SHELL + template are shippable now.
    var SUGG = [
      "Right now, in this relaxed state, your mind is open and receptive.", // 1. set the receptive frame
      "Picture yourself moving through your day steady, capable, and at ease.", // 2. the desired image (present-tense, vivid)
      "With every breath, that calm, capable feeling grows stronger and more natural.", // 3. compounding suggestion
      "This is simply who you are now — it needs no effort, it's already yours.", // 4. identity assumption (Murphy/Goddard)
      "And it stays with you, long after you open your eyes." // 5. post-hypnotic carry-over
    ];
    var BEATS = [
      { lab: "Eyes open, soft gaze", sub: "you don't need to close your eyes — just read along, slowly, in your mind or aloud" },
      { lab: "Let your body settle", sub: "shoulders drop… jaw unclenches… each breath a little slower", orb: "in" },
      { lab: "A quiet beach", sub: "picture a calm shore — warm light, the slow rhythm of the water", orb: "out" },
      { lab: "Down the steps… 10", sub: "ten… nine… eight… each number takes you deeper and calmer", orb: "out" },
      { lab: "…3, 2, 1", sub: "all the way down now, deeply relaxed, completely at ease", orb: "out" },
      { lab: "The reading room", sub: "a still, safe place inside — and here you read the words that take hold" },
      { lab: SUGG[0], sub: "read it slowly", orb: "" },
      { lab: SUGG[1], sub: "see it", orb: "" },
      { lab: SUGG[2], sub: "feel it grow", orb: "in" },
      { lab: SUGG[3], sub: "it's already true", orb: "" },
      { lab: SUGG[4], sub: "let it lock in", orb: "" },
      { lab: "Coming back up… 1", sub: "one… beginning to return", orb: "in" },
      { lab: "…4, 5 — eyes bright", sub: "fully back, calm and clear, carrying it with you", orb: "in" }
    ];
    beatRunner({ id: "selfhyp", title: "Self-Hypnosis", logTitle: "Self-Hypnosis", catK: "love", color: "#8a5cf0", spark: 8, voiceProf: VPROF.mantra, beats: BEATS, lastLabel: "Open eyes ✓" });
  }
  // PART-X TRIAGE (TB-PARTX-TRIAGE, full) — the in-the-moment front door, rendered as Stutz's Part-X attack-mode router. Enforces the ordering rule VERBATIM (master-guide L126-132): BODY first → Observer → Label "that's Part X" → Tool → Higher force. On an acute spike, a sub-60s physiological reset (breath) fires BEFORE any cognitive/identity tool — you can't reframe a dysregulated nervous system. Grateful Flow stays HARD-BLOCKED while a grievance is live (Active Love discharges it first, L119). The five attack modes route to the dedicated Coming-Alive runners: avoidance→Reversal, grievance→Active Love, post-win stall→Jeopardy, lethargy/transition→Vortex, urge-to-numb→Black Sun.
  function partXTriage(opts) {
    opts = opts || {};
    function regulateFirst() { // BODY first — sub-60s physiological reset before any cognitive/identity tool (Stutz ordering L126-132)
      var C = el("sheetBody"); C.innerHTML = ""; openSheet();
      add(C, "div", "sttl", "First — let's get the body back online");
      add(C, "div", "lbl", "one slow round of breath, then we name what's loud. the order matters — you can't reframe a wound-up nervous system (Stutz).");
      add(C, "div", "breathorb");
      add(C, "button", "done2", "Breathe with me ▶").onclick = function () { closeSheet(); breathwork(2, function () { setTimeout(label, 60); }); };
      var sk = add(C, "button", "add", "I'm already calm — skip to labeling"); sk.style.cssText = "display:block;margin:10px auto 0;"; sk.onclick = label;
    }
    function label() { // OBSERVER + LABEL — name the attack mode; "that's Part X, not you" is reward-never-shame at the mechanism level
      var C = el("sheetBody"); C.innerHTML = ""; openSheet();
      add(C, "div", "sttl", "Name it — that's the skill");
      add(C, "div", "lbl", "Part X is the part that pulls you off. It's not you. Which one's loud?");
      var live = haveLiveGrievance();
      // the five Stutz attack modes → each routes to its dedicated tool (TOOL step). Grateful Flow is never in this set; a live grievance forces Active Love.
      var MODES = [
        { chip: "Pulling me to numb out", line: "That's Part X — the pull to numb. Not you.", route: function () { closeSheet(); blackSun(); }, note: "fill the void from the inside, not the screen — Black Sun" },
        { chip: "Draining my drive", line: "That's Part X — lethargy. Not you.", route: function () { closeSheet(); vortex(); }, note: "lift the energy — twelve suns, the Vortex" },
        { chip: "Avoiding something", line: "That's Part X — avoidance. Not you.", route: function () { closeSheet(); reversalOfDesire(null); }, note: "move toward it — Reversal of Desire" },
        { chip: "Stalled right after a win", line: "That's Part X — the exoneration fantasy. Not you.", route: function () { closeSheet(); jeopardy(); }, note: "the work quietly stops after a win — Jeopardy snaps you back" },
        { chip: "Stuck on a hurt", line: "That's Part X — a hurt that hardened. Not you.", route: function () { closeSheet(); activeLove(); }, note: "discharge it for YOUR liberation — Active Love" }
      ];
      var wrap = add(C, "div"); wrap.style.cssText = "display:flex;flex-direction:column;gap:9px;margin-top:6px;";
      MODES.forEach(function (m) {
        var b = add(wrap, "button", "done2", m.chip); b.style.cssText = "text-align:left;";
        b.onclick = function () {
          var D = el("sheetBody"); D.innerHTML = ""; openSheet();
          add(D, "div", "sttl", m.line);
          add(D, "div", "lbl", m.note);
          add(D, "div", "breathorb");
          add(D, "button", "done2", "Use the tool ▶").onclick = m.route;
          var cl = add(D, "button", "add", "just naming it was enough"); cl.style.cssText = "display:block;margin:10px auto 0;"; cl.onclick = function () { closeSheet(); toast("you labeled it — that's the whole skill 🙏"); };
        };
      });
      if (live) { var note = add(C, "div", "lbl", "a grievance is still live — Grateful Flow stays parked until Active Love clears it. that's by design."); note.style.cssText = "margin-top:12px;opacity:.75;font-size:12px;"; }
    }
    if (opts.hot) regulateFirst(); else label(); // an acute spike (low mood OR live grievance) regulates first; a calm tap goes straight to labeling
  }
  function haveLiveGrievance() { // a running/recent drift log tagged angry, OR a PM reflection grievance signal — gates Grateful Flow (Active Love must discharge it first; here we route to breath until Active Love ships)
    var k = todayK(); var run = activeTimers();
    for (var i = 0; i < run.length; i++) if (domainOf(run[i]) === "drift") return true;
    var lg = logs(k) || []; for (var j = lg.length - 1; j >= 0 && j > lg.length - 4; j--) if (domainOf(lg[j]) === "drift") return true; // a very recent drift = a live grievance proxy
    return false;
  }
  function gratefulFlow(onDone) {
    // HARD GUARD (master-guide L119): Grateful Flow is blocked while a grievance is live — Active Love must discharge it first. Offer the redirect rather than running on top of an unresolved loop. (Bypassed when called as the bookend close via onDone, where the user explicitly chose the gratitude beat.)
    if (!onDone && typeof haveLiveGrievance === "function" && haveLiveGrievance()) {
      var GB = el("sheetBody"); GB.innerHTML = ""; openSheet();
      add(GB, "div", "sttl", "First, clear what's live");
      add(GB, "div", "lbl", "there's a grievance still running — gratitude won't land on top of it. Active Love discharges it first (for YOUR liberation, 60s), then gratitude lights up.");
      add(GB, "div", "breathorb");
      add(GB, "button", "done2", "💗 Active Love ▶").onclick = function () { closeSheet(); activeLove(); };
      var sk = add(GB, "button", "add", "do gratitude anyway"); sk.style.cssText = "display:block;margin:10px auto 0;"; sk.onclick = function () { gratefulFlow(function () { closeSheet(); renderAll(); }); }; // explicit override routes through the onDone branch (bypasses the guard)
      return;
    }
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
      add(B, "button", "done2", "Done 🙏").onclick = function () { var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: "Grateful Flow", mins: 5, catK: "love", color: "#ff4fa0" }); earn(12, { catK: "love" }); tickTool("grateful"); save(); if (onDone) onDone(); else { closeSheet(); renderAll(); } };
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
      onTask: function (t, picked, draw) { blocks(k).push(markFutureBlock({ id: uid(), time: cfg.time, mins: cfg.mins, title: t.title, prio: cfg.prio, color: t.color || prioC(cfg.prio), done: false }, k)); advance(); reflow(k); save(); draw(); },
      foot: function (B) { var list = add(B, "div"); list.style.marginTop = "10px"; blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { var r = add(list, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + b.mins)); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio))); add(ti, "span", null, b.title); var del = add(r, "div", "del", "✕"); del.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); planSheet(k, label); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; } });
  }

  // ---- timers ------------------------------------------------------------
  function startTimer(p) { var t = { id: uid(), title: p.title, catK: p.catK, emoji: p.emoji || "", habitId: p.habitId || null, color: p.color || "#8a5cf0", start: Date.now(), dayK: todayK() }; if (p.flow) t.flow = p.flow; if (p.commit != null) t.commit = p.commit; S.timers.push(t); save(); try { earn(2, { label: "awareness" }); } catch (e) {} } /* p.flow (optional) tags a guided-cockpit timer so stageModeFor can re-derive its stage on redraw (CKPT-2). earn(2) = Awareness tier (mirror, never pre-announced — points appear AFTER action as reflection). */
  function stopTimer(id) { var i = -1; S.timers.forEach(function (t, k) { if (t.id === id) i = k; }); if (i < 0) return; var t = S.timers[i]; if ((Date.now() - t.start) / 1000 < 15) { S.timers.splice(i, 1); save(); renderAll(); toast("⏱ too short — discarded"); return; } var dk = t.dayK || key(new Date(t.start)), mins = Math.max(1, Math.round((Date.now() - t.start) / 60000)), d = new Date(t.start); logs(dk).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: t.title, mins: mins, habitId: t.habitId, catK: t.catK, color: t.color }); if (t.habitId) doneMap(dk)[t.habitId] = true; if (isTidy(t)) S.lastTidy = dk; earn(mins, { catK: t.catK }); var opb = onPlanBlockFor(t, dk); if (opb) { /* do NOT mark opb.done — that forced the WHOLE block to read complete (gold full-width into the future). The pushed log already records the real span; matchedSpan/partial renders exactly what was covered, leaving the untracked remainder as ghost/future. Reward staying on-plan without predicting the future. (David 2026-06-27) */ var _obs = hm(opb.time), _obe = _obs + (opb.mins || 30), _covered = mins >= (_obe - _obs) - 5; var bonus = Math.max(12, Math.round(mins * 0.4)); earn(bonus, {}); if (_covered) { if (opb.plannedAhead) { /* planned-then-done (the big tier): block was planted before today → full celebrate + guardian mirror line */ try { celebrate((DOM[domainOf(t)] || DOM.focus).c, bumpStreak()); } catch (e) {} toast("✦ You planned it. You showed up. That's the game. +" + (bonus + 2) + " Spark"); try { earn(2, { label: "planned-then-done" }); } catch (e) {} } else { try { celebrate((DOM[domainOf(t)] || DOM.focus).c, bumpStreak()); } catch (e) {} toast("✨ completed your plan · +" + bonus + " Spark"); } } else { /* partial on-plan coverage — Tracking tier mirror (not pre-announced) */ if (mins >= 3 && !opb.plannedAhead) { try { earn(8, { label: "tracking" }); } catch (e) {} } toast("✓ on-plan stretch tracked · +" + bonus + " Spark"); } } else if (mins >= 3) { /* Tracking tier: any timer > 3 min with no matching plan block — quiet earn, mirror-only */ try { earn(8, { label: "tracking" }); } catch (e) {} } S.timers.splice(i, 1); save(); renderAll(); } // reward completing a PLANNED activity: light it gold + bonus Spark + a streak (David 2026-06-24 night) + Tracking tier earn(8) for any >3min timer (SCHEMA 3, mirror-not-price: points appear AFTER, never pre-announced)
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
    // START OVER (David 2026-07-02): wipe everything → fresh onboarding. Lives right under Back up so you're nudged to export first. Two-tap arm because it's irreversible.
    add(B, "div", "divlab").innerHTML = '<span><i class="ti ti-alert-triangle"></i> Start over</span>';
    var rl = add(B, "div", "lbl", "erase everything on this device and begin from zero. back up first — this can't be undone."); rl.style.cssText = "font-size:12px;color:#ff9a9a;line-height:1.4;";
    var rs = add(B, "button", "add"); rs.innerHTML = '<i class="ti ti-rotate-2"></i> Start over'; rs.style.cssText = "display:block;width:100%;color:#ff7a7a;border-color:#ff7a7a;";
    var armed = false, armT = null;
    rs.onclick = function () {
      if (!armed) { armed = true; rs.innerHTML = '<i class="ti ti-alert-triangle"></i> Tap again to erase EVERYTHING'; rs.style.background = "#5a1126"; rs.style.color = "#ffd6d6"; if (armT) clearTimeout(armT); armT = setTimeout(function () { armed = false; rs.innerHTML = '<i class="ti ti-rotate-2"></i> Start over'; rs.style.background = ""; rs.style.color = "#ff7a7a"; }, 4500); return; }
      if (armT) clearTimeout(armT);
      try { localStorage.removeItem(KEY); } catch (e) {}
      try { localStorage.clear(); } catch (e) {} // this PWA owns its origin → clear ALL keys = a true factory reset
      try { sessionStorage.clear(); } catch (e) {}
      location.replace("index.html?cb=" + Date.now()); // hard reload into a fresh app → onboarding from zero
    };
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
  // ===== JOURNAL-SURFACE (David 2026-06-28): a browse/history view — chronological feed of bk reflections + per-log notes, an 'on this day' resurfacing card, and the pattern-mirror at the top.
  // This surface MAY use #sheet (it's a read-only browse view, not a guided flow). Reuses the existing sheet chrome; adds no new menu system.
  function journalEntries() { // flatten S.bk reflections + per-log notes into a date-sorted feed (newest first)
    var out = [];
    Object.keys(S.bk || {}).forEach(function (k) {
      var rec = S.bk[k] || {};
      if (rec.pm && (rec.pm.reflect || rec.pm.mood != null)) out.push({ k: k, ts: rec.pm.ts || kd(k).getTime(), q: rec.pm.q || "", text: rec.pm.reflect || "", mood: (rec.pm.mood != null ? rec.pm.mood : null), kind: "pm" });
      (rec.journal || []).forEach(function (j) { out.push({ k: k, ts: j.ts || kd(k).getTime(), q: j.q || j.label || "", text: j.text || j.summary || "", mood: (j.mood != null ? j.mood : null), kind: "journal", jtype: j.type || null, jlabel: j.label || "", entries: j.entries || null }); });
    });
    Object.keys(S.log || {}).forEach(function (k) { (S.log[k] || []).forEach(function (l) { if (l.note && String(l.note).trim()) out.push({ k: k, ts: kd(k).getTime() + hm(l.time || "0:0") * 60000, q: l.title || "", text: l.note, mood: null, kind: "note" }); }); });
    out.sort(function (a, b) { return b.ts - a.ts; });
    return out;
  }
  function journalSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "📔 Journal");
    // PATTERN-MIRROR at the top — ONE gated, curious truth (or silent)
    var pat = pickPattern();
    if (pat) { var mc = add(B, "div", "lbl"); mc.innerHTML = '<i class="ti ti-sparkles" style="color:#ff8fd0;margin-right:5px"></i>' + esc(pat.line);
      mc.style.cssText = "background:#241328;border:2px solid #160510;border-left:3px solid #ff8fd0;border-radius:11px;padding:10px 12px;line-height:1.45;color:#e6cfe0;font-size:13px;margin-bottom:6px;"; }
    // ON THIS DAY — resurfacing strip (your entry 7 / 30 / 90 days ago)
    var byK = {}; journalEntries().forEach(function (e) { if (!byK[e.k]) byK[e.k] = e; });
    var resurf = [];
    [7, 30, 90, 365].forEach(function (n) { var ek = keyAdd(todayK(), -n); if (byK[ek]) resurf.push({ n: n, e: byK[ek] }); });
    if (resurf.length) {
      add(B, "div", "lbl", "🕰️ On this day").style.cssText = "margin-top:4px;color:#e6cfe0;font-size:13px;";
      resurf.forEach(function (r) { var card = add(B, "div", "logi"); card.style.cssText = "flex-direction:column;align-items:flex-start;gap:3px;background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 12px;margin-bottom:6px;cursor:pointer;";
        var head = (r.n === 365 ? "a year ago" : r.n + " days ago") + " · " + relLabel(r.e.k);
        add(card, "div", "lt", head).style.cssText = "color:#b89bb4;font-size:11px;";
        add(card, "div", "ln", (r.e.mood != null && MOODS[r.e.mood] ? MOODS[r.e.mood].e + "  " : "") + (r.e.text || r.e.q)).style.cssText = "font-size:14px;line-height:1.4;color:#ffe3f1;";
        card.onclick = function () { journalDaySheet(r.e.k); };
      });
    }
    // SEARCH + FEED
    var entries = journalEntries();
    if (!entries.length) { add(B, "div", "empty", "No reflections yet — your first one starts the thread."); return; }
    var si = document.createElement("input"); si.type = "text"; si.placeholder = "search reflections…"; si.style.cssText = "width:100%;margin:6px 0 8px;"; B.appendChild(si);
    var feed = add(B, "div", "jfeed");
    function draw() {
      feed.innerHTML = ""; var ql = si.value.trim().toLowerCase();
      var shown = entries.filter(function (e) { if (!ql) return true; var moodL = (e.mood != null && MOODS[e.mood]) ? MOODS[e.mood].l.toLowerCase() : ""; return (e.text + " " + e.q + " " + moodL).toLowerCase().indexOf(ql) >= 0; });
      if (!shown.length) { add(feed, "div", "empty", "Nothing matches that."); return; }
      shown.slice(0, 120).forEach(function (e) {
        var row = add(feed, "div", "logi"); row.style.cssText = "flex-direction:column;align-items:flex-start;gap:3px;background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 12px;margin-bottom:6px;cursor:pointer;";
        var tBadge = e.jtype ? (jtype(e.jtype).e + " " + (e.jlabel || jtype(e.jtype).label) + " · ") : ""; // JOURNALING 101: show the type up front
        var meta = tBadge + relLabel(e.k) + (!e.jtype && e.q ? " · " + e.q : "");
        add(row, "div", "lt", meta).style.cssText = "color:#b89bb4;font-size:11px;line-height:1.3;";
        add(row, "div", "ln", (e.mood != null && MOODS[e.mood] ? MOODS[e.mood].e + "  " : "") + (e.text || "(mood only)")).style.cssText = "font-size:14px;line-height:1.4;color:#ffe3f1;";
        row.onclick = function () { journalDaySheet(e.k); };
      });
    }
    si.oninput = draw; draw();
  }
  function journalDaySheet(k) { // tap an entry → reopen that day's full record (reflections + that day's notes)
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "📔 " + relLabel(k));
    var back = add(B, "button", "add", "← all entries"); back.style.cssText = "display:block;margin:0 0 8px;"; back.onclick = journalSheet;
    var rec = (S.bk || {})[k] || {}, any = false;
    if (rec.am && (rec.am.virtue || (rec.am.identity && rec.am.identity.length) || rec.am.why)) {
      any = true; add(B, "div", "lbl", "🌅 morning intention");
      var v = rec.am.virtue ? (VCLASS[rec.am.virtue] || rec.am.virtue) : "", line = [v, rec.am.why].filter(Boolean).join(" — ");
      add(B, "div", "logi", line || "set").style.cssText = "background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 12px;margin-bottom:6px;line-height:1.4;";
    }
    var refs = [];
    if (rec.pm && (rec.pm.reflect || rec.pm.mood != null) && !(rec.journal || []).some(function (j) { return j.text === rec.pm.reflect; })) refs.push({ q: rec.pm.q, text: rec.pm.reflect, mood: rec.pm.mood }); // skip a pm dup of a journal entry
    (rec.journal || []).forEach(function (j) { refs.push(j); });
    if (refs.length) { any = true; add(B, "div", "lbl", "🌙 reflections");
      refs.forEach(function (r) { var card = add(B, "div", "logi"); card.style.cssText = "flex-direction:column;align-items:flex-start;gap:4px;background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 12px;margin-bottom:6px;";
        if (r.type) { var th = add(card, "div", "lt"); th.innerHTML = jtype(r.type).e + " " + esc(r.label || jtype(r.type).label); th.style.cssText = "color:" + DOM.restore.light + ";font-size:11px;font-weight:600;line-height:1.3;"; }
        else if (r.q) add(card, "div", "lt", r.q).style.cssText = "color:#b89bb4;font-size:11px;line-height:1.3;";
        if (r.entries && r.entries.length) { // JOURNALING 101: render the structured beats (label: text)
          r.entries.forEach(function (en) { var ln = add(card, "div"); ln.style.cssText = "font-size:14px;line-height:1.45;color:#ffe3f1;"; ln.innerHTML = '<span style="color:#b89bb4;font-size:12px;">' + esc(en.label) + ':</span> ' + esc(en.text); });
          if (r.mood != null && MOODS[r.mood]) add(card, "div", null, MOODS[r.mood].e).style.cssText = "font-size:16px;";
        } else add(card, "div", "ln", (r.mood != null && MOODS[r.mood] ? MOODS[r.mood].e + "  " : "") + (r.text || r.summary || "(mood only)")).style.cssText = "font-size:14px;line-height:1.4;color:#ffe3f1;"; });
    }
    var notes = (logs(k) || []).filter(function (l) { return l.note && String(l.note).trim(); });
    if (notes.length) { any = true; add(B, "div", "lbl", "📝 notes"); notes.forEach(function (l) { var card = add(B, "div", "logi"); card.style.cssText = "flex-direction:column;align-items:flex-start;gap:3px;background:#1c0f20;border:2px solid #160510;border-radius:11px;padding:9px 12px;margin-bottom:6px;"; add(card, "div", "lt", (l.time || "") + " · " + (l.title || "")).style.cssText = "color:#b89bb4;font-size:11px;"; add(card, "div", "ln", l.note).style.cssText = "font-size:14px;line-height:1.4;color:#ffe3f1;"; }); }
    if (!any) add(B, "div", "empty", "Nothing written that day.");
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

  // ===== DEV / TEST HARNESS (David 2026-06-30) — fast full-workflow testing + headless drive (bypasses the cockpit drag-gesture). OFF unless ?dev in the URL or localStorage.alter_dev='1'. window.DEV mirrors every action for console/eval (lets the app be driven + screenshotted without a finger). =====
  function devOn() { try { if (/[?&]dev\b/.test(location.search)) localStorage.setItem("alter_dev", "1"); return localStorage.getItem("alter_dev") === "1"; } catch (e) { return false; } }
  function devOpenStage(mode) { mode = mode || "sleepmath"; if (!TF_OPEN) openTrackerFull(); TF_MODE_USERSET = true; enterStage(mode, { byTap: true }); return "stage:" + mode; }
  function devDemoProfile() { S.profile = S.profile || {}; var p = S.profile; p.gender = p.gender || "m"; p.age = p.age || "30s"; p.vibe = p.vibe || "thriving"; p.stages = (p.stages && p.stages.length) ? p.stages : ["founder"]; p.occ = p.occ || "founder"; p.goals = p.goals || []; p.wake = p.wake || "07:00"; p.sleep = p.sleep || "7-8"; if (p.lark == null) p.lark = true; if (p.lowStart == null) p.lowStart = false; p.todayIdentity = (p.todayIdentity && p.todayIdentity.length) ? p.todayIdentity : ["Creator"]; p.todayVirtues = (p.todayVirtues && p.todayVirtues.length) ? p.todayVirtues : ["zest"]; p.set = true; save(); try { renderAll(); } catch (e) {} return "demo profile set"; }
  function devGuided(on) { S.guide = S.guide || {}; S.guide.mode = on ? "guided" : "off"; save(); try { renderAll(); } catch (e) {} return "guided=" + S.guide.mode; }
  function devSeedDay() { try { fillTestDay(); return "seeded test day"; } catch (e) { return "fillTestDay missing: " + e.message; } }
  function devReonboard() { try { onboard(); } catch (e) {} return "re-onboarding"; }
  function devFreshUser() { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }
  window.DEV = { open: devOpenStage, stage: devOpenStage, demoProfile: devDemoProfile, seedDay: devSeedDay, guided: devGuided, reonboard: devReonboard, freshUser: devFreshUser, S: function () { return S; }, sf: function () { try { return sfNow(); } catch (e) { return e.message; } } };
  function devInit() { if (!devOn() || el("devBtn")) return; var b = document.createElement("button"); b.id = "devBtn"; b.textContent = "🛠"; b.setAttribute("style", "position:fixed;left:6px;top:calc(6px + env(safe-area-inset-top));z-index:99999;width:34px;height:34px;border-radius:9px;border:2px solid #b07aff;background:rgba(40,16,48,.92);color:#fff;font-size:16px;line-height:1;"); b.onclick = devMenu; document.body.appendChild(b); }
  function devMenu() { var ex = el("devSheet"); if (ex) { ex.remove(); return; }
    var s = document.createElement("div"); s.id = "devSheet"; s.setAttribute("style", "position:fixed;left:6px;top:46px;z-index:99999;display:flex;flex-direction:column;gap:6px;background:rgba(28,12,34,.98);border:2px solid #b07aff;border-radius:12px;padding:10px;max-width:66vw;max-height:80vh;overflow:auto;");
    var acts = [["👤 Demo profile (skip onboarding)", devDemoProfile], ["📅 Seed a full day", devSeedDay], ["☀️ Open: Morning", function () { devOpenStage("am"); }], ["🌙 Open: Reflection", function () { devOpenStage("pm"); }], ["🛏 Open: Sleep Math", function () { devOpenStage("sleepmath"); }], ["📋 Open: Daily Rx", function () { devOpenStage("rx"); }], ["🧰 Open: Toolbox", function () { devOpenStage("tool"); }], ["✍️ Open: Journal", function () { devOpenStage("journal"); }], ["🧭 Guided ON", function () { devGuided(true); }], ["🧭 Guided OFF", function () { devGuided(false); }], ["🔁 Re-run onboarding", devReonboard], ["💣 Fresh user (wipe)", devFreshUser]];
    acts.forEach(function (a) { var btn = document.createElement("button"); btn.textContent = a[0]; btn.setAttribute("style", "text-align:left;background:#3a2147;color:#fff;border:none;border-radius:8px;padding:9px 11px;font-size:13px;"); btn.onclick = function () { s.remove(); try { a[1](); } catch (e) {} }; s.appendChild(btn); });
    var cl = document.createElement("button"); cl.textContent = "✕ close"; cl.setAttribute("style", "background:#160510;color:#fff;border:none;border-radius:8px;padding:6px;font-size:12px;"); cl.onclick = function () { s.remove(); }; s.appendChild(cl);
    document.body.appendChild(s);
  }
  function init() {
    load(); loadFairy(); loadWorld(); treeFit(); requestAnimationFrame(treeLoop); guardianFit(); setupJoy(); setupJoy2(); setupZoom(); requestAnimationFrame(drawGuardian);
    try { devInit(); } catch (e) {}
    var tc = el("tree"); if (tc) tc.addEventListener("click", treeTap);
    window.addEventListener("resize", function () { treeFit(); guardianFit(); if (gameOn) worldFit(); });
    // (removed v640) The settle() overflow-toggle hack is GONE. Body scroll is now permanently locked in CSS (body{height:100vh;overflow:hidden}). Toggling overflow ''→hidden on every visualViewport 'scroll' + 7 timers was a reflow-thrash loop that FOUGHT the layout on every scroll — the "sometimes it fixes itself, lately nothing does" symptom. The real cause was min-height:100dvh (cold-start dvh under-reports + a scrollable body detaches the fixed bottom bars), fixed in index.html. (David 2026-07-02)
    var _lastMin = nowMin();
    setInterval(function () {
      S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); });
      var ce = document.querySelectorAll(".live-elapsed[data-tid]"); for (var ci = 0; ci < ce.length; ci++) { var ct = (S.timers || []).filter(function (x) { return x.id === ce[ci].getAttribute("data-tid"); })[0]; if (ct) ce[ci].textContent = elapsedStr(ct); }
      if (S.brk) { var _lcd = document.querySelector("#ldEl[data-brk]"); if (_lcd) { var _lbr = S.brk.start + S.brk.mins * 60000 - Date.now(); _lcd.textContent = fmtCD(Math.max(0, _lbr)); if (_lbr <= 0 && _lbr > -1500) renderLiveDock(); } } // live dock break countdown (flips the sub-line to "break's up" at 0)
      if (TF_OPEN) { var _tc = el("tfClock"); if (_tc) _tc.textContent = fmt(nowMin()).toUpperCase(); } // keep the tracker's wall-clock live
      if (TF_OPEN && S.brk) { var _be = S.brk.start + S.brk.mins * 60000, _br = _be - Date.now(), _tt = el("tfTime"); if (_tt) _tt.textContent = fmtCD(Math.max(0, _br)); if (_br <= 0 && _br > -1500) renderTrackerFull(); } // live break countdown + flip to "break's up" when it hits 0
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
    var gcv = el("guardian"); if (gcv) gcv.addEventListener("click", function () { characterCard(); }); // tap the mirror → your character card (David 2026-06-27)
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
    var jx = el("jpX"); if (jx) jx.onclick = closeJourney; // JOURNEY PATH close (David 2026-06-28)
    (function () { // swipe the card DOWN to dismiss — armed only when the card is scrolled to its top, so it never fights inner scrolling (David 2026-06-26)
      var scard = document.querySelector("#sheet .scard"); if (!scard) return; var sdOn = false, sdY = 0;
      scard.addEventListener("pointerdown", function (e) { sdOn = scard.scrollTop <= 1; sdY = e.clientY; if (sdOn) scard.style.transition = "none"; });
      scard.addEventListener("pointermove", function (e) { if (!sdOn) return; var dy = e.clientY - sdY; if (dy > 0 && scard.scrollTop <= 0) { scard.style.transform = "translateY(" + dy + "px)"; if (dy > 6) e.preventDefault(); } else if (dy < -2) { sdOn = false; scard.style.transition = ""; scard.style.transform = ""; } }, { passive: false });
      function sdEnd(e) { if (!sdOn) return; sdOn = false; var dy = (e.clientY || sdY) - sdY; scard.style.transition = ""; if (dy > 90) { closeSheet(); setTimeout(function () { scard.style.transform = ""; }, 260); } else scard.style.transform = ""; }
      scard.addEventListener("pointerup", sdEnd); scard.addEventListener("pointercancel", sdEnd);
    })();
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); }); document.addEventListener("dblclick", function (e) { e.preventDefault(); });
    document.querySelectorAll("#nav .nb").forEach(function (b) { if (!b.dataset.tab) return; b.onclick = function () { var t = b.dataset.tab; if (document.body.classList.contains("nav-collapsed")) { document.body.classList.remove("nav-collapsed"); _navLock = 1; setTimeout(function () { _navLock = 0; }, 650); if (t === "day") return; } document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === b); }); if (t === "self") { openGame(); return; } /* the plant/You tab IS the full island game now — no small preview, no menu step (David 2026-06-28) */ document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-" + t); }); document.body.classList.remove("tab-goals", "tab-day", "tab-self"); document.body.classList.add("tab-" + t); if (t === "day") { pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; buildPull(); revealTimeline(); } }; }); // tapping the collapsed Today pill EXPANDS the nav (Goals/You slide back, tracker lifts above); body.tab-* drives which screen the always-open timeline shows on (David 2026-06-24/26)
    (function () { var njb = el("navJourney"); if (njb) njb.onclick = function () { document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === njb); }); openJourney(); }; var jg = el("jpGoals"); if (jg) jg.onclick = function () { try { goalsSheet(); } catch (e) {} }; })(); // Journey = the home tab; its header target opens Goals (David 2026-06-29)
    (function () { // the journey's OWN bottom triple menu (Planner · Journey · Game) — the journey is home (David 2026-06-28)
      var p = el("jpnPlanner"); if (p) p.onclick = function () { closeJourney(); }; // Planner = the timeline underneath the journey
      var j = el("jpnJourney"); if (j) j.onclick = function () { drawJourney(true); }; // scroll back to now
      var g = el("jpnGame"); if (g) g.onclick = function () { closeJourney(); try { openGame(); } catch (e) {} }; // Game = the island/world
    })();
    initPaneCarousel(); // 3-PANE CAROUSEL (David 2026-06-30): one global finger-following slider across Planner | Journey | Game
    (function () { // the PERSISTENT bottom menu (#nav) is shared across all 3 panes — tapping a button switches panes cleanly (closes the others), matching the swipe. (Overrides the older per-tab handlers.)
      var pl = document.querySelector('#nav .nb[data-tab="day"]'); if (pl) pl.onclick = function () { if (document.body.classList.contains("nav-collapsed")) { document.body.classList.remove("nav-collapsed"); _navLock = 1; setTimeout(function () { _navLock = 0; }, 650); return; } if (curPaneName() !== "planner") setPaneRest("planner"); }; // FIX #1: when nav is collapsed, the Today-pill tap MUST re-expand it (the old per-tab handler did this but was overwritten by the carousel pane handler — David 2026-06-30)
      var jr = el("navJourney"); if (jr) jr.onclick = function () { if (curPaneName() !== "journey") setPaneRest("journey"); };
      var gm = document.querySelector('#nav .nb[data-tab="self"]'); if (gm) gm.onclick = function () { if (curPaneName() !== "game") setPaneRest("game"); };
    })();
    var ntk = el("navTrack"); if (ntk) ntk.onclick = nowSheet;
    (function () { var _pb = el("pullBody"); if (_pb) _pb.addEventListener("click", function (e) { if (e.target && e.target.closest && e.target.closest(".nowcirc,.nowread")) { try { openJourney(); } catch (err) {} } }); })(); // STEP 1 of the tracker merge (David 2026-06-29): tap the planner's now-line/readout → jump to the Journey at NOW (the one rich tracker). The planner shows what's live; the journey is where you run it.
    document.body.classList.add("tab-day"); pullK = todayK(); pullZoom = "day"; pendingScrollNow = true; revealTimeline(); // Today (the always-open rich timeline) is the home; body scroll locked by CSS (v640); portal-reveal it on cold launch (v648)
    renderAll();
    // 3-tab shell (v438): the original pull-down timeline IS the Today tab, always open; the strip + pull-gesture live only in the garden now.
    // ===== COCKPIT-AS-HOME LANDING (CKPT-7 / JX, David 2026-06-28): COLD-OPEN ONLY. With S.guide.mode==='off' (the DEFAULT) this whole block is skipped → app lands on the timeline exactly as before (the acceptance test = zero behavior change). When the dial is 'guided' AND today's node action isn't done, greet by opening the cockpit to the one-next-step. Wrapped in try so a journey-engine error can never block boot. =====
    try { if ((S.guide || {}).mode === "guided") journeyTick(); } catch (e) {}
    setTimeout(function () { try { openJourney(); } catch (e) {} }, 150); // JOURNEY IS HOME for EVERYONE (David 2026-07-02): always open the journey on boot. The start screen (below) sits ON TOP of it until you tap Continue.
    showStartScreen(); // v652: the animated launch screen gates the cold open; its primary button enters the app (or starts onboarding)
    if (!_ssShown && !(S.profile && S.profile.set)) setTimeout(onboard, 350); // fallback ONLY if the start screen didn't show
    try { i18nObserve(); if (curLang() !== "en") { translateTree(document.body); setTimeout(function () { translateTree(document.body); }, 400); } } catch (e) {} // v656: live translation (display-only; safe — app never reads rendered text)
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
