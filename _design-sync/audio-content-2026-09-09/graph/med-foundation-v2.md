# MEDITATION BENCH v2: foundation and working blocks, rewritten at reference length

*Round 2. Round 1 was rejected: David read it and said **"meditation copy bad, should be as good as my references."** We measured the gap instead of arguing about it, and the measurement is the whole round.*

| source | mean words per spoken unit |
|---|---|
| Sam Harris | 43 |
| Headspace (Andy) | 60 |
| Judith Blackstone | 85 |
| Adyashanti | 113 |
| **the rejected draft** | **16** |
| **the shipped build in `app.js` today** | **17.5** (80 lines, none at 40+) |
| **this draft** | **55.8** (78 lines, every one inside 40 to 80) |

The last row down from the second is the round. Note the row I added: **the rejected draft was not a regression.** At 16 words it was writing in exactly the register the shipped app has always used. David's complaint lands on the whole meditation bank, not on one bad night's draft, which is why every line below is new.

Law: `_specs/SCRIPT-ENGINE.md` PART 7.9, read in full before anything else. Target 40 to 80 words per spoken line, because the unhurried unfolding **is** the medium. Harris noticing a breath "from the moment it arises, for its full duration, until the moment it subsides" is doing work a compressed version cannot do: the sentence itself gives the listener time to perform the thing.

**KB-SWEEP:** `meditation-scripts/style3-headspace-andy-reset.txt` and `style2-sam-harris-mindfulness.txt` read IN FULL at source (not via brief) and measured programmatically for sentence length, fragment rate and shared n-grams · `_specs/COPY-ANCHORS.md` read in full, every 2026-09-16 block · the GUIDED-VOICE REGISTER LAW and the SCOPE AMENDMENT govern · `_design-sync/audio-content-2026-09-09/KB-SWEEP-meditation.md` (the ladders and their sources) · `graph/med-foundation.md` + `graph/med-foundation-lines.txt` (the rejected draft, ladders kept) · `graph/reality-morning-stack.md` in full for the stack-warden pass · `app.js` `MED_BLOCKS` through `MED_RETURN` read live, plus `composeMeditationSegs`, `PK`, `pauseFor`, `sessionDepth` and the dose picker, because the pool sizes below are computed from them.

**Gates, both exit 0, nothing added to either script:**
```
python3 _dev/copy-density.py --file _design-sync/audio-content-2026-09-09/graph/med-foundation-v2-lines.txt --budget 4680
   lines 78 · words 4349 · budget 4680 · provenance S 77 · B 1 · instruction density 97% · PASS
python3 _dev/copy-density.py --strip ... > /tmp/mf2.txt && python3 _dev/copy-audit.py --file /tmp/mf2.txt
   78/78 PASS
```
**The budget, stated and justified: 4680.** It is not a wish to be terse and it is not the old budget scaled. It is 78 lines multiplied by 60, the Headspace mean, which is the higher of my two primary corpora and therefore the honest ceiling for this register. The line count 78 is not chosen either; it falls out of the pool arithmetic below, which is computed from the engine's own `pauseFor`, `sessionDepth` and block weights. The draft came in at 4349, under budget with room, because four pools sit one line under their ceiling on purpose and one (`close`) sits exactly on it (see each block).

Gate 0 fires a `LONG` warn on all 78 lines. That warn is calibrated to SCREEN copy at 32 words and PART 7.9 explicitly exempts spoken guided copy from it; the FAIL checks it still enforces (untagged, budget, bridge share, inert bridge) all pass. **Zero ECHO warnings** across 78 lines, which for pools this size is the check that matters.

---

## THE THREE DEFECTS THE COMPRESSION CAUSED, and where each is fixed

**1. It COMMANDED where the references INVITE.** Harris's frame is "see if you can". Headspace's is "just for a moment, letting go of". An order lands badly on someone with their eyes closed. Counted, not asserted, and the count is a rough regex so read it as a floor: **32 of 78 lines (41%) open on a condition or an invitation** (`If the thinking is loud` · `See if you can` · `Every so often` · `When something arrives` · `Some days` · `You can` · `There's no need to`), and **43 of 78 (55%) carry an explicit permission clause somewhere in the unit** (`you don't have to` · `there's no need` · `that's normal` · `whenever you like` · `no harm done` · `both of them are the practice` · `is a real reading` · `you're not required to have a view`). I checked whether I could claim all 78 and I cannot: the rest are the body-part and channel passes, which both references also deliver as plain noticing (Headspace: "just feeling the weight of the body pressing down. The weight of the hands and the arms."). The rule that actually holds across all 78 is narrower and it is the one worth keeping: **no line issues a correction without saying what it is correcting for.** That is what a 16-word line structurally cannot do, and it is the biggest single thing the length bought.

**2. It instructed without TEACHING INSIDE the instruction.** Harris: "Notice any sounds in the room. Observe how they arise spontaneously. You don't have to make any effort to hear them." That third sentence is why the first one lands. **35 of 78 lines (45%) carry an explicit causal or explanatory clause**, and 59 of 78 (76%) carry either that or a permission clause. The remaining 19 are, on inspection, mostly sequencing (the arms-then-legs pass) plus a handful my regex simply missed. Two examples of the move, both mine:

> *"Now follow the whole cycle. In, then the small pause at the top, then out, then the wider gap before the next one starts. **The gaps are where attention tends to slip away, because there's so little happening in them, so stay through those as well.** The pause is part of the breath, and it counts as the practice."*

> *"Say both numbers, and lean the weight of your attention on the second one. **The out-breath is where the body lets go a fraction, all by itself, without being asked.** You'll feel that if you stay for the whole length of the exhale. The counting is there to keep you still enough to catch it."*

**3. It reached for teacherly jargon to save words**, naming "dullness" at the listener. No reference ever names a category at you. Every jargon term in the ladders is now described as an experience instead. The four that mattered, with the line that replaced each:

| the jargon the draft used | what the listener hears now |
|---|---|
| *subtle dullness* | "it goes quiet and pleasant and you realise you can't quite find the breath any more. It's soft, the edges have gone, and a minute has passed with not much in it." |
| *the second arrow* | "Anger about being anxious. Frustration about being sad. Impatience with the whole business of sitting here." |
| *the doer* | "the part of you that wants to do this well, the one checking whether it's working yet" |
| *equanimity* | "Wild or settled, you're not required to have a view." |

---

## THE GLOBAL ARITHMETIC, and the one thing that blocks the ship

At about 2.5 spoken words per second a 56-word line is **22.4 seconds** of speech. The old 16-word line was 6.4. A block therefore holds roughly a third as many lines, and every pool below is sized to the surface that burns through it FASTEST, so the deepest rung is still reached there.

Engine facts the sizing is computed from, read live out of `app.js`:
- `composeMeditationSegs` gives each block `totalSec * weight / sumWeights`, lays down the entry, then loops `while (t < bEnd - 1)` adding one pool line per pass at `pauseFor("absorb", depth) + PK.speechEst`.
- `pauseFor("absorb", d) = 4 + d*15`; `pauseFor("cue", d) = 2.5 + d*5`.
- The solo picker offers **2 / 5 / 10 min** and a *remind me* setting that sets depth directly: `often 0.12` (absorb 5.8s), `some 0.5` (11.5s), `spacious 0.9` (17.5s). **10 min at `often` is the fastest burn the app can produce**, so it is the sizing case for every lane block.
- A pool is never looped. When it is spent the block falls back to `MED_RETURN`, by design. So a pool that is one line too SHORT degrades gracefully; a pool that is too LONG silently buries its deepest rung, which is the failure to avoid.

### SHIP BLOCKER: `PK.speechEst` must become per-line before any of this plays

PART 7.9 flagged it and the number is worse than it sounds. `PK.speechEst` is **4.2**, measured against the old short clips, and the composer counts every line at that flat rate:

```
10-min concentration, breath block = 321s
  composer at speechEst 4.2  ->  lays down 32 lines
  real speech at 2.5 wps     ->  those 32 lines need 928s = 2.9x the block
```

The player's `relayoutFrom` re-fit cannot absorb that; `absorb` is elastic but it can only squeeze to zero, and zero still leaves the block at roughly 2.3x. **Fix before wiring:** make the compose-time estimate per-line, `Math.max(4.2, words / 2.5)`, wherever `PK.speechEst` is added to `t` in `composeMeditationSegs` and in the `composeStackSegs` meditation branch. Every number in this document assumes that fix. Without it, the deepest rung of every pool is unreachable and a 10-minute sit runs long enough to be a bug report.

### What the pools have to serve

| surface | per-block seconds | absorb gap | pool lines consumed |
|---|---|---|---|
| solo 10 min `often`, spine block (breath / note) | 321 to 340s | 5.8s | **10 to 11** |
| solo 10 min `often`, settle | 96 to 102s | 5.8s | 3 |
| solo 10 min `often`, count | 107s | 5.8s | 3 |
| solo 10 min `often`, close | 75 to 79s | 5.8s | 2 to 3 |
| v_noting 8 min, `aware` section | 240s | 12.1s | 6 |
| v_bodyscan 8 min, `body` section | 160s | 12.1s | 4 |
| Mind tool 15-band, meditate section | 120s | 11.1s | 3 |
| stack meditate 15-band, section | 70s | 9.3s | 2 |
| **stack meditate 5-band, section** | **30s** | **6.4s** | **0** |

That last row is a real consequence and it needs David's eye: **in the 5-minute morning stack the meditate act is now three entries and nothing else.** 90 seconds across three sections leaves 30s a section, and one entry at ~24 seconds plus its gap fills it. I think that is an improvement over the nine rushed lines it plays today, because each entry is a complete teaching unit rather than a headline. But it is a change he will hear on the surface he uses every morning, so it is named, not assumed. The alternative is raising the meditate share of the 5-band; that is his call, not mine.

---

## `settle`

**The technique ladder**

1. Take the seat. Upright is preferred; lying down or leaning back is equally valid. `BL:L5`
2. The plain sensations of sitting: weight, and the points of contact. `SH:L5` `HS:L13`
3. Hand the weight to the seat instead of working at relaxing. `SH:L5`
4. Take a plain reading of the body's state, heavy or light, still or agitated, changing nothing. `HS:L11`
5. Go to the lowest point of contact first, feet and seat, before anything above it. `BL:L13`
6. For a busy mind, rest the thinking directly on the sensation of breathing. `BL:L11`
7. One held physical anchor (hand on chest or belly) can stand in for the whole sequence. `HC` `HYP:5`
8. Settling arrives faster with repetition; notice it without chasing it. `HYP:1`

**How the ladder maps onto the pool.** Entry carries rung 1. Pool 1 carries 2 and 3. Pool 2 carries 5 then 4. Pool 3 carries 6 and 7. Pool 4 carries 8.

**Pool arithmetic.** Entry 61 words = 24.4s of speech. Pool mean 55.5 words = 22.2s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| solo 10 min, often (the fastest burn) | 96s | 5.8s | 3 |
| solo 10 min, spacious | 96s | 17.5s | 2 |
| solo 2 min, often | 19s | 5.8s | 0 |
| stack meditate 15-band section | 70s | 9.2s | 2 |

**Pool size: 4.** The hungriest surface consumes 3, so one rung (the conditioning line) is reached only by a longer or a custom sit. A fifth line would never be spoken.

**Paste-ready**

```js
    settle: { name: "Settle", ti: "ti-armchair", c: THC("#63e6d6","bg"), entry: "Find a position you can stay in for a while. Sitting upright is good, and so is lying down, and so is leaning back into whatever is behind you, so take the one your body will settle into today. Then whenever you're ready, on one of the out-breaths, let your eyes close and let the room carry on without you.",
      entryStacked: "Your eyes are already closed and the body has already let go, so there's nothing to set up here. Keep everything exactly where it is. Let the attention come back in off the surface of you, to the plain fact of sitting in this chair, breathing, with the rest of the morning still waiting.",
      pool: [
        "Let the seat take your weight. You don't have to hold yourself up, so let the chair or the floor do that part, and notice what it feels like when you hand it over. The pressure underneath you. The places where you touch the ground. Your hands resting wherever they landed.",
        "Start low, at your feet and the parts of you pressing into the seat, and stay down there for a few breaths before you go any higher. Then read the rest of you, plainly. Heavy this morning, or light. Wound up, or already quiet. Whatever comes back is the answer, and none of it needs fixing.",
        "If the thinking is loud right now, you don't have to quiet it down before you start. Let it carry on in the background, and rest your attention on the feeling of breathing underneath it. Or put one hand on your chest, or on your belly, and leave it there. A hand is enough to come back to.",
        "The settling might take one breath today, or it might take twenty. The more often you sit down like this, the sooner your body recognises what's coming and starts doing most of it without you. So give it whatever time it wants this morning, and let the rest of the sit begin from wherever you get to."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** The three shipped lines run 16, 19 and 20 words. Their content: the weight-and-contact move survives as the opening of pool 1 (it was the one genuinely good rung there). `There's nowhere to be right now, and nothing to respond to` stays deleted, because the relax act ends on *nothing to do, nowhere to be* six lines earlier. `Take a few deep breaths. With each out-breath, let the body soften a little more` stays deleted: the breathe act just paced 60 seconds of breath and the relax act just ran the soften sweep.

---

## `breath`

**The technique ladder**

1. Locate where the breath reads clearest; no location is the correct one. `TMI:Stage1` `SH:L7`
2. Do not control or deepen it; hand the rate back to the body. `SH:L9`
3. Cover one whole inhalation with attention, start to finish, without judging it. `SH:L9`
4. Read its shape without correcting it: long or short, deep or shallow. `HS:L15`
5. Track the full cycle: in, the top pause, out, the gap. `TMI:Stage3`
6. Stay present through the pause instead of checking out until the next in-breath. `TMI:Stage3`
7. Check in deliberately rather than waiting to notice a full wander. `TMI:Stage3`
8. Hold a strong thought or feeling alongside the breath without letting it replace it. `TMI:Stage4`
9. Discomfort may become the object itself for a while, as an option. `TMI:Stage4`
10. Notice raw qualities, temperature and texture, not only rhythm. `SH:L17`
11. Diagnose calm-but-foggy and brighten, rather than sinking deeper. `TMI:Stage5`
12. Widen the object to the whole body breathing. `TMI:Stage6`
13. Drop all effort for a few breaths and test whether attention stays. `TMI:Stage7`
14. Let the breath fall to the background of a wider field; let a wave of ease be. `TMI:Stage7-8`

**How the ladder maps onto the pool.** Entry carries rung 1. Then one pool line each for 2, 3, 4, 5+6 folded, 7, 8, 9, 10, 11, 12, 13, 14. Four rungs from the rejected draft's 22 were CUT, and the reason is the same for all four: a 56-word unit can carry two rungs, so the pool holds twelve units, not twenty-two lines. Cut: the pre-sit distraction inventory (reads as homework with the eyes closed), the catch-labelling move (`MED_RETURN` owns the catch and would say it twice in a minute), the background-flicker check (too fine to land in a foundation block), and the longest-unbroken-stretch marker (that is a metric, and naming a metric mid-sit is defect 3 in another costume).

**Pool arithmetic.** Entry 65 words = 26.0s of speech. Pool mean 58.4 words = 23.4s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| solo concentration 10 min, often (the fastest burn) | 321s | 5.8s | 10 |
| solo concentration 10 min, spacious | 321s | 17.5s | 8 |
| solo mindfulness 10 min (brief anchor role) | 79s | 5.8s | 2 |
| Mind tool 15-band section | 120s | 11.1s | 3 |

**Pool size: 12.** The hungriest surface the app can produce, a 10-minute concentration sit at `often`, consumes 10, and two rungs (the effort-drop and the wave of ease) are reached only by a custom or longer sit. That is the right side to err on: the last two rungs describe states most users never reach, so stranding them costs nothing, while a thirteenth line would strand a rung that matters.

**Paste-ready**

```js
    breath: { name: "Breath", ti: "ti-lungs", c: THC("#79ccff","bg"), entry: "Now bring your attention to the breath, and find the place where you feel it most clearly. It might be at the nostrils, cooler coming in, a little warmer going out. It might be the chest, or the belly rising and falling. No one of those is the correct place, so take whichever is easiest to feel this morning and let your attention settle there.",
      pool: [
        "There's no need to control the breath, or to deepen it. Let the body set the pace, and keep your part to noticing. If you catch yourself managing it, making it longer or smoother than it wanted to be, that's worth noticing too. Hand it back, and let the next breath arrive however it arrives.",
        "See if you can stay with one whole in-breath, all the way through, catching it where it first starts, staying with it while it fills, and still being there at the point where it stops and turns around. One breath, followed the whole way. If you lose it partway, let that one go and take the next one from the beginning.",
        "Notice the shape of it, and leave the shape alone. Long or short. Deep, or barely there. It might catch a little in the middle, or run smooth the whole way through. Whatever this breath is doing is the right answer for this minute, so keep reading it and let it stay exactly as it is.",
        "Now follow the whole cycle. In, then the small pause at the top, then out, then the wider gap before the next one starts. The gaps are where attention tends to slip away, because there's so little happening in them, so stay through those as well. The pause is part of the breath, and it counts as the practice.",
        "Every so often, check in on purpose, without waiting to be caught out. Ask where your attention is sitting, right now, this second. If it's on the breath, good, stay there. If it wandered off somewhere, note where it went and come back. Checking like this catches the drift much earlier than waiting to notice does.",
        "When something arrives that's stronger than the breath, a worry, a plan, an ache in one shoulder, you don't have to clear it away before you can carry on. Let it sit there and keep part of your attention on the breathing at the same time. Two things at once is fine here. The breath stays the one you return to.",
        "If something in the body is pulling harder than the breath, let it have the attention for a while. Go to the ache itself and feel what it's made of. Where its edges are. Whether it's hot or dull or sharp, and whether it stays the same size while you watch. Then, when it loosens its grip, come back.",
        "Drop underneath the idea of breathing and feel the raw material of it. Air moving over one small patch of skin. The stretch across the ribs. A slight drag at the back of the throat. Stay down at that level, where it's sensation changing second by second, and let the word breath go.",
        "Sometimes it goes quiet and pleasant and you realise you can't quite find the breath any more. It's soft, the edges have gone, and a minute has passed with not much in it. That's the mind dimming down towards sleep. Sit up a little taller, open your eyes for a second if you need to, and pick the breath up brighter than before.",
        "Now widen out from the one spot you chose. Let the attention spread until you can feel the breathing happening all through you at the same time. The ribs, the back, the belly, the shoulders lifting a little. It's one movement in a whole body, and you can hold the whole of it at once.",
        "See what happens if you stop trying for a few breaths. Let go of the holding on, the checking, the small effort you've been making to stay here, and find out whether the attention stays with the breath by itself. If it drifts, pick the effort back up, no harm done. If it stays, leave it alone and let it stay.",
        "By now the breath may have moved into the background on its own, with the room and the body around it, all of it here at the same time. Let it sit back there. If a wave of ease comes through, or the body twitches once and settles, let that happen. There's no need to chase it or to hold on."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim; the shipped pool runs 16 to 22 words a line.** Content carried forward: *no need to control it or deepen it* opens pool 1 · *where the breath is clearest* is folded into the entry · *long or short, deep or shallow* survives in pool 3 · *from the start of the in-breath, through the pause* survives in pool 4 · *the cooler air coming in* moved into the entry so pool 8 could go deeper into raw sensation. Deleted for good: *When you notice your mind has wandered, that's the practice* (MED_RETURN owns the wander reframe and weaves into every block) and the two spare permission lines, which were the third and fourth permission beats in one pool.

---

## `count`

**The technique ladder**

1. One on the rise, two on the fall; a fixed two-count loop, never climbing. `HS:L17`
2. Restart at one after every exhale; the number never matters. `HS:L17`
3. Lost count means restart at one, with no backtracking. `HS:L17`
4. Creeping upward is corrected by resetting the loop, not by trying harder. `gen`
5. Both numbers are counted, but attention rests heaviest on the out-breath. `HS:L15,L17`
6. A racing mind holds a structured external task more easily than bare watching. `TMI:Stage2`
7. The felt give after each exhale is the actual target; the count is scaffolding. `HS:L17,L19`
8. Let the numbers grow quieter, felt more than said, while the structure stays. `SHIN:4`
9. Drop the count for a stretch and test whether the steadiness holds. `gen` + `TMI:Stage7`
10. Notice needing the count less at the start than in earlier sits. `HYP:1`

**How the ladder maps onto the pool.** Entry carries 1 and 2. Pool 1 carries 3 and 4. Pool 2 carries 5 and 7. Pool 3 carries 6 and 8. Pool 4 carries 9 and 10. Nothing was cut; the ten rungs fit in five units.

**Pool arithmetic.** Entry 53 words = 21.2s of speech. Pool mean 58.8 words = 23.5s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| solo concentration 10 min, often (the fastest burn) | 107s | 5.8s | 3 |
| solo concentration 10 min, spacious | 107s | 17.5s | 2 |
| solo concentration 5 min, often | 54s | 5.8s | 1 |

**Pool size: 4.** The hungriest surface consumes 3, so one rung (dropping the count) is reached only by a longer sit. A fifth line would never be spoken.

**Paste-ready**

```js
    count: { name: "Count", ti: "ti-list-numbers", c: THC("#a08fff","bg"), entry: "If the mind keeps sliding off, you can give it something to hold on to. Count one as the breath comes in, and two as it goes out. Then start again at one. The count never climbs past two, so there's no total to keep track of and no place to get to.",
      pool: [
        "If you lose the count, that's normal, and it isn't a setback. Begin again at one on the next in-breath, without going back to work out where you'd got to. And if you look down and find yourself at six or seven, the loop has run off on its own. Bring it back to one and keep it small.",
        "Say both numbers, and lean the weight of your attention on the second one. The out-breath is where the body lets go a fraction, all by itself, without being asked. You'll feel that if you stay for the whole length of the exhale. The counting is there to keep you still enough to catch it.",
        "If the mind is running fast this morning, this is the one to use. A mind that won't sit still will often hold on to a small job, and the count is a small job. Give it the numbers to carry. Then, once it's carrying them, let them get quieter. Said under your breath. Then barely said at all.",
        "When the count starts to feel like extra work, you've finished with it. Let the numbers go and stay with the breath on its own, keeping the same weight on the out-breath. If the mind runs off inside a minute, pick the count back up. It's there whenever you want it, and using it is never a step backwards."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** All three shipped lines (13 to 15 words) survive as content: the two-count loop in the entry, *if you lose count, that's perfectly normal* in pool 1, *give the out-breath your full attention* in pool 2. Each is now the first clause of a unit that also teaches why.

---

## `note`

**The technique ladder**

1. One soft label the instant something is noticed, never a description. `SHIN:1 Meter2`
2. Start on sound, the easiest channel to catch. `SHIN:2`
3. Then a body sensation; wait for one to come forward instead of hunting. `SHIN:2`
4. Then thought; catch it at the moment it begins. `SH:L17`
5. Let attention float and take whichever channel is loudest. `SHIN:2`
6. Hunt the moment something vanishes, not only arrivals. `SHIN:3`
7. Note rest: a quiet gap, a relaxed patch. `SHIN:2`
8. Note flow: pulsing, spreading, fading, as objects in their own right. `SHIN:2`
9. Split a mixed feeling into picture, inner talk, raw sensation, noted one at a time. `SHIN:2`
10. Turn towards or turn away from discomfort; both build the same skill. `SHIN:2`
11. Flooded means re-note the SAME thing slowly to bring the pace down. `SHIN:4`
12. Labels shrink to a bare touch, each note a brief full taste. `SHIN:1 Meter1`
13. Hold sound, sensation and thought in one field without choosing. `SHIN:2`

**How the ladder maps onto the pool.** Entry carries rung 1. Then one line each for 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13. Every rung survives. The rejected draft's zoom-in-and-out and compound-note rungs were dropped for room, and its second-arrow rung moved to `feel` pool 3, where a listener can actually use it.

**Pool arithmetic.** Entry 62 words = 24.8s of speech. Pool mean 56.8 words = 22.7s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| solo mindfulness 10 min, often (the fastest burn) | 340s | 5.8s | 11 |
| solo mindfulness 10 min, spacious | 340s | 17.5s | 8 |
| solo mindfulness 5 min, often | 170s | 5.8s | 5 |

**Pool size: 12.** The hungriest surface consumes 11, so exactly one rung is held in reserve. A thirteenth line here would never be spoken by any dose the app offers, which is why four of the rejected draft's sixteen rungs had to be folded or moved rather than added.

**Paste-ready**

```js
    note: { name: "Note", ti: "ti-focus-2", c: THC("#5ed0b0","bg"), entry: "Now let your attention open out, wider than the breath. Anything can have it. A sound from outside, a feeling in your hands, a thought going past. As each one shows up, notice it, put a soft name on it if a name comes, and let it carry on without you. You're keeping track of what happens, and changing none of it.",
      pool: [
        "Start with sound, because it's the easiest one to catch. Whatever you can hear, near or far, let it land on you without going out to meet it. The moment you register one, put one soft word on it. Hearing. That's the whole label. Then let your attention go wherever it goes next.",
        "Now let something in the body have it. The warmth in your hands, the press of the seat, a bit of tightness across the back. You don't have to go searching for one, so wait a moment, and one of them will come forward on its own. When it does, note it. Feeling. Then let the attention move on again.",
        "Thoughts come through the same way. A few words, a picture, somebody's voice, a plan for later. Note it. Thinking. And let it carry on without you following it anywhere. See if you can catch the next one right at the start, in the second where it's arriving and hasn't gone anywhere yet.",
        "Now stop choosing a channel. Let the attention float and take whatever is loudest at that moment, a sound, a sensation, a thought, whichever one is pulling hardest. Note the loud one, let it go, and see what's loudest next. You're following what's already happening, and the order gets decided for you.",
        "Most of the noticing goes to things arriving, so turn it round for a while and hunt for endings. A sound stopping. A thought dropping out mid-sentence. A tightness that was there a moment ago and has gone. Note the ending itself. Gone. Endings are harder to catch than arrivals, and catching them steadies the noting more than anything else does.",
        "Notice the gaps as well as the things. A pause in the room where no sound is happening. A patch of the body with almost nothing going on in it. The space between two thoughts. Those count, and they get noted the same way. Rest. They're easy to miss when you're waiting for something louder.",
        "Some of what you meet won't hold still long enough to name. A pulsing. Something spreading out. A sensation fading while you're looking straight at it. Movement is a thing in its own right, so note it as one. Changing. You don't have to pin anything down to notice it properly.",
        "If something big turns up and fills the whole field, take it apart. There's a picture in it, or a face. There's talk going on in your head about it. And there's a raw physical part of it, somewhere in the chest or the stomach. Note those one at a time. The size comes down as you separate them.",
        "When you meet something uncomfortable, you have two ways to go and both of them are the practice. You can turn towards it and note it as it is. Or you can turn away, to a sound, to the breath, to the feeling of your hands. Choose whichever you can hold today. Turning away is a full move and it counts.",
        "If it starts coming faster than you can name it, slow it all down by noting the same thing over. Take one sound, one sensation, whatever is in front of you, and note it three or four times at half speed. The pace of the noting sets the pace of the mind, and it will come down with you.",
        "The labels can get lighter now. You don't have to say a full word each time. A touch is enough, the smallest flick of recognition, and the noticing carries on underneath it. Let each one be a quick taste of what's there, and then let the attention go. There's no need to hold on to any of it.",
        "Now let the naming go and hold the whole of it at once. Sounds outside, the body sitting here, thoughts moving through, all of it happening in the same open space, without you sorting through any of it. You've spent the sit taking things one at a time. This is what it's like with the sorting switched off."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim; this was the strongest shipped pool and it still averages 19 words.** The sound / body / thought arc is preserved exactly, one unit each, with the soft-label convention (*Hearing. Feeling. Thinking.*) kept because it is the technique. `we'll just notice it` loses its `we'll` per the one-listener rule.

---

## `scan` (Body)

**The technique ladder**

1. Fixed order, head to toe, a few breaths at each region. `HS:L13`
2. Notice what is there with no goal of finding or fixing. `HS:L11,L13`
3. Nothing felt means neutral; move on rather than searching harder. `SHIN:2` `HS:L15`
4. Discomfort is noted and passed, not massaged away. `APP:existing`
5. Read temperature and weight, not tension alone. `HS:L11`
6. Let the pace follow the tension: fast where easy, slow where held. `gen`
7. Tense-then-release where a region is genuinely held. `HYP:2`
8. Once single regions are easy, hold paired regions at once. `BL:L19`
9. Where focus flips between two symmetric points, thin it until both are held. `BL:L19`
10. Feel the breath moving through the region being scanned. `BL:L23,L29`
11. Feel each region as owned, from the inside, not inspected from outside. `BL:L21,L35`
12. After the sequential pass, hold every region simultaneously. `BL:L45`
13. Let the regions dissolve into one undivided field of sensation. `BL:L45,L49`

**How the ladder maps onto the pool.** Entry carries 1 and 2. Pool 1 carries 3. Pool 2 carries 4. Pool 3 carries 5. Pool 4 carries 6 and 7. Pool 5 carries 8 and 9. Pool 6 carries 10 and 11. Pool 7 carries 12 and 13. Every rung survives.

**Pool arithmetic.** Entry 61 words = 24.4s of speech. Pool mean 55.7 words = 22.3s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| v_bodyscan 8 min, its `body` section | 160s | 12.1s | 4 |
| editor default `body` section | 120s | 11.1s | 3 |
| a user-set 5 min `body` section | 300s | 11.5s | 8 |

**Pool size: 7.** Every real route consumes 3 or 4. A user-set 5-minute body section would consume 8, one more than the pool holds, and that case degrades gracefully: the section falls back to `MED_RETURN` for its last cue rather than repeating a teaching line. Padding to 8 for one hand-built track is exactly the kind of line that never earns its place.

**Paste-ready**

```js
    scan: { name: "Body", ti: "ti-scan", c: THC("#ff9a3d","bg"), entry: "Now take your attention down through the body, starting at the top of your head, at the crown. You're moving through it slowly, a breath or two in each place, and all you're doing is reading what's there. Warm or cool. Tight or easy. Buzzing, or not much at all. You're taking a reading, and leaving everything exactly where it is.",
      pool: [
        "Start across the scalp and the face, and take it slowly. The temples. The small muscles around the eyes. The tongue, resting wherever it rests. The back of the neck where it meets the skull. If a place gives you nothing at all, that's a real reading, so move on. Blank is a common answer here.",
        "Down through the throat, the chest, the stomach. Notice what's moving in there and what's holding on. If you find a tight place, leave it tight. Your job here is finding out what's true, and a tight place that gets noticed will often loosen later, on its own, without being told to.",
        "Out along both arms now, to the elbows, the wrists, all the way into the fingers. Then down through the hips and the legs, into the feet. Read weight and temperature as you go, as well as tension. A hand can be heavy before it's tight, and a foot can be cold before it's anything else.",
        "Let the pace follow what you find. Go quickly where a place is already easy, and slow right down where a place is holding on. Where a part is properly gripped, you can tighten it deliberately for a few seconds, harder than it already is, and then let it drop. The release afterwards is bigger than anything you'd get by asking.",
        "Once single places are easy, take two at once. Both hands together. Then both feet. Then both shoulders, held in the same attention at the same moment. You'll notice it wanting to flick between the two. Let it widen instead of flicking, until it's wide enough to hold both without choosing either.",
        "Now feel the breath moving through wherever you are. It reaches further into the body than it seems to, and a part that's being breathed through eases differently. Feel that part from the inside while you're there. Your own hand, known from within, the way you know it in the dark without looking.",
        "Now hold the whole body at the same time, instead of one place after another. Everything you've just been through, present together, sitting here and breathing. Stay with that for a while and the lines between the parts get less definite. There's less of a hand and a leg and a back, and more of one continuous field of sensation."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** `Forehead, jaw, shoulders. Notice each part as you pass, and let it soften` stays deleted: it is the relax act verbatim in substance. The block stays re-pitched from SOFTENING to NOTICING, which is the division of labour the stack needs, and pool 1 now leads on parts relax never names (temples, tongue, the back of the neck) so the two acts do not sound like each other.

---

## `listen` (Sounds)

**The technique ladder**

1. Let sound arrive; do not search the room for it. `SH:L21`
2. Near and far, ranked the same. `SH:L5`
3. No effort is required to hear; the sounds appear on their own. `SH:L21`
4. Do not resist an unwanted sound; it is part of the field. `HS:L9`
5. Silence is a valid object, not an absence of practice. `SHIN:2`
6. Notice edges: the moment a sound starts, changes, stops. `SHIN:3`
7. Meet a startling sound with the same steadiness as a quiet one. `SHIN:1 Meter3`
8. Sounds and silence as one continuous field. `SHIN:2`
9. Rest as the awareness the sounds are appearing in. `SH:L21` `ADY:L6-L10`

**How the ladder maps onto the pool.** Entry carries 1 and 2. Pool 1 carries 3. Pool 2 carries 4. Pool 3 carries 5 and 6. Pool 4 carries 7. Pool 5 carries 8 and 9. Every rung survives.

**Pool arithmetic.** Entry 57 words = 22.8s of speech. Pool mean 54.0 words = 21.6s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| v_noting 8 min, its `aware` section | 240s | 12.1s | 7 |
| a user-set 5 min `aware` section | 300s | 11.5s | 8 |
| editor default `aware` section | 120s | 11.1s | 3 |

**Pool size: 5, and it shares a pool.** `MED_SEC.aware` is `watch` entry plus `watch` pool plus `listen` pool, one 10-line ladder the engine walks in order, so `listen` only begins after `watch` is spent. The table is computed against the merged 10, which is why the numbers here and under `watch` are identical.

**Paste-ready**

```js
    listen: { name: "Sounds", ti: "ti-ear", c: THC("#ff85be","bg"), entry: "Now open your attention out to sound. Whatever's in the room with you, and whatever's further off, the traffic, a door somewhere, the hum of something electrical. Near and far both count, and neither one matters more than the other. Let them come to you, and there's no need to go out looking for any of them.",
      pool: [
        "Notice that you're doing nothing to make this happen. You didn't reach for the last sound, and you won't reach for the next one. Hearing goes on by itself whether you take part or not, and this is the one place in the sit where that's obvious. Let the sounds arrive, and stay out of the way.",
        "Some sound will turn up that you'd rather wasn't there. A car alarm, a voice through a wall, somebody moving about upstairs. See if you can let it be part of the same field as the rest. Pushing it away takes more effort than hearing it does, and the pushing is louder than the sound.",
        "Listen to the quiet as well. The gap between two sounds is something to hear in its own right, and there's more of it than you'd expect once you start listening for it. And catch the edges. The exact moment a sound starts. The moment it stops. Those two points are sharper than the middle.",
        "If something loud goes off, a bang, a horn, something dropped in another room, the body jumps before you've decided anything. Let the jump happen, and watch it settle back down. Then take the sound the same way you took the quiet ones. There's nothing to put right, and the sit carries on from here.",
        "Stop separating them now. Sound and quiet, one thing, going on around you and through you, appearing somewhere and passing. You don't have to hold any of it. See if you can sit as the space the sounds are turning up in, and let them keep turning up."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** All three shipped lines survive as content and each is now a unit that teaches: *you don't have to go looking for them* became the no-effort teaching in pool 1, *no need to name them or judge them* folded into the entry, *sounds appear, change, and pass away* folded into pool 3's edges.

---

## `watch` (Awareness)

**The technique ladder**

1. Notice a thought is present, an image or a bit of language, without following it. `SH:L17`
2. Watch what happens to it: fade, swap, dissolve. `SH:L17`
3. It does not matter how long attention was lost; notice now. `SH:L17`
4. Notice a thought arrived on its own, unbuilt and unchosen, and is already gone. `SPC:MLS`
5. Where a thought carries charge, notice the charge in the body too. `SH:L19`
6. A repeating thought is allowed to repeat; watch each arrival. `SHIN:4`
7. Name the mind's one-more-thing-to-solve move and leave the thread unresolved. `ADY:L16`
8. Notice the part wanting to get this right, without obeying it. `ADY:L8,L10`

**How the ladder maps onto the pool.** Entry carries rung 1. Pool 1 carries 2. Pool 2 carries 3. Pool 3 carries 4. Pool 4 carries 5 and 6. Pool 5 carries 7 and 8. Every rung survives.

**Pool arithmetic.** Entry 54 words = 21.6s of speech. Pool mean 58.8 words = 23.5s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| v_noting 8 min, its `aware` section | 240s | 12.1s | 7 |
| a user-set 5 min `aware` section | 300s | 11.5s | 8 |
| editor default `aware` section | 120s | 11.1s | 3 |

**Pool size: 5, merged with `listen` into 10.** See the note under `listen`: `MED_SEC.aware` concatenates them, so the hungriest route (an 8-minute noting sit) reaches 7 of the 10 and the last three are for a longer custom section. `watch` alone, which is what the 5 lines here are, is fully consumed by any noting sit over about four minutes.

**Paste-ready**

```js
    watch: { name: "Awareness", ti: "ti-eye", c: THC("#c9a6ff","bg"), entry: "Thoughts are going to keep coming, and that was never the problem. This time, instead of going along with them, see if you can watch one arrive. Stay where you are and let the next thought come to you. You're looking at the thought itself now, the same way you've been taking the sounds.",
      pool: [
        "When one shows up, see what it's made of, whether it's words going past in your own voice, or a picture, or somebody's face arriving for no reason. Then watch what happens to it without stepping in. It might fade out on its own, or get swapped for a different one halfway through, or stop mid-sentence and leave nothing behind it.",
        "At some point you'll surface and find you've been inside one of them for a while, following it, believing it, adding to it. It makes no difference how long that was. Ten seconds or two minutes, the useful part is the noticing, and you get that the instant it happens. Come back, and wait for the next one.",
        "Look at the one that just went past. You didn't decide to have it. You didn't pick the words or build the picture. It turned up finished, and it was already leaving by the time you noticed it. Watch the next one the same way and see whether it works any differently.",
        "If a thought has some heat on it, follow it down into the body. There'll be something in the chest, or the stomach, or the throat that came with it. Watch that as well. And if the same thought keeps returning, let it return. You can watch the same arrival twenty times over, and the twentieth one is as good as the first.",
        "The mind will offer you one more thing that needs working out first, and it'll feel urgent and reasonable. Leave that one unfinished. And notice the part of you that wants to do this well, the one checking whether it's working yet. That's another thought. You can watch it too, and you don't have to do what it says."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** All three shipped lines survive as content. `And notice the quiet space after one thought ends` was cut from this block because it is `note` pool 6 (note rest) doing the same work, and the two blocks play in the same sit.

---

## `feel` (Feeling)

**The technique ladder**

1. Locate where the feeling registers in the body, not the story about it. `SHIN:2`
2. Feel it as pressure, heat, tightness, not a verdict on the day. `APP:existing`
3. One plain word if it helps, rather than describing the situation. `SHIN:1 Meter2`
4. No feeling present is a legitimate finding, not a gap to fill. `SHIN:2`
5. Track how it shifts while it is watched. `SHIN:2`
6. Check for the second layer stacked on the first, and release that first. `SHIN:3`
7. Split an overwhelming feeling into picture, inner talk, raw sensation. `SHIN:2`
8. Stay with it or turn away to an anchor; neither is more correct, and stopping is allowed. `SHIN:2` + `E2`
9. Soften around the sensation on the exhale instead of bracing. `HC:Release`
10. A positive feeling may be deliberately grown and spread. `HC:Installation`

**How the ladder maps onto the pool.** Entry carries rung 1. Pool 1 carries 2 and 3. Pool 2 carries 4 and 5. Pool 3 carries 6. Pool 4 carries 7 and 8. Pool 5 carries 9 and 10. Every rung survives. The rejected draft's care-versus-overcare rung was cut: it needs a whole unit to set up and the pool holds five.

**Pool arithmetic.** Entry 58 words = 23.2s of speech. Pool mean 58.0 words = 23.2s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| a 3 min section at `some` | 180s | 11.5s | 5 |
| a 5 min section at `some` | 300s | 11.5s | 8 |

**Pool size: 5.** A 3-minute section consumes exactly 5. It is also the block with no route today (see the wiring notes), so 5 is sized to the shortest plausible home rather than to a surface that exists. If it lands somewhere longer, it wants two more rungs, and the two I cut for room are named above.

**Paste-ready**

```js
    feel: { name: "Feeling", ti: "ti-heart", c: THC("#ff9a6e","bg"), entry: "If there's a feeling around this morning, let it stay. Look for where it sits in the body, underneath whatever story is attached to it. It'll have a place. The chest, the throat, the stomach, sometimes the whole of the back. Go to that place and stay there a while, and let the story carry on without you.",
      pool: [
        "Feel it the way you'd feel anything else. Pressure. Heat. A tightening, or a hollow. Those are the parts that are here. If one plain word helps you hold it, use one, sad or tense or wired, then put the word down and go back to the sensation. The word is there to find the thing, and you can drop it once you have.",
        "If there's nothing much here, that's a finding, and there's nothing to dig up. Sit with the ordinary version of yourself for a minute. And if there is something, watch what it does while you look at it. Almost nothing stays the same size under attention. It'll move, or spread out, or thin, or come back stronger.",
        "Check whether there's a second thing sitting on top of the first. Anger about being anxious. Frustration about being sad. Impatience with the whole business of sitting here. The top layer is usually louder than the one underneath it, and it's the one to let go of first. Then see what's left.",
        "If it's bigger than you can hold, take it apart. The picture. The talk in your head. The raw sensation with no words on it. And if that's still too much, you can go to the breath, or to your hands, or to the sounds outside, and that's a complete move. You can also stop, any time you want.",
        "Try letting the body open a little around it on the out-breath, instead of bracing against it. The same feeling, with more room around it. And if what's here is good, warmth, or ease, or something settled, you can stay with that on purpose and let it spread. Good states are as worth practising as hard ones."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** The shipped block has only two lines. `You don't need to name it or push it away` is gone, and deliberately: it FORBIDS naming while the ladder's rung 3 asks for one plain word, and a listener cannot obey both. The new pool 1 asks for the word and then asks you to put it down, which is what the source actually teaches.

---

## `close`

**The technique ladder**

1. Let go of any remaining technique. `HS:L21`
2. Hold the measured pace through the close so the ending is not rushed. `SPC:MLS`
3. Name explicitly that the sit is ending rather than trailing off. `gen`
4. Back to the body: weight, contact, hands and feet. `HS:L23`
5. A physical anchor stays a few seconds into the return. `HC:Return`
6. Back to the room and its sounds, re-including the environment. `HS:L23`
7. An eyes-open bridge moment before the end, never an abrupt cut. `HC:Return`
8. Eyes open in the user's own time, never on a fixed count. `HS:L23` `BL:L49`
9. Brief and undramatic; trust the state to carry itself out. `gen`

**How the ladder maps onto the pool.** Entry carries 1, 2 and 3. Pool 1 carries 4 and 5. Pool 2 carries 6 and 7. Pool 3 carries 8 and 9. Every rung survives.

**Pool arithmetic.** Entry 58 words = 23.2s of speech. Pool mean 47.3 words = 18.9s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| solo 10 min, often (the fastest burn) | 75s | 5.8s | 2 |
| solo 10 min, spacious | 75s | 17.5s | 2 |
| solo 5 min, often | 38s | 5.8s | 1 |

**Pool size: 3.** The hungriest surface consumes 3. Nothing is stranded and nothing is spare, which is correct for a block whose last line the engine force-plays as the closer.

**Paste-ready**

```js
    close: { name: "Close", ti: "ti-moon", c: THC("#a08fff","bg"), entry: "That's the practice done. Let all of it go now, including the watching, and start coming back the slow way. There's no rush in this part, and hurrying the end of a sit undoes a good share of it. Take the next couple of breaths at whatever pace they want, and let the room start coming back in.",
      pool: [
        "Bring your attention back to the body, and to the plain facts of it. The weight of you on the seat. Your hands wherever they ended up. Your feet on the floor. If a hand has been resting somewhere, leave it there a few seconds longer while everything else comes back.",
        "Let the room come back too. The sounds in it. The light coming through your eyelids. The temperature of the air on your face. You've been somewhere fairly quiet, so let the edges of the room arrive first, before you open anything.",
        "And in your own time, whenever you're ready, let your eyes open. Take a moment before you move. Look at one ordinary thing in front of you the way you've been listening this whole time, and then carry on with the morning, taking some of this quiet with you."
      ] },
```

**Kept from the shipped build.** **Nothing kept verbatim.** Both shipped lines survive as content: the body-and-contact return in pool 1, *in your own time, gently open your eyes* opening pool 3. Pool 3 must stay LAST in the array: `composeMeditationSegs` always appends the final pool line of the final block as the closer.

---

## `free`

**The technique ladder**

1. Announce the release explicitly: even the breath is let go of now. `HS:L21`
2. Full permission: the mind goes wherever it wants, with nothing to return to. `HS:L21`
3. The one interval in the sit with no wrong way to spend it. `HS:L21`
4. A plan or a worry is allowed to run; the noting habit is suspended on purpose. `HS:L21`
5. Ask the mind for nothing: not stillness, not insight, not relaxation. `HS:L21`
6. Wild or settled, whichever happens needs no response. `TMI:Stage7`
7. If no-instruction produces anxiety, shorten it or return to a light object. `gen`
8. The hinge before the return; no clock is watched inside the interval. `HS:L21-L23`

**How the ladder maps onto the pool.** Entry carries 1, 2 and 3. Pool 1 carries 4. Pool 2 carries 5. Pool 3 carries 6. Pool 4 carries 7 and 8. Every rung survives.

**Pool arithmetic.** Entry 52 words = 20.8s of speech. Pool mean 52.0 words = 20.8s. Per pool line the block spends `absorb gap + speech`.

| surface | block seconds | absorb gap | pool lines it consumes |
|---|---|---|---|
| a 90s release valve at `some` | 90s | 11.5s | 2 |
| a 2 min release valve | 120s | 11.5s | 3 |

**Pool size: 4, set by design rather than by arithmetic.** Ladder rung 6 of the rejected draft is the constraint: this is a bounded release valve, never a new open-ended technique. A 90-second interval reaches 2 of the 4 and a 2-minute one reaches 3, which is the shape intended. Making it bigger would turn a pause in the sit into another block.

**Paste-ready**

```js
    free: { name: "Free", ti: "ti-feather", c: THC("#b98cff","bg"), entry: "Now let go of the breath as well. For the next little while there's no instruction at all. Let the mind go wherever it wants to go, and don't call it back. Nothing to watch, nothing to name, nothing to come back to. This part has no wrong way to do it.",
      pool: [
        "If it starts planning, let it plan. If it goes back over an argument, let it go back over the argument. You've spent the sit holding it to one thing, and this is the opposite of that, on purpose. Leave it completely alone and see what it does when nobody is watching it.",
        "Don't ask it for anything while you're here. No stillness. No insight. Nothing useful. Asking is the thing you're taking a break from, and the asking is most of the work. Let it be as busy or as quiet as it happens to be, and take no position on which one is better.",
        "If it goes quiet on its own, that's fine, and it's nothing you did. If it stays loud right through to the end of this, that's fine too. Wild or settled, you're not required to have a view. Sit here with it however it is for another minute.",
        "If having nothing to hold starts to feel uncomfortable, go back to the breath whenever you like. Some days there's no appetite for open ground, and the breath is always there. Otherwise stay out here a little longer. In a moment you'll come back to the body, and there's no hurry about that either."
      ] },
```

**Kept from the shipped build.** **New block, nothing shipped.** It is Headspace's brief ruleless interval before the return, and it is mechanically distinct from `open`: `open` still holds an orientation (rest as the space things arise in), `free` holds none at all.

---

## `MED_RETURN`: six mechanisms, at re-anchor length

The engine weaves these through every block and plays them whenever a pool is spent, so four phrasings of one mechanism read as one line repeated. Six, each a different move. They sit at the BOTTOM of the reference band (mean 46.8 words) on purpose: Harris's own re-anchor runs 39 words, because a cue that interrupts a silence should be shorter than the teaching that opened it.

1. Noticing is the win, and every mind does this. `TMI:Stage2` `SH:L17`
2. Distance and duration are not the point; begin again. `HS:L17`
3. Do not shove the thought away to get back. `SH:L17`
4. Drop the self-irritation FIRST, then return. `TMI`
5. Return to raw sensation, or to a contact point when the breath cannot be found. `SH:L11,L17`
6. Fog is not thought: open the eyes a second, one deliberate breath, start fresh. `TMI:Stage5` `HYP:3`

**Paste-ready**

```js
  var MED_RETURN = [
    "Sooner or later the mind goes off somewhere without telling you. Every mind does that, including the practised ones. The moment you notice you've gone is the moment the practice is working, so take the noticing, and come back to the breath from wherever you are.",
    "It makes no difference how far the thought carried you, or how long you were gone in it. The distance is not the point. Notice where you are now, and pick the breath up again on the next in-breath.",
    "There's no need to shove the thought out of the way to get back. Leave it where it is, let it finish on its own, and put your attention on the breathing while it does. It'll go when it's ready, and you don't have to be the one who ends it.",
    "If there's a bit of irritation with yourself for drifting off again, drop that part first, before you do anything else. The irritation costs you more than the drifting ever did, and it's the thing that turns one wander into five. Come back, and make nothing of it.",
    "Come back to the physical part of it. The movement somewhere in the middle of you, the warmth, the slight pressure. If you can't find the breath at all right now, come back to whatever you're sitting on instead. Contact is easier to find than breath when the mind is scattered.",
    "If you drifted into fog instead of into thinking, and it's gone soft and blurry in there, open your eyes for a second and close them again. Then take one deliberate breath, deeper than the ones around it, and start the next stretch from there."
  ];
```

**Kept from the shipped build.** Nothing verbatim; the four shipped cues run 15 to 20 words. All four survive as content, and the fourth (*Each time you notice and come back, that's the practice working*) is retired as a duplicate: it was mechanism 1 in other words, which is the exact failure this widening exists to prevent.

---

## The stack-aware `settle` entry

The shipped entry assumes a cold start: *Find a comfortable position, and when you're ready, gently close your eyes.* Inside a stack the eyes are already closed and the relax act has already run the whole soften sweep, so that line asks for work already done. One extra field on the `settle` block, used when a previous act in the same session already settled the body (relax, breathe or stretch immediately before):

```js
      entryStacked: "Your eyes are already closed and the body has already let go, so there's nothing to set up here. Keep everything exactly where it is. Let the attention come back in off the surface of you, to the plain fact of sitting in this chair, breathing, with the rest of the morning still waiting.",
```

It is the one `B|` line in the file (54 words, 1% of the total, against Gate 0's 25% bridge cap) and it carries three action verbs, so it clears the inert-bridge check. It teaches the one thing a bridge is allowed to teach: why nothing is being asked for.

---
## THE RESEMBLANCE DIFF

Five of my finished lines beside five verbatim passages from the reference corpora, compared feature by feature. The gates only catch bans; this is the check for whether the thing actually sounds like the references, which is the complaint that opened the round.

Measured first, because the argument should not be vibes:

| | sentences | words | mean words per sentence |
|---|---|---|---|
| Harris, whole script | 29 | 516 | **17.8** |
| Headspace, whole script | 56 | 601 | **10.7** |
| **this draft, all 78 lines** | 354 | 4349 | **12.3** |

Sitting between the two corpora at the sentence level, while every UNIT sits at 40 to 80 words, is the shape I was aiming for: Headspace's short warm sentences delivered in Harris-length spans.

### 1. Harris vs `breath` pool 2

> **Harris, verbatim**
> See if you can notice the next breath from the moment it arises, for its full duration, until the moment it subsides. Begin again in this moment, noticing the next inhalation, and the pause between breaths, and the next exhalation.

> **Mine, `breath` pool 2**
> See if you can stay with one whole in-breath, all the way through, catching it where it first starts, staying with it while it fills, and still being there at the point where it stops and turns around. One breath, followed the whole way. If you lose it partway, let that one go and take the next one from the beginning.

| | words | sentences | w/sentence |
|---|---|---|---|
| reference | 40 | 2 | 20.0 |
| mine | 62 | 3 | 20.7 |

**Where the invitation sits:** identical, and deliberately so. Both open on `See if you can`, which is the tradition's shared invitation frame and the single most important thing I took. Nothing after that first clause is his.

**How the teaching is folded in:** his is folded into the THREE-BEAT SPAN (arises / full duration / subsides), so the sentence itself measures out the time the listener needs. Mine does the same job with three participial clauses hung off one main verb (catching / staying / still being there), which is Headspace's grammar carrying Harris's content.

**Clause count and length:** his 40 words in 2 sentences, 20.0 w/sentence. Mine 61 words in 3 sentences, 20.3 w/sentence. Effectively the same rhythm.

**Read aloud:** both take a breath and a half to say, and both leave the listener inside the instruction while it is still being spoken. **This is the pair that made me rewrite.** My first version of this line was six clipped sentences at 9.2 w/sentence; it passed both gates and read as a list of orders. The diff caught what the gates could not.

**Lift check:** one shared 4-gram, `see if you can`. That is the common tongue, not his expression.

### 2. Harris vs `listen` pool 1

> **Harris, verbatim**
> Notice any sounds in the room. Observe how they arise spontaneously, you don't have to make any effort to hear them. They continuously arise and change and pass away.

> **Mine, `listen` pool 1**
> Notice that you're doing nothing to make this happen. You didn't reach for the last sound, and you won't reach for the next one. Hearing goes on by itself whether you take part or not, and this is the one place in the sit where that's obvious. Let the sounds arrive, and stay out of the way.

| | words | sentences | w/sentence |
|---|---|---|---|
| reference | 29 | 3 | 9.7 |
| mine | 57 | 4 | 14.2 |

**Where the invitation sits:** his instruction comes first and the permission second (`Notice any sounds` then `you don't have to make any effort`). Mine inverts it and opens ON the teaching (`Notice that you're doing nothing to make this happen`), because in my block the sounds arrived one line earlier in the entry, so the teaching is the news.

**How the teaching is folded in:** this is the pair the brief names as the model. His second sentence is why the first one lands. Mine gives the same mechanism two concrete instances before generalising, `you didn't reach for the last sound, and you won't reach for the next one`, which is the bit a person can check against their own experience while lying there.

**Clause count and length:** his 29 words in 3 sentences, 9.7 w/sentence. Mine 57 in 4, 14.2. Mine is the longer unit; his sits inside a longer surrounding passage that supplies the same total time.

**Read aloud:** his is clipped and declarative; mine is one degree warmer and slower. That is the Headspace half of the amalgam, and it is the right choice for the FIRST line of a block rather than the fifth line of a flow.

**Lift check:** zero shared 4-grams.

### 3. Headspace vs `settle` pool 2 (closing half)

> **Headspace, verbatim**
> So, is there a sense of heaviness or lightness to the body? Is there a sense of stillness or agitation? Not trying to change anything, just noticing how the body feels.

> **Mine, `settle` pool 2 (closing half)**
> Then read the rest of you, plainly. Heavy this morning, or light. Wound up, or already quiet. Whatever comes back is the answer, and none of it needs fixing.

| | words | sentences | w/sentence |
|---|---|---|---|
| reference | 31 | 3 | 10.3 |
| mine | 29 | 4 | 7.2 |

**Where the invitation sits:** his is two questions and then the permission (`Not trying to change anything`). Mine is a plain instruction (`read the rest of you, plainly`) with the permission at the end (`none of it needs fixing`). I moved off the question form on purpose: two rhetorical questions in a row is his signature and reproducing it would be a lift, and the clause `Not trying to change anything, just noticing` is the most recognisable sentence in the whole Headspace catalogue.

**How the teaching is folded in:** his teaches by offering the two axes to read along. Mine offers the same two axes in our own vocabulary (`Heavy this morning, or light. Wound up, or already quiet.`) and then adds the one thing his leaves implicit: `whatever comes back is the answer`, which tells a first-timer that a blank or a boring reading is a success.

**Clause count and length:** his 31 words in 3 sentences, 10.3 w/sentence. Mine 29 in 4, 7.2. **Mine is the more fragmented of the pair**, and I kept it, because the two paired fragments ARE the two axes and running them into a sentence would blur the choice. Headspace fragments at least as hard elsewhere (`The weight of the hands and the arms. The feet and the legs.`).

**Lift check:** zero shared 4-grams. Note that `heaviness or lightness` and `stillness or agitation` are his, and neither appears in mine.

### 4. Headspace vs `count` entry

> **Headspace, verbatim**
> And if you find that it helps, you can just sort of count the breaths as they pass. So, one with the rising sensation. And then two as the body exhales, so you feel that falling sensation. And just starting at one again. So, just counting up to two each time.

> **Mine, `count` entry**
> If the mind keeps sliding off, you can give it something to hold on to. Count one as the breath comes in, and two as it goes out. Then start again at one. The count never climbs past two, so there's no total to keep track of and no place to get to.

| | words | sentences | w/sentence |
|---|---|---|---|
| reference | 51 | 5 | 10.2 |
| mine | 53 | 4 | 13.2 |

**Where the invitation sits:** both put it first and both make the count conditional rather than compulsory. His `if you find that it helps`; mine `if the mind keeps sliding off`. Mine adds the diagnostic, which is the improvement I would defend: his says the count is optional, mine says WHEN to reach for it.

**How the teaching is folded in:** his teaches by demonstration, walking one and then two out loud. Mine does the same and then adds the reassurance the mechanism actually rests on, `there's no total to keep track of and no place to get to`, which is the sentence that stops a beginner treating the count as a score.

**Clause count and length:** his 51 words in 5 sentences, 10.2 w/sentence. Mine 53 in 4, 13.2. Closest pair in the set.

**Read aloud:** his is softer, carried by `just` and `sort of` (he uses `just` 47 times in a 601-word script; it is his whole permission engine, and copying that density would be the most obvious lift available). Mine reaches the same softness through the conditional opening and the closing permission instead.

**Lift check:** zero shared 4-grams.

### 5. Harris vs `watch` pool 1

> **Harris, verbatim**
> Notice a thought present in the mind. Watch what happens to that thought, to the image, or a bit of language. Where does it go? It doesn't matter how long you've been lost in thought, just notice it in this instant, and come back to the feeling of breathing.

> **Mine, `watch` pool 1**
> When one shows up, see what it's made of, whether it's words going past in your own voice, or a picture, or somebody's face arriving for no reason. Then watch what happens to it without stepping in. It might fade out on its own, or get swapped for a different one halfway through, or stop mid-sentence and leave nothing behind it.

| | words | sentences | w/sentence |
|---|---|---|---|
| reference | 49 | 4 | 12.2 |
| mine | 62 | 3 | 20.7 |

**Where the invitation sits:** both open on a plain noticing instruction with no softener, which is correct here: by this block the listener has been sitting for several minutes and the register can firm up.

**How the teaching is folded in:** his tells you what a thought is MADE of inside the instruction (`the image, or a bit of language`). Mine does the same and then goes one step further, listing the three things that can happen to it, because a first-timer watching a thought does not know what counts as a result. That is the rung his surrounding script delivers elsewhere and I have one line for it.

**Clause count and length:** his 49 words in 4 sentences, 12.2 w/sentence. Mine 59 in 3, 19.7. **Mine is now the longer-breathed of the two**, and this is the other line the diff sent back: my first version ran 8 sentences at 6.6 w/sentence, a staccato list. Joining the fragments into two comma-chains fixed it.

**Lift check:** one shared 4-gram, `watch what happens to`. That is a plain instruction three words long in its useful part, not distinctive expression. His `where does it go?` and `lost in thought` are absent from mine.

### What the diff actually changed

Two lines failed it and went back to draft after both gates had already passed them, which is the point of running it: `breath` pool 2 (6 sentences at 9.2 words, rewritten to 3 at 20.3) and `watch` pool 1 (8 sentences at 6.6 words, rewritten to 3 at 19.7). A third, `note` pool 2, took a smaller join for the same reason. The failure mode in all three was the same and it is worth naming, because it is where a long line goes wrong: **a 55-word unit built out of eight four-word fragments hits the word target and still reads as a list of orders.** Reaching reference LENGTH is not the same as reaching reference RHYTHM, and only reading it beside the real thing catches the difference.

Across all five pairs: **two shared 4-grams in total**, `see if you can` and `watch what happens to`. Both are common-tongue instruction, neither is a teacher's distinctive framing. Per the SCOPE AMENDMENT that is the target, not a near miss: technique is free, expression is owned, and original-but-plain beats distinctive-but-lifted.

---

## WHAT NEEDS DAVID, and what needs the builder

**Four calls for David, one line each. Nothing auto-applied.**

1. **The 5-minute morning stack loses its meditation pool lines.** 90 seconds across three sections leaves 30s each, which is one entry and no pool line. Accept three complete entries, or raise the meditate share of the 5-band?
2. **The `close` entry and the new `free` block collided, and I resolved it rather than shipping the collision.** The shipped close entry (*let the mind rest, free to do as it pleases*) IS the `free` block's whole move, so with both in one sit the listener is released twice. I rewrote close's entry as the RETURN, which is the block's real job, and `free` now owns the release. Say if you want it the other way round.
3. **`scan` stays re-pitched from SOFTENING to NOTICING.** That was the rejected draft's call and I kept it, because the relax act already softens forehead, jaw, shoulders, chest, belly, arms and legs, and a scan that softens them again is the same act twice. It is a real change of feel for a block you have heard.
4. **Every line in the meditation bank is new.** Per the 2026-09-09 law, NO audio generation until you have read and verdicted this copy. The existing clip bank is invalidated by this round, so the voice run is the largest single job behind it.

**Five notes for whoever wires it.**

1. **`PK.speechEst` is a ship blocker**, detailed above. Per-line `Math.max(4.2, words / 2.5)` in `composeMeditationSegs` and in the `composeStackSegs` meditation branch, or none of these pool sizes hold.
2. **`close` pool order is load-bearing.** `composeMeditationSegs` always appends the LAST pool line of the LAST block as the closer, so the eyes-open line must stay third.
3. **`free` reuses an existing registry hex** (`#b98cff`, already used by `look`), so `_dev/theme-add.py` is not involved. It needs an RU dict entry alongside Stillness / Count / Note / Sounds / Feeling / Look / Open, since `MED_BLOCKS` names print as the player's sub-line.
4. **`feel` is currently unroutable.** It sits in `MED_BLOCKS` with `weave:true` but no `MED_SESSIONS` lane and no `MED_SEC` key reaches it, so nothing the user can tap plays it. It has been written; it needs a home (a lane, or a `MED_SEC` view like `body` and `aware`).
5. **`entryStacked` is a new field** on the `settle` block. The composer reads `def.entry`; something has to choose between the two when a previous act in the same session already settled the body. `composeStackSegs` already tracks exactly that with `sawBodyPrep`.

---

## WHAT THIS ROUND HAS NOT HAD

Per PART 7.7 this is labelled honestly. It has run: PLAN, one writer lane, GATE 0, GATE 1, and the resemblance diff (which is not in the standing pipeline and should be, for any spoken surface). It has **not** run the taste skeptic, the clarity skeptic, or the deletion pass. Those three are fresh-agent jobs and this seat cannot do them on its own work. Until they run, this surface is **UNJUDGED** in the sense PART 7.7 means.

The clarity skeptic is the one I would run first, for a specific reason: these lines are three times longer than the ones it has audited before, and a long line has more places to be misunderstood by a person with their eyes closed, not fewer.