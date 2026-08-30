#!/usr/bin/env python3
"""Ship to GitHub through the API when the git remote is unreachable.

WHY THIS EXISTS (2026-08-20): David's machine resolves github.com to a dead IP
(20.233.83.145) that black-holes TLS, so `git push` AND `git fetch` both hang.
api.github.com resolves elsewhere and works fine, and `gh` is authenticated, so
the Git Data API is a working road when the git protocol road is closed.

Because `git fetch` is also blocked, local `origin/main` goes stale the moment
this script is used — so the PARENT is always read live from the API, never from
the local ref. That makes it safe to run repeatedly.

usage:  python3 _dev/api-ship.py "commit message" file1 file2 ...
        python3 _dev/api-ship.py --msg-file msg.txt app.js index.html server.js
"""
import subprocess, json, sys, os

REPO = "dmekibel/alter"
BRANCH = "main"

def gh(method, path, payload=None):
    cmd = ["gh", "api", "-X", method, path]
    if payload is not None:
        cmd += ["--input", "-"]
        p = subprocess.run(cmd, input=json.dumps(payload), capture_output=True, text=True)
    else:
        p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit("FAIL %s %s\n%s" % (method, path, p.stderr[:600]))
    return json.loads(p.stdout) if p.stdout.strip() else {}

args = sys.argv[1:]
if not args: sys.exit(__doc__)
if args[0] == "--msg-file":
    msg = open(args[1], encoding="utf-8").read().rstrip(); files = args[2:]
else:
    msg = args[0]; files = args[1:]
if not files: sys.exit("no files given")

# THE CACHE-BUSTER GATE (2026-08-27, born from v1378): app.js shipped without index.html, so the live
# page kept asking for app.js?v=<old> and every phone served its cached copy of the previous build.
# The ship LOOKED successful for an hour. If app.js is going out, index.html must go with it whenever
# the local cache-buster differs from the one already live.
if any(f.endswith("app.js") for f in files) and not any(f.endswith("index.html") for f in files):
    import re, urllib.request as _u
    loc = re.search(r"app\.js\?v=(\d+)", open("index.html", encoding="utf-8").read())
    try:
        live = re.search(r"app\.js\?v=(\d+)", _u.urlopen(
            "https://raw.githubusercontent.com/%s/%s/index.html" % (REPO, BRANCH), timeout=15
        ).read().decode("utf-8"))
    except Exception:
        live = None
    if loc and live and loc.group(1) != live.group(1):
        sys.exit("REFUSED: index.html on %s still says app.js?v=%s but yours says v=%s.\n"
                 "Shipping app.js without it leaves every phone on the cached old build.\n"
                 "Add index.html to this ship." % (BRANCH, live.group(1), loc.group(1)))

head = gh("GET", "/repos/%s/commits/%s" % (REPO, BRANCH))
parent, base_tree = head["sha"], head["commit"]["tree"]["sha"]
print("remote head", parent[:8])

TEXT = (".js", ".html", ".md", ".json", ".css", ".py", ".sh", ".txt", ".yml", ".yaml")
items = []
for f in files:
    if not os.path.exists(f): sys.exit("missing file: " + f)
    if f.lower().endswith(TEXT):
        items.append({"path": f, "mode": "100644", "type": "blob",
                      "content": open(f, encoding="utf-8").read()})
    else:
        # BINARY (audio, images): the tree API's inline `content` is UTF-8 only, so a binary file has to
        # become a base64 blob first and be referenced by sha. Reading one as text is what broke the
        # first bed ship with a UnicodeDecodeError.
        import base64
        b64 = base64.b64encode(open(f, "rb").read()).decode("ascii")
        blob = gh("POST", "/repos/%s/git/blobs" % REPO, {"content": b64, "encoding": "base64"})
        print("  blob", f, len(b64) // 1024, "KB b64")
        items.append({"path": f, "mode": "100644", "type": "blob", "sha": blob["sha"]})

tree = gh("POST", "/repos/%s/git/trees" % REPO, {"base_tree": base_tree, "tree": items})
commit = gh("POST", "/repos/%s/git/commits" % REPO,
            {"message": msg, "tree": tree["sha"], "parents": [parent]})
gh("PATCH", "/repos/%s/git/refs/heads/%s" % (REPO, BRANCH), {"sha": commit["sha"], "force": False})
print("SHIPPED", commit["sha"][:8], "|", msg.split("\n")[0][:60])
