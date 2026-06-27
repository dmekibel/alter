# SPEC — UI: make it addicting / welcoming (`ui-addiction`)

Cluster from `GRAND-AUDIT-2026-06-26.md` → "UI / UX / design" (~376). Source asks:
- "use color in a tactical way to make the all addicting like fortnight or Instagram" (2026-06-21)
- "take inspiration from all the best apps/ sites like Instagram … super inviting and clever and multifaceted" (2026-06-21, ×3)
- "the app is intimidating it should be more welcoming and more clever" (2026-06-21)
- "the bubbles need to feel more fun to interactive they are squares with rounded edges but still should feel bubbly" (2026-06-22)

These are all **subjective / aspirational** in the audit (each marked partial, no discrete deliverable). This spec turns them into concrete, ON-PALETTE micro-changes. The win here is **tactility + motion + tiny reward moments**, NOT new neon color.

---

## ⚠️ READ BEFORE BUILDING — the hard constraint that defines this whole cluster

The audit says "addicting like Fortnite/Instagram" and "bubbly". The naive reading is glow, shine, bright neon, shimmer. **That reading is FORBIDDEN.** `HANDOFF-visual-redesign-2026-06-27.md` locks:
- AVOID neon glow, colored outline-glows, "iPhone neon air-hockey", shine/foil internal reflections (all explicitly rejected by David, repeatedly).
- Bubbles sit DARKER than the now-line; the **pink now-line is the brightest thing on screen**.
- Deep berry/wine palette; deep-jewel domain fills with SUBTLE low-contrast diagonal stripes; ink edge `#160510`; no white surfaces.

So "addicting/bubbly" must be delivered through **physics and timing, not luminance**: spring press-in, squash-and-settle, haptic taps, a satisfying tap-create pop, a calm "you are here" pulse, smooth weight on drag. Color stays where it is. Every change below is composited on `transform`/`opacity` only (GPU-safe during scroll + pinch — the render is fragile, see Risks).

**Note on dead CSS:** `index.html` still defines `.calblk .foil`/`.shine`/`.sched .foil` (lines ~521-528) but the current bubble render (`app.js` ~2242-2249) sets backgrounds inline and never appends `.foil`/`.shine` nodes — so they are inert. Do NOT re-wire them. If anything, a cleanup pass could delete them (out of scope; flag only).

**Current file version:** `index.html` ships `app.js?v=571` (handoff said 561 — it has moved on). Ship via `bash _dev/preship.sh` which auto-bumps.

---

## Shared helpers (reuse — do NOT reinvent)
`add(p,tag,cls,txt)` (app.js:1313), `el(id)`, `DOM` palette (app.js:249), `mixHex(a,b,t)` (app.js:286), `esc` (285), `fmt`/`dur`/`hm` (92-94), `blocks(k)`/`logs(k)` (1240-41), `save()` (1200), `tiIcon`/`tiClass` (301-302), `domainOf`/`domColor` (274-283), `celebrate()` (317), `navigator.vibrate` (used at app.js:320,2291,2302…). Haptic pattern in the codebase: `try{ if(navigator.vibrate) navigator.vibrate(9); }catch(e){}`.

---

# FEATURE 1 — Bubbles feel bubbly (springy press + squash-settle)

**(1) Ask:** "the bubbles need to feel more fun to interactive they are squares with rounded edges but still should feel bubbly"

**(2) Buildable?** YES.

**(3) APPROACH** — pure CSS, no JS:
- Today `.calblk:active{ transform:scale(.98); }` (index.html:230) is a flat shrink — reads "button", not "bubble". Replace with a two-stage squash so it presses IN like a gel button: scale down slightly *non-uniformly* (squish wider-than-tall) on press, then the existing `transition` (line 228 already has `transform .16s cubic-bezier(.2,.85,.3,1.3)`, an overshoot curve) springs it back on release.
  - `:active` → `transform: scale(.96, .93);` (squash) + a faster press-in curve so the down-stroke is snappy but the release overshoots.
  - Bump the corner radius of `.calblk` from `16px` (line 228) to `18px` — slightly rounder reads "bubble" not "card". (Keep ≤18; David rejected the crystal/diamond shape, and pill-round breaks the timeline stripe geometry.)
- Add a one-shot **"pop-in"** when a bubble is freshly created/opened (see Feature 2) reusing the existing `@keyframes celePop` (index.html:540) — already a `.6→1.05→1` overshoot, perfect "bubbly" birth.
- Increase the corner echo on the resize grip is NOT needed.

**(5) UI sketch (on locked palette):** unchanged colors. On finger-down the deep-stripe bubble visibly squishes (~3-4% wider than tall), on release it springs back past 100% then settles — the existing `cubic-bezier(.2,.85,.3,1.3)` already overshoots, this just gives it something to spring FROM. Now-line still brightest; bubbles still dark jewel-stripe.

**(4) CODE POINTERS:**
- `index.html:228` `.calblk{ … border-radius:16px; transition:transform .16s cubic-bezier(.2,.85,.3,1.3),box-shadow .14s,top .22s …,height .16s,opacity .15s; }`
- `index.html:230` `.calblk:active{ transform:scale(.98); }`
- `index.html:515` `.calblk.lift{ transform:scale(1.05); … }` (drag pickup — leave, but consider scale(1.06) for more "lift weight")
- `@keyframes celePop` index.html:540.

**(6) DATA:** none.

**(7) REGION:** `index.html` CSS, `.calblk` block (lines 228-251, 510-545). **CSS-only — lowest conflict surface in the cluster.**

**(8) EFFORT:** S.

**(9) RISKS:** LOW. CSS-only, no render-path change. One watch-out: `#pullBody.zooming .calblk{ transform:none !important; }` (index.html:511) already neutralizes transforms during pinch — good, the squash won't fight the zoom. Verify on device that the spring doesn't make rapid taps feel laggy (the `.16s` settle is fine).

---

# FEATURE 2 — Tap-to-create feels alive (pop-in + haptic), tap-to-open confirms

**(1) Ask:** (bundles "bubbly to interact with" + "welcoming, not intimidating") — a created bubble should arrive with a satisfying pop, and any tap should give tactile confirmation.

**(2) Buildable?** YES.

**(3) APPROACH:**
- **Create pop:** `makeBlock()` (app.js:2421) pushes an empty block, calls `renderToday()`, then opens the editor. After render, the new bubble should pop in. Add class `celepop` to the freshly-created card on render so it plays `@keyframes celePop` once. Mechanism: `makeBlock` already finds `nb` by id; the render rebuilds the DOM, so set a transient flag like `b._justMade = true` on the new block and, in the plan-bubble render (app.js:2233 where the `card` className string is assembled), append `" celepop"` when `b._justMade`, then `delete b._justMade` after appending (one-shot, don't persist — and do NOT `save()` it into localStorage). Also fire a light haptic: `try{navigator.vibrate(9)}catch(e){}` inside `makeBlock`.
- **Tap-open feedback:** in `editBlk(b)` (app.js:2212) add a tiny haptic `try{navigator.vibrate(6)}catch(e){}` at the top so opening any bubble has a confirming tick (matches the drag-pickup vibrate at 2291). Keep it short (6ms) so it reads as a "tick", not the celebration buzz.

**(5) UI sketch:** tap an empty slot → a deep-stripe bubble *pops* into existence (scale .6→1.05→1) under your finger as the editor slides up, with a faint haptic tick. No color change, no glow.

**(4) CODE POINTERS:**
- `makeBlock()` app.js:2421 (inside `cal.addEventListener("pointerdown"…)` create handler 2411-2433).
- bubble className assembly app.js:2233: `var card = add(cal,"div","calblk lane "+stt+(b.pin?" pin":"")+(newlyPassed?" burning":"")+(newlyCele?" celepop":"")+(!b.title?" emptyblk":""));` — add `+(b._justMade?" celepop":"")` then `if(b._justMade) delete b._justMade;` right after.
- `editBlk(b)` app.js:2212.

**(6) DATA:** transient in-memory flag `b._justMade` (NOT persisted — set, render, delete same tick). No SCHEMA bump, no migration.

**(7) REGION:** `app.js` create/render handler (2233, 2411-2433) + `editBlk` 2212. **Overlaps Feature 5's render touch — coordinate; both edit the line-2233 className string region.**

**(8) EFFORT:** S.

**(9) RISKS:** MED — touches the timeline render (className string at 2233) which is HIGH-RISK fragile. The change is purely additive (append a class), so low blast radius, but: (a) the `emptyblk` already has its own dashed style — confirm `celepop` (a scale animation) composites cleanly over `emptyblk`; (b) ensure `delete b._justMade` happens so it can't replay on the next minute-tick rerender (the same class of bug the `b.celed`/`newlyCele` guard at 2229 exists to prevent — mirror that pattern). Do NOT `save()` between set and delete.

---

# FEATURE 3 — "Welcoming, not intimidating": warm the empty/first-run state

**(1) Ask:** "the app is intimidating it should be more welcoming and more clever"

**(2) Buildable?** PARTIAL → concrete version: an **empty day** is the most intimidating moment (a blank wall of hours). Make the empty timeline INVITING with one warm, human, on-palette prompt instead of a void. (Broad "be more welcoming" is unbuildable; this is the highest-leverage concrete slice. The suggestion engine `renderSuggest` app.js:362 + `proactive()` copy already soften tone elsewhere — don't duplicate.)

**(3) APPROACH:**
- When `blocks(k).length === 0` for the focused day, the timeline currently shows the `.plan-empty` dashed invite (index.html:563, "tap to choose"-style). Upgrade the COPY + presence so it feels like the guardian greeting you, not an error state. Keep it ONE element, low-clutter (locked rule). Use warm, second-person, time-aware copy via existing helpers: morning → "Let's shape a good morning ☀️", evening → "Plan a calm evening 🌙", else "Tap anywhere to start your day". Reuse the time-of-day branch logic already in the suggestion engine (search `morning`/`afternoon`/`evening` partitioning near app.js:336 `SUG_POOL` and `proactive`).
- Make the empty-invite gently breathe using the EXISTING `@keyframes nowPulse` (index.html:578) or a slow opacity pulse (`.plan-empty` at 563) so the blank day feels alive, not dead. Subtle only — David hates clutter.
- DO NOT add a modal, a tour, or onboarding overlay (out of scope + he rejects ceremony).

**(5) UI sketch:** Empty day → a single soft-pink dashed pill centered in the plan lane on the wine/navy sky: `☀️ Let's shape a good morning — tap anywhere`, gently pulsing. Tapping it (or anywhere empty) makes a bubble (Feature 2 pop). The now-line still reads brightest.

**(4) CODE POINTERS:**
- `.plan-empty` CSS index.html:563-564.
- Where `.plan-empty` is emitted in the render — grep `plan-empty` in app.js (it's drawn in `calendarView` near the empty-day branch; the cleanup CSS at index.html ~987 currently HIDES `plan-empty` per the handoff "removed dashed empty/future boxes"). **IMPORTANT:** check the cleanup block (`index.html` after `.calblk .calx:active` ~line 987) — it may set `display:none` on `.plan-empty`. If so, this feature must re-enable a SINGLE welcoming invite (not the old dashed boxes David killed). Confirm with David first via options (this is a DESIGN choice → options-first per CLAUDE.md), since he explicitly removed empty boxes.
- Time-of-day copy: model on `proactive()` (app.js:1168-1169) and `SUG_POOL` partitions (app.js:335-337).

**(6) DATA:** none.

**(7) REGION:** `app.js` `calendarView` empty-branch + `index.html` `.plan-empty` CSS and the cleanup-hide block (~987). **Conflicts with any timeline-layout work.**

**(8) EFFORT:** S (copy + one CSS pulse) if the invite is allowed; M if re-enabling a hidden element + reconciling with the "no empty boxes" rule.

**(9) RISKS:** MED. David explicitly REMOVED dashed empty/future boxes (handoff line 18). Re-introducing ANY empty-state visual risks a rejection. **This is a design choice → show 2-3 copy/placement options in chat first, let David pick, then build** (per `preview-design-options-before-building` memory). Do not ship unilaterally.

---

# FEATURE 4 — Tactical color reward: make completing a plan FEEL good (calmly)

**(1) Ask:** "use color in a tactical way to make the all addicting like fortnight or Instagram"

**(2) Buildable?** PARTIAL → concrete version: the celebration system exists (`celebrate()` app.js:317, streak tiers 306, confetti+haptics) but it currently leans on **gold/orange/neon glows** (`box-shadow … #ffd54a/#ff5a1a`, `.cele-box` glow at app.js:322-323) — which collides with the locked "no neon glow / now-line is brightest" rule and the "yellows are bad" open issue (handoff #3). Concrete deliverable: **retune the existing reward moment to the deep-berry palette** so it stays rewarding (the addictive bit) without the rejected neon. Don't build a new reward system; recolor the one that exists.

**(3) APPROACH:**
- `celebrate()` (app.js:317): the box glow uses `#ffd54a`/`#ff5a1a` (gold/fire). Re-tune so the celebration uses **the activity's own domain color** (it already receives `color`) for the fill, and replace the gold/fire outer glow rings with a SHORT, contained pop (scale overshoot via `celePop`, already applied) + the domain color — NOT an expanding glow. The confetti stars (`.cele-star`) can keep warm accents but should pull from the domain ring/light (`DOM[dom].light`) rather than hardcoded `#ffd54a`. Keep haptics (the tactile beat is the addictive core, David added it 2026-06-24).
- The streak chip (`streakTier()` 306-313) gradients are fine as a *contained chip* (not on the timeline surface). Leave the chip; it's a HUD element, not the bright-thing-competing-with-now-line.
- Keep it SHORT (the 1500ms auto-dismiss at 329 is good) — "addicting" = frequent small dopamine, not a long takeover.
- Confirm the now-line still visually wins during a celebration (the celebration is a centered overlay `z-index:95`, so it's transient and fine).

**(5) UI sketch:** finish a planned focus block → a quick centered pop in Focus-blue (`#36b3f0`) with `+25`, a couple of berry-toned stars flying out, a haptic beat, gone in 1.5s. No big gold glow ring. The timeline behind it: now-line still the brightest pink.

**(4) CODE POINTERS:**
- `celebrate(color, streak)` app.js:317-330 (esp. box.style.boxShadow 323, star colors 326, `cele-pts`/`cele-combo` 327-328).
- `.cele-box`/`.cele-star`/`.cele-pts`/`.cele-combo` CSS index.html:649-659.
- `streakColor` app.js:305 (yellow→red — consider berry→pink instead), `streakTier` 306-313.
- callers: `maybeCelebrateTrack` 333, `celebrate(DOM[dom].c, …)` already passes domain color.

**(6) DATA:** none.

**(7) REGION:** `app.js` celebrate/streak block (305-333) + `index.html` `.cele-*` CSS (647-659). **Self-contained — low conflict.**

**(8) EFFORT:** M (touches color in several spots; needs a device pass to confirm it still "feels" rewarding without the glow).

**(9) RISKS:** MED. This is COLOR/feel work and David has gone back and forth (handoff #5: "confirm before changing bubble brightness"). Reward feel is subjective → **options-first**: show 2 retuned celebration variants (domain-color-pop vs domain-color-pop + minimal sparkle) before committing. Don't touch the timeline bubble render here — celebration is an overlay, keep it that way so it can't regress the fragile timeline.

---

# FEATURE 5 — Drag has weight (best-app tactility on move/resize)

**(1) Ask:** "take inspiration from all the best apps (Instagram, Snapchat, Apple)… super inviting" + "bubbly to interact with" — best-app polish = things have physical weight when you move them.

**(2) Buildable?** YES (small polish on the existing drag).

**(3) APPROACH:**
- Pickup already adds `.lift` (scale 1.05, big shadow, app.js:2291 / index.html:515) + a 9ms vibrate. Make pickup feel weightier and the drop feel like a satisfying settle:
  - On drop (the `up2`/`clean()` path, app.js:2292/2301), the bubble snaps to its slot via the existing `top .22s` transition (line 228) — good. Add a tiny landing haptic on a successful reorder (`else if (wasMoved)` branch 2310) `try{navigator.vibrate(8)}catch(e){}` so the drop "lands". (Trash/convert paths already vibrate at 2302/2306-2309 — only the plain reorder at 2310 lacks it.)
  - Bump `.lift` to `scale(1.06)` and a touch more shadow so the lifted bubble reads "picked up off the surface" (best-app feel). Keep it under 1.08 (too big = clumsy).
- DO NOT change the gesture state machine (the hold-to-drag-vs-scroll arbitration at 2291-2297 is the fragile part rebuilt 3×). Only add the landing haptic + the `.lift` scale tweak.

**(5) UI sketch:** long-press a bubble → it lifts (1.06, deeper shadow) with a haptic; drag it; release → it springs into the slot with a soft landing tick. Pure motion/haptic; colors untouched.

**(4) CODE POINTERS:**
- `.calblk.lift` index.html:515 (and the dup at 231 — note TWO `.lift` rules exist; line 515 wins by source order. Edit 515, and reconcile/remove the 231 dup to avoid confusion).
- drag drop reorder branch app.js:2310 (`else if (wasMoved){ … reflow(k); save(); renderToday(); }`).
- existing landing haptics for reference: 2302 (trash), 2303 (cross-day), 2306-2309 (fling).

**(6) DATA:** none.

**(7) REGION:** `app.js` plan-bubble drag handler (2284-2314) + `index.html` `.calblk.lift` (231 & 515). **HIGH-RISK region (gesture arbitration). Add only the haptic line + the scale value — do not restructure.**

**(8) EFFORT:** S.

**(9) RISKS:** HIGH (region risk, not change risk). The drag handler is the most-rebuilt code in the app (CLAUDE.md regression contract). The actual edits are 1 haptic call + 1 CSS number — keep them surgical. **Gesture feel is DEVICE-UNTESTED in preview** (synthetic touch lies — CLAUDE.md). Label any drag change DEVICE-UNTESTED until David confirms on his phone. Re-verify the 4 regression-contract invariants after.

---

# FEATURE 6 — Calm "you are here" heartbeat on the now-line (the brightest, most alive thing)

**(1) Ask:** (synthesis of "addicting", "welcoming", "alive") — the single brightest element (now-line) should feel like a living pulse, drawing the eye to the present, IG-story-progress style.

**(2) Buildable?** YES.

**(3) APPROACH:**
- A `@keyframes nowPulse` (index.html:578) and `.nowpill` already exist but `.nowpill` is a separate element. The `.nowcirc` (index.html:568, the pink circle on the now-line) currently has a static `box-shadow:0 0 8px #ff5fa8`. Give the **now-circle** a gentle, slow heartbeat (reuse `nowPulse` or a 2.6s ease-in-out box-shadow pulse, matching `.nowpill`'s 2.6s) so the present moment subtly breathes. This reinforces the locked "now-line is the brightest thing" rule by making it the ONLY animated focal point.
- Keep it SLOW and LOW-amplitude (2.6s, the existing nowPulse already fades a ring out) — a calm heartbeat, not a strobe. David rejected neon/air-hockey; this is one soft pink pulse on the single allowed bright element.
- Do NOT animate any bubble glow (that's the rejected look). Only the now-circle.

**(5) UI sketch:** the pink now-circle on the left edge softly expands a faint pink ring every ~2.6s and fades it — "I am here, now". Everything else static and deep. It's the heartbeat of the timeline.

**(4) CODE POINTERS:**
- `.nowcirc` index.html:568, `.nowline` 566-567.
- `@keyframes nowPulse` index.html:578, `.nowpill` 577.
- now-line render in app.js:2200 (sets `.nowcirc` bg/icon inline — CSS animation is independent, no JS change needed).

**(6) DATA:** none.

**(7) REGION:** `index.html` now-line CSS (566-578). **CSS-only; minimal conflict, but touches the now-line which the handoff treats as sacred (must stay the brightest). Don't dim it; only pulse.**

**(8) EFFORT:** S.

**(9) RISKS:** LOW-MED. The now-line is the one locked "brightest thing" — a pulse must not make it look neon/air-hockey (the rejected vibe). Keep amplitude low; show David before/after. The minute-tick rerender (app.js:3082) rebuilds the now-line every minute — a CSS animation on the class will simply restart, which is fine (no JS state). Verify it doesn't visibly "snap-restart" each minute; if it does, the animation is short enough (2.6s) that it's imperceptible.

---

## Build order (lowest risk → highest)
1. **F1** bubbly press (CSS-only, S) — safe warm-up.
2. **F6** now-line heartbeat (CSS-only, S).
3. **F2** create pop + haptics (additive render class, S/M).
4. **F4** recolor celebration to berry (overlay only, M) — options-first.
5. **F5** drag weight (HIGH-RISK region, surgical, S) — DEVICE-UNTESTED label.
6. **F3** welcoming empty-state (design choice, options-first, M) — get David's pick first.

## Cross-cutting verification (every feature)
- Preview proves boot/render only. **All tactility (press spring, drag weight, haptics) is DEVICE-UNTESTED** — say so plainly per CLAUDE.md.
- After ANY timeline-touching change (F2, F5): re-check the 4 regression-contract invariants (continuous vertical scroll across days, past/started set-in-stone, tap-create/drag/tap-open, week-strip+now-pill track centered day).
- Keep the now-line the brightest thing; bubbles darker; no neon/glow/shine/white. Stripe geometry intact.
- Ship: `bash _dev/preship.sh` (auto-bumps `app.js?v=`), then commit+push+fresh.html.
