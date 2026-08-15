# BOOKS DEV CANON — the 7-book synthesis (Fable analysis layer)
**Date:** 2026-07-18 · **Sources:** `_books/dev/briefs/*-BRIEF.md` (Refactoring UI · Don't Make Me Think · Badass · Actionable Gamification/Octalysis · A Philosophy of Software Design · Game Feel · The Art of Game Design). Read the briefs for full frameworks; this doc is the cross-book verdict wired to ALTER's actual build surfaces.
**Standing rule:** constitution outranks books; several books independently CONFIRM constitution laws, which upgrades those laws from taste to evidence.

---

## PART 1: CONVERGENT LAWS (independent books agree)

1. **The 100ms law.** (Swink: first perceptible reaction in 70-100ms, 240ms = control broken · Schell: 0.1s interface rule · Krug: effort-per-click.) Every touch must show SOME visible change within ~100ms (glow, shadow-shift, scale-tick) even if the full animation resolves later. This is a testable device-gate, not taste.
2. **Teach by doing at the moment of need; never lecture.** (Sierra: JIT beats JIC, perceptual exposure beats explanation · Krug: self-evident beats explained, cut the words in half twice · Octalysis: 4-second rule, Glowing Choice · Schell: build the toy first.) Journey stones and guardian lines teach through the action; prose about the action is debt.
3. **Never punish; make the miss-state as crafted as the win-state.** (Schell: reward beats punishment, Diablo reversal · Swink: delightful failure, scoring floor never zero · Octalysis: NEVER state the bad behavior is common (Petrified Forest: theft sign tripled theft) · Sierra: users quit because nobody told them struggling is normal.) Four books independently validate our core law AND extend it: missed-day and empty states get the same craft budget as celebrations; "Just Tell Them" honesty copy at every friction point.
4. **Hierarchy by de-emphasis; systems defined in advance.** (Refactoring UI: soften the competition, don't inflate the hero; 9-level ramps, 5-level shadow ladder, nonlinear spacing scale · Krug: trunk test · Schell: channels of information.) The design system becomes explicit tables, not vibes.
5. **One deep mechanism, never parallel systems.** (Ousterhout: deep modules, special-general mixture red flag, History/Action pattern · Krug: ONE persistent nav grammar · Refactoring UI: design-by-elimination with 2-3 visibly distinct variants.) This is the menu-unification recipe, book-grade.
6. **Intrinsic wins; never price the relationship.** (Sierra: identity motivation, brand-engagement competes with real progress for ONE cognitive pool · Octalysis: overjustification effect, social-vs-market norms collapse is irreversible, White Hat must own the endgame · Schell: judgment must be fair.) Charge stays cosmetics-only; guardian and streaks never get "worth $X" language; no dollar framing near the relationship.
7. **Retention = the next narrow skill, not the streak.** (Sierra: the A-board is never empty; experts always have a next edge-skill · Octalysis: Endgame needs its own White-Hat design · Schell: Elders need a DIFFERENT game: teaching, creation, depth.) This is the mechanical engine under our "guidance matures, never hands over" law.
8. **Test tiny, monthly, silently; label what kind of test it was.** (Krug: 3-4 users once a month, recruit loosely, kayak-problems vs head-slappers triage · Schell: QA ≠ usability ≠ PLAYTEST (does it produce the intended feeling); watch faces not screens · Sierra: verify behaviorally, never by asking.) Our four-persona gate gets cadence, triage language, and the constitution's "boots clean in preview" line is formally QA-only.

## PART 2: CONCRETE BUILD DELTAS (mapped to real surfaces)

**Gesture/feel (the regression zone):**
- Charge-hold feel spec: short CURVED attack (never linear, never long), deliberate release choice (mirrored = soft, cut = crisp), shadow-lift on hold (two-shadow technique, tight shadow fades with elevation), squash-stretch exaggeration on land, ONE sound cue per charge/celebration beat (Swink: sound alone flips perceived physics; we already have the Web Audio engine).
- 100ms first-feedback + 4-second "what do I do here" checks become named criteria in the device-test protocol.
- Predictable-results audit before any new gesture: if tap/drag/hold can race on one element, kill the race, don't ship it as rare.
- Harmony audit: every new effect must sit at the cel-glow iconic abstraction level; reject effects more realistic OR more cartoon than the system.

**Journey/stones:**
- Each stone = deliberate practice: ONE narrow sub-skill, felt competence in a single session, else split the stone (never lengthen it).
- Stones get describable "special move" shapes (Mario 64 wall-kick model): fixed preconditions, repeatable arc; DO precedes NAME.
- Add a "you are here" self-assessment (can I do X reliably in real life), distinct from the progress bar.
- The post-stone-1 roadmap = the A-board queue: always one next narrow skill just past the user's edge.
- Elegance test on every stone element: serves fewer than 2 purposes = cut or merge.

**Onboarding/first day:**
- Copy pass: halve the words, then halve again; kill happy-talk; front-load verbs ("Charge by doing").
- Day one shows 2-3 real choices max (Evolved UI); no social/sharing asks before the First Major Win-State; instrument minutes-to-first-win.
- Interest-curve audit on the first-run liturgy: early hook, small win, one climax, residual pull.
- Empty states (planner, journal, tracker) = designed moments; hide chrome until content exists; endowed-progress touch where honest.

**UI polish system:**
- Formalize in `index.html` `:root`: 9-level shade ramps per hue + grey ramp, nonlinear spacing scale, 5-level shadow-elevation ladder (rest/hover/held/dragged/modal).
- Audits: no grey text on colored chips (hue-matched ink instead); icons never scaled past ~2x native (wrap in container); within-group spacing < between-group spacing.
- Trunk test the tools front door and tracker; Big-4-questions audit on App Store screenshots (What is this / Why am I here / What can I do / Where do I start).

**Monolith debt (app.js):**
- Menu unification = Ousterhout's History/Action split: ONE deep modal/stage mechanism, surfaces plug in as content. Design twice: 2-3 visibly distinct lo-fi variants in chat, David picks, then build.
- Wipe-site war: reduce by finding the deep render module that owns each region's knowledge once; new wipes = information-leakage red flag (the ratchet already counts; this names the fix).
- Timeline special-cases: model "no plan yet" as a real zero-length block (define the special case out of existence) to shrink the gesture regression surface.
- Naming audit: grep `item/data/block/state` reused with different meanings across @SEC regions (the 6-month Sprite bug pattern).
- Interface comments at every @SEC boundary (summary, args, side effects, preconditions) = the 10-20% design investment with the highest payoff in a 2,600-function file.

**Honest-gamification integration (with the business canon):**
- Octalysis self-audit: ALTER concentrates CD1/CD2/CD3 (meaning, accomplishment, creativity) and deliberately keeps CD6/CD7/CD8 near zero. That concentration is CORRECT design (two drives at 9 beat eight at 1), not a gap.
- Black-Hat checklist as a shipping gate for any monetization/engagement idea: no torture breaks, no sunk-cost prison, no dangling pay-to-skip dual paths, no manufactured caps.
- Conformity-anchor copy law: never imply missing days is common; frame consistency as the visible peer norm.
- Guardian hard-truth pattern: White-Hat → honest urgency → White-Hat close (never leave the user in the anxious state).

## PART 3: PROCESS UPGRADES

- **Testing taxonomy in handoffs:** label each verification as QA (boots, no errors), Usability (persona finds the thing), or Playtest (the feeling landed). "Boots clean in preview" = QA only; the constitution's device-honesty rule now has Schell's vocabulary.
- **Persona cadence:** 3-4 testers, monthly, silent observation, immediate debrief; triage kayak-problems (self-corrected stumbles: ignore) vs head-slappers (fix). Feature requests from tests = probe why, don't build (Mom Test crossover).
- **Design-it-twice** for any nontrivial surface: two genuinely different sketches before committing (cheap on Fable/chat, expensive to skip).
- **Accessibility low-hanging fruit** into build hygiene: aria-labels on icon buttons, logical DOM order, keyboard operability. Krug: fixing confusion helps everyone; it is also the a11y win.

## PART 4: OPEN DECISIONS FOR DAVID
1. **Sound design for charge/celebration:** greenlight a small sound pass (ticks, chimes, seal-thunk)? Highest-leverage cheap feel upgrade per Swink; we have the Web Audio engine idle.
2. **Menu unification scheduling:** the books turned it from "debt" into a recipe (one deep mechanism, 2-3 variants, David picks). Schedule as a dedicated Opus run?
3. **Stone self-assessment ("you are here"):** add to the journey spec now or after stone 1 ships?
4. **:root scales formalization:** fold into the next UI-touching session (cheap, mechanical)?

**Next:** both canons (business + dev) now exist. The v3 mom + investor deck planning session (Fable) draws on: INVESTOR-PITCH-MOM v2 + BOOKS-BUSINESS-CANON + this doc's honest-gamification language + David's answers to the open decisions. Opus builds. Mind-books shelf (Yapko, Eason, Robson, Xygalatas + optionals) pending purchase for fleet three.
