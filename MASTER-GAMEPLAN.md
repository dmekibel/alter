# ALTER — Master Gameplan (the road to "works as intended")

*Written 2026-06-23, after v386. The authoritative roadmap for the **2026-06-23 redesign**. Grounded in `DESIGN-BRIEF.md` (the text spec) + `_mockups/` (the visual source of truth) + an audit of the live `app.js`/`index.html`.*

> **Supersedes** `EPIC-GAMEPLAN.md`, `ROADMAP.md`, `REBUILD-PLAN.md`, `GAMEPLAN.md` for the redesign. Those describe an **earlier soul** (mirror/Spark-shop/RPG/send-gate/iOS-Shortcut brain). The redesign keeps the **world as the inhabited wrapper** (§10) and **cosmetic IAP** (§20), but the *engine* is now the **Plan→Do→Adapt→Track loop** (not a Spark economy) and *identity* is the **habit-mindmap** (not the virtue hexagon). Where the two conflict, the DESIGN-BRIEF wins.

---

## 0. The spine already beats (SHIPPED v372→v386)

The hard part — the heart of the product — is alive and verified in preview:

- **Calendar journal** (§14, mockups 030/031/034): two-lane Plan/Real, 3 plan states (hatched·celebration·ghost), gold-on-plan / coral-drift, half-hour grid, drag/stretch/reflow, NOW line.
- **Live tracker + pull-down** (§13, mockups 006/007): top strip + finger-follow pull-down = compact plan-vs-real; **big pink stop + dashed "start new"** (v386).
- **Bento picker** (§21, mockup 019): 8-domain clustered, expand→sub-groups, multi-select, type-once add.
- **Suggestion bar** (§14·1, mockup 040): reasoned hero+alts with WHY + "all my activities" door.
- **Onboarding** (§8, mockups 041/043): 8-step tap-first blueprint → `S.profile`.
- **Streak + celebration v1** (§6/§14·3): escalating star→flame, yellow→red gradient bar.
- **Subtasks + chores** (§16 seed): per-block steps, stateful chore freshness.
- **Foundation**: Jost 600-700 (§22), Tabler icons, 8-domain `DOM` palette (§24).

**So this plan is everything ELSE** — turning a beating heart into the whole organism.

---

## The gap, in one breath

The loop works, but the app still **feels like two apps stitched together**: the gorgeous new calendar/bento/tracker sit *on top of* the old self/day/grow tabs, virtue tree, mood-weather, RPG character sheets, and old picker sheets. The redesign's own #1 stated failure (§4) — *"every menu looks different, so it feels like a pile of unrelated screens"* — is still true at the chrome level. And the three biggest **new pillars** the brief promises don't exist yet: **long-term Goals**, the **identity Mindmap**, and the **two-tier Brain**.

---

## Phase A — One app, one chrome (SUBTRACTIVE · unblocks everything) ⭐ DO FIRST

**Goal:** kill the second app. Make every surface wear the **one notebook skin** (§4) and live in the **locked home layout** (§13). This is the highest-leverage move because every later screen has to live in this chrome — build them first and you re-home them later.

**Ships:**
- **Delete dead code** (zero-risk, verified unreferenced): `pickOne`, `radialMenu`, `subtaskSheet`, `SUBTASKS`/`subtasksFor`.
- **Remove the old vision's surfaces** (HANDOFF #4): the `#t-self` clutter — mood-weather (`renderMood`), hero proactive card (`renderHero`), quick-wins (`renderQuick`), **virtue tree** (`virtueTree`/`#tree`); the old RPG **`charSheet`/`surveySheet`**; the old **`nowSheet`/`planSheet`** picker flows (the bento replaced them); any Spark **multiplier shop** (`UPG`/`gMult`/`buyUpg`) if still present. *Audit each read-site before cutting; preserve any data the redesign still needs (mood log, occupation).* 
- **Re-home onto §13:** world full-screen (stays) · **top** = live tracker (done) · **bottom-right = THE notebook button** — the one door to `Plan · Track · Care · Garden · Stats · You`, one chrome, one ✕ (§13b) · **center fairy → identity/stats** (§13) · twin sticks stay.
- **One panel skin** reused by every notebook page + every sheet: same header placement, same ✕, same tile grammar (the bento card *is* the reference skin).
- **Persistent HUD** (§4, mockup 005): streak pips + spark bar + mood orb, one-thumb, zero-white.
- **Redo-setup button** (HANDOFF #1): a "redo setup" entry in settings/You that calls `onboard()`.

**Brain?** None — pure structure. **Risk:** cutting a function the redesign quietly depends on → grep every read-site first; ship behind a commit so it's revertible.

---

## Phase B — The living plan (DETERMINISTIC · the Tier-1 "genius without a brain")

**Goal:** make the plan a **reflowing queue, never a pass/fail schedule** (§23) — the logic the calendar UI is already drawn for.

**Ships:**
- **Open-app fork** (§11/§12): the explicit *"Plan ahead?"* vs *"Just start tracking?"* moment (reactive = base points, planned = bonus — the incentive gradient).
- **Always-offer-next:** the next planned activity surfaced as the **hero 1-tap** in the switch/pull-down (getting "back on plan" is always one tap).
- **Drift pauses & pushes forward:** drifting from a planned item **slides it later** in the queue instead of failing it; hatched "pushed-forward" bubbles queue after NOW.
- **Conscious-rest / "plan a break"** (§23, mockup 008): pick *any* activity + set a **duration** → it **inserts at NOW and the rest reflows** → streak stays safe. The distinction the whole product turns on: **conscious & planned vs unconscious drift** (not productive vs leisure).
- **Time-pressure pruning:** as the day runs out, items that can no longer fit **fade/strike-out / suggest-remove** (drift all day → "Shower" eventually drops).
- **Edit-the-past** (§23, mockup 038): tap a past block (pencil) → *"what were you really doing?"* mini-bento + stretch the time → it cancels the wrong assumption, re-sequences, re-offers next.
- **Journal layer** (§14·5): tap a block → add a note; a light **EOD reflection**.

**Brain?** All deterministic (this is the free floor §19). Brain *supercharges* it later in Phase E. **Risk:** the iOS-smooth drag/reflow is sacred — make `preview()` reuse `reflow()` ordering so "what you drag is what you get," and test under thumb before each change.

---

## Phase C — Goals & long-term planning (NEW PILLAR · §16, mockups 009/010) ⭐ your next big ask

**Goal:** put **all your goals on digital paper, perfectly organized**, and let the app **schedule your future** down into daily bubbles + **audit** your movement (Cal Newport's lifestyle-auditing).

**Ships:**
- **Goal map** (mockup 010): per-domain goal cards (Artist · YouTube · Design business · Health · Finance) seeded from onboarding `S.goals`; a **few active** goals highlighted, the rest in a **holding tank** (§17 cap-don't-accumulate).
- **Decomposition** (mockup 009): grand goal → mid milestones → week/month steps → **daily actions**, with the app **recommending WHEN** to drop each subtask onto the calendar (dated hatched bubbles flowing into Phase B's queue).
- **Two modes for every step** (§20): **FREE guided-manual** — a first-principles worksheet that walks *you* through decomposing it (tap-first); **PAID auto** — the brain does it for you (Phase E). Same capability, you pay for *labor* not *ability*.
- **"Learn a skill" goal type** (§18): decompose → tiny 2-min daily rep → identity → satisfying reward → compounds.
- **Life-audit chip:** day-to-day movement toward each active goal (depth/completion-ratio, never volume — §17).

**Brain?** Works deterministically from templates (Tier-1); the brain fills the template with *your* specifics (Tier-2). **Risk:** goal sprawl — enforce the active-cap + holding-tank so "capture everything, activate little" (§17).

---

## Phase D — Identity: the "see your life" mindmap (NEW PILLAR · §21, mockups 017/018)

**Goal:** the **habit-mindmap life-portrait** — tap the fairy (center, §13) and see *who you're being*: your habits as a living, clustered map (good ones blooming, vices dim/thorny but **shown honestly**), sized by **fundamental × frequency**.

**Ships:**
- The radial/tree life-map (SVG/canvas): "you" at center, 8-domain hubs branching, bubbles sized by importance×frequency (compressed range — even the smallest stays a comfy tap target).
- **Same bubbles as the bento, second lens:** Bento = pick-fast (done), Mindmap = reflect-deep identity view (this phase).
- Replaces the deleted virtue tree as the character/identity screen.
- Identity-vote reinforcement (§18): "every action is a vote for who you're becoming."

**Brain?** Layout is deterministic; the brain can *narrate* the portrait (Phase E). **Risk:** highest *rendering* complexity in the plan — ship a legible static map first; defer fancy growth animation.

---

## Phase E — The two-tier brain, done right (§19, mockup 011) + wisdom library + monetization (§20, mockup 012)

**Goal:** intelligence that **applies the app's wisdom, never invents it** — a thin retrieval/application layer over structured knowledge, *not* a chatbot. (Same architecture as your fieldguide & magic KBs.)

**Ships:**
- **Reframe `askBrain`** from a one-off "ask my brain" into the **7 application points** (ranked §19): onboarding mapping · goal decomposition · scheduling · adapt/replan · daily nudge · life-audit · pick-the-tiny-version/habit-stack.
- **Structured wisdom library** the brain retrieves from: Newport caps & anti-volume rewards (§17), Clear's 4 laws / 2-min / never-miss-twice / habit-stacking (§18), decomposition templates (§16), time/energy heuristics. Atomized + cited, never hallucinated.
- **Free guided-manual vs paid AI** for *each* point (§20) — the freemium spine.
- **BYO-key** (local-only, **never stored/echoed/transmitted**) + the hosted-subscription framing; the two-tier (011) + monetization (012) screens.
- **Graceful degradation:** brain off → app fully usable; brain on → magic.

**Brain?** This *is* the brain. **Risk:** never let it become an oracle — every output must trace to an app-defined principle/template; always render the deterministic fallback first, fill in when the model answers. **Never store or echo a key.**

---

## Phase F — Complete & polish (mixed)

**Goal:** finish the long tail so nothing reads half-built.

**Ships:**
- **Multitask / concurrent tracking** (§26, mockup 044): "+ also doing…" second timer; retroactive overlap; calendar **slim secondary bars + "⧉ N overlaps" badge**. (Engine already stacks `S.timers`; this is the UI.)
- **Celebration depth** (§14·3): escalating tiers past red — **EPIC → SUPER-EPIC → LEGENDARY** (color+texture progression), richer particles; combo multiplier on consecutive on-plan blocks.
- **Week/Month calendar restyle** (§14·4): `weekGrid`/`monthGrid` onto the 8-domain `DOM` palette + holographic plan treatment; the day→week→month zoom story.
- **World/garden growth** (§10): seed the island from the onboarding blueprint; grow it with consistency (secondary — never in the way).
- **Palette confirm** (§8): decide between the shipped §24 set and the "refined softer/creamier" §8 set, applied app-wide.

**Brain?** Mostly deterministic. **Risk:** scope creep — this is a grab-bag; pull items forward only when they block the felt experience.

---

## Sequencing logic & the highest-leverage path

```
A (one chrome)  →  B (living plan)  →  C (goals)  →  D (mindmap)  →  E (brain)  →  F (polish)
   unblocks all     completes spine    new pillar     new pillar      supercharge    finish tail
```

- **A before everything** — every screen must wear the one chrome; building C/D/E first means re-homing them.
- **B before E** — the brain *supercharges* the reflow/adapt logic; that logic must exist deterministically first (§19 floor before ceiling).
- **C before/with D** — both read the same goal/habit data; goals give the mindmap its meaning.
- **E after C+D** — the brain has the most to apply once goals + the life-portrait exist.
- **If you want the fastest felt win:** A (it instantly makes the app feel like *one* product) → then the conscious-rest "plan a break" beat of B (it's the moment the streak-safety promise becomes real).

## Hard constraints (never violate)
$0 static vanilla-JS · mobile one-thumb iPhone · **TAP not type** (type only as the explicit add-new fallback) · **ZERO white** (`#fff2f9`/`#160510`) · candy on dark hot-pink/berry night · bold `#160510` outlines · Jost 600-700 · Tabler icons · **"less machine, not more"** · mockups are LAW (1-to-1) · **never store/echo a key** · ship after preview-verify (`fresh.html`).
