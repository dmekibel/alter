# HOME COMPOSITION SPEC — match David's reference, exactly (2026-07-21, Fable)

**STATUS: FIDELITY ADDENDUM to DESIGN-STUDIO §7.9 (the round-2 verdicts + Opus render queue), not a competing plan.** Where §7.9 says render OPTIONS for David's pick (door chrome, gem counter), this file's prescriptions are ONE candidate + the transcription of his reference screenshot; §7.9's queue owns the order. Points that remain LAW regardless: the circle IS the button at reference size with the H-D1 visible-ring ruling; next-line = plain text, no pill; tool grid floats free with the cooler reference hues; strip icons align under pills; planner door LEFT / garden RIGHT / no journey button (journey = the upward motion, visual grammar per §7.7-REVISED).

**Source of truth:** David's uploaded home mockup (2026-07-21 chat; the "2:41 / 1,240 gems / What now? / next: Deep work · 5:30" screenshot). This file transcribes it precisely because build agents cannot see the chat. Where a prior DEVICE RULING refines the mockup, the ruling wins and is marked RULING.
**His directive:** "more minimalist. Track now is not a separate button, it IS the circle. Note the nuances of the buttons below and the gems above."
**Corrections he issued same day:** planner door = top-LEFT (there is NO journey button; journey = the upward scroll); garden = top-RIGHT; home↔journey↔tools = ONE connected vertical axis.

## SLICE H-COMP (pure paint + wiring; screenshot-verified against this spec)

1. **Status row (idle home):** clock left (bold white ~17px). Right: gem diamond (`ti-diamond` outline, gold #ffd24a) + count. **NOTHING else on this row.** The settings avatar LEAVES the row: restyle #tfGear as a GHOST glyph (no border ring, no bg, dim #7d6486, ~22px) sitting far-right BELOW the status row level or tucked at the strip's right end; it must read as furniture, not a badge. (Flagged deviation: the reference shows no settings at all; the ghost is the concession. David may kill it later.)
2. **Story strip:** pills row + icon row as ONE aligned glance element: each icon centered under its pill, fixed slots. Lit pills = domain color, their icons colored; unlit = dark ghost pills + gray icons (the reference shows 2 ghost pills at right). NO chevron, NO door glyphs on the strip rows. The strip stays tappable → planner (big target, harmless redundancy).
3. **Doors (corrected):** top-LEFT glyph = PLANNER (`ti-calendar`), top-RIGHT = GARDEN (`ti-plant-2`). The journey glyph is REMOVED (journey = scroll up, H-AXIS). Door styling: minimal ghost circles ~30px, icon-only, dim (icon #9a80a6, no borders, no fills); they brighten on press. They sit in the airy zone below the strip, clear of the pills.
4. **THE CIRCLE (Track = the circle itself, never a separate button):**
   - Size UP to the reference: ring diameter `min(65vw, 258px)`, disc fills it leaving a **thin visible ring**.
   - **RULING (H-D1, kept):** the ring stays VISIBLE dark-plum #2a1832, but TIGHT: ~8-10px of ring showing (the dial-at-zero identity; the arc lives here when tracking). NOT the reference's near-invisible ring, NOT the fat donut of v1184.
   - Soft pink bloom around: `0 0 64px rgba(255,95,168,.22)` plus the existing deep drop. Disc flat #ff5fa8, dark play triangle, breathing animation kept.
5. **"What now?"** Baloo 800 ~30px white below the circle (as-is).
6. **The next line = PLAIN TEXT, no pill:** `next: Deep work · 5:30` in lilac #b39ab0, Jost 600 ~15px, no background, no border, no icon chip. (Scope: the home idle + onehome calm faces; the .tf-subblock pill stays for other surfaces if used.)
7. **Tool grid:** NO container panel (kill .tf-toolspanel visuals on home: transparent, no border, no padding box; tiles float on the ground). 2×4, radius ~20px, gap ~12-14px, white outline icons ~30px, **soft same-hue darker bottom edge** (keep the extrude formula, retune base colors). **Tile hues from the reference (transcribe, cooler pastel set):** row1 lungs=soft blue (#5b8fd6-ish), flower=soft purple (#8b6fd6), horns=soft pink (#d66a7e), runner=soft green (#6aa76f); row2 bulb=muted gold (#c9a23f), moon=soft blue, steps=teal (#4f9d95), dots=soft purple. Sample from the screenshot; they are LESS hot than the current set. No labels.
8. **Air:** the reference is mostly dark air. Verify spacing: strip → big gap → circle → What now? → next → gap → grid. Nothing else on the face.
Verification: force idle home, screenshot, compare against this spec point-by-point; then check the tracking/claim/night faces inherit the same status-row + strip + door minimalism via tf-onehome (their circle/controls unchanged from v1185).

## SLICE H-AXIS (the vertical world, v1: hand-off model — DEVICE-TESTED)
"Home to journey and home to the tools, a single scroll." Implementation = HAND-OFF, not one giant scroller (the two-scroll-watchers landmine, v488): home is a fixed stage that OWNS vertical gestures; past a threshold it hands off to the destination surface with a continuous-feeling slide (TRANS_V2 grammar mechanics).
- **Finger drags DOWN** (pulling the sky down): journey slides in from the top over home. **Finger drags UP:** the tools shelf (openToolbox stage for now; the ONE-BUILDER Layer-1 doors later) slides up from the bottom.
- Threshold ~80px or flick velocity; below threshold = rubber-band back (transform-follow the finger, no opacity games).
- **Peeks (discoverability + the "connected" feel):** a faint arc of the nearest journey stone crests the top edge of home (~10px); the shelf's lit edge shows at the bottom (~10px). Both are TAPPABLE as backup doors.
- Journey's own internal scroll owns touch once open (single-owner law); back = puck (home) or the same gesture reversed if cheap.
- Flag `AXIS_V1` default true; false = no gesture listeners, peeks become plain taps only. No new innerHTML wipes; pointer handlers on the home stage only; do NOT touch @SEC:TIMELINE or the pane carousel internals; PANE_GUARD registered.
- HONESTY: gesture FEEL is DEVICE-UNTESTED by definition; ship with taps working regardless, label the handoff.

## Order
H-COMP first (pure paint, provable), H-AXIS second (own session or same if budget allows). Both on Opus. Verification vs THIS file; the reference nuances above outrank memory.
