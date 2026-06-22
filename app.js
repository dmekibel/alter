/* ALTER v1.3 — RPG character: sub-attribute self-assessment + pixel avatar,
   gamified picker, Toggl multitask timers, Streaks habits, auto-adjust schedule, proactive. $0. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_plan2", SCHEMA = 1, lastSaveErr = 0;
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
  var viewK = todayK(), zoomMode = "day", pendingScrollNow = true, nowLineEl = null;

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
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null, timers: [], baseline: null, profile: null, game: { spark: 0, total: 0, ups: {}, garden: [] } }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } if (S.v == null) S.v = 0; S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; S.timers = S.timers || []; S.habits = S.habits.filter(function (h) { return h.id !== "send"; }); S.habits.forEach(function (h) { if (!h.type) h.type = "build"; if (h.per == null) h.per = 0; if (!h.color) h.color = "#8a5cf0"; }); S.game = S.game || { spark: 0, total: 0, ups: {} }; S.game.ups = S.game.ups || {}; S.game.garden = S.game.garden || []; S.brain = S.brain || { engine: "off", key: "" }; S.microState = S.microState || {}; S.mood = S.mood || {}; S.timers.forEach(function (t) { if (!t.dayK) t.dayK = key(new Date(t.start)); }); S.v = SCHEMA; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { var n = Date.now(); if (n - lastSaveErr > 8000) { lastSaveErr = n; toast("⚠️ Couldn't save — storage may be full. Back up your data via 🧠."); } } }
  function toast(msg) { var t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.classList.add("show"); }, 10); setTimeout(function () { t.classList.remove("show"); setTimeout(function () { t.remove(); }, 320); }, 2600); }
  function copyFallback(json) { var ta = document.createElement("textarea"); ta.value = json; ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("📋 backup copied"); } catch (e) { toast("⚠️ couldn't copy — use Download"); } ta.remove(); }
  function exportData(mode) {
    var json = localStorage.getItem(KEY) || JSON.stringify(S);
    if (mode === "download") { var blob = new Blob([json], { type: "application/json" }), url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = "alter-backup-" + key(new Date()) + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); toast("⬇ backup downloaded"); }
    else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(json).then(function () { toast("📋 backup copied — keep it safe"); }, function () { copyFallback(json); }); }
    else copyFallback(json);
  }
  function restoreUI(B) {
    var w = add(B, "div"); w.style.marginTop = "10px"; add(w, "div", "lbl", "paste a backup, then Restore (replaces current data):");
    var ta = document.createElement("textarea"); ta.placeholder = "paste backup JSON here…"; ta.style.cssText = "width:100%;height:88px;background:#161020;color:#ece4f7;border:2.5px solid #4a4068;border-radius:14px;padding:11px;font-size:12px;font-family:inherit;"; w.appendChild(ta);
    add(w, "button", "done2", "♻ Restore from this").onclick = function () { var txt = ta.value.trim(); if (!txt) return; var obj; try { obj = JSON.parse(txt); } catch (e) { toast("⚠️ not valid backup JSON"); return; } if (!obj || (!obj.habits && !obj.blocks && !obj.log)) { toast("⚠️ doesn't look like an ALTER backup"); return; } if (!window.confirm("Replace ALL current data with this backup?")) return; localStorage.setItem(KEY, txt); location.reload(); };
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
  // walkable character + camera (ported from Heaven Inc walk model)
  var px = 24, py = 96, pface = 1, walkF = 0, walkT = 0, moveX = 0, moveY = 0, jid = null, kdn = {}, pInit = false;
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
    var cxj = 0, cyj = 0;
    zone.addEventListener("touchstart", function (e) {
      e.preventDefault(); var tch = e.changedTouches[0]; jid = tch.identifier;
      var r = zone.getBoundingClientRect(); cxj = r.left + r.width / 2; cyj = r.top + r.height / 2;
    }, { passive: false });
    zone.addEventListener("touchmove", function (e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var tch = e.changedTouches[i]; if (tch.identifier !== jid) continue;
        var dx = tch.clientX - cxj, dy = tch.clientY - cyj, d = Math.sqrt(dx * dx + dy * dy), cl = Math.min(d, 42), a = Math.atan2(dy, dx);
        stick.style.transform = "translate(" + (Math.cos(a) * cl) + "px," + (Math.sin(a) * cl) + "px)";
        var mag = Math.max(0, Math.min(1, (d - 5) / 37)); moveX = Math.cos(a) * mag; moveY = Math.sin(a) * mag;   // analog: push further = move faster
      }
    }, { passive: false });
    function end(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === jid) { jid = null; moveX = 0; moveY = 0; stick.style.transform = "translate(0,0)"; } }
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
    var cx2 = 0, cy2 = 0;
    zone.addEventListener("touchstart", function (e) { e.preventDefault(); var tc = e.changedTouches[0]; jid2 = tc.identifier; var r = zone.getBoundingClientRect(); cx2 = r.left + r.width / 2; cy2 = r.top + r.height / 2; }, { passive: false });
    zone.addEventListener("touchmove", function (e) {
      e.preventDefault();
      for (var i = 0; i < e.changedTouches.length; i++) {
        var tc = e.changedTouches[i]; if (tc.identifier !== jid2) continue;
        var dx = tc.clientX - cx2, dy = tc.clientY - cy2, d = Math.sqrt(dx * dx + dy * dy), cl = Math.min(d, 42), a = Math.atan2(dy, dx);
        stick.style.transform = "translate(" + (Math.cos(a) * cl) + "px," + (Math.sin(a) * cl) + "px)";
        var mag = Math.max(0, Math.min(1, (d - 5) / 37)); moveX2 = Math.cos(a) * mag; moveY2 = Math.sin(a) * mag;
      }
    }, { passive: false });
    function end(e) { for (var i = 0; i < e.changedTouches.length; i++) if (e.changedTouches[i].identifier === jid2) { jid2 = null; moveX2 = 0; moveY2 = 0; stick.style.transform = "translate(0,0)"; } }
    zone.addEventListener("touchend", end); zone.addEventListener("touchcancel", end);
  }
  // ============ full-screen GAME MODE — top-down island the guardian walks ============
  var wctx, WGW = 0, WGH = 0, hspr = null, hsx = null, gameOn = false, ghudT = 0;
  var HSW = 40, HSH = 58, RG = 240, RS = 286, PXG = 3;
  // real fairy sprite sheets (AI-generated, animated via Kling, sliced to frames)
  var FAIRY = { idle: null, fly: null, face: null, dir8: null }, FAIRY_META = { idle: { fw: 201, fh: 300, n: 13 }, fly: { fw: 223, fh: 300, n: 13 }, face: { fw: 210, fh: 300, n: 8 }, dir8: { fw: 183, fh: 270, cols: 20, rows: 8 } };
  var moveX2 = 0, moveY2 = 0, jid2 = null, FACE_DIR = 1, FACE_OFF = -Math.PI / 2;  // right thumb (twin-stick) + 8-way facing calibration (down→front)
  // compass dir (0=S,1=SW,2=W,3=NW,4=N,5=NE,6=E,7=SE) → cell row in spr-dir8.png (+ horizontal flip).
  // Per David: real cells c0=front, c3=left, c6=right, c5=back, c4=up-left; c1/c2/c7 are dup fronts.
  // up-right = c4 mirrored; down-left/right lean to the left/right profiles.
  var DIR2CELL = [0, 3, 3, 4, 5, 4, 6, 6];
  var DIR2FLIP = [0, 0, 0, 0, 0, 1, 0, 0];
  function loadFairy() { ["idle", "fly", "face", "dir8"].forEach(function (k) { var im = new Image(); im.src = "assets/spr-" + k + ".png?v=3"; FAIRY[k] = im; }); }
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
  function drawTree(ctx, x, y) {
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
    if (waterPat) {
      var ox = ((-px * vz) % WS + WS) % WS, oy = ((-py * vz) % WS + WS) % WS;
      ctx.save(); ctx.translate(ox - WS, oy - WS); ctx.fillStyle = waterPat; ctx.fillRect(0, 0, W + WS * 2, H + WS * 2); ctx.restore();
    } else { ctx.fillStyle = "#6f8a93"; ctx.fillRect(0, 0, W, H); }
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(vz, vz); ctx.translate(-px, -py);
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
    drawObj(ctx, WORLD_IMG.tree, -152, -84, 158); drawObj(ctx, WORLD_IMG.tree, 190, -30, 148);
    drawObj(ctx, WORLD_IMG.cabin, -58, 2, 132); drawObj(ctx, WORLD_IMG.bush, 78, -136, 60);
    drawObj(ctx, WORLD_IMG.bush, -120, 72, 56); drawObj(ctx, WORLD_IMG.tree, 150, 74, 156);
    drawObj(ctx, WORLD_IMG.rock, -36, 124, 50); drawObj(ctx, WORLD_IMG.chest, -130, 28, 48); drawObj(ctx, WORLD_IMG.sign, 14, 44, 60);
    var gden = (S.game && S.game.garden) || [];
    for (var fi = 0; fi < gden.length; fi++) { var fa = fi * 2.39996 + 1, frr = 56 + (fi % 5) * 22, fx = Math.cos(fa) * frr, fy = Math.sin(fa) * frr; plantSpriteAt(ctx, fx, fy, gden[fi].t); }
    ctx.fillStyle = "rgba(20,30,15,0.25)"; ctx.beginPath(); ctx.ellipse(px, py + 2, 14, 5, 0, 0, 7); ctx.fill();
    var aur = ctx.createRadialGradient(px, py - 20, 4, px, py - 20, 54); aur.addColorStop(0, hexA(col, 0.12)); aur.addColorStop(1, hexA(col, 0)); ctx.fillStyle = aur; ctx.beginPath(); ctx.arc(px, py - 20, 54, 0, 7); ctx.fill();
    // one sheet for everything (David's video): wings flap, no mouth movement, consistent size.
    // moving → directional cell; idle → front cell (c0). Fixes "moving smaller than idle" + "idle mouth moves".
    var aimX = (moveX2 !== 0 || moveY2 !== 0) ? moveX2 : moveX, aimY = (moveX2 !== 0 || moveY2 !== 0) ? moveY2 : moveY;
    var aiming = (aimX !== 0 || aimY !== 0), d8 = FAIRY.dir8, hHs = 132;
    if (aimX > 0.12) pface = 1; else if (aimX < -0.12) pface = -1;
    if (d8 && d8.complete && d8.naturalWidth) {
      var md = FAIRY_META.dir8, row = DIR2CELL[0], flip = 0;
      if (aiming) { var ang = Math.atan2(aimY, aimX), fk = (((Math.round((ang * FACE_DIR + FACE_OFF) / (Math.PI / 4))) % 8) + 8) % 8; row = DIR2CELL[fk]; flip = DIR2FLIP[fk]; }
      var col = Math.floor(t * 10) % md.cols, hW8 = hHs * md.fw / md.fh, sdx = Math.round(px - hW8 / 2), sdy = Math.round(py - hHs + 16);
      if (flip) { ctx.save(); ctx.translate(sdx + hW8, sdy); ctx.scale(-1, 1); ctx.drawImage(d8, col * md.fw, row * md.fh, md.fw, md.fh, 0, 0, hW8, hHs); ctx.restore(); }
      else ctx.drawImage(d8, col * md.fw, row * md.fh, md.fw, md.fh, sdx, sdy, hW8, hHs);
    } else {
      paintHero(t, st, walkF, moving);
      var hs = 2.3, hdw = HSW * hs, hdh = HSH * hs;
      ctx.drawImage(hspr, 0, 0, HSW, HSH, Math.round(px - hdw / 2), Math.round(py - hdh + 9), hdw, hdh);
    }
    if (hasShippedToday()) { var sb = ctx.createRadialGradient(px, py - 16, 8, px, py - 16, 76); sb.addColorStop(0, "rgba(70,226,164,0.16)"); sb.addColorStop(1, "rgba(70,226,164,0)"); ctx.fillStyle = sb; ctx.beginPath(); ctx.arc(px, py - 16, 76, 0, 7); ctx.fill(); }
    ctx.restore();
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
    var moving = (moveX !== 0 || moveY !== 0), SPD = 2.7 * ((S.game && S.game.ups && S.game.ups.board) ? 1.75 : 1);
    if (moving) { px += moveX * SPD; py += moveY * SPD; if (moveX > 0.15) pface = 1; else if (moveX < -0.15) pface = -1; walkT++; if (walkT > 8) { walkT = 0; walkF = 1 - walkF; } }
    var bound = RS - 8, d = Math.sqrt(px * px + py * py); if (d > bound) { px = px / d * bound; py = py / d * bound; }
    renderWorld(wctx, WGW, WGH, zoom, moving, t);
    if (ghudT++ % 30 === 0) updGameHud();
    requestAnimationFrame(drawWorld);
  }
  function updGameHud() {
    var h = el("gameHud"); if (!h) return;
    var sp = (S.game && S.game.spark) || 0;
    var PROMPTS = [[-58, 2, "tap the 🏠 cabin — settings"], [14, 44, "tap the 📋 board — plan your day"], [150, 74, "tap the 🌳 tree — your skills"], [-130, 28, "tap the 🧰 chest — habits"]];
    var hint = "tap yourself ✦ to open the menu", best = 999;
    for (var i = 0; i < PROMPTS.length; i++) { var d = Math.hypot(px - PROMPTS[i][0], py - PROMPTS[i][1]); if (d < 74 && d < best) { best = d; hint = PROMPTS[i][2]; } }
    h.innerHTML = "✨ " + sp + " Spark" + (hasShippedToday() ? " · 🌱 your island grew today" : " · ship 1 real thing to grow your island") + "<br><span style='opacity:.82;font-size:12px'>" + hint + "</span>";
  }
  function openGame() {
    var gm = el("gameMode"); if (!gm) return;
    gm.classList.add("on"); worldFit(); updGameHud(); wireWorldTap();
    document.body.style.overflow = "hidden";
    if (!gameOn) { gameOn = true; requestAnimationFrame(drawWorld); }
  }
  function closeGame() {
    var gm = el("gameMode"); if (gm) gm.classList.remove("on");
    gameOn = false; moveX = 0; moveY = 0; document.body.style.overflow = "";
  }
  // ---- game-as-home: tap the character → diegetic action hub ----
  function goTab(t) { closeGame(); var nb = document.querySelector('#nav .nb[data-tab="' + t + '"]'); if (nb) nb.click(); if (t === "day") { pendingScrollNow = true; renderToday(); } else { window.scrollTo(0, 0); } }
  function heroMenu() {
    radialMenu([
      { title: "Plan day", emoji: "📅", color: "#2a9fe0", fn: function () { goTab("day"); } },
      { title: "Track time", emoji: "⏱️", color: "#ff5fa8", fn: function () { goTab("day"); } },
      { title: "Habits", emoji: "✅", color: "#28cf86", fn: function () { goTab("grow"); } },
      { title: "Skills", emoji: "⭐", color: "#ffc41f", fn: function () { goTab("self"); } },
      { title: "Mood", emoji: "🌤️", color: "#9a5cf0", fn: function () { goTab("self"); } },
      { title: "Yesterday", emoji: "📓", color: "#caa15a", fn: function () { closeGame(); yesterdaySheet(); } },
      { title: "Brain", emoji: "🧠", color: "#8a5cf0", fn: function () { closeGame(); brainSheet(); } }
    ], function (m) { if (m && m.fn) m.fn(); });
  }
  var worldTapWired = false;
  // diegetic access points — walk up to a building and tap it to open its menu (Sims-style)
  var WORLD_SPOTS = [
    { x: -58, y: 2, r: 62, fn: function () { closeGame(); brainSheet(); } },  // cabin → brain / settings / profile
    { x: 14, y: 44, r: 48, fn: function () { goTab("day"); } },               // notice board → plan your day
    { x: 150, y: 74, r: 66, fn: function () { goTab("self"); } },             // tree → skills / character
    { x: -130, y: 28, r: 46, fn: function () { goTab("grow"); } }             // chest → habits
  ];
  function wireWorldTap() {
    if (worldTapWired) return; worldTapWired = true; var w = el("world"); if (!w) return;
    w.addEventListener("click", function (e) {
      var cx = WGW / 2, cy = WGH / 2;
      var wx = px + (e.clientX - cx) / zoom, wy = py + (e.clientY - cy) / zoom;
      for (var i = 0; i < WORLD_SPOTS.length; i++) { var s = WORLD_SPOTS[i]; if (Math.hypot(wx - s.x, wy - s.y) < s.r) { s.fn(); return; } }
      if (Math.abs(e.clientX - cx) < 78 && e.clientY > cy - 138 && e.clientY < cy + 44) { heroMenu(); return; }
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
  function hasShippedToday() { var lg = logs(todayK()), i; for (i = 0; i < lg.length; i++) if (virtueOf(lg[i]) === "courage") return true; var bl = blocks(todayK()); for (i = 0; i < bl.length; i++) if (bl[i].done && virtueOf(bl[i]) === "courage") return true; return false; }
  function earn(base, ctx) { var got = Math.max(1, Math.round(base)); S.game.spark += got; S.game.total += got; save(); var sp = el("spark"); if (sp) { sp.style.transition = "none"; sp.style.transform = "scale(1.14)"; setTimeout(function () { sp.style.transition = "transform .3s"; sp.style.transform = "scale(1)"; renderGame(); }, 30); } }
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
      } else { add(L, "div", "lbl", "🛹 Skateboard built — you zip around your world").style.cssText = "font-size:12px;text-align:center;margin-top:6px;"; }
    }
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
  function assignBlock(b, m, k) { b.title = m.title; b.color = m.color || b.color; b.catK = m.catK || b.catK; save(); reflow(k); renderToday(); }
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
  function calendarView(L, k, showNow) {
    L.innerHTML = ""; nowLineEl = null;
    var bls = blocks(k).slice(), lgs = logs(k).slice();
    add(L, "div", "calhint", "left = your plan · right = what you actually did · drag to move, edges to stretch · double-tap to edit · tap empty to add");
    var lh = add(L, "div", "lanehead"); add(lh, "span", "lhx", "PLAN"); add(lh, "span", "lhx", "ACTUAL");
    var minS = 6 * 60, maxE = 22 * 60; bls.concat(lgs).forEach(function (b) { var s = hm(b.time); minS = Math.min(minS, s); maxE = Math.max(maxE, s + (b.mins || 30)); });
    var startH = Math.min(6, Math.floor(minS / 60)), endH = Math.max(24, Math.ceil(maxE / 60)), HP = 60, now = nowMin();
    var cal = add(L, "div", "cal"); cal.style.height = ((endH - startH) * HP + 6) + "px";
    add(cal, "div", "lanediv");
    for (var h = startH; h < endH; h++) { var hr = add(cal, "div", "calhour"); hr.style.top = ((h - startH) * HP) + "px"; add(hr, "span", null, fmtHour(h)); }
    if (showNow && now >= startH * 60 && now <= endH * 60) { var nl = add(cal, "div", "nowline"); nl.style.top = ((now - startH * 60) / 60 * HP) + "px"; nowLineEl = nl; }
    function place(card, mins, durv, lane) { card.style.top = ((mins - startH * 60) / 60 * HP) + "px"; card.style.height = Math.max(24, durv / 60 * HP - 4) + "px"; if (lane === "P") { card.style.left = "42px"; card.style.right = "calc(50% + 4px)"; } else { card.style.left = "calc(50% + 4px)"; card.style.right = "3px"; } }
    function rr() { renderToday(); }
    var planCards = [];
    function topFor(m) { return ((m - startH * 60) / 60 * HP); }
    function settle() { planCards.forEach(function (pc) { pc.card.style.top = topFor(hm(pc.b.time)) + "px"; pc.card.style.height = Math.max(24, (pc.b.mins || 30) / 60 * HP - 4) + "px"; }); }
    function preview(ex, ds, de) { planCards.filter(function (pc) { return pc.card !== ex; }).sort(function (a, c) { return hm(a.b.time) - hm(c.b.time); }).reduce(function (cur, pc) { var dur = pc.b.mins || 30, s = hm(pc.b.time); if (cur >= 0 && s < cur) s = cur; if (s < de && s + dur > ds) s = de; pc.card.style.top = topFor(s) + "px"; return s + dur; }, -1); }
    function overlapLog(bs, be) { for (var i = 0; i < lgs.length; i++) { var ls = hm(lgs[i].time), le = ls + (lgs[i].mins || 0); if (ls < be && le > bs) return true; } return false; }
    bls.sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) {
      var bs = hm(b.time), be = bs + (b.mins || 30), status = blockStatus(k, b);
      var card = add(cal, "div", "calblk lane" + (status === "ok" ? " ok" : status === "miss" ? " miss" : "") + (b.pin ? " pin" : ""));
      place(card, bs, b.mins || 30, "P");
      var col = b.color || prioC(b.prio || 2); card.style.borderLeftColor = col;
      if (status === "ok") { card.style.backgroundColor = hexA(col, 0.42); card.style.boxShadow = "0 0 20px " + hexA(col, 0.75) + ",inset 0 0 14px " + hexA(col, 0.45) + ",0 5px 16px rgba(0,0,0,.4)"; }
      else if (status !== "miss") card.style.backgroundColor = hexA(col, 0.22);
      add(card, "div", "ct", (status === "ok" ? "✓ " : status === "miss" ? "✕ " : "") + fmt(bs) + "–" + fmt(be));
      add(card, "div", "cn", (b.pin ? "📌 " : "") + blockEmoji(b.title) + " " + b.title);
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
    var acts = [];
    lgs.forEach(function (e) { var s = hm(e.time); acts.push({ kind: "log", ref: e, s: s, e: s + (e.mins || 15) }); });
    if (showNow) S.timers.forEach(function (t) { var d = new Date(t.start), s = d.getHours() * 60 + d.getMinutes(); acts.push({ kind: "timer", ref: t, s: s, e: Math.max(s + 5, nowMin()) }); });
    layoutLane(acts);
    acts.forEach(function (it) {
      var card = add(cal, "div", "calblk lane act" + (it.kind === "timer" ? " live" : "")), colW = 50 / it.cols;
      card.style.top = topFor(it.s) + "px"; card.style.height = Math.max(22, (it.e - it.s) / 60 * HP - 3) + "px";
      card.style.left = "calc(" + (50 + it.col * colW) + "% + 2px)"; card.style.width = "calc(" + colW + "% - 5px)"; card.style.right = "auto";
      if (it.kind === "log") {
        var e = it.ref, lc = e.color || "#48d0e0"; card.style.borderLeftColor = lc; card.style.backgroundColor = hexA(lc, 0.26);
        add(card, "div", "ct", fmt(it.s) + "–" + fmt(it.e)); add(card, "div", "cn", blockEmoji(e.title) + " " + e.title);
        var xb = add(card, "div", "calx", "✕"); xb.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); }); xb.addEventListener("click", function (ev) { ev.stopPropagation(); var a = logs(k), i = a.indexOf(e); if (i >= 0) a.splice(i, 1); save(); renderToday(); });
        card.addEventListener("click", function (ev) { if (ev.target === xb) return; radialMenu(frequent(8), function (m) { var p = function (x) { e.title = x.title; e.color = x.color; e.catK = x.catK; save(); renderToday(); }; if (m) p(m); else pickOne(p); }); });
      } else {
        var t = it.ref; card.style.borderLeftColor = t.color || "#ff5fa8"; card.style.backgroundColor = hexA(t.color || "#ff5fa8", 0.3);
        add(card, "div", "ct", "▶ " + fmt(it.s)); add(card, "div", "cn", (t.emoji ? t.emoji + " " : "") + t.title);
        var stop = add(card, "div", "calx", "⏹"); stop.addEventListener("pointerdown", function (e2) { e2.stopPropagation(); }); stop.addEventListener("click", function (e2) { e2.stopPropagation(); stopTimer(t.id); });
        var gT = add(card, "div", "gript");
        gT.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); var sy = ev.clientY, s0 = t.start, ct = card.querySelector(".ct"); function mv(e3) { var dmin = Math.round(((e3.clientY - sy) / HP * 60) / 5) * 5, ns = Math.min(Date.now(), s0 + dmin * 60000); t.start = ns; var nd = new Date(ns), tsm = nd.getHours() * 60 + nd.getMinutes(); card.style.top = topFor(tsm) + "px"; card.style.height = Math.max(22, Math.max(5, (Date.now() - ns) / 60000) / 60 * HP - 3) + "px"; if (ct) ct.textContent = "▶ " + fmt(tsm); } function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); save(); } document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up); });
        card.addEventListener("click", function (ev) { if (ev.target === stop || ev.target === gT) return; radialMenu(frequent(8), function (sel) { if (sel && sel.length) assignTimerMulti(t, sel); else pickOne(function (x) { assignTimer(t, x); }); }, undefined, true); });
      }
    });
    cal.addEventListener("pointerdown", function (ev) {
      if (ev.target !== cal) return; var dy = ev.clientY, dx = ev.clientX, t0 = Date.now();
      function up(e) {
        document.removeEventListener("pointerup", up);
        if (Math.abs(e.clientY - dy) > 9 || Math.abs(e.clientX - dx) > 9 || Date.now() - t0 > 450) return;
        var rect = cal.getBoundingClientRect(), lx = e.clientX - rect.left;
        if (lx > rect.width * 0.5 && showNow) {
          var tt = startTrackerNow(); renderToday(); renderNow();
          radialMenu(frequent(8), function (sel) { if (sel && sel.length) assignTimerMulti(tt, sel); else pickOne(function (x) { assignTimer(tt, x); }); }, function () { var ti = S.timers.indexOf(tt); if (ti >= 0) { S.timers.splice(ti, 1); save(); renderToday(); renderNow(); } }, true);
        } else {
          var tm = timeFromY(e.clientY - rect.top, startH, HP), id = uid();
          blocks(k).push({ id: id, time: tm, mins: 30, title: "New", prio: 2, color: "#8a5cf0", done: false }); reflow(k); save(); renderToday();
          var nb = blocks(k).filter(function (b) { return b.id === id; })[0];
          radialMenu(frequent(8), function (m) { if (m) assignBlock(nb, m, k); else pickOne(function (x) { assignBlock(nb, x, k); }); }, function () { var a = blocks(k), bi = a.indexOf(nb); if (bi >= 0) { a.splice(bi, 1); reflow(k); save(); renderToday(); } });
        }
      }
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
      col.onclick = function () { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
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
      cell.onclick = function () { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
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
    if (pendingScrollNow && nowLineEl) { var _nl = nowLineEl; requestAnimationFrame(function () { if (_nl.offsetParent !== null) { _nl.scrollIntoView({ block: "center" }); pendingScrollNow = false; } }); }
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
    add(B, "div", "lbl", "📌 pin = fixed time; flexible activities flow around it"); var pc = add(B, "div", "pchips"); var px = add(pc, "div", "pchip" + (b.pin ? " on" : ""), b.pin ? "📌 Pinned — fixed" : "📌 Pin to this time"); px.onclick = function () { b.pin = !b.pin; px.classList.toggle("on"); px.textContent = b.pin ? "📌 Pinned — fixed" : "📌 Pin to this time"; };
    var row = add(B, "div", "frm");
    add(row, "button", "add", b.done ? "✓ undo done" : "✓ Mark done").onclick = function () { b.done = !b.done; if (b.done) earn(8, {}); b.title = tx.value.trim() || b.title; b.time = tm.value; reflow(k); save(); closeSheet(); renderAll(); };
    add(row, "button", "add", "🗑 Delete").onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); closeSheet(); renderAll(); };
    add(B, "button", "done2", "Save").onclick = function () { b.title = tx.value.trim() || b.title; b.time = tm.value; reflow(k); save(); closeSheet(); renderAll(); };
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
  function renderAll() { renderHeader(); renderNow(); renderChar(); renderGame(); renderHero(); renderMood(); renderQuick(); renderToday(); renderHabits(); renderStats(); }

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
  function reflow(k) {
    var all = blocks(k).slice();
    var pins = all.filter(function (b) { return b.pin; }).map(function (b) { return { s: hm(b.time), e: hm(b.time) + (b.mins || 30) }; }).sort(function (a, b) { return a.s - b.s; });
    var flex = all.filter(function (b) { return !b.pin; }).sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var changed = false, cur = -1;
    flex.forEach(function (b) {
      var dur = b.mins || 30, s = cur < 0 ? hm(b.time) : Math.max(hm(b.time), cur), moved = true, guard = 0;
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
  function stopTimer(id) { var i = -1; S.timers.forEach(function (t, k) { if (t.id === id) i = k; }); if (i < 0) return; var t = S.timers[i], dk = t.dayK || key(new Date(t.start)), mins = Math.max(1, Math.round((Date.now() - t.start) / 60000)), d = new Date(t.start); logs(dk).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: t.title, mins: mins, habitId: t.habitId, catK: t.catK, color: t.color }); if (t.habitId) doneMap(dk)[t.habitId] = true; if (isTidy(t)) S.lastTidy = dk; earn(mins, { catK: t.catK }); S.timers.splice(i, 1); save(); renderAll(); }
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
      frequent: true, custom: false,
      head: function (B) {
        add(B, "div", "lbl", "how often");
        var c2 = add(B, "div", "pchips");
        [["Daily", 0], ["2× wk", 2], ["3× wk", 3], ["4× wk", 4], ["5× wk", 5], ["6× wk", 6]].forEach(function (t) {
          var x = add(c2, "div", "pchip" + (cfg.per === t[1] ? " on" : ""), t[0]);
          x.onclick = function () { cfg.per = t[1]; Array.prototype.forEach.call(c2.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); };
        });
      },
      onTask: function (t, picked, draw) { var ky = t.catK + "|" + t.title; if (picked[ky]) delete picked[ky]; else picked[ky] = t; draw(); },
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
    setInterval(function () { S.timers.forEach(function (t) { var r = el("tr_" + t.id); if (r) r.textContent = elapsedStr(t); }); }, 1000);
    el("planToday").onclick = function () { var t = nextFreeMin(viewK), id = uid(); blocks(viewK).push({ id: id, time: pad(Math.floor(t / 60)) + ":" + pad(t % 60), mins: 30, title: "New", prio: 2, color: "#8a5cf0", done: false }); reflow(viewK); save(); renderToday(); var nb = blocks(viewK).filter(function (b) { return b.id === id; })[0]; radialMenu(frequent(8), function (m) { if (m) assignBlock(nb, m, viewK); else pickOne(function (x) { assignBlock(nb, x, viewK); }); }, function () { var a = blocks(viewK), bi = a.indexOf(nb); if (bi >= 0) { a.splice(bi, 1); reflow(viewK); save(); renderToday(); } }); };
    el("addHabit").onclick = habitSheet;
    var gr = el("gear"); if (gr) gr.onclick = brainSheet;
    var gb = el("gameBtn"); if (gb) gb.onclick = openGame;
    var ew = el("enterWorld"); if (ew) ew.onclick = openGame;
    var gx = el("gameExit"); if (gx) gx.onclick = closeGame;
    var tw = el("toWorld"); if (tw) tw.onclick = openGame;
    el("dnPrev").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, -1) : zoomMode === "week" ? keyAdd(viewK, -7) : keyAdd(viewK, -1); renderToday(); };
    el("dnNext").onclick = function () { viewK = zoomMode === "month" ? monthAdd(viewK, 1) : zoomMode === "week" ? keyAdd(viewK, 7) : keyAdd(viewK, 1); renderToday(); };
    document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.onclick = function () { zoomMode = z.dataset.z; if (zoomMode === "day") pendingScrollNow = true; renderToday(); }; });
    document.querySelectorAll("#growTabs .zt").forEach(function (z) { z.onclick = function () { var g = z.dataset.g; document.querySelectorAll("#growTabs .zt").forEach(function (x) { x.classList.toggle("on", x === z); }); el("habitsPane").style.display = g === "habits" ? "" : "none"; el("statsPane").style.display = g === "stats" ? "" : "none"; }; });
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    var sx = el("sheetX"); if (sx) sx.onclick = closeSheet; var sh = document.querySelector(".shandle"); if (sh) sh.onclick = closeSheet;
    document.addEventListener("gesturestart", function (e) { e.preventDefault(); }); document.addEventListener("dblclick", function (e) { e.preventDefault(); });
    document.querySelectorAll("#nav .nb").forEach(function (b) { if (!b.dataset.tab) return; b.onclick = function () { var t = b.dataset.tab; document.querySelectorAll("#nav .nb").forEach(function (x) { x.classList.toggle("on", x === b); }); document.querySelectorAll(".tab").forEach(function (s) { s.classList.toggle("on", s.id === "t-" + t); }); window.scrollTo(0, 0); if (t === "self") { treeFit(); guardianFit(); } }; });
    var ntk = el("navTrack"); if (ntk) ntk.onclick = nowSheet;
    renderAll();
    openGame();   // game-as-home: the app opens into the world
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
