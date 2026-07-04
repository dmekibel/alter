# THE DEPTH BUILD — full spec (greenlit 2026-07-04, David: "let's go… greatest most powerful app in the world")

*The execution paper for everything decided in the depth marathon. Sources of record: `DEPTH-GAMEPLAN-2026-07-04.md` (the system), `SIMULATION-ALL-USERS-2026-07-04.md` (the felt experience + persona routing), `_mined/*` (deck-v1, mechanisms, thinkers-organs, inductions-pools), `_course/ALTER-APPLICATION.md`, `engine-v1.json`, `ONBOARDING-V3-LOCKED`. Build sessions: read `alter/CLAUDE.md` first, then THIS file, execute ONE wave per session, device-check between waves. Recommended session model for build waves: Opus (routine build); Fable only if a wave touches the timeline regression zone (none of Wave 1 does).*

---

## §0 CONSTITUTION ADDITIONS (all greenlit — these are LAWS now)

1. **THE ONE-SKILL THESIS.** The entire app trains one motion — *notice the gap, choose inside it* — in a thousand costumes. Every new feature must be traceable to a rep of this motion or serve one of the existing soul principles; otherwise cut. (Frankl + Withers + Stutz + Conway-Smith + our catch-is-the-unit law, all converging. SN-227/SN-044.)
2. **GAUGE = THRESHOLD METER.** The 0–10 state read is a metacognitive-threshold gate, not a mood widget. It routes which VOICE may speak: low → retreat+therapist only (biology can't do awareness work — Conway-Smith); mid → coach; high → sergeant allowed. Register dial (soft/straight/push) modulates SERGEANT AMPLITUDE ONLY; therapist and retreat are register-invariant.
3. **THE MANTRA LAW.** A mantra is never typed into a field. It is BORN inside a Rewire session (settle→picture→seal — feeling attached, Withers: "words without feeling record nothing") and INSTALLED nightly at the pre-sleep window with the user's OWN evidence as the picture (Goddard/Maltz/Dispenza — same doorway).
4. **CHORES ARE FIRST-CLASS.** The Reset sprint + two-part chore chains are core infrastructure (mom's work-domain, brother's mastery quest, David's room). Life admin gets the same intelligence as deep work.
5. **WIDE-DAY SILENCE.** The app proposes recovery blocks (Carpe Rhythms: recovery is designed, not earned) and is FULLY SILENT during them. The guardian's absence is the trust.
6. **THE EMOTIONAL LADDER.** Comeback offers climb ONE rung (Withers' scale: despair→fear→anger→doubt→hope→enthusiasm→joy). Never joy offered to despair. Anger is an upgrade from despair — never scold it.
7. **NO NPC-TREADMILL GAMIFICATION.** From mechanisms.md cross-cutting laws: variable-ratio rewards, unpredictable notifications, and social-comparison surfaces are cortisol/dopamine exploits. ALTER's rewards stay PREDICTABLE, EARNED, and honest. One nudge per day maximum stands forever.
8. **EIGHT SCIENCE LAWS** (mechanisms.md) bind all breath/sleep/light/reward design: exhale-longer-than-inhale · morning-light-first · regulation-before-reprogramming · sleep-as-consolidation · perceived-safety-is-biology · gut-is-upstream · dopamine-wave-pool · ventral-vagal-is-default.

## §1 ARCHITECTURE — the nervous system

```
ONBOARDING ──writes──▶ PROFILE (dose ceiling · register · year-words · good-day
                        ingredients · blocker · pact · theoryMode)
                              │
        ┌─────────────────────┼──────────────────────┐
        ▼                     ▼                      ▼
   MORNING DOOR          THE SEQUENCER          MOMENT-LISTENER
 (switch·breath·word·   (braids ≤nodeCap        (triggers → ONE tool
  gauge → voice gate)    nodes: acute→bookend    at the user's dose;
        │                →chapter bead→goal      1 nudge/day)
        ▼                →chain→celebrate)             │
     THE DAY  ◀───────── JOURNEY renders ──────────────┘
  (planner/cockpit —     the braid as world;
   blocks, sprints,      chapters unlock
   chains, tools)        MECHANICS
        │
        ▼
   PM CLOSE v2 ──▶ EVIDENCE LOOP: TLM pings · dayRating · THE RECORD
  (win/learn/rating/     (efficacy deltas) · DECK deals · chronicle
   WOOP · INSTALL)
```

**New/changed state (SCHEMA bump + migration REQUIRED — silent shape change wipes David's data):**
- `P.words` (year-words, from onboarding delta) · `P.ingredients` (good-day chips) · `P.theoryMode` ("cards"|"proverbs"|"off", derived: ceiling→cards, floor→proverbs)
- `S.dayClose[k] = { win, learn, rating: "master"|"ok"|"rebound", woop:{o,p}, installed:1 }`
- `S.deck = { dealt: {cardId: k}, lastDealK }` — a card never repeats within 30 days; per-moment rotation
- `S.mantra = { line, bornK, method:"rewire" }`
- `S.chains = [{id, title, step2title, step2delayMin, armedAt}]`
- `S.nudge = { lastK, muteUntilK }` (muteNudgeUntilK exists — unify)
- `S.sfShown` (soul-force surface mode)

**THE DECK as data:** transform `_mined/deck-v1.md` → `WISDOM_DECK` const in app.js: `{id, moment, card, proverb, src}`. **B4 LAW: every card AND proverb ships with RU dict same commit** (~41×2 strings — the single biggest i18n lift of the build; translate per-wave, never ship EN-only). `dealCard(moment)` picks by moment + rotation + theoryMode; renders as the existing guardian-line surface (ob-eline grammar / cockpit card) — NEVER a modal interruption; always attached to a moment that just happened.

## §2 WAVE 1 — the day-1 organs (ONE build session)

### ORGAN A · ONBOARDING DELTA (+2 GLANCE questions)
- Q into ENERGY section: "Your good days — what's usually in them?" multi-chips (slept enough/moved/quiet morning/had a plan/good people/music/started early/time alone) → `P.ingredients`. (Heroic Protocol + Energizers audit at GLANCE dose.)
- Q closing YOU section: "A year from now, someone who loves you says you've become…" pick ≤2 (calmer/stronger/a builder/consistent/more present/freer) → `P.words`. (The eulogy compressed; death removed, mechanism intact.)
- Same V3 grammar: solid berry tiles, toggle+Next, confetti on section complete only. Both feed engines (comeback protocol; TLM vocabulary). RU dict same commit.

### ORGAN B · PM CLOSE v2 (the most valuable 60 seconds)
Beats (overlay on cockpit stage, no innerHTML wipe of the timeline):
1. **WIN** — chip list generated from today's real logs ("which was the day's real win?").
2. **LEARN** — chips from the day's actual friction (postponed block titles, drift windows, "nothing") — never free-text at floor.
3. **dayRating** — three solid pieces: Masterpiece / OK / **Rebound**. LAW: on a low-gauge day, Rebound scores ≥ Masterpiece (earn parity + guardian line). Sources: Johnson's Rebound-Day + GSP "playing badly well" (SN-222) + catch-is-the-unit.
4. **TOMORROW'S ONE THING** — tap a block → "what's most likely to kill it?" chip → "when that shows up, you'll…?" chip. (Full WOOP, never named.) Writes armor onto the block (shown as a small shield pip on tomorrow's bubble).
5. **THE INSTALL** — screen dims candle-dark; one breath (exhale longer); the user's mantra line + a 3-second replay of today's best charge printing (their OWN evidence as the picture). 20 seconds, skippable forever. If no mantra born yet → this beat is a soft door to Rewire ("want a line of your own? 3 minutes, once").
6. **DECK deal** — one card/proverb matched to the day's shape (pm-close moment; rebound day → SN-007/SN-107 family).
Floor dose (mom): beats 1+3 only, two taps, proverb, done. Ceiling: all six.
Region: new `pmClose()` beside the bookend code; reuse beatRunner grammar. Verification: DEV.stage('pm') drill + screenshots; earn() parity test for Rebound.

### ORGAN C · RESET SPRINT + CHORE CHAINS
- **Reset**: a tool (toolbox + plannable block): pick zone chip (one surface/floor/desk/sink) → 10-min timer + music underlay → before/after feel-tap (space 2→4 delta stored to THE RECORD). Framed as regulation/care, never duty. Solid-piece UI, domain = home.
- **Chains**: creating a chore with a second half (laundry/dishwasher/dough) plants step 1 as a 1-minute block NOW and AUTO-PLANTS step 2 at +N min (app carries the second half; re-ring once, gently). `S.chains` + a chip in the block editor ("this has a part 2 →").
- Morning-door/gauge one-time profiling chip: "Your space right now?" (clear/lived-in/full chaos) → chaos seeds a Reset block offer into plan-day (once, not nagging).
Verification: preview drill create chain → confirm step-2 block appears; timers fire (device-untested for background timing — flag).

### ORGAN D · MOMENT-LISTENER v1 (trigger → ONE tool)
A small rules table run on events already logged (READ-ONLY on timeline internals — zero regression surface):
| trigger | detection | tool handed (at dose) | source |
|---|---|---|---|
| task postponed 2× | block dragged forward twice same day | MOTIVATION DIAL: 4 chips (can't start/doubt it/bored/empty) → shrink-to-first-action / show past evidence / novelty swap / rest ritual. Default route pre-set by profile (brother→can't-start, sister→bored). | Motivation Equation II.3; SN-219 procrastipain feeds the "can't start" card |
| drift detected | existing drift logic | the Off-Ramp (90s: breath + Withers gap-interrupt line "wouldn't it be nice if…") | SN-227 toolkit |
| temptation logged | user taps the new "urge" chip on the live pill / cockpit | **+3 CATALYST**: logging the urge IS the highest-scoring single move; offers the paired swap. | V.3 pearl habit; catalystCard stub app.js:479 |
| comeback (return after gap) | existing comeback catch | emotional-LADDER comeback: offer = one rung up, built from `P.ingredients`; card SN-007/verb-not-noun | Withers scale; Prior Best |
| pre-sleep window | Sleep-math-lite: bedtime estimate from wake history | Tranquility offer: wind-down stack (never a nudge if wide-day/mute) | IV.2; tranquility algorithms |
LAWS: max ONE nudge/day total (S.nudge), respects muteUntilK, NEVER fires during wide-day blocks, every tool arrival = "hand one tool, never a menu" (soul routing seam). After a tool WORKS (completed), deal its theory card (theoryMode-gated) — the metacognition engine: name the mechanism AFTER it worked.

### ORGAN E · TLM PINGS with THEIR words
`triggerTLM` (exists, app.js:4297) upgraded: on aligned completion, stamp with a word from `P.words` ("that's the builder"), rotating, ≤2/day (dopamine-wave-pool law: rewards must not become wallpaper). RU dict. Deck cross-deal: first-ever TLM → SN-091 identity-votes card.

**Wave 1 exit criteria:** David's simulated Day 1 fully playable: door question → plan across domains → TLM ping → Reset+chain → one drift nudge max → PM close all 6 beats → install → deal. Zero console errors; all new copy passes reward-never-shame lint (ban: should/must/wasted/failed/missed); all UI passes solid-pieces/no-neon/gold-earned/big-friendly laws.

## §3 WAVE 2 — the week organs

- **ORGAN F · MORNING DOOR unified**: switch (3 body beats) + 1-breath word prime (inhale word, exhale settle — Virtue Meditation rung 1, the course's #1 practice at its smallest dose) + gauge tap → voice gate for the day. Floats to real wake (time-symmetry; brother's 12:30 is not shamed). Existing ritual engine hosts it; morning-light-first law in copy.
- **ORGAN G · WEEK SEAL**: Sunday PM close grows one screen. Ceiling: GOLF CARD (behaviors × 7 days, birdie/bogey, "under par is an event not a verdict") + "+1 next week?" chip from bogey pattern. Floor: the garden grew (no grid ever). Deck: week-seal cards (SN-243 domino, SN-094 plateau).
- **ORGAN H · WORKSHEET PACK v2** (WS_REG additions, 4-screen grammar, ACTION stamp law — every sheet ends with a 10-second body act):
  1. **TWO TUESDAYS** — best/worst ordinary day chips → computed delta as 3 cards ("the difference is 3 choices, not a new life") → pick one → IT BECOMES A BLOCK tomorrow. Evidence-first upgrade: once ≥14 days of logs exist, screen 1 SHOWS their actual best day instead of asking.
  2. **THREE TARGETS** (goals intake, day 2-3): ceiling 3 / floor 1 target; each = area chip + ONE next brick + WOOP armor; planted as journey quest-lines.
  3. **YOUR WORDS tournament** — expand P.words to 5 via forced-choice pairs (8 taps, Duolingo-style) — the VIA assessment as a game; feeds TLM + mantra + guardian vocabulary.
- **ORGAN I · REWIRE→MANTRA wiring**: Rewire's seal beat offers "keep this line" → S.mantra; the backlog daily-repeat loop = the PM INSTALL beat (already built in Wave 1 — just connect).

## §4 WAVE 3 — the depth organs (directional; spec-before-build per organ)

- **Journey chapters 1–4 as capability unlocks** (Switch/Two Tuesdays/Wall/Your Words → earned Toast door) wired through the SEQUENCER (engine-v1.json — the braid exists, unwired). Progression = capability, never consumption.
- **Soul Force surface**: default = world-growth physics (seed/world grows faster on consistency; the exponent FELT not shown); ceiling users get the raw number in the You-tab. (Computed at app.js:4293 already.)
- **Personal battery physics**: P.ingredients + an enervators audit modulate the timeline battery's charge/drain rates. (Energy > time, personalized.) HIGH-RISK: touches timeline paint — Fable session, regression contract full re-check.
- **Thinker organs by mined ranking**: Clear identity-anchored habit installer (refuses too-big habits) → Walker sleep math cascade → McKeown BOLT score → **Carr doomscroll belief-dismantler** (5-min read-through flow; "you're not weak, you're outgunned" opening — SN-152; belief dismantling not willpower) → Childre coherence upgrade → flow session builder → Pressfield Resistance compass → Dweck copy-law refactor.
- **POOLS recording batch**: per inductions-pools verdict — Tony tapping transcripts primary; induction library → ARRIVE/INSTALL/FORGET phrase patterns + the EXPLAIN channel pool. (Rides GAMEPLAN-TOOLS-1000X R2.)
- **Deck coverage gaps** to fill with new mining: relief-door welcome card (the depleted user, no agenda), breathwork completion cards, first-day-ever win card.

## §5 PERSONA ROUTING (parameters, never forks)

| param | David (ceiling) | brother (SIP) | sister (SIP+) | mom (floor) |
|---|---|---|---|---|
| theoryMode | cards | cards-blunt | cards-light | proverbs |
| nodeCap | 3 | 2 | 2-3 | 1 |
| targets | 3 | 1 | 2 | 0 (implicit) |
| week seal | golf | golf-2rows | golf-cosmetic | garden |
| drift default | — | can't-start | bored | (never diagnosed aloud) |
| sergeant amp | push | straight | soft-playful | 0 |
| deep doors | day 2+ | by invitation | by streak | never pushed |

## §6 VERIFICATION, RISKS, SOUL LINTS

- **Per-organ preview drills** (DEV hooks: extend DEV with `DEV.pmClose()`, `DEV.trigger('drift')`, `DEV.dealCard(moment)`). Screenshot-verify vs the simulation's described beats. Gestures/timers = DEVICE-UNTESTED, say so.
- **Regression:** Wave 1-2 touch ZERO timeline paint/gesture code (moment-listener is read-only; PM close is an overlay; chains create ordinary blocks via existing paths). Re-check the 4-point contract anyway on any ship that plants blocks (chains, Two-Tuesdays choice).
- **No new wipe-and-rebuild surfaces**; targeted node updates only. SCHEMA bump + migration + a load() round-trip test on a copy of real state.
- **Soul lints on every new string:** reward-never-shame word ban · one nudge/day · no emoji, Tabler only · solid pieces/no-neon · gold earned-only · big-friendly (≥13.5px body) · EN source + RU dict same commit · guardian = witness voice (never "I saved you", never counts what you wasted).
- **Budget law:** one wave per session; ship verified subsets; half-shipped-verified > fully-drafted-unverified.

## §7 WHAT "CHANGING THE WORLD" MEANS HERE (the success test)

Not a metric dashboard — four felt moments, one per person:
- David, night 1: the install beat plays his own morning back to him and the line lands. He wants night 2.
- Mom, day 3: she taps Rebound and is told coming back IS the skill. She doesn't feel managed; she feels seen.
- Brother, Friday: he logs the urge instead of the scroll and the app calls it the best move of the day. The inversion clicks.
- Sister, week 2: the bored-route swap arrives before she churns. The app noticed before she did.
Every one of these is the same skill — the gap, noticed, chosen — wearing four costumes. That's the app. That's the whole app.

---

## §8 BUILD LOG — WAVE 1 (append-only status; this spec is the source of record, no separate handoff)

**Session 2026-07-04 (Opus) — shipped v890 + v891. Felt-Day-1 subset (David chose this ordering).**

SHIPPED + VERIFIED (preview; gestures/feel device-untested):
- **Foundation (v890)** — SCHEMA 3→4 + `prevSchema<4` migration, round-trip verified on a real v3 save (blocks + spark survived). New lazy-guarded state: `P.words` · `P.ingredients` · `P.theoryMode` (ceiling→cards/floor→proverbs) · `S.dayClose` · `S.deck` · `S.mantra` · `S.chains` · `S.nudge` · `S.tlm`.
- **THE DECK (v890)** — `WISDOM_DECK` const, 8 Day-1 cards (pm-close/pm-close-hard/rebound/comeback/first-vote/catch) each EN+RU per B4. `deckPick()` = predictable oldest-first 30-day no-repeat (law 7); `renderDeckCard()` never modal. **Remaining: the full 47-card transform from `_mined/deck-v1.md` lands with the moment-listener (Organ D) — each card still needs its RU same-commit.**
- **ORGAN A (v890)** — onboarding delta: `words` Q (cap 2, closes YOU) + `ingredients` Q (into ENERGY), V3 grammar, RU dict. Renders (verified). Feeds TLM + comeback.
- **ORGAN E (v890)** — `pickTLM` weaves `P.words` ("that's the builder"), rotating; `triggerTLM` caps ≤2/day; first-ever ping arms `S.deck.pendingVote` → SN-091 dealt at next pm-close.
- **ORGAN B (v891)** — PM CLOSE v2, evolved the CKPT-PM bookend in place (overlay, zero timeline paint). 6 beats verified end-to-end: win(real-log chips) → learn(friction chips) → rating(Rebound parity earn + guardian line) → tomorrow(full WOOP → armor on block) → install(candle-dark crown + mantra soft door) → deal(day-matched card + first-vote cross-deal). `S.dayClose[k]` + `bk.pm.done` written; DEV.pmClose/dayClose hooks.

SHIPPED + VERIFIED (v892, same session):
- **ORGAN C (v892)** — Reset sprint (toolbox tool: zone → before-feel → 10-min countdown + bed → after-feel; space delta → THE RECORD `S.tools.gauge` stack:reset-space + logs a Reset·zone upkeep block; CARE framing). Chore chains (block-editor "this has a part 2 →" → `plantChain()` plants step-2 at step-1+N via the safe path + records `S.chains`; verified: arm → S.chains + step-2 block planted). One-time morning "your space right now?" → chaos → single gentle Reset offer. iOS background timing DEVICE-UNTESTED (flagged).
- **ORGAN D (v892)** — moment-listener v1, read-only, zero timeline regression surface. Gate verified (≤1/day, mute, wide-day). Tools each hand ONE move + deal a theory card after it works: off-ramp (drift→SN-227), comeback ladder (return→one rung up from `P.ingredients`→SN-007, verified visually), tranquility (pre-sleep), motivation dial (postpone→4 routes, default by profile). +3 CATALYST urge chip on the cockpit (bypasses the gate — user action). `checkMoments()` runs one passive scan after the daily gauge.

**WAVE 1 COMPLETE** (v890 → v892, one Opus session 2026-07-04). Every organ preview-verified, zero console errors; timer/gesture feel + iOS background timing DEVICE-UNTESTED — David testing on phone, notes incoming.

STILL OPEN (future waves / follow-ups):
- **Full 47-card deck transform** from `_mined/deck-v1.md` (Wave 1 shipped 8 Day-1 cards; the rest ride into the moment-listener's trigger coverage). Each card EN+RU same commit.
- **WOOP shield-pip** on tomorrow's bubble (armor DATA already written on the block) — needs a timeline-paint touch → Fable/timeline-safe pass, not an Opus build day.
- **Drag-based postpone auto-trigger** for the Motivation Dial (editor time-nudge path works; drag needs a safe choke point in the move handler).
- Persona/dose plumbing present (`pmFloor()`, `deckMode()`, nodeCap, `profile.mlDrift` route default); full §5 persona routing table wired per-organ as later organs land.

---

## §9 BUILD LOG — WAVE 2 (same session 2026-07-04, Opus; timeline-paint-free)

SHIPPED + VERIFIED:
- **ORGAN I (v893) — Rewire→Mantra wiring:** a completed Rewire offers "keep one line as yours?" from candidates seeded by the user's year-words (never a blank field — mantra law) → `S.mantra={line,bornK,method:rewire}`. PM install soft-door "Make my line" now runs Rewire → this loop → installed at the (Wave-1) INSTALL beat next night; install shows `tr(mantra)`. Verified.
- **ORGAN F (v893) — Morning Door unified:** 60-sec switch — 3 body beats + a 1-breath word-prime (inhale a `P.words` word, Virtue Meditation rung 1) + morning-light-first close → onFinish opens the gauge (voice gate). "Switch in" cockpit chip in the morning phase. Verified: beats render, word-prime personalizes.
- **ORGAN H3 (v893) — Your Words tournament:** VIA-as-a-game, 8 forced-choice pairs over a 10-word pool → top-5 → `P.words`. Vocabulary maps (TLM/mantra/morning) expanded to brave/kind/focused/disciplined. Verified: 8 rounds → 5 words written; candidates flow into the mantra offer.
- **ORGAN G (v894) — Week Seal:** Sunday PM close grows a screen. Ceiling = GOLF CARD (behavior × 7-day birdie grid + spelled count + biggest-bogey "+1 next week?" chip); floor = "the garden grew". `pmIsSunday()` gate. Verified with seeded data: grid + 7-birdie count + correct bogey targeting.

STILL TO BUILD (Wave 2 remainder, next session — timeline-paint-free, Opus):
- **ORGAN H1 — Two Tuesdays** (§3): best/worst ordinary-day chips → computed delta as 3 cards ("the difference is 3 choices, not a new life") → pick one → becomes a block tomorrow. Evidence-first: once ≥14 days of logs exist, screen 1 SHOWS their actual best day instead of asking. Add to `WS_REG` (4-screen grammar) + the ACTION-stamp law (every sheet ends with a 10-second body act).
- **ORGAN H2 — Three Targets** (§3): goals intake (ceiling 3 / floor 1); each = area chip + ONE next brick + WOOP armor; planted as journey quest-lines. Overlaps existing goal infra (`GOAL_SEED`, `activeGoals`) — reuse, don't duplicate.

**WAVE 3** (§4) is directional / spec-before-build per organ; the personal-battery-physics organ TOUCHES TIMELINE PAINT → Fable session + full regression contract, NOT an Opus build day.
