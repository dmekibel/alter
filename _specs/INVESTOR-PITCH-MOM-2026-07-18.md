# INVESTOR PITCH: MOM — V5 MASTER SPEC (the only current build target)
**Date:** 2026-07-18 (late night, Fable gameplan) · **Supersedes:** v2/v3/v4 layers entirely (this file was rewritten clean; history lives in git-less memory + chat).
**Deliverable:** ONE Russian PDF for mom, ~26 pages, phone-first, built by editing `_pitch/mama.html` (KEEP the CSS system) + a NEW raster-PDF pipeline. Investor deck stays deferred.
**Register laws:** no em/en-dashes, no «!», premium calm, mom-warm, NO legal/agreement/partnership language, NO «мне нужен твой совет» line. Language RU.

---

## PART 0: WHY V5 (David's v4 critique, every point mapped)
1. PDF broke on mobile (big square on cover, colored squares over timeline dots) → PART 1 pipeline fix.
2. «Одно вместо шести» oversimplifies; lost the soul/nuance we built with dad's feedback → product section rebuilt on FOUNDATION-PITCH locked language (PART 3, slides 2-6): the vision, the cleverness, addicted-to-life, not overwhelming, adaptive.
3. «Как проходит день» random aspect → replaced by the GENIUS slides (design cleverness, not a day tour).
4. Market too surface → THREE market slides with named-source research (sizes, demographics, spend, January effect) from tonight's research run (PART 2 numbers library).
5. «Почему мы» doesn't hit core → rebuilt from the white-space research (2% evidence stat, zero-independence-apps stat, never-punishes, adaptive).
6. Free/paid good but needs more granularity + icons + more color → expanded two slides, icon-per-line.
7. Three doors needs real business depth: who chooses which, why, and the math → doors slide + «двери в цифрах» slide with counted models.
8. Three scenarios vague → funnel-math scenarios built on RevenueCat category benchmarks (highest-confidence source).
9. Mom may not know Black Friday/January wave → plain-words explanations + Sensor Tower January record stat.
10. Videos = the marketing core, needs deep gameplan incl. the YouTube (Field Guide) context and cheaper-video volume strategy → two dedicated slides.
11. Fuse slide read as «ads don't work» → REFRAMED positive: the viral-proves-then-paid-scales system; Finch proof that paid ads work in this category; CPA math showing it can pay.
12. Tiers: much more thorough per level → FIVE tier slides, each with 4 blocks (buys / delivers / speed effect / scenario+long-term effect).
13. Risks: preparedness through research, not fear → research-cited pairs.
14. More color in text overall → design rule: every paragraph ≥2 tinted spans; row descriptions get tinted keywords.

---

## PART 1: PIPELINE FIX (the mobile-PDF squares)
**Root cause:** `filter: drop-shadow(...)` (cover mark, tier icons) and blurred/spread `box-shadow` glows (timeline dots, rec-ring) export as PDF transparency objects that iOS Quartz renders as opaque squares. Chrome-desktop renders them fine, hence the mismatch.

**Fix A (hygiene, do regardless):** in `_pitch/mama.html` remove ALL `filter:` uses and ALL box-shadows with blur>0. Allowed: hard offset shadows with 0 blur (the game-piece `--sh`). Replace glows: cover mark gets a `<div>` behind it with `background: radial-gradient(closest-side, rgba(255,95,160,.45), transparent 70%)` (gradients rasterize safely); timeline dots become solid dots with thick light borders (no halo); tier icons colored, no drop-shadow; rec-ring = solid 3px border only.

**Fix B (the guarantee): raster-PDF pipeline.** Deliver a PDF of per-page PNG images: pixel-identical on every device.
1. Add to mama.html head script: `const p=new URLSearchParams(location.search).get('only'); if(p) addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.slide').forEach((s,i)=>{ if(i!== +p-1) s.style.display='none' })});`
2. For each slide N: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=431,877 --virtual-time-budget=8000 --screenshot=_pitch/pages/mama-NN.png "file://$PWD/_pitch/mama.html?only=N"`
3. Assemble: `python3 -m pip install --user pillow` if needed, then Pillow: open PNGs in order, convert("RGB"), `first.save("_pitch/mama.pdf", save_all=True, append_images=rest, resolution=192.0)` (862px wide at 192dpi ≈ 114mm page).
4. Verify: page count = slide count; Read `mama-01.png` and the calendar page PNG to eyeball (this catches the squares class of bug BEFORE mom does); file size sanity (<25MB).

---

## PART 2: NUMBERS LIBRARY (research 2026-07-18, cite source names in deck fine print)

**Market size:** mental-wellness apps $8.9 млрд (2025) → ~$17.5 млрд к 2030, рост ~15%/год (Grand View Research; cross-firm range to $22.7B). Self-improvement market overall ~$46 млрд (2024, directional). Health&Fitness apps: 3.6 млрд скачиваний за год; категория идёт к $4 млрд+ годовых покупок (Sensor Tower).
**Demographics:** Calm: ~70% женщины, средний возраст 32. Активные пользователи медитационных приложений: ~65% женщины. 18-24: 21% пользуются, 35+: 9% (Statista). Профиль: образованные, платёжеспособные (JMIR: ~72% с высшим, треть семей $100k+). СДВГ: 15,5 млн взрослых только в США, 6%, больше половины узнали диагноз во взрослом возрасте, треть без лечения (CDC 2024: strongest stat). Новогодние обещания: только ~9% доводят до конца (commonly-cited, hedge as «по опросам»).
**January effect:** январь 2025 = рекорд категории за всю историю: $385 млн покупок за месяц (+10% г/г); ~25 млн скачиваний фитнес-приложений за один январь (Sensor Tower/Statista).
**Conversion (RevenueCat State of Subscription Apps 2026, primary):** Health&Fitness = САМАЯ конвертирующая категория: медиана установка→оплата 2,9%, верхний квартиль 6,2%+, лучшие 12%. Год-1 выручка на платящего: медиана ~$36.
**Duolingo (SEC):** платят ~9% активных; 12,2 млн подписчиков; DAU 56,5 млн.
**Calm/Headspace decline:** Calm ~$210 млн (-24% г/г), ~3,5 млн подписчиков (-500 тыс.); Headspace ~$140 млн (-300 тыс. подписчиков) (Business of Apps estimates, hedge «по оценкам»).
**Finch:** ~$30 млн/год, ~5 млн скачиваний, БЕЗ инвесторов; премиум = ТОЛЬКО косметика; масштабируется платной рекламой Meta/TikTok (proof paid ads work here).
**Lifetime pricing rule:** индустрия: пожизненный ≈ 14-16 месячных цен. Наша подписка ~$4-6/мес → правило даёт $60-90. Лестница $49-99 сидит ровно в правиле (Freemius guidance, directional).
**Ads:** iOS CPI ~$5.84; wellness CPA ~$43 медиана (directional vendor benchmarks) → при чеке $49-99 реклама СХОДИТСЯ только с сильным роликом → the winner-scaling system.
**White space (journal-grade, from teardown):** только ~2% wellness-приложений имеют научную базу (PMC); обзор literature нашёл НОЛЬ приложений, спроектированных делать привычки твоими собственными (Frontiers in Psychiatry, 2025); 76% подписочных приложений используют тёмные приёмы (FTC sweep).
**Approved product language (FOUNDATION-PITCH, translate faithfully):** «Планер, трекер привычек и тренер ментальной формы: в одном» · «Планеры организуют день. ALTER тренирует того, кто его живёт» (LOCKED positioning) · «Duolingo сделал игру, которая учит языку. ALTER: такая же игра, которая учит вести собственный день» · «День заполняется, пока ты его живёшь» · core statement: техники известны и бесплатны; не было СИСТЕМЫ, которая ведёт по ним каждый день · autopilot ladder: одна привычка до автопилота, потом следующая, лестница на год вглубь · никогда не продавать «будешь пользоваться меньше».

---

## PART 3: THE DECK, SLIDE BY SLIDE (~26; verbatim RU copy; Opus typesets, does not rewrite)

*(Design note global: headers multicolor; every .p gets ≥2 tinted spans; fine-print source line (`.src`, 12px dim) on research slides: «Grand View Research · Sensor Tower · RevenueCat · CDC» etc.)*

**S1 COVER** (as built; replace filter glow per PART 1; keep stars/mark/wordmark/«Как это станет бизнесом»).

**РАЗДЕЛ ПРОДУКТ**

**S2 ЧТО ЭТО**
> eyebrow: Что это · H: Планер, трекер привычек и <pk>тренер ментальной формы</pk>: в одном
> (6 chips stay: планер · привычки · медитации · дыхание · растяжка · дневник)
> p: Ты планируешь день, живёшь его, и приложение превращает прожитое в <bl>видимый прогресс</bl>, а вечером помогает спланировать <gd>завтра лучше</gd>.
> lead: Планеры организуют день. <pk>ALTER тренирует того, кто его живёт.</pk>

**S3 СИСТЕМА, КОТОРОЙ НЕ БЫЛО**
> eyebrow: Идея · H: Система, которой <gd>не было</gd>
> p: Все знают, ЧТО делать: планировать, дышать, спать, вести привычки. Техники известны и <gr>бесплатны</gr>. Трудно другое: <pk>организовать себя</pk> и делать это каждый день.
> p: Не хватало <b>системы, которая ведёт тебя</b> по этим техникам: день за днём, за руку.
> lead: Duolingo сделал игру, которая учит языку. <gd>ALTER: такая же игра, которая учит вести собственную жизнь.</gd>

**S4 ГЕНИАЛЬНОСТЬ 1: ДЕНЬ КАК ИГРА**
> eyebrow: Что в нём умного · 1 из 3 · H: День <gd>заполняется</gd>, пока ты его живёшь
> rows: (gd, ti-bolt) Сделал, что запланировал: <b>день заряжается золотом</b> · выполненное превращается в видимую силу, как в игре.
> (pk, ti-device-gamepad-2) Залипаешь не в телефон · приложения борются за твоё внимание. ALTER устроен наоборот: <pk>залипаешь в собственную жизнь</pk>. Очки даются за прожитый день, не за сидение в экране.
> (pu, ti-moon) Вечером круг замыкается · день превращается в план получше на завтра. Каждый день <pu>умнее предыдущего</pu>.

**S5 ГЕНИАЛЬНОСТЬ 2: НЕ ДАВИТ И ПОДСТРАИВАЕТСЯ**
> eyebrow: Что в нём умного · 2 из 3 · H: Не давит и <gr>подстраивается</gr>
> rows: (pk, ti-heart) Никогда не наказывает · пропустил день: ничего не ломается. Возвращение: <pk>самый праздничный момент</pk> в приложении.
> (gr, ti-adjustments) Подстраивается под человека · уставшему даёт передышку, собранному даёт структуру. <gr>Четыре разных человека</gr> получают четыре разных приложения.
> (bl, ti-seedling) Не перегружает · начинает с малого: одна привычка, один инструмент. Растёт вместе с тобой, а не сваливает всё сразу.

**S6 ГЕНИАЛЬНОСТЬ 3: ВЕДЁТ И НЕ БРОСАЕТ**
> eyebrow: Что в нём умного · 3 из 3 · H: Ведёт и <pu>не бросает</pu>
> rows: (gd, ti-compass) Хранитель · учит в момент нужды: <gd>60 секунд дыхания</gd>, когда накрыло, а не курс на потом.
> (bl, ti-stairs-up) Лестница на год · тренирует <b>одну привычку</b>, пока она не работает сама, и берётся за следующую: утро, завершение дня, дыхание, фокус.
> (pk, ti-infinity) Никогда не заканчивается · привычки становятся твоими, а у приложения всегда есть <pk>следующая ступень</pk>.

**РАЗДЕЛ РЫНОК**

**S7 ПРОБЛЕМА**
> eyebrow: Проблема · H: 91%, которым <pk>не хватает системы</pk>
> statboxes: 9% · доводят новогодние обещания до конца || 15,5 млн · взрослых с СДВГ только в США
> p: Люди <b>хотят</b> изменить жизнь и знают, что делать. Но по опросам только <pk>девять из ста</pk> доводят решения до конца: не хватает не знаний, а системы.
> p: А существующие приложения либо <pk>стыдят</pk> за пропуски, либо дают контент <bl>без связи с твоим днём</bl>.
> src: CDC 2024 · опросы о новогодних обещаниях

**S8 РЫНОК: РАЗМЕР**
> eyebrow: Рынок · H: <gd>$17+ млрд</gd> к 2030
> statboxes: $8,9 млрд · рынок wellness-приложений сейчас || ~15% · рост в год
> p: Приложения ментального здоровья: <gd>$8,9 млрд в год</gd> сегодня, к 2030 почти <b>вдвое</b>. Весь рынок самосовершенствования: около <bl>$46 млрд</bl>.
> p: За один год люди скачали <b>3,6 млрд</b> таких приложений.
> src: Grand View Research · Sensor Tower

**S9 РЫНОК: КТО ПЛАТИТ**
> eyebrow: Рынок · H: Кто эти <bl>люди</bl>
> rows: (pk, ti-user-heart) Женщины ~70% · средний возраст 32. Образованные и платёжеспособные.
> (bl, ti-users) Молодёжь впереди · среди 18-24 такими приложениями пользуется каждый пятый.
> (gd, ti-brain) Огромная недообслуженная группа · 15,5 млн взрослых с СДВГ в одних только США: им нужен планер, который <gd>не стыдит</gd>. Таких почти нет.
> src: Statista · JMIR · CDC

**S10 РЫНОК: ИГРОКИ И ДЫРА**
> eyebrow: Рынок · H: Игроки и <pk>дыра</pk>
> rows: (gd, ti-flame) Duolingo · $700+ млн в год. Платят <b>9 из 100</b> бесплатных пользователей: этого хватает на весь бизнес.
> (bl, ti-moon) Calm и Headspace · сотни миллионов, но <pk>сжимаются</pk>: минус 24% выручки, минус сотни тысяч подписчиков за год. Люди устали от подписок и давления.
> (pk, ti-feather) Finch · птенец, о котором заботишься, ухаживая за собой. <gr>$30 млн в год без единого инвестора</gr>, продаёт только красоту, никого не стыдит.
> lead: Честное <gr>растёт</gr>, давящее сжимается. А честного всё-в-одном <gd>нет ни у кого</gd>.
> src: SEC · Business of Apps (оценки)

**РАЗДЕЛ МОДЕЛЬ**

**S11 БЕСПЛАТНО НАВСЕГДА** (icon-per-line, green panel style)
> eyebrow: Модель · H: Ядро <gr>бесплатно</gr> навсегда
> icon list: (ti-calendar-event) планер и живой день · (ti-checkbox) трекер привычек · (ti-brain) базовые медитации · (ti-wind) дыхание · (ti-stretching) растяжка · (ti-book) дневник и вечернее закрытие дня · (ti-microphone) голос хранителя · (ti-flag) цели вручную: ставишь и разбиваешь сам
> panel: Так побеждают в этой категории: <b>ядро не продаём никогда</b>. Бесплатное ядро приводит людей и строит доверие.

**S12 ПЛАТНО: ГЛУБИНА** (icon-per-line, pink panel style)
> eyebrow: Модель · H: Платно: <pk>глубина</pk>
> icon list: (ti-sparkles) <b>ИИ-архитектор целей</b>: ставит цели вместе с тобой, разбивает на шаги, раскладывает на месяцы и весь год, перестраивает, когда жизнь меняется · (ti-brain) полная библиотека медитаций и программ · (ti-stairs-up) продвинутые ступени пути · (ti-palette) красота мира и персонализация · (ti-microphone) голос-плюс в будущем
> panel: Логика простая: бесплатно <gr>всё, чтобы жить по плану</gr>. Платно <pk>всё, что делает путь глубже и краше</pk>.

**S13 ПОЧЕМУ КУПЯТ ПОЖИЗНЕННЫЙ**
> eyebrow: Модель · H: Почему купят <gd>пожизненный</gd>
> rows: (gd, ti-lock) Цена фиксируется навсегда · первые 100 человек: $49, $69, $99. Потом дороже. Счётчик мест настоящий.
> (bl, ti-scale) Правило индустрии · пожизненный доступ стоит около 15 месячных цен. Наша подписка будет ~$4-6: правило даёт $60-90. <b>Наша лестница сидит ровно в правиле.</b>
> (pk, ti-diamond) Что получают · вся глубина навсегда: ИИ-архитектор, библиотека, персонализация. Calm продаёт пожизненный за <pk>$399</pk>.
> lead: Дешевле, чем <gd>одна отменённая подписка</gd> за год.

**S14 ТРИ ДВЕРИ В ЦИФРАХ**
> eyebrow: Модель · H: Три двери, <gd>посчитанные</gd>
> rows: (gd, ti-infinity) Пожизненный · для тех, кто ненавидит подписки. 100 первых мест = <b>$7 200</b>, если распроданы. Дальше обычная цена $149.
> (pu, ti-refresh) Подписка ~$40/год · для тех, кому так привычнее. Каждая 1 000 бесплатных пользователей при конверсии категории 2,9% даёт <b>~29 платящих ≈ $1 100 в год</b>, и это медиана, у лучших вдвое-втрое больше.
> (pk, ti-coins) Маленькие покупки · для тех, кто не любит платить помногу: красота мира, кредиты ИИ. Finch построил на этом <b>$30 млн в год</b>.
> panel: Три двери ловят три типа покупателей. Первые продажи покажут, какую открывать шире.
> src: RevenueCat 2026 · Finch (оценки)

**S15 СЦЕНАРИИ (funnel math)**
> eyebrow: Деньги · H: Три сценария, <gd>посчитанные</gd>
> p.sm: Считаем одинаково: установки × конверсия категории (медиана 2,9%, лучшие 6%+) × средний чек. Меняется только скорость роста аудитории.
> rows: (mu, arrow-down-right) Минимум · органика идёт медленно: ~1 000 установок за полгода → ~30 покупок → около <b>$3 000</b>.
> (gd, arrow-right) Середина · контент-машина работает: ~5 000 установок → 100 мест распроданы + подписки → около <b>$10 000</b>.
> (pk, arrow-up-right) Максимум · ролик выстреливает и мы платим за его разгон: ~20 000+ установок, конверсия верхнего квартиля → <b>$30 000+</b>.
> foot: Это оценки на данных индустрии, не обещания. Медленный сценарий тоже окупает вложение.
> src: RevenueCat State of Subscription Apps 2026

**РАЗДЕЛ ПЛАН**

**S16 ФАЗЫ (calendar, plain words)**
> timeline as built (no glow halos per PART 1), each node gets an explaining sub-line:
> Июль-август: достройка · последние узлы: запуск продаж, первый день новичка
> Конец августа: ЗАПУСК · открываем 100 первых мест списку тёплых людей. Первые деньги.
> Сентябрь-октябрь: контент-машина · ежедневные ролики набирают аудиторию, реклама тестируется по чуть-чуть
> Ноябрь: Чёрная пятница · главная распродажа года в мире, люди ждут предложений. Наше второе событие продаж.
> Январь: главная волна · время новогодних обещаний. В январе категория ставит рекорды: <b>$385 млн покупок за один месяц</b>. Мы приходим туда с готовым приложением и проверенной рекламой.
> src: Sensor Tower

**S17 ВО ЧТО ИДУТ ДЕНЬГИ (помесячно)**
> rows: (gd, ti-bolt) Claude · <b>месяц 1: $200</b>, полная сборка · дальше ~$100 в месяц. Он же <gd>маркетолог</gd>: пишет посты, планирует кампании, ведёт рекламу.
> (pk, ti-microphone) Голос · <b>$22 один раз</b> · вся библиотека записывается за один месяц, потом отключаем.
> (bl, ti-movie) Ролики · <b>~$130 за месяц</b> производства = 3-4 видео · повторяем по бюджету.
> (pu, ti-device-mobile) Витрина · домен $15/год · сайт бесплатно · Apple $99, когда идём в App Store.

**S18 КОНТЕНТ-МАШИНА (the marketing core)**
> eyebrow: Маркетинг · H: Контент, который <bl>ценен сам по себе</bl>
> p: У меня уже есть YouTube-канал <b>Field Guide</b>: выжимки мудрости лучших мыслителей. Продолжаем его: видео, которые <gr>учат настоящей технике</gr> и потому ценны сами по себе. Такие видео люди передают друг другу, и каждое ненавязчиво показывает приложение.
> rows: (gd, ti-movie) Микс производства · часть роликов делает ИИ, часть снимаю сам со своим лицом.
> (bl, ti-scissors) Дешевле формат · раньше минута стоила дорого из-за анимации. Новый формат: меньше анимации, больше автоматизации: <b>больше видео за те же деньги</b>.
> (pk, ti-calendar-stats) Темп по бюджету · легко: 3 в неделю · средне: 5-7 · интенсивно: 14.

**S19 ВИРАЛЬНОЕ → ПЛАТНОЕ (the system; positive)**
> eyebrow: Маркетинг · H: Сначала ролик <gr>доказывает себя</gr>, потом мы его <gd>разгоняем</gd>
> p: Реклама в этой категории <b>работает</b>: Finch вырос до $30 млн, масштабируя рекламу в Meta и TikTok. Но платить надо за <gr>проверенное</gr>.
> rows: (gr, ti-plant) Шаг 1 · ролики выходят бесплатно, органикой. Смотрим, какой цепляет людей сам.
> (gd, ti-rocket) Шаг 2 · победителя разгоняем деньгами в Meta и Google: сначала тесты по $5 в день, потом масштаб.
> (bl, ti-calculator) Математика · привлечение в категории стоит ~$43, наш чек $49-99 плюс подписки: <b>сходится, когда ролик сильный</b>. Поэтому платим только за сильные.
> src: Finch · отраслевые бенчмарки Meta

**РАЗДЕЛ УРОВНИ (5 slides, one per tier; 4 blocks each: Покупает / Получаем / Скорость / Что это меняет)**

**S20 ИСКРА $500**
> Покупает: Claude 3 месяца $400 · голос $22 · домен $15 · картинки $40.
> Получаем: приложение достроено и запущено в срок, голос записан, сайт живёт, продажи открыты, контент стартует.
> Скорость: запуск в конце августа гарантированно обеспечен инструментами.
> Что меняет: без рекламного топлива рост чисто органический: реалистичен <b>минимальный сценарий</b>, $3 000 за полгода. Вложение окупается, но медленно.

**S21 ПЛАМЯ $1 000**
> Покупает: всё из Искры + Apple $99 + месяц Higgsfield $130 (3-4 ролика) + месяц рекламных тестов $150.
> Получаем: путь в App Store открыт, первые ролики в ротации, данные какая реклама цепляет.
> Скорость: маркетинг начинается на месяц раньше, к запуску уже есть видео.
> Что меняет: появляется мост между минимумом и серединой: знание, какой ролик работает, до Чёрной пятницы.

**S22 КОСТЁР $3 000 (РЕКОМЕНДУЮ)**
> Покупает: Claude до полугода $600 · производство роликов 3 месяца ~$400 (8-12 видео) · рекламный бюджет $1 200 по сигналу · товарный знак ~$450 · голос, домен, Apple.
> Получаем: контент-машина работает без перерыва всю осень, реклама проверена И масштабирована, бренд защищён.
> Скорость: темп контента удваивается (5-7 в неделю), к Чёрной пятнице приходим с проверенным роликом и бюджетом на разгон.
> Что меняет: <b>средний сценарий становится базовым</b>: ~$10 000 за полгода. Именно здесь платная реклама впервые реально двигает рост.

**S23 МАЯК $5 000**
> Покупает: всё из Костра + ИИ-архитектор целей построен (аккаунты, серверная часть, ~$700 работ и годовой инфраструктуры) + рекламный бюджет $2 400 + резерв на январь.
> Получаем: платный продукт становится радикально глубже: главный платный магнит готов к январю.
> Скорость: январская волна встречается с полным продуктом и деньгами на кампанию.
> Что меняет: выше конверсия в покупку (магнит сильнее), январь профинансирован: коридор <b>между серединой и максимумом</b>.

**S24 РАССВЕТ $10 000**
> Покупает: всё из Маяка + полная январская кампания $5 500 поэтапно + производство роликов всю дорогу + запас хода до весны.
> Получаем: максимум попыток на обеих волнах рынка, длинное дыхание после января.
> Скорость: ничего не ждёт денег: каждый победивший ролик сразу получает бюджет.
> Что меняет: максимальная вероятность <b>верхнего сценария</b> $30 000+. И главное: если ролик выстреливает, есть чем его поливать в тот же день.

**S25 РИСКИ: МЫ ГОТОВЫ**
> eyebrow: Риски · H: Мы <gd>готовы</gd> к трудностям
> rows: (pk, ti-ad) Реклама может не окупиться · поэтому решает математика: меряем стоимость привлечения против чека, масштабируем только окупающееся. Деньги не сгорают: резерв ждёт сигнала.
> (bl, ti-seeding) Рост может быть медленным · поэтому ежедневный объём контента (больше попыток), проверенная система коротких видео и две волны рынка в календаре.
> (gd, ti-building-store) Платформы могут менять правила · поэтому свой сайт, свой список почты, продажи напрямую: не арендуем чужую землю.
> (gr, ti-shield-check) Конкуренты могут копировать · поэтому позиция, которую больно копировать: их выручка построена на давлении, наша на честности. Плюс скорость: мы шьём быстрее.
> foot: Козыри: продукт готов · обслуживание почти $0 · два языка · самая конвертирующая категория в индустрии.

**S26 ФИНАЛ** (as built: возврат раньше моей прибыли · отчёт цифрами каждую неделю · «Остальное - мы семья.» · CTA «Выбери сумму: остальное сделаю я» · foot slogan). No advice line, no formal language.

---

## PART 4: OPUS BUILD PROTOCOL
1. Read this spec fully. Edit `_pitch/mama.html` IN PLACE: keep CSS system; apply PART 1 Fix A (strip filters/blur shadows, gradient halo for cover); add `.src` fine-print style + icon-list styles for S11/S12; add the `?only=N` isolation script.
2. Build the 26 slides with VERBATIM copy from PART 3 (tint markup: <pk>/<gd>/etc = the existing span classes; ≥2 tints per paragraph).
3. Fit check in preview at 431×877: no slide over page height; trim spacing, never shrink type below current sizes.
4. Render via PART 1 Fix B raster pipeline → `_pitch/mama.pdf`. Verify: page count 26, eyeball PNG of cover + calendar pages via Read (the mobile-bug regression check), size <25MB.
5. Gates: zero em/en-dashes, zero «!» in RU copy, no «договор/юридич/совет» words. `_pitch/` stays uncommitted.

## PART 5: OPEN FOR DAVID
1. Free/paid split (voice free, AI-architect paid) presented as the plan: confirm.
2. 26 slides OK, or name cuts (candidates to merge: S8+S9, S20+S21).
3. Scenario numbers are benchmark-derived estimates, labeled as such in the deck.
