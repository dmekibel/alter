# TRACKER-MATRIX — full spec for ALTER's tracker decision system
# Synthesized 2026-07-02 from session transcripts + repo docs.
# Sources tagged inline: TR=TRACKER-REDESIGN.md, TH25=TRACKER-HANDOFF-2026-06-25.md,
# TH26=TRACKER-HANDOFF-2026-06-26.md, GA=GRAND-AUDIT-2026-06-26.md,
# SOUL=SOUL-OF-ALTER.md, TS=_specs/tracker-states.md,
# JS=session jsonl (date of message noted where recoverable).

---

## 0. The one-sentence soul

"Doing what you planned should feel MAGICAL (Guitar-Hero). The now-line is an energetic scanline
that sweeps down in real time and burns a plan block to success when your real activity matches it."
— TRACKER-REDESIGN.md (session ee3d4e33, 2026-06-24)

The present = a LINE that **eats the future (potential) and lays down the past (reality)**
as it advances. — alter-tracker-design-rules memory (2026-06-25)

---

## 1. THE DECISION MATRIX

### 1a. Past — 3 alignment realities

"There is a couple realities one where your plan and your actions match perfectly in the present
and in the past. Alternatively they are similar but with subtle mismatch and areas where they
are similar is where you get the special points."
— David, session ee3d4e33 (2026-06-24)

| State | Visual render | Points |
|---|---|---|
| **Perfect match** | Plan+real FUSE into ONE full-width gold-ringed bubble (`.fusedbar`). | Full |
| **Partial match** | Gold-fused band for the matched span; SPLITS at the moment of divergence (plan=ghost left, real=drift right). | Proportional to overlap |
| **No match** | Plan ghosts (dark dashed border, domain outline, "missed" copy). Real shown as drift (mauve). | 0, no shame |

"The overlap is where the special points are earned (partial credit). Render: gold-fused band for
the matched span, then it SPLITS into the two lanes at the moment of divergence."
— TR §"Past / present — 3 alignment realities"

Built as: `blockStatus() ok/miss/plan`, `fusedIntoPlan()`, `matchedSpan()`, `partial` split
— calendarView ~2239–2272 (app.js).

### 1b. Future — 3 intents, each one tap

"Three future options: track-ignoring-plan / follow / replan-then-drift (Follow / Replan / Drift)"
— GA #919 (audit 2026-06-24)

**A · Just track (Drift / off-plan)**
"Must always be frictionless." — TR
The dock button is `ldDrift` / `tfJustDrift()`. Starts a timer without a plan lookup.
Drift stays UNNAMED in the moment — label it after the fact (relabel bentoPicker ~2208).
"Drift stays unnamed in the moment, labelable after the fact." — GA #720 (2026-06-25)

**B · Follow the plan**
"Next planned block surfaced as a 1-tap bright hero; on-plan bonus; feeds gold/streak.
Staying on plan = the easiest tap." — TR
Button: `ldPlan`/`Play` (the biggest button = do-what-you-planned). Calls `startPlanned()`.
"Biggest button = do-what-you-planned, app-rewarded." — GA #982 (2026-06-24)

**C · Conscious drift (Replan)**
"Go against plan but re-plan the detour first: how-long picker → detour drops in at now →
rest of plan REFLOWS after it → back-on-track marker. Declared/conscious drift KEEPS the
streak (distinction = declared-vs-spontaneous, not productive-vs-leisure)." — TR
Button: `ldReplan` → `planBreak()`. Truncates the straddling block's future half, inserts a
new plan at now, reflow pushes following blocks down.

### 1c. No-plan state

"No-plan state: only Plan and Drift buttons (no Replan)." — GA #945 (2026-06-25)
When `!nextPlannedBlock()`: dock shows Plan+Drift only; `#liveDock.noplan .ld-replan{display:none}`.
Status badge reads "tracking·no plan" — GA #663.

### 1d. Drift overrun (drift runs past its set length)

"Surface two one-tap choices, never a nag:
→ back to [planned]
keep drifting · how much longer? (re-reflows the rest of the day)" — TR
Status: `breakup` in `trackerState()`. Controls in `renderTFControls('breakup')`.
NOT YET BUILT as a full detour-duration picker. (GA #186, TH25 §NOT BUILT #3)

### 1e. State vocabulary (trackerState() — built v561+)

From `_specs/tracker-states.md` + app.js:1001:
- `idle` — no active tracking, next plan shown, Play/Just-track/Replan controls
- `onplan` — tracking an activity that matches the current planned block; ring GREEN
- `off` — tracking but off-plan (drift); ring DIM `#6a5870`
- `break` — a declared break timer is running; ring GOLD
- `breakup` — break timer elapsed; fork back-to-it / keep-drifting

---

## 2. TIMELINE PHYSICS

### 2a. Now-line = the present (the only pink line)

"The present is a LINE (the now-line), NOT a bubble. It is the converter: it eats the future
(potential) and lays down the past (reality) as it advances." — alter-tracker-design-rules memory

"There should only be a single pink line, I don't want to see a second pink line above the first
pink line." — David, session ee3d4e33 (2026-06-25, verbatim transcript)

"The now-LINE itself is hardcoded pink #ff5fa8." — GA #448
Now-circle = `.nowcirc` carries the activity icon + "NOW" + time on the LEFT gutter.
Right-side readout = `.nowread` = activity name in its colour + live elapsed.

Now-line is the BRIGHTEST thing on the timeline — locked palette rule (SOUL-OF-ALTER.md §10).

### 2b. Printing-only-into-the-past rule (HARD RULE)

"It starts printing, but the problem is you could see the outline below and the shadow and part
of the thing below the present. We established that we shouldn't see that. It should only be
printing into the past." — David, session jsonl (2026-06-27, verbatim)

"The REAL/tracker lane is BLANK in the future — nothing tracked is ever below the now-line;
only PLAN continues below." — TR (David's key correction)

Corollary: when a tracked matched bar is active (`.convbar`), no shadow/outline of the block
should be visible below the now-line. Clip it exactly at the now-line bottom.

### 2c. Battery effect / printing metaphor

David's original request (session 95e8af37, 2026-06-25, verbatim):
"The battery effect of dark stripes turning into bright is good but I miss the metallic shining
glowing stripes from the past so maybe the printing battery effect will be from dark matte stripes
to bright shining stripes."

The spec that was locked (after mockup loop, session ee3d4e33 / 95e8af37, 2026-06-25):
"Everything is striped. The finish encodes time:
• future = dark MATTE stripes (dim potential, saturate(.72) brightness(.72))
• past success = bright SHINING metallic stripes (gloss + foil glint + glow + ti-circle-check)
• the present = a BATTERY-FRONT that converts matte stripes → shining stripes top-down
  as you live the block. A single block literally transforms: top = shining (lived),
  bottom = matte (still potential), with the now-line as the bright pink conversion edge."
— alter-tracker-design-rules memory (2026-06-25)

**What was built vs. what was asked:**
The battery fill ANIMATES WITHIN THE LIVE BLOCK (top-down filling visible in real time) was
NOT fully built. Current compromise: the finish flips on completion, not a live fill.
"David liked the battery/printing metaphor; the now-line + readout is the current compromise.
Revisit if he wants the fill motion back — but he disliked the block EXTENDING into the past,
so any fill must not read as 'the current activity is a big past block.'"
— TH25 §NOT BUILT #6

First built: v454–v456 (2026-06-25). The matte→shining flip on completion, the now-line pink
edge, and the matched-fuse mechanic. The live fill animation = still pending.

### 2d. Attach to the now-line / drag-to-now physics

"The future half extends and starts printing into the past and extended new bubble just like we
spoke about before." — David, session jsonl (2026-06-27, verbatim)

"Then slide it up all the way to the present so it bumps up against the present. And that's when
you can click play, and it'll start printing out in both left and right side."
— David, session jsonl (verbatim, no-plan workflow)

Rules:
1. A future plan block dragged UPWARD snaps to start at now when it reaches the now-line
   (can't cross into the past — `_floor = ceil(now/15)*15` clamps future drags, app.js:2133).
2. When snapped to now, a Play affordance appears on the block.
3. Tapping Play starts tracking → the block becomes the `.convbar` (printing both lanes).

On Replan: "The new plan owns NOW → the future. Any block the present line is currently
splitting gets its future half ERASED (truncated to end at now → it stays as the past ghost half)."
— code comment, David 2026-06-25 (app.js:1203/380)

### 2e. Split-at-now behavior (straddling block)

"The Focus block needs to be half split by the present. Top half ghost cuz it's failed last while
bottom future is good." — David, session jsonl (verbatim)

When a planned block straddles the now-line AND is not being tracked:
- PAST half (above now-line) = ghost: dark fill + domain-colour dashed border + "missed" status
- FUTURE half (below now-line) = matte (upcoming)

When tracking the SAME activity on a straddling block:
- Ghost head separates into its own standalone plan-lane bubble (the unfulfilled start)
- Tracked stretch = full-width matched bar printing upward into the past (continuous with future,
  no gap at the now-line)
- "The TRACKED half is CONTINUOUS with the future (no gap at the now-line — the line just shows
  printing + the battery: bright charged-past, dim future)." — code comment app.js:2241

Built: `_straddle` branch calendarView ~2250–2266.

### 2f. Wide line = doing what you planned

"In addition, since it is what you planned, it should be both in the plan section and in the
reality section, therefore, it should be a WIDE LINE if you're doing what you planned."
— David, session jsonl (verbatim)

"Doing what you planned = matched = the WIDE line (both plan+reality lanes)."
— FIX-LEDGER-2026-07-02.md, C4

A matched/on-plan activity renders as ONE FULL-WIDTH bar (`.fusedbar` or `.convbar`) spanning
both the PLAN left lane and the REAL right lane. It is NEVER split when on-plan.
Split = ONLY when plan and reality diverge.

### 2g. Plan lane vs reality lane semantics

"Two-lane layout (PLAN left / REAL right) exists: place() lane P at left:26px,
real lane at left:calc(50%+4px)." — GA #611 (app.js:2061, 2190)

- PLAN lane (left): planned blocks, ghost blocks, the plan-half of a split
- REAL lane (right): actual logged activities (`.acts` loop), drift logs
- MATCHED (fused): FULL WIDTH across both lanes — `.fusedbar` spans left:26px, right:4px
- `plan lane = never plan wider than real` — from TRACKER-MATRIX const in session jsonl (2026-06-27)

"I don't forget... all the plan and the reality should be same width while here you're showing
plan being wider." — David, session jsonl (verbatim)

### 2h. No-overlap rule for logs

"Time-tracking blocks must not overlay; easy to delete and edit." — GA #925
"Tracking overlap corruption: starting 'What are you doing right now?' while an existing timer
is running corrupts the log." — FIX-LEDGER-2026-07-02.md C5

Only one tracked activity can be live at once. Starting a new track stops the previous.

### 2i. Dragging a middle block left/right → splits in half (NOT YET BUILT)

"If you have something in the middle and you drag it to the left or the right, then it would
actually split in half." — David, session jsonl (verbatim, 2026-06-25)

Current behavior: horizontal fling on a bubble RELOCATES it between plan/real lanes (app.js:2146–
2151) or pages the day. Split-in-half on horizontal fling is DROPPED (GA #154–157).

### 2j. Dragging into the past → goes dark

"Also taking thing you're tracking and dragging the top into the past sometimes makes it become
less wide which is weird. Dragging planned activity into past should make it go dark I already
told you that but you forgot." — David, session jsonl (verbatim)

Plan blocks dragged into the past must adopt the ghost/missed render (dark, domain outline).
Partially implemented via `b.passed` state + burning-timeline logic (app.js:2078–2081).

### 2k. Burning timeline (past the now-line → dims)

"Burning-timeline: plans dim bright→dark once now-line passes; pushing forward re-brightens."
— GA #864
"BURNING TIMELINE: future = bright matte, status 'miss'/passed → dark ghost (b.passed sticks)."
— app.js:2078 comment

Built. Future plan blocks start bright matte; once the now-line passes them untracked, they
darken to ghost. Dragging them FORWARD (into future) re-brightens them.

### 2l. Stripes = reward ONLY

"Stripes is more for rewards, not for punishment." — David (#99 in SOUL/GA)
"Drift/missed never striped." — alter-tracker-design-rules memory

- Stripes + shine = future potential (faint), lived success (bright), or the reward/done signal
- Drift = SOLID mauve gradient (#c4607f → #a84e69) + windmill icon. Never striped.
- Ghost/missed = dark fill + domain-colour dashed border. Never striped.
- NO gold for "done" fills — gold ring inset only (`.fusedbar` gold ring = on-plan bonus)

---

## 3. COCKPIT DESIGN

### 3a. What the cockpit IS (the keystone call)

"My dad said… there needs to be one main place where the app walks you through what you need to
do… that needs to be part of the expanded tracker." — David (memory #204, session 1f8695a8,
2026-06-28)

"I'm starting to think when my dad said that there needs to be one main place where the app walks
you through what you need to do and I think that needs to be part of the expanded tracker cuz it
seems like a logical home for the app for some reason. It's the base make small plan and start
tracking. And also that's where we can make the app guide the person through the self help journey
brain John style with the AM book ends and..." — David, verbatim (session 1f8695a8)

**The locked decision (2026-06-28):**
`#trackerFull` (the expanded tracker ring) = THE COCKPIT. ONE place the app speaks.
Every guided flow renders in the cockpit stage. The ring slides to a corner and keeps tracking —
guidance and tracking are the SAME act. Never spawn a third clashing menu (CLAUDE.md rule).
Landing = cockpit always home (David's call, the boldest version, locked 2026-06-28).

### 3b. The two-zone shape

"Two zones:
• The tracker (ring + timer) — full when just tracking; SLIDES TO A CORNER when a guided flow
  needs the room.
• The stage — the controls normally, but it BECOMES the AM planner / PM planner / journaling
  Q&A / journey next-step card / a Stutz tool."
— alter-cockpit-home memory (2026-06-28)

Every guided flow is also a TRACKED activity:
- Pick "digital journaling" → ring starts + slides aside → stage = the questions →
  you answer while it tracks → done.

### 3c. What flows into the cockpit stage

- AM/PM bookends (morning charge / evening peace)
- Journaling Q&A
- Journey next-step card
- Toolbox tools (tapping, breathing, meditation, virtue practice)
- Skill practice
→ Retire most `#sheet` modals. The two clashing systems (`#sheet` vs notebook) resolve into one.

### 3d. The live dock (#liveDock) — TODAY TAB version

"Pull-up live dock `#liveDock` (Today only): Stop · activity · ON PLAN/DRIFT badge · live elapsed
· Switch · Plan / Replan / Drift. Always present (idle = 'start' bar)."
— TH25 §locked design model

DOM: index.html:1187–1189. `renderLiveDock()` app.js ~926.
States: ON PLAN badge / DRIFT badge / "tracking·no plan" / idle start bar.
Play button (v503+): when a plan's upcoming, shows the activity's colour + "▶ start your plan";
pressing it calls `startPlanned()` → fuses the block into the matched convbar.

### 3e. Cockpit in the tracker pane (#trackerFull)

`renderTrackerFull()` app.js:1021. `trackerState()` app.js:1001. `renderTFControls()` app.js:1076.
5 states: idle / onplan / off / break / breakup.
Ring indicator: GREEN = onplan, DIM `#6a5870` = off/drift, GOLD = break, GREY = idle.

"The cockpit is always there." — SOUL-OF-ALTER.md §13 (tracker = the one home)

---

## 4. BUTTON SETS BY STATE

### 4a. Idle (no tracking, plan exists)

- PRIMARY: `▶ [ActivityName]` (colored in the activity's domain color) — starts the planned block
- SECONDARY: `Just track` (opens bento to pick any activity)
- SECONDARY: `Replan` (opens detour-duration picker)
- Small: `Create plan` (if no plan exists, the dock folded version has this — v503 FIX-LEDGER C4)

### 4b. On-plan (tracking = planned activity)

- PRIMARY: `Done` (`tfDone()`)
- SECONDARY: `Pause` / `Break` → starts a declared break timer
- SECONDARY: `Switch` → opens switch chips (`renderSwitchChips`)
- SECONDARY: `Replan` → `planBreak()` — truncates future half, reflows

### 4c. Off-plan / drift (tracking ≠ any plan)

- PRIMARY: `Stop` → stops current tracker
- SECONDARY: `Replan` → brings the plan back / declares a detour
- SECONDARY: `Switch` → pick a different activity
- IMPLICIT: `~ Just drift` (entry path for unnamed drift — 3c in tracker-states.md, PARTIAL)

"Live controls = Stop + Replan (the old 'Switch' is wrong)." — alter-tracker-design-rules memory

### 4d. Drift overrun (break timer elapsed)

- PRIMARY: `⟳ Back to [planned]` — resume the paused planned block
- SECONDARY: `+5 min` (tfBreakPlus)
- SECONDARY: `End break` (tfEndBreak) / `Pick something else` (tfPickTrack)
NOT YET BUILT as a full flow; current breakup state shows "Back to it / +5 min / End".

### 4e. No-plan state

"No-plan state: only Plan and Drift buttons (no Replan)." — GA #945
- `Plan` (opens bento to plan now)
- `Drift` (just-track unnamed)
Replan hidden via `#liveDock.noplan .ld-replan{display:none}`.

---

## 5. PAST vs FUTURE — READ/EDIT RULES

"Past plan = frozen (integrity lock so you can't fake a match).
Past real = editable (backfill what you forgot).
Future = single long plan bars (no split, and NO drift button far ahead).
A plan splits into plan|real only when NOW reaches it." — alter-tracker-design-rules memory

"Retroactively correct what you were doing in the past; show where you drifted vs on-plan."
— GA #928. Backfill: tap empty past slot → bentoPicker "What were you doing?" (~2233–2246).

---

## 6. CONFLICTS AND OPEN QUESTIONS

### Resolved

- **Battery fill animation**: David asked for it to FILL live within the block; current
  compromise is flip-on-completion (TH25 §NOT BUILT #6). Technically deferred, not rejected.
- **Split-in-half on horizontal drag**: DROPPED in GA #154. Current: fling relocates lane.
- **Wide/matched rule**: locked — matched = full-width fused, always. Split = mismatch only.

### Ambiguous / contradictory

1. **Battery fill vs. block-extending-into-past tension**: David said the fill should be visible
   live, but also said "don't extend the current activity into the past" (TH25 §Open/uncertain).
   These conflict if the fill is implemented as a growing past-bar. The safe resolution: fill
   the BOTTOM of the future matte block top-down (the shining portion grows downward from
   above toward the now-line, not upward from the now-line into the past).

2. **Now-line colour**: One request says the now-line is the activity's color; another says
   "present line stays original pink" (GA #848). Resolution built: now-LINE border = hardcoded
   pink `#ff5fa8`; the NOW CIRCLE (`nowcirc`) = activity color. Both right for their surface.

3. **Gold for matched**: alter-tracker-design-rules says "NO gold for done" (gold fills rejected
   as heavy) but TR says matched = "gold-ringed bubble" (a gold INSET RING, not a gold fill).
   GA #14 says "gold-inset on-plan". Resolution: gold = a ring/inset accent on matched, never
   a fill color; the activity's own domain color fills the bar.

4. **Drift overrun fork**: spec says detour-duration picker for "keep drifting" re-reflows the
   day. `breakup` state in trackerState() covers this but the UI is minimal (basic 3-button,
   no duration picker / back-to-plan reflow). Full implementation in tracker-states.md Feature 1.

5. **Cockpit as default home vs. timeline-as-home tension**: SOUL-OF-ALTER.md §3 flags this as
   open (risk = breaking the one leg that works). David's call (2026-06-28): "Cockpit always
   home" — but sequencing says build socket first, promote to landing ONLY when flows feel
   right on device. Do not promote until device-confirmed. (alter-cockpit-home memory)

6. **"Untracked past" ghost rule regression**: GA #940 states "untracked past plan turns into
   ghost mode; only tracking/replanning prints non-ghost." "The only way to start printing non
   ghost mode stuff is to either start tracking same activity as plan or replanning." — David,
   verbatim (session jsonl). This has regressed multiple times; mark it in regression contract.

---

## 7. WHAT IS BUILT vs. PENDING (tracker-specific, as of v779)

### Built (v450–v505 range)
- Battery-front matte→shining on completion (flip, not live fill)
- Matched fuse (`.fusedbar`) / mismatch split / drift mauve render
- Now-line: pink, thick, activity-colored nowcirc + nowread
- liveDock: Stop/Switch/Plan/Replan/Drift; ON PLAN / DRIFT badge
- Play = start-the-plan (biggest button, activity-colored, v503)
- Straddling-block split: ghost past + matte future (v469)
- `trackerState()` 5-state machine + `renderTrackerFull()` + `renderTFControls()`
- No Replan when no plan; drift unnamed entry path (partial)

### Pending (not yet built)
- **Live battery fill** (matte→shining fills top-down within the live block over real time)
- **Partial match render** (gold overlap then split at divergence — all-or-nothing today)
- **Drift overrun fork** with duration picker + back-to-plan reflow
- **Non-negotiables** (anchor blocks surviving reschedule)
- **Planning-flow builder** (multi-select, daily fundamentals, place + mark non-neg, ask-what-to-keep)
- **Unnamed-drift quick-entry** (`tfJustDrift()` — tracker-states.md Feature 3c, partial)
- **Completion burst → re-prime** to next planned block (tracker-states.md Feature 2)
- **Late-started block render** (ghost top-plan-lane + matched bar bottom — tracker-states.md Feature 4)
