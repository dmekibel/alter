# Voice fix + izo language-gating — exact patch (2026-07-22)

**Two asks:** (1) make Millie actually switch; (2) add izo, language-gated — RU shows only izo, EN shows only Dave/Millie.

**Root cause of the Millie bug (confirmed):** `initVoices()` runs at app.js:289 (audio-module construction), BEFORE `load()` (app.js:14633) populates `S`. So `VOICE_PICK`/`gdir` boot to `"dave"` every time and nothing re-applies the persisted pick after load. The settings chip reads `S.voicePick` live, so it shows Millie selected while the audio module is still Dave = "selected but plays Dave."

**Fix principle:** resolve the bank **live from `S` + language at every play** (not a cached `gdir`), so the chip and the audio can never diverge; and language-gate it (RU→izo, EN→dave|millie). All edits are in the AUDIO module (app.js ~150–190, 277, 290) + the settings picker (~10597–10606) + one call after `load()` (14633). No SCHEMA/state change. Safe to ship BEFORE izo audio exists — RU just keeps falling back to the root Dmitry bank until izo clips land.

---

### EDIT 1 — app.js ~154–172, replace the gender-bank block

REPLACE:
```js
    var VOICE_PICK = "dave", gvset = null, gdir = null;
    function vdir() { return gdir; }
    function vpath(key) { return (gdir && gvset && gvset[key]) ? ("assets/voice/" + gdir + "/" + key + ".mp3") : ("assets/voice/" + key + ".mp3"); }
    function ckey(key) { return (gdir && gvset && gvset[key]) ? (gdir + ":" + key) : key; } // bufCache namespace
    function hasKey(key) { return !!((gvset && gvset[key]) || (vset && vset[key])); }
```
WITH:
```js
    // VOICE BANKS (David 2026-07-22): language-gated. RU → izo (the only RU voice); EN → dave | millie.
    // Bank resolves LIVE from S + language at every play (not a cached gdir) so the picker chip and the
    // audio can never diverge — that was the "Millie selected but plays Dave" bug: initVoices() ran before
    // load() populated S, so the bank booted to dave and the saved pick never re-applied.
    var VOICE_PICK = "dave", banks = {};   // banks[name] = manifest-set, lazily fetched
    function curBank() {
      try { if (typeof curLang === "function" && curLang() === "ru") return "izo"; } catch (e) {}
      try { if (typeof S !== "undefined" && S && S.voicePick === "millie") return "millie"; } catch (e) {}
      return "dave";
    }
    function bankHas(b, key) { return !!(banks[b] && banks[b][key]); }
    function vdir() { return curBank(); }
    function vpath(key) { var b = curBank(); return bankHas(b, key) ? ("assets/voice/" + b + "/" + key + ".mp3") : ("assets/voice/" + key + ".mp3"); }
    function ckey(key) { var b = curBank(); return bankHas(b, key) ? (b + ":" + key) : key; } // bufCache namespace (per bank)
    function hasKey(key) { return !!(bankHas(curBank(), key) || (vset && vset[key])); }
```

### EDIT 2 — app.js ~169–174, replace loadGenderBank + setVoice

REPLACE:
```js
    function loadGenderBank(name) { // load assets/voice/<name>/manifest.json → refresh gvset; gdir is set OPTIMISTICALLY by the caller and KEPT even if the manifest is slow/fails (David 2026-07-20: a flaky Millie manifest was nulling gdir → every clip fell back to the root/Dave bank = "switching to Millie doesn't work"). Both banks share the identical key set, so the standing gvset is a valid stand-in for folder-eligibility until the real one lands.
      if (!name) { gdir = null; gvset = null; return; }
      gdir = name;
      try { fetch("assets/voice/" + name + "/manifest.json" + cacheBust(), { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (a) { if (a && a.length) { var s = {}; a.forEach(function (k) { s[k] = 1; }); gvset = s; gdir = name; } }).catch(function () {}); } catch (e) {} // failure/empty: keep gdir=name + the standing gvset so the <name>/ folder still resolves (its files exist for every shared key); RU still falls to root because neither bank's gvset carries RU keys
    }
    function setVoice(name) { name = (name === "millie") ? "millie" : "dave"; if (name === VOICE_PICK && gdir === name) return; VOICE_PICK = name; gdir = name; loadGenderBank(name); } // OPTIMISTIC switch (David 2026-07-19/20): flip gdir NOW (unconditionally) so the next play uses the new bank's folder even if this device never had the old bank's manifest; the fetch just refreshes gvset. Both banks share the exact key set; buffers re-decode lazily from the new folder (namespaced cache).
```
WITH:
```js
    function loadBank(name) { // fetch assets/voice/<name>/manifest.json → banks[name] once; keep prior on failure
      if (!name || banks[name]) return;
      try { fetch("assets/voice/" + name + "/manifest.json" + cacheBust(), { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (a) { if (a && a.length) { var s = {}; a.forEach(function (k) { s[k] = 1; }); banks[name] = s; } }).catch(function () {}); } catch (e) {}
    }
    function applyVoice() { loadBank(curBank()); } // ensure the CURRENT bank's manifest is loaded — call at boot AND after load() (S ready) AND when language changes
    function setVoice(name) { // EN pick from the settings chips; in RU the bank is always izo so this is a no-op on choice
      name = (name === "millie") ? "millie" : "dave"; VOICE_PICK = name;
      try { if (typeof S !== "undefined" && S) S.voicePick = name; } catch (e) {}
      loadBank(curBank());
    }
```

### EDIT 3 — app.js ~187, in initVoices, replace the boot pick line

REPLACE:
```js
      try { var vp = (typeof S !== "undefined" && S && S.voicePick === "millie") ? "millie" : "dave"; VOICE_PICK = vp; loadGenderBank(vp); } catch (e) { loadGenderBank("dave"); }
```
WITH:
```js
      try { VOICE_PICK = (typeof S !== "undefined" && S && S.voicePick === "millie") ? "millie" : "dave"; } catch (e) {}
      applyVoice(); // may run before load() (S empty) → loads dave; the post-load applyVoice() below re-resolves to the saved/lang bank
```

### EDIT 4 — app.js ~277, warmAll uses the current bank not gvset

REPLACE `var keys = Object.keys(gvset || vset)` WITH `var keys = Object.keys(banks[curBank()] || vset)`.

### EDIT 5 — app.js ~290, export applyVoice

In the returned object add `applyVoice: applyVoice,` next to `setVoice: setVoice,`.

### EDIT 6 — app.js ~14633, re-apply the bank AFTER load() (THE bug fix)

REPLACE:
```js
    load(); loadFairy(); loadWorld(); treeFit();
```
WITH:
```js
    load(); try { TTS.applyVoice(); } catch (e) {} loadFairy(); loadWorld(); treeFit();
```

### EDIT 7 — app.js ~10597–10606, language-gate the picker (RU=izo only, EN=dave/millie)

Wrap the existing Dave/Millie chip block so it renders ONLY in English; in Russian show a single izo label (izo is the only RU voice, no toggle):
```js
    add(card, "div", null, tr("Guide")).style.cssText = "font-size:13.5px;font-weight:700;margin:16px 0 6px;";
    if (curLang() === "ru") {
      var izoRow = add(card, "div"); izoRow.style.cssText = "display:flex;gap:8px;";
      var ib = add(izoRow, "button", null, "izo"); ib.style.cssText = "flex:1;border:2px solid #c8a8ff;border-radius:12px;padding:11px 12px;font-family:var(--bub);font-weight:800;font-size:14px;color:#f0e6ef;background:#9a7cff;cursor:default;";
      // one RU voice; tap just previews
      ib.onclick = function () { try { TTS.unlock(); TTS.stop(); setTimeout(function () { TTS.speak("Устройся", { volume: (S.audio && S.audio.voice != null) ? S.audio.voice : 1 }); }, 300); } catch (e) {} };
    } else {
      /* existing Dave/Millie chip block (gvRow / gvChips / gvPaint / forEach) stays here, unchanged */
    }
```
(Keep the existing `gvRow`/`gvChips`/`gvPaint` code verbatim inside the `else`. The `add(card,... tr("Guide"))` header line at 10595 moves up so it's shared; delete its duplicate inside the else.)

---

### Ship + verify
- Preship (syntax + ratchets + version bump), then on device: EN → Dave/Millie both switch and sound different (the bug); switch app to RU → picker shows only izo, guided audio uses izo if generated else root Dmitry (no English leakage). Preview proves boot only; the voice SWITCH feel is device-confirmed by David.
- izo audio itself lands separately (gen-voice-izo.py, after the delivery pick). This patch is safe to ship before that — RU falls back to root until izo clips exist.
