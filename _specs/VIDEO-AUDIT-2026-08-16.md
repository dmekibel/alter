# Video audit — IMG_4061.MP4, 92s on David's 440x956 device, v1306 (2026-08-16)

Method: 92 frames at 1fps + targeted high-res pulls at 45 / 63 / 72 / 87s, via `_dev/video-audit/`.
Every claim below is either visible in a named frame or verified against the code. Where I could not
establish a cause without reproducing it, I say so instead of guessing.

David's ask: "there is some bugs and stuff and its not the most convenient to use... prescribe what can be
fixed or improved to make using the app a lot more convenient and make it not broken and work as intended."

---

## THE SESSION HE RECORDED
Splash (day 1) → home → planner → tool grid "What next?" → adds Puzzle 30m, Deep work 30m via Play/Focus
sheets → block editor → adds Breakfast, Research, Tidy via the plate → Arrange → Start → tracks Puzzle for
30 seconds → tools shelf → activity picker → The Vital. A complete core loop. Good news first: **the loop
works end to end.** Nothing crashed, nothing hung, every surface rendered. What follows is fidelity and friction.

---

# A. BROKEN — fix these first

## A1. Two identical 30-minute blocks render at wildly different heights
**Evidence:** frame 72.0s. `Puzzle` (30m, tracked) draws ~250px tall. `Tidy` (30m, planned) draws ~85px,
directly beneath it. Same duration, 3x the height. Worse at frame 63.0s: the Puzzle block fills the ENTIRE
viewport top to bottom, pushing the whole day off screen. It shrinks again by 72s.

**Why it matters:** while you are tracking — the app's core action — you cannot see your day. The one block
you already know about eats the screen.

**A1 AND A2 ARE THE SAME BUG.** Traced in code (not yet reproduced on device — say so when reporting):
`computeFlow` is innocent, it sizes purely by duration. But when N blocks share one start minute it emits N
knots AT THAT SAME MINUTE, each `+MINFLOOR` (100px) in Y. The live bubble's height is
`flowSpan(_fk, mn, nowF - mn)` (app.js:3021), which reads straight across all of them. Five stacked blocks =
500px of flow at a single minute = the block that ate the screen. Fix the stacking and the giant block goes
with it.

## A2. Everything piles onto the now-line — a MIDNIGHT bug, not a general one
**Evidence:** frames 9s and 13-15s. Puzzle at 23:30. Deep work also 23:30 (editor: "23:30 · 30m · 23:30-0:00").
By 41s five blocks are piled there. He recorded at 23:51.

**Cause (code-traced):** two things meet. `markFutureBlock` pushes any block dropped in the past forward to
now — correct, you cannot plan the past. Then `reflow` sequences overlapping blocks with
`s = Math.max(_bs, cur)` — also correct — but ends with **`s = Math.min(1410, s)`** (app.js:13805), which caps
every start at 23:30. During the day this never fires and blocks sequence perfectly (14:00, 14:30, 15:00).
At 23:51 there are 30 minutes left, so the clamp lands every block on 23:30 on top of each other.

**The design question this opens, for David:** the logical day runs 4am→4am, so at 23:51 there are really
four more hours. Should a block pushed past midnight
  (a) stay in tonight's logical day, drawn below 23:xx — correct, and needs the timeline to run in window
      (4am→4am) minutes rather than raw 0-1439 clock minutes: `computeFlow`, `reflow`, and ~4 draw sites; or
  (b) move to tomorrow's date key — no coordinate change, but it disappears off the bottom of tonight; or
  (c) refuse, and the picker says "no room left today".
(a) is right and is the one I recommend, but it is the timeline regression zone (rebuilt 3x) and cannot be
device-tested from here, so it is his call, not mine.

---

# B. CONFUSING — reads as broken even where the code is right

## B3. The hour gutter has no am/pm
**Evidence:** frame 63s reads `2 4 6 8 10`; frame 72s reads `4 9 2 7 12`.
I first read the second one as scrambled. It is not — it is 4am, 9am, 2pm, 7pm, 12am at a 5-hour interval on
the 4am→4am window, and it is monotonic. But on a 12-hour clock with no meridiem you cannot tell morning
from night at a glance, and the interval changes with zoom so the axis never looks the same twice.
**Move:** print the meridiem, or switch the gutter to 24h. One-line change, large legibility win.

## B4. The week strip's empty state is indistinguishable from a failed render
**Evidence:** frame 45s — five identical grey bars over five identical grey rings, no letters, no icons.
Verified in the DOM: six `.tf-hb` columns, each a `.tf-hb-bar` with `.tf-hb-fill` at `width: 0px` and a
generic `ti ti-circle`. So it is correct-and-empty, not broken. It just looks broken.
**Move:** give day one something to look at — day initials in the bars, or today's ring accented.

## B5. The primary button changes identity based on how many things you picked
**Evidence:** at 1 item the pink primary reads "Add to today · 30 min" (frames 7-8s, 24-26s). At 2+ items the
SAME button becomes "Arrange" (frames 28-31s). Two different destinations, one button position.
**Move:** keep "Add to today" as the primary always, and let "Arrange" be a separate, persistent affordance
on the plate. A primary action should not silently change what it does.

## B6. Activity-picker chips clip mid-word
**Evidence:** frame 87s — "Stret", "Cycl", "Cook", "Eat h", "G", "Th" all cut at the right edge.
This is intentional: `.bento-card.bento-sheet .bento-cat .bento-chips` is a 2-row horizontally-scrolling
grid with a 22px fade mask (index.html:1125-1128), and it overrides the flex-wrap rule at index.html:3357.
So the row scrolls. But with four columns nearly filling the width, the fade lands mid-word and reads as
clipped text rather than "there is more this way".
**Move:** either wrap (let the later flex rule win in this context) or size the columns so the cut always
falls between chips, never inside a word.

## B7. "on your plate / nothing yet - tap what you feel like" is the wrong label for a staging area
It persists under a grid where you have already been tapping, and the plate's contents ("Puzzle · 30m",
then "2 things · 1h") replace it only after a pick. The line reads like a status that is not updating.

---

# C. INCONVENIENT — the friction David is feeling

## C8. Three taps to add one activity (corrected — I first counted five)
Observed: family tile → activity → "Add to today". The duration chip is pre-set to 30m and he accepted 30m
every single time, so it costs no tap. Three taps x five activities = 15, plus Arrange and Start.
That is not egregious, and the plate/Arrange flow is sound. **No change recommended here** — the friction
David felt is much more likely A1/A2 (the timeline looking wrong after every add) than the tap count.

## C9. The tracking screen's furniture moves between states
Frames 49s / 54s / 57s / 58s put the timer disc at very different heights, and at 57s there is no disc at
all. Some of this is the one-page world scroll and is legitimate. **Device-untested whether it reads as
jumpy in the hand** — worth one look while tracking.

---

# RECOMMENDED ORDER
1. **A2** (append instead of stacking at now) — smallest change, biggest cleanup of the planner.
2. **A1** (live block uses the flow map) — the actual "broken" one.
3. **C8** (one-tap add) — the convenience complaint, directly.
4. **B3 + B4 + B5** — three small legibility fixes in one pass.
5. **B6** — after B5, since both live in the picker.

Everything here is planner/picker work and does not touch the Phase-2 garden or the Phase-3 journey.
