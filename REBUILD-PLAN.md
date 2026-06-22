Now I have the ground truth. Confirmed:
- **`B.innerHTML=""` on every `draw()`** (line 1063 + 1067) — the re-render thrash is real.
- **CATS is exactly 2-deep** (category→groups→tasks, hardcoded `if(view.cat)/else if(view.group)/else`), Outdoors buried under Hobbies. Confirmed.
- **`custom` type-in renders on screen 1** when `view.cat==null` (line 1075). Confirmed.
- **`messy()` is a single boolean** off `S.lastTidy`. Confirmed.

I have everything I need. The product-strategist and systems-architect lenses (both scored 8) had the most accurate code reads and the strongest unifying spines. I'll build the plan on their convergence — the single deed-event + derived `mind()` model — and steal the game-designer's string-board, while resolving the critics' flagged collisions (gesture conflict, tracking-depth-vs-tree-depth, mind-map cold-start, schema migration) head-on.

---

# ALTER — The Definitive Rebuild Plan

*One world. One notebook. One tree. One deed. The fairy who knows you.*

---

## 1. Diagnosis — why it feels clunky and doesn't know you

Four root causes, not symptoms:

1. **Two menu systems fight each other.** There's a bottom-sheet modal (`#sheet`, dark backdrop, full-width — violates "never full-screen") *and* the floating notebook (`#screen`). Half the app is paper, half is modals, with two different close affordances. That inconsistency **is** the "clunky/broken" feeling.
2. **Every tap rebuilds the whole DOM.** `pickerSheet.draw()` does `B.innerHTML=""` on every single selection (confirmed line 1063/1067) → flicker, lost scroll, dropped keyboard, thrashing multi-select. This one line produces most of the "broken" feel.
3. **The radial dead-ends and eats taps.** The backdrop (`ov`) *is* the dismiss layer (line 877), so a near-miss tap cancels your timer; the center "more" dumps to the full picker with a type-in on screen 1; the tree is only 2 levels deep so the exhaustive taxonomy literally doesn't exist.
4. **There is no model of you.** `goals` is dead free-text no planner reads; `messy()` is one boolean; `S.mood` is captured but never fed to planning; `suggestDay` is a fixed 11-block template identical for everyone. The app can't plan tomorrow because it stores nothing about your week, your room, your energy, or your goals.

---

## 2. The core idea — ONE DEED, SIX LENSES

The unifying concept (product-strategist's spine, hardened by systems-architect's `mind()`):

> **Everything in ALTER is one atomic event — a deed — seen from six angles. And the fairy holds one notebook that knows you.**

A deed is `{taxPath, planned|spontaneous, mins, when, virtue}`. From that single noun:
- **Planner** = deeds pre-placed as bubbles for tomorrow
- **Tracker** = deeds stamped live ("what are you doing now")
- **Habit** = a deed that recurs
- **Mind-map (the String-Board)** = deeds drawn as a constellation
- **Garden** = deeds summed, raising buildings
- **Goals** = the categories deeds should ladder toward

Two derived objects make it cohere and never go stale:
- **`tree()`** — one recursive JSON taxonomy = the single source of truth for *what you can do*.
- **`mind()`** — one function recomputed on load from your raw logs = the single source of truth for *who you are*.

And the **String-Board** (game-designer's signature) is the soul: your habits as pinned cards, hot-pink string lighting up when a streak is alive, fraying when it lapses, orphaned when an activity feeds nothing you value — *Withers' alignment made literally visible on dark hot-pink.* "Look at the web of who you're becoming."

**Why this kills the clunk:** you stop building six systems and maintaining six data stores. You build one event, two derived views, and six lenses. Fewer machines, exactly as David asked.

---

## 3. The new menu/UI system — notebook-over-world

**One architectural law (steal from mobile-ux, the cheapest high-impact idea):**
> **Paper floats on world. The world never unmounts.**

Kill the `closeGame()/openGame()/goTab` body-class thrash. The twin-stick island is always behind; menus are notebook pages floating over it, world dimmed ~20% (never blacked out, never full-screen).

### The notebook page (built once)
- Floating card, ~88vw × ~74vh, slight rotation + sticker-shadow so it reads as paper in the fairy's hand. Bold dark outline, candy page on darker-pink world, **zero white**.
- **One** close affordance: the X, top-right, always. Delete `#sheetX`.
- **Left margin = the spine breadcrumb.** The drill path renders as tabs down the spiral binding (`Energy ▸ Fitness ▸ Cardio`). Tap any tab to jump back. This replaces back-buttons and never disorients on a deep tree. It *is* the aesthetic and the navigation at once.
- Body = current node's children as candy tiles (emoji + label, 2-col).
- Sticky footer = live count + search pill + primary action.

### Three doors over the SAME tree
1. **RADIAL** (fast/diegetic) — tap the fairy → ring of your **top-5 frequent leaves + 1 "open notebook" wedge**. (Fix below.)
2. **DRILL** (browse) — notebook pages slide right-to-left; spine grows a tab. Recursive `renderNode(node)` replaces the hardcoded `if(view.cat)/else if(view.group)`.
3. **SEARCH** (power, ~30 lines) — footer search pill, hand-rolled fuzzy over a `LEAVES[]` flat index built once at boot. Type "run" → jump straight to the leaf. **This is the resolution to the tracking-depth-vs-tree-depth collision the critics flagged: a deep tree never costs you taps because recents + search are always one move from any leaf.**

### The radial — fixed precisely (confirmed bugs)
- **Cap at 6 wedges + 1 center.** Center = "open notebook at root" (drill), **never** `onPick(null)`→type-box.
- **Separate the dismiss layer from the item layer.** Today `ov.onclick` (the backdrop itself) calls `onCancel` and kills the timer (line 877). Fix: a transparent *sibling* backdrop catches outside-taps; items live in an inner div with `stopPropagation`. Kills the "missed tap cancels my timer" bug.
- **Geometry by center, not top-left.** `R = clamp(innerW*0.30, 96, 132)`; place each wedge at `(x - halfW, y - halfH)` with the real tile size, not the buggy fixed `x-36` on a 72px box. Rotate the ring so the first wedge lands in the thumb-reachable arc.
- **Stagger-in:** each wedge scale+fade with ~28ms cascade so it reads as a menu blooming, not a glitch.

**Decision on the mobile-ux "wand-pull press-drag-release":** **Rejected.** The critics are right — it's a from-scratch nested-ring drag engine that fights the live twin-stick touch handler and is the part most likely to ship feeling broken. We keep tap-to-open, tap-to-drill. *One-line why: don't build a third, hardest-to-tune gesture system to fix a two-system problem.*

### No re-render
Render the grid once. On select: toggle the tile's `.on` class + update one footer count node. Drilling slides a new page-layer in (old layer stays in DOM underneath = instant back, scroll preserved). This single change removes the flicker/keyboard-drop/scroll-loss.

### Diegetic access (no tab bar — req 1, done for real)
Keep `WORLD_SPOTS`/`wireWorldTap`/`heroMenu`. **Actually remove `#nav`** (the critics caught that the world-taps are currently sugar over the tab bar — we delete the bar, not just hide it). Each spot opens its notebook page over the frozen world:
- **Fairy** → radial action-hub (What now? · Plan · Track · Reflect)
- **Notice-board** → the bubble Day board
- **Tree** → virtue/skill tree
- **Chest** → habits + the String-Board
- **Cabin** → brain/settings/profile/goals/room-state/LLM-key/export-import

---

## 4. Activity taxonomy + habit String-Board

### One recursive tree — Indoor/Outdoor surfaced first
Re-root the 2-deep `CATS` into one N-deep tree. Node shape:
```
{ k, label, e, color, children?, leaf? ,
  meta: { place:"in|out|any", virtueK, kind:"standard|spontaneous",
          defMins, roomDim?, isSend?, isVice?, habitId? } }
```

**Top of the tree** = the 6 life-domains as big tiles (Energy/Body · Work · Love · Play · **Outdoors** (promoted from a buried Hobbies group) · Vices), **plus a persistent INDOOR/OUTDOOR filter pill** in the footer. *Decision: Indoor/Outdoor as a cross-cutting lens on a per-leaf `place` flag, not a top split — because "Run" is outdoor-or-treadmill and "Cook" is indoor; the flag belongs on the leaf, and a pill surfaces it early without forking the whole tree.* (Resolves the only real taxonomy disagreement between the lenses.)

**Depth 3–4 where it branches:**
```
Energy ▸ Fitness ▸ Cardio ▸ {Run[road/trail/treadmill], Cycle, Swim, Row}
Energy ▸ Space ▸ Clean ▸ {Dishes, Laundry, Sweep, Bed, Declutter, Trash}   ← feed roomState
Work  ▸ Focus ▸ {Code, Write, Design, Study}   ▸ Ship ▸ {Send, Publish, Outreach}  ← isSend
Outdoors ▸ Nature ▸ {Hike, Walk, Garden, Beach}   ▸ Errands-out ▸ {Groceries, Post}
Love  ▸ People ▸ {Call, Visit, Date, Family meal}   ▸ Self ▸ {Journal, Therapy}
Play  ▸ Music ▸ Instrument ▸ {Guitar, Piano}
Vices ▸ Digital/Substance/Other   ← anti-habits, logged true, never shamed
```
Keep `activeCats()` — the occupation-graft swaps the Work subtree. Build `LEAVES[]` (flat, for search), `TITLE2META` (extend with flags), `byPlace`/`byVirtue` indices once at boot.

**Standard vs Spontaneous:** every leaf carries a default `kind`, *and* it's captured at log-time by how the deed was created — a bubble dragged in advance = `planned:true`; a "what am I doing now" timer = `spontaneous:true`, stored on the log. Standard items feed the weekly template; spontaneous ones are logged but never auto-scheduled. **The user can correct a mis-inference** (the critics' creepy-inference worry): a one-tap "this isn't a usual thing" on any block the planner penciled in.

**Type-in = true last resort:** the text field renders only as a dimmed "✏️ none of these? name it" leaf at the bottom of a *childless* node's list — never on screen 1 (fixes the confirmed line-1075 bug). A typed entry inherits the current folder's category/flags and persists into `S.userLeaves[]` merged into the tree at boot, so you never type it twice.

**This one tree powers onboarding multi-select, the planner radial, the tracker, micro-tasks, and the String-Board.** Deepen it once → propagates everywhere (already architecturally true via the shared picker).

### The habit String-Board (req 4, net-new)
The Chest page. An **authored, deterministic** layout — *not* a force-directed d3 hairball (jitters, untappable on a phone, can't render identically each load).

**Edges are DERIVED, never stored** (so the map can never go stale — the design's most disciplined call):
- activity→domain from `TITLE2META`
- activity→virtue from `virtueOf()`
- weight/glow from `frequent(30)`/`actCount`
- **co-occurrence threads** (the clever extra): activities logged same-day ≥3× get a hand-drawn string ("on days I run, I also deep-work") — pure pair-counting, teaches you your own causal chains, zero LLM.

**Layout:** 6 domain anchors on a fixed clock; each activity hangs off its domain at `angle = hash(id)` (deterministic → renders identically every load, static-friendly, no solver). New habits drift in as faint new stars.

**Visual (candy-on-dark night):** domains = big sticker-cards; habits = polaroid mini-cards sized by frequency. String:
- **bright glowing** = active streak (an identity-vote, lit)
- **thin steady** = sometimes
- **frayed grey** = lapsing (no-shame: dim, never red, never deleted)
- **dark thorny vine** = a vice pulling
- **orphan card** = an activity that feeds no virtue → the fairy gently asks "keep it?"

Every completion fires a pink spark up the string to the virtue node (Fogg celebration). Tap a card → its 14-day dots flip up as the polaroid's back.

**Cold-start resolution** (the critics' sharpest catch — co-occurrence is empty for weeks): the board is **never empty on day 1** because onboarding's "pin your week" seeds it with derived domain+virtue edges immediately. Co-occurrence threads are an *enrichment* that lights up over the first fortnight, not the load-bearing content. The board reads full from minute one.

---

## 5. The user-model — `mind()`, the thing that "knows you"

**One derived function, recomputed on every load (<5ms over 30 days of localStorage), computed-not-stored** so it's always current and survives backup/restore with zero migration risk. Everything reads from it.

`mind()` returns:
- **`goals[]`** — STRUCTURED: `{label, catK, virtue, target:{type:"freq|deadline|streak", n, per}, progress, momentum}`. Captured by *tapping the tree* in onboarding (pick "Ship the app" → it already knows catK=work, virtue=courage), never typed. Replaces the dead free-text.
- **`room{}`** — multi-dimension **decaying** scores `{tidy, dishes, laundry, desk, trash}`, each 0–100, decaying ~6–8/day since its last matching log, **reset to 100 when you log the matching leaf** (log "Dishes" → dishes=100). This is "the state of your room" — captured passively from what you already track. Generalizes the single `messy()` boolean.
- **`energy`** — read from `S.mood` (captured, currently only desaturating the garden — now also drives scheduling) × a per-hour curve learned from when high-effort logs actually happen.
- **`week`** — the learned average week: a weekday×phase grid of typical activities, seeded by onboarding's pin-your-week and continuously corrected by real logs (a spontaneous log recurring ≥2× same weekday/time → promoted to standard; **user can reject the promotion**).
- **`rhythm`** — chronotype (morning/night/flex) inferred from when deep-work first logs.
- **`weather`** — optional one free no-key `open-meteo` fetch by geolocation. **Honest framing:** this needs a permission prompt and may be denied; the app defaults to place-neutral and works fully without it.

**How tomorrow-planning uses it** (rewrite `suggestDay`/`suggestNext`/`skeletonDay`):
> "Plan tomorrow" opens to a **pre-filled, editable bubble-day — never a blank page.**

1. Start from `week[weekday]` — your *actual* typical day, placed at learned times, pinned as standard blocks.
2. Deep/hard blocks slotted into your `rhythm` peak; admin in the dip.
3. One starred block per under-served goal.
4. A short tidy block for the specific room dimension that's low.
5. Weather swaps outdoor→indoor siblings if it's raining.
6. Only `standard` auto-places; spontaneous become optional chips.
7. Hand the draft to the bubble calendar (kept), user drags to adjust.

**The fairy narrates what it inferred** — this is what turns a cheap `if` into the *feeling* of being known: *"Tuesday — you usually run mornings and your energy's high then, penciled it in. Kitchen's getting messy (4 days) — added a 10-min reset. You haven't shipped in 2 days — here's a tiny one."* Pure conditional text, $0.

**"While you were gone"** (Animal-Crossing): on load, compute deltas from `lastOpened` — room decayed, strings frayed, world drifted — narrated by the fairy. A living world from one timestamp.

**Honest scope** (the critics' fair warning): the offline model is decaying scalars + a learned-week frequency table + a chronotype guess. That is genuinely "knows your patterns," but it is *not* clairvoyance. The optional LLM key, when present, gets fed the **full `mind()` object** and can rephrase inferences in the fairy's voice / auto-structure a typed goal — but **selection is always deterministic** so the app is never hostage to a key.

**KB integration, operationalized** (the critics caught it was hand-waved): the Field Guide KB + david-kb are **hand-distilled at build time into ~2 small JS constants** — `VIRTUE_WEIGHTS` (which virtues/goals carry gravity) and `FAIRY_COPY` (the no-shame, "knows-me" line bank keyed by inference type). No runtime KB read; a one-time distillation pass writes the constants. That's the only $0-honest wiring and the plan states it explicitly.

---

## 6. Gamification — one fiction, real life as the fuel

**One fiction:** *every real-life deed is a Spark; Spark grows two worlds — the OUTER island and the INNER String-Board.*

1. **Staged world (the headline).** A derived `worldStage()` on **`S.game.deeds` = count of send-gated ships** (not raw Spark, so it can't be ground):
   - **WILD** (0–6): overgrown, foggy pink, a lean-to.
   - **CULTIVATED** (7–25): paths clear, garden beds, a real cabin, a pond.
   - **ESTATE** (26+): studio, library, greenhouse, a lit bridge.
   Each stage swaps the `OBJS` scenery table for richer state-driven structures + brighter lighting. Stage-up is a felt page-turn event + the fairy re-dresses.

2. **Milestones raise buildings**, each gated on *lived evidence* (reuses `actCount`/`PERKS`): ship 10 → Studio (Courage); 25 deep-work → Library (Wisdom); 20 tidy-days → the clean Estate house (Discipline). **You spend Spark to construct an unlocked building** (the major sink) but can only unlock it by living it. Kills inflation *and* makes every building a true trophy of a real pattern.

3. **Spark economy with real sinks.** Earn ≈1 Spark/useful-minute (rebalanced so a 90-min deep block ≫ a mood tap). **Delete the invisible multiplier shop** — the soul-drift. Spark's only sinks: construct buildings, plant/decorate, fairy cosmetics, "seeds" that auto-plant when you complete a habit. A visible "next building: 3 more workouts" line so Spark always has a destination.

4. **The send-gate is the heartbeat and the win-condition.** `hasShippedToday()` already gates planting — **elevate it to the only thing that advances world stage.** No ship → the world *holds* (never shrinks — Withers/Finch no-shame). One ship → today's growth unlocks + tonight's board lights. This makes David's own documented 3-year send-trait the literal win-condition — and is the one mechanic Heroic structurally can't copy.

5. **Skate/trick scoring** (engine exists, unscored): land a trick → combo multiplier → small **daily-capped** Spark routed to the *cosmetic* budget. A self-contained play loop that funds making your estate pretty without distorting deed-gated progression. Ramps/rails appear as the island reaches Cultivated/Estate — the toy you earn.

6. **Virtue tree — keep wholesale** (the cleverest existing piece: Johnson's 8 virtues, ranks, perks). Wire each virtue's rank to its String-Board incoming-edge strength and gate its building's max tier. Now **habits → strings → virtues → tree → buildings** is ONE causal chain you trace with your eye.

7. **Micro-wins, no shame.** Every completion = a pink spark up the string + a number-pop. Lapsing frays a string and lightly overgrows a building; re-engaging instantly re-lights it. The fairy waits, never scolds. **Replace the shame-streak fire-counter with quiet X-of-7.**

---

## 7. Frictionless time-tracking — the core loop

The confirmed friction: tracking is buried (`nowCard` only lives on the old Day tab) and depth-gated.

- A persistent **fairy-held "what are you doing?" bubble floats over the world** (overworld mode). **One tap** → radial of `frequent(6)` → tap → a **live running bubble pins over the world**, visible in overworld (today it's only on the calendar). Long-tail activity not in your top-6? The radial center → notebook with **search at the top** = still 2 taps + a type, never a 4-deep drill. *This is the explicit resolution of the "deeper tree fights shallower tracking" collision: recents + search make the 90% case one tap and the 10% case two.*
- Multitask timers stack (keep `assignTimerMulti`). Stop → logs into the bubble schedule's **ACTUAL** lane + earns Spark + fires a String-Board spark.
- Spontaneous things logged with one tap as they happen (flagged `spontaneous`); standard things were already planned.
- **Perf note** (critics' valid catch): the live bubble is one DOM node over a rAF canvas — throttle the world to ~30fps while a menu/bubble is open, and update the bubble's time text on a 1s interval, not per-frame. No battery cliff.

---

## 8. Keep / Cut

**KEEP (the strongest existing code):**
- **The bubble day-schedule** (`calendarView`) — drag-to-move, reflow/push-siblings, pin-to-time, edge-stretch, miss/ok/live/now-line, dust-settle. Touch nothing structural. *(req 7)*
- **The shared picker plumbing** (already one-source-of-truth across now/plan/habit) — keep the sharing, deepen the tree, make the walk recursive, render inside the notebook.
- **The virtue tree** (`drawTree` + ranks/perks/occupation-perk) — wire strings to it.
- **The send-gate** (`hasShippedToday`) — promote to win-condition.
- **Multitask timers** + drag-to-adjust + Spark-on-stop.
- **The two-tap micro mechanic** (plan→complete→earn) — only the content becomes dynamic.
- **The diegetic world scaffold** (`WORLD_SPOTS`, `heroMenu`, proximity prompts), the 8-dir fairy, twin-stick, skate/jump engine.
- **`frequent()`/`actCount`, `S.mood` capture, `TITLE2META`/`virtueOf`, `activeCats()`** — reusable infra the new systems read.
- **`currentMood()` → garden desaturation** — the one piece of the vision already alive; extend it.
- **Export/import backup** — the data-truth floor.

**CUT (each removes code — less machine, not more):**
- The `#sheet` bottom-modal system + `#sheetX` entirely. One surface: the notebook.
- `B.innerHTML=""`-on-every-tap → class-toggle + footer count.
- The radial's center→type-box dead-end and the backdrop-is-the-overlay cancel.
- The duplicate `#logPanel` "tracked today" list (the calendar's ACTUAL lane already shows it) — the Day-tab scroll-clutter. Day view = day-nav + two-lane bubble calendar, nothing else.
- The fixed `suggestDay`/`skeletonDay` 11-block template → `mind()`-driven pre-fill.
- The static `MICRO` array + `MICROPHASE` rotation as the *source* → keep as fallback pool, drive selection from state.
- Decorative `plantGarden` confetti → staged wild→cultivated→estate + buildings.
- Static `OBJS` scenery → state-gated structures.
- The Spark multiplier shop.
- The shame-streak → quiet X-of-7.
- Type-in as a first-screen peer → last-resort childless leaf.
- The tab bar (`#nav`) — actually delete it, not hide it.

---

## 9. Phased build roadmap

> **Migration first, always** (the critics' most important catch — a re-rooted CATS + new flags must not reset anyone's world to WILD). Before any phase ships, a `migrate(S)` runs in `load()`: map old flat `catK` logs onto new `taxPath`, default-fill new `room`/`goals`/`week` fields, preserve `S.game`. *The world resetting to wild is the single most demoralizing possible bug for this app — it's gated behind tests in Phase 0.*

**Phase 0 — Foundation (no visible feature, all enablement).** *Reuse: load/save, schema version.*
- `migrate(S)` + a localStorage snapshot before first migrated save.
- Re-root the tree as one recursive JSON with leaf `meta`; build `LEAVES[]`, extend `TITLE2META`, `byPlace`/`byVirtue`. Keep `activeCats()` graft.
- `S.userLeaves[]` merge at boot.

**Phase 1 — Kill the clunk (the felt fix).** *Reuse: pickerSheet wiring, WORLD_SPOTS, notebook CSS.*
- Delete `#sheet`; render every picker inside the floating notebook (one X, spine breadcrumb).
- `renderNode()` recursive drill + no-re-render (class-toggle + footer). Search pill + fuzzy over `LEAVES[]`.
- Rebuild the radial: 6 wedges + center-drills-notebook, separated dismiss layer, center geometry, stagger-in.
- Remove `#nav`; wire each world-spot to its notebook page; world never unmounts.
- Demote type-in to last-resort leaf.

**Phase 2 — `mind()` + smart tomorrow.** *Reuse: frequent/actCount, S.mood, reflow.*
- `mind()` derived object: `room` (decaying), `week` (learned), `energy`, `rhythm`, structured `goals`.
- Rewrite `suggestDay`→`planTomorrow()`: pre-filled editable bubble-day + fairy narration. Optional weather fetch.
- Build-time distill `VIRTUE_WEIGHTS` + `FAIRY_COPY` constants from the KBs.

**Phase 3 — Onboarding that learns.** *Reuse: habitSheet multi-select + frequency-batch (already "no typing").*
- Diegetic fairy interview: archetype/spectrum card-sorts → "pin your week" (multi-select over the tree, seeds `week`+habits+board) → goal card-picks → focus virtues → room snapshot. Never-ends (passive correction after).
- **Add a skip/minimum-viable path** (critics' catch): "pin 5 things to start" unlocks the app; the rest fills passively.

**Phase 4 — The String-Board (req 4).** *New, derived from existing logs.*
- Authored deterministic constellation on the Chest page; derived domain+virtue edges (full from day 1); co-occurrence threads enrich over 2 weeks; tap-card stats; orphan/fray/glow states.

**Phase 5 — Cohered gamification.** *Reuse: hasShippedToday, virtue tree, trick engine.*
- `worldStage()` on `S.game.deeds`; state-gated buildings replacing `OBJS`; Spark sinks; delete multiplier shop; trick scoring → cosmetic budget; wire strings→virtues→buildings; X-of-7 replaces shame-streak.

**Phase 6 — Micro-tasks + frictionless tracking polish.** *Reuse: two-tap mechanic, assignTimerMulti.*
- `microGen(mind())` deterministic rule engine (room/goal/energy/habit-rescue/send-gate), one card at a time, each a real leaf. Persistent overworld "what are you doing?" bubble + live running bubble (30fps throttle). Optional LLM rephrase.

---

## 10. The ONE first move

**Build Phase 1's single change first: collapse the two menu systems into the one notebook and stop the full-DOM re-render** (`#sheet` deleted; every picker rendered inside `#screen` with class-toggle-not-`innerHTML=""`, one X, recursive `renderNode`).

**Why this and nothing else first:** it's the highest leverage-to-effort ratio in the entire plan — it's mostly *deletion*, it fixes Complaints 1 and 2 (the literal "clunky/broken" feeling) at the root, and it's the precondition every other phase renders into. The deep tree, the String-Board, onboarding, the planner, micro-tasks — all of them draw on the one notebook surface. Build that surface right once and everything after it is cheap. David feels the app stop being broken on day one, before a single new feature exists.

*(Phase 0 migration is the technical prerequisite that ships *with* this, invisibly — so nobody's world resets.)*

---

## Open questions for David (your taste decides)

1. **Indoor/Outdoor as a filter-pill over per-leaf flags, or a hard top split?** I chose the pill (a treadmill run is indoor; the flag belongs on the leaf) — but if "I'm going outside" is how your brain reaches for activities, a top split is more diegetic. Your call.
2. **The identity layer in onboarding — fixed card deck, or one allowed type-in?** Every lens forbids typing, but identity is *your* most personal field and you're the only user. I lean: let the archetype cards be the fast path but allow one "…or in your own words" on the identity screen specifically. Agree, or keep it pure-tap?
3. **Send-gate strictness — does the world's daily growth *fully* hold until you ship, or does it grow a little from any honest deed and *bloom* on a ship?** The pure version makes shipping the heartbeat (on-brand with your 3-year thesis) but risks feeling punishing on a real-but-no-ship day. Your tolerance for that edge sets the dial.
---

## ADDENDUM — David's locked decisions (overrides above where they conflict)

1. **Indoor/Outdoor = HARD TOP SPLIT** (not a filter pill). The tree's first branch is Indoor vs Outdoor, then domains/activities under each. Activities that are genuinely both (e.g. Run road/treadmill) appear under both with the right sub-leaf. Reconciles with the deep recursive tree — In/Out is depth-0.

2. **Onboarding = PURE TAP, no typing anywhere** — including the identity layer. All card-sorts / spectrum pickers. Type-in survives ONLY as the dead-end last-resort leaf when no submenu exists (req 3), never in onboarding.

3. **DROP the send-gate as the win condition. "Shipping" oversimplifies productivity.** Replace the ship-gated world-stage with an **ARETÉ model** (Johnson's balanced excellence — David's own KB lens):
   - The world grows from the **full spectrum of real deeds across all life-domains/virtues** (deep work, health, connection, learning, creating, rest, tidying…), weighted by virtue, NOT a single binary "did you ship."
   - **Buildings unlock from SUSTAINED PATTERNS PER VIRTUE**, not a ship count: e.g. consistent deep-work → Library (Wisdom); consistent movement → Grove (Vitality/Zest); consistent connection → Hearth (Love); consistent tidying → the clean Estate house (Discipline); consistent creating → Studio (Curiosity); consistent reflection → a Shrine (Gratitude/Hope).
   - **World stage (wild→cultivated→estate) is driven by overall balanced cultivation** — a rounded, well-tended life across virtues — not ship count. An unbalanced life (one virtue maxed, others wild) visibly shows it (one lush corner, the rest overgrown). Areté = the whole estate flourishing together.
   - Spark earned from ALL meaningful minutes (already ~1/useful-min), virtue-weighted. The send-gate mechanic can remain as ONE virtue's signal (Courage/Ship) among many — never the master gate.
   - No-shame holds (Withers): the world never shrinks; it just stays wild where you haven't tended.

---

## ADDENDUM 2 — MVP, the brain layer, and the onboarding survey (David, locked)

### A. THE MVP IS THE FIRST GOAL — the satisfying core loop
"We're not there yet." Before the deep rebuild, the FUNCTIONAL core loop must work and feel good:
1. **Pick a real task** from the menu (Laundry, Clean room).
2. **DECOMPOSE** → it splits into subtasks (Clean room → make bed · dishes · laundry · declutter · vacuum · trash). $0: each big task carries a preset subtask template. Brain: personalized to your room state/energy. (Revives the old subtask-decomposition, done better.)
3. Subtasks **drop into the planner** as bubbles (the kept schedule).
4. **Execute one-by-one** — check each off → satisfying pop + coin.
5. **Earn coins** per subtask done.
6. **Spend coins — TWO-TRACK SHOP:**
   - 🌱 **GROW** — plants, decorations, buildings for the mind-garden island (progression/aesthetic).
   - 🧰 **SURVIVE** — functional tools that make the app help you MORE: the brain/AI assist (unlockable!), auto-planner, smart reminders, the skateboard (faster), an extra micro-task slot, an energy boost.
This decompose→do→earn→spend loop is the MVP. Build it FIRST, on the de-clunked notebook surface.

### B. THE BRAIN LAYER — genius WITHOUT it, magic WITH it
Principle: the app is fully genius offline (deterministic logic + the mind() model). The optional LLM key is NEVER required — selection/logic stays deterministic so the app is never hostage to a key. The brain only turns good → magical.

| Function | Genius without brain ($0, deterministic) | Magic with brain |
|---|---|---|
| Task decomposition | preset subtask template per task | splits ANY task you name, personalized to room state + energy |
| Plan tomorrow | mind()-prefilled day from learned week + room decay + rhythm | rephrases in the fairy's voice; resolves "dentist 3pm + want a workout"; optimizes order to your goals/energy |
| Capture | tap the menu | "I ran and did the dishes" → logs both, infers durations |
| Fairy's voice | line bank keyed by inference (FAIRY_COPY) | responsive coaching + EOD reflection, grounded in your KB (Johnson areté / Withers alignment) |
| Goals | tap from the tree (knows catK/virtue/target) | breaks "get fit" into a weekly habit ladder |
| Micro-tasks | rule engine (room/goal/energy/habit-rescue) | the single most apt next move given your whole state |
| Reflection | prompts | reads the day's deeds + mood → one real insight |
| Survival / triage | cut to essentials by priority | "I'm overwhelmed" → fairy triages, trims the plan to the ONE thing |
| Onboarding | pure-tap card-sorts | infers archetype from your picks; structures any rare free-text |

Design rule: **the brain is itself an unlockable SURVIVE tool** — you earn the magic with coins, so the app teaches you it exists and the upgrade feels earned. Works fully without it.

### C. ONBOARDING — the clever PURE-TAP survey (no typing, ever)
A diegetic fairy interview, all taps/sliders:
- Archetype + focus virtues (card-sort).
- **Pin your week** — multi-select your usual activities from the tree (seeds your average week + habits + the String-Board).
- Goals — tap them from the tree (so it knows catK + virtue + target with zero typing).
- **Room snapshot** — tap the current state of each room dimension (tidy/dishes/laundry/desk/trash) → seeds room decay.
- Energy/rhythm — "when are you sharpest?" (tap a time).
- **Minimum viable: "pin 5 things you do most weeks" unlocks the app**; the rest fills passively. Never-ends — keeps learning from real logs.

### D. REVISED BUILD ORDER (MVP-first)
1. Phase 0 (migration + tree re-root, In/Out top split) + the **notebook collapse & kill-re-render** (so the menu isn't clunky).
2. **The MVP loop** — decompose → plan → execute → coins → two-track shop (GROW / SURVIVE).
3. The **pure-tap onboarding survey** (so it knows you from the first session).
4. Then the depth: mind() smart-planning → String-Board → areté gamification/buildings → brain-layer magic → clever micro-tasks.

---

## ADDENDUM 3 — GAMIFICATION INTENSITY DIAL (the unifying product insight, David)

The app meets you where you are. ONE real-deed→points engine; a DIAL changes only the reward/presentation layer. Set in onboarding, changeable anytime. THIS is why the app felt clunky — it was forced to be a serious tool AND a game at once. The dial makes it EITHER, cleanly.

- **Tier 1 — VANILLA (productivity-first).** The best clean productivity app: notebook menus, decompose→plan→execute, bubble schedule, habit String-Board, time-tracking, mind() smart planning. Reward = honest progress only — streaks, the String-Board lighting up, the virtue tree filling. No island, no controllable character. For people who'd never want a "game."
- **Tier 2 — LIGHT (Duolingo-style achiever).** Vanilla + XP, levels, badges/achievements, daily goals, streak stakes, level-up celebrations, milestones — ALL earned from real deeds, ZERO twin-stick gameplay. The fairy is a mascot, not controlled. For people who love leveling up and collecting achievements but don't want to play a game.
- **Tier 3 — GAME (full interactive island).** Light + the explorable twin-stick island, the controllable fairy, garden-of-mind progression, AND survival/adventure: **pirate raids, wild natives, threats — and your REAL-LIFE deeds fund survival** (coins/resources → defenses, arm the fairy, fortify the island, heal, build). Cleaning your room literally makes you strong enough to survive the next raid. The two-track GROW/SURVIVE shop lives here. No-shame (Withers): neglect leaves the island wild/under-supplied but NEVER destroys it; threats are playful jeopardy, instantly recoverable by doing real life.

**Architecture:** build the deed→points engine + each presentation layer ONCE; the dial shows/hides layers. Vanilla = engine only. Light = + XP/achievement layer. Game = + world/survival layer.

**MVP RE-TARGET:** the MVP = a solid **Vanilla + Light** core (decompose→plan→execute + levels/achievements/coins) — genuinely useful, shippable, and the foundation. The full **GAME** tier (survival island, pirates/natives, grow/survive economy) is the high-end built on the same engine, which David runs at max. This de-risks reaching "functional" — we don't need the whole survival game working to be a great app.

---

## ADDENDUM 4 — The GAME is the base; the addiction engine (David, corrects Addendum 3)

**Reframe:** every tier gets its own MVP, BUT the DEFAULT / flagship experience is the full GAME tier — built minimum-viable but built for ADDICTIVENESS. Vanilla is the boring opt-out for people who want it stripped; it is NOT what we lead with. "The base experience is dull; in-game is the full effect." The whole point is to get people ADDICTED to cleaning their room, meditating, and achieving goals — by making real-life action the most rewarding move in an actual game.

### The addiction engine (noble habit-forming — transfer the game's pull onto real behavior)
1. **The real action is the highest-value play.** Cleaning your room isn't a chore you log — it's the single most powerful move in the game (biggest coins, fortifies the island, the fairy erupts). The reward gradient points AT real life.
2. **Instant, juicy, variable reward on every deed** — coins pop, a spark flies up the String-Board to its virtue, the island tile blooms, number-pop + sound. The decompose→one-by-one loop turns a boring task into a string of dopamine wins.
3. **Survival stakes create pull** (Game tier) — your island/ship needs supplies; a raid (pirates / wild natives) is coming; real-life action keeps you safe and thriving. No-shame: never destroys the world, but the jeopardy motivates ("I should do a real thing so I'm ready").
4. **Visible compounding progression** — every deed visibly grows the estate (wild→cultivated→estate, buildings rise). "Look what I built by living well."
5. **The Animal-Crossing return pull** — "while you were gone" the island drifted, strings frayed, the fairy missed you. Come back and tend.
6. **Daily quests + streaks (Duolingo)** — but every quest is a REAL action (meditate, clean a room-dimension, ship one goal-step).
7. **The fairy as a companion** who reacts, celebrates, and gently pulls you back — real emotional attachment, never a nag.

### Revised MVP target
The MVP = the **Game-tier minimum-viable addictive loop**: pick a real task → it decomposes → do each subtask → instant coin/XP + island visibly responds → a light survival stake gives the world a pulse → you want to do the next real thing. Built on the de-clunked notebook + the existing island/fairy/twin-stick. Vanilla and Light are reductions of the SAME engine via the dial. We lead with — and polish — the addictive game.

---

## ADDENDUM 5 — MODULAR SELF-HELP STACK (David)

The app encourages AND guides you through a **self-help stack** — a library of guided practice MODULES, each with sound + visual, that compose like the bubble planner. "Remember the bubble planner for guided meditation — it's modular."

- **Modules** (each a paced, guided experience): 🌬️ Breathwork (DONE — first module), 🧘 Meditation / body-scan, 🙏 Gratitude flow (exists), 🪞 Affirmations / identity, 🌙 Wind-down / pre-sleep, 🎯 Intention-setting, 🧠 Visualization (Alfred's induction-library is the content source).
- **Modular = stackable into a SESSION**: drop modules as bubbles into a guided sequence (e.g. Breathe → Body-scan → Gratitude → Intention). The bubble-planner mechanic (drag/reflow/pin) composes a self-help session the app then runs you through, one module at a time, hands-free.
- Each module: paced visual (orb/animation), synced sound (Web-Audio tones, portable from studio-sim SFX), gentle voice/text cues, logs the deed + Spark on finish, feeds the virtue tree (Gratitude/Hope/Vitality).
- Ties to the app's Heal mode + Alfred's induction-library / fieldguide KB as the practice content.
