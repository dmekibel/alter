# ALTER — dev constitution

A guardian-angel life-sim PWA (pixel-art planner + tracker + game). Single user: David. iPhone, installed to home screen. Vision lives in `AUDIT.md`; current state in the **newest** `TRACKER-HANDOFF-*.md`. **This file is the rules. Read it first, every session — it exists so you don't re-derive them from 30KB of handoffs and re-break the same things.**

---

## Source of truth — edit ONLY these
- **`index.html`** — shell, all CSS, the `<script src="app.js?v=NNN">` tag.
- **`app.js`** — the whole app (one file, ~3000 lines).
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
bash _dev/preship.sh        # syntax-checks app.js, auto-bumps app.js?v=, regenerates server.js, prints the fresh.html link
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
- **Full-DOM rebuild on every interaction.** Many draws do `body.innerHTML=""` / `card.innerHTML=""` (e.g. [app.js:140](app.js:140), [app.js:424](app.js:424), [app.js:1054](app.js:1054)) → flicker, lost scroll, dropped keyboard. Prefer targeted node updates / class toggles. New code must NOT add another wipe-and-rebuild surface.
- **One 2975-line file, 871 functions.** A bug in one region cascades. When you touch a region, leave it cleaner; don't graft a third menu system on (there are already two — `#sheet` modal + the notebook surface — and they clash; `REBUILD-PLAN.md` targets unifying them).
- State: `localStorage["alter_plan2"]`, `SCHEMA` in [app.js:75](app.js:75), migrated in `load()` ([app.js:1097](app.js:1097)). Bump `SCHEMA` and add a migration when you change the shape — a silent shape change wipes David's real data.

## Don't replan instead of building
There are 16 planning docs and 3 rebuild cycles already. Don't add a 17th. Update the newest `TRACKER-HANDOFF-*.md` in place; the rest are archive. A new doc is justified only when David asks for one.

## Fable 5 usage (~2× Opus price — cheaper per SOLVED task, not per token)
1. **Effort = the throttle.** Default LOW (bug fixes, CSS/palette, version bumps, ship-loop, handoffs, reformatting). HIGH only for: the timeline/gesture regression zone, multi-region refactors (menu unification, killing innerHTML wipes), REBUILD-PLAN.md work. Can't say WHY it needs high? It doesn't.
2. **One-shot with a spec.** Non-trivial task → 10 lines first (what changes, which regions/functions, which regression-contract items, how verified), then execute ONCE. No blind edit-check-edit loops.
3. **Batch, don't nibble.** Read an app.js region once; do ALL related edits in that pass. Group small fixes into one context (separate commits ok).
4. **Long runs go at the DEBT.** Multi-hour autonomy = the landmines as one contiguous run held against the regression contract — never for 5-minute fixes.
5. **No intelligence on mechanical steps.** preship/commit/push/boot-check: just run them, no narration.
6. **Constitution outranks confidence.** Preview still lies about gestures — "boots clean; gesture feel DEVICE-UNTESTED" stays the only honest report.
7. **Pace the budget.** If a run grows: ship what's verified, log the rest DEVICE-UNTESTED in the newest handoff. Half-shipped-verified > fully-drafted-unverified. David must never wake to zero.
8. **Design options = cheap tournament.** Parallel low-effort variants, sketched in chat for David to pick. Never a high-effort run on options he might reject.
