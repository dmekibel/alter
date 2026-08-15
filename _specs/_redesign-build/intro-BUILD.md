# intro-BUILD.md — the launch / splash screen (verdict #17)

Paste-ready build spec. Single-file app: CSS goes in `index.html`, logic in `app.js`. Anchors are unique existing lines — insert AFTER them. This is the existing **START SCREEN** (`#startScreen`, v652), not a new surface. We are re-skinning three things to the widget and adding two safety cards.

---

## 1. SUMMARY

**What it is:** the animated launch gate shown on every cold open. Markup: `index.html` `#startScreen` (line 1927). Wired in `showStartScreen()` (`app.js:1827`) and dismissed by `ssEnter()` (`app.js:1853`). Language menu = `showLangMenu()` (`app.js:1821`), globe chip already exists (`ssLangLabel()` renders `ti ti-world`, `app.js:1820`). Version stamp = `appVer()` (`app.js:1984`).

**How reached today:** the app boots with `#startScreen` shown; `.on` is added in `showStartScreen()`. `ssPrimary` = Continue/Start, `ssLoad` = file-upload restore, `ssNew` = two-tap erase (arm on tap 1, wipe on tap 2 within 4 s — `app.js:1840`).

**The 5 widget deltas (verdict #17):**
1. **Ember day-tag** under ALTER: a small flame + `день N вместе` (English: `day N together`) — replaces the static `your guardian angel` tagline.
2. **Green GO door** as the primary when a block is live: `▸ Вернуться · <block title>` (English `Return · <title>`). Falls back to the pink `Continue` slab when no block is active — same button, recoloured green + relabelled.
3. **Load = a NIGHT preview card**, not a blind file-load. `ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ`, profile line (`Давид · 41 день · запись 30 июня`), pink `Восстановить` door + bare `отмена`. Never restores blind.
4. **Erase = an armed card** with a visible 4-second un-arm drain bar: `НАЧАТЬ ЗАНОВО · 1-Й ТАП`, `Стереть всё и начать заново?`, `профиль · план · сад — всё`.
5. Globe chip stays 44 px top-right (already present) — just size-lock it.

The current `ssNew` arm-in-place (relabels the bare word) and `ssLoad` (opens the OS file picker directly) are **replaced** by these two cards. The file `<input id="ssFile">` and `parseBackup()` are reused inside the load card.

---

## 2. CSS — add to `index.html`

All colours pulled from the widget + `:root` (line 20: `--pink:#ff4fa0; --blue:#2a9fe0; --ok:#28cf86`). Ink border = `#160510`, hard shadow `0 Npx 0 #160510` (matches existing `.ss-btn`, line 85). NIGHT card bg = `#2c081a` (matches `.ss-langmenu`, line 54). Ember gold `#ff8a3d`→`#ffc41f`.

**Insert after line 92** (`.ss-new{ color:#c4a0b4; }`):

```css
  /* ===== intro verdict #17: ember day-tag ===== */
  .ss-tag.ss-ember{ display:inline-flex; align-items:center; gap:7px; color:#e9b9cf; font-size:15px; font-weight:700; letter-spacing:.2px; }
  .ss-tag.ss-ember .ti-flame{ color:#ff8a3d; font-size:17px; filter:drop-shadow(0 0 6px rgba(255,138,61,.55)); animation:ssFlick 2.6s ease-in-out infinite; }
  @keyframes ssFlick{ 0%,100%{ transform:translateY(0) rotate(-1deg); opacity:1; } 50%{ transform:translateY(-1px) rotate(1.5deg); opacity:.82; } }
  .ss-tag.ss-ember b{ font-weight:800; color:#ffe3f1; }

  /* ===== live GREEN GO door (primary when a block is running) ===== */
  .ss-primary.ss-go{ background:#28cf86; color:#0a3a24; }
  .ss-primary.ss-go .ti-player-play-filled{ font-size:20px; }

  /* ===== NIGHT preview card (Load) + armed-erase card (Start over) ===== */
  .ss-card{ width:100%; max-width:430px; background:#2c081a; border:3px solid #160510; border-radius:22px; box-shadow:0 6px 0 #160510; padding:18px 18px 16px; margin:0 auto; animation:ssRise var(--dur-enter) var(--ease-spring) both; }
  .ss-card-cap{ font-family:"Jost",sans-serif; font-weight:800; font-size:12.5px; letter-spacing:1.4px; text-transform:uppercase; color:#c78ab0; margin-bottom:12px; }
  .ss-card-cap.warn{ color:#e79a84; }
  /* profile row */
  .ss-profrow{ display:flex; align-items:center; gap:13px; margin-bottom:14px; }
  .ss-profrow .ti{ font-size:26px; color:#ff4fa0; flex:none; }
  .ss-profname{ font-family:"Jost",sans-serif; font-weight:800; font-size:21px; color:#ffe3f1; line-height:1.1; }
  .ss-profmeta{ font-family:"Jost",sans-serif; font-weight:600; font-size:13.5px; color:#b58aa6; margin-top:2px; }
  /* restore door — same chunk language as .ss-primary */
  .ss-restore{ width:100%; font-family:"Jost",sans-serif; font-weight:800; font-size:18px; cursor:pointer; border:3px solid #160510; border-radius:16px; box-shadow:0 5px 0 #160510; background:#ff4fa0; color:#4a1126; padding:16px; display:flex; align-items:center; justify-content:center; gap:8px; }
  .ss-restore:active{ transform:translateY(3px); box-shadow:0 1px 0 #160510 !important; }
  .ss-cancel{ display:block; width:100%; text-align:center; margin-top:11px; background:none; border:none; font-family:"Jost",sans-serif; font-weight:700; font-size:14px; letter-spacing:.4px; color:#9a7f92; cursor:pointer; }
  .ss-cancel:active{ opacity:.6; }
  /* armed-erase card body */
  .ss-eraserow{ display:flex; align-items:flex-start; gap:11px; margin-bottom:9px; }
  .ss-eraserow .ti-alert-triangle{ font-size:22px; color:#e79a84; flex:none; margin-top:2px; }
  .ss-erasettl{ font-family:"Jost",sans-serif; font-weight:800; font-size:18px; color:#ffe3f1; line-height:1.15; }
  .ss-erasescope{ font-family:"Jost",sans-serif; font-weight:600; font-size:13.5px; color:#b58aa6; margin:0 0 14px 33px; }
  /* the 4-second un-arm drain bar */
  .ss-drain{ height:6px; border-radius:6px; background:rgba(255,79,160,.16); overflow:hidden; }
  .ss-drain > i{ display:block; height:100%; width:100%; border-radius:6px; background:linear-gradient(90deg,#ff4fa0,#ff8ac0); transform-origin:left center; animation:ssDrain 4s linear forwards; }
  @keyframes ssDrain{ from{ transform:scaleX(1); } to{ transform:scaleX(0); } }
```

---

## 3. RENDER JS — `app.js`

### 3a. Ember day-tag helper + live-door label

**Insert after line 1852** (the closing `}` of `showStartScreen`) — new helpers:

```js
  // intro #17: days-together = days since the pact was made (fallback 1). Pure read.
  function ssDaysTogether() {
    try { var p = S.profile && S.profile.pact && S.profile.pact.ts; if (!p) return 1; return Math.max(1, daysSince(key(new Date(p))) + 1); } catch (e) { return 1; }
  }
  // intro #17: the live block for the GREEN GO door — reuse trackerState(); return its title or null.
  function ssLiveBlock() {
    try { var st = trackerState(); if (st.id === "onplan" && st.block) return st.block.title; if (st.id === "break") return tr("Break"); if ((st.id === "off" || st.id === "onplan") && st.t) return st.t.title; return null; } catch (e) { return null; }
  }
```

### 3b. Re-skin `showStartScreen` — ember tag + green GO door

In `showStartScreen()` **replace this block** (`app.js:1832-1836`):

```js
    if (prim) prim.innerHTML = has ? 'Continue' : 'Start'; // §12 frame 11: one clean word on the pink slab — no icon
    if (nb) { nb.style.display = ""; nb.innerHTML = 'Start fresh'; } // bare word (frame 11); not "game" — it's a life app, not a game (David v660)
    ssLangLabel();
    var vEl = el("ssVer"); if (vEl) vEl.textContent = appVer(); // show the live build number (auto-synced from the app.js?v= tag preship bumps) — David 2026-07-01
    ss.classList.add("on");
```

**with:**

```js
    var liveT = has ? ssLiveBlock() : null;
    if (prim) {
      prim.classList.toggle("ss-go", !!liveT);
      if (liveT) prim.innerHTML = '<i class="ti ti-player-play-filled"></i> ' + tr("Return") + ' · ' + esc(liveT);
      else prim.innerHTML = has ? 'Continue' : 'Start'; // §12 frame 11: one clean word on the pink slab
    }
    if (nb) { nb.style.display = ""; nb.innerHTML = 'Start fresh'; } // bare word (frame 11); not "game" — it's a life app (David v660)
    ssLangLabel();
    // ember day-tag under ALTER (intro #17) — replaces the static tagline
    var tagEl = document.querySelector("#startScreen .ss-tag");
    if (tagEl) {
      if (has) { tagEl.classList.add("ss-ember"); tagEl.innerHTML = '<i class="ti ti-flame"></i> ' + tr("day") + ' <b>' + ssDaysTogether() + '</b> ' + tr("together"); }
      else { tagEl.classList.remove("ss-ember"); tagEl.textContent = tr("your guardian angel"); }
    }
    var vEl = el("ssVer"); if (vEl) vEl.textContent = appVer();
    ss.classList.add("on");
```

> The green GO door reuses `ssPrimary`'s existing `onclick = ssEnter(has)` (line 1837) unchanged — entering the app already lands on the live tracker, so "Вернуться · <block>" is honest with zero new nav wiring.

### 3c. Load card — replace the blind file-open

**Replace** `app.js:1841-1851` (the `var lf = el("ssLoad")` … block) **with:**

```js
    var lf = el("ssLoad"), fi = el("ssFile");
    if (lf && fi) {
      lf.onclick = function () { ssShowLoadCard(); }; // intro #17: never restore blind — preview the life inside the file first
      fi.onchange = function () {
        var f = fi.files && fi.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () { var d = parseBackup(String(r.result || "")); if (!d) return; ssRenderLoadPreview(d); };
        r.onerror = function () { try { toast(tr("Couldn't read that file.")); } catch (e) {} };
        r.readAsText(f);
      };
    }
```

### 3d. Load-preview + erase cards — new functions

**Insert after the new `ssLiveBlock()` helper (from 3a):**

```js
  // ===== intro #17: LOAD = a NIGHT preview card (never restore blind) =====
  var _ssPend = null; // the parsed backup awaiting confirm
  function ssCardHost() { var ss = el("startScreen"); if (!ss) return null; var h = el("ssCard"); if (h) return h; h = add(ss, "div", "ss-cardov"); h.id = "ssCard"; h.style.cssText = "position:absolute;inset:0;z-index:8;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(10,3,10,.62);backdrop-filter:blur(3px);"; h.onclick = function (e) { if (e.target === h) ssCloseCard(); }; return h; }
  function ssCloseCard() { var h = el("ssCard"); if (h) h.remove(); _ssPend = null; }
  function ssShowLoadCard() { var fi = el("ssFile"); if (fi) { fi.value = ""; fi.click(); } } // pick the file → onchange calls ssRenderLoadPreview
  function ssRenderLoadPreview(d) {
    _ssPend = d;
    var h = ssCardHost(); if (!h) { return; } h.innerHTML = "";
    var c = add(h, "div", "ss-card");
    add(c, "div", "ss-card-cap", "ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ"); // pre-translated caption (see I18N note)
    var nm = (d.profile && d.profile.name) || tr("your save");
    var days = 1; try { var pk = d.profile && d.profile.pact && d.profile.pact.ts; if (pk) days = Math.max(1, daysSince(key(new Date(pk))) + 1); } catch (e) {}
    var lastK = null; try { var lk = Object.keys(d.log || {}).sort(); lastK = lk[lk.length - 1] || null; } catch (e) {}
    var row = add(c, "div", "ss-profrow"); add(row, "i", "ti ti-user-circle");
    var col = add(row, "div"); add(col, "div", "ss-profname", esc(nm));
    add(col, "div", "ss-profmeta").innerHTML = days + " " + tr("days") + " · " + tr("saved") + " " + (lastK ? ssHumanDate(lastK) : "—");
    var go = add(c, "button", "ss-restore"); go.innerHTML = tr("Restore");
    go.onclick = function () { if (!_ssPend) return; try { localStorage.setItem(KEY, JSON.stringify(_ssPend)); } catch (e) { try { toast(tr("Couldn't load — storage may be full.")); } catch (e2) {} return; } location.replace("index.html?cb=" + Date.now()); };
    add(c, "button", "ss-cancel", tr("cancel")).onclick = ssCloseCard;
    if (curLang() !== "en") { try { translateTree(c); } catch (e) {} }
  }
  function ssHumanDate(k) { try { var d = new Date(k + "T00:00:00"); return d.toLocaleDateString(curLang() === "en" ? [] : "ru-RU", { day: "numeric", month: "long" }); } catch (e) { return k; } }

  // ===== intro #17: START OVER = an armed card with a visible 4-second un-arm drain =====
  var _ssEraseTO = null;
  function ssShowEraseCard() {
    var h = ssCardHost(); if (!h) return; h.innerHTML = "";
    var c = add(h, "div", "ss-card");
    add(c, "div", "ss-card-cap warn", "НАЧАТЬ ЗАНОВО · 1-Й ТАП");
    var row = add(c, "div", "ss-eraserow"); add(row, "i", "ti ti-alert-triangle");
    add(row, "div", "ss-erasettl", tr("Erase everything and start over?"));
    add(c, "div", "ss-erasescope", tr("profile · plan · garden — all of it"));
    var drain = add(c, "div", "ss-drain"); add(drain, "i");
    add(c, "button", "ss-restore", tr("Erase everything")).onclick = function () { if (_ssEraseTO) clearTimeout(_ssEraseTO); try { localStorage.clear(); } catch (e) {} try { sessionStorage.clear(); } catch (e) {} location.replace("index.html?cb=" + Date.now()); };
    add(c, "button", "ss-cancel", tr("cancel")).onclick = function () { if (_ssEraseTO) clearTimeout(_ssEraseTO); ssCloseCard(); };
    if (_ssEraseTO) clearTimeout(_ssEraseTO);
    _ssEraseTO = setTimeout(function () { ssCloseCard(); }, 4000); // un-arms in lockstep with the drain-bar animation
    if (curLang() !== "en") { try { translateTree(c); } catch (e) {} }
  }
```

### 3e. Wire `ssNew` (Start fresh) to the armed card

In `showStartScreen()` **replace the entire `ssNew` arm-in-place handler** (`app.js:1840`, the line beginning `if (nb) { var armed = false, t = null; nb.onclick = ...`) **with:**

```js
    if (nb) { nb.onclick = function () { ssShowEraseCard(); }; } // intro #17: erase is a real armed door with a 4s un-arm drain, not an in-place relabel
```

---

## 4. WIRING

- **No nav changes.** Everything lives inside the already-shown `#startScreen`. The two cards are an in-screen overlay (`#ssCard`, `position:absolute; inset:0`) added to `#startScreen` and removed on cancel / tap-scrim / 4-s timeout.
- `ssPrimary` GO door: unchanged `onclick` (`ssEnter(has)`), only class + label change → returning user lands on the live tracker, matching "Вернуться".
- `ssLoad` → `ssShowLoadCard()` → OS file picker → `ssFile.onchange` → `parseBackup()` → `ssRenderLoadPreview()` → `Восстановить` writes `KEY` and reloads. Reuses the existing `<input id="ssFile">` (index.html:1949) and `parseBackup` (app.js:4745).
- `ssNew` → `ssShowEraseCard()` → `Стереть всё` clears storage + reloads.
- **Guards already cover it:** the global auto-nav/erase watchers (`app.js:79`, `1911`) bail while `#startScreen.on`, so the cards can't collide with carousel/hold-to-erase logic.

---

## 5. I18N — new English strings → `I18N.ru` values

Add to the `Object.assign(I18N.ru, {…})` block (app.js:1636). The two ALL-CAPS captions are hard-coded Russian already (`ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ`, `НАЧАТЬ ЗАНОВО · 1-Й ТАП`) so they render correctly even in EN preview and need no dict entry — but list them EN→RU too for completeness if you'd rather key them.

| English string | I18N.ru |
|---|---|
| `Return` | `Вернуться` |
| `day` | `день` |
| `together` | `вместе` |
| `days` | `дней` |
| `saved` | `запись` |
| `Restore` | `Восстановить` |
| `cancel` | `отмена` |
| `your save` | `твоё сохранение` |
| `Erase everything and start over?` | `Стереть всё и начать заново?` |
| `profile · plan · garden — all of it` | `профиль · план · сад — всё` |
| `Erase everything` | `Стереть всё` |
| `Break` | `Перерыв` |
| `Couldn't read that file.` | `Не удалось прочитать файл.` |
| `Couldn't load — storage may be full.` | `Не удалось загрузить — память переполнена.` |

(If you key the captions: `LOAD · LIFE FOUND` → `ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ`; `START OVER · TAP 1` → `НАЧАТЬ ЗАНОВО · 1-Й ТАП`.)

---

## 6. REGRESSION RISKS

- **Erasing David's real data** is the only P0. The two-tap→armed-card change is *safer* (adds a visible scrim + confirm door), but confirm the `localStorage.clear()` path is still gated behind the second explicit tap on `Стереть всё`, never on card-open. The 4-s timeout only *closes* the card; it never erases.
- **`trackerState()` at boot.** `ssLiveBlock()` calls it while the app is still behind the splash. It's a pure read of `S` and already runs during boot elsewhere — but wrap in try/catch (done). If `S` isn't loaded yet, it returns `null` → pink Continue slab, no crash.
- **`translateTree` on the cards.** The app's rule (memory: display-layer translator, app reads no rendered text) holds — the cards carry no logic-bearing text. Call `translateTree(c)` only when `curLang()!=='en'` (done), mirroring `showStartScreen`.
- **Additive only:** no existing function is deleted; `ssLoad`/`ssNew` handlers are swapped, `ssPrimary` gains a class. If the cards regress, reverting is a 3-line rollback (restore the old `ssNew`/`ssLoad` handlers).
- **DEVICE-UNTESTED:** the drain-bar timing, scrim tap-dismiss, and green-door label wrap must be confirmed on David's iPhone — preview boots clean but gesture/scrim feel is device-untested.

---

## 7. FIDELITY CHECKLIST (vs widget)

- **ALTER wordmark:** untouched — existing `.ss-title` (Jost 700, 42px, 11px letter-spacing, white, pink glow) already matches the widget. ✓
- **Ember tag:** `ti ti-flame` gold `#ff8a3d` + `день N вместе`, N in Jost 800 white `#ffe3f1`; body `#e9b9cf` Jost 700 15px — matches the widget's small ember line. ✓
- **Green GO door:** fill `#28cf86` (=`--ok`), ink text `#0a3a24`, `ti ti-player-play-filled` glyph, `Вернуться · <block>` — matches the green slab. Ink border `#160510` + hard `0 5px 0` shadow inherited from `.ss-primary`. ✓
- **NIGHT load card:** bg `#2c081a`, ink border `#160510`, hard `0 6px 0` shadow — matches the plum night card. Caption `ЗАГРУЗИТЬ · НАЙДЕНА ЖИЗНЬ` Jost 800 12.5px 1.4px-tracked uppercase `#c78ab0`. ✓
- **Profile row:** `ti ti-user-circle` pink `#ff4fa0` 26px + `Давид` Jost 800 21px `#ffe3f1` + `41 день · запись 30 июня` Jost 600 13.5px `#b58aa6`. ✓
- **Восстановить door:** pink `#ff4fa0`, ink text `#4a1126`, Jost 800 18px, ink border + `0 5px 0` shadow. ✓
- **отмена:** bare word, Jost 700 14px `#9a7f92`, no box. ✓
- **Erase card:** warn caption `#e79a84`, `ti ti-alert-triangle` `#e79a84`, title `Стереть всё и начать заново?` Jost 800 18px, scope `профиль · план · сад — всё` Jost 600 13.5px. ✓
- **4-s drain bar:** 6px pink gradient (`#ff4fa0`→`#ff8ac0`) `scaleX(1→0)` over 4s linear — the visible un-arm timer. ✓
- **Globe chip:** existing `.ss-lang` `ti ti-world`, top-right — size-lock to 44px if needed (currently padding-sized; confirm on device). ✓
- **Tabler icons only, no emoji.** All glyphs are `ti ti-*`. ✓
- **Palette locked:** every hex is either `:root` (`--ok #28cf86`, `--pink #ff4fa0`) or the established night-card tints (`#2c081a`, `#160510`) already used by `.ss-langmenu`. No invented colours. ✓
