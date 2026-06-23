# Design Brief — the app (working name TBD) · David's vision, consolidated 2026-06-23

The single source of truth for the UX redesign. Captured verbatim-faithful from David across the 2026-06-23 session. The redesign (and the final synthesis) must honor ALL of this.

> Naming: the product name is **TBD** (David, 2026-06-23 — "we will come up with the best name later"). "PowerUp" appears throughout this doc only as a PLACEHOLDER from an earlier message — replace it when the real name is chosen. The app is currently titled "ALTER" in code.

## 1. Core purpose
Help people stuck in a **downward spiral of procrastination and stagnation activate their heroic potential** — in the lineage of **Jim Rohn** and **Brian Johnson** (Heroic / Areté). Identity-first: become the hero of your own life; close the gap between who you are and who you could be.

## 2. The core daily loop (the app's SPINE)
Design from first principles around how an average user spends a day. Primary navigation + HUD serve THIS above all:
1. **PLAN** the day.
2. **DO** it (start executing).
3. **PROCRASTINATE / steer off** — this WILL happen. Meet the user here **without shame**; make re-entry easy.
4. **ADAPT** the plan on the fly when they drift.
…all of it **WHILE TIME-TRACKING continuously** ("what are you doing now"), all convenient and easy.

## 3. Function hierarchy — core vs secondary
- **CORE / foundational:** the Plan → Do → Adapt → Track loop. Gets the most direct, fewest-tap access and lives in the HUD.
- **SECONDARY / extra:** the garden game world, skateboard, cosmetics, the deeper self-help modules. Reachable, but never in the way.

## 4. Menus, HUD, never-lost
- **ONE consistent menu chrome everywhere.** The single biggest current failure is that *every menu looks different*, so the app feels like a pile of unrelated screens. One panel skin, one title placement, one back/close affordance, one tile/list grammar — used by EVERY surface.
- **Add a game HUD** — persistent, one-thumb, fits candy / dark-hot-pink / zero-white. Orients the user in the daily loop at all times.
- **Never lost:** everything reachable in ≤2–3 taps; always a clear way home.

## 5. The radial menu — demoted
- Currently MISUSED as a top-level **router** to dissimilar destinations → feels "randomly assembled."
- Correct role: a **contextual tool-wheel for picking among PEER items** — like tool-select in a 3D app (Blender/ZBrush). Use it for choosing a **habit/action** from a set of equivalents, NOT for navigation.
- **Navigation** between different surfaces uses a different, legible pattern (consistent tab bar / in-world launcher).

## 6. Gamification — the addiction engine (Guitar Hero model)
- The app should make you **addicted to doing what you planned.**
- **Guitar Hero–style "golden" combo/flow feedback** fires when you are **on your plan** — even if the planned activity is **rest / deep rest**. The reward is for **plan-adherence**, not raw productivity.
- Doing the planned thing = hitting the notes = golden streak. Drifting = breaking the combo (gently, no shame).

## 7. Time-tracking — must be frictionless and CORE
- Woven through the whole loop, always available. (Phantom-bubble bug fixed 2026-06-23 / v371.)
- **Procrastination is trackable too.** It's hard because "you're kind of doing nothing all day" — so give a **one-tap way to log procrastination / off-plan / drift** honestly, without friction or shame.
- **Retroactive backfill:** easy to tell the app what you were doing in the past if you forgot — **click and stretch a bubble** on the timeline to designate the activity for that gap. (The calendar already supports draggable/stretchable blocks — build on that.)

## 8. Onboarding — capture the blueprint
A clever, **tap-first** onboarding that captures as much about the user as possible early — their **"blueprint"** (who they are, goals, patterns, the state of their life/room) — so the app **adapts to them from day one**. The blueprint personalizes the daily loop.

**Full onboarding design (designed 2026-06-23):** tap-first, fun/fast, guardian-angel tone, "genius without the brain" (deterministic selection; the brain enriches later). Flow:
1. **Meet your guardian** — the fairy (e.g. "Sage") introduces itself; identity-first tone, not a settings form.
2. **Your vibe now** — Thriving / Coasting / Stuck / Overwhelmed → tone + first-week intensity.
2b. **Gender + age range (David 2026-06-23)** — quick taps at the start; used to intelligently **SUGGEST the life stage** (smarter than a blind guess; user can change it).
3. **Life stage / role ⭐** — Student / Parent / Founder / 9-to-5 / Freelancer / Creative / Caregiver / Figuring-it-out, **pre-suggested from gender+age**. THE clever pivot: it **pre-loads** the activities, goals, and rhythm typical of that role.
4. **Stock the bento (screen 3) = PREFILL & PRUNE** — from the life-stage, show a rich set of relevant activities **organized BY DOMAIN (nuanced/complex, not a flat list)**, the big rocks mostly pre-selected; **untap what's not you** + add missing. Pruning >> adding from scratch. **Small/micro activities ("get coffee", "snack", "water", "text back", "tidy 5m") are tucked at the END as "✦ little extras"** so the big rocks lead and micro-habits don't clutter (David 2026-06-23). Complement: **bundles** ("+ Gym life", "+ Morning routine" add clusters). Alt mechanics considered: swipe-wall, tag-cloud. **Recommended: prefill-and-prune + bundles.**
5. **Goals** — tap from common goals (seeded by life-stage) + add; pick a FEW (Newport "fewer is better"). Seeds goal-trees §16.
6. **Rhythm** — morning lark / night owl + wake/sleep + fixed commitments → planner time-awareness.
7. **Your world is born** — garden seeded with your life → "Plan your first day."

**Extra high-value data (clever layer):** life-stage ⭐ · **kryptonite** (what derails you → the guardian guards against it) · **hard constraints** (work hours / kids / commute → realistic plans) · **more-of / less-of** (tunes suggestions + balance) · **who you want to become** (one identity line → guardian north star + mantra seed) · **gamification intensity** (Vanilla / Light / Game dial up front).
**Payoff = a personalized RUNNING START on day one** (a proposed starter plan + the right self-help modules + the right intensity), not a blank app. All editable later.

**Palette (David 2026-06-23):** the candy domain colors were refined softer / more harmonious (creamier, luminous) on a deeper berry-plum dark; still zero-white, bold dark outlines. Refined domain set ≈ Move #ff9a52 · Nourish #46d6a0 · Focus #4ab6f0 · Create #b88cff · Connect #ff77ad · Play #ffd24a · Restore #4ac8c8 · Upkeep #8f9fd0 (TBD final, applies app-wide if approved).

## 9. Design method
**Assemble from the best decisions of as many real apps/games as possible; cite each source; never invent from scratch.** (North stars surfaced so far: Finch · Animal Crossing NookPhone · Duolingo · Breath of the Wild radial · Apple Fitness rings · Headspace · Fabulous · Sky.)

## 10. Hard constraints (locked)
- $0 static vanilla-JS/canvas + localStorage; no backend.
- Mobile-first, one-thumb iPhone. **TAP not type** (typing overwhelms David — avoid text entry).
- Aesthetic LOCKED: candy/Powerpuff palette on a **dark hot-pink night** bg, **ZERO white ever**, bold dark outlines, sticker shadows; menus feel like a notebook in the character's hand.
- It's a **life-sim game** (guardian fairy in "the garden of your mind"); real self-care/productivity drives the game.
- **"Less machine, not more"** — simpler beats more features. Clever AND legible.

## 11. The "what now?" entry screen + Productive/Reactive tracking + heroic rewards (added 2026-06-23)
The everyday open-the-app moment ("time to track myself" — even with no plan):
- **Two-sided entry screen:**
  - **One side — heroic/good options** the app proactively offers: drink water, small breakfast, shower, go outside, meditate, clean room. Pick one → you're doing a good thing → **game reward**.
  - **Other side — one big "just vibe / react" button:** "No, I'm just gonna vibe for now." For when you won't do the planned/good stuff. Tapping it **still starts tracking** — honestly logging drift.
- **TOP-LEVEL activity dichotomy = PRODUCTIVE vs REACTIVE** (this fronts/supersedes the old Energy/Work/Love/Hobbies/Vices top split):
  - **Productive** = planned/intentional good actions (shower, clean room, meditation, deep work…).
  - **Reactive** = unplanned drift you fell into because you didn't plan and aren't doing the productive stuff (e.g. "Claude code" when it's procrastination). Selected *reactively*. **This is how procrastination gets tracked — it's just the reactive branch.**
  - **Indoor/Outdoor is a SECONDARY dichotomy** — reached AFTER productive/reactive (mornings are obviously indoor first, so indoor/outdoor must not be the first fork).
- **Gray-zone nuance** (Claude code = productive AND procrastination): some activities are both — you can procrastinate what you need by doing something otherwise-productive. Represent it, but DON'T overcomplicate the UI.
- **Gamification Layer 2 — heroic-action rewards:** beyond the Guitar-Hero plan-adherence combo (Layer 1, §6), you also earn **in-game rewards for doing heroic/good actions** themselves. The daily nudge = "what do you wanna do?" → offers the good options → reward when you do them.
- **Encourage planning, never block tracking:** the app pushes you to make a game plan and go — but if you didn't, reactive self-timing is always one tap away.

## 12. The open-app fork + adaptive planning + end-of-day adaptation (added 2026-06-23)
- **Open the app → INSTANT FORK: "Plan ahead?" or "Just start tracking?"**
  - **Just start tracking = UNPLANNED / REACTIVE mode.** Always available. You can still do productive tasks in it (brush teeth, etc.), but because it's unplanned you earn **base points only — NOT the plan-adherence bonus.** This is the incentive gradient that ties Layer-1 gamification to planning: planned execution = bonus combo; unplanned = base.
  - **Plan ahead** → enter the planning flow.
- **The app ALWAYS offers to plan** — pause reactive mode anytime and start planning. A plan step can be anything (a journaling session, shower, deep work…).
- **Adaptive, order-aware planning assistant:** as you add items, the app suggests the **next logical step in a good routine order** (add "shower" → it offers "eat, meditate, clean room"…). If you pick a different option, it **adapts** and keeps offering sensible next steps. This is mind()/suggest made **sequential + smart** — a guided routine that flexes, never a blank page (the current `suggestDay` hardcoded generic office day is the anti-pattern to replace).
- **Time- & priority-aware re-planning (the ADAPT phase):** midday or evening you re-plan the remaining hours against an imperfect day (e.g. friends happened, unplanned). "What now?" → the app must know:
  - how much **time is left**,
  - your **non-negotiables / priorities / "Big 3"** (the must-dos that float to the top when time runs short — Brian Johnson's Big 3),
  - what you **like to do** / default to even when short on time,
  …and help you spend the remaining time well, re-routing around the time you actually have.
- **Planned > unplanned** in rewards — the gradient pulls toward planning without ever blocking reactive tracking.

## 13. Navigation & home layout — LOCKED with David 2026-06-23
Home = the world, full-screen, never unmounts. Three taps, three jobs:
- **TOP — the live tracker** (always on): shows **"What are you doing now?"** when idle, or **"▶ activity · elapsed"** when tracking. The small HUD tokens — **streak pips, spark bar, mood orb** — sit up here too.
  - **PULL DOWN from the top (iOS notification/Control-Center pull) expands the live tracker into a panel** — a lighter, simplified version of the notebook — that is the **two-lane PLAN-vs-ACTUAL bubble view in compact form** (the same two-lane bubble system as the full day-calendar, §14):
    - **LEFT = the plan you already established** — bubbles down a time axis at their real times, **each activity a different color** so the day's shape reads at a glance.
    - **RIGHT = the live ACTUAL time-tracker** — what you're doing right now; you can **stop it and start a new activity** from here (this "start new" is where the Productive/Reactive activity picker opens).
    - The world dims behind it; flick up / tap the handle to dismiss. One gesture surfaces plan, reality, and the tracker together. The FULL version of this is the day-calendar in the notebook (§14) — the single most important screen.
  - **Pull-down split CONFIRMED with David 2026-06-23** ("Beautiful yes"): left = plan bubbles (multicolored, real times), right = live actual tracker (stop + start-new), now-line between.

## 14. The day-calendar = the JOURNAL (IN DESIGN — core locked 2026-06-23)
The single most important screen — the expanded version of the §13 pull-down, and the literal journal (tracking = journaling). Build on the earlier two-lane bubble prototype (left = PLAN, right = ACTUAL + live timers, drag to move, edge-grips to stretch, now-line), don't replace it.
**Core layout (locked):** two lanes against a vertical time axis — **LEFT = Plan** (multicolored time-stamped bubbles, what you meant to do), **RIGHT = Real** (what you actually did; the current one live with ▶). Header: date + **Day/Week/Month zoom** + a **plan-adherence score chip** ("✨ N on plan"). The now-line marks current time.
- **Layout (David 2026-06-23):** time axis on the **LEFT**; the Plan and Real lanes sit **CLOSE together** and **align per time slot** so you read plan-vs-real at a glance. Subtle **grip** on bubbles signals draggable.
- **Plan vs Real visual treatment:** PLAN bubbles = holographic/ephemeral — a subtle **multi-hue SHEEN on the fill** + slight translucency + NO sticker-shadow (aspirational, not-yet-real). REAL bubbles = flat opaque + sticker shadow (grounded — it happened). **BOTH keep the SAME bold DARK outline (#160510) — NEVER a white/light outline** (that looked cheap; violates the zero-white rule — David 2026-06-23).

## 22. Typography (GLOBAL, David 2026-06-23)
**Wes-Anderson / FUTURA vibe.** Text should be **BOLD, THICK, LARGE, and very readable**, with a **less-formal, geometric storybook-poster character** (Wes Anderson's signature typeface is Futura). Use a Futura-like geometric face — **Jost** or **Poppins**, weights **600–700** — heavier and bigger than the current Baloo 2 / Fredoka. Applies **app-wide**, not just the calendar. (Reconciles with the candy aesthetic: geometric-bold reads more confident/characterful than the rounded soft font.)

## 23. The REFLOWING plan — "you're never off-plan" (David 2026-06-23, core logic)
The plan is NOT a fixed schedule — it's a **living QUEUE that continuously reflows around what you actually do.** You can never move "outside" the plan; whatever you do IS tracked, and the remaining plan re-sequences after it. This dissolves "failure" entirely.
- **Drift pauses & pushes forward.** Drift from a planned item → the app doesn't mark failure; it **pauses that item and slides it later** in the queue. Still time for it — it just moved. Always offers "switch to the next thing on the plan."
- **Always offering the next step.** At any moment the app surfaces the next planned activity to (re)start → getting "back on plan" is always one tap, no matter how much you drifted.
- **Time-pressure pruning.** As the day runs out, planned items that can no longer fit **auto-drop / are suggested for removal** (drift all day → "Shower" eventually drops). The user can also remove items themselves as the plan readjusts for each later part of the day (2nd half, last quarter). The plan shrinks to what's still achievable.
- **Never truly off-plan.** A person can drift all day; the plan keeps offering a path back + the choice of what's next. The app is always tracking *something*; the plan just re-sequences around reality.
- **Retroactive correction (edit the past).** If it tracked the wrong thing, edit it: tell it what you were actually doing ("I just came out of the shower" when it thought "vibing"). The app **cancels the wrong assumption, ends it, re-sequences**, and re-offers the plan ahead + what to do next. **UI (designed 2026-06-23):** tap any past block (it shows a pencil) → editor "what were you really doing?" → pick the activity (mini-bento) + adjust its time/duration (stretch) → Save → replaces the wrong block, logs the real one, re-sequences the rest.
- Makes Plan-vs-Real a living relationship, not a pass/fail grid. Connects §15 (switch logic), §17 (forgive→re-plan, now CONTINUOUS), §12 (adaptive planner = the reflow engine).
- **VISUAL = SPLIT two lanes (David 2026-06-23, reverted from overlap):** PLAN lane (left) = **hatched** bubbles (diagonal candy stripes = "scheduled, not yet done"); REAL lane (right) = **solid** bubbles. **Gold ring = on-plan/matched; coral = drift.** Backfill gaps = dashed "fill it in?" slot. The split reads clearer than overlap for seeing where you were on-plan vs where you drifted (in the past). The reflow LOGIC above still holds (pushed-forward plan items appear as hatched bubbles queued after the now-line; dropped items fade/strike out) — just rendered in two lanes, not one merged track.
- **Plan-lane has THREE states (David 2026-06-23):** (1) **HATCHED** = scheduled / still on the table (upcoming or pushed-forward); (2) **GHOST = hollow outline** (from look #2 "Ghost→filled") = an **INCOMPLETED / missed plan** — a promise reality never filled; (3) **COMPLETED = a SPECIAL celebratory mark in the PLAN lane (David 2026-06-23)** — a done planned item TRANSFORMS into a **CATEGORY/ACTIVITY-COLORED celebration** (the activity's OWN color, brightened + foil sheen + glow + check + sparkle) — it **VARIES by what you did** (completing Eat ≠ Move ≠ Deep work; NOT monochrome gold — the plan lane becomes a colorful record of how you spent yourself), NOT just left hatched and not just reflected by the real lane. Clearly distinct from scheduled-hatched and missed-ghost. So the plan lane reads at a glance: scheduled · DONE! · missed. Real-lane: **gold = on-plan/done, coral = drift.**
- **Streak = a YELLOW→RED GRADIENT (David 2026-06-23).** The instant you START doing what you planned, the gradient ignites (yellow) and **deepens toward red** as the streak grows (heat = intensity). Replaces the discrete gold→fire tiers with a continuous gradient. **And it climbs PAST red into EPIC TERRITORY (David 2026-06-23)** — sustained mega-streaks unlock special legendary tiers, a cool progression of COLOR + TEXTURE: red → **EPIC** (crimson/magenta + embers) → **SUPER EPIC** (purple/violet + lightning) → **LEGENDARY** (rainbow holographic / cosmic foil). It keeps getting more special the longer you hold it.
- **Save your streak by adjusting the plan on the go — via "consciously plan what you're about to do" (David 2026-06-23).** "Plan a break" is NOT one function; it's a small flow: **pick ANY activity** (go for a walk, watch TV, snack, call — anything), **set a DURATION** (how long), and it **inserts at NOW and the rest of the plan REFLOWS** around it. THE KEY DISTINCTION IS NOT productive-vs-leisure — it's **CONSCIOUS & PLANNED vs UNCONSCIOUS DRIFT.** Consciously choosing to watch TV for 30 min = on-plan, streak safe; mindlessly sliding into it = drift. So you can ALWAYS stay on-plan simply by *declaring* what you're doing. (Same picker + duration mechanism as starting any task — switching = consciously planning the next thing. Reconciles with Newport §17 — conscious/planned rest keeps the fire burning.)
- **TRACKER + PLANNER = ONE clever system (David 2026-06-23).** Switching a task is a SINGLE frictionless gesture that does three things at once: (a) **stops + logs** the current activity, (b) **starts** the new one, (c) **reflows the plan ahead** (push / drop / re-offer). The cleverness: it makes **staying on-plan the EASIEST tap** — the next planned thing is surfaced as the hero option (1 tap, streak-safe) — while switching OFF-plan is *also* 1 tap (the plan just bends around it). Must be effortless on BOTH axes: tracking AND plan-ahead. This is the heart of the product (§16 task #16 frictionless tracking).

## 26. Multitasking / concurrent tracking (David 2026-06-23)
Track MULTIPLE activities at once (the engine already supports stacked timers — `S.timers` is an array). A **primary** activity + concurrent **"also doing…"** side activities, each independently timed and stoppable.
- **Live:** while tracking (e.g. Claude code), tap **"+ also doing…"** → pick a concurrent activity (e.g. Joint, Movie) → it runs as a second timer alongside. Stop each on its own — finish the joint, Claude code keeps running.
- **Retroactive:** add a concurrent activity over a PAST span — "just smoked 15m" drops a Joint overlay over the last 15 min of the still-running Claude code (via "+ add a past overlap" / the edit-the-past flow §23). Like backfill, but overlapping an existing activity.
- **Calendar shows overlaps:** the primary activity is the main block; concurrent activities appear as **slim secondary bars beside/overlapping it** for their span, with a "⧉ N overlaps" badge. So you can see "Claude code, with a joint for 15m and a movie in the background."
- Each concurrent activity is its own tracked entry (own category color, own duration) — they all count, layered.

## 24. Activity categorization — the Six→EIGHT Domains (David chose #2, expanded 2026-06-23)
David picked "Six Domains" and expanded it. **Colors live at the CATEGORY level** — many activities → one category → one color (breakfast + dinner both = Nourish). This palette drives EVERYTHING: the bento picker clusters, the calendar bubble colors, the completed-celebration colors (§14).
- **MOVE** (orange #ff8a3a) — walk, gym, run, stretch, yoga, sport, bike, hike, dance
- **NOURISH** (green #34d39a) — breakfast, lunch, dinner, cook, snack, coffee, water, groceries
- **FOCUS** (blue #36b3f0) — deep work, study, admin, email, meetings, planning, code
- **CREATE** (purple #b07aff) — paint, draw, music, write, YouTube, design, build, practice-a-skill
- **CONNECT** (pink #ff5fa0) — family, friends, call, date, hang out, help someone, community
- **PLAY** (yellow #ffc83d) — games, TV, movies, fun reading, hobbies, explore [NEW vs original six]
- **RESTORE** (teal #2ab8c4) — sleep, nap, meditate, breathe, bath, nature, journal, pray, rest
- **UPKEEP** (slate #7f9bc4) — shower, grooming, clean room, laundry, dishes, errands, money, doctor [NEW vs original six]
- **DRIFT** (mauve-grey #8a6076) — unconscious scroll, zone-out, mindless snack — the ONLY "off-plan" (unconscious)
- **Intent-dependent (same activity, different domain by WHY):** Reading → learn=Focus / fun=Play / reflective=Restore · Walking → exercise=Move / contemplative=Restore · Journaling → reflective=Restore / creative=Create · Cooking → fuel=Nourish / hobby=Create · Scrolling → conscious=Play / unconscious=Drift. (This mirrors the conscious-vs-drift principle §23.)
- **CONFIRMED 2026-06-23: all 8 domains approved as-is** (Move · Nourish · Focus · Create · Connect · Play · Restore · Upkeep + Drift). This is the canonical palette.
- **Golden glow** on Real-lane bubbles when actual MATCHES plan (the §6 Guitar-Hero win). Drift bubbles are shown honestly (dashed coral), never hidden.
- **Backfill:** an untracked gap shows a dashed "fill: what were you doing?" slot you **stretch a bubble into** (§7).
**The 5 interactions to design (one at a time):**
1. **Planning (designed 2026-06-23)** — the app NEVER shows a blank day. A **suggestion bar** proposes the next sensible block (2–4 adaptive picks drawn from your routine + fundamentals + time-of-day + **your goals** — e.g. "Draw · 30m ✦ from Artist goal" surfaces goal-decomposition §16, pulling you toward what matters). Tap a chip → it drops in as a hatched bubble + you set a **duration** → it suggests the NEXT. Build a day in taps, no typing. Plus **"✨ auto-fill"** drafts a whole day to tweak. Order-aware (§12): suggestions adapt to what you've already placed. **Suggestion engine = A+B (reasoned hero pick + a couple alternates, each with a WHY).** BUT — because the user has MANY habits — the **FULL BENTO BOX is ALWAYS one tap away** ("all my activities"): the curated picks handle the common case, and the everything-accessible categorized bento (§21) is the persistent "more options" door, reachable from EVERY plan / switch / track moment (David 2026-06-23). Smart shortcut up front, whole library always nearby.
2. **Backfill** — stretch a bubble across a gap to log past activity.
3. **On-plan celebration — an ESCALATING crescendo, NOT a static glow (David 2026-06-23).** Doing what you planned must feel *thrilling* (Guitar-Hero "land the note"). It's already epic the instant you START a planned activity (star pop + glow + points), then BUILDS with the streak: x2 combo → brighter + more stars + bigger points → streak catches FIRE (flames, hotter glow) → ON FIRE (supernova: fire bursts, stars, huge points). Combo multiplier grows with consecutive on-plan blocks. Drift COOLS it gently (combo eases, no shame — §17). Real animations/particles in build (pop, shimmer, bursts). CRITICAL: fires for **plan-ADHERENCE**, so **planned rest counts too** — staying on plan to rest lights the same fireworks (keeps the excitement aimed at adherence, not busyness — Newport-safe, §17). The header "N on plan" is the day's adherence score.
4. **Zoom** — day → week → month, and how the journal reads zoomed out.
5. **Journal layer** — tap a block to add a note; the EOD reflection.
This screen is where you BOTH build the plan and track yourself against it.

## 17. Design philosophy — Slow Productivity (Cal Newport), folded in 2026-06-23
David gave us the book; here's what PowerUp bakes in. **The pivotal insight:** PowerUp's "addiction engine" and Newport's anti-busyness philosophy only conflict if the combo measures the WRONG thing. The combo is neutral — it amplifies whatever you reward. So **reward depth, completion-ratio, fewer-things, and planned rest — NEVER volume, raw counts, or constant escalation.** Get that one inversion right and the game becomes the best delivery vehicle for slow productivity (Newport's own Slow-Food lesson: a reform must be *more attractive* than the busyness it replaces — which a well-aimed reward loop is).

Reconciliation with §16 (David wants MANY goals on paper): **capture everything, activate little, audit long.** The app holds all his goal-trees, but keeps only a FEW active at once and audits progress over months — honoring both "put all my goals on digital paper" and "do fewer things."

Bake-in principles:
1. **Cap, don't accumulate** — hard limits on missions/projects; default ONE primary deep project per day; adding past the cap forces a SWAP, not a silent stack; a holding-tank tier for captured-but-not-active goals.
2. **Reward small-and-done, not big** — score completion ratio + depth, never task count or items-added.
3. **Make rest a heroic, combo-PRESERVING action** — planned cooldowns / leisure / slow-seasons earn points and never break the streak.
4. **Pad the timeline** — default generous estimates ("double it"), multi-year horizon (slow weeks aren't failure).
5. **Contain the reactive** — route incoming tasks to a holding tank; batch small stuff in a scheduled "office-hours" window; protect the day's deep block.
6. **Forgive, then re-plan** — procrastination → no-shame Adapt ("what's next?"), never a punishment that torches progress.
7. **Protect the one thing that matters** — name the core quality activity per domain; weight rewards toward depth on it; impose a finish line to block perfectionism (progress, not perfection).
8. **Quality buys freedom — show it** — a long-arc mastery/autonomy meter rising as sustained quality compounds.
AVOID: +1 dopamine on ADDING tasks; a growing checklist as the main screen; streaks that snap on one slow/rest day; rewarding volume as a proxy for quality.

## 15. The switch-activity logic / state machine (added & confirmed 2026-06-23)
**DEFAULT POSTURE:** the app **always encourages making a plan, and re-planning when you drift** — planning is the nudged ideal (it earns the bonus). But the user **always has the option to simply track the day without a plan.** The app is **state-aware — it understands when/what is happening** (time of day, on-plan vs off-plan, likely activity) and surfaces the right offer for the moment.

At every switch point ("time to move to the next thing"):
- **Have a plan for now?**
  - **YES:**
    - Doing the planned thing → one tap to confirm; track it; counts as on-plan (**earns the bonus**). **Timing-forgiving** — slightly late/early still counts as following the plan.
    - Doing something else instead → the app **offers to RE-PLAN** (swap in the different activity). Agree → it times the new activity (plan updated). Or keep the original → it times the planned thing.
  - **NO PLAN:**
    - The app offers **REACTIVE options** (pick what you're actually doing) → times it; **no bonus**.
    - It also offers **"plan your day"** — a journaling-style session (future: guided journaling) — the path from reactive into planned.
- **Reframes (important):**
  - **PRODUCTIVE ≈ following your plan (planned); REACTIVE ≈ unplanned** (whatever you actually chose in the moment). Reactive is NOT "bad" — it can be productive (clean room) or not (watch TV); it just means *unplanned*. The bonus is strictly for plan-adherence; reactive is always available and still tracked.
  - **TRACKING = digital journaling** — every path ends in a recorded activity.

## 16. Long-term & hierarchical goal planning (added 2026-06-23)
The Plan pillar is NOT just "today." PowerUp helps you plan the FUTURE at every horizon and **decompose big goals top-down into schedulable daily actions** — for people (David, and most people) who lack an organized method for planning their future. Aspirational reference: **Cal Newport** (deep planning + lifestyle auditing); on-lineage with Jim Rohn / Brian Johnson goal-setting.
- **Encourage planning tomorrow** (near nudge), and planning the **week** and **month** ahead — not just the current day.
- **Top-down decomposition:** GRAND long-term goal → MID-TERM subplans / milestones → WEEK/MONTH steps → DAY-TO-DAY activities. Break any goal into subtasks → sub-subtasks → daily actions.
- **The app recommends WHEN to drop each subtask into the calendar** (schedules the pieces across the coming weeks/month) — so a big goal becomes concrete *dated* actions. Plan a whole week or month ahead.
- **Separate plans per life DOMAIN**, e.g.:
  - **Finance** — personal-finance plans, budgets / spending limits ("make sure you don't spend too much"); the app encourages a dedicated money plan.
  - **Health** — long-term goal e.g. "knee surgery" → subtasks (call doctor, see doctor, pre-op steps) → app recommends scheduling them into the calendar ~a month ahead.
  - Work, personal, etc.
- **Horizons connect:** day → week → month → long-term. The day-calendar (§14) is the BOTTOM of this stack; long-term goals flow DOWN into daily activities.
- Core value: quickly **create goals, divide them up, and schedule your future** — structure for people who don't naturally plan.
- Lives in the notebook's **Plan** pillar. Gets its own reference-grounded design pass. References to mine: Things 3 (Areas → Projects → To-dos), GTD / OmniFocus (projects → next-actions), OKRs, product roadmaps, Cal Newport time-block planning, goal-tracker apps.
- **David's REAL goal-trees (design against these):**
  - **Artist (long-term):** finish portfolio · send to gallerists · new paintings · study AI art as a medium · improve as a painter · practice drawing daily.
  - **YouTube channel:** scripts · visuals · study · improve his AI-for-YouTube setup.
  - **Design business:** daily LinkedIn posts (or a system to post daily) · work on the reel · remake the website.
  - (plus Health, Finance.) David uses AI as part of his workflow for these goals.
- **PURPOSE = put ALL your big goals onto digital paper, perfectly organized for your life** — so you can always plan ahead, always see where you're at, and the app **cleverly AUDITS your life and goals**, showing day-to-day movement toward the plan (Cal Newport's lifestyle-auditing ideal). Capture everything; the discipline of *what's active* is handled per §17.

## 18. Atomic Habits / skill-building layer (James Clear), added 2026-06-23
PowerUp synthesizes Atomic Habits as its habit & skill-building science — complementary to Newport (§17). **Newport = WHAT to focus on** (fewer big things, deeply, natural pace). **Clear = HOW to build the daily behavior.** The two-book backbone.
- **Flagship use case: learn a new skill** (e.g. learn piano). Thesis: *everything becomes doable if you have a game plan* — PowerUp turns any aspirational skill into a decomposed plan (§16) + a tiny daily habit + identity + a satisfying reward.
- **Make it SATISFYING (immediate reward) — THE bridge:** habits stick when the payoff is immediate, but real-skill payoffs are delayed. PowerUp's gamification (golden combo, rewards) IS Clear's 4th law operationalized — the satisfaction that carries you until the skill compounds. Single most important fit: **the game = "make it satisfying."**
- **Identity-based habits** — "every action is a vote for who you're becoming." Already identity-first; the character/virtue tree IS this. Reward identity reinforcement, not just completion.
- **Make it tiny / 2-minute rule** — break a skill into the smallest daily rep ("piano 2 min"); the app auto-suggests the tiny version so starting is frictionless.
- **Habit stacking** — anchor new habits to existing routines ("after coffee → 2 min piano"); the planner suggests stacks.
- **Make it obvious (cues) / environment design** — the world + the app's nudges are the cue layer.
- **Never miss twice** (Clear) — already = §17's forgive-then-re-plan (a slip is fine; don't miss twice). Streak forgiving, not brittle.
- **1% better / compounding** — the long-arc mastery meter (§17) shows tiny daily reps compounding over months.
- New goal TYPE: **"learn a skill"** — decompose → tiny daily habit → identity → satisfying reward → compounds. Makes intimidating skills (piano, a language) feel doable.

## 19. The AI brain — two-tier intelligence (added 2026-06-23)
David's realization: the *intelligent* game-planning (decomposing goals, suggesting the tiny version, scheduling steps at the right times, adapting to drift/remaining time, auditing) is exactly what justifies an AI brain. Consistent with the original "genius without the brain; with the brain true magic begins" + the $0 rule:
- **TIER 1 — WITHOUT the brain (the free floor: always on, offline, $0):** deterministic templates + time-aware heuristics. Pre-built decomposition templates for common goals, the bubble calendar, tracking, gamification, the picker, the whole daily loop — all fully work with NO AI. The app is genius on its own; it never *depends* on a key.
- **TIER 2 — WITH the brain (optional, BRING-YOUR-OWN-KEY, stored locally on-device):** true intelligence. The brain: decomposes ANY goal (learn piano, knee surgery, become an artist) into a smart custom subtask tree; picks the right *tiny* daily rep; recommends WHEN to schedule each step across the week/month; adapts the plan to your drift + remaining time + blueprint; audits your life and surfaces what's off-track; personalizes everything.
- **Graceful degradation:** brain off → app still fully usable; brain on → magic. **$0 to the project either way** — users paste their OWN AI key, stored only in localStorage on their device (the project never stores, transmits, or echoes the key). Matches existing `S.brain = {engine, key}` in code.
- This is WHY the onboarding blueprint matters: it's the context the brain reasons over.
- **GOVERNING RULE — AI APPLIES wisdom, never INVENTS it.** The app contains ALL the wisdom it needs as STRUCTURED knowledge (Newport principles §17, Atomic Habits laws §18, goal-decomposition templates §16, time/energy heuristics, the self-help stack, the virtue framework). The AI brain is NOT a chatbot/oracle — it is a thin **application + retrieval layer** that *matches and applies* the app's existing wisdom to the user's specifics. Every AI output must trace to an app-defined principle/template/library item; it lubricates & supercharges a structured app, never generates wisdom from thin air. **Same architecture as David's fieldguide & magic KBs:** atomized wisdom + grounded retrieval + cite the source, never hallucinate. (Cross-project pattern — reuse what works.)
- **Where the AI applies (ranked by value):**
  1. **Onboarding** — maps the user's answers into the app's models (archetype, domains, patterns); seeds their personalized activity/goal set.
  2. **Goal decomposition / long-term planning sessions** — fills a decomposition TEMPLATE with the user's specifics; the *methodology* is the app's (Newport/Clear), the *content* is theirs.
  3. **Scheduling** — slots each subtask across the week/month using the app's time/energy heuristics + the user's calendar.
  4. **Adapt / re-plan** — applies the app's forgive-&-reroute rules to the user's current drift + remaining time.
  5. **Daily nudge / coaching** — surfaces the RIGHT pre-existing principle/module/mantra for this moment (retrieval, not generation).
  6. **Life audit** — grades the user's tracked reality against the app's rubric (Newport caps, plan-adherence, identity-votes) and surfaces what's off.
  7. Others: pick the *tiny* version + habit-stack per Clear; match current state → the right self-help teacher/module.
- **Where NO AI is needed (the deterministic floor):** tracking, the bubble calendar, the picker, gamification math, the templates/library themselves. The app is fully alive without a key.

## 20. Monetization model — free floor / paid brain (added 2026-06-23)
David's insight: the two-tier brain architecture (§19) IS a natural freemium business model.
- **FREE tier = "without brain"** — the ENTIRE structured app (daily loop, bubble calendar, tracking, gamification, picker, template-based goal breakdowns, self-help stack). Genuinely complete, NOT crippleware — builds trust + word-of-mouth, gets users in, retains even on free.
- **PREMIUM = "with brain" (PowerUp+)** — the AI intelligence layer (intelligent goal decomposition, scheduling, adaptation, life audit, coaching). Two access paths:
  - **BYO-key** — free to the project; for technical/power users who paste their own AI key (local only, never seen by the project).
  - **Hosted subscription** — PowerUp runs the AI; recurring revenue; the subscription directly covers the variable AI cost + margin. The mainstream paid path.
- **Why it's strong:** (a) free app is genuinely useful → ethical + viral, not bait; (b) the brain's value COMPOUNDS with use (more goals/history → smarter help) → retention; (c) subscription covers the AI API cost so margins are clean; (d) project's own cost stays near $0 (BYO-key users cost nothing; hosted users pay their usage).
- **2nd stream (game-native): cosmetic IAP** — since it's a life-sim GAME, optional cosmetics (fairy skins/outfits, world decorations, garden themes) sell as one-time purchases that GATE NOTHING. Fits the candy aesthetic; classic non-predatory game money; a lighter line next to the brain subscription.
- **FREE includes a MANUAL version of the brain's features — the app GUIDES you, you do the thinking.** The brain is NOT a paywall on the CAPABILITY, only on the LABOR. Key example — long-term goal planning: FREE = you type your goal and the app **walks you through decomposing it yourself using FIRST PRINCIPLES** (a guided worksheet/wizard; the *method* is the app's structured wisdom). PAID brain = the AI does that thinking FOR you (auto-decompose, schedule, adapt). Same feature, two modes: **do-it-yourself-guided (free) vs done-for-you (paid).**
  - Why strong: method always free (nothing essential locked); you pay to save effort, not to unlock ability (fair, not extractive); **mission bonus — free users LEARN to plan in first principles**, building the exact life-auditing skill the app exists to teach.
  - GENERAL PATTERN: every brain application point (§19) can have a **free guided-manual mode + a paid AI-assisted mode.**
- Pricing / exact tiers TBD with David.

## 21. The activity picker — direction (David 2026-06-23)
David wants the picker to feel like **everything is accessible at once — like a 3D app or ComfyUI** — but **TAP-ONLY, no keyboard.**
- **Activity unit is flexible** — "cards" was just one idea (David walked it back 2026-06-23). Likely the app's native **candy bubble/sticker** (consistent with the plan/track bubbles — more game, less "productivity app"). What matters is the FEELING below, not the container shape.
- **Categories visible + clever use of space** — you can SEE the whole taxonomy laid out, not hidden behind drills.
- **Multi-select** — grab a bunch of activities at once (ties to the existing multi-timer stacking / "choose a bunch of random activities").
- **Onboarding captures most of your activities** → the app KNOWS your set and ADAPTS (prediction).
- **Reconciliation with "less machine":** *everything-visible-and-spatial* is GOOD (never lost — it's all THERE); *hidden-and-nested* is BAD. ComfyUI is dense yet legible. So density is fine if it's spatial and visible.
- So the picker = **two modes: (1) QUICK** — prediction surfaces the likely 1-tap pick; **(2) BROWSE** — a spatial, everything-visible **card canvas** organized by category, for choosing a bunch / exploring. Tap-only throughout.
- Concepts explored: Bento board · Category lanes · Zoomable constellation canvas. Superseded by the chosen direction below.
- **CHOSEN form (David 2026-06-23): the APPLE WATCH HONEYCOMB.** A pinch-zoomable / pannable cloud of candy **bubbles**, **color-coded and clustered by category, packed close together** (Energy=pink, Work=blue, Love=purple, Hobby=yellow, Reactive/drift=coral). Apple-Watch behavior: bubbles bigger toward the center, smaller toward the edges. **The likely-now (predicted) bubbles sit BIG in the center** → the common case is 1 tap; to browse, pan/pinch to a color cluster. **Tap = multi-select** (grab a bunch) → "start N." Categories are visible via color + small cluster labels. This is the proven, beloved realization of "everything accessible like a 3D app / ComfyUI, tap-only." Onboarding seeds which bubbles exist + their cluster.
- **Evolution (David 2026-06-23): it's a HABIT MINDMAP / life-tree.** Activities connect by RELATIONSHIP — related habits branch/grow together (outgrowing tree/mindmap formation) but stay clustered close. It doubles as a **portrait of the person's life through their habits — GOOD AND BAD** (vices/bad habits shown honestly, dim/thorny, not hidden). One screen does triple duty: the picker (what to do) + the garden-of-mind (the world) + the identity mirror (who am I being). Tap a node = start it; *looking* at the whole map = see yourself.
- **Bubble density + sizing rule (David 2026-06-23):** MANY bubbles (dense — the whole life). **Size = how FUNDAMENTAL × how OFTEN you do it** (core/daily = bigger, rare = smaller). BUT a **COMPRESSED range** — even the smallest bubble stays QUITE BIG (a comfortable tap target, ~44pt+); the biggest only modestly larger. Size is a gentle signal, never so small it's hard to tap. **Convenience first.**
- **Add-new-activity = the ONE place typing is allowed** — type a name once at creation (+ pick icon + category + size), then it's a forever-tappable bubble. NEVER type at pick-time.
- **The bento picker is CORE machinery, used CONSTANTLY (David 2026-06-23):** every conscious plan/switch runs through it (e.g. mid-work → pick "Meditate" → set 10 min → go). So it must be FAST and **context-ADAPTIVE** — surface what fits *this* moment (time, plan, what you're mid-doing). It's not a rarely-opened menu; it's the steering wheel of the whole tracker+planner loop.
- **Bento vs Mindmap (both strong, likely BOTH):** Bento = structured, all-visible-tiled, legible/predictable; tap a category to **expand in place** (others collapse to a top strip); best as the **everyday fast PICKER**. Mindmap = organic/relational **life-portrait** (good+bad habits as a living map), more on-soul (garden/identity). **Resolution on the table: Bento = the everyday picker; the Mindmap = the "see your life" identity view** (in the character/stats area). Same bubbles, two lenses (pick-fast vs reflect-deep). TBD with David.
- **CONFIRMED 2026-06-23: split approved** (Bento = everyday picker · Mindmap = identity "see your life" view). **And NOTHING is full-screen:** the bento picker, the notebook menus, AND the pull-down tracker all **float over the dimmed world** (world + HUD always peek behind, ~20–40% dim) and are always dismissable (X / tap-outside / pull back up). The pull-down is a **draggable sheet** — even fully expanded you can always pull it back up; never a locked full-screen state. (This is the universal overlay rule from §13 — applies to every surface.)
- **Pull-down overlays are TOP-ANCHORED (David 2026-06-23):** anything that comes from the top tracker (the plan-vs-actual, the picker reached from it) **hangs from the top edge, rounded bottom corners, world dimmed below** — NOT a centered-floating panel. It MUST have a **bottom grab-handle (a grabber bar + ⌃ "pull up to close")** so the pull-back-up gesture is obvious. The floating-centered treatment looked wrong; restore the pulled-down look + the bottom pull-up handle.

## 13b. (cont.) Navigation & home layout
- **BOTTOM-RIGHT, above the right stick — the NOTEBOOK button** = the ONE menu door → opens the notebook holding every feature (Plan, Track, Care, Garden, Stats, You), one consistent chrome, one X top-right. The "never lost" anchor.
- **CENTER — tap the fairy → character skills & stats** (the RPG character sheet: virtues, levels, who you're becoming). Identity, NOT navigation.
- **Twin sticks** stay in the bottom corners (left = move, right = aim/jump), thumbs never fight the UI.
- Mnemonic: **top = what am I doing · corner notebook = where's everything · center fairy = who am I.** Nothing competes, nothing hidden.
- Combination of paradigms: NookPhone-style launcher (notebook) for all features + a top live-status strip (Control-Center-style) + tap-character-for-stats (The Sims-style). The radial survives only as the peer **activity tool-wheel** inside the picker, never as navigation.
