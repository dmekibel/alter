# HABITS — Duolingo stone-path rebuild (mock 14 + verdict #14 fixes)

Paste-ready build spec. Single-file app: all CSS → `index.html`, all JS → `app.js`. Integrator hand-applies + screenshots on device.

---

## 1. SUMMARY

**What it is:** A vertical Duolingo-style **stone path** of the user's habits (the canon in `_specs/_epic-mockups/_widget-refs/habits.jpg`). Each habit is a big round striped domain-color stone threaded on a dotted spine. **DONE** = full bright diagonal stripes + a green check chip + a flame/ember tier pip. **UNDONE** = matte dark-tint stone with a solid colored border + the icon in the domain color. Under each stone: title (Jost 800) + a **mirror line** in the domain-light color (`×23 — огонь стал синим`). X/week habits show weekly **dot-pips** (`● ● ○`) instead of a streak flame. Header: `Привычки · N из M сегодня` + a pink→purple progress bar + the `⚡ 82` spark pill. Bottom legend: `нить: ● 2–6  🔥 7–20  🔥 21+`.

**How it's reached today (grepped):**
- `renderHabits()` at **app.js:6482** writes to `#habitList` / `#habitProg` — but those IDs exist **nowhere in index.html**. `renderHabits()` is **dead code** (called by `renderAll()` at app.js:6510 but no-ops because `el("habitList")` is null). Safe to replace wholesale.
- The **live** habits UI is `habitsSheet()` at **app.js:2685** — a bento-style **manager** (add/remove/sub-habits), opened from:
  - the Notebook item `{ ic: "ti-checkup-list", l: "Habits", … fn: habitsSheet }` (app.js:2750), and
  - `#goHabits` in the Goals tab (`_gh.onclick = habitsSheet`, app.js:8607; markup index.html:1822).

**Decision (per verdict #14 "decide where this path renders"):** The stone path becomes the **primary Habits view** — a full-screen overlay reusing the existing `.bento-ov / .bento-card` shell (same shell the manager uses, so nav + z-index + safe-area are already solved). We add a new `habitPathSheet()` and repoint the two existing entry points to it. The old `habitsSheet()` manager stays reachable via a small **pencil (edit)** button in the path header — nothing is deleted, so add/remove/sub-habits all survive. `renderHabits()` is rewritten to be a harmless no-op guard (kept so `renderAll()` doesn't throw).

---

## 2. CSS — add to index.html

All colors come from the LOCKED palette / `DOM[d]` (orange `#ff8a3a` move, green `#34d39a` nourish, blue `#36b3f0` focus, purple `#b07aff` create, pink `#ff5fa0` connect, gold `#d99f30` play, teal `#2ab8c4` restore, slate `#7f9bc4` upkeep). Ink border = `#160510`. Hard shadows only. Stripes are a `repeating-linear-gradient` mixing the domain color with a lighter tint of itself.

**Insert after (index.html:881)** — the line:
```
  .habit-del:hover{ opacity:1; }
```

```css
  /* ============ HABITS STONE PATH (mock 14 + verdict #14: white icons, densified rhythm) ============ */
  .hp-body{ overflow:auto; -webkit-overflow-scrolling:touch; flex:1 1 auto; min-height:0; overscroll-behavior:contain; touch-action:pan-y; padding:2px 0 4px; }
  .hp-headwrap{ padding:2px 16px 10px; flex:none; }
  .hp-title{ font-family:"Jost",sans-serif; font-weight:800; font-size:26px; color:#fff; letter-spacing:.2px; line-height:1.05; }
  .hp-sub{ font-family:"Jost",sans-serif; font-weight:700; font-size:13px; color:#c9a6d6; margin-top:2px; }
  .hp-sparkpill{ font-family:"Jost",sans-serif; font-weight:800; font-size:15px; color:#ffd76a; background:#3a0f24; border:3px solid #160510; border-radius:14px; padding:5px 11px; box-shadow:0 3px 0 #160510; display:inline-flex; align-items:center; gap:5px; }
  .hp-sparkpill i{ color:#ffd76a; }
  .hp-progwrap{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:2px; }
  .hp-prog{ flex:1; height:8px; border-radius:6px; background:#3a1230; overflow:hidden; }
  .hp-prog > i{ display:block; height:100%; border-radius:6px; background:linear-gradient(90deg,#ff5fa8,#b07aff); transition:width .4s var(--ease-spring); }

  /* the threaded path — stones stacked; verdict #14 fix ②: DENSE rhythm (small gap, big stones) */
  .hp-path{ display:flex; flex-direction:column; align-items:center; padding:6px 0 2px; position:relative; }
  .hp-stonewrap{ display:flex; flex-direction:column; align-items:center; width:100%; }
  .hp-spine{ width:0; height:26px; border-left:4px dotted #4a2a44; margin:1px 0; }   /* short dotted connector — tight */

  .hp-stone{ position:relative; width:118px; height:118px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:5px solid #160510; box-shadow:0 7px 0 #160510; cursor:pointer; }
  .hp-stone i.hp-ic{ font-size:52px; color:#fff; }   /* verdict #14 fix ①: WHITE icon on the bright stripes (never ink-dark) */
  .hp-stone.undone{ box-shadow:0 6px 0 #160510; }
  .hp-stone.undone i.hp-ic{ /* on matte stones the icon takes the domain-LIGHT tint, set inline */ }

  /* green DONE check chip, top-right */
  .hp-check{ position:absolute; top:-4px; right:-4px; width:34px; height:34px; border-radius:50%; background:#2fd07a; border:4px solid #160510; box-shadow:0 3px 0 #160510; display:flex; align-items:center; justify-content:center; }
  .hp-check i{ font-size:18px; color:#0a3a20; }

  /* tier pip (ember→flame→blue-flame), bottom-right */
  .hp-pip{ position:absolute; bottom:-2px; right:6px; width:30px; height:30px; border-radius:50%; border:3px solid #160510; box-shadow:0 3px 0 #160510; display:flex; align-items:center; justify-content:center; background:#2a0d1c; }
  .hp-pip i{ font-size:15px; }
  .hp-pip.ember  i{ color:#e0791c; }   /* 2–6  · dot/ember */
  .hp-pip.flame  i{ color:#ff6a1e; }   /* 7–20 · orange flame */
  .hp-pip.blue   i{ color:#4db8ff; }   /* 21+  · blue flame */

  .hp-label{ font-family:"Jost",sans-serif; font-weight:800; font-size:18px; color:#fff; margin-top:9px; text-align:center; }
  .hp-mirror{ font-family:"Jost",sans-serif; font-weight:700; font-size:13px; margin-top:1px; text-align:center; max-width:280px; line-height:1.25; }  /* color set inline = DOM[d].light */

  /* weekly X/week dot-pips (Read: ● ● ○) */
  .hp-wk{ display:flex; gap:7px; margin-top:8px; }
  .hp-wk i{ width:9px; height:9px; border-radius:50%; background:#3a1230; border:2px solid #160510; }

  /* bottom legend */
  .hp-legend{ display:flex; align-items:center; justify-content:center; gap:14px; padding:14px 12px 6px; font-family:"Jost",sans-serif; font-weight:700; font-size:12px; color:#9a7ba6; }
  .hp-legend b{ color:#c9a6d6; margin-right:4px; font-weight:800; }
  .hp-legend span{ display:inline-flex; align-items:center; gap:4px; }
  .hp-legend .lg-ember{ color:#e0791c; } .hp-legend .lg-flame{ color:#ff6a1e; } .hp-legend .lg-blue{ color:#4db8ff; }

  /* header edit (pencil) → the old manager */
  .hp-edit{ background:#3a0f24; border:3px solid #160510; border-radius:12px; box-shadow:0 3px 0 #160510; color:#e6b8d6; width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
  .hp-edit i{ font-size:18px; }
```

**Stripes are applied inline in JS** (so the exact per-domain hex mix is data-driven via `mixHex`), not in CSS — see RENDER JS.

---

## 3. RENDER JS

### 3a. Replace the dead `renderHabits()` with a no-op guard.

**Anchor — replace the entire function** at app.js:6482–6495 (from `function renderHabits() {` through its closing `}` that ends with `el("habitProg").textContent = …`). Replace with:

```js
  function renderHabits() { /* stone path is a modal (habitPathSheet); nothing to draw inline. Kept so renderAll() never throws. */ }
```

### 3b. Add the stone-path helpers + sheet.

**Insert immediately AFTER** the new `renderHabits()` no-op (i.e. before `function toggleHabit(id)` at app.js:6496):

```js
  // ---- HABITS STONE PATH (mock 14 · verdict #14: white icons + dense rhythm) ----
  // Tier by streak length → pip class + a per-habit mirror line. Thresholds match the legend (2–6 / 7–20 / 21+).
  function habTier(n) { if (n >= 21) return "blue"; if (n >= 7) return "flame"; return "ember"; }
  function habPipIcon(t) { return t === "ember" ? "ti-flame" : "ti-flame"; } // all flame glyphs; color differs by tier (ember/flame/blue via class)
  function habMirror(hb, sk, dom) {
    var D = DOM[dom];
    if (hb.per > 0) { var wk = weekDone(hb.id); return { txt: tr(hb.per + "× в неделю") + " · " + wk + " из " + hb.per, col: D.light }; }
    if (sk >= 21) return { txt: "×" + sk + " — " + tr("огонь стал синим"), col: D.light };
    if (sk >= 12) return { txt: tr("день") + " " + sk + " " + tr("этой нити — один тап держит её"), col: D.light };
    if (sk >= 2)  return { txt: "×" + sk + " — " + tr("уголёк тлеет"), col: D.light };
    return { txt: tr("новая нить — начни сегодня"), col: mixHex(D.light, "#160510", 0.35) };
  }
  // striped fill for a DONE stone: bright diagonal stripes = domain color ↔ a lighter tint of itself
  function habStripe(dom) { var D = DOM[dom]; var a = D.c, b = mixHex(D.c, "#ffffff", 0.28); return "repeating-linear-gradient(135deg," + a + " 0 14px," + b + " 14px 28px)"; }

  function habitPathSheet() {
    var dm = doneMap(todayK()), done = 0;
    S.habits.forEach(function (hb) { if (dm[hb.id]) done++; });
    var ov = add(document.body, "div", "bento-ov"), card = add(ov, "div", "bento-card");
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });

    // HEADER
    var head = add(card, "div", "bento-head");
    var htl = add(head, "div"); add(htl, "div", "hp-title", tr("Привычки"));
    add(htl, "div", "hp-sub", done + " " + tr("из") + " " + S.habits.length + " " + tr("сегодня"));
    var hr = add(head, "div"); hr.style.cssText = "display:flex;align-items:center;gap:8px;";
    var spk = add(hr, "span", "hp-sparkpill"); spk.innerHTML = '<i class="ti ti-bolt"></i> ' + (S.game && S.game.spark || 0);
    var edit = add(hr, "button", "hp-edit"); edit.innerHTML = '<i class="ti ti-pencil"></i>'; edit.title = tr("изменить"); edit.onclick = function () { ov.remove(); habitsSheet(); };
    var xb = add(hr, "button", "bento-x"); xb.innerHTML = '<i class="ti ti-x"></i>'; xb.onclick = function () { ov.remove(); };

    // progress bar
    var pw = add(card, "div", "hp-headwrap"); var pr = add(pw, "div", "hp-progwrap"); var bar = add(pr, "div", "hp-prog"); var fill = add(bar, "i"); fill.style.width = (S.habits.length ? Math.round(done / S.habits.length * 100) : 0) + "%";

    var body = add(card, "div", "bento-body hp-body");
    var path = add(body, "div", "hp-path");

    S.habits.forEach(function (hb, idx) {
      var on = !!dm[hb.id], dom = domainOf({ title: hb.l, habitId: hb.id }), D = DOM[dom];
      var sk = streak(hb.id), tier = habTier(sk);
      var w = add(path, "div", "hp-stonewrap");
      if (idx > 0) w.insertBefore(document.createElement("div"), w.firstChild); // spacer noop (kept simple)

      var stone = add(w, "div", "hp-stone" + (on ? " done" : " undone"));
      if (on) { stone.style.background = habStripe(dom); }
      else { stone.style.background = mixHex(D.c, "#160510", 0.72); stone.style.borderColor = "#160510"; stone.style.boxShadow = "0 6px 0 #160510, inset 0 0 0 4px " + D.c; }
      var ic = add(stone, "i", "hp-ic ti " + tiClass({ title: hb.l, habitId: hb.id }));
      ic.style.color = on ? "#ffffff" : D.light; // verdict #14 fix ①: white on stripes, light-tint on matte

      if (on) { var ck = add(stone, "div", "hp-check"); ck.innerHTML = '<i class="ti ti-check"></i>'; }
      if (hb.per === 0 && sk >= 2) { var pip = add(stone, "div", "hp-pip " + tier); pip.innerHTML = '<i class="ti ' + habPipIcon(tier) + '"></i>'; }
      stone.onclick = function () { toggleHabit(hb.id); ov.remove(); habitPathSheet(); }; // re-render the path in place

      add(w, "div", "hp-label", esc(hb.l));
      if (hb.per > 0) { var wk = weekDone(hb.id), wd = add(w, "div", "hp-wk"); for (var i = 0; i < hb.per; i++) { var d = add(wd, "i"); if (i < wk) { d.style.background = D.c; d.style.borderColor = "#160510"; } } }
      var m = habMirror(hb, sk, dom); var ml = add(w, "div", "hp-mirror", m.txt); ml.style.color = m.col;

      if (idx < S.habits.length - 1) add(path, "div", "hp-spine"); // dotted connector between stones
    });

    // LEGEND
    var lg = add(body, "div", "hp-legend");
    lg.innerHTML = '<b>' + tr("нить") + ':</b>' +
      '<span><i class="ti ti-flame lg-ember"></i> 2–6</span>' +
      '<span><i class="ti ti-flame lg-flame"></i> 7–20</span>' +
      '<span><i class="ti ti-flame lg-blue"></i> 21+</span>';
  }
```

> Note on `domainOf`: signature is `domainOf(item)` reading `.title` / `.catK` / `.habitId` (confirmed app.js — used the same way in `allActivities`). `tiClass(item)` reads `item.title` then falls back to `DOM[domainOf(item)].ti`. Default habits (`move/deep/tidy/teeth/read/breathe`) map correctly through `TITLE2CAT` + `HABIT2CAT`. If any custom habit lands in the wrong domain visually, that's a `domainOf` data issue, not this view.

---

## 4. WIRING

Two existing entry points now open the **path** instead of the manager (the manager is reachable from the path's pencil):

1. **Notebook item** — app.js:2750, change:
   ```js
   { ic: "ti-checkup-list", l: "Habits", sub: "add or remove your activities", c: "#ff8a3d", fn: function () { ov.remove(); habitsSheet(); } },
   ```
   to:
   ```js
   { ic: "ti-checkup-list", l: "Habits", sub: "your daily thread", c: "#ff8a3d", fn: function () { ov.remove(); habitPathSheet(); } },
   ```
   (also add `"your daily thread": "твоя ежедневная нить"` — see I18N.)

2. **Goals-tab #goHabits** — app.js:8607, change:
   ```js
   var _gh = el("goHabits"); if (_gh) _gh.onclick = habitsSheet;
   ```
   to:
   ```js
   var _gh = el("goHabits"); if (_gh) _gh.onclick = habitPathSheet;
   ```

No nav/tab scaffolding needed — it rides the existing `.bento-ov` overlay layer (z-index/safe-area already correct). `toggleHabit()` (app.js:6496) already calls `save()` + `renderHero/Char/Game`; the path re-renders itself on tap by removing + reopening.

---

## 5. I18N (add to `I18N.ru` — grep `Object.assign(I18N.ru, {` at app.js:1646)

Every NEW English/Russian display string the view feeds through `tr()`:

| String (key) | Russian value |
|---|---|
| `Привычки` | `Привычки` *(already Russian; passes through)* |
| `из` | `из` |
| `сегодня` | `сегодня` |
| `нить` | `нить` |
| `изменить` | `изменить` |
| `× в неделю` | dynamic — built as `hb.per + "× в неделю"`; the base token `"× в неделю"` isn't looked up whole. Keep the mirror-line phrasing Russian as written (`3× в неделю · 2 из 3`). No new EN string. |
| `огонь стал синим` | `огонь стал синим` |
| `день` | `день` |
| `этой нити — один тап держит её` | `этой нити — один тап держит её` |
| `уголёк тлеет` | `уголёк тлеет` |
| `новая нить — начни сегодня` | `новая нить — начни сегодня` |
| `your daily thread` | `твоя ежедневная нить` |

> The mirror lines are authored **in Russian already** (matching the widget's spelled-out Cyrillic). `tr()` is called defensively so that if a display-layer translation of these strings is ever added for another locale it works; for `ru` they pass through unchanged. The **only genuinely-new English UI string** is the Notebook subtitle `your daily thread` → `твоя ежедневная нить`; add that pair to `I18N.ru`.

---

## 6. REGRESSION RISKS

- **`renderHabits()` was dead** (no `#habitList` in DOM) — replacing it with a no-op cannot regress any visible surface; `renderAll()` (app.js:6510) keeps calling it harmlessly. **Additive-safe.**
- **`habitsSheet()` (manager) untouched** — still fully reachable via the path header pencil, so add/remove habits + sub-habit editing all survive. No data path removed.
- **No SCHEMA change** — reads existing `S.habits[].{id,l,per,color,type}`, `S.habitDone`, `S.game.spark`; writes only via the existing `toggleHabit()` → `save()`. No migration needed, David's data is safe.
- **Overlay layering** — reuses `.bento-ov` (z95) exactly as `habitsSheet` did; no new z-index. The `.hp-body` copies the manager body's `overscroll-behavior:contain; touch-action:pan-y` so path scroll won't bleed into the timeline pull gesture.
- **Re-render on tap** removes + reopens the whole overlay (mirrors nothing stateful) — cheap, avoids partial-DOM bugs. If flicker is objectionable on device, the safe follow-up is targeted class toggles, but ship the simple version first.
- **`quit`-type habits**: the old list showed a `quit` tag; the path currently treats them like build habits (stone + streak). If David wants quit habits visually distinct, that's a follow-up (e.g. drift-gray stone) — not in scope for mock-14 fidelity.
- **DEVICE-UNTESTED:** scroll feel + tap-to-toggle on iPhone. Preview proves it boots, renders, non-gesture taps work. Report as *"boots clean in preview; scroll + tap feel device-untested — confirm on your phone."*

---

## 7. FIDELITY CHECKLIST (vs habits.jpg)

- **Header title** `Привычки` — Jost **800**, 26px, white. ✔ (`.hp-title`)
- **Sub** `2 из 5 сегодня` — Jost 700, `#c9a6d6`. ✔ (`.hp-sub`, built `done из N сегодня`)
- **Spark pill** `⚡ 82` — Tabler `ti-bolt` (NOT emoji), gold `#ffd76a` on `#3a0f24` with ink border + hard `0 3px 0 #160510` shadow. ✔
- **Progress bar** pink→purple gradient `#ff5fa8 → #b07aff` on `#3a1230` track. ✔ (matches the pink-purple bar under the header in the widget)
- **DONE stones = full bright diagonal stripes** — `repeating-linear-gradient(135deg, D.c 0 14px, lighter(D.c) 14px 28px)`. Green (Зарядка/move) and purple (Медитация/create) and pink (Глубокая работа/connect) all stripe in their own domain hex. ✔
- **UNDONE stones = matte dark tint + solid colored border** — `mixHex(D.c,'#160510',0.72)` fill + `inset 0 0 0 4px D.c` ring (Чтение/blue, Дневник/gold in the widget are matte with a colored rim). ✔
- **Verdict #14 fix ①: icons WHITE on stripes** — `.hp-ic{color:#fff}` on done stones; domain-`light` on matte stones. No ink-dark "black emoji" icons. ✔
- **Icons are Tabler line-icons** via `tiClass()` (ti-run, ti-brain, ti-book, ti-pencil…), never emoji. ✔
- **Green check chip** top-right, `#2fd07a` w/ ink border + hard shadow + `ti-check`. ✔
- **Tier pips ember→flame→blue-flame** bottom-right: `ti-flame` colored `#e0791c` (2–6) / `#ff6a1e` (7–20) / `#4db8ff` (21+). Matches the orange ember on Медитация and the flame on Глубокая работа; blue-flame at ×21. ✔
- **Per-habit mirror line** in domain-light: `×23 — огонь стал синим`, `×4 — уголёк тлеет`, `день 12 этой нити — один тап держит её` — spelled-out Cyrillic exactly as the widget. ✔
- **Weekly dot-pips** for `per>0` (Чтение `3× в неделю · 2 из 3` → `● ● ○`), filled = domain color. ✔
- **Label** Jost **800** white, 18px, centered under stone. ✔
- **Bottom legend** `нить: 🔥2–6  🔥7–20  🔥21+` with the three tier colors. ✔ (widget shows `нить: ● 2–6  🔥 7–20  🔥 21+` — rendered as three flame glyphs tinted per tier)
- **Verdict #14 fix ②: DENSE rhythm** — stones 118px (big), dotted spine connector only 26px, stones sit close; far less scroll than the plain list. ✔ (`.hp-stone` 118px, `.hp-spine` 26px)
- **Ink border `#160510` + hard `0 Npx 0 #160510` shadows** on every chunk (stone, check, pip, spark pill, edit). No soft/flat shadows. ✔
- **Gradient background** inherited from `.bento-card` (`#2c081a` plum, ink border) — matches the dark-plum canvas. ✔
