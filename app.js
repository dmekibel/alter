/* ALTER v0.7 — beautiful pixel art + modern animation (breathe, blink, hop, particle bursts).
   Big-3 identity onboarding, candy palette, Energy off-green. $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_v4";

  var PILLARS = [
    { k: "energy", label: "Energy", em: "⚡", color: "#ff8a1e", bg: "linear-gradient(180deg,#ffe0a8,#ffb35e)",
      identities: ["World-class athlete", "Calm & centered", "Unstoppable energy", "Lean & strong", "Fully rested", "A disciplined machine"],
      virtues: ["Discipline", "Zest", "Temperance", "Vitality", "Consistency", "Grit"],
      behaviors: [{ k: "move", em: "🏃", label: "Move" }, { k: "sleep", em: "😴", label: "Sleep" }, { k: "eat", em: "🥗", label: "Eat well" }, { k: "breathe", em: "🌬️", label: "Breathe" }, { k: "hydrate", em: "💧", label: "Hydrate" }, { k: "cold", em: "🧊", label: "Cold shower" }, { k: "walk", em: "🚶", label: "Walk" }, { k: "tidy", em: "🧹", label: "Tidy", task: true }] },
    { k: "work", label: "Work", em: "💼", color: "#2a8fe0", bg: "linear-gradient(180deg,#aadcff,#7cc2f5)",
      identities: ["The one who ships", "A world-class creator", "Wealthy & free", "Deeply focused", "A bold operator", "A relentless builder"],
      virtues: ["Courage", "Focus", "Discipline", "Wisdom", "Grit", "Boldness"],
      behaviors: [{ k: "focus", em: "🧠", label: "Deep work" }, { k: "send", em: "✦", label: "Ship/send", send: true }, { k: "create", em: "🎨", label: "Create" }, { k: "learn", em: "📚", label: "Learn" }, { k: "money", em: "💰", label: "Money" }, { k: "plan", em: "🗒️", label: "Plan" }] },
    { k: "love", label: "Love", em: "❤️", color: "#ff3f93", bg: "linear-gradient(180deg,#ffc2de,#ff9ac8)",
      identities: ["Present & warm", "Joyful & playful", "Deeply connected", "A generous heart", "Open & loving", "Endlessly grateful"],
      virtues: ["Love", "Gratitude", "Hope", "Presence", "Compassion", "Joy"],
      behaviors: [{ k: "connect", em: "💬", label: "Connect" }, { k: "gratitude", em: "🙏", label: "Gratitude" }, { k: "rest", em: "🛋️", label: "Rest" }, { k: "play", em: "🎮", label: "Play" }, { k: "call", em: "📞", label: "Reach out" }] }
  ];
  var HOB = { color: "#9a4fe0", bg: "linear-gradient(180deg,#e0c2ff,#c89af0)", opts: [{ k: "guitar", em: "🎸", label: "Guitar" }, { k: "draw", em: "✏️", label: "Draw" }, { k: "read", em: "📖", label: "Read" }, { k: "cook", em: "🍳", label: "Cook" }, { k: "photo", em: "📷", label: "Photo" }, { k: "write", em: "✍️", label: "Write" }, { k: "dance", em: "💃", label: "Dance" }, { k: "code", em: "💻", label: "Code" }] };
  var KRY = { color: "#ff4d4d", bg: "linear-gradient(180deg,#ffc4c4,#ff9a9a)", opts: [{ k: "weed", em: "🌿", label: "Weed" }, { k: "scroll", em: "📱", label: "Scrolling" }, { k: "porn", em: "🔞", label: "Porn" }, { k: "cigs", em: "🚬", label: "Cigarettes" }, { k: "sugar", em: "🍬", label: "Sugar" }, { k: "booze", em: "🍷", label: "Alcohol" }, { k: "junk", em: "🍔", label: "Junk food" }] };
  var SUBTASKS = ["Make the bed", "Clear the table", "Laundry", "Sweep the floor", "Clear the desk"];

  var ALL = {};
  PILLARS.forEach(function (p) { p.behaviors.forEach(function (g) { ALL[g.k] = { g: g, color: p.color, pillar: p }; }); });
  HOB.opts.forEach(function (g) { ALL[g.k] = { g: g, color: HOB.color, hobby: true }; });
  KRY.opts.forEach(function (g) { ALL[g.k] = { g: g, color: "#1fb877", anti: true }; });

  function freshState() { return { onboarded: false, identity: {}, virtues: {}, behaviors: [], hobbies: [], kryptonites: [], total: 0, today: 0, sends: 0, sentToday: false, lastDay: dayKey(), lastKind: null }; }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var S;
  function load() { try { S = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch (e) { S = freshState(); } if (S.lastDay !== dayKey()) { S.today = 0; S.sentToday = false; S.lastDay = dayKey(); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function phase() { var h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function greeting() { var p = phase(); return (p === "night" ? "hey" : p) + " 🌸"; }
  function moveLabel() { var p = phase(); return p === "evening" ? "how'd today go?" : p === "night" ? "one for the night" : "what's the move?"; }

  // ---- pixel canvas + animation ------------------------------------------
  var LW = 176, LH = 312, ctx, stage, T0 = performance.now(), flashT = 0, hopT = 0, P = [];
  var CX = 88, HEADY = 214, GROUND = 254;
  function fit() {
    stage = el("stage"); ctx = stage.getContext("2d");
    var SC = Math.max(1, Math.min(6, Math.floor(Math.min(window.innerWidth / LW, window.innerHeight / LH))));
    stage.width = LW * SC; stage.height = LH * SC; stage.style.width = (LW * SC) + "px"; stage.style.height = (LH * SC) + "px"; stage.style.imageRendering = "pixelated";
    ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false;
  }
  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }

  function render() {
    var t = (performance.now() - T0) / 1000, night = phase() === "night", active = S.today > 0;
    // banded candy sky (parallax depth)
    var sky = night ? ["#566fc0", "#6f6fc8", "#8d7fd2", "#b187ca", "#d493c4"] : ["#79c2ff", "#97b3ff", "#b9a4f5", "#e0a4e6", "#ffb0d6"];
    for (var s = 0; s < 5; s++) px(0, Math.floor(s * (GROUND) / 5), LW, Math.ceil(GROUND / 5) + 1, sky[s]);
    // sun glow
    var sxp = 140, syp = 58;
    ctx.globalAlpha = .25; px(sxp - 16, syp - 16, 32, 32, night ? "#fff6da" : "#ffe79a"); ctx.globalAlpha = .5; px(sxp - 10, syp - 10, 20, 20, night ? "#fff6da" : "#ffe79a"); ctx.globalAlpha = 1;
    px(sxp - 6, syp - 7, 12, 14, night ? "#fff6da" : "#ffd23a"); px(sxp - 7, syp - 5, 14, 10, night ? "#fff6da" : "#ffd23a");
    // far hills
    px(0, 196, LW, 60, night ? "#9a7fc8" : "#e6a8e0"); px(0, 196, LW, 2, night ? "#b39ad8" : "#f0c0ec");
    // clouds (two parallax layers, animated)
    clouds(t * 5, 44, 0); clouds(t * 2.4 + 70, 84, 1);
    // foreground hill (candy, no green)
    px(0, GROUND - 6, LW, LH - GROUND + 6, "#cf86e8"); px(0, GROUND - 6, LW, 4, "#df9ff0"); px(0, GROUND - 6, LW, 1, "#f0c8f8");
    for (var gx = 0; gx < LW; gx += 6) px(gx, GROUND - 8, 1, 3, "#df9ff0"); // grass tufts
    // earned decor
    if (S.total >= 1) flower(30, GROUND - 4, "#ff5fa8"); if (S.total >= 2) flower(150, GROUND, "#ffd23a");
    if (S.total >= 4) flower(58, GROUND + 8, "#7fd0ff"); if (S.total >= 6) flower(120, GROUND + 4, "#b06ff0");
    // ambient twinkle
    for (var k = 0; k < 4; k++) { var tw = (Math.sin(t * 2 + k * 1.7) + 1) / 2; ctx.globalAlpha = .3 + tw * .6; px(24 + k * 38, 30 + (k % 2) * 16, 2, 2, night ? "#fff" : "#fff7c8"); ctx.globalAlpha = 1; }
    // character
    var bob = Math.round(Math.sin(t * 1.9) * 1.2);
    var hop = hopT > 0 ? -Math.round(Math.sin((0.42 - hopT) / 0.42 * Math.PI) * 8) : 0;
    var blink = (t % 3.6) < 0.14;
    drawChar(CX - 15, GROUND, bob + hop, blink, active);
    // particles (in front)
    for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.10; p.life -= 0.022;
      if (p.life <= 0) { P.splice(i, 1); continue; } ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); px(p.x, p.y, 2, 2, p.c); ctx.globalAlpha = 1; }
    if (flashT > 0) flashT -= 1 / 60; if (hopT > 0) hopT -= 1 / 60;
    requestAnimationFrame(render);
  }
  function clouds(off, y, layer) {
    var base = off % (LW + 50) - 25;
    for (var n = 0; n < 2; n++) { var cx = base + n * 100; if (cx > LW + 20) cx -= (LW + 50); if (cx < -30) cx += (LW + 50);
      var c = layer ? "#ffffff" : "#fdf2ff"; px(cx + 4, y, 16, 6, c); px(cx, y + 3, 24, 6, c); px(cx + 8, y - 3, 10, 5, c); px(cx + 2, y + 2, 4, 4, c); }
  }
  function flower(x, y, c) { px(x + 2, y - 4, 1, 4, "#cf86e8"); px(x, y - 6, 2, 2, c); px(x + 3, y - 6, 2, 2, c); px(x + 1, y - 8, 2, 2, c); px(x + 1, y - 6, 2, 2, "#fff3a0"); }

  function drawChar(x, footY, dy, blink, active) {
    var y = footY - 50 + dy;
    var sk = "#ffe0c4", sk2 = "#f0c2a0", hr = "#8a5ec0", hr2 = "#6e4aa0", hi = "#b48ee0", dr = "#ff5fa8", dr2 = "#e0407e", drh = "#ff9ec8", ol = "#3a2f4a", sh = "#5a4a72";
    ctx.globalAlpha = .15; px(x + 5, footY, 20, 3, "#3a2f4a"); ctx.globalAlpha = 1;
    px(x + 9, y + 38, 5, 9, sk); px(x + 9, y + 38, 2, 9, sk2); px(x + 16, y + 38, 5, 9, sk); px(x + 16, y + 38, 2, 9, sk2);
    px(x + 8, footY - 2, 7, 3, sh); px(x + 15, footY - 2, 7, 3, sh); px(x + 8, footY - 2, 7, 1, "#7a6a92");
    px(x + 6, y + 24, 18, 16, dr); px(x + 4, y + 34, 22, 6, dr); px(x + 6, y + 24, 18, 3, drh); px(x + 4, y + 37, 22, 3, dr2); px(x + 18, y + 24, 6, 13, dr2);
    px(x + 2, y + 25, 4, 9, sk); px(x + 2, y + 25, 2, 9, sk2); px(x + 24, y + 25, 4, 9, sk); px(x + 12, y + 20, 6, 4, sk2);
    px(x + 6, y - 2, 16, 2, ol); px(x + 4, y, 20, 2, ol); px(x + 2, y + 2, 24, 16, ol); px(x + 4, y + 18, 20, 2, ol); px(x + 7, y + 20, 14, 2, ol);
    px(x + 7, y, 14, 2, sk); px(x + 5, y + 2, 18, 2, sk); px(x + 3, y + 4, 22, 11, sk); px(x + 5, y + 15, 18, 3, sk); px(x + 8, y + 18, 12, 2, sk); px(x + 4, y + 13, 20, 3, sk2);
    px(x + 4, y - 2, 20, 5, hr); px(x + 2, y + 2, 3, 9, hr); px(x + 23, y + 2, 3, 9, hr); px(x + 4, y - 2, 20, 2, hi); px(x + 2, y + 2, 2, 5, hi); px(x + 4, y + 2, 20, 1, hr2);
    if (blink) { px(x + 6, y + 10, 6, 1, ol); px(x + 16, y + 10, 6, 1, ol); }
    else { px(x + 6, y + 6, 6, 8, "#fff"); px(x + 16, y + 6, 6, 8, "#fff"); px(x + 8, y + 8, 4, 5, "#3a9ae6"); px(x + 18, y + 8, 4, 5, "#3a9ae6"); px(x + 8, y + 11, 4, 2, "#2a6fc0"); px(x + 18, y + 11, 4, 2, "#2a6fc0"); px(x + 9, y + 9, 2, 3, "#23203a"); px(x + 19, y + 9, 2, 3, "#23203a"); px(x + 9, y + 8, 1, 1, "#fff"); px(x + 19, y + 8, 1, 1, "#fff"); }
    ctx.globalAlpha = .6; px(x + 3, y + 13, 4, 3, "#ff8fb5"); px(x + 21, y + 13, 4, 3, "#ff8fb5"); ctx.globalAlpha = 1;
    px(x + 12, y + 16, 4, 1, "#c4567e"); px(x + 11, y + 15, 1, 1, "#c4567e"); px(x + 16, y + 15, 1, 1, "#c4567e");
    if (active) { ctx.globalAlpha = .14; px(x - 3, y - 4, 34, 56, "#fff3a0"); ctx.globalAlpha = 1; }
    if (flashT > 0) { ctx.globalAlpha = Math.min(.7, flashT * 1.8); px(x - 3, y - 4, 34, 58, "#fff"); ctx.globalAlpha = 1; }
  }

  function spawnBurst(big) {
    var n = big ? 20 : 12, cols = big ? ["#fff27a", "#ffd23a", "#fff", "#ff9ec8", "#ffe79a"] : ["#fff27a", "#ff8fc7", "#7fd0ff", "#fff"];
    for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, sp = .5 + Math.random() * 2.4;
      P.push({ x: CX + (Math.random() * 16 - 8), y: HEADY + (Math.random() * 12 - 4), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, life: 1, c: cols[(Math.random() * cols.length) | 0] }); }
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
  function reward(color, big) { flashT = big ? .5 : .3; hopT = .42; spawnBurst(big);
    try { if (navigator.vibrate) navigator.vibrate(big ? [10, 40, 12] : [13]); } catch (e) {}
    var b = el("bloom"); b.style.background = "radial-gradient(circle at 50% 52%," + (color || "#ff5fa8") + ",transparent 64%)";
    b.style.transition = "none"; b.style.opacity = big ? "0.55" : "0.4"; requestAnimationFrame(function () { b.style.transition = "opacity 1.1s ease-out"; b.style.opacity = "0"; }); }
  function logGoal(key, keepOpen) { var r = ALL[key]; if (!r) return; var send = !!r.g.send;
    S.total += 1; S.today += 1; S.lastKind = key; if (send) { S.sends += 1; S.sentToday = true; }
    reward(r.anti ? "#1fb877" : (send ? "#ffd23a" : r.color), send); save(); paintHome(); if (!keepOpen) closeSheet(); }

  function paintHome() { el("greet").textContent = greeting(); el("mirror").querySelector("span").textContent = mirror(); el("moveBtn").textContent = moveLabel();
    var dot = document.querySelector("#lume .dot"); if (dot) { dot.style.opacity = Math.min(1, .25 + S.today * .22); dot.style.boxShadow = "0 0 " + (4 + S.today * 3) + "px var(--yellow)"; } }
  function openSheet() { buildSheet(); el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }
  function grp(title, color) { var h = document.createElement("div"); h.textContent = title; h.style.cssText = "font-size:13px;color:" + color + ";font-weight:700;margin:10px 2px 8px;"; return h; }
  function tileBtn(g, onClick, send) { var b = document.createElement("button"); b.className = "tile" + (send ? " send" : ""); b.innerHTML = '<span class="em">' + g.em + "</span>" + g.label; b.onclick = onClick; return b; }
  function buildSheet() {
    el("sheetT").textContent = "what did you do?"; var body = el("sheetBody"); body.innerHTML = "";
    PILLARS.forEach(function (p) { var mine = p.behaviors.filter(function (g) { return S.behaviors.indexOf(g.k) !== -1; }); if (!mine.length) return;
      body.appendChild(grp(p.em + " " + p.label, p.color)); var grid = document.createElement("div"); grid.className = "grid";
      mine.forEach(function (g) { grid.appendChild(tileBtn(g, function () { g.task ? buildSubtasks(g) : logGoal(g.k); }, g.send)); }); body.appendChild(grid); });
    if (S.hobbies.length) { body.appendChild(grp("🎈 Hobbies", HOB.color)); var hg = document.createElement("div"); hg.className = "grid";
      HOB.opts.filter(function (g) { return S.hobbies.indexOf(g.k) !== -1; }).forEach(function (g) { hg.appendChild(tileBtn(g, function () { logGoal(g.k); })); }); body.appendChild(hg); }
    if (S.kryptonites.length) { body.appendChild(grp("💪 Stayed strong", "#1fb877")); var kg = document.createElement("div"); kg.className = "grid";
      KRY.opts.filter(function (g) { return S.kryptonites.indexOf(g.k) !== -1; }).forEach(function (g) { kg.appendChild(tileBtn({ em: "✊", label: "No " + g.label.toLowerCase() }, function () { logGoal(g.k); })); }); body.appendChild(kg); }
    if (!body.children.length) body.appendChild(grp("set up your goals to log here", "#8a7ba0"));
  }
  function buildSubtasks(g) { el("sheetT").textContent = "tidy — one small step at a time"; var body = el("sheetBody"); body.innerHTML = ""; var picked = {};
    SUBTASKS.forEach(function (label, i) { var item = document.createElement("div"); item.className = "subitem"; item.innerHTML = '<span class="box"></span><span>' + label + "</span>";
      item.onclick = function () { if (picked[i]) return; picked[i] = true; item.classList.add("done"); logGoal(g.k, true); }; body.appendChild(item); });
    var back = document.createElement("button"); back.className = "back"; back.textContent = "done"; back.onclick = closeSheet; body.appendChild(back); }

  var STEPS = [{ intro: true }];
  PILLARS.forEach(function (p) {
    STEPS.push({ color: p.color, bg: p.bg, title: p.em + " your " + p.label + " identity", sub: "who are you becoming? pick the ones that fit", store: "id_" + p.k, opts: p.identities.map(function (x) { return { label: x }; }), chips: true });
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
    if (st.intro) { el("ob").style.background = "linear-gradient(180deg,#79c2ff,#ffb0d6)";
      line.innerHTML = "let's build who you're becoming 🌟<small>three parts — Energy, Work, Love. for each: your identity, the virtues you recommit each morning, then the behaviors. then hobbies + what you're quitting.</small>";
      ctl.appendChild(obBtn("start →", "#ff3f93", function () { si = 1; renderStep(); })); return; }
    el("ob").style.background = st.bg; line.innerHTML = st.title + "<small>" + st.sub + "</small>";
    var ps = pickSet(st.store);
    if (st.chips) { st.opts.forEach(function (o) { var on = !!ps[o.label]; var b = document.createElement("button"); b.textContent = o.label; b.style.cssText = chipCss(on, st.color);
      b.onclick = function () { ps[o.label] = !ps[o.label]; renderStep(); }; ctl.appendChild(b); }); }
    else { var grid = document.createElement("div"); grid.className = "grid"; st.opts.forEach(function (o) { var on = !!ps[o.k]; var b = document.createElement("button"); b.className = "tile"; b.innerHTML = '<span class="em">' + o.em + "</span>" + o.label;
      if (on) { b.style.background = st.color; b.style.color = "#fff"; b.style.borderColor = st.color; } b.onclick = function () { ps[o.k] = !ps[o.k]; renderStep(); }; grid.appendChild(b); }); ctl.appendChild(grid); }
    var last = si === STEPS.length - 1;
    ctl.appendChild(obBtn(last ? "let's go ✨" : "next →", st.color, function () { if (last) finishOb(); else { si += 1; renderStep(); } }));
  }
  function obBtn(label, color, fn) { var b = document.createElement("button"); b.className = "obBtn"; b.textContent = label; b.style.background = color; b.style.boxShadow = "0 10px 26px " + color + "66, inset 0 2px 0 rgba(255,255,255,.4)"; b.onclick = fn; return b; }
  function chipCss(on, color) { return "width:100%;max-width:440px;margin:0 auto 10px;display:block;padding:15px;border-radius:18px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:transform .08s;" +
    (on ? "background:" + color + ";border:3px solid #fff;color:#fff;box-shadow:0 8px 20px " + color + "55;" : "background:rgba(255,255,255,.9);border:3px solid rgba(255,255,255,.95);color:#5a4a72;"); }

  function init() {
    load(); fit(); window.addEventListener("resize", fit);
    el("greet").style.background = "#ffe0c2"; el("lume").style.background = "#cfeaff"; el("mirror").querySelector("span").style.background = "#ffe6f3";
    el("moveBtn").onclick = openSheet; el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); }; el("sheetClose").onclick = closeSheet;
    paintHome(); requestAnimationFrame(render); if (!S.onboarded) startOb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
