/* ALTER v0.6 — smooth modern illustrated look (no more blocky pixel) +
   identity statements, virtues separate, Energy off-green. $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_v4"; // keep prior saves

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

  // ---- smooth modern canvas ----------------------------------------------
  var LW = 176, LH = 312, ctx, stage, T0 = performance.now(), flashT = 0, scale = 1;
  function fit() {
    stage = el("stage"); ctx = stage.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssH = Math.min(window.innerHeight, Math.round(window.innerWidth * LH / LW));
    var cssW = Math.round(cssH * LW / LH);
    stage.style.width = cssW + "px"; stage.style.height = cssH + "px"; stage.style.imageRendering = "auto";
    stage.width = Math.round(cssW * dpr); stage.height = Math.round(cssH * dpr);
    scale = (cssW / LW) * dpr;
    ctx.setTransform(scale, 0, 0, scale, 0, 0); ctx.imageSmoothingEnabled = true;
  }
  function circle(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = c; ctx.fill(); }
  function ell(x, y, rx, ry, c) { ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry); ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.restore(); }
  function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function render() {
    var t = (performance.now() - T0) / 1000, bob = Math.sin(t * 1.8) * 2.0, active = S.today > 0, night = phase() === "night";
    var g = ctx.createLinearGradient(0, 0, 0, LH);
    if (night) { g.addColorStop(0, "#5f7fd0"); g.addColorStop(.5, "#9a86d8"); g.addColorStop(1, "#e29ac8"); }
    else { g.addColorStop(0, "#7fc8ff"); g.addColorStop(.5, "#c2a8ff"); g.addColorStop(1, "#ffb0d8"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
    // soft sun glow
    var sx = 138, sy = 64, sun = ctx.createRadialGradient(sx, sy, 2, sx, sy, 34);
    sun.addColorStop(0, night ? "rgba(255,250,220,.95)" : "rgba(255,224,120,.98)"); sun.addColorStop(1, "rgba(255,224,120,0)");
    ctx.fillStyle = sun; ctx.fillRect(sx - 40, sy - 40, 80, 80);
    circle(sx, sy, 14, night ? "#fff6da" : "#ffdb52");
    // drifting bokeh
    for (var i = 0; i < 5; i++) { var bx = (30 + i * 33 + Math.sin(t * .4 + i) * 8), by = 40 + ((i * 53) % 150) + Math.cos(t * .5 + i) * 6;
      ctx.globalAlpha = .14; circle(bx, by, 7 + (i % 3) * 3, "#ffffff"); ctx.globalAlpha = 1; }
    // soft clouds
    cloud(34, 60); cloud(118, 36);
    // rolling hill (candy, no green)
    ctx.beginPath(); ctx.moveTo(0, 262); ctx.quadraticCurveTo(LW / 2, 232, LW, 262); ctx.lineTo(LW, LH); ctx.lineTo(0, LH); ctx.closePath();
    var hg = ctx.createLinearGradient(0, 250, 0, LH); hg.addColorStop(0, "#e7b3ef"); hg.addColorStop(1, "#c97fe0"); ctx.fillStyle = hg; ctx.fill();
    ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(0, 262); ctx.quadraticCurveTo(LW / 2, 232, LW, 262); ctx.lineWidth = 2; ctx.strokeStyle = "#f3d6f7"; ctx.stroke(); ctx.globalAlpha = 1;
    // little decor that grows with real wins
    if (S.total >= 1) sparkle(34, 244, "#fff27a", t); if (S.total >= 3) sparkle(150, 250, "#ffffff", t + 1);
    if (S.total >= 5) heart(150, 92, "#ff5fa8"); if (S.sends >= 1) sparkle(150, 26, "#fff", t + 2);
    drawChar(LW / 2, 268, bob, active, night);
    if (flashT > 0) flashT -= 1 / 60;
    requestAnimationFrame(render);
  }
  function cloud(x, y) { ctx.globalAlpha = .92; circle(x, y, 9, "#fff"); circle(x + 9, y + 2, 11, "#fff"); circle(x + 20, y, 8, "#fff"); ell(x + 10, y + 7, 16, 6, "#fff"); ctx.globalAlpha = 1; }
  function heart(x, y, c) { ctx.fillStyle = c; ctx.beginPath(); circle(x - 3, y, 3.4, c); circle(x + 3, y, 3.4, c); ctx.beginPath(); ctx.moveTo(x - 6, y + 1); ctx.lineTo(x, y + 7); ctx.lineTo(x + 6, y + 1); ctx.closePath(); ctx.fill(); }
  function sparkle(x, y, c, t) { var s = 2 + (Math.sin(t * 3) + 1) * 1.4; ctx.fillStyle = c; ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(x, y - s * 2); ctx.lineTo(x + s * .7, y - s * .7); ctx.lineTo(x + s * 2, y); ctx.lineTo(x + s * .7, y + s * .7); ctx.lineTo(x, y + s * 2); ctx.lineTo(x - s * .7, y + s * .7); ctx.lineTo(x - s * 2, y); ctx.lineTo(x - s * .7, y - s * .7); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }

  function drawChar(cx, groundY, bob, active, night) {
    var cy = groundY - 40 + bob;
    // shadow
    ctx.globalAlpha = .16; ell(cx, groundY + 4, 20, 5, "#3a2f4a"); ctx.globalAlpha = 1;
    // active aura
    if (active) { var au = ctx.createRadialGradient(cx, cy + 2, 6, cx, cy + 2, 40); au.addColorStop(0, "rgba(255,243,150,.5)"); au.addColorStop(1, "rgba(255,243,150,0)"); ctx.fillStyle = au; ctx.fillRect(cx - 42, cy - 38, 84, 80); }
    // legs
    rr(cx - 8, cy + 26, 6, 14, 3); ctx.fillStyle = "#ffd9bf"; ctx.fill(); rr(cx + 2, cy + 26, 6, 14, 3); ctx.fill();
    ell(cx - 5, cy + 40, 5, 3, "#6a5a82"); ell(cx + 5, cy + 40, 5, 3, "#6a5a82");
    // body (glossy gradient)
    var bg = ctx.createLinearGradient(cx, cy + 8, cx, cy + 30); bg.addColorStop(0, "#ff8fc7"); bg.addColorStop(1, "#ff4f9f");
    rr(cx - 14, cy + 8, 28, 24, 13); ctx.fillStyle = bg; ctx.fill();
    ctx.globalAlpha = .4; rr(cx - 10, cy + 10, 12, 6, 5); ctx.fillStyle = "#fff"; ctx.fill(); ctx.globalAlpha = 1; // sheen
    // arms
    circle(cx - 15, cy + 16, 4, "#ffd9bf"); circle(cx + 15, cy + 16, 4, "#ffd9bf");
    // head (gradient)
    var hg = ctx.createRadialGradient(cx - 4, cy - 6, 3, cx, cy, 17); hg.addColorStop(0, "#ffe9d6"); hg.addColorStop(1, "#ffd2b0");
    circle(cx, cy, 15, "#000"); ctx.save(); ctx.globalAlpha = 1; circle(cx, cy, 14.3, "#ffd2b0"); ctx.fillStyle = hg; circle(cx, cy, 14.3, "#ffdcc0"); ctx.restore();
    // hair
    ctx.beginPath(); ctx.arc(cx, cy - 2, 14.5, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(cx + 14, cy - 2); ctx.fillStyle = "#7a5298"; ctx.fill();
    circle(cx, cy - 12, 7, "#7a5298");
    // eyes (big glossy)
    eye(cx - 5.5, cy + 1, night); eye(cx + 5.5, cy + 1, night);
    // blush
    ctx.globalAlpha = .5; circle(cx - 9, cy + 6, 3, "#ff7ab0"); circle(cx + 9, cy + 6, 3, "#ff7ab0"); ctx.globalAlpha = 1;
    // smile
    ctx.beginPath(); ctx.arc(cx, cy + 5, 3.4, .15 * Math.PI, .85 * Math.PI); ctx.lineWidth = 1.4; ctx.strokeStyle = "#c4567e"; ctx.lineCap = "round"; ctx.stroke();
    // reward flash
    if (flashT > 0) { ctx.globalAlpha = Math.min(.7, flashT * 1.8); circle(cx, cy + 6, 24, "#fff"); ctx.globalAlpha = 1; }
  }
  function eye(x, y, night) {
    circle(x, y, 4.6, "#fff"); ctx.lineWidth = .8; ctx.strokeStyle = "#3a2f4a"; ctx.beginPath(); ctx.arc(x, y, 4.6, 0, 7); ctx.stroke();
    var ig = ctx.createRadialGradient(x, y + 1, .5, x, y + 1, 3); ig.addColorStop(0, "#5ab8ee"); ig.addColorStop(1, "#2a6fc0");
    circle(x, y + 1, 2.8, "#2a6fc0"); ctx.fillStyle = ig; circle(x, y + 1, 2.8, "#3a9ae6");
    circle(x, y + 1.4, 1.4, "#23203a"); circle(x - 1, y - 0.2, 1, "#fff");
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
    b.style.transition = "none"; b.style.opacity = big ? "0.6" : "0.42";
    requestAnimationFrame(function () { b.style.transition = "opacity 1.1s ease-out"; b.style.opacity = "0"; }); }
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

  // ---- onboarding wizard --------------------------------------------------
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
    if (st.intro) { el("ob").style.background = "linear-gradient(180deg,#7fc8ff,#ffb0d8)";
      line.innerHTML = "let's build who you're becoming 🌟<small>three parts — Energy, Work, Love. for each: your identity, the virtues you recommit each morning, then the behaviors. then hobbies + what you're quitting.</small>";
      ctl.appendChild(obBtn("start →", "#ff3f93", function () { si = 1; renderStep(); })); return; }
    el("ob").style.background = st.bg;
    line.innerHTML = st.title + "<small>" + st.sub + "</small>";
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
