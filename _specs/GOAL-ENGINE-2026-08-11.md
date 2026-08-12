# THE GOAL ENGINE — the substance under the statues (2026-08-11)

Born from David's verdict on the round-18 frames: "Claude Design lacks understanding of how people should make and manage their goals... it should be very clever at helping people achieve their goals." Mined via 4-lane graph (Newport / Johnson / Rohn / KB sweep incl. Oettingen, Steel, Fogg, Clear, Harris, Kurpatov, 4DX, Coaching Habit; lane files in `_design-sync/garden-2026-08-03/graph/goalmine-*.md`). EVIDENCE: every mechanism carries its source; nothing here is invented.

THE ONE-SENTENCE DIAGNOSIS: the statue system is a beautiful container with three holes: creation is a form (not a method), the next-step line is unguarded (can go abstract), and a stalled goal gets silence (not diagnosis). The engine plugs exactly those three, plus the selection layer above them.

## LAW 0 — ONE DATA MODEL
The statue menu is a SKIN on the same goal object the Goal Loom / Sequencer already define (`S.goals[].woop`, setup/system step kinds, `staleGoals()`, the `motivation-diagnostic` bead). EVIDENCE: JOURNEY-OS §2 build flag "never run two goal models at once." Everything below reads/writes that one shape.

## 1. CREATION — Q4 "The First Cut" becomes a method, not a form
(Post-skeptic shape: the true creation is FOUR quick taps; the method arrives by progressive disclosure AFTER the boulder stands. A tired user on a phone can finish in 30 seconds; the depth is invited, never gated. ADHD floor law absolute.)

**At creation (the 30-second path):**
1. **Name.**
2. **One first pass, linted.** The CONCRETENESS LINT (Kurpatov: abstract goals are neurologically inert) checks for a doable verb + object ("call the clinic"). Outcome-shaped ("lose 5 lbs") or dead-person-shaped ("stop skipping") lines get ONE gentle chip offering the lead-measure rewrite ("3 gym sessions this week"), never a block (4DX lead vs lag; Harris toward-moves).
3. **"By when?" — optional, honest.** The T in SMART, explicitly kept: a goal may carry a plain by-when date on its plaque, and passes may carry the loom's existing `due` field. A date is a fact; a countdown is a manipulation. No timers, no red overdue states, no counting up: a passed date simply reads "past its season" and routes to the stall diagnostic. (Skeptic catch: JOURNEY-OS already has Timed + `due`; dropping it was a hole, not a law.)
4. **Creature + boulder placement** (unchanged, already right).

**Progressive disclosure (offered once the boulder stands, on the card, each skippable):**
- **The WHY, user's own words.** "What does finishing this change for you?" One line, free text, NEVER a picker, NEVER auto-suggested (Rohn: a supplied why carries no fuel). Resurfaced verbatim at the wake, at stalls, and on a paused stone (Harris: the value line stays true even if the goal retires). SCOPE GUARD (skeptic): the WHY is stakes-in-your-life, not identity-becoming. "Who you are becoming" language belongs to the VIRTUE LANTERNS and never appears in goals; the two systems stay unblurred.
- **Obstacle + PLAN, as a pair.** Oettingen's own data: obstacle-without-plan barely beats fantasy. The obstacle, then "when that happens, I will ___" via the app's PROVEN chip-picker pattern (3 templated chips + free text, the app.js onboarding WOOP pattern), not a blank textarea. Both `g.woop.obstacle` and `g.woop.plan` already exist in app.js: this is wiring, not invention. The pair is the quote on the card; the guardian reads the plan back at the exact stall it predicts.
- **More passes** (each linted) and the optional prior-best sizing question ("closest you ever got: what did that look like?" — Johnson/Waitzkin).

**Shapes are INFERRED, not asked (v2).** No shape question at creation. If a user writes rep-shaped passes ("25 sessions"), the goal quietly becomes practice-shaped (volume ticks; Johnson "fifty pounds equals an A"). The transformation template (Newport backward-chain, 30-day concrete window, faded far-silhouette) ships as a v2 creation template, not a v1 branch.

## 2. THE LIVE LINE — guaranteed real, forever
- The row line and the CTA always name the next PASS (a real-world action), NEVER a carve-stage name. "next → rough form" is the banned pattern; the stone is the picture, life is the text.
- Copy-gate rule added to `_dev/copy-audit.py`: pass CTA verbs must be controllable action verbs (call, write, show up, practice), never outcome verbs (lose, hit, reach, achieve). (Johnson's archer: name the draw of the bow, not where the arrow lands.)
- CTA picks the SMALLEST ready pass, not the next-in-order (Johnson/Whitehead 2mm domino: optimize do-ability).

## 3. THE NUMBERS — diagnosis, not status
Replace "passes done · days in · to next stage" with: **this week** (lead: what you controlled) · **to next stage** (lag: honest distance) · **vs your usual** (self-referential trend, never vs other users; Deci/Kurpatov: comparison only with your own past). "Days since first cut" DIES: a raw countup is a silent shame number (banned category). COLD-START RULE (skeptic): "vs your usual" needs ~4 weeks of history; before that the third slot shows the by-when date if set, else the card simply wears two numbers. Two honest numbers beat three fabricated ones.

## 4. THE STALL — the app finally has something to say
Fires ONLY when the user opens a goal that has been quiet a while (never a push, never a badge; zero-notification law), and AT MOST ONCE per goal per few weeks (skeptic + Rohn: push back once, don't hover; repeat visits get silence unless the user taps the always-available quiet "look at this with me" chip — pull, never push). One tap-through, four plain chips = Steel's motivation equation as UI, converging with Rohn's root-cause ladder and Fogg's troubleshooting order:
- "Still want it?" → no: retire with dignity (Win-or-Learn framing, a small closure ceremony; the WHY line stays displayed as true; never "failed").
- "Next step feel doable?" → no: Fogg five-link picker (time / money / physically hard / too much to figure out / doesn't fit my day) → shrink to floor, split, or re-anchor.
- "Something pulling instead?" → name it: it becomes the NEW obstacle line and asks for its plan (the WOOP pair stays alive, not frozen at creation).
- "Payoff feel far away?" → insert one nearer pass between here and the next stage.
Plus the state split (Rohn drift vs pause): PAUSED = user chose it (full respect, the statue waits). DRIFTING = nobody chose it; shown honestly (dim, no red, no counter) with a one-tap resolve: "still on it" or "park it properly."

## 5. PASS MECHANICS
- **Floors:** any recurring/system pass carries an optional hard-day version baked at creation ("full: 30-min session · hard day: shoes on"). Either counts; the floor version advances the carve a thin shimmer within the stage, not a full stage (Johnson skyscraper: floors prevent the boom-drop; reuse the engine-wide floor/standard/ceiling tiers).
- **Miss retro:** a skipped pass may open a 3-tap Win-or-Learn (worked / needs work / next time), and "next time" OVERWRITES the if-then plan: the plan gets smarter with use.
- **Setup passes:** one optional environment question at creation ("where will this actually happen?") can spawn a visually-marked setup pass (Clear: design the room, not the willpower).

## 5b. THE PRACTICE LINK — how goals harness habits (David's question, 2026-08-11, answered)
Johnson's hierarchy (identity → virtues → practices) is already ALTER's trinity: identity lives in the LANTERNS, practices live in the TREES. What his model lacks is the bounded concrete layer ("make X by Y date"): that layer is the STATUES. The bridge between them is a third pass kind:
- **The practice-link pass:** a pass that reads "do [existing practice] N times" ("20 deep work sessions"). The practice stays a grove tree and keeps growing exactly as before (a day is a day). The goal SUBSCRIBES to the same tracked sessions: each one ticks the goal's counter too. One behavior, one tap, two meanings: the tree grows because you practiced (forever-consistency), the statue carves because this bounded campaign harnessed that practice for a window. No double bookkeeping, no second tracking surface.
- **Planner tie:** practice blocks already land on the calendar. A block whose practice is goal-linked carries a small mark (this block also chisels [goal name]); the weekly ONE may schedule exactly such a block.
- **The goal can plant a tree:** if a goal needs a practice that doesn't exist yet, creation offers to plant it ("this goal uses deep work: plant it as a practice?"). The goal and the tree start the same week; when the statue wakes, the tree remains, which is the honest shape of real achievement: campaigns end, the practices they built stay.
- **The border rule (the grove collision, resolved):** forever-recurring with no finish line = tree only. Bounded with a finish line = statue, which may LINK trees but never replaces them. A practice-shaped goal ("meditate daily forever") gets routed to the grove with one direct line, no riddle: "This is a practice, not a goal with an end. Plant it in the grove?"

## 5c. THREE SMALL PIECES (accepted 2026-08-11)
- **The ambition nudge (Rohn):** if a goal's passes look trivially few for its stated size, push back exactly ONCE, in plain direct words ("This goal only has two steps. Add the rest if there's more to it."), one tap either way, never repeated. COPY REGISTER LAW: nudges are plain and direct, never coy metaphor-questions (the "whole climb or first landing" line is a KILLED anchor in COPY-ANCHORS.md: that register is banned system-wide).
- **The planting-to-harvest line (Rohn):** a card state for the honest middle: real passes done, no visible life change yet. One plain line naming the lag so silence never reads as failure. Pure copy, no code.
- **The goal-architect seam (business tie):** the creation flow is the future AI goal-architect surface (MASTER-GAMEPLAN's paid magnet). The app never supplies your WHY, but AI-assisted pass decomposition (suggesting the breakdown, sizing from history, lead-measure rewrites) is the paid-tier hook. Build the pass-authoring step so a suggestion source can plug in later.

## 6. SELECTION — the layer above all goals (the cleverest cut)
- **Carve cap:** 2-3 statues actively carving, max, and the cap applies only to REAL climbs (ventures/sagas); small koi-sized errand goals never consume a slot (skeptic: "book the dentist" must not compete with "get my health back"). A new big goal at cap forces the honest screen: "which statue rests?" with Porter's question in plain words: "saying yes to this — what does it push out?"
- **The wish tray:** ideas start as WISHES in a simple tray inside the menu (v1 = a list, zero new art; the circling-stones-on-the-shore visual is a later art round), revisited monthly, promoted deliberately (Newport incubation; Rohn wish-vs-goal gate: a goal never given a first pass stays a wish, visibly).
- **The weekly ONE:** at the existing week-seal, one cross-goal question: of every open goal's next pass, which is THIS week's best opportunity? The pick is handed to the planner as a real scheduled block (Rohn's one-best-opportunity + 4DX cadence). This is the goals→planner bridge and the single sharpest answer to "the menu should actually help."

## 7. COMPLETION — the wake, weighted
- Optional single line at the wake: "what did that prove?" (Rohn's feeling-catch + peak-end learning question). Never required.
- **Savor window** (Newport): after a wake, that life-domain's "carve something new" softly suggests visiting the living creature first; the menu prompts "what's actually different now?" once, weeks later. No hard lock in MVP.

## NEVER (converged bans, all sourced)
No percent bars, no countdown timers, no fixed day-count folklore ("21 days"), no social comparison, no "most people stall here" copy (Petrified Forest study: normalizing failure increases it), no affirmation-register lines ("I am disciplined"), no epic language on mundane goals (Octalysis believability gate: "call the clinic" stays small and literal), no supplied WHY, no forced reviews on a timer, no second goal data model, no diagnosis worded as a character verdict.

## BUILD ORDER (cheapest teeth first; skeptic-adjusted)
1. Live-line law + CTA copy-gate (near-zero code, kills "next → rough form").
2. WOOP obstacle+plan pair via the EXISTING app.js chip pattern (wiring, not invention).
3. Concreteness lint on the first pass (chip rewrites).
4. Numbers recast with the cold-start rule + optional by-when at creation.
5. Stall diagnostic (repeat-capped) wired to the existing motivation-diagnostic bead + drift/pause split.
6. Floors on system passes + miss retro.
7. Carve cap (big goals only) + wish tray (list-only v1) + weekly ONE (selection layer).
8. v2: inferred shapes (practice/transformation), prior-best, savor window, setup passes, circling-stones shore art.
