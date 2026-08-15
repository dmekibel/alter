# Claude Design prompt — THE FIVE-WAY WORLD: pane transitions + the directional home cascade

*Paste this into the Claude Design project "Alter Design System" (the same project that holds `Home Screen.dc.html`).
Written 2026-08-15 for David. Every number below is quoted from the shipped code, so the port can be 1:1.*

---

## What I want designed

ALTER's home is the centre of a five-way world. Vertically it already works and is BUILT: **journey** above, **home**, **tools** below, with a magnetic spring, and the home board cascading in and out. What is NOT designed is the HORIZONTAL half and the way all four arrivals should feel like one family:

- **swipe LEFT from home → the PLANNER**
- **swipe RIGHT from home → the GARDEN**
- and back to home from either side.

Design the **transitions** and the **home board's arrival**, so that the home board assembles itself *from the direction you came from*:

| coming from | the board builds |
|---|---|
| the journey (above) | top → down |
| the tools (below) | bottom → up |
| the planner (left) | left → right |
| the garden (right) | right → left |

That directional rule is the heart of this. Everything else serves it.

## The artboard — please use exactly this

**402 × 874, iPhone frame, status bar drawn inside the frame.** This is the artboard the whole app is already pinned to, to the pixel. Please do not design at another size — the app renders this artboard and scales it uniformly to fill bigger phones, so a different artboard silently breaks every position.

One consequence worth knowing: on my own phone (440 × 956) the whole board is scaled up by **1.0945**, uniformly. So every travel distance you author gets multiplied there. **Author at 402 and do not compensate** — the scale keeps every proportion intact, and any "correction" would break it.

## The home board's elements (already built — please reuse, don't redesign)

Top to bottom, and these are the things that cascade:

1. **week strip** — five 13px day pills + an icon row under them (this one is special: it sweeps column by column, left→right, with a 3D tilt; keep that character)
2. **date kicker** — 15px, 6px letter-spacing
3. **the stone** — the 180px pink play disc with its halo
4. **"What now?"** — Baloo 2 800, 36px
5. **the sub-line** — 16px
6. **the Planner pill** — violet, rounded

The strip is six columns, not five: five day pills plus the chevron that rides in the row.

Below them sits the practice deck (four stack tiles) and the TOOLS hint — those are NOT part of the cascade.

**One face has five beats, not six:** the night face draws no date kicker. The cascade skips it with no empty beat and no gap in the rhythm. So please don't build the timing on "there are always exactly six".

## The motion language already in the build (so the new directions are siblings, not strangers)

The vertical arrivals use a spring-pop, and I approved this feel. These are the emitted values, read out of the shipped code:

| | value |
|---|---|
| block travel | **22px** (down for a bottom-up arrival, up for a top-down one) |
| block scale | **.92 → 1**, with opacity full at 60% of the way |
| block duration | **0.46s** |
| block easing | **cubic-bezier(.3, 1.28, .5, 1)** — a gentle overshoot |
| block-to-block stagger | **55ms** |
| the week strip's columns | **26ms** apart, duration **0.44s**, easing **cubic-bezier(.2, .85, .28, 1)** — no overshoot there, it reads as a wobble |
| the strip column's own move | 10px + scale .9 + **rotateX −34°**, through a 520px perspective on the strip |
| the gap the strip leaves before the next block | **133ms** (it overlaps its neighbour rather than blocking on it) |
| **whole arrival, first pixel to last** | **~0.85s** |
| the exit | **0.3s**, **40ms** stagger, easing **cubic-bezier(.45, 0, .75, .4)** |
| the exit's move | **18px** and a fade — **no scale**. Whole exit ~0.5s |

Note the exit is *not* a literal mirror of the arrival: it is a shorter, faster, scale-free sink. I called those exits good; please keep them that way and design the horizontal exits to the same recipe.

**Please design the horizontal arrivals as members of this family** — same pop, same rhythm, same ~0.85s envelope — differing in the axis and the order. If you think the horizontal ones need different numbers to feel right, change them and say so explicitly; I will follow your version.

## Two things already decided, so you can decide knowingly

**1. The cascade is a stagger, not a slide.** When I designed the vertical one I said: *"I don't want it to look like the things are actually sliding from the left, I just want them to appear in a cascading manner."* The strip's left→right sweep is a *sequence*, not a travel across x — each column pops in place, 26ms after the one before. If a left→right arrival should now genuinely travel across x, that is a change of mind and I'm open to it, but say so out loud so I know I'm reversing myself.

**2. The pane slide is flush, and the parallax version is already dead.** When the panes slide today they move 1:1, edge-to-edge, at full size — no scale, no dim. I killed the scaled version in 2026-07 because the shrink opened a gap that showed the dark body between the two panes. There *is* already a soft connective seam: a thin gradient shadow on both vertical edges of the sliding surface (`-10px 0 20px -8px` and `10px 0 20px -8px`, black at .5). So when you decide whether the outgoing pane dims, scales or parts, you're re-opening a decision, not filling a blank. Which is fine — just name it.

## How the app's sideways gesture actually behaves today

The planner ⇄ journey ⇄ garden carousel already exists, and these are its live numbers. Design against them or overrule them, but don't guess at them:

- The gesture **declares itself horizontal** at 16px of x travel, once x exceeds y by 1.2×. It **surrenders to vertical scroll** at 14px of y travel once y exceeds x by 1.5× — a slow, slightly wobbly sideways swipe is deliberately not stolen by the scroll.
- Once committed, both surfaces move **1:1 with the finger**, the incoming one parked exactly one screen over.
- On release, it **commits at 26% of screen width** of travel — no velocity term today. Under that it springs back.
- The commit and the cancel both run **0.3s, cubic-bezier(.22, .9, .3, 1)**, and the new surface's real state lands 320ms after release.
- **A second finger cancels the drag** and springs it back to where it started.
- The outgoing surface's own vertical scroll **freezes** the moment the swipe commits, so mid-transition you are looking at a still, not a live scrolling page.
- **Overshoot is structurally impossible**: only one neighbour is ever brought on stage, so no fling can jump two zones. You don't need to design a guard for it — but equally, don't design a "fly past and settle back" state, because it can't happen.

## What is NOT true today (so you know how much of this is new ground)

- **Home has no sideways gesture at all.** While the home surface is open, the carousel is deliberately switched off — every horizontal swipe on home is currently ignored. So this design is a new gesture on a surface that has never had one, not a retarget of an existing one.
- **The way home today is the puck**, the little colour-changing pill at the bottom-left. It is the one way home from every other surface, and a tap has **no direction**. So the directional rule needs an answer for a directionless entry (see the questions at the end).
- **Home is a layer over the panes, not a pane.** The planner and the garden live underneath it. When you leave home sideways, home is genuinely torn down — the journey trail is handed back, the one-page vertical scroll is dropped — and it is rebuilt when you return. Two consequences: (a) coming back **always lands at the home seat**, never at the spot in the journey or the tool shelf you left from, so please don't design a "resume where you were" return; (b) the rebuild is exactly why an arrival cascade is possible at all.
- **Home has no bottom menu bar; the planner and the garden do.** It sits under the home layer. So a home ↔ planner transition crosses a chrome boundary, and the bar itself never slides — it's fixed and stays put while pages move beneath it. Please say what the bar does during the travel: already there, fading in, or appearing at the end.
- **The journey exists twice**: as the middle pane of the sideways carousel, and as the sky above home in the vertical world. Worth keeping in mind if the sideways design implies anything about the journey.

## What to actually produce

1. **The pane transition itself** — home ↔ planner and home ↔ garden. What does the eye see while travelling? Show the **mid-transition state**, not just the endpoints: I want to be able to park it at roughly 25%, 50% and 75% of travel and measure it.
2. **The four arrival cascades** on the home board, per the table above.
3. **The exit** when leaving home sideways.
4. **The handshake between the slide and the cascade.** This is the question that decides whether it feels alive or sluggish, and I need it answered explicitly: does the arrival cascade start **while the board is still travelling**, or only once it has landed? The vertical version fires mid-flight — 260px out, while the spring is still moving — because firing on landing read as *"the animation happens too late."* Please pick the horizontal equivalent and mark it in the prototype's timeline.
5. **The same for the exit**: does the board's sink finish before the slide starts, or overlap it?
6. **What the horizontal cascade means for the week strip specifically.** It already sweeps left→right. Coming from the LEFT, should it still sweep left→right, or reverse to match the travel? Your call; please make it explicit.
7. **The interrupted swipe as a designed state.** A finger that comes back mid-swipe returns to where it started — but if the board had already started sinking, what happens to it? Does it re-rise, and on what stagger? And what about a swipe left immediately followed by a swipe right?

## Hard constraints from the build

- **One swipe = exactly one neighbour**, and no gesture may land you two zones away. Already guaranteed, as above.
- **One finger swipes between surfaces; two fingers pan the camera inside the garden.** That split is already law. Note also that in the garden the bottom third of the screen belongs to the thumbsticks — a swipe starting low and near either edge is deliberately not a pane swipe. So a swipe back home from the garden really only lives in the upper two thirds, or dead centre. Please design with that.
- **The vertical axis is the browser's on home.** The home column is a real native scroll, so a sideways gesture has to be claimed before the browser takes the finger — and it cannot be claimed while the column is still gliding under its own momentum or under the magnet's spring (only one thing owns that scroll at a time). So please don't design an instant sideways response *during* a vertical glide; tell me what should happen instead if a finger goes sideways then.
- **Sideways from where?** The magnet lets go entirely once you're more than one screen up into the journey — past that you're reading, not travelling. Say whether the sideways swipe is available anywhere in the vertical column, or only at the home seat.
- **The board's own transform slot is taken** by the scale that fits it to bigger phones. The vertical cascade works around this by animating the separate `translate` / `scale` / `rotate` properties rather than `transform`. Whatever the horizontal travel is, please express it as its own property too — otherwise it stomps the fit-to-phone scale on my actual phone and nowhere else.

## Please make it a RUNNING prototype, not stills

This matters more than anything else in this prompt. The last port took six rounds because the design was read as a document instead of run as a program. So:

- make each transition **drivable** — buttons or a real swipe — so I can put it in every state
- let each **landing hold still**, so I can measure it
- let the **mid-travel states hold still too**, at least at 25 / 50 / 75% — a transition is a set of positions, not a set of endpoints
- keep every value in **absolute pixels** on the 402 artboard
- expose the **timeline**: for each element, when it starts, how far it travels, how long it takes, what it eases on
- and one specific to a sideways transition: **half the composition is off-frame by definition.** The artboard crops at its edge, and a shape cut by that edge is a cropped element, never a designed peek — that mistake has cost us a whole build before. So please give me a way to inspect the off-frame half (a wide view, a toggle, anything) rather than leaving me to guess what's out there.

I will open the file, drive it to each state, and read the numbers out of the live prototype — then the app gets built to those numbers exactly.

## Questions I would like answered inside the design

1. Coming from the left vs the right — should the cascade mirror (left→right vs right→left), or should the board always assemble left→right and only the *travel* direction differ?
2. Should the planner and garden panes have their own arrival cascades too, or is the home board the only surface that assembles this way?
3. **A directionless arrival** — the puck tap, opening the app cold, closing a tool. There is no "from" for those, and today they are the most common way home. Does the board default to one direction, use a fifth pattern of its own, or arrive with no cascade at all?
4. Does the sideways commit need a **velocity** term (a fast short flick commits), or is the 26%-of-width distance rule enough?
