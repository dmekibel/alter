# HANDOFF — ALTER timeline visual redesign (2026-06-27)

Single-file app: `app.js` + `index.html`. **Ship loop:** `bash _dev/preship.sh` (syntax-checks app.js, auto-bumps `app.js?v=NNN`, regenerates `server.js`), then `git add -A && commit && push`. Never hand-edit `server.js`. Current version: **v561**.

This session was a long, frustrating visual-design iteration on the **day timeline**. Read this before touching the timeline so you don't re-break what's settled or re-litigate what's decided.

---

## THE #1 RULE LEARNED THIS SESSION
**Stop making mockups. Work in the REAL app and screenshot it.** David repeatedly rejected `show_widget` mockups as "weak / inaccurate / not how the app actually looks." Every accepted change was made in `app.js`/`index.html` and verified with `preview_screenshot`. To see the test day: set state via `preview_eval` (build `S.blocks`/`S.log` with `domain` keys + matching logs, `localStorage.setItem('alter_plan2', ...)`, reload, click "skip"). To see the **whole day from a distance** (best way to judge color/clash): `preview_resize` to `390x1500` and screenshot.

## DESIGN PRINCIPLES DAVID LOCKED IN (do not violate)
- **Evolution of the OLD striped design, not a redesign.** The original look (diagonal stripes, ghost-mode for missed) is the baseline. He hated every radical departure.
- **AVOID: neon glow, colored outline-glows, the "iPhone neon air-hockey" vibe, minimal/flat/"woo-woo/horoscope" looks, the crystal/diamond shape.** All explicitly rejected.
- **Bubbles:** deep/dark jewel fills with **subtle** low-contrast diagonal stripes (a texture, not a chaotic high-contrast pattern). Missed = ghost (dark hollow + muted domain outline). **No `.shine`/`.foil`** overlays (he hated the internal reflections). Ink edge (`#160510`), no colored glow.
- **The now-line must be the BRIGHTEST thing on screen** — bubbles always sit darker than it.
- **Text must be readable** — was unreadable as light-on-bright-stripe; fixed by deepening the stripes.
- **Full-screen, no clutter:** removed right symbol rail, day-separator pills, lane divider, dashed empty/future boxes, and (v561) the sheet/header/lanehead frames.

## CURRENT STATE (v561) — what's shipped
- **Day/night sky (sampled from David's 2 reference images):** DAY = deep **wine-red** `#280b19`, NIGHT = deep **navy-blue** `#1f1939`. Per-hour keyframe gradient `KF` in `app.js` (in the `// DAY/NIGHT (... v5)` block inside `calendarView`, ~line 2080): sky runs navy(night) → wine-red(day ~7a-6p) → navy(night), with moon + stars in the night hours.
- **Bubbles** (in `calendarView`, the plan-bubble block ~line 2140 + the straddle ~2150 + real-logs ~2249/2281): done = subtle deep stripes `mix(c,#160510,.62)/.73`; future = deeper `mix .74/.82` + opacity; missed/ghost = `mix(c,#160510,.86)` + outline `mix .32`; drift = `mix .82`. Text = `D.light`. Stripe period widened to 9px/18px.
- **Domain colors** = the real `DOM` object, `app.js` line ~249 (move `#ff8a3a`, nourish `#34d39a`, focus `#36b3f0`, create `#b07aff`, connect `#ff5fa0`, play `#ffc83d`, drift `#180608`).
- **Cleanup CSS** lives in `index.html` after `.calblk .calx:active` (~line 987): hides rail, day-sepauto/done/sep, plan-empty/backfill/startnew, lanediv; collapses `.day-stacksep` to a 10px invisible spacer; and (v561) strips `#pullSheet`/`#pullHead`/`.lanehead` frames.
- **Removed:** press-and-hold-on-empty → create bubble (v555). Empty bubbles are created by a quick tap only.

## OPEN ISSUES — David's latest words, in priority order
1. **"the rim that u still havent removed"** — he is furious it persists. v561 stripped every frame found in the DOM (sheet shadow/outline, header band, lanehead wine band). **If it's STILL there, get him to circle it in a screenshot** — it could not be located definitively by DOM inspection; do not guess again, ask him to point.
2. **He prefers the BLUE reference (image 1) vibe over the current** — "looks better with the blue background, everything except the yellows." Consider leaning the whole palette bluer / cooler, or making night dominate more.
3. **The YELLOWS are bad** — the `play` domain color `#ffc83d` (yellow) reads worst; rework it (deeper/less acid, or a different hue).
4. **The drift color is "not great"** — `drift` `#180608` / ink `#e0545f`; rework.
5. The reference bubbles are **vivid**; ours are deep/subtle. He's gone back and forth on bubble brightness — confirm before changing.

## NEXT (queued, after the look is locked)
- **Tracker Mode** — the swipe-up expanded live tracker. **Direction = the RING** he liked (mockup "#14 album-in-reward-ring" + "#11 radial dial"), NOT the crystal/diamond (rejected). Icon + title/time BELOW the ring; ring green while on-plan (the reward), red on drift; spark/streak row; labeled controls (Pause / Switch / Off-plan). Full state machine + the break-flow and the retroactive "claim/backtrack" reconcile flow were designed (see the synthesized spec in the workflow output `tasks/wgsn9hdvu.output` and `tasks/w0ghtuwm6.output`). The one genuinely-new primitive to build first = the **claim write-path** (log `[gap-start → now]` as a matched bar, then continue a live forward timer).
- iOS notifications/timer: David chose **"polish the web app first"** — do NOT set up Capacitor/Cloudflare push yet. (PWA web-push works home-screen-installed but a reliable background timer alarm needs native or a server; storage can be evicted after ~7 days — the export/import/merge backup mitigates that.)

## REFERENCE IMAGES
David's two refs are at `/tmp/day_red.png` (day = wine-red) and `/tmp/night_blue.png` (night = navy-blue) — converted from `~/Downloads/tg_image_728565297.tiff` and `tg_image_1626763518.tiff`. Sampled bg: day `#280b19`, night `#1f1939`.
