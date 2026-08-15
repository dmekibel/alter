# SPEC: ONE BUILDER GRAMMAR + TOOLBOX REDESIGN (2026-07-19, Fable design synthesis)

David's directive (verbatim intent, from device screenshot session):
- Toolbox today is "ugly and unwelcoming." Wants minimalist, friendly, colorful, easy to navigate, not intimidating, inspired by the menus already approved.
- Breathing section must be visually near-identical to the meditation/stack builder. Right now it "looks like a completely different app."
- Breathing offers PREBUILT stacks (short / medium / long) as the main thing; custom build is secondary ("custom is extra").
- ONE mechanic: stack building, meditation building, breathing building are all the same menu/builder ("part of the same minimum").
- Process: plan on Fable (this doc). Visualize only what needs figuring out (the toolbox) with widgets rendered on OPUS in chat. Breathing fixes need no viz, build directly on Opus.

---

## PART 1: THE ONE GRAMMAR (build without viz)

**Law: a session is a stack of acts; there is exactly one builder and one player.**
A breath pattern (sigh / box / 4-7-8 / resonance / ladder stage) is an ACT, same rank as a meditation segment or a stretch move. No surface may own a private session UI.

### 1a. Breathing front door (replaces breathPicker's purple screen)
- Same time-first DOOR cards as the stack packs (tb-fdoor material: min-numeral + name + purpose + named steps + weighted battery strip). Press-play on tap.
- Three prebuilt breathing stacks:
  - SHORT (~2 min): physiological sigh. For "wired right now."
  - MEDIUM (~5 min): calming breath then box. Settle, then steady.
  - LONG (~10 min): the full ladder easy to deep (resonance, box, 4-7-8), reusing BREATH_LADDER/flow from v1126.
- Under the doors: one quiet "Build your own" row that opens THE stack builder seeded with breath acts. Secondary by design.
- The per-pattern science cards (goal + why, v1127 picker copy) survive as the door purpose lines / editor descriptions. The copy is already gate-passed; reuse, don't rewrite.

### 1b. Where v1127's controls move (delete the bespoke surfaces)
- Sound choice + tap-to-hear preview (breathPreview) and Voice/Sound sliders (breathVolRows): into the SHARED pre-session card + the player cog, same place meditation has them. The helpers are good; the private screen dies.
- Breath session chrome: the v1127 story-bars + cog stay, but the session should run inside the composed player pipeline (timelinePlayer) as the target state. Interim ok: breathwork overlay wearing the frame (already shipped). Final: breath acts route through timelinePlayer segments (it already has ORB DRIVE for seg.breath). Port the wave viz + 10 breath sounds into the player when merging. Device-test the orb pace before calling it done.

### 1c. Builder unification
- programBuilder / stack builder is THE builder. Entry points differ only by seed: tools seed (stack), meditation seed (segments), breath seed (patterns as blocks with cycle counts). Same chips, same add/remove/reorder, same duration logic.
- Kill criteria: no third menu system, no new overlay ids, no new chip styles. Reuse .tf-chip / .tb-fdoor / door battery components.

## PART 1.5: FIRST-PRINCIPLES HIERARCHY (David 2026-07-19, binding for the toolbox layout)
The user opening the toolbox almost always needs ONE thing: a prebuilt session sized to his time, one tap from playing. Everything else is progressive disclosure at zero screen cost until summoned.
- LAYER 1 = the whole default screen: one contextual "for right now" pick (planner gap / mood / time of night aware) + the three prebuilt session doors (short / medium / long, everything already inside). ~5 tappable things max. No library, no categories, no builder visible.
- LAYER 2 = one quiet "All tools" row at the bottom → opens the launcher tile grid (What-now-style tiles) for the I-know-what-I-want case.
- LAYER 3 = depth on demand: Build-your-own lives under the sessions; each tool's why/science lives inside its card. Nothing educational/configurational visible before it's asked for.
- Corollary: fewer things on screen → each can be BIG and FRIENDLY (Part 0 satisfied structurally, not cosmetically). The doors + the for-right-now pick should be the SAME component the planner uses to suggest a session in a gap.

## PART 2: TOOLBOX REDESIGN (viz first, on Opus, in chat)

Diagnosis of current state (device screenshot 2026-07-19): wall of heavy-bordered dark cards; 3 unexplained pips + "Willingness" chevrons = clutter; red SOS banner shouts; thinker credits up front do no work; no color story; intimidating.

Beauty/cleverness bar for the mockups:
1. One warm greeting + ONE hero action (guardian offers one thing for right now). Everything else quieter below it.
2. Game-piece component language: chunky solid domain-color chips, ink borders, hard shadows, gold-ring select. Colorful shelf, not a gray form. Layers get their domain colors (Body/Mind/Feelings/Become/Lift).
3. Minimal card = icon + name + one plain when-line. Thinker/pips/willingness fold behind tap or chevron.
4. SOS becomes a small quiet door, not a red alarm.
5. Compose from LIVE app CSS (read index.html :root palette + existing .tb-* classes first). Widget style law applies (memory: chat-widget-style-law).
6. Render 2-3 variants max in chat: (A) colorful chip-shelf library, (B) hero-card + horizontal category rows, (C) hybrid. David picks, then build in the real app.

## PART 00: SKIN SOURCE (added after two failed mockup batches)
ALL colors and component shapes come from `_specs/STYLE-NEW-ERA.md` (the NEW-era canon transcribed from David's approved Planner + What-now screenshots, to be verified against live CSS). The :root old-era tokens are FORBIDDEN as a mockup source. Follow that file's PROCEDURE before rendering anything.

## PART 0: THE GOVERNING DESIGN LAW (David 2026-07-19, app-wide)
**MINIMAL, BIG, FRIENDLY**, modeled on the new timeline / core redesign surfaces (scanner planner, minimal editor). Every surface in this spec is judged against this law FIRST, before any older reference.
- MINIMAL: stripes become an ACCENT, not the default fill (David: builder is "too bright, too much stripes"). Fewer borders, more air, one focal element per screen.
- BIG: generous type; large tap targets. Bottom CTAs, chips, and drag handles must be thick and obvious (David: bottom buttons too small, text too small, the bubble-stretcher hairline too small).
- FRIENDLY: warm color story, guardian-voiced single hero action, nothing that reads like a form or an alarm.

## SCOPE GUARDS (updated same day)
- **BUILDER LOCK LIFTED by David 2026-07-19** (he locked it 07-13; he reopened it himself: "too bright... has to be more big and friendly and minimal"). Builder MECHANICS stay (drag edge=length, hold=reorder, tap=open one-card-two-zones, remix entry, "+add" slot, save/play); the SKIN is reworked under Part 0. Concrete deltas: solid calm block fills with a stripe accent at most, bigger block type, thick visible drag handle (not a hairline), bigger bottom CTA row, more air between blocks.
- The 5 prior verdicts (time-first doors, layer tabs, planner-aware banner, remix-entry, pure-follow session) stay as MECHANICS; skins all move under Part 0.
- In-session pure-follow law and angel-serves-one low-vibe law stay.

## PART 3: EXECUTION ORDER (all on Opus)
1. Render toolbox mockup widgets in chat (2-3 variants, all obeying Part 0). David picks.
2. Build breathing front door + doors + builder seed (no viz needed). Ship.
3. Builder reskin under Part 0 (deltas are concrete: solid fills + stripe accent, bigger type, thick handle, bigger CTAs, air). No viz needed per David; if a call feels ambiguous, fold ONE builder frame into the step-1 mockup batch instead of guessing. Ship.
4. Rebuild toolbox front door + library to the picked mockup. Ship.
5. Deliberate single-engine player merge (breath through timelinePlayer), device-tested.

Constraints: regression contract untouched (no timeline work here). Ratchet: no new innerHTML wipe surfaces. i18n: EN + RU dict same commit. Copy through both gates.
