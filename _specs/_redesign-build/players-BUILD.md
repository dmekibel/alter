# PLAYERS 1:1 BUILD SPEC — meditation player + PM mirror (mock #20, verdict "a lot a lot more")

Widget canon: `_specs/_epic-mockups/_widget-refs/players.jpg` (two phones — LEFT = meditation player «ЗАРЯД ТИШИНЫ · 10 мин»; RIGHT = PM mirror «ВЕЧЕРНИЙ РИТУАЛ»).

This is an ADDITIVE enrichment of two flows that already exist and already work. We are NOT rebuilding the audio engine, the beat machine, or the PM commit path — we are layering the canon's game-piece surfaces onto them. Every anchor below is a real, unique line in the current tree (verified 2026-07-03).

---

## 1. SUMMARY

### LEFT — meditation player
- Render fn: **`timelinePlayer(opts)`** at `app.js:7296`. It builds `#breatheOv.gp-ov` with `.bw-orb`, `.bw-label`, `.bw-sub`, a `.gp-title`, a `.gp-cog`, `.gp-waves`, and a bottom `.gp-bar` (scrub `.gp-scrub`/`.gp-fill`/`.gp-knob`, times `.gp-times`, transport `.gp-btns` with `.gp-b.gp-side` ±15 + `.gp-b.gp-play`). CSS lives in `index.html:520–545`.
- Reached via `meditation()` (`app.js:5863`, the config screen → `run()` → `timelinePlayer`), `meditationQuick()` (`app.js:5968`, from stacks), `mantraPlayer()` (`app.js:5960`), and every stack tool. All of them funnel into `timelinePlayer`, so **all our player upgrades go in `timelinePlayer` once** and every guided audio flow inherits them.
- The canon's four new surfaces vs. what exists today:
  1. **Beat-pip session map** at top (one pip per segment; filled = played). NEW.
  2. **Element-TINTED orb** — the orb must take `opts.color` (blue here = a Focus/Restore session), not the hard-coded lilac gradient. Today `.bw-orb` is a fixed lilac radial. NEW tinting.
  3. **Catch-ripple + «подмечено · N» pips** under the cue line — the drift-tap counter, shown as dots + a spelled label. Today drift just flips the label text (`app.js:7313`). NEW visible pip row.
  4. **Battery scrub** — the scrub bar gets battery "cell" segmentation + cue ticks at each segment start + an **H12 silence tail** (the last `20s` rendered as a distinct dim «тишина в конце» zone) and a `«тишина в конце · 0:20»` mid-caption between the two time stamps. Today the scrub is a plain fill bar (`app.js:7318`).
  - Chrome-dissolves-during-play (`.gp-title`, `.gp-cog` fade while `playing`) — canon subtitle "chrome leaves the room". NEW.

### RIGHT — PM mirror
- Render fn: **`pmBeatMirror(card, sb, mr, k)`** at `app.js:4086` — this is BEAT 1 of the PM cockpit flow (`PM_BEATS[0]="mirror"`, `app.js:4049`). It runs inside the cockpit stage `#tfStageBody`, entered via `enterStage("pm", …)` (e.g. the Reflection chip `app.js:3653`, the journey PM node `app.js:1096`).
- Today `pmBeatMirror` is text-only (`bookendMirrorLine` + a couple of warm `.tfs-sub` lines). The canon replaces it with a **visual mirror**: the day itself as mini time-blocks (striped-kept / DRIFT / MIMO-ghost), a **now-line** row, the «4 из 6 прожито — ты держал линию» tally line, then the mood row moves here as **five jewel mood mini-rows** with an ignition-selected pick, and the primary door is the pink narrated «К пере-сборке дня →».
- Data is already computed by **`bookendMirror(k)`** (`app.js:4025`) — it returns `kept/missed/drift/planned/missBlocks/domMin/strong/streak`. We read `blocks(k)` + `blockStatus(k,b)` (`app.js:255`) for the per-block status to draw each mini-block. No new data model.

---

## 2. CSS (add to index.html)

All blocks are scoped so they can't leak. Colors/shadows copy the existing component language (ink `#160510`, hard `0 Npx 0` shadows, `--bub` Baloo for chunky numerals, Jost for UI).

**Block A — meditation player surfaces. Insert after `index.html:545`** (the last `.gp-waves span:nth-child(3)` rule):

```css
  /* ===== PLAYER 1:1 (mock #20): session-map pips · tinted orb · catch pips · battery scrub w/ cue ticks + silence tail · chrome dissolve ===== */
  #breatheOv .gp-map{position:fixed;top:calc(env(safe-area-inset-top,0px) + 58px);left:0;right:0;display:flex;gap:7px;justify-content:center;z-index:4;pointer-events:none;transition:opacity .5s;}
  #breatheOv .gp-map i{width:26px;height:7px;border-radius:4px;background:rgba(240,230,239,.18);transition:background .25s;}
  #breatheOv .gp-map i.on{background:var(--gp-c,#9a7cff);}
  #breatheOv .gp-catch{display:flex;align-items:center;gap:7px;justify-content:center;margin-top:11px;position:relative;z-index:2;min-height:14px;}
  #breatheOv .gp-catch .cd{width:9px;height:9px;border-radius:50%;background:var(--gp-c,#9a7cff);opacity:.85;}
  #breatheOv .gp-catch .cl{font-family:var(--bub);font-size:13px;font-weight:700;color:#bcb0e8;}
  #breatheOv .gp-catch.ripple::before{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:2px solid var(--gp-c,#9a7cff);animation:gpRipple .9s ease-out;}
  @keyframes gpRipple{0%{transform:scale(.6);opacity:.7}100%{transform:scale(4.2);opacity:0}}
  /* battery scrub: cell ticks over the existing .gp-scrub, plus a dim silence tail + its caption */
  #breatheOv .gp-ticks{position:absolute;inset:0;pointer-events:none;}
  #breatheOv .gp-ticks i{position:absolute;top:-3px;width:2px;height:12px;border-radius:1px;background:rgba(240,230,239,.30);transform:translateX(-1px);}
  #breatheOv .gp-tail{position:absolute;top:0;bottom:0;right:0;border-radius:0 6px 6px 0;background:repeating-linear-gradient(90deg,rgba(240,230,239,.10),rgba(240,230,239,.10) 3px,transparent 3px,transparent 7px);border-left:2px dashed rgba(240,230,239,.35);}
  #breatheOv .gp-silence{width:100%;max-width:440px;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:-6px;font-family:var(--bub);font-size:11.5px;font-weight:700;color:rgba(188,176,232,.75);}
  #breatheOv.gp-playing .gp-title,#breatheOv.gp-playing .gp-cog{opacity:0;transition:opacity .7s;} /* chrome leaves the room */
  #breatheOv .gp-title,#breatheOv .gp-cog{transition:opacity .5s;}
```

**Block B — PM mirror surfaces. Insert after `index.html:1183`** (the `.tf-stagecard .tfs-sub` rule):

```css
  /* ===== PM MIRROR 1:1 (mock #20 right): the day as mini time-blocks + now-line + jewel mood mini-rows ===== */
  .pm-mir{display:flex;flex-direction:column;gap:9px;margin:4px 0 2px;}
  .pm-mrow{display:flex;align-items:stretch;gap:10px;}
  .pm-mtime{flex:none;width:44px;font-family:var(--bub);font-weight:700;font-size:13px;color:#9a8098;display:flex;align-items:center;}
  .pm-mblk{flex:1;min-width:0;display:flex;align-items:center;gap:8px;border:2px solid #160510;border-radius:12px;box-shadow:0 3px 0 #160510;padding:10px 12px;color:#fff;font-family:'Jost',sans-serif;font-weight:800;font-size:14.5px;}
  .pm-mblk i{font-size:16px;flex:none;}
  .pm-mblk .pm-mttl{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .pm-mblk .pm-mtag{flex:none;font-family:var(--bub);font-weight:800;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;opacity:.85;}
  .pm-mblk.drift{background:#2a2d34;border-color:#160510;color:#b8bcc6;box-shadow:0 3px 0 #0c0d10;}
  .pm-mblk.miss{background:transparent;border-style:dashed;border-color:#4a3550;box-shadow:none;color:#7a6a80;}
  .pm-nowrow{display:flex;align-items:center;gap:8px;padding-left:54px;margin-top:1px;}
  .pm-nowrow .dot{width:9px;height:9px;border-radius:50%;background:var(--pink);flex:none;box-shadow:0 0 8px var(--pink);}
  .pm-nowrow .ln{flex:1;height:2px;border-radius:2px;background:linear-gradient(90deg,var(--pink),rgba(255,95,160,.15));}
  .pm-nowrow .lbl{flex:none;font-family:var(--bub);font-weight:800;font-size:12px;color:#ff9ec6;}
  .pm-tally{font-family:'Jost',sans-serif;font-weight:800;font-size:16px;color:#ffe3f1;text-align:center;line-height:1.35;margin:6px 2px 2px;}
  /* five jewel mood mini-rows */
  .pm-moodq{font-weight:800;font-size:15px;color:#ffe3f1;margin:4px 0 8px;}
  .pm-jewels{display:flex;gap:8px;}
  .pm-jewel{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:5px;background:#241328;border:2px solid #160510;border-radius:14px;box-shadow:0 3px 0 #160510;padding:11px 4px 9px;cursor:pointer;transition:transform .16s cubic-bezier(.34,1.56,.64,1),box-shadow .16s;}
  .pm-jewel i{font-size:22px;line-height:1;}
  .pm-jewel span{font-family:var(--bub);font-weight:800;font-size:11px;color:#c9a6c0;}
  .pm-jewel.on{transform:translateY(-2px);box-shadow:0 0 0 3px var(--yellow),0 5px 0 #160510;}
  .pm-jewel.on span{color:#160510;}
  .pm-door{width:100%;display:flex;align-items:center;justify-content:center;gap:9px;background:var(--pink);color:#160510;border:3px solid #160510;border-radius:18px;box-shadow:0 5px 0 #160510;padding:15px;font-family:'Jost',sans-serif;font-weight:800;font-size:17px;cursor:pointer;margin-top:12px;transition:transform .1s,box-shadow .1s;}
  .pm-door:active{transform:translateY(4px);box-shadow:0 1px 0 #160510;}
```

> Note: `--pink` (`#ff4fa0`), `--yellow` (`#ffc41f`), `--bub` are all already in `:root` at `index.html:20–22`. The gold selection ring uses `var(--yellow)` per the component language. The `.on` jewel state fills yellow + dark ink text exactly like the canon «Ясно ✓» chip.

---

## 3. RENDER JS

### 3A — meditation player (edit `timelinePlayer`, `app.js:7296`)

**(i) Tint the orb + expose the domain color as a CSS var.** Insert right after `app.js:7303` (`orb.style.animation = "breathe 9s ease-in-out infinite";`):

```javascript
    ov.style.setProperty("--gp-c", col); // element-tint everything (map pips, catch dots, ripple) to this session's color
    // tinted orb (mock #20): radial from a light mix of col → col → transparent, hard-glow in col
    var _oc = col, _olite = mixHex(_oc, "#ffffff", 0.55);
    orb.style.background = "radial-gradient(circle," + _olite + " 0%," + mixHex(_oc, "#160510", 0.10) + " 55%,rgba(0,0,0,0) 74%)";
    orb.style.boxShadow = "0 0 80px " + mixHex(_oc, "#160510", 0.15);
```

**(ii) Session-map pips (one per non-silence segment).** Insert after the `gp-title` block at `app.js:7305` (`if (opts.title) { var tb = add(ov, "div", "gp-title", opts.title); }`):

```javascript
    // BEAT-PIP SESSION MAP (mock #20): one pip per cue segment, fills as playback passes each — the map at the top
    var mapWrap = add(ov, "div", "gp-map"), mapPips = [];
    opts.segments.forEach(function () { mapPips.push(add(mapWrap, "i")); });
    function paintMap(e) { for (var i = 0; i < mapPips.length; i++) { var on = opts.segments[i] && opts.segments[i].start <= e; mapPips[i].className = on ? "on" : ""; } }
```

**(iii) Catch-ripple + «подмечено» pips.** REPLACE the whole `if (opts.drift) { … }` block at `app.js:7310–7314` with:

```javascript
    // CATCH = THE UNIT (mock #20): a pip row + ripple every time you notice a drift; label spells «подмечено · N»
    var catchWrap = add(ov, "div", "gp-catch"), catchLbl = null;
    function paintCatch() {
      catchWrap.innerHTML = "";
      for (var i = 0; i < driftCount; i++) add(catchWrap, "span", "cd");
      catchLbl = add(catchWrap, "span", "cl", tr("noticed") + " · " + driftCount);
      catchWrap.style.visibility = driftCount ? "" : "hidden"; // no pips until the first catch
    }
    paintCatch();
    if (opts.drift) {
      orb.style.cursor = "pointer";
      var dhint = add(ov, "div", null, tr("tap the orb the moment you notice you've drifted")); dhint.style.cssText = "position:fixed;bottom:calc(env(safe-area-inset-bottom,0px) + 132px);left:0;right:0;text-align:center;font-size:11.5px;color:rgba(240,230,239,.42);z-index:4;pointer-events:none;";
      orb.addEventListener("click", function (e) { e.stopPropagation(); driftCount++; try { medChime(); } catch (er) {} paintCatch(); catchWrap.classList.remove("ripple"); void catchWrap.offsetWidth; catchWrap.classList.add("ripple"); var was = lab.textContent; lab.textContent = tr("good catch — back to it"); setTimeout(function () { if (lab.textContent === tr("good catch — back to it")) lab.textContent = was; }, 1500); });
    } else { catchWrap.style.display = "none"; } // mantra/non-drift players don't show the catch row
```

**(iv) Battery ticks + silence tail on the scrub.** Insert after `app.js:7318` (the line that creates `scrub`/`fill`/`knob`):

```javascript
    // BATTERY SCRUB (mock #20): cue ticks at each segment start + a dim H12 silence tail zone
    var ticks = add(scrub, "div", "gp-ticks"), tailEl = add(scrub, "div", "gp-tail");
    var silenceSec = (opts.silenceTailSec != null) ? opts.silenceTailSec : (opts.drone !== false ? 20 : 0); // 20s "тишина в конце" default for meditation
```

Then insert a silence caption row after `app.js:7319` (the `.gp-times` row):

```javascript
    var silCap = add(bar, "div", "gp-silence"); silCap.style.visibility = "hidden";
    silCap.innerHTML = '<i class="ti ti-moon" style="font-size:13px;"></i> ' + tr("silence at the end") + ' · 0:' + pad(silenceSec);
```

Now paint the ticks + tail once the timeline is laid out. Insert inside `layout(...)`, right after `app.js:7338` (`ready = true; lab.textContent = ""; tTot.textContent = fmtT(total); bar.style.visibility = ""; paintNow(0);`):

```javascript
      // battery cue ticks (one per segment start) + silence tail sized to the last `silenceSec`
      ticks.innerHTML = "";
      segs.forEach(function (sg) { if (sg.start <= 0 || sg.start >= total) return; var t = add(ticks, "i"); t.style.left = (sg.start / total * 100) + "%"; });
      if (silenceSec > 0 && total > silenceSec) { tailEl.style.left = ((total - silenceSec) / total * 100) + "%"; tailEl.style.display = ""; silCap.style.visibility = ""; }
      else { tailEl.style.display = "none"; }
      paintMap(0);
```

**(v) Feed the map + chrome-dissolve on play/pause.** In `paintNow(e)` at `app.js:7363`, add `paintMap(e);` as the first statement inside the function body (right after `function paintNow(e) {`):

```javascript
    function paintNow(e) { paintMap(e);
```

And toggle the `gp-playing` class in `startFrom` and `pause`. In `startFrom` at `app.js:7351`, after `playing = true;` add:

```javascript
      ov.classList.add("gp-playing");
```

In `pause()` at `app.js:7361`, after `playing = false;` add:

```javascript
      ov.classList.remove("gp-playing");
```

(No change needed in `finish()` — the overlay is removed there.)

> The two color stops for the scrub `.gp-fill` are still the lilac gradient in CSS. To tint the fill to the session color too (canon shows a blue→pink fill), OPTIONAL one-liner after `app.js:7318`: `fill.style.background = "linear-gradient(90deg," + mixHex(col,"#ffffff",0.4) + "," + col + ")";` — include it; it matches the canon's tinted battery.

### 3B — PM mirror (replace `pmBeatMirror`, `app.js:4086–4099`)

Replace the ENTIRE `pmBeatMirror` function (from `function pmBeatMirror(card, sb, mr, k) {` at line 4086 through its closing `}` at line 4099) with:

```javascript
  // ---- BEAT 1: MIRROR (mock #20 1:1) — the DAY ITSELF as mini time-blocks (kept striped / DRIFT / MIMO-ghost) + a now-line, a spelled tally, and the jewel mood row. Pure read; the mood pick persists to sb.dataset.mood exactly as the ask beat expects.
  function pmBeatMirror(card, sb, mr, k) {
    add(card, "div", "tfs-h", tr("Here's the day you lived"));
    add(card, "div", "tfs-sub", tr("not a grade — a reflection")).style.opacity = ".8";
    // the day as mini time-blocks, in time order
    var day = (blocks(k) || []).filter(function (b) { return b.title; }).slice().sort(function (a, b) { return hm(a.time) - hm(b.time); });
    var mir = add(card, "div", "pm-mir");
    var nowMin = (k === todayK()) ? logicalNowMin() : 24 * 60, nowDrawn = false;
    function drawNowLine() { if (nowDrawn || k !== todayK()) return; nowDrawn = true; var nr = add(mir, "div", "pm-nowrow"); nr.innerHTML = '<span class="dot"></span><span class="ln"></span><span class="lbl">' + tr("now") + ' · ' + esc(fmt(nowMin)) + '</span>'; }
    day.forEach(function (b) {
      if (hm(b.time) >= nowMin) drawNowLine();
      var st = blockStatus(k, b), dom = domainOf(b), D = DOM[dom] || DOM.focus;
      var row = add(mir, "div", "pm-mrow");
      add(row, "div", "pm-mtime", fmt(hm(b.time)).replace(/(am|pm)$/, "")); // HH:MM, 24h-ish per canon
      var blk = add(row, "div", "pm-mblk" + (st === "miss" ? " miss" : dom === "drift" ? " drift" : ""));
      if (st === "ok" && dom !== "drift") blk.style.background = tfStripe(D.c); // KEPT = striped hero tile
      else if (dom === "drift") { /* .drift class carries the cool-gray fill */ }
      else if (st === "miss") { /* .miss class carries the dashed ghost */ }
      else blk.style.background = D.c;
      blk.innerHTML = '<i class="ti ' + tiClass(b) + '" style="color:' + (st === "miss" ? "#7a6a80" : dom === "drift" ? "#b8bcc6" : (D.ink || "#160510")) + '"></i>' +
        '<span class="pm-mttl" style="color:' + (st === "miss" ? "#7a6a80" : dom === "drift" ? "#e6e8ec" : (D.ink || "#160510")) + '">' + esc(b.title) + '</span>' +
        (dom === "drift" ? '<span class="pm-mtag">' + tr("DRIFT") + '</span>' : st === "miss" ? '<span class="pm-mtag">' + tr("MISSED") + '</span>' : '');
    });
    drawNowLine();
    // spelled tally line — «4 из 6 прожито — ты держал линию»
    var tally = add(card, "div", "pm-tally");
    tally.textContent = mr.planned ? (mr.kept + " " + tr("of") + " " + mr.planned + " " + tr("lived") + " — " + (mr.kept >= Math.ceil(mr.planned * 0.6) ? tr("you held the line") : tr("and that's enough"))) : tr("A free-form day — rest is part of the work.");
    // FIVE JEWEL MOOD MINI-ROWS — moves the mood pick up here; ignition-selected (gold ring). Persists to sb.dataset.mood (the ask beat reads the same).
    add(card, "div", "pm-moodq", tr("What did it taste like?"));
    var jewels = add(card, "div", "pm-jewels");
    var prev = ((S.bk || {})[k] || {}).pm;
    MOODS.forEach(function (m, i) {
      var sel = (sb.dataset.mood === String(i)) || (!sb.dataset.mood && prev && prev.mood === i);
      var j = add(jewels, "button", "pm-jewel" + (sel ? " on" : ""));
      j.innerHTML = '<i class="ti ' + m.e + '" style="color:' + (sel ? "#160510" : DOM.restore.light) + '"></i><span>' + tr(m.l) + '</span>';
      j.onclick = (function (idx) { return function () { var on = sb.dataset.mood === String(idx); sb.dataset.mood = on ? "" : String(idx); Array.prototype.forEach.call(jewels.querySelectorAll(".pm-jewel"), function (b, bi) { var s = (!on && bi === idx); b.className = "pm-jewel" + (s ? " on" : ""); b.querySelector("i").style.color = s ? "#160510" : DOM.restore.light; }); }; })(i);
    });
    // NARRATED PINK DOOR — «К пере-сборке дня →» : advances the PM flow (same as the primary Continue button)
    var door = add(card, "button", "pm-door");
    door.innerHTML = tr("To re-storying the day") + ' <i class="ti ti-arrow-right"></i>';
    door.onclick = function () { try { pmAdvance(); } catch (e) {} };
  }
```

> Why the door calls `pmAdvance()`: it's the exact primary-button handler (`app.js:4055`); it flushes state, skips the re-story beat when there's no drift, and rebuilds. The mood now lives in `sb.dataset.mood` set here, and `pmBeatAsk` already reads `sb.dataset.mood` (`app.js:4155`) so the pick carries forward and commits normally in `exitStage`. **No change to `pmBeatAsk`'s mood row is required** — it will simply pre-highlight the same pick (harmless duplication). Optional cleanup (nice-to-have, not required): delete the `moodWrap` block in `pmBeatAsk` (`app.js:4150–4157`) so mood is asked once. Leave it if unsure — additive is safe.

---

## 4. WIRING

- **Meditation player:** zero new wiring. All entry points (`meditation`, `meditationQuick`, `mantraPlayer`, stacks) already call `timelinePlayer`; the upgrades are internal to that fn. Meditation already passes `drift:true` (`app.js:5973`) → gets the catch pips; mantra passes no `drift` → catch row hides. The tinted orb reads `opts.color` which every caller already passes (meditation `#9a5cf0`, mantra `#ff7ab8`). For the canon's BLUE session, meditation's color could be switched to a Focus/Restore blue — but that's a content call for David; the mechanism is color-agnostic and correct today.
- **PM mirror:** zero new wiring. `pmBeatMirror` is already dispatched by `pmRenderBeat` (`app.js:4078`) as beat 0. The pink door calls the existing `pmAdvance()`. The bottom «Continue» primary from `renderTFControls("pm")` still works identically (the door is an in-card duplicate of it, matching the canon).
- **Silence tail knob:** `timelinePlayer` now honors `opts.silenceTailSec`. Callers may pass it; default is 20s for droned sessions, 0 otherwise. No caller change needed.

---

## 5. I18N (add to I18N.ru)

Every NEW English string introduced above → its Russian (matches the canon's spelled text). Add these keys to the `I18N.ru` dict:

| English key (as passed to `tr()`) | Russian value |
|---|---|
| `noticed` | `подмечено` |
| `silence at the end` | `тишина в конце` |
| `Here's the day you lived` | `Вот день, который ты прожил` |
| `not a grade — a reflection` | `не оценка — отражение` |
| `now` | `сейчас` |
| `DRIFT` | `ДРЕЙФ` |
| `MISSED` | `МИМО` |
| `of` | `из` |
| `lived` | `прожито` |
| `you held the line` | `ты держал линию` |
| `and that's enough` | `и этого достаточно` |
| `A free-form day — rest is part of the work.` | `Свободный день — отдых тоже часть работы.` |
| `What did it taste like?` | `Каким он был на вкус?` |
| `To re-storying the day` | `К пере-сборке дня` |

Already-translated / reused (confirm they exist, don't duplicate): `good catch — back to it`, `tap the orb the moment you notice you've drifted`, and the five MOOD labels `Foggy/Heavy/Okay/Clear/Radiant` → `Туман/Тяжесть/Норм/Ясно/Сияние` (canon uses these exact short forms — if the dict currently has longer forms, override to the canon's `Туман · Тяжесть · Норм · Ясно · Сияние`). The player title `ЗАРЯД ТИШИНЫ` is a content string for the session name; set the meditation session `title`/`tr` mapping to it when David picks the "silence charge" guide — the widget's title is `opts.title` and is content, not a fixed literal.

---

## 6. REGRESSION RISKS

- **`timelinePlayer` is the shared spine of EVERY audio flow** (meditation, mantra, breathwork-adjacent, all stacks). The edits are strictly additive DOM nodes + one class toggle; none touch the Web-Audio scheduling (`startFrom`/`layout`/`stopSources`), the iOS gesture path, or `finish()`'s log/earn/save. Safe path: the only behavioral change to existing code is REPLACING the `opts.drift` block (item iii) — it preserves the exact `driftCount++ / medChime / label swap / medFocus EMA` semantics, just adds a visible pip row. Verify: meditation still logs + earns spark, still learns drift rate.
- **Chrome-dissolve** hides `.gp-title`/`.gp-cog` while playing. The cog opens the volume panel — confirm it's still reachable when PAUSED (it is; class removed on pause). If David wants it always tappable, drop the `.gp-cog` from the `.gp-playing` selector — leave `.gp-title` only.
- **PM mirror rewrite** changes beat-1 rendering only. `bookendMirror`/`bookendMirrorLine` are untouched (still used by other callers). The mood now sets `sb.dataset.mood` in beat 1; `pmBeatAsk` + `exitStage` read the same field → the value carries and commits. Risk: if `pmBeatAsk`'s own mood row is NOT removed, the user can change mood twice — last write wins, still correct. Risk: `logicalNowMin()`/`fmt()`/`hm()`/`blockStatus()`/`tfStripe()`/`tiClass()`/`domainOf()` are all existing helpers — no new deps.
- **Empty/free-form day:** `day` is `[]` → the mir list is empty, `drawNowLine()` still draws the now-line, the tally falls to the free-form string. No crash.
- **DEVICE-UNTESTED:** the scrub battery ticks, silence-tail drag boundary, and orb catch-tap are gesture surfaces — boots-clean in preview; **gesture feel is device-untested — confirm scrub drag + orb tap on the phone.**

---

## 7. FIDELITY CHECKLIST (vs `players.jpg`)

Meditation (left):
- [ ] Title `ЗАРЯД ТИШИНЫ · 10 мин` — `.gp-title`, Jost 800, uppercase, letter-spacing 1.6px, dim `rgba(240,230,239,.5)` — matches existing `.gp-title` (`index.html:537`). ✓
- [ ] Session-map pips: 6-ish chunky bars, first 3 filled in the session color (blue), rest dim `rgba(240,230,239,.18)`. `.gp-map i.on{background:var(--gp-c)}`. ✓
- [ ] Orb: big element-TINTED (blue) sphere, light-core radial + soft hard-glow, NOT the fixed lilac. `mixHex(col,#fff,.55)` core. ✓
- [ ] Cue line `Заметь мысль — и мягко вернись` — the `.bw-label` Jost 800 28px. ✓ (content set by segment)
- [ ] Catch row: filled dots (blue, 9px) + `подмечено · 4` in `--bub`. `.gp-catch .cd` + `.cl`. Ripple on tap. ✓
- [ ] Battery scrub: fill tinted blue→pink, cue TICKS at each segment (`.gp-ticks i`, 2px, `.30` alpha), dim striped SILENCE TAIL at the right end with dashed left edge (`.gp-tail`). ✓
- [ ] Times `6:12` … `−3:48` — `.gp-times` Jost/`--bub` 12px 700. (existing) ✓
- [ ] Silence caption `тишина в конце · 0:20` centered between the times — `.gp-silence`, moon icon + `--bub`. ✓
- [ ] Transport: `-15` (`ti-rewind-backward-15`), round blue play/pause (`.gp-play`, `#9a7cff` → tint via `col`? canon is blue — set `.gp-play` bg to `col` optionally), `+15` (`ti-rewind-forward-15`). Ink-grammar Tabler, no emoji. ✓ (existing icons)
- [ ] Chrome dissolves during play: `.gp-playing` fades `.gp-title` + `.gp-cog`. ✓

PM mirror (right):
- [ ] Eyebrow `ВЕЧЕРНИЙ РИТУАЛ` + pip progress top-right — comes from the existing PM beat-dots (`app.js:4076`) + stage header; the canon's yellow lead-pip = `DOM.restore.light` active dot. ✓
- [ ] Heading `Вот день, который ты прожил` — Jost 800, white `.tfs-h`. Sub `не оценка — отражение` dim. ✓
- [ ] `6:30 Утро силы` = striped Move-orange kept tile (`tfStripe(D.c)`, dark ink text). ✓
- [ ] `12:30 Прогулка · ДРЕЙФ` = cool-gray `.pm-mblk.drift` + `ДРЕЙФ` tag. ✓
- [ ] `15:00 Аутрич · МИМО` = dashed ghost `.pm-mblk.miss` + `МИМО` tag, muted text. ✓
- [ ] `19:00 Спортзал` = striped green kept tile. ✓
- [ ] Now-line: pink dot + fading line + `сейчас · 22:40` (`.pm-nowrow`, `var(--pink)`). ✓
- [ ] Tally `4 из 6 прожито — ты держал линию` — `.pm-tally` Jost 800 16px, centered. ✓
- [ ] `Каким он был на вкус?` label. ✓
- [ ] Five jewel mood mini-rows `Туман/Тяжесть/Норм/Ясно/Сияние`, Tabler icons (`ti-cloud-fog/cloud/cloud-sun/sun/sparkles`), chunky ink-bordered chips, hard shadow, GOLD-RING (`var(--yellow)`) on the ignition-picked one + dark ink text (canon = «Ясно ✓» yellow). ✓
- [ ] Pink narrated door `К пере-сборке дня →` — `.pm-door`, `var(--pink)` fill, 3px ink border, `0 5px 0` hard shadow, dark-ink Jost 800, `ti-arrow-right`. ✓
- [ ] NO emoji anywhere — all Tabler `ti-*`. ✓
