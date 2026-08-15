# IZO Russian voice bank — audit done, build spec (2026-07-22)

**Goal:** full Russian ElevenLabs bank with the new `izo` voice, same shape as `assets/voice/dave/` + `millie/`. Audit of ALL Russian lines is DONE (this session, Fable + cheap-agent gates). Build + generation = OPUS session.

## What exists
- **izo voice is live** in the ElevenLabs account: voice_id `anctA7r7S5Wnb0Ztqlos`, language tag `ru`. Key in `_dev/.env` works (verified via /v1/voices).
- The spoken-line universe = 501 unique lines (the exact extraction `_dev/gen-voice-11labs.py` uses; dave/millie each have 500 clips).
- Old RU audio = free edge-tts DmitryNeural clips in the ROOT `assets/voice/` (from `_dev/gen-voice-ru.py`), keyed by hash of the RUSSIAN text. The app maps EN→RU through the I18N.ru dict before hashing when lang=ru, then falls back to root for anything a gender bank lacks.

## Audit findings (the headline)
Of 501 spoken lines:
- **241 had a Russian translation** in the dict. **25 of them FAILED QA** → fixed. Real catches: EFT tapping point said «висок» (temple) for "side of the eye"; «Всё ещё работая» (fragment); «доказательства, которые ЗАКАНЧИВАЮТ» (nonsense calque); «закрытие нарочно»; impersonal garble in the PM-close mantra.
- **260 had NO translation at all** — the entire PMR sequence, gratitude flow, hypnosis descent, DAY1 lessons, HeartMath, MED_RETURN pools, stack cues. They'd be silent in RU. All 260 translated fresh this session, then gated.
- **12 of the 260 drafts FAILED the gate** → fixed (e.g. «застрявшесть» invented noun, «Сердце выше по течению» river calque, one genuinely garbled line).

**Master file: `_specs/ru-voice-izo-lines.json`** — all 501 lines: `{i, en, ru, status: existing-ok|existing-fixed|new|new-fixed, ru_old (pre-fix), why}`. This file is the single source for both the dict update and the generation run.

### The QA machinery (reusable — this is the "clever way")
Blind back-translation gauntlet, all cheap-model (sonnet) agents, 18 total:
1. **Blind pass:** fresh agent sees ONLY the Russian, judges it as spoken audio (natural? confusing? вы-register? calque?), back-translates to EN.
2. **Verdict pass:** second agent compares original EN vs the blind back-translation + flags → PASS or FIX with corrected line.
3. Deterministic sweeps on the merge: вы-register regex (0 leaks), gender-form scan.
New lines ran draft → blind → verdict. Judges never see what the author intended — that's what kills rubber-stamping. Rerun this pipeline for any future locale/copy batch.

## GENDER = two independent axes (do NOT conflate)
David asked "record for male and female, separate, based on onboarding?" There are TWO different gender axes and they are NOT the same thing:

- **AXIS 1 — USER gender (the listener).** Russian morphology: 70 of 501 lines change form by who is being addressed/who is speaking as their own inner voice — «ты пришёл»/«ты пришла», «я сам решаю»/«я сама решаю», the whole EFT «застрял»/«застряла» family, the mantras, the graduation letters. This is a TEXT problem, NOT a voice problem: the same male izo voice speaks both forms. The other **431 lines are gender-neutral** (imperatives «почувствуй», counts, descriptions). Onboarding ALREADY captures this: `d2.gender` → `P.gender` = 'm'|'f'|'x' (screen at app.js ~5429, "How should I address you?" He/She/Doesn't matter). So the app already knows the listener's gender — nothing new to ask.
- **AXIS 2 — VOICE gender (who speaks).** izo is a MALE voice. A female Russian voice = a separate ElevenLabs voice_id + its own full bank, exactly like the English dave/millie split. Independent of Axis 1: a female voice ALSO needs the 70 user-gender variants.

Classification is done and merged into the master file: each line carries `gender: NEUTRAL|USER|VOICE`, and every USER line carries `ru_f` (female-user variant) — plus `ru_x` on the 3 lines where a clean neutral rewrite exists. VOICE lines: 1 (a self-referential guardian form).

### Clip economics
- Flat, one gender globally (old plan): **501 clips**, but mom/girlfriend hear male forms = the bug David flagged.
- **Gender-aware, one izo voice: 431 shared + 70 male + 70 female = 571 clips.** Solves it for +70 clips. `P.gender==='f'` picks the `ru_f` hash at playback; 'm'/'x' → male. RECOMMENDED.
- Add a female voice too (Axis 2): another 571 clips in `assets/voice/<femaleRU>/`. Optional, later, like millie.

### Runtime pick (fits the existing hash architecture perfectly)
The bank keys by hash-of-RU-text. For a USER line, resolve `ru` vs `ru_f` by `P.gender` BEFORE hashing → different hash → different file, no collision. The generator emits BOTH clips for each of the 70 USER lines; neutral lines emit once. Zero new architecture — just a gender branch in the resolver + generator.

## Open verdicts for DAVID (native-ear gate above the agents)
1. **Skim the fixes:** all `existing-fixed` + `new-fixed` entries in the master file (37 lines, each has `ru_old` + `why`). Kill/keep per line.
2. **Female voice? (Axis 2):** ship the one male izo voice now (gender-aware text handles mom), OR also record a female RU voice as a user-pickable option like millie. Recommendation: izo-only now, female voice later if a persona wants it. EVIDENCE: mom = RU persona per day-one contract; girlfriend = key reels-addicted persona.
3. **"Doesn't matter" default:** `P.gender==='x'` → male forms (Russian unmarked). 3 lines have a natural neutral `ru_x` if we ever want true neutral for 'x'; not worth the split now.
4. **"Stuckness" tapping family:** A-fix says «чувство, что я застрял», B-fix says «чувство застревания» — pick one family wording (lines i151/152 + 1203/1204).

## DELIVERY / EMOTION — the Robbins question (David 2026-07-22)
**Today we use NONE of ElevenLabs' delivery controls.** `gen-voice-11labs.py` sends `eleven_multilingual_v2` with ONE flat `voice_settings` (stability .55, style .15, speaker_boost) for ALL 501 lines. A whispered hypnosis descent and a fierce tapping shout get identical direction. That is the whole gap David named.

**Probed live on izo (2026-07-22), all confirmed working on this account + this voice:**
- **v2 per-profile `voice_settings`** — stability / style / speed shift delivery hard. Low stability + high style + faster = conviction/energy; high stability + low style + slower = calm/breathy. No text changes, works in the proven pipeline.
- **`eleven_v3` + inline audio tags** — izo accepts `[calmly, softly]`, `[breathes]`, `[determined, energetic]`, `[emphatic]` and renders them (v3 clips came back ~40-70% larger = real added expression/pauses). This is the true "coach" lever: per-line emotional direction, the closest thing to directing Tony Robbins vs a hypnotherapist.

Demo A/B/C synthesized to `_dev/…/voicedemo/` (calm line + energy line, each: A flat-current · B v2-tuned · C v3-tagged) for David's device ear.

### The content is NOT one register — profile map (lines already self-identify by pool)
- **CALM** (hypnosis descent, body scan, MED_RETURN, relax): slow, breathy, long pauses. v2: stability↑ style↓ speed .88. v3 tags: `[calm][softly][breathes]`.
- **CHARGE** (tapping "Bring it on!"/"Pain sets me free!", forward-motion, identity): punch, rising conviction. v2: stability↓ style↑ speed 1.05. v3 tags: `[determined][building energy][emphatic]`.
- **WARM** (PM close, gratitude, graduation letters): intimate, steady, unhurried. v2: mid stability, gentle. v3: `[warm][gentle]`.
- **PLAIN** (breathe-in/hold, stretch cues, counts): clear, neutral. flat-ish is fine.

Each line gets a `delivery` tag in the master file (derivable from its source pool); generator picks settings/tags per profile. **Zero app changes — all in the generator.**

### Delivery options (David picks after hearing the demo)
- **A. Flat (today)** — reject, it's the current dullness.
- **B. Per-profile v2 settings** — 4 profiles above, tag every line by pool, one setting-dict per profile. Big lift, low risk/effort, proven model. The floor.
- **C. v3 + audio tags, whole bank** — best expressiveness; but v3 is newer/more variable (needs a regen-and-gate pass like we did for copy), every line needs tags authored (cheap-agent-able), and confirm the v3 credit multiplier before a 571-clip burn.
- **RECOMMENDED — hybrid:** B as the floor for all 571 clips, then C (v3 + tags) ONLY on the ~40-60 "performance" lines where delivery IS the point (tapping charges, the 10→1 descent, the graduation letters). Best ratio; contains v3's variability to the lines worth re-gating.

CAVEAT (constitution truth rule): none of this is device-verified for FEEL until David hears it. The demo exists for exactly that.

## OPUS build plan (one session, in order)
1. **Apply the dict changes to app.js I18N.ru:** update the 25 fixed values, add the 260 new EN→RU pairs (this also upgrades RU *display* text, not just voice). No SCHEMA/state impact — dict is code. Ratchets must stay green.
2. **`_dev/gen-voice-izo.py`:** clone gen-voice-11labs.py but:
   - EN→RU resolve like gen-voice-ru.py (dict + composed-halves), then key by hash of the RU text.
   - **norm MUST be `[^a-z0-9а-яё]`** (gen-voice-ru.py's). The EN-only norm strips all Cyrillic → every line hashes to the SAME key → one file overwritten 501 times. This is the one landmine.
   - `OUTDIR=assets/voice/izo`, per-voice manifest, VOICE_ID `anctA7r7S5Wnb0Ztqlos`, model `eleven_multilingual_v2`, same voice_settings as dave.
   - **Gender-aware:** drive generation from `_specs/ru-voice-izo-lines.json` (not raw dict scrape) so the fixes + gender split are authoritative. For each USER line synth BOTH `ru` and `ru_f` (two hashes); NEUTRAL/VOICE lines once. Manifest holds all 571 keys.
   - **Runtime resolver:** add a gender branch — for a line in the USER set, if `S.profile.gender==='f'` hash `ru_f`, else `ru`. Wire it where vhash(ru) is computed for playback.
3. **Hash-parity check BEFORE the burn:** dict has duplicate keys with different values ("Spark": «Искр» vs «Искры»). The generator's EN→RU resolution must match app.js's runtime translator resolution or clips silently miss. Verify ~20 sampled lines: app-side vhash(ru) == generator key.
4. **Wire `izo` into the bank picker:** `setVoice` whitelist is dave|millie (grep `@SEC` around app.js:154-187). Decide: auto-select izo when lang=ru, or a third picker option. Use the FIXED optimistic-switch path — the millie gvset race (open bug in the 07-19 handoff) must not be repeated.
5. **`sample` mode first** (10 lines) → David listens on device → then `all` (~501 clips, same credit scale as a dave run; log any credit top-up to LEDGER).
6. Preship + ship. Preview proves boot only; RU audio on device = DEVICE-UNTESTED until David confirms.
