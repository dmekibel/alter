# STACK LIBRARY v2 — 15 stacks + Morning, one modular engine (2026-09-20, David-verdicted direction)

David: proportions must follow evidence (HeartMath, Dispenza, breathing trials); a stack always gives at least two things; every stack must be modular, expandable and contractible ("this one is 5-8, that one 30-45" is too restricting); no pop-ups; no random features (same six engines, different proportions); write the copy through the graph, avoid every past kill; record + wire.

## The engine (Opus builds): script acts + weighted fit
- `SCRIPT_ACTS[id] = { seq: [...strings...], gap: [...s...], tier: [1|2|3...] }` — exactly the MED_V2 / MANTRA shape. `composeScriptAct(id, secs, ctx)` = the MED_V2 fitter generalised: tier 1 always, add tiers while they fit, then scale gaps (0.6–1.6) and park leftover on the act's longest hold. Existing engines stay: meditate (MED_V2), stretch (seated seq / solo pool), gratitude (GRAT_FLOW), mantra (MANTRA_TIER), breath patterns (v_*), relax (somatic pool).
- `stackFit(pack, dose)`: each act has `{k, w (weight), min, max, opt (optional), pri}`. Distribute dose by weight, clamp to [min,max]; if dose < sum of required mins, drop optional acts lowest priority first; if an act's share < its min it is dropped (optional) or floored (required) and the rest rebalanced. Result: any stack runs from its floor (sum of required mins) up to its ceiling (sum of maxes) at ANY minute the user picks. The menu offers the stack's floor..ceiling as a slider/range of presets (2,3,5,8,10,15,20,30,45,60 filtered to the range).
- Ledger (already partly built): sawBodyPrep / eyes closed / opener skipping applies across all acts; a script act's opener line is skipped when the ledger says the previous act already said what it says (posture / eyes / breath).
- Logging (David: no pop-ups, so evidence is passive): per stack run write `S.tools.runs[]` = {stack, dose, done:bool, quitAt act, skipped:[acts]} capped at 200. No UI.

## Morning Stack (firstLight) anchors → weights
| act | w | min | max | opt |
|---|---|---|---|---|
| stretch (seated) | 1.0 | 45 | 240 | opt below 5 min |
| breathe (coherent) | 1.6 | 60 | 300 | required |
| relax | 0.9 | 60 | 420 | opt below 10 min |
| meditate (v2) | 3.6 | 180 | 1800 | opt below 10 min |
| gratitude | 1.0 | 45 | 240 | required |
| mantra | 0.6 | 30 | 150 | opt below 5 min |
| visualise (INTENT-morning) | 0.8 | 60 | 450 | opt below 20 min |
Checks: 2 min → breathe 60 + gratitude 60. 5 → stretch 45, breathe 90, gratitude 75, mantra 30 (+ remainder to breathe). 10 → matches the 09-20 table within ±15s. 60 → meditate ~1800.

## The 15 stacks (id · name · category · acts in order with w/min/max/opt · floor–ceiling · what's special · evidence)
1. `reset2` **Two-Minute Reset** · Reset · HEART w1 min60 max300 req; gratitude(turn-only variant: lines 11-13 of v12) w0.6 min30 max90 req · 1.5–6.5 min · HeartMath Quick Coherence as one flowing act · EVIDENCE: HeartMath coherence protocol.
2. `downshift` **Downshift** · Reset · SIGH w1.2 min60 max300 req; relax w1 min60 max240 opt(<4min); GROUND w1 min60 max240 req · 2–13 min · acute anxiety, body first then room · EVIDENCE: Balban 2023 cyclic sighing; sensory grounding.
3. `cooldown` **Cool Down** · Reset · ANGER w0.4 min20 max40 req; SIGH w1.2 min60 max300 req; relax w0.8 min45 max180 opt; GROUND w1 min60 max240 opt(<4) · 1.5–13 min · anger: body before mind, then one honest question · EVIDENCE: exhale-weighted breathing lowers arousal; distancing question (Kross).
4. `focus` **Focus Primer** · Before · v_box w1.2 min60 max300 req; meditate(v2, breath section only = lines 21-27) w1.4 min90 max600 opt(<4); INTENT w0.8 min45 max150 req · 2–17 min · attention only, nothing that softens · EVIDENCE: Zeidan 2010 brief mindfulness → attention.
5. `walkin` **Before You Walk In** · Before · v_box w1 min60 max240 req; mantra w0.8 min30 max150 req; REHEARSE w1 min60 max240 req · 2.5–10.5 min · nerves attack the first 30 seconds, so rehearse them · EVIDENCE: self-affirmation buffers threat; mental rehearsal.
6. `repair` **After a Slip** · After · v_exhale w1 min60 max240 req; REPAIR w1.2 min75 max240 req; gratitude(turn-only) w0.5 min30 max90 opt(<3) · 2–9.5 min · anti-shame, the catch reframed · EVIDENCE: self-compassion after lapse predicts retry (Neff/Sirois).
7. `winddown` **Wind Down** · Night · relax w1 min90 max420 req; v_478 w1 min60 max300 req; REST(lying, uses the v6 scan) w2 min180 max1200 req; gratitude(1 pair + turn) w0.5 min45 max120 opt(<8) · 5.5–34 min · hands the body to sleep · EVIDENCE: PMR + bedtime gratitude sleep trials.
8. `deeprest` **Deep Rest** · Night/Reset · REST w3 min240 max1500 req; v_coherent w1 min60 max300 opt(<8) · 4–30 min · midday NSDR, not sleep · EVIDENCE: yoga-nidra/NSDR recovery studies.
9. `longsit` **The Long Sit** · Deeper · stretch w0.5 min45 max150 opt(<10); breathe w0.8 min60 max300 req; meditate(v2 + advanced blocks when written) w6 min480 max3600 req · 9–67 min · Morning graduates here · EVIDENCE: dose-response of practice length in beginners (Basso 2019).
10. `elevated` **Elevated Morning** · Deeper · relax w0.8 min60 max300 req; breathe w0.8 min60 max300 req; meditate(v2 scan+breath) w2 min180 max900 req; HEART w1 min90 max300 req; meditate(open awareness section) w1 min60 max600 opt(<15); INTENT-morning w1 min60 max450 req · 8–48 min · Dispenza's order: heart feeling INSIDE the sit, intention closes · EVIDENCE: Dispenza/HeartMath HRV work (hypothesis, flagged).
11. `wakeslow` **Waking Up Slow** · Morning · WAKE w0.3 min15 max30 req; stretch(seated) w1.2 min60 max240 req; v_coherent w1 min60 max240 req; mantra w0.6 min30 max150 opt(<4) · 2.5–11 min · low-energy mornings, body before anything · EVIDENCE: light movement raises alertness fastest.
12. `clearhead` **Clear Head** · Reset · CLEAR w0.3 min15 max30 req; meditate(breath section) w1 min60 max300 req; NOTE w0.4 min20 max40 req; meditate(open awareness section) w1.5 min90 max900 req · 3–21 min · rumination: the loop, named and left · EVIDENCE: noting/decentering reduces rumination.
13. `heart` **Heart Coherence** · Deeper/Reset · HEART w3 min120 max900 req; gratitude(1 pair + turn) w0.7 min45 max150 opt(<4) · 2–17 min · the 2-min reset as a trained skill · EVIDENCE: HeartMath.
14. `gratdeep` **Gratitude, the Long Way** · Deeper · gratitude(full 4 pairs) w1 min120 max300 req; GRATDEEP w1 min60 max600 req · 3–15 min · Stutz's progression in his words · EVIDENCE: Stutz raw p.211-212; Emmons specificity.
15. `shutdown` **Shutdown** · After · SHUTDOWN w0.5 min30 max60 req; v_exhale w1 min60 max240 req; relax w1 min60 max300 opt(<5); gratitude(1 pair + turn) w0.7 min45 max120 req · 2.5–12 min · end of work day, so it stops running at night · EVIDENCE: Newport shutdown ritual; Zeigarnik closure.

Existing packs (urgeWave, mind, the breathing/sleep/metta/rewire packs) stay; the menu regroups everything under Morning · Night · Reset · Before · After · Deeper. Ease-of-use law: 6 categories, one row of chips, stacks inside; the dose picker shows only presets inside the stack's floor..ceiling.

## New script blocks (copy in BLOCKS.txt, tagged `ID|tier|gap|text`)
HEART · SIGH · GROUND · ANGER · INTENT · INTENT-morning · REHEARSE · REPAIR · REST · WAKE · CLEAR · NOTE · GRATDEEP · SHUTDOWN. Openers obey the context law (what we do + why, no time quantities). Every line: one verb of instruction, simplest phrasing, two sentences max, return cues start at the moment of noticing, no intensifiers, no colons, no Headspace/Harris/HeartMath verbatim.
