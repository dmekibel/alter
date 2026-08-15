# DESIGNER 1 — THE SYSTEM
## "The Instrument" — one composer, one registry, one closed loop

---

## THESIS

1000x does not mean more tools, longer scripts, or prettier cards — every wellness app has those. 1000x means the session that could only have been composed for THIS user, TONIGHT: the machine reads her walk-in number, her drift history, her declines, and her efficacy record, computes the order and the proportions, speaks in a voice that has visibly been watching her, measures what it did to her number, and lets that measurement change the next session. Headspace plays recordings; Tony runs one fixed linear ritual; ALTER becomes an instrument that plays the user's own data back at her. The whole proposal is one move made surgically: collapse the five overlapping tool taxonomies and three meditation entry points (Map 1 §4) into ONE registry feeding ONE composer feeding the ONE already-evolved engine (timelinePlayer), then close the loop the code already half-built — S.tools.gauge is collected but never read (Map 1 §3); the prescription engine promised in §10 layer 6 is the missing organ. Everything else (text, meditation spine, braid) rides that spine.

---

## PART A — ARCHITECTURE (what merges, what dies, what's new)

### A1. The one registry — kill the parallel taxonomies

Map 1 §4's worst seam: TOOLS (14 entries, app.js:6765) vs STACK_TOOLS (7 entries, app.js:7209) vs STACK_PACKS vs AM/PM rituals vs runFullStack vs S.tools.custom — with "meditate" meaning medEditor() in one array and meditationQuick() in the other. Replace all of it with one REGISTRY where every entry is a preset routing over the engine (exactly what §10 layer 2 promised: "every existing tool becomes a preset routing"):

```
REG[id] = {
  id, layer,                 // 1-8 routing internal, NEVER a menu axis
  name, ti, thinker, when, why,   // card copy (SCREEN, free to sharpen)
  form: 'timeline' | 'beats' | 'game',
  compose(ctx) -> SessionSpec,    // timeline-form: returns chapters
  beats(ctx)   -> [beat],         // beats-form: Stutz visuals etc.
  floor: 8,                       // seconds — constitution 8s floor
  guards: [...]                   // e.g. gratefulFlow suppressed while grievance live
}
```

- STACK_TOOLS dies. Packs ("Quick reset"), AM/PM rituals, the Full Stack, and future named presets become AUTHORED PRESETS = saved compositions (a preset is just `{chapters:[regId...], weights}` — this IS R5's "presets-as-authored-rituals", spec §10 R-list).
- Custom tools (S.tools.custom) join the registry at load — toolForNow() (app.js:6875) keeps working unchanged.
- The toolbox one-door surface (v816, frame 08) is untouched. This is a plumbing unification, not a UI one — constitution law 13 stands.

### A2. Two runtime engines, one composer — kill the tri-path

Everything timeline-form flows through ONE function:

```
composeSession(target, ctx) -> SessionSpec
ctx = { lengthSec, timeOfDay, pre (gauge 0-10), density (S.tools.medFocus),
        level (inferred, §10d), prefs (remembered declines), weights (prescribe()) }

SessionSpec = {
  chapters: [{ id, label, skippable:true,
     segs: [{ text, gapMs, mode:'speak'|'listen', ch:'ears'|'hands'|'explain', sub }] }],
  bed:'pad'|'bgm'|null, underlay:{breath:false}, drift:true, gauge:{in:true,out:true}
}
```

- composeRitual (app.js:7429), composeCharge (7478), medEditor's playTrack distribution (7761), and meditationQuick's seq-walk (5757) all become SECTION GENERATORS inside composeSession. Four segment-builders with zero shared code (Map 1 §4) become one.
- meditation() / meditationQuick() / medEditor() → ONE entry: press-play (composed for you) + a "shape it" fold that opens the existing CapCut composer (openSessionComposer, 7702). Exposure of the fold is level-gated per §10c ("beginner = press-play only; advanced = full desk").
- timelinePlayer (7085) stays the runtime — it already does pre-scheduled clips, transport, drift-tap EMA, pad/BGM. Two extensions only: (1) CHAPTER MARKERS on the transport (labels + tick marks; scrub snaps to chapters), (2) a SKIP-CHAPTER control = the dignified decline (§10c invitation law) — skipping recomposes remaining gap-math on the fly and writes the decline to ctx.prefs.
- beatRunner (6989) survives untouched for eyes-open, user-paced cognitive tools (Reversal, Active Love, Jeopardy, Black Sun, Vortex, Inner Authority, custom tools) — user pace IS the point there. Fix its one seam: call TTS.warmAll() on any beats-form tool launch, not only on stackBuilder open (Map 1 §4 silent-clip risk).

### A3. What dies

1. **runStack's Step-N-of-M tap cards for timeline-form steps** (7284). The micro-stack currently demands 5 eyes-open taps mid-flow — a direct eyes-closed-law violation (Map 1 §4). Timeline-form steps concatenate into ONE chaptered schedule; inter-tool transitions become spoken glue clips + gap ("That was the breath. Stay down — we go inward now." — new glue pool, ~6 clips). runStack survives ONLY to chain beats-form tools.
2. **stretchFloor (7306) and gratitudeBeat (7333) timer-fired TTS.speak() paths** — the original iOS-silent pattern (Map 1 §4). Both become composeSession chapters; their lines already exist as clips (POOLS-v1 §3 RAISE and §14 SPOKEN GRATITUDE — verify manifest before flipping).
3. **Fixed proportions**: runFullStack's hardcoded 20/30/25% (7491) and composeRitual's static pool slicing — replaced by A4.
4. **The meditation FREQ table** (often/some/spacious → 11/24/42s) — density comes from medFocus, with a manual override chip kept.
5. **Journal/REFLECT duplication** (Map 2 §2 INCONSISTENT): if the PM ritual ran today, the PM journal prompt bank suppresses the covered territory (pm-kept vs Pool 9 asking the same question in the same hour).
6. **The double-gauge hole**: add one global `S.tools.live` session flag; a second launcher declines gracefully (Map 1 §4 "no one-door leads to two sessions guard").

### A4. §10b made real — the computed order

Replace every fixed proportion with one function, per §10b's ordering law (active-before-still, state-scaled):

```
orderPlan(ctx):
  T = ctx.pre                       // walk-in tension 0-10
  D = ctx.density.rate              // drift EMA (S.tools.medFocus)
  onRamp   = clamp(0.15 + T*0.045, 0.15, 0.55)   // high tension → long active on-ramp
  still    = clamp(0.45 - T*0.03 + rung*0.05, 0.10, 0.55)  // calm+trained → long sit
  chronicHotStart (D trend rising across sessions) → onRamp += 0.08 next session (persisted)
  weights from prescribe() (A5) then scale section counts/dwells inside each share
```

Per-section cue spacing generalizes medCadence() (per-chapter, not global): speak-mode gaps = clipDur + repeat-room (~4s); listen dwell 12–20s × weight; stillness block absorbs the remainder with re-anchor cues at cadence eased by level. Length is pure gap-math — the hard audio constraint is never touched.

### A5. The prescription engine + THE RECORD (the missing organ)

S.tools.gauge stores {k,t,stack,pre,post} and nothing reads it (Map 1 §3, §5). Build the loop:

1. **Enrich the record** (additive, no SCHEMA bump): each run logs `{sections:[{id,dur}], pre, post, drifts, tod, declines, skips}`.
2. **prescribe()**: per-section EMA of delta-per-minute, credit split proportional to section duration; contrast sharpens it over time (sessions with vs without a section). Cold start: uniform weights — the system degrades to today's behavior, never worse.
3. **Weights feed composeSession** (A4) — the section that moves THIS user's number gets more dwell; the dead section shrinks (never to zero — floor law).
4. **One honest SCREEN sentence, hedged, never science-cosplay**: "Release does the heavy lifting for you — it usually earns most of your drop." Surfaces on the preset card and post-session toast.
5. **THE RECORD as a first-class object** (arsenal #8, Map 3): a viewable ledger row in the toolbox fold ("Your record") — date · session · pre→post · one line. This is the Book-of-Shadows that writes itself (§10 layer 6) and the chronicle's raw material.

### A6. Channels — enforce "one foreground at a time" structurally

Segments declare their foreground (`ch`); the composer serializes foreground content and layers underlays (BED pad/BGM; BREATH swell — OFF by default per David's own note, spec §9). HANDS (tapping ladder, arsenal #1) is a routing toggle on ANY chapter, generalizing the v785 fsTap boolean per §10b — offered, remembered when declined. NEW CHANNEL: **EXPLAIN** (§10c) — micro-explanation clips woven at chapter joins, density INVERSE to run-count (frames retire with familiarity, rides S.tools.use). Speak/listen alternation (arsenal #3) becomes `mode` on every segment — voiced rounds get the speak-hint + repeat-room gaps; listen rounds get dwell. This one field gives a single session emotional range.

### A7. End-to-end worked example

`ctx = {lengthSec:600, tod:'pm', pre:7, density:{rate:1.8,n:9}, level:2, prefs:{hands:declined}}`

1. prescribe(): this user's EMAs → release −0.42/min, scan −0.31, reflect −0.05 → weights {release:1.4, scan:1.2, reflect:0.7}.
2. orderPlan(): T=7 → onRamp 0.47 (≈280s active), still 0.24 (≈145s), close ≈175s.
3. Chapters (PM payload): ARRIVE(2 clips, listen) → RELEASE(3, speak, weight-boosted dwell; HANDS not offered — declined last time, re-offered in 3 sessions) → REFRAME(2, speak) → REFLECT(1, listen — trimmed by weight 0.7) → SCAN(4, listen, boosted) → STILLNESS(gap block, re-anchor cues every ~24s, drift-tap on) → LAW(1) → FORGET(1).
4. EXPLAIN: one clip after RELEASE at level-2 density ("Naming it out loud first — that's why the pivot lands").
5. Gap math: Σ clips ≈ 95s; remaining 505s distributed per mode rules. Bed = pad −18dB. Screen sub under the orb: "you walked in at 7/10" (cite layer, Part B).
6. Gauge-out 4 → record written → EMAs update → toast: "7 → 4. Release did the heavy lifting tonight — it usually does for you."

Every piece rides existing machinery: timelinePlayer scheduling, drift EMA, gauge010, the pad, the clip bank, the v656 dict layer.

---

## PART B — THE TEXT SYSTEM

### B1. Voice bible (ten laws)

1. **One writer: Sage.** Every line must pass "could the guardian say this having actually watched this user?" The register gap between onboarding ("I'll wait.") and clinician tool cards ("lowers amygdala arousal") is the app's loudest inconsistency (Map 2 §2) — the onboarding register wins.
2. **Name the actual thought, not the emotion category.** The app's best lines already do this: "the 'I deserve this' voice", "part of me wants to stay in bed". Extend everywhere.
3. **Data beats adjectives.** Where a real number/name exists in scope, the line must use it. The pattern-mirror (app.js:5553) is the template for the whole app.
4. **Ban list** (auto-fail): carry the calm with you · blessings · real powers · Life Force · slip past the critical mind · journey-as-noun in copy · any sentence Calm could ship verbatim.
5. **Mechanism in plain speech.** Honest why, felt from inside — never neuro-jargon as authority costume.
6. **One grammatical contract per spoken round.** Pool 7 mixes three (Map 2 §2); the winning mode is present observation with felt evidence ("I'm getting steadier — and I can feel it").
7. **Close forward.** The last line of any tool is a bridge into motion or an explicit forget — never a summary. ("Carry it into the next thing" / "Now leave it alone. It's working." are the two canonical closes.)
8. **Honor-then-pivot** for anything touching a negative (arsenal #4) — the setup-statement form is the app's only sanctioned way to say a bad thing out loud.
9. **Brevity ceiling:** spoken lines ≤14 words where possible. The best line in the bank is seven words.
10. **SPOKEN lines are contracts.** Hash-keyed clips (constitution). Rewrites ship only in named batches; composites resolve by halves (B3 mechanism). SCREEN is free — spend the cleverness budget there first.

### B2. Twelve+ BEFORE → AFTER rewrites (from Map 2's flagged corpus)

SCREEN (free — land in one pass):
1. [Onboarding L1117] "what I'm about to show you gives you real powers. this is no joke." → **"everything here runs on one trick: real things, remembered. watch."** (kills the de-cheese violation; names the actual mechanism)
2. [Breathwork finish + stack close] "carry the calm with you" → **"Done. Slower pulse, same day. Go back in."** (four inconsistent closers unify under law 7 — each tool closes forward in its own intent)
3. [Part-X toast L7959] "you labeled it — that's the whole skill 🙏" → **"named it. it loses about half its power right there."** (emoji violation fixed + a claim you can feel)
4. [stackComplete] "Session complete / N tools · carry the calm with you" → **"Session done · 7 → 4. That swing is you, not luck."** (cite layer; fallback without gauge: "Session done. Leave it alone — it's working.")
5. [Meditate WHY L6765] "Watching thoughts without grabbing them quiets the mind's default chatter — focus returns." → **"You can't stop thoughts. You can stop chasing them — and catching yourself mid-chase is the whole skill."** (states the catch=unit thesis on the card itself)
6. [Mantra WHY] "A repeated phrase in a calm state seeds the subconscious — repetition is how self-image installs." → **"Say a line enough mornings and it stops being a claim — it becomes the default you act from."**
7. [Self-Hypnosis beat L7906] "A quiet beach" → **"Somewhere your body trusts"** — sub: "your place, not a stock photo — anywhere your shoulders have ever dropped on their own."
8. [Black Sun beat L7868] "the compressed Life Force itself" → **"a compressed charge — everything the craving was borrowing against, still in there."** (de-cheese law satisfied, Stutz frame intact)
9. [Virtue L5446] "I appreciate all the blessings and gifts in my life." → **"I keep count of what's good — and the count is longer than it looks."**
10. [Virtue zest] "I dominate my fundamentals so I have Heroic energy." → **"I eat, move, and sleep like someone who plans to be here a while."** (removes the brand-term product placement)
11. [Onboarding battery chips] "Running on empty / Getting by / Good energy" → **"empty — even this app feels like work" / "getting by" / "actually good."** (the first chip names the user's exact thought at that moment)
12. [Stack step sub] "your session · take your time" → dies with the step card; the surviving screen sub becomes the cite: **"chapter 2 of 5 · you walked in at 7/10."**

SPOKEN (Recording Batch A — surgical, ~10 worst lines only; the strong lines are load-bearing and untouched):
13. [Pool 7] "Every day, in every way, I'm getting better and better." → **"Steadier than yesterday. That's the whole trend I need."** (kills the most famous cliché in self-help; keeps the Coué mechanism, drops the Coué museum piece)
14. [Pool 7] "I have everything I need within me, now." → **"So far I've gotten through every single day. That's the record I'm building on."** (the 100%-survival observation — evidence-mode, law 6)
15. [Pool 12] "Where attention goes, the day follows." → **"You don't get the day you want. You get the day you watch."** (the parallelism carries it, like the pool's best line)
16. [Pool 10] "A calming heaviness starts at the top of your head — jaw loose, neck soft." → **"Let the face stop working first — it's been performing all day."**
17. [Pool 14] "Someone who makes life warmer…" → **"Someone who'd be surprised to know they made your list…"**
18. [Pool 6] "Now bring a goal to mind. Something you actually want." → **"Bring the goal to mind — the one you'd still want if no one ever saw it."**
19. [Pool 5] "Trade one expectation for one appreciation. Just for now." → **"You already have something you once only wanted. Find it."**

### B3. The data-citing mechanism (the 1000x text engine)

Two tiers, honest about the audio constraint:

**SCREEN tier — cite().** A guarded sentence library (the pattern-mirror generalized): each cite = {condition over S.*, template, cooldown, slot}. Slots: toolWhy, sessionSub, close, journalHook, installPrompt, presetCard. Ships the Map 2 §3 missed devices concretely: tool WHY appends "Last time this took you 7 → 4" (device #1); Rewire's install beat surfaces the user's own morning line from S.bk[k].am.identity instead of the canned example (device #6 — free and profound: her OWN sentence as the install); Brain Gym "Good run · your best is 9" (device #7); Grateful Flow "you keep coming back to '[most common]' — still the one?" (device #8). Cooldowns prevent the mirror becoming a tic.

**SPOKEN tier — the gauge numbers.** Hash law forbids interpolation, EXCEPT via halves: record eleven number clips ("zero"…"ten") + two frames ("You walked in at" / "You're leaving at") ≈ 13 clips × EN+RU. The guardian SAYS her number inside the session — "You walked in at seven." — the first spoken chronicle, the thing no competitor records for her. Cheap, honest, enormous. (This is the same B3 halves mechanism the tapping composites already use.)

Everything else spoken stays timeless-generic by design; the data lives on screen under the orb and in toasts. No runtime TTS, ever.

---

## PART C — THE MEDITATION SPINE

**One flagship: "The Sit"** — the epic length-adaptive meditation (spec §4) as a composeSession target, not a separate code path:

- **Section pools** (recordings partly exist via gen-voice §7 — the four teacher guides): ARRIVE/settle → ANCHOR (breath; Harris whole-breath lines) → OPEN (sounds) → BODY (Blackstone embodiment) → RESTING (Adyashanti) → HEART (Spero — DAVID-PENDING, gated) → RETURN. Level gates which sections COMPOSE IN; length sets gap-math and section counts; density (medFocus) sets cue spacing; long sits rest on the RESTING pool with widening gaps (spec §4b player rule).
- **The type menu is weight vectors, not code**: Sounds 2-min = {open:1}; Body scan = {body:1}; Heart = {arrive,heart}; Vipassana = {anchor + a noting micro-pool (~6 new lines)}. Presets over the same pools — condense-don't-pile satisfied.
- **The level ladder IS the braid's inner rungs** (§4c ≡ §10d): Focus → Embodiment → Resting Awareness → Heart. Advancement by MEASURED skill only: attention = medFocus trend · regulation = gauge-delta EMA · consistency = runs/week · depth-readiness = longest silence gap completed without a drift spike. No quiz ever; the first ~3 drift-tapped sessions are the invisible placement test (§10d).
- **Beginner rescue at the drift moment** (§10c): drift-tap responses become a leveled pool — beginner density gets "That noticing? That's the rep. The skill was never holding attention — it's catching the wander and coming back kindly. You just did it." (needs ~4 new clips); advanced keeps the terse "Good catch — back to it." Level inferred, response chosen silently.
- **One door**: the meditate card opens press-play (The Sit, composed) with the type row + "shape it" fold beneath — the meditation()/meditationQuick()/medEditor tri-path collapses here (A2). medEditor's composer becomes the "shape it" surface, level-gated.

**The braid surfaces** (§10d, no recordings): (1) PRACTICE STONES on the daily trail — reuse the adaptive-node machinery (app.js:882–1010): "your attention held twice as long this week"; (2) the inner rung visible beside the outer chapters (evidence-based mastery, same grammar as outer); (3) the guardian PRESCRIBES across the seam — a trail node reading the record: "your stillness is ready for 10 minutes." Session results flow back as journey progress; relief-door runs already earn silently — the braid makes the inner strand visible. This feeds the chronicle directly: "day 40: you sat 12 minutes with two catches — three weeks ago it was 90 seconds."

---

## PART D — BUILD SEQUENCE (each step shippable + device-testable alone)

**S1 — THE REGISTRY + composer skeleton.** No recordings. Merge taxonomies; route composeRitual/composeCharge/playTrack/meditationQuick through composeSession; collapse the meditation tri-path; add S.tools.live flag. Behavior-identical ship (regression safety: every preset must produce the same audible session as before). Verify: boots clean, each preset runs; gesture N/A.

**S2 — THE CHAPTERED TIMELINE.** No recordings (glue lines deferred to S5; until then chapters join with plain gaps). Chapter markers + skip-chapter on timelinePlayer; timeline-form stack steps concatenate into one schedule; Step-cards retired for eyes-closed flows; stretchFloor + gratitudeBeat move onto their existing clips (VERIFY the manifest actually contains POOLS-v1 §3/§14 first — Map 1 flags this unconfirmed). Device test: the 5-min micro-stack end-to-end, phone locked, eyes closed, zero taps. This is the eyes-closed law made true.

**S3 — §10b COMPUTED ORDER.** No recordings. orderPlan() replaces fixed 20/30/25 and static pool slicing; per-chapter cadence. Device test: run at pre=2 vs pre=8, confirm audibly different shapes.

**S4 — THE RECORD + prescription v1 + cite() + ALL SCREEN REWRITES.** No recordings. Enriched record, prescribe(), the ledger row, the cite library, and every SCREEN line from B2 (1–12) plus the ban-list sweep — the whole free half of David's text ask lands here in one pass. RU dict entries same-commit (July-7 freeze rule).

**S5 — RECORDING BATCH A (small, surgical).** ~35 clips × EN+RU: gauge numbers + frames (13), inter-chapter glue (6), the SPOKEN rewrites (B2 #13–19, ~8), beginner drift-rescue (4), mudra clip (1). gen-voice.py batch after David approves lines in POOLS-v1 (edit-in-place contract).

**S6 — RECORDING BATCH B (the pools deepened).** POOLS v2: EXPLAIN channel (~18 lines, per-level variants), qigong RAISE pool (~7, §10b), Vipassana noting micro-pool (~6), meditation Level-2/3 section fills. Blocked on David's register approval + Spero link for Level 4 (DAVID-PENDING — do not generate).

**S7 — THE BRAID.** No recordings. Practice stones + inner rung + prescription node on the trail. SCREEN-only; device test = the trail renders and the numbers are true.

**S8 — REGISTER SKINS + authored presets (R5).** Rides the v656 dict machinery. Honest constraint stated now: skins re-voice SCREEN ONLY — spoken clips cannot be re-skinned by a dict, so the spoken bank stays register-neutral forever (POOLS-v1 already is; keep it that law).

Every step: preship.sh, boots-clean preview, and the honest label — gesture/audio feel is DEVICE-UNTESTED until David's phone says otherwise.

---

## PART E — WHAT I EXPLICITLY REJECT

1. **Runtime TTS / Piper for adaptivity.** The hash-clip law is a feature, not a limit: adaptivity = gap-math + pool selection + weights + the halves mechanism. One consistent calm voice is worth more than infinite sentences.
2. **Rewriting the 70-clip bank wholesale.** Map 2 shows most of it is strong and several lines are the app's best assets ("Now leave it alone. It's working."). Surgical batch of the ~8 worst only.
3. **A visible levels/appetite UI or any placement quiz.** §10d: no quiz ever. Level is inferred; exposure scales silently. A "Level 2" badge would turn practice into score-chasing — the anti-grind law (Map 3 sequencing) forbids it.
4. **The candle (R3) in this run.** High charm, zero system leverage; it's already its own self-contained R-step and depends on open David decisions (mic blow-out). Defer whole.
5. **SOM/AOM as user-facing chips** (arsenal #9). Condense-don't-pile: the distinction folds invisibly into which future-round lines compose, never a fork the user must understand.
6. **The 4-facet compass in any visible form** — already rejected as "dumb". Even the invisible copy-stance version (arsenal #10) is deferred: cite() must earn trust with plain data-truth before it gets tonal cleverness.
7. **Breath underlay default-on.** David's own note: "possibly too much; ship as a composer toggle, off by default" (spec §9). Honored.
8. **Per-section causal claims.** Prescription v1 is duration-weighted EMA + one hedged sentence ("it usually earns most of your drop") — never fake precision. The moment the app overclaims what moved her number, the never-lie contract from onboarding is broken.
9. **Any third menu surface, tool grid, or new modal.** One-door (v816) + cockpit stage (law 13) are the only homes. This entire proposal adds zero new surfaces except a ledger row in an existing fold and stones on the existing trail.
10. **Resolving David's reserved decisions.** Stack-on-timeline representation (open decision #9), voice-tooling split (#6), guardian default register (#8) — the composer is built so any answer plugs in; none is pre-empted.

Files this plan executes against: /Users/Dmekibel/claudeCode/alter/app.js (registry 6765/7209, composers 7429/7478/7761, engines 6989/7085/7284), /Users/Dmekibel/claudeCode/alter/_specs/HANDOFF-stacks-and-meditation.md (§10–§10d), /Users/Dmekibel/claudeCode/alter/_specs/POOLS-v1.md (the edit-in-place recording contract), /Users/Dmekibel/claudeCode/alter/_dev/gen-voice.py (batches A/B).