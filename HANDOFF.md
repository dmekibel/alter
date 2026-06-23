# HANDOFF — continue the redesign (2026-06-23)

You're continuing a long **design session** for David's personal-development life-sim app (working name TBD; code title is "ALTER"). The chat ran long; this file + the brief carry everything forward.

## ⭐ Start here
1. **Read `DESIGN-BRIEF.md` first — it is the COMPLETE design spec** (the source of truth; everything below is detailed there).
2. The app is **LIVE and working**: vanilla JS — `app.js` + `index.html` (inline CSS), GitHub Pages → https://dmekibel.github.io/alter/ , localStorage key `alter_plan2`. **Current version: v372.**
3. Deploy loop: edit `app.js` → `node --check app.js` → bump `app.js?v=NNN` in `index.html` → `cd /Users/Dmekibel/claudeCode/alter && git add -A && git commit -m "…" && git push`. Cache-bust link: `/fresh.html`.

## Already SHIPPED in the live app
Self-help modules with browser TTS (v370): breathwork, relax-all-muscles, 4-teacher meditation (Sam Harris/Headspace/Blackstone/Adyashanti — transcripts in `meditation-scripts/`), EFT tapping, mantra player. Time-tracker phantom-bubble bug fixed (v371).
- **CALENDAR / JOURNAL identity layer (v372):** the most-important screen now renders the locked look. New 8-domain palette `DOM` + `domainOf()` (maps any activity title → domain → color, app.js ~L196). `calendarView` repainted: PLAN lane 3 states (hatched scheduled · category-colored foil+✓+✨ celebration · hollow ghost), REAL lane solid with **gold on-plan ring / coral dashed drift**, bold `#160510` outlines (zero-white — killed the old white `.ok` border), "✨ N on plan" adherence chip, half-hour gridlines. All drag/stretch/reflow handlers untouched. Verified: all 6 states render, no console errors.

## DESIGNED (in the brief — ready to build)
- **Core loop:** Plan → Do → (drift) → Adapt, all while time-tracking. **"You're never off-plan"** — the plan is a living queue that REFLOWS around reality. Conscious-&-planned vs unconscious-drift is the only real line.
- **Nav/home:** world full-screen + 5-piece HUD; **top live-tracker pulls DOWN** into a plan-vs-actual sheet; **bottom-right notebook = the menu**; **tap the fairy = stats**. Nothing is full-screen — every surface floats over the dimmed world, dismissible.
- **Picker:** the **bento box** (8-domain color-clustered bubbles) as the everyday picker + a **mindmap "see your life"** identity view. Smart reasoned suggestions (hero + alts) with the **full bento always one tap away**.
- **CALENDAR / JOURNAL (most important screen):** ✅ **v372 SHIPPED the base** — split lanes (PLAN hatched | REAL solid), time axis LEFT + 30-min dashes + hour gridlines, **3 plan states** (scheduled=hatched · completed=**category-colored** foil+check celebration · missed=hollow ghost), gold=on-plan / coral=drift, "✨ N on plan" chip. **STILL TO BUILD (rough priority):** (1) **streak gradient yellow→red→EPIC→SUPER-EPIC→LEGENDARY** + the escalating Guitar-Hero combo crescendo (the soul — §23/§24 #3); (2) save-streak-by-replanning (conscious plan-a-break flow); (3) edit-the-past (tap a block → mini-bento "what were you really doing?"); (4) backfill dashed "fill it in?" slot; (5) planning suggestion bar + bento door; (6) **multitasking** side-bars (§26 — basic column-layout already exists); (7) Week/Month bubble colors (still old palette — do with their design pass).
- **8-DOMAIN TAXONOMY + colors:** Move · Nourish · Focus · Create · Connect · Play · Restore · Upkeep (+ Drift). Refined palette in brief §8/§24. Many activities → one category → one color.
- **Onboarding:** gender+age → suggested life-stage → prefill-and-prune bento (by domain, micro-"little extras" at the end) → goals → rhythm → world born. Extra data: kryptonite, constraints, intensity dial.
- **Two-tier BRAIN = MONETIZATION:** free deterministic floor / paid AI brain (BYO-key or hosted subscription) + cosmetic IAP. AI APPLIES the app's wisdom, never invents (KB-retrieval pattern). Free = manual-guided; paid = AI-does-it.
- **Philosophy baked in:** Newport *Slow Productivity* (reward depth/rest/fewer-things, NOT busyness) + Atomic Habits (tiny/identity/make-it-satisfying).
- **Type:** Wes-Anderson / Futura vibe (Jost or Poppins, bold 600–700, large).

## NOT yet designed
- The **world/garden** (living island, fairy movement, garden-of-mind GROWTH; skate/jump exist in old code)
- **Identity/character screen** (virtues, levels, who you're becoming)
- The **mindmap "see your life"** view (sketched only)
- **Week / month / long-term** planning views (goal-trees → calendar)
- **Economy/shop** + gamification-intensity dial (Vanilla / Light / full Game)
- **"Run the whole self-help stack"** sequenced flow
- Notebook home (app-grid), settings, brain (BYO-key) setup

## Suggested next
Either (a) finish the remaining design surfaces, or (b) **start BUILDING**. If building: the **calendar/journal is the most-specified and most important — build it first.** Rough order: calendar/journal → bento picker → onboarding → world/garden.

## HARD constraints (never violate)
$0 static vanilla-JS · mobile one-thumb iPhone · **TAP not type** · **ZERO white ever** · candy/Powerpuff on **dark hot-pink night** bg · bold dark outlines + sticker shadows · Futura/Jost **bold** type · notebook-in-hand menus · "less machine, not more". **Never store or echo David's API keys** (they live only in his localStorage).

## To continue
Open a fresh session in `/Users/Dmekibel/claudeCode/alter` and say:
> "Read DESIGN-BRIEF.md and HANDOFF.md, then let's [keep designing the world / start building the calendar]."
