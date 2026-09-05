# PORT SPEC — Round 30 guided tour, 1:1 (2026-09-05, replaces the rejected v1413 interpretation)

**Why this exists:** v1413 shipped the right ten beats inside an INVENTED visual language. David rejected it on sight. This port follows `_dev/DESIGN-PORT-CHECKLIST.md` to the letter: the prototype is the spec, RUN it, extract computed values, diff positions at the frame's geometry.

## Sources (in FRAME-WINS order)
1. David's words: verdicts rounds 33-46 (`_design-sync/journey-2026-08-23/graph/verdicts-2026-08-28.md`).
2. The running prototype: `_design-sync/tutorial-2026-09-01/round30/Round 30 - Tour Round 2.dc.html` (design-gate PASS; bundle complete with `_ds/`, `ios-frame.jsx`, `support.js`). Serve the repo (preview `alter`, port 3000) and open it at `/_design-sync/tutorial-2026-09-01/round30/Round%2030%20-%20Tour%20Round%202.dc.html`. It contains a PLAYABLE tour (state `beat` 0..10, Next/Back/Finish handlers, `data-screen-label` per state) plus static panels P1, P2, P4, P4b, P5, P5b, P6a-c, P8.
3. DS tokens: `round30/_ds/.../tokens/colors.css`, `fonts.css`, `styles.css`.
4. The existing build (`@SEC:TOUR` in app.js, `.tour-*` in index.html) — the mechanic (zone detection, gesture-advance, no scrollTop writes, S.tour.done) is correct and stays; its PAINT and CHROME are replaced.

## Device
iPhone 16 Pro Max = **430x932** (David 2026-09-05). Artboard = 402x874. Port px into a centered column; verify at 430x932 FIRST, then 402x874, then 375.

## What to extract from the prototype, per beat (computed styles, not markup)
For each of the 10 playable beats and each static panel: the bubble box (left/top/width/height, radius, background, border, shadow), the tail (shape, side, offset), the text (font-family, weight, size, line-height, color, the highlighted-word color), the footer chrome (Back: text/icon, position, color, opacity — note P1 "Back waits at 35%"; Next: fill, radius, shadow, text; Skip: ONLY on panel 1, corner position; Finish on the last), the dim (color/alpha), the cutout (geometry relative to the target, radius, ring style — the round-29 "thin expanding ring" on thresholds), the thumb circle on gesture beats (size, position "bottom right where the thumb lives", animation keyframes thumbSwipeUp/Down, trailDot), the arrow nudge (tourArrowNudge), P6a's "one cutout, one short arrow beside it, the colored word matching the door", and the P8 ending (Back + Finish only, NO skip, home button bottom-left after Finish, journey left undimmed).
Record every value in a table in this file's EXTRACT section before writing a line of CSS.

## Beat list (LOCKED, David-verbatim copy — do not touch)
1 home (no dim, Skip here only) · 2 day strip · 3 time tracker · 4 shortcuts · 5 "Home keeps going below…" gesture (thumb + TOOLS ring) · 6 toolbox reading (David's tools-library line, NOT the design's "boxes" line) · 7 "Scroll up to go back, or tap the home button…" gesture · 8 settings door (one cutout, short arrow, colored word) · 9 "The journey sits above home. Scroll up." gesture · 10 journey, Back + Finish.
Garden + planner doors stay CUT from the tour (design round; kept in the prototype for the record).

## Build rules
- Edit ONLY index.html (`.tour-*` block) and app.js (`@SEC:TOUR` region: tourPaint / tourPlace / tourBubblePos, plus whatever DOM the design needs). No other regions. No commit. `node --check app.js` + `node _dev/ratchet.js` must pass.
- Child-drain only, never innerHTML wipes (ratchet).
- Every string via tr(); no new strings beyond the design's chrome words (Back / Next / Skip / Finish) — all already in the RU dict.
- The tour NEVER writes scrollTop (one-engine law). Gesture beats advance on zone travel (existing tourWatch) or by tapping the lit cue / thumb.

## Verification (all three, screenshots saved to `_design-sync/tutorial-2026-09-01/round30/verify/`)
1. Prototype parked at each beat (drive `beat` via its Next handler) → screenshot each.
2. App at 430x932: `DEV.tour()` then step (reading beats: click `.tour-btn.next`; gesture beats: `w.scrollTop = DEV.worldMotion().toolsY/homeY/skyY; w.dispatchEvent(new Event('scroll'))`) → screenshot each. NOTE the preview freezes CSS transitions/animations: inject `.tour-hole,.tour-ring,.tour-thumb{transition:none!important;animation:none!important}` for measurement only.
3. Element-by-element diff per beat vs the prototype: bubble rect, tail, text metrics, chrome positions, cutout rect vs target, ring, thumb. Report deltas in px. Anything > 2px = fix.
4. Repeat at 402x874. Zero console errors.

## Handoff
Report: the EXTRACT table, the diff table per beat at 430x932, what is DEVICE-UNTESTED (transition feel, thumb animation, scroll handoff), and the exact files/lines touched.

## ADDENDUM (2026-09-05, mid-port): Round 29 is STAGED
`round30/Round 29 - The Guided Tour.dc.html` (design-gate PASS) sits beside Round 30. Round 30's own header says "Round 29 visual language, new flow and format" — so Round 29 is the paint authority for anything Round 30 inherits without redrawing (the bubble, tail, chrome, the thin expanding ring on thresholds, the mark/tick animations: tourPulse, chevUp/Down, markHover, tickPop). Open it in the browser the same way; extract from it where Round 30 only references. Where the two disagree, Round 30 (newer, David-imported) wins.

---

# EXTRACT (computed styles, pulled from the RUNNING prototype at 402x874, 2026-09-05)

Driven via the prototype's own step chips (`state.beat` 0..10). Slider-tuned prop defaults read from `data-props`
(law 2 — authored fallbacks in `renderVals()` LIE: `toolboxBubbleTop` is 340, not the code's `?? 360`):
`backOnFirst=true · toolboxBubbleTop=340 · homeBubbleTop=285 · scrollBubbleTop=585 · scrollBubbleLeft=20 ·
scrollThumbTop=610 · goHomeTop=555 · goHomeThumbShift=0 · journeyLayout="side"`.

## THE MECHANIC (the biggest finding)
There is **no cutout anywhere in Round 30 or Round 29** (`grep 9999px` = 0 hits in both). The dim is a FLAT
full-screen scrim `rgba(32,10,36,.62)` at z-index 5, and the lit thing is RAISED ABOVE IT (`z-index:6`).
`showScrim: beat < 10` — so **beat 0 (P1) carries the scrim too**, with nothing raised. (The static P1 caption
"no dim on panel 1" is stale prose; both the playable frame and the static P1 frame render the scrim. FRAME WINS.)

## Shared paint
| thing | value |
|---|---|
| dim | `rgba(32,10,36,.62)`, flat, every beat 0-9; gone at beat 10 (ending) |
| bubble | `background:#341226; border:3px solid #ff4fa0; border-radius:20px; padding:15px 18px; gap:10px; box-sizing:border-box;` **no box-shadow** |
| bubble width | 296px (b0-b3) · 280px (b4,b6,b7,b8) · 310px (b5) · `left:36px;right:36px` (b9) |
| line | `'Baloo 2',800, 18px/1.3 (23.4px), #fff2f9` — b9 only: `19px/1.3 (24.7px)`, padding `17px 19px`, gap `12px` |
| tail | outer `30x14; overflow:hidden`, inner `16x16; left:5px; background:#341226; rotate(45deg)` + 3px `#ff4fa0` on the two facing edges. UP: outer `top:-14px`, inner `top:4px`, borders left+top. DOWN: outer `bottom:-14px`, inner `bottom:4px`, borders right+bottom. Outer centered on the target with `margin-left:-15px` (P6a is the one that uses a raw `left:12px`). |
| Back | `padding:7px 13px; radius:14px; background:rgba(255,242,249,.05); border:2.5px solid rgba(201,140,166,.4); 'Baloo 2' 800 14px; color:rgba(255,242,249,.62); gap:4px` — text `‹ Back`. Measured 69.3 x 41.5. On beat 0: same box at **opacity .35**, inert ("Back waits at 35%"). |
| Next / Finish | `padding:7px 16px; radius:14px; background:#ff4fa0; border:2.5px solid #160510; box-shadow:0 3px 0 #160510; color:#160510; gap:5px` — `Next ›` (74.4 x 41.5) / `Finish` (75.5 x 41.5). |
| Skip | float:right INSIDE the line div, `margin:1px 0 4px 12px; 'Baloo 2' 800 12px; color:rgba(201,164,188,.6)` — **beat 0 only**. |
| footer | `display:flex; align-items:center; justify-content:space-between` — one child (Back) on gesture beats. |
| ring (thresholds only) | `border:3px solid rgba(255,143,192,.8); border-radius:999px; animation:tourRingThin 1.9s ease-out infinite` — `0%{scale(.92);border-width:3px;opacity:0} 18%{opacity:.9} 100%{scale(1.3);border-width:1px;opacity:0}` |
| thumb | track `width:70px; left:50%; margin-left:108px`; circle `46x46 + 3px border` → `background:rgba(255,143,192,.3); border:3px solid #ff8fc0; border-radius:50%`. Track heights 158 (up, align flex-end) / 150 (down, align flex-start) / 118 (short, flex-start). |
| thumb keyframes | up: `0%{Y0 s.8 o0} 14%{Y0 s1 o1} 72%{Y-112 o1} 100%{Y-132 s.92 o0}` · down: same with +112/+132 · short: +58/+72. All `2s ease-in-out infinite`. |
| DEAD in R30 | `tourPulse`, `tourGlowBreathe`, `trailDot`, `tourArrowNudge` are declared in the bundle and used **0 times**. There is **no arrow element** on P6a in either the playable frame or the static P6a frame — the "short arrow" of the caption IS the bubble's top tail landing on the settings icon. FRAME WINS; no arrow ported. |

## Per beat (device coords, 402x874)
| # | panel | scrim | raised (lit) rect | bubble rect | tail | highlight | chrome |
|---|---|---|---|---|---|---|---|
| 0 | P1 home | yes | — (nothing) | 53,285 296x157.7 (top 285, centered) | none | `home` #ff8fc0 | Skip · Back@.35 · Next |
| 1 | P2 strip | yes | 20,95 362x43 | 53,176 296x157.7 | UP @ cx 201 | `day` #36b3f0 | Back · Next |
| 2 | P3 tracker | yes | 36.3,274.4 329.4x180.2 (disc 180 ⌀) | 53,480 296x181.1 | UP @ cx 201 | `time tracker` #ff8fc0 | Back · Next |
| 3 | P4 shortcuts | yes | 27.2,725.7 347.5x83.1 | 53,525 296x157.7 | DOWN @ cx 201 | `shortcuts` #b07aff | Back · Next |
| 4 | P4b scroll | yes | 20,815 362x59 (TOOLS block) | 20,585 280x181.1 | DOWN @ 181 in-bubble → cx 201 | `Scrolling` #36b3f0 + `TOOLS` #ff8fc0 | Back only |
| 5 | P5 tools | yes | — | 46,340 310x181.1 | none | `toolbox` #b07aff | Back · Next |
| 6 | P5b go home | yes | HOME cue 0,76 402x35 · home btn 18,794 62x62 | 14,555 280x157.7 | DOWN @ 12% → cx 47.6 | `home` #ff8fc0 | Back only |
| 7 | P6a settings | yes | 20,51 42x42 (icon @ scale 1.5) | 14,110 280x134.3 | UP @ left 12 → cx 41 | `Settings` #ff8fc0 | Back · Next |
| 8 | P7 journey | yes | 156.9,46 88.2x43 (JOURNEY cue) | 14,148 280x134.3 | UP @ 187 → cx 201 | `journey` #b07aff | Back only |
| 9 | P8 ending | yes | — | 36,353.2 330x167.6 (vertically centred) | none | `journey` #b07aff | Back · Finish (no Skip) |
| 10 | end | **no** | — | — | — | — | home button bottom-left |

### Derived placement law (what the frame actually encodes)
* the tail's centre x **always equals the lit target's centre x** (verified on every tailed beat).
* bubble is horizontally CENTRED on reading beats; on the three thumb beats it is PINNED to the left margin
  (20px on b4, 14px on b6/b8) to clear the thumb at `50% + 108`.
* target→bubble gaps as drawn: b1 38 · b2 25 · b3 43 (above) · b4 49 (above) · b6 81 (above) · b7 17 (below) · b8 59 (below).
* ring geometry: threshold cue → target rect inset `top +7 / bottom −5`, full width, pill.
  TOOLS pill → 86x50 border-box, i.e. the cue's content box inflated (+21.5 x, +5 y).
* thumb x = `viewport centre + 108`, y = bubble top + 25 (b4) / + 0 (b6, b8).

## Deviations forced by the app (named, not silently approximated)
1. **Raise → hole.** The app cannot raise a lit element above the dim: every target lives inside `#trackerFull`
   (`position:fixed; z-index:90`), a stacking context, so a `z-index:90001` on the child is capped. The port punches
   a hole in the scrim at the target's live rect instead. Measured equivalence: the app's home ground is
   `linear-gradient(#1a0712, #180a1e 55%, #140f26)`; the scrim `rgba(32,10,36,.62)` over it lands within ~7/255 per
   channel of the undimmed pixel, so an undimmed rectangle vs a raised silhouette differ by an invisible amount on
   the background and are identical on the lit element itself.
2. **Beat 6's home button does not exist in the app.** The design lights a round home button bottom-left; ALTER's
   only home affordance is the top-centre HOME threshold (`#tfHudHome`, 39x37 at y48 in the tools zone). The beat
   therefore lights that cue, puts the bubble BELOW it (tail up, gap 59 borrowed from the identical b8 JOURNEY cue)
   and keeps the down-swiping thumb. The design's `top:555` bubble + `bottom:18` button relationship is unportable.
3. **Beat 10's bottom-left home button** likewise has no counterpart. Finish simply ends the tour, leaving the
   journey undimmed — the design's stated intent — with the app's own chrome.
4. **P1's "no dim"** prose is overruled by both P1 frames, which render the scrim. Ported WITH the dim.
