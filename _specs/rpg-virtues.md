# SPEC — RPG system & virtues (cluster `rpg-virtues`)

Build-ready specs for the Gamification/RPG + Vision/philosophy backlog cluster. Source: `GRAND-AUDIT-2026-06-26.md`. Grounded against the real code regions noted per feature.

## Shared context the build-agent must hold

**The existing stat engine (read before touching anything):**
- `VIRTUES` array — 8 virtues `zest/disc/love/courage/wisdom/curiosity/gratitude/hope` (`app.js:1172-1181`). `VCLASS` = title per virtue (`app.js:1182`).
- `virtueOf(e)` — maps an activity/habit to ONE virtue by keyword/catK (`app.js:1183-1195`).
- `virtues()` — computes XP from last-14-days logs + habit-dones + base survey, returns `{list[], level, top}`; level = `1 + floor(x/90) + (focus?1:0)` (`app.js:1254-1261`).
- `PERKS` — per-virtue skill threads, each `{n,e,desc,r:[thresholds],m:fn}` where `m()` counts matching activities via `actCount(re)` (`app.js:1345-1354`). `OCC_PERK` = one bonus perk keyed off occupation (`app.js:1355`), surfaced by `occPerk(vk)` (`app.js:1356`).
- `virtueDetail(v)` — the skill-tree sheet that renders a virtue's perks with pip ranks + progress bars (`app.js:1357-1372`).
- Profile shape lives in `S.profile`: `{gender,age,vibe,stages[],occ,goals,wake,sleep,peak,lark,set, focus[], base:{virtue:{},perk:{}}, survey:{}, fundamentals[], masterpiece[], gratList[]}`. Written by `finish()` in `onboard()` (`app.js:1146-1154`) and `charSheet()` (`app.js:2909-2934`).
- Self-rating: `SURVEYQ` (10 Qs, `app.js:2994-3005`) × `SCALE` (4 levels, `app.js:3006`) → `applySurvey()` writes `S.profile.base.{virtue,perk}` (`app.js:3007`). Sheet = `surveySheet()` (`app.js:3008-3019`).
- Onboarding: `onboard()` 8-step flow (`app.js:1135-1171`), `LIFESTAGES` (22, `app.js:1093-1105`), `STAGE_BASE/STAGE_EXTRA` (`app.js:1110-1134`), `OCCUPATIONS` (`app.js:207-239`).

**Helpers to REUSE (never re-implement):** `el(id)`, `add(p,tag,cls,txt)` (`app.js:1313`), `esc()` (`app.js:285`), `mixHex(a,b,t)` (`app.js:286`), `mixDark(hex)` (`app.js:287`), `dur(m)` (`app.js:94`), `fmt(min)` (`app.js:93`), `openSheet()/closeSheet()` (`app.js:2907-2908`), `save()` (`app.js:1200`), `blocks(k)`, `logs(k)`, `actCount(re)` (`app.js:1342`), `toast()` (`app.js:1210`).

**LOCKED design rules (apply to every UI sketch below):**
- Deep berry/wine palette + the `DOM` domain colors (`app.js:249-259`). NO neon / glow / shine / white surfaces. Bubbles are deep jewel fills with subtle stripes; ink edge `#160510`.
- The pink now-line is the BRIGHTEST thing on screen — nothing else may out-glow it.
- One activity at a time. Reward-never-shame (Withers): never show a deficit, a red bar, a "low" rating, or "you're behind". Frame everything as growth/room-to-grow.
- Full-screen, low clutter.
- **The timeline render (`calendarView` ~line 2080-2300, `buildPull`, the pull-sheet) is FRAGILE — rebuilt 3×.** NONE of the specs in this cluster need to touch it. If any approach starts editing timeline geometry, STOP — flag it HIGH RISK and reconsider. All work here lives in the **You-tab / sheet / onboarding** regions, which are safe.
- **SCHEMA migration rule (CLAUDE.md):** `SCHEMA=1` at `app.js:75`; migrations run in `load()` (`app.js:1199`). Any new persisted field must be defaulted in `load()` (guard `S.profile`/`S.profile.X == null`). A silent shape change wipes David's real data. New nested objects must be created lazily, never assumed.

---

## F1 — More nuanced / complex self-rating system

**(1) ASK:** _"Self rating system way to simple should be a lot more nuanced and complex and clever"_ (`audit:247`, med).

**(2) BUILDABLE: yes.** Concrete = expand `SURVEYQ` depth + grade quality, keep it no-shame.

**(3) APPROACH:**
- Grow `SURVEYQ` from 10 flat Likert Qs to a **two-axis** model per perk: keep the existing frequency question, ADD a second dimension the audit calls "nuanced" — **consistency/streak-feel** and **stage-relative context**. Concretely, give each `SURVEYQ` entry an optional `w` (weight) and a `band` so questions group under a virtue header in the sheet (e.g. ZEST: 2 Qs, DISCIPLINE: 2 Qs) instead of a flat list.
- Add a 5th SCALE step `["New to me","Sometimes","Often","Most days","It's who I am"]` — five aspirational rungs, all positive (no "Rarely/Never"; "New to me" replaces the shame-laden bottom). Update `applySurvey()` multiplier accordingly (`a * 60` → keep linear; with 5 steps top stays bounded).
- Make the survey **adaptive**: only ask the questions for virtues the user marked as `focus` (from `charSheet`) FIRST, then offer "map the rest" — the audit's "clever" = don't force all 10 cold. The batch logic already exists (`surveySheet` `batch`/"map a few more", `app.js:3014-3017`); reorder `batch` so `focus` virtues' Qs come first.
- Keep `applySurvey()` writing to `S.profile.base.{virtue,perk}` — downstream `virtues()` and `virtueDetail()` already consume it, so NO downstream change needed.

**(4) CODE POINTERS:** `SURVEYQ` (`app.js:2994-3005`), `SCALE` (`app.js:3006`), `applySurvey()` (`app.js:3007`), `surveySheet()` (`app.js:3008-3019`), consumers `virtues()` `bvx` (`app.js:1258`) + `virtueDetail()` `basePerk` (`app.js:1362-1364`).

**(5) UI (locked palette):**
```
┌ sheet (berry #fff3fb card already exists) ──────────┐
│ 📊 Calibrate your map                               │
│ map your focus virtues first — add more anytime     │
│                                                     │
│  ⚡ ZEST                  ← virtue band header,     │
│  🏃 How often do you move?   color = DOM/virtue c   │
│   [New to me][Sometimes][Often][Most days][It's me] │  ← 5 chips, .sv style, no white
│  🥗 Sleep & food dialed in?                         │
│   [ · · · · · ]                                     │
│                                                     │
│  mapped 4/16 · ➕ map a few more                     │
│  [ Done for now ✓ ]                                 │
└─────────────────────────────────────────────────────┘
```
Reuse existing `.qline` / `.facerow2` / `.sv` classes (already styled, `app.js:3016`). Band header = `add(B,"div","ob-dh", "⚡ ZEST")` colored with the virtue's `c`.

**(6) DATA:** `S.profile.survey` already a map `{qi:scaleIndex}`. Adding Qs grows the index space — **safe**, unanswered Qs are skipped (`if (a)` guard in `applySurvey`). `S.profile.base` already migrated implicitly (read with `|| {}`). No `load()` change strictly required, but ADD `if (S.profile && S.profile.survey == null) S.profile.survey = {};` defensively near `app.js:1199`. NO SCHEMA bump needed (additive, back-compatible).

**(7) REGION:** survey sheet + perk band copy. Self-contained; only shared surface is `S.profile.base` (read by F2/F4).

**(8) EFFORT: M.**

**(9) RISKS:** Adding SCALE steps changes the numeric ceiling of `base.virtue` → could inflate everyone's levels at once (cosmetic, not data-loss). Keep `a*60` linear and verify a fully-mapped profile doesn't jump >2 virtue levels vs today. No timeline contact. Withers check: confirm no chip/label reads as a deficit.

---

## F2 — Johnson's 8 cardinal virtues, no implied low rating (Withers)

**(1) ASK:** _"Brian Johnson's 8 cardinal virtues should be considered. But also per Brian Withers we don't want to imply someone has low rating cuz that will lower their self esteem"_ (`audit:232`, BIG).

**(2) BUILDABLE: yes.** Two parts: (a) relabel the 8 to Johnson's canonical set, (b) audit/enforce the no-low-rating framing.

**(3) APPROACH:**
- **Relabel, don't restructure.** Johnson's canonical 8 = **Energy, Wisdom, Self-Discipline, Love, Courage, Gratitude, Hope, Curiosity**. Current keys are `zest/disc/love/courage/wisdom/curiosity/gratitude/hope`. Map: `zest→Energy`, `disc→Self-Discipline`; the other 6 already match. **Keep the `k` keys unchanged** (they're referenced in `virtueOf`, `PERKS`, `OCC_PERK`, `SURVEYQ`, `S.profile.base`, `S.profile.focus`, `S.profile.survey`) — change ONLY the `l` (label) and optionally `VCLASS`. Editing keys would break saved `focus[]` and require a migration; editing labels is free.
  - `VIRTUES` `l`: `"Zest"→"Energy"`, `"Discipline"→"Self-Discipline"` (`app.js:1173-1180`).
  - `VCLASS`: `zest:"The Vital"→"The Energized"`, `disc:"The Disciplined"` stays (`app.js:1182`).
- **No-low-rating enforcement (Withers) — the real meat of the ask.** Sweep every virtue/perk surface and guarantee:
  - **Floor every level at Lv 1**, never Lv 0, never "—". Already true (`lv = 1 + floor(...)`, `app.js:1259`) — keep it.
  - **Never render a number that reads as a score-out-of-N.** `virtueDetail` shows "Lv N" + pip ranks (`app.js:1359,1367`) — pips fill UP, empty pips are "room to grow," not "missing." Add copy under the title: _"every virtue grows — none can go down."_
  - **Replace any "X more to rank N" that could feel like a debt** with growth framing: current `app.js:1368` says `"▸ desc — N more to rank N"`. Keep but prefix with `"keep going · "`. NEVER show "you're at the bottom" / "weakest".
  - **`virtues().top`** is shown (`renderChar` `app.js:1837`, `renderHero` `app.js:1830`) — that's the STRENGTH. Good. **Do NOT ever surface `.bottom`/weakest** anywhere.
- Add a one-line attribution in the skill-tree sub-header: _"the 8 virtues (after Brian Johnson) — Withers' rule: we only ever grow."_

**(4) CODE POINTERS:** `VIRTUES` (`app.js:1172-1181`), `VCLASS` (`app.js:1182`), `virtueDetail` copy (`app.js:1359-1368`), `renderChar` (`app.js:1837`), `renderHero` cap (`app.js:1830`).

**(5) UI:**
```
┌ skill-tree sheet ───────────────────────────────────┐
│ ⚡ Energy · Lv 3            ← was "Zest"             │
│ the 8 virtues (after Brian Johnson)                  │
│ Withers' rule: we only ever grow ✦                   │
│                                                      │
│ 🏃 Athlete   ●●●○   keep going · 5 more to rank 4    │  ← pip thread, fills up only
│ 🥗 Well-Fed  ●●○○   keep going · …                   │
│ [ Do it now ▶ ]                                      │
└──────────────────────────────────────────────────────┘
```
Pip dots use the virtue `c` for filled, `mixHex(c,'#160510',.6)` for empty (NOT a red/grey "missing" — a dim version of the same color = room to grow). No glow.

**(6) DATA:** Label-only change = zero migration. (If a future agent insists on renaming keys `zest→energy`, that REQUIRES a `load()` migration remapping `S.profile.focus`, `S.profile.base.virtue` keys, and a `SCHEMA` bump — explicitly out of scope; flag it.)

**(7) REGION:** `VIRTUES`/`VCLASS` constants + `virtueDetail` copy + char/hero captions. Constants are read EVERYWHERE — label edits are safe, key edits are not. Coordinate with F1/F4 which also read `base`.

**(8) EFFORT: S** (labels + copy sweep).

**(9) RISKS:** The trap is a build-agent "tidying" by renaming keys — that silently wipes `focus`/`base`. Spec forbids it. Withers sweep must be exhaustive: grep for "weak", "low", "lowest", "0", "behind", "missing" across `app.js` virtue/perk surfaces and confirm none leak. No timeline contact.

---

## F3 — Character creation with many stats, starting from age & gender

**(1) ASK:** _"Workouts per week now and goal and weight is just one of many stats that should be part of create a character. Starting with age and gender"_ (`audit:252`, med).

**(2) BUILDABLE: partial → concrete version.** Age+gender already captured; add a **stats block** (weight + goal weight, workouts/week now + goal, plus 2-3 more) to the character editor and persist them as `S.profile.stats`.

**(3) APPROACH:**
- Add a `S.profile.stats` object: `{ weight, weightGoal, exNow, exWant, sleepGoalH, waterGoal }` (all optional numbers). `exWant` is ALREADY referenced live in `proactive()` (`app.js:1308`) but is **dead — set nowhere**; this feature finally sets it, lighting up the existing "workout (n/goal this wk)" nudge for free.
- Add a **STATS step** to `charSheet()` (currently 3 steps: basics → work → path, `app.js:2909-2934`). Insert a new step (make `STEPS=4`) between basics and work: a compact numeric grid. Reuse the existing `numIn(ph,val)` helper (`app.js:2913`).
- Read `exNow`/`exWant` so the existing `weeklyWorkouts()` (`app.js:1252`) comparison in `proactive()` activates. Show weight + goal as a stat row on the char card (`renderChar`, after the `pfline`, `app.js:1838`) — framed as progress, never shame ("82 → 78kg · on your way", never "overweight").
- Also expose these in `onboard()` as an OPTIONAL late step (or leave to char-editor only to keep onboarding short — RECOMMEND char-editor only; onboarding is already 8 steps and David has asked to keep it lean).

**(4) CODE POINTERS:** `charSheet()` (`app.js:2909-2934`), `numIn` (`app.js:2913`), `collect()` (`app.js:2914`), `proactive()` `exWant` block (`app.js:1308`), `weeklyWorkouts()` (`app.js:1252`), `renderChar` pfline (`app.js:1838`), `finish()` profile write (`app.js:1149-1150`).

**(5) UI (new charSheet step):**
```
┌ sheet ──────────────────────────────────────────────┐
│ 📈 Your stats           (1 of 4)                     │
│ optional — these power your nudges                    │
│                                                      │
│  WEIGHT       [ 82 ] kg   →  GOAL [ 78 ]             │
│  WORKOUTS/WK  [ 2  ]      →  GOAL [ 4  ]             │
│  SLEEP GOAL   [ 8  ] h                               │
│  WATER GOAL   [ 8  ] cups                            │
│                                                      │
│ [← back]            [ Next → ]                        │
└──────────────────────────────────────────────────────┘
```
Inputs reuse the existing `input[type=number]` berry style (`index.html`, `--ink` border). Stat row on char card: `🏋️ 2→4/wk · ⚖️ 82→78kg` via `add(L,"div","pfline", …)`.

**(6) DATA:**
```js
S.profile.stats = { weight:null, weightGoal:null, exNow:null, exWant:null, sleepGoalH:null, waterGoal:null };
```
`load()` migration (near `app.js:1199`, inside the profile guards):
```js
if (S.profile) S.profile.stats = S.profile.stats || {};
```
`collect()` in charSheet writes `prof.stats.X = inputs.X.value ? +inputs.X.value : null`. Bump `SCHEMA` to 2 only if you want a clean marker (not required since field is additive + guarded). **Keep `exWant` mirrored to `S.profile.exWant` OR update `proactive()` to read `S.profile.stats.exWant`** — pick ONE source; recommend reading `stats.exWant` and patching `app.js:1308` accordingly.

**(7) REGION:** charSheet + char card + one `proactive()` line. Touches `S.profile` shape — coordinate with any agent editing `finish()`/`onboard()`.

**(8) EFFORT: M.**

**(9) RISKS:** Must default `stats` in `load()` or `proactive()`/charSheet throws on old saves. Withers: weight/goal must never render as judgement. The `proactive()` nudge already exists and is no-shame ("n/goal this wk") — just confirm. No timeline contact.

---

## F4 — Complex, dynamic, adaptable RPG system for different people & life-stages

**(1) ASK:** _"a more complex and clever rpg system that is genius and dynamic and adaptable to different style of people at different stages in their life"_ (`audit:227`, BIG).

**(2) BUILDABLE: partial → concrete version.** The "genius dynamic AI" framing is vague; the buildable core = make the perk/virtue set **adapt to the user's stages + occupation** instead of a fixed table, and add **stage-aware perk threads** so a parent, a founder, and a student see different skill trees.

**(3) APPROACH (do the concrete, skip the hand-wavy):**
- **Stage-driven perk injection.** Today only `OCC_PERK` adds one occupation perk (`app.js:1355-1356`). Add a `STAGE_PERK` table keyed by `LIFESTAGES.k` (parent → "Present Parent" under love; athlete → "In Training" under zest; caregiver → "Carer" under love; retired → "Second Act" under curiosity; etc.). In `virtueDetail`, after `occPerk`, also unshift any matching `stagePerk(v.k)` for each of `S.profile.stages`. This makes the skill tree visibly different per life-stage — the audit's "adaptable to people at different stages."
- **Dynamic weighting (the "clever" part, kept deterministic, not AI).** Add `virtueWeights()` derived from `S.profile.stages` + `occ` + `goals`: a small multiplier table so a founder's `courage`/`disc` XP counts slightly more toward "your path," and the top-virtue display reflects who they're trying to become. Apply only to the **display/`top` selection**, NOT to the raw XP (keep raw XP honest). E.g. in `virtues()`, compute a `weighted` score for `top` selection only.
- **Per-person starting tilt.** `applySurvey()` + the new stage perks already seed `base`. Add: at onboarding `finish()`, seed `S.profile.base.virtue` with a tiny stage-based starter (e.g. student → +wisdom, founder → +courage) so day-1 trees aren't identical — a "character class" feel without locking anyone out.
- DO NOT attempt a "learns over time / infers preferences" model — that's the dead `exWant`-style ambition; the audit itself flags adaptation is "rule/keyword-table driven." Make the tables richer and stage-aware. That IS the realistic win.

**(4) CODE POINTERS:** `OCC_PERK`/`occPerk` (`app.js:1355-1356`), `PERKS` (`app.js:1345-1354`), `virtueDetail` perk merge (`app.js:1361`), `virtues()` top selection (`app.js:1260`), `LIFESTAGES` (`app.js:1093-1105`), `finish()` (`app.js:1146-1154`), `S.profile.stages` (`app.js:1149`).

**(5) UI:**
```
skill tree for a PARENT (love virtue) vs a FOUNDER (courage):
┌ ❤️ Love · Lv 2 ─────────────┐   ┌ 🦁 Courage · Lv 3 ────────┐
│ 👨‍👧 Present Parent  ●●○○      │   │ 🤝 The Closer  ●●●○         │  ← OCC_PERK
│ 💞 Connector       ●●○        │   │ ✦ Shipper      ●●○○         │
│ 🪞 Open Heart      ●○○        │   │ 🦁 Bold        ●○○          │
└──────────────────────────────┘   └────────────────────────────┘
   stage perk only appears for parents     occ perk only for founders
```
Same `.perk` card styling as `virtueDetail` (`app.js:1365-1369`); no new CSS.

**(6) DATA:** New const `STAGE_PERK` (code-only, no storage). `S.profile.base.virtue` starter seed at `finish()` is just numbers into the existing migrated object — no new field, no SCHEMA bump. Add `stagePerk(vk)` helper next to `occPerk` (`app.js:1356`).

**(7) REGION:** perk tables + `virtueDetail` + `virtues()` top calc + `finish()`. Heavily overlaps F2 (virtue constants) and F1 (`base`) — **same agent should ideally do F1+F2+F4 together** to avoid merge conflicts in `virtues()`/`virtueDetail`/`applySurvey`.

**(8) EFFORT: L.**

**(9) RISKS:** Weighting the `top` display can make someone's shown class flip confusingly — keep weights gentle (≤1.3×) and only on `top`, never on `lv`. Stage perks must use the SAME no-shame pip thread (room-to-grow, F2 rule). Risk of double-counting if a stage perk + occ perk share a regex — dedupe by perk name `n`. No timeline contact.

---

## F5 — Tiered gamification (Duolingo-low → survival-game-high), MVP per level

**(1) ASK:** _"minimum is inspired by something like Duolingo... high end is full interactive game where cleaning my room earns me points I can use to survive"_ (`audit:43`, VISION, asked ×3).

**(2) BUILDABLE: partial → concrete version.** A full survival sim is out of scope for this cluster (it's the game-canvas region, not the RPG/profile region). The buildable RPG-side slice = a **game-intensity setting** that scales how loud the gamification is, so David can dial Duolingo-simple ↔ rich-RPG without us building a survival engine now.

**(3) APPROACH:**
- Add `S.profile.gameMode` ∈ `"gentle" | "balanced" | "full"` (default `"balanced"`). A selector in the You-tab / char-editor.
- Wire it to existing surfaces (cheap, high-leverage):
  - `gentle` = Duolingo-tier: show ONLY streak + one daily "did you grow today" (`hasShippedToday`, `app.js:1856`), HIDE the spark counter, perks collapsed. Minimal.
  - `balanced` = today's default: spark + virtues + plant-in-world.
  - `full` = surface everything: spark, all perk threads expanded by default, stage perks, the walkable world prominent.
- Implement as **visibility gates**, not new mechanics: `renderGame()` (`app.js:1858`), `renderChar()` (`app.js:1833`), `renderHero()` cap (`app.js:1830`) each check `gameMode` and show/hide. This delivers the "MVP per level" ask honestly without a fake survival game.
- Explicitly DEFER the survival/pirates/natives layer (game-canvas cluster, `openGame`/`drawWorld` `app.js:1549`) — note in handoff it's a separate large build.

**(4) CODE POINTERS:** `renderGame()` (`app.js:1858-1867`), `renderChar()` (`app.js:1833-1847`), `renderHero()` (`app.js:1830`), `hasShippedToday()` (`app.js:1856`), `S.game` (`app.js:1198`).

**(5) UI (setting in You-tab):**
```
┌ char card footer ───────────────────────────────────┐
│ GAME FEEL                                            │
│ [ 🍃 Gentle ] [ ⚖️ Balanced ] [ 🎮 Full ]            │  ← .pchip row, one .on
│ gentle = just streaks · full = the whole RPG         │
└──────────────────────────────────────────────────────┘
gentle view of You-tab: streak ring + "today grew ✓", nothing loud.
```
Reuse `.pchip` chips (`index.html:91`). No new colors.

**(6) DATA:** `S.profile.gameMode` (string). `load()`: `if (S.profile) S.profile.gameMode = S.profile.gameMode || "balanced";` (near `app.js:1199`). Additive, no SCHEMA bump.

**(7) REGION:** You-tab renderers (`renderGame`/`renderChar`/`renderHero`) + a setting chip. No timeline contact.

**(8) EFFORT: M** (gates are simple; the discipline is NOT building the survival engine here).

**(9) RISKS:** Scope creep — the ask name says "survival game"; resist building it in this cluster. Keep to the dial. `gentle` hiding spark must not break `earn()` (it still accrues, just hidden). Confirm hiding/showing doesn't leave a dangling `el("upgrades")` rebuild bug. No timeline contact.

---

## F6 — Clicking the character opens a character card / skills / stats

**(1) ASK:** _"You clip in your character. You see a character card... clicking character is for character skills and stats"_ (`audit:262`, med).

**(2) BUILDABLE: yes.** Today tapping the in-world fairy calls `heroMenu()` → `mindmapSheet()` (`app.js:1757`, the identity map). David wants it to open a **character card (skills/stats)** instead.

**(3) APPROACH:**
- Repoint `heroMenu()` from `mindmapSheet()` to a new `characterCard()` sheet that shows: name/class (`VCLASS[top]` + `Lv`), the age/gender/goals line, the new stats block (F3), and a tappable grid of the 8 virtues → each opens `virtueDetail()` (the skill tree). Add a small "🌳 See your life (map)" link at the bottom so the mindmap isn't lost.
- `characterCard()` is mostly a re-compose of what `renderChar()` already builds (`app.js:1833-1847`) but in a `#sheet` so it's reachable from inside the world. Reuse `virtues()`, `VCLASS`, `virtueDetail`, the F3 stat row.
- Keep the You-tab itself unchanged (it already is the stats home); this just makes the **in-world character tap** consistent with David's mental model ("clicking character = skills and stats").

**(4) CODE POINTERS:** `heroMenu()` (`app.js:1757`), `mindmapSheet()` (`app.js:467`), `renderChar()` (`app.js:1833`), `virtueDetail()` (`app.js:1357`), `virtues()` (`app.js:1254`), `VCLASS` (`app.js:1182`).

**(5) UI:**
```
┌ characterCard sheet (tap the fairy) ────────────────┐
│  🧚 The Sage · Lv 4                                  │
│  🧬 30s ♂ · 🎯 ship the app                          │
│  🏋️ 2→4/wk · ⚖️ 82→78kg          ← F3 stat row       │
│                                                      │
│  ⚡  ⚔️  ❤️  🦁     ← 8 virtue tiles, tap → skilltree │
│  🦉  🔭  🙏  🌅                                       │
│                                                      │
│  🌳 See your life (map) →                            │
└──────────────────────────────────────────────────────┘
```
Virtue tiles reuse `.gtile` / `.tilegrid` (already used in `charSheet`, `app.js:2926`). Tile fill = virtue `c` deepened (`mixHex(c,'#160510',.4)`), no glow.

**(6) DATA:** None new (reads existing profile/virtues). Depends on F3 for the stat row (degrade gracefully if `stats` empty).

**(7) REGION:** `heroMenu` rebind + new `characterCard()` sheet. Self-contained; no timeline contact. Note: `heroMenu` is the in-world tap handler — confirm no other caller depends on it returning the mindmap.

**(8) EFFORT: M.**

**(9) RISKS:** Don't DELETE `mindmapSheet` — keep it reachable (the "See your life" link + the existing You-tab button `app.js:1842`). Withers: virtue tiles must not show a "weakest" highlight. No timeline contact.

---

## Build order & parallelization

- **One agent should own F1 + F2 + F4** — they all read/write `S.profile.base`, `virtues()`, `virtueDetail()`, `applySurvey()`, and the virtue constants. Splitting them across agents = guaranteed merge conflict in the same ~120 lines (`app.js:1254-1372`, `2994-3019`).
- **F3 + F6** can be a second agent (charSheet + character card + stat row share the stat block; F6 consumes F3).
- **F5** is independent (visibility gates in renderers) — safe for a third agent, but it reads `S.profile` so land it after the profile-shape work or coordinate the `load()` defaults block.
- **No feature in this cluster touches the timeline render.** If any does, it's wrong — stop and re-scope.
- Every persisted field (`stats`, `gameMode`) MUST be defaulted in `load()` (`app.js:1199`) or old saves crash. No SCHEMA bump is required for additive guarded fields; only bump + write a migration if a key is RENAMED (forbidden in F2).
