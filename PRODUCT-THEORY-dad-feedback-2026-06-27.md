# ALTER — Product Theory: Dad's Feedback (2026-06-27)

Source: David's dad. Logged + analyzed by Alfred at David's request. This is **theory/positioning**, not a build doc — it reframes what ALTER *is* and who it's *for*, which should govern the build order in the TRACKER-HANDOFF docs.

---

## PART 1 — The raw feedback (faithful capture)

1. **The Herbalife insight (the core analogy).** Herbalife distributors fail not because they can't do the work — they can. They fail because they have **no system tracking which client is in which state and telling them, daily, exactly who to call.** They can't *remember* it all. → The winning system removes the remembering. **ALTER's superpower should be: tell the person exactly what to do, right now. Simplify to that.**

2. **The past/completed clutter hurts the core job.** Seeing all the completed/past stuff overcomplicates the app's main function, which is **tracking**. → Build a new **Tracker Mode**: a full-screen, stripped view that shows only **what you're doing now + what's planned next.** Nothing else. Simple. Same core powers: pause the track, replan the next activity, always stay tracked. **If you go off track, the app forces you to decide how long you'll be off track** — so you never stop tracking.

3. **The real user is the unorganized / ADHD person — not the productive one.** Tailor to people who struggle, who are unproductive, and **who give up often.** People start an app and quit. The app must have **systems that prevent quitting** (gamification is one).

4. **You can't flip and do everything right at once.** People need to do **one thing** right first (e.g., make the bed 10 days straight) before earning the next thing. For the deeply incapacitated, **planning a whole day is itself overwhelming = a reason they quit.** So the app should push them to start small — **plan one thing, not the day.** Like a Duolingo journey: early on it nudges you to plan just a couple of things.

5. **The app must hold your hand and baby-step you, calibrated to where you are in life.** It has to *analyze your level* and meet you there, then walk you up the self-improvement journey one supported step at a time.

---

## PART 2 — Analysis: what this actually means

**The one-line reframe:** Dad just handed ALTER its **positioning, its primary job, and its retention engine** — the three things it was missing.

- **Positioning / ICP.** Not productivity people (that market is owned by Notion/Todoist/Sunsama and they don't need hand-holding). The user is **the person who struggles to function — ADHD, unorganized, low-follow-through, quits things.** They don't need more power; they need less to think about and someone in their corner. *This is exactly Finch's market* ($30M ARR, bootstrapped, gentle + gamified + low-pressure) — so the positioning also validates the money path we mapped.

- **Primary job = subtraction, not addition.** The value is **removing the cognitive load of knowing what to do next.** Test every feature against one question: *does this reduce what the user has to decide or remember?* If not, it doesn't belong on the main surface. Tracker Mode is this principle made literal.

- **The unifying metaphor: ALTER is a CRM for your life.** A sales CRM tracks each lead's *state* and tells the rep "follow up with these 3 today." ALTER tracks each habit/goal's *state* and tells you "do this now." That's a sharper definition than "guardian-angel life-sim" — it's a *state-tracker that issues the next action.* The guardian-angel is the *voice*; the CRM is the *engine*.

- **Retention = progressive disclosure tied to consistency.** Quitting happens at the moment of overwhelm. So the app's complexity must **stay just above the user's demonstrated level and unlock as they prove consistency** — the Duolingo model. Day 1 = one habit. Sustain it → unlock planning two things → unlock a day template → unlock the full timeline. The surface grows *with* the user. This is the anti-quit engine, and it's deeper than "better onboarding."

- **The off-track forcing-function is anti-shame, not control.** "Decide how long you'll be off track" reframes falling off as a *bounded, planned* event instead of a failure — which keeps the tracking loop alive and protects the streak psychology. It fits ALTER's existing "never say *you failed*" principle.

**What converges with the existing vision (AUDIT.md):** "the ONE move," proactivity, gamification, graceful recovery — dad *validates and sharpens* all of these. **What's genuinely new:** (a) the ADHD/quitter ICP, (b) Tracker Mode as a radical-simplification surface, (c) the level-calibrated baby-step progression as the core retention architecture.

---

## PART 3 — The plans (concrete moves)

### A. Tracker Mode (the new front door) — David's refined direction 2026-06-27

**It's not a separate feature — it's the DAY view's tracker, expanded.** The tracker lives in the day planner (the home screen), NOT in week or month. Tracker Mode = that same tracker, blown up full-screen. Day / Tracker are two sides of one coin: zoom *out* = day/week/month planning; zoom all the way *in* = Tracker Mode.

- **Entry:** build on the existing bottom dock (`#liveDock`, the pull-up). Today it drags up from the bottom. Make **tapping it expand into the full-screen tracker** ("a full menu"). Keep the drag-up too. (Existing pieces to reuse: `openPull`/`closePull`/`pullGrab`/`pullSheet`, `renderLiveTracker`.)
- **Exit:** a clear **button back to Day mode** (and/or slide it back down — same bottom mechanism).
- **The view = extreme zoom on the live now-line.** So zoomed in that the now-line visibly *moves* and you see **seconds** ticking (the readout is already `m:ss` via `elapsedStr` — just surface it big). Auto-scale to roughly "current activity + the next block."
- **Only NOW + NEXT.** No past, no completed clutter, no analytics. Big, minimalist, extremely functional — surface only the one current thing and the one next thing (the app's decision matrix: show the next action + current state, nothing else).
- **Core controls (carried from the dock):** pause the track · replan the next activity · **off track → "for how long?"** forcing-function (pick a duration, app holds the line, resumes tracking after) → you always stay tracked.
- The rich timeline (plan+real, past+future) is the *zoomed-out* Plan/Reflect surface for when the user has capacity. **Two-speed app:** Do (Tracker, zoomed in) ↔ Plan/Reflect (timeline, zoomed out).
- Likely the **default surface** for new / low-capacity users.

### B. The baby-step progression engine (the retention core)
- **Onboarding doesn't plan a day.** It asks for **one thing.** ("Pick the one habit that, if you did it daily, would change the most.")
- **Stage model** for the user: e.g. *Incapacitated → Building → Stabilizing → Optimizing.* Each stage sets how much surface/complexity is unlocked and the tone.
- **Graduated unlocks:** one habit held N days → unlock a second → unlock light day-planning → unlock the full timeline / goals / garden depth. Never show the whole machine to someone on day 1.
- **Duolingo-style journey UI:** a visible path of small, achievable next steps so progress is felt.

### C. Anti-quit systems
- Gamification (the glow→coins→garden loop) as the emotional glue — *especially* tuned so a missed day never reads as failure (the boss-not-you framing from AUDIT).
- Streak protection / "off-track is planned, not failure."
- Proactive nudges that are gentle and ONE-thing ("just the one move today").
- Come-back-from-absence flow ("you went quiet — here's the single smallest rep").

### D. "Tell me exactly what to do" (the directive engine)
- The home always answers **one question**: *what's the single best thing to do right now?* — computed from time + energy + what's planned + what's been missed.
- This is the Herbalife "who do I call today" for your own life. It's the feature that makes the app feel like it's *running your life for you.*

### E. Positioning everywhere
- Copy, onboarding, tone all speak to "you struggle to keep it together, I've got you" — not "optimize your output."

---

## PART 4 — How this changes priorities + open decisions

**Reorders the build ladder.** Before this, "next" was the glow→coins→garden loop. Dad's feedback says the bigger unlocks are **Tracker Mode** (the simplification that makes the core job land) and the **baby-step onboarding/progression** (the thing that stops people quitting on day 1). Gamification stays critical but as *retention glue under* a simpler core, not the first thing.

**Open decisions for David:**
1. Is **Tracker Mode the default front door** (full timeline demoted to "advanced"), or a mode you toggle into?
2. How does the app **detect the user's stage/level** — explicit onboarding questions, or inferred from behavior, or both?
3. Does the **complexity literally lock** (features hidden until earned), or just *guided* (everything available, but the app only ever points at the next small step)? Locking is more Duolingo; guiding is gentler.
4. MVP scope: is the **first shippable ALTER essentially just Tracker Mode + one-habit onboarding + a simple streak/garden** — i.e., strip toward this before adding more?

---

*Status: logged for processing. Next step is David's calls on the 4 open decisions, then this folds into the TRACKER-HANDOFF build order.*

---

## PART 5 — The Developmental Engine (research-grounded, 2026-06-27)

Researched from David's Field Guide KB (cited SNs) + Brian Johnson (Heroic), James Clear (Atomic Habits), Ken Wilber, and the Transtheoretical "Stages of Change" model. This is the philosophy that makes "meet you at your level and baby-step you" *clever* instead of arbitrary.

### The spine insight (everything hangs off this)
**The app must detect the user's level — the user can't.** The KB's "Doom Loop" (H-006, Sapolsky SN-164/169): when you're dysregulated, cortisol takes the prefrontal cortex offline — *the exact brain region that would notice you're stuck is the first thing the stuck-state disables.* So self-report onboarding for a struggling user is "asking the broken instrument to measure itself." → **Detect from body + behavior, not from a questionnaire.** This is the scientific justification for Dad's room-messiness idea: the app *watches signals* and infers the stage.

And the framing that removes shame (Withers, Golden Rule 1): **"You're not broken — you're misaligned / biologically hijacked."** A low level is a state to regulate, not a failure. This is the emotional core of a non-shaming baby-steps app.

### Three converging staging lenses (use all three)
1. **WHAT to work on — the 8-Layer Self-Help Stack (David's KB spine).** L1 Biology → L2 State → L3 Awareness → L4 Emotion → L5 Identity → L6 Perception → L7 Environment → L8 Meta. **Rule: you cannot work a higher layer if a lower one is broken** (Johnson: "if you can't get out of bed, nothing else matters"). → The app always works the *lowest broken layer first.* This is "build on the fundamentals" made literal.
2. **HOW READY they are — Transtheoretical Stages of Change** (Prochaska — the established science of detecting readiness): Precontemplation → Contemplation → Preparation → Action → Maintenance. The *same goal* needs a *different nudge* per stage. → Tailor the directive to readiness, not just the task.
3. **WHERE their mood is — Withers' Emotional Scale** (a ready-made ladder): Despair → Anger → Frustration → Hope → Optimism → Joy. "Can't jump from very low to very high — climb one rung." Anger is an *improvement* on despair (more energy). → Meet the mood, move it one rung.

**Ken Wilber ties it together:** *States vs Stages* (SN-126) — peak states (a good day, a motivation hit) don't stick; only repeated practice converts states into permanent **stages**. And *transcend-and-include* — each stage is built on the one below, never skipped. This is the deep grounding for fundamentals-first: you don't leap to the top, you include the floor.

### Level detection = two systems (Dad's ask, made concrete)
**A. Clever onboarding (seed the stage, minimal friction).** Not a quiz. 2-3 low-effort signals: a readiness read (Stages-of-Change), an energy/floor check, and "what's the one thing." For the lowest-capacity user (KB "Numb Drifter") → *zero onboarding, no account, "just try this one thing."*
**B. Ongoing monitoring (the live detector).** The app watches **fundamentals** and infers stage from behavior: room messiness (Dad's example), sleep, did-you-track-today, streak breaks, energy checks, follow-through rate. **If a fundamental is broken ~a week straight → that becomes the foundation the app works on.** This is the Stack's "lowest broken layer first," automated.

### Fundamentals-first build order (anti-overwhelm)
- Start at **L1 / one keystone** (energy, sleep, nasal breathing — the KB's cheapest highest-leverage), never a full-day plan (overwhelm = the #1 quit trigger).
- **Floors, not ceilings** (Johnson/Guise): ask for the non-negotiable minimum, not the ideal.
- **Two-minute rule** (Clear): make starting impossible to refuse. **"Spray paint vs gardening"** (SN-008): fix roots, not symptoms.

### Anti-quit architecture — and why the GAME ships in v1
The KB's account of quitting: *arambhashura* (hero-in-the-beginning, SN-009), the *plateau / valley of disappointment* (SN-094), the *Dabbler* (SN-238), and dopamine depletion making natural rewards go gray. What sustains: **systems > goals** (SN-092), **environment design > willpower** (SN-171/SN-198), **recovery-speed not perfection** ("never miss twice," SN-243), **proceduralization to automaticity** (SN-180), and crucially —
- **Feeling-based reward installs habits; wanting-based striving only creates craving (SN-157).** Dry goal-chasing and affirmations fail; a *felt* reward wires the loop. → **This is the scientific reason the GAME must ship in v1, not later: the game is the felt-reward engine — it's the retention mechanism, not decoration.** Dad's instinct (gamification = anti-quit) and David's "ship with the game built in" are both correct and KB-backed.
- Non-shame everywhere ("misaligned, not broken"); a missed day is never "you failed" (the boss, not you).

### The one design axiom
**Detect the level from body + behavior (the user can't self-see — Doom Loop). Assume misalignment, not brokenness. Regulate biology before psychology. Work the lowest broken layer first. Walk them up one rung at a time — measuring recovery speed, not perfection. And make the reward *felt* (the game), because felt reward is what wires a habit.**

### Sources
KB: SN-004 (Areté Gap), SN-008 (spray-paint/gardening), SN-009 (arambhashura), SN-092 (systems>goals), SN-094 (plateau), SN-126 (states vs stages / Wilber), SN-157 (feeling vs wanting reward), SN-164/169 (cortisol/PFC), SN-171/198 (environment>willpower), SN-177 (small actions), SN-180 (willingness muscle/proceduralization), SN-238 (Leonard's four types), SN-243 (never miss twice); thinker-profiles/brian-johnson.md, brian-withers.md; the 5-cluster blueprint-catalog.md; mechanism-library/dopamine.md, neuroplasticity.md. Web: [Areté / Heroic (Sloww)](https://www.sloww.co/arete-brian-johnson/), [Atomic Habits summary](https://jamesclear.com/atomic-habits-summary), [Transtheoretical Model](https://www.thebehavioralscientist.com/glossary/transtheoretical-model).
