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

### A. Tracker Mode (the new front door)
A full-screen, dead-simple surface. Only two things visible: **NOW** (what you're tracking) and **NEXT** (the upcoming plan). No past, no completed clutter, no analytics.
- Big "what are you doing now" with a live timer.
- One clear **NEXT** card. One tap to start it.
- **Pause** the track · **Replan next** · **I'm off track → for how long?** (the forcing-function: pick a duration, the app holds the line and resumes tracking after).
- The rich timeline (plan+real, past+future) becomes the *secondary* "Plan/Reflect" surface for when the user has capacity. **Two-speed app:** Do (Tracker) vs Plan/Reflect (timeline).
- Likely the **default surface** for new/low-capacity users.

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
