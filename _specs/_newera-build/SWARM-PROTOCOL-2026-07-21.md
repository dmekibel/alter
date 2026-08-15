# SWARM PROTOCOL — parallel waves + batch feedback (2026-07-21, Fable design; Opus executes)

**David's ruling:** stop building one-slice-per-session with a device verdict between each. Build in WAVES (parallel agents), ship once per wave, David gives BATCH feedback against a checklist. Supersedes "device verdict gates the next R" (the verdicts still happen, batched). Proven ancestor: the v572 worktree-batch pattern (memory: batch-agent-workflow).

## Seats (model routing per seat, not per session)
- **WAVE PLANNER = Fable, one pass per wave** (this doc IS wave 1's plan): partition into non-colliding parcels, write each parcel's spec + self-verify, predict conflicts. Fable does NOT run code waves (orchestration grunt work at 2x price).
- **ORCHESTRATOR/INTEGRATOR = the Opus session**: spawns parcel agents in parallel (worktree isolation), merges serially, runs gates, ships once.
- **CODE PARCEL AGENTS = Opus** (regression-adjacent parcels) or **sonnet** (mechanical sweeps). **NON-CODE AGENTS = sonnet/haiku** (copy tournaments, checklists, RU dict, research). Cap fan-out; every delegation prompt says SOLO (memory: agent-fanout-guardrail).

## The wave loop
1. Agents build in parallel, each in its OWN worktree branch (`waveN/<parcel>`), each confined to its parcel's named regions. Each parcel spec includes a SELF-VERIFY script (headless DEV-harness drive + expected outputs, like the v1174 pause proof); the agent runs it before returning. Agents return a SHORT report (what changed, verify results, files+regions touched), never full diffs.
2. Integrator merges in the fixed order written in the wave plan (riskiest region first), runs `node -c` + the parcel's verify + `bash _dev/preship.sh` after EVERY merge. A parcel that fails gates is dropped from the wave (its branch survives for repair), never patched blind.
3. ONE push per wave: N commits (one per parcel, bisectable) + one version bump. David gets fresh.html + the wave's TEST CHECKLIST (written by a cheap agent from the parcel list + regression contract; 10 min, phone).
4. David returns ONE feedback batch → the next wave leads with the fix parcels.

## Hard rules (the ones that keep waves from exploding)
- **Disjoint regions or not in the same wave.** A parcel names its @SEC regions up front; overlaps = different waves. Cross-cutting work (transition grammar, compass-rose nav) runs as a SOLO parcel in its own wave, never beside others.
- **At most ONE parcel per wave may touch S's shape**; the integrator owns any SCHEMA bump + MIG (ratchet enforces).
- **Structural/gesture parcels ship behind a kill-switch flag where cheap** (the `SANCTUARY=true` pattern) so batch testing can isolate a bad slice.
- **Every commit bisectable**; a failed-on-device slice gets reverted or flag-off'd, the wave survives.
- **DEVICE-UNTESTED stays honest**: the wave handoff lists every feel-item awaiting the batch verdict. Preview proves boot/logic/taps only.
- **Copy through both gates** (cheap models) INSIDE the wave, before integration.
- Budget: size waves so David never wakes to zero; a wave is 3-5 parcels, not 10.

---

# WAVE 1 (ready for Opus: spawn A-E in parallel, integrate A→B→C)

**Parcel A — landing contract + cockpit comeback. Opus agent, worktree. Regions: @SEC:COCKPIT (leaveHomeForPlayer ~3524, exitStage ~3832), @SEC:RENDER landing paths, the timelinePlayer close (~10484), nav handlers (~14198-14209).**
Fix: session/flow closes land where they launched; from home, land on the NEW home (grep every `leaveHomeForPlayer` caller + every `.bw-x`/finish path). Keep home alive behind the player OR re-open on close (Z-2 blocker notes in HOME-PLAYER-GRAMMAR PART 6). Old cockpit faces must not resurface on any close path.
Self-verify: headless: open home → launch a tool → finish() → assert `body.home-pane` + tf-home visible, not journey/planner; repeat from planner (must land planner); zero console errors. FLAG: `LAND_V2` boolean.

**Parcel B — drag-owns-the-DOM (the 316-324s scramble). Opus agent, worktree. Region: @SEC:TIMELINE ONLY (drag handlers ~3359-3383, calendarView drag/cascade, zoomCommit).**
Fix: while a pointer is down on a block, NO re-render of the day list may run (latch checked by the draw entry points); held block moves by transform; cascade preview = transforms on siblings; ONE `calendarView` commit on release. Kill the sibling-flicker + post-drop overlap.
Self-verify: seeded day, synthetic drag (grant it proves LOGIC only): assert no duplicate/missing titles mid-drag (DOM census per frame), post-drop order+geometry correct, wipe-count ratchet unchanged. FEEL = David's checklist. FLAG: `DRAG_V2`.

**Parcel C — broom 1. Sonnet agent, worktree. Regions: scattered SMALL, no timeline structure: the emoji activity map (~8636) → `ti` icons via the existing tiIcon path; reward-layer slots (title/next never occluded, streak owns a row, ~3767-3779 + celebrate layer); header truncation budget; dock bottom-clearance CSS (index.html); create-sheet chip edge fade (CSS).**
Self-verify: headless renders of tracking face + toolbox sheet + create sheet; assert no element-rect overlaps on title/next/streak rows; grep proves zero emoji outside the RU dict; preship clean.

**Parcel D — copy + RU. Haiku/sonnet agent, no worktree (returns text).** Gate-passed lines for: pause face ("Paused" strings), carry basin, any Parcel A/C touched strings; RU dict entries. Both gates vs COPY-ANCHORS.

**Parcel E — the batch-test checklist. Haiku agent, returns text.** 10-minute phone script: the 4 regression-contract items + per-parcel feel checks (pause, drag, landing, no-emoji sweep) + the kill-switch map (what to report if X feels wrong).

**Integration order: A → B → C** (deepest region first; C's scattered edits rebase over both). D/E fold in at integration (copy strings + checklist into the handoff). One push, one fresh link, one checklist to David.

**NOT in wave 1 (solo waves, in order after the wave-1 verdict):** transition grammar sweep (wave 2, solo: touches everything), compass rose R3 (wave 3, solo), toolbox R4 (wave 4: toolbox+builder regions parallelize internally), planner R5 battery+river (wave 5, solo, SCHEMA likely).

---

# MARATHON MODE (David 2026-07-21: "churn through everything doable, I review at my own pace")

Waves chain WITHOUT waiting for David's batch verdict. Agent completions auto-wake the orchestrator; it integrates, gates, ships, and launches the next wave in the same session. Wave 1 shipped this way already proved the loop.

## The three stop walls (the ONLY reasons the marathon pauses)
1. **A David-only decision** (a mockup pick, an offer/price call). The marathon then produces the decision artifact (rendered variants) and moves to the next non-blocked item; it stops entirely only when everything left is blocked on him.
2. **Budget guard**: David never wakes to zero. Ship what's green, write the handoff, end clean.
3. **A gate failure that survives one repair attempt**: drop the parcel (branch survives), ship the green rest, log it.

## Radical-change policy (the "won't break radically" contract, enforced)
- Structural behavior → kill-switch flag, DEFAULT ON only if instantly revertible (DRAG_V2/LAND_V2 class).
- Surface-REPLACING behavior (the compass rose killing the tab bar) → ships DARK: `NAV_V2 = false` by default; David flips one line (or dev toggle) to preview on device whenever he wants. The live app never changes radically without his flip.
- SCHEMA-touching work (the river's planned/lived log) is EXCLUDED from autonomous waves — data-shape changes only in a David-awake session.
- Every merge gate: node -c → diff review by the orchestrator → preship ratchet → preview boot + zero console errors + targeted DEV drive. Every parcel = bisectable commit. Never force-push.
- Batch-feedback debt: each wave appends to ONE consolidated checklist in the handoff; David reviews whenever; his batch becomes the fix parcels leading the next marathon.

## THE MARATHON QUEUE (as of 2026-07-21 night; specs live in REDESIGN-BUILD + DESIGN-STUDIO)
- **W2 (next): transition grammar, SOLO code parcel** (crossfades → slide-over-scrim per the create-sheet pattern + tap-sweep for menu rows; kill the 178s/285s ghost class; extend LAND_V2's landing paths, don't replace them). Flag `TRANS_V2`. + a second DISJOINT parcel: **the REAL emoji sweep** (EMOJI_KW ~5834, CATS/OCCUPATIONS `t.e` fields ~411, VIBES → ti icons; sonnet; data arrays only, no overlay code).
- **W3: compass rose shell, SOLO, DARK** (`NAV_V2=false` default): tab bar death + guardian puck + doors + vertical column per REDESIGN-BUILD R3, all inside the flag. Preview-verify both flag states boot clean.
- **W4: planner feel, safe subset** (zoom range clamp + animated re-anchor through the flow inverse + sticky labels; NO battery visuals, NO river — both David-gated).
- **W5: decision artifacts + prep**: toolbox mockup variants (rendered for David's pick), R5 battery-grammar mockup, B1 copy tournament through both gates (cheap models). No app.js edits.
- Then STOP (wall 1): everything further needs David (toolbox pick, battery pick, wave-1..4 batch verdict, NAV_V2 flip).

## Seats/effort for a marathon
Orchestrator = Opus effort HIGH (it reviews every regression-zone diff). Code parcels: Opus for cross-cutting/regression, sonnet for sweeps. Non-code: sonnet/haiku. /loop-style ScheduleWakeup only as a hang-safety heartbeat (agent completions already wake the session).
