# HANDOFF — ALTER app (updated 2026-06-23, session 2)

Continuing the build of David's personal-development life-sim app (working name TBD; code title "ALTER"). Context ran out; this file + `DESIGN-BRIEF.md` + `_mockups/` carry everything forward.

## ⭐ Start here
1. **`DESIGN-BRIEF.md`** = the complete text spec. **`_mockups/`** (44 HTML files, see `_MANIFEST.txt`) = the **VISUAL source of truth** — port them **1-to-1** (Jost + Tabler icons + exact CSS). David rejected a from-the-text reinterpretation once; do NOT do that again. Mockups were extracted from transcript `~/.claude/projects/-Users-Dmekibel-claudeCode/f1b6612d-*.jsonl`. Keep the rendered fairy/island (better than the mockups' placeholder shapes).
2. **LIVE**: vanilla JS — `app.js` (~2150 lines) + `index.html` (inline CSS), GitHub Pages → https://dmekibel.github.io/alter/ , localStorage key `alter_plan2`. **Current version: v386** (pushed; deploys ~2–4 min). David: **always ship** after preview-verify (commit+push+poll+`fresh.html`), no need to ask.
3. **Deploy loop**: edit `app.js` → `node --check app.js` → bump `app.js?v=NNN` in `index.html` → `git add app.js index.html [HANDOFF.md] && git commit && git push`. Pages lag is real → confirm with `curl -s "https://dmekibel.github.io/alter/index.html?cb=$(date +%s)" | grep -o 'app.js?v=[0-9]*'` (poll till it matches). Cache-bust link for David: `/fresh.html`.

## ⭐⭐ How David works (READ THIS — it's why things got rejected)
- **Mockups are LAW.** 1-to-1, Jost font, Tabler line icons (not emoji), exact colors/CSS.
- **Minimal/clean.** He removed in-bubble times ("more minimal like here"). No clutter.
- **"More nuanced/complex" = MORE OPTIONS inside the existing questions, NOT more questions/steps.** (He rejected the extra onboarding questions I added.) Always offer **type-your-own** as a fallback so anyone fits.
- **Ship-and-test loop on his phone.** When he says "ship", commit+push+poll+give `fresh.html`. He hits deploy-lag/cache confusion often → always remind him about `fresh.html` (or incognito for a fresh first-run).
- **"Faster" = less ceremony, fewer check-in questions, just build + verify + ship.**
- Verify in the Claude preview (`preview_*`, launch.json name `alter`, port 8123). The preview's localStorage has SEEDED test data (blocks, a live "Claude code" timer, profile=founder, chores) — NOT David's real data (different origin), safe to mutate.

## SHIPPED (v372 → v386), all verified in preview
- **Big stop + "start new" (v386, mockup 007, §13):** live timer bubble in `calendarView` re-laid out — title top-left, **elapsed bottom-left** (`.live-elapsed`, ticks via the 1s loop), **big pink stop bottom-right** (`.live-stop`). Live min-height 54→62 so title+footer never overlap. Dashed **`.startnew`** slot in the REAL lane → `startOrSwitch`; it anchors below the live bubble's REAL bottom (`liveBottom`) so a young 62px-floored timer can't cover it. CSS `.livefoot/.live-elapsed/.live-stop/.startnew` (index.html ~L474, replaced the dead `.calblk.live .calx`).
- **Foundation (v372–373):** Jost (Google Fonts) + Tabler icons webfont (CDN) in `<head>`; Jost is the global font.
- **8-domain palette `DOM`** (app.js ~L196): each domain `{l,e,c,light,dark,ring,ink,ti}`. `domainOf(item)` title→domain (keyword table `DKW` + `CAT2DOM` fallback). `tiClass/tiIcon` title→Tabler icon (`TIMAP`). Helpers `mixHex/mixDark`, `esc`, `GOLD`/`CORAL`. `DOM_ORDER`.
- **CALENDAR `calendarView(L,k,showNow)`** — the heart (mockups 030/031/034). Plan lane 3 states: **sched**=two-tone hatch, **cele**=activity-colored celebration (foil+glow+✓+sparkle), **ghost**=domain-outlined hollow + "missed". Real lane: solid, **gold-inset ring** on-plan, mauve "drifted". **Bubbles are MINIMAL** (icon+title only, no time text — time is on the left axis). Backfill dashed "fill it in?" slots fill a **30-min default** (capped to gap). Logs have a stretch grip; live timer min **54px** (never squished) with a big stop button. NOW pill. Drag/stretch/reflow intact. Half-hour dashes.
- **Streak + celebration (v373):** `celebrate(color,streak)` escalating star→flame burst on plan-adherence; `bumpStreak/curStreak/coolStreak`; streak gradient bar (yellow→red) in the calendar header; `S.game.streak`.
- **BENTO picker `bentoPicker(opts)` (v373, deepened v380):** domain-clustered overview → expand shows **sub-group headers** → multi-select "Start N" → type-once add-new. `allActivities()` = FULL library (CATS + occupation work + `S.acts` customs, each w/ domain+group). Card flexes/scrolls so Start always fits. Wired into ALL calendar pick points + planToday (radial menu is GONE).
- **Planning suggestion bar `renderSuggest`/`sugNext(k)` (v373):** reasoned hero+alts with WHY + "all my activities" door; overdue chore auto-becomes the hero. `addSuggested`, `nextFreeTime`, `SUG_POOL`.
- **Home: live-tracker + pull-down (v379–v382, §13):** `renderLiveTracker()` = top pink strip (z-66, over the world) showing current activity / "What are you doing now?" + a "▾ my day" button. **Pull-down rebuilt**: `buildPull/openPull/closePull` — a **finger-following drag** (tracks finger Y, settles capped ~72vh), **sticky opaque header `#pullHead`** (title + ⇄ switch + X), scrollable `#pullBody` = the calendar (same data, kept in sync via `buildPull()` in `renderToday`), clean `#pullGrab`. `startOrSwitch()` = **stop current timer (logs it) + start new** (real switch). `activeTimers()`.
- **Onboarding `onboard()` (v384 too-deep → v385 REWORKED):** 8 steps — Sage → vibe → gender+age → **life-stage (22 options, MULTI-select, type-your-own)** → **"Stock your life" = full expanded bento (~120 acts, all 9 domains, grouped, pre-selected from stage(s), type-anything)** → goals (+type-your-own) → **rhythm (wake/sleep RANGES + sharpest)** → world born. `LIFESTAGES` (22, each `{k,l,ti,c,occ}`), `STAGE_BASE`/`STAGE_EXTRA`, `stageSuggest`, `GOAL_SEED`, `VIBES2`. Persists `S.profile` (gender,age,vibe,stages[],occ,goals,wake,sleep,peak,lark). Auto-runs first-run (`!S.profile.set`, in `init` ~end of file) + the "✨ Set up your world →" button in `renderChar`. Dim→bright tap selection (`chip(p,label,on,color,ink)`).
- **Subtasks + CHORES (v378):** per-block **Steps editor** in `blockEdit` — `b.subs` = your own ordered sub-parts (add via bento, reorder ▲▼, check); calendar bubble shows `x/y`. Separate **stateful chores**: `CHORES_DEF`, `S.space.done` (last-done per chore), `choreFresh/choreMark/spaceScore/mostOverdueChore`, `choresSheet()` ("Your space · N% fresh", overdue floats up). Reached from any clean/tidy block → "🧹 open your Space". (`SUBTASKS`/`subtaskSheet` legacy still defined but unused.)

## State / data model (localStorage `alter_plan2`, `S`)
`S.profile` (onboarding blueprint) · `S.blocks[dateK]=[{id,time,mins,title,prio,color,done,subs[],domain,pin}]` (PLAN) · `S.log[dateK]=[{id,time,mins,title,color,catK}]` (REAL) · `S.timers=[{id,title,start,dayK,...}]` (running) · `S.habits` · `S.game{spark,total,streak,streakDay}` · `S.brain={engine,key}` · `S.acts` (custom activities) · `S.goals=[{title,domain,subtasks[]}]` · `S.space.done`. `load()`/`save()`. Helpers `blocks(k)/logs(k)/todayK()/nowMin()/fmt/hm/reflow(k)`.

## NEXT / PENDING (priority)
1. **Redo-setup button** — David asked for it. `onboard()` only auto-runs when `!S.profile.set`. Add a "redo setup" entry (in `brainSheet`/settings or the self-tab) that just calls `onboard()`.
3. **Goals / character-skills screen** (David's next big ask): long-term goal-horizons (decompose goal→milestones→scheduled dated actions + life-audit, mockups 009/010) AND the identity/character screen. `S.goals` trees seeded by onboarding (titles+domain only).
4. **Remove old/ugly legacy** (David asked): old RPG **character sheet** `charSheet`/`surveySheet` + the `#t-self` self-tab clutter (mood weather, hero proactive card, quick-wins, virtue tree). Old **`pickerSheet`** flows (`nowSheet`/`planSheet`/`pickOne`). `radialMenu` is already unused (dead). Replace with the new identity screen.
5. **Two-tier BRAIN (011) + monetization (012)** — free floor / paid AI (BYO-key, NEVER echo keys). `S.brain` exists.
6. **Home-shell HUD polish (005):** world HUD (streak pips + spark + mood orb), notebook reposition, tap-fairy→stats (currently fairy→pull-down via `heroMenu`).
7. **Week/Month calendar colors** (still old palette — `weekGrid`/`monthGrid`) · **Mindmap "see your life"** (016/017/018) · **world/garden growth**.

## HARD constraints (never violate)
$0 static vanilla-JS · mobile one-thumb iPhone · **TAP not type** (type only as the explicit fallback) · **ZERO white** (use `#fff2f9`/`#160510`) · candy on dark hot-pink/berry night bg · bold `#160510` outlines · Jost bold · Tabler icons · "less machine, not more" · **never store/echo API keys**.

## To continue
Open a fresh session in `/Users/Dmekibel/claudeCode/alter` and say:
> "Read DESIGN-BRIEF.md + HANDOFF.md and browse `_mockups/`. Continue ALTER — port 1-to-1 from the mockups. Start with [big-stop+start-new / goals-screen / remove-old-menus]."
