# THE PACING SETTING (David 2026-09-16) — what the engine can actually do

David: "this part could be tappable, so you tap next when you're ready, when you felt it. Which is a problem if this is a time thing. So this part could be modular where you can choose a checkbox in the beginning... automatically continue or wait for your tap. What I'm saying is not very clear. The user wouldn't really understand what that means. So we need to explain it clearly."

## The engine already supports both (no new player needed)
`beatRunner` (@SEC near `function beatRunner`): a beat WITH `hold: n` auto-advances after n seconds hands-free; a beat WITHOUT `hold` waits for the Next tap. Tapping Next always skips ahead early. So the setting is: apply the holds, or strip them.

## The honest constraint, solo vs stack
- **Solo tool:** both modes work. Tap mode = drop `hold` from the feel beats only (the naming beats keep theirs so the voice still leads).
- **Inside a stack:** the stack runs on `timelinePlayer`, which SCHEDULES every clip up front on the audio context. A tap-to-advance beat would desynchronise every act after it. So in a stack, gratitude is timed. Options if David wants tap in a stack: (a) timed only in stacks, setting hidden there; (b) the tap PAUSES the whole stack and resumes on tap, which fights the one-continuous-thing goal; (c) a hybrid where the tap only ever shortens, never extends. Recommend (a) plus (c): in a stack the tap can move you on early, it cannot make you wait.

## The setting, as the user sees it (first run of the tool, one question, two cards)
Question line: **How should the pauses work?**
- Card 1 title: **I'll keep it moving** · under it: *The practice runs on a timer. Each pause is long enough to feel the thing before the next one arrives.*
- Card 2 title: **Wait for my tap** · under it: *Nothing moves until you tap. Take as long as you want on each one.*
Footer under both: *You can change this any time in the tool's settings.*
In a stack, card 2 is shown greyed with the line: *In a stack the pauses are timed, so everything stays in one flow.*

Default: **I'll keep it moving** (eyes-closed law: the tool must be runnable with no taps).
Stored as `S.tools.gratPace = "auto" | "tap"`. Guarded reads, no SCHEMA bump.
