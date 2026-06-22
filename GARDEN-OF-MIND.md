# ALTER — The Garden of Your Mind (world vision)

> Captured 2026-06-22 from David's direction. The look/character is AI-generated
> (Higgsfield nano-banana) and animated via AutoSprite, then wired into the canvas.

## North star
You don't play a person — you tend a living **inner world** through a small **guardian fairy**.
It is **the garden of your mind**, and real-life deeds are what cultivate it.

## The arc — wild → cultivated → estate
1. **Wild (start).** An overgrown jungle. Untamed. Robinson-Crusoe / explorer energy —
   you arrive and begin clearing and taming. The fairy reads tribal / nature-spirit (or medieval).
2. **Cultivated.** As you act in real life, the wild becomes an organized, thriving garden.
   The first functional structures appear.
3. **Estate / luxury.** It matures into a beautiful, prosperous estate — dacha → castle-farm —
   aesthetic luxurious living for rest. Eventually you're the "rich person whose garden is tended
   by gardeners": your inner world is so well cultivated it sustains itself.

## Milestones → buildings (the core loop)
Real-life **milestone achievements are felt in the mind-garden** as new **structures, each with a
function**. Two intertwined axes:
- **Function / productivity** — cultivation infrastructure to get the most from the soil; a
  community that tends the garden (your systems, habits, people).
- **Aesthetic / rest** — beautiful, luxurious living; a place to relax (dacha, castle, ornamental gardens).

A real deed (the **send-gate**) is what raises a building. A building = a kept promise made visible.
(Psycho-Cybernetics: you *build* the place, not visualize it. Crusoe: from nothing.)

## Character
A guardian **fairy** — Fairly OddParents / Dexter's Lab / Powerpuff Girls proportions: big head,
big eyes, **bold thick outlines**, calm muted palette, **subtle aesthetic** clothing (never on-the-nose
gardening gear). Floats; wand + wings + floating crown/leaf-ring. Evolves with the world —
wild nature-spirit at the start → more refined/regal as the estate flourishes. It is still **you**
(the mirror), rendered as your garden's guardian.

## Style
Chunky pixel art + 1990s cartoon-modern proportions: bold thick outlines, big heads, bold simple
shapes, flat muted-zen colors. Square/tile island (not circular). Crisp, not blurry.

## Character look is TIERED & upgradable
The fairy's outfit/look **upgrades with progress** — wild nature-spirit → cultivated → regal/estate.
Implementation: swap the **whole sprite set per milestone tier** (a handful of distinct looks across
the arc), each generated when we reach it. NOT granular per-garment paper-dolls (consistency nightmare
for AI sprites, overkill). So any given sprite is replaceable — the game references a "current sprite set."

## App shape — the game IS the app (2026-06-22, David)
No more separate "You / Day / Grow" tabs with the game bolted on. **The world is the home screen.**
Every productivity feature is a **diegetic menu** reached through the world — Sims-inspired, minimal, clever.

Feature → in-world access point:
- **Home** = the full-screen world (the Cuphead island). Open the app → you're in it.
- **Tap your character** = the action hub: *plan the day · track time (stopwatch) · reflect*. (The character "carries" the planner/stopwatch.)
- **A sundial / clock object** = the day planner + time tracker.
- **A notice board / journal object** = habits, as Sims-style daily needs/routines the world reflects.
- **A growing tree / constellation** = the skill / virtue tree.
- **The cabin** = settings / the "brain" / profile.
- **Buildings you raise by shipping** = milestones (the garden-of-mind progression).
- Mood → weather already makes inner state diegetic; extend that everywhere.
- **No bottom tab bar.** Minimal chrome; one subtle overflow menu at most.

Build sequence (fold into the Cuphead rebuild — we're re-skinning anyway):
1. Finish the Cuphead world skin.
2. Make the world the **home** (collapse the 3 tabs; world is the default screen).
3. Add diegetic access points (tap-character action hub; world objects → feature menus).
4. Migrate planner / timer / habits / skills into those menus. (The new multi-select radial = the time-track menu.)

## Status (2026-06-22)
- Character: **medieval fairy chosen** as the v1 / starting look. (Higgsfield AutoSprite is broken/gated
  on the starter plan — failed + auto-refunded on every input, so 0 credits lost. 188 credits remain.)
- Animation: via **Kling image-to-video** on David's account (idle + 360 turn + move loop), sliced to frames.
- BG removal: flood-fill works cleanly on her cream bg (thick outline = crisp boundary); **SAM 2 / rembg
  as fallback** only if a clip's background drifts. No green/blue screen (collides with green tunic + blue wings).
- This sprite is **v1/temporary by design** — it gets her moving now; upgraded looks come with the tier system.
- Next: receive Kling clips → cut → wire fairy in → build world stages + milestone→building system.
