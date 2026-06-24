# Tracker / now-line redesign — design state (2026-06-24)

Distilled so the design survives a context consolidation/fork. Raw transcript also auto-persists at
`~/.claude/projects/-Users-Dmekibel-claudeCode-alter/*.jsonl`.

## Where the build is
- **Live: v449** (https://dmekibel.github.io/alter/ , `/fresh.html`). Deploy loop unchanged (edit → `node --check app.js` → bump `app.js?v=NNN` in index.html → commit+push → poll → fresh.html).
- This session shipped through the 3-tab shell + paged day view + bento/streak/ghost polish, then v448 (now-line = live-card bottom + gutter time + discard <15s taps) and **v449 = regression fix**: paged day view was re-centering on now on EVERY rebuild (zoom/minute-tick yanked scroll) — now only re-centers on explicit open/Today; `animateHourPx` anchors to the current day-card scroll; renamed a duplicate `drawTree` that was throwing every animation frame.
- **WORKFLOW RULE (David, hard):** for DESIGN choices, show options *in chat first* (visualize widget, with `sendPrompt` "Pick X ↗" buttons — same system the `_mockups/` were made with), let David pick, THEN build. Bug fixes can just be fixed. See memory `preview-design-options-before-building`.

## THE FUNCTIONAL MATRIX (the spec David laid out — design from this)

### Past / present — 3 alignment realities (plan vs reality)
1. **Perfect match** — plan & reality coincide in time + activity → the two lanes FUSE into one full-width gold-ringed bubble, full points.
2. **Partial** — similar but subtle mismatch. **The OVERLAP is where the special points are earned** (partial credit). Render: gold-fused band for the matched span, then it SPLITS into the two lanes at the moment of divergence (plan = unfulfilled left, real = drift right). Points ∝ overlap.
3. **No match** — fully diverge. Plan ghosts (missed), reality shown honestly (drift), 0 points, no shame.
- **Core mechanic: gold = wherever plan met reality.** The plan lane only "lights up" where you actually lived it.

### Future — 3 intents, each one tap
- **A · Just track** — ignore plan, log anything, base points. Must always be frictionless.
- **B · Follow the plan** — next planned block surfaced as a 1-tap bright hero; on-plan bonus; feeds gold/streak. Staying on plan = the easiest tap.
- **C · Conscious drift** — go against plan but **re-plan the detour first**: how-long picker → detour drops in at now → rest of plan REFLOWS after it → back-on-track marker. Declared/conscious drift KEEPS the streak (distinction = declared-vs-spontaneous, not productive-vs-leisure).

### Drift overrun (drift runs past the length you set)
- Surface two one-tap choices, never a nag: **"→ back to [planned]"** OR **"keep drifting · how much longer?"** (re-reflows the rest of the day).

### Cross-cutting requirements
- **Tracking is always one ▶** — with a plan or without; never blocked.
- **Doing what you planned should feel MAGICAL** (Guitar-Hero). The now-line is an **energetic scanline** that sweeps down in real time and **burns** a plan block to success (ignites in the activity colour + spark + streak tick) when your real activity matches it.
- **REAL/tracker lane is BLANK in the future** — nothing tracked is ever below the now-line; only PLAN continues below. (David's key correction.)
- **The scanline/now-line should be tied to the tracker** — experiment with a **thick now-line band you write the live activity inside** (time · activity · elapsed). The line = the present.

## DESIGN OPTIONS EXPLORED (and current leanings — NOT yet locked)

### Running timer / now-band  (David: still iterating)
Options shown (R1–R6): R1 thick now-band with text inside (activity colour) · R2 real bubble filling down to the line · R3 capsule on the line · R4 split band `on-plan | doing` · R5 progress-fill band (most "scanline") · R6 thin line + right-edge tab.
- Claude lean: **R5** (progress band, energetic) or **R1**; **R4** is clever (shows plan-vs-real at the present). **No pick locked.**
- Hard constraints carried in: NO ugly pink stop square (stop via tap or a clean ⏹), no thin light-blue sliver, real lane blank below now.

### Tiny / short tracked bubbles  (must be full lane-WIDTH thin LINES, not dots; just short in height)
Shown in full context (mix of tall + 1–2 min bars, both lanes). Options: L1 caption above the line · **L2 one-line min height (Claude pick — always legible, never collides)** · L3 title in the gutter (too cramped, worst) · L4 tap-to-expand into a full card.
- Lean: **L2 + tap-to-expand (L4) for editing.** Not locked.

### Easy delete / resize (app is small, tiny ✕ hard to hit)
E1 tap → big action bar (Edit · Length · Switch · Delete) · E2 swipe (left delete / right extend) · E3 duration chips (tap a length, no grip dragging). Not locked.

### Past-alignment rendering
Perfect = fused gold · Partial = gold-overlap-then-split (the novel one) · No-match = ghost vs drift. Not locked.

### Future-intent UI
A just-track (picker, plan waits) · B follow-plan (1-tap hero) · C conscious-drift (how-long chips + back-on-track marker + reflow). Not locked.

## OPEN DECISIONS (pick next)
1. Running timer: R1–R6 → pick one (+ how the on-plan "burn" animates).
2. Tiny bubble: confirm L2 (+ L4 expand).
3. Delete/resize: E1 / E2 / E3 (or combo).
4. Past-alignment visuals: confirm the gold-overlap mechanic + how partial split looks.
5. Future-intent flows: confirm A/B/C designs.
6. Drift-overrun fork wording/placement.
7. Still wanted earlier but not built: the header zoom **slider** (under day/week/month), and a per-pinned-item **size picker** in the bento.

## To continue
Re-read this file + `DESIGN-BRIEF.md` (esp. §13/§14/§23/§24) + `HANDOFF.md`. Continue the options-first design loop on the now-line/timer + the matrix; build only what David has picked. Restore point if needed: `git checkout night-backup-v420 -- app.js index.html`.
