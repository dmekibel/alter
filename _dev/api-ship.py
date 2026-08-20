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

head = gh("GET", "/repos/%s/commits/%s" % (REPO, BRANCH))
parent, base_tree = head["sha"], head["commit"]["tree"]["sha"]
print("remote head", parent[:8])

items = []
for f in files:
    if not os.path.exists(f): sys.exit("missing file: " + f)
    items.append({"path": f, "mode": "100644", "type": "blob",
                  "content": open(f, encoding="utf-8").read()})

tree = gh("POST", "/repos/%s/git/trees" % REPO, {"base_tree": base_tree, "tree": items})
commit = gh("POST", "/repos/%s/git/commits" % REPO,
            {"message": msg, "tree": tree["sha"], "parents": [parent]})
gh("PATCH", "/repos/%s/git/refs/heads/%s" % (REPO, BRANCH), {"sha": commit["sha"], "force": False})
print("SHIPPED", commit["sha"][:8], "|", msg.split("\n")[0][:60])
