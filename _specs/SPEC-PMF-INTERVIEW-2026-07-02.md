# ALTER — PMF Spec (from the founder interview, 2026-07-02)

*Product of an 11-question adversarial founder interview. This is the company-shaped spec: positioning, laws extracted from David's own answers, the July-8 ship scope, the business shape, and the three deaths. Companion to SOUL-OF-ALTER.md (the soul) — this doc is the market.*

---

## 1. POSITIONING — the company in three sentences

**ALTER is the self-help app that works at rock bottom.** Every incumbent (Heroic, Headspace, habit trackers) implicitly requires a functional, motivated user — Brian Johnson's 300-day course talks to people already climbing. ALTER is built for the person still *in* the rut: messy room, no energy, joint in hand — and it meets them there without shaming them, then baby-steps them into flourishing.

**The real competitor is not another app. It's the vice** — pot, the phone, the nap — whatever wins the 3pm/9pm moment of choice with cheap, instant, reliable state-change. ALTER's counter is not willpower; it's a cheaper door (8-second floors, zero-thought guidance) and a compounding relationship (being known).

**The moat is the chronicle.** Coins and streaks decay because they're rewards; *being known 34 days deep* compounds. A fresh install of any competitor knows nothing. Retention = the app quoting your own history at the exact right moment.

---

## 2. THE LAWS (extracted verbatim from the interview — these are constitutional)

1. **The app must never want it more than you do.** (The Allen Carr law.) The moment it wants your quitting/cleaning/growth more than you do, it becomes your mom, you lie to it, then you delete it. No quit-pressure, ever. The app is a mirror held steadily, not a missionary.
2. **Earn in reality, spend in the game.** The game has NO mint. Watering pixels costs coins; only real-world action creates them. Structurally rigged so the game cannot out-reward life. (Tube simulator with the polarity reversed.)
3. **Reward magnitude scales with AVOIDANCE, not effort.** Pick 2 things off the floor = coin. Clean the long-avoided room = big. Send the portfolio to curators = jackpot. The app pays most for the thing you've been running from. (This merges the loot system and the boss system into one economy.)
4. **Track before plan.** Day-one loop = tracking ("what are you doing right now? tap it") — passive, zero-failure, feeds the mirror. Planning demands executive function the rut-user doesn't have; it's a level-up you *earn*, not a front door.
5. **Early journey IS the onboarding.** No settings quiz. The first journey nodes silently profile (energy, blocker, messiest room) while feeling like play. The app takes charge — guided every step, never a wall of menus.
6. **The duo, not the community.** Sister's addiction to a mediocre spot-the-difference game = teams/events. Social gravity beats mechanical dopamine. The one-dev version: a two-person pact — shared/visible gardens, your real-world coins water it. Also solves founder dogfooding (David + sister = duo #1) and onboarding (you arrive with your person already inside).
7. **The pact.** At onboarding the app asks one promise: *"never lie to me — this only works if you tell the truth."* Mirror pact for the founder: **use before build** — the code editor doesn't open until today is tracked in the app.
8. **The vice ledger — log without confession.** Track the joint/bottle/scroll with zero moralizing (Carr: keep smoking while we talk). Drifting-while-tracked beats drifting blind. Logging entry #5 on a bad week must feel like a *win* (data! self-knowledge!), never a confession — the day the number shames you is the day you stop logging (the MyFitnessPal death).
9. **Front doors are per-persona; the vision doesn't generalize, the doors don't either.** David's door = the burning timeline + grimoire. Sister's door = "tell me how to declutter without thinking" + works at zero energy. Same engine, different first 90 seconds.
10. **Rare gold on a matte world.** Fortnite dopamine on a Hawkins leash: the shiny coin hits harder *because* the world is calm and matte. Loot-feel is allowed; brightness inflation is not.
11. **Sell beauty, never progress.** (Monetization integrity — see §5.) Money can buy cosmetics for the garden; it can never buy coins, XP, or skill. Progress is only mintable by living.

---

## 3. THE FIRST 90 SECONDS (the TikTok hook — a completed loop, not an animation)

1. **Showman open.** Big, friendly, cheeky — the app talks TO you like a clever friend/salesman. Kills the current small ugly "hi I'm your guardian angel" text. Plants the placebo seed (Dispenza): *this app gives you powers if you use it. It is no joke.*
2. **The pact.** "One rule: never lie to me." (Signature moment — thumb-press, whatever. Make it felt.)
3. **One profiling beat disguised as play** — energy? biggest mess? (feeds Law 5).
4. **Smallest real task ever.** "Pick two things up off the floor. I'll wait."
5. **Instant shiny reward** → **spend it immediately**: plant one seed in the garden, watch it open.
6. Done. Loop closed, under two minutes, real-world floor slightly cleaner, dopamine honestly earned.

## 4. JULY 8 SHIP SCOPE (sister build — three fixes, everything else ships as-is or hidden)

- **FIX 1 — Front door rewrite** (§3 above).
- **FIX 2 — The 90-second loop** (task → coin → seed; the garden's first plot).
- **FIX 3 — Hide the planner.** Full plan-your-day is REMOVED from her build. She tracks, baby-steps, gardens. Planning unlocks later.
- **Founder hand-onboarding:** David pre-loads her profile by hand (name, messiest room, 3 habits) — Airbnb-photographer style. Manual > adaptive, at n=2.
- **Later column (explicitly NOT July 8):** pirates, ship battles, island conquest, Mermaid-palace memory, Maltz happy-place designer, community/events, screen-time integration (a PWA will never get the iOS Screen Time API — do not let it sit load-bearing), the game-art overhaul.

## 5. BUSINESS SHAPE

- **Model: free with paid depth** (Fortnite-shaped), constrained by Law 11 (sell beauty/depth, never progress) and by the graduation thesis. NOTE the resolved contradiction: a subscription that succeeds when you stop needing it is a suicide model — so avoid pure subscription; lean one-time depth packs / cosmetics / patronage ("keep the guardian alive"). A graduated user who *loves* the app is a word-of-mouth engine and a gifter, not a churned sub.
- **Distribution: content-led.** David's YouTube (exists, 1 video) + UGC + organic; the app itself is the content mine (the chronicle, the bosses, the garden are all screenshot-able stories). Crowdfunding optional later; paid marketing only after organic signal.
- **December metric — the one number: day-30 truth-tellers.** Users who, 30 days after install, are still logging honestly (incl. vice entries) AND completed ≥1 real-world avoided-thing that week. Not downloads, not DAU. 300 installs would blow David's mind; **30 day-30 truth-tellers** would prove the switch flips. Willing-to-pay is the confirmation signal on top.

## 6. THE THREE WAYS THIS DIES

**Death 1 — The founder never ships (most likely).** Building is David's procrastination-of-record: every hard reality-contact question (usage, ship dates) converts into a design idea, because design is safe and dates are exposed. The app's biggest dependency isn't iOS — it's the builder's own drift, and the product exists to cure exactly the disease its builder has. *Mitigations already committed: July 8 to sister (dated, falsifiable); the founder's pact (use before build); the duo (witness).* If July 8 slips silently, treat it as the fire alarm it is.

**Death 2 — The game becomes the vice (or stays too weak to matter).** A knife's edge. Slip left: economy polarity erodes (in-game actions start minting, novelty content chases engagement) → gorgeous virtual garden, still-messy real room, great retention charts, total mission failure — a slot machine with a halo. Slip right: reward-never-shame + no-mint + matte world makes the game boring against Fortnite and pot, and nobody stays for the chronicle because nobody stays at all. *Guard: Law 2 and Law 3 are non-negotiable; the fun must come from real-life wins rendered beautifully, and the day-34 retention handoff (coins → being-known) must actually be built, not assumed.*

**Death 3 — n=1 doesn't generalize.** "If it helps me it'll help everyone" is the most expensive sentence in startups — and sister already falsified it gently: the second-ever user needs a different front door. Failure mode: content marketing brings strangers the product can't yet serve; onboarding can't hand-build itself for user #10 the way David can for user #2; day-3 churn everywhere; the app remains a magnificent personal artifact wearing a company's clothes. *Guard: every persona gets a front door before scale (Law 9); the four-persona readiness test is the gate for ANY marketing push; watch sister's day-3 and day-30 like a hawk before spending a ruble on distribution.*

---

## 7. WHAT THE INTERVIEW REVEALED THAT NO ONE SAID OUT LOUD

The founder's disease and the user's disease are the same disease — drift, avoidance, the cheap dopamine outbidding the meaningful act. That's not a liability to hide; it IS the founder-market fit. David is not the guru on the mountain; he's the guy in the rut building the rope. The app that gets *him* to clean his room, honestly logged, is the app. Ship the rope.
