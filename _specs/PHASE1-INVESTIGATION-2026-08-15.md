# PHASE 1 INVESTIGATION — root causes, anchors, costs (2026-08-15)
Six parallel read-only investigations run against the live code + preview. This is EVIDENCE, not a plan;
the plan lives in `MASTER-GAMEPLAN-2026-07.md` REVISION 2026-08-15. Anchors are function names + @SEC sections
(line numbers rot). Nothing here was verified for FEEL — that is always the phone.

---

## AREA 5 — the meditation story-bar (timelinePlayer story bars + composeStackSegs section "zoom")

**VERDICT:** Not a pure comprehension problem: the meditation "expansion" is a real mid-run swap of the whole bar row (the act bars are hidden and a second, differently-shaped row is shown), and it carries two genuine defects — the expansion can die permanently at a stack edge, and the transport's time readout silently re-scopes from tool to section. Root cause is one optional feature, the PLAYER ZOOM added 2026-07-15, living entirely inside `timelinePlayer` and switched on by `acts[ai]._isMed` set in `composeStackSegs`.
### What exists

THE NORMAL STACK BAR (works, David is right that it's correct): `runStack` → `runStackCarousel` → `composeStackSegs(list)` (tools/player region, between @SEC:RENDER and @SEC:I18N-DICT) returns `{segs, acts}`. One entry in `acts[]` per TOP-LEVEL STEP; every segment is tagged `seg._act = <index into acts>`. `timelinePlayer(opts)` with `opts.acts` builds ONE `.gp-story` row (`storyWrap`) with `acts.length` flex:1 bars + an icon under each (`actFills[]`, `actLabels[]`), plus one 100vw page per act in `.gp-track` (`pages[]`, track width = `acts.length * 100`vw). On boot `startFrom`/the segs-timing pass derives `acts[i]._start/_end` from the tagged segs; `paintNow(e)` fills `actFills[i]` from those windows and, on an act change, calls `onActEnter(i)` which slides the track, re-tints the orb/transport and brightens icons up to i. The per-cue pip row (`mapWrap`/`mapPips`) is force-hidden whenever acts exist. Bar count is FIXED for the whole run. That is the Instagram-story behaviour.

WHAT CHANGES FOR A MULTI-PART MEDITATION: in `composeStackSegs`, a step with `id === "meditate" | "medit"` is split into sections — `t.med` if present, otherwise the auto arc `[settle|breath, aware, rest]` (3 sections). It writes `acts[ai]._sections = secMeta` and `acts[ai]._isMed = secMeta.length > 1`, tags the first cue of each section with `_secIdx` (and `_sectionStart` for sections 2..N). It does NOT create extra acts — meditation is still ONE act, ONE bar, ONE page. The expansion is purely a second bar row inside the player: `medAct(ai)` → `onActEnter` calls `enterZoom(ai)` → `buildSecBars(ai)` fills a SECOND `.gp-story` element (`secWrap`, created hidden at player build) with (a) an 11px fixed-width stub for every OTHER act and (b) one flex:1 bar per section — then `storyWrap.style.display = "none"` and `secWrap.style.display = "flex"`. So the row is not nested and not re-rendered in place: it is swapped for a different row with a different child count and different widths. While zoomed, `paintNow` scopes `fill`/`tCur`/`tTot` to the current SECTION (via `acts[ai]._secList`), `_clampAct` clamps ±15s and scrub-drag to the section, `navBy` steps sections before acts, and the scrub's section ticks (`gp-ticks`, built from `_secTimes` in `onActEnter`) are explicitly HIDDEN. `exitZoom()` restores the act row.

LIVE OBSERVATION (preview, v1301): launching the "Meditate" toolbox stack produced a player with `class="gp-ov gp-bars"`, 2 pages, and exactly two `.gp-story` rows — row 0 visible with 2 bars (135px each, icons `ti-lungs` lit / `ti-moon` dim) and row 1 (`secWrap`) `display:none` with 0 children. That confirms the two-row architecture. I did NOT observe the swap itself: reaching the meditation act needs minutes of real clip playback and the preview does not schedule the audio timeline honestly (the run self-terminated). The swap is code-certain, not device-confirmed.

SCOPE — who actually expands: solo meditation (`composeMeditationSegs`, called from the meditation editor / quick paths) makes each block its OWN act, so it never sets `_sections` and never zooms — one bar per section already. The Full Stack (`runFullStack`) passes `med:[{k:"aware"}]` = 1 section, so it does not zoom either. What DOES zoom is every stack step that is a plain `meditate` with no explicit `med` (auto 3 sections): all three `STACK_PACKS` tracks, the `TBX_ITEMS` bands that contain `"meditate"`, and a single "Meditate" launched on its own (`runStack([{k:"meditate",d:...}])` from the home tool strip / cockpit tool buttons), which becomes a ONE-act stack that is zoomed from frame 0.
### Findings
- **[breaks-app] The bar row is swapped, not expanded: child count and every width change mid-run**  
  `enterZoom` (timelinePlayer) hides `storyWrap` (acts.length flex bars) and shows `secWrap`, whose children are (acts.length - 1) fixed 11px stubs plus sections.length flex bars. For a 5-step pack that is 5 equal bars becoming 4 stubs + 3 bars at the instant the meditation starts. Nothing animates the transition; the progress the user was reading collapses into 11px chips. This is the thing David is describing, and it is a genuine visual discontinuity, not only a comprehension issue.  
  *anchor:* `timelinePlayer → enterZoom / buildSecBars / exitZoom (tools+player region, after @SEC:RENDER); trigger set in composeStackSegs (acts[ai]._isMed)`
- **[breaks-app] Zoom exits PERMANENTLY when a section step hits a stack edge**  
  `navBy(dir)` runs `exitZoom()` as soon as the next section index falls outside `_secList`, and only THEN evaluates the act edge: `if (j >= acts.length) { if (opts.edgeNextFinish) finish(false); return; }` and `if (j < 0) { if (opts.onEdgePrev) {...} return; }`. Normal stacks set neither `edgeNextFinish` nor `onEdgePrev` (only runFirstStack does), so it returns with zoom already off while still inside the meditation act. Because `_prevAct === curAct`, `onActEnter` never re-fires, so the section bars never come back and the scrub silently reverts to act scope for the rest of the sit. Worst case is the common one: a lone 'Meditate' is a ONE-act stack, so BOTH edges are stack edges — one tap on the left or right third at the first/last section kills the section UI for the whole session.  
  *anchor:* `timelinePlayer → navBy (STORY-NAV block, the `if (zoom) { ... exitZoom(); }` line)`
- **[confusing] The remaining-time readout re-scopes under the user**  
  With acts, `paintNow` computes `fill` / `tCur` / `tTot` over the current ACT window; when `zoom` is true it recomputes them over the current SECTION window instead. So the '-2:41' the user was reading jumps to '-0:54' the moment meditation starts (and jumps back if defect 2 fires). `_clampAct` and the scrub `move()` handler change range the same way. Same beat, the section ticks that would have explained it are switched off: onActEnter does `if (medAct(ai)) { enterZoom(ai); ...; if (ticks) ticks.style.display = 'none'; }`.  
  *anchor:* `timelinePlayer → paintNow (the `if (zoom && _ci === curAct)` branch), _clampAct, onActEnter`
- **[polish] Latent mis-index: section bars are drawn from _sections but filled/navigated by position in _secList**  
  `buildSecBars` draws one bar per entry of `acts[ai]._sections`. `paintNow`'s zoom loop and `gotoSec` index `secFills[]` by position in `acts[ai]._secList` and ignore each entry's own `.idx`. The two agree only while every section emits at least one segment carrying `_secIdx` — that segment is written inside `while (tt < dur - 1)` in composeStackSegs, so a section whose duration slice rounds to <= 1s emits nothing and every later section then fills and lights the WRONG bar. Not reproducible with today's durations (3 sections over >= 60s), so this is latent, not live — but it is the exact class of bug the collapse deletes.  
  *anchor:* `timelinePlayer → buildSecBars + paintNow zoom fill loop + gotoSec; producer: composeStackSegs (`if (first) seg2._secIdx = _sx`)`
- **[confusing] tbxScaleTrack silently DROPS a step's `med` sections**  
  `tbxScaleTrack` returns `{ k: s.k, d: ... }` only. `tbxLaunch` runs every toolbox stack through it, so per-step meditation sections chosen in the Session Editor (carried by tbxStep/sedTrack as `med`) never reach composeStackSegs, which then substitutes its auto 3-section arc. This changes which content pools actually speak, not just the bars, and it is why nearly every stack meditation is a 3-section (therefore expanding) meditation. Independent of the bar fix; worth naming so the collapse is not mistaken for the cause.  
  *anchor:* `tbxScaleTrack (@SEC:TOOLBOX2), consumed by tbxLaunch; compare tbxStep which DOES carry med`

### Fix plan

SIZE: S. One region (`timelinePlayer`, tools+player stretch between @SEC:RENDER and @SEC:I18N-DICT) plus one optional line in `composeStackSegs`. It is small precisely because meditation is ALREADY one act, one bar, one page — the expansion is a bolted-on second bar row, so collapsing it renumbers nothing.

1. Kill the zoom at its single switch. In `onActEnter`, replace `if (medAct(ai)) { enterZoom(ai); curSec = curSecIdx(e2); if (ticks) ticks.style.display = 'none'; } else exitZoom();` with an unconditional `exitZoom()` and let the tick block above it stand — the scrub ticks then RENDER for the meditation act instead of being hidden. That one edit alone gives David the behaviour he asked for.
2. Remove the now-dead zoom machinery in the same pass so no one re-enables it by accident: `secWrap` creation, `buildSecBars`, `enterZoom`/`exitZoom`, `secFills`/`secIcons`, the `if (zoom …)` branch in `paintNow`, the zoom branches in `_clampAct` and the scrub `move()` handler, `gotoSec`, `curSecIdx`, and the `if (zoom) {…}` prefix in `navBy`. Deleting the `navBy` prefix is what fixes the permanent-exit defect (finding 2) by construction. `medAct`/`secListOf`/`_secList`/`_secIdx` become unused; `_secTimes`/`_sectionStart` must STAY (they feed the ticks). Keep `acts[ai]._sections` on the act — it is the data the secondary affordance reads.
3. SECONDARY AFFORDANCE — use what is already on the surface, in this order:
   (a) `gp-ticks` on the transport scrub. Already built (`onActEnter` reads `acts[ai]._secTimes`), already styled in index.html as dark cell-gaps cutting through the fill ("battery cells"), already correct (the si===0 boundary is deliberately skipped so there is no tick at 0), and currently suppressed by exactly the line step 1 removes. This is literally David's "split that up visually in the timeline below" — zero new UI.
   (b) Hold the section NAME under the cue line. In composeStackSegs the meditation cue is built as `medSeg(ln, cad, first ? def.name : "")`, so the section name flashes on its first cue and then blanks. Passing `def.name` on every cue makes `.bw-sub` name the current part for its whole duration. Voice is unaffected — medSeg speaks `text` (= the line), `sub` is display-only.
   Do NOT add a third row, a nested bar, or per-section coloring of the single bar in this pass.
4. Behaviour deltas to state plainly in the ship note: ±15s and scrub-drag now range over the WHOLE meditation act instead of one section; the transport's remaining-time now reads "time left in this tool" for the entire meditation (consistent with every other step); a left/right third tap inside meditation leaves the tool rather than stepping a section (see open question 1).

REGRESSION-CONTRACT / GATE RISK: none to the four timeline items — this is inside the player overlay and touches no timeline listener, no day nav, no block model. No SCHEMA/MIG implication. `DEV.designAudit` is home-only and is not affected. Ratchet: the edits are deletions inside an existing function, no new `innerHTML` wipe (`buildSecBars` used targeted removeChild anyway, and it goes away). Verify: (i) `bash _dev/preship.sh` syntax + ratchets, (ii) boot clean with zero console errors, (iii) launch a stack containing meditate and assert in the DOM that `#breatheOv .gp-story` count is 1 and its child count equals acts.length and never changes for the run, and that `.gp-ticks` has (sections-1) children while the meditation act is current. Scroll/gesture FEEL of the side-tap nav stays DEVICE-UNTESTED — the preview does not schedule this player's audio timeline honestly (my attempt to drive to the meditation act died mid-run with no console error).

COUPLING AUDIT — where a bar index indexes something else (the thing that would make collapsing risky):
- SAFE, and this is the key fact: `actFills[i]`, `actLabels[i]`, `pages[i]`, `actResume[i]` all index `acts[]`, and `seg._act` is an index INTO `acts` fixed at compose time. Collapsing the SECTION row does not change `acts.length`, so no segment is retagged and `.gp-track`'s `acts.length * 100`vw geometry is untouched.
- THE ONE TRUE BAR→SEGMENT COUPLING: `mapPips[mi]` ↔ `opts.segments[mi]` in `paintMap` (one pip per SEGMENT, index-identical). It is force-hidden whenever `acts` or `actBars` exist, so it is out of play for stacks — but any future "one bar per segment" idea lands exactly here.
- `abFills[qb]` ↔ `opts.actBars[qb]` via `seg._ab` is a second, parallel bar system (the F5 path). NO caller passes `opts.actBars` today, and its producers `medBars`/`medComposeSegments` are unreferenced by any live player call. Do not build the fix on it and do not delete it in the same commit.
- `secFills[]` ↔ `_secList[]` positional coupling (finding 4) disappears with the collapse.
- OUT OF SCOPE, DO NOT TOUCH: `buildBars`/`setStep`/`fillBar`/`_curStep` inside `firstDayStack` are a DIFFERENT bar row on the first-day overlay (7 intro beats / 3 outro beats); `_curStep` there is a screen index, not a segment index.

### Open questions for David
- Inside a collapsed meditation, should a left/right third tap step to the next SECTION (staying inside the tool, bar keeps filling) or jump to the next TOOL like every other step — one bar, one unit?
- Secondary affordance: section cell-gaps on the transport scrub alone (already built, zero new UI), or cell-gaps PLUS the section name held under the cue line for that whole section?
- Should the meditation's single bar stay one flat color, or shade per section as it fills so the parts are legible in the bar itself?
- Should tbxScaleTrack be fixed to carry `med` (so the Session Editor's chosen meditation shape actually plays) in this pass, or is that its own ticket?

---

## AREA 4 — voice switching (Dave ↔ Millie / izo ↔ Aida)

**VERDICT:** The TTS bank layer is NOT broken — it resolves the voice live and correctly on every switch (verified in-browser: tapping Millie immediately fetched assets/voice/millie/4c2b04dd.mp3). The break is one link downstream: a running session's clips are decoded ONCE into `segs[].buf` inside `timelinePlayer`'s `layout()`, and nothing re-decodes them on a voice change — so every remaining line of that session keeps the old voice until the session is closed and reopened. Compounding it, the chip's confirmation preview is suppressed whenever a player overlay is in the DOM (including a MINIMIZED one), so the tap produces no sound at all and reads as "it just doesn't even work".
### What exists

THE CHAIN, tap → audio:

1. `openVolumePanel()` — the Sound panel that holds the Dave/Millie (and izo/Aida) chips. Three doors into it: the settings room (`room("ti-volume", …, function(){ openVolumePanel(); })`), the cockpit gear `#tfGear` handler (@SEC:COCKPIT), and the gear INSIDE a running session (`.gp-cog` in `timelinePlayer`, whose handler is `if (playing) pause(); openVolumePanel();`).
2. Chip `onclick` (inside `openVolumePanel`): `S.voicePick = "millie"; save(); TTS.unlock(); TTS.setVoice("millie"); TTS.stop(); gvPaint();` then a 300ms-delayed preview `TTS.speak("Settle in", …)` — but ONLY if `document.querySelector("#breatheOv, .gp-ov, #playerOv")` is null.
3. `TTS.setVoice()` (@SEC:TTS) → sets `VOICE_PICK`, writes `S.voicePick`, `loadBank(curBank())`.
4. Resolution is LIVE on every play: `curBank()` → `bankUsable()` → `vpath()` (file path) and `ckey()` (cache namespace `bank + ":" + hash`). This layer is correct and was verified working.
5. Playback: `TTS.speak()` / `TTS.getBuffer()` / `TTS.getBufferSync()` / `scheduleClip*()` all call `ckey`/`vpath` at call time — correct.
6. THE SESSION does not go through step 5 at play time. `timelinePlayer(opts)` resolves every clip ONCE at open: `var syncBufs = opts.autostart ? segs.map(sg => TTS.getBufferSync(sg.text)) : null;` else `Promise.all(segs.map(sg => TTS.getBuffer(sg.text))).then(layout)`. Inside `layout(bufs, autoplay)`: `segs.forEach(function (sg, i) { sg.buf = bufs[i]; … })`. Thereafter `startFrom(sec)`, `seek()`, `gotoAct()`, `bPlay.onclick` and the mini-dock play button all create `AudioBufferSource`s from those same `sg.buf` objects. There is no re-decode hook, no voice-change event, no generation counter.

CONTRAST that explains why it feels random: `beatRunner()` speaks per beat via `say()` → `TTS.speak()` → live bank, so the Stutz-style tools DO honour a mid-session switch. `breathwork()` and `tapping()` pre-schedule the whole run with `TTS.scheduleClipAsync(...)` up front, so they behave like `timelinePlayer` (stale for the whole session).

Evidence gathered in the preview (localhost:3000, v1301):
- Boot fetches `manifest.json`, `dave/manifest.json`, `millie/manifest.json` — all 200. Manifest key sets are byte-identical across root/dave/millie (500 keys each, every mp3 present on disk; izo/aida 546 each).
- Fresh load, tap Millie outside a session: `S.voicePick === "millie"`, fetch `assets/voice/millie/4c2b04dd.mp3`, dbg `♪ PLAY ctx:running` → the switch works.
- Launched `DEV.tool('meditate')` (a `timelinePlayer` session) with pick=dave: it fetched `assets/voice/dave/*.mp3`. Then opened the player's `.gp-cog` → Sound panel → tapped Millie: `S.voicePick` flipped to `"millie"`, and ZERO voice fetches followed. No millie clip was ever loaded; the dbg strip stayed empty (preview suppressed by the `sessionLive` guard).
### Findings
- **[breaks-app] THE STALE LINK: timelinePlayer caches decoded buffers in segs[].buf and never re-decodes on a voice change**  
  `layout(bufs, autoplay)` inside `timelinePlayer` does `sg.buf = bufs[i]` once, filled from `TTS.getBufferSync`/`TTS.getBuffer` at session open. `startFrom(sec)` (and `seek`, `gotoAct`, `gotoSec`, the play button, the mini-dock button) re-schedule `ctx.createBufferSource()` from those same buffers. `TTS.setVoice()` changes `curBank()` but the player never consults it again, and `TTS.stop()` (called by the chip) only clears TTS's own `curSrc` — it does not touch the player's `sources[]` array. Result: the entire remaining session plays the old voice. Closing and reopening the session rebuilds `segs[].buf` through the now-current bank — exactly David's workaround. Same class in `breathwork()` and `tapping()`, which schedule every clip up front with `TTS.scheduleClipAsync`.  
  *anchor:* `timelinePlayer → inner layout() / startFrom() (@SEC after openVolumePanel, "COMPOSED TIMELINE PLAYER" block); same class in breathwork() and tapping()`
- **[breaks-app] The voice chip's confirmation preview is dead whenever any player overlay exists — including a MINIMIZED one**  
  Both chip handlers guard the sample with `var sessionLive = document.querySelector("#breatheOv, .gp-ov, #playerOv"); if (!sessionLive) { … TTS.speak("Settle in") … }`. `timelinePlayer`'s `minimize()` only does `ov.classList.add("gp-min")` — the overlay (id `breatheOv`, class `gp-ov`) stays in the DOM forever while docked. So after a swipe-down minimize, or with the player merely paused behind the panel, tapping Dave/Millie plays NOTHING. Verified: dbg strip stayed empty on the in-session tap. The inline comment claims "the switch still applies to its next line" — that comment is FALSE for timelinePlayer (see finding 1), so the user gets neither a preview nor a changed session.  
  *anchor:* `openVolumePanel() chip onclick (sessionLive guard) + timelinePlayer → minimize()`
- **[confusing] The Dave/Millie chips never set S.voice = true, so picking a voice after "No voice" leaves every session silent**  
  `sedSetVoiceKey(k)` in the Session Editor sets `S.voice = false` when the user picks "No voice", and sets `S.voice = true` when they pick a real voice. The Sound panel's chips only write `S.voicePick`. If David ever tapped "No voice" in a session editor, then later picked Millie in the Sound panel: the chip highlights, the preview DOES play (TTS.speak bypasses `voiceOn()`), but `say()` → `voiceOn()` → `S.voice !== false` is false, so every guided line stays silent. Reads as "switching the voice broke the voice". The panel's own Guide's-voice toggle (`vxRow`) is the only thing that would reveal it.  
  *anchor:* `openVolumePanel() chip onclick vs sedSetVoiceKey() (@SEC:EDITOR)`
- **[polish] RULED OUT: the clip cache is NOT keyed by text-hash only**  
  `bufCache` is keyed by `ckey(key)` = `bank + ":" + hash` whenever `bankUsable()` is true, and `vhash()` runs the text through `vline()` (the RU dict, incl. the ru_f female variants and the half-by-half composite resolve) BEFORE hashing, so RU and EN produce different hashes. Suspect (1) is not the cause. Residual landmine worth naming: `bankUsable()` for EN is deliberately OPTIMISTIC — `banks[b] ? !!banks[b][key] : !!(vset && vset[key])` — i.e. before a bank manifest lands it assumes that bank has every root key. Today that is harmless (root/dave/millie key sets are identical, verified), but if millie ever lags dave the optimistic path would fetch a missing bank file, hit the silent `.catch`, and cache nothing while still namespacing under the bank. izo/aida are strict (own manifest only), which is correct for the RU root-Dmitry fallback. Also note aida alone version-busts its mp3 URLs via `cacheBust()`.  
  *anchor:* `TTS bankUsable() / ckey() / vhash() / vline() (@SEC:TTS)`
- **[polish] RULED OUT: manifest-computed-once, applyVoice-never-called, and the iOS SpeechSynthesis voice list**  
  (2) `loadManifest()` runs once but `loadBank(name)` is per-bank and `applyVoice()` preloads BOTH EN banks at boot and again after `load()` in `init()` — verified both manifests return 200 at boot. (3) `TTS.setVoice()` IS called by both chip handlers and by `sedSetVoiceKey`; and nothing actually depends on `applyVoice` since bank resolution is live in `curBank()`. (5) `speechSynthesis` is irrelevant to content audio — per David's rule the app never falls back to browser TTS; every guided line is a decoded mp3 buffer, and `speakSynth`/`resolve()` are dead weight on this path.  
  *anchor:* `TTS initVoices() / applyVoice() / loadBank() / loadManifest() (@SEC:TTS)`

### Fix plan

SMALL — not structural. Three edits, all inside @SEC:TTS and the timelinePlayer region. Touches ZERO regression-contract items (no timeline, no carousel, no gestures) and ZERO designAudit gates (nothing paints).

1. (S) @SEC:TTS — add a voice generation counter. `var voiceGen = 0;` bumped inside `setVoice()` and `setRuVoice()` (only when the name actually changes); expose `voiceGen: function () { return voiceGen; }` on the returned TTS object. Optionally also dispatch `window.dispatchEvent(new Event("alter:voicechange"))` there so surfaces can subscribe without polling.

2. (M) `timelinePlayer` — re-voice a live session. Capture `var myVoiceGen = TTS.voiceGen();` at `layout()`. Add one function `revoice()`: `var at = curElapsed(); var wasPlaying = playing; stopSources(); ready = false;` → `Promise.all(segs.map(sg => sg.text ? TTS.getBuffer(sg.text) : Promise.resolve(null))).then(function (bufs) { layout(bufs, false); myVoiceGen = TTS.voiceGen(); if (wasPlaying) startFrom(Math.min(at, total)); else { offset = Math.min(at, total); paintNow(offset); } });` Call it from a `window.addEventListener("alter:voicechange", …)` registered in the player and removed in `finish()`. IMPORTANT: `layout()` already recomputes `sg.start`/`sg.dur`/`total`/`acts[]._start`/`_secList`/tick marks, so differing clip durations between banks are handled — but the elapsed position must be re-clamped to the NEW `total` (that is the one real trap; different banks read the same line at different lengths, so the timeline shifts). `stopSources()` before re-layout is mandatory or the old voice double-plays.
   Same one-liner subscription for `breathwork()` and `tapping()`: on voice change, clear `schedSrcs` and re-run their scheduling loop from the current beat — or, if David prefers minimum risk there, leave them and say plainly that breath/tapping switch at the next session.

3. (S) `openVolumePanel()` chip handlers — two fixes in the same lines: (a) set `S.voice = true;` alongside `S.voicePick`/`S.ruVoice` so a prior "No voice" cannot swallow the switch; (b) stop suppressing the preview for a minimized/paused player — change the guard to `document.querySelector("#breatheOv:not(.gp-min), .gp-ov:not(.gp-min), #playerOv")`, or drop the guard entirely once fix 2 lands (the player is paused by the `.gp-cog` handler anyway, and `TTS.stop()` already precedes the preview). Also fix the now-false inline comment "the switch still applies to its next line".

Verification: preview can prove this fully — it is a decode/fetch decision, not a gesture. Repeat my probe: launch a `timelinePlayer` session with pick=dave, confirm `assets/voice/dave/*.mp3` fetches, switch to Millie via `.gp-cog`, and assert that `assets/voice/millie/*.mp3` fetches appear and the session resumes. Audio TIMBRE on the device is still David's call, but "the right files load and the session re-lays out" is preview-provable. Label the on-device feel of the re-voice gap DEVICE-UNTESTED.

### Open questions for David
- Mid-session switch: should the CURRENT session re-voice from where you are (a ~0.5-2s gap while it re-decodes, and the remaining timeline shifts because Millie reads lines at a different length), or finish in the old voice and switch cleanly from the next session?
- Where are you actually switching — the Sound panel from the cockpit gear (outside a session, which works today), or the gear inside a running/minimized session (which is the broken one)? If it is the cockpit gear with a minimized player docked, the fix is the one-line preview guard, not the player rework.

---

## AREA 1 — POPUPS / interruption surfaces

**VERDICT:** Not one broken popup — there is no popup SYSTEM at all: 19 independent overlay families, 5 incompatible dismiss idioms, an unmanaged z-index ladder where four families paint BEHIND the journey and home surfaces (verified live), and no queue, no de-dupe, no back/Escape handler anywhere in 19,409 lines. The single root cause is that every popup hand-rolls its own `document.body.appendChild` + its own inline styles + its own dismiss.
### What exists

FULL INVENTORY (function → @SEC section → trigger / dismiss / stacking / state).

=== A. FIRES UNPROMPTED (timer or tick — David's "random pop ups") ===
1. `checkMoments(trigger)` — ORGAN D block (just above `gaugeOpen`, below @SEC:PICKER). TRIGGER: `setTimeout(...,1200)` chained off `gaugeOpen`, which itself fires 470ms after the start-screen Continue tap (@SEC:CAROUSEL, in the `ssEnter` else-branch). So ~1.7s after entering the app a card can appear over the just-painted home. Fires the FIRST match of: `offRamp()` (any drift-domain log today) or `tranquilityOffer()` (within ~45min of estimated bedtime, `preSleepWindow()`). Gate: `canNudge()` = 1/logical-day + mutes + wide-day. WRITES: `markNudge()` → `S.nudge.lastK`.
2. `showAppetiteInvite(inv)` — @SEC:JOURNEY-ENGINE. TRIGGER: `setTimeout(...,1400)` at the tail of `drawJourney`. Auto-removes at 9000ms.
3. `notePostpone(b)` → `motivationDial(ctx)` — ORGAN D. TRIGGER: `setTimeout(...,300)` fired from the timeline drag-commit (in @SEC:TIMELINE's block-drag handler) and from the editor's `＋nudge`. This is the one that can land right on top of a finger that just finished a gesture.
4. Master 1s tick (@SEC:BOOT, the `setInterval(...,1000)` marked `@CONTRACT — THE MASTER 1s TICK`): `toast("⏱ … done · tap to claim it.")` when a timer commitment completes.
5. `_globalErrToast` (@SEC:ERRNET): any `window.error` / `unhandledrejection` → tap-to-refresh toast, 6s rate-limited.
6. `maybeWelcomeBack()` → `welcomeBackSheet(gap)` (@SEC:CAROUSEL region) — 470ms after Continue, gap ≥14 days. Full-screen `.ob-ov` starfield.
7. `celebrate()` / `celebrateGated()` — `.cele-ov` z95, `pointer-events:none`, auto-out at 1500ms. Harmless; not a popup in practice.
8. `triggerTLM(ctx)` — `#tlmChip`, a chip not an overlay, ≤2/day. Fine.

=== B. THE 19 OVERLAY FAMILIES (z-index / owner / dismiss) ===
`#sheet` z95 — the ONE modal; `openSheet`/`closeSheet` (@SEC:BOOT wiring). Shared `#sheetBody` wiped by 19 different fillers (`settingsSheet`, `brainSheet`, `journalSheet`, …). No stack, no back. Dismiss: tap-above, ✕, `.shandle`, swipe-down.
`#breatheOv` z98 — the tool-player shell. **A DUPLICATE ID set at ~18 separate `document.createElement` sites** (breathwork, relaxMoment, selfHypnosis, guided player `gp-ov`, resetTimer, recallGame, etc.). Two open at once = two nodes, one id; `getElementById("breatheOv")` (used by `sfx()` and the TTS gate at @SEC:TTS) then reads the wrong one.
`.ob-ov` z90 — @SEC:ONBOARD's overlay, **re-used by 18 non-onboarding popups** (spaceCheckOnce, welcomeBackSheet, firstCommit, lessons…). No backdrop dismiss.
`.hs-ov` — **inline z-index:9999**, above everything but `#rotGuard`. 8 sites, and it has **zero CSS in index.html**: every card re-declares the same ~200-char `cssText`. Owners: `mlCard()` (offRamp / comebackLadder / tranquilityOffer / motivationDial / mlRoute / logUrge), `showAppetiteInvite`, `heroSandwich`, `catalystCard`, `fundRxCard`, `chapterSheet`, `preSurfaceCheck` neighbours.
`.bento-ov` z95 (bentoPicker + 6 more) · `.dur-ov` z96 (`durationSheet`/`pickSheet`/`numSheet`) · `.ws-ov` z96 · `.vol-ov` z120 · `.rc-ov` z125 (`langPicker`) · `.mint-ov` z130 · `.cele-ov` z95 · `.radial` (dayToolsMenu) · `#feature`/`featBackdrop` (legacy, `closeFeature` only toggles `body.overworld`).
`.goal-ov` **z71** — `goalsSheet`, `presetsSheet`, `stackDetail`, `binderSheet`.
`.nb-ov` **z71** — `notebookSheet`, `wakeBedSheet`. THIS is CLAUDE.md's "second menu system".
`.mind-ov` **z71** — `mindmapSheet`.
`.pc-ov` **z80**.
`.sed-ov` z98 (@SEC:EDITOR) and `.pk-ov` z98 (@SEC:PICKER) — the two design-ported surfaces. Correctly guarded (both in `PANE_GUARD` @SEC:CAROUSEL and in `axisArmed` @SEC:WORLD-MOTION). **These are healthy; leave them alone.**

=== C. THE TWO CLASHING MENU SYSTEMS (CLAUDE.md's note, now resolvable) ===
`#notebookBtn` is `display:none !important` (index.html body-class block). It is the ONLY caller of `notebookSheet` (@SEC:BOOT: `var nbtn = el("notebookBtn"); if (nbtn) nbtn.onclick = notebookSheet; // the single menu door`). `heroMenu()` — the only other door to `mindmapSheet` — has **no caller at all**. So the entire notebook surface (`nb-ov` + `mind-ov`) is unreachable dead weight occupying a broken z-band.

=== D. WHAT THERE IS NO OF ===
- No `popstate`, no `history.pushState`, no `Escape`/keydown handler — grep returns zero. No global back.
- No queue, no manager, no de-dupe. Only `showAppetiteInvite` (id `appetite-inv`) and `chapterSheet` (id `jp-csheet`) remove a prior instance.
- `toast()` (next to `overTrash`) creates a NEW node per call at the identical `position:fixed; left:50%; bottom:90px`. 128 call sites. Two in the same 2.6s window overlap pixel-on-pixel.
- `#playerOv` is checked in two guards (the voice-preview `sessionLive` checks) but is **never created anywhere** — a dead selector making those guards read stronger than they are.
### Findings
- **[breaks-app] Four overlay families paint BEHIND the journey and home — an invisible modal that kills pane-swipe**  
  `.goal-ov`/`.nb-ov`/`.mind-ov` are z71 and `.pc-ov` is z80, while `#journeyPath` is z75 and `#trackerFull` is z90. VERIFIED LIVE at 402x874 with the journey open: I injected a probe `.goal-ov` and `document.elementFromPoint` returned `jp-node mystery` — the overlay was fully occluded. Meanwhile `.goal-ov, .mind-ov, .nb-ov` ARE in `initPaneCarousel`'s open-overlay bail list (@SEC:CAROUSEL), so opening one while the journey or home is up leaves the user with: nothing visible, horizontal pane swipe dead, and no dismiss target. That is the exact shape of "sometimes break the app". (`closeJourney` even keeps `#journeyPath` at z80 for 300ms during its `jp-sliding` exit, so a sheet opened on the way out flashes behind it.)  
  *anchor:* `goalsSheet / presetsSheet / binderSheet / notebookSheet / mindmapSheet; guard list in initPaneCarousel (@SEC:CAROUSEL); CSS .goal-ov/.nb-ov/.mind-ov/.pc-ov in index.html`
- **[breaks-app] The appetite invite can never resolve — it re-fires every day, forever**  
  `showAppetiteInvite` (@SEC:JOURNEY-ENGINE) is armed by `setTimeout(...,1400)` at the tail of `drawJourney`, and it self-removes after 9000ms. `S.guide.cache.appetiteInvite` is deleted ONLY inside `appetiteAccept()` / `appetiteDecline()`. If the card times out un-tapped — which is the default outcome for a card that appears unannounced and vanishes in nine seconds — the cache entry survives; only `_inv.shownK` was written, and that is a per-day marker. So the same popup returns every single day and cannot be dismissed permanently. This is the strongest single candidate for what David is describing.  
  *anchor:* `showAppetiteInvite / appetiteAccept / appetiteDecline, and the setTimeout(...,1400) arm at the tail of drawJourney (@SEC:JOURNEY-TRAIL)`
- **[breaks-app] Cards yank themselves out from under the finger on a 5–9 second timer**  
  `showAppetiteInvite` removes at 9000ms, `heroSandwich` at 8000ms, `catalystCard` at 7000ms and its follow-up `conv` card at 5000ms. All are inline `.hs-ov` bottom cards with multiple tap targets. A user who reads the question and reaches for a chip gets the card deleted mid-reach — and in `catalystCard`'s case the +15 earn only fires on the chip tap, so the timeout silently discards the reward path too.  
  *anchor:* `showAppetiteInvite / heroSandwich / catalystCard (the setTimeout(...,Nooo) tails), @SEC:JOURNEY-ENGINE`
- **[confusing] toast() has no singleton — 128 call sites all render to the same pixel**  
  `function toast(msg)` appends a fresh `.toast` node at `left:50%; bottom:90px` and removes it 2.6s later. Nothing checks for an existing toast. Any flow that fires two (e.g. `enhancePlan` → `renderAll` → an earn toast, or the master tick's timer-commit toast landing on a user-triggered one) draws two opaque cards at the identical fixed position — the reader sees one garbled overlapping label. This is the cheapest high-visibility fix in the whole area.  
  *anchor:* `function toast(msg) — beside overTrash(), and .toast in index.html`
- **[confusing] Moment cards sit at z9999 and are in NO gesture guard list**  
  `mlCard()` sets `z-index:9999` inline — above every real surface including a running tool player (`#breatheOv` z98), the Session Editor and the Activity Picker (z98), and onboarding (z90). Neither `initPaneCarousel`'s bail list (@SEC:CAROUSEL) nor `axisArmed`'s (@SEC:WORLD-MOTION) includes `.hs-ov`. `PANE_GUARD` covers the card's BUTTONS (via the generic `button` / `.jp-durchip` / `.jp-hmbtn` entries) but not the card body or its padding, so a drag that starts on the card's text slides the app's panes underneath the card. Honest caveat: this is a code-level certainty about the listener wiring, but how it FEELS on a real finger is device-untested — the preview lies about swipe.  
  *anchor:* `mlCard() (ORGAN D), PANE_GUARD + initPaneCarousel (@SEC:CAROUSEL), axisArmed (@SEC:WORLD-MOTION)`
- **[confusing] Two divergent copies of the "an overlay is open" guard list, already out of sync**  
  `initPaneCarousel` checks `"#breatheOv, .radial, .bento-ov, .dur-ov, .ob-ov, .vol-ov, .goal-ov, .mind-ov, .nb-ov"` plus `#sheet.on`/`#trackerFull.on`/`#startScreen.on`. `axisArmed` checks the same list PLUS `.sed-ov, .pk-ov` but WITHOUT `#trackerFull`/`#startScreen`. Neither lists `.hs-ov`, `.ws-ov`, `.pc-ov`, `.rc-ov`, `.mint-ov`, `.cele-ov`, or `#feature`. Every new overlay has to remember to edit two string literals in two sections; several already didn't. (To be precise and fair: `.sed-ov`/`.pk-ov` missing from the carousel list is NOT a live bug — `PANE_GUARD` catches them by selector. The divergence is the defect, not that specific pair.)  
  *anchor:* `initPaneCarousel (@SEC:CAROUSEL) vs axisArmed (@SEC:WORLD-MOTION)`
- **[confusing] #breatheOv is a duplicate ID across ~18 creation sites**  
  Eighteen separate `document.createElement("div"); ov.id = "breatheOv"` sites (breathwork, relaxMoment, selfHypnosis, the guided player's `gp-ov`, resetTimer, recallGame, the beat-runner, and more). Each closes over its own `ov` so the close buttons work, but the ID is read by `sfx()` ("never inside a session") and by the audio gate near @SEC:TTS. With two players alive — reachable via `tranquilityOffer` → `selfHypnosis()` or `mlRoute` → `relaxMoment()` landing over a session — those guards inspect only the first node in the DOM and the wrong one wins.  
  *anchor:* `the ~18 `ov.id = "breatheOv"` sites; readers: sfx() and the @SEC:TTS gate`
- **[polish] The entire notebook menu system is unreachable dead code**  
  `notebookSheet` (the `.nb-ov` family) is wired only to `#notebookBtn`, which index.html sets to `display:none !important`. `mindmapSheet` (`.mind-ov`) is reachable only from inside `notebookSheet` and from `heroMenu()`, which has zero callers. `wakeBedSheet` likewise. This is the "two menu systems that clash" CLAUDE.md warns about — and the clash is already over: one side is dead. It can be deleted outright, taking the whole broken z71 band with it.  
  *anchor:* `notebookSheet / wakeBedSheet / mindmapSheet / heroMenu; the #notebookBtn wiring in @SEC:BOOT`
- **[confusing] No back, no Escape, no history — every dismiss is bespoke**  
  Grep for `popstate`, `pushState`, and `Escape` across app.js returns nothing. There are five unrelated dismiss idioms in use: a ✕ button, a backdrop-click listener (only some overlays install one — `.ob-ov`, `.hs-ov`, `.ws-ov`, `.pc-ov` and `#breatheOv` do not), an auto-remove timer, a "not now" text button, and in a few cases nothing but navigating away. There is no single place to add a dismiss law because there is no single place a popup is born.  
  *anchor:* `app-wide; the 52 `add(document.body, "div", "*-ov")` sites plus the ~18 #breatheOv sites`
- **[polish] gaugeOpen is now a hollow seam whose only job is to fire two popups**  
  David killed the gauge card itself on 2026-08-01; `gaugeOpen` now reads `fin(); return;` and exists purely to chain `spaceCheckOnce()` (a one-time "your space right now?" questionnaire — a survey in the doorway, the exact pattern he already rejected) and then `checkMoments("open")` at +1200ms. The function is a vestigial pipe for the two surfaces most likely to be what he's complaining about.  
  *anchor:* `gaugeOpen / spaceCheckOnce (ORGAN C+D block, above @SEC:PICKER)`

### Fix plan

RECOMMENDATION: **CULL.** Not a rewrite.

A rewrite of 19 overlay families across a 19k-line file is a multi-region refactor touching @SEC:CAROUSEL, @SEC:WORLD-MOTION, @SEC:TIMELINE and @SEC:JOURNEY-ENGINE — every one of those is either the regression zone or adjacent to it — and it would rebuild surfaces that are already dead or already correct. The evidence says the value here is concentrated: of the ~19 families, four are unreachable, three are pure nags with no resolution path, and two (`sed-ov`, `pk-ov`) are David's own design ports that are already healthy and must not be touched. Cull first; the tail of the cull is one small primitive for the ~6 survivors, not a from-scratch popup framework.

--- PHASE 1 · WHAT DIES (size S, pure deletion, near-zero regression risk) ---
1. `showAppetiteInvite` + its `setTimeout(...,1400)` arm in `drawJourney`. Keep `appetiteState`/`_appCap` (the level math feeds the trail); delete the auto-surfacing card. → kills the never-resolving daily popup.
2. `checkMoments` + `offRamp` + `tranquilityOffer` + `comebackLadder` + the gate (`canNudge` / `markNudge` / `nudgeMuted` / `wideDayNow` / `preSleepWindow`). David already deleted the comeback trigger himself on 2026-07-23; these are the last two unprompted ones.
3. `spaceCheckOnce`, and then `gaugeOpen` collapses to nothing — delete it and inline its callers (the ssEnter branch, `theOpen`'s `toGauge`).
4. `motivationDial` + `mlRoute` + the popup arm inside `notePostpone` (KEEP `b.postponed++` — it is real data the journey can read).
5. `maybeWelcomeBack` + `welcomeBackSheet`.
6. The whole notebook system: `notebookSheet`, `wakeBedSheet`, `mindmapSheet`, `heroMenu`, and the `#notebookBtn` wiring in @SEC:BOOT. Then delete the `.nb-ov` and `.mind-ov` CSS.
7. `heroSandwich` (single caller, a chip on a journey Drift button — the question belongs on the node, not in a floating card).
8. The dead `#playerOv` selector in the two `sessionLive` checks.
9. Every `setTimeout(… ov.remove() …, 5000-9000)` auto-yank on the surviving cards.
Net: ~7 popup surfaces and 2 overlay families gone, ~350-450 lines deleted, and `.hs-ov` drops from 8 owners to 3.

--- PHASE 2 · WHAT MERGES (size M) ---
One primitive, `ovOpen({variant, dismiss, onClose})`, with three variants (`sheet` bottom / `card` centered / `strip` bottom-card), ONE z-band above `#trackerFull`(90) so the invisible-modal class is structurally impossible, ONE backdrop-dismiss, ONE entrance animation. Migrate onto it: `.goal-ov` (goalsSheet, presetsSheet, stackDetail, binderSheet), `.dur-ov` (durationSheet, pickSheet, numSheet), `.bento-ov`, `.ws-ov`, `.rc-ov`, `.mint-ov`, `.pc-ov`, and the 3 surviving `.hs-ov` cards. Add: ONE queue (a second open request replaces or defers, never stacks), ONE de-dupe (an overlay of the same key replaces its predecessor), ONE dismiss law (backdrop + ✕ + Escape/back, no timers). Register the primitive's root class in BOTH `PANE_GUARD` and the two guard lists — or better, replace both string literals with a single `overlayBusy()` helper so they can never diverge again.
Make `toast()` a singleton in the same pass (one node, replace text, restart the timer) — 15 lines, fixes all 128 call sites.
`#breatheOv` gets a real owner (`playerOpen()`/`playerClose()`) and a unique instance id per session, but its LOOK and its 18 callers' behavior stay byte-identical.

--- PHASE 3 · WHAT STAYS UNTOUCHED ---
`.sed-ov` (@SEC:EDITOR) and `.pk-ov` (@SEC:PICKER) — David's design ports, already correctly guarded; DESIGN AUTHORITY LAW says hands off. `#sheet` (leave in phase 1-2; fold in later only if he wants it). `#trackerFull`, `#journeyPath`, `#startScreen`, `#rotGuard` — full-screen surfaces, not popups. `_globalErrToast` (@SEC:ERRNET) — the safety net, keep as is. `celebrateGated` / `.cele-ov` — pointer-events:none, 1.5s, harmless.

--- RISK LEDGER ---
Regression contract: item 3 (tap-empty-slot creates a block) and item 4 (week-strip tracking) touch @SEC:PICKER and @SEC:TIMELINE — Phase 1 touches NEITHER except deleting `notePostpone`'s popup arm inside the drag-commit handler, which must be a deletion only, no re-flow of the drag path. Ratchet: all deletions, so the innerHTML-wipe count only falls. designAudit: none of this is home-board paint EXCEPT the toast singleton if its bottom band moves — keep `bottom:90px` exactly and no gate is at risk. Phase 2's z-band change must be re-verified against `#sheet`(95) and `#breatheOv`(98) so a sheet opened from inside a tool still lands above it.

### Open questions for David
- The guardian's unprompted moments (drift off-ramp, pre-sleep wind-down): delete them entirely, or demote them to a passive dot on the guardian puck that you tap when you want it?
- The "ready to go deeper?" appetite escalation: does it become a tappable NODE on the journey trail, or die with its popup and let the level rise silently?
- The 14-day "welcome back" full-screen: gone with the rest, or kept as a single line on home instead of an overlay?
- The 5-9 second auto-dismiss on the surviving cards: replaced with a manual dismiss only, or with a much longer one (30s+) so a card never vanishes mid-reach?
- Phase 2's one primitive: should `#sheet` (the 19-filler modal) fold into it too, or stay separate so the first pass carries zero risk to the settings/journal/brain flows?

---

## AREA 2 — "never land at the top of the journey"

**VERDICT:** Broken, and reproduced in the preview with a single root cause: moving `#jpTrail` out of `#jpScroll` into the home world's sky (`adoptTrailToSky`) destroys `#jpScroll.scrollTop` (empty container → browser clamps to 0), and `setPaneRest("journey")` deliberately refuses to re-run `drawJourney(true)` when the trail already has children — so every journey landing that happens after home was open parks at scrollTop 0, the very top of a 4483–5788px trail.
### What exists

THE JOURNEY DOM: `#journeyPath` (fixed, display:none→flex) > `.jp-scroll#jpScroll` (the ONLY scroller) > `.jp-trail#jpTrail` (index.html, one line, the `#journeyPath` markup block).

THE ONE "SCROLL TO CURRENT NODE" HELPER ALREADY EXISTS, but is not a function — it is an inline closure at the tail of `drawJourney` (@SEC:JOURNEY-TRAIL), gated on `autoScroll && curEl`: `sc.scrollTop = Math.max(0, curEl.offsetTop - sc.clientHeight * 0.42)`, fired twice (setTimeout 60ms + 320ms, "once early, once after the icon font settles layout"). `curEl` is the `.jp-node.cur` element (set inside `coin()` when state === "cur"), falling back to the end trophy `endT` when everything is done. Because it is a closure inside `drawJourney`, NOTHING outside a full redraw can call it. There is no `jpFocus`, no `scrollIntoView` on the journey (the two `scrollIntoView` sites are the PLANNER's `scrollToNow` / `buildPull`, @SEC:TIMELINE).

EVERY PATH THAT LANDS ON THE JOURNEY SURFACE, and the scrollTop each leaves:
1. `openJourney()` (immediately above @SEC:CAROUSEL) — releases the trail from the sky, self-heals it back into `#journeyPath`, then `drawJourney(true)` → lands ON THE CURRENT NODE. INNOCENT. Callers: boot (`init`, @SEC:BOOT, the `setTimeout(openJourney, 150)` "JOURNEY IS HOME" line), `#navJourney`'s FIRST binding, the planner menu item `"Today's journey"`, the planner now-line tap on `#pullBody`, the game's `#gnJourney` (`closeGame(); openJourney()`), and the comeback/lesson cards.
2. `setPaneRest("journey")` (@SEC:CAROUSEL) — the CAROUSEL SWIPE lands here (`initPaneCarousel` → `settle()` → `setPaneRest(landed)`), and so do `#navJourney`'s LATER binding (line-order wins, it overwrites the openJourney one), the planner tab under simpleMode, `axisGoJourney()`, and the dev-menu "🧭 Journey". Its branch calls `releaseTrailFromSky()`, re-homes `#jpTrail`, then redraws ONLY `if (!_jt || !_jt.children.length || !jp.contains(_jt))`. With a populated trail that guard is false → NO redraw, NO auto-scroll → whatever scrollTop `#jpScroll` currently holds. THIS IS THE BUG PATH.
3. The ONE-PAGE sky (`wGoJourney` / `tfhGoJourney` → `wScrollTo(wSkyY())`, @SEC:WORLD-MOTION) — `wSkyY() = max(0, wHomeY() - clientHeight)`, i.e. the BOTTOM viewport of the sky. Measured live: sky height 5748, home seam 5762, landing 4950–5762. It lands at the trail's END, never at the top. INNOCENT of David's complaint (but see finding 2).
4. Explicit `scrollTop = 0` on the journey: exactly ONE, in `drawJourney`'s `jpRenderReturn` early-return branch (the single away/gapreturn node). Correct there — one node, nothing to scroll. INNOCENT.

MEASURED REPRO (preview, 402x874, v1301, real app code, no synthetic gestures): journey scrolled to 2000 → tap Home → `#jpTrail.parentNode === "tfWorldSky"`, `#jpScroll.scrollTop === 0` → tap Journey (`setPaneRest`) → trail back in `#jpScroll`, **scrollTop 0, scrollHeight 5788**. Same result via the garden route (`#tfHudGarden` → `setPaneRest("game")` → `#navJourney`): scrollTop 0, first visible unit "World 8 / Soul Force" = the trail's head.

CONTROL TESTS (what is NOT the cause):
- Journey → game → journey WITHOUT opening home: scrollTop reads 0 while `#journeyPath` is display:none but **restores to 2000** on re-show. Chrome preserves the offset across display:none. The carousel/pane machinery is INNOCENT on its own.
- `drawJourney`'s opening `trail.innerHTML = ""` does NOT lose the scroll in practice: a real `renderAll()` → `drawJourney(false)` rebuild (verified rebuilt: firstElementChild identity changed, 45 nodes) left scrollTop at 2000 unchanged, because nothing forces layout between the wipe and the refill. (Isolated, it does clamp — `jt.innerHTML=''` then reading scrollTop gives 0 — but the live code path doesn't.) INNOCENT.
- The master 1s tick (@SEC:BOOT) calls `renderToday()`, not `renderAll()`, so there is no per-minute journey reset.
### Findings
- **[breaks-app] The adopt→release round-trip destroys #jpScroll.scrollTop, and setPaneRest("journey") refuses to heal it**  
  `adoptTrailToSky()` moves `#jpTrail` into `#tfWorldSky`, leaving `#jpScroll` empty — the browser clamps its scrollTop to 0 and nothing saves it. `releaseTrailFromSky()` (called by `teardownWorld` ← `leaveHomeForPlayer`, and again at the top of `setPaneRest("journey")`) puts the trail back but restores nothing. `setPaneRest`'s journey branch then skips the redraw because the trail already has children — a guard written 2026-07-01 ("landing via a swipe must NOT re-run the auto-scroll") that predates the 2026-07-22 ONE-PAGE adoption and became wrong the day adoption shipped. Since home is the app's landing surface and the garden is entered FROM home, in practice `#jpScroll` is always at 0 by the time any pane-swipe reaches the journey. Verified: 2000 → 0 → 0 across home → garden → journey.  
  *anchor:* `setPaneRest (@SEC:CAROUSEL, the `n === "journey"` branch) + adoptTrailToSky / releaseTrailFromSky (@SEC:WORLD-MOTION, just above renderGroundTools)`
- **[breaks-app] The "scroll to the current node" logic is trapped inside drawJourney and cannot be called by any landing path**  
  The only code that focuses the live node is an anonymous `doScroll` closure at the tail of `drawJourney`, reachable only via `drawJourney(true)`. Every landing that must not redraw the trail (the swipe, the pane rest, a release-from-sky) therefore has no way to say "put me at the live end" — it can only take a full rebuild or nothing. This is why the fix has been unavailable rather than merely unwritten.  
  *anchor:* `drawJourney (@SEC:JOURNEY-TRAIL), the `if (autoScroll && curEl)` tail`
- **[confusing] The one-page sky landing shows the trail's tail, not the live node**  
  `wSkyY()` returns `wHomeY() - clientHeight`, so scrolling/tapping up from home parks on the LAST viewport of the trail. Measured live: current node at absolute ~4595 in the column, sky landing viewport 4950–5762 — the `.jp-node.cur` sits ~355px ABOVE the landing, so what you actually see is the locked future chapters below it. Not "the very top", so not David's reported bug, but it is the same class of miss and it will read as wrong once the top-landing is fixed. Note the HUD comment at tfhGoJourney explicitly claims this lands on "the trail's live end" — the code lands on the trail's physical end instead.  
  *anchor:* `wSkyY / wGoJourney / tfhGoJourney (@SEC:WORLD-MOTION)`
- **[confusing] worldScrollHome gives up silently after ~1s, leaving #tfWorld at the top of the sky**  
  The retry loop lands home only when `skyReady && target > peek && !morphing && scrollable`; after 60 tries (~1s, and the open-morph alone eats ~460ms of it) it just stops, with `_worldPositioned` still false — which also kills `wLive()` and therefore the magnet, the re-settle and the arrival cascades. If it ever times out, `#tfWorld.scrollTop` is whatever the release left (near 0) = the VERY TOP OF THE JOURNEY with home below, exactly matching David's "sometimes when you go from the garden to home". I could NOT reproduce it in the preview (garden → home landed at 5762 = the home seam, correct), so this is a code-plausible candidate, not a confirmed cause.  
  *anchor:* `worldScrollHome (@SEC:WORLD-MOTION), the `if (tries < 60) _worldPosTo = setTimeout(...)` tail`

### Fix plan

SIZE S–M, one contiguous pass over three regions (@SEC:JOURNEY-TRAIL, @SEC:CAROUSEL, @SEC:WORLD-MOTION). Nothing here touches @SEC:TIMELINE, so all four regression-contract items are structurally untouched.

STEP 1 (S, @SEC:JOURNEY-TRAIL) — extract the helper. Lift the `doScroll` closure out of `drawJourney` into a named module function next to it, e.g. `jpFocusCur(force)`: resolve the target as `#jpTrail .jp-node.cur` (fallback: the last `.jp-trophy`, then the last `.jp-node.done`), and set `#jpScroll.scrollTop = Math.max(0, t.offsetTop - sc.clientHeight * 0.42)`, fired twice at 60ms and 320ms exactly as today. `drawJourney`'s `if (autoScroll && curEl)` branch becomes a call to it — keep the math BYTE-IDENTICAL so the existing landing feel does not move. Bail out when `#jpTrail` is not inside `#jpScroll` (i.e. while it lives in the sky) so this can never fight the world column.

STEP 2 (S, @SEC:WORLD-MOTION) — make the adoption round-trip lossless, which is the actual root fix. Add a module-level `_jpSavedTop`; `adoptTrailToSky()` records `#jpScroll.scrollTop` (only when the trail is currently in `#jpScroll` and the value is > 0) BEFORE the `sky.appendChild(trail)`; `releaseTrailFromSky()` restores it after `scroll.appendChild(trail)` (restore after a forced reflow — read `scroll.scrollHeight` first — because the offset only sticks once the refilled content is laid out; this repo's own convention, rAF is throttled in the preview). With this alone, `setPaneRest`'s 2026-07-01 "don't re-run the auto-scroll on a swipe" rule stays intact and correct.

STEP 3 (S, @SEC:CAROUSEL) — a floor guard, so "the very top" is structurally unreachable. In `setPaneRest`'s journey branch, after the re-home guard: if the trail is taller than the viewport AND `#jpScroll.scrollTop < 8`, call `jpFocusCur()`. This catches every future path that loses the offset (including any I have not enumerated) without re-introducing the "lands scrolled away a little" glitch, because it only fires when the offset is already destroyed. Apply the same guard inside `openJourney()`'s self-heal branch for symmetry — it already redraws, so it is a no-op there today.

STEP 4 (S, @SEC:WORLD-MOTION, separate commit) — kill the silent give-up in `worldScrollHome`: on the final try, if still unpositioned and `world.scrollTop` is more than one viewport above `worldHomeTarget()`, hard-set `world.scrollTop = worldHomeTarget()` once and commit `_worldPositioned` (so the magnet/cascades come alive) rather than abandoning the user at the top of the sky. Ship this only if David confirms the garden→home symptom on device — see open questions.

RISK / GATES:
- v1288's descent work (`wSnapIntent`, the arm-down latch) and the `hcFlush`/`tcCascade` batching are NOT touched by steps 1–3. Step 4 touches the landing commit, so re-run the 9-case wIntent battery at 402x874 AND 440x956 after it.
- `DEV.designAudit()` gates measure the HOME board and the landings of `#tfWorld`; steps 1–3 only touch `#jpScroll`, which no gate reads. Run the audit anyway after step 4.
- Preship ratchets: `jpFocusCur` adds no `innerHTML` wipe and no SCHEMA touch, so both ratchets stay flat.
- HONEST LABEL for the handoff: the repro and the fix are verifiable in the preview (this is a scroll-OFFSET decision, not gesture feel), but the FEEL of the corrective landing under real momentum scrolling is DEVICE-UNTESTED.

### Open questions for David
- When you come back to the journey after leaving it mid-trail: restore exactly where you were reading (step 2 alone), or always snap back to the current node (step 3 always-on)?
- The one-page sky (swipe up from home) currently parks on the trail's physical END, with the current node ~355px above the fold: leave it there, or retarget wSkyY so the live node sits in view?
- Do you actually see garden→home land on the journey (not just garden→journey)? If yes I need one screen recording of that transition, or the 📐 on-device audit's scrollTop readout right after it — I could not reproduce it in the preview, so I will not fix worldScrollHome's give-up on a guess.

---

## AREA 3 — the breathing tool (visual, phase indicator, per-phase cue sounds, guiding tone)

**VERDICT:** The visual is NOT broken — I drove the engine deterministically and the orb/wave track the phase schedule exactly — but David is right twice over for one root cause: there are TWO independent breathing engines, and the one behind the toolbox "Breathe" front door (`timelinePlayer`) has no cue sounds and no guiding tone at all, while the one that has all the audio (`breathwork`) is only reachable through `breathPicker`; on top of that the "Flute glide" tone he remembers is genuinely defective — its octave partial is animated without a `cancelScheduledValues`/`setValueAtTime` anchor, so it snaps down 120–260 cents at every phase turn and then beats against the fundamental at a non-octave interval for the whole phase.
### What exists

TWO SEPARATE BREATH ENGINES, both writing to an overlay with id `breatheOv`.

(1) THE STANDALONE TOOL — `breathwork(cycles, onDone, patKey)` (grep anchor: `function breathwork(cycles, onDone, patKey)`; data above it at `var BREATH_PATTERNS = {`, `var BREATH_FLOWS`, `var BREATH_LADDER`, `var BREATH_SOUNDS`, `function makeBreathSustain`, `function breathPreview`, `function breathPicker`). Reached from `TOOLS` id "breathe" (`fn: function () { breathPicker(); }`) and from ~8 internal quick calls (`breathwork(4)` in `tfNightBreathe`, the low-energy "Settle" chip in the tools face, `settleNode` in the journey engine, `amStageStep`'s virtue-meditation door).
  · PHASE MACHINE: patterns are `ph` rows `[label, ms, kind]`, kind ∈ in | in2 | hold | out | rest. `flow` flattens stages×cycles into one ordered list; `cum[]` holds cumulative ms; `totalMs` the end.
  · VISUAL DRIVE: ONE `requestAnimationFrame` loop (`function frame()`), NOT CSS animation and NOT per-phase timers. Every frame it derives `idx` from elapsed ms, computes `prog` within the phase, applies easeInOutSine (`e2 = 0.5 - 0.5*Math.cos(Math.PI*prog)`), and interpolates `curLevel` from `fromLevel` (captured at the phase turn) to `targetLevel(kind)` (in→1, in2→1.14, out→0, hold/rest→hold current). `paintViz()` then writes either `orb.style.transform = scale(SLO + curLevel*(SHI-SLO))` with SLO=0.5 / SHI=1.32, or, when `S.breathViz === "wave"`, pushes `curLevel` into a `wpts` ring buffer and rebuilds the SVG path + dot. `.bw-orb` in index.html has no `transition` and no `animation`, so nothing fights the inline transform.
  · CUE AUDIO: `S.breathSound` (default "chord") selects one of ten `BREATH_SOUNDS`. Entries are EITHER `hit(kind, ctx, out, durSec)` — a one-shot pluck at the phase turn, fired from inside `frame()` at `idx !== curIdx` — OR `sustain: "<key>"` — a continuous voice built by `makeBreathSustain` and re-targeted with `sustain.setPhase(kind, pDur/1000)` at each turn. `_bsPluck` is the shared one-shot (osc → gain, 20 ms exponential attack, exponential decay to 0.0001).
  · GUIDING TONE: `makeBreathSustain` has exactly three voices — `chord` (three oscillators C3/G3/C4, whole chord glides ×1.05 on in, ×0.95 on out), `flute` (triangle 330 Hz + a sine "air" partial at 2×, gliding 415 Hz on in / 294 Hz on out — this is the "pitch rises on inhale, falls on exhale" David remembers), and `ocean` (looped white noise through a lowpass that opens on in, closes on out).
  · SPOKEN CUES: scheduled UP FRONT on the AudioContext timeline inside the launch tap (`TTS.scheduleClipAsync(row[0], tSec, …)`), gated by `S.breathVoice` (default OFF).
  · CHROME: story bars (one per CYCLE for a single pattern, one per STAGE for a ladder/flow), a skip button, a voice toggle (`addVoiceToggle`), and a cog that opens `breathSettingsPopover` — which contains ONLY the two volume sliders (`breathVolRows`), not the sound or visual pickers.

(2) THE COMPOSED PLAYER — `timelinePlayer(opts)` → `function paintNow(e)`, orb block commented "ORB DRIVE (David 2026-07-09)". This is what actually runs when David taps the toolbox. Path: toolbox hero `breatheLadder` (bands of `v_coherent` / `v_box` / `v_exhale` / `v_478` / `v_nostril`) → `tbxExpandTrack` (variant → `{k:"breathe", pat:"coherent"}`) → `runStack` → `stackCarouselable` is true (STACK_CONTENT.breathe exists) → `runStackCarousel` → `composeStackSegs` → the `C.breath` branch → `breathFlowRows(t.pat, t.secs)` emits segments `{label, gap: ms/1000, breath: kind}` → `timelinePlayer`.
  · Its orb is a SECOND, different implementation: scale 0.84→1.14 (vs 0.5→1.32), smoothstep (`_p*_p*(3-2*_p)`) instead of easeInOutSine, hold pinned to 1.14 and rest pinned to 0.84, plus an opacity ramp. It reads its clock from the AudioContext-backed `e` seconds, not `Date.now()`.
  · It has NO breath sound and NO guiding tone. `BREATH_SOUNDS` and `makeBreathSustain` are referenced in exactly three places — their own definitions, `breathPreview`, and `breathwork` — so nothing in the stack path can play a cue or a tone. Breath inside a stack is also voiceless by design.

WHERE THE SWITCHES LIVE TODAY
  · Visual (orb | wave): `breathPicker`, the "visual" row, rendered AFTER nine pattern chips. `S.breathViz`.
  · Cue sound (ten chips, tap to preview via `breathPreview`): `breathPicker`, below the visual row. `S.breathSound`.
  · Voice on/off for breath only: the in-session toggle button. `S.breathVoice`.
  · Volumes: `breathVolRows` (picker + in-session cog) and the global `openVolumePanel` (Voice / Background sliders, Guide's-voice toggle, background bed, app music).

VERIFIED EMPIRICALLY (I stubbed `requestAnimationFrame` + `Date.now` and pumped the clock in 100 ms steps, so the trace is exact, not eyeballed):
  · Physiological sigh (in 3200 / in2 900 / out 7000, 900 ms lead-in): label "Get comfy…" scale 0.500 through t=900; "Breathe in" 900→4100 rising 0.500→1.318 (theoretical top 0.5+1×0.82=1.320); "and a little more" 4100→5000 rising 1.318→1.431 (theoretical 0.5+1.14×0.82=1.435); "Long exhale" 5000→12000 falling 1.431→0.500; next "Breathe in" starts at exactly 0.500.
  · Calming breath in WAVE mode (in 4000 / hold 4000 / out 6000 / rest 2000): dot cy 160 (bottom) at lead-in, rises to 28 by the end of the inhale, holds flat at 28.2 for the whole 4 s hold, falls back to 160 across the 6 s exhale, flat through rest. Exact.
  · CONCLUSION: within a single uninterrupted run, the visual and the phase schedule agree perfectly. There is no drift. The correlation complaint is real but its causes are elsewhere (findings 2, 5, 6).
### Findings
- **[breaks-app] The toolbox "Breathe" front door runs a different engine that has NO cue sounds and NO guiding tone**  
  `breatheLadder` (the 2c hero tile) and every stack containing a breath step route through `runStackCarousel` → `composeStackSegs` (the `C.breath` branch) → `breathFlowRows` → `timelinePlayer`. `BREATH_SOUNDS` and `makeBreathSustain` are referenced in exactly three places in app.js — their own definitions, `breathPreview`, and `breathwork` — so the composed player cannot emit a phase bell or a guiding tone at all. It also uses a second orb implementation (0.84→1.14, smoothstep) instead of the standalone one (0.50→1.32, easeInOutSine), and offers no orb/wave choice. Whatever gets built on the `breathwork` side is invisible from the door David actually taps.  
  *anchor:* `runStackCarousel / composeStackSegs `C.breath` branch / breathFlowRows / timelinePlayer paintNow orb block`
- **[breaks-app] "Flute glide" — the guiding tone David remembers — cracks pitch at every phase turn (un-anchored AudioParam)**  
  In `makeBreathSustain` key==="flute", `setPhase` anchors `vg.gain` and `o1.frequency` with `cancelScheduledValues` + `setValueAtTime(value, now)`, but `air.frequency` (the 2× partial) gets ONLY `linearRampToValueAtTime(...)` with no anchor. Per the Web Audio spec the new ramp interpolates from the PREVIOUS event's end time/value, which is already in the past, so the parameter jumps discontinuously the instant the ramp is scheduled. I reproduced this in the live page: after an in-ramp ending at 830 Hz plus a 0.2 s pause, scheduling the out-ramp made the param jump 830 → 772.9 Hz within one render quantum — a 123-cent snap. With the real 4 s hold of the calming breath the same arithmetic gives 830 → ~727 Hz, a ~228-cent snap, after which the partial runs at 727/415 ≈ 1.75 against the fundamental (a flat minor seventh, not an octave) for the entire 6-second exhale. Also, `air.frequency` gets no event at all on hold/rest, so the two voices drift apart cumulatively.  
  *anchor:* `makeBreathSustain, `if (key === "flute")` branch, the `air.frequency.linearRampToValueAtTime` calls`
- **[breaks-app] "Breathing chord" (the DEFAULT sound) detunes the whole chord ~85 cents and never returns to pitch**  
  `makeBreathSustain` key==="chord" glides all three oscillators by a common ratio: ×1.05 on inhale (+84.5 cents), ×1.08 on in2 (+133 cents), ×0.95 on exhale (−88.9 cents). It never targets ×1.0, so the drone oscillates between roughly a semitone sharp and a semitone flat and is never in tune. Worse, hold and rest only touch `pad.gain` — pitch is left frozen wherever the previous ramp parked it, so a 4 s hold and a 7 s 4-7-8 hold are sustained at +85 cents. That is the classic seasick/sour drone. The gain shape adds to it: hold and rest snap over a fixed 0.5 s regardless of phase length (0.06 → 0.042 → 0.018), which reads as pumping under a long hold.  
  *anchor:* `makeBreathSustain, `if (key === "chord")` branch — `mul` and the `pad.gain` ramps in setPhase`
- **[breaks-app] A cue set and a guiding tone are mutually exclusive by construction**  
  Every `BREATH_SOUNDS` entry has EITHER a `hit` function OR a `sustain` key, and `breathwork` reads a single `S.breathSound`. David's asks (c) and (d) are two independent layers — a per-phase bell AND a continuous pitch-guide, each with its own toggle — and the current data shape cannot express "bells3 + flute" or "silent bells + tone on".  
  *anchor:* `var BREATH_SOUNDS / breathwork `var bwSound = S.breathSound || "chord"``
- **[confusing] The visual has a ~0.5 s dead zone at every phase turn — this is most likely what "doesn't correlate" feels like**  
  `frame()` applies easeInOutSine across the WHOLE phase, so the velocity is zero at both ends of every phase. From the measured trace: the exhale starts at 5000 ms with scale 1.431 and is still 1.420 at 5500 ms — the orb moves 0.8% of its travel in the first half-second after the word flips to "Long exhale". Symmetrically, the inhale moves 0.069 of 0.82 in its first 600 ms. Stacked at a boundary, the orb visibly loiters for roughly a second while the label and the cue sound have already changed. The math is correct; the perception is that the picture lags the instruction.  
  *anchor:* `breathwork `function frame()` — the `e2 = 0.5 - 0.5*Math.cos(Math.PI*prog)` line and `targetLevel``
- **[breaks-app] The visual clock starts on the first rAF frame while the voice clips are scheduled at launch — and the wall clock keeps running when rAF stops**  
  `frame()` does `if (startMs === 0) startMs = now;` using `Date.now()`, so the visual timeline is zeroed at the FIRST PAINTED FRAME. The spoken cues, by contrast, are scheduled in the launch tap against `sharedAudioCtx().currentTime` with a hard-coded 0.9 s offset matching `START_MS`. Any delay before the first frame becomes a permanent, unbounded audio-ahead-of-visual offset. I measured this live: the first sampled frame carried t = 7115 ms with the label still on "Get comfy…", i.e. 7.1 seconds of visual lag against a 900 ms lead-in. The mirror-image failure is device-real: when the phone locks or the user switches apps, rAF stops but `Date.now()` does not, so on return `el` jumps by the whole away-time and the session skips phases or lands straight on "Done ✓". (Preview note: the 7.1 s figure is a preview artifact of the hidden pane; the MECHANISM — a first-frame-anchored wall clock feeding a visual that must match an AudioContext-anchored audio timeline — is real code, not a preview lie.)  
  *anchor:* `breathwork `function frame()` (`startMs`, `Date.now()`) vs the `TTS.scheduleClipAsync` loop above `var done = false, raf = null;``
- **[confusing] Only one of the ten cue sets actually distinguishes all four phases**  
  `bells3` is the only set with a distinct pitch per kind (in 659.25 / hold 523.25 / out 392 / rest 329.63). `bell` covers in and out only. `bowl`, `chime`, `wood`, `harp` all early-return on hold and rest, so those two phases are silent. Nothing in the UI names `bells3` as "the one that marks every phase" — it reads as "Three bells", a timbre choice.  
  *anchor:* `var BREATH_SOUNDS — the `hit` functions for bell / bells3 / bowl / chime / wood / harp`
- **[confusing] The visual switch and the sound switch are buried in one overlay that most entry points never show**  
  `S.breathViz` (orb | wave) and `S.breathSound` are set ONLY inside `breathPicker`, after nine full-width pattern chips, and are not repeated in the in-session cog (`breathSettingsPopover` renders volume sliders and nothing else). Every internal quick call — `tfNightBreathe`, the low-energy "Settle" chip, the journey `settleNode`, the virtue-meditation door — calls `breathwork(n)` directly and skips the picker, and the whole toolbox path never reaches it. This is consistent with David saying "today it is a circle": the wave already exists and works, he has just never been shown it.  
  *anchor:* `breathPicker (the `viz` / `snd` blocks) and breathSettingsPopover`
- **[polish] The composed player mishandles the `in2` phase — the orb shrinks when the cue says "and a little more"**  
  `paintNow`'s orb block tests `_ph === "in" || "out" || "hold" || "rest"`. `in2` (the physiological sigh's top-up, emitted by `breathFlowRows` as `kind: ph[2]`) falls through to the ambient branch, where the scale becomes a free-running `0.90 + 0.15*(0.5 - 0.5*cos(e*0.5712))` — at an arbitrary phase of an 11 s cosine, so the orb can visibly SHRINK at the moment the user is told to inhale further. Currently latent: no `TBX_VARIANTS` entry maps to the `sigh` pattern, so no stack reaches it today. It will fire the moment a sigh variant or a custom stack step is added.  
  *anchor:* `timelinePlayer `function paintNow(e)` — the `if (_ph === "in" || _ph === "out" || ...)` orb block`
- **[polish] The wave visual only shows the last ~5.3 seconds, so a long pattern never draws a whole breath**  
  `paintViz` pushes one point every 55 ms and caps `wpts` at 96 (`if (wpts.length > 96) wpts.shift()`), giving a fixed ~5.3 s window. The calming breath cycle is 16 s and 4-7-8 is 19 s, so the wave shows roughly a quarter of one breath at a time and the user never sees the shape they are following. The x mapping `(i / 95) * 300` also compresses the trace to the left edge until the buffer fills, so the first ~5 s look different from the rest of the session.  
  *anchor:* `breathwork `function paintViz()` — `lastPush` / `wpts` / the `d` builder`
- **[polish] Cue timbres are thin: square-wave "woodblock", 20 ms bell attack, no reverb tail anywhere**  
  `_bsPluck` gives every cue a 20 ms exponential attack and a bare decay with no filter and no reverb. `wood` is `type: "square"` at 320/200 Hz with a 90 ms decay — a buzzy square blip, not a woodblock (a woodblock needs a noise/click transient plus a fast band-passed resonance, or at minimum a sine with a downward pitch blip). `bowl` uses partials at 1 / 2.7 / 4.2 with no reverb, so a singing bowl reads as three thin beeps. For David's ask ("meditation gong, gentle woodblocks") the registry needs real synthesis, not new entries in the same `_bsPluck` shape. Note the app already owns a convolution reverb recipe (`impulse()` inside `BGM`) that these could route through.  
  *anchor:* `function _bsPluck / BREATH_SOUNDS.wood / BREATH_SOUNDS.bowl (reverb recipe: BGM `function impulse`)`
- **[polish] `id="breatheOv"` is reused by at least three unrelated overlays and is the app's global "a session is open" sentinel**  
  `breathwork`, `timelinePlayer` (className `gp-ov`), and `runStack`'s chained step card all create an element with `id="breatheOv"`. That id is queried as a sentinel by `appMusicSync` (pause app music), `sfx` (suppress UI sounds inside a session), the home touch guard, and the carousel gesture guard. I hit the collision live: `document.getElementById("breatheOv")` returned an overlay with no `.bw-label` while probing. Any per-phase audio work that keys off this id will be ambiguous.  
  *anchor:* `breathwork / timelinePlayer / runStack (all `ov.id = "breatheOv"`); consumers: appMusicSync, sfx, wHomeTouchOK`
- **[polish] `@keyframes breatheReal` is dead CSS**  
  index.html defines a 16 s keyframe hard-coded to 4s-in / 4s-hold / 6s-out / 2s-rest with a comment claiming it matches the breath-cue cadence. It has zero references in app.js (the composed player explicitly sets `orb.style.animation = "none"` and drives the scale per frame). It is a trap for the next person who assumes CSS drives the orb, and it hard-codes one pattern's timings.  
  *anchor:* `index.html `@keyframes breatheReal` (immediately after `@keyframes breathe`)`

### Fix plan

SIZE: L overall. It splits cleanly into one M engineering spine plus four S/M layers on top. Nothing here touches the timeline, the picker, the world-motion zones, or any designed home surface, so the regression contract (items 1–4) and `DEV.designAudit()` are untouched by every step except the layout of a new settings sheet.

STEP 0 (M, prerequisite, pure engineering) — ONE PHASE MACHINE, TWO CONSUMERS.
Extract the phase clock out of `breathwork` into a standalone factory (proposed `makeBreathClock(flow, opts)`) that owns: the flat `flow` list, `cum[]`/`totalMs`, and a single `sample(elapsedMs)` returning `{ idx, kind, label, prog, level, cycle, stage, boundaryCrossed }`. Rules: (a) it is fed elapsed ms by its caller, never `Date.now()` internally, so the standalone tool can drive it off `AudioContext.currentTime` (the same clock the scheduled voice clips and every cue sound already live on) and the composed player can keep feeding it its own `e`; (b) `boundaryCrossed` is what fires audio, so visual and audio can never disagree about when a phase turned; (c) `level` is the single 0..1.14 breath level — both orbs derive their own scale range from it, so the 0.50–1.32 and 0.84–1.14 ranges survive as presentation, not as two clocks. Then rewrite `breathwork`'s `frame()` and `timelinePlayer`'s `paintNow` orb block to be pure readers of `sample()`. This kills findings 6 (wall clock vs audio clock, background skip) and 9 (`in2` unhandled) structurally, and is the precondition for everything else.
RISK: `timelinePlayer` is shared by meditation, PMR, relax, mantra, the day-one stack and every carousel session — its non-breath ambient branch (`_amb`) must be preserved byte-for-byte, and the act/section bar machinery must not be touched. Verify by running a meditation session and a PMR session and confirming the orb still ambient-breathes.

STEP 1 (S) — MAKE THE FRONT DOOR CARRY THE AUDIO. Once STEP 0 lands, wire the composed player's breath segments to the same cue registry: on `boundaryCrossed` with a `breath` kind, call the selected cue set's `hit`, and instantiate/`setPhase` the selected sustain for the duration of the breath act (starting it when the first breath segment begins and stopping it when the act ends, so a meditation act that follows is not left with a drone). This is what makes David's toolbox "Breathe" tile actually have sound. Guard: non-breath segments must not trigger anything.

STEP 2 (S, the fix that removes "sounds really bad") — REBUILD THE GUIDING TONE.
(a) Anchor every automated AudioParam identically: `cancelScheduledValues(now); setValueAtTime(param.value, now);` before every ramp, on `air.frequency` too — this alone kills the 123–260 cent snap.
(b) Ramp pitch as CENTS, not Hz: hold `frequency.value` fixed and animate `detune` linearly (or use `exponentialRampToValueAtTime`), so the glide sounds even instead of accelerating at the start.
(c) Give the sweep a musical target: a fixed interval that lands (a perfect fifth, +700 cents, or a fourth, +500) rather than 330→415→294; return to the base pitch at rest so the tone is never parked off-key. Same for `chord`: target ×1.0 at rest, and cap the swing.
(d) Give the tone a body: one lowpass whose cutoff opens with the level (the `ocean` branch already does exactly this and is the least offensive of the three — reuse its shape), a gentle attack/release on the master gain (`0.0001` floor, exponential, ≥120 ms), and shape gain across the FULL phase duration rather than a fixed 0.5 s on hold/rest.
(e) Make the tone's level follow `sample().level` continuously each frame instead of only being re-targeted at boundaries — then the tone's contour matches the orb's easing exactly by construction (finding 4 disappears).

STEP 3 (M) — SPLIT THE AUDIO INTO TWO INDEPENDENT LAYERS. Replace the single `S.breathSound` with `S.breathCue` (a cue-set key, default a set that marks all four phases) and `S.breathTone` (a sustain key or "off"). Restructure the registry into `BREATH_CUE_SETS` (every entry must define a distinct sound for in / hold / out / rest — retire the early-returns in bowl/chime/wood/harp, or state explicitly that silence IS that set's hold cue) and `BREATH_TONES`. Ship the sets David named: a bell set, a gong/bowl set (real synthesis: inharmonic partials, a strike transient, a convolution tail reusing `BGM`'s `impulse()`), and a woodblock set (drop the square wave — noise transient + band-passed resonance). `breathPreview` extends to preview cue + tone together.
MIGRATION: `S.breathSound` is a purely-additive read-guarded pref, so per the `@SEC:STATE` contract this needs no SCHEMA bump — but map the ten old keys to the new pair on read so David's saved choice survives.

STEP 4 (S) — MAKE THE VISUAL PLUGGABLE FOR REAL. Turn `paintViz` into a registry: `BREATH_VIZ = { orb: {html, paint(level, kind, prog)}, wave: {...}, ... }`, keyed by `S.breathViz`. The two existing visuals port unchanged; a third and fourth (a ring/arc that fills and empties, a horizon/bar) become data. Also fix the wave's window so it shows a WHOLE cycle: size the ring buffer from the current pattern's cycle length instead of the fixed 96×55 ms (finding 10).

STEP 5 (S) — THE EXPLICIT PHASE INDICATOR. The phase WORD already shows (`.bw-label`) in both engines; what is missing is "how long is left in this phase". Add a per-phase element driven by `sample().prog` — the cheapest honest version is a thin arc/underline under the label that empties over the phase, plus an optional count. Note the top story bars are per-CYCLE, not per-phase, so this is new, not a re-skin.

STEP 6 (S) — SURFACE THE SWITCHES. Move visual / cue-set / tone / voice into ONE breath settings sheet reachable from BOTH the picker AND the in-session cog (`breathSettingsPopover` today shows only volume), and make the quick internal callers (`tfNightBreathe`, the low-energy Settle chip, `settleNode`) honour the saved prefs — they already do, they just never let him set them.

CLEANUP (trivial): delete `@keyframes breatheReal` from index.html; give the three overlays distinct ids (or a shared `data-session` attribute) and update the four sentinel queries.

VERIFICATION: the deterministic harness I used is the right ship gate and is worth keeping as a `DEV.breathTrace(patKey)` probe — stub `requestAnimationFrame` + the clock, pump in fixed steps, and assert that the label, the level, and the boundary events agree at every step for all nine patterns plus the ladder and Wim Hof. That is a pure-decision probe, so it is honest in the preview. What the preview CANNOT prove and must be labelled DEVICE-UNTESTED: how the tone actually sounds on the phone's speaker, whether the cue sets read as gentle at David's usual volume, and behaviour across a lock/unlock mid-session.

### Open questions for David
- The guiding tone's sweep: a musical interval that lands (up a perfect fifth on the inhale, back down on the exhale) — or a narrower, more vocal drift of a whole tone that never sounds like a siren?
- Should the tone keep sounding through HOLD (a steady sustained note that tells you to stay) or drop to near-silence so the silence itself is the hold cue?
- Cue set + tone as two independent toggles (bells AND a tone at once, which is what your ask implies) — or keep it one pick so the session can never get busy?
- Default state for a first-time user: tone ON with bells off, bells ON with tone off, or fully silent until he opts in (breath voice is already default-off)?
- Which extra visual do you want first — a ring/arc that fills and empties, or a horizon line that rises and falls — and should the wave show one whole cycle at a time or keep scrolling?
- The phase indicator: a countdown number ("3, 2, 1"), a thin arc emptying under the word, or both?
- Should the toolbox "Breathe" tile keep running through the stack player (one continuous session surface), or should it open the standalone breath tool with its picker so the pattern/visual/sound choices are right there?


---

## AREA 6 — THE PAUSE / TIMING ENGINE

**VERDICT:** David is right, and the cause is more specific than "one pause length." **There is no per-line pause concept
anywhere.** Gap length is chosen ONCE PER TOOL BRANCH inside `composeStackSegs`, by a different formula per branch, then
applied identically to every line in that act. For the two SOMATIC tools (stretch, relax) the gap is derived purely from
`dose / line-count`, so it **ignores Guided/Balanced/Spacious entirely** and **grows without bound with the dose**.

### The evidence table (DEV.compose, live)

| tool | dose | guided | balanced | spacious |
|---|---|---|---|---|
| stretch | 120s | 9.8 x9 | **9.8** | **9.8** |
| stretch | 300s | 17.9 x14 | **17.9** | **17.9** |
| relax | 120s | 15.0 x8 | **15.0** | **15.0** |
| relax | 300s | 37.5 x8 | **37.5** | **37.5** |
| meditate | 120s | 6.4 | 11.5 | 16.9 |
| reprogram | 150s | 3.3 | 5.0 | 6.8 |

Stretch and relax are **identical under all three presets** — the setting is inert for exactly the two tools he
complained about. `relax` has 8 cues forever, so doubling the dose doubles the SILENCE rather than adding content.

### The repro, traced (the "Body" stack, `TBX_ITEMS.body`)
stretch 120s: n=9, dwell 13.3, `gap = max(7, dwell-3.5)` = **9.8s after every line, at every guidance setting**.
relax 90s: `per = max(3.5, 90/8)` = **11.3s** between "soften your forehead, and unclench your jaw" and "drop your
shoulders". Exactly his description.

Two extra mechanisms produce the "this and this and this THEN a long pause" phrasing: (1) multi-instruction lines are ONE
clip with ONE gap (`"Forehead, jaw, shoulders. Notice each part..."` = 7.92s naming three regions, then one pause, with
the caption FROZEN on the last chunk); (2) `label + ", " + sub` is spoken as a single clip — two beats in one breath.

### Secondary bug found: the chosen dose is a lie
`composeStackSegs` budgets speech at a hardcoded **3.5s/line**; real decoded clips are **3.5-7.9s**. The Body stack at
"5 min" runs **~6:04 (+21%)**; relax alone overruns ~50%.

### What already works (the reference implementation)
`PMR_BEATS = [{lab, sub, orb, hold}]` -> `beatRunner` **already authors a per-beat hold** (5s tense / 15-20s release).
That is exactly David's model, and it is the tool nobody complains about. `pauseFor()` already has a 9-kind taxonomy;
**only 2 of the 9 kinds are ever requested**, and never per line.

### The 8 pause contexts the code needs (grounded in real tools)
1. **somatic chain** (relax cues, body scan) - short FIXED beat 1.5-3s, not dose-derived, not depth-scaled. **This is the fix.**
2. **held position** (stretch) - a named hold ON THE MOVE, capped; past the cap add a mid-hold line, not silence.
3. **tense/release** (PMR) - already correct; use as reference.
4. **contemplative prompt** (meditation pools, gratitude) - keep `4 + 15*depth`. This is where Spacious SHOULD reach.
5. **inquiry** (`deep:true`) - keep 25-45s.
6. **visualization** (reprogram, ritual futures) - ~8-15s; today mis-served by `cue` (3.3s at Guided, far too short to picture anything).
7. **affirmation / say-it-back** (mantra) - anchored to the LINE'S OWN spoken length (~1.0-1.3x `sg.dur`).
8. **transition** (act/section boundaries) - currently **0s**; needs 1.5-2.5s so an act change registers.

Mechanism: tag each seg `_pk` at compose time, resolve `_pk -> seconds` inside `layout()` **where `sg.dur` is already
known** - that gives contexts 2/6/7 the real spoken length for free.

### Fix plan
- **S (engine only, zero content, zero clips, biggest felt win):** fix the `C.cues` gap bug (per-cue budget assigned as
  the gap); cap stretch holds; add `_pk` tagging + resolve in `layout()`; scope guidance to contexts 4/5/6 only; fix the
  3.5s speech assumption so a dose is a real dose; restore a transition beat; fix `DEV.compose`'s stale `slice(1)` and
  add a regression gate (no somatic seg with gap > N).
- **M (content tags, no new strings, no clips):** per-move `hold` on `STRETCH_MOVES`, a `pk` token per stack/med block.
- **L (only where David names them):** split multi-instruction lines - each split string is a NEW user-facing line and
  costs the copy gates + **voice regeneration across root + dave/millie/izo/aida** + RU dict.

**RISK TO FLAG TO THE BUILDER:** the ORB DRIVE (`paintNow`) derives orb scale from the current segment's span
(`dur + gap`). Shortening somatic gaps to ~2s will make the orb pulse fast unless the ambient breath is decoupled from
the segment span.

### Open questions for David
- The actual seconds per context, especially the somatic beat (1.5s? 2.5s? 3s?).
- Stretch: is a long hold SILENCE, or does the guardian talk through it (a mid-hold cue, a breath count)?
- Should Guided/Balanced/Spacious be renamed + scoped to contemplative content only, and surfaced in a stack's own
  settings? (Today it is buried in the meditation editor and shares its name with the unrelated `guidanceSheet`.)
- Is the chosen dose a **promise** (session equals 5:00, content trims to fit) or a **suggestion** (today, ~21% over)?
