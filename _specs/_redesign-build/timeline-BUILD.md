# TIMELINE — 1:1 BUILD SPEC (Run 1, slices 5 & 6)

Canon: `_specs/_epic-mockups/_widget-refs/timeline.jpg` (LEFT = thermograph day; RIGHT = edge inspector).
Anchor fn: `calendarView(L, k, showNow, noHead)` @ `app.js:6064` — **THE REGRESSION ZONE (rebuilt 3×).**
This spec is split: **PART A = ADDITIVE VISUAL LAYER (low risk)** and **PART B = EDGE INSPECTOR (HIGH RISK — separate opt-in slice)**. Build A, ship, device-check; only then touch B.

---

## 1. SUMMARY

**What it is.** The scrollable day timeline: a two-lane PLAN|REAL calendar drawn per day-section by `calendarView()`, stacked into the continuous infinite scroll built by `buildPull()` (`app.js:3048`). Each day-section calls `calendarView(sec, dk, isT, true)` (`app.js:3112`). It is reached by opening the Today/pull sheet (`openPull()` `app.js:3165` → `#pullSheet.on`), which is the app's home surface. The week-strip lives above it (`weekStrip()` `app.js:2921`, host `.pull-weekstrip`).

**Already present in code (do NOT re-add):**
- **Per-hour thermograph SKY** — `.skybg` gradient (`app.js:6074`, KF keyframes) already tints per clock-hour (night navy → day wine-red). The widget's *rose HEAT bands over LIVED hours* are the NEW additive layer (PART A-1), painted ON TOP of `.skybg`, `pointer-events:none`.
- **Now-line end-dots** — DONE. `.nowline::before/::after` (`index.html:575-576`). **SKIP.**
- **Two-lane plan/real physics** — the whole `calendarView` body (place P/R lanes, straddle split, matched span, convbar). **UNTOUCHED — verdict #6 locks it. The widget simplified to one lane for readability; we layer onto the two-lane, never replace it.**
- **Midnight marker** — `.timemark` "midnight" at 0/1440 (`app.js:6096`). We ADD the seam line + crown (PART A-4).

**What the canon adds (this build):**
- A-1 Thermograph HEAT bands over lived hours (rose, additive over `.skybg`).
- A-2 Converter-seam shimmer on the **newest lived block's** top edge only.
- A-3 Week-strip **battery bars** under each day number (widget: colored fill bars beneath 29/30/1/2/**3**/4/5).
- A-4 Midnight **seam + crown** (the `· чт · 2 июля 👑 ▮▮▮▮ ·` day-header band already exists as `.day-stacksep`; add the crown + battery pips there and a brighter seam hairline).
- A-5 **Ghost-block padding fix** (verdict #5): the "Обед" ghost bubble — dashed border, icon must NOT kiss the border; proper padding/line-height.
- A-6 **Wayback icon** (`ti-arrow-back-up`) on ghost/missed blocks (widget shows it at the right edge of "Обед").
- B EDGE INSPECTOR (verdict #6, HIGH RISK, opt-in slice).

---

# PART A — ADDITIVE VISUAL LAYER (LOW RISK)

Every A-item is paint-only: appended nodes with `pointer-events:none` or a class toggle. None touch scroll/pinch/drag/recenter math, none change `place()`, lane geometry, or `barH()`.

## A. CSS — add to index.html

All timeline CSS lives in the second (active) block ~`index.html:746-820`. **Insert after line 820** (`.calblk.convbar .cn{ ... z-index:3; }`):

```css
  /* ===== RUN-1 slice 5 · thermograph HEAT bands + seam shimmer + wayback (2026-07-03) ===== */
  /* A-1: rose HEAT band over an hour you actually LIVED — layered OVER .skybg, never blocks touch */
  .cal .heatband{ position:absolute; left:0; right:0; z-index:0; pointer-events:none;
    background:linear-gradient(90deg,rgba(255,95,160,.16),rgba(255,95,160,.07) 60%,transparent);
    mix-blend-mode:screen; }
  /* A-2: converter-seam shimmer — the TOP edge of the newest lived block, a thin rose glimmer sweep */
  .cal .calblk.seamnew::before{ content:""; position:absolute; left:0; right:0; top:-1px; height:3px; z-index:5;
    pointer-events:none; border-radius:3px;
    background:linear-gradient(90deg,transparent,rgba(255,140,196,.9),rgba(255,255,255,.7),rgba(255,140,196,.9),transparent);
    background-size:220% 100%; animation:seamShimmer 2.6s linear infinite; }
  @keyframes seamShimmer{ 0%{ background-position:120% 0; } 100%{ background-position:-120% 0; } }
  /* A-6: wayback glyph on a ghost/missed block — bottom-right, muted, never kisses the edge */
  .cal .calblk .wayback{ position:absolute; right:9px; bottom:6px; z-index:4; pointer-events:none;
    font-size:14px; line-height:1; color:rgba(255,240,249,.42); }
```

### A-5 ghost-block padding fix — REPLACE the emptyblk night override AND add a ghost-content rule.

The widget's dashed bubble ("Обед") is a `ghost`/`dark` **status** block (a planned-then-missed block), not an `emptyblk` (empty untitled slot). But the reported "icon touches the dashed border / too low" is a `.cn` padding + line-height issue shared by both. **Insert after line 771** (`.calblk.emptyblk .cn{ ... gap:5px; }`):

```css
  /* verdict #5: ghost bubble content must breathe — icon/name never kiss the border */
  .cal .calblk.ghost .cn, .cal .calblk.emptyblk .cn{ display:flex; align-items:center; gap:6px; line-height:1.25; padding:1px 0; }
  .cal .calblk.ghost{ border:2px dashed #6a4a60; padding:6px 12px; } /* dashed like the widget; roomy padding (was solid-dark) */
```

Note the app currently paints `dark`/ghost fills inline in JS (`app.js:6142`) as a **solid** dark tint with a solid border. The widget wants DASHED. The `.cal .calblk.ghost{ border:2px dashed ... }` above is overridden by the inline `card.style.borderColor` (JS wins for color) but NOT the `border-style` — so JS keeps the domain-tinted color, CSS forces `dashed`. Confirm on device; if the inline `boxShadow:"none"` + solid color still reads solid, add `border-style:dashed` inline in JS (see A JS note below).

### A-3 / A-4 week-strip battery bars + crown — insert after line 1267 (`.pws-day:active{ ... }`):

```css
  /* A-3: battery bar under each week-strip day — how much of that day was lived (widget yellow/pink pips under 29..5) */
  .pws-day .pws-bat{ display:flex; gap:1.5px; height:4px; margin-top:3px; width:66%; }
  .pws-day .pws-bat i{ flex:1 1 0; border-radius:1px; background:rgba(255,255,255,.12); }
  .pws-day .pws-bat i.on{ background:#ffc41f; } /* lived/charged segment = yellow battery */
  .pws-day.today .pws-bat i.on{ background:#ff5fa0; } /* today's charge reads pink */
  .pws-day.sel .pws-bat i{ background:rgba(74,17,38,.3); } .pws-day.sel .pws-bat i.on{ background:#4a1126; }
  /* A-4: day-header crown + battery pips on the stacksep band (· чт · 2 июля 👑 ▮▮▮▮ ·) */
  .day-stacksep .dss-crown{ color:#ffd24a; font-size:13px; margin:0 2px; }
  .day-stacksep .dss-bat{ display:inline-flex; gap:2px; vertical-align:middle; margin-left:4px; }
  .day-stacksep .dss-bat i{ width:5px; height:11px; border-radius:1.5px; background:rgba(255,255,255,.14); }
  .day-stacksep .dss-bat i.on{ background:#ffc41f; }
```

## A. RENDER JS

### A-1 + A-2 — inside `calendarView`, immediately AFTER the sky IIFE closes.

The sky IIFE ends at `app.js:6083` (`    })();`). **Insert after that line** a heat-band pass. It reads the day's logs (`lgs`, already computed at `app.js:6066`) to know which hours were LIVED, and paints one `.heatband` per covered hour span. Newest-lived-block detection is done in the block loop (A-2), below.

Insert after `app.js:6083` (`    })();`):

```javascript
    // A-1 THERMOGRAPH HEAT (RUN-1 slice 5): hours you actually LIVED hold a rose heat band, painted OVER the sky (pointer-events:none, never touches physics). Uses logs (lgs) as the truth of "lived".
    (function () {
      if (!(showNow || k < todayK())) return; // only past/today hours can be "lived"
      var HPl = pullHourPx, s0 = startH * 60;
      lgs.forEach(function (lg) {
        var ls = hm(lg.time), le = ls + (lg.mins || 0); if (le <= s0 || ls >= endH * 60) return;
        ls = Math.max(ls, s0); le = Math.min(le, endH * 60);
        var hb = add(cal, "div", "heatband");
        hb.style.top = ((ls - s0) / 60 * HPl) + "px";
        hb.style.height = ((le - ls) / 60 * HPl) + "px";
      });
    })();
```

### A-2 — mark the newest lived block. Inside the block loop, after the card class/status is set.

The block loop starts at `app.js:6116` (`_bsorted.forEach(...)`). The matched/cele block is the "lived" plan bubble. Add the `seamnew` class to the block whose matched span ends LATEST (the newest converter seam). Simplest additive hook: after `var card = add(cal,...)` at `app.js:6130`, we can't yet know "newest" per-block; instead compute it ONCE before the loop and tag by index.

**Insert after `app.js:6110`** (`var planCards = [], burnedSomething = false;`):

```javascript
    // A-2 newest lived block index = the completed/matched plan bubble with the latest END (its top edge gets the converter-seam shimmer)
    var _seamIdx = -1, _seamEnd = -1;
    (function () {
      if (!(showNow && k === todayK())) return;
      _bsorted.forEach(function (b, i) { var st = blockStatus(k, b); if (st === "ok") { var e = hm(b.time) + (b.mins || 30); if (e <= logicalNowMin() + 1 && e > _seamEnd) { _seamEnd = e; _seamIdx = i; } } });
    })();
```

Then in the loop, **insert after `app.js:6130`** (the `var card = add(cal, "div", "calblk lane " + ...);` line):

```javascript
      if (_bi === _seamIdx) card.classList.add("seamnew"); // A-2 converter-seam shimmer on the newest lived edge only
```

### A-6 — wayback glyph on ghost/missed blocks. Inside the loop, after the `.csub` "want to log it?" block.

**Insert after `app.js:6175`** (the `if (status === "miss") { var ms = ... }` line):

```javascript
      if ((status === "miss" || dark) && b.title) { var wb = add(card, "div", "wayback"); wb.innerHTML = '<i class="ti ti-arrow-back-up"></i>'; } // A-6 wayback: this block is walkable-back (missed/ghost) — matches widget's Обед glyph
```

### A-5 (JS half, only if device shows the ghost still reads solid) — inside the `dark` branch at `app.js:6141-6142`:

Change `card.style.boxShadow = "none";` region: add `card.style.borderStyle = "dashed";` so the domain-tinted ghost border renders DASHED like the widget. Exact edit at `app.js:6142`, append to that statement:

```javascript
      } else if (dark) { card.style.background = mixHex(D.c, "#160510", 0.86); card.style.borderColor = mixHex(D.c, "#160510", 0.32); card.style.borderStyle = "dashed"; card.style.boxShadow = "none"; }
```

### A-3 — battery bars in the week-strip. REPLACE the cell body of `weekStrip` (`app.js:2921-2929`).

Replace lines `app.js:2923-2928` (the `for` loop IIFE) so each cell appends a `.pws-bat` with N pips filled by "lived fraction". Lived fraction = done blocks / total planned (fallback to logs coverage). Full replacement of the loop body:

```javascript
    for (var i = 0; i < 7; i++) { (function (dk) {
      var d = kd(dk), wd = d.getDay(), sel = (dk === focusK), isT = (dk === tk);
      var cell = add(host, "button", "pws-day" + (sel ? " sel" : "") + (isT ? " today" : "")); cell.dataset.dk = dk;
      add(cell, "span", "pws-l", L.charAt(wd)); add(cell, "span", "pws-n", String(d.getDate()));
      // A-3 battery: 4 pips, filled by the share of the day actually lived (done blocks; else raw logged coverage)
      if (dk <= tk) { var _bl = blocks(dk), _dn = 0; _bl.forEach(function (b) { if (blockStatus(dk, b) === "ok") _dn++; });
        var frac = _bl.length ? _dn / _bl.length : (logs(dk).length ? 0.25 : 0), on = Math.round(frac * 4);
        var bat = add(cell, "span", "pws-bat"); for (var p = 0; p < 4; p++) { var pip = add(bat, "i"); if (p < on) pip.className = "on"; } }
      cell.onclick = function () { if (dk === (pullFocusK || tk)) { if (dk === tk) scrollToNow(); return; } pullFocusK = dk; if (dk === tk) pendingScrollNow = true; else _scrollToFocus = true; buildPull(); };
    })(keyAdd(sow, i)); }
```

### A-4 — crown + battery pips on the day-header. EXTEND `dayHeadInfo` (`app.js:3101`).

`dayHeadInfo(hd, dk)` builds the stacksep contents. The widget's today band reads `· чт · 2 июля 👑 ▮▮▮▮ ·`. Add a crown (if the day is "perfect"/all-done) + a 4-pip battery. **Insert inside `dayHeadInfo`, right before its closing `}`** — i.e. after the existing `else if (blocks(dk).length){ ... }` block at `app.js:3101`:

```javascript
        // A-4 crown for a fully-lived day + a day-battery on the header band (matches the widget's 👑 ▮▮▮▮)
        if (dk <= todayK() && blocks(dk).length) { var _bl2 = blocks(dk), _dn2 = 0; _bl2.forEach(function (b) { if (blockStatus(dk, b) === "ok") _dn2++; });
          if (_dn2 >= _bl2.length && _bl2.length) { var cw = add(hd, "i", "ti ti-crown dss-crown"); }
          var _on2 = Math.round((_bl2.length ? _dn2 / _bl2.length : 0) * 4);
          var _dbat = add(hd, "span", "dss-bat"); for (var _p2 = 0; _p2 < 4; _p2++) { var _pp = add(_dbat, "i"); if (_p2 < _on2) _pp.className = "on"; } }
```

(`dayHeadInfo` is a closure inside `buildPull`; it already references `blocks`, `blockStatus`, `todayK`, `add`. No new imports.)

## A. WIRING
Nothing new. Every A-item renders inside the existing `calendarView` / `weekStrip` / `dayHeadInfo` passes that `buildPull()` already calls on every draw. No nav change, no new sheet, no new open path. Heat bands + seam repaint with the day (correct — they must track zoom via `pullHourPx`, which they read live).

## A. I18N
**No new user-facing strings.** All additions are icons/pips. (`ti-arrow-back-up`, `ti-crown`, battery pips carry no text.) `window.__latinAudit()` stays clean.

## A. REGRESSION RISKS (re-check the 4-point contract every ship)
1. **Continuous vertical scroll into prev/next day** — heat bands & seam are `position:absolute` children of `.cal` with `pointer-events:none`; they cannot intercept scroll. `weekStrip`/`dayHeadInfo` edits are additive pips. SAFE.
2. **Past/started = set-in-stone; future can't cross now-line** — untouched; A adds no drag/edit path. SAFE.
3. **Tap-empty creates / drag moves / tap-bubble opens editor** — the wayback glyph is `pointer-events:none`, so a tap on it falls through to the card's pointerdown (editor/drag) exactly as before. SAFE. (Confirm on device that `.wayback` never eats the tap — it must not; the CSS sets `pointer-events:none`.)
4. **Week-strip + Today/Now pill track centered day** — `weekStrip` replacement preserves `cell.onclick` verbatim and `cell.dataset.dk`; `setStripSel` (`app.js:2930`) still toggles `.sel` by dataset. SAFE. Battery pips are inert children.
- **Zoom (pinch):** `#pullBody.zooming .calblk` transitions are killed (`index.html:751`); heat bands are NOT `.calblk` so they won't animate, but they DO get rebuilt on `zoomCommit` (which re-runs `calendarView`) — correct, they re-place at the new `pullHourPx`. The `seamShimmer` animation is GPU background-position (like the existing `.foil`), safe during scroll. **Gesture feel stays DEVICE-UNTESTED — label it.**
- **`mix-blend-mode:screen`** on heat bands: verify on the iPhone it doesn't wash the deep sky. If it reads too hot, drop the blend mode (fallback is the plain rgba gradient). Low risk, one-line.

---

# PART B — EDGE INSPECTOR (⚠️ HIGH RISK — SEPARATE OPT-IN SLICE, SHIP ALONE)

**Do not build B in the same ship as A.** This is verdict #6, flagged HIGH RISK because it introduces a *live-resize behind a panel* — the class of thing that fought the two-lane physics before. Contract: **it edits the PLAN lane only; reality keeps printing beside it; the day stays LIVE behind the panel (no modal wipe).** Pink halo on the edited block (NEVER gold — gold is the on-plan/crown reward color).

### What the canon (RIGHT phone) shows
- A right-edge panel (~60% width) risen FROM the tapped block. Header: domain icon + name in domain color (`🧠 Работа`, blue).
- **НАЧАЛО** stepper: `−  15:00  +` (Jost 800 heavy time, chunky ± chips).
- **ДЛИНА** chips: `30 · 60 · 90` — the selected (60) is a pink solid chip with gold-ring feel; resizes the block LIVE behind the panel.
- A row of **bare domain dots** (blue / purple / green / `···`) to RE-TYPE the block's domain.
- **Ещё ›** ghost door → the full block editor (`blockEdit`).
- **🗑 удалить** (hold-to-fill to confirm delete).
- The edited block (left, "Глубокая работа") wears a **PINK halo** and stays live on the timeline.

### B. CSS — insert after the PART A block (after the `@keyframes seamShimmer` rule)

```css
  /* ===== RUN-1 slice 6 · EDGE INSPECTOR (opt-in, edits PLAN lane only) ===== */
  .edgeinsp{ position:absolute; z-index:40; right:0; width:58%; max-width:230px; background:#231018;
    border:2.5px solid #160510; border-left:2.5px solid #ff5fa0; border-radius:16px 0 0 16px;
    box-shadow:-6px 0 0 #160510, -10px 10px 26px rgba(0,0,0,.5); padding:13px 14px 15px;
    transform-origin:right center; animation:edgeRise .34s cubic-bezier(.34,1.56,.64,1); }
  @keyframes edgeRise{ from{ opacity:0; transform:translateX(14px) scale(.94); } to{ opacity:1; transform:none; } }
  .edgeinsp .ei-head{ display:flex; align-items:center; gap:7px; font-family:"Jost",sans-serif; font-weight:800; font-size:16px; margin-bottom:11px; }
  .edgeinsp .ei-lab{ font-family:"Jost",sans-serif; font-weight:800; font-size:11px; letter-spacing:1.4px; text-transform:uppercase; color:#9a8fb5; margin:9px 0 6px; }
  .edgeinsp .ei-step{ display:flex; align-items:center; gap:10px; }
  .edgeinsp .ei-step button{ width:34px; height:34px; border-radius:11px; background:#160510; border:2px solid #3a1f2e; color:#ffd7ea; font-size:19px; font-weight:800; cursor:pointer; box-shadow:0 3px 0 #0b0308; display:flex; align-items:center; justify-content:center; }
  .edgeinsp .ei-step button:active{ transform:translateY(2px); box-shadow:0 1px 0 #0b0308; }
  .edgeinsp .ei-time{ font-family:"Jost",sans-serif; font-weight:800; font-size:23px; color:#fff2f9; min-width:66px; text-align:center; letter-spacing:.5px; } /* Jost 800 HEAVY, never mono */
  .edgeinsp .ei-chips{ display:flex; gap:8px; }
  .edgeinsp .ei-chip{ flex:1 1 0; height:38px; border-radius:12px; background:#160510; border:2px solid #3a1f2e; color:#e7c9dc; font-family:"Jost",sans-serif; font-weight:800; font-size:15px; cursor:pointer; box-shadow:0 3px 0 #0b0308; }
  .edgeinsp .ei-chip.on{ background:#ff5fa0; color:#4a1126; border-color:#160510; box-shadow:0 0 0 2px #ffd24a,0 3px 0 #160510; } /* selected = pink chip, gold ring (selection language) */
  .edgeinsp .ei-dots{ display:flex; gap:10px; align-items:center; margin-top:4px; }
  .edgeinsp .ei-dot{ width:26px; height:26px; border-radius:50%; border:2px solid #160510; cursor:pointer; box-shadow:0 2px 0 #160510; }
  .edgeinsp .ei-dot.more{ background:#160510; color:#9a8fb5; display:flex; align-items:center; justify-content:center; font-size:15px; }
  .edgeinsp .ei-dot.sel{ box-shadow:0 0 0 2px #ffd24a,0 2px 0 #160510; }
  .edgeinsp .ei-more{ width:100%; margin-top:13px; height:42px; border-radius:13px; background:#2b1622; border:2px solid #4a2b3a; color:#ffd7ea; font-family:"Jost",sans-serif; font-weight:800; font-size:14px; cursor:pointer; box-shadow:0 3px 0 #160510; display:flex; align-items:center; justify-content:center; gap:6px; }
  .edgeinsp .ei-del{ width:100%; margin-top:11px; background:none; border:none; color:#ff7ab0; font-family:"Jost",sans-serif; font-weight:800; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:6px; position:relative; overflow:hidden; padding:6px; }
  .edgeinsp .ei-del .ei-fill{ position:absolute; left:0; top:0; bottom:0; width:0; background:rgba(255,95,160,.22); z-index:0; } /* hold-to-fill drain */
  .edgeinsp .ei-del span,.edgeinsp .ei-del i{ position:relative; z-index:1; }
  /* the edited block wears a PINK halo, never gold — and stays LIVE on the timeline */
  .cal .calblk.ei-editing{ box-shadow:0 0 0 3px #ff5fa0,0 0 20px rgba(255,95,160,.55),0 4px 0 #160510 !important; z-index:7; }
```

### B. RENDER JS — new function, appended near `calendarView`. Insert after `calendarView`'s closing brace.

`calendarView` is large; find its closing `}` (the function that began at `app.js:6064`). Add `openEdgeInspector(card, b, k)` after it. It positions relative to `.cal`, mutates `blocks(k)` (PLAN lane), re-runs `settle()`-equivalent via a light targeted resize of the tapped card, and full-redraws only on commit/domain-change.

```javascript
  function openEdgeInspector(card, b, k) {
    var cal = card.closest(".cal"); if (!cal) return;
    var ex = cal.querySelector(".edgeinsp"); if (ex) ex.remove();
    var prev = cal.querySelector(".calblk.ei-editing"); if (prev) prev.classList.remove("ei-editing");
    card.classList.add("ei-editing"); // PINK halo, block stays live
    var dom = domainOf(b), D = DOM[dom], HP = pullHourPx;
    var panel = add(cal, "div", "edgeinsp");
    var ct = parseFloat(card.style.top) || 0; panel.style.top = Math.max(2, ct - 6) + "px";
    // header
    var h = add(panel, "div", "ei-head"); h.style.color = D.light; h.innerHTML = tiIcon(b) + ' <span>' + esc(b.title || tr("Block")) + '</span>';
    // НАЧАЛО stepper (edits b.time = PLAN lane start)
    add(panel, "div", "ei-lab", tr("start")); var st = add(panel, "div", "ei-step");
    var minus = add(st, "button"); minus.innerHTML = '<i class="ti ti-minus"></i>';
    var tval = add(st, "div", "ei-time", fmt(hm(b.time)));
    var plus = add(st, "button"); plus.innerHTML = '<i class="ti ti-plus"></i>';
    function nudge(dm) { var m = hm(b.time) + dm; if (m < 0 || m > 1439) return; b.time = pad(Math.floor(m / 60)) + ":" + pad(m % 60); tval.textContent = fmt(m); card.style.top = ((m - (+cal.dataset.startH) * 60) / 60 * HP) + "px"; panel.style.top = Math.max(2, parseFloat(card.style.top) - 6) + "px"; }
    minus.onclick = function () { nudge(-15); }; plus.onclick = function () { nudge(15); };
    // ДЛИНА chips (resize the PLAN block LIVE behind the panel)
    add(panel, "div", "ei-lab", tr("length")); var chips = add(panel, "div", "ei-chips");
    [30, 60, 90].forEach(function (mn) { var c = add(chips, "button", "ei-chip" + ((b.mins || 30) === mn ? " on" : "")); c.textContent = mn;
      c.onclick = function () { b.mins = mn; card.style.height = barH(mn, HP) + "px"; chips.querySelectorAll(".ei-chip").forEach(function (x) { x.classList.remove("on"); }); c.classList.add("on"); degradeCard(card); }; });
    // bare domain dots (re-type)
    var dots = add(panel, "div", "ei-dots");
    ["focus", "create", "nourish"].forEach(function (dk2) { var dt = add(dots, "span", "ei-dot" + (dom === dk2 ? " sel" : "")); dt.style.background = DOM[dk2].c;
      dt.onclick = function () { b.dom = dk2; b.cat = null; closeEdgeInspector(cal); if (timelineIsHome()) buildPull(); }; });
    var more = add(dots, "span", "ei-dot more"); more.innerHTML = '<i class="ti ti-dots"></i>'; more.onclick = function () { closeEdgeInspector(cal); blockEdit(b, k); };
    // Ещё → full editor
    var mb = add(panel, "button", "ei-more"); mb.innerHTML = tr("More") + ' <i class="ti ti-chevron-right"></i>'; mb.onclick = function () { closeEdgeInspector(cal); blockEdit(b, k); };
    // hold-to-fill удалить
    var del = add(panel, "button", "ei-del"); var fill = add(del, "span", "ei-fill"); add(del, "i", "ti ti-trash"); add(del, "span", null, tr("delete"));
    var holdT = null, t0 = 0; function startHold() { t0 = Date.now(); fill.style.transition = "width .9s linear"; fill.style.width = "100%"; holdT = setTimeout(function () { pushUndo(); var a = blocks(k), i = a.indexOf(b); if (i >= 0) a.splice(i, 1); reflow(k); save(); closeEdgeInspector(cal); if (timelineIsHome()) buildPull(); else renderToday(); }, 900); }
    function cancelHold() { clearTimeout(holdT); fill.style.transition = "width .15s"; fill.style.width = "0"; }
    del.addEventListener("pointerdown", function (e) { e.stopPropagation(); startHold(); });
    del.addEventListener("pointerup", cancelHold); del.addEventListener("pointerleave", cancelHold);
    // commit start/length on close (save the PLAN edits); reality untouched
    panel._commit = function () { reflow(k); save(); };
  }
  function closeEdgeInspector(cal) { if (!cal) cal = document.querySelector(".cal .edgeinsp") && document.querySelector(".cal .edgeinsp").closest(".cal"); if (!cal) return; var p = cal.querySelector(".edgeinsp"); if (p) { if (p._commit) p._commit(); p.remove(); } var e = cal.querySelector(".calblk.ei-editing"); if (e) e.classList.remove("ei-editing"); }
```

### B. WIRING — opt-in trigger (behind a dev flag first)

`editBlk(b)` (`app.js:6109`) currently opens the FULL editor on any bubble tap. **Do NOT globally replace it.** Add the inspector as an opt-in: gate it behind a flag so David toggles it on device (process law). Change `editBlk` at `app.js:6109`:

```javascript
    function editBlk(b) { if (_pinching || (Date.now() - _zoomEndedAt) < 380) return; if (window.__edgeInsp) { var _c = null, _cs = cal.querySelectorAll(".calblk"); for (var _ci = 0; _ci < _cs.length; _ci++) if (planCards[_ci] && planCards[_ci].b === b) { _c = planCards[_ci].card; break; } if (_c) { openEdgeInspector(_c, b, k); return; } } blockEdit(b, k); }
```

Set `window.__edgeInsp = true` from the dev harness (add to the `DEV` object) so it ships dark and David flips it on. A background tap / scroll should `closeEdgeInspector`. Add a one-line dismiss: in `buildPull`'s pointer handling or on `pullBody` pointerdown outside `.edgeinsp`, call `closeEdgeInspector`. (Simplest: `el("pullBody").addEventListener("pointerdown", function(e){ if(!e.target.closest(".edgeinsp") && !e.target.closest(".ei-editing")) closeEdgeInspector(); }, true)` — add once, guarded by a `_edgeWired` flag so it isn't re-bound each `buildPull`.)

### B. I18N (add to I18N.ru — pick any `Object.assign(I18N.ru, {...})` block, e.g. after `app.js:1319`)
| English key | Russian value |
|---|---|
| `start` | `начало` |
| `length` | `длина` |
| `More` | `Ещё` |
| `delete` | `удалить` |
| `Block` | `Блок` |

(The widget shows `НАЧАЛО` / `ДЛИНА` uppercase — the CSS `text-transform:uppercase` on `.ei-lab` handles casing, so store lowercase RU. `Ещё` and `удалить` match the canon exactly.)

### B. REGRESSION RISKS (⚠️ HIGH — why it's a separate ship)
- **Live resize behind the panel is the exact class of change that fought the two-lane physics before.** It writes `b.mins`/`b.time` (PLAN lane) and only re-lays the tapped card via `card.style.height/top` + `degradeCard` — it does NOT re-run `settle()`/`preview()` (those reflow siblings and could bounce). On CLOSE it commits with `reflow(k)` + a full `buildPull()`. Verify the neighbors don't jump while the panel is open (they intentionally don't reflow live — matches the widget where only the edited block moves).
- **Contract #2 (future can't cross now-line):** the НАЧАЛО stepper can move a plan's start. It must NOT let a future block's start slide before `now` into the set-in-stone past. Add a guard in `nudge`: `if (k===todayK() && m < logicalNowMin()) return;` — **flag to integrator: add this guard before shipping B.**
- **Contract #3 (tap opens editor):** we REROUTE tap → inspector only when `window.__edgeInsp`. Off by default → zero behavior change on ship. The `Ещё`/`···` doors preserve the old `blockEdit` path.
- **Domain re-type** rebuilds the whole day (`buildPull`) — acceptable (it's a commit action, not a live drag).
- **Panel is a child of `.cal`** → it scrolls with the day. If David wants it screen-fixed, that's a follow-up; the widget shows it anchored to the block, so child-of-cal is correct.
- **Delete hold-to-fill** uses `pointerup`/`pointerleave` cancel — verify on device a scroll-start during hold cancels cleanly (touchmove may not fire `pointerleave`; add `pointercancel` → `cancelHold` too — **flag to integrator**).
- Gesture feel (spring rise, hold-to-fill drain, live resize) is **DEVICE-UNTESTED** in preview — label it.

---

## FIDELITY CHECKLIST (vs `_widget-refs/timeline.jpg`)
- **Header "Сегодня"** — already Jost 800 heavy white; `Сейчас` pill already the pink chip. No change (existing chrome). ✓ present.
- **Thermograph sky** — per-hour gradient ALREADY exists (`.skybg`); NEW = rose HEAT bands `rgba(255,95,160,.16→.07)` `mix-blend:screen` over LIVED hours only, `pointer-events:none`. ✓ A-1.
- **Converter-seam shimmer** — thin rose→white→rose sweep, `seamShimmer` 2.6s, on the **newest** lived block's top edge ONLY (`.seamnew::before`). ✓ A-2.
- **Now-line end-dots** — pink dot both ends, DONE at `index.html:575-576`. ✓ skip.
- **Week-strip battery bars** — 4 pips under each date, `#ffc41f` yellow lived / `#ff5fa0` pink today, matching the widget's colored bars beneath 29/30/1/2/**3**/4/5. Selected day (3) already the solid pink chip `#ff5fa0` (`.pws-day.sel`). ✓ A-3.
- **Day-header band `· чт · 2 июля 👑 ▮▮▮▮ ·`** — crown `ti-crown` `#ffd24a` + 4 battery pips on `.day-stacksep`. ✓ A-4. (Band/label RU already via `dayLabelFull`+translator.)
- **Ghost "Обед" bubble** — DASHED border (`border-style:dashed`), icon+name with `padding:6px 12px` + `line-height:1.25`, `align-items:center` so nothing kisses the border (verdict #5). ✓ A-5.
- **Wayback glyph** — `ti-arrow-back-up`, muted `rgba(255,240,249,.42)`, bottom-right, `pointer-events:none`. Matches the widget's Обед right-edge glyph. ✓ A-6.
- **Ink borders + hard shadows** — all new chunky pieces use `#160510` ink border + `0 Npx 0 #160510` hard shadow (edge-inspector chips/steppers/dots). No soft/flat. ✓
- **Selection = gold ring** — `.ei-chip.on` and `.ei-dot.sel` carry `0 0 0 2px #ffd24a` gold ring on a pink fill (60 chip is pink+gold-ring). ✓
- **Edited-block halo = PINK not gold** — `.calblk.ei-editing` = `0 0 0 3px #ff5fa0` pink halo, block stays live. ✓ (verdict #6).
- **Timer/time text = Jost 800 heavy** — `.ei-time` is `Jost 800 23px`, NEVER mono. ✓
- **Palette locked** — pink `#ff5fa0`, blue `#36b3f0` (focus `D.c`), yellow `#ffc41f`, gold-ring `#ffd24a`, ink `#160510`, all from `:root` / `DOM`. No invented hues. ✓
- **Tabler icons only, no emoji** — `ti-arrow-back-up`, `ti-crown`, `ti-minus/plus`, `ti-trash`, `ti-chevron-right`, `ti-dots`, `ti-brain`. ✓
- **Two-lane PLAN|REAL physics** — untouched; the widget's single lane is a readability simplification; heat/seam/inspector layer on top. ✓ (verdict #6).
