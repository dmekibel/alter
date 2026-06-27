# SPEC — Coach & philosophy (cluster: `coach-fundamentals`)

**Source audit:** `GRAND-AUDIT-2026-06-26.md` — "Vision / philosophy" (lines ~329-374) + "Coaching / reminders / notifications / AI-guidance" (lines ~176-186, ~742-752).

**The honest framing of this cluster:** almost every ask here is a *VISION* line, not a discrete feature. The audit's repeated verdict is the same: the app has **coach framing in copy + prompt** but **no coaching engine, no fundamentals curriculum, no wisdom KB**. The brain (`brainContext` app.js:2957) sends a thin generic prompt with **zero** Johnson/Withers/fieldguide content. So this spec's job is to translate "be my Brian Johnson + Brian Withers" into the **smallest set of concrete, buildable engines** that move the needle, and to mark the rest vague→nearest-concrete.

The highest-leverage, lowest-risk wins (none touch the fragile timeline render):
1. **A real coach knowledge layer** — a `WISDOM` content array (Johnson/Withers/Newport/Rohn one-liners + practices) the app surfaces itself, AND injected into the brain prompt. This single asset satisfies 4 audit asks at once.
2. **A proactive coach nudge** — `proactive()` already exists (app.js:1301); extend it to surface a daily wisdom card + a "your fundamentals aren't on the day yet" nudge.
3. **Fundamentals curriculum** — `FUNDAMENTALS`/`getFund` (app.js:386-387) is just a list of activities. Add per-fundamental *why/how* coaching copy so "master the fundamentals with me" has teeth.

---

## LOCKED design rules honored in every spec below
- Palette: deep berry/wine bg (`#280b19` day / `#1f1939` night), DOM domain colors (`DOM` app.js:249). **No neon/glow/shine/white-surface.** The pink now-line stays the brightest thing.
- One activity at a time; reward-never-shame (Withers): never show a low number, never scold, world "hasn't cleared yet."
- Reuse helpers: `add()` / `el()` / `DOM` / `mixHex` / `esc` / `fmt` / `dur` / `hm` / `blocks()` / `logs()` / `save()`.
- **None of these features should touch the timeline render** (`calendarView` ~2080-2290). All flagged LOW RISK on that axis unless noted.
- New sheets reuse the existing `#sheet` modal pattern: `var B = el("sheetBody"); B.innerHTML=""; openSheet(); add(B,...)`. (Same pattern as `brainSheet` app.js:2961, `recommitSheet` app.js:2841.)

---

## SHARED FOUNDATION (build this first — 4 features depend on it)

### `WISDOM` content asset + `S.profile.coachSeen` state

A single in-file data array is the spine of this whole cluster. Author it once, reuse everywhere (proactive card, brain prompt, fundamentals "why", a Coach sheet).

**Shape (place near `VIRTUES` app.js:1172, or near `FUNDAMENTALS` app.js:386):**
```js
var WISDOM = [
  // src: "johnson" | "withers" | "newport" | "rohn" | "atomic"
  { src:"johnson",  big:"Areté — close the gap.",   line:"Be the best version of yourself this hour. Not perfect — just one notch better than autopilot.", do:{label:"Pick my one thing", fn:function(){ suggestSheet(todayK()); }} },
  { src:"withers",  big:"No-shame.",                line:"A hard day hasn't gone wrong — it just hasn't cleared yet. You don't owe the past anything. Start the next right thing.", do:{label:"Recommit (60s)", fn:recommitSheet} },
  { src:"newport",  big:"Do fewer things.",         line:"Slow productivity: pick the 2-3 that matter, do them at a sane pace, let the rest wait. Overload is not virtue.", do:{label:"Trim today", fn:function(){ planSheet(todayK(),"today"); }} },
  { src:"rohn",     big:"Discipline beats motivation.", line:"You don't rise to your goals, you fall to your systems. Show up to the small rep — it compounds.", do:{label:"Start a fundamental", fn:function(){ enhancePlan(todayK()); }} },
  { src:"atomic",   big:"Two-minute rule.",         line:"Shrink it until you can't say no. 'Read a book' → 'read one page.' Identity is built by tiny votes.", do:{label:"Tiny step", fn:function(){ /* opens micro sheet if present */ }} },
  // ...author ~16-24 total, 4-6 per source, all reward-framed, never deficit-framed
];
var WSRC = { johnson:{l:"Brian Johnson · Heroic", c:"#ffc83d"}, withers:{l:"Brian Withers", c:"#ff5fa0"}, newport:{l:"Cal Newport · Slow Productivity", c:"#36b3f0"}, rohn:{l:"Jim Rohn", c:"#b07aff"}, atomic:{l:"Atomic Habits", c:"#34d39a"} };
```
Authoring rule (CLAUDE.md + Withers): **every line is encouragement or instruction, never a critique.** No "you failed to…", no scores. The `do` action reuses an existing function so each card is actionable in one tap.

**State / migration:** add `S.profile.coachSeen` (array of indices or a rotating cursor `S.profile.coachIdx`) so the daily card rotates. In `load()` (app.js:1199) add: `S.profile = S.profile || {}; if (S.profile.coachIdx == null) S.profile.coachIdx = 0;` — purely additive, no SCHEMA bump needed (it's an optional profile field, same pattern as `S.profile.fundamentals`, `S.profile.masterpiece`). REGION: data block near app.js:386 / load() app.js:1199.

---

## FEATURE 1 — Personal coach who masters the fundamentals (Johnson + Withers)

1. **Ask:** _"ur not helping me not managing me not coaching me … I need u to be my personal Brian Johnson and Brian withers"_ (audit ~331, VISION, asked ×2).
2. **Buildable?** **partial → concrete.** "Be a coach" is unbounded; the buildable core = (a) a **Coach surface** that delivers wisdom + a next-action, (b) **fundamentals with a "why"**, (c) brain prompt that actually carries Johnson/Withers framing (Feature 5). Build a/b here.
3. **APPROACH:**
   - Build `coachSheet()` — a new `#sheet` panel that shows: today's rotating `WISDOM` card (big + line + source tag colored via `WSRC[src].c`), the one-tap `do` action, and a "fundamentals check" row (how many of `getFund()` are on today's plan, with a "drop the rest in" button calling existing `enhancePlan(todayK())` app.js:388).
   - Wire entry points: add a "🧭 Coach" chip in `proactive()` chips (app.js:1301) and a Coach button on the You tab next to the brain button (app.js:1841).
   - Rotate the card: read `WISDOM[S.profile.coachIdx % WISDOM.length]`; advance `coachIdx` once per logical day (compare to a stored `S.profile.coachDay = todayK()`).
4. **CODE POINTERS:** new `coachSheet()` placed near `brainSheet` (app.js:2961); reuse `enhancePlan` (388), `getFund` (387), `suggestSheet` (2781), `recommitSheet` (2841). Hook into `proactive()` chips (1301-1308) and the You-tab button block (app.js:1841).
5. **UI (locked palette):**
   ```
   ┌─ #sheet (berry sheet) ───────────────┐
   │  🧭 Coach                             │
   │  ── Brian Johnson · Heroic ──  (gold) │
   │  ARETÉ — CLOSE THE GAP.   (var(--bub))│
   │  Be the best version of yourself this │
   │  hour. One notch better than autopilot│
   │  [ Pick my one thing ]   ← done2 btn  │
   │                                       │
   │  Your fundamentals · 3 of 7 on today  │  ← never "4 missing", frame as progress
   │  [ Drop the rest in ✨ ]              │
   └───────────────────────────────────────┘
   ```
   No white card — use the existing sheet bg; source tag is a small colored pill (border = `WSRC[src].c`), text `D.light`-style readable on berry.
6. **DATA:** `S.profile.coachIdx`, `S.profile.coachDay` (string dayK). Additive; migrate in `load()` as above. No SCHEMA bump.
7. **REGION:** new sheet fn (app.js ~2960, next to brain) + small edits to `proactive()` (1301) + You-tab button (1841). Self-contained; low conflict surface.
8. **EFFORT:** **M** (the `WISDOM` authoring is the real work; the sheet is boilerplate).
9. **RISKS:** Low. Does not touch timeline. Conflict risk only with another agent editing `proactive()` chips or the You-tab button row — coordinate those two ~5-line edits. Content-quality risk: lines must be genuinely Johnson/Withers-flavored and reward-framed, not generic affirmations (the exact thing David rejected before). Run the authored `WISDOM` through the `audit-loop` voice check before shipping.

---

## FEATURE 2 — A better, more functional spin on Heroic

1. **Ask:** _"the app Brian Johnson already made which is: heroic and make my spin on it and make it better"_ (audit ~336, VISION, asked ×2). Gap: has virtue/wisdom *spirit* but not Heroic's *breadth* — no coaching content library, no journal-prompt library, no "101 classes."
2. **Buildable?** **partial → concrete.** Don't rebuild Heroic. The nearest concrete, on-brand wins that already have homes in the codebase:
   - **(a) Wisdom library** = the `WISDOM` asset above, surfaced as a browsable list (Heroic's "+1° / Wisdom" feel).
   - **(b) Journal-prompt library** = extend the existing `recommitSheet` gratitude step (app.js:2868) / `gratefulFlow` (2809) with a rotating reflection prompt drawn from a small `PROMPTS` array.
   - **(c) "Class" micro-lessons** = a short ordered list per virtue/fundamental ("Fundamentals 101") shown as read-along cards reusing the `mantraPlayer` teleprompter pattern (app.js:2082) — NOT new infra.
3. **APPROACH:**
   - Add a "📚 Wisdom" tab/section inside `coachSheet()` (Feature 1): render the whole `WISDOM` list grouped by `WSRC` source, each row tappable to expand the `line` + fire its `do` action. Reuse the `pchips`/list patterns.
   - Add `PROMPTS = ["What's the one thing that, done, makes today a win?", "Who do you want to have been today?", ...]` and surface one in the recommit close-step (app.js:2868) and in the evening bookend.
   - "Fundamentals 101": for each fundamental add an optional `why`/`how` (see Feature 4) and a "learn" affordance that plays the copy as a calm teleprompter via the existing `mantraPlayer`-style overlay.
4. **CODE POINTERS:** `coachSheet()` (new, Feature 1); `recommitSheet` step 3 (app.js:2868-2871); `gratefulFlow` (2809); `mantraPlayer` (2082) as the read-along primitive; `VIRTUES` (1172) for grouping classes by virtue.
5. **UI:** Wisdom list = stacked rows on the berry sheet, each with a left color-bar (`WSRC[src].c`), source label small/muted, the `big` line in `var(--bub)`. Tap → expands inline (no new modal). Matches the existing `sgrow`/list aesthetic (app.js:2790).
6. **DATA:** none beyond Feature 1's `coachIdx`. `PROMPTS` is a static array.
7. **REGION:** mostly inside `coachSheet()` (new) + a 3-line addition to `recommitSheet` step 3 (2868). Low conflict.
8. **EFFORT:** **M** (content authoring + one list view; reuses everything else).
9. **RISKS:** Low/none on timeline. Scope-creep risk — resist building a full LMS. The "101 classes" must stay 3-5 read-along cards each, reusing `mantraPlayer`. Do not add a third menu system (CLAUDE.md landmine) — keep it inside the one `#sheet`.

---

## FEATURE 3 — Help me get rich and get healthy as main functions

1. **Ask:** _"the app will help u get rich as one of the main functions of the app get rich and get healthy"_ (audit ~346, VISION). Gap: rich/healthy exist only as activity categories + templates, not first-class engines.
2. **Buildable?** **partial → concrete.** A full "wealth tracker" / "health tracker" is a large separate cluster. The *coach-side* concrete version (what belongs in THIS cluster): two **coach focus tracks** — "Get Rich" and "Get Healthy" — that aggregate what the app already records and coach toward them. Reuse existing signals: `weeklyWorkouts()` (referenced app.js:1308), money/fitness `DECOMP_TEMPLATES` (app.js:406, 408), `GOAL_SEED`, domain logs (`move`/`nourish` for health; a money goal/domain for wealth).
3. **APPROACH:**
   - In `coachSheet()`, add two compact "track" cards: **Get Healthy** (this week: workouts via `weeklyWorkouts()`, move+nourish minutes from `logs()`) and **Get Rich** (this week: money-domain blocks done / a simple count of money-goal subtasks completed). Frame as **progress, never deficit** (Withers): "3 movement sessions logged this week 💪" not "you missed 2."
   - Each card's CTA reuses the goal decomposition: tap "Get Healthy" → if no health goal, seed one from `DECOMP_TEMPLATES` fitness steps (app.js:406); tap "Get Rich" → money steps (408). This makes the two "main functions" first-class *in the coach*, without a new tracker subsystem.
4. **CODE POINTERS:** `weeklyWorkouts()` (used at app.js:1308), `DECOMP_TEMPLATES` (404-412), `decomposeGoal` (413), `activeGoals` (414), `logs()`/`blocks()` for weekly aggregation, `DOM.move`/`DOM.nourish` colors for the health card, a money domain/`focus`-ish color for wealth.
5. **UI:**
   ```
   ── Two main functions ──
   ┌ 💪 Get Healthy ─────────┐ ┌ 💰 Get Rich ──────────┐
   │ 3 sessions · 180m move  │ │ 2 money blocks done   │
   │ this week — keep going  │ │ this week — nice      │
   │ [ Plan a workout ]      │ │ [ Plan a money rep ]  │
   └─────────────────────────┘ └───────────────────────┘
   ```
   Cards use `DOM.move.c` / a wealth color border on berry; numbers are achievements, never red/low.
6. **DATA:** optionally `S.profile.healthGoal` / `S.profile.wealthGoal` flags, but prefer deriving from existing `S.goals`. Additive only.
7. **REGION:** inside `coachSheet()` (new). Reads existing aggregation helpers; no writes to timeline.
8. **EFFORT:** **M** (two aggregation reads + two cards; the "never show a low number" framing needs care).
9. **RISKS:** Low. Don't over-build into a standalone tracker — that's a separate cluster. Verify `weeklyWorkouts()` signature before calling. Withers-compliance: review copy so nothing reads as a deficit. If money has no real domain yet, count money-keyword goal subtasks rather than inventing a finance ledger.

---

## FEATURE 4 — Cal Newport / Slow Productivity method (organized way to plan the future)

1. **Asks (two audit lines, merged):** _"most people probably don't have an organized method for planning their future unlike people like Cal Newport"_ (audit ~366, VISION ×2) + _"help people get out of … procrastination … activate heroic potential, Jim Rohn, Brian Johnson"_ (audit ~361). Gap: general planning built; no explicit Slow-Productivity mechanics (do-fewer-things, seasonality, obsess-over-quality).
2. **Buildable?** **partial → concrete.** The buildable Newport principle = **"do fewer things"** as an actual constraint, plus surfacing the principle as coaching. The codebase ALREADY has the seed: `ensureGoalDefaults()` (app.js:415) caps active goals at 3 with the comment "(Newport cap, §17)". Make that cap *visible and coached*.
3. **APPROACH:**
   - Surface the active-goals cap in the coach: a "This season's focus" card showing the ≤3 active goals (`activeGoals()` app.js:414), with copy "Slow productivity: a few things, done well." If >3 active, gently suggest parking some — **never force, never shame.**
   - Add Newport/Rohn entries to `WISDOM` (already specced in the shared asset) so the principle is *taught*, satisfying the "activate heroic potential / organized method" framing.
   - Optional small win: a "do fewer things today" nudge in `proactive()` when today's plan has many high-priority blocks — suggest trimming via `planSheet`.
4. **CODE POINTERS:** `ensureGoalDefaults` (app.js:415), `activeGoals` (414), `goalsSheet` (419), `DECOMP_TEMPLATES` (404), `proactive()` (1301), `WISDOM` (new).
5. **UI:** A "🍂 This season" card in `coachSheet()`: lists active goals (≤3) as chips; if more, a soft line "you've got N active — want to pick the few that matter? (Newport)" → tap opens `goalsSheet()`. Berry palette, no scolding.
6. **DATA:** none new — reuses `g.active` already in goal shape (app.js:415).
7. **REGION:** inside `coachSheet()` + 1 entry in `WISDOM` + optional `proactive()` nudge. Low conflict.
8. **EFFORT:** **S** (mostly surfacing what `ensureGoalDefaults` already enforces + 2 wisdom lines).
9. **RISKS:** Low. Don't build seasonality scheduling (too far). Keep "do fewer things" as a *suggestion*, never a hard block on adding goals — David adds freely.

---

## FEATURE 5 — Integrate the Johnson/Withers/fieldguide KB into the brain (smarter brain)

1. **Asks (merged, both in the Coaching section):** _"you haven't integrated the self help kb we built into fieldguide properly"_ (audit ~178, BIG ×2) + _"the brain feels oversimplified, not intelligent enough"_ (audit ~749, BIG; David deferred but it's the core gap). The brain prompt (`brainContext` app.js:2957) carries **zero** KB.
2. **Buildable?** **yes** (the in-app half). The fieldguide KB lives in a *sibling* project, read-only from here — do NOT try to bundle the whole KB into this single-file app. The concrete, buildable version: **inject the `WISDOM` framework + a curated "coach system prompt" into `brainContext`** so the brain reasons *as* Johnson+Withers with the app's actual no-shame rules. This is the 80% win for "smarter brain" with no external dependency.
3. **APPROACH:**
   - Rewrite `brainContext()` (app.js:2957) to prepend a real **system framing**: the no-shame Withers rule (never show a low number / never scold), the Johnson Areté frame (close the gap, identity→virtue→action), Newport's do-fewer-things, and a compact digest of the `WISDOM` `big` lines. Then append the existing dynamic context (time, occupation, goal, today's plan, undone habits — already assembled at app.js:2958).
   - Keep it ONE prompt string (askBrain app.js:2937 sends a single user message). Cap length sensibly (free models have small contexts) — include ~6-8 `WISDOM.big` lines, not all.
   - Optionally pass `S.profile.todayIdentity` / `todayVirtues` (set by recommit, app.js:2847) so the brain knows who David said he's being today.
4. **CODE POINTERS:** `brainContext()` (app.js:2957-2959) — the whole edit lives here; `askBrain` (2937) unchanged; `WISDOM` (new); `S.profile.todayIdentity`/`todayVirtues` (written at app.js:2847); also used by `suggestSheet` "🧠 ask my brain what's best" (app.js:2785) and the brain test path — both will benefit automatically.
5. **UI:** No UI change — same "🧠 ask my brain what's best" button (app.js:2785) and the You-tab brain button (1841). Output just gets smarter/on-voice.
6. **DATA:** none. Reads existing `S.profile` + `WISDOM`.
7. **REGION:** `brainContext()` (app.js:2957) — tightly scoped, single function. Depends on `WISDOM` existing (shared foundation).
8. **EFFORT:** **S** (one function rewrite, given `WISDOM` exists).
9. **RISKS:** Low/medium. (a) Prompt length vs free-model context windows — keep the digest compact; test with the OpenRouter free model David uses (app.js:2946). (b) Voice risk — the system framing must enforce "no lists, 2 short sentences, kind, no shame" (already in the current prompt, app.js:2959 — preserve it). (c) This is the *in-app* integration; the deeper fieldguide-KB port is explicitly out of scope for a single-file app and should be flagged to David as "framework injected; full KB would need a server/bundle."

---

## FEATURE 6 — Proactive coach loop (deep audit ask: "a million times more proactive")

1. **Ask:** _"how to make app more proactive more fun and more user friendly each one a million times more"_ (audit ~371, med ×2). Gap: app is largely reactive; proactive nudging is thin. Also the umbrella VISION _"pull people out of procrastination, activate heroic potential"_ (~361).
2. **Buildable?** **partial → concrete.** "A million times more proactive" is unbounded; the concrete core = make the **hero card** (`renderHero` app.js:1830, fed by `proactive()` 1301) carry a coach beat. `proactive()` already branches by time-of-day — extend it, don't replace it.
3. **APPROACH:**
   - In `proactive()` (app.js:1301), in the default/daytime branch add a **wisdom beat**: when on-track ("On track. Nice." branch, app.js:1307), instead of only "Plan tomorrow," surface today's `WISDOM` card line as the `sub` and add a "🧭 Coach" chip. This makes the always-visible hero proactively coach, not just route.
   - Add a **fundamentals nudge**: if `getFund()` items are missing from today's plan after morning, push a chip "Add your fundamentals ✨" → `enhancePlan(todayK())` (app.js:388). (Reward-framed: "lock in your basics," never "you're behind.")
   - Keep all existing branches intact (regression: the hero is load-bearing for navigation).
4. **CODE POINTERS:** `proactive()` (app.js:1301-1310), `renderHero` (1830), `enhancePlan` (388), `getFund` (387), `WISDOM` (new), `coachSheet` (new, Feature 1).
5. **UI:** Hero card already exists (berry/gradient `#hero`, index.html:31). Add one extra chip and richer `sub` text on the "on track" state. No new surface — fills the existing `pr.chips` + `pr.sub` slots (app.js:1830).
6. **DATA:** reuses `S.profile.coachIdx` (Feature 1). None new.
7. **REGION:** `proactive()` (1301) — same function several other features touch (Features 1, 4). **Coordinate all `proactive()` edits into one pass** to avoid conflicts.
8. **EFFORT:** **S** (additive chips + sub text inside existing branches).
9. **RISKS:** Medium-low. `proactive()` feeds the hero which is central to nav — every branch must still set `out.primary` (a missing primary breaks `renderHero` app.js:1830, which calls `pr.primary.label`). Test that every time-of-day branch still renders. NOT a timeline change. Don't over-nudge (David wanted welcoming, not nagging — audit ~386).

---

## OUT-OF-CLUSTER / mark vague (noted, not specced here)
- **"Feel like The Sims for real life"** (audit ~341) — belongs to the world/game cluster, not coach.
- **"No-shame world: never darkens"** (audit ~351) — it's a *timeline-render* tension (HIGH RISK, owned by the redesign handoff); honor the no-shame *tone* in all coach copy above but do not change blockStatus/ghost rendering here.
- **"Unify fractured systems into one living loop"** (audit ~356) — architectural/rebuild goal, not a discrete coach feature.
- **Composable self-help stack with per-section durations** (audit ~744) — adjacent (self-help modules) but is a *stack-builder UI*, properly a planner/ritual cluster item; the coach Wisdom library (Feature 2) is the coach-side slice.

---

## BUILD ORDER (for the build-agent)
1. Author `WISDOM` + `WSRC` + `PROMPTS` + the `load()` migration (shared foundation). **Run copy through `audit-loop` for voice.**
2. Feature 5 (brain injection) — smallest, highest leverage, no UI.
3. Feature 1 (`coachSheet`) — the home for Features 2/3/4 content.
4. Features 2/3/4 — populate `coachSheet` sections.
5. Feature 6 — wire proactive hero beats LAST, in a single `proactive()` pass (also lands the small edits Features 1 & 4 need there).

**Ship:** `bash _dev/preship.sh` → commit → push → hand David the `/fresh.html` link. Preview proves boot + sheet renders + taps; it does NOT prove gesture feel (none here use gestures, so preview coverage is good for this cluster). Mark the brain output quality DEVICE/LLM-untested until David tries it with his key.
