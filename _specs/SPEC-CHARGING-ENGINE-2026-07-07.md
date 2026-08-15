# SPEC — THE CHARGING ENGINE (Descend, Charge, Seal)
**Date:** 2026-07-07 · **Status:** design, validated on device. **Origin:** David tested the Candle Vigil and physically FELT the charge ("it feels like you're charging something, I actually felt it"). The candle is not the point; the CHARGING is. It becomes a reusable primitive under every tool.
**Governed by:** SPEC-ADAPTATION-SPINE, SPEC-RITUAL-ENGINE, VOICE-BIBLE, must-honor list. **Anchors:** [[alter-charging-primitive]] · [[alter-timeless-tools-and-monetization]] (the sigil-charge economy) · [[alter-profound-layer]] (identity-evidence) · [[alter-mission-scientific-grimoire]] (science-content).

## The core idea
**Charging = investment that gives an idea real felt strength.** The press-and-hold is not a loading bar; it is the physical act of investing an intention with emotion. Across the app the user charges things (intentions, mantras, future-self images), and what accumulates is a life's worth of installed, self-authored beliefs.

## The Dispenza blueprint (his system maps 1:1 onto the mechanic)
Dispenza's own words: **"the thought is the electric charge, the emotion is the magnetic charge."** Intention alone is inert; the emotion held on it is what invests it with strength. His sequence is exactly the ritual shape: get deep FIRST, then plant the future. So the engine is three beats:

1. **DESCEND (deep-state induction).** Guided slow breath at a resonance pace (~5.5 breaths/min) drops arousal and quiets the analytical mind, so the charge is always planted *from* a calm/coherent state. Optional short body-scan (his "blessing of the energy centers" made secular). Reuse the breathviz beat. The charge is gated behind this.
2. **CHARGE (the hold).** The user names one intention or future-self mantra (tappable options first, per tap-not-type), then **presses and holds** the sigil while summoning the *felt emotion* of it already being true (gratitude, pride, relief). The build-up is the electric thought and the magnetic emotion fusing. A steadier/longer hold = a stronger charge (optionally breath- or HRV-gated later). This is the vigil hold, generalized.
3. **SEAL.** Release locks the charged sigil. Carry it into the day (a token, a re-chargeable mark). Re-chargeable daily. This is the "installed future self."

**Tony Robbins priming is the same pattern, energizing mood:** ~30 energizing breaths (descend, but upward), then gratitude + visualization felt fully (charge), then an incantation said with the whole body on release (seal). Same engine, two moods: Dispenza calm-coherence vs Robbins energizing-peak. The app can offer both skins.

## The teach pattern (David's, few words)
Brief explain BEFORE (one line, what this is), then make you DO the charge rep, then explain a little MORE after (the metacognition, once you have felt it). Never a wall of text explaining the effect before the rep. Reps first, theory after (Conway-Smith, already the app's law).

## The honest framing (keep the effective mechanics, flag the mysticism)
Frame everything as psychology and neuroscience, placebo as a real usable tool, no woo up front.
- **KEEP and frame as science:** mental rehearsal / motor imagery (robust: imagining an action fires near-identical neural patterns, improves skill and confidence), placebo/expectancy (open-label placebos measurably reduce pain and distress, tied to belief in the ritual, not deception, this is the honest "placebo as superpower"), HRV / heart coherence (slow ~5.5/min breathing reliably raises HRV, lowers anxiety), priming/gratitude (a peak emotional state shifts subsequent behavior).
- **FLAG, poetic-UI-copy-only, never a claim:** manifesting matter, the "quantum field" responding to intention, the heart emitting an external field that draws your future, healing disease by thought alone (ethically and legally off-limits).
- **Framing (concrete, never a glib summary):** name the real thing the way you'd tell a friend. This is the rehearsal athletes and surgeons run before the real thing; the brain barely tells an intensely imagined rep from a lived one, so the felt charge is what makes it stick.
  - ⚠️ **Do NOT write reversal-aphorisms** like "measurable psychology, not magic" or "not X, just Y". That balanced X-not-Y cadence is a classic AI tell and it is banned by the copywriting rule-set (see `WRITING-SYSTEM` / VOICE-BIBLE). Say the concrete thing; skip the profound-sounding summary.

## The reusable charging primitive (the build)
Generalize the vigil's hold-charge into a shared component `chargeHold({ sigil, onCharged, target, gated })` that any tool can call: renders the mark, the press-and-hold, the ring fill, the earned charge, the seal. Then:
- The Candle Vigil = chargeHold with a flame (attention line).
- The Sigil Forge = descend, then chargeHold on a user-named intention, then seal-and-forget (Spare).
- The Dispenza rite = breathviz descend, then chargeHold a future-self mantra with elevated emotion, then seal.
- The Robbins prime = energizing breath, then chargeHold gratitude+visualization, then incantation seal.
All feed the sigil-charge economy (installed capacities = identity-evidence), monetized honestly (customization, not power).

## UX polish backlog (from the same device test)
- DONE v921: ease-in-out breath curve (was robotic), smoother candle flicker (layered sine, was jittery).
- TODO: playback controls on every tool (pause, rewind, fast-forward).
- TODO: match the mantra player's circle/UI quality (David: it "looks pretty good"); make the breath/charge visuals as polished.
- TODO: the candle animation can still be much better (higher-fidelity flame).

## Open decisions
1. Which rite to build first on the generalized `chargeHold` primitive: the Dispenza future-self rite, or the Sigil Forge? (Both are the same engine.)
2. Is the "descend" always required before a charge, or optional for quick reps?
3. Playback controls: build once as a shared beat-player control bar for runLesson and beatRunner both.
