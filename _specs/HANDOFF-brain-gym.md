# HANDOFF — The Brain Gym (short, honestly-framed focus & skill games)
*Planning artifact for a later BUILD session. Local only. Written 2026-07-01 (theory session with David). Standalone — read this fresh. Companion to (not dependent on) the reprogramming-toolkit handoff.*

---

## 0. The one idea + the honesty rule
ALTER gets a **Brain Gym**: a small set of short (≤60s) games that sharpen focus, working memory, and coordination, and reset your state — delivered gamified (game-not-course).

**THE HONESTY RULE (non-negotiable):** the brain-training industry got **FTC-fined (Lumosity)** for claiming games make you smarter. The science says you mostly get better at *the game*; transfer to general intelligence is weak. So:
- **Never** claim "get smarter / raise IQ / boost your brain." 
- **Do** frame as: *"a 60-second focus reset," "warm up your attention," "practice a real memory skill," "shift your state."*
- Every game gets a one-line **honest** science note (the real mechanism), breathing-app style. Real science, zero overclaim. This is the same de-cheese discipline as the rest of the app.

---

## 1. What exists to build on
- `TOOLS` array + `toolboxStageStep()` (v723: FOR RIGHT NOW lead, science `why`, Tabler icons, no emoji). Cockpit **'tool' stage** (`enterStage('tool')` → renders into `#tfStageBody`).
- `beatRunner`/`breathwork` timing engine; `S.tools` store (additive, no SCHEMA bump) → games store scores/streaks under `S.tools.games` (new key, guarded, no migration).
- The reward economy (`earn`, `celebrateGated`, "that's like me") — games earn like anything else, reward-never-shame.

---

## 2. The games (v1 = three; keep it tight, not a Lumosity clone)

### A. Focus Cross  *(the mobile Alphabet Game, de-NLP'd)*
- **Interaction:** a big letter advances (A → B → C …); each carries a cue — **L**, **R**, or **BOTH**. Two big tap-zones (left / right). Tap the indicated side(s) in rhythm as letters flow. Tempo ramps up. A miss = gentle "reset, keep going," never a fail screen.
- **Why it's here (honest):** coordinating a cognitive track (the letters) with a motor track (left/right, crossing the midline) loads attention + working memory — a genuine **focus warm-up and state-shift.** NOT "subconscious reprogramming" (that NLP claim is unproven — drop it).
- **Duration:** 60s. **Score:** accuracy at peak tempo, personal-best only (no leaderboard).
- **Surface when:** before deep work, or "scattered / can't focus," or as a between-tasks reset.

### B. Recall  *(working-memory span)*
- **Interaction:** a short sequence (colored dots / positions) flashes; reproduce it by tapping. Length grows each round (Simon / digit-span shape).
- **Why (honest):** holding and reproducing a growing sequence exercises **working-memory span** — the mental scratchpad attention runs on. (Trains the skill; we don't claim it makes you generally smarter.)
- **Duration:** ~45–60s. **Score:** longest sequence, personal-best.
- **Surface when:** a "sharpen up" nudge; morning warm-up.

### C. Link  *(the actual memory technique — Jim Kwik / memory champions)*
- **Interaction:** show 7–10 random words; the game coaches you to **link them into one vivid, absurd mental movie** (word 1 → 2 → 3 …), then asks you to recall them in order. Reveal how many you got — usually far more than rote.
- **Why (honest):** association + vivid imagery is the **oldest, genuinely evidence-backed** memory method (the technique memory champions actually use). This one *transfers* — it's a real skill they keep.
- **Duration:** ~90s. **Score:** recall accuracy; unlocks longer lists.
- **Surface when:** "learn something today," or as the flagship "this actually works" moment.

*(Optional v2: a Stroop-lite attentional-control game; a single-point sustained-attention hold. Defer.)*

---

## 3. Jim Kwik / Limitless — the compass (accurate + honest)
Kwik's model maps cleanly onto ALTER and validates the whole approach:
- **Mindset · Motivation · Methods** = the reprogramming tools (Mindset/beliefs) · the journey + gamification (Motivation) · the toolbox + Brain Gym (Methods).
- **"LIEs — Limiting Ideas Entertained"** = the limiting beliefs the reprogramming tool rewires (belief that your brain is fixed → the growth reframe).
- **His proven methods → games/tools:** association/linking (→ **Link** game), spaced repetition + active recall (→ a future review mechanic), the memory palace (→ future). These are the evidence-backed parts — use them.
- **He preaches short daily methods over passive consumption** = ALTER's "game, not course."
- **Caveat:** Kwik is a popularizer, not a lab. Take the *proven* methods (mnemonics, spaced repetition, active recall, sleep/movement/nutrition for brain health); present with honest notes; **skip** speed-reading hype and any "unlock genius" framing.

---

## 4. How it plugs in
- A **"Sharpen the mind"** section in the toolbox (a new `TOOLS` layer or a sibling Brain-Gym card), sitting next to the reprogramming tools — same 'tool' stage, same berry/Tabler styling, no emoji.
- **Contextual surfacing (Sequencer tool-slot):** offer a Focus Cross when the user is scattered / before a deep-work block; a Link session on a "learn" intent. One pick, with its honest reason — never a wall of games.
- **Scores/streaks** in `S.tools.games` (additive). Games `earn` on completion (reward-never-shame; showing up counts). Personal-best only, never social comparison (canon Law 3).

---

## 5. Brand + honesty rules (apply to all)
Berry palette + `:root` tokens; Tabler `ti-*` icons, **never emoji**; Jost/Baloo. One honest science note per game (real mechanism, no overclaim — this is the hard rule). Guardian voice. Reward-never-shame; a miss is "reset, keep going." Personal-best, no leaderboards. Additive only — `S.tools.games`, no SCHEMA bump. Contextual surfacing, never a wall.

---

## 6. Build order
1. **Focus Cross** (the mobile Alphabet Game) — the fun, obvious, gamifiable one; proves the Brain-Gym surface.
2. **Link** — the flagship "this actually works" memory-skill moment (highest honest value; Kwik).
3. **Recall** — the quick daily warm-up.
4. Wire contextual surfacing (offer a focus game when scattered / before deep work) + `S.tools.games` scoring.

*Related: [[alter-soul-clarified]] (game-not-course, tools-guided-not-a-wall), [[no-random-features]], [[model-selection-for-agents]]. Prior handoff: `_specs/HANDOFF-reprogramming-toolkit.md`.*
