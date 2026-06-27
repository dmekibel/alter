# SPEC — UI: menus, HUD, FAB, quick-menu  (`ui-menus-hud-fab`)

Build-ready specs for the UI cluster from `GRAND-AUDIT-2026-06-26.md`. Source files: `app.js` (~3122 lines, the whole app) + `index.html` (shell + all CSS). **Never edit `server.js`.** Ship with `bash _dev/preship.sh` then commit/push.

## LOCKED design rules (honor in every feature)
- Deep berry/wine palette + the real `DOM` domain colors (`app.js:249`). **NO neon / glow / shine / white surfaces.** The pink now-line (`#ff5fa0`/`#ff5fa8`) is the BRIGHTEST thing on screen — nothing else may out-bright it.
- Bubbles = deep jewel fills with subtle low-contrast diagonal stripes. No `.shine`/`.foil`. Ink edge `#160510`.
- One activity at a time. Reward-never-shame. Full-screen, low-clutter.
- **The timeline render (`calendarView`/`buildPull`, ~app.js:2080–2410) is FRAGILE — rebuilt 3×. Any change to the now-line / nowread / now-circle render is HIGH RISK** and must be flagged DEVICE-UNTESTED (gesture & layout feel only verify on David's phone).
- Reuse helpers: `add(parent,tag,cls,txt)`, `el(id)`, `DOM`/`DOM_ORDER`, `mixHex`, `esc`, `fmt`, `dur`, `hm`, `blocks(k)`, `logs(k)`, `save()`, `tiIcon(item)`, `tiClass(item)`, `domainOf(item)`, `domColor(item)`.

## Current DOM map (what exists today — `index.html`)
- `#nav` (line 1246): 3 tabs — `goals` (ti-target), `day` (`ti-layout-list`), `self` (ti-plant-2). Collapses into a bottom-left pill via `body.nav-collapsed.tab-day` (CSS lines 956–965).
- `#liveDock` (line 1232): bottom floating live-tracker dock. `.ld-grab` handle, `.ld-main` (stop/info/elapsed/switch), `.ld-seg` (Plan/Replan/Drift). CSS line 990. JS `renderLiveDock` (`app.js:940`).
- `#trackerFull` (line 1263): the expanded RING tracker (z90). JS `renderTrackerFull` (`app.js:1021`), `openTrackerFull`/`closeTrackerFull` (`app.js:999`).
- `#liveTracker` (line 1262): the top strip / pull-down handle. JS `renderLiveTracker` (`app.js:974`).
- `.nowread` (CSS line 575, JS `app.js:2200`): right-side now readout (current activity + elapsed) — already `right:6px`.
- `#guardianCap` (line 1203, JS `renderHero` `app.js:1830`): class·Lv·spark caption (HUD-ish, on the You tab).
- `#gameHud` (line 1254, JS `updGameHud` `app.js:1735`): in-world spark HUD (overworld only).
- `#quick` (line 1207, JS `renderQuick` `app.js:2109`): quick-wins row (You tab) — horizontal scroll of `.qw` cards.

---

## 1. Menus should be part of the game, not full-screen
- **Ask (audit:418, asked ×3):** _"menus look bad they should not be full screen but rather part of the game"_
- **Buildable?** PARTIAL → concrete: make the two remaining full-screen surfaces non-full-bleed cards that sit *over the live world/timeline* (visible behind), not opaque sheets. The two offenders per audit: `.bento-ov` (`index.html:583`, `inset:0` full-cover) and `notebookSheet` modal (`app.js:580`).
- **APPROACH:**
  - `.bento-ov` (index.html:583): keep the dim backdrop but make the *card itself* float as a rounded panel with a visible margin (it already centers a card via `align-items:flex-start`); reduce backdrop opacity from `rgba(15,4,12,.62)` to `~.45` and add `-webkit-backdrop-filter:blur(3px)` so the timeline reads through = "part of the game" not a wall. Do NOT remove the backdrop (taps outside must still close).
  - `notebookSheet` (app.js:580): it builds an overlay `ov`. Render it as a bottom-anchored card (max-height ~70vh, rounded top, slide-up) instead of full-screen, matching the `#liveDock`/`#pullSheet` floating-panel language. Reuse the `#pullSheet` slide pattern (transform translateY) rather than a new gesture system.
- **CODE POINTERS:** `index.html:583` (.bento-ov), `app.js:580` (notebookSheet ov creation), `index.html:990` (liveDock floating-card reference styling to copy).
- **UI (locked palette):** card on `#1c0512` fill, `3px solid #160510` border, `box-shadow:0 4px 0 #160510`, rounded 18px top corners, sitting above a blurred-dim view of the timeline. No white.
- **DATA:** none.
- **REGION:** bento overlay CSS + notebookSheet builder. Touches shared overlay CSS — coordinate with any agent editing `.bento-ov`.
- **EFFORT:** M
- **RISKS:** bento is the primary activity picker — opened from ~10 call sites (`bentoPicker`). A layout regression breaks ALL pickers. Tap-to-dismiss must survive. Verify the picker still scrolls and the keyboard-search field still focuses. Gesture feel = DEVICE-UNTESTED.

---

## 2. Add a game HUD
- **Ask (audit:422):** _"We should add a game hud i think that would help"_
- **Buildable?** PARTIAL → concrete: there are scattered HUD-ish bits (`#guardianCap` class·Lv·spark, streakbar chip, `#gameHud` in-world). The concrete deliverable = a **single small persistent HUD chip in the main app** (Today tab) showing the live game state: Lv · ✨spark · 🔥streak. Right now this only lives on the You tab.
- **APPROACH:**
  - Add a compact HUD pill, top-right of the Today tab (does NOT cover the now-line; sits above the timeline in the safe-area top zone). Content: `Lv {level} · ✨{spark} · 🔥{streak}` using the same data `renderHero` reads (`vState.level`, `S.game.spark`, and the streak from `streakTier`/`S.game.streak`).
  - New tiny render fn `renderHudChip()` called inside `renderAll()` (`app.js:2578`); writes into a new `#hudChip` div added to `index.html` near `#liveTracker`. Show only on `body.tab-day:not(.gaming)`.
  - Reuse `tiIcon`, the `vState` machinery already used by `renderHero` (`app.js:1830`).
- **CODE POINTERS:** new `#hudChip` element in `index.html` (after line 1262, beside `#liveTracker`); new `renderHudChip()` in `app.js` (model it on `renderHero`'s cap line `app.js:1830`); register in `renderAll()` (`app.js:2578`).
- **UI (locked palette):** small pill, `background:rgba(28,5,18,.8)`, `border:1.5px solid #160510`, `border-radius:11px`, font Jost 700 ~11px, color `#cdbff2` with `b{color:#ffe07a}` for the level number (matches `#guardianCap`). Position: `top:calc(env(safe-area-inset-top)+6px); left:10px` (LEFT, since the now readout/live strip use the RIGHT — see #6).
- **DATA:** none (reads existing `S.game`/`vState`).
- **REGION:** new isolated element + render fn + one `renderAll` line. Low conflict.
- **EFFORT:** S
- **RISKS:** Must not overlap `#liveTracker` (top strip) when tracking — put HUD chip on the left, give it lower z than the picker. Confirm it hides in the overworld (`body.gaming`) and on Goals/You tabs. Cosmetic, low render risk.

---

## 3. Center FAB icons: Today = two-layer, Goals = target, You = garden
- **Ask (audit:430):** _"the today being two thiings on top of each other and goals being target. then the garden being you on the right"_
- **Buildable?** YES (icon swap only).
- **APPROACH:** In `#nav` (`index.html:1246–1250`): Goals already `ti-target` ✓, You already `ti-plant-2` (garden ✓). Change **Today** from `ti-layout-list` to a two-layers-stacked icon: `ti-stack-2` (or `ti-layers-intersect`/`ti-versions`). David's words = "two things on top of each other" → `ti-stack-2` is the closest Tabler glyph. Update BOTH the static markup (line 1248) and the collapsed-pill render if it duplicates the icon.
- **CODE POINTERS:** `index.html:1248` (`<i class="ti ti-layout-list ne"></i>`). Also check `app.js` for any place that re-emits the day-tab icon (grep `ti-layout-list` → currently only index.html).
- **UI:** unchanged layout; just the Today glyph becomes two stacked layers. Keeps the existing `.nb.on` pink active state.
- **DATA:** none.
- **REGION:** single line in `#nav`. Trivial, isolated.
- **EFFORT:** S
- **RISKS:** Verify the chosen Tabler icon name exists in the bundled icon font (Tabler ships `ti-stack-2`). If unsure, screenshot to confirm the glyph renders (not a tofu box).

---

## 4. Customizable-size top quick menu, pin-to-far-left
- **Ask (audit:434, asked ×2):** _"the most important. Should be customizable where you can pick the size. Like, they can be big squares"_ + pin-to-far-left.
- **Buildable?** PARTIAL → concrete. Today: `isPinned`/`togglePin` (`app.js:2591–2592`) via 450ms press-hold inside `bentoPicker`; pinned float to a `★ Pinned` row at the TOP and render with the `.big` class (`app.js:2624–2627`). Two gaps vs the ask: (a) size is auto, not user-pickable; (b) the pinned row is at the top, not pinned to the **far-left**.
- **APPROACH (two sub-parts):**
  - **(a) Pin-to-far-left:** the `bento-pinned` row already renders pinned chips first. To honor "far-left", ensure the pinned row stays `flex-direction:row; flex-wrap:nowrap; overflow-x:auto` with pinned chips left-justified (`justify-content:flex-start`) — they already sort to the front via `acts.sort(... isPinned ...)` (`app.js:2632`). Add `.bento-pinned{justify-content:flex-start}` if not already left. (Minimal: this is mostly already satisfied; verify and lock.)
  - **(b) Customizable size:** add a per-activity size flag. Extend the pin model: instead of `S.pinned = [titleLower,...]`, store `S.pinSize = { titleLower: "big"|"sm" }` (keep `S.pinned` as-is for back-compat). On press-hold, the current toast flips pin; add a SECOND gesture — tap a small size toggle on the pinned chip (a tiny ⤢ corner control shown only on pinned chips in the `★ Pinned` row) cycling sm→big. `actChip(a, pinned, true)` already passes `big` — drive `big` from `S.pinSize[title]==='big'` instead of hardcoded `true`.
  - Implement the size control as a corner micro-button on `.bchip.pinned` in the pinned row only (not the grid). On click: `S.pinSize[t] = (S.pinSize[t]==='big'?'sm':'big'); save(); render();`.
- **CODE POINTERS:** `app.js:2591` isPinned, `app.js:2592` togglePin, `app.js:2608–2613` actChip (the `big`/`pin` classes + the 450ms holdT), `app.js:2624–2627` pinList + `★ Pinned` row, `app.js:2632` pinned-sort. CSS `.bchip.big` (grep in index.html) for the big-square style.
- **UI (locked palette):** pinned chips left-aligned in the `★ Pinned` row; a "big" chip = a larger square (~2×) on the domain color (deep), ink edge `#160510`. The size toggle = a tiny `ti-arrows-diagonal` glyph in the chip corner, low-opacity, no glow.
- **DATA:** add `S.pinSize = {}` (object: titleLower → "big"|"sm"). **load() migration:** in `load()` (`app.js:1097`), default `if(!S.pinSize) S.pinSize={};`. Bump `SCHEMA` (currently `1`, `app.js:75`) to `2` and add the migration line so older saves don't crash. `S.pinned` stays untouched (no data loss).
- **REGION:** `bentoPicker` internals (actChip + pinned row) + load() migration. Conflicts with any agent touching bentoPicker (#1 also touches `.bento-ov`, but different sub-area) — coordinate.
- **EFFORT:** M
- **RISKS:** Press-hold (450ms) already exists for pin; adding a second tap-target on the chip must not steal the hold/select gesture (the `held` flag at `app.js:2613` arbitrates). DEVICE-UNTESTED for the hold-vs-tap arbitration. Don't break multi-select (`bentoPicker multi:true`).

---

## 5. Now-control menu floats slightly above, right-side only (reality, not plan)
- **Ask (audit:438):** _"this kind of now menu with all the settings is something that's floating slightly above. Or it's only on the right side of the screen because it's only about reality"_
- **Buildable?** PARTIAL → concrete. Today: the now READOUT is already right-side (`.nowread right:6px`, `index.html:575`, JS `app.js:2200`). The CONTROL surface (stop/switch/replan/drift) lives in the bottom `#liveDock`, not a right-floating now-menu. Concrete version: give the right-side now readout a tap that opens a **small right-anchored control popover** ("now menu") instead of (or in addition to) the bottom dock — floating slightly above the now-line, right side only.
- **APPROACH:**
  - Make `.nowread` tappable → opens a compact popover anchored to the right edge, vertically near the now-line. Popover holds the reality controls: Stop, Switch, Replan, Drift (the same handlers as `#liveDock`'s `ldStop`/`ldSw`/`ldPlan`/`ldReplan`/`ldDrift`, `app.js:962–966`). Reuse those exact onclick bodies — do NOT duplicate logic; call `startOrSwitch()`, `planBreak()`, `stopTimer()`.
  - Position: `position:fixed; right:8px; top:` computed from the now-line's screen Y minus the popover height (so it floats "slightly above"). The now-line element is captured as `nowLineEl` (`app.js:2200`) — read its `getBoundingClientRect().top`.
  - Note the current code already adds `.nowread` to the `closest()` ignore list for create-gestures (`app.js:2413`) — so tapping it won't create a block. Good; wire a real onclick.
- **CODE POINTERS:** `.nowread` CSS `index.html:575`; nowread render `app.js:2200`; reuse control handlers `app.js:962–966`; `nowLineEl` ref `app.js:2200`; create-gesture ignore list `app.js:2413`.
- **UI (locked palette):** small floating card, right-aligned, on `#1c0512`, `3px solid #160510`, `box-shadow:0 4px 0 #160510`, rounded. Row of icon buttons (stop pink `#ff5fa0`, switch/replan/drift in deep berry). Floats just above the now-line. **The pink now-line stays the brightest element — the popover is darker.**
- **DATA:** none.
- **REGION:** **TIMELINE-ADJACENT (HIGH RISK).** Adds an interaction anchored to the now-line render. Must not alter the now-line/nowread DOM structure or the recenter math (`nowLineEl`, per-second creep transforms at `app.js:880`).
- **EFFORT:** M
- **RISKS:** HIGH — anchoring to `nowLineEl`'s live position while the timeline auto-recenters every second (and during pinch-zoom, which clears the now-line transform `app.js:880`) can make the popover jump. Keep the popover `position:fixed` and reposition only on open, NOT every frame. The timeline is the most-rebuilt surface — flag DEVICE-UNTESTED. Don't run two control surfaces that fight; if this ships, consider whether it replaces or supplements `#liveDock`.

---

## 6. Tracker floats above on the right, with clear matrix-based options
- **Ask (audit:442):** _"lets try make the tracker like image 4 floating above on the right... clear options based on the matrix"_
- **Buildable?** PARTIAL → concrete. Today: `renderLiveTracker` + `#liveDock` give Plan/Replan/Drift segmented options + a right-side readout, but it's a BOTTOM dock, not a right-floating matrix card. The matrix already exists in code: `trackerState()` derives the state machine (on-plan / off / idle / break / breakup, `app.js:1001`). Concrete version: when tracking, present the dock's Plan/Replan/Drift as a **right-anchored floating matrix card** (2×2 or labeled grid) rather than a full-width bottom segmented row.
- **APPROACH:**
  - This overlaps strongly with #5 (right-side now-menu) — **build them as ONE right-floating "reality" panel** to avoid two competing surfaces (the dev constitution warns against duplicate menu systems). Recommend: implement #5 and #6 together as a single right-side floating control card whose contents are driven by `trackerState()` (`app.js:1001`): show the matrix-appropriate actions for the current state.
  - Matrix mapping (reuse existing handlers): on-plan → [Switch, Replan, Break, Stop]; off-plan/drift → [Switch to plan, Keep drifting, Stop]; idle → [Start plan, Pick activity]; break → [Resume, End break]. Handlers already exist: `tfStartBreak`/`tfResumeBreak`/`tfEndBreak` (`app.js:1069–1071`), `startPlanned`/`startOrSwitch`/`planBreak`, `stopTimer`.
  - Keep the existing `#liveDock` as the COMPACT collapsed state; the right-floating matrix card is the EXPANDED state (instead of, or alongside, the full-screen `#trackerFull` ring). David explicitly wants "floating above on the right," not bottom — so the matrix card should anchor right, mid-height.
- **CODE POINTERS:** `trackerState()` `app.js:1001`; dock seg buttons `index.html:1240–1244` + handlers `app.js:964–966`; break handlers `app.js:1069–1071`; `renderLiveDock` `app.js:940`; `#trackerFull` ring `app.js:1021` (the existing expanded surface — decide: this matrix card is a lighter alternative or you fold the matrix into it).
- **UI (locked palette):** right-anchored card, `right:8px`, vertically centered-ish ("floating above"), `#1c0512` fill, `3px solid #160510`, `0 4px 0 #160510`. Options as a labeled grid (matrix): each cell = icon + label, deep berry, ink edge. On-plan accent uses the domain color; drift uses `DOM.drift.c` (`#4a3d54`). No glow; now-line stays brightest.
- **DATA:** none (drives off `trackerState()` + live timers).
- **REGION:** liveDock/trackerFull region + `trackerState`. **Same region as #5 — MUST be built together or sequenced by one agent** to avoid two right-side floating menus colliding.
- **EFFORT:** L (if folding in the full matrix + state machine), M (if just re-anchoring the existing seg row).
- **RISKS:** Medium-high. Two existing menu systems already "clash" per CLAUDE.md — adding a third right-floating panel risks the same. Decide ONE owner of the live controls (dock vs ring vs new matrix card). DEVICE-UNTESTED for placement/feel. Do not duplicate timer-control logic — call the existing handlers.

---

## Cross-feature build guidance
- **Sequencing for parallel agents:** #3 (icon swap) and #2 (HUD chip) are isolated and safe to do anytime. #1 (bento/notebook un-fullscreen) and #4 (pin size) both touch `bentoPicker` — one agent, sequenced. **#5 + #6 MUST be one agent** (both add right-side floating now/tracker controls; building them separately produces two clashing menus, the exact failure CLAUDE.md warns about).
- **Schema:** only #4 needs a migration (`S.pinSize`, bump `SCHEMA` 1→2 at `app.js:75`, default in `load()` `app.js:1097`).
- **Verification honesty:** preview proves boot/layout/non-gesture taps only. Anything anchored to the now-line (#5/#6) or using press-hold (#4) is **DEVICE-UNTESTED** until David confirms on his iPhone — say so plainly in the handoff.
- **Reuse, don't re-implement:** every live control already has a handler (`app.js:962–966`, `1069–1071`). New surfaces wire to those, never re-derive timer logic.
