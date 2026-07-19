# ALTER TRACKER-HANDOFF — 2026-07-19 (pitch decks + book canon + two queued tasks)
**Supersedes** TRACKER-HANDOFF-2026-07-08 as the newest working handoff. Read this first, then the memory files it names. This session produced the mom/investor pitch decks and mined 17 of 32 books; it queues TWO tasks for the next sessions.

---

## STATUS UPDATE (2026-07-19, later Opus session): BOTH QUEUED TASKS DONE
- **TASK 1 (investor deck v2) DONE:** `_pitch/investor.pdf` re-rastered (28pp), growth-round rework applied (07 pivot + ASK, 18 growth allocation, 21-25 growth tranches, 20 elevated to thesis). Mom deck untouched. Still owed by David: real terms numbers (slide 27) + tranche-amount decision. Detail in [[alter-mom-investor-pitch]].
- **TASK 2 (mine 15 books + master gameplan) DONE:** all 15 mind+psy briefs written (`_books/{mind,psy}/briefs/`), all 32 books folded into `_specs/MASTER-GAMEPLAN-2026-07.md` (the active forward roadmap; NEXT SESSION = build B1, the PM close, to book-grade spec). Detail in [[alter-master-gameplan]] + [[alter-book-mining-canon]].
- Open decisions (§4 below) still stand; consolidated + deduped in the gameplan PART 7.
- **ADDENDUM (same day, Fable):** David caught that the mind+psy shelves never got their Fable synthesis layer (the routing rule in §0). Now written: `_specs/BOOKS-MIND-PSY-CANON-2026-07-19.md` = 10 convergent laws, 8 TENSION RESOLUTIONS (several briefs' moves contradict; the rulings are binding, esp. T2 register split: suggestion craft only inside sessions, MI grammar everywhere conversational), the unified guided-session grammar (= the B7 voice spec), a refused table, and PART 5 patches to the master gameplan (B1/B2/B8 spec deltas + copy-audit additions). Build order unchanged: B1 PM close next, on Opus, with the patches. 4 new small open decisions in canon PART 6.

---

## 0. MODEL ROUTING FOR THE QUEUED WORK (read first)
- **Book mining** = cheap models via ONE `Workflow` (haiku for narrative books, sonnet for dense/framework books). Do NOT mine on Opus/Fable.
- **Cross-book synthesis / new master gameplan** = Fable (thinking), or Opus. It reads the briefs, writes the plan. No building.
- **Deck building (investor v2)** = OPUS only (edit `_pitch/investor.html`, raster-render). Never build on Fable.
- The raster PDF pipeline + its gotchas are in [[alter-mom-investor-pitch]] memory (full-bleed 431px/1280px pin, min-width:0 on flex, non-breaking money, per-slide `?only=N` screenshot → Pillow). Reuse verbatim.

---

## 1. STATE: WHAT EXISTS NOW (do not rebuild)
**Decks (in `_pitch/`, gitignored, never commit):**
- `mama.pdf` — Russian, PORTRAIT (phone-swipe), **25 pages** (finale removed 2026-07-19; ends on the risks/edges slide). Source `mama.html`. David: "good."
- `investor.pdf` — English, **16:9 WIDESCREEN, 28 pages** (title-rail-left + content-right; tier slides = price block left + 2x2 detail grid right). Source `investor.html`. David: liked the wide format.
- Both share one CSS system (berry-night, colorful game-piece icon chips, big-bold-bright type). Raster-built (per-slide PNG → Pillow) so they render identically on mobile.

**Specs:** `_specs/INVESTOR-PITCH-MOM-2026-07-18.md` = the V5 MASTER SPEC (all 26 mom slides, research numbers with source names + confidence flags, the free/paid reframe, the funnel-math scenarios). The investor EN deck was derived from it. `_specs/FOUNDATION-PITCH-2026-07-11.md` = the LOCKED product language (positioning line, Duolingo analogy, "system that never existed", the genius/soul framing) — the source of truth for slides 2-6 of both decks.

**Book canon (this session, 17 books mined):**
- `_books/business/` (10 books) → briefs in `_books/business/briefs/` → synthesis `_specs/BOOKS-BUSINESS-CANON-2026-07-18.md` (12 convergent laws + refused-techniques table).
- `_books/dev/` (7 books) → briefs `_books/dev/briefs/` → synthesis `_specs/BOOKS-DEV-CANON-2026-07-18.md` (8 laws: 100ms feedback gate, teach-by-doing, miss-states crafted like win-states, never price the relationship, retention=next-narrow-skill, QA≠usability≠playtest, etc.).
- Machine + gotchas documented in [[alter-book-mining-canon]] memory. `_books/` is gitignored.

**Research done today (cite source names, in `_specs/INVESTOR-PITCH-MOM-2026-07-18.md` PART 2):** Grand View ($8.9B→$17.5B), CDC (15.5M ADHD adults), Sensor Tower (Jan 2025 = $385M record), RevenueCat 2026 (Health&Fitness = highest-converting category, 2.9% median/6.2%+ top-quartile), Duolingo SEC (9% pay), Finch ($30M cosmetics-only, scales paid Meta/TikTok ads), lifetime-price rule (~15x monthly validates $49-99 ladder), Calm 70% women avg 32.

---

## 2. TASK 1 — INVESTOR DECK v2: "MOM ALREADY FUNDED THE BUILD" (OPUS build)
**The shift (David 2026-07-19):** assume founder/family capital ALREADY funded the product + launch. The investor raise is NOT for building or Claude subscription. It is purely **growth capital: ads, creative production, and scaling the proven engine.** This is a stronger, more professional, more de-risked story (product exists, launch funded, ask = pour fuel on a proven channel).

**Edit `_pitch/investor.html` (the 16:9 EN deck). Concrete changes:**
1. **Reframe the narrative up front.** Traction slide (07) becomes the pivot: "Built and launched on founder capital. Working product, [founding members / early revenue], proven organic content." Add a one-line ASK somewhere early: "Raising to SCALE customer acquisition, not to build." The product/genius/market/model/scenario slides mostly stay (they establish the opportunity), but the money story changes.
2. **KILL the build-cost framing.** Slide 18 "Where money goes" currently lists Claude $200/voice $22/domain/Apple — DELETE that. Replace with a **GROWTH ALLOCATION**: paid ad budget (Meta/Google), video production at scale, creative testing/iteration, and the marketing tooling. No mention of paying for Claude/dev tools as the investor's money.
3. **Rebuild the tiers (21-25) as GROWTH TRANCHES, not "buys Claude months".** Each tier = an ad+creative investment with a projected outcome tied to the scenarios: "$X → Y monthly ad spend + Z videos/month → ~N installs at CAC ~$43 → projected revenue/run-rate." Keep the Spark→Dawn ladder shape (or David may bump amounts up for real investors — flag it), but every "Buys/Delivers/Speed/What it changes" block is about ACQUISITION and GROWTH, not building. The recommended tier is where paid acquisition first pays back at scale.
4. **Elevate the two marketing slides (Content Machine 19, Viral→Paid 20)** — these are now the core of the investment thesis. Consider expanding the paid-acquisition math (CAC $43 vs LTV: founding $49-99 + subscription ~$1,100 per 1,000 free users; show the payback logic clearly).
5. **Keep:** cover, product/genius (2-6), problem/market/who/players (8-11), free/paid model (12-14), doors (15), scenarios (16), calendar (17), risks (26), terms (27), contact (28). The terms slide (return-first/revenue-share/equity) is investor-correct as-is — David still owes the actual multiple / % / equity thresholds (OPEN).
6. **Tone up:** slightly more institutional. Less "founder scraping by," more "de-risked product, capital-efficient growth." Register stays premium-honest (no hype, no em/en-dashes, no "!").
7. **Rebuild the raster PDF** exactly as before: loop `?only=N` screenshots at window 1280x720 scale 1.5 → Pillow → `investor.pdf`. Verify cover + a tier + a growth slide via Read on the PNGs.

**Do NOT touch `mama.pdf`** — the mom deck keeps its build-funding story (she IS the build funder). Only the INVESTOR deck changes.

---

## 3. TASK 2 — MINE REMAINING 15 BOOKS + NEW MASTER GAMEPLAN
**15 books are STAGED but NOT yet mined** (I copied them to `_src/` late in the session, before chunking):
- `_books/mind/_src/` (5, the hypno/ritual shelf): Trancework (Yapko), The Science of Self-Hypnosis (Eason), The Expectation Effect (Robson), Ritual (Xygalatas), Breaking the Habit of Being Yourself (Dispenza — mine the PROTOCOL, flag/refuse the quantum-woo).
- `_books/psy/_src/` (10, the "dev books meat"/self-help shelf): Motivational Interviewing (Miller — clinical PDF), Self-Compassion (Neff), Why We Do What We Do / SDT (Deci — PDF), The Happiness Trap (Harris/ACT), Opening Up by Writing It Down (Pennebaker), The Coaching Habit (Bungay Stanier), Tiny Habits (Fogg), How to ADHD (McCabe), Make It Stick, The War of Art (Pressfield).

**Step A — mine them (cheap Workflow):** recreate the prep script (scratchpad is gone; logic is in [[alter-book-mining-canon]]: EPUB via zipfile+HTMLParser spine order, PDF via pypdf, check text layer, chunk ~140k chars, manifest). Check the 2 PDFs (Motivational Interviewing, Deci) for a text layer first. Then run the map-reduce `Workflow` with SHELF-SPECIFIC extraction capsules:
  - **mind capsule** → aim at the guardian's guided-audio voice, the Rewire/Visualisation tools, the charge/intention primitive, AM/PM ritual science, expectation/placebo as the honest bridge for the "magic" layer. Yapko = suggestion craft; Eason = teach the USER self-hypnosis (= the Rewire tool); Robson/Xygalatas = the science page + ritual bookends; Dispenza = protocol only.
  - **psy capsule** → aim at the guardian's CONVERSATIONAL psychology (Miller MI = the guardian's law-book; Bungay Stanier = question pools), the PM close (Pennebaker expressive writing), the never-punish science (Neff self-compassion = weaponize the moat claim), white-hat motivation theory (Deci SDT pairs with Octalysis), ACT tools (Harris = new tool scripts), the ADHD audience lens (McCabe = protect copy from shaming our core user), habit celebration (Fogg), lesson resurfacing (Make It Stick), founder-fuel + resistance content (Pressfield).
  - Each brief ends with "TOP 10 MOVES FOR ALTER". Write to `_books/{mind,psy}/briefs/`.

**Step B — the NEW MASTER GAMEPLAN (Fable synthesis, the "don't waste progress" ask):** write ONE doc `_specs/MASTER-GAMEPLAN-2026-07.md` that integrates EVERYTHING developed today into a single forward roadmap:
  - All 32 books' TOP MOVES (business 10 + dev 7 + mind 5 + psy 10), deduped and ranked, folded into the existing law-set (don't re-list; synthesize into decisions).
  - Today's product decisions: the locked positioning + genius framing (FOUNDATION-PITCH), the free/paid reframe (voice FREE, **AI goal-architect = the paid magnet**), the three-doors monetization + funnel-math scenarios, the honest-gamification laws (charge=coin, never price the relationship, miss-states crafted), the marketing system (Field Guide YouTube + Higgsfield + viral-proves-then-paid-scales), the raster-deck pipeline.
  - Output = a prioritized BUILD + BUSINESS roadmap to launch (late August) and beyond: what to build next in the app (the AI goal-architect is now the #1 paid feature and needs accounts+backend spec; the PM-close/streak/journey per the dev canon; first-day polish), what to write (guided-audio scripts using the mind/psy craft), what to ship for launch, and the marketing cadence. Cross-reference the two existing canons rather than repeating them.
  - Keep it a ROADMAP, not a 17th planning doc that re-derives — it consolidates and points.

---

## 4. OPEN DECISIONS FOR DAVID (carry forward)
1. **Investor terms numbers** (slide 27): the actual return multiple, revenue-share %, and equity thresholds are still David's PROPOSAL placeholders — he owes real numbers.
2. **Investor tier amounts**: keep $500-$10k as growth tranches, or raise the ladder for professional investors?
3. **Free/paid split** (voice free, AI-architect paid) is a proposal — confirm before it's load-bearing in the master gameplan.
4. **AI goal-architect build**: it's now the primary paid feature. Needs its own spec (accounts via Supabase, Cloudflare Workers proxy so the key never ships in client JS, Stripe billing, Haiku economics ~$0.20-0.40/user/mo — all in [[alter-mom-investor-pitch]]/[[alter-business-masterplan]]). Fund at the Lighthouse tier and above.
5. **Psy/mind shelf recommendations** already bought (staged). Any more books David wants before the master gameplan? (He can drop more folders; the machine is proven.)

---

## AUDIO/BREATH SESSION (2026-07-19, late Opus) — 3 ships, then a 4-item queue
Shipped v1125–v1126 off the tool/audio batch:
- **v1125 — Sound panel Guide's-voice toggle.** Narration on/off, separate from its volume (reuses `S.voice`, honored by `voiceOn()`/`say()`; `TTS.stop()` on flip-off). Closes the "pre-session audio settings" ask — separate voice/bg sliders + tap-to-preview beds already existed. Settings toggle, no gesture surface → fully verified.
- **v1126 — Guided breath ladder (science breathing stack).** New first chip in `breathPicker` runs ONE continuous session easing a beginner easy→deep: resonance → box → 4-7-8, 3 cyc each (~2.5 min). Mechanism: generalized `breathwork()` to drive a pattern-agnostic **`flow`** array (single pattern = one stage; ladder = concatenated stages) — the up-front cue scheduler, orb rAF clock, and sub-label all read `flow`, zero new engine. `BREATH_LADDER` const beside `BREATH_PATTERNS`. Copy passed Gate-1 + went 3 rounds with the Haiku Gate-2 judge (mechanism-first rewrite); **copy is judge-passed, David-unrated** — the ladder chip ("Learn the real ones" / "Guided, easy to deep" / vagal-brake body) needs his read. Verified in preview: picker renders chip first, launch throws nothing, sub-label advances "calming breath · 1 / 3". **Orb pace/feel across stage transitions = DEVICE-UNTESTED** (gesture/timing, per constitution).

- **v1127 — breath = one player (David's "combine it altogether" ask).** Three parts: (a) pre-start screen now PREVIEWS sounds on tap ("sound · tap to hear") via new `breathPreview()` — reuses the exact hit/sustain engines the session uses; (b) **Voice + Sound volume sliders** on the pre-start screen via new `breathVolRows()` (same master buses as the player's Sound panel); (c) the breath SESSION now wears the player frame — top **story-bars** (one per cycle, or per stage for the ladder, filling as you go, built from the `flow`/`cum` array) + a **settings cog** that opens live Voice/Sound volume mid-session. The v1124 smooth orb + wave viz + 10 sounds are UNCHANGED. Verified in preview: picker shows 2 vol sliders + tap-to-hear; sound-chip tap doesn't throw; ladder session renders 3 stage bars that fill progressively (22→37% on stage 1 while 2+3 stay empty); cog opens the volume popover (Voice+Sound+Done); no console errors. Screenshots captured. **Audio preview + orb pace = DEVICE-UNTESTED** (headless can't prove sound/gesture feel).

**ARCHITECTURE NOTE (why breath was NOT merged into `timelinePlayer` as one code path):** there are two player codebases — `timelinePlayer` (composed: story-bars/transport/cog/mini-player/orb-drive) and the separate `breathwork` overlay (where the v1124 smooth rAF orb, wave viz, and 10 breath sounds live). The code itself flags full unification as "deeper REBUILD work" (see the `.gp-mini` comment). v1127 unifies the *experience* (breath wears the same frame + shared settings surface) without risking the just-approved smooth orb on a blind overnight engine-merge. The literal single-engine merge (route breath THROUGH timelinePlayer via breath-segments — it already has the ORB DRIVE for `seg.breath`) is the next deliberate build; do it on a fresh Opus session with device testing, porting the wave viz + 10 sounds into timelinePlayer first.

## ★ PIVOT (2026-07-19, late): CORE REDESIGN BUILD COMES FIRST
Toolbox mockup rounds kept failing because the beautiful target (David's screenshots: What-now home + scanner planner) is the 07-19 design-marathon look, which is NOT built; sampling the live app returns the old era. Decision: build the redesigned HOME + PLANNER first; toolbox/breathing/builder inherit the language after. Build specs written (Fable): `_specs/_newera-build/home-BUILD.md` (slices H-A/H-B/H-C) + `_specs/_newera-build/planner-BUILD.md` (slices P-A/P-B/P-C, regression-zone rules inside). Skin canon: `_specs/STYLE-NEW-ERA.md` (verified hexes). Order: H-A → P-A → H-B → P-B/C → H-C → then toolbox (SPEC-ONE-BUILDER Part 1.5) + breathing + builder reskin. One slice per Opus session, device verdict between.

## ★ KEY FINDING (2026-07-19 Opus build session): THE REDESIGN WAS LARGELY ALREADY BUILT
Building the new-era slices revealed the FEATURES already exist and work: home state machine (`trackerState()` → idle/claim/night/onplan = S0-S3+), D/W/M views (`pullZoom`, `.scope-b`, zoom crossfade, whole-day week columns, month cells). What they lacked was the NEW-ERA SKIN — which is what David kept rejecting. So the "build everything" work = a coordinated skin pass, not new mechanisms. Shipped + VISUALLY CONFIRMED live (forced the timeline visible via preview_eval, screenshotted):
- **v1128 H-A** home: flat pink circle + faint bloom, bigger Baloo greeting, rounder context bars. (home idle face NOT screenshot-confirmed — seed lands in claim state; low-risk CSS.)
- **v1129 P-A** planner blocks: future = FLAT MATTE (stripes = lived time only), scanner glow riding the now-line. CONFIRMED on device-preview: lived blocks vivid stripes+gold ring, future flat matte (Make art/Focus/Project work), quiet outlined (Read) — matches David's reference screenshot.
- **v1130 P-B** D/W/M lettered segmented pill (replaced scope icons). CONFIRMED: day + week views render clean, switch with no errors; week = whole-day columns already new-era.
The planner now genuinely matches the target aesthetic (screenshots in chat). Home H-A is live but visually unconfirmed. Month view not re-checked (likely fine). NEXT: David device-verdict on v1130; then toolbox reskin (still blocked on his mockup pick — has verified plum-card language now) + home idle-face confirm + breathing/builder reskin.

**Queued BEHIND the core-redesign build (order after it lands):**
1. **Toolbox overlay bug** — "the category list gets covered." STILL needs David on-phone to say which view (front door vs library) + exactly what covers what. `#breathPick` is z-99 (above all), library view renders in the cockpit's scrolling `#tfStageBody`; no obvious covering element found by code read — a blind fix risks breaking the cockpit region. One sentence of repro unblocks it.
2. **Literal single-engine player merge** — see architecture note above.

---

## 5. MEMORY TO LOAD NEXT SESSION
`[[alter-mom-investor-pitch]]` (deck state + raster pipeline + gotchas), `[[alter-book-mining-canon]]` (the mining machine + both canons), `[[alter-business-masterplan]]` (the active business plan), `[[alter-mom-investor-pitch]]` open questions. The MEMORY.md index loads automatically.
