# FIX LEDGER — David's broken-list, 2026-07-02 (v783)
*Every item from David's voice dump, tracked done-vs-pending. Additive — new asks append, nothing drops.*

## A. QUICK (this session)
- [x] A1 (v784) **Kill the whole-app background music on open.** No ambient noise when the app opens. Tool beds (pad during meditation/breath) stay — only the always-on app music goes. Default OFF via one-time migration; Sound panel toggle remains for opting back in.
- [x] A2 (v784) **"REAL" header mistranslation.** Planner's PLAN/REAL lane headers: RU shows "было" ("was") — must be the word *reality* ("РЕАЛЬНОСТЬ").

- [x] A3 (v786) **Composite-string RU misses David caught on device**: "Build a session — stack a few in a row", "Sharpen the mind — a 60-second focus game", "Try it — 20 seconds", TB_CATS (Body/Mind/Feel/Become/Lift/Yours), meditation when/why ("watching thoughts…"), drift-hint line. Root cause: dict keys must match the FULL text-node string — partial keys never fire.

## B. RUSSIAN COMPLETENESS (one focused run — "in Russian mode, EVERYTHING is Russian, with audio, just like English")
- [ ] B1 Toolbox surface: ALL TOOLS registry fields (name/when/why per ~14 tools) + any remaining chrome — agent-translate + integrate. LESSON from A3: extract FULL composed text-node strings, never fragments.
- [ ] B2 medEditor section names (Arrival/Breath/Body/Awareness/Rest/Bliss/Play) + section first-lines ("Simply let your eyes soften…") + editor chrome.
- [ ] B3 **Meditation guides speak ENGLISH in RU mode** (Harris/Headspace/Blackstone seq lines have EN clips but no RU dict entries → vline falls through → English audio over Russian UI — worse than silence). Translate ALL spoken seq/beat/mantra/tapping/relax lines → re-run `gen-voice-ru.py` → full RU audio parity (the remaining 68 + any EN-clip-but-untranslated lines).
- [ ] B4 Rule going forward: no surface ships EN-only strings; new spoken lines = dict entry + both voice batches in the same commit.
- [ ] B5 **Drift-tap ("press the ball") introduction design** (David on device): the orb-tap hint currently always shows (and was untranslated). It should be OFF/quiet at first, INTRODUCED deliberately once (a short explainer: what it is, why noticing is the win), easy to toggle on/off. Ties into §10c beginner rescue.

## C. TIMELINE / PLANNER PHYSICS (the regression zone — dedicated fresh-context run, device loop with David)
- [ ] C1 **Drag-to-now:** a new block must be pullable right up to the present (currently blocked short of now).
- [ ] C2 **Drag-into-past + SPLIT + battery effect:** pulling a block across the now-line should split it at now and show the battery/fill effect on the past portion — a feature that previously existed and was lost. FIND WHEN/WHY IT DISAPPEARED (git archaeology) and restore.
- [ ] C3 **Past-lane semantics when dragged into the past** (David: "it stops being both in the plan and reality and starts being only in the plan") — clarify exact intended lane behavior with him during the run; current behavior is wrong.
- [ ] C4 **Play-on-planned:** (a) the planned block should visually ATTACH to the now-line when it starts; (b) while printing, NO outline/shadow of the block visible below the now-line — printing goes ONLY into the past (established rule, regressed); (c) doing-what-you-planned = matched = the WIDE line (both plan+reality lanes).
- [ ] C5 **Tracking overlap corruption:** starting "What are you doing right now?" while another track runs breaks the prior tracking and sprays tiny overlapping fragments into the past. Overlaps must be impossible — find the corrupting path (likely startOrSwitch/stopTimer/auto-log interplay) and fix with an invariant (no two logs overlap).
- [ ] C6 Re-run the 4-point regression contract on-device after C1-C5.
- [ ] C7 **Track→plan fusion (NEW, David on device v785):** while tracking with nothing planned, one EASY tap — "I'll keep doing this for 10 more minutes" — instantly creates a plan block forward from now; reality and plan CONNECT into one linked thing (the matched/wide rendering). "The second you decide how long, it becomes a plan. Instantly." (The timer .commit field from v774 is the seed of this.)
- [ ] C8 **The track-now picker is broken/ugly (v785, re-confirmed):** navTrack/journey-now open a menu David "never designed" — not the bento; **contains EMOJIS (hard-rule violation)**. Replace nowSheet's picker with the bento (or restyle to match: Tabler icons only, proper cards).
- [ ] C9 **Tracked-block visuals at start (v785, re-confirmed + detail):** (a) block still PEEKS below the now-line when tracking starts; (b) the elapsed timer renders inside the block while it's still too small → overlapping illegible lines. Timer text must appear only once the block has room (or live outside it).
- [ ] C10 **Clean switch, everywhere (extends C5):** starting anything new while tracking (incl. guided flows the app itself offers — reflection, plan-tomorrow) must VISIBLY stop the old track and start the new; past timeline shows clean sequential blocks — one ends, the next begins.

## D. TRACKER / COCKPIT / JOURNEY COHERENCE (design exists — mine the past, then build)
- [ ] D1 **Archaeology (David's explicit ask):** search past session transcripts + memory for the tracker "decision matrix" design — the full nuances of track/not-track/replan/untracked-convenience and the cockpit buttons. (memory anchors: alter-tracker-design-rules, alter-cockpit-home, alter-grand-vision-bookends; search .jsonl history via scripts/memory_search.py.) Produce TRACKER-MATRIX.md synthesis BEFORE building.
- [ ] D2 **Expanded tracker (cockpit) has no settings + NO PAUSE (v785, re-confirmed):** the slide-up is confusing and there's no pause button anywhere. Restore controls; pause is table-stakes.
- [ ] D3 **Journey ⟷ live tracking disconnect (v785, re-confirmed + detail):** when tracking, the journey's now-node must BE answered (show the live activity + cockpit), never re-ask; selecting an activity in the journey's now-menu while already tracking currently does NOTHING visible (broken). The cockpit is ALWAYS reachable in journey mode while something runs (like liveDock on the planner) with the decision-matrix buttons.

## PRIORITY ORDER (DAVID, 2026-07-02 device session): "figure out the very first step of the journey and for it to work correctly and for it to track correctly what you're doing — THEN the rest of the journey and the onboarding."
**→ THE TRACKING CORE RUN comes first: C8 (picker) + C9 (block visuals) + C5/C10 (clean switch, no overlaps) + C7 (track→plan fusion) + C1 (drag-to-now) + D2 (cockpit pause/controls) + D3 (journey knows you're tracking) — driven by TRACKER-MATRIX.md. Then B (total Russian). Then the rest of C, then the superfood cluster.**

## E. PROTOCOL
- [x] E1 David tracks versions — never blame stale builds (memory: david-tracks-versions).

*Status log:* created 2026-07-02 after v783.
