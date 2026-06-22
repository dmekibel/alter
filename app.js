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
  function kd(k) { var p = k.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function keyAdd(k, n) { var d = kd(k); d.setDate(d.getDate() + n); return key(d); }
  function monthAdd(k, n) { var d = kd(k); d.setDate(1); d.setMonth(d.getMonth() + n); return key(d); }
  function startOfWeek(k) { var d = kd(k); d.setDate(d.getDate() - d.getDay()); return key(d); }
  function relLabel(k) { if (k === todayK()) return "Today"; if (k === tomK()) return "Tomorrow"; if (k === keyAdd(todayK(), -1)) return "Yesterday"; return kd(k).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" }); }
  function relShort(k) { return kd(k).toLocaleDateString([], { month: "short", day: "numeric" }); }
  function blockStatus(dk, b) { var bs = hm(b.time), be = bs + (b.mins || 30), dl = (S && S.log && S.log[dk]) || [], ov = false; for (var i = 0; i < dl.length; i++) { var ls = hm(dl[i].time), le = ls + (dl[i].mins || 0); if (ls < be && le > bs) { ov = true; break; } } if (b.done || ov) return "ok"; if (dk < todayK()) return "miss"; if (dk === todayK() && be <= nowMin()) return "miss"; return "plan"; }
  var viewK = todayK(), zoomMode = "day";

  var DEFAULT_HABITS = [{ id: "move", e: "🏃", l: "Move", type: "build", per: 0, color: "#ff8a1e" }, { id: "deep", e: "🧠", l: "Deep work", type: "build", per: 0, color: "#2a9fe0" }, { id: "tidy", e: "🧹", l: "Tidy space", type: "build", per: 0, color: "#ff8a1e" }, { id: "teeth", e: "🪥", l: "Brush teeth", type: "build", per: 0, color: "#48d0e0" }, { id: "read", e: "📖", l: "Read", type: "build", per: 3, color: "#9a5cf0" }, { id: "breathe", e: "🌬️", l: "Breathe", type: "build", per: 0, color: "#6a5cf0" }];
  var TIDY_SUB = ["Make the bed", "Clear the table", "Do laundry", "Sweep / vacuum", "Clear the desk", "Take out trash"];
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
      { g: "Fitness", tasks: [{ l: "Run", e: "🏃", id: "move" }, { l: "Gym", e: "🏋️", id: "move" }, { l: "Walk", e: "🚶" }, { l: "Yoga", e: "🧘" }, { l: "Stretch", e: "🤸" }, { l: "Cycle", e: "🚴" }, { l: "Swim", e: "🏊" }, { l: "Sports", e: "⚽" }, { l: "Hike", e: "🥾" }] },
      { g: "Body", tasks: [{ l: "Brush teeth", e: "🪥" }, { l: "Wash up", e: "🧼" }, { l: "Cold shower", e: "🧊" }, { l: "Shower", e: "🚿" }, { l: "Skincare", e: "🧴" }, { l: "Meditate", e: "🧘" }, { l: "Breathe", e: "🌬️", id: "breathe" }, { l: "Sauna", e: "♨️" }, { l: "Sun", e: "☀️" }] },
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
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null, timers: [], baseline: null, profile: null, game: { spark: 0, total: 0, ups: {} } }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; S.habits = S.habits.filter(function (h) { return h.id !== "send"; }); S.habits.forEach(function (h) { if (!h.type) h.type = "build"; if (h.per == null) h.per = 0; if (!h.color) h.color = "#8a5cf0"; }); S.game = S.game || { spark: 0, total: 0, ups: {} }; S.game.ups = S.game.ups || {}; S.brain = S.brain || { engine: "off", key: "" }; S.microState = S.microState || {}; }
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

  function virtues() {
    var d14 = lastDays(14), xp = {}; VIRTUES.forEach(function (v) { xp[v.k] = 0; });
    d14.forEach(function (k) { logs(k).forEach(function (e) { var v = virtueOf(e); if (v) xp[v] += (e.mins || 0); }); var dm = S.habitDone[k] || {}; Object.keys(dm).forEach(function (id) { if (dm[id]) { var hv = { move: "zest", breathe: "zest", deep: "disc", tidy: "disc", read: "wisdom", send: "courage" }[id]; if (hv) xp[hv] += 18; xp.disc += 6; } }); });
    blocks(todayK()).forEach(function (b) { if (b.done) xp.hope += 12; });
    var focus = (S.profile && S.profile.focus) || [], bvx = (S.profile && S.profile.base && S.profile.base.virtue) || {};
    var out = VIRTUES.map(function (v) { var x = (xp[v.k] || 0) + (bvx[v.k] || 0), foc = focus.indexOf(v.k) !== -1; var lv = 1 + Math.floor(x / 90) + (foc ? 1 : 0); var glow = Math.min(1, 0.4 + lv * 0.085); return { k: v.k, l: v.l, e: v.e, c: v.c, grow: v.grow, lv: lv, glow: glow, focus: foc, x: x }; });
    return { list: out, level: Math.round(out.reduce(function (a, s) { return a + s.lv; }, 0) / out.length), top: out.slice().sort(function (a, b) { return b.lv - a.lv; })[0] };
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
  function hx2(h) { h = h.replace("#", ""); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mix(a, b, t) { var A = hx2(a), B = hx2(b); return "rgb(" + Math.round(A[0] + (B[0] - A[0]) * t) + "," + Math.round(A[1] + (B[1] - A[1]) * t) + "," + Math.round(A[2] + (B[2] - A[2]) * t) + ")"; }
  function gdisc(g, cx, cy, r, col) { g.fillStyle = col; for (var y = -r; y <= r; y++) { var w = Math.floor(Math.sqrt(Math.max(0, r * r - y * y))); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }
  function gring(g, cx, cy, rx, ry, col, th) { th = th || 1; g.fillStyle = col; for (var a = 0; a < 6.3; a += 0.1) { g.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), th, th); } }
  function guardianFit() {
    var c = el("guardian"); if (!c) return; gctx = c.getContext("2d");
    var wrap = c.parentNode; var cssW = (wrap ? wrap.clientWidth : 340) || 340;
    var cssH = Math.max(300, Math.round(Math.min(window.innerHeight * 0.52, cssW * 1.18)));
    var dpr = window.devicePixelRatio || 1; GW = cssW; GH = cssH;
    c.style.width = GW + "px"; c.style.height = GH + "px"; c.width = Math.round(GW * dpr); c.height = Math.round(GH * dpr);
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!gspr) { gspr = document.createElement("canvas"); gspr.width = SW; gspr.height = SH; gsx = gspr.getContext("2d"); }
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
  function drawGuardian() {
    if (!gctx) { requestAnimationFrame(drawGuardian); return; }
    var t = (performance.now() - GT0) / 1000, cx = GW / 2;
    var col = (vState && vState.top) ? vState.top.c : "#8a5cf0";
    var st = { lv: vState ? vState.level : 1, color: col, gold: !!(S.game && S.game.ups && S.game.ups.gold), blink: (t % 4) > 3.85 };
    var ph = phase(), sky = SKY[ph] || SKY.night;
    var gr = gctx.createLinearGradient(0, 0, 0, GH); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); gctx.fillStyle = gr; gctx.fillRect(0, 0, GW, GH);
    if (ph === "night" || ph === "evening") { for (var i = 0; i < 38; i++) { var sxp = (i * 79) % GW, syp = (i * 131) % Math.round(GH * 0.6); var tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.2 + i)); gctx.fillStyle = "rgba(255,255,255," + (0.5 * tw) + ")"; gctx.fillRect(sxp, syp, 2, 2); } }
    var auraR = GW * (0.30 + Math.min(0.2, st.lv * 0.012)), ap = 0.16 + 0.06 * Math.sin(t * 1.4), acy = GH * 0.5;
    var ag = gctx.createRadialGradient(cx, acy, 6, cx, acy, auraR); ag.addColorStop(0, hexA(col, ap + 0.14)); ag.addColorStop(0.5, hexA(col, ap * 0.5)); ag.addColorStop(1, hexA(col, 0)); gctx.fillStyle = ag; gctx.beginPath(); gctx.arc(cx, acy, auraR, 0, 7); gctx.fill();
    var baseY = GH * 0.92;
    gctx.fillStyle = "rgba(0,0,0,0.3)"; gctx.beginPath(); gctx.ellipse(cx, baseY, GW * 0.15, 7, 0, 0, 7); gctx.fill();
    paintGuardian(t, st);
    var scale = Math.max(2, Math.floor(Math.min(GW / SW, (GH * 0.78) / SH)));
    var bob = Math.sin(t * 1.6) * scale * 1.1, dw = SW * scale, dh = SH * scale;
    var dx = Math.round(cx - dw / 2), dy = Math.round(baseY - dh - 4 + bob);
    gctx.imageSmoothingEnabled = false; gctx.drawImage(gspr, 0, 0, SW, SH, dx, dy, dw, dh); gctx.imageSmoothingEnabled = true;
    for (var s = 0; s < 6; s++) { var px = cx + Math.cos(t * 0.6 + s * 1.2) * GW * (0.18 + 0.12 * (s % 3)); var py = baseY - 30 - ((t * 20 + s * 55) % (GH * 0.55)); var al = 0.4 + 0.4 * Math.sin(t * 2 + s); gctx.fillStyle = hexA(st.gold ? "#ffd54a" : "#cfe8ff", Math.max(0, 0.5 * al)); gctx.fillRect(Math.round(px), Math.round(py), 2, 2); }
    requestAnimationFrame(drawGuardian);
  }

  // ---- render ------------------------------------------------------------
  function renderHeader() { el("date").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); var p = phase(); el("hello").textContent = (p === "morning" ? "Good morning" : p === "afternoon" ? "Good afternoon" : p === "evening" ? "Good evening" : "Hey") + " 👋"; }
  function renderHero() { var cap = el("guardianCap"); if (cap) { if (S.profile && S.profile.set && vState) cap.innerHTML = "<b>" + (VCLASS[vState.top.k] || "Awakening") + "</b> · Lv " + vState.level + "  ·  ✨ " + S.game.spark.toLocaleString(); else cap.textContent = "your mirror — it grows when you do"; } var pr = proactive(), h = el("hero"); h.innerHTML = ""; add(h, "div", "ht", pr.kicker); add(h, "div", "hl", pr.line); add(h, "div", "hs", pr.sub); add(h, "button", "hp", pr.primary.label).onclick = pr.primary.fn; if (pr.chips.length) { var c = add(h, "div", "chips"); pr.chips.forEach(function (ch) { add(c, "div", "chip", ch.label).onclick = ch.fn; }); } }

  var vState = null;
  function renderChar() {
    var L = el("charFoot"); L.innerHTML = "";
    if (!(S.profile && S.profile.set)) { el("statLvl").textContent = ""; vState = null; renderPulls(); var b = add(L, "button", "done2", "✨ Begin your character →"); b.onclick = charSheet; return; }
    var v = virtues(); vState = v;
    el("statLvl").textContent = (VCLASS[v.top.k] || "") + " · Lv " + v.level;
    var P = S.profile, parts = []; if (P.age) parts.push("🧬 " + P.age + (P.gender ? " " + ({ m: "♂", f: "♀", o: "⚧" }[P.gender] || "") : "")); if (P.goals) parts.push("🎯 " + P.goals); if (parts.length) add(L, "div", "pfline", parts.join("   ·   "));
    var h = add(L, "div", "lbl", "tap a star to open its skill tree ✨"); h.style.textAlign = "center"; h.style.marginTop = "4px";
    var sv = add(L, "button", "add", "📊 calibrate my levels"); sv.style.cssText = "margin:10px auto 0;display:block;"; sv.onclick = surveySheet;
    var bn = add(L, "button", "add", "🧠 brain (free AI)"); bn.style.cssText = "margin:8px auto 0;display:block;"; bn.onclick = brainSheet;
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
  var UPG = [
    { id: "first", e: "🌱", l: "First Steps", d: "+25% Spark from everything", cost: 60 },
    { id: "morning", e: "🌅", l: "Morning Person", d: "×2 Spark before noon", cost: 200 },
    { id: "deep", e: "🧠", l: "Deep Diver", d: "×2 Spark from Work", cost: 350 },
    { id: "athlete", e: "🏃", l: "Athlete", d: "×2 Spark from Energy", cost: 350 },
    { id: "streak", e: "🔥", l: "Streak Engine", d: "+10% Spark per habit streak", cost: 600 },
    { id: "compound", e: "📈", l: "Compounder", d: "+50% Spark from everything", cost: 1200 },
    { id: "gold", e: "👑", l: "Golden Core", d: "your tree's core turns gold", cost: 800 }
  ];
  function activeStreaks() { var n = 0; S.habits.forEach(function (h) { if (streak(h.id) >= 2) n++; }); return n; }
  function gMult(ctx) { var u = S.game.ups, m = 1; if (u.first) m += 0.25; if (u.compound) m += 0.5; if (u.streak) m += 0.1 * activeStreaks(); if (u.morning && ctx.morning) m *= 2; if (u.deep && ctx.catK === "work") m *= 2; if (u.athlete && ctx.catK === "energy") m *= 2; return m; }
  function earn(base, ctx) { ctx = ctx || {}; if (ctx.morning == null) ctx.morning = new Date().getHours() < 12; var got = Math.max(1, Math.round(base * gMult(ctx))); S.game.spark += got; S.game.total += got; save(); var sp = el("spark"); if (sp) { sp.style.transition = "none"; sp.style.transform = "scale(1.14)"; setTimeout(function () { sp.style.transition = "transform .3s"; sp.style.transform = "scale(1)"; renderGame(); }, 30); } }
  function buyUpg(u) { if (S.game.ups[u.id] || S.game.spark < u.cost) return; S.game.spark -= u.cost; S.game.ups[u.id] = true; save(); renderGame(); }
  function renderGame() {
    var sp = el("spark"); if (!sp) return;
    if (!(S.profile && S.profile.set)) { sp.textContent = ""; var up0 = el("upgrades"); if (up0) up0.innerHTML = ""; return; }
    sp.innerHTML = "✨ " + S.game.spark.toLocaleString() + " <span style='font-size:11px;opacity:.7;font-weight:600;'>Spark</span>";
    var L = el("upgrades"); L.innerHTML = ""; add(L, "div", "divlab").innerHTML = "<span>Upgrades</span>";
    UPG.forEach(function (u) {
      var owned = !!S.game.ups[u.id], aff = S.game.spark >= u.cost;
      var r = add(L, "div", "upg" + (owned ? " owned" : "")); add(r, "div", "ue", u.e);
      var mid = add(r, "div"); mid.style.flex = "1"; add(mid, "div", "un", u.l); add(mid, "div", "ud", u.d);
      var b = add(r, "button", "ubuy", owned ? "Owned" : "✨ " + u.cost); if (owned) b.disabled = true; else { b.disabled = !aff; b.onclick = function () { buyUpg(u); }; }
    });
  }

  var MICRO = [
    { e: "💧", l: "Drink water", catK: "energy", mins: 1, sp: 3 },
    { e: "🧍", l: "Stand & move", catK: "energy", mins: 2, sp: 3 },
    { e: "🌬️", l: "2-min breath", catK: "energy", mins: 2, sp: 5, habitId: "breathe" },
    { e: "🤸", l: "Quick stretch", catK: "energy", mins: 2, sp: 4 },
    { e: "🧘", l: "Mindfulness check", catK: "love", mins: 2, sp: 5 },
    { e: "🙏", l: "One gratitude", catK: "love", mins: 1, sp: 4 },
    { e: "📞", l: "Reach someone", catK: "love", mins: 3, sp: 6 },
    { e: "☀️", l: "Step outside", catK: "energy", mins: 3, sp: 4 },
    { e: "🪥", l: "Tidy one thing", catK: "energy", mins: 3, sp: 3, habitId: "tidy" },
    { e: "📵", l: "Phone down 10m", catK: "energy", mins: 10, sp: 5 }
  ];
  var MICROPHASE = { morning: [0, 5, 3, 7], afternoon: [1, 0, 6, 7], evening: [5, 6, 4, 8], night: [2, 5, 4, 9] };
  function microState() { var k = todayK(); S.microState = S.microState || {}; return (S.microState[k] = S.microState[k] || {}); }
  function microTap(mi, chip) {
    var st = microState(), cur = st[mi], m = MICRO[mi], col = m.catK === "love" ? "#ff4fa0" : "#ff8a1e";
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
  function timeFromY(y, startH, HP) { var mins = startH * 60 + y / HP * 60; mins = Math.max(0, Math.min(1425, Math.round(mins / 15) * 15)); return pad(Math.floor(mins / 60)) + ":" + pad(mins % 60); }
  function calendarView(L, k, showNow) {
    L.innerHTML = "";
    var bls = blocks(k).slice(), lgs = logs(k).slice();
    add(L, "div", "calhint", "left = your plan · right = what you actually did · drag to move, edges to stretch · double-tap to edit · tap empty to add");
    var lh = add(L, "div", "lanehead"); add(lh, "span", "lhx", "PLAN"); add(lh, "span", "lhx", "ACTUAL");
    var minS = 6 * 60, maxE = 22 * 60; bls.concat(lgs).forEach(function (b) { var s = hm(b.time); minS = Math.min(minS, s); maxE = Math.max(maxE, s + (b.mins || 30)); });
    var startH = Math.min(6, Math.floor(minS / 60)), endH = Math.max(24, Math.ceil(maxE / 60)), HP = 60, now = nowMin();
    var cal = add(L, "div", "cal"); cal.style.height = ((endH - startH) * HP + 6) + "px";
    add(cal, "div", "lanediv");
    for (var h = startH; h < endH; h++) { var hr = add(cal, "div", "calhour"); hr.style.top = ((h - startH) * HP) + "px"; add(hr, "span", null, fmtHour(h)); }
    if (showNow && now >= startH * 60 && now <= endH * 60) { var nl = add(cal, "div", "nowline"); nl.style.top = ((now - startH * 60) / 60 * HP) + "px"; }
    function place(card, mins, durv, lane) { card.style.top = ((mins - startH * 60) / 60 * HP) + "px"; card.style.height = Math.max(24, durv / 60 * HP - 4) + "px"; if (lane === "P") { card.style.left = "42px"; card.style.right = "calc(50% + 4px)"; } else { card.style.left = "calc(50% + 4px)"; card.style.right = "3px"; } }
    function rr() { renderToday(); }
    var planCards = [];
    function topFor(m) { return ((m - startH * 60) / 60 * HP); }
    function settle() { planCards.forEach(function (pc) { pc.card.style.top = topFor(hm(pc.b.time)) + "px"; pc.card.style.height = Math.max(24, (pc.b.mins || 30) / 60 * HP - 4) + "px"; }); }
    function preview(ex, ds, de) { planCards.filter(function (pc) { return pc.card !== ex; }).sort(function (a, c) { return hm(a.b.time) - hm(c.b.time); }).reduce(function (cur, pc) { var dur = pc.b.mins || 30, s = hm(pc.b.time); if (cur >= 0 && s < cur) s = cur; if (s < de && s + dur > ds) s = de; pc.card.style.top = topFor(s) + "px"; return s + dur; }, -1); }
    function overlapLog(bs, be) { for (var i = 0; i < lgs.length; i++) { var ls = hm(lgs[i].time), le = ls + (lgs[i].mins || 0); if (ls < be && le > bs) return true; } return false; }
    bls.sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) {
      var bs = hm(b.time), be = bs + (b.mins || 30), status = blockStatus(k, b);
      var card = add(cal, "div", "calblk lane" + (status === "ok" ? " ok" : status === "miss" ? " miss" : ""));
      place(card, bs, b.mins || 30, "P");
      var col = b.color || prioC(b.prio || 2); card.style.borderLeftColor = col;
      if (status === "ok") { card.style.backgroundColor = hexA(col, 0.42); card.style.boxShadow = "0 0 20px " + hexA(col, 0.75) + ",inset 0 0 14px " + hexA(col, 0.45) + ",0 5px 16px rgba(0,0,0,.4)"; }
      else if (status !== "miss") card.style.backgroundColor = hexA(col, 0.22);
      add(card, "div", "ct", (status === "ok" ? "✓ " : status === "miss" ? "✕ " : "") + fmt(bs) + "–" + fmt(be));
      add(card, "div", "cn", blockEmoji(b.title) + " " + b.title);
      var pc = { b: b, card: card }; planCards.push(pc);
      var xb = add(card, "div", "calx", "✕");
      xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
      xb.addEventListener("click", function (ev) { ev.stopPropagation(); var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); var p2 = planCards.indexOf(pc); if (p2 >= 0) planCards.splice(p2, 1); card.style.transform = "scale(.4)"; card.style.opacity = "0"; setTimeout(function () { card.remove(); reflow(k); settle(); save(); }, 150); });
      var grip = add(card, "div", "grip"), gripT = add(card, "div", "gript");
      card.addEventListener("pointerdown", function (ev) {
        if (ev.target === grip || ev.target === gripT || ev.target === xb) return; ev.preventDefault();
        var sy0 = ev.clientY, sm0 = hm(b.time), moved = false, ct0 = card.querySelector(".ct"), dragMin = sm0;
        function mv2(e) { var dy = e.clientY - sy0; if (!moved && Math.abs(dy) > 5) { moved = true; card.classList.add("lift"); card.classList.add("dragging"); } if (moved) { dragMin = Math.max(0, Math.min(1425, sm0 + Math.round((dy / HP * 60) / 15) * 15)); card.style.top = topFor(dragMin) + "px"; if (ct0) ct0.textContent = fmt(dragMin) + "–" + fmt(dragMin + (b.mins || 30)); preview(card, dragMin, dragMin + (b.mins || 30)); } }
        function up2() { document.removeEventListener("pointermove", mv2); document.removeEventListener("pointerup", up2); card.classList.remove("lift"); card.classList.remove("dragging"); if (moved) { b.time = pad(Math.floor(dragMin / 60)) + ":" + pad(dragMin % 60); reflow(k); settle(); save(); } else { blockEdit(b, k); } }
        document.addEventListener("pointermove", mv2); document.addEventListener("pointerup", up2);
      });
      grip.addEventListener("pointerdown", function (ev) {
        ev.stopPropagation(); ev.preventDefault(); card.classList.add("dragging");
        var sy = ev.clientY, sm = b.mins || 30, ct = card.querySelector(".ct");
        function mv(e) { var v = Math.max(15, Math.round((sm + (e.clientY - sy) / HP * 60) / 15) * 15); b.mins = v; card.style.height = Math.max(24, v / 60 * HP - 4) + "px"; if (ct) ct.textContent = fmt(hm(b.time)) + "–" + fmt(hm(b.time) + v); preview(card, hm(b.time), hm(b.time) + v); }
        function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflow(k); settle(); save(); }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      });
      gripT.addEventListener("pointerdown", function (ev) {
        ev.stopPropagation(); ev.preventDefault(); card.classList.add("dragging");
        var sy = ev.clientY, sm = b.mins || 30, sStart = hm(b.time), endM = sStart + sm, ct = card.querySelector(".ct");
        function mv(e) { var ns = Math.max(0, Math.min(endM - 15, sStart + Math.round(((e.clientY - sy) / HP * 60) / 15) * 15)); var nm = endM - ns; b.time = pad(Math.floor(ns / 60)) + ":" + pad(ns % 60); b.mins = nm; card.style.top = topFor(ns) + "px"; card.style.height = Math.max(24, nm / 60 * HP - 4) + "px"; if (ct) ct.textContent = fmt(ns) + "–" + fmt(endM); preview(card, ns, endM); }
        function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); card.classList.remove("dragging"); reflow(k); settle(); save(); }
        document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
      });
    });
    lgs.forEach(function (e) { var es = hm(e.time), card = add(cal, "div", "calblk lane act"); place(card, es, e.mins || 15, "A"); var col = e.color || "#48d0e0"; card.style.borderLeftColor = col; card.style.backgroundColor = hexA(col, 0.26); add(card, "div", "ct", fmt(es) + "–" + fmt(es + (e.mins || 0))); add(card, "div", "cn", blockEmoji(e.title) + " " + e.title); });
    if (showNow) { S.timers.forEach(function (t) { var d = new Date(t.start), ts = d.getHours() * 60 + d.getMinutes(), du = Math.max(5, Math.round((Date.now() - t.start) / 60000)); var card = add(cal, "div", "calblk lane live"); place(card, ts, du, "A"); card.style.borderLeftColor = t.color || "#ff5fa8"; card.style.backgroundColor = hexA(t.color || "#ff5fa8", 0.3); add(card, "div", "ct", "▶ now"); add(card, "div", "cn", blockEmoji(t.title) + " " + t.title); }); }
    cal.addEventListener("pointerdown", function (ev) {
      if (ev.target !== cal) return; var dy = ev.clientY, dx = ev.clientX, t0 = Date.now();
      function up(e) { document.removeEventListener("pointerup", up); if (Math.abs(e.clientY - dy) < 9 && Math.abs(e.clientX - dx) < 9 && Date.now() - t0 < 450) { var rect = cal.getBoundingClientRect(); planSheet(k, k === todayK() ? "today" : "tomorrow", timeFromY(e.clientY - rect.top, startH, HP)); } }
      document.addEventListener("pointerup", up);
    });
  }
  function weekGrid(L) {
    var d0 = startOfWeek(viewK), row = add(L, "div", "weekrow");
    for (var i = 0; i < 7; i++) { (function (dk) {
      var col = add(row, "div", "wkcol" + (dk === todayK() ? " today" : "")), d = kd(dk);
      add(col, "div", "wkh", ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()] + " " + d.getDate());
      var strip = add(col, "div", "wkstrip");
      blocks(dk).forEach(function (b) { var bs = hm(b.time), y = Math.max(0, (bs - 360) / (18 * 60) * 100), h = Math.max(2, (b.mins || 30) / (18 * 60) * 100), st = blockStatus(dk, b), bb = add(strip, "div", "wkb"); bb.style.top = y + "%"; bb.style.height = h + "%"; bb.style.background = st === "ok" ? "#46e2a4" : st === "miss" ? "#544f6e" : (b.color || "#8a5cf0"); });
      col.onclick = function () { viewK = dk; zoomMode = "day"; renderToday(); };
    })(keyAdd(d0, i)); }
  }
  function monthGrid(L) {
    var f = kd(viewK); f.setDate(1); var startDow = f.getDay(), y = f.getFullYear(), mo = f.getMonth(), dim = new Date(y, mo + 1, 0).getDate(), grid = add(L, "div", "mogrid");
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (w) { add(grid, "div", "mowh", w); });
    for (var p = 0; p < startDow; p++) add(grid, "div", "mocell empty");
    for (var day = 1; day <= dim; day++) { (function (dk, day) {
      var cell = add(grid, "div", "mocell" + (dk === todayK() ? " today" : "")); add(cell, "div", "mod", "" + day);
      var bl = blocks(dk), done = 0; bl.forEach(function (b) { if (blockStatus(dk, b) === "ok") done++; });
      if (bl.length) { var d2 = add(cell, "div", "modot"), sc = done / bl.length; d2.style.background = sc >= 1 ? "#46e2a4" : sc > 0 ? "#ffc24a" : "#544f6e"; }
      cell.onclick = function () { viewK = dk; zoomMode = "day"; renderToday(); };
    })(y + "-" + pad(mo + 1) + "-" + pad(day), day); }
  }
  function renderToday() {
    var dl = el("dnLabel"); if (dl) dl.textContent = zoomMode === "day" ? relLabel(viewK) : zoomMode === "week" ? ("Week of " + relShort(startOfWeek(viewK))) : kd(viewK).toLocaleDateString([], { month: "long", year: "numeric" });
    document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.classList.toggle("on", z.dataset.z === zoomMode); });
    var dp = el("planToday"), nc = el("nowCard"), lp = el("logPanel"), tt = el("todayTitle"), L = el("todayList");
    if (zoomMode === "week") { L.innerHTML = ""; weekGrid(L); tt.textContent = "This week — tap a day"; if (dp) dp.style.display = "none"; if (nc) nc.style.display = "none"; if (lp) lp.style.display = "none"; return; }
    if (zoomMode === "month") { L.innerHTML = ""; monthGrid(L); tt.textContent = "Tap a day"; if (dp) dp.style.display = "none"; if (nc) nc.style.display = "none"; if (lp) lp.style.display = "none"; return; }
    if (dp) dp.style.display = ""; tt.textContent = relLabel(viewK);
    calendarView(L, viewK, viewK === todayK());
    var k = viewK, LG = el("logList"); LG.innerHTML = ""; var lg = logs(k).slice().sort(function (a, b) { return hm(b.time) - hm(a.time); }), tot = 0; logs(k).forEach(function (e) { tot += e.mins || 0; });
    if (nc) nc.style.display = (k === todayK() ? "" : "none"); if (lp) lp.style.display = "";
    if (!lg.length) add(LG, "div", "empty", "Nothing tracked.");
    lg.forEach(function (e) { var r = add(LG, "div", "logi"); if (e.color) r.appendChild(dot(e.color)); add(r, "div", "lt", fmt(hm(e.time))); add(r, "div", "ln", e.title); add(r, "div", "lm", dur(e.mins || 0)); });
    el("trackTotal").textContent = tot ? dur(tot) : "";
  }
  function blockEdit(b, k) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Edit block");
    var frm = add(B, "div", "frm"); var tm = document.createElement("input"); tm.type = "time"; tm.value = b.time; var tx = document.createElement("input"); tx.type = "text"; tx.value = b.title; frm.appendChild(tm); frm.appendChild(tx);
    add(B, "div", "lbl", "duration"); var c2 = add(B, "div", "pchips"); DURS.forEach(function (m) { var x = add(c2, "div", "pchip" + (m === b.mins ? " on" : ""), m < 60 ? m + "m" : (m / 60) + "h"); x.onclick = function () { b.mins = m; Array.prototype.forEach.call(c2.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); }; });
    add(B, "div", "lbl", "priority"); var c3 = add(B, "div", "pchips"); PRIOS.forEach(function (p) { var x = add(c3, "div", "pchip" + (p.v === (b.prio || 2) ? " on" : ""), p.l); x.onclick = function () { b.prio = p.v; Array.prototype.forEach.call(c3.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); }; });
    var row = add(B, "div", "frm");
    add(row, "button", "add", b.done ? "✓ undo done" : "✓ Mark done").onclick = function () { b.done = !b.done; if (b.done) earn(8, {}); b.title = tx.value.trim() || b.title; b.time = tm.value; save(); closeSheet(); renderAll(); };
    add(row, "button", "add", "🗑 Delete").onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); closeSheet(); renderAll(); };
    add(B, "button", "done2", "Save").onclick = function () { b.title = tx.value.trim() || b.title; b.time = tm.value; save(); closeSheet(); renderAll(); };
  }
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
  function toggleHabit(id) { var dm = doneMap(todayK()); dm[id] = !dm[id]; if (id === "tidy" && dm[id]) S.lastTidy = todayK(); if (dm[id]) earn(12, {}); save(); renderHabits(); renderHero(); renderChar(); renderGame(); }

  function renderAll() { renderHeader(); renderNow(); renderChar(); renderGame(); renderHero(); renderQuick(); renderToday(); renderHabits(); }

  // ---- picker (shared) ---------------------------------------------------
  function pickerSheet(opts) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    var picked = {}, view = { cat: null, group: null }, CT = activeCats();
    function count() { return Object.keys(picked).length; }
    function draw() {
      B.innerHTML = ""; add(B, "div", "sttl", opts.title(count())); if (opts.head) opts.head(B, draw);
      if (view.cat == null) {
        var ph2 = phase(), ctx = (CONTEXT[ph2] || []).map(function (t) { return TITLE2META[t.toLowerCase()]; }).filter(Boolean);
        if (ctx.length) { add(B, "div", "lbl", (ph2 === "morning" ? "🌅" : ph2 === "evening" ? "🌆" : ph2 === "night" ? "🌙" : "☀️") + " good right now"); var xg = add(B, "div", "tilegrid"); ctx.forEach(function (t) { var ky = t.catK + "|" + t.title; taskTile(xg, t, !!picked[ky], function () { opts.onTask(t, picked, draw); }); }); }
        if (opts.frequent) { var fr = frequent(6); if (fr.length) { add(B, "div", "lbl", "⭐ frequent"); var fg = add(B, "div", "tilegrid"); fr.forEach(function (t) { var ky = t.catK + "|" + t.title; taskTile(fg, t, !!picked[ky], function () { opts.onTask(t, picked, draw); }); }); } }
        add(B, "div", "lbl", "pick a category"); var cg = add(B, "div", "catgrid"); CT.forEach(function (c) { var card = bigCat(c); card.onclick = function () { view.cat = c; view.group = null; draw(); }; cg.appendChild(card); });
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
  function reflow(k) { var a = blocks(k).slice().sort(function (x, y) { return hm(x.time) - hm(y.time); }), cur = -1, changed = false; a.forEach(function (b) { var s = hm(b.time); if (cur >= 0 && s < cur) { s = Math.min(1410, cur); var nt = pad(Math.floor(s / 60)) + ":" + pad(s % 60); if (nt !== b.time) { b.time = nt; changed = true; } } cur = s + (b.mins || 30); }); if (changed) save(); return changed; }
  function nextFreeMin(k) {
    var base = (k === todayK()) ? Math.ceil(nowMin() / 15) * 15 : 8 * 60, last = base;
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
  function recommitSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "☀️ Morning recommit");
    add(B, "div", "lbl", "fresh canvas. 60 seconds to set today — then I'll frame your day.");
    add(B, "div", "lbl", "who are you being today?");
    var picks = {}, ic = add(B, "div", "pchips");
    ["Focused", "Disciplined", "Calm", "Bold", "Loving", "Creative", "Grateful", "Unstoppable"].forEach(function (t) { var x = add(ic, "div", "pchip", t); x.onclick = function () { if (picks[t]) { delete picks[t]; x.classList.remove("on"); } else { picks[t] = 1; x.classList.add("on"); } }; });
    add(B, "div", "lbl", "🎯 the ONE thing that makes today a win");
    var one = document.createElement("input"); one.type = "text"; one.placeholder = "ship the landing page…"; one.style.cssText = "width:100%;"; B.appendChild(one);
    add(B, "div", "lbl", "🙏 one thing you're grateful for");
    var grat = document.createElement("input"); grat.type = "text"; grat.placeholder = "my health, this quiet morning…"; grat.style.cssText = "width:100%;"; B.appendChild(grat);
    add(B, "button", "done2", "I recommit ✦ — build my day").onclick = function () {
      var ot = one.value.trim(), k = todayK(), d = new Date(), tnow = pad(d.getHours()) + ":" + pad(d.getMinutes());
      if (grat.value.trim()) { logs(k).push({ id: uid(), time: tnow, title: "Gratitude — " + grat.value.trim(), mins: 4, catK: "love", color: "#ff4fa0" }); earn(4, { catK: "love" }); }
      logs(k).push({ id: uid(), time: tnow, title: "Morning recommit", mins: 5, catK: "love", color: "#ff4fa0" }); earn(8, { catK: "love" });
      if (S.profile) S.profile.todayIdentity = Object.keys(picks);
      skeletonDay(k, ot); save(); closeSheet();
      viewK = todayK(); zoomMode = "day";
      document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x.dataset.tab === "day"); });
      document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-day"); });
      renderAll();
    };
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
  function startTimer(p) { S.timers.push({ id: uid(), title: p.title, catK: p.catK, emoji: p.emoji || "", habitId: p.habitId || null, color: p.color || "#8a5cf0", start: Date.now() }); save(); }
  function stopTimer(id) { var i = -1; S.timers.forEach(function (t, k) { if (t.id === id) i = k; }); if (i < 0) return; var t = S.timers[i], mins = Math.max(1, Math.round((Date.now() - t.start) / 60000)), d = new Date(t.start); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: t.title, mins: mins, habitId: t.habitId, catK: t.catK, color: t.color }); if (t.habitId) doneMap(todayK())[t.habitId] = true; if (isTidy(t)) S.lastTidy = todayK(); earn(mins, { catK: t.catK }); S.timers.splice(i, 1); save(); renderAll(); }
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

  function brainCfg() { return (S.brain = S.brain || { engine: "off", key: "" }); }
  function askBrain(prompt, cb) {
    var c = brainCfg();
    if (c.engine === "off" || !c.key) { cb(null, "no brain configured"); return; }
    if (c.engine === "gemini") {
      fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(c.key), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { var t = j && j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts && j.candidates[0].content.parts[0] && j.candidates[0].content.parts[0].text; if (t) cb(t.trim()); else cb(null, (j && j.error && j.error.message) || "no response"); })
        .catch(function (e) { cb(null, String(e)); });
    } else if (c.engine === "openrouter") {
      fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + c.key }, body: JSON.stringify({ model: "meta-llama/llama-3.3-70b-instruct:free", messages: [{ role: "user", content: prompt }] }) })
        .then(function (r) { return r.json(); })
        .then(function (j) { var t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (t) cb(t.trim()); else cb(null, (j && j.error && j.error.message) || "no response"); })
        .catch(function (e) { cb(null, String(e)); });
    } else {
      fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + c.key }, body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }] }) })
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
    var er = add(B, "div", "pchips"); [["off", "Off"], ["openrouter", "OpenRouter · free"], ["groq", "Groq · free"], ["gemini", "Gemini"]].forEach(function (o) { var x = add(er, "div", "pchip" + (c.engine === o[0] ? " on" : ""), o[1]); x.onclick = function () { c.engine = o[0]; save(); brainSheet(); }; });
    if (c.engine !== "off") {
      var site = c.engine === "gemini" ? "Google AI Studio" : c.engine === "groq" ? "Groq" : "OpenRouter";
      var keyurl = c.engine === "gemini" ? "aistudio.google.com/apikey" : c.engine === "groq" ? "console.groq.com/keys" : "openrouter.ai/keys";
      add(B, "div", "lbl", "paste your " + site + " key");
      var ki = document.createElement("input"); ki.type = "text"; ki.placeholder = "paste key…"; ki.value = c.key || ""; ki.style.cssText = "width:100%;"; ki.oninput = function () { c.key = ki.value.trim(); save(); }; B.appendChild(ki);
      var hint = add(B, "div", "lbl", "get one free: " + keyurl); hint.style.fontSize = "12px";
      var test = add(B, "button", "done2", "🧪 Test the brain"); var out = add(B, "div", "lbl", ""); out.style.minHeight = "20px";
      test.onclick = function () { out.textContent = "thinking…"; askBrain("Reply with exactly: ALTER brain online.", function (t, err) { out.textContent = t ? ("✓ " + t) : ("✕ " + (err || "failed")); }); };
    }
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
    load(); treeFit(); requestAnimationFrame(treeLoop); guardianFit(); requestAnimationFrame(drawGuardian);
    var tc = el("tree"); if (tc) tc.addEventListener("click", treeTap);
    window.addEventListener("resize", function () { treeFit(); guardianFit(); });
    setInterval(function () { S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); }); }, 1000);
    el("planToday").onclick = function () { planSheet(viewK, relLabel(viewK)); };
    el("addHabit").onclick = habitSheet;
    var gr = el("gear"); if (gr) gr.onclick = brainSheet;
    el("dnPrev").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, -1) : zoomMode === "week" ? keyAdd(viewK, -7) : keyAdd(viewK, -1); renderToday(); };
    el("dnNext").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, 1) : zoomMode === "week" ? keyAdd(viewK, 7) : keyAdd(viewK, 1); renderToday(); };
    document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.onclick = function () { zoomMode = z.dataset.z; renderToday(); }; });
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    var sx = el("sheetX"); if (sx) sx.onclick = closeSheet; var sh = document.querySelector(".shandle"); if (sh) sh.onclick = closeSheet;
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); }); document.addEventListener("dblclick", function (e) { e.preventDefault(); });
    document.querySelectorAll("#nav .nb").forEach(function (b) { if (!b.dataset.tab) return; b.onclick = function () { var t = b.dataset.tab; document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === b); }); document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-" + t); }); window.scrollTo(0, 0); if (t === "self") { treeFit(); guardianFit(); } }; });
    var ntk = el("navTrack"); if (ntk) ntk.onclick = nowSheet;
    renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
