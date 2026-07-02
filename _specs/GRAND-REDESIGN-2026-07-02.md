# THE GRAND REDESIGN — «Один мир, пять масштабов времени, один свет»
*2026-07-02 · David greenlit exploring a full redesign "as long as every decision makes perfect sense, keeps established functionality and the functionality we're aiming for." PROPOSAL — nothing built. Mockups in chat: journey re-grade + ignition · cockpit play-first · toolbox one-door · reward tiers + badges · Pokémon-grade element cards · crown calendar (month+week) · quest cards. Companion specs: DESIGN-AUDIT-2026-07-02.md, REWARD-LANGUAGE.md v1-v3, FIX-LEDGER §F/G/H.*

## 0 · The thesis (why every decision makes sense)
ALTER = ONE world seen at five time-scales. **NOW** (cockpit) → **DAY** (timeline) → **WEEK/MONTH** (crown calendar) → **LIFE** (journey chapters) → **FOREVER** (world/garden — where earned light accumulates as owned things).
One physics at every scale: **matte = potential · shining = lived · the now-line = the converter.** One reward language (5 tiers, fire levels, element cards) read identically everywhere. A matched hour = a shining month-cell = a lit journey node = garden growth: the same fact at four zooms. Navigation IS zoom: the scope segment (День/Неделя/Месяц) becomes a true time-zoom; the cockpit is the innermost zoom; the journey and world are the outermost.

## 1 · The invariants (what CANNOT change)
- The 4-point timeline regression contract (continuous scroll, past-set-in-stone, tap/drag/edit, strip+pill tracking).
- All shipped tracking-core behavior (clean switch, no-overlap writes, track→plan fusion, drag-to-now, pause, journey-live-pill).
- The locked palette, Jost, Tabler-only, no emojis. Berry night. The now-line = brightest.
- The soul laws: mirror-not-price, no shame mechanics, always a way out, appetite dial governs everything, eyes-closed law in tools.
- The Guitar-Hero physics (fuse/split/ghost/battery) — the redesign AMPLIFIES it, never replaces it.

## 2 · Surface by surface

### NOW — cockpit + dock (mocked)
Play-first idle: the app's main verb is the hero (pink play, 3 doors: Отследить сейчас / План+трек следующего / Спланировать день). Pick activity → pick time = plan+track (full points); skip time = unplanned + ONE gentle line (David's locked pick). Pause on the circle (shipped v802). Mode-border when a guided flow owns the stage. All #sheet flows migrate into the cockpit stage over time (the structural debt).

### DAY — the timeline (the crown jewel; touch least, amplify most)
Keeps ALL physics. Adds: reward integration (tier-2 ignition ON the block, fire chip in the dock, a subtle crown-progress pill in the header: "3/5 по плану"), the EDGE INSPECTOR for small edits (mocked — day never leaves view), zoom-in anchors to now (G1), live-bubble top glow (G8), blinking-record affordance (G7), label fold (G13), first-touch ghost-hand hints. Empty day = one warm invitation line + the plan-day door, not blank rails.

### WEEK — the bridge zoom (new view, mocked)
7 compressed day-columns of the user's REAL blocks (same colors/finishes as day view — recognition, not abstraction). Crowns above perfect days, fire between streak days, today outlined pink. Tap column = zoom into that day. Replaces the current week scope render.

### MONTH — the crown calendar (new view, mocked)
Grid of day-cells speaking the battery language: matte quiet · striped shining (intensity = match-rate) · gold-border + crown = perfect · fire marks streak runs · dashed = away days (never shame). The month's story in one glance; tap = that day. This view IS the retention engine — the GitHub-graph effect wearing ALTER's palette.

### LIFE — the journey (mocked)
Done nodes = bright trophies (shipped v803); ignition + points-fly (motion run); chapters = SEASONS: each has a banner, milestone rewards (garden cosmetics + cards), and mastering one mints its chapter card. Locked chapters = fog-of-war, not 8 identical padlocks. The wisdom-drip (education layer, separate spec discussion) rides the journey's daily nodes when built.

### FOREVER — the world/game pane
The world = where light SETTLES: the garden grows from real actions only (law kept), plus THE BINDER (badge/quest/chapter cards, element-typed finishes: ПРИЗМА/ВСПЫШКА/КОСМОС + crimson slash/gold lattice/bio-green), the trophy shelf, and spark SINKS (garden cosmetics, world buildings, trick decks — existing). Journey earns; world displays and spends.

### PLAN DAY — the Big-3 staged flow (keep, polish)
The 3-beat guided flow stays (Energy/Work/Love + identity line). Evolves: picks lay onto a live mini-timeline preview strip as matte cards (you SEE the day forming); masterpiece-day presets = one-tap hands; finish = the day fans out onto the timeline with the cascade. No new mechanics — better staging of what exists.

### GOALS — quest cards (mocked)
Each goal = a quest card: element-tinted, foil edge fills with progress, the BREAKDOWN LADDER lives on the card (steps with spark bounties; the active step glows; sub-progress pips), "Поставить сессию в день" connects a step directly into the day plan (goal→timeline = the missing link), WOOP on the card back (flip). Completion mints the full-art card with date + story. Deep breakdown = steps can nest one level (session-sized leaves only — a leaf must fit in a day block).

### HABITS
Habit rows carry their own fire level (ember→blue). Habit done-marks use tier-1/2 rewards. A habit's card exists in the binder at rank milestones (21/60 days).

### TOOLBOX + PLAYERS (mocked)
One-door (David's pick): FOR-RIGHT-NOW card (instant-start on tap, config on long-press) + daily shelf + two folded rows (Все инструменты / Собрать сессию). Players: pre-roll breath, ending silence, depth runes feed Глубина badges. Tool completion = tier-1/2; never earcons inside sessions.

### BENTO
Peek-cut rows (3rd chip half-visible = "this scrolls"), search icon top, most-used adaptive first row. No structural change — it works.

### ONBOARDING
Existing 6 beats + mints the TRAINER CARD (identity word, matte) = the binder's first card + the reason to collect. Ghost-hand gesture beats teach the timeline on first touch.

### YOU TAB
Trainer card on top (identity = a thing you own), then Profile / Sound / Data / Advanced.

### MENUS/CHROME
Day-tools ⋯ = icon grid. Toasts stop carrying rewards (the tier system does). TLM rides the flying points. Haptic grammar (4 patterns). 12px type floor + 44pt targets everywhere (Phase 1 shipped v803).

## 3 · The nuanced reward economy (the full loop)
**Currencies & permanences:** Spark (spendable) · Fire (temporal multiplier — decays only by absence, never punished) · Cards/Badges (permanent collection, element-typed, ranked, some shiny) · Crowns (calendar permanence) · Garden/world (spatial permanence).
**Earn map (every source, tiered):** tracked minutes T1 · matches T2 (partial = near-miss line "87% — 4 мин не хватило", reward-framed) · combos T3 · perfect day T4 (crown+chest) · chapter/badge/quest completion T5 (mint) · tool/meditation completion T1-2 + depth accrual · journaling/bookends T2 · RETURN AFTER GAP = flagship T5 card (the inversion) · courage (avoided thing done) T2+Смелость progress.
**Sinks:** garden cosmetics, world buildings, trick decks, card frames/sleeves (cosmetic only — power is never purchasable).
**Collection design:** 6 badge families × 4 ranks, chapter cards (8), quest full-arts (unbounded — the user's real achievements), trainer card evolutions, ~1/20 shiny variants (bonus-on-top law). Unearned always visible as matte aspiration + "next mark" progress line.
**The want-more engine (ethical):** beauty + uniqueness + story (flavor text = user's own data) + visible next-step progress — never scarcity pressure, never loss threats, never paywalls. Pokémon model, not casino model.

## 4 · Build phases (each ships alone, David device-checks between)
1. ~~Type & targets~~ (v803 SHIPPED).
2. **MOTION RUN** (next session): tiers 1-2 (ignition, points-fly, counter-pop, TLM rides), fire-level streak chip, G-items (glow, record-dot, label fold, zoom-anchor, icon rail), reward() router.
3. **FLOWS RUN:** cockpit play-first + toolbox one-door + edge inspector v1.
4. **CALENDAR RUN:** week columns + month crown calendar (pure render work on existing data — blockStatus/matchedSpan feed it).
5. **COLLECTION RUN:** S.badges + binder + trainer card + quest cards (goals rework) + mints (element treatments, gyro tilt).
6. **ECONOMY RUN:** combo/crown/chest + shiny + sinks + earcons.
7. Onboarding polish + game-pane audit (persona sprint feeds this).
Risk law: half-shipped-verified > fully-drafted-unverified; the timeline's physics never regress for a finish.

## 5 · The four pipelines (the app in tandem — no stone unturned)
The SAME app serves all four because three routers already exist and the redesign completes them: the APPETITE DIAL (how much course/guidance), SIMPLE MODE (which panes exist), and the ENERGY DOOR (what this open is for). Onboarding sets their defaults; the app adjusts them from behavior.

**ДАВИД (power user, builder):** Entry: cockpit/planner. First 60s: AM bookend → Big-3 plan → first tracked block. Daily loop: match→combo→tools mid-day→PM chest. Weekly: crown calendar review (Sunday), quest-card session for the book/ALTER. His hooks: combo/fire, quest full-arts, the month view. Settings exposed: everything incl. AI key, voice debug, export. Risk to guard: feature-owner blindness — his flows must never gate the others'.

**МАМА (RU, non-technical):** Entry: journey ONLY (simpleMode clamps panes — exists). First 60s: one warm stone → «Что ты делаешь прямо сейчас?» → track → done, garden grew. Daily loop: 1 stone + 1 tool (for-right-now Дыхание) + the PM one-liner IF offered (appetite low). Her hooks: the garden's visible growth, the guardian's RU voice, streak fire she can SEE. Reflection cards: one-tap only, never typing. Settings: one gear → 5 rows, huge type. Risk: any EN string or silent audio breaks trust instantly (B-rules + __latinAudit forever).

**СЕСТРА (EN, reels-addicted, needs relief not planning):** Entry: the energy door routes her open → relief = for-right-now tool INSTANT start (20s). Session budget: ≤5 min, beauty-first. Daily loop: micro-stack ritual, maybe one journey stone. Her hooks: the HOLO CARDS (the collection is designed for her), shiny variants, Instagram-grade motion. The Вернулся card exists FOR her 5-day disappearances — the return is celebrated, never guilted. Reflection cards: the vibes format (which is closest?) — she'll answer those; she will never journal. Risk: any nag, any wall of text, any guilt = uninstall.

**БРАТ (skeptic, results-oriented):** Entry: tracker/stats. First 60s: track a workout, see the number. Daily loop: track → match-rate → combo chip (his competition). Weekly: the crown calendar IS his proof (data, not vibes). His hooks: fire levels per habit, Точность badges, export. Appetite: dormant/low — course nodes suppressed (exists). Reflection cards: post-block only, 3 choices, 5 seconds. Risk: anything that smells like self-help fluff before he's earned trust in the numbers.

**In tandem:** one reward language readable at every literacy (color/fire/cards need no words) · total RU parity · the journey adapts node sets per profile · every guided thing skippable · the four entries (cockpit/journey/tool/stats) are the SAME world at different zooms.

## 6 · Onboarding rebuilt — «Прибытие» (The Arrival, 5 beats ≈ 90s, mocked)
All beats live in the night-world (no white sheets, no forms). Progress = 5 course-style bars.
1. **Встреча** — the guardian appears, 3 short lines, tap-through ("я не буду тебя чинить — я буду рядом, пока ты живёшь").
2. **Первая карточка** (worksheet DNA, mocked): «Что сейчас ближе к правде?» — 4 element-colored answer CARDS (Горю/Плыву/Застрял/Тону); the guardian responds ALOUD to the choice. Sets appetite+door defaults.
3. **Одно дело** — «одно дело, которое сделает сегодня победой?» — stage-based chips + optional type.
4. **Минт карты тренера** — identity word → the trainer card mints (matte, flip+sheen) — "твоя первая карта; она растёт с тобой." The binder now exists with 1 card.
5. **Дверь** — the energy gauge routes to the right first stone (relief tool / track / plan); lands on the journey with the first stone glowing.
Persona defaults set silently: Мама-pattern answers → simpleMode+RU checks; Сестра-pattern → relief door default; Брат-pattern → appetite low + stats surfaced.

## 7 · Reflection cards — the worksheet engine (course DNA everywhere, mocked)
THE mechanic that fuses the 300-day-course worksheets with the app: **one question + 2-4 choice chips + optional «своими словами» (never required) + skip always visible.**
- **Sources:** the mined course beads (engine-v1.json 82), JOURNALING-101, the PM bookend Qs, chapter test-outs.
- **Placement (frequency-capped by appetite):** journey daily node (≤1/day) · PM bookend (the core 2-3) · post-tool («что изменилось — легче/так же/не знаю») · post-first-match · chapter transitions (a 3-question worksheet = the test-out).
- **Every answer does three things:** writes to the profile (the app LEARNS — and shows it: «заметил: 3-й раз за неделю…») · pays tier-1 · appends to the ЖУРНАЛ — the reflections log rendered as filled worksheet pages. Over months the user has WRITTEN THE COURSE WORKBOOK ABOUT THEMSELVES — that's the genius loop and the retention moat.
- Laws: eyes-closed law untouched (never during sessions) · Mom = tap-only · skipping costs nothing · the guardian must periodically PROVE it learned (the noticing line) or the cards feel like a survey.

## 8 · Settings — one gear, four rooms, trainer card on top
Every surface's gear → the SAME You tab: **Карта тренера** (identity, evolves) → **Профиль** (word, wake/bed, language flag, appetite dial, simpleMode) → **Звук** (voice/bg/earcons/beds) → **Данные** (backup/snapshot/export/import) → **Продвинутое** (AI key, voice debug, redo onboarding, dev). Persona-filtered: Мама sees the first four rooms as 5 total rows; Давид sees everything. No setting ever lives anywhere else — one address for control.

## 9 · The «expensive» micro-interaction grammar (David: intro + every press + every transition)
INTRO rebuilt (mocked, approved direction): restraint + one perfect motion — halo breathes, a light sweep crosses the mark every ~6s, 3-5 barely-alive stars, wide-tracked wordmark, ONE pink button; nothing else moves or asks.
FIVE LAWS: ① every press acknowledges (shadow 4px→1px + 2px sink on touchdown, SPRING release — extend the existing :active pattern app-wide) ② every menu comes from its cause (sheets rise from their button, bento grows from the tap point, panes slide) ③ one easing family = the v648 spring tokens, zero linear ④ interruptible — mid-animation taps redirect, never queue ⑤ nothing moves uncaused (one focal breather max). ~90% CSS on existing classes; this IS the one-guy→company delta.
PALETTE LAW (violated by two mockups, corrected): surfaces = berry night ONLY (#2c081a/#22091a family); color lives in ICONS; pink = the single selection/hero accent per screen; gold = reward labels; purple only as a whisper. Full-saturation fills are reserved for the timeline's domain blocks and card-moments.

## 10 · The goal ENGINE (the brain behind the quest cards)
① ONE-NEXT-STEP LAW: a goal always has exactly one active session-sized step, one-tap schedulable into the day (goal→timeline = the link). ② RIGHT-SIZING: repeated non-starts → propose smaller (tooBigSheet exists); steps shrink to fit reality, never shame it. ③ STALL RESCUE: N quiet days → the JOURNEY offers a wayback stone for that goal (reward-framed) + Jeopardy/Reversal attached for avoidance patterns. ④ EVIDENCE NOT INTENTION: card progress fills from actual tracked sessions; weekly one-tap reflection per goal («ближе/так же/дальше — почему?») feeds coaching. ⑤ HONORABLE RELEASE: «отпустить цель» archives with story, no shame. AI-assist (BYO key) may draft breakdowns; the laws work without it.

## 11 · Pending David's verdicts (proposed in chat, awaiting approve/reject)
- **Intro v2** (mocked, corrected after the square-sheen complaint): glint ORBITS the halo ring (jewelry, not a rectangle sweep), spark only breathes, buttons kept (approved), language = quiet GLOBE top-right → flags only on press (flag-always-visible rejected as ugly).
- **Element warmth (A/B mocked):** B = each domain's energy warms its own card (deep tint + element edge + icon well + faint pattern, ~8% opacity). Buys warmth/recognizability (Мама); costs some night-austerity + reward-contrast. RECOMMENDED: half-strength B — warm only USER-CHOSEN content (their tools/habits/quest cards); chrome/sheets/settings stay austere. Awaiting: A / B / half-B.

### §11 correction — THE COMPONENT LANGUAGE LAW (learned over 3 iterations, David rejecting 2)
ALTER's welcoming look = **CHUNKY GAME PIECES**: solid domain-color fills with INK text (#160510 borders, hard 0-4px-0 shadows) — the bento-chip / СТАРТ-button / jp-hmbtn language. Selection = the GOLD RING (the matched-block language) + a gold check badge. REJECTED twice: ① off-palette pastel tiles (olive/teal cards) ② monochrome berry tiles with icon-only color ("too pink, boring"). The night canvas stays austere; the INTERACTIVE PIECES are full-color game chips. Answers in choice cards = one domain color EACH (colorful hand of options). Flags = FLAT drawn rectangles (the app's existing picker), never emoji, only visible behind the globe.

### §11 correction 2 — THE SOFT-TILE / IGNITION LAW (supersedes "game pieces"; 3 rejections taught it)
The real law was in the bento code all along (actChip SOFT comment): **choice tiles at rest = muted dark domain-tinted (colored icon + light text); ONLY the selected tile ignites — striped domain fill + ink text + gold ring + check.** One bright element per screen: the user's choice. It's the battery metaphor applied to buttons (matte until chosen). Rejected on this surface: pastels ("bad colors") → monochrome berry ("too pink, boring") → all-solid chips ("too bright, so ugly"). Approved pattern across all "holy moly" mockups: dark theatrical night + 1-2 saturated heroes max.

### §11 final — THE COCKPIT GRAMMAR (David named the play-first mockup as the beauty benchmark)
Three rules extracted from what he keeps approving: ① **one HERO** per screen (a big confident element — ring/disc/question) ② **layered ROOMS** (hero zone above; the action sheet rises below in its own surface with a border seam) ③ **hierarchy through FINISH VARIETY** — solid pink primary → striped secondary → ghost tertiary, descending energy. And the breakthrough for choice-UIs: **finishes ENCODE meaning in the timeline's own vocabulary** — mood answers = bright stripes (burning) / matte stripes (coasting) / ghost dashed (stuck) / solid mauve (drowning, the drift render). The user who knows the timeline FEELS the answers. Selection still = gold ring + check. This grammar supersedes all prior §11 laws for guided/choice surfaces; the soft-tile/ignition duality remains for dense pickers (bento).

### §12 — THE APPROVED CANON (David's confirmed benchmark frames, build against THESE)
① **Play-first cockpit** ("way more beautiful design decisions") — the grammar source: hero + rooms + finish hierarchy. ② **Journey re-grade** ("not bad" = approved): done = brightest object w/ breathing green halo, future = matte, locked chapters = fog, ONE striped hero node. ③ **Toolbox one-door** (holy-moly batch). ④ **Pokémon-grade element cards** (prism/burst/cosmos — "more of that"). ⑤ **Cockpit-grammar onboarding/reflection** (finish-encodes-meaning, pending final nod). REJECTED SET (never repeat): pastel tiles · monochrome berry choice-tiles · all-solid chip walls · square sheen over the logo · always-visible flags · thin primary CTAs · purple-dominant cards.

### §12 additions (David verdicts)
- **STRIPE GAUGE LAW:** one gauge only — the app's chunky 9px/18px diagonals. Thin (2-4px) stripes and circular/radial ripple patterns REJECTED ("feel off"). Element-warmth B, if adopted, = tint + edge + icon well ONLY (its faint patterns die); small calendar cells use solid tints, not shrunken stripes.
- **WARM FLOOR LAW:** night gradients settle on warm berry (#241019-ish), never near-black; a faint rose glow may rise to meet the primary CTA. (Intro v3 mocked with this — awaiting nod; intro v2's black floor rejected.)

### §12 — THE JEWEL LAW + selection correction (from the reflection-screen rejections)
- **Jewel tones only:** clean saturated hues deepened by darkness (hero pink, fire orange, СТАРТ blue, cosmos indigo). MUDDY MID-TONES REJECTED as "cheap": grey-teal, dusty mauve as a mood color (mauve stays ONLY as the timeline's drift render). Drowning mood = deep ocean indigo (cosmos family), not mauve.
- **Gold = hairline INSET only** (the fusedbar language). Fat gold outer rings rejected. **Dashed + gold never coexist:** a selected ghost tile stops being ghost — selection = IGNITION into the hero finish (pink stripes + inset gold hairline + check). The pick becomes the hero.
- **PROCESS LAW (constitution echo):** mockup ping-pong on fine color = diminishing returns (6 iterations on one screen today). Final color tuning happens IN THE REAL APP on device: the flows run ships choice-screens with a dev toggle cycling 2-3 approved variants; David's eye decides in context. Mockups settle STRUCTURE and grammar (done); devices settle hues.

### §12 — INTRO: final direction (v800's real animation WON)
David compared mockups to the LIVE v800 intro: its existing animation is better than both mockup variants. Decision: the real intro animation stays the base. Surviving changes only: ① globe icon top-right → flat flags on press (replaces the always-visible flag) ② floor tuned BETWEEN v2/v3 — deep berry, never black, NO rose glow (v3's glow read "cheap"). Both land as code in the flows run with a live variant toggle; no more intro mockups.

### §12 — THE CLASSY LAW (extracted from David's three named references: quest card / cockpit / edge inspector)
Classy = **90% dark rich surface + luxury carried by METAL and FINE DETAIL** (foil frames, hairline insets, pips, small precise controls) — never by colored area. Meaning-finishes (fire stripes / matte blue / ghost / cosmos) live in SMALL FOIL-FRAMED MEDALLIONS (~42px) on dark cards, not full tiles. Large saturated fill budget per screen = ONE: the ignited pick (pink stripes + hairline gold inset). All prior full-tile choice designs superseded. Hue fine-tuning still lands on-device per the process law.
