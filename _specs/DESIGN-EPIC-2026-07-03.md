# DESIGN EPIC — 2026-07-03 · every screen, law-checked

Law-checked epic suggestions for every screen of ALTER: **522 suggestions across 14 surface groups, 27 killed by the law-keepers** — the survivors are below, verbatim in intent, tightened in prose. Everything is governed by the GRAND-REDESIGN laws (§0: one world, five time-zooms, one light; matte = potential · shining = lived · the now-line = the converter) and ordered by zoom: NOW → DAY → WEEK-MONTH → LIFE → FOREVER → FLOWS → CHROME. Each suggestion reads **Title** (effort, wow, law) — the idea. Nothing here is built; nothing invents a mechanic — every line deepens what exists.

---

## NOW — cockpit idle

### Idle with next plan — hero + 3 doors (the frame-07 body)
*v820 matches upload 07 faithfully: grab / pink play disc (tfBreathe) / «What now?» / plain-text sub «next by plan: X · 17:30» / three doors (solid pink Track now, striped blue Plan+track next, ghost Plan my day). All chrome display:none'd via st-idle. The frame is honest; what's missing is connective tissue to the timeline and any memory in the composition.*

- **The sub-line becomes a miniature timeline block** (M, wow 4/5, BATTERY + COMPOSITION + one-world thesis) — replace the plain-text tfVerdict with an inline chip that IS a timeline block in miniature: radius 8, matte domain tint over #22091a, 2px ink border, the block's ti icon in domain color + title + time at 13px. Recognition, not abstraction. Tap = close cockpit, land the timeline scrolled to that block — zoom NOW→DAY.
- **The striped door names its block** (S, wow 3/5, DOORS + CLASSY) — the blue striped door gains a right-aligned muted 12px chip naming the thing it starts: «План + трек следующего · Глуб. раб.» Type-only detail; 52px+ and the stripe finish untouched.
- **Countdown state when the plan is imminent** (S, wow 4/5, BATTERY + MICRO-GRAMMAR ⑤) — within 15 min of the next block, the sub-chip's time swaps to «через 12 мин» + a static 2px pink left-edge hairline; the striped door's stripe brightens one step. Pure state change on render — the cockpit visibly leans toward the plan.
- **Energy-door aware ghost door** (M, wow 4/5, SOUL always-a-way-out + energy-door spec) — when this open was routed relief/drowning, the ghost door swaps to «Собраться за 5 минут» (ti-wind) opening the toolbox FOR-RIGHT-NOW card directly. Planning pressure leaves the room for that open; the third slot always stays an escape.
- **Door press = full spring grammar audit** (S, wow 3/5, MICRO-GRAMMAR ①) — extend the .tf-door press token (shadow 4px→1px + 2px sink, spring release) to everything pressable: hero disc, sub-chip, sheet chips. Pure CSS, ~6 selectors.

### Idle empty day — no plan
*With no plan, tfVerdict renders empty and tf-ctx is hidden — hero + «What now?» + two doors floating over a mute blank line. Clean but dead: no invitation, no proof the guardian remembers anything.*

- **Yesterday's echo docks as the suggestion sheet** (M, wow 5/5, SOUL mirror-not-price + COMPOSITION) — on empty idle, reuse #tfNextSheet as the guardian's memory: what was tracked at this hour ±1 yesterday (or same weekday last week) docks as «Вчера сейчас — Глубокая работа. Повторить?» with the same 4 duration chips; a chip tap plans+tracks it now via the existing playFirst plumbing. The empty day proves the app remembers — zero new components.
- **One warm time-of-day invitation line** (S, wow 3/5, CALM + SOUL guardian voice) — fill the empty slot with one line keyed to the logical-day segment: утро «чистый лист — с чего начнём?», день «день ещё твой», вечер «ещё одно дело — или отдых?». Three strings + a switch on logicalNowMin(), RU dict included.
- **Empty-state door order earns the morning** (S, wow 3/5, DOORS + play-first lock) — pink Track now stays locked as hero; the striped Plan-my-day door gains a morning-only sublabel «3 дела — 60 секунд» selling the Big-3 flow's real cost without demoting the hero verb.

### Docked next-block time sheet (#tfNextSheet)
*Docked #22091a room with ink seam: icon+title+«how long?», four k-dur chips (planned duration pre-lit pink), foot line «no time — just track · a plan earns more». One-tap works — but the foot line is a dead div that looks tappable, chips have :active with no spring, the pre-lit chip doesn't say why.*

- **Make the foot line the honest escape it pretends to be** (S, wow 4/5, SOUL always-a-way-out + MICRO-GRAMMAR ① + 44pt) — «без времени — просто трек» has no onclick (app.js:3319). Wire it: start tracking with no committed duration, styled as a real ghost row — 44pt, ti-player-play, press-sink. The way-out law demands the escape actually opens.
- **The planned chip declares its provenance** (S, wow 3/5, CLASSY + BATTERY) — the pre-highlighted chip gains a tiny 11px ti-calendar-check before its label — «по плану» said without words; the other three stay bare.
- **Press-hold a chip = fine-tune stepper** (M, wow 3/5, MICRO-GRAMMAR ② + toolbox grammar) — long-press any duration chip (500ms) swaps the foot line for an inline stepper: −5 / value / +5 / a 44px green GO circle → startNextNow(nb, mins). Covers 45m/90m life without a modal.
- **The sheet rises from its cause on open** (S, wow 3/5, MICRO-GRAMMAR ②③④) — #tfNextSheet enters with one spring translateY(100%→0) as part of the portal reveal instead of blinking in via display:block; interruptible.

### Hero disc + matte ring
*The disc is locked pink play (frame-07 canon) with tfBreathe as the single focal breather. But the ring is hard-flattened to conic-gradient(#3a2540 0 100%) !important — 172px of dead pixels around the most important button in the app.*

- **Disc tap = the bento rises from the disc** (S, wow 4/5, MICRO-GRAMMAR ①②) — tapping the hero disc fires playFirst, and the bento picker's entrance originates at the disc: transform-origin at disc center, scale .6→1 spring; the press sinks the disc 3px. Menus visibly come from their cause.
- **One breath, tuned** (S, wow 2/5, CALM + MICRO-GRAMMAR ⑤) — audit idle motion to exactly one breather: keep tfBreathe, freeze the ring's .5s background transition in idle (transition:none). The disc alone is alive.

### Ignition transition — idle to tracking
*A chip or door tap calls startNextNow/playFirst then renderTrackerFull(): a hard cut between two state bodies. The tf-morphing FLIP infrastructure exists but the app's most meaningful moment — potential becoming lived — is a re-render.*

- **THE CONVERSION — one continuous matte→shining sequence** (L, wow 5/5, BATTERY the-converter + MICRO-GRAMMAR ③④ + COCKPIT GRAMMAR) — a ~650ms interruptible class-driven sequence on the EXISTING nodes: ① tapped chip ignites per choice-row v3 ② #tfNextSheet sinks into the floor ③ the disc crossfades pink-play → the block's domain stripe, glyph swaps to the activity icon ④ the ring floods clockwise, matte → live green ⑤ «What now?» crossfades to the switchable title pill. Reuses tf-morphing tokens; any mid-sequence tap redirects instantly. The user watches potential become lived under their finger.
- **The chip's minutes fly to the ring** (M, wow 4/5, MICRO-GRAMMAR ② + reward continuity) — the chosen «30м» detaches from the igniting chip and flies (FLIP spring, ~400ms) to the elapsed-time slot, landing as the commit target «0:00 / 30м». Same trick as the points-fly.
- **No-timer escape gets a humbler exit** (S, wow 3/5, SOUL no-shame + toasts retired) — the quiet variant: sheet sinks, disc converts, ring stays matte with only the pink now-tick. Cap «a plan earns more» to once per day, said by the sub-line, never a toast.

---

## NOW — cockpit live

### ON-PLAN (st-onplan)
*The winning state still runs the full pre-redesign chrome — clock, fire+minutes, Soul Force readout, tfSay, uppercase verdict, 50px mono elapsed, ctx line, SWITCH TO chips, tfNext, stage chips (~12 elements) — plus old .tf-b tiles (green Done + Pause/Replan). Only idle/night/claim got the calm purge.*

- **The five-element winning body** (S, wow 4/5, CALM + COMPOSITION) — extend the st-idle hide-list to st-onplan; merge verdict+ctx+elabel into ONE 13.5px sub-line: «on plan · 23m left · ends 18:30». Body = grab / ring / title-pill / elapsed / sub-line / doors — zero facts lost.
- **Doors, not tiles** (S, wow 3/5, DOORS) — finish fields in the onplan case (app.js:4220): Done = 54px solid #28cf86, then one ghost half-row Pause | Replan. renderTFControls already branches on finish — a 3-line change retiring the last .tf-b live surface.
- **The converter dot + the end pip** (M, wow 5/5, BATTERY + CLASSY) — an 8px white-hot arc-head dot (rotated to p·360°, breathing on a 3s spring — the one focal breather) plus a fixed hairline ink pip at the block-end angle. Pacing becomes dot-chasing-pip, read visually; the now-line-as-converter rendered ON the ring.
- **Minute-earn pop** (M, wow 4/5, MICRO-GRAMMAR + reward inversion) — every whole on-plan minute, the elapsed number does the counter-pop and the arc-head flares once, hooked in the existing 1s live loop. Minutes FEEL earned in real time.
- **Overtime laps, never shame** (S, wow 3/5, SOUL no-shame + BATTERY) — rem < 0 starts a second lighter-green lap over the first; sub-line flips to «over by 7m — still counts». Overtime = a bonus lap, never an error.

### OFF-PLAN (st-off) — the keep-going home
*Same 12-element chrome, but the disc is wrecked by filter:saturate(.3) brightness(.72) over a muddy #6a5870 ring. Controls are old tiles: Make a plan + Pause + Stop.*

- **Matte, not muddy** (S, wow 4/5, JEWEL + CHOICE-ROW v3 + BATTERY) — kill the filter. Off-plan disc = the activity's colors at REST: dark own-color tint + solid own-color outline + bare colored icon; full 9px stripes stay reserved for on-plan. Lived, not yet converted.
- **The empty ring is the pitch** (M, wow 5/5, BATTERY + COCKPIT GRAMMAR) — replace the dim fill with a GHOST ring: dashed hairline circle in #3a2540 — «no plan holds this yet» said in the timeline's own ghost vocabulary. The Make-a-plan door becomes self-explaining, and the fusion ignition gets a stage.
- **Blue fusion door + the purge** (S, wow 4/5, DOORS + PALETTE blue=plan + CALM) — Make a plan = 54px striped #36b3f0 door, Pause+Stop = one ghost half-row, five-element purge with the sub-line «42m tracked · no plan — a time makes it count double».
- **One line, one truth** (S, wow 3/5, CALM) — retire tfSay here; if the guardian speaks it gets the sub-line's tail slot. Facts first, voice second, one line total.

### DRIFT (st-off + drift flag)
*No dedicated class — drift shares st-off wholesale, so DOM.drift's colorless #565b66 gets the muddy desat filter on top. The state reads like a broken off-plan rather than a designed room.*

- **A real st-drift room** (S, wow 3/5, JEWEL + SOUL no-shame) — add the modifier class in renderTrackerFull (app.js:3336): disc = SOLID cool-gray #565b66 with white icon (solid, because stripes = reward and drift never earns them), hairline dark ring, no filters. The one colorless object in a jewel world: neutral witness, never red.
- **The way back leads** (S, wow 4/5, DOORS + SOUL always-a-way-out) — Back to plan = 54px striped #36b3f0 primary; Pause/Stop ghost half-row. Sub-line: «34m adrift — logged honestly, zero judgment». The single bright element is the exit, not the verdict.
- **Return ignition** (M, wow 5/5, REWARD INVERSION + MICRO-GRAMMAR) — tapping Back to plan sweeps the ring gray→blue→green in ~600ms and fires a tier-2 ignition on the block it lands on. The RETURN is the celebrated act; drift stays quiet and still.
- **Drift never breathes** (S, wow 3/5, MICRO-GRAMMAR uncaused) — disable all idle breathing in st-drift; one soft pulse of the Back-to-plan door only when the 10-minute nudge threshold fires. Stillness = neutral presence; the one pulse points home.

### BREAK + BREAK'S UP (st-break / breakup)
*Amber coffee striped tile with countdown, but full top chrome persists AND renderSwitchChips paints a SWITCH TO row on a pause screen. Ring FILLS as the break elapses (reads backwards); break's-up is a text swap at 0:00.*

- **The draining ring** (S, wow 4/5, BATTERY at-a-glance) — invert setRing for break: draw the REMAINING fraction so the amber arc drains toward zero, arc-head dot at the drain edge. Kitchen-timer instinct honored.
- **The waiting-goal chip** (S, wow 4/5, CHOICE-ROW v3 + CALM) — replace switch-chips + ctx with ONE matte chip above the doors: bare domain icon + «Deep work is waiting», rest grammar; tap = resume. Two chrome pieces become one calm object.
- **Doors that wear the goal** (S, wow 3/5, DOORS + CALM) — Resume = 54px solid door in the waiting activity's domain color; +5 becomes a small k-dur chip row (5/10/15); End break = ghost. Sub-line «held · streak safe · 12:00 left».
- **The break's-up beat** (M, wow 4/5, MICRO-GRAMMAR) — at 0:00: one spring pulse of the ring, amber crossfades into the waiting activity's color, title springs to «Break's up», the Resume door does a single focal breathe — then stillness.

### CLAIM (welcome back, st-claim)
*Already door-composed — but the CSS purge hides #tfTime/#tfCtx/#tfElabel while the JS still writes the gap facts into them: the away-duration and gap span are INVISIBLE, so the user decides blind.*

- **Put the gap back in words** (S, wow 3/5, COMPOSITION keep-function) — one sub-line carrying what app.js:3287-3289 already computes: «away 1h20m · Deep work 14:00–now». Chrome leaves, function stays.
- **The gap heals in miniature** (M, wow 5/5, BATTERY + STRIPE GAUGE + no-random-features) — a 240×14px mini timeline strip above the doors: the claimed block matte, the gap span a ghost dashed segment. On Claim, the segment ignites left→right into the block's 9px stripes (350ms spring) before the sheet closes — the conversion witnessed in miniature, then found again on the real timeline.
- **Return = tier-2, on the house** (M, wow 5/5, REWARD INVERSION) — tfClaim already earns spark and bumps streak silently (app.js:4181). Surface it: counter-pop + points-fly from the mini strip toward the dock. Return-after-gap is the inversion law's flagship and its biggest moment currently renders as nothing.
- **The door states its gift** (S, wow 3/5, SOUL + CLASSY) — under Claim: 11px «logs 1h20m + keeps going». Not mine stays ghost, no sub-label — the way out costs nothing, not even reading.
- **Address the person, not the block** (S, wow 3/5, COCKPIT GRAMMAR) — title = «With you again» at 21px; the block name demoted into the evidence sub-line.

### NIGHT (st-night)
*Own indigo gradient (good instinct) but the tile is #5a4a86 through saturate(.4) brightness(.7) — the muddy mid-tone the jewel law rejects — and Breathe is a solid #9a8cff purple hero. Ring runs a 7s opacity pulse.*

- **Cosmos, not mud** (S, wow 4/5, JEWEL) — tile = solid deep-cosmos indigo (COSMOS family, no filters) with the moon icon; ring = hairline indigo; Breathe re-inked deep indigo with white label. Purple leaves the hero slot.
- **Three living stars** (S, wow 4/5, MICRO-GRAMMAR ⑤) — 3 two-pixel stars with staggered 8-14s opacity breathes (the approved intro grammar); the ring's pulse retires — the breather budget spent on the sky, once.
- **The morning in hand** (M, wow 4/5, no-random-features + BATTERY) — one matte chip under the doors: tomorrow's first planned block — «morning holds · Gym 08:00» in rest grammar; tap peeks tomorrow. «I've got the morning» becomes a checkable fact.
- **Sleep-math whisper** (S, wow 3/5, CALM + CLASSY) — if wake time is known, the sub-line reads «lights out by 23:40 = a full 8h» (existing sleepmath arithmetic); tap opens the sleepmath stage.

### FOLDED LIVEDOCK (all dock states)
*Dark bar with a 40px mini circle whose on-plan signal is a flat green rim, an inline-styled ON PLAN/DRIFT text badge, status sub-line, pink elapsed, switch square, and a seg row of identical dark chips. Functional; speaks none of the new finish language.*

- **The mini ring earns its arc** (M, wow 4/5, BATTERY + MICRO-GRAMMAR morph-pairs) — a real conic progress arc on the ::after (JS sets --ldp like setRing): the folded circle becomes the big ring at 1:6, and the ldStop→tfRing FLIP morph gains fidelity for free.
- **Badge → finish** (S, wow 3/5, CALM + COCKPIT GRAMMAR) — delete the inline text badge (app.js:3068); encode it: on-plan = elapsed number turns #28cf86 beside the green arc, drift = the mini circle goes solid cool-gray. The sub-line still says the words for Mom-literacy.
- **The primary chip wears its finish** (S, wow 4/5, DOORS + shared-matrix contract) — in renderDockSeg, the primary control inherits its door finish at chip scale (Make a plan = striped blue, Done = solid green, Resume = solid domain). The folded row previews exactly the doors it morphs into.
- **Minute pop, shared grammar** (S, wow 3/5, MICRO-GRAMMAR one-family) — the dock's elapsed uses the same whole-minute counter-pop class as the expanded cockpit. One physics, two scales.
- **The nudge announces itself once** (S, wow 3/5, MICRO-GRAMMAR + SOUL gentle) — when ld-nudge first flips on, the sub-line gets a single 2s pink underline sweep, then stillness. The threshold crossing is a legitimate cause for one motion.

### KEEP-GOING FUSION (tfKeepGoing — track→plan in one tap)
*The group's deepest mechanic renders as its shallowest moment: a generic durationSheet modal, then a toast while the cockpit sits unchanged. The commit-elapsed follow-up is a text swap in the 1s loop.*

- **The sheet rises from its door** (M, wow 4/5, MICRO-GRAMMAR ② + frame-07 canon) — replace durationSheet with the docked-sheet pattern inside the cockpit: «{Activity} — how long more?» + k-dur chips + a bare-text «switch activity» foot link, rising from the Make-a-plan door. Same information, zero modal.
- **The ignition is the receipt** (M, wow 5/5, BATTERY conversion + toasts retired) — on commit, kill the toast. The ghost ring IGNITES: one blue sweep travels the circumference (400ms spring — plan born) and settles into the green on-plan arc while the sub-line springs to «yours till 18:30». «The second you decide how long, it becomes a plan» — performed by the cockpit itself. The signature moment of this surface group.
- **Commit-hit becomes a mini-claim** (M, wow 4/5, REWARD INVERSION + DOORS) — when the committed stretch elapses: ring full-green pulse, primary door turns solid green «Done — claim it», sub-line «committed 30m · done». A visible finish line for the promise.
- **Dock echo** (S, wow 3/5, MICRO-GRAMMAR + folded==expanded) — fusion fired from the folded seg: the dock's green arc does one spring pulse, sub-line «on plan · yours till 18:30». No toast, no expansion.

### SWITCH MENU (title pill + SWITCH TO chips)
*Two switch systems share the live screen: an always-visible SWITCH TO row of dark chips plus the colored title pill opening the full bentoPicker. Redundant chrome on every live render.*

- **One door: the pill** (S, wow 3/5, CALM chrome-leaves) — remove the tf-switch chips row entirely; the title pill with its ti-switch-horizontal affordance remains THE switch door. One CSS line.
- **Continue-earlier row inside the picker** (M, wow 4/5, CHOICE-ROW v3 + COMPOSITION keep-function) — fold tfSwitchTargets into bentoPicker as a pinned first section «next up / continue» — 3 rest-grammar chips; block targets route through startPlanned so plan-points survive.
- **The pill acknowledges** (S, wow 3/5, MICRO-GRAMMAR ①) — .tf-title.switchable gets the full press grammar + a 200ms background crossfade when the activity switches. The identity change is witnessed, not teleported.

---

## DAY — the timeline

### Day timeline canvas (continuous scroll)
*calendarView (app.js:5854) renders a per-hour sky gradient, adaptive hour rail, temporal anchors, day-stackseps with a plain «N/N done» chip, berry streak chip. Physics are superb; the canvas encodes only clock-time — nothing of what was LIVED shows in the environment.*

- **The lived-hours thermograph sky** (M, wow 5/5, BATTERY + CLASSY 90%-dark + reward INVERSION) — mix each past hour's gradient stop 4-6% toward #ff5fa8 proportional to that hour's tracked/matched coverage (computed while stops are built at app.js:5866). Hours you lived hold a faint retained-heat rose; empty past hours stay pure night. The GitHub-graph effect INSIDE the day — one gradient string change, zero new elements, zero scroll cost.
- **Day-separator hairline battery** (S, wow 4/5, CLASSY pips + gold=EARNED + one-physics) — replace the «N/N done» text chip (app.js:2949) with a 44px ink track of N notches (one per planned block) filling GOLD as they match; count beside in 11px Jost. Twin of the header crown-progress pill.
- **Present-room vignette** (S, wow 3/5, WARM FLOOR + CALM + now=brightest) — fixed 90px top/bottom fades inside .day-cardscroll toward #241019 (two pointer-events:none overlays, static CSS). The centered stretch reads as the lit room; never touches scroll/gesture code.
- **The midnight seam** (S, wow 3/5, one-physics + gold=EARNED + JEWEL) — today-adjacent seps become a night seam: 1px deep-indigo hairline, 2 tiny stars, the day label — and a 12px gold crown pip inline when the finished day above earned its crown (dayStats().perfect).

### Block visual states (plan+real lanes, battery finishes)
*sched = dim 9/18px stripes, done = brighter jewel stripes fused full-width with INFINITE foil sweep, ghost = dark hollow, partial splits shining+ghost, miss = grayscale. The battery metaphor lives here — but every done block shimmers forever, futures dim by flat distance, misses offer no way back.*

- **Only the newest victory shimmers** (S, wow 4/5, MICRO-GRAMMAR ⑤ + reward INVERSION) — keep the animated .cele sweep only on the most recently completed block of the visible day; older wins freeze to static .shine gloss. One living reward; each new completion visibly steals the light.
- **Next-up block carries the blue charge** (S, wow 3/5, blue=plan + BATTERY + CLASSY hairline) — the FIRST upcoming block gets full plan-brightness stripes + a 1px #36b3f0 hairline inset («this is loaded next»); later blocks step down two matte levels.
- **Ghost blocks offer the way back** (M, wow 4/5, SOUL always-a-way-out + goal engine ③) — a missed high-prio block renders a bare mauve ti-arrow-back-up (44pt hit area); tap re-places it at the next free slot after the now-line via findSlot (app.js:2856), the burning animation run in reverse. The ghost itself hands you the door.
- **Near-miss percent pip** (S, wow 3/5, earn map T2 + mirror-not-price) — a 12px Jost-700 «87%» pip at the matched bubble's right edge; the remainder ghost shares a dashed top edge. This much lived, this much left.
- **Calm the untitled stub** (S, wow 3/5, now-line=brightest + CHOICE-ROW v3 rest) — the .emptyblk stub (currently louder than the now-line) restyles to rest: dark pink tint, SOLID pink outline, bare ti-plus + «choose». A quiet held seat, not an alarm.

### Now-line + live tracking render
*5px pink line with capped end dots and glow, nowcirc icon disc, right-side readout or plain «NOW 15:42» when idle. It works — but the actual CONVERSION is invisible at the contact point.*

- **The converter seam** (M, wow 5/5, BATTERY — the now-line IS the converter, its missing signature moment) — where the live bubble's top edge meets the now-line, a 3px strip in the activity's own color with a slow 2s light-band traveling across it (transform-only, GPU-safe). You literally watch matte time being converted to shining time at the line of contact. Killed the instant tracking stops; never renders below the now-line (C9a hard rule).
- **Now-cap breath on idle, never two alive things** (S, wow 3/5, MICRO-GRAMMAR ⑤ + CALM) — idle: the now-line's left cap dot gets a 3s scale/glow breath, nowcirc goes ghost-matte. Tracking starts: the breath stops, the converter seam takes over. Alive in exactly one place, and WHERE it breathes tells the state.
- **Now-line flare on bump** (S, wow 4/5, MICRO-GRAMMAR ① + now-line=brightest) — when a dragged block hits the now-floor (_bumpedNow, app.js:5991), the now-line's cap dots flare once (scale 1→1.6→1 spring, 240ms). The block knocks, the present answers. Pure CSS class, geometry untouched.
- **Odometer minutes on the live elapsed** (S, wow 3/5, CLASSY + §9 expensive grammar) — the changing minute digit rolls up 120ms in a masked span. Watch-grade detail on the number you stare at most.
- **Idle NOW readout becomes a jewel pill** (S, wow 2/5, THE KIT + CLASSY) — recast «NOW 15:42» as a 24px matte-berry pill, 2px ink border, 1px pink hairline inset, hard 0-2px-0 shadow — the header Now pill's small twin riding the line.

### Timeline header + week strip
*Row 1: scope segment, day label, Today/Now pill, ⋯; row 2: weekStrip with bare letter+date cells marking only sel/today. Two rows of chrome that know nothing about how the week was lived; the planned crown-progress pill isn't built.*

- **Week-strip cells speak the battery** (S, wow 4/5, one-physics + CLASSY pips + no-shame) — under each cell's date, a 3px underline segment: gold hairline when crowned, pink filled to match-ratio for lived days, matte for future, dashed for away. The crown calendar at day-zoom, zero words.
- **Crown-progress = notched hairline, not text** (S, wow 4/5, readable-at-every-literacy + gold=EARNED) — build the planned header pill as a 44px ink track, one notch per planned block, filling gold on match. Tap = scrollToNow. Twin of the day-separator battery.
- **Header folds to a whisper on scroll** (M, wow 3/5, CALM + NAV QUESTION direction) — on downward scroll the week strip slides up under row 1 (height 0, 240ms spring); scroll-up or edge-tap returns it. Class toggle + CSS only; reuses the _navLock discipline (app.js:2971), no gesture arbitration touched.

### Day-tools ⋯ menu
*dayToolsMenu (app.js:2781) — a plain dropdown of 9 text rows popping with no motion. Spec already calls for an icon grid; these go further.*

- **Icon grid rising from its cause** (S, wow 3/5, MICRO-GRAMMAR ② + NO-CONTAINERS amendment) — 3×3 grid of 56px cells: bare own-color Tabler icon + 11px white label on a radius-16 #22091a card, 2.5px ink border, 0-4px-0 shadow; transform-origin at the ⋯ button, scale .6→1 spring.
- **Hold-to-clear with an ink ring** (S, wow 3/5, CLASSY + CALM) — demote Clear+Undo to a bottom hairline ghost row; Clear becomes a 500ms hold with a 2px ink progress ring around the eraser icon. Destruction becomes deliberate.
- **One clairvoyant cell** (M, wow 3/5, energy-door routing + no-random-features) — the first cell adapts using existing phase() + avoidedBlock(): morning = Plan today in blue stripes, evening = Reflection, drift detected = the Reversal door. Exactly one adaptive cell, eight static.
- **Undo shows its depth** (S, wow 2/5, SOUL way-out-made-visible) — the Undo cell renders «×3» in 10px Jost-700 when undoStack.length > 1. The safety net visible before you dare a Clear.

### Block editor sheet (deep edit)
*editorSheet (app.js:6199) — functional but old-skinned: solid colored hero, −/+ start row, log slider, prio 3-seg, collapsible steps, «mark done» text button, legacy #sheet modal. Pre-KIT body.*

- **Re-body the editor with THE KIT** (M, wow 4/5, FRAME-FIDELITY step 1 + CALM) — same functions, frame geometry: 21px title, 11.5px letterspaced pink section labels (СТАРТ / ДЛИНА), the 30/60/90 chips from upload 09 with the slider demoted behind Ещё, radius-16 night card, 54px doors, air. The one heavy timeline surface still in v700 skin.
- **Hero door wears the block's battery state** (M, wow 4/5, COCKPIT GRAMMAR + BATTERY) — the hero renders in the block's CURRENT timeline finish: future = matte stripes, done = bright stripes + static shine, missed = dark tint + outline. The editor announces what this block IS in the timeline's own vocabulary.
- **Mark-done ignites green** (S, wow 4/5, CHOICE-ROW v3 + green=GO + no-gold-on-selection) — a v3 row: rest = dark green tint + solid #28cf86 outline + ti-circle-check; tap = IGNITION into green 9px stripes + ink border while the celebration fires on the timeline behind.
- **Steps become the circle ladder** (M, wow 3/5, goal ENGINE ① + one-reward-language) — restyle step rows to the quest-card ladder: 22px circles on a 2px ink rail, active = domain color, done = filled green + check; add/reorder/delete untouched (app.js:6247).

### Edge inspector (UNBUILT — upload 09 is the pixel spec)
*Does not exist. Frame: right panel ~55% width on #1e0b18, day stays live at left; icon+name header, НАЧАЛО with −/+ pills, three chunky duration chips, bare color dots, ghost «Ещё >», muted «удалить». Remaining item in §12 RUN STATUS.*

- **Panel physics: rise from the block, day never leaves** (L, wow 5/5, spec §2 edge inspector + menus-rise-from-cause + NO-GOLD-on-selection) — tap a block → the panel slides from the block's right edge (320ms spring, transform-origin at the block's Y); the day compresses to the left 45% and STAYS live-scrollable. The edited block gets a pink halo (never gold); siblings dim 20%. Tap-outside or drag-right commits and closes.
- **Every chip writes the timeline live** (M, wow 5/5, regression contract #2/#3 + MICRO-GRAMMAR) — 30/60/90 chips resize the visible block behind through its existing height transition; −/+ pills slide it in 5-min steps with drop clamps intact (floor = now for future blocks). Cause on the right, effect on the left, zero confirmation step.
- **Bare dots re-type the block** (S, wow 3/5, CLASSY + upload-09 fidelity) — four 28px bare color dots (likely alternate domains), current ink-ringed; tap re-domains live; the fourth is ti-dots opening the full bento. The fastest «this was actually Move, not Focus» correction.
- **Door hierarchy: Ещё ghost, удалить hold-to-fill** (S, wow 3/5, DOORS + CALM) — «Ещё >» = 48px ghost door into the full editorSheet; «удалить» = bare trash + word in muted #ff9dc6 with a 450ms hold-to-fill before firing (with pushUndo).
- **Two lane modes, one inspector** (M, wow 3/5, plan/real invariants + BATTERY) — opening on a REAL-lane log flips to the tracked language: «tracked 14:05–14:35 · 30м», −/+ clamped to the past, duration chips hidden, green hairline inset replaces pink.
- **Ghost-block inspector offers return** (M, wow 4/5, SOUL return=flagship + goal engine ③) — opened on a missed block, one extra door: «Вернуть в день» — solid #36b3f0, 52px — re-placing via findSlot. Inspecting a failure hands you its comeback.

### Empty-day state
*Genuinely blank rails — sky, hour lines, no copy, no door. The «No plan yet» invitation lives on a different surface entirely. Spec demands one warm line + the plan-day door.*

- **The invitation composition** (M, wow 4/5, spec §2 + COMPOSITION + DOORS) — for an empty today, centered at wake+2h: one warm 15.5px line («Чистое небо. Один план его зажжёт.»), one 54px solid-pink door → shapeFlow(k), one ghost «Скопировать вчера» when yesterday has blocks. Container pointer-events:none except the doors — physics pass through.
- **Ghost-hand teaches the long-press** (S, wow 3/5, ghost-hand hints + CALM) — one matte outline stub at 9:00 at 20% opacity: «подержи пустое место — появится дело». Rendered until the first long-press-create succeeds, then gone forever.
- **Tomorrow's door is blue** (S, wow 3/5, PALETTE one-pink-hero + blue=plan) — empty FUTURE days get the same composition with a blue striped door «Спланировать завтра». The color says: preparation, not presence.
- **Empty past day = a quiet moon** (S, wow 2/5, SOUL no-shame + JEWEL) — a past day with nothing gets one line at noon-height: «Тихий день» + bare ti-moon in muted lilac. Absence is rest, never debt.

### Create + zoom + drag gestures
*Long-press 360ms creates, double-tap toggles 64↔150 hour-px, pinch zooms minute-anchored, corner grip resizes, drag with lift/armed-now. The physics are the crown jewel; feedback DURING gestures is where the wow lives.*

- **The hold plants a growing block** (M, wow 4/5, MICRO-GRAMMAR ① + BATTERY being-born) — during the 360ms create-hold, after 120ms of stillness render a matte outline stub growing 0→30min height from the press point; moved-cancel melts it, firing hands it to makeBlock. Creation feels like planting. Contract #3 untouched — same code path, preview only.
- **Three named zoom detents on double-tap** (M, wow 4/5, five-zooms thesis + one-handed law) — add a 28px «glance» detent where wake→bed fits one viewport, cycling glance→standard→close via animateHourPx. Pinch stays continuous; detents live only on the tap path.
- **Drop position gets a precision readout** (S, wow 3/5, CLASSY + contract #2 made legible) — while dragging, a 10px time label («15:05») rides the block's top-left, updating with the 5-min snap; turns pink at the now-floor clamp. Place blocks like a watchmaker.
- **Resize grip breathes its affordance once** (S, wow 3/5, ghost-hand + nothing-uncaused) — on a block's FIRST-ever resize-eligible render, the grip's corner line draws itself in once (400ms), then stays static.

---

## DAY — plan-day flow

### Plan-day entry (front door + empty-day state)
*shapeFlow(k) dumps the user straight into the first bentoPicker — no cover beat, no sense that a ritual is starting.*

- **The cover beat — a one-breath front door** (M, wow 4/5, COMPOSITION + DOORS + MICRO-GRAMMAR ② + SOUL) — before beat 1, a full-screen cover on the five-element body: ti-map-2 grab, «Каким будет сегодня в лучшем виде?» (21px), one sub-line, solid blue 54px «Собрать день» + striped «Мой шедевр» (if saved), ghost «позже». Rises from the button that caused it.
- **Beat progress pips across the whole flow** (S, wow 3/5, BATTERY + blue=plan + CALM) — a 4-segment dash bar (the v819 pattern, BLUE not gold) pinned in the bento head: Energy · Work · Love · Else. A 90-second staged ritual, and you're 2/4 through.
- **Empty-day invitation owns the plan door** (S, wow 3/5, CALM + DOORS + no-random-features) — the empty-day warm line ends in this flow's door: one 54px solid-blue «Спланировать день» opening the cover beat rising from itself. The empty day has exactly one verb.
- **Retire the emoji sun from the fallback labels** (S, wow 2/5, Tabler-only) — the cockpit fallback lines still carry sun emojis (app.js:4626, 4628). Strip them; keep the ti-sun-high in the chip. Hard-rule compliance.

### Big-3 beat pickers (Energy / Work / Love)
*Each beat closes the whole bento-ov and reopens a fresh one — full-DOM rebuild, visible flicker, no spatial continuity. The identity card is nice but small; Next is the generic green bento-go.*

- **THE LIVE MINI-TIMELINE PREVIEW STRIP** (L, wow 5/5, GRAND-REDESIGN §2 specced signature + BATTERY + MICRO-GRAMMAR) — a 56px rail pinned above the bento-foot, persistent across all four beats: a compressed 08:00–24:00 track with existing blocks as dim slivers and the now-line as a 2px pink tick. Every committed pick lands as a MATTE domain-tinted card sliding into its projected slot (a dry-run of the distributePlan gap-fill, so the preview never lies); deselect pops it out. You watch the day forming — uncharged battery cells waiting for the now-line.
- **Beat-slide transitions — one overlay, sliding rooms** (M, wow 4/5, MICRO-GRAMMAR ③④ + landmine no-new-wipes) — keep ONE bento-ov alive; on Next/Back the body slides horizontally (~280ms spring) while head + preview strip stay fixed. Kills the close/reopen flicker; Back literally goes back.
- **The identity line becomes the beat's hero** (S, wow 3/5, COMPOSITION + CLASSY + CALM) — rebuild big3HeadNode on the kit: «You're being Focused & Calm» at 17px with the virtue word in its jewel color on a hairline-inset k-card; the virtue word glows once on beat entry, then rests.
- **Next door goes blue; Skip goes ghost** (S, wow 3/5, PALETTE blue=plan + DOORS) — recolor the flow's doors solid #36b3f0 (Next and Arrange are plan energy); Skip becomes a bare ghost word. Green stays reserved for the moment tracking starts.
- **«Been meaning to…» gets the courage frame** (S, wow 3/5, CLASSY + SOUL courage=T2) — a ti-flame in the section label + each avoided chip a 1px inner fire-orange hairline; picking one triggers a single 200ms ember flicker. Courage honored without preaching.

### Everything-else beat (play/upkeep)
*Same bentoPicker with a static EVERYTHING ELSE header; no awareness that fundamentals are the usual gap — enhancePlan() lives in a different menu.*

- **The fundamentals hand — one-tap floor** (M, wow 4/5, CHOICE-ROW v3 + floor/ceiling principle + no-random-features) — one k-row «Основа дня — душ, еда, прогулка» with a micro-silhouette of missing fundamentals (tiny matte dashes); one tap commits them all (reusing getFund()/enhancePlan minus what's planned). The floor of a day should never cost seven taps.
- **Rename the beat in the world's voice** (S, wow 2/5, CALM + COMPOSITION) — «Everything else» is an SQL clause. Head: «Остальная жизнь», sub «отдых, дом — день держится и на этом», full kit scale.
- **Empty-pick exit gets a warm landing** (S, wow 3/5, SOUL no-shame + MICRO-GRAMMAR ⑤) — replace the system-burp toast with a 1.5s beat: guardian circle + «Пусто — тоже ответ. Я рядом, когда будешь готов.», then dissolve.

### Arrange your day (orderStep editor)
*Drag-reorder with FLIP (good bones) but visually a settings list: berry rows, wordy hint, amber pips, a GOLD drag halo, green commit. Times are invisible.*

- **Make it a real mini-timeline: live projected times** (M, wow 5/5, §2 you-SEE-the-day + BATTERY + CALM show-don't-explain) — a left time gutter: each row shows its projected start computed live by running the distributePlan cursor over the current order+mins; drag a row or tap a length chip and every time under it reflows with a 150ms count-settle. The abstract list becomes the actual day; the hint sentence dies.
- **Rows become matte battery cells** (S, wow 4/5, BATTERY + JEWEL + v3 rest grammar) — row background = the block's domain color mixed ~85% into berry, 2.5px ink border, colored bare icon — identical DNA to how the block will render matte on the timeline. Commit stops being a leap of faith.
- **Kill the gold drag halo; sink-and-lift grammar** (S, wow 3/5, gold=EARNED + MICRO-GRAMMAR) — lifted row scales 1.03 with a hard 0-10px-0 ink shadow; drop = one spring settle. Gold never touches chrome.
- **Importance pips as fine jewelry** (S, wow 3/5, CLASSY pips + SOUL never-red) — 8px pips with 1px ink ring, filled = the row's own domain color; «важно» appears at 10.5px only on the row you're touching.
- **The commit door counts and breathes** (S, wow 4/5, DOORS + blue=plan + mirror-not-price) — a 54px solid-blue door: «В день — 5 дел · 3ч 30м» (live total). Seeing «6ч 30м» before committing is the gentlest overplanning guard — a mirror, not a warning.

### The finish moment (distributePlan commit → timeline)
*distributePlan gap-fills silently; the overlay closes, renderToday repaints. The highest-emotion beat of planning has zero ceremony.*

- **The day fans out — cascade landing** (M, wow 5/5, §2 specced finish + MICRO-GRAMMAR + BATTERY lands-matte) — on commit: close the overlay, auto-scroll to the first new block, and the new blocks cascade in top-to-bottom on the v648 staggered spring, landing MATTE; the now-line pulses once at the end. Reuses the shipped portal-reveal machinery — pure choreography.
- **One guardian seal line, then silence** (S, wow 3/5, SOUL inversion planning-earns-nothing + CALM) — after the cascade: one non-toast line for 2.5s — «День собран — 5 дел. Увидимся на первом.» No points, no confetti; the economy pays at the now-line, not the drawing board.
- **First-block handshake** (S, wow 3/5, blue=start + no-random-features) — if the first block starts within ~45 min, its edge gets a 1px blue hairline breath (2 pulses, then still) and the cockpit's next-up sub-line updates live. Plan energy handing over to start energy with no seam.

### Suggestion bar (suggestBar / renderSuggest)
*A wall of full-saturation domain chips with a glow-haloed hero and a solid GOLD «all my activities» door — three palette violations in 40 lines. Content logic is good.*

- **Suggestions rest matte — v3 rows** (S, wow 4/5, CHOICE-ROW v3 + BATTERY + CLASSY) — rebuild sugchips as compact rows: dark own-color tint, solid outline, bare icon, white title + muted why-line; the hero is simply TALLER with its why-line always visible. Tap = ignite 250ms, then fly to its slot. Suggestions must not outshine lived blocks.
- **The gold door dies; blue striped takes over** (S, wow 3/5, gold=EARNED + DOORS) — the #ffc83d sugdoor becomes a 52px striped-blue «все занятия» door. One property, outsized law compliance.
- **The why-line names the source with one icon** (S, wow 3/5, SOUL proves-it-learned + CLASSY) — prefix each why with its source mark: ti-target «из цели Artist», ti-home «дом просит · 6д», ti-clock «твоё окно фокуса». The mirror made visible.
- **Accepted suggestion flies to its slot** (M, wow 4/5, MICRO-GRAMMAR) — on tap the row lifts, shrinks into a small matte card, and translates to its landing position with a spring settle; then renderToday reconciles. Cause and effect stay physically connected.

### What's-next sheet + masterpiece presets (suggestSheet)
*Legacy #sheet surface riddled with emojis; the masterpiece system (save/fill/skeleton) is powerful but buried as text buttons; suggestDay hardcodes off-palette hexes.*

- **Masterpiece hands — preset cards with day silhouettes** (M, wow 5/5, §2 one-tap hands + BATTERY + COMPOSITION) — 2-3 k-cards, each with a MICRO-SILHOUETTE of its day: 8-10 thin matte domain-colored bars, lengths proportional to mins — a fingerprint of the day at a glance. «Мой шедевр» (ti-crown, if saved), «Каркас дня», «Обычный день». One tap fans the hand onto the timeline with the cascade.
- **Emoji purge + kit rebuild of the sheet** (S, wow 3/5, Tabler-only + CALM) — ti-sparkles / ti-brain / ti-crown / ti-device-floppy; body rebuilt on k-card/k-q scale. The sheet currently reads as pre-redesign archaeology.
- **Saving a masterpiece becomes an EARNED moment** (M, wow 5/5, SOUL inversion + gold=EARNED + no-random-features) — move «save as masterpiece» out of this menu into the reward path: after a crown day, the PM moment offers ONE card — «Этот день — корона. Сохранить как твой шедевр?» with a gold hairline inset (legitimately earned). A trophy minted from a lived day.
- **suggestDay colors join the palette** (S, wow 2/5, JEWEL) — route every template block through DOM[domain].c (kills #2a9fe0/#ff8a1e/#9a5cf0/#48d0e0 in suggestDay and skeletonDay).

### Replan / plan-a-break chain (planBreak, playFirst, tfReplan)
*Solid mechanics (new plan owns now→future, truncates the straddler, pins at now) but the chain is two disconnected modals and the no-shame replan semantics are invisible.*

- **The consequence strip — see the cut before you make it** (M, wow 5/5, BATTERY + CALM show-don't-warn) — in the replan duration step, a 44px mini-strip: the straddling block drawn shrinking to end at the now-line (future half fading to ghost) and the new matte card growing rightward as you tap durations. Truncation stops feeling like data loss and starts feeling like steering.
- **The streak-safe shield line** (S, wow 4/5, SOUL replan-is-honorable) — one fixed sub-line: ti-shield-check + «осознанно — не дрейф». The planned-vs-drift distinction is the soul of the tracker and it's currently a code comment.
- **One sheet, two rooms — collapse the modal chain** (M, wow 4/5, COCKPIT GRAMMAR layered rooms + MICRO-GRAMMAR ②) — after picking the activity, the bento body slides left and the duration room slides in within the SAME overlay; Back returns. Kills the double-flicker.
- **Replan lands with a single pin-tap** (S, wow 3/5, MICRO-GRAMMAR) — the new pinned block gets one press-in-and-release acknowledgment, and pushed-down future blocks slide with FLIP instead of teleporting.

### Duration sheet (durationSheet)
*A centered modal with SIX solid-pink chips (an all-pink chip wall — frame 07 shows the corrected form: dark chips, ONE pink). Reused by a dozen callers.*

- **Rebuild to the canon frame: dark chips, one lit** (S, wow 4/5, APPROVED CANON ① + CLASSY one-fill + v3 ignition) — adopt upload-07's duration row exactly: k-dur chips (#48122f, 2.5px ink, 0-3px-0), the DEFAULT pre-lit pink; tapping another moves the single lit state. Four smart chips (15м/30м/1ч/2ч) + «±» opening the full six.
- **Duration memory — the default chip knows you** (M, wow 5/5, SOUL app-learns-you + day-one contract) — pre-light the chip nearest the MEDIAN of your past logged durations for this exact title (fallback: domain median, then 30m); sub-line whispers «обычно ~50м». Tenth time you plan Deep work, the sheet already knows it's a 90.
- **Rise from the cause, not the void** (S, wow 3/5, MICRO-GRAMMAR ②) — pass the source element; the card scales from the tapped control's rect. The most-repeated modal in the app finally obeys the grammar.
- **The header carries the activity's soul** (S, wow 3/5, frame-07 verbatim + NO-CONTAINERS + DOORS) — the activity's own tiClass icon in domain color (bare, 22px) + «Глубокая работа — сколько?»; the extra-action row becomes a ghost text line; «cancel» → ghost «не сейчас».

### Legacy planSheet («Plan tomorrow» path)
*A pre-redesign pickerSheet with emojis, a raw time input, pchip walls and its own block-list footer — a THIRD planning UI beside shapeFlow and playFirst.*

- **Retire it — one planning language** (M, wow 4/5, landmine no-parallel-menus + CALM) — route «Plan tomorrow» to shapeFlow(tomK()); delete planSheet after a deprecation session. The constitution forbids grafting parallel menu systems.
- **Fix shapeFlow's shapeK for non-today days** (S, wow 2/5, regression hygiene) — shapeFlow(k) sets S.shapeK = todayK() unconditionally (app.js:6566). Set S.shapeK = k. One-line correctness fix; prerequisite for the retirement above.
- **Tomorrow-planning gets the plannedAhead glint** (S, wow 3/5, SOUL mirror + BATTERY) — future-day commits get the seal line «Спланировано заранее — завтра это стоит больше» (plannedAhead already pays), and the preview strip renders tomorrow's rail with a faint dashed left edge — not yet reachable by the now-line.

---

## WEEK-MONTH — the crown calendar

### Week strip (day-view header, weekStrip app.js:2769)
*Seven letter+date buttons; selected = flat pink pill, today = pink text. Purely navigational — the most-seen chrome in the app knows nothing about lived days, crowns, or streaks. Weekday letters hardcoded EN; week-crossing rebuilds with an instant innerHTML wipe.*

- **Battery pips — the week's story under the dates** (S, wow 4/5, BATTERY + CLASSY + reward INVERSION) — under each PAST day's number, a 3px×12px pip: solid #ff5fa8 at opacity scaled to dayStats(dk).ratio, a hairline gold pip for crowned days, nothing for quiet days. The strip David glances at 50 times a day becomes the week's battery readout — zero added area.
- **Return-after-gap gold spark in the strip** (S, wow 4/5, SOUL return=flagship + gold=EARNED) — the first active day after ≥3 quiet days gets an 8px bare ti-sparkles in #ffd24a at the cell's corner. Gap days stay plain — never dimmed, never marked.
- **Selection ignition + press grammar on strip cells** (S, wow 3/5, MICRO-GRAMMAR ①③) — .pws-day gets the press acknowledgment; .sel lands with a spring pop instead of appearing. Cells stay solid pink (small cells never shrink stripes).
- **Week-crossing slide instead of the innerHTML pop** (M, wow 3/5, MICRO-GRAMMAR uncaused + landmine) — wrap the 7 cells in a slider row: old week translates out ±100%, new week slides in, direction-aware, 260ms spring — the same physics as the day pager beneath it.
- **Live-record dot on today's cell** (S, wow 3/5, G7 affordance + BATTERY) — when a tracker is running, today's cell shows a 4px blinking pink record dot beside the date. Recording visible even while scrolled to another day.

### Zoom switcher + header (scope-seg + vestigial #zoomTabs)
*Live switcher = three 30×28 icon buttons — below the 44pt law. The week/month header shows dead static text plus per-page sticky labels. A retired #zoomTabs bar still ships with PURPLE selection fill — the last palette violation in the codebase.*

- **Purge the purple ghost (#zoomTabs)** (S, wow 2/5, PALETTE + REJECTED set + leave-it-cleaner) — delete the retired #zoomTabs markup (index.html:1816) and its CSS, or re-skin to the kit if renderToday's non-home branch must survive. Dead code in the regression zone is a trap.
- **Kit-skin the scope segment at 44pt** (S, wow 3/5, CALM 44pt + kit) — #22091a well, 2px ink border, radius 11; buttons with a ::before expanding hits to 44pt; selected = solid #ff5fa8 + ink glyph + press-sink. Kill the 26px .pull-rt variant — one size everywhere.
- **The header title becomes the live zoom label** (M, wow 4/5, CALM + approved mock fidelity) — replace the dead «Weeks»/«Months» text with a label tracking the scroll («Июль», «29–5») via a snap listener + IntersectionObserver; the per-page sticky labels shrink to quiet 12px or die.

### Week view — the bridge zoom (weekGrid app.js:6137)
*Honest and close to the approved mock: 7 columns of real blocks, real-lane ribbon, crowns, per-column flames, today pink. Missing: any sense of NOW inside today's column, a weekly story, cause-anchored zoom, and the fire reads as seven identical flames.*

- **The now-line crosses today's column** (S, wow 4/5, BATTERY the-converter brightest) — inside today's .wkstrip, a 2px #ff5fa8 line at the now-minute height with a 6px dot and a faint pink fade above. One glance at week zoom shows how far today's battery has burned; 6 lines in weekGrid.
- **Fire as ONE run, not seven flames** (M, wow 4/5, CALM + fire levels + approved mock) — replace per-column flames with a single streak object: a 3px ember underline spanning consecutive active columns, one flame at the run's leading edge, underline colored by fire level (ember <3, orange <7, blue ≥14). dayOnFire already gives run membership.
- **Weekly mirror line under the columns** (S, wow 4/5, SOUL mirror-not-price + CLASSY) — one muted 12px line per week page: «4 жилых дня · 2 [ti-crown] · серия 3» — no percentages, no grades. David's Sunday review gets its sentence.
- **Tap dives INTO the column (cause-anchored zoom)** (M, wow 5/5, MICRO-GRAMMAR ② + the zoom thesis) — pass the tapped column's center-x into zoomAnim as transform-origin for both snapshot and incoming day view: the week visibly collapses into that column and the day rises out of it. The moment «one world, five zooms» becomes something you feel in your thumb.
- **Crowned-column landing shimmer** (S, wow 3/5, gold=EARNED + one-breather) — when a week page snaps into view, any crowned column's gold border runs ONE 600ms hairline light-sweep, then still.

### Month view — the crown calendar (monthGrid app.js:6155)
*Shipped GRAND BUILD C skeleton: 9 stacked months, cells tinted by a continuous mixHex that passes straight through the rejected muddy mauve mid-tones. Crowned = 2px gold BORDER (the rejected fat-gold-ring), future = flat .45 opacity, no away render, no legend, no month story.*

- **Jewel-step tint ramp (kill the muddy mix)** (S, wow 4/5, JEWEL + PROCESS law) — replace the continuous mixHex with a locked 4-step ramp of clean deepened pinks (#3a1229 → #6d2247 → #a23568 → #d04f8f, thresholded at 0/.34/.67/.95). Ship the 4 hexes behind the dev variant toggle for David's on-device eye.
- **Gold hairline INSET on crowned cells, not a gold border** (S, wow 3/5, §12 gold=hairline-inset-only) — keep the ink border, add box-shadow inset 0 0 0 1.5px #ffd24a; today+crowned stop fighting (today keeps pink border, gold lives inside).
- **Future planned days = matte charge** (S, wow 4/5, BATTERY matte=potential) — render future days that HAVE planned blocks as matte potential: #2f1526 at full opacity with the ink border. You can see the charge you've loaded into next week.
- **The month's story in one line** (S, wow 4/5, SOUL mirror + spec §2 promise) — under each sticky month label: «12 дней сияли · 3 [ti-crown] · лучшая серия — 5» aggregated in the same render loop.
- **Away days render as held breath, not absence** (M, wow 4/5, SOUL no-shame + mock fidelity) — log away spans (S.awayLog, SCHEMA bump + migration) and render those cells #2a1320 with a 2px dashed #4a2238 border + legend «в пути». The calendar says held, never failed; fire runs bridge across the dashes.
- **Today's cell is the one thing breathing** (S, wow 3/5, one-breather + BATTERY) — port the mock's 2.4s soft gold-tinged glow breath to today's cell only when it's already shining. If today is quiet, no animation: stillness is honest.

### Zoom transition (zoomAnim app.js:2697)
*A solid snapshot crossfade with center-anchored scale, generic 300ms cubic-bezier — competent but placeless: it never knows WHICH day you came from or tapped into.*

- **Cause-anchored zoom everywhere** (M, wow 5/5, MICRO-GRAMMAR ② + one-world thesis) — thread an origin point through zoomAnim(dir, origin): day→week anchors to where that weekday's column lands, week→month to the tapped week's row, month→day to the tapped cell; transform-origin set on both snap and incoming view. One function change — every zoom in the app suddenly obeys «rises from its cause». The single highest leverage-per-line move in this group.
- **Pinch-through: the zoom chain becomes one gesture** (L, wow 5/5, §0 navigation-IS-zoom + interruptible) — a pinch-in past pullHourPx's 20px floor hands off to zoomAnim(+1) into week (commit on release); pinch-out on a column/cell dives into the day under the finger. Apple-Photos physics on ALTER's time-scales. Lives in the delicate pinch arbitration (regression zone): build behind a flag, DEVICE-UNTESTED, David's thumb decides.
- **One easing family for the zoom** (S, wow 2/5, MICRO-GRAMMAR ③) — swap zoomAnim's ad-hoc bezier for the v648 spring tokens + a 1-frame settle on zoom-in. The last non-spring transition in the nav leaves the building.
- **Strip-to-columns morph on day→week** (M, wow 4/5, zoom thesis + MICRO-GRAMMAR ②) — the header week-strip cells fade as the 7 column headers fade in at aligned x-positions (both flex:1 across the same width). The strip UNFOLDS into the week — proof the two surfaces are one object at two zooms.

### Quiet/empty states (empty weeks, future months, first-run)
*An empty week is 7 dark wells; a future month is a wall of .4-opacity cells; a new user's month view has no invitation. Nothing distinguishes «nothing yet» from «nothing ever».*

- **First-shine seed line** (S, wow 3/5, CALM + §2 empty-day law at month zoom) — an all-quiet month gets ONE warm line — «Первый сияющий день появится здесь» — and today's cell carries a faint pink breath. One sentence and one living cell.
- **Plan-the-week door on empty week pages** (M, wow 3/5, DOORS + blue=plan + no-random-features) — a current-or-future all-quiet week grows one 52px striped-blue door «[ti-route] Спланировать неделю» → shapeFlow(that Monday). Past empty weeks stay untouched — history is never nagged.
- **The wayback glint on the calendar** (S, wow 4/5, SOUL inversion + no-shame) — in monthGrid, the first active cell after ≥3 quiet days gets a small bare gold ti-sparkles + legend «возвращение»; the gap cells get NO treatment at all. The inversion law lands exactly where GitHub-graph guilt would normally live.
- **Legend as a folding teach-row** (S, wow 2/5, CALM + mock fidelity) — the legend (тихий / сияющий / корона / серия) pinned under the CURRENT month only, auto-folding after ~10 opens. Teaches the battery language once, then leaves.

---

## LIFE — the journey

### Journey header (title / sub / spark pill / progress bar)
*18px «Your journey» + forward-framed sub, gold spark pill, a briefcase toolbox button, a 13px pink-to-purple gradient progress bar. Chrome-heavy; the gradient makes purple a co-hero.*

- **Node-pip day gauge replaces the gradient bar** (S, wow 4/5, BATTERY + CLASSY + STRIPE GAUGE + mirror) — one 10×18px pip per real node from jpNodes(): matte at rest, filling SOLID with that node's own domain color on completion; the final pip is a gift silhouette flipping gold only on allDone. The day reads as a spectrum of lived color.
- **Chapter crest replaces the generic title** (M, wow 3/5, COMPOSITION + one-world) — header = the season crest: bare chapter icon in its element color + «Глава 4 · Your Big Three» + «3 из 5 сегодня». Every open anchored in the LIFE zoom, matching the frame's «ГЛАВА 2 · В ТУМАНЕ».
- **One canonical earn animation into the pill** (S, wow 3/5, MICRO-GRAMMAR one-family) — earn() (app.js:5280) floats its own +N while flyPoints() runs a second, better flight. Delete the duplicate; route every journey earn through rewardFx→flyPoints, from the causing node to jpSpark, which pops.

### Chapter banners — seasons (active / past-done / past-open)
*Active chapter = full-width solid pink slab; earned past = solid green + a 64px solid-gold trophy box; unearned = muted purple. The solid banners spend the one-large-fill budget that belongs to the striped hero node.*

- **Season banner goes 90 percent dark** (M, wow 4/5, CLASSY + PALETTE one-fill) — re-cut jp-unit.active: #22091a card, 2.5px ink border, chapter icon in element color, «СЕГОДНЯ · ГЛАВА 4» letterspaced pink label, 17px title, why-line, ONE pink hairline inset instead of the slab. The cur node becomes the unambiguous hero.
- **Milestone pips live on the banner** (S, wow 4/5, CLASSY + want-more engine) — the chapter's JP_LESSON milestones as three 10px pips (matte → #28cf86 on m.done()) + «2 из 3». A living progress object without opening chapterSheet.
- **Chapter card mint preview on the banner edge** (M, wow 5/5, REWARD INVERSION + T5 + foil=card-moments) — each banner's right edge shows a 34×48px mini card-back: element-typed tint over ink, matte when unearned, foil when mastered; mastery calls mintCard() with a new chapter family. Wires trail → binder and gives the climb a collectible reason.
- **Earned gold becomes a hairline, not a box** (S, wow 3/5, gold=hairline + CLASSY) — the solid #ffcf4a trophy stone dies; the earned banner gets a gold hairline inset + a small bare gold ti-trophy inline. Gold shrinks to jewelry-scale so it keeps meaning.

### Fog-of-war and the next locked chapter
*Distant chapters = misted banners (shipped); the NEXT chapter still renders three identical 76px padlock coins + a locked trophy. Padlocks read shame-adjacent.*

- **Silhouette stones, no padlocks** (S, wow 4/5, BATTERY + SOUL no-shame-iconography + frame) — the three locked coins become EMPTY matte discs (#241019 fill, #33182a border, no icon) shrinking 64/56/48px into the mist. Potential is matte, not imprisoned; only the banner keeps one small ti-lock.
- **«проявится, когда откроешь…» teaser lines** (S, wow 3/5, want-more + frame) — every fog banner gets the frame's single teaser at 12.5px; the NEXT-locked banner shows its real unlock key («открывается: утро 5 из 7» from milestones). Aspiration with a visible key, not a wall.
- **De-mist on approach** (M, wow 4/5, BATTERY + uncaused) — key the next banner's fog opacity to the current chapter's milestone count (.85→.55→.25) and warm its icon toward its element color, changing only when a milestone lands, one soft crossfade. The mountain visibly clears as you climb.
- **The summit above all fog** (S, wow 3/5, SOUL graduation=endgame + COMPOSITION) — cap the trail past Chapter 8 with one static vista: the Halo+Spark mark half-sunk in mist at ~60% opacity. The endgame literally visible at the top of every scroll.

### Trail stones — done / future (the battery re-grade)
*done = 80px solid disc + green ring + check (v803, good); but future «up» stones are ALSO full-saturation solid at 86px — the matte half of the battery isn't rendered, so done doesn't actually read brightest.*

- **Matte the future — the frame's core regrade** (S, wow 5/5, BATTERY + REWARD INVERSION + CHOICE-ROW v3 + approved frame) — switch .up bubbles to matte: mixHex(n.color,'#160510',.55) fill + 2.5px n.color border + icon in n.color. Done stays full color + green ring; cur stays the ONE striped hero. Completing a stone now visibly IGNITES it from matte to lit — the single highest-leverage strike on this surface, and literally what David approved in the frame.
- **Frame-exact ignition burst** (S, wow 4/5, MICRO-GRAMMAR + frame) — upgrade jpNodeCompletionBurst (app.js:739) to the frame's double ring-out: two expanding circles (3px #46e2a4, 2px #ffd24a, scale .6→1.9 over 600ms) + the existing +N flight and counter pop.
- **Minutes inscribed on the trophy** (S, wow 4/5, gold=EARNED + mirror) — done stones earn a tiny gold receipt under the caption: «32м» at 12px, summed from today's logs. Lived time as the trophy's inscription.
- **Breathe only the freshest win** (S, wow 3/5, one-breather + frame) — on completion the ignite halo breathes exactly two loops then settles static; when allDone, the LAST completed stone holds the breath (no cur breathing anymore).
- **Done taps acknowledge like trophies** (S, wow 3/5, MICRO-GRAMMAR ①) — prepend a 150ms green ring-flash + hapt(1) before the review/edit action fires.

### Cur-card (the focal step under the striped hero)
*120px striped hero + 256px berry card with a full-width CTA painted the node's domain color; the guardian preface crammed inside; no visible way out of the focal ask.*

- **Blue СТАРТ door, frame-exact** (S, wow 4/5, PALETTE blue=start + DOORS + finish hierarchy) — the CTA stops wearing the domain color (the striped bubble owns identity): solid #36b3f0, ink text #08283c, 54px, «СТАРТ» / «ПЛАН». Makes blue mean START everywhere in the app at once.
- **Always a way out of the focal ask** (M, wow 4/5, SOUL) — a bare ghost «не сейчас» under the door that demotes this node's _leadW so curIdx moves to the next undone stone. No shame copy, no cost. Closes a soul-law gap.
- **Guardian line floats above the hero** (S, wow 3/5, COMPOSITION + SOUL proves-it-learned) — jpLeadPreface moves out of the card into its own quiet line 8px above the bubble: 13.5px italic + ti-sparkles, one line max. The ask gets calmer; the app-SEES-you moment gets its own voice.
- **Kit-cut the card body** (S, wow 2/5, CALM + KIT) — radius 16, #22091a, title to 19px, line 13.5px with air, width min(86vw, 300px), speech-tail kept.

### Time-commitment beat (duration chips + custom dial)
*Bubble hides, cockpit ring zooms in with dark chips (pink tutorial glow on 5m), a NATIVE range slider for custom, and a 26px inline-styled close X.*

- **Chips speak choice-row v3 in blue** (S, wow 3/5, v3 + BATTERY + blue=plan) — rest = dark blue tint + solid #36b3f0 outline; press = ignition into blue 9px stripes + ink border ~180ms before jpCommitGo. Committing time literally charges the battery.
- **Ring previews the promise as a matte arc** (M, wow 4/5, BATTERY converter) — while choosing, the zoomed ring draws a matte #36b3f0 conic arc proportional to the tapped duration — tap 25м, a quarter-arc of matte blue appears: potential about to be converted; on commit that same arc is what the live cockpit fills.
- **Kill the last stock control — the chunky dial** (M, wow 4/5, CLASSY + MICRO-GRAMMAR + 44pt) — replace the native range with a game-piece slider: 260px×14px track, ink border, a 44px round ink-bordered thumb with the live value inside it, tick pips at 5м/25м/1ч/4ч. secs()/log-scale math kept.
- **44pt way out** (S, wow 2/5, 44pt + way-out) — the close X grows to 40×40 with the press-sink, moved to a class. The beat's only escape hatch.

### Inline live cockpit (tracking on the trail)
*216px green ring + striped disc + 27px timer + a matrix where Done=solid green, Follow=light blue, Replan=SOLID GOLD #ffd54a (gold-on-chrome violation), Drift=mauve, Tools=dark. The pause disc shows ti-player-pause but has no onclick here.*

- **The converter arc — gold hairline fills the ring** (M, wow 5/5, BATTERY converter + gold=hairline-earned + CLASSY) — inside the green ring, a 2px gold hairline arc grows clockwise as elapsed converts committed minutes into lived ones (runT.commit vs elapsed, conic mask): matte ring-space = remaining potential, gold hairline = minutes already earned; at 100% the arc closes and Done pulses once. The now-line-as-converter rendered as jewelry — the journey's signature classy moment.
- **Matrix obeys the finish hierarchy — gold leaves chrome** (S, wow 4/5, gold=EARNED + DOORS + JEWEL mauve=drift) — Done = solid green 52px full-width; Follow = STRIPED green; Replan = solid blue #36b3f0; Drift = ghost mauve; Tools folds to a bare ti-briefcase corner tap. The #ffd54a Replan button dies — the last gold-on-chrome violation here.
- **Wire the pause disc** (S, wow 3/5, MICRO-GRAMMAR ① + shipped-core invariant) — disc tap routes to the same pause path the full cockpit uses, with the sink acknowledgment. DEVICE-UNTESTED for feel.
- **The timer IS the moment** (S, wow 2/5, CALM) — jp-cktimer 27px → 34px, tabular-nums, #ffe3f1. One CSS line, outsized calm payoff.

### Live pill (tracking while elsewhere on the trail)
*Injected div with inline styles: berry surface, ink border, but a BLURRED drop shadow breaking the hard-shadow grammar; tap opens trackerFull with no origin motion.*

- **Hard shadow, real class** (S, wow 2/5, PALETTE 0-4px-0 + MICRO-GRAMMAR) — move the inline CSS to a .jp-live class with the hard 0 4px 0 #160510 shadow and press-sink. Kills the one soft blur-shadow on the journey pane.
- **Striped lived edge** (S, wow 3/5, BATTERY stripes=lived) — the pill's left edge carries a 6px vertical band of the running activity's 9px stripes (tfStripe already computes it). This minute is being LIVED, zero added elements.
- **The cockpit rises from the pill** (S, wow 3/5, MICRO-GRAMMAR ②) — transform-origin at the pill's rect; the cockpit scales up from it with the v648 spring. One rAF + one class.

### Habit 3-way inline menu
*Three stacked SOLID buttons (Mark done = solid habit color, Track it = whitened solid, Skip = dark) — an all-solid chip wall in miniature; appears via redraw with no origin motion.*

- **Three finishes, one color** (S, wow 4/5, DOORS hierarchy + v3 + BATTERY) — Mark done = solid own-color (GO), Track it = STRIPED own-color (living it), Skip = ghost (dark tint + solid outline + bare icon). Descending energy in one color family; the whitened-solid middle button dies.
- **Menu rises from the stone** (S, wow 3/5, MICRO-GRAMMAR ②) — the existing jp-zoomin class (unused here) with transform-origin at the stone's center: the three doors grow out of the habit circle.
- **Fire chip on the title** (S, wow 3/5, fire=temporal-multiplier + mirror + no-shame) — jp-hmtitle gains the habit's own fireHTML() chip from its doneMap history. Mirrored, never threatened; §2 says habit rows carry their own fire level and today nothing does.

### Gap-return / wayback / away stones
*gapreturn = a single warm focal node + toast (good bones); wayback = a restore-colored stone; away = one calm done-stone. The inversion law names return-after-gap the FLAGSHIP T5 reward, and today it's a plain stone.*

- **The Return — flagship mint fired FROM the stone** (M, wow 5/5, REWARD INVERSION flagship + T5 + MICRO-GRAMMAR ②) — the prism «Came back» badge exists (BADGES.return, app.js:5312) but mints on a lazy 30s badgeTick. When the gapreturn stone's first track completes, call badgeTick immediately and fire the mint FROM the stone — rewardFx(5, {srcEl}) double ring-out, then the prism card rises from the stone's position. The user's weakest moment becomes the app's loudest celebration — the whole soul thesis in one animation, built from existing pieces.
- **The quiet sea — name the gap without shame** (S, wow 4/5, mirror + no-shame) — above the return stone, the absence itself as one hairline row: «12 дней · мир ждал, ничего не сломалось» at 12.5px between two hairlines. The gap acknowledged as weather, never debt.
- **Return stone wears prism** (S, wow 4/5, element treatments + foil=card-moments) — the gapreturn bubble gets a subtle iridescent conic overlay ~12% + white ti-sparkles. Legal: this stone IS a card being earned — the one stone allowed to shimmer like the binder.
- **Wayback gets two doors** (S, wow 3/5, SOUL way-out + DOORS) — the drift-recovery stone's card gets the pair: solid «20 сек · вернуться» + ghost «просто продолжить». Coming back must never feel mandatory either.
- **Away = dashed ghost, one language with the calendar** (S, wow 3/5, one-physics + JEWEL + no-shame) — the away stone renders as a ghost disc with a DASHED restore-tint ring + ti-plane-inflight + «streaks held» — the exact dashed language the month calendar uses.

### Summit gift + all-done state
*The summit is a 64px box — ti-gift locked, gold ti-trophy when allDone — flipping SILENTLY on redraw. The day's biggest moment has no ceremony.*

- **The summit opening — the journey's fireworks** (M, wow 5/5, REWARD INVERSION + gold=EARNED + one-focal-moment) — detect the allDone false→true transition, auto-scroll to the summit, play the one big moment: chest lid pops, double ring-out, tier-4 sfx + haptic, +N flies to the pill, then a receipt line: «5 из 5 · день прожит». Gold may glow here — it is maximally earned. This moment does not exist today and is the single most missing payoff on the surface.
- **The chest shows its promise** (S, wow 3/5, want-more + no-shame) — locked gift = matte chest + «ещё 2 шага» (live). Visible next-step, zero shame framing.
- **After the summit, the day exhales** (S, wow 3/5, CALM + SOUL) — post-ceremony the trail goes fully calm: no breather, the sub becomes the receipt, the evening reflect stone (if due) is the only lit object left. Completion should FEEL like rest.
- **Perfect-match day = crown on the chest** (M, wow 4/5, T4 + one-reward-language) — if every planned block MATCHED, the chest opens wearing a small gold crown chip, feeding S.crowns. One fact, two zooms, same symbol.

### Chapter sheet (lesson overlay)
*Strong content (headline / idea / milestones), pre-kit body: 10px labels (below the 12px floor), a 3px hairline progress, off-palette #4ade80 checks, legacy ob-btn CTA.*

- **Kit re-cut** (S, wow 3/5, KIT + DOORS + PALETTE 12px floor) — labels to 11.5px letterspaced pink; milestone rows get bare ti-circle/ti-circle-check in palette #28cf86; CTA becomes a 54px door — Continue solid pink, Review striped, locked ghost + ti-lock.
- **The chapter card lives here** (M, wow 4/5, approved canon + INVERSION) — top of the sheet = the chapter's card at 120×168: matte + fog when locked, full element-typed art with mint date + gyro tilt when mastered. The card's home before it reaches the binder.
- **One gauge language — pips, not a hairline** (S, wow 2/5, STRIPE GAUGE + CLASSY) — the 3px progress track dies; the banner's milestone pips repeat here at 14px.
- **Test-out door** (M, wow 3/5, reflection-card engine + appetite + no-random-features) — on a nearly-mastered chapter, a ghost secondary: «Я уже это живу — проверь меня» → three reflectCard() questions feeding the existing preSurfaceCheck/watchConfirm claim path toward chapterMastered.

### «Already there?» test-out card (cur-node state)
*Two-button card — «All good» solid domain color + ghost «Remind me» — with the evidence claim written as prose; earns 10 spark silently.*

- **Evidence pips, not prose** (S, wow 3/5, SOUL proves-it-learned + mirror + CLASSY) — the claim («opened your morning 5 of the last 7 days») becomes a row of 7 day-dots — lit in the node's color for done days, matte for quiet. Data, not survey.
- **«All good» ignites** (S, wow 2/5, v3 ignition + MICRO-GRAMMAR) — press acknowledgment + a brief stripe-ignition flash, then the stone completes with the standard tier-1 fly. The 10-spark earn currently happens with no motion at all.
- **Kit-size the pair** (S, wow 2/5, DOORS + 44pt) — both buttons to 48px+ with door finishes; «Remind me» keeps its ghost as the lower-energy road.

### jp-nav bottom bar
*A third persistent 3-tab bar (jp-nav duplicates #nav and gameNav as separate DOM). David has already named this the clutter: «no three buttons on the bottom».*

- **Dots pill behind a dev toggle** (M, wow 4/5, CALM + NAV QUESTION + PROCESS law) — implement the spec's option 2: a floating 3-dot pane indicator bottom-center (8px matte dots, active = a 22px pink dash), tap expands to full labels for 2.5s (Mom-safe), swipe still switches panes. Behind a dev toggle cycling bar / auto-hide / dots — David decides on device.
- **One nav, three panes** (M, wow 3/5, landmine no-duplicated-surfaces + COMPOSITION) — whatever wins, collapse jp-nav, gameNav and #nav into ONE shared fixed element that never re-renders across pane swipes. Kills two DOM copies and any residual bar-jump.

---

## LIFE — goals (quest cards)

### Quest map — the card list (goalsSheet/drawMap)
*v818 quest-card bodies land close to the frame, but they sit in the OLD berry modal shell: 460px goal-ov card, a full-saturation green «N active» chip, a bare inline input + pink square, a green footer sentence. No spark pill, no mint-promise footer, EN-only.*

- **Full-bleed Квесты room** (M, wow 4/5, CALM full-screen + CLASSY + PALETTE one-hero) — convert goalsSheet to a full-screen night surface like toolbox v816: gold ti-map-2 + «Квесты» 21px header, body on #22091a, the 88vh frame and green audit chip die. The quest cards become the only saturated objects in the room.
- **Spark pill header — the bounty landing pad** (S, wow 3/5, MICRO-GRAMMAR destination + economy + frame) — top-right: a hairline pill (dark fill, 1.5px #ffd24a hairline, ti-bolt + S.game.spark in gold). Every step-done bounty's points-fly terminates HERE with a counter-pop.
- **Mint-promise footer card** (S, wow 3/5, INVERSION aspiration + collection + frame) — replace the footer text with the frame's bottom card: a small foil-framed matte card thumbnail + «заверши квест — и он чеканится полноартовой картой в твою коллекцию, с датой и историей». Sells the endgame on every visit without shouting.
- **New-quest door + live decomposition cascade** (M, wow 5/5, MICRO-GRAMMAR ②⑤ + DOORS + goal engine ② made visible) — replace typeAdd with a 52px ghost door «Новый квест» expanding in place into the input; on submit the new card spring-pops in and its auto-decomposed steps (decomposeGoal already fires) cascade in one-by-one at 60ms stagger — David literally watches the guardian break the goal down.
- **Rotation whisper on stale cards** (S, wow 3/5, SOUL mirror + goal engine ③ surfaced gently) — a goal untouched N+ days (goalLastK) gets a muted «тихо 6 дней · верну его в путь» sub-line and dims to .92, matte. Never red, never a skull.

### Quest map — empty state
*One plain 13px EN text line floating in the modal. No invitation, no composition.*

- **Ghost quest-card silhouette** (M, wow 4/5, COMPOSITION five-element + CALM + BATTERY) — one centered dashed-ink-outline card at real quest scale: matte dashed icon well with ti-flag, «Чего ты хочешь на самом деле?» 21px, «назови один квест — я разобью его на шаги», ONE 54px solid-pink door «Назвать квест». Literally an unfilled card.
- **Three seed quests as choice-rows v3** (M, wow 3/5, v3 + four-pipeline no-typing + no-random-features) — three v3 rows from DECOMP_TEMPLATES («Тело и сила» ti-barbell, «Написать / доделать» ti-book, «Деньги под контролем» ti-coin); tap = ignition, the quest mints pre-broken-down. Zero typing to own a first quest — Mom/Sister path.

### Quest card body — the v818 garnish pass
*Built and close: foil-edge-as-progress, icon well, 5-step circle ladder, pink session door. Missing: bounties hardcoded «+15», no title sub-line, no active-step pips/next-session line, and the % is intention-based, not evidence.*

- **Tiered bounties that actually pay** (S, wow 4/5, earn map T2 + MICRO-GRAMMAR) — compute per-step bounty from position/weight so the ladder reads +12/+30/+40/+58; on step-done: counter-pop on the bounty, points-fly to the spark pill, S.game.spark += bounty. The ladder becomes a real economy object.
- **Active-step pip strip + next-session fact** (M, wow 5/5, goal ENGINE ①④ + BATTERY + frame) — under the glowing .next step, a pip row: session pips (done = solid #28cf86, remaining = matte) + right-aligned «2/4 · следующая = завтра 15:00» derived from st.schedK and the actual scheduled block carrying goalId. The visible goal→timeline thread.
- **Foil fills from EVIDENCE, not checkboxes** (M, wow 4/5, goal ENGINE ④ + mirror + BATTERY) — recompute pct as lived progress: steps done + real tracked minutes on goalId blocks. The gold foil rises only when life happened; a 1px inner hairline tick marks the intention plan as matte ambition.
- **Title sub-line in the frame's voice** (S, wow 3/5, frame + CALM) — under the title, «шаг 3 из 5 · фольга заполняется» (or «к цели: 62%» for metric goals) generated from real steps. The card explains its own foil.

### Goal detail view (drawGoal) — untouched by v818
*The old berry modal in full: amber Active toggle (gold-as-selection violation), orange→green gradient metric bar, purple «Break it down» + an emoji «Feels too big?» button, 13px step rows with 30px square buttons, bare «✕ delete». None of the quest-card language survives the tap into detail.*

- **The card OPENS — FLIP morph to full screen** (L, wow 5/5, MICRO-GRAMMAR ② + CALM + COMPOSITION) — tapping a quest card FLIP-morphs the q-foil itself into the full-screen detail: the foil edge becomes a 3px inset ring around the whole surface, icon well + title become the header, the 5-step preview grows into the full ladder in place. «Every menu rises from its cause» made literal: the detail IS the card at full size.
- **Ladder v2 — detail-scale q-steps** (M, wow 4/5, JEWEL + CLASSY + frame) — rebuild .goal-step in the card's circle language: 30px circles (done = solid green check, active = pink glowing play, future = dashed ghost), bounty right-aligned in gold; ti-calendar-plus schedules; delete moves to swipe-left or a bare muted ti-x.
- **The session door lives here too** (S, wow 3/5, DOORS + goal ENGINE ①) — pin the 54px solid-pink «Поставить сессию в день» directly under the ladder, wired to scheduleNext. The ONE next action within thumb reach where David actually reads a goal.
- **Active toggle → battery chip, gold removed** (S, wow 3/5, v3 no-gold-on-selection + BATTERY + PALETTE) — active = a chip in the goal's own domain 9px stripes + ink text («В пути · тянется в твои дни»); paused = matte dark tint («На паузе»). The amber toggle is a live palette violation today.
- **Emoji purge + RU sweep** (S, wow 2/5, Tabler-only + i18n parity) — kill every emoji in the goals region: the fear-face → ti-mountain (app.js:2426), brain → ti-brain (2427), and the whole toast set (2329, 2336, 2352-2353) → inline ti icons; route strings through tr(). Constitution violations shipping now, not polish.
- **Metric bar → battery gauge with an earned gold tick** (M, wow 4/5, STRIPE GAUGE + JEWEL + gold=EARNED) — .gm-bar: matte #3a2036 track, fill = domain-color chunky 9px stripes, target end = a 2px gold hairline tick that IGNITES only on target-hit (celebrateGated already fires there). The orange→green gradient dies.

### WOOP — the card back
*Two bare inline inputs (obstacle / if-then) in a flat dark box mid-detail. No Wish/Outcome framing, no flip — «WOOP on the card back» does not exist.*

- **The literal card-back flip** (L, wow 5/5, spec §2 GOALS + MICRO-GRAMMAR ③ + CLASSY) — a bare ti-rotate top-right; tap = 3D flip (rotateY 0.5s spring) revealing the BACK: darker #1e0b18, the foil edge continuing around, gold letterspaced ЖЕЛАНИЕ / РЕЗУЛЬТАТ / ПРЕПЯТСТВИЕ / ПЛАН with air. Wish auto-fills from the title (matte, read-only). The plan physically lives on the other side of the ambition.
- **The if-then inscription** (M, wow 4/5, CLASSY + COMPOSITION) — once saved, the back stops being a form: «Если [препятствие] — я [план]» composed as ONE 17px sentence over a matte hairline-inset panel, ti-pencil to re-open. The plan becomes an object David re-reads.
- **Armored-quest whisper on the front** (S, wow 3/5, CLASSY + gold reserved) — a tiny bare ti-shield-check (muted, never gold) beside the title when g.woop is set; tap flips straight to the back.
- **First fill as two reflection beats** (M, wow 4/5, worksheet engine §7 + SOUL skip-costs-nothing + no-random-features) — the first flip runs WOOP as the worksheet engine: «Что встанет на пути?» then «Если это случится — что сделаешь?», rc-inp own-words field, skip visible; writes g.woop, pays T1.

### TooBig rescue (tooBigSheet)
*The copy is right, but it's a centered generic dur-card with three same-weight chips popping from screen-center; the confirm toast and entry button carry emojis.*

- **The tiny step rendered as a MATTE BLOCK** (M, wow 5/5, BATTERY matte=potential + MICRO-GRAMMAR + goal engine ②) — replace the text panel with an actual timeline-block preview of what will land: matte domain tint, 2.5px ink border, block typography, a «10 мин» chip. On confirm, the block preview flies down toward the timeline as the sheet closes and the real block appears. The battery language teaches exactly what the rescue does.
- **Door hierarchy for the three choices** (S, wow 3/5, DOORS + SOUL) — solid green 54px «Ставлю 10 минут» → striped blue «Развернуть желание» (the Reversal alternative) → ghost «не сейчас». Descending finish energy shows the brave door without shouting.
- **Rescue rises from its button** (S, wow 3/5, MICRO-GRAMMAR ②) — transform-origin at the tapped «слишком большое?» button; k-card surface, 21px headline. Fear-moments should feel like the app leaning in from where you asked.
- **The blocker memory made visible** (S, wow 4/5, goal engine ② + SOUL no-shame) — g.blocker='big' is saved and never used. Next visit, the session door's sub-line reads «начнём с крошечного шага» and scheduleNext offers the tinyStep first. One conditional, huge felt intelligence.

### Honorable release + the released shelf (unbuilt)
*The only exit is «✕ delete this goal» — a splice with no story, no ceremony, no way back. Spec §10 ⑤ has zero implementation.*

- **The release rite** (L, wow 5/5, SOUL honorable-release + COMPOSITION + goal engine ⑤) — «отпустить квест с честью» → full-screen night: the card floats center while its TRUE story types on beneath (started date, N sessions · H hours from goalId blocks, steps done). One v3 trio — «это не моё» / «не сейчас» / «выросло в другое» — then the foil fades to matte silver-grey and the card exhales (scale .92, drifts down 600ms) into the shelf. A retirement with honors — no red, no confirm-dialog anxiety.
- **Отпущенные — the folded shelf** (M, wow 4/5, SOUL way-out-of-out + INVERSION return-celebrated) — a ghost folded row at the map bottom («Отпущенные · 3») expands to the released cards rendered matte with their story lines; each carries ti-arrow-back-up = «вернуть в путь», and returning a released quest runs the quiet gold sheen once.
- **Released ≠ deleted in the data model** (S, wow 3/5, SOUL no-destroyed-history + state safety) — release sets g.released={k, reason, story} instead of splicing S.goals; hard-delete survives only as a long-press «стереть навсегда» inside the shelf. Additive field, no SCHEMA bump.

### Small sheets — schedule-step picker + metric entry
*Generic pickSheet/numSheet: «Today / Tomorrow / In 3 days» chips with no time fact, chained number prompts, emoji toasts.*

- **When-chips carry the landing time** (S, wow 4/5, goal→timeline + CLASSY + CALM) — the three options become k-dur chips with the REAL slot underneath: «Сегодня · 15:30» / «Завтра · 09:00» / «Через 3 дня» via nextFreeTime. David picks a fact, not an abstraction.
- **Metric log = one big dial moment** (M, wow 3/5, COMPOSITION + DOORS + gold=EARNED) — one centered 34px number, unit ghosted beside it, 44pt steppers, one solid-green 54px «Записать»; target-hit ignites the detail gauge's gold tick via the wired celebrateGated.
- **Sheets rise from their row** (S, wow 2/5, MICRO-GRAMMAR ②③) — pickSheet and numSheet get transform-origin at the tapped control, k-card surface, ghost cancel. The goals region stops teleporting modals from screen center.

### Quest completion — the mint (unbuilt)
*Finishing the last step just re-renders the list; metric target-hit fires confetti + an emoji toast. The spec's flagship endgame — completion mints the full-art card — does not exist.*

- **The mint moment** (L, wow 5/5, approved canon ④ + INVERSION done=brightest + T5) — last step completes (or metric target hits): the card goes full-art on the spot — foil edge completes to solid gold, the LOUD mint sheen sweeps once (this IS a card moment), the card lifts to center on darkened night, flips to the mint face with date + story, gyro tilt engages, then flies to the binder. Element-typed finish per domain. The single biggest missing reward in the app's stated economy.
- **The story IS the flavor text** (M, wow 4/5, want-more story=real-data + mirror) — auto-compose the two-line story from real data: first goalId block date, tracked hours, session count, the WOOP plan line — «Начат 12 мая · 14 сессий · 21 час · „пиши по утрам, даже плохо"». No two mints can ever look alike.
- **Завершённые — the brightest row on the map** (S, wow 4/5, INVERSION + CALM) — minted quests leave the active list into a folded «Завершённые · N» row ABOVE the released shelf; expanded, the full-art cards are still the most saturated objects in the room. Done things outshine plans.

---

## LIFE — habits

### Journey habit stones (app.js:997-1005 + coin() at 1990)
*UNDONE = 96px FULL-SOLID domain circle (no matte state), DONE = shrinks to 80px with a green ring — the lived thing is literally the smallest object on the path. Per-habit streak is computed (streak(id)) but rendered NOWHERE living.*

- **Invert the stones: matte potential, ignited lived** (S, wow 5/5, BATTERY + REWARD INVERSION + v3) — undone stone = v3 rest: deep own-color tint (mixHex(color,#0d0410,.84)) + 2.5px SOLID own-color border + bare colored icon. Done stone = IGNITION: own-color 9px tfStripe fill + ink border + green check, KEEPING its 96px size. The focal cur stone stays the 120px striped hero. One CSS block + one background branch swap (app.js:1996).
- **The ember pip — per-habit fire lands on the stone** (S, wow 4/5, §2 HABITS + CLASSY) — a 12px pip at the stone's 4-o'clock edge in a 2px ink ring: absent under streak 2, the .fire-dot ember at 2-6, ti-flame orange at 7-20, ice-blue #7ac8ff at 21+ (exact fireHTML thresholds, reused). The entire §2 «rows carry own fire level» in ~15 lines.
- **A line that knows THIS habit** (S, wow 4/5, SOUL mirror + §7 proves-it-learned) — replace the one generic caption with a data-mirror per stone: streak≥3 «Day N of this thread»; done-yesterday «kept alive yesterday — one tap holds it»; gap≥3 «been N days — coming back IS the skill». Reads from habitDone history already in memory.
- **Blue-flame ceremony at 21** (M, wow 5/5, MICRO-GRAMMAR one-breather + earned moments) — the day a habit crosses streak 21, its stone gets the screen's ONE focal breather: the ember pip springs in ice-blue with a 2s soft pulse, and the habit's binder card mints. At 60 the pulse repeats once and the card ranks up. Rare enough to stay expensive.
- **Weekly habits get hairline pips** (S, wow 3/5, CLASSY pips + BATTERY) — for per>0 habits (Read 3×/week ships with zero living UI), N 6px hairline pips under the stone cap, filled per done-this-week (weekDone(id) already computes it).

### Habit 3-way menu — Mark done / Track it / Skip (jp-habmenu)
*Three stacked solid-fill buttons at 208px — a pre-v3 mini chip wall. It rises from its cause (good), but Track it fires a bare timer with no commit, and the menu knows nothing about the habit's thread.*

- **Retrofit to choice-row v3** (S, wow 4/5, v3 LOCKED + DOORS ≥52px + kills a rejected chip wall) — Mark done + Track it become 52px v3 rows (rest = tint + solid outline + bare icon; tap = ignition 220ms, then act); Skip stays a ghost row. Mostly class renames onto the v817 rc-row vars.
- **The thread sits in the header** (S, wow 3/5, §2 per-habit fire + mirror) — jp-hmtitle gains fireHTML(streak(hb.id)) inline-right when streak≥2. Shows what this tap continues; never threatens.
- **Track it flows into the commit beat** (M, wow 4/5, COMPOSITION one-grammar + no-random-features) — Track it sets jpCommitKey and re-draws: the stone zooms into the existing jp-cockpit ring + habit-sized duration chips (2/5/10 min) — the exact beat every other node uses. Deletes a code path rather than adding one.
- **Skip physically honors the choice** (S, wow 3/5, SOUL way-out + BATTERY) — Skip sorts this hab: node to the trail's end (a −10 in _leadW) and the stone drops to full matte; «set aside — it waits matte on the path.» The way-out visible in the world's physics.

### Done-mark reward beat (toggleHabit + celebrateGated callers)
*toggleHabit pays a silent flat earn(12) with no rewardFx; celebrateGated is day-gated, so most habit dones produce zero moment. §2 «done-marks use tier-1/2» is unbuilt.*

- **Route every done through tier-1, fire-crossings through tier-2** (S, wow 4/5, §2 verbatim + MICRO-GRAMMAR) — habit done = rewardFx(1, {n:12, srcEl: theStone, color: hb.color}) every time — +12 flies from the stone to jpSpark, pentatonic pluck, 8ms haptic (machinery exists at 5294-5307). Streak hitting 3/7/21 upgrades that done to tier-2. Confetti stays day-gated; the tier-1 acknowledgment never skips.
- **The check draws itself as the stripes sweep** (S, wow 4/5, MICRO-GRAMMAR acknowledge + interruptible) — on done, the stripes wipe in left→right over 180ms while the green check stroke-draws (SVG dashoffset, 160ms). A second tap mid-animation completes state instantly.
- **Return-after-gap = a flagship moment at habit granularity** (M, wow 5/5, SOUL inversion T5 + §3 earn map) — if a habit had best-streak ≥7 and a gap ≥3 days, its NEXT done fires tier-5: mintCard with the habit's own glyph and real-data flavor («Move — back after 5 days. that IS the skill.»). Reuses mintCard + the gap math the global return badge already does. The inversion law landing exactly where relapse-shame apps punish.
- **Never render a cold ×1** (S, wow 3/5, SOUL no-shame) — after a gap, the fire chip shows the bare ember dot with NO number until day 2. The thread restarts warm instead of «×1» where «×14» used to sting.

### «Your habits» manage sheet (habitsSheet, app.js:2533-2587)
*Domain-grouped walls of FULL-SOLID bchips — literally the rejected all-solid-chip-wall — with an instructional line, +N folds, and a ✕ on each chip. Your OWN habits drown in the base library.*

- **The soft/ignite duality lands here** (S, wow 4/5, soft-tile/ignition law + kills a rejected wall) — library chips drop to soft rest (dark tint + 1.5px muted outline + colored icon); ONLY habits you own stay ignited solid. The library is matte potential; your chosen life is lit. Pure CSS + the existing isCustom branch.
- **Your habits become k-row ledger rows above the library** (M, wow 5/5, CLASSY + CALM + absorbs dead code's idea) — owned habits get 56px night-card rows pinned on top: bare colored icon, white label, right side = seven 6px hairline day-pips (this week's dones) + the fire glyph; tap expands in place to sub-habits + a ghost «archive» row. The library folds below one «Add from the library» header. The sheet stops being a picker and becomes the habit ledger.
- **Fire glyph on every owned chip** (S, wow 3/5, §2 + CLASSY) — until the ledger lands: each owned chip carries its live fire glyph right-aligned (ember/flame/blue-flame, no number). «Which of my basics are alive?» at a glance.
- **Archive with its story, never a bare ✕** (S, wow 3/5, SOUL honorable-release + §10-⑤ precedent) — removing a habit with history keeps habitDone and mirrors one line: «archived — 47 days lived, best thread 12.» The ✕ moves into the expanded row so mis-taps stop deleting.

### Add-habit form (habit-addform)
*A dashed-border panel with a text input, a row of FULL-SOLID domain chips (another rejected wall), and a small «add ✓» button. Dashed misuses the ghost vocabulary on a live surface.*

- **Domain picker → v3 chips** (S, wow 3/5, v3 + JEWEL) — nine domain picks as small v3 chips (rest = tint + solid outline + colored icon; picked = ignition + check); the panel becomes a plain night card. Dashed dies.
- **Live stone preview — you're minting a piece of the world** (S, wow 4/5, COMPOSITION one-physics) — a 48px live jp-bub preview at the form's right renders the exact matte stone (tint + guessed tiClass icon) that will appear on the path tomorrow. Adding a habit becomes placing an object into the world. ~20 lines, reuses the stone renderer.
- **The add becomes a 52px blue door** (S, wow 3/5, DOORS + blue=start + press grammar) — «add ✓» becomes a full-width 52px solid #36b3f0 door with the shadow-sink press. Thin primary CTAs are in the rejected set.

### Sub-habit editor + sub-habit daily life (drawSubEditor)
*Children exist only inside this editor; in the daily loop sub-habits are dead data — never on the journey, cockpit, or timeline.*

- **Sub-habits ride the live cockpit** (M, wow 4/5, no-random-features + §10-① + mirror) — when a parent with children is tracked, the jp-cockpit grows a micro-checklist under the timer: up to 3 44px step rows with bare check circles in the habit's color. Checking pays nothing (mirror-not-price) but writes the log line «Deep work — 2/3 steps». The breakdown you authored finally exists at the moment it matters.
- **Count badge → hairline pips** (S, wow 3/5, CLASSY pips-over-numerals) — the numeric bchip-n badge becomes N 5px hollow pips filling per child checked today (additive S.childDone map, no SCHEMA bump).
- **Empty state = one ghost example that adopts on tap** (S, wow 3/5, BATTERY ghost=potential + CALM) — replace the instruction paragraph with a single ghost-dashed example row («e.g. Define the ONE thing») — tap it and it becomes the first real child (ignites).

### Habit card in the binder — 21/60-day ranks (UNBUILT)
*The binder holds 6 global families incl. a global Fire card — but §2's per-habit card at 21/60 does not exist. mintCard + element treatments + the grid are ready to receive it.*

- **Auto-mint the habit card at 21, rank up at 60** (M, wow 5/5, §2 + §3 collection + gold=EARNED) — badgeTick gains dynamic per-habit entries: best-streak crossing 21 mints a burst-element card with the habit's OWN glyph and real-data flavor («21 mornings of Move — the flame turned blue.»), ★ at 21, ★★ at 60 with the flame rendered ice-blue. The collection grows from the user's actual life.
- **Matte aspiration slot from day 7** (S, wow 4/5, §3 unearned=matte-aspiration) — at streak 7, the card appears in the binder LOCKED — matte, ghosted glyph, «14 в ряд до карты». Level-3 fire gets a destination you can see.
- **The card back is the habit's biography** (S, wow 4/5, §3 want-more story=real-data) — flavor pulls habitCount + best streak + first-done date: «lived 47 of the last 60 days · best thread 23 · began June 3.» No two binders in the world could ever match.

### Quit habits — the letting-go state (type:'quit')
*Quit habits exist in the schema and the vice catalystCard fires after tracking one, but they're filtered off the journey and their only row render lives in DEAD code — a user who adds one sees it nowhere.*

- **Days-without = the inverted fire** (M, wow 4/5, SOUL no-shame + one-reward-language §0) — a quit habit's win metric is days-since-last-tracked, wearing the SAME ember→blue ladder — absence of the vice is the streak. Shown only in the ledger row + its binder card; never a daily nag node. No skulls, no red, ever.
- **The mauve render — drift's one sanctioned color** (S, wow 3/5, JEWEL mauve=drift-only) — quit rows wear the mauve drift render with a ti-arrows-diagonal-minimize «letting go» glyph. The palette itself says: drift being released.
- **Slipped = a doorway, never a mark** (S, wow 3/5, SOUL way-out + CALM) — when a vice IS tracked, the count quietly resets with «noted — the count restarts warm» and the existing catalystCard offer is the single response. No streak-loss animation.

### Dead habit surfaces — renderHabits/renderStats (app.js:6271-6298)
*Both early-return on every renderAll — their DOM targets don't exist. They hold the ONLY renders of per-habit flames, weekly wkdots, and the 14-day dot grid, styled in legacy LIGHT-theme CSS.*

- **Harvest, then delete** (S, wow 3/5, landmine leave-it-cleaner + CALM) — move the three good ideas into living surfaces (14-day grid + flame → ledger rows; wkdots → weekly pips under stones), then delete renderHabits/renderStats, their renderAll calls, and the .hab light-theme CSS. ~−60 lines, zero behavior change.
- **The 14-day grid returns as a battery strip** (M, wow 4/5, STRIPE GAUGE small-cells + §0 one-physics) — each ledger row's last 14 days as a 14-cell hairline strip (3px cells, filled = habit color, today outlined). The crown-calendar's language at habit scale.

---

## FOREVER — the game / world

### The World — overworld island (#gameMode canvas + chrome)
*Gorgeous Cuphead-painted island with real volumetric night lighting, but it floats on a blue-black #05101e backdrop with a grey-teal ocean, a grey in-canvas minimap, invisible diegetic tap-spots, and an emoji HUD (app.js:5093).*

- **Berry horizon — recolor the world's floor** (S, wow 3/5, PALETTE never-black + WARM FLOOR + JEWEL) — swap #05101e for the berry night gradient (#241019 → #1e0b18) so the pane-swipe seam never flashes blue-black; retint the night-vignette stops toward berry-ink and nudge the ocean toward a deep twilight indigo-teal jewel. One CSS line + three literals.
- **Earned lanterns — the island glows brighter on lived days** (M, wow 5/5, BATTERY lived=shining + SOUL inversion) — in the existing additive night pass (app.js:5020-5021), spawn one floating warm lantern-mote per tier-2+ moment earned today (cap 7, reusing the dust-mote loop). A fully lived day makes the island visibly luminous at night; an empty day is simply quiet — never darker-punished.
- **Minimap jewel pass** (S, wow 3/5, CLASSY + gold=EARNED + PALETTE) — ink ring, berry-glass fill, spot-dots recolored by FUNCTION (cabin blue, chest green, tree pink); gold appears on the minimap only when today is crowned. The you-dot stays pink.
- **De-emoji the HUD + make it the world's reward target** (S, wow 3/5, Tabler-only + MICRO-GRAMMAR destination) — replace updGameHud's emoji string with a real k-pill (ti-sparkles + count, ink border, hard shadow), registered in rewardTarget() when body.gaming so flyPoints has a real destination inside the world. Counter-pops on absorb.
- **Doors that reveal themselves — ground-ring plaques at the spots** (M, wow 4/5, MICRO-GRAMMAR ② + Mom readiness) — when the fairy walks within radius of a WORLD_SPOT, pulse a soft ground-ring and spring up a tiny ink plaque («План», «Мастерская», «Привычки») that folds when she walks away. Diegetic first-touch teaching, zero overlay.

### Garden & planting (plantGarden / growGarden)
*Planting is a disabled-able button in the stats panel + a toast; plants get arbitrary n%5 colors on a math spiral; seed→sprout→bloom on return-day works but is visually silent.*

- **The planting ceremony — camera glide + seed drop** (M, wow 5/5, COMPOSITION one-moment + MICRO-GRAMMAR + no-random-features) — tapping Plant enters the world, tweens camX/camY to the new plot (~800ms spring), drops the seed with the existing dust-puff + hapt(2), raises one line: «выросло из настоящего дня». The FOREVER zoom's core ritual stops being a toast and becomes the reason to open the world. All pieces exist — this is choreography.
- **Days become flowers — plant hue = the day's dominant domain** (M, wow 5/5, §0 one-physics + BATTERY) — at plant time, store the day's dominant lived catK on the plot and derive the bloom color from the domain palette instead of n%5. The garden becomes a readable record: a pink flower is a love-day, blue a deep-work day. Legacy plots keep their colors.
- **Plant plaques — provenance on tap** (S, wow 4/5, SOUL mirror + CLASSY + story-from-real-data) — tap a plant → a tiny ink plaque with its plantedK date and one generated line from that day's real data: «посажено 12 июня — день, когда ты вернулся».
- **Return-bloom pop — celebrate the stage advance** (S, wow 4/5, SOUL return=flagship + one-breather) — on world entry, any plot that just advanced does one spring-scale pop (staggered 150ms). The island visibly answers the return instead of just mutating state.
- **Empty-island invitation state** (S, wow 3/5, CALM + SOUL always-a-way-in) — with 0 plants, draw a single matte seed-mound near the fairy; HUD sub-line «одно настоящее дело сегодня — и остров оживёт» + bare ti-seeding. Invitation, not refusal.

### Skate park & tricks
*Great carve physics + 8 flips, correctly de-coupled from Spark. But trick text renders in Baloo 2 (off-law font), «BAIL!» flashes in red #ff6b6b, and landed tricks leave zero trace.*

- **De-shame the bail** (S, wow 2/5, SOUL never-red) — recolor the bail message to white with ink outline, copy «почти!». The shake and combo-reset stay — the feel is the feedback. Two literals at app.js:5005.
- **One type family — Jost on the game canvas** (S, wow 2/5, PALETTE Jost) — swap the canvas Baloo 2 fonts (trickMsg, drawTree) for Jost 800. The world is the only surface speaking a second typeface.
- **Shining carve trail** (M, wow 4/5, BATTERY lived=shining + STRIPE GAUGE) — while carving above ~60% speed, the board lays a fading 9px striped ribbon on the grass (~1.2s alpha fade, low max alpha). Lived motion literally shines; skating feels faster for free.

### Spark sinks / shop (#upgrades)
*Three naked buttons buried at the bottom of the Character panel; disabled = browser-default; purchases visually silent.*

- **THE WORKSHOP — a cabin-anchored sink sheet** (M, wow 5/5, DOORS + CLASSY + CALM + §3 sinks) — move all sinks into one full-screen berry surface opened from the cabin spot (and a Мастерская door in the Game tab): k-card rows with bare colored icons, price chips (ti-sparkles + N). Affordable = 52px solid pink buy door; unaffordable = full-opacity matte row with a hairline «ещё 40» progress line — aspiration visible, nothing greys out dead. «Journey earns; world displays and spends» finally gets its room.
- **The purchase beat** (S, wow 3/5, MICRO-GRAMMAR cause→effect) — on buy: shadow-sink, a «−N» flies FROM the spark pill TO the item card (flyPoints reversed), the card spring-pops, hapt(2). Spending feels as physical as earning.
- **Garden & world cosmetics shelf** (M, wow 4/5, §3 cosmetics-only + SOUL ownership) — 3-4 spark-priced world cosmetics as new OBJS sprites (lantern string feeding the night pass, bench, koi, fence paint), each with a matte canvas-snapshot preview on its card. Power never purchasable.
- **Card sleeves — binder cosmetics as a sink** (S, wow 3/5, §3 sinks) — sell 2-3 binder frame sleeves (bronze/silver variants of the existing border-gradient CSS) for spark, applied per-card from the card zoom. Near-zero code cost.

### Badge binder (binderSheet + .binder-card)
*A 3-column grid of six small cards in the goal-card modal: earned = element bg + shared sheen, locked = dimmed .62 opacity, ranks are «★» text glyphs, total a grey line. Nowhere near the approved Pokémon-grade frames.*

- **Full-bleed binder — the collection gets a room** (M, wow 4/5, CALM + gold=earned) — promote to a full-screen berry surface: «Коллекция» 21px + a gold hairline-inset earned-count pill (legit — these ARE earned), 2-column ~168px cards with air, bare circle-X. The cards are the room.
- **Card zoom — the Pokémon moment, ported 1:1 from the approved frames** (L, wow 5/5, §12 APPROVED CANON ④ + foil=card-moments) — tap an earned card → FLIP-transform from its slot to center at 196×264 wearing the FULL frame treatment from pokemon_grade_holo_cards.html: prism rainbow-interference + orbiting sparkles, burst conic rays + rising embers, cosmos parallax nebula + stars, animated foil border. Below: flavor, the user's real numbers, a next-mark hairline. Drag down springs it back. The sister-persona's whole hook; David said «more of that»; the CSS is already written.
- **Real gyro tilt on the zoomed card** (M, wow 5/5, §12 canon + MICRO-GRAMMAR cause=the-hand) — replace the fake mintTilt keyframe with deviceorientation-driven rotateY/rotateX (±10°, spring-smoothed), binding the sheen's position to the tilt so the holo shifts as the phone moves. iOS permission on first zoom; keyframe fallback. REWARD-LANGUAGE v3 promised this; never wired.
- **Locked cards = matte aspiration, not dimmed ghosts** (S, wow 3/5, §3 collection + BATTERY + CLASSY) — drop opacity:.62 for full-opacity matte cards: silhouette icon, readable name, a 2px hairline progress bar under the next-mark line. Dimming reads as denial; matte reads as potential.
- **Rank pips, not asterisk strings** (S, wow 3/5, CLASSY + glyph hygiene) — four fixed 10px rounded-square pips per card (earned = gold fill, remaining = hairline outline); b-total becomes a per-family pip strip.
- **Shiny variants — 1/20 mints roll shiny** (M, wow 4/5, §3 shiny law) — on mint, roll ~1/20 for a shiny flag in S.badges: the card gets the «сияющий» finish (blue pulse ring + white sparkle sheen + corner ti-sparkles). Never announced in advance, never purchasable — Pokémon, not casino.

### Card mint moment (mintCard overlay)
*A solid ceremony: spring-in card, gold border, holo sheen, flavor, 3.6s auto-dismiss. But it reveals everything instantly, dies with a fade, stars are text glyphs.*

- **Face-down flip reveal** (M, wow 5/5, MICRO-GRAMMAR press-causes-reveal + §12 canon) — the card enters FACE-DOWN (the back = the halo+spark mark, matte on berry), wobbling once slowly; first tap flips it 180° and the sheen sweeps exactly ONCE as the element face lands. Anticipation is the whole psychology of pack-opening; right now the mint spends its surprise in frame one.
- **Element particles at mint** (S, wow 4/5, §12 canon ④) — port the frames' per-element particles to the overlay only: burst = 4 rising embers, cosmos = 5 twinkling stars, prism = 3 glints. Pure CSS lifted verbatim, dies on dismiss.
- **Fly-to-binder dismissal** (M, wow 4/5, MICRO-GRAMMAR cause→effect) — replace the fade-out with the card shrinking and spring-arcing to the Game tab icon (or binder header), landing with a counter-pop. Teaches where cards live without a word.
- **The story line — real data on the card** (S, wow 3/5, §3 story + mirror) — a second line under mint-lab with the user's own numbers and date («4 возвращения · июль 2026») from the badge's prog value.
- **Gold ti-star rank row** (S, wow 2/5, Tabler-only + one-language) — swap «★».repeat(rank) for bare gold ti-star icons matching the binder's pip grammar.

### Trophy shelf (missing surface — completed goals have no home)
*Does not exist. A completed goal appears once as a trophy node on the trail (with a literal trophy-emoji fallback) and then evaporates — the realest achievements are the only rewards with zero permanence.*

- **Quest full-art mints** (L, wow 5/5, §3 quest-full-arts + §12 canon + SOUL identity-evidence) — completing a goal mints an unbounded FULL-ART card: title, completion date, real stats (sessions, days, minutes), element by domain, prism treatment + gold foil frame (legal — a card moment). The rarest cards in the binder should be the ones no one else could ever own.
- **ТРОФЕИ tab in the binder** (M, wow 4/5, CALM + aspiration law) — two 44px segment chips — МЕТКИ / ТРОФЕИ. The trophy side holds quest full-arts, the crown count, a best-fire plaque; empty state = one matte shelf card «первая завершённая цель встанет здесь».
- **The shelf inside the cabin** (M, wow 4/5, §2 FOREVER world-displays + BATTERY) — walking into the cabin's radius reveals a drawn shelf sprite whose slots visibly fill with tiny card-back sprites as trophies accrue (drawn with the existing drawObj pipeline). Permanence you can WALK PAST.
- **The honorable-release row** (S, wow 3/5, SOUL way-out + §10-⑤) — goals released via «отпустить цель» appear on the shelf as calm matte cards labeled «отпущено» with their story line — full opacity, never crossed out. The way-out honored even in the trophy room.

### Game tab menu layer (t-self)
*A stack of leftovers: live world-window canvas + an emoji «enter your world» button, «coming soon», mood row, hero prompt, emoji quick-wins, a Character panel with a GOLD nag line, virtue tree, six stacked settings buttons, the shop. The one pane that ignores the calm law completely.*

- **The five-element rebuild — this pane becomes the cockpit of FOREVER** (L, wow 5/5, CALM + COMPOSITION + §12 cockpit grammar) — recompose to the cockpit-idle body: the live world-window as the HERO (full-width night-card, ink border, hard shadow — the app's most magical asset, currently squeezed), «Твой мир» 21px, one data sub (spark pill + fire chip), THREE DOORS ≥52px: Войти в мир (solid pink) / Коллекция (striped) / Мастерская (ghost). Everything else folds behind the character card or migrates to the You rooms.
- **Emoji sweep of the pane chrome** (S, wow 2/5, Tabler-only hard law) — enter-your-world → ti-device-gamepad-2; Character → ti-shield-star; quick wins → ti-bolt; the gender glyphs → ti icons or plain words. Violations sitting in David's daily path.
- **De-gold the nag** (S, wow 2/5, gold=EARNED + blue=start) — renderGame's «#ffc24a · ship 1 thing to grow» is gold used as a PROMPT. Recolor blue #36b3f0, reframe «одно дело — и мир растёт». Gold only ever answers; it never asks.
- **One spark pill, counter-pop wired** (S, wow 3/5, one-reward-language + MICRO-GRAMMAR + CLASSY) — collapse the pane's scattered spark mentions into ONE persistent k-pill at the top (ti-sparkles + count + fire chip); it's what rewardTarget() finds here, popping on every earn.

### Character card + virtue tree + virtue detail
*characterCard has clean bento bones, but drawTree renders emoji glyphs in sans-serif + Baloo 2 on canvas, and PERKS/OCC_PERK carry ~25 emoji into virtueDetail, whose CTA is a text «Do it now ▶» button.*

- **Jewel orbs replace emoji nodes on the tree canvas** (M, wow 3/5, JEWEL + Tabler + Jost) — drawTree nodes become solid jewel orbs (virtue color deepened toward ink, radial highlight), radius keyed to level, Jost labels kept. Eight gems on night instead of eight emoji stickers.
- **PERKS de-emoji map** (S, wow 2/5, Tabler-only) — map every perk emoji to a Tabler name (ti-run, ti-snowflake, ti-brain, ti-palette, ti-chess-knight, ti-heart-handshake…) as bare colored icons; swap «▸»/«✓» for ti-chevron-right/ti-check.
- **Perk ranks join the binder grammar — mastery mints** (M, wow 4/5, one-reward-language + §3 + no-random-features) — restyle perk pips to the binder's rank-pip language, and a MASTERED perk mints a matte mini-card into the binder under its virtue's element. Kills the drift of two parallel reward languages.
- **The do-it-now door** (S, wow 3/5, DOORS + one-hero) — virtueDetail's text-glyph CTA becomes the sheet's single 52px solid-pink door with bare ti-player-play.

---

## FLOWS — intro / start screen

### Start screen — first arrival (new user)
*v819 already matches frame 11: breathing halo+spark, orbiting glint, wide-tracked wordmark, one pink slab, bare-word secondaries, globe top-right, 3 twinkle stars, warm-berry floor. But a brand-new user still sees «Start fresh» (nothing to erase), and the slab's label ink is #4a1126, not the locked #160510.*

- **One door for a new life — hide «Start fresh» when nothing is saved** (S, wow 3/5, CALM one-moment + COMPOSITION) — showStartScreen() already computes `has`; when false, hide #ssNew entirely. The first-ever open: mark, wordmark, tag, ONE pink door, one quiet «Load save». The ss-subrow re-centers automatically.
- **First press = first ignition** (S, wow 4/5, MICRO-GRAMMAR ① + CHOICE-ROW v3 + STRIPE GAUGE) — on releasing the Start slab, a single 9/18px pink-stripe wipe sweeps across it once as it springs back and ssLeave begins. The very first press previews the app's entire selection grammar: press → ignite → the world opens.
- **Ink-correct the pink slab** (S, wow 2/5, PALETTE ink + §11 component law) — ss-primary label #4a1126 → the locked #160510, matching every other game-piece door. Two characters.

### Start screen — returning user
*Identical body with «Continue»; after ssEnter the gauge and welcome-back fire behind the leave. The screen knows NOTHING about the life it guards — no streak, no live block, no day count.*

- **The tag line remembers — «день 41 вместе»** (S, wow 4/5, SOUL mirror + CALM + CLASSY) — for returning users, the .ss-tag slot alternates to a lived line: «день 41 вместе» (days since profile.set), same muted #c79ab4; if streak fire is alive, a bare ember ti-flame precedes it. The door quietly proves it kept count while you were gone.
- **Live-block door — Continue becomes green GO** (M, wow 5/5, DOORS finish-carries-meaning + green=GO + no-random-features) — if a block was live-tracking at close, ssPrimary swaps to solid green #28cf86 with ink text and ti-player-play: «Вернуться · Чтение»; ssEnter lands with the dock/live block in view. The front door acknowledges the running life instead of pretending every open is a cold start.
- **Return-after-gap greeted at the threshold** (S, wow 4/5, SOUL return=flagship no-shame + one-breather) — when the ≥2wk welcome-back is due, the halo does ONE slow gold pulse on load (replacing ssGlow's loop for that open) and the tag reads «с возвращением». The user who braced for guilt meets warmth at the door.

### Language globe + flag menu
*Globe chip (rgba-white bg, ~36px — under the 44pt floor) opens a night card with a SOFT 44px shadow (hard-shadow violation), popIn rising from BELOW while the menu sits below its button; picking a language hard-reloads with a browser flash.*

- **Hard-shadow the menu and grow it from the globe** (S, wow 3/5, PALETTE hard-shadows + MICRO-GRAMMAR ②③) — replace the soft shadow with 0 4px 0 #160510 and popIn with a scale(.85)→1 spring, transform-origin top right — the sheet grows out of the globe that summoned it.
- **Choice-row v3 on the active language** (S, wow 3/5, v3 LOCKED + MICRO-GRAMMAR ①) — rest rows: dark tint + flat flag + white name + press sink; the CURRENT language row ignites: pink 9px stripes, 2.5px ink border, bare ti-check. The first place a new user meets the ignition language.
- **Globe chip to spec — 44pt, ink border, night surface** (S, wow 2/5, 44pt + PALETTE + CLASSY) — ss-lang → 44×44, #22091a, 2.5px #160510 border, hard 0 3px 0, bare white ti-world 20px.
- **Curtain the reload — no browser flash on language switch** (S, wow 3/5, MICRO-GRAMMAR nothing-jarring + CALM) — on pick: fade a fixed #1e0b18 veil in over ~180ms, then location.replace; on boot the entrance plays. One intentional curtain drop-and-rise. Reusable by Start-fresh and Load-save.

### Start fresh — armed erase confirm
*Two-tap wipe: first tap swaps the bare word's text for 4s, second tap clears ALL localStorage and reloads. The most destructive action in the app is a plain text swap.*

- **Arming makes it a real door with a visible drain timer** (M, wow 4/5, CLASSY hairline + MICRO-GRAMMAR ①② + SOUL no-fear) — first tap: the word ignites into a compact night row — ink border, hard shadow, bare ti-alert-triangle in muted mauve, «Стереть всё и начать заново?» — with a 2px hairline draining right-to-left over the 4s un-arm window (the timeout made visible, pure CSS). Never red, no shake: a door, not a threat.
- **The guardian keeps a copy anyway** (M, wow 5/5, SOUL always-a-way-out at its deepest) — before localStorage.clear(), stash the old save under a shadow key (alter_plan2_prev) that clear() skips. If fresh onboarding later finds it, the guardian can offer once: «нашёл твою прошлую жизнь — вернуть?». A guardian angel never lets you truly lose yourself, even when you asked to. ~5 lines, zero UI here.
- **Say once what gets erased** (S, wow 3/5, CALM + CLASSY) — the armed row carries one 12px muted sub: «профиль · план · сад — всё». One honest line; today the user confirms an erase whose scope was never stated.
- **Erase exits through the floor, not a cut** (S, wow 3/5, WARM FLOOR + MICRO-GRAMMAR) — on confirm, fade to #241019 over ~300ms (the language-switch veil) before location.replace. The world dims before it forgets.

### Load save flow (picker + error/success)
*Bare word → hidden file input → parseBackup. Failure fires a NATIVE alert() — a system dialog shattering the night world, EN-only in RU mode. Success hard-reloads with zero acknowledgment that a whole life was restored.*

- **Kill the alert() — errors are night cards rising from the word** (S, wow 3/5, MICRO-GRAMMAR ② + PALETTE + CALM + RU parity) — bad-file / storage-full render as a small ink-bordered card springing from the Load word: ti-file-x + «Это не файл ALTER», auto-dismiss 4s; 3 strings added to the RU dict. The one place the app drops out of its own world, fixed.
- **Preview the life before you load it** (M, wow 5/5, DOORS hierarchy + CLASSY + SOUL the-data-is-a-person) — parseBackup already returns the full object — don't reload blind. A night card from the Load word: identity word, day count, last-active («Давид · 41 день · последняя запись 30 июня»), solid pink 52px «Восстановить» + ghost «отмена». You SEE the life you're about to restore; wrong-file mistakes become impossible.

### Exit transition into the app
*ssLeave = 420ms opacity fade + scale(1.08); appMusicSync fires at a hard 470ms. The intro and the app remain two worlds joined by a dissolve.*

- **The spark hands off — one object crosses the cut** (L, wow 5/5, MICRO-GRAMMAR ②④ + COMPOSITION + §9 expensive mandate) — during ssLeave the pink spark detaches from the halo and flies one spring arc (~600ms) to its destination: new user → where the guardian circle materializes in onboarding beat 1; returning → the now-line/gauge focal point. Everything else fades; ONE persistent object stitches intro and app into one continuous world. Clone the .ss-spark path into a fixed SVG, animate to measured coords, interruptible.
- **The stars outlive the screen** (S, wow 3/5, COMPOSITION one-world + CALM) — give .leaving .ss-stars a 150ms delay so the three stars fade LAST; for a beat the night sky is all that remains, and the app's berry gradient reads as the same sky. Two lines of CSS.
- **Sound and light cross-fade together** (S, wow 3/5, MICRO-GRAMMAR extended to audio + §9) — start appMusicSync at the press, ramping the shared AudioContext gain 0→target over ~900ms so the music rises exactly as the screen dissolves. One gain ramp on v737 infrastructure.

---

## FLOWS — onboarding

### Beats 1-2 — Showman open («Hi, I'm Sage» + «Every real thing you do, I remember»)
*Two centered text screens: gold ti-sparkles, then a 74px pink dot-eyed .ob-face circle (beat 1) or a bare ti-shield-star (beat 2), 21px question, full-width GOLD .ob-btn (gold chrome — a v3 gold-law violation) with a unicode arrow. The guardian has two different faces in two screens; the CTA wears the earned color.*

- **One guardian, one face — the jewel circle everywhere** (S, wow 4/5, JEWEL + COMPOSITION + one-breather) — kill .ob-face (a cheap emoji face next to frame 12) and use the canonical .ob-ava (86px pink circle, ink border, purple halo ring, ti-sparkles) on BOTH beats, plus the v819 ring-orbit glint every ~6s. CSS-only; .ob-ava already exists (index.html:1441).
- **De-gold the primary door** (S, wow 3/5, v3 gold=earned + DOORS) — replace the gold .ob-btn with the KIT door: 54px solid pink, ink border, hard shadow, ink text, ti-chevron-right instead of the glyph. One rule change (index.html:1463) fixes every beat at once.
- **Lines that arrive like a showman speaks** (M, wow 4/5, MICRO-GRAMMAR ③④ + CALM) — the guardian's lines materialize one at a time — question, sub 300ms later, door 300ms after — each springing translateY(8px)→0; a tap mid-stagger completes everything. Timing instead of a wall of text.
- **Sage speaks aloud from second zero** (M, wow 5/5, §6 beat-2 aloud + SOUL presence + Mama pipeline) — call say() (app.js:214) on the first line: the guardian literally introduces itself in voice while the text lands, with a quiet «you can mute me anytime» sub. Onboarding is silent today; this is Mom's trust hook.
- **Teach the battery in one wordless second** (M, wow 5/5, BATTERY + STRIPE GAUGE) — on beat 2, as Sage says «your world grows», a 3-node mini path draws itself under the text: three matte berry dots on a hairline, the first igniting into pink 9px stripes with a tier-1 sfx. The app's entire physics taught before a single form. ~15 lines.

### Beat 3 — The Pact (hold-to-promise)
*The flow's best mechanic: 1.2s hold fills a gold button with a translucent WHITE sweep, vibrate on completion, label swaps to a glyph «promised». The fill speaks no ALTER language; completion has zero ceremony; release-early snaps back without feel.*

- **The hold IS an ignition** (M, wow 5/5, BATTERY + v3 ignition + STRIPE GAUGE) — the button rests matte berry with a pink solid outline; as you hold, pink 9px stripes sweep left-to-right behind the clipped fill; at 100% the whole button snaps to full ignition — ink border, ink text, bare ti-check — exactly like a matched block. Your word literally goes matte→shining under your thumb. Same DOM, new backgrounds only.
- **Haptic ramp under the thumb** (S, wow 4/5, MICRO-GRAMMAR ① + one-easing) — three escalating pulses at 33/66/100% (vibrate 5/9/14 via the existing holdT), hapt(2) on completion; release-early retracts on the spring instead of linear ease.
- **The world holds its breath** (S, wow 4/5, CALM + CLASSY 90%-dark) — while the thumb is down, everything except the button dims to 40%; release restores. The pact becomes the only lit thing in the room for 1.2 seconds.
- **The pact gets written down — with a gold hairline** (S, wow 4/5, gold=hairline-on-EARNED + mirror) — after the hold completes, a small sub fades in over a 1px gold hairline inset: «written: 2 Jul — you promised honesty. I signed too.» (gold legal — a promise KEPT is earned). data.pactAt already stores the timestamp; the trainer card's back later displays the same line.
- **Kill the glyphs** (S, wow 2/5, Tabler-only) — «✓ promised» → bare gold ti-check + «promised»; back arrow → ti-chevron-left. Onboarding must speak one icon language.

### Beat 4 — The Vibe question (frame-12 canon, built v819)
*The one beat rebuilt to canon: .ob-ava, 26px question, four k-row element rows (Burning/Flowing/Stuck/Drowning) with ignition on pick, 550ms auto-advance. But the pick is answered by silence, the teaching footer shows before it means anything, and the pick sets only P.lowStart.*

- **The guardian answers your truth — aloud** (M, wow 5/5, §6 verbatim + reflection-card law) — on ignition, ob-ava pulses once and one response line slides in per element: Burning «then we aim it.» / Flowing «then we wake it up, gently.» / Stuck «I know that place. one small thing first.» / Drowning «then no plans today. one relief.» — while say() speaks it; auto-advance stretches 550→1600ms. The first proof the app LISTENS.
- **Unpicked rows bow out** (S, wow 4/5, CLASSY one-saturated + CALM) — the instant a row ignites, the other three sink (opacity .45 + translateY(2px)); the ignited row is the single saturated hero during the response beat. One CSS rule + a class toggle.
- **Teach after, not before** (S, wow 3/5, CALM one-moment) — move «your pick ignites — like a matched block» to fade in only AFTER the pick, naming what the user just felt.
- **The pick actually sets the dials** (M, wow 4/5, §5/§6 persona defaults + appetite dial) — wire the specced silent defaults: Drowning → door default relief + appetite low; Stuck → tiny-step guardian primed; Burning → appetite high, stats surfaced. Write S.profile.doorDefault and seed S.guide appetite from data.vibe in finish(). What makes beat 6's routed landing honest instead of theater.

### Beat 5 — Room + the first task (+18 Spark payoff)
*The flow's oldest skin: ALL-CAPS label + five old pill chips for the room (clashing with the v3 rows one screen earlier), «Pick two things up off the floor», green Done with a unicode check. The payoff «+18 Spark.» is a silent text swap — rewardFx/flyPoints/sfx all sit unused.*

- **The payoff plays its own reward** (S, wow 5/5, MICRO-GRAMMAR + reward INVERSION) — when Done is tapped, fire the real economy: flyPoints('+18') arcs from the Done door to a spark counter that pops to absorb it, with sfx(2) + hapt(2) — all existing functions (rewardFx at app.js:5302); the «+18 Spark» headline counts up 0→18 over 500ms. The single highest leverage/effort ratio in the whole flow: the first win must FEEL like the wins the app sells.
- **Room picker joins the v3 family** (M, wow 4/5, v3 LOCKED + CALM) — the five room chips become k-rows (ti-bed / ti-tools-kitchen-2 / ti-armchair / ti-device-desktop / ti-bath), each in its own jewel hue, pick = ignition + auto-advance. One choice language across the entire flow.
- **One question per screen — room, then the task** (M, wow 4/5, CALM + frame-12 canon) — split the beat: the room question alone (auto-advance), then the task screen with the answer folded into the copy — «Pick two things up off the bedroom floor. I'll wait.» Personalization lands as proof-of-listening.
- **The task is the first quest card** (M, wow 5/5, COCKPIT GRAMMAR + §12 quest-card canon + no-random-features) — render the task as a small k-card quest (v818 grammar): rounded icon well with ti-hand-grab, «Two things off the floor», matte edge; while the user is away doing it, the halo breath slows to a waiting pulse; on Done, the card's edge fills like a quest foil frame before the sparks fly. The quest-card language taught on day zero, with a real quest.
- **Done door to spec** (S, wow 3/5, DOORS green=GO + Tabler-only) — Done becomes the KIT green GO door: 54px, solid #28cf86, ink border, hard shadow, bare ti-check. Skip stays quiet text.

### Beat 6 — The Seed
*A 120px flat green circle holding a ti-sparkles (wrong glyph), «Plant your first seed», and a Plant button carrying a LITERAL EMOJI — violating the hardest rule in the constitution. Planting calls the real plantGarden() (good) but visually nothing grows.*

- **Emoji purge + honest glyphs** (S, wow 3/5, no-emoji invariant + DOORS hierarchy) — Plant → KIT green GO door with bare ti-seeding; the circle's icon becomes ti-seeding; «Start ▸» → solid-pink 54px «Begin day one» + ti-chevron-right (pink = the hero door into the world; green stays on the plant action).
- **Watch it grow — the first conversion you SEE** (M, wow 5/5, BATTERY matte→lived + MICRO-GRAMMAR ② + JEWEL) — on Plant: a seed-dot arcs from the button into the circle (flyPoints repurposed), the matte green ignites into the binder's bio treatment, and a sprout draws itself inside via SVG stroke-dashoffset over 600ms, closing with tier-2 sfx+hapt. The world's first growth is witnessed, not narrated.
- **Point at where it lives** (S, wow 3/5, §0 one-world + no-random-features) — after planting, one sub with ti-arrow-right: «it's alive in your world — swipe right anytime to visit.» plantGarden() really wrote to S.game.garden; telling the user WHERE roots the game pane and seeds the swipe-nav model for free.

### Trainer-card mint beat (SPECCED, UNBUILT — the flagship gap)
*Does not exist. §6 beat 4: identity word → the trainer card mints, the binder is born with 1 card. Everything needed is in the codebase: mintCard()+mint-ov CSS, binderSheet, element treatments, identity words (VCLASS). Onboarding currently ends without giving the user a single owned thing.*

- **BUILD THE MINT — the first card you own** (L, wow 5/5, §6 beat 4 + §3 collection + BATTERY carried into the collection) — new beat after the +18 payoff: «One word for who you're becoming?» — 4 stage-based chips (calm / strong / focused / free) + an own-word input (rc-row pattern) — then the card mints via the existing mint-ov scaffold with a NEW .el-trainer treatment: matte warm-berry #241019, 3px ink border, NO foil, NO sheen — deliberately the only matte card that will ever exist, because matte = potential and this card's story is that it ignites as you live. Face: the identity word huge in Jost 800, «EST. 2 JUL 2026», flavor «day one. everything ahead.» Store S.profile.card + S.badges.earned.trainer_1 so binderSheet renders it first. The reason-to-collect, minted in minute two.
- **The card flies to the binder — and the binder is born** (M, wow 5/5, MICRO-GRAMMAR ② + one-world) — after 2.5s of admiring, the card shrinks and arcs (the flyPoints grammar, scaled up) into a small ti-cards chip materializing bottom-corner: «collection · 1», then fades. The user learns where cards LIVE by watching one travel there. ~20 lines on the existing Web Animations pattern.
- **The card back carries the pact** (M, wow 5/5, §8 + mirror-not-price) — mint-card already has preserve-3d — add tap-to-flip: the back shows the pact date + the vibe word in small gold-hairline-framed lines («promised honesty · 2 Jul» / «arrived: stuck»). The whole onboarding compresses into one flippable object the user keeps forever; the same component renders atop the You tab.
- **Show the evolution contract at mint** (S, wow 4/5, §3 next-mark law + INVERSION) — under the fresh card, three matte pips with micro-labels: «7 days · first crown · first return» — each future evolution upgrades the card's finish one step (matte → hairline inset → prism at evo 3). Render-only now; triggers land in the collection run.

### The finish / landing + skip path (the Door beat, half-built)
*finish() seeds defaults, removes the overlay with zero transition, and calls openJourney() — the same landing for every vibe. §6 beat 5 (the energy gauge routing) isn't in onboarding; skip works but says nothing about what it did.*

- **One continuous shot into the world** (M, wow 5/5, MICRO-GRAMMAR ②③ + CALM) — kill the hard cut: the ob-ov fades as cascadeJourney() plays behind it, and the guardian's ava shrinks and glides to the journey's guardian position while the first stone ignites with tier-2 fx. The user never experiences «onboarding ended, app started» — Sage walks them in. ~25 lines in finish().
- **The vibe routes the first stone** (M, wow 4/5, §6 beat 5 + energy-door law + way-out) — the landing honors the pick: Drowning/Stuck → the relief/tiny-step stone glows + «we start soft»; Burning → track-now; Flowing → plan-one-thing. Pass data.vibe into the S.guide.fd seed and let firstDayNodes() order stone 1. The whole flow's listening pays off in the first 10 seconds of real app.
- **Skip that tells you what it kept** (S, wow 2/5, SOUL way-out no-shame) — one toast «set you up with the essentials — redo anytime in Settings.» Costless honesty; advertises the Redo-setup row that already exists.
- **Sage's first spoken sentence in the world** (S, wow 3/5, never-hands-over) — as the journey lands, say() one routed line («the glowing stone is yours — five today, no rush.»), then silence. The guardian's voice doesn't exist only inside setup. Guarded by S.audio.voice.

### Flow chrome — progress dashes, footer, back/skip, the floor
*Six gold progress dashes (frame-12 canon, correct), a footer with primary + back + skip crowded into one row, and an overlay gradient bottoming out near-black — below the warm floor. Unicode glyphs throughout.*

- **Dashes that ignite when walked** (S, wow 3/5, gold=earned/walked + one-easing) — a completed dash fills left-to-right (scaleX 0→1, 240ms spring) with a 1-frame gold afterglow. Gold is legal and PRECISE here: the flow's only earned-progress readout.
- **Warm the floor** (S, wow 2/5, WARM FLOOR §12) — retune the ob-ov gradient's end stop from #1a0712 to the warm-berry floor family. One hex (index.html:1435).
- **One door per footer** (S, wow 3/5, CALM + COMPOSITION + DOORS) — the primary door stands alone full-width; back becomes a quiet bare ti-chevron-left ghost square (44pt); skip moves to the card's top-right as 12px whisper text. The bottom of every beat reads as ONE move.
- **Glyph sweep** (S, wow 2/5, Tabler-only) — one pass replacing every unicode arrow/check in onboarding footers with ti-chevron-right / ti-chevron-left / ti-check / ti-player-play — six call sites in onboard() + gaugeOpen().

---

## FLOWS — toolbox

### One-door front (cockpit «tool» stage — toolboxStageStep, v816)
*Freshest surface in the group: frame-matched header, pink-outlined FOR-RIGHT-NOW hero with green 52px GO, 54px daily circles, three fold rows. Gaps vs canon: fold rows on purple-leaning #241328, no «why this works» fold under GO, «All tools» does a full renderStage() wipe, daily labels under the 12px floor.*

- **The «why this works» fold under GO (frame parity)** (S, wow 3/5, CALM + §12 canon ③) — a muted «почему это работает» line with ti-chevron-down UNDER the green button; tap expands the mechanism sentence + thinker credit (t.why + t.thinker) with a 180ms spring max-height. Quieter at rest, smarter on demand.
- **The guardian PROVES it picked for a reason** (M, wow 5/5, SOUL mirror + §7 proves-it-learned) — toolForNow() already reads real state (drift → blacksun, low mood → breathe, night → selfhyp) but the card shows the generic t.why. Compose the sub-line from the trigger: «a drift is running — this starves the pull, not feeds it» / «it's late — this installs while you wind down». One switch over nowStates(). The pick stops feeling random and starts feeling watched-over.
- **Fold rows in choice-row v3 rest state** (S, wow 3/5, v3 + PALETTE berry-only) — the three fold rows become k-rows: All tools lavender #c9a6ff, Build a session teal #63d3c9, Sharpen the mind sky #5ec4f5 — dark own-color tint + solid outline + bare colored icon. Kills the off-family #241328 fill.
- **The library unfolds from its cause (kill the wipe)** (M, wow 4/5, MICRO-GRAMMAR ② + landmine) — «All tools» toggles the lib div with a spring max-height reveal + 30ms child stagger; the chevron rotates 90°. Removes one wipe-and-rebuild surface.
- **The daily shelf's earned close** (S, wow 4/5, SOUL inversion + gold=EARNED + 12px floor) — when the LAST daily circle completes, the three circles spring-pop left-to-right (one breather) and the YOUR DAILY label gains a small bare gold ti-check — genuinely earned gold. Resets at the logical day; bump labels to 12px while in there.

### All-tools library (SOS row, recents, category tabs, tool cards)
*Old skin behind the new door: selected tab = SOLID pink (a second pink hero), cards on purple #241328 with two full paragraphs each, the pin a near-invisible 15px icon, rung pips 7px with a 9px label.*

- **Category tabs speak choice-row v3, per-layer element hues** (S, wow 4/5, v3 + one-pink-hero) — 5 layers get element colors (Body teal, Mind sky, Feel ember, Become violet-whisper, Lift peach, Yours pink); rest = tint + outline + bare icon, selected = IGNITION into its own 9px stripes + ink border. Frees pink for the FOR-RIGHT-NOW hero.
- **Cards breathe: «why/when» folds, one line at rest** (S, wow 4/5, CALM + Сестра pipeline) — default card = icon + name + thinker + ONE «reach for it when» line; the why-paragraph folds behind a chevron. From a scroll of essays to a scannable rack — any wall of text = uninstall.
- **The Stutz ladder becomes earned finish, Grace = gold hairline** (M, wow 5/5, CLASSY + gold=EARNED + INVERSION) — replace the dot pips with a fine 3-segment bar (ember fill per rung, Willingness/Habit labels at 12px); at rung 3 (Grace, 12+ reps) the CARD earns a hairline gold inset inside the ink border and the label sets in gold. Your most-practiced tools literally shine in the rack — mastery as battery.
- **Pin = a real 44pt act with a points-fly** (S, wow 3/5, MICRO-GRAMMAR ① + 44pt + reinforce loop) — the pin becomes a 44pt target at the row end, pink when pinned; on pin, a single spark mote flies to the daily shelf. The reinforce-loop's core act is currently the least visible control on the screen.
- **The SOS row becomes a proper door** (S, wow 3/5, DOORS + SOUL) — «Something specific is loud — help me pick» becomes a full-width 52px k-row at the library top: deep crimson tint + solid crimson outline + bare ti-lifebuoy — urgent-warm, never red-alarm. Leads straight into the triage.

### Yours pane + Build-your-own-tool flow (buildToolFlow)
*The creativity endgame is undersold: empty state = one muted sentence, the create entry a tiny chip, delete a one-tap trash, and the builder one long bento scroll with pre-v3 solid-fill selection.*

- **Empty state = a dashed invitation card + a striped door** (S, wow 3/5, BATTERY + DOORS) — the .rc-row.own pattern: a matte dashed card «Nothing here yet — make a little tool that's yours» + a 52px striped-pink SECONDARY door «Build your own tool» (ti-sparkles). Matte-dashed = not yet made.
- **The builder becomes 4 staged beats (one question per screen)** (M, wow 4/5, COMPOSITION + v3) — split into 4 beats (What's it for / When / Your anchor / Name it) with the v819 progress dashes, auto-advance on pick; intent/when/anchor chips become v3 rows in each option's OWN color (TB_INTENT carries colors).
- **Creating a tool MINTS a card** (L, wow 5/5, §12 canon ④ + collection economy) — on create, the new tool mints: a card rises from the Create button (flip + one sheen pass, the trainer-card grammar), face = the user's sigil marks large + the name + intent color edge, then flies into the Yours shelf. A tool you built is the most personal object in the app; it deserves the binder's ceremony.
- **Honorable release instead of instant delete** (S, wow 3/5, SOUL way-out + §10-⑤) — trash → a small confirm card rising from the row: «Set this one down?» with ghost «keep it» / solid «set it down»; released tools go to S.tools.customArchive, restorable.
- **The sigil preview breathes once** (S, wow 3/5, MICRO-GRAMMAR ⑤) — a picked sigil combo grows to a 64px composed mark that does ONE slow breath and settles; picked sigil tiles ignite in the intent's own color.

### Build-a-session menu (stackBuilder)
*The oldest-skin surface in the group and a multi-law violator: purple GRADIENT hero, 46px SOLID icon containers (rejected, §12 final amendment), thin rgba borders, no hard shadows, done2 CTA.*

- **Full kit rebuild — the one-door grammar one level down** (M, wow 4/5, PALETTE + CLASSY + §12 no-containers + DOORS) — rebuild on k-card/k-sec/k-row: berry surfaces, ink borders, hard shadows; the Full Stack becomes the ONE hero (pink-outlined night card, k-dur chips 10/20/45, a 52px solid GREEN «Play — 10 minutes»). Kill the gradient, kill every icon square — bare colored icons + white labels.
- **Every pack carries its session as a mini battery strip** (M, wow 5/5, BATTERY + §0 one-physics) — under each pack's name, a 6px segmented bar: one segment per tool, width proportional to duration, filled in that tool's color — matte at rest; a pack completed today shows its strip in the 9px lived stripes. Session options literally look like tiny timelines, and finished ones shine. The group's holy-moly candidate.
- **Time-first pack doors** (S, wow 4/5, CALM + Сестра ≤2-taps) — render the three packs as one row of three chunky time doors (56px, «5 / 10 / 20» large, pack name 12px beneath), tap = begin immediately. Two taps from the toolbox door to a running session.
- **The ritual row that matches NOW gets the outline** (S, wow 3/5, v3 rest emphasis + mirror) — Morning charge / Evening peace as bare-icon k-rows (ti-sunrise ember, ti-moon-stars indigo); the one matching the actual hour gains its own-color solid outline. The menu quietly knows what time it is.
- **Build your own = ghost tertiary, not a floating done2** (S, wow 3/5, DOORS hierarchy) — a ghost-finish 52px door at the sheet's foot (dashed outline, muted label, ti-adjustments) — the correct third rung under the green Play and the pack doors.

### Session composer (openSessionComposer)
*Mechanically excellent (drag-reorder, edge-resize, zoom) but cosmetically pre-redesign: rgba scroller, blocks bordered in rgba-black, 9px time labels, 30px zoom buttons, a permanent instruction line, thin pool chips.*

- **Blocks inherit the timeline's exact body** (S, wow 4/5, PALETTE + §0 one-physics) — composer blocks become planner blocks: radius 12, 2.5px ink border, hard shadow, solid tool color as matte fill, grip dots and resize bar in ink at 40%. The composer reads as «a tiny day you're planning»; the floor goes warm #241019.
- **Total time becomes the header's voice** (S, wow 3/5, CALM + 44pt) — the total promoted to a 21px «12:30» with «your session» beneath; zoom ± grow to 44pt ink-bordered squares.
- **First-touch ghost hint replaces the permanent caption** (S, wow 3/5, CALM + ghost-hand precedent) — delete the always-on drag instruction; first open only, a ghost hand rides the first block's grip for one 1.2s loop, then never again (S.tools.composerHinted).
- **Pool chips in v3 rest state, blocks cascade in** (S, wow 3/5, v3 + MICRO-GRAMMAR ①② + haptics) — pool chips = tint + outline + bare icon; tapping one spring-sinks it and the new block drops into the lane with a spring cascade + soft snap haptic; resize ticks at each 15s.
- **The composed track follows you into the player as a battery rail** (L, wow 5/5, BATTERY converter + eyes-closed respected) — when Play fires, the player carries a slim 4px vertical rail on the left edge: one segment per composed section in its color — matte ahead, converting to 9px stripes as each section is LIVED, the boundary glowing as the now-point. Eyes-open glances tell you exactly where you are without a word; rail only, never sounds.

### Meditation composer + nested «This meditation» chooser (medEditor)
*The 7-section taxonomy (settle→breath→body→aware→rest→bliss→play) is genuinely deep, but it renders as an unordered chip pool; the nested chooser is a bare overlay with two unstyled buttons.*

- **The pool becomes the depth ladder** (S, wow 4/5, COMPOSITION + no-random-features) — render the 7 sections in ORDER as a labeled ladder («surface → deep»): v3 chips left-to-right in their colors on a hairline connecting rail; Bliss/Play at the deep end slightly matte with a «deep water» sub. Readable pedagogy: meditation HAS an order.
- **Deep sections earn their full shine** (M, wow 4/5, SOUL inversion + §3 aspiration) — Bliss and Play render ~70% saturation until N sessions containing Awareness/Rest, then bloom with one counter-pop. Never gated — tappable day one — just visually earned.
- **«This meditation» rises from the tapped block** (M, wow 4/5, MICRO-GRAMMAR ② + CALM) — replace the full-screen chooser with a small k-card popover growing from the tapped meditate block: two v3 rows («Quick guided default» / «Choose the sections») + the composition as tiny color pips. A two-choice menu should never cost a whole screen.
- **Depth pips — the Глубина ledger in fine detail** (M, wow 3/5, CLASSY + §2 depth-runes) — in the med composer header, 7 tiny 6px section-pips (filled once you've ever completed that section). Feeds the specced Глубина badges with zero new chrome.

### Session runner interstitial + Session complete (runStack / stackComplete)
*All-text overlays in the old voice: «Step 2 of 5» in pink caps, done2 Begin/Next, an «end» text corner button; completion = a purple check + two lines. No sense of position, no reward moment.*

- **The session strip replaces «Step X of Y»** (M, wow 4/5, BATTERY + CALM show-don't-caption) — top of the interstitial: a horizontal segmented strip of the whole track — done segments in their color's 9px stripes, current full matte color with a soft pulse, future dark tints. Position becomes visual; the text drops to a 12px sub.
- **Begin = the green door; «end» = a shame-free ghost** (S, wow 3/5, DOORS + SOUL) — Begin/Next become the 52px solid green GO door; the corner «end» becomes a ghost «set it down» pill.
- **Completion = the ignition sweep** (M, wow 5/5, reward T1-2 + BATTERY converter + eyes-closed) — on stackComplete, the strip ignites left-to-right (each segment flips matte→striped, 60ms stagger), the earned spark counter-pops and flies to the TLM, one line: «N tools · carry the calm». The session's whole shape converts to LIVED before your eyes — the most literal statement of the app's thesis available anywhere.
- **The pre-roll breath IS the interstitial** (M, wow 4/5, §2 players + MICRO-GRAMMAR ④) — between tools, the orb does one guided 4s inhale/exhale automatically; the green door fades in on the exhale's end; tapping anywhere skips. Transitions stop being dead air and become part of the practice.

### Brain Gym chooser (brainGym)
*Three thin-bordered rgba-white cards floating mid-air, no kit material; Link's identity color is #ffd24a — gold spent on chrome; personal bests exist in state but are invisible.*

- **Kit rebuild + re-hue Link off gold** (S, wow 3/5, v3 + gold=EARNED + PALETTE) — k-sec «SHARPEN THE MIND», three v3 rows: Recall pink #ff5fa0, Focus Cross teal #63d3c9, Link ember #ff8a3a (freeing #ffd24a), ink borders, hard shadows, spring press.
- **Personal bests live on the rows — in gold** (S, wow 4/5, CLASSY + gold=EARNED + §3 next-mark) — right edge of each row: «best 12» with the number in gold (a personal record IS earned — the one legitimate gold in this menu); no best = muted «no mark yet». A trophy rack you want to raise, from data already in S.tools.games.
- **Games join the daily shelf** (M, wow 4/5, no-random-features) — allow pinning a game to Your daily (extend S.tools.daily to accept game ids; done-today = green ring when a run logged). A 60-second focus rep is exactly the daily micro-practice the reinforce loop was built for.
- **Today's reps as a quiet line** (S, wow 3/5, SOUL mirror no-nag + §3) — under the k-sec: «today: 1 rep · Точность grows with accuracy» only when a rep exists today; silence otherwise.

### Brain Gym games + end states (recallGame / focusCrossGame / linkGame)
*Honest mechanics, pre-redesign bodies: Recall's pads idle at 0.42 opacity (washed mud), Focus Cross flashes WRONG in red-pink #ff5f7a, Link's rows are rgba washes, end screens are big-number + done2 with the earned spark invisible.*

- **Recall pads become jewel game-chips** (S, wow 4/5, JEWEL + v3 duality + press grammar) — idle pad = dark own-color tint + solid own-color outline; flash/tap = full jewel saturation + the 2px press-sink. Kills the 0.42-opacity mud outright.
- **Wrong is never red** (S, wow 3/5, SOUL no-shame) — Focus Cross: correct = green flash (keep); wrong = the cue dims to muted berry + one soft haptic — no red, no sting; the rhythm moves on. One line.
- **New best = a counter-pop mint in gold** (S, wow 4/5, reward T1-2 + gold=EARNED + DOORS) — end screens: the score counter-pops; a new best sets in gold with one spring overshoot + «a new mark»; the earned spark becomes VISIBLE — motes fly to the TLM. Again = solid, Done = ghost.
- **Link's chain flips in like cards** (S, wow 3/5, MICRO-GRAMMAR ③ + 44pt) — learn phase: the 8 words as chunky ink-bordered mini-cards cascading in; reveal re-flips them one by one so recall FEELS like turning cards over; self-score chips become 44pt v3 tiles.

### Part-X triage — «help me pick» (partXTriage)
*The group's most important empathy flow runs in the RETIRING #sheet system: five identical done2 buttons for the five attack modes, an old breathorb pre-step, and an emoji in a toast — a hard law violation.*

- **Migrate to the night stage as a reflection card** (M, wow 5/5, v3 + §7 worksheet engine + retires #sheet) — rebuild on the full-screen night stage: 21px «Which one's loud?» + five v3 rows, each attack mode in its OWN hue mapped to its tool (numb = cosmos indigo/Black Sun, drained = ember/Vortex, avoiding = blue/Reversal, stalled-after-win = orange/Jeopardy, a hurt = crimson/Active Love). Pick = ignition + auto-advance to the naming beat. The five feelings become five colors you learn.
- **Naming it pays — and loses the emoji** (S, wow 3/5, Tabler-only + reward tiers + mirror) — «Just naming it was enough» becomes a ghost door paying tier-1 with «you labeled it — that's the whole skill» — no emoji, ever. Labeling is the mechanism; the reward router should say so.
- **The regulate-first beat goes full-screen** (S, wow 3/5, CALM + SOUL way-out) — the «body back online» pre-step becomes the full-screen orb with ONE line + a ghost «already calm — skip» pill; the Stutz ordering stays enforced.
- **The naming line lands in the guardian's voice** (S, wow 4/5, COMPOSITION + guardian voice) — on mode pick, «That's Part X — not you» at k-q scale with the mode's bare icon, spoken via the existing TTS (one line, interruptible, respects volume). Being told «it's not you» out loud is the whole therapeutic payload; currently it's a 13px sheet label.

---

## FLOWS — players (sessions, bookends, journal)

### Tool intro card (pre-roll: what/how/why)
*beatRunner's startWithIntro (app.js:7029) — inline-styled 440px card, numbered colored-circle steps, pink «why» wash, «I'm ready ▶» text-glyph button. Functional but pre-kit.*

- **Recut on THE KIT** (S, wow 3/5, CALM + DOORS + MICRO-GRAMMAR) — night k-card, 21px title, the tag («for the thing you're avoiding · 30 sec») as an 11.5px letterspaced pink label, how-steps as plain ink-numbered lines, Begin = a 54px solid door in the tool's element color with the shadow-sink. ti-player-play replaces the glyph.
- **The intro IS the session map** (M, wow 4/5, BATTERY at a new zoom) — render the how-steps as a vertical matte ladder of the session's actual beats; in-session the ladder persists as 5 hairline pips, each beat igniting in the tool's color as it's lived. The tool taught before it starts — matte = coming, shining = done.
- **Depth rune footer** (M, wow 4/5, CLASSY + §3 aspiration) — a quiet bottom row: your accumulated depth with THIS tool (sessions, minutes, drift-catches) as matte pips + one «next mark: 3 more sessions → Глубина II» line. Feeds the Глубина badge family.
- **Begin collapses into the orb** (S, wow 4/5, MICRO-GRAMMAR ② inverted) — on Begin: the card sinks 2px, then collapses INTO the inflating orb with one spring — the session rises from the button that caused it. ~90% CSS transforms on existing nodes.

### Composed player in-session (timelinePlayer orb stage)
*Strong bones: orb + drifting waves + pinned title + cog + drift-tap loop. But hard-coded purple regardless of tool, drift hint permanently visible, chrome never leaves.*

- **Element-tinted sessions** (S, wow 4/5, JEWEL + one-hero-hue) — the orb, waves and transport take the TOOL'S own jewel hue (meditation = cosmos indigo, breath = teal, charge = fire orange, love/gratitude = pink); one CSS variable (--tool-c) threaded through .bw-orb/.gp-waves/.gp-play replaces the fixed purple.
- **Chrome leaves the room** (S, wow 4/5, CALM + eyes-closed) — after 8s untouched, title/cog/close/transport fade to 0 (600ms); any tap wakes them for 6s. Only the orb and the current line remain. Interruptible, pure CSS class on a timer.
- **Catch = the unit (drift-tap upgrade)** (M, wow 5/5, SOUL catch=unit inversion + teach-once) — each orb tap ripples one thin ring outward + the existing chime + lights one pip in a tiny bottom catch-row. Catches are REPS: +1 spark each, paid at the end, never mid-session. The always-visible hint dies after your first-ever real catch.
- **Long lines become the hero** (S, wow 3/5, COMPOSITION few-big-breathing) — lines >64 chars render as the focal text: 21px, centered, max 2 lines, a barely-alive 6s opacity sway (the one breather). The spoken word deserves the center.

### Player transport bar (scrub / ±15 / play)
*6px scrub, 66px purple play with a soft glow shadow (off-grammar), ±15 ghosts. Hidden until decode with a dead «preparing…» label.*

- **Ink-grammar transport** (S, wow 3/5, MICRO-GRAMMAR press + CLASSY hard-shadows) — play = 62px circle in the tool's element color, 2.5px ink border, hard 0-4px-0 shadow, sink + spring; ±15 = bare 44pt ghosts; scrub knob gets an ink edge. The one place still shipping iOS-default media chrome.
- **The scrub speaks battery** (M, wow 4/5, BATTERY + fine-detail pips) — lived portion = solid element tint (solid, not shrunken stripes), remaining = matte; the knob = the now-line dot; hairline tick pips mark where each spoken cue sits, and scrubbing snaps gently to cues — navigate the session by its sentences, not by seconds.
- **No dead preparing state** (S, wow 3/5, MICRO-GRAMMAR nothing-uncaused) — kill «preparing…»; the transport rises from the bottom edge with the spring the instant ready=true. Nothing pops into existence; it arrives.

### Player ending (finish state) — H12
*finish() — «Done ✓» text swap, orb shrinks, overlay removed after 1.5-2.6s, spark earned invisibly. H12 (pre-roll breath + 20s ending silence) entirely unbuilt.*

- **BUILD H12: the 20s ending silence** (M, wow 4/5, EYES-CLOSED absolute + H12) — append a voiceless segment (gap:20) to every meditation/ritual layout; the label fades, waves slow to half speed, the orb settles into a 12s breathe, and a hairline ring quietly completes around the orb over the 20s so open eyes know it isn't stuck. The session ends by itself, not by a popup.
- **The settle: reward at the threshold** (M, wow 4/5, reward grammar + eyes-closed) — after the silence: ONE line («carry the calm with you»), then the orb collapses into a single spark that flies to the corner ledger via the tier-1 router, and the overlay dissolves. The reward fires AT the exit door — never inside, never a toast.
- **Catches paid on the way out** (S, wow 4/5, SOUL catch=unit + mirror) — «7 catches — that noticing IS the practice»: seven pips ignite left-to-right with seven +1 sparks flying; zero catches reads «steady the whole way» with one long lit pip. What you caught is what you earned.
- **Depth rune stamp** (M, wow 4/5, collection + gold=mint-moments-only) — session end stamps one rune into the tool's depth track (the quest-card icon-well pattern); at rank thresholds the Глубина badge mints in the binder. Returning users see their depth before they begin.

### Breathwork player
*Works well (Web Audio swell bed, pre-scheduled cues). But «cycle 2 / 4» is a text counter, the finish an abrupt 1.5s timeout, and cues start on cycle 1 with zero arrival room.*

- **Cycle pips, not a counter** (S, wow 3/5, BATTERY + no-pressure mirror) — N matte dots under the orb, each igniting solid teal as its cycle completes. No fraction to fail; readable with eyes half-open.
- **H12 parity: silent first cycle** (S, wow 3/5, EYES-CLOSED + H12) — cycle 1 is always voice-free: you arrive, the orb leads, the voice joins on cycle 2; the final cycle exhales into 8s of silence before the settle. One index shift in the scheduling loop (app.js:5606).
- **The last exhale is the reward** (S, wow 3/5, reward grammar consistency) — on finish the orb exhales its light: scale to .5 while a spark detaches and flies to the ledger. Breathwork stops being the one tool that just vanishes.
- **Phase crossfade** (S, wow 3/5, CALM + one-breather) — crossfade labels 300ms; the orb's hue warms ~5% on the in-breath, cools on the out. The difference between an app and a companion.

### Beat-runner tap-through tools (Reversal of Desire, rewire, etc.)
*«Next ▶» text-glyph advances beats, orb scales, warm pad. Solid mechanics; generic presentation — every tool feels identical, and Reversal's cloud journey is invisible.*

- **Doors that narrate the journey** (S, wow 4/5, DOORS + Tabler-only) — replace «Next ▶» with a 54px solid element-color door labeled with the NEXT beat's verb («Into the cloud», «Through to light») + ti-arrow-right; the last beat = a striped finish door. The button becomes part of the tool's story.
- **Pass through the cloud (Reversal signature)** (M, wow 5/5, JEWEL indigo=drowning + one-moment) — beats 1-3 sink the whole overlay toward deep ocean indigo (the cloud closing in); beat 4 «Pain sets me free» floods it back to fire orange over one spring. The screen physically passes through the cloud with you — full-screen atmosphere, not chrome.
- **Beat rail** (S, wow 3/5, CLASSY + kit reuse) — up to 5 hairline pips at the bottom, lived beats lit in the tool color — you feel «two more» without a number. Same pip component as breathwork cycles and the AM bookend.
- **The avoided block ignites at the end** (M, wow 4/5, no-random-features + courage economy) — launched from an avoided block, the final beat shows that block as a matte mini-chip; «Finish» ignites it into its domain stripes and auto-starts it (startPlanned already wired at app.js:7202). The tool visibly hands you INTO the timeline; courage T2 + Смелость fire here.

### Session config screens (meditation config, stack builder, Full Stack card)
*Selection = purple FILL (#9a7cff), Full Stack = a purple-pink gradient wash, 1.5px borders, 46px solid icon slabs. Pre-v3 everywhere; the most law-violating surface in the group.*

- **Every picker → choice-row v3 + k-dur** (S, wow 3/5, v3 LOCKED) — guide/frequency/duration become the locked grammar (rest = tint + outline + bare icon; picked = ignition + check); duration chips reuse k-dur. Every #9a7cff selected-fill dies in one pass.
- **Full Stack recut as the flagship night card** (S, wow 3/5, PALETTE color-in-icons) — berry night card, ti-stack-2 in cosmos indigo, 17px title, and its five stages (breath→attention→charge→love→mantra) as five tiny matte wells previewing the arc; GO = 54px solid green. The last big off-palette gradient dies.
- **One recommended pack = the hero** (S, wow 3/5, COMPOSITION + guardian-learns) — pack rows recut with the minute count as a large bare Jost numeral; exactly ONE pack (picked by time-of-day + gauge history) wears the pink outline. Three equal purple slabs become one confident recommendation.
- **Composer rises from its button** (S, wow 2/5, MICRO-GRAMMAR ②) — «Build your own» opens the composer sliding up from the button with the spring instead of a cold overlay swap.

### Stack run interstitial + session complete
*«Step 2 of 5» text screen with a Begin/Next between tools; complete = purple check + a line. The session's shape is invisible; every step break re-opens your eyes.*

- **THE SESSION BATTERY STRIP (signature)** (M, wow 5/5, BATTERY / one-world-at-five-scales) — a horizontal strip of the session's tools as chips: done = shining striped in their own colors, current = breathing outline, future = matte. The interstitial becomes the session at a glance; the Begin door takes the next tool's color. The timeline's exact physics at a fifth zoom — a session is a tiny day.
- **Auto-flow between steps** (M, wow 4/5, EYES-CLOSED + interruptible) — after each tool the strip slides the next chip under a now-marker and auto-begins after a 3s breath (tap pauses the handoff). Eyes stay closed across the whole stack; the interstitial only renders if you interrupt. iOS-safe: audio context already unlocked from the launch tap.
- **Complete = the strip FUSES** (M, wow 5/5, one-physics + INVERSION done=brightest) — on the last tool, the chips fuse into one long striped bar — the timeline's own fuse animation — with total minutes and one spark flight; a full ritual pays tier-2. «Session complete» becomes a thing you watch happen to your session.

### Tension gauge 0-10 (pre/post, gauge010)
*A native iOS range slider with accent-color and a 44px readout; the delta result is delivered via TOAST (the spec retires reward-carrying toasts).*

- **Chunky notch gauge** (M, wow 4/5, CALM large+friendly + CLASSY) — replace the native slider with ten fat 24px ink-bordered notches — tap or drag; filled notches run a jewel ramp (indigo at 0 → pink at 10), the number 64px Jost, one haptic tick per notch. Un-failable.
- **THE DELTA MOMENT** (M, wow 5/5, MIRROR-not-price + toasts-retired) — after the post-gauge, pre and post render as two orbs: the pre orb deflates to the post size while the difference leaves as N sparks flying to the ledger — «3 points lighter». Zero/negative delta gets «showed up anyway — counts double» with no visual sag. The efficacy ledger (S.tools.gauge) finally has a face.
- **Efficacy whisper** (S, wow 4/5, §7 anti-survey law) — one matte hairline under the gauge from history: «this stack usually drops you ~2 points». The guardian periodically PROVING it learned.

### Sound panel (in-player volume + bed picker)
*Native range sliders, 1.5px borders, purple selected fills, centered modal unanchored from the cog that opens it.*

- **Kit recut + v3 beds** (S, wow 2/5, v3 + CLASSY) — ink borders, hard shadow; Peaceful/Mysterious/Off as three v3 rows in their own colors (warm amber / indigo / grey) with ignition on pick; sliders get chunky ink-edged knobs with element-color fills.
- **Hear the setting as you set it** (M, wow 4/5, luxury-via-fine-detail) — dragging Voice speaks one soft word («here») at the new level on release; dragging Background swells the bed for a beat. Settings you can feel, not guess — via the existing buses.
- **Rise from the cog** (S, wow 2/5, MICRO-GRAMMAR ②) — the panel springs from the cog's position instead of materializing centered — a tray you pulled out, not a modal that interrupted.

### AM bookend (4 beats in the cockpit stage)
*Solid flow (seed harvest, virtue pick, goal, flow-down). But the virtue chips are EMOJI (VCLASS glyphs at app.js:4449) — a live hard violation — and the finish is a generic exitStage with no morning ignition.*

- **Virtue chips → v3 in eight jewel colors (emoji purge)** (S, wow 4/5, Tabler-only hard rule + v3) — each virtue becomes a chip in its OWN color with a bare Tabler icon (ti-bolt zest, ti-swords discipline, ti-heart love, ti-flag-bolt courage, ti-book-2 wisdom, ti-telescope curiosity, ti-heart-handshake gratitude, ti-sunrise hope): rest = tint + outline, picked = own-color stripes + ink + check, the VCLASS name («The Brave») as the sub only when picked. Also retires amVirtueGlyph's emoji echo on timeline bubbles.
- **The seed ignites on Lock it** (M, wow 5/5, BATTERY + time-symmetry) — last night's harvest («you'd wake as The Brave — your one thing: ship the build») renders as a matte night card; pressing Lock it IGNITES it into the virtue's stripes and auto-advances. Honoring past-you's choice literally converts potential to lived — the now-line law applied to a promise.
- **Morning ignition finale** (M, wow 5/5, H9 + one-world) — on commit, the one-thing flies from the stage onto the timeline as its starred block lights up (points-fly reversed), and the H9 day-arc ring appears at 0% in the header — the day is visibly armed. The AM bookend stops ending in a silent exitStage.
- **One breath per beat** (S, wow 3/5, CALM one-moment) — split beat 1: «Who do you want to be?» with the virtue grid alone at 21px, then the why as its own breath after a pick auto-advances.

### PM bookend beats 1-4 (mirror / re-story / ask / plan)
*The flow logic is excellent (restory choices, safe tomorrow-writes, Win-or-Learn gate) but the mirror is a text sentence, re-story rows act with zero physics, and the mood row is pre-kit buttons.*

- **THE MIRROR MADE OF THE DAY ITSELF** (M, wow 5/5, one-world — the mirror speaks the timeline's vocabulary) — beat 1 renders a miniature vertical strip of today's REAL blocks in the week-column language (striped = lived/matched, matte = slipped, mauve = drift) beside the warm line. You see the day you actually lived — recognition, not a sentence about it. Pure read from blockStatus/logs, ~40 lines of render.
- **Re-story physics: three different goodbyes** (M, wow 5/5, MICRO-GRAMMAR + no-shame always-re-storied) — «Let go» = the row exhales upward and dissolves (600ms spring); «Carry to tomorrow» = it slides right and lands as a matte chip in a tomorrow-tray at the beat's foot; «Right call» = a brief own-color ignition settling matte-lived. The three choices FEEL like what they mean.
- **Mood row → five jewel mini-rows** (S, wow 3/5, v3 + JEWEL) — the five moods as v3 mini-chips in their own hues — fog slate-blue, heavy indigo, okay teal, clear amber, radiant pink; picked = ignition.
- **Win-or-Learn as a worksheet page** (S, wow 3/5, §7 worksheet + CLASSY) — the Chapter-4+ ask renders as a filled-form page: letterspaced gold WIN and pink LEARN labels over kit inputs on one hairline-inset card. It writes to the journal looking exactly like it will read there.

### PM day-close beat + evening chest (H9/H4)
*The day-rating trio (Masterpiece/Solid/Rebound, selected = full solid) + a warm rest line. No crown moment, no chest, no day-arc pull; H9 and H4 specced, unbuilt. The group's biggest missing signature.*

- **BUILD H9: the day-arc ring** (L, wow 5/5, H9 — the ethical inversion of the casino session-shape) — a hairline ring around the header's Today pill fills as planned blocks get lived (matchedSpan feeds it, on the existing 1s tick); after ~19:00 the ring's endpoint grows a tiny chest glyph; tapping it opens the PM bookend. The session-shape pulls toward CLOSING WELL — ambient, never a nag.
- **THE EVENING CHEST OPEN** (L, wow 5/5, gold=EARNED + INVERSION + mirror) — «Rest now» → the chest moment in the stage: an ink-drawn chest opens with the day's ONE gold burst, releasing the ledger — spark total, fire tick, near-miss reframes («87% — 4 мин не хватило»), and tomorrow's one-thing as a matte seed card that will ignite at sunrise. 3s, skippable, then the warm rest line. Day-close becomes the day's flagship reward.
- **Masterpiece mints the crown live** (M, wow 4/5, crown economy T4 + honest mirror) — picking Masterpiece when the data agrees drops a crown onto the week strip in real time — calendar permanence being written. When data disagrees, the self-rating still stands and saves; the crown stays calendar-law.
- **Rating cards → v3 ignition** (S, wow 3/5, v3 + gold-scarcity) — selected = own-color 9px stripes + ink border + check instead of full solid. Masterpiece's row runs warm amber, NOT gold — gold appears only on the minted crown.

### Journal type picker (jrRenderPicker)
*Dense rows, text-glyph star favorites, «suggested now» pill. Readable but pre-kit and glyph-dirty.*

- **Toolbox-card rows + pin favorites** (S, wow 3/5, approved toolbox grammar + Tabler-only) — each type = the toolbox-card pattern: night card, bare colored icon (each JTYPE gets a hue), 15.5px label, muted blurb; the suggested type floats first as the single pink-outlined hero with a «сейчас» tag; favorite = a bare pink ti-pin.
- **Johnson cite as the grimoire whisper** (S, wow 2/5, CLASSY) — the source line («Johnson big idea #4») moves into each row's footer as an 11px letterspaced muted label.
- **Per-phase favorites** (M, wow 3/5, guardian-learns + appetite) — extend S.journalFav to phase-keyed («your morning way») after 3 same-phase picks; the picker greets with it pre-heroed.

### Journal writing beats (JT_RENDERERS)
*Good multi-beat flows, but save buttons carry live EMOJI and the Big-3 roles use emoji glyphs — hard violations shipping today.*

- **Emoji purge + kit doors** (S, wow 2/5, Tabler-only + DOORS) — all save/next buttons become 54px doors with bare Tabler (ti-sunrise, ti-target-arrow, ti-heart-handshake, ti-moon-stars); Big-3 role headers get ti-bolt/ti-heart/ti-world. One mechanical pass, zero logic.
- **Gratitude that banks visibly** (M, wow 4/5, BATTERY + savoring made physical) — each banked gratitude line becomes a small matte card igniting pink for 800ms as it lands, then settling lived; five settled cards stack above the input. Only the newest ignites — the fill budget stays one.
- **The worksheet page frame** (M, wow 5/5, §7 worksheet engine — the genius loop) — every beat renders inside a «page»: k-card + hairline inset + the question as a letterspaced pink label; on save the page sinks 2px and visibly stacks away toward the feed. Months of these = the user WATCHES themselves writing the course workbook — the retention moat as a felt motion.
- **The declaration speaks** (S, wow 3/5, identity-evidence + no-new-widget) — tapping the virtue declaration («I am willing to act in the presence of fear») whispers it once through the existing TTS bus. Identity heard in the guardian's voice lands deeper than read. ~5 lines.

### Journal feed + day sheet + empty state (journalSheet)
*An emoji-titled sheet of plain rows in the legacy #sheet modal (the surface targeted for retirement), a good on-this-day strip, a one-line empty state.*

- **Feed rows → filled worksheet pages** (M, wow 5/5, §7 — the ЖУРНАЛ as the payoff surface) — each entry renders as a page: type as its colored letterspaced label, question muted, answer white, mood as a bare corner icon; multi-beat entries show their labeled lines like a completed form. The log stops reading as chat history and becomes the workbook about yourself.
- **Journal moves into the cockpit stage** (L, wow 4/5, cockpit-socket keystone + §2 NOW debt) — retire this #sheet render: journal opens in the cockpit stage like every guided flow. The exact structural-debt migration the spec names, started where it hurts least — a read-only surface.
- **On-this-day memory cards** (S, wow 3/5, gold=earned + MICRO-GRAMMAR) — resurfaced entries become matte night cards; a CROWNED day wears a gold hairline-inset corner tag; tap opens the day sheet rising from the card.
- **Empty state opens a door** (S, wow 3/5, CALM + always-a-way-in) — one large muted-pink ti-feather, «your first line starts the thread», and a single 54px «Write tonight's line» door dropping straight into the PM ask beat.

### Reflection card (reflectCard, v817)
*The group's best surface: choice-row v3 rows, the notice line, visible skip. Built to canon; what's left is closing its loops.*

- **Own-words must ignite (law fix)** (S, wow 3/5, §12 JEWEL selection=ignition) — the «in my own words» row stays dashed through typing and commit — but dashed + selection never coexist. On focus it drops the dash for a solid outline; on Enter it ignites the full pink-stripe treatment. A locked-law violation on the flagship worksheet component.
- **The answer becomes a page** (M, wow 4/5, §7 every-answer-does-three-things visibly) — on commit, the card flips (the binder's mint-flip grammar) to a 900ms back-face: your answer as one filled worksheet line + «записано в журнал», then dissolves. Every card visibly deposits into the workbook.
- **The noticing made personal** (S, wow 3/5, proves-it-learned + MICRO-GRAMMAR ②) — when «noticed — that answer keeps coming back» fires, the notice line rises from the PICKED row with the spring, its ti-sparkles tinted the row's own color, plus one soft haptic. Proof-of-learning growing out of YOUR answer, not a system banner.

---

## CHROME

### You-tab / Settings sheet (one gear, four rooms)
*settingsSheet (app.js:2800) has the four §8 rooms but renders in the legacy #sheet drawer with one-off inline-styled rows; the promised trainer card on top does not exist anywhere in the code.*

- **Mint the trainer card and seat it on the throne** (L, wow 5/5, §8 keystone + INVERSION + CLASSY) — a 148px matte k-card at the top of settings: identity word 21px, bare pink ti icon, join-date + total-tracked-hours as letterspaced gold sub (earned facts = gold legal), matte berry finish with the .mint-sheen sweep ONCE on open. Tap → it flips (the mintCard 3D treatment) to evolution progress: next identity rank as a matte aspiration line. Identity becomes a thing you own; the binder gets its reason from the settings door.
- **Port every row to the KIT k-row** (S, wow 3/5, component-language law) — replace the inline row() factory with .k-row: bare colored icon 22px, white 15.5px title, muted 12px sub, ink-family border, spring sink. Zero behavior change, one class swap.
- **Away mode becomes a held-state moment** (S, wow 4/5, SOUL way-out return=flagship + BATTERY) — the «I'm away / resting» row, toggled on, IGNITES into restore-teal 9px stripes with ink text «Held — your streaks are safe» + ti-moon; the settings header carries a quiet teal hairline inset while away. Coming back fires the flagship return hook. Away is a soul-law flagship and currently the quietest row on the screen.
- **Advanced room folds behind a ghost** (S, wow 2/5, §8 persona filtering + COMPOSITION) — the devOn() rows collapse behind a single ghost «Продвинутое» k-row expanding in place with the stagger. The fold IS Mom's filter.

### Guidance dial sheet
*Three plain .pchip pills in the legacy #sheet; the graduation reward on choosing less is wired but visually it's the oldest chip idiom left in the app.*

- **Three modes as choice-row v3 with meaning-finishes** (S, wow 4/5, v3 + finish-encodes-meaning) — Guided / Light / Off as stacked k-rows in their own colors (Guided start-blue ti-compass, Light restore-teal ti-bulb, Off pearl-white ti-feather); the current mode sits IGNITED in its own-color stripes + check. More color-energy = more leading; the description renders as the ignited row's sub.
- **Graduation gets its five seconds** (S, wow 4/5, INVERSION + graduation-as-endgame + MICRO-GRAMMAR) — stepping down Guided→Light or Light→Off plays tier-2 rewardFx from the row itself + one line: «You took the wheel — that IS the graduation.» No overlay, no card. The never-hands-over dad-principle made visible at the exact moment it happens.

### Language picker (globe → flags, settings row)
*Already kit-conformant (.rc-row + lit + check), follows the flags-only-on-press verdict. Solid, just small.*

- **The switch speaks — RU voice proof-of-trust** (S, wow 5/5, Mama pipeline — silent audio breaks trust) — picking Русский immediately plays one warm cached RU voice line («Я здесь. Всё по-русски.») via the existing Web Audio TTS bank — inside the tap gesture so iOS allows it. For Mom, a silent language switch is a promise; a spoken one is proof. Toast fallback if the buffer isn't warm. Tiny code, enormous trust.
- **Ignition on the picked flag** (S, wow 3/5, v3 + MICRO-GRAMMAR ①) — the pick animates: the row ignites into pink stripes with the spring, check pops in, the card closes itself after 500ms. The picker stops being the one static chooser.

### Sound panel (settings)
*openVolumePanel (app.js:7052) is an inline-styled centered modal on the OLD palette — #1c0f20, purple accent-color on native ranges, #6a4a6a borders. No earcon control exists at all: reward plucks cannot be silenced.*

- **Rebuild on the KIT with chunky ink sliders** (M, wow 4/5, PALETTE + JEWEL + CLASSY) — k-card #22091a, 21px «Звук», custom sliders: 44px-tall #48122f track with ink border, pink fill (the one hero), a chunky thumb with hard shadow. Kills the last purple-dominant chrome surface in one pass.
- **Bed picker becomes choice-row v3** (S, wow 4/5, v3 + JEWEL indigo=deep) — Peaceful / Mysterious / Off as three k-rows (restore-teal ti-wind / cosmos-indigo ti-moon-stars / ghost ti-volume-off) with ignition on pick. The finish teaches what the bed sounds like before you hear it.
- **Reward-sound row with playable tier pips** (S, wow 5/5, always-a-way-out + CLASSY + economy audibility) — new НАГРАДЫ section: a toggle row («Звуки наград») gating sfx() globally, plus five 10px hairline pips beneath — tap pip n and sfx(n) plays that tier's pluck. Audition the entire reward pentatonic scale, silence it if you want. Closes the no-off-switch gap on earcons.
- **Slider release speaks the new volume** (S, wow 3/5, eyes-closed guarded + MICRO-GRAMMAR ①) — on voice-slider release, play one short cached «вот так» at the new level — ONLY when no session overlay is open. The slider becomes self-verifying.
- **Panel rises from its cog** (S, wow 3/5, MICRO-GRAMMAR ②) — openVolumePanel is summoned from three cogs and always fades in centered. Transform-origin at the invoking button's rect + spring scale-in. The grammar's most-visited violation.

### Data & backup room (snapshot / export / restore)
*Mechanically strong (versioned envelope, Web Share, atomic restore with rollback) but the UI is a raw textarea + two emoji-labeled buttons, and there is zero visibility of WHEN you last backed up.*

- **The vault card — last-save-point made visible** (M, wow 5/5, BATTERY + no-shame + CLASSY) — top of the Data room: a k-card with ti-shield-check, «Последний снимок» + relative age («12 дней назад»), and a fine 4-pip freshness meter (each pip = a week, pearl→matte as age grows — never red). Store lastSnapshotAt when shareSnapshot resolves. One glance answers the only question that matters about backups.
- **Merge and Replace get door hierarchy** (M, wow 4/5, DOORS + CALM) — Merge = solid 52px green GO (additive, safe); Replace = ghost with «заменит всё» that, on first tap, IGNITES into warning-state stripes re-labeled «Точно заменить?» requiring a second tap — the ignition IS the confirm, no window.confirm() breaking the night world. The textarea folds behind a ghost «вставить из буфера»; the file picker becomes a k-row with ti-file-import.
- **Day-3/7 nudge moves off the toast channel** (S, wow 3/5, CALM + toasts demoted) — the telemetry ask (app.js:732) becomes a quiet pearl dot on the settings gear + the vault card's pips doing the talking. Toasts stop carrying asks the same way they stopped carrying rewards.

### Bento activity picker
*bentoPicker (app.js:6314) is strong: SOFT muted tiles with ignite-on-select, pinned row, priority row, search below categories (David 2026-07-01). Missing the three §2 BENTO asks: peek-cut rows, search icon top, adaptive first row.*

- **Peek-cut rows — the third chip half-visible** (S, wow 3/5, §2 BENTO + CALM affordance-without-chrome) — padding-right calc so the last fully-visible chip never lands flush + a 28px mask-image fade at the row's right edge that disappears once scrolled. The half-cut chip IS the scroll hint. Pure CSS.
- **The pick ignites before the menu dies** (M, wow 5/5, soft-tile/ignition law + MICRO-GRAMMAR ①②) — in single-pick mode commit(a) closes instantly — the choice never acknowledges. Instead: the tapped chip ignites (own-color 9px stripes + ink text + check) for 220ms while the rest fades to 40%, THEN the overlay collapses toward its cause and onPick fires. The battery metaphor at the exact moment of commitment; every downstream flow inherits it for free.
- **Search collapses to a bare icon in the head** (S, wow 3/5, §2 + COMPOSITION) — a bare ti-search in bento-head (44pt); tap → the existing search input drops in pinned under the head with focus, categories dim. Keeps David's below-categories placement for browsing while giving search a visible top door.
- **Domain drill-down breathes with the cascade** (S, wow 3/5, MICRO-GRAMMAR ②③ + motion phase 2) — renderExpanded() swaps cold. Apply the v648 staggered cascade (18ms) to sub-group tiles + breadcrumb, the pane scaling from the tapped category's origin. The deepest-traffic menu joins the motion system.

### Duration sheet (chrome-wide «how long?»)
*durationSheet (app.js:2284) predates the KIT: .dur-chip pills in a centered .dur-card, no memory of your usual duration, «cancel» as bare text. k-dur (index.html:1053) exists unused.*

- **Chips become battery bars** (M, wow 4/5, BATTERY + finish-encodes-meaning + KIT) — six k-dur chips in a 3×2 grid, each carrying a fine matte inner bar whose width encodes the duration (15m = short stub, 2h = nearly full) — the timeline's length-vocabulary inside the picker. Picked ignites pink; title 21px with the activity name.
- **It remembers your usual** (S, wow 4/5, app-learns-you + CLASSY hairline) — store lastDur per activity title; pre-render that chip with a hairline pearl inset + a tiny «обычно» sub. No auto-select — the choice stays yours.
- **Rises from the tapped slot** (S, wow 3/5, MICRO-GRAMMAR ② + DOORS) — always summoned by a concrete cause (empty slot, bento pick, plan door) — pass the source rect, scale the card in from it; cancel becomes a ghost 44pt row.

### Legacy #sheet shell (~20 flows)
*The scard shell wears night colors (H2) but keeps 30px radius, a purple-tinted dim, no drag handle, and every flow wipes sheetBody.innerHTML. The acknowledged structural debt.*

- **One skin pass: the sheet joins the KIT** (S, wow 4/5, PALETTE + KIT + CALM) — scard → #22091a, 3px ink border, radius 22, hard top shadow instead of the 40px blur; backdrop dim → ink rgba(10,2,8,.6) (kills the purple cast over the whole app every time any sheet opens); .sttl to 21px. One CSS block, twenty flows land closer to the frames.
- **Grab handle + drag-to-dismiss** (M, wow 4/5, MICRO-GRAMMAR ④ + one-guy→company) — a 40×4px ink pill at the sheet top; vertical drag past 90px with velocity dismisses on the spring (drag back up cancels). One pointer handler serves all twenty flows.
- **The migration ledger — three flows into the cockpit stage** (L, wow 5/5, §2 NOW structural debt + cockpit-home keystone + landmine) — commit the order and do the first three: Settings → Journal → Brain render in the cockpit stage (the enterStage pattern the toolbox already uses); #sheet keeps only the block/log editor, which genuinely wants to be a drawer over the timeline. Each migration deletes an innerHTML-wipe surface — a measurable dent instead of a someday.
- **Sheets rise from their cause** (S, wow 3/5, MICRO-GRAMMAR ②) — openSheet() gains an optional source element: the scard's transform-origin is set to the trigger's x-position. Law ② applied to the highest-frequency shell in the app.

### Day-tools ⋯ menu (chrome pass)
*dayToolsMenu — a 9-item vertical text dropdown where Clear day sits two pixels from Journal; the spec calls for an icon grid.*

- **The 3×3 icon grid** (M, wow 4/5, §2 MENUS + §12 no-containers + DOORS) — nine items = a perfect 3×3: bare colored icons 26px, 10px white labels, on a k-card springing from the ⋯ button. Journey/Plan/Toolbox blue-family top row, Stacks/Enhance/Journal middle, Undo/Clear/Settings bottom with Clear the only ghost-dashed cell. Half the height, thumb-reachable, one fixation.
- **Clear day earns a two-beat confirm** (S, wow 3/5, MICRO-GRAMMAR + way-out) — first tap: the cell ignites into warning stripes re-labeled «точно?»; second tap within 2s executes. The same no-dialog ignition-confirm as Replace — ONE destructive-action language across the app.
- **The grid opens with the stagger** (S, wow 3/5, motion system + MICRO-GRAMMAR ②③) — nine cells cascade in (12ms apart, spring scale from .85) radiating from the ⋯ corner.

### Toast system
*toast() renders textContent into a PURPLE card (#2a2147, #6a4aa0 border — pre-redesign), and because it's text-only, ~40 of 87 call sites smuggle emoji into the UI — a standing violation on every delete, plan, and backup action.*

- **The emoji-shim: one function fixes 87 call sites** (S, wow 4/5, no-emoji hard rule) — inside toast(), strip any leading emoji/symbol and map it to a bare Tabler slot (trash→ti-trash, clipboard→ti-clipboard, calendar→ti-calendar-plus, warning→ti-alert-triangle, spark→ti-sparkles, download→ti-download, copy→ti-copy, recycle→ti-rotate, file→ti-file); unknown emoji stripped. Zero call sites touched; the entire violation class dies in ~15 lines and stays safe by construction.
- **Reskin: the whisper bar** (S, wow 3/5, PALETTE + KIT + JEWEL) — toast surface → #22091a, 2.5px ink border, hard 0-3px-0, icon in muted pink, 13px Jost, rising 12px on the spring. The quietest correct object instead of the loudest wrong-palette one.
- **Rewards leave the toast channel for good** (M, wow 3/5, §2 MENUS + CALM) — audit the 87 call sites: any toast that celebrates either downgrades to pure confirmation or is deleted where rewardFx already fires at the same moment. Toasts = state confirmations only; the tier system owns all joy. A deletion list, not a feature.
- **Tap-to-act toasts for undo moments** (S, wow 4/5, always-a-way-out + 44pt) — toast(msg, {action:'Undo', fn}) renders a pink text-button at the row end (44pt); used by exactly three sites (deleted, cleared, moved-to-real). Kills the «Undo in ⋯» treasure hunt.

### Bottom navigation — THE NAV QUESTION (position taken)
*THREE separate 3-tab bars exist (#nav, #jpNav, #gameNav), visually unified v641 but still a full-width always-on bar David called clutter, plus a whole Apple-Music collapse machine.*

- **POSITION: the compass strip — 3 dots that bloom (option ②, committed)** (L, wow 5/5, NAV QUESTION §12 + CALM + Mom-safe discoverability) — one floating strip replaces all three bars: bottom-center, ~120×34px, #1c0612, ink border, full radius, hard shadow. Inactive panes = 7px muted dots; the active pane = its bare Tabler icon in pearl-white (NOT pink — persistent chrome must not spend the hero accent). Tap the strip → it blooms into the full labeled 3-tab bar rising from its own center, auto-folds 2.5s after a pick; horizontal swipe still switches. Auto-hide fails Mom (gesture-only, no anchor); a floating pill is a fourth chrome object. Dots+bloom keeps a permanent tiny honest anchor AND full labels one tap away. Ship behind the flows-run dev toggle next to the current bar — on-device verdict per the process law.
- **Delete the Apple-Music collapse machinery** (M, wow 3/5, landmine leave-it-cleaner + regression hygiene) — the nav-collapsed CSS block (~15 rules with !important wars, index.html:1523-1533) and its scroll listeners exist only because the full bar was too heavy; the compass strip never needs to collapse. Also un-couples #liveDock's fixed-position overrides. Negative-code polish.
- **simpleMode = no nav at all** (S, wow 4/5, Mom pipeline + CALM) — when simpleMode clamps panes to journey-only, the strip renders nothing. Mom's world has no navigation because there is nowhere else to go — falls out of the strip design for free.
- **First-week training wheels** (S, wow 4/5, never-hands-over applied to chrome + day-one contract) — for the first 7 logical days (or 10 pane-switches), the strip renders pre-bloomed with labels, then starts folding. Nobody meets three bare dots cold; the app graduates you into minimal chrome the way guidance graduates you into autonomy.

### Haptic + earcon grammar (invisible chrome)
*HONEST READ: every hapt()/navigator.vibrate call is a silent no-op on David's iPhone — iOS Safari/standalone PWAs do not implement navigator.vibrate. The «4 haptic patterns» exist only on paper. sfx() is a genuinely good pentatonic tier system with no off-switch and no press-tier.*

- **Real iOS haptics via the switch-control trick** (M, wow 5/5, MICRO-GRAMMAR ① + verification honesty) — Safari 17.4+ fires a genuine Taptic tick when an `<input type="checkbox" switch>` toggles inside a user gesture. Ship a hidden off-screen switch and a haptTick() that toggles it synchronously within pointer handlers; route hapt(1)/hapt(2) through it (long-press-arm, drag-pick, block-drop, ignition), keep vibrate for Android. Feature-detect via 'switch' in input. Ships DEVICE-UNTESTED — but if it lands, the entire micro-interaction grammar gains a physical dimension the app has never had on its only real device.
- **The haptic map gets an owner** (S, wow 2/5, one-grammar-family + landmine) — consolidate the ~20 scattered inline vibrate calls into hapt(tier) with the documented 4-pattern grammar (tick=arm, double=commit, bump=now-line, triple=tier-3+). Three sites currently invent their own ms-arrays.
- **One earcon nobody built: the ignition tick** (S, wow 4/5, v3 + reward hierarchy + eyes-closed) — choice-row v3 ignition is the app's signature moment and it's mute. One soft 30ms C5 pluck at 0.06 gain (quieter than tier-1) inside the pick gesture, same pentatonic family. Selection audible, rewards still louder, sessions untouched.

---

## THE TOP 20 — build these first

Ranked by wow (desc), then effort (asc). Every one is wow 5/5; the five S-efforts lead.

1. **Invert the stones: matte potential, ignited lived** — Habits · journey habit stones (S) — the battery re-grade on the smallest daily unit; done keeps its size and steals the light.
2. **Matte the future — the frame's core regrade** — Journey · trail stones (S) — the single highest-leverage strike on the trail; literally what David approved in the frame.
3. **The payoff plays its own reward** — Onboarding · beat 5 first task (S) — the first win FEELS like the wins the app sells; highest leverage/effort in the whole flow.
4. **The switch speaks — RU voice proof-of-trust** — Chrome · language picker (S) — one spoken RU line at the switch; Mom's trust hook, tiny code.
5. **Reward-sound row with playable tier pips** — Chrome · sound panel (S) — audition the reward scale, silence it at will; closes the earcon off-switch gap.
6. **The converter seam** — Timeline · now-line (M) — matte time visibly converting to shining time at the line of contact; the battery metaphor's missing signature.
7. **The lived-hours thermograph sky** — Timeline · day canvas (M) — past hours hold retained-heat rose proportional to lived coverage; the GitHub-graph effect inside the day.
8. **Cause-anchored zoom everywhere** — Calendar · zoom transition (M) — zoomAnim learns its origin; every zoom in the app obeys «rises from its cause» in one function change.
9. **Yesterday's echo docks as the suggestion sheet** — Cockpit idle · empty day (M) — the empty day proves the app remembers; one-tap repeat of your own life.
10. **The ignition is the receipt** — Cockpit live · keep-going fusion (M) — the ghost ring ignites blue→green on commit; track→plan fusion performed by the cockpit itself, toast dead.
11. **The Return — flagship mint fired FROM the stone** — Journey · gap-return stone (M) — the user's weakest moment becomes the app's loudest celebration; the whole soul thesis in one animation.
12. **The summit opening — the journey's fireworks** — Journey · summit gift (M) — the allDone transition finally gets its ceremony; the most missing payoff on the surface.
13. **Active-step pip strip + next-session fact** — Goals · quest card body (M) — «2/4 · следующая = завтра 15:00»; the visible goal→timeline thread.
14. **The day fans out — cascade landing** — Plan-day · finish moment (M) — the specced finish: new blocks cascade onto the timeline landing matte, the now-line pulses once.
15. **Duration memory — the default chip knows you** — Plan-day · duration sheet (M) — the pre-lit chip is the median of your own history; the app-learns-you promise in the most-touched sheet.
16. **The planting ceremony — camera glide + seed drop** — Game · garden (M) — the FOREVER zoom's core ritual becomes the reason to open the world; pure choreography on existing pieces.
17. **THE MIRROR MADE OF THE DAY ITSELF** — Players · PM bookend beat 1 (M) — the evening mirror is a miniature strip of your real blocks; recognition, not a sentence about it.
18. **THE SESSION BATTERY STRIP** — Players · stack interstitial (M) — a session is a tiny day: done tools striped, current breathing, future matte — the timeline's physics at a fifth zoom.
19. **The pick ignites before the menu dies** — Chrome · bento picker (M) — 220ms of ignition before commit; every downstream flow inherits the acknowledgment for free.
20. **Real iOS haptics via the switch-control trick** — Chrome · haptic grammar (M) — the first genuine Taptic feedback the app has ever had on its only real device; DEVICE-UNTESTED until David's thumb says so.

### Suggested runs

**RUN 1 — THE BATTERY RE-GRADE** (one physics, every zoom): #1 habit stones, #2 trail stones, #6 converter seam, #7 thermograph sky, #14 cascade landing, #18 session battery strip. Pure render + choreography work; ships the matte/shining/converter thesis visibly at habit, journey, now-line, sky, plan and session scales in one pass.

**RUN 2 — THE PAYOFF RUN** (reward inversion moments): #3 onboarding payoff, #10 fusion receipt, #11 the Return mint, #12 summit opening, #16 planting ceremony. Every unminted celebration in the loop, built almost entirely from rewardFx/flyPoints/mintCard machinery that already exists.

**RUN 3 — THE GUARDIAN LEARNS** (mirror + memory): #9 yesterday's echo, #13 next-session fact, #15 duration memory, #17 the PM mirror. All reads of data already in S — the app starts proving it knows you, four surfaces at once.

**RUN 4 — ONE GESTURE GRAMMAR** (press, zoom, sound, touch): #4 RU voice switch, #5 reward-sound pips, #8 cause-anchored zoom, #19 bento ignition, #20 iOS haptics. The «expensive» §9 grammar landing app-wide; #8 and #19 are the two highest leverage-per-line moves in the doc; #20 ships DEVICE-UNTESTED behind a feature-detect.

---

## Appendix — killed by the law-keepers (27)

- **Start screen (new user) · The glint is EARNED** — re-litigates the settled §12 intro verdict and strips §9's approved «one perfect motion» from the most important first open.
- **Start screen (returning) · Version pip becomes a classy dual pip** — redundant with the kept tag-line mirror; the same day count twice fights CALM, and a debug pip is the wrong home for mirror content.
- **Load save · Restored life gets a gold greeting** — gold is EARNED-only; a file restore is a utility op that can recur on any migration.
- **Onboarding beat 6 · The seed remembers your vibe** — cites the half-B element-warmth ruling as approved while §11/§12 mark it awaiting David's A/B/half-B verdict.
- **Cockpit idle empty · The matte ring admits the day is unwritten** — the empty state of the rejected radial-clock dial («too old, not that one» — do-not-repropose).
- **Hero disc · THE DAY-BATTERY RING** — re-proposes the explicitly killed radial-clock dial; wow-5 doesn't override a David kill.
- **Hero disc · The tick pays for a matched day** — correct gold law, but the mechanic lives on the dead radial-clock render.
- **Day canvas · Wake and bed become horizon events** — a 12px unearned amber disc is a dead ringer for the gold pip language; dilutes gold=EARNED with decoration.
- **Timeline header · Now pill gets the door finish** — a permanent solid-pink chrome pill puts a second pink hero next to the now-line, energy inverted.
- **Block editor · Context strip** — duplicates the edge inspector's entire reason to exist with a second draggable mini-timeline; L-effort sprawl on an unbuilt sanctioned surface.
- **Gestures · One haptic grammar router** — hapt(tier) already exists at app.js:5292; the right move is migrating the raw vibrate calls into it — cleanup, not a feature.
- **Zoom switcher · Drop the X from the week/month header** — stale premise: .pull-x is already hidden on the always-open home, and in gaming mode the X IS the way out — removing it breaks the law it cites.
- **Dead habit surfaces · habitProg's soul lives in the journey header** — one glyph, two meanings: the flame means streak-run at week/month; gating it on all-habits-done breaks one-reward-language.
- **Goals empty state · First-quest birth sheen** — a gold celebration for merely CREATING a quest spends gold on unearned intention; new quests stay matte.
- **Journey header · The briefcase leaves the room** — reverses an explicit dated David decision («tools always one tap away», 2026-07-01) and severs Мама's only toolbox door in simpleMode.
- **Live pill · Pill navigates to the stone** — replaces shipped invariant behavior (journey-live-pill is on the CANNOT-change list; tap→full-cockpit is D3, 2026-07-02) and fights the cockpit-home keystone.
- **jp-nav · Auto-hide on trail scroll** — front-runs the NAV QUESTION David settles on device; redundant with the kept dev-toggle that already cycles auto-hide.
- **Skate park · Trick cards** — re-couples the deliberately decoupled skate park to the reward economy; cards = real-life achievements, not game skill; also invents a 7th family outside the locked 4-rank design.
- **Skate park · Combo rides the fire chip** — fire decays only by absence, never punished; a bail-reset toy combo wearing the sacred 21-day blue flame dilutes the earned vocabulary.
- **Reflection card · Wire the post-tool placement** — already built (tickTool → reflectDue, ≤1/day, dormant-suppressed); refine the existing hook, don't wire a duplicate.
- **Settings · Full-screen room, not a drawer** — duplicates the migration-ledger Settings→stage move; a bespoke slide-in shell violates P13/cockpit-home (never a third surface system).
- **Guidance dial · Show the appetite dial next door** — §8 locks the appetite dial's one address to the Профиль room, and a manual slider bypasses the consent-based appetite engine.
- **Language picker · Honest EN-gap footnote** — developer-voice apology chrome breaks the guardian world (P12: witness, not changelog); the real fix is the B-sweep.
- **Data room · Snapshot success is a tier-1 moment** — backup is upkeep, not lived behavior; §3's earn map is closed, and paying spark for a chore is price-not-mirror.
- **Bento · ЧАСТО — the adaptive first row** — the row is §2-canon but six SOLID chips is the rejected all-solid chip wall; resubmit rendered soft-tile.
- **Bottom nav · The strip carries the fire, barely** — duplicates the dock's fire chip and stacks a second breather beside the live block's affordances; the strip's entire virtue is carrying nothing.
- **Haptics · Earcons obey the appetite for silence** — the gate already exists in code (S.audio.sfx===false) and the sound panel's reward row supplies the UI; a second flag forks the same control.
