# MEDITATION BENCH v2 — the subtle and advanced blocks, rewritten at REFERENCE LENGTH
*2026-09-16. Seat: the meditation bench. Sources: Blackstone (style1), Adyashanti (style4), Spero (style6, fetched today). Governed by `_specs/SCRIPT-ENGINE.md` PART 7.9. UNJUDGED until the taste skeptic, clarity skeptic and cutter run.*

**Why v2 exists.** David read v1: "meditation copy bad, should be as good as my references." Measured, the whole failure in one column:

| source | mean words per spoken unit |
|---|---|
| Harris | 43 |
| Headspace | 60 |
| Blackstone | 85 |
| Adyashanti | 113 |
| **v1 (rejected)** | **16** |
| **v2 (this file)** | **85.2** |

A sixteen-word budget was pointed at copy whose medium is unhurried speech. It caused three further defects, each fixed here by a named move:

| v1 defect | v2 fix |
|---|---|
| COMMANDS where the references INVITE | every rung offers rather than orders: *see if you can · you may find · if you like · both answers tell you where you are*. Blackstone's own grammar. |
| Instructs without TEACHING inside the instruction | the reason rides in a subordinate clause, never in a separate sentence: *so the in-breath does not lift you back up out of them · because the breath feeds whatever is in the chest · which is why it can run for weeks without being caught*. |
| Reaches for teacherly jargon to save words (naming dullness, naming stages at the listener) | **zero category names survive.** The dullness check is now an experience the listener runs on themselves: *If someone asked what you can hear right now, and you would have to go looking for an answer, the clarity has drained out of this while the comfort stayed.* No stage number, no word for the thing, nothing to look up. |

**What was kept.** v1's ladders and its three carrying rungs (the dullness check, the vigilance-drop test, Blackstone's paired-region balance) were well researched and are kept whole. What changed is that a reference-length line **carries three or four rungs at once**, unfolded across clauses, exactly as Blackstone's knee paragraph carries five. So the ladders survive intact while the POOLS shrink from 20/16/14/20/16/12 to 9/9/5/9/5/6.

**Technique taken, sentences never.** All three teachers are living authors. Per the SCOPE AMENDMENT (copyright pivot), the goal is generic technique in ALTER's own words; proximity to the source's phrasing is the failure, not the fix. The resemblance diff at the end proves the SHAPE matches and the WORDS do not.

**On the Spero cues that David killed (KILLED 2026-09-16d, all four).** The diagnosis in COPY-ANCHORS was that I kept his EXPRESSION (attach, detect, emotional structure, bliss field) and never found the act underneath. Now that the real transcript is on disk, the plain sentence of what the listener DOES, with no theory word in it:

> **When a heavy feeling and a good one are both here, stop working on the heavy one, put your attention on the good one, and keep it there.**

The observable: they stop trying to fix the problem. That is `bliss` rung 3, and it is the whole of "let your emotions attach to the bliss" for one half-awake person at 7am. Spero's other two acts, dug out the same way: *the good feeling is already arriving by itself, without your help* (his "the bliss arises in spite of any emotion"), and *you can enjoy this and you cannot own it* (his "a gift can never be possessed... it can only be enjoyed"). No line in this file contains attach, detect, emotional structure, bliss field, or "be happy in it".

---

## THE ARITHMETIC — the engine's real numbers, and why the pools shrank

The composer is `composeMeditationSegs`. Its exact behaviour, read from source:

```
slice        = totalSec × weight / sumWeights
entry cost   = pauseFor("cue", depth) + speech          // cue gap = 2.5 + 5·depth
line cost    = gap + speech
gap          = absorb 4 + 15·depth          (normal block)
             = max(25, min(45, 30 + 15·depth))   (deep: true)
depth        = often 0.12 · some 0.50 · spacious 0.90   (the "remind me" row)
lines placed = while (t < slice - 1)
```

At **2.5 spoken words per second** an 85-word line is 34.1s of speech, against 4.2s for a v1 line. Every pool below is sized so the ladder **completes at 10 minutes on "often"**, the maximum-line condition. Lines per block, computed per actual line, not per mean:

| block | entry | pool | mean | 2 min (oft/some/spac) | 5 min | 10 min |
|---|---|---|---|---|---|---|
| `open` | 67w | **9** | 85.4w / 34.2s | 2 / 2 / 1 | 5 / 4 / 4 | **9** / 8 / 7 |
| `heart` | 69w | **9** | 82.8w / 33.1s | 2 / 1 / 1 | 5 / 4 / 4 | **9** / 8 / 7 |
| `look` (deep) | 80w | **5** | 85.2w / 34.1s | 1 / 1 / 1 | 3 / 2 / 2 | **5** / 5 / 4 |
| `embody` | 83w | **9** | 91.9w / 36.8s | 1 / 1 / 1 | 4 / 4 / 3 | **9** / 8 / 7 |
| `being` (deep) | 71w | **5** | 92.2w / 36.9s | 1 / 1 / 1 | 3 / 2 / 2 | **5 / 5 / 5** |
| `bliss` (MED_EXTRA) | 66w | 6 | 85.2w / 34.1s | editor section, sized to a 300s slot: 6 |

Those counts assume the REVISED lane weights in the next section; on the shipped weights `open` reaches 8 of 9 and `heart` 8 of 9 and `embody` 8 of 9, and each ladder loses its climax. The weight change is what buys the last rung.

**A `look` prompt needs 25 to 45s of silence to investigate.** It gets exactly that, from `deep: true`: 31.8s at often, 37.5s at some, 43.5s at spacious. `being` is set `deep: true` for the same reason with a different justification: in a resting block the silence IS the practice, so five rungs with 32 to 44 seconds of rest after each is a truer Adyashanti sit than nine rungs with six-second gaps.

### THE BLOCKER — `PK.speechEst` must become per-line before any of this ships
`PK.speechEst` is a flat **4.2s**, measured against v1-length lines. Every composer adds `t += gap + PK.speechEst`. With 85-word lines the real speech is 34s, so the composer lays down roughly **three times** the lines a slice can hold, and `relayoutFrom` then squeezes the elastic gaps (`absorb` and `inquiry` are both in `PK_ELASTIC`) toward zero trying to fit. The silences die and the act still overruns, because speech cannot be squeezed.

Worked example, the one that breaks first: the morning stack's meditate act at the 10-minute band gives its `rest` section 50s. At `sessionDepth(150) = 0.275` the cadence is 8.1s, so the composer's estimate is 12.3s a line and it lays down **4 lines = 136s of actual speech into a 50s slot**.

The fix, one helper, used everywhere `PK.speechEst` is added to `t`:
```js
function speechOf(s){ return Math.max(2, (String(s).match(/[A-Za-z']+/g) || []).length / 2.5); } // 2.5 spoken words/sec
```
Call sites to change: `composeMeditationSegs` (the entry line and the pool loop), the `meditate`/`medit` branch of `composeStackSegs`, and `medComposeSegments`. `PK.speechEst` stays as the fallback for tools whose lines are still short. **Nothing in this file should ship before that change.**

### THE DE-DUP, solved by a data edit
`MED_SEC.rest = medView("open")`, so the stack's meditate act speaks `MED_BLOCKS.open` verbatim. That is why v1 found the stack saying the whole `open` pool. Rewriting the words does not fix it, because the two surfaces share one array.

**Recommendation (data only, no engine change):** give the stack its own `rest` section holding the EIGHT currently shipped short lines plus the shipped entry, and let `MED_BLOCKS.open` become the lane-only long pool.

```js
// in MED_EXTRA
reststack: { name: "Rest", col: THC("#63e6d6","bg"), ti: "ti-windmill", lines: ["Now let go of every technique. Nothing to focus on, nothing to fix. Just be aware, and let everything be as it is.", "Let everything be exactly as it is. Thoughts, sounds, and sensations, all coming and going on their own.", "You don't have to do anything to be aware. It's already happening, all by itself.", "Notice that awareness has room for all of it. However loud or busy it gets, it can be here.", "When something pleasant arrives, let it be, and enjoy it lightly. When something hard arrives, let it be here too, without a fight.", "Rest here, aware of whatever comes, holding on to none of it.", "If you drift into thought, no problem. The moment you notice, you're already back.", "You don't have to keep watching so closely. Let the effort go, and just be here, aware.", "Nothing to reach for, nothing to keep. Let each moment arrive and pass in its own time."] },
// in MED_SEC
rest: MED_EXTRA.reststack,   // was medView("open")
```
Four things this buys at once: the lane's `open` shares ZERO lines with the stack; the eight David-approved lines survive verbatim; the stack's 50-second sections keep lines that fit them; and the saved-track key `rest` keeps resolving, so no user's `medTracks` breaks.

### ONE ENGINE RULE FIXES THE THREE REMAINING GAPS
At "some" and "spacious" the last rung of `open`, `heart`, `embody` and `look` still falls off the end. Those last rungs are the climax of the Blackstone arc, the widening of metta past the body, the after-the-sit persistence check, and **the Insight block's grounding off-ramp**. That last one is a safety item, so this is not a nicety.

```js
// composeMeditationSegs, after the while loop for this block:
if (idx < order.length && order.length) {            // the spine's last rung always lands
  var fin = order[order.length - 1];
  if (!used[_normLine(fin)]) { used[_normLine(fin)] = 1;
    var _mf = medSeg(fin, def.deep ? 25 : pauseFor("absorb", depth), ""); _mf._pk = def.deep ? "inquiry" : "absorb"; P(_mf); }
}
```
Same three lines fix the embody climax, the heart widening, the open persistence check and the look grounding line. It is the single highest-value engine ask of this round.

### ONE CONSEQUENCE DAVID SHOULD HEAR
The "remind me" row (often / some / spacious) used to mean 11 / 24 / 42 seconds between cues. With 34-second lines the real cue-to-cue becomes roughly **40 / 45 / 52 seconds** in these five blocks. The dial still works, and its range compresses. Either that is fine (these are the advanced lanes and a 40s cadence is right for them), or the three labels want re-pointing in the advanced lanes only. One decision, no code opinion attached.

---

## 1. `open` — equanimity and choiceless awareness · pool 9

**Ladder** (each rung is one spoken line; the old 20 rungs fold into these nine):
1. The quiet forms of steering, and taking your hands off each one. `SHIN Do Nothing rule 2`
2. Choiceless landing plus light-touch noting: a word only for the loudest thing. `SHIN Focus on Everything`
3. THE LEAN CHECK: the tilt toward pleasant and away from hard, levelled. `SHIN push/pull`
4. The second arrow: the flick of irritation dropped BEFORE the return. `SHIN §3`
5. **THE DULLNESS CHECK, rendered as an experience.** `TMI Stage 5`
6. The remedy: a vividness refresh, then the sanctioned swap back to an object. `TMI 5 + SHIN swap rule`
7. **THE VIGILANCE-DROP TEST**, with both outcomes handled. `TMI Stage 7`
8. Energy waves and twitches are content; so is the wish to do it properly. `TMI 7-8`
9. Persistence: how far the openness travels after you stand up. `TMI Stage 10`

**Arithmetic.** slice = 600 × 3.4 / 5.3 = 385s at 10 min. Entry 67w → 3.1 + 26.8 = 29.9s. Nine lines at 5.8 + (76 to 94 words / 2.5) = 36.2 to 43.4s each, summing to 355s. 29.9 + 355 = 385s, landing the ninth rung with 0.1s to spare. At 5 min the sit walks to rung 5, the dullness check, which is a coherent place to stop.

**Entry rewritten.** The shipped entry now belongs to the stack (see the de-dup edit). The lane's entry teaches Shinzen's two rules at once, so the block is complete even on a 2-minute sit.

---

## 2. `heart` — metta, widening outward · pool 9

**Ladder:**
1. The three wishes, said slowly, with the no-forcing permission attached. `metta common tongue`
2. Hand over the heart, the beat as the access point, warmth at the center. `HC`
3. Breathing through that spot; the breath wakes the quality. `HC + BL`
4. Turn it on yourself, slower here than anywhere else. `APP`
5. **THE ASYMMETRY CHECK: if it lands on a stranger and not on you, stay longer.** `bench, from HC self-directed work`
6. The neutral person, and thinner is the correct reading. `APP`
7. CONDENSE: drop the sentence, keep one word, and why that works. `conditioning logic`
8. The difficult person (opt-in), plus CARE vs OVERCARE located somatically. `APP + HC`
9. Widen past the room to everyone, then past the body with nobody left to picture. `APP + HC installation`

**Arithmetic.** slice = 600 × 3.3 / 5.2 = 381s. Entry 69w → 30.7s. Nine lines at 5.8 + (73 to 90 words / 2.5) = 35 to 41.8s, summing to 348s. Total 379s inside 381s: nine rungs land. At 5 min the sit reaches rung 5, the asymmetry check, which is the right stopping point for a short heart sit.

**Specificity is fused into the entry** (rung 2 of v1's ladder), because a category noun instead of a particular afternoon is the commonest silent failure in metta and the entry is the only line guaranteed to play.

---

## 3. `look` — self-inquiry · `deep: true` · OPT-IN AND SAFETY-GATED · pool 5

**Ladder:**
1. Catch a thought at the instant it starts; it arrived unchosen and left on its own. `APP + MCTB Stage 1`
2. Thought heard the way a sound in the room is heard; then something that bothered you, held as space. `MCTB Stage 1 + APP`
3. **LOOK FOR THE VANTAGE POINT: a place with edges, or only the looking.** `bench, classic inquiry`
4. Look for the thinker; the mind offers an easier question, and the offer is left where it is. `APP + ADY the bait`
5. Look for the center you call I; finding nothing is the expected result; rest as awareness; **the grounding off-ramp**. `APP + MCTB stabilization menu`

**Arithmetic.** deep gap = 31.8 / 37.5 / 43.5s, which is the 25 to 45s investigate-silence this block needs. slice = 600 × 3.0 / 5.3 = 340s at 10 min. Entry 80w → 3.1 + 32 = 35.1s. Five lines at 31.8 + (81 to 97 words / 2.5) = 64.2 to 70.6s, summing to 335s. 35.1 + 335 = 370s, so rung 5 is placed at t = 305s, inside the 339s bound. At 5 min the sit reaches rung 3. At 2 min, the entry plus rung 1 only, which is why the off-ramp lives in the entry.

**The orientation moved INTO the entry**, unlike v1 where it was pool line 1. The entry is the only line that plays at every length, so the sentence *If it ever gets uncomfortable or far away, come back to the breath and stay there. That is a whole sit and a good one* is now unconditional.

### SAFETY — binding on `look` and any Insight-lane content
1. **The ceiling holds.** The pool tops out at thought-as-thought noticing (MCTB Stage 1) and no-self-found-so-rest. Nothing here reaches Stage 4, the Arising and Passing Away, Ingram's "point of no return", or the Dissolution to Re-observation band beyond it where he documents suicidal ideation as a real minority risk. **Do not extend this pool toward those stages, ever, in any future round.**
2. **Opt-in stays opt-in.** `gated: true` remains. The picker keeps hiding this lane from a practice-novice and on a low energy-door day, and keeps its one-time consent screen. It is never surfaced by a streak, a level-up, a recommendation, or a notification.
3. **The off-ramp is in the ENTRY**, so it plays at every length. That is the change from v1, where it was pool line 1 and the grounding line was pool line 14, reachable on almost no sit.
4. **The grounding line closes rung 5** (feet on the floor, one full breath, back into the room, which is Ingram's own sensate-grounding menu) and the engine rule above is what guarantees it plays at every depth setting. Until that rule ships, the grounding line is reachable only at 10 minutes on "often".
5. **GAP, and copy cannot close it.** A pool line can never be a safety net. The real off-ramp has to be a visible stop control in the player during a gated sit, alongside the support resource the canon requires. Named here because no seat in this round can build it.
6. **The `close` block after a gated sit should run longer** than after a light concentration sit: more body, more room, more anchor. That is another seat's scope, flagged across.
7. **No forcing language anywhere.** No push through, no master it, no complete the level. Finding nothing where a self was expected is stated as the expected result, in rung 5, in those words.

---

## 4. `embody` — NEW · Blackstone: inhabit the body, then one continuous space · pool 9

*Distinct from `scan`, which passes down the body softening what it finds. This one moves INSIDE a region and lives there. It is also the block the morning stack's relax act makes dangerous, so it never once asks for relaxation as its instruction: "soften" appears only as Blackstone's own completion marker for a region that has been adequately inhabited.*

**Ladder:**
1. Ankles and lower legs; and a region that gives nothing today is normal. `BL`
2. **BOTH KNEES AT ONCE, and the correction: thin the attention until it holds both.** `BL`
3. Thighs, then from inside the hip sockets: upper leg and lower torso at once. `BL`
4. Pelvis to the sit bones with the breath brought down; midsection; the strength in it. `BL`
5. Whole chest front to back until you are sitting inside your own heart; the tenderness; the breath through it. `BL`
6. Shoulders, then the sockets further back than expected; arms to the fingertips and the ownership. `BL`
7. Neck and the quality of your own voice; forehead point, then get BEHIND it. `BL`
8. Whole brain and the quality of understanding; then eyes, face, ears. `BL`
9. **THE CLIMAX: gather the whole body, then the space inside and the space in the room as one continuous space.** `BL`

**Feet, and the expert instruction, are in the ENTRY** (KEEP THE BREATH LOW so the in-breath does not lift attention back out of the region). It is the move the whole method turns on and it is invisible to a beginner, so it plays on every sit.

**Arithmetic.** slice = 600 × 3.8 / 5.8 = 393s at 10 min. Entry 83w → 3.1 + 33.2 = 36.3s. Nine lines at 5.8 + (85 to 96 words / 2.5) = 39.8 to 44.2s, summing to 375s; the ninth is placed at t = 375s, inside the 392s bound. At 5 min the sit stops after rung 4 and hands off to `close`, which is a coherent practice that misses the designed ending. **This is the block the always-play-last rule matters most for.**

**Two Blackstone moves deliberately CUT, and why.** (a) The fine upward current of energy rising through the core, which he returns to at every region. It is his signature subtle rung and it is also the mystical wash David has killed by name. (b) The quality of gender in the pelvis. Neither is missed by the ladder. If David wants the current, it exists as one plain line and can be slotted at rung 4; he decides, the bench does not. **Also cut:** his eyes-open transfer at the end, which belongs to `close`.

---

## 5. `being` — NEW · Adyashanti: resting as awareness, dropping the doer · `deep: true` · pool 5

*Displayed name is "Rest"; the key stays `being` as briefed.*

**Ladder:**
1. **NAME THE DOER** and relinquish it: the part asking all the questions, told it is not needed, walked past. Then rest, with no second half. `ADY`
2. Set down the need to understand; letting be as the operative motion; FIND THE PUSH where the mind is still making something happen. `ADY`
3. Trying has a physical feel; and the bait arrives within seconds, is not solved and not argued with. `ADY + bridge`
4. A few seconds counts; consistency beats duration; the protest that this is too simple is allowed. `ADY`
5. **THE NON-OBJECT RETURN: put down what you picked up, there is nothing to re-grip.** Then drop the watcher role, and the offering. `ADY`

**Why the pool is five and not sixteen.** Adyashanti's own mean is 113 words, the longest of the four teachers, and it is not incidental: relinquishing the doer cannot be done at speed. Each rung above carries three to four of v1's sixteen, unfolded across clauses the way he unfolds them. Five rungs with 32 to 44 seconds of real rest after each is the practice; sixteen rungs with six-second gaps is a lecture about the practice.

**Arithmetic.** slice = 600 × 3.4 / 5.6 = 364s at 10 min. Entry 71w → 3.1 + 28.4 = 31.5s. Five lines at 31.8 + (90 to 96 words / 2.5) = 67.8 to 70.2s, summing to 345s. Rung 5 is placed at t = 308s, inside the 363s bound, **at all three depth settings** (often 5, some 5, spacious 5). This is the only block whose ladder completes without the engine rule, and it is deliberate: the non-object return is the block's own return move and every line of `MED_RETURN` says come back to the breath, which is wrong here.

**The line most at risk of a taste kill** is rung 5's *See if you can put down the watching as well, because standing back and observing is one more job, and you can be out of a job for a few minutes.* It is Adyashanti's opening claim said plainly and it sits one step from the meditation-madness kill. Kept because the nuance ceiling is explicitly Harris or Adyashanti (GUIDED-VOICE REGISTER LAW) and because it names a checkable action with a reason attached. If the taste skeptic or David kills it, the fallback that keeps the rung: *See if you are still standing back a little way from all this, and come in closer, to where it is happening.*

---

## 6. `bliss` — the pleasant side of awareness · re-grounded in the real Spero source · 7 lines

*Lives in `MED_EXTRA` with `adv: true`. `medSecResolve` reads `lines[0]` as the entry and the rest as the pool. Distinct from `heart`: nobody is pictured, and the warmth is sourced from the practice, not from a person.*

**Ladder:**
1. Do not inflate it; it fills out on its own; the mind would rather be handling something. `APP kept + TMI`
2. If nothing pleasant is here: plain comfort as the object, or prime it with one real scene. `SHIN Nurture Positive`
3. **SPERO'S ACT, dug out: leave the heavy feeling alone, put your attention on the good one, let the rest of you come along.** `SPERO`
4. Spread it through the body; waves move on their own; the senses going quieter is expected. `SHIN + TMI Stage 8`
5. **REACHING FOR MORE THINS IT OUT. It can be enjoyed and cannot be owned.** `TMI craving trap + SPERO the gift`
6. If it wobbles your attention, rest on the intensity; it matures into something quieter; check after the sit. `TMI Stage 9-10`

**Arithmetic.** An editor section gets `t.secs / nSections`. Sized to a 300s single-section track: entry 66w → 5 + 26.4 = 31.4s, then six lines at 11.5 + (81 to 92 words / 2.5) = 43.9 to 48.3s each, summing to 279s. Six rungs land in 310s, so the ladder completes on a 5-minute section and walks to rung 3, the Spero move, on a 150-second one.

---

## PASTE-READY — `MED_BLOCKS` (replace `open`, `heart`, `look`; add `embody`, `being`)

```js
    open: { name: "Open", ti: "ti-windmill", c: THC("#63e6d6","bg"), entry: "Now set the technique down. For the rest of this sit there is no object to hold and no place your attention is supposed to be. Whatever arrives gets to arrive, and whatever goes gets to go. Two things only. Let what happens happen. And when you catch yourself steering, which you will, let go of the steering as well, and carry on from wherever you are.",
      pool: ["The steering is easy to catch when it is loud, and most of it is quiet. See if you can notice the smaller version: leaning in a little when something interesting shows up, or tightening when a sound goes on too long. Each time you find one, let the leaning go and leave the thing where it is. There is no tidying to do here. Taking your hands off it, over and over, is the practice.", "Now let your attention land wherever it gets pulled. You do not have to choose, and you do not have to keep anything in view. If one thing is clearly the loudest, you can put a quiet word on it, sound, or ache, or picture, and let it go by. Anything quieter than that passes without a name. Notice how the pull moves on its own from a sound, to an ache, to a picture in the mind, without you arranging any of it.", "See what your attention does the next time something pleasant comes through. There is usually a small lean toward it, and a small pull back from whatever is uncomfortable, and both are quiet enough to run all sit without being noticed. When you catch one, you do not have to correct it or feel bad about it. Let the two even out, so the warm patch and the ache are met with the same amount of you. That evenness is the skill this whole practice is training.", "Sooner or later you will surface out of a long stretch of thinking with no idea when it started. Before you come back, check whether a second thing has arrived on top of it, a flick of irritation at yourself for having gone. That flick is a separate event from the drifting, and it is the one worth putting down first. Drop it, and then the coming back happens on its own, with no effort and no comment.", "Every so often, check what the quiet is made of. If someone asked what you can hear right now, and you would have to go looking for an answer, the clarity has drained out of this while the comfort stayed. The calm is still here, and the sharpness has quietly gone. It is the most comfortable way there is to lose a session, which is why it can run for weeks without being caught, and why the checking is worth doing on the sits that seem to be going well.", "If you found that, brighten it back up before you carry on. Pick one thing with an edge on it, a sound with a shape, the coolness at the rim of the nostrils, and let it get vivid again for a few breaths, then let the field open out from there. And if the openness has gone aimless instead of wide, take the breath back as something to hold for a minute or two. Going back to an object is allowed here, and it is how the open part gets its clarity back.", "Here is something worth trying once a sit. You have been doing a quiet job this whole time, holding yourself here, keeping the openness open. For about five breaths, put that job down completely and watch what happens without you. If the attention scatters straight away, pick the job back up, gently, and carry on. If it stays roughly where it was with nobody holding it, leave it alone for a while and let it run itself. Both answers tell you where you are, so run it again later on.", "Odd things come through in this kind of sitting. A wave of warmth, a small twitch in a hand, a patch of the body that goes vague, a sound that arrives louder than it should. None of that needs handling and none of it needs to stop. Let each one come and go with the rest. The wish to be doing this properly will show up too, with a whole argument attached about whether it is working. That wish is one more thing passing through, so let it pass, and stay where you are.", "One more thing, for after. When this ends and you get up, see how far the openness travels with you. Walking to the kitchen, opening a door, the first thing somebody says. At the start it will drop away within a minute, and that minute gets longer over months of sitting. Noticing where it stops is what stretches it, so take one look on your way out, and let that be the last part of the practice."] },
    heart: { name: "Heart", ti: "ti-heart-handshake", c: THC("#ff5f9e","bg"), entry: "Now bring to mind someone who is easy to love. A person, an animal, anyone at all. Instead of a general idea of them, pick one real moment you were both in. A particular afternoon, a particular look on their face, close enough that you could describe the light in the room. Let them be here with you like that, and let whatever warmth comes with the picture come.",
      pool: ["Now wish them well, silently, in whatever words come. May you be happy. May you be safe. May you be at ease. Say each one slowly enough that it lands somewhere, then wait a moment before the next. If the feeling does not arrive, leave it alone. The wishing is the part you do, and the warmth either comes with it or it does not, which is ordinary either way. Keep the person in mind and keep the words going.", "If you like, rest a hand flat over the middle of your chest, and leave it there long enough to feel the beat underneath it. That contact gives the wish somewhere to come from. Let the warmth gather right under your palm, at the center, and let the chest around it go soft. It does not have to be a large feeling. A little tenderness under the hand is enough to work with.", "Now breathe as though the air went in and out through that spot in the middle of your chest. Nothing changes about the breathing itself. You are running it through the warm place instead of past it, and each pass leaves the warmth a little more awake than it was. Keep the person in mind while you do it. If the picture of them slips away, bring them back and carry on, because the breath feeds whatever is in the chest, and you get to choose what is in there.", "Now turn the same wish around and send it to yourself. May I be happy. May I be safe. May I be at ease. Use your own name if that lands better. This is the one people hurry through, and it is worth going slower here than anywhere else, because the wish you can give a stranger and the wish you can give yourself are made of the same thing. You are as fair a place to put it as anyone you have thought of so far.", "Check the difference between the two. If the wish went out to that first person and something moved, and the same words aimed at you landed on nothing, stay here longer. Do not argue with it or work out why. Keep saying the line to yourself, slowly, the way you said it to them, and let the gap be as wide as it is. It closes by repetition and by nothing else, which is why the slow version of this part is the one that does the work.", "Now bring to mind someone you barely know. The person at the till this morning, a neighbour whose name you have never asked, somebody who passed you on the street and went on to a whole day you will never see. Send them the same three lines. May you be happy. May you be safe. May you be at ease. The feeling will be thinner here than it was for the first person, and thinner is what it should be. Keep going anyway.", "By now the words have done their job and you can let them get shorter. Drop the sentence and keep one word. Safe. Or happy. Or ease. Say it once on an out-breath and let the full wish arrive with it. The word works because you have already said the long version enough times for the short one to bring all of it along behind it. Keep the person in mind, and keep the one word going.", "If it feels alright, bring to mind somebody you find difficult, and send them a little ease. If that is too much today, stay with someone easy and leave it there. And watch what your chest does here, because worry can move into the same place love sits and pass itself off as caring. If you find a grip in the gut or a tightness in the throat, that is the worry part. Let that go on the out-breath and keep the wish.", "Now let the circle keep opening. Past the person and past the room, out to the street, the city, everybody awake right now and everybody still asleep. May you be happy. May you be safe. May you be at ease. And then let go of picturing anyone at all. Keep the warmth and let it carry on spreading past the edges of your body, with no one left to aim it at, going out in every direction and meeting whatever is there."] },
    look: { name: "Look", ti: "ti-zoom-question", c: THC("#b98cff","bg"), deep: true, entry: "Now something different. Instead of watching what shows up, you are going to look for the one who is watching it. There is no answer to get right here and nothing to work out. Each question gets asked once, and then you go and look for the thing itself, with attention instead of with thinking. If it ever gets uncomfortable or far away, come back to the breath and stay there. That is a whole sit and a good one.",
      pool: ["Wait for the next thought and try to catch it at the moment it appears, at the instant it starts, before it has had a chance to run. Watch where it came from. You did not order it and you did not build it, and a second before it arrived there was no sign of it anywhere. Then it is gone, and it went without you doing anything to end it. Wait for the next one and watch that arrival too.", "Now listen to the next thought the way you are already listening to the room. A sound arrives, it is heard, it goes, and you do not become the sound. See whether a thought can be received on those same terms. Then let something that has been bothering you come in, and hold it like that. The feeling can be as strong as it wants. You are the space it is appearing in, and space is not damaged by what turns up inside it.", "Here is a question to look at, not to answer in words. You have a strong sense of looking out from somewhere, from a point behind the eyes. Go and find it, with the same attention you would use to find an itch. Is there a place there, with edges, that you could point at from inside? Or is there looking going on with nowhere it comes from? Stay with that. Do not take the first answer that arrives already phrased.", "You feel like the thinker standing behind your thoughts, the one deciding what comes next. Look for that one now, while the thoughts are still arriving. Is there anybody back there, or is there only the next thought, and then the next? Somewhere in here your mind will offer you an easier question to work on instead, and it will sound reasonable and even useful. Leave that offer where it is. Keep this one open and keep looking, even while no answer comes.", "One last one. Look for the center of all this, the one you call I, the thing every sentence in your head is about. Look where it should be, and keep looking past the first few answers. If you find nothing where the center was supposed to be, that is the result, and it is the expected one. You do not have to conclude anything from it or do anything with it. Rest as the awareness the whole search was appearing in. And whenever you want, feet on the floor, one full breath, back into the room."] },
    embody: { name: "Embody", ti: "ti-body-scan", c: THC("#ff9a3d","bg"), entry: "Now move your attention into the body itself. This one is different from scanning down through it and softening what you find. You are going to go into one part at a time and live in it from the inside. Start at your feet. Come all the way down there and stay, with deep contact, feeling your feet from within. Let your breath settle to you being that far down, so the in-breath does not lift you back up out of them.",
      pool: ["Now your ankles and your lower legs. Move up into them and let them fill the same way, from the inside out, all the way around the bone. Take your time about it. Each time you do this you will find a little more of yourself in there than you found last time. And if a part gives you nothing at all today, no inside to it, no sense of anything, note that and move on. Some regions stay quiet for months before they open, and none of that is a sign of anything gone wrong.", "Now come into your knees and settle down into them until they feel soft. Then hold the inside of both at once. Both of those spaces at the same time, with neither one taking turns. If you notice your attention going back and forth, left knee then right knee then left again, that is the ordinary way and it is worth fixing. Thin your attention out. Make it finer, until it is fine enough to be in both places without splitting. Then feel how still everything goes when it is balanced like that.", "Your thighs now, from the knees up to where the leg meets the hip. Let them soften as you fill them, and let yourself sink down into them. Take a moment to notice that these are your legs, and that being inside them gives you a plain kind of ownership of them. Then move into the hip sockets themselves. From in there, if you go fine enough again, you can hold the inside of the upper leg and the inside of the lower torso at the same time, living right in the join between them.", "Settle into your whole pelvis, right down to the sit bones, and let the breath come all the way down into it, so that you stay low while it moves. Then up into the midsection, everything between the ribs and the pelvis, and let the area just under the ribs go soft and join the rest of it. Stay in there and feel for the strength that lives in that part of you. It is yours, so it is good strength. Breathe down into it and feel the breath pass through it.", "Now the whole chest, front to back, out through the ribs to the sides and into the upper back, so you are inhabiting all of it and not only the front. Settle in until it feels like you are sitting inside your own heart. Staying that settled, feel for the tenderness that is in there. It does not need to be a big feeling, and on most days it is a small one. Let the breath move down through it, in and out, and notice that the breath gently wakes it up.", "Your shoulders now, until the edges of them go soft. Then find the shoulder sockets, which sit further back in the body than people expect, so go looking behind where you think they are. Hold the inside of both sockets at once, the same balance you found at the knees. Then let it run down your arms, through the elbows and the wrists into your hands, all the way out to the fingertips. Stay there a moment and feel that these are your arms and your hands, known from the inside.", "Into your neck now. Live in there for a moment, properly inside it, and feel for the quality of your own voice sitting in that space, whether or not you are using it. Bring the breath down into your neck and let it move through that. Then up into your forehead, all the way out to the temples, and find a point at the center of it. Keep the point steady while you breathe. Then get behind the point and look at it from inside your head, and sit with whatever is there.", "Now your whole brain, the whole volume of it, not the forehead on its own. Feel for the quality of your understanding in there, whatever that turns out to feel like today. Breathe straight back on the way in and let the out-breath go wherever it goes, and feel the breath move through that quality, feeding it. Then let your eyes soften until they feel continuous with the rest of your face, and come into the cheekbones, the jaw, the mouth, and right through the openings of the ears.", "Now gather it. Your torso, your neck, your head, and then your arms and your legs added back in, until you are inhabiting the whole body at once. Take a moment with that. Your body. Then find the space outside you, the space in the room, without moving out of yourself to do it. And see whether the space inside your body and the space out there are one continuous space, going right through you, undivided, with the breath moving easily through all of it."] },
    being: { name: "Rest", ti: "ti-cloud", c: THC("#c9a6ff","bg"), deep: true, entry: "Nothing to do in this one. Awareness is already here and already working, without any help from you, so the practice is to stop helping. If your mind asks what it should be doing now, notice that the question is coming from the part of you that wants to get things right, and that part has nothing to get right here. Let it ask. You do not have to answer it.",
      pool: ["Find that part now. The one that has been asking how to do this properly since the moment you sat down, the one that wants to know if it is working. It is not an enemy and there is no need to argue with it. Let it know it is not needed for the next few minutes, the way you would tell a helpful person that you have this one covered, and then let your attention go on past it. Then rest. That is the whole instruction, and there is no second half to it.", "Set down the wish to understand what is happening here as well. There will be time for working things out, and it is after this. What is left when the doing and the understanding are both put down is a kind of letting be, which is different from relaxing and different from concentrating. So look for where your mind is still trying to make something happen, or trying to stop something happening, and let that push go. Then whatever is here gets to be exactly as it is, including you.", "Trying has a physical feel to it, a slight forward lean, a small gathering somewhere behind the face. Find yours and let it come back to rest. And expect this next part, because it arrives within seconds for nearly everyone. Your mind will come back with one more thing that has to be worked out first, and it will sound like exactly the thing that would make resting easier. Do not solve it and do not argue with it. Leave the thread hanging where it is, and carry on resting.", "A few seconds of the real thing already counts. There is no length you are supposed to reach and nothing to hold on to for longer. What matters is how often you come back to this, over weeks, and not how long you can stretch it out in one sitting. And if a thought turns up saying this is too simple to be doing anything, let that be one more thing you allow. One plain instruction is harder to stay with than a complicated one, and that difficulty is ordinary.", "Sooner or later you will notice you have picked something up again. When you do, put it down. There is no object here to come back to and no breath to find, so the return is a setting down and not a reaching. See if you can put down the watching as well, because standing back and observing is one more job, and you can be out of a job for a few minutes. And if it happens on its own, notice that the one resting and the awareness it rests in were never two things."] },
```

## PASTE-READY — `MED_EXTRA.bliss` (replace in place)

```js
    bliss: { name: "Bliss", col: THC("#ff9ec9","bg"), ti: "ti-sun-high", adv: true, lines: ["Now look for the pleasant side of being aware. Underneath the thinking there is usually a quiet ease that has been there the whole time, the ordinary background feeling of being alright. It is easy to walk past because it makes no noise. Let your attention rest on that instead of on the thoughts, and see whether you can find where in the body it sits.", "You do not have to make it bigger and you will spoil it if you try. Leave it at the size you found it and keep your attention on it, and it tends to fill out on its own over a minute or two, without being asked. If it stays small, small is fine. The job here is to keep noticing it, which is harder than it sounds, because the mind would rather be handling something than sitting with something pleasant.", "If you look and find nothing pleasant at all, take plain comfort as the thing to rest on instead. The warmth of your hands. The easy part of the out-breath. The weight of you held by the chair. Any of those will do. Or bring back one good moment in detail, a specific afternoon, close enough to see, and let the body remember how it felt, because a general idea of a happy day will not move anything, and one real scene will.", "If a heavy feeling is here too, leave the heavy one alone. You will not win a fight with it while it is running, and trying is most of what keeps you in it. The good feeling is already arriving by itself, without your help, so put your attention on that one and keep it there, and let the rest of you come along with it in its own time. Nobody is asking you to get rid of the heavy one. You are only choosing which of the two you stay with.", "Let it spread out from wherever it started. Out through the chest, down the arms, into the legs, until more of you has it than had it a minute ago. If a wave of warmth or lightness comes through, let it move on its own and keep your hands off it, with no steering and no holding on. And if sounds and sensations go quieter while this runs, let them go quiet. That happens here and it is a sign this is going the way it goes.", "Watch what happens when you reach for more of it. The reaching thins it out every time, because wanting more of a feeling and having it are two different states, and you cannot be in both at once. So stay at the size it already is. You can enjoy this and you cannot own it, and the moment you start trying to keep it you have traded it for the wanting. Enjoying it is the only thing to do with it.", "If it ever gets strong enough to shake your attention loose, stop trying to hold your attention steady and rest on the strength of it instead. Let the intensity be the thing you are feeling. Over enough sits this settles by itself, out of excitement and into something much quieter, and the quiet version is the one worth keeping. When the sit ends, take a moment to check whether any of the ease is still with you, because noticing it is how it learns to stay."] },
```

---

## THE LANES — `MED_SESSIONS`, with the REVISED weights

Same shape as the five shipped lanes: settle, a brief breath anchor, the heavily weighted SPINE block walked in authored order, close. Depth stays a conscious lane choice; length only walks the spine further. **The weights on the three existing lanes change**, because at reference length the shipped weights lose each ladder's last rung.

```js
    open: { name: "Open awareness", sub: "rest as the space things arise in", blocks: [["settle", 0.8], ["breath", 0.5], ["open", 3.4], ["close", 0.6]] },
    heart: { name: "Heart", sub: "warmth, widening outward · metta", blocks: [["settle", 0.8], ["breath", 0.5], ["heart", 3.3], ["close", 0.6]] },
    insight: { name: "Insight", sub: "look for the self · gentle, optional", blocks: [["settle", 0.8], ["breath", 0.7], ["look", 3.0], ["close", 0.8]], gated: true },
    embodiment: { name: "Embodiment", sub: "inhabit the body, one part at a time · Blackstone", blocks: [["settle", 0.8], ["breath", 0.5], ["embody", 3.8], ["close", 0.7]] },
    resting: { name: "Resting", sub: "drop the doer, nothing to fix · Adyashanti", blocks: [["settle", 0.8], ["breath", 0.6], ["being", 3.4], ["close", 0.8]] },
```
`concentration` and `mindfulness` are UNCHANGED: their spines (`breath`, `note`) are not in this round's scope and their lines are still short, so their weights are still correct.

Add to the picker's `LANES` array (Insight stays appended only when `insightOK`):
```js
      var LANES = [["Concentration", "concentration"], ["Mindfulness", "mindfulness"], ["Open awareness", "open"], ["Heart", "heart"], ["Embodiment", "embodiment"], ["Resting", "resting"]];
```

**Embodiment.** Advanced because it asks for interoception at a granularity nobody reaches by accident: holding the inside of both knees at once, finding a socket that sits further back than expected, keeping the in-breath from lifting attention out of the feet. EVIDENCE: `meditation-scripts/style1-blackstone-fundamental-consciousness.txt` is a complete, continuous, ready-sourced technique with no lane home in the app. *The user must already be able to* stay inside one region for about half a minute without the breath pulling them out, roughly the middle of the Concentration lane. A first sit will feel like nothing is happening below the knees, which is why rung 1 carries the permission.

**Resting.** Advanced because the instruction removes the object entirely, so there is nothing to measure yourself against, and a user who cannot yet feel their own effort will space out and call it rest. EVIDENCE: `meditation-scripts/style4-adyashanti-resting-as-awareness.txt` is the STYLES-INDEX nondual capstone, and the doer-relinquishment move has no slot in any shipped lane. *The user must already be able to* tell resting from drifting, which is exactly what `open` rung 7, the vigilance-drop test, teaches. That rung is the prerequisite exercise, so the Open lane is the honest doorway to this one.

**Insight, unchanged in kind and still gated.** Advanced because it destabilises the felt sense of a self on purpose. *The user must already have* a settled baseline plus explicit one-time consent, and it stays suppressed on a low energy-door day. Its spine `look` shrank from 9 lines to 5, and gained the safety orientation inside the entry.

### Wiring notes for whoever edits app.js
- **`speechOf()` first.** Nothing here ships before `PK.speechEst` is per-line at the three call sites named in the arithmetic section. This is a correctness blocker, not a polish item.
- **The stack split second** (`MED_EXTRA.reststack`, `MED_SEC.rest` repointed). Without it the morning stack tries to speak 136s of copy into a 50s section.
- **The always-play-last rule third.** Three lines in `composeMeditationSegs`; it is what makes the embody climax, the heart widening, the open persistence check and the look grounding line reachable at every depth setting.
- **Colors reuse existing registry hexes only** (`embody` takes scan's `#ff9a3d`, `being` takes watch's `#c9a6ff`). No new hex, so `_dev/theme-add.py` is not needed and preship will not fail on the theme gate.
- **Do NOT add `embody` or `being` to the weave regex** `/^(count|scan|listen|watch|feel)$/` in `medBlockResolve`. Every `MED_RETURN` line says come back to the breath, which is wrong in a body block and actively wrong in `being`, whose own rung 5 IS the non-object return.
- `deep: true` on `being` uses the same long-silence mechanic as `look`. The comment at `medBlockResolve` glosses `deep` as self-inquiry; it should read long-silence blocks.
- **New section names need RU** in the `Object.assign(I18N.ru, ...)` block next to MED_BLOCKS: Embody and Rest. Lane names Embodiment and Resting too.
- `scan` is still unused by any lane. It softens as it passes, the relax act already does that, and `embody` covers the same terrain properly. If David wants `scan` reachable it belongs in a short reset lane, never in front of this one.
- **TTS regeneration is large**: 49 clips, mean 34s each, about 28 minutes of speech. Per the standing law, no audio is generated until David has read and verdicted the copy.

---

## THE RESEMBLANCE DIFF — five of mine beside five verbatim reference passages

Measured first, then read aloud. Clause count is splits on `, ; :` plus the subordinators and/but/so/because/that/which/if/when/until/while.

| passage | words | sentences | words per sentence | clauses |
|---|---|---|---|---|
| Blackstone, the knees | 100 | 5 | 20.0 | 14 |
| **mine, `embody` rung 2** | 93 | 7 | 13.3 | 11 |
| Blackstone, the chest | 89 | 4 | 22.2 | 12 |
| **mine, `embody` rung 5** | 92 | 5 | 18.4 | 15 |
| Adyashanti, relinquish the doer | 71 | 6 | 11.8 | 14 |
| **mine, `being` rung 1** | 95 | 6 | 15.8 | 11 |
| Adyashanti, the mind's seduction | 72 | 3 | 24.0 | 18 |
| **mine, `being` rung 3** | 90 | 6 | 15.0 | 10 |
| Spero, the momentum of emotions | 57 | 5 | 11.4 | 4 |
| **mine, `bliss` rung 3** | 92 | 5 | 18.4 | 10 |

### 1. Blackstone, the knees ↔ `embody` rung 2
> **Reference:** "And now come into your knees, settling into your knees until they feel soft. Balance your awareness of the space inside both knees, find both those internal areas at the same time. You may need to thin out your mind a little to do that. If you find you're going back and forth knee to knee, see if you can refine your mind, thin, subtle mind, that you can find both at once, and feeling the absolute stillness of the balanced mind."

> **Mine:** "Now come into your knees and settle down into them until they feel soft. Then hold the inside of both at once. Both of those spaces at the same time, with neither one taking turns. If you notice your attention going back and forth, left knee then right knee then left again, that is the ordinary way and it is worth fixing. Thin your attention out. Make it finer, until it is fine enough to be in both places without splitting. Then feel how still everything goes when it is balanced like that."

- **Clause count:** 14 against 11, at 93 words against 100. The same density of instruction per breath.
- **Where the invitation sits:** identical structural position, the fourth move, at the failure mode. His *see if you can refine your mind*, mine *If you notice your attention going back and forth... it is worth fixing*. Neither commands; both describe the wobble first and then offer the correction.
- **How teaching is folded in:** both name the failure as a live experience the listener is probably having RIGHT NOW (going back and forth knee to knee) instead of naming a category. That is the move I take. My version makes the experience more concrete (*left knee then right knee then left again*) because a half-awake listener needs the picture, not the label.
- **Rhythm read aloud:** his long sentence two runs 20 words and mine runs 13, because he can trail a spoken sentence in a room and a recorded clip cannot. So I split his one long correction into three short ones that land in the same total time (*Thin your attention out. Make it finer, until...*). The unhurriedness is preserved by the count of moves, not by sentence length.
- **Shared words:** knees, soft, both, at the same time, thin, still. Technique vocabulary, and unavoidable. Shared PHRASES: none.

### 2. Blackstone, the chest ↔ `embody` rung 5
> **Reference:** "And now inhabit your whole chest, all the way through to the back of yourself so that you're even inhabiting your upper back out to the sides, your whole chest... let yourself settle within your chest so it feels like you're sitting in your heart... Staying that settled, attune to the quality of your love inside your chest. And of course this doesn't need to be a big feeling, just a little of the tenderness that you may find there."

> **Mine:** "Now the whole chest, front to back, out through the ribs to the sides and into the upper back, so you are inhabiting all of it and not only the front. Settle in until it feels like you are sitting inside your own heart. Staying that settled, feel for the tenderness that is in there. It does not need to be a big feeling, and on most days it is a small one. Let the breath move down through it, in and out, and notice that the breath gently wakes it up."

- **Clause count:** 12 against 15, words within three of each other. This is the closest pair in the file and the one to inspect hardest for lifting.
- **Where the invitation sits:** both put it at the same beat, the permission after the ask (*this doesn't need to be a big feeling*), because that is where a listener concludes they are failing. I kept the beat and changed the clothing, then went one further and said what IS likely (*on most days it is a small one*), which his version leaves implied.
- **How teaching is folded in:** his *so that you're even inhabiting your upper back* teaches inside the instruction; mine does the same work with *so you are inhabiting all of it and not only the front*. The same grammatical device, a different sentence.
- **Rhythm read aloud:** near-identical. Four moves, one permission, one breath cue. The breath-through-the-quality cue is his and I took the MOVE; his words are *feel your breath move through the quality of love*, mine are *Let the breath move down through it... and notice that the breath gently wakes it up*.
- **Deliberate divergence:** he names the quality LOVE. I do not, because `heart` owns directed warmth in the de-dup map and naming love here would collide with it. I use tenderness, which is his own secondary word and the one that stays inside the body block's job.

### 3. Adyashanti, relinquish the doer ↔ `being` rung 1
> **Reference:** "Well, the way you do resting as awareness is: you relinquish the doer. Pat it on the head, let it know that it's, what can you say, it's irrelevant. Don't whisper it though; it doesn't like to hear that. And just rest."

> **Mine:** "Find that part now. The one that has been asking how to do this properly since the moment you sat down, the one that wants to know if it is working. It is not an enemy and there is no need to argue with it. Let it know it is not needed for the next few minutes, the way you would tell a helpful person that you have this one covered, and then let your attention go on past it. Then rest. That is the whole instruction, and there is no second half to it."

- **Clause count:** 14 against 11. His sentences are shorter (11.8 words) because he is talking to a room and can pause anywhere; mine average 15.8 and carry the pauses inside the clauses.
- **Where the invitation sits:** he has no invitation at all here, he instructs flatly, and that is one place I deliberately depart. He is teaching a satsang that already trusts him. A phone at 7am has to earn it, so *It is not an enemy and there is no need to argue with it* replaces the authority his room supplies.
- **How teaching is folded in:** his key device is the PHYSICAL GESTURE toward an abstraction (pat it on the head). I take that move and change the gesture entirely, to a social one that a David-aged user will recognise: *the way you would tell a helpful person that you have this one covered*. Same job, no shared image.
- **Rhythm read aloud:** his closer is two words, *And just rest*. Mine is *Then rest. That is the whole instruction, and there is no second half to it* — I keep the abruptness of the short sentence and then hold the listener there, because in a recording the silence after two words reads as a dropout, and the extra clause tells them the silence is intentional.
- **Deliberate divergence:** I name the doer by its behaviour (*the one that has been asking how to do this properly since the moment you sat down*) rather than by his noun. Naming a category at the listener is the v1 defect this whole round exists to fix.

### 4. Adyashanti, the mind's seduction ↔ `being` rung 3
> **Reference:** "Like a seductor or seductress: No, no, no, see, if you really just understood this one last thing, then you would rest so much easier, you really would, I promise... The mind does this often: You did a nice job of resting for five seconds, that was nice, but you see, it could be so much better if you could just understand this, or understand that."

> **Mine:** "Trying has a physical feel to it, a slight forward lean, a small gathering somewhere behind the face. Find yours and let it come back to rest. And expect this next part, because it arrives within seconds for nearly everyone. Your mind will come back with one more thing that has to be worked out first, and it will sound like exactly the thing that would make resting easier. Do not solve it and do not argue with it. Leave the thread hanging where it is, and carry on resting."

- **Clause count:** 18 against 10, and 24 words per sentence against 15. **This is the widest gap in the file, and it is the one place I refused his form.**
- **Why:** his device is VENTRILOQUISM. He performs the mind's voice in quotes for two long sentences, and it works beautifully in a room. In a guided recording it fails twice over: a voice suddenly playing a character is disorienting with the eyes closed, and the content of the performed lines would have to be invented for the listener, which is exactly the writer-clever guided voice David killed in 2026-07-12. So I take the CONTENT of his observation and report it in the guide's own voice.
- **Where the invitation sits:** mine is front-loaded (*Find yours and let it come back to rest*) so the listener has something to do before the prediction arrives; his has none.
- **How teaching is folded in:** *because it arrives within seconds for nearly everyone* is the whole of his seduction passage compressed into one subordinate clause, and the prediction is what makes the listener recognise it when it happens thirty seconds later. That recognition is the teaching, and it survives the compression intact.
- **Rhythm read aloud:** mine is steadier and less theatrical, which is the correct register for the medium. Nothing of his phrasing survives; I do not use seduction, promise, nice job, or five seconds.

### 5. Spero, the momentum of emotions ↔ `bliss` rung 3
> **Reference:** "It's not possible to oppose the momentum of the emotions on their own level. Emotions are strong. But what is not so difficult is to engage your emotional nature toward this bliss that we feel together. First the bliss has to be detected. Once it is detected, you might find a human happiness coming into the equation."

> **Mine:** "If a heavy feeling is here too, leave the heavy one alone. You will not win a fight with it while it is running, and trying is most of what keeps you in it. The good feeling is already arriving by itself, without your help, so put your attention on that one and keep it there, and let the rest of you come along with it in its own time. Nobody is asking you to get rid of the heavy one. You are only choosing which of the two you stay with."

- **Clause count:** 4 against 10. His passage is the shortest and the most abstract of the five; mine is the longest relative to its source, because **every one of his clauses is a model and none of them is an act.**
- **Where the invitation sits:** he has none; his register is declarative metaphysics. Mine is an instruction with an escape hatch built in (*leave the heavy one alone*), which is the only form the same idea can take for one person with their eyes shut.
- **How teaching is folded in:** his mechanism sentence is *It's not possible to oppose the momentum of the emotions on their own level*. Mine is *You will not win a fight with it while it is running, and trying is most of what keeps you in it*. Same claim, no shared noun, and mine adds the consequence he leaves out (the trying is what sustains the state), which is what turns a claim into a reason to stop.
- **Rhythm read aloud:** his is staccato and oracular, five sentences averaging 11 words, with long silences between them in the room. Mine runs at 18 words a sentence because a recording has to carry its own continuity.
- **The vocabulary test, applied.** Killed 2026-09-16d listed the words that proved I had kept his model instead of his act: attach, detect, emotional structure, bliss field, be happy in it. **None appears in this line or anywhere in this file.** The plain sentence of what the listener does, with no theory word in it: *stop working on the heavy feeling, put your attention on the good one, keep it there.* The observable: someone watching would see them stop trying to fix the problem.

---

## FOR THE JUDGES AND FOR DAVID — the open calls
1. **`PK.speechEst` per-line** is a blocker, not a preference. Nothing here ships until `speechOf()` is in.
2. **The stack split** (`MED_EXTRA.reststack`). Recommended, data-only, and it is what makes the de-dup real instead of cosmetic.
3. **The always-play-last rule.** Three lines of engine, and it is the difference between a safety off-ramp that plays and one that mostly does not.
4. **The freq dial compresses** from 11/24/42 to roughly 40/45/52 seconds cue-to-cue in these five blocks. Fine, or re-point the labels in the advanced lanes.
5. **Blackstone's upward energy current and the pelvic gender quality: CUT** as mystical wash. Reversible; the current has a plain one-line version ready if David wants it at `embody` rung 4.
6. **`being` rung 5, dropping the watcher role.** Highest taste risk in the file, fallback line written in its section.
7. **Naming.** Block `being` displays as "Rest", lane `resting` as "Resting", block `embody` as "Embody". If David wants a plain noun to match Body and Sounds, "Inside" is the alternative for `embody`.
8. **`heart` rung 2 puts a hand over the heart** and the Grateful Flow also has a hands-on-heart cue. Different tools, never in one session, and the wording is deliberately different (the beat as the access point, not the posture). Flagged rather than silently resolved.

## GATES
- **Gate 0**, `python3 _dev/copy-density.py --file _design-sync/audio-content-2026-09-09/graph/med-advanced-v2-lines.txt --budget 4200` → **PASS, exit 0.** 49 lines, 4175 words against 4200. Provenance S 46 / B 3, bridge share about 6 percent. Instruction density 100 percent. **Zero echo warnings.** 49 LONG warnings, one per line, every one of them intended: the LONG threshold of 32 words is calibrated to SCREEN copy and PART 7.9 exempts spoken guided copy from it.
- **The budget's derivation**, per PART 7.9 ("its budget is set from the REFERENCE corpus, never from a wish to be terse"): 49 spoken units × 85 words, the mean of Blackstone (85) and the midpoint of the four-teacher band, = 4165, rounded to 4200. It is not a slot count and it was not chosen to be small. For scale, one Blackstone sit is 2155 words and this file is six complete ladders.
- **Gate 1**, `--strip` then `python3 _dev/copy-audit.py --file clean.txt` → **PASS, exit 0.** 49 of 49 clean. **One soft hit in the whole file** (a rule-of-three in `open` rung 7), against a limit of two per line.
- **Neither script was modified.** Every gate conflict this round was resolved by rewriting the line, never by touching the regex. Four caught during drafting and worth logging for the next bench, all in the `vague quantifier` family, which fires on `nothing|everything|anything|something` followed by `has|is|was|will|ever|never|about`: "something has drained out of this", "you know nothing about", "nothing is lost", "If something heavy is here too". Long lines hit this rule far more often than short ones, because the abstract subject has room to reach its verb.
- **House rules self-checked mechanically across all 49 lines:** zero double quotes, zero square brackets, zero "we"/"us"/"our", zero exclamation marks, zero em or en dashes, question marks confined to the two `look` lines that ask them. Paste-ready JS eval-parses clean in node.

KB-SWEEP: `_specs/SCRIPT-ENGINE.md` PART 7 entire, 7.9 verbatim · `_specs/COPY-ANCHORS.md` full, all six 2026-09-16 blocks including KILLED 2026-09-16d and the GUIDED-VOICE REGISTER LAW and the SCOPE AMENDMENT · `meditation-scripts/style1-blackstone-fundamental-consciousness.txt` full RAW · `meditation-scripts/style4-adyashanti-resting-as-awareness.txt` full RAW · `meditation-scripts/style6-spero-impact-of-bliss.txt` full RAW, fetched 2026-09-16 · `_mined/spiritual-canon/TMI-attention-ladder.md` full · `_mined/spiritual-canon/shinzen-datamodel-drills.md` full · `_mined/spiritual-canon/MCTB-insight-ladder.md` full, safety section binding · `graph/med-advanced.md` and `graph/med-advanced-lines.txt` (the rejected v1, ladders kept) · `graph/reality-morning-stack.md` 5/10/15 min bands act by act · `app.js` MED_BLOCKS through MED_SESSIONS, MED_EXTRA/MED_SEC/STACK_CONTENT, medBlockResolve, medSecResolve, composeMeditationSegs, composeStackSegs meditate branch, PK, PK_ELASTIC, pkGap, pauseFor, sessionDepth, the meditation picker and run() · `_dev/copy-density.py` and `_dev/copy-audit.py` read in full BEFORE writing, so lines were shaped to the gates rather than rephrased after them. **Not re-read from RAW this round and named as such:** Harris and Headspace transcripts (styles 2 and 3, the foundation and middle blocks, another seat), heart-coherence.md and hypnosis-ladder.md (used through the v1 sweep's move list, tagged HC and HYP, not re-verified against source).
