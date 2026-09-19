# RECAST — every cue line equal-sized (David 2026-09-10)

David, verbatim: "we don't have the the whole thing where it's like, one line is larger and in capital, the second line is smaller and in lowercase. Instead, all the lines are equal sized."

## What the code actually does (checked, not assumed)
- **Composed player** (`#breatheOv.gp-ov`, index.html:781): `.bw-label` and `.bw-sub` are BOTH `21px / weight 800 / #fff2f9`. Equal already. Every stretch and stack cue runs here.
- **beatRunner** (no `gp-ov` class, index.html:709-710): still `.bw-label 28px/800` over `.bw-sub 13px/#bcb0e8`. The Grateful Flow, PMR and the tapping runner draw here. **This is the surface that still contradicts the law** — CSS fix owed.
- Meditation pool lines never used the split (they are single full sentences via `medSeg(ln, gap, "")`), so they need no recast.

## The recast rule
Both halves are complete sentences, capitalized, terminal punctuation. No lowercase continuation fragments. This also fixes the spoken clip: the engine says `label + ", " + sub` (stretch) or `lab + ". " + sub` (beats), so the old form produced comma splices.

## Mechanics fixes folded in (Gate 2 judge REVISEs, flagged to David separately)
- #9 "slow nod" implied repeated motion on a cue that should be a static hold.
- #16/#17 the second wrist got one move for two directions where the first got two. Split it.
- #38 "bring one knee across your body" never said which foot went where.
- #44 asked knees, arms and head to move at once in one 8-second cue. Split into two.
