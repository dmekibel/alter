## (1) INVENTORY

**beatRunner** (`/Users/Dmekibel/claudeCode/alter/app.js:6989`) — tap-advance card runner. Shows orb + label + sub + "Next ▶" button. Optionally plays intro card on first run (seen gate in S.tools.seen). Audio: 3-voice A-chord drone via bgBus. Voice: schedules nothing up front — calls `say()` per beat on Next tap (works in that tap's gesture). Used by: reversalOfDesire (6989), reprogramTool (7782), activeLove (7803), innerAuthority (7821), jeopardy (7838), blackSun (7857), vortex (7875), gratefulFlow (7972), runCustomTool (6808).

**timelinePlayer** (`7085`) — composed timeline engine. Pre-decodes all clips, schedules them up front on AudioContext with `start(at)`. Has Headspace-style transport (play/pause, ±15s, scrub). Drift-tap feedback on the orb when `opts.drift=true`. Logs pre-decoded vs sync-decoded paths (autostart vs Play button). Background bed: peaceful pad or BGM. Used by: meditation() run(), meditationQuick(), relaxMoment(), mantraPlayer(), runRitual() (via composeRitual), runFullStack() charge+love steps, medEditor() playTrack().

**breathwork** (`5591`) — dedicated breath runner. Orb scales inhale/hold/exhale/rest phases. Schedules clips up front via `scheduleClipAsync`. Has its own oscillator with breathing-swell gain envelope. Fixed 4-phase cycle × N cycles.

**tapping** (`5688`) — EFT 9-point runner. Config screen: pick feeling. run(): schedules clips up front (point name + feeling phrase as separate clips, B3 fix). Fixed 8-point × N rounds + setup × 3.

**meditation()** (`5652`) — full config screen: pick length (2/5/10 min), remind freq (often/some/spacious → 11/24/42s), guide (4 teachers). Composes segments by walking guide.seq + tail loop. Launches timelinePlayer. Drift-tap off.

**meditationQuick()** (`5757`) — skips config. Uses harris seq by default, applies medCadence() for spacing, accepts durSec param. Drift-tap ON. Used by runStack() meditate step.

**mantraPlayer()** (`5749`) — fixed 24-line mantra script, cadenceSec=5, timelinePlayer with drone. onDone callback for stack chaining.

**relaxMoment()** (`5637`) — 8 body-scan steps via timelinePlayer, cadenceSec=4.2s, no drift-tap.

**stretchFloor()** (`7306`) — 3-phase text-coached stretch (stand/fold/roll-up). TTS.speak() per phase — NOTE: this path uses `TTS.speak()` not `scheduleClipAsync`, so it may fire from a timer-fired context on iOS. No pre-schedule.

**gratitudeBeat()** (`7333`) — 3 prompt lines from PR_ALL (date-rotated two triplets), timer-fired TTS.speak() per prompt. No pre-schedule.

**stackBuilder()** (`7226`) — chooser UI: Full Stack card, AM/PM ritual buttons, 3 prebuilt packs, "Build your own →" → stackTimeline(). Entry point from toolboxStageStep "Build a session" fold-row.

**stackTimeline()** (`7265`) — wraps openSessionComposer() for STACK_TOOLS pool. Tap on meditate block → mini-composer for inner meditation sections. onPlay → runStack().

**runStack()** (`7284`) — sequential runner. Shows "Step N of M" between-tool card with Begin/Next tap. Each tap launches next tool via its .run() function. onAll callback for relief-door gauge wiring.

**openSessionComposer()** (`7702`) — shared vertical CapCut-style timeline for both medEditor and stackTimeline. Drag-to-reorder, resize blocks, add from pool.

**medEditor()** (`7761`) — meditation-specific session composer. Sections: settle/breath/body/aware/rest/bliss(adv)/play(adv). playTrack() distributes section lines across duration by count, runs timelinePlayer with drift-tap ON.

**composeRitual()** (`7429`) — pure function, returns timelinePlayer segment array. Grammar: arrive → speakHint → release rounds (AM or PM) → content rounds (gratitude/future/install or reframe/reflect/scan) → bridge → law → forget. Length adapts by slicing pools shorter at ≤5 min.

**runRitual()** (`7454`) — pre-gauge010 → composeRitual → timelinePlayer (drift-tap ON) → post-gauge010 → ledger push to S.tools.gauge.

**composeCharge()** (`7478`) — Tony energy round: speakHint → release × 2 → gratitude × 4 → future (if big) → install → law. Optional tapping-point channel (point() calls conditional on tapOn).

**runFullStack()** (`7491`) — 5-step pipeline: breathwork → meditationQuick(attSecs) → charge timelinePlayer → blackstone timelinePlayer (drift-tap ON) → mantraPlayer. Fixed proportions: 20/30/25/… of total mins. Pre/post gauge010. Gauge ledger push.

**runRitualReset()** (`7531`) — relief-door entry: picks STACK_PACK by min (5/10/20) → pre-gauge010 → runStack() → post-gauge010 → ledger push → delta toast.

**gaugeOpen()** (`7548`) — once-per-logical-day door guard. Week mood → today mood; if ≤1 → offerRelief() (5 min / 10 min / skip). Guards on S.gaugeK === todayK(). Called from ssEnter() returning-user path.

**toolboxStageStep()** (`6883`) — toolbox cockpit stage renderer. FOR RIGHT NOW card (toolForNow()), YOUR DAILY shelf, fold-rows for All tools / Build a session / Sharpen the mind, category tabs (5 layers + Yours), tool cards with Why/When/Rung pips.

**suggestTool()** (`6860`) — mood+hour heuristic: mood≤1 → breathe; night → selfhyp; morning → mantra; else → meditate.

**toolForNow()** (`6875`) — extends suggestTool: custom tools matching nowStates() win first (sorted by S.tools.use count); else built-in heuristic. craving→blacksun added.

**partXTriage()** (`7927`), **selfHypnosis()** (`7893`), **gratefulFlow()** (`7972`) — beatRunner-based tools (not read in full, confirmed function signatures exist).

**brainGym() + games** (`7685`) — Recall (working memory sequence), Focus Cross (60s left/right rhythm), Link (memory champion chain). Scores in S.tools.games.{recall,focus,link}.

**TOOLS array** (14 entries, line 6765) — canonical toolbox registry with id/layer/name/ti/thinker/when/why/fn.

**STACK_TOOLS array** (7 entries, line 7209) — separate stack registry: stretch/relax/breathe/meditate/reprogram/mantra/gratitude. Each has .run(cb, durSec).

**TOOL_LAYERS** (5 layers, line 6781) — "Steady the body / Clear the mind / Feel it through / Become who you're being / Lift the lens".

---

## (2) ENGINES

**beatRunner** — simplest engine. One beat at a time, user taps Next. No scheduling up front (voice fires per-tap via say() which is gesture-safe). Good for: short 4-6 beat flows where user pace is the point. Does NOT schedule clips up front for iOS timer use. Has intro-card system (seen gate). No transport controls. No drift feedback.

**timelinePlayer** — most evolved engine. Pre-schedules every clip on AudioContext at exact offsets. Headspace transport bar (play/pause/±15s/scrub). RAF-driven paintNow() shows current segment label continuously. Drift-tap EMA feedback when opts.drift=true. Length/frequency truly parametric (gap math). Background bed (pad or BGM). Async decode fallback with graceful iOS-context handling. composeRitual() and composeCharge() are pure-function composers that feed it. Can be length-adaptive to any duration via the segment builder.

**breathwork** — purpose-built for breath timing. Uses scheduleClipAsync (iOS-safe). Own oscillator with swell envelope mimicking breath. Cannot be composed into a general session as a timeline; hands off via onDone callback.

**runStack** — meta-engine that chains tools sequentially. Shows inter-tool cards (Step N of M, Begin/Next tap). Each step tool provides its own run(cb, durSec) interface. Accepts inline {run} step definitions (used by runFullStack). onAll callback for wrapper gauge. Not a timeline — no scrub, no pause across steps.

**Overlaps:** meditationQuick and meditation() both launch timelinePlayer with harris seq; the difference is config screen vs immediate start + medCadence() vs fixed FREQ table. medEditor playTrack() uses timelinePlayer too — three overlapping paths to the same engine. stretchFloor and gratitudeBeat use timer-fired TTS.speak() instead of scheduleClipAsync, making them potentially silent on iOS if called from a non-gesture timer context (relaxMoment doesn't have this problem because it uses timelinePlayer).

**Most evolved:** timelinePlayer. It alone handles: length adaptation, scrub, pause/resume, multi-clip scheduling, drift-tap EMA learning, and the pad/BGM bed. composeRitual is its composer layer for the ritual grammar.

---

## (3) ADAPTIVITY

**BUILT and learning:**

- `S.tools.medFocus` — drift-tap EMA: rate (drifts/min) and n (sessions). Updated in timelinePlayer finish() when opts.drift=true. `medCadence()` reads it: returns Math.max(6, Math.min(16, round(14 - rate*2))). More drift → shorter cadence (more re-anchors). Feeds meditationQuick() and medEditor playTrack().
- `S.tools.use[id]` — rep count per tool, deduplicated per day by S.tools.last[id]. Drives toolRung() (Willingness/Habit/Grace at 1/3/12). toolForNow() uses it to rank custom tools.
- `S.tools.recents` — last 6 tool ids. Drives "Recent" shelf in toolbox.
- `S.tools.gauge` — array of {k, t, stack, pre, post} pushed after ritual/reset/fullstack. Stored up to 120 entries. Ledger exists. Not yet read back to rebalance anything — stored but unused by any prescription/rebalance function.
- `S.tools.seen[id]` — whether intro card has been shown. One-time gate.
- `S.profile.weekMood` — written by gaugeOpen(). Used by maybeWelcomeBack() and elsewhere in the broader app.

**STILL FIXED (not yet adaptive):**

- composeRitual proportions: dwell values are fixed constants (11/14/18s) by mins tier, not gauge-driven.
- runFullStack proportions: hardcoded 20/30/25% of total time. The spec §10b explicitly says "upgrading those to gauge-driven is the first §10b build" — NOT DONE.
- composeRitual pool selection: static slice by mins (≤5 → first 2 of arrive, first 2 of release, etc.). No per-user learning.
- Which guide runs in Full Stack charge: always Blackstone for the deep step, always Harris for the attention step. Not chosen by S.tools.medFocus or user preference.
- gratitudeBeat prompts: rotated by date mod 2 (two fixed triplets). Not personalized.
- The S.tools.gauge ledger: collected but no function reads it to rebalance presets or prescribe. The prescription engine ("learns which sections move THIS user's number") is ABSENT.

---

## (4) THE SEAMS

**Two parallel tool taxonomies:** TOOLS (14 entries, toolbox UI, has why/when/thinker, all launched via runTool()) vs STACK_TOOLS (7 entries, stack composer, has run(cb,d), different ids for same underlying fns). "relax" and "breathe" appear in both. "meditate" maps to medEditor() in TOOLS but meditationQuick() in STACK_TOOLS — same id, different behavior. "reprogram" and "mantra" appear in both. No shared registry; they must be kept in sync manually.

**meditation() vs meditationQuick() vs medEditor():** Three entry points for meditation. meditation() (TOOLS.meditate) now calls medEditor() (the composer). meditationQuick() (STACK_TOOLS.meditate) calls timelinePlayer directly with harris seq and medCadence(). medEditor playTrack() distributes section lines by count. All three end up in timelinePlayer but with different segment-building logic and zero shared code.

**stretchFloor / gratitudeBeat use timer-fired TTS.speak():** Unlike breathwork (scheduleClipAsync) and relaxMoment/mantraPlayer (timelinePlayer), these two use `TTS.speak()` in a `setTimeout(step, ms)` chain. This is the original iOS-silenced pattern. They will be silent on device unless the AudioContext happens to still be awake. The spec §8 "eyes-closed law" names this as a violation for gratitude — the typed Grateful Flow was to be replaced with this spoken variant, but the spoken variant has the same silence risk.

**runStack inter-tool cards require a tap per step:** Between every tool, a "Step N of M" card appears requiring a Begin/Next tap. This is correct for gesture-gated audio but violates the §8 "eyes-closed law" (no required taps mid-flow). For a 5-step micro-stack, user must tap 5 times to advance between tools while eyes are closed.

**composeRitual "Now tap X." segments:** RITUAL_POINTS generates dynamic point-cue strings like "Now tap the eyebrow point." These ARE included in gen-voice.py extraction (section 8 in gen-voice.py), so clips exist. But the composeRitual point() function also generates these as text displayed as sub-labels, so if the clip is missing the text still shows — honest silence is maintained.

**S.tools store shape — what's initialized vs guarded:** load() initializes S.tools.use and S.tools.last and S.tools.fav and S.tools.recents. S.tools.custom, S.tools.daily, S.tools.seen, S.tools.medFocus, S.tools.gauge, S.tools.games, S.tools.medTrack, S.tools.stack are NOT initialized in load() — each function guards with `|| {}` / `|| []` at access time. This means the store grows silently; consistent with the "additive, no SCHEMA bump" design but makes the shape implicit.

**RITUAL_POOLS v0 placeholder text:** The comment at line 7362 explicitly states "POOL LINES BELOW ARE v0 PLACEHOLDERS — R2 replaces them." gen-voice.py section 8 does extract them for recording. Whether the batch has actually been run against the current RITUAL_POOLS is unknown without checking the manifest, but the lines ARE in the gen-voice.py extractor.

**beatRunner voice scheduling gap:** beatRunner calls say() (which calls TTS.speak()) synchronously in the same Next-tap gesture — this IS gesture-safe. But the `say()` call fires on each individual beat's Next tap, not pre-scheduled. For short 4-6 beat flows this is fine. If a beat's clip hasn't been decoded yet from the manifest, it falls back to... TTS fallback? No — TTS.speak() checks vset and silently returns if no clip. So beatRunner tools can go silent if warmAll() hasn't reached a particular clip. The toolbox does call `TTS.warmAll()` on stackBuilder open, but not on individual beatRunner tool taps.

**No "one-door leads to two sessions" guard:** Both runRitual() and runFullStack() call gauge010() and push to S.tools.gauge. If a user somehow launches both (e.g. From separate UI paths not guarded), two gauge sessions would be active. There's no global session-is-running flag.

---

## (5) WHAT §10 PROMISED VS WHAT EXISTS

**§10 Grammar (ARRIVE → GAUGE-IN → RELEASE → ROUNDS → INSTALL → RELEASE-PEAK → BRIDGE → GAUGE-OUT → LAW → FORGET):**
PARTIAL. composeRitual() implements ARRIVE → (no GAUGE-IN inline — it's the pre-gauge010 before launch) → RELEASE → ROUNDS → INSTALL or SCAN → BRIDGE → LAW → FORGET. RELEASE-PEAK is absent. GAUGE-IN/OUT are separate modal gauge010() calls wrapping the ritual, not embedded in the timeline segments.

**§10 Channels (HANDS / BREATH / EARS / MOUTH / BED / MIND):**
PARTIAL. HANDS = tapping point cues in composeRitual/composeCharge (optional via tapOn toggle). EARS = content line voice clips. BED = peaceful pad or BGM. BREATH = not a separate channel; only the breathwork tool does paced breath as foreground. MOUTH = speak-hint line in RITUAL_POOLS tells user to repeat, but no clip listens for spoken input. MIND = no visualization channel built. "One foreground channel at a time" rule: not enforced architecturally.

**§10 Pools (teacher-mined content per grammar section, remixed in our voice):**
PARTIAL (v0). RITUAL_POOLS exists with arrive/release-AM/PM/gratitudeRound/futureRound/installAM/reframePM/reflectPM/scanPM/bridge/law/forget. gen-voice.py extracts them. Comment marks them "v0 placeholders — R2 replaces." Tony sources, Stutz/Maltz/Blackstone/Coué/magic KB pools per §10 are NOT yet in RITUAL_POOLS. medEditor sections (settle/breath/body/aware/rest/bliss/play) ARE recorded (via gen-voice.py section 7) and draw from the 4 teacher guides, but are in the meditation composer path not the ritual grammar path.

**§10 Density / adaptive guidance (frames retire with familiarity, drift EMA, appetite dial):**
PARTIAL. S.tools.medFocus EMA is BUILT and drives medCadence(). toolRung() (1/3/12 reps = Willingness/Habit/Grace) is BUILT and shows pips in toolbox cards. S.tools.seen intro-card gate is BUILT. But: frames do NOT retire from ritual content with familiarity (the same gratitudeRound lines always play regardless of run count). No appetite dial UI. No "beginner = press-play only / advanced = full desk" exposure scaling.

**§10 Objects (candle, sigil-icons, compiled anchors):**
PARTIAL for sigil-icons only. TB_SIGILS (20 Tabler icons) and the sigil picker in buildToolFlow() ARE built — user picks up to 3 icons as their custom tool mark. The candle (gesture/flame/burn-timer/stubs), mic blow-out, and compiled anchors (N-session conditioning → 60s compiled version) are ABSENT.

**§10 The Record (auto-log context + pre/post delta → prescription engine):**
PARTIAL. Pre/post gauge010 deltas are STORED in S.tools.gauge for runRitual, runFullStack, runRitualReset. The ledger exists. But no function reads it back to rebalance presets or prescribe ("learns which sections move THIS user's number" — ABSENT). The chronicle ("cites HER real logged day inside future rituals") is ABSENT.

**Register Skins (neutral-warm default / grimoire opt-in):**
ABSENT. No register dict, no skin toggle, no display-layer vocabulary swap for ritual language. Default text is neutral but there's no mechanism to switch registers.

**§10b Modular Superfood + State-Adaptive Order:**
ABSENT. runFullStack uses hardcoded 20/30/25% proportions. No pre-gauge → order/proportion computation. No QIGONG/NEIGONG RAISE pool. No session-wide HANDS setting (mudra). Tapping toggle (with/without) IS built for Full Stack (fsTap boolean) and generalizes to "charge-only" but not to all stages.

**§10c Invitational Design + Explain Channel + Beginner Rescue:**
ABSENT. No invitation/decline mechanism (no "in your mind is fine" per-stage offer). No EXPLAIN channel (why-it-works micro-explanations woven through sessions). No beginner rescue at drift moment ("That noticing? That's the rep.") — the drift-tap says "good catch — back to it" but not the "you can't fail" beginner framing with level inference.

**§10d The Braid (journey ↔ tool system as one correlated progression):**
ABSENT. No inner chapter arc beside outer journey. No practice stones on the daily trail from tool data. No guardian prescription across the seam ("your stillness is ready for 10 minutes"). S.tools.medFocus tracks drift EMA but nothing reads it back into journey nodes or journey recommendations. Relief-door runs log to S.log (via runStack tool .run() callbacks) but don't feed any journey advancement. The inner strand is a data spec only.

**R-builds status:**
- R0 (Relief door + 5-min micro-stack): BUILT. gaugeOpen() runs once/day, routes low mood to offerRelief() → runRitualReset(5/10). runRitualReset() wraps STACK_PACKS[0] ("Quick reset": stretch→breathe→relax→meditate→gratitude) with pre/post gauge010.
- R1 (Grammar+channel scheduler): BUILT. composeRitual() is the scheduler; runRitual() wires pre/post gauge and launches it. AM/PM rituals appear in stackBuilder UI. v0 pool text only.
- R2 (Pool writing + recording): PARTIAL. RITUAL_POOLS has v0 placeholder text. gen-voice.py extracts it (section 8). Whether clips have been recorded and are in the manifest is unverified from code alone — the comment says "R2 replaces them."
- R3 (The candle): ABSENT.
- R4 (Density + compile/anchors + sigil-icons): PARTIAL. Sigil-icons built (TB_SIGILS + buildToolFlow). Density EMA (medFocus) built. Compile/anchors ABSENT.
- R5 (Register skins + presets-as-authored-rituals): ABSENT.