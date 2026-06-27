# SPEC — Onboarding / adaptive blueprint

Cluster slug: `onboarding-adaptive` · Audit section: **Onboarding / personalization** (~line 277 of `GRAND-AUDIT-2026-06-26.md`, plus items at ~195, 289–317).

## Context the build-agent must hold (grounded in current code)

- **Onboarding lives in `onboard()` — `app.js:1135`.** An 8-step tap-chip overlay (`.ob-ov` / `.ob-card`): `0` intro → `1` vibe → `2` gender+age → `3` life-stage(s) → `4` "Stock your life" activities → `5` goals → `6` rhythm → `7` born. Writes `S.profile` in `finish()` (`app.js:1146`). Skipping is allowed (skip button, `app.js:1168`).
- **`S.profile` shape after finish** (`app.js:1149-1150`): `{ gender, age, vibe, stages:[…], occ, goals (csv string), wake, sleep, peak, lark:bool, set:true }`. Other writers add: `focus[]` (charSheet), `base:{virtue,perk}` (applySurvey `app.js:3007`), `survey{}`, `masterpiece[]` (`app.js:2779`), `gratList[]`, `fundamentals[]`, `todayIdentity[]`, `todayVirtues[]` (recommitSheet `app.js:2847`), `exWant` (referenced `app.js:1308` but **set nowhere** — dead).
- **`LIFESTAGES` = `app.js:1093`** (22 entries, each `{k,l,ti,c,occ}`). `STAGE_BASE` `app.js:1110`, `STAGE_EXTRA` `app.js:1111` (per-stage activity seeds). `stageSuggest(age)` `app.js:1109`. `seedKept()` `app.js:1143` pulls base + stage + occupation work groups into the step-4 prefill.
- **`VIRTUES` = `app.js:1172`** (8: zest/disc/love/courage/wisdom/curiosity/gratitude/hope). `VCLASS` `app.js:1182`. `virtueOf(e)` `app.js:1183` maps an activity→virtue. `virtues()` `app.js:1254` computes XP/levels from the last 14 days of logs.
- **Daily "who are you / virtues" already exists** in `recommitSheet()` `app.js:2841` (step0 identity adjectives → step1 virtues → step2 habits → step3 gratitude). This is the morning ritual — NOT onboarding. It already saves `S.profile.todayIdentity` / `todayVirtues`.
- **Masterpiece day** = `S.profile.masterpiece[]`: `saveMasterpiece(k)` `app.js:2779`, `fillMasterpiece(k)` `app.js:2780`. Also habit-stacks `S.presets[]` (`DAY_PRESETS` `app.js:489`, `presetsSheet` `app.js:528`, `stackDetail` `app.js:498`). All manual — nothing learned.
- **Helpers available — reuse, do not reinvent:** `add()` `app.js:1313`, `el()`, `esc()` `app.js:285`, `mixHex()` `app.js:286`, `mixDark()` `app.js:287`, `fmt()`/`dur()`/`hm()` `app.js:92-94`, `blocks(k)`, `logs(k)`, `save()`, `lastDays(n)`, `domainOf()` `app.js:274`, `DOM` `app.js:249`, `DOM_ORDER` `app.js:2581`, `allActivities()` `app.js:2582`, `bentoPicker()` `app.js:~2596`, `chip()` (onboarding-local `app.js:1141`).
- **`SCHEMA = 1`, `KEY="alter_plan2"`** at `app.js:75`. `load()` migrates at `app.js:1199`. **Any new persisted field on `S.profile` is safe** (profile is a free-form object already merged forward by `mergeImport`); a SCHEMA bump is only needed if you change an EXISTING field's shape.

## LOCKED design rules honored throughout
Deep berry/wine surfaces; per-domain colors from `DOM`; **NO neon/glow/shine/white surfaces**; pink now-line stays the brightest thing (none of these features touch the timeline render — all are overlay sheets / `S.profile` reads). One activity at a time. Reward-never-shame (Withers: never imply a low rating). Full-screen, low-clutter, tap-not-type.

---

## FEATURE 1 — Energy identity stage (aspirational role, NO virtues in it)

1. **Ask:** "Energy identity is something like: world class athlete. Don't list virtues in the identity stage" (audit ~197).
2. **Buildable?** Yes. Re-add a stage that existed in v384 (`git 68ffc7e:app.js:447`, the `IDENTITY` array) and was deleted v385. Keep it virtue-free per the ask.
3. **APPROACH:**
   - Add a new onboarding step **between current step 1 (vibe) and step 2 (about-you)** — i.e. layered order becomes vibe → **identity** → about-you. Bump `STEPS` `app.js:1137` from `8` to `9` and renumber the `if (step === N)` ladder in `draw()` (`app.js:1158-1165`). To minimize renumber risk, instead insert as a NEW first content step isn't ideal; cleanest is to **append the identity step as step 1.5 by shifting**: simplest concrete plan — make identity the new step `2` and push about-you→3, life-stage→4, stock→5, goals→6, rhythm→7, born→8.
   - Define a module-level `var IDENTITIES = [...]` near `VIBES2` (`app.js:1106`): aspirational ROLES, not adjectives, not virtues. Suggested set (each `{k,l,ti,c}` using DOM-family colors):
     `World-class athlete` (move `#ff8a3a`), `Master builder` (focus `#36b3f0`), `Working artist` (create `#b07aff`), `Devoted partner/parent` (connect `#ff5fa0`), `Lifelong scholar` (focus `#36b3f0`), `Calm monk` (restore `#2ab8c4`), `Bold founder` (move `#ff8a3a`), `Free explorer` (play `#d99f30`). Plus the existing `typeRow(...)` for a custom role.
   - Single-select (one core identity) but allow it to be cleared; store on `data.identity`.
   - In `finish()` `app.js:1149`: `P.identity = data.identity || ""`.
4. **CODE POINTERS:** `onboard()` `app.js:1135`; `STEPS` `app.js:1137`; step ladder `app.js:1158-1165`; `finish()` `app.js:1146`; `chip()` `app.js:1141`; `VIBES2` `app.js:1106` (pattern to copy). Surface `P.identity` in the You-tab profile line at `app.js:1838` (`renderChar`) e.g. prepend `"✦ " + P.identity`.
5. **UI (locked palette):** Step card title `"Who are you becoming?"`, subtitle `"your energy identity — pick the one that pulls you (you can grow into it)"`. A `.ob-col` of role chips colored via `chip(col, '<i class="ti '+r.ti+'"></i> '+r.l, on, r.c, "#160510")` — same dark-tint-when-off treatment `chip()` already does (`mixDark(color)`). No virtue tiles here (that is the whole point of the ask).
6. **DATA:** add `P.identity:string`. No migration (new optional field). Reads: `renderChar` line, optionally `brainContext()` `app.js:2957` (inject identity into the AI prompt).
7. **REGION:** `onboard()` + `LIFESTAGES`/`VIBES2` constants block (`app.js:1093-1170`). Touches `renderChar` (`app.js:1830-1844`) only for display.
8. **EFFORT:** S.
9. **RISKS:** Renumbering the step ladder is the only footgun — every `if(step===N)` and the back/next/progress math (`barF.style.width`, `app.js:1156`) must stay consistent with the new `STEPS`. Verify the progress bar reaches 100% on the final step and "back" walks every step. No timeline interaction → low risk. Keep it skippable (already free via `data.identity` default `""`).

---

## FEATURE 2 — Layered onboarding: identity → virtues-to-commit → behaviors → work/love → hobbies/crypto

1. **Ask:** "choose energy virtues that we will commit to every morning. Then the actual behaviors… And then for work and love. And then we add the hobbies and the crypto" (audit ~294).
2. **Buildable?** Partial → concrete version. Most layers already exist (vibe/about/stage/stock/goals/rhythm). Two are missing: a **virtues-to-commit stage** in onboarding (currently only in daily `recommitSheet`), and a **crypto category**. "work/love/hobbies" already layer inside step 4 because activities group by `DOM_ORDER`. Concrete build = add the two missing layers and make the layering explicit.
3. **APPROACH:**
   - **Virtues layer:** add an onboarding step right after the identity step (Feature 1) titled "Virtues you'll commit to". Reuse the exact tile grid from `recommitSheet` step 1 (`app.js:2864`): `VIRTUES.forEach` → `.tilegrid`/`.gtile` tiles, multi-select, store on `data.virt[]`. In `finish()`: `P.focus = data.virt.slice(0,3)` (this feeds `virtues()` focus-bonus at `app.js:1258` and the tree highlight — already wired, so reusing `focus` is zero-new-plumbing). Frame as growth not deficit (Withers): subtitle "the few you want to embody — you'll still grow them all."
   - **Crypto:** crypto is a *life domain/interest*, not one of the 9 timeline `DOM` domains. Add it as an **interest tag**, not a 10th DOM color (adding a DOM domain ripples into the FRAGILE timeline render and `DOM_ORDER` everywhere — do NOT). Concretely: in step 4 "Stock your life", the existing `STAGE_EXTRA`/seed already supports activities; add crypto-flavored activities into the `focus`/`play` domains via `STAGE_EXTRA` (e.g. a new pseudo-stage or just append to relevant stages: `["Check crypto","focus"], ["Trade","focus"], ["Research coins","focus"]`). Cleaner: add a small `INTERESTS` chip row (crypto, investing, fitness, gaming, music…) as an optional step that seeds matching activities into `data.kept`. Recommend the INTERESTS approach so "crypto" is first-class without a DOM change.
   - **Make layering explicit:** the audit says behaviors/work/love already layer in step 4 — keep that, but consider a one-line section progress label so David *sees* the layers (energy identity → virtues → behaviors → goals → rhythm). Optional, low effort: add a tiny stage caption under the progress bar.
4. **CODE POINTERS:** virtue tile pattern `recommitSheet` `app.js:2862-2864`; `VIRTUES` `app.js:1172`; `focus` consumption `virtues()` `app.js:1258`, tree `drawTree()` `app.js:1331`; step-4 stock `app.js:1162`; `STAGE_EXTRA` `app.js:1111`; `data.kept` seeding `seedKept()` `app.js:1143`.
5. **UI:** Virtues step = the same `.gtile` grid as the morning recommit (consistency). Interests step = a `.ob-row` of `chip()`s in mixed DOM colors + `typeRow("a niche interest… crypto, chess, climbing")`. All on the wine gradient, dark-tinted-off chips.
6. **DATA:** `P.focus[]` (already a known field — reuse, no migration). New optional `P.interests[]` if you add the interests step. Seeded activities land in `S.acts` (existing path `app.js:1151`).
7. **REGION:** `onboard()` step ladder + `STAGE_EXTRA`/seed constants. Overlaps Feature 1 (same step ladder) — **build Features 1+2 together** to renumber the ladder once.
8. **EFFORT:** M (virtues step S; crypto/interests step S; doing both + ladder renumber = M).
9. **RISKS:** Same ladder-renumber caution as Feature 1 (do them in one pass). Do **not** add a 10th `DOM` domain for crypto — that is a HIGH-RISK ripple into the timeline render, `DOM_ORDER`, `mixDark`, ghost/future bubble math. Keep crypto as an interest/activity. Reward-framing on the virtues step (no "you're weak at X").

---

## FEATURE 3 — Clever onboarding that LEARNS the blueprint over time (works at any life stage)

1. **Ask:** "better onboarding procedure and the app needs to learn from the users needs and also work with the user at any stage of their development" (audit ~289, asked ×4 — high recurrence).
2. **Buildable?** Partial → concrete. "Any life stage" is already strong (22 `LIFESTAGES`, multi-select, type-in). The missing half = **learning after setup**. Concrete version: a lightweight, deterministic inference pass (NOT an LLM) that updates a learned-blueprint object from the logs/blocks the user already produces, and surfaces it.
3. **APPROACH (deterministic "blueprint learner"):**
   - Add `function learnBlueprint()` near `frequent()` `app.js:1284` (which already does the count-over-30-days pattern — copy it). It scans `lastDays(30)` over `logs(k)` + done `blocks(k)`, and produces:
     - `topActivities` — most-frequent non-drift activity titles (reuse `frequent()` logic).
     - `domainMix` — minutes per `DOM_ORDER` domain (reuse `lifeInvest()` `app.js:466` — it ALREADY computes this; just read it).
     - `typicalWake` / `typicalBed` — median start of first non-drift log and last log per day (new, small).
     - `peakDomainByHour` — which domain dominates morning vs afternoon vs evening (bucket logs by `phase()` `app.js:1243`).
   - Persist on `S.profile.learned = { topActivities, domainMix, typicalWake, typicalBed, updatedAt }`. Recompute lazily: call `learnBlueprint()` from `load()`-adjacent init or once per day (guard with `updatedAt !== todayK()`), NOT on every render (avoid the full-DOM-rebuild landmine).
   - **Use it (the "clever" payoff):** feed `learned` into existing surfaces instead of building new screens —
     - `suggestNext()` `app.js:2769` / `suggestDay()` `app.js:2729`: bias suggestions toward `learned.topActivities` and put the right domain in the right time-of-day slot using `peakDomainByHour`.
     - `proactive()` `app.js:1301`: a chip like "You usually Deep work around now — start it?" when `learned` shows a strong morning-focus pattern.
     - Replace the **dead `exWant`** (`app.js:1308`) with a learned weekly-workout baseline: if `learned.domainMix.move` trends down vs prior, nudge gently (reward-framed: "want to get a move in?", never "you're behind").
   - Keep "works at any stage": because it learns from actual behavior, it adapts regardless of declared stage — call that out in copy.
4. **CODE POINTERS:** `frequent()` `app.js:1284` (count pattern), `lifeInvest()` `app.js:466` (domain minutes — reuse), `phase()` `app.js:1243`, `lastDays()`, `suggestNext()` `app.js:2769`, `suggestDay()` `app.js:2729`, `proactive()` `app.js:1301`, dead `exWant` `app.js:1308`.
5. **UI:** No new screen required. Surfaces are the existing hero `proactive()` chips and the suggest sheets — all already on the locked palette. Optionally a tiny "what I've learned about you" read-only card in the You tab (`renderChar` `app.js:1830`): a few `.pfline`-style rows ("most days you Move + Focus + Connect", "you usually wake ~7:30"). No new colors.
6. **DATA:** `S.profile.learned = {topActivities:[], domainMix:{}, typicalWake:int, typicalBed:int, peakDomainByHour:{}, updatedAt:"YYYY-MM-DD"}`. New optional field, no SCHEMA bump. `mergeImport` already carries unknown profile sub-fields forward.
7. **REGION:** new helper near `app.js:466`/`1284`; reads in `proactive`/`suggestNext`/`suggestDay`/`renderChar`. Does NOT touch onboarding flow or timeline render.
8. **EFFORT:** M (the learner itself S–M; wiring into 2–3 existing surfaces is the bulk).
9. **RISKS:** Don't recompute on every render (full-DOM-rebuild + perf). Cold-start: with <3 days of data `learned` is empty — every consumer must no-op gracefully (fall back to current behavior). Keep nudges reward-framed (no shame). Pure data layer — no timeline-render risk.

---

## FEATURE 4 — Learn / infer the "masterpiece day" over time

1. **Ask:** "as the app gets to know u… it can guess what ur masterpiece day is or u establish it over time" (audit ~314).
2. **Buildable?** Partial → concrete. Manual masterpiece save/fill already exists (`saveMasterpiece` `app.js:2779`, `fillMasterpiece` `app.js:2780`). Missing = the *guess*. Concrete version = synthesize a candidate masterpiece day from the learned blueprint (Feature 3) and offer it as a one-tap "Here's your masterpiece day — based on your best days" the user can accept/edit/save.
3. **APPROACH:**
   - Add `function inferMasterpiece()` that builds a `blocks`-shaped array from `S.profile.learned`: lay `learned.topActivities` into a wake→bed skeleton (reuse `wakeHour()` `app.js:89` / `bedHour()` `app.js:90` for the frame, and the slotting style of `skeletonDay()` `app.js:2802`), placing each activity in its `peakDomainByHour` slot. Prefer high-frequency, high-domain-balance activities; cap to a sensible day.
   - In `suggestSheet()` `app.js:2781` (and/or `presetsSheet()` `app.js:528`), when `!S.profile.masterpiece` but `learned` is rich enough, change the existing button label from "🌟 Suggest a full day" to **"🌟 Build my masterpiece day (from your best days)"** → calls `inferMasterpiece()` → drops blocks into `k` → lets user edit → the existing "💾 Save this as my masterpiece day" (`app.js:2800`) persists it. This reuses the entire existing apply/save path; only `inferMasterpiece()` is new.
   - "Establish over time": each time the user keeps a strong day, optionally offer "make this your masterpiece?" — reuse `saveMasterpiece(k)`; trigger from the EOD/evening bookend if the day's plan-completion is high (read `blocks(k)` done ratio). Optional, additive.
4. **CODE POINTERS:** `saveMasterpiece`/`fillMasterpiece` `app.js:2779-2780`; `skeletonDay()` `app.js:2802` (slotting template to mirror); `wakeHour()`/`bedHour()` `app.js:89-90`; `suggestSheet()` `app.js:2781`; `presetsSheet()` `app.js:528`; `S.profile.learned` (Feature 3).
5. **UI:** No new screen. Re-label/re-target the existing suggest button (locked palette `.done2`). The inferred day renders as normal timeline blocks the user can drag/edit — uses the real app, no mockup.
6. **DATA:** writes the existing `S.profile.masterpiece[]` (no new field, no migration). Reads `S.profile.learned`.
7. **REGION:** new `inferMasterpiece()` near `app.js:2779`; one button re-target in `suggestSheet` `app.js:2798-2799`. Reads Feature-3 data. Does NOT touch timeline render code (only produces block data the existing render consumes).
8. **EFFORT:** M (depends on Feature 3's `learned`; build Feature 3 first).
9. **RISKS:** Depends on Feature 3 — if `learned` is empty, fall back to the current `suggestDay()` (already the `else` path, keep it). Generated blocks must use `domain`-keyed colors via `DOM` so timeline coloring is correct (mirror `applyDayPreset` `app.js:495`, which already normalizes `domain`→color). Don't overwrite an existing plan silently — keep the explicit tap. No render-internals change → low render risk.

---

## Build order & parallelism notes
- **Features 1 + 2 share the `onboard()` step ladder — build them in ONE pass** (single renumber of `STEPS` + the `if(step===N)` chain). A second build-agent must not also edit `onboard()` concurrently.
- **Feature 3 is the foundation for Feature 4** (`S.profile.learned`). Build 3 → 4 in sequence, or 4 stubs against 3's data contract.
- Features 3 & 4 are **data/logic only** and touch different functions (`learnBlueprint` near `app.js:466`/`1284`; `inferMasterpiece` near `app.js:2779`) — safe to run parallel to a build-agent working on the timeline render or the visual redesign.
- **Hard no for this cluster:** do not add a 10th `DOM` domain (crypto), do not edit `server.js`, do not touch the timeline render to surface learned data (use overlay sheets + `proactive` chips).

## Verification (honest)
- Onboarding flow (Features 1–2): the preview proves it BOOTS, renders, and tap-chip selection works (non-gesture taps are reliable in preview). Run `onboard()` via the 🧪/skip path; confirm every step renders, progress bar hits 100%, back/next traverse all steps, `S.profile` after finish has `identity`, `focus`, (`interests`). Mark the *feel* (overlay scroll) DEVICE-UNTESTED if relevant.
- Features 3–4: pure data — seed `S.log`/`S.blocks` for ~5 days via `preview_eval`, call `learnBlueprint()`/`inferMasterpiece()`, assert the output objects. No gesture dependency.
