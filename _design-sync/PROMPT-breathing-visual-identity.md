# Claude Design prompt · THE BREATHING PLAYER'S VISUAL IDENTITY (round 25)

*Paste into "Alter Design System". ONE surface: the breathing player. Two questions inside it. Nothing else.*

## Why this round exists

Two things I hit on my phone:

1. **The circle is there when the visual is supposed to be the wave.** Before I press play, and for a moment
   when I swipe sideways between segments, the player shows the pink orb — then it becomes the wave once
   breathing starts. It doesn't make sense for the circle to be there if the visual is the wave. Either the
   circle earns its place as the resting state and **transitions into** the wave (an animation of it getting
   smaller / becoming the wave), or the wave is there from the start. I want to see both.
2. **Every breathing segment wears the same lungs icon.** In a breathing stack the story bar at the top shows
   the lungs glyph repeated five times. If the five things are different kinds of breathing, they should look
   different at a glance.

## The example to design against: a five-segment breathing stack

Use a stack of five DIFFERENT breathing patterns. These are the real ones in the app, with the goal each is
offered for:

| key | name | offered for |
|---|---|---|
| `resonance` | Calming breath | just settle me |
| `sigh` | Physiological sigh | wired right now |
| `box` | Box breath | need to focus |
| `calm478` | 4-7-8 breath | winding down for sleep |
| `coherent` | Coherent breath | even out the heart |
| `exhale48` | Extended exhale | slow a racing system |
| `nostril` | Alternate nostril | balance and steady |
| `wimhof` | Wim Hof rounds | charge the body up |

Pick five for the frame. Their SHAPES genuinely differ — box is four equal counts, 4-7-8 is a long hold and a
longer out, the sigh is two stacked inhales, Wim Hof is rounds with a breath hold, alternate nostril alternates
sides. **The icon should come from the shape of the breath, not from a generic lung.**

## What already ships (reuse, don't redesign)

- **402 x 874 artboard, absolute px.** DS tokens only, no new hues. Tabler icons, never emoji.
- **The story bar** at the top: one column per segment, a bar plus an icon under it, the current one at full
  hue and the rest dimmed. Keep that structure; only the glyphs are in question.
- **The wave** (just shipped): a single line, the live "now" point pinned at the horizontal **centre**, history
  scrolling leftward, the right half empty. It draws roughly the most recent half cycle. Clean and smooth.
- **The orb**: a pink disc that scales with the breath level (about 0.84 at rest, 1.14 at the top of a hold).
- Both are entries in one visual registry, so a third is cheap if you want one.
- Below the visual: the phase word (Breathe in / Hold / Breathe out) with the seconds remaining on its own line
  under it, then a draining progress bar.

## FORK 1 · the resting state and the handoff to the wave

- **1A · the orb IS the resting state**, and on play it transitions into the wave — design that transition
  explicitly (what shrinks, what stretches, over how long, on what easing). This is the option I leaned toward.
- **1B · the wave is there from the first frame**, at rest, flat or barely breathing, and simply comes alive.
  No circle anywhere in a wave session.
- **1C · your own idea**, if there's a better third answer.

Show the RESTING state, the MID-TRANSITION state, and the LIVE state for whichever you build, and make them
parkable so I can measure them.

## FORK 2 · a glyph per breathing kind

Design an icon for each of the five you choose, from Tabler only, so the story bar reads as five different
things. Show them (a) in the story bar at both full and dimmed states, and (b) at the size the picker uses.
If Tabler genuinely has no glyph for a shape, say so rather than substituting something vague — I would rather
know than get a wrong icon.

## The whole surface is open — redesign anything on it

The two forks above are what I hit, not the limit of the round. **Redesign the wave itself if you can better
it, and add whatever else belongs on screen while a breath is running** — ambient motion, the way the phase
word and its counter and the progress bar sit, how a segment hands over to the next one. I will experiment
here, so give me things to react to rather than a minimal answer.

Context on what just changed, as INFORMATION, not a fence:
- The wave's live point was just pinned to the centre and its line made smooth (it used to drift right and go
  jagged). Those two properties are what I wanted; the shape, density, weight and everything around it are
  still yours to move.
- The phase word now sits above its seconds counter, with a progress bar under them — a correction already in
  flight. If your composition wants them somewhere else entirely, propose it and say so.

## Non-negotiables (only these)

- **402 x 874 artboard, absolute px.** DS tokens only, no new hues. Tabler icons, never emoji.
- One hand, eyes half closed: this is a surface people use with their eyes shut between glances.
- Nothing that only works at one screen size — no viewport-relative sizing inside the artboard.
- All in-frame text is placeholder register only; final copy goes through our gates.

## Make it runnable

Drivable and parkable: resting, mid-transition, live, and moving between two segments of the stack. Keep the
page to phones with one-line labels — no control rails, no spec panels, no motion logs on the page; numbers go
in code comments. Mark your pick per fork with a small tag and ONE line why.
