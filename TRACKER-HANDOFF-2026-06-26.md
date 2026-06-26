# ALTER — handoff (2026-06-26) · live v493

**Live:** https://dmekibel.github.io/alter/ · **always test via** https://dmekibel.github.io/alter/**fresh.html** (dodges cache).
**Stack:** `app.js` (one IIFE, ~2800 lines) + `index.html` (inline CSS). localStorage key `alter_plan2`. $0 vanilla JS, GitHub Pages from `main`. No build step.

---

## ⏩ PASTE THIS TO START THE NEXT SESSION

> Continue ALTER (the $0 vanilla-JS life-sim day-planner timeline). Live at https://dmekibel.github.io/alter/, test via /fresh.html. Code: `app.js` (one IIFE) + `index.html` (inline CSS), localStorage `alter_plan2`, GitHub Pages from `main`. Current = **v493**.
>
> First, read `TRACKER-HANDOFF-2026-06-26.md` and my memory (`~/.claude/projects/-Users-Dmekibel-claudeCode-alter/memory/MEMORY.md` + the files it indexes). Honour the hard rules there: build in the REAL app (berry palette, never mockups), **options-first for design choices** (show me, I pick, then build), **always-ship loop** (edit → `node --check app.js` → bump `app.js?v=NNN` in index.html → commit+push to main → poll `curl …/index.html | grep app.js?v=` until live → give me /fresh.html), and **adversarial screenshot audit** (hunt for what's wrong vs the design rules, don't rubber-stamp).
>
> **Critical lesson (in memory):** synthetic PointerEvents in the preview PASS while real touch FAILS (touch-action gesture ownership). For any drag/scroll/pinch feature, reason about the browser's gesture arbitration and tell me it needs a real-device feel — don't claim a gesture works from a synthetic test.
>
> Verify with the preview MCP (launch name `alter`, port 8123, mobile preset) + the 🧪 **test day** button. Then pick up the open items in the handoff.

---

## The current model (what's BUILT, v467→v493)

### Day = your wake→bed window, rolls over at 4am (v490, v493)
- `DAYSTART = 4*60` (4am rollover — the dead of night, so you never SEE the date change; a 1–2am task belongs to the night before).
- `logicalK(date)` / `todayK()` / `tomK()` — which logical day a timestamp is in (before 4am → previous date).
- `nowMin()` = wall-clock (for elapsed/timers). `logicalNowMin()` = the timeline's "now" (pre-4am → +1440). `toWin(m)` maps a clock minute into the window. **Use logicalNowMin everywhere you compare to block times.**
- `wakeHour()` / `bedHour()` parse `S.profile.wake` / `S.profile.sleep` (onboarding ranges like "8–9", "11–12" — note the **en-dash** "–"). `dayWindow()` = `{startH: max(4, wake-3), endH: min(28, max(start+12, ceil(bed)+2))}`. **~3h breathing room before wake** (plan if up early), ~2h past bed. Same window for every day (uniform heights → clean stacking).
- Labels are relative (Today/Yesterday/Tomorrow) + small date; **midnight is just a faint line inside today**, not a flip. Off-hours (bed→wake) aren't drawn, so scrolling flows from bedtime into the next morning.

### Continuous infinite vertical timeline (v488) — the big architectural piece
- `buildPull()` (the Today view) renders a **3-card horizontal pager** (prev/cur/next) for the SIDE-SLIDE. The **CUR card's `.day-cardscroll` is a multi-day STACK**: `focus-2..focus+2` (5 day-`.day-sec`s) each via `calendarView`, with a floating per-day chip (`.day-stacksep`). Prev/next cards are single-day (slide preview only).
- **Vertical scroll just flows** between days (they're pre-rendered) — no edge, no pull, no cut.
- `attachInfinite(sc)` — on scroll, finds the day at the viewport centre, updates `pullDayLabel`, and when you cross into a new day it **recenters** `pullFocusK` + rebuilds (the buffer follows you = infinite). Guarded by `_infRebuild`.
- **Seamless rebuilds:** `buildPull` captures a scroll **anchor** (`keepAnchor` = which day + offset is centred) and restores it, so recenter / minute-tick / edit rebuilds keep your exact view (no jump). Heights are uniform because `dayWindow()` is fixed per render.
- **Scroll "wall" (v491):** `.day-cardscroll{scroll-snap-type:y proximity}` + `.day-sec{scroll-snap-align:start}` — gentle scroll settles at a day boundary, a firmer stroke carries through. **FEEL UNTESTED ON DEVICE.**
- `pageSlide(dir)` = the horizontal Apple-Photos side-slide (the ONLY sideways animation). The `pb._gw` gesture block (pinch-zoom + horizontal swipe) is unchanged; swipe now works even starting on a bubble (the bubble only edits on a near-stationary tap — `<12px` movement guard in both move up2s).

### The activity editor (v475–v478) — tap any bubble
- `editorSheet(o, k, isLog)` (one function; `blockEdit`/`logEdit` are wrappers). **Tap any bubble** (plan or real, incl. empty + tiny via its rail chip) → this sheet.
- **Merged HERO** = the activity name IS the switch button, in its domain colour (empty → dashed "＋ choose activity"). **Length SLIDER** 30s→12h (log-scaled). **Auto-save** (no Save btn; footer = Done + trash). Priority segmented + pin (plan only) + collapsed steps + "mark done".
- **z-index fix (v475):** `#sheet` is `z-index:69` — it was 30, BEHIND the always-open timeline (`#pullSheet`=40) and dock(60)/nav(55), so taps "did nothing". This was the real bug behind "the menu doesn't show."
- Berry restyle scoped to `#sheet.edsheet` (v476) — no white pills; the global `!important` candy rule (`#ffdcef`, index.html ~line 411) is what made things look pale.

### Drag model
- Plan move handler (`card.addEventListener("pointerdown"...)`, ~line 2060). **Now-line barrier (v483):** `_started` (start ≤ now today) = static (can't reorder); `_floor` clamps a future block so it can't drag back past the present.
- **Cross-lane fling** (past + showNow): drag a plan bubble across into the real lane / vice-versa = relocate; a fused/done bar flung left→plan-only, right→real-only.
- **Cross-day drag (v492):** drop a bubble over a DIFFERENT `.day-sec` (found by Y-bounds in up2) → re-homes to that day. **Caveat: the card PINS at the day edge during drag (no float-follow); it lands correctly on release. Visual polish pending.**
- **reflow (v472/v479):** a block already STARTED today (`hm(time) <= logicalNowMin()`) is a FIXED anchor — a future edit never reshuffles the past. `reflowLogs` does the same for the real lane.

### Other shipped this session
- Test day (🧪) `fillTestDay()` — realistic mixed day (streak ×3, partial, miss, drift, straddling Focus block, futures); past run clamps to wake-hour.
- Straddling-now block = ghost-bone past (domain-dark + outline + domain-light title) + matte future; tracked stretch fuses full-width.
- Drift = black bg + dark-red text. Rail chips bigger + clickable + dodge the NOW readout band. Now-circle pulled to the left edge.
- Empty bubbles: tap → full editor (dashed hero), drag → trash (v481).
- Backfill "+" gaps adjust live during real-lane drag/resize (`gapAdj`).

---

## Key code locations (by function — line numbers drift)
- **Day model:** `DAYSTART`, `logicalK`, `todayK`, `logicalNowMin`, `toWin`, `wakeHour`, `bedHour`, `dayWindow` (~80–92).
- **Timeline render:** `calendarView(L, k, showNow, noHead)` (~1976) — uses `dayWindow()`. Now-line render inside it. Rail layout near the end (`railItems` + `nowRightBand` dodge).
- **Pull/day view:** `buildPull()` (~708); the CONTINUOUS-STACK branch (the `else` ~757), `keepAnchor` (~740). `attachInfinite` (~656), `pageSlide` (~645). Zoom: `relayoutHourPx`/`zoomCommit` (loop ALL `.day-sec` per card), `pb._gw` gesture block (~768).
- **Editor:** `editorSheet` + `blockEdit`/`logEdit` (search "function editorSheet"). `#sheet` z-index 69 + `#sheet.edsheet` restyle + `.day-stacksep` chip + scroll-snap (index.html).
- **Drag:** plan move handler (~2055–2085), real-lane handler (~2095–2130), `gripHold` (onTap quick-tap-opens). `reflow`/`reflowLogs`/`blockPast` (~2495).
- **Test day:** `fillTestDay()` (~803).

---

## OPEN ITEMS / next (priority order)
1. **Cross-day drag visual polish** — make the bubble FLOAT into the neighbour day as you drag (currently pins at the edge, lands on release). David flagged this.
2. **Scroll "wall" feel** — David must test on device; tune proximity-snap vs a softer custom JS dampening if it's too grabby / not grabby enough.
3. **Verify the whole continuous-scroll + day-model on a REAL phone** — slow pull, the wall, cross-day drag, the 4am rollover at actual late-night, side-slide off a bubble. Several of these were only synthetic-verified.
4. **Wake/bed in onboarding** is captured but there's no quick re-set in settings beyond "Redo setup"; consider a 1-tap wake/bed editor.
5. Older backlog still open: drift-overrun fork, non-negotiables (🔒 hold-to-end, out-of-time → ask), the side-stretch-to-fuse gesture (plan↔real fusing without a full lane cross), Plan-day arrange flow polish.

## Known caveats / gotchas
- **Synthetic touch tests LIE** about gesture features (touch-action). Always flag device-testing for drag/scroll/pinch. (memory: `touch-gestures-need-device-testing`)
- `node --check app.js` before every ship. A mid-line `//` comment once ate the rest of a single-line statement + its closing braces — watch single-line density.
- Commit messages via `git commit -F /tmp/msg.txt` (heredoc-in-`-m` broke). End with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- The infinite-scroll recenter can drift under aggressive *programmatic* scrollTop sets (test artifact); real incremental scrolling is fine.

## How to work (hard rules — see memory)
- **REAL app, berry palette, never mockups.** Page `#2c081a`, ink `#160510`, Jost font, Tabler icons. `DOM` domain palette (app.js ~240).
- **Options-first for DESIGN choices** (show in chat / `show_widget`, David picks, then build). Bug fixes just fix.
- **Always-ship loop** + **adversarial screenshot audit** (see the paste-prompt).
- Verify with preview MCP (`alter`, 8123, mobile) + 🧪 test day.
