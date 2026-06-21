/* ALTER v0.2 — a full-screen pixel guardian who is you.
   One screen, one move. The room is the only scoreboard. No coins/XP/levels.
   Celebrates the DEED, not the session. Static, $0, localStorage. */
(function () {
  "use strict";
  var el = function (id) { return document.getElementById(id); };
  var KEY = "alter_v2";

  // ---- data ---------------------------------------------------------------
  var DOMAINS = [
    { k: "move",    em: "🏃", label: "Moved",     color: "#7fd6a0" },
    { k: "breathe", em: "🌬️", label: "Breathed",  color: "#79c6d6" },
    { k: "focus",   em: "🧠", label: "Deep work", color: "#f08fb0" },
    { k: "eat",     em: "🍎", label: "Ate well",  color: "#e6b25a" },
    { k: "tidy",    em: "🧹", label: "Tidy space",color: "#e0795a", task: true }
  ];
  var SUBTASKS = ["Make the bed", "Clear the table", "Laundry", "Sweep the floor", "Clear the desk"];

  var TRAITS = [
    "you make grade-A or nothing.",
    "nostalgia lights you up.",
    "the hard part was never making the work — it's sending it."
  ];

  function freshState() {
    return {
      onboarded: false, place: "home",
      avoided: "", name: "you",
      total: 0, today: 0, sends: 0, sentToday: false,
      lastDay: dayKey(), lastKind: null
    };
  }
  function dayKey() { var d = new Date(); return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate(); }

  var S;
  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY)) || freshState(); } catch (e) { S = freshState(); }
    if (S.lastDay !== dayKey()) { S.today = 0; S.sentToday = false; S.lastDay = dayKey(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  // ---- time of day --------------------------------------------------------
  function phase() {
    var h = new Date().getHours();
    if (h >= 5 && h < 11) return "morning";
    if (h >= 11 && h < 17) return "afternoon";
    if (h >= 17 && h < 21) return "evening";
    return "night";
  }
  var PAL = {
    morning:   { sky:"#ffd6a0", wall:"#6c7188", wall2:"#767b92", floor:"#b58a5a", floord:"#9c744a", tint:"rgba(255,205,150,0.05)", lamp:0.15, bright:1.0 },
    afternoon: { sky:"#bfe2f0", wall:"#666b82", wall2:"#70758c", floor:"#ad8254", floord:"#956f46", tint:"rgba(255,240,210,0.03)", lamp:0.1,  bright:1.0 },
    evening:   { sky:"#c2748f", wall:"#55516c", wall2:"#5f5b76", floor:"#8c6648", floord:"#76543c", tint:"rgba(190,120,160,0.07)", lamp:0.6,  bright:0.92 },
    night:     { sky:"#1b2542", wall:"#3a3a56", wall2:"#434360", floor:"#6c533e", floord:"#5a4533", tint:"rgba(18,18,48,0.20)", lamp:1.0,  bright:0.82 }
  };
  function greeting() {
    var p = phase();
    return (p === "morning" ? "morning" : p === "afternoon" ? "afternoon" : p === "evening" ? "evening" : "late") + ", " + (S.name || "you");
  }
  function moveLabel() {
    var p = phase();
    if (p === "morning") return "what are you sending?";
    if (p === "evening") return "how'd today go?";
    if (p === "night") return "set it down";
    return "what's the move?";
  }

  // ---- canvas -------------------------------------------------------------
  var LW = 176, LH = 312, SCALE = 2, ctx, stage, T0 = performance.now();
  var flashT = 0, flashBig = false;
  function fit() {
    stage = el("stage"); ctx = stage.getContext("2d");
    var vw = window.innerWidth, vh = window.innerHeight;
    SCALE = Math.max(1, Math.min(5, Math.floor(Math.min(vw / LW, vh / LH))));
    stage.width = LW * SCALE; stage.height = LH * SCALE;
    stage.style.width = (LW * SCALE) + "px"; stage.style.height = (LH * SCALE) + "px";
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); ctx.imageSmoothingEnabled = false;
  }
  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); }

  function render() {
    var now = performance.now();
    var t = (now - T0) / 1000;
    var p = PAL[phase()];
    var bob = Math.round(Math.sin(t * 1.7) * 1.2);
    var active = S.today > 0;

    ctx.clearRect(0, 0, LW, LH);
    // wall
    px(0, 0, LW, 214, p.wall);
    px(0, 0, LW, 90, p.wall2);
    // window with time-of-day sky
    px(18, 30, 56, 70, "#d7dbe2"); px(22, 34, 48, 62, p.sky);
    if (phase() === "night") { px(28, 40, 3, 3, "#fff"); px(52, 52, 2, 2, "#fff"); px(40, 64, 2, 2, "#cfe"); }
    px(45, 34, 2, 62, "#d7dbe2"); px(22, 63, 48, 2, "#d7dbe2");
    // shelf (>=5 actions)
    if (S.total >= 5) { px(120, 40, 40, 8, "#5a4326"); var bc = ["#c75c46","#e6b25a","#79c6d6","#b48ee0"]; for (var i=0;i<7;i++) px(122+i*5,30,3,10,bc[i%4]); }
    // baseboard + floor
    px(0, 212, LW, 4, "#3a3550");
    px(0, 216, LW, LH - 216, p.floor);
    for (var fx = 0; fx < LW; fx += 22) px(fx, 216, 1, LH - 216, p.floord);
    px(0, 216, LW, 1, "#c79468");
    // rug (>=3)
    if (S.total >= 3) { px(40, 250, 96, 44, "#a8442f"); px(48, 258, 80, 28, "#c2563f"); }
    // bed (back-left)
    px(4, 176, 40, 22, "#7a4a2a"); px(6, 171, 36, 8, "#e8e0d0"); px(6, 179, 36, 16, "#4f7a6a"); px(7, 172, 12, 6, "#fff");
    // easel + canvases earned by SENDS (the send-gate payoff)
    px(150, 150, 4, 70, "#6a4a28"); px(132, 150, 4, 64, "#6a4a28"); px(146, 210, 12, 4, "#6a4a28");
    if (S.sends > 0) {
      px(130, 150, 28, 34, "#efe6d4");
      var arts = ["#c2563f","#5b7fb0","#6a9a5a"];
      for (var a = 0; a < Math.min(S.sends, 3); a++) { px(133 + a*0, 154 + a*8, 22, 6, arts[a % 3]); px(135, 164, 18, 14, arts[(a+1)%3]); }
      // a couple framed on the wall for more sends
      if (S.sends >= 2) { px(92, 110, 18, 22, "#caa24a"); px(94, 112, 14, 18, "#5b6f9a"); }
    }
    // lamp (>=1) with time-of-day glow
    if (S.total >= 1) {
      px(160, 150, 2, 66, "#8a8a8a"); px(156, 214, 10, 3, "#666");
      px(153, 142, 16, 9, "#f0d88a");
      if (p.lamp > 0) { ctx.globalAlpha = p.lamp * 0.5; px(146, 138, 30, 40, "#ffe6a0"); ctx.globalAlpha = 1; }
    }
    // plant (>=2)
    if (S.total >= 2) { px(8, 250, 12, 10, "#9c5a3a"); px(8, 238, 12, 13, "#3f8a3f"); px(5, 242, 4, 7, "#4f9a4f"); px(19, 242, 4, 7, "#4f9a4f"); }

    drawChar(LW / 2, 248, bob, active, p);

    // night/time tint over everything
    ctx.fillStyle = p.tint; ctx.fillRect(0, 0, LW, LH);
    // soft vignette
    var g = ctx.createRadialGradient(LW/2, LH*0.55, LH*0.3, LW/2, LH*0.55, LH*0.75);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.34)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, LW, LH);

    if (flashT > 0) flashT -= 1 / 60;
    requestAnimationFrame(render);
  }

  function drawChar(cx, footY, bob, active, p) {
    var x = Math.round(cx - 13), y = footY - 52 + bob;
    var skin = active ? "#ecbf95" : "#caa882";
    var hair = "#5a3a22", shirt = active ? "#5f8f86" : "#4d6e68", pant = "#34375c", shoe = "#222";
    // shadow
    ctx.globalAlpha = 0.28; px(x + 3, footY + 1, 20, 3, "#000"); ctx.globalAlpha = 1;
    // legs
    px(x + 7, y + 34, 6, 14, pant); px(x + 15, y + 34, 6, 14, pant);
    px(x + 7, footY - 2, 6, 3, shoe); px(x + 15, footY - 2, 6, 3, shoe);
    // torso + arms
    px(x + 4, y + 16, 20, 19, shirt);
    px(x + 1, y + 16, 3, 13, shirt); px(x + 24, y + 16, 3, 13, shirt);
    px(x + 1, y + 27, 3, 3, skin); px(x + 24, y + 27, 3, 3, skin);
    // head
    px(x + 7, y + 3, 14, 14, skin);
    // hair
    px(x + 6, y, 16, 6, hair); px(x + 6, y + 4, 3, 7, hair); px(x + 19, y + 4, 3, 7, hair);
    // face
    var eye = active ? "#2a2333" : "#5a5266";
    px(x + 10, y + 9, 2, 2, eye); px(x + 16, y + 9, 2, 2, eye);
    px(x + 12, y + 13, 4, 1, active ? "#b5715a" : "#8a6a5a");
    // active glow + send halo
    if (S.sentToday) { ctx.globalAlpha = 0.25; px(x - 2, y - 2, 31, 52, "#ffe6a0"); ctx.globalAlpha = 1; }
    // reward flash
    if (flashT > 0) {
      ctx.globalAlpha = Math.min(0.85, flashT * (flashBig ? 2.4 : 2.0));
      px(x - 2, y - 2, 31, 54, flashBig ? "#fff3cf" : "#ffffff");
      ctx.globalAlpha = 1;
    }
  }

  // ---- mirror line --------------------------------------------------------
  function mirror() {
    var p = phase();
    if (!S.lastKind && S.today === 0) {
      if (p === "morning") return "a fresh page. name the one thing worth sending today.";
      if (p === "evening") return "the day's winding down. what did you actually move?";
      if (p === "night") return "it's late. you came anyway — that counts.";
      return "you're here. what's the one move?";
    }
    if (S.lastKind === "send") return "that's the real you. now go put it down and live.";
    var lines = {
      move: "the body kept its promise. that's banked.",
      breathe: "you came back to center. quietly, that changes everything.",
      focus: "you did the deep work — the rare one. bank it.",
      eat: "you fueled instead of drifted. small, real, yours.",
      tidy: "order in the room is order in the head. nice."
    };
    if (lines[S.lastKind]) return lines[S.lastKind];
    if (S.today >= 3) return "three real moves in. this is what a good day looks like up close.";
    return "one rep down. that's the one that starts it.";
  }

  // ---- reward -------------------------------------------------------------
  function reward(kind, color) {
    var big = kind === "send";
    var hue = big ? "#e7b24a" : (color || "#b48ee0");
    flashT = big ? 0.5 : 0.3; flashBig = big;
    try { if (navigator.vibrate) navigator.vibrate(big ? [10, 40, 12] : [13]); } catch (e) {}
    var b = el("bloom");
    b.style.background = "radial-gradient(circle at 50% 58%, " + hue + ", transparent 68%)";
    b.style.transition = "none"; b.style.opacity = big ? "0.6" : "0.38";
    requestAnimationFrame(function () {
      b.style.transition = "opacity 1.15s ease-out"; b.style.opacity = "0";
    });
  }

  // ---- logging ------------------------------------------------------------
  function logAction(kind, color, isSend) {
    S.total += 1; S.today += 1; S.lastKind = isSend ? "send" : kind;
    if (isSend) { S.sends += 1; S.sentToday = true; }
    reward(isSend ? "send" : kind, color);
    save(); paintHome(); closeSheet();
  }

  // ---- home ---------------------------------------------------------------
  function paintHome() {
    el("greet").textContent = greeting();
    el("mirror").textContent = mirror();
    el("moveBtn").textContent = moveLabel();
    var lume = Math.min(1, 0.22 + S.today * 0.22);
    var dot = document.querySelector("#lume .dot");
    if (dot) { dot.style.opacity = lume; dot.style.boxShadow = "0 0 " + (4 + S.today * 3) + "px var(--beacon)"; }
  }

  // ---- sheet --------------------------------------------------------------
  function openSheet() { buildSheet(); el("sheet").classList.add("on"); }
  function closeSheet() { el("sheet").classList.remove("on"); }

  function buildSheet() {
    var p = phase();
    el("sheetT").textContent = p === "evening" ? "how'd today go?" : "what did you do?";
    var body = el("sheetBody"); body.innerHTML = "";
    var row = document.createElement("div"); row.className = "row";

    // SEND — the north star, first
    var send = document.createElement("button");
    send.className = "act send";
    send.innerHTML = '<span class="em">✦</span>' + (S.avoided ? "I sent it — " + esc(S.avoided) : "I sent something real");
    send.onclick = function () { logAction("send", "#e7b24a", true); };
    row.appendChild(send);

    DOMAINS.forEach(function (d) {
      var a = document.createElement("button"); a.className = "act";
      a.innerHTML = '<span class="em">' + d.em + "</span>" + d.label;
      a.onclick = function () { d.task ? buildSubtasks(d) : logAction(d.k, d.color, false); };
      row.appendChild(a);
    });
    body.appendChild(row);
  }

  function buildSubtasks(d) {
    el("sheetT").textContent = "tidy — one small step at a time";
    var body = el("sheetBody"); body.innerHTML = "";
    var picked = {};
    var wrap = document.createElement("div"); wrap.className = "sub";
    SUBTASKS.forEach(function (label, i) {
      var item = document.createElement("div"); item.className = "subitem";
      item.innerHTML = '<span class="box"></span><span>' + label + "</span>";
      item.onclick = function () {
        if (picked[i]) return;
        picked[i] = true; item.classList.add("done");
        logActionQuiet(d.k, d.color);
      };
      wrap.appendChild(item);
    });
    body.appendChild(wrap);
    var back = document.createElement("button"); back.className = "back"; back.textContent = "done";
    back.onclick = closeSheet; body.appendChild(back);
  }
  // subtask logs reward but keeps the sheet open so you can tick several
  function logActionQuiet(kind, color) {
    S.total += 1; S.today += 1; S.lastKind = kind;
    reward(kind, color); save(); paintHome();
  }

  function esc(s) { return (s || "").replace(/[<>&]/g, ""); }

  // ---- onboarding ---------------------------------------------------------
  var ob = 0, obName = "home";
  function startOb() { el("ob").classList.add("on"); el("moveBtn").style.display = "none"; el("hud").style.opacity = "0"; renderOb(); }
  function endOb() { el("ob").classList.remove("on"); el("moveBtn").style.display = ""; el("hud").style.opacity = "1"; S.onboarded = true; save(); paintHome(); }

  function obLine(text) { var l = el("obLine"); l.classList.remove("show"); l.textContent = text; setTimeout(function(){ l.classList.add("show"); }, 60); }
  function btn(label, fn, ghost) { var b = document.createElement("button"); b.className = "obBtn pix" + (ghost ? " ghost" : ""); b.textContent = label; b.onclick = fn; return b; }

  function renderOb() {
    var ctl = el("obCtl"); ctl.innerHTML = "";
    el("obLine").className = "pix fadeline";
    if (ob === 0) {
      obLine(phase() === "night" ? "oh — it's late. you came anyway." : "hey. you're here.");
      ctl.appendChild(btn("…", function () { ob = 1; renderOb(); }));
    } else if (ob === 1) {
      obLine("before anything — what should I call this place?");
      var inp = document.createElement("input"); inp.placeholder = "home"; inp.value = "";
      ctl.appendChild(inp);
      ctl.appendChild(btn("continue", function () { obName = inp.value.trim() || "home"; S.place = obName; ob = 2; renderOb(); }));
    } else if (ob === 2) {
      obLine("I think I already know you. tell me if this lands.");
      var done = {};
      TRAITS.forEach(function (tr, i) {
        var c = document.createElement("button"); c.className = "chip"; c.textContent = '"' + tr + '"';
        c.onclick = function () {
          if (done[i]) return; done[i] = true; c.classList.add("yes"); S.total += 1;
          try { if (navigator.vibrate) navigator.vibrate(9); } catch (e) {}
        };
        ctl.appendChild(c);
      });
      ctl.appendChild(btn("yeah, that's me", function () { ob = 3; renderOb(); }));
    } else if (ob === 3) {
      obLine("so — what's the one move you keep avoiding?");
      var inp2 = document.createElement("input"); inp2.placeholder = "send the proposal · ship the painting";
      ctl.appendChild(inp2);
      ctl.appendChild(btn("continue", function () { S.avoided = inp2.value.trim().slice(0, 40); ob = 4; renderOb(); }));
    } else if (ob === 4) {
      obLine("we don't end on a setup screen. one tiny send — right now. who gets one line from you?");
      var inp3 = document.createElement("input"); inp3.placeholder = "a name…";
      ctl.appendChild(inp3);
      ctl.appendChild(btn("I sent it ✦", function () {
        S.sends += 1; S.sentToday = true; S.total += 1; S.today += 1; S.lastKind = "send";
        reward("send", "#e7b24a"); endOb();
        setTimeout(function () { el("mirror").textContent = "first send, on day one. that's the whole game. welcome."; }, 200);
      }));
      ctl.appendChild(btn("not yet — show me home", function () {
        S.lastKind = null; endOb();
        setTimeout(function () { el("mirror").textContent = "no rush. it'll be here when you're ready to send."; }, 200);
      }, true));
    }
  }

  // ---- wire ---------------------------------------------------------------
  function init() {
    load(); fit();
    window.addEventListener("resize", fit);
    el("moveBtn").onclick = openSheet;
    el("sheet").onclick = function (e) { if (e.target === el("sheet")) closeSheet(); };
    el("sheetClose").onclick = closeSheet;
    paintHome();
    requestAnimationFrame(render);
    if (!S.onboarded) startOb();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
