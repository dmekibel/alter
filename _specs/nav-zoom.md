# SPEC — Navigation: zoom day/week/month (FRAGILE)

**Cluster slug:** `nav-zoom` · **Source:** GRAND-AUDIT-2026-06-26.md §"Navigation / timeline / scroll / gestures" (line ~581)

> ⚠️⚠️ **HIGH RISK — TIMELINE / NAV REGRESSION CONTRACT.** Every feature here touches the timeline render and the gesture stack, which has been rebuilt **3×** (v488 → v496 → v501) and re-broken on nearly every nav change since. **Build incrementally, ship one feature at a time, device-confirm each before the next.** The continuous-scroll model and the pinch handler are a single tangled system — read the "SHARED LANDMINES" section first; it applies to every feature below.

---

## SHARED CONTEXT (read once, applies to all features)

### The zoom/nav state machine — current truth
- **Three scopes:** `pullZoom ∈ {"day","week","month"}` (module var, app.js:651). Switched via the **scope-seg** buttons (app.js:830 day-header / app.js:844 week-month-header) which call `zoomAnim(dir)` — a CSS keyframe entrance (`zoomBroad`/`zoomClose`, index.html:601-602), NOT a gesture.
- **Within-day pinch** = **hour-density zoom only** (`pullHourPx`, default 64, clamp [20,520], app.js:651). A 2-finger vertical pinch changes how many px/hour, anchored to the minute under the finger midpoint. It does **NOT** cross day→week→month.
- The pinch handler is wired once on `#pullBody` (`pb._gw`, app.js:896). Pointer flow: `pointerdown` (app.js:901) → `pointermove` (app.js:907) → `gend` on up/cancel (app.js:916). Two fingers (`n===2`, app.js:905) sets `_pinching=1`, cuts momentum scroll (`overflowY:"hidden"`), anchors by minute. Live frames go through `zoomLive`→`relayoutHourPx` (app.js:696,677). Release calls `zoomCommit` (app.js:695) — one crisp re-render via `calendarView`.
- **One-finger horizontal swipe** pages prev/next day via the `.day-pager` translateX (app.js:715 `pageSlide`). **One-finger vertical** falls through to native continuous scroll, which recenters the day buffer via `attachInfinite` (app.js:727).
- **The day view is a continuous ±3-day STACK** (app.js:866-895): the `.day-card.cur` holds a vertical stack of `.day-sec` (one per day, R=3 each side), each rendered by `calendarView`. `attachInfinite` recenters the buffer only at the very edge (app.js:737).

### The anti-overlap machinery (already strong)
- `layoutLane(items)` (app.js:2255) does interval-graph column packing: groups overlapping items, assigns `it.col` / `it.cols`. Used for the REAL lane only in practice.
- `place(card, mins, durv, lane)` (app.js:2309): bars get their **TRUE time-height** (`durv/60*HP`, floor 5px) → back-to-back bubbles physically can't overlap. PLAN = left lane (`left:26px; right:calc(50% + 4px)`), REAL = right lane.
- `degradeCard(card)` (app.js:664): height-based label tier — `lbl-s` (<9px sliver), `lbl-i` (<22px icon-only), `lbl-c` (<42px compact), full (≥42px). `dataset.gate` = menu/move/full by height.
- **Right symbol rail** (app.js:2534): bars too thin to label inline push their icon to an evenly-distributed right-side rail (`railchip`), so thin bars stay visible without overlapping. `liveReflowCal` (app.js:666) rebuilds the rail live every pinch frame.
- One activity at a time: the REAL lane is **always full-width**, never split into multitask columns (app.js:2449).

### LOCKED design rules (HANDOFF-visual-redesign-2026-06-27.md)
- Deep berry/wine palette; **NO neon / glow / shine / white surfaces / `.shine`/`.foil`**.
- The **pink now-line is the BRIGHTEST thing on screen** (`#ff5fa8`, index.html:577) — nothing may out-bright it.
- Bubbles = deep jewel fills + **subtle** low-contrast diagonal stripes; missed = dark ghost hollow + muted domain outline.
- Full-screen, low-clutter. The zoom slider was deliberately **removed** (commit 6de4ffa, app.js:57) — do not bring back any +/- buttons or slider.
- Scope icons are already "meaningful symbols" (Tabler `ti-list` / `ti-layout-columns` / `ti-layout-grid`), NOT +/-.

### Reuse these helpers
`add()` `el()` `DOM` `mixHex()` `esc()` `fmt()` `dur()` `hm()` `blocks()` `logs()` `save()` `relLabel()` `keyAdd()` `kd()` `key()` `todayK()` `dayWindow()` `logicalNowMin()` `degradeCard()` `layoutLane()` `calendarView()`.

---

## FEATURE 1 — Day→week→month by zooming OUT, back by zooming IN (meaningful symbols, not +/-)

**(1) Ask** (audit line 598, 🟦 BIG, asked ×2):
> "going from day to week and then to month should be simply by zooming out and zooming in"

**(2) Buildable?** **PARTIAL → concrete.** The scope buttons + animated transition + meaningful icons already exist and are correct (audit: "scope-seg uses meaningful icons ... NOT plus/minus"). What's **missing** is the literal *pinch gesture crossing scope boundaries*: today the pinch only zooms hour-density within the day; it never tips into week/month. Concrete version: **when a pinch-OUT bottoms out at min density, it triggers `pullZoom` day→week; pinch-IN at the week's max-zoom returns to day.** (Keep the buttons too — they're the reliable fallback David endorsed.)

**(3) APPROACH:**
1. In the live pinch (`pointermove`, app.js:909) you already compute `pHPLast = clamp(pHP0 * vd/pVD0, 20, 520)`. Add a **threshold latch**: when the pinch is still *contracting* (`vd/pVD0 < 1`) AND `pullHourPx` is already at the floor (`20`) AND the user keeps pinching in past a margin (e.g. cumulative ratio `vd/pVD0 < 0.62`), set a one-shot flag `_scopeBreak = +1` (zoom OUT to week), `e.preventDefault()`, and **end the pinch** (call the gesture-end path) so the next render is the new scope.
2. Symmetric for pinch-OUT in week view: wire a pinch handler branch for `pullZoom==="week"` (currently the pinch is gated to `pullZoom==="day"` everywhere — see the `&& pullZoom === "day"` guards at app.js:909,910,918). A pinch-OUT in week → month; pinch-IN in week (ratio >1.6) → back to day.
3. On scope break, call the **same** code the buttons use: set `pullZoom`, reset `pullK=todayK()` if returning to day, `pendingScrollNow=true`, then `zoomAnim(dir)` (app.js:708). Reuse `zoom(dir)` (app.js:823) which already maps the ordered transition — do NOT duplicate the order array.
4. Debounce: after a scope break, ignore further pinch deltas until all fingers lift (`_scopeBreak` cleared in `gend`). Otherwise one continuous pinch skips day→week→month in a frame.

**(4) CODE POINTERS:**
- `pullZoom`, `pullHourPx` decl: app.js:651
- Pinch live frame (add threshold latch here): app.js:909
- Pinch start (`n===2`): app.js:905; pinch end `gend`: app.js:916-918
- `zoom(dir)` ordered transition: app.js:823; `zoomAnim(dir)`: app.js:708
- Scope buttons (the button path to mirror): app.js:830, 844

**(5) UI** (locked palette): No new chrome. The transition is the existing `zoomBroad`/`zoomClose` scale-fade (.26s). Optionally a faint berry pinch-hint at the floor: a 1-line label `↔ keep pinching for week` in `#a78aa0` (the scope-b idle color) that fades in only when at floor density — but **confirm with David first** (this is a design choice, options-first per his rule). Default = silent break.

**(6) DATA:** None. `pullZoom`/`pullHourPx` are session-only module vars, not persisted. No SCHEMA change, no `load()` migration.

**(7) REGION:** Gesture handler (`pb._gw` block, app.js:896-927) + `buildPull`'s `zoom()` (app.js:823). **High contention** — Feature 2 and the Tracker-Mode work both touch this block. If parallel: this owns the pinch `pointermove`/`gend` scope-break logic only.

**(8) EFFORT:** **M** (the latch is small, but tuning the threshold + the week-view pinch branch + not re-breaking the day pinch is fiddly and device-only-verifiable).

**(9) RISKS / regression:**
- ⚠️ The day pinch is **extremely** tuned (5+ "FAST-RELEASE JUMP FIX" / "bounce fix" comments, app.js:695,718,905,918). A scope-break that fires accidentally mid-hour-zoom = rage. Make the floor-latch require BOTH (at clamp floor) AND (extra margin) so normal hour-zoom never trips it.
- ⚠️ The `_pinching` flag suppresses `attachInfinite` recenter (app.js:731). A scope break must clear `_pinching` AND not leave `#pullBody.zooming` stuck (app.js:851 already guards on rebuild, but verify).
- **Regression contract #1 (continuous vertical scroll):** scope-break must not corrupt the buffer scroll position when you later return to day. Returning to day already does `pullK=todayK(); pendingScrollNow=true` → lands on now-line. Confirm.
- **DEVICE-UNTESTED is the only honest verdict** for the gesture feel — preview pinch lies (CLAUDE.md). Label it.

---

## FEATURE 2 — Smooth, beautifully-animated timeline zoom (not jittery)

**(1) Ask** (audit line ~581 cluster; reinforced by the "smooth zoom between day/week/month" + jitter complaints in HANDOFF history):
> day↔week↔month and hour-density zoom should animate smoothly, not jitter/bounce.

**(2) Buildable?** **PARTIAL — mostly done, polish remaining.** Enormous work already landed: `relayoutHourPx` (live, no DOM teardown, app.js:677), `zoomLive` rAF throttle (app.js:696), `zoomCommit` bounce-fix (app.js:695), the scroll-snap-on-release fix (app.js:1198), the fast-release jump fix (app.js:918), the per-second-creep transform clear (app.js:905). The **scope transition** is a flat `zoomBroad`/`zoomClose` scale-fade (app.js:712) — functional but not "beautiful." Concrete remaining work = (a) make the **scope** transition a true crossfade between the day-stack and the week-grid (currently the new scope just pops in scaled), (b) hunt residual hour-zoom jitter on device.

**(3) APPROACH:**
1. **Scope crossfade:** `zoomAnim` (app.js:708) currently does `buildPull()` then animates `#pullBody` as one block. Improve: render the OUTGOING scope as a frozen snapshot layer, render the new scope underneath, crossfade opacity + the existing scale over .26s, then drop the snapshot. Keep `cubic-bezier(.2,.7,.3,1)`. **Do NOT** add glow/blur (locked rule) — pure opacity+scale only.
2. **Hour-zoom jitter:** the live path is already crisp; the known jitter sources are (a) scroll-snap re-engaging (already fixed app.js:1198) and (b) the now-line per-second-creep transform (already cleared app.js:905). If David still reports jitter, the next suspect is `liveReflowCal` (app.js:666) rebuilding the rail every frame — it reads inline styles only (no forced layout) but DOM churn at high finger velocity can drop frames. Mitigation: only re-rail when a bubble actually crosses a density tier (compare `degradeCard`'s class before/after; skip rail rebuild if no tier changed).
3. Confirm `#pullBody.zooming` kills ALL transitions during the gesture (index.html:520) so nothing tweens against the rAF reposition — it does; keep it.

**(4) CODE POINTERS:**
- `zoomAnim`: app.js:708; keyframes: index.html:601-602
- `relayoutHourPx`: app.js:677; `zoomLive`: app.js:696; `zoomCommit`: app.js:695
- `liveReflowCal` (rail rebuild per frame — the jitter suspect): app.js:666
- `.zooming` transition-kill: index.html:520
- scroll-snap removal (bounce fix): index.html:1198

**(5) UI:** No new elements. The scope crossfade is the only visible change; it must stay within the wine/berry sky (the `.day-card` is full-bleed sky, index.html:1193) — the crossfade is between two timeline contents, the sky behind is continuous.

**(6) DATA:** None.

**(7) REGION:** `zoomAnim` + the live-zoom functions (app.js:666-714). Overlaps Feature 1 (both in the pinch/zoom subsystem) but a different function set — Feature 1 owns the gesture-end scope-break, Feature 2 owns the animation rendering. Coordinate the shared `zoom()`/`zoomAnim` callers.

**(8) EFFORT:** **M** (the crossfade is real work; the jitter side is investigate-then-small-fix).

**(9) RISKS / regression:**
- ⚠️ A snapshot-crossfade layer that doesn't get removed = a ghost timeline stuck on screen. Use `{ once: true }` animationend + a setTimeout fallback (mirror `pageSlide`'s `fin()` double-guard, app.js:722).
- ⚠️ Touching `liveReflowCal` risks the rail "re-spacing on release" bug already fixed twice (app.js:669,672). If you add a skip-if-unchanged guard, verify the commit render still matches the live rail exactly (that exact-match is what kills the bounce).
- Per CLAUDE.md: prefer targeted updates, **do not** add another `innerHTML=""` wipe surface.
- **DEVICE-UNTESTED** for smoothness — preview frame timing ≠ iPhone.

---

## FEATURE 3 — No overlapping bubbles at ANY zoom level (only a drift-mid-habit split breaks a bubble)

**(1) Ask** (audit line 603, 🟦 BIG):
> "main goal now is to avoid the mess on screen, so no overlapping at any Zoom zoomed in or out"

**(2) Buildable?** **PARTIAL — strong machinery, needs a min-render-size + zoom-out packing pass.** Anti-overlap is real: true-height bars (app.js:2309), `layoutLane` column packing (app.js:2255), the right rail for thin bars (app.js:2534). The gap (audit + open ledger item #2, line 454): at **far zoom-out**, sub-minimum bars collapse toward each other and their *labels/rail chips* can collide; there's no enforced **minimum render size** so a 30-second activity vanishes or overlaps a neighbor's chip. This is the same ask as the dropped-cluster item "Minimum render size for small activities + clever zoom-out packing in correct order (never dots)" (audit line 454).

**(3) APPROACH:**
1. **Minimum bar height:** in `place()` (app.js:2309) the floor is `Math.max(5, durv/60*HP - 4)`. 5px is below the rail-threshold but two 5px bars 1 minute apart still won't overlap *as bars*. The real collision is **labels/icons**. The right rail already even-distributes chips (app.js:2536) so thin-bar icons can't pile up — that's the correct mechanism. Extend it: ensure the rail's `_rpitch` floor (currently 18px, app.js:2536) is enforced AND that the rail never extends past the cal height (clamp the last chip).
2. **Inline-label suppression at zoom-out:** `degradeCard` (app.js:664) already hides text below 22px and shows icon-only below 9px. Verify the thresholds hold at the *lowest* `pullHourPx` (20px/hour): a 30-min bar = 10px → `lbl-i` (icon only). Good. A 5-min bar = ~1.6px → `lbl-s` → goes to the rail. Confirm no inline text ever renders on a sub-9px bar.
3. **Clever zoom-out packing "in correct order, never dots":** the rail IS the packing mechanism (icons in time order, even-spaced). Confirm the rail preserves chronological order (it sorts by `y`, app.js:2535 — yes). The one missing piece per David: at extreme zoom-out the rail can run out of vertical room. Add: if `railItems.length * 18 > cal.height`, cap chip count and append a `+N` summary chip (reuse the `railchip` style, ink on domain color) rather than overflowing.
4. **Never break a bubble except drift-mid-habit:** the only legitimate bubble split is the partial-match / drift case (app.js:2368 "overlay the MATCHED span"). Confirm no zoom level introduces a second visual split. (It won't — splits are status-driven, not zoom-driven.)

**(4) CODE POINTERS:**
- `place()` (bar height floor): app.js:2309
- `degradeCard()` (label tiers): app.js:664
- Right rail even-distribution + pitch floor: app.js:2534-2537; live version `liveReflowCal`: app.js:666-673
- `layoutLane()` column packing: app.js:2255
- The legitimate drift/partial split: app.js:2368

**(5) UI** (locked palette): rail chips stay as-is (domain-color fill, dark ink, `.railchip`). New `+N` overflow chip = same style, label "+N", color = neutral berry `#3a1228` with `#ffb3d6` ink (matches the streak chip, app.js:2277). No new bright surfaces.

**(6) DATA:** None.

**(7) REGION:** `calendarView` render body (app.js:2274-2538), specifically `place`/`degradeCard`/rail. **Heavily shared** — this is THE timeline render the whole app depends on. Any parallel build-agent touching bubble rendering, the tracker, or domain colors collides here. If parallel: this owns the rail-overflow + min-render-size logic only; do not alter the partial-match split or lane geometry.

**(8) EFFORT:** **M** (the machinery exists; this is a targeted hardening + the `+N` overflow chip + device verification at min zoom).

**(9) RISKS / regression:**
- ⚠️ **THE rail logic was re-fixed 3 times** in two days (app.js:669,672,2536 "even-distribute," "match the commit render"). The live rail (`liveReflowCal`) and the commit rail (app.js:2536) **must stay byte-identical in spacing** or release bounces. Any `+N` cap must be applied in BOTH or in neither.
- ⚠️ Changing `place()`'s height floor risks the back-to-back no-overlap guarantee (regression contract #2-ish). Keep the true-height model; only touch labels/rail.
- ⚠️ Don't reintroduce "dots" — David explicitly rejected dots (audit line 454). Min icon size stays an actual icon (`ti-*`), not a dot.
- **DEVICE-UNTESTED** for "looks clean at every zoom" — must screenshot at 390×1500, multiple `pullHourPx`, on a real packed day. Use `fillTestDay` (app.js:936) to populate.

---

## FEATURE 4 — Full-screen, narrower bubbles

**(1) Ask** (audit line ~581 cluster):
> bubbles should be narrower / the timeline should use the full screen width.

**(2) Buildable?** **YES.** Pure CSS/geometry. Today PLAN = `left:26px; right:calc(50% + 4px)`, REAL = `left:calc(50% + 4px); right:4px` (app.js:2309), with the gutter at 26px. "Full-screen" is largely done (v561 stripped the sheet/header/lanehead frames; `.day-card` is full-bleed, index.html:1193). "Narrower bubbles" = tighten the lane geometry and/or the time gutter so bubbles read as slimmer columns with more sky around them.

**(3) APPROACH:**
1. **Tighten the gutter:** the left time gutter is 26px (PLAN `left:26px`, the nowcirc sits at `left:2px` w=16px, index.html:580). Reduce PLAN `left` to ~22px and confirm hour numbers (`.calhrl`) + nowcirc still fit. (Hour labels `_hl.style.top` only; their left is CSS — check `.calhrl` left in index.html.)
2. **Narrower bubbles:** add inner horizontal padding to each lane so the fill is slimmer than the lane box, e.g. PLAN `right:calc(50% + 8px)` and REAL `left:calc(50% + 8px)` (widen the center gap from 4px→8px). This makes both columns visibly narrower with a clean center channel — matches the "full-screen narrower bubbles" intent (more breathing room, less slab).
3. **Future single-lane bar** (app.js:2336 `futurebar`, `right:4px`) — keep full-width (no real lane exists yet); just apply the same slimming inset (`right:8px`, `left:22px`).
4. Verify the now-line (`left:26px; right:4px`, index.html:577) still spans correctly; nudge to match new gutter (`left:22px`).

**(4) CODE POINTERS:**
- `place()` lane left/right: app.js:2309
- `futurebar` full-width branch: app.js:2336
- nowcirc / nowline geometry: index.html:577-580
- gutter-dependent labels `.calhrl`/`.calsub`: rendered app.js:2297-2299, styled in index.html (grep `.calhrl`, `.calhour`)

**(5) UI** (locked palette): slimmer PLAN (left) + REAL (right) columns with a wider sky channel down the middle; deep jewel fills + subtle stripes unchanged; now-line still brightest. **Show David 2 options first** (per his options-first rule): (A) tighten gutter only, (B) gutter + wider center channel. Let him pick before building.

**(6) DATA:** None (CSS/inline-style geometry only).

**(7) REGION:** `place()` (app.js:2309) + index.html now-line/gutter CSS. Overlaps Feature 3 (both in bubble geometry) — coordinate: Feature 4 owns lane left/right insets + gutter width; Feature 3 owns height/label/rail. They can ship together but as separate, clearly-scoped diffs.

**(8) EFFORT:** **S** (geometry tweak + 2-option preview).

**(9) RISKS / regression:**
- ⚠️ The drag-across-lanes logic computes "over real / over plan" by `cx > rect.left + width*0.5` (app.js:2389,2465,2518). A wider center channel doesn't move the 50% midline, so drag arbitration stays correct — but **verify** the futurebar slim-inset doesn't make a future bubble look like it crosses the midline.
- ⚠️ The rail sits at the right edge (`railchip`); narrowing the REAL lane (`right:8px`) must not collide with the rail. Check rail `right` in index.html.
- Regression contract #3 (tap-empty creates / drag moves / tap-bubble edits) must still work after geometry change — the tap/drag hit areas are the lane boxes, unchanged in position.
- **DEVICE-UNTESTED** for feel; **preview screenshot at 390×1500 IS valid** for the static look (it's layout, not gesture) — verify there.

---

## BUILD ORDER (recommended, lowest-risk first)
1. **Feature 4** (S, CSS geometry, screenshot-verifiable) — ship, confirm look.
2. **Feature 3** (M, hardening of existing machinery) — ship, screenshot packed day at min zoom.
3. **Feature 2** (M, animation polish) — ship, device-confirm smoothness.
4. **Feature 1** (M, the riskiest gesture change) — ship LAST, device-confirm the pinch doesn't false-trigger.

Ship one at a time. Label every gesture-touching change **DEVICE-UNTESTED** in the handoff until David confirms on his iPhone.
