# HANDOFF — The Reprogramming Toolkit (tools + guided-reprogramming + ritual-builder)
*Planning artifact for a later BUILD session. Local only (not committed). Written 2026-07-01 in a theory session with David. Build in a separate session, from this doc + [[alter-soul-clarified]].*

---

## 0. The one idea
Every tool in ALTER — the shipped ones and the ones to build — is the **same three-move stack**, which is also what *every* famous reprogramming system (Silva, Dispenza, RTT, Monroe, PSYCH-K, New Code NLP, Core Transformation) reduces to once you strip the branding:

> **INDUCTION** (reach a receptive state) → **INSTALL** (plant the new belief / self-image / intent) → **REINFORCE** (repeat until it sticks)

ALTER builds the **light, safe, ≤3-minute, de-cheesed** version of this. Nobody's job here is a 4-hour meditation or a trauma regression.

---

## 1. What already exists (build ON this, don't duplicate)
- `TOOLS` array (~13 tools) + `toolboxStageStep()` — **v723 shipped**: the toolbox leads with a **FOR RIGHT NOW** card (`suggestTool()` picks by state), each tool has a one-line science `why`, Tabler icons (no emoji). Fields per tool: `{id, layer, name, ti, thinker, when, why, fn}`.
- `selfHyp` tool (Blair eyes-open induction), `breathwork()`/`beatRunner` engine, `mantraPlayer`, `meditation`, `relaxMoment`, Stutz tools.
- Cockpit **'tool' stage**: `enterStage('tool')` → `toolboxStageStep()` renders into `#tfStageBody` while the ring tracks in the corner. This is the home for everything below.
- `partXTriage()` — "what's loud right now" state→tool triage.
- `S.tools` store (use/last/fav/recents) — additive, no SCHEMA bump. Custom tools live here.

---

## 2. BUILD 1 — the guided reprogramming tool (self-hypnosis/visualization, done right)
A single ~3-minute guided flow, rendered in the 'tool' stage, built on `beatRunner`/`breathwork`. Three beats:

1. **Settle down (induction).** A relax-down: slow coherence breath (longer exhale) + a gentle count-down ("with each breath, one step calmer"). *Science note: longer exhale = vagal brake; a calm-focused state is when suggestion lands.* [Silva alpha countdown + Dispenza coherence breath, de-cheesed.]
2. **Picture it (install).** The "mental screen": the user holds one image of the change already true (them, doing/being it) + one short present-tense line ("I start before I feel ready"). Read/spoken slowly. *Science note: the brain rehearses imagined action as real (mental rehearsal).* [Silva mental screen + Maltz self-image + RTT's install-half ONLY.]
3. **Seal (reinforce).** One breath + the line once more + "done." Offer to make it a daily 20-second repeat (mantra loop). *Science note: repetition is how self-image installs.*

Rules: every beat has an **8-second floor** version. Skippable at any point. Science-noted like a breathing app. Never the words hypnosis-as-scary / trance / spell.

---

## 3. BUILD 2 — "Make It Yours" (the custom ritual-builder; CD3 creativity endgame)
Let the user compose their own tool from a simple grammar. This is the retention endgame + the "power of magic, de-cheesed."

**Grammar (each a 1-tap pick, never free-form essays):**
1. **When** — the trigger (anxious / a craving / before a fear / low / morning). Becomes its contextual surface trigger.
2. **Intent** — what it's for (calm / courage / focus / let go / confidence).
3. **Anchor** — the symbolic hold: a breath · an image · a word/phrase · a gesture/posture · an object (candle) · a **symbol they draw (sigil)**. [PSYCH-K posture as the gesture option; sigil = simplified — clever sigil system TBD later, v1 = "draw/pick a simple symbol for your intent".]
4. **Move** — the ≤30s sequence (reuses Build-1 beats: settle → picture → seal).
5. **Seal** — the close (an exhale, a word, "done").

Output: named, stored in `S.tools.custom` (additive), joins the toolbox, and **surfaces via its `When` trigger** through the Sequencer's tool-slot. Optional multi-sensory add-ons (candle / scent / a music bed) framed as "deepeners," never required.

**Never in UI:** magic, spell, ritual, occult, hypnosis. It's "a little tool you built," "your reset," "make it yours."

---

## 4. Safe extractions from the master + underground systems (weave these in)
| Source | Take (de-cheesed) | Where it goes |
|---|---|---|
| Silva | alpha count-down induction ("3-2-1, deeper, calmer") | Build-1 beat 1 |
| Dispenza | coherence breathing (heart-focus, long exhale); "drop the old story" before install | Build-1 beat 1; the intent framing |
| Marisa Peer (RTT) | the **install half only** — command/affirm the new belief in a calm state | Build-1 beat 2 |
| Monroe / Hemi-Sync | OPTIONAL light tone/ambient bed as an induction aid | Build-1 optional audio |
| **Core Transformation** | **"every behavior has a positive intention" — ask what a vice/drift is really trying to give you, then meet that need** | **the DRIFT-RECOVERY / way-out tool (high value)** |
| New Code NLP | a playful channel-overload mini-game (Alphabet Game) to quiet the analytical mind | a standalone "reset" tool (fun, safe) |
| PSYCH-K | a physical posture/gesture as an embodiment anchor | Build-2 anchor option |

---

## 5. THE SAFETY LINE — do NOT build (important, not optional)
- **No trauma regression / childhood excavation** (Hoffman, RTT regression, Core Transformation's deep 10-step). Guiding someone into their wounds unsupervised is a real harm risk. Keep "install a better belief"; drop "dig up the wound."
- **No shock / aggressive clinical inductions** (Tom Silver). Needs a practitioner.
- **No 1–4 hour meditations.** Everything ≤ ~3 min with an 8-second floor.
- **No pineal-gland / quantum-field / CIA / occult framing** in the UI. Muscle-testing / binaural / sigils appear only as light *optional flavor*, never as truth-claims.
- If a user seems to be in genuine distress, the app points OUT (a gentle "this might be one for a real person, not an app"), never deeper in.

---

## 6. Brand + de-cheese rules (apply to everything above)
Berry palette + `:root` tokens; Tabler `ti-*` icons, **never emoji**; Jost/Baloo. One-line **science `why`** per element (breathing-app feel — backed, never lectured). Guardian voice. **Reward-never-shame.** An **8-second floor** version of every tool. **Contextual surfacing** — the right tool for the moment (Sequencer tool-slot / drift moment), never a wall/list. Additive only — no SCHEMA bump (custom tools ride `S.tools`).

---

## 7. Suggested build order
1. Build-1 guided reprogramming tool (uses existing engine; highest value, proves the stack).
2. The **Core-Transformation drift tool** ("what's this really giving you?") — doubles as the way-out / drift-recovery.
3. Build-2 "Make It Yours" builder (creativity endgame).
4. New Code reset mini-game + optional anchors (posture, tone bed) as polish.

*Related: [[wisdom-mining-done]] (engine-v1/canon/plotkin folds in `_course/_build/`), [[no-random-features]], [[model-selection-for-agents]].*

---

## 8. STATUS + remaining depth (David 2026-07-01)

**Shipped:**
- v723 — toolbox foundation: `FOR RIGHT NOW` lead pick, one-line science `why` per tool, Tabler icons (no emoji).
- v725 — **Rewire** (Build-1): the guided settle→picture→seal reprogramming tool on `beatRunner`.
- v726 — **Make It Yours** (Build-2): custom builder (intent · when · anchor · name) → personalised run, stored in `S.tools.custom`, "Yours" section.
- v727 — **genius surfacing**: `toolForNow()` reads real state (drift=craving, low mood, morning, night); a CUSTOM tool WINS when its `when` matches (wired into FOR RIGHT NOW card + the journey drift way-back). Builder deepened: write-your-own present-tense line + the **sigil** (pick/combine ≤3 Tabler line-marks; rendered on card + in the run).

**Backlog — the remaining depth (build to make the tool system fully "genius"):**

1. **Multi-sensory deepeners** — the "add power to it" layer. Optional add-ons on a tool (built-in or custom): **candle** (a lit-flame visual + "light yours if you have one"), **music/tone bed** (a soft ambient loop under the run — reuse/extend the `beatRunner` drone/`AudioContext`), **scent** (an anchor cue: "your chosen scent"). Framed as "deepeners," never required. Stored on the custom tool (`deepeners:[]`); referenced in a run beat. De-cheesed (no ritual/occult words).

2. **The daily-repeat REINFORCE loop** — the missing third of settle→install→REINFORCE. After building/running a tool, offer "make this a daily 20-second repeat." A tool flagged `daily:true` surfaces as a tiny once-a-day journey/cockpit node (a 1-line mantra loop of its install line) — repetition is how a self-image installs. Rides `S.tools` (a `daily` flag + last-done per logical day); reward-never-shame; skippable.

3. **Learn-your-kit** — adaptivity. Track which tools the user actually finishes/repeats (already partly in `S.tools.use/last/recents`) and let `toolForNow()`/`suggestTool()` PREFER the tool that has worked for THEM in a given state over the generic default. Over time the "right tool for now" becomes personal, not a fixed map. Personal-best only, never social (canon Law 3). Additive, no SCHEMA bump.

**Also queued (separate):** voice quality — prefer iOS *Enhanced* voices in the TTS picker (free quick win); optionally pre-record the FIXED tool scripts as neural audio via `edge-tts` (free, no key) served as static mp3s, Web Speech fallback only for user-typed custom lines. See [[HANDOFF-brain-gym]] for the Brain Gym (separate system).
