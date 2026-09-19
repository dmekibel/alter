# ENGINE LANE — what a stack-aware script needs (read out of composeStackSegs, 2026-09-16)

## What compose time ALREADY knows (no new data needed)
- `sawBodyPrep`: a relax or stretch act already ran (only the AUTO arc of `meditate` reads it; an explicit `t.med` list, e.g. v_open's [settle, rest], ignores it → the 10/15-min Morning Stack says the five relax cues twice, verbatim).
- `usedTxt`: every line said so far, normalised. BUG: the relax/somatic branch (C.cues) never writes into it, so a later section can re-say a relax cue.
- `dose` (sum of act secs), `t.secs` per act, act index `ai`, the previous act's id.
- `S.tools.use[id]` (completed reps) + `S.tools.last[id]` (day of last finish) → familiarity is derivable today.
- `S.tools.guidance` preset, `blueprint().practiceNovice`, `profile().lowEnergy`.

## The CONTEXT LEDGER (proposal: one object the composer carries act to act)
```
L = { eyes: "open"|"closed", posture: "standing"|"seated"|"lying", breathed: false, relaxed: false, settled: false,
      prev: null|toolId, first: true, familiarity: "first"|"occasional"|"regular", dose, actSecs }
```
Each act UPDATES it (stretch → posture standing, eyes open; breathe → breathed; relax → relaxed, settled, eyes closed; meditate → settled, eyes closed, posture seated; gratitude → eyes closed) and each act's content READS it to pick ONE opener.

## Per-tool content shape (every variant is just another hash-keyed line; nothing dynamic is spoken)
```
gratitude: {
  open: { solo: [...], afterBody: [...], eyesOpen: [...] },   // exactly one is chosen from L; in a stack with eyes closed + relaxed → none
  first: [...],        // said only when L.familiarity === "first" (the explainer + the "you may feel nothing yet" line)
  occasional: [...],   // one reminder line when it has been > 14 days
  items: [...],        // the asks, in order; the slot decides how many (1..5)
  feel: [...], noReason: [...], close: { stack: "...", solo: "..." }
}
```
Bridges live on the NEXT act's opener, not the previous act's close: the act that starts knows what just ended (`L.prev`), the one that ends does not know what follows.

## Familiarity tiers (Headspace infers from length; we know)
- first: `use[id] == 0` → explainer lines on, holds shorter, "if you feel nothing yet" line on.
- occasional: `use[id] < 5` or `last[id]` older than 14 days → one reminder line, no explainer.
- regular: otherwise → straight to the asks. (Stutz's own ladder: mechanical naming → feel while naming → wordless. The tier picks the rung.)

## Dose rules for gratitude
- In a stack: the registry already caps the slot (45 to 60s in every Morning band). Items = 1 at 30s, 2 at 45s, 3 at 60s, 5 at 90s+. Everything past 120s in a stack goes to the FEEL holds, never to more items.
- Solo custom: past 5 min the progression unlocks: more items with the "new ones only" and "use your head" tips, the past as a source, bad-things-not-happening, then a longer wordless stage, then the no-reason stage, then the daily-cue instruction (use it the moment a dark thought starts).

## Fixes this implies in the composer (build lane, Opus, later)
1. C.cues branch writes `usedTxt`.
2. Explicit `t.med` lists drop `settle` when `L.relaxed` (or the variant's med list is declared "settleOptional").
3. `meditate` after a `breathe` act skips the breath-block ENTRY ("Now bring your attention to the breath…") and starts on a pool line; the ledger says the breath is already there.
4. Every act reads `L` to pick its opener; the somatic relax act gets a `afterStretch` opener that includes "Sit down" once (posture bridge).
5. Familiarity from `S.tools.use/last`; a dev toggle to force a tier for testing.
