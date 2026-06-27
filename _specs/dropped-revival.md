# SPECS — Dropped, worth reviving

Source: `GRAND-AUDIT-2026-06-26.md` → "🔴 DROPPED" section (36 items). This file specs the **8 highest-value DROPPED asks worth reviving**, grounded in the current shipped code.

**Locked rules honored in every spec below:** deep berry/wine palette + the real `DOM` domain colors (app.js ~249); NO neon/glow/shine/white surfaces; the pink now-line stays the brightest thing; **the timeline render is FRAGILE — any change to the `calendarView` bubble/now-line render is HIGH RISK**; one activity at a time; reward-never-shame; full-screen/low-clutter. Reuse helpers: `add()` (app.js:1393), `el()` (74), `DOM` (249), `mixHex` (286), `esc` (285), `fmt` (93), `dur` (94), `hm` (92), `blocks()` (1320), `logs()` (1321), `save()` (1280).

**Schema:** `SCHEMA = 1` at app.js:75, migrated in `load()` (app.js:1279). Any new persisted field → default it in `load()` so David's real data survives (do NOT bump SCHEMA unless you reshape existing data).

---

## Picks at a glance

| # | Feature | Buildable | Effort | Region |
|---|---|---|---|---|
| 1 | Over-drift fork (back-to-plan / keep-drifting + replan) | yes | M | live-tracker |
| 2 | On-open: plan-ahead vs just-track | yes | S | boot/proactive |
| 3 | Tools menu: morning + evening journal + self-help + meditation | yes | S | dayToolsMenu |
| 4 | New bubble defaults to 1 hour | yes | S | block-create |
| 5 | Allow placing bubbles past midnight | partial→concrete | M | reflow/clamp **(touches timeline math — MED/HIGH risk)** |
| 6 | Left/right arrows beside the date → prev/next day | yes | S | pull header |
| 7 | In-bubble-menu mini-timeline (neighbor activities) | partial→concrete | M | editorSheet |
| 8 | Integrate the fieldguide / Brian-Johnson wisdom KB into the brain | partial→concrete | M | brainContext / data |

**Skipped (obsolete or contradicts locked direction) — one line each:**
- *Home screen = pull-down menu* — deliberately replaced by the always-open timeline; David endorsed (audit line 126). Obsolete.
- *Zoom slider top-right* — built then removed by David's own request; pinch replaced it; correct end-state is removed (line 151). Obsolete.
- *Drag-down-in-future to create/stretch a bubble* — `makeBlock` comment "drag can't beat the scroller, so we don't try" (app.js:2521); tap-create + slider is the chosen model. Contradicts locked direction; touching it risks the fragile pan-y arbitration.
- *Dragging a middle block left/right splits it in half* — horizontal fling already RELOCATES between plan/real lanes (app.js ~2491+); a second meaning for the same gesture would fight it. Conflicts.
- *Press-hold cycles clustered small bubbles by dragging thumb* — superseded by the right-rail chips (railItems, app.js:2294/2537); rebuilding the drag-cycle reintroduces gesture-arbitration debt. Skip.
- *Isometric 3D zen world / square-tile island / gardener→rich narrative / mental-garden fog / monetization / health+bank+Oura+Plaid data / tiered Duolingo-survival framework / arrow-at-goal haptic / upgradable wardrobe* — all are L/XL net-new subsystems or external integrations, not "revive a small dropped thing." Each is its own project, not a revival; out of scope for this cluster (build only when David re-greenlights individually).
- *Investigate trackpad pinch in preview* — tooling investigation, not an app feature; matches the documented "synthetic preview lies" limit. Not a build.
- *"Show many creative options to pick from"* — a request to David's design-chat process, no in-app surface. Not a build.
- *Energy identity = aspirational role, no virtues in identity stage* — directly contradicts the **current** shipped `recommitSheet` (step 0 = adjectives, step 1 = virtues, app.js:2996-2999). David has gone back and forth; needs his re-confirm before reworking onboarding. Hold.

---

## 1. Over-drift fork — "switch back to plan / keep drifting + replan how long"

**(1) Ask** (audit, line 184): *"the app offers u to either switch to the task u planned or keep drifting but again replan how long to drift and then adjust full plan around that drift."* asked ×2. Confirmed still open in the newest handoff backlog.

**(2) Buildable?** yes. All the primitives exist (`startTrackerNow`, `startPlanned`, `planBreak`, `nextPlannedBlock`, `reflow`, `activeTimers`). What's missing is the **overrun detector + the fork prompt**.

**(3) Approach** — add a soft overrun check that fires when a drift (or any tracked activity) runs past a threshold, offering a 3-way fork. Reuse, don't rebuild:
- Detect: in `renderLiveTracker` (the live-tracker re-tick path) compute `elapsed = logicalNowMin() - startMin` of the active timer. If the active timer is a **drift** (title "Drift" / `catK==="vice"` / `color===DOM.drift.c`), and `elapsed >= S.driftCap` (default 30) and we haven't already prompted this run (`timer._forked` flag), show the fork once.
- Fork prompt = a `pickSheet`-style overlay (reuse `pickSheet`, app.js:417) with 3 options:
  1. **Back to plan** → `var nb = nextPlannedBlock(todayK()); if (nb) startPlanned(nb); else startOrSwitch();` (stops the drift via the stop inside `startPlanned`).
  2. **Keep drifting — for how long?** → `durationSheet("Drift", function(mins){ ... })` (reuse app.js:401). Set `timer._driftBudget = mins`, reset `_forked=false` so it re-prompts after the new budget, and **reflow the rest of the day around the now+mins point** — exactly the `planBreak` truncation pattern (app.js:380-383): truncate the block the now-line splits, then `reflow(k)`. Do NOT start a new timer (the drift keeps running); just reshape the plan.
  3. **Stop** → `stopTimer(activeId)`.
- One-activity-at-a-time and reward-never-shame: copy must be neutral ("You've been drifting 30m — keep going, or back to the plan?"), never scold.

**(4) Code pointers** — `ldDrift` onclick (app.js:998) sets up the unnamed drift; `renderLiveTracker` (grep `function renderLiveTracker`) is the tick surface to hook; `planBreak` (app.js:379-384) is the copy-paste truncation+reflow pattern; `startPlanned` (app.js:377), `nextPlannedBlock` (app.js:376), `durationSheet` (app.js:401), `pickSheet` (app.js:417), `stopTimer`, `activeTimers` (app.js:374).

**(5) UI** (locked palette — sheet/overlay, not the timeline):
```
   🌫️  You've been drifting 30m
   ───────────────────────────────
   [ Back to plan → Deep work ]   ← DOM.focus colored chip
   [ Keep drifting — how long?  ]   ← DOM.drift / neutral
   [ Stop ]
```
Chips on the deep-berry overlay; the "back to plan" chip carries the next planned block's domain color; no glow.

**(6) Data** — per-timer transient fields `_forked` (bool) and `_driftBudget` (mins) on the active timer object; transient, no persist needed (timers are filtered to today on load anyway, app.js:1279). One persisted setting: `S.driftCap` default 30 — default it in `load()`: `if (S.driftCap == null) S.driftCap = 30;`. No SCHEMA bump.

**(7) Region** — live-tracker (`renderLiveTracker` + `ldDrift`). Does NOT touch `calendarView` render → low timeline-regression risk.

**(8) Effort** — M.

**(9) Risks** — the overrun timer must not fire repeatedly (guard with `_forked`). Keep it OUT of the `calendarView` draw to avoid the fragile-render risk. The reflow-around-drift reuses `planBreak`'s exact truncation so the "past is set in stone" contract holds. **Device-untested for feel** — the prompt timing should be confirmed on David's phone.

---

## 2. On-open: "plan ahead or just start tracking?"

**(1) Ask** (audit, line 88): *"it instantly asks you, do you want a plan ahead, or do you just want to start tracking... unplanned mode, so it's reactive mode."*

**(2) Buildable?** yes. Both destinations already exist (`planDay`/`planSheet` for plan-ahead; `startOrSwitch` for reactive tracking). Missing is the one-time daily prompt on open.

**(3) Approach** — a once-per-logical-day gentle prompt, only when **today has no plan and nothing logged yet** (so it never nags a mid-day return). At boot tail (after onboarding is done), check:
```
var k = todayK();
if (S.profile && S.profile.set
    && !blocks(k).length && !logs(k).length
    && S.lastOpenPrompt !== k) {
  S.lastOpenPrompt = k; save();
  openModeSheet();   // new small sheet
}
```
`openModeSheet` = a `pickSheet`/overlay with two buttons: **Plan my day** → `planSheet(k,"today")` (or `planDay(k)`); **Just start tracking** → `startOrSwitch()`. A third quiet dismiss ("later") that just closes. Don't block the timeline behind a modal — it's a chooser the user can dismiss to land on the normal always-open timeline.

**(4) Code pointers** — boot sequence (app.js:3251-3256, the nav-wire + `tab-day` boot + first-run onboarding at 3256); `planSheet`/`planDay` (planDay used at app.js:776); `startOrSwitch` (app.js:374); `blocks`/`logs` (1320/1321); `pickSheet` (417).

**(5) UI** (deep-berry overlay):
```
   How do you want to start today?
   ──────────────────────────────
   [ ☀️ Plan my day ]     ← DOM.focus tint
   [ ▶️ Just start tracking ] ← DOM.move / pink
            later
```
No glow; pink accent only where the now-line lives elsewhere — here use a soft domain tint on the buttons.

**(6) Data** — `S.lastOpenPrompt` (logical-day key string). Default in `load()`: `if (S.lastOpenPrompt == null) S.lastOpenPrompt = "";`. No SCHEMA bump.

**(7) Region** — boot/proactive. No `calendarView` change.

**(8) Effort** — S.

**(9) Risks** — must fire at most once/day and never when a plan/logs already exist (else it nags). Must not race the first-run onboarding (`setTimeout(onboard,350)` at 3256) — only show the mode-sheet when `S.profile.set` is already true, i.e. NOT first run.

---

## 3. Tools menu: morning journal + evening journal + self-help stack + guided meditation

**(1) Ask** (audit, line 134): *"tools will have morning journal and evening journal and self help stack maybe... guided meditation."* asked ×2.

**(2) Buildable?** yes — all four targets already exist as functions; they're just not wired into the day-tools menu. Morning/evening journal = the existing **rituals + recommit**; self-help stack = the existing **LINES affirmation reel**; guided meditation = the existing **breath orb** flow.

**(3) Approach** — extend `dayToolsMenu` (app.js:769) with new `item(...)` rows pointing at existing flows:
- **☀️ Morning journal** → `recommitSheet()` (app.js:2976 — identity/one-thing/gratitude) OR `ritualSheet(MORNING_RITUAL)` (app.js:152). Prefer `recommitSheet` (richer, includes a journaling/gratitude write).
- **🌙 Evening journal** → `ritualSheet(EVENING_RITUAL)` (app.js:159 — "what went well", set tomorrow's ONE thing). Optionally chain `yesterdaySheet()` (app.js:3169) as a review.
- **🧘 Self-help stack** → the LINES affirmation reel (the timed self-talk sequence at app.js:2184-2202). Extract its launcher into a named fn (e.g. `affirmReel()`) if it isn't already callable, then point the menu item at it.
- **🌬️ Guided meditation** → the breath orb (`breathorb` div used in `quickGrat`, app.js:2979; also `add(B,"div","breathorb")`). Wrap a minimal sheet: title + `breathorb` + a "done" → log a `Meditate` entry (`catK:"restore"`, mins from a chip). Reuse `durationSheet` for the length.

Keep the existing menu items (Plan day / Enhance / Clear / Undo / Test day). Group the four new ones under a thin "—— tools ——" label row if the menu gets long.

**(4) Code pointers** — `dayToolsMenu` (app.js:769-782, the `item(...)` pattern at 776-780); `recommitSheet` (2976); `ritualSheet` (3156) + `MORNING_RITUAL`/`EVENING_RITUAL` (152/159); LINES reel (2184); `breathorb` usage (2979); `yesterdaySheet` (3169).

**(5) UI** (the existing dark popover menu, anchored under the ⋯ button):
```
   📅 Plan day
   🪄 Enhance plan
   ── tools ──
   ☀️ Morning journal
   🌙 Evening journal
   🧘 Self-help stack
   🌬️ Guided meditation
   ── 
   🧹 Clear day
   ↩️ Undo
   🧪 Test day
```
Berry popover, domain-tinted icons, no glow (matches existing `pull-toolsmenu`).

**(6) Data** — none new (meditation logs reuse the existing log shape via `logs(k).push`).

**(7) Region** — `dayToolsMenu` only. No timeline render change.

**(8) Effort** — S.

**(9) Risks** — low. If LINES reel isn't currently behind a named callable, the only work is extracting a launcher fn (it already self-contains its overlay lifecycle, 2184-2202). Verify each launched sheet closes cleanly back to the timeline (they use `openSheet`/`closeSheet`).

---

## 4. New bubble defaults to one hour

**(1) Ask** (audit, line 112): *"When you make a new bubble, it should be the size of an hour automatically."*

**(2) Buildable?** yes. Pure constant change.

**(3) Approach** — change the hardcoded `mins:30` on the **on-timeline tap-create** path to 60, and the editor's plan default to match so the slider opens at 1h. Specifically:
- `makeBlock()` (app.js:2521): `mins: 30` → `mins: 60`.
- `editorSheet` `var DEF = isLog ? 15 : 30;` (app.js:2593) → `... : 60;` (plan blocks; logs stay 15).
- Decide on the other two creation paths: `distributePlan` push `mins:30` (app.js:788 area) and `scheduleSubtask` push `mins:30` (app.js:418). David's literal ask is about **manual new bubbles** (the tap-create). Keep `distributePlan`/`scheduleSubtask` at 30 unless David says otherwise (those are batch/auto placements where 30 is a sensible denser default) — note this divergence in the handoff and let him confirm. `planSheet`'s own cfg already defaults to 60 (audit line 114), so 60 on tap-create makes the app internally consistent.

**(4) Code pointers** — `makeBlock` (app.js:2521); `editorSheet` DEF (2593); `distributePlan` (784+); `scheduleSubtask` (418); `addSuggested` default 30 (app.js ~356, audit line 115).

**(5) UI** — new tap-created bubble renders ~2× taller; editor opens with slider at "1h". No palette change.

**(6) Data** — none.

**(7) Region** — block-create. The bubble HEIGHT is computed in `calendarView` from `mins`, so a taller default exercises the render but does NOT change render logic — **low risk**, but verify a fresh 1h bubble lays out without overlapping neighbors (reflow handles it).

**(8) Effort** — S.

**(9) Risks** — low. Confirm `reflow` still packs correctly when the default doubles (it clamps to 1410 and pushes neighbors — fine). Confirm a 1h empty bubble created near the now-line doesn't auto-cross into the past (the started/past contract is enforced in reflow at app.js:2888).

---

## 5. Allow placing goals/bubbles past midnight

**(1) Ask** (audit, line 117): *"it should allow you to place goals past midnight."*

**(2) Buildable?** partial → concrete. The **logical-day window already extends to 28h** (4am rollover; `endH` capped to 28 per audit line 120), but every placement/reflow path hard-clamps the bubble START to **1410 (23:30)**. The concrete version: raise the authoring ceiling from 1410 to the window's logical end (e.g. 1740 = 29:00 logical, matching `_ceilS = 1740` already used in the editor at app.js:2610) so a bubble can start after midnight within the displayed day.

**(3) Approach** — replace the literal `1410` clamp with a single `DAY_END_MIN` constant aligned to the timeline's logical window:
- Add near the top of the timeline math: `var DAY_END_MIN = 1740;` (29:00 logical = 5am next day; matches the editor's existing `_ceilS`). Subtract the chosen bubble length so the END also fits: clamp start to `DAY_END_MIN - (mins||30)`.
- Update each clamp: `makeBlock` `Math.min(1410,...)` (app.js:2521); `reflow` `s = Math.min(1410, s)` (app.js:2891); `nextFreeMin` `Math.min(1410,...)` (app.js:2902); `nextFreeTime`/`distributePlan`/`dayWindow` caps (audit line 120). Use `DAY_END_MIN` everywhere.
- The editor already allows `_ceilS = 1740` (app.js:2610) so the start-nudge can already go past midnight — this change makes the rest of the system agree with it.
- **Render alignment is the risk:** `calendarView` positions blocks by minute-of-logical-day. Confirm the y-mapping covers minutes 1410–1740 (it should, since the sky `KF` and window already render to 28h). If a block at 25:00 logical renders off-canvas, the timeline height/scroll extent must include those minutes — verify against the existing `endH=28` window before widening the clamp.

**(4) Code pointers** — `makeBlock` (2521); `reflow` (2881, clamp at 2891); `nextFreeMin` (2899); `editorSheet` `_ceilS=1740` (2610); the logical-day window / `endH` (grep `endH` and `logicalK`/`logicalNowMin`). Audit line 120 enumerates the clamp sites.

**(5) UI** — a bubble can now be authored at e.g. 12:30am and shows in the post-midnight tail of the same logical day; the night sky already renders navy there. No new chrome.

**(6) Data** — none (block `time` is "HH:MM" 24h; a 25:00-logical block is stored as the real wall-clock "01:00" on the next calendar key OR as minutes>1440 — **decide and document**: the cleanest is to keep storing wall-clock time and rely on the existing logical-day grouping that already places early-AM blocks into the prior logical day. Verify how `logicalK` buckets a 1am block before widening the clamp.)

**(7) Region** — reflow/clamp + (read-only check of) `calendarView` render extent. **MED→HIGH risk** because it brushes the fragile timeline math (rebuilt 3×). Flag DEVICE-UNTESTED.

**(8) Effort** — M.

**(9) Risks** — HIGH-adjacent: the timeline render is fragile. Do NOT change the render loop; only widen clamps and verify blocks beyond 1410 still position + scroll correctly. Re-check the full regression contract (CLAUDE.md): continuous scroll into next day, past = set in stone, week-strip tracks. The 4am-vs-midnight logical-day model (memory: "6am→6am logical day") interacts here — confirm a post-midnight bubble lands on the intended logical day, not the wrong calendar key.

---

## 6. Left/right arrows beside the date → prev/next day

**(1) Ask** (audit, line 144): *"clicking the left right button next to it should take u to next and previous day."*

**(2) Buildable?** yes. Day-change machinery exists (week-strip tap, `pageSlide` swipe, Today/Now pill). This just adds explicit chevrons that call the same day-change path.

**(3) Approach** — in the pull/timeline header (where the date label + tools (⋯) button live, app.js:836 area `pullHead`/`weekStrip`), add a `‹` button left of the date and a `›` right of it. Each calls the existing day-change function with `±1` (the same target the week-strip tap uses). Use `keyAdd(pullFocusK, -1)` / `keyAdd(pullFocusK, +1)` to compute the neighbor key, then route through whatever the week-strip uses to focus a day (grep the `weekStrip` tap handler at app.js:719 area) so scroll/centering stays consistent. Respect any future-cap (don't navigate past the planned horizon if one exists) — or allow free navigation like the week-strip does.

**(4) Code pointers** — `pullHead` / tools button (app.js:836); `weekStrip` (app.js:719) — copy its day-focus call; `keyAdd`/`key` date helpers (grep `function keyAdd`); `buildPull` (the redraw, called from many places). The date label render is in the pull header build.

**(5) UI** (berry header, low-clutter — keep it minimal):
```
   ‹   Fri · Jun 27   ›
```
Chevrons are muted (`mixHex(text,#160510,...)`), not pink (pink stays reserved for the now-line). Generous tap targets.

**(6) Data** — none.

**(7) Region** — pull header build. Does NOT touch the `calendarView` bubble render, but DOES trigger a day re-center → exercises the continuous-scroll contract. Keep it routing through the existing day-focus path so it can't introduce a second nav model (CLAUDE.md warns: never run two day-nav models at once).

**(8) Effort** — S.

**(9) Risks** — MED: must reuse the existing day-focus call, not a new scroll/pager, or it fights the v488-vs-pager bounce bug. DEVICE-UNTESTED for scroll feel — confirm tapping ‹/› centers the neighbor day without snap-back.

---

## 7. In-bubble-menu mini-timeline (neighbor activities, scrollable in time)

**(1) Ask** (audit, line 102): *"we have to show in this visualization the other activities to the left and to the right, and we should be able to scroll in time."*

**(2) Buildable?** partial → concrete. The editor (`editorSheet`, app.js:2589) currently shows only the single activity (hero/start/length/priority/steps). The concrete revival: add a **read-only context strip** at the top of the editor showing the 2–3 neighbors before/after this block in time, so you see what surrounds it without leaving the editor. (Drop the "infinitely scroll in time" ambition for v1 — a fixed ±2 neighbor strip is the high-value 80%; David's earlier scrubber was removed v478 for being fiddly, audit line 105, so keep this non-draggable.)

**(3) Approach** — at the top of `editorSheet` (after the trash-top, before/after the hero), build a horizontal strip:
- Gather siblings: `var sibs = (isLog?logs(k):blocks(k)).slice().sort(by hm(time));` find index of `o`, take `[idx-2 .. idx+2]`.
- Render each as a small chip: domain-colored pill with icon + `fmt(hm(b.time))` + short title; the current one (`o`) highlighted (slightly brighter border, NOT glow). Tapping a neighbor → `editorSheet(thatBlock, k, isLog)` (re-open editor on it) so you can hop along the day inside the menu.
- Make the row `overflow-x:auto` (horizontal scroll) so a dense day scrolls — that satisfies "scroll in time" cheaply without re-implementing the removed scrubber.

**(4) Code pointers** — `editorSheet` (2589; insert after trashTop at 2592, before hero at 2598); `blocks`/`logs` (1320/1321); `hm`/`fmt` (92/93); `tiClass`/`domainOf`/`DOM` for colors (used throughout editor, e.g. 2599); the removed-scrubber note (v478 commit ce8ed29, audit line 105) — do NOT re-add a draggable scrubber.

**(5) UI** (inside the editor sheet, deep-berry):
```
  …  7:00 🛏 Wake   [ 8:00 💻 Deep work ]  9:30 🍳 Break  …
                      ^ current, brighter edge
   (horizontally scrollable)
   ───────────────────────────
   [ 💻 Deep work ]  ← hero (existing)
   starts at …  length …  priority …
```
Neighbor chips use each block's domain color at the deep done/future mix (mix toward `#160510`), current = the lighter-edge treatment used for the active card; no glow.

**(6) Data** — none.

**(7) Region** — `editorSheet` (a sheet, not the timeline canvas). Low timeline-render risk; the chips are static DOM.

**(8) Effort** — M.

**(9) Risks** — low. Re-opening the editor on a neighbor must `pushUndo` cleanly and not double-stack sheets (reuse the existing `openSheet`/`B.innerHTML=""` reset the editor already does at 2590). Keep it read-only-with-tap-to-hop; do NOT make it draggable (that's the removed scrubber David rejected).

---

## 8. Integrate the fieldguide / Brian-Johnson wisdom KB into the brain

**(1) Ask** (audit, line 178): *"you haven't integrated the self help kb we built into fieldguide properly."* asked ×2.

**(2) Buildable?** partial → concrete. The optional AI "brain" already exists (`askBrain` app.js:3072, `brainContext` app.js:3092) but sends a generic "warm no-shame life coach" prompt with **zero** Johnson/fieldguide content. The concrete, single-file-safe revival: **inject a compact, curated wisdom layer into `brainContext`'s system prompt** (the full external KB lives in the `fieldguide/` project and can't be bundled wholesale into this single-file PWA — so distill it to a small in-app constant).

**(3) Approach** —
- Add a `var WISDOM = [...]` constant near the other content arrays (e.g. by `LINES` app.js:2184 or the rituals at 152): ~8-15 short, load-bearing principles distilled from the fieldguide KB (Johnson "Areté gap" — close the gap between who you are and who you're capable of being; identity → virtue → action; "rest is heroic too"; reward-never-shame; the recommit loop; two-minute floor / never-zero; etc. — David should supply/approve the exact lines; seed from `fieldguide/knowledge-base` Johnson + Withers lens).
- In `brainContext` (app.js:3092), prepend a brief framing that injects a few of these (rotate or include all if short): `"Coach me using these principles: " + WISDOM.join(" ") + " ..."` before the existing time/plan/habits context. Keep the prompt short (token budget; it's a free-tier model).
- Optionally surface the same `WISDOM` lines as the **self-help stack** content (ties to spec #3) so the wisdom shows even with the brain OFF (no API key needed = the "$0 floor" principle the app already follows for decomposition templates, app.js:404).

**(4) Code pointers** — `brainContext` (app.js:3092-3095 — the system prompt string to augment); `askBrain` (3072); `brainCfg` (3071); `LINES` (2184, the analog content array); the existing "rest is heroic too" copy at app.js:339 (the only current Heroic-flavored line). `DECOMP_TEMPLATES` (404) is the precedent for "$0 hand-authored floor + brain tailors later."

**(5) UI** — no new UI required for v1 (the brain's answers simply get wiser). Optional: the self-help stack tool (#3) renders `WISDOM` as the reel content. Deep-berry text, no glow.

**(6) Data** — `WISDOM` is a code constant, not user state → no persistence, no migration.

**(7) Region** — `brainContext` / content constants. No timeline touch.

**(8) Effort** — M (the engineering is S; the **content curation** from the fieldguide KB is the real work and needs David's voice/approval — flag it as a content gate, not a code gate).

**(9) Risks** — low engineering risk. Two real cautions: (a) keep the injected text SHORT — free-tier models have small context and David warned against burning budget; (b) the *full* nuanced KB genuinely cannot live in `app.js` — be honest in the handoff that this is a distilled subset, not the whole fieldguide KB, so it doesn't get marked "done" as if the entire KB shipped (that overclaim is exactly what the audit is calling out).

---

## Build order suggestion (lowest risk first, for parallel agents)

1. #4 (1h default) — S, isolated constant.
2. #3 (tools menu wiring) — S, isolated to `dayToolsMenu`.
3. #2 (on-open prompt) — S, boot only.
4. #6 (date arrows) — S, header only (route through existing day-focus).
5. #8 (wisdom into brain) — content-gated, no timeline.
6. #7 (neighbor strip) — M, editor sheet only.
7. #1 (drift fork) — M, live-tracker only.
8. #5 (past-midnight) — M, **brushes fragile timeline math; do last, device-test hard.**

#1, #3, #7 all open/extend sheets — if multiple agents run, they touch different functions (`renderLiveTracker`, `dayToolsMenu`, `editorSheet`) so no merge conflict. #4 and #5 both edit `makeBlock`/`reflow` clamps → **serialize those two** (same region).
