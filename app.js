/* ALTER v1.3 — RPG character: sub-attribute self-assessment + pixel avatar,
   gamified picker, Toggl multitask timers, Streaks habits, auto-adjust schedule, proactive. $0. */
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

  var DEFAULT_HABITS = [{ id: "move", e: "🏃", l: "Move", type: "build", per: 0, color: "#ff8a1e" }, { id: "deep", e: "🧠", l: "Deep work", type: "build", per: 0, color: "#2a9fe0" }, { id: "tidy", e: "🧹", l: "Tidy space", type: "build", per: 0, color: "#ff8a1e" }, { id: "read", e: "📖", l: "Read", type: "build", per: 3, color: "#9a5cf0" }, { id: "breathe", e: "🌬️", l: "Breathe", type: "build", per: 0, color: "#6a5cf0" }, { id: "send", e: "✦", l: "Ship one thing", type: "build", per: 0, color: "#2a9fe0" }];
  var TIDY_SUB = ["Make the bed", "Clear the table", "Do laundry", "Sweep / vacuum", "Clear the desk", "Take out trash"];
  var DURS = [15, 30, 45, 60, 90, 120];
  var PRIOS = [{ v: 3, l: "Must", c: "#ff4fa0" }, { v: 2, l: "Should", c: "#8a5cf0" }, { v: 1, l: "Nice", c: "#b9b0cf" }];
  function prioC(v) { for (var i = 0; i < PRIOS.length; i++) if (PRIOS[i].v === v) return PRIOS[i].c; return "#8a5cf0"; }
  var FACES = ["😞", "😕", "😐", "🙂", "💪"];
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
  var STATS = [
    { k: "vit", e: "💪", l: "Body", c: "#ff8a1e", cls: "The Athlete", subs: [
      { k: "str", l: "Strength", q: "Pushups in a row?", o: ["0–1", "2–9", "10–24", "25–49", "50+"] },
      { k: "sta", l: "Stamina", q: "Run without stopping?", o: ["Can't", "<1 km", "1–3 km", "3–5 km", "5 km+ easy"] },
      { k: "slp", l: "Sleep", q: "A typical night's sleep?", o: ["<5h, wrecked", "5–6h, tired", "6–7h, ok", "7–8h, decent", "8h, rested"] },
      { k: "nut", l: "Nutrition", q: "Your diet most days?", o: ["Mostly junk", "Inconsistent", "Half decent", "Mostly whole foods", "Dialed-in"] }] },
    { k: "craft", e: "🛠️", l: "Craft", c: "#2a9fe0", cls: "The Builder", subs: [
      { k: "foc", l: "Focus", q: "Deep focus without your phone?", o: ["<5 min", "~15 min", "~30 min", "~1 hour", "2h+ in flow"] },
      { k: "out", l: "Output", q: "Shipping real work?", o: ["Nothing in months", "Rarely finish", "Sometimes", "Most weeks", "Constantly"] },
      { k: "skl", l: "Skill", q: "Your craft level?", o: ["Beginner", "Learning", "Competent", "Advanced", "World-class"] },
      { k: "dis", l: "Discipline", q: "Hard things you don't feel like?", o: ["Almost never", "Rarely", "Sometimes", "Usually", "Always"] }] },
    { k: "heart", e: "❤️", l: "Heart", c: "#ff4fa0", cls: "The Lover", subs: [
      { k: "conn", l: "Connection", q: "Someone to call at 3am?", o: ["No one", "Maybe one", "A couple", "Solid circle", "Deep network"] },
      { k: "self", l: "Self-love", q: "How kind to yourself?", o: ["Brutal critic", "Pretty harsh", "Mixed", "Mostly kind", "Genuinely kind"] },
      { k: "give", l: "Generosity", q: "Giving to others lately?", o: ["Not at all", "Rarely", "Sometimes", "Often", "It's who I am"] }] },
    { k: "spark", e: "✨", l: "Spark", c: "#9a5cf0", cls: "The Artist", subs: [
      { k: "crea", l: "Creativity", q: "Creative flow right now?", o: ["Blocked", "Rarely", "On & off", "Often", "Overflowing"] },
      { k: "play", l: "Play", q: "Room for fun & play?", o: ["None, all grind", "Very little", "Some", "Decent", "Lots"] },
      { k: "curi", l: "Curiosity", q: "Learning new things?", o: ["Stagnant", "Rarely", "Sometimes", "Often", "Always"] }] },
    { k: "order", e: "🧹", l: "Order", c: "#23c98a", cls: "The Architect", subs: [
      { k: "space", l: "Space", q: "State of your space?", o: ["Chaos", "Messy", "Livable", "Tidy", "Immaculate"] },
      { k: "money", l: "Finances", q: "Money under control?", o: ["In the red", "Paycheck-to-paycheck", "Getting by", "Comfortable", "Building wealth"] },
      { k: "rout", l: "Routine", q: "Steady routines?", o: ["No structure", "Chaotic", "Loose", "Mostly steady", "Locked-in"] }] },
    { k: "mind", e: "🧠", l: "Mind", c: "#6a5cf0", cls: "The Monk", subs: [
      { k: "calm", l: "Calm", q: "Day-to-day calm?", o: ["Constant stress", "Often anxious", "Up & down", "Mostly calm", "Grounded"] },
      { k: "awar", l: "Awareness", q: "Present & aware?", o: ["Autopilot", "Rarely", "Sometimes", "Often", "Very present"] },
      { k: "free", l: "Freedom", q: "Grip of your vices?", o: ["They run me", "Strong pull", "Moderate", "Mostly free", "Free & clear"] }] }
  ];

  var S;
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null, timers: [], baseline: null, profile: null }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; S.habits.forEach(function (h) { if (!h.type) h.type = "build"; if (h.per == null) h.per = 0; if (!h.color) h.color = "#8a5cf0"; }); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
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

  function stats() {
    var d14 = lastDays(14), m = { energy: 0, work: 0, love: 0, hobby: 0, vice: 0 }, tidyMin = 0, meditMin = 0;
    d14.forEach(function (k) { logs(k).forEach(function (e) { var c = catOf(e); if (c && m[c] != null) m[c] += e.mins || 0; if (isTidy(e)) tidyMin += e.mins || 0; if (/meditate|breathe/i.test(e.title || "")) meditMin += e.mins || 0; }); });
    var bxp = { vit: m.energy + habitCount("move", d14) * 15 + habitCount("breathe", d14) * 8, craft: m.work + habitCount("deep", d14) * 15 + habitCount("send", d14) * 25, heart: m.love, spark: m.hobby + habitCount("read", d14) * 10, order: tidyMin + habitCount("tidy", d14) * 25, mind: meditMin + habitCount("breathe", d14) * 10 - Math.floor(m.vice / 4) };
    var base = S.baseline || {};
    var out = STATS.map(function (s) {
      var subs = s.subs.map(function (sb) { return { l: sb.l, v: base[sb.k] || 3 }; });
      var avg = subs.reduce(function (a, x) { return a + x.v; }, 0) / subs.length;
      var bl = Math.round(avg * 2); // 1-5 -> ~2-10
      var x = Math.max(0, bxp[s.k] || 0), lv = bl + Math.floor(x / 120), pct = Math.round((x % 120) / 120 * 100);
      var o = { k: s.k, e: s.e, l: s.l, c: s.c, lv: lv, pct: pct, subs: subs };
      if (s.k === "order" && messy()) o.note = daysSince(S.lastTidy) > 6 ? "messy" : "untidy";
      return o;
    });
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

  function schedule(k) {
    var pend = blocks(k).filter(function (b) { return !b.done; }).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    function fit(list) { var cur = nowMin(), out = []; list.forEach(function (b) { var st = Math.max(cur, hm(b.time)); out.push({ b: b, st: st }); cur = st + (b.mins || 30); }); return { sched: out, end: cur }; }
    var active = pend.slice(), bumped = [], r = fit(active);
    while (r.end > DAY_END && active.length) { var lp = 99, idx = 0; for (var i = 0; i < active.length; i++) { var pr = active[i].prio || 2; if (pr < lp) { lp = pr; idx = i; } else if (pr === lp && hm(active[i].time) >= hm(active[idx].time)) idx = i; } bumped.push(active.splice(idx, 1)[0]); r = fit(active); }
    return { sched: r.sched, bumped: bumped, over: Math.max(0, r.end - DAY_END) };
  }

  function proactive() {
    var p = phase(), und = undone(), sc = schedule(todayK()), out = { chips: [] };
    if (sc.bumped.length) { out.kicker = "running tight"; out.line = "Over by " + dur(sc.over) + " today."; out.sub = "I bumped " + sc.bumped.length + " low-priority " + (sc.bumped.length === 1 ? "slot" : "slots") + " so what matters survives."; out.primary = { label: "Review today", fn: function () { window.scrollTo({ top: 320, behavior: "smooth" }); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); return out; }
    if (p === "night") { out.kicker = "tonight"; out.line = "It's " + fmt(nowMin()) + " — set tomorrow up."; out.sub = "five minutes now and the morning runs itself."; out.primary = { label: "Plan tomorrow ✨", fn: function () { planSheet(tomK(), "tomorrow"); } }; out.chips.push({ label: "Plan rest of tonight", fn: function () { planSheet(todayK(), "tonight"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else if (p === "morning") { out.kicker = "this morning"; out.line = "Good morning — block out today?"; out.sub = und.length + " habits waiting · " + (blocks(todayK()).length ? blocks(todayK()).length + " slots set" : "nothing scheduled"); out.primary = { label: "Plan your day ☀️", fn: function () { planSheet(todayK(), "today"); } }; if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else { if (!blocks(todayK()).length) { out.kicker = p; out.line = "No plan yet — shape the day."; out.sub = "block your next few hours."; out.primary = { label: "Plan the day 🎯", fn: function () { planSheet(todayK(), "today"); } }; } else if (und.length) { out.kicker = p; out.line = und.length + (und.length === 1 ? " habit left." : " habits left."); out.sub = "knock one out while you've got momentum."; out.primary = { label: "What are you doing?", fn: nowSheet }; } else { out.kicker = p; out.line = "On track. Nice."; out.sub = "get ahead on tomorrow?"; out.primary = { label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }; } if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    if (S.profile && S.profile.exWant && p !== "night") { var ww = weeklyWorkouts(); if (ww < S.profile.exWant) out.chips.push({ label: "🏃 workout (" + ww + "/" + S.profile.exWant + " this wk)", fn: nowSheet }); }
    return out;
  }

  // ---- ui helpers --------------------------------------------------------
  function add(p, tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; p.appendChild(e); return e; }
  function dot(c) { var s = document.createElement("span"); s.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + c; return s; }
  function bigCat(c) { var d = document.createElement("div"); d.className = "bigcat"; d.style.background = c.color; d.innerHTML = '<div class="bce">' + c.e + '</div><div class="bcl">' + c.label + "</div>"; return d; }
  function subCard(c, gr) { var d = document.createElement("div"); d.className = "subcat"; d.style.borderColor = c.color; d.innerHTML = '<div class="bce">' + (gr.tasks[0].e || "•") + '</div><div class="scl">' + gr.g + "</div>"; return d; }
  function taskTile(parent, meta, selected, onClick) { var x = add(parent, "div", "gtile" + (selected ? " on" : "")); x.style.borderColor = meta.color; if (selected) x.style.background = meta.color; add(x, "div", "ge", meta.emoji || "•"); add(x, "div", "gl", meta.title); x.onclick = onClick; return x; }

  // ---- pixel avatar ------------------------------------------------------
  var actx, AW = 56, AH = 70, AT0 = performance.now(), avLevel = 1;
  function avatarFit() { var c = el("avatar"); if (!c) return; actx = c.getContext("2d"); var SC = 2; c.width = AW * SC; c.height = AH * SC; c.style.width = (AW * SC) + "px"; c.style.height = (AH * SC) + "px"; c.style.imageRendering = "pixelated"; actx.setTransform(SC, 0, 0, SC, 0, 0); actx.imageSmoothingEnabled = false; }
  function apx(x, y, w, h, c) { actx.fillStyle = c; actx.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function avatarLoop() { if (!actx) { requestAnimationFrame(avatarLoop); return; } var t = (performance.now() - AT0) / 1000; var bob = Math.round(Math.sin(t * 1.9) * 1.2), blink = (t % 3.8) < 0.14;
    actx.clearRect(0, 0, AW, AH);
    var aura = avLevel >= 12 ? "#ffd23a" : avLevel >= 7 ? "#b48ee0" : avLevel >= 4 ? "#7fd0ff" : null;
    if (aura) { actx.globalAlpha = .18; apx(6, 6, AW - 12, AH - 10, aura); actx.globalAlpha = 1; }
    drawAv(AW / 2 - 14, AH - 8, bob, blink); requestAnimationFrame(avatarLoop); }
  function drawAv(x, footY, dy, blink) {
    var y = footY - 50 + dy, sk = "#ffe0c4", sk2 = "#f0c2a0", hr = "#8a5ec0", hi = "#b48ee0", dr = "#ff5fa8", dr2 = "#e0407e", drh = "#ff9ec8", ol = "#3a2f4a", sh = "#5a4a72";
    actx.globalAlpha = .15; apx(x + 5, footY, 18, 3, "#3a2f4a"); actx.globalAlpha = 1;
    apx(x + 9, y + 38, 5, 9, sk); apx(x + 16, y + 38, 5, 9, sk); apx(x + 8, footY - 2, 7, 3, sh); apx(x + 15, footY - 2, 7, 3, sh);
    apx(x + 6, y + 24, 18, 16, dr); apx(x + 4, y + 34, 22, 6, dr); apx(x + 6, y + 24, 18, 3, drh); apx(x + 4, y + 37, 22, 3, dr2); apx(x + 18, y + 24, 6, 13, dr2);
    apx(x + 2, y + 25, 4, 9, sk); apx(x + 24, y + 25, 4, 9, sk); apx(x + 12, y + 20, 6, 4, sk2);
    apx(x + 6, y - 2, 16, 2, ol); apx(x + 4, y, 20, 2, ol); apx(x + 2, y + 2, 24, 16, ol); apx(x + 4, y + 18, 20, 2, ol); apx(x + 7, y + 20, 14, 2, ol);
    apx(x + 7, y, 14, 2, sk); apx(x + 5, y + 2, 18, 2, sk); apx(x + 3, y + 4, 22, 11, sk); apx(x + 5, y + 15, 18, 3, sk); apx(x + 8, y + 18, 12, 2, sk); apx(x + 4, y + 13, 20, 3, sk2);
    apx(x + 4, y - 2, 20, 5, hr); apx(x + 2, y + 2, 3, 9, hr); apx(x + 23, y + 2, 3, 9, hr); apx(x + 4, y - 2, 20, 2, hi);
    if (blink) { apx(x + 6, y + 10, 6, 1, ol); apx(x + 16, y + 10, 6, 1, ol); }
    else { apx(x + 6, y + 6, 6, 8, "#fff"); apx(x + 16, y + 6, 6, 8, "#fff"); apx(x + 8, y + 8, 4, 5, "#3a9ae6"); apx(x + 18, y + 8, 4, 5, "#3a9ae6"); apx(x + 9, y + 9, 2, 3, "#23203a"); apx(x + 19, y + 9, 2, 3, "#23203a"); apx(x + 9, y + 8, 1, 1, "#fff"); apx(x + 19, y + 8, 1, 1, "#fff"); }
    actx.globalAlpha = .6; apx(x + 3, y + 13, 4, 3, "#ff8fb5"); apx(x + 21, y + 13, 4, 3, "#ff8fb5"); actx.globalAlpha = 1;
    apx(x + 12, y + 16, 4, 1, "#c4567e");
  }

  // ---- render ------------------------------------------------------------
  function renderHeader() { el("date").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); var p = phase(); el("hello").textContent = (p === "morning" ? "Good morning" : p === "afternoon" ? "Good afternoon" : p === "evening" ? "Good evening" : "Hey") + " 👋"; }
  function renderHero() { var pr = proactive(), h = el("hero"); h.innerHTML = ""; add(h, "div", "ht", pr.kicker); add(h, "div", "hl", pr.line); add(h, "div", "hs", pr.sub); add(h, "button", "hp", pr.primary.label).onclick = pr.primary.fn; if (pr.chips.length) { var c = add(h, "div", "chips"); pr.chips.forEach(function (ch) { add(c, "div", "chip", ch.label).onclick = ch.fn; }); } }

  function renderStats() {
    var L = el("statList"); L.innerHTML = "";
    if (!S.baseline) { el("statLvl").textContent = ""; el("pullLab").style.display = "none"; el("pullList").innerHTML = ""; var b = add(L, "button", "done2", "Create your character →"); b.style.marginTop = "2px"; b.onclick = charSheet; avLevel = 1; return; }
    var st = stats(); avLevel = st.level; var top = st.list.slice().sort(function (a, b) { return b.lv - a.lv; })[0]; var cls = ""; STATS.forEach(function (s) { if (s.k === top.k) cls = s.cls; }); el("statLvl").textContent = (cls ? cls + " · " : "") + "Lv " + st.level;
    if (S.profile) { var P = S.profile, parts = []; if (P.age) parts.push("🧬 " + P.age + (P.gender ? " " + ({ m: "♂", f: "♀", o: "⚧" }[P.gender] || "") : "") + (P.height ? " · " + P.height + "cm" : "")); if (P.exWant != null) parts.push("🏃 " + weeklyWorkouts() + "/" + P.exWant + " this wk"); if (P.weight) parts.push("⚖️ " + P.weight + (P.weightGoal ? "→" + P.weightGoal : "") + "kg"); if (P.goals) parts.push("🎯 " + P.goals); if (parts.length) add(L, "div", "pfline", parts.join("   ·   ")); }
    st.list.forEach(function (s) {
      var r = add(L, "div", "statrow"); add(r, "div", "se", s.e); add(r, "div", "sn", s.l); var bw = add(r, "div", "sb"); var bar = add(bw, "div", "bar"); add(bar, "i").style.cssText = "width:" + Math.max(6, s.pct) + "%;height:100%;background:" + s.c; add(r, "div", "sl", "Lv " + s.lv + (s.note ? " · " + s.note : ""));
      var sub = add(L, "div", "subline"); s.subs.forEach(function (x) { var p = add(sub, "span", "subpill", x.l + " " + x.v); p.style.borderColor = s.c; });
    });
    var re = add(L, "button", "add", "edit character"); re.style.marginTop = "8px"; re.onclick = charSheet;
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
  function renderHabits() {
    var L = el("habitList"); L.innerHTML = ""; var dm = doneMap(todayK()), done = 0;
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
  function toggleHabit(id) { var dm = doneMap(todayK()); dm[id] = !dm[id]; if (id === "tidy" && dm[id]) S.lastTidy = todayK(); save(); renderHabits(); renderHero(); renderStats(); }

  function renderAll() { renderHeader(); renderNow(); renderHero(); renderStats(); renderToday(); renderTom(); renderHabits(); }

  // ---- picker (shared) ---------------------------------------------------
  function pickerSheet(opts) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    var picked = {}, view = { cat: null, group: null };
    function count() { return Object.keys(picked).length; }
    function draw() {
      B.innerHTML = ""; add(B, "div", "sttl", opts.title(count())); if (opts.head) opts.head(B, draw);
      if (view.cat == null) {
        if (opts.frequent) { var fr = frequent(6); if (fr.length) { add(B, "div", "lbl", "⭐ frequent"); var fg = add(B, "div", "tilegrid"); fr.forEach(function (t) { var ky = t.catK + "|" + t.title; taskTile(fg, t, !!picked[ky], function () { opts.onTask(t, picked, draw); }); }); } }
        add(B, "div", "lbl", "pick a category"); var cg = add(B, "div", "catgrid"); CATS.forEach(function (c) { var card = bigCat(c); card.onclick = function () { view.cat = c; view.group = null; draw(); }; cg.appendChild(card); });
        if (opts.custom) { var cf = add(B, "div", "frm"); var ct = document.createElement("input"); ct.type = "text"; ct.placeholder = "…or type a task"; cf.appendChild(ct); var go = add(cf, "button", "go", "+"); go.onclick = function () { var v = ct.value.trim(); if (v) opts.onTask({ title: v, catK: "work", emoji: "", color: "#8a5cf0", habitId: null }, picked, draw); }; }
      } else if (view.group == null) {
        var bk = add(B, "button", "add", "← categories"); bk.style.marginBottom = "10px"; bk.onclick = function () { view.cat = null; draw(); }; add(B, "div", "lbl", view.cat.e + " " + view.cat.label); var sg = add(B, "div", "catgrid"); view.cat.groups.forEach(function (gr) { var card = subCard(view.cat, gr); card.onclick = function () { view.group = gr; draw(); }; sg.appendChild(card); });
      } else {
        var bk2 = add(B, "button", "add", "← " + view.cat.label); bk2.style.marginBottom = "10px"; bk2.onclick = function () { view.group = null; draw(); }; add(B, "div", "lbl", view.group.g); var tg = add(B, "div", "tilegrid"); view.group.tasks.forEach(function (t) { var meta = { title: t.l, catK: view.cat.k, emoji: t.e, color: view.cat.color, habitId: t.id || null }; var ky = meta.catK + "|" + meta.title; taskTile(tg, meta, !!picked[ky], function () { opts.onTask(meta, picked, draw); }); });
      }
      if (opts.foot) opts.foot(B, picked, count());
    }
    draw();
  }
  function nowSheet() { pickerSheet({ title: function (n) { return n ? "Start " + n + (n === 1 ? " timer" : " timers") + " ⏱️" : "What are you doing? ⏱️"; }, frequent: true, custom: true, onTask: function (t, picked, draw) { var ky = t.catK + "|" + t.title; if (picked[ky]) delete picked[ky]; else picked[ky] = t; draw(); }, foot: function (B, picked, n) { if (n) add(B, "button", "done2", "Start " + n + " ▶").onclick = function () { Object.keys(picked).forEach(function (k) { startTimer(picked[k]); }); closeSheet(); renderNow(); }; } }); }
  function planSheet(k, label) {
    var cfg = { mins: 60, prio: 2 }; var d = new Date(); d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0); cfg.time = pad(d.getHours()) + ":" + pad(d.getMinutes());
    function advance() { var m = hm(cfg.time) + cfg.mins; if (m >= 1439) m = 1439; cfg.time = pad(Math.floor(m / 60)) + ":" + pad(m % 60); }
    pickerSheet({ title: function () { return "Plan " + label; }, frequent: true, custom: true,
      head: function (B, draw) {
        var frm = add(B, "div", "frm"); var time = document.createElement("input"); time.type = "time"; time.value = cfg.time; time.onchange = function () { cfg.time = time.value; }; frm.appendChild(time); var dl = document.createElement("span"); dl.style.cssText = "align-self:center;font-weight:800;font-family:var(--bub);"; dl.textContent = "• " + dur(cfg.mins); frm.appendChild(dl);
        add(B, "div", "lbl", "duration"); var c2 = add(B, "div", "pchips"); DURS.forEach(function (m) { var x = add(c2, "div", "pchip" + (m === cfg.mins ? " on" : ""), m < 60 ? m + "m" : (m / 60) + "h"); x.onclick = function () { cfg.mins = m; draw(); }; });
        add(B, "div", "lbl", "priority — lowest gets dropped if you run out of time"); var c3 = add(B, "div", "pchips"); PRIOS.forEach(function (p) { var x = add(c3, "div", "pchip" + (p.v === cfg.prio ? " on" : ""), p.l); x.onclick = function () { cfg.prio = p.v; draw(); }; });
        add(B, "div", "lbl", "tap to drop it at " + fmt(hm(cfg.time)) + " — they stack back-to-back");
      },
      onTask: function (t, picked, draw) { blocks(k).push({ id: uid(), time: cfg.time, mins: cfg.mins, title: t.title, prio: cfg.prio, done: false }); advance(); save(); draw(); },
      foot: function (B) { var list = add(B, "div"); list.style.marginTop = "10px"; blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { var r = add(list, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + b.mins)); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio))); add(ti, "span", null, b.title); var del = add(r, "div", "del", "✕"); del.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); planSheet(k, label); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; } });
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

  // ---- character creation (multi-step) -----------------------------------
  function openSheet() { el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }
  function charSheet() {
    var B = el("sheetBody"); var step = 0, STEPS = STATS.length + 2; // 0 vitals · 1..N stats · last goals
    var base = {}; STATS.forEach(function (s) { s.subs.forEach(function (sb) { base[sb.k] = (S.baseline && S.baseline[sb.k]) || 3; }); });
    var prof = S.profile ? JSON.parse(JSON.stringify(S.profile)) : {}; prof.exNow = prof.exNow == null ? 1 : prof.exNow; prof.exWant = prof.exWant == null ? 4 : prof.exWant; prof.gender = prof.gender || "";
    var inputs = {};
    openSheet();
    function numIn(ph, val) { var i = document.createElement("input"); i.type = "number"; i.placeholder = ph; if (val != null) i.value = val; i.style.cssText = "width:78px;"; return i; }
    function stepper(label, val, min, max, on) { var w = document.createElement("div"); w.style.cssText = "display:flex;align-items:center;gap:7px;border:2.5px solid var(--ink);border-radius:13px;padding:6px 9px;background:#fff;"; var lab = document.createElement("span"); lab.textContent = label; lab.style.cssText = "font-size:12px;font-weight:700;color:var(--soft);"; var num = document.createElement("span"); num.textContent = val; num.style.cssText = "font-family:var(--bub);font-weight:800;width:18px;text-align:center;"; function mkb(t, f) { var b = document.createElement("button"); b.type = "button"; b.textContent = t; b.style.cssText = "width:26px;height:26px;border:2px solid var(--ink);border-radius:8px;background:#f3eefe;font-weight:800;cursor:pointer;"; b.onclick = f; return b; } w.appendChild(lab); w.appendChild(mkb("−", function () { if (val > min) { val--; num.textContent = val; on(val); } })); w.appendChild(num); w.appendChild(mkb("+", function () { if (val < max) { val++; num.textContent = val; on(val); } })); return w; }
    function collect() { if (inputs.age) prof.age = inputs.age.value ? +inputs.age.value : null; if (inputs.ht) prof.height = inputs.ht.value ? +inputs.ht.value : null; if (inputs.wt) prof.weight = inputs.wt.value ? +inputs.wt.value : null; if (inputs.wg) prof.weightGoal = inputs.wg.value ? +inputs.wg.value : null; if (inputs.g) prof.goals = inputs.g.value.trim() || null; }
    function draw() {
      collect(); inputs = {}; B.innerHTML = ""; var bar = add(B, "div", "obarT"); add(bar, "i").style.width = Math.round(step / (STEPS - 1) * 100) + "%";
      if (step === 0) {
        add(B, "div", "sttl", "🎮 Create your character"); add(B, "div", "lbl", "who are you?");
        var f1 = add(B, "div", "frm"); inputs.age = numIn("age", prof.age); f1.appendChild(inputs.age);
        var gw = add(f1, "div", "pchips"); gw.style.margin = "0"; [["m", "♂"], ["f", "♀"], ["o", "⚧"]].forEach(function (g) { var x = add(gw, "div", "pchip" + (prof.gender === g[0] ? " on" : ""), g[1]); x.onclick = function () { prof.gender = g[0]; draw(); }; });
        add(B, "div", "lbl", "your body — height, weight, goal weight (kg)"); var f2 = add(B, "div", "frm"); inputs.ht = numIn("cm", prof.height); inputs.wt = numIn("kg", prof.weight); inputs.wg = numIn("goal", prof.weightGoal); f2.appendChild(inputs.ht); f2.appendChild(inputs.wt); f2.appendChild(inputs.wg);
      } else if (step <= STATS.length) {
        var s = STATS[step - 1]; add(B, "div", "sttl", s.e + " " + s.l); add(B, "div", "lbl", "answer honestly — sets your level, not your ego");
        if (s.k === "vit") { add(B, "div", "qline", "Workouts per week — now vs goal"); var ef = add(B, "div", "frm"); ef.appendChild(stepper("now", prof.exNow, 0, 14, function (v) { prof.exNow = v; })); ef.appendChild(stepper("goal", prof.exWant, 0, 14, function (v) { prof.exWant = v; })); }
        s.subs.forEach(function (sb) { add(B, "div", "qline", sb.q); (sb.o || []).forEach(function (opt, i) { var v = i + 1; var x = add(B, "div", "qopt" + (base[sb.k] === v ? " on" : ""), opt); if (base[sb.k] === v) { x.style.background = s.c; x.style.borderColor = s.c; x.style.color = "#fff"; } x.onclick = function () { base[sb.k] = v; draw(); }; }); });
      } else {
        add(B, "div", "sttl", "🎯 Your goals"); add(B, "div", "lbl", "what are you actually chasing?");
        inputs.g = document.createElement("input"); inputs.g.type = "text"; inputs.g.placeholder = "e.g. get lean, ship the app, quit weed"; inputs.g.style.cssText = "width:100%;margin-bottom:8px;"; if (prof.goals) inputs.g.value = prof.goals; B.appendChild(inputs.g);
      }
      var nav = add(B, "div", "frm"); nav.style.marginTop = "8px";
      if (step > 0) { add(nav, "button", "add", "← back").onclick = function () { step--; draw(); }; }
      var nx = add(nav, "button", "done2", step === STEPS - 1 ? "Create ✨" : "Next →"); nx.style.flex = "1";
      nx.onclick = function () { collect(); if (step < STEPS - 1) { step++; draw(); } else { S.baseline = base; S.profile = prof; save(); closeSheet(); renderStats(); } };
    }
    draw();
  }

  function tidySheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Tidy up — one step at a time"); var picked = {}; TIDY_SUB.forEach(function (lbl, i) { var r = add(B, "div", "subi"); var ck = add(r, "div", "ck"); add(r, "div", null, lbl).style.flex = "1"; r.onclick = function () { if (picked[i]) return; picked[i] = true; ck.className = "ck on"; ck.textContent = "✓"; S.lastTidy = todayK(); doneMap(todayK()).tidy = true; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: lbl, mins: 10, habitId: "tidy", catK: "energy", color: "#ff8a1e" }); save(); }; }); add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; }
  function habitSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "New habit");
    var cfg = { type: "build", per: 0, color: "#ff8a1e" };
    var frm = add(B, "div", "frm"); var emo = document.createElement("input"); emo.type = "text"; emo.value = "⭐"; emo.style.cssText = "width:60px;text-align:center;"; var txt = document.createElement("input"); txt.type = "text"; txt.placeholder = "e.g. Meditate, 10k steps…"; frm.appendChild(emo); frm.appendChild(txt);
    add(B, "div", "lbl", "type"); var c1 = add(B, "div", "pchips"); [["build", "✅ Build"], ["quit", "🚫 Quit"]].forEach(function (t) { var x = add(c1, "div", "pchip" + (cfg.type === t[0] ? " on" : ""), t[1]); x.onclick = function () { cfg.type = t[0]; Array.prototype.forEach.call(c1.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); }; });
    add(B, "div", "lbl", "how often"); var c2 = add(B, "div", "pchips"); [["Daily", 0], ["2× wk", 2], ["3× wk", 3], ["4× wk", 4], ["5× wk", 5], ["6× wk", 6]].forEach(function (t) { var x = add(c2, "div", "pchip" + (cfg.per === t[1] ? " on" : ""), t[0]); x.onclick = function () { cfg.per = t[1]; Array.prototype.forEach.call(c2.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); }; });
    add(B, "div", "lbl", "area"); var c3 = add(B, "div", "pchips"); [["Body", "#ff8a1e"], ["Work", "#2a9fe0"], ["Love", "#ff4fa0"], ["Play", "#9a5cf0"], ["Mind", "#6a5cf0"]].forEach(function (t, i) { var x = add(c3, "div", "pchip" + (i === 0 ? " on" : ""), t[0]); x.style.borderColor = t[1]; x.onclick = function () { cfg.color = t[1]; Array.prototype.forEach.call(c3.children, function (n) { n.classList.remove("on"); n.style.background = "#fff"; n.style.color = "var(--ink)"; }); x.classList.add("on"); x.style.background = t[1]; x.style.color = "#fff"; }; });
    add(B, "button", "done2", "Add habit ✨").onclick = function () { var v = txt.value.trim(); if (!v) return; S.habits.push({ id: uid(), e: (emo.value || "⭐").slice(0, 2), l: v, type: cfg.type, per: cfg.per, color: cfg.color }); save(); closeSheet(); renderHabits(); };
  }

  function init() {
    load(); avatarFit(); requestAnimationFrame(avatarLoop);
    setInterval(function () { S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); }); }, 1000);
    el("planToday").onclick = function () { planSheet(todayK(), phase() === "night" ? "tonight" : "today"); };
    el("planTom").onclick = function () { planSheet(tomK(), "tomorrow"); };
    el("addHabit").onclick = habitSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    document.querySelectorAll("#nav .nb").forEach(function (b) { b.onclick = function () { var t = b.dataset.tab; document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === b); }); document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-" + t); }); window.scrollTo(0, 0); }; });
    renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
