# Competitor Teardown — Finch & Bend (2026-07-03)

**Source:** two screen-recordings David captured (`~/Downloads/APP/IMG_3147.MP4` = Finch, 3m56s; `IMG_3145.MP4` = Bend, 2m39s). Frames extracted every 2s via AVFoundation; ~200 stills studied.

**Note on the brief:** David called them "the sports/stretching app" and "the French app, our direct competitor." Corrected:
- **IMG_3147 = Finch** — his "French" was a dictation slip for **Finch**. This is the *real* direct competitor (self-care virtual-pet life-sim). Study its **onboarding, animation, economy, monetization**.
- **IMG_3145 = Bend** — the stretching app. Study it for **how to teach a user to perform a movement** (the "learn movements" ask), plus its aggressive onboarding/paywall.

**Purpose of this doc:** raw, organized observations + my like/dislike/steal/beat calls, pre-digested so Fable can go straight to synthesis and big decisions. I (Opus) did the video analysis + organizing; the *strategic* calls at the end are teed up for Fable.

---

## TL;DR — the one lesson from each

- **Finch:** the genius is **displacement of self-care onto pet-care**. You don't do things for yourself (hard); you do them so *Tiger the finch* can go on an adventure (easy, guilt-shifted, adorable). Every mechanic — energy, streaks, seasons, cosmetics — feeds that one emotional trick. **ALTER already has a guardian; Finch proves the pet-duty framing converts.** This is the closest thing to ALTER's soul in the market, and it's a top-grossing app.
- **Bend:** the genius is **making a single movement legible in 3 seconds**. Clean pose media + a numbered INSTRUCTIONS timeline + a TIPS timeline + a per-pose tunable timer. If ALTER ever teaches a physical movement (stretch break, breathwork posture, "take a walk"), *this* is the reference implementation. Everything else about Bend (dark UI, hard paywall) is secondary.

---

## PART 1 — FINCH (direct competitor)

### What it is
Top-grossing self-care app. You hatch and raise a **virtual bird** (a "finch"). You care for the bird by completing your *own* real-life self-care goals; completing goals gives the bird **energy**, which sends it on illustrated **adventures** that return with rewards. Warm, rounded, pastel, emoji-forward, relentlessly kind voice ("cheep!").

### Onboarding flow (in order, timestamped)
1. **Choose your Finch Egg** (0s) — 7 colored eggs in a ring around a preview bird + "Hatch egg." *Immediate ownership + first tiny choice, zero friction.*
2. **Reciprocal naming** (18s) — bird hatches, speaks: *"thanks for hatching me. My name is Tiger, what's yours?"* You name yourself. *Bonding via reciprocity — it introduces itself first, then asks.*
3. **Segmented progress bar** appears (4 dots) with section labels: **ABOUT YOU → ENERGY & ACTIVITY → SUPPORT AREAS**. Bird shows a `?` thought-bubble while "asking."
4. **Personalization survey**, one question per screen, playful:
   - Gender (Male/Female/Non-binary/Prefer not to answer).
   - "How easy is it for you to get out of bed?" — 3 options, each with a **random cute emoji** (dolphin, pea-pod, teddy). Selected = **green outline + green check**.
   - "Do you struggle with any of these mental health challenges?" (Bipolar, ADHD, Anxiety, OCD, PTSD, Depression…) — multi-select with `+`. *Signals "we take your struggle seriously"; drives personalization + trust.*
   - "What tends to overwhelm you the most?" (Making decisions, Taking care of others, Major life changes, Too many responsibilities…) — each with an emoji.
5. **Generated starter plan** (88s) — a **notebook-paper card** (spiral-bound top) titled *"On's starter plan — Try these easy goals with Tiger!"* listing tiny goals with emoji: Get out of bed / Brush teeth / Wash my face / Drink water / Take a stretch break / Do one thing that makes me happy / Take 3 deep breaths. Bird: *"You got this, cheep!"* → **"Let's do it!"** *The survey visibly produces something FOR you.*
6. **Streak commitment** (108s) — full-blue screen: *"How many days in a row will you take care of Tiger?"* 2/5/7/14 days, each labeled (Baby steps / Strong start / Clearly committed / Unstoppable streak) → **"Commit to this goal!"** *Commitment device framed as a promise TO THE PET, not to yourself.*

### Core loop / home screen (138s)
- Pet stands in a **living scene** (forest, day/night cycle — later frames show night).
- **Energy bar**: *"1st Adventure — 0/15"* with a ⚡ icon. Goals fill it; full bar = send bird on an adventure.
- **"7 goals left for today!"** with filter + sort icons.
- Goals grouped by **time-of-day sections**: *Start the day ▾*, *Any time ▾* (collapsible), `+` to add per section.
- Each goal row: rounded emoji icon + name + **reward (5 ⚡)** + a big checkbox → **green check** on complete.
- Inline **social nudge card**: *"Building habits is better together… Buddy up"* with two hugging birds.
- **Bottom nav (6):** Home · Quests · Shop · Friends · Bag · Tiger(pet).

### Goal / life-area system
- **Self-Care Areas** = color-coded domain cards, each with a **pet vignette acting out the theme**: Movement (soccer), Self-kindness (hugging a heart), Sleep (pillow), Gratitude (praying), Hygiene (toothbrush), Connection (phone call) + **"Create my own area."**
- Area detail (e.g. "Productivity"): weekly M–S dot row, goals with **recurrence** ("weekly on weekdays"), "Add a new goal / Or add an existing goal."
- "My Self-Care Areas" list: each area shows a **milestone ladder** (dashed line with dots) = long-arc progression.

### Gamification & economy
- **Energy (⚡)** = the flow currency: goals → energy → adventures.
- **Rainbow Stones** = hard/collectible currency (reward stacks of "200 Rainbow Stones").
- **Cosmetics**: the bird wears **outfits/accessories** (bandana+bucket, explorer hat) — a dress-up economy.
- **Adventures**: illustrated journeys the bird takes when energy is full (the payoff for doing your goals).

### Monetization — seasonal battle pass
- **Seasonal event**: *"JULY SEASON — DRIVE-IN DREAMS,"* a lavish themed splash (retro diner, popcorn, birds on a date). **"ENDS IN 28d 18h"** = FOMO timer.
- **Dual-track reward ladder** (Day 1→25): **Free column** (gems, chests, "200 Rainbow Stones") vs **Plus column** (locked cosmetics — rainbow shirt, shorts, sunglasses, a Coke bottle prop). Padlocks on the Plus items.
- **Finch PLUS** subscription unlocks the Plus track + "Activate." Textbook F2P season pass: collectible-driven, time-boxed, cosmetic-gated.

### Social / viral
- *"Finch is more fun with friends!"* — **Visit their birdhouse · See latest progress · Send good vibes** → **"Invite your cheeps!"**
- Friends screen shows friend birds in nests with `???` locked slots ("Add friend") = social completion pressure.

### ✅ What's GREAT about Finch (steal)
1. **Pet-duty displacement** — the single most important idea. Reframes self-care as caregiving, which is *easier and more virtuous-feeling*. ALTER's guardian-angel can do the inverse/mirror version.
2. **Reciprocal naming** — the companion names itself, then asks yours. Instant bond, near-zero friction. ALTER should do this in onboarding.
3. **Survey → visible artifact** — the questions *produce a starter plan card* you can see. Personalization you can feel beats a hidden algorithm.
4. **Emoji-per-option surveys** — every answer has a playful icon; the survey feels like play, not a form. (For ALTER: Tabler line-icons per our no-emoji rule, but same principle.)
5. **Commitment framed as a promise to the companion** — "how many days will you take care of Tiger" lands harder than "set a streak goal."
6. **Domain cards where the character acts out the theme** — gorgeous, legible, emotional. Directly portable to ALTER's domains.
7. **Time-of-day goal sections** (Start the day / Any time) — matches ALTER's timeline-native model.
8. **Living scene w/ day-night cycle** — the home is a *place*, not a list.

### ❌ What's WEAK about Finch (beat it)
1. **It's all soft, no spine.** Endless kindness, no push, no truth. It never challenges you or reflects your patterns back. **ALTER's edge: guardian that also holds a mirror** (identity-evidence, alignment metric, the PUSH⟷WAY-OUT tension). Finch has the WAY-OUT and no PUSH.
2. **Self-care is a checklist of trivia** (brush teeth, drink water). No depth, no journey, no meaning-layer. ALTER's grimoire/Field-Guide wisdom layer is a real differentiator.
3. **Monetization is cosmetic-FOMO**, disconnected from actual growth. A season pass for bird outfits doesn't make you a better person. ALTER can tie value to *transformation*, not dress-up.
4. **No real reflection/journaling depth shown** — it's shallow mood-tracking. ALTER's bookend rituals + clever journaling beat this.
5. **Pet can feel infantilizing** for some users (David's brother/adult men). ALTER's guardian is more *mentor* than *pet* — can scale in maturity (teach→mirror→chronicle, per never-hands-over).

### How ALTER wins vs Finch
Finch = **comfort**. ALTER = **comfort + becoming**. Keep Finch's warmth, bonding, and pet-duty trick; add the spine Finch refuses to have — a guardian that pushes, reflects your patterns, and runs on real behavioral science, with an economy tied to who you're becoming rather than what your bird wears.

---

## PART 2 — BEND (movement-teaching reference)

### What it is
Minimal, **dark-themed** stretching/mobility app. Elegant, adult, editorial. This is the model for the "help users learn to do movements" ask.

### Onboarding
1. **Splash**: `bend` wordmark, "Enter Referral Code," GET STARTED / LOG IN. Dark, premium, restrained.
2. **Value-prop screens**: single animated pose figure in a tinted circle, one line ("Also, you'll feel great. Stretching improves your flexibility…"), **"TAP TO CONTINUE."**
3. **Survey**: experience level (Beginner/Intermediate/Expert); **body areas of concern** (Elbows, Biceps, Triceps, Chest, Lower/Upper Back, Spine, Shoulders, Neck…) multi-select w/ SKIP; **"How did you hear about us?"** (attribution — Instagram, TikTok, AI recommendation, App Store…).
4. **Widget prompt during onboarding**: *"Add the widget to your home screen — Track your streak and never miss a day"* → ADD WIDGET / Skip. *Retention hook planted before first use.*

### 🎯 The movement-teaching UI (the key screen — 108s)
Exercise detail page = the reference pattern:
- **Top:** clean full-width **photo/video of the pose** (real person, neutral studio, black mat) with an `×` to close.
- **Pose name** ("Lunge").
- **INSTRUCTIONS** — numbered steps rendered as a **vertical connected-dot timeline** (○─○─○): "Start from a kneeling position…" → "Step forward…" → "Push your hips forward…" → "Lift your chest…"
- **TIPS** — form cues in the same connected-dot style: "Keep your front knee above your ankle," "Engage your back leg," "Keep your torso upright."
- *Why it works:* media shows the target, numbered timeline shows the sequence, tips prevent injury/mistakes. Legible in seconds, zero fluff.

### Routine detail / builder (100s)
- Header ("Wake Up · 5 MINUTES"), one-line description, ♥ save.
- **Ordered pose list**, each row: circular pose thumbnail + name + **tunable duration** (−  0:30  +) — user adjusts each pose's time; a **swap icon** replaces a pose.
- **Share Routine** + big **START**.

### Home / library
- Header: date ("JULY 3 / Friday"), **streak flame**, profile.
- **Hero routine card**: "15 MINUTES / Full Body" shown as a **grid of ~24 colorful circular pose thumbnails** — instantly communicates richness/variety. Signature visual.
- **Search for a routine.**
- **Browse by Area** (Hips, Lower Back, Neck, Shoulders, Splits, Hamstrings) + **Browse by Category** (Running, Splits, Energize, Posture, Pelvic Floor, Targeted, **Relax & Unwind**, **At the Office**, Pre-/Post-Workout, Planks, Strength) — each a colored circle w/ figure. *Context-based routines ("At the Office") = smart.*
- **Multiday Series** (Beginner 3-Day, Lower Back 3-Day) = programs.
- **Pre-/Post-Workout** → Warm Up (5m) / Cool Down (8m).
- **Custom** tab → "Create Your Own Routine."
- **Bottom nav (5):** Home · Bookmarks · **AI/sparkle (✦)** · Timer/Stats · Groups/Custom.

### Monetization — one-time-offer paywall (88s)
- Post-survey full-screen: **"Your One-Time Offer — $56 OFF FOREVER,"** ~~$79.99~~ → **$23.99/year** ($1.99/mo), *"Once you close your one-time offer, it's gone!"* Anchored strike-through price + scarcity + "Lifetime Discount" badge. Aggressive, early, effective.

### ✅ What's GREAT about Bend (steal)
1. **The 3-part movement page: media + numbered INSTRUCTIONS timeline + TIPS timeline.** Best-in-class way to teach a physical action. Portable to ALTER's stretch-break/breathwork/posture moments — with our pixel-art figure instead of photos.
2. **Per-pose tunable timer (−/+) + swap** — user tailors intensity without leaving the routine.
3. **Circular-thumbnail grid** as a hero visual — makes a routine look rich and inviting.
4. **Context-based routine framing** ("At the Office," "Relax & Unwind," "Wake Up") — intent over anatomy. ALTER's blocks could borrow this ("morning wake-up stretch," "desk reset").
5. **Onboarding widget prompt** — plants retention before first session (ALTER already has widgets → do this).
6. **Multiday series** = lightweight programs/courses (maps to ALTER's journey ladders).
7. **Editorial dark restraint** proves the "adult, premium, not childish" register — useful counterweight to Finch's cuteness for David's male personas.

### ❌ What's WEAK about Bend (beat it)
1. **Cold and impersonal** — no companion, no encouragement, no *why-you*. It's a competent tool, not a relationship. ALTER's guardian makes movement *cared-about*.
2. **Attribution/survey questions add friction** with no user-facing payoff (unlike Finch's visible starter plan).
3. **Paywall is pushy and early** — scarcity theater ("it's gone!") can feel manipulative. ALTER can earn the sub by delivering value first.
4. **No meaning/identity layer** — stretching for stretching's sake. ALTER can frame movement inside the larger becoming-arc.
5. **Real-photo media** is generic/stocky; ALTER's illustrated/pixel style can be more ownable and on-brand.

### How ALTER wins vs Bend
Bend teaches the *body* with no *soul*; Finch has *soul* with no *body/skill depth*. **ALTER is uniquely positioned to fuse them:** teach real movements/skills with Bend's clarity, wrapped in Finch's warmth + ALTER's guardian-mentor spine and meaning layer.

---

## PART 3 — Cross-cutting patterns (both apps)

| Pattern | Finch | Bend | ALTER take |
|---|---|---|---|
| **Segmented progress bar in onboarding** | ✅ 4-section | ✅ | Adopt — reduces survey fatigue |
| **One question per screen, big tap targets** | ✅ | ✅ | Adopt |
| **Survey → visible personalized artifact** | ✅ (starter plan) | ❌ (hidden) | Adopt Finch's version |
| **Streak + widget retention hook** | ✅ streak | ✅ widget+streak | Already have widgets; add the onboarding prompt |
| **Domain/area system with strong iconography** | ✅ character vignettes | ✅ colored circles | Character-acting-out-theme (Finch's is better) |
| **Recurrence-aware goals** | ✅ | routine-based | Already in ALTER's plan model |
| **Companion voice/encouragement** | ✅ constant | ❌ none | ALTER's guardian — but with spine, not just praise |
| **Monetization** | Season pass + cosmetics | One-time-offer sub | Tie value to *becoming*, not cosmetics/scarcity |
| **Social/viral** | ✅ strong | weak (groups) | Optional later; ALTER is single-user-first |

---

## PART 4 — THE VERDICTS (Fable, 2026-07-03 — decided, not open)

The through-line: **Finch's displacement and ALTER's identity-first are the same mechanic pointed in opposite directions.** Finch: you care for something *weaker* (pet-duty). ALTER: something *wiser* cares for you. The converting core isn't feeding a bird — it's that **the commitment is made to another, and the other witnesses.**

1. **Pet vs mentor → MENTOR, no pet mode.** Steal the *reciprocity beat* (guardian introduces itself first, invests first, THEN asks who you are), not the creature. Dependency is Finch's hook; **witness** is ours. A pet can't mature into a chronicler; a guardian can (never-hands-over).
2. **Displacement → adopt as THE WITNESSED PROMISE.** "How many days will you show up? I'll remember." The guardian holds the commitment, cites it later, and consistency becomes visible evidence in its world. Escape hatches (Snooze/Skip inside the reward sheet) keep the WAY-OUT; the PUSH is that the witness *remembers* — which Finch refuses to have.
3. **Movement teaching → YES, as ONE component.** Bend's media + INSTRUCTIONS-timeline + TIPS-timeline becomes ALTER's **universal how-to card** — same component for a stretch, a breath posture, a journaling method. A routine library would be the 4-facet-compass mistake.
4. **Economy → nothing buyable.** Steal only the *persistent named-payoff bar* (progress toward the next journey chapter). Rewards = chronicle entries + world growth; transformation is the loot. Monetization someday = subscription for depth, never pay-for-progress.
5. **Onboarding → steal Finch's flow shape wholesale:** guardian self-introduces → reciprocal naming → mood-gauge FIRST (energy-door, locked) → short segmented survey → **visible starter micro-stack card** (survey must produce a visible artifact) → witnessed commitment. Plus Bend's widget prompt. → *Now speced as `HANDOFF-grimoire-pages.md` §5 (onboarding = chapter zero; recognition-not-production).*
6. **Register → palette stays locked.** Finch's warmth is motion + voice, not pastel; Bend proves adult restraint. The steal is the build→burst juice grammar in our pink/yellow/ink.

**Build order:** ① juice pack on existing completions (CSS/canvas) → ② onboarding per verdict 5 (grimoire pages G-series) → ③ universal how-to card.

---

## PART 4b — THE DEEP-DIG FINDINGS (second + third pass, full-video coverage)

**The relationship layer (why Finch feels alive):**
- **Co-authored companion:** post-hatch you *choose a trait* ("Tiger cares about…" Curiosity/Resilience/Compassion/Logic/Confidence/Security) — the pet's personality is partly your projection; the mirror is user-built. One cheap question.
- **UI as theater:** the bird inhabits EVERY screen with contextual poses — `?` bubble during surveys, cleaning outfit on Productivity, gardener watering plants on Areas, phone-call vignette on Connection. **The character demonstrates the domain instead of an icon labeling it.** Dozens of small assets, not code; the single biggest "alive" multiplier after the juice.
- **The pet has life stages ("Baby Tiger")** — consistency ages a being; the profile is a passport (stamp watermark, friend code, ABOUT/DETAILS/TRAITS). ⚠️ **ALTER warning:** do NOT merge guardian and growing-thing. Sage = witness (constant, never regresses); the seed/world = evidence (grows). The split is structurally better for never-hands-over. Steal only the *legibility*: named growth stages for the seed/world.
- **Pronouns for the bird; name-shuffle button** — the companion is a *someone*; playful defaults kill blank-input stall.

**The loop layer:**
- **Daily Quests = meta-goals that teach the app's soul** ("Name your emotion," connected-dot chain, Claim, 17h reset) — onboarding that never ends, one feature per day. → ALTER: the trail deals one untaught REG tool/day ("the grimoire reveals one page per day").
- **Dormant UI that wakes when you act:** "Weekly Milestones — *zzZ* — complete a goal to unlock this week." Systems you *earn into existence*, not empty states begging.
- **Stateful praise:** "You're a rockstar! *First time* completing this goal" — completion copy keyed to state (first-ever / streak / comeback). → ALTER's comeback (drift-recovery) deserves the BIGGEST celebration, not the quietest.
- **Evening flow = the PM bookend, market-confirmed:** night-sky register shift, bird in nightcap, day-rating dots, then **journaling rendered as a chat with the companion** ("Conversation," "+ add a comment"). The journal is not a page — it's a conversation the guardian is having with you.
- **Zero-consequence first choice** (all 7 eggs → same bird): choice #1 is ritual/ownership, not configuration.
- **Plan as physical artifact** (spiral-bound notebook card) — the survey's output is a *gift object*.

**The persuasion layer:**
- **Gate at peak anticipation:** account wall = "Almost ready to hatch!" with the egg wiggling behind the form. Place every costly ask (signup, notifications, widget) at the top of a desire spike with the desired thing visibly waiting.
- **Permission asks routed through the bond:** "Enable notifications — get reminded to *check in on Tiger*." Never "we want to notify you."
- **Two-sided time pressure:** season content shows "UNLOCKS IN 3 DAYS" (anticipation lock) alongside "ENDS IN 28d" (expiry FOMO); mystery "?" shop categories (Color, Travel) as pure curiosity; collections with silhouette teases ("Micropets 0/69").
- **Grace for lapsing:** last season's rewards stay claimable ("JUNE SEASON — claim your rewards!") — comeback-friendly, consistent with drift-recovery-over-streak.
- **Altruistic monetization: "Become a Guardian — sponsor Finch Plus for others."** Heavy users become patrons. → ALTER's four-persona reality makes this *gifting*: David gifts guardians to mom/sister/brother; family is the distribution model.

**Meta:** Finch has **no dead surface** — every screen either deepens the bond or teaches the loop. That's the bar.

---

## PART 4c — MAPPING TO THE ACTIVE SPECS (what changes where)

Against `GAMEPLAN-TOOLS-1000X` + `HANDOFF-first-day`: **the specs already contain Finch's best mechanics in deeper form** (THE MARK ≥ confetti+toast; the pact = witnessed commitment; [smaller]/declines = Snooze; five stones = day-one quests; braid stone = dormant UI). The videos are validation. Five amendments, no new T-ships (amendment blocks added to both specs 2026-07-03):
1. THE MARK gets the **build→burst rhythm** — drain slowly (anticipation), THEN particles (burst), THEN typewriter (T1b sequencing note).
2. **PM bookend / CLOSE stone = conversation, not a field** (F1) — now generalized by grimoire-pages §1.
3. **Pact honesty-callback un-deferred** — the witness must reference the promise; NUMBER BANK has the stems ("You said five days. This is day three.").
4. **Grimoire drip** post-T2: the trail deals one untaught REG tool/day.
5. **FOR-RIGHT-NOW card previews the composed session as chapter dots** (Bend's connected-dot grammar = the SCREEN form of compose()).

Downstream spec born from this teardown: **`HANDOFF-grimoire-pages.md`** (recognition-not-production; typing-last; worksheets→choice-pages; onboarding = chapter zero).

---

## PART 5 — FINCH ANIMATION & REWARD FEEL (frame-by-frame study)

Re-extracted Finch at 0.4s and studied the reward micro-animations frame-by-frame (David's ask: "the nuanced animation of how they gamify and give rewards"). Montage stills saved for review at **`~/Downloads/APP/finch-animation-study/`**.

The through-line: **every reward is a two-beat "build → burst" with soft physics.** A slow anticipation beat (wiggle / crack / press) then a celebratory particle burst with gravity, plus warm copy. Nothing is instant; nothing is stiff. This "juice" is most of what makes Finch feel alive — and it's cheap to replicate in CSS/canvas.

### A) Egg hatch — the signature reveal (`0-`,`1-` stills)
Sequence over ~3s:
1. **Anticipation:** egg sits, subtle idle wiggle.
2. **Progressive crack (3–4 stages):** a black **jagged lightning line** draws on and grows — first a small notch at the base, then extends up, then a second fracture, until the shell is split top-to-bottom. Each stage is a discrete step (not a smooth morph) → reads as *effort/tension building*.
3. **Burst reveal:** shell vanishes and the **bird bounces in** (overshoot scale — pops slightly larger then settles) behind a **radiating sunburst** of ~14 pale-gray triangular spokes from center. The spokes **pulse/rotate subtly and fade** over ~1.5s.
4. **Copy:** *"You hatched a birb!"* fades in under it.
*Steal:* the build-then-burst rhythm + overshoot bounce + fading sunburst is a universal "you unlocked something" template. ALTER can use it for hatching/leveling/first-time-unlock moments in our palette (pink/yellow spokes on the gradient).

### B) Goal complete — the core-loop reward (`2-` still, ~146s)
This is the money animation, fired on every completed goal:
1. **Action sheet:** tapping a goal opens a small dark bottom-sheet with three buttons — **Skip · Complete · Snooze** — Complete centered and highlighted green with a check. (Note: *Snooze* + *Skip* = the WAY-OUT is built into the reward moment; no guilt.)
2. **Confetti burst:** on Complete, a **multicolor confetti explosion** (blue/pink/yellow/orange rectangles + circles) erupts from the goal row and **falls with real gravity** — scatter, rotate, settle at the bottom edge. Physics-y, not a static graphic.
3. **Toast slide-up:** a dark pill toast rises from the bottom: **"You're a rockstar! First time completing this goal"** — context-aware praise (it knows it's a first-time), then auto-dismisses.
4. **State update:** header count decrements (7→6 "goals left"), the row's checkbox flips to green, energy (⚡) awards toward the "1st Adventure — 0/15" bar.
*Steal:* confetti-with-gravity + a **context-aware praise toast** (first-time / streak / comeback variants) is a huge, cheap dopamine hit. ALTER's guardian voice can own the toast copy (and per our spine, vary it — praise, but also occasionally *challenge*).

### C) Energy → Adventure economy (the payoff loop)
- Completing goals fills a visible **energy bar (⚡ 0/15)** labeled with the next reward ("1st Adventure"). The bar is always on the home screen = a constant progress-toward-payoff cue.
- Full bar → the bird goes on an illustrated **adventure** and returns with loot (the recording didn't trigger one, but the bar framing makes the loop legible at a glance).
*Steal:* a persistent "progress toward a named payoff" bar on the home surface. ALTER's equivalent could feed the journey/guardian arc, not a cosmetic adventure.

### D) Soft reminder nudge
- A "**Make your habits stick!**" card animates with gentle **heart particles** floating up — even the retention nag is affectionate, not a red-badge scold.

### Feel checklist to replicate (cheap, high-impact)
- [ ] **Build → burst** two-beat on every reward (anticipation, then release).
- [ ] **Overshoot/spring** on reveals (pop bigger, settle) — never linear ease.
- [ ] **Particle bursts with gravity** (confetti/hearts/sparkles) for completions & unlocks.
- [ ] **Context-aware praise toasts** (first-time / streak / comeback) sliding from bottom.
- [ ] **Progressive multi-stage** anticipation for big unlocks (the 3-stage crack).
- [ ] **Persistent named-payoff progress bar** on home.
- [ ] Escape hatches (**Snooze/Skip**) *inside* the reward sheet — no guilt.

*(ALTER caveat per constitution: these are CSS/canvas animation ideas — build in the real app, verify boot in preview, but **gesture/animation feel is DEVICE-UNTESTED until confirmed on David's phone.**)*

---

## Appendix — frames on disk
Extracted stills (session scratchpad, temporary):
`…/scratchpad/frames/3147/` (Finch, 119 frames) · `…/scratchpad/frames/3145/` (Bend, 80 frames).
Also: 15 stills David saved in `~/Downloads/APP/*.jpg` (same session) — not yet reviewed; likely additional refs.
