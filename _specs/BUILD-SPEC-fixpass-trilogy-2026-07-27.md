# BUILD SPEC — FIX PASS: design-drift corrections on the tools trilogy (Opus, one session, one-shot)

Fable-specced 2026-07-27 from David's DESIGN-HANDOFF-NOTES **FIX PASS** (synced repo copy: `_design-sync/tools-menu-2026-07-27/DESIGN-HANDOFF-NOTES-2026-07-27.md`) + live pulls from the "Alter Design System" project. Corrects the v1222–v1224 surfaces: **@SEC:PICKER** (wall + shared footer) and **@SEC:EDITOR** (slabs + RunBar). Visual-value pass only: no new features, no listeners, no SCHEMA, no timeline touch. Navigate by grep anchors (`@SEC:PICKER`, `@SEC:EDITOR`, function names) — line refs below are v1224 hints only.

## Law hierarchy for this pass (conflicts are real; this is the order)
1. **The FIX PASS** — newest design-side verdict, written after reviewing `build-shots/`. It knowingly OVERRIDES the turn markup: the bloomed Start, the striped "Nothing in it yet" slab, the count badges and the 3-col flat minis are all IN the `.dc.html` itself — the build ported them faithfully, and the FIX PASS still kills them. Do not "restore fidelity to the turn"; that is the drift.
2. **DS guide tokens/laws** (pulled live 2026-07-27, verbatim below) — they confirm every FIX PASS item.
3. **Turn markup** — only where 1–2 are silent.

Local `.dc.html` warning: `Activity Picker` + `Stack Language Tournament` are TRUNCATED at 256 KiB (DesignSync cap — their tail data scripts are gone; that's why `{{f.bd}}`-style values are unfindable). `Session Editor` (175 KB) is complete. Every templated value you need is resolved below — don't chase the truncated files.

## Verbatim law (pulled from DS `tokens/colors.css` + `tokens/effects.css`)
- Ink `#160510` on everything · `--tile-night #1e0b18` · `--edge-ghost #4b2a44` · `--edge-ghost-fill rgba(255,242,249,.05)` · `--surface-3 #2a0d1c` (disabled fill) · `--text-faint #9a6a86`.
- Sticker shadows, no blur: tile `0 4px 0 ink` · button `0 5px 0 ink` · pressed `0 1px 0 ink`.
- "IGNITION STRIPES: a hue that is LIVE wears stripes; a hue at rest is flat."
- Press ladder: every depth collapses to `0 1px 0` on :active, travel matches the shrink.
- ActionBar disabled primary: fill `--surface-3`, text `--text-faint`, shadow `0 5px 0 ink`, opacity .7 — **never opacity-washed pink** (the build's `.pk-go` at `opacity:.45` is exactly the "desaturated maroon" in the screenshot).

---

## FIX 1–4 — the domain wall tiles (`pkPaintWall`, `.pk-folder`/`.pk-mini` CSS in index.html)
Rebuild the DOMAIN tile (the `DOM_ORDER` loop only — the SAVED & READY-MADE dashed tiles keep their current structure and classes):

- Grid cell = `button.pk-fcell` (background:none, border:none, padding:0, full-width column) containing:
  - `span.pk-ftile` — the card chrome: `display:flex; flex-direction:column; padding:11px 11px 12px; border-radius:20px; border:3px solid #160510; box-shadow:0 4px 0 #160510;` background set in JS per domain: `mixHex(hue, "#1e0b18", 0.88)` (= the 12% hue wash on `--tile-night`). **No hue in the border, no hue in the shadow** (kills the current `b.style.border/boxShadow` mixHex lines).
  - `span.pk-fname` under it — the domain name **centered UNDER the tile, in its hue**: Baloo 2 800, 15.5px, `margin-top:7px`, text-align:center, `color:hue`. No leading icon, **no count anywhere**.
- Tile interior = **2×2 fanned mini-sheets** (`acts.slice(0,4)`), not 6 flat coins. `.pk-mini` → `grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; padding:6px 0 0 6px` (room for shards poking up-left). Each mini = the app's existing peek-stack recipe (same as `.pk-deck`) at cell scale, `span.pk-mstack{aspect-ratio:1; position:relative}`:
  - shard2: `position:absolute; left:-6px; top:-6px; right:6px; bottom:6px; border-radius:26%;` bg `mixHex(hue,"#160510",0.55)`
  - shard1: same at `-3px/3px` offsets; bg `mixHex(hue,"#160510",0.28)`
  - face: `inset:0; border-radius:26%;` bg = full `hue`; box-shadow `"0 2.5px 0 " + mixHex(hue,"#000000",0.55)`; centered `i.ti` from `tiClass(a)`, font-size 15px, **color `#fff2f9` + `filter:drop-shadow(0 1.5px 0 rgba(0,0,0,.28))`** — never a lighter tint of the tile's own hue (FIX 3; this is what made orange-on-orange unreadable).
- Press (FIX 7): `.pk-fcell:active .pk-ftile{ transform:translateY(3px); box-shadow:0 1px 0 #160510; }` (4px depth → 3px travel).
- SAVED & READY-MADE: structure untouched, but the sub-line must **never show a count** — always the designed phrase (`your arrangements` / `on your shelf`); delete the `N saved` branch. (Counts are data slop — FIX 4 applies to the whole wall.)
- CSS cleanup: `.pk-minic`, `.pk-fl`, `.pk-fn` die with the old tile; `.pk-frow`/`.pk-ftx`/`.pk-ftl`/`.pk-fts` stay (special tiles use them).

## FIX 5 — stripes are ignition only (editor idle slabs)
- **Delete `.sed-empty`** — the CSS rule and the render branch in `sedPaintBlocks` (grep `sed-empty`). The dashed "＋ Add a block" row alone IS the empty state (2b/4a: single dashed row). The `"Nothing in it yet"` string STAYS — the Start/Save empty-list toasts use it.
- `.sed-add`: **remove the `background-image` stripes**. Keep verbatim: fill `rgba(255,95,168,.06)`, `border:4.5px dashed #ff4fa0`, glow `0 0 24px rgba(255,79,160,.28)`, and the chevron law (collapsed=plus/up, expanded=down) as built.
- Editor block FACES keep their candy stripes (`.sed-stripe`) — striped block faces are the 2b design; FIX 5 kills stripes on **dashed idle surfaces** only.

## FIX 2 — editor block rows get the legal glow ("glow + sticker")
- `.sed-row`: border `4.5px` → **`3px solid #160510`**.
- `sedRow()` unselected inline shadow (grep `0 0 28px color-mix`) → prepend the sticker bar: `"0 5px 0 #160510, 0 7px 18px rgba(0,0,0,.45), 0 0 28px color-mix(in srgb, " + hue + " 46%, transparent)"`. (Glow may exist ONLY here — big color slabs, on top of ink edge + bar. `color-mix` on the CSS var is the already-shipped pattern in this function; keep it. If the device shows no glow, the fallback is `hexA(DOM[r.d].c, .46)` — hexA exists, grep `function hexA` — but do not preemptively churn.)
- `.sed-row.sel` (pink ring + pink glow) stays — selection is a live state.

## FIX 6a — wall/sheet footer (`pkFoot`, `.pk-bark`/`.pk-go` CSS)
- `.pk-bark`: add `text-transform:uppercase` (kicker renders caps from the existing sentence-case strings — no new i18n keys).
- Empty state (n=0) in `pkFoot`: **kicker VISIBLE** = `tr("Tap what you feel like")`, color `#96637e`; **label hidden**. (Kills the giant white sentence; existing RU translation rides along.)
- `.pk-go` disabled (n=0): remove `opacity:.45`; set `background:#2a0d1c; color:#9a6a86; box-shadow:0 5px 0 #160510; opacity:.7` (ActionBar law). Enabled state unchanged (`#ff4fa0`, `3px solid #160510`, `0 5px 0 #4a0e2c`, ink text). No-op click stays.
- Verbs already correct: Arrange (2+) / Add to today (1). n=1 / n≥2 kicker+label states already correct — don't touch.

## FIX 6b — editor RunBar (`.sed-fsave`/`.sed-fgear`/`.sed-fstart`)
- Save + gear = **ghost squares**: `border:2.5px solid #4b2a44; background:rgba(255,242,249,.05); box-shadow:none` (they currently wear invisible ink borders + soft `0 7px 18px` shadows — that's the "borderless gray"). Icon colors stay (save `#fff2f9`, gear `#ff8fc0`).
- `.sed-fgear.on`: keep pink bg + ink icon; add `border-color:#160510` (live state).
- `.sed-fstart`: shadow → **`0 5px 0 #160510` only** (kills the `0 7px 18px` soft AND the `0 0 34px` pink bloom). Keep `#ff4fa0`, `2.5px solid #160510`, ink text `#2a0d1c`.
- `.sed-fstart:active`: `transform:translateY(4px); box-shadow:0 1px 0 #160510`.

## FIX 7 — press-ladder sweep (both surfaces, CSS-only elements)
Law: any element with a hard-offset sticker `0 Npx 0 C` gets `:active { transform:translateY(N−1 px); box-shadow:0 1px 0 C; }`. Flat/ghost/dashed elements keep their small translateY. Apply to: `.pk-fcell→.pk-ftile` (new, above) · `.pk-go` (align travel 3px→4px; collapse already there) · `.sed-fstart` (above) · `.sed-tool:active .sed-toolcoin` (`0 4px 0 rgba(0,0,0,.34)` → `0 1px 0` same, parent translateY 3px) · `.sed-vcard`/`.sed-scell` (`0 4px 0 rgba(0,0,0,.3)` → same collapse, translateY 3px). `.pk-nameok` is already correct. SKIP elements whose sticker is set inline per-hue (queue coins, sheet bundles, arranger bubbles) — collapsing those needs a refactor; out of scope this pass.

## FIX 8 — copy
- Wall title (grep `tr("What next?")` in `pkPaintShell`): → `tr("What's next?")`. RU dict (grep `"What next?"` in the PICKER i18n block): rename key to `"What's next?"`, same value `"Что дальше?"`. Kicker (`3H 30M OPEN · AFTER DEEP WORK` composition) is correct as-is.

## FIX 9 — the blank tool coin
- `SED_CATS` breath row (grep `"ti-nose"`): → **`ti-arrows-left-right`**. EVIDENCE: `ti-nose` does not exist in tabler-icons-webfont@3.31.0 (checked against the loaded CDN css 2026-07-27 — that's why the coin renders empty); the app's own `v_nostril` registry entry already uses `ti-arrows-left-right`, and `ti-lungs` is taken by box breath.

## Scope guards — do NOT touch
- `pkSkin` choice-row v3 + tray category chips: hue outline at REST is the legal choice-control state (FIX 1's named exception).
- SAVED & READY-MADE dashed tiles' gold-mixed dashed edges (unflagged; dashed grammar).
- Arranger: already compliant (ink borders, `0 5px 0 #160510`, no glow). Folder sheet, tune panel, rails: untouched except the shared footer above.
- Editor tray coins: already `#fff2f9` + drop-shadow — compliant, leave.
- Zero listener changes, zero `S` writes, byte-identical wall/sheet footer contract preserved (both call `pkFoot`).
- This pass also CLOSES the two "builder interpretation calls" from the 07-27 trilogy block: single dashed add-row = validated (FIX 5); bright tray coins = validated (unflagged).

## Verification + ship
1. `bash _dev/preship.sh` — ratchet must PASS (wipes ≤147: all edits are value-level or inside existing child-drain renders; SCHEMA untouched).
2. Preview (launch.json `alter`, port 8123, mobile preset): boot clean, zero console errors. Re-shoot and check **against FIX PASS items 1–9 one by one**: tap-empty-slot → wall (tiles, footer, disabled Add-to-today, title); pick 1 + 2 things (footer states, pink primary); toolbox Build tile → editor (single de-striped dashed row, RunBar ghosts + flat-sticker Start, breath tray → one-nostril glyph); select a block row (ring) vs rest rows (glow+sticker+bar).
3. `DEV.designAudit()` not required (home paint untouched) — the edits live entirely in `.pk-*`/`.sed-*`.
4. Regression contract 1–4: untouched by construction (overlay-only). Honest report: **"boots clean; visuals preview-verified against the FIX PASS; gesture feel unchanged — the v1224 DEVICE-UNTESTED list still stands, verdict on the phone."**
5. Ship: commit + push + `/fresh.html` link. Update the 07-27 status block in `TRACKER-HANDOFF-2026-07-19.md`.

## FOR THE DESIGN PROJECT (not this build — next design session)
- `--on-hue:#2a1730` in DS tokens contradicts the app's ink-on-hue `#160510`; repo is the system of record — design should re-sync, not the app adopt.
- `DomainBento.jsx` still carries `count` + 3-col flat minis — supersede it with the FIX PASS folder-tile recipe (2×2 fanned, no count, name under).
- The local `_ds` bundle in `_design-sync/tools-menu-2026-07-27/` is a stale extraction (FireChip present, DomainBento absent) — don't trust it as the guide.
