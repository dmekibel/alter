## INPUT
Optional focus: $ARGUMENTS
- No argument → full standup (default).
- "money" → just the ledger + report-due line.
- "risk" → just the tripwire scan.

# /standup — the session opener

Orient the session in under 15 lines so nothing is re-derived from 30KB of handoffs. Read, then output the fixed shape below. NO preamble, NO "here's your standup", just the block.

## Read these, in order (fast — skim, don't quote)
1. `_specs/MASTER-GAMEPLAN-2026-07.md` **REVISION 2026-08-22 — THE MVP IS FOUR THINGS.** This is what-next and it
   OUTRANKS everything below it in that file. The four are M1 journey (basic, not silly) · M2 tutorial · M3 the dumb
   bugs David finds · M4 breathing with a progression. Report against THESE, never against the old phase order.
2. The **newest** `TRACKER-HANDOFF-*.md` (its STATUS block + the one-move lines).
3. `BUSINESS-MASTERPLAN §5` — the calendar, for CONTEXT only. It was written against the old MVP, so do not report
   "on track / behind" against its dates as if they still held; say plainly that the launch sits behind the four.
4. `LEDGER.md` (spent / available / last report date).
5. `TRIPWIRES.md` (rows 1-6 — any whose window is within 7 days of today).
6. `DECISIONS.md` PENDING section (what David still owes that may block a build).
7. `git log --oneline -8` (what actually shipped since last session).

## Output EXACTLY this shape (≤15 lines)
```
MVP: M1 journey · M2 tutorial · M3 bugs · M4 breathing — <one line: which is moving, which have not started>
DONE since last standup: <2-3 real items from git log / handoff>
DUE / OVERDUE: <calendar items + owed decisions, each dated; "nothing overdue" if clean>
TRIPWIRES within 7 days: <the row(s), or "none active">
LEDGER: $<spent> of $1,000 spent · $<available> left · last mom report: <date or "none yet">
BLOCKED?: <any PENDING decision that stops today's build, or "clear">
—
DAVID's ONE move: <the single highest-leverage founder action — it is usually an M1 design verdict, an M4 note, or a bug he found>
CLAUDE's ONE move: <the single highest-leverage build/write action, spec-first, and it must serve one of M1-M4 by name>
```

## Rules
- If a PENDING decision blocks the day's intended build, say so bluntly in BLOCKED? and pick a move that unblocks it (or route around it).
- The two ONE moves are singular. Not lists. The smartest next thing each.
- Honor the model-routing law: if the session is Fable and the ONE move is a build, CLAUDE's move is "write the spec, David switches to Opus to build it."
- Keep it honest: if a tripwire fired, lead with it. If we're behind the calendar, say behind.
- A move that serves none of M1-M4 is not a move. If the honest next thing is outside the MVP, say so and name what it
  displaces — do not smuggle it in as "the one move".
- This reads state; it does not change it. Never edit files during a standup.
