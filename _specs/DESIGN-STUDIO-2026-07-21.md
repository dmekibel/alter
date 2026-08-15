# DESIGN STUDIO — full-app audit + the beauty gameplan (2026-07-21, Fable)

**Source evidence:** David's 354s screen recording (`IMG_3559.MP4`, v1173 build), frame-audited at 0.5fps overview + 4-10fps dense passes on the jank moments + full-res stills. Extraction rig preserved at `_dev/video-audit/` (swift AVFoundation dump + PIL contact sheets; works without ffmpeg). Plus David's three vision references (the What-now home, the minimal planner canon, the locked You menu) and the governing laws: `STYLE-NEW-ERA.md`, minimal-big-friendly (Part 0), the dev canon (100ms feel, teach-by-doing, harmony), `SPEC-ONE-BUILDER-TOOLBOX-2026-07-19.md`, `HOME-PLAYER-GRAMMAR-2026-07-20.md`.

**The one-line diagnosis:** the app's SURFACES are already 70-85% to the vision (home, player, planner blocks read new-era); what breaks the "most beautiful app" feel is the SPACE BETWEEN them: transitions are whole-screen crossfades of two live DOMs, gestures race full re-renders, celebration/status layers collide with content, and three different menu systems behave three different ways. Beauty here = physics first, paint second.

---

## 1. THE GRIEVANCE LEDGER (timestamped; re-extract any moment via _dev/video-audit)

### Class A — motion + state integrity (the "janky")
- **A1 · Drag-drop cascade scramble** [316-324s, dense pass]: while dragging a block, sibling blocks FLICKER in and out (Workout vanishes at 319.75, back at 320.0, gone at 320.25), the list mis-positions behind the held card (319.25: Workout offset half off-screen), and after drop a REAL overlap persists for 6+ seconds (Breakfast sitting on Deep work, 321.5-323.0). Root: drag preview racing wipe-rebuilds; the drop path re-renders while the gesture layer still holds transforms. = the PART 5.2 structure bug, now fully characterized. **Fix law: while a pointer is down, the DOM is FROZEN except transform-only moves on the held node + a gap indicator; ONE commit render on release.**
- **A2 · Transitions are whole-screen crossfades with both DOMs alive** [178.0s journey+toolbox fully blended; 285.6s journey+tracker+Stop button blended; ~90.0s tracker+planner]. No spatial motion, so every surface change reads as a flickery ghost. The create sheet [344s] already does it RIGHT (slides over a scrim). **Fix: one transition grammar app-wide** (see D0a).
- **A3 · Zoom re-anchor snap** [316.5→316.75s: the whole layout changes scale in one frame] + the known proportional scroll-anchor drift (flow-map handoff). Fix: animate relayout, invert scroll target through the flow map.
- **A4 · Reward-layer collisions** [72.5s full-res]: the +60 card COVERS the "Focus block" title pill; "streak x4" prints OVER "next: Make art · 17:31". Celebration layer has no reserved slots. Fix: the title row and the next-row are never occluded; streak line owns a row; confetti stays confetti.
- **A5 · Status-strip pileup** [72.5s, 181s]: the icon row under the day pills self-overlaps (book+brain collide), and the dev button (an EMOJI 🛠 in a purple square) floats over content, even over the dial's progress dot [181s]. Fix: fixed icon slots aligned under pills (or icon-in-pill, see B7); dev chrome to a corner, ti icon, hidden outside dev mode.
- **A6 · Header truncation** [181s]: "Focus …" and "next: Make …" both ellipsized in a wide header while the timer has room. Width budget + smaller name line.
- **A7 · Mini-dock covers content** [74s]: the ON-PLAN dock hides Evening walk; timeline needs bottom clearance when the dock is up.
- **A8 · Typewriter dead screens** [128s, 150s: 1-3s of near-empty screen]. Pre-render dim + brighten, faster reveal, tap-to-complete.
- **A9 · Deep-zoom vacuum** [96-116s: TWENTY seconds of near-empty viewport inside one block]. Sub-hour dashes (shipped) + in-block substance at zoom (charge fill, notes, minute ruler).
- **A10 · Far-out zoom = sliver wall** [44-58s]: unreadable thin rows; MINFLOOR not felt at that HP. Clamp the zoom range (overview belongs to W view, not to a crushed D view).
- **A11 · Create-sheet chips clipped mid-word at the right edge** [344s: "Stret|", "Eat h|"] with no fade/scroll affordance.
- **A12 · Labels scroll out inside tall blocks** [62-64s: Project work label lost]. Sticky label within the block's visible portion.

### Class B — skin consistency (vs STYLE-NEW-ERA + Part 0)
- **B1 · Stripes-as-wall** on: builder rows [245s], add-a-block picker [288s], create-sheet category panels [344s, chip-on-same-hue-panel vibrates]. Law says stripes = accent. These become friendly-card plum + domain icon color + at most one stripe accent.
- **B2 · Two commit colors.** Green commits (Stop, Mark it, Play now) vs pink commits (Begin session, Save, Done, START). Rule: **pink = commit/start everywhere; green = "on plan" status only.**
- **B3 · Lessons flow off-palette** [230-234s]: flat blue CTAs (not in the palette), unstyled rows, and TYPE-IN inputs in a 60-second sit (tap-not-type law). Reskin + tap-first answers.
- **B4 · All-tools library** [211s]: near-black card wall, thinker-credits-first, Willingness+pips clutter, red SOS banner shouting. (= the ONE-BUILDER diagnosis, confirmed on camera.)
- **B5 · Toolbox 5/10/20 cards** [181s]: right structure, too many accents at once (3x5 color bars + yellow ring + 3 green play circles + chip chains wrapping). One battery strip per card, chain folds to "5 tools · 20 min", the whole card is the play button.
- **B6 · Home tool grid** [31s]: hue drift vs the vision set (two oranges, two teals, hot mix) and the grid sits in a visible container panel (vision: tiles float free). Retune to jewel hues, drop the panel.
- **B7 · Story strip is two misaligned rows** (pills + icons). Vision = one glance element. Icon-in-pill (one row), and the strip becomes a big tap target (the planner door, see §2).
- **B8 · "Today" serif wordmark** on planner [34s] vs Baloo everywhere else. Unify.
- **B9 · Sheet systems behave three ways**: create sheet slides w/ scrim (correct), toolbox crossfades whole-screen, #sheet modal its own thing. Unify: slide-over-scrim + tap-sweep (the locked menu transition).

### Class C — structure
- **C1 · Tracking face control stack** [72.5s]: chips + Stop + Break + extend = four tiers under the dial. Two-clock law wants the circle to BE the interface. Stop stays big; Break/extend collapse to one quiet row.
- **C2 · Two-lane double label** ("Focus block" twice) [74s+]: the open fold-in decision. Recommendation: ONE card, live fill inside (the plan block is the vessel; the real lane is its fill), per the one-bubble rule already shipped for partials.
- **C3 · Journey path floats** (sparse circles, no world). The compass rose (§2) re-grounds it as the sky above home.
- **C4 · Not covered by this recording:** Game/sanctuary pane, live You/settings, W/M planner bodies. Audit on next recording.

---

## 2. NAVIGATION VERDICT — THE COMPASS ROSE (David's concept, refined)

David's idea: kill the bottom menu; home button bottom-left attached to the minimized player; garden door top-right under the story; planner top-left; scroll up = journey; scroll down = tools.

**Studio verdict: YES. This is the single biggest sleek-minimal win available and it makes the navigation MEAN something: ALTER is a world, and home is the center of it.** Up = the sky (journey stones already live there). Down = the ground (the tool shelf). Left = the day (planner). Right = the garden (sanctuary). No tab bar chrome on any screen. It also merges cleanly with laws already ruled: home is a PLACE and a true pane (HOME-PLAYER PART 4+7), "scroll down reveals more tools" (David's kept ruling) IS the ground shelf. It supersedes the 5-slot nav-reorder slice from 07-20 (David's own newer idea outranks it, pending his confirm below).

**Four refinements (the concept's failure modes, closed):**
1. **Doors stay visible; gestures are accelerators.** Corner glyphs (planner top-left, garden top-right) + 10-14px PEEK affordances on the vertical axes (the next journey stone crests the top edge; the tool shelf's lit edge shows at the bottom). Everything tappable. Reason: the four-persona test; mom must find things without being taught a secret. Bonus: **the story strip itself is the primary planner door** (tap your day → the day), which is a big target and semantically perfect.
2. **The bottom-left slot = the GUARDIAN PUCK, one persistent object app-wide.** Idle: a small round home glyph. Guided session running: it grows into the mini-player pill (title · progress · pause). Tracking a block: it is the live mini-dial. Tap = home from anywhere (on home during a session, tap = the player). This is "home button attached to the minimized player" made into a law that also satisfies the one-live-time-object GUARD LAW. Recommendation vs the bare-button variant: keep the fusion; it consolidates three floating systems into one.
3. **Settings/You: a small guardian-mark avatar on home's status row** (next to the gems) opens the You sheet (the locked menu design). The garden stays a pure place. From other surfaces: puck → home → avatar (2 taps) is acceptable for a rarely-visited surface.
4. **The vertical axes are ONE continuous column, not hidden pages.** Home scrolls up into the sky and down into the shelf; past a threshold the destination takes scroll ownership (the zoom-law camera grammar, vertical). Any accidental scroll reveals the peek = discoverable by play (teach-by-doing).

**Costs, honest:** vertical scroll hand-off + doors vs the H-D2 peek carousel = gesture arbitration, DEVICE-TESTED, regression-grade care. ~2-3 Opus sessions for the shell + 1 for the morph polish, and it should land only after D0 (below) so the motion is real. Z-2 (orb↔dial↔puck morph) becomes the app's signature move.

---

## 3. TOOLBOX — the redesign direction (executes the existing ONE-BUILDER spec inside the rose)

The toolbox is the GROUND FLOOR of the world. Scroll down from home: the 2x4 quick grid first, then the shelf.
- **Layer 1** (the whole default view): one guardian "for right now" hero + the three time-doors (5 / 10 / 20). Nothing else.
- **Layer 2:** one quiet "All tools" row → the tile grid.
- **Layer 3:** builder + science on demand.
- **Skin:** friendly-card plum, domain color on the icon, ONE battery strip per door card, whole-card = play. Library cards: icon + name + one when-line; credits/pips/Willingness fold into the detail view; SOS = a quiet door pinned last, never a red banner. Builder: solid calm fills + one stripe accent, thick drag handle, big CTAs (the lifted-lock deltas). Breathing = prebuilt stacks through the same doors (Part 1a). Kill criteria unchanged: no third menu system, no new overlay ids.

---

## 4. THE D-TRACK (design build phases; each = spec-first Opus, device-verdicted)

- **D0 · THE PHYSICS (first, everything depends on it).**
  (a) One transition grammar: sheets SLIDE over a scrim (generalize the create-sheet pattern), menu opens = tap-sweep (locked), pane travel = slide, sessions = zoom (Z-1 exists). Whole-screen crossfades die.
  (b) Gesture-owns-the-DOM law: no wipe-rebuild while a pointer is down; transform-only previews; one commit render on release (fixes A1; enables every future animation).
  (c) The collision sweep: A4 A5 A6 A7 A11 A12 (small, targeted).
- **D1 · THE SHELL (compass rose).** Tab bar dies; guardian puck; doors + peeks; vertical column hand-off. Atomic: ships only when whole (never half a nav). Supersedes PART 7 slice 3.
- **D2 · THE TOOLBOX.** §3, to the existing spec. Mockups first (2-3 variants, rendered by OPUS in chat, per the no-widgets-on-Fable law + options-first).
- **D3 · PLANNER FEEL.** MINFLOOR tuned to the mockup proportions, zoom range clamp + animated re-anchor through the flow inverse (A3 A9 A10 A12), the battery past-grammar per the locked plan-reality law (C2 resolved; only the visual mockup verdicts here) + the RIVER mechanic (displaced blocks flow forward at the now-line: its own regression-zone slice, contract #2 held, toast + undo), dock clearance (A7), create-sheet calm panels + edge fades (B1 A11).
- **D4 · THE COAT.** Commit color = pink sweep (B2), lessons reskin + tap-first (B3), tile hues + panel drop (B6), story strip fold (B7), "Today" font (B8), Z-2/Z-3 morphs, the sound pass (open decision #9). Paint-class: safe during soft launch.

**Merge with the launch calendar (amends today's week map where they collide):**
- **Jul 21-25:** B1 (queued) + **D0**. 
- **Jul 26-Aug 1:** B4 rails (parallel lane) + **D1** (device-tested mid-week) + **D3**.
- **Aug 2-8:** B3 first-day + **D2** + B9-lite. **Aug 8 structural freeze.** Four-persona round runs on the NEW nav.
- **Aug 9-22:** soft launch + **D4** + B6/B2 specs.
**The honest math:** B-track 6-9 + D-track 9-11 sessions ≈ the whole runway including soft-launch weeks. The slack protected this morning is now SPENT on beauty; that is the price of "most beautiful app in the world" before launch.

**REFORMED SLIP RULE (David 2026-07-21, replaces the deferred-polish version):** beauty is a launch gate, not a nice-to-have. The app ships beautiful AND functional or it does not ship. So when a week slips, the order of what gives is: **(1) FEATURE BREADTH first** — non-core surfaces move to the founder-update stream (the AI architect, extra tools, and B10-12 were already Sept; more can join them). **(2) THE DATE second** — flex late-August by 1-2 weeks before cutting the beauty. **(3) NEVER** the core-loop polish, the compass rose (it cannot ship half), or the D0 physics. The launch product is "the core loop, complete and beautiful," with depth arriving as founder updates. This means the launch MVP gets NARROWER, not uglier. EVIDENCE: David's verdict, "we must finish the app beautiful and functional before launch, no major hiccups."

---

## 5. DAVID'S PICKS — ALL VERDICTED 2026-07-21 (mockup session)
1. **Compass rose: YES.** Build it; kills the tab bar. → D1 greenlit (after D0).
2. **Puck: the shape-shifter (fusion).** Home / mini-player / live dial in one object. → D1.
3. **Settings: avatar on home's status row, by the gems.** → D1.
4. **Battery fill: YES** (one block, live fill), and the mechanic is now **LOCKED (David, 2026-07-21): THE PLAN-REALITY LAW, "reality fills, intention flows."** (a) Tracking is one tap, never a replan ceremony (MI readiness law; tracking friction starves the loop). (b) The past keeps only lived reality, one lane; small divergences live INSIDE the block (dim late head · unfilled top · overshoot spill · empty frame for untouched plans). (c) A displaced or unlived planned block auto-FLOWS forward: later today if it fits, else the PM-close carry basin ("carry to tomorrow, or release"); whisper toast + undo; future-side only, so regression contract #2 holds. (d) Every divergence is logged as a planned/lived pair and surfaces where reading is comfortable: the PM close ("Deep work lost its slot to a walk"), per-activity stats ("Gym: planned 3, lived 2"), and the guardian's pattern talk in the B2 era ("2pm deep work keeps dying, try 4?"). The timeline never wears the delta. Consistent with [[timeline-battery-principle]] + [[alter-tracker-design-rules]]. **Remaining at D3:** only the past-block visual grammar mockup (head/top/spill/empty-frame) on a real seeded day.
5. **Slip rule: REVERSED by David.** Beauty is NOT deferrable; the app ships beautiful AND functional or the date moves. See §4's reformed rule.

## 6. BUILD NOTES
- Mockup law: D1 + D2 get Opus-rendered chat mockups (2-3 variants) before build; D0/D3 are fix-class, no mockups; STYLE-NEW-ERA PROCEDURE applies to every mockup.
- Every D-phase ships behind the regression contract + ratchet; gesture work is DEVICE-UNTESTED until David's phone verdict, and the handoff says so.
- Re-extract any timestamp: `swift _dev/video-audit/dump.swift <video> <outdir> 360 "range:START:END:FPS" 0.06` then `python3 _dev/video-audit/tile.py <outdir> sheet 3 4`.

---

## 7. NIGHT NOTES (2026-07-21 late, Fable) — closing the world map: six grievances, solutions, render boards

David's first hours living with v1185 (ONE-HOME + puck). This section extends §2/§3; it is the brief for the next OPUS render session (chat boards, STYLE-NEW-ERA procedure). David picks per board; picks cut into D1/D2 build deltas.

### 7.1 The grievances (David, ~10 PM)
1. Journey glyph sits top-LEFT; "on the left should be the planner." (His original §2 concept DID say planner top-left; the v1183 build deviated.)
2. Gems on the status row: small, almost invisible.
3. Home tool buttons: an icon alone teaches nothing to a fresh user. Wants tap = the button expands and SHOWS what's inside; or drag-around = names reveal under the finger. Also questions the set: "first buttons should be the prebuilt stack, or stacks, or just breath."
4. The scroll-down toolkit needs its full design: super friendly, clever, big, not overwhelming.
5. Planner + garden doors too small; the design could be better.
6. "Plan your day" offered at 10 PM on a blank day. Needs daypart awareness + a "Plan tomorrow" door at night. (His definition: "plan your day" = compose SEVERAL blocks at once, never one.)
7. The journey must honor the PAST (Duolingo's earned-trail pride) without breaking scroll-down = home.

### 7.2 Doors move ONTO their axes (fixes 1 + 5)
Law: every door sits on the EDGE it opens toward, and PEEKS its content (teach by preview, not by icon):
- LEFT edge: planner sliver, a thin live spine of today (next block title + time). The story strip stays a big planner door too (§2 refinement 1 holds; two doors to the day is fine, one semantic, one spatial).
- RIGHT edge: garden sliver (a grown thing + soft glow).
- TOP edge: journey peek (the next stone crests the top edge). The corner journey glyph DIES; up is the journey's own door.
- BOTTOM edge: the toolkit shelf's lit edge (already ruled).
This also clears the logged "door glyphs crowd the story pills" collision. Board variant: fat labeled corner chips instead of slivers, in case slivers read as clutter at 390px.

### 7.3 Gems: from dust to a stash (fixes 2)
Recommended: the GEM CAIRN, a chunky game-piece pile (solid fills, ink border, hard shadow) sitting on the home ground by the journey door: evidence visibly feeds the climb. Growth states by count: lone gem, small pile, cairn, crystal cluster. On gain the gem ARCS into the pile. Tap = the locked gem-bar rank banner. Variant: same object, enlarged, on the status row (smaller change, less presence). Killed: gems set into the ONE-HOME frame on every face (re-shrinks them by necessity).

### 7.4 Home first row: fewer pieces, blooming (fixes 3)
- The set (recommended): YOUR STACK hero (the prebuilt daypart stack as a card: step glyphs + minutes) + BREATHE + the PLAN chip (7.6). The 2x4 tool grid MOVES DOWN into the shelf's All-tools layer; home keeps three big pieces. Variant: status quo grid stays on home.
- BLOOM grammar: resting chip = icon + ONE word, always labeled. First tap never launches: the chip blooms in place into a preview (what is inside, how long) with one big START. Tapping another chip hops the bloom. START = go. The bloom IS the education; one extra tap, ~300ms, kills icon-guessing.
- SCRUB reveal (David's drag idea) = layer 2, additive: press-drag across the row magnifies chips under the finger and whispers name + contents; release on one = bloom it. Gesture class, DEVICE-TESTED after bloom ships; never the only path (hidden affordances fail the mom test).

### 7.5 The toolkit column, full picture (fixes 4; refines §3)
Home is layer 0 of ONE continuous column. Scroll down from home, in order:
1. The shelf edge glows under the home content (the peek).
2. TIME DOORS: the 5 / 10 / 20 guardian doors, one viewport, nothing else beside them. (The "for right now" hero lives UP on home as YOUR STACK; no duplicate hero here.)
3. ALL TOOLS: one quiet row, then the tile grid (absorbs the home 2x4). Tiles = icon + one word, family-tinted; tap = the same bloom grammar, one bloom open at a time.
4. On demand: builder + science + SOS (quiet door, pinned last).
Ceiling law: at no scroll position are more than ~7 interactive things visible. Skin per §3: friendly-card plum, one battery strip per door card, whole card = play.

### 7.6 The plan chip: a daypart state machine (fixes 6)
ONE chip whose label + target swap by daypart and day state (thresholds tunable at build):
- Morning/midday, day unplanned: "Plan your day" → the day COMPOSER (multi-block; the bento sheet redesign, board 6).
- Day planned, gaps ahead: "Plan the rest".
- Evening (~19:00+), day has content, close not done: "Close the day" leads (the close already carries into tomorrow); "Plan tomorrow" rides as the quiet secondary.
- Night on an empty day (tonight's exact case): "Plan tomorrow", straight. Never a morning CTA after dark.
- Closed, or tomorrow planned: quiet "Tomorrow is set" state.
EVIDENCE: founder N=1 tonight (10 PM blank slate still offering "Plan your day") + the Newport shutdown canon + the what-now engine at @SEC:COCKPIT already carries night/evening "Plan tomorrow" chips; the home face never inherited that intelligence. Build note: this is a small LOW-effort slice once the board is picked.

### 7.7-REVISED (David live, 2026-07-21 night — SUPERSEDES 7.2/7.4/7.7 below)
David rejected the home-reskin direction outright ("u redesigned my home it's ugly, bring back how it was") and the corner-door/three-piece ideas. **The REAL v1185 home stays exactly as-is** (screenshot-anchored this session: status row · colored activity CAROUSEL with icons + chevron · journey door top-left purple/route · garden door top-right teal/leaf · big center activity circle · Track now · Did-it/Not-mine · TWO rows of COLORFUL tool tiles). Do not flatten the tiles to plum, do not move the doors, do not swap the grid for three pieces. The design work is NOT a reskin — it is the CONTINUOUS-SCREEN MOTION that unifies journey + home + toolbox into one scroll:
- **The center circle is the HINGE**: it is simultaneously the current activity (home) and the current/now journey stone (journey). One object, two roles.
- **Scroll UP**: the activity carousel (the strip above the circle) slides UP and AWAY off the top; the now-circle drops down and becomes the current journey node; the NEXT stones (future, after the current one) appear above it, as the big winding chapter circles that already exist (screenshot-confirmed: "Plan your day / One small reflection / The Aim / The Open" — bigger-circle Duolingo style, David loves it, wants them kept, maybe even bigger/friendlier). The PAST is NOT on the path — it lives behind a "Log" button in the journey header.
- **Scroll DOWN**: below the two tool rows, MORE rows just keep coming (continuous, same vein) → into the toolbox shelf (5/10/20 time-doors etc.). No screen jump, no overlay swap — one surface.
- **The puck** (bottom-left) is always present to snap back to home-center.
- Concept board rendered this session: `alter_continuous_scroll_real_home` (home | scroll-up peel | journey). Motion is DEVICE-UNTESTED and gesture-arbitration-grade (the scroll-ownership hand-off between journey↑ / home / toolbox↓ is the hard part; regression-zone care). **Open: David iterating live — confirm the peel/hinge reads right before any build.** Build = R3 compass-rose/continuous-scroll slice on Opus, spec-first, device-tested, behind a kill-switch.

### 7.7 The journey and the past (fixes 7; THE philosophical pick of this round) — SUPERSEDED by 7.7-REVISED above
Problem: up = journey lands at NOW; scroll back down = home; a literal past-trail below NOW has no room on the axis.
- OPTION A (recommended): THE GARDEN IS YOUR PAST. The journey shows NOW + what is ahead, plus a WAKE: the last 2-3 completed stones, small and settled, directly under the NOW stone (visible footing for the climb; tap = the chronicle sheet with full history). Every completed stone also PLANTS something in the garden (the right door): Duolingo's pride-of-the-trail becomes pride-of-the-place. This is ALTER's own thesis (identity evidence; teach, mirror, chronicle; the sanctuary claim system already half-builds it). The axis stays clean: down from NOW = home, always.
- OPTION B: Duolingo-literal. Entering the journey lands mid-path with the full past below; home becomes a button exit (the puck) instead of the scroll-down. Honest con: breaks David's own stated grammar (down = home) and re-adds a mode.
- KILLED: past above the now (inverts future = up).

### 7.8 The render boards (next OPUS session, in chat; effort MEDIUM)
Beauty bar: every board reads as a PLACE, not a menu. Big type, big targets. Palette from the live index.html :root only. Game-piece chunk (ink borders, hard shadows). Tabler only. Anything that needs a legend dies.
1. HOME FACE reassembled: edge-door slivers + gem cairn + the three chips + the puck. Variant: labeled corner chips.
2. PLAN CHIP states: 9 AM empty / 3 PM planned / 10 PM empty. Three small frames.
3. CHIP BLOOM: resting row, then one bloomed (YOUR STACK showing steps + minutes + START). Scrub frame as a footnote.
4. TOOLKIT scroll: the time-doors viewport, then All-tools with one tile bloomed. Max 2 variants.
5. JOURNEY GATE: Option A (now + wake + garden link) vs Option B, side by side.
6. DAY COMPOSER: the bento "plan your day" sheet redesigned new-era (already owed; the plan chip lands here).
Picks route: boards 1-3 + 5 cut into D1 deltas; board 4 into D2; board 2 also spawns the LOW-effort CTA slice. Builds stay on the D-track order (D0 physics first); nothing here jumps the queue.

### 7.9 ROUND-2 VERDICTS (David live, 2026-07-21 later — Fable gameplan; ALL renders go to Opus)
Process note first: widgets were wrongly rendered on Fable this session. Rule re-affirmed: **Fable gameplans, Opus renders.** The boards below are the Opus queue.

1. **STACK-FIRST LAW (new, load-bearing).** The app prioritizes STACKS over individual tools, and the offering grammar must SHOW that hierarchy:
   - Stacks = big bead-cards (step glyphs + minutes), always offered first.
   - MINI tools = 1-minute one-taps (stand, water, quick breath, shake out): small chips, no player ceremony, tap → 60s → done → counted. The ADHD floor and never-punish tiny win.
   - THE ONE-MINUTE STACK: stretch/move → breath → relax, nothing else (= the day-one micro-loop promoted to a permanent tool). Candidate: a "1" door beside the 5/10/20 time-doors.
   - Context rules for the guardian's offer: a gap in the day = stack; mid-tracking = mini only; late night = winddown stack. "Clever tool options to give" = this offer engine, not more tools.
2. **POPUP RETHINK (new workstream).** All popups are relics of the old build. One popup FAMILY: census first (grep every overlay/#sheet/toast/card builder), then ONE grammar (slide-over-scrim + tap-sweep + new-era skin + stateful copy), then each popup redesigned inside it. Extends B9 + D0a; the census is a cheap-model job.
3. **THE CIRCLE IS THE BUTTON.** No separate "Track now" bar: tapping the big circle tracks. Restore the solid middle proportions (the approved What-now composition, v1139 era). Claim-state secondary actions (Did it already / Not mine) move DOWN to the GROUND BUMPER (the bottom strip by the puck). Kills the current empty band under the circle. My continuous-scroll board repeated the bar mistake; dead.
4. **JANKY CHROME (fidelity miss I should have caught).** The corner doors (planner top-left, self/garden top-right, "the soft one" especially) + the gem/points counter do NOT match the approved mockup (font/weight/tint/shadow class of miss, per the widget-fidelity law). Owed: polish to mockup fidelity + 2-3 improvement options for the doors and the counter, rendered by Opus for David's pick.
5. **JOURNEY VISUAL: KEEP AS BUILT.** The current in-app journey (big colorful stones, labels, description cards) is BETTER than my board's version; it does not change. Only the ENTRY MOTION is new (carousel peels up, the circle hinges into the now-stone, §7.7-REVISED). Never redraw the journey surface itself.

**OPUS RENDER QUEUE (effort MEDIUM, STYLE-NEW-ERA procedure, anchor on live screenshots):**
(a) Home fixed: circle-is-the-button + ground bumper carrying the secondary actions, real proportions.
(b) Door + gem chrome: 2-3 options each (planner left, self top-right, counter).
(c) Popup family: the one grammar shown on 3 real popups (welcome-back, extend, a confirm).
(d) Stack-first shelf: stacks as bead-cards up top, mini-chip row (stand/water/quick breath), the 1-minute stack + "1" door.
