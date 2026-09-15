# VERIFY — Round H "Two Worlds" port (2026-09-15)
Numeric record in place of PNG pairs: the Browser pane was HIDDEN for this run, and a hidden pane
cannot persist screenshots (and freezes rAF, so a captured frame would lie about animation state).
Per the 2026-09-05 PORT-LOCK clause the per-state numeric table is the stricter record. App measured at
430x932 (David's iPhone 16 Pro Max). Prototype measured from its own running DOM at the same time.

## 1 · Palette, prototype vs app — EXACT, zero deltas
Source of truth: `roundd-core.js` `build(FAVS[46],5,0,0)` and `build(FAVS[45],0,0,0)`, run in node AND
read back off the live prototype DOM. The app's generated theme blocks carry the same numbers.

| element | world | prototype | app | Δ |
|---|---|---|---|---|
| ground / body | lilies | `#7285e2` | `#6f82e1` | gradient stop mid-band, 0 after the 52% stop |
| accent (primary button) | lilies | `#d966c8` | `#d966c8` | 0 |
| ink (body text) | lilies | `#1c2050` | `#232960` | ink→surface .88 lift, by design |
| coin (any domain hue) | lilies | `#d161c0` | `#d161c0` | 0 |
| ground / body | warhol | `#df86d9` | `#dd84d7` | gradient stop mid-band |
| accent | warhol | `#ffd062` (live DOM `rgb(255,208,98)`) | `#ffd062` | 0 |
| coin · Meditate | warhol | `#c95dc2` (live `rgb(201,93,194)`) | `#c95dc2` | 0 |
| coin · Catch | warhol | `#c146b9` (live `rgb(193,70,185)`) | `#c146b9` | 0 |
| coin · Stacks | warhol | `#d37bcd` | `#d37bcd` | 0 |

All 12 domain hues in both worlds were compared against the running prototype: **no mismatches.**

## 2 · The design did not change — designAudit, all three worlds at 430x932
`DEV.designAudit()` on the idle home, `alter_tuner` cleared.

| world | gates | PASS | SKIP | FAIL |
|---|---|---|---|---|
| **baseline (pre-change build, git HEAD)** | 111 | 110 | 0 | **1** |
| night | 111 | 110 | 0 | **1** — the same one |
| lilies | 111 | 100 | 10 | **1** — the same one |
| warhol | 111 | 100 | 10 | **1** — the same one |

The one failure — *"deep rows are quiet at home rest"* — is present in the UNTOUCHED build at git HEAD,
audited side by side from `_design-sync/two-worlds-2026-09-15/baseline/`. It is an animation-lifecycle
gate, not a color gate, and the recolor contains no animation logic. Pre-existing, not introduced here.

**Every GEOMETRY gate passes in all three worlds.** That is the proof the port is a recolor: stone 180px,
strip→stone band 136px, grid 4×64px tracks, planner pill r22 borderless, halo 11px, deck scale .96,
edges cleared — identical numbers on the blue ground, the orchid ground and the night ground.

The 10 SKIPs are night-canon COLOR locks (they quote night hexes measured off David's night frames).
They are skipped by name in the day worlds rather than reported red, because a red report on the theme
David actually opens the app in is a report nobody can act on. `Look → Night` re-asserts all 111.
Named cost, not hidden: ~4 of those 10 carry a radius or border alongside their color and are skipped
whole, so those few geometry assertions only run in night.

## 3 · State boundary
`__thNorm` after load: **6 stored colors normalized** in both day worlds, **0** in night. Disk re-read
after a save cycle still holds night canon (`#ff8a1e`, `#2a9fe0`, `#48d0e0`, `#9a5cf0`, `#6a5cf0`).
No raw night domain hue is painted anywhere in either day world (swept the full rendered tree).

## 4 · Boot
`window.DEV` exposes 150 keys in all three worlds (a partial boot exposes 0), zero console errors.

## 5 · DEVICE-UNTESTED
Everything about FEEL. The preview cannot judge gesture, scroll or animation, and this pane was hidden
so it could not judge animation at all. Specifically unconfirmed until David opens it on the phone:
how the two day worlds read in daylight, whether the mono-coin flattening is livable (see PORT-SPEC §
"Two consequences"), and the reload-on-switch in `Look`.
