# PLAYER SETTINGS PORT — Round 24 v2, extracted 2026-08-20

Source: `R24 Player Settings v2.dc.html` (Claude Design project 1e726982), pulled via DesignSync.
**Pull integrity: `truncated: false`, content ends `</html>`.** Complete.
Variants: `player` (no panel) · `panel` (single, no breath) · `panelbreath` (single breathing) · `panelstack` (a stack).

## THE RULE (David's own, verbatim from the canvas)
> All player settings live in one place: the card that drops from the cog, top-right. What's inside the card
> follows what's inside the session — a single-type session gets only its own settings; a **stack** gets the
> whole-stack settings (guide, backdrop — they apply to every segment) plus a section per segment type that
> has its own sound, like breathing. **No separate settings screen.**

This kills the two-doors problem named in the brief: `openVolumePanel` and the app's Sound settings must
converge on this ONE card. The panel's contents are computed from the session's segments, not fixed.

## SCOPES (one skin, three contents)
| variant | title | rows |
|---|---|---|
| single, no breath | **Session** | guide, backdrop |
| single breathing | **Breathing** | guide, backdrop, cue, tone, then VISUAL: visual |
| a stack | **Full stack** | guide, backdrop, then a second **Breathing** block with its own SOUND kicker + cue/tone, then VISUAL |

`E` = the session's hue, and everything in the card is tinted by it: teal `#2ab8c4` for a breathing session,
the stack's element hue otherwise (the frame renders `#ff9a3a`).

## EXACT VALUES (402x874 artboard, absolute px)

**Scrim** `rgba(18,8,24,.52)`, z 38. **Card** z 40, `top:156px; right:14px; width:322px`,
`background:#221126; border:3px solid #160510; border-radius:22px;`
`box-shadow:0 6px 0 #160510, 0 18px 40px rgba(0,0,0,.5); padding:13px 14px 15px;` column, `gap:13px`.
`transform-origin: calc(100% - 18px) -10px; animation: psCog .28s var(--ease-spring) both`
where `psCog` is `0% scale(.72) opacity 0 · 60% scale(1.02) · 100% scale(1) opacity 1`.
**Notch** (points at the cog): `right:13px; top:-11px; 16x16; background:#221126;`
`border-left:3px solid #160510; border-top:3px solid #160510; border-radius:3px 2px 0 2px; transform:rotate(45deg)`.

**Scope title** Baloo 2 800 18px `#efeaff`, `line-height:1; margin-bottom:-4px`.
**Kicker** ("SOUND" / "VISUAL") 10.5px 800, `letter-spacing:1.8px`, `#bcb0e8`, `margin-bottom:-3px`.
**Row label** `flex:none; width:52px; padding-top:9px; font-size:11px; font-weight:700; color:#7d6d92` — left column, TOP aligned.
Row = `display:flex; align-items:flex-start; gap:10px`, right side `flex:1; column; gap:10px`.

**Chip, selected:** `background:E` + `repeating-linear-gradient(115deg, rgba(255,255,255,.28) 0 13px, transparent 13px 26px)`,
`border:2.5px solid #160510; box-shadow:0 3px 0 #160510`, plus a leading `ti ti-check` in `#160510`
(13px on the big voice chips, 11.5px on beds, 11px on breath chips).
**Chip, unselected:** `background: color-mix(in oklab, E 10%, transparent); border:2px solid color-mix(in oklab, E 55%, transparent)`.
**Chip text:** 800; **13.5px** big / **11.5px** small; `color: sel ? #160510 : color-mix(in oklab, #fff 68%, E)`.
**Chip box:** `min-height 36 (big) / 30`, `padding 0 12 (big) / 0 8`, `border-radius:11px`, `gap:4px`, big chips `flex:1`.
Press state: `translateY(2px)` + `box-shadow:0 1px 0 #160510` (breath/bed chips `translateY(1px)`).

**Volume slider** (guide and backdrop EACH get their own): icon `ti-volume` 15px `#7d6d92`, `gap:8px`, row margin `2px 4px 4px 0`.
Track `height:9px; border-radius:6px; background:rgba(255,255,255,.09)`.
Fill `width:PCT%; border-radius:6px; background:linear-gradient(90deg, color-mix(in oklab,#fff 35%,E), E)`.
Knob `20x20; border-radius:50%; background:E; border:2.5px solid #160510; box-shadow:0 2px 0 #160510; translate(-50%,-50%)`.
Frame values: guide 62%, backdrop 34%.

**Backdrop chip field** — a THREE-ROW horizontally scrolling grid:
`overflow-x:auto; scrollbar-width:none; display:grid; grid-auto-flow:column; grid-template-rows:repeat(3, 30px);`
`gap:6px; justify-content:start; padding-right:20px;`
`mask-image:linear-gradient(90deg, #000 calc(100% - 26px), transparent)` (+ `-webkit-`).
Trailing affordance: `ti-chevron-right` at `right:-3px; top:50%; translateY(-50%); font-size:14px; color:#7d6d92; pointer-events:none`.
**NOTE:** the app's dose rail learned `overflow-y:hidden; touch-action:pan-x` in v1313 for exactly this shape — apply it here too or the field will scroll vertically under a finger.

**Footer** `display:flex; gap:9px; margin-top:3px`, both children `flex:1; min-height:42px; border-radius:14px`.
- **save as default** — `ti-pin` 15px, `background:rgba(255,255,255,.05); border:2.5px solid #4b3a56; color:#cbb8d6; 800 13px`.
- **done** — `background:E; border:2.5px solid #160510; box-shadow:0 4px 0 #160510; color:#160510; 800 14px`; press `translateY(3px)` + `0 1px 0 #160510`.

## MAPS 1:1 ONTO WHAT EXISTS — build these
- **guide voice**: Dave / Millie chips = the EN banks. Mid-session swap already re-voices the sounding line (v1305).
- **cue**: `bell · gong · wood · off` = the app's `bell/gong/woodblock/off` (v1306).
- **tone**: `glide · chord · ocean · off` = the app's tone keys (v1306).
- **visual**: `orb · wave` = `BREATH_VIZ` (v1313 wired it into the composed player).
- **guide volume** = the existing session volume.
- The panel replaces `openVolumePanel` + `breathControls`' current stacked rows; both doors converge here.

## TWO THINGS THE APP DOES NOT HAVE — DAVID MUST DECIDE, DO NOT SILENTLY BUILD OR SKIP

### 1. BACKDROP is a whole new feature, not a settings row
Twelve named ambient beds with their own volume: `off · peaceful · mysterious · forest · rain · ocean ·
fireplace · wind · stream · birdsong · crickets · thunder`. **The app has no ambient bed system and no audio
for one.** This is a feature round, not a panel port. Options, cheapest first:
- **(a) Port the panel now WITHOUT backdrop**, and do beds as their own round. The card's other rows are all
  wired-up today, so this ships the redesign immediately. **Recommended.**
- **(b) Synthesize the beds in Web Audio**, as the cue sets already are (no new assets). Honest for
  `rain · ocean · wind · stream · fireplace · thunder · crickets` (filtered/shaped noise). Weak for
  `forest · birdsong` and musical for `peaceful · mysterious` — those really want samples.
- **(c) Ship real audio files.** Best sounding, adds binary assets to a repo that has none for this, and each
  bed must loop seamlessly.
Note David's standing rule: no ElevenLabs generation for now — that is about SPEECH, so it does not by itself
rule out (b) or (c), but the call is his.

### 2. "save as default" implies a two-level settings model
Today every setting is global the moment it is touched. The frame separates **this session's** settings from
**saved defaults**, which means per-session overrides that do NOT persist unless pinned. That is a state-shape
change (and a SCHEMA bump + MIG if it lands in `alter_plan2`). Needs his verdict on the semantics:
does "done" discard the session's overrides, or keep them for this session only and forget them after?

## OPEN, MINOR
- The frame's player has NO close X in the panel state and the cog handler PAUSES playback when opened
  (the disc glyph flips to play behind the panel). Confirm that pause-on-open is wanted.
- The frame draws the segment story-bar with 8 segments at `top:64px; left/right:13px; gap:8px`, bar
  `height:9px; border-radius:5px`, icon 19px, column gap 10px — compare against the shipped bar before
  changing anything there; this round is the PANEL.
