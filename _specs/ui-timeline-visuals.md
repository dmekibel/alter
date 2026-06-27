# SPEC — UI: timeline visual asks (FRAGILE)

**Slug:** `ui-timeline-visuals` · **Source:** `GRAND-AUDIT-2026-06-26.md` (UI/UX + Nav partial sections) · **Date:** 2026-06-27

> ⚠️ **EVERY feature in this cluster touches `calendarView()` (`app.js` ~2173–2330) and the now-line / straddle / match render. This is the FRAGILE region — core navigation + day-render has been rebuilt 3× (v488/v496/v501) and the zoom-bounce / now-line-disappear bugs all live here.** Flag ALL of these as **HIGH RISK**. Build them one at a time, ship+device-confirm each before the next. Never run two day-nav models at once.

## Ground rules carried into every spec below (LOCKED — from CLAUDE.md + HANDOFF-visual-redesign-2026-06-27.md)
- Palette: deep berry/wine bg (day `#280b19`, night `#1f1939`) + the real `DOM` domain colors (`app.js:249`). Bubbles always **darker** than the now-line. **NO neon / glow / shine / `.foil` / `.shine` / white surfaces / colored outline-glow / crystal/diamond.**
- The **pink now-line (`#ff5fa8`) is the BRIGHTEST thing on screen.** Nothing else may out-glow it. This directly tensions against asks #1 (color the line by activity) and #3 (future bubble *glows*) — see each spec for how to honor both.
- One activity at a time. Reward-never-shame. Full-screen, low-clutter (rail/separators/frames already stripped — do not reintroduce).
- Reuse helpers: `add()` / `el()` / `DOM` / `mixHex(a,b,t)` / `esc()` / `fmt()` / `dur` / `hm()` / `blocks()` / `logs()` / `save()` / `topFor(m)` / `degrade(card)` / `place()` / `tiIcon()` / `domainOf()` / `activeTimers()` / `matchedSpan()`.
- The render runs at **arbitrary zoom** (`HP = pullHourPx`, 20–520). Every height/threshold must be expressed against `HP` or it bounces on pinch. The pinch **live-reflow** (`liveReflowCal`, `app.js:641`) and **commit** (`zoomCommit`, `app.js:670`) re-run the same geometry — any height rule you add must produce the **same** result in both, or you reintroduce the zoom-bounce.

## Key code map (current line numbers, v561)
| What | Where |
|---|---|
| `calendarView(L,k,showNow,noHead)` — the whole day render | `app.js:2173` |
| now-line + circle + readout block | `app.js:2200` (one long line) |
| `DOM` domain colors (`c`/`light`/`dark`/`ink`/`ti`) | `app.js:249–259` |
| plan-bubble render (sched/cele/ghost/future/straddle) | `app.js:2219–2329` |
| `_straddle` definition | `app.js:2231` |
| straddle render (tracking vs not-tracking) | `app.js:2250–2266` |
| partial-match overlay (`matchseg`) | `app.js:2267–2273` |
| `matchedSpan(b,dom)` helper | `app.js:2335` |
| real-lane + LIVE timer bubble render | `app.js:2336–2390` |
| `place(card,mins,durv,lane)` | `app.js:2208` |
| `degrade()` → `degradeCard()` height thresholds | `app.js:2210`, `app.js:639` |
| right-rail chips (thin bars) | `app.js:2435–2437` (commit), `app.js:643–648` (live) |
| `nowRightBand` (Y-band the readout occupies) | `app.js:2193`, set `app.js:2200` |
| CSS: `.nowline` / `.nowcirc` / `.nowread` | `index.html:566–575` (active set; `343–344` is the older/overridden set) |
| CSS: `.calblk` / `.matchseg` / `.convbar` family | `index.html:506–574` |
| zoom var `pullHourPx` | `app.js:626` |
| live pinch reflow / commit (must stay geometry-identical) | `app.js:641`, `app.js:670` |

---

## Feature 1 — Past bubbles physically connected to now-line while tracking; now-line colors by current activity

**(1) Ask** (`GRAND-AUDIT-2026-06-26.md:446`): *"the past bubbles ae pysicallly connectedd to the now line because u are trackiing"* · ▫️ med · asked ×3. Plus: now-line colors by current activity.

**(2) Buildable?** **Partial → mostly already built; the spec is "finish + reconcile the color contradiction."**
- *Connected:* already done. When tracking on-plan, the straddle path draws `_seg` (`.matchseg`) from `_tsm` (tracking start) to `now`, left `26px` right `4px`, `border-radius: _R _R 0 0`, `border-bottom:none` — i.e. the tracked stretch runs **up to the now-line as one continuous bar with no gap** (`app.js:2258–2259`). The live-timer fallback bubble grows start→now and stays behind the line (`app.js:2338`, `2346`). So "physically connected" is **shipped**; the remaining gap is only the unplanned/off-plan case (see Approach) and a device-confirm.
- *Color contradiction (the real work):* David asked this BOTH ways. (a) here: "now-line is the activity color." (b) later (`audit:848`, `HANDOFF`): "**Present line stays original pink; color signified only in the left circle**." (b) is the **newer, locked** decision and the now-line is the brightest-thing anchor. So the line stays pink; the **circle** carries the activity color. **This is already the current state** (`app.js:2200`: `nl.borderTopColor="#ff5fa8"` + `nc.style.background=_lc`). The audit's "contradiction" is resolved in favor of pink-line. **Do not color the line.**

**(3) Approach.**
1. **Honor the resolved decision:** leave the now-line pink (`#ff5fa8`), keep the circle = activity color (`_lc`). No change to the line color. (If a build-agent is tempted by ask-text 1a, STOP — the later ask wins.)
2. **Close the only real gap — connect the past bar to the now-line when tracking UNPLANNED / off-plan (not just on-plan).** Today the continuous-up-to-now bar is only drawn inside the `_straddle` on-plan branch and the live-timer bubble. When you're tracking something with **no matching plan** (drift or an unplanned activity), the live bubble (`app.js:2338`, real-lane `else` branch `2381`) already spans start→now and sits in the **right lane** (`left:calc(50%+4px)`). Confirm on device that it visually reaches the now-line with no gap; the existing `it.e = Math.max(s, logicalNowMin())` (`app.js:2338`) guarantees the bottom == now. **Likely no code change — this is a device-confirm + a 1-line tweak only if a gap shows** (the live bubble height is `(it.e-it.s)/60*HP - 2`, `app.js:2346`; the `-2` margin is the only gap; if David wants it flush to the line, drop the `-2` on the live timer only).
3. **Make the connection legible at the join:** ensure the now-circle sits visually *on* the top edge of the connected bar. Circle top is `_ny - 8` (`app.js:2200`), bar bottom is `topFor(now)` — already coincident. No change.

**(4) Code pointers.** now-line: `app.js:2200`. straddle connected seg: `app.js:2258–2259`. live-timer bubble: `app.js:2338`, `2346`, `2381–2386`. CSS join: `.nowcirc` `index.html:568`, `.matchseg` `index.html:525`.

**(5) UI (locked palette).**
```
                         ── on the deep wine/navy sky ──
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ← deep berry striped bar (the tracked stretch), darker than the line
  ▓▓ 🎯 Deep work ✓ ▓▓     borderTopColor pink ──┐
●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← PINK now-line (brightest), no gap above
↑ circle = focus-blue (activity color), holds the activity icon
                                    🎯 Deep work · 0:42  ← pink-ish readout on the right
```
The bar's bottom edge **touches** the pink line; the activity-blue circle straddles the join on the left.

**(6) Data.** None. No schema change.

**(7) Region.** now-line block + straddle + real-timer render. **Heavy overlap with Features 2, 3, 5** — they all edit the same ~130-line span (`2200–2266`, `2338–2386`). **These four should be built by ONE agent in sequence, not in parallel.**

**(8) Effort.** **S** (mostly confirm; ≤1-line tweak).

**(9) Risks.** LOW code-risk but HIGH regression-surface (it's in the fragile block). Risk = a build-agent "fixing" the contradiction by coloring the line → breaks the brightest-thing rule and the v561 lock. Pinning note: **do not touch `nl.style.borderTopColor`.** Device-confirm the no-gap join on iPhone (synthetic preview lies about exact pixel seams).

---

## Feature 2 — Future bubble glows when live tracking starts matching it (alive only in tracker)

**(1) Ask** (`GRAND-AUDIT-2026-06-26.md:450`): *"when the time tracking starts matching the future bubble, then the future bubble can start glowing because you're bringing it into the present"* · ▫️ med.

**(2) Buildable?** **Partial → yes, with the glow re-expressed as a NON-neon "coming alive" state** (literal glow is banned; translate to a brightening/lift that respects "darker than the now-line").

**(3) Approach.** The trigger: the live activity's domain == an upcoming/straddling plan block's domain, AND the now-line is approaching/entering that block. Today the straddle on-plan branch already lights the *crossed* part. The NEW state is the **anticipation**: the still-future plan bubble that the live timer is *about to* reach should visibly "wake up."
- Compute, per future plan bubble in the loop (`app.js:2219` `_bsorted.forEach`): `var _liveDom = _liveT ? domainOf(_liveT) : null;` (the live activity, already captured at `app.js:2214` as `_liveT`). A future bubble is "coming alive" when `_liveT && domainOf(b)===_liveDom && bs > now && (bs - now) <= APPROACH` where `APPROACH = 20` (minutes; matches the existing `planActiveNow` ±20 window at `app.js:331`).
- **Render the alive state WITHOUT glow:** lift the future bubble out of its dimmed/`opacity` treatment (`app.js:2246–2248`) to **full opacity + full deep-stripe** (use the *done* stripe mix `.62/.73` instead of the future `.74/.82`), and add a 1px inset domain-light hairline (`box-shadow: inset 0 0 0 1px <mixHex(D.c,'#160510',.4)>`) — a "charging up" look, not a halo. Add class `coming-alive` for an optional gentle scale breathe via CSS keyframe (subtle, no glow). The activity color reads as *brighter fill*, never as emitted light.
- **"alive only in tracker":** gate the whole state on `showNow && k===todayK() && _liveT` (already the only context where `_liveT` is non-null — `app.js:2214`). Outside the tracker context it renders as a normal future bubble. ✅ satisfies the parenthetical.

**(4) Code pointers.** Add the branch inside the future/else block at `app.js:2246–2248` (where `_ahead`/opacity is set). `_liveT` already exists at `app.js:2214`. Keyframe goes in `index.html` near `.calblk.celepop` (`index.html:520`) / `@keyframes celePop`. CSS class `.calblk.coming-alive`.

**(5) UI (locked palette).**
```
  ░░░░░░░░░░░░  normal future bubble (dim, .74/.82 stripes, opacity ~.8)
  ▓▓▓▓▓▓▓▓▓▓▓▓  ← future bubble of the CURRENTLY-TRACKED domain, ~15min ahead:
  ▓▓ 🎯 Deep work ▓▓   full opacity, brighter .62/.73 stripes, 1px domain hairline,
  ▓▓▓▓▓▓▓▓▓▓▓▓      a slow breathe — "you're about to reach me." NO halo, still < now-line.
●━━━━━━━━━━━━━━━━  pink now-line (still the brightest)
```

**(6) Data.** None.

**(7) Region.** Plan-bubble future/else branch (`app.js:2246–2248`) inside `calendarView`. Overlaps Features 1/3/5.

**(8) Effort.** **M** (new branch + CSS keyframe + restraint to keep it non-neon; needs device taste-check with David since he's "gone back and forth on bubble brightness" — HANDOFF open-issue 5).

**(9) Risks.** HIGH-RISK region. Specific traps: (a) **glow temptation** — any `box-shadow:0 0 Npx <color>` or `filter:drop-shadow` violates the lock and out-glows the now-line → use fill/opacity/hairline only. (b) The breathe animation must NOT change layout height (`transform: scale` on the inner `.cn` or a `::after`, not on `top/height`) or it bounces the scroll/zoom. (c) Must produce identical geometry in `liveReflowCal` (`app.js:641`) and commit (`app.js:670`) — but since this is a class+opacity change, not a height change, it's safe IF you don't touch height. **Confirm with David before shipping** (brightness is contested).

---

## Feature 3 — Minimum render size for small activities + clever zoom-out packing in correct order (never dots)

**(1) Ask** (`GRAND-AUDIT-2026-06-26.md:454`): *"we should have a minimum rendering size for an activity so if its 30 seconds u should still see it from afar as a certain minimum size... a system of keeping them visible in a clever way in the correct order as u zoom out"* · ▫️ med.

**(2) Buildable?** **Partial → yes.** Half exists (a 5px height floor at `place()` `app.js:2208`, and thin bars demote to the right rail in time order). The missing guarantee: at far zoom-out a 30-second activity collapses below visibility, and the rail is a separate surface (David wants them *in the timeline*, "in the correct order," "never dots").

**(3) Approach.** Two parts — the floor, and the packing.

**3a. Minimum render size (the floor).** Today bars use TRUE time-height with a low 5px floor (`place()`: `Math.max(5, durv/60*HP - 4)`, `app.js:2208`; live timer floor 0, `app.js:2346`; future/straddle use the same formula). At low `HP`, a 30s activity → sub-pixel → invisible. Introduce a single shared **`MINBAR`** constant (e.g. `12`px) and apply it everywhere a height is computed in `calendarView`:
- `place()` `app.js:2208`: `Math.max(MINBAR, durv/60*HP - 4)`.
- straddle ghost/seg `app.js:2255`, `2258`; partial `app.js:2268`; real-log `app.js:2347`; live timer `app.js:2346` (keep live's grow-from-zero feel by flooring only once it has any elapsed time, e.g. `it.e>it.s ? Math.max(MINBAR,…) : 0`).
- **Critical:** the floor MUST be applied in BOTH the commit render and `liveReflowCal` (`app.js:641`) identically, else pinch bounces. `degradeCard` thresholds (`app.js:639`: `<9 lbl-s`, `<22 lbl-i`, `<42 lbl-c`) already assume px height — a MINBAR of 12 lands every bar at ≥`lbl-i` (icon-only), which is exactly "see it from afar as a min size, icon not text."

**3b. Clever packing in correct order (the hard part).** A naive floor makes adjacent tiny bars **overlap** when their true gap < MINBAR. Replace the right-rail demotion with **in-timeline stacking that preserves chronological order**:
- After laying out plan bars (and again for real bars), run a pass that detects when bar *N*'s floored top is above bar *N-1*'s floored bottom (overlap created by the floor). Push bar *N* down to `prevBottom + GAP` (a "min-gap reflow," same idea as the existing `preview()`/`reflow` collapse logic at `app.js:2217`). This keeps them as **real bubbles in time order**, never dots, never a separate rail.
- Reserve the right rail ONLY as the deep-zoom fallback when the stack would exceed the viewport (optional; can be dropped — David prefers them in-line). The cleanest v1: **remove the rail demotion for the floored-but-fits case** and lean on the min-gap reflow.
- "Correct order" is already guaranteed by `_bsorted` (`app.js:2219`) and `acts` time-sort; just don't let the floor break it.

**(4) Code pointers.** `place()` `app.js:2208`; height formulas `app.js:2255/2258/2268/2346/2347`; `degradeCard` `app.js:639`; rail push `app.js:2241`, `2355`; rail render `app.js:2435–2437`; live reflow mirror `app.js:641`. Add `MINBAR` near `pullHourPx` (`app.js:626`) or top of `calendarView`.

**(5) UI (locked palette).**
```
zoomed OUT, three back-to-back 30s activities — NOT dots, NOT a rail:
  ▣ 🏃   ← each floored to MINBAR (~12px), icon-only (lbl-i), domain-tinted deep fill
  ▣ 🍎      min-gap reflow nudges each down so they read in time order, no overlap
  ▣ 🎯
●━━━━━━  now-line
```

**(6) Data.** None.

**(7) Region.** `place()` + every height formula + degrade + rail, across BOTH plan and real loops + the live-reflow mirror. **Widest-blast-radius feature in the cluster.** Touches more of `calendarView` than any other; if multiple agents run, this one must own the height/geometry edits exclusively.

**(8) Effort.** **L** (a floor is S, but the order-preserving min-gap pack + keeping commit/live-reflow geometry-identical at all zooms is the L; this is the exact class of change that caused 3 prior rebuilds).

**(9) Risks.** **HIGHEST in the cluster.** (a) **Zoom-bounce**: any height/floor that differs between `place()`/commit and `liveReflowCal` (`app.js:641`) snaps on pinch-release — the #1 historical bug. Apply MINBAR in BOTH, byte-identically. (b) The min-gap reflow must not fight the existing day-nav (`_paging`, the continuous scroll) — purely vertical within a section, never reposition across the day boundary. (c) Don't reintroduce overlap that the `place()` "true height + margin" design deliberately prevents (`app.js:2208` comment). (d) The live timer's "grow from zero" feel (`app.js:2346`) must survive the floor — floor only when `elapsed>0`. **Build behind a quick on/off so it can be reverted in one ship if it bounces on device.**

---

## Feature 4 — Present line removes text rather than covers it

**(1) Ask** (`GRAND-AUDIT-2026-06-26.md:486`): *"if the present line is in front of text better remove the text all together than to have it covered by a line"* · small.

**(2) Buildable?** **Yes.** Today collision is handled by *dodging* (the `nowRightBand` reserves a Y-band so rail chips move out of the way, `app.js:2193/2200`; live card grows upward). But there's **no rule that deletes a bubble's label when the pink line crosses it.** That's the literal ask.

**(3) Approach.** When the now-line Y (`_ny`, `app.js:2200`) falls within a bubble's vertical extent, and the label row would render *under* the line, **drop that bubble's text** (keep the bubble + icon, lose the title). The cleanest hook: the straddle bubble (`_straddle`, `app.js:2231`) already represents the only block the line crosses on `today`. For that crossed block, suppress the `.cn` title text when the line sits over the label band:
- In the straddle branch, if the bubble's content row Y-range intersects `[_ny-LINEHALF, _ny+LINEHALF]` (LINEHALF ≈ 8px to cover the 4px line + its shadow), set the `.cn` to **icon-only** (drop the `<span class="cn-t">…title…</span>`), or add a class `.line-crossed` that `index.html` styles as `.line-crossed .cn-t{display:none}`. The icon + the right-side `nowread` already say what it is, so no info is lost.
- Generalize lightly: any bar whose label baseline lands within the line band gets `.line-crossed`. Compute against `card.style.top + labelOffset` vs `_ny`. Keep it cheap (inline-style math, no `getBoundingClientRect` in the render loop — that forces layout and is banned in the hot path).

**(4) Code pointers.** now-line `_ny` `app.js:2200`; straddle `.cn` `app.js:2275–2277`; existing dodge band `nowRightBand` `app.js:2193`. CSS: add `.calblk.line-crossed .cn-t{display:none}` near `.calblk .cn` (`index.html:512`). `.cn-t` is the existing title span (used throughout, e.g. `app.js:2277`).

**(5) UI (locked palette).**
```
before:   ▓▓ 🎯 Deep wo██████ ▓▓   ← pink line slicing through the title (bad)
●━━━━━━━━━━━━━━━━━━━━━
after:    ▓▓ 🎯 ▓▓              ← title removed, icon kept; readout on the right names it
●━━━━━━━━━━━━━━━━━━━━━  🎯 Deep work · 0:42
```

**(6) Data.** None.

**(7) Region.** now-line + straddle label render (`app.js:2200`, `2275–2277`). Overlaps Features 1/2/5.

**(8) Effort.** **S**.

**(9) Risks.** Med (in the fragile block). (a) Don't call `getBoundingClientRect` per-bar in the loop — use the inline `top`/`height` numbers already on the card to test against `_ny`. (b) Removing the title must not change the bubble's *height* (height is time-driven, not content-driven — `place()` `app.js:2208` — so it's safe; just verify `.cn` isn't what sizes the box). (c) Keep the icon so a zoomed-out crossed bubble doesn't become an anonymous block.

---

## Feature 5 (bonus, same span — resolve before building 1) — Present line stays pink; color signified only in the left circle

**(1) Ask** (`GRAND-AUDIT-2026-06-26.md:848`): *"Present line stays original pink; color signified only in the left circle."* · small · **already shipped.**

**(2) Buildable?** **Already built / DONE.** `app.js:2200`: line `borderTopColor="#ff5fa8"` + boxShadow pink; circle `nc.style.background=_lc` (activity color). HANDOFF confirms this is the locked decision.

**(3) Approach.** **No build.** Listed here only to hard-stop any agent that reads Feature 1's older ask-text ("now line is the activity color") and tries to color the line. **Feature 5 overrides Feature 1's color clause.** Leave the line pink.

**(7) Region / (8) Effort / (9) Risk.** n/a — verification-only. Effort S (a glance). Risk: an agent un-does it.

---

## Build order (single agent, sequential — they share ~130 lines)
1. **Feature 5 check** (confirm line stays pink) — 1 min, prevents the most common mistake.
2. **Feature 1** (S) — confirm connected + no-gap on device.
3. **Feature 4** (S) — remove-text-under-line.
4. **Feature 2** (M) — coming-alive future bubble (confirm brightness with David).
5. **Feature 3** (L) — min render size + order-preserving pack (build last, behind a revert switch; it's the bounce-risk one).

**Ship loop each step:** `bash _dev/preship.sh` → commit → push → hand David the `/fresh.html` link. **Label every one DEVICE-UNTESTED for gesture/zoom feel** until confirmed on his iPhone (synthetic preview lies about pinch/scroll geometry). Re-check the regression contract (CLAUDE.md) after each: continuous vertical scroll across midnight, past=set-in-stone, tap-empty-creates / drag-moves / tap-bubble-edits, week-strip + Now pill track the centered day.
