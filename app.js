/* ALTER v0.4 — Heroic-depth onboarding (identity → virtues → behaviors, per pillar,
   then hobbies + kryptonites) + saturated Powerpuff color. $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_v4";

  var PILLARS = [
    { k: "energy", label: "Energy", em: "⚡", color: "#1fb877", bg: "linear-gradient(180deg,#a9f0cf,#7fe3b4)",
      identities: ["Energized", "Strong", "Athletic", "Rested", "Disciplined", "Vital", "Calm", "Resilient"],
      virtues: ["Discipline", "Zest", "Temperance", "Vitality", "Consistency", "Grit"],
      behaviors: [{ k: "move", em: "🏃", label: "Move" }, { k: "sleep", em: "😴", label: "Sleep" }, { k: "eat", em: "🥗", label: "Eat well" }, { k: "breathe", em: "🌬️", label: "Breathe" }, { k: "hydrate", em: "💧", label: "Hydrate" }, { k: "cold", em: "🧊", label: "Cold shower" }, { k: "walk", em: "🚶", label: "Walk" }, { k: "tidy", em: "🧹", label: "Tidy", task: true }] },
    { k: "work", label: "Work", em: "💼", color: "#2a8fe0", bg: "linear-gradient(180deg,#aadcff,#7cc2f5)",
      identities: ["A shipper", "Focused", "Creative", "Wealthy", "Bold", "Prolific", "Strategic", "A master"],
      virtues: ["Courage", "Focus", "Discipline", "Wisdom", "Grit", "Boldness"],
      behaviors: [{ k: "focus", em: "🧠", label: "Deep work" }, { k: "send", em: "✦", label: "Ship/send", send: true }, { k: "create", em: "🎨", label: "Create" }, { k: "learn", em: "📚", label: "Learn" }, { k: "money", em: "💰", label: "Money" }, { k: "plan", em: "🗒️", label: "Plan" }] },
    { k: "love", label: "Love", em: "❤️", color: "#ff3f93", bg: "linear-gradient(180deg,#ffc2de,#ff9ac8)",
      identities: ["Present", "Warm", "Playful", "Connected", "Generous", "Open", "Grateful", "Loving"],
      virtues: ["Love", "Gratitude", "Hope", "Presence", "Compassion", "Joy"],
      behaviors: [{ k: "connect", em: "💬", label: "Connect" }, { k: "gratitude", em: "🙏", label: "Gratitude" }, { k: "rest", em: "🛋️", label: "Rest" }, { k: "play", em: "🎮", label: "Play" }, { k: "call", em: "📞", label: "Reach out" }] }
  ];
  var HOB = { color: "#9a4fe0", bg: "linear-gradient(180deg,#e0c2ff,#c89af0)", opts: [{ k: "guitar", em: "🎸", label: "Guitar" }, { k: "draw", em: "✏️", label: "Draw" }, { k: "read", em: "📖", label: "Read" }, { k: "cook", em: "🍳", label: "Cook" }, { k: "photo", em: "📷", label: "Photo" }, { k: "write", em: "✍️", label: "Write" }, { k: "dance", em: "💃", label: "Dance" }, { k: "code", em: "💻", label: "Code" }] };
  var KRY = { color: "#ff6a3d", bg: "linear-gradient(180deg,#ffcdb3,#ffae8a)", opts: [{ k: "weed", em: "🌿", label: "Weed" }, { k: "scroll", em: "📱", label: "Scrolling" }, { k: "porn", em: "🔞", label: "Porn" }, { k: "cigs", em: "🚬", label: "Cigarettes" }, { k: "sugar", em: "🍬", label: "Sugar" }, { k: "booze", em: "🍷", label: "Alcohol" }, { k: "junk", em: "🍔", label: "Junk food" }] };
  var SUBTASKS = ["Make the bed", "Clear the table", "Laundry", "Sweep the floor", "Clear the desk"];

  // flat lookup of all loggable goals
  var ALL = {};
  PILLARS.forEach(function (p) { p.behaviors.forEach(function (g) { ALL[g.k] = { g: g, color: p.color, pillar: p }; }); });
  HOB.opts.forEach(function (g) { ALL[g.k] = { g: g, color: HOB.color, hobby: true }; });
  KRY.opts.forEach(function (g) { ALL[g.k] = { g: g, color: "#1fb877", anti: true }; });

  function freshState() {
    return { onboarded: false, identity: {}, virtues: {}, behaviors: [], hobbies: [], kryptonites: [],
      total: 0, today: 0, sends: 0, sentToday: false, lastDay: dayKey(), lastKind: null };
  }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var S;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch (e) { S = freshState(); }
    if (S.lastDay !== dayKey()) { S.today = 0; S.sentToday = false; S.lastDay = dayKey(); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function phase() { var h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function greeting() { var p = phase(); return (p === "night" ? "hey" : p) + " 🌸"; }
  function moveLabel() { var p = phase(); return p === "evening" ? "how'd today go?" : p === "night" ? "one for the night" : "what's the move?"; }

  // ---- canvas (candy scene + cute char) -----------------------------------
  var LW = 176, LH = 312, ctx, stage, T0 = performance.now(), flashT = 0;
  function fit() { stage = el("stage"); ctx = stage.getContext("2d");
    var SC = Math.max(1, Math.min(5, Math.floor(Math.min(window.innerWidth / LW, window.innerHeight / LH))));
    stage.width = LW * SC; stage.height = LH * SC; stage.style.width = (LW * SC) + "px"; stage.style.height = (LH * SC) + "px";
    ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false; }
  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function render() {
    var t = (performance.now() - T0) / 1000, bob = Math.round(Math.sin(t * 1.8) * 1.4), active = S.today > 0, night = phase() === "night";
    var g = ctx.createLinearGradient(0, 0, 0, LH);
    if (night) { g.addColorStop(0, "#6f93d8"); g.addColorStop(.55, "#a98fd0"); g.addColorStop(1, "#e890c0"); }
    else { g.addColorStop(0, "#7fd4ff"); g.addColorStop(.5, "#c4a8ff"); g.addColorStop(1, "#ffb3da"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
    cloud(26, 54); cloud(120, 38);
    if (night) { px(40, 30, 2, 2, "#fff"); px(140, 60, 2, 2, "#fff"); px(90, 24, 2, 2, "#fff"); }
    px(138, 70, 18, 18, night ? "#fff3c0" : "#ffd23a"); px(140, 68, 14, 22, night ? "#fff3c0" : "#ffd23a");
    px(0, 246, LW, LH - 246, "#7fdca0"); px(0, 246, LW, 4, "#5fc888"); px(0, 246, LW, 1, "#bff5d0");
    if (S.total >= 1) flower(34, 252, "#ff5fa8"); if (S.total >= 2) flower(150, 256, "#ffd23a");
    if (S.total >= 4) flower(58, 270, "#3ac0f0"); if (S.total >= 6) flower(120, 264, "#b06ff0");
    if (S.total >= 3) star(28, 96, "#fff27a"); if (S.total >= 5) heart(146, 96, "#ff5fa8");
    if (S.sends >= 1) star(150, 28, "#fff");
    drawChar(LW / 2, 250, bob, active);
    if (flashT > 0) flashT -= 1 / 60; requestAnimationFrame(render);
  }
  function cloud(x, y) { px(x, y, 22, 8, "#fff"); px(x + 4, y - 4, 14, 6, "#fff"); px(x - 3, y + 2, 6, 5, "#fff"); px(x + 20, y + 2, 6, 5, "#fff"); }
  function star(x, y, c) { px(x + 2, y, 2, 6, c); px(x, y + 2, 6, 2, c); }
  function heart(x, y, c) { px(x, y + 1, 3, 3, c); px(x + 4, y + 1, 3, 3, c); px(x + 1, y + 3, 5, 2, c); px(x + 2, y + 5, 3, 1, c); }
  function flower(x, y, c) { px(x + 2, y - 4, 2, 4, "#3aa85a"); px(x, y - 6, 2, 2, c); px(x + 4, y - 6, 2, 2, c); px(x + 2, y - 8, 2, 2, c); px(x + 2, y - 6, 2, 2, "#fff3a0"); }
  function drawChar(cx, groundY, bob, active) {
    var x = Math.round(cx - 15), y = groundY - 46 + bob, dark = "#3a2f4a", skin = "#ffe0c4", dress = "#ff3f93", shoe = "#6a5a82";
    ctx.globalAlpha = .16; px(x + 3, groundY + 1, 24, 4, "#3a2f4a"); ctx.globalAlpha = 1;
    px(x + 10, y + 34, 4, 8, skin); px(x + 16, y + 34, 4, 8, skin); px(x + 9, groundY - 2, 6, 3, shoe); px(x + 15, groundY - 2, 6, 3, shoe);
    px(x + 8, y + 26, 14, 10, dress); px(x + 6, y + 32, 18, 4, dress); px(x + 4, y + 27, 4, 7, skin); px(x + 22, y + 27, 4, 7, skin);
    px(x + 5, y - 1, 20, 2, dark); px(x + 3, y + 1, 24, 2, dark); px(x + 1, y + 3, 28, 16, dark); px(x + 3, y + 19, 24, 2, dark); px(x + 6, y + 21, 18, 2, dark);
    px(x + 6, y + 1, 18, 2, skin); px(x + 4, y + 3, 22, 2, skin); px(x + 2, y + 5, 26, 12, skin); px(x + 4, y + 17, 22, 2, skin); px(x + 7, y + 19, 16, 2, skin);
    px(x + 4, y - 1, 22, 4, "#7a5298");
    px(x + 5, y + 6, 9, 10, dark); px(x + 6, y + 7, 7, 8, "#fff"); px(x + 16, y + 6, 9, 10, dark); px(x + 17, y + 7, 7, 8, "#fff");
    px(x + 8, y + 9, 4, 5, "#3a9ae6"); px(x + 9, y + 10, 2, 3, "#23203a"); px(x + 9, y + 10, 1, 1, "#fff");
    px(x + 19, y + 9, 4, 5, "#3a9ae6"); px(x + 20, y + 10, 2, 3, "#23203a"); px(x + 20, y + 10, 1, 1, "#fff");
    ctx.globalAlpha = .55; px(x + 3, y + 14, 4, 3, "#ff5fa8"); px(x + 23, y + 14, 4, 3, "#ff5fa8"); ctx.globalAlpha = 1;
    px(x + 12, y + 17, 6, 1, "#c46a8a"); px(x + 11, y + 16, 1, 1, "#c46a8a"); px(x + 18, y + 16, 1, 1, "#c46a8a");
    if (active) { ctx.globalAlpha = .16; px(x - 2, y - 2, 34, 48, "#fff3a0"); ctx.globalAlpha = 1; }
    if (flashT > 0) { ctx.globalAlpha = Math.min(.8, flashT * 2); px(x - 2, y - 2, 34, 50, "#fff"); ctx.globalAlpha = 1; }
  }

  function mirror() {
    if (S.lastKind && ALL[S.lastKind] && ALL[S.lastKind].anti) return "you stayed free. that's a real win — feel it.";
    if (S.lastKind === "send") return "you shipped it. that's the whole game — go live.";
    if (!S.lastKind && S.today === 0) { var p = phase();
      if (p === "morning") return "morning. recommit, then one small move.";
      if (p === "evening") return "evening. what did you actually move today?";
      if (p === "night") return "it's late — one gentle thing, or just rest."; return "you're here. what's one small move?"; }
    if (S.today >= 3) return "three real moves in. that's a good day, up close.";
    return "logged. that's how it builds — one step.";
  }
  function reward(color, big) { flashT = big ? .5 : .3;
    try { if (navigator.vibrate) navigator.vibrate(big ? [10, 40, 12] : [13]); } catch (e) {}
    var b = el("bloom"); b.style.background = "radial-gradient(circle at 50% 56%," + (color || "#ff5fa8") + ",transparent 66%)";
    b.style.transition = "none"; b.style.opacity = big ? "0.62" : "0.42";
    requestAnimationFrame(function () { b.style.transition = "opacity 1.1s ease-out"; b.style.opacity = "0"; }); }
  function logGoal(key, keepOpen) { var r = ALL[key]; if (!r) return; var send = !!r.g.send;
    S.total += 1; S.today += 1; S.lastKind = key; if (send) { S.sends += 1; S.sentToday = true; }
    reward(r.anti ? "#1fb877" : (send ? "#ffd23a" : r.color), send); save(); paintHome(); if (!keepOpen) closeSheet(); }

  function paintHome() {
    el("greet").textContent = greeting(); el("mirror").querySelector("span").textContent = mirror();
    el("moveBtn").textContent = moveLabel();
    var dot = document.querySelector("#lume .dot"); if (dot) { dot.style.opacity = Math.min(1, .25 + S.today * .22); dot.style.boxShadow = "0 0 " + (4 + S.today * 3) + "px var(--yellow)"; } }
  function openSheet() { buildSheet(); el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }
  function grp(title, color) { var h = document.createElement("div"); h.textContent = title; h.style.cssText = "font-size:12px;color:" + color + ";font-weight:800;margin:10px 2px 8px;"; return h; }
  function tileBtn(g, onClick, send) { var b = document.createElement("button"); b.className = "tile" + (send ? " send" : ""); b.innerHTML = '<span class="em">' + g.em + "</span>" + g.label; b.onclick = onClick; return b; }
  function buildSheet() {
    el("sheetT").textContent = "what did you do?"; var body = el("sheetBody"); body.innerHTML = "";
    PILLARS.forEach(function (p) {
      var mine = p.behaviors.filter(function (g) { return S.behaviors.indexOf(g.k) !== -1; });
      if (!mine.length) return; body.appendChild(grp(p.em + " " + p.label, p.color));
      var grid = document.createElement("div"); grid.className = "grid";
      mine.forEach(function (g) { grid.appendChild(tileBtn(g, function () { g.task ? buildSubtasks(g) : logGoal(g.k); }, g.send)); });
      body.appendChild(grid);
    });
    if (S.hobbies.length) { body.appendChild(grp("🎈 Hobbies", HOB.color)); var hg = document.createElement("div"); hg.className = "grid";
      HOB.opts.filter(function (g) { return S.hobbies.indexOf(g.k) !== -1; }).forEach(function (g) { hg.appendChild(tileBtn(g, function () { logGoal(g.k); })); }); body.appendChild(hg); }
    if (S.kryptonites.length) { body.appendChild(grp("💪 Stayed strong", "#1fb877")); var kg = document.createElement("div"); kg.className = "grid";
      KRY.opts.filter(function (g) { return S.kryptonites.indexOf(g.k) !== -1; }).forEach(function (g) { kg.appendChild(tileBtn({ em: "✊", label: "No " + g.label.toLowerCase() }, function () { logGoal(g.k); })); }); body.appendChild(kg); }
    if (!body.children.length) { body.appendChild(grp("tap a quick win", "#8a7ba0")); }
  }
  function buildSubtasks(g) { el("sheetT").textContent = "tidy — one small step at a time"; var body = el("sheetBody"); body.innerHTML = ""; var picked = {};
    SUBTASKS.forEach(function (label, i) { var item = document.createElement("div"); item.className = "subitem"; item.innerHTML = '<span class="box"></span><span>' + label + "</span>";
      item.onclick = function () { if (picked[i]) return; picked[i] = true; item.classList.add("done"); logGoal(g.k, true); }; body.appendChild(item); });
    var back = document.createElement("button"); back.className = "back"; back.textContent = "done"; back.onclick = closeSheet; body.appendChild(back); }

  // ---- onboarding wizard --------------------------------------------------
  var STEPS = [{ intro: true }];
  PILLARS.forEach(function (p) {
    STEPS.push({ color: p.color, bg: p.bg, title: p.em + " your " + p.label + " identity", sub: "who are you becoming here? pick all that fit", store: "id_" + p.k, opts: p.identities.map(function (x) { return { label: x }; }), chips: true });
    STEPS.push({ color: p.color, bg: p.bg, title: p.em + " " + p.label + " virtues", sub: "what you'll recommit to every morning", store: "vt_" + p.k, opts: p.virtues.map(function (x) { return { label: x }; }), chips: true });
    STEPS.push({ color: p.color, bg: p.bg, title: p.em + " " + p.label + " behaviors", sub: "what you'll actually do", store: "bh_" + p.k, opts: p.behaviors, grid: true });
  });
  STEPS.push({ color: HOB.color, bg: HOB.bg, title: "🎈 your hobbies", sub: "what lights you up?", store: "hob", opts: HOB.opts, grid: true });
  STEPS.push({ color: KRY.color, bg: KRY.bg, title: "💥 your kryptonites", sub: "what do you want to break free from? we'll make it feel like escape, not sacrifice", store: "kry", opts: KRY.opts, grid: true });

  var si = 0, sel = {};
  function pickSet(store) { return (sel[store] = sel[store] || {}); }
  function startOb() { el("ob").classList.add("on"); el("moveBtn").style.display = "none"; el("hud").style.opacity = "0"; el("mirror").style.opacity = "0"; renderStep(); }
  function finishOb() {
    function arr(s) { var o = pickSet(s); return Object.keys(o).filter(function (k) { return o[k]; }); }
    S.identity = { energy: arr("id_energy"), work: arr("id_work"), love: arr("id_love") };
    S.virtues = { energy: arr("vt_energy"), work: arr("vt_work"), love: arr("vt_love") };
    S.behaviors = arr("bh_energy").concat(arr("bh_work"), arr("bh_love"));
    S.hobbies = arr("hob"); S.kryptonites = arr("kry"); S.onboarded = true; save();
    el("ob").classList.remove("on"); el("moveBtn").style.display = ""; el("hud").style.opacity = "1"; el("mirror").style.opacity = "1"; paintHome();
  }
  function renderStep() {
    var st = STEPS[si], line = el("obLine"), ctl = el("obCtl"); ctl.innerHTML = ""; el("ob").scrollTop = 0;
    var bar = document.querySelector("#obBar i"); if (bar) bar.style.width = Math.round((si / (STEPS.length - 1)) * 100) + "%";
    if (st.intro) {
      el("ob").style.background = "linear-gradient(180deg,#7fd4ff,#ffb3da)";
      line.innerHTML = "let's build who you're becoming 🌟<small>three parts — Energy, Work, Love. for each: your identity, the virtues you recommit each morning, then the behaviors. then hobbies + what you're quitting.</small>";
      ctl.appendChild(obBtn("start →", "#ff3f93", function () { si = 1; renderStep(); })); return;
    }
    el("ob").style.background = st.bg;
    var pct = Math.round((si / (STEPS.length - 1)) * 100);
    line.innerHTML = st.title + "<small>" + st.sub + "  ·  " + pct + "%</small>";
    var ps = pickSet(st.store);
    if (st.chips) {
      st.opts.forEach(function (o) { var on = !!ps[o.label]; var b = document.createElement("button"); b.textContent = o.label;
        b.style.cssText = chipCss(on, st.color); b.onclick = function () { ps[o.label] = !ps[o.label]; renderStep(); }; ctl.appendChild(b); });
    } else {
      var grid = document.createElement("div"); grid.className = "grid";
      st.opts.forEach(function (o) { var on = !!ps[o.k]; var b = document.createElement("button"); b.className = "tile"; b.innerHTML = '<span class="em">' + o.em + "</span>" + o.label;
        if (on) { b.style.background = st.color; b.style.color = "#fff"; b.style.borderColor = st.color; }
        b.onclick = function () { ps[o.k] = !ps[o.k]; renderStep(); }; grid.appendChild(b); });
      ctl.appendChild(grid);
    }
    var last = si === STEPS.length - 1;
    ctl.appendChild(obBtn(last ? "let's go ✨" : "next →", st.color, function () { if (last) finishOb(); else { si += 1; renderStep(); } }));
  }
  function obBtn(label, color, fn) { var b = document.createElement("button"); b.className = "obBtn"; b.textContent = label;
    b.style.background = color; b.style.boxShadow = "0 8px 22px " + color + "66"; b.onclick = fn; return b; }
  function chipCss(on, color) { return "width:100%;max-width:440px;margin:0 auto 9px;display:block;padding:14px;border-radius:16px;font-size:15px;font-weight:800;cursor:pointer;" +
    (on ? "background:" + color + ";border:2.5px solid " + color + ";color:#fff;box-shadow:0 4px 14px " + color + "55;" : "background:rgba(255,255,255,.85);border:2.5px solid rgba(255,255,255,.95);color:#5a4a72;"); }

  function init() {
    load(); fit(); window.addEventListener("resize", fit);
    el("greet").style.background = "#ffd0ea"; el("lume").style.background = "#cfeaff";
    el("mirror").querySelector("span").style.background = "#ece0ff";
    el("moveBtn").onclick = openSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    el("sheetClose").onclick = closeSheet; paintHome(); requestAnimationFrame(render);
    if (!S.onboarded) startOb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
