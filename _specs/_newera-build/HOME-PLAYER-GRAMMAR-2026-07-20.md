# HOME = PLAYER: the two-clock grammar (Fable gameplan, 2026-07-20)

**EVIDENCE:** David's design verdict in chat 2026-07-20 (the stopwatch-circle + peek-vs-skip ruling), on top of the live v1136 home (H-A/B/C shipped) and the existing `setRing` conic mechanic. This supersedes the idle-circle styling note in home-BUILD H-A only where they conflict.

---

## PART 1 — THE LAW: one instrument, two clocks

Home and the guided player are ONE instrument (story bars on top, big circle center, carousel of stages). What differs is the kind of time they run on:

| | **Player (guided session)** | **Home tracker (real life)** |
|---|---|---|
| Time | ELASTIC. Recorded content: pause, scrub, ±15s. | RIGID. The real clock: no scrub, no rewind, ever. |
| Time UI | Transport bar + ±15 at the BOTTOM. | NONE below. The circle IS the clock. |
| The circle | Luminous orb (radial gradient, thin ink rim, soft bloom). Represents content, not time. | DIAL: activity-colored disc inside a chunky dark bezel ring; a bright arc fills the bezel CLOCKWISE as the block elapses (stopwatch). |
| Carousel forward | = SKIP. Cancels the current stage. | = PEEK. Current block keeps tracking; nothing mutates. |
| Commit gesture | (skip is the commit) | Play on a future card = FINISH current block honestly at its real elapsed, then start tracking that one. Finish-then-start, never cancel. |

**Idle = the dial at zero.** Empty bezel ring + pink play disc. The ring is the visible promise of the fill.

Derived rules:
- The luminous orb NEVER appears on home. The bezel dial NEVER appears in a guided session. Face = which clock you are on.
- While tracking, the tracked activity's dial never disappears: if the user peeks away, the live dial shrinks to the existing corner mini-puck (the `TF_PAIRS` morph pair already built for staged mode) so "what is actually running" is always on screen.
- Regression contract #2 applies to peeking: browsing the day can never move, edit, or cross blocks over the now-line.

## PART 2 — BUILD SLICES (Opus, one per session)

**H-D1 — the dial skin (pure CSS + setRing wiring).**
- `index.html` ~1569-1572 (`#trackerFull.tf-home.st-idle #tfRing / .tf-tile`): replace the thin dashed idle ring with the SOLID chunky dark bezel (David's ref screenshot: dark donut hugging the disc, soft drop below, faint pink bloom). Disc stays flat pink + play triangle (H-A language, big friendly).
- Tracking state: the bezel carries the progress arc. `setRing` (app.js ~4754) already paints a conic on `#tfRing`; restyle so the arc reads as a filling dial INSIDE the bezel, thick and legible.
- Disc while tracking wears the activity color + icon (already does via renderTrackerFull ~3714/3422).
- Verification: boots clean + screenshot idle and (state-forced) tracking. Arc feel is fine headless; this is not gesture work.

**H-D2 — peek carousel + commit-next (the one new mechanic).**
- On home while tracking: horizontal swipe between the day's blocks (past, current, next). Centered card ≠ tracked card; live dial → corner puck during peek; swiping back re-centers.
- Future card center shows a play affordance. Tap = close current block via the EXISTING finish path (real elapsed, honest log), then `startPlanned(next)`. One tap, toast + undo, no confirm sheet.
- Do NOT touch the vertical timeline or its watcher (regression zone). This is a home-cockpit surface only. Gesture work = DEVICE-UNTESTED until David's phone verdict.

**H-D3 — the seam.**
- Play on the current plan block from idle = dial starts filling (no surface change).
- Launching a TOOL/session = `leaveHomeForPlayer()` (exists, ~3497) into the orb player, full screen. On close, land back on the dial.
- Check the folded-dock mini (`#ldStop`) echoes the bezel-dial look so the morph reads as one object at two sizes.

## PART 3 — OPEN QUESTIONS for David (before H-D2)
1. **Arc color while tracking:** keep the green reward band when on-plan (existing canon: green rim = reward) and activity color when off-plan, or always activity color?
2. **Peek scope:** whole day both directions, or just prev / current / next?
3. **Commit copy:** does closing-the-current-block-early need any line at all, or silent + undo toast? (Lean: silent, less ceremony.)

## STATE NOTE
2026-07-20 Fable session: two idle-circle CSS experiments (glossy bezel, then player-orb) were tried live and REVERTED (`git checkout index.html`); the tree is clean. H-D1 re-derives the bezel from David's reference, not from those.
