# ALTER-OS — the cofounder/operator layer (Fable gameplan → Opus build)
**Date:** 2026-07-19 · **Why:** mom's $1k made the business real; alter's Claude layer has a builder (CLAUDE.md + ratchets) and copy gates but NO operator. David's ask: "you could work better as my cofounder... better systems to improve you as a system. Gameplan with Fable, executed with Opus." This is that gameplan. **Scope discipline: 4 files + 3 skills, all enforcing already-made decisions. Nothing new is decided here.**

---

## BUILD 1 — `COFOUNDER.md` (business constitution, ~1 page)
Peer to `CLAUDE.md`; add one import line there (`@COFOUNDER.md`) so it loads every session.
Contents (all pre-decided, just codified):
- **Roles.** David: verdicts, device tests, filming/posting, Reddit-as-human, terms/money calls. Claude: build, gated copy, content scripts, research pulses, ledger + report upkeep, tripwire watch.
- **Cadence.** 5 build sessions + 1 marketing/content session + 1 rest per week (masterplan §6). Rest is enforced, not suggested.
- **The one-move rule.** Every session ends with exactly ONE next move for David and ONE for Claude, written into the handoff.
- **The Dad Law.** No product/business decision without an `EVIDENCE:` line; hypotheses get tested cheapest-first, never shipped as convictions (FOUNDATION-PITCH §6).
- **Money rules.** Every expense → LEDGER.md same session. Weekly report to mom is non-negotiable. Ad spend stays signal-gated (test > organic median before scaling).
- **Model routing table.** Fable thinks / Opus builds / cheap models mine+judge (from the 2026-07-18 law + handoff §0), condensed to 4 lines.

## BUILD 2 — `.claude/skills/standup/SKILL.md` (the keystone ritual)
Trigger: `/standup` (David runs at session start, any model).
Procedure: read (a) newest TRACKER-HANDOFF status block, (b) MASTER-GAMEPLAN-2026-07 §6 next-move, (c) the calendar (masterplan §5), (d) LEDGER.md, (e) TRIPWIRES.md. Output EXACTLY this shape, ≤15 lines, no preamble:
```
WEEK N of the launch runway (launch = late Aug)
DONE since last standup: <from handoff/git log, 2-3 items>
DUE / OVERDUE: <calendar items + owed decisions, dated>
TRIPWIRES within 7 days: <or "none">
LEDGER: $<spent> of $1,000 · last report to mom: <date>
TODAY — David's ONE move: <...>
TODAY — Claude's ONE move: <...>
```
Rule: if David's owed decisions (terms sentence, gameplan PART 7 list) block a build, standup says so bluntly.

## BUILD 3 — `LEDGER.md` + `.claude/skills/report/SKILL.md`
`LEDGER.md` (repo root, committed — no sensitive data, amounts only):
```
# ALTER ledger
## Capital in
2026-07-19 · +$1,000 · mom · FLAME tier, build-funder role · terms: <PENDING David>
## Spend
<date> · -$99 · Apple Developer · <status>
## Revenue
(empty until founding launch)
```
`/report` skill: reads LEDGER.md + `git log --since` + newest handoff → drafts the weekly mom report in RUSSIAN, 3-5 lines, plain warm register (per mom-deck family voice; no hype, no dashes), presented in chat for David to copy to her. Logs the sent-date back into LEDGER.md.

## BUILD 4 — `TRIPWIRES.md` (dated risk board)
Seed rows (ALL already decided in masterplan §8 + handoff — just dated now):
| Date/window | Observable | Pre-decided response |
|---|---|---|
| ~Aug 16 (wk4 of content) | avg <500 views/post | change FORMAT (slideshows), not effort |
| Soft launch (Aug 9-22) | 0 handshake pre-commitments from warm circle | offer/pricing problem → fix BEFORE public launch |
| Tranche 1 sellout | zero price resistance | advance the ladder; never reopen tier |
| ~Oct 19 (month 3) | dread of user messages, post-launch flatness | reread quit-point map; one manual onboarding that day |
| Any week | revenue $500+/mo OR Apple remand resolves OR install-friction stall | open the wrap build (masterplan §2) |
| Every session | David asks for a build while on Fable | produce spec, route to Opus |
`/standup` checks this table by date.

## BUILD 5 — `.claude/skills/launch-gates/SKILL.md` (PLF orchestrator)
Mirror of balance's kp-orchestrator pattern: a gate state machine for the founding launch, state kept in `_specs/LAUNCH-STATE.md`. Gates (criteria from BOOKS-BUSINESS-CANON PART 3, verbatim source of truth):
G0 WTP round done (or explicitly waived by David) → G1 pre-survey sent (T-14) → G2 PLC1 why → G3 PLC2 what/teach → G4 PLC3 how + seat counts public → G5 cart open (5-day sequence loaded: proof/objections/24h/двойной close) → G6 close + post-launch (personal onboarding, testimonial collection, founders' email #1).
Each gate: acceptance criteria + David greenlight required + the one dominant persuasion lever it's allowed to use (canon law 11). Trigger language: "advance the launch", "next gate", "where are we on launch".

## BUILD 6 — `DECISIONS.md` (append-only)
Format: `<date> · <decision> · EVIDENCE: <source> · <link>`. Seed with the ~10 standing decisions (positioning line, streak repair model, free/paid split PROPOSED, PWA-first, FLAME allocation, tranche ladder). Claude appends during sessions when David verdicts something; standup never re-litigates anything in this file.

---

## OPUS EXECUTION CHECKLIST (one session, ~in order)
1. Write COFOUNDER.md; add the import line to alter/CLAUDE.md.
2. Write LEDGER.md (seeded), TRIPWIRES.md (seeded), DECISIONS.md (seeded from the list above + gameplan PART 7 open items marked PENDING).
3. Create the 3 skills (standup, report, launch-gates + LAUNCH-STATE.md at G0-pending).
4. Dry-run `/standup` once and show David the output; adjust the shape to his taste ONCE.
5. Commit (these are repo files, not app code — no preship needed; do NOT commit anything from `_pitch/` or `_books/`).
6. Update the newest handoff + [[alter-master-gameplan]] memory: ALTER-OS built.

## NOT IN SCOPE (refused, on the no-sprawl law)
Cron/automation (David runs /standup manually), dashboards/HTML, new memory systems, any app.js changes, a rewrite of existing specs. If a component isn't used within 2 weeks, delete it rather than maintain it.
