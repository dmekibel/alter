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

---

# ROUND 2 (v1434) — David's rejection of v1429, and what was actually wrong
His four points, all correct, all confirmed against the running prototype:

1. **"the Warhol color lacking the yellow entirely so the middle button ain't yellow."** True, and it was
   the real miss. `build()` returns a separate **`accent`** token — Warhol FLIPPED's is `#ffd062` — and I
   had collapsed it into the mono coin set, deleting the one color that makes Warhol read as Warhol.
   Prototype home frame, extracted: the 180px disc is `#ffd062` r50%, the plan pill is `#d37acd`
   (plannerBg, a coin — that one was already right), the 48px grid tiles are coins.
   Fixed with an `accent` / `onaccent` role named PER CALL SITE (never inferred from the hex, since the
   same pink is an ordinary coin everywhere else): the home stone, its halo, and the start-screen primary.
   Now measured in-app: `#tfTile` = `rgb(255,208,98)`, halo = `rgba(255,208,98,.09)`. Matches.
2. **"the other light color being not very legible."** True. Night is light-on-dark, so a light saturated
   hex re-hued onto a light day ground landed light-on-light: "Load save" was `#d98bd3` on a `#dd84d7`
   ground — **1.05:1**. Fixed with a measured contrast guard (WCAG): any ink-role result under 3:1 against
   the theme ground falls back to the design's own ink / inkSoft, keeping the night build's
   primary-vs-secondary hierarchy (muted source → inkSoft, saturated → full ink). Nothing already readable
   was touched. Also swept the 179 three-digit hexes (`#fff`) the first pass's regex never matched.
3. **"when u switch theme it should not take u back to start screen each time."** Fixed: `themeSet()` sets
   a one-shot sessionStorage flag and `showStartScreen()` stands down for exactly that reload. A real
   relaunch still gets the full arrival. Verified: `startScreenShown: false` after a live switch.
4. **"the icon for Warhol should have yellow not just pink."** Fixed: the Look row's mark is now the active
   world's `--t-accent`. Measured: `rgb(255,208,98)` on the Warhol row.

**A fifth problem the fixes surfaced**, which David would have hit next: the app darkens by mixing toward
`#160510`, which means *toward the page ground* — in night those coincide, on a light world they are
opposites. Water Lilies' CTAs and discs were rendering unreadable navy (`#242a61` on `#7285e2`). Two
re-rolings fixed it: a dark hex in `mixHex`'s second argument now resolves to the theme GROUND (46 sites),
and a hex in a `c:` / `color:` DATA property is a domain FILL, not text (287 sites).

## Round 2 gates, at 430x932
| world | gates | PASS | SKIP | FAIL |
|---|---|---|---|---|
| night | 112 | **112** | 0 | **0** |
| lilies | 112 | 103 | 9 | **0** |
| warhol | 111 | 100 | 10 | 1 — the pre-existing animation gate, which also passed on other runs (it is flaky, and it fails identically on the untouched build at git HEAD) |

The stone-halo gate is no longer skipped in the day worlds: it reads its expected hue from `--t-halo-ring`,
so it still asserts the frame's 11px/.09 + 64px/.28 recipe in all three worlds and only the hue moves.

---

# ROUND 3 (v1437) — "I thought we designed it correctly in Claude design with yellow and stuff"
He was right again, and this time the answer was sitting in a frame I had not opened.

**EXTRACTED — frame "onboarding · the spark", Warhol** (this is the authority, read off the running
prototype's computed styles, not inferred):
| element | value |
|---|---|
| ground | `linear-gradient(175deg, …)` |
| body copy | the theme ink |
| emphasis words `spark` / `waits` / `yours` / `Alter` | **`#ffc41f`**, weight 800, 27px |
| CTA | `#ffd062` (accent), 346x58, r18 |

The doc computes `hlGold / hlPink / hlBlue` and in **both** day worlds collapses all three into ONE
highlight: Warhol `#ffc41f`, Water Lilies `hsl2hex(h(accent), .8, .44)` = `#ca16af`. My round-2 contrast
guard had swept those words into flat dark ink — technically legible, and exactly the "ugly" David named.
Fixed with a `highlight` role (night keeps its own gold-and-pink pair untouched). The app's `HUES` map
highlights precisely those four words already, so the port is one-for-one with the frame.

Also this round:
- **The ALTER wordmark is white in every world** (`--t-wordmark`) — it is a display mark over the ground,
  not body copy, so the contrast guard had no business flattening it.
- **The guardian mark wears the palette**: star = `--t-accent`, halo + glint = `--t-highlight`. It was
  rendering pure dark, which is what David meant by "the icon should not be just pure dark".
- **The first-run CTA** (`.ob-btn`) is the world's accent, matching the frame's `#ffd062` button.
- **The streak strip stays visible with nothing planned** (`--t-track`). The unfilled pill was authored as
  a near-black plum that read against night's near-black ground by being slightly LIGHTER; remapped onto a
  light world it landed on the ground and vanished exactly when the strip had nothing to say. It is now a
  token — the one fill that must never equal the ground. Measured: pill `rgb(191,113,187)` on a
  `rgb(221,132,215)` ground.

**A REAL BUG THIS ROUND FOUND, shipped in v1429-v1436.** The first pass treated a hex inside an HTML
attribute (`stroke="#ffd24a"`) as a whole JS string literal and rewrote it to `stroke=THC("#ffd24a","ink")`
— invalid markup. 34 attributes across 12 lines, including **every flag in the language picker**, which had
been rendering with no fills at all. Repaired: UI marks now use string concatenation with the right role,
and the 17 national flag colors are restored as plain hexes and listed in `_dev/theme-fixed.json`, the only
sanctioned exemption from the theme gate — a French flag is blue-white-red in every world.

## Round 3 gates, at 430x932
| world | gates | PASS | SKIP | FAIL |
|---|---|---|---|---|
| night | 111 | 109 | 1 | 1 — the pre-existing animation gate |
| lilies | 111 | 100 | 10 | 1 — the same one |
| warhol | 111 | 100 | 10 | 1 — the same one |

---

# ROUND 4 (v1440) — the primary button
David: *"Let's go button looks cheap the color and the shadow."* Not taste — a real deviation from the
frame, extracted from the running prototype (Warhol, "onboarding · the spark"):

| property | frame | app before | app now |
|---|---|---|---|
| background | `#ffd062` | `#ffd062` | `#ffd062` |
| border | **none** | `3px solid #160510`-mapped (near-black) | `3px solid #af8751` |
| box-shadow | `0 5px 0` **`#af8751`** | `0 5px 0` near-black | `0 5px 0` `#af8751` |
| radius | 18px | 15px | 15px |
| label | `#3a2a05` | mapped ink | `#3a2a05` (onaccent) |

`#af8751` is not eyeballed: it is `color-mix(accent 62%, ink)` — the doc's own `lip()` under
`shadowMode: 'Hard lip, lighter'` — and computing it independently gives `#af8751`, byte-identical to
what the prototype renders. So the lip is now a `--t-lip` token: night `#160510` (unchanged, byte-identical),
Water Lilies `#914b9a`, Warhol `#af8751`. A near-black lip reads as depth on night's near-black ground and
as a cheap hard outline under gold on a light one; the frame's answer is a lip in the button's OWN hue.

**STILL OPEN, David's call:** the frame carries **no border at all** and an 18px radius. I tinted the
existing 3px border rather than deleting it, because removing it is geometry, not color, and night's
border is his own canon. One word and it goes borderless in the day worlds.

**A BUG THIS ROUND CAUGHT IN ITSELF.** Inserting `--t-lip` into the regenerator silently dropped
`--t-halo-ring`. An undefined `var()` makes its whole declaration invalid at computed-value time, so the
home stone's `box-shadow` fell back to `none` — the halo vanished in all three worlds, with no error
anywhere. Only `designAudit` caught it ("stone halo · got none"). `_dev/theme-check.py` now fails the ship
when any `var(--t-*)` used in index.html is missing from any of the three blocks.

## Round 4 gates, at 430x932
night 111 gates · 109 PASS · 1 SKIP · 1 FAIL (the pre-existing animation gate).
