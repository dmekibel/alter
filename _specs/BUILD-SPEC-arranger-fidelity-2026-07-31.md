# BUILD-SPEC — Arranger fidelity pass (2026-07-31)

**Authority:** David's posted expectation artifact (2026-07-31) = canvas frames 16a/17a in `_design-sync/tools-menu-2026-07-27/Activity Picker.dc.html` lines 503–629. It OUTRANKS the design-handoff prose — the prose's "NO grip line" and "chevron: collapsed = up" (BUILD-SPEC-tools-trilogy line 61) are design-side-Claude inventions David never drew (v1239 DESIGN AUTHORITY LAW class). David adjudicated today by posting expectation-vs-reality.

**Edit sites, ONLY these:** `app.js` → `pkPaintArr()` (~6251–6278, one line in 6267 area) · `index.html` → `.pk-*` arranger CSS (~2091–2115). Picker is an overlay; ZERO timeline listeners; regression zone untouched. No new innerHTML wipes (keep the `add()` pattern). No schema change. Do NOT touch `tbxCandy`, `pkDragWire` semantics, `pkPaintWall`, or anything outside the arranger render.

## The 6 fixes (canvas-verbatim values)

1. **Peek cards carry the NEXT STEPS' own hues** (app.js ~6261-6262). Today: `mixHex(hue,"#160510",.55/.3)` → muddy same-hue. Canvas 16a (605-606): front peek = a step's full hue (#2fbe86), back peek = another step's full hue (#2ab8c4), borders stay ink. Change: front `.pk-apk1` background = `(p.st0[1] && p.st0[1].c) || mixHex(hue,"#160510",.3)`; back `.pk-apk2` = `(p.st0[2] && p.st0[2].c) || skip`. Render apk1 only when st0.length ≥ 2, apk2 only when ≥ 3. Keep the existing open-state opacity fade.

2. **Grip dash on EVERY bubble** (render + CSS). New span `.pk-agrip` appended inside `.pk-ahead`: `position:absolute; left:50%; bottom:3px; transform:translateX(-50%); width:34px; height:3.5px; border-radius:2px; background:rgba(22,5,16,.35); pointer-events:none;` (canvas 512/529/571/599). `.pk-ahead` padding `12px 15px` → `12px 15px 14px` (canvas 521) so the dash seats. On CHAIN rows the dash fades with the peeks when open (opacity 0 when `open`, `transition:opacity .3s ease` — canvas 529); on activities always visible. Decorative only — whole-bubble drag + tap-toggle unchanged.

3. **Chevron: CHAINS ONLY, collapsed = DOWN** (app.js ~6270). Today every row gets one and it's inverted. Change: render the chevron only `if (isChain)`; direction: `ch.style.transform = open ? "rotate(180deg)" : "none"` (`ti-chevron-down` → points DOWN when collapsed, UP when expanded — canvas 528 + David's artifact). Replace the stale `(David 2026-07-27)` comment with: `// David's artifact 2026-07-31: chevron on chains only; collapsed = down. The prose's "collapsed=up" was design-side invention.` Activities keep tap-to-unfold, no icon.

4. **Subtitle law** (app.js ~6267). Chains → `(p.st0||[]).length + " " + tr("steps") + " · " + tr("chain")`, uppercased (canvas 525: "6 STEPS · CHAIN", 9.5px/800/ls1 — existing `.pk-as` covers it). Activities → NO subtitle at all (delete the domain-label branch; single-line title, canvas 510). `.pk-at` line-height 1.15 → **1.05** (canvas 524).

5. **Gutter dash ONLY on same-hour rows** (app.js ~6259 + CSS 2095). Today a dash always renders (under numerals too). Change: add `.pk-gutd` ONLY when `same`; size **11px × 4px**, radius 2, background `#6b4a5e` (canvas 603); seat it with `margin-top:10px` (gutter pad-top 10 + 10 = canvas's 20px optical seat, no numeral present). Delete the 14px/18px width logic and the always-render.

6. **Row stripes at 74% mix** (app.js ~6264). Header background: replace `tbxCandy(hue)` with an arranger-local candy — `"repeating-linear-gradient(45deg, color-mix(in srgb, " + hue + " 74%, #fff) 0 9px, " + hue + " 9px 18px)"` (canvas 508/521/567 use 74%, not the wall's 82%). Do NOT modify `tbxCandy` itself (wall/choice-rows stay 82% per FP2).

## Copy
One new chrome word: "chain" (for the "· CHAIN" suffix). Chrome-register like the shipped "STEPS"; add the RU dict entry beside the existing "steps" key (RU: "цепочка"). No other new lines. (Gate 1 on the composed label passes — label register, no prose.)

## Agent checks before returning
- `node --check app.js` clean.
- grep: no new `innerHTML` assignments in the touched region.
- Confirm `pkPaintArr` still renders: gutter → peeks → bubble → head(icon/title/sub?/mins/chevron?/grip) → fold, and `pkArrBody` untouched.
