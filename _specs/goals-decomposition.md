# SPEC — Goals: long-term decomposition

Cluster: **goals-decomposition** · Source: `GRAND-AUDIT-2026-06-26.md` (Planning / day-structure + dropped Planning).
Region owner for parallel-build conflict planning: **GOALS pillar** = `app.js:402–464` (`DECOMP_TEMPLATES`, `decomposeGoal`, `activeGoals`, `ensureGoalDefaults`, `scheduleSubtask`, `goalsSheet`). Secondary touch: `sugNext` `app.js:344–348`, onboarding goal-seed `app.js:1232`, `load()` `app.js:1279`.

## Grounding — what exists today (read before building)

The Goals pillar is **one layer deep**:
- `S.goals` = array of `{ title, domain, subtasks:[{title,done,schedK?}], active:bool }`. Seeded in onboarding (`app.js:1232`), added/edited in `goalsSheet` (`app.js:419`).
- `goalsSheet()` → `drawMap()` (grid of goal cards, add-goal input, "few active · Slow Productivity" footer) → tap a card → `drawGoal(g)` (Active toggle, "Break it down for me" via `decomposeGoal`, flat list of subtasks each with check / `scheduleSubtask` / delete, add-step input, delete-goal).
- `decomposeGoal(g)` (`app.js:413`) keyword-matches `DECOMP_TEMPLATES` (7 templates, `app.js:404–412`) → returns **5 flat string steps**. No second tier.
- `scheduleSubtask(g, st)` (`app.js:418`) → `pickSheet` with **Today / Tomorrow / In 3 days** → pushes a 30-min block into `blocks(k)` tagged `goalId: g.title`, sets `st.schedK`.
- `sugNext(k)` (`app.js:345`): each active goal surfaces its **first undone subtask** as a "suggested next" chip on today.
- `activeGoals()` cap is 3 (`ensureGoalDefaults`, Newport "do fewer"). 
- `lifeInvest()` + `mindmapSheet()` (`app.js:466–510+`) = the "see your life" planet map by where 30d of minutes actually went. **This is the closest thing to a "life audit" that exists** — domains as planets sized by real time, drift shown honestly, custom-activity sub-habits branch outward.

### Helpers to REUSE (do not reinvent)
`add(parent,tag,cls,txt)`, `el(id)`, `DOM[domain]` (.c/.light/.dark/.ink/.ti), `DOM_ORDER`, `mixHex`/`mixDark`, `esc`, `fmt`, `dur(mins)`, `hm("HH:MM")`, `blocks(k)`, `logs(k)`, `save()`, `uid()`, `domainOf(x)`, `tiClass(x)`/`tiIcon(x)`, `reflow(k)`, `nextFreeTime(k)`, `key(d)`, `todayK()`/`tomK()`, `pickSheet(q,opts,cb)`, `typeAdd(parent,ph,cb)`, `bentoPicker({...})`, `relLabel(k)`, `toast(msg)`, `renderToday()`, `renderSuggest(k)`.

### LOCKED design rules (honor in every UI here)
- Deep berry/wine palette + per-domain `DOM[d].c` fills. **NO neon / glow / shine / white surfaces.** The pink now-line is the brightest thing on screen — nothing in Goals should out-glow it.
- One activity at a time; reward-never-shame copy.
- Full-screen, low-clutter. Goal sheet is a modal overlay (`.goal-ov`/`.goal-card`), reuse its CSS classes.
- Goals sheets are overlays, **NOT** the timeline render → most of this cluster is LOW render-risk. Only `scheduleSubtask`'s push into `blocks()` + `reflow` touches calendar data (MED risk).

---

## FEATURE 1 — Recursive goal decomposition (grand → sub → sub → daily) ★ headline

**(1) Ask** (audit:511, asked ×2, 🟦 BIG): *"plan grand things on a super long term level than breaking it down into subtask... all the way down to a day to day level."*

**(2) Buildable?** YES (the audit's stated gap is exactly "one layer deep").

**(3) Approach** — make `subtasks` a recursive tree. Each node gains an optional `children:[]` of the same shape (mirrors the **already-shipped** `S.acts[].children` sub-habit pattern at `app.js:485,590`). 
- Render `drawGoal` as a **nested, indented, collapsible tree** (max depth 3: goal → milestone → sub → daily-step). Each node row: check (rolls up — a node is "done" when all leaf descendants are done OR it's a leaf and checked), expand/collapse caret (only if it has children), title, "break this down" wand (calls `decomposeGoal` on the node's title to emit child steps), schedule (leaf-only), add-child input, delete.
- `decomposeGoal` already accepts any `{title}` — call it on a **subtask node** to generate that node's children. Pass the node, not just `g`. This gives recursion for free: break the goal → 5 milestones; tap "break down" on a milestone → 5 sub-steps; tap on a sub-step → daily reps.
- "Break it down for me" at the goal level stays; each node gets its own inline wand when it has 0 children.
- Schedule is **leaf-only** (`gs-sched` shown only when `!node.children.length`) — you schedule the day-to-day atoms, not the abstract milestones.

**(4) Code pointers** — rewrite `drawGoal(g)` (`app.js:443–462`) to recurse via a `function stepRow(node, depth, parentArr)` helper. Generalize `decomposeGoal(g)` (`app.js:413`) to `decompose(titleOrNode)` (it already reads `g.title`). Generalize `scheduleSubtask(g, st)` (`app.js:418`) — it only needs `g.domain` + `st.title`, no change to signature needed. Update the rollup-done check used in `sugNext` (`app.js:345`) and the map-card tag preview (`app.js:436`).

**(5) UI** (on `.goal-card`, berry overlay, domain-colored):
```
┌ ◀  🎯 Grow my business                     ✕ ┐
│  ★ Active — pulls into your days              │
│  ▸ break it into steps → schedule into days   │
│  [ 🪄 Break it down for me ]                   │
│  free: first-principles starter · 🧠 tailors  │
│ ─────────────────────────────────────────────│
│  ▾ ◯ Define the one offer / message      🪄 ✕ │
│     ▾ ◯ Write the one-liner          📅 ✕     │   ← indented child
│        ◯ Draft 3 versions       📅 ✕          │   ← daily leaf, schedulable
│        ◉ Pick the winner ✓      📅✓            │
│  ▸ ◉ Pick a daily posting slot  (3/3 ✓)   🪄✕ │   ← collapsed, rolled-up done
│  [ add a step or milestone…              + ]   │
│  ✕ delete this goal                            │
└────────────────────────────────────────────────┘
```
Indent each depth by ~16px + a left rule in `DOM[g.domain].dark`. Done leaves dim (existing `.goal-step.done`). Caret = `ti-chevron-right` / `ti-chevron-down`.

**(6) Data + migration** — node shape becomes `{ title, done, schedK?, children?:[] }`. **Migration in `load()` (`app.js:1279`)**: walk `S.goals`, for each goal and recursively each subtask `if (n.children == null) n.children = []` (exactly the `S.acts` pattern already there: `S.acts.forEach(...a.children=[])`). Old flat goals stay valid (all leaves, depth 1). No SCHEMA bump strictly required (additive optional field, same as `children` on acts which shipped without a bump) — but if any other cluster bumps SCHEMA, fold this in.

**(7) Region** — GOALS pillar (`drawGoal`, `decompose`). Self-contained inside the overlay.

**(8) Effort** — **M** (one recursive render fn + rollup logic + tiny migration).

**(9) Risks** — Infinite-recursion / runaway depth: **cap at depth 3** in `stepRow` (hide the wand/add-child at depth 3). Rollup-done must not break `sugNext`'s "first undone subtask" (it currently reads flat `g.subtasks`) → update it to descend to the **first undone leaf** so today still pulls a concrete daily atom, not a milestone. LOW render-risk (overlay only).

---

## FEATURE 2 — Decomposition horizons (year → quarter → month → week → day)

**(1) Ask** (audit cluster: "goal-decomposition horizons"): tiers should map to real time horizons, not just abstract nesting.

**(2) Buildable?** PARTIAL → concrete version: tag each tree depth with a **horizon label** and let scheduling honor it.

**(3) Approach** — add an optional `horizon` per node: `"year" | "quarter" | "month" | "week" | "day"`. Default by depth (depth0=goal/no horizon, 1=`quarter`, 2=`month`/`week`, 3=`day`). Show the horizon as a tiny muted pill on each node (`DOM[d].dark` bg, `DOM[d].ring` text). When scheduling a leaf, `scheduleSubtask`'s `pickSheet` options should **widen with horizon**: a `week`/`day` leaf offers Today/Tomorrow/In 3 days (as now); a `month` leaf offers "This week / Next week / In 2 weeks"; a `quarter` leaf offers "This month / Next month". Compute the offset day count from the chosen label.

**(4) Code pointers** — extend `scheduleSubtask` (`app.js:418`) `pickSheet` opts to be horizon-driven (a small `HORIZON_OPTS` map). Add horizon pill render inside the FEATURE-1 `stepRow`. Optional default-assign in the FEATURE-1 wand expansion.

**(5) UI** — node row gains a pill: `[quarter]` / `[this month]` etc. Schedule sheet question swaps its 3 chips per the node's horizon. Keep copy soft ("when feels right?").

**(6) Data** — `node.horizon` optional string. No migration needed (absent ⇒ infer from depth). No SCHEMA bump.

**(7) Region** — GOALS pillar (`scheduleSubtask` + stepRow). Overlaps FEATURE-1's `stepRow` — **build F1 first, then F2 on top** (same build-agent, or F2 waits).

**(8) Effort** — **S** (on top of F1).

**(9) Risks** — MED: `scheduleSubtask` writes to `blocks()` + `reflow(k)` for far-future dates — confirm reflow handles a `k` weeks out (it does; it's per-day). Don't let a "quarter" leaf place a literal block 90 days out unless the user picks it. Keep the now-line/timeline untouched.

---

## FEATURE 3 — Goal map / overview surface (the "map" in drawMap, leveled up)

**(1) Ask** (audit cluster: "goal map"): a visual map of goals, not just a flat card grid. Reinforced by audit:430 "Goals=ti-target" nav identity.

**(2) Buildable?** PARTIAL → concrete: upgrade `drawMap` to show **progress + horizon spread per goal** without a new render engine.

**(3) Approach** — keep the existing `.goal-grid` card layout (it's the locked surface) but enrich each `goal-cardx`:
- A thin **progress bar** = leaf-done / leaf-total (rolled up across the tree), filled in `DOM[g.domain].c`, track in `DOM[g.domain].dark`. No glow.
- Replace the flat first-6-subtask tags with a **tier breadcrumb**: "3 milestones · 11 steps · 2 scheduled" computed from the tree. Keeps the card scannable, shows depth.
- Active goals already get the play-filled highlight (`app.js:434`) — keep. Sort active goals first.

**(4) Code pointers** — `drawMap` (`app.js:425–442`), specifically the per-goal block `app.js:431–438` (the `goal-tags` / `goal-tagnone` region). Add a `treeStats(g)` helper {leaves, done, milestones, scheduled} that walks `children`.

**(5) UI**:
```
┌ 🎯 Your goals                    📈 3 active  ✕ ┐
│ ┌─────────────┐ ┌─────────────┐                │
│ │ 🎯 Focus     │ │ 🏃 Move      │                │
│ │ ▶ Grow biz   │ │  Get fit     │                │
│ │ ▓▓▓▓░░░ 4/11 │ │ ▓░░░░░░ 1/8  │                │
│ │ 3 milestones │ │ tap to break │                │
│ │ · 2 scheduled│ │  it down →   │                │
│ └─────────────┘ └─────────────┘                │
│  [ a goal you're working toward…           + ] │
│  few active · do fewer, finish more            │
└─────────────────────────────────────────────────┘
```

**(6) Data** — none new (reads the F1 tree). No migration.

**(7) Region** — GOALS pillar (`drawMap`). Touches the same `goalsSheet` closure as F1 → same build-agent.

**(8) Effort** — **S**.

**(9) Risks** — LOW (overlay). Don't add a second SVG planet view here — that's `mindmapSheet`'s job (see F4); keep map = card grid to respect "low-clutter."

---

## FEATURE 4 — Life audit ("see who you're being" / did I hit my goals)

**(1) Ask** (audit:733): *"do audit of all my requests from the past to understand and review if we achieved my goals even if they evolved over time"* + cluster "life audit." Also audit:65 mental-garden/peace-and-clarity vision.

**(2) Buildable?** PARTIAL → concrete: a **goal-progress audit panel** that ties real tracked time (`lifeInvest`) to each active goal's domain, surfacing wins and drift honestly.

**(3) Approach** — add a "Life audit" view reachable from `goalsSheet` (a header chip next to the "N active" pill) **and/or** as a tab in `mindmapSheet`. It shows, per active goal:
- Goal progress (leaf-done/total from F1 tree) + horizon spread.
- **Reality check**: 30d minutes invested in that goal's domain (`lifeInvest()[g.domain]`, `app.js:466`) → "You've put 6h into Focus this month" — reward framing, never shame. If a goal is active but its domain got ~0 minutes, soft nudge: "this one's waiting for you" (NOT "you failed").
- A one-line "evolved?" note: goals you marked done or deleted are gone, so frame the audit as **"what you're building now,"** not a guilt ledger of dropped asks.

**(4) Code pointers** — new `goalAuditView()` rendered inside `goalsSheet`'s `draw()` switch (add a third `view` state alongside map/goal), reusing `lifeInvest()` (`app.js:466`) and `activeGoals()`. The header `goal-audit` chip already exists (`app.js:427`) — wire its onclick to this view.

**(5) UI** (berry overlay, domain-tinted rows, no neon):
```
┌ ◀  📈 Life audit — what you're building   ✕ ┐
│  last 30 days · reward, not report card      │
│ ─────────────────────────────────────────── │
│ 🎯 Grow my business        ▓▓▓▓░░ 4/11       │
│    6h 20m in Focus this month · steady ✓     │
│ 🏃 Get fit                 ▓░░░░░ 1/8        │
│    this one's waiting for you — pick it back  │
│ 🎨 Make art                ▓▓▓▓▓░ 9/12       │
│    3h in Create · almost there 🌱            │
└───────────────────────────────────────────────┘
```

**(6) Data** — none new. Reads tree + `lifeInvest`. No migration.

**(7) Region** — GOALS pillar (new view in `goalsSheet`) + reads `mindmapSheet` helper. No timeline touch.

**(8) Effort** — **M**.

**(9) Risks** — LOW render-risk. Tone risk is real: **must stay reward-never-shame** — zero-progress goals get "waiting for you," never red/✗/"behind." No streak-break language. Don't surface deleted/dropped goals (they're not in `S.goals`) — the "evolved over time" framing is copy, not a resurrection of old data.

---

## FEATURE 5 — Multi-step health/medical goal across a month w/ appointment scheduling

**(1) Ask** (audit:92, ▫️ med): *"Plan multi-step health goals (e.g. knee surgery) across a month with appointment scheduling."*

**(2) Buildable?** PARTIAL → concrete: add a **medical/appointment decomposition template** + appointment-typed leaves that schedule to a specific date+time, spread across weeks.

**(3) Approach** —
- Add a `DECOMP_TEMPLATES` entry: `{ kw:["surgery","knee","appointment","doctor","recovery","physio","medical","dentist","checkup","procedure"], steps:[...] }` with calendar-aware steps: "Book the consult", "Pre-op appointment", "Procedure day — block the day", "Week-1 recovery: rest + ice", "Physio sessions ×2/wk", "Follow-up checkup".
- Tag medical leaves `kind:"appt"`. For appt leaves, `scheduleSubtask` offers a **date+time** path (reuse `pickSheet` for a coarse "this week/next week/in 2 wks" then a time, or just a date-offset chip set) and the dropped block gets `prio:1` + `pin:true` (appointments are non-negotiable, reusing the existing pin field `app.js:382/2359`).
- Spread: when "Break it down" emits this template, **auto-assign ascending horizons** (consult=this week, pre-op=next week, procedure=in 2 wks, follow-up=in 4 wks) so the month plan self-distributes — this is the "across a month" the ask wants.

**(4) Code pointers** — `DECOMP_TEMPLATES` (`app.js:404–412`, add one row), `scheduleSubtask` (`app.js:418`, branch on `st.kind==="appt"` → date+time + `pin:true`), F1 wand expansion (assign horizons for the medical template).

**(5) UI** — appt leaves show a `ti-calendar-event` icon + the scheduled date ("📅 Tue Jul 8 · 14:00"). Scheduled appt blocks on the timeline render pinned (existing pin visual). Soft copy: "your recovery plan, spread across the month."

**(6) Data** — `node.kind` optional ("appt"); scheduled appt blocks reuse existing block fields + `pin:true`. No SCHEMA bump.

**(7) Region** — GOALS pillar (template + scheduleSubtask). The pinned block lands in `blocks()` → reflow (MED, calendar data).

**(8) Effort** — **M**.

**(9) Risks** — MED: pinned far-future blocks flow through `reflow(k)` per-day — fine, but verify a `pin:true` appt block survives reflow as a fixed obstacle (it does, `app.js:2588/2595`). DEVICE-UNTESTED note: placing/seeing future-date appt blocks on the timeline needs phone confirm (it's a calendar render). Don't over-medicalize copy — this is a planner, not a health record.

---

## FEATURE 6 — Presets/habit-stacks as a literal tab INSIDE Goals

**(1) Ask** (audit:551, asked ×2, ▫️ med): *"presets can go into goals so its just a tab inside goals to stack them into days."*

**(2) Buildable?** YES.

**(3) Approach** — `goalsSheet` currently has one view (map). Add a **two-tab header** inside `.goal-card`: `[ Goals ] [ Stacks ]`. The Stacks tab renders the preset list **inline** (lift the body of `presetsSheet`, `app.js:538`, into a `drawStacks()` function callable both standalone and embedded) instead of opening the separate `presetsSheet(k)` overlay. Tapping a stack still "stacks it into a day" via the existing apply path.

**(4) Code pointers** — `goalsSheet` `draw()` (`app.js:424`): add a `tab` state ("goals"|"stacks"). Refactor `presetsSheet(k)` (`app.js:538`) so its body-render is a shared `function drawPresets(container, k)` — call it from both the standalone sheet and the new embedded tab. Nav wiring `goPresets`/`goGoals` at `app.js:3222–3223` can stay (the standalone presets sheet still works), but the **Goals tab now shows both**.

**(5) UI**:
```
┌ 🎯 Goals            [ Goals ] [ Stacks ]   ✕ ┐
│   (Goals tab = the map grid)                  │
│   — or —                                      │
│   (Stacks tab = preset list, tap to apply)    │
└────────────────────────────────────────────────┘
```
Tabs as two pill buttons in the header band, active one in `DOM.focus.c`/ink, inactive muted berry.

**(6) Data** — none (presets already persist where `presetsSheet` reads them). No migration.

**(7) Region** — GOALS pillar (`goalsSheet`) + PRESETS (`presetsSheet`). **Conflict note**: shares `presetsSheet` with any "Planning/presets" cluster — the refactor to `drawPresets(container,k)` must be coordinated; if another agent owns `presetsSheet`, this feature only adds the tab + calls their extracted fn.

**(8) Effort** — **S** (mostly a refactor + tab chrome).

**(9) Risks** — LOW render-risk (overlay). The applied stack writes to `blocks()` (existing path, already device-tested). Keep one overlay open at a time — don't let the embedded tab also spawn the standalone `presetsSheet` (would double-stack overlays).

---

## FEATURE 7 — Past goals are NOT editable (vs past reality which IS)

**(1) Ask** (audit:556, ▫️ med): *"you can rewrite the past when it comes to reality, but you can't rewrite the past when it comes to your goals."*

**(2) Buildable?** PARTIAL → concrete: lock the **completion/edit state of goal subtasks that were scheduled into a past day**.

**(3) Approach** — a subtask leaf with `schedK` pointing at a **past** logical day (`schedK < todayK()`) becomes **read-only in `drawGoal`**: the check toggle, delete, and re-schedule controls are disabled (rendered dimmed, non-clickable). You can't un-complete or rewrite a step you already committed to a past day — the goal's history is set in stone, mirroring the timeline's "started/past blocks are set-in-stone" contract (CLAUDE.md regression rule #2). Reality (logs) stays freely editable — that's a separate region, no change.

**(4) Code pointers** — F1 `stepRow` (built in Feature 1): add `var locked = node.schedK && node.schedK < todayK();` and gate the `ck.onclick` / `gs-del` / `gs-sched` handlers. Reuse the existing "set-in-stone" visual idiom (dim + no pointer).

**(5) UI** — locked leaf: muted, a tiny `ti-lock` glyph in `DOM[d].dark`, no tap affordance. Tooltip/subtext (subtle): "scheduled — part of your story now."

**(6) Data** — none (reads `schedK`, already set by `scheduleSubtask` `app.js:418`). No migration.

**(7) Region** — GOALS pillar (`stepRow`). Depends on F1.

**(8) Effort** — **S** (a guard in the row renderer).

**(9) Risks** — LOW. Don't over-lock: only leaves with a **past** `schedK` lock; unscheduled or future-scheduled steps stay fully editable, and the goal title/active toggle/adding NEW steps stays open (you can still grow the goal forward). Confirm `schedK` string compares correctly against `todayK()` (both `YYYY-MM-DD`, lexicographic compare is safe).

---

## Build order (single agent recommended — all share the `goalsSheet` closure)
1. **F1** recursive tree + migration (foundation; everything indents off `stepRow`).
2. **F3** map enrichment (reads the tree).
3. **F2** horizons → **F7** past-lock → **F5** medical template (all hang off `stepRow`/`scheduleSubtask`).
4. **F6** Stacks tab (independent; coordinate `presetsSheet` refactor with any Planning-cluster agent).
5. **F4** life audit view (reads tree + `lifeInvest`).

**Cross-cluster conflict flags:** `presetsSheet` (F6) and the `blocks()`/`reflow` write path (F2/F5) are shared surfaces — if a "Planning/day-structure" build-agent runs in parallel, serialize edits to `presetsSheet` and don't both touch `scheduleSubtask`. Everything else is contained inside the Goals overlay (LOW risk; the fragile timeline render is NOT touched).
