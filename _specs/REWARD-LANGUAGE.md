# THE REWARD LANGUAGE — «Свет зарабатывается» (Light is earned)
*2026-07-02 · codifies + evolves the established fragments into ONE system. Spec for the motion run + game work. Mockup of the tier ladder + badges delivered in chat (David approved the direction "holy moly").*

## The established laws (already locked — the foundation, do not violate)
1. **Stripes = reward only.** Drift = solid mauve. Ghost/missed = dark + dashed domain outline. Never striped punishment.
2. **Gold = a ring/inset accent, never a fill.**
3. **The battery finish:** matte stripes = potential · shining stripes = lived · the now-line = the conversion edge, brightest thing on screen.
4. **Mirror, not price:** points appear AFTER action, never pre-announced as a bribe. (earn() comments, SCHEMA 3.)
5. **No shame mechanics:** drift/misses cost nothing, resets are quiet, coming back is itself rewarded (the inversion: catch=unit, return=skill).
6. **No emojis; Tabler line marks; the berry palette; Jost.**
7. **TLM («Это в моём духе») = the identity mirror** — the words that turn points into self-image evidence (Maltz).

## The evolution — the five tiers
Every reward event in the app maps to EXACTLY ONE tier. Each tier owns a visual, a sound, a haptic. Never mix tiers, never improvise a new celebration.

| Tier | Trigger | Visual | Sound (Web Audio synth, one family) | Haptic |
|---|---|---|---|---|
| **1 · Искра (Spark)** | any tracked minute / small earn | micro-sparkle at the source + «+N» flies to the coin counter, counter pops | soft tick (short pluck, C5) | 8ms |
| **2 · Совпадение (Match)** | completed what you planned | the block IGNITES matte→shining (a sweep, not a swap) + points fly + TLM chip rides WITH the points | two-note chime up (C5→E5) | 8-24-8 |
| **3 · Серия (Combo)** | consecutive on-plan blocks | ×2/×3 multiplier chip near the dock; each link pops the chip bigger | rising arpeggio — one note higher per link (C-E-G-C) | 12ms, deeper each link |
| **4 · Корона (Crown)** | perfect day (all planned matched) | crown stamps onto the week-strip day; the summit chest OPENS into PM reflection + loot | short fanfare (≤900ms) | 8-40-8-40 |
| **5 · Веха (Landmark)** | chapter mastered · badge earned | full gated celebrate() + badge MINT (stamp-down + ring flash) + a garden cosmetic drops into the world | the guardian's motif (4 notes, the app's audio signature) | long-soft |

Combo resets: QUIETLY (chip fades, no sound, no message). Law 5.

## Badges — «Знаки» (marks)
Form: a round medallion, striped berry face, the mark = a Tabler line icon. Unearned = matte + dim (visible from day one — aspiration, not secret). Earned = gold RING (law 2) + subtle glint. Minted at tier 5.
Families (6 to start, ~4 ranks each — bronze/silver/gold ring thickness, never fills):
- **Вернулся (Return)** — came back after a 3+ day gap; THE flagship badge (the inversion: the return IS the skill).
- **Огонь (Streak)** — 3/7/21/60 days showing up.
- **Смелость (Courage)** — did the avoided thing (starred/avoided block completed; Reversal of Desire finished).
- **Точность (Alignment)** — match-rate marks (70/80/90% week).
- **Глубина (Depth)** — meditation/tool minutes accumulated.
- **Садовник (Gardener)** — world/garden growth milestones.
Home: a trophy shelf in the game pane (the world is WHERE achievements live — journey earns, world displays). Surfaced at earn moment via tier 5; browsable any time.

## Sound design — one instrument, one key
- ALL earcons synthesized on the shared AudioContext (zero assets, matches the existing oscillator/pad infra: blip(), bwGain, BGM bus).
- One family: soft plucked-sine + tiny triangle overtone (the existing pad's palette). Everything in C pentatonic; nothing dissonant, ever.
- Length caps: T1 ≤150ms · T2 ≤400ms · T3 ≤500ms · T4 ≤900ms · T5 ≤1600ms.
- Routed through the voice/bg buses → obeys the Sound panel; app-music OFF stays the default (A1); earcons have their own toggle in the Sound panel, default ON.
- NEVER during meditation/breath sessions (the tools own their soundscape; queue the reward for session end).

## Transition animations — the grammar (with the audit's motion laws)
1. Every change animates FROM its cause (points from the earn point; ignition at the block).
2. Fold, never cut (zoom label handoff, dock state swaps, tab switches).
3. Reward moments get the motion budget; only ONE ambient breather at a time (now-line / cur node).
4. The canonical set: ignition sweep · points-fly+counter-pop · chip-pop (combo) · crown-stamp · chest-open · badge-mint (stamp + ring flash) · fold-swap · pane-slide (exists) · cockpit-morph (exists) · portal reveal (exists).
5. Spring tokens from the motion system v648 are the easing source of truth.

## Implementation notes (for the motion run)
- State: additive `S.badges = {earned:{id:ts}, progress:{}}`, `S.combo = {n, dayK}` — no SCHEMA bump needed (S.mood/S.tools precedent), rides export/undo.
- The tier router: one function `reward(tier, ctx)` becomes the ONLY entry point — earn()/celebrate()/toast reward-paths route through it. Kills the scattered ad-hoc celebration code.
- Perfect-day detection at PM close (all planned blocks status ok) — crown stamps then, not at midnight.
- The mockup fix David flagged: big CTAs everywhere ≥52px tall, fat border, hard shadow (the «Попробуй — 20 секунд» in the mockup was too thin — never ship thin primaries).
