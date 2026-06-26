# ALTER — GRAND AUDIT  ·  every request, June 21 → 26, 2026

> **Why this exists:** David kept feeling that big-vision asks and small features were silently dropped across ~5 days, 226 commits, and many sessions (genesis in the parent `claudeCode` folder, then the `alter/` repo). This is the receipts. Mined from **515 raw asks** across **505 of David's verbatim messages** in 12 session transcripts, deduped to **352 canonical requests**, each cross-checked against the *current shipped code* (`app.js`/`index.html`) + git history by a fan-out of audit agents.

**Tally:** ✅ 201 built · 🟡 112 partial · 🔴 36 dropped · ❓ 3 unclear  ·  **352 total**

_Status is agent-assigned with code evidence (file:line) — high-signal but worth spot-checking before you act on any single line. Sorted within each section by scope (vision → big → med → small), then date._

---

## 🔴 DROPPED — 36 requests with no meaningful trace in the app today

_These are the ones that got forgotten. Each was asked for and never (or no longer) exists in the shipped code._

### UI / UX / design / palette / art  (6)

- **Show many clever creative interpretations/options to pick from**  ·  👁️ VISION  ·  _2026-06-23_  ·  asked ×2
  > "i want to see more clever optiions to piick from a bunch of creative interrpretations and deciisions"
  - _Evidence:_ This is a request to David's design-chat process (show options before building), not an in-app feature; no in-app 'pick an interpretation' surface and nothing to verify in shipped code

- **Isometric 3D zen world with Heaven Inc-quality movement and zen colors**  ·  🟦 BIG  ·  _2026-06-22_
  > "game should be more zen vibes maybe in terms of colors and...the 3d movement in heaven inc game is much better...we can make this game isometric"
  - _Evidence:_ renderWorld (app.js:1482-1515) is top-down (ellipse shadows, ctx.scale uniform zoom, no iso projection); no isometric/diamond math anywhere; never built isometric

- **Journal/notebook UI: medieval storybook + girl's color-coded notebook on colored paper**  ·  🟦 BIG  ·  _2026-06-22_
  > "feel like it's on paper... colored paper combination of a Medieval storybook and a girl's color coded notebook"
  - _Evidence:_ notebookSheet() (app.js:580) is a dark berry menu list, not paper/storybook; no colored-paper or medieval treatment in CSS; the storybook-paper concept never reached the shipped notebook

- **Present visibly welds future into past — hero animation eating future, creating past**  ·  🟦 BIG  ·  _2026-06-25_
  > "the present actually converting the future into the past by welding... it's both eating into the future and creating the past"
  - _Evidence:_ No weld/eat hero-animation in code; the present is a static now-line + readout (app.js:2053) and the tracked bar simply grows to it. The cinematic 'welding' transition was never built

- **More advanced modern design (consider Claude design tooling)**  ·  ▫️ med  ·  _2026-06-21_  ·  asked ×3
  > "I want more advanced modern design do we need Claude design for that?"
  - _Evidence:_ No trace of any 'Claude design' integration in code or git; the question was rhetorical and design was hand-built in CSS

- **Square tile-based (not circular) island; character not too big for island**  ·  ▫️ med  ·  _2026-06-22_
  > "Island should be based in squares not circular character should look much better"
  - _Evidence:_ app.js:1469 comment 'smooth organic island blobs (no more pixelated tile edges)' and buildIsland() uses Path2D blobs, not squares — moved AWAY from square tiles toward organic blob; tile-grass asset exists but island shape is not square

### Gamification / RPG / character  (4)

- **Tiered gamification with MVP per level: Duolingo-low-end to full survival game high-end**  ·  👁️ VISION  ·  _2026-06-22_  ·  asked ×3
  > "minimum is inspired by something like Duolingo... high end is full interactive game where cleaning my room earns me points I can use to survive"
  - **Gap:** The explicit 'MVP for every level of game' tiering was never built; survival high-end never built.
  - _Evidence:_ No tiered/level-of-game framework exists. There is one gamification layer (spark + virtues + walkable island). No Duolingo-tier MVP vs survival-tier toggle, no pirates/natives. No trace in code.

- **Arrow-at-goal mechanic with phone haptic/vibration feedback**  ·  ▫️ med  ·  _2026-06-21_
  > "In heroic app there is shooting an arrow at goal with vibrational feedback from phone which is clever"
  - **Gap:** Haptics exist generally, but the specific shoot-an-arrow-at-goal mechanic was never built.
  - _Evidence:_ navigator.vibrate is used for celebrations/drag haptics (app.js:320, 2035, 2134) but there is NO arrow-at-goal aiming mechanic. Grep for 'arrow' finds only ti-arrow-back-up undo icon (app.js:741) and keyboard arrow keys (app.js:1287).

- **Upgradable clothes and look of the character**  ·  ▫️ med  ·  _2026-06-22_
  > "I would want the clothes and even look of the character to be upgradable so maybe this kling run is a temporary solution"
  - **Gap:** Never built beyond a single gold recolor; the Kling-run sprite remains fixed as David predicted ('temporary solution').
  - _Evidence:_ Only S.game.ups.gold changes the guardian tint (paintGuardian gold ellipse app.js:1401, 1485). No clothing/look upgrade system; sprite sheets are fixed PNGs. No trace of wardrobe/outfit purchasing.

- **Journey/path feature exists somewhere, not the main layout**  ·  ▫️ med  ·  _2026-06-24_
  > "the journey path should exist somewhere in the app. It shouldn't be the main layout of the app, but I already told you that I want that feature"
  - **Gap:** Never built; the closest thing (mindmap 'see your life') is a different concept (identity planets, not a journey path).
  - _Evidence:_ No journey/path view in code. mindmapSheet() ('see your life', app.js:467) is a domains-as-planets identity map, not a journey path. Grep for journey/path finds only CSS/scroll terms, no feature.

### Vision / philosophy  (4)

- **Mental-garden metaphor with fog analogy; goal peace and clarity**  ·  👁️ VISION  ·  _2026-06-22_
  > "this is like a metaphor for mental garden. I like the fog analogy. The goals is to bring person to peace and clarity ."
  - **Gap:** Lives in planning docs only; never built into the app.
  - _Evidence:_ GARDEN-OF-MIND.md exists as a doc, but no fog metaphor or peace/clarity garden mechanic is in the shipped code. "garden" appears only as activity labels/keywords (app.js:199,1129) and an unused S.game.garden array (load app.js:1081). git log -S"fog" shows no feature commit (only a CSS "full-bleed" hit).

- **World only grows when you ship a real deed (send-gate)**  ·  👁️ VISION  ·  _2026-06-22_
  > "the world only grows when YOU do — when a real deed is sent into your real life. Not bought, not idled into...Earned by a deed."
  - **Gap:** The "send a real deed" primitive was once present as a habit and was deleted; the world-grows-on-deed loop was never wired.
  - _Evidence:_ No send-gate / deed-grows-world mechanic in code. The old "send" habit was explicitly removed (load() filters h.id!=='send', app.js:1081). The world (drawWorld) renders from assets, not from logged deeds; S.game.garden is initialized but never populated/consumed.

- **Monetize ALTER — full business game plan to make it presentable then make money**  ·  👁️ VISION  ·  _2026-06-26_
  > "My goal is to monetize this... step one, to make it actually work and help me and be presentable. And step two, make money... embody the perfect AI assistant that will help me monetize my genius idea"
  - **Gap:** Stated goal from the most recent date; nothing built — step one ("make it presentable") is still the active work per the handoff.
  - _Evidence:_ No monetization in code — no paywall, pricing, subscription, or Stripe (grep found only a "Monetize" activity label app.js:226 and CSS unrelated). git log -S"monetiz" shows only doc commits (MASTER/EPIC gameplans). No business-plan artifact dated 2026-06-26; this ask is the newest (firstDate 2026-06-26) and the app remains a single-user free PWA.

- **Narrative arc: gardener rises to rich man with gardeners (garden of the mind)**  ·  🟦 BIG  ·  _2026-06-22_
  > "game should stars with the character being a gardener and then works his way up to be super rich guy with gardeners . So the vibe is it's the garden of ur mind"
  - **Gap:** Concept only in GARDEN-OF-MIND.md + unused image assets; never built as gameplay.
  - _Evidence:_ No progression narrative in code. The world is a fixed Cuphead skin (loadWorld assets app.js:1342, git f4058d9 "Cuphead world skin"); there's no gardener→rich-man arc, no economy, no NPC gardeners. gardener-A/B/C png assets exist in repo but are not referenced by app.js.

### Planning / day-structure  (7)

- **On open, ask: plan ahead or just start tracking (reactive/unplanned mode)**  ·  🟦 BIG  ·  _2026-06-23_
  > "it instantly asks you, do you want a plan ahead, or do you just want to start tracking... unplanned mode, so it's reactive mode"
  - **Gap:** Never built. The app does support unplanned tracking (backfill, startOrSwitch) but never asks the plan-vs-track question on open.
  - _Evidence:_ No on-open mode prompt anywhere; grep for reactive/plan-or-track/just start finds nothing. App opens to the day timeline directly.

- **Plan multi-step health goals (e.g. knee surgery) across a month with appointment scheduling**  ·  ▫️ med  ·  _2026-06-23_
  > "my long term plan is knee surgery, and there's all those subthings, and the app can recommend when to throw them in into a calendar"
  - **Gap:** Never built. Generic goal-step scheduling exists but nothing recommends WHEN to place appointments across a month.
  - _Evidence:_ No appointment/knee/surgery scheduling logic; decomposeGoal templates cover calm/fitness/learn/etc but no medical multi-step with calendar recommendation. scheduleSubtask only offers Today/Tomorrow/In 3 days (app.js:418).

- **Auto-drop stale plan items as the day runs out (e.g. shower), with manual override**  ·  ▫️ med  ·  _2026-06-23_
  > "as the day progresses, the app will remove some of the things... shower will get removed... give you options to remove it yourself"
  - **Gap:** Never built. Closest is the over-budget low-priority bump message, but it doesn't auto-remove the shower-type stale items with an undo.
  - _Evidence:_ No auto-drop/decay of stale items. reflow only pushes/clamps blocks; over-budget bumping (app.js:1168) trims low-priority but doesn't remove items like shower as the day ends. grep for stale/remove-as-day-progresses finds nothing.

- **In-bubble-menu mini-timeline showing neighbor activities, scrollable in time**  ·  ▫️ med  ·  _2026-06-25_
  > "we have to show in this visualization the other activities to the left and to the right, and we should be able to scroll in time"
  - **Gap:** Never built. The editor shows only the single activity's length/ends; no scrollable strip of left/right neighbor activities.
  - _Evidence:_ editorSheet (app.js:2330-2387) has hero/slider/priority/steps but no neighbor mini-timeline; grep for mini-timeline/neighbor finds nothing in the editor. A scrubber was removed in v478 (commit ce8ed29).

- **Drag-down in future creates an empty bubble that stretches out**  ·  ▫️ med  ·  _2026-06-25_
  > "Dragging down to create an empty bubble in the future doesn't work still... it doesn't stretch out"
  - **Gap:** Deliberately not built — David's exact complaint ("dragging down to create… doesn't stretch out") remains unresolved; they chose tap-create + slider instead of drag-stretch.
  - _Evidence:_ makeBlock comment states it outright: "drag-on-timeline can't beat the scroller, so we don't try" (app.js:2261). Creation is tap/hold → fixed 30-min bubble; the move listener is passive so a drag just scrolls (app.js:2262-2264).

- **New bubble defaults to one-hour size**  ·  · small  ·  _2026-06-24_
  > "When you make a new bubble, it should be the size of an hour automatically"
  - **Gap:** Never honored — every new-bubble path hardcodes 30 minutes, not 60. (planSheet's separate cfg defaults to 60, but the on-timeline tap-create bubble is 30.)
  - _Evidence:_ makeBlock() creates mins:30 (app.js:2261); distributePlan pushes mins:30 (app.js:752); addSuggested default 30 (app.js:356). Editor DEF=30 for plans (app.js:2333).

- **Allow placing goals/bubbles past midnight**  ·  · small  ·  _2026-06-24_
  > "it should allow you to place goals past midnight"
  - **Gap:** Never built. The 4am-rollover logical day exists for the timeline window, but you cannot place a bubble after 23:30.
  - _Evidence:_ Every placement/reflow path hard-clamps to 1410 (23:30): makeBlock Math.min(1410,…) (app.js:2261), reflow s=Math.min(1410,…) (app.js:2596/2607), nextFreeTime (app.js:354), distributePlan/dayWindow caps. Window endH capped to 28 but blocks can't be authored past 23:30.

### Navigation / timeline / scroll / gestures  (7)

- **Home screen should be a pull-down menu**  ·  🟦 BIG  ·  _2026-06-23_
  > "Home Screen not the way I wanted I wanted a pull down menu I don’t see it"
  - **Gap:** Built earlier then deliberately replaced per memory 'reuse-pulldown-timeline-as-Today … keep always open, remove pull-down'. David later endorsed this; the literal pull-down-home is gone.
  - _Evidence:_ Home is now the always-open timeline (body.tab-day #pullSheet transform:none, index.html:939; boots tab-day app.js:2953). The pull-down-from-top home was explicitly removed.

- **Slide-down expands live tracker, split down the middle, Apple-notifications vibe**  ·  ▫️ med  ·  _2026-06-23_
  > "Sliding down on screen expands the live tracker menu... like sliding down on Apple to show list of notifications vibes except here it's split down the middle"
  - **Gap:** Never built as described; superseded by the always-open two-lane timeline.
  - _Evidence:_ No split-down-the-middle Apple-notifications slide-down tracker. The pull-down (pullGrab app.js:971) reveals the whole timeline (two PLAN/REAL lanes), not a notification-style live-tracker expander.

- **Tools/Today menu holds morning/evening journal + self-help stack + guided meditation**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "tools will have morning journal and evvening jounral and self help stack maybbe"
  - **Gap:** Never built into the tools menu. (A LINES affirmation array exists app.js:1948 but isn't a journal/meditation tool surface.)
  - _Evidence:_ dayToolsMenu app.js:731 holds Plan day / Enhance / Clear / Undo / Test day only — no morning/evening journal, self-help stack, or guided meditation entries. grep for journal/meditation in tools menu: none.

- **Press-hold cycles through clustered small bubbles by dragging thumb (let go to select)**  ·  ▫️ med  ·  _2026-06-25_
  > "if you click and hold a small thing and there's a bunch of small things next to it... it'll highlight one... drag your thumb up and down. It'll list each small thing and highlight each one one by one until you can pick one"
  - **Gap:** Never built; the rail-chip approach was chosen instead of the drag-thumb-to-cycle interaction.
  - _Evidence:_ No cluster-cycle highlighter. Tiny bubbles are handled via the right-rail chips instead (railItems app.js:2091). git log -S'cluster' / 'highlight one by one': no implementation hits.

- **Left/right arrows next to date jump to prev/next day**  ·  · small  ·  _2026-06-24_
  > "clicking the left right button next to it should take u to next and previous day"
  - **Gap:** Never built as literal arrows beside the date; navigation is swipe + week-strip + pill instead.
  - _Evidence:_ No prev/next day arrow buttons next to the date. Day change is via week-strip tap (weekStrip app.js:719), horizontal swipe (pageSlide), or Today/Now pill. grep for chevron-left/right next to date: none in the timeline header.

- **Zoom slider top-right under day/week/month buttons (later removed)**  ·  · small  ·  _2026-06-24_  ·  asked ×3
  > "lets add a zoom slider on the top rigght under the day week month buttons"
  - **Gap:** Built then deliberately removed per David's own request; pinch replaced it. Correct end-state = removed.
  - _Evidence:_ Zoom slider was added then removed — commit 6de4ffa 'drop zoom slider (v497)'; header comment app.js:57 'Zoom slider removed (pinch still zooms)'.

- **Dragging a middle block left/right splits it in half**  ·  · small  ·  _2026-06-25_
  > "if you have something in the middle and you drag it to the left or the right, then it would actually split in half"
  - **Gap:** Never built. The only block-splitting is the present-line straddle split (app.js:2102), not a drag-to-split.
  - _Evidence:_ No split-in-half logic. Horizontal fling on a bubble RELOCATES it between plan/real lanes (app.js:2146-2151) or pages the day; no code splitting a block at its midpoint. git -S'split in half' / 'splitHalf': no hits.

### Data integrations  (3)

- **Integrate health data: Oura ring, bloodwork, scale, steps**  ·  🟦 BIG  ·  _2026-06-21_
  > "encourage any data like aura ring and blood work and scale and steps and everything"
  - **Gap:** Never built — only a one-line aspirational comment in git's onboarding-rework commit; no integration code ever existed.
  - _Evidence:_ No HealthKit/sensor/Oura/steps/scale/bloodwork reads anywhere in app.js. The only network fetches (app.js:2781-2791) are LLM chat APIs (Gemini/OpenRouter/Groq). 'health' appears only as a keyword in a 'Get fit' goal-decomposition template (app.js:406). No trace of health-data integration in code or git.

- **Integrate bank account / money data to help manage money + finance plans with spend limits**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×2
  > "data like ur bank account amount and stuff like that to help u manage money as well"
  - **Gap:** Never built as a data feature. Only keyword tiles and a canned goal-decomposition template exist.
  - _Evidence:_ No Plaid/bank/account-balance/spend-limit code. 'Money' is only an activity category with static tiles Budget/Invoice/Sell (app.js:186), and a 'save money' goal template that emits generic text steps like 'Set a monthly spending cap' (app.js:408) — pure copy, no money data, no finance plan tracking, no spend-limit enforcement.

- **Remind you to go to the doctor / schedule appointments**  ·  ▫️ med  ·  _2026-06-21_
  > "to remind u to go to doctors the app will do that as well"
  - **Gap:** Only token keyword classification exists; no appointment-reminder feature was ever built.
  - _Evidence:_ 'doctor' maps only to the 'upkeep' domain (app.js:271) and a ti-stethoscope icon (app.js:298); 'Appointments' is a caregiver seed activity (app.js:1002). The proactive engine (schedule()/proactive at app.js:1158+) generates no doctor/medical reminders. git grep --grep=doctor returns nothing.

### Coaching / reminders / notifications / AI-guidance  (2)

- **Integrate the full nuanced Brian Johnson wisdom / fieldguide self-help KB into the app**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×2
  > "you haven't integrated the self help kb we built into fieldguide properly"
  - **Gap:** Never built. The recommit/virtues framing is Heroic-inspired but the actual fieldguide/Brian Johnson book KB David built was never integrated — the brain prompt carries no KB content.
  - _Evidence:_ No "Brian Johnson", "Heroic", "Areté", "Withers", "Conway", or fieldguide-KB content anywhere in app.js (grep returns only "rest is heroic too" copy at app.js:339). The vocabulary it DOES use (identity/virtue/habit at recommitSheet app.js:2681; VIRTUES app.js:1054) is Heroic-flavored but hand-authored, not the nuanced KB. The optional AI "brain" (askBrain app.js:2777, brainContext app.js:2799) sends a generic "warm no-shame life coach" prompt with ZERO Johnson/fieldguide KB injected.

- **Over-drift fork: switch back to plan / keep drifting + replan how long**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "the app offers u to either switch to the task u planned or keep drifting but again replan how long to drift and then adjust full plan around that drift"
  - **Gap:** Never built — confirmed still open in the current handoff's backlog list.
  - _Evidence:_ No over-drift detection anywhere. grep "keep drift"/"back to plan"/overrun = nothing in app.js. The live-tracker Drift button (ldDrift app.js:950) just calls startOrSwitch with no overrun timer or fork. The newest handoff TRACKER-HANDOFF-2026-06-26.md line 39 explicitly lists "drift-overrun fork" in the grand-audit BACKLOG (not done). The only git hits for "keep drifting" are handoff/design-note docs (a27eb55, e8beb84), never code.

### Tracking / logging  (1)

- **Atomic-Habits-inspired nuanced habit system that teaches wisdom and builds/breaks habits**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×3
  > "the habit system should be nuanced, inspired by atomic habits...app should teach you the wisdom of atomic habits while you form your own habits"
  - **Gap:** Never built. Only token build-habit typing + streaks exist; no Atomic Habits pedagogy.
  - _Evidence:_ No 'atomic'/'two-minute'/'cue-craving-response-reward'/habit-loop teaching anywhere (grep for atomic/two.minute/identity-habit = no trace in app.js). build/break exists only as habit.type 'build' (DEFAULT_HABITS app.js:107) with streak counters; no wisdom-teaching layer.

### Onboarding / personalization  (1)

- **Energy identity as an aspirational role like 'world class athlete' (no virtues in identity stage)**  ·  ▫️ med  ·  _2026-06-21_
  > "Energy identity is something like: world class athlete . Don't list virtues in the identity stage"
  - **Gap:** Built once (v384), then deleted v385. Not in shipped onboarding.
  - _Evidence:_ An IDENTITY stage ('Who are you becoming?' — The Creator/Athlete/Builder…, IDENTITY array) existed in v384 (git 68ffc7e:app.js:447) but was removed in the v385 onboarding rework (aaec431). Current onboard() has no identity stage. The only 'who are you' UI is the DAILY recommitSheet step 0 (app.js:2700) using adjectives (Focused/Disciplined), not aspirational roles, and it sits beside a virtues step — the exact opposite of 'no virtues in identity stage'.

### Tech / PWA / infra  (1)

- **Investigate simulating pinch-zoom with the trackpad in preview**  ·  · small  ·  _2026-06-26_
  > "why cant we simulate the pinch with the trackpad?"
  - **Gap:** Genuinely an open investigation item, not built. The headless preview can't simulate a trackpad pinch (matches the documented 'synthetic preview lies about gestures' limitation).
  - _Evidence:_ No code/config trace of trackpad-pinch simulation; this was a preview-tooling investigation question, not an app feature. Note in-app two-finger pinch-zoom IS fully built (app.js:856-878, zoomLive app.js:658) — but that is the real-device gesture, not the trackpad-preview simulation David asked about.

---

## 🟡 PARTIAL — 112 requests half-built (a token version exists; the ambition doesn't)

_The dangerous middle: looks done, isn't. The **Gap** line is what's actually missing._

### Gamification / RPG / character  (12)

- **Gamify real life and keep score across all life domains**  ·  👁️ VISION  ·  _2026-06-21_
  > "gamify real life to keep tabs on you and to keep score on things like cleaning room and breathing exercises and meditation and sports and nutrition and everything"
  - **Gap:** Token gamification shipped; the breadth (cleaning, breathing, meditation, nutrition all scored distinctly) is only partly modeled via virtue mapping.
  - _Evidence:_ Spark currency earned on every tracked activity via earn() (app.js:1722) + virtue XP across 8 domains in virtues() (app.js:1119-1125); spaceScore() (app.js:132). Scoring is real but shallow — one Spark number + per-virtue levels, not the full cross-domain scorekeeping vision.

- **Earn points/coins and spend on character appearance, room, items, garden tools**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×2
  > "as u make points in the app u can spend it on upgrading character appearance or their home / room and also their items they can unlock"
  - **Gap:** Spend-on-items exists but is limited to skateboard/trick-deck/garden-plant; character appearance, room, and garden 'tools' for survival are not purchasable.
  - _Evidence:_ Spark spent on: skateboard (app.js:1735), trick deck (app.js:1741), garden plants (plantGarden app.js:1678-1680). No appearance/room/clothing purchases — only a gold upgrade (S.game.ups.gold) and these few items.

- **Complex, dynamic, adaptable RPG system for different people and life stages**  ·  🟦 BIG  ·  _2026-06-21_
  > "a more complex and clever rpg system that is genius and dynamic and adaptable to different style of people at different stages in their life"
  - **Gap:** Adaptability is light (stage presets + occupation perk); not a deeply dynamic per-person RPG.
  - _Evidence:_ Onboarding sets age/gender/life-stage (app.js:1042) feeding STAGE_BASE/occupation perks (OCC_PERK app.js:1220); virtues + skill perks per person. But it's a fixed 8-virtue + perk-rank scheme, not the 'genius dynamic' adaptive system envisioned.

- **Use Johnson's 8 cardinal virtues without implying low ratings (Withers)**  ·  🟦 BIG  ·  _2026-06-21_
  > "Brian Johnson's 8 cardinal virtues should be considered . But also as per Brian withers we don't want to imply someone has low rating cuz that will lower their self esteem"
  - **Gap:** An 8-virtue, no-low-rating system shipped; not Johnson's exact 8 by name.
  - _Evidence:_ VIRTUES array has exactly 8 (zest/disc/love/courage/wisdom/curiosity/gratitude/hope, app.js:1054-1063); virtueDetail copy 'skills you level by living — do the thing, it ranks up' (app.js:1225) frames growth not deficit (Withers-aligned). But these are not Brian Johnson's canonical 8 (his are energy/wisdom/self-discipline/love/courage/gratitude/hope/curiosity — close but relabeled).

- **Make it an actual game (Binding of Isaac / Cookie Clicker upgrades / island survival)**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×2
  > "it should also be actual game starting with basic mechanics and we will build ontop. Maybe binding of Isaac?"
  - **Gap:** Walkable island game built; survival/enemy mechanics (pirates, natives) never built.
  - _Evidence:_ Full game mode: top-down walkable island (openGame, drawWorld app.js:1549, ISLAND app.js:1454), spark+upgrades (cookie-clicker-style: app.js:1720 'spark currency + compounding upgrades'). It's a real walkable game, but no survival/combat loop (no Binding-of-Isaac enemies, no island-survival mechanics).

- **Garden game funded by tracker points; start as a minimal cute Zen garden (currently off-brand)**  ·  🟦 BIG  ·  _2026-06-26_
  > "The garden game inside this app should work on a fundamental level... You make points or coins by doing the stuff in the time tracker... those points you can use in the garden game, which has to be cute"
  - **Gap:** Point-funded planting works; the requested pivot to a minimal cute Zen-garden aesthetic was not done — it remains the Cuphead island David called off-brand.
  - _Evidence:_ plantGarden() spends Spark (cost 20*(n+1)) to add plants to S.game.garden (app.js:1678-1680); '🌱 Plant in your world' button gated on shipping + spark (app.js:1730). Funded-by-points works. But the world is the Cuphead 1930s rubber-hose island (app.js:1339 'Cuphead world assets', WORLD_IMG cup-*.png) — i.e. still the off-brand style, NOT rebuilt as a minimal cute Zen garden.

- **More nuanced, complex self-rating system**  ·  ▫️ med  ·  _2026-06-21_
  > "Self rsting system way to simple should be a lot more nuanced and complex and clever"
  - **Gap:** Survey-based self-rating shipped but remains a simple Likert-style mapping.
  - _Evidence:_ surveySheet() (app.js:2848) builds a self-map via SURVEYQ on a SCALE, feeding base virtue/perk levels; '📊 calibrate my levels' button (app.js:1705). A multi-question survey exists but it's a modest scale-rating, not the deeply nuanced system asked for.

- **Character creation with many stats starting from age and gender**  ·  ▫️ med  ·  _2026-06-21_
  > "Workouts per weak now and goal and weight is just one of many stats that should be part of create a character . Starting with age and gender"
  - **Gap:** Age/gender + goals/stage captured; the broader many-stats creation (weight, workouts/week as stats) not implemented.
  - _Evidence:_ Onboarding step 2 collects gender + age (app.js:1042), step 6 rhythm/peak (app.js:1046), goals (app.js:1045), life-stage; charSheet edit (app.js:renderChar 're.onclick=charSheet'). Starts with age+gender as asked, but 'many stats' is limited (no weight/workouts-per-week stat creation).

- **8-directional sprite rotation like Heaven Inc, animated at every angle (wings move)**  ·  ▫️ med  ·  _2026-06-22_  ·  asked ×3
  > "I want character to rotate 360 like in my heaven inc game so I do think we need the 8 views"
  - **Gap:** 8 directions render; the 'animated/wings move at every angle' part is not wired in the walking sprite (only idle/fly sheets animate).
  - _Evidence:_ 8-way facing from spr-dir.png compass-order frames, DIR2CELL [0..7] (app.js:1334-1337,1515-1522), FAIRY_META dir n:8 (app.js:1332). Rotation to 8 cells is built. But each direction is a single hand-picked spin frame — there is NO per-angle wing-flap animation loop in world mode (walkF toggles only the idle/fly sheets, not per-direction wing animation).

- **Clicking the character opens a character card / skills / stats**  ·  ▫️ med  ·  _2026-06-23_
  > "You clip in your character. You see a character card... clickign character is for characterr skills andd stats"
  - **Gap:** Skills/stats exist (virtue tree, charSheet) but are not what tapping the character opens; the character→card binding goes to the mindmap instead.
  - _Evidence:_ In-world, tapping the fairy calls heroMenu()→mindmapSheet() ('see your life' identity map, app.js:'heroMenu'); the skill TREE/stats is reached by tapping the You tab / the in-world tree spot (WORLD_SPOTS app.js:1627 'tree → skills/character'). Tapping the character itself opens the mindmap, NOT a stats card.

- **You tab built fresh: keep Enter World up top, drop old menu below**  ·  ▫️ med  ·  _2026-06-24_
  > "We can keep the enter world feature on the top, but not much else below"
  - **Gap:** Enter World kept up top, but the old menu below was NOT dropped — many footer buttons remain.
  - _Evidence:_ #enterWorld '🎮 enter your world' button exists (index.html:1141, wired app.js:2931). But renderChar() still appends a stack of buttons below (calibrate, brain, see-your-life, wake/bed, redo, edit — app.js:1705-1712), so the 'drop everything else below' instruction is not honored.

- **Battery/charging animation fills live within the block (not just flip on completion)**  ·  ▫️ med  ·  _2026-06-25_
  > "The battery animation — the matte→shining fills live within the block. Right now the finish flips on completion; it doesn't visibly fill"
  - **Gap:** Live fill exists via re-render geometry; not a true animated charging effect, and DEVICE-UNTESTED for smoothness.
  - _Evidence:_ A live tracked stretch renders an incremental matchseg from track-start to NOW that grows each render (app.js:2107 'TRACKED stretch = ONE connected full-width striped bar', convfut splits at (now-bs)/(be-bs) app.js:2105). It fills as time passes, but it's a per-render geometric split, not a smooth CSS charging animation.

### Onboarding / personalization  (10)

- **App cleverly adapts to each user (the most important part of the app)**  ·  👁️ VISION  ·  _2026-06-21_  ·  asked ×2
  > "I want the app to cleverly adapt to users first user being me"
  - **Gap:** The vision (deep per-user adaptation as the core) is only partially realized: static lookup tables, not a model that learns the user.
  - _Evidence:_ Real adaptation surfaces exist: onboard() (app.js:1017) seeds activity library + habits from life-stage (STAGE_EXTRA app.js:993) and occupation (OCC_BY_K via seedKept app.js:1025); proactive() (app.js:1166) varies guidance by phase/state; virtues()/PERKS rank from logged behavior. But adaptation is rule/keyword-table driven, not 'clever learning' — no inference of preferences over time, exWant nudge is dead code (set nowhere).

- **App must know me, my goals, and my room's cleanliness state**  ·  👁️ VISION  ·  _2026-06-22_
  > "app doesn't know me well enough and doesn't know my goals and the state of my room cleanliness"
  - **Gap:** Room-cleanliness 'state' is a 2-day-since-tidy heuristic, not an actual known state; no onboarding capture of it.
  - _Evidence:_ Goals: captured (onboard step 5). 'Knows me': profile (gender/age/vibe/stages/occ/rhythm) stored in finish() (app.js:1031). Room cleanliness: only inferred indirectly via messy()=daysSince(lastTidy)>=2 (app.js:1110), set when a tidy task is logged (tidySheet app.js:2860). Onboarding never asks current room state.

- **Clever onboarding that learns the user's blueprint early and works at any life stage**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×4
  > "better onboarding procedure and the app needs to learn from the users needs and also work with the user at any stage of their development"
  - **Gap:** Onboarding captures, doesn't learn; the 'learn from needs over time' half is absent.
  - _Evidence:_ onboard() (app.js:1017) is an 8-step flow capturing vibe, gender/age, life-stages (22 in LIFESTAGES app.js:975, multi-select + type-in), activities, goals, rhythm. 'Any life stage' is well covered (student→retired→homemaker→figuring). But it captures a snapshot at setup; nothing 'learns' the blueprint afterward — no ongoing inference.

- **Layered onboarding: energy identity → virtues → behaviors → work/love → hobbies/crypto**  ·  🟦 BIG  ·  _2026-06-21_
  > "choose energy virtues that we will commit to every morning . Then the actual behaviors … And then for work and love. And then we add the hobbies and the crypto"
  - **Gap:** Missing the requested 'energy identity' stage and a dedicated 'virtues to commit every morning' stage (those live only in the daily recommitSheet, not onboarding). No crypto category.
  - _Evidence:_ onboard() (app.js:1017) layers: vibe → about-you → life-stage → 'Stock your life' behaviors (step 4, app.js:1044, grouped by DOM domains incl. work/love/hobby) → goals → rhythm. So behaviors and work/love/hobbies ARE layered.

- **Onboarding hobbies: much bigger grouped bento list, multi-select, type-in fallback, niche options**  ·  🟦 BIG  ·  _2026-06-23_  ·  asked ×3
  > "the list must be much, much bigger so the person can select all the things they do...it should all be grouped...you should see the bento box, but very greatly expanded"
  - **Gap:** It's grouped + expandable but the catalog is moderate, not the 'much, much bigger / very greatly expanded bento' with deep niche coverage David asked for; breadth depends on which stages are selected.
  - _Evidence:_ Step 4 'Stock your life' (app.js:1044) renders the activity library grouped by domain (DOM_ORDER sections), multi-select, with type-in fallback ('e.g. Rock climbing, Volunteer, Therapy'). 'Claude code' is a real seeded option (STAGE_EXTRA founder/developer app.js:996-1000).

- **Resolve logical-day vs calendar-day (wake-to-sleep boundary) design; establish day in onboarding**  ·  🟦 BIG  ·  _2026-06-26_
  > "There's the concept of today like the actual time when you're awake... and then there's a concept of today that's... ends at midnight... they don't actually match. So how do we deal with that"
  - **Gap:** The boundary is a fixed 4am rollover plus a wake/bed-derived window, not a true per-user 'day ends when you sleep' resolution; the conceptual tension David raised (logical-today vs calendar-today mismatch) is handled pragmatically, not fully designed away.
  - _Evidence:_ Logical day IS resolved in code: DAYSTART=4am rollover (app.js:80), logicalK() (app.js:81), dayWindow() builds a wake-3h → bed+2h timeline window (app.js:91), documented in TRACKER-HANDOFF-2026-06-26.md §'Day model (logical day, 4am rollover)'. Onboarding step 6 establishes wake/sleep ranges that feed it; a standalone Wake & bedtime editor (wakeBedSheet, app.js:599) lets you re-set live.

- **Onboarding asks exercise-per-week vs desired, weight, and goals**  ·  ▫️ med  ·  _2026-06-21_
  > "ask u how much u exercises per week versus how much u want and also u tell it ur weight and ur goals"
  - **Gap:** Workouts/week + weight were built (v1.2) then removed (v2.0); only 'goals' survives.
  - _Evidence:_ Goals ARE captured (step 5, GOAL_SEED app.js:989 + finish() P.goals app.js:1032). But exercise-per-week-vs-desired and weight are NOT in current onboard(). They existed in v1.2 (git c657844 'workouts/week now vs goal, weight + goal weight') then were dropped in the v2.0 virtue-tree rewrite (a1049c1). 'exWant' is still referenced in proactive() (app.js:1173) but is set nowhere — dead reference.

- **Learn and infer the user's 'masterpiece day' over time**  ·  ▫️ med  ·  _2026-06-22_
  > "as the app gets to know u … it can guess what ur masterpiece day is or u establish it over time"
  - **Gap:** The 'app guesses your masterpiece day over time' half is absent — only manual creation/apply.
  - _Evidence:_ Habit stacks (renamed from 'masterpiece days', comment app.js:497) exist as reusable day presets — DAY_PRESETS + user-built S.presets, applied via stackDetail/applyDayPreset (app.js:498-540). But these are manually built/saved, not learned or inferred from behavior.

- **Meditation adapts to experience level (beginner 5-min/many reminders vs experienced 29-min/minimal)**  ·  ▫️ med  ·  _2026-06-22_  ·  asked ×2
  > "it can adapt to new meditators or people out of practice who need no more than 5 minutes...and need more reminders than experienced who can do 29 minutes with minimal reminders"
  - **Gap:** Max duration is 10 min, not the requested ~29; adaptation is user-chosen each session, not inferred from a stored experience level.
  - _Evidence:_ meditation() (app.js:1847) adapts duration (2/5/10 min) and reminder frequency (often=11s / some=24s / spacious=42s, FREQ app.js:1848), with an explicit '0 attention span? pick often — I'll gently bring you back…you can't fail' hint (app.js:1874). Four guide voices.

- **App can guess lifestyle; user can also add hobbies/habits in a few clicks**  ·  ▫️ med  ·  _2026-06-23_
  > "The app can guess what their lifestyle is, but they should also be able to...in a number of clicks, start adding hobbies and habits"
  - **Gap:** The 'guess' is a single age→stage heuristic, not a real lifestyle inference; otherwise the add-in-clicks half is solid.
  - _Evidence:_ Guess: stageSuggest(age) (app.js:991) pre-picks a life stage from age, which seeds activities. Add in a few clicks: step 4 chips + the HABITS notebook page (app.js:545) + bento pickers add activities/habits in 1-2 taps.

### Vision / philosophy  (9)

- **Be my personal coach who masters the fundamentals with me (Brian Johnson + Brian Withers)**  ·  👁️ VISION  ·  _2026-06-21_  ·  asked ×2
  > "ur not helping me not managing me not coaching me … I need u to be my personal Brian Johnson and Brian withers"
  - **Gap:** Coaching is aspirational framing in copy/prompt, not a built coaching engine.
  - _Evidence:_ Onboarding guardian "Sage" (app.js:1040) + AI brain prompt frames as "a warm no-shame life coach" (app.js:2799); virtue/areté system (VIRTUES app.js:1055, VCLASS "The Sage" 1064) is Johnson-flavored. But there is no proactive coaching loop, no fundamentals curriculum, no Withers-style dialogue — it's a planner+tracker with coach framing, not an active coach.

- **Make a better, more functional spin on Brian Johnson's Heroic app**  ·  👁️ VISION  ·  _2026-06-21_  ·  asked ×2
  > "the app Brian Johnson already made which is: heroic and make my spin on it and make it better"
  - **Gap:** Captures Heroic's virtue/wisdom spirit but not its breadth (no coaching content library, journal prompts library, or '101' classes).
  - _Evidence:_ Heroic-derived virtue mechanics ARE present: 8 VIRTUES with "grow" prompts (app.js:1055-1062), virtue XP/levels (computeVirtues ~1124), "rest is heroic too" copy (app.js:339), Areté framing. A mantra teleprompter (mantraPlayer app.js:1947) + guided meditation/breathwork echo Heroic modules.

- **Feel like The Sims for real life**  ·  👁️ VISION  ·  _2026-06-21_
  > "It should feel like life is sims"
  - **Gap:** Sims-feel is a small explorable avatar world, not a life-simulation of needs/relationships.
  - _Evidence:_ A Cuphead-style explorable 2D world (drawWorld app.js:1549, openGame 1608) with a walkable character, diegetic Sims-style building menus (comment app.js:1624 "Sims-style"), free-look camera (camX/camY 1245). The world is real but small; it doesn't yet simulate life domains as living systems — it's a reward/avatar layer beside the planner.

- **Help you get rich and get healthy as main functions**  ·  👁️ VISION  ·  _2026-06-21_
  > "the app will help u get rich as one of the main functions of the app get rich and get healthy"
  - **Gap:** "Get rich / get healthy" exist only as activity categories + planning templates, not first-class engines.
  - _Evidence:_ Health and money are seeded as domains/goals/templates (Fitness & Food bento app.js:176-179, Money group 186, goal-decomposition templates for fitness app.js:406 and money/budget 408, GOAL_SEED "Save money"/"Get fit" 989, occupation "The Closer" sell/pitch perk 1220). But they're treated as ordinary activity domains — there is no dedicated wealth tracker or health tracker as a "main function."

- **No-shame world: never darkens, only waits to clear (Withers)**  ·  👁️ VISION  ·  _2026-06-22_
  > "The world never darkens, never scolds, never shows you a low number. On a hard day it simply hasn't cleared yet."
  - **Gap:** No-shame spirit honored in copy, but the literal "never darkens" was overridden by the burning-timeline dark-ghost design.
  - _Evidence:_ The no-shame TONE is built (ghost bubbles are neutral, drift "logged honestly" app.js:942, no low-number scolding). BUT the specific "world never darkens" rule is contradicted by the timeline's intentional darkening: missed plans go DARK/ghost (blockStatus app.js:104, "burnt sticks" app.js:2078, mixDark 287). The world-canvas itself doesn't darken, but the planner does.

- **Unify fractured systems into one living loop (do→mirror→world→pulled back)**  ·  👁️ VISION  ·  _2026-06-22_
  > "one loop seen from seven angles: do a real thing → the mirror reflects it → the world visibly changes → you feel pulled back"
  - **Gap:** Unification is an open rebuild goal, not achieved; systems still clash per the dev constitution.
  - _Evidence:_ A partial loop exists: track a real activity → it matches/shines on the timeline → spark/streak/virtue update → world reward. But CLAUDE.md itself flags the systems are still fractured ("two menu systems … they clash", REBUILD-PLAN targets unifying them). The do→mirror→world→pulled-back loop is not closed; the world doesn't visibly change from deeds.

- **App's purpose: pull people out of procrastination, activate heroic potential**  ·  👁️ VISION  ·  _2026-06-23_
  > "help people like me get out of this downward spiral of procrastination and stagnation and activate their heroic potential inspired by people like Jim Rohn, Brian Johnson"
  - **Gap:** Purpose statement; reflected in several features but not a measurable "activation" system.
  - _Evidence:_ Anti-procrastination affordances exist: Play=start-the-plan one-tap (startPlanned app.js:377), micro-steps to lower activation (MICRO app.js:1747), Replan to recover, mantra/affirmation keystone (app.js:1947). Virtue/areté = "heroic potential" framing. But this is the guiding mission, not a discrete feature — realized in fragments.

- **Help people who lack an organized method to plan their future (Cal Newport / Slow Productivity)**  ·  👁️ VISION  ·  _2026-06-23_  ·  asked ×2
  > "most people, probably don't have an organized method for planning their future unlike people like Cal Newport"
  - **Gap:** General planning method built; Cal-Newport-specific principles not implemented.
  - _Evidence:_ Planning scaffolding is built: never-a-blank-day suggestion engine (app.js:334), first-principles goal decomposition templates (app.js:403-411), guided onboarding that seeds a life. This gives an organized method. But no explicit Slow-Productivity mechanics (do-fewer-things, seasonality, obsess-over-quality) — Newport is inspiration, not a feature.

- **Deep audit + brainstorm to make app vastly more proactive, fun, and user-friendly**  ·  ▫️ med  ·  _2026-06-21_  ·  asked ×2
  > "deep audit then deep brainstorm. How to make app more proactive more fun and more user friendly each one a million times more"
  - **Gap:** Audit was done and partially executed; the proactivity ambition is far from realized.
  - _Evidence:_ The audit/brainstorm work product exists (AUDIT.md, EPIC-GAMEPLAN.md, MASTER-GAMEPLAN.md, REBUILD-PLAN.md, DESIGN-BRIEF.md). Many resulting items shipped (planning engine app.js:334, micro-steps, collapsing nav). But "a million times more proactive" is not achieved — the app is largely reactive; proactive nudging is thin.

### UI / UX / design / palette / art  (29)

- **Clear hierarchy of tasks: what you do and how often**  ·  🟦 BIG  ·  _2026-06-23_
  > "We need a clear hiarchy of tasks done in the app and how often we do what"
  - _Evidence:_ Habit-stacks (app.js:497,539), goal→subtask breakdown (449), chore 'every N days' cadence (app.js:126 every:3), mindmap of where days go (lifeInvest 466); a frequency model exists but no single unified 'hierarchy + how often' surface

- **Port the prior-session in-chat menu design 1-to-1 into the real app**  ·  🟦 BIG  ·  _2026-06-23_  ·  asked ×2
  > "the menus and stuff all the work we put in was gold so lets briing thhat in comepletly 1 to 1"
  - _Evidence:_ git 5222d5d 'Ship 1-to-1 redesign batch' and 2c54074 design-brief did port bento/calendar/onboarding/live-tracker; but '1-to-1' completeness is unverifiable against the chat mockups — substantial port, not provably exhaustive

- **App should be welcoming and clever, not intimidating**  ·  ▫️ med  ·  _2026-06-21_
  > "the app is intimidating it should be more welcoming and more clever"
  - _Evidence:_ proactive() copy (app.js:1168-1169), celebrate()/streak system, candy palette restyle — softer tone exists, but this is a subjective ongoing goal with no single discrete deliverable to mark 'done'

- **Take UI inspiration from the best apps (Instagram, Snapchat, Apple)**  ·  ▫️ med  ·  _2026-06-21_  ·  asked ×3
  > "take inspiration from all the best apps/ sites like Instagram … so the app is super inviting and clever and multifaceted"
  - _Evidence:_ Apple-Calendar 2-row header (git 4365e19), Apple-Music collapsing nav (app.js:692, index.html:919), Apple-Photos horizontal day-slide (app.js:826); Instagram/Snapchat-specific patterns not concretely traceable beyond general styling

- **Use color tactically to make the app addicting like Fortnite or Instagram**  ·  ▫️ med  ·  _2026-06-21_
  > "use color in a tactical way to make the all addicting like fortnight or Instagram"
  - _Evidence:_ streakColor()/streakTier()/comboTier() gradient tiers (app.js:305-312), celebrate() confetti+haptics (317-328) — gamified color reward exists; 'addicting like Fortnite' is aspirational not a discrete feature

- **Never any white — no white backgrounds, paper, or near-white UI**  ·  ▫️ med  ·  _2026-06-21_  ·  asked ×4
  > "Too much white not enough interesting powerpuff colors"
  - _Evidence:_ Dark-pink theme overrides (index.html:414-463) plus git ebdc961 'real white-top fix'; BUT base CSS still has many background:#fff (hero hp line36, nowBtn 48, .add 53, scard 77, inputs 83) — the dark theme covers the app surface but white persists in base sheet/editor styles

- **Night mode: replace every white with dark while keeping cool colors prominent**  ·  ▫️ med  ·  _2026-06-21_  ·  asked ×3
  > "the app still has too much whhite should be more nightmode but keep cool colors"
  - _Evidence:_ Dark hot-pink theme with light text overrides (index.html:451-463) realizes a night-mode-like surface keeping bright colors; but it's the single fixed theme, not a toggle, and white remnants persist (see 'Never any white')

- **Plan-today menu must be minimal/simple (radial menu)**  ·  ▫️ med  ·  _2026-06-22_
  > "Plan today menu is too overwhelming . Menu should always be minimal and simple maybe we can use radial menu u click to add day plan bubble."
  - _Evidence:_ The picker IS minimal now — the bentoPicker (app.js:2447+) replaced the overwhelming menu; but the RADIAL form specifically was killed (git bde0ecf 'kill radial') in favor of bento. Minimal goal met, radial shape dropped

- **Detailed, alive, weighty character animation (not static/robotic)**  ·  ▫️ med  ·  _2026-06-22_
  > "there should be a lot more detailed, beautiful animation where Character feels a lot more alive...Character feel like they have weight."
  - _Evidence:_ paintGuardian/drawGuardian walk cycle + jump squash jsc + bob (app.js:1411,1513), 8-way facing from spin frames; some life present but no advanced weight/secondary-motion system — partial vs the ask

- **Radial menu with emoji + clever vibe defaults + multi-select multitasking**  ·  ▫️ med  ·  _2026-06-22_  ·  asked ×2
  > "Radial menu: emoji on every option, clever "vibes" defaults, multi-select for multitasking timer"
  - _Evidence:_ Emoji + multi-select multitasking ARE built (bentoPicker multi:true, assignTimerMulti app.js:374,483); 'vibes' context row exists; but the RADIAL form was killed (git bde0ecf), replaced by bento

- **Menus should be part of the game, not full-screen**  ·  ▫️ med  ·  _2026-06-22_  ·  asked ×3
  > "menus look bad they should not be full screen but rather part of the game"
  - _Evidence:_ liveDock is a pull-up dock (index.html:572 #liveDock), bento is a centered card not full-bleed; but bento-ov still covers the screen (index.html:579 inset:0) and notebookSheet is a modal — not truly embedded in the game world

- **Add a game HUD**  ·  ▫️ med  ·  _2026-06-23_
  > "We should add a game hud i think that would help"
  - _Evidence:_ renderHero()/guardianCap shows class·Lv·spark (app.js:1695), streakbar chip on timeline (2041), spark counter; these are HUD-ish elements but no dedicated overlaid game-HUD on the world canvas

- **Everything accessible like a 3D/Comfy UI, but without keyboard**  ·  ▫️ med  ·  _2026-06-23_
  > "i want the feeling of evverrthinig is accesible like in a 3d app or in comfy uii. but without keyboard"
  - _Evidence:_ bento expand-in-place, pinned favourites, no-keyboard tap flow (actChip), radial mindmap node-select (app.js:481) gesture toward node-graph access; but not a full Comfy-style node canvas

- **Center FAB icons: Today two-layer, Goals target, garden=You**  ·  ▫️ med  ·  _2026-06-24_
  > "i liike the icon of the today being two thiings on top of each othher and goals being target. then the ggarrden being you on the rright"
  - _Evidence:_ index.html:44-46 nav: Goals=ti-target (matches), You=ti-plant-2 (garden/plant, reasonable), but Today=ti-layout-list (a list icon, NOT the 'two layers stacked' the request asked for)

- **Customizable-size top quick menu for most-important items, pin-to-far-left**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "the most important. Should be customizable where you can pick the size. Like, they can be big squares"
  - _Evidence:_ isPinned/togglePin via press-hold (app.js:2431-2453); pinned float to a '★ Pinned' row at the TOP/front shown 'big' (2465-2466); but the size is auto (big class), NOT user-customizable, and it's top not far-left

- **Now-control menu floats slightly above, right-side only (reality, not plan)**  ·  ▫️ med  ·  _2026-06-25_
  > "this kind of now menu with all the settings is something that's floating slightly above. Or it's only on the right side of the screen because it's only about reality"
  - _Evidence:_ Live readout sits on the RIGHT of the now-line (.nowread right:6px index.html:571); the control surface is the bottom liveDock not a right-floating now-menu — right-side reality readout built, floating-above control menu only partial

- **Tracker floats above on the right with clear matrix-based options**  ·  ▫️ med  ·  _2026-06-25_
  > "lets trry make the tracker like image 4 floatingg abovve on the right... clear optiionns based don the matrix"
  - _Evidence:_ renderLiveTracker + liveDock (index.html:572) gives Plan/Replan/Drift segmented options and a right-side now readout; but it's a bottom dock, not a right-floating matrix card as 'image 4' asked

- **Past bubbles physically connected to now-line while tracking; now-line colors by current activity**  ·  ▫️ med  ·  _2026-06-25_  ·  asked ×3
  > "the past bubbles ae pysicallly connectedd to the now line because u are trackiing"
  - _Evidence:_ Tracked stretch connects up TO the now-line as one bar (app.js:2107); now-line circle takes the activity color _lc (2053 nc.style.background=_lc); BUT the now-LINE itself is hardcoded pink #ff5fa8 (later request — see 'present line stays pink'), color shown only in the circle, contradicting the earlier 'now line is the activity color'

- **Future bubble glows when live tracking starts matching it (alive only in tracker menu)**  ·  ▫️ med  ·  _2026-06-25_
  > "when the time tracking starts matching the future bubble, then the future bubble can start glowing because you're bringing it into the present"
  - _Evidence:_ When tracking matches a plan it draws the connected matched striped seg with inset glow (app.js:2107 boxShadow inset ...#ff5fa8); but no distinct 'future bubble lights up as you approach it' glow state — the match shows once tracking covers it

- **Minimum render size for small activities + clever zoom-out packing in correct order (never dots)**  ·  ▫️ med  ·  _2026-06-26_
  > "we should have a minimum rendering size for an activity so if its 30 seconds u should still see it from afar as a certain minimum size... a system of keeping them visible in a clever way in the correct order as u zoom out"
  - _Evidence:_ Bars have a min height floor (Math.max(5..14) app.js:2058,2069) and thin ones get a rail symbol in time order (2091); but there's no explicit '30-second activity keeps a guaranteed minimum visible size from afar' rule — thin bars can still collapse to a rail chip, so the 'minimum render size' guarantee is only partially met

- **Bubbles should feel bubbly and fun to interact with**  ·  · small  ·  _2026-06-22_
  > "the bubbles need to feel more fun to interactive they are squares with rounded edges but still should feel bubbly"
  - _Evidence:_ .calblk rounded bubbles with shine/foil gloss (index.html:518-519); iPhone-style reflow exists; 'bubbly' tactility is subjective with no springy-physics deliverable beyond press states

- **Notebook and pull-down not full-screen; always pullable back up with bottom affordance**  ·  · small  ·  _2026-06-23_  ·  asked ×2
  > "i don't want the noteebook to be full screen... u can always pull it back up"
  - _Evidence:_ liveDock has .ld-grab handle (index.html:572) and day-stacksep affordance; pull-timeline is the persistent Today surface; but notebookSheet remains a modal overlay, not a non-full-screen pullable panel

- **Make timeline text bolder, thicker, larger, less formal (Wes Anderson font)**  ·  · small  ·  _2026-06-23_
  > "more bold, more readable, more thick, more large. and less formal vibe. Kinda like that Wes Anderson font"
  - _Evidence:_ Jost font used across timeline labels (index.html:104,116 etc); bold weights 700-800; Jost is a clean geometric (Wes-Anderson-ish Futura) sans — close to the ask but not a literal Wes Anderson typeface; David later asked to REMOVE extra letter thickness/shadow (see that item)

- **Remove yellow selection outline**  ·  · small  ·  _2026-06-24_
  > "certain things are selected with the yellow outline. It looks bad... Get rid of that"
  - _Evidence:_ app.js:2451 comment 'no yellow' on chips; selection now ✓-mark + .sel class not a yellow outline; BUT .calblk.pin still uses yellow border (index.html:232 rgba(255,210,74)) — pin indicator yellow remains

- **Bento in two columns with diagonal stripes and shimmer**  ·  · small  ·  _2026-06-24_  ·  asked ×3
  > "i want bento in two columns like imagge one"
  - _Evidence:_ .bento-tiles grid-template-columns:1fr 1fr two columns (index.html:627); shimmer/foil exists on bubbles; but diagonal stripes are on timeline bars, not clearly on the bento tiles themselves — stripe-on-bento not confirmed

- **Thick now-line with balls on the sides**  ·  · small  ·  _2026-06-25_
  > "i like now is thick wit hthe balls on the siides"
  - _Evidence:_ .nowline border-top:4px (thick) #ff5fa0 + .nowcirc 16px ball on the LEFT (index.html:562-564); but the dual-side ::before ball was disabled (line 563 .nowline::before{display:none}) — one circle (left), not balls on both sides

- **Pink Now circle with 'now' text, fully visible, not cut off by phone edge**  ·  · small  ·  _2026-06-25_  ·  asked ×2
  > "now is not signified with a pink circle that was good and with text that says now"
  - _Evidence:_ .nowcirc left:-3px pulled to edge with the icon (index.html:564 'pulled hard to the left edge so it clears the hour numbers'); shows the activity ICON not literal 'now' text when tracking (app.js:2053); 'NOW'+time text only shows when NOT tracking (np branch)

- **Present line should remove text rather than cover it**  ·  · small  ·  _2026-06-25_
  > "if the present line is in front of text better remove the text all together than to have it covered by a line"
  - _Evidence:_ nowRightBand reserves the now Y-band so rail chips dodge it (app.js:2046,2053); live card grows upward avoiding overlap (2188); but no explicit 'delete the label under the line' rule found — collision is handled by dodging/repositioning, not text removal

- **Now indicator stays in one fixed (non-circular) spot, scrollable away from**  ·  · small  ·  _2026-06-26_
  > "the transparent circular thing on top... I don't want it to float always on top. I want it to stay in one spot. So you can scroll away from it. the vibe it should not be circular"
  - _Evidence:_ now-line is anchored at its true time position in the scroll (app.js:2053), scrollable away — fixed in time not pinned to viewport; but it still includes the .nowcirc CIRCLE (index.html:564), contradicting 'not circular'

### Planning / day-structure  (17)

- **Help build a masterpiece day from a good AM bookend (sports, deep work, removing kryptonites)**  ·  🟦 BIG  ·  _2026-06-21_
  > "masterpieces day built from good am on bookend . Sports. Deep work . Removing cryptonites"
  - **Gap:** Masterpiece-day save/fill and a morning bookend exist, but there is no guided "build a masterpiece FROM your good AM bookend" flow and nothing about removing kryptonites — it's a generic full-day preset + saved snapshot, not the bookend-anchored construction David described.
  - _Evidence:_ saveMasterpiece/fillMasterpiece (app.js:2619-2620), "🌟 Fill my masterpiece day" (app.js:2639), MORNING_RITUAL bookend (app.js:152), recommitSheet morning. DAY_PRESETS incl. "Full Day" (app.js:489).

- **Offer to plan rest of night and plan tomorrow (habit tracker + calendar)**  ·  🟦 BIG  ·  _2026-06-21_  ·  asked ×4
  > "it doesnt offer to plan the rest of my night and plan tomorrrow wich iit should ddo . should be like habbit trackerr and calendar and more"
  - **Gap:** It surfaces a "Plan tomorrow" suggestion chip contextually, but there is no proactive "plan the rest of your night" prompt as a distinct flow; it's a passive chip, not the active evening planning ritual.
  - _Evidence:_ Time-of-day suggestion engine emits "Plan tomorrow" chips evening/night/on-track (app.js:1168-1172) → planSheet(tomK()). Habits (renderHabits) + calendar both exist.

- **Evening replan: know priorities and must-dos with limited time left**  ·  🟦 BIG  ·  _2026-06-23_
  > "The app should understand that you have a couple hours left and should know your priorities, what you like to do even when you're running out of time"
  - **Gap:** There IS priority-aware bumping when over budget, but no dedicated evening-replan flow that reasons about hours-left + must-dos; the smart "what to keep when out of time" ask is still in the ledger as not built (handoff #5).
  - _Evidence:_ Over-budget engine bumps low-priority slots: "I bumped N low-priority slots so what matters survives" (app.js:1168); priority field on blocks + reflow respects pins. Evening "Plan tomorrow" chip.

- **Long-term goal planning: break grand goals into subtasks down to daily activities**  ·  🟦 BIG  ·  _2026-06-23_  ·  asked ×2
  > "plan grand things on a super long term level than breaking it down into subtask... all the way down to a day to day level"
  - **Gap:** Single-level decomposition (goal → steps → schedule a step), not the multi-tier "grand → sub → sub → day-to-day" recursive breakdown. One layer deep only.
  - _Evidence:_ Goals pillar: goalsSheet, decomposeGoal templates (app.js:402-449), subtasks with scheduleSubtask dropping steps into a day's calendar (app.js:418). Active goals pull next step into today's suggestions (app.js:345).

- **Plan button opens plan-menu (activity+duration+priority) then Start renders it on the left**  ·  🟦 BIG  ·  _2026-06-25_
  > "pressing the plan button should allow you to plan ahead. So you have to plan not only which activity, but how long it's gonna last... only then when you press start does the plan show up on the left side"
  - **Gap:** A plan menu with activity/duration/priority exists, but it places blocks immediately rather than the specific "plan first, only on Start does it appear on the left lane" staged flow David described.
  - _Evidence:_ planSheet (app.js:2721) is an activity+duration+priority menu (cfg.mins/cfg.prio, app.js:2722-2729) that drops blocks onto the day. liveDock Play = startPlanned renders/tracks the plan (app.js:946).

- **Dedicated Plan-Day menu: choose activities first, then assign times/order on a future-only calendar**  ·  🟦 BIG  ·  _2026-06-25_
  > "first, you choose all the activities, and then you assign them a time in the calendar... a simplified view that focuses on only the future... easy to first choose the activities, then choose the order and the time"
  - **Gap:** You can choose activities first and they land on the timeline to arrange, but distributePlan auto-stacks them at 30-min back-to-back; there is no dedicated future-only simplified calendar step for assigning order/time as a separate phase. Handoff #5 flags the full planner as not built.
  - _Evidence:_ planDay(k) → "Pick activities" multi-select bento → distributePlan stacks them back-to-back (app.js:770-778, 746-753). Daily fundamentals + habit-stack options too.

- **Non-negotiables: flagged activities survive a reschedule, hold to bedtime, ask what to keep if out of time**  ·  🟦 BIG  ·  _2026-06-25_  ·  asked ×2
  > "Non-negotiables — flagging activities that survive a reschedule and hold to the end"
  - **Gap:** Only the pin-in-place half exists. Comments explicitly defer the rest: "shorten-by-priority comes with the non-negotiable system" (app.js:383) and ledger #5 lists non-negotiables (hold-to-end, out-of-time→ask what to keep) as still NOT built.
  - _Evidence:_ editor has a PIN toggle (o.pin, app.js:2359) and reflow treats pinned blocks as fixed obstacles others flow around (app.js:2588/2595).

- **Replan erases future from now forward; pushes/shortens next block by priority**  ·  🟦 BIG  ·  _2026-06-25_
  > "if I replan, that something else is basically erased because of the new plan... if we touch upon the next bubble, we either push everything downwards or we shorten the next bubble depending on how important"
  - **Gap:** It erases the straddling block's future half and pushes following blocks, but the priority-based SHORTEN-the-next-block decision is explicitly deferred ("shorten-by-priority comes with the non-negotiable system", app.js:383) — only push, not the priority-weighted shorten-vs-push fork.
  - _Evidence:_ planBreak/Replan: truncates any block straddling now to end at now (app.js:381), inserts a pinned NOW block, reflow pushes following blocks down (app.js:379-383).

- **Plan starting block by time of day (bed/clean if late, bookend/journal if early)**  ·  ▫️ med  ·  _2026-06-21_
  > "starting is usually making ur bed and cleaning or if it's late then moving towards bed . Or if it's early doing an bookend and journaling"
  - **Gap:** Suggestions are keyed to time of day, but there's no explicit "your starting block should be bed/clean (late) vs bookend/journal (early)" first-block logic in the planner itself.
  - _Evidence:_ contextPrompt/time-of-day suggestions: morning→bookend+plan, night→"Wind down"/tidy, SUGGEST table by daypart (app.js:337-339, 1168-1172).

- **Planning can include a journaling session**  ·  ▫️ med  ·  _2026-06-23_
  > "part of the plan can be like a journaling session"
  - **Gap:** Journal exists as an activity you can place and as a ritual step, but it isn't an integrated "journaling session" stage inside a planning flow.
  - _Evidence:_ Journal is a pickable activity (restore domain, app.js:191/270/297) and there's a pull-down journal surface + "Journal a few lines" ritual step (app.js:155). EVENING_RITUAL.

- **Restore full planner mode (fully plan today and tomorrow)**  ·  ▫️ med  ·  _2026-06-23_
  > "we removed the plan today andian tomorrow feature where ur fully in planner mode"
  - **Gap:** A planning sheet exists for today/tomorrow, but the handoff (TRACKER-HANDOFF-2026-06-25 #5, 06-26 ledger #5) lists the full immersive "planner mode" builder as still NOT BUILT; what exists is a lighter pick-and-place sheet.
  - _Evidence:_ planDay(k) (app.js:770) + planSheet (app.js:2721) + distributePlan (app.js:746) let you plan any day incl. tomK(). "Plan day" in dayToolsMenu (app.js:738).

- **Presets live as a tab inside Goals to stack into days**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "presets can go into ggoals so its just a tab inside goals to stack them iinto days"
  - **Gap:** Presets are reachable from Goals via a menu row/button, but not implemented as a literal tab inside the Goals sheet alongside the goal map — it opens a separate presetsSheet overlay.
  - _Evidence:_ goPresets wires Goals tab → presetsSheet (app.js:2924); Goals menu has "Habit stacks · build & apply day presets" entry (app.js:590).

- **Past reality editable; past goals not editable**  ·  ▫️ med  ·  _2026-06-24_
  > "you can rewrite the past when it comes to reality, but you can't rewrite the past when it comes to your goals"
  - **Gap:** Reality (logs) is editable and the past plan is largely frozen, but it's not a clean "past goals are NOT editable" lock — past plan blocks can still be opened in the editor and reordered/relabeled; the distinction is softened, not enforced.
  - _Evidence:_ blockPast()/blockPast logic: started/past plan blocks are set-in-stone for time (reflow skips them, app.js:2593) yet still reorder; past real logs are freely editable via logEdit/backfill (app.js:2233-2247). Past plan blocks: longer hold to move (app.js:2134).

- **Bubble editor: priority, start/end, duration in easy clicks; press activity to swap via bento**  ·  ▫️ med  ·  _2026-06-25_  ·  asked ×3
  > "when u click on a habbit bubble it has its own where u can choose priority and the start and end time and duration in easy clicks"
  - **Gap:** Priority + swap + duration are there, but start/end are not both editable in "easy clicks" — length is a slider and start time is implicit (only an "ends" readout shown), there is no discrete start-time and end-time stepper UI.
  - _Evidence:_ editorSheet (app.js:2330): priority segmented (app.js:2358), length via log-slider + ends-time readout (app.js:2349-2355), hero name = swap button → bentoPicker (app.js:2341).

- **Set length for past or future activity; show start and end times**  ·  ▫️ med  ·  _2026-06-25_
  > "If the activity is in the future, then you can choose its length. But also if the activity is in the past... things should say what time it begins and what time it ends"
  - **Gap:** Length is settable for past and future, but the editor readout shows only the END time ("ends …"), not both an explicit "begins X / ends Y"; the begins/ends pair David asked for is only partially surfaced.
  - _Evidence:_ editorSheet works for both plan (blockEdit) and log (logEdit) via isLog flag (app.js:2388-2389); length slider for both; readout shows "ends HH:MM" (app.js:2352). Cards show start–end on drag (fmt ranges).

- **Tiny-bubble length steppers (expand to 5/15 min) and simple 30s-to-12h slider, no hard zoom needed**  ·  ▫️ med  ·  _2026-06-25_  ·  asked ×2
  > "if you just click on the tiny thing, there should be options to expand it to, like, a minimum length, like, five minutes... Or it could offer you to make it fifteen minutes. or more"
  - **Gap:** The slider half is built; the explicit +/− steppers / "expand to 5 or 15 min" buttons are NOT — ledger #5 lists "bubble editor +/− steppers (currently a slider)" as still pending.
  - _Evidence:_ The 30s→12h log-scaled slider is built (MINM .5, MAXM 720, app.js:2344-2355). Thin bars get a tappable rail chip to open the editor (app.js:2277).

- **Empty bubble single-tap opens the bento picker instantly**  ·  · small  ·  _2026-06-25_
  > "The only reason the Bento would open in a single click is if you created an empty bubble"
  - **Gap:** Single-tap opens the full editor (with an empty hero), not the bento directly; you need a second tap on the hero to reach the bento. David asked for the bento to open in a single click for an empty bubble — that exact behavior isn't wired.
  - _Evidence:_ Empty-slot tap/hold runs makeBlock() → creates a 30-min empty bubble then opens editBlk(nb) the full EDITOR (app.js:2261-2271). The editor's empty hero then says "choose activity" → bento on click (app.js:2339/2341).

### Navigation / timeline / scroll / gestures  (15)

- **Clever intuitive small-screen menu integration so the user is never lost**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×2
  > "the iPhone is small, there has to be a very smart way"
  - **Gap:** Aspirational/never-finished; the handoff still lists nav feel as DEVICE-UNTESTED. Real-app progress exists but it's an open theme, not a closed deliverable.
  - _Evidence:_ Apple-Music collapsing nav (index.html:920-927), tracking week-strip + Now/Today pill (setTodayBtn app.js:704), temporal anchors midnight/wake/noon/bed app.js:2056. Ongoing per handoff ledger.

- **Game-as-home: app opens into world, tap character for diegetic action hub (remove old tab UI)**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×2
  > "Game-as-home: app opens into the world; tap character → diegetic action hub; remove old tab UI"
  - **Gap:** Game-as-home was not adopted as the default; the planner is home and the world is an optional mode. Old tab UI intentionally kept.
  - _Evidence:_ Tap-character hub exists (heroMenu→mindmapSheet app.js:~1623; WORLD_SPOTS diegetic building taps app.js:~1628). But the app boots into tab-day timeline (document.body.classList.add('tab-day') app.js:2953), NOT the world; old bottom tab UI remains.

- **Reveal Today by sliding a menu down from the top with smooth same-color blend**  ·  🟦 BIG  ·  _2026-06-23_  ·  asked ×2
  > "slide from the top up downwards to reveal today...the thing on top is pink, but when you pull it down, it becomes dark blue...stays the same color throughout"
  - **Gap:** The smooth pull-down was built then demoted: per memory 'reuse-pulldown-as-Today kept always open'; pull-down survives only as the close-handle / garden-mode path.
  - _Evidence:_ Smooth finger-follow pull-down exists (pullGrab app.js:971: translateY follows -dy/H, doesn't snap full). But Today is now ALWAYS-OPEN (index.html:939), so the pull-down-to-reveal is no longer the home path.

- **Day→week→month switched by zooming out, back by zooming in (meaningful symbols not +/-)**  ·  🟦 BIG  ·  _2026-06-23_  ·  asked ×2
  > "going from day to week and then to month should be simply by zooming out and zooming in"
  - **Gap:** Switching is via three labeled scope buttons + animated zoom, not an actual pinch-zoom-out gesture crossing day→week→month. The pinch gesture only zooms hour-density within day.
  - _Evidence:_ scope-seg uses meaningful icons ti-list/ti-layout-columns/ti-layout-grid (app.js:792) with zoomAnim transitions; zoom(dir) maps day→week→month app.js:785. NOT plus/minus.

- **No overlapping bubbles at any zoom level (only drift-mid-habit split breaks a bubble)**  ·  🟦 BIG  ·  _2026-06-25_
  > "main goal now is to avoid the mess on screen, so no overlapping at any Zoom zoomed in or out"
  - **Gap:** Strong anti-overlap machinery exists, but David's goal is the open ledger item #2 (min render size + zoom-out packing) — not yet confirmed clean at all zoom levels on device.
  - _Evidence:_ True time-height bars + reflow() app.js:2586 / reflowLogs app.js:2581 / layoutLane app.js:2019 prevent stacking; place() uses true height so back-to-back can't overlap (comment app.js:2061).

- **Full-screen narrower bubbles; failed plans spawn replacements on the right**  ·  ▫️ med  ·  _2026-06-22_
  > "bubbles should take up full screen and should not be as wide so that when u fail ur plan new plan gets added on the right"
  - **Gap:** Narrow two-lane is built, but no auto-spawn of a fresh replacement plan 'on the right' when a plan fails — the real lane is just freed for what you actually do.
  - _Evidence:_ Two-lane layout (PLAN left / REAL right) exists: place() lane P at left:26px, real lane at left:calc(50%+4px) app.js:2061,2190. A failed straddle keeps the ghost in the plan lane leaving the real lane free (app.js:2102-2108).

- **Mirror + AI-brain in one workspace menu; planner + habit tracker in another**  ·  ▫️ med  ·  _2026-06-22_
  > "Mirror and you should be part of same workspace menu. And also planner and habit tracker ."
  - **Gap:** Items exist but not cleanly split into the exact two 'workspace' menus David described; Mirror (mindmap) is reached separately from the notebook, not co-located with Brain.
  - _Evidence:_ notebookSheet app.js:580 groups Brain (app.js:593) + Redo setup + wake/bed; mindmapSheet is the 'mirror'/identity hub (heroMenu app.js:~1623). Planner + habit tracker both live on the Today timeline.

- **Restore the full Heaven Inc navigation system + skateboard**  ·  ▫️ med  ·  _2026-06-22_
  > "Restore "the full navigation system of Heaven inc and the skateboard.""
  - **Gap:** Skateboard + twin-stick movement present, but it's the world-walk subsystem, not a 'full Heaven Inc navigation system' wired as the app's primary nav.
  - _Evidence:_ Joysticks ported (initJoy app.js:1266, joy2 app.js:1310) + skateboard: skateOk() app.js:1248, skateOn toggle app.js:1285, doJump bigger air app.js:1250, trick/flip state app.js:1252.

- **Bottom info menu slides up to expand to a larger menu**  ·  ▫️ med  ·  _2026-06-23_
  > "the bottom is like a menu of information, and if we slide up, it expands to a largerr menu"
  - **Gap:** There's a bottom dock and a collapse/expand, but the specific 'slide the bottom info up to a larger menu' gesture is more the nav-collapse + pull-timeline than a dedicated slide-up expander.
  - _Evidence:_ #liveDock is the bottom info panel (renderLiveDock app.js:924) with a .ld-grab handle (index.html:953); collapsed/expanded states via nav-collapse (index.html:925). Pull-down (pullGrab app.js:971) reveals the bigger timeline.

- **Keep bento box always nearby for quick access to many habits; scroll inside categories**  ·  ▫️ med  ·  _2026-06-23_  ·  asked ×2
  > "the bento box needs to be always nearrby for acess u know?"
  - **Gap:** Bento is a quick-open overlay, not an always-visible persistent panel; category scrolling exists inside the overlay but it isn't permanently on-screen.
  - _Evidence:_ bentoPicker (overlay app.js:135) groups by domain/category (bentoByDomain, view.cat) and is reachable from many entry points (Plan day, Replan, tap-empty). Scrollable .bento-body overlay.

- **Press-hold-drag in plan mode pulls out an empty habit bubble to assign**  ·  ▫️ med  ·  _2026-06-24_
  > "In plan mode press and hold and then drag pulls out empty habit bubble that u click to pick what it is"
  - **Gap:** The drag-out-an-empty-bubble gesture was simplified to tap/hold-create (inline comment app.js:~2261 'drag-on-timeline can't beat the scroller, so we don't try').
  - _Evidence:_ Press-hold on empty space creates an empty bubble (makeBlock app.js:~2262, 'tap to choose' empty card app.js:2120) that opens the picker. But it's a tap/hold-create, not a press-hold-DRAG-OUT motion.

- **Smooth beautifully-animated timeline zoom (not jittery)**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "Zooming in and out of the timeline does not feel smooth... Should be a very smooth, convenient, easy thing"
  - **Gap:** Smoothing work shipped, but David (2026-06-25) still reports zoom jittery/broken; not confirmed smooth on device.
  - _Evidence:_ zoomLive throttled to one rAF reposition per frame app.js:658, nodes repositioned by cached minute (no teardown) app.js:647, zoomCommit settle app.js:657.

- **Place menus cleverly like the Instagram UI**  ·  · small  ·  _2026-06-21_
  > "The menus need to be located in clever place like the Instagram ui"
  - **Gap:** Intent honored via the compact header + collapsing bottom nav, but no literal Instagram-style UI.
  - _Evidence:_ Menus are placed deliberately (bottom Apple-Music collapsing nav app.js:2951, ⋯ tools dayToolsMenu app.js:731, compact header), but no Instagram-specific layout; it's a general 'clever placement' interpretation, not an IG clone.

- **Live tracking-now panel anchored at top; notebook button bottom-right above right stick**  ·  · small  ·  _2026-06-23_
  > "what ur tracking now from above is not bad instead of form bellow. and notebook button bottom right above the right stick"
  - **Gap:** Tracking-now is shown on the now-line/dock, not a top-anchored panel; notebook button is bottom-left, not bottom-right above the right stick.
  - _Evidence:_ Now readout is on the timeline (nowread app.js:2053) and live dock #liveDock exists. Notebook door is bottom-LEFT 'above the stick' per app.js:579 comment.

- **Don't let link circle cover time or extend current activity into the past**  ·  · small  ·  _2026-06-25_
  > "I don’t like that it extends the current activity into the past... I don't want the link circle to cover the time looks sloppy"
  - **Gap:** The now-circle no longer covers the time label, but I found no explicit guard stopping the live activity from extending into the past beyond the gript prev-shift logic; partially addressed.
  - _Evidence:_ Now-line redesigned: nowcirc carries the icon in the left gutter (app.js:2053), no label under it; nowread sits to the right. nowRightBand makes rail chips dodge the now readout (app.js:2046).

### Tracking / logging  (13)

- **Adapt as you follow or stray; always offer to get back to your plan**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×3
  > "As you commit to your plan or steer off the plan cleverly adapts and always offers you to get back to ur plan at any moment"
  - **Gap:** Offer-to-return is via the always-present Replan/Play buttons, not a proactive notification engine; no active 'you're drifting, want back?' prompt.
  - _Evidence:_ Live dock always shows Plan/Replan/Drift; Play=start the plan (ldStop app.js:946, startPlanned app.js:377); planBreak() app.js:379 reflows to get back on track. 'ON PLAN'/'DRIFT'/'tracking·no plan' status app.js:940-942.

- **Habits as parent categories broken into sub-habits (deep work → success habits)**  ·  🟦 BIG  ·  _2026-06-22_
  > "The habit is deep work and then within deep work we can break down our main habits for working success"
  - **Gap:** Hierarchy is domain→activity, not a configurable nested habit tree.
  - _Evidence:_ 8 domains contain grouped activities (Work>Focus has Deep work/Claude code/Programming, app.js:183); habit stacks group activities (presetsSheet app.js:497+). But no true parent-habit→sub-habit tree where 'deep work' is a parent owning child habits.

- **Reuse the same habit catalog across time tracking, day planning, and month planning (log once, Sims-style)**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×2
  > "use those same habits in ur time tracking and day planing and month planing"
  - **Gap:** No month-planning surface exists; 'log once' covers day+timer+habits only, and there's no skill-tree-driven habit unlock loop.
  - _Evidence:_ Same allActivities()/bentoByDomain() catalog (app.js:2430) feeds tracking, day planning, habit stacks, and habitsSheet app.js:546; custom adds persist in S.acts. Tied into stats (virtueOf/skill tree app.js:1211+).

- **Build a mind-map system of the habits you do (see a life through its habits)**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×2
  > "The system should build a mind map system of habits that u do"
  - **Gap:** Shows 8 domain planets by time-spent, not the per-habit branching tree David described.
  - _Evidence:_ mindmapSheet() app.js:467 'see your life' — domains as planets sized by where days go, vices shown honestly, SVG lines from a central 'you' node (app.js:479-485). It's a domain-orbit map, not an outgrowing branch tree of individual habits.

- **Drift mode: plan how long to drift, then adjust full plan to get back on track**  ·  🟦 BIG  ·  _2026-06-24_  ·  asked ×2
  > "u can plan ahead and decide how long u want to do current task even if its a drift task. And then u can plan to get back on track"
  - **Gap:** Duration-bounded drift + reflow exists; the proactive 'notify when about to go off plan' part is not built.
  - _Evidence:_ planBreak() lets you pick a drift activity + a duration (durationSheet app.js:401) which pins it and reflows the plan forward (app.js:379-384). But there's no countdown/notification 'you're about to go off plan' as David described.

- **Pick current activity via top-down category drilldown**  ·  ▫️ med  ·  _2026-06-21_
  > "choose category and then choose subcategory all the way until u find ur task"
  - **Gap:** Earlier multi-level tile-drill (v336 radialMenu / pickerSheet) was superseded by the flatter bento grid; drilldown is now 2-deep with search, not arbitrary depth.
  - _Evidence:_ bentoPicker() app.js:2433 shows a domain overview grid then renderExpanded(d) app.js:2495 opens one domain into sub-groups (bento-subh app.js:2503). Two levels (domain → subgroup tiles), not the deep 'all the way until u find ur task' multi-level drill.

- **Timer tool and journal mirror each other (add in one adds in the other)**  ·  ▫️ med  ·  _2026-06-23_
  > "the tool above to time yourself and the journal should be identical...if you add something in the journal, you add something in the tool above"
  - **Gap:** Single shared data model means they can't diverge, but there's no second journal surface that round-trips edits as David framed it.
  - _Evidence:_ The pull-down (buildPull) and the Today timeline render the same renderToday() lanes from the same S.blocks/S.log/S.timers, so adds reflect in both. But there's no distinct 'journal' entity separate from the timer that mirrors writes.

- **Multitask tracking: run concurrent activity timers (then later removed — single lane)**  ·  ▫️ med  ·  _2026-06-23_  ·  asked ×3
  > "The app should offer you to add multitask activity like smoking weed... the Claude code timer is still going on"
  - **Gap:** Concurrent split-lane multitask deliberately removed per David; only a single combined timer with multiple tags remains.
  - _Evidence:_ Multi-select combos still supported (assignTimerMulti joins tags with '+', app.js:2017; 'multitasking welcome' hint app.js:2010). But concurrent SEPARATE running timers were removed — startOrSwitch stops all running before starting (run.forEach stopTimer app.js:374); git 'no multitasking split' b885f7b (v395).

- **Press-and-hold timer to change activity and replan duration (pushing planned items further)**  ·  ▫️ med  ·  _2026-06-24_  ·  asked ×2
  > "press and hold wich will change what ur doing and offer u to replan at the same time thus choosing how long u plan to do this activity"
  - **Gap:** No long-press gesture on the live timer; the replan-duration flow exists but is triggered by the Replan button.
  - _Evidence:_ Replan via planBreak() durationSheet (pick activity + how long, app.js:379-384) reflows/pushes later blocks; reachable via the dock Replan button. But it's a button, not a press-and-hold on the running timer.

- **Late-started block shows complete bar but incomplete plan on the right**  ·  ▫️ med  ·  _2026-06-25_
  > "maybe i started it late so it would be complete bar bbut on the top it wouldd be not complete on the rright cuz thhats part of failed plan"
  - **Gap:** The precise 'complete bar bottom + incomplete top-right' rendering David sketched is approximated by the straddle/partial split, device-untested.
  - _Evidence:_ Straddling-now logic splits a block at the present line: untracked past half = ghost in plan lane, tracked stretch fuses (app.js:2102-2107); partial-match splits matched-shine vs ghost-remainder (app.js:2090). Captures late-start as a split.

- **Doing the plan is itself a form of digital journaling**  ·  · small  ·  _2026-06-23_
  > "it will time you in doing that as well as a... a form of digital journal... journaling"
  - **Gap:** Implicit only — the day's log IS the journal; no freeform journal text tied to executing the plan.
  - _Evidence:_ Tracking/logging produces a timestamped real-lane record (logs(k) entries) that reads as a journal of the day; mood entries also log. But there's no explicit 'journaling' framing/notes field beyond activity logs.

- **Gap-fill should add only 15-30 min, then user adjusts length**  ·  · small  ·  _2026-06-23_
  > "Filling the gap on what you did shoukd not fill everything but just 15-30 minutes then h can adjust length urself"
  - **Gap:** Implemented opposite to the ask for small gaps — fills the whole gap rather than a 15-30min stub.
  - _Evidence:_ Backfill exists (app.js:2233-2246) but small/medium gaps (<=75min) fill COMPLETELY (gs=g[0]; gm=g[1]-g[0], app.js:2244), not a 15-30min seed. Larger gaps differ. Then resizable via grips.

- **Drift stays unnamed in the moment, labelable after the fact**  ·  · small  ·  _2026-06-25_
  > "u could evven label drift after thhe fact bbut iin thhe moment u just keep iit unamedd ddrift"
  - **Gap:** Label-after-the-fact works for any past log, but in-the-moment drift isn't left deliberately unnamed.
  - _Evidence:_ Past real items can be relabeled after the fact (relabel bentoPicker app.js:2208) and drift logs honestly; but the live drift flow (startOrSwitch) still prompts you to pick an activity up front rather than starting an unnamed drift.

### Other  (3)

- **Track all my asks; build in logical steps; maintain a living ledger; multi-agent to go faster**  ·  🟦 BIG  ·  _2026-06-22_  ·  asked ×4
  > "Always keep tab of things I asked for that u forgot or haven't implemented yet...development should be in clever logical steps...use many agents to multitask"
  - **Gap:** Ledger + logical-steps part is real and live in the handoff. The 'use many agents to multitask' part has no trace — single-session sequential work throughout.
  - _Evidence:_ TRACKER-HANDOFF-2026-06-26.md lines 21-39 = a maintained '📋 THE LEDGER' section (Done/DEVICE-UNTESTED/PENDING tables); memory file own-the-ledger-remind-every-step.md encodes the discipline; logical steps honored via versioned commits (v488→v506). NO multi-agent/parallel infra (.claude/ holds only launch.json + settings.local.json; no subagent config).

- **Grand audit of all past requests vs what was achieved across all sessions/directories**  ·  🟦 BIG  ·  _2026-06-25_  ·  asked ×3
  > "do audit of all my requests from the past to understand and review if we achieved my goals even if they evolved over time"
  - **Gap:** A comprehensive cross-session/cross-directory grand audit was requested 2026-06-25; the in-repo artifact is only the ledger's backlog line. The full audit is being run via this orchestration now rather than as a checked-in doc.
  - _Evidence:_ This very audit-verifier task IS the grand audit being executed now. Prior partial coverage: the handoff ledger (TRACKER-HANDOFF-2026-06-26.md:39 'Backlog (grand audit)') tracks some absorbed asks. No standalone committed grand-audit document exists in the repo as of v506.

- **Maintain a persistent ledger system so feedback isn't lost (system failure if dropped)**  ·  🟦 BIG  ·  _2026-06-26_
  > "I'm tired of losing my feedback along the way. that is a system failure"
  - **Gap:** A real ledger discipline exists (handoff section + memory rule), but it's manually maintained prose, not an automated/structured system — so feedback can still slip if a session forgets to fold an ask in. Partial, not a hardened system.
  - _Evidence:_ Persistent ledger exists as the '📋 THE LEDGER' section maintained in-place across handoffs (TRACKER-HANDOFF-2026-06-26.md:21-39) + memory own-the-ledger-remind-every-step.md ('track every ask done-vs-pending, surface it each step, new asks additive'). CLAUDE.md mandates updating the newest handoff in place rather than spawning new docs.

### Coaching / reminders / notifications / AI-guidance  (2)

- **Composable self-help stack with per-section durations (bubble UI like planner)**  ·  🟦 BIG  ·  _2026-06-22_
  > "app should offer the full self help stack...u first kick what u want in ur stack and how many minutes so like : breathing 5 minutes then meditation 10 minutes similar to the daily planner mode with bubbles"
  - **Gap:** The planner-bubble stack builder is real but for tasks; the specific 'kick what you want in your self-help stack + minutes each, chained' UI for the meditation/breath/mantra modules was not built.
  - _Evidence:_ A composable-stack mechanism exists but for DAY ACTIVITIES, not the self-help modules: presetsSheet()/stackDetail() app.js:498/2556 let you build a custom "stack" of activities with times+durations and apply to a day. The self-help modules (breath/meditate/tap/mantra) each have their OWN duration pickers (meditation app.js:1869 "how long: 2/5/10min") but there is NO single composer where you queue "breathing 5min → meditation 10min" as one chained stack-of-modules with per-section minutes.

- **Smarter, more intelligent AI brain (not oversimplified)**  ·  🟦 BIG  ·  _2026-06-22_
  > "the brain feels oversimplified, not intelligent enough, but we'll get back to it later."
  - **Gap:** David himself deferred this ('we'll get back to it later'). Functional BYO-key passthrough shipped; the 'more intelligent/nuanced' brain is still the open item.
  - _Evidence:_ A real LLM brain exists: brainSheet() app.js:2801 lets David plug in OpenRouter/Groq/Gemini keys; askBrain() app.js:2777 calls them; "🧠 ask my brain what's best" appears in suggestSheet app.js:2625. BUT brainContext() app.js:2799 sends a thin generic prompt (occupation, goal, today's plan, undone habits) with no KB, no Johnson framework, no memory — exactly the 'oversimplified' state David flagged. The deeper intelligence upgrade is not done.

### Tech / PWA / infra  (2)

- **Commit DESIGN-BRIEF.md spec to version control; add .gitignore for build junk**  ·  · small  ·  _2026-06-23_
  > "Commit it so the spec is version-controlled and can't be lost...Add a `.gitignore` to stop committing build/working junk"
  - **Gap:** Half done: spec committed (built), but the .gitignore was never created. Build junk (server.js, .DS_Store, *.png, frame dirs) is still uncommitted/untracked clutter with no ignore rules.
  - _Evidence:_ DESIGN-BRIEF.md IS git-tracked (git ls-files shows DESIGN-BRIEF.md). But NO .gitignore exists — not on disk (ls: No such file) and not tracked (git ls-files has no gitignore; git log -S gitignore returns nothing).

- **Test app via Claude Chrome extension / Chrome MCP**  ·  · small  ·  _2026-06-24_
  > "use chrome mcp to connect to claude extension to test the app and give feedback"
  - **Gap:** Only the connection permissions were granted; there is no evidence in the repo that a Chrome-MCP testing pass actually drove the app. It's enabled, not demonstrably used as a feature.
  - _Evidence:_ Chrome MCP permissions are allowlisted in .claude/settings.local.json (Claude_in_Chrome list_connected_browsers, select_browser). This is workflow tooling, not app code.

---

## ❓ UNCLEAR — 3

- **Bottom nav structure: Today/now center, Goals, You, presets, tools (collapse to 3 even flat tabs)**  ·  🟦 BIG  ·  _2026-06-24_  ·  asked ×4
  > "today/now is dead center. then on the left is habbits and then very left is day presets... and garden will be inside you as well as stats inside you"

- **Recolor world moodier — grass/water tinted purple for night mode**  ·  · small  ·  _2026-06-23_
  > "Recolor the world to be more moody . So the grass and water a more tinted purple so it’s more night mode"
  - _Evidence:_ renderWorld uses image-based grass/water patterns (app.js:1490-1504) loaded from assets, not programmatically purple-tinted; no purple overlay in code; can't confirm the asset art itself is purple-tinted

- **Switch-activity button takes the color of the current activity**  ·  · small  ·  _2026-06-25_
  > "the button which says switch activity should be the color of the current activity"
  - _Evidence:_ ldSw switch button exists (index.html:35); live strip shows activity color in icon (app.js:957) but no explicit code tinting the #ldSw BUTTON to the current activity color was found — can't confirm built

---

## ✅ BUILT — 201 requests that shipped and are present today

_Compact (title · scope · evidence). Here for completeness + reassurance — this is the 57% that did land._

<details><summary><b>Vision / philosophy</b> (7)</summary>

- **Always guide and not judge; give chances to improve even in the micro** · 👁️ VISION · _2026-06-21_ — No-shame model is implemented: missed plans become neutral dark "ghost" bubbles, drift is "off plan — logged honestly" (app.js:942), AI prom
- **Give dopamine when you improve to get addicted to achieving goals** · 👁️ VISION · _2026-06-21_ — Reward layer is real: streak system (curStreak/bumpStreak app.js:314-315), escalating streak tiers with glow/EPIC/LEGENDARY gradients (strea
- **App genius without AI; AI brain layer is a thin structured lubricating layer that only applies wisdom** · 👁️ VISION · _2026-06-22_ — Architecture matches: the app works fully with no AI (Tier-1 first-principles planning templates app.js:403, suggestion engine 334, all trac
- **Design from first principles around the average daily-use loop (plan→start→procrastinate→adapt→track)** · 👁️ VISION · _2026-06-23_ — The core app IS this loop: Plan day (planSheet/planTom app.js:745,162), Play=start (startPlanned 377), procrastinate→drift logged honestly (
- **Decide if gamification is a separate large feature from the app** · 👁️ VISION · _2026-06-24_ — Resolved in the build: gamification is implemented as a SEPARATE layer/tab (the You-tab world + game canvas openGame app.js:1608, virtue tre
- **Doing what you planned should feel magical (gamify being conscientious)** · 👁️ VISION · _2026-06-24_ — Directly implemented: matching reality to plan triggers shining striped bars + foil/shine overlays (app.js:2193,2224
- **Future looks theoretical/soft, past looks set-in-stone/solid-but-dead** · 👁️ VISION · _2026-06-25_ — Implemented in the timeline render: future plan = matte/lit single full-width bar (futurebar app.js:2086, .calblk future LIT sheen index.htm

</details>

<details><summary><b>UI / UX / design / palette / art</b> (56)</summary>

- **Cuphead 1930s rubber-hose aesthetic for the world/map** · 🟦 BIG · _2026-06-22_ — renderWorld uses Cuphead-painted water/island/object cutouts (app.js:1487-1505 comments 'scrolling Cuphead water texture','smooth Cuphead is
- **Rebuild clunky UI from scratch; keep the bubble schedule with dusting/pushing** · 🟦 BIG · _2026-06-22_ — Full redesign batch shipped (git 5222d5d 'Ship 1-to-1 redesign batch')
- **Make menus more clever, complex, and functional** · 🟦 BIG · _2026-06-22_ — bentoPicker (app.js:2447+) has search, pinned favourites, per-domain expand, multi-select, frequent row, add-on-the-fly
- **Apple-Music collapse: scrolling shrinks Goals/You to single Today icon, tracker drops to bottom row** · 🟦 BIG · _2026-06-26_ — app.js:692 on scroll adds body.nav-collapsed
- **Compact Apple-Calendar header: weekday-letter row + date-number row (max two rows), back button to week** · 🟦 BIG · _2026-06-26_ — git 4365e19 'Apple-Calendar compact 2-row header + mini week strip'
- **Pixel-art aesthetic / bring back the pixelated RPG character vibe** · ▫️ med · _2026-06-21_ — index.html:163,374,403 image-rendering:pixelated
- **Beautiful clever animations for gamification and pleasure** · ▫️ med · _2026-06-21_ — celebrate() with cele-star fly + vibrate (app.js:317-328), foilSlide/shine animations (index.html:248,518), spark-float +N (app.js:1722), be
- **Use Powerpuff Girls candy color palette and 90s cartoony design** · ▫️ med · _2026-06-21_ — index.html:414 '===== POWERPUFF CANDY on dark hot-pink =====' block
- **Preview world matches the opened world; richer reference-inspired visuals** · ▫️ med · _2026-06-22_ — Single renderWorld() (app.js:1482) used by both onboarding preview and the game tab
- **Explore activity-picker layouts: Apple-Watch color clusters, mind-map tree, bento board** · ▫️ med · _2026-06-23_ — Bento board shipped (bento-grid/bento-cat two-column tiles index.html:592,627)
- **Plan bubbles look ephemeral/metallic/holographic (Pokemon-card reflectivity), subtly distinct from reality** · ▫️ med · _2026-06-23_ — .calblk .foil holographic sliding sheen + .shine static gloss (index.html:518-519,248)
- **Remove old menus (old radial menu, old character skill sheet)** · ▫️ med · _2026-06-23_ — git bde0ecf 'kill radial'
- **Bubble degrades gracefully as it shrinks (title→emoji→color-only); intelligent label placement** · ▫️ med · _2026-06-24_ — degrade(card) sets lbl-c/lbl-i/lbl-s/nosub by height (app.js:2063)
- **Redesign current timer and now red-line so nothing is covered, matches the present** · ▫️ med · _2026-06-24_ — now-line + circle + right-side readout placed so 'now-line + right-side readout' don't cover blocks (app.js:2053)
- **Now must not cover the next future block on the timeline** · ▫️ med · _2026-06-25_ — app.js:2188 live card grows UPWARD, never crosses into future
- **Past metallic shine vs future softer — distinct visual cues; restore shine on past blocks** · ▫️ med · _2026-06-25_ — Past matched = .shine static metallic gloss (index.html:519 'static metallic gloss for shining past success'), added in app.js:2095,2115,219
- **Connected single bar when plan+reality match; disconnected only on mismatch** · ▫️ med · _2026-06-25_ — app.js:2107 matched tracked stretch = 'ONE connected full-width striped bar across both lanes'
- **Present line stands out clearly in color and shape; symbol signifies current activity** · ▫️ med · _2026-06-25_ — nowcirc carries the current activity's icon tiIcon(_lv) + activity color (app.js:2053)
- **Dev test-day button showing all tracker states (matched/streak/drift/realistic)** · ▫️ med · _2026-06-25_ — fillTestDay() (app.js:895) builds 3 adjacent matched (streak ×3), a miss, a partial+drift, live + future
- **Undo button with multiple-level backlog for timeline mistakes** · ▫️ med · _2026-06-25_ — undoStack + pushUndo/popUndo, capped 25 levels (app.js:1084-1086)
- **Timeline category colors must match the bento colors (no lime/bright; keep ghost/present distinctions)** · ▫️ med · _2026-06-25_ — Single DOM palette (app.js:248-258) drives BOTH bento (DOM[dd] in bento-tab/chip) and timeline bars (D.c)
- **Trash zone (bottom middle): drag a bubble out of its lane across the whole screen to delete** · ▫️ med · _2026-06-25_ — #trashZone position:fixed left:50% bottom (index.html:948-950 bottom-center), trashEl/showTrash/overTrash (app.js:1088-1091)
- **Merge Deep-Work and Switch-Activity into one button; make tracker more convenient** · ▫️ med · _2026-06-25_ — startOrSwitch() is one entry (app.js:374) that switches if running else starts
- **Today/date header floats over bubbles without covering them** · ▫️ med · _2026-06-26_ — .day-stacksep is a translucent fit-content floating chip max-width:94% (index.html:731-732 'never opaquely cuts a bubble')
- **Make the character more full-screen** · · small · _2026-06-21_ — app.js:1259 guardianFit() / 1360 worldFit() / 1259-1360 size the canvas to the viewport
- **A clever emoji/symbol for every type of activity** · · small · _2026-06-22_ — TITLE2META emoji map + tiClass keyword→Tabler-icon map (app.js:294-298), per-task emoji in CATS (e.g. line 176,197), comment 'keyword → emoj
- **Seamless self-rearranging animation like iPhone app icons** · · small · _2026-06-22_ — reflow(k) (app.js:495) + settle() repositions cards
- **Character is mute: closed lips, no mouth movement in idle** · · small · _2026-06-22_ — paintGuardian draws fixed eyes + a static small mouth (app.js:1386 '// eyes (small, close) + mouth')
- **Subtle horizontal time lines across the timeline screen** · · small · _2026-06-23_ — .calhour faint full-width rule (index.html:226,500 border-top rgba/#44203a)
- **Subtle control on bubbles signaling they're movable** · · small · _2026-06-23_ — .calblk .grip corner curved-line handle (index.html:554-556 'subtle curved line echoing the bubble rounded corner')
- **Hatched/ghost plan visual for planned (vs real) bubbles; ghost = incomplete plans** · · small · _2026-06-23_ — app.js:2074 comment 'PLAN lane 3 states: sched = two-tone diagonal hatch · ghost = domain-outlined hollow'
- **Lower stripe visibility so bubble text stays readable** · · small · _2026-06-23_ — app.js:2093 'matched = matte-metallic stripes (calmer — no neon glow)'
- **Timeline menu ends where time ends — no buttons below it** · · small · _2026-06-23_ — app.js:2250 comment ''start new' slot removed — starting/switching now lives in the pull-up dock
- **Resize grip: corner-shaped line at bottom-right, not white square** · · small · _2026-06-24_ — index.html:554-556 .calblk .grip at right:0
- **Better-looking minimal corner X on bubbles (not a circular button)** · · small · _2026-06-24_ — Editor trash moved to corner (.ed-trash-top index.html:134, git 2752447 'trash to top-right')
- **Search not white; scrolls away with content** · · small · _2026-06-24_ — .bento-search sticky on dark #2c081a, .bento-sinput bg #1c0512 (index.html:594-596) — not white
- **Remove scaling lines** · · small · _2026-06-24_ — git 6de4ffa 'drop zoom slider'
- **Midnight text must not cover the bubble** · · small · _2026-06-24_ — timemark labels render as floating side chips (.timemark-lab app.js:2059-2060) and day marker is a floating translucent chip (index.html:731
- **Make all app text unhighlightable** · · small · _2026-06-24_ — index.html:1007 '*{ -webkit-user-select:none
- **Tiny bubbles render as wide lines (full width, shorter), never dots** · · small · _2026-06-24_ — place() gives bars true time-height with Math.max floor and full lane width (app.js:2058)
- **Stripes are reward-only, never on drift/punishment (kept in future per refs)** · · small · _2026-06-25_ — Stripes applied only to matched/on-plan bars (app.js:2093,2193 onp?stripes)
- **Continued same activity keeps same color before and after now** · · small · _2026-06-25_ — TRACKED stretch drawn as ONE connected full-width striped bar across both lanes using domain D.c (app.js:2107 _seg, comment 'ONE connected f
- **Sliver/tiny past habit gets a side label** · · small · _2026-06-25_ — railItems: bars too thin to label inline push their symbol to the right rail in time order (app.js:2046,2091)
- **Minimalist hour markings — 15/5-min marks look messy and not minimalist enough** · · small · _2026-06-25_ — Progressive gutter: hours always numbered, :30 a bare dash only at HP>=84, numbered at >=150, :15/:45 only deeper (app.js:2048-2051, comment
- **Past streak blocks look overwhelming — too much yellow/bright** · · small · _2026-06-25_ — app.js:2041 streakbar restyled to 'minimal berry chip — no gradient/glow/tier-name'
- **No gradients on drift block — flat dark red or black** · · small · _2026-06-25_ — app.js:258 drift domain c/light/dark all near-identical dark (#180608) 'BLACK bubble + dark-red letters'
- **Hide symbols and text when zoomed out (don't cram)** · · small · _2026-06-25_ — degrade() drops name on short bars and only keeps icon/color when small (app.js:2062-2063 'name only on TALL bars (>=22) so zoom-out stays m
- **Present line stays original pink; color signified only in the left circle** · · small · _2026-06-25_ — app.js:2053 now-line borderTopColor hardcoded '#ff5fa8' + pink boxShadow, while the circle nc.style.background=_lc takes the activity color 
- **Remove the duplicate second link/pink line above the present line** · · small · _2026-06-25_ — .nowline::before disabled (index.html:563 'display:none') removing the second mark
- **Remove extra letter thickness/shadow on past blocks** · · small · _2026-06-25_ — git 5a9b782-era restyle
- **Reduce dead space left of time numbers / now circle (move everything left)** · · small · _2026-06-25_ — index.html:500 .calhour left:26px (was 42), .calhrl left:0 width:23 right-aligned (502), .nowcirc left:-3px (564 'pulled hard to the left ed
- **More room on the right so icons aren't cut off** · · small · _2026-06-25_ — git 5a9b782 'no cut-off buttons'
- **Move overlapping habit line up so nothing overlaps the focus block** · · small · _2026-06-25_ — fillTestDay places 'Quick text' log at now-60 'a quick log sitting clear ABOVE the straddling Focus block (not jammed against the now-line)'
- **Live-tracker menu colors should match the rest of the app (no whites)** · · small · _2026-06-25_ — #liveDock + .ld-* styled on dark berry surfaces (index.html:572 region)
- **Move zoom in/out function to the top; make the top bar thinner** · · small · _2026-06-26_ — Pinch zoom + day/week/month scope buttons live in the top header segL (app.js:792)
- **Move bubble trash button to top-right of the menu; exit menu by tapping above or swiping down** · · small · _2026-06-26_ — git 2752447 'Editor: trash to top-right, exit via tap-above / swipe-down (v501)'

</details>

<details><summary><b>Navigation / timeline / scroll / gestures</b> (43)</summary>

- **Day view scrolls internally; top day/week/month tabs stay fixed** · 🟦 BIG · _2026-06-22_ — body.tab-day #pullSheet is a fixed flex column (index.html:939) with the header on top and the scroll inside .day-cardscroll
- **Two modes: fullscreen game mode and app mode (with exit-world)** · 🟦 BIG · _2026-06-22_ — openGame() app.js:1608 adds #gameMode.on (fixed inset:0, index.html:400) + body.gaming
- **Burning-timeline: plans dim bright→dark once now-line passes; pushing forward re-brightens** · 🟦 BIG · _2026-06-23_ — BURNING TIMELINE app.js:2078-2081: future = bright matte, status 'miss'/passed → dark ghost (b.passed sticks, saved app.js:2172)
- **Swipe whole timeline sideways like iPhone Photos to change days (paged cards)** · 🟦 BIG · _2026-06-24_ — day-pager of 3 cards [prev,cur,next] app.js:836
- **Today = reuse the original pull-down timeline, kept always open (pull-down only in garden mode)** · 🟦 BIG · _2026-06-24_ — body.tab-day #pullSheet forced open (transform:none, index.html:939)
- **Scroll-over-the-hill: seamless infinite up/down timeline; keep within a logical day (6am-4am)** · 🟦 BIG · _2026-06-25_ — attachInfinite continuous recenter app.js:689
- **Scroll fully up/down carries you to prev/next day with smooth animated push-through (no hard cut)** · 🟦 BIG · _2026-06-26_ — Continuous stack + scroll-snap detent at .day-stacksep (handoff §
- **Gentle scroll hits a soft wall at day edge; harder pull passes through in the same gesture** · 🟦 BIG · _2026-06-26_ — CSS scroll-snap-type:y proximity + scroll-snap-align:start on .day-stacksep = a gentle detent/wall at each day header you push past in the s
- **Timeline: time labels on left, separate activity bubble, height scales with duration** · ▫️ med · _2026-06-21_ — calendarView app.js:2048-2052 draws left-gutter hour/half labels (calhrl/calsub/calhalf)
- **Add plan by tapping/double-clicking the timeline to create a bubble where you tap** · ▫️ med · _2026-06-22_ — makeBlock() app.js:~2262 snaps downM (tap-Y) to a 30-min empty block and opens its editor
- **Stretch a bubble to set/change its duration (above and below)** · ▫️ med · _2026-06-22_ — grip (bottom) app.js:2157-2163 resizes b.mins
- **Lift-and-drag bubbles to rearrange; double-click/tap to open** · ▫️ med · _2026-06-22_ — card pointerdown app.js:2127: hold→lift (card.classList.add('lift')) then drag reorders via preview()/settle()
- **Analog dynamic joysticks (Heaven Inc feel); pinch-zoom must not fire on thumbsticks** · ▫️ med · _2026-06-22_ — Left analog stick initJoy app.js:1266 (angle/clamp transform), right twin-stick app.js:1310
- **Build on the earlier bubble timeline prototype** · ▫️ med · _2026-06-23_ — The current timeline IS the evolved bubble system: .calblk bubbles in calendarView app.js:2038, time-height bubbles, drag/resize/reorder. Di
- **Timeline continues past midnight into the AM so you can plan the night** · ▫️ med · _2026-06-23_ — dayWindow() app.js:91: endH = min(28, max(start+12, ceil(bed)+2, 26)) — the 26 floor guarantees ~2am, capped at 28 (4am). Midnight anchors d
- **Bring back week view and month view in a convenient way (with a Today button)** · ▫️ med · _2026-06-23_ — scope-seg day/week/month buttons app.js:792,804
- **Zooming the day stretches hour-length like an After Effects timeline** · ▫️ med · _2026-06-23_ — Pinch (vertical) → relayoutHourPx/zoomLive app.js:658, pullHourPx stretches HP
- **Pull-down follows finger smoothly, not snapping fully open** · ▫️ med · _2026-06-23_ — pullGrab pointermove app.js:971: fr = -dy/H, ps.style.transform = translateY(-fr*100%) follows the finger
- **Bubble drag must not be mistaken for scroll (click away from bubble to scroll)** · ▫️ med · _2026-06-24_ — card pointerdown app.js:2130-2137: touch requires a hold (holdT 280/460ms) before picking up
- **Infinite vertical scroll many days in either direction** · ▫️ med · _2026-06-24_ — attachInfinite app.js:689 recenters the focus-R..focus+R buffer at the edges so you keep scrolling into yesterday/tomorrow with no cut
- **Working zoom that expands time to 30/15/5-min increments (still broken, needs fixing)** · ▫️ med · _2026-06-25_ — calendarView app.js:2047: _SHOWHALF/_NUMHALF/_SHOWQTR/_NUMQTR gates reveal :30 then :15/:45 then :05-style subs as HP increases
- **Moving/expanding bubbles requires a slightly longer press (so scroll is unobstructed)** · ▫️ med · _2026-06-25_ — holdT timeout app.js:2134: 280ms future / 460ms past ('the PAST feels set in stone → a longer, deliberate hold')
- **Tiny/sliver future plans must be visible, labeled, and expandable via menu even when un-grabbable** · ▫️ med · _2026-06-25_ — degrade() app.js:2063 sets gate='menu' for tiny bars
- **Symbols of unfit activities stack on the right rail in correct order, never overlapping or covered by now** · ▫️ med · _2026-06-25_ — railItems collected in order (app.js:2091,2197)
- **Past blocks should reorder/move up-down (not overlap), like the future** · ▫️ med · _2026-06-25_ — app.js:2132-2139: a fully-past block (_isPast) is reorderable with a _ceil at now
- **Moving a future bubble must not move/bounce past blocks** · ▫️ med · _2026-06-25_ — _floor = ceil(now/15)*15 for non-past blocks (app.js:2133) clamps a future drag at the now-line
- **Can't drag a future bubble across the present into the past; now-straddling task is static** · ▫️ med · _2026-06-25_ — _floor clamps future drags at the now-line (app.js:2133)
- **Quick side-swipe flips day-cards even with thumb on bubbles; fix swipe getting stuck/drifting** · ▫️ med · _2026-06-26_ — app.js:864: swPgr armed even when starting on a bubble ('a quick HORIZONTAL swipe pages the day even starting on a bubble')
- **Drag a habit bubble up into yesterday / down into tomorrow** · ▫️ med · _2026-06-26_ — up2 crossDay logic app.js:2142,2145: dropping a bubble over a different day's .day-sec re-homes it (b.time recomputed from drop-Y, moved to 
- **Live animated bubble adaptation while dragging (before release)** · · small · _2026-06-22_ — During drag, preview() app.js:2070 live-shifts neighbour cards before release
- **Easier bubble delete via X or slide-to-trash (no double-click)** · · small · _2026-06-22_ — Per-bubble X (calx) app.js:2123-2125 deletes on click
- **Time labels on the left with a dash at the 30-minute mark** · · small · _2026-06-23_ — calendarView app.js:2050: at _mn===30 adds .calhalf (a bare dash) when _SHOWHALF, becoming a :30 number when zoomed (_NUMHALF). Hours number
- **Extending current activity into the past shifts prior activity's end, not side-by-side** · · small · _2026-06-23_ — Live timer gript app.js:2229: dragging start earlier trims/removes the previous log (prevLog.mins = trimmed) with explicit 'never side-by-si
- **Show a now-ticker for the present time on the timeline** · · small · _2026-06-23_ — nowline + nowcirc + nowread drawn in calendarView app.js:2053 (thick pink line at logicalNowMin, icon circle, elapsed readout). nowLineEl tr
- **Timeline scrolls up to reveal yesterday; signify midnight on the timeline** · · small · _2026-06-23_ — Continuous stack focus-R..focus+R (R=3) app.js:837 lets you scroll up into yesterday
- **Plan and Real lane headers stay pinned on top (single pair, no submit at day split)** · · small · _2026-06-24_ — lanehead with single PLAN/REAL pair app.js:2042
- **Zoom in/out the world without panning at the same time** · · small · _2026-06-24_ — wireWorldTap app.js:~1640: 'if (pinch0 > 0 || npts() >= 2) return' guards panning during pinch (explicit 'fixes zoom-and-pan-at-once' commen
- **Timeline header shows day-of-week and date; top-left label updates with the day** · · small · _2026-06-24_ — dayLabelFull app.js:102 shows weekday+date
- **After-now Plan-Today and Start-new buttons removed (Plan-Today moved to top)** · · small · _2026-06-25_ — Inline comments confirm removal: app.js:2173 'removed the below-now plan today button'
- **Resizing in the real column shouldn't be slow** · · small · _2026-06-25_ — Real-lane grip/gript add card.classList.add('dragging') to suppress the height transition so the drag tracks instantly (app.js:2201-2202 'su
- **Today button becomes a Now button when already on today (plays directional swipe animation)** · · small · _2026-06-26_ — setTodayBtn app.js:704 swaps to 'Now' (ti-clock-bolt, .is-now) when centered on today
- **Week-strip preview tracks the day live during a horizontal swipe (not only after release)** · · small · _2026-06-26_ — During the horizontal swipe, setStripSel updates LIVE to the day you're heading toward app.js:871 ('the week-strip highlight moves LIVE')
- **Now-line should not disappear when clicking Today** · · small · _2026-06-26_ — scrollToNow app.js:705 sets _paging=1 to suppress the continuous recenter during the smooth scroll ('a mid-scroll rebuild can't destroy the 

</details>

<details><summary><b>Tracking / logging</b> (36)</summary>

- **Time tracker to plan your life then track your day** · 🟦 BIG · _2026-06-21_ — Two-lane timeline in renderToday() (app.js:2067+) holds plan blocks (left) and live tracking
- **Unify day plan and time tracker in the same menu, supporting combinations** · 🟦 BIG · _2026-06-22_ — Single bentoPicker (multi:true) used for both planning (planSheet/Pick activities app.js:776) and tracking (startOrSwitch app.js:374)
- **Time tracker starts instantly on add; stretch top to backtrack start time** · 🟦 BIG · _2026-06-22_ — startTrackerNow() app.js:2018 starts at Date.now() immediately
- **Seamless time+habit tracking: timer + comfy task select + restart with new task** · 🟦 BIG · _2026-06-22_ — startOrSwitch() app.js:374 stops running timer(s) and starts a new one via bentoPicker in one flow
- **Notebook split view: left = your plan, right = what you actually did (one of the most important menus)** · 🟦 BIG · _2026-06-23_ — renderToday() lays plan blocks in the left lane and real/tracked items in the right lane (planSide/rightTrack split at width*0.5 app.js:2270
- **Drift is still part of the plan; app pauses and pushes the plan forward** · 🟦 BIG · _2026-06-23_ — planBreak()/Replan app.js:379-384: inserts a pinned block at now and reflow(k) pushes following movable blocks down
- **Nuanced activity categorization with shared category colors; propose taxonomy options** · 🟦 BIG · _2026-06-23_ — 8-domain palette DOM app.js:249-259 with per-domain colors driving every bubble
- **Separate cleaning/chores system tracking room & apartment state (digital trace, standing priority)** · 🟦 BIG · _2026-06-23_ — CHORES subsystem: choreFresh()/choreMark()/spaceScore()/mostOverdueChore() app.js:130-133, choresSheet() 'Your space · N% fresh' app.js:134-
- **Three past realities: match / partial-match / no-match (gold/special points where matched)** · 🟦 BIG · _2026-06-24_ — matchedSpan/partial app.js:2077,2090: full match = fused shining bar (cele, app.js:2087)
- **Three future options: track-ignoring-plan / follow / replan-then-drift (Follow / Replan / Drift)** · 🟦 BIG · _2026-06-24_ — Live dock three buttons ldPlan/Follow, ldReplan, ldDrift (index.html:1187-1189
- **Play button IS the Plan button, colored as the upcoming event; ghost past splits on Play and prints across plan+real** · 🟦 BIG · _2026-06-26_ — Idle dock Play wears the upcoming activity's color and starts the plan (app.js:931-932 _pD.c background
- **Track time-wasting / vices too (PlayStation, cafe, wasting money)** · ▫️ med · _2026-06-21_ — Vices category CATS app.js:201-205 (Instagram, TikTok, Weed, Cigarettes, Gambling, Procrastinate)
- **Now-logging works like Toggl with a timer** · ▫️ med · _2026-06-21_ — startTrackerNow() app.js:2018 pushes a timer with start=Date.now()
- **Make the activity option list far more clever and exhaustive like Streaks** · ▫️ med · _2026-06-21_ — CATS app.js:174-206 + OCCUPATIONS app.js:207-239 = ~150 activities across Energy/Work/Love/Hobbies/Vices with occupation-specific work sets
- **Achieved blocks highlight; failed plans go dark/grey; plan adapts** · ▫️ med · _2026-06-22_ — blockStatus() app.js:104 returns ok/miss/plan
- **Time-tracking blocks must not overlay; easy to delete and edit** · ▫️ med · _2026-06-22_ — Live card pinned to now-line grows upward, never overlays future (app.js:2188)
- **Mood tracker; in-world weather reflects the person's mood** · ▫️ med · _2026-06-22_ — MOODS app.js:1682, setMood()/currentMood() app.js:1683-1690, renderMood() 'your inner weather' app.js:1691
- **Tolerate being slightly late/early on a planned block** · ▫️ med · _2026-06-23_ — blockStatus() app.js:104 marks 'ok' if a same-domain log merely OVERLAPS the planned window (ls<be && le>bs), not requiring exact start
- **Retroactively correct what you were doing in the past; show where you drifted vs on-plan** · ▫️ med · _2026-06-23_ — Backfill any untracked past gap by tapping (app.js:2233-2246, bentoPicker 'What were you doing?')
- **Big stop button + start-new button on running activity** · ▫️ med · _2026-06-23_ — ld-stop big round button #ldStop (index.html:955,1181) and ld-sw switch button (index.html:960)
- **Switching tasks should be a real function (as in the design viz)** · ▫️ med · _2026-06-23_ — startOrSwitch() app.js:374 ('Switch to?') stops current timer(s) and starts the picked new one
- **Habit/bento list better adapted to real daily-life activities** · ▫️ med · _2026-06-24_ — CATS expanded with real-life groups Body/Sleep/Food/Space, People/Self-love/Give, Music/Art/Play/Mind/Outdoors, Vices Digital/Substance/Othe
- **Start-timer = do-what-you-planned in one click (replaces Next)** · ▫️ med · _2026-06-24_ — Idle dock Play wears the upcoming activity's color and 'start your plan' (app.js:931-932)
- **Clicking a bubble lets you replace/switch it to a different activity** · ▫️ med · _2026-06-24_ — Past real bubble relabel() opens bentoPicker 'What is it?' to swap title/color/catK app.js:2208
- **Ghost habits when uncompleted plan enters the past (with color and attitude)** · ▫️ med · _2026-06-24_ — Missed/past plan renders 'ghost' state: domain-tinted-dark hollow with domain OUTLINE + title (dark branch app.js:2096, mixDark app.js:287)
- **Short tracked segments / tiny bubbles must stay movable and usable** · ▫️ med · _2026-06-24_ — Right symbol-rail: thin bars too small to label get a tappable rail chip that opens the editor (railItems / chip.open app.js:2255-end, comme
- **Track-without-plan mode with seamless activity switch** · ▫️ med · _2026-06-24_ — With no plan, dock goes noplan (Plan+Drift only, app.js:929,966)
- **Failed plan ghosts and splits; future bubble shrinks** · ▫️ med · _2026-06-25_ — Partial match breaks the unfulfilled remainder into its OWN ghost bubble (app.js:2090 '_uS/_uE the UNFULFILLED remainder breaks off')
- **Keep plan/real split visible in the past where they mismatch** · ▫️ med · _2026-06-25_ — Partial-match keeps the ghost (plan) in the left lane and the drift/real in the right lane as a visible split (matchseg overlay app.js:2110-
- **Show current activity as colored text under present line with elapsed time (right side)** · ▫️ med · _2026-06-25_ — now-line right readout 'nowread': current activity icon + title + live elapsed, in the activity's color, anchored right (app.js:2053: nr.inn
- **Untracked past plan turns into ghost mode; only tracking/replanning prints non-ghost** · ▫️ med · _2026-06-25_ — blockStatus 'miss' for passed untracked plan -> ghost render (app.js:104,2096)
- **Failed-plan ghost is left-half only; right-half empty or actual activity (separate, not connected)** · ▫️ med · _2026-06-25_ — Straddle/partial render: FAILED plan is a SPLIT not a connected bar — ghost stays in PLAN (left) lane, real lane free for actual activity (a
- **Drag completed past block: left = plan-only/uncompleted, right = unplanned-done; grab side to connect at middle** · ▫️ med · _2026-06-25_ — Completed fused bar: fling RIGHT -> real-only/unplanned, fling LEFT -> plan-only/uncompleted (app.js:2146 'COMPLETED fused bar: fling RIGHT-
- **Empty filler boxes above/below a real block adjust live as you move/resize it** · ▫️ med · _2026-06-25_ — gapAdj() app.js:2200 finds the .backfill slots above/below and resizes/moves them live during drag/resize ('the empty + backfill gaps above/
- **Track button should still prompt what you're doing now** · · small · _2026-06-23_ — Tapping the right/real lane or the track entry opens bentoPicker 'What are you doing?' before a timer is named (app.js:2270, app.js:374)
- **No-plan state: only Plan and Drift buttons (no Replan)** · · small · _2026-06-25_ — liveDock.noplan hides Replan (index.html:966 '#liveDock.noplan .ld-replan{display:none}')

</details>

<details><summary><b>Gamification / RPG / character</b> (18)</summary>

- **Character mirror that levels up as you level up your life** · 🟦 BIG · _2026-06-21_ — renderHero() guardianCap 'your mirror — it grows when you do' (app.js:1695)
- **RPG as upgradeable character/skill tree (Fallout/Skyrim/GTA San Andreas), not a long list** · 🟦 BIG · _2026-06-21_ — Virtue constellation 'character tree' rendered on canvas (app.js:1184-1206), tappable nodes (treeTap app.js:1206) open virtueDetail() skill 
- **Walkable character in a world with Heaven Inc walking/movement mechanics** · 🟦 BIG · _2026-06-22_ — 'walkable character + camera (ported from Heaven Inc walk model)' (app.js:1243)
- **Now-line as energetic scanner burning success into the plan; guitar-hero reward signifier on match** · 🟦 BIG · _2026-06-24_ — 'BURNING TIMELINE: ...the now-line sweeping past it burns bright→dark' (app.js:2078)
- **Build the gamification/points system early (simple points/coins from tracking)** · 🟦 BIG · _2026-06-26_ — Spark points earned directly from tracking: earn(mins) on every stopped timer (app.js:2738), floating '+N' feedback (app.js:1722), S.game.sp
- **Purchasable/buildable skateboard, gated as an in-game unlock** · ▫️ med · _2026-06-22_ — '🛹 Build a skateboard · ✨'+bcost button gated on spark, sets S.game.ups.board (app.js:1733-1735)
- **Medieval fairy as the guardian character** · ▫️ med · _2026-06-22_ — fairy-medieval.png asset (assets/, Jun 22) is the source
- **Build a better 8-sided fairy sprite sheet from the 360 video (mirror, sharp-facing, even timing)** · ▫️ med · _2026-06-22_ — spr-dir.png (assets/, Jun 22 21:51) is the rebuilt sheet
- **Add a jump like in Heaven Inc game** · ▫️ med · _2026-06-22_ — doJump() with jz/jvz vertical hop + shadow (app.js:1246-1250)
- **Unplanned tasks earn fewer game points than planned ones** · ▫️ med · _2026-06-23_ — Tracking a plain activity earns mins of spark (earn(mins) app.js:2738)
- **Keep the streak visual (yellow-to-red gradient that starts when you follow the plan)** · ▫️ med · _2026-06-23_ — streakColor() mixes yellow #ffe14a→red #ff2a12 (app.js:305)
- **Save your streak by adjusting plan on the go; plan spontaneous-but-conscious breaks** · ▫️ med · _2026-06-23_ — planBreak() (app.js:379) 'PLAN A BREAK (§23): consciously declare... inserts a PINNED block at NOW, plan reflows, tracking starts. Conscious
- **Habits bento: common stuff first, expands into categorized depth for life's complexity** · ▫️ med · _2026-06-23_ — bentoPicker with grouped categories (Fitness/Food/Create/Outdoors etc. app.js:176-209) plus 'Quick'/frequent row
- **Full completed plan bar with lines, shine and score** · ▫️ med · _2026-06-25_ — Matched plan block renders striped 'repeating-linear-gradient' bar with a .shine overlay and check/score, mscn label with title + ✓ (app.js:
- **Matched plan grows into the past as a new success bubble (longer = better)** · ▫️ med · _2026-06-25_ — The tracked match renders a connected matchseg bar across lanes (app.js:2107)
- **Printing/battery signifier (matte→shining stripes) tied to future/past metaphor, more prominent** · ▫️ med · _2026-06-25_ — Future plan = matte dimmed stripes 'MATTE = same domain hue, just dimmed' (app.js:2099)
- **Streak = adjacent back-to-back activities (tasks must touch)** · ▫️ med · _2026-06-25_ — fillTestDay comment '3 TRULY ADJACENT matched activities, edge-to-edge (any kind counts) = a real streak of 3' (app.js:895,904)
- **Make the character move faster** · · small · _2026-06-22_ — SPD = 4.3 (app.js:1552)

</details>

<details><summary><b>Coaching / reminders / notifications / AI-guidance</b> (10)</summary>

- **App should be proactive — detect messy room and prompt to clean/laundry** · 🟦 BIG · _2026-06-21_ — messy() at app.js:1110 returns true when daysSince(S.lastTidy)>=2
- **Morning guided journaling/recommit (identity → virtues → habits) that auto-generates a day skeleton** · 🟦 BIG · _2026-06-22_ — recommitSheet() app.js:2681 is a 4-step flow: step0 "Who are you today?" identity chips → step1 "Which virtues?" → step2 "Commit to today" h
- **Full multi-step Grateful Flow gratitude practice (Stutz/Michels)** · 🟦 BIG · _2026-06-22_ — gratefulFlow() app.js:2649 named "Grateful Flow — Stutz & Michels' practice": gather() names reasons → feelCycle() app.js:2663 walks each on
- **Guided breathing, meditation, tapping, mantras/affirmations suite** · 🟦 BIG · _2026-06-22_ — Full suite: breathwork() app.js:1785 (paced orb + tone), meditation() app.js:1847 (4 teacher voices, adaptive re-anchor), tapping() app.js:1
- **Context-aware habit surfacing by time of day (nap midday, hygiene at bookends)** · ▫️ med · _2026-06-22_ — CONTEXT map app.js:241 = {morning:[Brush teeth…],afternoon:[Nap,Walk…],evening:[…Tidy],night:[Wind down,Brush teeth…]} — nap is afternoon-on
- **Suggest the best next thing to do rather than autofilling the whole day** · ▫️ med · _2026-06-22_ — suggestSheet(k) app.js:2621 "✨ What's next? — best things to do from here — tap to drop one in" iterates suggestNext() and adds blocks one a
- **Use multiple YouTube/Adyashanti guided-meditation scripts as inspiration, delivered via TTS** · ▫️ med · _2026-06-22_ — meditation() GUIDES at app.js:1851-1856 = 4 ordered scripts in distinct teacher voices (Sam Harris "witness", Headspace "reset", Blackstone 
- **Encourage micro-actions: stand up, deep breaths, guided breathwork with sound and visual** · ▫️ med · _2026-06-22_ — MICRO array app.js:1747 incl. "Stand & move" [1], "2-min breath" (breath:true)[2], "Quick stretch", "Step outside". Tapping a breath micro f
- **Biggest button = do-what-you-planned, app-rewarded; Replan resets future and starts instantly** · ▫️ med · _2026-06-24_ — Live-tracker Play/Stop (ldStop app.js:946) when idle calls startPlanned(nextPlannedBlock) — one tap starts the planned block
- **Mini one-thing fast gratitude alternative** · · small · _2026-06-22_ — quickGrat() inside recommitSheet at app.js:2684 — "🙏 One gratitude · name one thing — then take a slow breath and actually feel it", single 

</details>

<details><summary><b>Planning / day-structure</b> (9)</summary>

- **Daily planner: colored rounded bubbles you expand/reorder, height scales with duration (Google Calendar)** · 🟦 BIG · _2026-06-21_ — calendarView renders .calblk bubbles, height = mins/60*HP (topFor/height math throughout ~2063-2240), domain colors via DOM, drag-to-move/re
- **Auto-plan today/tomorrow: cookie-cutter masterpiece-day presets, editable and saveable as named presets** · 🟦 BIG · _2026-06-23_ — DAY_PRESETS (app.js:489), presetsSheet/stackDetail (app.js:497-541), applyDayPreset, saveDayAsPreset (app.js:495-496), "save this as my mast
- **Split complex tasks (clean room, deep work) into clever ordered subtasks from prewritten options** · ▫️ med · _2026-06-21_ — SUBTASKS map + subtasksFor() (app.js:110-122), subtaskSheet (app.js:2318), and the editor's collapsible steps with up/down reorder + add-fro
- **Let user override suggestions easily (lay in bed, smoke weed, vibe-code)** · ▫️ med · _2026-06-22_ — Every suggestion is a tap-to-dismiss chip and the bento picker (bentoPicker) lets you pick ANY activity incl. custom adds
- **On-plan switching is single-choice; off-plan offers replan** · ▫️ med · _2026-06-23_ — liveDock: Play/Stop = startPlanned the next planned block (single choice, app.js:946/948), separate Replan button → planBreak() which erases
- **Subtask-splitting is opt-in per block (Deep Work splittable into ordered subtasks)** · ▫️ med · _2026-06-23_ — editorSheet steps section is per-block, collapsed behind a toggle, opt-in: o.subs with add/reorder/remove (app.js:2360-2377). Only shows for
- **Future is a single lane (reality hasn't happened yet)** · ▫️ med · _2026-06-24_ — calendarView: future/plan blocks render full-width single lane
- **Auto-readjust/push plan so everything you do stays planned (option for unplanned too)** · ▫️ med · _2026-06-24_ — reflow() pushes following flexible blocks down to avoid overlap, respecting pins/started blocks (app.js:2586-2607)
- **Empty bubbles open the menu on click and can be thrown into the trash** · · small · _2026-06-25_ — Empty bubble opens editorSheet with a dashed "choose activity" hero (app.js:2339)

</details>

<details><summary><b>Onboarding / personalization</b> (9)</summary>

- **Onboarding life-situation: huge selectable+typeable multi-select occupation/life-stage list** · 🟦 BIG · _2026-06-23_ — Step 3 'What's your life like?' (app.js:1043): LIFESTAGES = 22 options (app.js:975-987), multi-select ('pick ALL that fit'), plus customStag
- **Make the onboarding flow** · 🟦 BIG · _2026-06-23_ — A complete 8-step onboarding flow ships: onboard() (app.js:1017), overlay UI .ob-ov/.ob-card with progress bar, steps 0-7 (intro → vibe → ab
- **Onboarding via clever selection (not typing), like the Streaks app** · ▫️ med · _2026-06-21_ — onboard() is entirely tap-chip selection — chip()/taskTile selection in steps 1-6 (app.js:1041-1046)
- **Onboard by adding your main life habits up front, plannable per day** · ▫️ med · _2026-06-22_ — Step 4 'Stock your life ✨' (app.js:1044) is exactly this: tap everything you do, seeded by life-stage
- **Adapt habit categories to the user's stated occupation** · ▫️ med · _2026-06-22_ — LIFESTAGES entries carry an 'occ' field (app.js:976-986)
- **Activity options stem from universal fundamentals plus user-custom (from onboarding)** · ▫️ med · _2026-06-23_ — Step 4 seeds STAGE_BASE universal fundamentals (move/nourish/connect/play/restore/upkeep, app.js:992) PLUS stage/occupation-specific STAGE_E
- **Do both the AI brain and the onboarding survey** · · small · _2026-06-22_ — Both ship. brainSheet() (app.js:2801) wires a pluggable free-AI engine (OpenRouter/Groq/Gemini, key + model + test). surveySheet()/applySurv
- **Ask gender and age range first, then suggest life stage; preload activities by life stage** · · small · _2026-06-23_ — Step 2 asks gender + age range (app.js:1042)
- **Wake/sleep time can be a range, not a single time** · · small · _2026-06-23_ — Step 6 'Your daily rhythm' (app.js:1046) offers wake ranges ('before 6','6–7','7–8'…'varies') and sleep ranges ('before 10','10–11'…) as chi

</details>

<details><summary><b>Tech / PWA / infra</b> (8)</summary>

- **Ship MVP as a GitHub/PWA website first, iPhone App Store app later** · 🟦 BIG · _2026-06-21_ — Live PWA at https://dmekibel.github.io/alter/ served from GitHub Pages (TRACKER-HANDOFF-2026-06-26.md:5,7)
- **Swappable AI 'brain' engine, starting free; model selector dropdown** · 🟦 BIG · _2026-06-22_ — brainSheet() app.js:2801 — engine chips off/openrouter/groq/gemini (app.js:2806), model <select class="msel"> dropdown + custom-model input 
- **Fix Claude-Code dev workflow so app dev is faster, easier, more seamless** · 🟦 BIG · _2026-06-26_ — Commit db75d22 'track dev infra': added _dev/preship.sh (one-command ship: syntax-gate + auto-bump cache-buster + regen server.js + print fr
- **Free tier offers manual first-principles version of AI long-term goal planning (paid AI tier)** · ▫️ med · _2026-06-23_ — DECOMP_TEMPLATES first-principles step library (app.js:404-412), decomposeGoal() (app.js:413), 'Break it down for me' button (app.js:449), g
- **Fix white top bar in installed PWA today view (after skipping onboarding)** · ▫️ med · _2026-06-26_ — Commit ebdc961 (v506) 'real white-top fix'. index.html:417 carries an explicit comment + a solid html background-color:#1a1726 placed after 
- **Cache-busting fresh-link to always see the newest version** · · small · _2026-06-22_ — fresh.html does location.replace('index.html?cb='+Date.now()) (root fresh.html)
- **Mobile-size preview on desktop for bug-testing** · · small · _2026-06-24_ — Commit ec3f1db (v445) 'Render as a centered mobile column on desktop for bug-testing' — current CSS constrains the app to a phone-width colu
- **Remove side and top rim/margin for more full-screen space** · · small · _2026-06-25_ — Side rim removed in commit c69488e (v467) 'remove side rim'

</details>

<details><summary><b>Other</b> (3)</summary>

- **Big gameplan for everything else needed to make the app work** · ▫️ med · _2026-06-23_ — MASTER-GAMEPLAN.md (12KB, 2026-06-23, 'the road to works as intended', Phase A→F roadmap, commit db9667f) explicitly framed as 'everything E
- **Improve self-audit: think harder when screenshotting; review against design + David's principles** · ▫️ med · _2026-06-25_ — Memory file screenshot-adversarial-audit.md (in ~/.claude/.../memory/, indexed in MEMORY.md) codifies the exact behavior: 'On every verifica
- **Name the app later (not PowerUp)** · · small · _2026-06-23_ — index.html:6 <title>ALTER</title> and index.html:11 apple-mobile-web-app-title 'ALTER'

</details>

<details><summary><b>Data integrations</b> (2)</summary>

- **Generate character animations via Kling, frame-extracted to sprites (idle + 360, all 8 at once)** · ▫️ med · _2026-06-22_ — app.js:1331 comment: 'real fairy sprite sheets (AI-generated, animated via Kling, sliced to frames)'. FAIRY_META (app.js:1332) defines idle:
- **Better visuals generated with GPT Image / Nano Banana** · · small · _2026-06-22_ — AI-generated visuals shipped as static assets and wired in: loadFairy() (app.js:1338) loads assets/spr-idle/fly/face/dir.png

</details>
