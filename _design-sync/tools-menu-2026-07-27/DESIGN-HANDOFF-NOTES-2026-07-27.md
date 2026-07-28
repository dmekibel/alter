# Alter — Design Handoff Notes
Last updated: 2026-07-28 (FIX PASS 2 — build screenshots from 11:42 still violate the ink/sticker laws; verbatim CSS now included. STOP WRITING YOUR OWN VALUES — paste these). Design system guide (`_ds/…202b0364…`) is the law; when this doc and the guide conflict, the guide wins.

---

## 🔴 FIX PASS 2 (2026-07-28) — copy-paste CSS. Do not improvise.

Reviewed: the live "What's next?" wall and the live player. Same violations as FIX PASS 1 are STILL in the build (white icons on hue, soft hue-glow shadows, zero ink borders) plus new player ones. Every rule below is literal CSS from the reference DCs — paste it, don't restyle it.

### A. Domain folder tile (wall) — the build renders full-saturated hue slabs with white line icons. Wrong twice.
```css
/* tile shell — NIGHT washed 12% with the hue, never a full hue face */
.folder-tile { background: color-mix(in srgb, var(--hue) 12%, #241022); border: 3px solid #160510; border-radius: 15px; box-shadow: 0 4px 0 #160510; padding: 10px; }
/* inside: 2×2 mini fanned sheets. Each mini sheet FACE is the hue: */
.mini-sheet { background: linear-gradient(100deg, color-mix(in srgb, var(--hue) 82%, #fff) 0%, var(--hue) 60%); border: 2.5px solid #160510; border-radius: 11px; box-shadow: 0 3px 0 #160510; }
.mini-sheet .ti { color: #160510; } /* ICON IS INK. Never white, never a tint. */
/* name centered UNDER the tile, in the hue: */
.folder-name { font: 800 15px 'Baloo 2'; color: var(--hue); text-align: center; }
```
No `filter: drop-shadow`, no `box-shadow: 0 0 40px <hue>` blooms anywhere on the wall.

### B. Player disc, live — the build shows a dark disc with a thin hue ring. Canonical (2a):
```css
/* live disc = the domain's candy stripes, ink edge, halo ring */
.disc-live { width: 214px; height: 214px; border-radius: 50%; border: 3px solid #160510; box-shadow: 0 0 0 7px #2a1730; background: repeating-linear-gradient(115deg, var(--hue) 0 13px, color-mix(in srgb, var(--hue) 78%, #fff) 13px 26px); }
.disc-live .ti { color: #160510; font-size: 56px; } /* activity glyph in INK */
/* progress ring floods clockwise in green #28cf86 with a #fff2f9 arc-head dot */
```

### C. Title pill under the disc — build: muddy brown fill + orange text. Canonical:
```css
.title-pill { background: linear-gradient(100deg, color-mix(in srgb, var(--hue) 80%, #fff), var(--hue)); color: #160510; border: 2.5px solid #160510; border-radius: 16px; box-shadow: 0 5px 0 #160510; font: 800 19px 'Baloo 2'; padding: 9px 18px; }
```

### D. There is NO "Stop" button. While live, tools swap for the doors (2a):
- **Done** — solid green `#28cf86`, 54px tall, `2.5px solid #160510`, `0 5px 0 #160510`, ink text.
- **Pause** / **Replan** — ghost: `2.5px solid #4b2a44` on `rgba(255,242,249,.05)`, text `#e8c7d8`. No fill, no bloom.
The gray-lavender full-width "Stop" bar and the still-visible tool grid during a live session are both wrong — live mode hides the tool deck.

### E. Tool deck tiles (idle home only) — shards are right, faces are wrong:
face card = hue face (100° gradient as in A) with **ink glyph**, `2.5px solid #160510`, `0 4px 0 #160510`; name under it in its own hue. White icons + borderless soft-shadow cards = redo.

### F. Global grep-and-kill list
- `color: #fff` / `color: white` on any element sitting on a hue fill → `#160510`.
- `box-shadow` containing `px` blur under cards/tiles/buttons → hard `0 Npx 0 #160510` per the press ladder (chips 3 / tiles 4 / buttons 5 / stone 7).
- borders in a hue on resting elements → `#160510` (hue border = selection only).
- Acceptance check: screenshot any screen, desaturate it — every element must still show a dark outline and a hard offset shadow. If it looks like soft neon blobs, it fails.

---

## ⚠️ FIX PASS 1 — the build has drifted. Correct ALL of these.

Reviewed screenshots: the "What next?" domain wall and the "Build a stack" editor. Both violate core laws. Fix list, in order of egregiousness:

### 1. BORDERS ARE INK, ALWAYS. `#160510`, 2.5–3px.
The build wraps every domain card in a **colored outline of its own hue** (orange card = orange border, etc). WRONG. Alter's one law: bold dark ink borders on everything. The hue lives in the FILL (a 12% wash on tiles, a full candy face on coins), never in the border. No exceptions — a hue-colored border is only ever a *selection* state (choice-row v3), never a resting card.

### 2. SHADOWS ARE STICKERS, NOT GLOWS.
Cards/tiles/buttons: hard offset, no blur — `0 4px 0 #160510` (tiles), `0 5px 0 #160510` (buttons), `0 6px 0` (cards). The build uses soft colored glows under the domain cards and a big pink bloom under Start. Kill them. Soft glow exists ONLY on the editor's big color slabs (`0 7px 18px rgba(0,0,0,.45), 0 0 28px <hue>/46%` ON TOP of a 3px ink edge + `0 5px 0 #160510` bar) — never on chrome, never without the ink edge.

### 3. INK ON A HUE.
Glyphs/text printed on a saturated fill are **ink `#160510`** (or `#fff2f9` with a dark drop-shadow for editor tool coins) — NEVER a lighter tint of the same hue. The wall's mini coins draw orange line-icons on orange coins: unreadable and off-brand. Mini icons on hue coins → `#fff2f9` + `drop-shadow(0 1.5px 0 rgba(0,0,0,.28))`, or ink.

### 4. FOLDER TILES ARE 2×2 FANNED MINI-SHEETS, NO COUNT.
Canonical (18a + DS "Folder tiles"): tile = `--tile-night` washed ~12% with the domain hue, 3px ink border, sticker shadow, a **2×2 grid of mini fanned sheet tiles** (each mini = tiny sheet with 1–2 shards peeking, its real activity identity), the domain name centered UNDER in its hue. The build shows 2×3 flat coin grids, name inside bottom-left, and a **count badge (14, 23…)** — remove counts entirely, they're data slop and not in the design.

### 5. STRIPES = IGNITION ONLY.
The editor's empty-state slabs ("Nothing in it yet", "Add a block") wear 45° stripes while idle. Stripes mean a hue is LIVE (selected/running). Idle dashed surfaces are flat: `rgba(255,95,168,.06)` fill, `4.5px dashed #ff4fa0` border, subtle `0 0 24px rgba(255,79,160,.28)` at most. Also: ONE dashed slab, not two — the empty list state IS the "Add a block" button (2b/4a reference: single dashed row "＋ Add a step"). Delete the separate "Nothing in it yet" slab.

### 6. THE FOOTER CONTRACT (ActionBar / RunBar).
- **Wall footer**: kicker line in 10px/800/1.4px-tracked caps (`TAP WHAT YOU FEEL LIKE` in `#96637e`) + a 17px Baloo label under it — NOT a giant white sentence. Primary = **`#ff4fa0`** (never desaturated maroon `#a83a6b`-ish), `2.5px solid #160510` border, sticker shadow, ink text `#160510` or `#2a0d1c`. Verb: **Arrange** (2+ picks) / **Add to today** (1 pick).
- **Editor footer (RunBar)**: Save + gear = ghost squares `2.5px solid #4b2a44` on `rgba(255,242,249,.05)` (the build's borderless gray squares are wrong), Start = pink with ink border + sticker shadow, ink text. No bloom.

### 7. PRESS LADDER.
Every pressable: shadow collapses to `0 1px 0` + translateY(depth−1px) on :active. The build has no press states.

### 8. COPY.
Header should read **"What's next?"** (guardian voice, sentence case), kicker `3H 30M OPEN · AFTER DEEP WORK` is correct as-is. Never add counts/stats the design doesn't show.

### 9. Missing icon on the "one nostril" tool coin — every coin gets its Tabler glyph (`ti-lungs`-family; no empty coins).

### Reference implementations (read these, copy values verbatim)
- `Activity Picker.dc.html` section `18a` — wall tiles, folder sheet, footer panel, Arranger.
- `Session Editor.dc.html` sections `2b`/`5a` — editor blocks, dashed add-block, categorized tray, RunBar.
- DS bundle components: `DomainBento`, `StackMark`, `ActionBar`, `RunBar`, `StepBlock` — prefer mounting these over hand-rolling.

---

## Canonical designs (build these)

### 1. Activity Picker — `Activity Picker.dc.html`, option **18a** (top section)
The canonical "What's next?" flow, one phone, fully clickable. Turns 1–17 are superseded exploration — do NOT build them.

**Flow:** domain wall (folders) → folder sheet → Arranger.

**Wall + sheet footer contract:**
- Wall footer and sheet footer are byte-identical — opening/closing a folder must not shift ANYTHING. Panel padding `11px 22px 0`, action bar `10px 22px 28px`.
- Footer = queue icon strip + (when a pick is focused) tune panel + action bar.
- Queue icons: 40px coins; chains render as deck bubbles (2 peeking cards). Label under each icon = the pick's NAME (truncated ~58px). ✕ removal badge on each icon.
- Tapping a queue icon → tune panel: name + "for how long?" + big time right-aligned, scrolling length rail with right fade + chevron, Priority + Steps buttons.
- **Priority button shows its value** ("Must"/"Should") when set.
- **Chains are first-class picks**: rail scales ALL steps proportionally; Steps shows the scaled read-only step list. Chain coin identity = gold `#ffc41f` + `ti-stack-2`.
- Action bar label: "Tap what you feel like" / "One thing" + name / "ON YOUR PLATE · 3 things · 3h05" — never a list of names. No clear-X in the bar.
- wallPanel default = "minimizes": chevron tab centered at the TOP of the footer; points up when minimized, down when expanded.

**Arranger contract:**
- Hour-first gutter left (big hour numeral, dash when same hour), gutter 38px, gap 15px.
- Uniform-height candy-striped bubbles (duration NOT encoded in height — deliberate). Block gap 16px.
- **Whole bubble is the drag handle**: press + pull >6px reorders; clean tap toggles expand; tapping bubble B while A is open swaps them in one tap. NO grip line, NO arrows.
- Expanded: pink ring, chevron collapsed=up / expanded=down, in-place rail + Priority/Steps (activities) or step readout + "Adjust steps & timing" link (chains), trash.
- Footer: Save (saves as **chain**, no chain/day fork) + Start.

### 2. Session Editor — `Session Editor.dc.html`, options **2b** (editor) / **4a** (same, from empty) / **5a** (entered from the plan: gold "SAVED CHAIN" kicker, live total, Save + **Done** instead of Start)
Candy-striped step blocks, length INSIDE each block (scrolling strip + fade/chevron, never a stepper), categorized Add-a-block tray, RunBar footer. Blocks drag anywhere to reorder (same as Arranger). blockShadow default = "glow + sticker" (ink edge + `0 5px 0` bar + hue glow).

### 3. Player / Home — `Player.dc.html`, option **2a**
Home IS the player. Idle: HUD (clock left, gold gems right), thin story pills + glyph row, **214px flat disc** (breathing; wears the NEXT block's hue when something is planned — play starts that thing; pink only when nothing is planned — then play opens the picker), "What now?", "next: Deep work · 5:30", purple Plan-my-day pill, toolbox = fanned deck tiles with names in their own hue. THE CONVERSION on tap: disc → domain stripes + activity icon, ring floods clockwise (green, white arc-head dot), "What now?" → title pill, big elapsed, one sub-line ("on plan · 23m left · ends 5:30"), tools swap for doors (solid green Done 54px + ghost Pause/Replan). Done → burst ("+18 spark") → re-prime to next. Pause = gold, "held · streak safe". Never shame copy.

## Tweak defaults (user-chosen)
- `wallPanel: "minimizes"` · `deleteStyle: "x on icon"` · `blockShadow: "glow + sticker"`

## Decided in words (not yet mocked)
- **Whole days do NOT belong in What's next** — they live at Plan-my-day empty state, week planner, evening review. Days may contain chains (activity → chain → day).
- Arranger Save = save-as-chain only.

## Discarded (do not build)
- Duration-proportional bubble heights; grip lines / up-down arrows; time labels under queue icons; repeated icon coin in tune panel; name→name→name footer lists; turn-22 tile fan-out; **counts on folder tiles; hue-colored card borders; glow-only shadows; stripes on idle surfaces** (see FIX PASS).

## Next design work
1. Save-as-chain moment (naming + celebration).
2. Plan-my-day / week painter / evening review.
3. Drift → re-entry nudge.
