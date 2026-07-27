# Alter — Design Handoff Notes (verbatim from David, 2026-07-27, via Alfred session)
Last updated: 2026-07-27. For whoever is building (Claude Code): this tells you WHICH design in each exploration file is canonical and what interaction contracts to honor. Everything follows the Alter Design System (`_ds/…202b0364…`); its guide is the law for color/type/borders/motion.

## Canonical designs (build these)

### 1. Activity Picker — `Activity Picker.dc.html`, option **18a** (top section)
The canonical "What's next?" flow, one phone, fully clickable. Everything below 18a in the file is superseded exploration — do NOT build turns 1–17.

**Flow:** domain wall (folders) → folder sheet → Arranger.

**Wall + sheet footer contract (important):**
- The wall footer and sheet footer are byte-identical in metrics and content — opening/closing a folder must not shift ANYTHING at the bottom. Panel padding `11px 22px 0`, action bar `10px 22px 28px`.
- Footer = queue icon strip + (when a pick is focused) tune panel + action bar.
- Queue icons: 40px coins; chains render as deck bubbles (2 peeking cards behind). Label under each icon is the pick's NAME (truncated ~58px), not the time. ✕ removal badge on each icon (deleteStyle default = "x on icon"; "trash button" variant keeps a trash in the panel instead).
- Tapping a queue icon focuses it → tune panel: header row (name + "for how long?" hint + big time on the right — no icon coin, the ringed queue icon is the identifier), scrolling length rail with right fade + chevron, Priority + Steps buttons.
- **Priority button shows its value** when set ("Must"/"Should"), "Priority" only when unset. Same in Arranger blocks.
- **Chains are first-class picks**: same panel; their rail scales ALL steps proportionally (scale/base); hint reads "for how long? scales every step"; Steps shows the scaled step readout (read-only rows), not "Add a step". Panel coin identity for chains = gold `#ffc41f` + `ti-stack-2`.
- Action bar: kicker + label ("Tap what you feel like" / "One thing" + name / "ON YOUR PLATE / 3 things · 3h05" — never a → list of names), primary = Add to today (1 pick) / Arrange (2+). No clear-X in the bar.
- wallPanel default = **"minimizes"**: footer collapses to just the action bar; a small centered chevron tab at the TOP of the footer (above queue icons) toggles it. Chevron points up when minimized, down when expanded.

**Arranger contract:**
- Hour-first gutter on the left (big hour numeral, dash when same hour), gap 15px from bubbles, gutter width 38px.
- Uniform-height candy-striped bubbles (duration is NOT encoded in height — deliberate).
- **Whole bubble is the drag handle**: press + pull >6px reorders (no visible drag line); a clean tap toggles expand. Tapping bubble B while A is open closes A and opens B in one tap.
- Expanded bubble: pink ring, chevron flips (collapsed = up, expanded = down), in-place panel with length rail, Priority/Steps (activities) or step readout + "Adjust steps & timing" link (chains), trash.
- Footer: Save (saves as **chain** — no chain/day fork, see "Whole days" below) + Start.

### 2. Session Editor — `Session Editor.dc.html`, option **2b** (with 4a = same editor from empty)
The stack/session editor ("chosen option 2b" per the DS app-screen template). Candy-striped step blocks with length INSIDE each block (scrolling strip + fade/chevron, never a stepper), categorized Add-a-block tools, footer = Save icon + gear + Start on the plum background (no dark divider). 4a is 2b starting from an empty list. Turns 1–3 are superseded.
- PENDING backport (designed in 18a, not yet applied here): drag-anywhere reorder, priority-shows-value, chevron direction. Don't block on it; 18a's Arranger is the reference for those behaviors.

## Tweak defaults (user-chosen, saved)
- `wallPanel: "minimizes"`
- `deleteStyle: "x on icon"`

## Decided in words (not yet mocked)
- **Whole days do NOT belong in What's next.** They're absolute-time day templates. They live at: (1) "Plan my day" empty-morning state (day chips), (2) week planner (deal day-cards onto weekdays), (3) "save this day" at evening review. Remove/ignore the Whole-days folder concept in the picker. Days may CONTAIN chains (activity → chain → day ladder).
- Arranger Save = save-as-chain only.

## Discarded (do not build)
- Bubbles sized proportionally to duration (uniform height won).
- Drag line / grab handle at bubble bottom (whole bubble drags now).
- Time labels under queue icons (names won).
- Repeated icon coin + name→name→name listing in footers (redundancy purge).
- Turn-22 "tile empties into the list" stack fan-out (deck-with-shards won — see DS guide "The stack is a deck").

## Next design work (in flight)
1. "Adjust steps & timing" per-step editor (chains link to it from the Arranger) — will land in Session Editor.
2. The player (Start → doing screen).
3. Plan-my-day / week painter / evening review (whole-day layer).
