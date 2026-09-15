# PORT-SPEC — the tool library, Round H "tool library" frame
Extracted 2026-09-15 from the RUNNING prototype (`Round H - Two Worlds.dc.html`, Water Lilies default),
computed styles, artboard 402x874. Not read off the markup, not eyeballed.
David: "it's time to rebuild the tools library to my newer more minimal design."

## THE FRAME, element by element

### Header (unchanged from the app's — listed so the port does not disturb it)
| element | x | y | w | h | paint |
|---|---|---|---|---|---|
| settings glyph | 22 | 29 | 42 | 42 | — |
| leaf chip | 259 | 35 | 41 | 29 | bg `#6891d6`, r999, border 2px |
| gem | 314 | 33 | — | — | gold `#ffc41f` |
| chevron | 194 | 55 | 20 | 20 | — |
| "HOME" | 186 | 77 | — | 13 | `#3d4687`, 9px/800 |

### Section "FOR YOU NOW" — 3 STACK cards
- label at (47, 140), 9.5px/800, `#3d4687`
- faces 70x70, **r23**, at x = **62 / 169 / 276**, y = **166** (column pitch 107)
- each is the deck grammar: two shards behind the face at offsets **(-7,-7)** and **(-4,-4)**, same
  70x70 r23, then the face
- face lip: `0 5px 0` in **mix(own coin 62%, ink)** — measured `#8c4896` against a `#d161c1` face
- glyph 32x32, centred
- label at y = **240**, 13px/800, **`#80448e`**, centred, wraps to 2 lines

### Main grid — 12 SINGLE tiles, 3 columns x 4 rows
- tiles 70x70 **r23**, x = **62 / 169 / 276**, y = **296 / 412 / 529 / 645** (row pitch 116)
- same lip recipe, **no shards**
- labels 13px/800 `#80448e` at y = tile y + **75** (371 / 487 / 603 / 719)
- order: Stacks · Breathe · Meditate / Body · Heart · Vision / Catch · Reset · Recover / Begin · Night · Wins

### Home button
62x62, r50%, bg `#d966c8` (the world ACCENT), at (21, 797), carrying the accent halo.

## THE LAWS THIS FRAME RESTATES
- **border: 0px on every single element.** There is no ink outline anywhere in this surface.
- One lip per piece, in the piece's OWN hue at 62% toward ink — never black, never a shared edge.
- A label belongs to its coin: `mix(coin 55%, ink)` = `#80448e` here. It is NOT the neutral inkSoft the
  app currently uses, and it is the one value in this frame the engine still has no role for.
- Section headers are inkSoft at 9-9.5px/800, letterspaced.

## WHAT THE APP HAS TODAY (measured, same viewport, Water Lilies)
A 4-up row of stack tiles, then a partial grid with one stray tile at a different size and tint, no
section labels, labels cramped and wrapping badly, and a large empty column below. Structurally a
different surface, not a recolor away from the frame.

## SCOPE — this is a BUILD, not a recolor
Everything above changes DOM structure and geometry, which is exactly what the recolor work has
deliberately avoided touching for five rounds. It needs: the grid rebuilt to 3 columns at the frame's
pitches, tiles pinned to 70/r23, the shard grammar applied to stacks only, labels moved to the coin
tint, section headers added, and the whole thing held against the frame at 402x874 and 430x932.

## GATES
`_dev/DESIGN-PORT-CHECKLIST.md` in full. Frame-diff pairs per state into
`_design-sync/two-worlds-2026-09-15/roundH/verify/`. Night must keep its own colors throughout (the
tool library's night palette is its domain hues, not the mono coin). `designAudit` must not regress.
