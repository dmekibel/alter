# ALTER — Redesign Brief (canonical; every build candidate must honor this)

Single source of truth for David's stated requirements. The 3 design workflows (shell / RPG / adaptation)
and the build bake-off all answer to this. Updated as David adds direction.

## The vision
A pixel-art life sim that **feels like The Sims** — but it's a **mirror of the real you**. Do real things in
life → your character levels up and visibly builds its world. A guardian-angel harness that inhabits your day,
not a Heroic-style tracker. "If it helps me it helps anyone."

## The experience
- **Full-screen character** — the character/companion is the HERO of the screen, large and alive. (Not a small
  sprite in a room — David's explicit v0 complaint.)
- **It's your mirror** — as you level up in real life, your in-game self levels up in its life.
- **Time tracker built in** — plan your life, then track your day.
- **Super inviting, clever, multifaceted** — Instagram-grade invitation; warm, never intimidating. (v0 felt
  intimidating — fix that.)
- **Welcoming, clever onboarding** that adapts and learns the user, and meets them at any stage of development.

## Gamification / RPG (must be genius, not a shallow XP bar)
- **Keep score across all of life:** room/order, breathing, meditation, sport, nutrition, deep work… everything.
- **Earn points → spend them** on character appearance, their home/room, and unlockable items.
- **Cleverer + more complex RPG system that is genius and DYNAMIC** and adaptable to **different styles of people
  at different stages in their life**.
- **NO streak-shame, no vanity points, no punishment.** Misses are data. (David's own anti-pattern list.)

## Universal goals — adjusts to ANY goal (not just preset life-domains)
The app turns *any* goal a person has into a tracked, leveling quest. Not a fixed 6-domain tracker. Three goal shapes,
each gamified differently:
- **Recurring habit** — e.g. Duolingo daily, meditate, journal (show up repeatedly; flexible cadence; never-miss-twice).
- **Skill-mastery arc** — e.g. learn guitar, a language, a craft (a long climb with levels, milestones, deliberate practice).
- **Anti-habit / avoidance** — e.g. go outside without your phone, no scroll, no weed (win by NOT doing; commitment + replacement;
  ties directly to the Screen-Time / kryptonite layer). Gamify absence positively, never via shame.
- **User creates any goal now** (client-side intake maps it to a type → stat/skill/quest). **Claude later** auto-structures any
  stated goal ("I want to get better at X") into a quest with milestones. This is what makes ALTER help anyone, not just David.
- **Tasks decompose into clever SUBTASKS** — big/vague tasks (e.g. "clean room") expand into a menu of prewritten subtask
  options (bed, table, laundry, floor…); the user taps which apply, and those become ordered micro-steps. You never face a
  vague task — pick from options, get one small step at a time. Prewritten subtask library now; Claude generates subtasks for
  any task later. (Directly serves the "one small step" + anti-overwhelm principle.)

## Adaptation — the core principle: "NOT one solution beats all"
The app COMPOSES the right experience per context; it never imposes one universal design. Axes it adapts on:
- **Time of day** — open at 7am → a morning app (energize, plan, AM bookend). Open at 11pm → an evening app
  (reflect, wind down, log the day, set tomorrow). Same companion, different face by the clock.
- **Person style** — reads what kind of person you are and reshapes stats/quests/tone/rewards.
- **Life stage** — meets someone in chaos vs. consolidating vs. expanding differently; what counts as "a win" evolves.
- **Moment / need** — routes to the right mode (echoes David's earlier Guru / Heal / Do design).

## Intellectual spine — Brian Johnson / Areté (deploy as mechanics, never lectures)
ALTER is David's **better-than-Heroic** (Heroic is Johnson's own app), so Johnson's FULL nuanced system is the
spine — read from the raw book, not the summary. It must show up as MECHANICS and FELT EXPERIENCE, never preaching:
- **Areté Gap** ("close the gap between who you're capable of being and who you're being, moment to moment") = the
  app's core loop / the mirror.
- **Big 3 (Energy/Work/Love) + Dominate the Fundamentals** (eating/moving/sleeping/breathing/focusing/celebrating/
  prospering) = the stat system.
- **Masterpiece Day + AM/PM bookends + Sacred Vow + Equanimity Game** = the daily ritual / time-of-day adaptation.
- **4DX · WOOP · WIN · Bright Lines/Odysseus Contracts · Floors vs Ceilings · Motivational Calculator** = the quest
  + anti-stall engine (the part that defeats David's avoidance).
- **Virtues (Wisdom/Discipline/Love/Courage + Zest/Gratitude/Hope/Curiosity/Love) + Soul Force** = character
  attributes, progression, and the mirror. Surpass Heroic; never clone it.

## Guardian guidance — GUIDE, never judge (the emotional contract)
- The app **always guides, never judges.** Every interaction offers a chance to improve — even in the micro.
- **One small step at a time** — never overwhelm; always lead with the single next small step. This is the cure for
  v0 feeling "intimidating." Show the step, not the mountain.
- **Dopamine on IMPROVEMENT:** a satisfying hit when you get better, so you get addicted to ACHIEVING YOUR GOALS,
  not to the screen. Track everything; celebrate the delta; never the shame.
- **Proactive guardian:** reminds you of health admin (book the doctor, check-ups), nudges money check-ins,
  re-engages gently after you go quiet ("noticed you went quiet — what's alive?" — straight from the app-soul doc).
  Timed well, never nagging.
- **Active money management:** bank-balance + spending awareness so it actually helps you MANAGE money, not just log it.

## Aesthetic / UX non-negotiables
- **Grade-A pixel art** (David is a pro visual artist). **Nostalgia is his #1 ignition** — lean into it.
- Warm, body-first, smart-friend tone. Calm, alive, delightful micro-interactions. Never clinical, never guru-hype.

## Daily operating loop — plan → track → re-adapt (the anti-stall heart)
- **Plan** the day (a calm, non-overwhelming planning ritual = the AM bookend).
- **Track** it live as you move through it (current block awareness, gentle progress, no nagging).
- **Re-adapt cleverly when you go off-plan or something comes up** — graceful re-route, NEVER shame. Most planners
  punish the broken day and get abandoned; ALTER catches you and re-plans. Recovery speed is the skill (Johnson's
  Equanimity Game; never-miss-twice; if-then implementation intentions). This is how the app defeats David's drift.
- Client-side now (manual re-plan + smart suggestions); Claude-via-Shortcuts does intelligent rescheduling later.

## Two north-star OUTCOMES: Get Rich + Get Healthy (main functions)
Two of the app's MAIN functions are concrete outcomes: **get rich** and **get healthy**. Everything — goals, stats,
quests, day-loop, the mirror — ladders up to "richer + healthier" (well-aimed: money + health are David's two real
live pressures). Holistic still, but with these two outcomes as the gravity.

## Honest full-life tracking + data integration
- **Track EVERYTHING, including the "waste"** — PlayStation, café, money spent, drifting. Non-judgmental: the mirror
  is only powerful if it's TRUE (Withers: circumstances are data, not enemies). No shame for leisure/rest — just the
  real picture. (Don't count "just being alive" as a win, but never punish honest leisure.)
- **Encourage ANY data:** Oura ring, blood work, scale/weight, steps, spending/finances, and more. Phasing:
  Apple Health + iOS Shortcuts + manual entry now → HealthKit / Oura / financial (Plaid-style or manual) on the
  iPhone version → richer later. $0 + privacy-first: intimate biometric/financial data stays on-device or rides the
  Claude subscription, never a metered third-party server silently.

## Addiction / quitting system — Allen Carr + Atomic Habits + science (clever, nuanced, never shame)
ALTER helps quit ANY addiction — cigarettes, weed, porn, internet/doomscroll (David's own kryptonites), anything else.
- **Core method = Allen Carr's Easy Way:** NOT willpower/white-knuckling. REMOVE THE DESIRE by dismantling the illusion
  the substance gives you anything — so quitting feels like escape, not sacrifice. The "little monster / big monster" reframe.
- **Layered with Atomic Habits inversion** (make the bad habit invisible / unattractive / hard / unsatisfying), cue
  disruption, environment design, replacement behaviors.
- **Urge-surfing + relapse-as-DATA, never failure.** Clean time framed as growth, never deprivation or shame.
- **Wires into:** the anti-habit goal type, the iPhone Screen-Time blocker (internet/porn/scroll), the guardian voice,
  and the character mirror (the mirror-self gets visibly freer/healthier with clean time). Nuanced per-substance.

## Motion, animation, haptics & interaction (beauty + juice + meaning) — a dedicated pass AFTER structure converges
David is a visual artist; aesthetic + motion are non-negotiable and he is the final judge.
- **Beautiful, cool, clever animations** as first-class craft — motion design, not decoration. Every meaningful action
  earns juice (the engagement/color brain covers reward-bursts; this goes deeper on motion quality + interaction).
- **Clever interaction METAPHORS that embody the action** — e.g. Heroic's "shoot an arrow at your goal" with a haptic
  thunk: the gesture *means* aiming/committing and rewards the hand. Design satisfying gestures for log/commit/complete.
- **Haptic / vibrational feedback** as a core reward channel (limited Vibration API on web now; full Core Haptics on iPhone).
- **Fun + addicting + FUNCTIONAL** — delight that serves function, never eye-candy alone. Pulls toward life, not the screen.
- **Sequencing:** motion serves the structure → designed AFTER the design converges (animation follows function), as its
  own deep pass, where David weighs in hardest.

## Technical & phasing
- **Now:** single-page static web app (HTML/JS/localStorage), $0, offline, private, on GitHub Pages.
- **Later ($0 AI):** Claude-as-brain via iOS Shortcuts (photo of room/meal → judged → score lands in app). Website
  stays dumb; Claude is the eyes. No metered API while static.
- **iPhone app:** unlocks Screen Time blocking of YouTube/Instagram with a **clever earn-to-unblock** system
  (his named kryptonite — design non-punitive, privacy-careful), live camera, notifications.
- **Endgame:** vision "understanding of your life" — photos judge room mess / meals / smoking → feed stats.
  "A life tracker, not a health tracker." Fuzzy + intimate → designed slowly, never punitive.
- **Sequencing law:** each phase is earned by USE before the next unlocks (anti-stall defense vs system-then-stall).

## Decision method
Bake-off, not a single bet: build multiple complete candidates, adversarially review + screenshot-verify each,
deploy side-by-side for David to pick by feel — then pour polish into the winner. And per "not one solution beats
all," the system itself stays plural and adaptive.
