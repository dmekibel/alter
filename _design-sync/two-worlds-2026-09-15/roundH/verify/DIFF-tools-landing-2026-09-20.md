# DIFF — tools library, David's three device reports (2026-09-20)
Measured in the preview at 430x932 (iPhone 16 Pro Max). `.tf-inner` scales the 402 artboard by 1.0697,
so every number below is divided back to artboard px and compared to `PORT-SPEC-tool-library.md`.

## 1 · the gap under FOR YOU NOW
| measure (artboard px) | frame (Round H) | build BEFORE | build AFTER |
|---|---|---|---|
| suggestion row face-top → grid row-1 face-top | 130 | 154.6 | **130.6** |
| grid row pitch | 116 | 116.3 | 116.3 |
| suggestion label bottom → grid row-1 face top | 27.4 | 48.1 | **23.9** |
| grid's own label bottom → next face top | 26.7 | 24.0 | 24.0 |

The frame's 130-vs-116 difference is entirely the SECOND LABEL LINE the suggestion cards carry
("label ... wraps to 2 lines", PORT-SPEC). The designed block gap IS the grid's own row gap.
The build had stacked `.tbx-sugg` padding-bottom 12 + the `.tbx` flex gap 12 + `.tbx-bento`
padding-top 24 = 48px, i.e. 24px of invented air. Now 0 + 12 + 12 = 24.

## 3 · a folder opens without moving its row
Stacks (row 1, col 1) and Heart (row 2, col 2), rects before → after the open, at 430x932:

| tile | before (top,left,w,h) | after |
|---|---|---|
| breathe | 1260.3, 160.4, 109.1, 98.7 | 1260.3, 160.4, 109.1, 98.7 |
| meditate | 1260.3, 278.1, 109.1, 98.7 | 1260.3, 278.1, 109.1, 98.7 |
| body | 1384.7, 42.8, 109.1, 98.7 | 1384.7, 42.8, 109.1, 98.7 |
| vision | 1384.7, 278.1, 109.1, 98.7 | 1384.7, 278.1, 109.1, 98.7 |

Identical. Only rows BELOW the opened row translate down (catch/reset/recover 1509.1 → 1672.7).
DOM order with Heart open: stacks breathe meditate · body heart vision · **panel** · catch reset recover …

## gates
`node --check` OK · structure ratchets pass (wipes 129 ≤ 129, SCHEMA 9) · port-lock pass ·
`DEV.designAudit()` ALL PASS (95), 5 Round-38 skips · zero console errors.
DEVICE-UNTESTED: the open/close settle motion and the scroll feel.
