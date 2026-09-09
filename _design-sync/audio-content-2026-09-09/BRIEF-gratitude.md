# BRIEF — gratitude copy rewrite (David 2026-09-09: "gratitude copy sounds bad")

JOBS and SHAPES only, never candidate phrases (THE BRIEF LAW). One draft, gated, shipped for David to hear on device; his rejects become KILLED anchors.

## Inputs the writer loads IN FULL before drafting
1. `_design-sync/audio-content-2026-09-09/KB-SWEEP-gratitude.md` (mechanism, the jobs per beat, why the current lines fail, David's voice features).
2. `_specs/SCRIPT-ENGINE.md`, `_specs/COPY-ANCHORS.md` (all), `_specs/VOICE-BIBLE.md`, `_specs/WRITING-SYSTEM.md`, `_specs/voice-foundry/CLERK-david.md`.
3. The three current surfaces in app.js: `grep -n "var GRAT_FLOW = {" app.js` (the stack act: `prompts` array, `subs` array, `build`, `close`), `grep -n "function gratitudeBeat" app.js` (the solo Grateful Flow: `intro` {tag, what, how[], why} + `beats` [{lab, sub, orb, hold}] + lastLabel), and `grep -n "gratitude: { intro:" app.js` inside STACK_CONTENT (DEAD lines; the builder deletes them, you do not rewrite them).

## Engine facts
- GRAT_FLOW in a stack: the engine speaks `prompts[i]` with `subs[i % subs.length]` shown on screen under it, each followed by a 15 to 26s silence; then `build` with a 24 to 40s silence; then `close` with a 4s beat that hands over to the next act. Item count scales with the slot (2 to 4 prompts). So prompts must work as a SEQUENCE of deepening asks and each must stand alone as an instruction.
- gratitudeBeat (solo): beatRunner shows `lab` big and `sub` small, and the voice speaks "lab. sub" as one clip. `hold` = seconds of silence after the beat; `orb` in/out pulses the orb. The intro card (`what`, `how`, `why`) is SCREEN copy read before the eyes close; it may carry the mechanism plainly (open-label law: mechanism before exercise, lead with what works, never warn).
- Lines are hash-keyed voice clips: no square brackets, no double quotes inside a line, under 160 characters, one action per line.

## DAVID'S DIRECTION (2026-09-09, second message; this outranks everything below)
"ur making it too much like the tony robins tapping meditation but I want it alot more like the phill stutz tool or something in between." The current solo flow is a ten-step coached cognitive ladder (see it, trace the cause, own your part, imagine its absence, the gap, the return). That is what he hears as Robbins-style priming. Retire that ladder. The spine is Stutz's Grateful Flow, technique read from the raw source (`/Users/Dmekibel/claudeCode/fieldguide/knowledge-base/raw-intake/phil-stutz_coming-alive/coming-alive.txt` lines 7255 to 7280; read it):
1. Silently name specific things you are grateful for, especially the ones you would normally take for granted. Bad things that are not happening count. Go slowly enough to feel each one. Never the same items as last time; a slight strain to find new ones is part of the tool.
2. Stop thinking. Put attention on the physical sensation of gratefulness, felt from the heart.
3. Let it build; the chest softens and opens.
"In between" means: that spine, with a light savoring pace (one item, a breath to feel it, then the next) and the specificity job from the evidence. NOT the cause-tracing, NOT mental subtraction (also unsourced on disk per the sweep), NOT a beat that tells the listener what the feeling means. Stutz's "Source" / "presence approaching" / "higher force" wording does not ship (science-content, esoteric-form law); naming the tool as Phil Stutz's, plainly, in the screen intro is fine and honest. The listener does the naming silently; the voice only opens each step and then gets out of the way. Fewer beats, more silence.

## Shapes to deliver
A. `GRAT_FLOW` (stack act): `prompts` = 5 spoken naming asks in Stutz's order (open the list with one specific thing; one you take for granted; one bad thing that is not happening; one you have never named before; one more, small), `subs` = 3 screen-only holding instructions (silently, slowly, feel it before the next), `build` = the stop-naming, feel-it-in-the-chest step (1 line), `close` = 1 line that hands over to the next act. Each prompt must stand alone as an instruction because the engine may play only 2 to 4 of them.
B. `gratitudeBeat` (solo): `intro` {tag under 60 chars; what = 2 to 3 plain sentences saying what the tool is and whose it is; how = 4 short imperatives; why = 2 sentences of mechanism in plain words, citing only what the sweep verified in-source}. `beats` = 8 beats: arrive (eyes close, shoulders drop; hold 5) · start naming, specific, slowly (hold 12) · keep going, new ones only, the strain is fine (hold 14) · a bad thing that is not happening (hold 10) · one you have never named (hold 10) · stop naming, feel the gratefulness itself in the chest (orb in, hold 16) · let it build on its own, chest soft and open, nothing to add (orb in, hold 16) · land (one plain line, no lesson, no reversal). Keep `lastLabel`. Each beat {lab, sub, orb, hold}; the voice speaks "lab. sub" as one clip so sub must read as a spoken continuation.

## Procedure
1. From the sweep, write the JOB of each beat in one line each (what the listener is doing at its end). No phrases yet.
2. Draft each line to do exactly that job in David's spoken register: short declaratives, second person, present tense, contractions, no images unless they map 1:1, no cheer, no "feel the warmth" category beat, no flourish endings, no rhetorical questions, no exclamation marks, no em-dashes, no "we" filler transitions.
3. Put every spoken line (prompts, build, close, and each beat's "lab. sub" joined) plus the screen lines one per line into `grat-lines.txt`, run `python3 _dev/copy-audit.py --file _design-sync/audio-content-2026-09-09/grat-lines.txt` until exit 0.
4. Self-check against every KILLED pattern (the sweep's section D names the current failures: the cheesy closing beat, "we" fillers, the soft flourish); rewrite offenders.
5. Write `GRAT-v1.md`: a 5-line header (the job list, what changed in mechanism), then the exact JS for `var GRAT_FLOW = {...};` and the full `gratitudeBeat` intro + beats objects in the file's own style, paste-ready.
