# GARDEN MVP SPEC — the Grove (2026-08-08; BUILD-PHASE ADDENDUM 2026-08-12)

## BUILD-PHASE ADDENDUM (2026-08-12, David: "its building time")
- **VISUAL SOURCE OF TRUTH:** `_specs/_newera-build/GARDEN-GROVE-DESIGN-REF-2026-08-12.html` — the 8 frames (6a entry flower, GF1, 11A, 14A, 14B, GF6, GF7, GF8) extracted VERBATIM from the post-fix-pass `The Garden - All Menus.dc.html`. Structure, spacing, and copy come from there; every hex from the token sheet below or the app's own `:root`. Copy: all 122 extracted lines already PASS Gate 1 (2026-08-12) — reuse the design file's lines verbatim, do not rewrite them.
- **TOKENS (pulled live 2026-08-12, token-sheet gate satisfied):** menu hues `--menu-habits:#12d68f` (= --menu-nourish), `--menu-virtues:#ff3f9e`, `--menu-goals:#1fb0f5`, `--menu-store:#ffc41f`. Ink `#160510`, on-hue `#2a1730`, night surfaces/text per `tokens/colors.css` (matches app `:root`, the system of record).
- **THE ENTRY:** a flower on the sanctuary island; tapping it unfolds the menu-coin column bottom-right (corner-sanctity law). Canon animation (design-chat locked): shared 45deg spin, counter-clockwise to close, concurrent with the sheet slide. **THIS PHASE SHIPS ONLY THE HABITS COIN** (no-empty-scaffolding law): the other three coins appear as their menus get built, the column grows with the game. Flagged for David's veto.
- **LABELS:** a plant's name IS its habit ("Meditation", "Evening pages"): NO pet names (David 2026-08-12).
- **THE ROAD stage names (from the frames):** seed · sprout · seedling · sapling · young tree · slender · crown · first buds · in bloom · ancient.
- **THE SCIENCE ladder (14B):** time-bucketed cards (THE SAME DAY / THE FIRST WEEKS / AFTER TWO MONTHS / OVER YEARS) with source chips (Zeidan et al. 2010, Hölzel et al. 2011, Lutz et al. 2008; congrats cites Lally et al. 2010). Ship the meditation set from the frames; movement/wind-down science = follow-up content pass.
- **SPRITES:** exported to `assets/grove/` (apple/peach/cherryb s1-s10, max 256px tall, 30 files, done 2026-08-12).

David's verdict trail: this session's garden rounds 1-9 (state in memory `alter-garden-ui-round`), the round-9 combined grove walkthrough (GF1-GF8, design project "Tools menu redesign directions", `Garden Systems Showcase` lineage), MVP scope cut confirmed by David ("cuz now we making mvp" + "sure"). This spec is build-ready for an Opus pass per CLAUDE.md rule 0. NOT a design doc: values here are law unless David's frames contradict them (FRAME-WINS order applies).

## SCOPE: THE GROVE, ALONE
One garden menu button (the grove), the walkthrough surfaces, the first-seed onboarding beat, and the world-planted trees. NOTHING else ships: no virtues/topiary, no goal tiers, no store, no house eras, no letters, no interior, no bench mode, no home cue. All parked, all designed, all in `_design-sync/garden-2026-08-03/`.

## SPECIES (MVP set of three, from `sprites-all/`, 10 stages each)
- `apple-s1..s10` = MOVEMENT (golden apples, never red)
- `peach-s1..s10` = WIND-DOWN / sleep
- `cherryb-s1..s10` = MEDITATION (ancient stage is the weeping form)
Tutorial seeding order LAW (Johnson Big 3): the first seed offered is apple or peach (energy funds everything); cherry unlocks as the second practice. Future species generate later through the locked fruit-tree prompt template (`scratchpad gen_fruittrees.sh` recipe: true-scale row, shape-first crowns, silhouette-distinct finals).

## GROWTH FORMULA (MVP-simple, honest)
- One practice-day = 1 growth credit. Additional sessions the same day add NOTHING in MVP (gardens grow by days, not binges: consistency is the driver). Floor law: a 1-minute floor session earns the full day credit.
- Stage thresholds, cumulative practice-days: s2=1, s3=3, s4=6, s5=10, s6=15, s7=21, s8=30, s9=45, s10=66. (66 = the Lally 2010 habit-formation median: stage 10 IS the science, citable in the card.)
- Rhythm-window gates for late stages: DEFERRED to v1.1. Pauses never regress anything, ever.
- Stage-up is WITNESSED, not automatic: at threshold the plant enters "ready" (soft sparkle, the app's one allowed glow); player walks to it and HOLDS (existing hold-ring grammar, ~820ms) to advance. Stage-up awards +5 gems via existing earn().
- Focus-plant law (dormant in MVP, written now): any future focus/deep-work species grows only from planned-and-lived blocks, never raw logged hours.

## SURFACES (port from the round-9 walkthrough frames GF1-GF8; pull live markup via DesignSync before build, TOKEN-SHEET GATE applies)
1. GROVE LIST (GF1/GF8): full-height pulled-up sheet over the untouched island; rows = plant sprite at current stage (menu ramp scale), name, practice, forward-only line ("4 of 7 this week · 3 more → sapling"), stage pips; rows are doors. One striped practice CTA bottom ("Practise the fern · 10 min" = the neediest plant). Corners sacred (home door in sheet, anchor visible).
2. PLANT CARD (GF2/GF3): opens in place; THE ROAD ladder (all 10 stages on the compressed menu ramp, past dim, current lit, next grayed, stages beyond next DARK silhouettes: "the last stage stays dark until she earns it"); three honest numbers (total days, this week, to next stage); "this month" and "the science" buttons; practice CTA.
3. MONTH (GF4): X-marked month grid behind the "this month" button; copy law: "the chain pauses, never breaks."
4. SCIENCE (GF5): one plain sentence + one source chip + "another month like this" line + a quiet "where this comes from" door. Content: 3 curated cards per species for MVP, mined from fieldguide mechanism library, EVERY line through Gate 1 (`copy-audit.py`) + Gate 2 (adversarial judge vs COPY-ANCHORS) + source verified (Dad Law: no unverified citation ships).
5. CONGRATS (GF6): fires after the 3rd session of an unplanted practice: seed packet art, plain sentences, one science chip, [Plant your fern] / [Not yet]. Fogg-warm, zero cheese.
6. PLANTING (GF7): the island is the screen, three glowing candidate spots, tap one, [Plant here]. Player's hand plants. Part of onboarding when the 3rd session lands there.
7. MORNING AFTER (GF8): the new seed holds its row from day one ("planted yesterday · day 1"), CTA already knows the next move.

## THE TWO-SCALE LAW
- ISLAND: true relative scale as generated. Anchor: stage 5 ≈ 1 tile (48px base) tall; stage 10 ≈ 2.5 tiles. The drama is the point.
- MENU: compressed ramp: display height = 60 + 90 * (i/9)^0.8 px equivalent (stage 1 ≈ 60 → stage 10 ≈ 150 at card scale). Never true scale in a card, never identical sizes either.
- Proof strip: `_design-sync/garden-2026-08-03/fruittree-assets/TWO-SCALE-PROOF.png`.

## LAWS (carried, absolute)
- The garden sends ZERO notifications, forever. Nothing "misses you."
- No red, no wilt, no decay, no percent bars, no timers, no streak-guilt: dim = invitation; forward-only copy.
- Island art pixel-exact under sheets; corners always tappable; Tabler chrome only; sprites only for objects; Baloo 2 800 titles; every card ends in an action.
- One currency (gems). Planting is earned (3 sessions), never bought.

## DATA + BUILD NOTES (for the Opus builder)
- State: `S.grove = { plants: [{sp, practiceId, plantedK, days, lastCreditK, stage, tx, ty}] }`. SCHEMA bump + `MIG n→n+1` block mandatory (ratchet enforces). Region: `@SEC:GAME` (grep anchors, never line numbers).
- Day-credit hook: piggyback the existing `earn()` call sites for the three mapped practices; credit once per logical day (6am boundary, existing day-key convention).
- Sprites ship downscaled: export the 30 MVP stage sprites to `assets/grove/` at max 256px height (island) from `sprites-all/`; menu uses the same files scaled by CSS.
- The grove sheet is a NEW surface: no innerHTML wipe-and-rebuild (ratchet fails the ship if wipe count grows); targeted node updates.
- designAudit: add grove gates (sheet corners, CTA stripe recipe, row recipe) once frames are pulled.
- Preview proves boot + taps only; ALL gesture feel (hold-to-grow, sheet pull) ships DEVICE-UNTESTED and labeled so in the handoff.
- Copy: every user-facing line through SCRIPT-ENGINE + both gates before David sees it.

## OUT OF SCOPE (parked, do not build)
Virtues/topiary system, goals/WOOP/perks, store, house eras/housing wing, letters/mailbox, interior, bench presence mode, home cue, rhythm gates, additional species, duo garden, monetization.
