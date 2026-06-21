/* ALTER v0.3 — Heroic Big-3 identity structure + Powerpuff candy look.
   Onboarding: envision your self in Energy / Work / Love, then tap which goals count.
   Goals nest under the 3 pillars. One screen, one move. $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_v3";

  var PILLARS = [
    { k: "energy", label: "Energy", em: "⚡", color: "#5bc98a",
      identities: ["Energized & strong", "Calm & rested", "A disciplined athlete"],
      goals: [
        { k: "move", em: "🏃", label: "Move" }, { k: "sleep", em: "😴", label: "Sleep" },
        { k: "eat", em: "🥗", label: "Eat well" }, { k: "breathe", em: "🌬️", label: "Breathe" },
        { k: "hydrate", em: "💧", label: "Hydrate" }, { k: "tidy", em: "🧹", label: "Tidy space", task: true }
      ] },
    { k: "work", label: "Work", em: "💼", color: "#5aa9e6",
      identities: ["The one who ships", "A focused creator", "Building real wealth"],
      goals: [
        { k: "focus", em: "🧠", label: "Deep work" }, { k: "send", em: "✦", label: "Ship / send", send: true },
        { k: "create", em: "🎨", label: "Create" }, { k: "learn", em: "📚", label: "Learn" },
        { k: "money", em: "💰", label: "Money" }
      ] },
    { k: "love", label: "Love", em: "❤️", color: "#ff7ab0",
      identities: ["Present & warm", "Joyful & playful", "Deeply connected"],
      goals: [
        { k: "connect", em: "💬", label: "Connect" }, { k: "gratitude", em: "🙏", label: "Gratitude" },
        { k: "guitar", em: "🎸", label: "Guitar" }, { k: "rest", em: "🛋️", label: "Rest" },
        { k: "play", em: "🎮", label: "Play" }
      ] }
  ];
  var SUBTASKS = ["Make the bed", "Clear the table", "Laundry", "Sweep the floor", "Clear the desk"];

  function goalByKey(k) {
    for (var i = 0; i < PILLARS.length; i++) for (var j = 0; j < PILLARS[i].goals.length; j++)
      if (PILLARS[i].goals[j].k === k) return { g: PILLARS[i].goals[j], p: PILLARS[i] };
    return null;
  }

  function freshState() {
    return { onboarded: false, identity: {}, picked: [], total: 0, today: 0, sends: 0,
      sentToday: false, lastDay: dayKey(), lastKind: null };
  }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  var S;
  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch (e) { S = freshState(); }
    if (S.lastDay !== dayKey()) { S.today = 0; S.sentToday = false; S.lastDay = dayKey(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function phase() { var h = new Date().getHours(); return h < 11 ? "morning" : h < 17 ? "afternoon" : h < 21 ? "evening" : "night"; }
  function greeting() { var p = phase(); return (p === "night" ? "hey" : p) + " 🌸"; }
  function moveLabel() { var p = phase(); return p === "evening" ? "how'd today go?" : p === "night" ? "one for the night" : "what's the move?"; }

  // ---- canvas -------------------------------------------------------------
  var LW = 176, LH = 312, ctx, stage, T0 = performance.now(), flashT = 0;
  function fit() {
    stage = el("stage"); ctx = stage.getContext("2d");
    var vw = window.innerWidth, vh = window.innerHeight;
    var SC = Math.max(1, Math.min(5, Math.floor(Math.min(vw / LW, vh / LH))));
    stage.width = LW * SC; stage.height = LH * SC;
    stage.style.width = (LW * SC) + "px"; stage.style.height = (LH * SC) + "px";
    ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.imageSmoothingEnabled = false;
  }
  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }

  function render() {
    var t = (performance.now() - T0) / 1000;
    var bob = Math.round(Math.sin(t * 1.8) * 1.4);
    var active = S.today > 0, night = phase() === "night";
    // candy sky
    var g = ctx.createLinearGradient(0, 0, 0, LH);
    if (night) { g.addColorStop(0, "#8fb3e8"); g.addColorStop(.55, "#b9a8e0"); g.addColorStop(1, "#e9b8d8"); }
    else { g.addColorStop(0, "#aee9ff"); g.addColorStop(.5, "#d8c9ff"); g.addColorStop(1, "#ffd9ee"); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);
    // clouds
    cloud(26, 54); cloud(120, 38);
    if (night) { px(40, 30, 2, 2, "#fff"); px(140, 60, 2, 2, "#fff"); px(90, 24, 2, 2, "#fff"); }
    // sun/moon
    px(138, 70, 18, 18, night ? "#fff3c0" : "#ffe07a"); px(140, 68, 14, 22, night ? "#fff3c0" : "#ffe07a");
    // ground hill
    px(0, 246, LW, LH - 246, "#bdeeb0"); px(0, 246, LW, 4, "#a3e09a");
    px(0, 246, LW, 1, "#d8f6cf");
    // progress flora (cute, earned)
    if (S.total >= 1) flower(34, 252, "#ff8fc7");
    if (S.total >= 2) flower(150, 256, "#ffd86a");
    if (S.total >= 4) flower(58, 268, "#7ec8e3");
    if (S.total >= 3) { star(28, 96, "#fff2a0"); }
    if (S.total >= 5) { heart(146, 96, "#ff7ab0"); }
    if (S.sends >= 1) { star(150, 30, "#fff"); }

    drawChar(LW / 2, 250, bob, active);
    if (flashT > 0) flashT -= 1 / 60;
    requestAnimationFrame(render);
  }
  function cloud(x, y) { px(x, y, 22, 8, "#ffffff"); px(x + 4, y - 4, 14, 6, "#ffffff"); px(x - 3, y + 2, 6, 5, "#ffffff"); px(x + 20, y + 2, 6, 5, "#ffffff"); }
  function star(x, y, c) { px(x + 2, y, 2, 6, c); px(x, y + 2, 6, 2, c); }
  function heart(x, y, c) { px(x, y + 1, 3, 3, c); px(x + 4, y + 1, 3, 3, c); px(x + 1, y + 3, 5, 2, c); px(x + 2, y + 5, 3, 1, c); }
  function flower(x, y, c) { px(x + 2, y - 4, 2, 4, "#5aa86a"); px(x, y - 6, 2, 2, c); px(x + 4, y - 6, 2, 2, c); px(x + 2, y - 8, 2, 2, c); px(x + 2, y - 6, 2, 2, "#fff3a0"); px(x + 2, y - 4, 2, 2, c); }

  function drawChar(cx, groundY, bob, active) {
    var x = Math.round(cx - 15), y = groundY - 46 + bob;
    var dark = "#3a2f4a", skin = "#ffe0c4", dress = "#ff8fc7", shoe = "#6a5a82";
    ctx.globalAlpha = .16; px(x + 3, groundY + 1, 24, 4, "#3a2f4a"); ctx.globalAlpha = 1;
    px(x + 10, y + 34, 4, 8, skin); px(x + 16, y + 34, 4, 8, skin);
    px(x + 9, groundY - 2, 6, 3, shoe); px(x + 15, groundY - 2, 6, 3, shoe);
    px(x + 8, y + 26, 14, 10, dress); px(x + 6, y + 32, 18, 4, dress);
    px(x + 4, y + 27, 4, 7, skin); px(x + 22, y + 27, 4, 7, skin);
    // head outline + fill (roundish)
    px(x + 5, y - 1, 20, 2, dark); px(x + 3, y + 1, 24, 2, dark); px(x + 1, y + 3, 28, 16, dark); px(x + 3, y + 19, 24, 2, dark); px(x + 6, y + 21, 18, 2, dark);
    px(x + 6, y + 1, 18, 2, skin); px(x + 4, y + 3, 22, 2, skin); px(x + 2, y + 5, 26, 12, skin); px(x + 4, y + 17, 22, 2, skin); px(x + 7, y + 19, 16, 2, skin);
    px(x + 4, y - 1, 22, 4, "#7a5298");
    // big eyes
    px(x + 5, y + 6, 9, 10, dark); px(x + 6, y + 7, 7, 8, "#fff");
    px(x + 16, y + 6, 9, 10, dark); px(x + 17, y + 7, 7, 8, "#fff");
    px(x + 8, y + 9, 4, 5, "#5aa9e6"); px(x + 9, y + 10, 2, 3, "#23203a"); px(x + 9, y + 10, 1, 1, "#fff");
    px(x + 19, y + 9, 4, 5, "#5aa9e6"); px(x + 20, y + 10, 2, 3, "#23203a"); px(x + 20, y + 10, 1, 1, "#fff");
    ctx.globalAlpha = .55; px(x + 3, y + 14, 4, 3, "#ff8fc7"); px(x + 23, y + 14, 4, 3, "#ff8fc7"); ctx.globalAlpha = 1;
    px(x + 12, y + 17, 6, 1, "#c46a8a"); px(x + 11, y + 16, 1, 1, "#c46a8a"); px(x + 18, y + 16, 1, 1, "#c46a8a");
    if (active) { ctx.globalAlpha = .16; px(x - 2, y - 2, 34, 48, "#fff3a0"); ctx.globalAlpha = 1; }
    if (flashT > 0) { ctx.globalAlpha = Math.min(.8, flashT * 2); px(x - 2, y - 2, 34, 50, "#ffffff"); ctx.globalAlpha = 1; }
  }

  // ---- mirror -------------------------------------------------------------
  function mirror() {
    if (S.lastKind === "send") return "you shipped it. that's the whole game — go live.";
    if (!S.lastKind && S.today === 0) {
      var p = phase();
      if (p === "morning") return "morning. pick one small thing and we'll start there.";
      if (p === "evening") return "evening. what did you actually move today?";
      if (p === "night") return "it's late — one gentle thing, or just rest.";
      return "you're here. what's one small move?";
    }
    if (S.today >= 3) return "three real moves in. that's a good day, up close.";
    var byk = S.lastKind && goalByKey(S.lastKind);
    if (byk) return "logged — " + byk.p.label.toLowerCase() + " just leveled. nice.";
    return "one small step down. that's how it starts.";
  }

  // ---- reward -------------------------------------------------------------
  function reward(color, big) {
    flashT = big ? 0.5 : 0.3;
    try { if (navigator.vibrate) navigator.vibrate(big ? [10, 40, 12] : [13]); } catch (e) {}
    var b = el("bloom");
    b.style.background = "radial-gradient(circle at 50% 56%, " + (color || "#ff8fc7") + ", transparent 66%)";
    b.style.transition = "none"; b.style.opacity = big ? "0.6" : "0.4";
    requestAnimationFrame(function () { b.style.transition = "opacity 1.1s ease-out"; b.style.opacity = "0"; });
  }
  function logGoal(key, keepOpen) {
    var byk = goalByKey(key); if (!byk) return;
    var send = !!byk.g.send;
    S.total += 1; S.today += 1; S.lastKind = key;
    if (send) { S.sends += 1; S.sentToday = true; }
    reward(send ? "#ffd86a" : byk.p.color, send);
    save(); paintHome(); if (!keepOpen) closeSheet();
  }

  // ---- home + sheet -------------------------------------------------------
  function paintHome() {
    el("greet").textContent = greeting();
    el("mirror").querySelector("span").textContent = mirror();
    el("moveBtn").textContent = moveLabel();
    var dot = document.querySelector("#lume .dot");
    if (dot) { dot.style.opacity = Math.min(1, .25 + S.today * .22); dot.style.boxShadow = "0 0 " + (4 + S.today * 3) + "px var(--yellow)"; }
  }
  function openSheet() { buildSheet(); el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }

  function pickedGoals() {
    if (S.picked && S.picked.length) return S.picked;
    // fallback: a default few if user skipped
    return ["move", "focus", "guitar", "tidy", "send", "breathe"];
  }
  function buildSheet() {
    el("sheetT").textContent = "what did you do?";
    var body = el("sheetBody"); body.innerHTML = "";
    var picks = pickedGoals();
    PILLARS.forEach(function (p) {
      var mine = p.goals.filter(function (g) { return picks.indexOf(g.k) !== -1; });
      if (!mine.length) return;
      var h = document.createElement("div");
      h.textContent = p.em + " " + p.label;
      h.style.cssText = "font-size:12px;color:" + p.color + ";font-weight:800;margin:8px 2px 8px;";
      body.appendChild(h);
      var grid = document.createElement("div"); grid.className = "grid";
      mine.forEach(function (g) {
        var tile = document.createElement("button");
        tile.className = "tile" + (g.send ? " send" : "");
        tile.innerHTML = '<span class="em">' + g.em + "</span>" + g.label;
        tile.onclick = function () { g.task ? buildSubtasks(g) : logGoal(g.k); };
        grid.appendChild(tile);
      });
      body.appendChild(grid);
    });
  }
  function buildSubtasks(g) {
    el("sheetT").textContent = "tidy — one small step at a time";
    var body = el("sheetBody"); body.innerHTML = "";
    var picked = {};
    SUBTASKS.forEach(function (label, i) {
      var item = document.createElement("div"); item.className = "subitem";
      item.innerHTML = '<span class="box"></span><span>' + label + "</span>";
      item.onclick = function () { if (picked[i]) return; picked[i] = true; item.classList.add("done"); logGoal(g.k, true); };
      body.appendChild(item);
    });
    var back = document.createElement("button"); back.className = "back"; back.textContent = "done";
    back.onclick = closeSheet; body.appendChild(back);
  }

  // ---- onboarding (Big-3 identity-first, tap only) ------------------------
  var step = 0, tmpId = {}, pickSet = {};
  function startOb() { el("ob").classList.add("on"); el("moveBtn").style.display = "none"; el("hud").style.opacity = "0"; el("mirror").style.opacity = "0"; renderOb(); }
  function endOb() {
    S.identity = tmpId; S.picked = Object.keys(pickSet).filter(function (k) { return pickSet[k]; });
    S.onboarded = true; save();
    el("ob").classList.remove("on"); el("moveBtn").style.display = ""; el("hud").style.opacity = "1"; el("mirror").style.opacity = "1";
    paintHome();
  }
  function renderOb() {
    var line = el("obLine"), ctl = el("obCtl"); ctl.innerHTML = "";
    if (step === 0) {
      line.innerHTML = "let's set up who you're becoming 🌸<small>three parts: energy, work, love — like Heroic. tap, don't type.</small>";
      ctl.appendChild(obButton("start →", function () { step = 1; renderOb(); }));
      return;
    }
    var p = PILLARS[step - 1];
    line.innerHTML = p.em + " your " + p.label + " self<small>pick who you want to be — then tap what counts</small>";
    // identity options
    p.identities.forEach(function (idt) {
      var b = document.createElement("button");
      b.textContent = idt;
      b.style.cssText = idChipCss(tmpId[p.k] === idt, p.color);
      b.onclick = function () { tmpId[p.k] = idt; renderOb(); };
      ctl.appendChild(b);
    });
    // goal grid
    var grid = document.createElement("div"); grid.className = "grid"; grid.style.marginTop = "14px";
    p.goals.forEach(function (gg) {
      var tile = document.createElement("button");
      tile.className = "tile" + (pickSet[gg.k] ? " on" : "");
      tile.innerHTML = '<span class="em">' + gg.em + "</span>" + gg.label;
      tile.onclick = function () { pickSet[gg.k] = !pickSet[gg.k]; renderOb(); };
      grid.appendChild(tile);
    });
    ctl.appendChild(grid);
    ctl.appendChild(obButton(step < 3 ? "next →" : "let's go ✨", function () {
      if (step < 3) { step += 1; renderOb(); el("ob").scrollTop = 0; } else endOb();
    }));
  }
  function obButton(label, fn) { var b = document.createElement("button"); b.className = "obBtn"; b.textContent = label; b.onclick = fn; return b; }
  function idChipCss(on, color) {
    return "width:100%;max-width:420px;margin:0 auto 9px;display:block;padding:14px;border-radius:16px;font-size:15px;font-weight:700;cursor:pointer;" +
      (on ? "background:#fff0f7;border:2.5px solid " + color + ";color:#4a3a63;box-shadow:0 4px 14px rgba(255,143,199,.3);"
          : "background:#fff;border:2.5px solid #ffe0ef;color:#8a7ba0;");
  }

  function init() {
    load(); fit(); window.addEventListener("resize", fit);
    el("moveBtn").onclick = openSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    el("sheetClose").onclick = closeSheet;
    paintHome(); requestAnimationFrame(render);
    if (!S.onboarded) startOb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
