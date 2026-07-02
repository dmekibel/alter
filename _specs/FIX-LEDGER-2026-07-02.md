# FIX LEDGER — David's broken-list, 2026-07-02 (v783)
*Every item from David's voice dump, tracked done-vs-pending. Additive — new asks append, nothing drops.*

## A. QUICK (this session)
- [x] A1 (v784) **Kill the whole-app background music on open.** No ambient noise when the app opens. Tool beds (pad during meditation/breath) stay — only the always-on app music goes. Default OFF via one-time migration; Sound panel toggle remains for opting back in.
- [x] A2 (v784) **"REAL" header mistranslation.** Planner's PLAN/REAL lane headers: RU shows "было" ("was") — must be the word *reality* ("РЕАЛЬНОСТЬ").

## B. RUSSIAN COMPLETENESS (one focused run — "in Russian mode, EVERYTHING is Russian, with audio, just like English")
- [ ] B1 Toolbox surface: tool card names/taglines/whys ("Sharpen the mind", "Try it · 20 seconds", etc.) — the v700+ string sweep the audit flagged; agent-translate + integrate.
- [ ] B2 medEditor section names (Arrival/Breath/Body/Awareness/Rest/Bliss/Play) + any other editor chrome.
- [ ] B3 **Meditation guides speak ENGLISH in RU mode** (Harris/Headspace/Blackstone seq lines have EN clips but no RU dict entries → vline falls through → English audio over Russian UI — worse than silence). Translate ALL spoken seq/beat/mantra/tapping/relax lines → re-run `gen-voice-ru.py` → full RU audio parity (the remaining 68 + any EN-clip-but-untranslated lines).
- [ ] B4 Rule going forward: no surface ships EN-only strings; new spoken lines = dict entry + both voice batches in the same commit.

## C. TIMELINE / PLANNER PHYSICS (the regression zone — dedicated fresh-context run, device loop with David)
- [ ] C1 **Drag-to-now:** a new block must be pullable right up to the present (currently blocked short of now).
- [ ] C2 **Drag-into-past + SPLIT + battery effect:** pulling a block across the now-line should split it at now and show the battery/fill effect on the past portion — a feature that previously existed and was lost. FIND WHEN/WHY IT DISAPPEARED (git archaeology) and restore.
- [ ] C3 **Past-lane semantics when dragged into the past** (David: "it stops being both in the plan and reality and starts being only in the plan") — clarify exact intended lane behavior with him during the run; current behavior is wrong.
- [ ] C4 **Play-on-planned:** (a) the planned block should visually ATTACH to the now-line when it starts; (b) while printing, NO outline/shadow of the block visible below the now-line — printing goes ONLY into the past (established rule, regressed); (c) doing-what-you-planned = matched = the WIDE line (both plan+reality lanes).
- [ ] C5 **Tracking overlap corruption:** starting "What are you doing right now?" while another track runs breaks the prior tracking and sprays tiny overlapping fragments into the past. Overlaps must be impossible — find the corrupting path (likely startOrSwitch/stopTimer/auto-log interplay) and fix with an invariant (no two logs overlap).
- [ ] C6 Re-run the 4-point regression contract on-device after C1-C5.

## D. TRACKER / COCKPIT / JOURNEY COHERENCE (design exists — mine the past, then build)
- [ ] D1 **Archaeology (David's explicit ask):** search past session transcripts + memory for the tracker "decision matrix" design — the full nuances of track/not-track/replan/untracked-convenience and the cockpit buttons. (memory anchors: alter-tracker-design-rules, alter-cockpit-home, alter-grand-vision-bookends; search .jsonl history via scripts/memory_search.py.) Produce TRACKER-MATRIX.md synthesis BEFORE building.
- [ ] D2 **Expanded tracker (cockpit) has no settings** — restore its controls; "it's not doing its basic function."
- [ ] D3 **Journey ⟷ live tracking disconnect:** when tracking, the journey must reflect it (focal node must never ask "what are you doing right now?" mid-track). The cockpit is ALWAYS reachable in journey mode while something runs (like liveDock on the planner) with the clear decision-matrix buttons.

## E. PROTOCOL
- [x] E1 David tracks versions — never blame stale builds (memory: david-tracks-versions).

*Status log:* created 2026-07-02 after v783.
