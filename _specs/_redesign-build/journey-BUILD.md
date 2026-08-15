# journey — BUILD SPEC (1:1 to widget, verdict #11-12 fixes)

CANON: `_specs/_epic-mockups/journey_epic.html` (two phone frames — the TRAIL and the RETURN) + widget ref `_specs/_epic-mockups/_widget-refs/journey.jpg`.
This is a REFINEMENT, not a rewrite. The trail already renders. The two verdicts are geometry + one finish:

- **#11 (trail):** stones read disconnected — too small, too far apart, too far from the center thread. → **bigger stones, tighter vertical rhythm, smaller lateral offsets.**
- **#12 (the Return):** the prism card edge reads as a WHITE outline, not a rainbow. → **rework to Pokémon-HOLO (animated rainbow foil border).** Plus render the full Return sequence: dashed pause stone + «серии сохранены», the quiet-sea line, prism mint firing FROM the stone (rings + flying +N + gold dust).

Every element below is already keep-listed. Do NOT invent colors — the mockup's inline hexes are the canon (they intentionally use ink `#160510`, pink `#ff5fa8`, mint `#28cf86`, gold `#ffd24a`, blue `#36b3f0`, purple `#9a5cf0`; the existing journey CSS also hardcodes these, NOT the softer `:root` tokens — match the mockup/hardcoded set).

---

## 1. SUMMARY

**Screen:** the Journey trail — the full-screen `#journeyPath` pane (`index.html:1926`). It is the middle pane of the three-pane spine (Planner / Journey / Game), reached by the `#jpnJourney` nav button or `openJourney()` (`app.js:1860`). It renders via **`drawJourney(autoScroll)`** at `app.js:2101`, which fills `#jpTrail` with `banner()` / `trophy()` / `coin()` units built from `jpNodes()` (`app.js` ~890+). The header (`jpSub`, `jpSpark`, `jpProgFill`) and the node-pip gauge live in the `.jp-head` markup at `index.html:1926`.

The **Return** state is a special-case early-return inside `jpNodes()`: `S.away` → the `"away"` node (`app.js:897`); a 3-13 day gap → the `"gapreturn"` node (`app.js:905`). Both currently render as an ordinary `coin()` — this spec upgrades them to the canon dashed-pause-stone + quiet-sea line + holo prism return-stone sequence.

Font law confirmed: `.ju-t`/`.jc-t` use `var(--bub)` (Baloo 2) 800; timers/big numbers Jost 800; body Jost 600/700. Keep as-is.

---

## 2. CSS — add to index.html

### 2A. VERDICT #11 — tighten the trail geometry

The current rhythm: `.jp-node{padding:20px 0;width:200px}` (`index.html:225`), lateral offset `Math.sin(idx*0.72)*72` px (`app.js:2144`), bubble `96px` up-stones `86px` done-stones `80px`. Widget wants **bigger stones, tighter vertical air, smaller offsets.**

**Replace** the node-rhythm block. Anchor — find (`index.html:225`):
```css
  .jp-node{position:relative;display:flex;flex-direction:column;align-items:center;margin:0 auto;width:200px;padding:20px 0;} /* GRAND BUILD H2: air between stones — the mock breathes */
```
Replace with:
```css
  .jp-node{position:relative;display:flex;flex-direction:column;align-items:center;margin:0 auto;width:210px;padding:11px 0;} /* verdict #11: tighter vertical rhythm (20px→11px) so stones read connected */
```

**Enlarge the up/done stones.** Anchor — find (`index.html:239`):
```css
  .jp-node.up .jp-bub{width:86px;height:86px;font-size:35px;}
```
Replace with:
```css
  .jp-node.up .jp-bub{width:92px;height:92px;font-size:38px;} /* verdict #11: bigger matte-future stone */
```

**Done-stone bigger + keep the ignite ring.** Anchor — find (`index.html:230`):
```css
  .jp-node.done .jp-bub{width:80px;height:80px;font-size:31px;border-color:#28cf86 !important;box-shadow:0 0 0 2.5px #28cf86, 0 0 14px rgba(40,207,134,.35), 0 3px 0 #0a4028 !important;}
```
Replace with:
```css
  .jp-node.done .jp-bub{width:88px;height:88px;font-size:34px;border-color:#28cf86 !important;box-shadow:0 0 0 2.5px #28cf86, 0 0 14px rgba(40,207,134,.35), 0 3px 0 #0a4028 !important;} /* verdict #11: bigger ignited stone */
```

**Locked stones bigger too (keep proportion).** Anchor — find (`index.html:240`):
```css
  .jp-node.locked .jp-bub{width:76px;height:76px;font-size:30px;background:#2a1320 !important;border-color:#4a2238;color:#6a4a5c;box-shadow:0 5px 0 #2a0d1c;}
```
Replace with:
```css
  .jp-node.locked .jp-bub{width:82px;height:82px;font-size:32px;background:#2a1320 !important;border-color:#4a2238;color:#6a4a5c;box-shadow:0 5px 0 #2a0d1c;}
```

**Done-stone minutes caption** (mockup: mint «Пробежка» then gold `32м` under it). Add a new class. Anchor — insert AFTER (`index.html:231`):
```css
  .jp-node.done .jp-cap{color:#46e2a4;font-weight:800;}
```
Add:
```css
  .jp-node.done .jp-mins{font-family:"Jost",sans-serif;font-size:11.5px;font-weight:700;color:#ffd24a;margin-top:1px;} /* verdict #11 keep: minutes on done stones */
```

### 2B. Center-thread spine (makes stones read connected)

The mockup reads connected partly because stones cluster near a central vertical line. Smaller offsets do most of it (JS below), but add a faint thread behind the trail so the eye links them. Anchor — insert AFTER (`index.html:225`, now the tightened `.jp-node` line):
```css
  .jp-trail{position:relative;}
  .jp-trail:before{content:"";position:absolute;top:0;bottom:120px;left:50%;width:3px;transform:translateX(-50%);background:linear-gradient(180deg,#3a1a2e,#2a0d1c);border-radius:2px;z-index:0;opacity:.6;} /* verdict #11: the winding thread the stones ride — behind everything (z0), stones are z2 */
```
(`.jp-bub` is already `z-index:2`, `.jp-card` `z-index:4`, banners `z-index:3` — the thread sits behind all of them.)

### 2C. VERDICT #12 — the HOLO prism (Return reward card + return stone)

Two prism surfaces in the Return frame: the **«НАГРАДА · ПРИЗМА / Вернулся» card** (animated rainbow foil BORDER, not a white outline) and the **prism return-stone** (rings firing outward + conic holo tint). Add a dedicated block. Anchor — insert AFTER (`index.html:265`, the last `.jp-trophy` rule):
```css
  /* ===== VERDICT #12: Pokémon-HOLO Return prism (NOT a white outline) ===== */
  @keyframes jpHoloPan{0%{background-position:0 50%}100%{background-position:300% 50%}}
  @keyframes jpHoloRing{0%,55%{transform:scale(.55);opacity:0}60%{opacity:.9}100%{transform:scale(1.9);opacity:0}}
  @keyframes jpHoloFly{0%,55%{transform:translate(0,0) scale(.8);opacity:0}61%{opacity:1;transform:translate(6px,-26px) scale(1.2)}90%{opacity:1}100%{transform:translate(64px,-250px) scale(.6);opacity:0}}
  @keyframes jpHoloDust{0%,58%{transform:translate(0,0) scale(1);opacity:0}63%{opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
  .jp-prismcard{padding:3px;border-radius:15px;background:linear-gradient(115deg,#ffb3d9,#a3d9ff,#b8ffd9,#ffe9a3,#d9a3ff,#ffb3d9);background-size:300% 100%;box-shadow:0 4px 0 #160510;animation:jpHoloPan 4.5s linear infinite;} /* the rainbow FOIL border — the 3px gradient frame IS the holo edge */
  .jp-prismcard .jp-prisminner{background:#22091a;border-radius:12px;padding:12px 18px;text-align:center;} /* dark plum core inside the foil */
  .jp-prismcard .jpp-k{color:#ffd24a;font-size:10px;font-weight:800;letter-spacing:1.8px;}
  .jp-prismcard .jpp-t{color:#fff2f9;font-weight:800;font-size:15.5px;font-family:var(--bub);}
  .jp-prismcard .jpp-sub{color:#a3768c;font-size:11.5px;}
  .jp-returnstone{position:relative;width:88px;height:88px;margin:20px auto 0;}
  .jp-returnstone .jrs-ring{position:absolute;inset:-14px;border-radius:50%;animation:jpHoloRing 3.4s ease-out infinite;}
  .jp-returnstone .jrs-core{position:absolute;inset:0;border-radius:50%;border:3px solid #28cf86;background:conic-gradient(from 30deg,#ffb3d929,#a3d9ff29,#b8ffd929,#ffe9a329,#d9a3ff29,#ffb3d929),#ff5fa8;display:grid;place-items:center;color:#fff;font-size:34px;} /* holo tint OVER the pink core — the stone itself reads prism */
  .jp-returnstone .jrs-check{position:absolute;right:-6px;bottom:-4px;width:28px;height:28px;border-radius:50%;background:#28cf86;border:3px solid #160510;color:#fff;display:grid;place-items:center;font-size:14px;}
  .jp-returnstone .jrs-fly{position:absolute;right:-14px;top:-8px;color:#ffd24a;font-weight:800;font-size:18px;font-family:"Jost",sans-serif;animation:jpHoloFly 3.4s cubic-bezier(.2,.8,.3,1) infinite;}
  .jp-returnstone .jrs-dust{position:absolute;width:6px;height:6px;border-radius:50%;background:#ffd24a;animation:jpHoloDust 3.4s ease-out infinite;}
  /* the dashed PAUSE stone (the gap, named without shame) */
  .jp-pausestone{display:flex;flex-direction:column;align-items:center;margin-top:8px;}
  .jp-pausestone .jps-b{width:56px;height:56px;border-radius:50%;border:3px dashed #8a6bb8;background:#1d1226;display:grid;place-items:center;font-size:22px;color:#8a6bb8;}
  .jp-pausestone .jps-l{color:#8a6bb8;font-weight:700;font-size:12px;margin-top:5px;}
  .jp-quietsea{margin:12px 24px;padding:8px 0;border-top:1px solid #ff8fc029;border-bottom:1px solid #ff8fc029;text-align:center;color:#a3768c;font-size:12.5px;font-weight:600;} /* «the quiet sea» — names the gap, no shame */
  .jp-returncap{color:#46e2a4;font-weight:800;font-size:13.5px;margin-top:10px;font-family:var(--bub);}
  .jp-returnsub{color:#c98ca6;font-size:12px;}
```

---

## 3. RENDER JS — app.js changes

### 3A. VERDICT #11 — smaller lateral offsets + done-stone minutes (edit `coin()`)

**Smaller offsets.** Anchor — find (`app.js:2144`):
```js
      node.style.transform = "translateX(" + (state === "cur" ? 0 : Math.sin(idx * 0.72) * 72).toFixed(0) + "px)"; // winding path; the CURRENT node stays CENTERED (the focal point — fixes the "shifted right" look) (David 2026-07-02)
```
Replace with:
```js
      node.style.transform = "translateX(" + (state === "cur" ? 0 : Math.sin(idx * 0.72) * 46).toFixed(0) + "px)"; // verdict #11: tighter lateral offset (72→46) so stones cluster on the center thread, reading connected. cur stays centered.
```

**Minutes on done stones.** The mockup shows `32м` under a done stone's mint caption. Add it in the `else if (n.title)` cap branch. Anchor — find (`app.js:2221`):
```js
      } else if (n.title) { add(node, "div", "jp-cap" + (state === "locked" ? " locked" : ""), n.title); }
```
Replace with:
```js
      } else if (n.title) {
        add(node, "div", "jp-cap" + (state === "locked" ? " locked" : ""), n.title);
        if (state === "done") { var _dm = jpNodeMins(n); if (_dm) add(node, "div", "jp-mins", _dm + tr("м")); } // verdict #11 keep: minutes logged for this activity today, on the ignited stone
      }
```

**Add the `jpNodeMins` helper** (sums today's tracked minutes matching this node's title). Anchor — insert immediately BEFORE `function drawJourney(autoScroll) {` (`app.js:2101`):
```js
  function jpNodeMins(n) { // verdict #11: total minutes logged today for this node's activity (for the done-stone caption). Empty if none.
    try {
      var t = (n.title || "").toLowerCase(), k = todayK(), sum = 0;
      (logs(k) || []).forEach(function (e) { if ((e.title || "").toLowerCase() === t) sum += (e.mins || 0); });
      return sum > 0 ? Math.round(sum) : 0;
    } catch (e) { return 0; }
  }
```
(Confirm `logs(k)` returns entries with `.title`/`.mins` — grep shows `logs(k).forEach(function(e){ ...e.title... })` at `app.js:2425`, so the shape holds.)

### 3B. VERDICT #12 — render the Return sequence

The `"away"` and `"gapreturn"` nodes in `jpNodes()` currently fall through to a plain `coin()`. Give `drawJourney` a dedicated Return renderer that fires when the ONLY real node is one of those keys, matching the canon frame exactly (dashed pause stone → quiet-sea line → holo prism card → firing return-stone).

**Add the renderer.** Anchor — insert immediately BEFORE `function jpNodeMins(n) {` (just added, before `drawJourney`, `app.js:2101`):
```js
  function jpRenderReturn(trail, n) { // VERDICT #12: the canon Return frame — dashed pause-stone + quiet-sea line + HOLO prism reward card + firing prism return-stone. Returns true if it handled the trail.
    // gap length: days since last logged activity (for the quiet-sea line + the +N reward)
    var days = 0; try { if (n.key === "gapreturn") { var ks = Object.keys((S.sf && S.sf.actions) || {}).filter(function (dk) { return dk !== todayK() && (S.sf.actions[dk] || []).length; }).sort(); if (ks.length) days = daysSince(ks[ks.length - 1]) || 0; } else if (S.awaySince) { days = daysSince(key(new Date(S.awaySince))) || 0; } } catch (e) {}
    var returnN = (((S.guide || {}).cache || {}).returnCount || 0) + 1; // Nth return
    var reward = Math.max(3, Math.min(9, days + 2)); // the flying +N (small, warm)

    // 1) dashed PAUSE stone — the gap, named without shame
    var ps = add(trail, "div", "jp-pausestone");
    var psb = add(ps, "div", "jps-b"); psb.innerHTML = '<i class="ti ti-plane-inflight"></i>';
    add(ps, "div", "jps-l", tr("пауза · серии сохранены"));

    // 2) the quiet-sea line — X days, the world waited, nothing broke
    add(trail, "div", "jp-quietsea", days + " " + tr("дн.") + " · " + tr("мир ждал, ничего не сломалось"));

    // 3) the HOLO prism reward card (rainbow foil border, NOT a white outline)
    var pc = add(trail, "div", "jp-prismcard"); pc.style.margin = "6px auto 0"; pc.style.width = "fit-content";
    var pi = add(pc, "div", "jp-prisminner");
    add(pi, "div", "jpp-k", tr("НАГРАДА · ПРИЗМА"));
    var pih = add(pi, "div", ""); pih.innerHTML = '<i class="ti ti-sparkles" style="font-size:26px;color:#fff;margin-top:4px;"></i>';
    add(pi, "div", "jpp-t", tr("Вернулся"));
    add(pi, "div", "jpp-sub", returnN + tr("-й возврат") + " · " + fmtDayMon(new Date()));

    // 4) the firing PRISM return-stone — rings + conic holo core + green check + flying +N + gold dust
    var rs = add(trail, "div", "jp-returnstone");
    var r1 = add(rs, "div", "jrs-ring"); r1.style.border = "3px solid #46e2a4";
    var r2 = add(rs, "div", "jrs-ring"); r2.style.border = "2px solid #ffd24a"; r2.style.animationDelay = ".15s";
    var core = add(rs, "div", "jrs-core"); core.innerHTML = '<i class="ti ti-sparkles"></i>';
    var chk = add(rs, "div", "jrs-check"); chk.innerHTML = '<i class="ti ti-check"></i>';
    add(rs, "div", "jrs-fly", "+" + reward);
    var d1 = add(rs, "div", "jrs-dust"); d1.style.cssText += "left:12px;top:40px;--dx:-36px;--dy:-24px;";
    rs.style.cursor = "pointer"; rs.onclick = n.act || function () {}; // tap the stone = the node's micro-win (jpTrackNow / welcome-back)

    add(trail, "div", "jp-returncap", n.key === "away" ? tr("Возвращение — засчитано") : tr("Возвращение — засчитано"));
    add(trail, "div", "jp-returnsub", tr("20 секунд — и ты снова в пути"));
    return true;
  }
```

**Wire it into `drawJourney`.** After `nodes`/`real` are computed and the sub/spark/prog are set, short-circuit to the Return frame when the sole real node is `away`/`gapreturn`. Anchor — find (`app.js:2139`):
```js
    var _dk = todayK();
```
Insert AFTER it:
```js
    // VERDICT #12: Return frame — when the only real node is the away/gapreturn stone, render the canon prism sequence instead of a plain coin.
    if (real.length === 1 && (real[0].key === "away" || real[0].key === "gapreturn")) {
      if (sub) sub.textContent = tr("ты вернулся — это главное");
      jpRenderReturn(trail, real[0]);
      if (autoScroll) { try { var _sc = el("jpScroll"); if (_sc) _sc.scrollTop = 0; } catch (e) {} }
      return;
    }
```
(This sits AFTER `var sub = el("jpSub")` at `app.js:2134` and `var pf = el("jpProgFill")` at `app.js:2136` have run, so the header is already updated; `sub` is in scope. `trail` is in scope from `app.js:2102`.)

**Add the two tiny date helpers** if absent. Grep first: `grep -n "function fmtDayMon\|function daysSince" app.js`. `daysSince` already exists (used at `app.js:906`). If `fmtDayMon` does NOT exist, add it. Anchor — insert BEFORE `function jpNodeMins` (`app.js:2101`):
```js
  function fmtDayMon(d) { var mo = ["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"]; return pad(d.getDate()) + " " + tr(mo[d.getMonth()]); } // "02 июл" — matches the canon "02 июля" short form
```
(Uses existing `pad()`. If you prefer the mockup's full «02 июля», swap `mo` to the genitive-long set: `["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]`.)

---

## 4. WIRING

No new nav wiring. Everything routes through the EXISTING open path:
- `#jpnJourney` nav button → `openJourney()` (`app.js:1860`) → sets `journey-open` → `drawJourney(true)` runs on open (already wired via `cascadeJourney`/pane logic).
- The Return frame is reached automatically whenever `jpNodes()` early-returns the `away`/`gapreturn` node (already the case at `app.js:897`/`905`). This spec only changes how that single node is DRAWN.
- Tapping the holo return-stone fires the node's existing `act` (`jpTrackNow` for gapreturn, the welcome-back reset for away) — no new handler.

---

## 5. I18N — new strings → I18N.ru (add to the `.ru` dict; verify each isn't already present with `grep -n '"<en>"' app.js` before adding)

The Return renderer uses `tr()` on Russian source strings so the display-layer passes them through unchanged — but to be safe against the translator, register identity/parts. Add these keys (they are the exact strings passed to `tr()`):

| Source (as passed to tr) | ru value |
|---|---|
| `ты вернулся — это главное` | `ты вернулся — это главное` |
| `пауза · серии сохранены` | `пауза · серии сохранены` |
| `дн.` | `дн.` |
| `мир ждал, ничего не сломалось` | `мир ждал, ничего не сломалось` |
| `НАГРАДА · ПРИЗМА` | `НАГРАДА · ПРИЗМА` |
| `Вернулся` | `Вернулся` |
| `-й возврат` | `-й возврат` |
| `Возвращение — засчитано` | `Возвращение — засчитано` |
| `20 секунд — и ты снова в пути` | `20 секунд — и ты снова в пути` |
| `м` | `м` (minutes suffix, `32м`) |
| `янв`..`дек` (month abbrevs) | identity |

Note: these are authored in Russian to match the canon frame verbatim. If the app is in EN mode the display translator leaves them as-is (they'll show Russian) — this matches the mockup, which is Russian-only. If David wants an EN fallback for the Return frame, author the strings in English and add ru translations instead; flag this as a design choice, don't guess. **English strings already in code that the Return path touches (`"You came back."`, `"You're away"`) already have ru entries (`app.js:1406-1407`) — leave them.**

---

## 6. REGRESSION RISKS

- **Timeline/gesture contract:** untouched. This spec edits only `#journeyPath` render + CSS; no changes to the planner timeline, day-nav, drag/resize, or the now-line. The four regression-contract items are not in this code path. Still: **boots-clean in preview only; the holo pan/ring/fly animations are DEVICE-UNTESTED for feel — confirm on David's phone.**
- **The Return short-circuit `return`** in `drawJourney` skips the rest of the function (live-pill, burst queue, autoScroll-to-cur). That is correct — the Return frame is a terminal state with no cur node — but it means the `jpLive` cockpit pill won't render during away/gap. Acceptable (you're not tracking anything mid-gap). If a timer somehow runs, it's edge-case; safe.
- **`jpNodeMins` on every done stone** adds a `logs(k)` scan per done node. `logs(k)` is small (one day); negligible. Additive — if it throws, the try/catch returns 0 and no caption shows.
- **Center-thread `:before`** is `z-index:0`, pointer-events default (none needed), and `bottom:120px` so it doesn't underlap the nav. Purely decorative; can't break taps (stones are z2+).
- **Offset change 72→46:** purely visual; the `cur` node still forces `translateX(0)`. No layout overflow — `.jp-node` is `width:210px` centered.
- **Safe/additive path:** all CSS is new classes or in-place value swaps; all JS is new helpers + one guarded short-circuit. Nothing is deleted. If the Return renderer is wrong, comment out the one short-circuit block and the old plain-coin behavior returns.

---

## 7. FIDELITY CHECKLIST (vs `journey_epic.html`)

Trail frame:
- [ ] Header «Твой путь» — `#fff2f9` 800 17px (Baloo via `.jp-title`); sub `#c98ca6` 12.5px 600.
- [ ] Spark pill: `#2c081a` bg, `#160510` 2px border, `#ffd24a` bolt+number 800 — existing `#jpSpark`.
- [ ] Node-pip day gauge (colored 11×18 rounded bars + gift) — existing header markup; unchanged.
- [ ] Season banner ~90%-dark: `#22091a` bg, `inset 0 0 0 1px #ff5fa847`, `#ff8fc0` eyebrow, milestone pips, mint chapter-card preview — existing `banner()`; unchanged.
- [ ] Done stone: mint `#28cf86` 3px border + `0 0 0 2.5px #28cf86` ignite glow; **bigger (88px)**; mint cap `#46e2a4` 800; **gold `32м` minutes below (`#ffd24a` Jost 700 11.5px)** — 2A + 3A.
- [ ] Up/future "matte" stone: **bigger (92px)**, flat domain color — 2A.
- [ ] **Tighter rhythm** (`padding:11px 0`), **smaller offset** (`sin*46`), faint center thread `:before` — 2A/2B/3A.
- [ ] Guardian context line (italic, `#d59cb4`, sparkle) — existing `jpLeadPreface`; unchanged.
- [ ] Cur hero stone: striped `tfStripe`, breathing `jpAlive`, centered — existing; unchanged.
- [ ] Blue СТАРТ door `#36b3f0` / ink label + «не сейчас» ghost `#8a6478` — existing `.jc-cta`; unchanged.

Return frame:
- [ ] Sub line «ты вернулся — это главное» — 3B short-circuit.
- [ ] Dashed pause stone: `3px dashed #8a6bb8` on `#1d1226`, plane icon, «пауза · серии сохранены» `#8a6bb8` 700 — `.jp-pausestone`.
- [ ] Quiet-sea line: hairline pink `#ff8fc029` top+bottom rules, `#a3768c` 12.5px 600, «N дн. · мир ждал, ничего не сломалось» — `.jp-quietsea`.
- [ ] **HOLO prism card = animated rainbow FOIL border** (`linear-gradient 115deg` 6-stop, `background-size:300%`, `jpHoloPan`), dark `#22091a` inner — NOT a white outline (verdict #12) — `.jp-prismcard`.
- [ ] «НАГРАДА · ПРИЗМА» gold `#ffd24a` 800 1.8px; «Вернулся» `#fff2f9` 800 Baloo; «5-й возврат · 02 июл» `#a3768c`.
- [ ] Prism return-stone: pink `#ff5fa8` core + conic holo tint overlay, mint `#28cf86` border, expanding mint+gold rings (`jpHoloRing`), green check, flying gold `+N` (`jpHoloFly`), gold dust (`jpHoloDust`) — `.jp-returnstone`.
- [ ] «Возвращение — засчитано» mint `#46e2a4` 800; «20 секунд — и ты снова в пути» `#c98ca6`.
- [ ] Tabler icons only (ti-plane-inflight, ti-sparkles, ti-check, ti-run, ti-brain, ti-book, ti-moon, ti-stars, ti-gift, ti-bolt). No emoji.
