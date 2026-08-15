# ALTER BUSINESS MASTERPLAN — build, launch, sell
**Date:** 2026-07-11 · **Who:** David (solo dev) + Claude (full team: builder, marketer, strategist, copy machine) · **Constraint set:** near-zero cash, Claude budget drops to $100/mo tomorrow, product ~85% built.
**Sources:** FOUNDATION-PITCH-2026-07-11.md (positioning, locked) · balance marketing KB (Ava methodology, 134 refs) · 5-thread web research 2026-07-11 (payments/legal, organic social, crowdfunding, launch surfaces, AI workflows), all claims cited or flagged.
**Companion:** the newest TRACKER-HANDOFF owns build-state details. This doc owns the business.

---

## 0. THE STRATEGY IN ONE PARAGRAPH, AND THE HONEST NUMBERS FIRST

Finish the MVP in ~6 weeks. Sell from the PWA with Stripe web checkout (0% Apple, launchable immediately). First money = a self-run founding-member lifetime deal. Distribution = three parallel engines started on day one: the Ava content machine (slow, compounding), Reddit value-first credibility (medium), and a one-week multi-surface launch event (fast, one-time). Ride the two calendar waves the category actually has: Black Friday and January 1st.

**The base rates, stated plainly (dad's research law applies to our own plan):** the modal first-90-days outcome for an indie wellness app is $0. Well-executed comparables sat at $28-100 MRR at day 90 (Habit Pixel, month-by-month, self-reported). No wellness app in the public record hit $1K MRR inside 90 days; 6-9 months is the honest band, and Habit Pixel's inflection came from a self-run Black Friday lifetime deal and the January wave. **Our plan is designed to beat the base rate (assets the base-rate cases lacked: zero marginal cost, a built product, a content methodology, four in-house test users, a second language), but the target that keeps us honest: first $1,000 CUMULATIVE by day 60-90 via the founding deal, $1K MRR by month 6-9.** Anything faster is upside, not the plan.

---

## 1. THE MVP LINE (make the store description true, nothing more)

**IN (blocks launch):**
1. **PM close** (read the day's charge → one observation → seed tomorrow). The biggest gap; dad's thesis + Newport mine both point here. EVIDENCE: the loop-not-bundle retention finding (teardown).
2. **De-game subtraction pass** (confirmed direction: charge + cosmetic/unlock economy only, cut world-as-side-game).
3. **First-day polish** per FEEDBACK-FIRST-DAY (the store visitor's first session must deliver the loop once).
4. **Journey stone 1 complete** (+2 stones post-launch is fine; the ladder must visibly exist, not be finished).
5. **Payment rails**: Stripe Payment Links + a premium flag in state. (Stripe = 2.9%+30c, works with SSN, no LLC. If global tax handling wanted later: Stripe Managed Payments, 5%+50c, MoR. EVIDENCE: thread-1 research.) **Design note the NotebookLM pass exposed:** ALTER has no accounts (localStorage only), so the unlock mechanism = a signed license key delivered on the Stripe success page/email, redeemed in-app, offline-verifiable. One session to build; decide key-vs-restore-code UX then. No backend, no SSO needed. **Security note (founder-mining pass):** the key MUST use asymmetric signing (app verifies with an embedded PUBLIC key; the private signing key never ships in client code): client-side JS is readable, so any secret-based scheme is forgeable by inspection. Proportionality: with no server and no user data leaving the device, ALTER's real attack surface is tiny; key forgery by a determined reader is an acceptable loss, not a launch blocker. No paid security review needed at this scale.
6. **Landing page + Science page** (every tool → protocol → citations; the "feel safe" asset; the category's 2%-have-evidence stat is the moat).
7. **Four-persona device test gate**: sister, brother, mom (RU), girlfriend each complete day one on their own phones, watched silently. No launch until all four pass. EVIDENCE: the readiness-test law + "one real second user" meta-finding.

**OUT (post-MVP, do not touch):** spiritual canon ladders, ritual engine, life-state twin, ElevenLabs voice, boss fights, week-3 mirror, n=1 lab (v1.1: it unlocks the "study runs on you" copy), chronicle depth, App Store wrap (see §2).

---

## 2. DISTRIBUTION + PAYMENTS (the decision, dated)

**PWA-first with Stripe web checkout. Do not build the App Store wrap yet.**
- As of this week a US iOS app can link to web checkout with **0% Apple commission** (Ninth Circuit reinstated the 0% interim rule Apr 2026; SCOTUS declined the stay May 2026; rate-setting remand ongoing). It is REAL TODAY and EXPLICITLY UNSTABLE: a "reasonable commission" may be set late 2026/2027. Re-verify before each major decision.
- The one controlled study (RevenueCat x Dipsea, n~12,500) found IAP converted BETTER than web checkout even net of Apple's cut. So the rush-to-native case is weak both ways: the store adds cost and review risk now, and if we ever go native, IAP may simply be fine (Small Business Program = 15%).
- Capacitor wrap reality: ~1-3 weeks for a clean listing (a gratitude-journal PWA did it in 1 week, zero rejections), Guideline 4.2 risk if it looks like a wrapped website. **Trigger to revisit (widened 2026-07-11 per NotebookLM pass):** $500+/mo revenue, OR the Apple remand resolving, OR a visible growth stall attributable to install friction. EVIDENCE: Amplitude wellness benchmark: 74% of health/wellness users access via native apps vs 26% web (the inverse of SaaS), so the category has high app-expectation; PWA-first is right for our direct-link channels (Reddit, content, personas) but the store checkpoint must watch for friction-stall, not just revenue.
- **If/when we do wrap: dual-option paywall** (IAP one-tap + a "save 30% on web" link), not IAP-only and not web-only. EVIDENCE: RevenueCat/Dipsea Variant C (both options offered) had the highest trial conversion of all variants (28.2% vs 27% IAP-only vs 18.1% web-only); web-only's ~33% trial-start drop cost 6.5% net revenue despite fee savings. (App→web friction only; on the pure PWA, web checkout IS the native medium.)
- ALTER's structural edge: offline single-file PWA = near-zero marginal cost per user, which makes lifetime pricing unusually safe (the AppSumo horror stories are servers-forever-for-one-payment; we have no servers).

---

## 3. THE MONEY MODEL (from FOUNDATION-PITCH §6.5, unchanged, plus the launch mechanic)

- **Free** = the transformation: the full core loop + base tools, forever. (Finch proved honest-free wins the category.)
- **Premium (the pasta)** = depth + expression: upgraded meditations/depth content, cosmetics, the guardian-knows-you layer.
- **VIP (the steak)** = the bespoke guardian tier (voice, BYO-AI brain). Real value, honest anchor.
- **Earned unlocks**: quest-is-your-own-plan tastes of premium (gift-with-a-horizon framing, no countdowns).
- **THE LAUNCH MECHANIC: the Founding Member lifetime deal, self-run, in TRANCHES.** Tranche 1: first ~30 members at $49. Tranche 2: next ~40 at $69. Tranche 3: final ~30 at $99. Honest by construction (earliest believers genuinely get the best price; no fake scarcity, the ladder is published upfront) and it fixes the undercharging failure mode: EVIDENCE (notebook founder-mining 2026-07-11): undercharging = the most-repeated pricing regret (57% revenue left on table); Coconote's price raise to $129 = "magical" revenue jump; zero price resistance in tranche 1 = the documented week-4 signal to let the ladder work.
- **VIP tier: seat-capped.** The bespoke guardian tier is limited to ~10-15 seats at launch, priced to pay for the founder's time ($199+). EVIDENCE: the free-tier/VIP support-drain failure mode (Snipcart: 80% of support consumed by non-payers); a solo dev's time is the scarcest asset in the whole plan.
- **First-50 concierge rule:** every founding member gets personally onboarded (a message, a check-in, watch them break things). EVIDENCE: the quit-point analysis: founders who pushed through manually onboarded their first ~50 users and treated breakage as market research; it is also where testimonials and the first real reviews come from. **Add regional (PPP) pricing from day one** (Stripe adaptive pricing or a parity tool): EVIDENCE: Habit Pixel reported PPP pricing immediately unlocked sales in Southeast Asia and Latin America that were "basically dead" at flat US pricing; also synergizes with the RU lane (the full RU translation already exists). EVIDENCE: Habit Pixel's self-run 40%-off lifetime event was its single best growth month (MRR $208→$407); self-run keeps ~97% vs AppSumo's 25-30% payout with 24-30% refund rates. AppSumo itself: REFUSED.

---

## 4. THE MARKETING MACHINE (Ava methodology, first real deployment)

The balance KB holds a complete short-form growth doctrine (never yet run live; ALTER is deployment #1). The founder playbook applied:

**Content mix: 50-75% AUTHORITY + 25-50% JOURNEY, daily, batched monthly.**
- **AUTHORITY pillar** = teach the techniques (myth-busts, do-vs-don't, comparisons, tutorials on habits/planning/focus/breath). The script bank already exists: the gated copy lines, the fieldguide KB, the Newport/Johnson mines. Format per 2025-26 research: **faceless slideshow/carousel posts now dominate** (static slides, text overlay, hook cover); "talking-head is dead" (Ava) and ALTER's UI IS the B-roll (charging timeline, tools running, pixel world).
- **JOURNEY pillar** = build-in-public: progress updates, "what I learned," metrics, the dad-feedback story, the solo-dev-with-AI story. Starts NOW, pre-launch, zero cost. NOTE the founder-face finding: the best-documented indie wins came from founders on camera (Chatbase founder: faceless AI content is saturated, "a blue ocean for founders willing to be the face"). Recommendation: David's face on the journey pillar (even 20% of posts), faceless for authority. David decides his comfort line.
- **Mechanics (the 11 golden rules, condensed):** research outliers first (5x rule), never invent formats; hook stack in first 3s (verbal+written+visual); 7-factor decomposition; series content (#1 growth trait: e.g. "building the planner that never punishes you, day N"); 90/10 mix for new accounts; double down on own outliers by swapping ONE factor; profile checklist.
- **The VSC audit (added from NotebookLM pass 2):** every format gets judged Viral / Scalable / CONVERTIBLE, and convertible has one observable signal: comments asking "what app is this?" A format with views but no what-app comments gets dropped regardless of view count. Slideshow evidence supporting the authority-pillar format choice: TikTok slideshows outperform video for educational niches (16% higher completion, 64% higher saves; users control reading pace, which suits technique-teaching).
- **Cadence + honest timeline:** daily posts (IG + TikTok + Shorts, same vertical asset), batched in ONE ideation session per month (Ava's month-in-60-minutes discipline, fits the $100/mo protocol). EVIDENCE on expectations: every named comparable (Feynman AI, Post Bridge, Go Viral App) took 2-3 months of daily posting to first traction, 6-9 months to real MRR. Multi-account volume beat single-account virality in every named case. Finch is NOT an organic comp (610+ active paid ad creatives found; its organic is a brand layer).

**Reddit protocol (the medium engine):** weeks 1-3 = genuine participation ONLY in r/ADHD, r/productivity, r/getdisciplined, r/DecidingToBeBetter (answer real questions, zero links, manual rules-check per sub before anything). From week 4: the 70/30 rule (70% pure help, 30% product mentioned only when directly relevant, always story-framed). EVIDENCE: the documented case: 60 customers in 45 days, ~20% click-to-trial, ~30% trial-to-paid, zero ad spend, zero bans, after being banned twice for doing it the promotional way. r/selfimprovement = NEVER (total self-promo ban, confirmed). r/SideProject and r/IMadeThis = founders not customers, skip.

**The micro-tools funnel (the sleeper lever nobody else in the research had):** SiteGPT's founder drove 90% of organic traffic via dozens of tiny free AI-built tools funneling to the main product. ALTER already CONTAINS the tools: publish standalone free pages (a box-breathing timer, a PMR guide, a shutdown-ritual checklist) at the GitHub Pages domain, each with one line: "from ALTER." They are shareable in places where an app pitch is spam (Reddit: sharing a free no-signup tool ≠ self-promo in most subs, verify per sub), they build SEO, and the code is already written in app.js. Cost: one session per tool page. **Before building each page, keyword-check it** (low-difficulty, real-volume terms like "box breathing timer"): free tiers of Ahrefs keyword generator / Google Keyword Planner suffice, no paid tooling. EVIDENCE: the free-tools playbook (NotebookLM pass 2026-07-11) targets difficulty <10, volume >1,000 terms; the principle (build tools people already search for) matters more than the exact thresholds. **Anti-distraction cap: 3-5 pages max until one shows search or share signal.** SiteGPT's 50+ tools was his scale at his stage; ours is a side lever, never a second product.

**Comparison content (added from notebook kill-shot pass):** alongside the micro-tools, 2-3 SEO comparison pages/posts that harvest EXISTING demand: "ALTER vs Finch," "habit tracker without streaks," "planner that doesn't punish missed days." People searching these are already shopping; warmer than any cold hook. EVIDENCE: the harvest-existing-demand correction pattern (distribution post-mortems); our no-streaks/no-punishment angle is literally a search query. Same anti-distraction cap as micro-tools.

**RU lane (optional, unique to us):** the full 1,232-string RU dict already exists; mom is a persona; the RU wellness market is far less saturated and David's network is there. Decision deferred to month 2+, but no comparable has a second language for free.

---

## 5. THE CALENDAR (from today, 2026-07-11)

**Weeks 1-2 (now → Jul 25): BUILD + SEED.** PM close · de-game subtraction · first-day polish. Journey-pillar content starts (3-4 posts/wk: the story so far, the dad feedback, the de-game decision). David opens/warms Reddit accounts (participation only). I batch the first month of authority scripts in one session.
**Weeks 3-4 (Jul 26 → Aug 8): RAILS + PAGES.** Stripe + premium flag · landing page + science page · first 2-3 free micro-tool pages · four-persona device tests round 1 · daily posting begins (batched assets).
**Weeks 5-6 (Aug 9 → Aug 22): SOFT LAUNCH + SELL BEFORE FINISHING.** Persona circle + friends on real phones · fix what they hit · micro-tools shared where allowed · Reddit 70/30 phase begins (credibility now ~4 weeks old) · founding-member page built AND shown privately: collect 5-10 handshake pre-commitments at the tranche-1 price before launch week. EVIDENCE: "sell the problem before the code" is the most-converged founder regret (3+ named founders); we cannot un-build the 85%, but we can validate the OFFER before polishing further. Zero pre-commitments from a warm circle = a pricing/offer problem to fix BEFORE the public launch, when it is cheap.
**Weeks 7-8 (Aug 23 → Sep 5): LAUNCH WEEK.** One coordinated week: Product Hunt (visibility event, expect ~0 revenue: 400-signups→1-customer is the documented pattern) + Show HN framed TECHNICALLY ("a life-sim planner as one 11,000-line JS file, built solo with AI": the only frame that lands there) + Reddit launch posts in earned subs + founding-member lifetime deal OPENS. EVIDENCE: Letterly's multi-surface day (PH 203 installs, HN 55, Reddit 26, settling to 10-20/day organic).
**Months 3-4 (Sep-Oct): COMPOUND.** Daily content continues · double down on outliers · ship v1.1 (n=1 lab → unlocks the "study runs on you" copy) · App Store decision checkpoint (revenue + litigation status).
**Month 5 (Nov): BLACK FRIDAY.** Second founding-deal event (the category's proven spike: Habit Pixel's inflection).
**Month 6 (Dec-Jan): THE JANUARY WAVE.** The category's biggest demand moment. Content pivots to New-Year positioning ("the planner built for the day you do not follow the plan" is literally an anti-resolution-guilt pitch). This is where $1K MRR becomes realistic.

---

## 6. THE $100/MO WORKING PROTOCOL (how we operate from tomorrow)

1. **Opus for build sessions. Fable never** (tonight was its send-off). Subagents: haiku for judges/audits, sonnet for research.
2. **One surgical session per day** (~2-3 focused hours of my time budget), spec-first (10 lines), batch all edits in a region, SHIP every session. No sprawling exploratory sessions.
3. **Content is batched monthly**: one session generates a month of scripts + slide copy (cheap models), David produces/posts from the bank. Posting itself costs zero Claude tokens.
4. **Copy gates stay** (they're cheap: haiku judges).
5. **Research pulses, not swarms**: one targeted agent when a decision needs evidence.
6. **The weekly rhythm**: 5 build sessions + 1 content-batch/marketing session + 1 rest (Davids need rest days; the app agrees).

**Division of labor:** I build, write (gated), script content, design ASO/landing, run research, keep the ledger. David: verdicts, device testing, filming/posting, Reddit participation as a real human (authenticity is unfakeable and mods pattern-match), and the founder-face call.

---

## 7. THE THREE FASTEST CREDIBLE PATHS TO FIRST $1,000 (research verdict, run all three)

1. **Reddit value-first + self-run founding lifetime deal** (medium effort, 60-90 days to ~$1,000 cumulative). The two strongest analogs in the entire research set: the 60-customers-in-45-days Reddit case + Habit Pixel's best-month self-run LTD.
2. **Multi-surface launch week** (low effort, days): visibility + first handful of customers, feeds path 1. Not $1,000 on its own (documented PH pattern: 1 paying customer).
3. **Daily organic short-form** (high effort, 6-9 months to compound): the only non-linear engine; started day one BECAUSE it is slow, never instead of 1+2.

**REFUSED, with evidence:** crowdfunding (20% tech-category success rate, zero documented pure-software consumer wins 2023-26, needs a pre-existing audience: skip entirely) · AppSumo (70-75% cut, 24-30% refunds, cannibalization) · paid ads before $1K MRR (the Habit Pixel $10/day experiment came AFTER product-market signal) · waitlist theater (the one hard number: 300 signups → 3 customers) · App Store wrap now (unstable law + weak conversion case).

---

## 8. RISKS, NAMED (+ the tripwire board, added from founder-mining 2026-07-11)
**Numbered tripwires (each has a date and an observable):**
- **Week 4 content:** under ~500 views/post average → change formats (double down slideshows), not effort.
- **Week 10 conversion:** high engagement + what-app comments but $0 revenue after 100+ active users → the free-line is drawn wrong; revisit which DEPTH is premium (never a hard paywall on the core loop: the freemium-vs-hard-paywall benchmark comes from subscription apps optimizing conversion; our free core is the positioning moat, and launch revenue is the founding deal).
- **Tranche 1 sells with zero resistance → let the ladder work; do not freeze the price out of relief.**
- **Month 3 = the documented quit wall.** The feeling right before founders quit: reluctance to read user messages, post-launch flatness. Pre-committed response: reread the quit-point map, do one manual user onboarding that day, and remember flat-and-alive beats the 54% who made $0.

- **The base rate is $0.** Mitigations are §4's three engines + the four calendar waves; the kill-criterion for any channel: 8 weeks of honest effort with zero signal → rebalance.
- **Solo-founder burnout**: the calendar assumes ~2-3 focused hours/day. The app's own philosophy applies to its maker: a rest day counts.
- **Apple rule instability**: re-verify before the month-4 store decision.
- **Reddit ban risk**: the 70/30 rule + manual rules-check are the guardrails; a banned account is unrecoverable, go slow.
- **The content slog**: 2-3 months before traction is NORMAL per every comparable. The journey pillar exists so the slog itself is content.

## 9. THIS WEEK (the immediate moves)
1. David: verdict this plan (one pass, mark anything wrong).
2. Me (next session, Opus): PM close build, spec-first.
3. David: open/warm the IG + TikTok + Reddit accounts (no posting product yet; Reddit = participation only).
4. Me (session 2): first month of journey+authority scripts batched.
5. David: first journey post (the dad-feedback story is genuinely good content).
