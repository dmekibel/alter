# POP-UP INVENTORY — 2026-09-20
David's verdict: "Get rid of every pop-up in the app. When I finish the morning stack, I don't want
a pop-up that says how did you like it, how do you feel. Finish and go straight to the home screen.
Any other pop-up we have right now, get rid of it."

One flag: `NO_POPUPS` (app.js, beside the LANDING CONTRACT kill-switches). Flip it to `false` and
every row below comes back exactly as it was. Helper: `gaugeOrSkip()` = `gauge010()` when popups are
on, `cb(null)` when they are off.

## REMOVED (gated on NO_POPUPS)

| # | Function / site | Trigger | What it asked | Verdict |
|---|---|---|---|---|
| 1 | `stackComplete(n)` | end of EVERY stack (Morning Stack, Night Stack, Breathe, Meditate, Build, tbxPlayNow) | "Session complete · N tools · carry the calm with you" + Done + "Make it yours" | REMOVE — the exact card David named. State writes (earn 8, celebrateGated, save, renderAll) still run; then it lands on HOME (`landAfterFlow()`, falling back to `openHome()` so a non-home launch still lands home). |
| 2 | `runRitual()` pre-gauge | tapping a guided ritual | "Where's the tension right now?" 0-10 | REMOVE — questionnaire in front of a flow you already chose. |
| 3 | `runRitual()` post-gauge | ritual finish | "And now?" 0-10 | REMOVE — the how-do-you-feel popup. |
| 4 | `runFullStack()` pre + post gauges | the Full Stack | same pair | REMOVE. |
| 5 | `runRitualReset()` pre + post gauges | the relief-door reset | same pair | REMOVE. |
| 6 | `resetSprint()` pre + post gauges | reset sprint, after the zone pick | "How heavy does the space feel?" / "And now?" | REMOVE (the zone picker itself is the tool, it stays). |
| 7 | `offerKeepMantra()` auto-call in `reprogramTool().onFinish` | 450ms after a completed Rewire | "Keep one line as yours?" | REMOVE the auto-offer. The function survives and is still reachable via `DEV.keepMantra()`. |
| 8 | auto-dealt deck card, `firstCommit()` (@1312) | after the first-commit seal | a theory card + "Got it" | REMOVE. |
| 9 | auto-dealt deck card, DAY1 lesson `onDone` (@1367) | after lesson fd0 | card + "Got it" | REMOVE. |
| 10 | auto-dealt deck card, the Catch lesson `onFinish` (@1434) | after the catch rep | card + "Got it" | REMOVE. |
| 11 | auto-dealt deck card, `morningDoor().onFinish` (@20500) | after the morning switch | card + "Good" | REMOVE. |
| 12 | `offerAnother()` in tapping | after an EFT pass that did not clear | "Want another round?" Tap again / I'm good | REMOVE — the run now closes straight out. |

### State that a removed pop-up used to write
- `S.tools.gauge` (the efficacy ledger) no longer gets a row for ritual / full-stack / reset / reset-space
  runs. The push is skipped entirely when both `pre` and `post` are null, so no `{pre:null,post:null}`
  garbage lands on disk. Readers already guard (`delta != null`). Nothing else reads those rows except
  the first-stack / daily-stack open, which is untouched.
- `S.mantra` is no longer set by the Rewire offer. It stays undefined until David sets one; every
  reader of `S.mantra` is already null-guarded (the Rewire tool's Organ I install path).
- Every `earn()` / `celebrateGated()` / `save()` / `renderAll()` / log write that lived inside a removed
  card was kept and runs on the silent path.

## KEPT (David's veto list)

| Surface | Why kept |
|---|---|
| `gauge010()` itself | still the engine for the two kept gauges below; the flag decides per call site. |
| `theOpen()` before/after charge dials | that IS the first-run ceremony (and the daily "open" the user taps into), not an interstitial after something else. |
| `firstDayStack()` / `runFirstStack()` pre+post gauge | the first-run path. The day-one outro ("YOUR FIRST LOOP", the tension delta, "Why it worked") only renders when `post != null` — skipping the gauge deletes the whole onboarding ending. Veto this and I will rebuild the outro without the delta. |
| tapping (EFT) SUDS pre + post rating | the 0-10 re-rate IS the tool's mechanism, not a satisfaction survey; the user is inside the tool they opened. Veto-able. |
| `resetSprint()` zone picker | the tool's own first screen. |
| beatRunner intro cards (what / how / why) | the tool's own opening screen, shown because you tapped the tool. |
| Editors, settings, pickers, session composer, dose cards, Make-it-yours *inside* the builder | user-opened surfaces. |
| `window.confirm` on backup "♻ Replace" | destructive-action confirm. |
| `toast()` (2.6s, no dismiss) and the TLM chip (2.1s) | non-blocking, nothing to dismiss. |
| `celebrate()` / `rewardFx()` bursts | non-blocking FX over the current screen. |
| Deck cards rendered into the PM-close / week-seal stage (@4993, @5038, @5054) | drawn INTO a surface the user opened, never a floating card. |
| Onboarding survey, the guided tour | deliberately entered. |
| `gaugeOpen()` | already a no-op stub (killed 2026-08-01 / the 2026-08-15 CULL). |
| welcome-back sheet, space-check, moment-listener nudges, off-ramp, tranquility offer, comeback ladder, motivation dial, catalyst card | already deleted by THE CULL (2026-08-15). Nothing to do. |
