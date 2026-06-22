# ALTER — The Epic Gameplan

*One living thing you co-pilot your life with. Written for a solo operator who picks by feel, hates extra machine, and ships beauty. Every claim here was checked against the code in `alter/app.js`.*

---

## 1. THE NORTH STAR

**ALTER is a guardian that turns your real life into a world you can see.** Not an app you USE — one you INHABIT. A pixel guardian who IS you, a mirror, standing in a world you build from your actual days: weather is your mood, fog is the haze your vices leave behind, the bare ground fills in as you stay consistent, and a garden rises toward a palace the longer you keep faith with yourself.

You earn **peace and clarity** by closing the gap between who you are and who you're being. And one law makes ALTER unlike anything Brian Johnson ever shipped: **the world only grows when YOU do — when a real deed is sent into your real life.** Not bought, not idled into, not tapped into. Earned by a deed.

Every state of the world is *a light ready to grow* (Withers). The world never darkens, never scolds, never shows you a low number. On a hard day it simply hasn't cleared yet. The win is not a high score. The win is a calm, radiant world that is true because you made it true.

> Put this at the top of `app.js` and `GAMEPLAN.md`. Audit every feature against it. If a feature doesn't make the world more true, it loses.

---

## 2. THE SYSTEM — one living thing, not seven features

The whole app is **one loop seen from seven angles**: *do a real thing → the mirror reflects it → the world visibly changes → you feel pulled back to keep it true.*

Today the code is fractured into parallel systems that don't talk: a Spark counter that buys invisible multipliers (`UPG`/`gMult`/`buyUpg`, lines 356-368), a planner and a tracker that don't share a verdict, an RPG with three dead-end economies, a brain fed five thin fields, and a world that **does not exist in code at all.** The diagnosis is real and verified. The fix is to connect what exists into one spine — and then build, honestly, the two pieces that are genuinely new.

How the pieces become one:

- **The guardian (the mirror)** is the surface everything routes into. Mood→weather already ships (`currentMood()`, line 304) and is the one piece of the vision alive in code. It becomes the single display for every inner signal: mood = weather, virtue levels = aura/posture, clean time = fog thinning toward clarity, consistency = the world growing.
- **The garden-world** is the guardian's *ground* — a genuinely new render layer, not a re-skin. It is the only place Spark is spent and the only scoreboard that matters. The planner produces the deeds, habits produce the consistency, practices produce the clarity, the RPG produces the becoming — and they all show up as **the world getting more you.**
- **The planner + tracker** are one act: a plan bubble is a *promise*, starting a timer on it is *keeping it*, and the green bloom means "I closed the gap today."
- **Habits** stop being a shame-streak and become the **consistency signal** that grows the garden. Misses are quiet gaps, never resets.
- **The RPG** fuses its three dead economies into one choice: a real action fills a perk bar → you spend Spark to claim the rank → the claim *visibly changes the guardian who is you.* Do → earn → choose → become.
- **The practices stack** (breathing, meditation, EFT, mantras) is ONE reusable player generalized from the Grateful Flow that already works.
- **The brain** is the guardian's voice. Today it's blind (5 fields) and mute (output dies in a label). Fed what the app already computes and given the Johnson/Withers spine, it speaks one move on the home card.

**The send-gate is the keystone.** The world's daily growth does not unlock until a real SHIP/SEND action is logged. Spark still accrues from any honest deed — but *planting and growth are gated on `hasShippedToday`.* This is the one mechanic Heroic structurally cannot copy, it's aimed at David's documented multi-year send-trait, and it forces every other system to be diegetic: "the world grows when you ship" is the literal opposite of "a number goes up when you tap."

---

## 3. THE DEFINITIVE IA — stop thrashing on menus

**Three swipeable spaces. One sticky sub-nav per space. The radial timeline IS the menu. Nothing else.**

```
┌─────────────────────────────────┐
│  [ You ]   [ Day ]   [ Grow ]   │ ← sticky top segmented control
│  ‹ swipe between the three ›     │   (Instagram/Snapchat feel)
├─────────────────────────────────┤
│                                 │
│         (space content)         │
│                                 │
├─────────────────────────────────┤
│   the one move · tappable strip │ ← ambient, persistent on every space
└─────────────────────────────────┘
```

**YOU** — the calm mirror. Default sub-pane **Mirror**: full guardian + weather + the garden-world + the one-move card + quick-wins. Second sub-pane **Character**: virtue constellation → skill-trees, the world's growth detail. The Spark shop is deleted; brain config moves to a single home.

**DAY** — the planner/tracker, the best work in the app. **Sticky header** (Day/Week/Month + date nav) over an **internally-scrolling timeline** — the Apple Calendar pattern David asked for, pure CSS (`position:sticky` wrapper + `overflow-y:auto` body). Sub-panes **Timeline / Habits / Stats**. Tap-empty-left = plan, tap-empty-right = track. There is no center button (delete the dead `.nb.center` CSS).

**GROW** — rituals + the practices stack, always reachable, never hour-gated. Morning recommit, Grateful Flow, the practice-stack builder as browsable cards.

**Interaction law:** single-press lift-and-drag, tap-without-move opens edit, ✕ or swipe to delete. Drag/stretch is iOS-smooth with live reflow (already built). One reused bottom-sheet drives every flow (already built).

This part is genuinely partition-not-build: the render targets exist; you're moving them into three calm surfaces and hiding depth one swipe or one segment away. **Do this shell first** (see roadmap) so the garden is born into the Mirror pane that survives, instead of being re-homed a phase later.

---

## 4. THE GARDEN GAME — the concrete design

**The core loop:** `Real deed → Spark earned → ship-gate opens → Spark plants/grows the world → your real inner-state shapes how the world looks → you come back to see what your deeds built → next deed.`

**Spark has exactly ONE sink: the world.** Delete the 7-item multiplier shop (`UPG`/`gMult`/`buyUpg`) — invisible multipliers that earn more Spark to buy nothing visible. It's the single biggest soul-violation and removing it is subtractive and free. Keep Spark as the *earn* signal; rebalance to one honest unit (≈1 Spark per useful minute) so a 90-minute deep-work block isn't worth seven mood taps.

**The Spark↔gate rule, stated once so it can't leak:** *Spark accrues from any honest deed. Planting and daily growth are gated on `hasShippedToday`.* Before the day's ship lands, you can earn and bank Spark, but the world holds steady; after it lands, the day's growth unlocks with a bloom and your banked Spark can plant. Earning is generous; growth is earned.

**The four state-layers — wire signals you ALREADY compute into a canvas layer you build once:**

| Inner state | Already in code | Becomes in-world | No-shame frame |
|---|---|---|---|
| **Mood** | `currentMood()` ✓ shipped | Weather: fog → golden radiance | the sky settles as you do |
| **Clutter** | `lastTidy`/`messy()` (line 161, only nags today) | The plot's clearness; tidy-logging clears it | a light ready to grow |
| **Vices** | `renderPulls()` 7-day (line 348) | How fast the fog *clears* — clean days speed it | clean time accelerates clarity |
| **Consistency** | streaks/`actCount` | The world grows: bare ground → garden → palace | misses are quiet gaps |

**The no-shame law on vices, made structural (this is non-negotiable):** the world only ever moves *toward* clarity, at varying speeds. Clean days clear the fog faster. A relapse does not darken the world or re-thicken anything — it simply **pauses the clearing.** There is no kryptonite-boss that grows back, no worsening plot, no visible penalty. A darkening world reads as punishment no matter what the copy says, and that is exactly the low-rating-made-visible Withers forbids. Build the renderer so "worse" is structurally impossible; only "not yet cleared."

**No idle bloom.** The world does not grow while you sleep — that would break the send-gate law (growth with no deed). What greets you on open is *the result of the deeds you already logged*, rendered the moment you arrive: "here's what yesterday's shipping grew." That's the honest version of the come-back pull, and it's the only version that survives the keystone.

**The build arc (Robinson Crusoe → palace):** a pixel ground-plane under the guardian (reuse `baseY`, `gdisc`/`gring`, lines 274-316). v0: Spark plants ONE sprite at a time on a bare plot. A growth stage unlocks at a consistency threshold (plot → garden), then garden → chateau over weeks. Hold the line at v0 first — the chateau is a later layer, not week-one scope.

**The send-gate, in-world:** one boolean `hasShippedToday` + a render branch — calm-but-ungrown until the real SEND lands, then bloom. The send/courage category already exists (`virtueOf`, `OCC_PERK 'The Closer'`). **On the "what counts as shipping" question:** for a solo operator, building his own tool often *is* the work — so don't hard-rule "ALTER doesn't count." The redirect, if it fires at all, fires **once per day, gently, never repeated**: a single soft prompt like "anything going to a *person* today?" — never a daily needle about his deepest avoidance. A mirror that nags you about your core wound becomes shame, not support.

**Peace & Clarity is the win-state, made literal:** not an abstract goal but the *weather of a place you built* — radiant, fog-cleared, grown. The only scoreboard.

---

## 5. THE ROADMAP — $0, sequenced for felt progress

Each phase says honestly whether it's subtractive or additive. Phases 0 and 2 genuinely shrink the codebase. Phases 1, 4, 5, 6 add real code — the garden renderer, the Practice Player, the fat brain, the bridge are net-new, and you'll feel that in week one. The "less machine" discipline shows up as *fewer surfaces and one reused player*, not fewer lines.

### Phase 0 — Safety & Truth (before you trust the mirror with more history)
**Ships:** schema version `S.v` + ordered migration chain in `load()`; a `save()` that catches `QuotaExceededError` and lets the guardian say "couldn't save"; **one-tap export/import JSON** ("Back up my life"); fix the **day-blind timer bug** (`stopTimer`, line 774 — stamp `dayK` at start, log to `logs(t.dayK)`). Today `save()` swallows every error (`catch(e){}`, line 155).
**Why first:** the mirror is only powerful if it's TRUE — and right now one Safari cache-clear or quota hit *silently erases weeks of real history.* Existential, cheap, pure insurance.

### Phase 1 — The Soul Re-aligned (three beats, not one heroic week)
The garden renderer is the single biggest new-rendering task in the app. Don't ship it blind alongside three other subsystems. Three beats David can react to by feel:
- **Beat 1 — Re-align (cheap, instant):** delete the Spark multiplier shop; add the `hasShippedToday` boolean + the grey/ungrown render branch. This alone converts the closed point-loop's *intent*.
- **Beat 2 — The plot (the real build):** the pixel ground-plane under the guardian, Spark plants one sprite at a time, gated on the ship. Ship this, live with it, react.
- **Beat 3 — Wire the signals:** clutter → plot clearness (clone the mood→weather pattern), vices → fog *clearing speed* (never worsening). Mood is already wired.

**The risk:** scope creep into the full Crusoe→chateau arc. Hold at v0 — one plot, one sprite, the four signals, no chateau.

### Phase 2 — The IA Shell & The Pinned-Anchor Planner
**Ships (subtractive):** the 3-space shell (You/Day/Grow) + sticky sub-nav + swipe; the **sticky Day header over internal-scroll timeline**.
**Ships (honestly net-new — David's #1 planner ask):** **pinned-anchor reflow.** This is *not* a one-line boolean. `reflow()` (line 639) sorts blocks by time and shoves every overlap later — it has no concept of an immovable block (`grep pin|fixed|anchor` → nothing). True pinned reflow is a real algorithm: treat pinned blocks (drive to grandma, Shabbat dinner, "shower 39min before leaving") as **fixed walls**, and flow the flexible habits into the gaps around and between them — they bump each other but never the pins. That is the heart of the "Google Calendar planner," and it deserves first-class scope.
> **Before touching `star`:** the gameplan earlier flagged `star` as a "dead flag" — it is NOT dead. `recommitSheet` writes `star:true` for the morning "one thing." Don't delete it; check whether it's the *seed* of the pinned concept and build pinned on top of it.

**The scheduler cleanup is narrower than first claimed.** `schedule()` (187), `preview()` (463), `reflow()` (639) are three *different* operations, not three copies: `reflow` mutates stored times to remove overlap; `preview` only sets CSS `top` during a drag; `schedule` is a read-only priority projection that `proactive()` depends on. **Do only this:** make `preview()` reuse `reflow()`'s ordering so what you drag is what you get — and **leave `schedule()` alone**; it's the proactive engine, not a duplicate. Test under David's thumb before touching Week view; the iOS-smooth drag is sacred.

### Phase 3 — Habits, Tracker Fusion & Stats
**Ships:** kill the shame-streak (the fire counter resets to zero on one miss — David's exact drift-trigger) → no-shame **never-miss-twice** (quiet X-of-last-7); fuse **plan↔actual** so the green bloom means "I kept the promise"; the **Grow heatmap** + one calm insight line; consistency feeds the world.
**Atomic Habits wisdom — what's in and what's deferred-by-choice (not silently dropped):** ship the **2-minute rule** as a *celebrated floor* and **never-miss-twice** now. **Habit-stacking** (anchor a new habit to an existing one — the planner's bubble-stacking already gives you the UI primitive) and **identity-based framing** ("you're becoming someone who…") are explicitly deferred to a later beat, not abandoned — both were asked for and both are named here so they return.
**Occupation-aware suggestions:** `OCC_PERK` (line 249) already keys by occupation. Wire it into habit *suggestions* (artist → make/sell/post/network) as a small Phase-3 add or an explicit Phase-3.5 defer — don't let it vanish.
**The risk:** numeric habit targets bloat the model — keep them optional, default binary.

### Phase 4 — The RPG Loop & The Practice Player
**Ships (net-additive, but harvesting working code):** fuse Spark + perks + sprite into **do→earn→choose→become** (spend Spark to claim a rank, the guardian visibly changes); branching 3-node perk spines; generalize **one Practice Player** from the working Grateful Flow (breathing → meditation → EFT → mantras as data, sectioned, with a length per section); the planner's bubble-stacking re-aimed at building a practice stack.
**Adaptive practice length — with a real signal, or cut honestly.** David asked for beginner (≤5min sections, more cues) vs experienced (~29min, minimal cues). There is no experience signal in `S` today. So: **derive experience from cumulative practice minutes logged** (a field the Practice Player itself creates) — under a threshold = beginner mode, over = experienced. If that threshold work slips scope, ship **fixed-length, self-set sections** first and say so; don't claim "adaptive from data in `S`" when the data isn't there yet.
**The risk:** four half-built practices. Ship breathing + meditation *great* first; EFT + mantras fall out nearly free once the player is data-driven.

### Phase 5 — The Brain Comes Alive (still $0)
**Ships:** **fat context** (feed the brain the 30-day texture it's blind to) + **system-message persona** (the Johnson/Withers spine) + brain **drives the hero card** with the hand-coded `proactive()` as instant fallback; local **drift detection** that catches a slip and offers the recovery move; **inferred masterpiece day.**
> Note: the *manual* masterpiece already exists (`saveMasterpiece`/`fillMasterpiece`, lines 655-680). "Inferred-from-logs" is an *upgrade* on a shipped feature, not greenfield — and the manual version is the cheap interim if Phase 5 slips.

**Why now:** the brain feels dumb because it's blind and mute — fixed at $0 without touching the engine, this is the biggest perceived-intelligence jump.
**The risk:** a slow free model hangs on "thinking…". Always render the local `proactive()` fallback first, fill in when the model answers.

### Phase 6 — The Leap (native-adjacent) — RESEARCH SPIKE, not a promised build
**Spike, don't promise:** the "iOS Shortcut → Claude → write a field back" path is the riskiest integration in the plan and is **under-specified**. A consumer Claude subscription is claude.ai, **not metered API credits** — a Shortcut cannot trivially drive an authenticated web session and parse a structured field back. So Phase 6 opens as a **research spike**: prove the mechanism (Shortcut + clipboard/share-sheet round-trip, or a free-tier API key walled as "advanced, key exposed") *before* promising any `{move, brief, replan, photoScore}` contract.
**Also ships (low-risk, real $0):** PWA service worker + real manifest icons; visibility-gate the two `requestAnimationFrame` loops for battery.
**Why now:** it only pays off *after* the fat, well-framed prompt of Phase 5 exists to hand it.

---

## 6. WHAT TO STOP / SIMPLIFY — less machine, not more

- **DELETE the Spark upgrade shop** (`UPG` 356-364, `gMult` 366, `buyUpg`). Invisible multipliers buying nothing visible — the #1 soul-drift. Subtractive, free, re-aligning.
- **DELETE the shame-streak.** The fire counter resets to zero on one miss — it violates no-shame and is exactly David's drift-trigger. Replace with quiet X-of-last-7.
- **DELETE dead code carefully:** the `.nb.center` CSS (reverted center-button). **Do NOT** blind-delete `star` — it's live in `recommitSheet`; verify read-sites first (likely the pinned seed).
- **COLLAPSE only `preview`→`reflow` ordering.** Leave `schedule()` — it's the read-only proactive engine, not a duplicate.
- **NEVER let the world worsen.** No re-thickening fog, no growing-back boss, no darkening plot. Only "cleared" and "not yet cleared."
- **STOP smearing dopamine across taps.** Reward opening softly; reserve the bloom for real SENDs. Color celebrates the deed, never the session.
- **STOP over-promising.** No idle bloom. No four half-practices. No Crusoe→chateau in week one. No Claude round-trip before the spike proves it. Manual-before-automate; each phase earned by use.
- **DON'T let ALTER nag David about shipping.** The redirect fires once a day, gently, or not at all — and building his own tool can count.

---

## 7. THE NEXT 3 BUILDS — when David flips to fast mode

Highest leverage-per-effort, ordered. Each is small, $0, and re-aligns toward the soul.

**1. Back up my life + version the data (Phase 0).** `S.v` + migration chain + `QuotaExceededError`-aware `save()` + one-tap export/import + the day-blind timer fix (`stopTimer`). The floor everything stands on — do it before David accumulates more real history to lose.

**2. Delete the Spark shop + add the send-gate boolean (Phase 1, Beat 1).** Remove `UPG`/`gMult`/`buyUpg`; add `hasShippedToday` + the grey/ungrown render branch (the send/courage category already exists — `virtueOf`, `OCC_PERK 'The Closer'`). Cheap, instant, and it installs the one law Heroic can't copy *before* you build the thing the law governs.

**3. Plant the first garden sprite (Phase 1, Beat 2).** The pixel plot under the guardian where banked Spark plants one sprite at a time, gated on the ship (reuse `baseY`, `gdisc`/`gring`). This is the real build — the moment ALTER stops being a calculator and becomes a world David built from his real life. Live with it before wiring the four signals.

> After these three the spine exists: truth is durable, Spark builds something you can see, and the world grows only when David does. Everything else — the clearing fog, the pinned-anchor planner, the fused habits, the one Practice Player, the living brain, the chateau — is a layer hung on that spine.

---

*Withers no-shame: every state is a light ready to grow; the world never darkens, only waits to clear. Johnson areté: the loop IS closing the gap between who you are and who you're being. Clear 2-minute floor, never-miss-twice. Maltz: you don't visualize the safe place, you build it. Beauty: the scoreboard is a place, rendered, that you'd want to look at. David's style: pick by feel, less machine, ship the smallest thing that makes the vision true.*