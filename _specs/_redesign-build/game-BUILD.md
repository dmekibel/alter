# GAME screen — 1:1 BUILD SPEC (ceremony visuals only)

**Canon:** `_specs/_epic-mockups/_widget-refs/game.jpg`
**Scope (David's tabling call):** CEREMONY VISUALS ONLY. Do **not** design any new economy, attention sink, or garden↔game connection. Two deliverables:
1. **Planting ceremony** — a full-screen night-garden scene (moon, stars, green hill, blue water), colored seed-pips (stem in soil), a caption card tethered to a seed, and a bottom line "выросло из настоящего дня".
2. **Collection binder** — upgrade the existing `binderSheet()` to the canon: `Коллекция · 12/24 собрано`, **МЕТКИ / ТРОФЕИ** tabs, foil cards (HOLO / SUNBURST / COSMOS + a locked card) each with **evolution pips**, and a **ТРОФЕИ** row (gold-edge trophy card).

---

## 1. SUMMARY

**Where this lives today.**
- `renderGame()` — `app.js:5601`. It fills `#spark` (the Spark counter, `index.html:1843`) and `#upgrades` (`index.html:1848`) inside the Game/You pane. It already renders three buttons: "Your marks — the collection" → `binderSheet`, "Plant in your world · N Spark" → `plantGarden`, plus the skateboard/trick upgrades.
- `binderSheet()` — `app.js:5584`. Opens a `.goal-ov` / `.goal-card` overlay, renders `BADGES` (`app.js:5522`) into a `.binder-grid` of `.binder-card` chips using `elCardBG(b.el)` foil backgrounds (`el-prism` / `el-burst` / `el-cosmos` / `el-slash` / `el-lattice` / `el-bio`, CSS `index.html:1010-1015`), and a `.b-total` "earned / total".
- `plantGarden()` — `app.js:5398`. Spends Spark, pushes `{t, stage, plantedK}` onto `S.game.garden`, calls `renderGame()` + `toast()`. **No visual ceremony today — it just toasts.** The canon night-garden scene is what we add.
- `BADGES` already map 1:1 to the canon foil cards: `return`→**Вернулся** (prism/HOLO), `streak`→**Огонь** but canon labels it **21 подряд** (burst/SUNBURST), `depth`→**Глубина** (cosmos/COSMOS), `align`→**Точность**, plus a locked example the canon calls **Король недели** (a NEW trophy-badge — see §3). The RU dict already has all six names (`app.js:1331`).

**What changes:** we (a) add a `plantCeremony()` overlay that `plantGarden()` shows on a successful plant, and (b) rewrite `binderSheet()`'s render to the canon (tabs + evolution pips + trophy row). Both are additive; `BADGES`, `earn`, `plantGarden`'s state writes are untouched.

---

## 2. CSS  (add to `index.html`)

### 2a — Planting ceremony scene
**Insert after** this exact line (`index.html:1029`, end of the binder block):
```
  .b-total{ text-align:center; color:#8a7898; font-family:"Jost",sans-serif; font-weight:800; font-size:13px; padding:10px 0 4px; }
```
Add:
```css
  /* ===== PLANTING CEREMONY (canon game.jpg left) — night garden: moon, stars, green hill, blue water ===== */
  .pc-ov{ position:fixed; inset:0; z-index:80; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
    /* sky (deep plum) → hill (green) → water (blue), stacked as one radial+linear paint */
    background:
      radial-gradient(120% 62% at 50% 128%, #0e3a6e 0%, #0e3a6e 30%, transparent 31%),   /* blue water dome */
      radial-gradient(150% 70% at 50% 96%, #1f6a3a 0%, #1f6a3a 44%, transparent 45%),      /* green hill */
      linear-gradient(180deg, #1a0a24 0%, #2a0f38 58%, #34123f 100%);                       /* night sky */
    animation:ovFade .28s var(--ease-settle) both; overflow:hidden; }
  .pc-moon{ position:absolute; top:11%; right:19%; width:74px; height:74px; border-radius:50%;
    background:radial-gradient(circle at 38% 34%, #fff 0%, #ffe9f4 46%, #f6b8dd 100%);
    box-shadow:0 0 34px 10px rgba(255,210,236,.32); }
  .pc-star{ position:absolute; width:3px; height:3px; border-radius:50%; background:#fff; opacity:.85; animation:pcTwinkle 3.4s ease-in-out infinite; }
  @keyframes pcTwinkle{ 0%,100%{ opacity:.3; } 50%{ opacity:.9; } }
  /* a planted pip: a bright colored bulb on a thin stem rising from a dark soil dimple */
  .pc-pip{ position:absolute; transform:translate(-50%,0); text-align:center; }
  .pc-pip .pc-stem{ width:3px; height:34px; margin:0 auto; background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.12)); border-radius:2px; }
  .pc-pip .pc-bulb{ width:17px; height:17px; border-radius:50%; margin:0 auto -6px; box-shadow:0 0 12px 2px currentColor; }
  .pc-pip .pc-soil{ width:26px; height:9px; border-radius:50%; margin:2px auto 0; background:radial-gradient(circle,#20140d 0%,#3a2415 70%,transparent 72%); }
  /* the caption card tethered to a seed */
  .pc-tether{ position:absolute; width:2px; background:rgba(255,180,220,.55); transform:translateX(-50%); }
  .pc-cap{ position:absolute; transform:translate(-50%,-100%); max-width:230px; background:rgba(60,14,42,.92);
    border:2px solid #ff6fb0; border-radius:15px; box-shadow:0 5px 0 #160510; padding:11px 14px;
    color:#ffe3f1; font-family:"Jost",sans-serif; font-weight:700; font-size:14px; line-height:1.3; text-align:center; }
  .pc-cap b{ color:#ff8fc4; font-weight:800; }   /* the date span glows pink */
  /* bottom pink chip: "выросло из настоящего дня" */
  .pc-foot{ position:relative; z-index:3; margin:0 0 max(22px,env(safe-area-inset-bottom)); display:flex; align-items:center; gap:9px;
    background:#2c081a; border:3px solid #160510; border-radius:16px; box-shadow:0 5px 0 #160510;
    padding:14px 20px; color:#ffe3f1; font-family:"Jost",sans-serif; font-weight:800; font-size:16px; }
  .pc-foot i{ color:#ff5fa0; font-size:19px; }
```

### 2b — Binder: tabs, evolution pips, trophy row
**Insert after** the block you just added (the `.pc-foot i` line). Add:
```css
  /* ===== BINDER canon (game.jpg right) — count pill, МЕТКИ/ТРОФЕИ tabs, evolution pips, trophy row ===== */
  .bnd-count{ display:inline-flex; align-items:center; gap:7px; align-self:flex-start; margin:2px 0 12px;
    background:#160510; border:2px solid #ffd24a; border-radius:13px; padding:7px 14px;
    color:#ffd24a; font-family:"Jost",sans-serif; font-weight:800; font-size:14px; letter-spacing:.4px; }
  .bnd-count i{ font-size:16px; }
  .bnd-tabs{ display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:14px; }
  .bnd-tab{ border:2.5px solid #160510; border-radius:15px; padding:14px 0; text-align:center; cursor:pointer;
    background:#241328; color:#b596ad; font-family:"Jost",sans-serif; font-weight:800; font-size:16px; letter-spacing:2px;
    box-shadow:0 4px 0 #160510; transition:transform .1s; }
  .bnd-tab:active{ transform:translateY(3px); box-shadow:0 1px 0 #160510; }
  .bnd-tab.on{ color:#2a0d1c; background:repeating-linear-gradient(115deg,#ff6fb0 0 12px,#ff8fc4 12px 24px); }
  /* evolution pips — square chips; filled = gold, empty = inked hollow */
  .evo-row{ position:relative; z-index:3; display:flex; gap:5px; justify-content:center; margin-top:7px; }
  .evo-pip{ width:11px; height:11px; border-radius:3px; border:1.5px solid #160510; background:rgba(0,0,0,.35); }
  .evo-pip.on{ background:#ffd24a; box-shadow:0 0 6px rgba(255,210,74,.6); }
  .binder-card.locked .evo-pip.on{ background:#ff5fa0; box-shadow:none; }   /* locked "Король недели" shows PINK progress pips */
  .binder-card .b-sub{ position:relative; z-index:3; color:#c78fbf; font-family:"Jost",sans-serif; font-weight:800; font-size:10.5px; letter-spacing:1.5px; text-transform:uppercase; margin-top:1px; }
  .binder-card .b-lockmsg{ position:relative; z-index:3; color:#8a7898; font-family:"Jost",sans-serif; font-weight:600; font-size:11px; line-height:1.25; margin-top:3px; }
  /* the locked-progress bar under Король недели */
  .binder-card .b-bar{ position:relative; z-index:3; height:6px; border-radius:4px; background:rgba(0,0,0,.4); margin:8px 10px 0; overflow:hidden; }
  .binder-card .b-bar > i{ display:block; height:100%; background:#ff5fa0; border-radius:4px; }
  /* the icon in a ringed disc, like the canon */
  .binder-card .b-disc{ position:relative; z-index:3; width:52px; height:52px; margin:2px auto 6px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.34); border:2.5px solid currentColor; }
  .binder-card .b-disc i{ font-size:24px; }
  /* ТРОФЕИ header + gold-edge trophy row */
  .bnd-trhead{ color:#ffd24a; font-family:"Jost",sans-serif; font-weight:800; font-size:14px; letter-spacing:2px; margin:16px 2px 8px; }
  .bnd-trophy{ display:flex; align-items:center; gap:14px; padding:3px; border-radius:16px;
    background:linear-gradient(120deg,#ffd24a,#c08a22); box-shadow:0 4px 0 #160510; }
  .bnd-trophy > .tr-in{ flex:1; display:flex; align-items:center; gap:14px; background:linear-gradient(160deg,#3a2a08,#241a04); border-radius:13px; padding:13px 15px; }
  .bnd-trophy .tr-ic{ font-size:30px; color:#ffd24a; }
  .bnd-trophy .tr-body{ flex:1; }
  .bnd-trophy .tr-name{ color:#fff4d6; font-family:"Jost",sans-serif; font-weight:800; font-size:16px; }
  .bnd-trophy .tr-meta{ color:#e0c98a; font-family:"Jost",sans-serif; font-weight:700; font-size:12.5px; margin-top:2px; }
```

---

## 3. RENDER JS  (`app.js`)

### 3a — Add `plantCeremony()` and call it from `plantGarden()`

**Replace** the whole `plantGarden` function (`app.js:5398-5403`):
```javascript
  function plantGarden() {
    if (!hasEarnedToday()) { toast("do one real thing today — then your world grows"); return; }
    var n = (S.game.garden || []).length, cost = n === 0 ? 0 : 20 * n;
    if (S.game.spark < cost) { toast("not enough Spark yet — earn a little more"); return; }
    S.game.spark -= cost; S.game.garden.push({ t: n % 5, stage: 0, plantedK: todayK() }); save(); renderGame(); toast(n === 0 ? "planted your first seed — welcome" : "planted — your world grew");
  }
```
with:
```javascript
  function plantGarden() {
    if (!hasEarnedToday()) { toast("do one real thing today — then your world grows"); return; }
    var n = (S.game.garden || []).length, cost = n === 0 ? 0 : 20 * n;
    if (S.game.spark < cost) { toast("not enough Spark yet — earn a little more"); return; }
    S.game.spark -= cost; S.game.garden.push({ t: n % 5, stage: 0, plantedK: todayK() }); save(); renderGame();
    try { sfx(5); hapt(5); } catch (e) {}
    plantCeremony();
  }
  // ===== PLANTING CEREMONY (canon game.jpg left): a night garden — moon, stars, green hill, blue water; the seeds already
  // planted this session appear as colored pips; the NEWEST is captioned with the day it grew from. Pure presentation over S.game.garden. =====
  function plantCeremony() {
    var ov = add(document.body, "div", "pc-ov"); ov.addEventListener("click", function () { ov.classList.add("out"); ov.remove(); });
    add(ov, "div", "pc-moon");
    // scattered stars in the upper sky
    var starXY = [[9, 8], [30, 14], [58, 6], [78, 20], [16, 27], [46, 30], [88, 11], [12, 42]];
    starXY.forEach(function (p, i) { var s = add(ov, "div", "pc-star"); s.style.left = p[0] + "%"; s.style.top = p[1] + "%"; s.style.animationDelay = (i * 0.4) + "s"; });
    // the pips: one per garden seed (cap to a tidy row of 5), spread across the hill; newest last so it sits under the caption
    var COLORS = ["#36b3f0", "#ff5fa0", "#46e2a4", "#ffd24a", "#b07aff"]; // blue/pink/green/yellow/purple — locked palette domains
    var g = (S.game.garden || []).slice(-5), N = g.length, baseY = 62; // % from top: the green hill band
    var xs = []; for (var i = 0; i < N; i++) xs.push(22 + (i * (56 / Math.max(1, N - 1 || 1))));
    if (N === 1) xs = [50];
    var newest = N - 1;
    g.forEach(function (seed, i) {
      var col = COLORS[(seed.t != null ? seed.t : i) % COLORS.length];
      var pip = add(ov, "div", "pc-pip"); pip.style.left = xs[i] + "%"; pip.style.top = (baseY + (i % 2 ? 4 : 0)) + "%"; pip.style.color = col;
      add(pip, "div", "pc-bulb").style.background = col;
      add(pip, "div", "pc-stem");
      add(pip, "div", "pc-soil");
    });
    // caption tethered to the newest pip
    var capX = xs[newest] != null ? xs[newest] : 50, capTop = baseY - 24;
    var tether = add(ov, "div", "pc-tether"); tether.style.left = capX + "%"; tether.style.top = capTop + "%"; tether.style.height = "22%";
    var cap = add(ov, "div", "pc-cap"); cap.style.left = capX + "%"; cap.style.top = capTop + "%";
    var dLabel = kd(todayK()).toLocaleDateString([], { day: "numeric", month: "long" }); // "12 июня" style; RU handled by locale
    cap.innerHTML = tr("planted") + " <b>" + esc(dLabel) + "</b> — " + esc(tr("the day you came back"));
    var foot = add(ov, "div", "pc-foot"); foot.innerHTML = '<i class="ti ti-seeding"></i> ' + tr("grown from a real day");
    ov.addEventListener("click", function (e) { if (e.target === foot || foot.contains(e.target)) { ov.remove(); } });
  }
```

> **Note on the caption text.** The canon reads `посажено 12 июня — день, когда ты вернулся`. Building it from `tr("planted")` + a locale date + `tr("the day you came back")` yields exactly `посажено <b>12 июня</b> — день, когда ты вернулся` once the I18N strings in §5 are added. `kd()` and `todayK()` are existing helpers; `esc()` guards the date string.

### 3b — Rewrite `binderSheet()` to the canon (tabs + evolution pips + trophy row)

The canon binder has **two tabs**: **МЕТКИ** (the six `BADGES` as evolution foil-cards) and **ТРОФЕИ** (one-shot milestone trophies). `BADGES` gives us the МЕТКИ cards directly. For ТРОФЕИ, add a tiny data table (no new state — computed from existing signals) and the **Король недели** locked card lives at the bottom-right of МЕТКИ (canon shows it there).

**Replace** the whole `binderSheet` function (`app.js:5584-5600`):
```javascript
  function binderSheet() { badgeTick();
    var ov = add(document.body, "div", "goal-ov"); ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var card = add(ov, "div", "goal-card");
    var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = '<i class="ti ti-cards"></i> ' + tr("Your marks");
    var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
    var grid = add(card, "div", "binder-grid");
    var earnedN = 0, totalN = 0;
    BADGES.forEach(function (b) { var v = 0; try { v = b.prog(); } catch (e) {} var r = badgeRank(b, v); totalN += b.ranks.length; earnedN += r;
      var c = add(grid, "div", "binder-card" + (r ? " " + elCardBG(b.el) : " locked"));
      if (r) add(c, "div", "mint-sheen");
      var ic = add(c, "div", "b-ic"); ic.innerHTML = '<i class="ti ' + b.ti + '"></i>';
      add(c, "div", "b-name", tr(b.name));
      add(c, "div", "b-rank", r ? "★".repeat(r) : "—");
      var nxt = b.ranks[r]; add(c, "div", "b-prog", nxt != null ? (v + " / " + nxt + " " + tr(b.unit)) : tr("complete"));
    });
    add(card, "div", "b-total", earnedN + " / " + totalN);
  }
```
with:
```javascript
  // ===== TROPHIES (canon game.jpg ТРОФЕИ tab): one-shot milestone trophies computed from existing state — no new schema. =====
  function binderTrophies() {
    var g = (S.game && S.game.garden) || [], acts = (S.sf && S.sf.actions) || {};
    var sessN = 0; Object.keys(acts).forEach(function (k) { sessN += (acts[k] || []).length; });
    var firstK = Object.keys(acts).sort()[0] || todayK();
    var out = [];
    out.push({ id: "firstgoal", ti: "ti-trophy", name: "First goal", have: g.length >= 1 || sessN >= 12,
      meta: (sessN || 12) + " " + tr("sessions") + " · " + kd(firstK).toLocaleDateString([], { day: "numeric", month: "long" }) });
    return out.filter(function (t) { return t.have; });
  }
  function binderSheet() { badgeTick();
    var ov = add(document.body, "div", "goal-ov"); ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
    var card = add(ov, "div", "goal-card");
    var head = add(card, "div", "goal-head"); var h = add(head, "div", "goal-q"); h.innerHTML = tr("Collection");
    var x = add(head, "button", "goal-x"); x.innerHTML = '<i class="ti ti-x"></i>'; x.onclick = function () { ov.remove(); };
    // count pill
    var earnedN = 0, totalN = 0;
    BADGES.forEach(function (b) { var v = 0; try { v = b.prog(); } catch (e) {} totalN += b.ranks.length; earnedN += badgeRank(b, v); });
    var pill = add(card, "div", "bnd-count"); pill.innerHTML = '<i class="ti ti-cards"></i> ' + earnedN + " / " + totalN + " " + tr("collected");
    // tabs
    var tabs = add(card, "div", "bnd-tabs");
    var tMarks = add(tabs, "div", "bnd-tab on", tr("MARKS"));
    var tTrophy = add(tabs, "div", "bnd-tab", tr("TROPHIES"));
    var body = add(card, "div", "bnd-body");
    function drawMarks() {
      body.innerHTML = ""; var grid = add(body, "div", "binder-grid"); grid.style.gridTemplateColumns = "1fr 1fr";
      BADGES.forEach(function (b) { var v = 0; try { v = b.prog(); } catch (e) {} var r = badgeRank(b, v);
        var c = add(grid, "div", "binder-card" + (r ? " " + elCardBG(b.el) : " locked"));
        if (r) add(c, "div", "mint-sheen");
        var disc = add(c, "div", "b-disc"); disc.style.color = r ? "#ffd24a" : "#8a5cf0"; disc.innerHTML = '<i class="ti ' + b.ti + '"></i>';
        add(c, "div", "b-name", tr(b.name));
        add(c, "div", "b-sub", tr(b.flavorTag || b.unit));   // small caps subtitle (e.g. "ПРИЗМА · СИЯЮЩИЙ")
        // evolution pips: one per rank tier, filled up to current rank
        var evo = add(c, "div", "evo-row");
        b.ranks.forEach(function (_, i) { add(evo, "div", "evo-pip" + (i < r ? " on" : "")); });
      });
      // locked "Король недели" mirror-card (canon bottom-right): a NEW aspirational badge with a pink progress bar
      var need = 3, have = Math.min(need, ((S.game && S.game.streak) || 0)); // "ещё 3 идеальных дня"
      var lc = add(grid, "div", "binder-card locked");
      var ld = add(lc, "div", "b-disc"); ld.style.color = "#8a5cf0"; ld.innerHTML = '<i class="ti ti-crown"></i>';
      add(lc, "div", "b-name", tr("King of the week"));
      add(lc, "div", "b-lockmsg", (need - have) + " " + tr("more perfect days"));
      var bar = add(lc, "div", "b-bar"); add(bar, "i").style.width = Math.round(have / need * 100) + "%";
      var evo = add(lc, "div", "evo-row"); for (var i = 0; i < 4; i++) add(evo, "div", "evo-pip" + (i < have ? " on" : ""));
    }
    function drawTrophies() {
      body.innerHTML = ""; add(body, "div", "bnd-trhead", tr("TROPHIES"));
      var tr2 = binderTrophies();
      if (!tr2.length) { add(body, "div", "b-lockmsg", tr("no trophies yet — keep going")).style.textAlign = "center"; return; }
      tr2.forEach(function (t) {
        var row = add(body, "div", "bnd-trophy"); var inr = add(row, "div", "tr-in");
        var ic = add(inr, "div", "tr-ic"); ic.innerHTML = '<i class="ti ' + t.ti + '"></i>';
        var bd = add(inr, "div", "tr-body"); add(bd, "div", "tr-name", tr(t.name)); add(bd, "div", "tr-meta", t.meta);
      });
    }
    function sel(which) { tMarks.classList.toggle("on", which === "m"); tTrophy.classList.toggle("on", which === "t"); if (which === "m") drawMarks(); else drawTrophies(); }
    tMarks.onclick = function () { sel("m"); }; tTrophy.onclick = function () { sel("t"); };
    sel("m");
  }
```

> **Small-caps subtitle.** The canon shows each foil card with a two-word caps subtitle (`ПРИЗМА · СИЯЮЩИЙ`, `ВСПЫШКА`, `КОСМОС`). Add an optional `flavorTag` to each `BADGES` entry (`app.js:5523-5528`). It's purely cosmetic — falls back to `b.unit` if absent. Add these keys inline:
> - `return`  → `flavorTag: "prism · shining"`
> - `streak`  → `name` stays `"Fire"` but canon shows **21 подряд**; leave the name, add `flavorTag: "flash"`
> - `depth`   → `flavorTag: "cosmos"`
> - `align`   → `flavorTag: "lattice"`
> - `courage` → `flavorTag: "edge"`
> - `garden`  → `flavorTag: "bloom"`
>
> Their RU values are in §5. Editing `BADGES` is additive (new optional field), safe.

---

## 4. WIRING

Nothing new to wire into nav. Both surfaces are reached exactly as today:
- **Ceremony** fires automatically at the end of a successful `plantGarden()` (the "Plant in your world · N Spark" button in `renderGame()`, `app.js:5609`). No new button.
- **Binder** opens from the existing "Your marks — the collection" button (`app.js:5608`, `bb2.onclick = binderSheet`). Consider updating that button label to `tr("Collection")` for consistency with the new header — optional, cosmetic.
- Both overlays are self-dismissing on backdrop tap (ceremony also dismisses on the footer chip). No focus-trap / scroll-lock changes needed — they reuse the `.goal-ov` z-index band (`.pc-ov` is z-80, above `.goal-ov` z-71, so the ceremony can safely sit above an open pane).

---

## 5. I18N — every NEW English string → RU (add to `I18N.ru`)

**Anchor:** the badge-strings block at `app.js:1331-1340` already has the badge names + units. **Insert** these into the same `Object.assign(I18N.ru, { … })` object (or the adjacent one ending near `app.js:1340`):

```javascript
    // GAME ceremony + binder canon
    "Collection": "Коллекция",
    "collected": "собрано",
    "MARKS": "МЕТКИ",
    "TROPHIES": "ТРОФЕИ",
    "planted": "посажено",                              // (already present at app.js:1338 as a unit — reuse; keep one copy)
    "the day you came back": "день, когда ты вернулся",
    "grown from a real day": "выросло из настоящего дня",
    "King of the week": "Король недели",
    "more perfect days": "идеальных дня",               // renders as "ещё 3 идеальных дня" via the count prefix (see note)
    "sessions": "сессий",
    "First goal": "Первая цель",
    "no trophies yet — keep going": "трофеев пока нет — продолжай",
    // foil-card caps subtitles
    "prism · shining": "призма · сияющий",
    "flash": "вспышка",
    "cosmos": "космос",
    "lattice": "решётка",
    "edge": "грань",
    "bloom": "цвет"
```

> **"ещё 3 идеальных дня".** The render builds `(need - have) + " " + tr("more perfect days")` → `3 идеальных дня`. To match the canon's leading **ещё**, either (a) prepend `tr("still")`→`"ещё"` in the render, or (b) set the RU value to `"идеальных дня"` and accept `3 идеальных дня`. **Recommended:** change the render line to `tr("still") + " " + (need - have) + " " + tr("more perfect days")` and add `"still": "ещё"`. This is the only spot where word order matters.

`"planted"` already exists in the dict (`app.js:1338`) — do **not** add a duplicate key; the ceremony reuses it.

---

## 6. REGRESSION RISKS

- **Duplicate I18N key `"planted"`.** It's already at `app.js:1338`. Adding it again in a second `Object.assign` silently overrides — same value, so harmless, but drop the duplicate to keep the dict clean.
- **`binderSheet()` rewrite** changes the DOM the badge cards render into (`.b-disc` ring replaces the bare `.b-ic`; `.evo-row` pips replace `.b-rank` stars). Nothing else references `.b-ic`/`.b-rank` inside the binder except CSS — the old `.b-ic`/`.b-rank`/`.b-prog` rules (`index.html:1024-1028`) stay valid and are simply unused by the new render (safe; leave them). `mintCard` still uses `.mint-ic`/`.mint-name` (unchanged) — untouched.
- **`elCardBG(b.el)` foil backgrounds** are reused as-is (`el-prism` etc., `index.html:1010-1015`); the new `.b-disc` sits on top with `z-index:3`, above `.mint-sheen` (z-2). Confirmed no clash.
- **Ceremony over an open sheet.** `.pc-ov` z-80 > `.goal-ov` z-71 > panes. If a user somehow triggers plant while a sheet is open it layers correctly. `plantGarden()` is only reachable from `renderGame()`'s button, which is on the Game pane (no sheet open), so this is defensive only.
- **`kd()` / `todayK()` / `S.sf.actions` / `S.game.garden`** are all existing reads. `binderTrophies()` writes nothing. No `SCHEMA` bump needed — **no state shape changes** in this spec (ceremony reads `S.game.garden`; trophies read `S.sf.actions` — both already exist).
- **Safe/additive path:** if any concern, gate `plantCeremony()` behind `try{…}catch(e){}` (already how `plantGarden` calls `sfx`) so a ceremony error can never block the actual plant (state is saved *before* the ceremony call).
- **DEVICE-UNTESTED:** the ceremony's absolute-percent pip layout and the moon-glow gradient must be eyeballed on David's iPhone — the radial hill/water dome math is viewport-ratio sensitive. Preview proves it boots + renders; **gesture/scale feel and exact scene proportions are device-untested — confirm on phone.**

---

## 7. FIDELITY CHECKLIST (vs `game.jpg`)

- **Fonts:** all UI/labels **Jost 700/800** (`"Jost",sans-serif; font-weight:800`) — headings 800, subtitles 800 caps, meta 700. No thin/mono anywhere. ✓
- **Scene sky→hill→water:** night plum sky `#1a0a24→#34123f`, green hill dome `#1f6a3a`, blue water dome `#0e3a6e` — stacked radial+linear as one paint. ✓ (canon: plum top, green mid, blue bottom)
- **Moon:** pink-white radial `#fff→#ffe9f4→#f6b8dd` with a soft `rgba(255,210,236,.32)` glow, upper-right. ✓
- **Stars:** small white 3px dots, twinkling, scattered upper sky. ✓
- **Seed pips:** bright bulb (blue `#36b3f0` / pink `#ff5fa0` / green `#46e2a4` — locked palette) on a thin light stem in a dark soil dimple. ✓ (canon shows blue, pink, green pips + a faint 4th)
- **Caption card:** berry `rgba(60,14,42,.92)`, **pink ink-adjacent border `#ff6fb0`**, hard `0 5px 0 #160510` shadow, tethered by a thin pink line to a pip; the **date span glows pink** (`.pc-cap b`). ✓
- **Bottom chip:** `выросло из настоящего дня` with a pink `ti-seeding` icon, chunky berry chip with hard `0 5px 0 #160510` shadow. ✓ (Tabler icon, NOT emoji)
- **Binder count pill:** gold-outlined ink pill `#160510` / border `#ffd24a`, `ti-cards` glyph, `12 / 24 собрано`. ✓
- **Tabs:** МЕТКИ active = **pink diagonal-stripe fill** (`repeating-linear-gradient 115deg #ff6fb0/#ff8fc4`) with dark ink text; ТРОФЕИ inactive = muted `#241328` chip. Both chunky with `0 4px 0 #160510`. ✓
- **Foil cards:** reuse `el-prism` (HOLO rainbow + `mint-sheen` animated sweep), `el-burst` (SUNBURST radial `#3a0e02`, gold border `#ffb02e`), `el-cosmos` (deep-space radial, `#8ac8e8` border). Icon in a ringed disc. ✓
- **Evolution pips:** square 11px chips, filled = **gold `#ffd24a`** with glow, empty = inked hollow; locked card pips = **pink `#ff5fa0`**. ✓ (canon: HOLO ▪▪▫▫, SUNBURST ▪▪▪▫, COSMOS ▪▪▫▫)
- **Locked "Король недели":** dimmed `#241328` card, `ti-crown` in a muted disc, `ещё 3 идеальных дня`, a **pink progress bar** + 4 pink pips. ✓
- **ТРОФЕИ row:** gold-edge frame (`linear-gradient #ffd24a→#c08a22` border via 3px padding trick), dark inner `#3a2a08`, `ti-trophy` gold glyph, `Первая цель` / `12 сессий · 28 июня`. ✓
- **Icons:** every glyph is `ti ti-*` (ti-seeding, ti-cards, ti-crown, ti-trophy, plus badge `ti`s). **Zero emoji.** ✓
- **Russian:** all strings spelled out per canon — `Коллекция`, `собрано`, `МЕТКИ`, `ТРОФЕИ`, `посажено … — день, когда ты вернулся`, `выросло из настоящего дня`, `Король недели`, `ещё 3 идеальных дня`, `Первая цель`, `12 сессий`. ✓
