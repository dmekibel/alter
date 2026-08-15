# JOURNEY OS — the 300-day course as a living curriculum + the Algorithm Engine
**Date:** 2026-07-21 · **Session:** Fable (thinking only, no code touched) · **Trigger:** David's voice note (smoke-trigger report + "reconsider the Brian Johnson course, expand how it applies to the journey, the goal system, the app; fix the typing course; Duolingo-of-the-textbook; alternate journeys; serve every persona").

**What this doc is NOT:** a re-derivation. The reconsideration David asked for largely exists already and this doc stands on it:
- `_course/COURSE-MAP.md` (the faithful 8-module map, the spine, the 10 load-bearing rituals)
- `_course/COURSE-AUDIT-2026-06-30.md` (coverage gaps, cheese hit-list, the repurpose blueprint, the floor/ceiling adaptive law)
- `_course/ALTER-APPLICATION.md` (the theory layer: render the course's native game grammar as software; progression = capability, not consumption; "the Optimize series with the lessons deleted and the mechanics kept")
- `_course/_build/engine-v1.json` (82 app-ready beads: id, thread, tier, purpose, trigger, learns) + `canon-fold.json` (journeyPhase axis) + `plotkin-fold.json` (the depth arc)
- `BOOKS-MIND-PSY-CANON` (MI law-book, never-punish science, ADHD gate), `BOOKS-DEV-CANON` (teach-by-doing, 100ms, miss-states crafted), `FOUNDATION-PITCH` (core loop), `MASTER-GAMEPLAN` REVISION 2026-07-21 (launch sequence, untouched by this doc).

When detail conflicts, those win. This doc owns the COMPOSITION: the four systems that were genuinely missing, and their build order.

---

## 0. THESIS

The user never takes a course. **The journey deals capability, the day proves it, the record remembers it.** Duolingo gamifies RECOGNITION (tap the right answer about a textbook). ALTER gamifies ENACTMENT: the exercise is the user's real day, so the unit of curriculum is never "lesson completed", it is a rep lived (a block, a tool run, a catch, a close).
EVIDENCE: dev canon (teach-by-doing, retention = next narrow skill); the day-1 stones verdict (PRIME→DO→NAME→PLACE→SEAL, aphorism slideshows rejected); ALTER-APPLICATION §5 ("taught through the design").

Four systems compose the whole ask:

| System | David's words | What it is |
|---|---|---|
| 1. CATCH + ALGORITHM ENGINE | "aware of their triggers... breathe instead of the smoke... reward, never punish" | The live layer: urges and obstacles become user-authored if-thens |
| 2. GOAL LOOM | "plan three months ahead... like my friend's therapist" | Quarter → month → goal → step → planner block |
| 3. LESSONS 2.0 | "the course section is a bunch of questions and typing... fix it" | Bead → tap-only ritual lesson + Wario micro-reps |
| 4. COMPOSER + THREADS | "multiple side branches... but everybody needs one next thing" | One glowing next stone daily; alternate journeys as weights, not maps |

One law over all four: **ONE NEXT THING** (the Dad Law's UX form). And one structural law: never two live day-models (the v488/v496 lesson); everything here composes into the EXISTING trail, tick, and state.

---

## 1. THE CATCH + ALGORITHM ENGINE (Module V made real)

The course's own ladder is Willpower → Habits → Algorithms (V.1). The app has the slot waiting: `S.alg = {list:[], catalysts:{}}` (SCHEMA 2 scaffold, empty), `catalystCard()` already converts a logged vice timer into a "+3 swap" offer (app.js ~11606). What is missing is the moment BEFORE the behavior: the catch.

**Seed case (founder N=1, 2026-07-21, saved to memory `david-smoke-triggers-report`):** David smokes pot through the day. Two distinct drivers: a genuine urge, and a pure cue (an already-rolled joint + lighter in the ashtray beside him). Too much = fog, and fog compounds. His own hypothesis: under-breathing is one real trigger (diagnosed breathing issues, frequent stuffy nose), so a real breathing session may be the honest substitute.
EVIDENCE: real user, top evidence tier. Note the mechanism gift: a drag IS a slow inhale + long exhale with a drug attached. The substitution test ("run the breath pattern without the smoke, then decide") is mechanistically apt, and it is HIS experiment, framed exactly that honestly.

### 1.1 Science spine (each claim capped, citable on the Science page)
- **Implementation intentions** (Gollwitzer, d≈0.65, already cited in DECISIONS 2026-07-11): if-then plans double-to-triple follow-through. This is the term David was reaching for ("implementation equation"). Johnson's word for the same thing: **algorithms** (Module V). WOOP's Plan step (II.3) is the same move with the obstacle named first.
- **Course Module V**: install protocol (identity first, ONE behavior, anchor AFTER, easy, celebrate); delete protocol (know the demon = the root trigger, make it invisible, make it hard, "needs work" as a no-drama flag); **+3 Gain: every caught-and-redirected urge scores +3** (the course's own never-punish math, already the number `catalystCard` pays).
- **Allen Carr** (in the field guide, SN-196..200): the addiction manufactures the void, then relieves it, and calls the relief pleasure; willpower framing guarantees failure because it frames abstinence as sacrifice; the exit is desire-deconstruction ("escaping", never "giving up"). For ALTER: never a quit program, never a sacrifice frame; the app deconstructs the cue quietly ("the rolled one is not pleasure waiting, it is the loop asking").
- **Maxwell Maltz** (in the field guide): the self-image is the master program; it changes through vivid imaginative experience, not willpower (Theatre of Mind; same neural networks fire imagining as doing). For ALTER: rehearsing an algorithm in the Visualisation tool IS the install.
- **Brian Withers** (in the field guide): misaligned, not broken; stimulus → GAP → response; faulty beliefs are factory settings, replaceable. The catch trains the GAP itself.
- **MI law-book** (psy canon): the user authors the plan in their own words; the app reflects change talk, never prosecutes; importance/confidence rulers; Miller: "retire the concept of relapse."
- **Never-punish science** (psy canon): self-kindness after a lapse INCREASES follow-through (Neff doughnut study); punishment demotivates (Fogg, Deci). Four independent sources; it is a defensibility claim.
- **Breath** (course VI.5 + shipped ladder): the long exhale is the lever (parasympathetic); overbreathing/underbreathing both dysregulate; micro-moments count. Substitution default = the guided breath ladder (v1126, ALREADY SHIPPED) at floor dose.

### 1.2 The loop: CATCH → NAME → RUN → CHOOSE → LEARN
- **CATCH.** One tap from home or the tracking quick-row (the puck later, after the nav lands): "I want ___" chip cloud seeded with the user's own pulls (smoke, scroll, snack, + add your own). Two optional taps: context (where / what just happened) + body feel. Floor law: ≤8 seconds end to end (audit §4). Every catch = +1 Spark, unconditionally, paid AFTER (mirror-not-price law). The app says the quiet part once, at forge time, not per catch: catching is the skill; the space between urge and act is where the person lives (Withers' GAP, Frankl via course II.1).
- **NAME.** No dashboards, no forms. The ledger accumulates silently; after enough catches the guardian ASIDES a pattern in one line ("3 of your last 5 smoke urges arrived with a rolled one in sight"). The mirror is a whisper, not a chart.
- **RUN.** The algorithm's move is one tap on the catch card: default for David = guided breath ladder, floor dose. **Stuffy-nose mode:** a congestion variant (gentle mouth inhale or whatever is open; the long exhale carries the effect). Tiny content addition to the breath tool, honest about mechanism.
- **CHOOSE.** After the run, the free re-decide, zero sermon: "still want it? your call." Every outcome logs descriptively. Redirected = +3 (the course's own math). Did it anyway but caught it first = the catch's +1 stands, plus a Neff-register line, zero shame. There is NO abstinence streak anywhere (abstinence streaks are shame bombs; the two locked streaks remain the only streaks).
- **LEARN.** PM close gains one optional bouquet line from catches ("you caught four today; two turned into breath"). Weekly: the cluster mirror + an MI ruler on the algorithm itself ("keeping it? sharpening it?"). The algorithm evolves in the user's words.

### 1.3 FORGE (authoring an algorithm)
The app drafts from the trigger map; the user edits by chips; the format is fixed grammar:
**IF** [trigger chip(s)] **I** [move: a tool at a dose, or a micro-act] **FIRST. THEN I choose.**
The "then I choose" tail is load-bearing: it keeps autonomy (MI), kills the sacrifice frame (Carr), and makes the algorithm honest (it promises a pause, not a purity).
Activation is a ritual, not a save button: hold-to-charge seals it (the charging primitive, Xygalatas cost law), and the Visualisation tool rehearses it once (Maltz: see the ashtray moment, see the reach for breath instead). Both primitives are already shipped. The one permitted typing surface in this whole engine: an optional "say it your way" line, because their words beat ours (MI).

### 1.4 Environment moves (delete protocol, rendered as suggestions)
Guardian suggestion cards, opt-in, never commands: "out of sight beats out of willpower: park the rolled one across the room. Twenty extra seconds is a different decision." (Invisible/Hard steps of V.3; Wood's context science from the psy shelf.) DRAFT copy register only; every line passes both gates before shipping.

### 1.5 Data (additive, guarded)
`S.alg.list = [{id, trig:{chips,ctx}, move:{tool,dose}, line, charged, k, runs}]`, `S.alg.catches = [{k,t,urge,ctx,ran,chose}]`. S.alg exists since SCHEMA 2; fields are additive with guarded reads. Ratchet's SCHEMA↔MIG pairing checked at build.

### 1.6 What this is NOT
Not a quit program. Not a vice-timer rebrand (vice timers + catalystCard stay; the catalyst card is POST-behavior, the catch is PRE). Not a mood tracker. No red anywhere in it.

### Slices
- **A1-lite (one Opus session, non-regression-zone):** catch card (home + tracking row) → run (breath ladder floor) → choose → log → rewards, seeded with David's smoke algorithm + stuffy-nose breath variant. Copy through Gate 1 + Gate 2 first. DEVICE test = the only honest test: the feel of catching a real urge.
- **A2:** forge + charge + Visualisation rehearsal. **A3:** asides, PM/weekly wiring, MI ruler. **A4:** environment cards + more substitutes (Urge Surfing from the psy shelf's B12 list).

---

## 2. THE GOAL LOOM (plan a quarter like a therapist, run it like a planner)

**Seed artifact (read 2026-07-21):** the therapist worksheet David sent ("quarter 3 goals" PDF). Its actual structure:
1. SMART with therapist add-ons: Specific & Simple · Measurable & **Meaningful (what would it mean to you)** · Achievable & **has it worked for someone else** & **as if now** & all areas of life · Realistic & Responsible & toward what you WANT (approach, not avoidance) · Timed.
2. Then **Month 1 / Month 2 / Month 3**, each holding 3-5 goals, each goal broken into **5+ concrete steps** in a table: the step · **what I need to get organized (setup)** · **what I need to keep the new system functioning (maintenance)** · due date · done.
3. Permission clause: goals can change as opportunities arise ("creating the skeleton of your future," not a contract).
The two-column split is the smartest move in it: every goal must leave a RUNNING SYSTEM behind, taught by a form, not a lecture (Clear's systems-over-goals, enacted). Real micro-steps from the friend's filled copy: "get shoes," "set my alarm 6," "eat dinner by 7." That granularity is planner-block granularity.
EVIDENCE: a real therapist's artifact in real use (top tier) + Johnson II.3/VI.8 (WOOP; hope = targets + agency + plans) + IV.7 (weekly preview/review) + III (Big 3 lens) + Rohn (JIM-ROHN-SOUL goal lists) + the existing `S.goals` WOOP fields and goal⇄journey projection (app.js ~1465).

### 2.1 The shape
**QUARTER THEME** (one line, the meaning answer: "what would it mean") → **MONTH** (3-5 goals max, Big-3 balance nudge so it is never all Work: Energy/Work/Love = the all-areas rule) → **GOAL** (name in their words + area + optional WOOP obstacle) → **STEPS** (about 5, each tagged **setup** or **system**, each with a due window) → the step becomes a **planner block** when its week arrives (extend the existing goal⇄journey projection; the loom feeds the same pipe).

### 2.2 The interview (tap-first, therapist-paced)
Chips for areas and step templates (the existing goal decomposition templates at app.js ~346 already do "complex activity → concrete steps"), sliders for MI importance/confidence rulers ("why a 4 and not lower"), typing ONLY for the goal name and the meaning line (their words, sacred). Floor: a quarter can be ONE goal (ADHD gate: the loom never renders as a wall; today only ever shows the one next step).

### 2.3 Review cadence (the course's own rhythm)
Weekly preview/review (IV.7; the Scorecard game-board arrives later per audit §5). Month close: unfinished steps roll forward without shame ("the time wasn't right," never "you failed"). Quarter close: a chronicle ceremony (what the record shows, in bouquet form) that seeds the next theme.

### 2.4 The free/paid line (sharpens the Jul 26 verdict, does not reopen it)
Manual loom = FREE (it is the planner's spine; the category promise). The **AI goal-architect (B6, the paid magnet)** = the conversational interviewer that BUILDS and MAINTAINS the loom with you, MI-style, and re-weaves it monthly. Same data model; the architect is a better author, not a different system. **B6's September spec must be written against this loom shape.**

### 2.5 Data
`S.loom = {q, theme, months:[{goals:[{title, why, area, steps:[{t, kind:setup|system, due, done}], woop}]}]}`. Build-spec decision (flagged, not decided here): unify with `S.goals` or bridge; never run two goal models at once.

### Slices
**L1** loom data + manual builder · **L2** planner projection + weekly preview/review · **L3** month/quarter closes · **B6** architect rides the shape (Sep, spec first, accounts + proxy + billing per gameplan).

---

## 3. LESSONS 2.0 (kill the typing course)

**Finding:** the "course section" David flagged = `WS_REG` (app.js ~2007: six worksheets, chapters 0-5) plus the Rx textarea pads (D-2) . Nine of the ~21 worksheet beats are free-text. The audit's own discipline (§3) already rules on this: "if the repurpose still has free-text or a multi-step grid, it is not done." Meanwhile the David-approved delivery instrument ALREADY EXISTS: the ritual lesson (`runLesson`: line/mirror/feel/burn/seal/door, PRIME→DO→NAME→PLACE→SEAL, tap-only, voice-carried). Day 1 uses it; chapters 2+ never got it.

### 3.0 THE LESSON LINT (added 2026-07-21 after David's boredom report)
David's review of the old lessons: slow, a ring spinning while big text sat there, no interaction, no nuance. The ritual SHELL survives (rooms, voice, burn/seal); the pacing law changes: **the user's finger does the work on every screen.** A lesson ships only if it passes ALL of:
1. No auto-advance, ever: every screen waits for a tap; the only timers live inside a body-rep that has a job (a breath round, a hold).
2. ≤12 words on screen per beat (the voice may say a little more; the screen never walls).
3. The mode changes at least every 3 screens: ask → do → build, never three reads in a row.
4. At least one ask-beat deals THE USER'S OWN record as the answers (their blocks, catches, goals). If a lesson can't, it isn't personal enough yet.
5. Output = an OBJECT in state (an algorithm, a loom step, a swap, a scheduled block, a charged card). "Completed" is not an output.
6. Typing only for sacred words (identity line, goal name, say-it-your-way), always optional, chips first.
7. ≤4 minutes at floor dose.
Enforcement mirrors the copy gates (the author never self-approves): the checklist runs in every lesson build-spec review, and stone 1 is rebuilt as the PILOT and device-rated by David before any bead mass-production.

### 3.1 Conversion table (the six worksheets, de-typed)
| Worksheet | Typed beat today | Tap-first replacement |
|---|---|---|
| ws_why | "a year from now, what changed first" | chip-cloud of concrete futures ("I sleep like a person," "deep work is normal," "calmer with people") + optional say-it-your-way line |
| ws_identity | "I'm the one who..." | chip endings + optional own line (kept: identity words are the sacred exception, chips first) |
| ws_obstacle | wish / obstacle / move, all typed | wish = pulled from their active goal (no typing); obstacle = inner-obstacle chips (the fog, the phone pull, the dread, the perfectionism); move = tool chips. **This worksheet IS the algorithm forge in lesson form: finishing it forges a real S.alg entry.** One system, two doors. |
| ws_big3 | (already scales + choice) | keep as is |
| ws_masterday | (already chips + choice) | keep as is |
| ws_algo | "after what... then what," typed | anchor chips drawn FROM THEIR OWN tracked blocks ("after coffee," "after you sit at the desk," the record already knows their day; Duolingo cannot do this), tiny-move chips per domain, reward beat unchanged |

Rx pads (textareas) → pick-#1 cards per the audit's primitive table. Sleep Math keeps its inputs (numbers are honest typing).

### 3.2 The bead pipeline (days 2-N content)
`engine-v1.json`'s 82 beads are the syllabus pool (threads: ritual 26 · worksheet 19 · tool 17 · score 10 · habit 5 · concept 5; tiers: floor 23 · low 26 · medium 24 · high 9). A bead ships as a ritual lesson: **PRIME** (one voiced line) → **DO** (the bead's rep on a REAL surface at floor dose) → **NAME** (the concept card deals AFTER it worked; Conway-Smith: reps first, theory after) → **PLACE** (where it lives in YOUR day: attach to a block, a bookend, or an algorithm) → **SEAL** (charge). Copy is batch-authored on cheap models per chapter, through Gate 1 + Gate 2 against COPY-ANCHORS, BEFORE any Opus wiring session (the operating rule from the gameplan).

### 3.3 WARIO REPS (the interactability thread, resolved)
The past-session idea (2026-07-01 / 07-04 / 07-19 transcripts): deliver some lessons as WarioWare-style micro-games ("when the lesson has to do with being an archer, there's a target"). Sanctioned HERE, with a leash: a micro-rep is allowed ONLY as the DO/CHECK beat of a lesson whose concept IS the interaction. Dev-canon gates apply: 100ms feedback, one thumb, ≤30s, miss-states crafted like win-states, never decorative (no-random-features law). The starting three:
1. **The Range shot** (Target Practice bead, course II.3/IV.1: "artistic archer in a lab coat"): draw, hold, release at a ring; tension maps to commitment; the release schedules the real block. Extends the existing Lesson 4 "Range" stone.
2. **The Swap deck** (energizer-swap bead, IV.4): swipe-sort your real activities into drains/charges; the sorted deck writes the enervator/energizer inventory silently.
3. **The Steady Orb** (equanimity bead, II.3/V.4): keep the breath orb centered while soft distractor pings try to pull it; recovery speed is the score (the Equanimity Game, literally).
Each teaches by hand-feel first and names the concept after. No points for reading.

### 3.4 Depth without Headspace's animation budget
Not first priority (David's own call: unplanned investment). The depth levers already owned: the room system (hearth/mirror), per-lesson palettes, two voice banks, the burn/seal ceremony beats, and LATER the sanctuary as concept-scene stage (image-gen pipeline proven). Animated explainers = post-revenue, founders-era at earliest.

---

## 4. THE COMPOSER + THREADS (days 2-N, alternate journeys, personas)

### 4.1 Already built, do not rebuild (verified in app.js today)
The 8-landmark trail (O→VII, 1:1); jpNodes braid (priority: ritual > course > goal > habit); the appetite dial (dormant/floor/low/medium/high, nodeCap 0-3, consent-gated escalation); the energy-first gate; behavior-evidence advance (`chapterMastered`, never demotes); `blueprint()` persona reader; simpleMode; welcome-back re-gauge; depleted-day pruning. This IS the adaptive spine the audit specced. The gap is only the daily PICK rule.

### 4.2 The Day Composer (the missing rule)
Each day at `journeyTick`, compose at most `nodeCap` items: exactly ONE lesson bead (the glowing next stone: landmark dependency order × the canon-fold journeyPhase weighting: onboarding days bias competence beads, scaffolding weeks bias ownership beads, endgame biases reflective beads) + the braid (today's loom step, algorithm follow-ups, bookends). **The One-Next-Thing law renders literally: one glowing stone, ever.** Everything else on the trail is quiet, and the planner + tools are never gated by any of it (guided-with-an-off-switch).

### 4.3 THREADS: alternate journeys without a second map
A thread is a **bead pool + a composer weighting**, never a new trail (never two day-models). Core thread = the 300-day arc (default, always advancing underneath). Elective threads, unlocked at their dependency points exactly as the course gates its own modules:
- **MEDITATION** (David's named example): pool from the spiritual-progression canon (TMI/Shinzen/Ingram ladder), unlocks after landmark II (response-ability first). On this thread the daily lesson slot draws meditation beads most days; the spine still advances.
- **BREATH** (David's own case): VI.5 pool + the shipped ladder + the algorithm engine's substitutes.
- Later: **PROSPER** (VI.8 pool), **DEPTH** (the plotkin-fold soul-initiation arc: center-of-gravity, chronicle mode; the post-300 endgame, parked to September+).
Choosing a thread = a rare ceremonial FORK STONE, reversible in settings. One next thing stays singular; the thread only changes which pool the next thing comes from.

### 4.4 Personas (hand-held / power / skeptic / newbie, resolved to existing knobs)
- **Hand-held** (mom): appetite low + guided modeTarget + RU dict + simpleMode paths.
- **Newbie**: `blueprint().practiceNovice` → gentlest dose, more why per move (already wired).
- **Skeptic**: register knob → mechanism-first copy (SCRIPT-ENGINE axes), CHECK beats keep honoring the honest no, Science-page citations one tap away.
- **Power user**: the worksheet shelf grows into the LIBRARY (every unlocked bead reopenable, the deck reviewable); appetite high unlocks ceilings (11-min meditation, Weekly Scorecard); manual thread weights in settings LATER, not launch scope.
The composer reads all four from state that already exists (blueprint, appetite, register). No new persona machinery.

---

### 4.5 THE LINES: the rank system (DRAFT 2026-07-21, David's Herbalife riff; awaiting §6 forks 5-7)
The feeling David wants: levels that grant benefits you never had before. The honest chassis: **martial-arts belts, not MLM tiers**. Rank is earned by lived reps only, can never be bought, never decays. The locked menu design's gem-bar rank banner (STYLE-NEW-ERA, 2026-07-20) is this system's UI slot, already designed.
- **A line = one practice**, tracked as an RPG skill. v1: breath, meditation, movement/stretch, gratitude, the close itself; water as the lone manual-tap pilot (no HealthKit in a PWA; standing/sport wait for the wrap or calendar-block inference). Line ≠ thread: threads pick tomorrow's lesson, lines certify accumulated practice. The same rep events feed both.
- **Levels = evidence doses.** Each level card shows the dose, the capped claim, and the perk. Example, Breath L3: "the study dose: 5 min/day, 24 of any 30 days (Balban 2023: mood up, resting respiratory rate down)." Meditation L4: the classic 8-week MBSR dose, phrased "the dose the studies used," never "this rewired your brain." Locked cards are visible up front: the future-achievement pull is the point. Thin-evidence domains (water cognition, etc.) get honest felt-report framing or no science framing at all (credibility law; the skeptic persona reads these cards).
- **Windows, not streaks.** Thresholds count reps inside rolling windows ("24 sessions in any 30 days") plus lifetime totals. Progress never resets, rank never drains (never-punish; the two locked streaks remain the only streaks). Countable reps per day are capped (no grind-gaming; anti-engagement moat). No leaderboards, no decay, no FOMO windows, no purchasable rank.
- **Perk taxonomy** (every level pays in at least one): (1) **capability**: tool ceilings and depths, algorithm slots, stats views (rank makes a ceiling AVAILABLE; the appetite dial still decides what gets OFFERED; core basics never rank-gated, floor law). (2) **world**: sanctuary/garden species, groves, weather (the garden is the trophy shelf, rendered). (3) **economic** (FORK 5): curated premium packs earnable at high ranks ("what others pay for, you earned"); the flagship paid magnet (B6 architect, subscription) is never earnable. (4) **identity**: the gem in the rank banner + the guardian's register maturing (teach → mirror → chronicle: never-hands-over made visible). Level cards name the REAL reward first (the body/brain change), the game reward second (the receipt).
- **Ceremony:** rank-ups announced at PM close or next open, one ceremony (charge + gem drop into the banner), never toast-spam mid-scroll.
- **Data:** `S.lines = {breath:{reps, rank, windows}, ...}`, additive schema; reps derived from existing logs, no manual claiming anywhere.
- **Build:** September founders era, after the Day Composer (R1 data + gem banner, R2 perks + ceremony). Rides existing logs, non-regression-zone.
- **Perfection criteria:** unfakeable (reps only) · unloseable (ratchet) · means something real (evidence doses, capped claims) · pays in function and world, not numbers · never punishes · one glowing next level per line, quiet otherwise · composes with existing systems, no fifth subsystem.

### 4.6 THE PRACTICE ENGINE (added 2026-07-21, David's meditation-nuance riff)
Thesis line (David's, adopted): **the app teaches one instrument, the human body; styles are strings.**
EVIDENCE: mom's live reaction (2026-07-21, the second real-user line in this doc): offered a 20s then 30s then 20s sequence, she was impressed the app "acknowledged her low attention span" and said she would not have committed to more. Tiny-dose + consent now validated at N=2 (David's smoke case, mom's attention case). Tiny Habits enacted, not quoted.

**1. The ladder: three tiers of what a session IS**
- **T1 STILL** (the attention gym; Headspace's zone): anchor + return. Skills: settle, notice, come back.
- **T2 INSIGHT** (the part Headspace waters down; David's suspicion matches Harris's own critique): metacognition explicit, looking AT awareness, per Waking Up + the TMI/Shinzen/Ingram ladder already in the spiritual-progression canon. Unlocks after T1 stability.
- **T3 ACTIVE** (the Robbins-priming / Stutz-tools / metta-generation CATEGORY; the Crowley willed-change register is already our grimoire form): sessions that GENERATE states, and MOVES that answer situations. **Every T3 move is if-then shaped, so the Algorithm engine (§1) dispatches them as move-chips**: the catch is the trigger, the active meditation is the move. One system, not two.
- Copyright law holds (2026-07-12 pivot): ALTER-original scripts in these categories, authored against the actual source texts on cheap models at build time, never verbatim, no credits implied.

**2. The dose engine (beats Headspace's calendar math)**
Headspace increments by calendar (ten days per +5 min). Ours: capability + consent.
- Start at the mom-dose (20-30 second acts) and never apologize for it.
- Promote only when BOTH hold: completion evidence inside a rolling window (Lines mechanics, §4.5) AND a consent tap ("thirty more seconds tomorrow?"). The ask itself is the ceremony.
- Dose grows by ADDING ACTS via composeMeditationSegs (more settle, longer silences per the existing density knob, new act types as tiers unlock), never by uniformly stretching one act.
- Wobble (abandons, skips) → the app OFFERS a step down in one line, no ceremony, never imposes.
- **RANK ≠ DOSE.** The gem (§4.5) is forever; the dose is today's setting. This split is what makes regression shame-free.

**3. The comeback (first-class, not a fallback)**
David's law: anyone can regress from twenty minutes to zero for a month; the app must handle it perfectly, forever. The welcome-back re-gauge (§4.1, already built) gains a designed ceremony: re-gauge → auto-lowered offer → comeback register ("we start where you are, not where you were") → dose re-climbs on the same evidence + consent engine. Rank untouched; no streak exists to have died (windows law). Name this on the founders page: it is a differentiator no engagement app can copy, because their business model needs the shame.

**4. Doors (for the "I can't meditate" user)**
The tree under every style trains the same core skills (settle, notice, return, allow, generate). Breath-focus is A door, not THE door (trauma-sensitive mindfulness literature legitimizes non-breath anchors; some nervous systems find breath-watching activating; see also David's stuffy-nose case). After repeated abandons of one style: the TASTE-FLIGHT (three 60-second samples: sound / body / metta / active), pick by felt fit, re-door without remedial framing. "Straight to the advanced love meditation" renders honestly: the metta door has its own kindergarten; doors reorder the curriculum, they never skip the skills (music-instrument law: start on drums or piano, you still meet rhythm and pitch).

**5. The delivery unification (the player and the stack): the journey's default vehicle**
Most practice days, the day's bead arrives INSIDE the session, not as a separate screen lesson. composeMeditationSegs composes it into the player (HOME=PLAYER law): one-breath settle → tiny speech beat (the bead's line, 7-15s) → practice acts at current dose → the seed line placed at a receptive moment → close → ONE optional tap after (PLACE: attach to a block or algorithm). Screens-grammar lessons (§3) remain for forge/build days; the lint (§3.0) governs the before/after screens. Eyes-closed personas (girlfriend, mom) fully served. The 82-bead pool is speech-seed sized, so the whole 300-day arc can ride the daily sit: Headspace's course-in-meditation mechanic, but composed per person (dose, door, thread, current goal) instead of fixed calendar order.

**6. Goals braid guardrail**
Weekly preview/review renders as a 3-minute REVIEW SIT in the player (bouquet → Big-3 → one block scheduled). Loom steps braid per §4.2. HARD GUARDRAIL: "use the app more" is never a goal, a reward target, or a line level. Early calibration quests ("track four blocks so the mirror has glass") are capped, framed as tuning the instrument, and END. We reward reps that map to life, never minutes in app (the moat). The second brain is already the shape: loom + planner + record, with B6 as its conversational author in September.

**Slices:** P1 dose engine on the existing ladder (evidence + consent, comeback ceremony) · P2 session-lessons (bead-in-player renderer) · P3 taste-flight + doors · P4 the T3 active library (post copy-mining). September order: P1-P2 fold into the Day Composer slot; P3-P4 after the Wario reps.

---

## 5. SEQUENCE + ROUTING (composes with the launch calendar, does not reopen it)

Launch-critical stays exactly MASTER-GAMEPLAN §3A: **B1 → B4 → B3 → B9-lite, freeze Aug 8.** This spec is the September founders-era stream, with ONE candidate exception:

- **A1-lite pre-freeze (DAVID FORK 1, rec: yes):** one Opus session, non-regression-zone, additive state, and the founder dogfoods it hourly (his own smoke case, live data before launch, and the best possible weekly-founder-update story). It takes the "if slack allows" slot the gameplan currently gives P-A paint. If the slack never materializes, it slides to Sep with everything else, no drama.
- **September order (each spec-first, one-shot Opus, copy pre-gated on cheap models):** A2-A3 (forge + mirror) → L1-L2 (loom + projection) → WS de-typing pass (§3.1, mostly copy + rewiring) → B6 architect against the loom shape → the Day Composer + first thread (with B5 stone-1 as its proving ground) → the three Wario reps → depth arc later.
- Effort law: HIGH only for the Composer (touches journeyTick) and B6. Everything else rides LOW/MEDIUM.
- Model law: this doc = Fable thinking. ALL builds = Opus. Copy = sonnet author + haiku judge through both gates. Tripwire 7 honored.

---

## 6. DAVID'S PICKS (kept to four)
1. **A1-lite pre-freeze?** Rec: yes, it takes the slack slot (P-A paint slides). Otherwise all of it opens the founders era in Sep.
2. **The in-app name for a user-authored if-then:** "Algorithm" (course-native, David's own word, scientific-grimoire register; REC) vs "Key" vs "Move". (The capture moment itself is "the Catch", already soul-canon.)
3. **Loom vs S.goals:** unify into one goal model (rec) or bridge them. Build-spec decision; flagged so it is never accidental.
4. Confirm §2.4 as the sharpened free/paid line inside the Jul 26 founding-offer verdict (manual loom free, AI architect paid, "arrives September" named honestly on the page).

**Added 2026-07-21 (the Lines, §4.5):**
5. **Economic perks:** none (safest for revenue) vs curated earn-what-others-pay packs at high ranks (REC) vs permanent rank discount on the subscription. Founders unaffected either way.
6. **Rank metaphor:** Gems (REC: the locked menu banner is already a gem bar, and it is game-piece language) vs Belts/Circles vs Elements.
7. **v1 scope:** five auto-tracked lines + water manual pilot (REC) vs trim to three lines.

## 7. WHAT THIS SESSION DID NOT DO
No code. No shipped copy (every user-facing line above is DRAFT register; Gate 1 + Gate 2 before any surface). No new day-model, no new trail, no 17th re-derivation. The smoke report is saved as founder evidence; the therapist worksheet is distilled into §2; the Wario thread is grounded in the actual past-session quotes.

**David can run his own first algorithm TODAY with zero new code:** IF the urge or the rolled one in sight, THEN the guided breath ladder (v1126, in the breath picker) first, then choose freely. Plus the one environment move: park the rolled one out of sight across the room. That is the engine, manual edition; the build just removes its friction.

---

## 8. IDEA SHELF (Claude's turn, 2026-07-21 evening; UNVERDICTED, David picks which graduate)
1. **TRIALS (N-of-1 self-experiments).** The Dad Law productized: hypothesis → dose → 7 days → the record writes the verdict. Seed: David's own "2-joint vs 3-joint day, fog at close." Serves the skeptic persona (they test, not believe); composes with catches + lines + close; a completed trial plants a proof tree in the garden. EVIDENCE: N-of-1 trial methodology (medicine's single-case design); catch data already flowing.
2. **RELAY + VAULT (messages across time).** PM close leaves one line for tomorrow-morning-you (Relay, daily); write-once letters that unlock at MILESTONES not dates ("readable at Breath L3") make rank rewards carry your own voice from day one (Vault). Time-symmetry principle made emotional. EVIDENCE: Hershfield future-self-continuity work. Tiny build; bookends exist.
3. **THE RETURN COUNTER.** The anti-streak stat: "times you came back: 14." Grows exactly where other apps shame you. Rides the comeback ceremony (§4.6), one counter + one gated line of copy. EVIDENCE: Neff self-compassion → higher return rates (psy canon).
4. **THEIR-WORDS ENGINE.** The guardian gradually adopts the user's own vocabulary (say-it-your-way lines, goal names) into its speech. MI law: their words beat ours; the mirror starts speaking in your language. Template-slot build, no new surface.
5. **BOUQUET SHARE CARD.** The only social ALTER ever does: one beautiful weekly-close image, share-only (no feed, no likes), palette-locked. Accountability-dyad effect + the organic content engine for launch. EVIDENCE: witness/commitment literature; Ava pipeline needs artifacts.
6. **CHRONICLE PAGES (the year-grimoire).** Quarter close binds one guardian-prose page from the record; a year binds a book; someday a printed heirloom (post-launch revenue). Never-hands-over endgame (teach → mirror → chronicle) made physical. Page v1 is small: composed from existing close data through both copy gates.
KILLED at the door: leaderboard-anything (moat), chronotype system (it is one composer weighting rule, not a feature), sound-identity layer (real, but polish-era). Sequencing: nothing here touches Aug 8; graduated picks slot into September behind the §5 order.

**DAVID'S VERDICTS (2026-07-21 evening):** 1 TRIALS = in, think deeper (see §9.17). 2 RELAY+VAULT = in. 3 RETURN = "genius", deepen: make returning itself the pull (see §9 tier II). 4 THEIR-WORDS = conditional: scope to users with explicit goals. 5 SHARE CARD = rework, cadence not necessarily weekly. 6 CHRONICLE = "nobody reads books": pivots to the OBSERVATORY (sophisticated free/paid data-processing surface, §9.19) + ambient seasonal pages (§9.22). Free/paid tier deep-dive PARKED to the Jul 26 founding-offer session (David: boring now).

---

## 9. THE LADDER OF THIRTY (2026-07-21 night; Claude ideation, UNVERDICTED; ordered shallow → deep)
**Tier I, hand-feel:** 1 Friction editor (20s audit per algorithm) · 2 One-breath door (molecular open on depleted days) · 3 Negotiating snooze (one floor counter-offer, never twice) · 4 Ghost blocks (yesterday's plan as faint ghosts, drift without shame) · 5 Charge carry (abandoned session charge flows to tomorrow's seed) · 6 The thread (gaps thin it, returns rethicken; windows made visible).
**Tier II, the return made magnetic (the §8.3 deepening):** 7 Return pays double (first session after a real 7d+ gap = 2x Spark, once per 30d) · 8 Comeback arcs (returning UNLOCKS a 3-day mini-story; absence never locks anything) · 9 The fire drill (rehearse the comeback while strong; the note future-fallen-you receives; Marlatt relapse rehearsal + Vault) · 10 The lighthouse (after 7 silent days, ONE guardian ping ever, then quiet comeback-mode home).
**Tier III, urges + inner cast:** 11 Urge-surfing wave (90s live crest-and-pass player mode; Bowen/Marlatt) · 12 Demon naming ceremony (name the saboteur; catches address it by name; Stutz Part X, narrative-therapy externalization) · 13 Two-wolves ledger (each catch tags which voice won, in their names; the inner-cast map) · 14 Craving forecast (silent pre-positioning: home defaults to breath at 1:50pm before the 2pm fog; never announced).
**Tier IV, practice science:** 15 Deload weeks (periodization; every ~4th week auto-lightens; rest enforced by design) · 16 The floor vow (one personal never-zero: one breath; terrible days show only it) · 17 TRIALS upgraded (canon-sourced trial templates + real baseline/intervention ABAB structure + auto-verdict in guardian prose) · 18 Pattern bounties (app pays Spark when you confirm/refute its hypothesis about you; co-scientist consent).
**Tier V, the mirror grows up (the §8.6 pivot):** 19 THE OBSERVATORY (the named data surface: free = weekly whisper; paid = cross-correlations, trial suggestions, monthly State-of-You; pricing parked to Jul 26) · 20 The almanac (stats as grimoire almanac: mythic form, statistical content) · 21 Fresh-start engineering (clean-slate archive: record keeps, surfaces release; timed to temporal landmarks; Milkman) · 22 Seasons of self (quarter theme skins the garden biome; chronicle becomes ambient seasonal pages, not a book).
**Tier VI, presence without social:** 23 Witness seat (ONE person holds your vow; sees vow + returns only; hears return-news first) · 24 Founders' candle (anonymous ambient glow when any founder closes their day; sangha/body-double effect) · 25 The inheritance (gift a starter-grimoire: your algorithms + a letter; mom→sister loop).
**Tier VII, time + identity:** 26 Time-capsule blocks (planner blocks that arrive as mail from past-you) · 27 Identity receipts (record-granted, irrevocable identity cards with evidence filed) · 28 Two-futures fork (quarterly extrapolation of current vs trained slope from real data, both framed as yours; Rohn without doom).
**Tier VIII, the deep end:** 29 The dream door (PM intention → optional pre-sleep track built on consolidation science, claims capped hard; Yapko-informed) · 30 THE CHAIR TURNS (NPC→Player endgame: at high rank the user authors guardian lines for their own future hard days; the final graduation is becoming the voice).
