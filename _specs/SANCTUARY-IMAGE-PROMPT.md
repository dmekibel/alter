# THE SANCTUARY — image-generation brief (for Balance KIE + GPT Image 2)
*2026-07-12. Run these in a Balance session via the KIE skill (gpt-image-2). Attach the reference frame. Iterate on real images, not SVG.*

## HOW TO RUN
- **Model:** GPT Image 2 (via KIE). MJ/IZO as a backup for extra pixel crunch on a chosen final.
- **Reference image (attach it):** `~/Downloads/IMG_2945.MP4` → grab a still (a poster frame is at the scratchpad, or `qlmanage -t -s 1000 -o <dir> IMG_2945.MP4`). It's the `tiles_survive_game` ad — a cozy top-down pixel island on water. **Tell the model: keep this perspective, island-on-water composition, and cozy-pixel fidelity; restyle the palette to berry-night and follow the prompt for what's on the island.**
- **Aspect:** 1024×1024 for exploration; 1024×1536 (portrait) for the in-app full-screen framing.
- **Batch:** generate 4, pick, refine by nudging ONE knob at a time (see ITERATION KNOBS).

## THE LOCKED BRIEF (what every image must honor)
Flat cozy island on calm dark water · **house dead-center, island grows outward, lush near the house → bare sandy tiles at the rim** · berry-night palette (the app's cockpit colors) · **charged marks = softly glowing plants + small carved totems, NEVER campfires** · scarce warm gold glow only on charged marks + cottage windows · a tiny character with a small pink guardian spark · calm, premium, meditative — a sanctuary, not a busy or childish game.

---

## PROMPT 1 — THE HERO ISLAND (paste this)

> Cozy top-down pixel-art game island on calm water, slight 3/4 elevation like a polished mobile survival/farming game (match the attached reference's perspective and cozy pixel fidelity). A single small organic island with an irregular, tile-bitten coastline, a soft sandy beach rim, and a low earthy cliff edge so the island sits ON the water with a little depth. At the exact center stands a warm wooden cottage with a pitched shingle roof and glowing amber windows, on a gentle grassy knoll. The land radiates out from the cottage: lush and cultivated near home — tidy garden plots with planted rows, a low wooden fence, leafy trees and round bushes, a stone well, winding dirt footpaths dotted with small stones — fading to sparse, bare, raw sandy tiles at the outer rim, with one or two fresh empty tiles that suggest the island can still grow outward. Scattered across the near-home land are a few softly GLOWING objects that are the only sources of light: a golden glowing flower, a small carved violet standing-stone totem, a little blue lantern on a post, and a calm reflective teal pool. A tiny pixel character walks a path, a small glowing pink four-point guardian spark hovering beside them. Mood: deep dusk / night, moody, calm, meditative, premium and classy — a peaceful private sanctuary. Color palette: deep berry-navy and plum water, moody muted greens for the grass, warm brown wood, dusky violet sky; scarce warm GOLD glow reserved only for the charged plants, totem, and cottage windows; soft accents of pink, sky-blue, violet and teal on the glowing marks; cohesive and harmonious, low contrast except where the glow pops. Clean detailed cozy pixel art, chunky readable pixels, crisp edges. No UI, no text, no icons, no health bars, no watermark.

---

## PROMPT 2 — THE MARKS + THE RECHARGE (paste this)

> A tight top-down pixel-art vignette on a small patch of moody berry-night grass. Left to right, a row of four glowing "charged marks" in a cozy game style: a golden glowing bloom, a small carved violet standing-stone totem, a blue paper-lantern on a wooden post, and a calm reflective teal pool — each radiating a soft gentle magical glow. Beside them, the SAME violet totem shown in three states from left to right: first dim and unlit (desaturated, no glow, quietly waiting), then mid-charge with a soft breathing ring of light around it, then fully lit and radiant. Deep berry-navy background, scarce warm glow, premium and calm, clean detailed pixel art. No text, no UI, no watermark.

---

## ITERATION KNOBS (append/swap ONE at a time to explore "every way")
- **Time of day:** `deep night, moonlit` ↔ `warm golden-hour dusk` ↔ `soft blue twilight`
- **Density:** `young sparse island, mostly bare tiles, just the cottage and a few plants` ↔ `mature lush island, dense with plants, paths, and glowing marks`
- **Perspective:** `flatter top-down, map-like` ↔ `stronger 3/4 tilt with visible building fronts`
- **Palette push:** `more saturated candy pixel colors` ↔ `muted, moody, desaturated, premium`
- **Prop swaps for the charged marks:** try `glowing crystals`, `paper lanterns`, `small shrines`, `blossoming saplings` in place of the totems — same scarce-glow rule.
- **Growth story:** `one corner of the island freshly expanded with raw sand tiles being planted`
- **Structure taste (optional):** `the cottage on a slightly raised central knoll, land stepping gently down to the shore` (keeps a hint of the mountain/height idea)

## AVOID (negative direction)
campfires or open flames as the glowing element · bright garish daytime · Finch-style cute/childish mascot register · UI, HUD, text, numbers, health/XP bars, buttons · watermarks/logos · photorealism · cluttered busy scene · glow on everything (glow must be scarce = only charged marks + windows).

## THE LOGIC TO KEEP (so it stays on-thesis, tell the model if it drifts)
The house is home/the self at the center; the island is the life you've lived, growing outward; the glowing plants/totems are your values, goals, and wins made physical; a dim mark means it needs re-charging (re-committing); the water all around is the calm, meditative frame.
