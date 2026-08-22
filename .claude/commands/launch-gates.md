## INPUT
Optional: $ARGUMENTS
- No argument / "where are we" → report current gate + what it needs to advance.
- "advance" / "next gate" → check the current gate's criteria, and if David greenlights, move state forward.
- "back" → note a gate needs rework (never silently skip).

# /launch-gates — the founding-launch state machine

**GATED BEHIND THE MVP (David 2026-08-22).** G0 does not open until M1-M4 are done: journey (basic, not silly), the
tutorial, the dumb-bug lane, and breathing with a progression. See `_specs/MASTER-GAMEPLAN-2026-07.md` REVISION
2026-08-22. If this command is run before then, say that plainly and report which of the four are outstanding —
do not advance a gate against the old MVP.

The founding launch is a Product Launch Formula event with a sequence, not an announcement (business canon PART 3). This runs it as greenlit gates so the launch is a state we're INSIDE, not a spec I have to remember. State lives in `_specs/LAUNCH-STATE.md` (single source of truth for where we are).

## The gates (criteria are from BOOKS-BUSINESS-CANON PART 3 — that doc is authoritative; this is the driver)
- **G0 — Readiness.** WTP round done with family + warm circle (or explicitly waived by David). MVP line met (PM close, first-day, stone 1, Stripe rails, science page). Four-persona device test passed.
- **G1 — Pre-survey (T-14).** Two-question email to the warm list. Harvest exact language for copy.
- **G2 — PLC1 "why".** Origin story. NO sale.
- **G3 — PLC2 "what".** Teach the honest-design mechanism; show real usage; David's face. NO sale.
- **G4 — PLC3 "how".** Pivot to founding; publish the ladder AND the seat counts.
- **G5 — Cart open (5 days).** Day1 open → Day2 social proof → Day3 objections → Day4 24h warning → Day5 two close-day emails. Seat counters live on the page. Checkout commitment sentence.
- **G6 — Close + post.** Personal onboarding of every founder (first ~50 concierge rule), testimonial collection, founders' monthly-numbers email #1.

## Procedure
1. Read `_specs/LAUNCH-STATE.md` for the current gate.
2. Report: current gate, its acceptance criteria, what's done vs. missing, the ONE dominant persuasion lever this gate is allowed (canon law 11 — one lever per wave; never stack).
3. To advance: confirm criteria are actually met (not just claimed), get David's explicit greenlight, then update `LAUNCH-STATE.md` (new gate, date, notes). Never advance on an unmet gate.
4. If a tripwire is relevant (e.g. G0 → tripwire #2, zero pre-commitments), surface it.

## Rules
- One dominant lever per gate. Founding = scarcity + commitment. Never stack every lever (reads as manipulation).
- Real seat counters, published ladder, honest scarcity only. The refused-techniques table (business canon PART 6) is binding.
- David greenlights every gate transition. This orchestrates; it does not decide.
