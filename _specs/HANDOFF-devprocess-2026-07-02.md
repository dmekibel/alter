# HANDOFF — dev-process efficiency sweep (2026-07-02, David-approved)

**Context:** David confirmed the app deploys via **GitHub Pages only** — the Higgsfield/Cloudflare
target is dead. That unlocks Run 1 below. Diagnosis (from the Alfred session, 2026-07-02):
`.git` is **2.8GB**; every ship commits a regenerated 1.45MB `server.js` for a deploy that no
longer exists; **389 tracked files** (`360frames/`, `flyframes/`, `gridframes/`, `idleframes/`,
`alter.zip`, root sprite intermediates) have **zero references** in app.js/index.html; and the
two recurring device-caught bug classes (EN-only strings, spoken lines without clips) have no
preship gate.

**Model/effort routing (constitution rule 0–1):** Run 1 = LOW effort, Opus-class — mechanical.
Run 3 = HIGH effort, Fable-class — regression-zone refactor.

---

## RUN 1 — kill the dead deploy + repo hygiene + preship gates (~30 min, LOW effort)

### A. Remove the Higgsfield artifact
1. Verify nothing references it: `grep -rn "server\.js\|build-hf-server" index.html app.js manifest.json fresh.html _dev/` — expect hits ONLY in `_dev/preship.sh` (step 4) and docs.
2. `git rm server.js build-hf-server.js`
3. In `_dev/preship.sh`: delete step 4 (the regen block) and the two header comment lines about server.js going stale. Renumber the `say` messages if needed.
4. In `alter/CLAUDE.md`: remove `server.js` from "Source of truth" (line ~11) and anywhere else; while there, fix the stale facts — app.js is **~8,200 lines** (not ~3,000); drop the "176KB Cloudflare artifact" sentence entirely.
5. In the newest `TRACKER-HANDOFF-*.md` paste-block: remove "regenerates server.js" from the ship description.

### B. Untrack the confirmed-dead weight (untrack, do NOT delete from disk)
6. Re-verify zero references first (each pattern must return 0 in app.js + index.html):
   `grep -c "360frames\|flyframes\|gridframes\|idleframes" app.js index.html`
7. `git rm -r --cached 360frames flyframes gridframes idleframes && git rm --cached alter.zip`
8. Root sprite-generation intermediates — verify each is unreferenced, then `git rm --cached`:
   `360-contact.png face-map.png face-scan.png fairy-8sheet.png fairy-8sheet-wide.png fly-contact.png fly-preview.gif fly-preview.mp4 fly-sheet.png grid-contact.png grid-idle-preview.gif grid-idle-preview.mp4 grass-candidates.png cells-label.png idle-contact.png idle-preview.gif idle-preview.mp4 idle-sheet.png`
   Any file that IS referenced: leave it tracked, note it in the commit message.
9. Append all of the above to `.gitignore` (read it first — 48 bytes, don't clobber).
10. **Leave `assets/` alone** (528 files, 122MB — live sprites + 489 voice clips, referenced). A per-file audit is a separate, later task.
11. ⚠️ **Do NOT rewrite git history** to shrink the existing 2.8GB. FIX-LEDGER item **C2 needs git archaeology** (find when drag-into-past split vanished) — a rewrite destroys that. History shrink is DEFERRED until C2 is closed. Today's win = the bleeding stops (each future ship drops ~2.5MB of diff).

### C. Preship gates for the two device-caught bug classes
12. **Static latin audit:** port the `window.__latinAudit()` detector logic (in app.js, added v799) into `_dev/audit.js` as a node-side check over the translation dict — flag dict entries missing RU. Scope it to the dict only (the runtime DOM sweep can't run in node; don't fake it). Fail preship on new EN-only entries.
13. **Voice-clip coverage:** `_dev/gen-voice.py` / `gen-voice-ru.py` know the string→hash→clip mapping. Add a check to `_dev/audit.js`: every spoken dict entry must have BOTH clips present in assets. Fail preship if a spoken line is clipless. (This is the B3 bug class — was caught on David's phone; should die at preship.)
14. Run `bash _dev/preship.sh` end-to-end to confirm the trimmed pipeline passes clean.

### D. Doc sweep (fold in, mechanical)
15. `mkdir -p _archive` and move stale root planning docs into it. KEEP at root: `CLAUDE.md`, `AUDIT.md`, newest `TRACKER-HANDOFF-*.md`, `SOUL-OF-ALTER.md`, `GRAND-AUDIT-2026-06-26.md` (canonical backlog), `_specs/` untouched. ARCHIVE: `GAMEPLAN.md`, `GAMEPLAN-2026-06-29.md`, `EPIC-GAMEPLAN.md`, `MASTER-GAMEPLAN.md`, `ROADMAP.md`, `REDESIGN-BRIEF.md`, `DESIGN-BRIEF.md`, `REBUILD-PLAN.md` (referenced by CLAUDE.md — update the pointer), `TRACKER-REDESIGN.md`, `TRACKER-HANDOFF-2026-06-25.md`, `NIGHT-LOG.md`, `NEXT-SESSION.md`, `GARDEN-OF-MIND.md`, `SELF-HELP-STACK.md`, `HANDOFF.md`, `HANDOFF-visual-redesign-2026-06-27.md`. If any is referenced by CLAUDE.md or the live handoff, update the path in the same commit.
16. Ship: single commit `devprocess run 1: GitHub-Pages-only (server.js gone), untrack dead frames, latin+clip preship gates, doc sweep` → push → `gh run watch` to green.

---

## RUN 2 — device-pass tool (small build, LOW effort, just-build: dev tooling not design)
The DEVICE-UNTESTED queue is the true bottleneck (preview lies about gestures/audio; items rot
between David's phone passes — 5 rotting as of 2026-07-02). Build:
- A `DEVICE_QUEUE` array in app.js (id, one-line description, added-version), updated whenever a
  session labels something DEVICE-UNTESTED.
- 🧪 tools menu → **"Device pass"**: walks the queue one item at a time, David taps ✅/❌ (+
  optional note), results export via the existing share-snapshot path as ONE paste-block.
- Session-side rule (add to CLAUDE.md when built): paste-block comes back → ✅ items close in the
  ledger, ❌ items become just-fix bugs. David's 3-minute pass closes the whole queue.

## RUN 3 — split app.js into `src/` region files + preship concat (HIGH effort, Fable-class)
8,200 lines / one file = every edit rereads regions, edit anchors collide. There is already a
build step precedent, so: `src/*.js` region files (follow the existing region boundaries —
timeline, tracker, journey, rituals, i18n/voice, state) concatenated by preship into the deployed
`app.js` (deploy artifact unchanged, Pages still serves one file). Rules: one contiguous run
held against the 4-point timeline regression contract; no behavior changes in the same commit as
the split; `node --check` the concat output. This is the "long runs go at the DEBT" slot —
do NOT attempt it as a side-quest of a feature session.

---

**Order:** Run 1 now (any session, cheap). Run 2 next ship-day. Run 3 when David books a
dedicated debt run. Log completion in the newest `TRACKER-HANDOFF-*.md` paste-block, not a new doc.
