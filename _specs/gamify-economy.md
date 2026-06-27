# SPEC — Gamification: score & economy (`gamify-economy`)

Build-ready specs for the **score & economy** cluster of ALTER's gamification layer. A future build-agent should be able to start coding from these with no re-research.

Audit source: `GRAND-AUDIT-2026-06-26.md` § "Gamification / RPG / character (12)" (lines 215-275).

---

## Ground truth — what already exists (read before building)

Single currency = **Spark** (`S.game.spark`, lifetime `S.game.total`). One file: `app.js`, shell + CSS in `index.html`.

| Thing | Where | Notes |
|---|---|---|
| `earn(base, ctx)` | `app.js:1857` | adds Spark + `total`, saves, pops the floating `+N` (`.spark-float`, css `index.html:656`), re-renders `#spark`. Called from ~18 sites (every logged activity, habit toggle `:2564`, mood `:1825`, micro-actions, `stopTimer :2898`). |
| `S.game` shape | init `fresh() :1198` = `{ spark, total, ups:{}, garden:[] }`; defensively re-init in `load() :1199`; merged in import `:1227` | `ups` is a flat bag of booleans (`board`, `tricks`, `gold`). |
| `SCHEMA` | `app.js:75` = `1` | bumped at end of `load()` (`S.v = SCHEMA`). **Bump + migrate when you change `S.game` shape.** |
| Spend / shop | `renderGame() :1858` — renders into `#spark` + `#upgrades` (DOM in `index.html:349-350`) | Only 3 spends: 🌱 plant (`plantGarden :1811`, cost `20*(n+1)`), 🛹 board (cost 120, sets `ups.board`), 🛼 tricks (cost 400, sets `ups.tricks`). |
| Virtues (XP/skill tree) | `VIRTUES[]` :1172 (8 virtues), `virtueOf(e)` :1183 (maps a log → a virtue), `virtues()` :1254 (14-day XP roll-up → per-virtue `lv`/`glow`) | Levels never shown as "low" (Withers rule). Focus virtues get +1 level. |
| Score-by-domain | `spaceScore() :132` (chores only, %), `DOM` :249 (8 domains + drift), `CAT2DOM` :260 | No cross-domain points dashboard; scoring today = ONE Spark number + 8 virtue levels. |
| Battery / live charge | straddle block in `calendarView`, `app.js:2250-2266` (`matchseg`/`convghost`/`convfut`); CSS `.matchseg` `index.html:525`, `.convbar .convfut` `:571` | "fill" = per-render geometry, re-rendered **once per minute** (the `_lastMin` gate at `app.js:3082`). No CSS transition between renders → it jumps, doesn't glide. |

**Render cadence (critical for the battery spec):** a `setInterval(…,1000)` at `app.js:3076` only calls `renderToday()` when the **minute** changes (`nm !== _lastMin`, line 3082). Per-second now-line creep was deliberately removed (comment `:3081`). So today the battery grows in 1-minute steps with no tween.

### LOCKED design rules (from `CLAUDE.md` + `HANDOFF-visual-redesign-2026-06-27.md`)
- Deep berry/wine palette; **NO neon / glow / shine / `.shine` / `.foil` / white surfaces**. The pink **now-line is the brightest thing**; bubbles always darker.
- Bubbles = deep jewel fills + **subtle** low-contrast diagonal stripes (a texture). Missed = ghost (dark hollow + muted domain outline). Ink edge `#160510`.
- One activity at a time. **Reward-never-shame** (no "low" virtue ratings, no red shame).
- Full-screen, low-clutter. Evolution of the striped design, not a redesign.
- Domain colors live in `DOM` (`app.js:249`): move `#ff8a3a`, nourish `#34d39a`, focus `#36b3f0`, create `#b07aff`, connect `#ff5fa0`, play `#d99f30`, restore `#2ab8c4`, upkeep `#7f9bc4`, drift `#4a3d54`.
- **The timeline render is FRAGILE** — rebuilt 3×. Any change inside `calendarView` (the bubble/straddle/matchseg block ~`app.js:2140-2300`) is **HIGH RISK**; re-check the 4-point regression contract in `CLAUDE.md`.
- Reuse helpers: `add()/el()/DOM/mixHex/esc/fmt/dur/hm/blocks()/logs()/save()/earn()`.

---

## FEATURE 1 — Battery / charging fills live within the block (smooth)

**(1) Ask** (audit `:272`): *"The battery animation — the matte→shining fills live within the block. Right now the finish flips on completion; it doesn't visibly fill."*

**(2) Buildable?** **partial → concrete.** A geometric live fill already exists; the gap is (a) it steps once a minute, not smoothly, and (b) it's DEVICE-UNTESTED for feel. Concrete version: make the charged segment **glide** between the per-minute re-renders with a CSS height transition, so it reads as a battery filling rather than snapping.

**(3) APPROACH**
- Keep the per-minute `renderToday()` as the source of truth for geometry — do NOT add a per-second timeline re-render (explicitly removed, `:3081`; reintroducing it re-broke things).
- Make the **charged stretch glide** to its new height each minute instead of jumping:
  - The tracked segment `_seg` (`.matchseg`, built at `app.js:2258`) is rebuilt every render, so a `transition` on it alone won't tween (new node each time). Two options:
    - **Option A (preferred, low-risk): tween the FUTURE remainder shrinking.** In the straddle block, the future half `_fw` (`.futwide`, `app.js:2259`) is a hollow outline. Give the **charged `_seg` a `transition: height .9s linear`** AND set its initial height (on creation) to the *previous* minute's height via a `data-`/closure-cached value, then in a `requestAnimationFrame` set it to the true height. Because the node is new each minute, cache last height in a module var keyed by timer id: `_chargeH[tid]`.
  - **Option B (cleaner, medium-risk): make the charged segment a persistent node** that `renderToday()` *reuses* instead of recreating — look it up by a stable id (`matchseg_<bid>`) and only update `style.height`/`style.top`, letting CSS `transition:height .9s linear` glide it. This avoids the wipe-and-rebuild for just this node (aligns with the "stop adding wipe surfaces" landmine). But it fights the full-rebuild model of `calendarView`, so guard carefully.
- **Recommend Option A** for first ship: smallest blast radius, no change to the rebuild model.
- The "matte → shining" wording: do NOT add shine/foil (locked-out). Interpret "shining" as the existing **deep-stripe charged fill vs the dimmer matte future** — that contrast IS the battery. The only new thing is the *glide*.

**(4) CODE POINTERS**
- `app.js:2250` straddle block (`if (_straddle)`), specifically `_seg` creation `:2258` and `_fw` `:2259`, and the non-tracking `convghost/convfut` path `:2261-2263`.
- CSS: `.matchseg` `index.html:525`; add the transition rule near it.
- Cadence gate: `app.js:3082` (`nm !== _lastMin`) — leave as-is.
- Module-scope var for cached heights: add near other timeline state (e.g. by `_lastMin`, search `var _lastMin`).

**(5) UI** (locked palette, no neon)
```
   focus block (planned 90m)
 ┌───────────────────────────┐  ← top of plan bubble
 │ ░░░ deep-blue stripes ░░░ │  charged (matchseg) — grows DOWN
 │ ░░ Focus  ✓ ░░░░░░░░░░░░ │  fills smoothly toward the now-line
 ├━━━━━━━━━━━━━━━━━━━━━━━━━━━┤  ← PINK now-line (brightest)
 │   faint hollow outline    │  future remainder (futwide), unwritten
 └───────────────────────────┘
```
The charged stripe (`mix(focus,#160510,.62/.73)`) is darker than the now-line; the future is a faint outline. As minutes pass, the charged top grows down to the now-line in a ~0.9s glide.

**(6) DATA** — none. No schema change. (Optional module var `_chargeH = {}` cleared on day change.)

**(7) REGION** — `calendarView` straddle render + `.matchseg` CSS. **HIGH RISK timeline region.**

**(8) EFFORT** — **S** (Option A) / M (Option B).

**(9) RISKS**
- HIGH-RISK timeline area — re-verify all 4 regression points (continuous scroll, set-in-stone past, tap/drag, week-strip).
- A `height` transition on a node whose `top` also changes can look like it slides diagonally — pin `top`, only animate `height`.
- DEVICE-UNTESTED for smoothness — label it so. Synthetic preview won't prove the glide feel.
- Don't let the transition still be mid-glide when the block completes (stopTimer) — completion should snap, not lag.

---

## FEATURE 2 — Earn points/coins, spend on appearance / room / items / garden tools

**(1) Ask** (audit `:222`, asked ×2): *"as u make points in the app u can spend it on upgrading character appearance or their home / room and also their items they can unlock."*

**(2) Buildable?** **BIG → ship a concrete first slice.** Full appearance/room/garden-tool catalog is L. Concrete buildable v1: **a real Spark shop with categorized, persistent, owned/equippable items**, replacing the 3 ad-hoc buttons in `renderGame()`. Start with categories that don't need new sprite art: **Garden tools/items** + **Room/world props** (reuse the existing `S.game.garden` planting pipeline) and a small **Appearance** category gated behind a clear "more coming" so it isn't a dead promise.

**(3) APPROACH**
- Introduce a **declarative shop catalog** (one array) instead of inline buttons:
  ```js
  // app.js, near renderGame()
  var SHOP = [
    { id:"plant",   cat:"garden", l:"Plant",          e:"🌱", base:20, scale:true,  fn:plantGarden, repeat:true }, // existing escalating cost
    { id:"tree",    cat:"garden", l:"Tree",           e:"🌳", cost:60,  flag:"tree" },
    { id:"pond",    cat:"garden", l:"Pond",           e:"💧", cost:90,  flag:"pond" },
    { id:"lantern", cat:"room",   l:"Lantern",        e:"🏮", cost:70,  flag:"lantern" },
    { id:"bench",   cat:"room",   l:"Bench",          e:"🪑", cost:80,  flag:"bench" },
    { id:"board",   cat:"item",   l:"Skateboard",     e:"🛹", cost:120, flag:"board" },   // existing
    { id:"tricks",  cat:"item",   l:"Trick deck",     e:"🛼", cost:400, flag:"tricks" },  // existing
    { id:"cloak",   cat:"look",   l:"Cloak tint",     e:"🧥", cost:150, flag:"cloak" }    // appearance v1 = a tint, not new sprite
  ];
  ```
- **Generic buy()**: `function buy(it){ var c = it.scale ? it.base*((S.game.garden||[]).length+1) : it.cost; if (S.game.spark < c) return toast("not enough Spark yet"); S.game.spark -= c; if (it.fn) it.fn(); else { S.game.ups[it.flag] = true; } save(); renderGame(); toast("✨ "+it.l+" unlocked"); }`
- **renderGame() rework** (`:1858`): keep the `#spark` header line; replace the inline board/tricks/plant buttons with a loop over `SHOP` grouped by `cat`, each row showing emoji + label + cost, `disabled` when `spark < cost` or already owned (`S.game.ups[flag]`). Reuse the existing `done2` button class. Keep the "ship 1 thing to grow" gate ONLY on the plant action (the others can be pure-Spark spends).
- **Appearance v1 = a tint, not new art.** Wire `ups.cloak` into the canvas hero draw where `ups.gold` already recolors (`app.js:1329` aura color, `:1620` `st.gold`, `:1797` `hc`). Add a `cloak` branch beside the existing `gold` check → swap the body/aura tint. This proves the appearance loop without commissioning 8-direction sprites.
- **Room/garden props** = extend the existing garden render. `drawGarden` (search `S.game.garden` at `app.js:1808`) already places plants by `t` (type 0-4). Push props as `{t:'tree'|'pond'|'lantern'|'bench'}` into `S.game.garden` (or a parallel `S.game.props`) and add their draw cases. **This reuses the funded-by-points pipeline David already approved.**

**(4) CODE POINTERS**
- `renderGame()` `:1858-1880` (the whole shop block to replace).
- `plantGarden()` `:1811`; garden draw `:1808` (`drawGarden`/`var g = (S.game.garden||[])`).
- Hero tint hooks: aura `:1329`, `st.gold` `:1620`, `hc` `:1797`, `skateOk()/tricksOk()` `:1383-1384` (pattern for `cloakOk()`).
- `#upgrades` container `index.html:350`, `done2` button style (search `.done2` in index.html).

**(5) UI** (locked palette — deep, no white cards)
```
 ✨ 1,240 Spark · ship 1 thing to grow
 ─────────────────────────────────────
 GARDEN
  🌱 Plant            ✨40   [unlock]
  🌳 Tree             ✨60   [unlock]
  💧 Pond             ✨90   [too few]
 ROOM
  🏮 Lantern          ✨70   [unlock]
  🪑 Bench            ✨80   [unlock]
 ITEMS
  🛹 Skateboard       owned ✓
  🛼 Trick deck       ✨400  [too few]
 LOOK
  🧥 Cloak tint       ✨150  [unlock]
```
Rows on the existing dark surface; owned = checkmark + dimmed; affordable = active `done2`; unaffordable = disabled.

**(6) DATA + migration**
- `ups` already a bag of booleans → new flags (`tree`,`pond`,`lantern`,`bench`,`cloak`) are additive, **no migration needed** (default-undefined = not owned, and `load()` already does `S.game.ups = S.game.ups || {}`).
- If you add `S.game.props` as a separate array: init it in `fresh()` `:1198` and `load()` `:1199` (`S.game.props = S.game.props || []`), add it to the import merge `:1227`, and **bump `SCHEMA` 1→2** with a one-line migration (`if (S.v < 2 && !S.game.props) S.game.props = []`). Simpler path: reuse `S.game.garden` with typed entries → **no schema bump**.

**(7) REGION** — `renderGame()` / shop (self-contained, LOW conflict) + garden canvas draw + hero canvas tint. Touches the **game/canvas region**, NOT the fragile timeline. Safe to run in parallel with timeline build-agents.

**(8) EFFORT** — **M** (catalog + buy + garden props reuse). **L** if real appearance sprites are in scope (out of scope for v1 — keep to tints).

**(9) RISKS**
- Scope creep into sprite art — explicitly cap appearance at tints for v1; flag "more looks coming" so it's not a dead end.
- Canvas tint must not produce neon/glow — match the deep palette, reuse the muted `gold` recolor pattern.
- Don't let a new shop layout reintroduce white/flat cards (rejected look).
- Garden props must render on the **cute** side per David's Zen-garden steer (audit `:242`) — keep them small/soft, not the off-brand Cuphead style (note: the broader Zen-garden re-skin is a SEPARATE cluster; here just don't make it worse).

---

## FEATURE 3 — Gamify real life: keep score across ALL life domains

**(1) Ask** (audit `:217`, VISION): *"gamify real life to keep tabs on you and to keep score on things like cleaning room and breathing exercises and meditation and sports and nutrition and everything."*

**(2) Buildable?** **VISION → concrete.** Scoring exists but is shallow (one Spark + 8 virtue levels). Concrete buildable slice: a **cross-domain scoreboard** — Spark/XP attributed per **domain** (the 8 `DOM` domains David already sees on the timeline), so "cleaning / breathing / meditation / sports / nutrition" each show a distinct, visible score. This is the smallest thing that delivers "keep score on everything."

**(3) APPROACH**
- Every log already carries a domain (`domainOf(e)` / `DOM`). Build a **per-domain points roll-up** parallel to `virtues()`:
  ```js
  function domainScores(days){           // mirror virtues() :1254
    var d = lastDays(days||14), out={};
    Object.keys(DOM).forEach(function(k){ out[k]=0; });
    d.forEach(function(k){ logs(k).forEach(function(e){
      var dm = domainOf(e); if (out[dm]!=null) out[dm] += (e.mins||0);
    }); });
    return out; // minutes per domain over the window
  }
  ```
  Reuse `lastDays`, `logs()`, `domainOf` (all exist; `virtues()` :1254 is the template).
- **Surface it** as a compact domain strip on the **You / stats** surface (where the virtue tree already renders — `renderChar`/`renderStats`, search `renderStats :2578` caller). One row per domain: domain emoji + color bar (length ∝ score) + number. Reward-only framing (more = brighter/longer; never "you're low at X").
- Optionally also **attribute Spark per domain** going forward: add `S.game.byDom = {}` and in `earn(base, ctx)` (`:1857`), if `ctx.catK`/`ctx.domain` present, do `S.game.byDom[dom] = (S.game.byDom[dom]||0)+got`. Most `earn()` calls already pass `{catK:...}`. Then the scoreboard can show lifetime Spark per domain, not just a 14-day minute roll-up.
- Keep it ONE new read-model + ONE new render; do not rebuild the virtue system (that's a separate ask, audit `:232`).

**(4) CODE POINTERS**
- `virtues()` `:1254` (the roll-up template to copy), `virtueOf()` `:1183`, `domainOf` (search), `lastDays`/`logs()` helpers.
- `earn()` `:1857` (add the per-domain accrual, optional).
- Render target: the stats/You surface — `renderStats` / the virtue-tree render around `:1254-1340`; `renderChar`. Add the strip beside the existing virtue tiles.
- `DOM` `:249` for emoji/color/label per domain.

**(5) UI** (locked palette — bars use the muted domain colors, never neon)
```
 YOUR DOMAINS · last 14 days
  🏃 Move     ███████░░░  220
  🍎 Nourish  █████░░░░░  140
  🎯 Focus    █████████░  410
  🎨 Create   ████░░░░░░  120
  💛 Connect  ███░░░░░░░   80
  🎮 Play     ██░░░░░░░░   60
  🌙 Restore  ████░░░░░░  110
  🧹 Upkeep   █████░░░░░  150   ← "cleaning room" scored distinctly
```
Bars in `mix(DOM.c,#160510,.5)` fill on a deep track; number in `DOM.light`. No domain ever shown as failing — empty bar just reads "room to grow."

**(6) DATA + migration**
- 14-day minute roll-up = **no storage** (derived from logs). No migration.
- Optional lifetime per-domain Spark: add `S.game.byDom = {}` in `fresh()` `:1198` + `load()` `:1199` (`S.game.byDom = S.game.byDom || {}`) + import merge `:1227`. Additive object → safe; **bump `SCHEMA` 1→2** only if you want a backfill migration, otherwise default-empty is fine with no bump.

**(7) REGION** — stats/You read-model + render (self-contained). Touches `earn()` if per-domain accrual added (shared, but additive one-liner). NOT the timeline. Low conflict.

**(8) EFFORT** — **M** (derived roll-up + one strip render = S; +per-domain Spark accrual + migration = M).

**(9) RISKS**
- Withers rule: never frame a low domain as a deficit/red — only "room to grow." This is the #1 review gate for this feature.
- `domainOf` must resolve for all log shapes (some logs have `catK` not `domain`; check `domainOf` handles both — it does via `CAT2DOM`).
- Don't double-count: this is a *view*, keep Spark the single spendable currency; per-domain numbers are progress, not a second wallet.
- Avoid clutter — David wants low-clutter; this is one collapsible strip, not a new tab.

---

## Cross-feature notes for the build-agent
- **Parallel-safety:** F2 and F3 live in the game/stats regions and are safe to build alongside other agents. F1 is in the **fragile timeline** — serialize it / do it last and device-confirm.
- **Single currency stays Spark.** Don't introduce a second spendable currency ("coins") — map David's "points/coins" language onto Spark; per-domain numbers (F3) are *scores*, not wallets.
- **`earn()` is the one mint.** Any new earning goes through `earn()` so the `+N` float + `total` + save stay consistent.
- **Schema discipline:** only F2 (if `props` array) or F3 (if backfilled `byDom`) need a `SCHEMA` bump (1→2) + a migration line in `load()`. The boolean-flag and derived-view paths need none. A silent shape change wipes David's real data — follow `CLAUDE.md`.
- **Device-untested truth:** F1's glide cannot be proven in preview — ship it labeled DEVICE-UNTESTED for smoothness, per the verification-truth rule.
