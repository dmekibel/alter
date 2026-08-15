# FOUNDATION RESKIN — "home is beautiful in EVERY state, never the old cockpit" (2026-07-21)

**David's directive (verbatim intent):** redesign the FOUNDATION first — the already-decided look laid out so that when he tests, the app is pretty and new, ALWAYS. "I never wanna see that old ugly cockpit." Build on a strong foundation before anything else; he's tired of testing a half-old shell. This is P0, ahead of B1/toolbox/journey.

**Why this is its own fresh session:** it is coherence-critical VISUAL work that must be screenshot-verified state-by-state. It is NOT a blind swarm (agents can't see the composite render) and NOT a tail-of-marathon squeeze. One focused Opus build, effort HIGH, screenshots proving each state before ship. The LOOK is preview-verifiable; only swipe FEEL is device-gated.

## THE ROOT (mapped 2026-07-21, live code)
`#trackerFull` is ONE element with SIX faces (renderTrackerFull, ~3719; state branches ~3747-3800):
- `st-idle` + `.tf-home` → the NEW-ERA home (What now? + dial + tools). **David APPROVES this.** CSS index.html ~1565-1608. THIS is the reference look for all others.
- `st-onplan` / `st-off` → TRACKING. **The "ugly old cockpit"** — old `.tf-ring` conic dial (~1716) + cramped Stop/Break/extend stack + the reward-collision layout. THE #1 offender.
- `st-break`/`breakup` → pause (reskinned partly v1174; make it match).
- `st-claim` → welcome-back gap. Old-era.
- `st-night` → nightlight. Old-era.

The home face is beautiful because of the `.tf-home.st-idle` overrides. Every other face falls back to the OLD base `.tf-ring`/`.tf-tile` (~1716-1717) = the ugliness.

## THE BUILD (slices; screenshot-verify EACH state before moving on)

**F1 — TRACKING face → new-era (the worst offender first).** Reskin `st-onplan` + `st-off` to the home face's language: the new-era dial (bezel + fill per HOME-PLAYER two-clock law: `[[alter-home-player-two-clock-law]]`, the stopwatch dial), big-friendly type (Baloo), new-era palette (STYLE-NEW-ERA), generous air. Controls minimal: Stop stays the one big primary (pink = commit per the color law, NOT the old green), Break/extend collapse to one quiet row. The +N/streak already moved to the reserved upper band (v1175 A4) — confirm it reads clean here. Kill the cramped 4-tier stack. Verify: force `st-onplan` AND `st-off` (seed a day + inject an `S.timers` entry; get past the start screen via the Start button / DEV) and screenshot both; they must read as siblings of the home face, not a different app.

**F2 — CLAIM + NIGHT faces → new-era.** Same language. `st-claim` (welcome-back) and `st-night` (nightlight) reskinned to match. Screenshot each.

**F3 — BREAK/PAUSE face polish.** Already functional (v1174); align its skin to F1's dial. Screenshot.

**F4 — the guided STAGE faces** (tool/journal/breathe corner-posed ring, `tf-staged`): confirm they read new-era or reskin. Screenshot.

**F5 — THE COMPASS-ROSE NAV** (the new menu system, per REDESIGN-BUILD R3 + the approved interactive mockup + HOME-PLAYER PART 7). Tab bar out; guardian puck bottom-left (home/mini-player/dial morph); doors (story-strip=planner, corner glyphs=journey/garden, avatar=You); vertical column with peeks. **LOOK ships live + verified; SWIPE arbitration behind `NAV_V2` if feel needs device iteration.** This is the biggest slice — may be its own session after F1-F4 land.

**F6 — PLANNER PAINT (P-A).** Block skins + scanner glow match the new-era home. Pure paint, no timeline structure. Screenshot.

## LAWS
- Colors ONLY from live `.tf-home` CSS or STYLE-NEW-ERA verified values, NEVER memory (the two-failed-mockups law).
- Regression contract intact (F1/F5 touch the cockpit + nav; F6 must not touch timeline structure). Ratchet: no new innerHTML wipe. No SCHEMA change.
- Kill-switch any structural/gesture change (NAV_V2 etc.); the LOOK reskins (F1-F4, F6) are pure CSS/skin and ship live once screenshot-verified.
- Every state screenshot-proven BEFORE ship. "Always pretty" is the acceptance bar — a single old-era face surviving = not done.
- Copy through both gates for any new line (minimal here — mostly skin).

## HOW TO FORCE EACH STATE IN PREVIEW (for verification)
- Past the start screen: click "Start" (Load save) or use a DEV jump.
- `st-onplan`/`st-off`: `DEV.seedDay()`, then push an `S.timers` entry `{id,title,start:Date.now()-20*60000,catK,color}` matching (onplan) or not-matching (off) a now-block; `DEV.cockpit()`.
- `st-break`: set `DEV.S().brk = {title,dom:'focus',start:Date.now()-90000,mins:0}` (open pause) or `mins:15` (timed); `DEV.cockpit()`.
- `st-claim`/`st-night`: via time-of-day logic or the persona fixtures (@SEC:DEV).

## SEQUENCE
F1 (worst offender, proves the approach) → F2 → F3 → F4, ship as ONE coherent "home is always beautiful" foundation. Then F5 nav (own session, biggest), then F6 planner paint. Only after the foundation is coherent + verified do B1/toolbox/journey resume.
