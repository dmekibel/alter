# SOP — never hand David a colour mistake again

Written 2026-09-15, after he said it plainly: *"This is all things you need to consider and check for
yourself. Your audit system is broken if you're able to give me these mistakes. If I already told you
how to design it, stop giving me the mistake. Make an SOP to fix it."*

He was right, and the reason is specific: `designAudit` checks the home board's locked NUMBERS — sizes,
positions, radii. Nothing checked the one thing that kept reaching him, which is a colour that resolves
WRONG. Every defect he caught over this week is one of four shapes, and all four are mechanical.

## THE FOUR SHAPES (every colour bug this week was one of these)

| shape | what it looks like | what it always is underneath |
|---|---|---|
| DARK_ORPHAN | a near-black piece on a light world — his "Open awareness is dark … we never designed there to be a dark thing" | a FILL whose literal was roled as text, so it resolved to the body ink |
| INVISIBLE | a piece you can barely see against its ground — his "the heart and the recovery look borderline invisible" | either the fill collided with the ground, or its LIP did (a lip mixed toward `#000` where black had been mapped onto the ground) |
| UNREADABLE | text under 3:1 on its own background — the "Load save" class | a light-on-dark colour re-hued onto a light ground |
| STALE_SELECTOR | a surface that silently stops being styled or cascaded | code still naming classes the last rebuild deleted (`tcEls` after the flat grid) |

## THE GATE

`DEV.colorAudit()` walks what is ACTUALLY PAINTED and reports all three visual shapes. It cannot be
fooled by a value being right in `_dev/theme-map.json` and wrong on screen — which is exactly how every
one of these got past me. It knows the design's own grammar: a piece whose fill is close to its ground
is NOT a failure when a real lip or border separates it, because that is how the frames themselves
separate the Warhol tool tiles (Heart is `#d787d2` on a `#df86d9` ground — 1.03:1 — and reads fine).

## THE PROCEDURE — run this before ANY ship that touches colour

1. `python3 _dev/theme-check.py` — every literal registered, every `var(--t-*)` defined in all three
   worlds. Catches a dropped token before it silently voids a whole declaration.
2. Serve, open, and for EACH of the three worlds — night, lilies, warhol — and EACH surface the change
   can reach: `DEV.colorAudit()`. **Zero failures, or a named reason per failure.** The surfaces that
   matter: start, onboarding intro, home (idle and up-next), tools, an open folder, an open dose card,
   planner, journey, settings.
3. `DEV.designAudit()` in NIGHT, on the idle home — geometry unchanged.
4. Anything the audit reports, fix at the ROLE, not at the site. A single mis-roled literal is usually
   dozens of elements; patching one selector leaves the rest to reach David one screenshot at a time.
5. Only then ship.

## WHY THE OLD LOOP FAILED, so it is not repeated

- I verified the MAP, not the PIXELS. `theme-map.json` said `#ffd062` and the screen drew a coin.
- I verified with the OFFLINE render, which schedules and plays in one breath, and so could never show
  a level that is baked in at scheduling time (the cue/tone volume bug).
- I verified against MY OWN SPEC instead of against the frame (the v1413 lesson, repeated).
- I fixed the reported element instead of the role behind it, so the same bug came back wearing a
  different surface — deck tiles, then folder coins, then step coins, then lips.

## THE ROLE RULE, since this is where it always goes wrong

A literal's ROLE is what it DOES, not where it sits in the source:
- a fill is `bg` — including `c:` / `color:` / `col:` / `light` / `dark` / `ring` / `hue` / `glow` data
  keys, domain var mirrors, `var(--x, #hex)` fallbacks, and `mixHex`'s second argument when it is dark
  (that idiom means "toward the page ground", which INVERTS on a light world)
- a border or a hard lip is `edge`; what a lip MIXES TOWARD is `--t-lipbase` (ink, never the ground)
- a heading is `head`, body copy is the light band, secondary is `inkSoft`
- a label or glyph ON a coin is `onpiece` (light); on the bright accent it is `onaccent` (dark)
- the primary action is `accent`; emphasis words are `highlight`; the currency is `gem`

Revise a mapping with `_dev/theme-regen.py`. **Never re-run `_dev/theme-gen.py`** — it rewrote the
source files once and is not idempotent.
