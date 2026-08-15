# PLAN-DAY — paste-ready BUILD SPEC
Canon: `_specs/_epic-mockups/_widget-refs/plan-day.jpg`
Screen anchor: `shapeFlow(k)` @ `app.js:6776` · beat pickers via `bentoPicker` @ `app.js:6525` · order editor `orderStep` @ `app.js:6820` · commit `distributePlan` @ `app.js:2998` · timeline render `calendarView` @ `app.js:6064`.

This spec is **surgical and additive**. It layers the canon's five widgets onto the *existing* Big-3 staged plan flow — it does NOT rebuild `shapeFlow`/`bentoPicker`. Every new class is namespaced `pd-*` so nothing collides with `bento-*`/`big3-*`/`calblk`.

---

## 1. SUMMARY

**What the screen is.** The planning ritual. `shapeFlow(k)` runs a 4-beat staged picker (Energy → Work → Love → Everything-else via `BIG3` + `runElse`), each beat a `bentoPicker({domains,…})` in scoped mode (`renderScoped`). Picks accumulate in `acc`, then `orderStep(k, acc)` lets you arrange, then `distributePlan(k, sel)` gap-fills them onto the real timeline (`calendarView`) and the overlay closes.

**How it's reached today.** `shapeFlow(todayK())` is called from: the timeline meta-button (`app.js:2941`), journey "Plan your day" node (`app.js:1004,1020,1023,2015`), tracker-full "Plan my day" (`app.js:4411,4413`), the cockpit empty-day door (`app.js:4837,4839`), and the old planDay sheet's Done (`app.js:3046`). We do NOT touch any of these entry points.

**What the canon adds (left panel, top→bottom):**
1. **Beat-pips header** — a 4-segment progress bar labelled `Энергия · Работа · Любовь · Остальное`, the current beat filled BLUE, done beats filled, future dim. Lives pinned in the `.bento-head`.
2. **Identity hero line** — `Ты сегодня —` / `Сосредоточенный` on a hairline-inset dark card, the identity word in the beat's jewel color. Replaces/augments `big3HeadNode`.
3. **v3 ignition chips** — the scoped bento chips, domain-tinted, chunky, checkable with a ✓ (already `actChip`; we only add the striped selected-fill so the selected chip reads like the widget's `Глубокая работа` diagonal-striped blue tile).
4. **Ember "ДАВНО СОБИРАЛСЯ" courage row** — the `opts.priority` ("been meaning to") list, reframed with a `ti-flame` label and warm bounty chips (dark plum fill + fire-orange inner hairline). Two chips in the widget: `Налоги`, `Портфолио`.
5. **LIVE MINI-TIMELINE STRIP** — `ДЕНЬ СОБИРАЕТСЯ` — a 56px compressed 08→24 rail pinned above `.bento-foot`, persistent across beats. Committed picks land as MATTE domain-tinted cells in their projected slots (dry-run of `distributePlan`'s gap-fill), beside a pink now-tick. Axis labels `08 12 16 20 24`.

**Right panel (the FINISH CASCADE)** — after `distributePlan` commits, the chosen blocks land staggered on a spring into the real timeline (matte), the now-line double-pulses, the first block gets a blue-hairline handshake + a live next-up line (`дальше: Глубокая работа · через 20 мин`), and one guardian seal line (`День собран — 5 дел. Увидимся на первом.`), then silence.

**FIX (verdict #8)** — the lived/earned morning block (`Зарядка`) currently reads MUDDY BROWN. Root cause: `calendarView` @ `app.js:6140` builds the fully-matched stripe by mixing the warm domain color into near-black `#160510` at 0.62/0.73 — warm hues (move-orange `#ff8a3a`, play-gold) desaturate through brown at that ratio. Fix = deepen toward a **cool jewel ink** per domain, not toward `#160510`, and lift saturation. Clean deepened jewel, never muddy.

---

## 2. CSS — add to `index.html`

All blocks below are ADD-only. Anchor by the unique existing line quoted.

### 2a. Beat-pips header + identity hero

**Insert after** (`index.html:918`):
```
  .big3-rwho{ color:#ffe3f1; font-size:14px; font-weight:700; margin-top:5px; }
```

```css
  /* PLAN-DAY beat progress pips — 4 segments, BLUE=plan (canon plan-day.jpg) */
  .pd-pips{ display:flex; align-items:flex-start; gap:7px; padding:2px 2px 9px; }
  .pd-pip{ flex:1; min-width:0; display:flex; flex-direction:column; gap:5px; }
  .pd-pip .pd-pbar{ height:5px; border-radius:3px; background:#3a1730; transition:background .28s var(--ease-settle); }
  .pd-pip.done .pd-pbar{ background:#2c6f9e; }                       /* completed beat — deepened blue */
  .pd-pip.on   .pd-pbar{ background:#36b3f0; box-shadow:0 0 0 1px #160510 inset; } /* current beat — full blue */
  .pd-pip .pd-plbl{ font-family:"Jost",sans-serif; font-weight:700; font-size:10.5px; letter-spacing:.3px; color:#7a5e72; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pd-pip.on   .pd-plbl{ color:#8fd4f7; font-weight:800; }
  .pd-pip.done .pd-plbl{ color:#b9a3b4; }

  /* identity hero line — hairline-inset dark card, jewel-word */
  .pd-hero{ background:#2a0d1e; border:2px solid #160510; border-radius:14px; box-shadow:inset 0 0 0 1px rgba(255,255,255,.03),0 3px 0 #160510; padding:15px 16px; margin:2px 0 13px; text-align:center; }
  .pd-hero .pd-h1{ font-family:"Jost",sans-serif; font-weight:800; font-size:19px; line-height:1.15; color:#ffe3f1; }
  .pd-hero .pd-h2{ font-family:"Jost",sans-serif; font-weight:800; font-size:22px; line-height:1.1; margin-top:2px; } /* jewel color set inline */
  @keyframes pdWordGlow{ 0%{ filter:brightness(1); } 40%{ filter:brightness(1.5); } 100%{ filter:brightness(1); } }
  .pd-hero .pd-h2.glow{ animation:pdWordGlow .9s var(--ease-settle) 1; }
```

### 2b. Ember "been meaning to" courage row

**Insert after** (`index.html:873`):
```
  .bento-qlbl{ font-family:"Jost",sans-serif; font-weight:800; font-size:12px; letter-spacing:1px; color:#ff8fc0; text-transform:uppercase; margin-right:2px; } /* AUDIT P1 */
```

```css
  /* PLAN-DAY ember courage row — «ДАВНО СОБИРАЛСЯ» warm bounty chips (canon) */
  .pd-ember-lbl{ color:#ff8a3a; }                                    /* the section label goes fire-orange */
  .bchip.pd-ember{ background:#2c1608 !important; color:#ffcf9a !important; border:1.5px solid #160510 !important;
    box-shadow:inset 0 0 0 1px rgba(255,138,58,.55), 0 3px 0 #160510; }   /* warm bounty: deep-ember fill + 1px inner fire hairline */
  @keyframes pdEmber{ 0%{ box-shadow:inset 0 0 0 1px rgba(255,138,58,.55),0 3px 0 #160510; }
    45%{ box-shadow:inset 0 0 0 2px rgba(255,170,80,.95),0 0 12px rgba(255,138,58,.5),0 3px 0 #160510; }
    100%{ box-shadow:inset 0 0 0 1px rgba(255,138,58,.55),0 3px 0 #160510; } }
  .bchip.pd-ember.flick{ animation:pdEmber .22s var(--ease-settle) 1; }
```

### 2c. Selected chip = striped ignition (v3)

The canon's selected `Глубокая работа` chip is a diagonal-striped domain tile (not a flat fill). The existing `.bchip.sel` only adds a gold ring. Add a striped fill for the scoped plan chips.

**Insert after** (`index.html:890`):
```
  .bchip.sel{ box-shadow:0 0 0 3px #ffe3a0; transform:scale(1.05); }
```

```css
  /* PLAN-DAY selected chip — v3 ignition: keep the gold ring, add domain diagonal stripes (canon «Глубокая работа») */
  .bento-card.bento-sheet .bchip.sel.pd-lit{ background-image:repeating-linear-gradient(-45deg, rgba(255,255,255,.16) 0 5px, transparent 5px 11px); }
```
*(`.pd-lit` is applied in JS only for scoped/plan pickers so the tracker's own chip selection is untouched. The stripes ride ON TOP of the solid domain fill `actChip` already sets.)*

### 2d. LIVE mini-timeline strip

**Insert after** (`index.html:913`):
```
  .bento-skip{ flex:none; background:#48122f; color:#e8b8d2; border:2px solid #160510; border-radius:13px; padding:12px 13px; font-family:"Jost",sans-serif; font-size:13px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:5px; }
```

```css
  /* PLAN-DAY live mini-timeline strip — «ДЕНЬ СОБИРАЕТСЯ» (canon) */
  .pd-strip{ flex:none; padding:8px 14px 6px; border-top:2px solid #160510; background:#26091a; }
  .pd-strip-lbl{ font-family:"Jost",sans-serif; font-weight:800; font-size:11px; letter-spacing:1.3px; text-transform:uppercase; color:#c98aa8; margin-bottom:7px; }
  .pd-rail{ position:relative; height:44px; border-radius:11px; background:#1c0512; border:2px solid #160510; overflow:hidden; }
  .pd-cell{ position:absolute; top:5px; bottom:5px; border-radius:7px; border:1.5px solid #160510;
    box-shadow:0 2px 0 #160510; display:flex; align-items:center; justify-content:center; color:#fff2f9; font-size:12px;
    transition:left .18s var(--ease-spring), width .18s var(--ease-spring), opacity .16s; } /* matte cells — no shine */
  @keyframes pdLand{ from{ transform:translateY(-8px) scale(.9); opacity:0; } to{ transform:none; opacity:1; } }
  .pd-cell.land{ animation:pdLand .32s var(--ease-spring) both; }
  .pd-nowtick{ position:absolute; top:-2px; bottom:-2px; width:2px; background:#ff5fa0; box-shadow:0 0 6px rgba(255,95,160,.7); z-index:3; border-radius:2px; }
  .pd-nowtick::before{ content:""; position:absolute; top:-3px; left:-2px; width:6px; height:6px; border-radius:50%; background:#ff5fa0; }
  .pd-axis{ display:flex; justify-content:space-between; margin-top:5px; font-family:"Jost",sans-serif; font-weight:700; font-size:10px; color:#7a5e72; }
```

### 2e. Finish-moment: now-line double-pulse, first-block handshake, seal line

**Insert after** (`index.html:832`) — right after the `bentoIn` keyframe (this is the CSS block near the bento overlay animations):
```
  @keyframes bentoIn{ from{ transform:translateY(8px) scale(.84); opacity:0; } to{ transform:none; opacity:1; } } /* bouncier pop (v654) — every menu using bentoIn springs in */
```

```css
  /* PLAN-DAY finish moment */
  @keyframes pdNowPulse{ 0%{ box-shadow:0 0 0 0 rgba(255,95,160,.6); } 50%{ box-shadow:0 0 0 5px rgba(255,95,160,0); } 100%{ box-shadow:0 0 0 0 rgba(255,95,160,0); } }
  .nowline.pd-pulse{ animation:pdNowPulse .5s var(--ease-settle) 2; } /* DOUBLE pulse then rest */
  @keyframes pdHandshake{ 0%,100%{ box-shadow:0 3px 0 #160510; } 50%{ box-shadow:inset 0 0 0 1px #36b3f0,0 3px 0 #160510; } }
  .calblk.pd-handshake{ animation:pdHandshake .7s var(--ease-settle) 2; } /* first block: blue hairline breath ×2 */
  /* guardian seal line — one non-toast line, then silence */
  .pd-seal{ position:fixed; left:14px; right:14px; bottom:calc(env(safe-area-inset-bottom,0px) + 78px); z-index:40;
    display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:15px;
    background:#22091a; border:2px solid #160510; box-shadow:0 6px 18px rgba(0,0,0,.45);
    font-family:"Jost",sans-serif; font-weight:700; font-size:14px; color:#ffe3f1;
    animation:sheetUp .34s var(--ease-spring) both; }
  .pd-seal .pd-seal-orb{ flex:none; width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center;
    background:#ff5fa0; color:#160510; border:2px solid #160510; }
  .pd-seal.out{ opacity:0; transform:translateY(10px); transition:opacity .4s, transform .4s; }
```

---

## 3. RENDER JS — `app.js`

### 3a. Beat-pips + identity hero: rebuild `big3HeadNode`

The pips need to know which beat is active, so pass the beat index through. **Replace the whole function** `big3HeadNode` (`app.js:6768–6775`) with:

```javascript
  // a beat's title card pushed into the bento body — CANON plan-day: beat-pips + identity hero (David 2026-07-03)
  function big3HeadNode(beat, idx) {
    var wrap = document.createElement("div"); wrap.className = "big3-remind pd-headwrap";
    wrap.style.cssText = "background:none;border:none;padding:0;margin:0 0 4px;";
    // BEAT PIPS — 4 segments: Energy · Work · Love · Else. BLUE = plan.
    var STEPS = [{ l: tr("Energy") }, { l: tr("Work") }, { l: tr("Love") }, { l: tr("The rest") }];
    var ci = (typeof idx === "number") ? idx : 0;
    var pips = add(wrap, "div", "pd-pips");
    STEPS.forEach(function (s, i) {
      var p = add(pips, "div", "pd-pip" + (i < ci ? " done" : "") + (i === ci ? " on" : ""));
      add(p, "div", "pd-pbar"); add(p, "div", "pd-plbl", s.l);
    });
    // IDENTITY HERO — «Ты сегодня — <identity>», the word in the beat's jewel color
    var r = big3Reminder(beat);
    var idents = ((((S.bk || {})[todayK()] || {}).am || {}).identity) || ((S.profile && S.profile.todayIdentity) || []);
    var word = idents.length ? idents[0] : (r.line ? null : null);
    var jewel = r.vc || "#8fd4f7";
    var hero = add(wrap, "div", "pd-hero");
    add(hero, "div", "pd-h1", tr("You're today —"));
    if (word) { var h2 = add(hero, "div", "pd-h2 glow"); h2.textContent = word; h2.style.color = jewel; }
    else if (r.line) { var h2b = add(hero, "div", "pd-h2 glow"); h2b.style.color = jewel; h2b.innerHTML = '<i class="ti ' + beat.emoji + '"></i> ' + esc(r.line.replace(/^\S+\s/, "")); }
    setTimeout(function () { var g = hero.querySelector(".glow"); if (g) g.classList.remove("glow"); }, 950);
    return wrap;
  }
```

**Wire the index through** in `shapeFlow.runBeat` — change the `headNode` arg (`app.js:6790`):
```javascript
        multi: true, domains: beat.domains, headNode: big3HeadNode(beat), preselect: accTitlesFor(beat.domains),
```
to:
```javascript
        multi: true, domains: beat.domains, headNode: big3HeadNode(beat, i), preselect: accTitlesFor(beat.domains),
```
And in `runElse` (`app.js:6803`) pass the else index so pips show 4/4 — replace its inline `headNode:(function(){…})()` with:
```javascript
        multi: true, domains: ELSE_DOMAINS, preselect: accTitlesFor(ELSE_DOMAINS), headNode: big3HeadNode({ emoji: "ti-sparkles", virtue: "zest" }, 3),
```

### 3b. `renderScoped` must render the head node, ember row, lit chips, and the strip

`renderScoped` (`app.js:6562`) currently does NOT append `opts.headNode` (only `renderOverview` does), and its priority row uses the plain `bento-qlbl`. Patch three spots inside `renderScoped`:

**(i)** At the very top of `renderScoped` body, **insert after** `app.js:6563` (the `// reminder card removed…` line is the first statement; add BEFORE the search build):
```javascript
      if (opts.headNode) body.appendChild(opts.headNode);
```

**(ii)** The "been meaning to" block (`app.js:6571`) — replace it with the ember-framed version:
```javascript
      if (opts.priority && opts.priority.length) { var pr = add(body, "div", "bento-pinned"); var _bmt = add(pr, "span", "bento-qlbl pd-ember-lbl"); _bmt.innerHTML = '<i class="ti ti-flame"></i> ' + tr("been meaning to"); opts.priority.forEach(function (m) { var _c = actChip(actOf(m), pr, true); _c.classList.add("pd-ember"); _c.addEventListener("click", function () { _c.classList.remove("flick"); void _c.offsetWidth; _c.classList.add("flick"); }); }); }
```

**(iii)** Mark scoped chips as `pd-lit` so the striped selected-fill applies. In `actChip` (`app.js:6546`) the chip element is `s`; the cleanest additive hook is: at the end of `renderScoped`, after `drawResults(searchQ.trim());` (`app.js:6595`), add a class-tag pass — but simpler and race-free: append `.pd-lit` when the sheet is a scoped plan sheet. Add this ONE line just after the `var ov = add(document.body, "div", "bento-ov bento-sheet");` line (`app.js:6533`):
```javascript
    var _isPlan = !!(opts.domains && opts.domains.length);
```
then in `actChip` change the class string build (`app.js:6546`) — the `add(container,"span","bchip"…)` — append `+ (_isPlan ? " pd-lit" : "")` inside that concatenation. Exact edit: find
```javascript
      var s = add(container, "span", "bchip" + (big ? " big" : "") + (soft ? " soft" : "") + (on ? " sel" : "") + (a.domain === "drift" ? " vice" : "") + (pin ? " pinned" : ""));
```
and append ` + (_isPlan ? " pd-lit" : "")` before the closing `)`:
```javascript
      var s = add(container, "span", "bchip" + (big ? " big" : "") + (soft ? " soft" : "") + (on ? " sel" : "") + (a.domain === "drift" ? " vice" : "") + (pin ? " pinned" : "") + (_isPlan ? " pd-lit" : ""));
```

**(iv) THE STRIP.** Add a persistent live mini-timeline below the foot. In `bentoPicker`, after `renderFoot()` builds `foot`, mount a strip that reflects `sel`. Add a helper + call. **Insert after** `renderFoot`'s closing brace (`app.js:6646`, the line `    }` that ends `renderFoot`):

```javascript
    // PLAN-DAY LIVE MINI-TIMELINE STRIP — matte dry-run of distributePlan over sel + existing blocks (David 2026-07-03)
    var pdStripEl = null;
    function pdSyncStrip() {
      if (!(opts.domains && opts.domains.length)) return; // scoped plan sheets only
      if (!pdStripEl) { pdStripEl = add(card, "div", "pd-strip"); add(pdStripEl, "div", "pd-strip-lbl", tr("Day taking shape")); var rl = add(pdStripEl, "div", "pd-rail"); var ax = add(pdStripEl, "div", "pd-axis"); ["08", "12", "16", "20", "24"].forEach(function (h) { add(ax, "span", "", h); }); pdStripEl._rail = rl; if (foot && foot.parentNode === card) card.insertBefore(pdStripEl, foot); }
      var rail = pdStripEl._rail; rail.innerHTML = "";
      var DAY0 = 8 * 60, DAY1 = 24 * 60, span = DAY1 - DAY0;
      function x(m) { return Math.max(0, Math.min(100, (m - DAY0) / span * 100)); }
      // existing committed blocks = dim slivers
      try { blocks(opts.planK || todayK()).forEach(function (b) { var bs = hm(b.time), d = DOM[domainOf(b)] || DOM.focus; var c = add(rail, "div", "pd-cell"); c.style.left = x(bs) + "%"; c.style.width = Math.max(1.5, ((b.mins || 30) / span * 100)) + "%"; c.style.background = mixHex(d.c, "#160510", 0.8); c.style.opacity = ".5"; }); } catch (e) {}
      // dry-run distributePlan gap-fill over the current sel (never lies)
      var occ = []; try { blocks(opts.planK || todayK()).forEach(function (b) { var s = hm(b.time); occ.push({ s: s, e: s + (b.mins || 30) }); }); } catch (e) {}
      occ.sort(function (a, b) { return a.s - b.s; });
      var cursor = (((opts.planK || todayK()) === todayK()) ? Math.max(DAY0, logicalNowMin()) : DAY0);
      function slot(from, dur) { var t = from, g = 0; while (g++ < 200) { var ok = true; for (var i = 0; i < occ.length; i++) { if (t < occ[i].e && t + dur > occ[i].s) { t = occ[i].e; ok = false; break; } } if (ok) return t; } return t; }
      sel.forEach(function (a) { var dom = domainOf(a), d = DOM[dom] || DOM.focus, mins = a.mins || 30; var st = Math.min(1410, slot(cursor, mins)); occ.push({ s: st, e: st + mins }); occ.sort(function (p, q) { return p.s - q.s; }); cursor = st + mins;
        var c = add(rail, "div", "pd-cell land"); c.style.left = x(st) + "%"; c.style.width = Math.max(3.5, (mins / span * 100)) + "%"; c.style.background = mixHex(d.c, "#160510", 0.42); c.style.color = "#fff2f9"; if (mins / span * 100 > 6) c.innerHTML = tiIcon(a); });
      // now-tick
      if ((opts.planK || todayK()) === todayK()) { var nt = add(rail, "div", "pd-nowtick"); nt.style.left = x(logicalNowMin()) + "%"; }
    }
```

Then call `pdSyncStrip()` from the two places that mutate `sel`: inside `commit` (`app.js:6543`) — after `render(); renderFoot();` in the multi branch, and once at the end of `bentoPicker`. Exact edits:

In `commit` (`app.js:6543`), change:
```javascript
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); } else { close(); opts.onPick(a); } }
```
to append `pdSyncStrip();`:
```javascript
    function commit(a) { if (multi) { var i = sel.indexOf(a); if (i >= 0) sel.splice(i, 1); else sel.push(a); render(); renderFoot(); pdSyncStrip(); } else { close(); opts.onPick(a); } }
```

At the bottom of `bentoPicker`, change (`app.js:6694`):
```javascript
    render(); renderFoot();
```
to:
```javascript
    render(); renderFoot(); pdSyncStrip();
```

**Pass `planK` through** so the strip's now-tick/gap-fill use the right day. In `shapeFlow.runBeat`'s `bentoPicker({…})` call add `planK: k,` (e.g. beside `multi: true`), and likewise in `runElse`. Both are one-key additions to the existing options object.

### 3c. Recolor the flow doors BLUE (canon: `Дальше →` is solid blue)

In `renderFoot` (`app.js:6644`) the go button is the green `.bento-go`. For scoped plan sheets it should be blue (`Далее/Дальше`, plan energy). Add after `var b = add(foot, "button", "bento-go");` in `renderFoot`:
```javascript
      if (opts.domains && opts.domains.length) { b.style.background = "#36b3f0"; b.style.color = "#08283c"; }
```
Green stays reserved for tracking (`orderStep`'s commit door stays green — it's the last-mile "add to today", still plan; if David wants that blue too it's a one-line follow-up, but the canon `Дальше` shown is the beat-advance, which this covers).

### 3d. FINISH CASCADE — now-line double-pulse + first-block handshake + seal line

`distributePlan` (`app.js:2998`) ends with `reflow(k); save(); pendingScrollNow = true; renderToday(); buildPull(); toast("📋 placed on …");`. **Replace that final line** (`app.js:3031`):

```javascript
    reflow(k); save(); pendingScrollNow = true; renderToday(); buildPull(); pdFinishCascade(k, sel);
```

Then add the new function immediately **after** `distributePlan`'s closing brace (`app.js:3032`):

```javascript
  // PLAN-DAY FINISH MOMENT (David 2026-07-03): cascade already fires via revealTimeline/pendingScrollNow;
  // here we double-pulse the now-line, breathe the first upcoming block blue, and drop one guardian seal line — then silence. No toast, no points.
  function pdFinishCascade(k, sel) {
    try {
      setTimeout(function () {
        cascadeTimelineBlocks();
        var pb = el("pullBody"), cur = pb && pb.querySelector(".day-card.cur .day-cardscroll");
        var nl = cur && cur.querySelector(".nowline");
        if (nl) { nl.classList.remove("pd-pulse"); void nl.offsetWidth; nl.classList.add("pd-pulse"); setTimeout(function () { nl.classList.remove("pd-pulse"); }, 1200); }
        // first upcoming block within ~45min → blue hairline handshake
        var now = logicalNowMin(), first = null, fbs = 1e9;
        blocks(k).forEach(function (b) { if (!b.title) return; var bs = hm(b.time); if (bs >= now - 1 && bs < fbs) { fbs = bs; first = b; } });
        if (first && fbs - now <= 45 && cur) { var cards = cur.querySelectorAll(".calblk"); for (var i = 0; i < cards.length; i++) { var c = cards[i]; if (c.textContent && c.textContent.indexOf(first.title) >= 0) { c.classList.add("pd-handshake"); setTimeout((function (cc) { return function () { cc.classList.remove("pd-handshake"); }; })(c), 1500); break; } } }
      }, 60);
      // guardian seal line — one line, 2.5s, then dissolve
      var n = (sel || []).length;
      var seal = document.createElement("div"); seal.className = "pd-seal";
      var orb = document.createElement("div"); orb.className = "pd-seal-orb"; orb.innerHTML = '<i class="ti ti-sparkles"></i>'; seal.appendChild(orb);
      var txt = document.createElement("div"); txt.textContent = tr("Day is set — ") + n + " " + tr("things. See you at the first."); seal.appendChild(txt);
      document.body.appendChild(seal);
      setTimeout(function () { seal.classList.add("out"); setTimeout(function () { seal.remove(); }, 420); }, 2500);
    } catch (e) {}
  }
```

*(This keeps the existing `revealTimeline`/`pendingScrollNow` cascade machinery — `renderToday()` already triggers the block cascade on the reveal path; we re-fire `cascadeTimelineBlocks()` explicitly here to guarantee it lands after this specific commit even when the timeline was already open. No new wipe surface — additive class toggles only.)*

### 3e. VERDICT #8 FIX — the lived (earned) morning block tint (never muddy brown)

`calendarView` @ `app.js:6139–6140` builds the fully-matched ("ok && !partial") deep-jewel stripe. The current formula mixes the domain color into `#160510` at 0.62/0.73 — warm hues brown out. Add a per-domain **cool jewel ink** and mix toward *that* instead, keeping more saturation.

**Add a helper** — insert after the `DOM` object closing (`app.js:409`, the line `  };`):
```javascript
  // JEWEL INK per domain — the cool deepener a lived/matched block darkens TOWARD (never #160510, which browns warm hues). Verdict #8 (David 2026-07-03).
  var DOM_JEWEL = { move:"#2a0e10", nourish:"#052a1f", focus:"#04202f", create:"#180a30", connect:"#2a0716", play:"#241400", restore:"#032428", upkeep:"#0e1626", drift:"#160510" };
  function jewelInk(dom) { return DOM_JEWEL[dom] || "#160510"; }
```

**Replace** the fully-matched stripe line (`app.js:6140`):
```javascript
        card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62) + "," + mixHex(D.c, "#160510", 0.62) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 9px," + mixHex(D.c, "#160510", 0.73) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 3px 0 #160510";
```
with (mix toward the cool jewel ink at a LIGHTER ratio so the hue stays a clean deepened jewel):
```javascript
        var _ji = jewelInk(dom); card.style.background = "repeating-linear-gradient(45deg," + mixHex(D.c, _ji, 0.5) + "," + mixHex(D.c, _ji, 0.5) + " 9px," + mixHex(D.c, _ji, 0.62) + " 9px," + mixHex(D.c, _ji, 0.62) + " 18px)"; card.style.borderColor = "#160510"; card.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.09),0 3px 0 #160510";
```
This is the ONE tint change verdict #8 asks for. For consistency apply the SAME `_ji` mix to the two other matched surfaces so the lived family is uniform (optional but recommended — same brown risk):
- the tracked-segment stripe `app.js:6155` (`_seg.style.background = "…#160510…"`),
- the partial matched-span stripe `app.js:6167` (`seg.style.background = "…#160510…"`),
- the REAL-lane matched stripe `app.js:6256` (`onp ? "repeating-linear-gradient(45deg," + mixHex(D.c, "#160510", 0.62)…`),
- the LIVE on-plan stripe `app.js:6289` (same `onp ?` ternary).
Each: swap the two `mixHex(D.c,"#160510",0.62)`→`mixHex(D.c,_ji,0.5)` and `0.73`→`0.62`, with `var _ji = jewelInk(dom);` at the top of that branch (6256/6289: define `_ji` just before the `card.style.background = drift ? …` line — only the `onp` stripe arm changes, leave the `drift`/ghost arms on `#160510`). Verify with grep after: `grep -n 'mixHex(D.c, "#160510", 0.62)' app.js` should return ONLY non-matched surfaces. (Leave the future/ghost/miss tints alone — those are correctly cool-dark already.)

**All five matched surfaces (6140, 6155, 6167, 6256, 6289) must move together** — otherwise the lived family splits (a matched block reads jewel in the plan lane but brown in the real lane). This is the full verdict-#8 fix; 6140 alone is the minimum but leaves the real-lane version muddy.

---

## 4. WIRING

- **No new entry point.** All 8 existing `shapeFlow(k)` callers are untouched; the widgets ride inside the flow they already open.
- **Beat pips** are driven by the beat index `i` (0–3) already threaded through `runBeat`/`runElse`.
- **Strip** mounts once per `bentoPicker` (scoped plan sheets only, gated on `opts.domains`), re-syncs on every `commit` and on open. It reads `blocks(opts.planK)` + `sel` — pure read, no state mutation, never lies (mirrors `distributePlan`'s exact gap-fill loop).
- **Finish cascade** replaces only the trailing `toast(…)` of `distributePlan` with `pdFinishCascade`. The `renderToday()`/`buildPull()` reveal path already fires the block cascade; `pdFinishCascade` layers the now-line double-pulse + handshake + seal on top.
- **Verdict #8** is a pure per-domain recolor inside `calendarView`; no geometry, no status logic touched — regression-safe.

---

## 5. I18N — new English → Russian (add to `I18N.ru`)

Add these to any `Object.assign(I18N.ru, {…})` block (e.g. `app.js:1319`). All are surfaced via `tr()`:

```javascript
    "Energy": "Энергия",
    "Work": "Работа",
    "Love": "Любовь",
    "The rest": "Остальное",
    "You're today —": "Ты сегодня —",
    "been meaning to": "давно собирался",
    "Day taking shape": "День собирается",
    "Day is set — ": "День собран — ",
    "things. See you at the first.": "дел. Увидимся на первом.",
```

Notes for the integrator:
- The canon spells `Остальное`, `Энергия`, `Работа`, `Любовь` in FULL on the pips — no abbreviations (matches CSS `text-overflow:ellipsis` only as a safety net; at 4-across on a phone all four fit at 10.5px Jost).
- Identity word `Сосредоточенный` comes from the user's own `am.identity[0]` / `todayIdentity[0]` — it is user data, not a hardcoded string, so no i18n entry (it's already Russian if the user set it in RU). The `Сосредоточенный` in the widget is illustrative.
- `«ДАВНО СОБИРАЛСЯ»` renders uppercase via the existing `.bento-qlbl { text-transform:uppercase }`; the dict value is lowercase `давно собирался` (correct — CSS uppercases it).
- Seal line composes as `День собран — 5 дел. Увидимся на первом.` — verify the two-part split reads naturally after `tr()`; if the count placement feels off in RU, make it one templated string instead (`"Day is set — N things…"` with a `.replace`).

---

## 6. REGRESSION RISKS

1. **`big3HeadNode` signature change** — now takes `(beat, idx)`. Only two callers (`runBeat`, `runElse`), both updated here. `idx` is optional (defaults to 0) so a missed caller degrades gracefully to pips showing beat-0 rather than crashing. **Safe path: grep `big3HeadNode(` — confirm exactly 2 call sites after the edit.**
2. **`renderScoped` now appends `opts.headNode`** — previously it didn't, so the identity/pips only appeared via `renderOverview`. This is the intended fix (scoped plan sheets are what `shapeFlow` uses). Verify the head isn't ALSO appended twice on the overview path (it isn't — `renderScoped` and `renderOverview` are mutually exclusive in `render()`).
3. **`.pd-lit` striped fill** is gated to `bento-sheet` scoped plan chips via the CSS selector `.bento-card.bento-sheet .bchip.sel.pd-lit`. The tracker's own picker (`renderOverview`, non-scoped) never gets `_isPlan=true`, so its chip selection is unchanged. **Confirm on the track-now bento that selected chips still read as solid fill + gold ring, no stripes.**
4. **Strip = the mini-timeline landmine.** It's a READ-ONLY dry-run — it must never call `save()`/`reflow()`/`renderToday()`. It only reads `blocks()` + `sel`. Regression contract item: it does NOT run a second day-nav model (it's a static compressed bar, no scroll, no pager). **DEVICE-UNTESTED: the strip's matte-land springs and the now-tick position are preview-provable (they boot + layout), but the "lands into projected slot" feel vs the real `distributePlan` is gesture-adjacent — confirm the projected slot matches where the block actually lands after commit.**
5. **Finish cascade re-fires `cascadeTimelineBlocks()`** — this is idempotent (removes+re-adds the `casc-blk` class, self-cleans). Risk: double-cascade if the reveal path also fires it in the same frame → harmless (class re-set restarts once). The now-line `.pd-pulse` and `.pd-handshake` are additive classes with self-clearing timeouts. **The now-line double-pulse and handshake are DEVICE-UNTESTED for feel — preview proves they attach + animate; confirm timing on the phone.**
6. **Verdict #8 tint** — pure color math via `mixHex` (already used everywhere). No status/geometry change. Risk = the new jewel-ink hexes read too dark/too saturated on a real screen. **This is exactly what David screenshots — ship it, compare `Зарядка` (move) + a focus block against the widget's clean-deepened-jewel bar.** If `move` still leans warm-brown, push its `DOM_JEWEL.move` cooler (toward `#1e0a14`) — it's one hex.
7. **Seal line z-index** — `z-index:40`, below the bento-ov (z95) but above the timeline. It appears AFTER the overlay closes (distributePlan already removed it), so no stacking clash. Fixed-position; auto-removes in 2.9s.

**Honest verification note (constitution):** preview proves boot/layout/no-JS-errors and non-gesture taps (pips render, hero shows, chips toggle, strip cells lay out, seal line appears, tint recolors). Preview does NOT prove the cascade/pulse/handshake *feel* or the strip's land-spring on device. Report as **"boots clean in preview; cascade + strip land-feel + tint-on-real-screen are DEVICE-UNTESTED — confirm on your phone."**

---

## 7. FIDELITY CHECKLIST (vs `plan-day.jpg`)

- [ ] **Beat pips**: 4 segments, labels `Энергия · Работа · Любовь · Остальное` in full, Jost 700/800, ~10.5px. Current beat bar solid `#36b3f0` (blue=plan), done beats deepened blue `#2c6f9e`, future `#3a1730`. Widget shows Energy filled bright, Work filled bright (2 done), Love + Остальное dim — matches "on"+"done" logic. ✅ blue, never gold.
- [ ] **Identity hero**: `Ты сегодня —` (Jost 800, 19px, `#ffe3f1`) over `Сосредоточенный` (Jost 800, 22px) in the beat's jewel color (Work→`#8fd4f7`/focus-light). Card = `#2a0d1e` fill, `2px #160510` ink border, `0 3px 0 #160510` hard shadow + 1px inner white hairline. One glow pulse on entry, then rest. Matches widget's inset dark card with blue word.
- [ ] **v3 ignition chips**: chunky, `1.5px #160510` ink border, domain-solid fill when selected, ✓ appended (existing `actChip`). Selected chip adds `-45deg` white diagonal stripes (`.pd-lit`) — matches widget's striped `Глубокая работа` blue tile. Unselected chips = solid domain fill (`Письма` blue, `Дизайн` purple, `Учёба` blue) — existing behavior. ✅ gold ring on selection (existing `.bchip.sel`).
- [ ] **Ember courage row**: label `ti-flame` + `ДАВНО СОБИРАЛСЯ` in fire-orange `#ff8a3a` (uppercased by CSS). Chips = deep-ember `#2c1608` fill, `#ffcf9a` warm text, 1px inner fire hairline `rgba(255,138,58,.55)`, `0 3px 0 #160510` hard shadow. Two chips (`Налоги` w/ ti-receipt, `Портфолио` w/ ti-message) — matches widget. Single 220ms ember flick on pick. ✅ warm, not preachy.
- [ ] **Live mini-timeline strip**: label `ДЕНЬ СОБИРАЕТСЯ` (Jost 800, 11px, `#c98aa8`, letterspaced). 44px rail `#1c0512` fill + `2px #160510` border, 11px radius. Committed picks = MATTE domain cells (`mixHex(D.c, jewelInk, .42)`, hard `0 2px 0 #160510` shadow, NO shine) sliding into projected slots. Pink now-tick `#ff5fa0` 2px w/ dot cap + glow. Axis `08 12 16 20 24` Jost 700 10px `#7a5e72`. Matches widget's blue focus cell + orange move cell + dim slivers beside the pink tick.
- [ ] **Doors**: `Дальше →` = solid `#36b3f0` blue, ink border, hard `0 4px 0 #160510` shadow (existing `.bento-go` geometry, recolored). `пропустить` / Skip = ghost. ✅ green reserved for tracking start.
- [ ] **Finish cascade**: blocks land staggered on the v648 spring (`cascadeTimelineBlocks`, 60ms stagger, radiating from now-line), landing MATTE. Now-line `#ff5fa0` DOUBLE-pulses (`pdNowPulse ×2`) then rests. First upcoming block (≤45min) gets a 2× blue-hairline breath (`inset 0 0 0 1px #36b3f0`). Live next-up line = the cockpit's existing `дальше: … · через N мин` (updated by `renderToday`). Matches the right-panel widget (`дальше: Глубокая работа · через 20 мин`, `Зарядка` done+checked, now-line at 10:40).
- [ ] **Guardian seal line**: one non-toast pill, `#22091a` fill, `2px #160510` border, pink `ti-sparkles` orb, `День собран — 5 дел. Увидимся на первом.` (Jost 700, 14px, `#ffe3f1`). 2.5s then dissolves. NO points/confetti. Matches widget's bottom pink-orb line.
- [ ] **VERDICT #8 lived tint**: `Зарядка` (move) matched block darkens toward cool jewel ink `DOM_JEWEL.move #2a0e10` at .5/.62 (was `#160510` at .62/.73). Result = clean deepened orange-jewel, NOT muddy brown. Ink `#160510` border + gold-only-on-lived inset stays. Focus/nourish/etc. matched blocks use their own cool jewel ink — uniform lived family. ✅ jewel law: hues deepened, never muddied.
- [ ] **No emoji anywhere** — pips/hero/ember/strip/seal all Tabler `ti-*` (ti-flame, ti-sparkles, ti-receipt, ti-message, block icons via `tiIcon`). ✅
