# THE ALTER ART IDENTITY — "Cel Glow"
**Date:** 2026-07-07 · Standing artifact, the art law. **Chosen by David:** bold cel (option 2) warmed with storybook softness (option 1). Every visual asset (the guardian, the flame, reward tokens, the game world, the lesson/ritual visuals, sigils) obeys this or gets rejected, the way copy obeys the WRITING-SYSTEM.

## THE SPINE: LIGHT
ALTER is one idea drawn over and over: **kindling and holding light in the dark.** The guardian is a spark inside a halo. The core mechanic is charging, investing light into a thing until it holds. The timeline is a battery that fills with light where you lived. The journey lights up. The candle is a flame you keep lit with attention. So the identity's through-line is light: **every element either emits light, holds it, or waits in the dark to be lit.** Light is the emotional accent and the reward signal across the whole app.

## THE FLAVOR: bold cel, glowing, with storybook warmth
- **Cel, not photoreal.** Confident forms with clean **ink outlines**, **flat cel-shaded color** (one base tone plus one or two shade/highlight steps, hard-edged, never gradient mush). Think a Ghibli or Zelda frame, or a modern animated game.
- **Glowing.** Anything lit gets a soft additive **bloom** around it. This is the signature and the reward cue: earned/charged/active things glow, dormant things sit in the dark.
- **Storybook warmth (the "some 1").** Soften the cel with a faint painterly grain and gentle, rounded shapes so it feels tender and hand-made, not cold or corporate. Warmth in the linework, not clinical vectors.

## BUILDS ON WHAT IS ALREADY LOCKED (do not discard)
- **Palette:** the dawn gradient (sky-blue to lilac to pink) and the domain colors (pink, blue, purple, yellow, gold). Ritual/game grounds are the deep **twilight-to-dawn** end of the same palette. Light accents are warm gold and white-hot.
- **The guardian mark:** the pink 4-point Spark inside the gold Halo, with the gold and blue companions. Draw the guardian and everything else in the same cel-plus-glow language as this mark.
- **Component language:** chunky solid domain-color pieces, ink borders, hard offset shadows, gold-ring selection. The cel style IS an extension of this, keep it.
- **Type:** Jost for UI, Tabler line-icons for functional icons. No emoji, ever.

## THE RULES (concrete)
1. **Linework:** every game/ritual object has a confident dark ink outline (warm near-black, not pure #000). Weight consistent across the app.
2. **Color:** flat cel fills from the locked palette. Limit each object to a small set of tones (base plus one shade plus one highlight). No smooth gradient fills on objects (gradients only for glow and grounds).
3. **Shading:** cel/hard-edged, one or two steps. A clear light direction (light comes from the flame/spark, so objects near light are warmer).
4. **Shadow:** the existing hard offset shadow on game pieces, keep it. It is part of the tactile-toy feel.
5. **Glow:** soft radial bloom (additive) on anything lit, charged, earned, or active. Gold/white-warm. Dormant things have no glow. This is the reward and state signal.
6. **Grounds:** twilight-to-dawn, deep and warm, so light reads against dark. Rituals happen in the dark where the light is the event.
7. **Texture:** a faint painterly grain for warmth, used sparingly. Never a realistic texture.
8. **Motion:** cel frame-steps for animated things (a flame steps through 6 to 10 hand-set frames, it does not smoothly tween), plus the existing Duolingo spring for UI. Stepped animation reads as hand-drawn; smooth tweening reads as generic.

## HOW EACH THING LOOKS
- **The guardian:** the Halo and Spark mark, cel-shaded, glowing, expressive (calm, proud, concerned, celebrating).
- **The flame (candle/vigil):** a cel torch, 6 to 10 hand-drawn frames, clean outline, flat warm fills, a soft glow bloom behind it, sitting in the circular frame. It grows and brightens with the charge.
- **Reward tokens / sigils:** cel game-piece chips and glowing line-marks; they light up (glow) the moment they are earned or charged.
- **The lesson / ritual:** interactive reps (like the Candle Vigil) on twilight grounds, one glowing focal object, minimal text, in this cel language. This replaces the spinning-rays text ceremony.
- **The game world:** a warm cel storybook world, lit pockets in soft dark.

## THE DON'TS
No photoreal. No smooth gradient-mush objects. No pastel-monochrome (rejected before). No emoji. No clinical flat-vector coldness. No realistic textures. No smoothly-tweened "corporate motion" on hand-drawn things.

## ENFORCEMENT
Lock it with a **style board** rendered in the real app: the flame, one reward token, and the guardian, side by side, on the real palette, in this cel-glow style. David approves that one screen; then it is the art law and every asset conforms or is rejected. Any asset David flags as off-identity gets its rule added here.

## THE FLAME ASSET SPEC (for David's cel flame)
A cel cartoon flame wants **true transparency**, not the black-background screen-blend used for photoreal fire. Author it as a **transparent-background sprite strip (PNG)**:
- **6 to 10 frames** of one flame loop, laid out **horizontally** in a single PNG, equal cells.
- **Transparent background** (real alpha), each frame the flame centered, base at the bottom of the cell.
- Cel style: clean outline, flat warm fills (gold to orange), a bright inner highlight. The app adds the soft glow bloom behind it, so the sprite itself does not need the glow baked in (a light bake is fine).
- Suggested cell size around 128 by 160 px (portrait), whole strip a few hundred KB.
- Save at **`alter/flame-sheet.png`** and tell me the frame count. The app will step through the frames (~10 fps), add the glow, and scale it with the charge. Particle flame stays as the fallback until the sheet is present.
