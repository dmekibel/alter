# WORLD-HOME — circle=stone law, popup tiers, v1189 bug ledger (2026-07-22, Fable)

## 1. THE CIRCLE = THE FIRST STONE (David's ruling, his own synthesis)
The home circle IS the journey's NOW stone. No zoom-out transition: **scrolling up simply reveals the next stone above** — "you were in the journey all along, the rest just wasn't visible." The NOW stone being bigger than the others is correct (it's the one you're supposed to do).
- The trail's path line must flow visually INTO the home circle (continuity; no duplicate current-stone in the sky).
- **First run, no plan:** the stone above home = the Intro/Open (onboarding-as-journey); "What now?" offers it. Going against the plan stays one gesture away (the ground tools + the switch) — the app ALWAYS allows it (standing law).
- **Phase A (buildable now):** visual continuity + reveal (trail ends into the circle; next stone appears on scroll-up; Intro as first stone when no plan).
- **Phase B (engine, own spec before build):** THE JOURNEY RESTRUCTURES FROM THE PLAN — the day's blocks appear as stones; journey = the tracker's forward view; ties into JOURNEY-OS Day Composer ("one glowing stone daily"). Do NOT blind-build; needs a data-model spec (plan→stone feed, ordering, what survives replans).

## 2. POPUP TIER GRAMMAR (the redesign law; census running)
One question decides a popup's tier: **can the app proceed without the answer?**
- **WHISPER (default for nearly everything):** a quiet guardian line docked under the status row, notification-style. Sits there; tap = unfolds (slide-down card, still dismissible); ignored = fades after a while. Never takes the screen. Demote here: welcome-back, gauge check-ins ("How's this week been?" / "Your space right now?"), lesson nudges, carry suggestions, celebrations-with-text.
- **MODAL (rare, earned):** ONLY (a) irreversible/data-destructive confirms, (b) the screen literally cannot render without the answer (true first-run gates). Everything else demotes.
- **SILENT/AMBIENT:** state feedback that needs no ack (gems, streak held) stays toast/celebration-level.
- Migration rule: demote ALL current interrupters to whisper first; promote back individually only if a real miss shows up.
- One visual family for the whisper + its expansion (slide-over-scrim grammar, new-era skin, gated copy). No new overlay ids: this REPLACES popup surfaces, not adds.

## 3. v1189 DEVICE BUG LEDGER (fix wave running; root causes to verify in report)
1. Doors rendered SQUARE: the `#trackerFull.tf-onehome .tf-homedoor{border-radius:0}` rule out-specifies the per-door rounded rules (CONFIRMED in code). Restore the tuned shape (18x80, inner-rounded 15px, #372254/#184630).
2. Doors must be anchored IN the home zone (scroll away with home), never viewport-fixed.
3. Door taps dead on device (planner/game navigation) — root-cause required.
4. Boot → scroll-up shows EMPTY sky until a later re-render "unlocks" it (adoption/draw order bug) — root-cause required.
5. The puck = the universal RETURN: fades in whenever not at home (scroll deviation > ~40% viewport, or any other surface); tap = smooth-scroll back to home inside the world (not a teardown). At home it hides.
6. The story strip scrolls NATURALLY with home (no exit animation, no fixed-position jump). Clock/gems row may stay fixed.

## 4. OPEN QUESTIONS FOR DAVID
- Whisper default confirmed? (Recommended: demote everything, promote back case-by-case.)
- Whisper placement: under the status row (rec) vs over the circle.
- Phase B trigger: build after the popup family + Phase A land, or sooner?

---

## 5. THE MOTION WAVE — living puck + world glue (2026-07-22, from David's video review of v1197. Fable spec; OPUS builds, effort HIGH, one session)
**Source of truth:** David's screen video (IMG_3566.MP4, frame-audited) + the APPROVED shape-shifter mockup `_specs/_newera-build/mockups/compass-rose.html` (the puck grammar lives in `.cr-puck`). His order: recreate the mockup's home-button→player morph at mockup proportions; journey trail close above the circle (connected, not floating); strip fades as the journey appears; fix dead thumb zones + empty-screen scroll-up; puck in Planner returns HOME (slide back right), never the cockpit; every menu opens with one beautiful animation. This section supersedes §3.5 (puck details) and amends §3.6 (strip now fades with reveal progress — David reversed this after seeing it on device).

### M1 — THE PUCK IS THE ONE LIVE OBJECT (mockup numbers are law)
`#guardPuck` becomes the ONLY minimized surface. Kill `.gp-mini` as a separate bar: `minimize()` (app.js ~10864, guided player) no longer builds `.gp-mini`; it sets the player overlay to `gp-min` (hidden) and feeds the session into `renderPuck()` (title, time, tool color, pause state). The ONE-LIVE-TIME-OBJECT law (renderPuck ~3539) inverts: instead of hiding the puck when `.gp-mini` is visible, the puck RENDERS the session. `#liveDock` stays retired.
**Geometry (from `.cr-puck`, scaled off the 296px mockup screen; add tuner vars `--tun-puck-w`, `--tun-puck-max`):**
- Anchor: `position:fixed; left:5.4vw; bottom:calc(2.9dvh + env(safe-area-inset-bottom))`. NEVER in-flow, never rides with any scroller. z above every pane incl. game (≥92).
- Idle: circle `clamp(56px, 17.6vw, 80px)`; body `#2a0f22`, border `2px #160510`, shadow `0 5px 0 #160510` (game-piece); inner dial 77% of height, `#ff5fa8`, `ti ti-home` icon. NO text, NO "Not tracking — tap to start" line (that string dies), NO extra buttons.
- Session: same element gains `.session`: width → `min(71vw, 340px)`, padding `0 12px 0 6px`; dial recolors to the live thing's color, icon = its icon; meta column fades in: title (Baloo 700) + second line (elapsed or "N left" — reuse existing strings only, no new copy). Paused: dial yellow + `ti-player-pause`, line 2 = existing paused string. On-plan tint stays on `--gpkring`.
- **THE MORPH (the exact mockup animation):** `transition: width .4s cubic-bezier(.4,.85,.3,1), padding .4s` on the puck; `.gpk-text{opacity:0; transition:opacity .3s}` → `.session .gpk-text{opacity:1}`. Replace the current `.3s cubic-bezier(.2,.85,.3,1)`. Idle↔session morphs in place — no rebuild, no reposition, no two-piece glide (the video caught the circle and bar as separate drifting pieces at 2:36).
- **ONE tap target = go home.** Remove `_discAct` per-state actions and the disc/text/tail split handlers (~3531-3533): the whole puck taps to `puckGoHome()`. Pause/break/extend/swap live where they already exist — the player, which is front-and-center at home (two-clock law). Visibility: hidden at home-center idle and while the full player overlay is open; visible everywhere else (planner, game, journey, sky/ground deviation >40% — existing `.puck-away` logic).

### M2 — PUCK RETURN, NEVER THE COCKPIT POP
**DAVID'S RULING (2026-07-22, resolves the a/b fork — the deeper answer): ONE ADAPTIVE HOME-PLAYER, not two screens.** "The full home adapts to what's happening — it turns into the player when you do the tools, and gets rid of certain buttons, so whether you're in the planner tracking something or doing a tool, it's the same player home menu." So: tapping home from ANYWHERE lands on the SAME surface (`#trackerFull`, the world home). That surface MORPHS its contents to the moment — idle: circle + doors + tools; tracking: the circle IS the running player (Stop/Break/extend), the tools/doors that don't apply this moment recede; a tool session: the circle becomes that tool's player. It is never a separate "bare cockpit" vs "full home" — it is one home that is also the player, shedding/adding controls by state. This IS the existing HOME=PLAYER two-clock law (`HOME-PLAYER-GRAMMAR-2026-07-20.md`, memory `alter-home-player-two-clock-law`); M2 makes the RETURN honor it. Build implication: the ONEHOME frame (status row + strip + doors + circle) should ride the TRACKING face too (today tools are calm-face-only — extend so tracking keeps the world frame, with only the controls that fit; do NOT strip it to a bare ring). Keep it a controlled extension of ONEHOME, not a new surface — regression-guard the tracking cockpit.
`puckGoHome()` (~3536): when `worldScrollBackHome()` declines (non-home pane), do NOT bare-`openHome()`-pop. New path: `returnHomeAnimated(fromPane)` — `#trackerFull` (the home world) enters with a transform slide while the pane parallax-nudges out, then `setPaneRest` housekeeping. Direction grammar (compass model): Planner sits LEFT of home → returning, planner exits stage-LEFT, home enters from the RIGHT ("back to the right", David's words). Game mirrors (exits right, home from left). Journey pane: settle-fade (it's a vertical neighbor, normally reached by scroll). Implementation: class-driven `transform` transitions on `#trackerFull` (`.tf-enter-right` → active) + outgoing pane `translateX(∓18%)` + slight dim, `~.45s var(--ease-settle)`, transitionend cleanup. Composited transforms only; no innerHTML wipes; `openHome()` internals (HOME_MODE/TF_MODE resets) unchanged.

### M3 — DOOR EXITS USE THE SAME CAMERA GRAMMAR
`wireHomeDoors()` planner/game taps (~5123-5130) get the mirrored exit: home slides out toward its edge, pane arrives — same duration/ease tokens, one helper `slideSurfaces(outEl, inEl, dir)` shared with M2. No fade-through-black, no instant swap anywhere on surface changes. (The raw finger-drag carousel path stays untouched — regression zone; only the TAP paths gain animation.)

### M4 — SKY GLUE: trail hugs the circle, strip fades, trail has ONE owner
- **Gap:** trim `#tfWorldSky` bottom padding + trail bottom margin so the lowest stone sits within ~14dvh of the home-zone top (tuner `--tun-sky-gap`; David locks on device, then designAudit gains check 13). The trail's path line extends its last segment INTO the circle's top rim (§1 law: "you were in the journey all along").
- **Strip fade:** extend `onWorldScroll()` (~5267): reveal progress `p = clamp((anchor − scrollTop) / (0.4·viewportH), 0, 1)`; set `#tfHomeBars` style opacity `1−p` (+ translateY(−8px·p)) directly — scroll-linked, no CSS transition needed, passive listener already exists, transform/opacity only. Restores to 1 at home. (Amends §3.6: still scrolls naturally with home, AND fades as the sky takes over.)
- **ONE trail owner:** replace adopt/release pair semantics with `ensureTrailIn(container)` — every renderer of the trail (sky path `renderOnePageWorld`, journey pane path, AND the pane-carousel drag-snap commit) calls it before showing. Kills the empty-journey shell David hit at 0:10 (drag path never reclaimed the moved `#jpTrail`). Keep the `worldScrollHome` skyReady gate.

### M5 — DEAD-ZONE KILL, MECHANICAL
Build `DEV.scrollAudit()`: samples a 5×10 `elementFromPoint` grid over the home viewport and reports every point whose winning element (or ancestor chain) would block a vertical pan (own pointer/touch listener that preventDefaults, `touch-action` stricter than pan-y, or an invisible overlay not belonging to `#tfWorld`). Then fix what it finds — known suspects: `initHomeAxis()` pointerdown armed at boot (~14699) though AXIS_V1 is dead → don't attach under ONEPAGE; old `.tf-stage` drag-to-close (`tfDrag` ~3511) hit region under onepage; any surviving invisible full-bleed layers (the `#tfBackdrop` relic class). Gate: scrollAudit clean before ship, and it joins the permanent DEV kit beside designAudit.

### M6 — ONE OPEN-ANIMATION GRAMMAR, APP-WIDE
One helper `animateOpen(el, kind)` using the EXISTING motion tokens (`--ease-settle`, `--ease-spring`, `--dur-enter`): sheets/pickers (What's-the-plan, Switch-to, block editor, Energy composer, Arrange-your-day, settings) = slide-up 24px + fade with soft settle (~.32s), scrim fade .25s, close reverses faster (~.22s); applied at each existing show call-site via class toggle on the persistent containers (NO new render paths, NO added innerHTML wipes — ratchet must not grow). Player expand/collapse morphs anchored at the puck: expand = player scales/fades up from `transform-origin` bottom-left (the puck point); minimize = reverse, landing as the puck's width-morph picks up. Cheap shared-element illusion; no FLIP library.

### SHIP + VERIFY (two ship points)
- Ship 1 = M1+M2+M3 (the puck + returns). Ship 2 = M4+M5+M6 (glue + grammar). Each: `bash _dev/preship.sh`, `DEV.designAudit()` 12/12, `DEV.scrollAudit()` clean (ship 2), boot clean in preview, planner regression contract 1–4 re-checked. Wipe-count ratchet must not rise.
- Honesty line every ship: boots clean in preview; morph/slide/scroll FEEL is DEVICE-UNTESTED — David confirms on phone.
- No SCHEMA change anywhere in this wave. No new user-facing copy (reuse existing strings; the "Not tracking — tap to start, or pick below" line is DELETED, log it in the handoff).
- After David device-locks puck size + sky gap via tuner: hardcode values, extend designAudit (13 sky-gap, 14 puck geometry via a planner-context `DEV.puckAudit()`).
