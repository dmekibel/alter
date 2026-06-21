/* ALTER v1.1 — gamified tile-drill picker, self-rated stat baselines (1–10),
   Toggl multitask timers, Streaks habits, auto-adjust priority schedule, proactive engine. $0. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_plan2";
  var DAY_END = 24 * 60;

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function key(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayK() { return key(new Date()); }
  function tomK() { var d = new Date(); d.setDate(d.getDate() + 1); return key(d); }
  function uid() { return "x" + Math.random().toString(36).slice(2, 8); }
  function nowMin() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function hm(t) { if (!t) return 0; var p = t.split(":"); return (+p[0]) * 60 + (+p[1]); }
  function fmt(min) { min = Math.round(min) % 1440; var h = Math.floor(min / 60), m = min % 60; var ap = h < 12 ? "am" : "pm"; h = h % 12 || 12; return h + ":" + pad(m) + ap; }
  function dur(m) { if (m < 60) return m + "m"; var h = Math.floor(m / 60), mm = m % 60; return h + "h" + (mm ? " " + mm + "m" : ""); }
  function daysSince(k) { if (!k) return 999; return Math.round((new Date(todayK() + "T00:00:00") - new Date(k + "T00:00:00")) / 86400000); }
  function lastDays(n) { var o = [], d = new Date(); for (var i = 0; i < n; i++) { o.push(key(d)); d.setDate(d.getDate() - 1); } return o; }

  var DEFAULT_HABITS = [{ id: "move", e: "🏃", l: "Move" }, { id: "deep", e: "🧠", l: "Deep work" }, { id: "tidy", e: "🧹", l: "Tidy space" }, { id: "read", e: "📖", l: "Read" }, { id: "breathe", e: "🌬️", l: "Breathe" }, { id: "send", e: "✦", l: "Ship one thing" }];
  var TIDY_SUB = ["Make the bed", "Clear the table", "Do laundry", "Sweep / vacuum", "Clear the desk", "Take out trash"];
  var DURS = [15, 30, 45, 60, 90, 120];
  var PRIOS = [{ v: 3, l: "Must", c: "#ff4fa0" }, { v: 2, l: "Should", c: "#8a5cf0" }, { v: 1, l: "Nice", c: "#b9b0cf" }];
  function prioC(v) { for (var i = 0; i < PRIOS.length; i++) if (PRIOS[i].v === v) return PRIOS[i].c; return "#8a5cf0"; }
  var CATS = [
    { k: "energy", label: "Energy", e: "⚡", color: "#ff8a1e", groups: [
      { g: "Fitness", tasks: [{ l: "Run", e: "🏃", id: "move" }, { l: "Gym", e: "🏋️", id: "move" }, { l: "Walk", e: "🚶" }, { l: "Yoga", e: "🧘" }, { l: "Stretch", e: "🤸" }, { l: "Cycle", e: "🚴" }, { l: "Swim", e: "🏊" }, { l: "Sports", e: "⚽" }, { l: "Hike", e: "🥾" }] },
      { g: "Body", tasks: [{ l: "Cold shower", e: "🧊" }, { l: "Shower", e: "🚿" }, { l: "Skincare", e: "🧴" }, { l: "Meditate", e: "🧘" }, { l: "Breathe", e: "🌬️", id: "breathe" }, { l: "Sauna", e: "♨️" }, { l: "Sun", e: "☀️" }] },
      { g: "Sleep", tasks: [{ l: "Sleep", e: "😴" }, { l: "Nap", e: "💤" }, { l: "Wind down", e: "🌙" }, { l: "Wake early", e: "⏰" }] },
      { g: "Food", tasks: [{ l: "Eat healthy", e: "🥗" }, { l: "Cook", e: "🍳" }, { l: "Hydrate", e: "💧" }, { l: "Vitamins", e: "💊" }, { l: "Protein", e: "🥩" }, { l: "Meal prep", e: "🍱" }] },
      { g: "Space", tasks: [{ l: "Tidy", e: "🧹", id: "tidy" }, { l: "Laundry", e: "🧺", id: "tidy" }, { l: "Dishes", e: "🍽️" }, { l: "Clean", e: "🧼", id: "tidy" }] }
    ] },
    { k: "work", label: "Work", e: "💼", color: "#2a9fe0", groups: [
      { g: "Focus", tasks: [{ l: "Deep work", e: "🧠", id: "deep" }, { l: "Programming", e: "💻", id: "deep" }, { l: "Writing", e: "✍️" }, { l: "Study", e: "📚" }, { l: "Research", e: "🔬" }] },
      { g: "Create", tasks: [{ l: "Midjourney", e: "🖼️" }, { l: "Design", e: "🎨" }, { l: "Video", e: "🎬" }, { l: "Music prod", e: "🎚️" }, { l: "Content", e: "📲" }] },
      { g: "Admin", tasks: [{ l: "Email", e: "📧" }, { l: "Meetings", e: "👥" }, { l: "Calls", e: "📞" }, { l: "Planning", e: "🗒️" }, { l: "Errands", e: "🧾" }] },
      { g: "Money", tasks: [{ l: "Budget", e: "💵" }, { l: "Invoice", e: "🧾" }, { l: "Sell", e: "📈" }, { l: "Apply", e: "📨" }, { l: "Side hustle", e: "💰" }] },
      { g: "Ship", tasks: [{ l: "Ship / send", e: "✦", id: "send" }, { l: "Publish", e: "🚀" }, { l: "Outreach", e: "🤝" }] }
    ] },
    { k: "love", label: "Love", e: "❤️", color: "#ff4fa0", groups: [
      { g: "People", tasks: [{ l: "Partner", e: "💑" }, { l: "Family", e: "👨‍👩‍👧" }, { l: "Friends", e: "🧑‍🤝‍🧑" }, { l: "Call", e: "📞" }, { l: "Date", e: "💕" }, { l: "Text back", e: "💬" }] },
      { g: "Self-love", tasks: [{ l: "Journal", e: "📓" }, { l: "Gratitude", e: "🙏" }, { l: "Therapy", e: "🛋️" }, { l: "Affirmations", e: "🪞" }, { l: "Reflect", e: "🌙" }] },
      { g: "Give", tasks: [{ l: "Help", e: "🤲" }, { l: "Quality time", e: "⏳" }, { l: "Hug", e: "🫂" }, { l: "Compliment", e: "💐" }] }
    ] },
    { k: "hobby", label: "Hobbies", e: "🎈", color: "#9a5cf0", groups: [
      { g: "Music", tasks: [{ l: "Guitar", e: "🎸" }, { l: "Piano", e: "🎹" }, { l: "Sing", e: "🎤" }, { l: "Make music", e: "🎼" }, { l: "Listen", e: "🎧" }] },
      { g: "Art", tasks: [{ l: "Draw", e: "✏️" }, { l: "Paint", e: "🖌️" }, { l: "Photo", e: "📷" }, { l: "Craft", e: "🧵" }] },
      { g: "Play", tasks: [{ l: "Games", e: "🕹️" }, { l: "Board games", e: "🎲" }, { l: "Puzzle", e: "🧩" }, { l: "Watch", e: "📺" }] },
      { g: "Mind", tasks: [{ l: "Read", e: "📖", id: "read" }, { l: "Language", e: "🗣️" }, { l: "Podcast", e: "🎙️" }, { l: "Chess", e: "♟️" }] },
      { g: "Outdoors", tasks: [{ l: "Nature", e: "🌲" }, { l: "Garden", e: "🌱" }, { l: "Travel", e: "✈️" }, { l: "Explore", e: "🗺️" }] }
    ] },
    { k: "vice", label: "Vices", e: "💀", color: "#ff4d4d", groups: [
      { g: "Digital", tasks: [{ l: "Instagram", e: "📱" }, { l: "TikTok", e: "📲" }, { l: "Scrolling", e: "📰" }, { l: "YouTube", e: "▶️" }, { l: "Doomscroll", e: "😵" }, { l: "Porn", e: "🔞" }] },
      { g: "Substance", tasks: [{ l: "Weed", e: "🌿" }, { l: "Cigarettes", e: "🚬" }, { l: "Vape", e: "💨" }, { l: "Alcohol", e: "🍷" }, { l: "Caffeine", e: "☕" }] },
      { g: "Other", tasks: [{ l: "Sugar", e: "🍬" }, { l: "Junk food", e: "🍔" }, { l: "Shopping", e: "🛍️" }, { l: "Gambling", e: "🎰" }, { l: "Procrastinate", e: "🐌" }] }
    ] }
  ];
  var TITLE2CAT = {}, TITLE2META = {};
  CATS.forEach(function (c) { c.groups.forEach(function (g) { g.tasks.forEach(function (t) { TITLE2CAT[t.l.toLowerCase()] = c.k; TITLE2META[t.l.toLowerCase()] = { title: t.l, catK: c.k, emoji: t.e, color: c.color, habitId: t.id || null }; }); }); });
  var HABIT2CAT = { move: "energy", breathe: "energy", tidy: "energy", deep: "work", send: "work", read: "hobby" };
  var STATDEF = [{ k: "vit", e: "💪", l: "Vitality", c: "#ff8a1e", q: "how in-shape do you feel?" }, { k: "craft", e: "🛠️", l: "Craft", c: "#2a9fe0", q: "how productive / on-craft?" }, { k: "heart", e: "❤️", l: "Heart", c: "#ff4fa0", q: "how connected to people?" }, { k: "spark", e: "✨", l: "Spark", c: "#9a5cf0", q: "how alive / playful?" }, { k: "order", e: "🧹", l: "Order", c: "#23c98a", q: "how in-order is your space/life?" }];

  var S;
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null, timers: [], baseline: null }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function blocks(k) { return (S.blocks[k] = S.blocks[k] || []); }
  function logs(k) { return (S.log[k] = S.log[k] || []); }
  function doneMap(k) { return (S.habitDone[k] = S.habitDone[k] || {}); }
  function phase() { var h = new Date().getHours(); return h < 5 ? "night" : h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function undone() { var dm = doneMap(todayK()); return S.habits.filter(function (h) { return !dm[h.id]; }); }
  function messy() { return daysSince(S.lastTidy) >= 2; }
  function streak(id) { var d = new Date(); if (!(S.habitDone[key(d)] || {})[id]) d.setDate(d.getDate() - 1); var n = 0; for (;;) { if ((S.habitDone[key(d)] || {})[id]) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }

  // ---- stats (baseline self-rating + behavior) ---------------------------
  function catOf(e) { return e.catK || TITLE2CAT[(e.title || "").toLowerCase()] || (e.habitId ? HABIT2CAT[e.habitId] : null); }
  function isTidy(e) { return e.habitId === "tidy" || /tidy|laundry|bed|table|desk|trash|vacuum|sweep|clean|dishes/i.test(e.title || ""); }
  function habitCount(id, days) { var n = 0; days.forEach(function (k) { if ((S.habitDone[k] || {})[id]) n++; }); return n; }
  function stats() {
    var d14 = lastDays(14), m = { energy: 0, work: 0, love: 0, hobby: 0, vice: 0 }, tidyMin = 0;
    d14.forEach(function (k) { logs(k).forEach(function (e) { var c = catOf(e); if (c && m[c] != null) m[c] += e.mins || 0; if (isTidy(e)) tidyMin += e.mins || 0; }); });
    var xp = { vit: m.energy + habitCount("move", d14) * 15 + habitCount("breathe", d14) * 8, craft: m.work + habitCount("deep", d14) * 15 + habitCount("send", d14) * 25, heart: m.love, spark: m.hobby + habitCount("read", d14) * 10, order: tidyMin + habitCount("tidy", d14) * 25 };
    var base = S.baseline || {};
    var out = STATDEF.map(function (s) { var b = base[s.k] || 1, x = xp[s.k] || 0, lv = b + Math.floor(x / 120), pct = Math.round((x % 120) / 120 * 100); var o = { k: s.k, e: s.e, l: s.l, c: s.c, lv: lv, pct: pct }; if (s.k === "order" && messy()) o.note = daysSince(S.lastTidy) > 6 ? "messy" : "untidy"; return o; });
    var d7 = lastDays(7), vm = {};
    d7.forEach(function (k) { logs(k).forEach(function (e) { if (catOf(e) === "vice") vm[e.title] = (vm[e.title] || 0) + (e.mins || 0); }); });
    var pulls = Object.keys(vm).map(function (t) { var min = vm[t], r = min < 30 ? { l: "light", e: "😌", c: "#23c98a" } : min < 150 ? { l: "moderate", e: "😬", c: "#ff9f1c" } : { l: "strong", e: "🔴", c: "#ff4d4d" }; return { title: t, min: min, rate: r }; }).sort(function (a, b) { return b.min - a.min; });
    return { list: out, pulls: pulls, level: Math.floor(out.reduce(function (a, s) { return a + s.lv; }, 0) / out.length) };
  }

  function frequent(n) {
    var cnt = {}; lastDays(30).forEach(function (k) { logs(k).forEach(function (e) { if (catOf(e) !== "vice") cnt[e.title] = (cnt[e.title] || 0) + 1; }); });
    blocks(todayK()).concat(blocks(tomK())).forEach(function (b) { cnt[b.title] = (cnt[b.title] || 0) + 1; });
    var out = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; }).map(function (t) { return TITLE2META[t.toLowerCase()] || { title: t, catK: TITLE2CAT[t.toLowerCase()] || "work", emoji: "", color: "#8a5cf0", habitId: null }; });
    ["Deep work", "Run", "Eat healthy", "Read", "Tidy", "Guitar", "Meditate", "Programming"].forEach(function (t) { if (out.length < n && !cnt[t]) { var mtt = TITLE2META[t.toLowerCase()]; if (mtt) out.push(mtt); } });
    return out.slice(0, n);
  }

  // ---- schedule ----------------------------------------------------------
  function schedule(k) {
    var pend = blocks(k).filter(function (b) { return !b.done; }).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    function fit(list) { var cur = nowMin(), out = []; list.forEach(function (b) { var st = Math.max(cur, hm(b.time)); out.push({ b: b, st: st }); cur = st + (b.mins || 30); }); return { sched: out, end: cur }; }
    var active = pend.slice(), bumped = [], r = fit(active);
    while (r.end > DAY_END && active.length) { var lp = 99, idx = 0; for (var i = 0; i < active.length; i++) { var pr = active[i].prio || 2; if (pr < lp) { lp = pr; idx = i; } else if (pr === lp && hm(active[i].time) >= hm(active[idx].time)) idx = i; } bumped.push(active.splice(idx, 1)[0]); r = fit(active); }
    return { sched: r.sched, bumped: bumped, over: Math.max(0, r.end - DAY_END) };
  }

  function proactive() {
    var p = phase(), und = undone(), sc = schedule(todayK()), out = { chips: [] };
    if (sc.bumped.length) { out.kicker = "running tight"; out.line = "Over by " + dur(sc.over) + " today."; out.sub = "I bumped " + sc.bumped.length + " low-priority " + (sc.bumped.length === 1 ? "slot" : "slots") + " so what matters survives."; out.primary = { label: "Review today", fn: function () { window.scrollTo({ top: 280, behavior: "smooth" }); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); return out; }
    if (p === "night") { out.kicker = "tonight"; out.line = "It's " + fmt(nowMin()) + " — set tomorrow up."; out.sub = "five minutes now and the morning runs itself."; out.primary = { label: "Plan tomorrow ✨", fn: function () { planSheet(tomK(), "tomorrow"); } }; out.chips.push({ label: "Plan rest of tonight", fn: function () { planSheet(todayK(), "tonight"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else if (p === "morning") { out.kicker = "this morning"; out.line = "Good morning — block out today?"; out.sub = und.length + " habits waiting · " + (blocks(todayK()).length ? blocks(todayK()).length + " slots set" : "nothing scheduled"); out.primary = { label: "Plan your day ☀️", fn: function () { planSheet(todayK(), "today"); } }; if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else { if (!blocks(todayK()).length) { out.kicker = p; out.line = "No plan yet — shape the day."; out.sub = "block your next few hours."; out.primary = { label: "Plan the day 🎯", fn: function () { planSheet(todayK(), "today"); } }; } else if (und.length) { out.kicker = p; out.line = und.length + (und.length === 1 ? " habit left." : " habits left."); out.sub = "knock one out while you've got momentum."; out.primary = { label: "What are you doing?", fn: nowSheet }; } else { out.kicker = p; out.line = "On track. Nice."; out.sub = "get ahead on tomorrow?"; out.primary = { label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }; } if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    return out;
  }

  // ---- ui helpers --------------------------------------------------------
  function add(p, tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; p.appendChild(e); return e; }
  function dot(c) { var s = document.createElement("span"); s.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + c; return s; }
  function bigCat(c) { var d = document.createElement("div"); d.className = "bigcat"; d.style.background = c.color; d.innerHTML = '<div class="bce">' + c.e + '</div><div class="bcl">' + c.label + "</div>"; return d; }
  function subCard(c, gr) { var d = document.createElement("div"); d.className = "subcat"; d.style.borderColor = c.color; d.innerHTML = '<div class="bce">' + (gr.tasks[0].e || "•") + '</div><div class="scl">' + gr.g + "</div>"; return d; }
  function taskTile(parent, meta, selected, onClick) { var x = add(parent, "div", "gtile" + (selected ? " on" : "")); x.style.borderColor = meta.color; if (selected) x.style.background = meta.color; add(x, "div", "ge", meta.emoji || "•"); add(x, "div", "gl", meta.title); x.onclick = onClick; return x; }

  function renderHeader() { el("date").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); var p = phase(); el("hello").textContent = (p === "morning" ? "Good morning" : p === "afternoon" ? "Good afternoon" : p === "evening" ? "Good evening" : "Hey") + " 👋"; }
  function renderHero() { var pr = proactive(), h = el("hero"); h.innerHTML = ""; add(h, "div", "ht", pr.kicker); add(h, "div", "hl", pr.line); add(h, "div", "hs", pr.sub); add(h, "button", "hp", pr.primary.label).onclick = pr.primary.fn; if (pr.chips.length) { var c = add(h, "div", "chips"); pr.chips.forEach(function (ch) { add(c, "div", "chip", ch.label).onclick = ch.fn; }); } }

  function renderStats() {
    var L = el("statList"); L.innerHTML = "";
    if (!S.baseline) { el("statLvl").textContent = ""; el("pullLab").style.display = "none"; el("pullList").innerHTML = ""; var b = add(L, "button", "done2", "Rate yourself to set your levels →"); b.style.marginTop = "2px"; b.onclick = rateSheet; return; }
    var st = stats(); el("statLvl").textContent = "Lv " + st.level;
    st.list.forEach(function (s) { var r = add(L, "div", "statrow"); add(r, "div", "se", s.e); add(r, "div", "sn", s.l); var bw = add(r, "div", "sb"); var bar = add(bw, "div", "bar"); add(bar, "i").style.cssText = "width:" + Math.max(6, s.pct) + "%;height:100%;background:" + s.c; add(r, "div", "sl", "Lv " + s.lv + (s.note ? " · " + s.note : "")); });
    var re = add(L, "button", "add", "re-rate"); re.style.marginTop = "6px"; re.onclick = rateSheet;
    var pl = el("pullList"), lab = el("pullLab"); pl.innerHTML = "";
    if (st.pulls.length) { lab.style.display = "flex"; st.pulls.forEach(function (v) { var r = add(pl, "div", "pull"); r.appendChild(dot(v.rate.c)); add(r, "div", null, v.rate.e + " " + v.title).style.flex = "1"; var t = add(r, "div", null, v.rate.l + " · " + dur(v.min) + "/wk"); t.style.cssText = "font-family:var(--bub);font-weight:800;font-size:13px;color:" + v.rate.c; }); } else lab.style.display = "none";
  }

  function renderToday() {
    var L = el("todayList"); L.innerHTML = ""; var k = todayK();
    var doneB = blocks(k).filter(function (b) { return b.done; }).sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var sc = schedule(k);
    if (!blocks(k).length) add(L, "div", "empty", "No slots yet. Tap “+ slot” to block your time.");
    doneB.forEach(function (b) { row(b, hm(b.time), true, false); });
    sc.sched.forEach(function (o) { row(o.b, o.st, false, Math.abs(o.st - hm(o.b.time)) > 1); });
    sc.bumped.forEach(function (b) { var r = add(L, "div", "blk"); r.style.opacity = ".55"; add(r, "div", "tm", "bumped"); add(r, "div", "ti", b.title).style.textDecoration = "line-through"; var mv = add(r, "div", "del", "→ tmrw"); mv.style.cssText = "color:var(--purple);font-size:12px;font-weight:800;"; mv.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); blocks(tomK()).push(b); save(); renderAll(); }; });
    function row(b, st, done, moved) { var r = add(L, "div", "blk" + (done ? " done" : "")); add(r, "div", "tm", fmt(st) + "–" + fmt(st + (b.mins || 30))); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio || 2))); add(ti, "span", null, b.title + (moved ? " ⤵" : "")); var ck = add(r, "div", "ck" + (done ? " on" : ""), done ? "✓" : ""); ck.onclick = function () { b.done = !b.done; save(); renderAll(); }; var d = add(r, "div", "del", "✕"); d.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); renderAll(); }; }
    var LG = el("logList"); LG.innerHTML = ""; var lg = logs(k).slice().sort(function (a, b) { return hm(b.time) - hm(a.time); }), tot = 0;
    logs(k).forEach(function (e) { tot += e.mins || 0; });
    if (!lg.length) add(LG, "div", "empty", "Nothing tracked yet — hit the timer.");
    lg.forEach(function (e) { var r = add(LG, "div", "logi"); if (e.color) r.appendChild(dot(e.color)); add(r, "div", "lt", fmt(hm(e.time))); add(r, "div", "ln", e.title); add(r, "div", "lm", dur(e.mins || 0)); });
    el("trackTotal").textContent = tot ? dur(tot) : "";
  }
  function renderTom() { var L = el("tomList"); L.innerHTML = ""; var arr = blocks(tomK()).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }); if (!arr.length) { add(L, "div", "empty", "Plan tomorrow tonight — future-you says thanks."); return; } arr.forEach(function (b) { var r = add(L, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + (b.mins || 30))); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio || 2))); add(ti, "span", null, b.title); var d = add(r, "div", "del", "✕"); d.onclick = function () { var a = blocks(tomK()); a.splice(a.indexOf(b), 1); save(); renderTom(); }; }); }
  function renderHabits() { var L = el("habitList"); L.innerHTML = ""; var dm = doneMap(todayK()), done = 0; S.habits.forEach(function (hb) { var on = !!dm[hb.id]; if (on) done++; var r = add(L, "div", "hab" + (on ? " done" : "")); add(r, "div", "he", hb.e); add(r, "div", "hn", hb.l); var sk = streak(hb.id); if (sk > 1) { var s = add(r, "div", null, "🔥 " + sk); s.style.cssText = "font-family:var(--bub);font-size:13px;color:#e0791c;font-weight:800;margin-right:2px;"; } add(r, "div", "ck" + (on ? " on" : ""), on ? "✓" : ""); r.onclick = function () { toggleHabit(hb.id); }; }); el("habitProg").textContent = done + "/" + S.habits.length; }
  function toggleHabit(id) { var dm = doneMap(todayK()); dm[id] = !dm[id]; if (id === "tidy" && dm[id]) S.lastTidy = todayK(); save(); renderHabits(); renderHero(); renderStats(); }

  function renderAll() { renderHeader(); renderNow(); renderHero(); renderStats(); renderToday(); renderTom(); renderHabits(); }

  // ---- gamified picker (used by timers + plan) ---------------------------
  function pickerSheet(opts) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    var picked = {}, view = { cat: null, group: null };
    function count() { return Object.keys(picked).length; }
    function draw() {
      B.innerHTML = "";
      add(B, "div", "sttl", opts.title(count()));
      if (opts.head) opts.head(B, draw);
      if (view.cat == null) {
        if (opts.frequent) { var fr = frequent(6); if (fr.length) { add(B, "div", "lbl", "⭐ frequent"); var fg = add(B, "div", "tilegrid"); fr.forEach(function (t) { var ky = t.catK + "|" + t.title; taskTile(fg, t, !!picked[ky], function () { opts.onTask(t, picked, draw); }); }); } }
        add(B, "div", "lbl", "pick a category"); var cg = add(B, "div", "catgrid"); CATS.forEach(function (c) { var card = bigCat(c); card.onclick = function () { view.cat = c; view.group = null; draw(); }; cg.appendChild(card); });
        if (opts.custom) { var cf = add(B, "div", "frm"); var ct = document.createElement("input"); ct.type = "text"; ct.placeholder = "…or type a task"; cf.appendChild(ct); var go = add(cf, "button", "go", "+"); go.onclick = function () { var v = ct.value.trim(); if (v) opts.onTask({ title: v, catK: "work", emoji: "", color: "#8a5cf0", habitId: null }, picked, draw); }; }
      } else if (view.group == null) {
        var bk = add(B, "button", "add", "← categories"); bk.style.marginBottom = "10px"; bk.onclick = function () { view.cat = null; draw(); };
        add(B, "div", "lbl", view.cat.e + " " + view.cat.label); var sg = add(B, "div", "catgrid"); view.cat.groups.forEach(function (gr) { var card = subCard(view.cat, gr); card.onclick = function () { view.group = gr; draw(); }; sg.appendChild(card); });
      } else {
        var bk2 = add(B, "button", "add", "← " + view.cat.label); bk2.style.marginBottom = "10px"; bk2.onclick = function () { view.group = null; draw(); };
        add(B, "div", "lbl", view.group.g); var tg = add(B, "div", "tilegrid"); view.group.tasks.forEach(function (t) { var meta = { title: t.l, catK: view.cat.k, emoji: t.e, color: view.cat.color, habitId: t.id || null }; var ky = meta.catK + "|" + meta.title; taskTile(tg, meta, !!picked[ky], function () { opts.onTask(meta, picked, draw); }); });
      }
      if (opts.foot) opts.foot(B, picked, count());
    }
    draw();
  }

  function nowSheet() {
    pickerSheet({
      title: function (n) { return n ? "Start " + n + (n === 1 ? " timer" : " timers") + " ⏱️" : "What are you doing? ⏱️"; },
      frequent: true, custom: true,
      onTask: function (t, picked, draw) { var ky = t.catK + "|" + t.title; if (picked[ky]) delete picked[ky]; else picked[ky] = t; draw(); },
      foot: function (B, picked, n) { if (n) add(B, "button", "done2", "Start " + n + " ▶").onclick = function () { Object.keys(picked).forEach(function (k) { startTimer(picked[k]); }); closeSheet(); renderNow(); }; }
    });
  }

  function planSheet(k, label) {
    var cfg = { mins: 60, prio: 2 }; var d = new Date(); d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0); cfg.time = pad(d.getHours()) + ":" + pad(d.getMinutes());
    function advance() { var m = hm(cfg.time) + cfg.mins; if (m >= 1439) m = 1439; cfg.time = pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    pickerSheet({
      title: function () { return "Plan " + label; }, frequent: true, custom: true,
      head: function (B, draw) {
        var frm = add(B, "div", "frm"); var time = document.createElement("input"); time.type = "time"; time.value = cfg.time; time.onchange = function () { cfg.time = time.value; }; frm.appendChild(time); var dl = document.createElement("span"); dl.style.cssText = "align-self:center;font-weight:800;font-family:var(--bub);"; dl.textContent = "• " + dur(cfg.mins); frm.appendChild(dl);
        add(B, "div", "lbl", "duration"); var c2 = add(B, "div", "pchips"); DURS.forEach(function (m) { var x = add(c2, "div", "pchip" + (m === cfg.mins ? " on" : ""), m < 60 ? m + "m" : (m / 60) + "h"); x.onclick = function () { cfg.mins = m; draw(); }; });
        add(B, "div", "lbl", "priority — lowest gets dropped if you run out of time"); var c3 = add(B, "div", "pchips"); PRIOS.forEach(function (p) { var x = add(c3, "div", "pchip" + (p.v === cfg.prio ? " on" : ""), p.l); x.onclick = function () { cfg.prio = p.v; draw(); }; });
        add(B, "div", "lbl", "tap to drop it at " + fmt(hm(cfg.time)) + " — they stack back-to-back");
      },
      onTask: function (t, picked, draw) { blocks(k).push({ id: uid(), time: cfg.time, mins: cfg.mins, title: t.title, prio: cfg.prio, done: false }); advance(); save(); draw(); },
      foot: function (B) {
        var list = add(B, "div"); list.style.marginTop = "10px";
        blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { var r = add(list, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + b.mins)); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio))); add(ti, "span", null, b.title); var del = add(r, "div", "del", "✕"); del.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); planSheet(k, label); }; });
        add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); };
      }
    });
  }

  // ---- timers ------------------------------------------------------------
  function startTimer(p) { S.timers.push({ id: uid(), title: p.title, catK: p.catK, emoji: p.emoji || "", habitId: p.habitId || null, color: p.color || "#8a5cf0", start: Date.now() }); save(); }
  function stopTimer(id) { var i = -1; S.timers.forEach(function (t, k) { if (t.id === id) i = k; }); if (i < 0) return; var t = S.timers[i], mins = Math.max(1, Math.round((Date.now() - t.start) / 60000)), d = new Date(t.start); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: t.title, mins: mins, habitId: t.habitId, catK: t.catK, color: t.color }); if (t.habitId) doneMap(todayK())[t.habitId] = true; if (isTidy(t)) S.lastTidy = todayK(); S.timers.splice(i, 1); save(); renderAll(); }
  function elapsedStr(t) { var s = Math.floor((Date.now() - t.start) / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ":" + pad(m) : m) + ":" + pad(ss); }
  function renderNow() {
    var C = el("nowCard"); C.innerHTML = "";
    if (S.timers.length) { add(C, "div", "nl", "▶ Tracking now (" + S.timers.length + ")"); S.timers.forEach(function (t) { var r = add(C, "div", "blk"); r.style.marginBottom = "8px"; r.appendChild(dot(t.color)); add(r, "div", "ti", (t.emoji ? t.emoji + " " : "") + t.title); var rd = add(r, "div"); rd.id = "tr_" + t.id; rd.style.cssText = "font-family:var(--bub);font-weight:800;font-size:17px;color:#c47a00;margin-right:4px;"; rd.textContent = elapsedStr(t); var stp = add(r, "div", "del", "⏹"); stp.style.cssText = "font-size:20px;cursor:pointer;color:var(--ink);"; stp.onclick = function () { stopTimer(t.id); }; }); add(C, "button", null, "+ add activity").id = "nowBtn"; el("nowBtn").onclick = nowSheet; }
    else { add(C, "div", "nl", "⏱️ Right now"); add(C, "div", "ns", "tap to start a timer — stack several if you're multitasking."); var bb = add(C, "button", null, "What are you doing?"); bb.id = "nowBtn"; bb.onclick = nowSheet; }
  }

  // ---- other sheets ------------------------------------------------------
  function openSheet() { el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }
  function rateSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Rate yourself (1–10)"); add(B, "div", "lbl", "honest gut-check — this sets your starting levels");
    var vals = {}; STATDEF.forEach(function (s) { vals[s.k] = (S.baseline && S.baseline[s.k]) || 5; var r = add(B, "div", "rate"); add(r, "div", "re", s.e); add(r, "div", "rn", s.l); var sl = document.createElement("input"); sl.type = "range"; sl.min = 1; sl.max = 10; sl.step = 1; sl.value = vals[s.k]; var rv = add(r, "div", "rv", vals[s.k]); sl.oninput = function () { vals[s.k] = +sl.value; rv.textContent = sl.value; }; r.insertBefore(sl, rv); });
    add(B, "button", "done2", "Set my levels ✨").onclick = function () { S.baseline = vals; save(); closeSheet(); renderStats(); };
  }
  function tidySheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Tidy up — one step at a time"); var picked = {}; TIDY_SUB.forEach(function (lbl, i) { var r = add(B, "div", "subi"); var ck = add(r, "div", "ck"); add(r, "div", null, lbl).style.flex = "1"; r.onclick = function () { if (picked[i]) return; picked[i] = true; ck.className = "ck on"; ck.textContent = "✓"; S.lastTidy = todayK(); doneMap(todayK()).tidy = true; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: lbl, mins: 10, habitId: "tidy", catK: "energy", color: "#ff8a1e" }); save(); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; }
  function habitSheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Add a habit"); var frm = add(B, "div", "frm"); var emo = document.createElement("input"); emo.type = "text"; emo.value = "⭐"; emo.style.cssText = "width:64px;text-align:center;"; var txt = document.createElement("input"); txt.type = "text"; txt.placeholder = "e.g. Meditate, Guitar, No scrolling…"; frm.appendChild(emo); frm.appendChild(txt); add(B, "button", "done2", "Add habit").onclick = function () { var v = txt.value.trim(); if (!v) return; S.habits.push({ id: uid(), e: (emo.value || "⭐").slice(0, 2), l: v }); save(); closeSheet(); renderHabits(); }; }

  function init() {
    load();
    setInterval(function () { S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); }); }, 1000);
    el("planToday").onclick = function () { planSheet(todayK(), phase() === "night" ? "tonight" : "today"); };
    el("planTom").onclick = function () { planSheet(tomK(), "tomorrow"); };
    el("addHabit").onclick = habitSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
