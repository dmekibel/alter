# HANDOFF — build the ALTER candle flame (for a fresh Fable session)
**Date:** 2026-07-07 · **You are Fable, in a new chat, in the alter/ repo.** Your one job: make a genuinely beautiful, alive, stylized candle flame for the Candle Vigil ritual. Opus tried several times and it still does not read as a real candle. This is a pure creative-visual problem, which is your strength. Build it standalone, preview it, iterate on the look until it is gorgeous, then hand back a drop-in function.

## The goal in one line
A warm, hand-drawn-feeling **cel candle flame with a soft glow** that looks alive (flickers, sways, licks) and grows brighter and taller as the user holds to charge it. Not photoreal. Not a solid plastic shape. A flame you would want to sit and watch.

## The art identity (obey it)
Full law: `_specs/STYLE-ART-IDENTITY.md`. Short version, "Cel Glow":
- **Cel, not photoreal:** confident forms, a clean warm dark outline (not pure black), flat warm color bands (gold to amber to orange), a bright white-hot inner core. Hard-edged cel shading, not gradient mush.
- **Glow:** a soft additive bloom around the flame. This is the signature. Warm gold and white.
- **Storybook warmth:** gentle, rounded, a touch of painterly softness. Cozy, tender, hand-made, never clinical.
- **Palette:** warm gold/amber/orange flame on a deep twilight-to-dawn ground, sitting inside a circular frame. Light is the event.

## What has been tried and REJECTED (do not repeat)
1. **One opaque bezier teardrop with a gradient fill** → looked solid and plastic. Dead.
2. **Additive soft-sprite blobs plus rising particles** → glowing but formless; David: "still looks bad and not like a candle." The glow was there, the FLAME SHAPE and cel character were missing.
The lesson: it needs actual flame *character* (a recognizable cel flame shape with an outline and inner bands and dancing tongues), not just a glow blob, and not a stiff filled shape.

## The interaction contract (so your result drops into the app)
The flame is drawn every frame by a function into a Canvas 2D context. Match this signature and behavior:
- **`vpaint(f, ts)`** draws the candle+flame into the existing context `vg` (already scaled for devicePixelRatio).
- **`f`** = 0..1, the charge/brightness. At `f≈0.12` the flame is a small dim ember; as the user holds, `f` rises toward 1 and the flame grows **taller and brighter**; on release it gutters back down. Drive height, width, brightness, glow, and particle activity off `f`.
- **`ts`** = a millisecond timestamp (from requestAnimationFrame) for all animation (flicker, sway, tongues). No `Date.now()`.
- Canvas area is **240 x 300 CSS px** (backing store is dpr-scaled, so work in CSS px). The flame sits inside a **circle** (centre near `cx = 120`, `cy ≈ 132`, radius `R ≈ 112`), which is clipped, with a gold **charge-progress ring** on the circle rim. Keep the circle frame and the ring; replace only the FLAME.
- Must run smooth at **60fps on iPhone Safari (PWA)**. Canvas 2D only, no WebGL. Keep particle/shape counts modest.

## The deliverable (two things)
1. **A standalone HTML file** (canvas + a requestAnimationFrame loop + a slider that sets `f` from 0 to 1, on a dark ground) that renders the flame. **Preview it (Artifact or show_widget), look at it, and iterate on the actual look until it is beautiful.** This visual loop is the whole point of doing it in your session. Get it to genuinely look like a lovely cel candle flame at both low and high `f`.
2. **A drop-in `vpaint(f, ts)` function** (plus any helper it needs, e.g. a pre-rendered sprite) that produces that same flame in the app, using only the `vg` context, `f`, and `ts`. I will paste it into `app.js` at the vigil beat.

## Techniques that help (cel-flavored, not photoreal)
- Build the flame from a **cel silhouette** (an outlined teardrop-with-tongues shape whose control points sway on layered sines + a little noise, so the outline itself dances) **filled with flat warm colour bands** (2 to 4 bands, hard steps) and a **bright inner core**, then add a **soft additive glow** behind it. Outline + flat bands + core + glow = the cel-glow look.
- Give the tip **licks/tongues** that split and rejoin over time (a candle flame is never a static teardrop).
- **Flicker the brightness** (the light output pulses on fast layered sines), and **sway** the whole flame on slow sines plus a touch of noise. Uneven, organic, never a metronome.
- A few small **rising ember sparks** with additive blend add life (keep them subtle, secondary to the flame shape).
- Colour ramp: deep-red base, orange body, amber, gold, white-hot core, warm outline. Everything warm.

## Where it lives now (starting point)
In `app.js`, the Candle Vigil is a `vigil` beat inside `runLesson` (grep `"if (b.k === \"vigil\")"`). The current flame is the `vpaint` function there (the rejected particle version). You can read it for the exact frame it draws into (the circle, wax candle base, wick at `wickY`, charge ring), and replace the flame portion. The wax candle base and wick can stay simple; the FLAME is the job.

## Model + method note
This is aesthetic iteration, so use the visual preview loop hard: build, look, adjust the shape and colours and motion, look again. Do not ship on the first render. When it looks genuinely great to you at low and high `f`, hand back the standalone file and the drop-in function. Honesty rule of this repo: the *feel* on David's actual phone is DEVICE-UNTESTED until he confirms, so say so.
