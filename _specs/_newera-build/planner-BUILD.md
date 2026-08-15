# PLANNER / TODAY — NEW-ERA BUILD SPEC (scanner day, D·W·M)

Canon: David's 2026-07-19 planner screenshot (Gym / Lunch / Claude code NOW / Read) + core-redesign locks (memory `alter-core-redesign-complete`) + `_specs/STYLE-NEW-ERA.md` (verified palette; load first).
Skin law: MINIMAL / BIG / FRIENDLY (Part 0).
**THE REGRESSION ZONE.** `@SEC:TIMELINE` was rebuilt 3x. Everything here is split PAINT (safe) vs STRUCTURE (careful). Model: OPUS, effort HIGH. Never two day-nav models at once. Re-check the regression contract (CLAUDE.md) before every ship.

## 1. WHAT EXISTS (do not rebuild)
`calendarView(...)` draws each day; `buildPull()` stacks them into the continuous scroll; `weekStrip()` above; now-line with end-dots; two-lane PLAN|REAL physics with straddle split; per-hour `.skybg` day/night tint; month cells (`.mocell`). ALL geometry/gesture/recenter math is UNTOUCHABLE in this build. This build is a RESKIN + a header + view switching.

## 2. THE TARGET (from the screenshot)
A calm dark day: hour numerals in quiet lavender at the left, big rounded blocks in ONE lane-look, generous spacing. Four block treatments:
- **LIVED (past, done/tracked):** domain-color STRIPED fill (the `tfStripe` 45deg recipe), white Baloo label + icon, no border shout. (Gym.)
- **QUIET/UNTRACKED past or low-key block:** OUTLINED — near-ground dark fill, domain-color 1.5-2px border + domain-color label/icon. (Lunch, gold.)
- **CURRENT (straddling now):** striped fill in its domain color + the NOW treatment: soft glow `0 0 18px rgba(255,95,168,.42)`-family in the BLOCK's hue, and the nuanced-now straddle: the portion ABOVE the now-line keeps stripes (lived), the portion BELOW renders MATTE (flat dimmer fill) = the future part not yet printed. (Claude code.)
- **FUTURE:** hue-low-alpha recede — flat matte fill of the domain hue mixed well toward ground (`mixHex(c,#160510,~.65)`), muted label. No stripes. (Read.)
Stripes = lived time ONLY. That one rule carries the whole "time converts" story.

## 3. SCANNER NOW-LINE
The now-line becomes the print head: keep the existing line + dots, add ABOVE it a short upward glow gradient (`linear-gradient(0deg, rgba(255,95,168,.28), transparent ~48px)`, full width, `pointer-events:none`) = the present "printing" the day downward. Below the line: nothing added. A small NOW pill tag at the line's right end (pink `#ff5fa8`, white text, radius pill) if not already present. PAINT ONLY: appended nodes, zero geometry.

## 4. CONSTANT 3-ZONE HEADER + D·W·M
One fixed header over the Today pane, identical in all three views: LEFT "Today" (or the centered day's name when scrolled; reuse the existing week-strip's centered-day tracking), CENTER a segmented D · W · M control (pill bg `#2a1230`-family, active segment pink fill + white letter, inactive lilac), RIGHT the gem/spark count (existing `.spark-pill` data). Big: ≥44px tall segments.
- D = the existing continuous day scroll (default, unchanged).
- W = week view. M = month view.
- The header REPLACES nothing structural; it overlays where the current pull-sheet header row lives. The week-strip stays in D view (it is the day-tracker contract item #4) unless it visually duplicates the header, in which case it may fold INTO the header zone (decide at build, screenshot-verify both).

## 5. WEEK + MONTH VIEWS
- **W — whole-day columns:** 7 shorter columns, one per day: stacked mini color-bars (per titled block, domain hue, lived=bright/future=dim), day number on top, tap a day → D view centered on it. Reuse `weekStrip` data helpers; render into the same pane as a swapped body (a `pullMode` flag), NOT a second scroll engine.
- **M — stacked-scroll month:** the existing `.mocell` grid restyled to new-era (quiet cells, per-day dominant-domain color dot/fill, today ringed pink); vertical scroll of month blocks. Tap day → D view centered.
- LAW: D/W/M are three BODIES under one header. Only D has the infinite scroll. W and M are simple static renders (no recenter math, no pagers). Never let W or M host a competing day-nav gesture model (the v488-vs-pager fight).

## 6. CSS + CODE SHAPE
- CSS: one contiguous new-era block; classes `.ne-lived`, `.ne-quiet`, `.ne-future`, `.ne-nowglow`, `.ne-hdr`, `.ne-seg`, `.ne-week`, `.ne-month`. Colors ONLY from STYLE-NEW-ERA + `DOM{}` jewels.
- JS: block treatment = a pure `blockSkin(b, k)` classifier called where `calendarView` already styles bubbles (additive class + inline bg swap; the existing style writes stay as fallback). Header+segment = new small render; `pullMode` ('d'|'w'|'m') in module state, NOT in SCHEMA.
- i18n: new strings through `tr()` + RU dict same commit. Copy through both gates (few lines: Today, day names, "NOW").

## 7. REGRESSION CONTRACT MAPPING (re-verify each ship)
1. Continuous vertical scroll across days: UNTOUCHED by P-A/P-B (paint). W/M (P-C) must not intercept D's gestures (render only when switched, display:none otherwise).
2. Started/past set-in-stone; future can't cross now-line: untouched (no drag/geometry edits).
3. Tap-empty-creates / drag-moves / tap-bubble-edits: untouched; new classes must not add pointer-events surprises (`.ne-nowglow` = pointer-events:none).
4. Week-strip + Today/Now pill track the centered day: header's centered-day label READS the same source; do not fork it.

## 8. SLICES (ship each separately, device-check between)
- **P-A block skins + scanner glow:** `blockSkin` + 4 treatments + now-glow + NOW pill. Pure paint. Biggest visible win, lowest risk.
- **P-B header + D·W·M shell:** 3-zone header, segment switches bodies; W/M can land as stubs behind the segment first (D fully unchanged).
- **P-C week + month bodies:** the two static views.
- Each slice: preview-verify boots/renders/no-errors + the contract's non-gesture items; label all gesture feel DEVICE-UNTESTED; David verdicts on phone before the next slice.

## 9. GUARDS
No SCHEMA bump anywhere (pure presentation + module flag). Ratchet: no new wipe sites (blockSkin mutates classes on existing nodes where possible). The 4am logical-day law untouched. If ANY slice needs geometry edits, STOP and split it into its own spec'd session.

---

## ★ THE MINIMUM-SIZE PLANNER (David's canon mockup — LOCKED 2026-07-20)
David's repeated planner mockup (Gym / Lunch / Claude code NOW / Read) IS the target and it is NOT the current build. This is the minimal, user-friendly planner: **every activity is a readable card, never a sliver**, so tiny activities are always visible and easy to drag relative to the others.

### The model (David decided, 2026-07-20)
1. **Minimum floor, then grow.** Every block is at least a comfortable card (~48-54px, always visible + draggable). Longer blocks grow taller from that floor. (NOT uniform cards — duration still reads.)
2. **Push later blocks down.** When a short block's minimum height exceeds its real time-slot, the block keeps its size and later blocks slide down. Times become the labels ON the cards; the vertical ruler stretches (the hour gutter becomes a loose reference, not a strict pin).
3. **Single lane** (the mockup is one column of full-width cards, not the PLAN|REAL two-lane). Verify with David whether two-lane dies or folds in.
4. Block skins unchanged from §2: lived/now = striped (Gym, Claude code), quiet = outlined (Lunch, Read), NOW = glow + NOW pill. 12h gutter (shipped v1150). **No week strip** (mockup omits it).

### Why it is a REBUILD, not a tweak (the coupling — read before touching)
`calendarView` pins EVERYTHING to exact time-Y via `topFor(min)` + `barH(dur)`: the block cards (`settle`, line ~8757), the now-line, the live tracking charge segment (`.chgseg`/`.matchseg`, grows per-second at `topFor(tsm)`), the matched shining spans, the straddle-now split (ghost past + matte future), the drag/resize math (`timeFromY`/`topFor`), the pinch-zoom reflow. The 14px sliver floor exists SO these never collide. A flow/push-down layout breaks "y = exact time" for all of them — each overlay must be repositioned relative to the FLOWED block top, not raw time. This is the region rebuilt 3x (v488→v496→v501) and broken each time.

### Build shape (dedicated Opus run, spec-first, DEVICE-TESTED, regression contract open)
1. Compute a **flow map**: sort plan blocks by time; `flowTop[b] = max(topFor(b.time), prevBottom + GAP)`; `flowH[b] = max(MIN_H, barH(dur))`; `prevBottom = flowTop+flowH`. One source of truth.
2. Re-point EVERY positioner to the flow map: `settle`, the initial `place`, the straddle/tracking segments, matched spans, the now-line (sits at the current block's flowed edge), the committed-future bar.
3. Rework drag/resize: dragging changes time; the flow re-lays-out live (extend the existing `preview()` push-down, which ALREADY does overlap push-down for drag — the seed of the model).
4. Regression contract re-verify (all 4) + device-test drag/scroll/now-line feel. Ship as ONE slice; do NOT half-ship the geometry.
