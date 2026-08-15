# SPEC — THE RITUAL ENGINE
**Date:** 2026-07-06 · **Status:** brainstorm → design doc (not built) · **Origin:** David's "take the candle/charge/reward-animation to its logical conclusion — condense the app's wisdom into gamified interactive magic-ritual tools that give people superpowers by helping them program their own brain."
**Anchors:** [[alter-voice-web-audio]] · [[alter-component-language-game-pieces]] · [[timeline-battery-principle]] · the sigil mechanic (`_mined/spiritual-canon/sigil-mechanic.md`) · [[alter-spiritual-progression-canon]] · [[no-random-features]]

---

## The thesis
The phone is not a screen for *reading about* rituals — it is a **ritual instrument**. Touch, haptics, audio, microphone, screen-light, gyroscope, and time-of-day are the candle, the bell, the wand, the circle. And the psychology is already on our side: a ritual *works* through (a) precise, controllable gestures, (b) an induced state, and (c) symbolic compression of intent — which is exactly the academically-grounded mechanism ("goal demotion" / performativity / self-hypnosis / priming; see the spiritual canon's honest-framing section). So the whole app can be re-expressed as: **which brain-programming protocols do we compress into which interactive ceremonies?**

The candle idea + the charging long-press + the reward colors/animation are *already* a ritual. This spec takes that to its logical conclusion.

**One-liner:** *Other apps have content you consume; ALTER has ceremonies you perform — and every performance measurably programs the performer.*

---

## The instrument palette (what the device gives us)
Each sensor is a ritual implement. Every one is honest tech doing real psychological work:

| Instrument | Device capability | The real mechanism |
|---|---|---|
| **The held press** | long-press + haptic ramp | commitment/charging — the thumb *feels* the vow (already canon in the first-run) |
| **The breath** | microphone (detect exhale) | blow out a candle / breathe life into a sigil — a real paced-exhale downregulates arousal |
| **The heartbeat** | haptic pulse, slowing | entrainment — the phone pulses *below* your pulse and drags you down with it (felt state-induction) |
| **The trace** | slow-drag gesture | drawing the sigil/circle yourself — motor encoding + IKEA effect beat passive viewing |
| **The flame** | screen-as-light + attention feedback | the candle guts when attention drifts; steady presence makes it swell → attention biofeedback |
| **The chalice** | gyroscope/accelerometer (stillness) | hold the phone perfectly still to "fill" it — physical calm, honestly measured |
| **The incantation** | voice (spoken intent) | saying it aloud makes it psychologically "true" for the speaker (performativity) |
| **The hour & the dark** | clock + dark UI | rituals that only exist at dusk/midnight/dawn — *circadian anchoring*, not FOMO |

---

## Example condensed rituals (wisdom → ceremony)
Each is honest tech + real psychology wearing a magic skin, and each is a **rep** that charges a sigil (ties to the tool-charging mechanic, `SPEC-PRODUCT-DESIGN-CORE`):

1. **The Candle Vigil** — *attention training (TMI stages 1–3), disguised.* A pixel flame; your steady gaze/touch keeps it lit; attention wanders → it gutters; you return → it swells. ~3 min = one vigil = one attention rep. The flame's color deepens across weeks as stability grows — **the TMI band rendered as fire.** *(Flagship prototype — see below.)*
2. **The Sigil Forge** — *Spare's full loop.* Type the intent → letters *smelt* into a glyph → charge it with breath-on-mic + held press as it heats ember→gold → it shatters into sparks and is "forgotten" (archived, never nagged). **The forgetting step built into the UI.**
3. **The Banishing Sweep** — *Hine's ritual bracketing → task-initiation medicine.* Before a hard timeline block, a 20-second circle-trace + one clearing breath that "resets the room." Directly targets the **ADHD activation gap** (the unsolved seam from the market research).
4. **The Reversal Rite** — *Stutz tools as spells.* The tool's steps as a 15-second animated sequence you *gesture through* (pain as a cloud you swipe *into*). Reps charge its sigil toward automatic.
5. **The Chalice of Stillness** — *somatic downshift / hypnosis-line rep.* Hold the phone still, breathe with the slowing haptic heartbeat; the chalice fills with light. A hypnotic-induction-ladder rep wearing a grail skin.
6. **The Evening Sealing** — *the PM bookend as sacrament.* The day's charged timeline compresses into one glowing rune; you name the day in a word and **seal** it with a press. The chronicle entry as ceremony; the return-hook as "tomorrow's page is already cut."

*(These map onto the psychograph lines: Vigil→attention, Chalice→hypnosis, Forge→magic/sigil, Sweep→magic/ritual-bracketing, Reversal→tools, Sealing→journey/chronicle.)*

---

## The three laws that keep it genius, not gimmick
1. **The ceremony must BE the mechanism.** The candle *is* attention feedback; the breath *is* downregulation; the seal *is* the reflection. Never decoration bolted on top of a form. (This is `no-random-features` applied to ritual.)
2. **Superpowers framing, honest content.** The pitch to the user is real: *"you're learning to steer your own state / program your own brain."* Every ritual's grimoire page reveals the *actual* mechanism one tap deeper — that labeling is the trust moat (the "2% of apps have evidence" differentiator).
3. **Rituals mature — the guardian hands you the wand.** Reps charge sigils; a fully-charged ritual becomes portable — eventually you perform the Banishing Sweep with *no phone at all*. The app taught you a ritual you now own. The ultimate `never-hands-over` move: it graduates you into doing it yourself.

---

## Build priority
**Prototype the Candle Vigil first.** Rationale: it is simultaneously (a) the **first rung of the attention line** (TMI stage 1–3, the most build-ready ladder from the mined canon), and (b) the **flagship demo of the entire thesis in one screen** — attention-as-flame, charge-as-color, ritual-as-mechanism. One screen proves: the ceremony-is-the-mechanism law, the sigil-charge visual, and the guardian speaking your progress back.

Then the Sigil Forge (proves the Spare loop end-to-end), then the Banishing Sweep (proves ritual-as-activation for the ADHD seam).

---

## Open questions
- **Fidelity vs. friction:** how elaborate before a ritual becomes a chore? (The Finch lesson: friction kills the struggling user. A ritual must feel *earned-quick*, not tedious.)
- **Which sensors on iOS PWA are actually reliable?** (mic, haptics, devicemotion have PWA permission/quirk constraints — device-test each; the constitution's "preview lies about gestures" rule applies doubly here.)
- **Escape floor:** every ritual needs the low-energy exit (the "I forgot" / relief-door path) — a ritual must never trap a depleted user.
- Ties into **the esoteric-visibility decision** (first-class vs opt-in) — some rituals (Chalice, Vigil) are universal; others (Sigil Forge, Banishing) are the "deeper practices" track.
