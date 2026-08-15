# SPEC — FIRST STONE + ONBOARDING BLUEPRINT (the build proposal)
*2026-07-08. The complete, David-locked design from the long copy+design session. Copy rule: every user-facing line goes through the two gates (`_dev/copy-audit.py` + the anchor-grounded judge reading `_specs/COPY-ANCHORS.md`). Register + principles: memory `alter-first-day-zero-context`. This spec IS the "building stage" David asked to propose.*

## THE SHAPE (locked)
**Onboarding = the blueprint read.** A real (but tapped, not typed) list: **age**, **occupation**, **experience checklist** (meditation / journaling / therapy / breathwork / none), **current challenges** (procrastination, overwhelm, focus, sleep, ...). Stored on `S.profile` (additive, no SCHEMA bump). This dictates day-one AND app-wide depth/dispatch (the fieldguide-Q&A model: blueprint → adapt). A never-meditated user gets meditation baby-stepped in round 2.

**First stone = the EXISTING carousel (`timelinePlayer`/`firstDayStack`), with a new opening + a stack of four revealed in two rounds.** It does NOT jump to an orb; it opens on TEXT.

### The carousel opening (new)
1. **Tab 0 = typing text, not an orb.** Where the orb sits, the guardian's words TYPE OUT (the hook). Press next. (New render mode for the player's first act: a typewriter text surface instead of the orb.)
2. **The offer:** "Do you have thirty seconds to try this?" (breathing, then muscle relax).
3. **Time-commit:** three chips, 30s / 1 min / 2 min ("how much will you commit?"), plus a **skip** (allowed, for the skeptic; skipping means missing the point, but it's honest to allow it).
4. **Press-and-hold to commit:** a circle appears, you HOLD it (the felt investment, Johnson's Initiate), and it **morphs into the player orb**. (Reuse the existing press-hold ring gesture from the lesson seal / vigil.)

### The guided stack (round 1: the easy two)
5. **Breathing FIRST** (easier for a beginner), then **muscle relax** as a GENTLE sweep (soften eyes, forehead, jaw, shoulders, chest, NOT tense-and-release, too much investment cold). Each is a colored tab in the carousel.
6. Per tool: a **short WHY before**, the guided doing (teaching woven into the cues where possible), and a **results line + reward after**. (Gamification order, points-then-explain or explain-then-points, pick one clean.)

### The escalation (round 2: complete the stack of four)
7. **Offer:** "Keep the momentum, add a one-minute meditation and a one-minute mantra to complete the set. Thirty seconds each minimum, or longer." → yes (or skip).
8. Do meditation + mantra (guided; meditation baby-stepped if the blueprint says never-done). **Mantra returns here** (not round 1) so its power is explained after the momentum, fixing the earlier "cheesy-before-earned" problem.
9. Explain the power of those two + reward. **Stone complete.**

### Adaptation (the blueprint dictates contents)
- **Beginner** (no experience ticked): more why before each move, the gentlest dose, tools revealed slowly.
- **Experienced:** less hand-holding, deeper dose offered sooner, the fuller stack sooner.
- **State read** (energy/how-arriving, if kept in onboarding or asked once) routes relief-door vs build-door.

### Close
No meta ("this is the app in miniature" was KILLED as too on-the-nose). Let the "aha" be felt; close on a real forward line.

## COPY STATUS
- **Converged + gated (EPIC anchors):** the hook ("Right now your body is holding tension you've completely tuned out... just feels like your personality... a tight body keeps your mind on edge too..."), the tri-audience breath payoff ("focus scatters, patience runs thin, small problems feel like big ones"), "the part of your brain that thinks straight comes back online", the muscle close ("that's the tension you never noticed"). See COPY-ANCHORS.
- **Still to draft (anchor-gate each):** the typed hook's exact lines, the offer, the two short whys (breath, relax), the results lines, the escalation offer, the meditation + mantra whys/results. NO meta close.

## THE BUILD, PHASED (one focused session each; do not cram)
- **Phase A — Onboarding blueprint** (OPUS, low regression risk): add age / occupation / experience / challenges as tapped survey beats in `onboardV2` BEATS; store to `S.profile`; wire the blueprint so the stone can read it. Copy = simple questions, still gated.
- **Phase B — Carousel opening** (FABLE worth it: regression-zone gesture/carousel): Tab-0 typewriter text mode, the offer, the 30/60/120 + skip chooser, the press-hold-to-commit morphing into the orb. This is the 3x-rebuilt carousel, spec-first, boot-verify, DEVICE-UNTESTED honesty.
- **Phase C — Round 1 guided** (OPUS-ok with care): breath-first, gentle relax sweep, short why + results per tool, reward, adaptation to blueprint.
- **Phase D — Round 2 escalation** (OPUS-ok): offer → meditation (baby-stepped if new) + mantra → explain power → complete.

**Model-routing call (my duty):** Phase B is the regression-zone/gesture work Fable is for; Phases A/C/D are Opus-fine. Build one phase per fresh, focused session primed by this spec, never all four in a huge context.
