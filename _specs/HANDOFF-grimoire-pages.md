# HANDOFF — GRIMOIRE PAGES (multiple-choice guided journaling: the journey as a course that reads you back)
*2026-07-03 · Born from the Finch/Bend teardown session (`COMPETITOR-TEARDOWN-FINCH-BEND-2026-07-03.md`) + David's direction: "the journey contains many guided journaling sessions, multiple choice, that both educate and learn about you at the same time." Companions: `HANDOFF-first-day.md` (chapter zero), `GAMEPLAN-TOOLS-1000X-2026-07-03.md` (the closed-loop thesis this extends), `VOICE-BIBLE.md` (every line lints against it), `_course/` (the content source). Memories: [[day-one-contract]], [[never-hands-over]], [[no-random-features]], [[alter-mission-scientific-grimoire]].*

---

## 0. THE THESIS

> **Recognition, not production.** Typing is the most expensive act you can ask of a user — blank-page retrieval at a keyboard wall. A well-designed choice set teaches the option space in the same gesture that profiles the user. Every tap is a lesson AND a datum.

Two laws fall out of this:

1. **THE LEGIBILITY LAW.** Typed journaling is illegible to the guardian; choices are structured data that feed the profile, the composer, and `mirror()/cite()`. The 1000× gameplan made *sessions* machine-readable via the gauge; grimoire pages make *journaling* machine-readable via choices. "By week three the guardian provably speaks from HER record" requires the record be structured. Multiple-choice is not a UX compromise — it is the mechanism of knowing.
2. **THE TYPING-LAST LAW (Finch's rule, ALTER's voice).** A guardian who asks you to type is confessing it doesn't know you. A guardian who offers three precise guesses is proving it's been paying attention. Free text survives ONLY as the final, always-optional "in your own words?" card — honoring the eager user, never gating the tired one. **No grimoire page may put a keyboard anywhere but its last card, and no page may require it.**

The one-line pitch: *Finch built a survey that pretends to be a pet. Duolingo built a course that pretends to be a game. ALTER builds a 300-day course that pretends to be a conversation — every tap teaches her one thing and teaches the guardian one thing about her.*

---

## 1. THE PAGE (the form — Duolingo anatomy, worksheet content, ALTER voice)

One **grimoire page** = one guided journaling session. 5–9 screens, 60–90 seconds, one insight.

- **TEACH card** — one wisdom bead (source: `_course/_build/engine-v1.json`, 82 beads + Sequencer; also canon-fold lenses). One line, VOICE-BIBLE register, one concrete noun. No lectures.
- **ASK card** — one question, 3–5 chunky domain-color chips (game-piece component language: ink borders, hard shadows, gold-ring selection — copy real app chips, never invent restraint). Tabler `ti` icons only, NEVER emoji (Finch uses emoji per option; we use line-work). Multi-select where honest (Finch's `+` pattern).
- **Rhythm:** teach → ask → teach → ask. Instruction and diagnosis braided. A page is never a raw survey and never a raw lecture.
- **THE ACKNOWLEDGMENT LAW** (extends first-day §3): every answer is acknowledged with *what it changed* — "Evenings drain you — hard blocks move to your mornings." Within the page, not at the end. If an answer changes nothing, the question shouldn't exist.
- **Close = micro-MARK:** the chronicle line assembles FROM HER CHOICES, typewriter into "your record" (same visual grammar as GAMEPLAN §2 THE MARK): *"Page: Energy identity · picked steady-over-intense · mornings are yours."* The page's last screen is her record growing.
- **Last card (optional, skippable, always):** "your own words?" — the only keyboard in the flow. Skipping is a first-class exit, never shamed. Typed text lands in the profile as a raw note (minable later; never required for anything downstream).

**Feel:** each chip tap gets the build→burst micro-juice (teardown Part 5): press-in, settle, chosen chip's gold ring blooms. Page close reuses THE MARK's particle/typewriter machinery. All animation feel = DEVICE-UNTESTED until David's phone confirms.

---

## 2. THE ENGINE (almost free — beats-form, new beat type)

Per GAMEPLAN §1b, **beatRunner (app.js:6989) survives untouched for eyes-open user-paced tools — "the tap IS the rep."** A grimoire page is exactly that: a beats-form session whose beats are teach cards and choice cards.

- New beat types inside beatRunner's existing walk: `{k:'teach', text, sub?}` and `{k:'ask', text, multi?, choices:[{label, ti, writes}]}` plus the existing free-text beat for the last card.
- **PAGE packs are data, not code:**
```
PAGE = { id, chapter, module,            // module = course module (I…VI)
         title, ti,
         beats: [ {k:'teach'|'ask'|'own-words', …} ],
         writes: aggregate → S.profile,   // see §3
         mark: (answers) => chronicleLine }
```
- Packs live in one registry (`GRIMOIRE[id]`), loaded like TOOLS; custom/authored packs join at load. When T2's unified REG lands, `form:'page'` becomes a REG citizen (`REG[id].form='page'`) — until then a parallel small array is acceptable (it is content, not a third menu system).
- **Runtime cost:** no new player, no audio dependency (pages are silent-by-default; a bead MAY cite an existing recorded clip later — never TTS, never new recordings gated on this spec).
- Rendering: pages run in the cockpit stage like every guided flow ([[alter-cockpit-home]]) — no new surface, no sheet.

---

## 3. THE PROFILE (what choices write)

- `S.profile` — additive object, **no SCHEMA bump** (guarded fields, same pattern as first-day's P.block/P.openBand). Seed template: `_specs/sister-seed-profile-TEMPLATE.json`.
- Every choice declares `writes: {key: val}` — e.g. `{energy.chronotype:'morning'}`, `{identity.virtues:['calm','courage']}`, `{want.archetype:'stop-feeling-behind'}`.
- **Consumers (this is the point):** fdPropose sizing · appetiteState · orderPlan/prescribe ctx (GAMEPLAN §1d/§1e) · `mirror()/cite()` templates ("you said mornings are yours") · journey node selection · PROPOSE offers (first-day stone 3).
- **THE VISIBLE-USE LAW:** a profile key no consumer reads may not be asked for. (Finch asks about ADHD/PTSD and visibly personalizes; asking without using is the wellness-industry survey we refuse to be.)

---

## 4. THE CONTENT PIPELINE (the course order IS the journey order)

Source: `_course/worksheets_png/` (module-ordered I→VI, multi-page PNGs) + 34 whisper transcripts + `COURSE-MAP.md` + `COURSE-AUDIT-2026-06-30.md` (coverage/cheese/repurpose calls) + the mined folds in `_course/_build/`.

- **The module order is Johnson's deliberate transformation sequence — keep it as the chapter spine.** (Module III's Big 3×2 literally runs Energy→Work→Love → Identity→Virtues→Behaviors → Michelangelo's studio → walking statue: foundation before identity before behavior.)
- **Compilation rule per worksheet:** essay prompt → recognition. "Describe who you are at your best in Energy" becomes: 1 teach bead (floor/ceiling) → virtue-chip pick → archetype recognition ("closest to your best morning?") → micro-MARK. Each worksheet yields 1–3 pages. The worksheet's *insight* survives; its *essay* dies.
- **De-cheese law applies** ([[wisdom-mining-done]]): structure, not mysticism. Cheese flagged in COURSE-AUDIT stays out.
- **AUTHORING SWARM (the proven batch-agent workflow):** read-only agents, one per module, each given: the module's worksheet PNGs + transcript excerpts + this spec §1 + VOICE-BIBLE + 5 example pages (hand-authored first — the style anchors). Output: JSON packs to `_specs/_grimoire-packs/module-N/`. David batch-reviews packs like he reviews mockups; nothing ships unreviewed. Route agents to Opus/cheaper per model-routing duty. **Keep `_course/` artifacts out of git ([[keep-research-artifacts-local]]); the reviewed packs (app content) DO get committed.**
- Volume expectation: modules I–VI ≈ 30–60 pages total. Journey deals ~1/day — months of content from work already done.

---

## 5. ONBOARDING = CHAPTER ZERO (the unification that fixes what David dislikes)

- The shipped 7-beat front door SURVIVES as the theatrical opening (David's explicit calls in first-day 2026-07-03 stand: keep "Hi, I'm Sage," keep the vibe question).
- **Everything deeper becomes grimoire pages dealt by the journey:** the eager door opens pages; the cut screens (age/rhythm/roles/gender) become one "know me faster" page; Finch's "what overwhelms you most" pattern becomes the Blocker Blessing's deeper sibling page (multi-select, serious-signal).
- **Onboarding therefore never ends — it dissolves into the journey.** One page a day, teach-and-learn forever (Finch's endless-quests insight made structural; never-hands-over made literal: profiling never graduates, it matures).
- **THE MATURATION ARC (teach → mirror → chronicle, in the choice sets themselves):**
  - *Teach (weeks 1–2):* options are archetypal, mined from the course.
  - *Mirror (week 3+):* options include HER past answers — "Three weeks ago you picked 'stop feeling behind.' Still the one?" (`cite()` guards: render only when the read is real; cooldowns so the mirror never becomes a tic.)
  - *Chronicle (mature):* the page drafts the entry from her record; she confirms/corrects with one tap. The guardian writes; she signs.
- Five stones stay hand-authored day-one pages (they already ARE pages in spirit — DO/TELL/PROPOSE/SEE/CLOSE).

---

## 6. IMMEDIATE SURGICAL FIXES (pre-engine, T1-adjacent, cheap)

1. **The want-node keyboard dies.** Journey node #2 ("One sentence: what you want. Not the polite version." — GAMEPLAN §4a #17 rewrote its text but kept the typing) becomes recognition: 4 want-archetype chips mined from the course — *"to stop feeling behind" · "my energy back" · "to like myself again" · "someone to be proud of me"* — + "something else →" opening the optional type. Answer writes `want.archetype`, PROPOSE and the doorway node read it.
2. **Sweep the journey for other bare inputs** — any node whose FIRST ask is a keyboard converts to chips-with-optional-type or moves its keyboard to last position (the Typing-Last Law applied retroactively). TELL stone's "one word" is borderline-acceptable (one word ≠ essay) but gets a chip row of common words + type-your-own.
3. Both fixes: RU dict rows same-commit ([[alter-i18n]], the July-7 freeze rule).

---

## 7. WHAT THIS DOES NOT TOUCH / WHAT DIES

- **Untouched:** goal system core · timelinePlayer + eyes-closed law (pages are eyes-OPEN by design) · GAMEPLAN T1–T7 order (this spec does not preempt any T-ship) · the Jul 7 freeze + sister's Jul 8 ship (only §6 fixes may land pre-freeze if David greenlights; engine + packs are post-freeze) · five stones · shapeFlow.
- **Dies:** the want-node keyboard-first ask · any journey survey question whose answer no consumer reads (Visible-Use Law) · the idea of a separate "settings-style" profile editor (the profile is built by pages, edited by re-answering pages).
- **NOT this spec:** AI-generated freeform chat journaling (BYO-key, later, different spec) · new recordings (zero clips gated here) · visible levels/XP on pages (anti-grind law from the meditation ladder holds).

---

## 8. BUILD ORDER

- **G0 — the surgical fixes (§6).** One session, text+chips, RU same-commit. Can ride any T1-era session. *Verify: preview boots, nodes render; chip feel = device.*
- **G1 — the page runtime.** teach/ask beat types in beatRunner + chip component reuse + micro-MARK close (reuses THE MARK machinery once T1(b) lands — sequence G1 after T1) + `S.profile` writes + 5 hand-authored anchor pages (Module I's first worksheet + the know-me-faster page). *Verify: a page runs end-to-end in preview; DEVICE: chip feel + typewriter.*
- **G2 — the journey deal.** jpNodes deals 1 page/day post-stones; eager door opens the page shelf; `cite()` reads `S.profile`. *Verify: day-simulation via 🧪 test-day.*
- **G3 — the authoring swarm.** Hand-authored anchors → swarm compiles modules I–III → David batch-review → packs land. Then II–VI in waves.
- **G4 — maturation.** Mirror-stage option injection (her past answers as choices, guarded+cooldowned); chronicle-stage drafting. Needs weeks of real profile data — naturally last.

---

## 9. DAVID'S OPEN DECISIONS (options-first — nothing below built before he picks)

1. **Page skin:** does a grimoire page LOOK like (a) the existing tool/beats cards (fastest, consistent) · (b) a distinct "page" treatment (paper/grimoire texture — Finch's notebook-paper starter plan proved artifact-feel converts, but it's a new visual surface) · (c) cards now, skin later? Show 2–3 in chat when G1 starts.
2. **Deal cadence:** strict 1/day vs energy-gated (low-energy days deal a lighter page vs none) — interacts with the relief door.
3. **The want-archetype four:** David should approve/edit the exact four before G0 ships (they'll be quoted back for months).
4. **Pre-freeze scope:** does G0 ride before Jul 7, or is the freeze absolute?
