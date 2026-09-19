# LANE: SPOKEN REGISTER, gratitude v9 (shrink-only pass on merged-v8-tagged)

**Job:** make it sound like a person talking and get to the point. Only shorten or make more spoken. No new idea, no new example, no new instruction, no reorder, no new slot.
**Test applied to every line:** read it out loud to one tired person at 7am with their eyes closed. If a real person guiding a friend would not say it that way, rewrite it the way they would.
**Governed by:** SCRIPT-ENGINE PART 7 (order of authority, provenance tags, budget, inert-bridge rule) · COPY-ANCHORS 2026-09-16 a/b/c (the clarity kills, the economy law, the book-sentence kill, the two-pause timing law).
**Note on the input:** merged-v8-tagged was edited on disk mid-round (the turn line now reads "We did that exercise..."). That newer state is what this lane worked from. It had drifted to 342 words, 2 over budget, so a shrink was required anyway.

## THE THREE COLUMNS

| # | the current line (v8) | v9 | what a human says differently |
|---|---|---|---|
| 1 | D. Now **we're** going to remind your brain and body how to feel gratitude. | D. Now **you're** going to remind your brain and body how to feel gratitude. | It is your body, not ours |
| 2 | D. ...After each one, **pause,** close your eyes, and try to actually feel what you just said. | D. ...After each one, close your eyes and try to actually feel what you just said. | Nobody lists three verbs aloud |
| 3 | D. ...a smile on a friend's face**,** or the sun hitting your face. | D. ...a smile on a friend's face or the sun hitting your face. | One breath, no comma pause |
| 4 | D. Now close your eyes**,** and try to actually feel that gratitude. | D. Now close your eyes and try to actually feel that gratitude. | Speech does not pause there |
| 5 | D. Okay, now **come up with** a new one. Something you'd normally take for granted. Your eyesight. Hot water. | D. Okay, now a new one. Something you'd normally take for granted. Your eyesight. Hot water. | People drop the obvious verb |
| 6 | D. Again, close your eyes and feel it. | kept | already exactly spoken |
| 7 | D. Come up with something completely new each time, instead of the ones that come automatically. That's what gets the logical side of your brain involved. | kept | his mechanism, his plain words |
| 8 | S. Now a problem you don't have. Those count too. | kept | permission beat earns its words |
| 9 | B. Close your eyes**,** and feel that one. | B. Close your eyes and feel that one. | Speech does not pause there |
| 10 | S. Now one from years back**.** Something you're still glad about. | S. Now one from years back**,** something you're still glad about. | One ask, one breath |
| 11 | **S\| D\|** Last one, and it's the biggest. You woke up this morning. You're alive. | **D\|** Last one, and it's the biggest. You woke up this morning. You're alive. | Tag fix, the words stand |
| 12 | D. Close your eyes**,** and stay with that one. | D. Close your eyes and stay with that one. | Speech does not pause there |
| 13 | D. ...Now try to feel that same gratitude **but** without a logical reason **behind it**. | D. ...Now try to feel that same gratitude without a logical reason. | His own ending, no tail |
| 14 | D. Put your hands on your heart if you like. | kept | action first, permission after |
| 15 | S. Stick to what you're truly grateful for. Skip what you think you should be. | kept | source says it best |
| 16 | S. If you felt almost nothing, that's normal **at first**. It gets stronger every time **you practice**. | S. If you felt almost nothing, that's normal. It gets stronger every time. | Reassurance is short or fake |
| 17 | S. **The next** time a dark thought **starts up**, run this on the spot. | S. Next time a dark thought starts, run this on the spot. | Nobody says "the next time" |
| 18 | B. **Stay with that, and keep breathing the way you are.** | B. Stay with the feeling. | Never instruct an automatic thing |
| 19 | B. Open your eyes when you're ready. | kept | the oldest closing line |
| 20 | U. In your head**, silently**. | U. In your head. | Same word said twice |
| 21 | U. Slowly. Feel each one. | kept | caption already at floor |
| 22 | U. A new one each time. | kept | caption already at floor |
| 23 | U. Grateful Flow | kept | the tool's name |
| 24 | U. List a few things you're grateful for and feel each one. Then the feeling on its own. | kept | both halves of tool |
| 25 | U. a tool from Phil Stutz | kept | attribution, nothing to cut |
| 26 | U. Wait for my tap after each one | kept | setting label, already plain |
| 27 | U. Off, **the practice** runs on a timer. On, nothing moves until you tap. | U. Off, **it** runs on a timer. On, nothing moves until you tap. | Pronoun where noun repeats |
| 28 | U. In a stack the pauses are always timed, so the session stays in one flow. | kept | settings note, reads clean |

## WHAT I DID NOT TOUCH, AND WHY

- **Line 7** reads slightly written ("instead of the ones that come automatically"), and the human version is "not the ones that come automatically". The copy-audit ZERO rule `negation-contrast` fires on any `, not <word>`, so the spoken fix is unshippable through Gate 1. Left as David dictated it. Same reason line 15 keeps "Skip what you think you should be" as its own sentence.
- **Line 3** keeps "face" twice. It is David's verbatim example and a person did say it out loud; the repetition is his, not a writer's.
- **Line 11** keeps "and it's the biggest". It is the only thing telling the listener this ask carries the climax, which is the structural verdict from 2026-09-16.
- **No line was deleted.** Per PART 7.5 the deletion pass is a separate job, and the slot order is load-bearing for the timing pass (two silences per item). This lane only shortened inside the existing slots.

## GATE RESULTS

**Gate 0, density** (`python3 _dev/copy-density.py --file ...lane-spoken-v9-lines.txt --budget 340`):
```
lines 28 · words 320 · budget 340
provenance: D 11 · S 5 · B 3 · U 9
instruction density 84%
7 ECHO warns (the "close your eyes and feel" refrain, deliberate)
PASS   (exit 0)
```

**Gate 1, tells** (`--strip` then `python3 _dev/copy-audit.py --file /tmp/v9clean.txt`):
```
28 of 28 PASS   (exit 0)
3 soft hits total, one per line: "actually" x2, "truly" x1 (all David's or the source's own word, kept deliberately)
```

**Constraints:** no em-dashes, no exclamation marks, no rhetorical questions, no emoji. "We" appears once, in the founder's own turn line. Longest line is 27 words (cap 32). Running order unchanged, no slot added or removed.

## FINAL WORD COUNT

**320 / 340.** Down 22 from the v8 state on disk (342, which was 2 over). 14 lines changed in wording, 1 tag fixed, 13 kept as they were.
