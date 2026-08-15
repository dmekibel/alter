# EPIC AUDIT + GAMEPLAN — 2026-07-02

*17-agent verified audit (8 domains, 87 findings, 0 refuted, + completeness critique) synthesized by one mind against SOUL-OF-ALTER.md + SPEC-PMF-INTERVIEW-2026-07-02.md. The mission: sister gets the link JULY 8. Everything here is bucketed by that date.*

---

## 0. EXECUTIVE VERDICT

**The skeleton is real; the front door is missing.** The audit's biggest surprise is how much of the July-8 machine already exists in shipped code: the coin economy (`earn()`), a garden with planting (`plantGarden()`), a lightweight one-tap tracker (`nowSheet`/`startOrSwitch` + liveDock), a behavior-wired adaptive journey (`jpNodes()` reads real mood/drift/recovery), a declutter/chore system (`choreMark`/tidySheet — dead but complete), a hand-onboarding hook (Load save), solid audio architecture (146/146 manifest clips present), and a **verified-clean empty-localStorage boot, including in Russian**. Almost nothing needs inventing. Nearly everything needs **re-plumbing to face the right direction**: today the app greets a zero-energy user with a 7-screen settings quiz, points her at the planner (the exact Law-4 inversion), locks the garden behind a gate she can't satisfy, and speaks English precisely where the guardian gets personal.

**Health signals worth naming:** the anti-shame layer is genuinely built (streaks never break by design, comebacks quietly rewarded, no red on drift, forward-only missed-block copy); the regression contract shows **no static violations** in v750–769; the journey's chapter-mastery is evidence-based, not content-gated. The soul is in the code. The doorway isn't.

---

## 1. STATE OF THE UNION (8 domains, honest)

| Domain | State | P0s |
|---|---|---|
| **Onboarding** | 7-step settings quiz opening with the exact "Hi, I'm Sage" text David hates; no pact, no task, no coin, no seed; the only tutorial fn (`timeCommit`) is dead code; final CTA is "Plan your first day ▸" | 5 |
| **Economy** | One currency (Spark), ~32 mint sites — but skate tricks mint IN-game (Law 2 violation), planting is gated on a "courage" log she can't produce, plants are static (no grow), rewards scale with volume not avoidance | 3 |
| **Planner complexity** | ~30 modal surfaces, 3 overlapping planning systems, 6 concurrent timeline gestures, dev items live in her settings; BUT a good one-tap track-now already exists (liveDock → `startOrSwitch`) | 4 |
| **Journey** | Genuinely adaptive + behavior-wired (the best-built system audited) — but chapter-0's focal node is "Plan your day", trail floods (nodeCap computed, never applied), all copy missing from ru dict, Part II mechanics ~0-10% | 5 |
| **Tools/audio** | Backbone solid, all 146 manifest clips on disk — but Tapping is 72/73 voice-dead (runtime-composed strings the extractor can't see), self-hypnosis silent on 5 core beats, breathwork silent on cold-cache, Grateful Flow has a blank-row typo | 4 |
| **Stability** | Fresh boot verified clean (EN + RU) — but corrupt-but-valid-JSON state **permanently bricks the app** (load() unguarded past parse), no window.onerror anywhere, onboarding skip strands half-initialized | 2 |
| **Constitution** | Anti-shame layer healthiest-in-class; violations: emoji all over the bento CATS, vices render as **red skulls** (the one shipped reward-never-shame breach), ru dict frozen at ~v664, ten-option journal picker, ~8 overlay systems | 2 |
| **Sister simulation** | Session 1 = 15-17 taps of quiz, zero reward; first win requires a 5-min timer she must remember to stop; session 2 = cold identical screen; day-3 return gets a 2-second English toast (kind welcome-back gated at 14 days) | 6 |

**Critique added 11 gaps** — the biggest: the tidy/declutter system (her actual front door per Law 9) exists but is unreachable and no domain owned it; PWA install logistics can silently land her save in the wrong container; `start_url: fresh.html` makes her install hard-online-only with every deploy hitting her instantly; and David has **zero observability** into whether she opens it at all.

---

## 2. THE CUT-LINE (the critic demanded it; here it is)

~29 P0s cannot all be "blockers" or Death 1 wins by paralysis. Bucketed:

- **BUCKET A — THE 3 FIXES (the spec's scope).** Front door rewrite · 90-second loop · hide the planner. ~11 findings fold into these.
- **BUCKET B — TRUE CRASHERS/HUMILIATORS on her visible path.** State-brick, skip-strand, silent tools she'd actually touch, Grateful Flow typo, red-skull vices, Test-day-dev in settings, Russian holes, swipe-lock leak. Small fixes, all S-effort.
- **BUCKET C — SHIPS AS-IS, deliberately.** Three planning systems (she never sees them — hiding beats fixing), shapeFlow's 5 modals (hidden), bento 130-tile pile (she gets the one-tap path), ten-option journal, menu-system debt, Law 3 economy, streak mechanics, emoji outside her surfaces, service worker, Part II journey mechanics, the duo build, efficacy lab. **Logged, not built, not felt guilty about.**

---

## 3. THE JULY-8 SPRINT (6 build days, sequenced)

> Model routing: this is routine build work — run it on **Opus**, low effort. Reserve Fable for nothing here.

### DAY 1 (Jul 2) — Stability floor (all S-effort, one batch, one commit)
1. Wrap ALL of `load()` in try/catch → on throw: stash blob to `alter_plan2_bak`, `S=fresh()`, toast "save was damaged — backed up + started fresh". Type-sanity pass in parseBackup.
2. `window.onerror` + `unhandledrejection` → rate-limited "something glitched — tap to refresh" toast (tap = reload).
3. Onboarding skip → calls `finish()` with defaults (verified safe with zero selections).
4. Grateful Flow `"" . g` typo → `g`.
5. Breathwork cold-cache: async `getBuffer` fallback after unlock (context already resumed in-gesture).
6. Settings: wrap Test-day/Voice-debug/Brain/Redo-setup rows in `devOn()`.
7. Pane-swipe lock: add `.goal-ov,.mind-ov,.nb-ov` to the pointerdown guard.
8. Drop `appVer()` from jpSub (stays on start screen).
9. Vice de-shame: CATS red `#ff4d4d` → drift-mauve family, 💀 → neutral `ti-` icon, strip the red "quit" tag.
10. `manifest.json` `start_url` → `index.html` (fresh.html stays David's personal link).
11. Spark milestones read `S.game.total` (lifetime), not balance.
12. Skate tricks: delete the 2 spark/total += lines; keep the FEEL (trickMsg/shake/dust) as a cosmetic best-combo stat. **Law 2 restored: the game has no mint.**

### DAYS 2-3 (Jul 3-4) — FIX 1 + FIX 2: the front door + the 90-second loop (M)
Rewrite `onboard()` in place (keep ob-ov/ob-card scaffold, chip machinery, progress bar). Six beats:
1. **Showman open** (2 full-bleed screens, big type, cheeky, the placebo prime: "this app gives you powers — it is no joke").
2. **THE PACT** — "One rule: never lie to me." Press-and-hold thumb-fill button (1.2s pointerdown), persists `S.profile.pact={ts}`.
3. **ONE profiling beat as play** — energy ("how's the battery?") + "which room is the messiest?" room cards → `S.profile.messRoom` (keep the vibe→lowStart wiring).
4. **The task** — "Pick two things up off the floor. I'll wait." → Done (instant, NO timer — the micro-task primitive: one-tap done → logs + `earn(15-20)` + completion burst). Wire it through the existing **choreMark/tidy machinery** so the dead declutter system comes alive as her actual front door.
5. **The coin** — earn celebration fires in-flow.
6. **The seed** — stripped `plantGarden()` moment inside the onboarding card; **first plot costs 0** (`cost = n===0?0:20*n`); planting gate becomes "any real earn today" (`S.sf.actions[todayK()].length>0`), killing the courage-gate. CTA out: **"Start ▸"** (never "Plan your first day").
- Cut steps: gender/age/roles/rhythm collapse out (founder hand-loads them).
- **Seed→grow minimal:** garden entries get `{t, stage, plantedK}` (additive, guarded reads); render seed-mound → sprout → full sprite; stage advances when a later day has real earns. Day-2 return = visible growth.
- Every new string lands in `I18N.ru` in the same commit.

### DAY 4 (Jul 5) — FIX 3: hide the planner + track-before-plan (M)
1. `S.profile.simpleMode` flag (seeded in her save file).
2. `jpNodes()`: jn===0/simpleMode → focal node becomes **"What are you doing right now?"** → `nowSheet`/`startOrSwitch` (already JOURNEY[0].act); suppress the plan node + plan-flavored chapter tasks; honor `nodeCap` (slice optional nodes; ≤3 habits at chapter 0).
3. Carousel clamps to Journey|Game; planner nav hidden; liveDock stays visible on the journey pane.
4. **Planless-mode contract:** suppress every plan-relative badge/copy/CTA (drift badges, on-plan bonuses become plain earns); verify chapters 0-2 advance on tracking+goals alone. Add to the regression contract.
5. tutCommit wall: allow all duration chips incl. 30s/1m floor, one-line copy, always render the X.
6. Timer commitment self-completes: elapsed ≥ commit → celebrate + glowing "Claim" (kills remember-to-stop).
7. Cockpit in simpleMode: **Done + Drift only** (two big buttons) during a tracked activity.
8. Day-2 beat: first-week return greet in `journeyTick` (days 2-7 post-pact): "your seed's still here — one small thing today?" → nowSheet + garden.
9. Day 3-13 gap tier: warm inline banner — "You came back. That IS the skill." + return-as-focal-node with an instant micro-win. (The core inversion, shipped.)
10. Guided-mode default for new installs (or asserted in her save file).
11. Hand-onboarding completeness: add `S.profile.name` (greeting reads it) — her seed JSON: name, gender, vibe:'overwhelmed', lowStart, langCode:'ru', 3 real habits, "Clean my room" goal, simpleMode, guided.

### DAY 5 (Jul 6) — Russian + voice (parallelizable)
1. **RU dict blocks** (pure additive `Object.assign(I18N.ru,{...})`): journey copy (~120 entries: JOURNEY[], JP_CHAPTERS, JP_LESSON, chapter tasks, settle/wayback/catalyst/tutCommit), v700-769 strings (composer, packs, Brain Gym, toolbox, day-close), all new front-door copy. Audit script: extract literals from onboard()/jpNodes()/drawJourney()/toast sites, diff against dict keys. *(Fan this out to parallel agents — proven pattern from v656.)*
2. **Voice:** extend `gen-voice.py` with an 8th extractor reproducing tapping's runtime composition (~72 clips) + inline self-hypnosis' 5 BEATS as literals; regenerate manifest; commit clips.
3. **Telemetry worthy of n=2:** tiny usage ledger in S (opens/day, nodes done, tool runs — mostly exists in logs already) + one-tap "send to David" share-export of the compressed save, surfaced gently day 3 + day 7. **This export IS her backup** (the chronicle's only protection).

### DAY 6 (Jul 7) — Device pass + freeze
- Full sister-flow walkthrough ON THE PHONE, in Russian: onboarding → task → seed → track-now → day-2 greet.
- 5-min gesture pass: composer reorder/resize, Meditate-block chooser, player scrub, drift-tap orb.
- 3-min screen-lock test mid-meditation (fix point if it hangs: visibilitychange in timelinePlayer).
- Re-run the 4-point timeline regression contract on-device.
- **DEPLOY FREEZE Jul 7-14** except crashers. David keeps fresh.html; she gets the stable start_url.

### JULY 8 — SHIP DAY (David's hands, not code)
**Founder runbook:** (1) On HER phone: open the URL in **Safari**, Add to Home Screen FIRST. (2) Open the INSTALLED icon (never the tab again — iOS partitions storage). (3) Start-screen → Load save → her pre-seeded profile. (4) Verify name/room/habits render in Russian. (5) Watch her first 90 seconds. Say nothing. Take notes.
**The human channel is the retention system:** scripted day-2 text ("your seed needs water") and day-4 text — David IS the duo until the duo is built.

---

## 4. DAVID'S BY-HAND CHECKLIST (lead-time items — start NOW)
- [ ] Pact + showman copy, EN (I draft, David approves the register)
- [ ] RU translations of the new front-door strings (dict entries)
- [ ] Sister profile seed JSON (name, habits, room, goal)
- [ ] Decision: front door text-only vs voiced (**recommend text-only for Jul 8** — kills the clip-pipeline dependency)
- [ ] The install runbook rehearsed once on David's own phone
- [ ] Day-2 / day-4 texts drafted

## 5. POST-SHIP PHASES (sequenced by her real data, not by our excitement)

**PHASE 1 (Jul 9-21) — Watch, then fix what's real.** Her day-3 and day-7 exports decide everything. Pre-authorized builds only: 2-tap vice ledger (log a moment without a timer), the day-2/day-4 greet tuning, crash fixes. NOTHING else while data accumulates.

**PHASE 2 — The chronicle handoff (Death 2's right-slip guard).** The day-34 "coins → being-known" transition: guardian cites her own record at doubt moments (copy + rule-bank on existing S data). Plus: efficacy lab (post-tool lighter/same tap), S.tools.use enrichment → prescription, Law 3 avoidance-scaled rewards, game-time ledger.

**PHASE 3 — The duo + Part II.** Code-exchange "their garden" strip (offline-honest duo seed); then bosses-from-drift-data, chapters-written-backward, honest weather, forks, spiral. Bookends audit (Leg 2 + letters-across-time) — no domain covered it this round.

**PHASE 4 — The debt run (Fable, one contiguous run).** Menu-system unification (~8 overlays → cockpit stage), innerHTML wipe-kill (87 sites), three-planning-systems merge, ten-option journal → computed pick, service worker.

## 6. DEATH GUARDS (from the PMF spec, now instrumented)
- **Death 1 (founder never ships):** the cut-line above IS the guard. July 8 is dated; Bucket C is guilt-free. If Jul 8 slips silently — fire alarm.
- **Death 2 (game becomes the vice):** Law 2 restored Day 1 (trick mint deleted); game-time ledger Phase 2; the chronicle handoff is Phase 2 priority one.
- **Death 3 (n=1 doesn't generalize):** telemetry + share-export ships Day 5 — David can finally SEE a second user. Her day-3/day-7 data outranks every roadmap opinion in this doc.

---
*Full raw findings: workflow wf_bd7f2d94-9fc output (87 verified, 17 agents, ~1.58M tokens). This doc supersedes nothing — it sequences; SOUL-OF-ALTER.md still holds the soul, SPEC-PMF holds the laws.*
