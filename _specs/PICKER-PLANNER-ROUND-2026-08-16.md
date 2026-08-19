# Picker + planner round — David's device notes, 2026-08-16

Queued behind the in-flight four-bug build (one writer on app.js at a time). Six items. Three are bugs, three
are changes he has decided. Nothing here is a design question except where marked.

---

## A. BUG · two added activities stack on the same minute, and dragging does not unstack them
David: *"in the planner, when you add two activities, they still stack one on top of the other, which should
never happen. Even when you try to take one and move it down, they still stack one on top of the other."*

**Not yet root-caused. Reproduce FIRST.** What is already ruled out or known:
- `markFutureBlock` does NOT set `pin`, so "they are pinned rocks reflow refuses to move" is disproven.
- Within ONE picker session, `pkArrTimes` lays the queue end-to-end from `gapStart`, so a multi-select add
  should already sequence. The stack is therefore more likely across TWO separate picker sessions.
- `pkOpen`'s occupied-minute snap (shipped v1308) walks `at` forward past any covering block, but it bails via
  `if (!_e || _e >= 1410) break;` — so it does NOT help in the last half hour of the day.
- `reflow`'s flex loop ends with **`s = Math.min(1410, s)`** (documented in VIDEO-AUDIT-2026-08-16 §A2). Near
  midnight every start clamps to 23:30, which piles blocks AND explains why dragging cannot separate them:
  reflow re-clamps them right back on the next `save()/renderToday()`. **That is the leading hypothesis, and
  it predicts the bug is time-of-day dependent** — David's last two device sessions were both near midnight.
- The still-open design fork behind it (his call, from the video audit): should a block pushed past midnight
  stay in tonight's logical day (needs the timeline in 4am→4am window minutes), move to tomorrow's key, or be
  refused? Fixing A properly may require that verdict.

**Reproduction plan:** add two activities at ~14:00 and at ~23:40 via the same path David used, measure
`blocks(k)` times in both cases, then drag one and re-measure after `reflow`. If 14:00 sequences and 23:40
stacks, the clamp is confirmed and the fix is scoped to the day-edge decision.

## B. CHANGE · the expanded category should collapse after a pick
David: *"in the activity picker, when you select the category, it expands big. And then when you select one of
the activities, it should close the category and show you the full activity picker again."*
Straightforward: picking an activity inside an expanded category returns to the full category grid. Multi-select
across categories still has to work, so the pick must register (ignited tile) before the collapse.

## C. CHANGE · delete the picked-activities footer entirely
David: *"I wanna remove the whole footer where when you click on an activity, it opens up a footer and
visualizes the order of the activities you chose with the settings of the length. I think that's redundant
because after that, there's an Arrange button anyway."*
This is the THIRD time he has cut this surface (see DECISIONS.md 2026-08-16: the "ON YOUR PLATE" tray and the
primary button that morphs into "Arrange"). Delete it, do not shrink it. The Arrange step already shows order
and length, so the footer is the same information twice.

## D. BUG · Arrange lags while dragging, because the time label travels with the item
David: *"when you open up the Arrange button and try to rearrange something, it's lagging, because when you
move an activity, the time on the left moves with it as well."*
The time column should stay PUT while a row is dragged; only the row moves, and times re-resolve on drop.
Suspect a per-frame re-render of the whole arrange list during the drag (`pkPaintArr`). Check for a full
repaint on pointermove and replace with a transform-only drag, per the GESTURE-OWNS-THE-DOM rule already in
the planner region. Measure frame cost before and after.

## E. CHANGE · Arrange must let you push something LATER, timeline-style
David: *"you can't move something into the future. It automatically assumes that you wanna start it the very
next thing, but instead you should be able to move it down, like in the regular timeline, like we used to have
it. So if you click on the topmost thing and start pulling it down, it will push everything below it down."*
Today `pkArrTimes` packs the queue flush from `gapStart` with no gaps, so order is the only thing you can
change. He wants displacement: dragging a row down inserts real time before it and cascades the rest down. The
planner already has this behaviour (the drop-cascade in `calendarView` pushes blocks whose start falls inside
the dropped window). Reuse that grammar rather than inventing a second one.

## F. CHANGE · "Start" becomes "Add to planner"
David: *"the Start button doesn't make sense. It should be Add to the planner instead."*
**Flag, because it is not only a label:** `pkLand(true)` currently AUTO-STARTS tracking when the first block
lands within 5 minutes of now. If the button promises "add to planner", it should add and stop; silently
beginning a session would be the button doing something its label does not say (the same class of complaint as
the primary that morphed into "Arrange"). Recommend: add only, no auto-start. Confirm with David.
Copy goes through the gates; RU dict same edit.

---

## Order to build
D and B are contained. C is a deletion. F is small but needs the auto-start decision. E reuses an existing
grammar. **A is the one with a design fork behind it and must be reproduced before anything is changed** —
it is also the most damaging, since it makes the planner produce a pile that cannot be undone by hand.

## G. CHANGE · the dose row is ONE scrollable ladder, no More button, and selecting must not scroll it
David 2026-08-20: *"if I open up the body stack in the menu, it only offers two time options, two minutes and five minutes, and if you press More it opens up a thing below that offers all the other times. That's not how I designed it. I don't even want a More button. I just want a single row of time options that you can scroll. And if you select one, it doesn't magically jump to the left. It stays in the spot where you selected it."*

Located: the 2c dose card (`grep -n "tbx-dose-foot" app.js`). The face branch builds `(_lad ? TBX_FACE_LADDER : [2, 5])` and, when collapsed, appends a `tbx-more` button that sets `_tfhLadder = true` and repaints. Two fixes:
1. **Always build `TBX_FACE_LADDER`** as one horizontally scrolling row; delete the More button and the `_lad` collapse entirely (the `_tfhLadder` latch and the "a dose chosen off the ladder keeps it open" workaround both become dead). Label stays the compact `m + tr("m")` form the ladder already uses.
2. **Preserve the row's `scrollLeft` across `tbxRepaintDose`.** The chips are built in ladder order so nothing is reordered — the apparent jump is the rebuild resetting scroll to 0, which throws the chosen chip back to the left edge. Capture the rail's scrollLeft before the repaint and restore it after the rebuild.
Note the non-2c `else` branch has the same [2,5]+grid-behind-more shape; check whether it is still reachable and, if it is, make it match rather than leaving two grammars.
Row must keep the v1313 axis lock (`overflow-y:hidden; touch-action:pan-x`).
