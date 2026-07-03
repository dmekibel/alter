# AUDIT — 1:1 DRIFT vs CANON SCREENSHOTS (2026-07-03)

Canon = the 15 JPGs in `/Users/Dmekibel/Downloads/APP/` (David's approved design frames).
Audited against `app.js` (9,356 lines) + `index.html` CSS at v847-era HEAD. **Audit only — no code changed.**

Conventions:
- **DRIFT** = canon shows it, code does not produce it (or produces it differently).
- **SUPERSEDE?** = code comment cites a David device-verdict dated 2026-07-03 (same day as the canon export) that deliberately changed this. David must arbitrate: canon frame vs device verdict.
- **NON-DRIFT (i18n)** = English source strings are translated at the display layer (1,232-string RU dict); EN in code ≠ drift.
- **VERIFY** = element likely present but not line-verified this pass; confirm in a screenshot diff.

---

## 1. `09.45.33.jpg` — COCKPIT IDLE («Что сейчас?») + duration sheet + yesterday-echo

Render: `renderTrackerFull()` idle branch app.js:3829–3857 · `trackerControls("idle")` app.js:4795–4803 · CSS index.html:1466–1510.

Overall: **strong match** — pink play disc (3838), question-title (3830), next-block chip `.tf-subblock` w/ pink hairline + pink countdown (3833, CSS 1492–1496), three fixed doors (pink solid / striped-blue named / ghost), docked «— сколько?» sheet w/ pink selected chip + ti-calendar-check (3842–3847, `.k-dur.on` CSS 1351), «без времени — просто трек» escape (3846), foot «с планом очков больше» (3847), empty-morning invite (3834), «ВЧЕРА СЕЙЧАС» echo sheet w/ ti-history chip (3848–3855).

Drift:
1. **Idle title weight/size.** Canon «Что сейчас?» is a hero heading (~26px Jost 800). Code: 21px (`#trackerFull.st-idle #tfTitle`, index.html:1476). → bump to ~25–26px.
2. **Next-block chip layout.** Canon: two-column card — title left (white 800), «через 12 мин» right-aligned pink, chip nearly full-width. Code: single inline row, hugs content. → `.tf-subblock` (CSS 1492) add `width` + `justify-content:space-between`; countdown already pink 800 (1496).
3. **Plan-day ghost door on the WITH-plan frame.** Canon left frame shows all THREE doors incl. ghost «Спланировать день»; code with-plan branch returns exactly that (4798–4800) ✓ — no drift, listed for the record.

## 2. `09.45.59.jpg` — COCKPIT LIVE (on-plan / off-plan)

Render: `renderTrackerFull()` live tail app.js:3871–3897 · `trackerControls` "onplan"/default app.js:4812–4814, 4837–4844 · CSS index.html:1661–1688.

1. **Off-plan «Составить план» striped-blue door missing.** Canon right frame: prominent striped-blue door above Пауза/Стоп. Code: the striped Replan/Create-plan door renders ONLY in the `drift` sub-state (4840); plain off-plan gets solid-gray Stop + Break half-row (4843). → `trackerControls` default branch app.js:4837–4844: give non-drift off-plan the striped `mk` door too.
2. **Off-plan dashed ring not domain-tinted.** Canon: dashed ring in the activity's color (orange around Чтение). Code: fixed `border:2px dashed #3a2540` (index.html:1687). → set border-color from `D.c` in the off branch of renderTrackerFull (app.js:3888).
3. **Timer size.** Canon 37:12 / 42:07 are hero-scale (~56–64px). Code: 44px (`.st-onplan .tf-time`, index.html:1666). Jost 800 tabular ✓, size drifts. → ~58px.
4. **On-plan primary label.** Canon: green «✓ Готово — засчитать» (ti-check). Code: «Stop» + ti-player-stop, same green (4813). **SUPERSEDE?** (comment cites David device 2026-07-03 «ONE ending — Стоп»).
5. **On-plan secondary row.** Canon: Пауза + Перенести. Code: only Перерыв; Reschedule removed (4812 comment — title-pill IS the switch). **SUPERSEDE?**
6. **Converter dot color.** Canon: white breathing dot on the ring edge. Code: gold #ffd24a (`.tf-convdot`, index.html:1673). **SUPERSEDE?** (comment: David device 2026-07-03 made it gold).
7. **Off-plan docked sheet.** Canon: «Чтение — сколько ещё?» with FOUR chips (15м/30м-selected-pink/1ч/2ч) + «⇄ сменить занятие» footer. Code: FIVE chips [5,15,30,60,120], none selected, footer removed (3893–3897). Footer removal flagged as Batch-2 deliberate; the missing selected state + chip set is plain drift. → app.js:3896.
8. Status lines ✓ exact: «по плану · осталось N мин · конец HH:MM» green (3881), «N мин затрекано · план удвоит очки» blue (3883). Title switch-pill dark domain-tinted ✓ (3875).

## 3. `09.46.06.jpg` — TIMELINE (day) + EDGE INSPECTOR

Render: `buildPull()` app.js:3397–3427 (header), `calendarView()` app.js:6560–6700, `openEdgeInspector()` app.js:6865–6896 · CSS index.html:882–1007, 2191–2194.

1. **EDGE INSPECTOR SHIPS DARK.** Canon right frame IS the block editor. Code: gated behind `window.__edgeInsp` (app.js:6616), enabled only via `DEV.edgeInsp()` (app.js:9269); default tap opens the legacy `editorSheet` (#sheet). The panel itself (6865–6896 + CSS 988–1007) matches canon anatomy: pink halo `.ei-editing` (1007), −/+ start stepper, 30/60/90 chips, color dots + ···, «Ещё ›», hold-to-fill удалить. → flip the default: make `editBlk` use the inspector for plan bubbles.
2. **Earned blocks wear NO gold ring.** Canon: «Утренний стек» + «Глубокая работа» (done/earned) carry a gold border; ink shadow beneath. Code: done/cele blocks get `borderColor:"#160510"` (app.js:6648). Violates gold=earned law. → in the `status==="ok"` branch set border `#ffd24a` (2–2.5px) keeping ink hard-shadow.
3. **Hour gutter is 12h.** Canon: 24h numbers (11 12 13 14 15 16). Code: `((_hh % 12) || 12)` (app.js:6588; also 6589–6590 for :30/:15). → 24h format.
4. **Day crown-band missing.** Canon: centered «· ЧТ · 2 июля 👑 ▮▮▮▮▮ ·» (crown + 5 gold day-quality pips). Code: `.day-stacksep` = left-aligned uppercase label; the `day-done` chip is hidden by CSS (`display:none !important`, index.html:2194; band restyle 2191–2193). → rebuild the sep content: weekday+date + crown-if-perfect + gold pips from dayStats (app.js:6898).
5. **Missed-ghost ↩ undo affordance missing.** Canon: dashed ghost «Обед» carries a right-aligned return-arrow icon. Code: adds a text sub «want to log it?» (app.js:6685). → replace csub with a ti-arrow-back-up icon pinned right.
6. **Now-line chrome heavier than canon.** Canon: bare pink hairline with round dots at the ends. Code: line + glow shadow + left icon-circle (`nowcirc`) + right NOW/elapsed readout (app.js:6592). → slim to hairline + end dots; keep readout only while tracking.
7. **No duration tag on blocks.** Canon: «Тренировка … 42м» right-aligned inside the bar. Code `cn` shows icon+title+step-count+sparkle only (app.js:6684). → append a right `cn-dur` span on bars ≥22px.
8. **Header composition.** Canon: big left-aligned «Сегодня» + one pink «Сейчас» pill. Code: icon scope-seg left + centered 15px day label + Now pill + ⋯ tools (app.js:3406–3415). → promote the day label to the left hero (Jost 800 ~22px); scope-seg + ⋯ can stay but visually quieter.
9. Inspector nits (once enabled): selected length chip wears a gold ring (`.ei-chip.on`, CSS 998) and selected dot too (1002) — canon shows plain pink chip / bare dots («pink halo — never gold» annotation). → drop the #ffd24a ring inside the inspector.

## 4. `09.46.10.jpg` — PLAN-DAY (shapeFlow) + finish cascade

Render: `shapeFlow()` app.js:7419–7455 · `big3HeadNode` app.js:7405–7418 · `bentoPicker()` app.js:7142–7332 · `pdSyncStrip` app.js:7269–7283 · CSS `.pd-*`/`.bento-*` index.html:1107–1180.

1. **The hero QUESTION is missing.** Canon: big Jost-800 «Что двинет работу вперёд?» + sub «одно-два дела — уже день» above the chip grid. Code: the beat's bento title is just the domain label («Работа», app.js:7431–7445); no question heading, no sub. → per-beat question strings in `big3HeadNode`/bento title.
2. **No top beat-TABS with colored underlines.** Canon: Энергия/Работа/Любовь/Остальное visible simultaneously with per-domain underline bars, current highlighted. Code: four SEQUENTIAL bento screens (Next/Back), no tab row in the scoped view. → render the 4 beats as a fixed tab strip.
3. **Selected chip stripe too faint + wrong language.** Canon: chosen chip = solid domain-STRIPED fill (blue) + ✓. Code: `.bchip.sel.pd-lit` = `rgba(255,255,255,.16)` hairline stripe overlay (CSS 1173) on top of the fill; outside plan-day `.bchip.sel` is a gold halo + scale (CSS 1110). → chunky two-tone domain stripe (like `habStripe`), drop the gold halo.
4. **«ДАВНО СОБИРАЛСЯ» ember row EXISTS** ✓ (app.js:7190, `.pd-ember` CSS 1172, flame label `.pd-ember-lbl` 1171).
5. **Identity hero EXISTS** ✓ — `.pd-hero` «Ты сегодня —» + jewel-colored identity word (app.js:7405–7418).
6. **«День собирается» strip EXISTS** (app.js:7269–7283; hour axis 08/12/16/20/24 exact; pink now-tick) — canon's draggable slider pin is a static tick in code (minor).
7. **Advance/skip buttons.** Canon: big blue «Дальше →» + bare «пропустить» ghost word. Code: blue in plan-day ✓ (7264) but labeled «Next: Work» etc. (7436); skip is a filled dark-berry button (CSS 1133), not a bare ghost word. → label «Дальше» + strip the skip chip to ghost text.
8. Finish cascade (right frame): staggered spring cascade shipped v648 ✓; guardian seal line «День собран — N дел…» + pink sparkle disc — VERIFY composition on device.

## 5. `09.46.17.jpg` — CALENDAR WEEK + MONTH

Render: `weekGrid()` app.js:6901–6944 · `monthGrid()` app.js:6946–7079 · CSS index.html:568–598.

Week — strong match: day-track columns + striped done segments (6921–6928), crowned column gold hairline + shimmer (CSS 583) + crown icon (595), now-line + dot (6930), orange fire-run bar + flame (6936–6937), «29—5» stat (6940), foot «N жилых дней · 👑 · серия N» (6942), fold-hint (6943).
1. **Scope switcher: icons vs words.** Canon: text pills «День / Неделя / Месяц», active = pink pill. Code: three ICON buttons (`scope-b` ti-list/ti-layout-columns/ti-layout-grid, app.js:3409/3421, CSS 1736–1737). → text labels.
2. **Week/month header title.** Canon: period readout right («29—5» / «Июль») in the top bar. Code: «Weeks»/«Months» label + the stat inside the page (6940). → lift period readout into the header row.
3. Month (from code sweep): **no dashed «в пути» cell**, **no soft halo/ring return-day**, **crown = full gold border not hairline**, legend intentionally removed (David) — canon shows legend rows (тихий/сияние/корона/заряд/в пути/возвращение). → monthGrid app.js:6946+; treat legend as SUPERSEDE?, the dashed/halo cell states as drift.
4. Canon month today-cell = bright pink filled square w/ big day number ✓ VERIFY.

## 6. `09.46.21.jpg` — JOURNEY («Твой путь») + return state

Render: `drawJourney()` app.js:2292–2766 · jp-* CSS.

Node grammar (done/current/future/locked), chapter card, spark counter, stepping-stone pop-ins — match per code sweep. Drift:
1. **No «Закрыть день» moon node at the trail end.** Canon: purple moon stone closes every day. → append a fixed PM-bookend node in `jpNodes()`.
2. **Guardian seal lines only fire on first-completion.** Canon: a seal line sits mid-trail as narrative («утро было тяжёлым — начнём с главного») whenever context warrants. → extend the seal-line hook.
3. **Header day-pips + gift.** Canon: 4 colored segment pips + gift icon under «3 из 5 сегодня». VERIFY — not confirmed in sweep.
4. **Return state (right frame).** Gap-return stone + warm line exist (app.js:728, 902 — return-as-focal-node, micro-win). Canon adds: dashed pause stone w/ boat icon, «+5» float, gold/foil «НАГРАДА · ПРИЗМА / Вернулся» card, prism-mint fired ring, «Возвращение — засчитано» green line. VERIFY each — the reward-card composition is likely partial. If the prism card is absent it must reuse `.el-prism` (index.html:1265).
5. Current-node quest card w/ blue СТАРТ + «не сейчас» ghost ✓ exists (journeyStageStep pattern; node act CTA) — composition VERIFY vs canon (title + one-line + big blue).

## 7. `09.46.27.jpg` — QUESTS/GOALS + WOOP card-back

Render: `goalsSheet()/drawMap()` app.js:2766–3222.

Present per sweep: hero quest card w/ gold-foil edge + % readout, milestone rows w/ +XP and green checks, session pips, pink schedule-session button, quiet second quest, collection teaser, «Отпущенные · N» door, full WOOP card-back (ЖЕЛАНИЕ/РЕЗУЛЬТАТ/ПРЕПЯТСТВИЕ/ПЛАН), if-then plan sentence, «Отпустить с честью» dashed door. Drift:
1. **No card-back FLIP animation.** Canon: «the literal card-back flip». Code: in-place redraw. → add a 3D rotateY transition on open (goalsSheet detail open).
2. **If-then sentence emphasis.** Canon: one readable sentence, condition white / action pink 800, inside a gold-hairline box + edit pencil. VERIFY exact styling vs code.
3. Foil-% «фольга заполняется» label + 62% gold — VERIFY the % is gold Jost 800.

## 8. `09.46.32.jpg` — HABITS PATH («Привычки»)

Render: `habitPathSheet()` app.js:7083–7112 · CSS index.html:1076–1093.

Match: header + count, spark pill, gradient progress (1078), striped done stones (`habStripe` 7082), outline undone stones (7100), green check badge (1085), flame tier badge (1087–1089), weekly dots (1092), mirror lines incl. «×23 — огонь стал синим» / «уголёк тлеет» / quiet-streak reframe (7075–7080), dotted spine (1081), thread legend (7111). Drift:
1. **No zigzag.** Canon: stones alternate left/right down the path (Duolingo winding). Code: single centered column (`.hp-path` align-items:center, CSS 1079; `.hp-stonewrap` 1080). → alternate `align-self` / translateX per index.
2. **No hero-scale current stone.** Canon: today's key habit (Глубокая работа) is ~1.4× bigger with a pink glow halo; others vary. Code: all stones fixed 118px (CSS 1082), no glow. → size tiers (done ~104 / current ~150 w/ `box-shadow:0 0 26px rgba(255,95,168,.5)` / future ~112).
3. Spine dots: canon = small bright dots; code 4px dotted #4a2a44 — slightly dim. Minor tint.

## 9. `09.46.37.jpg` — GARDEN + COLLECTION BINDER

Render: garden world ~app.js:2350–2500 (`worldPattern` 2429) · `binderSheet()` app.js:6054–6556 · `.el-*` CSS index.html:1265–1270.

Garden: night sky/moon/stars/hill/plants/tooltip («посажено … — день, когда ты вернулся») + bottom pill ✓ per sweep. Drift:
1. **No planting ripple spot.** Canon: concentric ripple ring marking where today plants. → add a pulsing ring at the next-plant coordinate.
Binder: header + «12/24 СОБРАНО» pill, МЕТКИ/ТРОФЕИ tabs, wild-pattern card fills DO ship (`elCardBG` app.js:6007 → `.el-prism/.el-burst/.el-cosmos`), tier pips, locked progress card, gold trophy row ✓. Drift:
2. **No flavor-tag subtitles.** Canon: colored caps «ПРИЗМА · СИЯЮЩИЙ» / «ВСПЫШКА» / «КОСМОС» under each mark name. Code: plain `b.unit`; BADGES config lacks flavorTag fields (game-BUILD spec defines them). → add flavorTag per badge + colored caps line.
3. **No newest-card glow.** Canon: the fresh mark wears an animated prism/rainbow border + corner sparkle badge. Code: none. → `.bnd-new` animated border + ti-sparkles corner.
4. Crown/locked card: canon shows 4 empty pip squares + pink progress — VERIFY pip squares.

## 10. `09.46.42.jpg` — INTRO / BOOT + load & erase cards

Render: `#startScreen` index.html + app.js:1850–1990.

Match: halo+spark mark (gold ellipse + pink 4-point star + glint, index.html:2480–2486), ALTER wordmark 42px, ember day-tag «день N вместе» (app.js:1864–1865), GREEN resume naming last activity (`.ss-primary.ss-go` #28cf86, app.js:1861, CSS 98), Загрузить/Начать заново ghost words, version line, load-preview card («ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ», name, days · запись date, pink Восстановить, отмена — app.js:1892–1905). Drift:
1. **Erase card is not actually ARMED.** Canon: «Arming makes the erase a real door — the 4s un-arm window drains visibly» — the drain is an un-arm countdown guarding a second, real tap. Code: the erase button fires IMMEDIATELY on first click; the 4s `.ss-drain` bar merely auto-closes the card (app.js:1907–1918, `setTimeout(ssCloseCard,4000)` 1917). The cap even says «1-Й ТАП» but no two-tap arming exists. → make tap-1 arm (drain starts, button turns hot), tap-2 within 4s erases.
2. **Top-right button is a country FLAG, not the canon globe.** Code `.ss-flag` rectangle (index.html:2476); canon shows a globe icon in a rounded square. → ti-world icon.
3. Widget-fidelity check (per fidelity law): halo tube highlight position, letter-spacing of «A L T E R» — screenshot-diff before calling it 1:1.

## 11. `09.46.46.jpg` — FIRST WIN + FIRST TRAINER CARD (onboarding)

Render: `onboard()` app.js:4913–6054 (first-win ~5006, trainer card ~5055, pact-after-gift 4960) · CSS index.html:1967–1990.

Verified MATCH (fuller than expected): «первая победа» pink kicker (`.ob-kick` 1967) + **gold 52px «+18 Искр»** (`.ob-big` #ffc41f, app.js:5007, CSS 1968) + sub «настоящее дело — настоящая награда» (5008) + gold-bordered task card w/ green hand tile + gold check (5011–5012, CSS 1969–1974) + green «Сделал» (5013) + «искры улетели в твой счёт — я запомнил» foot (5014) + gold step dashes (4921, CSS 1925). Card screen: TRAINER CARD №001 head (5055), sparkle, name 34px (5057, CSS 1979), EST · date (5059), «НА ОБОРОТЕ — ПАКТ» + gold pact box (5061–5064, CSS 1985), «РАСТЁТ С ТОБОЙ» pips 7 дней/корона/возвращение (5065–5067), «коллекция · 1» chip (5068), «она твоя — навсегда» (5069), pact-after-gift order (4960). Drift:
1. **Sparkle counter pill top-right («✦ 18») missing** on the payoff screen — canon shows the flyPoints arcing into a header counter that pops. Code has no header counter/absorb animation on this step. → add the counter pill + arc.
2. **Task-card border is flat gold, not foil.** Canon: «foil edge filled on Done». Code: static `3px solid #ffc83d` (CSS 1969). → animated foil sheen on done.
3. Trainer-card frame: canon shows a faint gold-tinged matte frame; code border is dark berry #6b2a48 (CSS 1975) — tint check on device.

## 12. `09.46.52.jpg` — TOOLBOX + STACK BUILDER

Render: `toolboxStageStep()` app.js:7744–7953 · `stackBuilder()` app.js:8117+ .

Structurally matches canon per inventory: help door, domain filter chips w/ selected state, tool cards w/ source line + mastery bead strips + verbs + expandable science box + pin; stack builder hero card w/ element chain + color strip + duration doors + green Play; pack cards w/ battery strips; ghost «Собери сам». RU strings come from the display-layer translator — EN sources are NON-DRIFT. Remaining visual drift to verify on-screen:
1. **Hero tool card gold-foil streak** («Чёрное солнце» wears a horizontal gold foil band in canon). VERIFY; if flat → add lattice/foil band.
2. **Selected duration door striped-pink** (canon 10-мин door = pink stripes). VERIFY the `.on` state uses stripe not flat pink.
3. **Lived pack shine**: canon 20-мин pack = striped + gold check. VERIFY.

## 13. `09.47.00.jpg` — SESSION PLAYER + PM MIRROR

Render: `timelinePlayer()` app.js:7953–8117 · `pmBeatMirror()` app.js:4446–4779.

Player structurally matches (beat pips, element-tinted disc, catch line + подмечено counter, scrub w/ cue ticks + silence tail + −remaining, ±15 transport, chrome fade). PM mirror drift:
1. **No «ВЕЧЕРНИЙ РИТУАЛ» eyebrow.** Canon: pink caps eyebrow + 4 step pips top-right, current pip GOLD. Code: eyebrow absent; current step pip is lavender, not gold. → pmStageStep/pmBeatMirror header (app.js:4446+).
2. **Mood tiles lack per-mood colored borders.** Canon: Туман/Тяжесть blue, Норм teal, Ясно gold (selected w/ ✓), Сияние pink — each an outlined tile w/ icon + label. Code: uniform borders. → per-mood border+icon color map.
3. Mirror rows: canon done chips are STRIPED (orange Утро силы, green Спортзал), drift chip muted w/ ДРЕЙФ tag, missed dashed w/ МИМО, now-row «сейчас · 22:40» pink. Inventory says structure exists — VERIFY stripes on done chips specifically (flat = drift under the pattern law).

## 14. `09.47.04.jpg` — YOU TAB («Ты») + BENTO AT REST

Render: `settingsSheet()`/youStats app.js:3254–3393 · `bentoPicker()` app.js:7138+ · CSS index.html:2069+.

You-tab verified MATCH: rank hero card (compass pink badge 3273, «Исследователь» 3274, GOLD facts line `.you-tr-facts` #ffc41f 3275/CSS 2062, next-evolution row + progress bar 3278–3280), rooms Профиль/Звук/Данные w/ correct icon colors (pink/orange/green, 3289–3292), Данные row snapshot PIPS ✓ (`.you-rpip` CSS 2077), **«Я отдыхаю» IS striped teal** ✓ (#2ab8c4 + white diagonal stripe, CSS 2079–2080) w/ moon + knob toggle, dashed «Продвинутое» door ✓ (3296–3306, CSS 2093). Drift:
1. **No X close** — settingsSheet uses the standard Done button (3307); canon shows a circle-X top-right. Minor.
2. **Bottom dock: no dot-pill morph.** Canon: at rest a compact pill (calendar icon + 2 dots) that BLOOMS into Планер/Путь/Игра on touch and folds back after 2.5s. Code: standard 3-tab nav; scroll-collapse hides labels/tabs to a corner icon (CSS 2100–2119), no dots representation, no touch-bloom timing. → the canon morphing dock is unbuilt.
Bento at rest: pinned row ✓ (7185–7188), sideways-scroll rows = natural half-cut peek ✓, soft muted tiles ✓ (7165). Drift:
3. **Search never collapses.** Canon: search = bare icon in the head until tapped. Code: full search bar always rendered (7183, 7287). → collapse-to-icon.
4. **«вся библиотека · 6 сфер» subline ABSENT** (no such string in bento code).
5. **Overview grouping**: canon shows domain rows (ЗАКРЕПЛЁННЫЕ/ТЕЛО/УМ…); code overview groups by SUPERCAT tabs (Energy/Work/Love/Hobbies/Other, 7298) with filled tab chips, no underlines. Composition drift in the non-plan bento.

## 15. `09.47.09.jpg` — BENTO SELECTED STATE

Render: `actChip` app.js:7163–7171 · CSS index.html:1107–1113, 1173.

1. **Selected chip ≠ canon.** Canon: chip fills with the domain STRIPED pattern (purple stripes for Медитация), 3px ink border, white 800 text + ✓. Code: `.bchip.sel` = gold halo ring `0 0 0 3px #ffe3a0` + scale(1.05) (CSS 1110); only the plan-day scoped picker adds a faint white stripe overlay (`.pd-lit`, CSS 1173) — not the domain-color chunky stripe. → selected = `habStripe(domain)`-style fill + ink border everywhere; drop the gold halo (gold = earned, not picked).
2. **220ms recognition collapse** («выбор признан — меню сворачивается к причине») — the bento stays open multi-select in plan-day (deliberate); for single-pick contexts VERIFY the quick-collapse exists.
3. Unselected chips ✓ match (muted dark tile + colored icon, 7165).

---

# TOP-15 — ranked by visual impact

1. **Edge inspector ships dark** — the canon block-editor never appears; taps open the legacy sheet. Flip `window.__edgeInsp` default. (app.js:6616, 9269)
2. **Done/earned timeline blocks lack the gold ring** — earned = gold law broken on the most-seen surface. (app.js:6648)
3. **Bento/plan-day selected chip = gold halo, not domain-striped fill** — selection language wrong app-wide. (CSS index.html:1110, 1173; app.js:7164)
4. **Off-plan cockpit missing the striped «Составить план» door** (+ dashed ring not domain-tinted). (app.js:4837–4844; CSS 1687; app.js:3888)
5. **Day crown-band missing on the timeline** — «ЧТ · 2 июля 👑 ▮▮▮▮▮» replaced by a bare label; done-chip display:none'd. (index.html:2191–2194; app.js:3458)
6. **Habit path: no zigzag, no hero-scale/glow current stone** — reads as a flat column, not a journey. (app.js:7095–7108; CSS 1079–1082)
7. **PM mirror: no ВЕЧЕРНИЙ РИТУАЛ eyebrow, lavender step pip (not gold), uncolored mood tiles.** (app.js:4446+)
8. **Binder cards: no flavor-tag subtitles + no newest-card prism glow/sparkle** — the reward surface loses its ceremony. (app.js:6054+, BADGES config)
9. **Hour gutter 12h instead of canon 24h.** (app.js:6588–6590)
10. **Journey: no Закрыть-день moon node; seal lines only on first completion.** (drawJourney app.js:2292+)
11. **Cockpit live timer 44px vs canon hero ~58px.** (index.html:1666)
12. **Now-line over-chromed** — canon bare hairline + end dots; code adds icon circle, glow, NOW readout. (app.js:6592)
13. **Missed-ghost lacks the ↩ undo affordance** (text sub instead). (app.js:6685)
14. **Month grid: no dashed «в пути» cell, no return-halo day, crown border too heavy.** (app.js:6946+)
15. **Plan-day missing its hero question + beat tabs** — «Что двинет работу вперёд?» heading and the Энергия/Работа/Любовь/Остальное tab strip don't exist; beats run as bare sequential pickers. (app.js:7419–7455)

Near-misses (16–18): off-plan docked sheet chips/footer (app.js:3893–3897) · erase card fires on first tap instead of arming (app.js:1907–1918) · first-win header sparkle counter + foil-on-done (app.js:5002–5014).

SUPERSEDE-arbitration list (David decides, same-day device verdicts vs canon): Стоп-vs-Готово primary (app.js:4813), Перенести removed (4812), gold-vs-white converter dot (index.html:1673), month legend removed, off-plan sheet footer removed.
