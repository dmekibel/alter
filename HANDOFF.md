# HANDOFF — continue the redesign (2026-06-23)

You're continuing a long **design session** for David's personal-development life-sim app (working name TBD; code title is "ALTER"). The chat ran long; this file + the brief carry everything forward.

## ⭐ Start here
1. **Read `DESIGN-BRIEF.md` first — it is the COMPLETE design spec** (the source of truth; everything below is detailed there).
2. The app is **LIVE and working**: vanilla JS — `app.js` + `index.html` (inline CSS), GitHub Pages → https://dmekibel.github.io/alter/ , localStorage key `alter_plan2`. **Current version: v378.**
2b. **⭐ DESIGN SOURCE-OF-TRUTH = the 44 in-chat mockups, extracted to `_mockups/` (see `_MANIFEST.txt`).** Port them **1-to-1** (Jost font + Tabler icons + exact CSS) — do NOT reinterpret from the text brief (David rejected a reinterpretation 2026-06-23). They came from transcript `~/.claude/projects/-Users-Dmekibel-claudeCode/f1b6612d-*.jsonl`. Keep the rendered fairy/world (better than the mockups' placeholder shapes).
3. Deploy loop: edit `app.js` → `node --check app.js` → bump `app.js?v=NNN` in `index.html` → `cd /Users/Dmekibel/claudeCode/alter && git add -A && git commit -m "…" && git push`. Cache-bust link: `/fresh.html`.

## Already SHIPPED in the live app
Self-help modules + browser TTS (v370). Phantom-bubble fix (v371).
**The big 1-to-1 redesign batch (v372–v378), all verified in preview:**
- **Foundation:** Jost font + Tabler line icons app-wide (`.ti`), replacing Baloo/Fredoka + emoji.
- **8-domain palette** `DOM` (app.js ~L196): full color ramps (c/light/dark/ring/ink) + Tabler icon per domain. `domainOf()` maps any title→domain→color; `tiClass()/tiIcon()` map title→icon.
- **CALENDAR `calendarView`** (1-to-1 mockups 030/031/034): dark-berry card, two-tone diagonal hatch (scheduled) · domain-outlined ghost (missed) · activity-colored celebration foil+glow+✓ (done); REAL lane solid + **gold-inset ring** on-plan / mauve "drifted"; backfill "fill it in?" slots; NOW pill; left axis + half-hour dashes. Drag/stretch/reflow intact.
- **Streak + celebration** (032/024): `celebrate()` escalating star→flame burst on plan-adherence (mark-done / on-plan track), streak gradient bar yellow→red, `S.game.streak`.
- **BENTO picker** `bentoPicker()` (019): domain-clustered overview → expand-in-place → multi-select "Start N" → type-once add-new; wired into all calendar pick points (radial gone from calendar). Custom acts persist in `S.acts`.
- **Planning suggestion bar** `renderSuggest()`/`sugNext()` (037/039/040): reasoned hero+alts w/ WHY + "all my activities" door; never-blank day; overdue chore auto-surfaces as hero.
- **Home live-tracker + pull-down** `renderLiveTracker()`/`openPull()` (005/006/007, §13): top strip "What are you doing now?" → tap=start/switch (bento), drag-down=plan-vs-real (reuses calendarView).
- **Onboarding** `onboard()` (041/043): 8-step — Sage → vibe → gender+age → auto-suggested life-stage (reuses OCCUPATIONS) → prefill-prune bento + little-extras → goals → rhythm → world born. Persists `S.profile`, seeds `S.acts`+`S.goals`. Auto-runs first-run + "Set up your world" button.
- **Subtasks redesign + CHORES** (David 2026-06-23): per-block **Steps editor** in `blockEdit` (add YOUR OWN ordered sub-parts via bento, reorder ▲▼, check off; bubble shows x/y). Separate **stateful chores system** `choresSheet()` — `S.space.done` tracks last-done per chore (dishes/bed/trash/surfaces/floor/laundry/bathroom), freshness→fresh/due/overdue, "Your space · N% fresh", overdue floats up + becomes priority suggestion. **NOTE: David wants to iterate on subtasks design/function next.**

## STILL TO BUILD (priority order)
- **⭐ Iterate on subtasks** (David's stated NEXT focus): refine the per-block Steps editor + chores design/function. Shipped v378 as a first cut.
- **Long-term goal-horizons** (mockups 009/010): GRAND goal → milestones → week/month steps → dated daily actions + life-audit. `S.goals` trees are already seeded by onboarding (just titles+domain so far).
- **Two-tier BRAIN** (011) + **monetization/cosmetics** (012): free deterministic floor / paid AI brain (BYO-key, local only — NEVER echo keys) + cosmetic IAP. Free = manual-guided; paid = AI-does-it. (`S.brain={engine,key}` exists.)
- **Home-shell polish** (005): world HUD (streak pips + spark bar + mood orb), notebook-button reposition, tap-fairy→stats. (Live-tracker + pull-down already shipped.)
- **Mindmap "see your life"** identity view (016/017/018) · **Week/Month** calendar bubble colors (still old palette).
- **World/garden** growth + **identity/character** screen — not in mockups yet; design first.

## Baked-in philosophy (keep honoring)
Newport *Slow Productivity* (reward depth/rest/fewer-things, NOT volume) + Atomic Habits (tiny/identity/make-it-satisfying). Type = Wes-Anderson/Futura (Jost bold).

## HARD constraints (never violate)
$0 static vanilla-JS · mobile one-thumb iPhone · **TAP not type** · **ZERO white ever** · candy/Powerpuff on **dark hot-pink night** bg · bold dark outlines + sticker shadows · Futura/Jost **bold** type · notebook-in-hand menus · "less machine, not more". **Never store or echo David's API keys** (they live only in his localStorage).

## To continue
Open a fresh session in `/Users/Dmekibel/claudeCode/alter` and say:
> "Read DESIGN-BRIEF.md, HANDOFF.md, and browse `_mockups/`, then let's iterate on the subtasks (or build the next surface) — port 1-to-1 from the mockups."
