# ALTER — Deep Audit & Brainstorm (vision vs. what's live at v2.5)

## The one-sentence verdict
You set out to build a **guardian-angel that understands you and runs your life like a clever game.**
What's live is a good-looking, **manual** planner + tracker with a thin RPG skin. The gap isn't features —
it's **intelligence, depth, and aliveness.** Right now it's a calculator wearing a companion's face.

## Three root inferiorities (everything else descends from these)
1. **It's reactive, not proactive.** It waits for you to do everything. The "proactive" card is just a
   time-of-day if/else — it doesn't *know* you, notice drift, reach out, or initiate. A guardian angel that
   only speaks when spoken to isn't one.
2. **It doesn't learn or understand you.** Zero memory of your patterns. No adaptation by life-stage / style /
   age. No real data (Oura, sleep, weight trend, finances). It can't see your room or your meals. It's identical
   for everyone — the opposite of "adapts cleverly to you."
3. **The "game" is a stub.** Spark + 7 flat upgrades. No arc, no world, no idle growth, no unlocks, no stakes,
   no surprise. It's a points counter, not a game you *want* to open.

---

## Dimension-by-dimension gap (Vision → Built → What's missing)

| Dimension | The vision | Live now | The gap (why it's too simple) |
|---|---|---|---|
| **Proactivity** | Context Director composes the right move every open; notifications; catches drift | time-of-day hero card + bookend rituals | No real intelligence, no notifications, no drift-detection, no initiation |
| **Personalization** | Learns you; adapts by stage/style/age/country; Claude brain | fixed for everyone; a "frequent" list | Doesn't remember patterns, doesn't tailor, no Claude |
| **The game** | Real game on top: idle, world/island, unlocks, quests, synergies | Spark + 7 upgrades | No progression arc, no world, no idle, no fun loop |
| **Character/RPG** | Deep, evolving, branching growth | 8-virtue glowing constellation (pretty, shallow) | No skill-tree branches, no unlocks, no narrative, no "build" |
| **Data / understanding** | Oura, scale, steps, bloodwork, finances, photo-judges-your-room | none | Can't actually *see* or *measure* your life |
| **Addiction / quitting** | Allen Carr + Atomic Habits + Screen-Time blocker | nothing built (only "Pulls" readout) | The whole kryptonite system is missing |
| **Guardian voice** | Guide-not-judge coaching, generated live (Withers/Johnson) | a few static one-liners | No real coaching, no Claude generation, no warmth-at-depth |
| **Beauty / juice / haptics** | 5-tier reward ladder, particles, meaningful gestures, Core Haptics | a Spark scale-pulse + light vibrate | Almost no juice; rewards don't *feel* good |
| **Day-loop intelligence** | Learns your real schedule, suggests *your* perfect day, recovers gracefully when you fall off | one fixed template auto-fill; priority auto-drop | Suggestion isn't learned; no graceful recovery surfaced |
| **Habits depth** | Count-goals, time-of-day, reminders, analytics, trends | build/quit + daily/X-per-week + streak | No counts, no reminders, no insight over time |
| **Presence / notifications** | Proactive nudges (book the doctor, money check-in, "you went quiet") | none | The app is silent when closed = it doesn't exist between sessions |
| **Money + health outcomes** | Get-rich + get-healthy as gravity, with real tracking | not present | The two north-star outcomes aren't in the app |

---

## Deep brainstorm — how to make each axis ~1,000,000× more

### A) MORE PROACTIVE  (biggest unlock in the whole app)
- **The Claude brain via iOS Shortcuts ($0).** This is THE leap. A Shortcut feeds your logs/plan to Claude
  (your existing subscription, no token bill) and Claude returns: the ONE move right now, a morning brief, an
  evening reflection, a re-plan when you fall behind, and a judged photo of your room/meal. The app stops being
  dumb; the intelligence lives in Claude.
- **Notifications/presence:** a morning nudge ("here's your day"), a midday "you've drifted 90 min — one small
  move?", an evening bookend ping, a gentle "you went quiet" after absence. (Native iPhone phase.)
- **Drift detection:** it knows your usual rhythm and notices when you stall, then *intervenes* with the smallest rep.
- **Learned auto-plan:** instead of one fixed template, it builds *your* perfect day from your real history
  (you do deep work at 9, gym at 5) and offers it.
- **Always-live "the move":** the home always answers "what's the single best thing to do this minute," computed
  from time + energy + what's undone + what you're avoiding.

### B) MORE FUN  (turn the stub into a real game)
- **Idle/compounding Spark:** your active streaks generate Spark passively (the compound-interest fantasy made literal).
- **A world that grows:** the Sims/island layer — your earned Spark visibly builds a place (room → home → island)
  with pixel art that fills in as you live. You come back to *see what you built.*
- **Virtue skill-trees:** each of the 8 virtues branches into unlockable nodes (Zest → Cold Plunge → Iron Lungs),
  bought with Spark + real action. Real RPG depth.
- **Quests & missions:** daily/weekly quests ("ship 1 thing, move 3×, no scroll past 10pm") with chunky rewards.
- **Boss = your kryptonite:** doomscroll/weed as a literal boss you weaken with clean days; relapse = it heals, never "you failed."
- **Rare drops & combos:** stacking a workout + deep work + a send in one day = a combo bonus + a rare cosmetic.
- **Seasons:** a fresh themed track every few weeks so it never goes stale.

### C) MORE USER-FRIENDLY
- **Tap an empty slot on the grid → add there** (you asked for this); **drag to move/resize** blocks.
- **Inline smart suggestions:** as you plan, it pre-fills "breakfast 8am?" you keep/move/delete.
- **Voice capture:** "I just worked out for 40 min" → logged. (Shortcuts/Claude.)
- **One-tap everything, undo, haptics on every action, buttery transitions.**
- **Apple Health + Shortcuts + a Home-Screen widget** showing today + the one move.
- **Fewer screens, bigger touch targets, momentary delight** (the engagement-craft 5-tier reward ladder).

---

## The 3 highest-leverage moves (if we only did three)
1. **Build the Claude-via-Shortcuts brain.** Converts ALTER from a dumb form into an intelligence overnight, at $0.
   It makes it proactive, personalized, *and* able to "understand" your life — all three roots at once.
2. **Turn the game real:** idle Spark + a growing world + virtue skill-trees + quests. This is the "fun" multiplier.
3. **Make the planner intelligent:** learned auto-plan from your real history + tap/drag editing + graceful recovery.

Everything in the original REDESIGN-BRIEF.md is still the spec; this audit just names how far v2.5 is from it and where the leverage is.
