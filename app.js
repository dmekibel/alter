/* ALTER v0 — a pixel-art life mirror.
   Do real things -> earn coins + XP -> sprite levels up + you build its room.
   Pure static. State in localStorage. No backend, no accounts, no API. */
(function () {
  "use strict";

  // ---- config -------------------------------------------------------------
  var DOMAINS = [
    { key: "order",   label: "Order",   em: "🧹", stat: "Order",    color: "#e0795a" },
    { key: "breath",  label: "Breath",  em: "🌬️", stat: "Breath",   color: "#6fc6d6" },
    { key: "calm",    label: "Meditate",em: "🧘", stat: "Calm",     color: "#b48ee0" },
    { key: "sport",   label: "Sport",   em: "🏋️", stat: "Vitality", color: "#6fd68a" },
    { key: "fuel",    label: "Nutrition",em:"🍎", stat: "Fuel",     color: "#e6c25a" },
    { key: "focus",   label: "Deep Work",em:"🧠", stat: "Focus",    color: "#f08fb0" }
  ];

  // furniture: each appears in the room when owned. levelReq gates the buy.
  var FURNITURE = [
    { id: "plant",     name: "Potted plant", price: 40,  levelReq: 1 },
    { id: "lamp",      name: "Floor lamp",   price: 70,  levelReq: 1 },
    { id: "bed",       name: "Cozy bed",     price: 110, levelReq: 1 },
    { id: "desk",      name: "Work desk",    price: 150, levelReq: 2 },
    { id: "poster",    name: "Wall poster",  price: 70,  levelReq: 2 },
    { id: "bookshelf", name: "Bookshelf",    price: 160, levelReq: 3 },
    { id: "tv",        name: "Retro TV",     price: 240, levelReq: 4 }
  ];

  // appearance: sets a field on look{}. swatch shown in shop.
  var LOOKS = [
    { id: "hair_blue", name: "Blue hair",   price: 60,  field: "hair",  value: "#5b8dd9", levelReq: 1 },
    { id: "hair_pink", name: "Pink hair",   price: 60,  field: "hair",  value: "#e07fb0", levelReq: 1 },
    { id: "shirt_red", name: "Red shirt",   price: 50,  field: "shirt", value: "#cf4d4d", levelReq: 1 },
    { id: "shirt_gold",name: "Gold shirt",  price: 90,  field: "shirt", value: "#e0b24a", levelReq: 2 },
    { id: "glasses",   name: "Glasses",     price: 80,  field: "glasses", value: true, levelReq: 2 },
    { id: "hat",       name: "Beanie",      price: 120, field: "hat",   value: "#7a5ec0", levelReq: 3 }
  ];

  var XP_PER_LVL = 120;
  var REWARD = { coins: 15, stat: 12, xp: 20 };
  var DECAY = 4;          // stat points lost per idle day
  var START_COINS = 45;

  // ---- state --------------------------------------------------------------
  var KEY = "alter_v0";
  var state;

  function freshState() {
    var stats = {};
    DOMAINS.forEach(function (d) { stats[d.key] = 18; });
    return {
      coins: START_COINS,
      totalXp: 0,
      stats: stats,
      owned: {},                 // furniture id -> true
      look: { hair: "#7a4a2a", shirt: "#4f9a8a", glasses: false, hat: false },
      today: [],                 // domain keys logged today
      plans: [],                 // {text,time,domain,done}
      history: {},               // 'YYYY-MM-DD' -> count
      lastDay: today()
    };
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      state = raw ? JSON.parse(raw) : freshState();
    } catch (e) { state = freshState(); }
    rollover();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function rollover() {
    var t = today();
    if (state.lastDay === t) return;
    // count days passed for gentle decay
    var passed = daysBetween(state.lastDay, t);
    if (passed > 0) {
      DOMAINS.forEach(function (d) {
        state.stats[d.key] = Math.max(0, (state.stats[d.key] || 0) - DECAY * passed);
      });
    }
    state.today = [];
    state.plans.forEach(function (p) { p.done = false; });
    state.lastDay = t;
    save();
  }
  function daysBetween(a, b) {
    try {
      var da = new Date(a + "T00:00:00"), db = new Date(b + "T00:00:00");
      return Math.round((db - da) / 86400000);
    } catch (e) { return 1; }
  }

  // ---- economy ------------------------------------------------------------
  function level() { return Math.floor(state.totalXp / XP_PER_LVL) + 1; }
  function xpInto() { return state.totalXp % XP_PER_LVL; }

  function logDomain(key) {
    var first = state.today.indexOf(key) === -1;
    state.stats[key] = Math.min(100, (state.stats[key] || 0) + REWARD.stat);
    state.coins += REWARD.coins;
    state.totalXp += REWARD.xp;
    if (first) state.today.push(key);
    var t = today();
    state.history[t] = (state.history[t] || 0) + 1;
    save();
    renderAll();
    pulse();
  }

  function buy(item, kind) {
    if (level() < item.levelReq) return;
    if (state.coins < item.price) return;
    if (kind === "furniture") {
      if (state.owned[item.id]) return;
      state.coins -= item.price;
      state.owned[item.id] = true;
    } else {
      state.coins -= item.price;
      state.look[item.field] = item.value;
    }
    save();
    renderAll();
    pulse();
  }

  // ---- pixel renderer -----------------------------------------------------
  var canvas = document.getElementById("room");
  var ctx = canvas.getContext("2d");
  var W = 176, H = 152, SCALE = 2;

  function fit() {
    var wrap = document.getElementById("roomwrap");
    var avail = wrap.clientWidth - 16;
    SCALE = Math.max(1, Math.min(4, Math.floor(avail / W)));
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    canvas.style.width = (W * SCALE) + "px";
    canvas.style.height = (H * SCALE) + "px";
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.imageSmoothingEnabled = false;
    drawRoom();
  }

  function px(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  function drawRoom() {
    ctx.clearRect(0, 0, W, H);
    // wall
    px(0, 0, W, 56, "#5d6a7a");
    px(0, 0, W, 22, "#66738a");
    // window
    px(110, 8, 42, 32, "#cfd6df");
    px(113, 11, 36, 26, "#9bd6ec");
    px(113, 28, 36, 9, "#7fc3a0");
    px(130, 11, 2, 26, "#cfd6df");
    px(113, 23, 36, 2, "#cfd6df");
    // baseboard + floor
    px(0, 54, W, 2, "#46505e");
    px(0, 56, W, H - 56, "#b07a4f");
    for (var i = 0; i < W; i += 16) px(i, 56, 1, H - 56, "#9c6a42");
    px(0, 56, W, 1, "#c79468");
    // rug (always)
    px(54, 104, 70, 36, "#a8442f");
    px(60, 110, 58, 24, "#c75c46");
    px(70, 116, 38, 12, "#a8442f");

    // wall items
    if (state.owned.poster) drawPoster(28, 12);
    // back-wall floor furniture (drawn before avatar)
    if (state.owned.bed) drawBed(8, 70);
    if (state.owned.desk) drawDesk(64, 62);
    if (state.owned.bookshelf) drawBookshelf(142, 56);
    // avatar
    drawAvatar();
    // front furniture (drawn after avatar -> overlaps)
    if (state.owned.plant) drawPlant(8, 118);
    if (state.owned.tv) drawTV(44, 118);
    if (state.owned.lamp) drawLamp(154, 96);
  }

  function drawBed(ox, oy) {
    px(ox, oy, 42, 22, "#7a4a2a");
    px(ox + 2, oy - 5, 38, 9, "#e8e0d0");
    px(ox + 2, oy + 3, 38, 17, "#4f7a6a");
    px(ox + 3, oy - 4, 12, 7, "#ffffff");
    px(ox, oy + 20, 42, 3, "#5a3320");
  }
  function drawDesk(ox, oy) {
    px(ox, oy, 36, 4, "#7a5230");
    px(ox + 2, oy + 4, 3, 17, "#5a3a1f");
    px(ox + 31, oy + 4, 3, 17, "#5a3a1f");
    px(ox + 9, oy - 13, 16, 13, "#23222e");
    px(ox + 11, oy - 11, 12, 9, "#5fd0e0");
    px(ox + 14, oy + 6, 9, 4, "#444a5a"); // stool
  }
  function drawBookshelf(ox, oy) {
    px(ox, oy, 26, 44, "#6a4326");
    px(ox + 1, oy + 1, 24, 12, "#3a2614");
    px(ox + 1, oy + 16, 24, 12, "#3a2614");
    px(ox + 1, oy + 31, 24, 12, "#3a2614");
    var cols = ["#c75c46", "#e0b24a", "#6fc6d6", "#b48ee0", "#6fd68a"];
    var rows = [oy + 2, oy + 17, oy + 32];
    for (var r = 0; r < 3; r++)
      for (var b = 0; b < 6; b++)
        px(ox + 2 + b * 4, rows[r], 3, 10, cols[(r + b) % cols.length]);
  }
  function drawPlant(ox, oy) {
    px(ox + 2, oy + 12, 11, 9, "#9c5a3a");
    px(ox + 3, oy + 12, 9, 2, "#b06a44");
    px(ox + 2, oy + 1, 11, 12, "#3f8a3f");
    px(ox, oy + 5, 4, 6, "#4f9a4f");
    px(ox + 11, oy + 5, 4, 6, "#4f9a4f");
    px(ox + 5, oy - 2, 5, 6, "#57a857");
  }
  function drawLamp(ox, oy) {
    px(ox + 4, oy, 2, 26, "#8a8a8a");
    px(ox, oy + 24, 10, 3, "#666");
    px(ox - 3, oy - 8, 16, 9, "#f0d88a");
    px(ox - 1, oy + 1, 12, 2, "#d8b85a");
  }
  function drawTV(ox, oy) {
    px(ox, oy + 18, 42, 7, "#5a3a1f");
    px(ox + 4, oy, 34, 21, "#1b1b24");
    px(ox + 6, oy + 2, 30, 17, "#3a6ea5");
    px(ox + 6, oy + 2, 30, 4, "#4f86c0");
    px(ox + 16, oy + 21, 10, 2, "#3a3320");
  }
  function drawPoster(ox, oy) {
    px(ox, oy, 20, 26, "#caa24a");
    px(ox + 2, oy + 2, 16, 22, "#3a3350");
    px(ox + 4, oy + 14, 12, 8, "#7a5ec0");
    px(ox + 6, oy + 5, 8, 8, "#e0b24a");
    px(ox + 4, oy + 12, 12, 1, "#b48ee0");
  }

  function drawAvatar() {
    var L = state.look, ax = 78, ay = 80;
    var skin = "#e8b890", pant = "#33365a", shoe = "#222";
    // shadow
    px(ax, ay + 30, 16, 2, "rgba(0,0,0,0.25)");
    // legs + shoes
    px(ax + 3, ay + 19, 4, 9, pant);
    px(ax + 9, ay + 19, 4, 9, pant);
    px(ax + 3, ay + 28, 4, 2, shoe);
    px(ax + 9, ay + 28, 4, 2, shoe);
    // torso (shirt) + arms
    px(ax + 2, ay + 9, 12, 11, L.shirt);
    px(ax, ay + 9, 2, 7, L.shirt);
    px(ax + 14, ay + 9, 2, 7, L.shirt);
    px(ax, ay + 16, 2, 2, skin);
    px(ax + 14, ay + 16, 2, 2, skin);
    // head
    px(ax + 3, ay + 2, 10, 8, skin);
    // hair
    px(ax + 2, ay, 12, 4, L.hair);
    px(ax + 2, ay + 3, 2, 5, L.hair);
    px(ax + 12, ay + 3, 2, 5, L.hair);
    // eyes / mouth
    px(ax + 5, ay + 5, 1, 2, "#23202e");
    px(ax + 10, ay + 5, 1, 2, "#23202e");
    px(ax + 7, ay + 8, 2, 1, "#b5715a");
    // accessories
    if (L.glasses) {
      px(ax + 4, ay + 5, 3, 2, "#15121f"); px(ax + 9, ay + 5, 3, 2, "#15121f");
      px(ax + 7, ay + 5, 2, 1, "#15121f");
    }
    if (L.hat) { px(ax + 1, ay - 1, 14, 4, L.hat); px(ax + 1, ay + 2, 14, 1, "#00000033"); }
  }

  function pulse() {
    canvas.style.transition = "none";
    canvas.style.filter = "brightness(1.4)";
    setTimeout(function () {
      canvas.style.transition = "filter .35s";
      canvas.style.filter = "brightness(1)";
    }, 30);
  }

  // ---- mirror line --------------------------------------------------------
  function mirrorLine() {
    var t = state.today;
    var has = function (k) { return t.indexOf(k) !== -1; };
    if (t.length === 0) return "A blank page. The first log writes today's character.";
    if (has("sport") && has("calm")) return "An athlete's body, a clear mind. That's who showed up today.";
    if (has("focus") && has("order")) return "Ordered space, deep focus — the version of you that ships was here.";
    if (has("focus")) return "You did the deep work. That's the rare one. Bank it.";
    if (has("sport")) return "You moved. The body kept its promise to you today.";
    if (has("calm") || has("breath")) return "You came back to center. Quietly, that changes the whole day.";
    if (has("order")) return "You brought order to your space — and the space orders you back.";
    if (has("fuel")) return "You fueled instead of drifted. Small, real, yours.";
    if (t.length >= 3) return "Three moves in. This is what a good day actually looks like up close.";
    return "Showed up once today. That's the rep that starts the streak you don't count.";
  }

  // ---- views --------------------------------------------------------------
  function el(id) { return document.getElementById(id); }

  function renderHUD() {
    el("coins").textContent = state.coins;
    el("lvl").textContent = level();
    el("xpbar").style.width = Math.round((xpInto() / XP_PER_LVL) * 100) + "%";
  }

  function renderMirror() { el("mirror").textContent = mirrorLine(); }

  function renderLog() {
    var row = el("logRow"); row.innerHTML = "";
    DOMAINS.forEach(function (d) {
      var b = document.createElement("button");
      b.className = "logbtn" + (state.today.indexOf(d.key) !== -1 ? " done" : "");
      b.innerHTML = '<span class="em">' + d.em + "</span>" + d.label;
      b.onclick = function () { logDomain(d.key); };
      row.appendChild(b);
    });
  }

  function renderPlans() {
    var sel = el("planDomain");
    if (!sel.options.length) {
      DOMAINS.forEach(function (d) {
        var o = document.createElement("option"); o.value = d.key; o.textContent = d.label;
        sel.appendChild(o);
      });
    }
    var list = el("planList"); list.innerHTML = "";
    if (!state.plans.length) {
      var em = document.createElement("li");
      em.style.color = "var(--muted)"; em.style.fontSize = "11px";
      em.textContent = "Nothing planned yet. Add a block above.";
      list.appendChild(em);
    }
    state.plans.forEach(function (p, i) {
      var d = domain(p.domain);
      var li = document.createElement("li");
      if (p.done) li.className = "done";
      var chk = document.createElement("div");
      chk.className = "chk" + (p.done ? " on" : "");
      chk.onclick = function () { togglePlan(i); };
      var tm = document.createElement("span"); tm.className = "tm"; tm.textContent = p.time || "";
      var dot = document.createElement("span"); dot.className = "dot";
      dot.style.background = d ? d.color : "#555";
      var txt = document.createElement("span"); txt.className = "txt"; txt.textContent = p.text;
      var del = document.createElement("span");
      del.textContent = "✕"; del.style.color = "var(--muted)"; del.style.cursor = "pointer"; del.style.fontSize = "11px";
      del.onclick = function () { state.plans.splice(i, 1); save(); renderPlans(); };
      li.appendChild(chk); li.appendChild(tm); li.appendChild(dot); li.appendChild(txt); li.appendChild(del);
      list.appendChild(li);
    });
  }

  function togglePlan(i) {
    var p = state.plans[i]; if (!p) return;
    p.done = !p.done;
    if (p.done) logDomain(p.domain); else { save(); renderPlans(); }
  }

  function renderStats() {
    var box = el("statList"); box.innerHTML = "";
    DOMAINS.forEach(function (d) {
      var v = Math.round(state.stats[d.key] || 0);
      var wrap = document.createElement("div"); wrap.className = "statrow";
      var lab = document.createElement("div"); lab.className = "lab";
      lab.innerHTML = "<span>" + d.em + " " + d.stat + "</span><span>" + v + "</span>";
      var bar = document.createElement("div"); bar.className = "statbar";
      var i = document.createElement("i"); i.style.width = v + "%"; i.style.background = d.color;
      bar.appendChild(i); wrap.appendChild(lab); wrap.appendChild(bar); box.appendChild(wrap);
    });
    // heatmap last 14 days
    var heat = el("heat"); heat.innerHTML = "";
    var now = new Date();
    for (var k = 13; k >= 0; k--) {
      var dd = new Date(now.getTime() - k * 86400000);
      var key = dd.getFullYear() + "-" + pad(dd.getMonth() + 1) + "-" + pad(dd.getDate());
      var c = state.history[key] || 0;
      var sq = document.createElement("div"); sq.className = "d";
      if (c >= 3) sq.style.background = "#b48ee0";
      else if (c === 2) sq.style.background = "#6f5a9a";
      else if (c === 1) sq.style.background = "#43385f";
      sq.title = key + " · " + c;
      heat.appendChild(sq);
    }
  }

  function renderShop() {
    var lvl = level();
    var fg = el("shopFurniture"); fg.innerHTML = "";
    FURNITURE.forEach(function (it) {
      fg.appendChild(itemCard(it, "furniture", lvl));
    });
    var lg = el("shopLook"); lg.innerHTML = "";
    LOOKS.forEach(function (it) {
      lg.appendChild(itemCard(it, "look", lvl));
    });
  }

  function itemCard(it, kind, lvl) {
    var owned = kind === "furniture" && state.owned[it.id];
    var equipped = kind === "look" && state.look[it.field] === it.value;
    var locked = lvl < it.levelReq;
    var card = document.createElement("div");
    card.className = "item" + (owned || equipped ? " owned" : "");
    var swatch = "";
    if (kind === "look" && it.field !== "glasses" && typeof it.value === "string")
      swatch = '<span style="display:inline-block;width:10px;height:10px;border-radius:2px;vertical-align:middle;margin-right:5px;background:' + it.value + '"></span>';
    card.innerHTML = '<div class="nm">' + swatch + it.name + "</div>" +
      '<div class="pr">🪙 ' + it.price + "</div>";
    var btn = document.createElement("button");
    if (owned) { btn.textContent = "Owned"; btn.disabled = true; }
    else if (equipped) { btn.textContent = "Wearing"; btn.disabled = true; }
    else if (locked) { btn.textContent = "Lvl " + it.levelReq; btn.disabled = true; }
    else if (state.coins < it.price) { btn.textContent = "Need 🪙"; btn.disabled = true; }
    else { btn.textContent = kind === "look" ? "Wear" : "Buy"; btn.onclick = function () { buy(it, kind); }; }
    card.appendChild(btn);
    return card;
  }

  function domain(key) {
    for (var i = 0; i < DOMAINS.length; i++) if (DOMAINS[i].key === key) return DOMAINS[i];
    return null;
  }

  function renderAll() {
    renderHUD(); renderMirror(); renderLog(); renderPlans();
    renderStats(); renderShop(); drawRoom();
  }

  // ---- wiring -------------------------------------------------------------
  function tabs() {
    var els = document.querySelectorAll(".tab");
    els.forEach(function (t) {
      t.onclick = function () {
        els.forEach(function (x) { x.classList.remove("on"); });
        t.classList.add("on");
        ["today", "stats", "shop"].forEach(function (s) {
          document.getElementById(s).classList.toggle("on", s === t.dataset.tab);
        });
      };
    });
  }

  function addPlan() {
    var text = el("planText").value.trim();
    if (!text) return;
    state.plans.push({ text: text, time: el("planTime").value, domain: el("planDomain").value, done: false });
    el("planText").value = ""; el("planTime").value = "";
    state.plans.sort(function (a, b) { return (a.time || "99").localeCompare(b.time || "99"); });
    save(); renderPlans();
  }

  function init() {
    load();
    tabs();
    el("planAdd").onclick = addPlan;
    el("planText").addEventListener("keydown", function (e) { if (e.key === "Enter") addPlan(); });
    el("reset").onclick = function (e) {
      e.preventDefault();
      if (confirm("Wipe save and start fresh?")) { state = freshState(); save(); renderAll(); }
    };
    window.addEventListener("resize", fit);
    fit();
    renderAll();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
