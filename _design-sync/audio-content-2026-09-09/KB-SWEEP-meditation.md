# KB-SWEEP: meditation technique ladders

Round question: what are the actual step by step technique moves, per meditation block, that a longer guided sit should walk through in order, and what makes each move deeper than the one before. Read-only research pass; no app.js edits made. This file is a POINTER-BREAKER, not a brief: it is meant to be read in full by the writer, per CANON's KB-SWEEP gate.

**HARD CONSTRAINT observed throughout:** for the living teachers (Harris, Puddicombe/Headspace, Blackstone, Adyashanti, Culadasa, Shinzen Young, Ingram) every move below is technique in this clerk's own words, not their phrasing. No sentence longer than 6 words is quoted verbatim from any transcript anywhere in this file. Technique NAMES coined by a teacher (Just Note Gone, Do Nothing, See Hear Feel, the Dark Night, no-bleedthrough) are cited as labels, the way a therapy modality's name is cited, not as lifted prose - the writer must still not use these labels as user-facing copy per the copyright pivot; they exist here only so this document can refer to a technique precisely.

**Source-tag key used in every move line:**
- `BL:Ln` = meditation-scripts/style1-blackstone-fundamental-consciousness.txt, line n
- `SH:Ln` = meditation-scripts/style2-sam-harris-mindfulness.txt, line n
- `HS:Ln` = meditation-scripts/style3-headspace-andy-reset.txt, line n
- `ADY:Ln` = meditation-scripts/style4-adyashanti-resting-as-awareness.txt, line n
- `TMI:StageN` = _mined/spiritual-canon/TMI-attention-ladder.md, the named stage
- `SHIN:§N` = _mined/spiritual-canon/shinzen-datamodel-drills.md, the named section (Meter 1/2/3 = the 3-meter model in §1)
- `MCTB:StageN` / `MCTB:§N` = _mined/spiritual-canon/MCTB-insight-ladder.md
- `HYP:§N` = _mined/spiritual-canon/hypnosis-ladder.md, the named section
- `PS:§name` = fieldguide/induction-library/protocol-guides/pre-sleep.md, the named template row
- `HC:§name` = fieldguide/induction-library/protocol-guides/heart-coherence.md, the named template row
- `APP:existing` = already shipped in app.js MED_BLOCKS/MED_EXTRA - continue this register, do not repeat it verbatim
- `SPC:MLS` = _specs/SPIRITUAL-PROGRESSION-CANON-2026-07-06.md, "MEDITATION LANE SYSTEM" section
- `gen` = this clerk's synthesis across sources, not a direct textual claim - flagged honestly the way hypnosis-ladder.md flags its own "(general knowledge, not from Yapko)" additions

---

## A. Provenance

**Read in full, this session:**
| File | Lines |
|---|---|
| `meditation-scripts/_STYLES-INDEX.md` | 11 |
| `meditation-scripts/style1-blackstone-fundamental-consciousness.txt` | 51 |
| `meditation-scripts/style2-sam-harris-mindfulness.txt` | 27 |
| `meditation-scripts/style3-headspace-andy-reset.txt` | 23 |
| `meditation-scripts/style4-adyashanti-resting-as-awareness.txt` | 22 |
| `_mined/spiritual-canon/INDEX.md` | 24 |
| `_mined/spiritual-canon/TMI-attention-ladder.md` | 220 |
| `_mined/spiritual-canon/shinzen-datamodel-drills.md` | 222 |
| `_mined/spiritual-canon/MCTB-insight-ladder.md` | 140 |
| `_mined/spiritual-canon/hypnosis-ladder.md` | 188 (read in full, not just skimmed - short enough, and self-hypnosis conditioning turned out directly useful for settle/count deepening) |
| `fieldguide/induction-library/protocol-guides/pre-sleep.md` | 58 |
| `fieldguide/induction-library/protocol-guides/heart-coherence.md` | 65 |
| `/Users/Dmekibel/claudeCode/KB-ATLAS.md` | 61 (full read) |
| `_specs/COPY-ANCHORS.md` | lines 1-64 of 127 (both named sections: GUIDED-VOICE REGISTER LAW, SCOPE AMENDMENT, plus the KILLED-pattern list they sit inside; did not read the EPIC anchors or the later 2026-08/09 KILLED additions past line 64, not relevant to technique extraction) |
| `_specs/SPIRITUAL-PROGRESSION-CANON-2026-07-06.md` | lines 55-146 of 146 (the MEDITATION LANE SYSTEM section plus the safety-gate section immediately above it, which the round's Section E needed; did not read lines 1-54, the psychograph-architecture framing, since not requested and not technique content) |
| `app.js` | lines 15214-15251 (`MED_BLOCKS` through `MED_SESSIONS`), lines 18941-18964 (`MED_EXTRA`, `MED_SEC`, and `STACK_CONTENT` - the last was incidental, read because it sits inside the same requested range; noted below) |

**Skipped, with reason:**
- `meditation-scripts/mantra-self-affirmation.txt` (17 lines) - not a meditation technique script; it's David's own first-person mantra for a different mechanic (Mantra-through-Song / self-hypnosis installation). Out of this round's scope by the STYLES-INDEX's own description.
- `_mined/spiritual-canon/chaos-magic-techniques.md`, `sigil-mechanic.md`, `sechenov-relevance.md` - not requested; INDEX.md itself scopes these to the magic line and (for sechenov) flags it as out-of-scope museum-design content unrelated to meditation.
- `fieldguide/induction-library/protocol-guides/theatre-of-mind.md`, `brainwave-navigation.md`, `emotional-unmemorization.md`, and `templates/TPL-001-master-template.md` - not requested (task named only pre-sleep and heart-coherence). Flagging their existence since a future round on the Sleep or a "brainwave" lane would want brainwave-navigation.md specifically.
- `fieldguide/knowledge-base/mechanism-library/` (checked per the KB-ATLAS grep step: atlas row `fieldguide-mechanism-library` matched on "breath"). Skimmed `co2-bohr-effect.md` and `hrv-heart-coherence.md` via targeted grep rather than full read: these are biological-mechanism explainers (why slow nasal breathing raises CO2 tolerance, why HRV coherence works), not technique-sequence content, so they don't feed a move ladder. One nugget worth flagging for a future breath-tool round: `co2-bohr-effect.md` names a measured "extended exhale, 6:8 ratio" as the mechanism-matched pattern for CO2 tolerance building, and a 30-second BOLT-score self-test (count seconds to the first urge to breathe) as a diagnostic - neither belongs in a guided meditation pool, both would belong in the separate breathing-exercise tool.
- The atlas grep for `meditat|breath|awareness|mindful` surfaced exactly two rows: `alter-mined-spiritual-canon` (fully covered above) and `fieldguide-mechanism-library` (handled above). No other atlas row matched; `alter-books-mind`/`alter-books-psy` (Dispenza/reprogramming/trance) did not match the grep and were not opened - they're about a different mechanic (Reprogram/mantra), not the meditation blocks this round is scoped to.
- `STACK_CONTENT` in app.js (lines 18954-18964): read incidentally, not requested. Flagging one finding: it holds a SEPARATE, simpler `medit`/`meditate` script (8 short lines, "Feel yourself sitting here..." through "witness whatever arises and passes") used by the day-one stack, independent of `MED_BLOCKS`. Not in scope for this sweep's ladder work, but the writer should know a second meditation-adjacent surface exists so a `MED_BLOCKS` rewrite doesn't silently orphan it.
- `_specs/COPY-ANCHORS.md` EPIC section and everything after line 64: not requested; the two named sections (which is what a copy-writing round actually needs) are captured in full above.

**A finding worth surfacing before Section B:** `app.js` currently defines `scan`, `listen`, `watch`, and `feel` as full `MED_BLOCKS` entries (with entry lines and 2-5 line pools each) but none of the five `MED_SESSIONS` lanes (concentration/mindfulness/open/heart/insight) actually use them. They're built and unused. Section F below proposes lanes that give them a home.

---

## B. Per-block technique ladders

Tiers: **foundation** (first-timer, first third of a sit) / **working** (the technique proper, once basics hold) / **subtle** (requires the working tier to be easy first) / **effortless** (the tier a long or advanced sit reaches, where the technique starts running without deliberate effort). Each line: the move, then its check/correction, then the source tag.

### settle
Bridges "just arrived" to "ready for the spine technique." Distinct from `embody` (below): settle is fast and general: `embody` is Blackstone's slow, one-region, whole-practice method.

1. **[foundation]** Take the seat: upright is preferred but lying or leaning back is fully valid, not a fallback. Check: never frame lying down as lesser. - `BL:L5`
2. **[foundation]** Eyes closed if comfortable; offer eyes-open soft focus as an equal starting option, not a consolation. - `HS:L5`
3. **[foundation]** A few deliberate full breaths before letting breathing return to normal. Check: this is a bridge, not the technique - let it taper within a breath or two. - `HS:L5`
4. **[foundation]** Notice the plain sensations of sitting (pressure in the back or legs, contact at the sides) before doing anything else. - `SH:L5`
5. **[foundation]** Let the seat take the body's weight rather than actively working to relax. Check: if effort creeps in, name it and hand control back to the seat. - `SH:L5`
6. **[foundation]** Name the time as unclaimed - nothing to respond to right now. - `HS:L7`
7. **[working]** Bring attention to the lowest point of contact first (feet, seat) before moving up through the rest of the body. Check: let the inhale stay low so it doesn't pull attention back up and out. - `BL:L13, L27`
8. **[working]** Progressive relaxation sweep: name each major muscle group in sequence and let each soften before the next. Check: for a spot that won't soften on suggestion alone, use tense-then-release (hold about 10 seconds, let go) there instead. - `HYP:§2 item1 + sub-variant`; `APP:existing` (MED_EXTRA.arrival)
9. **[working]** Take a plain reading of the body's state - heavy or light, still or agitated - without trying to change what's found. Check: "noticing, not changing" holds even when the reading is unpleasant. - `HS:L11`
10. **[working]** Offer an even counted breath (matched counts in and out) as an optional stabilizer. Check: any comfortable count is valid, this isn't a graded test. - `BL:L9`
11. **[working]** For an especially busy mind, let the thinking rest directly on the sensation of breathing rather than trying to quiet it separately first. - `BL:L11`
12. **[subtle]** Offer a descend image (stairs, elevator, sinking) as one optional deepener, one step equals one increment. Check: ask first whether the image carries a bad association (e.g. a stairwell fear) before using it. - `HYP:§3 item1`
13. **[subtle]** Give a timed or self-paced stretch of silence, explicitly framed as usable settling time rather than dead air. - `HYP:§3 item5`
14. **[subtle]** Let one held physical anchor (hand on chest, hand on belly) stand in for the whole sequence once it's been done in full a few times. - `HC:§Requirements`; `HYP:§5 step4`
15. **[effortless]** With repetition, a single short cue (one phrase, one number) starts to trigger the same settled state on its own. Check: name this as conditioning, not as a new instruction each time. - `HYP:§1`
16. **[effortless]** Notice, without chasing it, when settling starts happening faster or with less deliberate effort than in earlier sits. - `HYP:§1 arc`

Common corrections - settle: strain from forcing calm -> stop trying, just notice the state as it is (`HS:L11`). Posture pain -> one conscious shift allowed, not a failure (`TMI:Stage1` six-point prep, `gen`). Racing mind at the very start -> permit resting the thinking directly on the breath instead of fighting it (`BL:L11`).

### breath
The concentration-lane spine (TMI). `APP:existing` already ships 13 lines tiered find -> cycle -> sensation -> effortless; the moves below extend past that pool rather than restate it.

1. **[foundation]** Locate where breath sensation reads clearest (nostril tip, chest, or belly) and let attention settle there. Check: no location is "correct." - `TMI:Stage1` four-step transition; `SH:L7`
2. **[foundation]** Don't control or deepen the breath on purpose - let it run at its own rate. Check: if managing creeps in, name it and hand control back to the body. - `SH:L9`; `APP:existing`
3. **[foundation]** Cover one full inhalation with attention, start to finish, without judging its quality. - `SH:L9`
4. **[foundation]** Before starting, take a brief inventory of what's likely to distract (a sound, a worry, a position) so it's recognized fast rather than mistaken for something new. - `TMI:Stage1` distraction-inventory
5. **[foundation]** Arrive at the breath by a graduated path: general presence, then bodily sensation broadly, then breath-related sensation, then the exact point of contact. - `TMI:Stage1` Four-Step
6. **[working]** Track the full cycle (inhale, top pause, exhale, bottom pause) rather than one point. This is "following." - `TMI:Stage3`
7. **[working]** Stay present through the pause between breaths rather than checking out until the next inhale. This is "connecting." - `TMI:Stage3`
8. **[working]** Silently label the instant a slip is caught ("thinking," "distraction") as its own move, separate from the return itself. - `TMI:Stage3` labeling
9. **[working]** Periodically ask internally "still with the breath?" as a deliberate check rather than waiting to notice a full wander. - `TMI:Stage3` checking-in
10. **[working]** When a strong thought or feeling surfaces mid-breath, let it be noticed without it fully replacing the breath - hold both if possible. Check: if it does take over completely, that's normal too, just return without added self-criticism. - `TMI:Stage4`
11. **[working]** When discomfort competes with the breath, offer briefly making the discomfort itself the object (its exact sensations) as one option, rather than only ever fighting to stay on the breath. - `TMI:Stage4` pain technique
12. **[working]** Notice raw sensation qualities of the breath (temperature, texture, pressure), not only its rhythm. - `SH:L17`; `APP:existing`
13. **[subtle]** Sharpen the check specifically for "foggy but calm" - a stillness that feels good but where the room/body has gone vague. Check: that's subtle dullness, not depth; correct with a vividness refresh (eyes open briefly, one body-scan sweep), never by sitting deeper into it. - `TMI:Stage5`, the single highest-value correction in the ladder
14. **[subtle]** Widen the object to the whole body breathing, not the nostril/belly point alone. - `TMI:Stage6`
15. **[subtle]** Notice whether attention still alternates out to background thought at all, even briefly, versus staying unbroken with the breath. - `TMI:Stage6`
16. **[subtle]** Catch the exact instant the next in-breath starts, before it's fully arrived. - `APP:existing`; `TMI:Stage6-7`
17. **[subtle]** Test generalization by holding breath-awareness through a slightly less ideal condition (eyes open instead of closed, a normally distracting moment) rather than only in stillness. - `SHIN:§4` Motion Challenge, adapted
18. **[subtle]** Notice, without needing to report it, the longest unbroken stretch attention holds before a voluntary shift - this stretch lengthening over sits is itself a marker. - `SHIN:§1 Meter1` duration held
19. **[effortless]** Deliberately drop all effort to hold the breath for a few seconds and notice whether attention stays on its own. Check: if it scatters, effort is still load-bearing - pick it back up without judgment; if it holds, that's the mark of this tier. - `TMI:Stage7`
20. **[effortless]** Let the breath move to the background of a wider, whole-body field once it no longer needs deliberate holding. - `APP:existing`; `TMI:Stage7-8`
21. **[effortless]** If an unusually intense wave of ease, energy, or involuntary micro-movement arises, let it be without chasing or resisting it. - `TMI:Stage8`
22. **[effortless]** Let joy or heightened ease that can arise alongside very stable breath attention be allowed, while the breath stays the primary object rather than the pleasant sensation taking over. - `TMI:Stage8`; boundary with `joy` block below

Common corrections - breath: distraction fully displacing the breath -> simply return, the goal is "seconds not minutes," no story about why it happened (`TMI:Stage2-3`). Dullness -> first question is always calm-and-clear vs calm-and-foggy; foggy means subtle dullness, correct with a vividness refresh, not more stillness (`TMI:Stage5`). Strain -> if holding the breath feels gripped past what it should, that's over-control; let the object rest more lightly (`gen`, consistent with Blackstone's non-effortful register).

### count
Existing pool is thin (3 lines). Headspace's count-to-two is the richest source; the hypnosis countdown material is a genuinely DIFFERENT technique (deepening via a descending count) and is kept separate below rather than conflated.

1. **[foundation]** Count "one" on the rise of the in-breath, "two" on the fall of the out-breath - a fixed two-count loop, never counting up into double digits. - `HS:L17`
2. **[foundation]** Restart at one after every exhale rather than climbing - the number never matters, only the act of returning. - `HS:L17`
3. **[foundation]** If the count is lost, restart at one without searching for where it went. Check: no backtracking, no "was that 2 or 3." - `HS:L17`; `APP:existing`
4. **[working]** Give the out-breath the heavier emphasis; count both, but let attention rest heaviest there. - `HS:L15, L17`
5. **[working]** Notice the felt "give" or softening in the body that follows each exhale - that's the actual target, the count is scaffolding for it. - `HS:L17, L19`; `APP:existing`
6. **[working]** Use the counting rhythm itself as the correction for a racing mind: a structured, external task is often easier to hold than "just watch the breath" at the very start. - `TMI:Stage2` remedy logic, `gen`
7. **[working]** If counting starts to feel mechanical or effortful, offer dropping the count and holding the breath directly instead, framed as a promotion, not a failure. - `gen`, matching Headspace's own count-then-drop arc
8. **[subtle]** Let the numbers get quieter - said more softly, or just felt rather than fully verbalized - while the counting structure stays. - `SHIN:§4` "labels grow lighter," applied to counting
9. **[subtle]** Extend the loop only if it's serving concentration, not to make it harder - e.g. 1-in/2-pause/3-out once the pause is clearly perceptible, always optional. - `TMI:Stage3` following/connecting, applied to the counted form
10. **[subtle]** Let appreciating the sense of space that opens with each exhale become the actual point of the count, not just producing the number. - `HS:L17, L19`
11. **[effortless]** Let go of the count for a defined stretch, keeping only the out-breath emphasis, to test whether the settling effect holds without the scaffolding. - `gen`, synthesizing Headspace's count -> drop -> free arc with `TMI:Stage7`'s drop-effort test
12. **[effortless]** Notice across sits whether counting is needed less at the start than it used to be - a sign the stability is generalizing past the counted form. - `HYP:§1` conditioning arc, applied

Common corrections - count: losing the number -> restart at one, no backtrack, no comment (`HS:L17`). Count feels like work -> permit dropping to plain breath-following, framed as a promotion (`gen`). Count creeping upward instead of resetting -> gently interrupt and reset to the two-count loop (`gen`).

### note
The mindfulness-lane spine (Shinzen see/hear/feel). `APP:existing` ships 9 lines (start-with-sound through whole-field-rest); moves below extend it.

1. **[foundation]** Let attention float freely rather than fixing on one channel; note whichever of sight, sound, body sensation, or thought is loudest right now. - `SHIN:§2` "Focus on Everything"
2. **[foundation]** Apply one soft label the instant something is noticed ("hearing," "feeling," "thinking") rather than describing or analyzing it. Check: a label arriving late is a normal beginner pattern, not a failure - the goal is the label arriving earlier over time, not getting it "right" immediately. - `SHIN:§1 Meter2` labeling accuracy
3. **[foundation]** When two things arise together, pick one to note rather than trying to label both at once. - `APP:existing`; `SHIN:§2`
4. **[working]** Split a mixed or overwhelming "feeling" note into its parts - the mental picture, the inner talk, the raw body sensation - noted one at a time. - `SHIN:§2` Focus In
5. **[working]** When something is uncomfortable, offer the explicit choice: turn toward it (break it into picture, talk, sensation) or turn away from it (rest on an outer sense or a restful spot). Check: neither is more advanced - both build the same skill. - `SHIN:§2` Turn Towards/Turn Away
6. **[working]** Hunt specifically for the moment something vanishes - a sound stopping, a thought dropping, a sensation fading - not only for arisings. - `SHIN:§3` "Just Note Gone"
7. **[working]** Notice the three flavors of rest in each channel - a blank in the visual field, quiet in the head or room, a relaxed patch in the body - and note it when found. - `SHIN:§2` Focus on Rest
8. **[working]** Notice movement or change itself as its own object - a pulsing, expanding, shimmering quality - not only fixed "things." - `SHIN:§2` Focus on Flow
9. **[working]** If flooded by too much at once, re-note the SAME thing slowly a few times rather than moving to the next object - this slows the pace back down. - `SHIN:§4` "re-noting"
10. **[working]** Deliberately zoom attention in for finer detail on the current object, or out to the wider field it's part of. - `SHIN:§4` "zooming"
11. **[subtle]** Let the labels shrink from full words to a bare touch of naming, then quiet altogether while the noticing continues. - `APP:existing`
12. **[subtle]** Note co-occurring channels together as one compound label (a seen and a heard thing as one "seeing-hearing" moment) rather than always forcing a single channel. - `SHIN:§2` Inclusive Emphasis
13. **[subtle]** Let each note be a brief, full "taste" of the object rather than a sustained hold on it - touch it, then let attention move to whatever calls next. - `SHIN:§1 Meter1` momentary concentration
14. **[subtle]** Widen from single-channel noting to holding sound, sensation, and thought together in one field, without needing to choose. - `APP:existing`; `SHIN:§2` "Note Everything"
15. **[subtle]** Check the second arrow: when something unpleasant is noted, is a reactive layer being added on top (irritation at the irritation)? If so, note that second layer separately and let it go. - `SHIN:§3` item13
16. **[subtle]** Notice which of the three qualities (steadiness, clarity, non-reactivity) feels weakest right now, and let that - not effort - inform what gets noted next. - `SHIN:§1` 3-meter model, applied
17. **[effortless]** Let noting run as background monitoring while resting in the wider field, rather than needing deliberate labeling of every event. - `SHIN:§1` metacognitive framing, `gen`
18. **[effortless]** Notice a spontaneous drop into non-reaction - a moment nothing needed pushing away or holding - and mark it lightly, since noticing it is what trains the quality that produced it. - `SHIN:§1 Meter3`, named "by far the most important" mechanism in the source
19. **[effortless]** Notice noting continuing almost on its own during an unstructured moment, not only during the formal block. - `SHIN:§3` "Background practice"

Common corrections - note: labeling feels late/after the fact -> normal beginner pattern, no fix needed but reps (`SHIN:§1 Meter2`). Can't tell what channel something belongs to -> note the broader "Everything" rather than forcing a category (`SHIN:§2`). A noted feeling is too strong to stay with -> Turn Away is equally valid, not giving up (`SHIN:§2`).

### scan
Body-sweep block, lighter and faster than `embody` (below), which is Blackstone's slow single-practice method. Existing pool: 5 lines.

1. **[foundation]** Move attention through the body in a fixed order (commonly head to toe), a few breaths at each region. - `HS:L13`; `APP:existing`
2. **[foundation]** At each region, simply notice what's there - tension, warmth, tingling, or nothing - with no goal of finding or fixing anything. - `HS:L11, L13`
3. **[foundation]** If nothing is felt at a region, note "neutral" and move on rather than searching harder. - `SHIN:§2` Focus on Rest, applied; `HS:L15`
4. **[foundation]** Where discomfort is found, note it and let attention move on rather than staying to fix or massage it away. - `APP:existing`
5. **[working]** Slow the pass to a deliberate breath or two per region rather than a fast sweep. - `HYP:§2` item1, general pacing
6. **[working]** Where a region holds real tension, offer tense-then-release: briefly tighten that one spot, then let go, using the rebound as the release. - `HYP:§2` item1 sub-variant
7. **[working]** Let the pace adapt to where tension actually is - moving quickly through an already-easy region, slowing only where something is genuinely held. - `gen`, PMR pacing logic
8. **[working]** Notice temperature and weight at each region, not tension alone - some regions read as heavy/light or warm/cool rather than tense/relaxed. - `HS:L11`; `BL` quality-attunement logic, general
9. **[working]** Once single regions are easy, notice paired regions together rather than one at a time (both hands, both shoulders, both feet at once). - `BL:L19`
10. **[subtle]** Where focus keeps splitting back and forth between two symmetric points, deliberately thin the focus until both are held at once rather than trying harder to hold both narrowly. - `BL:L19`
11. **[subtle]** Notice the breath moving through a region as it's scanned, rather than holding the breath still while attending to the body. - `BL:L23, L29, L31`
12. **[subtle]** Feel each region as owned - this is your shoulder, your hand - rather than an object inspected from outside. - `BL:L21, L35, L45`
13. **[subtle]** After the sequential pass, hold the whole body at once - every region in contact simultaneously rather than one after another. - `BL:L45`; `APP:existing`
14. **[effortless]** Rest in the whole body as one field of sensation, letting the scan's separate regions dissolve into a single undivided presence. - `BL:L45, L49`
15. **[effortless]** Once the sequential version is familiar, let the scan run as a quick background check-in (a few seconds, whole body at once) instead of the full pass. - `gen`, `HYP:§1` conditioning logic applied to scanning

Common corrections - scan: can't feel a region at all -> name it "neutral" and move on, don't force sensation (`HS:L15`). Genuine pain found -> note it and keep moving, don't ask the user to sit inside pain during a basic scan (this is different from TMI's optional pain-as-object technique, which is advanced and consent-based). Tension found -> offer notice-and-release or tense-then-release, never "try harder to relax."

### listen
Existing pool: 3 lines. Sam Harris and Shinzen both treat hearing as the cleanest demonstration that awareness needs no effort.

1. **[foundation]** Let sound arrive on its own rather than searching the room for something to hear. - `SH:L21`; `APP:existing`
2. **[foundation]** Notice near sounds and far sounds both, without ranking either as more worth attending to. - `SH:L5`, general
3. **[foundation]** Don't resist unwanted sound - let it be part of the field rather than an intrusion to manage. - `HS:L9`
4. **[foundation]** Don't name or judge a sound (identifying it, rating it) - just register that hearing is happening. - `APP:existing`; `SH:L21`
5. **[working]** Notice silence as a valid object when there's a gap between sounds, rather than treating quiet as "nothing happening." - `SHIN:§2` "Hear Rest"
6. **[working]** Notice a sound's edges - the moment it starts, changes, or stops - rather than its content. - `SH:L21`; `SHIN:§3` Just Note Gone, applied to hearing
7. **[working]** If inner sound is present (a tone, an internal hum), treat it the same as an outer sound - one more object in awareness. - `SHIN:§2` "Hear In," general
8. **[working]** Notice that no effort is required to hear - sounds simply appear without the listener producing them. - `SH:L21`
9. **[subtle]** Let listening reveal the space consciousness itself happens in, rather than staying fixed on the sounds as separate objects. - `SH:L21`
10. **[subtle]** Notice sound and silence together as one continuous field rather than alternating between "sound present" and "sound absent." - `SHIN:§2`, general
11. **[subtle]** Let a loud or startling sound be met without a flinch-and-recover cycle - noted as simply another arising, matched in equanimity to a quiet one. - `SHIN:§1 Meter3`, applied
12. **[effortless]** Rest as the awareness sounds are appearing in, rather than as a listener chasing after each one. - `SH:L21`; `ADY:L6-L10` doer logic, applied to listening

Common corrections - listen: irritation at a repeating or unwanted sound -> note the irritation as a second-layer reaction, not the sound's fault (`SHIN:§3` Second-Arrow Check). No sounds seem to be happening -> treat the quiet itself as the object ("Hear Rest"), not a failed rep (`SHIN:§2`).

### watch
Thought-witnessing block. Existing pool: 3 lines.

1. **[foundation]** Notice a thought is present - an image or a bit of inner language - rather than immediately following its content. - `SH:L17`
2. **[foundation]** Watch what happens to the thought itself: does it fade, get replaced, dissolve? - `SH:L17`
3. **[foundation]** It doesn't matter how long attention was lost inside a thought before this was noticed - the instruction is to notice now, not account for lost time. - `SH:L17`
4. **[foundation]** Notice the gap or quiet space after one thought ends and before the next appears. - `APP:existing`
5. **[working]** Watch a thought arrive without following it into its story - staying at "a thought is happening," not its content. - `APP:existing`
6. **[working]** Notice that a thought showed up on its own - it wasn't deliberately built or chosen - and that it's already gone. - `SPC:MLS` banked Insight pool item 3 (existing gated content, technique reused here at the lighter watch tier)
7. **[working]** When a thought carries an emotional charge, notice the charge in the body too, not only the thought's content. - `SH:L19`
8. **[working]** Notice thoughts as visible "out there" alongside sensations, rather than run by an internal narrator pulling strings - offered as a noticing target, never demanded. - `TMI:Stage1` "Mind and Body" marker
9. **[subtle]** When the mind offers something urgent-feeling, a claim that grasping just this next point is what would finally allow rest, name the pattern for what it is - one more thing to solve before allowing rest - and let the thread go unresolved. - `ADY:L16`
10. **[subtle]** Notice the "doer" - the part wanting to get this right - and acknowledge it without obeying it. - `ADY:L8, L10`
11. **[subtle]** Let unusually vivid memories, emotions, or images that weren't consciously being thought about arise and pass without engaging or investigating them. - `TMI:Stage4`
12. **[effortless]** Notice that watching isn't effortful doing - there's no technique being performed, just an already-present awareness thoughts are appearing in. - `ADY:L6, L8`
13. **[effortless]** Let the watching continue without deliberately maintaining it - test whether attention holds when the effort of watching is consciously dropped. - `TMI:Stage7`, applied to thought-watching

Common corrections - watch: pulled into a thought's story -> simply notice "thinking" and return to watching the process, not the plot (`SH:L25`). The pull toward one more point that must be understood first -> name it as the mind's seduction, don't chase it (`ADY:L16`). Disturbing material surfacing -> let it pass without engaging, normal purification, not malfunction (`TMI:Stage4`) - if overwhelming, this is the trauma off-ramp, see Section E.

### feel
Emotion-in-the-body block. Existing pool: 2 lines, thinnest in the app. **Trauma-sensitive - see Section E before this block ships any deeper.**

1. **[foundation]** If a feeling is present, locate where it registers in the body (chest, throat, belly, jaw) rather than staying at the level of the story about it. - `APP:existing`; `SHIN:§2` "Feel In"
2. **[foundation]** Name the feeling in one plain word if that helps, rather than describing the situation that caused it. - `SHIN:§1 Meter2` label granularity
3. **[foundation]** Notice the feeling as pure sensation - pressure, heat, tightness - rather than a verdict on the day or the self. - `APP:existing`; `SHIN:§2`
4. **[foundation]** If no feeling is currently present, note that as "neutral" and let it be a legitimate finding, not a gap to fill. - `SHIN:§2` "Feel Rest"
5. **[working]** Track how the sensation shifts while it's being watched, rather than assuming it's fixed. - `APP:existing`; `SHIN:§2` Focus on Flow
6. **[working]** Separate a mixed or overwhelming feeling into its parts - the picture, the inner talk, the raw sensation - and note each on its own. - `SHIN:§2` "divide and conquer"
7. **[working]** Check for a second layer stacked on the first - frustration at being anxious, on top of the anxiety. If found, note that layer separately and let it go first. - `SHIN:§3` Second-Arrow Check
8. **[working]** Where the feeling involves someone else, distinguish care from overcare - is this warmth, or worry wearing care's name? Only the overcare gets released. - `HC:§Requirements`
9. **[subtle]** Where the feeling is difficult, offer both directions explicitly: stay and let it be fully felt without resistance, or shift to a neutral or pleasant anchor instead. Check: neither is more correct. - `SHIN:§2` Turn Towards/Turn Away
10. **[subtle]** Let the body soften around the sensation on the exhale rather than holding or bracing against it. - `HC:§Release`; general PMR logic
11. **[subtle]** Widen from one located feeling to noticing feeling as one more thing arising in the same field as sound and thought, without special status. - `SHIN:§2` "Note Everything"
12. **[subtle]** If a positive feeling is available (appreciation, warmth for someone), let it be deliberately grown - spread through the chest, then radiate outward. - `HC:§Installation`; `SHIN:§2` Nurture Positive
13. **[effortless]** Let the feeling be fully present without pushing it down or grabbing onto it - the balance point between suppression and identification. - `SHIN:§1 Meter3` definition of equanimity
14. **[effortless]** Notice a spontaneous moment where resistance to the feeling simply stopped, unprompted, and mark that as the actual target of the block. - `SHIN:§1`, "by far the most important" mechanism

Common corrections - feel (trauma-sensitive, weight this block's corrections heavily): if a feeling is too much, Turn Away (an outer sense, the breath, a restful spot) is a complete, legitimate full stop, never a failure. Never require staying with an emotion past the user's own tolerance. Offer an explicit exit (open eyes, return to breath, end the sit) at any point. Never frame not-staying as avoidance.

### open
Open-awareness lane spine. Existing pool: 8 lines, already fairly developed.

1. **[foundation]** Let go of any single technique or object - nothing specific to hold or focus on right now. - `APP:existing`
2. **[foundation]** Let whatever happens, happen. The only two working rules: allow it, and when an intention to control attention is noticed, let go of that intention too. - `SHIN:§2` "Do Nothing," verbatim two-rule structure of the technique (not the wording)
3. **[foundation]** Notice that awareness doesn't require effort to be present - it's already happening, prior to any doing. - `APP:existing`; `ADY:L8`
4. **[working]** Treat this block as trading a specific object for the whole field at once - nothing taken away, only the scope changing from narrow to total. - `gen`
5. **[working]** Notice that awareness has room for whatever arises, however loud or busy - nothing needs excluding for it to remain awareness. - `APP:existing`
6. **[working]** Let pleasant and unpleasant experience be met the same way - light enjoyment for the pleasant, no fight for the unpleasant. - `APP:existing`
7. **[working]** When drawn into a thought, notice that the act of noticing already means attention is back - no separate return step required. - `APP:existing`
8. **[working]** Let a thought, sound, or sensation be noted only if it's genuinely the loudest thing present; otherwise let it pass inside the general field unsingled-out. - `SHIN:§2`, light-touch version
9. **[working]** Notice when the effort of watching or maintaining awareness is still present, and let that effort go a little at a time. - `APP:existing`
10. **[subtle]** If this starts to feel spacey, aimless, or dull rather than open, switch to a light noting technique (breath, sounds) until clarity returns, then release back into open. Check: this swap is explicitly sanctioned, not a failure. - `SHIN:§2` Do Nothing swap rule
11. **[subtle]** Rest as the space things arise and pass in, rather than as an observer positioned somewhere watching from a distance. - `APP:existing`; `SH:L21`
12. **[subtle]** Notice the field staying available and unchanged in kind whether the moment is eventful or quiet - awareness doesn't get "fuller" or "emptier," only its contents change. - `gen`
13. **[subtle]** Notice a wave of unusual physical sensation, energy, or involuntary small movement, and let it be without chasing or resisting it. - `TMI:Stage7-8`
14. **[subtle]** Where effort to "do open awareness correctly" creeps back in, notice that as one more content in the field, not a problem to fix from outside it. - `SHIN:§2` Do Nothing, applied
15. **[effortless]** As a direct test, deliberately drop all vigilance for a few seconds and notice whether stability holds on its own. Check: this is the actual mark of the tier, not continued effortful watching. - `TMI:Stage7`
16. **[effortless]** Let go even of the "watcher" or "witness" framing - that framing is itself still a subtle activity of mind; awareness isn't a position being performed. - `ADY:L6`
17. **[effortless]** When the mind tries to entice re-engagement with the promise that one more point of understanding will make it easier, recognize the pattern and let resting continue anyway, without resolving the bait. - `ADY:L16`
18. **[effortless]** Notice the qualities built here (spaciousness, non-reaction) starting to color the few minutes right after the sit ends, not only during it. - `TMI:Stage10` persistence marker

Common corrections - open: dullness or spaciness -> switch to a light noting technique briefly, then release back (`SHIN:§2` swap rule). Racy or effortful watching -> the vigilance-drop test, deliberately stop trying and see what holds (`TMI:Stage7`). The mind selling the idea that one more thing needs figuring out -> name it, don't chase it (`ADY:L16`).

### heart
Metta / loving-kindness lane spine. Existing pool: 8 lines, already well-developed (easy person -> self -> neutral -> difficult opt-out -> all).

1. **[foundation]** Place a hand over the heart and feel the physical heartbeat as the access point. - `HC:§Requirements, §Arrival`
2. **[foundation]** Breathe as if in and out through the heart or chest specifically - a direction of attention, not an anatomical claim. - `HC:§Requirements`
3. **[foundation]** Bring to mind someone easy to love - a person, an animal, anyone at all - and let a little warmth arise. - `APP:existing`; `HC:§Installation`
4. **[foundation]** Use a real, specific memory of genuine care rather than a general idea of loving someone - a face, a moment, a specific instance. - `HC:§Requirements` "genuine, not performed"
5. **[working]** Offer the traditional phrases (may you be happy, safe, at ease) as a vehicle, without forcing the feeling to match the words right away. - `APP:existing`
6. **[working]** Feel the warmth specifically in the chest and let the area around it soften in response. - `APP:existing`; `BL:L31`
7. **[working]** Widen the circle to the self, using the same phrases, treating self-warmth as no less legitimate. - `APP:existing`
8. **[working]** Where a difficult relationship comes up, distinguish care from overcare explicitly - worry and anxiety aren't the same as love even though they can feel similar; only the overcare is released. - `HC:§NPC Recognition`
9. **[working]** Let the phrases themselves shorten with repetition (from the full wish down to a single word like "safe") once the felt state is familiar. - `gen`, conditioning logic paralleling `HYP:§1`
10. **[subtle]** Widen the circle again to a neutral person - someone barely known, passed today, unnamed - and offer the same wish. - `APP:existing`
11. **[subtle]** Optionally widen to someone difficult, fully opt-in - staying with who's easy is an equally complete practice, not a lesser one. - `APP:existing`
12. **[subtle]** Let the felt warmth actively grow rather than staying its starting size - spread it from the chest through the rest of the body. - `HC:§Installation`
13. **[subtle]** Where overcare shows up as physical clenching (jaw, chest, gut) rather than as a thought, address it at the body level directly - soften the clench on an exhale - rather than only reasoning about the distinction. - `HC:§heart-focused breathing`, general somatic extension
14. **[effortless]** Let the same feeling expand outward beyond the body, into the surrounding space, rather than staying contained in the chest. - `HC:§Installation`
15. **[effortless]** Let the circle keep widening without a deliberate list of people - to anyone at all, unbounded. - `APP:existing`
16. **[effortless]** Notice the hand-on-heart contact as something present the whole time, available afterward as a one-touch return outside the sit. - `HC:§Anchor`

Common corrections - heart: the feeling doesn't come on demand -> the phrases are a vehicle, keep offering the wish, let feeling catch up if it does. A difficult person makes the block hard -> stay with an easy person or the self, difficulty is opt-in only (`APP:existing`). Care curdles into worry -> name the overcare distinction and release only the anxious part (`HC`).

### look
Insight / self-inquiry lane spine. **OPT-IN, safety-gated - see Section E.** Existing pool: 9 lines, already matching the SPC-banked gated content verbatim; do not repeat those 9 lines, extend around them.

1. **[foundation]** Before turning inward, an explicit orientation: this block asks a different kind of question than the others, and staying with the breath instead is completely fine. - `MCTB` gating logic, applied as in-block framing
2. **[foundation]** Rather than watching experience, turn attention to look for the one who is watching it. - `APP:existing` (SPC pool item1)
3. **[foundation]** Notice a thought the instant it appears, and that it arrived and departed on its own, without being built or chosen. - `APP:existing` (SPC pool items2-3)
4. **[working]** Bring to mind something that bothered you recently; hold it the way a mirror holds a reflection - fully present, without the mirror being changed by it. - `APP:existing` (SPC pool items4-5)
5. **[working]** Do the same with a good memory; notice the awareness holding it doesn't itself get better or worse with the memory's content - only the mood changes. - `APP:existing` (SPC pool item6)
6. **[working]** Picture a known place, then a face; notice each appears and is gone in turn - ask which was actually "you." - `APP:existing` (SPC pool item7)
7. **[working]** Notice the felt sense of being "the thinker behind the thoughts," then look directly for that thinker - is anything found besides the next thought arriving? - `APP:existing` (SPC pool item8)
8. **[subtle]** Notice thought-as-thought becoming obvious - narrative visibly happening "out there" as objects, rather than run by an internal narrator. This is the one MCTB marker safe for a general-audience block (see Section E boundary). - `MCTB:Stage1` "Mind and Body"
9. **[subtle]** Look for a center or self behind all of this directly, rather than accepting the felt sense of one - a findable center, or only the experience itself? - `APP:existing` (SPC pool item9)
10. **[subtle]** When nothing is found where a self was expected, let that be a complete, fine result - rest as the awareness all of this is appearing in. - `APP:existing` (SPC pool item10)
11. **[subtle]** Notice the mind offering one more thing it insists must be understood first, as a way to postpone resting - name the pattern, don't chase the resolution, let the question stay open. - `ADY:L16`
12. **[effortless]** Relinquish the "doer" that wants to get the inquiry right or understand it correctly - acknowledge the impulse without obeying it, let the looking continue without needing a correct answer. - `ADY:L8, L10`
13. **[effortless]** If it arises on its own, recognize that the one looking and the awareness being looked for were never actually two things - offered as a possible recognition, never asserted as a conclusion to accept. - `ADY:L22`

**Do not extend this block toward MCTB stages 4-10 (Arising and Passing Away through Re-observation) as technique.** Anything past "thought-as-thought noticing" and "no self found, rest as awareness" is out of scope for a general-audience block. See Section E.

Common corrections - look: nothing found where "I" was expected feels unsettling -> reassure this is the expected, fine result, not an error. The inquiry starts to feel destabilizing rather than curious -> exit the block entirely, return to breath or open; this is the required off-ramp (see Section E), not optional. Mind offers "one more thing to resolve" -> name it, don't chase it (`ADY:L16`).

### close
Existing pool: 2 lines, thinnest alongside `feel`.

1. **[foundation]** Let go of any remaining technique or effort - nothing left to hold for these final moments. - `APP:existing`; `HS:L21`
2. **[foundation]** Let the mind be free to do whatever it does for a brief stretch, without redirecting it back to any object. - `HS:L21`
3. **[foundation]** Soften the pace of the closing lines themselves - the measured pace of the whole sit holds through the close too, so the ending doesn't feel rushed. - `SPC:MLS` "constant pace" finding
4. **[working]** Bring attention back to the body specifically - weight, contact with the seat or floor, hands and feet. - `APP:existing`; `HS:L23`
5. **[working]** Bring attention back to the room and any sounds in it, re-including the environment rather than staying inward. - `HS:L23`
6. **[working]** Name explicitly that the sit is ending, rather than letting attention simply trail off unmarked. - `gen`, consistent with HS/BL closing structure
7. **[working]** If a physical anchor was used earlier (hand on heart), keep it in place a few seconds into the return rather than dropping it the instant the sit ends. - `HC:§Return`
8. **[subtle]** Open the eyes gently, in the user's own time rather than on a fixed count; if eyes were open the whole sit, mark the return some other way (a stretch, a breath). - `HS:L23`; `BL:L49`
9. **[subtle]** Take a moment with eyes open to keep the settled quality present while looking at ordinary surroundings - a brief bridge, not an abrupt cut. - `HC:§Return`
10. **[subtle]** Offer a physical stretch as optional closing punctuation. - `HS:L23`
11. **[effortless]** Note, without demanding it, whether any of the sit's qualities (calm, clarity, ease) are still present a few moments after opening the eyes - the noticing itself is part of training persistence. - `TMI:Stage10`
12. **[effortless]** Let the return be brief and undramatic - trust the state to carry itself out rather than needing to talk the user out of it. - `gen`, matching Headspace's own short closing arc

Common corrections - close: user feels startled or rushed -> always give the eyes-open bridge moment before ending, never cut straight from eyes-closed to "session over" (`HC`, `HS`). A deep or gated sit (after `look` or `feel`) needs a longer, more grounding close than a light concentration sit - lengthen the body/room/anchor return specifically after those blocks (consistent with MCTB's own grounding menu: sensate anchors, breath, feet on the floor - see Section E).

---

## New blocks

### embody (NEW)
Blackstone's full inhabit-the-body method: slower and more granular than `scan`, one region at a time, each paired with a named felt quality and a subtle energy current. Distinct from `scan`: scan is a fast tension-focused pass; embody is the whole practice, richest single source in this sweep (Blackstone's transcript maps almost line-for-line onto this ladder).

1. **[foundation]** Choose one small region (start with the feet) and inhabit it - bring felt, internal attention there rather than looking at it from outside. - `BL:L13`
2. **[foundation]** Adjust the breath so it doesn't pull attention back up out of the region being inhabited - keep the inhale low rather than letting it lift focus away. - `BL:L13, L27`
3. **[foundation]** At each region, attune to a named inner quality specific to that part (starting with a general quality of "self" in the feet and legs) as a felt sense, not a concept. - `BL:L15`
4. **[working]** Move through the body in a fixed sequence (feet, legs, knees, thighs, hips, pelvis, midsection, chest, shoulders, arms, neck, head, face, brain), inhabiting and attuning at each stop. - `BL:L13-L43`
5. **[working]** At transition points between regions (where legs meet torso, at the hip sockets), notice the internal space of both neighboring regions at once rather than treating the boundary as a hard line. - `BL:L23`
6. **[working]** At paired regions (knees, hip sockets, shoulder sockets), balance awareness of both sides at once rather than alternating - thinning the mind's focus until both are found simultaneously. - `BL:L19, L23, L33`
7. **[working]** Let a different named quality surface where natural to the region: power in the midsection, love in the chest, voice in the neck, understanding in the head - always felt, not conceptual. - `BL:L29, L31, L37, L43`
8. **[working]** Bring the breath specifically down into each region as it's inhabited, feeling the breath move through that region's quality. - `BL:L25, L29, L31, L37`
9. **[working]** Let each region "soften at the edges" as the marker it's been adequately inhabited, rather than a fixed time or specific sensation being the target. - `BL:L33`
10. **[subtle]** At each region's innermost point, open and let attention receive a fine upward current, described as a subtle continuous thread rather than a dramatic surge. Check: don't be discouraged if it isn't felt every time. - `BL:L27, L29, L31, L37, L43`
11. **[subtle]** Where the current is felt, avoid pulling attention back up away from it - settle down into the sensation rather than following it upward. - `BL:L31`
12. **[subtle]** At the base of the torso specifically, let the inhale not lift attention away from that low point - the region most prone to attention drifting upward with the breath. - `BL:L27`
13. **[subtle]** At the head, find a point behind the eyes or forehead and observe from behind it rather than from it - noticing whatever is there (dark, light, texture) without needing it to be anything specific. - `BL:L39`
14. **[subtle]** Notice some regions yield a felt quality easily and others don't on a given day - this varies session to session and isn't a sign of doing the sequence wrong. - `BL:L27`, general pattern
15. **[subtle]** After the sequence, inhabit the whole torso, neck, and head together as one continuous region, then add the limbs, so the entire body is inhabited at once rather than sequentially. - `BL:L45`
16. **[effortless]** Notice the space just outside the body (the room) and recognize it as continuous with the inhabited internal space - one undivided field, not two spaces meeting at a boundary. - `BL:L47, L49`
17. **[effortless]** Rest as that continuous space itself, inside and outside the body at once, rather than as a self positioned inside a body looking out at a separate room. - `BL:L47, L49`
18. **[effortless]** Repeat the whole-body-plus-room recognition with the eyes open, so the practice transfers into ordinary open-eyed presence, not only eyes-closed. - `BL:L49`

Common corrections - embody: a region produces no felt quality -> normal, especially early on; note "not much here yet" and move to the next region rather than forcing it. Attention keeps splitting between paired regions instead of balancing -> deliberately soften and thin the focus rather than trying harder to hold both. Breath lifts attention out of a low region -> consciously keep the inhale short and low rather than following it upward.

### free (NEW)
Headspace's brief, ruleless release valve: a bounded interval with zero instruction, distinct from `open` (which still holds an orientation: resting as the space things arise in). Source material for this block is genuinely thin (one paragraph in the transcript), so the ladder below stays intentionally short.

1. **[foundation]** Explicitly announce the release - name that even the breath is being let go of now, so the shift is clear rather than ambiguous. - `HS:L21`
2. **[foundation]** Give the mind full permission to go wherever it wants for this stretch - no object, no instruction, nothing to return to. - `HS:L21`
3. **[foundation]** Treat this as the one interval in the sit with no wrong way to spend it - not spacing out, not focusing, not even resting-as-awareness specifically. - `HS:L21`, contrast framing
4. **[working]** Keep the stretch short and bounded (a handful of seconds to under a minute) - a brief release valve, not a new open-ended technique. - `HS:L21`, `gen` on pacing
5. **[working]** Let this be genuinely different from every other block in the sit - nowhere else is doing-nothing-including-not-following-a-rule explicitly invited. - `gen`, contrast vs. Shinzen's Do Nothing (which keeps two rules)
6. **[working]** If a thought, plan, or worry shows up, let it run rather than noting it, labeling it, or redirecting from it - this block suspends the noting habit on purpose. - `HS:L21`, contrast with every other block's noting instruction
7. **[working]** Don't ask anything of the mind here - not stillness, not insight, not relaxation - the absence of a task is the instruction. - `HS:L21`
8. **[working]** Use the free interval as a natural bridge point right before the return sequence begins - the hinge between the sit's held techniques and coming back out. - `HS:L21-L23` structural placement
9. **[subtle]** Notice, without steering back, whether the mind goes somewhere wild or settles on its own once nothing is being asked of it - either result needs no response. - `TMI:Stage7` drop-effort-test logic, applied
10. **[subtle]** If total non-instruction produces anxiety rather than relief for a given user, that's useful information - shorten the interval next time or skip to a light object (the breath) instead. - `gen`, trauma/regulation-sensitive correction
11. **[effortless]** Let the return from free back to a held object (the body) happen gently and without urgency - no clock is being watched inside the interval itself. - `HS:L21-L23`
12. **[effortless]** Notice, over repeated sits, whether the free interval is tolerated more easily or produces less urge to immediately grab for a technique - a sign the underlying settledness is generalizing. - `HYP:§1` conditioning logic, applied

Common corrections - free: mind spirals into planning or worry -> allowed and expected, no correction applied inside the interval, only at the return. The interval feels uncomfortable with no anchor -> shorten or skip it for that sit, this block is optional, never mandatory. Confusing free with open -> keep the two distinct in language; open still holds an orientation, free holds none.

### rest / "being" (NEW - naming note below)
Adyashanti's capstone: resting as awareness, dropping the doer. Distinct from `open` (Shinzen-flavored, rule-based, "do nothing") and `look` (active inquiry, looking FOR something) - this block is specifically about not-looking and not-doing, including dropping the search for a self. **Naming note:** this sweep's task named the block `rest`; the sibling file already sitting in this folder, `BRIEF-meditation.md`, independently names the same technique `being` (adv:true, 16 lines). Both point at the same Adyashanti source. Flagging the mismatch here rather than silently picking one - the writer should reconcile the name before shipping.

1. **[foundation]** Frame this as a state of being, not a task to perform - there's nothing to "do" to arrive at it, since awareness is already fully present. - `ADY:L6, L8`
2. **[foundation]** If the mind asks "okay, so what do I do?", answer plainly: nothing - doing isn't the relevant category here. - `ADY:L8`
3. **[foundation]** Notice and name the "doer" - the part of mind wanting to get this right, perform it correctly, or understand how - without following its questions. - `ADY:L8`
4. **[working]** Relinquish the doer specifically (not fight it, not suppress it) - acknowledge it, let it know it isn't needed right now, let attention move past it. - `ADY:L10`
5. **[working]** Alongside the doer, relinquish the need to understand - set aside the impulse to figure out what's happening before resting is allowed. - `ADY:L14`
6. **[working]** Practice letting-be as the operative motion - not relaxing, not focusing, but allowing everything present right now to simply be as it is. - `ADY:L10, L12`
7. **[working]** Notice where the mind is actively trying to make something happen or stop happening, since that's the opposite of letting be, and release just that specific push or pull where found. - `ADY:L12`
8. **[working]** Notice the specific bodily quality of not-trying - shoulders, jaw, and forehead often carry the physical signature of effort - let those soften as a felt companion to relinquishing the doer. - `gen`, somatic extension of the doing/being distinction
9. **[subtle]** Expect the mind to try re-engaging within moments - normal, not a sign of failure - and recognize its specific shape: an offer that understanding just one more thing would make resting easier. - `ADY:L16`
10. **[subtle]** When that bait appears, don't solve it and don't fight it - recognize the pattern and let the thread stay unresolved while continuing to rest. - `ADY:L16`
11. **[subtle]** Notice that even a few seconds of genuine resting is already, by definition, outside the mind's usual operating mode - no minimum duration is required for it to count. - `ADY:L18`
12. **[subtle]** Value consistency over duration - the goal isn't sitting in rest for a long stretch, but not being lured back into figuring-things-out, however briefly rest is sustained each time. - `ADY:L20`
13. **[subtle]** If the mind protests that this is too simple to be a real practice, let that protest itself be one more thing simply allowed to be present, rather than argued with. - `ADY:L20`
14. **[effortless]** Notice that staying with one extremely simple instruction is actually harder to sustain than following something complex, because there's nothing for the effortful mind to grab - expect that difficulty, it isn't a sign of doing it wrong. - `ADY:L20`
15. **[effortless]** If it happens on its own, notice that the one resting and the awareness being rested "as" were never two separate things - offered as a possible recognition, never asserted as a conclusion to accept. - `ADY:L22`
16. **[effortless]** Let any conceptual self-story be recognized as exactly that, ideas, distinct from the more basic fact of awareness itself being present, prior to any of those ideas. - `ADY:L22`

Common corrections - rest: the mind keeps offering a next point that supposedly must be understood before resting can happen -> name it as the seductive pattern, don't engage, return to plain resting (`ADY:L16`). Nothing seems to be happening, feels too simple to be doing anything -> expected, difficulty with simplicity is named directly in the source, not a sign of failure (`ADY:L20`). Frustration at not knowing if it's being done right -> there's no "right" version to perform, so the frustration is one more thing to relinquish, not solve (`ADY:L8, L10`).

### sleep (NEW - not currently in the sibling BRIEF's deliverable list; included because this sweep's task named it, flagged for a future round)
Pre-sleep protocol. Structurally different from every block above: done in bed at bedtime, never returns, deepens across repeated nights rather than within one sit.

1. **[foundation]** Do this only in bed, at actual bedtime, not as a seated daytime practice - the physical posture and setting are part of the technique. - `PS:§Requirements`
2. **[foundation]** Let the body's contact with the mattress and sheets be the primary settling object, rather than an imagined environment. - `PS:§Arrival`
3. **[foundation]** Use a floating-on-water or sinking-into-warm-darkness image for the descent into drowsiness, rather than a stairs or elevator image - matched to actually falling asleep rather than staying alert-but-relaxed. - `PS:§Descent`
4. **[working]** Briefly name the day's residual stress as a passing pattern rather than something to resolve tonight - "whatever happened today is over" - without re-examining it. - `PS:§NPC Recognition`
5. **[working]** Let each exhale carry a small piece of the day out with it - an explicit release paired to the breath rather than a separate relaxation step. - `PS:§Release`
6. **[working]** Choose a single word or short phrase (naming what's wanted: calm, ease, a specific state) to repeat gently, quieter and slower each time, like a lullaby rather than an instruction. - `PS:§Installation` (Murphy's technique)
7. **[working]** Build one specific, warm, achievable scene to rest attention on as sleep approaches, kept simple rather than elaborate, since it only needs to seed what the mind continues on its own during sleep. - `PS:§Installation` (Goddard's technique)
8. **[subtle]** Treat physical drowsiness itself as the technique working, not as a distraction from it - heavier eyelids, slower breathing, and a harder time following language are signs of correct progress here, unlike in a normal sit. - `PS:§Mechanism`
9. **[subtle]** If a physical anchor was used (a hand resting on the chest), name it as something that travels into sleep with the user, rather than something to release before the practice ends. - `PS:§Anchor`
10. **[subtle]** Let sentences shorten and slow as drowsiness increases, rather than holding a constant pace - the opposite pacing rule from an alert daytime sit (compare the `close` block's "constant pace holds through the close" note, which does NOT apply here). - `gen`, inferred from `PS`'s stated purpose
11. **[effortless]** Never include a wake-up or return instruction - there's no closing section for this block; ending mid-thought as sleep arrives is correct, not an error. - `PS:§Requirements, §Return` "omit entirely"
12. **[effortless]** Let go of further narration once drowsiness is clearly present - trust the sleep transition to continue the process rather than needing the guidance to complete a full arc every time. - `PS:§Return`
13. **[effortless]** Expect this to be used repeatedly, night after night, with the same core scene or phrase - repetition across nights, not sit length, is what deepens this block, since a single night's consolidation is limited on its own. - `PS:§Requirements` "repetition nightly for 21+ days"

Common corrections - sleep: user still alert when scene-work begins -> slow the pace further and lengthen the physical-settling portion rather than pushing into visualization. A stressful thought intrudes -> name it as "today, already over" and return to the breath or scene, don't investigate it (this is not the place for `look`'s inquiry). This block should never end with an alerting cue (bright imagery, counting up, "now open your eyes") - that works directly against its purpose. - `PS:§Requirements`

### joy (extra-justified addition, not in the task's named list)
`app.js` already ships this content as `MED_EXTRA.bliss` and `MED_EXTRA.play` (both `adv:true`) but neither is tiered into a ladder or reachable from any `MED_SESSIONS` lane - they're editor-only carousel sections. TMI Stages 8-9 (meditative joy / pīti, and its maturation into tranquility) plus Shinzen's Nurture Positive give this real additional technique material, distinct in kind from `heart` (which is relational, directed at a person) - joy here is sourced from the practice itself or body-level ease. Proposed as an advanced tier folded into the Concentration lane rather than a standalone lane (see Section F), matching TMI's own sequence where Stage 8-9 sit right after Stage 7's breath mastery.

1. **[foundation]** Shift attention to the pleasant, ease-toned quality of simply being aware, underneath the content of any specific thought. - `MED_EXTRA.bliss` existing lines
2. **[foundation]** Notice this ease as easy to miss because it's quiet, not because it's small or absent. - `MED_EXTRA.bliss` existing
3. **[foundation]** Let the ease be enough as found - no instruction to build, amplify, or chase a bigger version of it. - `MED_EXTRA.bliss` existing
4. **[working]** If a wave of unusually strong pleasant sensation arises (warmth, lightness, a full-body wave), let it be present without steering or trying to make it last. - `TMI:Stage8`
5. **[working]** Notice the physical senses growing quieter on their own during this - described as the senses pacifying, not as dissociating. - `TMI:Stage8`
6. **[working]** If a difficult feeling is also present, let it sit alongside the ease rather than needing to resolve or remove it first. - `MED_EXTRA.bliss` existing
7. **[subtle]** If the joy becomes intense enough to feel exciting or destabilizing rather than settling, stay with that intensity as the object rather than either chasing more or pulling back sharply. - `TMI:Stage9`
8. **[subtle]** Notice the joy gradually softening from excitement into a steadier, quieter tranquility with repeated exposure, rather than needing to manufacture that shift directly. - `TMI:Stage9`
9. **[subtle]** Where joy isn't arising spontaneously, use a specific remembered positive scene deliberately to prime it, not a generic idea of happiness. - `SHIN:§2` Nurture Positive
10. **[effortless]** Let the pleasant quality spread through the whole body once stable, rather than staying localized to wherever it first appeared. - `SHIN:§2` Nurture Positive; `TMI:Stage8` pliancy suffusing the body
11. **[effortless]** Notice across sits whether qualities from this block (ease, steadiness) linger after the sit ends rather than vanishing the instant it's over - persistence, not peak intensity, is the real marker here. - `TMI:Stage10`, applied
12. **[effortless]** Rest in the tranquility this produces rather than treating the earlier excitement as the goal - the settled quality that follows intense joy is the more mature form of this block. - `TMI:Stage9-10`

Common corrections - joy: nothing pleasant is arising -> fine, this is the least reliably summonable block; drop back to breath or open rather than forcing it. Joy becomes overwhelming or destabilizing -> named directly in TMI as a real risk at this tier; the correction is a return to a plainer, steadier block, not more instruction.

---

## C. Per-teacher signature moves

### Judith Blackstone
1. Sequential body-region inhabiting (feet through head) as the whole practice's spine.
2. Attune to a named inner "quality" per region (self, gender, power, love, voice, understanding) as a felt sense, never a concept.
3. Receive a fine upward energy current from the base of the torso, region by region, without forcing it.
4. Balance paired or symmetric regions by thinning the mind until both are held at once.
5. Recognize inside-and-outside-body space as one continuous field as the capstone move.
Distinct feel: embodiment-first, extremely granular and unhurried (one body part at a time), precise anatomical language paired with felt "quality," arrives at a nondual recognition through the body rather than through inquiry.

### Sam Harris
1. Anchor on the plain physical sensations of the breath (nose tip or belly), no imagery.
2. Mere witnessing: let sights, sounds, sensations, emotions, and thoughts arise, change, and pass without engaging their content.
3. Explicit "thoughts aren't failure" reframe - noticing a thought at any point, however late, is the complete instruction.
4. Sounds and sensations used as demonstrations that consciousness registers objects without effort.
5. Progressive collapse of separate objects into "the space of consciousness" itself.
Distinct feel: precise, unadorned, secular-analytical register, short declarative sentences, no imagery and no permission-giving softness - reads like a description of an experiment already underway.

### Andy Puddicombe / Headspace
1. Heavy permission language ahead of nearly every instruction: explicitly told there's nothing to fix or alter, only to notice.
2. Eyes-open soft-focus on-ramp offered before eyes-closed settling.
3. Count 1(in)/2(out) with the emphasis on the out-breath as the core stabilizer.
4. A named "sense of space" following each exhale, pairing the count with a felt reward rather than a bare mechanic.
5. A deliberate, brief total-permission interval (no object, no instruction) before the return.
Distinct feel: warmest and most conversational of the four, maximally accessible, every instruction wrapped in explicit permission and normalization, shortest technical vocabulary of the set.

### Adyashanti
1. Explicit reframe: resting as awareness is a state of being, not doing - dissolves the "what do I do" question rather than answering it.
2. Name and relinquish the "doer" (the part wanting correct performance) as a discrete, repeatable move.
3. Relinquish the need to understand, as a second discrete release alongside the doer.
4. Name the mind's seductive seeking pattern explicitly so it can be recognized and not obeyed.
5. Redefine consistency as not-being-lured-back-into-figuring-out, decoupled from duration.
6. Point to non-duality only as something that may dawn on its own, never asserted as doctrine to accept.
Distinct feel: plainest and least technique-laden of the four; teaches by naming and undercutting the mind's habitual moves rather than giving it a new object to hold; the only one of the four explicitly built around not doing something.

### Culadasa (John Yates, from TMI)
1. A ten-stage attention ladder used as a whole diagnostic-plus-training frame, not one technique.
2. "Following" (track the whole breath cycle) and "connecting" (stay present through the pause) as named sub-skills.
3. The strong-vs-subtle dullness distinction, with subtle dullness flagged as the single most dangerous, best-disguised failure mode.
4. A deliberate drop-the-effort test to check whether stability has become self-sustaining.
5. Widening the breath object to whole-body-with-breath as an anti-distraction technique.
Distinct feel: systematic and diagnostic, precision-graded stages with named failure modes and named remedies for each - teaches by naming exactly what could be subtly going wrong more than any other source here.

### Shinzen Young
1. Three independent meters (Concentration, Clarity, Equanimity) as the whole training frame, never a single "mindfulness" score.
2. Noting technique: acknowledge, label, return - across See/Hear/Feel x In/Out/Rest/Flow.
3. Turn Towards / Turn Away as an explicit, equally valid fork for handling discomfort.
4. Just Note Gone: attention trained purely on the moment of vanishing.
5. Do Nothing's two-rule minimalism (allow; drop the intention to control) as the polar opposite of Noting.
6. Nurture Positive as the deliberate, reconstructive counterpart to Noting's deconstructive work.
Distinct feel: taxonomic and modular, breaks meditation into a matrix of interchangeable parts (modality x range x technique-family) that recombine like a toolkit rather than a single path; explicit about exactly which skill each drill trains.

### Daniel Ingram (MCTB)
1. A four-signal stage-assessment method (perceptual shift, physical rapture, emotional tendency, sequence fit) - never diagnose from feeling alone.
2. Secularizing a traditional map with plain glosses, to make it usable outside a religious frame.
3. A no-cross-contamination containment technique: don't let a destabilized state bleed into real decisions.
4. An explicit gate on who should be given deeper material, and a warn-in-advance protocol before it's offered.
5. A concrete grounding menu (exercise, nature, sleep, humor, reality-testing, sensate anchors) as the correction for destabilization.
Distinct feel: forensic and safety-first - the only one of the seven teachers whose primary contribution here is a set of containment and stabilization moves plus a gating protocol, not a meditative object.

---

## D. Re-anchor cues (for a widened MED_RETURN pool)

15 mechanically distinct ways of bringing a wandered mind back. Current `MED_RETURN` (4 lines) all live inside mechanism 2-4 below; the rest are genuinely new mechanisms, not phrasing variants.

1. **Noticing-itself-as-the-win** - the moment of realizing the mind wandered IS the practice succeeding, not a lapse in it. - `TMI:Stage2`; `SH:L17`
2. **Begin-again, no partial credit** - restart the technique from its start point, never search for where it left off. - `HS:L17`; `APP:existing`
3. **No story about the wander** - don't investigate why or how long, just return. - `SH:L17`
4. **Drop the judgment as its own step** - release self-criticism first, then return, as two separate moves rather than one. - `TMI` Seven Problems remedy logic; `APP:existing`
5. **Return to raw sensation, not a concept** - come back to movement, temperature, or pressure, something felt, rather than "the breath" as an idea. - `SH:L17`
6. **Return on the exhale specifically** - come back on an out-breath rather than at a random moment. - `HS:L19`
7. **Return to a body contact point** - the seat, the floor, the hands, when the breath itself is hard to relocate. - `SH:L11`
8. **Note the wandering thought itself on the way back** - acknowledge it as "thinking" rather than skipping past it unnamed. - `SHIN:§2` Noting technique
9. **Reset via the physical anchor** - hand on heart or wherever it was placed, rather than via the breath, when a body-based technique was in use. - `HC` anchor logic
10. **Widen instead of narrowing** - if repeatedly failing to hold a narrow object, deliberately widen to the whole body or field instead of gripping tighter. - `TMI:Stage6`, repurposed as a return strategy
11. **Mark the catch as a small win** - a light internal acknowledgment, rather than moving past it in silence. - `TMI:Stage2`
12. **Dullness-specific return: freshen, don't re-fix** - if the wander was toward fog rather than a thought, the return is a brief vividness refresh (soften the eyes, notice the room), not just re-fixing on the object. - `TMI:Stage5`, mechanically distinct from a thought-wander return
13. **Relinquish-the-doer return** - for open/rest/look specifically, "return" isn't re-fixing on an object at all, it's dropping whatever the mind just picked up, since there's nothing to re-grip. - `ADY:L10`, non-object-based return
14. **Micro-reset via a brief full surface** - deliberately come up fully (open the eyes, one full breath, re-orient) and then immediately re-settle, using the brief break itself as the return mechanism, for a badly stuck wander. - `HYP:§3` refractionation, repurposed
15. **Second-arrow-aware return** - check whether frustration at having wandered is itself now the thing to release first, before the return to the object even happens. - `SHIN:§3` Second-Arrow Check, applied to the wander-frustration case

---

## E. Safety notes

### E1. Insight / Dark Night (MCTB) - binding for the `look` block and any Insight-lane content
- The Progress of Insight runs 15 stages plus Fruition. Stages 1-3 (Mind and Body, Cause and Effect, Three Characteristics) are the safe, general-audience range - already the ceiling of the `look` block's ladder above.
- Stages 4 (Arising and Passing Away, "the point of no return") through 10 (Re-observation) are the Dark Night cluster: destabilizing, can mimic clinical depression, panic, or a psychotic break, and Ingram names suicidal ideation as a real minority-case risk at stage 9 ("Desire for Deliverance"). - `MCTB:§2`
- **One-line rule (already binding per `SPC:MLS` and this sweep's source): never design a feature that pushes or gamifies progress into stages 5-10.** Any reference to this territory must be opt-in, clearly labeled as psychologically destabilizing, paired with a visible crisis/support resource and a one-tap exit, and never presented as a streak, level, or achievement. - `MCTB:§2, §4`
- Stages 11-15 (Equanimity through Fruition) are momentary/advanced and carry no distinct technique instruction worth building - they're the resolution of the cluster above, not a separate teachable ladder; leave as advanced flavor text at most, never a target.
- Ingram's own stabilization menu, usable as general grounding correction anywhere in the app, not just gated content: don't make irreversible life decisions from inside a destabilized state, keep practicing rather than stopping outright, use physical grounding (exercise, nature, warm baths, sleep, sensate objects like breath or feet on the floor), and seek real professional help when overwhelmed. - `MCTB:§2` stabilization guidance
- Cited precedent: `SPC:MLS`'s own safety gate names this the Britton/Cheetah House meditation-harm research; the insight lane must stay opt-in, never suggested to a beginner or on a low energy-door day.

### E2. Trauma-sensitive rules for body / feeling blocks (`feel`, `scan`, `embody`, and any deep moment in `watch` or `look`)
- Eyes-open is always a first-class starting option, not a fallback - Headspace's own transcript opens eyes-open by default. - `HS:L5`
- Turn Away (rest on an outer sense, the breath, a restful spot) is a complete, equally valid response to a difficult sensation or feeling, never a lesser one or a sign of avoidance. - `SHIN:§2`
- Never require completion of a body or feeling block - a mid-block exit to `breath` or `close` must always be available and never framed as giving up.
- Intense material surfacing unexpectedly (vivid memory, strong emotion) is normal ("purification of mind" in TMI's own framing) even outside gated Insight content - name it as expected, let it pass, don't investigate it in the moment. - `TMI:Stage4`
- Never impose memory-work, amnesia-style suggestion, or anything resembling age-regression by default - hypnosis-ladder's clinical source is explicit that this must be opt-in and can break trust badly if forced. - `HYP:§6`
- General disclaimer discipline, generalized from the hypnosis-ladder source's own explicit requirement: this is educational/wellness content, not therapy or trauma treatment, and should not claim to be a substitute for a licensed clinician for anyone with a real trauma, dissociative, or psychiatric history. - `HYP:§6`

---

## F. Lane proposals

Existing 5 lanes (from `SPC:MLS` + current `app.js MED_SESSIONS`):

| Lane | Blocks (weights as shipped) | EVIDENCE |
|---|---|---|
| Concentration (default) | settle 0.9, breath 3, count 1.0, close 0.7 | `SPC:MLS` names Culadasa's TMI 10-stage ladder as this lane's canon spine. |
| Mindfulness | settle 0.9, breath 0.7, note 3, close 0.7 | `SPC:MLS` names Shinzen see/hear/feel noting as this lane's canon spine. |
| Open awareness | settle 0.9, breath 0.6, open 3, close 0.6 | `SPC:MLS` names equanimity/choiceless awareness as this lane's canon; Shinzen's Do Nothing is the direct technique source (`SHIN:§2`). |
| Heart | settle 0.9, breath 0.6, heart 2.8, close 0.7 | `SPC:MLS` names metta as the canon; heart-coherence.md supplies the physiological mechanism and the care/overcare distinction (`HC`). |
| Insight (gated) | settle 0.9, breath 0.9, look 2.6, close 0.8 | `SPC:MLS` names MCTB + Harris/Kelly/Adyashanti as canon, explicitly citing Britton/Cheetah House Dark-Night risk as the reason it's opt-in. |

Proposed new lanes:

| Lane | Proposed blocks + weights | EVIDENCE |
|---|---|---|
| **Body / Embodiment** | settle 0.9, scan 1.0, embody 3.2 (spine), close 0.8 | Blackstone's transcript (`style1`) is a complete, ready-sourced continuous technique with no current lane home; `STYLES-INDEX.md` itself calls it "the love/heart + awakening layer." Also closes the gap found in Section A: `scan` currently sits in `MED_BLOCKS` unused by any session. |
| **Reset / Beginner** | settle 0.7 (lighter, foundation-tier lines only), listen 0.8, free 0.6 (spine), close 0.5 | Headspace's transcript (`style3`) is explicitly framed by its own file header as a general "reset," soothing/accessible/no-effort, the only one of the 4-in-1 teachers whose script is a short complete arc rather than a deep-dive - the natural fit for a shallow, low-commitment lane. Also gives `listen` (currently unused by any session) a home. |
| **Rest-as-awareness** | settle 0.9, breath 0.7, rest 3 (spine), close 0.9 (extended, per the close block's grounding note) | Adyashanti's transcript (`style4`) is the STYLES-INDEX's own "nondual capstone," mechanically distinct enough from both Open awareness (Shinzen's rule-based Do Nothing) and Insight (active looking) to need its own lane - the doer-relinquishment move has no slot in the current 5-lane table. |
| **Sleep** | sleep only, no close block | `pre-sleep.md`'s own rule requires Section 7/Return to be omitted entirely - structurally incompatible with sharing a lane with any block that assumes a close/return, so it cannot be a spine bolted onto the existing session shape. Not currently requested in the sibling `BRIEF-meditation.md` deliverable list; flagged here per this sweep's own task scope for a future round. |

**Joy** is proposed as an advanced tier folded into the existing **Concentration** lane (unlocked at longer sit lengths, `adv:true` like the existing `MED_EXTRA.bliss`/`play`), not a standalone lane - TMI's own stage sequence places pīti/joy (Stage 8-9) directly after the breath ladder's Stage 7 mastery, so it reads as a deeper rung of Concentration rather than a separate practice. EVIDENCE: `TMI:Stage8-9` sequence position, plus the existing `adv:true` flag pattern already shipped on `MED_EXTRA.bliss`/`play`.

---

KB-SWEEP: meditation-scripts/_STYLES-INDEX.md, meditation-scripts/style1-blackstone-fundamental-consciousness.txt, meditation-scripts/style2-sam-harris-mindfulness.txt, meditation-scripts/style3-headspace-andy-reset.txt, meditation-scripts/style4-adyashanti-resting-as-awareness.txt, _mined/spiritual-canon/INDEX.md, _mined/spiritual-canon/TMI-attention-ladder.md, _mined/spiritual-canon/shinzen-datamodel-drills.md, _mined/spiritual-canon/MCTB-insight-ladder.md, _mined/spiritual-canon/hypnosis-ladder.md, fieldguide/induction-library/protocol-guides/pre-sleep.md, fieldguide/induction-library/protocol-guides/heart-coherence.md, _specs/COPY-ANCHORS.md (GUIDED-VOICE REGISTER LAW + SCOPE AMENDMENT sections), _specs/SPIRITUAL-PROGRESSION-CANON-2026-07-06.md (MEDITATION LANE SYSTEM + safety-gate sections), KB-ATLAS.md (full, grep-checked against meditat/breath/awareness/mindful), fieldguide/knowledge-base/mechanism-library/ (co2-bohr-effect.md, hrv-heart-coherence.md, targeted grep only, ruled non-technique), app.js MED_BLOCKS/MED_RETURN/MED_EXTRA/MED_SEC (lines 15214-15251, 18941-18964). Skipped and why: mantra-self-affirmation.txt (different mechanic), chaos-magic-techniques.md/sigil-mechanic.md/sechenov-relevance.md (magic line, out of scope per INDEX.md), theatre-of-mind.md/brainwave-navigation.md/emotional-unmemorization.md/TPL-001-master-template.md (not requested), alter-books-mind/alter-books-psy (did not match the atlas grep, different mechanic).
