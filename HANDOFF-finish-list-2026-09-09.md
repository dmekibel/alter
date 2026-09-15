# ALTER — David's finish list (spoken 2026-09-09, Israel)

Source: David to Alfred, verbatim priorities. Order = his order. Execute in the alter session; one item per ship.

1. **Planner rearrangement glitch** — drag/reorder "doesn't really work, kinda broken." Fix first.
2. **Day planner stuck in today** — no way to reach tomorrow or yesterday. Bring back the old scroll-down-into-next-day behaviour.
3. **Week view → day view** — tapping a day in week view expands back to day view. (Optional, NOT needed: zoom-out from day view goes to week view.)
4. **Finish the journey** — stones work, visually good end to end (v1410–v1422 already started this).
5. **Tools library redesign** — finish it.
6. **Tool audio** — (a) a 5-min selection (e.g. stretching) loops halfway through instead of playing through; (b) voice inflection sounds cut off at the start of some phrases. David will detail when the session reaches it.
7. **Garden** — design is broken vs what was built in Claude Code, menus "look all weird." Then add a few garden items (easy).
8. **Public vs dev build (Alan's idea)** — public version strips everything not ready; dev-tools toggle at the bottom re-enables it all for David's testing.

David's read: "it's very close." Ship loop + regression contract per `alter/CLAUDE.md`. Git hygiene: explicit paths only, never `git add -A`.

## v1429 — three worlds (2026-09-15)
Round H "Two Worlds" ported as a theme engine. Recolor only; every geometry gate passes in all three
worlds, and night was audited side by side against git HEAD (111 gates, same single pre-existing
animation failure). Spec + verify: `_design-sync/two-worlds-2026-09-15/`.

**DAVID'S ONE MOVE:** open `/fresh.html` on the phone. It lands in Water Lilies. Then You › Settings ›
**Look** to cycle Warhol → Night. Two things to verdict: (1) does either day world read right in real
daylight, and (2) **both your picks flatten all 12 domain colors into one hue family** — in Water Lilies
every tool coin, folder and planner block is the same magenta. That is exactly what the prototype
renders, so I built it faithfully rather than quietly "fixing" it. If you want the domain colors kept,
say so and it is a one-line change to the remap table.

**CLAUDE'S ONE MOVE:** on David's verdict, either keep it or re-derive the two worlds with `coins=1`
(the palette's own secondary set) so domains stay distinguishable, then re-run theme-gen and re-diff.

DEVICE-UNTESTED: all feel — daylight legibility, and the reload-on-switch in Look.

### v1434 — David's four corrections, all correct
Accent is a SEPARATE palette token (Warhol = gold #ffd062), not a coin — the home stone, its halo and the
primary button now wear it. WCAG contrast guard kills the light-on-light text. Theme swap keeps you in the
app. Look row wears the active accent. Plus the one they surfaced: `mixHex(x,"#160510")` means "toward the
page ground", which inverts on a light world — that was Water Lilies' unreadable navy CTAs.
Gates: night 112/112, lilies 103 PASS / 0 FAIL, warhol 100 PASS / 1 flaky pre-existing FAIL.

### v1437 — the highlight color, and a bug the round found
Round H's intro frame highlights spark/waits/yours/Alter in #ffc41f with a #ffd062 CTA; the round-2 contrast
guard had flattened them to dark ink. Added a `highlight` role (Warhol #ffc41f, Lilies #ca16af), white ALTER
wordmark, palette-colored guardian mark, accent CTA, and a `--t-track` token so the streak strip stays
visible with nothing planned. Found + fixed a real bug live since v1429: hexes inside HTML attributes were
rewritten to invalid markup (34 attributes, including every language-picker flag).
