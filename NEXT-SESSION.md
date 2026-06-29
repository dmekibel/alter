# ALTER — next-session primer (paste this into a fresh session)

You are continuing work on ALTER (David's guardian-angel life-sim PWA). Read `alter/CLAUDE.md` (the dev constitution) FIRST, then `alter/GAMEPLAN-2026-06-29.md` (the master plan) and the newest memory. Ship loop: edit `index.html`/`app.js`/`manifest.json` only → `bash _dev/preship.sh` → commit/push → hand David `/fresh.html`. Never hand-edit `server.js`. Verify boot + tap-flows in the preview (port 8123, mobile preset); label anything gesture/scroll/safe-area DEVICE-UNTESTED — never claim "verified" for those.

## Where we are (as of v677, 2026-06-29)
A huge clean batch shipped today (v664→677, zero breakage). **Gameplan Phases 1 & 2 are COMPLETE:**
- **Spine (journey↔goals):** goals project their next move onto the journey (`staleGoals(3)` in `jpNodes`); 3-goal cap lifted → hold many, rotate the stalest (`goalLastK`/`staleGoals`/`goalTouch`, `g.lastK`); metric milestones = 🏆 node + confetti; Welcome-Back re-assessment (`maybeWelcomeBack`/`welcomeBackSheet`, ≥14d lapse).
- **Adaptive onboarding:** 5 categories (Energy/Work/Love/Hobbies/Other, `SUPERCAT`), role-aware "✨ SUGGESTED FOR YOU" goals (`ROLE_GOALS`), `drawCategory()`; dropped identity/virtue/all-habits/level steps; level inferred from vibe.
- **Tiny-Step Guardian** ("Feels too big?" → `tinyStep`/`tooBigSheet`), **trackable goal metrics** (`guessMetric`/`metricSection`/`logMetric`, `g.metric`), **per-goal progress arcs**.
- **Mom's Russian** (the ~90 new strings translated; `Object.assign(I18N.ru,...)` before `I18N_PATTERNS`), **travel/off-day mode** ("I'm away" toggle in day-tools → `S.away` → journey = one rest-stone), anti-shame streak fix (`coolStreak` no-op).

## OPEN BUGS — need David's device, do NOT fix blind
1. **Dock gap** — when scrolled, the expanded tracker dock floats with empty space below it (home-indicator/safe-area math renders differently headless). FIX LIVE: have David scroll to show the gap and say "drop the dock ~Npx"; then adjust the `#liveDock`/`#nav` collapsed-state `bottom:` offsets in index.html (~lines 1300–1343). 3 blind attempts (v663+) failed — get the number from him first.
2. **4am label repeats twice** + **can't place bubbles past midnight** — both live in the continuous-scroll timeline (the documented landmine; `dayWindow`/`reflow` clamp to 1410). Device-confirm any change; never run two day-nav models at once.

## What to build next (pick ONE epic, do it right — with David's phone in the loop)
- **Phase 3 — Cockpit as home** (the keystone): make the expanded tracker THE place the app speaks; route guided flows through it. NOTE: the PM→AM bookend organ is already ~90% built (`amStageStep`/`pmStageStep`, `bookendMirror`, day-tools has Journal/Guidance/Brain/toolbox/meditation). Remaining = the cockpit-as-default-home restructure — gesture-heavy, device-sensitive, build WITH David testing feel.
- **Phase 4 — Claude brain:** pilot in JOURNALING first (own key, deterministic fallback always live, anti-shame lint in the prompt), then blocker-aware decomposition + welcome-back; wire Field Guide / Brian Johnson KB into the prompt. David's instinct (correct): skeleton stays AI-free, AI is an enhancement layer.
- **Phase 5 — the game/world**, **Phase 6 — integrations/voice**: each its own session.
- **Polish leftovers:** arrows beside date for prev/next day; drift-overrun fork; non-negotiables hard-lock; masterpiece-day presets; ADHD "bring me back" pulse during a work block; bento 5-tab width device-check.

## The north star (don't lose this)
ALTER must SUPPORT four real test users if they onboard honestly (not be hardcoded): **David** (sprawling portfolio + avoidance), **Mom** (66, RU, fear-gated sports), **Sister** (overwhelm → smallest-step cleaning), **Brother** (ADHD/avoidance/low self-esteem). Full personas + audit: `alter/_specs/PERSONAS-readiness-test.md`. "If it can help each, it can help anyone." The unbuilt spine is the connective tissue making planner/journey/goals/bookends/game ONE adaptive organ.

## David's working style
Ship-and-test on his phone. "Faster" = build→verify→ship, fewer check-ins; take charge, end with one move. Design choices = options-first (2–3 in chat, he picks). Bug fixes = just fix. Anti-shame is law (drift is data, never red/punishment). Don't overwhelm him with test checklists — batch builds, ping once. Pace the budget so he doesn't wake to zero.
