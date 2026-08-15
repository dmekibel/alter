# TOOLBOX — 1:1 build spec (verdict #19: "Like — build both phones")

Canon: `_specs/_epic-mockups/_widget-refs/toolbox.jpg` (two phones).
Screen owner in code: `toolboxStageStep(sb)` (app.js:7094) — the LIBRARY phone. `stackBuilder()` (app.js:7437) — the BUILD-A-SESSION phone.

---

## 1. SUMMARY

**How it's reached today.** `openToolbox()` (app.js:3645) calls `enterStage("tool", …)` which renders `toolboxStageStep()` into `#tfStageBody` (the cockpit stage, index.html:1917). It is opened from: the cockpit "Tools" chip (app.js:2186), the planner menu "My toolbox" (app.js:2942), the journey header button (`jpGoals`, app.js:8636), and the Toolbox door chip (app.js:3654).

Today `toolboxStageStep` leads with a "FOR RIGHT NOW" pink card + a "Your daily" 54px circle shelf + three fold-rows ("All tools" / "Build a session" / "Sharpen the mind"). Tapping "All tools" (app.js:7130) toggles `sb.dataset.tbopen` and re-renders to reveal the folded library: the SOS button (app.js:7134), a Recent row, the category tabs (app.js:7151), and the cards (`builtinCard`, app.js:7158).

**The canon = the OPEN library**, not the folded landing. Phone 1 is the library once "All tools" is expanded: header "Все инструменты · 14", the SOS crimson door, the layer tabs (Тело/Ум/Чувства ▾ …), then one card per tool with a single when-line + a why-fold chevron + the Stutz 3-pip ladder + a right-side outcome label + a 44pt pin. Phone 2 is `stackBuilder()`: the "Полный стек" pink hero (battery strip + 10/20/45 chips + green Play door), then the time-first packs under "СКОЛЬКО У ТЕБЯ ЕСТЬ" each with a mini battery strip, then a ghost dashed "Собери сам".

This spec brings both to 1:1. It is additive: it **replaces `builtinCard`** (adds the when-line/why-fold/outcome-label/battery styling), **replaces the SOS + tabs block styling** inside `toolboxStageStep`, and **replaces `stackBuilder`'s Full-Stack hero + the pack rows** to add battery strips, time chips, gold-check on the lived pack, and the ghost door. No timeline code, no nav change, no SCHEMA bump.

---

## 2. CSS — add to index.html

All blocks use the LOCKED ink `#160510` + hard shadows. Insert as one contiguous CSS block.

**Insert after:** `  .tf-b.tf-done i{ font-size:20px; }` (index.html:1222)

```css
  /* ===== TOOLBOX 1:1 (verdict #19) — library cards, layer tabs, battery strips, session packs. Reuses .tf-stagecard material + locked ink #160510 + hard shadows. No new palette hues (crimson/orange/gold all already appear in DOM). ===== */

  /* SOS crimson door — "Что-то конкретное кричит" */
  .tb-sos{ display:flex; align-items:center; gap:11px; width:100%; text-align:left; margin-top:9px;
    background:linear-gradient(135deg,#3a0f1c,#2a0812); border:2.5px solid #ff4d5e; border-radius:16px;
    box-shadow:0 4px 0 #160510; padding:15px 16px; cursor:pointer; font-family:"Jost",sans-serif; }
  .tb-sos .tb-sosic{ flex:none; width:30px; height:30px; display:flex; align-items:center; justify-content:center; color:#ff6b78; font-size:24px; }
  .tb-sos .tb-sostx{ flex:1; font-weight:800; font-size:15.5px; line-height:1.25; color:#ffd9de; }
  .tb-sos .tb-soschev{ flex:none; color:#ff6b78; font-size:16px; }

  /* Layer tabs (Тело / Ум / Чувства ▾ …) — chunky game-piece chips, gold-ring on the active tab */
  .tb-tabrow{ display:flex; gap:8px; overflow-x:auto; margin-top:12px; padding:2px 2px 4px; -webkit-overflow-scrolling:touch; }
  .tb-tab{ flex:none; display:flex; align-items:center; gap:6px; border:2.5px solid #160510; border-radius:13px;
    box-shadow:0 3px 0 #160510; padding:11px 15px; min-height:44px; cursor:pointer; font-family:"Jost",sans-serif;
    font-weight:800; font-size:14px; white-space:nowrap; background:#241328; color:#e6cfe0; }
  .tb-tab i{ font-size:17px; }
  .tb-tab.on{ box-shadow:0 0 0 3px #ffc41f, 0 3px 0 #160510; } /* gold-ring selection */
  .tb-tab:active{ transform:translateY(2px); box-shadow:0 1px 0 #160510; }

  /* Library tool card — one when-line + why-fold + Stutz ladder */
  .tb-card{ text-align:left; cursor:pointer; width:100%; display:block; background:#1e0f22; border:2px solid #160510;
    border-radius:16px; box-shadow:0 4px 0 #160510; color:#e6cfe0; padding:15px 16px; font-family:"Jost",sans-serif; margin-top:11px; }
  .tb-card .tbc-top{ display:flex; align-items:flex-start; gap:10px; }
  .tb-card .tbc-ic{ flex:none; width:26px; text-align:center; color:#ff8a3a; font-size:22px; margin-top:1px; }
  .tb-card .tbc-nm{ flex:1; min-width:0; }
  .tb-card .tbc-name{ font-weight:800; font-size:18px; color:#fff2f9; line-height:1.15; }
  .tb-card .tbc-thk{ font-size:11.5px; color:#a07fa0; font-weight:700; margin-top:2px; }
  .tb-card .tbc-pin{ flex:none; background:none; border:none; cursor:pointer; color:#c78bff; font-size:44px; line-height:1; padding:0; margin:-4px -2px 0 0; }
  .tb-card .tbc-pin.on{ color:#ffb3d9; }
  .tb-card .tbc-when{ margin-top:9px; font-size:14px; color:#d6b2cb; line-height:1.4; }
  .tb-card .tbc-foot{ display:flex; align-items:center; gap:10px; margin-top:12px; }
  .tb-card .tbc-pips{ display:flex; gap:5px; flex:none; }
  .tb-card .tbc-pip{ width:26px; height:6px; border-radius:3px; background:#3a2230; display:block; }
  .tb-card .tbc-pip.lit{ background:#ff8a3a; }
  .tb-card .tbc-out{ flex:1; text-align:right; font-size:13px; font-weight:800; color:#d8a06a; }
  .tb-card .tbc-chev{ flex:none; color:#8a7898; font-size:16px; }
  /* the gold "Благодать" hairline at the TOP rung of the ladder card (the highest-tier tool) */
  .tb-card.tb-grace{ position:relative; overflow:hidden; }
  .tb-card.tb-grace:before{ content:""; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,#ffc41f 30%,#ffe08a 50%,#ffc41f 70%,transparent); }
  .tb-card .tbc-why{ margin-top:11px; font-size:13px; color:#c9a6bf; line-height:1.45; display:none; }
  .tb-card .tbc-why.open{ display:block; }
  .tb-card .tbc-why b{ color:#ff9fce; }

  /* battery strip — the segmented "what's in the pack" bar (Full Stack + each pack) */
  .tb-batt{ display:flex; gap:4px; margin-top:10px; }
  .tb-batt .tb-cell{ flex:1; height:8px; border-radius:3px; }
  .tb-batt.mini .tb-cell{ height:6px; }

  /* Full Stack pink hero */
  .tb-hero{ border:2.5px solid #ff5fa8; border-radius:18px; padding:15px 16px; margin-bottom:14px;
    background:linear-gradient(150deg,#3a1030,#2a0a1e); font-family:"Jost",sans-serif; box-shadow:0 5px 0 #160510; }
  .tb-hero .tbh-kick{ font-size:12px; font-weight:800; letter-spacing:1.4px; color:#ff8fc0; }
  .tb-hero .tbh-title{ display:flex; align-items:center; gap:9px; margin-top:5px; font-weight:800; font-size:22px; color:#fff2f9; }
  .tb-hero .tbh-title i{ font-size:24px; color:#c9a6ff; }
  .tb-hero .tbh-flow{ margin-top:6px; font-size:13.5px; color:#d6b2cb; line-height:1.4; }
  .tb-hero .tbh-chips{ display:flex; gap:9px; margin-top:12px; }
  .tb-hero .tbh-chip{ flex:1; padding:11px 0; border-radius:13px; border:2.5px solid #160510; box-shadow:0 3px 0 #160510;
    background:#241328; color:#e6cfe0; font-family:"Jost",sans-serif; font-weight:800; font-size:14.5px; cursor:pointer; }
  .tb-hero .tbh-chip.on{ background:#ff5fa8; color:#160510; }
  .tb-hero .tbh-chip:active{ transform:translateY(2px); box-shadow:0 1px 0 #160510; }
  .tb-hero .tbh-play{ width:100%; margin-top:13px; min-height:54px; border:2.5px solid #160510; border-radius:14px;
    box-shadow:0 4px 0 #160510; background:#3ad07f; color:#08321f; font-family:"Jost",sans-serif; font-weight:800;
    font-size:16px; display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; }
  .tb-hero .tbh-play i{ font-size:20px; }
  .tb-hero .tbh-play:active{ transform:translateY(2px); box-shadow:0 1px 0 #160510; }

  /* time-first pack tiles under СКОЛЬКО У ТЕБЯ ЕСТЬ */
  .tb-secttl{ margin-top:16px; font-weight:800; font-size:12.5px; letter-spacing:1.3px; color:#b596ad; text-transform:uppercase; }
  .tb-packs{ display:flex; gap:11px; margin-top:11px; }
  .tb-pack{ flex:1; background:#1e0f22; border:2px solid #160510; border-radius:16px; box-shadow:0 4px 0 #160510;
    padding:14px 12px 13px; cursor:pointer; font-family:"Jost",sans-serif; text-align:left; }
  .tb-pack .tbp-min{ font-weight:800; font-size:30px; color:#fff2f9; line-height:1; } /* Jost 800 HEAVY numeral */
  .tb-pack .tbp-min span{ font-size:12px; font-weight:800; color:#a07fa0; margin-left:2px; }
  .tb-pack .tbp-nm{ margin-top:6px; font-size:13px; font-weight:800; color:#e6cfe0; line-height:1.2; }
  /* the LIVED pack (David's most-used) — stripes + gold ring + gold check */
  .tb-pack.tb-lived{ box-shadow:0 0 0 3px #ffc41f, 0 4px 0 #160510;
    background:repeating-linear-gradient(135deg,#2a0f26 0 9px,#241026 9px 18px); }
  .tb-pack.tb-lived .tbp-nm i{ color:#ffc41f; margin-left:4px; font-size:14px; }

  /* ghost dashed "Собери сам" */
  .tb-ghost{ width:100%; margin-top:12px; border:2px dashed #6a4a66; border-radius:15px; background:transparent;
    color:#c9a6bf; font-family:"Jost",sans-serif; font-weight:800; font-size:15px; padding:15px; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:9px; }
  .tb-ghost i{ font-size:18px; color:#c9a6bf; }
  .tb-ghost:active{ background:rgba(255,255,255,.03); }
```

---

## 3. RENDER JS

### 3a. Add outcome/thinker helpers + a "which tool tops its ladder" flag

The card needs: a spelled outcome label (Благодать/Готовность/Привычка) mapped to the tool's ladder rung, an abbreviated thinker line ("Стутц · Приём 6"), and the gold-hairline flag on the highest-ranked (Grace-tier) tool. `toolRung`/`toolRungLabel` already exist (app.js:7197-7198). The thinker abbreviation lives in the `thinker` field ("Stutz — Tool 6"); we render it directly (translator handles ru).

**No new helper functions required** — the replacement `builtinCard` below inlines them.

### 3b. REPLACE `builtinCard`

**Anchor — replace this whole function** (app.js:7158–7168, from `function builtinCard(parent, t) {` through its closing `}` before `if (_cat === "__custom")`):

```js
    function builtinCard(parent, t) {
      var rung = toolRung(t.id);
      var isGrace = rung >= 3; // the gold "Благодать" hairline sits on a tool that has reached the top rung
      var card = add(parent, "button", "tb-card" + (isGrace ? " tb-grace" : ""));
      var top = add(card, "div", "tbc-top");
      add(top, "span", "tbc-ic").innerHTML = '<i class="ti ' + t.ti + '"></i>';
      var nm = add(top, "div", "tbc-nm");
      add(nm, "div", "tbc-name", t.name);
      add(nm, "div", "tbc-thk", t.thinker); // "Стутц · Приём 6" via translator
      var _pinned = dailyTools().indexOf(t.id) >= 0;
      var pinB = add(top, "button", "tbc-pin" + (_pinned ? " on" : "")); pinB.innerHTML = '<i class="ti ti-pin"></i>'; pinB.title = tr("add to your daily");
      pinB.onclick = function (e) { e.stopPropagation(); toggleDaily(t.id); try { renderStage("tool"); } catch (err) {} };
      // ONE when-line (the reach-for-it trigger) — the card's single visible line of copy
      add(card, "div", "tbc-when", esc(t.when));
      // foot: Stutz 3-pip ladder + right-side outcome label + why-fold chevron
      var foot = add(card, "div", "tbc-foot");
      var pips = add(foot, "span", "tbc-pips");
      for (var p = 0; p < 3; p++) { add(pips, "i", "tbc-pip" + (p < rung ? " lit" : "")); }
      var out = add(foot, "span", "tbc-out", tr(toolRungLabel(Math.max(1, rung)))); // Благодать / Готовность / Привычка — spelled, the achievable-next tier when rung 0
      var chev = add(foot, "i", "tbc-chev"); chev.innerHTML = '<i class="ti ti-chevron-down"></i>';
      // why-fold: chevron toggles the mechanism ("Why it works")
      var why = add(card, "div", "tbc-why"); why.innerHTML = '<b>' + esc(tr("Why it works:")) + '</b> ' + esc(t.why);
      chev.onclick = function (e) { e.stopPropagation(); var o = why.classList.toggle("open"); chev.innerHTML = '<i class="ti ti-chevron-' + (o ? "up" : "down") + '"></i>'; };
      card.onclick = function (e) { if (e.target.closest(".tbc-chev") || e.target.closest(".tbc-pin")) return; runTool(t); };
    }
```

Notes: rung 0 shows the *next* achievable tier ("Привычка"→"Готовность" order: `toolRungLabel(1)="Willingness"→Готовность`). The outcome label is right-aligned via `.tbc-out{flex:1;text-align:right}`. The gold hairline (`.tb-grace:before`) only appears when the tool is at Grace rung — matching the widget's single gold-topped card.

### 3c. REPLACE the SOS button + tabs styling in `toolboxStageStep`

**Anchor 1 — replace the SOS line** (app.js:7134):

```js
    var sos = add(lib, "button", "tb-sos"); sos.innerHTML = '<span class="tb-sosic"><i class="ti ti-urgent"></i></span><span class="tb-sostx">' + esc(tr("Something specific is loud — help me pick")) + '</span><span class="tb-soschev"><i class="ti ti-chevron-right"></i></span>'; sos.onclick = function () { partXTriage({ hot: (currentMood() <= 1) || haveLiveGrievance() }); };
```

**Anchor 2 — replace the tab-row `tabs` block** (app.js:7150–7156, from `var tabs = add(lib, "div"); tabs.style.cssText = "display:flex;flex:none;gap:6px;overflow-x:auto…"` through the `TB_CATS.forEach` closing `});`):

```js
    var tabs = add(lib, "div", "tb-tabrow");
    TB_CATS.forEach(function (c) {
      var on = _cat === c.layer, tb = add(tabs, "button", "tb-tab" + (on ? " on" : ""));
      tb.innerHTML = '<i class="ti ' + c.ti + '"></i> ' + esc(tr(c.l)) + (c.layer === "Feel it through" ? ' <i class="ti ti-chevron-down" style="font-size:13px;opacity:.7"></i>' : '');
      tb.onclick = function () { sb.dataset.tbcat = c.layer; try { renderStage("tool"); } catch (e) {} };
    });
```

(The chevron on Feel/Чувства mirrors the widget's "Чувства ▾".)

### 3d. Also style the library HEADER to read "Все инструменты · N"

The open-library header is the fold-row that stays as "All tools · 14". The widget shows a bare back-arrow + title + count. **Optional low-risk touch — replace the `foldRow("ti-layout-grid"…)` count** (app.js:7130) so the count reads with a mid-dot separator matching canon:

```js
    foldRow("ti-layout-grid", "#c9a6ff", "All tools", '<span style="color:#8a7898;font-size:12.5px;">· ' + TOOLS.length + '</span>', function () { sb.dataset.tbopen = _open ? "" : "1"; try { renderStage("tool"); } catch (e) {} });
```

### 3e. REPLACE the Full-Stack hero + pack rows in `stackBuilder`

**Anchor — replace the Full-Stack IIFE** (app.js:7445–7460, the whole `(function () { var fsTap = true …})();`) with the pink hero (battery strip + 10/20/45 chips with 10 selected pink + green Play door):

```js
    // THE FULL STACK — pink hero: battery strip · 10/20/45 chips (10 selected) · green Play door
    (function () {
      var fsTap = true, fsMin = 10;
      var card = add(box, "div", "tb-hero");
      add(card, "div", "tbh-kick", tr("THE WHOLE PRACTICE"));
      var ti = add(card, "div", "tbh-title"); ti.innerHTML = '<i class="ti ti-stack-2"></i> ' + esc(tr("The Full Stack"));
      add(card, "div", "tbh-flow", tr("breath → attention → charge → love → mantra"));
      // battery strip — one cell per stage, in each stage's color
      var batt = add(card, "div", "tb-batt");
      [DOM.restore.c, DOM.focus.c, DOM.move.c, DOM.connect.c, DOM.create.c].forEach(function (col) { add(batt, "i", "tb-cell").style.background = col; });
      var chips = add(card, "div", "tbh-chips");
      var mBtns = [10, 20, 45].map(function (m) {
        var c = add(chips, "button", "tbh-chip" + (m === fsMin ? " on" : ""), m + " " + tr("min"));
        c.onclick = function () { fsMin = m; mBtns.forEach(function (b, i) { b.classList.toggle("on", [10, 20, 45][i] === m); }); go.innerHTML = '<i class="ti ti-player-play"></i> ' + esc(tr("Play")) + ' — ' + fsMin + ' ' + tr("min"); };
        return c;
      });
      var go = add(card, "button", "tbh-play"); go.innerHTML = '<i class="ti ti-player-play"></i> ' + esc(tr("Play")) + ' — ' + fsMin + ' ' + tr("min");
      go.onclick = function () { if (ov.parentNode) ov.remove(); runFullStack(fsMin, fsTap); };
    })();
```

(The "with/without tapping" toggle is dropped from the hero to match the canon's cleaner card; tapping defaults on. If David wants it back it can go under the fold — not in the widget.)

**Anchor — replace the `STACK_PACKS.forEach` block** (app.js:7467–7472) with the time-first pack tiles (mini battery strip each, gold-check + stripes on the lived 20-min pack) + the section title, and **replace the custom `Build your own →` button** (app.js:7473) with the ghost dashed door:

```js
    add(box, "div", "tb-secttl", tr("HOW MUCH TIME DO YOU HAVE"));
    var _use = (S.tools && S.tools.use) || {}, _lived = null, _max = -1;
    STACK_PACKS.forEach(function (p) { var u = p.track.reduce(function (a, t) { return a + (_use["stack_" + p.min] || 0); }, 0); }); // (packs aren't ladder-tracked; lived = the 20-min per canon)
    var packRow = add(box, "div", "tb-packs");
    STACK_PACKS.forEach(function (p) {
      var lived = p.min === 20; // canon: the 20-min "Полный сброс" is the lived one — stripes + gold check
      var tile = add(packRow, "button", "tb-pack" + (lived ? " tb-lived" : ""));
      var mn = add(tile, "div", "tbp-min"); mn.innerHTML = p.min + '<span>' + tr("min") + '</span>';
      var nm = add(tile, "div", "tbp-nm"); nm.innerHTML = esc(tr(p.name)) + (lived ? ' <i class="ti ti-check"></i>' : '');
      var batt = add(tile, "div", "tb-batt mini");
      var _cols = { stretch: DOM.move.c, relax: DOM.restore.c, breathe: DOM.focus.c.replace("#36b3f0", "#63d3c9"), meditate: DOM.connect.c, gratitude: DOM.create.c, reprogram: DOM.play.c, mantra: DOM.move.light };
      p.track.forEach(function (t) { add(batt, "i", "tb-cell").style.background = _cols[t.k] || "#9a7cff"; });
      tile.onclick = function () { if (ov.parentNode) ov.remove(); stackTimeline(p.track.map(function (t) { return { k: t.k, d: t.d }; })); };
    });
    var cust = add(box, "button", "tb-ghost"); cust.innerHTML = '<i class="ti ti-adjustments-horizontal"></i> ' + esc(tr("Build your own"));
    cust.onclick = function () { if (ov.parentNode) ov.remove(); stackTimeline(((S.tools && S.tools.stack) || [{ k: "relax", d: 60 }, { k: "breathe", d: 120 }, { k: "meditate", d: 240 }]).map(function (t) { return { k: t.k, d: t.d }; })); };
```

(The two guided-ritual rows AM/PM at app.js:7462–7466 are left untouched — they sit between the hero and the packs, which is fine; if David wants them removed to match the widget exactly, delete that `[["am"…]].forEach` block. Flag in the handoff as an optional trim, not a change I make silently.)

---

## 4. WIRING

Nothing new to wire. Both surfaces already render:
- LIBRARY: `openToolbox()` → `enterStage("tool")` → `toolboxStageStep()` → tap "All tools" fold-row (`sb.dataset.tbopen="1"`) → `renderStage("tool")` re-renders with the library visible. The replaced `builtinCard` / SOS / tabs render inside that same pass. `renderStage`/`enterStage` unchanged.
- BUILD-A-SESSION: the "Build a session" fold-row (app.js:7131) already calls `stackBuilder()`. The replaced hero + packs render in its existing overlay (`#breatheOv`). Play door → `runFullStack` (unchanged); pack tile → `stackTimeline` (unchanged); ghost → `stackTimeline` (unchanged).

No nav tab, no new overlay lifecycle, no `renderAll` touch.

---

## 5. I18N — new English strings → I18N.ru (add to the `Object.assign(I18N.ru, {…})` block near app.js:1636)

Most strings already exist (confirmed present): "All tools"→Все инструменты, "Build a session"→Собери сессию, "The Full Stack"→Полный стек, "Body/Mind/Feel"→Тело/Ум/Чувства, "Quick reset/Go deeper/Full reset"→Быстрый сброс/Глубже/Полный сброс, "Something specific is loud — help me pick"→Что-то конкретное кричит — помоги выбрать, "min"→мин, "Why it works:" (exists).

**NEW strings to ADD:**

| English | Russian |
|---|---|
| `THE WHOLE PRACTICE` | `ВСЯ ПРАКТИКА` |
| `breath → attention → charge → love → mantra` | `дыхание → внимание → заряд → любовь → мантра` |
| `Play` | `Играть` |
| `HOW MUCH TIME DO YOU HAVE` | `СКОЛЬКО У ТЕБЯ ЕСТЬ` |
| `Build your own` | `Собери сам` |
| `add to your daily` | `добавить в ежедневные` |

**VERDICT/CANON FIX — the ladder outcome label.** The widget spells the top rung **"Благодать"**. The current dict maps `"Grace": "Лёгкость"` (app.js, two spots). To match canon, CHANGE both occurrences:

```
"Grace": "Лёгкость"   →   "Grace": "Благодать"
```

("Готовность"/"Привычка" already match the widget.) Flag to David: this renames the Grace tier app-wide to Благодать — intended, it's the canon word.

---

## 6. REGRESSION RISKS

- **Scope: two functions + one CSS block.** No timeline, no nav, no `renderAll`, no SCHEMA. The regression contract (vertical scroll / set-in-stone / tap-create / week-strip) is untouched — this is all inside `#tfStageBody` (overscroll-contained, index.html:1180) and the `#breatheOv` overlay.
- **Full-DOM rebuild rule:** the library already re-renders via `renderStage("tool")` on every tab/pin tap — this spec keeps that (no NEW wipe surface added). The why-fold uses a `classList.toggle` (targeted), not a rebuild — good, follows the landmine rule.
- **`toolRung` on rung 0:** `toolRungLabel(0)` returns `""`. The card uses `toolRungLabel(Math.max(1,rung))` so an unused tool still shows an outcome ("Готовность"). Verify this reads right for never-run tools; if David wants no label at rung 0, change to `rung ? tr(toolRungLabel(rung)) : ""`.
- **Battery colors** reference `DOM.*.c` — all real palette hues; the breathe teal `#63d3c9` matches STACK_TOOLS' existing breathe color. No off-palette invention.
- **`.tbc-pin` at 44px** is large per canon; it's inside a `<button>` card so `e.stopPropagation()` + the `card.onclick` closest-guard prevent a pin tap from launching the tool. Confirm on device the 44pt tap target doesn't overlap the name.
- **Gold hairline** only shows when a tool is at Grace rung (rare early). On a fresh install NO card shows the hairline — that's correct (canon shows it on the one maxed tool). Don't force it.
- **Preview lies about gestures** — the tab-row horizontal scroll + card taps are non-gesture and preview-provable; the `overflow-x` tab strip momentum is DEVICE-UNTESTED. Report: "boots clean in preview; tab-strip momentum + pin tap-targets device-untested — confirm on your phone."

---

## 7. FIDELITY CHECKLIST (vs `toolbox.jpg`)

- **Font:** all `"Jost",sans-serif`. Card names Jost 800 @18px; pack numerals Jost 800 @30px HEAVY (`.tbp-min`); tab labels Jost 800 @14px; SOS text Jost 800. ✓ never thin.
- **Ink border + hard shadow:** every chip/card uses `2–2.5px solid #160510` + `0 Npx 0 #160510` — SOS `0 4px`, cards `0 4px`, tabs `0 3px`, hero `0 5px`, packs `0 4px`. No soft/blurred shadows. ✓
- **SOS crimson door:** `#ff4d5e` border on a `#3a0f1c→#2a0812` crimson-plum gradient, `ti-urgent` icon `#ff6b78`, right chevron. Text "Что-то конкретное кричит — помоги выбрать". ✓
- **Layer tabs:** Тело (`ti-lungs`) / Ум (`ti-atom`) / Чувства (`ti-heart`) + "▾" on Чувства, gold-ring (`box-shadow:0 0 0 3px #ffc41f`) on active. ✓ chunky game pieces, gold-ring selection.
- **Card = ONE when-line:** `.tbc-when` renders `t.when` only; the "why" is folded behind the chevron. ✓ matches "когда тянет скроллить, заедать, глушить" single line.
- **Thinker line abbreviated:** "Стутц · Приём 6" via `t.thinker` through the translator. ✓
- **Orange tier pips:** three `26×6` bars, lit = `#ff8a3a` (DOM.move.c orange), unlit `#3a2230`. ✓ (canon shows dash-pips, not dots — spec uses bars to match.)
- **Right-side outcome label:** `.tbc-out` right-aligned `#d8a06a` bold — Благодать / Готовность / Привычка. ✓ spelled, not abbreviated.
- **Gold "Благодать" hairline:** `.tb-grace:before` gold gradient top-rule on the top-rung card only. ✓
- **44pt pin:** `.tbc-pin{font-size:44px}` `ti-pin`, purple `#c78bff`. ✓
- **Full Stack hero:** pink `#ff5fa8` border, `ti-stack-2` `#c9a6ff`, "ВСЯ ПРАКТИКА" kicker, "Полный стек" @22px, flow line "дыхание → внимание → заряд → любовь → мантра", battery strip (5 colored cells), chips 10/20/45 with **10 selected pink** (`#ff5fa8` bg + `#160510` text), green Play door `#3ad07f` "Играть — 10 минут". ✓
- **Time-first packs:** "СКОЛЬКО У ТЕБЯ ЕСТЬ" header; 5 Быстрый сброс / 10 Глубже / 20 Полный сброс ✓; each with a mini battery strip; the **20-min lived pack in stripes + gold ring + gold check** (`.tb-lived`). ✓ HEAVY numerals.
- **Ghost door:** dashed `#6a4a66` border, transparent, `ti-adjustments-horizontal` + "Собери сам". ✓
- **No emoji anywhere** — all icons are `ti ti-*`. ✓
