# MEDITATION BENCH — foundation and working rungs

*Seat: the meditation bench (Headspace warmth and permission + Harris precision), per `_specs/voice-foundry/THE-PANEL.md`. Scope: `settle` `breath` `count` `note` `scan` `listen` `watch` `feel` `close` + the new `free`. The subtle and advanced rungs (`open` `heart` `look` `embody` `rest`) belong to another seat and are untouched here.*

David, verbatim: *"meditation needs to be clever and perfect like Headspace and Sam Harris and Judith Blackstone, but not repeating the other lines in the stack"* · *"don't overcomplicate with ur ai brain"* · *"make it to the point and human sounding."*

**Lines file (provenance-tagged, both gates exit 0):** `graph/med-foundation-lines.txt`
```
python3 _dev/copy-density.py --file _design-sync/audio-content-2026-09-09/graph/med-foundation-lines.txt --budget 2600
   lines 157 · words 2506 · budget 2600 · provenance S 148 · B 9 · instruction density 82% · PASS
python3 _dev/copy-density.py --strip ... > /tmp/mf.txt && python3 _dev/copy-audit.py --file /tmp/mf.txt
   157/157 PASS
```
Nothing was added to either script. Three lines were rephrased to clear the vague-quantifier rule (`something is` to `a part is`, `you hit something uncomfortable`); all three read better for it, so no source cue was lost.

## THE FIVE RULES THIS ROUND RAN ON
1. **The engine plays each line once, in authored order.** So the pool order IS the ladder: a two-minute sit gets the first rungs, a twenty-minute sit reaches the last. Every pool below is ordered basic to subtle, and the ladder above it is the authority for that order.
2. **The stack already settled the body.** The relax act says settle in, soften your forehead, unclench your jaw, drop your shoulders, soften your chest, let your arms go heavy, release your legs. The breathe act paced the breath for a full minute. No line here re-says any of that, which cost two settle lines and one scan line (listed below).
3. **Technique is free, expression is owned.** Every move is taken from the transcripts and the mined canon; not one sentence is the teacher's own phrasing. Nothing here would read as a lift.
4. **Every line is a real instruction:** what to do, what to notice, or the correction when it goes wrong. 82% of them carry an action verb; the rest are the corrections.
5. **One listener, eyes closed, second person, present tense.** No `we` anywhere (this cost the `we'll` in two shipped entries), no questions, no metaphor that does not map, nothing a first-timer would find odd.

**KB-SWEEP:** `_design-sync/audio-content-2026-09-09/KB-SWEEP-meditation.md` read in full (its own raw sources: `meditation-scripts/style1-4`, `_mined/spiritual-canon/{TMI,shinzen,MCTB,hypnosis}`, `fieldguide/induction-library/protocol-guides/{pre-sleep,heart-coherence}.md`, `_specs/SPIRITUAL-PROGRESSION-CANON`); `meditation-scripts/style3-headspace-andy-reset.txt` and `style2-sam-harris-mindfulness.txt` read in full at source; `app.js` `MED_BLOCKS` through `MED_RETURN` read live; `graph/reality-morning-stack.md` read in full for the stack-warden pass; `_specs/COPY-ANCHORS.md` read in full, every 2026-09-16 block included.


---

## `settle`

**The ladder**

1. [foundation] Take the seat. Upright is preferred, lying or leaning back is equally valid. `BL:L5`
2. [foundation] Notice the plain sensations of sitting: weight, and the points of contact. `SH:L5` `HS:L13`
3. [foundation] Hand the weight to the seat instead of working at relaxing. `SH:L5`
4. [working] Take a plain reading of the body's state, heavy or light, still or agitated, changing nothing. `HS:L11`
5. [working] Go to the lowest point of contact first, feet and seat, before anything above it. `BL:L13`
6. [working] For a busy mind, rest the thinking directly on the sensation of breathing. `BL:L11`
7. [subtle] One held physical anchor (hand on chest or belly) can stand in for the whole sequence. `HC:§Requirements` `HYP:§5`
8. [effortless] Settling starts arriving faster with repetition; notice it without chasing it. `HYP:§1`

**Paste-ready**

```js
settle: { name: "Settle", ti: "ti-armchair", c: THC("#63e6d6","bg"), entry: "Find a comfortable position, and when you're ready, gently close your eyes.",
  pool: [
    "Sitting up is good, and lying down or leaning back works too. Pick what you can stay in.",
    "Feel the weight of your body pressing down. The contact of the seat, the floor beneath your feet.",
    "Let the chair or the floor take your weight. There's no work to do here.",
    "Notice how the body feels right now. Heavy or light, still or restless. No need to change it.",
    "Start low, at your feet and where you're sitting, and let your attention rest there.",
    "If the mind is busy, let the thinking rest on the breath. You don't have to quiet it first.",
    "If it helps, rest one hand on your chest or your belly, and leave it there.",
    "Settling gets faster the more you do it. Let it take however long it takes today."
  ] },
```

**Kept (1 of 3):** the weight-and-contact line. It is the sitting-sensations move (`SH:L5`) and the stack never says it.
**Replaced (2 of 3):**
- `There's nowhere to be right now, and nothing to respond to. This time is yours.` The relax act ends on *nothing to do, nowhere to be*. Same beat, six lines apart. Replaced by the posture-permission rung (`BL:L5`), which the ladder was missing at the bottom.
- `Take a few deep breaths. With each out-breath, let the body soften a little more.` Collides twice: the breathe act just paced 60 seconds of breath, and the relax act just ran the soften sweep. Replaced by the start-low rung (`BL:L13`).
**New rungs:** hand the weight over · read the body without changing it · start low · let thinking rest on the breath · the hand anchor · the conditioning notice.


---

## `breath`

**The ladder**

1. [foundation] Locate where the breath reads clearest; no location is the correct one. `TMI:Stage1` `SH:L7`
2. [foundation] Do not control or deepen it; hand the rate back to the body. `SH:L9`
3. [foundation] Cover one whole inhalation with attention, start to finish, without judging it. `SH:L9`
4. [foundation] Read its shape without correcting it: long or short, deep or shallow. `HS:L15`
5. [foundation] Arrive by a graduated path: whole body, then the movement of breathing, then the exact spot. `TMI:Stage1`
6. [foundation] Inventory the likely distraction before starting, so it is recognised fast. `TMI:Stage1`
7. [working] Track the full cycle: in, the top pause, out, the gap. Following. `TMI:Stage3`
8. [working] Stay present through the pause instead of checking out until the next in-breath. Connecting. `TMI:Stage3`
9. [working] Label the catch the instant a slip is caught, as its own move. `TMI:Stage3`
10. [working] Check in deliberately rather than waiting to notice a full wander. `TMI:Stage3`
11. [working] Hold a strong thought or feeling alongside the breath without letting it replace it. `TMI:Stage4`
12. [working] Discomfort may become the object itself for a while, as an option. `TMI:Stage4`
13. [working] Notice raw qualities, temperature and texture, not only rhythm. `SH:L17`
14. [subtle] Diagnose calm-but-foggy as subtle dullness, and brighten rather than sinking deeper. `TMI:Stage5`
15. [subtle] Widen the object to the whole body breathing. `TMI:Stage6`
16. [subtle] Check whether attention still alternates out to background thought. `TMI:Stage6`
17. [subtle] Catch the exact instant the next in-breath begins. `TMI:Stage6-7`
18. [subtle] Notice the length of the longest unbroken stretch; that stretch is the marker. `SHIN:§1 Meter1`
19. [effortless] Drop all effort for a few breaths and test whether attention stays. `TMI:Stage7`
20. [effortless] Let the breath fall to the background of a wider field. `TMI:Stage7-8`
21. [effortless] Let a wave of ease or an involuntary micro-movement be, without chasing it. `TMI:Stage8`
22. [effortless] Let joy be present while the breath stays the primary object. `TMI:Stage8`

**Paste-ready**

```js
breath: { name: "Breath", ti: "ti-lungs", c: THC("#79ccff","bg"), entry: "Now bring your attention to the breath. Notice where you feel it most clearly. The nostrils, the chest, or the rise and fall of the belly.",
  pool: [
    "There's no need to control it or deepen it. The body knows how to breathe. Just let it come and go.",
    "No spot is the right spot. Nose, chest, or belly, take the one you feel best.",
    "Feel where the breath is clearest right now, and let your attention rest there.",
    "Cover one whole in-breath with your attention, from the first moment to the last.",
    "Notice whether it's long or short, deep or shallow. However it is right now is fine.",
    "Widen to the whole body for a moment, then narrow to the breathing, then to the clearest spot.",
    "Name the thing most likely to pull you away today, so you know it when it comes.",
    "If managing creeps back in, hand it over. Let the body set the rate.",
    "Follow one full breath, from the start of the in-breath, through the pause, to the end of the out-breath.",
    "Notice the small pause at the top of the in-breath, and the one after you breathe out.",
    "Stay through that pause as well, instead of waiting out the gap until the next breath.",
    "Notice the breath as sensation now. The cooler air coming in, a little warmer going out.",
    "The moment you catch a slip, say thinking in your head, then come back.",
    "Check now whether you're still with the breath, instead of waiting to notice a long wander.",
    "When a strong thought or feeling arrives, let it be there without letting go of the breath.",
    "If an ache pulls harder than the breath, make the ache itself the thing you feel for a while.",
    "As the breath settles, let sounds and sensations ease into the background. The breath stays in front.",
    "See if you can catch the start of the next in-breath, before it fully arrives.",
    "If it feels calm but blurry, that's dullness setting in. Sit up a little and pick the breath up sharper.",
    "Widen out from the one spot you chose until you feel the breathing all through you.",
    "Notice whether attention still flickers out to thinking in the background, even for a moment.",
    "Notice how long attention stays before it moves. That stretch gets longer over weeks.",
    "You're doing less now. The attention holds the breath more and more on its own.",
    "Drop the effort for a few breaths and see whether attention stays there on its own.",
    "If it starts to feel effortless, let it. You don't have to grip the breath to stay with it.",
    "Let the breath sit in the background while the whole field stays open around it.",
    "If a wave of ease or a small twitch comes, let it come and go. Nothing to chase.",
    "If pleasure rises with it, enjoy it lightly and keep the breath as the thing you're with."
  ] },
```

**Kept (10 of 13)**, in place, in the same ladder order they already held.
**Replaced (3 of 13):**
- `You don't have to change anything. Just stay with each breath as it comes.` Third permission line in one pool, after *no need to control it* and *however it is right now is fine*. Nothing lost.
- `When you notice your mind has wandered, that's the practice. Gently come back to the breath.` MED_RETURN now owns the wander reframe with twelve mechanisms and the engine weaves it into every block. A pool copy of it makes the same cue land twice in a minute.
- `Nothing to add, nothing to fix. Just stay with each breath, one after the next.` Echoes the `open` entry's *nothing to focus on, nothing to fix* and restates the line above it.
**New rungs (18):** the whole inhalation · graduated arrival · distraction inventory · hand control back · stay through the pause · label the catch · check in · hold both · the ache as object · the dullness diagnosis · widen to the whole body · the flicker check · the length of the hold · drop the effort · background of the field · the wave · joy without hijack · no spot is the right spot.


---

## `count`

**The ladder**

1. [foundation] One on the rise, two on the fall; a fixed two-count loop, never climbing. `HS:L17`
2. [foundation] Restart at one after every exhale; the number never matters. `HS:L17`
3. [foundation] Lost count means restart at one, with no backtracking. `HS:L17`
4. [foundation] Creeping upward is corrected by resetting the loop, not by trying harder. `gen`
5. [working] Both numbers are counted, but attention rests heaviest on the out-breath. `HS:L15,L17`
6. [working] A racing mind holds a structured external task more easily than bare watching. `TMI:Stage2`
7. [working] The felt give after each exhale is the actual target; the count is scaffolding. `HS:L17,L19`
8. [subtle] Let the numbers grow quieter, felt more than said, while the structure stays. `SHIN:§4`
9. [subtle] Extend the loop (one in, two pause, three out) only if it serves concentration. `TMI:Stage3`
10. [subtle] The sense of space after each exhale becomes the point of the count. `HS:L17,L19`
11. [effortless] Drop the count for a stretch, keep the out-breath emphasis, test whether it holds. `gen` + `TMI:Stage7`
12. [effortless] Notice needing the count less at the start than in earlier sits. `HYP:§1`

**Paste-ready**

```js
count: { name: "Count", ti: "ti-list-numbers", c: THC("#a08fff","bg"), entry: "If it helps to steady the mind, you can count each breath as it passes. One on the in-breath. Two on the out.",
  pool: [
    "One, breathing in. Two, breathing out. Then begin again at one.",
    "Don't climb past two. The number itself doesn't matter, only that you come back to one.",
    "If you lose count, that's perfectly normal. Just begin again at one.",
    "If you find yourself at four or five, come back to one and keep the loop small.",
    "Give the out-breath your full attention. Notice the body softening each time you breathe out.",
    "If the mind is racing, the count gives it a job. Hold the numbers and let the breath follow.",
    "Notice the space that opens after each out-breath. That space is what the count is for.",
    "Let the numbers get quieter. Said softly, or barely said at all, while the counting keeps going.",
    "If the pause between breaths is clear, you can count it. One in, two for the pause, three out.",
    "If the count starts to feel like work, drop it and stay with the breath itself.",
    "Let the count go for a stretch now. Keep the weight on the out-breath and see if the settling holds.",
    "Notice if you need the count less than you used to at the start."
  ] },
```

**Kept (3 of 3).** All three still sit correctly at the bottom of the ladder.
**New rungs (9):** never climb past two · the reset when it creeps up · the count as a job for a racing mind · the space after the exhale as the actual point · quieter numbers · the optional three-count with the pause · dropping the count as a promotion · the drop test · needing it less than before.


---

## `note`

**The ladder**

1. [foundation] Start on the loudest channel; let attention float rather than fixing it. `SHIN:§2`
2. [foundation] One soft label the instant something is noticed, never a description. `SHIN:§1 Meter2`
3. [foundation] When two things arrive together, note one. `SHIN:§2`
4. [foundation] Catch a thought at the moment it begins. `SH:L17`
5. [working] Split a mixed feeling into picture, inner talk, raw sensation, noted one at a time. `SHIN:§2`
6. [working] Turn towards or turn away from discomfort; both build the same skill. `SHIN:§2`
7. [working] Hunt the moment something vanishes, not only arrivals. `SHIN:§3`
8. [working] Note rest: a quiet gap, a relaxed patch. `SHIN:§2`
9. [working] Note flow: pulsing, spreading, fading, as objects in their own right. `SHIN:§2`
10. [working] Flooded means re-note the SAME thing slowly to bring the pace down. `SHIN:§4`
11. [working] Zoom in for detail, zoom out to the field. `SHIN:§4`
12. [subtle] Labels shrink to a bare touch, then go quiet while noticing continues. `APP:existing`
13. [subtle] Note co-occurring channels together as one compound moment. `SHIN:§2`
14. [subtle] Each note is a brief full taste, then attention moves on. `SHIN:§1 Meter1`
15. [subtle] Check the second arrow: irritation stacked on the unpleasant thing. `SHIN:§3`
16. [subtle] Hold sound, sensation and thought in one field without choosing. `SHIN:§2`

**Paste-ready**

```js
note: { name: "Note", ti: "ti-focus-2", c: THC("#5ed0b0","bg"), entry: "Now let your attention open out, wider than the breath. Whatever shows up, notice it and let it pass.",
  pool: [
    "Start with sound. Whatever you can hear, near or far, just let it land. You don't have to listen for it.",
    "When a sound arrives, you can note it softly, hearing, and let it go.",
    "Now notice a sensation in the body. Maybe the warmth of your hands, or the contact where you're sitting.",
    "Note that one too, feeling, gently, and let your attention move on.",
    "Thoughts pass through as well. A word, a picture. Note it, thinking, and let it carry on without you.",
    "Let attention float. Note whichever is loudest right now, a sound, a sensation, or a thought.",
    "See if you can notice each thought the moment it begins, right as it arrives.",
    "Hunt for the moment something ends. A sound stopping, a thought dropping. Note it gone.",
    "Notice rest as well. A quiet gap in the room, a soft patch in the body. Note that too.",
    "Notice movement itself. A pulsing, a spreading, a fading. You can note change the same way.",
    "There's no need to chase anything or hold it. Each sound, each sensation, each thought comes and goes on its own.",
    "If a feeling is big, split it. The picture, the inner talk, the raw sensation. Note one at a time.",
    "When you hit something uncomfortable, you can turn toward it or turn away to a sound. Both are the practice.",
    "If it's coming too fast, note the same thing three or four times slowly. That brings the pace down.",
    "Zoom in for a finer look at one thing, then zoom out to the whole field around it.",
    "Let the labels grow lighter now. You don't have to say them fully. Just a touch is enough.",
    "Note two at once when they come together. A sound and a sensation in the same moment.",
    "Let each note be a quick touch, then let attention go where it wants next.",
    "If irritation stacks on top of something unpleasant, note the irritation on its own and let it go.",
    "Rest in the whole field at once. Sounds, sensations, and thoughts, all moving through the same open awareness."
  ] },
```

**Kept (9 of 9).** The strongest existing pool in the app; the sound-then-body-then-thought arc is intact and the new rungs slot between them.
**Entry kept, one word cut:** `Whatever shows up, we'll just notice it and let it pass` loses the `we'll` per this round's one-listener rule. No other change.
**New rungs (11):** float and note the loudest · split a big feeling · turn towards or away · note it gone · note rest · note flow · re-note to slow the pace · zoom in and out · compound notes · the quick touch · the second arrow.


---

## `scan (Body)`

**The ladder**

1. [foundation] Fixed order, head to toe, a few breaths at each region. `HS:L13`
2. [foundation] Notice what is there with no goal of finding or fixing. `HS:L11,L13`
3. [foundation] Nothing felt means neutral; move on rather than searching harder. `SHIN:§2` `HS:L15`
4. [foundation] Discomfort is noted and passed, not massaged away. `APP:existing`
5. [working] Slow the pass to a breath or two per region. `HYP:§2`
6. [working] Tense-then-release where a region is genuinely held. `HYP:§2`
7. [working] Let the pace follow the tension: fast where easy, slow where held. `gen`
8. [working] Read temperature and weight, not tension alone. `HS:L11`
9. [working] Once single regions are easy, hold paired regions at once. `BL:L19`
10. [subtle] Where focus flips between two symmetric points, thin it until both are held. `BL:L19`
11. [subtle] Feel the breath moving through the region being scanned. `BL:L23,L29`
12. [subtle] Feel each region as owned, from the inside, not inspected from outside. `BL:L21,L35`
13. [subtle] After the sequential pass, hold every region simultaneously. `BL:L45`
14. [effortless] Let the regions dissolve into one undivided field of sensation. `BL:L45,L49`

**Paste-ready**

```js
scan: { name: "Body", ti: "ti-scan", c: THC("#ff9a3d","bg"), entry: "Now take your attention slowly down through the body, starting at the top of the head.",
  pool: [
    "A breath or two at each part. No rush to get down to your feet.",
    "Through the face first. Notice what's there, warm or cool, tight or easy, and pass on.",
    "Down through the chest and the belly. No need to change anything. Just noticing how each part feels.",
    "Your arms, down to the fingertips. Your legs, all the way to your feet.",
    "If a part gives you nothing, that's a fine answer. Call it neutral and carry on.",
    "If you find tension somewhere, you don't have to fix it. Notice it, and let it be as it is.",
    "Notice weight and temperature too. Some parts read heavy or warm before they read tight.",
    "Where a part is genuinely held, tighten it for a few seconds, then let go and feel the drop.",
    "Go quickly where it's already easy, and slow down where a part is holding on.",
    "Take both hands at once now. Then both feet. Then both shoulders.",
    "When focus flips between the two sides, soften it and let it spread wide enough to hold both.",
    "Feel the breath moving through each part as you pass through it.",
    "Feel it from the inside. This is your shoulder, your hand, felt from within.",
    "Now hold every part at once, instead of one after another.",
    "Feel the body now as one whole, sitting here, breathing.",
    "Let the parts blur into one field of sensation, with no lines between them."
  ] },
```

**Kept (4 of 5).**
**Replaced (1 of 5):** `Forehead, jaw, shoulders. Notice each part as you pass, and let it soften.` This is the relax act, verbatim in substance: *soften your forehead, and unclench your jaw* then *drop your shoulders*. The block is re-pitched to what the sources actually teach here, a NOTICING pass (`HS:L11,L13`), which also gives the stack a clean division of labour: relax softens, scan notices.
**Entry kept, one word cut:** `Now we'll scan through the body` becomes `Now take your attention slowly down through the body`.
**New rungs (11):** a breath or two per part · neutral is an answer · weight and temperature · tense-then-release · pace follows the tension · paired regions · thinning the split focus · the breath through the region · felt from the inside · every part at once · the field with no lines.


---

## `listen (Sounds)`

**The ladder**

1. [foundation] Let sound arrive; do not search the room for it. `SH:L21`
2. [foundation] Near and far, ranked the same. `SH:L5`
3. [foundation] Do not resist an unwanted sound; it is part of the field. `HS:L9`
4. [foundation] Do not name or judge; register that hearing is happening. `SH:L21`
5. [working] Silence is a valid object, not an absence of practice. `SHIN:§2`
6. [working] Notice edges: the moment a sound starts, changes, stops. `SHIN:§3`
7. [working] No effort is required to hear; the sounds appear on their own. `SH:L21`
8. [subtle] Meet a startling sound with the same equanimity as a quiet one. `SHIN:§1 Meter3`
9. [subtle] Sounds and silence as one continuous field. `SHIN:§2`
10. [effortless] Rest as the awareness the sounds are appearing in. `SH:L21` `ADY:L6-L10`

**Paste-ready**

```js
listen: { name: "Sounds", ti: "ti-ear", c: THC("#ff85be","bg"), entry: "Now open your attention to sounds. The ones nearby, and the ones far away.",
  pool: [
    "You don't have to go looking for them. Sounds arrive on their own.",
    "Notice the near ones and the far ones the same way. Neither one matters more.",
    "There's no need to name them or judge them. Let each sound come, and let it go.",
    "Let a sound you'd rather not hear be part of it too. No need to push it out.",
    "Notice the quiet between sounds. Quiet is something to hear too.",
    "Catch the edges. The moment a sound starts, the moment it stops.",
    "Notice you're doing nothing to hear. Hearing happens without your effort.",
    "Sounds appear, change, and pass away, all by themselves.",
    "If a loud one startles you, let it land like any other and carry on.",
    "Let the sounds show you the space they're happening in, and rest there."
  ] },
```

**Kept (3 of 3).**
**New rungs (7):** the unwanted sound · near and far ranked the same · the silence between · the edges · no effort to hear · the startling sound · the space sounds happen in.


---

## `watch (Awareness)`

**The ladder**

1. [foundation] Notice a thought is present, an image or a bit of language, without following it. `SH:L17`
2. [foundation] Watch what happens to it: fade, swap, dissolve. `SH:L17`
3. [foundation] It does not matter how long attention was lost; notice now. `SH:L17`
4. [foundation] Notice the gap after one thought ends and before the next appears. `APP:existing`
5. [working] Stay at the level of thinking-is-happening, not the content. `APP:existing`
6. [working] Notice a thought arrived on its own, unbuilt and unchosen, and is already gone. `SPC:MLS`
7. [working] Where a thought carries charge, notice the charge in the body too. `SH:L19`
8. [working] Notice thoughts appearing out in front, the way sounds do; offered, never demanded. `TMI:Stage1`
9. [subtle] A repeating thought is allowed to repeat; watch each arrival. `gen` per `SHIN:§4` re-noting
10. [subtle] Name the mind's one-more-thing-to-solve move and leave the thread unresolved. `ADY:L16`
11. [subtle] Notice the doer, the part wanting to get this right, without obeying it. `ADY:L8,L10`
12. [subtle] Let unusually vivid memories or images pass without investigating them. `TMI:Stage4`
13. [effortless] Watching is not a technique being performed; awareness is already present. `ADY:L6,L8`

**Paste-ready**

```js
watch: { name: "Awareness", ti: "ti-eye", c: THC("#c9a6ff","bg"), entry: "Thoughts will keep coming. This time, instead of following them, see if you can watch one arrive.",
  pool: [
    "A thought appears. It might be words, or a picture. Watch it, without following it.",
    "Watch what happens to it. Whether it fades, or gets swapped for the next one.",
    "It doesn't matter how long you were gone inside it. Notice it now, and that's enough.",
    "Like the sounds, thoughts come and go on their own. Watch one pass.",
    "Stay at the fact that thinking is happening. You don't have to know what it's about.",
    "And notice the quiet space after one thought ends, before the next appears.",
    "Notice you didn't build that thought. It showed up on its own, and it's already going.",
    "If a thought carries a charge, feel where it lands in the body as well.",
    "If one keeps returning, let it come as many times as it likes. Watch each arrival.",
    "See if a thought can show up out in front of you, the way a sound does.",
    "If an old memory or a strong picture turns up, let it pass through without opening it.",
    "When the mind offers one more thing to work out first, leave that one unfinished.",
    "Notice the part that wants to do this well. Let it be there without doing what it says.",
    "There's no work in this. The watching is already happening without you arranging it."
  ] },
```

**Kept (3 of 3).**
**New rungs (11):** what happens to the thought · however long you were gone · thinking-is-happening · unbuilt and already going · the charge in the body · the repeater · out in front like a sound · the memory that surfaces · one-more-thing-to-solve · the doer · no work in the watching.


---

## `feel (Feeling)`

**The ladder**

1. [foundation] Locate where the feeling registers in the body, not the story about it. `SHIN:§2`
2. [foundation] One plain word if it helps, rather than describing the situation. `SHIN:§1 Meter2`
3. [foundation] No feeling present is a legitimate finding, not a gap to fill. `SHIN:§2`
4. [foundation] Feel it as pressure, heat, tightness, not a verdict on the day. `APP:existing`
5. [working] Track how it shifts while it is watched. `SHIN:§2`
6. [working] Split an overwhelming feeling into picture, inner talk, raw sensation. `SHIN:§2`
7. [working] Check for the second layer stacked on the first, and release that first. `SHIN:§3`
8. [working] Care versus overcare where another person is involved; only overcare is released. `HC:§Requirements`
9. [subtle] Stay with it or turn away to an anchor; neither is more correct, and stopping is allowed. `SHIN:§2` + §E2
10. [subtle] Soften around the sensation on the exhale instead of bracing. `HC:§Release`
11. [subtle] A positive feeling may be deliberately grown and spread. `HC:§Installation`
12. [effortless] Fully present without suppressing or grabbing: the equanimity balance point. `SHIN:§1 Meter3`

**Paste-ready**

```js
feel: { name: "Feeling", ti: "ti-heart", c: THC("#ff9a6e","bg"), entry: "If there's a feeling here, let it be here. Notice where you feel it in the body. The chest, the throat, the belly.",
  pool: [
    "You don't have to explain it or push it away. Just feel it, as sensation.",
    "One plain word for it if that helps, like sad or tense. Then back to where you feel it.",
    "If there's no feeling here right now, that's a real answer too. Nothing to dig up.",
    "Feel it as pressure, heat, or tightness, instead of a verdict on your day.",
    "Notice how it shifts and changes as you watch.",
    "If it's too big to hold, take it apart. The story in your head, then the sensation on its own.",
    "Check for a second layer. Anger about being anxious sits right on top of the anxiety.",
    "If it's about someone you care about, see whether it's warmth or worry. Only the worry needs letting go.",
    "You can stay with it, or go to your breath instead. Both are fine, and you can stop any time.",
    "Let the body soften around it on the out-breath, instead of bracing against it.",
    "If something good is here, let it grow. Let it spread through the chest and out.",
    "Let it be here without pushing it down or holding on to it."
  ] },
```

**Kept (1 of 2):** `Notice how it shifts and changes as you watch.`
**Replaced (1 of 2):** `You don't need to name it or push it away. Just feel it, as sensation.` It forbids naming, and the ladder's second rung (`SHIN:§1 Meter2`) asks for one plain word. A listener cannot obey both. Reworded to `You don't have to explain it or push it away`, which keeps the shipped rhythm and kills the contradiction.
**New rungs (10):** the one plain word · neutral is an answer · pressure, heat, tightness · take it apart · the second layer · care versus worry · stay or turn away with an exit · soften on the exhale · grow a good one · the balance point.
**Safety:** rung 9 carries the explicit off-ramp (`§E2`): turning away is complete, and stopping is allowed at any point.


---

## `free (NEW)`

**The ladder**

1. [foundation] Announce the release explicitly: even the breath is let go of now. `HS:L21`
2. [foundation] Full permission: the mind goes wherever it wants, with nothing to return to. `HS:L21`
3. [foundation] The one interval in the sit with no wrong way to spend it. `HS:L21`
4. [working] A plan or a worry is allowed to run; the noting habit is suspended on purpose. `HS:L21`
5. [working] Ask the mind for nothing: not stillness, not insight, not relaxation. `HS:L21`
6. [working] Bounded and short; a release valve, never a new open-ended technique. `HS:L21` `gen`
7. [subtle] Wild or settled, whichever happens needs no response. `TMI:Stage7`
8. [subtle] If no-instruction produces anxiety, shorten it or return to a light object. `gen` (regulation-sensitive)
9. [effortless] The hinge before the return; no clock is watched inside the interval. `HS:L21-L23`

**Paste-ready**

```js
free: { name: "Free", ti: "ti-feather", c: THC("#b98cff","bg"), entry: "Now let go of the breath as well. For the next little while, let your mind do whatever it wants.",
  pool: [
    "Nothing to hold, nothing to come back to. Wherever it goes is fine.",
    "If it plans or worries, let it plan and worry. Leave it alone this time.",
    "Nothing to label, nothing to watch. Let it run.",
    "Let it go wherever it goes. There's no wrong way to spend this stretch.",
    "Don't ask it for stillness or for insight. Ask it for nothing at all.",
    "If it goes quiet on its own, let that happen too. Nothing needed either way.",
    "If this feels uncomfortable with nothing to hold, go back to the breath whenever you like.",
    "In a moment you'll come back to the body. There's no hurry about it."
  ] },
```

**New block (0 existing lines).** It is Headspace's brief ruleless interval before the return, and it is mechanically distinct from `open`: open still holds an orientation (rest as the space things arise in), free holds none.
**Wiring notes for the builder, not decided here:**
- `free` reuses an existing registry hex, `#b98cff`. No new hex, so `_dev/theme-add.py` is not involved.
- `MED_BLOCKS` names print as the player's sub-line, so `Free` needs an entry in the RU dict alongside Stillness / Count / Note / Sounds / Feeling / Look / Open.
- Natural home: the Reset lane (`settle` light, `listen`, `free` as spine, `close`), and as a short pre-close beat in any lane.


---

## `close`

**The ladder**

1. [foundation] Let go of any remaining technique. `HS:L21`
2. [foundation] Hold the measured pace through the close so the ending is not rushed. `SPC:MLS`
3. [working] Back to the body: weight, contact, hands and feet. `HS:L23`
4. [working] Back to the room and its sounds, re-including the environment. `HS:L23`
5. [working] Name explicitly that the sit is ending rather than trailing off. `gen`
6. [working] A physical anchor stays a few seconds into the return. `HC:§Return`
7. [subtle] Eyes open in the user's own time, never on a fixed count. `HS:L23` `BL:L49`
8. [subtle] An eyes-open bridge moment before the end, never an abrupt cut. `HC:§Return`
9. [effortless] Brief and undramatic; trust the state to carry itself out. `gen`

**Paste-ready**

```js
close: { name: "Close", ti: "ti-moon", c: THC("#a08fff","bg"), entry: "Now let go of any effort. For these last moments, let the mind rest, free to do as it pleases.",
  pool: [
    "Bring your attention back to the body. The weight, the contact, the sounds around you.",
    "Let the room come back. The sounds in it, the light through your eyelids.",
    "If a hand is resting somewhere, leave it there a few seconds longer.",
    "This is the end of the session. Take the last two breaths at your own pace.",
    "And in your own time, gently open your eyes.",
    "Look around slowly before you move, and let the quiet stay with you."
  ] },
```

**Kept (2 of 2).**
**New rungs (4):** the room comes back · the anchor stays a moment · the sit is named as ending · look around before moving.
**ONE CONFLICT FOR DAVID, not auto-applied.** The shipped `close` entry is *let the mind rest, free to do as it pleases* which is the `free` block's whole move (`HS:L21`). If both play in one sit the listener is released twice. Two options, one line each: (a) keep the close entry and let `free` be the Reset lane's spine only, or (b) let `free` own the release and give close a plain entry such as `Now the sit is coming to an end. Nothing more to hold.` Nothing changed on my side; the entry ships as it is.


---

## `MED_RETURN` — widened to 12

Twelve cues, twelve different mechanisms, because the engine weaves these through every block and four phrasings of one mechanism read as one line repeated.

1. Noticing is the win. `TMI:Stage2` `SH:L17` **(kept)**
2. Begin again, no hunting for the place. `HS:L17` **(kept)**
3. Do not push the thought away. `SH:L17` **(kept)**
4. Drop the judgement first, then return. `TMI` **(new, replaces** `Each time you notice and come back, that's the practice working` **, which was mechanism 1 in other words)**
5. Return to raw sensation, not the idea of the breath. `SH:L17`
6. Return on the out-breath specifically. `HS:L19`
7. Return to a contact point when the breath cannot be found. `SH:L11`
8. Name the wandering thought on the way back. `SHIN:§2`
9. Widen instead of gripping tighter. `TMI:Stage6`
10. Fog, not thought: open the eyes a second and start fresh. `TMI:Stage5`
11. One deliberate breath as a micro-reset. `HYP:§3`
12. Mark the catch itself for a second. `TMI:Stage2`

**Paste-ready**

```js
var MED_RETURN = [
  "Sooner or later, the mind will wander off. That's normal. The moment you notice, gently come back to the breath.",
  "It doesn't matter how far away the thought carried you. Noticing is what counts. Begin again.",
  "You don't need to push the thought away. Let it pass, and return to the breath.",
  "If you're annoyed at yourself for drifting, drop that first. Then come back.",
  "Come back to the feel of it. The movement, the warmth, the pressure.",
  "Come back on the next out-breath, and let that carry you in.",
  "If you can't find the breath, come back to what you're sitting on.",
  "On the way back, name it. Thinking. Then pick the breath up again.",
  "If it keeps slipping, widen out to the whole body instead of gripping tighter.",
  "If you drifted into fog, open your eyes for a second, then close them and start fresh.",
  "Take one deliberate breath in and out, and start again from there.",
  "Notice the catch itself for a second before you come back. That second is what builds the skill."
];
```

---

## The stack-aware `settle` entry

The shipped entry assumes a cold start: *Find a comfortable position, and when you're ready, gently close your eyes.* Inside a stack the eyes are already closed and the body is already relaxed, so that line asks for work already done.

**Paste-ready**
```js
entryStacked: "Your body is already settled, so nothing to set up. Keep your eyes closed, and bring your attention back in.",
```
Use it when a previous act in the same session already settled the body (relax, breathe, or stretch immediately before). One line, no setup, and it names why nothing is being asked for.

---

## What a judge should attack first
- `scan` is now a NOTICING pass, not a softening pass. That is source-correct (`HS:L11,L13`) and it is what clears the stack collision, but it is a real change of feel for a block David has heard.
- The `close` entry versus the `free` block release, named above, is the one open conflict. It is not applied.
- `feel` rung 2 (the one plain word) and the reworded shipped line had to be reconciled; the reconciliation edits a David-accepted line by two words.
- Three effortless-tier rungs (`breath` 19-22) describe states most users never reach. They only play in very long sits, which is the design, but they are the lines most likely to read as odd if they ever surface early.

