# DESIGNER 3 — THE EXPERIENCE
## "One Session, One Voice, One Mark" — the complete gameplan

---

## 0. THESIS

"1000x" is not more tools, more pools, or more screens — it is the moment the app stops feeling like a menu of recordings and starts feeling like ONE living practice that knows you. Concretely: every entrance (relief door, FOR RIGHT NOW, stack builder, AM/PM ritual, meditation) collapses into a single SESSION object composed by one grammar, run by one engine, closed by one FINISH — and the finish is where the 1000x lives, because that is where the app does the thing no competitor can copy: it shows you your own delta (7→4, on the stripe gauge, animated), writes one chronicle line in your own record, and next time it opens its mouth it cites that record back to you ("Last time this took you from 7 to 4"). Headspace plays you a file; ALTER runs an experiment on your nervous system, shows you the result, and remembers it. The text system serves the same thesis: every line rewritten to the register of a guardian who has *watched your actual days* (the "rent-free in your head" / "I'll wait." voice from Map 2's CLEVER column), and every line that could appear in a generic wellness app is retired. Cheapest first: retiring a weak SPOKEN line from rotation costs zero recordings; rewriting SCREEN text costs zero; the one new recording batch is small, late, and David-approved.

---

## 1. ARCHITECTURE — what merges, what dies, what's new

### 1a. What MERGES (the seams from Map 1, closed surgically)

**MERGE 1 — One registry: `TOOLKIT` replaces TOOLS (app.js:6765) + STACK_TOOLS (app.js:7209).**
The two-taxonomy seam (Map 1 §4: "relax"/"breathe"/"meditate"/"reprogram"/"mantra" duplicated with divergent behavior) dies. One array, one entry per tool: `{id, layer, name, ti, thinker, when, why, compose(durSec, ctx) → segments, mode}`. `compose()` is the new contract: every tool is a **pure segment-composer** feeding the one runner — exactly the composeRitual()/composeCharge() pattern (app.js:7429/7478) generalized. The toolbox renders from TOOLKIT; the stack tray renders from TOOLKIT filtered by `stackable:true`. The "meditate maps to medEditor in TOOLS but meditationQuick in STACK_TOOLS" split resolves: one `composeMeditation()` (see §4), context decides config-screen vs instant.

**MERGE 2 — One runner: `sessionRunner` = timelinePlayer (app.js:7085) + hold-segments.**
timelinePlayer is already the most evolved engine (Map 1 §2: pre-scheduling, transport, drift-tap EMA, pad bed, length = gap math). It absorbs beatRunner (app.js:6989) by adding ONE segment type: `{hold:true, lab, sub, clip?}` — the timeline pauses at a hold segment and waits for the tap (the tap is the gesture that schedules the next clip run, keeping iOS-safe audio). Stutz tools (Reversal of Desire, Active Love, Black Sun, Vortex, Jeopardy, Inner Authority — tap-paced, eyes-open, user-pace-is-the-point) become sessions of hold-segments. Nothing about their feel changes; what changes is they can now be COMPOSED into a stack, get the transport bar, get the drift-tap, get the finish. beatRunner's intro-card (seen gate) becomes a `{hold, intro:true}` first segment.

**MERGE 3 — runStack (app.js:7284) dies as a tap-chain; stacks become segment concatenation.**
The "Step N of M · Begin/Next" card between every tool is the app's loudest eyes-closed-law violation (Map 1 §4; spec §8). Replacement: `composeStack(steps, budget)` concatenates each tool's `compose()` output with a TRANSITION segment between tools — one already-recorded clip ("One slow breath — arrive here." ◆, POOLS-v1 §2) + a 4s gap + the next tool's first clip. **Zero new recordings for v1 transitions.** Result: a 5-tool micro-stack = one continuous 5-minute timeline, one play tap, zero mid-flow taps, full scrub/pause across the whole session. Hold-segment tools inside a stack keep their taps (they're eyes-open by design — the law governs audio-guided flows).

**MERGE 4 — Three meditation entry points → one `composeMeditation()`** (meditation() 5652 / meditationQuick() 5757 / medEditor playTrack() 7761 all rebuilt on it — see §4).

**MERGE 5 — stretchFloor (7306) and gratitudeBeat (7333) move off timer-fired TTS.speak() onto sessionRunner segments.** This kills the last iOS-silence landmine (Map 1 §4) using clips that already exist (POOLS-v1 §3 RAISE lines ARE the stretch script; §14 SPOKEN GRATITUDE lines ARE the gratitude script).

### 1b. What DIES
- **STACK_TOOLS array** — absorbed.
- **beatRunner as a standalone engine** — absorbed (the function can remain as a thin wrapper during migration, then deleted).
- **The "Step N of M" inter-tool tap card** — replaced by transitions.
- **The four inconsistent finish messages** (Map 2 INCONSISTENT: "carry the calm with you" ×2, "showing up IS the practice", "that's the whole skill 🙏") — replaced by THE MARK (§1c).
- **runFullStack's hardcoded 20/30/25% proportions** (7491) — replaced by gauge-driven proportions (§10b's named first build): pre-gauge ≥7 → longer active on-ramp (RAISE+breath+release), shorter stillness; ≤3 → brief charge, long sit; medFocus EMA hot → on-ramp lengthens.
- **The emoji in the Part-X toast** (7959) and every "carry the calm" instance.

### 1c. What's NEW

**NEW 1 — THE SESSION TRAY: one surface, three exposure levels (the appetite dial made real).**
Every entrance lands on the same object — a session tray — rendered at the user's exposure level (inferred from S.tools.use totals + medFocus n, never a quiz):
- **Level 0 (2 taps to voice — the girlfriend/speed law):** the FOR RIGHT NOW card (frame 08, already built v816) shows ONE composed session with a green GO and duration chips (5/10/20 — same chunky chips as the day planner). Open → tap chip → tap GO → voice. Faster than a TikTok. The relief door ("I have 5 minutes ▶", 7548) routes HERE — it IS this card preloaded with the micro-stack preset.
- **Level 1 (the tray):** tap the session name → the tray unfolds below the card (cockpit grammar: hero above, action sheet rises with a border seam): the composed steps as **game-piece chips** — chunky solid domain-color blocks with ink borders and hard shadows, each showing its duration, in the recommended order. Swap a chip (long-press → the pool for that slot), remove (drag out), stretch (the day-planner duration chips). Budget bar fills as you edit; over-budget = the bar warns, auto-scale offer.
- **Level 2 (the desk):** "Open the desk" ghost-tertiary link → the full CapCut vertical composer (openSessionComposer 7702, already built) for power users. medEditor's inner-section composer nests here.
This resolves relief door → micro-stack → full ritual as ONE surface: they are the same tray at different presets and budgets. The finish's "another 5 or 10?" escalation appends segments to the SAME runner (composeRitual slices more pool at the bigger budget) — no re-entry, no new surface.

**NEW 2 — THE MARK: one unified finish for every session (the reward moment).**
Composition-law card, five elements max: (1) the **stripe gauge draining pre→post** — the 9px chunky diagonals (STRIPE GAUGE LAW) animate from 7 filled to 4, the drained stripes fall away as particles toward the Spark counter (reuses v804 flying-earn); (2) the delta line in the finish grammar (§3, rewrite #4); (3) **one chronicle line written and shown being written** — typewriter into "your record" ("Tue evening · 7→4 · breath + release + sit · 2 catches"); (4) the LAW spoken (rotating pool clip — the session's last sound); (5) the forward bridge — one door: "another 5?" / a next-block door if the planner has one / done. No delta available (a hold-segment tool with no gauge)? The card degrades to catches + record line. THE MARK is also where the timeline block mints (below), and where relief-door runs visibly feed the seed/journey ("this counted" — a small stone glint, per §10d).

**NEW 3 — Stack-on-timeline: RESOLVING David's deferred a/b/c call. Recommendation: (a+b) THE BANDED BLOCK.**
One block on the timeline ("Practice · 20m", tool-layer color), with **thin inner bands** — one hairline-separated band per tool in session order, each in its domain color at low saturation. Tap the block → it expands to show the bands labeled with durations and the delta (option b's honesty, on demand). Why not (c) separate blocks: a 5-tool micro-stack as 5 two-minute blocks is exactly the clutter the COMPOSITION LAW kills, and it would make relief-door users' timelines look like homework. Why not plain (a): the bands ARE the identity of the practice — the timeline's own vocabulary (finish variety encodes meaning) extended one step, and it makes the block instantly recognizable as "a session" vs a normal activity. Long intentional sessions and quick resets render identically — no context fork, no setting. This should still be shown to David as a built default he can veto, not a silent resolution — but build the banded block first.

**NEW 4 — `mirror()`: the data-text layer** (§3d) and **NEW 5 — the prescription read-back** (S.tools.gauge ledger finally gets a reader — §5 step E9).

**NEW 6 — THE CANDLE (R3, spec §10 layer 5)** — the de-clocked timer for the running stage: optional, the flame's burn = session progress (no numbers), two closes at THE MARK: blow out (done — maps to FORGET: "Now leave it alone. It's working.") or leave burning (a tiny ambient flame rides the cockpit for the rest of the day — "intention running"). Neutral register: it's just "the flame" — Shabbat/birthday-candle native. Mic blow-out stays OFF pending David's explicit reserved decision (#open); v1 close = a slow press-and-hold that dims the flame (reuses the Pact press-and-hold gesture from onboarding).

### 1d. The RUNNING STAGE (what the eyes see)
One hero per screen (COCKPIT GRAMMAR): the **orb** — breathing at rest, phase-scaling during breath segments (breathwork's scale logic ported in), flame-skinned when the candle is lit. Below it: the current section label, crossfading (no hard cuts — G13's crossfade rule applies here too). The transport bar (existing) sits at the bottom, dimming to near-invisible after 8s idle. The drift-tap: the orb IS the tap target (built v760); on tap, the re-anchor chime + the catch counter ticks up in the corner — catches are displayed as small gold pips, because CATCH = UNIT OF PROGRESS is the thesis and the pips are earned gold. Eyes-open moments (hold segments, chronicle citations, the tapping point diagram) render in the stage body under the orb; eyes-closed stretches show only orb + label at frame-scale type. No other chrome. 90% dark berry surface; the orb carries the one saturated fill.

---

## 2. HOW THE TOOLS WORK — mechanics summary (the engine contract)

```
Session = { id, name, segments:[
  {clip, gapMs, lab, sub}        // scheduled voice (timelinePlayer native)
  {hold:true, lab, sub, clip?}   // tap-gated beat (absorbs beatRunner)
  {breath:{in,hold,out,rest}, cycles}  // breath phase (absorbs breathwork's orb-scaling)
  {transition:true}              // one-breath seam between tools in a stack
], bed:'pad'|'bgm'|null, drift:true|false, gauge:true|false, candle:opt }
```
- `composeX()` functions are PURE (composeRitual precedent) — testable in preview without audio.
- Ordering law (§10b) lives in `composeStack`: pre-gauge + medFocus compute on-ramp/stillness proportions. Never fixed.
- Invitation law (§10c) v1: any segment pool tagged `invite:true` (movement, speak-aloud, tapping) gets a decline chip at the tray level (not mid-flow — mid-flow decline UI would violate eyes-closed); declining is stored in `S.tools.prefs` and recomposes future sessions. Session-wide HANDS setting (tapping/mudra/still) generalizes the v785 fsTap toggle — one tray toggle, applies to all stages.
- One global `S.tools.running` flag closes the "two sessions at once" seam (Map 1 §4).
- `TTS.warmAll()` moves to session launch (inside the GO gesture) — closes the beatRunner silent-clip gap.
- Everything additive: `S.tools.stacks`, `S.tools.prefs`, `S.tools.running` guarded, no SCHEMA bump.

---

## 3. THE TEXT SYSTEM

### 3a. The Voice Bible (10 laws — becomes `_specs/VOICE-BIBLE.md`, the lint for every line)
1. **The guardian has WATCHED you.** Every line written as by someone who has seen your actual days — the "rent-free in your head" / "I'll wait." / "right after a win, when the work quietly stops" register (Map 2 CLEVER). Test: could a stranger have written it? Kill it.
2. **Name the specific thought, not the emotion category.** "part of me wants to stay in bed" beats "some stress." One concrete noun per line minimum.
3. **The mechanism is the poetry.** "real things, remembered" — say what is literally happening and it becomes the best line. No wellness perfume, no neuroscience-newsletter voice.
4. **Shortest true version.** The bar is "Now leave it alone. It's working." — 7 words, full authority. If a line can lose a clause, it must.
5. **The user is the grammatical subject, acting.** Never "whatever happened today doesn't decide…" — the subject decides.
6. **One grammatical contract per spoken round.** An INSTALL round is all present observation, or all present intention — never mixed (fixes Pool 7's three-mode wobble).
7. **The close is a bridge, never a summary.** "Carry it into the next thing" pattern — every finish points forward.
8. **Data beats adjectives.** If a real number exists (delta, catches, return count, days, best), the line uses it and drops an adjective to pay for it.
9. **Honor-then-pivot** for anything negative (the Tony setup form, Arsenal #1). No pivot without the honor.
10. **Ban-list (hard lint):** carry the calm with you · blessings · powers · Life Force · slip past the critical mind · feel it land in your body · every day in every way · where attention goes · deeply relaxed · journey (as spoken noun) · any emoji.

### 3b. Twelve+ BEFORE → AFTER rewrites

| # | BEFORE | AFTER | Surface / cost |
|---|---|---|---|
| 1 | "what I'm about to show you gives you real powers. this is no joke." (onboarding, L1117) | "everything here runs on one fuel: things you actually did. I can't be fooled — that's why this works." | **SCREEN — free** (de-cheese law violation fixed) |
| 2 | "carry the calm with you" (tool + stack closers) | Finish grammar, forward-bridge: "Done. The next thing you do gets done by this calmer person." | **SCREEN — free**, unifies 4 closers |
| 3 | "your session · take your time" (stack step card — card itself dies, line moves to tray) | "you're at [pre]/10. Let this move it." (fallback, no gauge: "your pace. I'll keep the time.") | **SCREEN — free** + data hook |
| 4 | "Session complete / [N] tools · carry the calm with you" | "[pre] → [post]. You did that with your own nervous system." (no delta: "Five tools, one sitting. That's a practice, not an app visit.") | **SCREEN — free** |
| 5 | "you labeled it — that's the whole skill 🙏" (Part-X toast, L7959) | "Named. It loses rank once it has a name." | **SCREEN — free** + emoji violation fixed |
| 6 | "A quiet beach" (Self-Hypnosis beat) | "Somewhere yours" — sub: "not a stock beach. The place your shoulders already know. Go there." | **SCREEN — free** |
| 7 | "the compressed Life Force itself" (Black Sun, L7868) | "a compressed charge — everything the craving was borrowing against." | **SCREEN — free** (de-cheese) |
| 8 | "I appreciate all the blessings and gifts in my life." (virtue) | "I notice what's already working — on purpose." | **SCREEN — free** |
| 9 | "I dominate my fundamentals so I have Heroic energy." (virtue) | "I keep the basics so cheap I never skip them." | **SCREEN — free** (brand-term leak fixed) |
| 10 | "Watching thoughts without grabbing them quiets the mind's default chatter — focus returns." (Meditate WHY) | "You can't stop thoughts. You can stop chasing them — and the mind goes quiet on its own." | **SCREEN — free** |
| 11 | "A repeated phrase in a calm state seeds the subconscious — repetition is how self-image installs." (Mantra WHY) | "Say a line enough mornings and it stops being a line — it starts sounding like you." | **SCREEN — free** |
| 12 | "A calm, focused state lets a new self-image slip past the critical mind and land" (Rewire WHY) | "A calm, focused brain rehearses an imagined self as real. Not a trick — it's just what practice is." | **SCREEN — free** (NLP-patter de-cheesed) |
| 13 | "Every day, in every way, I'm getting better and better." (Pool 7 INSTALL) | **RETIRE from rotation** (zero cost); the already-recorded "I'm getting steadier — and I can feel it." is promoted. Replacement recording (optional, batch): "Steadier than yesterday. That's the whole job." | **SPOKEN — retire free / re-record optional** |
| 14 | "Where attention goes, the day follows." (Pool 12 LAW) | **RETIRE**; batch replacement: "The day doesn't need you perfect. It needs you back." | **SPOKEN — retire free / re-record in R2b** |
| 15 | "A calming heaviness starts at the top of your head — jaw loose, neck soft." (Pool 10 SCAN) | "Let the face stop working. The jaw first — it's been on all day." | **SPOKEN — re-record (R2b)** |
| 16 | "Someone who makes life warmer…" (Pool 14) | "Someone who'd be surprised to learn they got you through today…" | **SPOKEN — re-record (R2b)** |
| 17 | "Now bring a goal to mind. Something you actually want." (Pool 6) | "Bring the goal to mind — the real one. Not the one you tell people." | **SPOKEN — re-record (R2b)** |
| 18 | "Trade one expectation for one appreciation. Just for now." (Pool 5) | **RETIRE**; batch: "One thing that was going to be nothing today — and wasn't." | **SPOKEN — retire free / re-record** |

**The retire-first policy (key economics):** every weak SPOKEN line lives in a rotation pool — dropping it from the pool array costs nothing and orphans nothing (the clip just stops being scheduled). Rewrites become a small approved batch (R2b), not a blocker. Map 2's do-not-touch list ("Now leave it alone. It's working." / "What's wrong is always available. So is what's right." / "There's a heart in there…" / "pulled, not pushed") is enshrined in the voice bible as anchors.

### 3c. New pool content in the batch (R2b, David approves via POOLS-v2 file first)
- **EXPLAIN channel starter (~12 lines, §10c):** logos/ethos/pathos micro-explanations, density inverse to experience. Sample register: "Tapping isn't magic — it's a safety signal your body reads faster than words." / "This next part is old. Monks did it before science could say why it works. Now it can."
- **Beginner rescue (~3 lines, at the drift moment):** "That noticing? That's the rep. The skill was never holding on — it's coming back kindly. You just did it."
- **Number halves (~14 clips):** "one"…"ten", "points lighter", "points heavier — and you showed up anyway", "catches" — so THE MARK and future rituals can SPEAK the delta by halves (B3 mechanism), e.g. "three" + "points lighter".
- **Chronicle frames (~4 clips):** "Here's one from your own record." / "You wrote this." / "Three weeks ago this took everything you had." — the voice speaks the recorded FRAME; the SCREEN shows her real logged line during the dwell gap (a designed eyes-open moment). This is the never-hands-over 1000x with zero runtime TTS.
- **Qigong RAISE pool (~7 lines, §10b)** and **replacement lines from 3b**. Total batch ≈ 45–55 clips × EN+RU.

### 3d. `mirror()` — the mechanism for text that cites REAL data
A small registry of guarded data-reads, each returning a clause or null: `delta.last(toolId)` ("last time: 7→4"), `returns.count` ("you've come back 9 times"), `gap.human` (exists — L1816, the proven template), `catch.trend` ("your attention held twice as long this week"), `best.game(id)`, `streak.now`, `bk.identity` (the user's own AM line). Copy templates declare slots: `"Last time this took you from {delta.pre} to {delta.post}."` — a template renders ONLY when every read has real data; otherwise the timeless fallback line renders. This generalizes the one place it already works (the return-after-gap line, Map 2 MISSED DEVICES #5) to: tool WHY lines (device #1), the tray card (#4), Brain Gym ends ("Good run · your best is 9", #7), Grateful Flow ("You keep coming back to '[x]' — still the one?", #8), and the Rewire install beat surfacing the user's own S.bk identity line instead of a stock example (#6 — SCREEN-only, free). SPOKEN data goes through number-halves only; screen data is unrestricted.

---

## 4. THE MEDITATION SPINE

**One epic adaptive sit ("The Sit") + a type menu + an invisible level ladder — and the crucial fact: most of it is composition work, not recording work, because the four teacher banks (Harris, Headspace-style, Blackstone, Adyashanti — Map 2 §E) are ALREADY RECORDED clips.**

- **`composeMeditation({mins, type, level, cadence})`** — pure function, one grammar: ARRIVE (settle pool) → BODY (Blackstone ground lines) → ANCHOR (the level/type-specific middle — the bulk) → OPEN (level ≥2: sounds/space lines) → REST (Adyashanti lines, level ≥3) → RETURN → BRIDGE (the action question, AM only — Arsenal #15). Length adapts by EXPANDING sections (more pool lines + longer gaps — silence deepens), never by trimming the grammar. Cadence rides medCadence()/medFocus EMA (built v760). This one function replaces the three divergent segment builders in meditation()/meditationQuick()/medEditor (Map 1 seams).
- **Type menu (inside the meditation step, never top-level — spec §4):** default = The Sit (adaptive). Types swap the ANCHOR pool: **Sounds** (2 min, existing Harris sound lines) · **Body scan** (2 min, existing relax/Blackstone lines) · **Vipassana/noting** (needs ~6 new lines — R2b optional) · **Heart** (level-4, BLOCKED on David's Spero link — DAVID-PENDING, do not draft).
- **The ladder (§4c/§10d), invisible placement:** L1 Focus (breath-counting + Harris whole-breath) → L2 Embodiment (Blackstone) → L3 Resting Awareness (Adyashanti) → L4 Heart/Bliss (pending). No quiz ever: the first 3 drift-tapped sessions are the placement test; advancement = medFocus EMA trend + tolerated stillness minutes + runs/week — measured skill, never content consumed. The level changes which sections compose in, the cue density, and the drift-tap RESPONSE register (beginner rescue lines at L1; near-silence at L3). Surfaced as the INNER chapter arc of the braid ("your stillness is ready for 10 minutes" — the guardian prescribes across the seam), but the braid surfaces themselves are a later run — the ladder's data plumbing ships now, its journey geography later.
- Level shapes the BUILDER exposure too (§10c): L1 user sees Level-0 tray only; the desk unlocks with demonstrated appetite.

---

## 5. BUILD SEQUENCE (each step shippable + device-testable alone; freeze-aware: E1–E2 are July-7-safe screen work, engine steps after the freeze)

- **E1 — THE MARK (screen-only, no recordings).** Unified finish card: stripe-gauge drain animation, delta line, chronicle typewriter line, forward bridge. Wire runRitual/runFullStack/runRitualReset finishes to it; kill the 4 divergent closers. RU strings same commit. *Device test: run 5-min reset, see the mark. Gesture-free — preview-verifiable except the drain animation feel.*
- **E2 — VOICE-BIBLE SCREEN SWEEP (no recordings).** All 12 SCREEN rewrites (§3b) + ban-list sweep + emoji fix + retire-first pool edits (drop weak SPOKEN lines from rotation arrays — zero orphaning) + write `_specs/VOICE-BIBLE.md`. RU dict same commit. *Fully preview-verifiable.*
- **E3 — ONE REGISTRY.** TOOLKIT merge (TOOLS+STACK_TOOLS), `compose()` contract, delete duplicate ids, `S.tools.running` flag, warmAll-on-GO. Behavior-neutral refactor. *Boots-clean + every tool launches in preview; regression-contract re-check (touches nothing in the timeline zone but confirm).*
- **E4 — ONE RUNNER.** sessionRunner (hold + breath segments into timelinePlayer); port the 6 Stutz beatRunner tools; composeStack with breath-transitions (existing clips); stretchFloor/gratitudeBeat onto segments; kill the Step-N-of-M card; gauge-driven Full-Stack proportions (§10b first build). *Honesty: audio scheduling + hold-tap feel = DEVICE-UNTESTED until David runs it; label it so.*
- **E5 — THE TRAY.** Level-0/1/2 exposure on the FOR RIGHT NOW card (frame-08 canon); game-piece chips with day-planner duration chips; relief door routes into the same surface; escalation appends segments; HANDS session toggle + invitation declines → S.tools.prefs. *Device test with David: the 2-taps-to-voice count, chip drag feel.*
- **E6 — MEDITATION SPINE.** composeMeditation() replaces the three paths; type menu inside the step; ladder placement + advancement logic on existing data (medFocus/gauge/use); existing teacher clips only. *No new recordings except optional Vipassana lines.*
- **E7 — mirror().** The data-read registry + template slots; wire to tool WHYs, tray card, Brain Gym ends, Grateful Flow, Rewire-install-uses-own-line. *Screen-only, preview-verifiable.*
- **E8 — RECORDING BATCH R2b.** POOLS-v2 contract file → David approves register → gen-voice.py batch (EN+RU): replacements (§3b), explain channel, beginner rescue, number halves, chronicle frames, qigong RAISE. ~50 clips × 2 languages. *The ONLY step gated on recordings.*
- **E9 — PRESCRIPTION READ-BACK v1.** The first reader of S.tools.gauge: per-tool median delta → reorders FOR RIGHT NOW ranking + feeds mirror() ("last time: 7→4") + rebalances preset proportions per user. The ledger finally learns. *Screen + logic only.*
- **E10 — THE CANDLE + THE BANDED BLOCK.** Flame-skinned orb, burn-as-progress, press-and-hold close vs leave-burning ambient; banded session block on the timeline (David vetoes or blesses on device). *Pure visual; device check for feel.*

Later runs (out of this gameplan's scope, slots reserved): braid surfaces (§10d stones + inner chapters), register skins (R5 — rides the v656 dict machinery), compiled anchors + sigil-weave (R4), Brain Gym contextual surfacing (HANDOFF-brain-gym slot in the Sequencer).

---

## 6. WHAT I EXPLICITLY REJECT

1. **A third engine / a separate "ritual player."** The constitution forbids a third menu system; the same logic applies to runners. Everything rides sessionRunner or it doesn't ship.
2. **Option (c) separate timeline blocks per tool, and plain option (a).** Banded block instead — (c) is clutter that shames relief-door users with homework-looking days; bare (a) hides the practice's identity. (Presented to David as a veto-able default, honoring that this was his reserved call.)
3. **Runtime TTS / Piper for the adaptive meditation.** The spec already resolved this (§4b): clip bank + gap math. Any dynamic text is number-halves or screen-shown during a recorded frame. No exceptions — voice consistency is the product.
4. **Wholesale re-recording of POOLS-v1.** Retire-first. One small approved batch (E8), late in the sequence, never a blocker for the engine or screen work.
5. **A meditation LIBRARY of prebuilt sessions.** That's Headspace's shape and Headspace does it with a content team. Ours is one epic adaptive sit + a small type menu — CONDENSE, DON'T PILE (Soul principle 1).
6. **Any visible level/XP numbers on meditation.** The ladder is measured and mostly invisible; it surfaces as prescription language and (later) chapter geography, never "Level 2 unlocked." ANTI-GRIND law.
7. **The 4-facet compass as anything user-visible.** Already rejected as "dumb." At most, later, an invisible copy-stance switch — not in this gameplan.
8. **Moon cadence / grimoire vocabulary in the default register.** Register skins are R5, opt-in, display-dict only (the religious-mom rule). Nothing in E1–E10 speaks "sigil/altar/charge."
9. **Mid-flow invitation UI.** Declines happen at the tray, not during audio — a mid-flow "skip this stage?" prompt would violate the eyes-closed law while trying to honor the invitation law. Tray-level declines + on-the-fly recomposition satisfy both.
10. **Breath underlay on by default** (§9 flags it "possibly too much") — composer toggle, off.
11. **Mic blow-out for the candle** — David's reserved decision; v1 is press-and-hold.
12. **Any new onboarding scope.** The front-door rewrite belongs to the epic-audit run (Days 2–3); this gameplan only guarantees the relief door lands on the tray with two taps.
13. **The "quiet beach / down the steps" hypnosis patter kept for tradition's sake.** Worn words are worn; the technique stays, the stock imagery dies (rewrite #6).

**Open David decisions this plan touches but does not resolve:** banded-block default (veto-able), mic blow-out (deferred), L4 Heart content (blocked on his Spero link), R2b register approval (the POOLS-v2 contract), guardian aggressiveness of the prescription language (his reserved #8).