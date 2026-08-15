# DESIGNER 2 PROPOSAL — THE VOICE
## "1000x tools" gameplan · center of gravity: what the app SAYS

---

## 0. THESIS

"1000x" does not mean more tools, longer sessions, or prettier orbs — it means the app stops speaking in the voice of the wellness industry and starts speaking in the voice of a guardian who has *actually been watching this specific user*. Every competitor's copy is addressed to "a user"; ALTER's corpus already contains the proof-of-concept ("You keep planning '[activity]' for [time], but it tends to land about [N] min later" — the one sentence in the app no other product could generate, Map 2 §K). The 1000x = making that the RULE: one voice bible enforced across every surface, every generic line killed or rewritten to carry either an observation, a mechanism, or a law; and a composition mechanism (recorded halves + a tiny number-bank of clips) that lets even the SPOKEN voice cite the user's real record. The engines mostly exist (timelinePlayer + composeRitual are genuinely good); the seams get welded, not rebuilt. The text gets rebuilt.

---

## 1. ARCHITECTURE — what merges, what dies, what's new

Surgical, keyed to Map 1's seams. The base is HANDOFF-stacks-and-meditation §10 (the six-layer ritual engine) — this SHARPENS it, it does not re-derive it.

### MERGES
1. **ONE TOOL REGISTRY.** TOOLS (app.js:6765, 14 entries) and STACK_TOOLS (app.js:7209, 7 entries) collapse into one registry: `{id, layer, name, ti, thinker, when, why, run(cb, durSec), micro, channels}`. STACK_TOOLS dies. The "meditate" identity crisis (medEditor() in one, meditationQuick() in the other — same id, different behavior) is resolved: `run()` is the quick path, a `compose` flag opens the editor. The stack composer and the toolbox now read the same objects; sync-by-hand ends.
2. **ONE MEDITATION COMPOSER.** meditation() (5652), meditationQuick() (5757), and medEditor playTrack() (7761) — three segment-builders feeding the same timelinePlayer — merge into `composeMeditation({durSec, level, type, cadence})` → segments. All three entry points become thin callers. (Full spec in §4 below.)
3. **ONE CLOSE GRAMMAR.** The four competing completion messages (Map 2 "INCONSISTENT": "carry the calm with you" / "showing up IS the practice" / "that's the whole skill" / "done — noted") unify under two devices: the **Forget close** for sessions ("Done. Don't check on it — let it run." — the clip already exists, Pool 13) and the **Delta cite** for gauged runs ("You walked in at 7. You're leaving at 4."). SCREEN-only change, free.

### DEATHS
4. **Timer-fired TTS.speak() dies.** stretchFloor (7306) and gratitudeBeat (7333) are the last two tools on the original iOS-silenced pattern (Map 1 §4). Both rebuild as timelinePlayer segment lists — their lines are ALREADY recorded (Pool 3 RAISE, Pool 14 SPOKEN GRATITUDE). Zero new recordings; pure engine migration.
5. **The inter-tool tap cards die for audio chains.** runStack's "Step N of M · Begin" card per step (7284) violates the eyes-closed law five times per micro-stack (Map 1 §4). Replacement: `composeStack()` compiles the WHOLE stack into ONE timelinePlayer schedule — each registry tool exposes `segments(durSec)` alongside `run()`; audio tools contribute segments, and the session becomes one continuous scheduled timeline with whole-session pause/scrub/±15s for free. Between-tool transitions become recorded glue clips ("Next — the breath." / "Now we go inward." — new pool, ~6 clips). Tools that are genuinely interactive (brain gym, typed journal) still break the timeline with a card — that tap is legitimate. This is the single biggest MECHANICS upgrade in the proposal: the micro-stack becomes what the spec promised — eyes closed, one play button, voice carries you the whole way.
6. **The Coué corpse dies.** "Every day, in every way, I'm getting better and better" (Pool 7, SPOKEN ◆) is the most famous cliché in the self-help canon and reads as parody. Orphaning the clip is worth it. Batched with the other kills (§6).

### NEW
7. **The prescription READ.** S.tools.gauge is written but never read (Map 1 §3 — the ledger is stored-but-unused). New pure function `readRecord()`: per-stack/per-tool median delta, trend, last-run cite. Three consumers, cheapest first: (a) SCREEN data-cites on tool cards and stack cards; (b) pack recommendation ordering in stackBuilder; (c) later, composeRitual proportion weighting (the §10b "first build" the spec already names — gauge-driven proportions replacing runFullStack's hardcoded 20/30/25%).
8. **The NUMBER BANK + spoken composites** (the B3 mechanism generalized) — §5 below. This is how the SPOKEN voice gets data-aware without runtime TTS.
9. **Session-running guard.** `S.tools.running` flag; gaugeOpen/runRitual/runFullStack check it (closes the double-gauge seam, Map 1 §4).
10. **Register skins (R5)** — display-layer dict only, §5.4 below.

### DESIGN / COMPOSITION (brief — the frame canon already governs)
The session runner is already the right shape: cockpit 'tool' stage, one HERO orb, transport docked below (timelinePlayer's Headspace bar). Under the composition law (v812): the running screen is FIVE elements max — orb, current-line label, sub-line, transport, drift-tap affordance (the orb itself). Finish-variety grammar on the close card: solid-pink primary = "Again tomorrow" / striped = "Another 5?" / ghost = "Enough for today." — the escalation and the way-out rendered in the timeline's own vocabulary. Type menus (meditation types, packs) = choice-row v3 (own-color ignition, no gold). The candle (R3) is the only new visual object and stays deferred — it is not in this plan's critical path.

---

## 2. THE VOICE BIBLE

### The register, named: **"A guardian, not a guru."**
Sage is someone who has watched you closely, likes you, and refuses to flatter you. Sage has seen ten thousand days and is impressed by small real ones. The reference lines already in the corpus: "Pick two things up off the floor. I'll wait." · "It's been [N] days. No guilt — seasons happen, and that you came back is the whole skill." · "Now leave it alone. It's working." Everything must sound like it came from the same speaker as those three.

### The ten craft devices (named, with examples)

1. **THE WATCHED-YOU OPENER** — tool WHEN lines describe the moment from inside the user's head, never as a clinical category. Reference: "when someone's living rent-free in your head and you can't stop rehearsing the argument" (Active Love). Anti-reference: "acute stress, a spike" (Breathe). Rule: every WHEN line must contain either a verbatim inner thought in quotes or a concrete behavior ("the third time you've reread the same paragraph").
2. **THE HONEST WHY** — mechanism in plain physical speech, one concrete noun, one clause, and permission to under-claim. Reference: "not magic, just real skills" (Brain Gym). Rule: no abstraction nouns (arousal, network, subconscious) unless made physical ("a brake pedal wired into the heart").
3. **HONOR-THEN-PIVOT** — the Tony setup form (Arsenal §4): name the true negative FIRST, specifically, then pivot. The specificity is the whole trick — "part of me wants to stay in bed" works; "I don't have all the answers" doesn't. Rule: the negative clause must be a thought a real person actually thinks in those words.
4. **THE LAW** — closing aphorism where the FORM carries the meaning: parallelism, inversion, or a self-demonstrating sentence. Reference: "What's wrong is always available. So is what's right." Bar: if it could be a bumper sticker that already exists, it dies ("Where attention goes…" dies).
5. **THE CHRONICLE CITE** — second-person past-tense with a real number from the record. Reference: §10d's "day 40: you sat 12 minutes with two catches — three weeks ago it was 90 seconds." This is the 1000x device; Arsenal #9, #17. Rule: cite, don't praise — the number IS the compliment.
6. **THE DIGNIFIED DECLINE** — every invitation carries its own out, in the same breath (§10c law). Reference form: "out loud if you can — in your mind is fine." Rule: the decline option must be phrased as equally valid, never as the lesser path ("if you must" is banned).
7. **THE FORWARD CLOSE** — the last beat of any energizing tool is a bridge into motion, never a summary. Reference: "Carry it into the next thing" (Vortex) · "Use it ▶" (Jeopardy). Calming tools close on the FORGET device instead.
8. **THE INVERSION SEAL** — catch = rep, return = skill, made explicit at the exact moment of the "failure." Reference: "you noticed 4 times — that noticing IS the practice." Extends per §10c beginner rescue: "That noticing? That's the rep. The skill was never holding on — it's catching the wander and coming back kindly. You just did it."
9. **THE NAMED PART** — externalize the saboteur; it is a character, not a character flaw (Arsenal §13). Reference: "Part X is the part that pulls you off. It's not you." Extension form: "That's the [voice]. It kept you safe once. It doesn't run this. You do."
10. **THE UNDER-PROMISE** — deliberate deflation where competitors inflate. Reference: "A real skill (not a make-you-smarter claim)." Rule: one honest deflation per surface earns the right to one big claim per surface — never two claims in a row.

### Banned list (copy lint — grep-enforceable)
`powers` · `Life Force` · `blessings` · `carry the calm with you` · `deeply relaxed` · `quiet beach` · `journey within` · `unlock` · `manifest` · `vibration` · `should / must / wasted / failed / missed` (reward-never-shame law) · `slip past the critical mind` (NLP patter) · any sentence whose grammatical subject is "whatever happened" or "things" (the user or the guardian is always the subject) · all emoji (hard law; one live violation at the Part-X toast, app.js ~7959).

### Sentence-shape rules
- **Spoken lines:** max ~12 words per breath-clause; commas are breaths; the payload word lands LAST ("…back in your body").
- One metaphor per line, and it must be load-bearing — decoration dies.
- Verbs over adjectives; zero adverb stacks; "very/really/truly" banned in Sage's mouth.
- Questions always ship with their escape hatch inside the sentence ("— if you let yourself" / "no wrong number").
- Guardian first-person ("I") appears ONLY at thresholds — open, drift moment, close, return-after-gap. Inside beats: pure clean instruction. (This resolves Map 2's register-wobble by fiat: it's not that the beats lack "I" — it's that "I" is reserved.)
- SCREEN asides = lowercase casual; instructions = sentence case. Never mix in one string.

---

## 3. BEFORE → AFTER: 24 rewrites of the weakest real lines

**SCREEN = free, ship in V1. SPOKEN = orphans a clip, batched into the V4 recording session.**

**Onboarding / doors**
1. SCREEN (L1117) — "what I'm about to show you gives you real powers. this is no joke." → **"no powers. no magic. just this: real things, remembered, add up faster than you'd believe."** (Under-Promise; kills the constitution's own named violation.)
2. SCREEN (L1110) — "your guardian. I'll help you become who you want to be — one day at a time." → **"I keep the record. You do the living. You'd be surprised what that changes."**
3. SCREEN — battery chips "Running on empty / Getting by / Good energy" → **"running on fumes / getting through it / actually good"** (the middle option names the real state people are in; "actually" does the honesty work).

**Tool cards — WHY lines (all SCREEN, free)**
4. Meditate — "Watching thoughts without grabbing them quiets the mind's default chatter — focus returns." → **"you can't stop thoughts. you can stop chasing them — and the chase is the tiring part."**
5. Mantra — "A repeated phrase in a calm state seeds the subconscious — repetition is how self-image installs." → **"you already run on repeated phrases. you just never picked them. this one you pick."**
6. Grateful Flow — "Gratitude shifts you out of the threat network into the care network…" → **"the brain can't hunt for threats and count what's good at the same time. this flips which search is running."**
7. Rewire — "…lets a new self-image slip past the critical mind and land…" → **"a calm brain rehearses an imagined you the way it rehearses a real one. you're not tricking the mind — you're giving it better footage."** (de-cheeses the NLP patter without losing the claim)
8. Breathe WHEN — "acute stress, a spike, or right before something hard…" → **"the heart's going and the thing hasn't even started yet"** (Watched-You Opener).

**Runner beats + closes**
9. SCREEN — Self-Hypnosis "A quiet beach" → **"Somewhere yours"** / sub: **"not a stock beach — a real place you've stood where things were okay. go there."**
10. SCREEN — Self-Hypnosis "Down the steps… 10" sub → **"you don't have to feel anything special — the counting IS the technique. ten… nine…"** (keeps the working countdown, deletes the stage patter, adds the Honest Why inline).
11. SCREEN — Black Sun "the compressed Life Force itself" → **"all the charge the craving was borrowing — back where it started."** (constitution kill: 'Life Force' cannot survive)
12. SCREEN — Part-X toast "you labeled it — that's the whole skill 🙏" → **"named it. that's the whole skill — Part X hates being seen."** (emoji violation fixed + a reason added)
13. SCREEN — tool/stack finish "carry the calm with you" (all 3 sites) → tool close: **"Done — now go spend it."**; gauged close: **"You walked in at [pre]. You're leaving at [post]."** (Delta cite; data already in scope)
14. SCREEN — stack step card "Step N of M · your session · take your time" → **"Step [N] of [M] · you came in at [pre]/10 — let this one land"** (Map 2 Missed-Device #4, verbatim fix)
15. SCREEN — "Session complete / [N] tools · carry the calm with you" → **"The whole practice — done. / [N] tools, [M] minutes. Don't check on it — let it run."** (echoes the recorded FORGET clip so screen and voice rhyme)
16. SCREEN — Brain Gym "Good run" → **"Good run · your best is [N] — it's not going anywhere."** (Missed-Device #7; one clause, personal-best-only law kept)
17. SCREEN — journey node "Name what you actually want. One sentence — your real reason." → **"One sentence: what you want. Not the polite version."**
18. SCREEN — "Energy, work, love — map today across all three." → **"Energy, work, love. A good day pays all three. Most days pay one."**
19. SCREEN — virtue gratitude "I appreciate all the blessings and gifts in my life." → **"I notice what's already working — out loud, on purpose."**
20. SCREEN — virtue zest "I dominate my fundamentals so I have Heroic energy." → **"I eat, move, and sleep like someone who plans to be here a while."** (kills the accidental Brian Johnson product placement)

**POOLS (SPOKEN — each orphans one clip; all batched in V4)**
21. SPOKEN Pool 7 — "Every day, in every way, I'm getting better and better." → **"A little steadier than yesterday. That's the whole job."** (INSTALL contract: first-person present observation)
22. SPOKEN Pool 7 — "I have everything I need within me, now." → **"I've handled every day so far. The evidence says I'll handle this one."** (identity-evidence principle, spoken)
23. SPOKEN Pool 12 — "Where attention goes, the day follows." → **"Attention is the one thing you spend without noticing. Tonight, you noticed."** (self-demonstrating Law; also seals the drift-tap thesis)
24. SPOKEN Pool 10 — "A calming heaviness starts at the top of your head — jaw loose, neck soft." → **"Let the face stop working first — the jaw, the eyes. The face has been working all day."**
25. SPOKEN Pool 8 — "Whatever happened today doesn't decide how I feel tonight." → **"Today got a vote on what happened. I get the vote on what it meant."** (fixes the passive-subject violation)
26. SPOKEN Pool 6 — "Now bring a goal to mind. Something you actually want." → **"Bring the goal to mind — not the one you say at parties. The real one."**
27. SPOKEN Pool 5 — "Trade one expectation for one appreciation. Just for now." → **"Somewhere today, something went right without your help. Find it."**
28. SPOKEN Pool 14 — "Someone who makes life warmer…" → **"Someone who'd be glad to know you thought of them just now…"** (turns a category into an act)
29. SPOKEN Pool 4 AM — "Even though I don't have all the answers yet — I release the pressure, and stay open." → **"Even though I can't see the whole road — I've never needed more than the next stretch of it."** (Honor-Then-Pivot kept, cliché clause removed)

**KEEPERS (explicitly protected, do not touch):** "Now leave it alone. It's working." · "What's wrong is always available. So is what's right." · "There's a heart in there that's been beating for you all day. It never asked for thanks." · "Feel yourself pulled toward it — pulled, not pushed." · "Even though part of me wants to stay in bed — I'm here. That already counts." · "Pick two things up off the floor. I'll wait." · the welcome-back seasons line · "Noted. Today bends around that." · Reversal of Desire's three war cries.

---

## 4. THE MEDITATION SPINE

**One composer, three faces.** `composeMeditation({durSec, level, type, cadence})` replaces the three parallel segment-builders (Map 1 seam #2). It walks section pools — settle → breath → body → aware → rest → (level-gated: bliss) — and does pure gap-math per §4b: pick N lines per section scaled to durSec, insert silences so total ≈ length and cue density ≈ cadence; on long sits, rest on the closing pool with widening gaps so a 40-minute sit still feels held. The existing teacher clips (Harris/Headspace/Blackstone/Adyashanti banks, already recorded) ARE the pools — no new recordings to ship v1 of this.

**The type menu lives INSIDE the step** (spec §4, resolved 2026-07-01): default = the epic adaptive one; alternates = sounds (2-min) · body scan (2-min) · heart · vipassana. Choice-row v3, one screen, never a library. Heart/vipassana texts are DAVID-PENDING content — the menu ships with the two basics + the epic; the two nuanced rows render as "coming — being written" locked stones (fog-of-war grammar, consistent with journey).

**The level ladder is inferred, never quizzed** (§10d): L1 Focus → L2 Embodiment → L3 Resting Awareness → L4 Heart/Bliss. Placement = drift-tap EMA trend (S.tools.medFocus) + tolerated stillness minutes + runs/week (S.tools.use). Level gates which pools the composer draws from and which composer controls are even exposed (§10c: beginner = press-play only; advanced = the full CapCut desk that already exists, v758/759). L4 content blocked on David's Spero link — the ladder ships 3 rungs.

**Beginner rescue at the drift moment** (§10c, the churn fix): the drift-tap response becomes level-aware. First 3 sessions: the full rescue line ("That noticing? That's the rep…" — needs 1 new clip, else screen-only under the orb until recorded). Habit rung: "good catch — back to it" (exists). Grace rung: chime only, no words — silence as the graduation gift. This is the never-hands-over maturation (teach → mirror → chronicle) made audible.

**The braid hook (§10d, minimum viable):** one practice stone on the daily trail when the week's medFocus trend improves — "your attention held twice as long this week" — SCREEN, computed from data already stored. No inner-chapter map yet; one stone proves the seam.

---

## 5. THE CLEVER LAYER — how text stops being generic (the mechanism)

### 5.1 The NUMBER BANK + spoken composites (B3 generalized)
Record a closed bank of ~30 tiny clips: numbers zero–twenty, "seven"-style digit reads for gauge scores, and connective stems/tails: "You walked in at" / "You're leaving at" / "That's" / "days in a row." / "minutes." / "Last time, this took you from" / "to" / "catches." Composites resolve by halves exactly like B3: `["Last time, this took you from", "seven", "to", "four"]` = four scheduled clips, zero runtime TTS, HARD AUDIO CONSTRAINT intact. **~30 clips (EN+RU) unlock every spoken chronicle-cite in the app forever.** This is the cheapest 1000x purchase in the whole plan. What it enables spoken: gauge deltas, streak counts, sit-length cites ("twelve minutes… two catches"), return counts (Arsenal #12).

### 5.2 What is compositable vs screen-rendered (the hard line)
- **Compositable from clips:** anything = fixed stem + slot from a CLOSED bank (numbers, the 14 tool names, section names, point names — mostly already recorded).
- **Screen-only, honest silence in the gap:** open-ended user text — their own install line, their gratitude items, activity names from the log, the sigil intention. Rendered as the sub-label under the orb while the voice pauses; the composeRitual point() pattern (Map 1 §4) already proves this degrades honestly.

### 5.3 Data-citing templates (all SCREEN, all free, ship first)
- Tool card second WHY line from readRecord(): **"last time: 7 → 4."** (Missed-Device #1)
- Rewire install beat surfaces the user's OWN line from S.bk[k].am.identity instead of the canned example (Missed-Device #6 — explicitly flagged free in Map 2).
- Grateful Flow, session 3+: **"you keep coming back to '[most common]' — is that still the one?"** (Missed-Device #8)
- Stack step card pre-score cite (#14 above), Brain Gym best (#16), streak/goal cites in the guardian hero line (Missed-Device #5 — propagate the ONE working number pattern).

### 5.4 Level-aware variants + register skins
- Intro cards, WHY lines, and drift responses get up to 3 variants keyed to toolRung (Willingness/Habit/Grace). Frames retire: at Grace the intro card never renders and the WHY collapses to its law form. This is §10-layer-4 applied to TEXT, not just cue spacing.
- Register skins (R5) ride the v656 display-layer dict: a register is just another dict. Neutral-warm default → grimoire opt-in renames SCREEN nouns only: session→rite, your mark→sigil, record→Book of Record, practice→working, law→word. **Spoken audio stays neutral in both registers** — the register changes what it evokes, never what it claims, and never doubles the clip bank.

### 5.5 The EXPLAIN channel (§10c, copy system)
A named pool of ~18 micro-lines, three types, ONE per session max, inserted after ARRIVE, chosen by rung — density inverse to experience:
- **logos** (Willingness): "Long exhales are a brake pedal wired straight into the heart. You're pressing it now."
- **ethos** (early Habit): "Monks, marines, and midwives all use this one. It's older than the word 'stress'."
- **pathos** (late Habit): "You've done harder things than sit still. This is just sitting still."
- **Grace:** no explain line — silence is the credential.
Craft rule: every explain line must contain one concrete noun (brake pedal, marines); abstraction words banned. This pool needs recording (V4 batch). David's own framing holds: "explaining why-it-works IS honest hypnosis."

---

## 6. POOLS-v2 DIRECTION

**Grammatical contract per pool (new, enforced):** RELEASE = "Even though [verbatim real thought] — [pivot]" always · INSTALL = first-person present *observation* only (never third-person affirmation) · REFLECT = question + built-in escape hatch · LAW = ≤10 words, parallelism or inversion · FORGET = imperative + reassurance. Pool 7's current three-tense mess (Map 2 INCONSISTENT) is cured by the contract, not by more lines.

**Dies (7 clips, replacements in §3):** Pool 7 lines 1–2 · Pool 12 line 1 · Pool 10 line 1 · Pool 8 line 2 · Pool 6 line 1 · Pool 5 "Trade one expectation" · Pool 14 "Someone who makes life warmer".

**Grows:** RELEASE (+4 lines of named-thought specificity: "check the phone", "I'm already behind", "what's the point tonight") · LAW to ~12 (the app's tattoo lines; each new one must pass the bumper-sticker kill test) · SPOKEN GRATITUDE (+2 act-forms).

**New pools the Arsenal justifies (all → one V4 gen-voice batch, EN+RU):**
- **QIGONG/RAISE** (~7 lines, §10b + Arsenal #5): shake-loose, arm swings, spinal wave, one stance — "You've been still too long — the body's the first door."
- **EXPLAIN** (~18, §5.5).
- **RESCUE** (~4 beginner drift responses, §10c).
- **INVITATION/GLUE** (~8): dignified declines ("out loud if you can — in your mind is fine" ◆, "eyes closed if you like — a soft gaze works too") + the stack transition clips (§1.5).
- **BRIDGE-ACTION** (~3, Arsenal #15): the meditation→day handoff feeding the one-thing node — "One action. Today. Hear it." exists; add the pull-form and the evening seed-form.
- **NUMBER BANK** (~30, §5.1).
**Batch total: ~85–95 new clips + 7 kills, ONE recording session, both languages.**

---

## 7. BUILD SEQUENCE (each step ships + device-tests alone)

- **V1 — THE SCREEN SWEEP (no recordings, no engine risk).** All SCREEN rewrites (§3 items 1–20), unified close grammar, emoji violation fix, banned-word lint pass, all §5.3 data-cite templates, level-aware WHY/intro variants. Pure string + small-logic work in app.js; RU dict rows same-commit (July-7 freeze rule). Device check = visual only. *This alone is a visible "the app got smarter about me" jump.*
- **V2 — THE ENGINE MEND (no recordings).** One registry (kill STACK_TOOLS) · stretchFloor/gratitudeBeat → timelinePlayer on existing clips · composeStack single-schedule (eyes-closed law fixed) · S.tools.running guard · readRecord() + pack ordering. Regression risk: touches the stack path — label all audio "boots clean; gesture/audio feel DEVICE-UNTESTED" until David confirms on iPhone.
- **V3 — THE MEDITATION SPINE (partial recordings).** composeMeditation unification, type menu in-step, level inference, exposure scaling. Beginner rescue ships SCREEN-only under the orb until its clip lands in V4.
- **V4 — THE RECORDING BATCH (the one gen-voice session).** POOLS-v2 kills + replacements + the five new pools + NUMBER BANK, EN+RU, gen-voice.py extended with the new POOLS sections. This is the only step gated on David's register approval (POOLS-v1.md is the contract format — extend that file, get his edit pass, then record).
- **V5 — THE SPOKEN CHRONICLE (needs V4).** citeSpoken() composites wired into ritual open/close and the return path; gauge-driven proportions in runFullStack/composeRitual (the §10b first build); one braid practice-stone.
- **V6 — REGISTER SKINS (no recordings).** The dict, the opt-in toggle in settings' four rooms, grimoire noun set. SCREEN-only by design.

---

## 8. WHAT I EXPLICITLY REJECT

1. **Runtime TTS for dynamic lines** — violates the hard audio constraint; the number-bank composites make it unnecessary for everything except open-ended user text, which renders on screen in honest silence.
2. **Re-recording the whole 70-clip POOLS bank** — surgical kills only (7 clips), batched once with the new pools. Most of POOLS-v1 is good; wholesale rewrite is vanity cost.
3. **A teacher-named meditation library** ("Sam Harris track", "Blackstone track") — that's a Headspace clone and violates CONDENSE-DON'T-PILE and SYNTHESIZE-DON'T-COPY. The teachers are pools the composer draws from, invisible as brands.
4. **Grimoire register in the SPOKEN bank** — would double every future recording batch forever. Register = display layer only; the voice stays neutral-warm in both skins.
5. **Mid-session interactive branching** ("how do you feel now?" forks inside audio) — violates the eyes-closed law. Adaptation happens BETWEEN sessions via the record, and within sessions only via the sanctioned drift-tap.
6. **The visible 4-facet compass or any tonal-mode UI** — already rejected as "dumb." Arsenal #10's invisible stance-switching is legitimate but deferred past V6; it needs the gravity-read (Arsenal #11) first and this plan doesn't earn it yet.
7. **Guardian first-person sprayed everywhere** to fix the register wobble — the fix is reservation, not saturation: "I" at thresholds only (§2). A Sage who narrates every beat becomes a chatbot.
8. **Resolving David's reserved calls by stealth** — stack-on-timeline representation (open decision #9), voice tooling split (#6), guardian aggressiveness default (#8) stay open; V2's composeStack works under any of the three timeline representations.
9. **New surfaces of any kind** — everything above renders in the cockpit 'tool' stage and the existing composer. Zero new menus, zero new innerHTML wipe sites (V2 removes call sites, adds none).

**Grounding index:** Map 1 seams §4 (taxonomies, meditation paths, timer-TTS, inter-tool taps, gauge-unread) → §1 items 1,2,4,5,7. HANDOFF-stacks-and-meditation §4b (composition engine), §10 layers 1–6, §10b (gauge-driven proportions "first build"), §10c (invitation/explain/rescue), §10d (braid) → §§1,4,5. POOLS-v1.md lines 60–64/94/81/69 → §3 kills. Map 2 Missed-Devices 1,4–8 → §5.3. Map 3 Arsenal 2,4,5,9,12,15,17 → devices + new pools. Map 4 laws 1–14 + composition/calm/component laws → §§1 design, 8 rejections.