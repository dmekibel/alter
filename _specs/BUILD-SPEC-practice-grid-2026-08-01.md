# BUILD SPEC — the Practice Grid (Option A) + honest tray + why-lines + dose folding
*2026-08-01. David's verdicts locked in chat: Option A grid · names gated (Move/Breathe/Relax/Meditate/Gratitude/Rewire, Morning Stack, Night Stack, Wins) · evict the fake tray tools · why-lines on every tile. NO paywall gating ships in this build (rails come with Stripe; the pricing line lives in the handoff). Builder: Opus agent, SOLO, no commit, no preship. Regions: @SEC:TOOLBOX2 + @SEC:EDITOR data + designAudit (@SEC:DEV). The timeline/regression zone is NOT touched.*

## Laws that bind this build
- Navigate by grep anchors only. Zero new `innerHTML=""` wipes (ratchet). Every NEW user-facing string through `tr()` + RU dict in the same edit (RU register: mom-plain). No SCHEMA change (everything here is additive or display-level; ids NEVER change).
- New user-facing strings are ONLY the gated ones in §5 + reused already-shipped labels. Do not invent copy.
- `node --check app.js` must pass. Report each edit site by anchor.

## 1. The grid (TBX_TOP v2)
Final visible grid, 2 rows of 4, FIXED design order (the arc IS the meaning): Morning Stack · Breathe · Body · Meditate · Heart · Vision · Night Stack · Build your own.
- `TBX_TOP = ["firstLight","breatheLadder","body","mind","heart","vision","shutdown"]` + the existing pinned Build tile as the 8th cell (inspect `renderToolbox2` for how the builder tile is pinned today; keep that mechanism, adjust counts so the grid renders exactly these 8).
- **Usage reordering OFF for the top grid**: render TBX_TOP in design order, do not pass it through `tbxOrder` (folders keep tbxOrder). One-line comment: the grid teaches the practice order.
- Display renames (ids unchanged, precedent v1087): `firstLight.name` → "Morning Stack" · `mind.name` → "Meditate" · `shutdown.name` → "Night Stack". `body`/`heart`/`vision` keep names. Kickers all stay as shipped.
- NEW registry item `breatheLadder`: `{ name: "Breathe", dom: "restore", ti: "ti-lungs", peek: ["move","focus"], kicker: "BREATHE" (reuse shipped string), def: 5, bands: §2 }`.
- Demoted from the grid (registry entries stay, reachable via folders + heroes): beforeDeepWork, caughtScrolling, urgeWave, spunUp, iMessedUp, emptyTank, cantSleep, lockTheWin, feelBetter, fullStack. `TBX_SECOND` is dead data; leave or delete, builder's call.

## 2. Structural dose folding (replaces pure proportional scaling for registry stacks)
Add optional `bands` to registry items: `[{min: <minutes>, track: [...]}]`, largest `min` ≤ chosen dose wins, then `tbxScaleTrack` scales WITHIN the band. New resolver `tbxTrackForDose(id, mins)`: user edit (`tbxEdit`) → existing behavior (edit + scale, folds don't apply); else item.bands → band pick + scale; else item.track (legacy). Wire it into `tbxLaunch` and the dose card's step list so the shown steps match the chosen dose band.
Bands (seconds; sums may be ±10 percent, scaler evens them):
- firstLight: 2min [breathe 60, mantra 60] · 5min [stretch 60, breathe 60, relax 45, meditate 90, gratitude 45] · 10min [stretch 75, breathe 75, relax 60, meditate 150, v_open 90, gratitude 45, reprogram 75, mantra 30] · 15min [stretch 90, breathe 90, relax 75, meditate 210, v_open 150, gratitude 60, reprogram 150, mantra 75]
- breatheLadder: 2 [v_coherent 120] · 5 [v_coherent 150, v_box 150] · 10 [v_coherent 150, v_box 150, v_exhale 150, v_478 150] · 15 [v_coherent 180, v_box 180, v_exhale 180, v_478 180, v_nostril 180]
- body: 2 [stretch 120] · 5 [stretch 120, relax 90, v_bodyscan 90] · 10 [stretch 150, relax 120, v_bodyscan 330]
- mind: 2 [meditate 120] · 5 [breathe 60, meditate 240] · 10 [breathe 60, meditate 300, v_noting 120, v_open 120] · 15 [breathe 60, meditate 360, v_noting 180, v_open 300]
- heart: 2 [gratitude 60, v_metta 60] · 5 [gratitude 90, v_metta 210] · 10 [breathe 60, gratitude 120, v_metta 300, mantra 120]
- vision: 2 [reprogram 120] · 5 [gratitude 45, reprogram 150, mantra 105] · 10 [breathe 60, gratitude 60, reprogram 300, mantra 180]
- shutdown: 2 [v_478 120] · 5 [relax 90, v_478 120, gratitude 45] · 10 [relax 120, v_bodyscan 180, v_478 180, gratitude 60, mantra 60]
Verify every `v_*` key resolves through the existing variant plumbing (`TBX_VARIANTS` / `stackTool` path) before using it in a band; if one does not run, substitute its base runner and flag it in your report.

## 3. Folders (TBX_CATS v2) — moment-keyed, stacks + tools
- catch: "Catch", ti-hand-stop, [caughtScrolling, urgeWave, t_tapping, t_breathe]
- reset: "Reset", ti-wind, [spunUp, fullStack, t_shakeOff, t_relax]
- recover: "Recover", ti-heart-handshake, [iMessedUp, emptyTank, feelBetter, t_journal]
- begin: "Begin", ti-flag, [beforeDeepWork, t_mantra, t_stretch, t_climb]
- night: "Night", ti-moon-stars, [cantSleep, t_evening, t_bodyScan, t_patience]
- wins: "Wins" (gated; replaces "Settle"), ti-trophy, [lockTheWin, t_journal, t_meditate]
Keep existing dom color assignments sensible (builder picks from the same dom palette; wins = create/gold-adjacent is fine). RU for "Wins": "Победы".

## 4. The build tray (SED_CATS v2) — honest engines only
Six chips, in the arc order, gated names: Move · Breathe · Relax · Meditate · Gratitude · Rewire. Every coin's `sk` must run the engine its label describes. REUSE already-shipped coin labels/descs wherever named below (they are shipped copy; do not rewrite them).
- move ("Move", ti-run, dom move): shoulder roll (stretch) · forward fold (stretch) · shake it out (stretch) · body stretch = reuse t_stretch's shipped label "Stretch" (stretch, 5m)
- breath ("Breathe", ti-lungs, restore): box breath (v_box) · 4-7-8 (v_478) · long sigh (v_exhale) · count ten (breathe) · one nostril (v_nostril) · match the wave (v_coherent)
- relax ("Relax", ti-flower, restore): let go (relax; reuse t_relax label "Relax" if "let go" is not already shipped) · body scan (v_bodyscan) · hand on chest (relax) · tap it out (relax; reuse t_tapping's shipped label "Tapping")
- meditate ("Meditate", ti-moon, focus): sit in silence (meditate) · noting (v_noting; label from the shipped variant name "Noting") · open awareness (v_open; shipped "Open awareness") · mantra repetition (v_mantra; shipped "Mantra repetition")
- gratitude ("Gratitude", ti-heart, connect): say thanks (gratitude) · one good thing (gratitude) · kind sentence (v_metta) · picture a friend (v_metta)
- rewire ("Rewire", ti-quote, create): mantra (mantra; shipped tool name "Rewire" is the chip, the coin can reuse "Mantra") · visualisation (reprogram; shipped "Visualisation")
EVICTED (delete the coins, leave orphaned RU dict entries): step outside · cold splash · one flight · glass of water · name the pull · the next move · look far away · brain dump · ask why once · five-minute start · close the tabs · where am I · text one person · one song · stand in light · slow drink · watch nothing · lie flat · one line down · photo of now · rate the mood · mark the win · voice memo · check it off. The old "mind"/"feel"/"rest"/"log" chips die with them. One comment at SED_CATS naming why (species law: the tray offers only runnable guided steps; activities live in the planner picker, log actions are app features).

## 5. Why-lines (gated copy, EXACT strings, Gate 1 + Gate 2 passed 2026-08-01)
Render in the dose card (openStack): under the kicker, two short lines: `what` (plain) then `why` (muted). New classes `.tbx-what`/`.tbx-why` styled to match existing card text (Jost, ~12.5px, existing muted ink tones; no new hues). Every string through tr() with RU (mom-register, builder translates).
- firstLight: what "Wake the body, breathe, settle, sit, then aim the day." · why "The order is the mechanism: a settled body lets the mind listen."
- breatheLadder: what "Breathing patterns, easy to hard, one at a time." · why "A longer exhale than inhale tells the body the danger is over."
- body: what "Stretch, release, scan: get back inside your body." · why "Muscles store the day; a slow fold gives them permission to drop it."
- mind: what "Attention training, from counting breaths to resting as awareness." · why "Noticing you wandered and coming back is the rep. The return is the muscle."
- heart: what "Gratitude, then kindness, then sending it to someone real." · why "Worry and gratitude cannot share the body; one always leaves."
- vision: what "See the goal done, feel it, then say the line." · why "The brain rehearses what you vividly picture as if you lived it."
- shutdown: what "Put the day down, unwind, seed tomorrow." · why "Sleep locks in whatever state you hand it. Hand it a calm one."
- Build tile: what "Your stack, your order, any length." · why "Start in the body; a braced nervous system ignores instructions." (judge PASSED 2026-08-01, 17/17)

## 6. designAudit (the ship gate must survive its own change)
Update the grid gates to the new truth: tile1 = firstLight (name Morning Stack, dom move, same hue expectations) · tile2 = breatheLadder (restore hue) · tile3 = body (upkeep hue; replace the old Caught Scrolling/connect expectation). Read expected hexes from the live `:root`/DOM registry the audit already uses; never hardcode a hex the registry does not carry. ADD one gate: "dose card carries what+why lines" (open firstLight's card, assert both text nodes non-empty). Audit total grows; all gates must PASS in preview before handing back.

## 7. Heroes (FOR YOU NOW)
Morning hero name string "Morning stack" → "Morning Stack" (RU dict "Утренний стек" already exists; keep). Winding-down hero name "Shutdown" → "Night Stack" (+RU "Ночной стек"). stackIds unchanged.

## 8. Verify + report
`node --check app.js`. Then a self-review pass: every band key resolves, no coin lies about its engine, no new wipes, tr() coverage, audit updated. Report: edit sites by anchor, band substitutions if any, string additions, anything in the file that contradicted this spec (report, do not improvise).
