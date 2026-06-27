# SPEC — AI brain & self-help stack

Cluster slug: `ai-brain-selfhelp`. Source: GRAND-AUDIT-2026-06-26.md — "Coaching / reminders / notifications / AI-guidance" (PARTIAL §742, DROPPED §176) + "Tracking" + "Vision/philosophy" §329.

Build-agent: this is one ~3000-line file (`app.js`) + `index.html` (shell + all CSS). You edit ONLY those two + `manifest.json`. `server.js` is generated. Ship with `bash _dev/preship.sh` then commit/push. Current build tag: `app.js?v=572`. `SCHEMA = 1` (app.js:75).

## LOCKED design rules (honor in every feature)
- Deep berry/wine palette + DOM domain colors (`DOM` app.js:249: move=orange `#ff8a3a`, nourish=green `#34d39a`, focus=blue `#36b3f0`, create=purple `#b07aff`, connect=pink `#ff5fa0`, play=gold `#d99f30`, restore=teal `#2ab8c4`, upkeep=slate `#7f9bc4`, drift=slate-mauve `#4a3d54`).
- NO neon / glow / shine / white surfaces. The pink **now-line is the brightest thing on screen**.
- One activity at a time. Reward-never-shame. Full-screen, low-clutter.
- **Timeline render is FRAGILE** (rebuilt 3×). None of these features touch `buildPull`/`calendarView`/`attachInfinite` — keep it that way. Any feature that does is HIGH RISK and must be flagged DEVICE-UNTESTED.
- Reuse helpers: `add()`, `el()`, `DOM`, `mixHex`/`mixDark`, `esc`, `fmt`, `dur`, `hm`, `pad`, `uid`, `blocks()`, `logs()`, `save()`, `earn()`, `toast()`, `domainOf()`, `nextFreeMin()`, `reflow()`, `doneMap()`. Guided-overlay helpers: `TTS`, `say()`, `VPROF`, `addVoiceToggle()`, the `#breatheOv` overlay pattern.

## What exists today (ground truth)
- **AI brain (BYO-key, works):** `brainCfg()` 3071 (reads/migrates `S.brain`), `askBrain(prompt, cb)` 3072 (fetches OpenRouter/Groq/Gemini), `brainContext()` 3092 (builds the thin prompt), `brainSheet()` 3096 (settings UI: engine chips, key, model select, test). Entry points: notebook menu item 618, You-tab button 1942, world cabin 1841, gear 3228, and "🧠 ask my brain what's best" in `suggestSheet` 2920.
- **Guided modules (all `#breatheOv` overlays, all self-log + earn on finish):** `breathwork(cycles, onDone)` 2021, `relaxMoment(onDone)` 2060, `meditation()` 2083 (4 guides, 2/5/10min, freq often/some/spacious), `tapping()` 2130 (EFT 8-point), `mantraPlayer()` 2183 (24-line teleprompter), `gratefulFlow(onDone)` 2944. Launched individually from `microTap` 2001 (quick-action chips, `MICRO` 1990 / `MICROPHASE` 1999).
- **Composable stack — but for DAY ACTIVITIES not modules:** `presetsSheet(k)` 538, `stackDetail(stack,k,custom)` 508, `applyDayPreset(k,arr)` 505, `DAY_PRESETS` 499. These build/apply day presets onto the timeline. The bubble-builder UI David wants for modules does NOT exist.
- **Proactive engine:** `proactive()` 1381 (phase-based hero copy + chips, on the Today hero, called from `renderHero` 1910), `schedule(k)` 1373 (over-budget detection → bumps low-prio), live-tracker state machine `renderTrackerFull` ~1119 / `renderTFControls(state)` 1154 (onplan/off/idle/break/claim/night). Drift: `ldDrift` 998, off-plan replan `tfReplan` 1144.
- **Design doc already exists:** `SELF-HELP-STACK.md` (David's verified canonical stack: Move→Breathwork→Cold(opt)→Meditation→Tapping→Love-med→Self-hypnosis→Mantra-song; + 5-step variant; "composable bubbles, each opens with relaxMoment ARRIVAL"). `meditation-scripts/` holds the 4 guide transcripts + mantra text.

---

## FEATURE 1 — Composable self-help stack with per-section durations (bubble UI)

**(1) Ask** (audit §744, 🟦 BIG): "app should offer the full self help stack...u first kick what u want in ur stack and how many minutes so like : breathing 5 minutes then meditation 10 minutes similar to the daily planner mode with bubbles".

**(2) Buildable?** YES. All the runnable modules already exist (`breathwork`, `relaxMoment`, `meditation`, `tapping`, `mantraPlayer`, `gratefulFlow`). What's missing is (a) a composer to queue modules + minutes, and (b) a runner that chains them. The verified module list + order live in `SELF-HELP-STACK.md`.

**(3) APPROACH**
Add three things:

a. **A module registry** (new const near the guided modules, ~app.js:1989, by `MICRO`):
```js
var SH_MODULES = [
  { k:"relax",  e:"🧘", l:"Arrive",     dom:"restore", run:relaxMoment },   // Psycho-Cyb opener
  { k:"breath", e:"🌬️", l:"Breathwork", dom:"restore", run:function(cb){ breathwork(4, cb); } },
  { k:"med",    e:"🧘", l:"Meditation", dom:"connect", run:meditation },     // see note: needs onDone (Feature 1b)
  { k:"tap",    e:"👆", l:"Tapping",    dom:"connect", run:tapping },        // needs onDone
  { k:"mantra", e:"🗣️", l:"Mantra",    dom:"connect", run:mantraPlayer },   // needs onDone
  { k:"grat",   e:"🙏", l:"Gratitude",  dom:"connect", run:gratefulFlow }
];
```
Use `dom` to color bubbles from `DOM[dom].c` (locked palette, no new colors).

b. **`meditation()` / `tapping()` / `mantraPlayer()` must accept an `onDone` callback** so the runner can chain. Today only `breathwork`/`relaxMoment`/`gratefulFlow` take `onDone`. Edit each module's `finish(false)`/completion `setTimeout` to call `onDone && onDone()` after the existing log+earn (mirror the `breathwork` pattern at app.js:2037). For `meditation()`, the per-section minutes from the stack should override the in-module duration picker — pass a `mins` arg (`meditation(mins, onDone)`) and when present, skip the `build()` config screen and go straight to `run()` with `cfg.mins = mins`. Same idea for any module that has a duration (only meditation does; breathwork is cycle-based — map "5 min" → ~cycles, or just run fixed and let the section minutes be a soft target shown in the runner header).

c. **`stackComposerSheet()`** — a new sheet (model it on `presetsSheet`/`stackDetail` 508-551, reuse `.goal-*` / `.bento-*` classes and the `bento-ov`/`bento-card` overlay). Flow:
  - Header "🧘 Self-help stack — build your ritual".
  - Row of tappable module **bubbles** (one per `SH_MODULES`, colored by `DOM[m.dom].c`, deep jewel fill + subtle stripe via `tfStripe()` 1058 if you want texture). Tap a bubble → it appends `{k, mins}` to the working stack with a default minute value.
  - Below: the **chained list** (the "queue") — each row shows emoji + label + a minute stepper (reuse the `durationSheet` 401 chips `[2,5,10,...]` or inline +/− ), drag-to-reorder (optional, M effort; tap-to-remove is enough for v1), and total time at the bottom.
  - Two saved presets seeded from `SELF-HELP-STACK.md`: **"Full stack"** (relax→breath→med→tap→mantra) and **"5-min reset"** (relax→breath→grat→mantra). Store user stacks in `S.shStacks` (see DATA).
  - Primary button "▶ Begin stack" → calls `runStack(stack)`.

d. **`runStack(stack)`** — the chained runner. Walk the queue index-by-index, calling each `SH_MODULES[k].run(mins, next)` where `next` advances to the next module. Each module already logs itself + earns Spark on finish, so the runner just sequences. On the final module's `onDone`, show a brief "stack complete ✓" toast and `renderAll()`. Each module already opens cleanly as a full-screen `#breatheOv`; the runner just re-invokes the next after the prior overlay removes itself.

**(4) CODE POINTERS**
- New: `SH_MODULES` const ~1989; `stackComposerSheet()` + `runStack()` near the guided modules (after `gratefulFlow`, ~2974) or near `presetsSheet` (~552).
- Edit: `meditation()` 2083 (add `mins`/`onDone` args + skip-config path), `tapping()` 2130 (add `onDone` to the finish `setTimeout` 2164), `mantraPlayer()` 2183 (add `onDone` to `finish` 2192 — already has it for skip; just call after the non-skip log path 2196).
- Entry point: add a "🧘 Self-help stack" item to the notebook menu `items` array app.js:611-621 (between "Habit stacks" 615 and "Goals" 616), icon `ti-heart-handshake` or `ti-yoga`, and/or to the You-tab buttons near 1942.

**(5) UI** (text sketch, locked palette)
```
┌──────────────────────────────┐  ← bento-card on bento-ov (deep berry)
│ 🧘 Self-help stack        [x] │
│ build your ritual — tap to add│
│                               │
│ presets:  [Full stack] [5-min]│  ← preset-row pills
│                               │
│ add a module:                 │
│  ⬤🧘Arrive ⬤🌬️Breath ⬤🧘Med   │  ← bubbles, DOM-colored deep fills
│  ⬤👆Tap   ⬤🗣️Mantra ⬤🙏Grat   │
│                               │
│ your stack:                   │
│  🌬️ Breathwork   [− 5m +]  ✕  │  ← chained queue rows
│  🧘 Meditation   [− 10m +]  ✕ │
│  🗣️ Mantra        (~3m)     ✕ │
│  ─────────────  total ~18m    │
│                               │
│        [ ▶ Begin stack ]      │  ← .goal-breakdown / done2 button
└──────────────────────────────┘
```
Runner: reuses the existing `#breatheOv` full-screen overlays back-to-back; optionally show a tiny "2 / 4" step counter in the corner.

**(6) DATA + migration**
```js
S.shStacks  // [] of { name, mods:[{k:"breath",mins:5},{k:"med",mins:10}] }
```
In `load()` app.js:1279, add: `S.shStacks = S.shStacks || [];` (additive, no SCHEMA bump needed since it's a new optional array with a safe default — matches how `S.acts`, `S.presets` were added). If you also want to persist a "last run" or default stack, add `S.shLast = S.shLast || null;` same line.

**(7) REGION** Guided-modules block (app.js ~1989-2209) + a new sheet near presets (~538). Touches `load()` 1279 (one line) and the notebook `items` array 611. Does NOT touch the timeline render. Low conflict risk except with any other agent editing `load()` or the notebook menu — coordinate those two single-line edits.

**(8) EFFORT** M. (Modules exist; work is the composer UI + chaining + the 3 `onDone` edits.)

**(9) RISKS / regression**
- The `onDone` edits to `meditation`/`tapping`/`mantra` must not break their standalone `microTap` launches (they call with no args today). Guard: `onDone && onDone()`, and default `mins` to the existing in-module default when undefined.
- TTS chaining: each module calls `TTS.unlock()` inside its own gesture tick. After the first user tap that starts the stack, subsequent auto-advanced modules run without a fresh gesture — iOS may suppress speech on later modules. MITIGATION: call `TTS.unlock()` once at "Begin stack" tap; if later modules go silent on device, that's expected iOS behavior — label DEVICE-UNTESTED for voice continuity across chained modules. The visual/orb path works regardless.
- Keep bubble fills DEEP (no neon). Use `DOM[dom].c` + `mixDark()`, never raw bright colors.

---

## FEATURE 2 — Smarter, more intelligent AI brain (not oversimplified)

**(1) Ask** (audit §749, 🟦 BIG): "the brain feels oversimplified, not intelligent enough". (David deferred — "we'll get back to it later" — so ship the concrete upgrade, don't over-scope.)

**(2) Buildable?** PARTIAL → concrete version: the engine (`askBrain`) is solid. The oversimplification is 100% in `brainContext()` 3092 — a thin one-shot prompt with no KB, no framework, no memory, no role discipline. Upgrade = a richer, structured prompt + a small embedded wisdom KB + light memory, all client-side, no new API.

**(3) APPROACH** — three layers, all in/around `brainContext()`:

a. **System/role layer (the "Brian Johnson + Withers" coach voice).** Replace the one-line role with a structured persona block embedded as a JS const (`COACH_SYSTEM`): warm no-shame coach, fundamentals-first (move/sleep/eat/breathe is the base — from `SELF-HELP-STACK.md` framing), virtue/areté lens (Johnson) + energy/alignment lens (Withers), always end with ONE concrete next action, never lists, never shame. This is hand-authored Johnson/Withers-flavored copy (the audit notes NO actual fieldguide KB is in the app — keep it that way; embed a compact distilled wisdom set, not a copy of the fieldguide repo).

b. **Rich context layer.** Expand `brainContext()` to include (all already in `S`):
   - now + phase (`fmt(nowMin())`, `phase()`), wake/bed frame (`S.profile.wake/.sleep`).
   - today's plan with status (use `blockStatus`/`schedule` — note over-budget from `schedule(k).over`/`.bumped`).
   - undone habits + streaks (`undone()`, `streak(id)`), recent drift (`renderPulls` logic 1949 — vice minutes/wk).
   - virtue state (`virtues()` → top class `VCLASS`, levels) — who they're being.
   - goals (`S.profile.goals`), occupation (`S.profile.occ`).
   - current live-tracker state if active (on-plan / off-plan / drifting).

c. **Light memory layer.** Persist the last few brain exchanges so it's not amnesiac: `S.brainLog` (rolling, cap ~10 `{t, q, a}`). Inject the last 2-3 into the prompt as "recent context". Optionally a tiny "what the coach should remember about me" field the user can edit in `brainSheet` (`S.brain.notes`) — appended to every prompt.

d. **Structured ask, multiple modes.** Today there's one prompt ("single best next thing"). Add a small set of intents the caller passes: `brainContext(mode)` where mode ∈ `"next"` (default), `"plan"` (frame my day), `"stuck"` (I'm drifting — get me back), `"reflect"` (end-of-day). Each mode appends a tailored instruction to the shared system+context. This makes the brain feel intelligent across situations, not one canned answer.

Keep output discipline: "2-3 short sentences, one concrete action, kind, no lists" stays — that's the locked low-clutter voice.

**(4) CODE POINTERS**
- Rewrite `brainContext()` app.js:3092 → `brainContext(mode)`; add `COACH_SYSTEM` const + helper `brainGatherState()` just above it.
- `askBrain(prompt, cb)` 3072 — no change needed; optionally accept a `messages` array instead of a single prompt so the system role is a real `system` message (OpenRouter/Groq use `messages`; Gemini uses `contents` — pass system as a `systemInstruction` for Gemini, or prepend to the user text). Cleaner: keep one big prompt string for portability across all 3 engines (simplest, lowest risk).
- Callers to update to pass mode: `suggestSheet` 2920 (`brainContext("next")`), and new buttons (see UI).
- `brainSheet()` 3096 — add the optional "remember about me" textarea (`S.brain.notes`).
- Memory write: in `askBrain`'s success path, or better, wrap calls so the caller pushes `{t:Date.now(), q, a}` to `S.brainLog` (cap 10) + `save()`.

**(5) UI** (locked palette — mostly invisible; it's prompt quality)
- `brainSheet` gains: a small "what should I remember about you?" multiline input below the engine config (deep berry input, same style as the key field 3106).
- `suggestSheet` already has "🧠 ask my brain what's best" 2920 — keep. Optionally add mode chips under it: `[next] [frame my day] [I'm stuck] [reflect]` (pchips, DOM-neutral), each fires `askBrain(brainContext(mode), …)`.
- The proactive hero (Feature 3) can surface a brain line when a key is configured.

**(6) DATA + migration**
```js
S.brain.notes  // "" user free-text the coach should remember
S.brainLog     // [] rolling {t,q,a}, cap 10
```
In `brainCfg()` 3071 add: `if (S.brain.notes == null) S.brain.notes = "";`. In `load()` 1279 add: `S.brainLog = S.brainLog || [];`. Additive, no SCHEMA bump.

**(7) REGION** Brain block (app.js 3071-3128) + `suggestSheet` 2916. Touches `load()` 1279 (one line). Self-contained; no timeline. Low conflict risk (coordinate the `load()` line + notebook menu with Feature 1/3 agents).

**(8) EFFORT** M. (Engine done; the work is prompt engineering + state gather + the memory plumbing + the notes UI.)

**(9) RISKS / regression**
- Prompt length: free models (3B/8B) have small context. Don't dump all 30 days — summarize (counts, top 3, streaks). Keep the gathered state compact.
- Don't break the "off" / no-key path: every call site already guards `brainCfg().engine !== "off" && brainCfg().key` (e.g. 2920). Preserve that — the app must remain fully functional with NO brain (this is the locked "app genius without AI; AI is a thin lubricating layer" vision, audit §791).
- Reward-never-shame: the `COACH_SYSTEM` copy must forbid scolding about missed habits/drift. Frame everything as "next move," never "you failed."
- No new neon UI. The brain stays text in existing sheets.

---

## FEATURE 3 — Proactive engine: "adapt as you follow or stray; always offer to get back to plan"

**(1) Ask** (audit §183 DROPPED "Over-drift fork", §331 VISION "personal coach", §332): "the app offers u to either switch to the task u planned or keep drifting but again replan how long to drift and then adjust full plan around that drift" + "be my personal Brian Johnson and Brian Withers... coaching me."

**(2) Buildable?** PARTIAL → concrete: a real proactive engine partly exists (`proactive()` 1381 hero + `schedule()` 1373 over-budget bumping + live-tracker states). The missing piece is the **over-drift fork**: detect when drift/off-plan runs long, then offer a 2-way fork — (A) switch back to the planned task, or (B) keep drifting but pick how long, and reflow the rest of the day around that drift.

**(3) APPROACH**
Three concrete additions:

a. **Drift-overrun detection (the trigger).** When the live tracker is in `off`/`drift` state (`renderTrackerFull` 1119, `S0.drift` / not `onplan`), compute elapsed-on-drift. When it crosses a threshold (e.g. 20-25 min, or past the end of the planned block it's eating into — you already compute `S0.block` end at 1126), surface the fork. The cleanest hook: in `renderTFControls` 1154, when `state==="off"` AND elapsed-drift > threshold, swap the generic Replan/Switch/Stop row for the **fork**.

b. **The fork UI** (in the live tracker controls, reuse `tf-b` buttons 1155):
   - Primary: **"↩ Back to plan"** → `tfSwitchTo` the next planned block (`nextUpBlock` 1059 / `nextPlannedBlock`), i.e. stop the drift timer and start the planned task. (This is the "switch to the task u planned" half — wire to existing `startPlanned`.)
   - Secondary: **"🌫️ Keep drifting — how long?"** → opens `durationSheet("Drift", …)` (401). On pick `mins`: extend the drift as an intentional, named, time-boxed block, then **reflow the rest of the day around it** — push the still-future planned blocks forward by the drift overrun. Reuse `reflow(k)` 2881 after inserting/extending; `schedule(k)` 1373 already handles over-budget bumping, so after reflow, if `schedule(k).over > 0`, let the proactive hero report the bump (it already does, 1383).

c. **Proactive adaptation messaging.** Extend `proactive()` 1381 to read live-tracker drift state and, when mid-drift, set the hero to a gentle "still off-plan — want back in?" with a "↩ Back to plan" primary (calls the same back-to-plan path). This makes the offer appear on the Today hero too, not only in the tracker. Keep it kind (reward-never-shame): "drift is data, not failure — here's the on-ramp."

Optionally (if brain configured, ties to Feature 2): the "I'm stuck" mode line can be surfaced here via `askBrain(brainContext("stuck"), …)`.

**(4) CODE POINTERS**
- `renderTFControls(state)` 1154 — add the fork branch for `state==="off"` when over threshold. You need elapsed-drift: compute from the active timer `t.start` (see 1128 `elMin`). Pass a flag from `renderTrackerFull` 1119 (it already has `drift`, `S0.block`, `elMin`) into controls, or recompute in controls.
- Back-to-plan: reuse `startPlanned(block)` (called at 1162) + `nextPlannedBlock(todayK())` / `nextUpBlock` 1059.
- Keep-drifting-replan: `durationSheet` 401 → on pick, insert/extend a `drift` block (`DOM.drift.c`), `reflow(k)` 2881, `schedule(k)` 1373, `save()`, `renderToday()`, `renderTrackerFull()`. Pattern to copy: `planBreak` 379 (it already does pick-activity → pick-minutes → owns now→future via durationSheet).
- `proactive()` 1381 — add a drift-aware branch near the top (after the `sc.bumped` check 1383): if a drift timer is active and over threshold, return a "back to plan" hero.
- Drift entry today: `ldDrift` 998 (unnamed drift) and off-plan `tfReplan` 1144 — the fork complements these, doesn't replace them.

**(5) UI** (locked palette — pink now-line stays brightest; drift = slate-mauve `DOM.drift`)
Live-tracker controls when over-drift:
```
   drifting · 24m off plan
 ┌──────────────────────────┐
 │   [ ↩ Back to plan ]      │  ← tf-done primary (DOM.focus/green accent)
 │ [🌫️ Keep drifting +how long] [⏹ Stop] │  ← tf-b row, drift = slate-mauve
 └──────────────────────────┘
```
"Keep drifting" → `durationSheet` chips `[15m 30m 45m 1h …]` → drift block lands on the timeline, future blocks shift, hero may say "I bumped 1 low-priority slot so what matters survives" (existing `schedule` copy).
Hero (Today) mid-drift: kicker "off-plan", line "Still drifting — want back in?", sub "drift is data, not failure", primary "↩ Back to plan".

**(6) DATA + migration**
No new persistent shape required (drift becomes a normal block/log via existing paths). If you want a tunable threshold: `S.driftFork = S.driftFork || { afterMin: 20 };` in `load()` 1279 (optional). Otherwise hardcode ~20-25 min. No SCHEMA bump.

**(7) REGION** Live-tracker controls (`renderTFControls` 1154, `renderTrackerFull` 1119) + `proactive()` 1381. **CAUTION:** these are NOT the timeline render, but the live tracker reads/writes blocks via `reflow`/`schedule` — the "reflow the day around the drift" step must NOT cross the now-line into the past (regression contract rule 2: "future can't cross the now-line into the past"). Use the existing `reflow(k)` which already pins started/past blocks (2888 guard). MODERATE conflict risk with any agent touching the live tracker.

**(8) EFFORT** M (fork + back-to-plan + reflow). Could be L if drag-reorder of the reflowed day is added — don't; reuse `reflow`.

**(9) RISKS / regression**
- **Reflow safety (HIGH):** "adjust full plan around the drift" must reuse `reflow(k)` 2881, which already fixes started/past blocks in place (app.js:2888 `already STARTED today → fixed in place`). Do NOT write a new reflow — that's how the timeline broke 3×. Confirm regression contract rule 2 holds after the drift reflow.
- Don't run two day-nav models — irrelevant here (no timeline-scroll change) but don't add any scroll/recenter side-effects.
- Threshold tuning is device-feel: the "when does the fork appear" timing is gesture/real-use dependent → label DEVICE-UNTESTED for the exact trigger timing; the logic boots clean in preview.
- Reward-never-shame: the fork copy must never scold ("you've wasted 24 min"). Use "drift is data" / "want back in?" framing only.
- Keep one-activity-at-a-time: "Back to plan" must stop the drift timer before starting the planned one (`activeTimers().forEach(stopTimer)` — see `tfSwitchTo` 1067 / `ldDrift` 998 patterns).

---

## Cross-feature notes for parallel build-agents
- **Shared edit hotspots:** `load()` app.js:1279 (Features 1, 2, maybe 3 each add one line — merge carefully) and the notebook `items` array app.js:611 (Features 1 + brain entry). Sequence these or hand-merge.
- **No SCHEMA bump** needed for any feature — all additions are optional fields with safe `|| default` guards (matches existing `S.acts`/`S.presets` precedent). Do NOT bump `SCHEMA` (app.js:75) unless you change an EXISTING field's shape — that would wipe David's real data.
- **Ship:** `bash _dev/preship.sh` (auto-bumps `app.js?v=`, regenerates `server.js`), then commit + push + hand David the `/fresh.html` link. Preview proves boot/render/non-gesture taps only — gesture/voice-continuity feel is DEVICE-UNTESTED.
- **Source-of-truth doc:** `SELF-HELP-STACK.md` is the canonical module list + order for Feature 1 — do not reinvent David's stack.
