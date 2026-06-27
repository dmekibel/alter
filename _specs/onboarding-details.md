# SPEC — Onboarding: inputs & adapts (`onboarding-details`)

Build-ready specs for the **Onboarding** cluster from `GRAND-AUDIT-2026-06-26.md`. All line numbers are **current `app.js`** (verified this session; the audit's numbers were stale by ~40 lines).

## Shared context the build-agent must know first

The whole flow lives in **`onboard()` — app.js:1135–1171**. It is a self-contained closure: a `data` object (app.js:1136), a `step` counter (`STEPS = 8`, app.js:1137), one `draw()` (app.js:1155) that does `body.innerHTML = ""` then renders the current step, `next()`/`finish()`, and helpers `chip()`, `keys()`, `seedKept()`, `typeRow()`. Steps today:

| step | content | code |
|---|---|---|
| 0 | Sage intro | app.js:1158 |
| 1 | vibe (VIBES2) | app.js:1159 |
| 2 | gender + age | app.js:1160 |
| 3 | life-stage multi-select (LIFESTAGES) + type-in | app.js:1161 |
| 4 | "Stock your life" bento (grouped by DOM_ORDER) + type-in | app.js:1162 |
| 5 | goals (GOAL_SEED) + type-in | app.js:1163 |
| 6 | rhythm: wake / sleep / peak | app.js:1164 |
| 7 | "world ready" | app.js:1165 |

`finish()` (app.js:1146) writes `S.profile` (`P.gender/age/vibe/stages/occ/goals/wake/sleep/peak/lark/set`), pushes typed activities into `S.acts`, builds `S.goals`. **Anything new must be persisted here.**

**Key data/helpers to reuse (do NOT reinvent):**
- `data` object app.js:1136 — add new fields here.
- `chip(p, label, on, color, ink)` app.js:1141 — the onboarding chip. `on` → `box-shadow:0 0 0 3px #ffd54a` (the gold "selected" ring, CSS .ob-ch.on index.html:895).
- `typeRow(placeholder, onAdd)` app.js:1144 — the "TYPE IT" fallback row.
- `LIFESTAGES` app.js:1093, `GOAL_SEED` app.js:1107, `STAGE_BASE` app.js:1110, `STAGE_EXTRA` app.js:1111, `VIBES2` app.js:1106.
- `CATS` app.js:174 (the full base library, incl. `hobby`/`Hobbies` group app.js:194–200), `OCCUPATIONS`/`OCC_BY_K` app.js:207/240, `allActivities()` app.js:2582 (flattens CATS + occ-work + S.acts into `{title,catK,habitId,domain,color,group}`), `bentoByDomain()` app.js:2590.
- `DOM` (8-domain palette) app.js:249; `DOM_ORDER` app.js:2581; `domainOf()` app.js:274; `mixDark()` app.js:287; `mixHex()`.
- `dayWindow()` app.js:91, `wakeHour()` app.js:89, `DAYSTART` app.js:80, `fmtHour()` app.js:602, `WAKE_OPTS`/`BED_OPTS` app.js:600/601, `wakeBedSheet()` app.js:604.
- `meditation()` app.js:1982, `GUIDES`/`FREQ`/`cfg` inside it.
- `load()` app.js:1199, `SCHEMA = 1` app.js:75. **Profile is plain `S.profile`; there is NO migration gate on it today** — `load()` only normalizes habits/game/etc. New profile fields are read defensively everywhere (`S.profile && S.profile.x`), so **no SCHEMA bump is strictly required** unless you reshape existing arrays. See each feature's DATA note.

**CSS classes available (index.html ~883–913):** `.ob-card .ob-bar .ob-body[.center] .ob-q .ob-sb .ob-lbl .ob-row .ob-col .ob-ch[.on] .ob-dh .ob-libsec .ob-addrow .ob-input`. **Reuse these; do not invent off-palette styles.** Card bg `#34091f`, chip bg `#48122f`, ink `#ffd9ec` — the deep-berry onboarding palette. The progress bar is `(step+1)/STEPS` (app.js:1156) — **if you add/remove steps, `STEPS` must change or the bar lies.**

### LOCKED rules that constrain every feature here
- Deep berry/wine surfaces only; **no neon / glow / shine / white**. Onboarding already obeys (`#34091f` card). New chips must use `DOM[d].c` fills + `DOM[d].ink` text or the existing `.ob-ch` berry default.
- One activity at a time; reward-never-shame. The exercise-per-week + weight features below must be framed as **aspiration, never deficit** ("you'd like 4/wk" not "you're failing 1/4").
- Onboarding does **NOT** touch the timeline render — **none of these are HIGH RISK on the fragile timeline**, with one exception flagged below (the day-resolution feature, which only *reads* `dayWindow()` and writes wake/sleep — it must not change `dayWindow()`/`DAYSTART` logic).

---

## 1. Hobbies bento: much bigger, grouped, multi-select, type-in, niche options

**(1) Ask** (asked ×3): *"the list must be much, much bigger so the person can select all the things they do … it should all be grouped … you should see the bento box, but very greatly expanded."*

**(2) Buildable?** YES. Step 4 already is grouped multi-select with type-in (app.js:1162). The gap is **breadth** — the catalog is moderate and stage-dependent. This is a data-expansion + a "show all, don't truncate" job, not new mechanics.

**(3) APPROACH:**
- **Expand the catalog.** The hobby/play breadth lives in `CATS` "Hobbies" group (app.js:194–200, ~25 items) and gets pulled into step 4 via `allActivities()`→`bentoByDomain()`. Add a deep niche layer. Two clean options:
  - (a) **Grow the `hobby` group in CATS** (app.js:194–200) — append sub-groups: *Crafts* (knit, pottery, woodwork, sew, candle, leather), *Collect* (cards, coins, vinyl, plants), *Outdoor/Sport* (climb, surf, ski, fish, run-club, martial arts, dance, yoga-class), *Make* (3D print, electronics, model-build, brew), *Learn* (language, chess, instrument, course), *Social play* (D&D, karaoke, trivia, escape-room), *Niche* (astrology, tarot, birdwatch, geocache, cosplay, beekeeping). This auto-flows into step 4's `play`/`create` sections AND into the live `bentoPicker` (app.js:2593) — one edit, two surfaces richer.
  - (b) Keep CATS lean and add a dedicated `HOBBY_NICHE` table only loaded in onboarding step 4. **Prefer (a)** — it makes the picker richer everywhere and reuses the existing render with zero new code.
- **Stop truncating in onboarding.** Step 4 currently renders ALL of each domain's acts (app.js:1162, `acts.forEach`) — good, it does NOT truncate (the +N truncation is only in `bentoPicker` overview app.js:2636). So expansion alone delivers the "very greatly expanded" feel. Verify the section is scrollable (`.ob-body{overflow:auto}` index.html:886 — yes).
- **Grouping within hobbies:** today step 4 groups only by the 8 DOMAINS (one "PLAY" header). David wants sub-groups visible. Add an optional **sub-group sub-header** inside the `play`/`create` sections in step 4: `allActivities()` already carries `a.group` (app.js:2584). In step 4's per-domain loop (app.js:1162) bucket `acts` by `a.group` and emit a tiny `.ob-dh`-style sub-label per bucket. Low-risk, cosmetic.

**(4) CODE POINTERS:** `CATS` hobby group app.js:194–200 (expand); step 4 render app.js:1162; `allActivities()` app.js:2582 (carries `group`); `bentoByDomain()` app.js:2590.

**(5) UI (berry palette):**
```
Stock your life ✨
tap everything you do — or want to do · type anything that's missing

PLAY                                        ← DOM.play light header (#f0c860)
  · Music    [Guitar][Piano][Sing][Listen][DJ]
  · Games    [Video games][Board games][Chess][D&D][Puzzle]
  · Outdoor  [Climb][Surf][Hike][Fish][Run club][Dance]
  · Make     [Knit][Pottery][Woodwork][3D print][Brew]
CREATE                                      ← DOM.create light header (#c7adff)
  · Art      [Draw][Paint][Photo][Film][AI art]
...
✦ MISSING SOMETHING? TYPE IT  [ e.g. Bouldering, Cosplay… ]  [+ add]
```
Chips = `.ob-ch` filled with `DOM[d].c`, ink `DOM[d].ink`, gold ring when on.

**(6) DATA:** None new. Expanded CATS entries are static. Typed niches already flow to `S.acts` (step 4 typeRow app.js:1162) and `data.kept`. **No migration.**

**(7) REGION:** `CATS` definition (app.js:174–206) + `onboard()` step 4 (app.js:1162). Touches the same `CATS` array as any "activity library" build-agent — **coordinate to avoid two agents editing CATS at once.**

**(8) EFFORT:** S (mostly data; sub-group headers are M if done).

**(9) RISKS:** Expanding CATS changes `bentoPicker` everywhere (more chips, more `+N`) and `TITLE2CAT`/`TITLE2META` (app.js:243) — make sure new titles are unique (the maps key by lowercase title; a dup silently overwrites). New titles with no keyword match fall through `domainOf()` (app.js:274) → verify they land in the intended domain; add to `T2D`/keyword tables if a niche misroutes. No timeline risk.

---

## 2. Ask exercise-per-week (now vs desired), weight, and goals

**(1) Ask** (med): *"ask u how much u exercises per week versus how much u want and also u tell it ur weight and ur goals."*

**(2) Buildable?** YES. Goals already captured (step 5). Workouts/week + weight existed in v1.2, were dropped in the v2.0 rewrite; re-add. Note: **`proactive()` already reads `S.profile.exWant`** (app.js:1308: `if (S.profile && S.profile.exWant …) { var ww = weeklyWorkouts(); … "🏃 workout (" + ww + "/" + S.profile.exWant + …)" }`) — it's **dead today because `exWant` is set nowhere.** This feature re-activates that live nudge for free.

**(3) APPROACH:** Add a **new step between current step 5 (goals) and step 6 (rhythm)** — a "Body & movement" step — OR fold into the existing step 5 (cheaper, no `STEPS` change). Recommend a **dedicated step** for clarity:
- **Workouts/week now vs desired:** two chip rows, `0,1,2,3,4,5,6,7+`. `data.exNow`, `data.exWant`. (`weeklyWorkouts()` app.js:1252 already computes the *actual* rolling count from logs — `exNow` is just the self-report baseline; keep both.)
- **Weight + goal weight (optional):** two number inputs (kg/lb toggle chip). `data.weight`, `data.weightGoal`, `data.wUnit`. Reuse the `.ob-input` style. Frame as optional ("skip if you'd rather not").
- **Reward-never-shame framing:** label desired as aspiration. Never render "you're behind." The `proactive()` chip (app.js:1308) is already a gentle nudge, not a scold — keep it.
- Persist in `finish()` (app.js:1146): `P.exNow = data.exNow; P.exWant = data.exWant; P.weight = data.weight; P.weightGoal = data.weightGoal; P.wUnit = data.wUnit`.
- **Also expose in the live editor** so it's not onboarding-only: add the same controls to `charSheet()` (app.js:2909) or `wakeBedSheet()`-style sheet. Minimum: add to `charSheet` step 0 (app.js:2917) which already has age/gender/goals inputs.

**(4) CODE POINTERS:** add step in `draw()` after app.js:1163; persist in `finish()` app.js:1146–1153; `STEPS` app.js:1137 (bump 8→9 if dedicated step); consumer already wired at `proactive()` app.js:1308 + `weeklyWorkouts()` app.js:1252; live editor `charSheet()` app.js:2909.

**(5) UI (berry palette):**
```
Body & movement                              (optional — skip anytime)
helps me cheer your training, never nag

WORKOUTS / WEEK — NOW
[0][1][2][3][4][5][6][7+]
WHAT YOU'D LIKE
[0][1][2][3][4][5][6][7+]                     ← desired, framed as aim
WEIGHT (optional)   [  72  ] [kg|lb]
GOAL (optional)     [  68  ]
```
Chips `.ob-ch` (berry default or `DOM.move.c` `#ff8a3a` fill). Inputs `.ob-input`.

**(6) DATA:** new `S.profile` fields `exNow, exWant, weight, weightGoal, wUnit` (all scalar, optional). Read defensively everywhere. **No SCHEMA bump** (additive scalars on the loosely-typed profile; `load()` app.js:1199 doesn't validate profile). If you want history of weight over time, that's a separate `S.weightLog = []` — out of scope; keep it a single current+goal pair.

**(7) REGION:** `onboard()` steps + `finish()` (app.js:1135–1171); `charSheet()` (app.js:2909) if adding live editor. Self-contained — low conflict.

**(8) EFFORT:** S (fold into step 5) / M (dedicated step + live editor).

**(9) RISKS:** If you add a step, **bump `STEPS`** (app.js:1137) or the progress bar (app.js:1156) and `next()` boundary (app.js:1145) break. Keep weight optional + non-shaming (locked rule). No timeline risk.

---

## 3. Meditation adapts to experience level

**(1) Ask** (implied by cluster brief: *"meditation adapts to experience level"*).

**(2) Buildable?** PARTIAL → concrete version. `meditation()` (app.js:1982) is already adaptive on **two axes**: re-anchor frequency (`FREQ` often/some/spacious app.js:1983) and guide (4 teachers app.js:1986–1991) and duration (2/5/10 app.js:2004). It is **not** adaptive on *experience level*. Concrete version: add an **experience selector** that sets sensible defaults for the other three and tunes guidance density.

**(3) APPROACH:** Two parts — onboarding capture + meditation behavior.
- **Capture (onboarding):** in step 4 / or a one-tap micro-question, OR (lighter) infer: if `restore`/`Meditate` is in `data.kept` and they're an existing meditator. Cleanest: add a single chip row in the **goals or rhythm step** OR — better — ask it **the first time `meditation()` runs** (a one-time `S.profile.medLevel` prompt). Levels: `new` / `some` / `experienced`.
- **Behavior (`meditation()` app.js:1982):** map `medLevel` → default `cfg`:
  - `new` → `{mins:2, freq:"often", guide:"headspace"}` (most hand-holding; the existing hint at app.js:2009 already says "0 attention span? pick often").
  - `some` → `{mins:5, freq:"some", guide:"harris"}`.
  - `experienced` → `{mins:10, freq:"spacious", guide:"adya"}` (Adyashanti "rest" = least directive; app.js:1990).
  - These are **defaults only** — user can still override every control (rows app.js:2004–2006). Set `cfg` from `S.profile.medLevel` at the top of `meditation()` (replace the hardcoded `cfg` at app.js:1992).
  - Optional density tune: for `experienced`, longer silences between cues already covered by `freq:"spacious"` (42s, app.js:1983). No new timer logic needed.
- Persist `S.profile.medLevel`. Show a small "matched to you: experienced" subtitle in the build sheet (app.js:1998).

**(4) CODE POINTERS:** `cfg` default app.js:1992; `FREQ` app.js:1983; `GUIDES` app.js:1986; build rows app.js:2004–2006; the gentle hint app.js:2009; capture point = either `onboard()` or a one-time gate inside `meditation()` `build()` (app.js:1994).

**(5) UI (berry/breathe palette — note `#breatheOv` uses a separate purple-ink style, not `.ob-*`):**
```
🧘 Meditate
even a tiny one counts

EXPERIENCE        [new][some][experienced]   ← NEW row, sets defaults below
how long          [2 min][5 min][10 min]
remind me         [often][some][spacious]
guide             [witness][reset][embody][rest]
with Sam Harris
                  [ Begin ▶ ]
matched to you: experienced · adjust anything above
```

**(6) DATA:** new `S.profile.medLevel` (string). Optional. **No SCHEMA bump.** Defensive read: `var lvl = (S.profile && S.profile.medLevel) || "some";`.

**(7) REGION:** `meditation()` (app.js:1982–2027) — self-contained. If captured in onboarding, also `onboard()`. Low conflict.

**(8) EFFORT:** S.

**(9) RISKS:** Don't break the existing override controls — `medLevel` sets *initial* `cfg` only; the rows must still flip `cfg[key]` and `build()` (app.js:2002). Keep the `#breatheOv` styling (it's intentionally its own purple sheet, not berry — leave as-is). No timeline risk.

---

## 4. Resolve logical-day vs calendar-day; establish the day in onboarding

**(1) Ask** (BIG, 2026-06-26): *"There's the concept of today … when you're awake … and a concept of today that ends at midnight … they don't match. How do we deal with that."*

**(2) Buildable?** PARTIAL — mostly already solved in code; the gap is **making it explicit/legible to the user in onboarding.** `DAYSTART = 4am` rollover (app.js:80), `logicalK()` (app.js:81), `dayWindow()` builds a wake−3h → +24h window (app.js:91), `wakeBedSheet()` lets you re-set live (app.js:604) and already shows the resulting frame (app.js:622). Onboarding step 6 captures wake/sleep (app.js:1164) that feed it. The concrete, in-scope deliverable: **a short explainer + a confirmed "your day" preview in onboarding step 6**, so the model is established and understood at setup. **Do NOT redesign `DAYSTART`/`dayWindow()`** — that's the fragile day model the regression contract guards; only surface it.

**(3) APPROACH:**
- In **step 6 (rhythm, app.js:1164)**, after the wake/sleep/peak chips, add the **same "your day on the timeline" hint** that `wakeBedSheet()` renders (app.js:622): compute `dayWindow()` (which reads `S.profile.wake` — note: in onboarding the profile isn't written yet, so compute from `data.wake` via a local wakeHour, OR write `S.profile.wake` early). Show: `your day runs 4am → 4am · timeline frames it ~{startH}→{endH}`. One sentence of plain language: *"A day here ends when you sleep, not at midnight — a 1am activity still counts as tonight."*
- **One micro-choice (optional, recommended):** a single chip pair "DAY RESETS AT" `[4am (default)] [midnight]`. Default 4am. If David later wants a true per-user boundary, store `S.profile.dayReset` (minutes). **For now wire it read-only to `DAYSTART`** OR (if making it live) replace the literal `DAYSTART` reads with `dayStartMin()` returning `(S.profile && S.profile.dayReset) || 240`. **This is the only part touching the day model → treat as MEDIUM RISK** and label DEVICE-UNTESTED until confirmed on phone (regression contract item: vertical scroll across midnight must stay continuous). **Safer default: ship the explainer only, leave `DAYSTART` constant.**

**(4) CODE POINTERS:** step 6 render app.js:1164; copy the hint block from `wakeBedSheet()` app.js:622; `dayWindow()` app.js:91; `DAYSTART` app.js:80; `wakeHour()` app.js:89; `logicalK()` app.js:81. If making reset live: every `DAYSTART` read (app.js:81,83,86,87,91 and grep for others).

**(5) UI (berry):**
```
Your daily rhythm
rough is fine — pick a range
I USUALLY WAKE   [before 6][6–7][7–8]…
I USUALLY SLEEP  [before 10][10–11]…
SHARPEST         [Morning][Night][It varies]

┌────────────────────────────────────────┐  ← reuse wakeBedSheet hint style
│ 🕘 your day on the timeline: 4am → 4am  │  (bg #1c0512, border #160510, ink #ffe3f1)
└────────────────────────────────────────┘
A day here ends when you sleep — not at midnight.
A 1am activity still belongs to tonight.
```

**(6) DATA:** explainer-only = none. If live reset: `S.profile.dayReset` (minutes, default 240). **If live, SCHEMA stays 1** but every consumer must default to 240 — a missing field must behave exactly like today. Add a `load()` default `if (S.profile && S.profile.dayReset == null) S.profile.dayReset = 240;` to be safe.

**(7) REGION:** `onboard()` step 6 (app.js:1164) — isolated for the explainer. The live-reset variant touches the **day-model core (app.js:80–91)** — coordinate with any timeline/day build-agent; do not run concurrently with timeline work.

**(8) EFFORT:** S (explainer) / L (live per-user reset, because it threads through the day model + needs device testing).

**(9) RISKS:** **Live reset = the one timeline-adjacent risk in this cluster.** Changing `DAYSTART` semantics can reintroduce the midnight-cut / snap-back bounce the nav was rebuilt 3× to fix (CLAUDE.md regression contract #1). Strong recommendation: **ship explainer now, defer live reset** unless David explicitly asks. Mark live reset DEVICE-UNTESTED.

---

## 5. App guesses lifestyle; user adds in a few clicks (clever adapt / learns blueprint)

**(1) Ask** (VISION + BIG ×4): *"app … cleverly adapt to users"* / *"learn from the users needs … work at any stage."* Cluster brief: *"app guesses lifestyle, user adds in a few clicks."*

**(2) Buildable?** PARTIAL → concrete version. Today onboarding **captures** then seeds (`seedKept()` app.js:1143 fills the bento from life-stage + occupation), and `proactive()` (app.js:1301) varies guidance by phase/state. The "guesses then user tweaks" half is partly there (`stageSuggest(age)` app.js:1109 auto-selects a stage from age; step 4 pre-checks seeded activities). The missing piece: a **visible "here's my guess — confirm/edit" moment** and (the harder half) **ongoing learning**. Concrete buildable version = the **guess-and-confirm screen**; ongoing learning is a thin, achievable layer.

**(3) APPROACH (two tiers — ship tier A, optionally B):**
- **Tier A — "Here's your starter life, tweak it" confirm step (ship this).** After step 4 seeds via `seedKept()` (app.js:1143), the app already has a strong guess. Make it explicit: a compact summary card — *"Based on {stages} + {occ}, I've set you up with: {N} activities, {goals}. Tap to remove anything that's not you."* This is mostly re-presenting step-4/step-5 selections as a confirmable digest. Reuse the seeded `data.kept` (app.js:1143) and `data.goals`. One screen, all chips pre-on, tap to toggle off — "user adds/removes in a few clicks."
  - Strengthen the guess: `stageSuggest()` (app.js:1109) is age-only. Add **vibe-aware** seeding — `data.vibe` (overwhelmed → seed restore/upkeep lighter; thriving → seed more focus/create). Pre-check a couple of goals from stage too (e.g. founder → "Grow my business").
- **Tier B — light ongoing learning (optional, low-risk).** "Learns the blueprint" doesn't need ML. Add a **preference-inference pass** that runs on app open and quietly promotes what David actually does:
  - Count last-14-day logged titles by domain (`logs()`); the top untracked-but-frequent activity → auto-`togglePin()` (app.js:2592) it to the bento front, or suggest adding to `S.acts`. `frequent()` (app.js:1284) already computes this ranking — reuse it.
  - Surface as a gentle one-time chip in `proactive()` (app.js:1301): *"You've done {X} a lot — pin it?"* One tap = learned. This is the realistic, in-app version of "learns my needs," reusing `frequent()` + `togglePin()` with zero new infra.
- Keep it **a few clicks**, tap-only (memory rule: onboarding via clever selection, not typing).

**(4) CODE POINTERS:** `seedKept()` app.js:1143; `stageSuggest()` app.js:1109 (make vibe-aware); add confirm step after app.js:1162; `frequent()` app.js:1284; `togglePin()` app.js:2592; `proactive()` app.js:1301 (add the "pin what you do" nudge); `data.vibe` app.js:1136.

**(5) UI (berry):**
```
Here's your starter life ✨                  ← Tier A confirm step
based on Founder + Developer · tap to remove anything that's not you

MOVE     [Walk ✓][Gym ✓]
FOCUS    [Deep work ✓][Claude code ✓][Outreach ✓][Plan ✓]
…
GOALS    [Grow my business ✓][Get fit ✓]
                              [ Looks right ▸ ]
```
(later, in the daily feed via proactive())
```
🔭 You've logged "Guitar" 6× lately — pin it to the top?   [pin]
```

**(6) DATA:** Tier A: none new (reuses `data.kept`/`data.goals`). Tier B: reuses `S.pinned` (already exists, app.js:2591) + optional `S.profile.learnedSeen = {}` to not re-nag. **No SCHEMA bump.**

**(7) REGION:** `onboard()` (confirm step) + `proactive()` (app.js:1301, learning nudge) + `seedKept()`/`stageSuggest()`. `proactive()` is shared with other "guidance" build-agents — coordinate if another agent edits the chip list.

**(8) EFFORT:** Tier A = M; Tier B = M. Both shippable; A first.

**(9) RISKS:** A confirm step **adds a step → bump `STEPS`** (app.js:1137) + progress bar (app.js:1156). Tier B must be **non-naggy** (reward-never-shame): one suggestion at a time, dismissible, gate with `learnedSeen`. Don't auto-mutate `S.acts` without a tap (silent changes erode trust). No timeline risk.

---

## Cross-feature build order (recommended)
1. **#1 hobbies catalog** (S, pure data, unblocks the "expanded bento" everywhere).
2. **#3 meditation level** (S, isolated).
3. **#2 exercise/weight** (S/M, re-activates dead `exWant` nudge).
4. **#5 Tier A confirm + vibe-aware seed** (M).
5. **#4 day explainer** (S) — explainer only; **defer live reset (L) unless David asks** (timeline risk).

**Step-count caution:** features #2 (dedicated step) and #5A (confirm step) each add a step. If both ship, `STEPS` goes 8→10 and the progress-bar math (app.js:1156), `next()` boundary (app.js:1145), and the `step === STEPS-1` "world ready" checks (app.js:1157,1165,1166) all key off `STEPS` — update the constant once, verify the bar + the final-step branches. **A second build-agent editing `onboard()` concurrently will collide on `STEPS`/`draw()` — serialize onboarding-step edits.**
