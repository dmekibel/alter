# BRIEF — meditation text, deeper and with more options (David 2026-09-09: "more complex meditation text as well with more options")

This brief states JOBS and SHAPES, never candidate phrases (THE BRIEF LAW). The writer drafts; two gates judge.

## Inputs the writer loads IN FULL before drafting (no SOPs loaded = no drafting)
1. `_design-sync/audio-content-2026-09-09/KB-SWEEP-meditation.md` (the technique ladders per block, per teacher moves, re-anchor mechanisms, safety, lane proposals).
2. `_specs/SCRIPT-ENGINE.md` (all), `_specs/COPY-ANCHORS.md` (all, especially GUIDED-VOICE REGISTER LAW + SCOPE AMENDMENT), `_specs/VOICE-BIBLE.md`, `_specs/WRITING-SYSTEM.md`, `_specs/voice-foundry/CLERK-david.md` (sentence mechanics + dimension 12 tells).
3. The CURRENT content in app.js, which is the register to continue: `grep -n "var MED_BLOCKS = {" app.js` through `var MED_RETURN`, `grep -n "var MED_EXTRA = {" app.js`, `grep -n "var MED_SESSIONS = {" app.js`. The existing lines were David-accepted; keep them verbatim, extend around them. `meditation-scripts/` transcripts are RAW technique sources only: technique is free, expression is owned (no lifted sentences).

## What "more complex" means (David 2026-07-12, binding)
Not heady concepts. Subtler INSTRUCTION: more steps, finer checks, later tiers that only a longer sit reaches. Nuance ceiling = Harris / Adyashanti; language stays simple enough to talk to the subconscious. Sounding like any good teacher of the tradition is the target. Every line is a real instruction (what to do, or what to notice, or the correction when it goes wrong). Killed: mystical wash, flourish, metaphors that do not map 1:1, category beats, cheer.

## The engine facts that shape the lines (read out of app.js, do not re-derive)
- A block = `entry` (taught once, first) + `pool` (AUTHORED ORDER, each line said exactly once, basic to subtle). When the pool is spent the engine falls back to `MED_RETURN` cues. So the pool's ORDER is the ladder and its LENGTH is how long a sit stays guided.
- Pace: about 4.2s of speech + an "absorb" silence of 4s (guided) to 19s (spacious) per line. A 10-min sit on the spine block needs about 21 to 30 lines; 20 min needs about 40 with spacious gaps. Tier the pool so that the first third is foundation, the middle is working technique, the last third is subtle/effortless.
- `deep: true` blocks (self-inquiry) get 25 to 45s of silence per prompt.
- The last line of the LAST block of a lane is the closing line the engine always lands on.
- Lines are hash-keyed voice clips. No square brackets or double quotes inside a line. Keep lines under 160 characters. One instruction per line; two short sentences at most.

## Deliverable shapes (exact JS the builder pastes)
A. `MED_BLOCKS`: for every existing key (settle, breath, count, note, scan, listen, watch, feel, open, heart, look, close) the SAME object shape with the existing entry + existing pool lines kept verbatim and IN PLACE where the ladder allows, and new lines added to reach these pool sizes: settle 8, breath 28, count 12, note 20, scan 16, listen 10, watch 14, feel 12, open 20, heart 16, look 14 (deep), close 6.
B. NEW blocks in the same shape (name, ti = a Tabler icon class, c = a hex from the existing block palette, entry, pool): `embody` (name "Embody": inhabiting the body part by part, then the whole body as one continuous space; 20 lines), `free` (name "Free": a deliberate stretch of letting the mind do whatever it wants, then a return; 8 lines), `being` (name "Being", adv: resting as awareness, nothing to do, dropping the effort to understand; 16 lines).
C. `MED_RETURN`: widen to 12 cues, each a DIFFERENT mechanism for coming back (see the sweep's section D); keep the 4 existing ones.
D. `MED_SESSIONS`: keep the 5 existing lanes' block lists (you may add one block to a lane where the ladder clearly wants it); add `body` (name "Body", spine = embody), `being` (name "Being", spine = being, sub-line notes it is the quiet one), `reset` (name "Reset", beginner: settle, count, free, close). Each lane gets a one-line `sub` in the existing style (a plain description of what the lane trains, and the tradition tag after a middle dot, like the existing ones).
E. A `MED_SEC` addition line so the stack editor can pick the new sections: `embody: medView("embody"), free: medView("free"), being: medView("being")`.
F. The solo picker's minutes: `[["2 min", 2], ["5 min", 5], ["10 min", 10], ["15 min", 15], ["20 min", 20]]`.

## Procedure
1. Read the sweep; for each block write the ladder as a numbered list of technique moves FIRST (no prose), then write one line per move.
2. Draft. Every new line: what the listener does or notices; the correction where the sweep names one; plain, spoken, second person, present tense; contractions fine; no exclamation marks, no em-dashes, no ellipses, no rhetorical questions except in `look` where the inquiry IS a question.
3. Put every NEW spoken line (entries, pools, returns) one per line into `med-lines.txt` and run Gate 1: `python3 _dev/copy-audit.py --file _design-sync/audio-content-2026-09-09/med-lines.txt` until it exits 0.
4. Self-check every line against the KILLED patterns and against the copyright pivot (does it echo a specific teacher's sentence? then rewrite the technique in other words).
5. Write `MED-v1.md`: a header (line counts per block, the ladder tiers, which existing lines were kept verbatim), then the exact JS blocks A to F in the file's own style (two-space indent, `key: { name: "...", ti: "ti-...", c: "#hex", entry: "...", pool: ["...", "..."] },` one block per line as the file does, trailing comments allowed in the file's style naming the source ladder, e.g. `// tiered TMI find->cycle->sensation->effortless`).
G. Builder note (not the writer's job): `medEditor`'s `var ORDER = ["settle", "breath", "body", "aware", "heart", "rest", "bliss", "play"]` is the stack editor's "Add a section" pool; add `"embody", "free", "being"` after "heart" so the new sections are pickable. `being` carries `adv: true` like bliss/play.

## David's inspirations (his 2026-09-09 note: "I gave you a lot of meditation inspirations including David Spero and Headspace and Sam Harris")
On disk and to be used as TECHNIQUE sources: `meditation-scripts/style1-blackstone-fundamental-consciousness.txt`, `style2-sam-harris-mindfulness.txt`, `style3-headspace-andy-reset.txt`, `style4-adyashanti-resting-as-awareness.txt` (all read by the sweep). David Spero: NOT on disk (the July specs say "link pending from David"; nothing ever landed). Do not invent a Spero layer; the heart/bliss material draws on the shared metta tradition, `_mined/spiritual-canon`, and the fieldguide heart-coherence guide. Note in the MED-v1.md header that the Heart lane awaits his Spero source.
Improvement, not just expansion: where the sweep shows a current line is a weaker instruction than the ladder wants (vague, or two steps in one), you may replace it, but list every replaced line in the header so the builder retires its clip cleanly.

## Reconciliations after the sweep (binding, resolve them this way)
- The sweep's `rest` block is THIS brief's `being`. Use `being`. `rest` is already taken: `MED_SEC.rest` is a legacy alias for the `open` block and saved user tracks resolve through it, so a new block by that name would collide.
- ALSO build the sweep's `sleep` block (pre-sleep protocol, 14 lines) and `joy` block (12 lines). `joy` gives the orphaned `MED_EXTRA.bliss` and `MED_EXTRA.play` content a real tiered home; keep those two objects intact and unedited, `joy` is a new block beside them.
- The sweep found `scan`, `listen`, `watch`, `feel` are fully built but reachable from no lane. Your new lanes must give them a home (Body lane uses scan + embody; a Senses or Reset lane uses listen/watch/feel).
- `STACK_CONTENT.medit` / `STACK_CONTENT.meditate` is a SEPARATE simpler script used by the day-one stack. Leave it alone; do not orphan it.
- Lanes to deliver in `MED_SESSIONS`: the 5 existing (blocks may gain one block each) + `body`, `being`, `reset`, `sleep`. Each with weights and a one-line `sub`.

## NO AUDIO (David 2026-09-09, verbatim: "Don't convert anything to audio without me approving the copy first")
Never run `_dev/gen-voice*.py`. Your output is text for David to read and verdict. Do not edit app.js.
