# ALTER HANDOFF — 2026-07-08 (voice lock + 3-voice journey build)
*Paste this to prime a fresh session. Read `alter/CLAUDE.md` first (the constitution), then this.*

## UPDATE 2026-07-13 — §10f.7 HOME built (Opus, regression-zone) — the idle cockpit IS the app's landing
Built the LOCKED "Refined C2" home (§10f.7 in `_specs/HANDOFF-stacks-and-meditation.md`, David ✓). The idle cockpit is now the app's front door.
- **The face (`renderHomeFace`/`renderHomeBars`/`homeStory`, near `renderTFControls` @SEC:COCKPIT):** story bars on top (today's titled blocks, domain-colored, filled where lived — reuses the v1040 actBars visual) → "What now?" greeting → the big pink **Track CIRCLE** (CSS `.tf-home.st-idle`: pink fill, 7px `#2a1730` ring, DARK drop-shadow below, outline play, inside the dim dashed cockpit ring) → the plan sub-line chip → **"Plan my day"** dashed ghost → a tinted **tools side-scroll** (`STACK_TOOLS`, most-worn floated front via `S.tools.use`, scroll-snap squares, page dots). The circle = `playFirst` (Track); a tool tap = `runStack([{k,d}])`; Plan = `shapeFlow`.
- **How it lands:** `renderTrackerFull`'s `idle` branch now adds `tf-home` + calls `renderHomeFace` (supersedes the old 3-door §12 frame). Boot opens the cockpit via `openHomeInstant()` (no-morph, behind the z-200 start screen) for a set-up user with nothing tracking; new users (onboarding) and mid-activity/claim/night states are untouched. Sliding it down = the existing `closeTrackerFull` morph → reveals the panes/nav.
- **Additive only, NO SCHEMA bump** (reads `blocks`/`S.tools`). Ratchet passes (wipes 150≤150, anchors 19/19, SCHEMA 5). Boots clean, no console errors; home renders (8 bars, 7 tools, circle, plan) in preview.
- **DEVICE-UNTESTED (preview lies about gestures):** the slide-down morph feel, tools horizontal scroll vs the pane-swipe arbitration, and the boot-landing feel on a real returning user. Confirm on phone.
- **FLAG for David:** (1) idle now ALWAYS shows the home face everywhere the idle cockpit opens (unified, per the lock), not just at boot. (2) The old idle **docked next-sheet** (one-tap "<block> — how long?" duration-commit) is retired by the locked layout — the circle + plan sub-line replace it; say if you want that one-tap-plan wired onto the "Focus block · now" chip.

## UPDATE 2026-07-12 — PM CLOSE completed (v1028, Opus, cockpit-only) — the plan→live→close→plan-better loop now closes
The PM close already existed as a 6-beat cockpit stage (win → learn → rating → tomorrow(WOOP) → install → deal, `@SEC:COCKPIT` `pmBeatWin`/`pmBeatTomorrow`/`exitStage('pm')`). This session added the three pieces it was missing:
1. **ONE honest observation** of the day's charge — `pmObservation(mr)`, PURE from `bookendMirror`, deterministic by day-shape (all-kept / partial / drift / unplanned-but-moved / quiet), reward-never-shame, rendered in the WIN beat. Six lines gated Gate 1 + Gate 2; the one Gate-2-killed line (naked domain stat, "most hours went to your body") logged as a KILLED anchor in COPY-ANCHORS.md.
2. **Carry-forward** — the TOMORROW beat now lists today's undone blocks (`mr.missBlocks`) as tap-chips → existing `pmCarryToTomorrow(b)` safe path (blocks(tomK()).push + reflow, de-duped). Count rides into the event.
3. **THE CLEAN PLAN-AHEAD EVENT (load-bearing for next session)** — `S.plannedAhead[tomK()] = { plannedOn: todayK(), ts, oneThing, carried }`, written UNCONDITIONALLY on PM-close commit (`pmRecordPlanAhead`, called from the `exitStage('pm')` commit branch). Completing the close IS the plan-ahead action. Unambiguous: keyed by the TARGET date; `plannedOn < targetKey` = planned before the day arrived. **The next-session "Planned Ahead" hero streak reads THIS map** — do not re-derive from bk/blocks. Additive state, NO SCHEMA bump (S.tools/S.bk/S.dayClose precedent; defaulted in load() base defaults).
- Verified in preview: boots clean, no console errors, full beat-walk drives, observation renders, carry chip writes + confirms, `S.plannedAhead["2026-07-13"]={plannedOn:"2026-07-12",oneThing,carried:1}` recorded, dayClose recorded. **Flow feel is DEVICE-UNTESTED — gesture/tap feel confirm on phone.** Timeline render untouched (regression zone not entered).
## UPDATE 2026-07-12 (cont.) — THE TWO-STREAK SYSTEM built (v1029, same session, Opus, cockpit-only)
Built immediately after the PM close (David: "keep going"). FOUNDATION-PITCH "STREAK DECISION" delivered.
- **Engine (pure, read-only, `@SEC:COCKPIT` near the pm helpers):** `paDaysPlanned()` (days the user did a valid plan-ahead), `streakAhead()` → `{n, status: lit|ready|repairable|cold}`, `streakFollow()` → `{n}`, `heroProjectedClose()` (the count tonight's close will reach, since the event commits on "Rest now"). Shared `_streakWalk` allows ONE bridged gap = the make-up window (repairing IS the rep); `S.away` softens 'cold'→'repairable' (rest held). NO new stored state, NO SCHEMA change. `DEV.streaks()` inspects it.
- **HERO "Planned Ahead"** surfaces ONLY in the guardian's existing voice: the PM deal footer (projected count: "N evenings running now, planned before the day arrives...") and the AM greeting's GENERIC slot (never clobbers the identity/one-thing greetings above it; shows 'ready'/'repairable'/'cold' variants).
- **QUIET "Followed Through"** = one companion line in the deal footer at n≥2 only. Never its own surface (honors "never a 5-counter stats page").
- **Copy:** all Gate 1 + Gate 2. Judge KILLED every fire/chain-metaphor line ("chain reconnects", "went cold", "lights it again") for FORCED ANALOGY + streak-shame; rewrites are plain + effortlessly-repairable ("tonight you just pick it back up"). New streak-copy LAW logged in COPY-ANCHORS: no fire/chain imagery, a slip reads neutral, never a dead chain to rescue.
- **Verified in preview:** engine exact (ready n=3, repairable n=2, cold n=2 across seeded histories), deal footer shows projected count 4, no console errors. **AM greeting line is time-gated (`phase()==='morning'`) → its rendered display is DEVICE-UNTESTED; the engine it reads is verified.** Timeline render untouched.
- **NOT DAVID-RATED yet:** none of the PM-close or streak copy is an EPIC anchor until David verdicts it on his phone.

## NEXT (open)
- Get David's verdict on the PM close + streak voice on-device (rate lines → COPY-ANCHORS).
- Possible: a subtle VISUAL treatment for the hero streak if David wants one (kept to voice-only this session per the "no stats page" law — a visual badge would be additive, options-first).
- The de-game subtraction pass (FOUNDATION-PITCH §3) is still its own scoped session.

## STATE RIGHT NOW
- **Live: v976** on the phone (https://dmekibel.github.io/alter/fresh.html). Boots clean, verified.
- **Constraint:** NO Fable access this session; running **Opus on max**. Regression-zone ENGINE logic is DEFERRED — only safe content/data slices were shipped on Opus.
- Session was mostly research + voice + copy-deepening. The day-one FLOW was NOT restructured; the VOICE at key beats was.

## THE BIG DECISION LOCKED THIS SESSION — the voice
ALTER's iconic voice = **Sage, written by Chris Gabriel** (David's favorite channel, MemeAnalysis; he also wrote the tarot in `magic/`). ONE voice that flexes by **MOMENT, not user**:
- **TEACH moment** (a real mechanism to reveal, user is reading) → the concrete "why" drop.
- **TOUCH moment** (user is doing, or raw/tired) → one short warm line.
- **The bar: concrete or it dies.** Real noun, real mechanism, no vague lines, no sweeping "everyone who…" claims, no tidy "it was never X" reversals. Half the earlier AI-generated samples were mush; this bar kills them.
- Wired as SCRIPT-ENGINE's PRIMARY voice layer. Full doc: `_specs/VOICE-SAGE-BY-CHRIS-GABRIEL-2026-07-08.md` (read its "LOCKED MODEL" section).

## COPY AUDIT — the locked voice, now enforced AUTOMATICALLY (new this session)
The "concrete or it dies" bar is a GATE now, not a hope. Copy kept failing all session because the author graded his own work, and an author passes his own slop. Two INDEPENDENT gates every user-facing line must pass before David sees it (hard rule added to `alter/CLAUDE.md`):
1. **Gate 1, deterministic:** `python3 _dev/copy-audit.py "the line"` (or `--file lines.txt`). Regex kills dashes, emoji, the negation-contrast cadence, slop/hype words, coercive CTA grammar, and the "no idea underneath" family (grand-abstract superlatives, vague quantifiers, clinical jargon). Exits nonzero on a hard tell so it can gate.
2. **Gate 2, adversarial judge:** spawn a FRESH cheap-model agent told ONLY to KILL each line against the craft rubric (moment-not-category, one-idea-underneath, mechanism-as-feeling, no-cheerleading, could-this-be-any-app). Rewrite or cut what it kills. Prompt template in SCRIPT-ENGINE "THE AUDIT".
Proven live: the two gates caught every vague/cheerleading line the author had passed by eye, including "it was never X" reversals and "everyone feels it" sweeps — the exact tells the locked Chris-Gabriel bar names. So Gate 1+2 = that bar, automated. When new slop slips through, add its pattern to `copy-audit.py` or the kill-shot list. SCRIPT-ENGINE also gained Part 1.5 (THE CRAFT: fieldguide's 10 techniques + balance's value-bomb test) and Part 4.5 (competitor writing lessons).

## THE CONTENT MODEL — 3 voices, one journey
- **Brian Johnson** = the spine (meaning/virtue/areté; already the 8-chapter arc).
- **Cal Newport** = the hands (concrete systems). Mined: `_specs/CAL-NEWPORT-SYSTEMS-PLAIN-2026-07-08.md` + 5 layer docs.
- **Daniel Barada** = the fire (identity / "who you're becoming" / boring consistency). Mined: `_specs/DANIEL-BARADA-FIRE-LAYER-2026-07-08.md`.
- Owed content voices (mine focused, never wholesale): Therapy in a Nutshell (emotional safety), School of Life (meaning), Huberman (mechanisms). Style seasoning: Kurzgesagt/CGP/Nerdwriter (`_specs/ALTER-VOICE-BENDING-KIT-2026-07-08.md`).

## READ FIRST
- Memory: `alter-wisdom-roster`, `alter-cal-newport-mine`, `alter-script-engine`, `no-emojis-tabler-icons-only`, `no-em-dashes`.
- Roadmap: `_specs/BUILD-ROADMAP-EPIC-2026-07-08.md` (the wave order + model routing).

## SHIPPED (all voice/copy, engine untouched)
- **W1 v974** — PM close lesson (`DAY1_LESSONS.fd4`): the browser-tabs "why" + win-or-learn, em-dashes gone.
- **W2 v975** — AM fuse-loop: the `aimedAhead` greeting ("You named this last night, before the day could argue") + one-thing lesson.
- **W3 v976 (SLICE)** — the 8 `JP_CHAPTERS` `why` subtitles reshaped to the 3-voice ladder. Johnson titles kept. **The progression engine (`advanceGate`/`journeyNode`/milestone `done()`) was DELIBERATELY NOT TOUCHED — that is the regression zone.**
- **Earlier today (v968–v973, this session's first half: depth + tools + first-day):** Plan-Tomorrow adaptive intention surfaced next morning (v968); attention-adaptive ritual silences via `pauseFor` (v969); Breathe = 4 real protocols picker `breathPicker` sigh/box/4-7-8/resonance (v970); NEW true-PMR "Tense and Release" `muscleRelease` + Grateful-Flow rebuilt on mental-subtraction, tap-only (v971); Tapping/EFT gains the real SUDS rate→re-rate→adaptive-rounds mechanism (v972); Stone-1 `DAY1_LESSONS.fd0` rebuilt to PRIME→DO→NAME→CHECK→PLACE→SEAL + `fd0b` landing (v973). Tool-roster audit: MOST tools FAITHFUL, don't churn (memory `alter-tool-depth-pass`).

## NEXT WORK — pick up here
1. **TOOL UI CONSISTENCY (David flagged, OPEN).** Tools do NOT all use the beautiful unified carousel (`runStackCarousel`, ~app.js:9166). Single tools (breathwork, tapping, gratitude, meditation) fall back to their own older card UIs. CTA buttons are a mishmash: `▶` (many tools), `▸` (38×, onboarding/lessons), `→` (several), and an actual **emoji `go deeper ✨` at ~app.js:4117** (violates the hard no-emoji rule; already has a ti-sparkles icon). TWO fixes: (a) QUICK mechanical sweep — standardize all CTAs to `<i class="ti ti-arrow-right">`, kill the ▶ ▸ → ✨ glyphs; (b) REAL build — route single tools through `runStackCarousel` so they all move like the carousel.
2. **W3 DEEP** — reshape the long chapter `idea` teachings (`JP_LESSON`, ~app.js:1869) + em-dash sweep in the locked voice. The progression engine stays a regression zone: spec first, do not rewire on Opus without a tight spec.
3. **W4** charging redesign (flat-then-jump, boring-consistency = the rep) · **W5** copy pass across existing surfaces · **W6** emotional-safety layer (needs Therapy mine) · **W7** identity-evidence · **W8** depth-on-demand.
4. **Prep:** topic-sample mines Therapy/SoL/Huberman; Cal transcript top-up (104 pending, `fieldguide/…/Cal_Newport/PENDING_MISSING.txt`, needs IP cooldown).
5. **Bigger open question:** day-one STRUCTURAL redesign (vs just voice) — see `_specs/FEEDBACK-FIRST-DAY-2026-07-06.md`. David asked "what do I feel as day one redesigned" and the honest answer was "voice at 4 beats, not a new flow." If he wants the flow itself redesigned, spec that.
6. **FIRST DAY v2 — THE LOCKED DESIGN (David 2026-07-08 evening, Fable; SUPERSEDES the older item-6 text below and the transparent-game intro shipped in v980).** Memory: `alter-first-day-zero-context` (the seven laws). Build on OPUS:
   - **User model:** stressed stranger, ZERO context, from a TikTok ad. Day-one register = DIRECT Duolingo-teacher clarity (the Chris-Gabriel literary register mis-fires on day one; it earns its place later in the journey). Gate-2's day-one rubric: kill for needs-a-reread / fancy / vague / cheesy / FALSE SCIENCE / assumed context.
   - **Day one = one continuous argument:** the onboarding spark line is sentence one; every screen after is the next logical sentence. No tone restarts.
   - **Onboarding adds two early beats:** AGE (chips) + experience CHECKLIST ("Which of these have you tried?" meditation/journaling/therapy/breathwork/none, multi-select). These set the explanation dose app-wide. "None" reply: "None yet? Good, nothing to unlearn. I'll start at the beginning."
   - **Stone 1 rebuild (replace the v980 transparent-game intro slides, which David killed as cheesy):** bridge line → the ASK ("Do you have thirty seconds? That's enough to try a scientifically proven way to calm your body down.") → SCIENCE-SANDWICH stack: before-line + exercise + after-line. Stack = muscle release + breath ONLY (mantra REMOVED from stone 1, returns as a later stone once its science-before earns it). Gated copy (both gates passed, science verified): squeeze/release contrast line; exhale→vagus line; "same nerve doctors use to calm a racing heart" after-line. The recap keeps the tension pre→post + "you just ran the whole app: plan, do, track."
   - **Johnson rooting:** day one = Module O oversimplified (Flip the Switch = the 60-sec body switch; Initiate & Celebrate = the pact stone; eulogy-WHY later, lighter). `_course/COURSE-MAP.md` = spine. The journey = the 300-day course, cleverly oversimplified.
   - (Older, still-valid pieces from the first pass: yes-ladder as the flow's spine; guardian-as-daimon line 1 David approved for LATER, non-day-one use; drop the "use me less" thesis; universal entry, never app-hopper framing.)

   *Prior item-6 text (historical):* STONE-1 OPENER copy (drafted this session, needs a final pass through the LOCKED Chris-Gabriel voice + both audit gates before wiring). Explored as the guardian-AS-daimon (Brian's daimon = ALTER's guardian) fused with the areté-gap and closed with a Cialdini yes-ladder. David: line 1 "powerful," keep. Current 3-line draft (passed Gate 1 only):
   1. "I am the part of you that already knows who you are capable of being. You have heard me clearly on your best days. Then the noise comes back, and I get hard to hear." (LOCKED, David approved)
   2. "That distance closes one small rep at a time, never in a single leap. Every January proves it." (REWRITE: "never in a single leap" is the tidy reversal the locked bar bans.)
   3. "So here is all I am asking today. Sixty seconds. One minute, once, and you owe me nothing after. That is a yes you can afford to make." (the yes-ladder close.)
   **Greenlit principle:** the **yes-ladder** (Cialdini commitment-and-consistency, foot-in-the-door) is the FIRST-DAY FLOW's spine — each step earns the next affordable yes so the user invests one small yes at a time. Fold into the flow build, not just this line.
   **Also from this session (David verdicts):** DROP the "app wants you to use it less / graduation-as-thesis" line from the opener (he does not vibe with it). Anchor on UNIVERSAL struggle (the New Year's resolution, the gap everyone feels), NOT a jaded "you have tried other apps" framing. Tune HARD into Brian Johnson (the main textbook / his course in `_course/`); the guardian speaks AS the daimon, not a coach describing it.

## HOW TO WORK HERE (from the constitution)
- **Ship loop:** `bash _dev/preship.sh` → `git add app.js index.html server.js` (NAMED files, NEVER `-A` — research artifacts stay local) → commit (end message with the Co-Authored-By line) → push → hand David `/fresh.html`.
- **Copy:** load `_specs/SCRIPT-ENGINE.md` + run its procedure. Concrete or it dies. No em-dashes, no emojis (Tabler `ti-*` only).
- **Navigate app.js by grep `@SEC:` / `@CONTRACT`, never line numbers.** ~11,200 lines.
- **Regression zones** (`@SEC:TIMELINE`, `@SEC:JOURNEY-ENGINE`, `@SEC:JOURNEY-TRAIL`): spec first (10 lines), one-shot, verify boots. **Preview lies about gestures** — the only honest report is "boots clean; gesture/feel DEVICE-UNTESTED, confirm on phone."
- **Model routing:** contained builds → Opus; regression-zone/multi-region → Fable when available. State the call before building.

---
## 2026-07-09 — SPEC-FIRST-STONE-BUILD **Phase A shipped (v981, Opus)**
Spec: `_specs/SPEC-FIRST-STONE-BUILD-2026-07-08.md`. Onboarding is now the **blueprint read** the day-one stone adapts from.
- **Added 3 tapped survey questions** in `@SEC:ONBOARD` (`onboardV2` `QS`): **age** (band → `P.age`, was orphaned to unread `P.ageBand`), **experience** (meditation/journaling/therapy/breathwork/"None yet" → `P.experience`), **challenges** ("Where do you want the most help?" — 6 rows, each a short label + a specific-moment sub → `P.challenges`).
- **Occupation** captured WITHOUT a redundant screen: `finishV2` maps the existing life-shape answer → `P.occ` (an OCCUPATIONS key; powers `activeCats` + char sheet + AI context).
- **Blueprint reader** `blueprint()` added next to `activeCats` — the single normalized read the stone branches on (`everMeditated`, `practiceNovice`, `wantsFocus/Sleep/...`). Phase C/D consume this to baby-step meditation for novices etc.
- **Biomes dropped** (David 2026-07-09: "don't like the biome idea for onboarding"): removed the region-gate transition beats + the per-section screen tint (`data-sec=""`). Questions flow in the established clean-card style. The battery progress bar + section labels stay (subtle, not the biome drama).
- Copy: both gates passed. Gate 2 KILLED the first challenges options as generic-category beats; reframed to label+specific-sub (the `vibe`-question pattern) and re-passed.
- **Verified in preview** (all taps, no gestures → preview is authoritative here): boots clean, zero console errors through the full flow, all 3 questions render, `finishV2` stores `age/occ/experience/challenges` correctly.
- **NEXT = Phase B (carousel opening), FABLE — regression-zone gesture/carousel work:** Tab-0 typewriter text mode, the "30s to try this?" offer, the 30/60/120 + skip chooser, press-hold-to-commit morphing into the player orb. Do NOT do Phase B on Opus. Then Phase C (round-1 guided: breath-first + gentle relax sweep) and Phase D (round-2: meditation baby-stepped via `blueprint().practiceNovice` + mantra).

### 2026-07-09 later — onboarding cleanup shipped (v982, Opus) after David's device review
His feedback: messy, unnecessary pages/questions, a menu repeating what was established, an asymmetrical top bar that filled before the flow ended, and an idea to slide screens like an IG story. Done:
- **Progress bar = one continuous whole-flow track** (equal ticks, one per non-intro beat, fills exactly at the final beat). Replaced the uneven 3-section battery. `paintBar` now just lights `tickEls[i]` for `i < bi2`.
- **Trimmed:** the 3 per-section echoes (constel is the single recap), `plantom`, `mint` (seed is the sole closer), and the `bed` + `ingredients` survey questions. `voice` pulled up next to the questions. Flow now = intro -> pace -> gender/age/stage/experience/vibe/challenges/overwhelm -> voice -> constel -> plan -> seed (**12 ticks**).
- **Watch-out:** cutting `ingredients` removed the starter-plan's good-days personalization; `planItems` now leans on friction + vibe + fallback (still renders 3 rows). Restore that one Q if the plan feels thin.
- **OWED (David said "next pass"): the IG-story slide** — advancing should physically slide the current screen left and bring the next in from the right. Touches the beat-render loop (`drawObV2` currently `body.innerHTML=""` per beat); do it as its own careful pass, verify feel on device.

### 2026-07-09 — NEXT BUILD LOCKED: **first stone = "Intro" — Phase B rebuild (FABLE, do NOT build on Opus)**
David chose the full first-stone rebuild from `_specs/SPEC-FIRST-STONE-BUILD-2026-07-08.md` (Phase B). Two decisions locked:
1. **Rename the first stone `fd0`** title "Lesson 1 · The Switch" -> **"Intro"** (in `firstDayNodes`, ~L882, + the RU dict entries). Open question for David: renumber `fd1`-`fd4` to "Lesson 1-4" (so it reads Intro, Lesson 1..4) or leave them "Lesson 2-5"? Currently a gap.
2. **Kill the orb+spinning-rays ending.** The `fd0b` lesson ends on a `seal` beat = `orbEl(46)` (the ball) sitting on the lesson overlay's `gspin` ray field (added in `runLesson` ~L913, behind every beat). Replace fd0b's final beat with a **CLEAN FORWARD LINE close**: no orb, no spinning rays (hide `.gspin` on that beat), one warm forward line per the spec ("close on a real forward line, no meta"). Copy through BOTH gates.
- **Phase B scope (the carousel opening, Fable regression zone):** Tab-0 typewriter text hook (not an orb) -> "Do you have thirty seconds to try this?" -> 30s/60s/120s + skip chooser -> press-hold-to-commit morphing into the player orb -> the guided stack (breath-first, then gentle relax sweep). Reuse `firstDayStack`/`timelinePlayer`. REGRESSION CONTRACT: this is the 3x-rebuilt carousel; spec-first, boot-verify only, gesture feel DEVICE-UNTESTED. One focused Fable session; do not also cram Phase C/D.

### 2026-07-09 — **Phase B SHIPPED on Opus (v983)** — David had no Fable access, said "do it anyway" (his override, I'd flagged Fable)
Built with regression-zone care by reusing the carousel UNTOUCHED and only rewrapping `firstDayStack`'s opening + ending:
- New flow: typed HOOK (3 EPIC-anchored tension lines, word-by-word via `.obi-w`, no orb) -> OFFER "Do you have thirty seconds to try this?" -> `30s / 1 minute / 2 minutes` + `not now` -> tap a chip reveals the press-hold COMMIT ring (`.ob-pwrap`, reused seal gesture, 1.5s) -> `launch()` runs `runFirstStack([breath, relax], ...)` (breath-first, secs split from the choice) -> the proof `stackRecap` = the clean forward close. Node renamed to **Intro**; `runLesson(fd0b)` (the orb+spinning seal) removed from the node act.
- **VERIFIED (preview/boot only):** syntax ok, zero console errors, hook/offer/commit all render, node reads "Intro". **DEVICE-UNTESTED (tell David):** the press-hold gesture FEEL, the breath+relax carousel, and the audio — synthetic pointer events do not fill the ring in preview (expected). Confirm on the phone.
- **DEBT / OWED:** (1) `firstDayStack` still contains the OLD `showIntro`/`showPlan` opening as **retained-but-dead code** (kept to avoid transcribing the fragile plan-UI) — delete in a clean pass. (2) `tr("Intro")` has **no RU entry** yet (shows "Intro" in RU mode). (3) Renumber `fd1`-`fd4` "Lesson 2-5" -> "Lesson 1-4"? still open. (4) The IG-story slide still owed. (5) Per-tool why+results deepening (Phase C polish) not done.

### 2026-07-09 — **Phase D (round-2 escalation) SHIPPED on Opus (v984)** — David asked where meditation/mantra/gratitude went; chose "let it adapt"
After the breath+relax recap, `stackRecap`'s button now -> `showEscalation` (not straight to onDone):
- **Adaptive** via `blueprint()`: `lowDoor = lowStart || vibe stuck|overwhelmed` -> **gratitude + a baby-stepped sit** (`med.med=[{k:'settle'}]` for `practiceNovice`); else -> **stillness + mantra** (mantra last). Offer -> `runRound2` -> `timelinePlayer(composeStackSegs(list2))` (no second gauge; the carousel already supports `gratitude`/`mantra`/`medit` via STACK_CONTENT) -> logs to day -> `showPower` names the mechanism + `earn(6)` -> onDone. `I'm good for now` skips.
- Copy both gates (judge killed the gratitude power line twice; final: "You found a few good things and gave them a quiet minute. Naming them is what makes them stick.").
- **DEVICE-UNTESTED:** the whole round-2 chain (offer -> carousel -> power) sits behind the device-only carousel + hold; preview can't reach it. Syntax ok, boots clean, opening flow intact after the recap rewire.

### 2026-07-09 — Intro POLISH pass (v985-v989), all Opus, all from David's device notes
The "Intro" stone (`firstDayStack`) flow is now: **HOOK -> OFFER(pick time)+clarity -> HOLD(commit) -> breath+relax carousel -> proof RECAP -> ROUND-2 offer(context+pick time)+HOLD -> round-2 carousel -> POWER -> onDone.**
- **v985:** killed the "30 seconds?" vs 30s-chip redundancy; gauge010 rebuilt slider -> tappable graded bars.
- **v986:** hook reveal is now opening-style — lines one-at-a-time, FAST word-cascade within each (`.obi-w` at 0.045s/word), key words colored (HUES: tension/edge pink, tuned/personality/wound yellow) + sized up (BIG map 1.16-1.28em), tap-to-fast-forward. Knobs: the 0.045 cadence, the HUES/BIG maps in `showHook`.
- **v987:** BACK nav — `addBack(fn)` puts an `.ob-back` chevron (fixed top-left, tracked by `backEl`, cleared in `clearBoth`) on offer+commit; hook (first) has none. Offer reframed to "How much will you commit?"; hold simplified to just "Press and hold to commit."
- **v988:** offer sub clarifies the target ("to tell your body the emergency is over."). Round 2 now MIRRORS round 1: context sub on the two tools -> its own time picker -> the SAME press-hold. `showCommit(secs, onCommit, backFn)` is generic; `runRound2(totalSecs, lowDoor, bp)` splits the time across its two tools.
- **v989:** gauge010 supports press-and-DRAG (pointerdown/move + setPointerCapture, finger x -> level 0-10, `touch-action:none`); tap still works.
- **STILL OWED:** (1) the full IG-story tap-navigation + slide (David keeps circling it; the `addBack` groundwork is in — next natural step). (2) dead `showIntro`/`showPlan`/`showRecap` in `firstDayStack` (delete). (3) `tr("Intro")` RU entry. (4) renumber `fd1`-`fd4`? (5) all the device-untested gesture/carousel/audio bits confirmed on the phone.

### 2026-07-09 — Intro second-half DEEPENED + breath circle (v990-v993, Opus)
The **Intro** (`firstDayStack`) is now, end to end: HOOK (animated) -> offer "How much will you commit?" + "to tell your body the emergency is over." -> hold ("commit to a breath, then your body") -> pre-rating -> breath+relax carousel -> `showEscalation` "Keep the momentum. Complete the set." + "a short meditation, then a mantra to carry." -> time -> hold ("commit to a meditation and a mantra") -> **PRIME meditation -> meditate -> PRIME mantra -> mantra** -> post-rating -> `showClose` (proof + strong animated ending). All guardian prose animates via `animLines`/`narrate` (word-cascade, `HUES_ALL`/`BIG_ALL` color+size).
- **v990:** rating moved to bookend both halves; round 2 was pick-two (later replaced).
- **v991:** deep per-tool copy + strong close + commit-names-what + `animLines`/`narrate` extracted from the hook.
- **v992:** `@keyframes breatheReal` (16s = 4-4-6-2) on the timelinePlayer orb; breath segs tagged `breath:"in/hold/out/rest"`; `paintNow` restarts the orb on each "in" cue so it expands with the inhale + keeps breathing through the other tools. Standalone `breathwork` (own overlay) untouched. Meditation ordered before mantra.
- **v993 (David's latest):** round 2 is now a GUIDED meditation->mantra, each PRIMED before it (gratitude cancelled, pick-two dropped). `MED_PRIME` = Sam Harris "don't author your next thought / narrating and calling it thinking" + two-gears science; `MANTRA_PRIME` = Withers inherited-voice + Dispenza rewire. `runGuidedPair` -> `narrate(prime)` -> `runOneTool` per practice.
- **ALL device-untested** behind the carousel+hold. `showExplain`/pick-two/`stackRecap` now dead/removed. Every line passed both copy gates; the Gate-2 judge (Haiku, reads COPY-ANCHORS) called the priming DEEP/EPIC.
