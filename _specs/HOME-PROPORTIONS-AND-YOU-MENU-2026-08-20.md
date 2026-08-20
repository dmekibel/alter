# Home proportions + the You menu — 2026-08-20

Two items from David's device session. Item 1 is a root-cause find; item 2 is a port from a complete pull.

---

# 1. HOME PROPORTIONS DRIFT ON HIS PHONE — and the audit is structurally blind to it

David: *"the proportions of the home screen on my phone are a little off. The Instagram story bar is too high
up, too close to the rest of the header. There should be more space between them. Don't take my word for it,
use the actual way I designed it, and keep in mind I'm on an iPhone 16 Pro Max."* (440 x 956.)

## The find
The 2c home column is a FIXED 402px artboard, transform-scaled to fill the phone
(`#trackerFull.tf-2c.tf-scaled .tf-inner{ width:402px; height:calc(100dvh / var(--tfscale)); transform:scale(var(--tfscale)) }`).
Inside that fixed column, **three spacings are VIEWPORT-relative**:

| anchor (index.html) | value |
|---|---|
| `.tfw-home #tfHomeBars{ margin-bottom: var(--tun-gap, 8vh) }` | strip → circle |
| `.tfw-home .tf-ctrls{ margin-top: var(--tun-tools-gap, 5vh) }` | circle → tools |
| `.tfw-ground{ margin-top: calc(var(--tun-ground-pull, -19vh) - env(safe-area-inset-bottom)) }` | ground pull |
| (also `#trackerFull.tf-home.st-idle #tfHomeBars{ margin-bottom: var(--tun-gap, 3vh) }` on the non-2c face) |

`vh` resolves against the REAL viewport and ignores the transform, so:
- at 402x874 (the preview, and the artboard): `8vh = 69.9px` — matches the designed pixel gap, which is why
  **`DEV.designAudit()` passes 74/74**.
- at 440x956 (David's device): `8vh = 76.5px` — about **9% larger**, while every fixed-px element beside it
  stays put and is then scaled uniformly. The column's proportions therefore differ from the artboard's, and
  they differ MORE the taller the phone.

**This is the exact failure class the artboard law exists to prevent** (see the-2c-saga-resolution, cause 2:
"relative sizing of an absolute artboard"). It survived because these are spacings, not sizes, and because
**every gate runs only at 402x874, where vh and px coincide by construction.**

## The fix
1. Convert those spacings to fixed artboard px — the values they resolve to at the 874 artboard
   (8vh = 69.9, 5vh = 43.7, -19vh = -166.1); keep the `--tun-*` tuner vars so David can still tune on real
   pixels, only the DEFAULT changes from a vh to a px.
2. **Make the audit geometry-aware.** `DEV.designAudit()` must also run its position/proportion gates at
   **440 x 956** (David's device), not only at 402 x 874. A gate that can only ever pass is not a gate. Report
   both geometries.
3. Then sweep for any remaining `vw`/`vh` inside the `.tf-2c` / `.tfw-*` column and report them; convert or
   justify each.

## Still to verify against the design
His actual complaint is the gap ABOVE the strip (header → strip), which is `margin-top:0` plus whatever the
HUD and safe-area contribute — not one of the three vh values above. **Pull `Home Screen.dc.html` and read the
authored strip top, then gate it.** Do not guess this number.

---

# 2. THE YOU MENU — port from `Settings Menus.dc.html`

David: *"fix the settings, because right now when you click settings it opens some old menu I don't like where
it says The Vital and it tells me the level of everything. Get rid of that and make it the settings I
designed, at least the main menu. I can design the submenus later."*

Source pulled complete (`truncated:false`). The design's own note: *"The six rooms behind these rows are still
undesigned"* — so this round is THE LIST ONLY. Each row navigates; the rooms come later.

## ARTBOARD CONFLICT — flag, do not silently resolve
This design is authored at **390 x 893**, while the app's home is pinned to **402 x 874**. Two different
artboards. Recommendation: pin the menu's column at **390px absolute, centred**, exactly as home pins 402, and
let the list scroll (the 893 height is just "taller than the screen"). Report it to David in one line.

## EXTRACTED VALUES (absolute px, from the pull)
Surface background: `linear-gradient(180deg, #3a1630 0%, #32152e 22%, #251436 54%, #180b25 86%, #0d050f 100%)`.
The whole list is ONE scroller (`position:absolute; inset:0; overflow-y:auto`).

**Header row** `margin:66px 25px 0; height:28px; space-between`:
- close: 28x28 circle, `border:2px solid rgba(255,242,249,.16); background:#2a1220`, `ti-x` 13px `#ff8fc0`
- gems: `ti-diamond` 21px `#ffc41f` + Baloo 2 800 23px `#ffc41f`, gap 9

**Title row** `margin:32px 25px 0`, gap 17: "You" Baloo 2 800 **38px** `#fff2f9`; then the rank pill
`padding:10px 14px; border-radius:999px; background:rgba(226,74,140,.32); color:#fd58a2; Baloo 2 800 18px`.

**Rank card** `margin:29px 22px 0; height:95px; border-radius:20px; background:#241020; border:3px solid #160510;`
`box-shadow:0 8px 0 #160510; padding:0 17px 0 20px`:
- icon tile 45x45 `border-radius:15px; background:#3a0822`, `ti-compass` 26px `#f0559b`, self-centred
- body `margin-left:26px; margin-top:21px; gap:19px`: name Baloo 2 800 24px + right-aligned "260 to go"
  Jost 700 15px `#c79ab4`; bar `height:11px; radius:999px; background:#190913`, fill `#ff5da8` at 81%

**Six rows** — all `height:78px; border-radius:20px; border:3px solid #160510; box-shadow:0 8px 0 #160510;`
`padding:0 22px 0 27px`; icon 38px `flex:none`; body `margin-left:13px; gap:2px`; title Baloo 2 800 23px
`#fff2f9` `line-height:1.05`; sub Jost 600 15px `rgba(255,242,249,.82)`; `ti-chevron-right` 24px
`rgba(255,242,249,.66)`. Top margins in order: **21, 18, 18, 18, 17**.

| row | background | icon | icon colour | sub (register only) |
|---|---|---|---|---|
| Profile | `#932b69` | `ti-user` | `#f75ba4` | wake 7:30 · language |
| Sound | `#924f31` | `ti-volume` | `#ef912c` | voice · beds · rewards |
| Data | `#2f7660` | `ti-shield-check` | `#3fd98e` | snapshot · 12d ago |
| Guidance | `#2c6392` | `ti-compass` | `#46b0ef` | light |
| Rest mode | `#673999` | `ti-moon` | `#a86ff0` | streaks held |

**Advanced row** `margin:18px 22px 0; height:74px; border-radius:22px; background:transparent;`
`border:3px dashed rgba(190,158,190,.5); padding:0 22px 0 28px` — `ti-flask` 28px `#a97ff0`,
"Advanced" Baloo 2 800 19px `#c9b2c9`, `ti-chevron-down` 24px. **This is the one dashed edge in the design and
it is deliberate** (it marks the expandable dev drawer) — do not "fix" it to a solid border.

**Tail spacer** 124px. **Bottom fade** `left:2; right:2; bottom:0; height:150px;`
`linear-gradient(to top, rgba(13,5,15,.94) 30%, transparent); pointer-events:none`.
**Home puck** `left:13px; bottom:25px; 64x64; border-radius:50%; border:2.5px solid #160510; background:#241534`,
`ti-home` 27px `#ff4fa0`; press `translateY(2px)`.

## Wiring
Each row opens the app's EXISTING surface for that concern (Profile, Sound → the v1318 settings card, Data,
Guidance, Rest mode, Advanced). Do not build new rooms. The sub-lines are register placeholders — where the app
can supply the real value (wake time, guidance level, snapshot age) use it; otherwise keep it honest, and all
copy goes through the gates.

## OPEN FOR DAVID
The gear currently opens **The Vital** (the virtue ladder with levels). That surface is not deleted by this
port, only unhooked from this door. Ask him: should The Vital live behind one of the six rows, move somewhere
else, or be retired?

---

# ADDENDUM — authored numbers pulled from `design_handoff_home_screen/README.md` (2026-08-20)

Pulled complete (`truncated:false`). This is the handoff David wrote for the 2c home. Authoritative values:

**The home zone's own box:** `[data-z="home"]` is `min-height:874px; flex column; padding:42px 20px 0`.
So the streak header's top inside the home zone is **42px** — that is the authored gap between the top of the
home zone and the strip. **Gate it.** (Measured in the app today: strip top 95px from the viewport at the home
landing, on both the idle and night faces.) The top HUD is an OVERLAY outside the scroller, so it does not
push the strip down; the 42px is the whole budget.

**Element values, authored:**
| element | authored |
|---|---|
| streak pills | 13px tall; `#36b3f0 #ffc41f #ff4fa0 #2e1a28 #2e1a28`; icon row 17px, spent `#5a3f55` |
| both strip rows | `perspective:520px; transform-style:preserve-3d` (for the sweep) |
| date kicker | Jost 800 15px, letter-spacing 6px, `#cdb3cf` |
| **the stone** | **198px** `#ff4fa0`, halo `0 0 0 12px rgba(255,79,160,.09), 0 0 70px rgba(255,79,160,.28)`, play glyph 58px `#2a0d1c` |
| "What now?" | Baloo 2 800 36px `#fff2f9` |
| sub-line | 700 16px `#a487a0` |
| planner pill | `#8a5cf0`, `0 4px 0 #4e2f96`, Baloo 2 800 16.5px `#f3ecff` |
| practice tiles | 50px squares, radius 18-20, sticker `0 4px 0 <deep>` |
| TOOLS hint | 9px 800, 2px tracking, `#8a6d85`; fades over the first 110px of downward travel |
| home puck | 64px `#ff4fa0`, ink border, `0 5px 0 #160510`, bottom-left |

## THE STRONGEST CANDIDATE FOR "PROPORTIONS ARE OFF"
The design's stone is **198px**. The app deliberately renders it at **180px** — its own gate says so:
`"180x180px (the frame's 198px disc at scale .91), the same on every viewport"` (app.js, `designAudit`).

**Someone applied a 0.91 shrink to ONE element.** If the rest of the column was not shrunk by the same 0.91,
then the app's home is not the design's home scaled — it is the design's home with a smaller circle in it, and
every ratio around that circle is wrong BY CONSTRUCTION, on every phone. That is exactly what David is
describing, and it is invisible to the audit because the gate was written to expect 180.

**Do not just change 180 to 198 and ship it.** Establish first, by measurement, whether the whole 2c column was
authored against a scaled-down copy of the frame (in which case 180 is correct and consistent and the gate is
right) or whether only the disc was scaled (in which case the column is internally inconsistent). Compare
several authored values above — the 13px pills, the 36px headline, the 16.5px pill text, the 50px tiles —
against what the app actually renders at 402x874. **If those match the frame 1:1 while the stone is at 0.91,
the stone is the odd one out and that is the bug.** Report the full comparison table before changing anything.

## STILL OPEN
The README also records that the JOURNEY zone's look is explicitly unfinished ("i need to fix the journey
look... going up from home to journey doesnt work and gets stuck") — David's own note at handoff, and the same
symptom he reported on device 2026-08-20 (item I). That confirms item I is a KNOWN, deferred design gap, not a
regression this codebase introduced. He is redesigning the journey now.
