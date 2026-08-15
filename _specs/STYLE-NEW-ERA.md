# STYLE-NEW-ERA — the canonical skin reference (2026-07-19)

Born from a failure: two mockup batches missed the app's look (batch 1 = old-era neon + hard game-piece ink shadows from :root tokens; batch 2 = invented gray-muted sludge). David: "system failure... stick to the colors of the app." This file is the single source of truth for the NEW design era. Every mockup and every new surface composes ONLY from here.

## THE TWO ERAS (the trap that caused this)
- OLD era (still in index.html :root): daytime pastel sky, Fredoka, neon --pink #ff4fa0, hard #160510 ink borders, offset box-shadows (game pieces). Live in legacy surfaces. NOT the target look.
- NEW era (the core-redesign Planner + What-now home David screenshotted 2026-07-19): berry-night ground, soft rounded blocks, stripes as texture, glow only on the NOW/active element, chunky soft tiles. THIS is the target. When in doubt: new era wins.

## PALETTE — VERIFIED FROM LIVE APP (2026-07-19, read via preview_eval getComputedStyle on the real onboarding cards + grep of app.js). These are EXACT built values, not transcriptions. Use these.
Ground / chrome:
- App ground gradient (onboarding/cockpit surfaces): `linear-gradient(180deg,#2a0d1c 0%,#1c0814 45%,#160510 100%)`
- body base: #1c0612
- Deep ink (borders, shadows): #160510  (ALL borders + hard shadows use this one near-black)
- Primary text (headings): #fff2f9 / #ffffff, font Baloo 2 (var --bub), big + 800 weight
- Secondary / subtitle text: lilac #b39ab0 to #c9a6bf
- Quiet labels: #7d6486 / #a07fa0
- Gold (currency/earned): #ffd24a readout, ring #ffc41f

THE FRIENDLY CARD (verified from the "All tidy / Lived-in / Full chaos" onboarding cards — THIS is the calm friendly language, use it for toolbox cards):
- fill: #35142a (dark plum)  ·  border: 2.5px solid #160510  ·  radius: 17px  ·  shadow: 0 5px 0 #160510
- The shadow is dark-on-dark (same #160510 as ground bottom) → reads as a SOFT lift, not a loud game-piece. That subtlety is the whole secret.
- COLOR COMES FROM THE ICON, NOT THE FILL. Card stays plum; a ~30px line icon carries the domain color. (My past failure = saturated color fills. Never fill a browse card with a saturated color.)

DOMAIN JEWEL COLORS (exact, from DOM{} in app.js — these are the icon/accent colors):
- move #ff8a3a · nourish #34d39a · focus #36b3f0 · create #b07aff · connect #ff5fa0 · play #d99f30 · restore #2ab8c4 · upkeep #7f9bc4 · drift #565b66
- onboarding icon greens/blues seen live: #46e2a4 (green), #36b3f0/#5ec4f5 (blue), #ff8a3a (orange)

NOW / HERO EMPHASIS (verified): glow ring on the active/for-right-now element only:
- box-shadow: `0 0 0 2px #ff5fa8, 0 0 18px rgba(255,95,168,.42), 0 3px 0 #160510`  ·  NOW pill: #ff5fa8 bg, white text

TIMELINE STRIPED BLOCK (when echoing the planner blocks): `tfStripe(C)` = `repeating-linear-gradient(45deg,C,C 9px,mix(C,#160510,.42) 9px,mix(C,#160510,.42) 18px)` — 45deg, 9px bands, color alternating with a 42%-darkened version. Used for RICH/active blocks; quiet blocks use the plum friendly card instead.

## COMPONENT LANGUAGE (new era)
- Blocks: generous radius (~14-16px), stripe texture = same-hue lighter diagonal bands (soft, low contrast), NO hard ink offset shadows. Two block modes: FILLED+striped (active/rich) and OUTLINED (quiet: dark fill, colored border+text, like Lunch).
- Glow: reserved for the NOW / active element only. Everything else flat on the dark ground.
- Tiles (launchers): chunky rounded squares, real color fill, white icon, soft darker bottom edge (soft extrude, Duolingo-like), never hard ink offset.
- Type: big friendly rounded (Baloo family), generous sizes (Part 0 law: minimal / big / friendly), lots of dark air between elements.
- Stripes are an accent, not a wall (David: builder had "too much stripes").

## MENU ROW STANDARD (LOCKED 2026-07-20 — David's Settings tournament winner; APP-WIDE for menus/sheets)
Born from a long options tournament on the Settings ("You") screen. This is the standard for MENU / SETTINGS / list surfaces (the shared `#sheet` builders). **It SUPERSEDES "color comes from the icon, not the fill" (line 22) for menu rows** — David explicitly rejected the flat-plum list as "boring/ugly/too much same color" and chose colored card fills + colored titles. The friendly-card rule (line 19-22) still governs browse/toolbox cards; timeline blocks (line 31) unchanged. Winner = "Richer · light text."

- **Ground (menu surfaces):** starry dusk, vertical-only gradient `linear-gradient(180deg,#3a1428 0%,#241536 52%,#12091e 100%)`. ~12 faint white 2px stars, opacity ~.30–.45, scattered in the TOP THIRD ONLY. (No warm+cool mixing; single-hue vertical. Stars are reserved to menu grounds' top; open surfaces like timeline/Sanctuary can carry more.)
- **Row card:** `linear-gradient(0deg, rgba(DOMAIN,.50), rgba(DOMAIN,.50)), #241430` (domain color at 50% over a dark-plum base). border 2px #160510 · radius 15px · lift `0 4px 0 #160510` · press = translateY(2px) + `0 2px 0`.
- **Saturated menu palette (brighter than the DOM jewels — tuned for this surface):** icon = the saturated hue; title = a light tint of the same hue; stripe-dark = 42%-toward-#160510.
  - connect/pink: icon #ff3f9e · title #ffb0d4 · dark #9d2560
  - move/orange: icon #ff8a1e · title #ffcf99 · dark #9d4d0c
  - nourish/green: icon #12d68f · title #8ff0cf · dark #0a7a52
  - focus/blue: icon #1fb0f5 · title #a8e0ff · dark #12628a
  - create/purple: icon #a95dff · title #d6c2ff · dark #5e34a0
- **Text:** title = the light-hue tint above (NOT white, NOT full-saturation, NOT pastel — the "between 1 and 2, closer to 1" landing). icon = saturated hue ~25px. sub-line #bfa6c8 ~11px. chevron #9a80a6.
- **Header:** time left; gem counter right (gold #ffd24a, `ti-diamond`). Title "You" (Baloo 800 ~27px) + a rank chip beside it (`#ff5fa8` text on `rgba(255,95,168,.18)`).
- **Rank banner (earns its space with real progress):** dark card #241020, border 2px #160510, lift `0 4px 0`. Left: compass badge (36–44px tile #1c0a16, pink icon). Right: next-rank name ("Pathfinder") + "N to go", then a pink progress bar (`#ff5fa8`, ~82%) on track #1a0a14. (Gem-bar variant beat the constellation variant.)
- **Advanced (must read DIFFERENT from the rows):** dashed border #5a3550, bg `rgba(0,0,0,.25)`, lilac text, pinned to the bottom (`margin-top:auto`) in the dark floor.
- **Tap-sweep = the app-wide "open a menu" transition (signature):** on tap, a 45deg striped overlay (domain hue / its 42%-dark, ~9px bands) sweeps across (translateX −35%→0, ~500ms cubic-bezier(.3,.9,.3,1)); title/icon/sub flip WHITE during the flash; then a pink NOW-glow "open" pulse (`scale(1.03)` + the NOW ring, ~260ms in, settle by ~620ms). The touched color throws into the sheet it opens. **DEVICE-UNTESTED: the felt pacing on David's phone — confirm before "done."**
- **Ground darkness law (from this tournament):** the bottom third stays properly dark (the floor), NEVER bottom out to pure black; NO left-to-right / diagonal ground gradients (vertical only). Rejected: flat-plum monochrome, full-striped resting fills (too bright/unreadable → stripes moved to the tap), black text (forces cards too bright), meadow/panel structure, scattered-everywhere stars, warm+cool blends, pastel (fix = saturation, not fill).

## THE PROCEDURE (never-again law; applies to every mockup and skin build)
1. SOURCE: colors come ONLY from (a) the live built CSS of new-era surfaces (grep it) or (b) David's posted screenshots (transcribe pixels). NEVER from :root old tokens, NEVER from imagination.
2. VERIFY: before rendering anything for David, place your palette next to the reference (mentally three-up: candidate | live app | screenshot). Anything louder OR deader than the reference dies (same law as the island-render discipline).
3. If the target surface is built, screenshot the REAL app surface first and match it; if design-only, use the newest David-approved screenshot in the chat/specs.
4. Update THIS file whenever David approves or rejects a skin, so the reference tightens instead of drifting.
