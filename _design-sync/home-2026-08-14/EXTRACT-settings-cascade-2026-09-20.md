# EXTRACT — the You (settings) menu cascade · 2026-09-20

**Artifact (RUN, not read):** `_design-sync/home-2026-08-14/design_handoff_home_screen/Home Screen.dc.html`,
frame **2c** (the connected home). Served at `http://localhost:3000/...`, opened in the browser pane, the
settings button (`i.ti-adjustments-horizontal`, the `{{openYou}}` control) was CLICKED to drive the overlay to
its open state, and every value below was read from **computed style** on the live nodes (`getComputedStyle`
+ CSSOM keyframe rules), never from the markup. Frame **3a** ("You · the settings menu") is the same surface
standing alone and is synced with `Settings Menus.dc.html`.

Its prose note: *"tap the settings icon and the You menu slides down over everything."*

## The container

| property | value |
|---|---|
| overlay | `position:absolute; inset:0; z-index:30`, night gradient `180deg #3a1630 0% → #32152e 22% → #251436 54% → #180b25 86% → #0d050f 100%` |
| overlay reveal | `opacity 0 → 1`, `transition: opacity .18s` (default ease) |
| rows exist only while open | `sc-if youOpen` — the list is BORN at open, so every row plays its animation from frame 0 |

## The cascade — `@keyframes youRowIn` (computed)

```
0%   { opacity:0; transform: translateY(18px) scale(0.92); }
60%  { opacity:1; }
100% { opacity:1; transform: translateY(0px) scale(1); }
```

Every element: `duration 0.64s`, `easing cubic-bezier(.3, 1.28, .5, 1)` (gentle overshoot), `fill both`.
**Stagger 55ms, first beat at 20ms.** Whole arrival, first pixel to last: **0.515 + 0.64 = 1.155s**.

| # | element (prototype) | delay | duration | easing |
|---|---|---|---|---|
| 0 | header (close ✕ + gem count) | **20ms** | 640ms | cubic-bezier(.3,1.28,.5,1) |
| 1 | title row ("You" + rank pill) | **75ms** | 640ms | " |
| 2 | rank card (Pathfinder + bar) | **130ms** | 640ms | " |
| 3 | row Profile | **185ms** | 640ms | " |
| 4 | row Sound | **240ms** | 640ms | " |
| 5 | row Data | **295ms** | 640ms | " |
| 6 | row Guidance | **350ms** | 640ms | " |
| 7 | row Rest mode | **405ms** | 640ms | " |
| 8 | Advanced (dashed drawer row) | **460ms** | 640ms | " |
| 9 | home puck (64px, bottom-left) | **515ms** | 640ms | " |

The rule is `delay = 20 + i * 55` ms over the elements IN DOM ORDER — the puck is beat 9, inside the
sequence, not an afterthought.

## Mapping to the app (the app has one row the design predates)

The app's `youMenu()` adds **Look** (the three-worlds row, v1434) between Sound and Data. It takes its place
in the sequence, so the app runs **11** beats, `delay = 20 + i*55`, last beat 570ms, envelope **1.21s**.

## The exit

The prototype's `@keyframes youRowOut` (`opacity 1→0, translateY(0→10px), scale(1→.97)`, `.38s ease-in-out`)
exists in the sheet but is wired to the TOOLS shelf cascade (`_cascade()`), not to the You overlay. Closing
You in the prototype is the container's own `opacity .18s` fade only. **No per-row exit cascade is designed
for this surface** — so none is invented here.

## Not in this artifact

The prototype has no Look/theme row and therefore **no designed Look-switch transition**. The cross-fade
built in STEP 3 is an app-side default, named as such.

---

## VERIFY — prototype vs app (v1520, viewport 430x932)

| beat | element (app) | target delay | measured | duration | easing |
|---|---|---|---|---|---|
| 0 | `.ym-head` | 20ms | **0.02s** | 0.64s | cubic-bezier(.3,1.28,.5,1) |
| 1 | `.ym-title` | 75ms | **0.075s** | 0.64s | ✓ |
| 2 | `.ym-card` | 130ms | **0.13s** | 0.64s | ✓ |
| 3 | Profile | 185ms | **0.185s** | 0.64s | ✓ |
| 4 | Sound | 240ms | **0.24s** | 0.64s | ✓ |
| 5 | **Look** (app-only row) | 295ms | **0.295s** | 0.64s | ✓ |
| 6 | Data | 350ms | **0.35s** | 0.64s | ✓ |
| 7 | Guidance | 405ms | **0.405s** | 0.64s | ✓ |
| 8 | Rest mode | 460ms | **0.46s** | 0.64s | ✓ |
| 9 | Advanced | 515ms | **0.515s** | 0.64s | ✓ |
| 10 | home puck | 570ms | **0.57s** | 0.64s | ✓ |

`animation-name youRowIn` on all 11; overlay `.ym-ov` = `ovFade .18s var(--ease-settle) both` (prototype .18s).
Inline animations cleared 1.29s after open — 0 leftovers, so `.ym-row:active`'s press transform still wins.
`DEV.designAudit()` at 430x932: **79 PASS / 1 FAIL / 14 SKIP — byte-identical to HEAD v1519** (the one FAIL,
"deep rows are quiet at home rest", is pre-existing; confirmed by stashing the diff and re-running).
`node --check` clean; `bash _dev/preship.sh` green through ratchets + 26 logic invariants (v1519→v1520).
Console: no JS errors (only the pre-existing local 404s for untracked `assets/voice/*`).

**DEVICE-UNTESTED:** the FEEL of both motions. Boots clean in preview and every number matches, but CSS
animations freeze in a hidden preview pane, so the cascade's rhythm and the Look cross-fade's continuity are
confirmable only on David's phone.
