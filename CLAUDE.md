# ALTER — dev constitution

A guardian-angel life-sim PWA (pixel-art planner + tracker + game). Single user: David. iPhone, installed to home screen. Vision lives in `AUDIT.md`; current state in the **newest** `TRACKER-HANDOFF-*.md`. **This file is the rules. Read it first, every session — it exists so you don't re-derive them from 30KB of handoffs and re-break the same things.**

## Writing copy (HARD RULE)
Before writing ANY user-facing line (tool cards, pools, onboarding, journey, toasts, lessons), load `_specs/SCRIPT-ENGINE.md` and run its procedure. It is the capstone: it orchestrates `_specs/VOICE-BIBLE.md` (register + craft devices) and `_specs/WRITING-SYSTEM.md` (anti-AI gate), grounded in David's own `fieldguide/.../WRITING-CRAFT.md` + `balance/.../AI-TELL-DETECTOR.md`, and adds the thesis every line must carry, the teaching method, and the adaptive axes.

**No line reaches David until it passes BOTH automatic gates (the author never self-approves, that is why the docs alone failed):**
1. **Gate 1, deterministic:** `python3 _dev/copy-audit.py "the line"` (or `--file lines.txt`) must pass clean. Add any new slipped-through pattern to it.
2. **Gate 2, adversarial judge:** spawn a FRESH cheap-model agent that FIRST reads `_specs/COPY-ANCHORS.md` (David's rated KILLED/EPIC lines) and scores each candidate BY COMPARISON to those anchors, then kills anything resembling a KILLED pattern (forced analogy, tease, flourish-ending, stiff cadence, meditation-madness, vague pronoun, generic-category beat, shallow, cheesy). An abstract rubric alone fails: the LLM judge shares the writer's biases. **Append every line David rejects to COPY-ANCHORS.md** as a KILLED anchor with its pattern. Prompt template in SCRIPT-ENGINE "THE AUDIT".

---

## Source of truth — edit ONLY these
- **`index.html`** — shell, all CSS, the `<script src="app.js?v=NNN">` tag.
- **`app.js`** — the whole app (one file, ~11,200 lines). **Navigate by grep anchors, never by line number** (line numbers rot as the file grows): the `@MAP` header at the top lists every `@SEC:` section; `grep -n "@SEC:<name> — " app.js` jumps to a section, `grep -n "@CONTRACT" app.js` lists the invariants at their edit sites.
- **`manifest.json`** — PWA manifest.
- **`server.js` is GENERATED** — a 176KB Cloudflare artifact built from the three above by `build-hf-server.js`. **Never hand-edit it.** `_dev/preship.sh` regenerates it on every ship so it can't go stale.

## How David works (this is why things got rejected — honor it)
- **Ship-and-test on his phone.** When he says "ship": run `bash _dev/preship.sh`, commit, push, hand him the `/fresh.html` link (cache-bust — he hits Pages deploy-lag constantly). Don't ask permission to ship.
- **Less ceremony.** "Faster" = build → verify → ship, fewer check-in questions. Take charge, end with one move.
- **Design choices = options-first** (show 2–3 in chat, he picks, then build). **Bug fixes = just fix.**
- **Build in the REAL app, never mockups.** Every off-palette mockup got rejected. Palette is locked in `index.html` `:root` (pink/blue/purple/yellow on the sky→lilac→pink gradient).
- **Don't burn the whole token budget** — pace so he doesn't wake to zero.

## The ONE ship command
```bash
bash _dev/preship.sh        # syntax-checks app.js, runs structure ratchets (_dev/ratchet.js), auto-bumps app.js?v=, regenerates server.js, prints the fresh.html link
```
Then `git add -A && git commit && git push`. This replaces the hand-ritual that caused most "it's broken" reports (a forgotten version bump = David sees a cached old build).

---

## Verification truth — DO NOT LIE ABOUT THIS
**Synthetic touch events in the preview LIE about gestures.** `touch-action`, native momentum scroll, pan-y arbitration, and `requestAnimationFrame` recenters do NOT behave in the headless preview the way they do on David's iPhone. So:
- The preview proves: the app **boots**, no JS console errors, layout renders, non-gesture taps work. Use it for that (`preview_*`, launch.json `alter`, port 8123, mobile preset, 🧪 test-day button).
- The preview does **NOT** prove: swipe, drag, pinch, scroll-wall, infinite-recenter feel correct. **Never write "verified" for those.** Say plainly: *"boots clean in preview; gesture feel is device-untested — confirm on your phone."* That honesty is what stops the build→ship→break→revert loop.

## Regression contract — these broke repeatedly; re-check every ship
The core navigation has been rebuilt 3× (v488 continuous → v496 day-at-a-time → v501 continuous). Before shipping anything that touches the timeline, confirm ALL still hold — and never run two day-nav models at once (the v488 infinite-watcher vs a horizontal pager *fight* → bounce):
1. Vertical scroll flows into prev/next day continuously — no cut at midnight, no snap-back bounce.
2. Started/past blocks are set-in-stone; future can't cross the now-line into the past.
3. Tap-empty-slot creates a block there; drag moves/resizes; tap-bubble opens the editor.
4. The week-strip + Today/Now pill track the centered day.
If a change can't be device-confirmed this session, label it **DEVICE-UNTESTED** in the handoff — don't mark it done.

## Architecture landmines (known debt — don't widen it)
- **Full-DOM rebuild on every interaction.** Many draws wipe with `innerHTML=""` (150 sites as of v913) → flicker, lost scroll, dropped keyboard. Prefer targeted node updates / class toggles. New code must NOT add another wipe-and-rebuild surface — **the preship ratchet FAILS the ship if the wipe count grows** (baseline in `_dev/ratchet-baseline.json`; it auto-lowers as debt is paid, never rises).
- **One ~11,200-line file, ~2,600 functions.** A bug in one region cascades. When you touch a region, leave it cleaner; don't graft a third menu system on (there are already two — `#sheet` modal + the notebook surface — and they clash; `REBUILD-PLAN.md` targets unifying them).
- State: `localStorage["alter_plan2"]`, `SCHEMA` at `@SEC:TIME`, migrated in `load()` at `@SEC:STATE`. Bump `SCHEMA` and add a `MIG n→n+1` block when you change the shape — a silent shape change wipes David's real data. The ratchet enforces the SCHEMA↔MIG pairing mechanically.

## Don't replan instead of building
There are 16 planning docs and 3 rebuild cycles already. Don't add a 17th. Update the newest `TRACKER-HANDOFF-*.md` in place; the rest are archive. A new doc is justified only when David asks for one.

## Fable 5 usage (~2× Opus price — cheaper per SOLVED task, not per token)
0. **NO BUILDING ON FABLE (David 2026-07-18, supersedes the softer 2026-07-02 rule).** Fable sessions = thinking, planning, design synthesis, brainstorming ONLY. ALL building happens on Opus, including regression-zone work, unless David SPECIFICALLY says "build with Fable" in that session. If David asks for a build while on Fable: produce the spec here, tell him to run it on `/model claude-opus-4-8`. Same for chat visuals/widget mockups (David 2026-07-18): Fable never renders widgets (credit burn); Fable writes the design brief + beauty/cleverness bar, OPUS renders the widgets in chat and builds. I still own the routing call and say so before any sizable task; route subagent/workflow work to cheaper models via per-agent overrides regardless of session model.
1. **Effort = the throttle.** Default LOW (bug fixes, CSS/palette, version bumps, ship-loop, handoffs, reformatting). HIGH only for: the timeline/gesture regression zone, multi-region refactors (menu unification, killing innerHTML wipes), REBUILD-PLAN.md work. Can't say WHY it needs high? It doesn't.
2. **One-shot with a spec.** Non-trivial task → 10 lines first (what changes, which regions/functions, which regression-contract items, how verified), then execute ONCE. No blind edit-check-edit loops.
3. **Batch, don't nibble.** Read an app.js region once; do ALL related edits in that pass. Group small fixes into one context (separate commits ok).
4. **Long runs go at the DEBT.** Multi-hour autonomy = the landmines as one contiguous run held against the regression contract — never for 5-minute fixes.
5. **No intelligence on mechanical steps.** preship/commit/push/boot-check: just run them, no narration.
6. **Constitution outranks confidence.** Preview still lies about gestures — "boots clean; gesture feel DEVICE-UNTESTED" stays the only honest report.
7. **Pace the budget.** If a run grows: ship what's verified, log the rest DEVICE-UNTESTED in the newest handoff. Half-shipped-verified > fully-drafted-unverified. David must never wake to zero.
8. **Design options = cheap tournament.** Parallel low-effort variants, sketched in chat for David to pick. Never a high-effort run on options he might reject.
