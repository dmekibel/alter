# PORT-SPEC — Round H "Two Worlds" → three app themes
Source: Claude Design project 1e726982 · `Round H - Two Worlds.dc.html` (13 frames) + `roundd-core.js`
Staged: `_design-sync/two-worlds-2026-09-15/roundH/` · GATE A: PASS (68,987B, 13 frames)
Prototype RUN + screenshotted in both worlds (localhost:3000), computed values read from the live DOM.

KB-SWEEP: `_specs/BOOKS-DEV-CANON-2026-07-18.md` (hierarchy-by-de-emphasis), KB-ATLAS day-mode store
`_design-sync/day-mode-2026-09-13/palette-worlds.md` — that round's Monet numbers are a DIFFERENT, older
tournament (#dfe4f4 ground) and are NOT the source here. Round H supersedes it.

## Scope (David, 2026-09-15, three times over)
"apply both color palettes to the actual app" · "my old design and composition is CANON, don't change design"
· "we're just recoloring" · "never change the actual design".
=> COLOR ONLY. Zero layout, spacing, type, radius, shadow-geometry, or composition changes. Night theme
must render byte-identical to today's build.

## The three themes
| id | name | default | where |
|---|---|---|---|
| `lilies` | Water Lilies · moonlit (David's #2, as ranked) | YES — app opens here | Settings |
| `warhol` | Warhol FLIPPED (David's #6, as ranked) | no | Settings |
| `night` | the current build, unchanged | no | Settings |

## Extracted palette (from the design's own core, confirmed against the running prototype)
`makeCore(false,'Hard lip, lighter')`; world 1 = `build(FAVS[46],5,0,0)`, world 2 = `build(FAVS[45],0,0,0)`.

| token | lilies | warhol | night (today) |
|---|---|---|---|
| ground | `#7285e2` | `#df86d9` | `#160510` / `#1b1535` |
| bg | `linear-gradient(180deg,#8797e6 0%,#7285e2 52%,#596fdd 100%)` | `linear-gradient(180deg,#df86d9 0%,#df86d9 45%,color-mix(in srgb,#ffd062 24%,#df86d9) 100%)` | current gradient |
| surface | `#5d72da` | `#d476cc` | `#251d40` |
| ink | `#1c2050` | `#2c1035` | `#fff2f9` (light-on-dark) |
| accent | `#d966c8` | `#ffd062` | `#ff4fa0` |
| onAccent | `#1c2050` | `#3a2a05` | `#fff2f9` |
| coin(any domain hue) | `#d161c0` (flat — `it=5` forces S≤.6, L=.60) | `hsl(305,50%,clamp(L,.42,.78))` | its own hue |

Live-DOM confirmation (warhol): accent `rgb(255,208,98)`=#ffd062 ✓ · Meditate `rgb(201,93,194)`=#c95dc2 ✓ ·
Catch `rgb(193,70,185)`=#c146b9 ✓ — matches the computed table exactly.

## Two consequences David must see (flagged, not blocking)
1. **Both of his picks are MONO-coin worlds.** `coins=3` (lilies, on the accent hue) and `coins=4` (warhol, on
   the ground hue) collapse all 12 domain colors into one hue family. In lilies, `it=5` flattens lightness too,
   so every tool coin, folder, planner block and stack card is the SAME magenta `#d161c0`. The app's
   domain-color language (pink=Stacks, teal=Breathe, blue=Meditate…) stops carrying information in day mode.
   This is exactly what the prototype renders; it is his ranked pick. Named here, not silently "fixed".
2. **Polarity flips.** Night is light-ink-on-dark-ground; both day worlds are dark-ink-on-light-ground. Any
   structural near-white/near-black must invert, not just re-hue.

## Mechanism (chosen because there is no token layer: 1,102 distinct hardcoded hexes, 5,124 occurrences)
- **index.html CSS** → each hex literal becomes `var(--c-rrggbb)`; three generated `:root` blocks define them.
  `:root` (night) = the literal's own value → identity → today's build unchanged.
- **app.js** → each hex literal becomes `TH("#rrggbb")`, a memoized lookup returning a hex STRING, so
  `mixHex`, canvas `fillStyle`, and inline style strings all keep working. Night = identity.
- **Role disambiguation by CSS property**, because one hex carries two roles: `#160510` is both the page
  ground (→ theme ground) and the game-piece ink border (→ theme ink). The rewriter reads the property the
  literal sits in: `background*` → ground family; `border*`/`box-shadow`/`outline`/`color` → ink family.
- **The remap itself is the design's own `M()` / ground / ink logic, ported verbatim** — not invented, not
  eyedropped, not derived from a photo. Long-tail colors the design never drew go through the same function
  the designer used.

## Ship gate
Frame diff, not spec diff: app at 402x874 and 430x932, home + tool library + stack sheet + planner + player
screenshotted per theme and compared element-by-element to the Round H prototype frames. Any mapped element
that disagrees gets its prototype value PINNED in the override table. `DEV.designAudit()` must still pass
12/12 in night. Ratchets + `node --check`. Pairs/deltas land in `_design-sync/two-worlds-2026-09-15/verify/`.
