# Claude Design prompt — the stack preview as an OVERLAY (David 2026-09-20)

Project: Alter Design System. Device: iPhone 16 Pro Max, 430x932 (artboard 402x874).

Today: tapping a stack tile in the tools library expands a dose card IN the scrollable grid (the panel pushes rows down and scrolls you). David: "I want it to be an overlay on top of the screen, either in the middle, on the bottom, or the whole screen. If you're on the home screen and press the Morning Stack, it doesn't scroll you down, it just opens a thing onto the home screen."

Design ONE overlay, three states, using the existing tokens (tokens/colors.css, tokens/effects.css) and the existing dose-card content (name, kicker, act chips in order with their icons and colours, the minute presets inside the stack's range, Edit steps, Start):
1. Opening from the home face (the "For you now" row): overlay rises over home, home dims, nothing scrolls.
2. Opening from inside a folder in the library: same overlay, same position, library stays where it was underneath.
3. Dismiss: tap outside or swipe down; home/library exactly as left.
Decide: bottom sheet vs centred card vs full screen. Show the three candidates side by side once, then commit to one. Keep the six-rows-of-three library untouched underneath. Export the chosen state at 402x874 plus the dismiss state.
