# onboarding — BUILD SPEC (1:1 to widget, verdict #18)

Widget ref: `_specs/_epic-mockups/_widget-refs/onboarding.jpg` (READ IT — two phones).
Target: two NEW beats matching the canon exactly — the **PAYOFF** phone and the **TRAINER-CARD MINT** phone. Verdict #18: "like it more than current," build both.

---

## 1. SUMMARY

The onboarding flow is `onboard()` at **app.js:4530**. It builds a full-screen `.ob-ov` overlay with a course-style dash `.ob-bar`, a `.ob-body`, and an `.ob-foot`. It's a 7-step (`STEPS=7`) walk: 0-1 showman, 2 vibe, 3 the task, 4 blocker, 5 pact, 6 seed. `finish()` seeds the profile and calls `renderAll()` + `openJourney()`.

It is opened from wherever a fresh save has no profile (grep: `onboard(` call site — the first-run gate). We are NOT rebuilding the walk; we replace **two existing draw branches** so they render pixel-1:1 to the widget:

- **Phone A (payoff):** step 3's *done* branch (`app.js:4615-4623`) currently shows a plain "+18 Spark." heading + a room chip picker. The widget shows the FULL payoff: course dashes, `ПЕРВАЯ ПОБЕДА` kicker, a big gold `+18 Искр` that **flies (flyPoints arc) into a popping counter chip** top-right, the task rendered as the first **FOIL quest card** (gold-edge, hand icon, `сделано`, check), a green pressed **`✓ Сделал`** GO door, and the line `искры улетели в твой счёт — я запомнил`.
- **Phone B (trainer-card mint):** this is a NEW step. The widget shows `Твоя первая карта`, the matte trainer card `КАРТА ТРЕНЕРА №001 · СОБРАННЫЙ · EST · 2 ИЮЛ 2026 · день первый. всё впереди.`, a pact-on-the-back block (`НА ОБОРОТЕ — ПАКТ · обещал честность · пришёл: застрял`), three evolution pips (`7 дней / корона / возвращение`), and a `коллекция · 1` chip the card flies into.

Both beats use existing helpers only: `add`, `el`, `mixHex`, `esc`, `earn`, `flyPoints`, `save`. All new strings are listed for `I18N.ru` (§5).

---

## 2. CSS — add to index.html

All blocks are additive `.ob-*` classes. Anchor: **insert after line 1504** (`.ob-btn:active{...}` — the last `.ob-*` rule in the onboarding block).

```css
  /* ===== ONBOARDING PAYOFF + TRAINER-CARD MINT (verdict #18, 1:1 widget) ===== */
  /* Phone A — the +N counter chip top-right that pops to absorb the flying spark */
  .ob-scorechip{ position:absolute; top:0; right:0; display:inline-flex; align-items:center; gap:7px; background:#3a1730; border:2.5px solid #160510; border-radius:13px; box-shadow:0 4px 0 #160510; padding:7px 14px; font-family:"Jost",sans-serif; font-weight:800; font-size:20px; color:#ffd24a; }
  .ob-scorechip i{ font-size:16px; color:#ffd24a; }
  .ob-scorechip.pop{ animation:sparkBump .42s cubic-bezier(.2,.9,.3,1.45); }
  .ob-kick{ color:#ff5fa8; font-weight:800; font-size:13px; letter-spacing:1.6px; text-transform:uppercase; text-align:center; margin:2px 0 4px; }
  .ob-big{ font-family:"Jost",sans-serif; font-weight:800; font-size:52px; line-height:1; color:#ffc41f; text-align:center; text-shadow:0 3px 0 #160510; }
  /* Phone A — the task as the first FOIL quest card (gold edge on done) */
  .ob-quest{ display:flex; align-items:center; gap:14px; width:100%; margin-top:22px; background:#2a0f22; border:3px solid #ffc83d; border-radius:18px; box-shadow:0 5px 0 #160510; padding:16px 18px; }
  .ob-quest .qi{ width:52px; height:52px; flex:none; display:flex; align-items:center; justify-content:center; border-radius:14px; background:#34d39a; border:2.5px solid #160510; box-shadow:0 3px 0 #160510; color:#0c3d29; font-size:24px; }
  .ob-quest .qt{ flex:1; min-width:0; }
  .ob-quest .qt b{ display:block; color:#fff2f9; font-weight:800; font-size:18px; line-height:1.15; }
  .ob-quest .qt span{ display:block; color:#cd9bb6; font-weight:600; font-size:13px; margin-top:2px; }
  .ob-quest .qk{ flex:none; color:#ffc83d; font-size:22px; }
  /* Phone B — the matte trainer card */
  .ob-tcard{ position:relative; width:100%; margin-top:20px; background:linear-gradient(160deg,#2c1024,#3a1226); border:2.5px solid #6b2a48; border-radius:20px; box-shadow:0 6px 0 #160510; padding:20px 20px 22px; text-align:center; }
  .ob-tcard .tc-head{ display:flex; justify-content:space-between; align-items:center; }
  .ob-tcard .tc-head span{ color:#ff5fa8; font-weight:800; font-size:12px; letter-spacing:1.4px; }
  .ob-tcard .tc-spk{ color:#ff5fa8; font-size:26px; margin:14px 0 8px; }
  .ob-tcard .tc-name{ font-family:"Jost",sans-serif; font-weight:800; font-size:34px; letter-spacing:1px; color:#fff2f9; text-shadow:0 2px 0 #160510; }
  .ob-tcard .tc-rule{ height:2px; background:#6b2a48; margin:16px auto; width:78%; border-radius:2px; }
  .ob-tcard .tc-est{ color:#e0b0c8; font-weight:800; font-size:14px; letter-spacing:1.2px; }
  .ob-tcard .tc-sub{ color:#b98aa6; font-weight:600; font-size:13px; margin-top:6px; }
  .ob-tcard.fly{ transition:transform .6s cubic-bezier(.4,.7,.4,1), opacity .6s; }
  /* Phone B — pact-on-the-back block */
  .ob-pactlbl{ display:flex; align-items:center; gap:8px; color:#ff5fa8; font-weight:800; font-size:13px; letter-spacing:1.2px; margin:22px 0 8px; }
  .ob-pactbox{ width:100%; background:#241019; border:2.5px solid #ffc83d; border-radius:14px; padding:13px 16px; text-align:left; }
  .ob-pactbox b{ display:block; color:#fff2f9; font-weight:700; font-size:15px; }
  .ob-pactbox span{ display:block; color:#cd9bb6; font-weight:600; font-size:13px; margin-top:3px; }
  /* Phone B — evolution pips */
  .ob-pips-h{ color:#ff5fa8; font-weight:800; font-size:13px; letter-spacing:1.4px; text-align:center; margin:24px 0 12px; }
  .ob-pips{ display:flex; justify-content:center; gap:34px; }
  .ob-pip{ display:flex; flex-direction:column; align-items:center; gap:8px; }
  .ob-pip i{ width:18px; height:18px; border-radius:50%; border:2.5px solid #160510; background:#4a1f38; }
  .ob-pip.p2 i{ background:#ffc41f; } .ob-pip.p3 i{ background:#c4607f; }
  .ob-pip span{ color:#cd9bb6; font-weight:700; font-size:12px; }
  /* Phone B — collection chip the card flies into */
  .ob-collchip{ display:inline-flex; align-items:center; gap:9px; margin:26px auto 0; background:linear-gradient(135deg,#8a1f52,#5a1236); border:2.5px solid #160510; border-radius:15px; box-shadow:0 4px 0 #160510; padding:11px 20px; color:#ffd9ec; font-weight:800; font-size:16px; }
  .ob-collchip i{ color:#ff8ac0; font-size:18px; }
  .ob-collchip.pop{ animation:sparkBump .42s cubic-bezier(.2,.9,.3,1.45); }
  .ob-forever{ color:#cd9bb6; font-weight:600; font-size:13px; text-align:center; margin-top:14px; }
```

Notes: `sparkBump` keyframe already exists (index.html:188 uses it). `.ob-big` uses the locked `--yellow` #ffc41f. Gold edge `#ffc83d` matches the existing `.ob-btn`. All ink borders `#160510`, hard `0 Npx 0 #160510` shadows — the chunky game-piece language.

---

## 3. RENDER JS — app.js

### 3a. Bump STEPS 7 → 8 (insert the mint beat as the new penultimate step)

Anchor — **replace** the declaration line at **app.js:4532**:

```js
    var step = 0, STEPS = 7, advT = null; // 0-1 showman · 2 vibe (answered aloud) · 3 the task (sized by vibe) + room re-home · 4 blocker blessing · 5 pact (after the gift) · 6 the seed — FIRST-DAY REWIRE (David 2026-07-03: every answer must visibly change the next beat; the clipboard is dead)
```

with:

```js
    var step = 0, STEPS = 8, advT = null; // 0-1 showman · 2 vibe · 3 task+payoff · 4 blocker · 5 pact · 6 trainer-card MINT · 7 seed — verdict #18 inserts the mint beat before the seed
```

### 3b. Replace step 3's DONE branch with the 1:1 PAYOFF beat

Anchor — **replace** the `else { ... }` block of step 3, currently **app.js:4615-4623**:

```js
        } else {
          add(body, "i", "ti ti-sparkles ob-spk"); add(body, "div", "ob-q", "+18 Spark.");
          add(body, "div", "ob-sb", "that's it. that's the whole game — real things, remembered.");
          add(body, "div", "ob-sb", "Where were you just standing?").style.cssText = "margin-top:20px;font-weight:700;color:#f0e6ef;";
          var rr = add(body, "div", "ob-row");
          ["Bedroom", "Kitchen", "Living room", "Desk / office", "Bathroom"].forEach(function (r) { var c = chip(rr, r, data.messRoom === r); c.onclick = function () { data.messRoom = r; draw(); }; });
          if (data.messRoom) add(body, "div", "ob-sb", "Noted. That corner's on my list for you now.").style.cssText = "margin-top:10px;opacity:.85;";
          stdFoot("Next ▸", false);
        }
```

with (the widget PAYOFF — the +18 flies into a popping score chip; the task is the first foil quest card; green pressed Сделал; the "искры улетели" line):

```js
        } else {
          // PAYOFF BEAT (verdict #18, 1:1 widget): the reward plays its own reward
          var wrap = add(body, "div"); wrap.style.cssText = "position:relative;width:100%;";
          var chipEl = add(wrap, "div", "ob-scorechip"); chipEl.innerHTML = '<i class="ti ti-sparkles"></i><b class="obn">0</b>';
          add(wrap, "div", "ob-kick", tr("first win"));
          var bigEl = add(wrap, "div", "ob-big", "+18 " + tr("Spark"));
          add(wrap, "div", "ob-sb", tr("a real thing — a real reward")).style.cssText = "text-align:center;margin-top:8px;";
          // the task as the first FOIL quest card (gold edge, done)
          var _taskT = data.vibe === "overwhelmed" ? tr("One thing off the floor") : data.vibe === "thriving" ? tr("Three things off the floor") : tr("Two things off the floor");
          var _room = data.messRoom ? esc(tr(data.messRoom)) : tr("in your space");
          var q = add(body, "div", "ob-quest");
          q.innerHTML = '<div class="qi"><i class="ti ti-hand-stop"></i></div><div class="qt"><b>' + esc(_taskT) + '</b><span>' + _room + ' · ' + tr("done") + '</span></div><i class="ti ti-check qk"></i>';
          // green pressed GO door
          var db2 = add(foot, "button", "ob-btn go", "✓ " + tr("Did it")); db2.style.pointerEvents = "none";
          add(body, "div", "ob-sb", tr("the spark flew to your count — I remembered")).style.cssText = "text-align:center;margin-top:18px;";
          stdFoot("Next ▸", false);
          // fly the +18 from the big number INTO the score chip, count it up, pop the chip (once)
          if (!data._payoffFlew) { data._payoffFlew = true; setTimeout(function () {
            try {
              var br = bigEl.getBoundingClientRect(), cr = chipEl.getBoundingClientRect();
              var f = document.createElement("div"); f.className = "fly-n"; f.textContent = "+18";
              f.style.left = (br.left + br.width / 2 - 18) + "px"; f.style.top = (br.top + 4) + "px"; document.body.appendChild(f);
              var dx = cr.left + cr.width / 2 - (br.left + br.width / 2), dy = cr.top + cr.height / 2 - (br.top + br.height / 2);
              var done = function () { f.remove(); var n = chipEl.querySelector(".obn"); if (n) n.textContent = "18"; chipEl.classList.remove("pop"); void chipEl.offsetWidth; chipEl.classList.add("pop"); };
              if (f.animate) { f.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: "translate(" + (dx * .3) + "px," + (dy * .3 - 20) + "px) scale(1.15)", opacity: 1, offset: .4 }, { transform: "translate(" + dx + "px," + dy + "px) scale(.5)", opacity: .8 }], { duration: 720, easing: "cubic-bezier(.3,.7,.4,1)" }).onfinish = done; }
              else done();
            } catch (e) { var n = chipEl.querySelector(".obn"); if (n) n.textContent = "18"; }
          }, 260); }
        }
```

### 3c. Insert the TRAINER-CARD MINT beat as step 6

Anchor — **insert immediately before** the existing `if (step === 6) {` line (currently **app.js:4645**; after 3b/3a it is the seed step which we renumber to 7). Add this new branch:

```js
      if (step === 6) { // TRAINER-CARD MINT (verdict #18, 1:1 widget): the matte card is your potential — it ignites as you live
        add(body, "div", "ob-q", tr("Your first card")).style.cssText = "font-size:26px;font-weight:800;text-align:center;";
        add(body, "div", "ob-sb", tr("matte — that's potential. it lights up as you live")).style.cssText = "text-align:center;margin-top:6px;";
        var tc = add(body, "div", "ob-tcard");
        var _cls = (data.vibe === "overwhelmed" || data.vibe === "stuck") ? tr("THE GATHERED") : tr("THE GATHERED");
        var _est = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
        tc.innerHTML = '<div class="tc-head"><span>' + tr("TRAINER CARD") + '</span><span>№001</span></div>'
          + '<i class="ti ti-sparkles tc-spk"></i>'
          + '<div class="tc-name">' + _cls + '</div>'
          + '<div class="tc-rule"></div>'
          + '<div class="tc-est">EST · ' + esc(_est) + '</div>'
          + '<div class="tc-sub">' + tr("day one. everything ahead.") + '</div>';
        // pact on the back
        var pl = add(body, "div", "ob-pactlbl"); pl.innerHTML = '<i class="ti ti-refresh"></i>' + tr("ON THE BACK — PACT");
        var pbx = add(body, "div", "ob-pactbox");
        var _blk = data.block === "fear" ? tr("scared") : data.block === "overwhelm" ? tr("overwhelmed") : data.block === "wound" ? tr("carrying an old one") : tr("stuck");
        pbx.innerHTML = '<b>' + tr("promised honesty") + '</b><span>' + tr("showed up:") + ' ' + esc(_blk) + '</span>';
        // evolution pips
        add(body, "div", "ob-pips-h", tr("GROWS WITH YOU"));
        var pips = add(body, "div", "ob-pips");
        pips.innerHTML = '<div class="ob-pip p1"><i></i><span>' + tr("7 days") + '</span></div>'
          + '<div class="ob-pip p2"><i></i><span>' + tr("crown") + '</span></div>'
          + '<div class="ob-pip p3"><i></i><span>' + tr("return") + '</span></div>';
        // collection chip the card flies into
        var coll = add(body, "div", "ob-collchip"); coll.innerHTML = '<i class="ti ti-cards"></i>' + tr("collection") + ' · 1';
        coll.style.display = "flex"; // center via margin auto (block would collapse the flex); keep as inline-flex centered:
        coll.style.margin = "26px auto 0";
        add(body, "div", "ob-forever", tr("it's yours — forever"));
        // fly the card into the collection chip once
        if (!data._cardFlew) { data._cardFlew = true; setTimeout(function () {
          try {
            var tr1 = tc.getBoundingClientRect(), cr = coll.getBoundingClientRect();
            var dx = cr.left + cr.width / 2 - (tr1.left + tr1.width / 2), dy = cr.top + cr.height / 2 - (tr1.top + tr1.height / 2);
            tc.classList.add("fly"); requestAnimationFrame(function () { tc.style.transform = "translate(" + dx + "px," + dy + "px) scale(.12)"; tc.style.opacity = ".25"; });
            setTimeout(function () { coll.classList.add("pop"); tc.style.transform = ""; tc.style.opacity = ""; tc.classList.remove("fly"); }, 640);
          } catch (e) {}
        }, 900); }
        stdFoot("Next ▸", false); return;
      }
```

### 3d. Renumber the old seed step 6 → 7

Anchor — **replace** the existing seed branch opener **app.js:4645** `if (step === 6) {` with `if (step === 7) {`. Also update the `body.className` center-list at **app.js:4570** to include the new mint step (6) and the renumbered seed (7):

Replace:
```js
      body.className = (step === 0 || step === 1 || step === 2 || step === 4 || step === 6) ? "ob-body center" : "ob-body";
```
with:
```js
      body.className = (step === 0 || step === 1 || step === 2 || step === 4 || step === 6 || step === 7) ? "ob-body center" : "ob-body";
```
(Step 6 mint and step 7 seed both center; step 3 payoff stays left-flow so the quest card is full-width.)

Note: `finish()` (4538) is reached from `next()` when `step === STEPS-1`; with STEPS=8 that's step 7 (seed) — unchanged behavior, correct.

---

## 4. WIRING

No new nav wiring. The two beats live INSIDE the existing `onboard()` walk:
- Phone A replaces step 3's post-task branch — reached when the user taps `Done ✓` (existing `taskDone()` at 4561, which already grants `earn(8)` + `choreMark`'s `earn(10)` = the +18).
- Phone B is a new step 6, reached by the existing `next()` from the pact (step 5). `stdFoot("Next ▸")` on the mint beat advances to seed (step 7) → `finish()`.
- Dash bar auto-tracks: `barDs.forEach` in `draw()` (4569) already lights `di <= step`; STEPS=8 renders 8 dashes matching the widget's course bar.

The score chip counter and card-fly are self-contained WAAPI (guarded, fall back to instant). No `renderAll` / no DOM wipe outside `body`.

---

## 5. I18N — new EN strings → RU (add to I18N.ru)

| EN | RU |
|---|---|
| `first win` | `первая победа` |
| `Spark` | `Искр` |
| `a real thing — a real reward` | `настоящее дело — настоящая награда` |
| `One thing off the floor` | `Одна вещь с пола` |
| `Two things off the floor` | `Две вещи с пола` |
| `Three things off the floor` | `Три вещи с пола` |
| `in your space` | `в твоём пространстве` |
| `done` | `сделано` |
| `Did it` | `Сделал` |
| `the spark flew to your count — I remembered` | `искры улетели в твой счёт — я запомнил` |
| `Your first card` | `Твоя первая карта` |
| `matte — that's potential. it lights up as you live` | `матовая — это потенциал. она зажигается, пока ты живёшь` |
| `TRAINER CARD` | `КАРТА ТРЕНЕРА` |
| `THE GATHERED` | `СОБРАННЫЙ` |
| `day one. everything ahead.` | `день первый. всё впереди.` |
| `ON THE BACK — PACT` | `НА ОБОРОТЕ — ПАКТ` |
| `promised honesty` | `обещал честность` |
| `showed up:` | `пришёл:` |
| `scared` | `страшно` |
| `overwhelmed` | `завалило` |
| `carrying an old one` | `со старой раной` |
| `stuck` | `застрял` |
| `GROWS WITH YOU` | `РАСТЁТ С ТОБОЙ` |
| `7 days` | `7 дней` |
| `crown` | `корона` |
| `return` | `возвращение` |
| `collection` | `коллекция` |
| `it's yours — forever` | `она твоя — навсегда` |

Room names (`Bedroom` etc.) already exist in the dict from the current step-3 picker (`в спальне` = `Bedroom` via display translator). Confirm `Bedroom → спальне` is present; if the picker was removed the room label still reads through `tr(data.messRoom)`.

---

## 6. REGRESSION RISKS

- **STEPS 7→8:** the ONLY structural change. `finish()` fires at `step===STEPS-1`; verified it now lands on the seed step (7). The `next()`/`◂ back` math is relative (`step++/step--`), so no off-by-one elsewhere. LOW risk, additive.
- **Room picker removed from payoff:** step 3's done-branch no longer surveys the room. `data.messRoom` may be empty → the quest card falls back to `in your space` (`в твоём пространстве`) and `finish()` already guards `P.messRoom = data.messRoom || P.messRoom || ""`. Safe. If David wants the room ask kept, it can move to a micro-line under the quest card — but the widget shows no picker here, so this matches canon.
- **flyPoints not reused for the counter:** the payoff uses a bespoke local WAAPI fly (not the global `flyPoints`) because the target is the in-overlay chip, not `rewardTarget()` (#spark / #jpSpark, which aren't mounted during onboarding). Reusing the `.fly-n` class keeps the visual. Guarded `try/catch` + `if(f.animate)` fallback sets the count instantly. LOW risk.
- **No DOM wipe added:** both beats render into `body`/`foot` which `draw()` already clears at 4569 — no NEW innerHTML wipe surface (honors the landmine rule).
- **`ti-hand-stop` / `ti-cards` / `ti-refresh`:** confirm these Tabler glyphs exist in the bundled font subset; if a glyph is missing it renders blank (not broken). `ti-cards` is used elsewhere for the collection — safe. Swap `ti-hand-stop`→`ti-hand-finger` if absent.
- **Gesture feel:** none of this is a swipe/drag/scroll surface. Boots-clean in preview is a real signal here; the card-fly and counter-pop are WAAPI timers, device-safe. Still label the fly TIMING as **device-untested** for exact feel.

---

## 7. FIDELITY CHECKLIST (vs widget, pixel-by-pixel)

Phone A (payoff):
- [ ] Course dash bar on top, gold `#ffd24a` walked dashes — existing `.ob-bar` (now 8 dashes). ✓ matches.
- [ ] `ПЕРВАЯ ПОБЕДА` kicker: pink `#ff5fa8`, Jost 800, uppercase, letter-spacing — `.ob-kick`. ✓
- [ ] `+18 Искр` big number: **Jost 800 HEAVY**, gold `--yellow #ffc41f`, ~52px, hard ink text-shadow `0 3px 0 #160510` (NOT thin, NOT mono). ✓
- [ ] Score chip top-right: berry `#3a1730`, ink border, hard `0 4px 0 #160510` shadow, gold sparkle icon + gold number, pops on absorb (`sparkBump`). ✓
- [ ] Quest card: **gold edge `#ffc83d`**, ink hard shadow, green `#34d39a` hand-icon tile, title Jost 800 white `#fff2f9`, sub `в спальне · сделано` in `#cd9bb6`, gold check right. ✓
- [ ] `Сделал` GO door: green `.ob-btn.go` (#34d39a / #0c3d29), shown pressed (`ob-btn:active` style implied; pointer-events off). ✓
- [ ] Line `искры улетели в твой счёт — я запомнил`: muted `.ob-sb` `#cd9bb6`, centered. ✓
- [ ] +18 flies FROM the big number arc INTO the chip which pops. ✓

Phone B (trainer-card mint):
- [ ] `Твоя первая карта` heading Jost 800 white; sub `матовая — это потенциал…` in muted mauve. ✓
- [ ] Matte trainer card: deep plum gradient `#2c1024→#3a1226`, muted `#6b2a48` border (matte, NOT lit — potential), hard ink shadow. ✓
- [ ] `КАРТА ТРЕНЕРА` / `№001` header pink `#ff5fa8` Jost 800 letter-spaced; pink sparkle glyph; `СОБРАННЫЙ` name Jost 800 ~34px white with ink shadow; hairline rule; `EST · 2 ИЮЛ 2026`; `день первый. всё впереди.`. ✓
- [ ] Pact-on-back: pink label with refresh icon `НА ОБОРОТЕ — ПАКТ`; gold-edged box `обещал честность · пришёл: застрял`. ✓
- [ ] Evolution pips row: three dots — dim, gold `#ffc41f`, berry `#c4607f` — labels `7 дней / корона / возвращение` in muted mauve. ✓
- [ ] Collection chip: magenta gradient `#8a1f52→#5a1236`, ink hard shadow, cards icon, `коллекция · 1`; card flies into it and it pops. ✓
- [ ] `она твоя — навсегда` footer muted, centered. ✓
- [ ] All borders ink `#160510`, all shadows hard `0 Npx 0` — chunky game-piece language, zero soft/flat shadows, zero off-palette color. ✓
- [ ] Tabler line-icons only, no emoji in the UI. (The `🌱`/`✓` in code are on buttons; the `✓ Сделал` uses a text check — swap to `<i class="ti ti-check">` if strict.) ⚠ see note.
