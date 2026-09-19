# STRETCH v4: the MERGE seat, plain-reader fixes applied
*2026-09-16. Surface: the "Wake the Body" stretch routine. Input: `stretch-v3-lines.txt` + `stretch-v3.md` (WRITER lane) and `graph/plain-reader-stretch-v3.md` (PLAIN READER, veto binding on ambiguity). Output: `stretch-v4-lines.txt` (58 provenance-tagged rows) and this file.*

**Work order applied in the report's own priority order:** every MISLEADING row, the five silent position transitions, the four backwards mirrored pairs, the safety lines, then every fixable AMBIGUOUS row.

**Source of authority:** `KB-SWEEP-stretch-PT.md` sections 1 to 4. Where the plain reader says a word was deleted, the sweep's own cue was restored verbatim in substance ("slightly", "down", "toes up, leg straight", "until you feel the back of that leg"). No technique was invented: every added word places a body part, faces it, supports it, or says when to stop.

**Binding laws:** SCRIPT-ENGINE PART 7.1 (order of authority), 7.2 (provenance tags), **7.8 (the budget never cuts an execution word, and the plain reader outranks the budget)** · RECAST-equal-lines (two complete capitalized sentences, spoken joined) · COPY-ANCHORS 2026-09-16 · GUIDED-VOICE REGISTER (traditional-simple, zero cleverness on a stretch cue).

**Budget:** 1050 (raised from 900 by the parent per 7.8, spent only on execution words). Landed at **1049 of 1050**. The file is saturated: any further execution word needs the budget raised again, per 7.8's own rule.

## GATE RESULTS (both exit 0)

```
$ python3 _dev/copy-density.py --file _design-sync/audio-content-2026-09-09/graph/stretch-v4-lines.txt --budget 1050
lines 58 · words 1049 · budget 1050
provenance: S 47 · B 11        (bridge share 18%, cap 25%)
instruction density 93%
17 ECHO warns, all mirrored twins, deliberate
PASS                                                   (exit 0)

$ python3 _dev/copy-density.py --strip ...stretch-v4-lines.txt > /tmp/s4.txt && python3 _dev/copy-audit.py --file /tmp/s4.txt
58 PASS / 0 FAIL                                       (exit 0)
```

**Self-checks beyond the two gates, zero violations:** every row is exactly two capitalized sentences with terminal periods · every sentence 15 words or fewer · no em/en dash, semicolon, exclamation mark or emoji · pain words appear only in the two safety rows · all 32 side-specific moves name their side · all 50 moves present in the sweep's order, plus 2 safety rows and 6 position rows.

**Rephrased for a gate, not bypassed:** the sweep's hamstring cue is "Push your hips back, **not down**, until you feel the back of that leg." The string `, not ` is a ZERO-TOLERANCE hit on copy-audit's negation-contrast regex, so row 30 carries the positive form of the same correction plus the endpoint the gate rewrite had deleted: "Bend your other knee, push your hips back, and feel behind the right leg." The bent supporting knee is what "not down" prevents.

---

## THE STANDING POOL (58 rows)

Rows marked **POSITION** are the five silent transitions the plain reader found, plus one support row. They are not padding: each one performs a position change the routine previously assumed.

| # | Move | Line A | Line B | Tempo |
|---|---|---|---|---|
| 1 | **SAFETY, before move 1** | You want a gentle pull, never pain. | If a move hurts, come out of it and skip it. | spoken once, ~6s |
| 2 | **POSITION: stand up** | Stand up, feet hip width apart. | Move slowly and keep breathing. | transition, ~4s |
| 3 | 1. Reach for the Ceiling | Reach both arms up toward the ceiling. | Hold them there and breathe out. | slow hold ~6-8s |
| 4 | 2. Shoulder Rolls | Roll your shoulders up, back and down. | Go big and slow, a few times. | slow reps 4-5x |
| 5 | 3. Ear to Shoulder, right | Tilt your right ear toward your right shoulder, face forward. | Keep both shoulders down and let your head's weight do the work. | slow hold ~6-8s |
| 6 | 4. Ear to Shoulder, left | Now tilt your left ear toward your left shoulder. | Let the same weight do the work. | slow hold ~6-8s |
| 7 | 5. Look Over Shoulder, right | Turn your head to look over your right shoulder, body facing forward. | Keep your chin level, only as far as feels easy. | slow hold ~6-8s |
| 8 | 6. Look Over Shoulder, left | Now look over your left shoulder the same way. | Keep your chin level. | slow hold ~6-8s |
| 9 | 7. Chin Tuck | Stand tall, head level, eyes straight ahead. | Slide your chin back into a small double chin, then let go, a few times. | slow reps 4-5x |
| 10 | 8. Shoulder Blade Reach | Reach both arms out in front at chest height, palms facing away. | Push them forward and round your upper back. | hold ~6-8s |
| 11 | 9. Chest Opener | Clasp your hands behind your hips, arms straight. | Lift your chest and open your shoulders. | hold ~6-8s |
| 12 | 10. Side Bend, right | Reach both arms up and lean to your right. | Keep both feet planted and feel your left side stretch. | hold ~6-8s |
| 13 | 11. Side Bend, left | Now reach up and lean to your left. | Keep both feet planted. | hold ~6-8s |
| 14 | 12. Standing Extension | Put your hands on your lower back, fingers pointing down. | Arch back gently, knees soft, and look slightly up, only as far as feels easy. | slow reps 3-4x |
| 15 | 13. Standing Twist, right | Turn slowly and look behind you over your right shoulder. | Keep your feet planted and your hips facing forward. | hold ~6-8s |
| 16 | 14. Standing Twist, left | Now turn the other way, over your left shoulder. | Hips stay facing forward. | hold ~6-8s |
| 17 | 15. Shoulder Circle, right | Circle your right arm all the way around, elbow straight. | Go up past your ear and back, then reverse it. | slow reps 4-6 |
| 18 | 16. Shoulder Circle, left | Take your left arm out straight and circle it slowly. | Go up past your ear and back, then reverse it. | slow reps 4-6 |
| 19 | 17. Cross-Body Shoulder, right | Bring your right arm straight across your chest. | Hook your left hand above the elbow, right shoulder down. | hold ~6-8s |
| 20 | 18. Cross-Body Shoulder, left | Now bring your left arm across your chest. | Hold above the elbow, left shoulder down. | hold ~6-8s |
| 21 | 19. Tendon Glide, hook | Hold both hands up at chest height, palms facing you. | Curl your fingertips into a hook, then straighten, a few times. | slow reps 3-4x |
| 22 | 20. Tendon Glide, tabletop | Close both hands into a tight fist. | Open your fingers long, still bent where they meet your palm. | slow reps 3-4x |
| 23 | 21. Wrist Flexor, right | Hold your right arm straight out in front, palm up. | With your left hand, pull those fingers down toward you. | hold ~6-8s |
| 24 | 22. Wrist Extensor, right | Keep the right arm out and turn the palm down. | With your left hand, press the back of that hand down toward you. | hold ~6-8s |
| 25 | 23. Wrist Flexor, left | Now hold the left arm out in front, palm up. | Take those fingers in your right hand and draw them down. | hold ~6-8s |
| 26 | 24. Wrist Extensor, left | Keep the left arm straight and turn that palm down. | Press the back of that hand down toward you with your right hand. | hold ~6-8s |
| 27 | **POSITION: support, before the leg block** | Stand near the bed or a chair for the leg moves. | Rest a hand on it if you feel wobbly. | transition, ~4s |
| 28 | 25. Hip Flexor Lunge, right | Step your right foot well back, front knee bent. | Lift that back heel, press your hips forward, and squeeze the right glute. | hold ~6-8s |
| 29 | 26. Hip Flexor Lunge, left | Take the left foot well back, front knee bent. | Press your hips forward and squeeze the left glute. | hold ~6-8s |
| 30 | 27. Standing Hamstring, right | Set your right heel out in front, toes up, leg straight. | Bend your other knee, push your hips back, and feel behind the right leg. | hold ~6-8s |
| 31 | 28. Standing Hamstring, left | Put the left heel out in front, toes up, leg straight. | Push your hips back and feel it behind the left leg. | hold ~6-8s |
| 32 | 29. Standing Calf, right | Step your right foot back and press the heel flat down. | Bend your front knee, back leg straight, and feel the calf. | hold ~6-8s |
| 33 | 30. Standing Calf, left | Swap, left foot back, heel flat down. | Bend the front knee and feel the left calf. | hold ~6-8s |
| 34 | 31. Calf Raise | Rise onto your toes and lower, a few times. | Reach both arms up as you rise, or hold the bed. | slow reps 4-5x |
| 35 | **SAFETY, at the 31 to 32 seam** | The holds run longer now, so go slowly. | If a move hurts, come out of it and skip it. | spoken once, ~6s |
| 36 | **POSITION: onto hands and knees** | Kneel down, hands under your shoulders, knees under your hips. | Use a folded towel if the floor is hard. | transition, ~6s |
| 37 | 32. Cat-Cow Flow | Drop your belly toward the floor, neck long. | Then round your back up toward the ceiling, a few times. | slow flow 4-5 rounds |
| 38 | 33. Sit Down | Lower yourself down and sit on the floor. | Sit up tall with both legs out in front. | transition |
| 39 | 34. Butterfly Setup | Bring the soles of your feet together. | Let your knees fall open. | settle ~6s |
| 40 | 35. Butterfly Fold | Sit tall, then lean forward from your hips. | Keep your back long, only as far as feels easy. | hold ~6-8s |
| 41 | **POSITION: out of butterfly** | Bring both knees up, feet flat on the floor. | Sit tall, hands resting behind you. | transition, ~4s |
| 42 | 36. Seated Figure-4, right | Cross your right ankle over your left knee. | Sit tall until you feel it in your right hip. | hold ~6-8s |
| 43 | 37. Seated Figure-4, left | Now cross your left ankle over your right knee. | Sit tall and feel it in your left hip. | hold ~6-8s |
| 44 | 38. Legs Extended, Flex Feet | Stretch both legs out in front, hands by your hips. | Pull your toes back toward your knees. | hold ~6-8s |
| 45 | 39. Seated Forward Fold | Lean forward over your legs with your back long. | Slide your hands down your legs, knees soft, and stop where you feel it. | hold ~6-8s |
| 46 | 40. Cross-Body Knee Hug, right | Hug your right knee and pull it across to the left. | Sit tall and turn your chest to the left. | hold ~6-8s |
| 47 | 41. Cross-Body Knee Hug, left | Now pull your left knee across to the right. | Sit tall and turn your chest to the right. | hold ~6-8s |
| 48 | 42. Lie Down | Lie down on your back, legs long. | Let the floor take your weight. | transition |
| 49 | 43. Single Knee-to-Chest, right | Pull your right knee in to your chest. | Your other leg stays long on the floor. | hold ~6-8s |
| 50 | 44. Single Knee-to-Chest, left | Change knees and pull the left one in. | Same easy pull, and your shoulders stay down. | hold ~6-8s |
| 51 | 45. Double Knee-to-Chest | Bring both knees in. | Wrap your arms around your shins. | hold ~6-8s |
| 52 | **POSITION: arms open** | Let go of your shins and open your arms out wide. | Let your shoulders rest down. | transition, ~4s |
| 53 | 46. Windshield Wipers, right | Let both knees fall over to your right, knees together. | Keep both shoulders down and turn your head left. | hold ~6-8s |
| 54 | 47. Windshield Wipers, left | Roll both knees over to your left. | Keep your shoulders down and turn your head right. | hold ~6-8s |
| 55 | **POSITION: knees back to centre** | Bring both knees back to the middle. | Put your feet flat on the floor. | transition, ~4s |
| 56 | 48. Active Hamstring Raise, right | Lift your right leg up toward the ceiling. | Hold behind that thigh and keep the knee soft. | hold ~6-8s |
| 57 | 49. Active Hamstring Raise, left | Lower the right leg, then lift your left leg up. | Hold behind that thigh and let your head stay down. | hold ~6-8s |
| 58 | 50. Final Rest | Let your legs go long, arms by your sides. | This is the last one, so stay and let your breathing slow. | rest, remainder |

---

## THE SEATED POOL (the second pool, not a compromise)

The plain reader's CHECK 5 is structural: **23 of 50 move lines cannot be performed from a chair, eleven of them consecutively at the end.** No rewording of the standing lines fixes that, so the app swaps pools on the sitting-vs-standing setting. This is that second pool. Rows not listed here are spoken identically in both pools (the sweep's rule: moves 1 to 9, 13 to 24 and 31 work seated with no cue change).

**Gates on this pool, both exit 0:** `copy-density --budget 330` = 16 lines, 324 words, bridge share 18%, instruction density 100%, PASS. `copy-audit` = 16 PASS / 0 FAIL. Same two-sentence, 15-word, no-dash structure as the standing pool.

### A. Seated lines that REPLACE a standing line

| Standing row | Move | Seated line A | Seated line B | Source |
|---|---|---|---|---|
| 2 | POSITION setup | Sit tall with both feet flat on the floor. | Move slowly and keep breathing. | replaces "Stand up" |
| 9 | 7. Chin Tuck | Sit tall, head level, eyes straight ahead. | Slide your chin back into a small double chin, then let go. | sweep §3 move 7: "Sit **or stand** tall" |
| 12 | 10. Side Bend, right | Reach both arms up and lean to your right. | Slide your right hand down the chair leg as you lean. | sweep §3 move 10 seated alt |
| 13 | 11. Side Bend, left | Now reach up and lean to your left. | Slide your left hand down the chair leg. | sweep §3 move 11, mirrored |
| 14 | 12. Standing Extension | Put your hands on your lower back or the chair back. | Arch back gently and look slightly up. | sweep §3 move 12 seated alt |
| 27 | POSITION support | *(dropped: a seated user is already supported)* | | |
| 28 | 25. Hip Flexor Lunge, right | Stand up, hold the chair back, and step your right foot well back. | Press your hips forward and squeeze the right glute. | sweep §3 move 25: "**no true seated equivalent exists**, nearest desk option is this same standing lunge, using the desk or chair back for balance" |
| 29 | 26. Hip Flexor Lunge, left | Now take the left foot well back, front knee bent. | Press your hips forward and squeeze the left glute. | same, mirrored |
| 30 | 27. Standing Hamstring, right | Sit at the front edge of the chair, right leg straight, heel down. | Lean forward from your hips until you feel the back of that leg. | sweep §3 move 27 seated alt, HH-SEATHAM, BBPT-SEATHAM |
| 31 | 28. Standing Hamstring, left | Now put the left leg straight out, heel down, toes up. | Lean forward from your hips and feel it behind that leg. | same, other leg |
| 32 | 29. Standing Calf, right | Cross your right ankle over your left knee. | Take hold of those toes and pull them back toward you. | sweep §3 move 29 seated alt |
| 33 | 30. Standing Calf, left | Now cross your left ankle over your right knee. | Take those toes and pull them back toward you. | same, other leg |
| 34 | 31. Calf Raise | Lift both heels off the floor and lower them, a few times. | Keep your toes down and the same slow pace. | sweep §3 move 31 seated alt |
| 36-37 | 32. Cat-Cow Flow | Sit tall, then drop your belly forward and open your chest. | Then round your back the other way, a few slow times. | sweep §3 move 32: "or stay seated tall if that's easier today" |
| 44 | 38. Legs Extended, Flex Feet | Put both legs out in front, heels on the floor. | Pull your toes back toward your knees. | **ADAPTED** (sweep marks this floor-only; the dorsiflexion is identical on a chair) |
| 45 | 39. Seated Forward Fold | Sit at the front edge of the chair and lean forward over your legs. | Keep your back long and stop where you feel it. | sweep §3 move 39 seated alt |
| 58 | 50. Final Rest | Let your hands rest on your thighs, feet flat on the floor. | This is the last one, so stay and let your breathing slow. | **ADAPTED** from move 50 (same beat: rest plus slow breathing, HARV1) |

### B. Moves with NO seated equivalent at all (the honest list)

The sweep supplies no seated form for these, and none can be written without inventing technique. In the seated pool they are **absent**, not reworded.

- **Move 25, 26 (hip flexor lunge).** The sweep is explicit: sitting is what shortens the hip flexor, so there is no seated version. The pool offers the stand-up-and-hold-the-chair option above; a seated user who declines it simply skips both.
- **Move 33 (sit down).** Slot removed. A seated user is already sitting, and the chair offer that used to live in this spoken line is now the position setting's job.
- **Moves 34, 35 (butterfly setup and fold).** Floor only. Nothing on a chair reproduces soles-together hip external rotation.
- **Moves 40, 41 (cross-body knee hugs).** Floor only. The same glute and rotation target is already covered on a chair by moves 36 and 37 (figure-4), which the sweep marks as working on a chair unchanged.
- **Move 42 (lie down) and moves 43 to 49 (the whole supine block: two single knee-to-chest, double knee-to-chest, two windshield wipers, two active hamstring raises).** Floor only, nine consecutive moves. This is the eleven-in-a-row abandonment the plain reader found, and it is a real hole in the routine, not a copy hole.
- **The three POSITION rows that exist only to reach the floor** (rows 36, 41, 52, 55) are absent from the seated pool.

**What the seated user actually gets:** moves 1 to 24 (four of them swapped above), moves 27 to 32 seated, moves 36 to 39 seated, and the seated closer. About 35 beats against the standing pool's 50, ending on a line that says the session is over rather than running out of moves. **Owed to David:** the seated pool ends much earlier than the standing one, so the dose logic (the sweep's "first 6 / first 12 / first 24" checkpoints) needs a seated variant, and the setting should say plainly that the seated routine is the shorter one.

---

## LIST 1: every fix applied, by row

Row numbers: **v4** = this file's rows, **v3** = the plain reader's row numbers.

**The seven MISLEADING rows, all seven fixed**
1. v3 13 to v4 14 (move 12): the sweep's "**slightly**" restored on the head, "knees soft" added, "only as far as feels easy" restored. The dizziness position is now cued out twice.
2. v3 21 to v4 22 (move 20): "big knuckles" (no findable landmark) replaced with "still bent **where they meet your palm**", and "Open your fingers long" replaces "Straighten the fingers" so the tabletop can no longer collapse into a repeat of move 19.
3. v3 23 to v4 24 (move 22): the sweep's "**down**" restored, the pressing hand named ("With your left hand"), and "that arm" replaced with "the right arm". The founder's original wrist complaint is answered in the line itself.
4. v3 28 to v4 30 (move 27): the endpoint the gate rewrite deleted is back as "feel behind the right leg", plus the supporting-knee bend that makes the hinge happen. The first exposure now carries the sensation.
5. v3 33 to v4 35 and 36 (safety 2): "Down here" deleted. The safety line comes first, then an explicit line that puts them on the floor.
6. v3 34 to v4 36 and 37 (move 32): hands-under-shoulders and knees-under-hips moved into their own position row with a towel option, and the pronoun "it" replaced with "your back" so the round cannot invert.
7. v3 42 to v4 46 (move 40): the direction is named out loud on both sides. See LIST 2 item 1 for the adjudication, because my fix runs the opposite way to the report's reading.

**The five silent position transitions, all five closed**
8. v4 row 2 (new): "Stand up, feet hip width apart." Nobody was ever told to stand. The tempo and breathing rules moved here so the safety row could carry the exit.
9. v4 row 36 (new): "Kneel down, hands under your shoulders, knees under your hips." Placed after the safety line, so no line claims the floor before they are on it.
10. v4 row 41 (new): "Bring both knees up, feet flat on the floor." Unfolds the supporting leg between butterfly and figure-4.
11. v4 row 52 (new): "Let go of your shins and open your arms out wide." Releases the arms before the knees roll. This beat is the sweep's own KEEP'd draft move 45 ("arms open wide"), reinstated where it does work.
12. v4 row 55 (new): "Bring both knees back to the middle. Put your feet flat on the floor." Returns from the twist before a leg lifts, and defines what the other leg does for both raises.

**The four backwards mirrored pairs, all four turned around**
13. v4 5 and 6 (moves 3, 4): "Keep both shoulders down" moved to the FIRST side; the left is now the short echo.
14. v4 23 and 24 (moves 21, 22): "down" and the named hand now appear on the right side first, not only on the left.
15. v4 30 and 31 (moves 27, 28): the sensation endpoint now appears on the right side first.
16. v4 46 and 47 (moves 40, 41): the turn direction is stated on both, starting with the right.
17. Also repaired for standalone survival (CHECK 4): v4 18 (move 16) now carries the straight arm and the plane; v4 20 (move 18) names the holding hand and its location; v4 29 (move 26) carries the lunge shape without the word "lunge"; v4 31 (move 28) carries "toes up, leg straight".

**The safety lines**
18. v4 1 and 35: "ease off" and "back off" are gone. Both rows now give a real instruction: "If a move hurts, come out of it and skip it." Coming out and skipping are two actions a half-asleep person can perform.
19. v4 27 (new): a single support row covering the whole balance block. "Stand near the bed or a chair for the leg moves. Rest a hand on it if you feel wobbly." One row buys the support for the lunge, both hamstrings and both calves.
20. v4 34 (move 31, the toe rise): "or hold the bed" makes the overhead reach optional, because the arms-up version is the highest fall risk in the routine.
21. v4 36 (kneeling): "Use a folded towel if the floor is hard." The skip is already granted by the safety row two lines earlier.

**AMBIGUOUS rows fixed (the rest)**
22. v4 3 (move 1): the hold is named ("Hold them there"), so the arms stop falling.
23. v4 4 (move 2): "up, back and down" names the path.
24. v4 5 (move 3): "Tilt" replaces "Drop" and "face forward" stops the head turning instead of tilting.
25. v4 7 (move 5): "Turn your head" and "body facing forward" stop the whole torso rotating.
26. v4 9 (move 7): "head level, eyes straight ahead" stops the head tipping backward, the one neck direction PT guidance discourages.
27. v4 10 (move 8): "out in front at chest height, palms facing away" stops the palms landing on the bedroom wall.
28. v4 11 (move 9): "behind your hips, arms straight" stops the hands clasping behind the head.
29. v4 15 (move 13): "hips **facing** forward" replaces "hips forward", which move 25 teaches as a pelvic thrust.
30. v4 17 and 18 (moves 15, 16): "elbow straight" plus "up past your ear and back" fix the plane and the size.
31. v4 19 (move 17): "Hook your left hand above the elbow" stops the wrist crank; "right shoulder down" names which shoulder.
32. v4 21 (move 19): "at chest height, palms facing you" places the hands the founder's wrist complaint left floating.
33. v4 23 and 25 (moves 21, 23): "straight out in front" and "down toward you" fix both the arm position and the pull direction.
34. v4 26 (move 24): "with your right hand" names the presser.
35. v4 28 and 29 (moves 25, 26): "a lunge" is gone; "Step your right foot well back, front knee bent" is the shape in plain words.
36. v4 32 and 33 (moves 29, 30): "Bend your front knee" is what separates the calf stretch from the lunge, and loads the calf.
37. v4 38 (move 33): how to sit ("Lower yourself down") and where the legs go.
38. v4 40 (move 35): "hinge from your hips" (clinic language) becomes "lean forward from your hips" plus "keep your back long".
39. v4 43 (move 37): the left figure-4 gets the endpoint the right side had.
40. v4 44 (move 38): "hands by your hips" stops the hands pulling the toes.
41. v4 45 (move 39): "knees soft" replaces "let the knees bend", which cancelled the stretch, and the hands are given a job.
42. v4 54 (move 47): the head direction, missing on the left wiper, is restored.
43. v4 57 (move 49): "Lower the right leg" replaces a pronoun and clears the previous leg.
44. v4 58 (move 50): "This is the last one" ends the routine, which never said it was over.

---

## LIST 2: plain-reader findings NOT applied, and why

1. **Row 42's direction, applied the other way round.** The report reads "turn toward that knee" as wrong and v3's row 43 ("turn to the left") as the intent. The sweep's own line is "Sit tall and turn gently **toward that knee**", and its left-side line is "turn the other way", which on the mirrored side is again toward the knee. So v3's row 43 was the error, not row 42. Both v4 rows now name the direction explicitly and both turn toward the hugged knee. **Flagged for a PT in LIST 3**, because the report and the source disagree about the intended twist.
2. **Row 26's "how far back" as a measured distance.** Given as "well back". The sweep gives no distance, and inventing one ("a long stride", "two feet") would be inventing technique.
3. **Row 30's "shift the weight forward".** Not spoken as its own clause. "Bend your front knee" is the source's cue and produces the identical weight shift in one action.
4. **Rows 50 and 51's "what the other leg does".** Not added to the move lines. The new centre row (v4 55) puts both feet flat on the floor first, which defines the other leg's position for both raises and costs no words inside the moves.
5. **Row 35's orphan chair branch.** Not repaired inside the standing line. The chair offer was deleted from the spoken pool entirely, because the position setting and the seated pool now own the chair user; a chair branch that dies at "lie down on your back" is the bug, and repairing the sentence would have kept it alive.
6. **Row 34's "way out for knees" as a skip.** Given as a towel instead. Cat-cow is the single best-evidenced move in the routine for morning stiffness, so the pool offers a support first; the generic skip is already granted two lines earlier.
7. **Row 1's "the starting position for the whole routine" inside the safety row.** Moved to its own row rather than crowded into the safety line, which had to carry the pain rule and the exit in two sentences.
8. **Row 20's tabletop as a four-position clinical glide.** Only two positions are spoken (hook, tabletop), as in v3. Naming all four would take a third sentence, which the equal-lines law forbids.

---

## LIST 3: still unclear, needs David or a physical therapist

1. **The cross-body knee hug direction (moves 40, 41).** Source says turn toward the hugged knee; the plain reader read the intent as turning away from it. I followed the source. A PT should settle it. Both versions are low-risk, so this is an accuracy question, not a safety one.
2. **The seated calf stretch collides with the seated figure-4.** In the seated pool, moves 29 and 30 (ankle over the opposite knee, pull the toes back) put the user in the same position as moves 36 and 37 (figure-4). A seated user does ankle-over-knee four times in one routine. A PT should say whether to drop one pair or reorder them.
3. **The supine block has no seated answer.** Nine moves plus the final rest exist only on the floor. Either the seated routine is officially shorter (my recommendation, and what the pool does now), or a PT supplies chair-based substitutes for low-back release and supine hamstring work.
4. **"Glute" (moves 25, 26) is still the only near-anatomical word spoken.** It is the sweep's own word and plain gym English. David's call.
5. **Move 20's tabletop, the hardest line in the routine to perform blind.** "Open your fingers long, still bent where they meet your palm" is the best eyes-closed phrasing I found for the position. If a hand therapist has a better landmark, take theirs.
6. **The budget is saturated at 1049 of 1050.** Two execution words are still worth buying if the budget rises: "a few times" on move 20's glide (its twin has it, this one does not), and the sweep's "let your eyes lead" on move 13, which was cut as the second cue in a row that had to carry feet and hips.
7. **Device truth.** Nothing here is verified against a body. Both gates pass and the structure checks pass, but a stretch script's real test is an older or stiffer person performing it with their eyes closed, and that test has not been run.
