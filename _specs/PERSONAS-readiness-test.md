# ALTER four-persona readiness test

The bar (David's framing): the app must not be *hardcoded* for any one person. If someone onboards **honestly**, ALTER should understand them and support their goals — adapting to very different people. These four are the benchmark: "if it can perfectly help each one, it can probably help the whole world." Each persona's CHALLENGE is the crux — none is a pure scheduling problem; each is avoidance / overwhelm / fear / a blocked goal.

---

## 1. David (primary test user) — EN
Profile being mined from claudeCode (magic/ natal+identity, fieldguide/, alter soul docs, memory).
Self-reported:
- **Situation:** sits all day coding the ALTER app (money goal). Room is a mess — refuses to clean since girlfriend left; cleans in cycles (every ~2 weeks to a month, then it piles up again). Smokes pot daily. Not going to gym though he wants to.
- **Goals (sprawling, parallel):**
  - Artist: finish portfolio, finish portfolio website, sell prints online, do Tel Aviv market sales, learn to paint, start painting real pictures, buy paint supplies, email art people.
  - Money: build ALTER app.
  - YouTube: produce videos, write scripts (maybe multiple channels — undecided).
  - Design business: LinkedIn outreach + posts, cloud coding, write proposals.
  - Writing a TV show.
  - Get buff. Get smart. More social media.
- **Rhythm:** beach, friends, drives to see grandma, parents for Shabbat, sometimes traveling — app must accommodate off-days / travel.
- **CHALLENGE:** too many parallel ambitions + avoidance (room, gym, pot). The app must hold a large portfolio of goals without overwhelming, and adapt to a chaotic/irregular life.

## 2. Mom — 66 — RUSSIAN (also the Russian end-to-end test)
- **Activities:** go for a walk, cook food, clean the house, listen to a podcast, watch a TV show, scroll on the phone.
- **Goals:** maybe write a book; start doing sports; learn English (maybe via Duolingo); scroll Instagram less; read more books; do more for herself / achieve more; **lose weight**.
- **CHALLENGE:** the sports goal is **fear-gated by a past bad experience** — a trainer was once mean to her, so now she won't do it without a trainer / is afraid. The app must handle a goal blocked by an emotional pain-point, and offer a gentle, non-intimidating, trainer-free on-ramp. Must work fully in Russian.

## 3. Sister — works at Hilton hotel, two kids, husband — EN
- **Situation:** home is a *complete* chaotic mess (husband + two kids add to it). Says she has **no energy**. Sits on her phone a lot.
- **Goals:** lose weight; above all, get the house clean.
- **Her own idea:** an AI app that tells her exactly where to put everything from photos (David: too extreme — but the *spirit* is right).
- **CHALLENGE:** cleaning is **too giant/daunting → overwhelm paralysis**. The fix David wants: the app figures out the **smallest possible first step** ("what is step one? the kitchen, then the floor, then a bit of clothes") and **lovingly guides her through it** one micro-step at a time. Pull from the KB + web — micro-habits / Tiny Habits (BJ Fogg) / Atomic Habits — and make the **journey system naturally do this** for her.

## 4. Brother (younger) — EN
- **Goals:** become a famous musician AND famous filmmaker. Make more music, finalize music, post music, maybe record deals, social media. Make a YouTube channel to promote his brand. Make movies, work on scripts. Big "get rich" ambitions.
- **CHALLENGE:** smoking too much pot; playing too much video games; **ADHD**; low self-esteem + childhood/school trauma → doesn't believe in himself; goes through avoidance periods. Concrete example: **scared to even look at old university film footage he needs to edit.** The app must handle avoidance-driven-by-fear + ADHD: shrink the threatening task below the fear threshold, scaffold confidence through tiny wins, gently pull a distractible mind back.

---

## The common thread (the actual readiness bar)
Mom, Sister, and Brother all share: **a real goal blocked by avoidance / overwhelm / fear / a past wound.** ALTER's job for them is NOT planning — it's **lowering the activation threshold of the first tiny step and emotionally scaffolding it.** That is what the journey/guardian system must do. David is the fourth axis: holding a *sprawling* portfolio without overwhelm + adapting to an irregular life.

## NEW requirement — Welcome-Back Re-Assessment (David 2026-06-29)
David: "Sometimes I'm doing everything correctly, then I drift off path for like a month. It wouldn't make sense for it to be the same journey if I've drifted for a month. The app needs to reassess me over time — recognize if I haven't used it for a week/two/more, and gauge where I'm at."
- DETECT a lapse: track last-active day (S.log/blocks/timers); on load compute gap. Threshold ~10–14 days.
- On return, DON'T resume the stale journey. Trigger a gentle, anti-shame re-gauge: "It's been [3 weeks]. No guilt — seasons happen. Let's see where you are now." A LIGHT 3-tap check (energy now? · which goals still matter — toggle active · restart gentle?) → recalibrate S.guide.unlocked (ease down a notch, don't demote-as-punishment per journeyNode monotonic-floor 351), reseed journey from CURRENT active goals, lower the plate (one block, not six). Reuse the recovery-weighted streak + bouncedBack (349) framing.
- Anti-shame copy lint applies hard: never "you missed/failed/abandoned." Frame as a natural season + "that you came back is the whole skill."
- Serves EVERYONE who lapses (extremely common), not just David. Slot as a new build wave.

## NEW requirement — Trackable goal metrics (David 2026-06-29)
"All goals should be trackable — like weight, or your bank account." A goal can carry an optional METRIC: a number moving toward a target (weight 90→75kg ↓, savings →target ↑, followers ↑, books read ↑). Auto-detect the metric from the goal title (weight→kg↓, money/save/bank→$↑, audience/followers→↑, read→books↑) and pre-fill; editable + manually addable on any goal. Goal detail shows a progress bar (start→current→target, direction-aware) + "log today's number" tap + small history. A goal keeps BOTH metric (the number) and subtasks (the actions). David chose auto-detect + manual. Build = feature #1 in queue.

## Open question the onboarding must answer
Current onboarding (app.js `onboard()`, 11 steps) captures: vibe, gender/age, life-stage, activities, goals, identity/virtue/one-thing, habits, starting level, wake/sleep/peak. It does **NOT** currently capture the **blocker/fear behind a goal**, nor an explicit **energy/overwhelm** read — which is exactly what these three personas hinge on. Likely the #1 gap to close for "can it support a person like this."
