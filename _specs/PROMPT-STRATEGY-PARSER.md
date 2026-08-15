# THE STRATEGY-PARSER PROMPT — mining the competitor + market data for asymmetric insight
**Date:** 2026-07-06 · **For:** parsing `COMPETITOR-TEARDOWN-8APPS-2026-07-06.md` (and future teardowns) into defensible ALTER strategy
**Built from:** Anthropic prompting KB (`ai-kb/prompting-practices.md`) + evidence research (persona/panel studies, decision science, operator practice). Every design choice is cited in the DOCTRINE section.

---

## THE DOCTRINE — why this prompt is shaped the way it is (read once)

The clever move is **not** "act as Elon Musk." That's the least effective lever in the research:

- **Persona/celebrity prompting is cargo-cult for quality.** Zheng et al. (EMNLP 2024, 162 personas × 2,410 Qs) + Wharton *Prompting Science Report 4* (Dec 2025, *"Playing Pretend: Expert Personas Don't Improve Factual Accuracy"*): assigning a famous-person or expert persona gives **no reliable accuracy gain**, and a *named individual* is the weakest form (invites caricature). Persona shifts **lens/voice**, never correctness. Matches the KB (`prompting-practices.md`: "role-play wins for **tone**").
- **What actually moves quality, ranked by evidence:**
  1. **Explicit rubric + the exact decision & audience** — the single biggest lever; it also converts self-critique from *harmful* to *useful* by giving it an external signal ("LLMs Cannot Self-Correct Reasoning Yet," ICLR 2024).
  2. **Rubric-anchored adversarial pre-mortem** — Klein (HBR 2007) + Mitchell/Russo/Pennington (1989): "prospective hindsight" lifts identifying failure causes **~30%**. Framing failure as *already happened* defeats optimism bias better than "what are the risks."
  3. **Genuinely-disagreeing, task-defined lenses** (Solo Performance Prompting, 2307.05300) — one pass, **forced divergence** (no two lenses may agree, or output collapses to sameness). *Not* multi-round debate (oversold — "Should we be going MAD?", ICML 2024).
  4. **Step-back to first principles** before tactics (DeepMind 2310.06117, +7–27%).
  5. **Generate-N-then-judge** against the rubric (KB ATOM-049 generate/evaluate/repair; ATOM-018 judge lists pros/cons first).
  6. **Persona LAST — task-defined, never celebrity** ("the incumbent's head of strategy defending share," not "Elon").
- **The four failure modes this prompt is armored against** (all from supplying no data + trusting the model's confidence):
  - **Sycophancy** — agrees by default; reportedly capitulates ~88% under pushback.
  - **Persuasion-bombing** (MIT Sloan, 2026) — when challenged it *doubles down* with "a wall of data that seemed irrefutable," then flatters you. So the prompt forbids doubling-down and demands it reconsider.
  - **Trendslop** (Fortune, 2026) — clusters on generic buzzwords. Countered by "delete any sentence that would apply to any wellness app" + "cite which datum."
  - **Hallucinated data** — a16z notes LLM competitive synthesis is ~70% of human fidelity; every number must be flagged for verification.

**The armor, in one line:** *supply your own data, force disagreement, demand each claim cite its datum, run the pre-mortem, and verify every number.* Persona is seasoning; the rubric and the adversary carry the quality.

**Run settings that matter more than wording (KB):** run at **max reasoning effort / extended thinking on** (ATOM-029: thinking and effort are separate knobs — this substitutes for a lot of prompt-craft), and **paste the real data** (thin input → generic output, stated by every operator source). If Opus, it pushes back more readily than default GPT for this use.

---

## ① THE MASTER PROMPT (paste the dossier under `<DATA>`, run at max effort)

```
<role>
You are my strategy partner for ALTER — a guardian-angel wellness/planner PWA. You are not a
cheerleader and not a consultant selling a follow-on. You are the person whose only job is to
keep me from wasting a year building the wrong thing. You reason from the data I give you, and
you disagree with me whenever the data warrants it.
</role>

<data>
[PASTE the full contents of COMPETITOR-TEARDOWN-8APPS-2026-07-06.md here — the 8 teardowns,
the delta pass, the market research, and the ALTER thesis/laws. Thin input = generic output.]
</data>

<operating_rules>
1. Ground every claim in a specific row, quote, or number from <data>. If you can't, tag it
   [inference] or [unverified] — never present it as fact.
2. Delete any sentence that would be true of *any* wellness app. Specificity to ALTER or a
   named competitor is mandatory. Generic best-practice is failure.
3. Disagree with me. Where a premise in <data> (ALTER's own plan/laws) is weak, wishful, or
   wrong, say so and show the datum. I am asking you to find what I can't see, not to admire it.
4. If I push back on you later, do NOT double down with more rhetoric or flattery. Re-examine
   the argument and tell me plainly if I'm right and you were wrong.
5. Flag every market number you're not certain of, in a "VERIFY THESE" list at the end.
6. Show your reasoning, and after each key claim note which datum drove it.
</operating_rules>

<method>
Work in these seven steps, in order. Be terse. Use tables where scoring.

1. STEP BACK — first principles. In 3 bullets: what is the *governing dynamic* of this market
   (the deepest true reason users churn / what they actually hire these apps to do)? Then, in
   ONE sentence: the irreducible job ALTER does that no incumbent can copy.

2. JOBS-TO-BE-DONE. From the teardown + reviews in <data>, list the top jobs users hire the
   incumbents for, ranked by emotional intensity. Flag every job that is under-served or
   worked-around. Name the switching moment where a user would fire Finch/Tiimo and hire ALTER.

3. 7 POWERS — the wedge. Score the category leader (Finch) 0–3 on each of Helmer's 7 Powers
   (Scale, Network, Counter-Positioning, Switching Costs, Branding, Cornered Resource, Process),
   with evidence. Then the money question: what is ALTER's move that Finch/Calm/Replika
   *rationally would NOT copy because it cannibalizes their business model* (Counter-Positioning)?
   That is the durable wedge — name it precisely.

4. FOUR DISAGREEING LENSES. Analyze <data> through four experts who would genuinely fight.
   Each gives (a) their single sharpest insight and (b) their strongest objection to ALTER's
   current plan. FORCE DIVERGENCE: no two lenses may make the same point.
   - A 7-Powers strategist (is there a real, durable Power here — or am I fooling myself?)
   - A churned ADHD user who has quit 3 wellness apps (what makes her quit ALTER by week 3?)
   - A unit-economics CFO (if this ever must sustain itself, what breaks first?)
   - Finch's head of strategy, tasked with killing ALTER (what is their counter-move?)

5. GENERATE, THEN JUDGE. Propose 8 concrete strategic moves for ALTER (mix of onboarding,
   retention, positioning, feature). Then score each 1–5 in a table on: Defensibility ·
   Wedge-size · Time-to-first-value · Fit-with-"never-hands-over"-thesis · (invert) Build-effort.
   Rank by total. One line each on why the top 3 win.

6. PRE-MORTEM. It is 2028. ALTER failed completely. Write the brutally honest post-mortem: the
   3 root causes, ranked most-likely first, with a likelihood(1–5) × impact(1–5) score each.
   Mark each cause a TIGER (evidence-backed real risk), PAPER-TIGER (looks scary, isn't), or
   ELEPHANT (the risk I half-know but keep avoiding). For the top cause, the cheapest mitigation
   doable in one week. Do not soften.

7. THE ONE BET. Given everything above: the single highest-leverage move I should make, and the
   single thing I am currently most wrong about. Two short paragraphs. No hedging.
</method>

<output>
The seven sections above, in order, with the section headers. No preamble, no restating the
task, no closing flattery. Tables where the method asks for scoring. End with the "VERIFY THESE"
list of any numbers to check.
</output>
```

**How to run it:** set the model to **Opus at max reasoning effort / extended thinking on**, paste the full dossier into `<DATA>`, send. Then — critically — **run the follow-up passes below**, because sycophancy leaks across a single response and the second, adversarial turn is where the real signal appears.

---

## ② THE FOLLOW-UP PASSES (run after the master prompt — this is where the leverage is)

**A. Steelman-then-kill (two separate turns — the split matters; sycophancy leaks within one turn).**
> **Turn 1:** "Take THE ONE BET from above and steelman it — build its strongest possible form, preempt the three most obvious objections."
> **Turn 2:** "Now you are a rival VC who wants to pass on ALTER. Attack that steelmanned version. Name the ONE assumption that, if wrong, collapses it — and exactly what evidence would disconfirm it. Verdict: APPROVED or REJECTED, with the single fix." *(Then sit with it 24h before deciding — operators routinely dismiss the critique on day 1 and find it right on day 2.)*

**B. Inversion + constraint (asymmetric-move finder).**
> "You have $0, no team, no permission, and 2 weeks. Design the move most likely to win a user away from Finch, using <data>. Then invert: what would *guarantee* ALTER fails against the category? Turn each failure mode into a one-line rule for me."

**C. Anti-identity-defense trick (defeats the model flattering *you*).**
> Frame the plan as someone else's: "A founder sent me this ALTER plan for a blunt review. Tell me the 5 reasons it won't work as intended." (The model critiques harder when it isn't flattering the person it's talking to.)

---

## ③ SINGLE-FRAMEWORK SHOTS (when you want one lens, fast)

- **JTBD gap-miner:** "From the reviews/teardown in <data>, list the jobs users hire [COMPETITOR] for, ranked by emotional intensity. Flag every under-served or worked-around job. For the top 3, write the JTBD statement + the wedge feature."
- **Blue Ocean ERRC:** "Plot all 8 apps on the factors they compete on. Build an Eliminate–Reduce–Raise–Create grid for ALTER. Name the axis *nobody* competes on that ALTER could own."
- **Working-Backwards PR-FAQ:** "Write ALTER's launch-day press release + the 10 hardest customer FAQ questions, as if it already shipped and beat Finch. If the PR wouldn't excite the churned-ADHD user, say so and why."
- **Pre-mortem (standalone):** "It's 2028, ALTER failed. Ranked most-likely-first: the 3 root causes, likelihood×impact each, Tiger/Paper-tiger/Elephant tag, cheapest 1-week mitigation for #1. Do not soften."

---

## ④ DIVERGENCE BOOSTERS (when the output still feels like median-of-the-internet)
*The root cause of generic output: RLHF trains models to prefer "safe, common, stereotypical" answers — generic is the trained-in prior, not a bug. Each of these reframes the task to sample from a different part of the distribution.*

- **Thiel non-consensus filter** — forbids the consensus answer by construction: *"State the 3 things nearly everyone in the wellness-app market treats as obviously true. For each, build the most rigorous case it's wrong or soon will be, and describe the company built on the opposite belief. I only want beliefs where being right and early creates a moat."*
- **Second-order chain** (a16z Rampell) — pushes past the obvious first move: *"Take [ALTER's guardian-graduation thesis]. First-order effect → second-order (what that causes) → third-order. At each layer name a feature or business that becomes newly possible or newly dead. I care most about the layer everyone stops thinking before."*
- **Verbalized Sampling** — attacks mode-collapse directly by asking for the low-probability tail:
  ```
  Generate 5 distinct strategic moves for ALTER, each in a <response> tag with <text> and
  <probability>. Sample from the tails where probability < 0.10 — the moves a McKinsey deck
  would never suggest. Then tell me which tail move is secretly the best, and why.
  ```
- **Stacked** (the strongest single divergence prompt): role + non-consensus + inversion + tail-sampling — *"You're a skeptical operator who has killed 3 wellness startups. Name the consensus belief in this market, invert it, and give me 5 moves that follow — sample from the tails, skip anything obvious."*

Caveat on these: divergence boosters raise *variance*, not truth. Run the §2 adversarial passes (pre-mortem, steelman-kill) on whatever they surface — a tail idea is a hypothesis, not a verdict.

## The honest caveat
Every output of the above is a **hypothesis to validate**, not an answer — LLM competitive synthesis runs ~70% of human-analyst fidelity (a16z, 2025). The frameworks organize thinking and force disagreement; they do not replace shipping to David/Mom/Sister/Brother and watching what actually happens. The prompt's job is to make sure the 30% it gets wrong is *visible and challenged*, not smuggled in with confidence.
