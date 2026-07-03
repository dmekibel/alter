# VISUAL 1:1 AUDIT — rendered app vs canon JPGs (2026-07-04)

Method: preview @390×844, v871, Russian locale, test-day seed. Every surface driven live and screenshotted; diffs classified DRIFT (app must change) / EVOLVED (postdates ref via David's device verdicts) / DRIFT? (unsure). Supersedes the code-level AUDIT-1TO1-DRIFT-2026-07-03.md where they disagree — this one is real pixels.
Console: **zero JS errors/warnings across the whole session.**
Gesture feel NOT verified (preview lies about touch) — layout/composition only.

---

## 2026-07-03 09.45.33 — Cockpit idle «Что сейчас?»
**Verdict: STRONG MATCH** (best surface in the app).
- MATCH: pink play disc, «Что сейчас?», next-chip w/ pink edge + pink time («Evening walk · сейчас»), pink «Отследить сейчас», blue-striped «План + трек следующего» with name badge, ghost «Спланировать день», bottom sheet «X — сколько?» chips + «без времени — просто трек» + «с планом очков больше».
- DRIFT (minor): no default-selected duration chip (ref: 30м pre-selected pink with calendar icon).
- NOT TESTED: empty-morning variant (time-of-day line «чистый лист…» + «ВЧЕРА СЕЙЧАС» echo chips w/ ti-history mark) — needs an empty day; verify on device.

## 2026-07-03 09.45.59 — Cockpit running (on-plan / unplanned)
**Verdict: on-plan good, unplanned has real drift.**
- MATCH: disc striped in domain color inside progress ring; big timer; status grammar «по плану · осталось N мин · конец HH:MM» and «N мин затрекано · план удвоит очки» — exact.
- EVOLVED (per David's later verdicts): Стоп/Перерыв doors replace Готово-засчитать/Пауза/Перенести; «далее: …» next-up line; top chrome 🔥×N + ⚡N; «продлить?» tray during on-plan.
- DRIFT: **unplanned state is missing the primary blue-striped «Составить план» door** — the whole point of «план удвоит очки»; instead Стоп (a ref ghost) is promoted to the big solid primary. Ref hierarchy: Составить план (primary) → Пауза/Стоп (ghosts).
- DRIFT (minor): name-chip lost its domain icon (ref «🧠 Глубокая работа ⇄», app «Кофе ⇄»); converter dot is gold (ref: white, breathing); unplanned dashed ring is blue regardless of domain (ref: domain-tinted dashes — orange for Чтение).

## 2026-07-03 09.46.06 — Planner day + edge inspector
**Verdict: blocks match; header/locale and the inspector drift hard.**
- MATCH: lived blocks = gold ring + stripes + icon; skipped = dashed ghost + ↩; now-line pink; отбой marker; night sky at late hours.
- DRIFT (locale): week strip letters **S M T W T F S** (ref: П В С Ч П С В, Monday start); now-line label «СЕЙЧАС 6:41pm» — 12h en-US.
- DRIFT: no per-day activity bars under the week-strip dates (ref: yellow/pink bars, dotted quiet days); day-summary crown line «· ЧТ · 2 июля 👑 ▮▮▮▮▮ ·» absent (replaced by ПЛАН/РЕАЛЬНОСТЬ lane headers — the dual-lane itself looks EVOLVED, but the crown/charge summary died with it).
- DRIFT (major): **tap-block editor is a full-width bottom sheet, not the ref edge inspector.** Ref: panel rises beside the block, day stays live, НАЧАЛО −/+, ДЛИНА **30/60/90 chips** resizing live, **bare color dots re-type the domain**, «Ещё >» ghost, «удалить» text. App: full sheet covers the day, duration **slider**, no color dots, no «Ещё >», trash icon button, start-time shows **«7:42pm»** (en-US 12h), plus «45m · 7:42pm–8:27pm». Надо/Стоит/Можно triage + шаги fold = EVOLVED additions.
- DRIFT? X close buttons on every block (ref has none).

## 2026-07-03 09.46.10 — Plan-day flow + finish moment
**Verdict: skeleton matches, voice/copy drift.**
- MATCH: 4 domain tabs w/ progress bars (Энергия/Работа/Любовь/Остальное); «Ты сегодня —» vibe card; «ДЕНЬ СОБИРАЕТСЯ» mini-timeline w/ 08/12/16/20/24 + block chips + now-line.
- DRIFT: vibe word untranslated — **«Ты сегодня — calm»** (ref: «Сосредоточенный»); CTA **«→ Next: Work»** English (ref: «Дальше →» + «пропустить» beneath).
- DRIFT: missing per-domain question header «Что двинет работу вперёд?» + «одно-два дела — уже день»; missing «ДАВНО СОБИРАЛСЯ» section. Chips are all solid-bright slabs (ДВИЖЕНИЕ/ПИТАНИЕ striped section cards) — ref: dark outline tiles, only the SELECTED chip goes striped-solid w/ check.
- NOT TESTED: finish moment (5-block cascade, guardian seal line, gold only on the lived block).

## 2026-07-03 09.46.17 — Tracker week + month
**Verdict: grammar/summary lines match; locale + bar rendering drift.**
- MATCH: «N дней сияли · N 👑 · лучшая серия — N» / «N жилых дней · N 👑 · серия N» — exact; hints «тап — день вырастает из своей клетки» / «тап — неделя складывается в день» — exact; streak flame line under week; today cell pink + glow; return-sparkle badge on a day cell.
- EVOLVED: no legend on month (David removed it); stacked continuous months.
- DRIFT (locale): month headers **«JULY 2026», «AUGUST 2026»** — English; weekday row starts **Sunday** (В П В С Ч П С) — ref/RU convention starts Monday; **«2 дней сияли»** — declension bug (should be «2 дня»).
- DRIFT?: week columns render blocks as tiny stacked pills; ref shows chunky duration-proportional striped vertical bars filling the column. Test data is thin — re-check on David's real data before fixing.
- DRIFT (minor): scope switcher is 3 icon buttons top-left; ref = text segment [День|Неделя|Месяц] + month name right.

## 2026-07-03 09.46.21 — Journey «Твой путь» + return
**Verdict: mixed — done nodes match, future/active card drift; worlds & gates EVOLVED (no ref).**
- MATCH: done nodes = solid + green check badge + green label + gold duration (Завтрак 30м ✓, Тренировка 45м ✓); active node = big striped glowing circle + question card below.
- DRIFT: pending/future nodes are **fully solid-filled** (Прибраться, Глубокий фокус) — ref future = outline-ghost circles (Чтение, Закрыть день); СТАРТ button lavender (ref: blue); **«не сейчас» ghost missing** under СТАРТ; guardian seal line («✦ утро было тяжёлым — начнём с главного») absent.
- DRIFT?: header pips+gift row replaced by a plain progress bar; chapter card («ГЛАВА 1 · ОТКРЫТА» orange banner at path bottom) — ref chapter card sits at top with ●●○ 2-из-3 dots + art thumbnail.
- EVOLVED: briefcase (toolbox) header button; live-timer dock chip.
- NOT TESTED: return state (пауза · серии сохранены, ПРИЗМА reward card, prism-mint fired from the gap stone).

## 2026-07-03 09.46.27 — Квесты (quest cards + WOOP back)
**Verdict: NOT FOUND in the rendered app.** No Квесты surface reachable; nothing in DOM matches quest cards / foil edge / «Поставить сессию в день» / «Отпущенные». Biggest canon-coverage gap #1.

## 2026-07-03 09.46.32 — Привычки (vertical thread path)
**Verdict: NOT FOUND as designed.** «Привычки» exists only as a hidden nav label (`nb-l`, invisible tab) and «Стопки привычек» in the planner ··· menu — the ref's vertical habit path (fire-tier thread ×23/огонь стал синим, per-habit rings, «И ЕСТЬ навык» comeback line, нить legend) is not reachable. Canon-coverage gap #2.

## 2026-07-03 09.46.37 — Garden night island + Коллекция binder
**Verdict: binder STRONG MATCH; garden replaced.**
- Binder MATCH: «Коллекция» + X, gold «2 / 24 собрано» chip, МЕТКИ pink-striped selected / ТРОФЕИ dark, earned card = full-art foil (Огонь/ВСПЫШКА gold sunburst — excellent), unearned = dark outline icon + tier label + 4 pips, Король недели w/ progress.
- Garden: the dark night-island with glowing plant pips + «выросло из настоящего дня» is **gone**; the game pane is now a hand-drawn parchment fairy island (house/chest/character) with EN HUD text «968 Spark · ship 1 real thing to grow your island». EVOLVED? (world postdates ref) — but flag two things: the parchment palette clashes with the app's dark berry canon, and the HUD line is untranslated.

## 2026-07-03 09.46.42 — Title screen + load/erase cards
**Verdict: MATCH.** Halo+spark mark, ALTER, «🔥 день N вместе», green «▶ Вернуться · <activity>», Загрузить/Начать заново, vNNN, globe top-right — all present.
- DRIFT? (tiny): logo has extra blue + yellow satellite sparks; ref = single pink spark + gold ring (with glossy highlight).
- NOT TESTED: load-preview night card («Восстановить») and erase confirm w/ 4s un-arm drain.

## 2026-07-03 09.46.46 — First win «+18 Искр» + first trainer card
**Verdict: NOT TESTED** (deep in onboarding flow past a real task; onboarding steps 1-2 that were checked are clean RU and on-palette). Verify on device during next fresh-user run.

## 2026-07-03 09.46.52 — Toolbox library + Собери сессию
**Verdict: good match; texture + selection drift.**
- Library MATCH: red SOS card «Что-то конкретное кричит — помоги выбрать >», card anatomy (name / «Стутц — инструмент N» / when-line / battery strip + track label + chevron), expanded description box.
- EVOLVED: one-door hub (ПРЯМО СЕЙЧАС hero + fold rows Все инструменты/Собери сессию/Уроки/Заточи ум) replaces the ref's standalone screen w/ back arrow (F1, David's pick per code comment).
- DRIFT: selected category chip = gold outline + chevron (ref: solid warm fill + check «Чувства ✓»); pin icon = big solid purple (ref: thin outline); category chips lost their per-domain colored outlines; «инструмент N» vs ref «Приём N».
- Builder MATCH: pink-outline hero «ВСЯ ПРАКТИКА / Полный стек», sequence line, 5-color battery, 10/20/45 chips, green Играть, «СКОЛЬКО У ТЕБЯ ЕСТЬ» packs w/ battery strips, 20-мин pack gold ring+check, dashed «Собери сам».
- DRIFT (minor): selected 10-мин chip solid pink (ref: striped); lived 20-мин pack not striped-foil (ref: shines in stripes); Утренний заряд/Вечерний покой presets = EVOLVED additions.
- BUG (behavior): the «Все инструменты» fold state (`sb.dataset.tbopen`) is lost on every stage re-render — the library silently closes itself (full-DOM-rebuild landmine).

## 2026-07-03 09.47.00 — MEDITATION PLAYER + PM ritual  ⚠ David's flagged surface
**Player verdict: composition close; chrome/i18n/hit-testing broken.**
- MATCH: session-map segments row, element-tinted orb, scrub bar with cue ticks + striped **silence tail** + «☾ тишина в конце · 0:20», ↺15 / pause / ↻15 transport, catch instruction present.
- DRIFT/BUG (the in-player menu):
  1. **The ⚙ volume panel is ~90% ENGLISH** in the RU app: "adjust anytime — even while it plays", "Voice", "Background", "Background sound", "Peaceful/Mysterious", "App background music / warm, slow chords while you browse" (app.js:7937, 7944, 7946, ~7947-50, 7957). Only «Звук»/«Выкл»/«Готово» are Russian.
  2. **The cog is effectively unreachable while playing**: `.gp-playing .gp-cog{opacity:0}` (index.html:697) with no tap-to-reveal, AND when the player is launched from the cockpit stage, `#tfBackdrop` (z-97, pointer-events:auto, top 200px — index.html:1519-1520) sits ABOVE `#breatheOv` (z-90, index.html:653) — taps on the cog/закрыть strip hit the backdrop (which closes the stage) instead of the player.
  3. Catch line renders LEFT-ALIGNED flush to x=0 (ref: centered with margins); catch-counter pips «подмечено · N» not shown; the catch hint overlaps the «тишина в конце» line (text collision).
  4. Top chrome: no title («ЗАРЯД ТИШИНЫ · 10 МИН»), no X left — only «закрыть» pill; ref top row = X · title · ⚙.
  5. Locale leaks on the way in: «STEP 1 ИЗ 5», «end» pill, «cycle 1 / 3».
**PM ritual verdict: structure evolved to a wizard; two hard drifts.**
- MATCH: «ВЕЧЕРНИЙ РИТУАЛ» + gold progress pips, «Вот день, который ты прожил», «не оценка — отражение», МИМО dashed rows.
- DRIFT: reflection chips are planner-scale bright striped slabs (ref: slim muted rows w/ ДРЕЙФ/МИМО right labels, ~40px); no «сейчас · HH:MM» now line; no «N из M прожито — ты держал линию…» summary; green Продолжить/Закрыть instead of pink «К пере-сборке дня →».
- **BUG (worst visual in the app): the taste picker renders raw icon class names as text** — buttons literally show «ti-cloud-fog / ti-cloud / ti-cloud-sun / ti-sun / ti-sparkles». Cause: `f.textContent = m.e` at **app.js:4102 and app.js:4545** (m.e = tabler class; must be `innerHTML='<i class="ti '+m.e+'"></i>'`). Also missing the ref's RU labels (Туман/Тяжесть/Норм/Ясно/Сияние — titles are EN Foggy/Heavy/…) and per-mood jewel outlines (colors already sit unused in MOODS at app.js:5884).
- «Перепиши историю» step: «Read · **12:33pm**» — 12h en-US again.

## 2026-07-03 09.47.04 — «Ты» menu + planning bento
**«Ты» sheet verdict: STRONG MATCH.** Rank card (Исследователь / С 3 ИЮЛЯ · 16 Ч ПРОЖИТО / след. эволюция — ранг II · ещё 234 ч / bar), Профиль «слово · подъём 07:00 · язык», Звук «голос · фоны · награды», Данные «снимок · 12 дн. назад» + pips, Продвинутое dashed — all match.
- DRIFT: «Я отдыхаю» lost its **teal striped card** treatment (now plain dark) and has a text run-on «Я отдыхаюна паузе — серии целы» (missing space/line-break).
- DRIFT (minor): extra big pink «Готово» button (ref: X only); ref's collapsible nav pill (📅 ·· → expands, folds after 2.5s) vs app's permanent 3-tab bar — DRIFT? (three-pane spine may supersede).
**Bento verdict** («Чем ты занят?» picker = closest live analog): peek-cut rows ✓ (half-cut chips as scroll hint). DRIFT: search is a full always-open field (ref: collapses to bare icon); recents + all tiles solid-bright (ref rest state: soft muted outline tiles); sections are giant striped domain slabs.

## 2026-07-03 09.47.09 — Bento selected state
**Verdict: NOT DIRECTLY TESTED** (selection micro-state). The ref's law — selected chip goes striped-solid + check, «220 мс: выбор признан — меню сворачивается к причине» — unverified; given the picker's tiles are already all-solid at rest (above), the selected-vs-rest contrast the ref depends on cannot currently exist. DRIFT by construction until the rest state is muted.

---

# TOP-10 visually-worst drift (ranked, with fix anchors)

1. **PM taste picker shows raw «ti-cloud-fog» text instead of icons** — app.js:4102 + app.js:4545: `f.textContent = m.e` → `f.innerHTML = '<i class="ti '+m.e+'"></i>'`; add RU labels (Туман/Тяжесть/Норм/Ясно/Сияние) + per-mood jewel outline from `MOODS[i].c` (app.js:5884, colors already defined).
2. **In-player ⚙ sound panel is English** (the surface David flagged) — wrap the literals at app.js:7937/7944/7946/7947-50/7957 in `tr()` and add I18N.ru entries; RU-label the Peaceful/Mysterious chips.
3. **Player top strip untappable from the cockpit stage** — `#tfBackdrop` z-97 (index.html:1519) covers `#breatheOv` z-90 (index.html:653): raise the player above 97 (e.g. z-98) or disable the backdrop while a gp-ov is open; add tap-to-reveal for the dissolved chrome (index.html:697 fades cog to opacity:0 with no way back except pause).
4. **12-hour en-US times across the app** — block editor «7:42pm», PM «Read · 12:33pm», now-line «СЕЙЧАС 6:41pm»: switch every time formatter to 24h (locale-aware); grep for `toLocaleTimeString`/am-pm concatenations.
5. **Unplanned cockpit lost the «Составить план» primary door** — restore blue-striped primary + demote Стоп to ghost in the running-unplanned door stack (cockpit stage doors builder; ref 09.45.59-right).
6. **Квесты + Привычки-path surfaces missing entirely** (refs 09.46.27 / 09.46.32) — largest canon coverage gap; the hidden «Привычки» nav tab (`nb-l`) suggests a half-wired pane.
7. **Block editor ≠ edge inspector** — ref 09.46.06-right: side panel with НАЧАЛО −/+, ДЛИНА 30/60/90 chips, bare color dots (domain re-type), «Ещё >», «удалить» text; app has full bottom sheet + slider + trash icon (see `DEV.edgeInsp` — an inspector already exists in the harness; wire it as the tap default).
8. **Planner header locale block** — EN day letters S-M-T-W-T-F-S + Sunday start + «JULY 2026» month headers + «2 дней» declension; restore П-В-С-Ч-П-С-В Monday start, «Июль 2026», and the crown day-summary line «· ЧТ · 2 июля 👑 ▮▮▮▮▮ ·» + per-day activity bars under dates.
9. **Plan-day flow copy** — «Ты сегодня — calm» (translate vibe words) + «→ Next: Work» (→ «Дальше →»); restore the per-domain question «Что двинет работу вперёд? / одно-два дела — уже день»; mute the unselected library tiles (rest = dark outline; selected = striped solid + check) — same fix covers the bento law (ref 09.47.09).
10. **PM reflection + journey polish cluster** — PM: slim muted timeline rows + «сейчас · HH:MM» + «N из M прожито» summary + pink «К пере-сборке дня» CTA; Journey: future nodes as outline ghosts, «не сейчас» under СТАРТ, guardian seal line between nodes.

**EVOLVED (do NOT "fix" back):** Стоп/Перерыв doors, продлить tray, cockpit top chrome, catch-up doors (Отследить/Уже сделал/Не моё), one-door toolbox hub, builder presets, month view without legend, stacked months, dual-lane ПЛАН/РЕАЛЬНОСТЬ (verify with David), journey worlds/gates, parchment game island (flag the palette clash + EN HUD line though).

**Also noted (behavioral, preview-verified):** «Все инструменты» fold self-closes on every re-render (dataset.tbopen lost in rebuild — app.js:7792); zero console errors all session.
