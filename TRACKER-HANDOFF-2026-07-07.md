# TRACKER HANDOFF, 2026-07-07 (overnight autonomous build)

---

# CURRENT STATE, 2026-08-16 — PHASE 1 IS DONE (v1304 to v1306)

Everything below this block is the July archive. Read this part.

**PHASE 1, the usability floor, is complete.** All six items David named on 2026-08-15 are shipped:

| # | item | ship | root cause found |
|---|---|---|---|
| 1 | Popups all removed | v1304 | 22 functions deleted, dead menu system gone, invisible-modal z-band fixed. They come back only after David approves new ones. |
| 2 | Never land at the top of the journey | v1304 | `jpFocusCur()` extracted from an anonymous closure; all three entry paths measured 0 to 4257.5 |
| 3 | Breathing: visual, indicator, cue sets, guiding tone | v1306 | TWO engines, and the toolbox door reached the one with NO audio; plus the tone was genuinely broken (un-anchored ramp, 118 to 256 cents of crack) |
| 4 | Voice switching | v1302, v1305 | three faults (stale decoded buffers, a suppressed preview, chips writing the wrong state key), then David's own mid-line rewind + crossfade design |
| 5 | Meditation story-bar | v1304 | multi-part meditation expanded its own bar; now one bar per step |
| 6 | Pause and timing engine | v1304 | one uniform pause where the content needs several kinds; now `seg._pk` kinds resolve per cue |

**THE ONE MOVE FOR DAVID:** test the breathing tool on the phone and say whether the tone sounds gentle, then whether the voice-swap seam is inaudible. Both are DEVICE-UNTESTED by definition and both have a one-number tuning ladder waiting.

**THE ONE MOVE FOR CLAUDE:** paste `_design-sync/PROMPT-pane-transitions.md` into Claude Design and get the running prototype back, because Phase 2's swipe work cannot start honestly without it (LAW 8).

## DEVICE-UNTESTED right now
- Breathing: whether the tone is gentle, the cue volumes at David's level, whether the woodblock reads soft rather than clicky, and lock/unlock mid-session.
- Voice swap: whether the 0.5s rewind lands on word boundaries and the 90ms crossfade is inaudible. Ladder: rewind 0.5 to 0.8, then crossfade 0.09 to 0.15, then restart-from-zero.

## Known consequences shipped deliberately
- **Relax under-runs long doses.** Only 8 authored cues exist, so a 5 minute relax now composes about 112s instead of padding with silence. Honest, but it needs more written cues or a dose cap. David's call.
- **Composed breath now runs at its real speed.** `relayoutFrom` was adding 600ms to every voiceless segment, so every breath phase ran long and the drift compounded. A 4.0s inhale was 4.6s. Fixed, so stacks will feel slightly faster.
- **A mid-line voice swap adds about 0.5s to the session total** (that audio really was replayed), so the remaining-time readout shifts.
- **A paused player now re-voices too** and resumes the line in the new voice from the rewound point.

## Open for David, one line each
- Launch date: MASTER-GAMEPLAN targets a late-August founding launch and Phases 2 to 4 are months. Options a/b/c are in the gameplan revision; recommend cutting scope to a founding launch on Phase 1 plus the garden fixes.
- Old saved sound pick returns as bell cues with the tone off, so the new tone is judged fresh. Tap Glide to hear it.
- The inhale climbs a perfect fourth. Narrower is a one-number change if it reads as a siren.
- Night Stack vs Body in the tools grid second row, still unanswered.
- The $99 Apple Developer enrollment is decided but not done, and needs a LEDGER line.

## NEXT: Phase 2, the garden and the five-way world
Empty garden menus that teach, plant-anywhere, the gardener WALKS to the spot, swipe left to planner and right to garden with two-finger garden pan, no overshoot in any direction, pane transitions and a DIRECTIONAL home cascade. The Claude Design prompt is written and adversarially audited at `_design-sync/PROMPT-pane-transitions.md`. Phase 3 is the journey redesign plus lessons. Phase 4 is the animation and education layer.

---

## MORNING BRIEFING (read this first)
Good morning David. The loop shipped five green increments (v916 to v920), then wound down on budget so you would not wake to zero. The app is live and bootable at https://dmekibel.github.io/alter/fresh.html (v920). Beyond the two rituals, it also cleaned the copy you flagged: the "why you're here" lesson (v919) and the two abstract Rewire lines (v920) are now concrete, with the em-dashes gone. Every push passed preship and booted clean in preview. Gesture, audio, and flame FEEL are always DEVICE-UNTESTED, the preview cannot prove them.

**What got built:** the first two ritual-as-reps, the whole point of the journey consolidation (the lesson is a rep, not text). Plus the reusable breath visual.

**Test these two first on your phone (this is the thing I could not test):**
1. **The Candle Vigil** (toolbox, "Clear the mind", Candle Vigil, AND now in the journey as "Steady your attention"). Press and hold. Does the flame grow while you hold and gutter when you let go? Does the charge ring fill, the hold complete, the peak line land? That gesture decides whether ritual-as-rep works.
2. **The Chalice** (toolbox, "Steady the body", The Chalice). A guided breath with the new breath visual (an orb that expands on the inhale, contracts slow on the exhale). Does the pace feel right and calming, is the longer exhale actually longer?

Tell me how those two feel and I will tune them. Then we pick up the remaining plan (see NEXT), starting with the de-text pass.

- **What shipped:** SHIPPED LOG below (newest first).
- **What is device-untested:** the DEVICE-UNTESTED list.
- **What is next:** the NEXT section (increments 3 to 5, written up so we can start clean).

---

## SHIPPED LOG (newest first)
- **v922 — Candle rework (from David's 2nd device test).** He felt it LESS when over-smoothed (kinetic energy matters to the felt charge) and the square read wrong. Now: the flame is a teardrop BENT by layered wind gusts (leans/curves like a real draft), the light output FLICKERS (glow alpha + radius + core brightness pulse), and the whole scene sits INSIDE A CIRCLE (clipped, orb-style) with the charge ring on the rim. Verified: boots clean (v922), invariants pass, screenshot confirms the circular composition, zero console errors. DEVICE-UNTESTED: whether it feels alive and the charge lands again.
- **v921 — Ritual animation polish (from David's device test).** He tested the Candle Vigil and FELT the charge (big validation). Fixes: the breath orb now uses easeInOutSine per phase (was robotic/linear); the candle flame uses layered-sine sway (was per-frame jitter). Verified boots clean (v921), invariants pass, candle renders, zero console errors. DEVICE-UNTESTED: the felt smoothness. Also captured the big direction: `_specs/SPEC-CHARGING-ENGINE-2026-07-07.md` (the hold-to-charge becomes a reusable primitive; Dispenza's Descend/Charge/Seal maps 1:1; framed as mental-rehearsal + placebo, science not woo).
- **v920 — Rewire tool, fixed the abstract lines (item 3, more).** The two lines David named as abstract/corny ("Picture yourself already being the way you want to be, vividly" and "Picture it already true") are now concrete and scene-based: "See it as a real scene: you, already doing the thing, in a moment you can picture." RU same commit. Verified boots clean (v920), invariants pass, zero console errors.
- **v919 — De-text pass, the "why you're here" lesson (build order item 3, partial).** Fixed the exact copy David flagged: the ws_why lesson's confusing "Energy follows clarity / no wrong answers only true ones" opener became "You show up harder when you know why. One minute, only honest answers." Em-dashes removed, seal de-dashed, RU updated same commit. Verified boots clean, invariants pass, old copy gone, zero console errors. The fuller de-text of other lessons into LINE/REP/WHY triples still remains (see NEXT).
- **v918 — The Chalice (build order item 2, done).** A second ritual-as-rep. New `breathviz` beat in runLesson: a glowing orb expands on the inhale, holds, contracts on the longer exhale (vagal brake), phase cue above, auto-paced. This is the reusable breath visual. Registered as a tool (Steady the body), logs completion + doneMap.chalice (additive). RU same commit. Verified: boots clean, invariants pass, breath beat renders and paces, zero console errors. DEVICE-UNTESTED: felt pace, audio timing.
- **v917 — Candle Vigil wired into the journey (build order item 1, done).** A "Steady your attention" node in jpNodes (established users, jn>=1) opens the vigil via the runLesson ceremony overlay; the vigil now logs its completion and sets doneMap.vigil (additive) so the node reads done per day. RU same commit. Verified: boots clean, 26 invariants pass, node renders into the journey trail (4 HTML refs), zero console errors. DEVICE-UNTESTED: the node's in-journey look, and the vigil hold feel.
- **v916 — The Candle Vigil.** The first ritual-as-rep: a new `vigil` beat in `runLesson`, an interactive canvas candle held lit by steady press-and-hold, breath-paced, guttering on release with no punishment, the guardian's line at the peak, charging `S.sigils.candle`. Registered as a tool (Culadasa attention line, rung 1) in the one TOOLS registry. RU strings same commit. Verified: boots clean, 26 invariants pass, renders with zero console errors. DEVICE-UNTESTED: the hold feel, haptic, audio timing, hold-to-completion charge.

## TONIGHT'S BUILD ORDER (each = one green commit)
1. [DONE v917] Wire the Candle Vigil as attention-line rung 1, reachable in the journey.
2. [DONE v918] One more ritual-as-rep (The Chalice, guided breath + reusable breath visual).
3. De-text pass: compress 2-3 text-heavy lessons into LINE / REP / WHY triples.
4. Begin the night-sky journey map to replace the arrow trail, additive and flagged, without breaking `@SEC:JOURNEY-TRAIL` until the replacement is verified.
5. First-day front-door copy rewrite to the new voice, and relocate the pact and register question per the reconciliation.

## DISCIPLINE (binding every increment)
Real app.js by grep anchors. No emojis, no em-dashes, earned points only, tap not type, RU same commit, SCHEMA plus MIG if the shape changes (else additive-guarded), route tools through the one TOOLS REG, guided flows render in the cockpit stage, never touch the timeline day-nav regression model. preship must pass. Boot must be clean in preview. Commit only app.js, index.html, server.js. Keep the app always bootable. If an increment gets risky or unverifiable, it does not ship: it is written under NEXT as a proposal instead.

## DEVICE-UNTESTED (confirm on the phone)
- Candle Vigil: press-and-hold flame response, haptic, audio timing of the peak line, hold-to-completion charge, and the in-journey node look.
- The Chalice: the felt pace of the breath cycles, the audio timing, whether the exhale reads as clearly longer.

## NEXT (increments 3 to 5, ready to start)
The loop stopped here on budget. These are the remaining build-order items, each still one clean commit when we resume.

**3. De-text pass (partly done: v919 ws_why, v920 rewire lines). Remaining: the full Rewire redesign, do it together.** The quick line fixes shipped. The bigger piece per SPEC-FIRST-DAY-REDESIGN is the Rewire tool as a GUIDED AUDIO MANTRA, not a wall of intro text: cut the long what/how/why, frame it as mental rehearsal (scientific, placebo-as-superpower), the app speaks the exact line with natural pauses, optional tapping (explained), a breath visual (reuse the breathviz beat), go-back everywhere, earned via press-and-hold. Left for a waking session because it rewrites copy you have strong feelings about and the audio timing needs your ear.

**4. CORRECTED (David 2026-07-07): the journey trail STAYS, it looks good. No night-sky.** The redesign target is the LESSON that opens when you tap a stone (the runLesson ceremony: spinning-rays `gspin` background + plain orb + wall of text). Redesign it, lesson by lesson, into ritual-as-reps like the Candle Vigil, in the locked art identity. The trail itself is untouched. (The de-text passes and the vigil ARE this work.)

**5. First-day front-door rewrite.** Implement SPEC-FIRST-DAY-REDESIGN: the 4-beat experience-first front door (arrival, first breath win using the breathviz beat, name, one tappable energy read), then relocate the pact to the end of the first session and the register/tone question to an early journey node, per the reconciliation in SPEC-ADAPTATION-SPINE. Rewrite all first-run copy to the new voice (no dashes, no emojis, no vague or corny lines, line-at-a-time). RU same commit, SCHEMA plus MIG for the energy-read field.
