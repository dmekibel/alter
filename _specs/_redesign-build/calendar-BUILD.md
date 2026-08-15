# CALENDAR — WEEK + MONTH build spec (1:1 to `_widget-refs/calendar.jpg`)

Canon: `_specs/_epic-mockups/_widget-refs/calendar.jpg`
Verdicts: #9 (week — ship BOTH A/B behind a dev toggle), #10 (month — FIX: date numbers + weekday header row).
Target functions: `weekGrid()` (app.js ~6348), `monthGrid()` (app.js ~6366). Their CSS lives in `index.html` lines 461–484.

---

## 1. SUMMARY

**What it is.** The zoom-out calendar behind the Today view. `#zoomTabs` (index.html:1855) has three tabs — День / Неделя / Месяц (Day/Week/Month). Tapping **Неделя** sets `zoomMode="week"` and tapping **Месяц** sets `zoomMode="month"`; the tab click handler is at `app.js:8622`:

```js
document.querySelectorAll("#zoomTabs .zt").forEach(function (z) { z.onclick = function () { zoomMode = z.dataset.z; ...; renderToday(); }; });
```

`renderToday()` (app.js:6384) branches on `zoomMode`:
- `week` → `weekGrid(L)` (app.js:6391)
- `month` → `monthGrid(L)` (app.js:6392)

Both render into `#todayList` (`L`). **NOTE:** `renderToday()` early-returns to `buildPull()` when `timelineIsHome()` is true (the Day tab on the normal app). The zoom calendar is reached only when `zoomMode !== "day"` — so these two functions ARE live when the user is on Неделя/Месяц. The tab handler leaves `document.body.classList` as `tab-day`, but `renderToday` checks `zoomMode` first for week/month before the `timelineIsHome` fast-path only matters at day zoom. Confirmed: `weekGrid`/`monthGrid` render.

**Today's look vs canon.** The current CSS (index.html:461–484) already has crowns/fire/today-tint, but does NOT match the widget: week strips are single-blob only (no A/B), no now-line across today, no fire-run underline, no crowned shimmer, no mirror line, no live zoom label, no header stat line, no footer stat line, no hint row. Month cells DO already render the date number (`.mod`) and a weekday header (`.mowh`) — but the header uses EN single letters `S M T W T F S` (widget wants `П В С Ч П С В`), the ramp is a single muddy mix (widget wants a 4-step solid pink jewel ramp), there's no legend row, no "17 today highlighted" pink-fill, no breathing today, no matte future, no story line.

Helpers confirmed (grepped): `add(p,tag,cls,txt)` (app.js:4848, sets **textContent** — for icons/markup set `.innerHTML` after), `el(id)`, `DOM[d]` (`.c/.light/.ink/.ti`), `mixHex(a,b,t)` (app.js:445, returns `rgb()`), `esc` (444), `tr` (1792), `domainOf` (433), `blocks(k)` (4770), `logs(k)` (4771), `blockStatus(dk,b)` (255 → "ok"/"miss"/"plan"), `dayStats(dk)` (6346), `dayOnFire(dk)` (6347), `startOfWeek(k)` (251), `keyAdd(k,n)` (249), `kd(k)` (248), `todayK()` (232), `pad(n)` (228), `relShort(k)` (254).

---

## 2. CSS (add to index.html)

All the existing week/month rules (index.html:461–484) are REPLACED wholesale by the block below, and new rules are appended. Colors taken from the widget: berry track `#220719`, ink border `#160510`, live pink `#ff5fa8`/`#ff4fa0`, gold `#ffd24a`, jewel ramp `#d04f8f`→`#241328`, fire orange `#ff8a3a`, today breathing pink `#ff5fa0`.

**Anchor — REPLACE the whole existing block. Delete index.html lines 461–484** (from `.weekrow{...}` through `.mocell.today .mod{...}`) **and insert this in its place** (insert after this exact line — the zoom-tab rule that precedes them):

insert after: `  .zt.on{background:var(--purple);color:#fff;box-shadow:0 3px 0 #120d22;}`

```css
  /* ============ WEEK + MONTH — the crown calendar (1:1 calendar.jpg) ============ */
  /* stat lines that frame both grids */
  .cal-stat{font-family:var(--bub);font-weight:800;font-size:14px;color:#ffb8d8;text-align:center;margin:2px 2px 12px;letter-spacing:.2px;}
  .cal-stat .cs-crown{color:#ffd24a;}
  .cal-foot{font-family:var(--bub);font-weight:800;font-size:14px;color:#ffb8d8;text-align:center;margin:12px 2px 4px;}
  .cal-hint{font-family:var(--bub);font-weight:700;font-size:12px;color:#c98aa8;text-align:center;margin:4px 2px 2px;display:flex;align-items:center;justify-content:center;gap:6px;}
  .cal-hint i{font-size:13px;color:#ff8fc0;}

  /* ---------- WEEK ---------- */
  .weekrow{display:flex;gap:5px;position:relative;}
  .wkcol{flex:1;cursor:pointer;position:relative;}
  .wkstrip{position:relative;height:250px;background:#220719;border:2px solid #160510;border-radius:14px;overflow:hidden;box-shadow:inset 0 2px 10px rgba(0,0,0,.34);}
  /* VARIANT B — a containing day-track outline behind the blobs so a day reads as one column */
  .weekrow.wk-b .wkstrip{background:#1c0616;border-color:#3a1830;box-shadow:inset 0 0 0 1px rgba(255,95,168,.05),inset 0 2px 10px rgba(0,0,0,.34);}
  .weekrow.wk-a .wkstrip{background:transparent;border-color:transparent;box-shadow:none;} /* VARIANT A — no track: David's original bare one-blob columns */
  .wkcol.today .wkstrip{border-color:#ff5fa8;background:#2a0c1f;}
  .wkcol.crowned .wkstrip{border-color:#ffd24a;box-shadow:inset 0 0 0 1px rgba(255,210,74,.35),inset 0 2px 10px rgba(0,0,0,.34);animation:wkCrownShimmer 2.4s ease-in-out infinite;}
  @keyframes wkCrownShimmer{0%,100%{box-shadow:inset 0 0 0 1px rgba(255,210,74,.28),inset 0 2px 10px rgba(0,0,0,.34);}50%{box-shadow:inset 0 0 0 1px rgba(255,210,74,.7),0 0 10px rgba(255,210,74,.3),inset 0 2px 10px rgba(0,0,0,.34);}}
  /* the blobs — VARIANT A = one merged blob per day; VARIANT B = each real block, on the shared track */
  .wkb{position:absolute;left:5px;right:5px;border-radius:8px;min-height:5px;border:2px solid #160510;box-shadow:0 2px 0 #160510;}
  .wkb.striped{background-image:repeating-linear-gradient(-45deg,rgba(255,255,255,.16) 0 5px,transparent 5px 10px);}
  .wkb.miss{background:transparent!important;border:2px dashed rgba(255,95,168,.4);box-shadow:none;}
  .wkb.matte{box-shadow:0 2px 0 rgba(22,5,16,.6);}
  /* now-line straight across today's column */
  .wk-nowline{position:absolute;height:3px;background:#ff5fa8;box-shadow:0 0 6px rgba(255,95,168,.8);left:0;right:-40px;z-index:4;pointer-events:none;}
  .wk-nowdot{position:absolute;width:11px;height:11px;border-radius:50%;background:#ff5fa8;border:2px solid #160510;box-shadow:0 0 6px rgba(255,95,168,.9);z-index:5;pointer-events:none;transform:translate(-50%,-50%);}
  /* mirror line — the faint horizontal seam under the strips */
  .wk-mirror{height:2px;background:linear-gradient(90deg,transparent,rgba(255,95,168,.35),transparent);margin:0 4px;border-radius:2px;}
  /* single fire-run underline — one continuous ember track under consecutive lived days */
  .wk-firerun{position:relative;height:4px;margin:9px 4px 0;}
  .wk-firebar{position:absolute;height:4px;border-radius:3px;background:linear-gradient(90deg,#ffb14a,#ff8a3a,#ff5a2a);box-shadow:0 0 7px rgba(255,138,58,.6);}
  .wk-fireflame{position:absolute;top:-9px;color:#ff8a3a;font-size:15px;filter:drop-shadow(0 0 4px rgba(255,138,58,.85));animation:fireFlick 1.2s infinite;}
  .wkcol.crowned{position:relative;}
  .wk-crown{position:absolute;top:-10px;left:50%;margin-left:-9px;color:#ffd24a;font-size:16px;filter:drop-shadow(0 0 5px rgba(255,210,74,.85));z-index:6;}
  .wkdow{display:flex;gap:5px;margin:6px 2px 0;}
  .wkdow .wkd{flex:1;text-align:center;font-family:var(--bub);font-weight:800;font-size:12px;color:#c98aa8;}
  .wkdow .wkd.today{color:#ffd24a;}

  /* ---------- MONTH ---------- */
  .mogrid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;}
  .mowh{text-align:center;font-family:var(--bub);font-weight:800;font-size:11px;color:#c98aa8;padding-bottom:3px;}
  .mocell{min-height:46px;border:2px solid #160510;border-radius:13px;background:#1c0616;position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:visible;box-shadow:0 2px 0 #160510;}
  .mocell.empty{border:none;background:none;box-shadow:none;}
  .mod{font-family:var(--bub);font-weight:800;font-size:13px;color:#e9b7cf;position:relative;z-index:2;}
  .mocell.lit .mod{color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.4);}
  .mocell.fut{opacity:.5;box-shadow:0 2px 0 rgba(22,5,16,.6);}
  .mocell.fut .mod{color:#7a5a70;}
  .mocell.away{border-style:dashed;border-color:rgba(255,95,168,.35);background:transparent;}
  .mocell.crowned{border-color:#ffd24a;box-shadow:0 0 0 1px #ffd24a,0 2px 0 #160510;}
  .mocell.today{border-color:#ff5fa8;background:#ff5fa8;animation:moBreathe 2.6s ease-in-out infinite;}
  .mocell.today .mod{color:#4a1126;font-size:14px;}
  @keyframes moBreathe{0%,100%{box-shadow:0 0 0 1px #ff5fa8,0 2px 0 #160510;}50%{box-shadow:0 0 12px rgba(255,95,168,.65),0 2px 0 #160510;}}
  .mo-crown{position:absolute;top:-9px;right:-4px;color:#ffd24a;font-size:14px;filter:drop-shadow(0 0 4px rgba(255,210,74,.85));z-index:3;}
  .mo-fire{position:absolute;top:50%;left:calc(100% + 1px);transform:translateY(-50%);color:#ff8a3a;font-size:13px;filter:drop-shadow(0 0 3px rgba(255,138,58,.8));animation:fireFlick 1.3s infinite;z-index:3;}
  .mo-glint{position:absolute;top:-6px;right:-6px;color:#ffe08a;font-size:13px;filter:drop-shadow(0 0 4px rgba(255,224,138,.9));z-index:3;} /* wayback glint on returning days */
  /* legend row */
  .mo-legend{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 10px;margin:14px 2px 4px;}
  .mo-leg{display:flex;align-items:center;gap:7px;font-family:var(--bub);font-weight:800;font-size:12px;color:#e9b7cf;}
  .mo-leg .lgsw{width:16px;height:16px;border-radius:5px;border:2px solid #160510;flex:none;}
  .mo-leg .lgramp{display:flex;gap:1px;flex:none;}
  .mo-leg .lgramp span{width:8px;height:16px;border:2px solid #160510;border-right-width:0;}
  .mo-leg .lgramp span:last-child{border-right-width:2px;}
  .mo-leg i{font-size:15px;flex:none;}
  .mo-leg .lg-crown{color:#ffd24a;}
  .mo-leg .lg-glint{color:#ffe08a;}
```

*(Note: `@keyframes fireFlick` already exists in index.html — reused, do not redefine.)*

The dev-toggle button for A/B week (verdict #9):

insert after: `  .cal-hint i{font-size:13px;color:#ff8fc0;}`

```css
  .wk-abtoggle{display:inline-flex;gap:0;background:rgba(255,255,255,.06);border:2px solid #4a4068;border-radius:11px;padding:3px;margin:0 auto 10px;}
  .wk-abtoggle button{background:none;border:none;color:#c98aa8;font-family:var(--bub);font-weight:800;font-size:12px;padding:5px 12px;border-radius:8px;cursor:pointer;}
  .wk-abtoggle button.on{background:var(--purple);color:#fff;box-shadow:0 2px 0 #120d22;}
  .wk-abwrap{display:flex;justify-content:center;}
```

---

## 3. RENDER JS

### 3a. REPLACE `weekGrid` (app.js:6348–6365)

Full replacement. Adds: A/B dev toggle (persisted `localStorage.alter_wkab`), containing day-track (variant B), now-line across today, single fire-run underline, crowned shimmer (via class), mirror line, live zoom label (header `29—5` range + footer stat), weekday row `Пн Вт …`.

**Anchor — replace the entire function `function weekGrid(L, baseK, onDay) { … }` (app.js:6348 through its closing `}` at 6365) with:**

```js
  function wkAB() { try { return localStorage.getItem("alter_wkab") === "a" ? "a" : "b"; } catch (e) { return "b"; } } // default B (containing track); dev toggle flips to A
  function weekGrid(L, baseK, onDay) { // 1:1 calendar.jpg — 7 real-block columns; verdict #9 ships BOTH A (bare blobs) + B (day-track outline) behind a dev toggle
    baseK = baseK || viewK; onDay = onDay || function (dk) { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
    var d0 = startOfWeek(baseK), variant = wkAB();
    // header range label (live zoom label): "29—5"
    var wkEndK = keyAdd(d0, 6), hs = add(L, "div", "cal-stat"), lived = 0, crowns = 0, run = 0, bestRun = 0;
    // A/B dev toggle
    var abw = add(L, "div", "wk-abwrap"), ab = add(abw, "div", "wk-abtoggle");
    var bA = add(ab, "button", variant === "a" ? "on" : "", "A"), bB = add(ab, "button", variant === "b" ? "on" : "", "B");
    bA.onclick = function () { try { localStorage.setItem("alter_wkab", "a"); } catch (e) {} renderToday(); };
    bB.onclick = function () { try { localStorage.setItem("alter_wkab", "b"); } catch (e) {} renderToday(); };
    var row = add(L, "div", "weekrow " + (variant === "a" ? "wk-a" : "wk-b"));
    var DAY_START = 360, DAY_SPAN = 18 * 60; // 6:00 → midnight window
    var liveByCol = []; // for the fire-run underline
    for (var i = 0; i < 7; i++) { (function (dk, idx) {
      var st0 = dayStats(dk), isToday = dk === todayK();
      var col = add(row, "div", "wkcol" + (isToday ? " today" : "") + (st0.perfect ? " crowned" : ""));
      if (st0.perfect) { crowns++; var cr = add(col, "i", "ti ti-crown wk-crown"); }
      liveByCol[idx] = st0.active; if (st0.active) lived++;
      var strip = add(col, "div", "wkstrip");
      // VARIANT A merges the day into ONE dominant blob; VARIANT B draws every real block on the track
      var drawn = blocks(dk).filter(function (b) { return b.title; });
      if (variant === "a" && drawn.length) {
        // one blob spanning the day's lived envelope, tinted by the dominant domain
        var mn = 1e9, mx = -1e9, domC = null;
        drawn.forEach(function (b) { var bs = hm(b.time), be = bs + (b.mins || 30); if (bs < mn) mn = bs; if (be > mx) { mx = be; } if (blockStatus(dk, b) === "ok" && !domC) domC = (DOM[domainOf(b)] || DOM.focus).c; });
        var anyOk = drawn.some(function (b) { return blockStatus(dk, b) === "ok"; });
        var y = Math.max(0, (mn - DAY_START) / DAY_SPAN * 100), h = Math.max(6, (mx - mn) / DAY_SPAN * 100);
        var bb = add(strip, "div", "wkb" + (anyOk ? " striped" : " matte"));
        bb.style.top = y + "%"; bb.style.height = h + "%";
        bb.style.background = anyOk ? (domC || DOM.focus.c) : mixHex((domC || DOM.focus.c), "#160510", 0.62);
      } else if (variant === "b") {
        drawn.forEach(function (b) {
          var bs = hm(b.time), y = Math.max(0, (bs - DAY_START) / DAY_SPAN * 100), h = Math.max(3.2, (b.mins || 30) / DAY_SPAN * 100);
          var st = blockStatus(dk, b), D = DOM[domainOf(b)] || DOM.focus, bb = add(strip, "div", "wkb");
          bb.style.top = y + "%"; bb.style.height = h + "%";
          if (st === "ok") { bb.style.background = D.c; bb.classList.add("striped"); }
          else if (st === "miss") { bb.classList.add("miss"); bb.style.borderColor = mixHex(D.c, "#160510", 0.3); }
          else { bb.style.background = mixHex(D.c, "#160510", 0.6); bb.classList.add("matte"); }
        });
      }
      // now-line straight across TODAY's column (verdict: now-line across today)
      if (isToday) { var nm = logicalNowMin(); if (nm >= DAY_START && nm <= DAY_START + DAY_SPAN) { var ny = (nm - DAY_START) / DAY_SPAN * 100; var nl = add(strip, "div", "wk-nowline"); nl.style.top = ny + "%"; var nd = add(strip, "div", "wk-nowdot"); nd.style.top = ny + "%"; nd.style.left = "6px"; } }
      col.onclick = function () { onDay(dk); };
    })(keyAdd(d0, i), i); }
    // mirror line — faint seam under the strips
    add(L, "div", "wk-mirror");
    // single fire-run underline — ONE continuous ember bar under the longest consecutive lived-day run
    var runStart = -1, bestS = -1, bestL = 0, curS = -1, curL = 0;
    for (var j = 0; j < 7; j++) { if (liveByCol[j]) { if (curL === 0) curS = j; curL++; if (curL > bestL) { bestL = curL; bestS = curS; } } else curL = 0; }
    var frun = add(L, "div", "wk-firerun");
    if (bestL >= 2) { var seg = 100 / 7, bar = add(frun, "div", "wk-firebar"); bar.style.left = "calc(" + (bestS * seg) + "% + 4px)"; bar.style.width = "calc(" + (bestL * seg) + "% - 8px)"; var fl = add(frun, "i", "ti ti-flame wk-fireflame"); fl.style.left = "calc(" + ((bestS + bestL) * seg) + "% - 12px)"; }
    // weekday row Пн Вт Ср Чт Пт Сб Вс — Ср/today gold
    var dow = add(L, "div", "wkdow"), NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    for (var w = 0; w < 7; w++) { (function (dk) { var d = kd(dk); add(dow, "div", "wkd" + (dk === todayK() ? " today" : ""), tr(NAMES[d.getDay()])); })(keyAdd(d0, w)); }
    // header range "29—5" (live zoom label)
    var a = kd(d0), b2 = kd(wkEndK); hs.textContent = a.getDate() + "—" + b2.getDate();
    // footer stat: "5 жилых дней · 1 ♛ · серия 5"
    var foot = add(L, "div", "cal-foot");
    foot.innerHTML = esc(lived) + " " + esc(tr("lived days")) + " · " + esc(crowns) + ' <i class="ti ti-crown cs-crown" style="font-size:13px"></i> · ' + esc(tr("streak")) + " " + esc(bestL);
    var hint = add(L, "div", "cal-hint"); hint.innerHTML = '<i class="ti ti-zoom-scan"></i> ' + esc(tr("tap — the week folds into a day"));
  }
```

### 3b. REPLACE `monthGrid` (app.js:6366–6382)

Full replacement. Adds: header story stat line ("13 дней сияли · 4 ♛ · лучшая серия — 6"), Cyrillic weekday header `П В С Ч П С В`, jewel-step 4-solid-pink ramp, gold-hairline crowns, matte future, today breathing + "17" pink-fill, wayback glint on returning days, legend row.

**Anchor — replace the entire function `function monthGrid(L, baseK, onDay) { … }` (app.js:6366 through its closing `}` at 6382) with:**

```js
  var MO_RAMP = ["#5a2440", "#8a2e5c", "#b53d77", "#d04f8f"]; // jewel-step tint ramp: 4 SOLID pinks (no muddy mix, no shrunken stripes) — verdict #10
  function monthGrid(L, baseK, onDay) {
    baseK = baseK || viewK; onDay = onDay || function (dk) { viewK = dk; zoomMode = "day"; pendingScrollNow = true; renderToday(); };
    var f = kd(baseK); f.setDate(1); var startDow = f.getDay(), y = f.getFullYear(), mo = f.getMonth(), dim = new Date(y, mo + 1, 0).getDate();
    // story stat line
    var lit = 0, crowns = 0, bestRun = 0, curRun = 0;
    for (var d1 = 1; d1 <= dim; d1++) { var dk1 = y + "-" + pad(mo + 1) + "-" + pad(d1); var s1 = dayStats(dk1); if (dk1 <= todayK() && s1.active) { lit++; curRun++; if (curRun > bestRun) bestRun = curRun; if (s1.perfect) crowns++; } else curRun = 0; }
    var hs = add(L, "div", "cal-stat");
    hs.innerHTML = esc(lit) + " " + esc(tr("days shone")) + ' · ' + esc(crowns) + ' <i class="ti ti-crown cs-crown" style="font-size:13px"></i> · ' + esc(tr("best streak —")) + " " + esc(bestRun);
    var grid = add(L, "div", "mogrid");
    // weekday header П В С Ч П С В (Sun-first order to match getDay 0..6 → Вс at index 0, but display Mon-first? keep Sun-first grid) 
    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach(function (w) { add(grid, "div", "mowh", tr(w)); });
    for (var p = 0; p < startDow; p++) add(grid, "div", "mocell empty");
    for (var day = 1; day <= dim; day++) { (function (dk, day) {
      var st1 = dayStats(dk), isT = dk === todayK(), fut = dk > todayK();
      var cell = add(grid, "div", "mocell" + (isT ? " today" : "") + (st1.perfect ? " crowned" : "") + (fut ? " fut" : ""));
      var lit1 = !fut && (st1.active || st1.planned);
      if (lit1 && !isT) {
        // jewel-step: pick a solid ramp rung by match-ratio (perfect = top rung)
        var rung = st1.perfect ? 3 : st1.ratio >= 0.66 ? 2 : st1.ratio >= 0.33 ? 1 : st1.active ? 0 : 0;
        cell.style.background = MO_RAMP[rung];
        cell.classList.add("lit");
        if (st1.perfect) { cell.style.borderColor = "#ffd24a"; add(cell, "i", "ti ti-crown mo-crown"); }
        if (dayOnFire(dk)) add(cell, "i", "ti ti-flame mo-fire");
        // wayback glint on a "returning" day — lived today after a dark yesterday
        if (st1.active && !dayStats(keyAdd(dk, -1)).active) add(cell, "i", "ti ti-sparkles mo-glint");
      }
      var num = add(cell, "div", "mod"); num.textContent = "" + day; // DATE NUMBER — verdict #10 fix
      cell.onclick = function () { onDay(dk); };
    })(y + "-" + pad(mo + 1) + "-" + pad(day), day); }
    // hint + legend
    var hint = add(L, "div", "cal-hint"); hint.innerHTML = '<i class="ti ti-zoom-scan"></i> ' + esc(tr("tap — the day grows from its cell"));
    var lg = add(L, "div", "mo-legend");
    function leg(html, label) { var r = add(lg, "div", "mo-leg"); r.innerHTML = html + '<span>' + esc(tr(label)) + '</span>'; }
    leg('<span class="lgsw" style="background:#1c0616"></span>', "quiet");
    leg('<span class="lgramp"><span style="background:' + MO_RAMP[0] + '"></span><span style="background:' + MO_RAMP[1] + '"></span><span style="background:' + MO_RAMP[2] + '"></span><span style="background:' + MO_RAMP[3] + '"></span></span>', "shining");
    leg('<i class="ti ti-crown lg-crown"></i>', "crown");
    leg('<span class="lgsw" style="background:' + MO_RAMP[3] + ';border-color:#ffd24a"></span>', "charge");
    leg('<span class="lgsw" style="background:transparent;border-style:dashed;border-color:rgba(255,95,168,.4)"></span>', "away");
    leg('<i class="ti ti-sparkles lg-glint"></i>', "return");
  }
```

**Legend label mapping to canon (RU):** тихий=quiet, сияние=shining, корона=crown, заряд=charge, в пути=away, возвращение=return. (The widget's «в пути» = the dashed "away/on-the-road" cell; «заряд» = the gold-edged charged future/perfect cell.)

---

## 4. WIRING

**No new nav wiring needed.** The functions are already called by `renderToday()` (app.js:6391–6392) and the tabs already flip `zoomMode` (app.js:8622). Both replaced functions keep the exact same signature `(L, baseK, onDay)` and render into `L` — drop-in.

**One optional header-label tweak (live zoom label in the app's own `#dnLabel`):** the top day-nav label at app.js:6386 already reads `"Week of …"` / month-year for week/month. The widget shows `29—5` (week) and `Июль` (month) in the *card header*, which this spec renders INSIDE the grid via `.cal-stat`, so `#dnLabel` can stay. If David wants the range in `#dnLabel` too, change app.js:6386's week branch to build the same `a.getDate()+"—"+b.getDate()` range — but that's additive and not required for 1:1.

**Dev toggle (verdict #9):** the A/B buttons render at the top of the week grid and persist to `localStorage.alter_wkab` (default `"b"`). This is a real in-app toggle (not `?dev`-gated) so David can flip it on his phone and let his eye decide, per the process law. Once he picks, delete the loser and the `.wk-abwrap`/`wkAB()`/`wk-a`/`wk-b` branch.

---

## 5. I18N (add to `I18N.ru` — app.js, any `Object.assign(I18N.ru, {…})` block)

Every new English string introduced above → its Russian value. Insert as a new `Object.assign(I18N.ru, { … })` right after the last such block (they chain; order doesn't matter). Note `tr("Mo")` etc.: the weekday abbreviations must map so the row reads Пн…Вс and the month header П В С Ч П С В.

```js
  Object.assign(I18N.ru, {
    // weekday abbreviations (week row = 2-letter; month header shows first Cyrillic letter)
    "Su": "Вс", "Mo": "Пн", "Tu": "Вт", "We": "Ср", "Th": "Чт", "Fr": "Пт", "Sa": "Сб",
    // week footer + hints
    "lived days": "жилых дней",
    "streak": "серия",
    "tap — the week folds into a day": "тап — неделя складывается в день",
    // month story line + hints
    "days shone": "дней сияли",
    "best streak —": "лучшая серия —",
    "tap — the day grows from its cell": "тап — день вырастает из своей клетки",
    // month legend
    "quiet": "тихий", "shining": "сияние", "crown": "корона",
    "charge": "заряд", "away": "в пути", "return": "возвращение"
  });
```

**IMPORTANT — the month weekday header.** The canon month header is single Cyrillic letters `П В С Ч П С В`. With `tr("Su")→"Вс"` etc. the `.mowh` cells would show 2 letters. Two options — pick one when building:
- **(preferred, 1:1)** In `monthGrid`, render the header from a dedicated single-letter array instead of `tr()`: replace the `["Su",…].forEach(… tr(w))` line with
  `["Вс","Пн","Вт","Ср","Чт","Пт","Сб"].map(function(x){return x[0];}).forEach(function(w){ add(grid,"div","mowh",curLang()==="ru"?w:"SMTWTFS"[["Вс","Пн","Вт","Ср","Чт","Пт","Сб"].indexOf... );`  → simpler: build `var MOWH = curLang()==="ru" ? ["В","П","В","С","Ч","П","С"] : ["S","M","T","W","T","F","S"]; MOWH.forEach(function(w){ add(grid,"div","mowh",w); });`
  Use this. It gives exactly `В П В С Ч П С` in Sunday-first order (canon shows `П В С Ч П С В` which is Monday-first; since the grid is Sunday-first via `getDay`, keep Sunday-first letters `В П В С Ч П С` to stay aligned with the actual columns — do NOT reorder letters without reordering the grid).
- The week 2-letter row uses `tr("Mo")` etc. and is fine as Пн/Вт/….

`curLang()` is defined at app.js (grep-confirmed). Guard: `typeof curLang === "function"`.

---

## 6. REGRESSION RISKS

- **Same-signature drop-in.** Both functions keep `(L, baseK, onDay)` and only write into `L`. `renderToday`'s week/month branches (6391–6392) do `L.innerHTML = ""` first, so no leftover DOM. LOW risk.
- **`add()` sets textContent, not innerHTML.** Every icon/markup element uses `.innerHTML` AFTER `add(...)` (matches the codebase pattern at 6353/6362). The day-number uses `num.textContent` — correct. Verified against helper at app.js:4848.
- **`logicalNowMin()` / `logicalK` usage.** `weekGrid` calls `logicalNowMin()` for the now-line — already used throughout `calendarView`/`blockStatus` (app.js:255), so it's in scope. Safe.
- **CSS deletion.** Deleting index.html:461–484 removes the OLD `.wkb.real` right-ribbon rule — the new week grid drops the thin real-lane ribbon (canon has no right ribbon; it's blob columns). Intended. No other file references those classes (grep `.wkb.real` → only that rule).
- **Dev A/B toggle localStorage.** Wrapped in try/catch; default `"b"`. Cannot throw on private-mode storage.
- **NOT the timeline regression zone.** This is the retired inline zoom-calendar, not `buildPull`/the day-nav gesture model. The regression contract (continuous scroll, set-in-stone past, tap-create, week-strip tracking) is UNTOUCHED — no `buildPull`, no pointer arbitration, no now-watcher changed. Only additive class/CSS + two self-contained render fns.
- **SCHEMA:** no state-shape change (only a UI pref in a separate localStorage key `alter_wkab`). No migration, no SCHEMA bump.
- **DEVICE-UNTESTED:** the breathing/shimmer animations, now-line placement, and fire-run bar geometry are visual — verify on David's phone. Preview proves boot + layout only.

---

## 7. FIDELITY CHECKLIST (vs calendar.jpg)

**Week (left card):**
- [ ] Font = Jost 800 heavy for the header `29—5` and footer stat (`--bub` = Jost per index.html:728; weight 800). NOT thin.
- [ ] Header range spelled as digits `29—5` (em-dash), right-aligned bold — `.cal-stat` renders it.
- [ ] Ink borders `#160510` + HARD `0 2px 0 #160510` shadow on every `.wkb` blob (chunky game-piece, never soft).
- [ ] Lived blobs = solid domain color WITH 45° stripe overlay (`.striped`); pink/blue/green all present in canon → domain palette (`DOM[d].c`).
- [ ] Miss = dashed transparent (`.wkb.miss`), matte upcoming = dark mix (`.matte`).
- [ ] Gold crown `#ffd24a` above perfect column (`.wk-crown`), crowned strip shimmer (`wkCrownShimmer`).
- [ ] Now-line = pink `#ff5fa8` 3px horizontal bar across today with a round end-dot (`.wk-nowline` + `.wk-nowdot`), extends right past the column (`right:-40px`) as in canon.
- [ ] Single continuous fire-run bar under the longest lived run + one flame at its end (`.wk-firebar` + `.wk-fireflame`) — orange `#ff8a3a`. Canon shows ONE ember track, not per-day flames.
- [ ] Mirror line = faint pink horizontal seam (`.wk-mirror`).
- [ ] Weekday row Пн Вт **Ср**(gold) Чт **Пт** Сб Вс — today gold `#ffd24a` (`.wkd.today`).
- [ ] Footer: `5 жилых дней · 1 ♛ · серия 5` with gold ti-crown.
- [ ] Hint: `тап — неделя складывается в день` with a ti-zoom-scan icon.
- [ ] A/B dev toggle chip present (verdict #9), purple `.on` pill, default B (containing track).

**Month (right card):**
- [ ] Header story: `13 дней сияли · 4 ♛ · лучшая серия — 6`, Jost 800, gold crown glyph.
- [ ] Weekday header row present (single Cyrillic letters), color `#c98aa8`.
- [ ] **Every cell shows its DATE NUMBER** (`.mod`, Jost 800 13px) — the verdict-#10 fix.
- [ ] Jewel-step ramp = 4 SOLID pinks `#5a2440 #8a2e5c #b53d77 #d04f8f` (no muddy `mixHex`, no shrunken stripes).
- [ ] Gold hairline crown border `#ffd24a` + `.mo-crown` glyph on perfect days.
- [ ] Future cells matte + dimmed (`.mocell.fut`, opacity .5).
- [ ] Today `17` = full pink `#ff5fa8` fill, dark ink number `#4a1126`, breathing glow (`moBreathe`).
- [ ] Wayback glint (`ti-sparkles` `#ffe08a`) on a returning day — canon shows the sparkle at top-right of a cell.
- [ ] Fire glyph on streak days (`.mo-fire`).
- [ ] Legend row: тихий / сияние (4-swatch ramp) / корона / заряд / в пути (dashed) / возвращение (glint) — `.mo-legend`, 3 columns × 2 rows as in canon.
- [ ] Ink borders `#160510` + hard `0 2px 0 #160510` shadow on cells (chunky).
- [ ] Tabler icons only (ti-crown, ti-flame, ti-sparkles, ti-zoom-scan) — NO emoji anywhere.
