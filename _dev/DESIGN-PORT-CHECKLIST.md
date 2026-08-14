# THE DESIGN-PORT CHECKLIST — how a Claude Design frame becomes the app, without David as QA

Born 2026-08-14 from the tools-landing saga (v1267→v1279: five ship-fix rounds for ONE surface).
Every step below exists because skipping it shipped a broken build that David had to catch on his phone.
This is the single procedure; CLAUDE.md DESIGN AUTHORITY LAW items 6-8 bind it. No step is optional.

## The five laws the saga proved

1. **The artboard is absolute.** A `.dc.html` frame is a fixed-size device (2c home = 402x874 — David's own
   iPhone 16 Pro) drawn in absolute pixels, WITH the status bar inside it. Port px into a centered max-width
   column. NEVER translate to vw/vh/%. NEVER add real safe-area on top of the frame's y-anchors.
   (v1275: the stone rendered 208 on-device from 48vw; v1279: the head zone rode 18-43px low from doubled safe-top.)

2. **The prototype is the spec — RUN it.** Open the design file in the browser, drive it to every rest state,
   and extract values from its COMPUTED STYLES, not from reading its markup: David tunes sliders, so authored
   defaults lie (folder height was 98, not the markup's 95; the You button carries a slider scale of 1.5).
   Reasoning a mechanism away from the app's code instead of measuring its outcome is forbidden.
   (v1267/v1271: `_measurePad` "interpreted" twice, wrong both times.)

3. **Authored vs frozen.** The hidden preview pane freezes animations, so cascade-target elements report their
   keyframe `from` state (e.g. translateY(22) scale(.9), opacity 0) as computed style. A reading is AUTHORED
   only if the node carries layout + transform WITHOUT opacity/animation/transition resets. Layout offsets
   (offsetTop/offsetLeft) ignore transforms — use them when the surface may be mid-cascade.
   (Round 4b: a phantom "0.9 ground wrapper" nearly shipped; an Opus builder caught it with this test.)

4. **Diff POSITIONS, not just sizes — at the frame's own geometry.** Run the app at the artboard's exact
   viewport (402x874) and machine-diff every mapped element's rect.top/left/cx AND computed paint against the
   running prototype: `_dev/design-diff-2c.js` (read its header first). Sizes alone let an 18-43px shift pass.
   Every rest position of a scrolling surface is a state (LAW 7): diff each landing, parked at its exact scrollTop.

5. **Lock what you fixed.** Every ported number becomes a designAudit gate (style-based where possible so it
   holds at any viewport; "home zone is one frame tall" catches the under-the-fold class). A drift class
   without a gate WILL ship again. Superseded old-era locks get NAMED in the ship note, never silently overruled.

## The procedure, in order

1. Pull the bundle (DesignSync) → `python3 _dev/design-gate.py` must say the pull is complete (256KiB trap).
2. Serve the repo, open the `.dc.html` in a browser tab. Park it at each designed rest state.
3. Extract computed values per element (harness dump) + the runtime mechanisms (measure their OUTCOMES).
4. Spec with quoted values only. Builder scope-guarded: named files, named selectors scope (e.g. `.tf-2c` only),
   no commits, node --check. Fable orchestrates and audits; Opus builds.
5. Verify: app at 402x874, both surfaces parked per landing, machine diff to ~0; then re-check 375 (small-phone
   floor). Run DEV.designAudit — ALL gates, both landings. Zero console errors. Ratchets.
6. Screenshot each landing and diff element-by-element against the frame (LAW 7's seed checklist).
7. Ship immediately (David never reviews stale builds). Handoff entry: what changed, superseded locks by name,
   DEVICE-UNTESTED list (feel is always on the phone).

## Known traps, by name
- 256KiB `get_file` truncation → design-gate.py.
- Frozen-cascade transforms (law 3). Programmatic scrollTop fires no scroll event; rAF freezes in hidden panes.
- Slider-tuned props override authored defaults (law 2).
- Repeated-element recipes must be COPIED, never re-derived from the app's ratio laws (row-2 tile = deck card).
- The frame crops at its edges; cropped shapes are cropped elements, never designed "peeks" (LAW 7).
- Camera photos of screens are never color sources (LAW 4).
