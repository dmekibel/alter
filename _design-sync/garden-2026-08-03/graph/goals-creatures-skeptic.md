# GOALS = CREATURES — skeptic pass (2026-08-10)

Attacking `goals-creatures-roster-draft.md` against David's kill precedents (`alter-garden-ui-round.md`) and the standing world laws. Refute-first; verdicts below. Balance check applied — not every element gets killed.

---

## I. TIER MAP

- **Quest → koi, no habitat build** — SURVIVE. Word-for-word his own idea ("ten goals, ten koi, pond can be pretty big"). No new law, no new mechanic, just fills a pond. Nothing to attack.
- **Venture → common creature, 3-stage habitat** — SURVIVE. Matches the locked direction exactly (sub-goals build habitat, completion brings resident).
- **Saga → one-of-a-kind resident, 4-5 stages** — SURVIVE. Same reasoning; scope matches "months+" investment.

## II. RESERVED-SPECIES CONFLICTS

- **Rabbit vs reserved hare** — RISK, leaning KILL-AS-WRITTEN. In a "chunky cozy sprites never ornate" art style there is no fine-detail budget to make a rabbit read as visually distinct from the hare virtue-emblem (long ears + haunches + fur tone is the *whole* silhouette for both animals). The reserved-species law only means something if the emblem species stay unmistakably singular; a lookalike venture creature quietly breaks that. Recast (fox already covers "sly small mammal," suggest chipmunk/vole/mole instead).
- **Duck vs reserved swans** — RISK. Both are white-leaning waterfowl on the same pond; at chunky-sprite scale the neck-length differentiator (the only real distinguisher) is easy to lose. Recast, or commit to a strongly non-white duck palette (mallard-brown/green) so no version of it could be mistaken for the emblem swan at a glance.
- **Songbird vs reserved dove/hummingbird** — SURVIVE, no recast needed. Generic sparrow/finch silhouette + perch-and-flit behavior reads nothing like dove's plump white body or hummingbird's hover-blur. Don't make David re-litigate this one — close it now.

## III. VENTURE ROSTER (8)

1. **Songbird** (birdhouse, post→box→painted roof) — SURVIVE. "You build shelter, they move in" is legible and matches the boat/lantern build-then-use pattern he already loves.
2. **Squirrel** (canopy drey + rope run) — SURVIVE, his own seed almost verbatim. One RISK note: the habitat sits "in the grove crowns" — the fruit-tree canopy belongs to a separate, sacred, already-locked growth formula. Confirm the squirrel's rope/drey sprites are additive decoration on top of existing tree art, not a new claim on grove real estate, before this ships.
3. **Frog** (lily patch) — SURVIVE. Cheap motion (sit + hop + ripple), cozy, no new law touched.
4. **Rabbit** (warren mound) — RISK, see hare conflict above. Independent of the recast, "vanishes into burrow at night" is the second creature (of three) carrying a day/night visibility state — flag under Motion Feasibility below.
5. **Hedgehog** (leaf-hollow, dusk-only) — RISK on scope, not concept. Third creature (with rabbit and fox) to need a time-of-day gate. Cute individually; as a trio it's an un-costed feature ("does the app know dusk from day yet, and where") layered under a system that's supposed to be MVP-honest.
6. **Butterflies** (flowerbed) — RISK. This is the only "resident" that is actually a swarm of independent sprites drifting in a loose pattern, not one animated creature. That's a different animation problem than every other entry (per-creature choreography vs. multi-sprite group behavior) in an app whose architecture is already flagged as fragile (innerHTML wipes, one 11k-line file). Feasibility tax is real; don't wave it through as "just like the birds."
7. **Duck** (reed nook) — RISK, see swans conflict above. Mechanically fine otherwise.
8. **Turtle** (basking log) — SURVIVE, with a note: "slow shore walk, long basks" is nearly the same headline beat as the Heron saga's "stands motionless... long basks." A venture and a saga sharing the same signature stillness undercuts the tier's felt difference. Give turtle a livelier or more distinct tell (e.g., climbs onto/off the log, doesn't just abide).

## IV. SAGA ROSTER (5)

9. **Heron** (reed-shallows stand, sentinel) — RISK, thematic. A heron and koi living in the *same* shallows is a real-world predator/prey pair, and this roster puts them both on the map. No law currently rules this out. See "missing" section — needs an explicit no-predation law before this ships, or David will ask the obvious question the first time he sees both.
10. **Deer** (mossy glade, "lifts head when you pass") — SURVIVE, and arguably the strongest entry in the whole set — it's the only creature that acknowledges the player at all, which partially answers "do creatures interact with the player." Minor accuracy nit: this requires a basic player-proximity check, which mildly contradicts Motion Feasibility's blanket "no collision AI" claim (a one-line distance check isn't real AI, but the doc shouldn't claim zero exceptions when there's one).
11. **Fox** (hillside den, "shy... seen at dusk... sits at den mouth") — RISK. Third dusk-gated creature. Bigger issue: a saga-tier reward (months of sub-goals) that mostly *hides from you* risks landing as another version of "nothing visibly rewarding" — the same emotional shape as the killed "quiet meter of nothing." If the fox is rarely on screen, the payoff for a saga-scale goal reads thin next to heron/otter/deer, which are reliably visible. Either loosen "shy" (visible more often, just skittish) or accept this is deliberately the rarest sighting and say so explicitly as a feature, not an accident.
12. **Otter** (cove rocks + slide) — SURVIVE, best-in-class. Distinct build element (a slide, not just a nest/den variant), visibly playful motion, nothing to attack.
13. **Whale (Sea Bell)** — see dedicated section below.

## V. THE SEA-BELL WHALE — dedicated attack

RISK, not a clean kill, not a clean survive.

**In its favor:** build-then-ring-it is structurally identical to two APPROVED precedents — boat (build then sail it) and lantern (relight ritual). David has consistently loved functional objects that pay off with a physical action. This is the kind of flagship centerpiece he's responded well to before.

**Against it:**
- **"Sometimes... the whale surfaces" is the load-bearing risk.** An RNG payoff that's silent most of the time is one gesture away from "quiet meter of nothing is the dumbest idea" — his own words for a killed mechanic. Ringing a bell into an empty ocean repeatedly will feel exactly like that meter felt. If this ships, the response needs to be guaranteed or near-guaranteed, not a rare roll.
- **Scope, honestly assessed.** 5 build stages *plus* a new interaction (ring) *plus* an offshore-appearance render is the single largest asset/engineering commitment on the roster, in an app whose own constitution says "feasibility matters" and flags hand-rolled animation as the tax on every new idea. It is meaningfully bigger than every other saga.
- **Not an image-sacred violation** (worth ruling out explicitly, since it looked like one at first pass): every habitat in this draft is already "opaque candy-ink pieces stacked on top" of the sacred backdrop per the existing law, so a pier-end bell tower is architecturally no different from a warren mound or lily patch. Don't let David think this is a special case — it isn't.

**Verdict to hand David:** don't leave open-call B as a neutral coin flip. Recommend explicitly — ship it only if the ring-response is reliable, otherwise park as the v2 flagship.

## VI. MOTION FEASIBILITY section

SURVIVE as a section — exactly the self-check the brief wants, and it's honest about hand-rolled constraints (no pathfinding, no collision AI, home-zone-only ambling). One structural catch it misses about itself: **water-zone crowding.** Koi, frog, duck, turtle, heron, otter, and (offshore) the whale is *seven of thirteen* creatures sharing the pond/shore. The draft's own density law says "a small island holds a village of animals, not a zoo" — a shoreline carrying seven residents is the zoo the law was written to prevent. This needs a capacity gut-check before David sees a shoreline sketch that's visibly packed.

## VII. THE GOAL-CREATION FLOW (steps 1-6)

1. **Name/sub-goals/WOOP** — SURVIVE, existing grammar, no new risk.
2. **Pick resident (silhouette roster, ROAD grammar)** — SURVIVE, smart reuse of an existing, approved pattern.
3. **Place habitat (planting grammar, GF7)** — SURVIVE as a mechanic. Structurally it raises the slot-exhaustion question below (see Missing).
4. **Stage-up: witnessed hold ~820ms, "grove grammar"** — RISK, not a kill but a real design question. Reusing grove's exact hold-to-grow gesture for goal stage-up blurs the Trinity's own premise ("practices grow plants, virtues keep flames, goals bring animals" — three systems, three verbs). Two of three systems now share an identical physical gesture for conceptually different kinds of progress (daily habit accretion vs. milestone completion), in an app that already has two menu systems that "clash." Recommend a distinct witnessing gesture for goals — something that reads as *building* (hammer/place-a-board beat) rather than *tending* (hold-to-grow), so the three systems stay legible as different verbs. Also verify 820ms actually matches grove's real constant; if it's a different number with no stated reason, unify it.
5. **Completion: THE ARRIVAL, user NAMES it** — SURVIVE-if-copy-stays-plain. Naming-a-companion is a well-worn, non-cheesy pattern (Stardew/Animal Crossing) when the surrounding copy doesn't oversell it. The cheese risk lives entirely in the prompt copy at ship time ("say hello to your new best friend!!" would fail Gate 1/2), not in the mechanic itself. This is a real, legitimate open call (A) — don't force a verdict, but route the actual naming-moment copy through the SCRIPT-ENGINE gates same as anything else user-facing.
6. **Forever plaque** — SURVIVE. Directly extends an already-approved grammar (door plaque, lantern evidence) to a new object type. No new law, no new risk.

## VIII. LAWS CARRIED

- Abandoned goal waits forever, no death/shame — SURVIVE, exact match to the standing no-shame/no-decay law.
- Creatures never buyable — SURVIVE, exact match to the Living Law (life earned, comfort bought) canon from rounds 5-6.
- Zero notifications — SURVIVE, standing law correctly restated.
- Density capped by zone — RISK, self-contradicted in practice by the water-zone crowding problem above (§V). The law is right; the roster as drafted doesn't actually obey it.
- No red anywhere — SURVIVE, standing law correctly restated, koi palette trap correctly flagged.

## IX. OPEN DAVID-CALLS — are they real calls?

- **A. Naming yes/no** — REAL call, genuinely a taste decision, correctly deferred.
- **B. Sea bell v1 or park** — should NOT be a neutral open call. The draft has enough evidence (RNG-silence risk, scope size) to carry a recommendation into the room. Present as "recommend park (or: ship only with guaranteed response), confirm?" not a blank fork.
- **C. Rabbit/duck/songbird vs reserved cousins** — PARTIALLY real. Songbird is answerable now (clear, no conflict — see §II) and shouldn't be re-asked. Only rabbit-vs-hare and duck-vs-swans are genuine open calls, and even those should be framed as "which recast do you want," not "is this even a problem" — it is.
- **D. Pond pre-existing or first-venture-build** — NOT a real open call; it's a logic bug hiding as a design question. The tier map states quests get *no habitat build* ("too small... the pond IS the quest ledger, it just fills"). If the pond is itself gated behind a venture-tier build (weeks-to-months), the very first quest David completes has nowhere for its koi to go. The pond must pre-exist. Close this call before it reaches him.
- **E. Quest koi arrive silently or with a splash** — REAL call, low stakes, fine to leave open as stated.

---

## TOP 5 FIXES BEFORE DAVID SEES THIS

1. **Scope down to an explicit MVP subset.** Thirteen fully-designed species (each with unique 3-5-stage habitat art and bespoke motion) as "goals v1" directly contradicts his own pattern two days ago, in this same arc: Grove MVP got locked to 3 species with "everything else parked." As written, this reads like a full menagerie launch. Propose a narrow slice (e.g., koi + 2-3 ventures + 1 saga) and park the rest explicitly, the same move that worked for Grove.
2. **Resolve the reserved-species collisions instead of blanket-deferring them.** Recast rabbit (too close to hare) and duck (too close to swans) now; confirm songbird is clear and stop asking about it.
3. **Add a "no predation, cozy coexistence only" law.** Heron+koi and (less sharply) fox+rabbit are real predator/prey pairs sitting on the same map. This is a one-line law, the same shape as "creatures never buyable" — write it before David notices the gap himself.
4. **De-risk or park the sea-bell whale's RNG silence.** "Sometimes the whale answers" pattern-matches his own "quiet meter of nothing" kill almost exactly. Either make the response reliable or explicitly recommend parking it as the v2 flagship — don't hand him a coin flip.
5. **Fix the pond sequencing bug.** Close open-call D: the pond must pre-exist from day one, because quests (which can finish before any venture habitat is close to done) have no habitat-build step of their own to fall back on.

## GENUINELY MISSING

- **Slot exhaustion.** What happens on the 9th venture-tier goal, once all 8 venture species are already resident? Repeat species (a second squirrel)? A "roster full" wall? The draft never says, and this is a certain question the moment David thinks about using the app for years.
- **The waiting middle of a multi-month saga.** Ventures get a nice line ("the nest visibly gets ready for someone the whole goal long"); sagas get nothing between stage-ups beyond the witnessed-hold moments themselves. Four-plus months with only 4-5 hold beats and no ambient in-between texture is a real gap for the biggest-investment tier.
- **A universal (or explicitly non-universal) player-acknowledgment rule.** Deer reacts to the player; nothing says whether that's special to deer or a rule every resident should follow at some small scale. Pick one and state it — otherwise it reads like an oversight on every other creature.
- **Shoreline zone-capacity math.** Seven of thirteen creatures want pond/shore territory; the draft's own "village not zoo" law needs a real capacity check against that number (see §V, §VII).
- **Seasonal/era skins.** Raised in the brief; no evidence anywhere in the project that ALTER has a season system at all outside the separately-locked house-era ladder. Worth one explicit line ruling it out of scope for this round rather than leaving David to wonder if it was simply forgotten.
