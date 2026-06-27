# SPEC — Planning: masterpiece day & bookends (`plan-masterpiece`)

Cluster from `GRAND-AUDIT-2026-06-26.md` → "Planning / day-structure (17)", lines 494-549.
Five features, all about turning the **bookend rituals + masterpiece-day machinery** into a guided, time-of-day-aware planning flow instead of disconnected pieces.

## Shared grounding (read once, applies to every feature below)

**Existing machinery you will reuse — do NOT rebuild:**
- `saveMasterpiece(k)` / `fillMasterpiece(k)` — app.js:2779-2780. Snapshot/restore `S.profile.masterpiece` (array of `{time,mins,title,color,prio}`).
- `MORNING_RITUAL` / `EVENING_RITUAL` / `WINDDOWN` — app.js:152-170. Each `{ t:"title", steps:[{l,e,log?,action?}] }`. Steps with `.log` push a real log + earn; steps with `.action` of `"plan"`→`planSheet(todayK())`, `"planTom"`→`planSheet(tomK())`.
- `ritualSheet(r)` — app.js:3021-3033. Renders a ritual's steps as tap-to-complete rows. **This is the host surface to extend.**
- `planSheet(k,label,atTime)` — app.js:2881-2894. Activity + duration + priority picker that stacks blocks back-to-back from a chosen start.
- `planDay(k)` — app.js:783-792. The "Plan <day>" sheet: Daily fundamentals / Pick activities / Use a habit stack.
- `enhancePlan(k)` — app.js:388-400. Fills in missing `FUNDAMENTALS` (app.js:386) around `now`.
- `suggestSheet(k)` / `suggestNext` / `sugNext(k)` — app.js:2781-2801 / app.js:341-349. Reasoned next-activity suggestions; has the masterpiece-fill + save buttons already.
- `proactive()` — app.js:1301-1310. The contextual hero card: emits phase-keyed primary CTA + chips (morning recommit, evening bookend, "Plan tomorrow", wind down).
- `recommitSheet()` — app.js:2841+. Multi-step morning recommit; `finalize()` seeds blocks from chosen habits or `skeletonDay`.
- `phase()` — app.js:1243. `night`(<5) / `morning`(<11) / `afternoon`(<17) / `evening`(<21) / `night`. Clock-hour based.
- `wakeHour()` / `bedHour()` — app.js:89-90. Map `S.profile.wake`/`S.profile.sleep` ranges → numeric hours. `bedHour()` can exceed 24 (e.g. 25 = 1am).
- `logicalNowMin()` — app.js:86. Minutes in the 4am→4am window.
- `domainOf(it)` — app.js:274+. Maps any activity → domain key in `DOM` (app.js:249-259). **Kryptonites = the `drift` domain** (vices: scroll/weed/porn/etc., app.js:272). `DOM.drift.c = #4a3d54` slate-mauve.
- Helpers: `add()` app.js:1313, `el()`, `esc()` app.js:285, `fmt()` app.js:93, `dur()` app.js:94, `hm()` app.js:92, `blocks(k)` app.js:1240, `logs(k)` app.js:1241, `save()` app.js:1200, `reflow(k)` app.js:2746, `nextFreeTime(k)` app.js:350, `toast()`, `mixHex()`.

**LOCKED design rules (honor in every UI sketch):**
- Deep berry/wine surfaces; domain colors from `DOM` only. NO neon/glow/shine/white surfaces. The pink now-line is the brightest thing.
- One activity at a time; reward-never-shame language ("removing kryptonites" framed as wins, never guilt).
- Full-screen, low-clutter. Reuse the existing sheet surface (`openSheet()`/`closeSheet()` app.js:2907-2908, `#sheetBody`) — do NOT add a third menu system.
- **Sheet surfaces are safe.** None of these features touch `calendarView`/`buildPull` timeline RENDER math, so timeline-regression risk is LOW unless a feature inserts/reflows blocks (then standard `reflow(k)` + save + `renderToday()` is enough — see existing `distributePlan`/`enhancePlan`).

**Data model — single migration covers all five features.** Bump `SCHEMA` app.js:75 from `1` → `2`. In `load()` (app.js:1199, end, just before `S.v = SCHEMA;`) add:
```js
S.profile = S.profile || {};
if (S.v < 2) {
  // masterpiece bookend feature data — all optional, default empty
  S.profile.amBookend  = S.profile.amBookend  || null; // saved AM-anchor block set (feature 1)
  S.profile.mustDos    = S.profile.mustDos    || [];   // titles flagged must-do for evening replan (feature 3)
}
```
(All other new state below is additive/non-destructive; this single guard is enough. Existing `S.profile.masterpiece`, `.fundamentals`, `.wake`, `.sleep` are untouched.)

---

## Feature 1 — Build a masterpiece day from a good AM bookend  ·  🟦 BIG  ·  effort M

**(1) Ask** (audit:496): _"masterpieces day built from good am on bookend . Sports. Deep work . Removing cryptonites"_

**(2) Buildable?** YES. All pieces exist (morning bookend, masterpiece save/fill, domain detection incl. drift=kryptonites); the gap is a guided flow that *chains* them: anchor AM → sports + deep work → name kryptonites to avoid → save as masterpiece.

**(3) APPROACH** — Add `masterpieceFromAM()` opened from a new step at the end of the morning bookend and from `proactive()` morning chip. A 3-card mini-flow on the existing sheet surface:
1. **Anchor** — confirm the AM bookend that just happened is the seed (pull the logged bookend steps + any morning blocks already on `todayK()`). Headline: "Strong morning. Let's build the rest of a masterpiece on it."
2. **The pillars** — present three tap-to-add tiles keyed to David's literal words: **Sports** (domain `move`, `Run`/`Gym`/`Sports` via `bentoPicker` filtered to `move`), **Deep work** (domain `focus`, 90m default), **Remove kryptonites** (list current `drift`-domain blocks/habits and offer to *protect* the day from them — see below). Each adds a block via the same push+`reflow`+`save` pattern as `addSuggested` (app.js:356).
3. **Lock it** — "Save this as your masterpiece day" → `saveMasterpiece(todayK())`. Reuse the existing save button label from suggestSheet (app.js:2800).

**Removing kryptonites** (reward-never-shame): do NOT add negative blocks. Instead, for each `drift` title the user has logged recently (`frequent()`-style scan, or `S.habits` of `type:"quit"`), show a tile "Guard against <X>" that, when tapped, schedules a *replacement* (`restore`/`move`/`create` block) into a vulnerable slot, OR records the title into `S.profile.amBookend.guard = [titles]` so the day's framing copy can say "today you're choosing X over scrolling." Keep it positive — the kryptonite is named only as the thing the better block displaces.

**(4) CODE POINTERS** — new fn `masterpieceFromAM()` near `suggestSheet` (app.js:2781). Hook 1: append to `MORNING_RITUAL.steps` (app.js:152-158) a step `{ l:"Build a masterpiece on this", e:"🌟", action:"masterpiece" }` and handle `s.action === "masterpiece"` in `ritualSheet` (app.js:3026, alongside the `plan`/`planTom` branches → `closeSheet(); masterpieceFromAM();`). Hook 2: in `proactive()` morning branch (app.js:1305) add a chip `{ label:"🌟 Build a masterpiece", fn: masterpieceFromAM }`. Reuse `bentoPicker`, `saveMasterpiece`, `addSuggested`-style insert.

**(5) UI** (berry sheet, `#sheetBody`):
```
🌟 Masterpiece day                        [sttl]
Strong morning. Let's build on it.        [lbl]
  ┌─ your bookend so far ─────────┐  (read-only chips of logged AM steps, domain-colored)
  🛏 Bed   📓 Journal   🌬 Breathe
  ─────────────────────────────────
  Add the pillars:                        [lbl]
  [ 🏃 Sports ]  [ 🎯 Deep work 90m ]     (move=#ff8a3a, focus=#36b3f0 tiles)
  Guard your day:                         [lbl]
  [ 🌫 over scrolling ]  [ 🌫 over weed ]  (drift=#4a3d54 tiles, label "choose better over X")
  ─────────────────────────────────
  [ 💾 Save as my masterpiece day ]       [done2]
```
No glow; hero tiles use flat `DOM[d].c` background + `DOM[d].ink` text (matches `sugchip` pattern but WITHOUT the boxShadow line at app.js:364 — drop it, glow is banned).

**(6) DATA** — `S.profile.masterpiece` (existing). New optional `S.profile.amBookend = { guard:[titles], savedAt:dayK }`. Covered by the SCHEMA→2 migration above. No block-shape change.

**(7) REGION** — `suggestSheet`/masterpiece functions (app.js:2779-2801) + `ritualSheet` (app.js:3021) + `proactive()` morning branch (app.js:1305). Isolated from timeline render.

**(8) EFFORT** — M (new 3-card flow + kryptonite-as-positive logic; reuses all primitives).

**(9) RISKS** — Low render risk (sheet only). Watch: inserting blocks must go through `reflow(k)`+`save()`+`renderToday()` (and `buildPull()` if pull sheet open, like `enhancePlan` app.js:398). Kryptonite framing is the trap — keep it strictly positive (reward-never-shame); never render a guilt/shame block on the timeline.

---

## Feature 2 — Offer to plan rest of night AND tomorrow  ·  🟦 BIG  ·  asked ×4  ·  effort S-M

**(1) Ask** (audit:501): _"it doesnt offer to plan the rest of my night and plan tomorrrow wich iit should ddo . should be like habbit trackerr and calendar and more"_

**(2) Buildable?** YES. "Plan tomorrow" chip exists; missing is the *active* "plan the rest of your night" prompt as a distinct flow, and the *paired* offer (night + tomorrow together).

**(3) APPROACH** — Two parts:
- **(a) Plan-rest-of-night flow.** New `planRestOfNight()`: opens `planSheet(todayK(), "the rest of tonight", atTime)` where `atTime` = current rounded time (so blocks start at NOW, not 8am) — `planSheet` already accepts `atTime` (app.js:2881-2882). Seed the picker with `night` SUG_POOL options (Wind down / Journal / Read / Sleep, app.js:339) and the remaining undone fundamentals. Frame copy: "A couple hours left — how do you want to spend them?"
- **(b) Pair the offer.** In `proactive()` evening + night branches (app.js:1304, 1306), make the primary/chip a **two-step offer**: primary stays the bookend; add chip `{ label:"📋 Plan tonight + tomorrow", fn: planNightThenTomorrow }`. `planNightThenTomorrow()` runs `planRestOfNight()`, and its Done button advances to `planSheet(tomK(),"tomorrow")` instead of closing — a guided 2-screen sequence ("Now tomorrow →" footer button).

**(4) CODE POINTERS** — new `planRestOfNight()` + `planNightThenTomorrow()` near `planSheet` (app.js:2881) or `planDay` (app.js:783). Edit `proactive()` night branch (app.js:1304) and evening branch (app.js:1306) to add the paired chip. `planSheet`'s `foot` Done handler (app.js:2893) is the place to inject a "Now tomorrow →" continuation when invoked via the pair flow (pass a `next` callback param into a small `planSheet` wrapper rather than editing planSheet's signature, to keep blast radius small).

**(5) UI** — Evening/night hero card (existing `proactive` render) gains one chip:
```
🌙 Evening — close the day well.          (existing)
[ Evening bookend 🌙 ]  (primary)
[ 📋 Plan tonight + tomorrow ]  [ Plan tomorrow ]  [ Tidy up 🧹 ]
```
The flow itself is two consecutive `planSheet` screens (tonight, then tomorrow), each a standard berry picker; the only new chrome is the footer button text "Now plan tomorrow →" on screen 1.

**(6) DATA** — None. Pure flow over existing `planSheet`/`blocks`. No migration needed for this feature.

**(7) REGION** — `proactive()` (app.js:1301) + new wrapper near `planSheet` (app.js:2881). No timeline render touch.

**(8) EFFORT** — S for the chips + `planRestOfNight`; +S for the paired 2-screen continuation = S-M overall.

**(9) RISKS** — Very low. Only watch: `atTime` start so night blocks don't land at 8am (planSheet defaults `cfg.time` to next half-hour if no `atTime` — app.js:2882 — which is already fine for "now"; pass current time explicitly for clarity). No reflow concerns beyond planSheet's existing `reflow(k)` (app.js:2892).

---

## Feature 3 — Evening replan: know priorities + must-dos with limited time  ·  🟦 BIG  ·  effort M

**(1) Ask** (audit:506): _"The app should understand that you have a couple hours left and should know your priorities, what you like to do even when you're running out of time"_

**(2) Buildable?** PARTIAL → make concrete. Over-budget bumping exists (`schedule()` app.js:1293-1299 drops lowest-prio when day overflows; `proactive()` surfaces "I bumped N low-priority slots" app.js:1303). Missing: a *dedicated evening-replan flow* that reasons about **hours-left** and **must-dos**, and asks "what to keep when out of time."

**(3) APPROACH** — New `eveningReplan()`:
1. Compute `left = bedHour()*60 - logicalNowMin()` (minutes until bed). Headline: "About `dur(left)` left before bed."
2. Pull remaining undone blocks for `todayK()` (the `pend` list logic from `schedule()` app.js:1294) + active-goal next steps + flagged must-dos (`S.profile.mustDos`).
3. Run a **fit-to-budget**: walk priority-sorted (Must=3 → Should=2 → Nice=1, `PRIOS` app.js:171), greedily keep blocks whose cumulative `mins` ≤ `left`. Reuse the exact loop shape from `schedule()` (app.js:1296-1297) but bound by `left` instead of `DAY_END`.
4. Render two lists: **"Fits — keeping"** (kept blocks, domain-colored) and **"Won't fit — drop or shrink?"** with per-item actions: `[keep anyway]` (pins it, bumps a lower one), `[shorten]` (open `durationSheet` app.js:401), `[move to tomorrow]` (`scheduleSubtask`-style move to `tomK()`, app.js:418), `[let go]` (remove, reward-framed: "saved for another day").
5. Apply → `reflow(todayK())` + `save()` + `renderToday()`.

**Must-do flagging** ties into Feature in the Non-negotiables cluster (separate spec) but this flow needs a *read* of must-dos: treat any block with `prio === 3` (Must) as a must-do, AND any title in `S.profile.mustDos`. To set must-dos here, add a star toggle on each kept/unfit row that writes the title into `S.profile.mustDos`.

**(4) CODE POINTERS** — new `eveningReplan()` near `schedule()`/`proactive()` (app.js:1293-1310) so it can share the fit loop. Hook from `proactive()` evening branch (app.js:1306) primary or chip: `{ label:"🌙 Replan what's left", fn: eveningReplan }`. Reuse `schedule()`'s priority-bump loop (app.js:1296-1297), `bedHour()` (app.js:90), `logicalNowMin()` (app.js:86), `durationSheet` (app.js:401), `PRIOS`/`prioC` (app.js:171-172).

**(5) UI** (berry sheet):
```
🌙 Replan tonight                         [sttl]
About 2h 30m left before bed.             [lbl]
  Fits — keeping:                         [lbl]
   ● Dinner          45m   ★              (nourish #34d39a, ★=must)
   ● Deep work       60m   ★              (focus #36b3f0)
  Won't fit:                              [lbl]
   ● Read     [ shorten ] [ tomorrow ] [ let go ]   (play #d99f30)
   ● Tidy     [ shorten ] [ tomorrow ] [ let go ]
  ─────────────────────────────────
  [ Lock the evening ]                    [done2]
```
Pink now-line stays the brightest element on the timeline behind the sheet; sheet itself flat berry. Must-star uses a small `ti-star-filled` in the row, NOT a glow.

**(6) DATA** — `S.profile.mustDos = [titles]` (covered by SCHEMA→2 migration). No block-shape change; uses existing `prio` field.

**(7) REGION** — `schedule()`/`proactive()` region (app.js:1293-1310) + new sheet fn. Block mutations go through standard `reflow`+`save`+`renderToday()`.

**(8) EFFORT** — M (the fit-to-budget reasoning + the multi-action unfit rows; the loop itself is copy-shaped from `schedule()`).

**(9) RISKS** — Low render risk. Watch: the "keep anyway → bump a lower one" must mirror `schedule()`'s lowest-prio selection (app.js:1297) so it stays consistent with the auto-bump engine the user already sees. Don't double-bump. `move to tomorrow` must `reflow(tomK())` too. Reward-never-shame: "let go" copy = "saved for another day," never "failed/skipped."

---

## Feature 4 — Plan starting block by time of day (bed/clean if late, bookend/journal if early)  ·  ▫️ med  ·  effort S

**(1) Ask** (audit:536): _"starting is usually making ur bed and cleaning or if it's late then moving towards bed . Or if it's early doing an bookend and journaling"_

**(2) Buildable?** PARTIAL → concrete. Time-of-day suggestions exist (`SUG_POOL` app.js:335-340, `CONTEXT` app.js:241, `proactive` phase branches). Missing: explicit **first-block** logic — when the day has no plan/no started block, the *opening move* should be bed+clean (late) vs bookend+journal (early).

**(3) APPROACH** — Add `startingBlockSuggestion(k)` returning the right opener for the current `phase()`:
- `morning` (early): **bookend + journal** → offer `ritualSheet(MORNING_RITUAL)` (which already contains bed/tidy/journal/plan steps, app.js:152-158) OR drop a `Journal` (restore) + `Make bed` (upkeep) pair.
- `night`/`evening` late: **bed + clean** → offer `ritualSheet(WINDDOWN)` (dim/tidy/phone/bed, app.js:165-170) OR drop `Tidy` (upkeep) + head-toward-bed.
- Surface this ONLY when it's the genuine *start* of activity: `blocks(k)` empty OR no started/done block yet today. Hook into `proactive()`'s `else` branch (app.js:1307) where it currently says "No plan yet — shape the day" — replace the generic `suggestSheet` primary with the phase-correct opener: early→"Start with your bookend ☀️", late→"Wind toward bed 😴".

**(4) CODE POINTERS** — new `startingBlockSuggestion()`/`firstBlockFor(phase)` near `sugNext` (app.js:341) or `proactive` (app.js:1301). Edit `proactive()` `else` branch (app.js:1307) and morning branch sub-copy (app.js:1305). Reuse `MORNING_RITUAL`/`WINDDOWN` (app.js:152/165), `ritualSheet` (app.js:3021), `phase()` (app.js:1243), `wakeHour()`/`bedHour()` (app.js:89-90) to refine early/late beyond the coarse `phase()` (e.g. "late" = within 2h of `bedHour()`).

**(5) UI** — Hero card copy + primary swap (no new surface):
```
this morning                              (kicker)
Fresh start — open with your bookend.     (line)
making the bed, a few journal lines.      (sub)
[ Start your bookend ☀️ ]  (primary → MORNING_RITUAL)

— vs late —
tonight                                    (kicker)
Late one — let's land softly.             (line)
tidy a surface, then toward bed.          (sub)
[ Wind toward bed 😴 ]  (primary → WINDDOWN)
```
Existing `proactive` render styling; just smarter primary selection. No palette change.

**(6) DATA** — None. Pure phase-keyed routing. No migration needed.

**(7) REGION** — `proactive()` (app.js:1301-1310) + small helper near `sugNext` (app.js:341). No timeline render touch.

**(8) EFFORT** — S (copy + routing logic over existing rituals).

**(9) RISKS** — Minimal. Only ensure the "start" detection (empty/no-started-block) doesn't override the existing useful branches (over-budget at app.js:1303 must still win — keep its early `return`). Don't show the opener if the user already has momentum (started/done blocks exist).

---

## Feature 5 — Planning can include a journaling session  ·  ▫️ med  ·  effort S

**(1) Ask** (audit:541): _"part of the plan can be like a journaling session"_

**(2) Buildable?** PARTIAL → concrete. Journal exists as a pickable activity (restore domain, app.js:191/270) and a 1-line ritual step (app.js:155, "Journal a few lines"). Missing: journaling as an *integrated session stage inside a planning flow* — a real reflective beat, not just a logged tap.

**(3) APPROACH** — Add a lightweight `journalSession(onDone)` modeled on the existing reflective `gratefulFlow` (app.js:2809-2840) — same berry sheet, breath-orb pacing, prompt → free-text → log. Then wire it as an *optional stage* in planning:
- In `planDay(k)` (app.js:783) add a button: `[ 📓 Start with a journal ]` that runs `journalSession()` then returns to `planDay(k)` (so reflection front-loads the plan).
- In the morning recommit / bookend, the "Journal a few lines" step (app.js:155) can route to `journalSession` instead of an instant log when tapped (richer beat). Keep it optional/short — David wants it *available* in planning, not forced.
- The session: 1-2 prompts ("What matters most today?" / "What's pulling at you?"), a textarea, Save → push a `Journal` log (restore domain, mins from time-in-session or default 5) like `gratefulFlow`'s `source()` (app.js:2837). Optionally store the entry text in `logs(k)` entry `.note` field (additive, harmless).

**(4) CODE POINTERS** — new `journalSession(onDone)` modeled on `gratefulFlow` (app.js:2809). Hooks: add a button in `planDay` (app.js:783-792, alongside Daily fundamentals / Pick activities); optionally re-route the `MORNING_RITUAL` journal step (app.js:155) by giving it an `action:"journal"` and handling it in `ritualSheet` (app.js:3026) like the `plan`/`planTom` branches. Reuse `openSheet`/`closeSheet`, `logs(k)`, `earn`, `add()`, breath-orb CSS class `breathorb` (already used app.js:2829).

**(5) UI** (berry sheet, reflective):
```
📓 Journal                                [sttl]
A few honest lines before you plan.       [lbl]
What matters most today?                  (prompt)
[  textarea — berry surface, lilac text  ]
( breath-orb, slow )                      [breathorb]
[ Saved — back to planning → ]            [done2]
```
restore-domain color `#2ab8c4` accents only; no glow. Returns to `planDay` after save.

**(6) DATA** — Optional `.note` string on the journal log entry (additive, no migration required — existing logs are free-form objects). If you want a dedicated journal store, `S.journal[k] = [entries]` is also additive and harmless; not required. No SCHEMA bump needed for this feature alone.

**(7) REGION** — new fn near `gratefulFlow` (app.js:2809) + `planDay` (app.js:783) + optional `ritualSheet` (app.js:3021). No timeline render touch.

**(8) EFFORT** — S (clone `gratefulFlow` structure, simpler; one button wire-in).

**(9) RISKS** — Minimal. Keep it SHORT and skippable (David: "can be" a journaling session, not mandatory). Don't block the planning flow behind it. Log the session as a real `restore` activity so it shows on the timeline consistently.

---

## Build order recommendation (for a parallel build-agent)
1. **Feature 4** (S) and **Feature 5** (S) — smallest, no migration, pure additive; ship first.
2. **Feature 2** (S-M) — chips + 2-screen continuation; no migration.
3. **Feature 1** (M) and **Feature 3** (M) — share the SCHEMA→2 migration (do the migration once, then both); both are sheet flows reusing `saveMasterpiece`/`schedule`.

All five are sheet-surface features — **timeline render is NOT touched**, so they can run in parallel with the navigation/timeline cluster without conflict, as long as the SCHEMA bump is coordinated (one agent owns the `load()` migration edit at app.js:1199).
