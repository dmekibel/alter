# GOAL ENGINE — SKEPTIC LANE (2026-08-11)

*Adversarial review of `_specs/GOAL-ENGINE-2026-08-11.md`, fresh context, against David's kill history and the 4 lane files it was mined from. Job: refute before he sees it, not soften it.*

Grounding check first, because it changes several verdicts: **the statue/carve system does not exist in `app.js` yet** (no hits for `boulder`/`carve`/`statue`/`creature` outside unrelated sanctuary-world sprite names). This is pure design-frame territory sitting on top of plumbing that's *already partly built*: `g.woop.obstacle` **and** `g.woop.plan` already exist and already have a working UI — a free-text pair (`app.js:2715-2732`, `saveWoop()`) **and, separately, a chip-picker pair already proven in onboarding** (`app.js:14523-14539`, `PM_KILL` chips → `pmWoopPlans()` chips). So "finish WOOP" is not new invention, it's a wiring choice between two patterns the app already ships. That matters below.

---

## 1. PER-ELEMENT VERDICTS

**LAW 0 (one data model)** — SURVIVE. Trivially correct, matches `S.goals[].woop`/`staleGoals()` already in the file. No argument to make here.

**Beat 1 — Name + shape (checklist/practice/transformation)** — RISK, leaning KILL for v1. Two problems. First, the doc contradicts itself: Section 1 presents the three-way branch as the FIRST question of the core creation method, but the BUILD ORDER buries "Shapes (practice/transformation templates)" at item 8, explicitly v2. David reads Section 1, not the build-order footnote — as written he will think this ships day one. Second, even if deferred, asking a tired user to classify their own goal into a taxonomy ("is this a checklist or a practice, rep-counted volume goal?") before they've typed a single word is dev-language leaking into UX — nobody knows which bucket "learn guitar" is in until they've tried to write a pass for it. Newport's own lane explicitly warns against this: *"don't over-build the machinery... ship the Selection gate and lead-metric forcing first... the rest are real but secondary; sequence them, don't launch all ten at once."* This element should either not exist in v1, or the doc should say plainly in Section 1 "v1 defaults everyone into checklist shape; the branch is v2" instead of implying it's live.

**Beat 2 — The WHY, "who does finishing this make you"** — RISK. Two separate failures. (a) **Identity collision**: this phrasing is lifted from Johnson's lane ("who are you becoming") but Johnson's own mechanism routes that answer to the app's *existing VIRTUES vocabulary* as one reused tag, not a new free-text identity field. Totems/lanterns already own "who am I becoming" as a system — relight = daily recommit, craft tiers = evidence of identity held over time (per `alter-garden-ui-round` memory: "virtues own identity/declarations via lanterns"). A second, differently-shaped identity mechanic living on Goals, asked in near-identical language, is exactly the kind of system collision your own brief calls out, and the synthesis's LAW 0 only guards against two *goal* data models — it never checks Goals against Totems. (b) **The proposed hard gate**: Rohn's lane (which the synthesis draws on for this beat) proposes the boulder can't be placed until WHY + a real first pass are filled — a genuine blocking gate. That directly violates the ADHD floor law ("the loom never renders as a wall") and the forward-only/no-shame law. A tired user must be able to name a goal and place it with nothing more than a name.

**Beat 3 — Passes, linted, + optional prior-best question** — KILL as specified. This is where the form wall actually lives, and the doc's "five beats, never a wall" claim doesn't survive contact with what beat 3 actually asks: type N passes up front, each one individually run through the concreteness lint (a chip interrupt on ~any imperfect phrasing), plus an optional 6th sub-field (prior-best) sitting inside this one "beat." For a checklist goal with even 3-4 passes, that's 3-4 text fields each with a possible lint-popup detour, before the user ever sees a creature. Compare to Newport's own mechanism #2, the thing the synthesis claims to be implementing: *one* lead metric, not a pre-authored checklist. The true minimum is: name + ONE pass (the next real action), full stop — everything else about the shape of the climb gets added later, organically, as the statue is unfolded, not front-loaded at creation.

**Beat 4 — Obstacle + Plan pair** — SURVIVE mechanically, RISK on shape. The pairing itself is correctly grounded (all three lanes converge: obstacle-without-plan barely beats fantasy, Oettingen's own finding). And it's cheaper than the doc implies — `g.woop.plan` already exists and already has a working UI, so "the current spec ships half of WOOP" undersells reality; wiring this into Q4 is UI plumbing, not new mechanism design. But the doc says only "two linked lines," which is genuinely ambiguous between the app's two existing precedents: the heavier free-text `<input>` pair (2729-2732) or the lighter chip-picker pair already proven in onboarding (14523-14539). Left unspecified, a builder defaults to whichever pattern is closer at hand — likely the free-text one, since it's the one literally inside the goal-detail screen this new flow extends — which is the heavier, more form-like choice. The KB-sweep lane deliberately specified chips for exactly this reason ("never a blank form") and the synthesis dropped that specificity.

**Beat 5 — Creature + boulder placement** — SURVIVE, unchanged, correctly left alone.

**Live-line law + CTA copy-gate** — SURVIVE. Cheap, near-zero schema change, kills a real bad pattern ("next → rough form"), uncontroversial across all four lanes. Ship this first, full stop.

**Numbers recast (this week / to next stage / vs your usual)** — RISK. Lead+lag is fine and directly fixes the "days since first cut = silent shame number" problem (correctly identified, well-sourced). But "vs your usual" has a real cold-start hole nobody in the doc checked: a brand-new goal has no "usual" to compare against — what renders in week one, blank, N/A, or (worse) a misleadingly jittery number from a 1-data-point average? The doc also doesn't establish whether per-pass timestamps exist (only `goalLastK()`/last-touched exists in the grep, which is goal-level, not confirmed pass-level) — "passes done this week" needs finer-grained data than what's demonstrably wired today. Directionally correct, not yet verified computable.

**Stall diagnostic (4 chips)** — RISK, not KILL. The core shape is good: single-screen, single tap, fires only on genuine staleness (Octalysis Milestone-Unlock timing, correctly applied), routes to different real fixes instead of one generic nudge. But the doc never specifies a repeat-fire cap. If the same goal drifts, gets "still on it," and drifts again next month, does it ask the identical four questions a second and third time? Rohn's own lane warns explicitly against this pattern ("Rohn pushes back once, hard, at the moment of commitment — he doesn't hover. A repeated prompt would violate the app's own forward-only, no-shame law"), and the KB sweep warns the same thing about the root-cause ladder generally. As written, nothing stops this from becoming exactly the annoying-quiz failure mode the review was asked to test for.

**Selection layer — carve cap 2-3** — SURVIVE the mechanism, RISK the scope. This is genuinely the single sharpest thing in the whole document (Newport's own top-ranked mechanism, and correctly identified as such). The scope problem: the doc never says whether the cap applies uniformly across all three shapes. Newport's cap is explicitly about "major focus" ambitions — it was never meant to throttle "book the venue," "call the clinic"-style checklist errands. If a plain checklist goal competes for one of only 2-3 total carving slots against a "write a novel" transformation goal, ordinary life admin starts losing to epic goals for scarce slots, which will read as punitive, not protective — precisely the failure mode Newport's own lane warns against ("must read as protective... never punitive").

**Wish tray (circling stones, off-island/shore)** — RISK. Methodologically fine (Newport's incubation mechanism, well-sourced). Production risk not flagged anywhere in the doc: this needs NEW island art. Every prior art round in the memory log (stone5 carve ladders, lanterns v4-v10, store items) took multiple KIE generation rounds and a belonging-test pass before David accepted anything — "loose stones off-island or at the shore" is a new zone/object class with zero existing sprites, not a code-only build. The BUILD ORDER lists this at item 7 as if it's sequencing difficulty only; it doesn't flag that it also needs an art round the other seven items don't.

**Weekly ONE → planner handoff** — SURVIVE. Cheap, well-grounded (Rohn + 4DX + KB sweep all converge independently), and it's the one mechanism that actually answers "the menu should help" by handing a real scheduled block to the planner instead of leaving the CTA abstract. Real dependency: it rides on the week-seal ritual, which per JOURNEY-OS is a planned surface, not confirmed built — flag as a dependency, not a flaw.

**Completion / savor** — SURVIVE. Correctly optional, correctly deferred (no hard lock in MVP), low risk either way.

**The NEVER list** — SURVIVE. Comprehensive, well-sourced, correctly bans percent bars, timers, comparison, fixed day-counts, epic-on-mundane. No notes.

---

## 2. THE MVP I WOULD ACTUALLY SHIP FIRST

Five mechanisms, nothing else:

1. **Live-line law + CTA copy-gate.** Near-zero code, kills the worst existing pattern, zero schema risk.
2. **Obstacle + Plan pair, reusing the EXISTING `g.woop.obstacle`/`g.woop.plan` fields and the EXISTING chip-picker pattern from onboarding** (not the free-text pattern — chips, explicitly, per the KB-sweep reasoning). This is cheaper than the doc thinks and higher-leverage than the doc gives it credit for, precisely because it's already proven twice in the codebase.
3. **Concreteness lint on passes** — but only on the ONE pass required at creation (see below), not on a pre-authored list.
4. **Numbers recast, lead+lag only** — ship "this week" and "to next stage," hold "vs your usual" until there's enough per-pass history to compute it honestly. Don't ship a number that's misleading in its first month of existence.
5. **Carve cap (2-3), scoped to practice/transformation goals only** — exempt plain checklist goals from competing for the same scarce slots.

**Cut from v1 entirely:** the shape taxonomy branch (default everyone to checklist; infer or offer practice/transformation as a v2 toggle once a goal already has recurring passes), WHY-gates-boulder-placement (make WHY optional, one prompt, never blocking), the wish tray (needs an art round first), prior-best question, savor window.

**True minimum creation flow:** name → one real pass (typed, lint-checked once) → creature → placement. Everything else — WHY, obstacle+plan, additional passes, shape — becomes progressive disclosure available from the unfolded card after the goal already exists on the island, not a gate in front of it.

---

## 3. TOP 5 FIXES BEFORE DAVID SEES THIS

1. **Resolve the WHY/identity collision with Totems.** Either rescope the field away from identity language ("what will finishing this actually get you" instead of "who does finishing this make you") or route it through the existing VIRTUES vocabulary the way Johnson's own lane specified, instead of inventing a second free-text identity system next to the lanterns.
2. **Fix the internal contradiction on shapes.** Section 1 currently reads as if the three-way branch ships in v1; the build order says v2. Pick one and say so explicitly in Section 1, not just in a build-order footnote seven sections later.
3. **Make WHY optional, never a gate.** Drop Rohn's proposed "boulder can't be placed without WHY + a real first pass" block — it directly contradicts the ADHD floor law this same document is supposed to honor.
4. **Cap the stall diagnostic's repeat-fire.** Add an explicit rule: never ask the identical four chips twice on the same goal without the copy changing to acknowledge the prior answer, or shortcut straight to the retire offer on a second occurrence.
5. **Name the Time-bound gap and force a decision** (full detail below) — right now it reads as an oversight, not a verdict, and it's the one SMART letter this whole exercise is supposed to be answering for.

Runner-up, worth a line even if not top-5: specify chip-picker (not free-text) for the obstacle+plan pair, and flag the wish tray's art-round dependency in the build order.

---

## 4. WHAT'S GENUINELY MISSING

**Time-bound — the real hole, not a defensible omission.** `_specs/JOURNEY-OS-2026-07-21.md` §2 — the Goal Loom spec this synthesis claims to be "the same data model" as (LAW 0) — already has "Timed" as one of its five SMART letters AND a concrete `due` field on every step (`steps:[{t, kind:setup|system, due, done}]`). The GOAL-ENGINE-2026-08-11.md synthesis mentions "due," "deadline," or "Timed" **nowhere in eight sections.** This is not covered by the no-timers world law — that law (per the KB sweep's own NEVER list: "never a fixed day-count," "never a countdown timer") is specifically about manipulative UI pressure mechanics, a ticking clock used as a motivator. It is not a ban on a real due-date field on a planner-bound step, which the app's own prior spec for this exact data shape already has. The synthesis conflates the two and silently drops the T. Fix: state explicitly whether "when" lives on the pass/WOOP-plan itself (matching the loom's existing `due`) or exclusively downstream via the Weekly ONE→planner handoff — either is defensible, but the doc has to say which, not skip the letter.

**Also missing, lower priority:**
- **No edit/reclassify path.** If shape is chosen at creation and turns out wrong (a "checklist" goal that's actually rep-shaped), there's no stated migration.
- **No wish-tray hygiene state.** Goals get a DRIFTING/PAUSED split; circling stones get no equivalent — do they decay, expire, get silently forgotten forever?
- **Newport's review-before-seal warning dropped without acknowledgment.** His lane explicitly says a statue shouldn't fully wake with unresolved passes still floating; Section 7 (Completion) doesn't address this at all.
- **Newport's witness gate and calibration-buffer mechanisms are absent with no stated verdict.** Possibly fine to cut for v1, but the doc's own framing ("every mechanism carries its source; nothing here is invented") implies exhaustiveness it doesn't actually have — several individually-reasonable cuts (ambition-floor nudge, second-pathway, prior-best) are made silently rather than named as deferred.
- **Big-3 domain balance (Energy/Work/Love) isn't wired into the carve cap.** The KB sweep's own month-cap mechanism includes a balance nudge; the synthesis's carve cap doesn't inherit it.
