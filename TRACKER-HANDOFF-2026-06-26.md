# ALTER — handoff · live **v505**

> **Read `CLAUDE.md` first** (it's the rules — ship loop, "synthetic tests lie about gestures," the regression contract, edit `app.js`/`index.html` not the generated `server.js`). This handoff is just **current state + the open ledger**.

**Live:** https://dmekibel.github.io/alter/ · **always test via** `/fresh.html` (cache-bust).
**Ship:** `bash _dev/preship.sh` (syntax-checks, auto-bumps `app.js?v=`, regenerates `server.js`, prints the fresh.html link) → `git add -A && git commit && git push`. Don't hand-bump the version anymore.
**Stack:** `app.js` (one IIFE, ~3000 lines) + `index.html` (inline CSS) + `manifest.json`. `server.js` is GENERATED — never hand-edit. localStorage `alter_plan2`. GitHub Pages from `main`.
**Preview:** MCP launch `alter`, port 8123, mobile preset; 🧪 **test day** = the ⋯ (tools) menu → "Test day".

---

## ⏩ PASTE TO START THE NEXT SESSION
> Continue ALTER (the $0 vanilla-JS guardian-angel life-sim planner). Live https://dmekibel.github.io/alter/ , test `/fresh.html`. **Read `alter/CLAUDE.md` (the rules) and the newest `TRACKER-HANDOFF-*.md` first.** Edit only `app.js` / `index.html` / `manifest.json`; ship with `bash _dev/preship.sh` then commit+push. Current = **v505**.
>
> Honor the rules: build in the REAL app (locked berry palette, never mockups); options-first for design choices, just-fix for bugs; **own the running ledger** (track every ask done-vs-pending, surface it each step, new asks are additive — see memory `own-the-ledger-remind-every-step`); and the verification truth — **synthetic preview tests LIE about gesture/scroll feel** (no real touch / rAF in the headless preview), so never write "verified" for swipe/drag/scroll; say "boots clean, gesture feel device-untested."
>
> **Biggest open thing:** David is mid-loop on the **scroll feel** (v505) — needs his phone to confirm. Then the ledger below.

---

## 🗂️ GRAND AUDIT (2026-06-26) — the canonical backlog now lives in `GRAND-AUDIT-2026-06-26.md`
David's recurring fear ("big-vision asks + small features get silently dropped") was excavated for real: **515 raw asks → 352 canonical requests** mined from all 12 session transcripts (genesis `f1b6612d` June 21–23 in the parent `claudeCode` folder + the 9 alter-dir sessions), each cross-checked against the shipped code + git. **✅ 201 built · 🟡 112 partial · 🔴 36 dropped · ❓ 3 unclear.** The DROPPED + the vision/big PARTIALs are the real backlog — read that doc, don't re-derive. Biggest dropped pillars: health-data integrations (Oura/bloodwork/scale/steps), money/bank integration, the Brian-Johnson/fieldguide **KB never wired into the AI brain**, tiered-gamification vision, "ask plan-or-track on open" reactive mode, doctor reminders, monetization plan. Built via the `_dev` corpus pipeline (`/tmp/alter-audit/*.py`, regenerable).

## 📋 THE LEDGER (own this — surface it every step)

### ✅ Done & shipped this session (v494→v505)
- Wake/bed editor (You tab) · Today→**Now** pill · Apple-Calendar **compact header + mini week-strip** · **midnight window** (always reaches 2am) · **past-block reorder** unfrozen · smooth day-swipe · **editor** trash-top-right + tap-above/swipe-down close · **Play = start-the-plan** (colored, hides redundant Plan btn; pressing it fuses the block into the matched past) · now-line vanish fix · **continuous scroll restored** + live week-strip on swipe · **Apple-Music collapsing nav** (v504) · **scroll feel** rework (v505).
- ↩️ Reverted: small-log **dots** (David: "don't render activities as dots").

### 🔴 DEVICE-UNTESTED — David must confirm on his iPhone (do NOT mark done)
1. **Scroll feel (v505)** ← the live one. Within a day = glassy smooth? Crossing a day = a deliberate *push slightly harder/longer* through the detent, not a jump? Day boundaries stable (not "confused where the day starts")?
2. **Collapsing nav (v504)** — scroll collapses Goals/You behind the Today pill + drops the tracker beside it; tap pill expands.
3. **PWA white-top (v497)** — needs a home-screen **re-add** to pick up the status-bar meta; and the real fix (#3 below) still pending.
4. Continuous-scroll recenter, the day-swipe + push gestures generally.

### 🟡 PENDING (tracked, not lost)
| # | Item |
|---|---|
| 2 | **Minimum render size for small activities** + clever zoom-out packing (keep tiny activities visible from afar, correct order, not messy — the *right* version of the rejected dots; absorbs the "pink log looks like a 2nd now-line" issue → David picked "make logs never look now-line-pink") |
| 3 | **PWA white-top real fix** — `html,body` gradient has no solid bg fallback + `height:100%` → iOS paints white behind the status bar. Add `background-color:#1a1726` + `min-height:100dvh` + an `html{background:#1a1726}` rule. Standalone-only. |
| 4 | **True full-bleed top rim** — `body.tab-day #pullSheet` still has `top:env(safe)+8px` + `left/right:2px`; set 0 + `border-top:none` + square the header top corners. |
| 5 | Backlog (grand audit): planning-flow **"ask what to keep"** when the day can't fit · **drift-overrun fork** · **non-negotiables = hard lock** (hold-to-end, out-of-time→ask) · bubble editor **+/− steppers** (currently a slider) · **dead-code cleanup** (`gotoAdjacentDay`, `scrollToDay`, `pendingScrollEdge`). |

---

## CURRENT ARCHITECTURE (what's BUILT as of v505)

### Day model (logical day, 4am rollover)
- `DAYSTART = 4*60`. `logicalK`/`todayK`/`logicalNowMin`/`toWin` (~80–92). `nowMin()`=wall-clock, `logicalNowMin()`=timeline "now".
- `wakeHour()`/`bedHour()` parse `S.profile.wake`/`.sleep` (onboarding en-dash ranges). **`dayWindow()` (app.js:91): `startH = max(4, wake-3)`, `endH = min(28, max(start+12, ceil(bed)+2, 26))`** — the `26` floor = always ~2h past midnight. Same window every day (uniform heights → clean stacking). Editable live via You-tab → 🌅 **Wake & bedtime** (`wakeBedSheet`).

### Continuous scroll (v505 — the model David picked, "continuous done right")
- `buildPull()` (~706) day branch (`else`, ~817): a `.day-pager` of 3 cards `[prev,cur,next]`; **CUR card = a vertical STACK of `focus-R..focus+R` day-`.day-sec`s, R=3 (7-day buffer)** + static `.day-stacksep` headers, then `attachInfinite(sc)`.
- **`attachInfinite` (~688):** on scroll, finds the centred day → updates the week-strip + Now pill EVERY scroll (cheap, no rebuild). **Recenters the buffer ONLY when the centred day is the buffer's first/last section** (you reached the edge) — so within the 7-day window scrolling is pure native scroll, *no mid-day rebuild* (this fixed the "confused where the day starts" jitter). Guards: `_infRebuild` (160ms cooldown), `_paging` (suppress during page-turn), `_navLock` (suppress nav-collapse during programmatic scroll).
- **Detent:** `.day-cardscroll{scroll-snap-type:y proximity}` + `.day-cardscroll > .day-stacksep{scroll-snap-align:start}` = a gentle wall at each day's header (free within a day, settles at the boundary, push harder to cross). **FEEL DEVICE-UNTESTED.**
- **Horizontal swipe** (`pb._gw` block ~843 → `pageSlide` ~677): Apple-Photos day turn. `pageSlide` animates from the finger's last position (reflow-forced distance) + `_sliding` guard + duration-matched fallback (fixed the freeze/wrong-day). On land it sets **`_scrollToFocus`** (NOT `pendingScrollNow`, which would trip buildPull's reset-to-today guard) to put the vertical scroll on the new day so the recenter agrees. Week-strip updates LIVE during the swipe. Vertical drags fall through to native scroll.
- **`jumpToToday()` (~705):** the Today/Now pill — on today → `scrollToNow` (guarded by `_paging` so the smooth scroll can't be eaten by a mid-scroll recenter = the now-line vanish fix); 1 day away → `pageSlide` swipe-back; further → quick directional slide then land.

### Header (v498, Apple-Calendar compact, 2 rows)
- Row 1: day/week/month `scope-seg` (left) · Now/Today pill `#pullTodayBtn` + `⋯` `.pull-toolsbtn` (right). Row 2: `weekStrip()` (~705) — 7 days, letter+number, `.pws-day.sel` (pink fill) vs `.pws-day.today` (pink text), tap to jump. `dayToolsMenu()` (~726, the ⋯) holds Plan day / Enhance / Clear / Undo / **Test day**. Zoom slider removed (pinch still zooms).

### Bottom nav — Apple-Music collapse (v504)
- Scroll the timeline → `body.nav-collapsed` (set in `attachInfinite`'s scroll listener, guarded by `_navLock`): Goals/You hide, the day `.nb` shrinks to a 62×50 **pill bottom-left** (with a "tucked behind" affordance on its right edge), `#liveDock` re-anchors to the bottom row **beside it**, `#pullSheet` bottom drops to reclaim the freed space. Tap the pill (nb `day` onclick) → expand. CSS: `body.nav-collapsed.tab-day …` (index.html ~915).

### Live tracker dock (`#liveDock`, `renderLiveDock` ~926)
- **Play = start-the-plan (v503):** when a plan's upcoming (`nextPlannedBlock`), the Play button wears the activity's colour + says "▶ start your plan"; pressing it `startPlanned()` → tracks it. The redundant **Plan** button is hidden (`body … #liveDock.hasplan .ld-plan{display:none}`). Replan + Drift remain. Tracking a straddling plan → it becomes the **convbar** (fused matched bar printing into the past) — the existing v454–v456 present mechanic, now reachable via Play.

### Present mechanic (unchanged core)
- Present = the **now-line** (thick pink, `.nowline`, the ONLY full-width pink line), a `.nowcirc` carrying the activity icon (left gutter), a right-side `.nowread` readout. A plan block straddling now **splits** (plan-left ghost) until you Play it, then **fuses** full-width (`convbar`: matte future → shining matched, printing into the past). Matched real fuses into the plan bar (`fusedbar`). Drift = mauve gradient. (Open: small real-lane logs can render as thin pink bars that read like a 2nd now-line → folded into ledger #2.)

---

## Gotchas / contract (also in CLAUDE.md)
- **Synthetic preview tests LIE about gesture/scroll/rAF feel.** Preview proves: boots, no console errors, layout, non-gesture taps. It does NOT prove swipe/drag/scroll feel — and **rAF doesn't fire in the background preview** (so `attachInfinite` recenter + smooth scrolls can't be watched here). Never mark those "verified."
- **Never run two day-nav models at once** (the old bounce = the v488 infinite-watcher vs a horizontal pager fighting). Current model is one continuous stack + a guarded pager.
- **Regression contract** (CLAUDE.md): vertical-flows-continuously · past set-in-stone / future can't cross now · tap-empty-creates / drag-moves / tap-bubble-edits · strip+pill track the centred day. Re-check every timeline change.
- Ship via `bash _dev/preship.sh` (don't forget — a missed version bump = David sees a cached old build; a missed `server.js` regen = the Cloudflare artifact goes stale).
- Bump `SCHEMA` (app.js:75) + add a `load()` migration if you change state shape — a silent shape change wipes David's real data.
