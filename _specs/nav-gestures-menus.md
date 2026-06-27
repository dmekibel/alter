# SPEC — Navigation: gestures & menu placement

**Cluster slug:** `nav-gestures-menus` · Audit section: *Navigation / timeline / scroll / gestures*
**Source files:** `app.js` (~3259 lines, the whole app), `index.html` (shell + all CSS). Never edit `server.js`.
**Ship:** `bash _dev/preship.sh` → `git add -A && commit && push`. Current ver **v561**.

---

## LOCKED DESIGN RULES (apply to every item here)
- Deep berry/wine palette; per-domain colors from the `DOM` object (`app.js:~249`, e.g. move `#ff8a3a`, nourish `#34d39a`, focus `#36b3f0`, create `#b07aff`, connect `#ff5fa0`, play `#ffc83d`, drift `#180608`). Surface chrome is wine: dock `#1c0512`, ink edge `#160510`.
- **NO neon / glow / shine / white surfaces.** No `.shine`/`.foil`. The pink **now-line `#ff5fa8` is the brightest thing on screen** — nothing may out-glow it.
- One activity tracked at a time; reward-never-shame copy.
- Full-screen, low-clutter. David already had me strip the right rail, sep pills, lane divider, frames.
- Reuse the helpers: `add(parent,tag,cls,txt)` (`app.js:1393`), `el(id)` (`app.js:74`), `esc()` (`285`), `mixHex(a,b,t)` (`286`), `fmt/dur/hm/pad`, `blocks(k)`, `logs(k)`, `save()`, `domainOf()` (`274`), `DOM`/`DOM_ORDER` (`2697`), `reflow(k)` (`2881`), `renderToday()` (`2563`), `timeFromY()` (`2226`), `logicalNowMin()` (`86`), `activeTimers()` (`372`), `nextPlannedBlock(k)` (`376`), `bentoPicker(opts)` (`2709`).
- **TIMELINE RENDER IS FRAGILE — rebuilt 3×.** `calendarView()` (`app.js:2274`) + `buildPull()` (`818`) + `attachInfinite` (`689`) + the pinch-zoom path. **Any change to bubble layout, scroll, the create gesture, or the pull-down = HIGH RISK.** Honor the regression contract in `CLAUDE.md` (continuous vertical scroll across days; past=set-in-stone; tap-empty creates / drag moves / tap-bubble edits; week-strip + Now pill track centered day). Gesture feel is **DEVICE-UNTESTED** in preview — never claim a swipe/drag/scroll "verified"; say "boots clean; gesture feel device-untested."

---

## Shared map of the current nav surfaces (read once)
- **Bottom nav** `<nav id="nav">` (`index.html:1295`): 3 tabs Goals / **Today** / You. Wired at `app.js:3251`. Apple-Music collapse: scrolling the timeline adds `body.nav-collapsed` (`app.js:730`); collapsed CSS shrinks nav to a corner pill (`index.html:1004-1009`) and floats `#liveDock` beside it (`index.html:1010`).
- **Live dock** `<div id="liveDock">` (`index.html:1281`): bottom info bar. `ld-grab` handle, `ld-main` (stop · `ld-info`=act+sub · elapsed · switch), `ld-seg` (Plan/Replan/Drift). Rendered by `renderLiveDock()` (`app.js:965`). Tapping `ld-info`/`ld-grab` → `openTrackerFull()` (`1038`); press-hold `ld-info` 450ms → `planBreak()` (`1003`).
- **Tracker-full (the RING)** `<div id="trackerFull">` (`index.html:1312`): expanded live tracker overlay, `openTrackerFull`/`closeTrackerFull`/`renderTrackerFull` (`app.js:1038/1039/1069`), `TF_OPEN` flag (`1037`). This is the queued "Tracker Mode" — out of scope for *this* cluster except where items below feed it.
- **Pull-sheet** `<div id="pullSheet">` (`index.html:1329`) = the always-open timeline on `body.tab-day` (`index.html:1025`). `pullGrab` is the close-handle (`app.js:971`).
- **Notebook door** `<button id="notebookBtn">` (`index.html:1308`) — currently lives **inside `#gameMode`** (`index.html:1300-1309`), bottom-left, `#notebookBtn{left:22px;bottom:116px}` (`index.html:910`), and is `display:none` outside the game (`index.html:1020`). Wired `app.js:3236` → `notebookSheet()` (`605`).
- **Create-on-tap** gesture: `cal.addEventListener("pointerdown"…)` (`app.js:2511`) → `makeBlock()` (`2521`) on a quick tap on empty plan/future; quick tap on the present/past REAL lane → `bentoPicker` to track. **Press-and-hold-create was REMOVED** per David 2026-06-27 (`app.js:2522` comment).
- **Bento** `bentoPicker()` (`app.js:2709`): overlay `.bento-ov` (`index.html:596`), grouped by domain via `bentoByDomain()` (`2706`), 2-col cat grid with `+N` to expand a category (`renderExpanded`, `2772`), search, pinned row, press-hold-chip to pin (`2729`). It is an **overlay**, opened on demand — not persistent.

---

# FEATURE 1 — Press-hold-drag in plan mode pulls out an empty habit bubble to assign

**(1) Ask** — *"In plan mode press and hold and then drag pulls out empty habit bubble that u click to pick what it is"* (med, 2026-06-24).

**(2) Buildable?** PARTIAL → **nearest-concrete version that respects history.** The literal press-hold-DRAG-to-stretch-out-a-bubble was tried and abandoned ("drag-on-timeline can't beat the scroller, so we don't try" `app.js:2521`; and press-hold-create itself was removed 2026-06-27, `app.js:2522`). **Do NOT re-add a hold-to-create timer on `cal` pointerdown — David explicitly rejected it.** The concrete buildable win that still satisfies the *intent* (press a bubble out, then size it by dragging): keep **quick-tap creates a 30-min empty "tap to choose" bubble**, then make that bubble **immediately drag-sizable from its bottom grip without re-entering it** — i.e. the create gesture flows straight into a resize-drag if the finger keeps moving down. This is the "pull it out to the length you want" feeling, gated behind the safe tap (not an accidental hold).

**(3) APPROACH**
- In the `cal` pointerdown handler (`app.js:2511`): today on `up()` a clean tap calls `makeBlock()` (`2521`) which pushes a 30-min empty block and opens the editor via `editBlk`. **Change the flow:** when the press lands on empty PLAN/future space AND the finger then drags **downward past a threshold** (e.g. >14px) *before* `moved` cancels it, treat it as "pull out a bubble": create the empty block at `downM` and live-grow its `mins` to the drag-Y (reuse the math in the existing grip-resize, `app.js` grip handler) instead of cancelling on `moved`.
- Crucially: a drag that is mostly **vertical-scroll-shaped** must still scroll (the timeline scroller wins) — only a *deliberate downward pull that starts from a clean empty-slot press and exceeds the duration of one grid row* becomes a pull-out. If you can't make that arbitration reliable against the scroller (the documented reason it was abandoned), **fall back to: quick-tap makes the empty bubble, and the bubble opens with its bottom grip pre-highlighted so the next drag sizes it.** Ship the fallback; flag the drag-out as DEVICE-UNTESTED.
- The empty bubble already renders as `<i class="ti ti-hand-finger"></i> tap to choose` (`app.js:2378`) and opens the picker — keep that. "click to pick what it is" is already satisfied; this item is purely about the *gesture to birth + size* it.

**(4) CODE POINTERS** — `cal.addEventListener("pointerdown"…)` `app.js:2511-2533`; `makeBlock()` `2521`; `editBlk` (defined inside calendarView ~`2313`); the existing bottom-grip resize for plan blocks (search `gript`/`grip` inside the plan-bubble block ~`2440-2492`); `gripHold()` helper `app.js:2263`; empty-card label `2378`; `timeFromY` `2226`.

**(5) UI** — On empty deep-wine plan space: press → a faint domain-neutral bubble (fill `#8a5cf0`-base, the current empty color, deepened to `mixHex("#8a5cf0","#160510",.6)`) materializes at the touch and **grows downward following the finger**, snapping to 5-min. Releasing opens the bento picker. No glow; the bubble stays darker than the now-line.

**(6) DATA** — none new. Empty block shape unchanged (`{id,time,mins:30,title:"",prio:2,color:"#8a5cf0",done:false}`). No migration.

**(7) REGION** — `calendarView` create-gesture (`app.js:2511-2533`) + plan-bubble grip. **Overlaps Feature 7's `makeBlock` region** — coordinate.

**(8) EFFORT** — **M** (the scroll-arbitration is the hard part; fallback is S).

**(9) RISKS** — HIGH: touches the create gesture *and* scroll arbitration — the exact combo that caused past bounce/scroll-fights. Must not reintroduce a hold-timer (rejected). Verify on device that normal vertical scroll on empty space still scrolls and doesn't spawn stray bubbles. Regression-contract items #1 and #3.

---

# FEATURE 2 — Bottom info menu slides up to expand to a larger menu

**(1) Ask** — *"the bottom is like a menu of information, and if we slide up, it expands to a larger menu"* (med, 2026-06-23).

**(2) Buildable?** PARTIAL → **YES as a refinement.** The pieces exist: `#liveDock` is the bottom info menu (`renderLiveDock` `app.js:965`), it has a `.ld-grab` handle (`index.html:1282`), and tapping the handle/info already opens the full RING via `openTrackerFull()` (`app.js:1008`). What's missing is the literal **slide-UP-to-expand finger gesture** (today it's a tap). Add a drag-up on `.ld-grab`/`ld-info` that finger-follows into `#trackerFull`, mirroring the existing `pullGrab` drag-down pattern.

**(3) APPROACH**
- Add a pointer drag on the dock handle (`.ld-grab`) in the `dk._wired` block (`app.js:993-1010`). On `pointerdown` capture `startY`; on `pointermove` with negative `dy` (upward), translate `#trackerFull` from off-bottom toward `0` proportional to `-dy/H` and fade its backdrop — exactly the inverse of `pullGrab` (`app.js:971`, which does `translateY(-fr*100%)` finger-follow). Past ~40% of travel on release → `openTrackerFull()` (snap open); otherwise spring back. `#trackerFull` is already a full-inset overlay (`index.html:698`) with `.on` toggling display — give it a transient inline `transform` during the drag and clear it on settle (same close-transition-cleanup discipline as `closePull` `app.js:935`).
- Keep the existing **tap** path (`_grab.onclick → openTrackerFull` `app.js:1008`) as the discoverable fallback.

**(4) CODE POINTERS** — `renderLiveDock` wiring `app.js:993-1010` (esp. `_grab` `1008`, `_info` `1001-1007`); `openTrackerFull/closeTrackerFull` `1038/1039`; the finger-follow reference `pullGrab` pointermove `app.js:971` / `renderLiveTracker` drag `1022-1024`; `#trackerFull` CSS `index.html:698-699`; dock CSS `index.html:1038-1048`.

**(5) UI** — The wine dock (`#1c0512`) with its `ld-grab` pill: drag the pill up and the **ring tracker rises from the bottom, same wine→navy gradient** (`#trackerFull` bg `linear-gradient(#1a0712→#140f26)` `index.html:698`) so it reads as the dock *growing*, not a new screen. No flash, no white. Drag down on the open ring (`tfClose` chevron, `index.html:1313`) collapses it back.

**(6) DATA** — none. No migration.

**(7) REGION** — `renderLiveDock` `dk._wired` block (`app.js:993-1010`) + `#trackerFull` overlay CSS. Self-contained; low conflict with timeline-render.

**(8) EFFORT** — **M**.

**(9) RISKS** — MED. Drag must not fight the timeline scroller behind the dock (dock is `position:fixed` so it should be isolated, but verify `touch-action`). The expand target `#trackerFull` is the queued "Tracker Mode" surface — this only adds the *open gesture*, don't redesign the ring contents. Gesture feel DEVICE-UNTESTED.

---

# FEATURE 3 — Keep the bento box always nearby; scroll inside categories

**(1) Ask** — *"the bento box needs to be always nearby for access u know?"* (med, 2026-06-23, asked ×2).

**(2) Buildable?** PARTIAL → **YES, two concrete moves.** (a) Category scrolling *already works* inside the overlay (`renderExpanded` `app.js:2772`, `+N` per cat `2754`, scrollable `.bento-body`) — that half is done. (b) "Always nearby" is the gap: bento is an on-demand overlay. The smallest honest win that does NOT re-clutter the full-screen timeline = a **persistent quick-open bento affordance** rather than a permanently-docked panel (a permanent panel fights the locked "full-screen, low-clutter" rule). Add a small always-present bento button so it's one tap from anywhere on the timeline.

**(3) APPROACH**
- Add a compact circular **bento button** (Tabler `ti-layout-grid`, the same icon the audit notes the month scope uses) pinned bottom-area near the dock, e.g. left of `#liveDock` or stacked above it, only on `body.tab-day:not(.gaming)`. On click → `bentoPicker({title:"Add to your day", onPick: x => …})`. Decide its onPick by context: if there is an active timer, switch; else if there's a now-or-soon plan, this is "track now"; default = create a plan block. Simplest correct default: open the picker and on pick, **start tracking now** if it's the present (mirror the rightTrack branch `app.js:2529`), else add a plan block at `now` (mirror `makeBlock`). Keep it dumb and one-purpose to avoid a third menu system.
- Do NOT make it a persistent always-expanded grid panel (rejected vibe + clutter). "Always nearby" = always one tap away, which this delivers.
- Confirm the in-overlay category scroll is smooth on device; if a long category overflows, ensure `.bento-body` / `.bento-gridwrap` has `overflow:auto` (check `index.html` bento CSS near `.bento-body` `~596+`).

**(4) CODE POINTERS** — `bentoPicker` `app.js:2709`; `renderExpanded` (category drill-in + scroll) `2772`; per-cat `+N` `2754`; bento CSS `index.html:596+` (`.bento-ov`, `.bento-card`, `.bento-body`, `.bento-cat`, `.bento-chips`); place the new button near `#liveDock` markup `index.html:1281-1294` and CSS `index.html:1038+`; wire in `bindGlobal`/main wiring near `app.js:3236-3251`.

**(5) UI** — A small wine pill button (`#1c0512`, `border:3px solid #160510`, domain-neutral icon in `#ffe3f1`) at the bottom corner, matching the dock's material. Opens the existing bento overlay (already on-palette: cats tinted `mixHex(D.c,"#160510",.72)` `app.js:2749`). No glow.

**(6) DATA** — none. No migration.

**(7) REGION** — New button in the dock/nav cluster (`index.html` ~1281-1299) + main wiring (`app.js:~3236`). Touches `bentoPicker` only as a caller. Low conflict with timeline-render. **Shares the bottom-corner real estate with Features 2, 6 — coordinate placement so buttons don't collide.**

**(8) EFFORT** — **S** (button + one picker call) if category-scroll needs no fix; **M** if scroll containers need rework.

**(9) RISKS** — LOW–MED. Main risk is clutter (violates full-screen rule) — keep it one small button, not a panel. Don't add a third menu paradigm; it must reuse `bentoPicker`.

---

# FEATURE 4 — Place menus cleverly like the Instagram UI

**(1) Ask** — *"The menus need to be located in a clever place like the Instagram ui"* (small, 2026-06-21).

**(2) Buildable?** VAGUE → **nearest-concrete version.** "Instagram UI" decoded = (a) persistent bottom tab bar that *collapses/hides on scroll* and (b) primary actions reachable by thumb at the screen bottom. Both are largely already honored: collapsing Apple-Music nav (`app.js:730`, CSS `index.html:1004-1010`) + the bottom `#liveDock`. The concrete deliverable is a **placement/consistency polish pass**, not a new IG clone. Treat this as an umbrella that's *satisfied by shipping Features 2, 3, 6 cleanly* (all bottom-anchored, thumb-reachable, collapse-aware).

**(3) APPROACH**
- Audit the three bottom-corner affordances (collapsed nav pill `index.html:1006`, `#liveDock` `1038`, plus any new buttons from F3/F6) so they (i) sit in the thumb zone, (ii) share the same wine material + `#160510` edge, (iii) all participate in `body.nav-collapsed` (slide together, not overlap). The collapsed-nav corner-pill + floating-dock pattern (`index.html:1004-1010`) IS the IG-style move — make every menu obey it.
- Don't build a literal IG layout. Document in the handoff that this item = "honored via bottom-anchored, scroll-collapsing, thumb-reach placement," matching the audit's own resolution.

**(4) CODE POINTERS** — nav collapse trigger `app.js:730`; nav wiring `3251`; collapsed CSS `index.html:1004-1013`; dock CSS `1038-1048`.

**(5) UI** — No new surface. Consistency: every bottom menu is wine `#1c0512`, `border:3px solid #160510`, `box-shadow:0 4px 0 #160510`, slides on the same `.26s cubic-bezier(.2,.85,.3,1)` the collapsed nav/dock already use.

**(6) DATA** — none.

**(7) REGION** — Bottom nav/dock CSS + collapse logic. Overlaps F2/F3/F6 placement.

**(8) EFFORT** — **S** (polish/coordination), assuming F2/F3/F6 do the real work.

**(9) RISKS** — LOW. Mostly judgment; the trap is over-building a literal clone David didn't ask for. Keep it placement discipline.

---

# FEATURE 5 — Live tracking panel anchored at top; notebook button bottom-right above the right stick

**(1) Ask** — *"what ur tracking now from above is not bad instead of from below. and notebook button bottom right above the right stick"* (small, 2026-06-23).

**(2) Buildable?** PARTIAL → split into two concrete moves:
- **5a. Notebook button → bottom-right.** Buildable **YES, S.** Currently `#notebookBtn` is bottom-**left** (`index.html:910`, `left:22px;bottom:116px`) and inside `#gameMode` only. The right stick `#joy2` is the bottom-right twin-stick (`index.html:1306`). Move the notebook button to bottom-right, above `#joy2`.
- **5b. Live tracking panel anchored at TOP.** Buildable **PARTIAL — but likely SUPERSEDED.** David has since locked the bottom `#liveDock` + the now-line readout on the timeline (`nowread` `app.js:2301`) as the tracking surface, and the whole later redesign assumes bottom-dock tracking. **Do NOT relocate the live dock to the top without re-confirming** — this 2026-06-23 ask predates the settled bottom-dock design (memory: tracking lives in the dock + now-line). Treat 5b as "confirm with David before building" and ship 5a now.

**(3) APPROACH**
- **5a:** In `index.html:910` change `#notebookBtn{ left:22px → right:22px; bottom:116px }` so it sits above `#joy2` (`#joy2` is the right-bottom stick; verify its top edge so 116px clears it; bump `bottom` if it overlaps the stick's hit area). The `app.js:579` comment ("bottom-left, above the stick") and `app.js:604` notebook-door comment should be updated to say bottom-right. It stays a game-mode-only door (`display:none` outside game, `index.html:1020`) unless David wants it on the timeline too — that's a separate ask, don't assume.
- **5b (gated):** If confirmed — the now-line readout `nowread` (`app.js:2301`) already shows "current activity in its colour + elapsed" near the top of the visible viewport when scrolled to now; the cleanest "anchored at top" is a thin sticky strip reusing `renderLiveTracker`'s `#liveTracker` element (`index.html:1311`, CSS `index.html:693` — it's already `position:fixed; top:…`). That element exists and is top-anchored; it was demoted in favor of the dock. Re-enabling it = a design reversal → **needs David's pick first** (options-first rule).

**(4) CODE POINTERS** — `#notebookBtn` CSS `index.html:910-911`, markup `1308`, wire `app.js:3236`; right stick `#joy2` `index.html:1306` / `initJoy`/`joy2` `app.js:1266/1310`; notebook-door comments `app.js:579,604`; top-anchored `#liveTracker` CSS `index.html:693`, render `renderLiveTracker` `app.js:1013`; now-line readout `nowread` `app.js:2301`.

**(5) UI** — 5a: the pink `#ff5fa0` notebook square (`index.html:910`) moves to the bottom-right corner of game mode, above the right thumbstick, same `border:3px solid #160510` / `box-shadow:0 4px 0`. Unchanged look, mirrored position.

**(6) DATA** — none.

**(7) REGION** — 5a: `#gameMode` HUD CSS (`index.html:910`) — fully isolated from the timeline, **zero conflict**, safe to do anytime. 5b: live-tracking surface (dock vs top strip) — overlaps F2.

**(8) EFFORT** — 5a **S**; 5b **M** but gated on a design decision.

**(9) RISKS** — 5a LOW (cosmetic move, game-mode only; just confirm it clears the `#joy2` stick hit zone). 5b HIGH-intent-risk: reverses a settled design; do not build unprompted.

---

## Build order & conflict notes (for parallel agents)
1. **F5a** (notebook → bottom-right) — isolated `#gameMode` CSS, do first, zero risk.
2. **F2** (dock slide-up-to-expand) — self-contained dock wiring.
3. **F3** (always-nearby bento button) + **F6 placement** — share bottom-corner real estate with F2; one agent should own the bottom-corner layout to avoid button collisions. (F6 = the F4 placement-polish item.)
4. **F4** = umbrella polish, do last (depends on F2/F3 landing).
5. **F1** (pull-out-bubble) — HIGHEST risk; touches the create gesture + scroll arbitration in `calendarView`. Do alone, device-test, ship the safe fallback if drag-out can't beat the scroller. Keep this agent OUT of the same window as any other timeline-render change.

**Items deliberately NOT specced (already resolved / rejected per audit + handoff):** pull-down-home (removed by design), split-down-the-middle Apple-notifications tracker (superseded by two-lane timeline), press-hold-cluster-cycle (rail-chips chosen instead), prev/next-day arrows (swipe+week-strip chosen), zoom slider (removed by David's own request), drag-to-split-a-block (never built, no demand), and re-adding press-hold-to-create (explicitly rejected 2026-06-27, `app.js:2522`).
