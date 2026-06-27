# SPEC — Cluster: The Game / World / Garden  (SLUG: world-garden)

Build-ready specs for the game layer of ALTER (the in-world guardian-fairy game, the point-funded garden, the sprite, the HUD, and making menus diegetic). Sourced from `GRAND-AUDIT-2026-06-26.md` (Gamification / UI / Nav sections), grounded in real code.

**Single file:** `app.js` (whole app) + `index.html` (shell + CSS). Never edit `server.js`.
**Ship loop:** `bash _dev/preship.sh` then `git add -A && commit && push`.

---

## SHARED CONTEXT — how the game already works (read once, applies to every spec below)

The game is a top-down walkable island, currently a **Cuphead 1930s rubber-hose skin** that David called **off-brand**. The vision (`GARDEN-OF-MIND.md`) is a calm **garden of the mind** (wild → cultivated → estate), not a pirate island.

Key functions / line numbers (app.js):
- **`renderWorld(ctx,W,H,vz,moving,t)`** `app.js:1617` — the ONE shared renderer. Drives BOTH the You-tab preview canvas (`#guardian`, via `drawGuardian` `app.js:1819`) AND the full-screen game (`#world`, via `drawWorld` `app.js:1684`). Change the world here once → both update. Ocean=`WORLD_IMG.water`, island=`darkBlob/sandBlob/grassBlob` (Path2D blobs built in `buildIsland` `app.js:1596`), objects=`OBJS` array `app.js:1643`, garden plants=`plantSpriteAt` `app.js:1538`, fairy=`spr-dir.png` 8-way at `app.js:1655-1666`, minimap=`app.js:1673-1682`.
- **`drawWorld()`** `app.js:1684` — the rAF game loop: movement (joysticks `moveX/moveY` + `moveX2/moveY2`), skate physics, jump/trick physics, bounds clamp, then calls `renderWorld`, then a night-tint multiply pass, then `updGameHud` every 30 frames.
- **`openGame()`** `app.js:1743` / **`closeGame()`** `app.js:1749` — toggle `#gameMode.on` (fixed inset:0, `index.html:401`), set `body.gaming`, start/stop `gameOn` loop.
- **Economy:** `earn(base,ctx)` `app.js:1857` adds Spark (`S.game.spark` + `S.game.total`) on every tracked thing; `hasShippedToday()` `app.js:1856` gates growth on a `courage`-virtue deed today.
- **Spending UI:** `renderGame()` `app.js:1858` paints the `#spark` counter + `#upgrades` button list (plant / skateboard / trick-deck).
- **Planting:** `plantGarden()` `app.js:1811` spends `20*(n+1)` Spark, pushes `{t: n%5}` to `S.game.garden`.
- **HUD:** `updGameHud()` `app.js:1735` writes `#gameHud` innerHTML (Spark + a contextual hint). `#gameHud` CSS `index.html:410`.
- **Diegetic menus:** `WORLD_SPOTS` `app.js:1760` (cabin→brain, board→day, tree→self, chest→grow); `wireWorldTap` `app.js:1766` (drag=pan, tap-a-spot=open). `goTab(t)` `app.js:1755` opens a feature as an overworld notebook panel (`body.overworld`, CSS `index.html:469-486`). `heroMenu()` `app.js:1757` (tap fairy → mindmap).
- **Data:** `SCHEMA=1` `app.js:75`, `fresh()` `app.js:1198`, migration in `load()` `app.js:1199`. `S.game = {spark,total,ups:{},garden:[]}`. Garden items are `{t:0..4}`.

**LOCKED design rules (honor in EVERY spec):** deep berry/wine palette + DOM domain colors; NO neon/glow/shine/white surfaces; the pink now-line is the brightest thing (game-mode HUD must not out-bright it); ONE activity at a time; reward-never-shame; full-screen low-clutter; reuse helpers `add()/el()/DOM/mixHex/esc/fmt/dur/hm/blocks()/logs()/save()` and the game helpers `mix()/hexA()/gdisc/gring/drawObj`.

**HIGH-RISK note:** the *timeline render* is fragile (rebuilt 3×). The *world/game render* is a SEPARATE surface (`renderWorld`/`drawWorld`) and is far lower risk — but `renderWorld` is **shared by two canvases**, so any change shows up in both the You-tab preview and full-screen game. Test both.

---

## FEATURE 1 — Garden game funded by tracker points, rebuilt as a minimal cute Zen garden

**(1) Ask** (audit, line 242, BIG, asked 2026-06-26, highest-priority in cluster):
> "The garden game inside this app should work on a fundamental level... You make points or coins by doing the stuff in the time tracker... those points you can use in the garden game, which has to be cute" — Gap: point-funded planting works; the pivot to a **minimal cute Zen-garden aesthetic** was never done — it's still the off-brand Cuphead island.

**(2) Buildable?** YES. The funding loop already works end-to-end (earn → Spark → `plantGarden`). The unbuilt part is purely the **aesthetic re-skin** of the world from Cuphead-island → calm Zen garden. This is the single highest-value, lowest-risk move in the cluster: it's a draw-layer swap, the economy underneath is untouched.

**(3) Approach** — re-skin `renderWorld` (`app.js:1617`) so the world reads as a small, cute, calm Zen garden instead of a tropical pirate island. Three sub-changes, all inside `renderWorld` / its asset list:
1. **Ground & water palette** → calm zen, on the berry/wine family. Replace the Cuphead water/grass image patterns with flat, muted, hand-drawn fills (no PNG dependency):
   - Ocean/void around the island → a calm deep surface, e.g. base `#241027` (matches the pullSheet wine→navy backdrop, `index.html:713`) instead of `#6f8a93` (`app.js:1628`).
   - Island blobs → keep the `darkBlob/sandBlob/grassBlob` Path2D structure (`app.js:1606`) but recolor: coastline `#33271a`→a deep mossy `#2a3a2e`; sand `#d9c89a`→a soft raked-sand `#cbb89a` (zen rock garden); grass → flat muted sage `#7e9266` (drop the `grassPat` image, use the solid-fill fallback already present at `app.js:1639`).
2. **Objects** → swap the pirate-y set (`OBJS` `app.js:1643`: tree/cabin/bush/rock/chest/sign) for Zen-garden objects drawn with the existing vector draw-fns (NO new PNGs needed — there are already procedural drawers `drawTreeSprite` `app.js:1551`, `drawRock` `app.js:1545`). Add 1-2 small procedural drawers in the same style for: a **raked-sand ring**, a **stone lantern (tōrō)**, a **bonsai/cherry tree** (recolor `drawTreeSprite` blossoms pink `#ff9ec4`), a **koi pond** (small ellipse of the calm water color). Keep "bold thick outlines, big simple shapes, flat muted-zen colors" per `GARDEN-OF-MIND.md`.
3. **Plants** → the garden you fund. `plantSpriteAt` `app.js:1538` already draws cute flowers in the 5-color palette; keep but recolor the 5 to a calm muted set (`#9ec98a` sage, `#ff9ec4` blossom-pink, `#b07aff` lilac, `#ffd27a` warm-amber, `#7fc0e0` pond-blue) so they sit in the zen palette not the neon `#46e2a4` set.

Do it as **flat procedural draws** (not new AI PNGs) so it ships this session with no asset pipeline. If David later wants AI Zen art, the asset swap point is `loadWorld()` `app.js:1476` (the `srcs` map) + the pattern-build blocks at `app.js:1624-1638`.

**(4) Code pointers**
- `renderWorld` `app.js:1617` (palette + objects + plants)
- `OBJS` array `app.js:1643`; depth-sort draw loops `app.js:1644` + `app.js:1667`
- procedural drawers to reuse/clone: `drawTreeSprite` `app.js:1551`, `drawRock` `app.js:1545`, `drawCabin` `app.js:1559`, `drawCampfire` `app.js:1582`
- `plantSpriteAt` `app.js:1538` (in-world plants) + `plantSprite` `app.js:1800` (You-tab mini-garden — keep colors in sync)
- `loadWorld` `app.js:1476` + `WORLD_IMG` (only if going AI-art route later)

**(5) UI (text sketch, on locked palette)**
```
Full-screen #world canvas:
  deep wine void (#241027)
     ╭───────────────────╮
     │   🌸 (bonsai)      │   ← muted, no glow
     │  ▒▒ raked sand ▒▒  │   ← soft tan rings
     │   🪨   🏮(lantern) │
     │  ◯ koi pond ◯     │
     │      🧚 (fairy)    │   ← pink-ish, calm
     │   🌱🌷🌿 (planted) │   ← funded plants fill in
     ╰───────────────────╯
  HUD top:  ✨ 240 Spark · 🌱 your garden grew today
```

**(6) Data** — NO shape change. Garden stays `S.game.garden = [{t},...]`, `t∈0..4`. No migration. (Optionally widen `t` range when you add more plant kinds — see Feature 7.)

**(7) Region** — `renderWorld` + procedural draw-fns block (`app.js:1480-1660`). Shared by both canvases. Self-contained; low collision with timeline build-agents.

**(8) Effort** — **M** (re-skin + a couple new procedural objects; no data/logic change).

**(9) Risks / regression**
- `renderWorld` is shared by `#guardian` (You-tab preview) AND `#world` (game) — verify BOTH look right.
- Don't break the depth-sort (objects with `base.y <= py` draw behind the fairy, `> py` in front, `app.js:1644/1667`) — keep new objects in the same `[img/null, x, y, h]` shape or give procedural objects an equivalent y-sort.
- Removing image-pattern reliance is actually *safer* (no `?v=` cache races), but confirm the solid-fill fallbacks render (they already exist).
- DEVICE-UNTESTED caveat applies to gesture feel only; static look is preview-verifiable via screenshot.

---

## FEATURE 2 — Make it an actual game (Binding of Isaac / Cookie Clicker upgrades / island survival)

**(1) Ask** (audit, line 237, BIG, asked ×2):
> "it should also be actual game starting with basic mechanics and we will build ontop. Maybe binding of Isaac?" — Gap: walkable island + cookie-clicker upgrades exist; **survival/enemy combat loop never built**.

**(2) Buildable?** PARTIAL → ship the **nearest-concrete tier first**. A full Binding-of-Isaac combat loop (enemies, hp, projectiles, rooms) is a large new subsystem and risks turning a calm "garden of the mind" into a shooter — which **conflicts with the reward-never-shame / calm-zen locked direction** and David's own "minimal cute Zen garden" pivot (Feature 1, dated 4 days later). **Recommended concrete version: a Cookie-Clicker-style compounding-upgrade loop, NOT combat.** This honors "actual game starting with basic mechanics" without the off-brand violence.

**(3) Approach** — extend the existing upgrade economy (`renderGame` `app.js:1858`) into a real **idle/clicker progression**:
1. **Compounding multipliers.** Add purchasable upgrades stored in `S.game.ups` that raise the Spark yield of `earn()` (`app.js:1857`). E.g. `ups.fountain` (×1.1 earn), `ups.grove` (×1.25), each gated behind rising Spark cost. Apply in `earn`: `var mult = earnMult(); got = Math.round(base*mult)`.
2. **Garden tiers (the "build ontop" arc).** Track `S.game.tier` (0=wild,1=cultivated,2=estate per `GARDEN-OF-MIND.md`). Bump tier when cumulative `S.game.total` crosses thresholds (e.g. 500 / 3000). Tier drives which objects `renderWorld` draws (wild scrub → tended garden → ornamental estate). This is the "starts as gardener → ends rich man with gardeners" narrative (audit line 80) realized as a visible world that grows.
3. **Keep it diegetic.** Buy upgrades from an in-world object (a "gardener's shed" / notice board), not a clicker menu, per the no-bottom-bar diegetic rule.

Explicitly defer combat/enemies — if David later insists on Binding-of-Isaac, that's a separate large spec (new `enemies[]`, hp, projectile loop in `drawWorld`). Flag it as out-of-scope here and note the locked-direction conflict.

**(4) Code pointers**
- `earn()` `app.js:1857` (apply multiplier here)
- `renderGame()` `app.js:1858` (upgrade buttons — extend the existing skateboard/trick pattern at `app.js:1868-1877`)
- `S.game.ups` reads scattered: `app.js:1329` (gold tint), `1383` skateOk, `1620` gold; add `earnMult()` helper near `earn`
- tier-driven objects → `OBJS`/`renderWorld` `app.js:1643`
- thresholds compare `S.game.total` (already tracked in `earn`)

**(5) UI**
```
In-world "gardener's shed" tap → notebook panel (overworld style):
  ✨ 240 Spark
  ─────────────────────────
  ⛲ Fountain         ✨120   ← +10% Spark from everything
  🌳 Grove           ✨400   (locked: needs ✨400)
  🏯 Estate gate     ✨3000  (your garden becomes an estate)
  ─────────────────────────
  Your garden: 🌱 Wild → 🌿 Cultivated (next: 3000 total)
```

**(6) Data** — extend `S.game`: add `tier` (default 0) and free-form `ups` keys (already an open object). Migration in `load()` `app.js:1199`: `S.game.tier = S.game.tier || 0;` (next to `S.game.garden = S.game.garden || [];`). No SCHEMA bump strictly needed (additive), but bump `SCHEMA` to 2 if you also touch garden item shape (coordinate with Feature 7).

**(7) Region** — `earn`/`renderGame` economy block (`app.js:1855-1880`) + `renderWorld` object selection. Low collision.

**(8) Effort** — **M** for the clicker/tier version. (Combat version would be L and is deferred.)

**(9) Risks / regression**
- Changing `earn()` math touches every Spark gain in the app — keep `Math.max(1,...)` floor; verify the floating `+N` still reads right.
- Tier-driven `OBJS` must coexist with Feature 1's re-skin — build Feature 1 first, then layer tiers onto its object set.
- **Direction conflict:** do NOT build enemies/combat without David's explicit re-confirmation; it contradicts the 2026-06-26 "minimal cute Zen garden" and the reward-never-shame rule.

---

## FEATURE 3 — 8-directional sprite, animated at every angle (wings move)

**(1) Ask** (audit, line 257, med, asked ×3):
> "I want character to rotate 360 like in my heaven inc game so I do think we need the 8 views" — Gap: 8 directions render, but each is a single fixed spin-frame; **no per-angle wing-flap animation loop** while walking.

**(2) Buildable?** PARTIAL → buildable as nearest-concrete. The 8-way facing already works (`spr-dir.png`, `DIR2CELL` `app.js:1472`, draw at `app.js:1655-1666`). True per-direction wing animation needs a sprite **sheet with multiple frames per direction**, which doesn't exist (`spr-dir.png` is 8 single frames, `FAIRY_META.dir = {fw:207,fh:300,n:8}` `app.js:1467`). So either (a) get an animated 8×N sheet (asset work, out of code scope), or (b) **fake the wing-flap procedurally** on top of the static directional frame — buildable now.

**(3) Approach** — two options, recommend (b) for ship-now:
- **(b) Procedural wing-flap overlay (ship now).** In the directional draw block (`app.js:1655-1666`), when `moving`, draw 2 small semi-transparent wing shapes behind the sprite whose vertical offset/scale oscillates with `Math.sin(t*9)` (reuse the walk-bob cadence from `paintHero` `app.js:1504`). Tint them the fairy aura color `col`. Per-angle: offset the wing anchor by the facing `row`/`fk` so wings sit behind whichever way she faces. Subtle, no glow (locked rule) — low-alpha fill, ink edge.
- **(a) Multi-frame sheet (later).** If David supplies `spr-dir.png` as an 8-row × N-col sheet, change `FAIRY_META.dir` to add a frame count, and in the draw pick column `Math.floor(t*flapFps)%N` (mirror how idle/fly sheets already cycle via their `n`). Asset must be produced first (Kling/AutoSprite per `GARDEN-OF-MIND.md`).

**(4) Code pointers**
- directional draw: `app.js:1655-1666` (the `if (dr && dr.complete...)` block)
- `FAIRY` / `FAIRY_META` `app.js:1467`; `DIR2CELL` `app.js:1472`; `loadFairy` `app.js:1473`
- facing math: `app.js:1657` (`fk` = direction cell from aim angle)
- walk cadence to reuse: `walkF/walkT` toggling `app.js:1704`; `Math.sin(t*9)` bob `app.js:1504`

**(5) UI** — visual only: when she walks, faint wings flap behind her in all 8 facings; idle = wings settle. No HUD change.

**(6) Data** — none.

**(7) Region** — fairy draw block inside `renderWorld` (`app.js:1650-1666`). Shared canvas.

**(8) Effort** — **S** for procedural flap (b). **M** if wiring a new multi-frame sheet (a).

**(9) Risks / regression**
- Keep the existing `bodySpin` rotation transform (`app.js:1659`) wrapping correct — draw wings INSIDE the same save/rotate so they spin with her during tricks.
- No glow on the wings (locked). Keep alpha low.
- Animation is preview-verifiable (it's a draw loop, not a gesture) — screenshot a moving frame.

---

## FEATURE 4 — Add a game HUD

**(1) Ask** (audit, line 422, med, 2026-06-23):
> "We should add a game hud i think that would help" — Evidence: `#gameHud` + guardianCap show Spark/level but there's no dedicated overlaid game-HUD.

**(2) Buildable?** YES — and partly done. `#gameHud` exists (`index.html:410`, written by `updGameHud` `app.js:1735`) and shows Spark + a contextual hint. The ask is to make it a **real HUD**: persistent corner widgets, not just a centered text line.

**(3) Approach** — flesh out `updGameHud` `app.js:1735` + `#gameHud` CSS into a proper HUD:
- **Top-left:** class · Lv · streak (reuse `vState.top`, `VCLASS` `app.js:1182`, `curStreak()` `app.js:314`). There's already a minimap circle drawn at top-left in `renderWorld` `app.js:1673` — place HUD text to its right.
- **Top-right:** ✨ Spark count (big), with the `· 🌱 grew today` / `· ship 1 thing to grow` state already computed via `hasShippedToday()`.
- **Bottom-center (optional):** contextual action hint when near a `WORLD_SPOTS` object ("tap the bonsai → your skills").
- Keep it `pointer-events:none` (already set, `index.html:412`) so it never eats joystick taps. Style on the berry palette: dark translucent chips `rgba(20,16,40,.55)`, light text, **no glow**, and **dimmer than the pink now-line** (game mode has no now-line, but keep the brightness hierarchy — nothing in-game should be neon).

**(4) Code pointers**
- `updGameHud()` `app.js:1735` (rewrite innerHTML into HUD regions)
- `#gameHud` CSS `index.html:410-412` (split into `.hud-tl`, `.hud-tr`, `.hud-hint` or use flexbox)
- data: `S.game.spark`, `curStreak()` `app.js:314`, `vState` (set in `renderChar` `app.js:1836`), `VCLASS` `app.js:1182`, `hasShippedToday()` `app.js:1856`
- HUD refresh cadence: `drawWorld` calls `updGameHud` every 30 frames (`app.js:1732`)

**(5) UI**
```
┌─────────────────────────── #world ───────────────────────────┐
│ ◐(minimap)  The Brave · Lv 4        ✨ 240 · 🌱 grew today    │  ← HUD row, translucent, no glow
│                                                                │
│                          🧚                                    │
│                                                                │
│              [tap the bonsai → your skills]                    │  ← contextual hint, only when near
│  (joy)                                                  (joy2) │
└────────────────────────────────────────────────────────────────┘
```

**(6) Data** — none.

**(7) Region** — `updGameHud` + `#gameHud` CSS. Isolated; no collision.

**(8) Effort** — **S**.

**(9) Risks / regression**
- Must stay `pointer-events:none` so it doesn't block the joysticks (`#joy` `app.js:..`, `#joy2`) or `wireWorldTap` pan.
- Don't out-bright the palette — translucent dark chips only, no neon (locked).
- Keep refresh cheap (it runs every 30 frames inside the rAF loop) — innerHTML swap is fine, don't add per-frame layout thrash.

---

## FEATURE 5 — Menus part of the game, not full-screen (diegetic in-world menus)

**(1) Ask** (cluster brief + audit lines 267, 793, 863, and `GARDEN-OF-MIND.md` "the game IS the app"):
> "menus part of the game not full-screen" / "No more separate You/Day/Grow tabs with the game bolted on. The world is the home screen. Every productivity feature is a diegetic menu reached through the world."

**(2) Buildable?** PARTIAL → mostly built, needs completion. The diegetic system EXISTS: `WORLD_SPOTS` `app.js:1760` (tap a building → open its feature), `goTab()` `app.js:1755` opens features as `body.overworld` notebook panels (CSS `index.html:469-486`), `closeFeature()` `app.js:1756`, `heroMenu()` `app.js:1757`. The gap: it's **a secondary mode** ("enter your world" button), not the home, and `WORLD_SPOTS` maps to the Cuphead objects, not zen-garden objects.

**(3) Approach** — finish the diegetic layer rather than rebuild it (don't add a third menu system — locked landmine):
1. **Re-anchor `WORLD_SPOTS`** `app.js:1760` to the new Zen-garden objects from Feature 1 (lantern→settings/brain, notice-board→plan day, bonsai/tree→skills, koi-pond or shed→habits). Keep the same `{x,y,r,fn}` shape and the same `fn` targets (`brainSheet`, `goTab('day')`, `goTab('self')`, `goTab('grow')`).
2. **Confirm the notebook-panel overworld style** (`body.overworld`, `index.html:469-486`) reads as "a notebook in the character's hand floating over the world" — it's already styled; verify it sits over the new garden art, not full-screen.
3. **Decide home-screen default** (David's words conflict across dates: "world is home" 2026-06-22 vs the later always-open Today-timeline-as-home 2026-06-24, `memory: reuse-pulldown-as-Today`). **Do NOT silently flip the default** — this is a design choice → present 2-3 options in chat first (locked rule: design = options-first). Options: (a) keep Today-timeline as home, world is the "You" tab + enter-world (current); (b) world is home, timeline is a diegetic panel; (c) a toggle.

**(4) Code pointers**
- `WORLD_SPOTS` `app.js:1760` (re-anchor to zen objects)
- `wireWorldTap` `app.js:1766` (tap-detection on spots — uses world-space x/y/r)
- `goTab` `app.js:1755`, `closeFeature` `app.js:1756`, `heroMenu` `app.js:1757`
- overworld panel CSS `index.html:469-486`; `body.overworld #screen` `index.html:477`
- the two existing menu surfaces to NOT triplicate: `#sheet` modal + notebook surface (per `CLAUDE.md` landmine)

**(5) UI**
```
Walk fairy up to the stone lantern → a hint appears (Feature 4) →
tap it → a small notebook panel slides in over the garden (NOT full-screen):
   ╭─ 🏮 ─────────────────╮
   │  Settings / Brain    │   ← notebook-in-hand, world still visible behind
   │  ...                 │
   ╰──────────────────[✕]─╯
```

**(6) Data** — none.

**(7) Region** — `WORLD_SPOTS` / `wireWorldTap` / `goTab` block (`app.js:1755-1782`). Couples to Feature 1's object positions (build Feature 1 first so spot coords match the new objects).

**(8) Effort** — **S** to re-anchor spots; **M** if also doing the home-screen default change (gated on David's pick).

**(9) Risks / regression**
- Spot coords are world-space and must match the redrawn object positions (Feature 1). If objects move, update `WORLD_SPOTS` x/y in lockstep.
- Don't add a third menu system (landmine). Reuse the notebook/overworld path.
- The home-default flip is a DESIGN CHOICE — options-first, don't just ship it.

---

## FEATURE 6 — Center FAB / nav icons: Today two-layer, Goals target, garden=You

**(1) Ask** (audit, line 430, med, 2026-06-24):
> Center FAB icons should read: Today=two-layer, Goals=target, garden=You — Evidence: Goals=`ti-target` (ok), You=`ti-plant-2` (ok), but Today=`ti-layout-list` (a list icon, NOT the "two layers stacked" requested).

**(2) Buildable?** YES — trivial. Pure icon swap.

**(3) Approach** — change the Today nav button icon from `ti-layout-list` to a two-layers Tabler icon (`ti-stack-2` or `ti-layers-intersect` / `ti-layout-2`) in `index.html:1248`. Verify the chosen icon exists in the bundled Tabler set. Keep `data-tab="day"` and the `.ne` class.

**(4) Code pointers**
- nav buttons `index.html:1247-1249`:
  - `<button class="nb" data-tab="goals"><i class="ti ti-target ne">` (line 1247, correct)
  - `<button class="nb on" data-tab="day"><i class="ti ti-layout-list ne">` (line 1248, **change this**)
  - `<button class="nb" data-tab="self"><i class="ti ti-plant-2 ne">` (line 1249, correct)
- the collapsed-Today pill icon sizing `index.html:960` (`.ne` font-size) — unaffected by icon name.

**(5) UI** — bottom nav: `🎯 Goals | ⧉ Today (two layers) | 🌱 You`. The two-layer icon signals "plan stacked over now."

**(6) Data** — none.

**(7) Region** — `index.html` nav markup only. Zero collision.

**(8) Effort** — **S** (one-line).

**(9) Risks / regression**
- Verify the Tabler icon name resolves (some `ti-*` names aren't in every build) — if it renders as a blank box, pick another two-layers glyph.
- This is the only timeline-adjacent change, but it's just an icon name — no render-path risk.

---

## FEATURE 7 — Earn points/coins and spend on character appearance / room / items / garden tools

**(1) Ask** (audit, line 222, BIG, asked ×2; related: line 53 "upgradable clothes and look"):
> "as u make points in the app u can spend it on upgrading character appearance or their home/room and also their items they can unlock" — Gap: spending exists but limited to skateboard/trick-deck/garden-plant; **appearance/room/garden-tool purchases not built** (only the single `gold` tint upgrade).

**(2) Buildable?** PARTIAL → buildable in concrete slices. Per `GARDEN-OF-MIND.md`, character look is **tiered (swap whole sprite set per milestone), NOT per-garment paper-dolls** — so "upgrade appearance" = unlock the next sprite tier, not a wardrobe. Two concrete deliverables: (a) more **garden items/tools** to buy (extends the existing plant economy, easy), (b) **appearance tier unlock** tied to garden tier (Feature 2).

**(3) Approach**
1. **More garden items (easy, ship now).** Add purchasable garden objects beyond the single plant type. Extend `plantGarden` `app.js:1811` / `renderGame` `app.js:1858` to offer a small palette: e.g. flower / bonsai / lantern / koi / bench, each a `{t}` value, drawn by `plantSpriteAt` `app.js:1538`. Currently `t = n%5` auto-cycles; instead let the player pick which item to plant (a tiny picker in the upgrade panel). This directly satisfies "items they can unlock" + "garden tools."
2. **Appearance = sprite tier.** Reuse the existing `ups.gold` recolor pattern (`app.js:1620`, `paintHero` halo `app.js:1536`, `paintGuardian` `app.js:1797`) and generalize to `S.game.skin` (0=wild,1=cultivated,2=regal). Tint/recolor the directional sprite by skin tier (until real per-tier sheets exist — see Feature 3a). Gate skin unlocks behind Spark or garden-tier.
3. **Room/home** → defer or fold into the garden-tier estate buildings (Feature 2). A separate interior "room" is a new scene = out of scope for now; note it.

**(4) Code pointers**
- spend UI: `renderGame` `app.js:1858`; existing buy-button pattern `app.js:1868-1877`
- `plantGarden` `app.js:1811`; plant draw `plantSpriteAt` `app.js:1538` + `plantSprite` `app.js:1800`
- appearance tint: `S.game.ups.gold` reads at `app.js:1329, 1383(no), 1620`; halo/robe color `paintHero` `app.js:1536`, `paintGuardian` `app.js:1784,1797`
- garden array `S.game.garden` `app.js:1645/1808`

**(5) UI**
```
Upgrade panel (in-world shed / You-tab):
  ✨ 240 Spark
  Plant:  [🌸][🌿][🏮][◯ koi][🪑]   ← pick item, then Plant ✨cost
  ─────────────────────────────────
  Your look:  Wild ✓ | Cultivated ✨300 | Regal ✨1500
```

**(6) Data** — garden item shape stays `{t}` but `t` range widens (0..K). If you store *picked* item type vs auto-cycle, no shape change. Add `S.game.skin` (default 0). Migration in `load()` `app.js:1199`: `S.game.skin = S.game.skin || 0;`. **Bump `SCHEMA` to 2** `app.js:75` and add the migration if you widen garden item meaning (defensive — a silent shape change wipes David's real garden). Additive-only changes don't strictly require a bump but bump-and-migrate is the safe pattern per `CLAUDE.md`.

**(7) Region** — economy block `app.js:1855-1880` + garden draw + sprite tint. Overlaps Feature 1 (plant colors) and Feature 2 (tiers) — sequence: F1 (skin/colors) → F2 (tiers) → F7 (items/appearance) to avoid churn.

**(8) Effort** — **M** (garden-item picker is S; appearance-tier tint is M; full room scene is L and deferred).

**(9) Risks / regression**
- Garden item shape is persisted (David's real data) — bump SCHEMA + migrate, never silently change `{t}` meaning.
- Keep `plantSpriteAt` and `plantSprite` (two draw fns, in-world + You-tab) in sync.
- Appearance tint must not introduce glow/white (locked) — recolor within berry/zen palette.

---

## BUILD ORDER (for the build-agent / parallel planning)

1. **Feature 1 (Zen re-skin)** — foundational; everything else sits on the new world. Do first.
2. **Feature 6 (nav icon)** — trivial, independent, do anytime.
3. **Feature 4 (HUD)** — independent, small.
4. **Feature 3 (wing-flap)** — independent draw tweak, small.
5. **Feature 5 (diegetic spots)** — depends on F1 object positions.
6. **Feature 2 (clicker tiers)** + **Feature 7 (items/appearance)** — share the economy block; do together, after F1.

All sit in the **game/world region** (`app.js:1460-1880` + `index.html` game-mode CSS/markup), which is **separate from the fragile timeline render** — low collision with timeline build-agents. The one timeline-adjacent change (F6 nav icon) is markup-only.
