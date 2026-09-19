# ALTER MEDITATION: LEVELS, SILENCE AND MODULARITY

Everything below is computed against the 142 lines as written (16 blocks, 16 entries, 16 stacked entries, 110 rungs, mean 71.3 words, range 48 to 110) and against the shipped engine at `/Users/Dmekibel/claudeCode/alter/app.js`. Simulation source: `/private/tmp/claude-501/-Users-Dmekibel-claudeCode-alter/50003d0f-6de8-4ff4-975f-433c41e8f21d/scratchpad/sim2.py` and `lines.txt`.

---

## 0. THE SHIP BLOCKER, STATED FIRST

`PK.speechEst` (app.js:19217) is a flat `4.2`. The new lines are 48 to 110 words. At any sane rate a 71-word line is 24 to 28 seconds of speech. **The composer currently believes every line costs 4.2 seconds, so it lays roughly six times too much speech into every block.** Nothing else in this document works until that is fixed, so it is section 5 in detail and a precondition for sections 1, 2 and 6.

Second blocker, found by the same arithmetic: `while (t < bEnd - 1)` (app.js:19369) has no look-ahead. At 4.2s lines the average overshoot was about 15 seconds per block. At 28s lines it is about 35 seconds per block, times four or five blocks, which is a 2 to 3 minute overrun that `_fitK` (app.js:17704, floor 0.55 and 2.5s) cannot absorb without crushing every silence to its floor. Fix in section 5b.

Third blocker, new and structural: **a block's cost is not proportional to its weight.** It has a fixed entry cost (21.6s to 40.0s of speech) plus a variable rung cost. The proportional allocator at app.js:19361 gives `close` 36 seconds in a 5-minute Open sit while `close`'s entry alone is 28.8 seconds. Fix in section 4c (reserve-then-distribute), which is the same defect class as the `PK.somaticRelease` bug in ROUND.md.

---

## 1. THE LEVEL SYSTEM

### 1a. Level and space are two dials, and today they are one

Today `cfg.freq` (often/some/spacious, app.js:15509) becomes `depthOverride` 0.12/0.5/0.9, which feeds `composeMeditationSegs`'s `depth` (app.js:19354), which sets **both** the silence (`pauseFor("absorb", depth)`, app.js:19372) and, via `sessionDepth` (app.js:19250), is the only thing resembling a difficulty control. And `sessionDepth`'s `byLen` term infers depth from **length**, which the founder rejected.

Split them:

| dial | what it controls | where it comes from |
|---|---|---|
| **LEVEL** (beginner / intermediate / advanced) | which RUNGS are eligible, and the base silence | `S.tools.medLevel` if set, else derived (1b) |
| **SPACE** (guided / balanced / spacious) | a multiplier on silence only | the existing "remind me" row, app.js:15509 |

`sessionDepth()` keeps its job for the stack's non-meditation tools. Meditation stops calling it. Length never picks a level again.

### 1b. Deriving the level, from data that already exists

`tickTool` (app.js:17202) already writes `S.tools.use[id]` (distinct practice days, de-duped per logical day at app.js:17204) and `S.tools.last[id]` (the day key of the last finish). That is exactly what the founder's two rulings need.

```js
function medDaysSince() {                                   // days since the last meditate finish
  var k = (S.tools && S.tools.last && S.tools.last.meditate) || null;
  if (!k) return 1e9;
  return Math.max(0, Math.round((dayOf(todayK()) - dayOf(k))));   // dayOf = the existing key->day helper
}
function medFamiliarity() {                                 // the ledger doc's three tiers
  var u = (S.tools && S.tools.use && S.tools.use.meditate) || 0, d = medDaysSince();
  if (u === 0) return "first";
  if (u < 5 || d > 14) return "occasional";
  return "regular";
}
function medLevel(ctx) {                                    // ctx = { stack: true } inside a stack act
  var pick = (S.tools && S.tools.medLevel) || null;
  if (pick) return pick;                                    // an explicit user pick always wins
  if (ctx && ctx.stack) return "beginner";                   // FOUNDER RULING 1: the stack default is beginner. Never inferred from length.
  var u = (S.tools && S.tools.use && S.tools.use.meditate) || 0, d = medDaysSince();
  if (d >= 30) return "beginner";                            // FOUNDER RULING 2: a once-a-month user gets the basics again
  if (u >= 30 && d <= 3)  return "advanced";                 // ~a month of near-daily sits
  if (u >= 8  && d <= 14) return "intermediate";
  return "beginner";
}
```

Two notes a builder needs. First, `S.tools.use.meditate` counts **distinct days**, not sessions, because of the de-dupe at app.js:17204, so `u >= 30` really means thirty practice days. Second, the lapse test runs before the count test on purpose: thirty days away puts a 200-session user back on the beginner rungs, which is the founder's ruling read literally and is also correct practice.

### 1c. How level selects lines

**A level is a WINDOW over the authored ladder, not a filter.** The pools are authored basic to subtle and `order` at app.js:19367 already walks them in authored order. Level moves the window's start and its ceiling.

```js
// TOP rungs: the Adyashanti-owned effort-drop rungs and the deep self-inquiry rungs.
// THE PANEL law: "Adyashanti at rung one tells a beginner there is nothing to do, and they stop."
// A beginner never reaches these at any dose.
var MED_TOP = { breath:["12"], count:["4"], note:["12"], open:["7","9"], being:["6","7","9"],
                look:["3","4","5"], free:["4"], heart:["6"], bliss:["6","7"],
                listen:["5"], watch:["5"], feel:["5"] };

function medWindow(pool, level, need) {
  var keep = pool.filter(function (l) { return !(level === "beginner" && l.top); });
  if (level === "beginner") {
    // the soft ladder first; the [advanced] rungs unlock only after it is spent, inside the same sit.
    return keep.filter(function (l) { return l.lv !== "advanced"; })
       .concat(keep.filter(function (l) { return l.lv === "advanced"; }));
  }
  var nbeg = keep.filter(function (l) { return l.lv === "beginner"; }).length;
  var want = (level === "advanced") ? nbeg : Math.max(0, nbeg - 1);  // intermediate keeps ONE beginner rung as an on-ramp
  var drop = Math.min(want, Math.max(0, keep.length - need));        // never skip so far that the block starves
  var out = [], d = 0;
  for (var i = 0; i < keep.length; i++) {
    if (d < drop && keep[i].lv === "beginner") { d++; continue; }
    out.push(keep[i]);
  }
  return out;
}
```

Three design calls inside that, each with its reason:

1. **Beginner locks TOP rungs forever, not all advanced rungs.** A 20-minute beginner sit that hits the ceiling at rung 8 and then plays `MED_RETURN` for six minutes is worse than one that climbs. Rung order is what the law protects, and by minute fourteen the listener is not at rung one. `breath` 12, `count` 4, `note` 12, `open` 7 and 9, `being` 6/7/9, `free` 4, `heart` 6 are the "put the effort down" rungs. Those stay locked because their failure mode is a beginner concluding there is nothing to do.
2. **Intermediate keeps one beginner rung as an on-ramp.** Dropping straight into `breath` rung 4 (stay past the end of the out-breath) with no anchoring rung reads as arriving mid-lesson.
3. **`drop` is bounded by `need`.** That is what prevents the advanced window starving a small pool. `settle` has 5 rungs; an advanced 5-minute sit wants 1, so it skips both beginner rungs and starts at rung 3. A 20-minute sit wants 4, so `drop = min(2, 5-4) = 1` and it starts at rung 2.

The pool data gains two fields, which is a data edit, not an engine change:

```js
settle: { name:"Settle", ti:"ti-armchair", c:THC("#63e6d6","bg"),
  entry: "Find a position you can stay in...",
  entryStacked: "Nothing more is being asked of your body now...",
  pool: [ { lv:"beginner", t:"Stop using effort to hold yourself up..." },
          { lv:"beginner", t:"Now take one reading of the body all at once..." },
          { lv:"intermediate", dup:"inhabit-feet", t:"Now take your attention all the way down into your feet..." },
          { lv:"intermediate", dup:"hand-on-chest", t:"If your thinking is loud right now..." },
          { lv:"advanced", t:"Settling might take one breath this morning..." } ] }
```

---

## 2. THE SILENCE CURVE

### 2a. What is wrong now

`gap = pauseFor("absorb", depth)` at app.js:19372 resolves to `4 + att*15` (app.js:19244) and is **identical for every line in the block and every block in the session**. The founder: "silence between lines is not a singular number, it depends how deep in the meditation you are." Two axes are missing.

### 2b. The formula

```js
var MED_SIL = {
  base:  { beginner: 6.0, intermediate: 9.0, advanced: 13.0 },  // silence after a block's FIRST line
  ramp:  0.9,        // within-block: the block's last line gets base * (1 + ramp)
  arc:   { first: 0.80, mid: 1.00, spine: 1.25, close: 0.50 },  // across-session
  space: { guided: 0.70, balanced: 1.00, spacious: 1.45 },      // the "remind me" preset
  min: 3, max: 40, deepMul: 2.4, deepMin: 25, deepMax: 55
};

// p = position within this block's spoken lines. 0 at the entry, 1 at the block's last line.
function medGap(level, p, arc, pre, deep) {
  var g = MED_SIL.base[level] * (1 + MED_SIL.ramp * p) * MED_SIL.arc[arc] * MED_SIL.space[pre];
  if (deep) return Math.max(MED_SIL.deepMin, Math.min(MED_SIL.deepMax, g * MED_SIL.deepMul));
  return Math.max(MED_SIL.min, Math.min(MED_SIL.max, g));
}
```

`p` is computed as `(linesPlayedSoFar + 1) / nPlanned`, where `nPlanned` is the block's fitted line count (section 6a). The `arc` role comes from the block's position in the lane, stamped at compose time: index 0 is `first`, the highest-weight block is `spine`, the last block is `close`, everything else is `mid`. That is the founder's "settle dense, spine ramping, close tightening because the listener is coming back", made mechanical.

Author it into the seg as `gap` and keep `_pk = "absorb"` so `PK_ELASTIC` (app.js:19222) still lets the dose re-fit squeeze it. `deep` blocks keep `_pk = "inquiry"`.

### 2c. The curve, in seconds (balanced preset)

| level | arc | p=0 | p=.25 | p=.5 | p=.75 | p=1 |
|---|---|---|---|---|---|---|
| beginner | first | 4.8 | 5.9 | 7.0 | 8.0 | 9.1 |
| beginner | mid | 6.0 | 7.4 | 8.7 | 10.1 | 11.4 |
| beginner | spine | 7.5 | 9.2 | 10.9 | 12.6 | 14.2 |
| beginner | close | 3.0 | 3.7 | 4.3 | 5.0 | 5.7 |
| intermediate | first | 7.2 | 8.8 | 10.4 | 12.1 | 13.7 |
| intermediate | mid | 9.0 | 11.0 | 13.0 | 15.1 | 17.1 |
| intermediate | spine | 11.2 | 13.8 | 16.3 | 18.8 | 21.4 |
| intermediate | close | 4.5 | 5.5 | 6.5 | 7.5 | 8.5 |
| advanced | first | 10.4 | 12.7 | 15.1 | 17.4 | 19.8 |
| advanced | mid | 13.0 | 15.9 | 18.8 | 21.8 | 24.7 |
| advanced | spine | 16.2 | 19.9 | 23.6 | 27.2 | 30.9 |
| advanced | close | 6.5 | 8.0 | 9.4 | 10.9 | 12.3 |

Preset scale, on the spine at p=0.5: beginner 7.6 / 10.9 / 15.8; intermediate 11.4 / 16.3 / 23.7; advanced 16.5 / 23.6 / 34.2.

Deep block (`look`), balanced: beginner 25 to 34, intermediate 27 to 51, advanced 39 to 55. That preserves the shipped 25 to 45 investigate-silence intent at app.js:19371 and extends it correctly at the top.

### 2d. Sanity check against the reference

Blackstone speaks about 85 words then leaves roughly one breath cycle. Adyashanti leaves 20 to 40 seconds at the top of a ladder. A beginner on the spine gets 7.5s after the first rung growing to 14.2s at the last; an advanced gets 16.2s growing to 30.9s. That is the shape, and the fact that the numbers sit in one table with one multiplier each is what makes them tunable by the founder the way `PK` is (app.js:19207, "THESE NUMBERS ARE THE TUNING DIAL, David edits PK, nothing else").

---

## 3. THE MODULAR RULES

### 3a. The ledger

Adopt the object from `_design-sync/audio-content-2026-09-09/graph/engine-context-ledger.md`, carried act to act by `composeStackSegs` and block to block by `composeMeditationSegs`:

```js
L = { eyes:"open"|"closed", posture:"standing"|"seated"|"lying",
      breathed:false, relaxed:false, settled:false, scanned:false, embodied:false, sounded:false,
      prev:null, first:true, familiarity:"first"|"occasional"|"regular", level, dose, actSecs }
```

Updated by: stretch (posture standing, eyes open), breathe (breathed), relax (relaxed, settled, eyes closed), any meditation block (settled, eyes closed, prev=blockKey), `scan` (scanned), `embody` (embodied), `listen` (sounded).

### 3b. Which entry variant plays, and why

**THE RULE: an entry variant is chosen by the one fact its own text asserts.** No other rule. That makes every row auditable against the line itself, and it is what stops a stacked entry playing a lie.

| block | the stacked entry's assertion | condition to use ENTRY-STACKED |
|---|---|---|
| settle | "Nothing more is being asked of your body now" | `L.relaxed` |
| breath | "Your attention has been spread across the whole body" | `L.relaxed \|\| L.scanned \|\| L.embodied` (NOT `L.breathed`; a voiceless pacer never spread the attention) |
| count | "Your breathing may be uneven now" | `L.breathed \|\| L.prev === "breath"` |
| note | "For the last few minutes the breath was your one thing to stay with" | `L.prev === "breath" \|\| L.prev === "count"` |
| scan | "Until now you have been doing things to the body" | `L.relaxed` |
| listen | "The body is heavy and quiet now" | `L.relaxed \|\| L.prev in {scan, embody}` |
| watch | "Your body is already settled" | `L.settled` |
| feel | "You just let the whole body go soft" | `L.relaxed && L.prev in {relax, scan, embody}` |
| close | "do not set anything up again" | any prior block in this sit (so: always, except a one-block sit) |
| free | "your body is already soft and your breathing is already paced" | `L.relaxed && L.breathed` |
| open | "So far you have had something to follow" | any prior object block (breath/count/note/scan/listen/watch/embody) |
| heart | "Your body is already quiet" | `L.relaxed \|\| L.settled` |
| look | "You have been watching thoughts arrive and pass for a few minutes now" | `L.prev === "watch"` (strict; this is why the Insight lane puts `watch` immediately before `look`, section 4b) |
| embody | "So far you have been attending to the body from the outside" | `L.prev === "scan"` (this is why the Body lane is scan then embody) |
| being | "You settled your body a few minutes ago" | `L.settled` |
| bliss | "Your body is already softer... your breathing has already settled" | `L.relaxed && L.breathed` |

Two conditions fall out of that table as **lane constraints, not preferences**: `look` after `watch`, and `embody` after `scan`. Both are built into section 4b.

### 3c. Which rungs drop when an earlier act already did the work

A rung carries an optional `dup:` key. **The LATER block in the sit keeps the move; the earlier one drops it**, because a technique taught and then taught again reads as the app forgetting, while a technique taught later reads as deepening.

| dup key | rungs carrying it | resolution |
|---|---|---|
| `hand-on-chest` | settle 4, heart 2, heart 5 | in a Heart lane, settle 4 drops. In any other lane settle 4 stands. |
| `inhabit-feet` | settle 3, embody entry | in the Body or Embodiment lane, settle 3 drops. |
| `inhabit-taught` | scan 3, listen 4, being 5, embody entry, count 3 | only the FIRST occurrence in a sit speaks its naming sentence ("that move is called inhabiting"). The later rungs keep the instruction and the engine plays their alternate short form. This needs one extra authored field per rung, `tShort`, on those five lines only. |
| `noting-word` | note 2, open 2 | `open` 2 drops when `note` ran earlier in the same sit. |
| `metta-lines` | heart 1, 5, 7, 8, 9 | never dropped; the repetition is the technique. |

**Exempt from every drop rule, permanently: the safety lines.** `feel` entry / 1 / 2 / 3 / 4 / 5, `look` entry / 3 / 4, `open` 5, `bliss` 7 all carry an eyes-open exit. Those never dedupe, never get short forms, and never fall outside a window. Tag them `safe:true` and make the window builder append any `safe` rung that would otherwise be skipped. The plain reader's standing veto still holds: a pool line is not a safety net, and the visible stop control in the player is still owed.

Cross-act dedupe already half exists as `usedTxt` in `composeStackSegs` and `used` in `composeMeditationSegs` (app.js:19353), but ROUND.md BUG 1 notes the relax branch never writes into `usedTxt`. Fix that in the same pass or the stack keeps re-saying relax cues.

### 3d. How a block that runs second opens differently

Three mechanisms, in order of precedence:

1. **The entry variant** (3b). Structural, chosen once.
2. **The transition beat.** app.js:19362 already adds `PK.transition` (2.0s) to the previous block's last gap at a block boundary. At reference line length 2.0s is too short to register a change of technique after a 30-second silence. Raise it to `PK.transitionMed = 4.0` for meditation block boundaries only, and leave `PK.transition` alone for tool acts.
3. **The entry gap.** Currently `pauseFor("cue", depth)` (app.js:19361), which is 2.5 to 7.5s and identical for every block. Replace with `medGap(level, 0, arc, pre, deep)`, which is the p=0 column of the table in 2c. A `close` entry gets 3.0s of silence; an advanced `spine` entry gets 16.2s. That alone makes an opening block feel different from a spine block.

---

## 4. THE LANES

### 4a. What each lane trains, and its prerequisite

| key | name | `sub` (shipped style) | trains | you must already be able to |
|---|---|---|---|---|
| `concentration` | Concentration | steady the breath, the ground under all the rest | one object held across its whole duration | nothing |
| `mindfulness` | Mindfulness | note whatever comes and goes | receiving what arrives, naming it once, letting it end | stay on the breath for a minute |
| `body` | Body | read the body, then get inside it | Blackstone's canon distinction: observing a part from outside, and inhabiting it from within | nothing |
| `open` | Open awareness | rest as the space things arise in | holding a whole field instead of one object, and levelling the lean and the flinch | note single objects to their end |
| `heart` | Heart | warmth, widening outward | making a felt state arrive on demand, and what to do when it will not | sit still for five minutes without fidgeting |
| `steady` | Steady | stay with what you are carrying today | staying inside one difficult sensation without changing it | find a sensation and stay a few breaths |
| `rest` | Rest | stop working at it, and see what is here | putting the effort down without replacing it with anything | notice you have drifted, reliably |
| `insight` | Insight | look for the self, gentle, optional | self-inquiry | watch thoughts arrive for several minutes. Gated, opt-in, and see 4d |

Body and Rest are the two new lanes the founder asked for (embodiment and resting). Steady exists because `feel` otherwise has no home and the energy door already knows which days need it.

### 4b. The data

Blocks gain a 4th element, `minSec`, so a mechanic appears only at a dose that can carry it. `MED_SESSIONS` (app.js:15456) becomes:

```js
var MED_SESSIONS = {
  concentration: { name:"Concentration", sub:"steady the breath, the ground under all the rest",
    blocks: [["settle",0.8],["breath",3.0],["count",1.0],["free",0.5,600],["close",0.7]] },
  mindfulness:   { name:"Mindfulness", sub:"note whatever comes and goes",
    blocks: [["settle",0.8],["breath",0.7],["note",3.0],["listen",0.8,900],["close",0.7]] },
  body:          { name:"Body", sub:"read the body, then get inside it",
    blocks: [["settle",0.7],["scan",1.6],["embody",2.6],["close",0.7]] },
  open:          { name:"Open awareness", sub:"rest as the space things arise in",
    blocks: [["settle",0.8],["breath",0.6],["watch",0.9,600],["open",3.0],["close",0.6]] },
  heart:         { name:"Heart", sub:"warmth, widening outward",
    blocks: [["settle",0.8],["breath",0.6],["heart",3.0],["bliss",0.9,900],["close",0.7]] },
  steady:        { name:"Steady", sub:"stay with what you are carrying today",
    blocks: [["settle",0.9],["breath",0.7],["feel",2.8],["close",0.8]] },
  rest:          { name:"Rest", sub:"stop working at it, and see what is here",
    blocks: [["settle",0.8],["breath",0.6],["being",3.0],["free",0.5,900],["close",0.7]] },
  insight:       { name:"Insight", sub:"look for the self, gentle, optional",
    blocks: [["settle",0.8],["breath",0.7],["watch",1.0],["look",2.6],["close",0.8]],
    gated:true, minSec:600, minLevel:"intermediate" }
};
```

Block ordering is load-bearing in exactly two places, both forced by section 3b: `watch` sits immediately before `look` in Insight so `look`'s stacked entry is true, and `scan` sits immediately before `embody` in Body so `embody`'s stacked entry is true. Do not reorder those.

The `close` conflict raised in ROUND.md is resolved by the rewrite and needs no decision: the old close entry said "let the mind rest, free to do as it pleases", which was `free`'s whole move. The new close entry says "That is the sit finished, and you can stop the technique now", so `free` and `close` can now sit in the same lane.

Eight lanes exceeds the four chips the picker shows comfortably. The picker already has a four-then-more pattern in the codebase (`var CAP = 4`, app.js:17195). One line for the founder: show four by lane rank (`S.tools.use` ordered) plus a "more" chevron, or show all eight. Not decided here.

### 4c. The allocator: reserve, then distribute

Replace the proportional slice at app.js:19361.

```js
// EVERY BLOCK'S ENTRY IS A FIXED COST. Only the RUNGS are proportional.
// Same defect class as PK.somaticRelease in the relax act: reserve off the top, then share the spare.
function medAllocate(blocks, totalSec, level, pre, L) {
  var bl = blocks.filter(function (b) { return totalSec >= (b.minSec || 0); });
  for (;;) {
    var fx = {}, fixed = 0;
    bl.forEach(function (b) {
      var e = speechOf(entryTextFor(b.key, L));                       // stacked or plain, per 3b
      fx[b.key] = e + medGap(level, 0, b.arc, pre, b.deep); fixed += fx[b.key];
    });
    var rem = totalSec - fixed, sw = 0; bl.forEach(function (b) { sw += b.weight; });
    if (rem >= 0) {
      var sl = {}, starved = null;
      bl.forEach(function (b) { sl[b.key] = fx[b.key] + rem * b.weight / sw; });
      bl.forEach(function (b) {                                        // every non-spine block must afford one rung
        if (starved || b.arc === "spine" || b.key === "settle" || b.key === "close") return;
        var shortest = minSpeechIn(b.key, level);
        if (sl[b.key] < fx[b.key] + shortest + medGap(level, 0.5, b.arc, pre, false)) starved = b;
      });
      if (!starved) return { blocks: bl, slice: sl };
    }
    var cand = bl.filter(function (b) { return b.arc !== "spine" && b.key !== "settle" && b.key !== "close"; });
    if (!cand.length) return { blocks: bl, slice: fx };                 // entries only; the dose is genuinely tiny
    var drop = cand.reduce(function (a, b) { return b.weight < a.weight ? b : a; });
    bl = bl.filter(function (b) { return b !== drop; });                // drop the lightest, re-solve
  }
}
```

### 4d. Two lane rules that the arithmetic forces

**Insight is intermediate-and-up.** `look`'s beginner window is 2 of 5 rungs (rungs 3, 4, 5 are TOP). At 20 minutes a beginner Insight sit plays 2 rungs, 3 re-anchors and 325 seconds of tail. The lane is already hidden from `practiceNovice` (app.js:15512), so `minLevel:"intermediate"` costs nothing and fixes it. `minSec:600` because at 5 minutes the lane is 5 lines and at 2 minutes it is 3 entries.

**Under 4 minutes, the lane collapses to a MICRO shape: `settle` then `close`.** Simulated at 2 minutes with the full lane, every lane plays three entries and zero rungs, because three entries plus three gaps is the whole 120 seconds. Two blocks at 2 minutes plays:

| level | settle | close |
|---|---|---|
| beginner | entry + rung 1 (60s, 3s tail) | entry + rung 1 (60s, 5s tail) |
| intermediate | entry only (60s, 33s tail) | entry + rung 1 (60s, 1s tail) |
| advanced | entry only | entry only |

Beginner gets four spoken lines instead of three entries, which is the right trade. For advanced at 2 minutes the honest answer in the picker is that 2 minutes is a beginner dose; either keep it (two entries, long silences, which an advanced user will read as intended) or gate 2 minutes to beginner. One line for the founder, not decided here.

---

## 5. THE TIMING BLOCKER

### 5a. The per-line estimate

```js
// PK additions (app.js:19208 block)
wps: 2.9,          // SEED, words per second. MEASURE IT: DEV.wps() decodes the bank and reports the real mean.
                   // S.tools.medWps (learned, 5c) overrides it. 2.9 is 174 wpm, between the shipped bank's
                   // apparent rate and the 2.5 the reference teachers hold. It is a seed, not a claim.
speechMin: 2.2,    // the floor for a very short line
speechPad: 1.06,   // safety: UNDER-estimating overfills the block, which is the damaging direction

function speechOf(txt) {
  if (!txt) return 0;                                            // a voiceless breath phase takes no speech time
  var w = String(txt).trim().split(/\s+/).length;
  var wps = (S.tools && S.tools.medWps) || PK.wps;
  return Math.max(PK.speechMin, (w / wps) * PK.speechPad);
}
```

Worked: a 71-word line (the bank mean) costs `71/2.9*1.06 = 26.0s`. The shortest line in the bank (`scan` 5, 48 words) costs 17.5s. The longest (`look` 3 and 5, 110 words) costs 40.2s. `PK.speechEst` claimed 4.2s for all three.

### 5b. The call sites, by line number

**The three that block this ship:**

| line | current | replace with |
|---|---|---|
| **19364** | `used[_normLine(def.entry)] = 1; t += entryGap + PK.speechEst;` | `t += entryGap + speechOf(def.entry);` |
| **19373** | `var _ms = medSeg(ln, gap, ""); _ms._pk = gk; P(_ms); t += gap + PK.speechEst;` | `... t += gap + speechOf(ln);` |
| **19306** | `tt += cad + PK.speechEst; first = false;` (the stack's meditation act, `MED_SEC` sections) | `tt += cad + speechOf(ln); first = false;` |

**Plus the look-ahead guard, replacing the loop head at 19369:**

```js
// was: while (t < bEnd - 1) {
var nPlan = Math.max(1, Math.round((bEnd - t) / (meanSpeechIn(key, level) + medGap(level, 0.5, arc, pre, deep))));
var win = medWindow(pool, level, nPlan), i = 0;
while (i < win.length) {
  var p = Math.min(1, (segsPlayed + 1) / nPlan);
  var g = medGap(level, p, arc, pre, deep), cost = speechOf(win[i].t) + g;
  if (t + cost > bEnd + 2) break;                       // NEVER overshoot by a whole line. The +2 is the tolerance.
  ... lay it down ...; t += cost; i++; segsPlayed++;
}
// tail: one re-anchor per 90s of leftover, max 3, and ONLY in a weave block (medBlockResolve, app.js:19381).
// An objectless block (being, open, free) gets a NON-BREATH return line or silence: every current
// MED_RETURN cue (app.js:15451) says come back to the breath, which is wrong in those blocks.
```

**Correctness debt, same defect, fix in the same pass or the numbers keep lying:**

| line | what it does wrong |
|---|---|
| 19345 | `t2 += lcad + PK.speechEst` (the generic `C.lines` branch) |
| 19341 | `lFix = ... PK.speechEst * PK.affirmMul` claims to anchor a say-it-back pause to "the line's OWN spoken length" and uses a constant. Should be `speechOf(ln) * PK.affirmMul`. |
| 19311, 19312 | gratitude `gCost` and `gN` price every prompt at 4.2s |
| 19328 | relax `cSpare` |
| 18996, 19015, 19017 | the stretch composer's `_per`, `h` and `more` |
| 21886 (DEV.compose), 21895 | the dev audit passes `PK.speechEst` as both the per-seg speech and the `dur` argument to `pkGap`. Until these move, `DEV.compose()` will report a 20-minute sit as fitting and the founder will ship on a false green. |
| 22095 | the stretch audit's `fillSec` |

### 5c. Stop guessing the constant, permanently

`relayoutFrom` (app.js:17705) already knows every real duration: `segs[i].dur = segs[i].buf.duration`. Learn from it.

```js
// at the end of relayoutFrom, when from === 0:
try {
  var sw = 0, sd = 0;
  segs.forEach(function (sg) { if (sg.text && sg.dur > 1 && !sg._clipShift) { sw += sg.text.trim().split(/\s+/).length; sd += sg.dur; } });
  if (sd > 30) {
    var obs = sw / sd, prev = (S.tools && S.tools.medWps) || PK.wps;
    S.tools.medWps = Math.max(2.0, Math.min(4.2, prev * 0.75 + obs * 0.25));   // slow EMA, clamped
    save();
  }
} catch (e) {}
```

Plus a dev probe so the founder sets the seed from measurement before the first real ship, rather than from my estimate:

```js
DEV.wps = function () { /* TTS.warm the whole new bank, decode, return {n, meanWps, min, max, worstLine} */ };
```

Honest label: **every number in sections 2, 4 and 6 is computed at `wps = 2.9`. If `DEV.wps()` comes back at 3.6 the line counts rise by about 20 percent and the tails shrink. The shapes and the rules do not change; only the fitted counts do.** Boots-clean-in-preview is the only claim available until then, and the felt pace is device-untested.

---

## 6. THE POOL ARITHMETIC

### 6a. Per-block inventory

| block | pool | beg / int / adv | TOP rungs | mean words | mean speech | entry | stacked entry | total pool speech |
|---|---|---|---|---|---|---|---|---|
| settle | 5 | 2/2/1 | 0 | 64.4 | 23.5s | 19.7s | 20.5s | 117.7s |
| breath | 12 | 3/5/4 | 1 | 63.2 | 23.1s | 23.0s | 20.5s | 277.1s |
| count | 4 | 1/2/1 | 1 | 59.5 | 21.7s | 24.1s | 24.5s | 87.0s |
| note | 12 | 5/5/2 | 1 | 61.1 | 22.3s | 25.2s | 21.9s | 267.9s |
| scan | 7 | 1/4/2 | 0 | 59.4 | 21.7s | 24.9s | 23.8s | 152.0s |
| listen | 5 | 2/2/1 | 1 | 61.8 | 22.6s | 23.4s | 22.3s | 112.9s |
| watch | 5 | 2/2/1 | 1 | 63.8 | 23.3s | 25.6s | 26.7s | 116.6s |
| feel | 5 | 2/2/1 | 1 | 71.4 | 26.1s | 27.4s | 28.9s | 130.4s |
| close | 3 | 1/2/0 | 0 | 60.7 | 22.2s | 26.3s | 27.0s | 66.5s |
| free | 4 | 1/1/2 | 1 | 57.8 | 21.1s | 23.4s | 23.8s | 84.4s |
| open | 9 | 2/3/4 | 2 | 84.1 | 30.7s | 31.1s | 27.0s | 276.6s |
| heart | 9 | 2/3/4 | 1 | 71.1 | 26.0s | 28.5s | 25.6s | 233.8s |
| look | 5 | 1/1/3 | 3 | 101.2 | 37.0s | 35.8s | 36.6s | 184.9s |
| embody | 9 | 2/5/2 | 0 | 78.7 | 28.8s | 27.4s | 28.5s | 258.7s |
| being | 9 | 2/3/4 | 3 | 94.4 | 34.5s | 28.2s | 25.6s | 310.5s |
| bliss | 7 | 1/3/3 | 2 | 74.1 | 27.1s | 24.9s | 30.0s | 189.6s |

### 6b. Fitted line counts, all lanes, all doses, all levels (balanced preset)

Format: block `slice` → `[rungs played]`. `+R` is a re-anchor. Full run in `sim2.py`.

**Concentration**

| dose | beginner | intermediate | advanced |
|---|---|---|---|
| 2m | MICRO: settle[1], close[1] | MICRO: settle[-], close[1] | MICRO: settle[-], close[-] |
| 5m | settle 52s[-], breath 132s[1,2], count 64s[1], close 53s[1] = **8 lines** | settle 64s[2], breath 173s[3,4,5], close 63s[1] = **8** | settle 65s[-], breath 171s[4,5], close 64s[1] = **6** |
| 10m | settle[1,2], breath[1-6], count[1,2], free[1], close[1,2] = **18** | settle[2], breath[3-7], count[1,2], free[-], close[1] = **14** | settle[3], breath[4-8], count[2], close[1] = **12** |
| 15m | settle[1,2,3], breath[1-11], count[1,2,3], free[1,2], close[1,2,3] = **27** | settle[2,3], breath[3-11], count[1,2,3], free[1], close[1,2,3] = **23** | settle[3,4], breath[4-10], count[2,3], free[2], close[1,2] = **19** |
| 20m | settle[1-4], breath[1-11]+R, count[1,2,3], free[1,2], close[1,2,3] = **28** | settle[2-5], breath[1-12], count[1-4], free, close[1,2,3] = **30** | settle[2-4], breath[1-11], count[1,2,3], free[2], close[1,2,3] = **27** |

**Body (new)**

| dose | beginner | intermediate | advanced |
|---|---|---|---|
| 5m | settle[-], scan 82s[1], embody 119s[1,2], close[-] = **7** | settle[-], scan[1], embody[2], close[-] = **6** | settle[-], scan[2], embody[3], close[-] = **6** |
| 10m | settle[1], scan 168s[1-4], embody 258s[1-5], close[1,2] = **16** | settle[2], scan[1,2,3], embody[2-5], close[1,2] = **14** | settle[3], scan[2,3,4], embody[3,4,5], close[1] = **12** |
| 15m | settle[1,2,3], scan[1-7], embody[1-9], close[1,2,3] = **26** | settle[2,3], scan[1-6], embody[2-8], close[1,2,3] = **22** | settle[3,4], scan[2-6], embody[3-8], close[1,2] = **19** |
| 20m | settle[1-4], scan[1-7], embody[1-9]+R, close[1,2,3] = **27** | settle[2,3,4], scan[1-7], embody[1-9], close[1,2,3] = **26** | settle[2,3,4], scan[1-7], embody[1-9], close[1,2,3] = **26** |

**Rest (new)**

| dose | beginner | intermediate | advanced |
|---|---|---|---|
| 5m | settle 62s[1], being 176s[1,2,3], close 62s[1] = **8** | settle[2], being[2,3], close[1] = **7** | settle[-], being[3,4], close[1] = **5** |
| 10m | settle[1,2], being[1-5], close[1,2] = **14** | settle[2], being[2-5], close[1] = **11** | settle[3], being[3,4,5], close[1] = **9** |
| 20m | settle[1-4], being[1,2,3,4,5]+R, free[1,2], close[1,2,3] = **24** | settle[2-5], being[1-9], free[1], close[1,2,3] = **26** | settle[2,3,4], being[1-9], free[2], close[1,2,3] = **26** |

**Mindfulness · 10m**: beginner settle[1,2] breath[1] note[1-9] close[1,2] = **18**; intermediate **14**; advanced **12**.
**Open · 20m**: beginner settle[1-4] breath[1,2] watch[1-4] open[1,2,3,4,5,6,8]+2R close[1,2,3] = **27**, and see 6c; intermediate reaches all 9 open rungs; advanced all 9 with no re-anchors.
**Heart · 20m**: beginner reaches heart[1,2,3,4,5,7,8,9] (rung 6 is TOP) plus bliss[1-4]; advanced reaches all 9 plus bliss[2,3,4].
**Insight · 15m intermediate**: settle[2,3] breath[3,4] watch[2,3,4] look[1,2,3,4] close[1,2,3] = **19** with the whole look ladder landing.

### 6c. Overflow and starvation, flagged

| block | state | evidence | action |
|---|---|---|---|
| **open** | **STARVES at beginner, every dose ≥ 15m** | beginner window is 7 of 9 (rungs 7 and 9 are TOP). At 20m the slice is 610s and the window is spent by 337s, leaving 273s of tail and 2 re-anchors. | Accept the tail as designed silence, or write 2 more intermediate rungs for `open`. Recommend accepting; `open` is the one block where long silence is the technique. |
| **look** | **STARVES at beginner** | beginner window is 2 of 5. At 20m: 325s tail, 3 re-anchors. | Fixed by `minLevel:"intermediate"` (4d). No copy owed. |
| **being** | **STARVES at beginner** | beginner window is 6 of 9 (rungs 6, 7, 9 are TOP). At 20m the window ends with 180s spare. | Same as `open`: silence is the point in a resting block. Flag only. |
| **breath** | **OVERFLOWS below intermediate at 20m** is the wrong reading; it **fits exactly**. 12 rungs, 277s of speech, a 555s slice at 20m. | Healthy. The largest pool and the right one to be largest. |
| **count** | **thin** | 4 rungs, 87s. At any dose above 10m the count block is entry plus 3 rungs and then tail. | Fine at weight 1.0. Do not raise its weight. |
| **close** | **thin but correct** | 3 rungs, 66.5s, and its `arc` multiplier is 0.50. At 20m it plays all three in 153s with a 42s tail. | Healthy. |
| **settle** | **thin at advanced** | advanced window is 3 of 5, and at 5m the first advanced-window rung (rung 3, 77 words, 28s) does not fit the 65s slice after the 19.7s entry and 10.4s gap. The block plays entry only. | Correct behaviour ("a returning daily user gets less instruction"), but verify with the founder that entry-only reads as intended and not as broken. |
| **feel, bliss** | **conditional entries** | both entries carry an if-clause with no else; at 2m and at advanced 5m they can be the only line of the block. | Already flagged by the plain reader in ROUND.md, still open. The MICRO shape (4d) removes them from 2m lanes, which closes half of it. |
| **MED_RETURN** | **WRONG for 4 of the 16 blocks** | all shipped cues (app.js:15451) say come back to the breath. `being`, `open`, `free` and `look` have no breath object. | Data edit: add a non-breath return set and select it by `def.objectless`. Already named in ROUND.md as "one data edit fixes it". |

### 6d. Total spoken-line budget, the headline number

At reference length a sit affords roughly:

| dose | lines it can speak (balanced) |
|---|---|
| 2 min | 3 to 4 |
| 5 min | 6 to 8 |
| 10 min | 12 to 18 |
| 15 min | 19 to 27 |
| 20 min | 24 to 30 |

The shipped engine at `PK.speechEst = 4.2` believes a 10-minute sit affords about 55. That gap, six times too many lines, is the whole bug, and every symptom in ROUND.md (the `v_open` re-speak, the 162 seconds of speech in a 50 second slot, the MED_RETURN spam) is downstream of it.

---

## THE BUILD ORDER

1. `speechOf()` + the three call sites (19364, 19373, 19306) + the look-ahead guard at 19369. Nothing plays correctly before this.
2. `medAllocate()` reserve-then-distribute, replacing 19361.
3. `medGap()` + `MED_SIL`, replacing `pauseFor("absorb", depth)` at 19372 and `pauseFor("cue", depth)` at 19361.
4. Pool data shape: `{lv, top, dup, safe, t}` per rung, `entryStacked` per block. Retire `MED_EXTRA.arrival` in the same commit (ROUND.md BUG 2).
5. `medLevel()` / `medFamiliarity()` / `medWindow()`, and the picker gains a level row plus 15 and 20 minute doses at app.js:15508.
6. The ledger `L` threaded through `composeStackSegs` and `composeMeditationSegs`, with the entry-variant table from 3b.
7. `MED_SESSIONS` rewrite (4b), then `MED_RETURN` objectless set, then `DEV.wps()` and the `medWps` learner.
8. `DEV.compose` and the dev audit at 21886 / 21895 moved to `speechOf`, or the audit reports a false pass on all of it.