# ALTER — Design & Usability Audit
*External-reviewer format · v802 · 2026-07-02 · screenshots taken from the live build (journey, toolbox/cockpit, planner). PROPOSAL ONLY — nothing changed. David's asks driving this: "a lot better animation" + "everything more visible, less intimidating, larger."*

---

## Executive summary

**What's genuinely strong (don't touch):** the singular metaphor (the now-line eating the future and printing the past) — no competitor has it; the locked night-jewel palette with the now-line as the brightest object; the one-home cockpit direction; RU parity; the journey-as-world frame.

**The three systemic findings:**

1. **The app whispers. (Scale & density)** Most UI text runs 8–13.5px; dozens of touch targets sit under 44pt; surfaces open as multiple competing groups (the toolbox shows ~6 zones before the first action). ALTER feels intimidating not because it's complex — because it's *small and simultaneous*. This is the cheapest thing to fix and the biggest calm-down.
2. **Motion is decorative where it should be communicative.** Spring tokens and the portal reveal exist (Phase 1), but *state changes* hard-cut: zoom label handoff, dock state swaps, node completion, tab switches, points appearing. The moments that carry meaning get the least motion.
3. **The reward economy is under-celebrated.** Completions render dimmer than future items (inverse hierarchy — a done journey node reads "crossed off," David's exact complaint); points appear as static text; the timeline's own brilliant language (matte future → shining lived) is not applied outside the timeline.

---

## Surface findings (H/M/L severity)

### 1. Journey
- **H — Done nodes read as LESS.** Dimmed circle + checkmark = crossed-off. Invert: done = the shining/metallic finish (the battery language), future = matte/muted, and completion is an *ignition moment* (brighten + burst + points fly). (= ledger G5/G6)
- **H — The green check floats BESIDE the node** at some widths (screenshot evidence) — reads as debris, not achievement.
- **M — Caption sizes:** node captions ~10–11px, chapter "why" 11px at 62% opacity — unreadable at arm's length; these lines carry the meaning of the whole trail.
- **M — Rhythm:** large empty gaps between coins vs. a cramped current-node card (3 type sizes in 60px).
- **L —** 8 identical lock icons for future chapters; a fog-of-war fade would say the same thing more atmospherically.

### 2. Planner / timeline
- **H — Zoom label handoff hard-cuts** (nowread ↔ on-bubble text). Should fold/crossfade as one continuous element. (G13)
- **H — Live tracking is nearly invisible at low zoom** since the peek fix (correct behavior, wrong feel). The top-half activity-color glow restores "something is happening" without ever leaking below the line. (G8)
- **H — The armed Play button** renders at sizes where it cannot be hit; below fit-size it should become a blinking record-dot, below that nothing. (G7)
- **M —** Left-gutter hour numerals ~10px; csub 10.5px; backfill "+" at 38% opacity is an invitation nobody sees.
- **M — Empty day states** offer faint lines and no gesture hint — first-session users see "nothing."
- **L —** Week-strip letters ~9px. (Also G1: pinch-in from far out should anchor to the present.)

### 3. Cockpit / dock
- **H — The staged corner ring collides with the header clock** (screenshot evidence, toolbox stage).
- **M — Micro-text:** dock sub-line ~10.5px; the ON PLAN badge is **8px** — the single most important status in the app at the smallest size in the app.
- **M — State changes swap many small pieces at once** (idle→tracking→break) with no continuity; the open/close morph is great — extend that quality to state.
- (Functional redesign G11 — play-first flow — already ledgered, awaiting your call.)

### 4. Toolbox
- **H — Six competing groups** on open (header card, two big CTAs, triage chip, FOR-RIGHT-NOW, tabs, card list). One primary action per screen; the rest behind one fold. (= your F1 question — the three options stand.)
- **M —** Why/when lines at 11.5–12px × 14 cards = the wall you called overwhelming. Reveal-on-tap per card would halve the visual load.
- **M —** Tab chips ~30px tall — under comfortable touch.
- **L —** The floating Закрыть pill overlaps list content.

### 5. Bento picker
- **M —** Category rows scroll horizontally with no affordance that they scroll — most activities are invisible and undiscoverable.
- **L —** Search sits below the grid by design but nothing at the top hints it exists.

*(Game/garden + onboarding: not audited this pass — recommend a dedicated on-device session; they're persona-critical.)*

---

## Cross-cutting systems (where the leverage is)

### A. Type scale — the "less intimidating" lever
Today: ~9 ad-hoc sizes, most UI at 10–13.5px, minimum 8px. Proposal: **a 5-step scale** — 12 meta · 14 body · 16 row/label · 19 title · 24 hero — *nothing below 12 except tabular numerals*. Every caption +2px. One session, mostly CSS, transforms perceived friendliness.

### B. Touch targets
44×44pt minimum. Current violations: duration chips, toolbox tabs, calx delete, armed-play, week-strip days, dock seg buttons. The invisible-hit-area pattern (::after) already exists on small bubbles — generalize it instead of growing visuals everywhere.

### C. Motion language — principles for THE MOTION RUN (ledger §G)
1. **Every change animates from its cause.** Points fly from where they were earned to the coin counter, which pops to absorb them (G6). A node completion ignites *at the node* (G5).
2. **Fold, never cut.** The zoom label handoff (G13), dock state swaps, tab switches — one element transforming, not two swapping.
3. **Spend the motion budget on reward moments,** not ambience. Currently several things breathe at once; only the focal element (now-line / cur node) should.
4. **One canonical points animation** reused everywhere = the gamification spine you asked for.

### D. Reward economy — "the battery concept everywhere"
The timeline already speaks it: matte = potential, shining = lived. Extend the same finish system to journey nodes, habit chips, and toolbox daily pins: **done things are the brightest things**. Add a micro-tier celebration (a 6-frame sparkle) so small earns aren't silent, keeping the big celebrate() gated as now.

### E. Information density
Rule of one: each screen visually asserts ONE primary action. Progressive disclosure everywhere: tool why/when behind the card, composer "adv" behind a fold, journey chapter "why" on tap.

### F. Russian text expansion
RU runs ~15–25% longer; several EN-tight layouts (dock sub-line, badges, chips) will clip. Extend `__latinAudit()` into an overflow audit (flag any element whose text is clipped) and run it in RU on every surface.

---

## Proposed roadmap (in the order that compounds)

| Phase | Scope | Risk | Payoff |
|---|---|---|---|
| **1 — Type & targets** | The 5-step scale + hit areas + toolbox/journey density | Low (CSS-heavy) | The whole app instantly calmer and larger |
| **2 — THE MOTION RUN** | G5·G6·G7·G8·G13·G14·G1 under the timeline regression contract | Medium (gesture zone) | The "alive & rewarding" feel |
| **3 — Flows** | G11 cockpit play-first + F1 toolbox door | Needs your two picks | The tracking loop becomes the product |
| **4 — Follow-up audit** | Game/garden + onboarding, on device | — | Persona readiness |

*Recommended greenlight: Phase 1 next session (one clean run, minimal regression risk), Phase 2 as its own dedicated session right after.*
