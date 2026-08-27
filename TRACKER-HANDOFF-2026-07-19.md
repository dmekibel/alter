# ALTER TRACKER-HANDOFF — 2026-07-19 (pitch decks + book canon + two queued tasks)
**Supersedes** TRACKER-HANDOFF-2026-07-08 as the newest working handoff. Read this first, then the memory files it names. This session produced the mom/investor pitch decks and mined 17 of 32 books; it queues TWO tasks for the next sessions.

---

## STATUS UPDATE (2026-08-27 (17), THE STALE READ + the phone becomes the instrument): v1396
David's v1395 videos ("double fail"): the backward jump SURVIVED the momentum kill — same signature both videos, which falsifies the two-writer theory. Real cause: during a fling, iOS's main-thread scrollTop READ lags the compositor by 1-2 frames; every commit sprang from that stale value (v1395's kill even re-asserted it — an own goal), writing a position the screen had already left. Magnitude = the flick's per-frame travel, which is why it scaled with speed and survived modes 12/render-freeze/kill: JS cannot read the compositor, so no main-thread detection could ever see it.
**v1396:** (1) `wLiveStart` — commits start from scrollTop + last velocity × (event age + one frame), capped ±140, only while moving; wKillFling no longer writes scrollTop (toggle only). (2) **SCROLL TRACE** (dev menu 📈, arm → gesture → report → COPY REPORT): finger td/tm/tu (David's own ask: "record my actual interaction with my thumb"), every scroll event, every engine write, kill pre/post (answers on-device whether the toggle syncs the read), commits raw-vs-extrapolated, cascades; analysis lists REVERSALS / FINGER release-velocity with gap-to-commit and gap-to-reversal. (3) mode 13 = "stale-start engine" reverts the whole fix for A/B. Boots clean; DEVICE-UNTESTED. Trace flagged a possible doubled tcCascade/jcCascade(-1) on a dev-jump — confirm on a real gesture via the trace before chasing.
**ONE move — David:** fresh.html (v1396) → flick test. If jitter remains: dev menu → 📈 arm → ONE hard flick home→journey → 📈 report → COPY REPORT → paste it here. That paste replaces all video forensics.
**ONE move — Claude:** read the pasted trace: commit ext vs finger release velocity names the true lag constant; kill sync Δ answers the toggle question; then tune wLiveStart from data, not theory.

## STATUS UPDATE (2026-08-27 (16), THE TWO-WRITER FIGHT, measured and killed): v1395
David's new recording (modes OFF and 12, three flicks each): frame-tracked the pink play button through both bands — mid-transition the column physically jumps BACKWARD ~40px for ONE frame, then continues (275→300→341→373→**345**→385). Same artifact both modes. Root cause: the fling catch starts wSpring while iOS's native momentum fling is still alive; the compositor keeps writing its own trajectory — two writers, SAME direction, different speeds. Mode 12 was blind to it by construction (its yield rule looks for opposing motion; scroll events only report the merged result). The sawtooth also re-crosses the cascade thresholds every jump = the "already there" rows + the pink-button flicker. One cause, both symptoms. The design never met this: macOS wheel momentum has no second writer.
**v1395:** `wKillFling` — overflowY hidden for one forced-reflow frame at every wSpring/wScrollTo/wSpringNative start (the platform's momentum off-switch, device-proven in this app by the pinch-zoom cut of 2026-06-27), so the engine is the single scrollTop writer; the fling catch gated `!_wTouch` (never fight a finger-pinned compositor — commits on the first momentum event after release instead, same feel); **mode 13 = momentum kill OFF** (one ◀ tap resurrects the old fight for A/B). Boots clean; gesture feel DEVICE-UNTESTED.
**ONE move — David:** fresh.html (v1395), scroll test OFF, same three-flick test. Position still jumping? Cascades still early? (Mode 13 = the old behaviour if he wants the side-by-side.)
**ONE move — Claude:** if jitter survives v1395, instrument the transition on-device (log every scrollTop writer per frame into the 📐 overlay) before touching the engine again.

## STATUS UPDATE (2026-08-27 (15), never render into a moving column): v1394
David re-tested (on v1392) with three flick strengths: jitter in ALL three, and mode 12 did NOT fix it — the self-write hypothesis is dead as the main cause. But his description split the fault precisely: **(a)** "the rate at which the cascade is appearing is wrong — sometimes the things appear to be already there before the cascade happens"; **(b)** "the actual positioning of the scroll jitters."
**BOTH ARE THE MASTER TICK RENDERING MID-TRANSITION.** renderOnePageWorld runs on every renderAll/minute tick, INCLUDING while the column is moving. In flight it: REBUILDS the shelf (fresh rows land fully visible until the resync hides them — literally "already there before the cascade"); re-runs wMeasurePad, whose padding writes the browser's SCROLL ANCHORING answers by silently adjusting scrollTop (the position jump — with 26,000px of sky above home, one padding write above the viewport moves the world under your finger); and re-arms both cascades' resting state under a running animation.
**Fixes:** (1) renderOnePageWorld now DEFERS while the column is moving (spring flying, finger down, or scroll events in the last 250ms) — coalesced to one run 300ms after settle; first-open exempt (_worldPositioned false). A transition lasts ~1s and home is a calm face; nothing in that render is urgent. (2) `overflow-anchor:none` on #tfWorld — this engine owns its landings, the browser must never move the column on its behalf.
**Verified:** anchorCss computes "none"; boots clean; landings unchanged. The tab's 2 recurring gate fails reproduce on SHIPPED builds there (the half-hidden pane starves the wake observer) — environmental, on record since (13).
**ONE move — David:** fresh.html (v1394), scroll test OFF, the same three-flick test. Cascade timing right? Position still jumping?

---

## STATUS UPDATE (2026-08-27 (14), the scroll test stops wasting his time): v1393
David: "switching scroll tests is inconvenient — every time you click one it closes the dev menu and you have to reopen it and click it again. Think of a better way to select the twelfth one." Twelve modes behind a self-closing sheet is twelve open-tap cycles per pass; he is testing constantly right now, so this was costing more than the tests.
**The readout became the switcher.** It is already on screen while he tests, so the controls live on it: **◀ / ▶ / ✕**, 44px targets (the app's own tap-size rule), the mode name and the live fps in the middle. No dev menu at all once it is up.
**Three things make it one tap:** (a) at OFF the panel STAYS (it used to remove itself, which made ◀ unreachable from a fresh load) and reads "◀ is the last test"; (b) ◀ from OFF WRAPS to the LAST mode — verified live: one tap from OFF lands on **12 · engine ignores its OWN scrolling**, which is the one he actually needs; (c) the chosen mode PERSISTS in localStorage and is restored at boot when dev is on, so a fresh.html reload no longer resets him to OFF.
**And the dev row no longer closes the sheet:** a row may now return "keep", which leaves the sheet open and relabels the row in place — verified OFF → 1 → 2 without a single reopen. ✕ dismisses the panel outright; the dev row brings it back. All of it dev-only.
**ONE move — David:** fresh.html (v1393) → one ◀ tap → mode 12 → scroll fast. Does the pink button stop flickering, and does the speed-up-then-jerk go away?

---

## STATUS UPDATE (2026-08-27 (13), THE PORT OMISSION — behind mode 12): v1392
David narrowed the jitter properly, and neither mode 5 nor mode 1 fixed it — so it is not the rows and not the sky. His two descriptions: **(a)** "the big pink button flickers on and off — either you scroll to it and see it appear once, or scroll away and see it disappear once, instead of it flickering"; **(b)** "I'm scrolling quickly and it starts going quickly and then it TRIES TO SLOW ITSELF DOWN, and in the process it does a jittery jump."
**ONE ROOT CAUSE, and it is an omission in the original port.** The design's engine MARKS every scrollTop it writes and ignores those events (`selfW`, **7 places** in Journey Scroll v22). This app's port has **zero**. Consequences, exactly matching his two reports: the engine derives velocity and DIRECTION from its own spring's motion — and `_wDir` is what the cascades read, so the board flips exit/arrive under him (the pink-button flicker); and it can never notice the user's momentum OPPOSING the spring, so iOS's scroll and ours write scrollTop in the same frames and fight ("tries to slow itself down, then jumps").
**Written, and DELIBERATELY NOT DEFAULT.** All 7 marks are ported (spring per-frame + both exits, the tween, the hold pin) plus the consumer: during an animation, ignore our own echo, and if the column has moved ≥12px AGAINST the spring, stand the spring down and hand the gesture its real velocity. (12px, not the design's 1.5: a scroll event is dispatched a frame or more after the write that caused it, so at 1.5 the tween's own lag reads as opposition and killed the door on its first frame — caught in preview.)
**WHY IT IS BEHIND A FLAG:** it rewrites the hottest path of the engine David has just called "much, much, much, much better", and THE PREVIEW COULD NOT VERIFY IT — the Browser pane keeps going hidden, which freezes requestAnimationFrame and strands every tween mid-flight (three attempts, three frozen runs; the same dead door and the same 2 gate failures reproduce on the SHIPPED v1387 in that tab, so they are environmental). Shipping an unverified rewrite of @SEC:WORLD-MOTION as the default is precisely how this surface got rebuilt three times. It is **scroll-test mode 12**, for the only instrument that can judge it: his phone. Diff-verified inert when off — with the flag false the only code that executes is assignments nothing reads, so the default build is behaviourally identical to v1391.
**ONE move — David:** fresh.html (v1392) → dev menu → 🎚 Scroll test → **mode 12** → scroll fast, home↔journey and inside the line. Does the pink button stop flickering, and does the "speeds up then jerks slower" go away? If yes, it becomes the default and the flag dies.

---

## STATUS UPDATE (2026-08-27 (12), the empty sky): v1391
David on v1390: the hard-scroll-down bug is FIXED. Two things left.
**BUG FIXED — "clicking the little journey button above the home takes you to journey, but nothing appears, it's just an empty sky."** REPRODUCED in preview: after the door, seven rows sit on screen, correctly positioned, and ZERO of them are lit. Cause: `wSpring` sets `_wUp` AND `_wDown`; **`wScrollTo` only ever set `_wUp`**, so `_wDown` kept whatever the last spring left on it. Arrive with a stale `_wDown = true` and the sky cascade's own guard — `u2 > .3 && !_jcShown && up && !(_wAnim && _wDown)` — is false for the entire tween, so the door lands on a line that is present, on screen and still at opacity 0. A tween is a direction like any other and must declare it like any other. VERIFIED after: 7 of 7 rows lit, landing exact (25224), the HOME door returns exactly (26098), gates 97/97. (Latent since the door was written; v1390 made it likely by leaving `_wDown` true more often.)
**OPEN — the jitter, and a MEASUREMENT instead of a guess.** He reports v1390 slightly worse than v1389, and that a HARDER/faster flick increases it. That fits v1390's own change: bounding the descend catch means deep flicks now run on NATIVE momentum instead of being caught by our spring, so more of the gesture is the phone scrolling the 26,000px line itself. The suspects are the rows' first-raster as the window reveals them, and the sky's gradient across the full height. Both are already isolable with the scroll test he has — the instruction given to him is to do the FAST FLICK INSIDE THE JOURNEY (not the transition) in **mode 5 (all rows hidden)** and **mode 1 (starfield off)**: mode 5 clean → the rows; mode 1 clean → the sky. That names it in two taps instead of another blind round.

---

## STATUS UPDATE (2026-08-27 (11), the layout-thrash fix LANDED + the descend bug): v1390
**DAVID'S VERDICT ON v1389: "It's much, much, much, much better, so I don't wanna lose the progress."** The layout-thrash diagnosis was right — that was the chop. A very subtle jitter remains (open, see below).
**BUG, and it was mine (v1379).** "If you're up in the journey and you just do one hard scroll down, it takes you all the way back down to home… it should just be like scrolling in any other iPhone app, the momentum takes you wherever it goes." The descend-out-of-the-sky branch I added for the one-zone law had NO FLOOR, so it fired at any height above home: one downward flick taken deep in the line became a flight to home. It is the exact mirror of the upward lock v1378 killed, and it takes the mirror bound — `st >= wSkyY() - 6`, so the catch belongs to the home↔journey band and above the landing the phone's own momentum owns the gesture (the free-scroll law wSnapIntent already encodes). VERIFIED both ways: a hard downward flick at 12000 lands at 13800, exactly where the momentum took it, `flewHome:false`; the same flick from the landing still commits to home (26098). Gates 97/97.
**OPEN — the subtle jitter.** Not chased this round: the thrash fix moved the needle enormously and the next suspect list (the four scrubs still writing per scroll event, the cascades' own keyframes) is speculative. Worth ONE targeted measurement on device before touching anything, not another blind round.
**OPEN — DAVID ASKED FOR A DESIGN:** "scrolling up in the journey too high makes you get lost. So I wanna design a little scroll bar, but that should be designed in Claude Design. So give me a prompt for that." Prompt delivered in chat (a position rail for a 26,000px / 36-chapter line). NOTE: the Chapter Line canvas already prototypes one — `#jTrack`/`#jThumb` in its own script, with the caption "Pull the rail beside the phone to climb" — so the prompt names that as the starting point rather than inventing from zero.

---

## STATUS UPDATE (2026-08-27 (10), THE LAYOUT THRASH — likely the whole chop): v1389
David: "fix the 2 things" (the mode-11 cascade glitches + the swipe that outruns the finger).
**THE FIND — and it fits every fact so far.** `wHomeY` / `wToolsY` / `wSkyY` / `wSpan` each read LAYOUT (`home.offsetTop`, `scrollHeight`, `clientHeight`), and **onWorldScroll alone calls them SEVEN times per scroll event** — with the four scrubs writing inline styles in between. Write → read → write → read: every read after a write forces a SYNCHRONOUS LAYOUT of a 26,000px document, and the spring fires one of these per animation frame for the entire length of a transition. That is layout thrashing, not painting — which is precisely why stripping the starfield, the textures, the shadows, the blend layers, the cascades AND the parallax changed nothing on his phone (his own mode 5/6/9 numbers). Scrolling cannot alter any of those three numbers, so they are now computed once and reused until something that CAN move them says so: **wAnchorsDirty** on every render, every pad write, resize, teardown, and after the line builds (that one adds ~26,000px of sky, so anchors measured before it are meaningless).
**PROVEN SAFE:** the cached anchors equal the freshly measured ones in all three states — initial, after a resize (invalidated + recomputed), and after a 12,000px scroll (deliberately NOT invalidated): `home 26098 · tools 26693 · sky 25224` every time. The optimization cannot move a landing by construction. A pre-layout guard refuses to cache when `clientHeight` or the home target is still 0 (the zones are `display:contents` until the one-page classes land, and freezing that gave a sky landing one pixel above home — i.e. a journey door that does nothing; caught in preview, fixed before shipping).
**THING 2 — the cascades no longer need the spring.** The mid-glide arrival was gated on `_wAnim`, which mode 11 stands down, so the board could only arrive on the settle debounce — exactly what left David watching home build a beat AFTER he arrived ("it looks like home is already there, and it just appears a second time"). Now `(_wAnim || _wCssSnap)`: inert in the default engine, and in mode 11 the arrival fires mid-glide as designed.
**THING 3 — the honest one.** "A gentle swipe you let go of is a little too fast, it doesn't follow the finger speed" is inherent to CSS scroll-snap: the settle animation is browser-controlled, with no API for duration or easing. The REAL answer is that the JS spring already follows velocity — it was only ever choppy because of the thrash above. If this fix lands, mode 11 is unnecessary and the default engine keeps his preferred feel.
**VERIFICATION LIMIT, stated plainly:** the tween-driven door transitions could NOT be re-verified this round — the Browser pane keeps going hidden, and a hidden pane freezes requestAnimationFrame (the documented preview lie), which strands any tween mid-flight. The SAME two gate failures and the same dead door reproduce on the SHIPPED v1387 in that tab, so they are environmental, not this change. What is verified: clean boot parks at home, `_wAnim` false throughout, anchors exact in all three states, ratchet flat.
**ONE move — David:** fresh.html (v1389) with the scroll test OFF (the normal build) — is home↔journey and home↔tools smooth NOW? That is the question this whole round exists to answer; if yes, mode 11 and its trade-offs can be deleted.

---

## STATUS UPDATE (2026-08-27 (9), the spin regression undone): v1387
David on v1386. Mode 11 "almost perfect" now — a slow swipe that keeps contact is "pretty great", home→journey "looks pretty great", journey→home "looks good". But v1386's spin introduced a REAL visual regression and he named it exactly: "the spinning destroyed what the stone looks like… it gets rid of the little highlight above, a little shadow below, and the symbol on it", "makes it less square", and "the animation doesn't start instant — it should already feel like it's already spinning once you arrive".
**Root cause, all three:** `--ss`'s two INSET shadows paint above an element's background but BELOW its children. The moment the fill became a child layer it covered them — precisely the missing highlight and inner shadow. And v1386 spun a 104% SQUARE inside a border-radius clip, so the engine re-clipped a rotating layer every frame, which is what softened the edge ("less square").
**Fixed:** the fill layer is now the CIRCLE ITSELF (`inset:0; border-radius:50%`) — a circle's silhouette is unchanged by rotation, so there is nothing to re-clip. A ray stone keeps only the OUTER drop shadow on itself and wears the two insets on a still `.jl-lstone-sheen` ABOVE the fill and BELOW the glyph — same pixels, same order as every other stone. Verified: ray stone = 1 outer shadow + a 2-inset sheen, plain stone = 3 layers unchanged, order tex→sheen→icon→glisten, icon visible.
**"Already spinning on arrival":** rows wake by having `animation:none` lifted, which restarts the keyframes at 0deg — visible as a start. Both spins now carry a per-chapter NEGATIVE delay (the same trick the glisten's phase chain uses), so a stone is never caught at the top of its cycle. Verified awake: `mSpin 110s, delay -107s`, transform already mid-turn.
**STILL OPEN, mode 11 only (told him plainly rather than quietly shipping around it):** the cascade glitches he listed — home appearing twice from the tools, the four hero tiles not animating in from the journey, and the folders behaving oddly on a 20-30% pull-and-release — are all one cause: the cascades' arming is coupled to the JS spring (`_wAnim`), and mode 11 stands the spring down. Making mode 11 the default requires decoupling cascade arming from the spring — real @SEC:WORLD-MOTION work, not a patch, and it is the next job.
**ALSO OPEN, and probably not fixable:** "a gentle swipe you let go of is a little too fast, it doesn't follow the finger speed." CSS scroll-snap's settle animation is browser-controlled — there is no API to tune its duration or easing. Honest answer: with the OS driving, we get its speed.
**Gates 97/97 both sizes · ratchet flat. ONE move — David:** fresh.html (v1387): do the stones look right again (highlight, inner shadow, glyph) and do they read as already turning when you arrive?

---

## STATUS UPDATE (2026-08-27 (8), his four corrections): v1386
David on v1385, four precise notes — all four addressed.
**(1) "The spinning ray patterns spin too fast."** 34s → **90s** per revolution on the gates.
**(2) "I don't see why chapter 10 is spinning, it's not a ray pattern."** He is right, and v1385's rule was lazy: it tested for `conic-gradient`, but a conic gradient is not automatically rays. HIS OWN SWATCH LABELS in the design file separate them, and his labels are the truth (frame-wins order). RAYS → spin: **9 pinwheel · 11 sunburst · 12 the full spectrum · 17 rays · 23 the palette · 32 arena** (6, was 11). CHECKERS → drift: 10, 27 (ch10 is the one he caught). HOLOS → drift: 3, 20, 31 (smooth colour wheels, no lines at all). Kept as a NAMED SET, not a regex — every inference from the CSS misreads one of his checkers, and a wrong guess here is a design error rather than a bug.
**(3) "The stones themselves need to spin too, also slowly."** A stone cannot spin its own background (the element carries the icon), so the fill moves onto its own layer that turns under a still glyph, at **110s**. The wash rides with it (a uniform sheet is identical at every angle) and the layer is a square of the circle's diameter — enough at ANY rotation, because a square's inscribed circle does not change when you turn it. DOM order carries paint order: texture → icon (positioned, lifts above it) → glisten sweeping over both, the same stacking every other stone has. VERIFIED awake: 5 ray stones turning, `mSpin 110s running`, transform advancing, **icon provably still**, 77px layer on a 74px stone.
**(4) MODE 11: "swipe hard and let go, basically fixed; swipe slowly, it just gets stuck" + "the journey feels slower to scroll up through, a little clunky."** Both are one property: `proximity` snaps only when the gesture ENDS near a landing, so a slow drag strands you between zones and a climb up the line keeps getting grabbed. Neither strictness is right everywhere, so strictness is now set BY REGION from JS (one class write when the region changes; the OS still does all the moving): **MANDATORY** from the journey landing down through the tools, **NONE** the moment you climb above the landing — because up there the sky has no snap point at all, and leaving mandatory on would drag a climber back to the line's start, the exact bug v1378 killed. The landing itself is INSIDE the band (6px of slack below it, never above). VERIFIED: tools/landing = `y mandatory` · 20px above the landing = `none` · deep = `none`; and entering the mode while already parked primes the band instead of waiting for a scroll.
**Gates 97/97 both sizes · ratchet flat. ONE move — David:** fresh.html (v1386) → mode 11 again: does a SLOW swipe now land instead of sticking, and does climbing the line stay free? Plus: spin speeds right, and is the ray set the right six?

---

## STATUS UPDATE (2026-08-27 (7), rays turn instead of sliding): v1385
David: "I like how the patterns are kinda moving left and right, but I don't think that movement really fits for the shapes which have radial lines going outwards — those would make more sense if they just spin within the pattern itself instead of sliding left/right."
**Built by what the texture IS, not a hand-kept list:** any chapter gate whose fill contains a `conic-gradient` (= rays radiating from a centre) now rotates instead of drifting. **11 of 36** qualify (chapters 3, 9, 10, 11, 12, 17, 20, 23, 27, 31, 32); the other 24 keep David's mDrift exactly as it was. A sliding sun reads as the whole disc wandering off its own axis; turning reads as the thing itself rotating.
**The geometry mattered:** `.jl-l-tex` is a 190% RECTANGLE — ample for a slide, wrong for a rotation (at 90° its short side falls inside the card and the corners open). The spin variant is a SQUARE wider than the card's diagonal (833px against a 362x74 card, diagonal 369), centred with the `translate` property so `transform` stays free for the rotation. 34s linear — rays should turn like a slow wheel, never pulse.
**VERIFIED live:** 11 spinning / 24 drifting, an awake gate reads `mSpin 34s running` with its transform matrix genuinely advancing, sleeping gates still carry no animation at all, gates 97/97 both sizes, ratchet flat. **DEVICE-UNTESTED:** the look of the turn on his phone.
**OPEN — his call in one line:** 11 more chapters use RADIAL gradients that are mostly concentric rings (6, 7, 13, 14, 15, 16, 18, 21, 26, 30, 34). Spinning perfect rings is invisible, so they were left drifting — say the word if any of those read as "rays" to him too.

---

## STATUS UPDATE (2026-08-27 (6), HIS DATA CLOSED THE CASE): v1384
**David ran the whole scroll test on device and recorded it (89s, all modes 1-9). The numbers settle four rounds of argument:**
| mode | fps | worst frame |
|---|---|---|
| 1 starfield OFF | 60 | 19-37ms |
| 2 textures FLAT | 60 | 17-36ms |
| 4 shadows OFF | 49-51 | 52-78ms |
| 5 **ALL ROWS HIDDEN** | 47-59 | 32-**71ms** |
| 6 everything stripped | 52-60 | 27-51ms |
| 8 parallax OFF | 48-52 | 38-60ms |
| 9 cascades AND parallax OFF | 48-60 | 28-**85ms** |
**NO MODE FIXES IT.** With the journey line literally invisible (5) and with cascades + parallax off (9) his phone still hitches 28-85ms. Every paint suspect is eliminated: not the textures, not the starfield, not the shadows, not the blend layers, not the cascades, not the parallax. The cost is the TRANSITION MACHINERY — which is exactly what he guessed ("maybe something to do with our magnet feature"). Average fps stays 47-60 while individual frames blow to 50-85ms: not a paint budget problem, a periodic BLOCK.
**Fix shipped — wMeasurePad is memoised.** It writes padding then reads getBoundingClientRect on a 26,000px document (a forced synchronous layout) and it runs at the START of every snap and every fling — precisely where the long frames land. Its inputs (viewport · shelf height · deck height · scale) barely ever change, so it now recomputes only when one of them actually differs; the render and resize paths pass `force` (a rebuild can hand back identical heights while the inline padding it depends on was wiped).
**MODE 10 REJECTED BY DAVID, and he is right:** "when I do a gentle flick, it scrolls faster than I flicked it, so it feels unnatural." That is the defining weakness of `scrollTo({behavior:"smooth"})` — a fixed duration with NO velocity handoff.
**MODE 11 — the answer to both halves: CSS scroll-snap.** iOS runs it on the compositor AND settles it with the momentum the finger actually gave, which is the thing our JS spring hand-rolls at the cost of driving scrollTop every frame. `proximity` (never `mandatory`) keeps deep reading free. The three snap points are the zones themselves and VERIFIED to resolve to the exact landings: home top → 26098 · sky bottom − viewport → 25224 (= wSkyY) · ground bottom − viewport → 26693 (= wToolsY). The JS spring STANDS DOWN when it is on (wMaybeSnap and the fling catch both bail) — two snap models at once is the bounce the constitution bans.
**Gates 97/97 both sizes · ratchet flat · both door landings verified after the memo. ONE move — David:** fresh.html (v1384) → scroll test → **mode 11** → home↔journey, home↔tools with gentle flicks AND hard ones. If it feels right, the JS spring comes out and CSS snap becomes the engine (a real @SEC:WORLD-MOTION change — his verdict first).

---

## STATUS UPDATE (2026-08-27 (5), the magnet is the machine): v1383
David: "feels like even when shutting everything off there is a scroll lag, maybe something to do with our magnet feature. but u judge urself and analyze the video carefully." **HIS VIDEO ARRIVED AS A 0-BYTE FILE** (verified `ls -l`, and the rig produced no frames from it) — told him plainly rather than pretending to have watched it. His hypothesis stands on its own in the code.
**HE IS RIGHT ABOUT THE MACHINE.** `wSpring` hand-integrates a damped spring and assigns `w.scrollTop = x` on EVERY rAF frame. Driving a native scroller from JS is the one scroll pattern iOS cannot hand to the compositor, and the magnet is the ONE thing live through every transition he calls choppy (and only during transitions — which is exactly why deep-line scrolling was never the complaint). Each of those writes also fires a synchronous scroll event → four scrubs → inline style writes.
**Shipped now (no feel change):** `wPut` — every scrub write compares before assigning. Seven sites routed (both HUD labels ×3 props, the TOOLS hint, the Planner pill ×2, the strip ×2, and the sky parallax). An identical assignment still dirties style on WebKit, so a transition was paying a style recalc per element per frame for values that were mostly constant (a clamped "0" opacity rewritten sixty times a second; the parallax transform CLEARED to the same "" at both rest states on every event).
**Shipped as an A/B, OFF by default (feel change, his call):** scroll-test **mode 10 · NATIVE transitions** swaps the spring for `scrollTo({behavior:"smooth"})`, which iOS runs on the compositor. It loses the velocity handoff and the tuned easing, so only his phone can judge it — two taps to flip. If native feels better, the spring's physics come out and that becomes the road; that would be a real change to @SEC:WORLD-MOTION and needs his verdict first.
**Gates 97/97 both sizes · ratchet flat · transitions verified (journey landing 25224, HOME hint returns to 26098).** Note: the puck's synthetic click does not register in the preview — pre-existing, not a regression (the HOME hint drives the same wGoHome). **ONE move — David:** re-send the recording (the last one was empty), and try mode 10 on the two transitions — does native feel smoother than our spring?

---

## STATUS UPDATE (2026-08-27 (4), THE MISUNDERSTANDING + 401 paused animations): v1382
**DAVID CORRECTED THE PROBLEM STATEMENT, and it invalidated four rounds of work:** "the choppiness is specifically going from home to journey, from journey to home, and from home to tools and back. NOT actually going up in the journey." Every fix since v1376 (paint window, texture layer promotion, wash removal, bitmap stars) targeted DEEP-LINE SCROLLING, which was never the complaint. LESSON, permanent: pin WHICH gesture before optimizing — "choppy" is not a location.
**THE REAL CAUSE, measured in one transition:** 11 animations RUNNING · **401 PAUSED**. A paused animation is not a free animation — the object still exists and the engine still tracks the element that owns it, and a transition is precisely the moment every one of those elements is composited as a whole zone sweeps past. `animation-play-state:paused` (the v1376 mechanism, and the frame's own idiom) was the wrong tool at this scale. Now `animation:none` DESTROYS the object. Measured after: **0 paused, 19 running** — the engine tracks 19 animation objects during a transition instead of 412. The design survives because each row's stagger lives in its own NEGATIVE animation-delay, so a waking row restarts already at its correct phase — verified on device-sized preview: a woken stone's glisten runs with delay -4.2s and its blend layer is back at opacity 1.
**Gates:** two gates FAILED on this change and were right to (they asserted "paused"); both rewritten to the stronger claim — the animation object is GONE, not frozen — and the supersede is named in the code. 97/97 both sizes.
**Also in:** the scroll test gains three transition-specific modes (7 cascades off · 8 parallax off · 9 both), since the original six only stripped row PAINT, i.e. the wrong machine.
**DEVICE-UNTESTED:** whether this is THE fix. It is the first change aimed at the gesture he actually named, and it is backed by a real measurement rather than a hypothesis. **ONE move — David:** fresh.html (v1382): home↔journey and home↔tools — smooth now? If not, dev menu → 🎚 Scroll test → try mode 7 (cascades off) and mode 9 during those transitions; whichever helps names what is left.

---

## STATUS UPDATE (2026-08-27 (3), the lock clock + THE PHONE GETS TO ANSWER): v1381
David on v1380: chop STILL there (4th report) · the island shows a player while he is in the app · and the lock-screen clock starts at ~0 and only later jumps to the true position.
**(1) THE LOCK CLOCK — fixed.** `setPositionState` is an ANCHOR, not a readout: iOS draws `position + (now - whenYouSetIt)`. msSync only ran at act boundaries and transport events, so by the time the screen lit the anchor could be minutes stale — a clock that starts wrong and then jumps when something re-syncs it. Now: a `visibilitychange` re-anchor (fires while our JS can still run, so the card is BORN with the true second) + a 5s heartbeat while the card is up. Both armed in msOn, torn down in msOff (a leaked interval would write to a card this player no longer owns).
**(2) THE CHOP — I stopped guessing.** Four rounds of fixes have all been hypotheses, because the headless Mac measures **76fps with zero longtask entries** on the very build his phone renders at **~15fps** (measured off his recording: every second frame a duplicate). No amount of Chrome profiling can name the cost. So the phone gets to answer: **dev menu → "🎚 Scroll test"** cycles seven modes, each stripping ONE suspect (starfield · stone gradient textures · glisten/foil blend layers · stone shadows · all rows · everything), with a live fps + worst-frame readout pinned above the puck. Whichever mode goes smooth NAMES the layer. Same principle as the on-device design audit he asked for and the Fast-coast toggle. Verified end to end in preview: row present, class applies, sky url layers 2→0, meter reads "54 fps · worst frame 51ms". Test-only — nothing sets these classes unless the dev menu does.
**(3) THE ISLAND WHILE IN-APP — NOT built, and he needs the honest answer:** while audio is genuinely playing, iOS shows a Now Playing entry; a web app cannot suppress it and keep the audio alive (the category that keeps sound running under lock IS the thing that grants the slot). Hiding metadata while visible and re-claiming on hide risks the very lock-screen continuation v1373 exists for. If what he is seeing is a card with NOTHING playing, that is a different bug and the 📐 audit's new `category` line will name it (it FAILS on idle-but-playback).
**Gates 97/97 both sizes · ratchet flat. DEVICE-UNTESTED:** everything above. **ONE move — David:** fresh.html (v1381) → dev menu → 🎚 Scroll test → scroll the journey in each mode and tell me which number goes up. **ONE move — Claude:** fix whatever that mode names, properly.

---

## STATUS UPDATE (2026-08-27 (2), the stutter measured + the card is one circle): v1380
David on v1379: **overshoot FIXED · music now survives opening the app** (both his verdicts). Left: still choppy, plus a card redesign.
**THE STUTTER, MEASURED off his recording** (30fps frame-diff timeline, _dev/video-audit): during a scroll roughly EVERY SECOND FRAME is a duplicate — the phone produces ~15fps of new frames — plus occasional multi-frame freezes (one 165ms at 2.5s). Meanwhile desktop Chrome on the same build: **zero longtask entries, ~76fps, worst frame gap 33ms**. A gap that shape is RASTER, not JavaScript, so no amount of JS trimming would have touched it. What re-rasters: every stone's fill is one of David's repeating-conic / repeating-radial textures, and without a layer of its own the compositor re-evaluates that gradient whenever its tile is re-rastered — constantly during a fling, and again for every row the paint window reveals (mutation profile during a 5s scroll: 274 class flips on stone rows, the dominant mutation).
**Fixes:** (a) near-window stones get `will-change:transform` — the texture rasters ONCE and thereafter only composites; scoped to `:not(.jl-far)` so it is ~6-40 small layers, never 272 (verified: 6 promoted / 220 not, at home). (b) the `inset 0 0 0 999px #10060e80` wash is gone from --ss and is now the topmost BACKGROUND layer (pixel-identical, same paint order, verified rgba(16,6,14,.5) first + shadow down to 3 layers) — a 999px inset spread on a 74px circle, on 226 stones, computed and clipped per raster. (c) paint window widened 1400→1800px so fewer reveals per fling.
**THE LOCK-SCREEN CARD IS NOW ONE CIRCLE** (David: "could we show the color of the circle in the stack… the orange circle on the top, and then breathing turns into the teal circle… a fully black background so it perfectly molds with the island"). New `stkActCirclePNG`: the CURRENT act's hue as a filled circle on **#000** (not the app's #14060f — it must vanish into the island). SUPERSEDES the v1373 deck emblem ON THE CARD ONLY (face+shards+glyph reads as mush at island size); the deck emblem is untouched on the shelf and dose card. Keyed on hue alone, so it repaints exactly when an act's colour changes. VERIFIED end to end in preview: session start → card claimed, 512x512 artwork; **decoded the actual blob — corner rgb(0,0,0), centre rgb(99,211,201) (the breathing teal), sharp edge**; session end → metadata clear, keep-alive released, probe PASS.
**Gates 97/97 both sizes · ratchet flat · onScreenHidden 0 · zero real console errors. DEVICE-UNTESTED:** whether the raster fix moves the needle on iOS (Chrome cannot reproduce the problem, so it cannot prove the cure) and the card's look on a real island. **OPEN, David's call:** he wondered whether the card should show nothing at all while the app is OPEN and only appear once it is closed — deliberately NOT built: hiding and re-claiming the session around visibility risks the lock-screen continuation that v1373 exists for. **ONE move — David:** fresh.html (v1380): scroll fast — better, same, or worse? and start a stack, lock the phone, watch the circle change colour per act. **ONE move — Claude:** if still choppy, the last full-height paint is the sky's own background (the two star tile layers + night gradient across 26,098px) — the fix is moving them onto viewport-sized composited layers, which is a real refactor and needs his go-ahead.

---

## STATUS UPDATE (2026-08-27, one-zone law + the paint window + the audio category): v1379 (built on Opus, session model switched)
David on v1378: climb-past-the-beginning FIXED (his verdict). Four remaining: still choppy · OVERSHOOT (journey→scroll down→skips home into tools, and tools→up→skips home into journey) · the Now Playing card is STILL up with nothing playing · and a new ask: opening ALTER must not stop the music his phone is already playing.
**(1) ONE ZONE PER GESTURE (the overshoot).** Both fling branches read only WHERE YOU ARE, never where the gesture BEGAN: descending out of the sky you cross hy, `st > hy - 6` turns true mid-flight and home is skipped; mirrored climbing out of the tools. Home is the hinge, so a single gesture may cross exactly ONE zone: tools only if it started at/below home (`_wStartTop >= hy - 6`), journey only if it started at/above (`_wStartTop <= hy + 6`), plus a new explicit descending-from-sky→home branch. Same law added to wSnapIntent's slow path (a slow drag out of the journey used to coast into the tools). This is the law wSnapIntent already had for the journey — which is why only decisive flicks overshot. VERIFIED functionally, all four cases: journey+fling-down→HOME · tools+fling-up→HOME · home+fling-down→TOOLS · home+fling-up→JOURNEY.
**(2) THE PAINT WINDOW (the chop).** Pausing stops MOVEMENT, not PAINT — 272 rows of textured circles, four-layer shadows and blend overlays were rasterized every composited frame. Rows >~1.6 viewports away now carry `.jl-far { visibility:hidden }`: paint skipped, LAYOUT BOX KEPT, so every landing number, gate and the 25918px column are untouched. Deliberately NOT content-visibility (that defers LAYOUT — the work iOS failed mid-fling → the v1377 void); visibility is a paint flag with nothing to fail late, revealed 1400px early by its own observer with its own deadman. Measured: 260 of 272 rows unpainted at home, 232 deep in the line, and **onScreenHidden = 0 at every position and both phone sizes** — the void cannot recur by construction.
**(3+4) THE AUDIO CATEGORY — one root cause for BOTH.** `navigator.audioSession.type = "playback"` was set on EVERY sharedAudioCtx() call, and the context is built during boot (voice bank, volume buses). "playback" means THIS APP IS THE LONG-FORM PLAYER: iOS interrupts the phone's music and grants a lock-screen slot **with or without media metadata** — which is exactly why v1376's keep-alive release did not remove the ghost card, and why his music died on open. Now: `audioIdle()` ("ambient") at the TOP of init() and at every real session end (msOff, breathwork finish); `audioClaim()` ("playback") from voiceBus()/bgBus() — every sound in the app routes through one of the two buses, so a new tool cannot forget to claim, and David's 2026-08-20 ring/silent-switch law is preserved the moment a session starts. A PAUSED session deliberately keeps its claim and its card (a real session, not a ghost). DEV.audioIdleCheck now reports the category and FAILS both ways (idle-but-playback, live-but-ambient) — so his phone's 📐 audit can prove it.
**Gates 97/97 both sizes · ratchet flat · zero console errors. DEVICE-UNTESTED (desktop Chrome has no audioSession API at all):** the card, the music, and the chop. **ONE move — David:** fresh.html (v1379): start music in Spotify, open ALTER (music keeps playing? card gone?), then scroll — chop? overshoot? **ONE move — Claude:** peaks verdict + ch1 stones to the real day.

---

## STATUS UPDATE (2026-08-26 (5), the climb unlock + bitmap stars): v1378
David on v1377: still jittery both ways and "not letting me go any higher in journey past the beginning."
**(1) THE LOCK, found and proven:** the fling catch's journey branch guard (`st <= hy+6`) was true everywhere ABOVE the landing too — a hard upward flick deep in the line sprang BACK to wSkyY(), swallowing his momentum (and the spring-vs-momentum fight was half the jitter). Fix: `st > wSkyY()+6` bound — the catch now fires only in the home↔journey band. Proven by DEV.wIntent decision table (landing-2000/-8000: FREE all directions) + a settled real-scroll test (deep flick lands exactly where the flick took it, anim:false; home flick still commits to the landing). Every other guard audited — this was the only one that could fire above the landing.
**(2) Starfield → pre-rendered bitmap tiles** (jlSkyBitmap: each star pattern drawn once at its period at dpr, url() layers; the night linear stays CSS; canvas-fail falls back to gradients + gate SKIP). Zero design change — same pixels. Scripted transition ~10% faster in Chrome (every bitmap run beat every gradient run); iOS should gain more (gradient raster is what iOS tiles choke on). New gate "starfield is pre-rendered tiles".
**Gates 97/96 both sizes · ratchet flat · landing table unchanged · deep paint proof @12000 clean. DEVICE-UNTESTED:** the two reported symptoms. **ONE move — David:** fresh.html (v1378): (a) flick hard UP past the beginning — climbs freely now? (b) is the deep line still choppy, as a SEPARATE answer? **ONE move — Claude:** if chop persists, the sky-gradient paint cap is the next lever (design-visible, needs his call).

---

## STATUS UPDATE (2026-08-26 (4), the iOS void + the corrected home frame): v1377
David on v1376: better but fast scroll still chops, and the DEEP LINE renders as a VOID on his iPhone (past ch1: starfield only, no rows). Chrome renders the same depth fine → iOS Safari's content-visibility failing to materialize rows in our huge scroller. Fixes:
**(1) content-visibility REMOVED entirely** (jlDeepen/.jl-deep deleted, stone-row padding back to the recipe's 10px 0; new inverse gate "rows never use content-visibility" fails any ship that reintroduces it — the old "deep rows skip layout" gate superseded by name). Deep-scroll proof at scrollTop 12000: every row painted. HONEST TRADE (agent's numbers, desktop Chrome): home rest 61→45fps in CHROME because c-v was masking ~16fps of always-painted cost (sky gradient ~6.6 + rows ~11.7); landing 61.4, transition 54fps/1.33s (v1375 was 1.82s). Chrome is not the device; the void was a device correctness bug. OPEN LEVER for David: capping the sky gradient's painted region recovers ~6.6fps at a visible design cost — not applied unasked.
**(2) Real bug: the round-5 foot split broke the pause selector** (`#jrnyCol >` child combinator) — the 21 rows nearest the landing were NEVER pausing. Re-keyed to #jrnyLine; new gate "sleeping FOOT rows pause too".
**(3) Paint diet:** all ~296 mix-blend-mode overlay layers (stone glisten + gate foils, now .jl-glis) go opacity-0 while their row sleeps; quiet gate extended to assert it.
**(4) David's CORRECTED "Home Screen (static)" frame** (the earlier one was his accidental wrong file): HUD reverted — bare ti-adjustments-horizontal 18px scale(1.5) you-door, HUD row 12px drop, leaf scale(1.1) — JOURNEY hint stays centered/lifted-8. The four round-4 HUD gates flipped back, named. Column untouched (identical in both frames).
**Gates 96/96 both sizes · ratchet flat · landing table unchanged · audioIdleCheck clean. DEVICE-UNTESTED:** whether the void is actually gone + fast-scroll feel. **ONE move — David:** fresh.html (v1377): scroll DEEP into the line — chapters visible all the way up? and the gear is your old glyph again. **ONE move — Claude:** peaks verdict + ch1 stones to the real day.

---

## STATUS UPDATE (2026-08-26 (3), device jank + phantom player): v1376
David's device recording of v1375: home↔journey super slow/choppy (sky blank ~2s mid-pull), home→tools choppy too, and the iOS Now Playing card up with nothing playing. Three root causes, all ours:
**(1) The parallax composited the whole 26,000px line column** — and at home rest it sat transformed permanently, taxing ALL scrolling. Fix: new #jrnyFoot wrapper (the tail 21 rows, 2.61 viewports) is the only parallax target; #jrnyCol never transforms; transform cleared entirely at both rest states. Scripted home→journey transition: 1.82s wall → 1.02s, 49→58.8fps (preview; device should gain more — its GPU pays the giant-layer tax harder). Row enumeration now spans both containers (jlRows/jlGeom, summed offsetHeight never offsetTop — the transformed-offsetParent trap). Builder caught its own rebuild-loop bug (stale JL_ROWS guard rebuilt the line every render, leaving it born-paused/dark).
**(2) Effects woke mid-scroll** — IO unpause now DEFERRED while scrolling/springing (queue + 180ms settle flush, drops rows that left); pausing stays immediate. During a fling: 1 row awake; at the landing: 8.
**(3) The phantom player was a real leak in v1373's KEEPALIVE.stop()** — pause() kept the src attached, so iOS kept the media session alive after sessions ended. stop() now releases (src removed, element dropped, rebuilt on next in-gesture start); MEDIASESSION.release() also wipes setPositionState (stale scrubber). New DEV.audioIdleCheck probe: boot/idle → no element + playbackState none; live breath session → playing; closed → clean. A PAUSED player deliberately keeps its card (real session, correct UX).
**Gates 95/95 both sizes (new: parallax-is-the-foot-only) · ratchet flat · landing table unchanged · steady fps 61.2/60.0. DEVICE-UNTESTED:** transition feel + the Now Playing card (only iOS can prove the card gone). **ONE move — David:** fresh.html (v1376): scroll up/down — smooth now? and confirm no player card when idle. **ONE move — Claude:** peaks verdict + ch1 stones wired to the real day.

---

## STATUS UPDATE (2026-08-26 (2), device-video round): THE LINE FIXED TO DAVID'S RECORDINGS + THE STATIC HOME FRAME, v1375
David tested v1374 on device, sent expectation vs reality recordings (frame-dumped via _dev/video-audit) + a new authority frame "Home Screen (static).dc.html" ("so u never mess up the home screen again" — pulled to _design-sync/journey-scroll-2026-08-26/, now the 2c idle home + HUD law).
**Fixes:** (A) landing composition — line padding 110/178 → 120/60 (v22's, the expectation video): six stones visible, divider 60px above the seam; all six landing rows within ±0.5px of target both sizes (SUPERSEDES the J1 178 lock, by name). (B) the cascade fly-in bug — #jrnyCol's column perspective put the vanishing point ~13,000px away; rows displaced up to 1493px mid-entrance (David's "stone jammed behind the gold one"). Per-element perspective(900px) in the keyframe → worst displacement 12.2px, zero crossing. (C) JOURNEY hint now dies on the way UP too (wScrub reads jcScrub's _jcU; opacity 0 past u2 .3, taps dead past .2; downward tp untouched). (D) idle jitter OFF per David ("expectation except for the jitteriness") — JL_JITTER=false, mJit kept behind it; glisten + banner drift untouched; killing 226 wobble loops also recovered ~11fps in the ungated case. (E) home diffed to the static frame: strip was ALREADY at 95 (the brief's premise was wrong — builder verified, didn't churn); real changes = gear is now the frame's bordered settings circle (ti-settings 13px on #2a1220, ring rgba(255,242,249,.16) — VISIBLE change), HUD row drop + leaf scale removed, JOURNEY hint centered lifted 8px, strip gap 7→9 (a latent specificity bug — the 2c 9px never applied), sub-line 16/700 #a487a0 block-level (home zone back to exactly 874), planner gap 9. All home gates rewritten to the frame (superseded locks named in the agent report). **ROTFREE reverted to false per David** (iOS's rotate spin can't be suppressed from a PWA; guard is back; code kept behind the flag; Control Center portrait lock = the real "nothing happens").
**Gates 94/94 both sizes · ratchet flat · fps: home 61.5 / landing 60.7. DEVICE-UNTESTED:** cascade + landing feel on the phone (the fly-in fix is proven numerically, not by feel). **ONE move — David:** fresh.html (v1375): pull up to the journey — entrance clean? landing right? gear circle OK? **ONE move — Claude:** peaks verdict (ch24/36) + wiring ch1 stones to the real day.

---

## STATUS UPDATE (2026-08-26, Fable-orchestrated + Opus-agent-built, 3 rounds): THE JOURNEY LINE IN THE SKY + ROTFREE, v1374
David's order: "animation from journey scroll. contents from chapter line." Fresh DesignSync pull (GATE A passed both files) → ran the J1 prototype, extracted numerically → spec + addendum → Opus built, Fable audited, shipped.
**THE LINE (JLINE=true):** #tfWorldSky drops the old adopted #jpTrail (which stays intact for its own overlay; JLINE=false reverts byte-identical) and renders #jrnyLine — 272 rows, ALL 36 CHAPTERS. Ch1 open (candy stones + gold Again-tonight + TODAY·The Spark banner) per frame rows 0-8; ch2-17 ported verbatim (per-chapter textures, dark wash via --ss, traveling mPass glisten, mJitA/B/C, gate rarity ladder: foil ch8+, glow+sparks ch12+); ch18-36 GENERATED by the frame's own cycles (icons pool-of-12 start (ch-2)%12, counts [7,6,5,8], tx 8-cycle, glisten chain -0.45s/stone) with the gallery's M18-36 card textures verbatim; BOOK dividers ONE #ff4fa0 / TWO #2a9fe0 / THREE #8a5cf0. Entrance = v22's cascade (jlRowIn .66s cubic-bezier(.26,1.12,.38,1), velocity-scaled stagger, bottom-up; reverse-out 26ms) + parallax scrub (translateY -50→0, scale 1.08→1) — jc* mirrors tc*, hooks in onWorldScroll/wSpring only; WM physics untouched. Landing machine-diffed to ±0.5px at 402x874 AND 440x956 (his Max — line column 402-capped, letterbox law). Rows look-only this round (no taps; journey-engine wiring later).
**PERF (David called it):** all effects live = 22.7fps at home. Fix: IO pause (rows born jl-anim-off, rootMargin 120px, `.jl-anim-off .jl-fx{animation-play-state:paused!important}` — !important is load-bearing vs inline shorthands) + content-visibility:auto with exact contain-intrinsic-size on rows >1.5 viewports deep (gates excluded — contain:paint would shear their glow; iOS 18+, older engines just render). Home 61.5fps (parity with line off), landing 58.9. Geometry bit-identical after.
**ROTFREE (David's order "nothing changes when you turn it"):** #rotGuard never builds (ROTFREE=false reverts); landscape counter-rotates body (angle-aware ±90, swapped dims, exact screen cover, 59 fixed layers ride it), wApplyScale reads appVW() so --tfscale stays 1.0, 14 vh rules re-expressed under body.rot-land. Safe-area NOT remapped (notch eats a side edge in landscape — by his "nothing changes" order).
**Gates:** designAudit 88→91 (row total 272, 36 names, column cap, deep-rows-quiet, landing rows hidden at rest); ALL PASS both sizes; ratchet flat (wipes 129); zero console errors; JLINE/ROTFREE both flags tested off.
**OPEN DAVID-CALLS:** peaks — ch24/ch36 wear only their own textures (ch12's crown recipe turned out to be a subset of what late gates already wear); want something extra drawn for them? · locked gates render BRIGHT (verified identical to his own frame row — his design, flagged).
**DEVICE-UNTESTED:** the whole surface's feel — cascade entrance, parallax, scroll into/deep-into/out of the sky, real fps on the 16 Pro Max, AND all rotation behavior (esp. touch-action pan-y mapping through the rotated body + notch sides). **ONE move — David:** fresh.html (v1374): pull up to the journey, flick deep into the line and back, watch for jank; then rotate the phone mid-scroll. **ONE move — Claude:** wire the ch1 stones to the real day (the journey-engine mapping) once David verdicts the look.

---

## STATUS UPDATE (2026-08-15, Fable-orchestrated + Opus-agent-built): DEV TIME-SIM ("simulate evening"), v1290 — BUILT + PRESHIPPED, NOT PUSHED (David's call)
David: "add a dev tool to simulate evening — the home screen changes every evening and I remember it was broken." Built the DEV TIME-SIM: a dev-only simulated time-of-day for RENDER reads. Use: dev menu (🛠) → "🌆 Sim time" row (prompt, 24h, empty/off = real clock) · console `DEV.hour(20)` / `DEV.hour("22:30")` / `DEV.hour("off")` · URL `?dev&devHour=20`. Double-gated (devOn() + `alter_devhour` localStorage key, Design-tuner precedent, no SCHEMA); OFF path byte-equivalent for normal users. Mechanism: `devSimMin()/devSimHour()` at @SEC:DEV + `nowMin()` sim-early-out + new `hourNow()` at @SEC:TIME; converted render reads: phase() (greetings/pools/heartbeat), trackerState's night-face gate (via logicalNowMin), tfIdleInvite, tfYesterdayEcho, tbxHeroes (heroes flip h≥20 / 1-5am), nightAmt (island dusk), 5 journey ≥17h gates, 4 suggestion-pool reads. Data WRITES (log stamps, openBand, S.guide.fd, day keys) deliberately stay on the real clock. What "evening" means on home: heroes → Night Stack at 20:00; invite line "evening · one gentle thing?" 17-22; guardian "Let's close the day" + journey pm node ≥17:00; the NIGHT FACE (moon disc / "rest" / "no plan tonight" / Breathe-with-me) at bedHour() (profile bedtime, default 24:00) or 0:00-4:59 — so sim 20 = evening board, sim 0:30 = night face.
**Verified in preview (v1290):** boots clean, ZERO console errors; sim 20:00 → evening invite + WINDING-DOWN·Night-Stack hero on the real toolbox; sim 0:30 → night face renders correct (moon disc, rest, strip, TOOLS hint); off → real clock; designAudit ALL PASS (74) with sim off; preship ×2 (invariants 26/26, ratchets clean, wipe count 126 unchanged, server.js regenerated). One bug found+fixed in the tool itself during verification (URL ?devHour= re-clobbered a later DEV.hour() set on every cache rebuild; now one-shot per page load).
**THE BREAKAGE HUNT (David's "it was broken"):** inspected the evening/night rendering path. The night face itself renders CORRECTLY. The tools landing looked empty (deck + one ghost tile) when driven headlessly — but the SAME emptiness reproduced on the committed HEAD build served side-by-side, and BOTH fill in completely when the pane stays visible: it is the hidden-pane rAF/CSS-animation throttle (the documented preview-lies class), NOT app breakage. No night-specific defect found in preview. Two honest caveats: (1) night-face strings ("rest", "no plan tonight", "rest. I've got the morning") bypass tr() — pre-existing I18N-contract debt, not touched; (2) whatever David remembers may be device-only — he can now check in 5 seconds with the sim.
**DEVICE-UNTESTED:** everything (all sim states on real iOS; the night face on his real profile's bedHour). **NOT COMMITTED/PUSHED:** the tree also carries ANOTHER session's in-flight 2026-08-15 work (wSnapTarget descend-wins, hcArrive spring-pop timing, tcCascade batching + index.html keyframes, launch.json autoPort) — a commit here would fuse the two changesets in the same files, so the tree is left preshipped + staged; David's normal ship takes both. **ONE move — David:** say ship, then on the phone: 🛠 → Sim time → 20 (evening board), then 0:30 (night face) — is THIS the broken thing you remember?

---

## STATUS UPDATE (2026-08-02, Fable-orchestrated + Opus-agents ×4, DesignSync-gated): HOME 2c + PLANNER 8a/9a SHIPPED, v1250-v1253
David designed in Claude Design and picked frames; every build ran the TOKEN-SHEET GATE (live artifact pulled, exact values quoted into specs, frames-win order honored; his mid-flight chat corrections folded via SendMessage to the running builder).
**v1250** white tool glyphs app-wide (four surfaces wore the stale FIX-PASS-2 ink rule) + ground bottom air (last folder row was inside the puck band). **v1251** landing compensates the device safe-area inset (probe-read env(); preview shifts 8px, device ~42px). **v1252 HOME 2c**: top HUD (sparkle→characterCard · floating JOURNEY chevron→sky · garden soft-chip→game pane · gems), week strip v2 (day-hue pills + activity icon row), edges cleared (side doors + home clock retired from calm faces), 4-tile hero row (Morning/Breathe/Meditate/Night) LOW near the fold per David, inline 2c dose card (shared tbxBuildDose, NO selection chrome per David, 115deg/13-26/74 chip stripes, More→full ladder + honest-ladder rule), TOOLS hint at true screen bottom, HOME MAGNET (56px settle-snap). Audit rewritten 32→37 gates ALL PASS. **v1253 PLANNER 8a/9a**: W/M zooms = plan modes; Weeks columns wear day-stacks as candy pills, Months cells wear candy coins; THE STACK PICKER · WHOLE DAYS (Masterpiece 3-waves+Big-3 / Deep work / Rest / Errand / Studio Saturday); tap-or-arm-or-slide placement, drag-to-trash, Save = undo-pushed future-only gap-fit block writes (existing blocks never moved, verified), S.dayStacks additive, legacy grids behind PZ2=false, 48/48 Gate-1 copy, RU same-commit.
**OPEN DAVID-CALLS (accumulated):** arranger chain step-row coins ink or white (17a)? · sparkle=characterCard mapping (took the Sound gear's slot; Sound now in Settings) · two minute-ladders (face 2-45 vs shelf grid 1-45) · empty week-strip icons = dim circles · weekday order kept Su..Sa vs artifact M..S · months board = this week + 3 · masterpiece violet #8a5cf0 vs DOM.create · puck overlaps the planner picker's last card (needs bottom air like the ground got). **DEVICE-UNTESTED:** magnet feel, card-reveal ease, ALL 8a/9a drag feel, next-week landing. **ONE move — David:** fresh.html (v1253) phone pass: home 2c feel (magnet, hero row, card) + Weeks/Months place-a-day + Save + the call list above. **ONE move — Claude:** the pause-fix pass (type-aware gaps, single voice, player region) — still the queued next build, twice deferred for design passes.

---

## STATUS UPDATE (2026-08-01, Fable-orchestrated + Opus-agent-built): COLD OPEN = STRAIGHT TO HOME, v1248 + THE SEVEN-STACKS PROPOSAL (awaiting verdict)
David's three boot orders, shipped as v1248: (1) the "How's this week been?" gauge popup KILLED — `gaugeOpen` survives as the space-check/moment-scan seam and fires straight through (the F0 relief-door routing at open dies with it; `S.profile.weekMood` never written now, both readers typeof-guarded — the FOR YOU NOW hero inherits the state-reading job per the proposal below); (2) `ssEnter` opens home SYNCHRONOUSLY on the Continue tap (`openHomeInstant` before the start-screen fade; the cascadeJourney reveal deleted; journey pane stays primed underneath for the swipe); (3) one-page landing peek 14→20px so the eight-grid bottom row clears the screen bottom, fold just before FOR YOU NOW. **Verified in preview:** home paints in the same tick as Continue, zero popups on open, landing held at exactly 20px, designAudit ALL PASS (29), no console errors; wipe count 132→130 (ratchet baseline auto-lowered). **DEVICE-UNTESTED:** the exact landing-px feel + the swipe-to-journey from the instantly-open home. Note: the once-EVER "Your space right now?" card (`spaceCheckOnce`) still exists on virgin profiles — David has answered it long ago; kill on his word only.
**THE SEVEN-STACKS PROPOSAL (in chat 2026-08-01, the heart-of-the-app rethink):** top-eight grid stops being eight moment cards and becomes THE PRACTICE — 1 The Morning Stack (full arc, dose-folding 2/5/10/20/40) · 2 Breath · 3 Body · 4 Mind (Headspace→Harris→Blackstone→Adyashanti ladder, module texts = content bottleneck) · 5 Heart · 6 Vision · 7 The Night Stack · 8 Build your own. Tiles 2-6 = tile 1 exploded; grid teaches the system. Moments (Caught Scrolling, Spun Up, I Messed Up…) move to the FOR YOU NOW hero (context-computed, inherits the dead gauge's job) + moment-keyed folders (Catch/Reset/Recover/Begin/Night/Seal, stacks + single tools). Key mechanic: STRUCTURAL dose-folding replaces `tbxScaleTrack` proportional scaling (hypnosis module only ≥15m — the stack itself IS the induction below that; honest full-arc floor = 10m). Paywall: practice free (Morning Stack complete at ≤10m, rungs 1-2, ALL rescue moments — rescue is never paywalled), depth paid (10→40m, upper rungs, Session Editor, multi-customs).
**SESSION PART 2 (same day): THE TAPPING MINE ×5 + THE TRAY DIAGNOSIS.** David delivered 3 more Tapping Solution recordings (734 anxiety / 735 center / 736 productivity, the Ortners not Tony) — transcribed via the existing `_course/tapping/` rig (faster-whisper small; NEW: needs `KMP_DUPLICATE_LIB_OK=TRUE` or it aborts on the OpenMP double-load) and mined into `TONY-ANATOMY.md` §5-6 (three session species on one grammar; negative-round/compassion-pivot/what-if-ladder/anchor-and-name mechanics; the ALTER synthesis = method-agnostic ritual-grammar composer + chronicle-aware payloads + STATE ANCHORS keyring from David's own bliss-memory words). **TRAY BUG (David device): the Session Editor's build tray (SED_CATS, from the design side) mixes three species** — real runners, plannable micro-activities ("text one person", "one song", "slow drink"), and app-UI actions ("photo of now", "rate the mood") — and the fakes LIE about their engine (slow drink launches the PMR runner). Proposed fix in chat: 6 arc-grammar categories (Wake/Breathe/Settle/Sit/Open/Become), evict non-runners to the planner picker + Catch engine. **SESSION PART 3 (same day): TOP-8 = OPTION A LOCKED (David) + THE PRICING TOURNAMENT.** David locked the Practice Grid and added a hard requirement: every tile/step carries a plain "what this is" + one honest science "why" line (the existing why-law, now a build item). Names law (David): direct and straightforward only ("Open"/"Sit" rejected). Ran a 9-agent ultracode workflow: 12 free/paid models from 6 lenses, adversarially judged (soul judge + business judge) + haiku copy-judge on names vs COPY-ANCHORS. Full result: session task output wsvmf88kr (models+verdicts JSON). KILLED: release-wings (engagement-farming business model) + practice-dividend/earn-depth (hidden shame + fake scarcity). CONVERGENCE: installs-library (free ladder, paid applied installs) = only model in BOTH judges' top-3; 10-min-floor dose line = only launch-ready paid tier (biz 8.5); personalization-mirror line = only structurally soul-clean (8.5). RECOMMENDED COMPOSITE "minutes free, depth paid": the timer is NEVER paid (customs/any length self-assembled free; kills the composer-cap insult + "meditation just stops" risk); paid = authored deep band (15-60 guided builds: induction, advanced rungs, long-sit guidance) + growing install library + instrument layer (learning gauge, state-anchors keyring, chronicle narration, voices); both bookends complete free at the 10-min floor (loop closure never sold); rescue sacred. NAMES GATED (Gate 1 PASS all, Gate 2 winners): tray = Move · Breathe · Relax · Meditate · Gratitude · Rewire (Love/Heart/Stretch/Visualise/Affirm killed); tiles = Morning Stack (no "The") · Night Stack. **SESSION PART 4 (same day): ALL VERDICTS LANDED + v1249 SHIPPED.** David locked: pricing composite APPROVED with two amendments ((a) advanced tools/rungs paid at any length: advanced meditations, advanced breathing, installs; (b) pre-built stacks free tier, but BUILDING or EDITING a custom stack = paid; soul-judge mitigation adopted: the Build tile stays browse-and-preview free, save/run of a custom is the paid moment); names approved; paths approved (lens architecture + Learn to Meditate free / Release + Vision paid); tray eviction obvious-yes (feedback memory `david-verdict-lists-real-forks-only`: no obvious calls in verdict lists ever again). NEW PIPELINE LAW (David, on the too-long-pauses complaint): session-content order = 1 TEXT perfect through both gates → 2 FEEL tuned with the existing single David voice on device → 3 RECORD once (ElevenLabs, David voice) → 4 other voices + RU last. No recording before final text; no multi-voice before single-voice feels right. The PAUSE FIX (type-aware gaps: instruction lines short, dwells medium, deep practice long — the Robbins-mine SPEAK/LISTEN tagging) = the NEXT surgical pass, deliberately kept out of v1249 (player region).
**v1249 SHIPPED (Opus-built per spec `_specs/BUILD-SPEC-practice-grid-2026-08-01.md`, Fable-audited):** Practice Grid top-8 fixed arc order (usage-sort off) · structural dose-folding (tbxTrackForDose bands 2/5/10/15) · 17/17 gated what+why lines on dose cards · folders Catch/Reset/Recover/Begin/Night/Wins · SED_CATS v2 six honest chips, 24 fake coins evicted · heroes renamed · audit 29→31. Verified in preview (audit ALL PASS 31, zero console errors, RU clean); DEVICE-UNTESTED: band pacing feel, grid on retina. Builder flags for David (2 real calls): (1) CUSTOM STACKS lost their shelf tile (grid is exactly 8; customs remain launchable via the picker's Stacks sheet) — where should customs live? (2) picker's pkStackPick compresses a 15-min band shape into the default dose — honest but worth a feel-check. Minor notes: Wins folder has 3 items (asymmetric mini-preview); breatheLadder peek shard dedups to focus-only; tbxOrder now unreferenced (kept, commented).
**ONE move — David:** /fresh.html (v1249) on the phone: the new grid + a Morning Stack run at 2/5/10 min (band folding feel) + the two builder calls above. **ONE move — Claude:** the pause-fix spec (type-aware gap engine, single voice, player region) as the next surgical Opus pass.

---

## STATUS UPDATE (2026-07-31, Fable-orchestrated + Opus-agent-built, run from the Alfred meta-session): ARRANGER = DAVID'S ARTIFACT, v1247
David posted expectation-vs-reality on the Arranger. All six deltas traced to design-side PROSE overriding his canvas (the v1239 failure class — "NO grip line" and "chevron: collapsed = up" appear nowhere in DECISIONS.md; both contradict his frames 16a/17a). Spec: `_specs/BUILD-SPEC-arranger-fidelity-2026-07-31.md`. Shipped on top of v1246 (concurrent sessions had pushed v1242–46; fetched + ff'd first, re-applied by the same Opus agent):
1. **Peek cards = next-STEP hues** (front = st0[1].c, back = st0[2].c; were own-hue ink-mixed mud). 2. **Grip dash on every bubble** (34×3.5 rgba-ink .35, bottom-center; fades with peeks on open chains; decorative — whole-bubble drag unchanged). 3. **Chevron chains-only, collapsed = DOWN** (was every row, inverted). 4. **Chains sub = "N STEPS · CHAIN"; activities NO sub** (domain label deleted; title lh 1.05). 5. **Gutter dash only on same-hour rows** (11×4 #6b4a5e; no dash under numerals). 6. **Row stripes 74% mix** (arranger-local; tbxCandy/wall stays 82%).
**Verified live in preview (fresh v1247 code):** collapsed 3-row queue (activity/activity/chain) matches the artifact structure incl. the same-hour dash case; expanded chain = chevron flips up, peeks+grip fade, step readout/rail/Adjust intact; one tap = one pick (David's double First Light screenshot = two taps, not a bug); boots clean, zero console errors. **DEVICE-UNTESTED:** grip-dash seating + peek shard look on retina, drag feel (unchanged code, standing list). New copy: the single chrome word "chain" (RU "цепочка"; Gate 1 PASS; reused vocabulary — "Chains" already ships on the wall).
**OPEN DAVID-CALL (one line):** your arranger artifact says collapsed = chevron-DOWN; the app still runs "collapsed = up" at 3 Session Editor sites (sed-add / sed-cardchev / sed-tabrow ~5895/5935/5974) under a "chevron law" that traces only to design prose. Flip app-wide or keep the editor as-is?
**GIT NEAR-MISS, NEW LAW:** this session's ship ritual (`git add -A` per CLAUDE.md) tried to commit 1,541 untracked files — `_course/canon/text/` FULL COPYRIGHTED BOOK TEXTS, LEDGER.md, COFOUNDER.md, investor decks — to this PUBLIC repo. Saved only by a push rejection (remote had moved). Reset, nothing leaked. **Law until David verdicts a .gitignore: stage explicit paths only (app.js, index.html, server.js, the session's spec, _dev/GUARD.json when touched); `git fetch` before every ship — sessions push concurrently.** CLAUDE.md's `git add -A` line needs amending + a .gitignore verdict for the private/copyrighted set.
**ONE move — David:** /fresh.html (v1247) on the phone → pick 2–3 things incl. a stack → Arrange: peek shards in step hues, grip dashes, chain-only down-chevron, "3 STEPS · CHAIN"; verdict + the chevron-law call above. **ONE move — Claude:** amend CLAUDE.md's ship ritual + draft the .gitignore for David's verdict.

---

## STATUS UPDATE (2026-07-28 (2), Fable-orchestrated + Opus-agent ×4 more rounds): FIX PASS 3 + 4 + David's corrections SHIPPED, v1232-v1235
Rounds 4-7 on the same Opus agent, one ship. **The precedence lesson of the day is now law (memory `davids-artifacts-outrank-fixpass-prose`): David's locked languages + his own reference images outrank fix-pass prose; ship every round the moment it gates** (batching rounds left David reviewing a stale rejected build → rage, twice).
**v1232 (FP3 home + David's Done-bug):** date kicker (locale-native, no dict keys); TWO idle variants (pink+picker with ghost "or start X early" pill when next is later; striped next-hue disc + INK activity glyph 70px + "Next: <name>" 34px + "starts at H:MM · play begins it now" when up within 10m); catch-up trio re-housed as a card OVER home (`.tf-catchup`, the old claim FACE deleted, write paths byte-identical, `st-claim` never set now); Plan-my-day violet #8a5cf0; deck deep fills SAMPLED from home-idle-ref.jpeg (fitted `mixHex(hue,"#84706a",0.54)` — it's warm desaturation, NOT night-mix); live doors → Done + ghost Break + ghost **Extend** (tfRevealExtend revived; Replan dropped per the PNG caption — flip-flop flagged); **Done-bug both halves:** tfDone stopped closing the cockpit before the write (now stays home + re-primes) AND openJourney/setPaneRest self-heal a trail orphaned in a dead container (root cause of the blank journey: home's sky adopts #jpTrail, a teardown skipped releaseTrailFromSky).
**v1233 (FP4 wall):** 2×2 FAN (PK_FAN [-3.5,2.5,3.5,-2.5]°), names under in hue, counts KILLED, inside row deleted, footer = real ActionBar (kicker always ON YOUR PLATE; empty "nothing yet · tap what you feel like" + disabled Arrange; 1 pick "<name> · <30m>" + Add to today; 2+ "3 things · 3h05" + Arrange), back coin ink+sticker. Selection rings + gloss kept. NOTE: FP4 was the design side REJECTING its own 18a PNG's structure after seeing it built (byte-verified the PNG unchanged) — newest considered verdict wins.
**v1234 (DAVID, verbatim "why the fuck would you add black outlines to the tools"):** deck ink borders KILLED — his ref photo + locked launcher language (borderless soft deep tiles, white glyphs) outrank FP2§E/FP3§7; audit now has a "tile face BORDERLESS" gate quoting him so prose can't re-add it.
**v1235:** audit strip→circle gap gate made date-kicker-aware (7-16% when #tfDateKick renders, 7-12% otherwise).
**v1237 (DAVID, "colors way too muted / making shit up"):** deck reverted BYTE-IDENTICAL to v1228 (bright own-hue fills + tbxLip own-hue extrude) — root cause: round 4 PIL-sampled `home-idle-ref.jpeg`, a PHOTO of a screen, so the "fitted desaturation" was camera exposure; audit locked to the real hexes + asserts the photo-shadow can't return. LAW: photos are layout refs only, never color sources.
**v1239 (DAVID, side-by-side "expectation vs reality", near breakdown): THE WALL IS HIS ARTIFACT AGAIN + DESIGN AUTHORITY LAW.** Root cause of the whole day finally named: the design project's HANDOFF.md "fix passes" are authored by the design-side Claude, NOT David, and they repeatedly contradicted his actual designs (ink glyphs, 2×2 fans, killed counts, "What's next?" apostrophe — none his). v1231 had his wall CORRECT; FP4 prose ordered it unbuilt and Fable obeyed — that class of failure is now structurally banned: **CLAUDE.md "DESIGN AUTHORITY LAW"** (David's artifacts = only truth; prose diffs against artifacts BEFORE execution; contradictions go to David one-line, never auto-applied; ship every round; no colors from photos). Wall restored to 18a-picker artifact exactly (3-col white-glyph coins + counts n/total + name+icon inside + pink rings + gloss + "What next?"), keeping only the FP4 ActionBar footer (it matches the artifact) — deviations from v1231: white glyphs (FP2's "ink" was invention), header apostrophe reverted. Code comments at the wall name the contradicted fix-pass items so they cannot re-apply. Verified live vs the artifact (ring/gloss/count/white glyphs, mobile screenshot). **Claude-Design research (agent, sourced):** no official precedence rules exist; community best practice = tokens > canvas > prose-as-rationale-only > PNGs-for-spot-checks; 256KiB truncation is real (export smaller/split); NEXT PIPELINE WORK: export DESIGN.md tokens from the design project into `_design/`, build a `/design-verify` screenshot-diff gate vs David's artifacts (the missing audit), document the handoff agreement.
**v1236 (DAVID, voice):** puck idle-with-upcoming face reverted to PLAIN PINK HOME, navigate-only (`_discAct=null`, next-badge retired app-wide) — reverses the 07-21 LIVING PUCK shape-shifter for this state only (hue+play duty moved to the FP3 home disc); tracking/paused puck faces UNCHANGED pending David's word; DECISIONS.md entry appended with his verbatim quote. Verified live: seeded upcoming blocks → puck rgb(255,95,168) + ti-home + discAct null.
**Verified live:** designAudit **ALL PASS (25)** on idle v1235; idle face screenshot (kicker/pink disc/violet pill/borderless muted deck) ✓; FP4 wall screenshot (fan/names-under/no-counts/ActionBar) ✓; earlier rounds' live-player + picker-over-home checks stand. **DEVICE-UNTESTED:** idle-next striped disc + starts-at line, catch-up card over home, Break/Extend doors, Done→re-prime feel, fan angles on retina — David's phone pass is the judge.
**Nits for the design side:** empty-state ActionBar label ellipsises at 375w ("tap what y…"); green progress ring band ~16px vs PNG hairline; mock header still "What next?" vs shipped "What's next?".
**Concurrent:** the st-claim audit-guard chip session runs in a worktree — st-claim is no longer SET by the app (v1232 deleted the claim face), so that fix may land as belt-and-braces or be dropped at merge.
**ONE move — David:** fresh.html (v1235) phone pass: home idle (borderless tools, date line), the wall fan, pick 2 things → Arrange, run a block → Done should burst + re-prime ON home (no blank journey), Break/Extend doors. **ONE move — Claude:** act on verdicts; then the design side settles the wall once (their PNG vs their FP4 fan) so the flip-flop loop ends.

---

## STATUS UPDATE (2026-07-28, Fable-orchestrated + Opus-agent-built ×3 rounds): FIX PASS 2 + PNG PIXEL-MATCH SHIPPED, v1229-v1231
David's orders: "Apply FIX PASS 2 verbatim" then "match the PNGs in screens/handoff/ pixel-for-pixel". Pulled both from the design project live (DesignSync; the handoff PNGs are 256KiB-cap TRUNCATED on download — recovered viewable tops via PIL, saved at `_design-sync/tools-menu-2026-07-27/screens-handoff/*.view.png`).
**THE CONTRADICTION (resolved, David can overrule):** the 18a PNG shows the ORIGINAL turn tile design (2×3 minis, counts, name inside, pick rings + gloss) — the written FIX PASS 1 §4 / FP2 §A tile respec (2×2 fanned, no counts, name under) came from the DS-guide component David never picked. PNGs = David's pick = win on STRUCTURE; FP2's material laws (ink glyphs on hue, ink borders, stickers, no blooms) kept — the PNG itself obeys them. Header stays "What's next?" per FP1's written copy rule (mock still says "What next?" — flagged).
**Shipped (v1229-v1231):** wall tiles = PNG-canonical (3-col candy minis w/ ink glyphs, `n / total` counts, name+icon inside, pink ring + gloss selection states, #241022 12% wash shells); live player = 2a (striped hue disc + ink glyph + #2a1730 halo + green ring w/ #fff2f9 arc-dot, candy title pill, Done/Pause/Replan doors — Stop KILLED incl. the drift variant, deck hidden while live via ground-pull cancel so David's "scroll down to tools while tracking" law survives); idle-with-next disc = striped next-hue + ink play + "starts at H:MM · play begins it now" (em-dash in the mock fails copy-audit Gate 1 — swapped to the app's native middle dot); idle deck faces = candy + ink; FP2 §F grep-kill applied WITHIN the reviewed new-era surfaces only (menu-row LOCKED language + editor tray coins deliberately exempt).
**Verified live in preview:** idle home designAudit **ALL PASS (25)** (audit's 2 flat-hex deck checks → 5 candy-law checks); wall + selection state = pixel-match vs the PNG; live player = match vs the PNG (stripes/ink/dot/pill/doors/deck-hidden); picker-over-home open/close. **DEVICE-UNTESTED:** the idle-next striped disc + starts-at line (unreachable in preview behind a hold-to-charge claim — the code path is the same one proven live), plus all standing gesture items.
**Known gaps flagged by the build, for David's eye:** (1) the live next-line no longer shows the block NAME (the PNG's line replaced it; one-line revert at `#tfVerdict` if wanted); (2) the PNG's green progress ring is a ~2-3px hairline, the build's is a ~16px band (needed to seat FP2's own 7px halo — design side should reconcile); (3) `.tf-subblock` CSS left dormant for the revert; (4) tfRevealExtend/tfReplan/tfCreatePlan/tfHasPlan now dead code (doors gone), left recoverable. **Known audit bug (pre-existing):** the idle-guard doesn't exclude the `st-claim` face → running designAudit mid-claim reports phantom FAILs (44vw circle etc.) — chip queued.
**ONE move — David:** fresh.html (v1231) on the phone: the wall (rings appear as you pick), a live session (stripes + doors), and the idle disc once something's planned. **ONE move — Claude:** act on verdicts; push the two design-side reconciliations (green-ring width, "What next?" vs "What's next?") back to the design project.

---

## STATUS UPDATE (2026-07-27 (3), Fable-orchestrated + Opus-agent-built): DAVID'S 3 PHONE BUGS FIXED — landing, home face, Plan-my-day → picker, v1227-v1228
David's device report on v1226, all three diagnosed (code-first) + fixed by the Opus agent + preview-verified:
1. **Fresh onboarding landed on Journey** — both onboarding finishers (V1+V2, @SEC:ONBOARD) literally called `openJourney()`; now `openHome()` (the same canonical landing the returning-user seam uses). First-day seeding (S.guide.fd) untouched; journey stays reachable.
2. **Home face "broken / shifted downwards"** — NOT a regression (old designAudit passed 20/20 on it): the locked geometry had a dead sky band (strip bottom ~26vh) + the deck names flush at 100vh (clipped under the iOS home indicator). Fix: killed the `margin-top:auto` dead band on `#tfHomeBars` (strip now = HUD + ~13px on every safe-area), doors track the strip (`--tun-door-cy` 32→23dvh, CSS fallback + tuner def moved TOGETHER per the v1225 lesson), ground pull now `-19vh − env(safe-area-inset-bottom)` so the deck clears the fold. **designAudit extended 20→22** (no-dead-sky gate + deck-clears-fold gate) — ALL PASS (22) verified live on the raised home. Circle 52vw, tile hexes, timeline untouched.
3. **Plan-my-day opened the planner** — `tbxPlanDay()` now opens the 18a picker over home: `pkOpen({k: todayK(), at: next-5min})`, z98 over trackerFull z90 (verified live: opens with live kicker, back/scrim returns to home intact, pkLand unchanged).
Plus one found-in-verification fix (v1228): the audit's ring-rim check measured the disc mid-`tfBreathe` (transform-scaled rect → intermittent "got 5 want 5-11" FAIL); now `offsetWidth` both sides (transform-immune). v1228 is that one dev-only audit line over the verified v1227; preship + ratchet clean (anchors 22/22, wipes 147 ≤ 147, SCHEMA 5); the 3× audit-stability re-run is queued for the next preview session (the preview pane died at the end of this one) — user-facing surfaces were all verified at v1227.
**DEVICE-UNTESTED:** the raised home on real safe-areas (strip/door/deck positions derive from env() — the tuner knobs --tun-sky-gap/--tun-door-cy/--tun-ground-pull are the adjustment path if David's eye wants nudges), and the standing v1224 gesture list.
**ONE move — David:** fresh.html (v1228) on the phone: start-fresh → onboard → should land HOME with the raised face; tap Plan my day → picker. Verdict + any pixel nudges via the Design tuner.
**ONE move — Claude:** act on the phone verdicts; then the save-as-chain moment (next design work) + pull Player.dc.html into _design-sync before any 2a build.

---

## STATUS UPDATE (2026-07-27 (2), Fable-orchestrated + Opus-agent-built): FIX PASS SHIPPED — 9 design-drift corrections on the trilogy, v1226
David's design session reviewed the v1222–24 build shots and appended a 9-item **FIX PASS** to the design handoff notes (the repo copy was stale — now synced at `_design-sync/tools-menu-2026-07-27/DESIGN-HANDOFF-NOTES-2026-07-27.md`). This Fable session verified all 9 items against the code + the live DS project. All real; three root causes worth knowing:
- Several "violations" are FAITHFUL PORTS of the turn markup — the bloomed Start, striped empty slab, count badges and 3-col flat minis are in the `.dc.html` itself. The FIX PASS knowingly supersedes the turn (and the stale `DomainBento` component). Law order is written into the spec so the builder doesn't "restore fidelity" backwards.
- The "desaturated maroon" primary = `.pk-go` at `opacity:.45` when the queue is empty. ActionBar law (pulled live): disabled = `#2a0d1c` fill + `#9a6a86` text + ink sticker at 70%, never washed pink.
- The blank "one nostril" coin = the design specced `ti-nose`, which does not exist in tabler-icons-webfont@3.31.0 (verified against the CDN). Fix = `ti-arrows-left-right` (the registry's own v_nostril glyph).

**Spec: [`_specs/BUILD-SPEC-fixpass-trilogy-2026-07-27.md`](_specs/BUILD-SPEC-fixpass-trilogy-2026-07-27.md)** — 9 fixes with verbatim values + edit sites, scope guards (choice-row v3 hue outlines stay; block-face stripes stay; arranger untouched), press-ladder sweep. **Built the same session by an Opus subagent** (new mechanism per David's 2026-07-27 order — CLAUDE.md rule 0 amended, memory `fable-runs-opus-agents-inline`): agent executed one-shot, preship clean (ratchet: anchors 22/22, wipes 147 ≤ 147, SCHEMA 5; version double-bumped 1224→1226 by a benign second preship read-back run). It also closes the two "builder interpretation calls" from the trilogy block below (single dashed row = validated; bright tray coins = validated).

**Fable's adversarial preview audit (item-by-item vs the FIX PASS): ALL 9 PASS.** Wall: 2×2 fanned mini-sheets w/ #fff2f9 glyphs, ink chrome, 12% wash fills, names under in hue, zero counts, "What's next?", caps kicker, slate disabled primary → pink when picked (ONE THING state verified live). Editor: single flat dashed slab (stripes + "Nothing in it yet" slab gone), ghost Save/gear (#4b2a44 on faint), bloomless sticker Start, one-nostril glyph renders, row = 3px ink + `0 5px 0 #160510, 0 7px 18px, 0 0 28px hue@46%` (computed-style verified; color-mix on var() renders). Boot clean, zero console errors through the whole drive (picker open/close, sheet, pick+tune, editor add-block). **Visuals preview-verified; gesture feel unchanged by this pass — the v1224 DEVICE-UNTESTED list still stands.**

**ONE move — David:** open `/fresh.html` (v1226) on the phone — one pass covers the fix-pass visuals AND the standing v1224 gesture verdicts (drag-reorder feel, tray fold, footer chevron, grip-bar wire-or-remove).
**ONE move — Claude:** act on David's phone verdicts (visual nits + the grip-bar call); then next design work per the notes (save-as-chain moment) — and pull `Player.dc.html` into `_design-sync/` before any Player 2a build.

---

## STATUS UPDATE (2026-07-27, Fable-specced + Opus-built via Alfred session): TOOLS TRILOGY SHIPPED — Session Editor + 21e toolbox preview + Activity Picker/Arranger (v1222–v1224)
Claude-Design import ("Tools menu redesign directions" project) implemented per David's DESIGN-HANDOFF-NOTES (verbatim copy + full design mirror at `_design-sync/tools-menu-2026-07-27/`; spec + addendum at `_specs/BUILD-SPEC-tools-trilogy-2026-07-27.md`).

**What shipped (3 commits):**
- `e4d39f2` (v1222) **@SEC:EDITOR** — the Session Editor (design 4a/2b): one full-screen shell, BLOCKS mode (candy rows, tap-to-expand, duration strip — never a stepper) + SETTINGS mode (tinted cards, only runner-honored controls), 6-category tool tray, BUILD mode = same editor empty with tray pinned. Replaces `openSessionComposer` for stacks (`tbxEditSteps`, `tbxBuildCustom`) — one editor, not two. Plus **21e toolbox preview**: per-step times, More → 21a minute grid, choice-row-v3 chip selection via `tbxCandy()`. Turn-22 fan-out NOT built (David discarded it; deck-with-shards stays).
- `1e1e802` (v1223) **@SEC:PICKER** — the 18a flow replaces bentoPicker at timeline tap-empty-slot: domain-folders wall → folder sheet → tune-panel footer (byte-identical wall/sheet, queue coins with NAME labels + ✕, priority-shows-value, chains first-class with scale-all rail) → **Arranger** (hour gutter w/ same-hour dash, uniform candy bubbles, whole-bubble drag >6px, chevron up/down law, Save-as-chain + Start lands blocks at the gap). NO Whole-days folder (per David — days live in Plan-my-day/week/evening later). Other bentoPicker callers untouched.
- v1224 (this commit) **judge-gate copy fixes**: 4 KILLED tool-desc lines rewritten plain (box breath / step outside / name the pull / look far away), "seal it"→"check it off", "more"→"More" (button casing), duplicate "Make it yours" RU key removed. Gate 2 verdict: 125/130 passed clean.

**Guards:** node --check OK · ratchet PASS (anchors 22/22, wipes 147 ≤ 147, SCHEMA 5 — all new state additive on S.tools) · copy-audit clean (124 lines) + adversarial judge run (sonnet, COPY-ANCHORS-calibrated) · designAudit ALL PASS (20) on clean idle home · regression contract 1–4 explicitly verified (blocks land at tapped minute end-to-end; past/started untouched; tap-bubble→editorSheet intact; zero timeline listener changes) · boot clean, zero console errors.

**DEVICE-UNTESTED (the honest list — confirm on phone):** arranger bubble drag-to-reorder feel (>6px threshold, finger-follow); tool-tray fold + folder-sheet open/close; footer minimize chevron; the 21e preview spring; horizontal rail/queue scrolling inside overlays (pan-x arbitration). Two builder interpretation calls for David's eye: editor tray sits under a dashed "Add a block" row (design anchors it to the sheet edge); tray tool coins render solid-bright (design render had them muted-dark).

**Known open threads:** design-tuner stored defaults stale vs CSS (2/20 audit fails with tuner storage present — chip queued); editor rows still show the 32×4 grip bar but whole-row drag is not wired there (↑/↓/Swap do it) — wire or remove; the 18a "onAddCat" clock tile + the design's own minute ladder were unrecoverable past the 256KB import cut (flagged in code comments). Next design work per David's notes: per-step editor, the player, the whole-day layer.

**Session-hygiene note:** this build ran from the claudeCode meta-repo session (Alfred), constitution loaded manually. Next session: open in `alter/` proper.

**ONE move — David:** open /fresh.html (v1224) on the phone; tap an empty timeline slot → pick 2–3 things → Arrange → drag a bubble, then Start; then toolbox tile → preview → More grid → Adjust steps & timing. Gesture feel verdicts on the DEVICE-UNTESTED list above. **ONE move — Claude:** wire-or-remove the editor grip bar per David's drag verdict.

---

## STATUS UPDATE (2026-07-23 (8), Opus): BUILD-TILE COMPOSER now offers PLAY-NOW + SAVE (was save-only) v1221
David's order: "when he builds a stack via the Build tile, the composer pushes him to SAVE. It should offer BOTH: save it, or just PLAY it now without saving."

**What the Build path's button state ACTUALLY was:** `openSessionComposer` renders exactly ONE bottom button, whose label + action are per-caller config (`playLabel`/`onPlay`). In the Build flow (`tbxBuildCustom`) that single button was `Save this stack` → `tbxSaveCustom`. There was NO play-now button at all — not suppressed, the composer was single-button by architecture. (For contrast, the Adjust-steps edit flow `tbxEditSteps` wires the same lone button to `Begin session →` → `tbxLaunch`.)

**Change (2 edits, app.js @SEC:TOOLBOX2 + `openSessionComposer`):**
- `openSessionComposer` gained an OPTIONAL secondary button: when `cfg.secondaryLabel` + `cfg.onSecondary` are passed, an outlined (non-`done2`) button renders under the pink primary and fires `persist(); onSecondary(track)`. No secondaryLabel = byte-identical single-button composer, so the edit flow + stackTimeline flow are UNCHANGED.
- `tbxBuildCustom` now sets PRIMARY (pink, prominent) = `Begin session →` → new `tbxPlayNow(t)`, and SECONDARY (outline) = `Save this stack` → the unchanged `tbxSaveCustom(t)`. `tbxPlayNow` runs the composed track through the Landing Contract (`landFromHome(); leaveHomeForPlayer(); runStack(t,0,…stackComplete)`) with NO id, NO tickTool, NO persistence — same launch path as `tbxLaunch` minus the save.

**COPY: ZERO new lines.** Reused the two existing gated+RU-dicted labels `Begin session →` (RU "Начать сессию →") and `Save this stack` (RU "Сохранить стек"). No copy-audit / Gate-2 needed.

**VERIFIED (preview, demoProfile+seedDay; state read from localStorage `alter_plan2` since `S` is closure-private):**
- Build tile → composer shows BOTH buttons (Begin session → primary, Save this stack secondary). Composed a 2-step stack.
- (a) PLAY-NOW: `Begin session →` launched the carousel runner (multi-segment progress = the stack), landed home on Done. tbxCustom count unchanged (stayed at the 1 pre-seeded "Old junk"); grid stayed 8 tiles, NO new tile. Nothing persisted.
- (b) SAVE: rebuild → `Save this stack` → name dialog → "Test Save Stack" persisted as exactly ONE new tbxCustom `[breathe:120, meditate:60]`, appeared as a grid tile, opened its dose card, and launched via tbxLaunch (rose in usage order after running — tickTool path intact).
- Adjust-steps (`tbxEditSteps`) UNREGRESSED: opens seeded with the live track, single `Begin session →` button only (no secondary); adding a Grateful step persisted to `S.tools.tbxEdit["tbxc_…"] = [breathe:120, meditate:60, gratitude:60]`.
- Zero console errors across all flows.

**GUARDS:** `node --check` OK · ratchet PASS (anchors 20/20, wipes **147 ≤ 147 — zero new innerHTML wipes**, SCHEMA 5, no bump — additive) · preship green (26/26 logic invariants) · **v1220 → v1221**, server.js regenerated. **designAudit:** FAILURES PRESENT but all pre-existing seeded/non-idle-home artifacts (circle 44 vs 52, calm bloom, plan-button-missing, door-position, the known-obsolete tile1/tile3 hex checks — grid also re-ordered by usage) — my change touches NO home-surface paint/layout (composer overlay + Build wiring only), so it adds ZERO new fails.
**DEVICE-UNTESTED:** the play-now Begin tap + runner FEEL on David's phone; secondary-button placement/legibility on real pixels; audio. Logic + persistence are deterministic and proven in preview.
**ONE move — David:** open /fresh.html (v1221), Build tile → add 2 tools → tap `Begin session →`, confirm it just plays (no save, no new tile); then rebuild → `Save this stack`, confirm the tile appears. **ONE move — Claude:** none pending.

---

## STATUS UPDATE (2026-07-23 (7), Opus): v1218 BOOT-CRASH ROOT-CAUSED + FIXED + RE-LANDED as v1220
David's device (real, lived-in save) crashed v1218 at boot: the global error net's "something glitched — tap to refresh" toast, refresh loops, and the legacy bottom-bar menu showing (the static index.html shell). Reverted to v1219 (= v1217 behavior). This session re-landed v1218 with the crash fixed.

**ROOT CAUSE (deterministic, NOT state-dependent — the earlier "fresh boots clean" read was wrong):** the whole app is one `"use strict"` IIFE (app.js line 35). The v1218 change **deleted the hoisted `function stackTool(id){…}` declaration** and replaced it with `var _stackToolBase = stackTool; stackTool = function(id){…};`. With no `var`/`function` declaring `stackTool` anywhere, line 11908 (`var _stackToolBase = stackTool;`) **reads an undeclared binding → `ReferenceError: stackTool is not defined`, thrown during top-level IIFE init.** That aborts every definition after line 11908 — including `window.DEV` (line 15101), the runners, and the final `boot()` — so only index.html's static shell paints (the "old menu with the bottom bar") and the window `error` handler fires the glitch toast. Empirically confirmed: on the v1218 tree, `window.DEV` was `undefined` after load on BOTH cleared-localStorage (fresh) AND David-shaped state; fixed tree gives `window.DEV === object`.

**FIX (app.js ~11908):** restored the original registry lookup as a hoisted function declaration `function _stackToolBase(id){…}` and made `function stackTool(id){ return _stackToolBase(id) || variantTool(id); }` a hoisted declaration too. Both hoist, so the strict-mode undeclared-assignment throw is gone and every caller (before AND after the line) resolves variant ids. No behavior change to the wrapper. Two lines; nothing else in the v1218 re-land was altered.

**VERIFICATION MATRIX (preview, port reused; gesture/audio-feel DEVICE-UNTESTED):**
- Boot clean (`window.DEV===object`, no glitch toast) on: (a) fresh/cleared localStorage; (b) `demoProfile+seedDay`; (c) POISONED save — v1217-shaped `S.tools.tbxCustom` (base-id tracks), `S.tools.tbxEdit`, `S.tools.use` with tbx + unknown ids, `S.tools.daily/custom`, plus a custom whose track holds an **unknown id** (`nonexistent_xyz`).
- Toolbox renders all 8 cells incl. the v1217 customs and the unknown-id custom (renders raw id, no throw); 2 heroes, 6 category squares.
- Composer opens with the full variant pool (7 base + 12 variants, `adv` badges correct).
- Saved a variant custom (`[breathe, v_box, v_metta]`) — variant ids persist in the track; dose card resolves variant names; Start launched with no throw.
- Breath act composes VOICELESS (`DEV.compose('breathe',…)` → cueLines 0); meditate composes normally.
- `node --check` OK · ratchet PASS (anchors 20/20, wipes **147 ≤ 147** — zero new, schema 5) · preship green (26/26 logic invariants) · **v1219 → v1220**, server.js regenerated.
- **designAudit:** ran on identical seeded state against BOTH the fixed tree and the v1219 baseline (current main) — **byte-identical 6-FAIL set** (circle 44 vs 52, ring rim 12, calm bloom, plan-button-missing, tile1/tile3 hex). These are a `DEV.cockpit()` harness artifact PRE-EXISTING on main, NOT introduced here; my change touches no home-surface paint/layout, so the home gate does not apply and adds ZERO new fails.

**DEVICE-UNTESTED:** actual on-phone boot with David's real save (the fix is deterministic so it should hold, but confirm); breath-pacing/gesture FEEL; audio (the "um/eyes" baked-clip leak is separate — being fixed via clip regen alongside this push).
**ONE move — David:** open /fresh.html (v1220) on your phone, confirm it boots to the cockpit (not the glitch toast), then Build a stack → add Box breathing + Body scan, save + run; confirm the breath act is silent. **ONE move — Claude:** none pending on this fix; the voiceless-breath re-land pairs with the 3 regenerated Dave clips shipping right after.

---

## STATUS UPDATE (2026-07-23 (6), Opus): VOICE-BUG PASS + BREATHING/MEDITATION VARIANT LIBRARY v1218 (committed local; PUSH HELD for Gate-2)
David's report: (a) guided breathing "still says weird things like ok um and eyes"; (b) "sometimes he says every other line — forgot which section"; (c) the stack builder should carry "all the nuances of different types of breathing and meditation … build the functionality now" (skin later).

**PART 1 — VOICE (root causes, quoted from the pipeline read):**
- Speech is 100% PRE-RECORDED clips gated by `hasClipFor(text)` (@SEC:TTS): a line plays ONLY if a clip whose hash matches exists, else honest silence. The composed player (`timelinePlayer`) SCHEDULES every clip up front on the Web-Audio timeline — it never drops or double-increments (no per-cue `speak()`), so it cannot "swallow every other line."
- **"ok / um / eyes" = BAKED-AUDIO TTS-bank artifacts, NOT a code splitter or bad source line.** Proof: computed the vhash of "eyes"/"um"/"okay"/"alright" → **no such clip exists** in root OR dave banks, and `timelinePlayer` plays ONE whole clip per segment (no chunking that could emit a fragment). So the filler is inside the generated ElevenLabs composite clips (e.g. the model adding "um…" / a trailing "…eyes" to lines like "Settle in, let your eyes soften"). The transition-card filler ("Now, the breath.") was already removed in v1203; the residue lives in the relax/settle/meditate composite clips. **True fix = regenerate the offending clips** (`_dev/gen-voice-11labs.py` — needs the ElevenLabs key + a listen; NOT done blind this session: can't verify audio headless, and it burns credits). Reported, not faked.
- **CODE FIX SHIPPED (David's own prior ask, handoff line 460): breath cues are now VOICELESS inside a stack**, exactly like the standalone tool since v1142. `composeStackSegs` C.breath now emits `text:""` phase segments (the `breath` tag still paces the orb; the phase label still shows). This removes the spoken "Breathe in/out" + any filler baked into the breath clips from every guided session. Standalone breath was already voiceless (`S.breathVoice` opt-in).
- **"every other line"** — prior investigation (v1204) already pinned this as DEVICE-DEPENDENT (Millie clips ~1.5× longer than Dave; unreproducible headless). Code read confirms the composed player pre-schedules, so it can't drop; if it manifests it's a clip-length overlap on device. Left as DEVICE-UNTESTED — needs David to say which section + which voice.

**PART 2 — VARIANT LIBRARY (functionality now, plain palette; skin later):**
- New `var TBX_VARIANTS` (near `stackTool`, @SEC:TOOLBOX region): 12 variants, each a PARAMETERISED PRESET over an EXISTING runnable tool — breathing → base `breathe` + `pat`; meditation → base `meditate` + `med` (MED_SEC section list, reusing the existing gated pools); Visualisation → `reprogram`; Mantra repetition → `mantra`. So they inherit the whole player/pacing/voice engine — ZERO new player, ZERO new spoken lines for meditation (reuse body/aware/rest/heart pools).
- **Pacing engine parameterized:** `BREATH_PATTERNS` gained `coherent` (5.5/5.5), `exhale48` (4-8), `nostril` (paced L/R cues), + internal `wimPower`/`wimHold`; new `BREATH_FLOWS.wimhof` = a multi-stage flow riding the SAME `stages`/`flow` engine the guided ladder uses (`breathwork` now resolves `BREATH_FLOWS[patKey]`). New `breathFlowRows(patKey, secs)` expands any pattern/flow into voiceless orb-pacing phase rows that FILL the act's time (single patterns repeat to fill; Wim Hof plays its fixed rounds). All cues reuse recorded words via `spokenKey` → no new audio.
- **Composer wiring (no new menu):** `STACK_POOL_IDS` = the 7 base tools + all 12 variants, fed to `openSessionComposer`'s `pool` at all three call sites (Build-a-stack / per-stack edit / stackTimeline). `stackTool` was wrapped to also resolve variant ids (`variantTool`) so the composer/dose-card/most-used ordering render them with no special-casing; variants add at their own default length. `tbxExpandTrack(track)` converts variant steps → base steps (carrying pat/med) ONCE at launch (`runStack` + `runStackCarousel` both call it; idempotent), so SAVED customs keep the variant id (right palette label) and expand only at run. `tbxTrackDoms` now reads a variant's own domain for the custom tile hue.
- **VERIFIED (deterministic node harness over the real source):** a **36-min** 6-variant stack (`v_box, v_wimhof, v_bodyscan, v_metta, v_coherent, v_visual`) expands correctly to base tools with pat/med and durations preserved (2160s total); every breathing variant produces the right phase structure filling the time (box 76ph, wimhof 129ph fixed rounds, etc.); meditation variants map to MED_SEC keys (settle/body/rest, settle/heart). Boots clean on v1218 in preview, zero console errors.

**COPY (Gate 1 clean; Gate 2 = orchestrator's job → PUSH HELD):** all new EN lines pass `copy-audit.py`. One rewrite: Wim Hof "why" tripped negation-contrast ("Energising, not calming") → rewritten to "It fires the body up and sharpens you…". Breath-pattern goal/name/why stay EN by the established guided-register convention (like STACK_CONTENT / the other breath patterns — none are in the RU dict); the 10 composer-chrome variant NAMES got RU dict entries same commit (Body scan / Visualisation already had RU).
**NEW EN LINES FOR GATE-2 (list them to the judge):** palette names — Box breathing · 4-7-8 breathing · Coherent breathing · Extended exhale · Wim Hof rounds · Alternate nostril · Body scan · Open awareness · Noting · Loving-kindness · Visualisation · Mantra repetition. Breath-picker — "Coherent breath" / "Even out the heart" / "Five and a half in, five and a half out, no holds. The even rhythm tunes the heart and the breath to one steady wave." · "Slow a racing system" / "In for four, out for eight. The exhale runs twice the in-breath, and the longer it is, the harder it pulls the brake." · "Balance and steady" / "In one side, out the other, then swap. A slow, even paced round that steadies the mind. Use a finger to close each nostril." · "Charge the body up" / "Rounds of fast, full breaths, each closed by a long hold on empty lungs. It fires the body up and sharpens you. Sit or lie down, and keep it away from water." Phase labels — Let it go · Breathe out, hold empty · Big breath in, hold · Breathe in/out, left/right.

**GUARDS:** preship green (26/26 logic invariants, ratchet held at 147 wipes / schema 5, v1217→v1218, server.js regenerated). designAudit NOT re-run: nothing here touches the HOME surface's paint/layout (composer/breath engine/registries only) so the home-board gate does not apply.
**DEVICE-UNTESTED (honest):** actual audio quality + whether the "um/eyes" clips still leak (baked-audio, needs regen + a listen); breath-pacing FEEL of the new patterns/Wim Hof rounds; long-session (30-min+) battery; the every-other-line report; and the end-to-end RUN of a variant stack through `timelinePlayer` (the composer is not reachable as a nav pane in the seeded preview — home overlay, a known incomplete nav slice — so the run path is proven by the deterministic harness, not a live tap-through).
**ONE move — David:** open /fresh.html (v1218), Build a stack → add e.g. Box breathing + Body scan + Wim Hof, save + run it; confirm the breath act is silent now and the sections run in order. **ONE move — Claude/orchestrator:** run the Gate-2 copy judge on the lines above, then `git push`; and on David's go, regenerate the handful of relax/settle composite clips to kill the baked "um/eyes".

---

## STATUS UPDATE (2026-07-23 (5), Opus): TOOLBOX CUSTOM-EDITING + BUILD-CUSTOM-STACK TILE + PLUS-ASSUMED FLAG v1217 (David's beta order; committed local)
David's order (verbatim intent): "for the beta assume user pays… full access to all the features including custom editing the tools. Build custom stack should be one of the first tools. could be one of the 8." Built all three, entirely inside `@SEC:TOOLBOX2` (+ one `.tbx-reset` CSS rule and one designAudit line). Regression zone (timeline/day-nav), `#sheet`/notebook, player-return, sky/puck all UNTOUCHED. Reused the EXISTING `openSessionComposer` (the CapCut editor) for both editing and building — NO new editor, no third menu system.

**1 — PLUS-assumed beta flag (`var TBX_PLUS = true;`, one line under `var TBX2`).** The ONE flag consulted at every Plus gate. Currently the sole gate is the dose-card "Adjust steps & timing" row: `gate.onclick = function(){ if (TBX_PLUS) tbxEditSteps(id); else tbxWhisper(); }`. true → the row is FUNCTIONAL (opens the composer); false → the old whisper toast. The PLUS badge stays visible either way (it signals the future paywall). Flip ONE line to ship to non-payers — audited, no gate is hard-coded.

**2 — Per-stack step/timing editing.** Tapping "Adjust steps & timing" opens `openSessionComposer` (via the `stackTimeline` grammar) seeded with the stack's live track (`tbxEditSteps`). `onSave` (fires on every composer edit) persists additively to **`S.tools.tbxEdit[id]`** (guarded reads, NO SCHEMA bump — S.tools additive precedent) AND repaints the open dose card in place (`tbxRepaintDose` — the card carries `data-tbxdose`). `Begin session →` runs the edited track at the chosen dose (`tbxLaunch`, Landing Contract). New resolver layer so an edit takes effect EVERYWHERE: `tbxTrack(id)` returns the edit if present else the default track; `tbxLaunch`, dose-card steps, and hero launches all read through it (dose scaling still applies). A hand-authored step script (Caught Scrolling) shows verbatim UNTIL edited, then re-derives from the live track. **Reset affordance built** (fit the design language cheaply): a subtle `.tbx-reset` "Back to default" text row, shown only when `tbxHasEdit(id)`, clears `S.tools.tbxEdit[id]`.

**3 — Build-custom-stack tile, pinned 8th.** The top-8 grid is now **7 usage-ordered stacks + a PINNED "Build" tile** (`tbxBuilderTile`, always position 8): same tile mark (54px face / radius 19 / lip) in `var(--create)` with `ti-plus`, label "Build", no peek coins. Tap → `tbxBuildCustom` opens the SAME composer seeded with a default block → assemble → `Save this stack` → `tbxNameDialog` (name it) → persists additively to **`S.tools.tbxCustom[]`** = `{id:"tbxc_…", name, track, dom, ti, created}` (dedicated store — reusing `S.tools.custom`/`S.tools.stack` would break their existing consumers, so per David's fallback clause used `tbxCustom`; NO SCHEMA bump). `tbxItem(id)` RESOLVER synthesizes an item-like object for customs (dom + peek coins derived from the track's tool domains via `TBX_TOOLDOM`) so customs are first-class: real tile, own dose card (kicker "YOUR STACK", derived steps, 2/5 chips, Start through the Landing Contract, editable via its own Adjust row). **Ordering fix:** the pool is `customs.concat(TBX_TOP)` so a freshly-saved custom (0 usage) wins the 0-usage tiebreak and **surfaces immediately** (verified: "My Reset" appeared as tile 1 right after save); usage is the primary sort, so a default that has earned use keeps its spot over an unused custom.

**Consequence flagged:** with 7 grid slots, `shutdown` (the old 8th) drops off the visible top-8 at day-1 — still reachable via the Night category + the evening hero. `heart`/`mind`/`vision`/`fullStack` remain data-only (unchanged from v1216).

**New functions/anchors (all in `@SEC:TOOLBOX2`):** `tbxCustoms`, `tbxTrackDoms`, `tbxItem`, `tbxHasEdit`, `tbxTrack`, `tbxSetEdit`, `tbxResetEdit`, `tbxEditSteps`, `tbxRepaintDose`, `tbxBuilderTile`, `tbxBuildCustom`, `tbxSaveCustom`, `tbxNameDialog`. Module vars: `TBX_PLUS`, `TBX_TOOLDOM`. `tbxDose`/`tbxLaunch`/`tbxTile`/`tbxBuildDose`/`tbxDerivedSteps` re-pointed through `tbxItem`/`tbxTrack`.

**New user-facing EN lines (8) — Gate 1 (`copy-audit.py`) PASS clean, zero rewrites; RU dict added same commit:** `Build` · `YOUR STACK` · `Save this stack` · `Stack saved.` · `Name your stack` · `My stack` · `Save` · `Back to default`. (Gate 2 adversarial judge is the orchestrator's — lines listed for it.) Reused already-gated copy where possible: `Build a stack`, `Add a tool`, `Begin session →`, `Adjust steps & timing`, `PLUS`, `min`, `Start`.

**designAudit:** ADDED `builder tile present (pinned 8th)` check (`#tbxGridTop .tbx-cell-build`). All toolbox checks PASS incl. new one; `top-eight grid 4×64px` still PASS (builder is the same tile mark). Clean idle-home run (no customs, tuner cleared): **only the 2 known pre-existing board fails remain** — `bloom calm` (0.18/40px) + `door top below strip bottom` — both proven pre-existing (not mine, not toolbox). **ZERO new fails.**

**Verified in preview (boot/layout/taps — mobile 375×812, dark, `alter_tuner` cleared, demoProfile+seedDay):** boots clean, **ZERO console errors** across the whole flow. Dose card opens seeded correctly; Adjust → composer opens seeded with the right track; add a tool → `S.tools.tbxEdit` written + dose card repaints to derived steps + reset row appears; reset → reverts to default steps, row gone. Build tile → composer (seeded default) → Save this stack → name dialog (default "My stack") → save → `S.tools.tbxCustom` written → custom tile surfaces as tile 1 → its dose card renders (kicker "YOUR STACK", derived steps) → **Start launched the runner and tore down home (Landing Contract intact)**. preship: parses · ratchet **anchors 20/20 · wipes 147 (unchanged — child-drain/createElement only, ZERO new innerHTML wipes)** · SCHEMA 5 (additive stores, no bump) · 26 logic invariants PASS · **v1216 → v1217** · server.js regenerated.
**DEVICE-UNTESTED (honest):** composer gesture feel (drag-reorder, drag-edge-resize, ± zoom) is preview-unprovable as always — confirm on phone. The name-dialog keyboard focus and the reset-row tap target are preview-tap-verified but device-feel-untested. The 6 device-only regression invariants unchanged (regression zone untouched).
**Scope consciously skipped:** custom-stack DELETE (no affordance built — a user can accumulate customs but not remove them; note for David if he wants it). Custom peek coins are derived (up to 2 from track domains), not hand-curated.
- **DAVID's ONE move:** on `/fresh.html` → build a stack from the "Build" tile, confirm it appears + launches, and that "Adjust steps & timing" now opens the editor (beta = paid).
- **CLAUDE's ONE move:** if David wants to remove custom stacks, add a delete affordance on the custom dose card (clears the `S.tools.tbxCustom` entry).

---

## STATUS UPDATE (2026-07-23 (4), Opus): TOOLBOX PEEK-COIN FIDELITY FIX + BIGGER TILES + ONE GRID v1216 (rendered-vs-rendered diff; committed local)
David reported (device screenshots) the stack peek coins looked like "a big messy fan sticking far out" vs the "tight tucked slivers" of his canvas design. STOPPED trusting the extracted numbers and did a **rendered-vs-rendered diff** — served the design canvas (`scratchpad/tools-menu/design_handoff_toolbox/Stack Language Tournament.dc.html`, frame "20a Top eight first") on :8098 and the app on :8099, measured one representative tile (First Light) on BOTH with getBoundingClientRect + getComputedStyle on every layer.

**ROOT CAUSE = peek-coin Z-ORDER reversed (not geometry).** Geometry was pixel-identical canvas↔app: face 46×46 r16, coin1 39×39 @ (-4,-2), coin2 32×32 @ (-7,-3), lip `0 4px 0 45%mix` — all matched to sub-pixel. The decisive difference: the **paint order of the two coins**. The canvas telescopes the BIGGER coin in front — `coin1 z-index:3 > coin2 z-index:2 > face z-index:20` above both → a clean nested step = "tight tucked slivers". The app had **both coins at `z-index:1`**, so DOM order painted the SMALLER `coin2` (32px) in FRONT of the bigger `coin1` (39px) → the two coins splayed in different directions (pink coin up-left, teal coin poking out lower-left) = the "messy fan". A scaled side-by-side clone (app z-order vs canvas z-order) confirmed it visually. (Extraction had recorded the coins only as "behind face", collapsing their relative order — that's the miss.)
- **Canvas-render caveat (reported honestly):** the served `.dc.html` can't resolve `var(--domain)` (its design-token CSS files aren't in the bundle, as DESIGN-EXTRACT §0 warned), so canvas FACES/coin1 render transparent (pink circles) — its VISUAL can't be pixel-compared. But its GEOMETRY (rects/offsets/z-index from inline styles) is intact and is what I measured. The app already renders the true colors/squircle correctly.

**FIX (index.html `.tbx-*`):**
1. **Z-order corrected** to mirror the canvas telescope: `.tbx-face z-index:3` (was 2) > `.tbx-coin1 z-index:2` (bigger, in front) > `.tbx-coin2 z-index:1`.
2. **Bigger tiles, proportional.** Base numbers = canvas geometry × 54/46 (≈1.174), rounded, preserving the exact visible-overhang proportion: **face 46→54, grid track 54→64, coin1 39→46 @ (-5,-2), coin2 32→38 @ (-8,-3), radius 16→19, icon 20→23, label 9.5→11, cell gap 6→7, grid gap 14/12→16/14.**
3. **Tuner var:** every tile number is wrapped `calc(<base>px * var(--tun-tbx-tile, 1))` — David tunes the whole mark from ONE var (set `--tun-tbx-tile` on :root via the tuner; cleared → 1 = the locked numbers above). Follows the existing `var(--tun-x, default)` convention (no declaration on `.tbx`, so a :root override wins).

**ONE GRID OF 8 (David's order).** Removed the SECOND grid from `renderToolbox2` (the `var second = …` line). Flow is now **top-eight grid → 2 hero rows → intro line → bento** (verified in preview: `.tbx` children = [grid, hero, hero, intro, bento]; 8 cells). `TBX_ITEMS` + `TBX_SECOND` data KEPT. Reachable-via-bento items still surface (cantSleep/lockTheWin/feelBetter/body live in the category panels). **Data-only now (no UI surface):** `heart`, `mind`, `vision`, `fullStack` — they were only in the second grid and aren't in any `TBX_CATS` category. Flag for David: if he wants them reachable, add them to a category.

**designAudit updated (locked numbers):** `top-eight grid 4×54px tracks → 4×64px`; `tile face 46px → 54px`; `tile radius 16px → 19px`; **ADDED `peek-coin telescope z-order (face>coin1>coin2)`** check. All PASS. tile1/tile3 hexes unchanged-PASS. No second-grid references existed in the audit (it only checks `#tbxGridTop`).

**Verified in preview (boot/layout/taps only — mobile 375×812, dark, `alter_tuner` cleared):** boots clean, **ZERO console errors**; idle "What now?" home renders; toolbox renders as ONE grid of 8 (David's order) → 2 heroes → intro → bento; **tiles now bigger with cleanly-nested peek coins (big coin in front)**; tile tap opens the dose card in place (First Light: 3 steps, 2/5 chips, Start, PLUS gate, inserted right after the grid); **Start launched the First Light runner and tore down home (`body.home-pane` false)** — Landing Contract intact. preship: parses · ratchet **anchors 20/20 · wipes 147 (unchanged — CSS + one deleted render line + audit edits; zero new innerHTML wipes)** · SCHEMA 5 · 26 logic invariants PASS · **v1214 → v1216** · server.js regenerated.
**designAudit honesty (idle home, tuner cleared):** every TOOLBOX/tile check PASSES (`4×64px`, `54px`, `19px`, `telescope z-order`, plan-button, hexes). TWO board checks FAIL and were proven **PRE-EXISTING on the untouched v1214 baseline** (git-stash cross-check): `bloom calm` (idle ring boxShadow 0.18/40px vs ≤.14/≤32) and `door top below strip bottom` (door 161 < strip 206/218 at rest). Both are on the protected home BOARD (ring bloom / edge-door position), NOT the toolbox — I did not touch them (regression-contract risk, out of scope). They may be demoProfile-seed artifacts (the "12/12" claims in the sections below were measured in a different state). This change adds ZERO new failures.
**DEVICE-UNTESTED (honest):** final pixel judgment on the tile size belongs to David's tuner (`--tun-tbx-tile`); scroll/press FEEL preview-unprovable as always. The 6 device-only regression invariants unchanged (regression zone untouched).
- **DAVID's ONE move:** on `/fresh.html` → confirm the peek coins now read as tight tucked slivers (not a fan) and the tiles are the right size; if size is off, tuner → `--tun-tbx-tile` → send the number.
- **CLAUDE's ONE move:** if David wants `heart`/`mind`/`vision`/`fullStack` still reachable, wire them into a `TBX_CATS` category (they're data-only after the second-grid removal).

---

## STATUS UPDATE (2026-07-23 (3), Opus): WELCOME-BACK POPUP REMOVED + IDLE CIRCLE 64→52vw v1214 (two David device orders, one commit)
Two direct orders folded into one ship. Regression zone (timeline/day-nav) UNTOUCHED. No new user-facing copy. Ratchet held (wipes 147 unchanged — the popup removal DELETED a call site, added zero innerHTML wipes).

1. **"WELCOME BACK" popup removed from the home surface.** The card was `comebackLadder()` (app.js `@SEC` ORGAN D moment-listener, ~L12820) — a calm bottom `mlCard` (kicker "welcome back", headline "You came back. That bounce — not the streak — is the skill.", "One small thing on purpose today?", "I'm in ▶" / "not today"). **Trigger:** `checkMoments()` (the passive one-nudge/day scan) fired it as its FIRST branch when `profile().bouncedBack` (roughY && goodT) was true; `checkMoments("open")` runs ~1200ms after the daily gauge completes (`gaugeOpen` → `maybeWelcomeBack` → `openHome`), so on a bounced-back day it landed the card over home. **Removed:** the `if (pf.bouncedBack) { markNudge(); comebackLadder(); return true; }` branch inside `checkMoments` (replaced with a comment). The `comebackLadder()`/`mlCard` machinery is LEFT INTACT — it's shared by the drift off-ramp + pre-sleep moments and by `DEV.moment("comeback")` (dev testing). **State check:** `bouncedBack` is a DERIVED property recomputed each open; `comebackLadder`'s "I'm in ▶" wrote NO persistent flag anything waited on (only the local `S.profile.muteNudgeUntilK = todayK+2` on its own "not today" no-scold path). Removing the trigger leaves ZERO stuck state — nothing waits for an acknowledgment that can no longer happen.
2. **Idle-home circle 64vw → 52vw** ("the big pink circle is way too giant even at 64"). `index.html #trackerFull.tf-home.st-idle #tfRing` default `--tun-ring-vw` **64vw → 52vw** (still the tuner knob, David fine-tunes on device). Also synced the stale tuner slider default `ringVw def 72 → 52` (app.js `@SEC` design-tuner — it had drifted from the CSS fallback). **designAudit circle check 64%±3 → 52%±3.**

**Consequences handled (per the order):**
- **strip→circle gap check (7-12vh):** re-measured at 52vw = **9%**, still in band — NO drift, NO band-widening needed.
- **door-top-below-strip check:** re-measured HONESTLY (all inline `--tun-*` cleared, the audit's precondition) = door top 254 ≥ strip bottom 234 → **PASS** with 20px clearance (baseline 64vw was 254 ≥ 211). The smaller circle drops the strip ~23px via the centered flex stack but stays clear of the fixed-`--tun-door-cy` (32dvh) door tab — NO layout adjustment required.
- **tiles-peek:** first tile row still peeks at the fold on the idle home; no dead stretch opened above the tiles.

**designAudit updated numbers — preview run (idle home, `alter_tuner` + inline `--tun-*` cleared, mobile 375×812): `ALL PASS (18)`.** Circle 52% (want 52%±3), gap 9%, all door/tile/grid/bloom/plan-button/next-line checks unchanged-PASS.

**Verified in preview (boot/layout/taps only — mobile 375×812, dark, tuner cleared):** boots clean; **ZERO console errors**; the demoProfile+seedDay repro no longer surfaces the WELCOME BACK card over home (`checkMoments()` returns false, deals no comeback card; behavioral test confirmed); idle home renders balanced — smaller centered circle, "What now?", "open afternoon — pick a thread", "Plan my day", story strip, edge tabs below the strip, toolbox tiles peeking at the fold. Baseline (4907a6e stashed) cross-checked: audit was ALL PASS(18) at 64vw with tuner cleared, confirming the earlier one-off door FAIL was a self-inflicted incomplete-tuner-clear, not the circle change. preship: parses · ratchet anchors 20/20 · **wipes 147 (unchanged)** · SCHEMA 5 · 26 logic invariants PASS · **v1213 → v1214** · server.js regenerated.
**DEVICE-UNTESTED (honest):** final pixel judgment on the 52vw circle size belongs to David's tuner (`--tun-ring-vw`); scroll/press FEEL preview-unprovable as always. The 6 device-only regression invariants unchanged by this pass (regression zone untouched).
- **DAVID's ONE move:** on `/fresh.html` → confirm the WELCOME BACK popup is gone and the circle size reads right; if the circle's off, tuner → `--tun-ring-vw` → send the number.
- **CLAUDE's ONE move:** none pending on this pass — it's shipped; the v1209 Toolbox copy Gate-2 from the section below still governs that earlier commit.

---

## STATUS UPDATE (2026-07-23 (2), Opus): TOOLBOX LAYOUT-CORRECTION PASS v1213 (David's four device verdicts — committed local)
David tested the v1209/v1210 Toolbox on device and issued four direct layout verdicts. Implemented all four as tuner-var-driven defaults (David fine-tunes the final pixels in the in-app Design tuner). No new user-facing copy (the Plan-my-day label already passed the gates). Regression zone (timeline/day-nav) UNTOUCHED.

1. **CIRCLE TOO BIG → back to 64vw.** The idle-home play circle grew 64→72vw at some point; reverted to the prior locked 64vw. `index.html #tfRing` default `--tun-ring-vw` **72vw → 64vw**. Preview measured 240px = 64% of 375 ✓.
2. **PLAN-MY-DAY BUTTON MOVED TO THE HOME FACE.** The Plan-my-day sticker was the first section of the toolbox scroll continuation; it now renders on the home face directly below the circle + "What now?" + next-line block, visible at rest without scrolling. New helper `tbxPlanButton(host)` (app.js, next to `tbxPlanDay`); called from `renderHomeFace` into `#tfCtrls` (the empty-under-TBX2 control row, sits `--tun-tools-gap` 5vh below the circle); REMOVED from `renderToolbox2` so it exists **once**. Exact approved styling reused verbatim (`.tbx-plan`: #8F55DE / radius 14 / 2.5px #160510 / 0 4px 0 #160510 lip / Baloo 2 800 13px #e8ddff / ti-calendar); same `tbxPlanDay` handler. The top-eight grid is now the first toolbox-scroll content.
3. **EDGE DOORS TOO HIGH → lowered below the story strip.** The planner/garden edge tabs sat level with the story strip (measured door top 161 vs strip top 172 — overlapping). Door **size 18×80 UNCHANGED** (designAudit-locked); only the vertical position moved. `index.html .tf-homedoor` (both the base and the one-page `.tfw-home >` rule) default `--tun-door-cy` **23dvh → 32dvh**. Preview measured door top **234 ≥ strip bottom 191** (43px clearance) ✓. The tabs now sit as edge tabs beside the upper circle (screen-edge x, no horizontal overlap with the centered circle).
4. **TOOL TILES START TOO LOW → toolbox pulled up.** The home zone is `min-height:100dvh` with its board centered, leaving a long empty bottom band (measured 138px dead gap between the plan button and the first tile) before the ground-zone toolbox. Added `margin-top: var(--tun-ground-pull, -12vh)` on `.tfw-ground` (pulls the ground up into that empty band; vh-based so it scales with the viewport — a taller phone has a bigger dead band) + `.tbx` top padding **6px → 0**. Preview: first tile row moved **832 → 728** (up 104px), now peeking at the fold at rest / arriving immediately on scroll; 40px gap under the plan button, no overlap. `--tun-ground-pull` is the tuner knob (negative = up).

**New tuner-var defaults (all exposed in the Design tuner):** `--tun-ring-vw` 64vw · `--tun-door-cy` 32dvh · `--tun-ground-pull` -12vh. Board circle/strip/next-line paint otherwise untouched.

**designAudit updated (verdict #5) — new locked numbers, run in preview (idle home, `alter_tuner` + inline `--tun-*` cleared): `ALL PASS (18)`:**
- circle width check **72%±3 → 64%±3** (got 64%).
- ADDED "plan button present on home face" (got present) — the Plan check now targets the home-face button (still present + `0 4px 0 #160510` lip, both PASS).
- ADDED "door top below strip bottom" (got door top 234 · strip bottom 191, PASS).
- Door 18×80 / border-0 / planner+garden fills — unchanged, PASS. Grid 4×54px tracks / tile face 46px / radius 16 / tile1+tile3 hexes / bento aspect / bloom / strip→circle gap / ring rim / next-line-plain — all unchanged, PASS.

**Verified in preview (boot/layout/taps only — mobile 375×812, dark, tuner cleared):** boots clean, **ZERO console errors** across the whole session; idle home renders with all four corrections visible; toolbox scroll content renders; tile tap opens the dose card (2/5 chips + Start); **Start launched the runner (First Light: stretch→breathe→mantra), tore down home (`body.home-pane` false), ran to "Session complete", Done returned HOME (`home-pane` true, Plan button present, toolbox re-rendered)** — Landing Contract intact. preship: parses · ratchet anchors 20/20 · **wipes 147 (unchanged — child-drain only, zero new innerHTML wipes)** · SCHEMA 5 · 26 logic invariants PASS · **v1212 → v1213** · server.js regenerated.
**DEVICE-UNTESTED (honest):** scroll FEEL / momentum of the pulled-up toolbox column; press FEEL (translateY on the plan button + tiles); and the FINAL PIXEL JUDGMENT on all four changes belongs to David's tuner (circle size, door drop, ground pull, plan-button gap) — the defaults are sane starting points, not device-confirmed pixels. The 6 device-only regression invariants (timeline scroll / drag / pane-swipe / week-strip / journey / onboarding) remain never-confirmed-on-device, unchanged by this pass (regression zone untouched).
- **DAVID's ONE move:** on `/fresh.html` → eye all four on device; if any pixel is off, tuner → `--tun-ring-vw` / `--tun-door-cy` / `--tun-ground-pull` → send the number.
- **CLAUDE's ONE move:** push v1213 (this pass touches no copy, so no Gate-2 gate — but the v1209 Toolbox copy Gate-2 from the section below still governs that earlier commit).

---

## STATUS UPDATE (2026-07-23, Opus): TOOLBOX HOME-SCROLL REDESIGN BUILT v1209 (frame 20a/20c, committed local — NOT pushed, awaits Gate-2 copy judge)
Built the Fable-planned Toolbox (spec `scratchpad/tools-menu/BUILD-SPEC.md`, design frame 20a "Top eight first" + 20c dose card). The Home ("What now?") scroll-down continuation is now the Toolbox; the board above (HUD · circle · "What now?" · next-line · story strip · edge doors) is untouched.
- **New section `@SEC:TOOLBOX2`** in app.js (added to @MAP + `_dev/ratchet.js` ORDER, anchors 20/20 in order). Functions: `renderToolbox2` (main, into the ground zone `#tfWorldGround`), `tbxTile`/`tbxHeroRow`/`tbxSquare`/`tbxBuildPanel`/`tbxBuildDose`, `tbxOpenCat`/`tbxOpenDose` (single-open each, `_tbxOpenCat`/`_tbxOpenStack` transient state), `tbxHeroes` (contextual picker), `tbxLaunch`/`tbxPlanDay`/`tbxWhisper`, `tbxOrder`/`tbxScaleTrack`/`tbxDose`. Data: `TBX_ITEMS` (16 stacks + 12 plain tools), `TBX_CATS` (6; Deepen/Become kept in spirit but excluded), `TBX_TOP`/`TBX_SECOND`. CSS: `.tbx` block in index.html (8 domain vars, tiles/heroes/bento/dose card, color-mix lips, `--ease-settle` .3s open anim).
- **REPLACES** the 2x4 `renderHomeGrid` tiles AND the `renderGroundTools` shelf — both gated OFF under `TBX2` (kill-switch, `TBX2=false` = old behavior byte-identical). **`renderGroundTools` + `renderHomeGrid` stay in the file, now UNUSED** (flagged here per the spec). The board's 2x4 grid under the circle is GONE (its tools live one scroll below in the Toolbox); circle/strip/next-line unchanged — **David's device eye should confirm the board still reads right without the grid.**
- **State:** additive `S.tools.tbxDose[id]` (guarded reads, **NO SCHEMA bump** — additive S.tools precedent). Completing a TBX stack logs `tickTool(<tbx id>)` so the two grids reorder by real usage over time (day-1 = design order). Launch contract identical to the old tiles (`landFromHome(); leaveHomeForPlayer(); runStack(track, 0, onAll)`); heroes launch the default dose directly; Plan-my-day reuses the planner edge-door path.
- **PLAY-HEX DIVERGENCE (flag):** `.tbx --play:#ffc83d` intentionally diverges from `DOM.play.c #d99f30` on this surface (pixel-fidelity mandate, DESIGN-EXTRACT §0). Full Stack + the Settle square wear #ffc83d here only.
- **designAudit updated (decision 10):** the two obsolete old-grid tile-hex checks (tile1 rgb(91,143,214)/tile3 rgb(214,106,126)) and the old `.tf-toolgrid` grid-width check were repointed to the Toolbox: tile1 = First Light face rgb(255,138,58), tile3 = Caught Scrolling face rgb(255,95,160), tile face 46px, tile radius 16px, top-eight grid = 4×54px tracks, Plan button lip `0 4px 0 #160510`, bento square aspect 1. All circle/strip/door/bloom/next-line checks untouched. **Preview run (idle home, tuner cleared): ALL PASS (16).**
- **Copy Gate 1:** all 82 new EN lines PASS `copy-audit.py`. Two design em-dash lines rewritten minimally at authoring time (logged): "choose on purpose — staying counts" → "choose on purpose, staying counts"; bento intro "And when you need something specific — one box to settle, one to go deeper." → "For when you need something specific: one box to settle, one to go deeper." Every new EN line has an RU dict entry in the same commit. **Gate 2 (fresh cheap copy judge) is the orchestrator's next step — DID NOT PUSH.**
- **Verified in preview (boot/layout/taps only):** boots clean, ZERO console errors, Toolbox renders below the board in the world scroll, dose card opens with correct steps/kicker/chips and SURVIVES the 1s tick, category open/close is single-open + toggle, chip 2↔5 toggles + persists to `S.tools.tbxDose`, Start launches the runner + tears down home, hero play launches directly, Plan-my-day routes with no error. Ratchet: anchors 20/20 · wipes 147 (unchanged) · SCHEMA 5. preship v1208→v1209, server.js regenerated.
- **DEVICE-UNTESTED (honest):** scroll FEEL / momentum of the long Toolbox column; press FEEL (translateY on tiles/coins/squares/plan); the runner's RETURN-HOME after a Toolbox launch (the launch contract is byte-identical to the shipping tiles, so parity holds by construction, but the landing FEEL is preview-unprovable). Also: the board without its 2x4 grid is a composition change for David's eye.
- **DAVID's ONE move:** on `/fresh.html` after the orchestrator pushes → judge the Toolbox on device (scroll feel, the removed board grid, dose-card + category open feel).
- **CLAUDE's ONE move (orchestrator):** run the Gate-2 copy judge on the 82 new EN lines, then `git push`.

---

## STATUS UPDATE (2026-07-22 (8), Opus): JANK FIXES SHIPPED v1199 (David device-tested v1198, 5 bugs, all root-caused)
David tested v1198 on device and hit 5 issues; all root-caused in code + preview and fixed in v1199 (5e4c111):
1. **"Hard to scroll... thumb in certain places"** = ROOT CAUSE: `.tf-stage` (the circle, dead-center) carried inline `touch-action:none` for its drag-to-close → a big dead scroll zone. A preview scroll-path audit found it was the ONLY blocker in the `#tfWorld` column. Fixed: CSS forces `touch-action:pan-y` on `.tf-stage` under the one-page home + `tfDrag` bails there before `preventDefault`. Verified: zero remaining blockers, stage computes pan-y.
2. **"Planner shows no home button"** = the `home-onepage` body class fades the puck to opacity:0 (nothing to return from AT home); only the door path cleared it (teardownWorld), so any other pane-entry left it set → puck invisible. Fixed: `setPaneRest` clears `home-onepage` on every pane rest. Verified: puck lit + on-top on planner.
3. **"Exit world takes you to planner"** = `closeGame` only stripped game classes, falling through to the planner underneath. Fixed: the exit-world button (`#gameExit`) now goes HOME. Verified: lands `st-idle` home, not planner.
4. **"Minimized tracker looks off vs the mockup"** = the tracking dial rendered STRIPED; the mockup (compass-rose / David's screenshots) is a SOLID domain-color dial. Fixed (`D.c` not `tfStripe(D.c)`).
5. **designAudit** — finally got a clean idle-home run (persona reached `st-idle`): **ALL PASS 12/12** with tuner fully cleared (bloom default 0.12/28px). The gate is green.
**DEVICE-UNTESTED (honest):** scroll FEEL/momentum + the pill morph (preview lies about gestures); pill SIZE tunable via `--tun-puck`. David re-tests on phone.
**STILL OPEN (unchanged from below):** M2/M3 = the adaptive home-player RETURN (his ruling: ONE home that becomes the player, sheds buttons — captured in spec §5 M2); M5 = the empty-screen-on-scroll-up (the `adoptTrailToSky` MOVE + carousel-drag reclaim gap — the dead-ZONE half is now fixed); M6 = one `animateOpen` grammar for sheets + puck-anchored player morph.
- **DAVID's ONE move:** fresh.html → re-test the 4 fixes on device (scroll the circle, planner home button, exit-world, the tracker pill); if the pill size is off, tuner → `--tun-puck` → send the number.
- **CLAUDE's ONE move (fresh Opus session):** M2/M3 adaptive-home-player return + M5 empty-sky, per the spec.

---

## STATUS UPDATE (2026-07-22 (7), Opus): MOTION WAVE I SHIPPED v1198 (M1 puck + M4 strip fade) — M2/M3/M5/M6 remain
Built + shipped the first half of the motion wave (spec `_specs/_newera-build/WORLD-HOME-2026-07-22.md` §5), verified in preview.
**M1 — the ONE shape-shifter (fixes "minimized home super janky" + "recreate the mockup animation" + "proportion"):** ROOT CAUSE found — the minimized tracker was TWO elements, the puck AND the `#liveDock` "matches your plan" bar, because the per-pane liveDock show rule (index.html ~2565, specificity 1,4,1 + !important) OUT-SPECIFIED the puckv2 hide (1,1,1) → on the planner both rendered, the dock wandering as body-classes moved its fixed position. Fixed with co-specific hides (proven in preview: liveDock computes `display:none` on the planner, was `flex`). Puck rebuilt to `compass-rose.html`: proportion `17.5vw` (~66px, was fixed 52px ≈13%), morph `width/padding .4s cubic-bezier(.4,.85,.3,1)`, `.gpk-text` opacity-fades `.3s`, the dial wears the ACTIVITY icon (not a pause glyph), the home tail is gone, and the WHOLE puck taps home (pause/stop/break live in the player, front-and-center at home). `--tun-puck` tuner var added.
**M4 — sky glue (fixes "the journey appears, the instagram carousel fades away"):** `onWorldScroll` now fades + lifts the story strip as you scroll UP toward the sky (verified curve 1.0→0.64→0.20→0, resets to 1 at home; cleared on teardown). Added `--tun-sky-gap` lever (default 54px UNCHANGED) for the "timeline closer to the circle" ask — David dials it DOWN on device to hug the trail to the circle.
**Verify:** boots clean, no console errors; the two behaviors measured live. Idle-home paint UNCHANGED from v1197's 12/12 (diff is puck overlay + hidden dock + rest-inert scroll fade + unchanged-default var; the seeded preview persona wouldn't drop off its `st-claim` face for a live idle audit, but the diff touches ZERO of the 12 audited elements). **Morph + scroll FEEL is DEVICE-UNTESTED** — the honest report.
**STILL OPEN (spec §5 M2/M3/M5/M6 — the riskier, regression-adjacent half; next Opus session):**
- **M2/M3 — animated returns + the "expanded cockpit" question.** David: "in the planner, pressing home acts like an expanded cockpit; should take you home, back to the right." NEEDS HIS READ: while a timer runs, "home" legitimately renders the TRACKING face (big ring + Stop/Break = the cockpit look, per two-clock law) — does he want (a) a directional slide only (home enters from the right, planner exits left), keeping the tracking face, or (b) even while tracking, land on the calm WORLD home (circle-as-dial + doors + tools + strip visible)? (b) is a bigger ONEHOME change (tracking is currently a non-calm face with no tools/doors).
- **M5 — dead thumb zones + empty-screen-on-scroll-up.** Build `DEV.scrollAudit()` (elementFromPoint grid), kill relic listeners still armed under ONEPAGE (`initHomeAxis` pointerdown, old `.tf-stage` drag-to-close). The empty-sky-on-scroll-up (video 0:10, reached from the tracking player) — the `adoptTrailToSky` MOVE + carousel-drag reclaim gap — NOT yet touched.
- **M6 — one `animateOpen` grammar** for every sheet (What's-the-plan / Switch-to / block editor / Energy / Arrange) + puck-anchored player expand/collapse morph.
- **DAVID's ONE move:** fresh.html → judge v1198 (the minimized player + carousel fade) on device; answer the M2 (a)-vs-(b) question; if the puck size or sky gap need it, dev tools → tuner → send values.
- **CLAUDE's ONE move (fresh Opus session):** M5 dead-zone/empty-sky (highest-value, "janky scroll" was a top complaint) + M2/M3 per David's read, then M6.

---

## STATUS UPDATE (2026-07-22 (5)): v1197 — TILES TO BOARD WIDTH + THE SELF-AUDIT GATE IS LAW
David caught the tiles too big (grid rendered 88% viewport; the 70% target had been silently dropped) and demanded a self-auditing system. Shipped v1197 (65f556c): grid = `var(--tun-grid-w, 70vw)` max 360 centered (tiles slim to the board), and **`DEV.designAudit()`** = 12 mechanical checks of the live idle-home vs the locked board numbers (circle 64vw · gap 7-12% · rim 5-11px · bloom ≤.14/32px · grid 62-86% · doors 18x80/0-border/exact fills · raw tile hexes · plain text lines). Ran pre-ship: **ALL PASS 12/12.** The gate is now IN CLAUDE.md (Verification truth): home-surface paint changes must pass designAudit before shipping, forever; David can run it on-device in dev mode. Tuner gained --tun-grid-w + --tun-ring-vw + --tun-gap.
- **DAVID's ONE move:** fresh.html → final eye-pass vs his board; tuner for taste; then "go popups" in a FRESH Opus session.
- **CLAUDE's ONE move:** popups build (census-scoped, whisper-default) next; extend designAudit with each new locked number.

---

## STATUS UPDATE (2026-07-22 (4)): MEASURED BOARD MATCH SHIPPED v1196 (hands-on, all misses root-caused)
David rejected v1195 too ("white outline... colors off"). Claude fixed DIRECTLY (surgical CSS, measured at 430x932, no agent relay): (1) door white rim = default `<button>` UA border → reset added; (2) circle capped at 256px (~54% width on his phone) → cap 320, renders TRUE 64vw; (3) **THE DEAD BAND root-caused: `justify-content:space-between` on `.tfw-home` was distributing the spare viewport as giant gaps** → flex-start + explicit rhythm (strip→circle gap measures 9%, grid bottom-anchored 98%); (4) **tiles were ink-mixed 24% darker by skinTile before painting** → approved hexes now render RAW (rgb-verified); (5) bloom 28px/.12 + white inset rim deleted; (6) both home text lines plain (no leading icons). All measured before ship. Tuner vars kept as overrides (--tun-ring-vw and --tun-gap added).
- **DAVID's ONE move:** fresh.html → judge v1196 against his board; fine-tune anything with the dev Design tuner → "copy values" → paste.
- **CLAUDE's ONE move:** hardcode tuner values if sent; then "go popups" (census-scoped) — FRESH session, Opus.

---

## STATUS UPDATE (2026-07-22 (3)): FIDELITY SNAP + THE DESIGN TUNER SHIPPED v1195
David posted expectation-vs-reality (his approved mockup vs device v1193): badly off — doors huge, circle neon, tiles hot. ROOT CAUSE: the tuning widgets used their own base values; the builds applied his factors to different real values (THIRD widget-fidelity failure, memorialized in `chat-widget-style-law` memory with THE FINAL LAW: chat widgets = STRUCTURE decisions only; PIXEL TUNING happens only in-app). Shipped v1195 (e6fc382):
- **Fidelity snap to the approved board:** tiles = the exact cooler palette (#5b8fd6 #8b6fd6 #d66a7e #6aa76f #c9a23f #6f8fd6 #4f9d95 #9b7fd6) as REAL colors via skinTile (filter hack removed); circle = flat disc + 7px visible plum rim + bloom tamed (40px/.18, white rim .06); doors verified 18x80 at 23dvh center; empty-day strip no longer renders circle-outline placeholders; home rhythm fixed (space-between dead band removed).
- **THE DESIGN TUNER (dev-only):** dev menu → "Design tuner" → 7 live sliders on CSS vars (door w/h/centerY, ring thickness, bloom, tile brightness/saturation), defaults = the approved values, "copy values" → JSON to clipboard, persists in localStorage dev-key only, invisible+inert for normal users. **The new pixel-tuning loop: David drags on REAL pixels on his phone → copies values → Claude hardcodes.**
- **DAVID's ONE move:** fresh.html → check home vs his mockup; if anything's still off, dev tools on → Design tuner → drag till right → "copy values" → paste in chat.
- **CLAUDE's ONE move:** hardcode David's tuner values when they arrive; then "go popups" (census-scoped) on Opus in a FRESH session.

---

## STATUS UPDATE (2026-07-22 (2), agents done): FIX WAVE SHIPPED v1193 + POPUP CENSUS COMPLETE
Both agents landed. **v1193 live (beb21ac):** doors restored to the tuned inner-rounded shape (specificity bug), anchored IN the home zone (scroll with it), taps fixed (root cause: the OLD `#tfBackdrop` relic at z97 was swallowing door touches — disabled under onepage), boot scroll-up now shows the trail immediately (sky-ready gate before the scroll commit), puck fades in whenever >40% away from home + smooth-scrolls back on tap, strip transition removed. Feel DEVICE-UNTESTED as always.
**Popup census (21 surfaces, full report in the 2026-07-22 chat / summarized in WORLD-HOME spec):** the villain is the BOOT CHAIN — up to 4 full-screen questions gate every open (gauge → relief → space-check → welcome-back). Half the app already uses the correct bottom-card whisper pattern (`mlCard`, the "bounce" card). Redesign scope: demote the 4 boot interrupters + the random 30% post-tool reflection card to whisper, calm the 2 loud celebrations, delete 2 dead popups (`tooBigSheet`, `recommitSheet`), keep modals only for user-opened pickers/player/onboarding/error. **Awaiting David's "go popups" on Opus.**

---

## STATUS UPDATE (2026-07-22, Fable+agents): ONE-PAGE WORLD SHIPPED (v1189) + DEVICE BUGS → FIX WAVE + POPUP RETHINK
Overnight ships: **v1187** (edge-tab doors 18x80 tuned by David via slider widgets, palette-4 tiles) → **v1188/89 THE ONE-PAGE WORLD** (real #jpTrail adopted into a SKY zone above home, full 21-tool GROUND shelf below, ONE native scroll, no cuts — the AXIS_V1 hint-panel model David rejected auto-disables; flag ONEPAGE). David device-tested and filed 6 bugs + 2 designs; all captured in **`_specs/_newera-build/WORLD-HOME-2026-07-22.md`**:
- **FIX WAVE running (Opus agent):** doors rendered SQUARE (confirmed CSS specificity bug — the tuned inner-rounded shape lost to the onehome rule), doors must anchor IN the home zone not viewport-fixed, door taps dead, boot→scroll-up shows EMPTY sky until a later render, puck must appear whenever away from home (tap = smooth-scroll back), strip scrolls naturally (no exit animation).
- **POPUP RETHINK:** census agent (sonnet) inventorying every popup; tier grammar written (WHISPER default = quiet tap-when-ready guardian line under the status row; MODAL only for irreversible/blocking; SILENT for ambient). David leaning demote-everything-first.
- **CIRCLE = FIRST STONE law (David's ruling):** home circle IS the journey's NOW stone; scroll-up reveals the next stone, NO zoom transition; first-run = Intro as the stone above + What-now offers it; Phase B (journey restructures from the day plan) needs its own engine spec before build.
- **DAVID's ONE move:** when the fix wave ships, re-test the 6 on the phone; answer the whisper-default + placement questions (spec §4).
- **CLAUDE's ONE move:** integrate fix wave + ship; then the popup-family redesign build (census-driven, whisper tier) on Opus.

---

## STATUS UPDATE (2026-07-21, Opus): HOME COMPOSITION FINAL SHIPPED v1186 (screenshot-verified)
After a mockup loop (Opus-rendered boards, David's nuance notes), the home was BUILT to his locked pick and screenshot-verified against his reference, shipped v1186 (f78339e):
- **VIVID LABELED DOORS (the fix he pushed for — "important buttons, shouldn't feel invisible"):** Planner (purple `#b07aff`, `ti-calendar`, "Planner" label, glow+lift) top-LEFT → planner pane; Garden (teal `#2ab8c4`, `ti-plant-2`, "Garden" label) top-RIGHT → game/garden. **Journey door REMOVED** (journey = scroll, later). 54px rounded-squares, white icons, labels.
- **CIRCLE:** reference size (`#tfRing` min(64vw,256px)), thin ~8px plum ring kept (H-D1 ruling, the arc's home), play triangle, soft pink bloom. Circle IS the track button.
- **GEMS clean** (sparkle avatar `#tfGear` hidden on onehome — OWED: settings has no home entry now, relocate later). **NEXT line** = plain lilac text, not a pill. **TILES** float free (container killed) + smaller.
- Ratchet flat (147), zero console errors, gated on NAV_V2. Tile HUES still the domain set (not the cooler reference pastel) — minor, deferred.
- **DAVID's ONE move:** hard-refresh `/alter/fresh.html`, look at home — doors should now grab the eye; confirm the composition + circle size on device.
- **CLAUDE's ONE move:** on David's ok → the remaining §7.9 boards (popup family, stack-first shelf) + settings-entry relocation; then H-AXIS (scroll-up-to-journey).

---

## STATUS UPDATE (2026-07-21, Fable, reconciled): REFERENCE-FIDELITY SHEET ADDED TO THE §7.9 QUEUE
David re-posted his home reference mockup with nuance notes (circle size/ring, gems row, plain next-line, tile hues/no panel, planner-door-LEFT correction, the single vertical axis). Transcribed as **`_specs/_newera-build/HOME-COMPOSITION-2026-07-21.md`** and SUBORDINATED to DESIGN-STUDIO §7.9 (the newer round-2 verdicts): it is the fidelity sheet for render boards (a) home-fixed and (b) door/gem chrome, plus the H-AXIS hand-off mechanics (single-owner gesture handoff, not one scroller) for the §7.7-REVISED entry motion. Circle law reaffirmed: reference SIZE + soft bloom, H-D1 visible tight plum ring (the dial identity), circle IS the button.
- **DAVID's ONE move:** `/model claude-opus-4-8` → "run the render queue" (§7.9 a-d, effort MEDIUM, anchored on live screenshots + the fidelity sheet). Picks come back to you as boards.
- **CLAUDE's ONE move (Opus):** render (a)-(d), David picks, then build the picked home fix + chrome to fidelity.

---

## STATUS UPDATE (2026-07-21 late night, Fable): SIX HOME/NAV GRIEVANCES → WORLD-MAP BRIEF (no code touched)
David's first-hours verdicts on v1185, all designed-through and written as **`DESIGN-STUDIO-2026-07-21.md` §7** (the brief for the next Opus render session): (1) journey glyph must LEAVE top-left, left = planner (his original concept; v1183 deviated) → doors move ONTO their axes as edge slivers with content peeks; (2) gems invisible → the GEM CAIRN (chunky pile by the journey door, arcs on gain, tap = rank banner); (3) home buttons illegible → three pieces only (YOUR STACK hero + Breathe + plan chip), BLOOM grammar (tap = expand-and-show, never launch blind), his drag-scrub idea = device-tested layer 2; (4) toolkit column fully designed (time-doors viewport → All-tools grid absorbing the home 2x4 → builder/science, ~7-visible ceiling); (5) plan CTA becomes a daypart state machine (10 PM blank day = "Plan tomorrow", never "Plan your day"; founder N=1 evidence tonight); (6) journey-past reconciled: recommended THE GARDEN IS YOUR PAST + a 2-3 stone wake under NOW (vs Duolingo-literal Option B). Six render boards specified in §7.8, including the owed bento/day-composer redesign.
- **ROUND 2 (same night):** David verdicted live against the first boards: home stays EXACTLY as built (no reskin, no moved circle), the circle IS the track button (kill the Track-now bar, secondary actions to the ground bumper), journey visual stays as built (only the scroll-up entry motion is new), STACK-FIRST law added (stacks > tools; 1-minute minis + the one-minute stack), popup system flagged as old-build relics (one-family redesign owed), corner doors + gem counter flagged janky vs mockup. All in **DESIGN-STUDIO §7.9** with the corrected Opus render queue (a-d). Process fix: widgets were wrongly rendered on Fable; rule re-affirmed, renders = Opus only.
- **DAVID's ONE move:** switch to `/model claude-opus-4-8`, effort MEDIUM, say "render the §7.9 queue" (4 boards: fixed home, chrome options, popup family, stack-first shelf), then pick.
- **CLAUDE's ONE move (Opus):** screenshot the live home FIRST, render the 4 boards anchored to it per §7.9 + STYLE-NEW-ERA, collect picks, cut build deltas. (v1185 device checklist below still stands; puck color-shift remains David's #1 device check.)

---

## STATUS UPDATE (2026-07-21 LATEST, Opus swarm): ONE-HOME + LIVING PUCK LIVE — v1185
The root of David's 3x "home still looks like the old cockpit": #trackerFull had 6 faces and only idle carried the home frame. FIXED via 2 parallel Opus parcels, integrated (1 flag-conflict + 1 wipe-comment resolved), SCREENSHOT-VERIFIED, shipped v1185 (7971851).
- **ONE-HOME LAW (`ONEHOME=true`):** `renderHomeFrame()` runs on EVERY full-screen face → status row · story strip+chevron · journey/garden doors · avatar · circle stage always present; tool grid on calm faces, hidden while tracking. **Screenshot-proven: idle, tracking (st-onplan), and claim all render as siblings of the approved home face.** Claim controls rebuilt to Track-now + [Did it already · Not mine] quiet row → kills the welcome-back-over-CTA overlap. Doors moved BELOW the strip (own slots) so pills get full width.
- **LIVING PUCK (`PUCK_V2=true`):** guardPuck = compact shape-shifter pill; disc wears the color of NOW (activity while tracking / next block when idle / gold paused / pink home when nothing), disc-tap acts (start next / pause / resume), tail = home; old wide #liveDock retired. Agent-verified end-to-end in its worktree.
- **HONEST GAP:** the puck's live color-shift could NOT be re-confirmed in my integration harness — out-of-band state injection doesn't trigger renderPuck (it rides renderLiveDock, which is event-driven), and the real UI path kept landing on the seeded claim state. Worst case = a plain pink home puck (no wide dock, no regression); best case (agent's verification) = full color-shift. **This is David's #1 device-check.** If stale on device, the fix is ensuring navigation/tick calls renderPuck.
- Both behind kill-switches (ONEHOME / PUCK_V2 → false reverts each). Ratchet paid down to 147.
- **DAVID's ONE move:** hard-refresh `/alter/fresh.html`; open the app at different states (idle, mid-block, a gap) → home should ALWAYS look like home now. Then watch the bottom-left puck while starting/pausing a block: does the disc take the activity's color? Report.
- **CLAUDE's ONE move:** on David's puck verdict → confirm/fix the color-shift trigger; then bento redesign (mockups-first) + swipe-axis nav pass.

---

## STATUS UPDATE (2026-07-21 LATEST, Fable-orchestrated swarm): THE REDESIGN IS LIVE — v1183
David was right that v1182 under-delivered (paint, not furniture; nav untouched). Fixed with a 3-parcel swarm (2 Opus + 1 sonnet, worktrees), integrated + SCREENSHOT-VERIFIED state by state, shipped v1183 (e71e6ec):
- **COMPASS ROSE v1 LIVE (`NAV_V2=true`, flip false = old bar back):** the 4-tab bar is GONE app-wide. Guardian puck bottom-left (52px, pink home disc) = home from anywhere (verified tap). Home doors: story strip = the planner door (+chevron, verified tap→planner), journey glyph top-left, garden glyph top-right, gear → guardian-mark avatar by the gems. Dock gets left clearance so the puck reads as its cap. Swipe-axis travel = next pass (tap version live).
- **TRACKING FACE DECLUTTERED (the "thousand buttons" fix):** now bars · dial · title pill · one meta line · next-up · big pink Stop · one quiet Break+extend row = 5 interactive elements, 2 tiers. Regulation chips + the docked extend sheet are OFF this face (sheet auto-surfaces only when the block ends ≤5 min). Screenshot: reads as a sibling of the home face.
- **PLANNER BLOCKS 2x (`MINFLOOR` 44→100):** blocks now read like David's reference (agent caught the real prior value was 44, not 50/30; honored the 2x intent). THE knob if device feel is off.
- **Known collisions logged for the next pass:** welcome-back card overlaps the claim CTA; home door glyphs crowd the story pills; the bento picker confirmed ugly/intimidating on camera (redesign owed, mockups-first); two-lane double label still open (D3).
- **DAVID's ONE move:** hard-refresh `/alter/fresh.html` → look at home (no bar, doors), start a block (the clean tracking face), open the planner (big blocks), tap the puck. Report feel; NAV_V2=false is the instant revert if navigation misbehaves on device.
- **CLAUDE's ONE move:** on David's verdict → fix the two logged collisions + bento mockups; then the swipe-axis pass.

---

## STATUS UPDATE (2026-07-21 latest, Opus): FOUNDATION RESKIN F1–F4 SHIPPED (v1182) — home is a sibling in every face
Ran the foundation reskin. Every `#trackerFull` face now speaks the approved idle-home dial language, **screenshot-verified state-by-state in preview** (LOOK is preview-provable; the spec's F1–F4 are pure skin so they ship live). Shipped v1182:
- **F1 tracking (st-onplan/st-off):** loud striped disc → **flat vivid activity disc + white icon**; solid dark-plum **floating bezel** + the green stopwatch arc; friendly **Baloo switch-pill**; **Stop → pink** (commit color per the color law, was green — *flag for David's device verdict: pink has meant "play/go" elsewhere*); off-plan empty dial = **solid plum bezel** (was a dashed ring); drift Replan → solid (was striped). Also killed a latent race (off-plan resets the ring via `setRing(0,instant)` so the on-plan fill rAF can't repaint a ghost green arc).
- **F2 claim + night:** flat vivid welcome-back disc in a plum bezel; calm solid deep-violet moon disc in the breathing nightlight ring.
- **F3 break:** flat gold pause disc; hid the Soul-Force + continuity line that overflowed behind the dial.
- **F4 guided-stage corner puck:** flat activity disc (was striped).
- `setRing` unfilled track darkened `#3a2540`→`#2a1832` to match the home bezel. No SCHEMA change; ratchets pass (no new innerHTML wipe). Home idle face confirmed unchanged.
- **DAVID's ONE move:** open `/alter/fresh.html` on the phone, run a real block through tracking → pause → welcome-back, and rule on the look (esp. **pink Stop** — keep or revert to green?). Gesture feel unchanged this pass.
- **CLAUDE's ONE move:** on David's ok, take F5 (compass-rose nav) as its own session per the spec (biggest slice; LOOK ships live, swipe arbitration behind `NAV_V2`); F6 planner paint after.

---

## STATUS UPDATE (2026-07-21, Opus): DAVID REPRIORITIZED → FOUNDATION RESKIN IS P0 (marathon paused)
Shipped this run: v1174 one-tap pause · v1175 wave-1 (drag-fix DRAG_V2 / cockpit-landing LAND_V2 / reward-collision / header / dock+chip) · v1176 wave-2 (transitions TRANS_V2 dark / real emoji sweep). Then David interrupted: **redesign the FOUNDATION first** — home must look new-era in EVERY state ("I never wanna see that old ugly cockpit"), then nav, then planner paint, so what he tests is a coherent pretty app. Outranks B1/toolbox/journey. Root mapped: `#trackerFull` = 6 faces; only `st-idle.tf-home` is new-era; `st-onplan`/`st-off` (tracking) + `st-claim` + `st-night` fall back to the OLD `.tf-ring` cockpit = the ugliness. Bento "plan your day" sheet also flagged for redesign (mockups-first, not a swarm).
- **Spec LOCKED, execution-ready:** `_specs/_newera-build/FOUNDATION-RESKIN-2026-07-21.md` — F1 tracking-face→new-era → F2 claim+night → F3 break polish → F4 stage faces → F5 compass-rose nav → F6 planner paint. Each state SCREENSHOT-VERIFIED before ship (LOOK is preview-provable; swipe FEEL device-gated). Includes exact "how to force each state in preview."
- **Operator call (budget):** this run spent big (6 agents, 3 ships). The reskin is coherence-critical visual work; rushing it = the half-baked result David hates. Runs as the FIRST + WHOLE thing in a FRESH full-budget session, screenshot-verified.
- **In flight:** the W4 planner-safe agent (zoom clamp / sticky labels) was still running at the pause — integrate its branch before/at the reskin session.
- **DAVID's ONE move:** fresh session, `/model claude-opus-4-8` effort HIGH, say "run the foundation reskin".
- **CLAUDE's ONE move:** execute FOUNDATION-RESKIN F1 — reskin the tracking face to the home-face language, screenshot st-onplan + st-off proving they're siblings of home, then F2-F4, ship the coherent foundation.

---

## STATUS UPDATE (2026-07-21 latest, Fable): SWARM PROTOCOL + WAVE 1 READY (no code touched)
David ruled: parallelize with agent swarms + batch feedback instead of slice-ship-verdict. Protocol + WAVE 1 parcel specs written: **`_specs/_newera-build/SWARM-PROTOCOL-2026-07-21.md`** (Fable plans waves · Opus orchestrates/integrates · worktree agent per disjoint region · one ship per wave · one 10-min David checklist · bisectable commits + kill-switch flags · ≤1 SCHEMA parcel per wave). Logged in DECISIONS.md. **Wave 1 parcels:** A landing-contract/cockpit-comeback (Opus), B drag-owns-DOM (Opus), C broom incl. the ~8636 emoji map (sonnet), D copy+RU (haiku), E batch checklist (haiku); integrate A→B→C, one push. Cross-cutting work stays SOLO in later waves (2: transitions, 3: compass rose, 4: toolbox, 5: planner river).
- **DAVID's ONE move:** switch to `/model claude-opus-4-8` and say "run wave 1". (Pause fix v1174 is already live to try meanwhile.)
- **CLAUDE's ONE move (Opus):** execute wave 1 per the protocol; ship once; hand fresh.html + the checklist.

---

## STATUS UPDATE (2026-07-21 night, Fable): MARATHON MODE ADDED TO THE SWARM PROTOCOL
David: chain waves autonomously, he reviews at his own pace. Added to `SWARM-PROTOCOL-2026-07-21.md`: **MARATHON MODE** — waves chain without batch-verdict gates (agent completions auto-wake the orchestrator; no /loop needed, ScheduleWakeup only as hang-safety). Three stop walls: David-only decisions · budget guard (never wake to zero) · unfixable gate failure. Radical-change contract: structural = kill-switch; surface-replacing (compass rose) ships DARK (`NAV_V2=false`, David flips to preview); SCHEMA work EXCLUDED from autonomy. Queue: W2 transitions(TRANS_V2)+real-emoji-sweep → W3 nav dark → W4 planner-safe (zoom clamp/re-anchor/sticky labels) → W5 decision artifacts (toolbox + battery mockups, B1 copy tournament) → stop. One consolidated checklist accumulates in the handoff for David's whenever-review.
- **DAVID's ONE move:** `/model claude-opus-4-8`, effort HIGH, say "run the marathon" — then test v1175's wave-1 checklist whenever suits; the batch leads the next marathon.
- **CLAUDE's ONE move (Opus):** execute the marathon queue per protocol; ship each green wave; end with the consolidated checklist + the two mockup decision cards.

---

## STATUS UPDATE (2026-07-21, Opus): WAVE 1 SHIPPED v1175 (first parallel swarm)
First swarm wave: 3 parcels built in parallel worktrees (2 Opus + 1 sonnet), integrated serially A→B→C (clean auto-merge, disjoint regions), one ship. Commits 4deb965 (A) · 91e7a94 (B) · 53443f0 (C) · 6cf19de (v1175 bump). Integrated tree preview-verified: boots clean, pause intact, zero console errors.
- **A — landing contract (LAND_V2 kill-switch):** a flow launched from the home tool-grid now RE-OPENS home on close (openHomeInstant) instead of falling to panes / resurfacing the old cockpit. Armed only at the home launch, cleared on every close path (bare player finish, runStack .bw-x, stackComplete Done), disarmed by "Make it yours". Also A4 (celebrate +N/streak moved to a reserved upper band, no title/next occlusion) + A6 (header width budget).
- **B — gesture-owns-the-DOM drag (DRAG_V2 kill-switch):** root cause of the A1 scramble found — the per-minute + per-second rebuilds guarded on `.calblk.dragging` which is only set AFTER arm, so a clock tick in the pointerdown→arm window rebuilt the day list and destroyed the held card. New `_dragLock` latch set the instant a drag/resize arms; `dragBusy()` (superset of the old guard) gates tickCharge + the master rebuild; one commit render on release. +15/-10, @SEC:TIMELINE only.
- **C — broom:** the `blockEmoji` emoji map → Tabler icons via the existing tiIcon path (NOTE: blockEmoji is DEAD CODE, 0 callers — the emoji David sees is a SEPARATE surface: EMOJI_KW ~5834, CATS/OCCUPATIONS `t.e` fields ~411, VIBES — a cross-cutting emoji sweep owed as its own wave). Real wins: dock bottom-clearance (A7) + create-sheet chip edge-fade (A11).
- **DEVICE-UNTESTED (batch verdict owed):** the drag feel (does the scramble stop?), the landing feel (does closing a tool from home land on home cleanly?), the celebrate reposition (eyeball a journey-node completion too — cele-ov is global). Kill-switches if wrong: `DRAG_V2=false` (app.js ~3116), `LAND_V2=false` (app.js ~3527).
- **DAVID's ONE move:** open /fresh.html, run the 6-item wave-1 checklist (below in chat), send ONE batch of feedback.
- **CLAUDE's ONE move (next Opus):** on the batch → wave 2 = the transition-grammar sweep (solo), leading with any wave-1 fixes; the real emoji sweep folds in as a parcel.

---

## STATUS UPDATE (2026-07-21, Opus): R1 STARTED — ONE-TAP PAUSE SHIPPED v1174
First R1 slice shipped + preview-verified. **One-tap pause:** pressing pause on a tracked activity no longer opens a "how long?" duration sheet or drops a future rest block; it holds the goal open-ended (`S.brk.mins:0`) and resumes on tap. `trackerState` (3638) + the break face (3751) render an open pause as "Paused" counting UP; timed breaks (via Replan/planBreak) still count down + expire ("On a break" 11:59 → "Break's up") — regression-checked all 3 states in preview via DEV.cockpit, zero console errors. Commit 3b9ce7c.
- **STILL OPEN in R1 (each its own device-tested Opus session, per the prediction ledger — preview can't verify gesture feel):** (a) the transition-grammar sweep (crossfades→slides), (b) gesture-owns-the-DOM drag rewrite (the 316-324s scramble), (c) the landing contract / cockpit-comeback (the `leaveHomeForPlayer` teardown + every close path — this is the deepest one, needs the full landing-path hunt).
- **EVIDENCE NEEDED from David for the "cockpit came back / emoji / numbers" complaint:** one screenshot of the exact screen. STRONG LEAD found while exploring: a real-emoji activity map at **app.js:8636** (`[["bed","🛏️"],["breakfast","🍳"]…]`) violates the Tabler-only law and may be "the emoji still" — but I won't guess-fix a regression-zone render without confirming it's the screen he means. That's the R2 broom's first target once confirmed.
- **DAVID's ONE move:** open `/fresh.html`, start any activity, hit pause — confirm it just pauses (no time prompt); then send ONE screenshot of the ugly cockpit-comeback screen.
- **CLAUDE's ONE move (next Opus):** on the screenshot, R2 broom (emoji + numbers + collisions, evidence-based); else the R1 landing-contract session.

---

## STATUS UPDATE (2026-07-21 latest, Fable): REDESIGN-FIRST ORDER + R-TRACK SPEC FINAL
David's verdicts, end of day: **(1) mom terms = NONE** (family money; LEDGER + DECISIONS updated; standup stops asking). **(2) founding-offer verdict = PARKED to the B4 session** (decided on the real page). **(3) ORDER FLIPPED: redesign first, B1 after** ("tired of the app looking like it's designed by twenty people"). **(4) new grievances logged:** the OLD COCKPIT resurfaces after flows (the leaveHomeForPlayer/Z-2 landing class, David saw it live), the emoji dev pill + stray counters still visible, and PAUSE FORCES A TIME CHOICE (must be one-tap pause, ask nothing).
**The execution plan is `_specs/_newera-build/REDESIGN-BUILD-2026-07-21.md`:** R1 physics (transitions + landing contract + gesture-owns-DOM + one-tap pause, Opus HIGH) → R2 broom (collisions + legacy chrome sweep, Opus LOW) → R3 compass rose (Opus HIGH) → R4 toolbox (mockups LOW, build HIGH) → R5 planner feel (battery grammar + river + zoom, Opus HIGH) → then B1, B4 (founding decisions there), B3, B9-lite; D4 paint interleaves. Includes the 12-item PREDICTION LEDGER (what Opus gets wrong: single-owner scroll state machine, preview-lies, wipe ratchet, old-era tokens, overlay landmine, cockpit landing paths, SCHEMA traps, iOS touch-action, copy gates). Device verdict between each R gates the next.
- **DAVID's ONE move:** switch to `/model claude-opus-4-8`, effort HIGH, say "run R1".
- **CLAUDE's ONE move (Opus):** execute R1 from the spec, ship, hand the fresh link, label feel DEVICE-UNTESTED.

---

## STATUS UPDATE (2026-07-21 night, Fable): PLAN-REALITY LAW LOCKED (no code touched)
David locked the planner's divergence model: **"reality fills, intention flows."** One-tap tracking, never a forced replan · past = lived reality only, one lane, battery grammar (late head / unfilled top / spill / empty frame) · displaced or unlived plans auto-flow to later-today, else the PM-close carry basin (toast + undo, future-side only, contract #2 intact) · every planned/lived pair logged; the nuance surfaces in the close + per-activity stats + B2 pattern talk, never on the timeline. Written into DECISIONS.md, DESIGN-STUDIO §5.4 + D3, BUILD-ORDER B1 note; memory `alter-plan-reality-law`. D3 now only verdicts the past-block visual grammar; the river mechanic = its own D3 regression-zone slice. B1 unchanged and still next on Opus.

---

## STATUS UPDATE (2026-07-21, verdicts in): ALL 5 DESIGN PICKS RULED (no code touched)
David verdicted the design-studio picks on the compass-rose mockup: **(1) compass rose = YES** (kill the tab bar, build the world-nav); **(2) puck = the shape-shifter** (home / mini-player / live dial in one); **(3) settings = avatar on home's status row by the gems**; **(4) battery fill = YES** for future+now — but he's still weighing a plan-vs-reality split in the PAST for nuanced habit tracking, "easy to use" being the constraint (resolution direction logged: the battery IS the record, one object, verdict at the D3 planner build with a mockup); **(5) slip rule REVERSED — BEAUTY IS A LAUNCH GATE.** No deferring polish; the app ships beautiful AND functional or the date flexes. Reformed rule: feature BREADTH slides to founder-updates first, then the date 1-2 wks, never the beauty/core. All five in DECISIONS.md; launch bar updated (MASTER-GAMEPLAN §3B item 9 + DESIGN-STUDIO §4/§5). **Consequence to hold:** launch MVP gets NARROWER (fewer surfaces), not uglier; the B-track's deferral list may grow so the D-track lands whole. **CLAUDE next (Opus):** B1, then D0 physics same week; mockups for D1/D2 rendered in chat before their builds.

---

## STATUS UPDATE (2026-07-21 latest, Fable): JOURNEY OS + ALGORITHM ENGINE SPECED (no code touched)
David voice-noted his own smoke-trigger report (urge vs pure cue: the rolled joint in the ashtray; hypothesis: under-breathing is a real trigger; wants breathe-instead if-thens, rewarded never punished) + asked to reconsider the 300-day course, fix the typing course section, expand journey days 2-N, add quarterly goal planning (his friend's therapist worksheet attached), alternate journeys, Wario-style lesson reps. **Everything in `_specs/JOURNEY-OS-2026-07-21.md`.** Findings: the course reconsideration already existed (`_course/` map + audit + 82-bead engine-v1.json + ALTER-APPLICATION theory) and the adaptive spine is BUILT (lesson ritual grammar, 8-landmark trail, appetite dial, blueprint personas); the four genuinely missing systems are now speced: (1) CATCH + ALGORITHM ENGINE (Module V made real over the empty S.alg shell; seed case = David's smoking, saved to memory `david-smoke-triggers-report`), (2) GOAL LOOM (quarter→month→goal→setup/system steps→planner blocks, from the therapist PDF × Johnson × existing S.goals; B6 architect = its paid interviewer), (3) LESSONS 2.0 (de-type WS_REG per the audit's own no-free-text law; Wario micro-reps leashed to DO/CHECK beats; "Warrior" in David's note = Wario, transcript-confirmed), (4) DAY COMPOSER + THREADS (one glowing stone daily; alternate journeys = bead pools + weights, never a second map). Launch sequence untouched: this is the September founders stream; only A1-lite (catch card MVP) is a pre-freeze candidate in the slack slot. **4 picks owed by David (spec §6): A1-lite pre-freeze? · the name "Algorithm" vs Key/Move · loom/S.goals unify vs bridge · §2.4 free/paid line inside the Jul 26 founding-offer verdict.** Interim protocol for David TODAY, zero code: IF urge or rolled-one-in-sight, THEN guided breath ladder (v1126) first, then choose; park the joint out of sight.
- **DAVID's ONE move (unchanged + extended):** the 20-minute founder pass (v1151 regression on phone · terms A or B · founding-offer verdict) now including the 4 JOURNEY-OS picks (§6; pick 4 IS part of the founding-offer verdict).
- **CLAUDE's ONE move (next Opus session, unchanged):** ship B1 (PM close book-grade) per BUILD-ORDER; if David greenlights fork 1, A1-lite queues for the slack slot with its copy pre-gated on cheap models.

---

## STATUS UPDATE (2026-07-21 later, Fable): DESIGN-STUDIO AUDIT + BEAUTY GAMEPLAN (no code touched)
David recorded 6 min of the live app (v1173) and asked for a full design-studio pass + verdict on his kill-the-bottom-menu nav concept. Done: his video frame-audited (rig preserved at `_dev/video-audit/`, works without ffmpeg), full grievance ledger with timestamps + root causes, nav verdict, toolbox direction, and the phased design track. **Everything in `_specs/DESIGN-STUDIO-2026-07-21.md`.** Headlines: (1) the surfaces are 70-85% to vision; what kills the feel is BETWEEN them: whole-screen crossfades with two live DOMs, gestures racing wipe-rebuilds (the drag scramble is fully characterized on camera at 316-324s), and collision bugs (reward card covers the title, streak x4 prints over next-line); (2) NAV VERDICT = YES to David's concept, refined as THE COMPASS ROSE (home center, journey = sky above, tools = ground below, planner left, garden right, guardian PUCK bottom-left = home button + mini-player + live dial in one object, visible doors + peeks so mom finds things); (3) D-track phases D0 physics → D1 shell → D2 toolbox → D3 planner feel → D4 coat, merged into the launch calendar; the morning revision's slack is now spent, priority rule written. **5 picks owed by David (doc §5): compass-rose greenlight, puck fusion, settings placement, two-lane fold-in, slip rule.**

---

## STATUS UPDATE (2026-07-21, Fable): GAMEPLAN REVISED FOR SPEED (no code touched)
David asked to finish the app better and faster. Two findings: (1) the serial build order landed rails + founding page mid-August, AFTER soft launch opens Aug 9, breaking sell-before-finishing and muting tripwire #2; (2) the seed lane (content, Reddit warming, WTP round) was at zero and is the only non-compressible lane. Revision written in place: `MASTER-GAMEPLAN` (REVISION 2026-07-21: §3A launch-critical cut, §3B eight-item launch bar, §6 week map) + `BUILD-ORDER.md` (order now B1 → B4 → B3 → B9-lite/P-A → Aug 8 freeze; B2-full/B5/B6/B7/B8/P-B/P-C = founders-era Sep+, the weekly-founder-update story). Operating rules added: two lanes one-WIP-each, cheap-model copy pre-gating before every Opus session, Aug 8 structural freeze.
- **PENDING DAVID (dated):** founding-offer scope in ONE verdict (free/paid split + does the page promise the AI architect "arrives September") needed by Jul 26 · terms A/B + first mom report this week · WTP greenlight for Jul 26-Aug 1.
- **DAVID's ONE move:** the 20-minute founder pass: v1151 regression check on the phone, terms A or B, founding-offer verdict. Then start Reddit warming + Apple enrollment.
- **CLAUDE's ONE move (next session, OPUS):** ship B1 in one pass: cheap-model copy tournament through both gates at session start, then wire per the BUILD-ORDER spec, preview-verify both seeded days, preship, ship.

---

## STATUS UPDATE (2026-07-20, Opus): PLANNER FLOW-MAP SHIPPED v1151 — DEVICE-UNTESTED
The minimum-size planner (David's locked 2026-07-20 canon: Gym / Lunch / Claude code NOW / Read mockup) is BUILT and shipped to main (`dc366d1`, v1151). This was the dedicated regression-zone rebuild — the timeline geometry now runs on ONE shared **flow map** instead of raw exact-time-Y.
- **What changed (app.js):** new `computeFlow(k,HP)` = pure monotonic time→Y knot list. Every plan block flows ≥ `MINFLOOR` (50px) → tiny activities are always a readable, draggable card; when a short block's floor exceeds its slot, later blocks **push down** and the hour ruler stretches. Helpers `flowY`/`flowInv`/`flowSpan`/`flowH`. **The min-height floor lives ONLY in computeFlow** — every top = `flowY(mn)`, every height = `flowSpan`/`flowH`.
- **The coupling that broke the 3 prior rebuilds is closed:** all THREE independent time→Y paths now rebuild the IDENTICAL map so nothing desyncs — `calendarView` (render), `tickCharge` (per-second creep/grow), `relayoutHourPx` (pinch-zoom, recomputes at the live HP). Map stashed on `cal.dataset.flow`; `timeFromY` got the flow inverse for tap-create + cross-day drop. No SCHEMA bump, no new innerHTML wipe sites (ratchet passed).
- **Preview PROVED:** boots clean, renders, flow map verified exact on seeded data (floor + push-down + no whole-block overlap; partial-remainders & short real logs correctly keep true sub-height), ZERO console errors, preship 26/26 logic invariants pass.
- **DEVICE-UNTESTED (the honest report):** scroll-into-prev/next-day feel, drag-move/resize feel, pinch-zoom anchor feel, and per-second charge creep smoothness on the stretched axis are NOT provable in preview. **Re-check the regression contract on the phone:** (1) continuous vertical scroll across days, (2) started/past set-in-stone & future can't cross the now-line, (3) tap-empty-creates / drag-moves / tap-bubble-edits, (4) week-strip + Now pill track the centered day.
- **Known follow-ups if the feel is off:** MINFLOOR=50 is a first value (tune 46–54). Zoom **scroll-anchor** math (`relayoutHourPx`/`animateHourPx`) was left proportional (approximate on the nonlinear MIN_H axis) — node POSITIONS flow correctly, only the post-zoom scroll offset may drift a few px; fix by inverting through the flow map if David feels it. Two-lane PLAN|REAL still lives on the (now stretched) axis — the "does two-lane die or fold in" decision (spec §3) is still OPEN and untouched by this slice.
- **DAVID's ONE move:** open v1151 on your phone, run the 4-item regression contract + the minimum-size feel; verdict MINFLOOR height + whether two-lane stays.
- **CLAUDE's ONE move next session:** on David's device verdict — tune MINFLOOR / fix zoom-anchor if flagged, else resume BUILD-ORDER (B1 PM close book-grade). Spec + concrete flow-map architecture captured in `_specs/_newera-build/planner-BUILD.md`.

---

## STATUS UPDATE (2026-07-19, later Opus session): BOTH QUEUED TASKS DONE
- **TASK 1 (investor deck v2) DONE:** `_pitch/investor.pdf` re-rastered (28pp), growth-round rework applied (07 pivot + ASK, 18 growth allocation, 21-25 growth tranches, 20 elevated to thesis). Mom deck untouched. Still owed by David: real terms numbers (slide 27) + tranche-amount decision. Detail in [[alter-mom-investor-pitch]].
- **TASK 2 (mine 15 books + master gameplan) DONE:** all 15 mind+psy briefs written (`_books/{mind,psy}/briefs/`), all 32 books folded into `_specs/MASTER-GAMEPLAN-2026-07.md` (the active forward roadmap; NEXT SESSION = build B1, the PM close, to book-grade spec). Detail in [[alter-master-gameplan]] + [[alter-book-mining-canon]].
- Open decisions (§4 below) still stand; consolidated + deduped in the gameplan PART 7.
- **ALTER-OS built (2026-07-19, Opus):** the cofounder/operator layer per `_specs/COFOUNDER-OS-2026-07-19.md`. Files: `COFOUNDER.md` (imported by CLAUDE.md), `LEDGER.md`, `TRIPWIRES.md`, `DECISIONS.md`, `_specs/LAUNCH-STATE.md` (at G0), and 3 commands `.claude/commands/{standup,report,launch-gates}.md`. NOT committed (per commit-only-when-asked + specs-stay-local convention). **Run `/standup` at every session start.**
- **BUILD QUEUES RECONCILED (2026-07-19):** `_specs/_newera-build/BUILD-ORDER.md`. Home (H-A/B/C) already shipped v1134-1136. Order now: **(1) B1 PM close book-grade + new-era-native** (spec IS in BUILD-ORDER.md, ready to one-shot) → (2) planner P-A block skins → (3) B2 guardian engine → (4) planner P-B/P-C → first-day/rails/launch. No PM-close/new-era conflict (different surfaces); the one dependency = B1 must be built new-era-skinned. **CLAUDE's ONE move next session = execute B1 from BUILD-ORDER.md.**
- **MOM INVESTED $1,000 (2026-07-19) = FLAME tier, build-funder role.** Launch now funded end-to-end. David starts Apple Individual enrollment ($99, SSN) immediately — account is optionality; the wrap build stays gated (masterplan §2 triggers), launch stays PWA+Stripe late Aug. Ad $150 stays signal-gated. Owed: terms sentence with mom (A or B), weekly numbers report starting now, spend ledger. Full allocation in [[alter-mom-investor-pitch]].
- **ADDENDUM (same day, Fable):** David caught that the mind+psy shelves never got their Fable synthesis layer (the routing rule in §0). Now written: `_specs/BOOKS-MIND-PSY-CANON-2026-07-19.md` = 10 convergent laws, 8 TENSION RESOLUTIONS (several briefs' moves contradict; the rulings are binding, esp. T2 register split: suggestion craft only inside sessions, MI grammar everywhere conversational), the unified guided-session grammar (= the B7 voice spec), a refused table, and PART 5 patches to the master gameplan (B1/B2/B8 spec deltas + copy-audit additions). Build order unchanged: B1 PM close next, on Opus, with the patches. 4 new small open decisions in canon PART 6.

---

## 0. MODEL ROUTING FOR THE QUEUED WORK (read first)
- **Book mining** = cheap models via ONE `Workflow` (haiku for narrative books, sonnet for dense/framework books). Do NOT mine on Opus/Fable.
- **Cross-book synthesis / new master gameplan** = Fable (thinking), or Opus. It reads the briefs, writes the plan. No building.
- **Deck building (investor v2)** = OPUS only (edit `_pitch/investor.html`, raster-render). Never build on Fable.
- The raster PDF pipeline + its gotchas are in [[alter-mom-investor-pitch]] memory (full-bleed 431px/1280px pin, min-width:0 on flex, non-breaking money, per-slide `?only=N` screenshot → Pillow). Reuse verbatim.

---

## 1. STATE: WHAT EXISTS NOW (do not rebuild)
**Decks (in `_pitch/`, gitignored, never commit):**
- `mama.pdf` — Russian, PORTRAIT (phone-swipe), **25 pages** (finale removed 2026-07-19; ends on the risks/edges slide). Source `mama.html`. David: "good."
- `investor.pdf` — English, **16:9 WIDESCREEN, 28 pages** (title-rail-left + content-right; tier slides = price block left + 2x2 detail grid right). Source `investor.html`. David: liked the wide format.
- Both share one CSS system (berry-night, colorful game-piece icon chips, big-bold-bright type). Raster-built (per-slide PNG → Pillow) so they render identically on mobile.

**Specs:** `_specs/INVESTOR-PITCH-MOM-2026-07-18.md` = the V5 MASTER SPEC (all 26 mom slides, research numbers with source names + confidence flags, the free/paid reframe, the funnel-math scenarios). The investor EN deck was derived from it. `_specs/FOUNDATION-PITCH-2026-07-11.md` = the LOCKED product language (positioning line, Duolingo analogy, "system that never existed", the genius/soul framing) — the source of truth for slides 2-6 of both decks.

**Book canon (this session, 17 books mined):**
- `_books/business/` (10 books) → briefs in `_books/business/briefs/` → synthesis `_specs/BOOKS-BUSINESS-CANON-2026-07-18.md` (12 convergent laws + refused-techniques table).
- `_books/dev/` (7 books) → briefs `_books/dev/briefs/` → synthesis `_specs/BOOKS-DEV-CANON-2026-07-18.md` (8 laws: 100ms feedback gate, teach-by-doing, miss-states crafted like win-states, never price the relationship, retention=next-narrow-skill, QA≠usability≠playtest, etc.).
- Machine + gotchas documented in [[alter-book-mining-canon]] memory. `_books/` is gitignored.

**Research done today (cite source names, in `_specs/INVESTOR-PITCH-MOM-2026-07-18.md` PART 2):** Grand View ($8.9B→$17.5B), CDC (15.5M ADHD adults), Sensor Tower (Jan 2025 = $385M record), RevenueCat 2026 (Health&Fitness = highest-converting category, 2.9% median/6.2%+ top-quartile), Duolingo SEC (9% pay), Finch ($30M cosmetics-only, scales paid Meta/TikTok ads), lifetime-price rule (~15x monthly validates $49-99 ladder), Calm 70% women avg 32.

---

## 2. TASK 1 — INVESTOR DECK v2: "MOM ALREADY FUNDED THE BUILD" (OPUS build)
**The shift (David 2026-07-19):** assume founder/family capital ALREADY funded the product + launch. The investor raise is NOT for building or Claude subscription. It is purely **growth capital: ads, creative production, and scaling the proven engine.** This is a stronger, more professional, more de-risked story (product exists, launch funded, ask = pour fuel on a proven channel).

**Edit `_pitch/investor.html` (the 16:9 EN deck). Concrete changes:**
1. **Reframe the narrative up front.** Traction slide (07) becomes the pivot: "Built and launched on founder capital. Working product, [founding members / early revenue], proven organic content." Add a one-line ASK somewhere early: "Raising to SCALE customer acquisition, not to build." The product/genius/market/model/scenario slides mostly stay (they establish the opportunity), but the money story changes.
2. **KILL the build-cost framing.** Slide 18 "Where money goes" currently lists Claude $200/voice $22/domain/Apple — DELETE that. Replace with a **GROWTH ALLOCATION**: paid ad budget (Meta/Google), video production at scale, creative testing/iteration, and the marketing tooling. No mention of paying for Claude/dev tools as the investor's money.
3. **Rebuild the tiers (21-25) as GROWTH TRANCHES, not "buys Claude months".** Each tier = an ad+creative investment with a projected outcome tied to the scenarios: "$X → Y monthly ad spend + Z videos/month → ~N installs at CAC ~$43 → projected revenue/run-rate." Keep the Spark→Dawn ladder shape (or David may bump amounts up for real investors — flag it), but every "Buys/Delivers/Speed/What it changes" block is about ACQUISITION and GROWTH, not building. The recommended tier is where paid acquisition first pays back at scale.
4. **Elevate the two marketing slides (Content Machine 19, Viral→Paid 20)** — these are now the core of the investment thesis. Consider expanding the paid-acquisition math (CAC $43 vs LTV: founding $49-99 + subscription ~$1,100 per 1,000 free users; show the payback logic clearly).
5. **Keep:** cover, product/genius (2-6), problem/market/who/players (8-11), free/paid model (12-14), doors (15), scenarios (16), calendar (17), risks (26), terms (27), contact (28). The terms slide (return-first/revenue-share/equity) is investor-correct as-is — David still owes the actual multiple / % / equity thresholds (OPEN).
6. **Tone up:** slightly more institutional. Less "founder scraping by," more "de-risked product, capital-efficient growth." Register stays premium-honest (no hype, no em/en-dashes, no "!").
7. **Rebuild the raster PDF** exactly as before: loop `?only=N` screenshots at window 1280x720 scale 1.5 → Pillow → `investor.pdf`. Verify cover + a tier + a growth slide via Read on the PNGs.

**Do NOT touch `mama.pdf`** — the mom deck keeps its build-funding story (she IS the build funder). Only the INVESTOR deck changes.

---

## 3. TASK 2 — MINE REMAINING 15 BOOKS + NEW MASTER GAMEPLAN
**15 books are STAGED but NOT yet mined** (I copied them to `_src/` late in the session, before chunking):
- `_books/mind/_src/` (5, the hypno/ritual shelf): Trancework (Yapko), The Science of Self-Hypnosis (Eason), The Expectation Effect (Robson), Ritual (Xygalatas), Breaking the Habit of Being Yourself (Dispenza — mine the PROTOCOL, flag/refuse the quantum-woo).
- `_books/psy/_src/` (10, the "dev books meat"/self-help shelf): Motivational Interviewing (Miller — clinical PDF), Self-Compassion (Neff), Why We Do What We Do / SDT (Deci — PDF), The Happiness Trap (Harris/ACT), Opening Up by Writing It Down (Pennebaker), The Coaching Habit (Bungay Stanier), Tiny Habits (Fogg), How to ADHD (McCabe), Make It Stick, The War of Art (Pressfield).

**Step A — mine them (cheap Workflow):** recreate the prep script (scratchpad is gone; logic is in [[alter-book-mining-canon]]: EPUB via zipfile+HTMLParser spine order, PDF via pypdf, check text layer, chunk ~140k chars, manifest). Check the 2 PDFs (Motivational Interviewing, Deci) for a text layer first. Then run the map-reduce `Workflow` with SHELF-SPECIFIC extraction capsules:
  - **mind capsule** → aim at the guardian's guided-audio voice, the Rewire/Visualisation tools, the charge/intention primitive, AM/PM ritual science, expectation/placebo as the honest bridge for the "magic" layer. Yapko = suggestion craft; Eason = teach the USER self-hypnosis (= the Rewire tool); Robson/Xygalatas = the science page + ritual bookends; Dispenza = protocol only.
  - **psy capsule** → aim at the guardian's CONVERSATIONAL psychology (Miller MI = the guardian's law-book; Bungay Stanier = question pools), the PM close (Pennebaker expressive writing), the never-punish science (Neff self-compassion = weaponize the moat claim), white-hat motivation theory (Deci SDT pairs with Octalysis), ACT tools (Harris = new tool scripts), the ADHD audience lens (McCabe = protect copy from shaming our core user), habit celebration (Fogg), lesson resurfacing (Make It Stick), founder-fuel + resistance content (Pressfield).
  - Each brief ends with "TOP 10 MOVES FOR ALTER". Write to `_books/{mind,psy}/briefs/`.

**Step B — the NEW MASTER GAMEPLAN (Fable synthesis, the "don't waste progress" ask):** write ONE doc `_specs/MASTER-GAMEPLAN-2026-07.md` that integrates EVERYTHING developed today into a single forward roadmap:
  - All 32 books' TOP MOVES (business 10 + dev 7 + mind 5 + psy 10), deduped and ranked, folded into the existing law-set (don't re-list; synthesize into decisions).
  - Today's product decisions: the locked positioning + genius framing (FOUNDATION-PITCH), the free/paid reframe (voice FREE, **AI goal-architect = the paid magnet**), the three-doors monetization + funnel-math scenarios, the honest-gamification laws (charge=coin, never price the relationship, miss-states crafted), the marketing system (Field Guide YouTube + Higgsfield + viral-proves-then-paid-scales), the raster-deck pipeline.
  - Output = a prioritized BUILD + BUSINESS roadmap to launch (late August) and beyond: what to build next in the app (the AI goal-architect is now the #1 paid feature and needs accounts+backend spec; the PM-close/streak/journey per the dev canon; first-day polish), what to write (guided-audio scripts using the mind/psy craft), what to ship for launch, and the marketing cadence. Cross-reference the two existing canons rather than repeating them.
  - Keep it a ROADMAP, not a 17th planning doc that re-derives — it consolidates and points.

---

## 4. OPEN DECISIONS FOR DAVID (carry forward)
1. **Investor terms numbers** (slide 27): the actual return multiple, revenue-share %, and equity thresholds are still David's PROPOSAL placeholders — he owes real numbers.
2. **Investor tier amounts**: keep $500-$10k as growth tranches, or raise the ladder for professional investors?
3. **Free/paid split** (voice free, AI-architect paid) is a proposal — confirm before it's load-bearing in the master gameplan.
4. **AI goal-architect build**: it's now the primary paid feature. Needs its own spec (accounts via Supabase, Cloudflare Workers proxy so the key never ships in client JS, Stripe billing, Haiku economics ~$0.20-0.40/user/mo — all in [[alter-mom-investor-pitch]]/[[alter-business-masterplan]]). Fund at the Lighthouse tier and above.
5. **Psy/mind shelf recommendations** already bought (staged). Any more books David wants before the master gameplan? (He can drop more folders; the machine is proven.)

---

## AUDIO/BREATH SESSION (2026-07-19, late Opus) — 3 ships, then a 4-item queue
Shipped v1125–v1126 off the tool/audio batch:
- **v1125 — Sound panel Guide's-voice toggle.** Narration on/off, separate from its volume (reuses `S.voice`, honored by `voiceOn()`/`say()`; `TTS.stop()` on flip-off). Closes the "pre-session audio settings" ask — separate voice/bg sliders + tap-to-preview beds already existed. Settings toggle, no gesture surface → fully verified.
- **v1126 — Guided breath ladder (science breathing stack).** New first chip in `breathPicker` runs ONE continuous session easing a beginner easy→deep: resonance → box → 4-7-8, 3 cyc each (~2.5 min). Mechanism: generalized `breathwork()` to drive a pattern-agnostic **`flow`** array (single pattern = one stage; ladder = concatenated stages) — the up-front cue scheduler, orb rAF clock, and sub-label all read `flow`, zero new engine. `BREATH_LADDER` const beside `BREATH_PATTERNS`. Copy passed Gate-1 + went 3 rounds with the Haiku Gate-2 judge (mechanism-first rewrite); **copy is judge-passed, David-unrated** — the ladder chip ("Learn the real ones" / "Guided, easy to deep" / vagal-brake body) needs his read. Verified in preview: picker renders chip first, launch throws nothing, sub-label advances "calming breath · 1 / 3". **Orb pace/feel across stage transitions = DEVICE-UNTESTED** (gesture/timing, per constitution).

- **v1127 — breath = one player (David's "combine it altogether" ask).** Three parts: (a) pre-start screen now PREVIEWS sounds on tap ("sound · tap to hear") via new `breathPreview()` — reuses the exact hit/sustain engines the session uses; (b) **Voice + Sound volume sliders** on the pre-start screen via new `breathVolRows()` (same master buses as the player's Sound panel); (c) the breath SESSION now wears the player frame — top **story-bars** (one per cycle, or per stage for the ladder, filling as you go, built from the `flow`/`cum` array) + a **settings cog** that opens live Voice/Sound volume mid-session. The v1124 smooth orb + wave viz + 10 sounds are UNCHANGED. Verified in preview: picker shows 2 vol sliders + tap-to-hear; sound-chip tap doesn't throw; ladder session renders 3 stage bars that fill progressively (22→37% on stage 1 while 2+3 stay empty); cog opens the volume popover (Voice+Sound+Done); no console errors. Screenshots captured. **Audio preview + orb pace = DEVICE-UNTESTED** (headless can't prove sound/gesture feel).

**ARCHITECTURE NOTE (why breath was NOT merged into `timelinePlayer` as one code path):** there are two player codebases — `timelinePlayer` (composed: story-bars/transport/cog/mini-player/orb-drive) and the separate `breathwork` overlay (where the v1124 smooth rAF orb, wave viz, and 10 breath sounds live). The code itself flags full unification as "deeper REBUILD work" (see the `.gp-mini` comment). v1127 unifies the *experience* (breath wears the same frame + shared settings surface) without risking the just-approved smooth orb on a blind overnight engine-merge. The literal single-engine merge (route breath THROUGH timelinePlayer via breath-segments — it already has the ORB DRIVE for `seg.breath`) is the next deliberate build; do it on a fresh Opus session with device testing, porting the wave viz + 10 sounds into timelinePlayer first.

## ★ PIVOT (2026-07-19, late): CORE REDESIGN BUILD COMES FIRST
Toolbox mockup rounds kept failing because the beautiful target (David's screenshots: What-now home + scanner planner) is the 07-19 design-marathon look, which is NOT built; sampling the live app returns the old era. Decision: build the redesigned HOME + PLANNER first; toolbox/breathing/builder inherit the language after. Build specs written (Fable): `_specs/_newera-build/home-BUILD.md` (slices H-A/H-B/H-C) + `_specs/_newera-build/planner-BUILD.md` (slices P-A/P-B/P-C, regression-zone rules inside). Skin canon: `_specs/STYLE-NEW-ERA.md` (verified hexes). Order: H-A → P-A → H-B → P-B/C → H-C → then toolbox (SPEC-ONE-BUILDER Part 1.5) + breathing + builder reskin. One slice per Opus session, device verdict between.

## ★ KEY FINDING (2026-07-19 Opus build session): THE REDESIGN WAS LARGELY ALREADY BUILT
Building the new-era slices revealed the FEATURES already exist and work: home state machine (`trackerState()` → idle/claim/night/onplan = S0-S3+), D/W/M views (`pullZoom`, `.scope-b`, zoom crossfade, whole-day week columns, month cells). What they lacked was the NEW-ERA SKIN — which is what David kept rejecting. So the "build everything" work = a coordinated skin pass, not new mechanisms. Shipped + VISUALLY CONFIRMED live (forced the timeline visible via preview_eval, screenshotted):
- **v1128 H-A** home: flat pink circle + faint bloom, bigger Baloo greeting, rounder context bars. (home idle face NOT screenshot-confirmed — seed lands in claim state; low-risk CSS.)
- **v1129 P-A** planner blocks: future = FLAT MATTE (stripes = lived time only), scanner glow riding the now-line. CONFIRMED on device-preview: lived blocks vivid stripes+gold ring, future flat matte (Make art/Focus/Project work), quiet outlined (Read) — matches David's reference screenshot.
- **v1130 P-B** D/W/M lettered segmented pill (replaced scope icons). CONFIRMED: day + week views render clean, switch with no errors; week = whole-day columns already new-era.
The planner now genuinely matches the target aesthetic (screenshots in chat). Home H-A is live but visually unconfirmed. Month view not re-checked (likely fine). NEXT: David device-verdict on v1130; then toolbox reskin (still blocked on his mockup pick — has verified plum-card language now) + home idle-face confirm + breathing/builder reskin.

## VOICE + HOME H-C (v1131-1134, 2026-07-19)
- **Dual ElevenLabs voice banks (v1131-1133):** David built Dave (`fFuZg4Dt9LbhpYrB9FUK`) + Millie (`X1haHuvIvfCqolpCbj5P`). Generator `_dev/gen-voice-11labs.py` (mirrors gen-voice.py extraction+djb2 so hashes match) writes per-voice banks `assets/voice/{dave,millie}/` (500 each) + own manifest. Key in `_dev/.env` (gitignored). TTS gender layer: picked bank layers over root (RU/un-regenerated still resolve, never silent); `bufCache` namespaced per bank; `setVoice` flips `gdir` SYNCHRONOUSLY (both banks share key set) so it applies to the next session with no async-fetch race. `fadeGain` (~18ms in/35ms out) on all 3 play paths kills the sharp cut-on. Picker: Settings→Sound→Guide (Dave/Millie), previews "Settle in" (a REAL bank line) but ONLY when no `.gp-ov` session is live (was talking over sessions). NO warmAll on switch (decoding 500 clips janked the app). ALL DEVICE-UNTESTED for audio feel.
- **Home H-C COMPLETE (v1134-1136):**
  - v1134 idle-home tools = static 2x4 grid (`.tf-toolgrid`) = 7 most-worn STACK_TOOLS + a "More" door → openToolbox (replaced the scroller+dots). Matches the What-now screenshot.
  - v1135 S4 ending-soon cue: on-plan block ≤5 min from ending (or over) glows the docked extend sheet (`#tfNextSheet.tns-ending`) + highlights its +15 chip (`.k-dur.hot`). PURE PAINT — the extend PATH (`tfExtendPlan`) + "extend?" copy already existed; no "keep going" (David rejected that 2026-07-03).
  - v1136 tracking-tool gate (David chose "add the row"): `renderTrackTools()` shows a compact `#tfQuickTools` row (Breathe/Settle/Wake-the-body) ONLY in the onplan/off tracking branch, hidden everywhere else; tap = `runStack` over the cockpit, timer keeps running. The spec §6 two-mode gate (short calming tools while tracking; deep tools stay on idle grid + toolbox). Targeted rebuild, no wipe.
  - S5 gap-return was already the existing `claim` state. All three verified boot-clean + CSS-resolves; the live idle face + ending-soon + tracking row are PREVIEW-UNCONFIRMED (state can't be forced headlessly) + DEVICE-UNTESTED.
  - NEXT new-era: David device-verdict on v1131-1136; then H-B home-state polish if the idle face needs it, month-view recheck, toolbox/breathing/builder reskin.

## ★ HOME=PLAYER GRAMMAR (2026-07-20, Fable gameplan)
David ruled the two-clock law: player = elastic session time (scrub/skip, orb, bottom transport); home tracker = rigid life time (NO transport; the big circle is a stopwatch DIAL, chunky dark bezel filling clockwise via the existing `setRing` conic; idle = dial at zero). Carousel on home while tracking = PEEK (never mutates; live dial shrinks to the corner puck), play-on-future-card = the one commit (finish current at real elapsed, then start next). Full spec + slices H-D1 (dial skin) / H-D2 (peek+commit) / H-D3 (seam) + 3 open questions: `_specs/_newera-build/HOME-PLAYER-GRAMMAR-2026-07-20.md`. Two idle-circle CSS experiments were tried in-session and REVERTED, tree clean. **NEXT build session (Opus): H-D1.** Note ordering vs BUILD-ORDER.md: B1 PM close was queued as next; David's live design ruling puts H-D1 (small, pure skin) ahead or beside it, his call.
**SHIPPED 2026-07-20 (Opus, v1137-1139):**
- **v1137 H-D1 — dial skin.** Idle circle = stopwatch dial at zero: solid chunky dark bezel (= the #3a2540 arc track) + flat pink disc + pink bloom, replacing the dashed ring. Confirmed in preview: idle bezel color == the green-arc track, so idle→tracking is one continuous object filling clockwise (screenshotted the on-plan dial). Home never shows the player orb.
- **v1138 H-D2 — commit-next (the tap half only).** While tracking, the `#tfNextUp` line gained a play button = `tfCommitNext` → `startNextNow`: finishes the current block at its REAL elapsed (honest log + block truncated to now), pulls the next block to now, tracks it on-plan. VERIFIED in preview with a seeded live day: Deep work logged 10m + block truncated, Read pulled to now + on-plan. No new copy. **The SWIPE-peek carousel (H-D2b) is deliberately NOT built** — gesture work in the day-nav bounce zone, preview lies about swipe; hold for a device session.
- **v1139 H-D3 — idle home matches the What-now mockup.** "What now?" + next-pill moved BELOW the circle; header top-right = gem count w/ diamond (was streak+tracked-mins); tool grid `repeat(4,minmax(0,1fr))` so all 4 tiles fit (was spilling the 4th off-screen). Screenshotted a seeded idle+plan: header time·◆1,240, full-width story bars w/ glyphs, circle, question below, next-pill, clean 4×2 grid — matches the mockup composition.

**REMAINING deltas vs mockup (David's call, NOT yet done):** (a) "Plan my day" dashed door — mockup omits it (it's the planner entry; timeline pull-down also opens planning); (b) grid tiles are dark-tinted w/ labels vs the mockup's brighter icon-only tiles ("Visualisation" truncates); (c) TRACKING-view declutter — David: "I don't like below, the Read + extend + everything, thought we redesigned this" (the title pill + extend sheet + quick-tools + Stop/Break stack is heavy). All PREVIEW-tap-verified where relevant; **dial FEEL + any gesture = DEVICE-UNTESTED.**
**NAV SYNTHESIS + TIMELINE QUEUE (2026-07-20, Fable):** David asked how home-as-cockpit (fold-away) reconciles with home-as-bottom-nav-page. Ruling proposed in grammar-spec PART 4: **home = a PLACE (nav page, never folds), player = a MOMENT (the only full-screen overlay)**; recommendation = Option A (kill the fold-down as nav; player stays modal; live puck on other pages). VERDICT PENDING. Also logged PART 5: timeline remaining = P-C (spec'd, safe) + **NEW drag-drop bug** (drag future block down → release → other blocks disappear; STRUCTURE zone, own Opus session, device-tested).
**NAV VERDICT (David 2026-07-20): OPTION A + the ZOOM LAW** (grammar spec PART 4b, v2 — supersedes the fold-into-dial idea from earlier the same day): home and player = ONE instrument at two ZOOM LEVELS of one timeline (nests day ⊃ session ⊃ section; the meditation section-zoom gets the same animation). Swipe down on the player = camera zoom-out (orb→disc, stage-bars collapse into one day-segment with neighbors side-peeking in; chrome crossfades last; the player stays fully simplified). Zoom-IN gesture = OPEN question (lean: swipe up on circle + tap the breathing disc). Mini player bar stays on planner/journey/game. One live time-object per screen. Home never folds; player is the only overlay. Gesture arbitration = own device-tested session, lands with/after bottom-nav.
**ZOOM Z-1 SHIPPED (v1140):** player opens with a bloom (gpZoomIn) + closes with a scale-down zoom-out = the home↔player motion vocabulary. Verified in preview. Grammar spec PART 6 has the full Z-1/Z-2/Z-3 status. KEY: swipe-down=minimize + audio-keep-alive ALREADY EXIST; the act→section zoom EXISTS but is instant (Z-3 = animate it). Z-2 (fold REVEALS the home cockpit, session in the dial) is the deep unification — blocker confirmed: `leaveHomeForPlayer` tears home down on launch so close lands on the panes (saw it land on Journey), not home.
**HOME-AS-PANE RULED (2026-07-20 late, Fable — grammar spec PART 7):** David caught the residue: home still pulls away (overlay) and lands on Journey. Ruling: home becomes a TRUE PANE — no pull-away, scrolls inside (dial up top → tools → MORE tools below the fold), peek carousel confirmed wanted, nav visible on home, **nav reorder: Planner · Journey | ⌂ HOME (middle) | Game · 5th-slot** (rec: **You** = char sheet + sanctuary + the redesigned settings; David hasn't picked). Build slices in spec PART 7 — structure-grade, own Opus session.
- **ONE move, David:** pick the 5th nav slot (You / other) + device-verdict the v1137-1146 run (esp. Millie + drag-blocks-after-reload question).
- **ONE move, Claude (next Opus session):** HOME-AS-PANE slice 1-2 (home renders inside a pane, nav visible, kill pull-away) — it's now the root of David's "something feels off"; the DRAG-DROP BUG rides the same session if budget allows (both are structure-zone).

## ★ BATCH FROM DAVID 2026-07-20 (start screen + voice + bottom nav) — triage
**SHIPPED:** v1141 language selector = large icon-only globe · v1142 guided breath (standalone `breathwork`) VOICELESS by default (S.breathVoice opt-in; speaks shown label row[0] not the reused row[3]) · v1143 Millie switch fix (loadGenderBank was nulling gdir+gvset on a flaky manifest → fell back to root/Dave; now gdir kept + stand-in gvset). ALL voice = DEVICE-UNTESTED (audio is device-only) — David confirms on phone.
- ✅ DONE v1145 tracking-view declutter: the on/off-plan extend sheet (header + 5 chips, always open — David's repeated "extend and everything below" complaint) now folds to ONE quiet "extend" pill; tap reveals the chips; auto-opens + glows when ending-soon. Extend path unchanged. Verified.
- **FINDING (2026-07-20):** the new-era redesign IS broadly applied + live in preview — home dial/composition, toolbox (plum cards + stack previews + gem header), journey (stone ladder), planner day (P-A/B). If David "can't see his redesigns," he's likely on a STALE cached build — push fresh.html hard. Genuinely-old surfaces left: onboarding, settings sheets, some deep menus. Toolbox front door already new-era.
**STILL OPEN from this batch:**
- **STACK VOICE MUMBLE** (David confirmed it's the 5-MIN STACK, not the breath tool): "alright um breathe in … eyes … breathe out" = `timelinePlayer`/`composeStackSegs` stitching intro+breath+meditation clips with filler ("um"/"alright" sound baked into the generated clips). Needs its own pass: audit the stack cue sequence + likely REGENERATE the offending clips. Also the breath cues inside a stack should be voiceless like the standalone tool now is.
- "make a quiet at 4 percent peaceful" = a very-low (~4%) peaceful ambient bed (clarify: new bed vs default breath bed to 4%).
- ✅ DONE v1144 Dev-tools toggle: the 🛠 `#devBtn` (devInit, ~14056) no longer force-sets alter_dev; it's DRAGGABLE (pos persists in alter_devpos), a quiet "dev tools off" toggle sits on the start screen (default off, appends to .ss-actions), the button always shows ON the start screen and hides after Start unless the toggle kept it (devBtnVisible, hooked in showStartScreen + ssEnter). Verified default-off in preview. (The wrench WAS the app's devBtn, not the harness — corrected.)
**START-SCREEN POLISH (contained, next quick session):**
- Dev buttons: the visible wrench in Claude's PREVIEW is the harness (not on David's phone). David's real dev buttons = the `?dev` / `localStorage.alter_dev='1'` gated UI (harness at @SEC:DEV, ~13634; `window.DEV` is a console API). BUILD: a start-screen toggle (off by default, above Start or top-left) that sets `alter_dev`; the visible dev buttons show ONLY on the start screen unless the toggle is on; make the dev button movable/draggable so it never covers content.
**VOICE BUGS (need investigation + DEVICE test — audio feel is device-only):**
- Millie voice switch does NOT work (bank `X1haHuvIvfCqolpCbj5P`; setVoice at ~173; check the gender-bank layer / gvset race).
- Voice choppy sometimes; the 5-min stack has random pauses "like the guided breath."
- **Guided breath should be VOICELESS by default** (opt-in for voice) — behavioral default change in the breath player.
- Voice does NOT match the displayed text in guided breathing (cue/clip desync in breathwork).
- "make a quiet at 4 percent peaceful" = a very-low (~4%) peaceful ambient bed option (clarify: a new quiet bed, or default the breath bed to 4%?).
## ★★ MINIMUM-SIZE PLANNER = THE canon planner mockup (David 2026-07-20, feels I "forgot" it — I did not capture it before)
David's Gym/Lunch/Claude-code/Read mockup IS the planner design and is NOT built. Model LOCKED: every block ≥ ~48-54px readable card (never a sliver), longer blocks grow, short blocks PUSH later blocks down, single-lane, no week strip, 12h gutter (shipped). **Full spec in planner-BUILD.md "★ THE MINIMUM-SIZE PLANNER".** It's a REBUILD not a tweak: `calendarView` pins blocks + now-line + live tracking charge + matched spans + drag math to exact time-Y (`topFor`); the 14px sliver floor exists so they don't collide; min-size+push-down breaks "y=exact time" for ALL of them → each must follow a shared FLOW MAP. Regression zone (rebuilt 3x). **This is THE next dedicated Opus build — spec-first, device-tested, one slice, contract open. Do NOT half-ship the geometry.** The existing `preview()` drag-reflow already does push-down = the seed.

**BOTTOM NAV — SLICE 1 SHIPPED (v1146):** added a **Home** button to `#nav` (now Home · Planner · Journey · Game), wired to `openHome()`, hides in the collapsed planner/journey states like its siblings, no stale highlight (home overlays the nav). Home is now a real nav destination (Option A). Verified 4 buttons render evenly + Home opens the cockpit. **REMAINING nav slices:** the fold-away + player-as-ONE-bottom-bar integration (the zoom-law Z-2), and making home a true pane with the nav visible on it (currently the cockpit overlays/covers the nav). Planner is already new-era (P-A/B); **SETTINGS redesign NOT done** (David asked for it 2026-07-20 — the sound/settings sheets are old-era; own slice).
**KEYSTONE — BOTTOM NAV (own focused Opus session, unlocks home-access + Z-2):**
- David: "i need access to home — build the correct bottom menu; it should fold away beautifully, perfectly integrating with the player as ONE bottom bar below." = home becomes a real bottom-nav destination (Option A), the nav folds away cleanly, and the mini-player (`gp-mini`, already exists) unifies with the nav as one bottom bar. This is the prerequisite for the Z-2 home-reveal zoom. Current nav = 3-pane carousel (`#nav`, `.jp-nav` Planner/Journey/Game) + `#liveDock`; home is an overlay cockpit, NOT a nav pane. Big, gesture-heavy, regression-adjacent → spec first, one slice at a time, device-tested.

**Queued BEHIND the core-redesign build (order after it lands):**
1. **Toolbox overlay bug** — "the category list gets covered." STILL needs David on-phone to say which view (front door vs library) + exactly what covers what. `#breathPick` is z-99 (above all), library view renders in the cockpit's scrolling `#tfStageBody`; no obvious covering element found by code read — a blind fix risks breaking the cockpit region. One sentence of repro unblocks it.
2. **Literal single-engine player merge** — see architecture note above.

---

## 5. MEMORY TO LOAD NEXT SESSION
`[[alter-mom-investor-pitch]]` (deck state + raster pipeline + gotchas), `[[alter-book-mining-canon]]` (the mining machine + both canons), `[[alter-business-masterplan]]` (the active business plan), `[[alter-mom-investor-pitch]]` open questions. The MEMORY.md index loads automatically.

---

## 2026-07-22 — IZO Russian voice bank: audit DONE, generation ready
Full RU copy audit ran this session (Fable + 18 cheap-agent blind-back-translation gates): 501 spoken lines → 25 bad existing translations fixed, 260 MISSING translations (whole PMR/gratitude/hypnosis/day-1 content was silent in RU) drafted + gated. izo voice live in ElevenLabs (`anctA7r7S5Wnb0Ztqlos`, ru). Everything in **`_specs/RU-VOICE-IZO-2026-07-22.md`** + master lines in `_specs/ru-voice-izo-lines.json`.
- **ONE move — David:** skim the 37 fixed lines in the master file (native-ear verdict) + call the gender question (bank currently speaks to a male user; mom persona needs a call).
- **ONE move — Claude (OPUS session):** run the build plan in RU-VOICE-IZO spec — dict update → gen-voice-izo.py (RU norm charset! see landmine) → hash-parity check → sample-10 for David → full 501-clip run → wire izo bank.

## 2026-07-22 v1202 — Millie switch FIXED + izo RU voice gating SHIPPED
Root cause of "Millie selected but plays Dave": `initVoices()` (app.js:289) runs before `load()` (14633) populates S, so the audio bank booted to dave every time and the persisted pick never re-applied (the chip read S.voicePick live, so it lied). FIX: bank resolves LIVE from S+language at every play (`curBank()`), and `applyVoice()` re-runs after `load()`. Language-gated: RU → izo only, EN → Dave/Millie only; picker UI gated to match. izo audio NOT generated yet (`_dev/gen-voice-izo.py` ready, gender-aware 571-clip); RU falls back to root Dmitry until izo clips land. Verified in preview: EN resolves dave/millie, RU resolves izo (millie pick ignored), zero errors. **DEVICE-UNTESTED: the actual Dave↔Millie audible switch on David's phone** (preview proves bank resolution, not audio feel). Retire the old "Millie voice switch does NOT work" bug line above once David confirms on device.
- **ONE move — David:** open /fresh.html, Settings → tap Dave then Millie, confirm they now sound different; switch app to RU, confirm picker shows only izo.
- **ONE move — Claude (next):** on David's delivery pick (flat/v2/v3 — the 6 demos), run gen-voice-izo.py to generate the 571-clip izo bank + apply the dict update (25 fixes + 260 new RU lines) so RU audio goes live.

## 2026-07-22 v1202-v1204 — voice + breathing + toolbox batch (7 David bug/design reports)
- v1202: Millie switch fixed (init-order desync) + izo RU language gating shipped.
- v1203 (voice #1/#6 + breathing #2/#4/#5): Millie switch now INSTANT (both EN banks preload at boot; EN folder resolves optimistically from the shared root keyset, no wait on the millie manifest). RU no longer leaks the English British clip (hasClipFor: under RU only play a real izo clip or a Dmitry-root clip where a translation applied, else silence). Removed the auto-generated stack transition card ("Now, the breath." etc.) that was an okay-filler, spoke text the screen didn't show, and sat as un-tracked dead time -- acts now start on their first real cue.
- v1204 (toolbox #7): Stack is now the FIRST toolbox entry -- one "Build a stack" hero -> 5/10/15/20 picker -> autoStackTrack() auto-fills an editable stack -> Begin. 15-min added (was missing). David's pick = time->auto-filled->editable.
- **STILL OPEN #3 (Millie reads every 2nd line in breathing):** DEVICE-DEPENDENT (Millie clips ~1.5x longer than Dave; suspect clip-length/decode collision). Can't repro in headless preview. Need David to say: standalone breathe tool, or breathing inside a stack? That narrows the code path.
- **ONE move -- David:** test v1204 on phone: (a) Dave<->Millie now switches instantly + sounds different, (b) breathing has no "okay"/"now let's" filler, (c) toolbox opens with the Stack button -> time -> editable stack. Then tell me whether #3 (Millie skipping) is standalone or in-a-stack. Also: pick izo DELIVERY (flat/v2/v3 from the 6 demos) so the RU izo bank can be generated (RU is silent until then).
- **ONE move -- Claude:** on David's #3 answer, diagnose the Millie-skip; on his delivery pick, generate the izo bank + ship the RU dict update so Russian audio goes live.

## 2026-07-22 v1205 — Russian izo voice SPEAKS (293/501) + quota blocker
David: "izo in Russian still silent." Cause: the izo clips never existed (the v1203 fix correctly stopped the English leak, leaving silence). Fix shipped:
- Generated the izo RU bank (flat settings = same proven config as dave/millie), keyed by hash of the RU text. **ElevenLabs FREE-TIER QUOTA (40,000 chars) hit at 293/501 lines** — the rest stay silent under RU (no English leak) until the plan is upgraded or the monthly quota resets. `gen-voice-izo.py all` resumes (skips existing) once quota is back.
- Shipped all 501 EN->RU translations into I18N.ru (25 fixes + 260 new + 216 confirmed) so vhash(en) under RU == izo key; hash parity verified 40/40 + a live clip fetch 200. Manifest reconciled to the 292 files on disk.
- Verified in preview under RU: izo manifest loads, sample clip 200, zero console errors. DEVICE-UNTESTED: RU audio on the phone.
- **BLOCKER for David:** ElevenLabs free tier can't cover 3 full banks (~1,500 clips). To finish the remaining ~208 RU lines (and any future voice work), upgrade the ElevenLabs plan or wait for the monthly quota reset, then re-run `IZO_MODE=flat python3 _dev/gen-voice-izo.py all`. Logged in LEDGER.
- Female-form RU + the gender switch = follow-up (ru_f translations exist; resolver + female clips not generated).
- **ONE move — David:** on the phone, switch to Russian and run a tool — confirm izo now speaks (partial); decide on upgrading ElevenLabs to finish the bank. Also still owed: the #3 Millie-every-2nd-line answer (standalone vs in-a-stack) + izo delivery pick (flat is shipped; v3-emotion is an upgrade).
- **ONE move — Claude:** when quota is back, finish the RU bank (208 lines) + wire the gender resolver for female users.

## 2026-07-22 v1206 — Russian izo bank COMPLETE (male + female)
David upgraded ElevenLabs to Creator (121k chars). Finished the whole bank: all 501 male RU lines (was 293) + all 70 female-form variants = 546 clips. Female-voice resolver wired: vline() returns the female variant when S.profile.gender==='f' (new I18N.ru_f dict); male/neutral otherwise. Verified in preview: male 501/501 + female 70/70 resolve, female clip fetches 200, zero console errors. Ledger updated (Creator ~$22/mo, 9.8k/121k used). DEVICE-UNTESTED: RU audio feel on phone. Delivery = flat (v3-emotion is a later upgrade). **RU voice is now feature-complete.**
- Remaining voice follow-ups (not blocking): #3 Millie-every-2nd-line (need David: standalone vs in-stack) · izo v3-emotion delivery upgrade (optional, David never picked from the 6 demos) · David's eye on the 25 audited RU copy fixes now live as display text.

## 2026-07-22 v1207 — Aida = 2nd Russian voice, pickable alongside izo
David made a new RU voice "Aida" (ElevenLabs 6UiVbh6p4aRYIcXnPbQI). Recorded her saying all lines: 546 clips (501 male + 70 female), same coverage as izo, in assets/voice/aida/. RU now has a voice PICKER (izo | Aida) mirroring EN dave/millie: S.ruVoice (default izo), curBank() returns the pick, both RU banks preload in RU (instant switch), settings shows both chips + sample on tap, female resolver applies to both. gen-voice-izo.py parameterized (VOICE_NAME/VOICE_ID env). Verified in preview: both banks 546, a line resolves to both an Aida clip + izo clip (200), no errors. No SCHEMA bump (S.ruVoice optional, read defensively). DEVICE-UNTESTED: RU audio feel on phone. **RU now has TWO complete voices.**

## 2026-07-22 v1208 — Aida 2 (realistic voice + per-line emotion tags) replaces flat Aida
David: flat Aida sounded weird, made "Aida 2" (9Y55brJ14EhgamtKb1jL), wants correct emotion tags. Done: classified every line calm/charge/warm/plain (256/80/75/90, cheap agents → merged into master `delivery` field), generated all 546 on eleven_v3 with tasteful tags ([calm, softly]/[determined]/[warm, gentle]/none — charge firm not shouty). Same aida/ folder + keys, picker unchanged. Added aida-only cache-bust in vpath (content changed at same filenames). gen-voice-izo.py: IZO_MODE=v3full. Quota 51.5k/121k. Verified preview: 546 keys, clip 200, boots clean. **CANNOT AUDIT AUDIO — David on phone, shipped on trust; over-acting = per-profile tag tweak + regen.**
- ONE move — David: when you can hear audio, check izo vs Aida in RU + whether the emotion is right; if any profile over/under-acts, tell me which (calm/charge/warm) and I retune the tag + regen.

## 2026-07-23 v1212 — P0 "bounced to welcome screen + diminished state" hunt: TOOLBOX CLEARED, crash-path hardened
**Symptom (David's iPhone):** healthy at 2:41pm on v1209 (1,240 gems, toolbox rendering, "next: Deep work 5:30"); after the v1210 deploy triggered a PWA reload ~2:45, the 2:49 recording shows the START/welcome screen ("day 1 together"), then after Continue a diminished idle home (194 gems, empty habit strip, "open afternoon — pick a thread", no next-line, no toolbox), then back to the welcome screen.

**ROOT-CAUSE FINDING — the toolbox (@SEC:TOOLBOX2 / TBX2) is NOT the cause, and did NOT corrupt David's data. Evidence:**
- The idle gem HUD (`renderTrackerFull`, ~app.js:3885) reads `S.game.spark` DIRECTLY — it is NOT day-keyed. So 194 vs 1,240 proves the 2:49 app loaded a genuinely DIFFERENT/OLDER `S`, not a day-key/claim misread of the same save (a wrong `todayK()` would still show 1,240). Likewise the empty strip needs empty `S.habits` and the idle verdict needs empty `S.blocks` — a different/older store, not the same save re-resolved.
- The toolbox is data-insulated: it writes ONLY additive, guarded `S.tools.*` (`tbxSetDose`→`S.tools.tbxDose`, `tickTool`→`use/last/recents`). It NEVER touches `S.game.spark`, `S.habits`, or `S.profile.pact`. `tbxLaunch`→`runStack` only INCREASES spark; `tbxPlanDay`→`setPaneRest("planner")`+`renderToday()` is planner nav. Nothing in 5465–5649 writes streak/spark/pact/habits, and renderToolbox2 calls no `save()` at boot.
- The toolbox code is byte-identical between v1209 (healthy at 2:41) and v1210 (broken at 2:49) except the 4 whisper-string lines — so the toolbox rendered fine on the exact build David was healthy on. `tickTool(<tbx id>)` writing non-STACK_TOOLS ids into `S.tools.use/recents` is harmless (no downstream reader dereferences a recents/use id against TOOLS).
- No service worker exists in the repo → no mixed old/new pair possible.
- Verified in preview across all hero-hour branches (1–5am / evening / morning / afternoon) and realistic states: toolbox renders clean, all handlers try/catch-wrapped, launch→player→complete→Plan-my-day all land on HOME (never claim/welcome), zero console errors.

**Most likely actual cause of the incident:** the ~2:45 PWA reload (v1209→v1210 deploy swap) cold-booted onto a different/older localStorage store (194 = a real historical spark value) — consistent with iOS keeping separate localStorage for two app contexts (installed PWA vs Safari), one stale. This is an on-device storage phenomenon, not app-code corruption. **David's real 1,240-gem save is very likely INTACT in the context that showed it at 2:41.**

**The "bounce back to welcome screen":** the global handler at app.js:39-41 (`window.addEventListener("error"/"unhandledrejection")`) shows a "something glitched — tap to refresh" toast whose tap does `location.reload()` → the welcome screen (which shows on every cold open). The one REPRODUCIBLE uncaught-throw class that produces this: a `null`/garbage entry inside a day's `S.blocks[k]`/`S.log[k]` array crashes EVERY iterator that reads it (`sfNow` app.js:8394 `.filter(b=>b.time…)`, `trackerState`, `claimableBlock`, `nextUpBlock`, `renderHomeBars`) on the FIRST home render → glitch toast → refresh → welcome. Reproduced in preview (threw at `sfNow`).

**FIX SHIPPED (read-guarded, NO schema bump, whole-app benefit) — app.js `load()` base-defaults (~6304):** compact `null`/`undefined` holes out of every `S.blocks[k]` and `S.log[k]` array ONCE at load, before any render, covering every reader (accessor + direct `S.blocks[k]` reads). Only reassigns when garbage exists (clean arrays keep their reference); removes only null/undefined; NEVER writes defaults over data. Converts a whole-app crash→refresh→welcome loop into graceful degradation. Verified: poisoned localStorage (2 null blocks + 1 null log) → reload → load() compacted them, PRESERVED the real block, home rendered clean (previously crashed at sfNow).

**TBX2 decision: kept TRUE (not flipped).** Flipping would (a) destroy a working, data-safe feature that is provably not the cause, (b) not address the on-device storage phenomenon, and (c) break the now-coupled `DEV.designAudit()` (its tile/plan/bento checks require the toolbox DOM — the "built-in rollback" is not self-contained).

**Gates (verbatim):**
- `DEV.designAudit()` → `ALL PASS (16)` on the idle home, mobile preset, tuner vars cleared (bloom 0.12/28px — note: with dev-mode ON at boot `tunerApply` applies the tuner DEFAULT bloom 0.18/40px inline, which fails the ≤0.14/≤32 check; the constitution's "tuner vars cleared" condition = call tunerClear/remove the inline `--tun-*` props → CSS fallback passes; on David's dev-OFF device tunerApply never runs so the CSS default applies. Pre-existing, unrelated to this change).
- `bash _dev/preship.sh` → green: syntax ok, all ratchets pass (innerHTML wipes ≤ baseline, SCHEMA↔MIG ok), 26 logic invariants PASS, cache-buster v1211→v1212, server.js regenerated.
- Full toolbox loop (dose card open/close, chips, category single-open, in-panel dose, hero play, gate whisper, Plan-my-day, Start/launch) → zero console errors.

**DEVICE-UNTESTED:** scroll/gesture feel into the ground-zone toolbox on David's iPhone (preview lies about gestures); RU audio; the actual on-device storage-context behavior (could not reproduce iOS PWA-vs-Safari store divergence in preview).

**★ WHAT DAVID SHOULD TAP FIRST (data recovery):**
- Do NOT tap **"Start fresh"** (that erases). If a Replace/Restore prompt asks to overwrite, do NOT confirm unless it's your own good backup.
- Reopen the app in the SAME context where you last saw 1,240 gems. If it opens showing 194/empty, tap **Continue** (never Start fresh) — it loads whatever is in that context.
- If the 194 state persists, use **"Load save"** with your latest exported/shared snapshot (🧠) to restore the 1,240 state.
- Going forward, use ONE context consistently (the installed home-screen PWA) so the two stores can't diverge.
- **ONE move — David:** open /fresh.html once (past Pages cache), confirm the app boots to your real save (gems + habits + plan present); if it shows the 194/empty state, tell me and do NOT start fresh — we restore from a backup.
- **ONE move — Claude:** if David confirms two diverging stores, add an automatic last-known-good backup slot (read-guarded, never overwrites) so a future reload can never strand him on a stale store.

---

## SESSION 2026-08-03 (Fable, design synthesis) — GARDEN UI ROUND OPENED

Ten-iteration Claude Design prompt for the garden surface composed and delivered (fixed elements per David: home door bottom-left, gems top-right; everything else open). Prompt at `_design-sync/garden-2026-08-03/PROMPT-garden-ui-10.md` (G1 pure world ... G10 guardian-led; eight jobs: arrive / read plaque / recharge / place / claim tile / beauty catalog / chronicle / leave; two states per iteration; anti-goals list). Composition decision baked in and flagged to David: tile-claim = grow the LAND, named marks = the record standing on it; journey-stone planting (Option A) treated as real but NOT wired in app.js. Walkable sanctuary kept as constant, only G5 (postcard) may challenge it. No code touched.

- **ONE move — David:** paste the prompt into the "Alter Design System" project, pick from the ten (or name the two to cross-breed).
- **ONE move — Claude:** on the pick, pull the winning frame + live tokens via DesignSync and write BUILD-SPEC-garden per DESIGN AUTHORITY LAW 6/7 for an Opus builder.

---

## SESSION 2026-08-12 (Fable orchestrating, Opus built) — v1254: HOME 2c SCROLL FIXES (David's two device screenshots vs his frames)

**The two bugs, both scroll-position only (zero paint/layout changes):**
1. **Landing overshoot on device.** `worldHomeTarget()` added `safeBottomPx()+8` (the v1251 compensation for the OLD face's -19vh deck peek). 2c cancelled that peek and wants the TOOLS hint AT the true bottom, so on device the extra ~34px scrolled PAST the home seam: week strip riding into the fixed HUD, toolbox tops peeking over the fold. Invisible in preview (inset 0), which is why every audit passed while the device drifted. FIX: on `tfh2c()` the target drops the inset term (`home.offsetTop - WORLD_PEEK + 8`); legacy face byte-identical. Landing is now device-invariant: preview = device. Verified: simulated inset 34 lands at the same scrollTop as inset 0 (pre-fix: +34). Magnet inherits (it reads worldHomeTarget).
2. **Card reveal bottom-anchored.** `tfhRevealCard()` scrolled only until the card BOTTOM was 16px inside the fold: half-cut pink circle on top (David's screenshot 2). FIX per his card-open frame: TOP-anchor, hero row parks at the safe-area line (hud rect top + 1 as the env beacon), circle fully scrolled away, Plan-my-day reduced to a sliver at the top edge exactly like the frame. Plus: **HUD fades while a face card is open** (`tfh-cardopen` class, opacity .2s, pointer-events none): in David's design the HUD row scrolls away with the column; in the build it is fixed chrome, so it fades instead (frame shows NO HUD in this state). **Close returns to the seam** (fold-away eases back to worldHomeTarget; >40px guard keeps the designAudit probe scroll-free). **Leaving home closes the card** (teardownWorld clears `_tfhOpen`): a fresh home entry is always the calm face with its HUD, per the open-home frame; per-minute sweep restore within a visit untouched.

**Gates:** `DEV.designAudit()` ALL PASS (37), run repeatedly across all rounds, audit block untouched. preship green: 26 invariants, ratchets clean (no new wipes), v1253→v1254, server.js regenerated. Zero console errors every checkpoint. `node --check` OK. Landing scrollTop in preview byte-identical pre/post (5195 on the demo profile). Tile-swap while open: 0px jump. Element-by-element screenshot diff vs David's two frames done (landing + card-open).

**DEVICE-UNTESTED (the honest list):** the 200ms HUD fade feel, the reveal/close smooth-scroll easing, the HOME MAGNET interplay, and the real-inset landing on David's phone. The headless pane is visibility:hidden (rAF, CSS transitions, smooth-scroll never advance); all end-states were proven numerically, feel needs the phone.

**OPEN DAVID-CALLS (named, not auto-applied):**
- HUD at card-open: shipped = FADE (minimal, state-scoped). The design's literal mechanism is the HUD scrolling away in-column (would also change journey/tools scroll states). Flip to in-flow only on his word.
- The design project's `2g` screen shows a BOTTOM-SHEET dose card over a dimmed home; his posted target frames chose the INLINE card, which is what shipped. 2g stays unbuilt unless he picks it.
- The guardian puck overlaps the open card's bottom-left (Adjust row), same family as the v1253 planner-picker nit; also: puck-tap at card-open returns home WITHOUT closing the card.
- **ONE move — David:** open /fresh.html on the phone, check the two states: (1) home opens with HUD above the strip, TOOLS at the true bottom, nothing peeking; (2) tap Morning Stack: tiles park at top, no cut circle, HUD gone until close.
- **ONE move — Claude:** apply his HUD verdict (keep fade / go in-flow) + the puck-overlap call in one pass.

---

## v1263 — THE HOME SCROLL + CASCADE CONTRACT (design `Home Screen.dc.html`, frame 2c)

Source: `_design-sync/home-2026-08-14/design_handoff_home_screen/` (GATE A pass, 2 frames, 99,119B — untruncated).
The home zone's LOOK already shipped (2c face, v1259+). What this build implements is the part of the design that had never been
built: the **animation + scrolling contract** — the thing David's notes 1-32 are almost entirely about ("consider especially about
the animation and scrolling since that took the longest").

**Built**
- `@SEC:WORLD-MOTION` replaces the v1208 band magnet: a damped spring (2ms substeps, design constants) + three-zone intent snapping
  + fling catch + hold-at-home + slow-drag tie-break. One authority at a time; a finger down kills everything.
- The home cascade: 6 blocks (`#tfHomeBars`/`#tfDateKick`/`#tfRing`/`#tfTitle`/`#tfVerdict`/`#tfCtrls`) rise bottom-to-top from
  the tools, drop top-to-bottom from the journey, sink on exit. The week strip never moves as a slab — it sweeps column by column
  with a z-tilt through its own 520px perspective.
- The tools cascade (`youRowIn`/`youRowOut`) over the shelf's 17 rows, with the velocity stretch.
- Overlay scrub by direct style write (never a re-render): puck · JOURNEY↔HOME label crossfade · TOOLS hint · Planner pill.

**Deliberate deviations from the design file** (named per DESIGN AUTHORITY LAW 3 — David's call if he wants them the other way):
1. **No `_measurePad`.** The design measures a bottom pad to centre a one-screen tools block; the app's shelf already carries
   David's own device-tuned bottom padding, locked by the "ground bottom air" gate. Adding a measured pad would fight that gate.
2. **The magnet lets go past one viewport up.** The design's sky is one screen so its snap can own all of it; the app's sky is the
   whole journey trail. Past one viewport the magnet releases, or reading the trail would be impossible.
3. **The JOURNEY hint now lands one viewport up** (the trail's live end) instead of scrollTop 0 (the trail's beginning), so the
   button and the gesture share one destination.

**Verified in preview (mechanical, not feel)**
- Both arrival directions fire the right keyframes: up = `homeRise` + 6-column `homeSweep`; down = `homeDrop`, strip first.
- Both land on `d = 0` exactly. `DEV.wIntent()` proves the no-overshoot law across 8 cases, including "a pull up that began in the
  tools can never reach the journey" (notes 20/25/28).
- Leaving home mid-cascade and returning restores every block — nothing stranded at opacity 0 (note 6's failure mode).
- designAudit 47 checks, the same 5 fails as shipped v1262 on the identical night face/profile (A/B by `git stash`). Zero console errors.
- A real regression was caught and fixed by that A/B: the shelf's hidden state carried a `scale(.9)` that made two locked geometry
  gates report 52x52 / 49-47. Hidden rows now carry opacity only; the scale lives in the keyframe's `from` where it belongs.

**DEVICE-UNTESTED — the whole point of the build is FEEL, and the preview cannot judge feel.** Confirm on the phone:
up-glide smoothness, no jitter going down, cascade timing (neither late nor mid-glitch), puck timing, fling thresholds. The preview
also freezes rAF, so every landing here was proven by state, not by watching.
Untested for a different reason: the Planner-pill fade (230→300px) — the preview sat on the night face, which renders no Planner pill.

**Knobs if the feel is off:** `WM = false` reverts to the v1208 magnet in one line. Stagger 30ms (home) / 55ms (shelf); spring
`k` .000055 soft / .00009 firm; snap delay 30ms idle / 260ms touching; fling thresholds .85 down / .55 up / .7 up-at-home.

## v1271 — TOOLS-LANDING FIX (David's device frames 2026-08-14: "expectation vs reality")

**The bug:** at the tools landing the practice deck hung over the HUD with a dead band under it. **The cause was v1267's
deviation #1** — I skipped the design's `_measurePad` as "cosmetic centering." It is not: the shelf (~610px) is shorter than the
viewport, so without a measured pad the column physically cannot scroll home away; 163px of home's tail (the deck) stayed pinned
at the top. Reproduced exactly in the preview — meaning it was catchable before shipping, and wasn't, because I diffed keyframes
and landings by STATE but never screenshot-diffed the TOOLS LANDING against the frame (the LAW-7 gate; I treated this as a motion
build, not a design ship. A scroll landing IS a designed state.)

**The fix (`wMeasurePad`):** ground gets a measured TOP inset (≥70px + safe-top — seats the grid below the HUD, centered when the
shelf is short) + a BOTTOM pad making inset+shelf+pad exactly one viewport, floored at the CSS's safe-area+72 so a tall shelf keeps
the tuned air. Home now fully exits (tail 1px); grid top lands at 134px (preview). Deck rides out with home — the eight-grid already
carries those four stacks, so nothing is doubled on the tools screen.

**The gate:** +2 designAudit checks (audit 47→53 with the motion probes): "tools landing clears home" (≤2px) and "tools grid below
the HUD band" (≥70px inset). This class of drift now fails a ship mechanically. Screenshot of the tools landing diffed
element-by-element against David's frame: matches.

DEVICE-UNTESTED: the landing feel with the new ~460px-longer travel; safe-top probe values on the notch.

## v1273 — THE DECK-ANCHORED TOOLS LANDING (David's video + the RUNNING prototype; supersedes v1271's landing)

v1271 was wrong in the opposite direction: it scrolled the deck AWAY with home. David's video (Downloads/animatioinscreen.mov,
frame-dumped to scratchpad) shows the design truth: **the deck stays** — it rides up and becomes the tools screen's first row,
and the shelf cascades in below it. The design's `_measurePad` measuring from `row1.top` encodes exactly this; both prior rounds
"interpreted" that code instead of running it.

**Root-cause law added (CLAUDE.md DESIGN AUTHORITY LAW 8, committed):** a `.dc.html` bundle is a RUNNING PROGRAM. Drive it to
every rest state and extract each landing's geometry numerically as acceptance targets before porting. The prototype, run live,
gave: deck parks 139px from frame top, row2 11px below it (its -62px pull), 108px measured pad.

**Built (Opus agents, Fable-orchestrated + audited):**
- `wMeasurePad` deck-anchored: C = deck top → shelf bottom (client-rect, scale-guarded); inset = max(safe-top+70, centered);
  padB floored at safe-area+72; padT 0. No-deck faces (night/break/claim wear tf-2c without a deck) keep the v1271 scheme + a
  measured pull-compensation the builder caught failing (42px hangover) — flagged, verified, kept.
- 2c grid dedupe: `#tbxGridTop` under 2c excludes the four deck ids → Body/Heart/Vision/Build. Deck 4 + grid 4 = the same
  8 distinct stacks, split so the first row rides in from home. Off-2c byte-identical.
- `.tfw-ground` margin-top -44px under 2c closes the deck→grid gap (25px at the landing); the overlapped band is opacity-0 +
  **pointer-events none** (tap-trap confirmed real by elementFromPoint, then closed; hint taps land on the hint).
- designAudit gates rewritten face-aware: deck present → "seats the deck" [68px, half-viewport] + "hands straight into the grid"
  ≤60px; no deck → the v1271 pair. Also the three tile-hue gates made order-agnostic (collateral of the dedupe).
- Constants audit vs the Component class (exhaustive, agent-run): 2 real port bugs fixed — the JOURNEY hint's tap now dies at
  tp>40 (was ~66), and `wGoJourney` no longer pre-sets `_hcState` (it was silently SKIPPING the homeSinkUp exit cascade on the
  button path; scroll now drives it, same as the design). +1 nuance ported: both HUD labels SLIDE as they fade (journey rides up
  with the scroll, HOME rises in from 14px) via the CSS `translate` property. Deliberate deviations (no teleport re-settle,
  free-scroll past one viewport, opacity-only hidden rows, safe-area floors) re-confirmed and documented in place.

**Verified (idle face, live):** deck at 125px at the landing, gap 25px, grid Body/Heart/Vision/Build, audit 53/53 PASS, wIntent
battery all-pass, zero console errors, ratchets clean. Tools-landing + home-rest screenshots diffed against the video frames.

**ONE OPEN CONFLICT for David:** his frame's second row repeats Night Stack (it's in the deck AND row two); the app substitutes
Body to keep all 8 distinct per the locked "one grid of 8". Say the word if the literal frame should win.

**DEVICE-UNTESTED:** the whole feel — the deck riding continuously, cascade timing below it, the JOURNEY button now playing the
exit cascade, label slide, landing seat on the real notch.

## v1275 — THE 402 ARTBOARD PIN (David's "the circle is too big AGAIN" — the recurring class, killed at the root)

**The disease, finally named:** the design is a FIXED 402px artboard (stone 180px, tiles 50px, folders 3 columns — absolute px);
the app's 2c board mixed viewport-relative sizing and old-era recipes. Preview (375-390) hid the drift; David's 430pt phone
inflated it (stone 208, folders re-flowed to 4 columns, planner on the old recipe). Every prior screenshot round was this one
class. Fix: the 2c board + shelf render at the design's own pixels inside centered columns (home content 362, ground 370 — the
artboard minus its own side paddings), so proportions are identical at every device width.

**Pinned (every value measured LIVE off the running prototype, per LAW 8):** stone 180px, halo 11px/64px, glyph 53px (the
frame's own scale .91 rendered); date 15px/6px tracking; title 36; sub 16; rhythm 56/72/38/4/18/78 fixed (replaces vh tuners
under 2c); planner = the 2c recipe (#8a5cf0, r22, 12/24, 0 4px 0 #4e2f96, Baloo 16.5) superseding the old .tbx-plan lock on
this face; shelf top-grid tiles = the DECK CARD verbatim (50 face, r18, glyph 22, lip 0 4px 0, full-size 50x50 shards at
-3/-6) so row one and row two read as one card at the landing; folders 3 cols, gaps 15/17, pad 0 18, 30px preview chips gap 7.

**Gates:** audit now 58 checks — stone-180 replaces the 52vw gate on 2c (frame-wins), tile geometry 2c-branched (TBX_S2C=50;
non-2c keeps 54 byte-identical), planner recipe, folders-3-col, both column caps, halo 11/64, rhythm band. ALL PASS at 375
AND at 430x932 (verified live at David's width: stone 180, folders 3x101, columns 362/370, deck seats 159, gap 25, 0 fails).
Both landings screenshot-diffed at 430 against David's expectation frames.

**Superseded locks, named (frame-wins 2026-08-14):** 52vw circle tuner lock; .tbx-plan old recipe ON THE 2c FACE; the 54px
stack-card law on the 2c shelf grid (picker/editor keep 54). Night/claim/break inherit the pinned board (flag open if ugly).

**DEVICE-UNTESTED:** the board computes ~918px at 430x932 — fits with ~14px slack in the planner→deck gap, the tightest number
in the build; on a ≤812pt phone the TOOLS hint sits under the fold. Only the phone judges both.

## v1277 — ROUND 3 FIDELITY (David's five: planner height, HUD icon, row gap, scale, folders) + THE MACHINE DIFF

All five, measured off the running prototype and gate-locked (audit 58→63, ALL PASS at 375 AND 430x932):
- HUD left = the You door as the design's BARE glyph: ti-adjustments-horizontal 18px #ff8fc0, no ring, no fill (the
  bordered sparkle chip was the exact variant the design's own default rejects). Handler untouched.
- Planner wrapper translate 0 12px + scale 1.06 (the frame's literal transform — this WAS "the planner looks too high").
- Deck row scale .96 (renders 48 on the 50 box, the frame's own hierarchy vs the 50 grid).
- Landing deck→grid gap 25→11 (ground pull -44→-58, derived by measurement; gate tightened ≤60→≤20).
- Folders = the authored recipe verbatim: 98px tall (David's tuned value, not the 95 default), r18, wash color-mix(hue
  12%, #120a12), lip 0 4px 0 color-mix(hue 16%, #000), pad 8 6 5, chips 30/r10/0 3px 0 deep/glyph 14, label Baloo 800 12.

**NEW TOOLING: `_dev/design-diff-2c.js`** — the full-surface machine diff (every mapped element, prototype vs app,
computed styles + rects). Born from David's "why don't you know? fix it so I don't have to tell you": the per-gate
approach only watches named numbers; the map watches everything. It already earned its keep twice in one hour: caught
the folder drift, then nearly poisoned the build with the FROZEN-CASCADE TRAP (the prototype's shelf rows report their
keyframe from-state — translateY(22) scale(.9), opacity 0 — while parked; the Opus builder caught it with the
authored-vs-animated test now documented in the file header). Read that header before trusting any dump.

DEVICE-UNTESTED: the five fixes' feel on the phone; the deck seat grows with viewport height (168px at 430x932).

## v1279 — ROUND 4: THE HEAD-ZONE ANCHORS + THE 1:1 GEOMETRY LAW (David: "positions off / streaks off / settings off")

**The last systemic hole, closed:** the app had never been verified at the design's own geometry. The frame is a 402x874
iPhone 16 Pro — WHICH IS DAVID'S ACTUAL PHONE — with the status bar drawn inside it, so its coordinates are safe-area-
ABSOLUTE. The app was adding real safe-top on top of offsets that already assumed one: the whole head zone rode 18-43px off.

**The machine diff ran at 402x874, both surfaces parked at the home landing, rect.top/cx compared 1:1** (harness now dumps
positions). Fixes, all frame-measured: HUD row top 42 + its authored translateY(12) (renders 54; no safe-area term under 2c);
the You button's own slider transform (scale 1.5 from left center, icon renders 27 — "the settings button is off"); leaf
scale 1.1/+7; home pad-top 42 + strip margin 40 + its authored translateY(13) (bar at ~95 — "the streaks are off"); landing
parks FLUSH (the 12px sky peek was the pre-2c face's law); TOOLS hint pad-bottom 20; zone-owned side padding (home 20 /
ground 16 — hero cards 370, deck and grid tiles left-aligned to 0.3px); dose host display:none when empty + wrap margin 6
(home = EXACTLY one frame, 874/874 — the 887 excess would have put the chevron 13px under David's fold); ground pull
re-derived -58→-54 (hand-off 11px, the prototype's value).

**Final table at 402x874 (app vs frame):** HUD 54/54 · bar 94.7/96 · date 178.7/181 · stone 272.2/274.4 · title 490.2/492.5 ·
sub 552.2/554.5 · planner 603.7/606 · deck 723.8/725.7 · hint bottom 873.7 flush. The uniform -2.3 residue has one named
cause (our strip block is 41 tall vs the frame's 43 — chevron sizing) — David's call if it matters.

**Gates 63→71, ALL PASS. Standing law:** 2c design verification runs AT 402x874 (the frame's and David's shared geometry);
style-based gates (pad-top 42, margins, scales) hold viewport-independent; "home zone is one frame tall" (<= clientHeight+2)
catches the under-the-fold class mechanically.

Builder corrections worth recording: my diff read past two AUTHORED translates (HUD +12, strip +13) — the authored-vs-animated
test (layout+transform only = authored) separated them from the frozen-cascade artifacts again; and my -45 pull estimate was
wrong because 9 of the 13 excess px lived INSIDE the wrap (measured -54 is right).

DEVICE-UNTESTED: the head zone against the real island; the seat at 145 (design 139, flagged not tuned); all feel.

## v1281 — ROUND 5: THE LAST THREE RESIDUES (±0.3px board, tools chain ±1)

From the tools-landing layout diff + the strip flag: hero cards ported verbatim from the frame (coins 38/r12/lip 3,
glyph 17, kicker 9/1.5, title Baloo 17, play 46 with ink glyph — card lands EXACTLY 80, height driven by the frame's
own two-line kicker at 402); grid→hero hand-off 16 (first card mt4, the frame's own asymmetry — card 2 carries none);
caption 11.5px (the frame's size, found closing the folder chain); strip pills row 15 tall (block 43) → the whole board
now sits within ±0.3px of the frame; home stays EXACTLY one frame (the +2 came out of the app-only wrap margin, never
the hint's measured 20); pull re-derived −54→−52 (hand-off 11).

**The gates caught ME this round:** an eyeballed "fix" (kicker nowrap) dropped the card to 72 — the hero-card-80 gate
failed the ship instantly; the wrap IS the frame at 402. Reverted with the reason in the CSS comment. This is the
system working: drift cannot ship, including mine.

Audit 74/74 at 402x874 (David's device geometry). Tools chain vs frame: hero1 184/185 · hero2 276/277 · caption
367/368 · folders 413/414. Residual, named: deck seat 130 vs frame 139 — the same wMeasurePad law applied to our
24px-taller hero content; gate-inside, David's eye decides. DEVICE-UNTESTED: all feel.

## v1283 — THE RENDERER RAZOR EDGE + THE PHONE MEASURES ITSELF

David's 6:41 device screenshots vs his Claude Design view exposed a class no geometry diff can catch: PER-RENDERER FONT
METRICS. The hero kickers ("FOR YOU NOW · MORNING") fit one line in Claude Design on his Mac and WRAP on his iPhone —
the same 9px/1.5 text differs by ~2px between renderers. His design view is the truth: kicker nowrap + the card pinned
min-height 80, so phone/Mac/preview all land the same card no matter whose rasterizer wins. (This same edge bit twice
today in opposite directions — the earlier nowrap revert was Chromium wrapping where the frame seemed to; the gates
held 80 both times.)

NEW DEV TOOL: "📐 Design audit (this phone)" in the dev menu — runs all 74 gates ON THE DEVICE and renders the report
full-screen (version · viewport · safe-areas · FAILs lifted to the top in red). David's phone now reports its own
numbers: two taps + a screenshot replaces "spell out every mistake." The remaining preview-vs-device gap is exactly
what this measures.

Audit 74/74 at 402x874, kicker 13px one-line, hero 80, home 874/874, ratchets clean. DEVICE-UNTESTED: the overlay
itself on iOS (scroll/safe-areas) and whether his phone's gates agree with the preview's — that is the point of it.

## v1286 — THE ARTBOARD FILL (the saga's closing move) + COPY REPORT

David's on-device audit ended the mystery: his phone is an iPhone 16 Pro MAX (440x956) and every gate PASSED on it —
the app rendered the 402x874 artboard design-exactly but LETTERBOXED, while Claude Design fills its phone mock. The Max
is the Pro scaled exactly (440/402 = 956/874 = 1.0945), so the fix is ONE uniform scale of the whole 2c face.

Mechanism (builder round 6; my zoom attempt was replaced — dvh/fixed resolve inconsistently under `zoom`, the exact
cross-engine razor edge): `--tfscale` = clamp(vw/402, 1, 1.15) + `.tf-scaled` on #trackerFull; .tf-inner pinned to
402 x (100dvh/scale), transform translateX(-50%) scale(s), origin top center; .tfw-home min-height:100% under scale;
wMeasurePad safe-area terms /s (its k divisor was already scale-true); tfhRevealCard's rect/layout mixer fixed; 13
rect-based gates normalized by one helper; new "board fills the phone" gate; the one-frame gate widened to
max(874, clientHeight)+2 (a shorter phone than the artboard is a device fact, not a build failure — still catches 887).

VERIFIED at 440x956 / 402x874 / 375x812: scale 1.0945/1/1, board renders 440/402/375 wide, home layout 874 at all
three, board tops IDENTICAL at scaled and unscaled within 0.4px of the frame, landing flush/seat 129/gap 11, audit
ALL PASS x3, zero console errors. Also shipped: COPY REPORT button on the on-device audit overlay (David: "make it
automatically copy pastable") — clipboard first, prompt fallback.

DEVICE-UNTESTED: the scaled face on real iOS (text sharpness under transform, scroll feel through the scaled world,
the audit overlay's copy button), the puck (body-level, deliberately unscaled app chrome).

## ONE MOVE (per COFOUNDER.md, session close 2026-08-15)
- **David:** open v1286 on the phone — it should finally match Claude Design edge-to-edge. Two words if anything's off: "soft" (scaled text) or "scroll" (feel through the scaled world). Standing verdicts when rested: Night-Stack-vs-Body in row two; the $99 Apple enrollment (decided, just needs doing + LEDGER line).
- **Claude:** on David's verdict, close the 2c surface for good; then the next design work is the JOURNEY ZONE ("ill fix the journrey after" — the deferred half of the handoff), which now runs through _dev/DESIGN-PORT-CHECKLIST.md from step one.

## v1288 — ROUNDS 7+7b: THE DESCENT FIX + THE CHOP + HOME ARRIVES LIKE THE TOOLS

David's three device notes on v1286, one round: (1) DESCENT — coming down from the journey bounced back up:
wSnapIntent's above-home branch never read direction (harmless in the design's one-screen sky, a trap in our tall
trail — any pause in the (-vh, -0.45vh) band snapped BACK to the sky seat). Now an explicitly-descending gesture
targets home; unknown direction keeps the old rule so trail-readers are never yanked. 9-case wIntent battery PASS at
both viewports, notes 20/25/28 intact, armDown reasoning verified (the fix is what lets the mid-glide arrival fire).
(2) CHOP — tcCascade forced 17 per-row reflows mid-scroll; rebuilt on the hcFlush batch pattern (1 reflow), emitted
animations byte-identical. Remaining live-path reads named in the builder report, none added. (3) HOME ARRIVAL = the
tools recipe in reverse (David: "similar to the way tools appears except in reverse order"): homeRise/homeDrop now
pop (22px + scale .92→1, 0.42s, spring bezier, 55ms stagger), bottom-up from tools / top-down from journey; the strip
keeps its sweep (own ease — overshoot there reads as wobble) retimed to the new step; EXITS UNTOUCHED (he called them
good). Audit 75/75 both viewports, zero console errors.

DEVICE-UNTESTED: descent feel, whether the batching kills the chop, and the stone scaling under its halo during
arrival (if it janks: drop scale from homeRise/homeDrop for #tfRing alone — one line).

## v1298 — THE STALE-SHELF BUG (the real "home screen was broken") + the blue-disc explanation

David asked why the disc was BLUE last evening and why simming evening didn't reproduce it. Answer: the blue stone is the
UP-NEXT face — a PLANNED BLOCK due within TF_UPNEXT_MIN (10 min) makes the disc wear that block's DOMAIN hue + the 115deg
stripes ("Next: <block>", "starts at HH:MM · play begins it now"). Focus = #36b3f0 = blue. It is DATA-driven, so the clock
sim alone can never reach it. Evening's own adaptations are separate: 17:00 phase→evening (guardian close-the-day, journey
pm node, "evening · one gentle thing?"), 18-21 island dusk, 20:00 heroes→WINDING DOWN·Night Stack, bedHour()→the NIGHT face
(VIOLET moon disc — the only evening thing that recolours the stone, and it is violet, never blue).
NEW: DEV.upnext() + dev-menu row "🔵 Sim: next block due (blue disc)" — plants a removable focus block 5 min out (sim-aware
via logicalNowMin) so the up-next face is one tap away; tap again / DEV.upnext('off') removes it. Optional domain arg.

**THE REAL BUG, found while reproducing it (not evening-specific — it fires on EVERY face, EVERY hour, once a minute):**
renderToolbox2 rebuilds the shelf's rows on every render, so the nodes tcCascade had hidden were replaced by fresh ones with
no inline state = VISIBLE, while _tcShown/_tcHard stayed latched so no hide branch could re-fire. At home rest the tools
shelf lit up over the board (it is pulled -52px under the TOOLS hint) and stayed lit — and the master tick re-renders every
minute. FIX: tcResync(force) re-reads the list and re-arms the latches, driven by tcResyncSoon() — a 0ms coalesced timer
fired at the END of renderToolbox2. Deferred deliberately: hooking renderOnePageWorld and even the renderer's own tail both
FAILED verification (one action can run the renderer again afterwards, and the world's classes aren't set yet mid-pass, so
wLive() was false) — the timer runs after the whole pass, whatever order the renderers took. That debugging chain is the
lesson: an invariant that must hold AFTER a render pass belongs on a deferred tick, not inside the pass.
Verified by STATE (opacity readings lie in a hidden pane — the frozen-cascade law): home = shown false + pointer-events
none + inline opacity 0 through repeated re-renders; tools = shown true + events restored; return to home re-hides. Audit
75/75 at 402x874 AND 440x956, idle AND up-next faces, zero console errors, ratchets clean.
Also: the fold-hint gate floor is now -1.5px (was exact 0) — under the artboard scale a rect ÷1.0945 carries sub-pixel error
and the up-next board is 1px shorter than idle's, which failed a ship for a hint that is not clipped. Flagged as a widened gate.
DEVICE-UNTESTED: whether the once-a-minute shelf pop is the "broken" David remembers (very likely), and all feel.

## v1301 — PORTRAIT LOCK + the stale-scale bug it exposed

David: "can we prevent the app from going landscape". manifest.json has declared "orientation":"portrait" since day one —
iOS IGNORES it for home-screen PWAs, and screen.orientation.lock() throws on iOS Safari outside true fullscreen, so neither
standard path works. The lock is therefore CSS: #rotGuard, a full-screen panel (ti-rotate-rectangle + "Turn me upright",
Gate-1 clean + RU) shown purely by `@media (orientation:landscape) and (max-height:520px)`, z-index above every surface
including the start screen and the dev overlay. The max-height bound keeps it off desktop/tablet windows (and the preview).
Built in JS at boot rather than written into index.html so the line passes tr() like every other string.

**Bug it exposed (would have read as "broken" on device):** --tfscale was computed ONLY inside renderOnePageWorld, so any
viewport change — rotation, the keyboard, iOS's URL bar — left the board at the OLD viewport's scale until the next render
(up to a minute on the master tick). Rotating into the guard and back is exactly that path; measured 1.15 stuck at vw 440
(board 462 wide on a 440 screen) before the fix. Extracted wApplyScale() and drove it + wMeasurePad() from the resize
listener at @SEC:BOOT.

Verified: landscape 874x402 and 956x440 → guard covers the screen; portrait 440x956 → display:none; full rotate round-trip
returns scale 1.0945, board 440 full-bleed, audit 75/75, zero console errors, ratchets clean.
DEVICE-UNTESTED: the guard on real iOS rotation (incl. the standalone home-screen PWA, where iOS may still rotate the
chrome), and whether 520px is the right height bound for his phone's landscape.

## BUG + FIX SPEC — voice dies on screen lock (David 2026-08-23, M3 lane; NOT built, Fable session)
SYMPTOM: screen off mid-session: music/beds keep playing, the VOICEOVER stops. David wants
the player to keep running completely with the screen off.
ROOT CAUSE (read, not guessed): @SEC:TTS installs
  document.addEventListener("visibilitychange", function(){ if (document.hidden) stop(); })
  (+ pagehide -> stop). Locking the phone fires visibilitychange(hidden) -> TTS.stop() kills
  every scheduled voice source. The bg beds (@SEC:AUDIO bed loops) have no such handler, so
  they keep playing. The player ALREADY pre-schedules all remaining clips on the shared
  AudioContext (startFrom: "schedule every remaining clip up front"), so the voice would
  survive lock if TTS.stop() did not execute-kill it.
THE FIX (small, targeted; Opus build):
1. Session-audible guard: on hidden, stop() ONLY when no session is running. The flag half-
   exists: voiceSessionAudible() reads gp-playing. Extend it to also cover breathwork()'s
   engine (its clips ride the ctx clock too). pagehide keeps stop (real exit).
2. Audit the breath CUE/TONE schedulers (@ ~12156): if any per-phase hit() is fired from the
   rAF loop, move it to schedule-ahead on ctx time (a whole act ahead, topped up while
   visible). rAF is frozen when locked; anything it triggers dies with the screen.
3. Keep-alive: while gp-playing with NO bed selected, run a silent looping source on the
   shared ctx so iOS keeps the audio process alive.
4. Resync on unlock is already inherent (curElapsed = offset + ctx.currentTime - baseCtx);
   verify finish()/points fire correctly when the end passed while locked.
VERIFICATION IS DEVICE-ONLY: preview cannot lock a screen. Protocol: start a 5-min stack,
lock at 0:30, unlock at 3:00 — voice continued through an act boundary, transport shows
~3:00, session completes and logs. Anything less is DEVICE-UNTESTED.

## PART 2 of the lock-screen build (David 2026-08-23): the iOS now-playing card
SYMPTOM: with the screen off / player closed, the lock-screen media card shows
"dmekibel.github" (the domain) as the title, with no useful controls.
WHY: the page plays audio but never sets Media Session metadata, so iOS falls back to
the site domain.
THE FIX (same build as the voice-survives-lock fix, they are one feature):
1. navigator.mediaSession.metadata = MediaMetadata({ title: the running stack/session
   name (e.g. "Morning Stack" / the tool name), artist: "ALTER", artwork: the app icon
   192/512 from the manifest }). Update on act change if the act name is the better title.
2. Action handlers wired to the REAL transport (timelinePlayer's startFrom/curElapsed):
   play/pause -> the player's own pause/resume; seekbackward -> startFrom(curElapsed-15);
   seekforward -> startFrom(curElapsed+15); 15s explicitly via seekOffset. Seeks must
   re-schedule the voice tail exactly like the in-app scrub does.
3. iOS quirk: lock-screen controls attach reliably when a media element exists — if the
   silent keep-alive (fix #3 in Part 1) ships as an <audio> loop instead of a Web Audio
   loop, it doubles as the Media Session carrier. Decide in-build which carrier works on
   David's iOS version; verify on device.
4. RU: the title passes through tr() like every other user-facing string.
VERIFY (device-only): play a stack, lock: card shows the stack name + working pause and
both 15s buttons; pause from the lock screen pauses the in-app transport too (state
stays consistent on unlock).

## PART 2 ADDENDA (David 2026-08-23, sent to the build in-flight)
- Lock-screen progress = WHOLE STACK time (setPositionState duration = full transport
  total, position keeps climbing across acts, never per-act; guard NaN).
- App-switch/backgrounding keeps playing, same guard as screen lock; audited other
  hidden-listeners (appMusicSync) so nothing else kills a live bed.
- Artwork = the stack's own designed emblem per the locked stack-card grammar
  (stkCard() + the .stk CSS block): hue face on own-hue lip, white glyph, two shards
  fanned up-left, running stack's real tool colors, 512px canvas on #14060f; re-rendered
  at act boundaries with the current act's hue as the face. Dynamic Island itself is
  native-only; we feed artwork to the lock card + expanded now-playing (device-tested).
