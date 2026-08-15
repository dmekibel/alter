# HOME — NEW-ERA BUILD SPEC (the What-now cockpit, S0-S5)

Canon: David's 2026-07-19 "What now?" screenshot (this chat) + the core-redesign locks (memory `alter-core-redesign-complete`) + `_specs/STYLE-NEW-ERA.md` (verified palette; load it first).
Skin law: Part 0 of `_specs/SPEC-ONE-BUILDER-TOOLBOX-2026-07-19.md` (MINIMAL / BIG / FRIENDLY).
Model: OPUS. Effort HIGH only for the state-machine slice; the reskin slice is contained.

## 1. WHAT EXISTS (do not rebuild)
The home ALREADY LANDS: `renderHomeFace`/`renderHomeBars`/`homeStory` (grep them; near `renderTFControls`, `@SEC:COCKPIT`), reached via `renderTrackerFull`'s idle branch + `openHomeInstant()` at boot. It has: story bars, "What now?" greeting, big pink Track circle, plan sub-line chip, "Plan my day" ghost, tools side-scroll. This build UPGRADES that face in place. Do NOT create a new surface, do NOT touch nav (Map B = separate later build).

## 2. THE TARGET (from the screenshot)
Top: time left, gem count right. Below: the CONTEXT BAR = one rounded dash per titled block today (domain color, filled if lived, dim `#3a3242`-style if future) with the block's small icon UNDER its dash, tinted the same. Center: the FLAT pink circle hero, huge. Under it: "What now?" (big, Baloo 800, #fff2f9) + one context line ("next: Deep work · 5:30", lilac #b39ab0). Bottom: the tool tile grid, 2 rows x 4, context-gated. Air everywhere; nothing else.

## 3. THE FLAT CIRCLE (recurring fix; David rejected 3D gradients repeatedly)
- Fill: FLAT `#ff5fa8` (one hue, NO radial white-core gradient, NO highlight spot).
- Depth ONLY from: `border: 4px solid #160510` equivalent ink ring + `box-shadow: 0 8px 0 rgba(22,5,16,.9), 0 0 40px rgba(255,95,168,.25)` (soft under-shadow + faint bloom) + the dim dashed idle ring around it (already exists, keep).
- Glyph inside: dark `#3a1830` play/verb icon, not white.
- The circle is the ONE hero; per state it changes verb, never position or size.

## 4. THE STATE MACHINE S0-S5 (the real build)
One pure function `homeState()` (new, near `renderHomeFace`) returns `{s, block, gapMin}`; `renderHomeFace` switches on it. States + face:
- **S0 EMPTY** (no titled blocks today): circle verb = plan (`ti-wand` or play), headline "Shape your day?", context line "a plan takes a minute". Circle tap → `shapeFlow()`. Action row: Plan · Tools · (nothing else).
- **S1 PLANNED-IDLE** (plan exists, nothing due within ~10m): headline "What now?", line "next: {title} · {time}". Circle tap → start/track next block (`playFirst` path). Action row: Start · Plan · Tools.
- **S2 BLOCK-DUE** (a block's window is NOW or started <10m ago, not tracking): headline "{title}?", line "it's time". Circle = start THAT block. This is the catch beat: reward-never-shame, no red, no overdue language.
- **S3 TRACKING** (a timer runs): the existing tracking cockpit face — DO NOT REDESIGN in this build; only ensure the header/context bar stays consistent above it.
- **S4 ENDING-SOON** (tracking, block ends <5m): the existing face + ONE quiet Extend chip ("+15 min") above the transport. Uses the existing extend path if present; else additive chip calling the timer's extend.
- **S5 GAP-RETURN** (idle + last titled block ended >20m ago + before day close): headline "Welcome back", line "{gap} min since {title}", circle = start next, plus ONE quiet backfill chip "log what happened" → existing backfill/log path (`bentoPicker` quick-log). No interrogation vibe.
- Rule: ≤3 tappable verbs visible in ANY state beside the circle + tiles. Fixed positions (a verb never jumps slots between states).

## 5. CONTEXT BAR (replaces/upgrades the story bars)
Reuse `renderHomeBars` data (today's titled blocks). Each block = a rounded dash (height ~10px, radius 6px, flex-grow by duration) + its Tabler icon below at 14px, both in the block's domain color; lived = full color, current = full + soft glow, future = `mixHex(c,#160510,.72)`-style dim. Tap a dash = open that block in Today (existing openPull/scroll path if cheap; else non-interactive this slice).

## 6. CONTEXT-GATED TOOLS (tile grid)
- Tiles: the verified recipe `mixHex(col,#160510,.80)` dark fill + bright icon (STYLE-NEW-ERA; tiles in the screenshot read exactly this), radius ~18px, ~64px squares, 2 rows x 4 max, last tile = "More" (`ti-dots`) → `openToolbox()`.
- Gating (simple v1, no channel model yet): S3 tracking → show only layer-compatible quick tools (breath, posture, water); S0/S1/S2/S5 idle → the most-worn 7 (`S.tools.use` sort, the existing float logic). The full LAYER CHANNEL MODEL is a SEPARATE later build; do not implement channels here, just the two-mode gate.
- Tap = `runStack([{k,d}])` (existing).

## 7. CSS (index.html)
One contiguous block appended near the existing `.tf-home` styles. New classes prefixed `.hm-` (`.hm-ctxbar`, `.hm-dash`, `.hm-circle`, `.hm-line`, `.hm-tiles`, `.hm-chip`). Ground stays the cockpit's existing gradient (verified: `linear-gradient(180deg,#2a0d1c,#1c0814 45%,#160510)`). Type: headline ~30px Baloo 800; context line ~15px 600 lilac. Big tap targets (circle ≥ 150px, tiles ≥ 60px, chips ≥ 44px).

## 8. GUARDS
- No SCHEMA change (pure reads of blocks/timers/S.tools). If any new persisted pref appears, guarded-read additive only.
- Ratchet: no new `innerHTML=""` wipe sites; `renderHomeFace` already re-renders idempotently, extend it.
- The tracking face (S3) and start-screen/boot order (`@SEC:BOOT`) untouched.
- Copy: every new line through Gate 1 + Gate 2; RU dict same commit (B4 law).
- Preview verifies: state selection (drive each S via DEV seeds), faces render, no console errors. DEVICE-UNTESTED honesty: tap feel, scroll arbitration, boot feel.

## 9. SLICES (ship each separately)
- **H-A reskin:** flat circle + context bar + typography on the CURRENT face (no new states). Lowest risk, biggest visible win.
- **H-B states:** `homeState()` + S0/S1/S2 faces + fixed action row.
- **H-C moments:** S4 Extend chip + S5 gap-return + tool gating.
