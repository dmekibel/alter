# THE DESIGN-PORT CHECKLIST — how a Claude Design frame becomes the app, without David as QA

Born 2026-08-14 from the tools-landing saga (v1267→v1279: five ship-fix rounds for ONE surface).
Every step below exists because skipping it shipped a broken build that David had to catch on his phone.
This is the single procedure; CLAUDE.md DESIGN AUTHORITY LAW items 6-8 bind it. No step is optional.

**STEP 0 — THE KB-SWEEP (David verdict 2026-09-01, CANON.md rule 3):** before the port, sweep `_specs/BOOKS-DEV-CANON-2026-07-18.md` (game-feel/UI laws: 100ms feedback, never-punish, hierarchy-by-de-emphasis) + `/Users/Dmekibel/claudeCode/KB-ATLAS.md` for stores speaking to this surface, raw sources over briefs where nuance matters. Record a `KB-SWEEP:` line in the build spec. Born 2026-09-01: that canon had never been opened by any design round it governs.

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

## THE IMPORT TRIGGER (David 2026-09-05, born from the rejected v1413 tour — "u completely failed at making the tutorial how i designed it")
**A Claude Design import message ("Use the claude_design MCP … to import this project … Implement: …") is a DESIGN PORT, never a copy handoff, even when the design is mostly text.** The failure: the `.dc.html` arrived as a JSON blob, was regex-mined for its sentences, and the paint was invented around them; verification checked the build against its own spec and passed. Five rules already forbade this; no gate enforced them. So, mechanically:
1. FIRST ACTION on any import, before any code: stage the bundle under `_design-sync/<topic>/<round>/` (with `_ds/`, `ios-frame.jsx`, `support.js`), run `design-gate.py`, SERVE it, OPEN it in the browser pane, screenshot every state. No screenshot of the running prototype = no build.
2. The EXTRACT table (computed values per element per state) is written to a `PORT-SPEC-*.md` BEFORE the first CSS/DOM edit.
3. A design's name is not a source. Never write "Round N visual language" for a round you have not rendered on screen. If a referenced round is unreadable (David's canvas project), ask for its screenshot in one line.
4. The ship gate is the frame diff, not the spec diff: `verify/` holds prototype-vs-app screenshot PAIRS per state at 430x932 (David's iPhone 16 Pro Max) and 402x874; the build is compared to the PROTOTYPE'S pixels, never to its own intent.
5. `_dev/preship.sh` refuses a ship when a `.dc.html` was staged this session and no `verify/` pairs exist for it (the PORT-LOCK check).
Rule 5 detail (2026-09-05): PORT-LOCK accepts, in place of PNG pairs, a `verify/DIFF-*.md` whose table carries per-state px deltas at 430x932 — the browser pane cannot persist screenshots while hidden, and the numeric diff is the stricter record. PNG pairs remain preferred whenever the pane is displayed.
