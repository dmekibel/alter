# REDESIGN BUILD PLAN — the R-track (2026-07-21, Fable final; Opus executes)

**Ruling (David 2026-07-21): REDESIGN FIRST, B1 AFTER.** "Tired of the app looking like it's designed by twenty people." Supersedes the morning's B1-first order. Calendar consequence accepted under the beauty-gate rule (DECISIONS 07-21): rails/soft-launch slide right; the date flexes before the beauty does. Re-cut the calendar when R3 lands.

**Sources of law:** `DESIGN-STUDIO-2026-07-21.md` (grievance ledger A1-A14 + phases) · `STYLE-NEW-ERA.md` (every pixel) · `HOME-PLAYER-GRAMMAR-2026-07-20.md` (home/nav/zoom laws, PART 7 pane work, Z-2 blocker) · `SPEC-ONE-BUILDER-TOOLBOX-2026-07-19.md` (R4) · DECISIONS.md plan-reality law (R5) · the approved compass-rose interactive mockup (R3 visual canon). Navigate app.js by `@MAP` / `grep -n "@SEC:"` anchors ONLY.

---

## THE ORDER (one Opus session each; ship + device-verdict between)

**R1 · THE PHYSICS — Opus, effort HIGH** (wipe-kill + gesture class = the constitution's HIGH list)
1. ONE transition grammar: sheet/menu opens SLIDE over a scrim (generalize the create-sheet's existing pattern) + tap-sweep on menu rows (STYLE-NEW-ERA locked spec); pane travel = slide; session open/close = the Z-1 zoom. Whole-screen crossfades die (the 178s/285s ghost class).
2. LANDING CONTRACT: every flow close lands where it launched. Session-from-home lands on the NEW home. This kills the "cockpit came back" bug David hit: the `leaveHomeForPlayer` teardown (grep it, ~@SEC home region) makes closes land on panes/old faces (= the documented Z-2 blocker). Keep home alive behind the player OR rebuild it on close; then hunt EVERY landing path (`exitStage`, `renderAll` callers) for old-face resurfacing.
3. GESTURE-OWNS-THE-DOM: while a pointer is down, no rebuild may touch that surface. Held node moves by transform only; ONE commit render on release. Apply first to the timeline drag bug (A1: drop path re-renders racing the gesture; cascade preview vs commit). 
4. ONE-TAP PAUSE (David 2026-07-21): pausing a tracked activity currently forces a time choice. Pause = instant, no question; optional "until" chip AFTER, dismissible. Find the pause/break flow in the tracker-face region (grep Break / pause in @SEC tracker); copy through gates if lines change.
- Verify: boots clean; seeded drag test (order + geometry correct after drop, no vanishing siblings); transitions slide in preview (that much IS previewable). Gesture FEEL = DEVICE-UNTESTED, say so.
- Regression: contract items 2+3; ratchet wipe-count must not grow (transition work touches draw paths: class toggles + transforms, never new `innerHTML=""`).

**R2 · THE BROOM — Opus, effort LOW** (mechanical sweep, no structure)
- A4 reward slots: +60 card and celebration NEVER occlude the title/next rows; "streak x4" owns a row. A5 status strip: fixed icon slots aligned under pills. A6 header width budget (kill "Focus …" truncation). A7 dock bottom-clearance. A11 chip-row edge fade. A8 typewriter screens: pre-render dim + tap-to-complete.
- LEGACY CHROME SWEEP: the emoji 🛠 dev pill → `ti-tool` icon, corner, visible only in dev mode; stray counters (the "11" by the dev pill and any number not in the new-era spec) removed or folded into the strip; "Today" serif wordmark → Baloo (B8).
- Copy gates on any touched line; RU dict same commit.

**R3 · THE COMPASS ROSE — Opus, effort HIGH** (nav structure + gesture arbitration)
Visual canon = the approved interactive mockup + STYLE-NEW-ERA. Slices, in order, one ship:
1. Bottom tab bar dies app-wide.
2. GUARDIAN PUCK bottom-left: ONE object, three states (idle home glyph · session mini-player · live tracking dial). ABSORB the existing `gp-mini` bar + live puck/`#ldStop` morph pair (TF_PAIRS): reuse or replace, never a fourth floating system. Tap = home from anywhere; on home during a session, tap = player.
3. DOORS: the story strip = the planner door (whole strip tappable, subtle chevron); corner glyphs top-left journey / top-right garden; guardian-mark avatar by the gems → the You sheet (locked menu design). All ≥44px targets.
4. VERTICAL COLUMN: home scrolls up into journey, down into the tool shelf, with 10-14px peeks. **Single-owner scroll state machine: exactly one scroller owns touch at any moment, explicit threshold handoff.** Horizontal: planner/garden = pane travel (existing carousel); peek-carousel vs pane-swipe ownership per HOME-PLAYER PART 7 (peek owns the dial strip).
5. Old cockpit faces (onplan / claim / night) become home-pane faces in new-era skin, or die. No pull-away anywhere on home (v1147 slices 1-2 already shipped; finish the kill).
6. First-run: one guided swipe each way (teach-by-doing), copy gated.
- Verify: boots; every door/tap navigates in preview; nav-less screens confirmed on all surfaces. Swipe FEEL + arbitration = DEVICE-UNTESTED.
- Regression: full contract (the column touches scroll); PANE_GUARD contract; never two live day-nav/scroll models at once.

**R4 · THE TOOLBOX — Opus; mockups at effort LOW, build at HIGH** (multi-region unification)
1. Render 2-3 chat mockups (Layer-1 door screen · library card · builder row) from STYLE-NEW-ERA + ONE-BUILDER Part 1.5. David picks.
2. Build: front door = for-right-now hero + three time-doors, calm plum cards, ONE battery strip each, whole-card = play; "All tools" behind one row; credits/pips/Willingness fold into detail; SOS = quiet door pinned last; builder reskin (solid fills, one stripe accent, thick handle, big CTAs); breathing = prebuilt stacks through the same doors.
- Kill criteria: no third menu system, no new overlay ids, no new chip styles. No timeline touch.

**R5 · PLANNER FEEL — Opus, effort HIGH** (timeline regression zone)
1. Mockup FIRST (chat, David verdicts): the battery past-grammar on a real seeded day: dim late head · unfilled top · overshoot spill · empty frame. Then build it; retire the two-lane double-label paths.
2. THE RIVER (plan-reality law, DECISIONS 07-21): displaced/unlived blocks auto-flow at the now-line crossing → later-today slot else the PM-close carry list; whisper toast + undo; future-side only (contract #2). Log planned/lived pairs. **Likely SCHEMA bump + MIG block: check; the ratchet enforces the pairing; a silent shape change wipes David's data.**
3. Zoom: clamp the range (far-out belongs to W view); animate re-anchor through the flow inverse (`relayoutHourPx`/`animateHourPx`); sticky labels inside tall blocks (A12); MINFLOOR tune 46-54 against the locked canon proportions.
- Verify: seeded good/hard days; flow map exactness; full 4-item regression contract; feel DEVICE-UNTESTED.

**Then the B-track resumes:** B1 PM close (BUILD-ORDER spec + carry-basin framing) → B4 rails + founding page (David's free/paid + September-promise call happens HERE, with the page in front of him) → B3 first-day → B9-lite. D4 coat (pink-commit sweep, lessons reskin, tile hues, Z-2/Z-3 morph polish, sound pass) interleaves after R3 as LOW paint sessions.

---

## THE PREDICTION LEDGER (what Opus will get wrong; read before every R-session)

P1. **Two live scroll models = the v488 bounce.** Three timeline rebuilds died to a watcher fighting a pager. R3's vertical column WILL recreate this unless scroll ownership is a single-owner state machine with explicit handoff. Never two watchers alive.
P2. **The preview lies about gestures.** Synthetic touches pass while real fingers fail. R1/R3/R5 ship labeled DEVICE-UNTESTED for feel; preview proves boot, logic, layout, taps only. Never write "verified" for feel.
P3. **The wipe ratchet will catch transition work.** Converting crossfades to slides touches draw functions; any new `innerHTML=""` fails preship. Class toggles, transforms, keep-both-mounted-then-unmount.
P4. **Old-era tokens are radioactive.** `index.html :root` still holds the old palette. Compose ONLY from STYLE-NEW-ERA verified values; never copy a nearby legacy style.
P5. **The overlay stack is the two-menu landmine.** No new overlay ids, no fourth floating system; the puck absorbs `gp-mini`/`#ldStop`, sheets unify on slide-over-scrim.
P6. **`leaveHomeForPlayer` teardown = the cockpit-comeback class.** David SAW the old cockpit resurface. Fix the landing contract, then grep every close/render path for faces that can still appear.
P7. **State shape hides in small features.** The river's planned/lived pairs and the pause change may need SCHEMA+MIG; check every ship (ratchet enforces).
P8. **iOS specifics:** touch-action per new gesture surface, momentum scroll, 100vh standalone gap (memory law: body 100vh overflow-hidden, not dvh/fixed). Test with the 🧪 test-day path in preview, then phone.
P9. **Copy gates are not optional:** every new line (pause, doors, carry, empty states) → `copy-audit.py` + adversarial judge vs COPY-ANCHORS on cheap models; RU dict same commit.
P10. **Regression contract on every timeline-adjacent ship** (all 4 items) + SCHEMA↔MIG pairing.
P11. **Batch, don't nibble:** read the whole region once, all edits in one pass; blind edit-check-edit loops are the expensive failure.
P12. **Line numbers rot.** Every location above is approximate; grep `@SEC:` / function names, never trust cited numbers.

## SESSION PROTOCOL (each R-session, on Opus)
1. `/standup` skip allowed; open THIS file + the cited law files for the slice.
2. Read the target region(s) fully once (P11).
3. Build the slice. 4. `bash _dev/preship.sh`, commit, push, hand the fresh.html link.
5. Handoff: 5 lines in the newest TRACKER-HANDOFF, DEVICE-UNTESTED items named. David's phone verdict gates the next R.
