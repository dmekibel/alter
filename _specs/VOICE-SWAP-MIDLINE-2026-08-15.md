# Mid-line voice swap — David's spec (2026-08-15)

Queued behind the Sessions A/B/C pipeline (one writer on `app.js` at a time). Execute as soon as it clears.

## What ships today (v1302)
Switching voice mid-session re-voices only the segments that have **not begun**: the sounding line finishes in the OLD
voice, the next line starts in the new one, on the same second (the seam segment's `start` is byte-identical).

## David's correction, verbatim in substance
> "Switching voices works in the sense that the line being said is still finished in the original voice, and then the
> next line is already the new voice. Can we make it so the actual line being said continues being said in the new voice,
> so we don't even hear the ending of the original line?"

And then, refining it himself when told the two voices read the same line at different speeds so a proportional splice
would often land mid-word:

> "What if it doesn't restart the line completely, but it just goes back a little bit in time — to account for the
> potential change in timing — but it doesn't go all the way back to the beginning of the line. And we add a crossfade."

**That is the design. It is better than either option offered:** the rewind absorbs the drift between two readings AND
raises the odds of landing on a word boundary rather than mid-syllable, without repeating the whole line.

## The behaviour to build

On a voice change while a clip is SOUNDING (extends `revoice()`, shipped v1302):

1. Let `t` = elapsed inside the current clip, `Dold` = old clip duration, `Dnew` = new clip duration.
2. Proportional map: `p = (t / Dold) * Dnew` — the "same place" in the new reading.
3. **Rewind:** `start = max(0, p - VOICE_SWAP_REWIND)`. One NAMED constant, initial value **0.5s**, easy for David to
   tune on device. Never earlier than the line's own start (the clamp is what stops it turning into a restart).
4. **Crossfade** the old source out and the new one in over `VOICE_SWAP_XFADE` (initial **90ms**), gain-ramped on the
   existing voice bus — anchor every AudioParam with `cancelScheduledValues` + `setValueAtTime(param.value, now)` before
   each ramp, or it clicks (that exact un-anchored-ramp bug is what makes the breathing "flute glide" crack; do not
   repeat it here).
5. Everything AFTER the current segment re-lays out from the new clip's real end, exactly as `revoice()` already does.
   The transport must not jump: elapsed continues forward across the swap.
6. If the new bank has no clip for the current line, keep the old buffer playing to its end and switch from the next
   line (today's behaviour) — never go silent.

## Verification bar
Preview can prove: buffer identity swaps mid-clip, the new source starts at the computed offset, the transport does not
reset, remaining segments re-time from the new duration, no console errors, `node --check` + ratchet.
Preview CANNOT prove: whether the seam is inaudible. **DEVICE-UNTESTED for feel, always.**

## Fallbacks, in order, if it sounds wrong on the phone
1. Raise `VOICE_SWAP_REWIND` (0.5 → 0.8s) — more overlap, more chance of a clean word start.
2. Lengthen `VOICE_SWAP_XFADE` (90 → 150ms).
3. Only then fall back to restart-the-line-from-zero (a one-line change).
