# SPEC — Tracker: states beyond batch 1  (SLUG: `tracker-states`)

Build-ready specs for the **expanded live tracker** (`#trackerFull`, the swipe-up reward-RING surface, `renderTrackerFull` app.js ~1021) and the **timeline render of late-started blocks** (the straddle render, calendarView ~2231–2266).

**Read before building:** `CLAUDE.md` (ship loop + regression contract), `HANDOFF-visual-redesign-2026-06-27.md` (locked palette), and `TRACKER-HANDOFF-2026-06-26.md`. The whole expanded-tracker state machine ALREADY EXISTS as of v505/v561 — these features POLISH and COMPLETE it, they do not rebuild it. Do not graft a parallel state system.

## What already exists (so you don't rebuild it)
- **`trackerState()` (app.js:1001)** — derives one of 5 ids from live data: `idle` / `onplan` / `off` / `break` / `breakup`. Break is driven by `S.brk = {title,dom,catK,color,start,mins}` (set in `tfStartBreak` 1069; `breakup` = break timer elapsed).
- **`renderTrackerFull()` (app.js:1021)** — paints the ring + tile + title/verdict/time/ctx/spark for each state. Sets body classes `st-idle/st-onplan/st-off/st-break`.
- **`renderTFControls(state)` (app.js:1076)** — the labeled button rows per state (Done/Pause/Switch/Replan etc).
- **`setRing(p,col)` (1066)**, **`tfStripe(C)` (1010)**, **`setTFNext(afterMin)` (1012)**, **`nextUpBlock(afterMin)` (1011)**, **`tfDone()` (1067)**, **`tfStartBreak/Resume/End/Plus` (1069–1072)**, **`renderSwitchChips` (1020)**.
- Live ticking loop **app.js:3076–3083** already updates `tfTime` countdown for breaks and flips break→breakup at 0.
- `#trackerFull` markup: **index.html:1263–1278** (`tfRing`, `tfTile`, `tfTitle`, `tfVerdict`, `tfTime`, `tfElabel`, `tfCtx`, `tfSwitch`, `tfNext`, `tfSpark`, `tfCtrls`, `tfClose`).
- **Straddle render** (a block the now-line crosses): `_straddle` branch calendarView ~2250–2266; `matchedSpan()` (2335) + `partial` split ~2239/2267.

## Helpers to reuse (do NOT reinvent)
`el(id)` · `add(parent,tag,cls,txt)` (1313) · `DOM[domain]` colors `{c,ink,light,ti}` (~249) · `mixHex(a,b,t)` (286) · `esc` (285) · `fmt(min)` (93) · `dur(m)` (94) · `hm("HH:MM")` (92) · `pad` (78) · `fmtCD(ms)` (1068) · `blocks(k)` · `logs(k)` · `save()` · `tiIcon/tiClass` (301-302) · `domainOf` (274) · `blockStatus` (104) · `nextPlannedBlock` (376) · `startPlanned` (377) · `bumpStreak`/`coolStreak` (315-316) · `celebrate(color,streak)` (317) · `earn(base,ctx)` (1857).

## LOCKED design rules (every change)
Deep berry/wine fills + DOM domain colors. **NO neon / glow / shine / white surfaces.** The pink now-line (`#ff5fa8`) is the brightest thing — tracker ring/tile must sit darker. One activity at a time. Reward-never-shame (no "you failed" copy). Full-screen, low-clutter. **The timeline render is FRAGILE (rebuilt 3×) — any change in calendarView straddle/match region is HIGH RISK; label DEVICE-UNTESTED.**

---

## FEATURE 1 — Break TIMER-UP anti-quit fork polish

**(1) Ask** _(grand-audit ledger #5, "drift-overrun fork"; tracker handoff NEXT: "the break-flow ... were designed")_: when a declared break's timer runs out, don't just sit on "Break's up" — gently fork the user back to the plan vs. consciously extend, and never let the break silently quit the day. Polish the `breakup` state so it's an anti-quit nudge, not a dead end.

**(2) Buildable?** YES. The `breakup` state + its controls already exist (`renderTFControls('breakup')` 1086: "Back to it / +5 min / End"). This is polish: add an escalating overrun readout, a clearer fork, and reward-safe copy.

**(3) APPROACH:**
- In `renderTrackerFull` break branch (1037–1048): when `_up` (break elapsed), compute overrun `_over = Date.now() - _bend`. Drive the ring/copy off it:
  - `tfVerdict` = "break's up — come back?" (not the current "ready to come back").
  - `tfCtx` = if `B.title`: "your plan waits: " + B.title; else "ready when you are".
  - `tfElabel` = "over by", `tfTime` = `fmtCD(_over)` counting UP (so overrun is visible, gently — NOT shaming). Keep ring at full (`setRing(1, "#e8b53a")`) — gold = the declared-break color, which is reward-safe.
  - After a soft threshold (e.g. `_over > 10*60000`), nudge the tile: keep gold but add a small "still on break" copy in `tfCtx`. No red, no alarm (reward-never-shame).
- `renderTFControls('breakup')` (1086): make the fork explicit and primary-weighted:
  - PRIMARY = **"Back to it"** → `tfResumeBreak` (restarts the paused goal). If `B.title` is empty, primary = **"Start tracking"** → `tfPickTrack`.
  - secondary row: **"+5 min"** (`tfBreakPlus(5)`) and **"End break"** (`tfEndBreak`).
  - Add a third option **"Pick something else"** → `tfPickTrack("What now?")` so leaving the break ISN'T just "end" (the anti-quit fork: resume the plan / extend / switch — never a dead stop).
- `tfBreakPlus` (1072) already re-extends; keep. When extended past the original, the state flips back to `break` automatically (because `Date.now() < bend` again) — good, that's the "consciously extend" path.

**(4) CODE POINTERS:** `trackerState` 1002 (break/breakup derivation) · `renderTrackerFull` break branch 1037–1048 · `renderTFControls('breakup')` 1086 · `tfResumeBreak`/`tfEndBreak`/`tfBreakPlus` 1070–1072 · `tfPickTrack` 1075 · live ticker 3080.

**(5) UI (on the locked palette):**
```
        ╭──────────╮         ring = full GOLD #e8b53a band (reward-safe, NOT red)
       ╱   ☕  ☕   ╲        tile = gold tfStripe, coffee icon
      │  ▓▓▓▓▓▓▓▓  │
       ╲          ╱
        ╰──────────╯
        Break's up                 ← tfTitle
      come back?                    ← tfVerdict (gold)
        +2:14                       ← tfTime counting UP, tfElabel "over by"
   your plan waits: Deep work       ← tfCtx
  ┌────────────────────────────┐
  │   ⟳  Back to it            │   ← PRIMARY (tf-done, full width)
  └────────────────────────────┘
   [ +5 min ]  [ Switch ]  [ End ]  ← secondary tf-row
```

**(6) DATA:** none new. `S.brk` already exists + persists (load() at 1199 does NOT strip `S.brk`, only timers). No migration. (Optional hardening: in load(), if `S.brk` and `S.brk.start` is from a previous logical day → `S.brk = null`. Cheap guard against a stale overnight break.)

**(7) REGION:** `renderTrackerFull` + `renderTFControls` (app.js 1021–1091). Self-contained — does NOT touch calendarView. Low conflict risk with other tracker agents IF they coordinate on these two functions.

**(8) EFFORT:** S.

**(9) RISKS:** Low. Pure copy/control polish inside the expanded tracker; no timeline touch. Keep colors gold (no red — red would read as shame/alarm, violating reward-never-shame). The +5→flip-back-to-`break` path must be tested: confirm `trackerState` re-derives `break` once `Date.now() < bend` again. Device-untestable bits: none gesture-based, so preview-verifiable (boots + state renders).

---

## FEATURE 2 — FINISHED-EARLY completion burst → re-prime to next

**(1) Ask** _(state-matrix nuance; ledger "completion burst → re-prime")_: when you tap Done on an on-plan activity (especially finishing early), fire a satisfying completion burst, then re-prime the tracker to the NEXT planned block instead of just closing — keep the momentum / streak loop going.

**(2) Buildable?** YES. `tfDone` (1067) currently `closeTrackerFull()` then `stopTimer()`. The reward (gold celebrate + bonus Spark + streak) ALREADY fires inside `stopTimer` (2898: `onPlanBlockFor` → `celebrate` + `earn(bonus)`). The missing piece: a tracker-level burst + re-prime to the next block, keeping the surface OPEN.

**(3) APPROACH:**
- Rewrite `tfDone()` (1067) so it does NOT close immediately. New flow:
  1. `var run = activeTimers(), t = run[run.length-1]; if(!t){ closeTrackerFull(); return; }`
  2. `stopTimer(t.id)` — logs it + fires the existing on-plan reward (celebrate/earn/streak in stopTimer 2898). This already handles the matched-span print + Spark + streak.
  3. Compute `var nxt = nextPlannedBlock(todayK())` (376) — the next still-to-do block.
  4. **Burst:** show a brief in-tracker "completion" overlay using the activity's domain color (NOT white, NOT neon): a centered `tf-burst` element — a ring-flash on `tfRing` (re-fill conic to 100% in the domain color for ~600ms) + a "+N Spark" line + "✓ done" + streak `🔥×N`. Reuse `earn`'s float style only if it doesn't conflict; simpler = a 1.5s text overlay added to `#trackerFull`. Reward-safe copy: "Nice — done early" if `elapsed < block.mins`, else "Done".
  5. **Re-prime:** after the burst (~1.2s `setTimeout`), if `nxt` → keep tracker OPEN and re-render in `idle` state primed to `nxt` (the idle branch 1026 already shows the next block with a colored "Start" button via `renderTFControls('idle')`). Call `renderTrackerFull()`. If NO next block → `closeTrackerFull()` (nothing left to prime).
- "Finished early" detection: in stopTimer's on-plan branch (2898) `_covered` is already computed (`mins >= blockSpan-5`). Finishing EARLY = on-plan block exists but `_covered` false → the block stays partly future (good — don't mark `opb.done`, which is already the v561 behavior). So "finished early" in the tracker = you tapped Done before the block window ended. Detect in `tfDone` BEFORE stopTimer: `var early = S0.block && (nowMin() < hm(S0.block.time)+(S0.block.mins||30))` (use `trackerState()` to get `S0.block`).

**(4) CODE POINTERS:** `tfDone` 1067 (rewrite) · `stopTimer` 2898 (already rewards; do NOT duplicate the celebrate/earn — let stopTimer own it) · `nextPlannedBlock` 376 · `trackerState` 1001 (for early-detect + the re-prime idle render) · idle branch of `renderTrackerFull` 1026–1035 · `setTFNext` 1012 · `setRing` 1066 (for the burst flash).

**(5) UI (burst, on locked palette):**
```
   ring flashes to 100% in the block's DOMAIN color (e.g. focus #36b3f0), ~600ms, no glow
        ✓ Nice — done early                  ← tfTitle during burst
        +18 Spark · 🔥 ×4                     ← tfSpark, domain-light text
              (1.2s later)
   ── re-primes to idle, ring grey ──
        Evening walk                          ← next block title
        ready when you are
        6:30pm · planned 45m
  ┌────────────────────────────┐
  │   ▶  Start                 │             ← colored as 'move' domain
  └────────────────────────────┘
   [ Just track ]  [ Replan ]
```

**(6) DATA:** none new. Streak/Spark already in `S.game` (managed by stopTimer/earn/bumpStreak). No migration.

**(7) REGION:** `tfDone` + idle branch of `renderTrackerFull` (app.js 1021–1067). Touches `stopTimer`? Only to READ its existing reward behavior — do NOT add a second reward there (double-counting Spark/streak is the main bug risk). Low conflict with Feature 1 (different function) but BOTH edit `renderTrackerFull` — coordinate edits.

**(8) EFFORT:** M (burst animation + re-prime sequencing + early-detect).

**(9) RISKS:**
- **Double-reward:** stopTimer (2898) already calls `celebrate` + `earn(bonus)` + `bumpStreak` for an on-plan stop. `tfDone` must NOT also reward, or Spark/streak double-counts. The burst is VISUAL ONLY (re-reading `S.game.streak`/`spark` after stopTimer).
- **Streak read timing:** `stopTimer` is synchronous and saves before returning, so reading `S.game.streak` right after is safe.
- The `setTimeout` re-prime must guard `TF_OPEN` (user may have closed it) — check `if(!TF_OPEN) return;` inside the timeout.
- No timeline-render change → not HIGH RISK. Preview-verifiable (the burst + re-prime are non-gesture).

---

## FEATURE 3 — Full state-matrix nuances

**(1) Ask** _(grand-audit "Three future options" + "Three past realities" + "Drift stays unnamed in the moment, labelable after"):_ complete the nuances of the on-plan / off-plan / drift / overrun states so the verdict + pacing copy + controls are always honest and reward-safe — including the unnamed-drift entry path and over-by readouts.

**(2) Buildable?** PARTIAL → concretize into 4 named nuances:

**3a. On-plan / off-plan OVERRUN readout (yes, S).**
`renderTrackerFull` already computes pacing for `S0.block` (1056): "Nm left" or "over by Nm". Polish: when overrun (`rem<0`), set `tfVerdict` to a reward-safe "running long" (NOT "you're late") and tint the ring: keep on-plan GREEN `#28cf86` but stop filling past 100% (`setRing` clamps at 1 already, 1066). Add the ring sub-color shift only if David confirms — default = keep green, change copy only. CODE: 1056, 1061.

**3b. Drift verdict + honest copy (yes, S).**
`off` state with `S0.drift` already says "drifting" (1053) / "off your plan" (1057). Confirm the ring is dim `#6a5870` (1061) — yes. Nuance: drift should still show accumulated drift minutes in `tfSpark` honestly (it does via `tfDomMinsToday(S0.dom)` 1059) but label it "drift" not a reward. Change `tfSpark` for drift to `🔥 ×N · ⏱ <drift mins> drift` so drift time isn't dressed as achievement. CODE: 1059–1060.

**3c. Unnamed-drift entry (partial → yes, M).**
_Audit: "Drift stays unnamed in the moment, labelable after the fact."_ Today every entry forces an activity pick (`tfPickTrack`/`startOrSwitch` open bentoPicker first). Add a **"Just drift"** path: from idle/off controls, a button that starts a timer with `title:"Drift"`, `color: DOM.drift.c`, `catK:"drift"` (a drift-domain timer) WITHOUT a picker — left deliberately unnamed. The existing past-relabel (`relabel`, bentoPicker "What is it?" ~2208) already lets you name it after the fact. APPROACH: add `tfJustDrift()` = `activeTimers().forEach(stop); startTimer({title:"Drift", color:DOM.drift.c, catK:"drift"}); ...renderTrackerFull()`. Wire a small "Just drift" button into `renderTFControls('idle')` and `('off')`. CODE: `renderTFControls` 1082–1090; `DOM.drift` (~249); `startTimer` 2897; `domainOf` (274 — confirm `catK:"drift"` resolves to drift domain; check the drift branch).

**3d. Idle "Create plan vs Replan" already correct (no-op, verify).**
`renderTFControls` off-plan branch (1088–1090) already chooses Create-plan vs Replan correctly (David 2026-06-27). Just VERIFY it survives Features 1+2 edits; no change.

**(3) APPROACH:** the four sub-changes above, all inside `renderTrackerFull` + `renderTFControls`. No new states — the matrix (idle/onplan/off/break/breakup) is complete; this fills copy/ring/entry gaps within it.

**(4) CODE POINTERS:** `renderTrackerFull` off/onplan branches 1049–1064 · `renderTFControls` 1076–1091 · `tfSpark` line 1060 · `DOM.drift`/`domainOf` 249/274 · `startTimer` 2897 · `relabel`/past bentoPicker ~2208.

**(5) UI:**
```
ON-PLAN OVERRUN:                 DRIFT (unnamed):
  ring GREEN full                  ring DIM #6a5870
  "running long"                   "drifting"
  over by 6m · ends 4:30pm         off your plan
  🔥 ×3 · ⏱ 1h 20m                 🔥 ×3 · ⏱ 35m drift
  [Done][Pause][Switch][Replan]    [Replan][Switch][Stop]
                                   + idle/off rows gain: [ ~ Just drift ]
```

**(6) DATA:** none new. Drift timer = a normal `S.timers` entry with `catK:"drift"` — already supported by `domainOf`. No migration.

**(7) REGION:** `renderTrackerFull` + `renderTFControls` (1021–1091) — SAME functions as Features 1 & 2. **All three of this cluster's tracker features edit these two functions** → a single build-agent should own Features 1+2+3 together, or they must merge carefully. Flag for the orchestrator: tracker-states 1/2/3 = one editing surface.

**(8) EFFORT:** M (3a/3b/3d trivial; 3c is the real work — new entry path + button wiring).

**(9) RISKS:**
- 3c: confirm `domainOf({catK:"drift"})` returns `"drift"` — if not, a "drift" timer won't dim the ring or read as drift (read `domainOf` 274 first). If catK alone isn't enough, set `color: DOM.drift.c` AND a `domain:"drift"` field if logs honor it.
- No timeline change → not HIGH RISK. Copy/ring/entry only; preview-verifiable.
- Reward-never-shame: keep overrun copy gentle ("running long", never "you failed / you're late").

---

## FEATURE 4 — Late-started block render (complete bar bottom + incomplete top-right)

**(1) Ask** _(audit:706): "maybe i started it late so it would be complete bar but on the top it would be not complete on the right cuz thats part of failed plan"_ — a block you start LATE should render its tracked portion as a complete (matched) bar at the bottom, with the un-started/un-tracked early portion shown as incomplete (ghost) at the top-right.

**(2) Buildable?** PARTIAL — the mechanism EXISTS but is device-untested and David's exact "complete bottom + incomplete top-right" geometry isn't confirmed. Concretize to: make the existing straddle/partial split match David's sketch precisely, then DEVICE-UNTEST-flag it.

**(3) Current behavior (read this first):**
- **Straddle** (`_straddle` 2231, render 2250–2266): a block the now-line crosses, when you ARE tracking it (`_trk`), splits into:
  - GHOST head = untracked early part `bs → _tsm` (when you started), a standalone rounded plan-lane bubble, dark hollow + domain outline (2255).
  - TRACKED stretch = `_tsm → now`, a full-width bright matched `matchseg` bar, rounded top / square bottom, flowing into the future (2258).
  - FUTURE half = faint hollow outline `now → be` (2259).
- **Partial match** (past, fully): `matchedSpan` + `partial` (2239, 2267) → matched span = its own shining bar; the unfulfilled remainder breaks into its own ghost bubble. The remainder goes ABOVE or BELOW the matched span depending on `_post >= _pre` (2239).

**This already implements "late start = the early gap is ghost, the tracked part is a complete/matched bar."** The gap vs David's words: he wants the COMPLETE bar at the BOTTOM and the INCOMPLETE part at the TOP-RIGHT. The partial code (2239) puts the remainder above OR below by size; it should ALWAYS put the un-tracked early part on TOP for a late start (early-in-time = higher on the timeline = top, which is already true since time flows top→down). The "right" placement = the incomplete remainder should sit in the PLAN (left) lane offset, while the matched bar is full-width at the bottom.

**(4) APPROACH (precise to the sketch):**
- For a **past, late-started** block (matched span starts AFTER block start: `_pm.start > bs + 5`):
  - Force the unfulfilled remainder to the EARLY part: `_uS = bs; _uE = _pm.start` (the un-started head) — i.e. when `_pm.start > bs`, always pick the head as the remainder, overriding the size heuristic at 2239 for this case.
  - Render that head ghost bubble in the PLAN (left) lane only (`left:26px; right:calc(50% + 4px)` — lane "P"), dark hollow + domain outline = "incomplete, top". Add a small "started late" sublabel (reward-safe, muted) OR reuse the existing "missed"-style `csub` but with copy "late start" (gentle).
  - Render the matched span (`matchseg` 2267–2272) full-width at the BOTTOM = the complete bar. Already full-width (`left:26px; right:4px`). ✓
- Confirm the LIVE straddle (`_trk` 2254) already does bottom-complete (tracked `matchseg` 2258) + top ghost head (2255) — that's the live version of the same picture; align the copy/lane with the past version so they read identically.

**(5) UI (late-started past block):**
```
 PLAN lane (left)          REAL (right)
 ┌──────────┐             :  ← top: GHOST of the un-started early part,
 │ ▒ Focus  │             :     domain-outline hollow, plan lane only,
 │  late    │             :     muted "late start" sub
 └──────────┘             :
 ┌───────────────────────────┐ ← bottom: COMPLETE matched bar, full-width,
 │ ◆ Focus block          ✓ │     deep domain stripes (#160510 mix .62/.73),
 └───────────────────────────┘     ink edge, NO shine/glow
```

**(6) DATA:** none new. Uses existing `S.blocks` + `S.log` overlap (matchedSpan). No migration.

**(7) REGION:** **calendarView straddle/partial render (app.js ~2231–2272).** This is the FRAGILE timeline (rebuilt 3×). HIGH RISK. Do NOT let any other timeline-touching build-agent run in this region concurrently. Coordinate with any "tracker — batch 1 / present mechanic" agent.

**(8) EFFORT:** M (the logic is a targeted override at 2239 + lane/copy alignment), but the VERIFY cost is high (device-only).

**(9) RISKS — HIGH:**
- **This is the 3×-rebuilt timeline render.** A wrong height/top math = blocks overlap or float (the exact class of bug that caused prior reverts). Reuse `topFor`/`place`/the floor-5/margin-4 height math EXACTLY (2208, 2216) — do not introduce a new height formula (mismatched heights between commit-render and live-zoom-render caused the "bounce").
- Must not change the FULLY-matched (`status==="ok" && !partial`) path (2236/2242) — only the `partial` head-placement (2239) and copy.
- **DEVICE-UNTESTED:** the split geometry, ghost-vs-matched contrast, and "top-right" placement can only be judged on David's phone (and from a distance via `preview_resize 390x1500` per the handoff). Preview proves it BOOTS and renders without overlap; it does NOT prove the look is right. **Label this DEVICE-UNTESTED in the handoff; show David a `390x1500` screenshot and ask him to confirm the geometry before marking done.**
- Keep the now-line the brightest thing; the matched bar must stay darker than `#ff5fa8`.

---

## Build order & conflict map (for the orchestrator)
- **Features 1, 2, 3 all edit `renderTrackerFull` (1021) + `renderTFControls` (1076)** → assign to ONE build-agent (or strict serialization). Order: 3 (matrix nuances, smallest) → 1 (break fork) → 2 (completion burst, touches the same idle branch 2 re-primes into).
- **Feature 4 edits calendarView (~2231–2272)** — a DIFFERENT, FRAGILE region. Can run in a separate agent, but must NOT overlap any other timeline-render agent. HIGH RISK; device-confirm required.
- No SCHEMA bump / load() migration required for any feature (optional stale-break guard in Feature 1 is cosmetic). `S.brk` already persists; `S.game` already tracks Spark/streak.
- Ship each via `bash _dev/preship.sh` then commit/push. Preview proves boot + non-gesture render; the burst (F2) is preview-verifiable, the timeline geometry (F4) is DEVICE-UNTESTED.
