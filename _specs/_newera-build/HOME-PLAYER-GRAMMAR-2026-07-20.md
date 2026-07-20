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

## PART 4 — NAVIGATION: A PLACE vs A MOMENT (Fable synthesis 2026-07-20, David verdict PENDING)
David's confusion: home grew out of the fold-away cockpit (overlay era), but the new-era design gives home a bottom-nav button. Which is it?
**The law that resolves it: home is a PLACE, the player is a MOMENT.** A place is somewhere you go: stable, on the map, holds the data glance (story bars), the dial, next-up, tools. A moment is something you enter and it ends: full-screen, chrome-free, hands you back where you were. They share the instrument face (PART 1) so they rhyme; rhyming is visual language, not navigation. 
- **Option A (RECOMMENDED): home = page, period.** Bottom-nav middle button; NEVER folds away. The fold-down cockpit dies as a nav concept (it was the overlay era's trick). The ONLY full-screen overlay left = the player, because a session is modal in life. Live tracking: the dial is home's face; other pages show the live mini-puck (tap → home). Gesture grammar: nav = travel, scroll = within page, takeover = session only.
- Option B: home stays a lid over the timeline (pull-down reveals the day). Cost: two routes to the planner (fold + nav button) = the messiness David already feels; home reads dismissable.
- FLIP morphs (puck ↔ dial) survive either way; they are animation, not navigation.
**VERDICT (David 2026-07-20): OPTION A CONFIRMED**, with the refinement below. Retire the fold/chevron affordance on the home face (the pull-down remains the PLANNER page's own internal mechanic if needed there). Build lands with the bottom-nav build (nav N2 rec, memory alter-home-screen-promotion).

### 4b. THE ZOOM LAW (David's refinement v2, ruled 2026-07-20 — SUPERSEDES the fold-into-dial docking idea, same day)
Home and the player are ONE instrument at TWO ZOOM LEVELS of one timeline — and it nests deeper: **day ⊃ session ⊃ section.** At every level the anatomy is identical: bars above = the CHILDREN of the current scope; circle = the current unit; below = that level's own controls. Only magnification changes:
- **Home (out):** bars = the day's blocks · circle = current block's dial · below = tools/next/info.
- **Player (in):** bars = this session's stages · circle = the orb · below = transport ONLY. The player stays fully simplified — home chrome NEVER visible in it (David explicit).
- **Section (deeper in):** the existing meditation section-zoom (scrub scoping via `_secList`) inherits the SAME animation grammar (currently unanimated — David wants it animated).
**THE TRANSITION = a camera zoom, not a UI swap.** Swipe DOWN on the player → zoom out: the orb shrinks into the dial's disc while the stage-bars COLLAPSE INTO ONE SEGMENT of the day's bar row, neighbor blocks sliding in from the edges (the acts-carousel side-peek made vertical) — mid-zoom you see before/after. The bars are the star: they persist but their MEANING re-maps (stages → day). Chrome crossfades LAST (home tools fade in only once the zoom lands). Reverse = the segment expands to fill the bar row + disc blooms into the orb.
- **Zoom back in (OPEN — David picks):** (1) swipe UP on the circle = the symmetric grammar gesture (lean); (2) tap the disc while a session runs (it breathes with the session's presence) — big target; (3) tap the live bar segment — literal but small. Lean: 1+2 together.
- **On planner / journey / game (unchanged from v1):** fold → slim MINI PLAYER BAR above the bottom nav (title, progress, pause, tap-to-expand); flush to the screen bottom when the nav folds left.
- **GUARD LAW (unchanged): at most ONE live time-object per screen.** Home = the dial (w/ the session breathing in the disc when one runs). Other pages = mini bar (session) OR live puck (tracking only); the bar replaces the puck.
- Build note: swipe-down/swipe-up on the player + home circle = NEW gesture surfaces → arbitration vs page scroll must be designed at build, DEVICE-TESTED, own session (regression-zone-grade care). Lands with/after the bottom-nav build.

## PART 5 — TIMELINE: WHAT REMAINS (2026-07-20)
1. **P-C (spec'd, safe):** week + month bodies under the D·W·M header, per planner-BUILD.md §5/§8. Paint-only Opus session.
2. **DRAG-DROP BUG (new, STRUCTURE zone, own session):** repro (David device 2026-07-20): full day planned → grab a top FUTURE block → drag DOWN (later blocks cascade down live) → release: the held block stays where dropped, the OTHER blocks disappear. Suspect region: the drag drop handler / cascade preview vs commit re-render (`calendarView` drag section) — possibly the drop path re-rendering only the held block, or reflow racing a wipe. DO NOT diagnose blind: Opus, effort HIGH, regression contract open, device re-test after. This is regression-contract item 3 territory (drag moves/resizes) + item 2 (future must not cross the now-line on cascade).

## PART 7 — HOME AS A TRUE PANE (David ruling 2026-07-20, late — the structural fix)
David: "something feels off — home pulls away and lands on Journey." Diagnosis: home is still the `#trackerFull` OVERLAY riding above the panes; closing it reveals whatever pane is beneath (boot = journey). That contradicts the Option-A ruling. **The fix: home becomes a TRUE PANE.**
- **No pull-away, no close.** The chevron/pull-down/backdrop-dismiss affordances DIE on home. You leave home by navigating. (They may stay on the cockpit's guided-flow faces if needed elsewhere.)
- **Home scrolls vertically INSIDE:** story bars + dial + What-now up top; scroll down = the 2x4 grid, then MORE tools below the fold (the library rows — David's "scrolling down reveals more tools," explicitly kept).
- **The peek carousel (H-D2b) lives in the dial area:** horizontal swipe previews the NEXT activity (and back). Peek never mutates; play-on-next = commit (finish-then-start). David re-confirmed wanting this.
- **The bottom nav is VISIBLE on home** (home contains the buttons; it is a page like the others).
- **NAV ORDER (ruled): home in the MIDDLE.** `Planner · Journey | ⌂ HOME | Game · ___`. The 5th slot is OPEN — recommendation: **You** (char sheet + profile + sanctuary door + the redesigned SETTINGS live inside it); alternatives considered and disfavored: Toolbox (redundant — home scrolls into the library), Settings (too weak for prime nav).
- **Build shape (Opus, own session, structure-grade):** this refactors `#trackerFull`'s idle/home face from overlay → pane content inside the pane carousel (PANE_GUARD contract applies; the pane-swipe must not fight the peek carousel — arbitrate horizontal ownership: peek owns the dial strip, pane-swipe owns the rest, or nav-only travel on home). The onplan/claim/night faces remain home-pane faces. Guided flows (enterStage) still overlay full-screen (they are moments). Slice it: (1) home face renders inside a pane + nav visible + scroll; (2) kill pull-away on home; (3) nav reorder to 5 slots; (4) peek carousel; (5) scroll-reveals-library.
- **SHIPPED v1147 — SLICES 1+2 (nav visible + no pull-away):** on the idle-home face a `body.home-pane` class lifts the FULL 4-button nav above the cockpit (z95, Home lit), the pull-away chevron + grab handle are hidden, content pads to clear the nav, and tapping any pane button closes the home overlay before switching (leaveHomeForPlayer in the pl/jr/gm handlers at ~14187-89). The journey+planner scroll watchers are guarded (`!home-pane`) so they never collapse the nav under home. Verified: home shows full nav + Home lit + no chevron; tap Planner → home closes, timeline lands clean; no re-collapse race. NOT a true pane yet (still the trackerFull overlay, just non-dismissable + nav-topped) — that's fine, it kills the "folds into journey" feeling. **REMAINING:** slice 3 nav reorder (Planner·Journey | HOME | Game·5th — David hasn't picked the 5th), slice 4 peek carousel, slice 5 vertical scroll-into-library, and killing any residual drag-to-close gesture. NOTE: when the planner/journey nav is collapsed (corner pill), Home isn't reachable until you expand — matches the existing collapse UX; revisit in the reorder slice.

## PART 6 — ZOOM BUILD STATUS (2026-07-20 Opus)
- **Z-1 SHIPPED (v1140): the zoom MOTION vocabulary.** Player opens with a pronounced bloom (`gpZoomIn` .42s, origin 50%/44%, in `#breatheOv.gp-ov`) and closes with a scale(.82)+fade zoom-out (the `.bw-x` handler in `timelinePlayer`). Verified in preview. This is ONLY the timelinePlayer's own open/close animation — it does not yet morph to/from the home dial.
- **ALREADY EXISTS (confirmed this session, do not rebuild):** swipe-DOWN on the player = `minimize()` → docks to the `gp-mini` bottom bar, audio + rAF keep running (app.js ~10425-10434); the act→section player zoom (`buildSecBars`, the `zoom` flag, ~10214-10231) is FUNCTIONAL but its expand/collapse is INSTANT — David wants it ANIMATED (Z-3).
- **Z-2 (NOT built — the deep unification, the piece David most wants):** swipe-down / close from a session launched at HOME should ZOOM OUT to the HOME COCKPIT (dial + story bars + tools), with the session breathing in the disc, and swipe-up / tap-disc zooms back in. **Confirmed blocker:** `leaveHomeForPlayer()` (app.js ~3498) TEARS THE HOME COCKPIT DOWN on launch, so on player close `renderAll()` lands on the panes under it (journey/planner), NOT home — screenshotted landing on Journey. Z-2 = keep home alive behind the player (or re-open it on close) + a true shared-element morph (player orb ↔ home dial, stage-bars ↔ one day-segment). Own Opus session, device-tested, with the bottom-nav era. 
- **Z-3 (queued polish):** animate the existing act→section zoom (smooth bar split + side-peek) — David's explicit "I want that animated"; it's the same grammar one level deeper and cheaper than Z-2.

## STATE NOTE
2026-07-20 Fable session: two idle-circle CSS experiments (glossy bezel, then player-orb) were tried live and REVERTED (`git checkout index.html`); the tree is clean. H-D1 re-derives the bezel from David's reference, not from those.
