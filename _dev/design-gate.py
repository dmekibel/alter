#!/usr/bin/env python3
"""GATE A — design-pull integrity (born 2026-08-12, the coin-column failure).

Run against a DesignSync get_file result (the persisted tool-result JSON) BEFORE any
build spec is written from it. HARD FAIL (exit 1) on any of:
  - "truncated": true                       (the 256KiB cap ate the tail)
  - content does not end with </html>       (silent cut)
Prints a frame manifest (every data-screen-label + its byte span) so a missing or
suspiciously thin frame is visible instantly. A frame under MIN_FRAME_BYTES is a WARN:
its spec may live in JS/config elsewhere in the file, which is exactly how the
coin column was lost.

Usage: python3 _dev/design-gate.py <tool-result-file-or-html-file>
"""
import json, re, sys

MIN_FRAME_BYTES = 1500

def main():
    if len(sys.argv) != 2:
        print("usage: design-gate.py <pull-result.json|file.html>"); return 2
    raw = open(sys.argv[1], encoding="utf-8").read()
    truncated = None
    try:
        d = json.loads(raw)
        content = d.get("content", "")
        truncated = d.get("truncated")
    except (json.JSONDecodeError, ValueError):
        content = raw
    fail = False
    if truncated is True:
        print("FAIL  truncated:true — the 256KiB cap cut this file. DO NOT BUILD FROM IT."); fail = True
    if not content.rstrip().endswith("</html>"):
        print("FAIL  content does not end with </html> — silent cut. DO NOT BUILD FROM IT."); fail = True
    labels = [(m.start(), m.group(1)) for m in re.finditer(r'data-screen-label="([^"]+)"', content)]
    print(f"frames: {len(labels)}   bytes: {len(content)}")
    for i, (pos, lab) in enumerate(labels):
        end = labels[i + 1][0] if i + 1 < len(labels) else len(content)
        span = end - pos
        flag = "  WARN thin — spec may live outside this span" if span < MIN_FRAME_BYTES else ""
        print(f"  {lab:44s} {span:7d}B{flag}")
    if fail:
        print("\nGATE A: FAILED — recover the full file first (split the design file under 256KiB, or take David's screenshots as the artifact).")
        return 1
    print("\nGATE A: PASS — pull is complete.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
