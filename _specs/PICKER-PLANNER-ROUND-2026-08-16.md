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

## H. DEV TIME-SIM · a reset, and the dev panel is ugly
David 2026-08-20: *"I need a method for bringing the time back to what it is now. So whenever I use the dev tools, I need a method of resetting. Also, the dev tools looks kind of ugly. Maybe we can make it a little bit more user friendly."*
1. **Reset to real time.** `DEV.hour(v)` / the dev panel's sim-time control set `devSimMin()`; there is no visible way back to the wall clock. Add an explicit reset (and make the panel show, plainly, that a simulated time is ACTIVE — a silent override is how David lost an evening thinking the sim was broken).
2. **Make the dev panel presentable.** Not a redesign round: bring it to the app's own component language (chunky chips, domain hues, Tabler icons, no emoji) so it stops reading as scaffolding. Keep every existing control.

**NOT a bug, and worth recording so it is not re-investigated:** David reported "I simulated evening and the circle is still pink." `nowMin()` DOES honour `devSimMin()`, so the sim reaches the face selector. The night face is gated on `ln >= bedHour() * 60 || ln < DAYSTART + 60` (app.js `grep -n 'id: "night"'`) — i.e. **after BEDTIME, not "evening"**. Simulating 20:00 with a 23:00 bedtime correctly yields the pink idle face. If David wants an evening face distinct from both day and night, that is a NEW state and a design decision, not a fix.

## I. BUG (HIGH) · scrolling up into the journey sticks, then the magnet drags you back to home
David 2026-08-20: *"Scrolling up to the journey works, but then it gets stuck, and you're not able to scroll anymore, and then it kind of naturally scrolls you back down to home as you try to scroll up. So it's kinda broken in that regard."*

Region: `@SEC:WORLD-MOTION` (the one-page world's spring/magnet) plus the sky zone. **Reproduce before fixing.**

The magnet's above-home branch (`wSnapIntent`, exposed as `DEV.wIntent`) reads, in substance:
- `if (d < -w.clientHeight) return null;` — more than ONE viewport above home = free scroll, magnet off.
- otherwise `return (_wStartTop > hy + 40 || -d < w.clientHeight * 0.45) ? hy : wSkyY();`

**Leading hypothesis: the trail is shorter than the escape distance.** `#jpTrail` is adopted into `#tfWorldSky` at full height, so the sky zone is as tall as the trail. If the trail is shorter than ~one viewport (few journey nodes, or a short day), the scroller can never reach `d < -clientHeight`, so the magnet NEVER releases — every upward gesture ends in `hy` and you are dragged back to home. That reproduces all three of his symptoms at once: it scrolls, it stops, it returns.

**Second candidate:** the sky zone is materialized by `#trackerFull.tf-onepage.tf-onehome #tfWorld > .tfw-sky{ display:block }` over a `display:contents` default — if the class combination lapses, or the trail is adopted while the zone is still `display:contents`, the zone contributes no height and the same starvation occurs.

**Reproduction plan:** measure `wSkyY()`, `wHomeY()`, `#tfWorldSky.offsetHeight`, `#jpTrail.offsetHeight`, `#tfWorld.scrollHeight` and `clientHeight` at the home landing, with BOTH a short trail (few nodes) and a long one (`DEV.seedDay` / a day with many nodes). Then sweep `DEV.wIntent` across the above-home range and print what it returns at each offset. The fix follows the measurement: if the escape threshold is unreachable for short trails, the release condition must key off the sky zone's REAL height rather than a fixed viewport, and the journey must be reachable to its top in every case.

Regression contract: item 1 (vertical scroll flows continuously, no snap-back bounce) is exactly what this violates. Re-verify all four after any change, and remember the preview lies about scroll — a programmatic `scrollTop` fires no scroll event, so verify the ENGINE with the pure-decision probe (`DEV.wIntent`), never by watching landings.

## J. BUG · the dose ladder opens at scrollLeft 0, hiding the chip that is already selected
David 2026-08-20: *"In the home, if you press the Morning Stack, right now for me it's selected at thirty minutes, but you can't see it because it scrolled all the way to the right. So if something is selected, make it visible. You have to scroll to the spot of selection so the user doesn't wonder where it's at."*

The exact complement of item G. G made `tbxDoseScroll()` PRESERVE `scrollLeft` across `tbxRepaintDose`, which is right for a repaint — but on the FIRST open there is no saved position, so the row starts at 0 and a dose late in the ladder (30m, 45m) sits off the right edge with nothing visibly selected.

Fix: when the dose card is built and no scroll position is being restored, scroll the row so the SELECTED chip is in view. Centre it if the row can scroll that far, otherwise clamp to the ends (a chip near either end must not leave dead space). Do not fight the G restore — restore wins when there is a saved position, this only fills the first-open case. Same rule applies to both dose cards now that the non-2c one was unified in v1317.
Keep the v1313 axis lock (`overflow-y:hidden; touch-action:pan-x`) intact.

## K. CHANGE · kill the app-wide background music, and the quit sound effect
David 2026-08-20: *"please get rid of the background sound when using the regular app, and that sound effect when you quit the app."*

Two separate things, both currently ON by default:
1. **APP BACKGROUND MUSIC** (`grep -n "APP BACKGROUND MUSIC" app.js`, added 2026-07-01): the peaceful pad drifting under the WHOLE app at a low level, auto-pausing when a player opens, routed into `_bgBus`. Its toggle lives in the new settings card's APP block (`grep -n "App background music" app.js`). David wants it gone as an ambient default — it is NOT the same thing as a session's backdrop bed, which he likes and which stays. Decide with him whether to (a) default it OFF and keep the toggle, or (b) delete the feature. **Default OFF is the smaller, reversible move and is the recommendation** — his words are "get rid of the background sound when using the REGULAR app", i.e. outside sessions, which default-off achieves without destroying a feature he may want later.
2. **THE QUIT SOUND EFFECT** — `sfx()` (`grep -n "function sfx" app.js`) already self-guards inside a session (`if (document.getElementById("breatheOv")) return;`) and honours `S.audio.sfx === false`. Find the one fired on leaving/closing the app or the player and remove that call specifically. Do not blanket-disable `sfx()` — other cues (charge, completion) may be wanted; David named only the quit sound.

Both are audio defaults, so verify by measurement (no live source on `_bgBus` outside a session; no sfx call on the quit path), and note that FEEL cannot be judged in the preview.

## L. SESSION EDITOR · a dead grip line, no press-and-hold reorder, and a duration the rail cannot show
David 2026-08-20, in "Adjust steps & timing" on the Morning Stack.

**L1 — the fake stretch handle.** *"each of the activities has that little line in the middle on the bottom that represents ability to make it stretch, but it can't stretch. So get rid of that little middle line."*
It is `.sed-grip` — `add(face, "span", "sed-grip")` (app.js) and a `32x4px` bar at `bottom:6px; left:50%` (index.html). It affords a drag that does not exist. **Delete both.**

**L2 — press-and-hold to reorder.** *"you should be able to change the order just by pressing and holding one of them, which should make it kind of float up a little bit towards you, and then you should be able to reorder them in a convenient manner."*
Long-press lifts the row (scale/shadow toward the viewer), then drag to reorder. Reuse the app's existing drag grammar rather than inventing a third: the planner's GESTURE-OWNS-THE-DOM rule, and the v1317 Arrange drag (transform on the row's own column, node lists cached at pointerdown, no per-frame DOM queries, no full repaint). Hold duration should match the app's menu-open hold (`BLK_HOLD_EDIT_MS`, 480ms) rather than the 820ms charge-ritual holds.

**L3 — a step's real duration is not on the rail. THIS IS A BUG v1318 CREATED.** *"I click on Visualization, which is four minutes, but then the timing of the visualization doesn't show four minutes anywhere. That's not even one of the options."*
`SED_DURS = [0.5, 1, 1.5, 2, 3, 5, 8, 10, 15]` — **4 is not in it.** v1318's `tbxEditSeed` scales the track to the live dose and apportions the remainder onto "the editor's half-minute grid" by largest remainder, which can land on values (4, 2.5, 3.5, 6...) that have no chip. So the row genuinely holds 4 minutes and the rail shows nothing selected.
**Fix by showing the truth, not by changing his content:** when a step's duration is not on the rail, insert it as a chip in sorted position and mark it selected. Do NOT snap the step to the nearest rail value — that silently rewrites a timing the dose apportionment computed. Verify with a dose that produces an off-rail value (the Morning Stack at the dose David is on) and report the rail before and after.

## M. BREATHING · the counter reads as part of the sentence, and the bar is now too long
David 2026-08-20, correcting v1319 (which did exactly what he asked, and the result taught him something better):
*"when it says 'breathe in 1' it looks like it's saying breathe in ONE SECOND, instead of 'breathe in' and this is how many seconds are left. So having the numbers right next to the text doesn't make sense. Place it below the text. And make the bar less wide — not as narrow as before, but less wide."*

1. **Move the counter OFF the headline's line.** v1319 put it beside the headline (`.bw-lrow`, 20px beside the 28px headline standalone / 16px beside 21px in the composed player). Beside the phase word it parses as one phrase — "Breathe in one" — which is the opposite of what it means. Put it on its own line BELOW the headline, so the word is a word and the number is a number. Keep it visually subordinate to the headline, and keep the `display:none` hide (not `visibility`) so a non-breath segment leaves the headline properly centred.
2. **Bar width: between the two.** It was 96px before v1319 and is now `min(70vw,288px)` = 281.4px at 402, which reads too long. Target roughly **200px** at the 402 artboard — clearly longer than the old 96 but not full width. **Use fixed artboard px, not vw** (see HOME-PROPORTIONS-AND-YOU-MENU §1: vw/vh inside a fixed artboard is the failure class that just cost a round). Make it a named constant so it is one-number tunable on device.
Measure and report the bar's width and the counter's position relative to the headline, before and after, on BOTH the standalone tool and the composed player.
