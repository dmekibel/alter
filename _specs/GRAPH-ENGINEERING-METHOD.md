# GRAPH ENGINEERING — the method (distilled from David's tutorial, Greg Eisenberg, youtube JWhICz1QR8M)

Source: transcript David supplied 2026-08 (raw: `_specs/GRAPH-ENGINEERING-RAW-EXTRACT.txt`, recovered from the balance session 38c5cbca). This file is the operating version.

## The method in one line
Design the WORK around the AI as jobs connected by arrows, instead of one messy chat: planner → parallel lanes → skeptic → merge → human gate.

## The vocabulary
- **Jobs** = steps in the workflow. **Arrows** = what depends on what. **State** = the shared notes moving through (what the system knows so far).
- Two kinds of graphs: **knowledge graphs** (how information connects) and **agent graphs** (how work moves). This method is agent graphs; the best systems eventually use both.

## The diamond (the canonical shape)
1. **PLANNER** breaks the question into independent angles.
2. **PARALLEL LANES**, one job each, run at the same time because they don't depend on each other.
3. **SKEPTIC**: its own job, never the writer grading their own work. Asks: which claims are supported, which evidence is stale, what's being ignored, where does confidence outrun proof.
4. **MERGE**: surviving evidence → one recommendation, plus "what would change our mind."
5. **HUMAN GATE** before anything expensive. Light gate for private memos; strict gate for anything public, irreversible, or costly.

## The laws
- **Smallest graph that improves quality**, never the biggest. More agents can mean more noise.
- Remove fake waiting: independent jobs run in parallel.
- **Separate workers from checkers**, always.
- Stop when the answer is good enough.
- **Leave a paper trail**: each job writes its file (plan.md, lanes' findings, review.md, recommendation.md). The state compounds: every run's notes make the next run smarter. Context is the moat.
- Draw the graph BEFORE automating it. Run it manually until it works three times; only then tool it up.

## Standing application to ALTER design rounds (the process fix, born from the round-6/7 failures)
The garden rounds failed because ideas went from my head to David with NO SKEPTIC LANE: David was forced to be the skeptic, and 80% died on contact. The graph for every future idea/design round:

1. **Planner**: name the question and the independent angles (soul constraints, Johnson canon, David's verdict history, game references, app data reality).
2. **Lanes in parallel**: one lane per angle, each producing findings to file.
3. **SKEPTIC LANE (the missing job)**: a fresh-context agent that reads David's REJECTION CORPUS (his verbatim kills: "grayed-out island", "cloth statue is odd", "wisps look dumb", "door plaque weird and random", "quiet meter of nothing is the dumbest idea", "brown furniture", "overcomplicating") and attacks every candidate idea BY COMPARISON: predicted-kill or survive, with the matching precedent named. Same architecture as the copy-judge gate (COPY-ANCHORS), applied to design ideas. Only survivors reach the merge.
4. **Merge**: survivors → the proposal/prompt, with Johnson-node citations attached (he is structurally load-bearing, not on-request).
5. **Human gate**: David. His verdicts append to the rejection corpus, which is the compounding state.

State files live in `_design-sync/<round>/graph/` (plan, lane findings, skeptic verdicts, recommendation) so every round makes the next one smarter.

---

# HARDENED (2026-08-07 research pass: 3 lanes + skeptic, sources in the run output; the skeptic lane caught the lanes contradicting each other, which is the method working)

## The default rule (resolves the structure-vs-simplicity contradiction)
A single well-specced pass is ALWAYS the baseline. Add a node only when the task hits one of Anthropic's three validated conditions: context pollution, genuinely parallel work, or specialization. Multi-agent runs ~15x the tokens of one call, and reliability decays multiplicatively per hop (ten 95% steps = ~60% end to end). Graph structure is bought with reliability tax; buy only what beats the baseline. (This is also exactly ALTER's constitution: one Opus pass with a spec, no blind loops.)

## The single-writer law (Cognition's Mario/bird lesson)
Many minds may CONTRIBUTE (research, critique, votes); exactly ONE agent owns the actual mutation (the file edit, the spec, the merged answer). Parallel workers making implicit decisions in isolation produce incompatible parts. Fable-orchestrates-Opus-builds already obeys this; never violate it in a graph.

## Skeptic lane design, evidence-ranked
1. FRESH CONTEXT, never the generator's own session: self-preference bias survives rubrics (NeurIPS 2024); a model critiques its own work better "the moment it forgets how it was created."
2. REFUTE-FRAMING over score-framing: assigned adversarial stance ("argue why this fails") sharply beats neutral 1-10 rating (ICML 2024 debate results).
3. ANCHOR EXAMPLES over abstract rubrics: rated KILLED/EPIC precedents calibrate judges (this is COPY-ANCHORS, now evidence-backed). Keep the anchor set BALANCED: an all-KILLED corpus biases the judge toward killing everything.
4. If voting: 3-5 genuinely DIVERSE judges (different model families); N calls to one model = 1 effective vote dressed as N (correlated errors).
5. NEVER free-form peer debate between equals: it collapses into sycophantic agreement (models abandon correct answers to conform).
6. When comparing candidates: rotate presentation order (position bias), hide/normalize length (verbosity bias), instruct that confident tone is not evidence.
7. Caveat for creative/subjective work (ALTER copy, design ideas): verifier-easier-than-generator is only proven for checkable domains (code, math). For craft judgment, anchors and fresh context carry the weight, not voter count.

## State discipline
- Files are the bus (Anthropic's own artifact pattern): each node writes its output to disk; nothing big rides through chat context.
- Separate STRUCTURED state (small, queryable: decisions, ledgers) from the NARRATIVE log (append-only handoffs). Conflating them is why handoff docs bloat. (LEDGER.md vs TRACKER-HANDOFF already model this.)
- The paper trail is also the failure tracer: when a graph's answer is wrong, node-blame is read from the state files, so every node MUST write one.

## Adopted from the skeptic's gap list
- BASELINE-FIRST procedure: before building any graph, run the single-pass version once; the graph must beat it on real cases or it doesn't get built.
- Trust boundaries: any node ingesting external/untrusted content (web, files, tool output) is quarantined: its output is data for the next node, never instructions.
- Citation hygiene: the 2026-dated papers from the research pass are plausible but unverified: verify before citing anywhere downstream.
- Node regression: when a standing graph's prompt gets edited, rerun it against a kept example case before trusting it (the copy-audit pattern, applied to graph nodes).
