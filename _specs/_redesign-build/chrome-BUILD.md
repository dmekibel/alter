# CHROME — 1:1 BUILD SPEC (verdict #21)

Canon: `_specs/_epic-mockups/_widget-refs/chrome.jpg` + `_specs/_epic-mockups/_widget-refs/chrome-bento.jpg`
Three pieces, buildable independently — integrate + screenshot-verify one at a time:
- **A. THE YOU-TAB «Ты»** — trainer card + four rooms + away-mode row + vault pips + ghost «Продвинутое».
- **B. THE COMPASS NAV** — 3-dot pill that blooms on touch into Планер / Путь / Игра and auto-folds ~2.5s.
- **C. THE BENTO AT REST + PICK IGNITION** — search collapses to a bare icon, soft muted domain tiles (already 95% there), peek-cut rows, and the 220ms own-color ignition on pick while the room fades.

---

## 1. SUMMARY — what these are + how they're reached today

**The You / config surface today.** There is no dedicated «Ты» screen. The config/rare items live in `settingsSheet()` ([app.js:2952](app.js:2952)) — a `#sheet` modal with four "rooms" (`room()` headers PROFILE / SOUND / DATA / ADVANCED) and `row()` buttons (Goals, Guidance, Language, Away, Sound, Send snapshot, Your marks, Brain, Redo setup, Test day). It is opened from the planner `⋯` menu row `item("", "ti-settings", "Settings", …)` ([app.js:2948](app.js:2948)). The widget «Ты» is the **redesigned settingsSheet** — same rooms, same rows, but presented as the trainer card + four chunky room chips + away held-state row + vault pips + ghost advanced door. Piece A **replaces the body of `settingsSheet()`** — the door that opens it is unchanged.

**The nav today.** `#nav` ([index.html:1875](index.html:1875)) is a fixed 3-tab bar: `.nb[data-tab="day"]` (Планер), `#navJourney` (Путь — the home tab), `.nb[data-tab="self"]` (Игра). Wired at [app.js:8635](app.js:8635) / [app.js:8636](app.js:8636). The journey + game panes carry their own twins `.jp-nav`/`#gameNav` ([index.html:201](index.html:201), [index.html:1889](index.html:1889)) that are visually unified with `#nav`. Piece B **wraps `#nav` in a collapsed "compass pill"** that blooms the existing three buttons on touch and auto-folds — a pure CSS/JS shell over the existing bar; the three buttons and all their handlers are untouched.

**The bento today.** `bentoPicker(opts)` ([app.js:6525](app.js:6525)) is the activity picker used by ~15 call-sites. Its search is a sticky input row `.bento-search` appended **below** the categories ([app.js:6564](app.js:6564), [app.js:6583](app.js:6583)); soft muted tiles already exist via the `soft` path in `actChip()` ([app.js:6550](app.js:6550)); category rows already scroll sideways with no truncation ([app.js:6579](app.js:6579)). Piece C is the **smallest** of the three: collapse the search to a bare head icon that expands on tap, add a hard peek-cut shadow to the scroll rows, and add the 220ms ignition animation on pick.

---

## 2. CSS — add to index.html

### A. You-tab «Ты» — trainer card, rooms, away row, vault pips, ghost door

**Insert after: `  #nav .nb:active{ transform:scale(.92); }`** (index.html:1559)

```css
  /* ============ «ТЫ» — the trainer/You surface (chrome widget #21) ============ */
  /* Rendered into #sheetBody by settingsSheet(). Chunky game-piece language: ink borders #160510, hard shadows, Jost. */
  .you-wrap{ display:flex; flex-direction:column; gap:12px; padding:2px 0 4px; }
  /* --- Trainer card: pink domain card, earned-GOLD facts + diagonal sheen + evolution progress --- */
  .you-trainer{ position:relative; overflow:hidden; border:3px solid #160510; border-radius:20px;
    background:linear-gradient(150deg,#4a0f2c,#2c081a 70%); box-shadow:0 6px 0 #160510; padding:16px 16px 14px; }
  .you-trainer::before{ content:""; position:absolute; inset:0; pointer-events:none;
    background:linear-gradient(120deg,transparent 38%,rgba(255,255,255,.10) 50%,transparent 62%); } /* the sheen */
  .you-tr-top{ display:flex; align-items:center; gap:13px; }
  .you-tr-badge{ width:52px; height:52px; flex:none; border-radius:15px; border:3px solid #160510;
    background:#ff5fa0; color:#4a1126; display:flex; align-items:center; justify-content:center; font-size:26px; box-shadow:0 3px 0 #160510; }
  .you-tr-name{ font-family:"Jost",sans-serif; font-weight:800; font-size:26px; color:#fff; line-height:1; letter-spacing:.2px; }
  .you-tr-facts{ font-family:"Jost",sans-serif; font-weight:800; font-size:13px; letter-spacing:1px;
    text-transform:uppercase; color:#ffc41f; margin-top:8px; text-shadow:0 1px 0 rgba(0,0,0,.35); } /* earned-GOLD facts */
  .you-tr-div{ height:2px; background:linear-gradient(90deg,transparent,#ff5fa0,transparent); opacity:.5; margin:12px 0 10px; border-radius:2px; }
  .you-tr-evrow{ display:flex; align-items:baseline; justify-content:space-between; font-family:"Jost",sans-serif; font-weight:700; }
  .you-tr-evlbl{ font-size:12.5px; color:#e8b8d2; }
  .you-tr-evleft{ font-size:12.5px; color:#ffd0e6; font-weight:800; }
  .you-tr-bar{ height:7px; border-radius:5px; background:rgba(255,255,255,.10); margin-top:8px; overflow:hidden; border:1px solid #160510; }
  .you-tr-fill{ height:100%; border-radius:5px; background:linear-gradient(90deg,#ff7ab0,#ff5fa0); box-shadow:0 0 8px rgba(255,95,160,.5); transition:width .5s var(--ease-settle); }
  /* --- Room chips: chunky solid rows, ink border + hard shadow, colored line-icon + title + sub --- */
  .you-room{ display:flex; align-items:center; gap:14px; width:100%; text-align:left; cursor:pointer;
    border:3px solid #160510; border-radius:18px; background:#2c081a; box-shadow:0 4px 0 #160510;
    padding:14px 15px; font-family:"Jost",sans-serif; color:#fff; transition:transform .08s,box-shadow .08s; }
  .you-room:active{ transform:translateY(3px); box-shadow:0 1px 0 #160510; }
  .you-room > i.you-rico{ font-size:23px; flex:none; }
  .you-room .you-rtx{ flex:1 1 auto; min-width:0; display:flex; flex-direction:column; gap:2px; }
  .you-room .you-rt{ font-weight:800; font-size:17px; line-height:1.05; }
  .you-room .you-rs{ font-weight:600; font-size:12.5px; color:#c98aa8; }
  .you-room .you-rchev{ font-size:18px; color:#7a4a68; flex:none; }
  .you-room .you-rpips{ display:flex; gap:5px; flex:none; align-items:center; } /* vault pips (Data room) */
  .you-room .you-rpip{ width:16px; height:6px; border-radius:3px; background:#5a2a48; }
  .you-room .you-rpip.on{ background:#34d39a; box-shadow:0 0 6px rgba(52,211,154,.5); }
  /* --- Away held-state row: teal striped, "held" look, with a chunky toggle --- */
  .you-away{ display:flex; align-items:center; gap:13px; border:3px solid #160510; border-radius:18px;
    background:#2ab8c4; box-shadow:0 4px 0 #160510; padding:13px 15px; overflow:hidden; position:relative; cursor:pointer; }
  .you-away::before{ content:""; position:absolute; inset:0; pointer-events:none;
    background:repeating-linear-gradient(135deg, rgba(255,255,255,.16) 0 10px, transparent 10px 20px); } /* the held stripes */
  .you-away > i.you-awico{ font-size:22px; color:#06343a; flex:none; position:relative; }
  .you-away .you-awtx{ flex:1 1 auto; min-width:0; position:relative; font-family:"Jost",sans-serif; color:#06343a; }
  .you-away .you-awt{ font-weight:800; font-size:16px; line-height:1.1; }
  .you-away .you-aws{ font-weight:700; font-size:12px; opacity:.85; }
  .you-away.off{ background:#241b28; box-shadow:0 4px 0 #160510; } /* not-away = calm dark, no stripes */
  .you-away.off::before{ opacity:0; }
  .you-away.off .you-awico, .you-away.off .you-awtx{ color:#c98aa8; }
  .you-toggle{ width:52px; height:30px; border-radius:16px; border:2px solid #160510; background:rgba(6,52,58,.35);
    flex:none; position:relative; transition:background .15s; }
  .you-toggle .you-knob{ position:absolute; top:2px; left:2px; width:24px; height:24px; border-radius:50%;
    background:#fff; box-shadow:0 2px 0 rgba(0,0,0,.3); transition:left .18s var(--ease-spring); }
  .you-away.off .you-toggle{ background:#160510; }
  .you-away.off .you-toggle .you-knob{ left:2px; }
  .you-away:not(.off) .you-toggle .you-knob{ left:24px; }
  /* --- Ghost dashed advanced door --- */
  .you-adv{ display:flex; align-items:center; gap:13px; width:100%; text-align:left; cursor:pointer;
    border:2px dashed #7a4a68; border-radius:18px; background:transparent; padding:14px 15px;
    font-family:"Jost",sans-serif; color:#c98aa8; font-weight:700; font-size:16px; transition:transform .08s; }
  .you-adv:active{ transform:scale(.98); }
  .you-adv > i:first-child{ font-size:21px; flex:none; }
  .you-adv .you-advlbl{ flex:1 1 auto; }
  .you-adv .you-advchev{ font-size:18px; transition:transform .2s; }
  .you-adv.open .you-advchev{ transform:rotate(180deg); }
```

### B. Compass nav — collapsed 3-dot pill that blooms

**Insert after: the block you just added (end of the `.you-adv` rules).**

The strategy is **additive over `#nav`**: a `body.compass` class collapses `#nav` to a centered pill showing the active tab's icon + a 3-dot glyph (via a `#compassDots` element we inject once). Touching it removes `body.compass` (blooms to the full bar); a 2.5s timer re-adds it. This reuses ALL existing tab styling for the bloomed state — we only style the *collapsed* state.

```css
  /* ============ COMPASS NAV — 3-dot pill blooms into Планер/Путь/Игра, auto-folds 2.5s (chrome widget #21) ============ */
  /* Bloomed = the normal #nav bar (existing styles). Collapsed = body.compass: centered pill + 3-dot hint. */
  #compassDots{ display:none; }
  body.compass #nav, body.compass.gaming #gameNav, body.compass.journey-open #jpNav{
    left:50% !important; right:auto !important; transform:translateX(-50%);
    width:auto !important; bottom:max(10px,calc(env(safe-area-inset-bottom,0px) + 4px)) !important;
    border:3px solid #160510 !important; border-radius:22px !important; padding:0 !important; gap:0 !important;
    justify-content:center !important; box-shadow:0 5px 0 #160510,0 10px 26px rgba(0,0,0,.5) !important;
    transition:width .26s var(--ease-spring),left .26s var(--ease-spring),border-radius .22s; }
  /* hide every real tab button while collapsed; show only the injected pill face */
  body.compass #nav .nb, body.compass.gaming #gameNav .jpn, body.compass.journey-open #jpNav .jpn{
    max-width:0 !important; min-width:0 !important; flex:0 0 0 !important; opacity:0 !important;
    padding:0 !important; pointer-events:none !important; overflow:hidden; transition:max-width .2s,opacity .16s; }
  body.compass #compassDots{ display:flex !important; align-items:center; gap:9px; padding:11px 18px; cursor:pointer;
    font-family:"Jost",sans-serif; }
  body.compass #compassDots .cd-ic{ font-size:22px; color:#ff5fa0; line-height:1;
    filter:drop-shadow(0 0 7px rgba(255,95,160,.45)); }
  body.compass #compassDots .cd-dot{ width:6px; height:6px; border-radius:50%; background:#9a6a86; }
  /* while NOT collapsed the injected face is hidden; the real buttons show (default) */
  #compassDots.cd-anchored{ position:static; }
```

Note: `#compassDots` is injected as the **first child of `#nav`** (see WIRING). When bloomed, `body.compass` is absent → `#compassDots{display:none}` and the real `.nb` buttons render normally. No change to the bloomed bar.

### C. Bento at rest + pick ignition

**Insert after: `  .bento-x{ … }`** (index.html:841)

```css
  /* Bento head search: collapses to a bare icon; taps to expand into the existing sticky input (chrome-bento widget) */
  .bento-headsearch{ width:32px; height:32px; border-radius:10px; background:#48122f; border:2px solid #160510;
    color:#ffd0e6; font-size:15px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex:none; margin-left:8px; }
  .bento-headsearch:active{ transform:scale(.92); }
  /* Peek-cut rows: a hard right-edge shadow so the half-cut chip reads as a scroll hint */
  .bento-cat .bento-chips{ position:relative; }
  .bento-catwrap{ position:relative; }
  .bento-catwrap::after{ content:""; position:absolute; top:0; right:0; bottom:6px; width:26px; pointer-events:none;
    background:linear-gradient(90deg,transparent,rgba(22,5,16,.9)); border-radius:0 13px 13px 0; }
  /* THE PICK IGNITION: 220ms own-color flare on the chosen chip while the room fades */
  @keyframes bentoIgnite{ 0%{ transform:scale(1); } 45%{ transform:scale(1.06); filter:brightness(1.35); } 100%{ transform:scale(1); filter:brightness(1); } }
  .bchip.igniting{ animation:bentoIgnite .22s var(--ease-spring) both; z-index:2; box-shadow:0 0 0 3px #ffc41f, 0 6px 18px rgba(255,196,31,.4); }
  .bento-card.room-fading .bento-body{ transition:opacity .22s ease; opacity:.25; }
  .bento-card.room-fading .bchip.igniting{ opacity:1; }
```

---

## 3. RENDER JS — app.js changes

### A. Replace `settingsSheet()` body with the «Ты» layout

Add a one-time install-date stamp (guarded, **no SCHEMA bump** — matches the `S.mood`/`S.acts`/`S.guide` precedent) so the trainer facts have a real "since" + "hours lived". **Insert this helper immediately before `function settingsSheet() {`** (app.js:2952):

```javascript
  // ===== «ТЫ» trainer stats (chrome widget #21). No SCHEMA bump — S.installK is stamped once, guarded, like S.mood/S.acts. =====
  function youStats() {
    if (!S.installK) { S.installK = todayK(); save(); }
    var days = Math.max(0, daysSinceK(S.installK)) + 1;
    // "hours lived with the app" = a warm proxy: waking hours since install (16/day), floored.
    var hours = Math.round(days * 16);
    // rank = evolution tier by hours lived; next tier every ~250h (I=0, II≥250, III≥500 …). Roman numeral.
    var TIERS = [0, 250, 500, 900, 1500, 2400], rank = 1; for (var i = 0; i < TIERS.length; i++) if (hours >= TIERS[i]) rank = i + 1;
    var nextAt = TIERS[rank] || (TIERS[TIERS.length - 1] + 900), leftH = Math.max(0, nextAt - hours);
    var prevAt = TIERS[rank - 1] || 0, pct = Math.max(4, Math.min(100, Math.round((hours - prevAt) / (nextAt - prevAt) * 100)));
    var ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];
    var since = kd(S.installK).toLocaleDateString([], { day: "numeric", month: "long" }); // "12 мая" via the ru display layer
    return { days: days, hours: hours, rank: ROMAN[rank] || rank, nextRank: ROMAN[rank + 1] || (rank + 1), leftH: leftH, pct: pct, since: since };
  }
```

**Then replace the whole `settingsSheet()` function** (app.js:2952–2979) with:

```javascript
  // ===== «ТЫ» — the trainer/You surface (chrome widget #21). Same rooms + rows as the old settingsSheet, re-dressed as the trainer card + chunky rooms + away held-state row + vault pips + ghost advanced door. Each row still opens its existing flow. =====
  function settingsSheet() {
    var B = el("sheetBody"); B.innerHTML = ""; openSheet();
    add(B, "div", "sttl", tr("You"));
    var wrap = add(B, "div", "you-wrap");

    // --- Trainer card ---
    var st = youStats();
    var tc = add(wrap, "div", "you-trainer");
    var top = add(tc, "div", "you-tr-top");
    add(top, "div", "you-tr-badge").innerHTML = '<i class="ti ti-compass"></i>';
    var nm = add(top, "div"); add(nm, "div", "you-tr-name", tr("Explorer")); // rank/title — "Исследователь"
    add(tc, "div", "you-tr-facts", tr("since") + " " + st.since + " · " + st.hours + " " + tr("h lived"));
    add(tc, "div", "you-tr-div");
    var ev = add(tc, "div", "you-tr-evrow");
    add(ev, "span", "you-tr-evlbl", tr("next evolution") + " — " + tr("rank") + " " + st.nextRank);
    add(ev, "span", "you-tr-evleft", tr("another") + " " + st.leftH + " " + tr("h"));
    var bar = add(tc, "div", "you-tr-bar"); add(bar, "div", "you-tr-fill").style.width = st.pct + "%";

    // --- Rooms (were settingsSheet room()/row() — same targets) ---
    function room(ic, color, title, sub, fn, pips) {
      var b = add(wrap, "button", "you-room");
      var i = add(b, "i", "ti " + ic + " you-rico"); i.style.color = color;
      var tx = add(b, "span", "you-rtx"); add(tx, "span", "you-rt", tr(title)); add(tx, "span", "you-rs", sub);
      if (pips != null) { var pp = add(b, "span", "you-rpips"); for (var n = 0; n < pips.total; n++) add(pp, "span", "you-rpip" + (n < pips.on ? " on" : "")); }
      else add(b, "i", "ti ti-chevron-right you-rchev");
      b.onclick = function () { closeSheet(); setTimeout(fn, 60); };
    }
    // ПРОФИЛЬ · слово · подъём · язык  (Goals + Guidance + Language behind one door)
    room("ti-user", DOM.connect.c, "Profile", tr("word") + " · " + tr("wake-up") + " " + ((S.profile && S.profile.wake) || "7:30") + " · " + tr("language"), function () { try { goalsSheet(); } catch (e) {} });
    // ЗВУК · голос · фоны · награды
    room("ti-volume", DOM.move.c, "Sound", tr("voice") + " · " + tr("beds") + " · " + tr("rewards"), function () { openVolumePanel(); });
    // ДАННЫЕ · снимок · N дней назад — with vault pips (how many days of data)
    var snapAgo = S.lastSnapK ? daysSinceK(S.lastSnapK) : 12;
    var vaultOn = Math.min(4, Math.max(1, Math.round(st.days / 3)));
    room("ti-shield-check", DOM.nourish.c, "Data", tr("snapshot") + " · " + snapAgo + " " + tr("days ago"), function () { shareSnapshot(); S.lastSnapK = todayK(); save(); }, { total: 4, on: vaultOn });

    // --- Away held-state row (was the Away row) ---
    var aw = add(wrap, "div", "you-away" + (S.away ? "" : " off"));
    aw.innerHTML = '<i class="ti ' + (S.away ? "ti-moon" : "ti-moon") + ' you-awico"></i>' +
      '<span class="you-awtx"><span class="you-awt">' + esc(S.away ? tr("I'm resting") : tr("Rest mode")) + '</span>' +
      '<span class="you-aws">' + esc(S.away ? tr("paused — streaks are held") : tr("travel or off-days — streaks held")) + '</span></span>' +
      '<span class="you-toggle"><span class="you-knob"></span></span>';
    aw.onclick = function () {
      S.away = !S.away; S.awaySince = S.away ? todayK() : null; save();
      toast(S.away ? tr("Resting — your streaks are held") : tr("welcome back — let's ease in"));
      try { if (document.body.classList.contains("journey-open")) drawJourney(true); } catch (e) {}
      settingsSheet(); // re-render the toggle state in place
    };

    // --- Ghost dashed advanced door (Brain / Redo setup / Test day / Voice debug) ---
    var adv = add(wrap, "button", "you-adv");
    adv.innerHTML = '<i class="ti ti-flask"></i><span class="you-advlbl">' + tr("Advanced") + '</span><i class="ti ti-chevron-down you-advchev"></i>';
    var advBox = add(wrap, "div"); advBox.style.cssText = "display:none;flex-direction:column;gap:8px;";
    function advRow(ic, color, title, sub, fn) {
      var b = add(advBox, "button", "you-room");
      var i = add(b, "i", "ti " + ic + " you-rico"); i.style.color = color;
      var tx = add(b, "span", "you-rtx"); add(tx, "span", "you-rt", tr(title)); add(tx, "span", "you-rs", tr(sub));
      add(b, "i", "ti ti-chevron-right you-rchev");
      b.onclick = function () { closeSheet(); setTimeout(fn, 60); };
    }
    if (devOn() || (S.badges && Object.keys(S.badges.earned || {}).length)) advRow("ti-cards", DOM.play.c, "Your marks", "the collection — cards you've earned", function () { binderSheet(); });
    if (devOn()) advRow("ti-brain", DOM.focus.c, "Brain", "AI tailoring — bring your own key", function () { brainSheet(); });
    if (devOn()) advRow("ti-sparkles", DOM.create.c, "Redo setup", "re-run onboarding", function () { onboard(); });
    if (devOn()) advRow("ti-flask", DOM.restore.c, "Test day", "fill a demo day (dev)", function () { fillTestDay(); });
    adv.onclick = function () { var open = advBox.style.display !== "none"; advBox.style.display = open ? "none" : "flex"; adv.classList.toggle("open", !open); };

    add(B, "button", "done2", tr("Done")).onclick = closeSheet;
  }
```

> Note: the old `settingsSheet` used `room()` as a *header label* and `row()` as a button; the redesign folds Goals+Guidance+Language into the **Profile** room and Marks/Brain/Redo/Test into **Advanced**, matching the widget's four visible rooms + ghost door. If David wants Guidance and Language as their own rooms rather than folded, split them out — but the widget shows exactly: Профиль / Звук / Данные / (away) / Продвинутое.

### B. Compass nav — inject the pill face + fold/bloom logic

**Insert after: `el("planToday").onclick = …` line ends** — i.e. **immediately after [app.js:8603](app.js:8603)** (inside the same wiring block, before the `#nav .nb` handler at 8635). Actually anchor it right before the nav-button wiring for clarity. **Insert after: `  function goTab(t) { … }`** (the line ending `renderToday(); } }` at app.js:5333):

```javascript
  // ===== COMPASS NAV (chrome widget #21): the bottom bar rests as a 3-dot pill and blooms on touch, auto-folding after ~2.5s. Pure shell over #nav — the three real buttons + their handlers are untouched. =====
  var _compassFoldT = null;
  function compassFace() {
    var nav = el("nav"); if (!nav) return null;
    var f = el("compassDots");
    if (!f) { f = add(nav, "div"); f.id = "compassDots"; nav.insertBefore(f, nav.firstChild); }
    // active-tab icon: Планер (day) / Путь (journey) / Игра (game)
    var b = document.body.classList, ic = b.contains("gaming") ? "ti-device-gamepad-2" : b.contains("journey-open") ? "ti-route" : "ti-calendar-month";
    f.innerHTML = '<i class="ti ' + ic + ' cd-ic"></i><span class="cd-dot"></span><span class="cd-dot"></span>';
    f.onclick = function (e) { e.stopPropagation(); compassBloom(); };
    return f;
  }
  function compassFold() { compassFace(); document.body.classList.add("compass"); if (_compassFoldT) { clearTimeout(_compassFoldT); _compassFoldT = null; } }
  function compassBloom() {
    document.body.classList.remove("compass");
    if (_compassFoldT) clearTimeout(_compassFoldT);
    _compassFoldT = setTimeout(compassFold, 2500); // auto-fold ~2.5s after it opens
  }
  function compassInit() { compassFace(); document.body.classList.add("compass"); } // rest state = folded
```

Then **call `compassInit()` once at boot** and **re-fold after any tab change**. See WIRING.

### C. Bento — head search icon, peek-cut wrapper, pick ignition

Three surgical edits inside `bentoPicker()`:

**C1 — Head search icon.** After the title is appended, add a bare search icon into the head. **Replace** [app.js:6537–6538](app.js:6537):
```javascript
    add(head, "div", "bento-q", opts.title || "What are you doing?");
    var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>';
```
**with:**
```javascript
    add(head, "div", "bento-q", opts.title || "What are you doing?");
    var _hsearch = add(head, "button", "bento-headsearch"); _hsearch.innerHTML = '<i class="ti ti-search"></i>'; // bare search icon (chrome-bento); taps to reveal the sticky input
    var xb = add(head, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>';
```
Then in `renderScoped()`, the sticky `sb` search is built detached and appended at the end ([app.js:6564](app.js:6564), [app.js:6583](app.js:6583)). Start it **collapsed** and let the head icon reveal + focus it. **Replace** [app.js:6583](app.js:6583):
```javascript
      body.appendChild(results); body.appendChild(sb); // results + search BELOW the categories (David 2026-07-01)
```
**with:**
```javascript
      sb.style.display = "none"; body.appendChild(results); body.appendChild(sb); // search hidden at rest — the head icon reveals it (chrome-bento)
      _hsearch.onclick = function () { var open = sb.style.display !== "none"; sb.style.display = open ? "none" : "flex"; if (!open) { sb.scrollIntoView({ block: "nearest" }); setTimeout(function () { try { si.focus(); } catch (e) {} }, 40); } else { searchQ = ""; si.value = ""; drawResults(""); } };
```
(`si` and `drawResults` are already in scope inside `renderScoped`.)

**C2 — Peek-cut hint.** Wrap the per-category horizontal chip row so the `::after` fade lands on the right edge. **Replace** [app.js:6579–6580](app.js:6579):
```javascript
        var wrap = add(mc, "div", "bento-chips"); wrap.style.cssText = "display:flex;flex-wrap:nowrap;overflow-x:auto;gap:8px;-webkit-overflow-scrolling:touch;padding-bottom:3px;touch-action:pan-x;"; // FULL list per category, scroll SIDEWAYS — no +N truncation, no per-item + (David 2026-07-01)
        acts.forEach(function (a) { var c = actChip(a, wrap, false); c.style.flex = "0 0 auto"; c.style.whiteSpace = "nowrap"; });
```
**with:**
```javascript
        var cwrap = add(mc, "div", "bento-catwrap");
        var wrap = add(cwrap, "div", "bento-chips"); wrap.style.cssText = "display:flex;flex-wrap:nowrap;overflow-x:auto;gap:8px;-webkit-overflow-scrolling:touch;padding-bottom:3px;touch-action:pan-x;"; // FULL list per category, scroll SIDEWAYS — no +N truncation (David 2026-07-01); peek-cut fade via .bento-catwrap::after
        acts.forEach(function (a) { var c = actChip(a, wrap, false); c.style.flex = "0 0 auto"; c.style.whiteSpace = "nowrap"; });
        wrap.addEventListener("scroll", function () { cwrap.style.setProperty("--peek", wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4 ? "0" : "1"); }); // hide the fade once fully scrolled (optional polish)
```
(The fade is CSS-driven; the scroll listener is optional and can be dropped — the static fade already reads as "more →".)

**C3 — The pick ignition.** In `commit()`, the single-pick path closes immediately ([app.js:6543](app.js:6543)). Route the single-pick close through a 220ms ignition. **Replace** [app.js:6543](app.js:6543):
```javascript
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } }
```
**with:**
```javascript
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); } else { igniteAndPick(a); } }
    function igniteAndPick(a) {
      // 220ms: the chosen chip flares in its own color + gold ring while the room fades, then the overlay collapses toward its cause (chrome-bento pick ignition)
      var chip = card.querySelector('.bchip[data-pk="' + (a && a.title || "").replace(/"/g, "") + '"]');
      card.classList.add("room-fading"); if (chip) chip.classList.add("igniting");
      setTimeout(function () { close(); opts.onPick(a); }, 220);
    }
```
And tag each chip with its title so `igniteAndPick` can find it. In `actChip()`, **after** the `s.innerHTML = …` line ([app.js:6553](app.js:6553)), add:
```javascript
      s.setAttribute("data-pk", (a.title || "").replace(/"/g, ""));
```

---

## 4. WIRING

### A — You-tab
Nothing new. The door is the existing `item("", "ti-settings", "Settings", …)` at [app.js:2948](app.js:2948). It already calls `settingsSheet()`; the replaced function renders «Ты». (Optional: rename that menu row label to `tr("You")` and icon `ti-user` so the entry reads «Ты» — one-token change: `item("", "ti-user", "You", function () { settingsSheet(); });`)

### B — Compass nav
1. **Boot:** call `compassInit()` once after the nav handlers are wired. Anchor: **insert after [app.js:8646](app.js:8646)** (`var gm = document.querySelector('#nav .nb[data-tab="self"]'); …`), still inside the same init function:
   ```javascript
   try { compassInit(); } catch (e) {}
   ```
2. **Re-fold after a tab switch.** `setPaneRest()` / the three pane transitions land in `applyPane(n)` ([app.js:1898](app.js:1898)). At the **end of each branch** (or once at the end of the function) call `compassFace()` to refresh the icon + `compassBloom()` is NOT wanted on programmatic switch — instead fold. Simplest: **insert at the very end of `applyPane`** (after the game branch, before its closing brace) :
   ```javascript
   try { if (document.body.classList.contains("compass")) compassFace(); else compassFold(); } catch (e) {}
   ```
   This keeps the pill folded-and-correct after every Планер/Путь/Игра change. (When bloomed, tapping a real tab still works — its handler runs, then this folds the pill.)
3. The pill's own tap (`compassFace().onclick → compassBloom`) blooms + starts the 2.5s auto-fold timer. Tapping a bloomed tab runs the real handler and re-folds via step 2.

> IMPORTANT (regression contract): the compass is a **display shell** — it never adds a second nav model. The bloomed bar IS the existing `#nav` with all its collapse/`nav-collapsed`/pane-drag rules. Do NOT combine `body.compass` with `body.nav-collapsed` at the same time — on the planner, prefer ONE: either keep the Apple-Music `nav-collapsed` behavior OR the compass. Recommend gating: only apply `body.compass` when `!document.body.classList.contains('nav-collapsed')`. If David wants the compass to fully REPLACE the 3-tab bar (verdict #21 says "replaces the always-visible 3-tab bar"), then also stop toggling `nav-collapsed` on scroll for `tab-day` — but do that as a follow-up, device-tested.

### C — Bento
All three edits are inside `bentoPicker()` — they apply to every call-site automatically (~15). No wiring.

---

## 5. I18N — new English strings → Russian (add to I18N.ru, near [app.js:1181](app.js:1181))

| English (key) | Russian (value) |
|---|---|
| `Explorer` | `Исследователь` |
| `since` | `с` |
| `h lived` | `ч прожито` |
| `next evolution` | `след. эволюция` |
| `rank` | `ранг` |
| `another` | `ещё` |
| `h` | `ч` |
| `Profile` | `Профиль` |
| `word` | `слово` |
| `wake-up` | `подъём` |
| `language` | `язык` |
| `Sound` | `Звук` |
| `voice` | `голос` |
| `beds` | `фоны` |
| `rewards` | `награды` |
| `Data` | `Данные` |
| `snapshot` | `снимок` |
| `days ago` | `дней назад` |
| `Rest mode` | `Я отдыхаю` |
| `I'm resting` | `Я отдыхаю` |
| `travel or off-days — streaks held` | `на паузе — серии целы` |
| `paused — streaks are held` | `на паузе — серии целы` |
| `Resting — your streaks are held` | `Отдых — серии целы` |
| `Advanced` | `Продвинутое` |

Already present in I18N.ru (confirm, don't re-add): `You`→`Ты`, `Planner`→`Планер`, `Journey`→`Путь`, `Game`→`Игра`, `Done`, `welcome back — let's ease in`. The bento head/peek/ignition introduce **no new strings** (search placeholder already translated).

> Widget shows «подъём 7:30» — the "7:30" is data (`S.profile.wake`), not a string; keep it literal.

---

## 6. REGRESSION RISKS

- **Compass vs `nav-collapsed` (HIGH).** `#nav` already has a scroll-collapse model (`body.nav-collapsed.tab-day`) and a pane-drag z-index rule. Two positioning models on the same element fight (this is exactly the regression-contract "two nav models" landmine). **Safe path:** gate `body.compass` to never coexist with `nav-collapsed` (see WIRING B note); ship compass first WITHOUT removing `nav-collapsed`, screenshot both states, then decide. Mark **DEVICE-UNTESTED** — the bloom/fold timing + touch-to-bloom is a gesture the preview can't prove.
- **`settingsSheet()` replaced (MED).** Every caller passes no args and expects the sheet to open — preserved. The four rooms fold ten old rows into fewer doors; if any old row (e.g. standalone Guidance, Language) is load-bearing for David, it now lives inside Profile→`goalsSheet`. **Additive-safe fallback:** keep the Advanced door listing dev items exactly as before. Verify each door still opens its flow (`goalsSheet`, `openVolumePanel`, `shareSnapshot`, `binderSheet`, `brainSheet`, `onboard`, `fillTestDay`).
- **`S.installK` on old saves (LOW).** Guarded stamp defaults to `todayK()` for existing users → their "since" reads today, hours small, rank I. Acceptable (it's a forward proxy, not real history). No SCHEMA bump, rides export/import.
- **Bento ignition delay (LOW).** The 220ms delay before `opts.onPick` fires on single-pick. All call-sites are fire-and-forget (`onPick` just acts). Low risk, but verify the tap→start-tracking flow ([app.js:2392](app.js:2392)) still feels instant enough; if David dislikes the delay, drop to 140ms or gate ignition to the bento-sheet only.
- **Peek-cut `::after` over a short row (LOW).** If a category has few chips (no overflow), the fade still paints. Harmless, but the optional scroll listener (`--peek`) can hide it; or add `.bento-catwrap:not(.overflow)::after{display:none}` if David flags it.

---

## 7. FIDELITY CHECKLIST (vs the two widget JPGs)

- [ ] **«Ты» title** — Jost 800, white, top-left, with an ✕ in the sheet head (existing `sttl` + `openSheet`'s ✕). ✔ uses `sttl`.
- [ ] **Trainer name «Исследователь»** — Jost **800, 26px, white** (`.you-tr-name`). Widget shows heavy white on the pink card. ✔
- [ ] **Badge** — pink `#ff5fa0` chunky square (15px radius), ink border `#160510`, hard `0 3px 0` shadow, `ti-compass` line-icon in ink `#4a1126`. ✔ matches the pink compass disc.
- [ ] **Earned-GOLD facts «С 12 МАЯ · 214 Ч ПРОЖИТО»** — Jost 800, **uppercase, letter-spacing 1px, `#ffc41f` (--yellow)**. ✔ `.you-tr-facts` is gold + uppercase.
- [ ] **Sheen** — a diagonal white 10%-opacity band across the card (`.you-trainer::before`, 120° gradient). ✔
- [ ] **Evolution line «след. эволюция — ранг III · ещё 36 ч»** — left label pink-tinted `#e8b8d2`, right "ещё Nч" brighter `#ffd0e6` 800. ✔
- [ ] **Progress bar** — pink fill `#ff7ab0→#ff5fa0`, ~55% in the widget, soft pink glow, thin ink track. ✔ `.you-tr-fill`.
- [ ] **Room chips «Профиль / Звук / Данные»** — solid dark `#2c081a`, **3px ink border `#160510`, hard `0 4px 0 #160510` shadow**, colored line-icon (Profile=connect pink, Sound=move orange, Data=nourish green), Jost 800 title 17px + `#c98aa8` sub, chevron `ti-chevron-right`. ✔ chunky game-piece language, not flat.
- [ ] **Data room vault pips** — 4 pips, right-aligned, `on` = green `#34d39a` w/ glow, off = `#5a2a48` (matches widget's `▬ ▬ ▬ ▬` trailing pips). ✔
- [ ] **Away held-state row «Я отдыхаю · на паузе — серии целы»** — **teal `#2ab8c4` with diagonal 135° stripes** (`repeating-linear-gradient`), ink border + hard shadow, ink-dark text `#06343a`, `ti-moon` icon, chunky pill toggle (knob slides). ✔ matches the striped teal row + toggle.
- [ ] **Toggle** — 52×30 rounded, ink border, white knob slides left(off)/right(on). ✔
- [ ] **Ghost «Продвинутое ▾»** — **transparent, 2px DASHED border `#7a4a68`**, muted `#c98aa8` text, `ti-flask` + `ti-chevron-down`. ✔ (chevron rotates when open).
- [ ] **Compass pill at rest** — small centered pill: active-tab icon (pink, glowing) + two `#9a6a86` dots, ink border, hard shadow. ✔ matches the `[📅] • •` pill in both the You screen and the "касание — распустилась" strip.
- [ ] **Bloom labels «Планер / Путь / Игра»** — Mom-safe words, existing `.nb`/`.jpn` spans already say Planner/Journey/Game → translated via I18N. ✔ (icons calendar-month / route / gamepad).
- [ ] **Auto-fold** — 2.5s (`compassBloom` timer) — matches «сложится сама через 2,5 с». ✔
- [ ] **Bento head** — «Что планируем?» Jost 800 + bare `ti-search` icon top-right (`.bento-headsearch`), NOT a full search bar. ✔ matches chrome-bento.
- [ ] **Bento soft tiles** — muted domain-tinted tiles (`actChip` `soft` path, `mixHex(D.c,'#1c0a17',.85)` bg + colored icon). ✔ already in the app; the widget's ЗАКРЕПЛЁННЫЕ/ТЕЛО/УМ tiles match.
- [ ] **Peek-cut** — a half-cut chip at the row's right edge + hard fade = the scroll hint (`.bento-catwrap::after`). ✔ matches «полувидимая плитка — знак: дальше есть ещё».
- [ ] **Pick ignition** — 220ms own-color flare + **gold ring `#ffc41f`** on the chosen chip while the room dims to 25% (`.room-fading`), then the overlay closes. ✔ matches «220 мс: выбор признан — меню сворачивается к причине» + the ignited «Медитация ✓» blue-striped chip.
- [ ] **No emojis anywhere** — all icons are `ti ti-*`. ✔
- [ ] **Palette locked** — pink `#ff5fa0`, teal `#2ab8c4`, gold `#ffc41f`, greens/oranges pulled from `DOM[*].c`; ink `#160510`; card `#2c081a`. No invented colors. ✔
