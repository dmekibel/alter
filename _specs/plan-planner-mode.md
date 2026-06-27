# SPEC — Planning: full planner mode & editor  (`plan-planner-mode`)

Build-ready specs for the **Planning / day-structure** cluster of `GRAND-AUDIT-2026-06-26.md`.
Single-file app: edit **`app.js`** + **`index.html`** only. Ship: `bash _dev/preship.sh` then commit/push.

## Locked rules that bind every item here
- Palette is the real `DOM` object (`app.js:249`) + the day/night wine→navy sky. **No neon / glow / shine / white surfaces.** The pink now-line (`#ff5fa8`) stays the brightest thing.
- **One activity at a time** (`startOrSwitch` already enforces single-tap-starts, `app.js:374`). Reward-never-shame.
- **The timeline render (`calendarView`, the big draw ~`app.js:2050-2538`) is FRAGILE — rebuilt 3×.** Any change to bubble geometry / lane math / now-line / straddle logic is **HIGH RISK** and must be labelled DEVICE-UNTESTED until confirmed on David's phone.
- Reuse helpers: `add()/el()/DOM/mixHex/esc/fmt/dur/hm/blocks()/logs()/save()/reflow()/relLabel()/bentoPicker()/openSheet()/closeSheet()/pushUndo()/toast()`.

## Shared data facts (read once, applies to several items below)
- **Block shape** (a plan block): `{ id, time:"HH:MM", mins, title, prio(1-3), color, domain?, catK?, done, pin?, passed?, celed?, subs?[] }`. Created in `makeBlock` (`app.js:2521`), `distributePlan` (`app.js:790`), `applyDayPreset` (`app.js:505`), `planSheet` (`app.js:3027`).
- **`domainOf(b)`** (`app.js:274`) derives domain from `b.domain` or title; `DOM[dom]` gives `.c/.ink/.light`.
- **`prio`**: `PRIOS = [{v:3,Must},{v:2,Should},{v:1,Nice}]` (`app.js:171`). Comments already say "lowest gets dropped if you run out of time" — the engine to do it is only half-built (see item 6).
- **`pin`**: the only non-negotiable primitive that exists. `reflow(k)` (`app.js:2881`) treats pinned blocks as fixed obstacles flex blocks flow around. **No `nonneg` / hold-to-bedtime field exists yet.**
- **SCHEMA = 1** (`app.js:75`); migrations live at the end of `load()` (`app.js:1279`). All new fields below default safely (`|| []`, `!= null`) so **no SCHEMA bump is required** unless noted.
- **Two day-nav models must never run at once** (regression contract). Nothing here should touch `buildPull` scroll/pager logic.

---

## 1. Plan button opens plan-menu (activity + duration + priority), Start renders it on the left
**Ask (audit line 516):** _"pressing the plan button should allow you to plan ahead… not only which activity, but how long it's gonna last… only then when you press start does the plan show up on the left side."_

**Buildable?** Partial → concrete. The *menu* exists (`planSheet`, `app.js:3016`, has time + duration chips `DURS` + priority chips `PRIOS`). What's missing is the **staged "draft, then Start commits to the left lane"** behavior — today `planSheet.onTask` pushes straight into `blocks(k)` and reflows immediately (`app.js:3027`).

**Approach:**
- Add a **draft buffer** inside `planSheet`: `var draft = []` instead of pushing to `blocks(k)`. `onTask` pushes `{time,mins,title,prio,color,domain}` onto `draft` and re-renders the foot list from `draft` (not `blocks(k)`).
- Change the foot `Done` button → a **`Start ▶` button** (`app.js:3028`): on click, `pushUndo()`, append every `draft` item to `blocks(k)` with `uid()`, `reflow(k)`, `save()`, `closeSheet()`, `renderAll()`, `toast("▶ plan started")`. Until Start, nothing appears on the left lane.
- Keep the live preview *inside the sheet* (the foot list already shows the ordered draft with times) so David sees the plan forming before committing.
- The `planBreak` path (Replan, `app.js:379`) already does the "owns now → starts tracking" version; leave it.

**Code pointers:** `planSheet` `app.js:3016-3029`; `DURS` `app.js:151`; `PRIOS` `app.js:171`; commit pattern copy from `distributePlan` `app.js:790-791`.

**UI (text sketch):**
```
Plan today
[ ✨ What should I do next? ]
[ 09:00 ]  • 1h            ← time input + live duration
duration   [15m][30m][45m][1h][1h30][2h]
priority   [Must][Should•][Nice]
tap an activity to add it to the draft ↓
────────── DRAFT (nothing on timeline yet) ──────────
09:00–10:00  ● Deep work        ✕
10:00–10:30  ● Walk             ✕
[ ▶  Start  ]   ← only this commits the draft to the left lane
```
All chips/buttons reuse existing `.pchip/.done2/.blk` classes — already on-palette.

**Data:** none new (draft is in-memory). No migration.
**Region:** `planSheet` (self-contained; low conflict). **Effort:** S. **Risks:** Low — does NOT touch `calendarView`. Make sure `Start` calls `renderAll()` so the left lane repaints once.

---

## 2. Dedicated Plan-Day menu: choose activities first, then assign times/order on a future-only calendar
**Ask (audit line 521):** _"first you choose all the activities, and then you assign them a time… a simplified view that focuses on only the future… first choose the activities, then choose the order and the time."_

**Buildable?** Partial → concrete. `planDay` (`app.js:808`) already opens a pick-first menu; `distributePlan` (`app.js:784`) auto-stacks picks back-to-back at 30 min from the next free slot. Missing: the **explicit second "arrange" phase** — a simplified future-only ordering view.

**Approach (two-phase flow inside the existing `planDay` overlay; do NOT build a second timeline):**
- **Phase 1 (exists):** `planDay` → "Pick activities" → `bentoPicker({multi:true})` → `distributePlan`. Keep.
- **Phase 2 (new `arrangePlan(k)`):** after `distributePlan`, instead of closing, open a **reorderable list** of the just-placed future blocks (a lightweight DOM list in `sheetBody`, NOT a calendar canvas). Each row = `[↑][↓]  ● title   start–end   [dur chips]`. Reordering rewrites `time` sequentially from the day's start anchor (reuse `distributePlan`'s `start` logic: `8*60`, bumped past `logicalNowMin()` if today). Duration chips set `mins`. Each edit calls `reflow(k)+save()`.
- "Future-only" = `arrangePlan` only lists blocks where `hm(b.time)+b.mins > (k===todayK()?logicalNowMin():0)` — past/started blocks are hidden so the view stays simple.
- Add a `[ Done — view on timeline ]` button → `closeSheet(); renderAll()`.
- Wire: `distributePlan` last line, replace `toast(...)` close with `arrangePlan(k)` (keep the toast).

**Code pointers:** `planDay` `app.js:808-817`; `distributePlan` `app.js:784-792`; ordering math reuse `app.js:787-790`; reorder pattern copy from the steps reorder in `editorSheet` (`app.js:2648-2649`, the `splice`+`drawSteps` chevrons).

**UI:**
```
Arrange tomorrow            (only future activities)
1  ↑ ↓   ● Deep work     09:00–11:00   [30m][1h][2h•]
2  ↑ ↓   ● Walk          11:00–11:30   [30m•][1h]
3  ↑ ↓   ● Lunch         11:30–12:15   [45m•]
[ Done — view on timeline ]
```
Reuse `.blk/.pchip/.done2`. On-palette.

**Data:** none new. No migration.
**Region:** new `arrangePlan` near `planDay`/`distributePlan` (`app.js:784-817`). Low conflict. **Effort:** M. **Risks:** Low-medium — list-only, never paints the canvas; just rewrites `time/mins` + `reflow`. Confirm reflow doesn't fight a pinned block (it won't; arrange list edits flex blocks).

---

## 3. Restore full planner mode (fully plan today AND tomorrow)
**Ask (audit line 546):** _"we removed the plan today and tomorrow feature where you're fully in planner mode."_

**Buildable?** Partial → concrete. Per-day planning exists (`planDay(k)` works for `todayK()` and `tomK()`). Missing: a single **immersive planner that does today + tomorrow in one flow** without bouncing through the tools menu each time.

**Approach (thin wrapper — do NOT rebuild a timeline):**
- Add `plannerMode()`: a stepped sheet with a **day toggle at the top** `[ Today | Tomorrow ]` that swaps `k` between `todayK()` and `tomK()`, re-rendering the same Plan-Day body (item 1 + 2 components) underneath. So "planner mode" = the Plan-Day flow with a persistent today/tomorrow switch + a "→ plan tomorrow next" handoff button.
- After finishing today, surface `[ Now plan tomorrow → ]` which flips the toggle to `tomK()` (this directly answers the recurring "offer to plan rest of night AND tomorrow" ask, audit line 501).
- Entry points: replace/augment the `dayToolsMenu` "Plan day" item (`app.js:776`) to call `plannerMode()` (defaulting to the focused day), and wire the evening contextPrompt "Plan tomorrow" chip (`app.js:1372`) to `plannerMode()` opened on `tomK()`.

**Code pointers:** `tomK()` `app.js:83`; `planDay` `app.js:808`; `dayToolsMenu` item "Plan day" `app.js:776`; evening chip `app.js:1372`; morning "Plan your day" chip `app.js:1371`.

**UI:**
```
✨ Planner mode
[ Today • ][ Tomorrow ]
… (the Plan-Day pick + arrange body for the selected day) …
[ Now plan tomorrow → ]      (shown when on Today)
[ Done ]
```

**Data:** none. No migration.
**Region:** new `plannerMode` near `planDay`; touches `dayToolsMenu:776` + contextPrompt chips `1371-1372`. **Effort:** S-M. **Risks:** Low — wrapper over existing per-day plumbing. No canvas change.

---

## 4. Non-negotiables: flagged activities survive reschedule, hold to bedtime, ask what to keep if out of time
**Ask (audit line 526, asked ×2):** _"flagging activities that survive a reschedule and hold to the end."_

**Buildable?** Partial → concrete. Only the **pin** half exists (`o.pin`, editor `app.js:2635`; reflow respects it `app.js:2883`). The "hold to bedtime / ask what to keep when out of time" half is explicitly deferred (`app.js:383` comment, ledger #5).

**Approach (introduce a distinct `nonneg` flag — keep `pin` for spatial lock):**
- **Data:** add optional `b.nonneg` (boolean). A non-negotiable is also treated as effectively pinned by `reflow` for survival, but carries the extra "must fit before bedtime" semantics.
- **Editor:** next to the PIN button (`app.js:2635`) add a **★ non-negotiable toggle** (`ti-star`). Use a deep berry fill when on (no glow).
- **Survival on reschedule:** in `reflow(k)` (`app.js:2881`) and in the Replan truncation loop (`planBreak`, `app.js:381`), treat `b.nonneg` like a pin (never erased, never pushed off the end of the day). In `planBreak` the truncate-future loop (`app.js:381`) must **skip** `b.nonneg` blocks.
- **Hold to bedtime:** when scheduling/reflowing, if a `nonneg` block would be pushed past bed time (`hrToMin(S.profile.sleep)`, see `app.js:2304`/`2303`), pull it back so its end == bedtime (anchor it to the end of the day rather than dropping it).
- **"Ask what to keep when out of time":** new `overBudgetSheet(k)` triggered when total planned `mins` from now → bedtime exceeds the available window. List the **flex (non-nonneg, low-prio first)** blocks with `[ keep ] [ drop ]` toggles; "Apply" removes the dropped ones and reflows. Non-negotiables are shown locked (★, can't drop). Trigger it from the over-budget detection that already exists in the suggestion engine (`app.js:1168`, "I bumped N low-priority slots").

**Code pointers:** editor PIN `app.js:2635`; `reflow` `app.js:2881-2898`; Replan truncate `app.js:381`; bedtime min via `hrToMin(S.profile.sleep,true)` (helper at `app.js:2303`, used `2304`); over-budget message `app.js:1168`; `PRIOS` `app.js:171`.

**UI (editor toggle):**
```
priority [Must][Should•][Nice]   [📌pin]  [★ non-negotiable]
```
**UI (`overBudgetSheet`):**
```
Out of time — what survives?
Bedtime 23:00 · 2 h 10 m left · you've planned 3 h 40 m
★ Deep work        09:00  (non-negotiable — kept)
   Guitar          Nice   [ keep ] [ drop• ]
   Cafe            Should [ keep• ] [ drop ]
[ Apply — keep what's checked ]
```

**Data:** `b.nonneg` optional boolean. Migration: none required (absent = falsey). Optionally normalize in `load()` (`app.js:1279`): blocks loop is per-day; safe to skip.
**Region:** editor (`2632-2635`), `reflow` (`2881`), `planBreak` (`381`), new `overBudgetSheet`. **Reflow is shared by the timeline** → **MEDIUM-HIGH RISK**: any reflow change can shift every block; test the regression contract (started/past set-in-stone; future can't cross now). **Effort:** L. **Risks:** reflow regressions; bedtime-anchor math; ensure `nonneg` blocks still can't slide into the past on today.

---

## 5. Presets live as a TAB inside Goals (stack into days)
**Ask (audit line 551, asked ×2):** _"presets can go into goals so it's just a tab inside goals to stack them into days."_

**Buildable?** Partial → concrete. Today the Goals tab button `#goPresets` opens the separate `presetsSheet` overlay (`app.js:3223`); Goals menu also has a "Habit stacks" row (`app.js:590`). David wants presets **as a literal tab beside the goal map**, not a separate overlay.

**Approach:**
- Find the Goals sheet renderer (the goal-map view; grep `goalsSheet`/the function that draws the Goals overlay with `#goPresets` wiring). Add a **segmented tab header** at the top: `[ Goals | Stacks ]`.
- `Goals` tab = the existing goal map body. `Stacks` tab = render the `presetsSheet` body **inline** in the same card (refactor `presetsSheet`'s `draw()` body into a `renderPresets(container, k)` that both the standalone overlay and the Goals tab call — so no duplication).
- Keep `presetsSheet` as-is for any other entry points; just extract the body builder.
- `#goPresets` (`app.js:3223`) → open Goals on the **Stacks** tab instead of the standalone overlay.

**Code pointers:** `#goPresets` wiring `app.js:3223`; `presetsSheet` `app.js:538-553` (extract `draw()` → `renderPresets`); `stackDetail` `app.js:508` (unchanged); Goals menu "Habit stacks" entry `app.js:590`.

**UI:**
```
[ Goals • ][ Stacks ]
── Stacks tab ──
[ + build a custom stack ]
[ ▤ Copy yesterday's plan · 7 blocks ]
[ ▤ Full Day · 12 · view ]
[ ▤ Deep Work Day · 11 · view ]
[ 🔖 My stack ✕ ]
save today's plan as a stack: [ name… ]
```

**Data:** none. No migration.
**Region:** Goals sheet renderer + `presetsSheet` extraction. Medium conflict if another agent touches Goals. **Effort:** M. **Risks:** Low-medium — pure UI re-home; verify `relLabel(k)` uses the right day when opened from Goals (default `todayK()`).

---

## 6. Replan erases future from now; pushes OR shortens next block by priority
**Ask (audit line 531):** _"if I replan, that something else is erased… if we touch the next bubble, we either push everything downwards or shorten the next bubble depending on how important."_

**Buildable?** Partial → concrete. Replan currently truncates the straddling block + **pushes** following blocks (`planBreak`, `app.js:379-383`). Missing: the **priority-weighted shorten-vs-push fork** (deferred per `app.js:383`). Depends on the priority semantics from item 4.

**Approach:**
- In `planBreak` after inserting the pinned NOW block (`app.js:382-383`), before the plain `reflow(k)`, run a **collision resolver** on the immediately-following block:
  - If next block `prio` is high (`Must`, or `nonneg`) → **push** (current behavior).
  - If next block `prio` is low (`Nice`/`Should`) and the overlap is small → **shorten** it (`b.mins -= overlap`, floor 5 min) instead of pushing the whole chain.
- Keep it to the *first* colliding block only (simple, predictable); the rest still reflow/push.
- Optional: if shortening would drop below 5 min, fall back to push (or, if it's low-prio and fully crushed, drop it — but only with the item-4 `overBudgetSheet` ask, don't silently delete).

**Code pointers:** `planBreak` `app.js:379-384`; `reflow` `app.js:2881`; `prio`/`PRIOS` `app.js:171`; `nonneg` (item 4).

**UI:** no new sheet — behavior change only; a `toast` can name it ("shortened Walk to fit" vs "pushed your plan down").

**Data:** none new (reuses `prio`/`nonneg`). No migration.
**Region:** `planBreak` (`379`) + reads `reflow`. **MEDIUM RISK** — alters reschedule math the user feels directly; pairs with item 4. **Effort:** M. **Risks:** edge cases where shorten cascades; keep it first-block-only. Test the regression contract.

---

## 7. Bubble editor depth — priority, start/end, duration in easy clicks; press activity → swap via bento
**Ask (audit lines 561, 566, 571):** priority + start + end + duration in easy clicks; show begins AND ends; tiny-bubble +/- steppers & a 30s→12h slider.

**Buildable?** **Mostly ALREADY BUILT (post-audit, 2026-06-27).** `editorSheet` (`app.js:2589`) now has: hero name = swap-to-bento (`app.js:2601`); **start-time −/＋ 5-min nudges** (`app.js:2613-2618`); **log-scaled 30s→12h length slider** (`app.js:2604-2625`); **length steppers −15/−5/＋5/＋15** (`app.js:2628`); **length chips** (`app.js:2631`); **priority segmented + pin** (`app.js:2634-2635`); **begins–ends readout** in `layout()` (`app.js:2622`).

**Remaining gap → concrete:**
- The readout shows `length · 09:00–10:00` but the **start label is only the nudge row's clock** (`app.js:2614/2622`). David asked for begins AND ends as first-class. Minor: relabel the nudge row to show both explicitly, e.g. tlbl = `begins 09:00` and the read line = `ends 10:00 · 1h`. Pure copy/markup change in `layout()` (`app.js:2622`) + the `ed-hint` strings.
- (Everything else in these three asks is satisfied — mark them mostly-done in the handoff and only do the begins/ends labelling polish.)

**Code pointers:** `editorSheet` `app.js:2589-2663`; `layout()` `app.js:2622`; start nudges `app.js:2611-2618`; steppers `app.js:2626-2628`; chips `app.js:2629-2631`.

**UI:**
```
[  ● Deep work            ⇄  ]   ← hero = swap (bento)
begins 09:00     [ − ] 09:00 [ ＋ ]
length — slide, step ＋, or tap a chip
[========●==============]          30s ────────── 12h
ends 10:00 · 1h
[−15][−5][＋5][＋15]   [15m][30m][45m][1h•][1h30][2h]
priority [Must][Should•][Nice]   [📌][★]
```

**Data:** none. No migration.
**Region:** `editorSheet` only. **Effort:** S (labelling polish). **Risks:** Very low — text only.

---

## 8. Empty bubble single-tap opens the bento picker instantly
**Ask (audit line 576):** _"the only reason the Bento would open in a single click is if you created an empty bubble."_

**Buildable?** Partial → concrete. Today a tap on an empty plan slot runs `makeBlock()` → creates a 30-min empty block → opens the **full editor** with an empty hero (`app.js:2521`, `2530`). David wants the **bento directly** for a freshly-created empty bubble.

**Approach:**
- In `makeBlock()` (`app.js:2521`), after creating `nb`, **open `bentoPicker` first** instead of `editBlk(nb)`:
  - `onPick`: set `nb.title/catK/color/domain` from the pick, `reflow(k)`, `save()`, `renderToday()`. Then optionally open `editBlk(nb)` so the user can tweak duration/priority (or just leave it placed — confirm with David; default = place it and stop, since the editor is one tap on the bubble away).
  - If the picker is dismissed without a pick → remove the empty stub block (don't litter empty bubbles), `reflow+save+renderToday`.
- Tapping an **existing** bubble still opens the editor (`editBlk` via `up2`, `app.js:2412`) — unchanged. The bento-on-single-tap is **only** for the just-created empty bubble, exactly as asked.

**Code pointers:** `makeBlock` `app.js:2521`; empty-tap caller `app.js:2530`; `bentoPicker` `app.js:2695`; existing-bubble tap-to-edit `app.js:2412`; editor empty-hero swap `app.js:2599-2601`.

**UI:** no new surface — the existing `bentoPicker` overlay (grouped by domain, on-palette) opens immediately on creating an empty slot.

**Data:** none. No migration.
**Region:** `makeBlock` (`2521`) — adjacent to the timeline create gesture but **not** the render path. **Effort:** S. **Risks:** Low. Watch: if the user dismisses the picker, ensure the orphan empty block is cleaned up so a stray "tap to choose" bubble isn't left on the timeline (a prior version left these).

---

## Build order (lowest risk → highest)
1. Item 8 (empty-tap → bento) — S, isolated.
2. Item 7 (begins/ends label) — S, text only.
3. Item 1 (Plan→draft→Start) — S, sheet-local.
4. Item 5 (Presets tab in Goals) — M, UI re-home.
5. Item 3 (planner mode wrapper) — S-M.
6. Item 2 (arrange phase) — M, list-only.
7. Item 6 (shorten-vs-push) — M, **touches reschedule math**.
8. Item 4 (non-negotiables) — L, **touches reflow** — do last, label DEVICE-UNTESTED.

## Parallel-build conflict map
- **`reflow` (app.js:2881)** is touched by items 4 & 6 — assign both to the SAME agent or serialize them.
- **`editorSheet` (2589)** — items 4 (★ toggle) & 7 (labels): same region, batch together.
- **`planSheet`/`planDay`/`distributePlan` (3016 / 808 / 784)** — items 1, 2, 3: same neighborhood; one agent.
- **Goals sheet + `presetsSheet`** — item 5: independent of the above.
- **`makeBlock` (2521)** — item 8: borders the timeline create gesture; keep changes to the create branch only, never the render loop.
