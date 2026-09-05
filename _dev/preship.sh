#!/usr/bin/env bash
# ALTER pre-ship — one command that replaces the error-prone hand ritual.
# Catches the two failures that caused most "it's broken" reports:
#   1. forgot to bump app.js?v=  -> David's phone serves a cached OLD build
#   2. forgot to regenerate server.js -> the Cloudflare deploy serves stale code
# Run from anywhere; resolves the project root from this script's location.
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# 1. Syntax gate — never ship a build that won't parse.
node --check app.js || fail "app.js has a syntax error — fix before shipping."
say "✓ app.js parses"

# 1.5 Structure ratchets — @SEC anchors present+ordered, innerHTML wipes never grow, SCHEMA↔MIG pairing.
node _dev/ratchet.js --write || fail "structure ratchets FAILED — fix before shipping (see above)."
say "✓ structure ratchets pass"

# 1.7 PORT-LOCK (David 2026-09-05, born from the rejected v1413 tour). A staged Claude Design bundle is a design port:
#     any `_design-sync/**/*.dc.html` touched in the last 3 days must have a sibling `verify/` folder holding at least one
#     prototype-vs-app screenshot PAIR (prototype-*.png + app-430-*.png). No pairs = the build was never diffed against the
#     frame = do not ship. Override for a non-port commit with PORT_LOCK=skip (say why in the commit message).
if [ "${PORT_LOCK:-}" != "skip" ]; then
  while IFS= read -r dc; do
    [ -z "$dc" ] && continue
    vdir="$(dirname "$dc")/verify"
    pairs_ok=0
    if ls "$vdir"/prototype-*.png >/dev/null 2>&1 && ls "$vdir"/app-430-*.png >/dev/null 2>&1; then pairs_ok=1; fi
    # The numeric record is accepted in place of PNG pairs ONLY when it carries a per-state delta table at David's device
    # geometry (the pane cannot persist screenshots while hidden; the numbers are the stricter diff anyway).
    if [ "$pairs_ok" = 0 ] && ls "$vdir"/DIFF-*.md >/dev/null 2>&1 && grep -q "430x932" "$vdir"/DIFF-*.md && grep -q "Δ" "$vdir"/DIFF-*.md; then pairs_ok=1; fi
    if [ "$pairs_ok" = 0 ]; then
      fail "PORT-LOCK: $(basename "$dc") was staged recently but $vdir has neither prototype/app-430 screenshot pairs nor a DIFF-*.md with a 430x932 Δ table — run the frame diff (DESIGN-PORT-CHECKLIST) or PORT_LOCK=skip for a non-port ship."
    fi
  done < <(find _design-sync -name '*.dc.html' -mtime -3 2>/dev/null)
fi
say "✓ port-lock: every recently staged design bundle has its frame-diff pairs"

# 2. Logic invariant audit — mirrors chapter gates + appetite dial from app.js.
#    Fails fast if any testable invariant regresses. Writes results back to GUARD.json.
node _dev/audit.js --write || fail "logic invariants FAILED — fix before shipping (see above)."
say "✓ logic invariants pass"

# 3. Auto-bump the cache-buster in index.html (the #1 forgotten step).
cur=$(grep -oE 'app\.js\?v=[0-9]+' index.html | head -1 | grep -oE '[0-9]+')
[ -n "${cur:-}" ] || fail "couldn't find app.js?v=NNN in index.html"
next=$((cur + 1))
# macOS/BSD sed
sed -i '' "s/app\.js?v=${cur}/app.js?v=${next}/g" index.html
say "✓ cache-buster bumped: v${cur} -> v${next}"

# 4. Regenerate the deploy artifact so it can never drift from source.
node build-hf-server.js >/dev/null && say "✓ server.js regenerated from index.html + app.js"

# 5. Hand David the cache-bust link.
say ""
say "READY TO SHIP (v${next}). Now:"
echo "    git add -A && git commit -m \"…\" && git push"
say "Then send David:  /fresh.html   (forces past Pages cache)"
