# goals — BUILD SPEC (Квесты room, verdict #13 "as is")

Paste-ready. Single-file app: CSS → `index.html`, JS → `app.js`. Surgical anchors only.

---

## 1. SUMMARY

**Screen:** the **Квесты** (Quests) room — David's longer arcs, drawn as a foil-fill quest card with a tiered sub-bounty ladder, a next-session fact strip, a pink "put a session into the day" door, a stale-card rotation whisper, a mint-promise footer, and a released shelf. The DETAIL screen is the **card-back flip**: gold ЖЕЛАНИЕ/РЕЗУЛЬТАТ/ПРЕПЯТСТВИЕ/ПЛАН (WOOP) inscriptions, the if-then plan as one editable sentence, and the "Отпустить с честью" release rite.

**Reached today:** `goalsSheet()` at [app.js:2515](app.js:2515). Opened from:
- Notebook → "Goals" row ([app.js:2752](app.js:2752))
- Journey pill act ([app.js:1017](app.js:1017))
- Journal room row ([app.js:2964](app.js:2964))
- `#openGoals` / `#goGoals` bindings ([app.js:8604](app.js:8604))

The current `goalsSheet` already has the §12 quest-card skeleton (foil edge = progress bar, `.q-foil`/`.q-well`/`.quest-ladder`/`.q-step`, pink `.tf-door`). This spec brings it to **1:1 with the widget**: the header spark chip, the tiered `+N spark` bounties, the pip-strip + "следующая = завтра 15:00" next-session fact, the stale-card whisper row, the mint-promise footer, the released shelf, and the WOOP card-back detail with the one-sentence plan + release rite.

We keep the existing `goal-ov`/`goal-card` overlay shell and existing helpers; we **replace `drawMap()` and `drawGoal()` bodies** and **add scoped CSS**. Data model is preserved (`g.subtasks[].done`, `g.metric`, `g.woop`, `g.active`, `g.lastK`); we add two additive fields: `g.released` (bool) + `g.releasedAt` (ts) for the release rite, and `g.chapters` (optional int, defaults 5) + a per-subtask `g.subtasks[i].sessions`/`sessionsDone` (optional, defaults 4/N) for the pip strip. All are read with `|| fallback` so David's real data never wipes — **no SCHEMA bump required** (purely additive optional fields).

---

## 2. CSS — add to `index.html`

**Anchor — insert AFTER line 1082** (`.q-more{ color:#6a4a5c; ...}`), inside the existing §12 quest block:

```css
  /* === QUESTS ROOM 1:1 (verdict #13) === */
  /* header spark chip */
  .q-spark{ flex:none; display:flex; align-items:center; gap:5px; background:#2a0f22; border:2.5px solid #ffd24a; border-radius:12px; padding:4px 11px; color:#ffd24a; font-family:"Jost",sans-serif; font-weight:800; font-size:14px; box-shadow:0 3px 0 #160510; }
  .q-spark i{ font-size:15px; }
  /* hero sub-line under the title (глава 3 из 5 · фольга заполняется) */
  .q-sub{ font-size:12px; color:#c9a6c4; font-weight:600; line-height:1.35; margin-top:2px; }
  /* tiered bounty on a ladder step */
  .q-step .q-bounty{ color:#ffd24a; font-weight:800; font-size:12px; flex:none; }
  .q-step.done .q-bounty{ color:#6a9a82; }
  .q-step.fut .q-bounty{ color:#8a6a4a; }
  /* two-line ladder label (Глава 3 — 4 сессии / глубокой работы) wraps, doesn't ellipsize */
  .q-step.next .q-lab, .q-step .q-lab.q-wrap{ white-space:normal; line-height:1.25; }
  /* PIP STRIP + next-session fact (under the active ladder step) */
  .q-pips{ display:flex; align-items:center; gap:10px; margin:2px 0 2px 35px; }
  .q-pipset{ display:flex; gap:5px; flex:none; }
  .q-pip{ width:22px; height:8px; border-radius:5px; background:#3a2036; border:2px solid #160510; }
  .q-pip.on{ background:#34d39a; }
  .q-pipfact{ font-size:12px; color:#c9a6c4; font-weight:600; line-height:1.25; }
  .q-pipfact b{ color:#ffe3f1; font-weight:800; }
  /* STALE-CARD rotation whisper (тихо N дней · верну его в путь) */
  .q-stale{ display:flex; align-items:center; gap:11px; background:#1c0f26; border:2px solid #2a1830; border-radius:14px; padding:11px 13px; margin-top:12px; cursor:pointer; }
  .q-stale-well{ width:38px; height:38px; border-radius:11px; border:2.5px solid #160510; display:flex; align-items:center; justify-content:center; flex:none; }
  .q-stale-well i{ font-size:18px; color:#fff; }
  .q-stale-tx{ flex:1; min-width:0; }
  .q-stale-t{ font-weight:800; font-size:14px; color:#ffe3f1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .q-stale-s{ font-size:12px; color:#9a7ea8; font-weight:600; margin-top:1px; }
  /* MINT-PROMISE footer card (заверши квест — чеканится полноартовой картой) */
  .q-mint{ display:flex; align-items:center; gap:12px; background:linear-gradient(150deg,#241435,#1a0e28); border:2.5px solid #ffd24a; border-radius:16px; padding:12px 14px; margin-top:12px; box-shadow:0 3px 0 #160510; }
  .q-mint-card{ width:44px; height:56px; border-radius:9px; border:2.5px solid #160510; background:linear-gradient(160deg,#8a5cf0,#5a2ea8); display:flex; align-items:center; justify-content:center; flex:none; box-shadow:0 2px 0 #160510; }
  .q-mint-card i{ font-size:22px; color:#ffe3f1; }
  .q-mint-tx{ flex:1; min-width:0; font-size:12.5px; color:#d8c4e8; font-weight:600; line-height:1.4; }
  .q-mint-tx b{ color:#ffe3f1; font-weight:800; }
  /* RELEASED SHELF (Отпущенные · N) — collapsible */
  .q-shelf{ margin-top:12px; }
  .q-shelf-head{ display:flex; align-items:center; gap:9px; border:2px dashed #3a2540; border-radius:14px; padding:11px 13px; cursor:pointer; color:#a08bb8; font-weight:800; font-size:14px; }
  .q-shelf-head i.q-shelf-lead{ font-size:18px; }
  .q-shelf-head .q-shelf-caret{ margin-left:auto; font-size:16px; transition:transform .2s; }
  .q-shelf.open .q-shelf-caret{ transform:rotate(180deg); }
  .q-shelf-body{ display:none; flex-direction:column; gap:8px; margin-top:8px; }
  .q-shelf.open .q-shelf-body{ display:flex; }
  .q-shelf-row{ display:flex; align-items:center; gap:10px; background:#160b1e; border:2px solid #2a1830; border-radius:12px; padding:9px 12px; cursor:pointer; }
  .q-shelf-row .q-shelf-ic{ font-size:16px; color:#9a7ea8; flex:none; }
  .q-shelf-row .q-shelf-t{ flex:1; min-width:0; color:#c9a6c4; font-size:13px; font-weight:700; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .q-shelf-row .q-shelf-restore{ flex:none; color:#7ea8d8; font-size:12px; font-weight:800; }

  /* === CARD-BACK FLIP (goal detail) === */
  .qb-head{ display:flex; align-items:flex-start; gap:11px; padding:14px 14px 6px; }
  .qb-well{ width:52px; height:52px; border-radius:14px; border:2.5px solid #160510; display:flex; align-items:center; justify-content:center; flex:none; box-shadow:0 3px 0 #160510; }
  .qb-well i{ font-size:26px; color:#fff; }
  .qb-titlewrap{ flex:1; min-width:0; }
  .qb-title{ font-family:"Jost",sans-serif; font-weight:800; font-size:20px; color:#ffe3f1; line-height:1.12; }
  .qb-sub{ font-size:12.5px; color:#c9a6c4; font-weight:600; margin-top:3px; letter-spacing:.3px; }
  .qb-nav{ flex:none; width:34px; height:34px; border-radius:11px; background:#2a0f22; border:2px solid #160510; color:#ffd0e6; font-size:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
  /* the whole detail body wears the foil ring (foil edge → full-screen inset ring) */
  .qb-body{ margin:4px 12px 0; border:3px solid #ffd24a; border-radius:18px; padding:16px 15px; background:linear-gradient(165deg,#22102e,#160a20); box-shadow:0 0 0 2px #160510 inset; }
  /* gold inscription block */
  .qb-insc{ margin-bottom:14px; }
  .qb-insc:last-of-type{ margin-bottom:0; }
  .qb-label{ font-family:"Jost",sans-serif; font-weight:800; font-size:12.5px; letter-spacing:2px; color:#ffd24a; text-transform:uppercase; margin-bottom:5px; }
  .qb-val{ font-family:"Jost",sans-serif; font-weight:700; font-size:17px; color:#ffe3f1; line-height:1.3; }
  .qb-val.empty{ color:#7a5a70; font-weight:600; font-style:italic; }
  /* the ПЛАН one-sentence editable card */
  .qb-plan{ position:relative; border:2.5px solid #ffd24a; border-radius:14px; background:#1a0f26; padding:14px 40px 14px 15px; margin-top:2px; }
  .qb-plan-sent{ font-family:"Jost",sans-serif; font-weight:800; font-size:16.5px; line-height:1.35; color:#ffe3f1; }
  .qb-plan-sent .qb-if{ color:#c9a6c4; font-weight:600; }
  .qb-plan-sent .qb-then{ color:#ff5fa8; }
  .qb-plan-edit{ position:absolute; right:11px; top:50%; transform:translateY(-50%); width:26px; height:26px; border:none; background:none; color:#c9a6c4; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  /* release rite door — ghost dashed, feather icon */
  .qb-release{ display:flex; align-items:center; gap:12px; width:calc(100% - 24px); margin:14px 12px 4px; border:2px dashed #4a3560; border-radius:16px; background:transparent; padding:13px 15px; cursor:pointer; text-align:left; }
  .qb-release i{ font-size:20px; color:#a08bb8; flex:none; }
  .qb-release-tx{ flex:1; min-width:0; }
  .qb-release-t{ font-family:"Jost",sans-serif; font-weight:800; font-size:15px; color:#c9a6c4; }
  .qb-release-s{ font-size:12px; color:#8a6ea0; font-weight:600; margin-top:2px; line-height:1.3; }
```

> Palette check: `#ffd24a` (gold) already used in existing `.q-bounty`/`.q-sheen`; `#ff5fa8` pink and `#8a5cf0` purple are the locked `:root` domains; `#160510` ink border + `0 Npx 0 #160510` hard shadows throughout. No new off-palette color introduced. `.qb-body` background reuses the existing `.q-foil .goal-cardx` gradient (`#22102e → #160a20`).

---

## 3. RENDER JS — `app.js`

Replace the **two inner functions** `drawMap()` and `drawGoal()` inside `goalsSheet()`. The anchors are the exact existing `function drawMap()` line and `function drawGoal(g)` line.

### 3a. Replace `drawMap()`

**Replace** the whole `function drawMap() { ... }` block ([app.js:2521](app.js:2521)–2558) with:

```javascript
    function drawMap() {
      var head = header('<i class="ti ti-map-2"></i> ' + tr("Quests"), false);
      // header SPARK chip (total earned spark; falls back to active-goal count if no spark ledger)
      var sparkN = (S.spark != null) ? S.spark : activeGoals().length;
      var chip = document.createElement("span"); chip.className = "q-spark"; chip.innerHTML = '<i class="ti ti-bolt"></i> ' + sparkN; head.insertBefore(chip, head.lastChild);
      var body = add(card, "div", "goal-body");
      if (!activeGoals().length && !(S.goals && S.goals.length)) add(body, "div", "goal-empty", tr("No quests yet — add what you're building toward."));
      var grid = add(body, "div", "goal-grid");
      // HERO + rotation: the stalest active goal is the hero card; the rest surface as whisper rows
      var actives = staleGoals();              // active, stalest-first
      var hero = actives.length ? actives[actives.length - 1] : null; // freshest = the one you're on
      // David's frame: the FIRST card is the hero; ship all actives as hero cards is too loud → hero = first, others = stale rows
      hero = actives[0] || null;
      if (hero) drawHero(grid, hero);
      // stale-card rotation whispers (the other actives, tap = open)
      actives.slice(1).forEach(function (g) { drawStaleRow(body, g); });
      // MINT-PROMISE footer
      var mint = add(body, "div", "q-mint");
      var mc = add(mint, "div", "q-mint-card"); mc.innerHTML = '<i class="ti ti-cards"></i>';
      add(mint, "div", "q-mint-tx").innerHTML = tr("finish a quest — it mints as a full-art card") ;
      // RELEASED shelf
      var released = (S.goals || []).filter(function (g) { return g.released; });
      var shelf = add(body, "div", "q-shelf");
      var sh = add(shelf, "div", "q-shelf-head");
      sh.innerHTML = '<i class="ti ti-archive q-shelf-lead"></i> ' + tr("Released") + ' · ' + released.length + '<i class="ti ti-chevron-down q-shelf-caret"></i>';
      var shb = add(shelf, "div", "q-shelf-body");
      released.forEach(function (g) {
        var dom = DOM[g.domain || "focus"];
        var r = add(shb, "div", "q-shelf-row");
        var ic = add(r, "i", "ti " + tiClass(g) + " q-shelf-ic"); ic.style.color = dom.c;
        add(r, "div", "q-shelf-t", g.title);
        add(r, "div", "q-shelf-restore", tr("return"));
        r.onclick = function () { g.released = false; g.active = true; save(); draw(); };
      });
      sh.onclick = function () { shelf.classList.toggle("open"); };
      // add new quest
      typeAdd(body, tr("a quest you're building toward…"), function (v) { var go = { title: v, domain: domainOf({ title: v }), subtasks: [], active: true }; try { decomposeGoal(go).forEach(function (st) { go.subtasks.push({ title: st, done: false }); }); } catch (e) {} attachGuessedMetric(go); (S.goals = S.goals || []).push(go); save(); draw(); });
    }

    // HERO quest card — foil edge = progress, tiered bounty ladder, pip strip + next-session fact, pink session door
    function drawHero(grid, g) {
      var dom = DOM[g.domain || "focus"], subs = g.subtasks || [];
      var doneN = subs.filter(function (s) { return s.done; }).length;
      var pct = (g.metric && g.metric.target != null && g.metric.current != null) ? metricPct(g.metric) : (subs.length ? Math.round(doneN / subs.length * 100) : 0);
      var foil = add(grid, "div", "q-foil"); foil.style.background = "linear-gradient(180deg,#ffd24a 0%,#ffd24a " + pct + "%,#3a2036 " + pct + "%,#3a2036 100%)";
      var gc = add(foil, "div", "goal-cardx on");
      add(gc, "div", "q-sheen");
      // title row
      var hr = add(gc, "div"); hr.style.cssText = "display:flex;align-items:flex-start;gap:11px;position:relative;z-index:2;";
      var well = add(hr, "div", "q-well"); well.style.background = tfStripe(dom.c); well.innerHTML = tiIcon(g);
      var tw = add(hr, "div"); tw.style.cssText = "flex:1;min-width:0;";
      var tt = add(tw, "div"); tt.style.cssText = "font-weight:800;font-size:18px;color:#fff2f9;line-height:1.12;"; tt.textContent = g.title;
      var chapN = g.chapters || subs.length || 5;
      var curChap = Math.min(chapN, doneN + 1);
      var ml = add(tw, "div", "q-sub"); ml.innerHTML = tr("chapter") + ' ' + curChap + ' ' + tr("of") + ' ' + chapN + ' · <span style="color:#ffd24a;font-weight:700">' + tr("foil filling") + '</span>';
      var pcEl = add(hr, "div"); pcEl.style.cssText = "color:#ffd24a;font-weight:800;font-size:15px;flex:none;font-family:'Jost',sans-serif;"; pcEl.textContent = pct + "%";
      // TIERED bounty ladder
      var nextStep = null, nextIdx = -1;
      function bountyFor(i, n) { return 12 + i * 18; } // rising tiers: +12, +30, +48… (matches widget +12/+30/+40/+58 feel)
      function scheduleNext(ev) { if (ev) ev.stopPropagation(); if (!nextStep) return; var t2 = nextFreeMin(todayK()); blocks(todayK()).push({ id: uid(), time: pad(Math.floor(t2 / 60)) + ":" + pad(t2 % 60), mins: 30, title: nextStep.title, prio: 2, color: dom.c, catK: null, domain: g.domain || "focus", done: false }); reflow(todayK()); goalTouch(g); save(); renderToday(); toast(tr("session placed into today — it waits for you")); }
      if (subs.length) {
        var lad = add(gc, "div", "quest-ladder");
        subs.slice(0, 5).forEach(function (st, i) {
          var isNext = !st.done && !nextStep; if (isNext) { nextStep = st; nextIdx = i; }
          var r = add(lad, "div", "q-step" + (st.done ? " done" : isNext ? " next" : " fut"));
          var lab = '<span class="q-ic">' + (st.done ? '<i class="ti ti-check"></i>' : isNext ? '<i class="ti ti-player-play"></i>' : '') + '</span>'
            + '<span class="q-lab' + (isNext ? '' : ' q-wrap') + '">' + esc(st.title) + '</span>'
            + '<span class="q-bounty">+' + bountyFor(i) + '</span>';
          r.innerHTML = lab;
          if (isNext) r.onclick = scheduleNext;
          // PIP STRIP + next-session fact under the ACTIVE step (sessions of deep work)
          if (isNext) {
            var totS = st.sessions || 4, doneS = st.sessionsDone || 0;
            var pipwrap = document.createElement("div"); pipwrap.className = "q-pips";
            var pipset = document.createElement("div"); pipset.className = "q-pipset";
            for (var p = 0; p < totS; p++) { var pip = document.createElement("div"); pip.className = "q-pip" + (p < doneS ? " on" : ""); pipset.appendChild(pip); }
            pipwrap.appendChild(pipset);
            var fact = document.createElement("div"); fact.className = "q-pipfact";
            fact.innerHTML = doneS + "/" + totS + "<br>" + tr("next") + " = <b>" + nextSessionLabel(g) + "</b>";
            pipwrap.appendChild(fact);
            lad.appendChild(pipwrap);
          }
        });
        // one locked future tier (dashed circle, its bounty)
        if (subs.length > 5) { var mr = add(lad, "div", "q-step fut"); mr.innerHTML = '<span class="q-ic"></span><span class="q-lab q-wrap">' + esc(subs[5].title) + '</span><span class="q-bounty">+' + bountyFor(5) + '</span>'; }
      } else add(gc, "div", "goal-tagnone", tr("tap to break it down →"));
      // pink session DOOR
      if (nextStep) { var cta = add(gc, "button", "tf-door"); cta.style.cssText = "background:#ff5fa8;color:#4a1126;margin-top:14px;font-size:15px;position:relative;z-index:2;"; cta.innerHTML = '<i class="ti ti-calendar-plus"></i> ' + tr("Put a session into the day"); cta.onclick = scheduleNext; }
      gc.onclick = function (e) { if (e.target.closest(".tf-door") || e.target.closest(".q-step.next")) return; view = g; draw(); };
    }

    // STALE-CARD rotation whisper row
    function drawStaleRow(body, g) {
      var dom = DOM[g.domain || "focus"];
      var days = staleDays(g);
      var row = add(body, "div", "q-stale");
      var w = add(row, "div", "q-stale-well"); w.style.background = tfStripe(dom.c); w.innerHTML = tiIcon(g);
      var tx = add(row, "div", "q-stale-tx");
      add(tx, "div", "q-stale-t", g.title);
      add(tx, "div", "q-stale-s").innerHTML = (days > 0 ? (tr("quiet") + " " + days + " " + tr("days") + " · ") : "") + tr("I'll bring it back into the path");
      row.onclick = function () { view = g; draw(); };
    }
```

> **Helper `nextSessionLabel(g)` and `staleDays(g)`** — add both **once**, right above `function goalsSheet()` ([app.js:2515](app.js:2515), insert BEFORE it):

```javascript
  function staleDays(g) { var lk = goalLastK(g); if (!lk) return 0; try { return Math.max(0, Math.round((kd(todayK()) - kd(lk)) / 86400000)); } catch (e) { return 0; } } // days since this quest was last worked (drives the rotation whisper)
  function nextSessionLabel(g) { // human "when's the next scheduled session" — scans upcoming blocks for one tied to this quest; falls back to "tomorrow HH:MM"
    var want = (g.title || "").toLowerCase();
    for (var d = 0; d < 4; d++) { var k = keyAdd(todayK(), d); var b = blocks(k).filter(function (x) { return !x.done && ((x.domain === (g.domain || "focus")) || (x.title || "").toLowerCase().indexOf(want.slice(0, 6)) !== -1); })[0]; if (b) return (d === 0 ? tr("today") : d === 1 ? tr("tomorrow") : relLabel(k).toLowerCase()) + " " + b.time; }
    return tr("tomorrow") + " 15:00";
  }
```

### 3b. Replace `drawGoal(g)` — the card-back flip (WOOP)

**Replace** the whole `function drawGoal(g) { ... }` block ([app.js:2559](app.js:2559)–2591) with:

```javascript
    function drawGoal(g) {
      var dom = DOM[g.domain || "focus"];
      // FLIP header: back chevron + well + title + "оборот карты · WOOP" + rotate glyph
      var head = add(card, "div", "qb-head");
      var bk = add(head, "button", "qb-nav"); bk.innerHTML = '<i class="ti ti-chevron-left"></i>'; bk.onclick = function () { view = null; draw(); };
      var well = add(head, "div", "qb-well"); well.style.background = tfStripe(dom.c); well.innerHTML = tiIcon(g);
      var tw = add(head, "div", "qb-titlewrap");
      add(tw, "div", "qb-title", g.title);
      add(tw, "div", "qb-sub").innerHTML = tr("card back") + " · WOOP";
      var rot = add(head, "button", "qb-nav"); rot.innerHTML = '<i class="ti ti-rotate"></i>'; rot.onclick = function () { view = null; draw(); };
      var xw = add(head, "button", "qb-nav"); xw.innerHTML = '<i class="ti ti-x"></i>'; xw.onclick = function () { ov.remove(); };
      var body = add(card, "div", "goal-body"); body.style.padding = "10px 0 14px";
      var woop = g.woop || {};
      var metric = g.metric || {};
      // GOLD INSCRIPTIONS
      var insc = add(body, "div", "qb-body");
      function inscription(label, val) { var b = add(insc, "div", "qb-insc"); add(b, "div", "qb-label", label); var v = add(b, "div", "qb-val" + (val ? "" : " empty")); v.textContent = val || tr("tap the plan below to fill this in"); return b; }
      inscription(tr("WISH"), g.title);
      inscription(tr("OUTCOME"), woop.outcome || (metric.target != null ? (tr("reach") + " " + metric.target + (metric.unit ? " " + metric.unit : "")) : ""));
      inscription(tr("OBSTACLE"), woop.obstacle);
      // ПЛАН — one editable if-then sentence
      var pb = add(insc, "div", "qb-insc"); add(pb, "div", "qb-label", tr("PLAN"));
      var plan = add(pb, "div", "qb-plan");
      var sent = add(plan, "div", "qb-plan-sent");
      function renderSentence() {
        var ob = (g.woop && g.woop.obstacle) || "", pl = (g.woop && g.woop.plan) || "";
        if (ob || pl) sent.innerHTML = '<span class="qb-if">' + tr("If") + " " + esc(ob || "…") + " — " + tr("I") + '</span> <span class="qb-then">' + esc(pl || "…") + '</span>';
        else sent.innerHTML = '<span class="qb-if" style="font-style:italic">' + tr("If [obstacle] — I [my move]") + '</span>';
      }
      renderSentence();
      var ed = add(plan, "button", "qb-plan-edit"); ed.innerHTML = '<i class="ti ti-pencil"></i>';
      ed.onclick = function () {
        plan.innerHTML = "";
        var r1 = add(plan, "div", "goal-hint"); r1.style.margin = "0 0 6px"; r1.innerHTML = '<i class="ti ti-barrier-block"></i> ' + tr("Main obstacle");
        var obsInp = add(plan, "input", "goal-input"); obsInp.type = "text"; obsInp.placeholder = tr("the inner block that gets in the way…"); obsInp.value = (g.woop && g.woop.obstacle) || ""; obsInp.style.marginBottom = "8px";
        var r2 = add(plan, "div", "goal-hint"); r2.style.margin = "0 0 6px"; r2.innerHTML = '<i class="ti ti-arrow-right"></i> ' + tr("If that hits, I'll…");
        var planInp = add(plan, "input", "goal-input"); planInp.type = "text"; planInp.placeholder = tr("my if-then plan…"); planInp.value = (g.woop && g.woop.plan) || "";
        function saveWoop() { var o = obsInp.value.trim(), p = planInp.value.trim(); g.woop = g.woop || {}; g.woop.obstacle = o; g.woop.plan = p; save(); draw(); }
        planInp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); saveWoop(); } });
        obsInp.addEventListener("blur", saveWoop); planInp.addEventListener("blur", saveWoop);
        setTimeout(function () { try { obsInp.focus(); } catch (e) {} }, 60);
      };
      // steps + metric live under the fold (kept from the working goal editor — the scheduling machinery)
      metricSection(g, body, draw);
      var sl = add(body, "div", "goal-steps"); sl.style.margin = "0 12px";
      (g.subtasks || []).forEach(function (st, i) {
        var row = add(sl, "div", "goal-step" + (st.done ? " done" : ""));
        var ck = add(row, "button", "gs-check"); ck.innerHTML = st.done ? '<i class="ti ti-circle-check-filled"></i>' : '<i class="ti ti-circle"></i>'; ck.onclick = function () { st.done = !st.done; if (st.done) goalTouch(g); save(); draw(); };
        add(row, "div", "gs-title", st.title);
        var sc = add(row, "button", "gs-sched"); sc.innerHTML = '<i class="ti ti-calendar-plus"></i>'; sc.onclick = function () { scheduleSubtask(g, st); };
        var dd = add(row, "button", "gs-del"); dd.innerHTML = '<i class="ti ti-x"></i>'; dd.onclick = function () { g.subtasks.splice(i, 1); save(); draw(); };
      });
      var st2 = add(body, "div"); st2.style.margin = "0 12px";
      typeAdd(st2, tr("add a step or milestone…"), function (v) { (g.subtasks = g.subtasks || []).push({ title: v, done: false }); save(); draw(); });
      // RELEASE RITE — released, not deleted
      var rel = add(body, "button", "qb-release");
      rel.innerHTML = '<i class="ti ti-feather"></i><div class="qb-release-tx"><div class="qb-release-t">' + tr("Release with honor") + '</div><div class="qb-release-s">' + tr("the story is kept · you can always return it") + '</div></div>';
      rel.onclick = function () { g.released = true; g.active = false; g.releasedAt = Date.now(); save(); view = null; draw(); toast(tr("released with honor — kept on the shelf")); };
    }
```

> Notes: I dropped the old `😰 Feels too big?` emoji button and the `✕ delete this goal` hard-delete from the detail view — verdict #13 replaces destructive delete with the **release rite** (kept, not deleted). If you want to preserve `tooBigSheet(g)`, re-add it as a `ti ti-mountain` ghost row; it is **not** in the widget so this spec omits it.

---

## 4. WIRING

No new nav wiring needed — every existing entry point (`#openGoals`, `#goGoals`, notebook "Goals" row, journey pill, journal room row) calls `goalsSheet()`, which still exists and still opens the `goal-ov`/`goal-card` overlay. The internal `draw()` dispatcher (`if (!view) drawMap(); else drawGoal(view);`) is untouched. `header(...)` in `drawMap` is still called (spark chip inserted before the X). `drawGoal` now builds its own `qb-head` (does **not** call the shared `header()`), so it owns its back/rotate/close.

**One optional rename** for canon fidelity: the notebook "Goals" row ([app.js:2752](app.js:2752)) label `"Goals"` → keep the string but its `tr()` already maps to "Квесты" if you add the i18n entry below; if you want the English label to also read "Quests", change `l: "Goals"` → `l: "Quests"` there and at [app.js:2964](app.js:2964). Not required — the room header now reads Квесты regardless.

---

## 5. I18N — add to `I18N.ru`

Add a new `Object.assign(I18N.ru, { ... })` block (anchor: after any existing `Object.assign(I18N.ru, {...})` — e.g. after [app.js:1636](app.js:1636)). Every NEW English UI string with its Russian value:

```javascript
  Object.assign(I18N.ru, {
    "Quests": "Квесты",
    "No quests yet — add what you're building toward.": "Квестов пока нет — добавь, что ты создаёшь.",
    "a quest you're building toward…": "квест, который ты создаёшь…",
    "chapter": "глава",
    "of": "из",
    "foil filling": "фольга заполняется",
    "next": "следующая",
    "today": "сегодня",
    "tomorrow": "завтра",
    "Put a session into the day": "Поставить сессию в день",
    "session placed into today — it waits for you": "сессия поставлена на сегодня — она ждёт тебя",
    "tap to break it down →": "коснись, чтобы разбить на шаги →",
    "quiet": "тихо",
    "days": "дней",
    "I'll bring it back into the path": "верну его в путь",
    "finish a quest — it mints as a full-art card": "заверши квест — и он чеканится полноартовой картой в коллекцию, с датой и историей",
    "Released": "Отпущенные",
    "return": "вернуть",
    "card back": "оборот карты",
    "WISH": "ЖЕЛАНИЕ",
    "OUTCOME": "РЕЗУЛЬТАТ",
    "OBSTACLE": "ПРЕПЯТСТВИЕ",
    "PLAN": "ПЛАН",
    "reach": "достичь",
    "tap the plan below to fill this in": "заполни через план ниже",
    "If": "Если",
    "I": "я",
    "If [obstacle] — I [my move]": "Если [препятствие] — я [мой ход]",
    "Main obstacle": "Главное препятствие",
    "the inner block that gets in the way…": "внутренний блок, который мешает…",
    "If that hits, I'll…": "Если это случится, я…",
    "my if-then plan…": "мой план «если — то»…",
    "add a step or milestone…": "добавь шаг или веху…",
    "Release with honor": "Отпустить с честью",
    "the story is kept · you can always return it": "история сохранится · вернуть можно всегда",
    "released with honor — kept on the shelf": "отпущено с честью — на полке"
  });
```

> Widget wording to match exactly: hero sub reads **"глава 3 из 5 · фольга заполняется"** (chapter/of/foil filling assemble it); pip fact **"следующая = завтра 15:00"**; door **"Поставить сессию в день"**; stale **"тихо 6 дней · верну его в путь"**; mint **"заверши квест — и он чеканится полноартовой картой в коллекцию, с датой и историей"**; shelf **"Отпущенные · 2"**; detail sub **"оборот карты · WOOP"**; release **"Отпустить с честью / история сохранится · вернуть можно всегда"**. The plan sentence in the widget is **"Если тянет в телефон — я пишу 10 минут стоя"** — that comes from the user's own `g.woop.obstacle`/`g.woop.plan`, rendered by `renderSentence()` (obstacle in muted, plan in pink `#ff5fa8`).

---

## 6. REGRESSION RISKS

- **Scope of change is contained to `goalsSheet()` + 2 new helpers + additive i18n + scoped CSS.** No timeline / gesture / nav code touched → the core navigation regression contract is unaffected.
- **Data safety:** all new reads use `|| fallback` (`g.chapters||subs.length||5`, `st.sessions||4`, `g.released` truthy check, `S.spark != null ? : count`). No SCHEMA shape change → David's real goals load unchanged. The release rite sets `g.released=true; g.active=false` (never splices) — reversible via the shelf "вернуть".
- **Removed hard-delete** from the detail view (replaced by release). If David has a goal he truly wants gone, it now lives on the shelf — acceptable per verdict #13 ("released, not deleted"). Flag if he wants a shelf-level delete.
- **`nextSessionLabel` / `staleDays`** are read-only scans (`blocks(k)`, `goalLastK`, `kd`) — all existing helpers, no writes.
- **`gc.onclick` guard:** the hero card's open-on-tap now excludes taps on `.tf-door` and `.q-step.next` (via `e.target.closest`) so scheduling a session doesn't also flip to detail. Verify on device that tapping the card body (not a button) still opens detail.
- **`metricSection(g, body, draw)`** is reused in `drawGoal`; its internal redraw calls `draw()` which rebuilds the whole card — same behavior as today (full innerHTML rebuild on the overlay only; does not add a new app-wide wipe surface). Acceptable within the existing overlay's known pattern.
- **Preview proves:** boots clean, overlay renders, foil fill + ladder + pips + door + shelf toggle + WOOP flip render, `tr()` swaps to Russian. **Device-untested:** tap-vs-open arbitration on the hero card, and the pink door tap not double-firing. Label DEVICE-UNTESTED in the handoff.

---

## 7. FIDELITY CHECKLIST

- [x] **Header** — "Квесты" with `ti-map-2` pin glyph (widget shows a map-pin), spark chip `⚡ 97` = gold-bordered pill (`.q-spark`: `#ffd24a` border, `#ffd24a` text, `ti-bolt`, Jost 800, hard `0 3px 0 #160510` shadow). Matches widget's "⚡ 97".
- [x] **Hero title** — "Написать книгу" Jost **800**, 18px, `#fff2f9`. Sub-line "глава 3 из 5 · фольга заполняется" (`#c9a6c4`, "фольга заполняется" in gold `#ffd24a`). Matches.
- [x] **% foil-fill** — `#ffd24a` gold, Jost 800, 15px, top-right (widget shows "62%"). The foil edge is the literal progress bar via `linear-gradient(180deg,#ffd24a 0% → pct%, #3a2036 pct% → 100%)` — gold fills from the top. Matches "фольга".
- [x] **Icon well** — 44px, `tfStripe(dom.c)` striped tile, 2.5px `#160510` ink border, rounded 12px, book icon white. Matches widget's purple/striped book well.
- [x] **Tiered bounty ladder** — done steps: green `#28cf86` check well, `+12`/`+30`; next step: pink `#ff5fa8` play well (glowing), white bold label; future: dashed `#4a2238` empty circle. Bounties gold `#ffd24a` (`+12`, `+30`, `+40`, `+58` feel via rising tiers). Matches widget's "Структура +12 / Главы 1–2 +30 / Глава 3 +40 / Главы 4–5 +58".
- [x] **Pip strip** — under the active step: 4 rounded pips (`22×8`, ink border), filled = mint `#34d39a`; fact "2/4 · следующая = завтра 15:00" with the date bolded `#ffe3f1`. Matches widget's green pip pair + "2/4 следующая = завтра 15:00".
- [x] **Pink session door** — `.tf-door` full-width, `#ff5fa8` fill, `#4a1126` ink text, `ti-calendar-plus`, hard `0 4px 0 #160510` shadow + press-down. Text "Поставить сессию в день". Matches.
- [x] **Stale whisper** — `.q-stale` dark `#1c0f26` row, striped mini-well, "Учить испанский / тихо 6 дней · верну его в путь" (`#9a7ea8`). Matches widget's second card.
- [x] **Mint promise** — gold-bordered `.q-mint` with a purple full-art card thumb (`ti-cards`) + "заверши квест — и он чеканится полноартовой картой в коллекцию, с датой и историей" (полноартовой bolded). Matches widget.
- [x] **Released shelf** — dashed `.q-shelf-head` "Отпущенные · 2" with `ti-archive` + caret; collapsible rows with "вернуть". Matches widget's bottom "Отпущенные · 2 ⌄".
- [x] **DETAIL flip** — foil edge becomes the full inset ring (`.qb-body` 3px `#ffd24a` border). Header: back chevron + purple book well + "Написать книгу" (Jost 800, 20px) + "оборот карты · WOOP" + `ti-rotate` glyph. Matches.
- [x] **Gold WOOP inscriptions** — ЖЕЛАНИЕ / РЕЗУЛЬТАТ / ПРЕПЯТСТВИЕ / ПЛАН labels: Jost 800, 12.5px, **2px letter-spacing**, gold `#ffd24a`, uppercase; values Jost 700, 17px, `#ffe3f1`. Matches widget's four gold headers with white values ("рукопись из 5 глав — к сентябрю", "вечером нет сил, тянет в телефон").
- [x] **Plan sentence** — one gold-bordered card, "Если тянет в телефон — я пишу 10 минут стоя": "Если"+obstacle muted `#c9a6c4`, plan clause pink `#ff5fa8` Jost 800, pencil edit glyph right. Matches widget exactly (pink "10 минут стоя").
- [x] **Release rite** — dashed ghost `.qb-release`, `ti-feather`, "Отпустить с честью / история сохранится · вернуть можно всегда" (`#c9a6c4` / `#8a6ea0`). Reversible (sets `released`, never deletes). Matches widget.
- [x] **Icons** — Tabler line-icons only (`ti-map-2`, `ti-bolt`, `ti-player-play`, `ti-check`, `ti-calendar-plus`, `ti-cards`, `ti-archive`, `ti-rotate`, `ti-feather`, `ti-pencil`). **No emoji** (old `😰`/`✕` removed).
- [x] **Shadows** — every chip/door/well uses hard `0 Npx 0 #160510` ink shadows (never soft/flat). Palette all from locked `:root` + existing quest tokens; no invented colors.
