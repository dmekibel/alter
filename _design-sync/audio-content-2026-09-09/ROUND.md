# AUDIO + CONTENT ROUND — 2026-09-09 (David, voice note, Israel)

David verbatim: "Maybe having the birds and the ocean is a little overkill for being the default in the player. Also, I would wanna be able to control the volume of those things as well. The ocean is the only kind of regular sounding thing. The other two options sound bad. So I want you to give me better options for that. and also problem with audio like the stretching looping if the setting is too long instead we need more text to provide them. also gratitude copy sounds bad and i want more complex meditation text as well with more options"

## Diagnosis (read out of app.js, not guessed)
1. "birds and ocean" default = BED_DEFAULT ["birds"] (bed, David 2026-08-20) PLUS breathToneKey() default "ocean" (the breath guiding tone, also 2026-08-20). In any session with breathing both sound at once.
2. "the other two options sound bad" = BREATH_TONES glide + chord (synthesized oscillators). Ocean is filtered noise, which is why it is the only one that sounds natural.
3. Volume: voice + backdrop sliders exist in the settings card (both doors). The breath TONE has no slider (fixed ceil 0.055/0.06 into the bg bus). Beds play at a fixed 0.5 under the one bg slider.
4. Stretch: STRETCH_MOVES = 14 moves, stretchMoveSegs loops `i % 14` at PK.held 4s + ~4.2s speech = ~8s per move, so a 5-min dose repeats the routine ~2.5x.
5. Gratitude: three surfaces. GRAT_FLOW (the stack act, 4 prompts + 2 subs + build + close), gratitudeBeat (solo "Grateful Flow" beatRunner, 10 beats), STACK_CONTENT.gratitude.lines (DEAD in composeStackSegs; the gratitude branch runs before C.lines).
6. Meditation: MED_BLOCKS pools of 2-13 lines; MED_RETURN 4 cues. At ~11-19s absorb + 4.2s speech a 10-min Concentration sit needs ~21 breath lines and has 13, so the tail is MED_RETURN cycling. Solo picker offers 2/5/10 min, 5 lanes.

## Verdicts taken this round (David's words imply them; flip any in one line)
- Default bed OFF (voice only). Ocean breath tone stays as the breath's own sound. Existing saves that never picked a bed move to OFF; a human pick (S.audioBedPick) is untouched.
- Breath tones: glide + chord retired. New set = Ocean (kept) · Wind · Breath · Bowl (bowl.m4a swelled by the breath). Stored glide/chord migrate to ocean.
- New per-layer volume: Voice · Backdrop · Breath tone (S.audio.tone), live in both doors of the settings card.
- Stretch: pool grows to a ~48-move authored head-to-toe routine; the dose walks it once, holds grow to a cap before anything repeats.
- Gratitude: GRAT_FLOW + gratitudeBeat rewritten through the gates; dead STACK_CONTENT.gratitude lines retired.
- Meditation: every pool deepened + tiered (TMI / Shinzen / Harris / Headspace / Blackstone / Adyashanti MOVES, in ALTER's own words), MED_RETURN widened, new blocks + lanes, solo picker gains 15 and 20 min.
- New spoken lines get real clips (dave + millie) via _dev/gen-voice-11labs.py; RU stays honest-silent for them.

KB-SWEEP: (filled in by the sweep agents below; see KB-SWEEP-*.md in this folder)

## David, mid-round (2026-09-09, second message, verbatim)
"I gave you a lot of meditation inspirations including David spero and headspace and Sam Harris so maybe we can think of how to expand our meditation text copy and how to improve it. Same with gratitude ur making it too much like the tony robins tapping meditation but I want it alot more like the phill stutz tool or something in between"
- Meditation: expand + improve FROM his inspirations. On disk: Blackstone, Harris, Headspace (Andy), Adyashanti transcripts in `meditation-scripts/`. David Spero: NO file anywhere on disk; the July specs say "link pending from David" (HANDOFF-stacks-and-meditation §4c, GAMEPLAN-TOOLS-1000X). Heart/bliss stays on the shared metta + heart-coherence sources until he drops the Spero link/transcript into `meditation-scripts/`.
- Gratitude: spine = Stutz's Grateful Flow (raw: fieldguide raw-intake `phil-stutz_coming-alive/coming-alive.txt` p.211-212): name specific things silently, especially what you take for granted, bad things not happening allowed, slowly, never the same items (a slight strain is part of it); then STOP naming and feel the gratefulness as physical sensation from the heart; chest softens and opens. "Something in between" = that spine with a light savoring pace; the 10-beat cognitive ladder (see it / trace the cause / own your part / imagine its absence / the gap / return) is retired. Stutz's "Source / presence" language does not ship (science-content, esoteric-form law); attribution by name is fine.

## David, mid-round (third message, verbatim): "Don't convert anything to audio without me approving the copy first"
LAW for this round and onward (memory `no-audio-without-copy-approval`): the stretch / gratitude / meditation lines go to David as a review doc first. No gen-voice run, and no wiring of unapproved spoken lines into app.js. The engine changes (bed default off, tones, tone volume, stretch composer) carry no copy and ship now.

## David, mid-round (fourth message, verbatim): "I don't want any sound to sound like a siren because that will give people anxiety."
NO-SIREN LAW. A siren = a pitch that RISES and FALLS on a repeating cycle, especially with a narrow, resonant, wailing timbre. That is structurally what a breath guiding tone does (it tracks the breath), so this is a real constraint on the new tone set, not a style note. Rules for every tone and cue in the app:
1. No pitched glide across the breath. `BREATH_TONE_SPAN` for any pitched tone goes to 0: pitch stays FIXED, the breath is carried by loudness and filter opening only. (This is already how `ocean` behaves, which is exactly the one David calls "the only regular sounding thing".)
2. Prefer noise and recorded material over oscillators. Ocean, wind, breath = filtered noise; bowl = a real recording. No sawtooth, no square, no narrow-Q resonant sweeps.
3. Filter Q stays low (about 0.4 to 0.8): a high-Q sweep is a wail even on noise. Keep the movement slow (setTargetAtTime, no fast automation).
4. Nothing periodic and attention-grabbing: no two-tone alternation, no fast tremolo, no repeated ascending figure.
5. `glide` and `chord` (the retired oscillator tones) are exactly the siren family. Their retirement is now doubly justified; do not revive them.
Applies to breath cues and reward chimes too: a single soft strike decays, it never sweeps.

## INCIDENT — 10 unapproved clips synthesized, then reverted (2026-09-09, same session)
While proving that the new stretch pair-flag had not broken the voice-clip extractor, I ran `python3 _dev/gen-voice-11labs.py` bare. Its default mode is `all`, so it began synthesizing immediately: 10 mp3s in `assets/voice/dave/` plus a manifest rewrite (10 keys added, 10 removed). A second run happened when a first attempt at a guard let `--list` fall through to synthesis (11 more files). Both were killed and fully reverted: `git checkout` on the manifest, the untracked mp3s deleted, `git status assets/voice` is clean. Nothing shipped, and no unapproved line is in any bank.
FIX, in place and proven: both `_dev/gen-voice.py` and `_dev/gen-voice-11labs.py` now carry a COPY-APPROVAL GATE as their first executable statement, before the API key is even read. A bare run exits 1 with "REFUSED: no audio until David has approved the copy." Audio needs `--approved` (or `COPY_APPROVED=1`), which is David's verdict expressed as a flag.
NOTE for a later round (not acted on): that aborted run showed the dave manifest drifting from app.js by 10 keys in each direction, meaning some spoken lines changed text at some point without a regen and are playing silent today. Worth an audit once this round's copy is approved (`DEV.auditVoice` covers the same ground in-app).

## Gate results (all three surfaces, 2026-09-09)
| surface | lines | Gate 1 | Gate 2 (fresh anchor judge) | fixed by me |
|---|---|---|---|---|
| stretch | 49 moves | exit 0 | 43 PASS / 5 REVISE / 0 KILL, plus a structural find: `n` could cut between a move and its other side | all 5, plus the pair-flag mechanism in the composer |
| gratitude | 25 | exit 0 | 21 PASS / 4 REVISE / 0 KILL | all 4, incl. an unverified "first gratitude study" claim and one near-verbatim Stutz phrase |
| meditation | 191 new | exit 0 | ~170 PASS / ~19 REVISE / 3 KILL | all 15 ranked items, incl. 3 lifted lines and a missing exit in `embody` |

The copyright test is what earned Gate 2 its keep here: the writer's own self-audit flagged the mildest `embody` line and MISSED the two sharpest lifts (Adyashanti's "let it know it's irrelevant" and Headspace's "do whatever it wants"), exactly where the pivot predicted risk would concentrate. Grep-verified gone after the fix pass.

## Where this round stands
- SHIPPED (v1423, no copy): bed default off · the tone set + the no-siren law · the tone volume slider · the stretch composer and its pair rule.
- AWAITING DAVID (no audio, not in app.js): the 348 lines, published for his verdict at https://claude.ai/code/artifact/4159ed1f-5670-4bc9-ae73-262b4981b155 (db-backed; read his verdicts with `read_db` on `verdicts`).
- THEN, in order: wire the approved lines into app.js, append every kill to `_specs/COPY-ANCHORS.md` with its pattern, run `gen-voice-11labs.py all --approved` for dave + millie, ship.
