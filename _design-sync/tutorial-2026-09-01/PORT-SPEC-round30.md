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

## FIX-2 (2026-09-05, after David's device round on v1414) — three defects, one architecture change

**D1 · the visible square.** The frame RAISES the lit element above a flat scrim (`z-index:6` over `rgba(32,10,36,.62)`); no hole, no edge. The cutout must go. Requirement: only the element's own pixels read lit, in its own shape, fully covered, never offset. Two acceptable mechanisms, in order of preference — MEASURE which one the app allows:
  (a) In-context raise: mount the scrim INSIDE `#trackerFull` (a fixed child covering the viewport, so it sits in the same stacking context as the targets and the HUD) and lift the target with `position:relative; z-index` above the scrim. This only works if no ancestor between the target and `#trackerFull` creates its own stacking context (transform / opacity / filter / will-change / isolation) — test each target's ancestor chain with getComputedStyle and report. Where it works, use it: it is literally the design's mechanism.
  (b) Ghost raise: where (a) is impossible for a target, deep-clone the target node, strip ids/handlers, place the clone at the target's rect ABOVE the scrim (in the scrim's own layer), `pointer-events:none`. The clone is pixel-identical to the element, so nothing but the element reads lit. Re-clone on each beat; never on scroll.
  Either way: NO `.tour-hole`, no box-shadow spotlight, nothing rectangular.

**D2 · touches must fall through.** Every tour node is `pointer-events:none` EXCEPT the Back / Next / Skip / Finish buttons (and only those). The bubble body, thumb, ring, scrim, raised element/clone: none. Tap-the-lit-thing and tap-the-thumb to advance are DROPPED (they were never in the frame's copy; the gesture is the instruction). A touch that starts anywhere on the screen must scroll `#tfWorld` exactly as it does with no tour running — verify by comparing `touch-action`/`pointer-events` of every element under 9 sample points (corners, centre, the thumb's own spot) with and without the tour mounted.

**D3 · gesture beats scroll with the content.** On beats 5, 7, 9 the bubble, the thumb and the raised element must move WITH the scrolling content, natively — mount them INSIDE the scroller (`#tfWorld`), absolutely positioned in CONTENT coordinates (`rect.top + scrollTop`), so the compositor moves them (iOS scrollTop lags the main thread; JS repositioning on scroll is forbidden here — see memory `ios-scrolltop-lags-the-compositor`). The scrim on those beats must then also live in a layer that keeps the bubble above it: either the in-context scrim from D1(a) with the bubble's z-index above it, or a scrim inside the scroller spanning the full content height. Reading beats (1-4, 6, 8, 10) may keep a fixed mount. FIRST, observe the prototype: drive it to beat 5 and scroll its phone content — record whether the frame's bubble/thumb travel with the content or stay pinned, and match THAT.

**Acceptance (430x932, then 402x874):** no rectangular edge visible on any beat (screenshot if the pane is displayed; else assert no element with a box-shadow spread ≥ 100px exists while the tour runs); every lit target's ancestor chain reported; touch fall-through table (9 points × with/without tour); on beat 5 set `scrollTop += 200` and confirm the bubble's `getBoundingClientRect().top` moved by −200 with NO JS scroll handler involved (temporarily remove the scroll listener to prove it); the Round 30 bubble/tail/chrome/thumb numbers from DIFF-2026-09-05 still hold on every beat. Zero console errors, ratchets pass. Append the results as `verify/DIFF-2026-09-05-fix2.md`.

## FIX-4 (2026-09-05 night, David's second device round on v1416 + his UPDATED Round 30 with the animations designed)
The staged `round30/Round 30 - Tour Round 2.dc.html` is the NEW pull (144,578 B; the first pull is kept as `…v1-2026-09-04.dc.html`). New keyframes David designed: `bPopC/bPopY` (bubble pop, `.48s cubic-bezier(.34,1.56,.64,1) .08s both`, centred bubbles P1/P5/P8), `bBloomC/bBloom` (bubble bloom `.56s cubic-bezier(.22,.9,.3,1) .08s both`, anchored bubbles P2-P4 / left-anchored P4b, P5b, P6a with `transform-origin` at the tail, e.g. `12% 108%`), `tLight` (`.45s cubic-bezier(.22,.9,.3,1) both`, brightness .4→1: the lit element LIGHTS UP on arrival — HUD cue, home button, settings), `tCascade` + `tGlow/tGlowF/tGlowS/tGlowT` (the tools cascade on the toolbox beat: `casc(toolsGrid, .4, .06)`, `casc(toolsHeroes, 1.0, .1)`, further groups in the script — each tile `tCascade 1.4s cubic-bezier(.22,.9,.3,1) <base + i*step>s both`). "i designed all the animation so make sure it stays accurate." RUN the prototype and extract every animation shorthand + delay per element per beat; the list above is orientation, the computed values are the spec.

David's twelve, each an acceptance item:
1. **Every screen enters bright → dark → bubble.** Observe the prototype's beat-entry sequence (content visible undimmed → scrim (instant or faded? measure) → bubble pops/blooms .08s later) and reproduce the timing on EVERY arrival: home at start, tools on arrival, home again, journey at the end. Reading beats within a screen use the bubble bloom only.
2. **Beat 1 bubble is wrong** — on device it sits on top of the pink circle. "Don't take my word for it": measure the P1 frame's circle rect vs bubble rect and reproduce the RELATION to the real circle (the app's circle sits higher than the mock's), not the absolute artboard y. Positions are relative to anchors; sizes are artboard px (the 2c-saga law).
3. **Things are not lighting up** (device screenshot: the day strip on beat 2 reads dim). The raise alone is not enough when the element's own resting state is quiet: while lit, the target must render at the frame's lit paint (`tLight` to brightness 1, the strip pills at their full hues as P2 draws them), and the raise must hold on iOS. Beat 5 on device: bubble, thumb AND the TOOLS cue were all dark → the content mount is under the scrim on iOS (the scroller composites as its own layer). For content-mounted beats put the scrim INSIDE `#tfWorld` too (absolute, full content height, z below the tour nodes), so raise/bubble/thumb are in the scroller's own context; fixed-chrome beats keep the `.tf-inner` scrim. Prove with elementFromPoint AND with a structural argument that holds under a compositing scroller.
4. **Dev tools:** a "Tour" button in the dev menu overlay (the 🧪 menu, @SEC:DEV) that starts the tour instantly from wherever the app is (opens home first); keep the Settings "Redo tour" row. And the dev menu must close on a tap outside it (a backdrop tap), not only via its bottom close button. Scope exception: the dev menu's open/close code only.
5. **Lock the app during the tour.** "It's a preview": nothing tappable, nothing scrollable, except what the beat asks for. Reading beats: `#tfWorld` cannot scroll at all (touch-action:none + a full-screen catcher above the app and below the bubble; only Back/Next/Skip/Finish take taps). Gesture beats: scrolling allowed ONLY toward the target (prefer native `touch-action: pan-down` / `pan-up` on the scroller — verify Safari support in the DS bundle's target list or fall back to a scroll clamp that pins scrollTop at the beat's start on the wrong side and at the target zone on the far side; document which you shipped), and once arrived the lock returns. The lit cue on a gesture beat is the ONE tappable app element and it routes to the app's own `wGoTools` / `wGoHome` / `wGoJourney` (never a raw scrollTop write). "if I scroll down I shouldn't be able to scroll back up until it's that part of the tutorial."
6. **Tools beat cascade:** David's `tCascade` across the grid, then heroes, then the further groups, with the frame's exact bases/steps/durations; each tile in its own hue. He offered "shimmer instead of glowing" as an alternative — the frame's glow IS his design; ship the frame's.
7. **Settings beat appears only AFTER arriving home** (the scroll has settled), via the entrance sequence of item 1. Same for the tools beat and the journey ending: nothing pre-mounted while the user is still scrolling.
8. **Journey cue ring starts too small** — `tourRingThin` begins at scale(.92) around a ring already smaller than the cue, so it covers the J and Y. The ring's box must never be smaller than the cue's full text box: apply the frame's ring at the frame's SIZE around the app's cue centre (the frame's cue is 88x43; the app's is 56x35 — size the ring to the frame's, centred), starting at scale 1.
9. **The bubble scrolls AWAY on the journey beat** (David reverses my round-51 anchor rule): on gesture beats the bubble, thumb and ring are content-mounted and travel with the content on ALL THREE (5, 7, 9); the next beat's bubble enters via item 1 after arrival. The JOURNEY cue itself stays lit during the climb (hold `#tfHudJourney` at opacity 1 while beat 9 runs; restore on teardown — a borrowed style, like the `#tfHud` translate fold).
10. **Touches fall through nowhere now** (item 5 supersedes FIX-2's D2): the catcher swallows everything except the four buttons and, on gesture beats, the scroll gesture in the allowed direction + the lit cue's tap.
11. Preserve: Round 30 numbers (bubble rects, tails, pills, thumbs) from DIFF-2026-09-05 wherever item 2's relative placement does not override them; the RAISE-BEFORE-MEASURE order; S.tour.done; onboarding kick; DEV.tour/tourAt (extend tourAt with `mount`, `locked`, `anim` = the running animation names).
12. Record everything as `verify/DIFF-2026-09-05-fix4.md`: per beat the entrance sequence timings vs the prototype, animation shorthand per element vs the prototype, the lock table (what can scroll/tap on each beat), the raise proof, the beat-1 relation numbers, at 430x932 then 402x874. Zero console errors; ratchets pass.

---

# EXTRACT — FIX-4 (the animations, pulled from the RUNNING prototype at 402x874, 2026-09-05 night)

Source: `round30/Round 30 - Tour Round 2.dc.html` (the NEW 144,578 B pull), served at `http://localhost:3000/…`,
driven beat by beat through its own step chips, read with `getComputedStyle` per element. Animations were NOT
suppressed for this table (only for the geometry re-reads further down). The Browser pane was HIDDEN for the whole
session, so screenshots time out; every value below is a computed-style reading, which is the stricter record
(PORT-LOCK's numeric-diff clause).

## A · The keyframes the bundle declares (verbatim, all 17)
| name | keyframes | used in R30? |
|---|---|---|
| `bPopC` | `0%{translateX(-50%) scale(.78); opacity 0} 55%{opacity 1} 100%{translateX(-50%) scale(1); opacity 1}` | yes — P1, P5 |
| `bPopY` | `0%{translateY(-50%) scale(.78); opacity 0} 55%{opacity 1} 100%{translateY(-50%) scale(1); opacity 1}` | yes — P8 ending |
| `bBloom` | `0%{scale(.56); opacity 0} 35%{opacity 1} 100%{scale(1); opacity 1}` | yes — P4b, P5b, P6a, P7 |
| `bBloomC` | `0%{translateX(-50%) scale(.56); opacity 0} 35%{opacity 1} 100%{translateX(-50%) scale(1); opacity 1}` | yes — P2, P3, P4 |
| `tLight` | `0%{brightness(.4) saturate(.8)} 100%{brightness(1) saturate(1)}` | yes — every lit element |
| `tCascade` | `0%,100%{translateY(0) scale(1) brightness(1)} 45%{translateY(-2px) scale(1.01) brightness(1.2) saturate(1.2)}` | yes — the whole toolbox on beat 6 |
| `tGlow` | `…45%{translateY(-2px) scale(1.015) brightness(1.18) saturate(1.18)}` | yes — the beat-1 home cascade |
| `tGlowF` | `…45%{brightness(1.18) saturate(1.18)}` (filter only, no move) | yes — the disc + the planner door |
| `tGlowS` | `…45%{translateY(-2px) scale(1.05) …}` | yes — the strip pills on beat 2 |
| `tGlowT` | `…45%{translateY(-2px) scale(1.02) brightness(1.15) saturate(1.15)}` | yes — the shortcut tiles on beat 4 |
| `tourRingThin` | `0%{scale(.92) bw 3px op 0} 18%{op .9} 100%{scale(1.3) bw 1px op 0}` | yes — the three thresholds |
| `thumbSwipeUp` / `thumbSwipeDown` / `thumbSwipeDownShort` | as DIFF-2026-09-05 | yes |
| `tourPulse` · `tourGlowBreathe` · `trailDot` · `tourArrowNudge` | — | **declared, used 0 times** (unchanged from the first pull) |

## B · Per beat: the bubble's animation + transform-origin (computed, 1-based beat in brackets)
| beat | panel | bubble animation shorthand | `transform-origin` (computed → authored) | positioning the origin implies |
|---|---|---|---|---|
| 0 (1) | P1 home | `bPopC .48s cubic-bezier(.34,1.56,.64,1) .08s 1 both` | `148px 126.156px` → `50% 80%` | `left:50%; transform:translateX(-50%)` |
| 1 (2) | P2 strip | `bBloomC .56s cubic-bezier(.22,.9,.3,1) .08s 1 both` | `148px -10px` → `50% -10px` | centred; origin at the UP tail tip |
| 2 (3) | P3 tracker | `bBloomC .56s … .08s both` | `148px -10px` → `50% -10px` | centred; UP tail tip |
| 3 (4) | P4 shortcuts | `bBloomC .56s … .08s both` | `148px 167.695px` → `50% calc(100% + 10px)` | centred; DOWN tail tip |
| 4 (5) | P4b scroll | `bBloom .56s … .08s both` | `181px 195.581px` → `{{p4bTailLeft}}px 108%` | pinned left; origin = tail centre x |
| 5 (6) | P5 toolbox | `bPopC .48s cubic-bezier(.34,1.56,.64,1) .08s both` | `155px 144.875px` → `50% 80%` | `left:50%` centred |
| 6 (7) | P5b go home | `bBloom .56s … .08s both` | `33.6px 170.311px` → `12% 108%` | pinned left; origin = tail centre x |
| 7 (8) | P6a settings | `bBloom .56s … .08s both` | `27px -10px` | pinned left; origin = tail centre x |
| 8 (9) | P7 journey | `bBloom .56s … .08s both` (`p7Anim`, side layout) | `187px -10px` (`p7Origin`) | pinned left; origin = tail centre x |
| 9 (10) | P8 ending | `bPopY .48s cubic-bezier(.34,1.56,.64,1) .08s both` | `165px 75.4137px` → `50% 45%` | `top:50%; transform:translateY(-50%)` |
| 10 | end | — (no bubble, no scrim) | — | — |

**The law the origins encode: the pop bubbles pivot inside themselves (`50% 80%` / `50% 45%`); the bloom bubbles
pivot on their TAIL TIP** — origin x is always the tail's centre x inside the bubble, origin y is 10px outside the
edge the tail leaves from (`-10px` up, `calc(100% + 10px)` / `108%` down — the two spellings differ by ≤4.5px).

## C · Per beat: everything else that animates
| beat | element(s) | animation | delays |
|---|---|---|---|
| 0 (1) | 5 strip bars + chevron | `tGlow .9s cubic-bezier(.22,.9,.3,1) <d>s both` | .40 .58 .76 .94 1.12 **1.30** |
| 0 | the 5 icons under the bars | `tGlow .9s …` | .40 .58 .76 .94 1.12 |
| 0 | date line | `tGlow .9s …` | 1.10 |
| 0 | the disc | `tGlowF .9s …` | 1.25 |
| 0 | "What now?" / sub-line | `tGlow .9s …` | 1.45 / 1.55 |
| 0 | the Planner door | `tGlowF .9s …` | 1.70 |
| 0 | the 4 shortcut tiles | `tGlow .9s …` | 1.85 2.05 2.25 2.45 |
| 0 | the TOOLS hint | `tGlow .9s …` | 2.65 |
| 1 (2) | the LIT strip | `tLight .45s cubic-bezier(.22,.9,.3,1) 0s both` | 0 |
| 1 | 6 bars/chevron + 5 icons | `tGlowS .7s cubic-bezier(.22,.9,.3,1) <d>s both` | .15 .27 .39 .51 .63 **.75** |
| 2 (3) | the LIT disc | `tLight .45s … 0s both` | 0 |
| 3 (4) | the LIT hero row | `tLight .45s … 0s both` | 0 |
| 3 | the 4 tiles inside it | `tGlowT 1.5s cubic-bezier(.22,.9,.3,1) <d>s both` | .15 .35 .55 .75 |
| 4 (5) | the LIT TOOLS block | `tLight .45s … 0s both` | 0 |
| 4 | ring / thumb | `tourRingThin 1.9s ease-out infinite` / `thumbSwipeUp 2s ease-in-out infinite` | 0 |
| 5 (6) | 8 grid tiles | `tCascade 1.4s cubic-bezier(.22,.9,.3,1) <d>s both` | .40 .46 .52 .58 .64 .70 .76 .82 (`casc(toolsGrid,.4,.06)`) |
| 5 | 2 hero rows | `tCascade 1.4s …` | 1.00 1.10 (`casc(toolsHeroes,1.0,.1)`) |
| 5 | 6 bento folders | `tCascade 1.4s …` | 1.30 1.36 1.42 1.48 1.54 1.60 (`casc(toolsBento,1.3,.06)`) |
| 6 (7) | the HOME cue **and** the home button (BOTH lit) | `tLight .45s … 0s both` | 0 |
| 6 | ring (76⌀ around the home button) / thumb | `tourRingThin` / `thumbSwipeDown 2s` | 0 |
| 7 (8) | the settings icon | `tLight .45s … 0s both` | 0 |
| 8 (9) | the JOURNEY cue | `tLight .45s … 0s both` | 0 |
| 8 | ring **88.2 x 41** (`origin 44.1094px 20.5px`) / thumb | `tourRingThin` / `thumbSwipeDownShort 2s` | 0 |
| 9 (10) | nothing but the bubble | — | — |

## D · The beat-entry sequence — what the prototype can and cannot say
* **`grep transition` over the whole bundle = 0 hits. The scrim carries NO animation and NO transition:** it is a
  plain `<div style="position:absolute; inset:0; z-index:5; background:rgba(32,10,36,.62)">` that exists or does not
  (`showScrim: beat < 10`). So the frame's own answer to "instant or faded?" is **INSTANT**.
* The frame is a STATIC COMPOSITION PER BEAT — every beat re-renders the whole screen and every animation restarts
  from its own delay. There is no cross-beat transition anywhere in it, so **"bright → dark → bubble" is David's
  words, not something the frame can draw.** It is constructed here, and the construction is named:
  | phase | value | where it comes from |
  |---|---|---|
  | 1 · bright | the screen with NO scrim and NO bubble, held **380ms** | **CHOSEN** — the frame is silent; a cut with no hold would never read as "bright first" |
  | 2 · dark | the scrim fades in over **.45s cubic-bezier(.22,.9,.3,1)** | the frame's own arrival curve — `tLight` is literally the other half of this moment (the lit thing brightens while the room darkens), so it lends its timing |
  | 3 · bubble | mounts at scrim-start, animates with the frame's own **.08s** delay | frame-verbatim |
  | 3b · lit | `tLight .45s cubic-bezier(.22,.9,.3,1) both`, delay 0 | frame-verbatim |
* **Arrivals** = the first beat on each screen: 0 (home, tour start), 5 (tools), 7 (home again), 9 (journey).
  Beats within a screen (1,2,3,4,6,8) keep the scrim up and only re-run the bubble + the new `tLight`.
* On an arrival that follows a gesture the sequence waits for the scroll to SETTLE first (scrollTop stable across
  two frames + 100ms, 1200ms ceiling) — item 7, "nothing pre-mounted while the user is still scrolling".

## E · The P1 relation — measured, with animations suppressed (item 2)
| | frame (402x874) | app (430x932) | app (402x874) |
|---|---|---|---|
| the pink circle | `110.9, 274.4, 180.2⌀`, centre **(201, 364.5)** | `118.7, 294.1, 192.5⌀`, centre **(215, 390.3)** | `111, 274.9, 180⌀`, centre (201, 364.9) |
| the P1 bubble | `53, 285, 296 x 157.7`, centre **(201, 363.8)** | v1416: `67, 285`, centre (215, 363.9) | v1416: `53, 285`, centre (201, 363.9) |
| Δ centre (bubble − circle) | **(0, −0.7)** | **(0, −26.4)** ← the defect | (0, −1.0) |
**The frame centres the P1 bubble on the pink circle (0.7px high).** The app's circle is NOT higher than the mock's —
scaled it lands within 0.4px (364.5 x 1.0697 = 389.9 vs 390.3). What broke on David's phone is that v1416 ported the
bubble's **absolute artboard y (285)** as a device px while the circle rode the board's 1.0697 scale, so the bubble
sat 26px high on the circle. The port therefore anchors beat 1's bubble to the **live circle's centre, −0.7px**,
which reproduces 285 exactly at 402 and corrects to 311 at 430. Beat 6's toolbox bubble (the other absolute `top`)
scales its artboard y by the board scale for the same reason; the ending stays viewport-centred (the frame's 353.2
on an 874 board IS dead centre).

## F · What the port must deviate on, named
1. **The scrim is per LAYER, not one sheet.** #tfWorld is a composited scroller on iOS, so its subtree flattens into
   one layer and a raised child can never out-paint a scrim that is a SIBLING of the scroller — which is why the
   strip read dim on beat 2 and the whole flow layer read dark on beat 5 on David's phone. Each layer now dims
   itself: `#tourScrimW` inside `#tfWorld`, the frame's own unlit filter (`brightness(.4) saturate(.8)`, tLight's
   0% frame) on `#tfHud`'s and `.jr-host`'s children, `.tour-pdim` inside `#guardPuck`. The HUD's dim is therefore a
   FILTER, not a veil (a second veil over the HUD would double-dim its 10px overflow band into a visible rectangle);
   measured against the veil it lands within ~18/255 per channel on the HUD's pink glyphs.
2. **The lock is a CLAMP, not `touch-action: pan-up/pan-down`.** WebKit does not implement the single-direction
   touch-action values, and an unsupported value parses away to no restriction at all — the opposite of a lock. So
   the catcher carries `touch-action:none` (reading beats) / `pan-y` (gesture beats) and a scroll listener pins
   scrollTop into the beat's own `[lo,hi]`. **This is the one place the tour writes scrollTop**, and it is the
   exception the build rules name.
3. **The journey cue ring** is sized to the FRAME's ring (88.2 x 41 artboard, x the board scale) centred on the
   app's own cue centre, and starts at `scale(1)` (`tourRingCue`) — item 8. The other two rings keep the frame's
   authored recipes and the frame's `tourRingThin`.
4. **Beat 7 (go home) lights the app's away-puck**, which has no counterpart in the frame's bottom-left home button;
   beat 10's bottom-left home button likewise has none. Unchanged from DIFF-2026-09-05.
