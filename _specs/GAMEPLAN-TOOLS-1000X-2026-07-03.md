# GAMEPLAN — TOOLS 1000× (tools · text · stacks · meditation as ONE system)
*2026-07-03 · GAMEPLAN ONLY — execution in separate sessions, one T-ship at a time. Built from a 3-proposal design tournament + 3-lens judge panel (full artifacts: `_specs/_tournament-tools-1000x-2026-07-03/`). Absorbs and sequences `HANDOFF-stacks-and-meditation.md` §10–§10d and `HANDOFF-reprogramming-toolkit.md` backlog; the text law lives in `_specs/VOICE-BIBLE.md` (standing, written 2026-07-03).*

---

## 0. THE THESIS — what "1000×" actually means

> **A session is an experiment on your nervous system. The app composes it from your walk-in number, measures what it did to you, writes the result into your chronicle in front of your eyes — and quotes it back the next time it opens its mouth.**

Headspace plays you a file. Tony runs one fixed linear ritual. ALTER plays the user's own data back at her. The 1000× is NOT more tools, longer scripts, or prettier orbs — it's that by week three the guardian is provably speaking from HER record, in a voice a stranger could not have written.

David feels it at three moments, and the plan is sequenced around them:
1. **Day one** — the text stops sounding like the wellness industry (the free SCREEN sweep, his literal ask).
2. **Every session end** — THE MARK: the stripe gauge drains 7→4, the chronicle line types itself into her record, the LAW is the last sound.
3. **Week three** — the voice cites her real numbers ("You walked in at seven.") and the composer provably orders tonight's session from her state.

---

## 1. THE CLOSED LOOP (the architecture — one diagram)

```
 gauge-in (0-10)                                   ┌────────────────────────┐
      │                                            │  THE RECORD            │
      ▼                                            │  (S.tools.gauge +      │
 orderPlan(ctx) ──── prescribe(weights) ◄──────────│   sections/drifts/     │
      │                    ▲                       │   declines per run)    │
      ▼                    │                       └───────────▲────────────┘
 composeSession(target,ctx) → SessionSpec                      │
      │                                                        │
      ▼                                                        │
 timelinePlayer (clips + gap-math, drift-tap, transport)       │
      │                                                        │
      ▼                                                        │
 gauge-out → THE MARK (drain · chronicle typewriter · LAW) ────┘
```

`ctx = { lengthSec, timeOfDay, pre, density (medFocus EMA), level (inferred), prefs (remembered declines), weights (prescribe) }`

### 1a. ONE REGISTRY (kill the parallel taxonomies)
TOOLS (app.js:6765, 14 entries) + STACK_TOOLS (app.js:7209, 7 entries) collapse into one registry:
`REG[id] = { id, layer, name, ti, thinker, when, why, form:'timeline'|'beats'|'game', compose(ctx)→segments | beats(ctx), floor:8, guards, stackable }`
- STACK_TOOLS **dies**. Packs ("Quick reset"), AM/PM rituals, the Full Stack, and future named presets become **authored presets** = saved compositions `{chapters:[regId…], weights}` (this IS R5's presets-as-authored-rituals).
- Custom tools (S.tools.custom) join the registry at load — toolForNow() (6875) unchanged.
- The "meditate = medEditor in one array, meditationQuick in the other" identity crisis resolves via one composeMeditation() (§6).
- Toolbox one-door surface (v816 frame 08) untouched — plumbing unification, not UI.

### 1b. ONE COMPOSER, TWO RUNTIMES (not three, not one)
- **composeSession(target, ctx) → SessionSpec** absorbs composeRitual (7429), composeCharge (7478), medEditor playTrack (7761), meditationQuick's seq-walk (5757) as *section generators*. Four segment-builders with zero shared code become one. Pure function — preview-testable without audio (composeRitual precedent). *Boundary: T2(b) only RE-ROUTES call sites through composeSession; the meditation grammar rewrite itself belongs to T5.*
- **timelinePlayer (7085) stays the runtime** for everything timeline-form. Two extensions only: CHAPTER MARKERS on the transport (scrub snaps to chapters) + SKIP-CHAPTER (the dignified decline as an *optional transport affordance* — skipping recomposes remaining gap-math, writes the decline to prefs). Primary decline surface stays PRE-session (tray-level), per the eyes-closed law.
- **beatRunner (6989) SURVIVES, untouched** for eyes-open user-paced cognitive tools (Reversal, Active Love, Jeopardy, Black Sun, Vortex, Inner Authority, custom tools) — **the tap IS the rep there; user pace is the mechanism, not a limitation.** (Unanimous judge kill of the absorb-beatRunner idea.) One fix only: TTS.warmAll() on every beats-form launch, inside the GO gesture.
- runStack (7284) survives ONLY to chain beats-form tools.

### 1c. THE EYES-CLOSED STACK (the unanimous fix)
The Step-N-of-M tap card between stack tools (5 eyes-open taps per micro-stack) is the app's loudest eyes-closed-law violation. **composeStack(steps, budget)** concatenates each tool's compose() output into ONE continuous timelinePlayer schedule — one play tap, whole-session pause/scrub, zero mid-flow taps.
- **Transitions cost zero recordings:** reuse the already-recorded "One slow breath — arrive here." ◆ (POOLS-v1 §2) + 4s gap as the inter-tool seam. (Upgraded glue clips ride the T6 batch later.)
- stretchFloor (7306) + gratitudeBeat (7333) migrate off timer-fired TTS.speak() (the last iOS-silence landmine) onto their ALREADY-RECORDED clips (POOLS-v1 §3 RAISE / §14 SPOKEN GRATITUDE — gen-voice.py §8 extracts them, verified by the buildability judge; keep the verify-manifest step as ritual anyway).
- `S.tools.running` guard closes the double-session/double-gauge hole.

### 1d. §10b MADE REAL — the computed order (kill every fixed proportion)
```
orderPlan(ctx):
  T = ctx.pre                 // walk-in tension 0-10
  D = ctx.density.rate        // drift EMA (S.tools.medFocus)
  onRamp = clamp(0.15 + T*0.045, 0.15, 0.55)              // high tension → long active on-ramp
  still  = clamp(0.45 − T*0.03 + rung*0.05, 0.10, 0.55)   // calm + trained → long sit
  chronicHotStart: D trend rising across sessions → onRamp += 0.08 next session (persisted)
```
Replaces runFullStack's hardcoded 20/30/25% (7491) and composeRitual's static pool slicing. Per-chapter cue spacing generalizes medCadence(): speak-gaps = clipDur + repeat-room (~4s); listen dwells 12–20s × weight; the stillness block absorbs the remainder. Length stays pure gap-math — the hash-clip law is never touched. The meditation FREQ table (often/some/spacious) dies; a manual override chip stays.

### 1e. THE PRESCRIPTION ENGINE + THE RECORD (the missing organ)
S.tools.gauge is written and never read. Close the loop:
1. Enrich the record per run (additive, no SCHEMA bump): `{sections:[{id,dur}], pre, post, drifts, tod, declines, skips}`.
2. **prescribe():** per-section EMA of delta-per-minute, credit split proportional to section duration. **Cold start = uniform weights — degrades to today's behavior, never worse.** No section ever shrinks to zero (floor law). Never fake causal precision — ONE hedged sentence on screen: *"Release does the heavy lifting for you — it usually earns most of your drop."*
3. Weights feed composeSession — the section that moves THIS user's number earns dwell.
4. **THE RECORD as a first-class object:** a viewable ledger row in the toolbox fold ("Your record") — date · session · pre→post · one line. The Book-of-Shadows that writes itself; the chronicle's raw material.

### 1f. CHANNELS + EXPLAIN
Segments declare foreground (`ch: ears|hands|explain`) and `mode: speak|listen` (Tony's alternation — voiced rounds get repeat-room gaps, listen rounds get dwell). One foreground at a time; BED (pad/BGM) and BREATH-swell are underlay (breath underlay OFF by default — David's own note). HANDS (tapping/mudra/still) generalizes the v785 fsTap boolean to a session-wide tray toggle, offered-never-forced, remembered when declined. **EXPLAIN = a named channel:** one micro-explanation clip per session max, woven at a chapter join, density INVERSE to run-count (frames retire with familiarity, rides S.tools.use). At Grace rung: no explain line — **silence is the credential.**

---

## 2. THE MARK — one unified finish for every session (the reward moment)

Kills the divergent closers at their real call-sites: app.js:5621 (breathwork finish), :7176 (timelinePlayer done card), :7300 (stackComplete "carry the calm with you"), plus the gauged-run delta toasts in runRitual/runRitualReset/runFullStack — all route into THE MARK. (The Part-X toast is NOT a session closer; it gets its own rewrite, §4a #12.) Composition-law card, five elements max:
1. **The stripe gauge drains pre→post** — chunky 9px diagonals animate 7-filled → 4, drained stripes fall away as particles toward the Spark counter (reuses `flyPoints`, app.js:5294 — the v804 flying-earn).
2. **The delta line:** *"[pre] → [post]. You did that with your own nervous system."* (no gauge? → *"Five tools, one sitting. That's a practice, not an app visit."*)
3. **One chronicle line SHOWN BEING WRITTEN** — typewriter into "your record": *"Tue evening · 7→4 · breath + release + sit · 2 catches."* Time-symmetry made visible: the present printing the past, at session scale.
4. **The LAW spoken** (rotating pool clip) — the session's last sound.
5. **One forward door:** "another 5?" (escalation appends segments to the SAME runner — no re-entry) / the next planned block if one exists / done.
Relief-door runs visibly feed the seed/journey here — "this counted," a small stone glint. Catches during the run render as **gold pips at the orb** (catch = unit of progress, in the app's own reward vocabulary). Reward tiers/earcons per REWARD-LANGUAGE.md (queued to session end — never during audio).

---

## 3. THE DOORS — entry stays faster than a TikTok

- **Level 0 (ships in this gameplan):** the FOR RIGHT NOW card (v816) shows ONE composed session + duration chips (5/10/20) + GO. Open → chip → GO → voice. The relief door (gaugeOpen 7548 → runRitualReset ~7531) IS this card preloaded with the micro-stack preset — relief door, micro-stack, and full ritual become one surface at different presets/budgets.
- **Level 2 (already built):** "Open the desk" → the CapCut composer (openSessionComposer 7702) for power users. Exposure level inferred from S.tools.use + medFocus n — never a quiz.
- **Level 1 (the chip tray) is DEFERRED:** long-press-swap / drag-out chips = a brand-new device-untestable drag surface, the app's historically worst feel-regression area. Parked for a device-day with David.

---

## 4. THE TEXT — the law + the rewrites (David's loudest ask)

**The law is `_specs/VOICE-BIBLE.md`** — the register ("a guardian, not a guru"), the ten craft devices (Watched-You Opener, Honest Why, Honor-then-Pivot, the Law, the Chronicle Cite, the Dignified Decline, the Forward Close, the Inversion Seal, the Named Part, the Under-Promise), the ban list, "I" at thresholds only, pool grammatical contracts, retire-first economics, the mirror law, the KEEPERS. Every line below already passed it + three judges.

### 4a. SCREEN rewrites — free, ship first (T1). The deduped tournament winners:

| # | Surface (anchor) | BEFORE | AFTER |
|---|---|---|---|
| 1 | Onboarding (≈L1117) | "…gives you real powers. this is no joke." | **"everything here runs on one fuel: things you actually did. I can't be fooled — that's why this works."** |
| 2 | Onboarding intro (≈L1110) | "your guardian. I'll help you become who you want to be…" | **"I keep the record. You do the living. You'd be surprised what that changes."** |
| 3 | Battery chips | "Running on empty / Getting by / Good energy" | **"empty — even this app feels like work" / "getting by" / "actually good"** |
| 4 | Meditate WHY (6765) | "Watching thoughts without grabbing them quiets…" | **"you can't stop thoughts. you can stop chasing them — and the chase is the tiring part."** |
| 5 | Mantra WHY | "A repeated phrase in a calm state seeds the subconscious…" | **"you already run on repeated phrases. you just never picked them. this one you pick."** |
| 6 | Grateful Flow WHY | "Gratitude shifts you out of the threat network…" | **"the brain can't hunt for threats and count what's good at the same time. this flips which search is running."** |
| 7 | Rewire WHY | "…slip past the critical mind and land…" | **"a calm brain rehearses an imagined you the way it rehearses a real one. you're not tricking the mind — you're giving it better footage."** |
| 8 | Breathe WHEN | "acute stress, a spike, or right before something hard" | **"the heart's going and the thing hasn't even started yet"** |
| 9 | Self-Hyp beat (≈7906) | "A quiet beach" | **"Somewhere yours"** — sub: **"not a stock beach — anywhere your shoulders have ever dropped on their own. go there."** |
| 10 | Self-Hyp countdown sub | stage patter | **"you don't have to feel anything special — the counting IS the technique. ten… nine…"** |
| 11 | Black Sun (≈7868) | "the compressed Life Force itself" | **"a compressed charge — everything the craving was borrowing against."** |
| 12 | Part-X toast (≈7959, has emoji) | "you labeled it — that's the whole skill 🙏" | **"Named. It loses rank once it has a name."** |
| 13 | Tool close (non-gauged) | "carry the calm with you" | **"Done — now go spend it."** (energizing) / echo the FORGET clip (calming) |
| 14 | Gauged close | "Session complete · N tools · carry the calm…" | → **THE MARK** (§2): "[pre] → [post]. You did that with your own nervous system." |
| 15 | Stack step sub (card dies in T3) | "your session · take your time" | surviving sub via mirror(): **"chapter [n] of [m] · you walked in at [pre]/10"** — no gauge? fallback: **"chapter [n] of [m]"** |
| 16 | Brain Gym end | "Good run" | **"Good run · your best is [N] — it's not going anywhere."** |
| 17 | Journey want-node | "Name what you actually want. One sentence — your real reason." | **"One sentence: what you want. Not the polite version."** |
| 18 | Big-3 map | "Energy, work, love — map today across all three." | **"Energy, work, love. A good day pays all three. Most days pay one."** |
| 19 | Virtue gratitude (≈5446) | "I appreciate all the blessings and gifts in my life." | **"I notice what's already working — out loud, on purpose."** |
| 20 | Virtue zest | "I dominate my fundamentals so I have Heroic energy." | **"I eat, move, and sleep like someone who plans to be here a while."** |

Plus: the ban-list grep sweep over Sage-voice strings (tools region + onboarding), the **app-wide emoji removal as its own commit** (~8 surfaces outside the tools region: app.js 340, 3643–44, 4456, 4676, 5453, 6779, 8008, 8033), and RU dict rows **same-commit** (the July-7 freeze rule).

### 4b. SPOKEN changes — retire NOW (free), re-record in the ONE batch (T6)

Retire-first: drop from rotation arrays today, zero orphaning. Batch replacements (the deduped winners — one line per slot):

| Pool | RETIRE (drop from array now) | BATCH REPLACEMENT (T6) |
|---|---|---|
| 7 INSTALL | "Every day, in every way, I'm getting better and better." | **"So far I've gotten through every single day. That's the record I'm building on."** (+ promote the already-recorded "I'm getting steadier — and I can feel it.") |
| 7 INSTALL | "I have everything I need within me, now." | *(covered by the survival line above — no extra clip)* |
| 12 LAW | "Where attention goes, the day follows." | **three new LAWs:** "You don't get the day you want. You get the day you watch." · "Attention is the one thing you spend without noticing. Tonight, you noticed." · "The day doesn't need you perfect. It needs you back." |
| 10 SCAN | "A calming heaviness starts at the top of your head…" | **"Let the face stop working first — the jaw, the eyes. It's been performing all day."** |
| 8 REFRAME | "Whatever happened today doesn't decide how I feel tonight." | **"Today got a vote on what happened. I get the vote on what it meant."** |
| 6 FUTURE | "Now bring a goal to mind. Something you actually want." | **"Bring the goal to mind — the one you'd still want if no one ever saw it."** |
| 5 GRATITUDE | "Trade one expectation for one appreciation. Just for now." | **"Somewhere today, something went right without your help. Find it."** |
| 14 SPOKEN-GRAT | "Someone who makes life warmer…" | **"Someone who'd be glad to know you thought of them just now…"** |
| 4 RELEASE-AM | "Even though I don't have all the answers yet — I release the pressure, and stay open." | **"Even though I can't see the whole road — I've never needed more than the next stretch of it."** *(flag for David's register pass: metaphor, not a verbatim inner thought — borderline vs Device 3)* |

### 4c. THE CLEVER LAYER — how text stops being generic (the mechanism)
- **mirror() / cite():** a registry of guarded data-reads (`delta.last(toolId)`, `returns.count`, `gap.human` — already proven at the return-after-gap line, `catch.trend`, `best.game(id)`, `streak.now`, `bk.identity`). Templates declare slots; **a template renders ONLY when every read is real, else the timeless fallback** — plus cooldowns so the mirror never becomes a tic. Wired to: tool WHY second lines ("last time: 7 → 4."), the tray card, Brain Gym ends, Grateful Flow ("you keep coming back to '[x]' — still the one?"), and **the Rewire install beat surfacing the user's OWN morning line from S.bk instead of the canned example** (free and profound).
- **THE NUMBER BANK (spoken, T6):** ~30 tiny clips — digits zero–twenty + stems/tails: "You walked in at" / "You're leaving at" / "Last time, this took you from" / "to" / "That's" / "days in a row." / "minutes." / "catches." / "points lighter." / "points heavier — and you showed up anyway." Composites resolve by halves (the B3 mechanism, already proven for RU). **~30 clips × EN+RU unlock every spoken chronicle-cite in the app forever — the cheapest 1000× purchase in the plan.** "You walked in at seven." is the first spoken chronicle; no competitor records it for her.
- **CHRONICLE FRAMES (spoken, T6, ~4 clips):** "Here's one from your own record." / "You wrote this." / "Three weeks ago this took everything you had." — the voice speaks the recorded frame while the SCREEN shows her real logged line in the dwell gap. A designed eyes-open moment; zero runtime TTS.
- **Level-aware variants:** intro cards, WHY lines, drift responses keyed to toolRung (Willingness/Habit/Grace). Frames retire: at Grace the intro never renders, the WHY collapses to its law form. §10-layer-4 applied to TEXT.
- **Leveled drift-rescue (the churn fix):** beginner (first ~3 sessions): *"That noticing? That's the rep. The skill was never holding on — it's catching the wander and coming back kindly. You just did it."* (T6 clip; SCREEN-only under the orb until recorded). Habit rung: "Good catch — back to it." (exists). Grace rung: **chime only, no words — silence as the graduation gift.**

---

## 5. WHAT DIES (with the law that kills it)

- STACK_TOOLS · the Step-N-of-M tap cards (eyes-closed law) · timer-fired TTS.speak() in stretchFloor/gratitudeBeat (iOS silence) · fixed 20/30/25% + static pool slicing + the FREQ table (§10b) · the four divergent closers (→ THE MARK) · the Part-X emoji · the Coué corpse + the §4b retire list · "monks/marines/ancient" ethos lines (ethos = HER record) · promissory "coming soon" locked rows in the type menu (nothing in ALTER advertises unbuilt content) · PM-journal/REFLECT double-asking when the PM ritual ran today.

---

## 6. THE MEDITATION SPINE

- **composeMeditation({durSec, level, type, cadence})** replaces the three parallel segment-builders (meditation / meditationQuick / medEditor playTrack). **It is NOT a second top-level composer — it is `REG['meditate'].compose(ctx)`, a section generator under composeSession (§1b).** Grammar: ARRIVE → BODY (Blackstone) → ANCHOR (the level/type-specific bulk) → OPEN (L2+: sounds/space) → REST (Adyashanti, L3+) → RETURN → BRIDGE (AM only: the action question feeding the one-thing node). **Length adapts by EXPANDING sections (more pool lines + longer gaps — silence deepens), never by trimming the grammar**; long sits rest on the closing pool with widening gaps. Crucial economics: **the four teacher banks are ALREADY-RECORDED clips — this is composition work, not recording work.**
- **The flagship: "The Sit"** — the epic length-adaptive default. **The type menu = weight vectors over the same pools, not code:** Sounds 2-min {open:1} · Body scan {body:1} · Vipassana {anchor + a ~6-line noting micro-pool, T6} · Heart (L4 — BLOCKED on David's Spero link, do not draft). Menu lives INSIDE the meditation step; ships only what exists. Teachers stay invisible as brands — pools, never a library (condense-don't-pile).
- **The ladder is inferred, never quizzed** (§10d): L1 Focus → L2 Embodiment → L3 Resting Awareness → L4 Heart. Placement = the first ~3 drift-tapped sessions (invisible). Advancement by MEASURED skill only: medFocus trend · gauge-delta EMA · runs/week · tolerated stillness minutes. Level gates which sections compose in, cue density, the drift-response register, and which composer controls are even exposed (beginner = press-play only; advanced = the desk). **No visible level numbers ever** (anti-grind).
- **The braid, minimum viable (§10d):** ONE practice stone on the daily trail when the week's medFocus trend improves — *"your attention held twice as long this week"* — SCREEN, computed from stored data. The stone proves the seam; the inner chapter arc is a later run.

---

## 7. THE ONE RECORDING BATCH (T6 — the only step gated on David)

Assemble **`_specs/POOLS-v2.md`** in the POOLS-v1 edit-in-place contract format → David's register pass → ONE gen-voice.py session, EN+RU. Never dribble recordings across steps. **Assembly rule: harvest the pinned lines from the three judge GRAFT lists + `map-wisdom`'s TEXT GOLD before drafting anything new** — e.g. the grafted pathos EXPLAIN line *"You've done harder things than sit still. This is just sitting still."* goes in verbatim. Manifest (~90 clips × 2 languages):
- §4b replacement winners (~10) — deduped, one line per slot
- NUMBER BANK (~30) + CHRONICLE FRAMES (3: "Here's one from your own record." / "You wrote this." / "Three weeks ago this took everything you had.")
- EXPLAIN pool (~15 — logos + pathos + record-ethos; per-rung variants; every line carries one concrete noun: "a brake pedal wired straight into the heart")
- Beginner drift-rescue (~4)
- QIGONG/RAISE pool (~7 — shake-loose, arm swings, spinal wave, one held stance; honest why: discharges arousal, wakes interoception)
- Upgraded stack-transition glue (~6: "That was the breath. Stay down — we go inward now.")
- Vipassana noting micro-pool (~6) · mudra clip (1) · invitation/decline glue (~4: "out loud if you can — in your mind is fine" ◆ variants)

---

## 8. BUILD SEQUENCE — David-ordered (text first, every engine step in the shadow of a visible win)

*Routing note for execution sessions: this gameplan pre-bakes the synthesis — `/model claude-opus-4-8` is right for every T-ship (routine build against a spec). Effort HIGH only inside T2/T3 (multi-region refactor). Every ship: `bash _dev/preship.sh` → commit (named files only, never `git add -A`) → push → fresh.html link. Audio/gesture feel = "boots clean; DEVICE-UNTESTED" until David's phone says otherwise.*

- **T1 — THE TEXT LANDSLIDE + THE MARK** *(no recordings, no engine risk — two commits, one session).*
  (a) The full §4a SCREEN sweep + ban-list grep + emoji fix + retire-first drops (§4b column 1) + RU dict same-commit. (b) THE MARK unified finish card (screen + existing v804 particle machinery) wired to runRitual/runFullStack/runRitualReset/stackComplete; kill the four closers. mirror()/cite() v1 with the guard + cooldown law, wired to the §4c screen slots.
  *Verify: preview boots + every surface renders; the drain animation feel = device.*
- **T2 — THE REGISTRY, split in two** *(no recordings).*
  (a) TOOLS+STACK_TOOLS merge, behavior-neutral — acceptance bar: every preset produces the same audible session as before. (b) composeSession() routing: call-site re-routing ONLY (composeRitual/composeCharge/playTrack/meditationQuick become section generators; the meditation grammar rewrite waits for T5); S.tools.running guard; warmAll-on-GO.
  *Verify: boots clean, every preset launches in preview. The "same audible session" bar is device-only — label DEVICE-UNTESTED until David confirms 3–4 presets sound unchanged.*
- **T3 — THE EYES-CLOSED STACK** *(no recordings).*
  composeStack single schedule with the existing ◆ transition clip; stretchFloor/gratitudeBeat onto their recorded Pool 3/14 clips (verify manifest first); Step-cards retired for timeline-form; chapter markers + skip-chapter on the transport.
  *DEVICE-TEST: the 5-min micro-stack end-to-end, phone locked, eyes closed, zero taps.*
- **T4 — THE COMPUTED ORDER + THE PRESCRIPTION** *(no recordings).*
  orderPlan() replaces every fixed proportion; per-chapter cadence; enriched record; prescribe() (cold-start uniform); THE RECORD ledger row; the one hedged sentence; FOR-RIGHT-NOW ranking reads the record.
  *DEVICE-TEST: run at pre=2 vs pre=8 — audibly different shapes.*
- **T5 — THE MEDITATION SPINE** *(no recordings).*
  composeMeditation() collapses the tri-path (as `REG['meditate'].compose`, under composeSession); The Sit + type menu (existing content only); inferred ladder + leveled drift-response (rescue line SCREEN-only for now); the one braid stone.
  *DEVICE-TEST: a 2-min and a 20-min Sit — length adapts by expanding, cue density follows medFocus, drift-tap response matches rung.*
- **T6 — THE RECORDING BATCH** *(the only David-gated step).* POOLS-v2 file → his edit pass → one gen-voice session (§7 manifest) → clips land.
- **T7 — THE SPOKEN CHRONICLE** *(needs T6).*
  citeSpoken() composites (number bank) into ritual open/close + the return path; chronicle-frame moments; EXPLAIN channel woven with rung-inverse density; beginner rescue goes audible; upgraded glue replaces the ◆ seam.

**Parked for later runs (not in this gameplan):** register skins R5 (dict machinery, screen-only forever) · the candle R3 (self-contained, awaits mic decision) · Level-1 chip tray (drag = device-day with David) · the banded timeline block (options-first chat FIRST — see §9) · compiled anchors + sigil-icons R4 · the inner chapter arc + boss-from-drift-data · Brain Gym contextual surfacing.

---

## 9. DAVID'S OPEN DECISIONS (options-first — nothing below gets built before he picks)

1. ✅ **DECIDED (David in chat, 2026-07-03 evening): (b) BANDED BLOCK.** One block; body carries the mini battery-strip grammar from the v854 pack tiles (one hairline band per tool, each in its stage color: teal·blue·orange·pink); tap → expands in place, bands thicken into labeled rows; each band charges matte→shining as the now-line crosses it (the battery law, per-tool). Rationale: reads as (a) at rest and (c) on demand; reuses two already-approved components (pack battery strips + charge law); (c) rejected — contradicts the "same activity = one block" law (v861/862). NOTE: still the only piece entering the timeline regression zone — full regression-contract re-check + DEVICE-UNTESTED labeling when built.
2. **POOLS-v2 register pass** (T6 gate) — the edit-in-place contract; also: confirm EN+RU both, or EN-first.
3. **Candle close** — mic blow-out vs press-and-hold (deferred with the candle itself).
4. **Prescription-language aggressiveness** (David's reserved guardian-voice call) — how bold the guardian's "Release does the heavy lifting for you" reads, and whether "your drop" needs a gloss on first exposure (gauge jargon before the user has met the gauge twice).

---

## 9b. FINCH/BEND TEARDOWN AMENDMENTS (2026-07-03, same-day — details in `COMPETITOR-TEARDOWN-FINCH-BEND-2026-07-03.md` Part 4c)
- **T1(b) — THE MARK rhythm:** build→burst. The stripe-drain plays SLOW first (anticipation beat), THEN the particle flight (release), THEN the typewriter. Never simultaneous.
- **T1/T6 — pact honesty-callback:** a `cite()` template referencing the onboarding pact ("You said five days. This is day three.") — screen at T1, spoken via NUMBER BANK stems at T7. The witnessed promise only converts if the witness references it.
- **Post-T2 edge — the grimoire drip:** the journey trail occasionally deals ONE untaught REG tool as a node (registry-driven; onboarding-that-never-ends). Not a T-ship; a trail edge.
- **T3+ — chapter dots on the FOR-RIGHT-NOW card:** render tonight's SessionSpec as a connected-dot chapter preview (Bend's instruction-timeline grammar = the SCREEN form of compose()). One render function over an existing spec.
- Related new spec: `HANDOFF-grimoire-pages.md` (G1 reuses THE MARK machinery — sequence after T1).

## 10. COMPANION ARTIFACTS
- `_specs/VOICE-BIBLE.md` — the standing text law (lint every future line against it).
- `_specs/_tournament-tools-1000x-2026-07-03/` — the full evidence: `map-mechanics` (every engine/seam with line numbers) · `map-textAudit` (the verbatim corpus, SPOKEN/SCREEN flagged — T1's raw material) · `map-wisdom` (the mined arsenal + text gold) · `map-lawsState` (laws + current front) · three proposals · three judge verdicts.
- `HANDOFF-stacks-and-meditation.md` §10–§10d — the source architecture this sequences; POOLS-v1.md — the recording contract format; TONY-ANATOMY.md — the grammar source.
