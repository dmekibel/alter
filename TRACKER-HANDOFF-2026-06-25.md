# ALTER — Tracker redesign handoff (2026-06-25)

Live: **v458** at https://dmekibel.github.io/alter/ · always test via **/fresh.html** (dodges cache).
Files: `app.js` (one IIFE) + `index.html` (inline CSS). localStorage key `alter_plan2`. $0 vanilla JS, GitHub Pages from `main`.

## How to work (hard rules — learned the hard way)
- **Build in the REAL app, not mockups.** Every off-palette mockup (indigo, peach, muddy matte, gold) got rejected. The app's real DOM palette is the source of truth — building in it can't drift.
- **Real palette = berry.** Page `#2c081a`, timeline/header inner `#1c0512`, ink/outline `#160510`, font **Jost**. Domain colours in `DOM` (app.js ~240): move `#ff8a3a`, focus `#36b3f0`, nourish `#34d39a`, play `#ffc83d`, connect `#ff5fa0`, create `#9a7cff/#b07aff`, restore `#2ab8c4`, **drift mauve `#c4607f`**. Each has `.light/.dark/.ink`. Pink now-accent `#ff5fa8`. **NO gold for "done".**
- **Options-first for DESIGN choices** (show in chat, David picks, then build). **Bug fixes just fix.** See memory `preview-design-options-before-building`.
- **Always-ship loop:** edit → `node --check app.js` → bump `app.js?v=NNN` in index.html → commit+push to `main` → poll `curl …/index.html | grep app.js?v=` until live → give `/fresh.html`. See memory `always-ship`.
- **Verify with the preview MCP** (`mcp__Claude_Preview__*`, launch name `alter`, port 8123). Mobile preset. Use the **🧪 test day** button (below) to populate states.
- Memory: read `~/.claude/projects/-Users-Dmekibel-claudeCode-alter/memory/alter-tracker-design-rules.md` first — it has the full locked spec. Also `alter-mockups-source-of-truth.md` (the `_mockups/` are the visual law, esp. `031` split states + `034` completed).

## The locked design model (BUILT, v450–v458)
- **Everything striped.** Finish = time: **future = dark MATTE stripes** (same hue, dimmed `saturate(.72) brightness(.72)`), **past success = bright SHINING metallic stripes** (own colour + gloss `.shine` + travelling glint `.foil` + glow + `ti-circle-check`). David's words: future/past differ by *finish*, the present produces the change.
- **Matched plan+real = ONE fused full-width bar** (`.fusedbar`); **split into two lanes ONLY on mismatch** (plan-ghost dashed | real-drift mauve+windmill). Helper `fusedIntoPlan()` skips the duplicate real log.
- **The present = the now-LINE, not a block.** Thick line tinted to the current activity's colour + a **pink circle (left) carrying the activity icon** (must NOT cover the gutter time) + a **right-side readout** `.nowread` = activity name in its colour + live elapsed. The live timer is NOT drawn as a block (`acts` loop skips `kind==="timer"`).
- **Pull-up live dock** `#liveDock` (Today only): Stop · activity · ON PLAN/DRIFT badge · live elapsed · Switch · **Plan / Replan / Drift**. Always present (idle = "start" bar). `renderLiveDock()` in app.js ~735, called from `renderLiveTracker()`.
- **No clutter below now:** removed the "start new" slot; backfill is a subtle "+".

## Key code locations (app.js)
- `calendarView(L, k, showNow, noHead)` (~1815) — the timeline renderer. Plan loop (`_bsorted.forEach`) sets cele(shining)/ghost/sched(matte) + `.fusedbar` when `status==="ok"`. Now-line render block (~1828). Real `acts.forEach` (~1900) — logs render right-lane; timers skipped.
- `renderLiveDock()` ~735 · `fillTestDay()` ~720 (the dev button calls it; button added in `buildPull` day-tools row ~646).
- `blockStatus()` ~96 (ok/miss/plan) · `domainOf()` ~265 · `onPlanMatch()`/`fusedIntoPlan()` inside calendarView.
- Zoom: `zoomTimeline()`/`zoomLive()` ~585, slider in `buildPull` header, pinch in `pb._gw` gesture block (~676).
- CSS (index.html): `.calblk` finishes + `.shine`/`.foil` (~206/468), `.nowline`/`.nowcirc`/`.nowread` (~509), `#liveDock` (~846).

## DEV: 🧪 "test day" button
In the Today day-tools row (stacks · enhance · clear · **test day**). Calls `fillTestDay()` → rewrites today: 4 matched activities in a row (streak ×4), a drift, a live on-plan activity, future matte plans. Use it to see every state. (David: we must rewrite time to simulate errors for testing.)

## NOT BUILT YET — the real backlog (in priority order)
1. **Tiny past logs as side-labelled lines** — a 2-min log should be a thin full-width line with its NAME beside it (not shrink to icon/colour). Currently `.ctiny` hides the text. (Quick.)
2. **Partial match** — "overlap = special points": where plan met reality = gold/shining for the matched span, then SPLIT at the divergence (matched part fused, drifted part split). Currently it's all-or-nothing (full fuse OR full split).
3. **Drift-overrun fork** — when a declared drift runs past its length: "→ back to [planned]" / "keep drifting · how much longer?" (reflows the day). Never built.
4. **Non-negotiables** — flag activities that survive any reschedule and hold to the END of the day; only dropped when out of time → app ASKS what to keep.
5. **The planning flow** (the big one) — "Plan tomorrow/today" builder, distinct from the stacks menu: (a) multi-select ALL the day's activities at once; (b) a 1-tap "daily fundamentals" button (recurring basics, stacked); (c) place them on the timeline; (d) mark non-negotiables; (e) out-of-time → ask what to keep.
6. **Battery animation** — the matte→shining should visibly FILL within the live block over time, not flip on completion. (David liked the battery/printing metaphor; the now-line + readout is the current compromise. Revisit if he wants the fill motion back — but he disliked the block EXTENDING into the past, so any fill must not read as "the current activity is a big past block.")

## Open/uncertain
- The current plan block still extends ~its lived minutes above the now-line as matte. David said "don't extend the current activity into the past" — may want it CLIPPED to start at now (only show now→end). Easy tweak if he flags it.
- 3-futures flows are first-pass (Plan=startPlanned next, Replan=planBreak, Drift=startOrSwitch). The Replan detour-duration picker isn't in the dock yet.

Restore points: any prior `app.js?v=NNN` commit on `main`. `git log --oneline` for v450–v458.
