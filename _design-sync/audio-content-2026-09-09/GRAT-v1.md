# GRAT-v1 — gratitude copy, Stutz spine (2026-09-09)

**Header (5 lines).**
1. **Jobs, in order (solo flow):** settle · name one small specific thing, slowly · keep naming, never a repeat, the strain is the tool · name a bad thing that is not happening · reach for one never named · stop naming and put attention on the physical gratefulness in the chest · let it build with nothing added · come back plainly.
2. **Mechanism change:** the coached cognitive ladder is GONE (see it clearly / trace the cause / own your part / imagine its absence / notice the gap / let it return). That ladder was the Robbins-priming feel David rejected, and its load-bearing claim (mental subtraction "makes the mind register it as a gift again") had **zero source anywhere on disk** (KB-SWEEP §B4) while shipping as settled fact three times. New spine = Stutz's Grateful Flow: silent naming of specific taken-for-granted items (bad things not happening count), slowly, never the same ones, a slight strain is part of it, then stop naming and feel the gratefulness itself from the chest and let it build.
3. **Evidence now cited:** only Emmons + McCullough (2003, the first gratitude study) and Emmons's entitlement/take-for-granted framing, both verified in-source. Stutz's "Source" / "presence approaching" / "higher force" wording does not ship; naming the tool as his, plainly, does. No IgA figure, no savoring number, no unnamed "researchers."
4. **Register:** eyes-closed guided voice, second person, present tense, short declaratives, zero images, zero questions, zero exclamation marks, zero em-dashes, zero ellipses, no "we" fillers, no lesson at the end. Fewer beats (10 → 8), more silence. Copyright pivot honored: technique reproduced, no Stutz sentence reused.
5. **Gates:** Gate 1 `python3 _dev/copy-audit.py --file _design-sync/audio-content-2026-09-09/grat-lines.txt` → **exit 0, 25/25 PASS**. Self-check run against all 16 named KILLED patterns in `_specs/COPY-ANCHORS.md` (notes at the bottom of this file); the single unambiguous KILLED match in the old set (beat10's sweeping "Most days are quietly full like this" + the tidy reversal) is deleted outright.

**Timing.** The 8 holds are `10 + 20 + 24 + 20 + 20 + 32 + 32 + 12 = 170s ≈ 2:50`, and with the intro card that is the tool's advertised 3 min. Note the engine semantics: `beatRunner` starts the `hold` timer at the same tick it calls `say()`, so **hold includes the spoken clip**, it is not silence added after it. Each "lab. sub" clip runs ~5 to 7s at `VPROF.relax`, so the actual silences are roughly 5 / 13 / 17 / 14 / 14 / 25 / 25 / 6 seconds. The brief's parenthetical holds (5/12/14/10/10/16/16) were silence targets; taken literally as `hold` values they would run the whole tool in ~1:30 against a tag claiming 3 min. The two feeling beats carry the longest silences on purpose (KB-SWEEP §B5: HRV coherence needs several breath cycles, and Stutz treats the felt step as the mechanism, not the garnish).

---

## RETIRED SPOKEN LINES — drop these 16 clips from the warm list

None of the new lines reuse an old string, so every hash below is orphaned.

**`GRAT_FLOW` (6 spoken):**
1. `Bring one good thing from today to mind. Something small and specific.`
2. `Now a person. Someone who made this stretch of life a little easier.`
3. `Now something your body did for you today, quietly, without being asked.`
4. `And one thing so ordinary you never think to thank it.`
5. `Now stop searching for things. Let the naming go, and just feel the gratefulness itself, building on its own.`
6. `Let that fullness stay with you as we go on.`

**`gratitudeBeat` (10 spoken, the engine speaks `lab + ". " + sub`):**
7. `Let your shoulders drop. you're just going to remember. nothing to solve here`
8. `One specific good thing from today. not a category. a moment: a look, a taste, five minutes that went right`
9. `See it clearly. where were you. who else was there. let the scene come back, not just the idea of it`
10. `How did this happen. someone's choice, a bit of luck, or something you did on purpose`
11. `Notice your own hand in it. you showed up, you asked, you stayed. that counts`
12. `Feel where it sits in your body. chest, jaw, hands. let it be warm there a moment longer`
13. `Now imagine today without it. it just never happened. picture that version of today, missing this piece`
14. `Notice the gap. flatter, quieter, something missing you can't quite name`
15. `Now bring it back. it happened. it's yours. feel the difference between the gap and this`
16. `Most days are quietly full like this. you didn't need a big day. you needed to notice this one`

The two old `GRAT_FLOW.subs` strings are screen-only (the stack engine passes `text` to the voice and `sub` to the screen), so they have no clips to retire.

---

## A. PASTE-READY — `var GRAT_FLOW` (replaces app.js ~19064)

The comment line directly above it asserts the old arc; replace it in the same paste.

```js
  // GRATEFUL FLOW (Stutz spine, David 2026-09-09: "a lot more like the phil stutz tool"): the stack gratitude section is a STRUCTURED timed arc, not a looping prompt pool. The listener NAMES silently; the voice only opens each step and gets out of the way. Order is Stutz's own: one specific thing, one you take for granted, a bad thing that is not happening, one never named before, one smaller still, then stop naming and feel the gratefulness itself in the chest. Technique from Phil Stutz's Grateful Flow (Coming Alive, pp. 211-212), phrased in ALTER's own plain words (copyright pivot). The old coached ladder (trace the cause / own your part / imagine its absence) is retired: David heard it as Robbins priming, and its mental-subtraction claim had no source on disk. Both gates passed.
  var GRAT_FLOW = {
    prompts: ["Silently name one thing you are grateful for. Something small and specific from today.", "Now one you would normally take for granted. Something that was already there before you woke up.", "Now a bad thing that is not happening to you. Name it the same way.", "Now one you have never named before. Take your time finding it.", "One more. Something so small you almost skipped it."],
    subs: ["Name it silently, to yourself.", "Slowly. Sit with each one before the next.", "Feel it before you move on."],
    build: "Now stop naming things. Put your attention on the gratefulness itself, where it sits in your chest.",
    close: "Stay with that a moment longer. Bring your breath back to normal, and stay with me."
  };
```

Engine note: `gN` is clamped to `min(prompts.length, ...)` and plays `prompts[0..gN-1]` in order, so growing the array from 4 to 5 only lengthens the longest slots. Each of the first four stands alone as a complete instruction for the 2-to-4-prompt slots; the fifth only ever plays fifth.

## B. PASTE-READY — `gratitudeBeat` intro + beats + lastLabel (replaces app.js ~18841 to ~18859)

The comment block directly above `function gratitudeBeat` still names Seligman's cause step, Koo & Wilson's mental subtraction, and Bryant on savoring. Two of those three are unsourced anywhere in the stores and none of the three is in the new flow; replace it in the same paste.

```js
  // Gratitude beat: hands-free timed beats, NO typing, no required taps (eyes-closed law — the typed Grateful Flow stays as the journal variant).
  // GRATEFUL FLOW rebuilt on the Stutz spine (David 2026-09-09: "I want it a lot more like the phil stutz tool"). The July version was a ten-step coached cognitive ladder (see it, trace the cause, own your part, imagine its absence, feel the gap, let it return) that David heard as Tony Robbins tapping-style priming, and its core claim (mental subtraction re-registers a good thing as a gift) had NO verifiable source in any store. Now: the listener names silently and specifically, slowly, never the same items twice (the slight strain of finding a new one is part of the tool), bad things that are not happening count too. Then the naming stops and the whole payload is the physical sensation from the chest, given the two longest holds in the run. Eight beats, more silence. Screen intro cites only Emmons + McCullough (2003) and names the tool as Stutz's. On beatRunner (intro card + hands-free holds + real neural clips). onDone/secs kept for the stack registry; beatRunner is beat-paced so secs is advisory.
  function gratitudeBeat(onDone, secs) {
    beatRunner({
      id: "gratitude", title: "Grateful Flow", logTitle: "Gratitude", catK: "love", color: "#ff5fa0", spark: 6, voiceProf: VPROF.relax,
      intro: { tag: "The Grateful Flow · 3 min · eyes closed",
        what: "This is the Grateful Flow, a tool from the psychiatrist Phil Stutz. You name things you are grateful for silently, one at a time, going slow enough to feel each one. Then you stop naming and stay with the physical feeling in your chest.",
        how: ["Name things silently, in your own head.", "Go slowly enough to feel each one.", "Count the bad things that are not happening too.", "Then stop naming and stay with what you feel in your chest."],
        why: "Robert Emmons, who ran the foundational gratitude study in 2003, named the obstacle as entitlement: you stop seeing what you already have. That is why the naming here stays specific and never repeats, and why Stutz puts the feeling itself in the second half instead of the list." },
      beats: [
        { lab: "Let your eyes close", sub: "shoulders down, jaw loose. nothing to name yet", orb: "out", hold: 10 },
        { lab: "Silently name one thing you are grateful for", sub: "something small and ordinary from today. go slow enough to feel it", orb: "", hold: 20 },
        { lab: "Keep going, and never the same one twice", sub: "if it takes a moment to find a new one, that is the tool working", orb: "", hold: 24 },
        { lab: "Now a bad thing that is not happening", sub: "a problem you do not have today. count that one too", orb: "", hold: 20 },
        { lab: "Now one you have never named before", sub: "look past the easy ones. take a few seconds", orb: "", hold: 20 },
        { lab: "Now stop naming", sub: "drop your attention into the middle of your chest. whatever is there, stay with it", orb: "in", hold: 32 },
        { lab: "Stay right there in your chest", sub: "it builds on its own from here. there is nothing to add", orb: "in", hold: 32 },
        { lab: "Open your eyes when you are ready", sub: "no hurry. take one slow breath first", orb: "", hold: 12 }
      ], lastLabel: "Done ✓",
      onFinish: function (skip) { if (onDone) onDone(skip); }
    });
  }
```

`lastLabel` is unchanged. It is a button label, not spoken copy, so it is deliberately absent from `grat-lines.txt` (the check glyph would trip copy-audit's app-wide emoji regex, which does not apply to UI chrome).

---

## SELF-CHECK vs every KILLED pattern in `_specs/COPY-ANCHORS.md`

| Pattern | Verdict |
|---|---|
| 1 FORCED / DECORATIVE ANALOGY | Clear. Zero images in the whole set. The only figurative phrase is "walk past" (worn-plain, screen only). |
| 2 WITHHOLDING TEASE | Clear. The intro names the tool and its author in its first clause; no beat promises a reveal. |
| 3 FLOURISH-ENDING | Clear. Every line ends on a body noun, a number, or an instruction. The old build's "building on its own" tail is gone; the new equivalent ends on "in your chest" / "nothing to add". |
| 4 ESSAY / STIFF CADENCE | Clear. Read aloud, all spoken lines are sayable; no announced explanations, no list-cadence. |
| 5 MEDITATION-MADNESS | Clear. Stutz's Source / higher force / presence-approaching layer is dropped entirely per KB-SWEEP §B9. |
| 6 VAGUE PRONOUN | Clear. Every "it" has its antecedent in the same or previous clause. The old "something missing you can't quite name" is deleted with its beat. |
| 7 GENERIC-CATEGORY BEAT | Clear. No "feel the warmth", no "your head clears". Each beat names a specific target: silently, small, a bad thing not happening, never named, the middle of the chest. |
| 8 SHALLOW | Clear. Three non-obvious ideas carried: absent negatives count, a new item every time and the strain is the mechanism, the naming is only the setup. |
| 9 CHEESY / MOTIVATIONAL | Clear, and this was the old set's one unambiguous match. Beat10's sweeping "Most days are quietly full like this" plus "you didn't need X. you needed Y." is deleted; the new land beat is a plain instruction with no lesson. |
| 10 ASSUMED CONTEXT | Clear. Nothing references history the app has not established. |
| 11 VAGUE AUTHORITY | Clear. Emmons and McCullough by name with the year; Stutz by name with his profession. No "researchers", no "studies show". |
| 12 CROSS-SENTENCE SWITCHEROO | Clear mechanically (Gate 1 zero-tolerance regex) and by eye. |
| 13 PARAPHRASE-DRIFT | Inverted here per the COPY-ANCHORS scope amendment: Stutz is a living copyrighted author, so no sentence of his is reused. Technique only. |
| 14 OVER-COMPRESSION | Clear. Every line parses on one read; the longest spoken clip is 112 characters. |
| 15 SCIENCE-HINT-WITHOUT-NUANCE | Clear, and this was the old set's biggest evidence gap. The unsourced mental-subtraction claim is removed from all three places it appeared (`intro.what`, `intro.how[3]`, beat7). |
| 16 UI-INVENTORY COPY | Not applicable; no surface is introduced by listing its containers. |
| The "we" filler (KB-SWEEP §D3) | Fixed. Both "then we'll go on" and "as we go on" are gone; no first-person plural anywhere. |
| Coy metaphor-question (2026-08-11) | Clear. Zero question marks in the set. |

KB-SWEEP: `_design-sync/audio-content-2026-09-09/KB-SWEEP-gratitude.md` (consumed in full) · `fieldguide/knowledge-base/raw-intake/phil-stutz_coming-alive/coming-alive.txt` L7255-7280 (the raw tool, read direct) · `_specs/SCRIPT-ENGINE.md` · `_specs/COPY-ANCHORS.md` (full) · `_specs/VOICE-BIBLE.md` · `_specs/WRITING-SYSTEM.md` · `_specs/voice-foundry/CLERK-david.md` (full) · `app.js` (`GRAT_FLOW`, `gratitudeBeat`, `beatRunner`, the stack composer's `GRAT_FLOW` consumer, `STACK_CONTENT.gratitude`) · `_dev/copy-audit.py`.
