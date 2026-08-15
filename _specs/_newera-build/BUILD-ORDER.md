# RECONCILED BUILD ORDER — new-era redesign × the book-canon gameplan
**Date:** 2026-07-19 · Reconciles the two queues that were both live: the core-redesign new-era builds (`home-BUILD`, `planner-BUILD`) and the MASTER-GAMEPLAN book-grade builds (B1 PM close first). Grounded in the real app (v1136) and the actual PM-close code.

## The finding (why there is no conflict, and one real dependency)
- **Home (H-A/B/C) is DONE** (shipped v1134-1136: flat circle, context bar, state faces, tool grid). Not in the queue anymore.
- **The PM close is NOT a surface either new-era spec touches.** home = the "What now?" cockpit; planner = the timeline. The evening day-close (`devOpenStage("pm")`, the evolve-in-place bookend near app.js line ~4305, `S.dayClose[k]`, `pmRecordPlanAhead`) is its own flow. So the gameplan's worry ("rebuild PM close then re-skin its home = double work") does not apply — there is no PM-close home to re-skin.
- **The ONE real dependency:** the new-era skin (MINIMAL/BIG/FRIENDLY + STYLE-NEW-ERA palette) is now APP-WIDE law (memory `alter-design-law-minimal-big-friendly`). So B1 must be built **new-era-native** (flat fills, Baloo headline, big targets, lilac context lines, no old-style chrome) so it never needs re-skinning.

## THE ORDER (REVISED 2026-07-21 per MASTER-GAMEPLAN §3A: rails moved up, engine work deferred to founders era)
1. **B1 — PM close, book-grade + new-era-native** (unchanged; spec below). Copy pre-gated by cheap models at session start; Opus wires, never wordsmiths.
2. **B4 — Stripe rails + founding page** (parallel lane, mostly OUTSIDE app.js: Payment Link, signed license key, premium flag, squeeze page with seat counters). Must be live by Aug 9 so soft launch can collect handshake pre-commitments (tripwire #2 fires while cheap). Can start before B1's device verdict lands.
3. **B3 — first-day polish** to the acceptance test; MI grammar written directly into its copy (the B2 REGISTER, not the B2 engine).
4. **B9-lite — never-punish sweep** of every day-1 surface (miss/empty/setback copy) + **P-A planner paint** if slack allows.
5. **Aug 8 structural freeze.** P-B/P-C, B2-full engine, B5, B6 build, B7 full rewrite, B8 → founders era (Sep+), shipped as the weekly founder updates.

Rationale for the change: the old serial order landed rails mid-August, AFTER soft launch opens (Aug 9); sell-before-finishing (business canon PART 3) requires the offer live when the warm circle arrives. One WIP in app.js at a time; the parallel lane holds non-app.js work. Full reasoning + the launch bar: MASTER-GAMEPLAN REVISION 2026-07-21 (§3A/§3B).

<details>
<summary>Superseded order (2026-07-19), kept for the record</summary>
B1 → P-A → B2 → P-B/P-C → then first-day → rails → personas → launch. Rationale then: capability gap outranks polish; B2 waits for new-era host surfaces; regression-zone structure last.
</details>

---

## B1 — PM CLOSE, book-grade (the 10-line one-shot spec, per CLAUDE.md)
**What changes:** rebuild the PM-close content/flow to the mind+psy canon (`BOOKS-MIND-PSY-CANON-2026-07-19` PART 5.1), in the new-era skin, WITHOUT changing the data contract (`S.dayClose[k]`, `pmRecordPlanAhead`, `bk.pm.done`) — those stay so streaks + the record keep working.
**The book-grade shape (replaces the current win/learn/rating/deal beats):**
1. **Generation-first open** (Make It Stick): before showing the day's log, ask the user to recall — "before I show you the day, what stayed with you?" One line.
2. **Acknowledge-first** (ACT drop-anchor / TAME): one curiosity-toned line naming what showed up emotionally, never a judgment prompt.
3. **Bouquet, never prosecutor** (MI): assemble ONLY the day's wins / change-talk / lived blocks. Never itemize what was missed. (Reads `S.dayClose` + lived blocks; the miss-list is forbidden.)
4. **Kindness + common-humanity** (Neff): if the day was hard, the DARN-C / doughnut-study reframe bank — "the time wasn't right," never "you failed."
5. **The plan-ahead seed** (unchanged mechanic): the "Planned Ahead" hero streak write (`pmRecordPlanAhead`) stays; frame it as the one honest next-thing, not a scorecard.
6. **Celebration beat** (Fogg): one in-the-moment Shine line within seconds of submit — "you showed up for that" — descriptive, never evaluative ("great job, as expected" is banned).
7. **Constant attributed close** (Yapko/Eason): same closing beat every night, attributing the day to the user's own participation; the last line is deliberately the best.
**Guards:** retrospective + always-skippable (Pennebaker CISD law); no same-day forced processing after an acute logged event; the bedtime brain-dump stays a SEPARATE light mode (do not fold in). NO SCHEMA change (pure content/flow over the existing `S.dayClose` shape). Register split (T2): this is a conversational surface → MI grammar, NOT hypnotic-suggestion grammar.
**Plan-reality law (LOCKED 2026-07-21, DECISIONS.md):** the carry list is the river's mouth: blocks displaced or unlived during the day arrive here. Frame each as still-yours ("carry to tomorrow, or release"), NEVER as a miss-list (bouquet law); the close's one honest observation may name a displacement plainly ("Deep work lost its slot to a walk"). The auto-flow mechanic itself is a PLANNER slice (D3, regression zone), NOT B1: B1 only reads and frames what flowed in.
**Copy:** every new line through Gate 1 (`copy-audit.py`, with the merged mind+psy ban list added) + Gate 2 (adversarial judge vs COPY-ANCHORS). RU dict same commit. Append any David-reject to COPY-ANCHORS as KILLED.
**Skin:** new-era-native (STYLE-NEW-ERA palette, flat fills, Baloo 800 headline ~30px, lilac context lines, targets ≥44px). Evolve the existing bookend in place — no parallel overlay (matches the current `exitStage('pm')` pattern).
**Verify:** preview drives `DEV.pmClose()` through a seeded good day AND a seeded hard day; faces render, `S.dayClose` still writes, streak still fires, no console errors. DEVICE-UNTESTED: the felt pacing/warmth — David reads it on his phone before it's "done."
**Model/effort:** OPUS, effort HIGH (copy craft + the existing-surface care). One focused session, this spec, execute once.

## First moves for the B1 session
1. `/standup` to reconfirm state.
2. Read the full current PM-close flow (`devOpenStage("pm")` → the ~4305 bookend + `pmRecordPlanAhead` + `S.dayClose` write) so the rebuild preserves every data write.
3. Draft the 7 beats' copy → both gates → then wire, in the new-era skin, over the existing data contract.
4. Preview-verify both seeded days; ship the slice; David reads it on device.
