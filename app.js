/* ALTER v0.9 — Toggl-style time tracking + Streaks-style habits + auto-adjusting
   priority schedule (falls behind → reflows from now, drops lowest priority). $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_plan2";
  var DAY_END = 24 * 60; // minutes; the day "runs out" at midnight

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

  var DEFAULT_HABITS = [{ id: "move", e: "🏃", l: "Move" }, { id: "deep", e: "🧠", l: "Deep work" }, { id: "tidy", e: "🧹", l: "Tidy space" }, { id: "read", e: "📖", l: "Read" }, { id: "breathe", e: "🌬️", l: "Breathe" }, { id: "send", e: "✦", l: "Ship one thing" }];
  var TIDY_SUB = ["Make the bed", "Clear the table", "Do laundry", "Sweep / vacuum", "Clear the desk", "Take out trash"];
  var QUICK = ["Work", "Break", "Eat", "Errand", "Scroll", "Rest"];
  var DURS = [5, 15, 25, 45, 60, 90];
  var PRIOS = [{ v: 3, l: "Must", c: "#ff5fa8" }, { v: 2, l: "Should", c: "#8a5cf0" }, { v: 1, l: "Nice", c: "#b9b0cf" }];
  function prioC(v) { for (var i = 0; i < PRIOS.length; i++) if (PRIOS[i].v === v) return PRIOS[i].c; return "#8a5cf0"; }

  var S;
  function fresh() { return { habits: DEFAULT_HABITS.slice(), habitDone: {}, blocks: {}, log: {}, lastTidy: null }; }
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch (e) { S = fresh(); } S.habits = S.habits && S.habits.length ? S.habits : DEFAULT_HABITS.slice(); S.habitDone = S.habitDone || {}; S.blocks = S.blocks || {}; S.log = S.log || {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function blocks(k) { return (S.blocks[k] = S.blocks[k] || []); }
  function logs(k) { return (S.log[k] = S.log[k] || []); }
  function doneMap(k) { return (S.habitDone[k] = S.habitDone[k] || {}); }
  function phase() { var h = new Date().getHours(); return h < 5 ? "night" : h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function undone() { var dm = doneMap(todayK()); return S.habits.filter(function (h) { return !dm[h.id]; }); }
  function messy() { return daysSince(S.lastTidy) >= 2; }
  function streak(id) { var d = new Date(); if (!(S.habitDone[key(d)] || {})[id]) d.setDate(d.getDate() - 1); var n = 0; for (;;) { if ((S.habitDone[key(d)] || {})[id]) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }

  // ---- auto-adjusting priority schedule ----------------------------------
  function schedule(k) {
    var pend = blocks(k).filter(function (b) { return !b.done; }).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    function fit(list) { var cur = nowMin(), out = []; list.forEach(function (b) { var st = Math.max(cur, hm(b.time)); out.push({ b: b, st: st }); cur = st + (b.mins || 30); }); return { sched: out, end: cur }; }
    var active = pend.slice(), bumped = [], r = fit(active);
    while (r.end > DAY_END && active.length) {
      var lp = 99, idx = 0; // drop lowest priority; tiebreak the latest one
      for (var i = 0; i < active.length; i++) { var pr = active[i].prio || 2; if (pr < lp || (pr === lp && hm(active[i].time) >= hm(active[idx].time))) { lp = Math.min(lp, pr); if ((active[i].prio || 2) <= lp) idx = i; } }
      bumped.push(active.splice(idx, 1)[0]); r = fit(active);
    }
    return { sched: r.sched, bumped: bumped, over: Math.max(0, r.end - DAY_END) };
  }

  // ---- proactive ----------------------------------------------------------
  function proactive() {
    var p = phase(), und = undone(), sc = schedule(todayK()), out = { chips: [] };
    if (sc.bumped.length) { out.kicker = "running tight"; out.line = "You're over by " + dur(sc.over) + " today."; out.sub = "I bumped " + sc.bumped.length + " low-priority " + (sc.bumped.length === 1 ? "slot" : "slots") + " so the important stuff survives."; out.primary = { label: "Review today", fn: function () { window.scrollTo({ top: 220, behavior: "smooth" }); } }; out.chips.push({ label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }); return out; }
    if (p === "night") { out.kicker = "tonight"; out.line = "It's " + fmt(nowMin()) + " — set tomorrow up."; out.sub = "five minutes now and the morning runs itself."; out.primary = { label: "Plan tomorrow ✨", fn: function () { planSheet(tomK(), "tomorrow"); } }; out.chips.push({ label: "Plan rest of tonight", fn: function () { planSheet(todayK(), "tonight"); } }); if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else if (p === "morning") { out.kicker = "this morning"; out.line = "Good morning — block out today?"; out.sub = und.length + " habits waiting · " + (blocks(todayK()).length ? blocks(todayK()).length + " slots set" : "nothing scheduled"); out.primary = { label: "Plan your day ☀️", fn: function () { planSheet(todayK(), "today"); } }; if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    else { if (!blocks(todayK()).length) { out.kicker = p; out.line = "No plan yet — shape the day."; out.sub = "block your next few hours."; out.primary = { label: "Plan the day 🎯", fn: function () { planSheet(todayK(), "today"); } }; } else if (und.length) { out.kicker = p; out.line = und.length + (und.length === 1 ? " habit left." : " habits left."); out.sub = "knock one out while you've got momentum."; out.primary = { label: "Log what you're doing", fn: nowSheet }; } else { out.kicker = p; out.line = "On track. Nice."; out.sub = "get ahead on tomorrow?"; out.primary = { label: "Plan tomorrow", fn: function () { planSheet(tomK(), "tomorrow"); } }; } if (messy()) out.chips.push({ label: "Tidy up 🧹", fn: tidySheet }); }
    return out;
  }

  // ---- render -------------------------------------------------------------
  function add(p, tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; p.appendChild(e); return e; }
  function dot(c) { var s = document.createElement("span"); s.style.cssText = "width:9px;height:9px;border-radius:50%;flex:none;background:" + c; return s; }

  function renderHeader() { el("date").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }); var p = phase(); el("hello").textContent = (p === "morning" ? "Good morning" : p === "afternoon" ? "Good afternoon" : p === "evening" ? "Good evening" : "Hey") + " 👋"; }
  function renderHero() { var pr = proactive(), h = el("hero"); h.innerHTML = ""; add(h, "div", "ht", pr.kicker); add(h, "div", "hl", pr.line); add(h, "div", "hs", pr.sub); add(h, "button", "hp", pr.primary.label).onclick = pr.primary.fn; if (pr.chips.length) { var c = add(h, "div", "chips"); pr.chips.forEach(function (ch) { add(c, "div", "chip", ch.label).onclick = ch.fn; }); } }

  function renderToday() {
    var L = el("todayList"); L.innerHTML = ""; var k = todayK();
    var doneB = blocks(k).filter(function (b) { return b.done; }).sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var sc = schedule(k);
    if (!blocks(k).length) { add(L, "div", "empty", "No slots yet. Tap “+ time slot” to block your time."); }
    doneB.forEach(function (b) { row(L, b, hm(b.time), true, false); });
    sc.sched.forEach(function (o) { row(L, o.b, o.st, false, Math.abs(o.st - hm(o.b.time)) > 1); });
    sc.bumped.forEach(function (b) {
      var r = add(L, "div", "blk"); r.style.opacity = ".55";
      add(r, "div", "tm", "bumped"); var ti = add(r, "div", "ti", b.title); ti.style.textDecoration = "line-through";
      var mv = add(r, "div", "del", "→ tmrw"); mv.style.cssText = "color:var(--accent);font-size:12px;font-weight:600;"; mv.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); blocks(tomK()).push(b); save(); renderAll(); };
    });
    function row(P, b, st, done, moved) {
      var r = add(P, "div", "blk" + (done ? " done" : ""));
      var tm = add(r, "div", "tm", fmt(st) + "–" + fmt(st + (b.mins || 30))); if (moved) tm.title = "moved from " + fmt(hm(b.time));
      var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio || 2))); var sp = document.createElement("span"); sp.textContent = b.title + (moved ? "  ⤵" : ""); ti.appendChild(sp);
      var ck = add(r, "div", "ck" + (done ? " on" : ""), done ? "✓" : ""); ck.onclick = function () { b.done = !b.done; save(); renderAll(); };
      var d = add(r, "div", "del", "✕"); d.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); renderAll(); };
    }
    // tracked log
    var LG = el("logList"); LG.innerHTML = ""; var lg = logs(k).slice().sort(function (a, b) { return hm(b.time) - hm(a.time); }); var tot = 0;
    logs(k).forEach(function (e) { tot += e.mins || 0; });
    if (!lg.length) add(LG, "div", "empty", "Nothing tracked yet — hit “What are you doing?”");
    lg.forEach(function (e) { var r = add(LG, "div", "logi"); add(r, "div", "lt", fmt(hm(e.time))); add(r, "div", "ln", e.title); add(r, "div", "lm", dur(e.mins || 0)); });
    el("trackTotal").textContent = tot ? dur(tot) : "";
  }

  function renderTom() { var L = el("tomList"); L.innerHTML = ""; var arr = blocks(tomK()).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }); if (!arr.length) { add(L, "div", "empty", "Plan tomorrow tonight — future-you says thanks."); return; }
    arr.forEach(function (b) { var r = add(L, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + (b.mins || 30))); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio || 2))); var sp = document.createElement("span"); sp.textContent = b.title; ti.appendChild(sp); var d = add(r, "div", "del", "✕"); d.onclick = function () { var a = blocks(tomK()); a.splice(a.indexOf(b), 1); save(); renderTom(); }; }); }

  function renderHabits() { var L = el("habitList"); L.innerHTML = ""; var dm = doneMap(todayK()), done = 0;
    S.habits.forEach(function (hb) { var on = !!dm[hb.id]; if (on) done++; var r = add(L, "div", "hab" + (on ? " done" : "")); add(r, "div", "he", hb.e); add(r, "div", "hn", hb.l); var st = streak(hb.id); if (st > 1) { var s = add(r, "div", null, "🔥 " + st); s.style.cssText = "font-size:13px;color:var(--amber);font-weight:600;margin-right:2px;"; } add(r, "div", "ck" + (on ? " on" : ""), on ? "✓" : ""); r.onclick = function () { toggleHabit(hb.id); }; });
    el("habitProg").textContent = done + "/" + S.habits.length + " today"; }
  function toggleHabit(id) { var dm = doneMap(todayK()); dm[id] = !dm[id]; if (id === "tidy" && dm[id]) S.lastTidy = todayK(); save(); renderHabits(); renderHero(); }

  function renderAll() { renderHeader(); renderHero(); renderToday(); renderTom(); renderHabits(); }

  // ---- sheets -------------------------------------------------------------
  function openSheet() { el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }

  function nowSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "What are you doing?");
    var chosen = { title: "", habitId: null, mins: 25 };
    var c1 = add(B, "div", "pchips");
    S.habits.forEach(function (h) { var x = add(c1, "div", "pchip", h.e + " " + h.l); x.onclick = function () { sel(x, c1); chosen.title = h.l; chosen.habitId = h.id; }; });
    QUICK.forEach(function (q) { var x = add(c1, "div", "pchip", q); x.onclick = function () { sel(x, c1); chosen.title = q; chosen.habitId = null; }; });
    var txt = document.createElement("input"); txt.type = "text"; txt.placeholder = "…or type it"; txt.style.cssText = "width:100%;margin-bottom:14px;"; txt.oninput = function () { chosen.title = txt.value; chosen.habitId = null; clearSel(c1); }; B.appendChild(txt);
    add(B, "div", "lbl", "How long did it take?");
    var c2 = add(B, "div", "pchips"); DURS.forEach(function (m, i) { var x = add(c2, "div", "pchip" + (m === 25 ? " on" : ""), m < 60 ? m + "m" : (m / 60) + "h"); x.onclick = function () { sel(x, c2); chosen.mins = m; }; });
    add(B, "button", "done2", "Log it ⏱️").onclick = function () { if (!chosen.title.trim()) return; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: chosen.title.trim(), mins: chosen.mins, habitId: chosen.habitId }); if (chosen.habitId) doneMap(todayK())[chosen.habitId] = true; save(); closeSheet(); renderAll(); };
    function sel(x, parent) { clearSel(parent); x.classList.add("on"); }
    function clearSel(parent) { Array.prototype.forEach.call(parent.children, function (n) { n.classList.remove("on"); }); }
  }

  function planSheet(k, label) {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", "Plan " + label);
    var st = { prio: 2 };
    var frm = add(B, "div", "frm");
    var time = document.createElement("input"); time.type = "time"; var d = new Date(); d.setMinutes(d.getMinutes() > 30 ? 60 : 30, 0, 0); time.value = pad(d.getHours()) + ":" + pad(d.getMinutes());
    var txt = document.createElement("input"); txt.type = "text"; txt.placeholder = "e.g. Laundry, Gym, Deep work…";
    frm.appendChild(time); frm.appendChild(txt);
    add(B, "div", "lbl", "How long?"); var c2 = add(B, "div", "pchips"); st.mins = 30; DURS.forEach(function (m) { var x = add(c2, "div", "pchip" + (m === 30 ? "" : ""), m < 60 ? m + "m" : (m / 60) + "h"); if (m === 60) x.classList.add("on"); x.onclick = function () { Array.prototype.forEach.call(c2.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); st.mins = m; }; }); st.mins = 60;
    add(B, "div", "lbl", "Priority — least important gets dropped if you run out of time"); var c3 = add(B, "div", "pchips");
    PRIOS.forEach(function (p) { var x = add(c3, "div", "pchip" + (p.v === 2 ? " on" : ""), p.l); x.style.borderColor = p.c; x.onclick = function () { Array.prototype.forEach.call(c3.children, function (n) { n.classList.remove("on"); }); x.classList.add("on"); st.prio = p.v; }; });
    var list = add(B, "div"); list.style.marginTop = "12px";
    function refresh() { list.innerHTML = ""; blocks(k).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); }).forEach(function (b) { var r = add(list, "div", "blk"); add(r, "div", "tm", fmt(hm(b.time)) + "–" + fmt(hm(b.time) + b.mins)); var ti = add(r, "div", "ti"); ti.style.cssText = "display:flex;align-items:center;gap:7px;"; ti.appendChild(dot(prioC(b.prio))); var sp = document.createElement("span"); sp.textContent = b.title; ti.appendChild(sp); var del = add(r, "div", "del", "✕"); del.onclick = function () { var a = blocks(k); a.splice(a.indexOf(b), 1); save(); refresh(); }; }); }
    function addIt() { var v = txt.value.trim(); if (!v) return; blocks(k).push({ id: uid(), time: time.value, mins: st.mins, title: v, prio: st.prio, done: false }); save(); txt.value = ""; refresh(); }
    var go = add(frm, "button", "go", "+"); go.onclick = addIt; txt.addEventListener("keydown", function (e) { if (e.key === "Enter") addIt(); });
    refresh();
    add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); };
  }

  function tidySheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Tidy up — one step at a time"); var picked = {};
    TIDY_SUB.forEach(function (lbl, i) { var r = add(B, "div", "subi"); var ck = add(r, "div", "ck"); add(r, "div", null, lbl).style.flex = "1"; r.onclick = function () { if (picked[i]) return; picked[i] = true; ck.className = "ck on"; ck.textContent = "✓"; S.lastTidy = todayK(); doneMap(todayK()).tidy = true; var d = new Date(); logs(todayK()).push({ id: uid(), time: pad(d.getHours()) + ":" + pad(d.getMinutes()), title: lbl, mins: 10, habitId: "tidy" }); save(); }; });
    add(B, "button", "done2", "Done").onclick = function () { closeSheet(); renderAll(); }; }

  function habitSheet() { var B = el("sheetBody"); B.innerHTML = ""; openSheet(); add(B, "div", "sttl", "Add a habit"); var frm = add(B, "div", "frm"); var emo = document.createElement("input"); emo.type = "text"; emo.value = "⭐"; emo.style.cssText = "width:64px;text-align:center;"; var txt = document.createElement("input"); txt.type = "text"; txt.placeholder = "e.g. Meditate, Guitar, No scrolling…"; frm.appendChild(emo); frm.appendChild(txt);
    add(B, "button", "done2", "Add habit").onclick = function () { var v = txt.value.trim(); if (!v) return; S.habits.push({ id: uid(), e: (emo.value || "⭐").slice(0, 2), l: v }); save(); closeSheet(); renderHabits(); }; }

  function init() { load();
    el("nowBtn").onclick = nowSheet;
    el("planToday").onclick = function () { planSheet(todayK(), phase() === "night" ? "tonight" : "today"); };
    el("planTom").onclick = function () { planSheet(tomK(), "tomorrow"); };
    el("addHabit").onclick = habitSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    renderAll();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
