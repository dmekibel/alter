# SPEC — UI: night / white / notebook / bento polish  (SLUG: ui-night-polish)

Build-ready specs for the **UI cluster** of `GRAND-AUDIT-2026-06-26.md` (the `### UI / UX / design / palette / art (29)` PARTIAL section). Source of truth = `index.html` (all CSS) + a few JS render points in `app.js`.

## Locked design rules (honor in every section — from `HANDOFF-visual-redesign-2026-06-27.md` + CLAUDE.md)
- Deep **berry/wine** palette. Day sky `#280b19` → night sky `#1f1939`. Ink edge `#160510`. NO white surfaces, NO neon glow, NO `.shine`/`.foil` reflections, NO crystal/diamond.
- **The pink now-line (`#ff5fa0`/`#ff5fa8`) is the BRIGHTEST thing on screen.** Bubbles always sit darker.
- DOM domain colors (`DOM` object, `app.js` ~line 249): move `#ff8a3a`, nourish `#34d39a`, focus `#36b3f0`, create `#b07aff`, connect `#ff5fa0`, play `#ffc83d`, drift `#180608`.
- **The timeline render is FRAGILE** (rebuilt 3×: v488→v496→v501). Any change that touches `calendarView`, the now-line render (`app.js:2200`), `buildPull`, or the day-card paging math is **HIGH RISK** and must be labeled **DEVICE-UNTESTED** in the handoff unless confirmed on David's phone.
- Build in the REAL app, never mockups. Reuse helpers: `add()`, `el()`, `DOM`, `mixHex`, `esc`, `fmt`, `dur`, `hm`, `blocks()`, `logs()`, `save()`.

## CSS-region map (so parallel build-agents don't collide)
`index.html` has **two stacked CSS layers** — the older "powerpuff candy" base (~lines 30–390) and the later **berry override** layer (`!important`, ~lines 415–1160). The berry layer wins. Most of this cluster edits the berry layer; some white-sweep work removes/neutralizes dead base rules. Key anchors:
- **Base candy** `#fff` rules: lines 36, 40, 48, 53, 56, 60, 64, 68, 72, 77, 83, 91, 136, 142, 147, 150, 154, 168, 175, 185.
- **Old (overridden) timeline rules**: `.nowline` 343, `.nowline::before` 344, `.calblk.pin` 232 (yellow), `.calblk.act.onplan` 252 (yellow), `.lanehead` 239.
- **Live berry timeline rules**: `.nowline` 566, `.nowline::before` 567, `.nowcirc` 568, `.nowread` 575, `.calblk .cn` 512, `.calblk.act.onplan` 538.
- **Full-screen cleanup block**: lines 1020–1038 (the `body.tab-day:not(.gaming)` overrides + `.day-stacksep` rebuild).
- **Bento**: `.bento-tiles` 631, `.bchip` 617, `.bchip.sel/.pred` 619–620, `.bento-cat` 612, `.bento-gridwrap` 1156.
- **Notebook**: `notebookSheet()` `app.js:580`, `#notebookBtn` CSS 862 (hidden in tab-day at 972), markup `app.js`/`index.html:1259`.
- **Font load**: `index.html:15` (Jost `wght@500;600;700`), `--bub` var `index.html:20` + redefined `index.html:488`.

---

## 1. Never any white — sweep every white background/paper/near-white  ⟶ audit line 398 (asked ×4)
**Ask (quote):** "Too much white not enough interesting powerpuff colors" / "Never any white — no white backgrounds, paper, or near-white UI".

**Buildable?** YES.

**APPROACH.** The berry override layer already recolors the *primary* app surface, but the base candy CSS still has many literal `background:#fff` / `#ffffff` / `#fff3fb` / `rgba(255,255,255,.5+)` that surface in editor sheets, inputs, checkboxes, faces, bars, qopts, subcats, gtiles. Two-part fix:
1. **Edit the base rules in place** so the default value is already berry — change each literal `#fff`/`#ffffff` to a deep-berry fill and each `rgba(255,255,255,.45–.7)` "paper" wash to `rgba(58,37,64,.07–.12)` (matching the existing `.blk` recess at line 441). This kills white even where no `!important` override exists.
2. **Add one defensive sweep block** at the END of the berry layer (after line 1038) so any future/missed white can't slip through:
```css
/* NO-WHITE SWEEP (David: never any white) — catch-all so no surface paints white */
.scard,.subi,.subcat,.gtile,.qopt,.face,.bar,.ck,.add2,.go,.pchip,
input[type=text],input[type=time]{ background:#3a1226; color:#ffe6f2; }
.ck.on{ background:#34d39a; }            /* keep the success green tick */
.bar i{ /* fill colors are set inline per-domain — leave */ }
```
**Specific literals to convert** (base layer): `#hero .hp` (36), `#hero .chip` (40), `#nowBtn` (48), `.add` (53), `.ck` bg (60), `.add2` (72), `.scard` `#fff3fb` (77), inputs (83), `.pchip` (91), `.subi` (136), `.bar` (142), `.subcat` (150), `.gtile` (154), `.face` `#fff`+`#e3dcf2` border (168), `#nav` `#fff3fb` (175), `.qopt` `#fff`+border (185). Translucent washes: `.meta` .6 (52), `.blk` .55 (56), `.logi` .45 (64), `.hab` .55 (68), `.pfline` .55 (161), `.subpill` .7 (165).

**Palette tokens to use:** card fill `#3a1226` or `#2c081a`; recess wash `rgba(58,37,64,.07)`; text on berry `#ffe6f2`/`#ffd0e6`; border `#160510` (heavy) or `#6a3050` (light, per the edit-sheet at line 97). Match the already-shipped `.edsheet` palette (lines 96–134) — that is the reference "berry surface" look David accepted.

**UI sketch.** Editor inputs, bento search, sheet cards, checkboxes — all read as dark wine cards with `#ffe6f2` text instead of white pills. No white flash anywhere when a sheet opens.

**DATA.** None.

**REGION.** Base candy CSS (30–185) + one new block after 1038. **No JS, no timeline.** Low conflict risk except with §2 (night-mode) which edits the same surfaces — do §1 and §2 together as one pass.

**EFFORT.** M (many small literal swaps; mechanical but must be exhaustive — David asked ×4 and keeps finding remnants).

**RISKS.** (a) The green tick `.ck.on` (`--ok`) and the `.bar i` inline fills must stay colored — don't blanket-darken them. (b) `color:#fff` *text* on dark buttons (e.g. `.done2`, `.go`, `#hero`) is fine — only kill white **backgrounds/surfaces**, keep white/near-white text where it sits on a dark fill. (c) Don't touch `#trackerFull`/`#liveDock` (already berry). Verify by `preview_resize 390x1500` + screenshot and scanning every sheet/editor for a white flash.

---

## 2. Night mode — replace every white with dark, keep cool colors prominent  ⟶ audit line 402 (asked ×3)
**Ask (quote):** "the app still has too much whhite should be more nightmode but keep cool colors".

**Buildable?** PARTIAL → concrete version: this is the same surface set as §1, but with a *cool* (blue-leaning) bias rather than warm berry, echoing David's stated preference (HANDOFF open-issue #2: "looks better with the blue background, everything except the yellows"). It is **not** a toggle (the app has one fixed theme); do not build a toggle.

**APPROACH.** After the §1 sweep, push the *neutral chrome* (sheets, inputs, recesses, page background gaps) a few degrees cooler/bluer so cool domain colors (focus `#36b3f0`, nourish `#34d39a`, create `#b07aff`) pop against it instead of competing with warm maroon. Concretely:
- The standalone gap fill `html{ background-color:#1a1726 }` (line 419) and night sky `#1f1939` are already cool — good. Lean the *sheet/dock* neutrals the same way: where §1 set `#3a1226` (warm berry), allow a cooler variant `#241027`/`#1b1030` for full-background surfaces (matches the `#pullSheet` gradient stops at line 713). Keep the *accent* pink for the now-line and primary buttons.
- Do NOT desaturate the cool domain bubbles — they are the "cool colors kept prominent."

**UI sketch.** Same dark app, but the empty/neutral space reads navy-cool rather than wine-warm, so blue/green/purple activities feel vivid. Pink now-line still brightest.

**DATA.** None.

**REGION.** Same as §1 (base + berry neutral surfaces). **Merge §1 + §2 into one pass — they fight over the same selectors.**

**EFFORT.** S (a tint adjustment riding on §1).

**RISKS.** This overlaps the **batch-1 UI agent** and the visual-redesign handoff's open palette question (#2 "lean bluer"). David has gone back and forth on warm-vs-cool — **show 2 options first** (current warm-berry neutrals vs cooler-navy neutrals) per the design-choice rule; do not silently re-tint the whole app. The bubble/sky palette itself is LOCKED at v561 — only adjust *neutral chrome*, never the sky KF or bubble fills (HIGH RISK if you touch those).

---

## 3. Notebook & pull-down not full-screen; always pullable back up + bottom affordance  ⟶ audit line 462 (asked ×2)
**Ask (quote):** "i don't want the noteebook to be full screen... u can always pull it back up".

**Buildable?** PARTIAL → concrete version. Two distinct surfaces are conflated in the ask:
- **The pull-down timeline** (`#pullSheet`): in tab-day it is intentionally full-bleed-and-always-open (lines 977–981 kill its grab + close), which is the accepted "Today = always-open timeline" model (memory: reuse-pulldown-timeline-as-today). **Do NOT make this one pullable/closable** — that would re-introduce the killed day-nav fight. Leave it.
- **The notebook** (`notebookSheet()` at `app.js:580`): currently a full-screen modal overlay (`.goal-head` card on a backdrop). THIS is what David means. Make it a **non-full-screen bottom panel that you can pull back up**, with a persistent bottom grab affordance.

**APPROACH (notebook only).** Change `notebookSheet()` to render into a bottom-anchored sheet that stops short of full height and leaves a visible "pull up" handle at the bottom edge when collapsed:
- Reuse the existing `#sheet`/`.scard` bottom-sheet machinery (lines 75–79) OR the `#liveDock` `.ld-grab` handle pattern (line 991) for the affordance — don't invent a third sheet system (CLAUDE.md landmine: two menu systems already clash).
- Give the notebook card `max-height:78vh` (not full), `border-radius:22px 22px 0 0`, slide-up from bottom, and a persistent `.nb-grab` bar (`width:36px;height:4px;background:#5a2c44`) at the top of the card; tapping the dimmed area or swiping down collapses to a thin **bottom tab** (e.g. a 38px pill labeled "Notebook ▴") that re-expands on tap — never fully gone.
- Palette: card `linear-gradient(168deg,#2c081a,#1c0512)`, border `#160510`, text `#ffe6f2`. No white.

**UI sketch.**
```
        (dimmed world / timeline visible above)
 ┌─────────────────────────────────┐  ← rounded top, wine gradient
 │            ──── (grab)          │
 │  📓 Notebook                ✕   │
 │  [habits / library content]     │   max 78vh
 └─────────────────────────────────┘
        collapsed →  ┌──────────────┐
                     │ 📓 Notebook ▴ │  ← always-pullable bottom tab
                     └──────────────┘
```

**DATA.** None.

**REGION.** `app.js:580` (`notebookSheet`) + a new CSS block (put near the `#liveDock`/bento sheet CSS, ~line 990, or after the cleanup block 1038). Does NOT touch the timeline render — LOW risk. Overlaps batch-1 UI only if they also touch `notebookSheet`.

**EFFORT.** M.

**RISKS.** Gesture (swipe-to-collapse) is **DEVICE-UNTESTED in preview** — synthetic touch lies (CLAUDE.md verification rule). Ship with the tap-to-collapse/expand path working (preview-verifiable) and label the swipe as device-untested. Do NOT touch `#pullSheet` full-bleed rules (977–981) — that is the regression-contract timeline.

---

## 4. Bento in two columns, with diagonal stripes + shimmer  ⟶ audit line 474 (asked ×3)
**Ask (quote):** "i want bento in two columns like imagge one" + diagonal stripes + shimmer.

**Buildable?** PARTIAL → concrete. Two columns **already exist** (`.bento-tiles{grid-template-columns:1fr 1fr}` line 631; also `.bento-gridwrap` 1156, `.sugrow` 663). The missing piece is **diagonal stripes + shimmer ON the bento tiles** (currently stripes live only on timeline bubbles; `.shine`/`.foil` were globally killed). So: keep two columns, add the **subtle deep diagonal-stripe texture** to bento tiles to match the locked bubble look.

**APPROACH.** Apply the same low-contrast diagonal-stripe treatment the timeline bubbles use (HANDOFF: "subtle deep stripes `mix(c,#160510,.62)/.73`, period 9px/18px") to `.bchip.big` / `.bento-pane` / `.bento-tiles` children:
```css
/* bento tiles get the bubble's subtle deep diagonal texture (David: stripes + shimmer) */
.bento-tiles > *, .bchip.big{
  background-image:repeating-linear-gradient(135deg,
    rgba(0,0,0,.16) 0 9px, rgba(255,255,255,.03) 9px 18px);
}
```
For "shimmer": David **rejected** the bright `.shine`/`.foil` internal reflections (HANDOFF rule). Use a **very subtle GPU sweep** only if he confirms — default to NO shimmer or a barely-there 1-pass sweep at low opacity (`rgba(255,255,255,.06)`), since the locked rule is "no shine/foil." Treat shimmer as an **options-first design choice**: show (a) stripes-only vs (b) stripes + faint sweep, let David pick.

**UI sketch.** Two equal columns of berry tiles, each carrying a faint diagonal weave (same texture as timeline bubbles), domain-colored. Not glossy, not neon.

**DATA.** None.

**REGION.** Bento CSS (612–642, 1156). No JS, no timeline. LOW conflict risk.

**EFFORT.** S.

**RISKS.** Don't reintroduce high-contrast stripes or `.shine` (explicitly rejected). Keep text readable on the texture (HANDOFF: deepen stripes if text gets lost). Confirm the stripe direction/period matches the bubbles so the app feels unified.

---

## 5. Timeline font: bolder, thicker, larger, less formal (Wes Anderson font)  ⟶ audit line 466
**Ask (quote):** "more bold, more readable, more thick, more large. and less formal vibe. Kinda like that Wes Anderson font".

**Buildable?** PARTIAL → concrete. Jost is loaded **only at `wght@500;600;700`** (line 15), and `.calblk .cn` is `font-weight:700; font-size:13.5px` (line 512) — so it's already at Jost's max loaded weight. To go "bolder/thicker" you must either (a) load Jost 800/900, or (b) switch the timeline label face to the rounder, less-formal `Baloo 2` (already loaded at `600;700;800`, line 15) which is more "Wes Anderson playful" than geometric Jost.

**APPROACH (recommend option b, present as a choice).**
- **Option A — heavier Jost:** add `800` to the Google Fonts URL (line 15) and bump `.calblk .cn{font-weight:800; font-size:15px}` (line 512), `.calblk .cn .ti{font-size:16px}` (513).
- **Option B — Baloo 2 for timeline labels (less formal):** set the timeline label family to `var(--bub)` (which at line 20 = "Baloo 2") instead of the Jost default, e.g. `.calblk .cn{font-family:"Baloo 2",sans-serif; font-weight:700; font-size:14.5px}`. Baloo 2 is rounder/chunkier = closer to the "less formal Wes Anderson" vibe.
- Apply the same to `.matchseg`, `.nowread .cn-t`, `.day-stacksep .dss-lab` for consistency, **but** note David **later asked to REMOVE extra letter thickness/shadow** (audit line 468 note) — so do NOT add `text-shadow` or `-webkit-text-stroke`; achieve "thick" via font-weight only.

**UI sketch.** Timeline activity names render in a chunkier, friendlier weight at ~14.5–15px, clearly readable from the zoomed-out 390×1500 view.

**DATA.** None.

**REGION.** `index.html:15` (font URL) + `.calblk .cn` 512–513 + sibling label rules. This sits *inside the timeline* visual layer — **MEDIUM RISK**: a larger label can overflow short bubbles. Test on thin bars.

**EFFORT.** S.

**RISKS.** Bigger text in small bubbles → clipping/overflow (`.calblk` has `overflow:hidden`). Verify min-height bars still show a legible label at 390×1500. This is a **design choice → options-first** (Jost-800 vs Baloo 2). Do NOT add letter-shadow/stroke (David rejected it).

---

## 6. Remove yellow selection outline (and remaining yellow)  ⟶ audit line 470
**Ask (quote):** "certain things are selected with the yellow outline. It looks bad... Get rid of that".

**Buildable?** YES.

**APPROACH.** Selection already moved to a ✓-mark + `.sel` class (no yellow) for chips, but **yellow outlines persist** in several rules. Recolor each to pink (`#ff5fa0`, the accent) or a neutral berry:
- `.calblk.pin` border `rgba(255,210,74,.65)` + `#ffd24a` left-border (line 232) → pink/neutral, e.g. `border-color:#160510; border-left:3px solid #ff5fa0`.
- `.calblk.act.onplan` yellow glow `#ffd24a`/`rgba(255,210,74,.6)` (line 252) — this is the OLD rule, already overridden by the berry rule at line 538 (white-rim-in-own-color). **Delete the dead line 252** to avoid confusion, or null it.
- `.bchip.sel` `box-shadow:0 0 0 3px #ffe3a0` (line 620) and `.bchip.pred` `#ffd54a` (619) → pink: `#ff5fa0` / `#ff8fc0`.
- `.bento-pick.on` `#fff0a0` (641) → pink.
- `.calblk.emptyblk` selection / `.newghost` already pink — fine.

**UI sketch.** Selected/pinned items get a pink ring (matches the now-line accent family) instead of acid yellow.

**DATA.** None.

**REGION.** Old timeline rules (232, 252) + bento (619–620, 641). Editing line 232/252 is in the timeline CSS region but these are *static border/shadow* rules (no layout) → LOW-MEDIUM risk. **Overlaps the HANDOFF open-issue #3 ("the yellows are bad")** and the batch-1 UI agent — coordinate: this section owns *yellow selection/pin/outline*; the play-domain yellow `#ffc83d` rework is a separate palette task (note as overlap, don't double-fix).

**EFFORT.** S.

**RISKS.** Confirm no remaining yellow selection ring anywhere (grep `255,210,74` / `ffd24a` / `ffd54a` / `ffe3a0` / `fff0a0` after editing). Keep `#adhereChip` yellow (line 495) only if it's intentional reward signaling — flag to David; it may be in scope for the "yellows are bad" pass.

---

## 7. Thick now-line with balls on the sides  ⟶ audit line 478
**Ask (quote):** "i like now is thick wit hthe balls on the siides".

**Buildable?** YES.

**APPROACH.** The line is already thick (`border-top:4px` line 566) with ONE ball on the left (`.nowcirc` 568); the second ball (`.nowline::before`) is disabled (567). David wants **balls on BOTH sides**. Re-enable a right-side ball:
- Re-purpose `.nowline::before` (currently `display:none` at 567) as the LEFT ball OR add a `.nowline::after` for the RIGHT ball. Cleaner: keep `.nowcirc` (the icon ball, left) and add `.nowline::after` as the right-edge dot:
```css
.nowline::after{ content:""; position:absolute; right:-2px; top:-5px;
  width:10px; height:10px; border-radius:50%; background:#ff5fa0;
  box-shadow:0 0 8px #ff5fa8; }   /* right-side ball — matches the left now-circle */
```
- Keep the line the brightest element (locked rule) — both balls in the pink accent.

**UI sketch.** `●━━━━━━━━━━━━●` — thick pink rule capped by a ball at each end; left ball carries the activity icon (existing `.nowcirc`), right ball is a small pink dot.

**DATA.** None.

**REGION.** `.nowline` / `.nowline::after` (566–568). **Inside the timeline visual layer — MEDIUM RISK** but pure decoration (no layout/scroll math). The now-line is re-rendered each second by `app.js:2200`; CSS pseudo-elements ride along free (no JS change needed).

**EFFORT.** S.

**RISKS.** A right ball at `right:-2px` could clip if the cal container has tighter overflow — verify it's fully visible (this is the same clipping class of bug as the left circle, fixed at line 568 by pulling it inside the edge). Keep it inside `right:-2px..0`, not negative-large.

---

## 8. Pink "Now" circle fully visible, not cut off by phone edge  ⟶ audit line 482 (asked ×2)
**Ask (quote):** "now is not signified with a pink circle that was good and with text that says now... fully visible, not cut off".

**Buildable?** YES — and largely DONE (line 568 moved `.nowcirc` to `left:2px` "fully visible, no longer clipped", v561). Remaining gap from the audit: the circle shows the **activity ICON** when tracking, and literal **"NOW" text only shows when NOT tracking** (the `np`/`nowtime` branch, `app.js:2200`). David asked for a pink circle **with text that says "now."**

**APPROACH.** Two sub-asks, partly in tension with audit line 490 ("not circular, stays in one spot") — that later item is a SEPARATE batch-1 conflict; for THIS section keep the circle.
1. **Fully visible** — verify `.nowcirc{left:2px}` (568) is not clipped at any zoom. If the cal container clips at the very left, nudge to `left:4px` and confirm at 390×1500. (Likely already fine.)
2. **"now" text** — current code (`app.js:2200`) puts the icon in the circle and a separate `nowread`/`nowtime` readout to the right. To honor "circle with text that says now," keep the small **"NOW" pill** visible *even while tracking* (currently the `np` NOW branch only fires when `!_lv`). Lowest-risk: leave the circle as the icon and ensure the right-side `nowread` always shows a `NOW ·` prefix, OR add a tiny "now" label under the circle. Treat as **options-first** (icon-circle + "NOW" prefix vs a dedicated now-label) since it touches the fragile render.

**UI sketch.** `(◉ icon)━━━ now · Reading 12m` — circle fully on-screen at the left, "now" word always present.

**DATA.** None.

**REGION.** `.nowcirc` CSS (568) — LOW risk; **plus** `app.js:2200` now-line render — **HIGH RISK** (this is the exact line the regression contract guards; it rebuilds the now-line/circle/readout each second). Any JS edit here must be labeled DEVICE-UNTESTED and re-checked against the 4 regression-contract behaviors.

**EFFORT.** S (CSS-only visibility check) / M (if adding the always-on "now" text in the JS render).

**RISKS.** **Direct conflict with audit line 490** ("the transparent circular thing... I don't want it... not circular, stays in one spot, scrollable away"). These two David asks contradict. The circle is already scroll-anchored at its true time (not viewport-pinned) — that satisfies line 490's "scrollable away." Whether to keep it circular is unresolved → **ask David / present both** before changing shape. Do not touch the per-second creep transform / `nowLineEl` recenter logic.

---

## Cross-cutting notes
- **Overlaps with batch-1 UI agent / HANDOFF open issues:** §2 (cool palette lean), §4 (shimmer), §6 (yellow), §8 (now-circle vs "not circular") all intersect open palette questions David is still iterating. For each of these, **present options before building** (design-choice rule) rather than committing.
- **Safe to build now without asking (bug-fix-grade):** §1 white sweep, §6 yellow-selection recolor, §7 right-side ball, §3 notebook-not-fullscreen (tap path). These honor explicit, repeated, unambiguous asks.
- **One ship at the end:** `bash _dev/preship.sh` → commit → push → hand David the `/fresh.html` link. Verify in preview at `390x1500`; label every gesture/timeline-render touch **DEVICE-UNTESTED**.
