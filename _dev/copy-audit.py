#!/usr/bin/env python3
# COPY AUDIT (David 2026-07-08): the automatic, INDEPENDENT gate for ALTER copy.
# The writing docs failed because the author graded his own work. This does not care what the author thinks.
# Gate 1 of 2: deterministic tells (regex). Gate 2 (the adversarial LLM judge for "no idea underneath / vague / clever-for-clever") is a separate agent pass, since judgment can't be regex'd. See _specs/SCRIPT-ENGINE.md PART "THE AUDIT".
#
# Usage:
#   python3 _dev/copy-audit.py "one line to check"
#   python3 _dev/copy-audit.py --file lines.txt      (one candidate line per row)
# Exit code 1 if any ZERO-TOLERANCE tell fires, or any line has >2 judgment hits. Meant to run BEFORE David sees a line.
import re, sys

# ZERO-TOLERANCE: auto-fail, no argument. (name, regex, why)
ZERO = [
    ("em/en dash",        r"[—–]",                                              "dashes read as AI. use a period, comma, or colon."),
    ("emoji",             r"[\U0001F000-\U0001FAFF☀-➿←-⇿⬀-⯿]", "emoji banned app-wide. Tabler ti-* icons only."),
    ("negation-contrast", r"(?i)\b(not just|isn't (just |about )?|it'?s not|rather than)\b|,\s*not\s+\w|\bno\s+\w+\.\s+no\s+\w+\.\s+just\b", "the loudest LLM cadence. state the positive thing directly."),
    # the CROSS-SENTENCE switcheroo slipped Gate 1 on 2026-07-10 ("That's not a flaw. That's just the mind running the show." / "Not actual sleep. Just... gone.") — David: "the most heinous AI crime of all, the classic AI switcheroo."
    ("switcheroo",        r"(?i)\b(that|this|it)(?:'s| is| was)\s+not\b[^.!?]{0,60}[.!?]\s+(?:that|this|it)(?:'s| is| was)\b|\bnot\s+(?:a\s+|an\s+|the\s+)?\w+[^.!?]{0,40}[.!?]+\s*(?:\.\.\.\s*)?just\b", "the two-sentence AI switcheroo (\"That's not X. That's Y.\" / \"Not X. Just Y.\"). state the thing itself."),
]

# HARD tells: for a terse guardian line, ONE is fatal (the "no idea underneath" family + coercion + jargon).
HARD = [
    ("grand-abstract",     r"(?i)\b(oldest|deepest|truest|purest|greatest|hardest|rarest|most ancient)\b[^.,]{0,24}\b(you (have|own|carry)|there is|in you|inside you)\b|\b(everything|all) you need\b|the (whole|entire) (game|point|thing)\b", "cosmic/profound-sounding but no concrete idea. give a specific moment instead."),
    ("vague quantifier",   r"(?i)\b(nothing|everything|anything|something)\b\s+(has|is|was|will|ever|never|about)\b",     "abstract subject. name the concrete thing."),
    ("clinical vocab",     r"(?i)\b(executive function|time agnosia|parasympathetic|sympathetic nervous|dysregulation|neuroplasticity|amygdala|prefrontal cortex)\b", "cold jargon. say it as a feeling the user has, not what a scientist measures."),
    ("template opener",    r"(?i)(in a world|imagine a|let'?s face it|let'?s dive|the secret nobody|let that sink in|picture this)", "canned opener. start on the thing itself."),
    ("wrap-up bow",        r"(?i)(at the end of the day|\bultimately\b|this teaches us|the lesson here|and that'?s the (whole )?(point|game)|remember that)", "moralizing close. end on the sharpest line."),
    ("hype-question CTA",  r"(?i)(let'?s do it|yes[,!]? let'?s|ready to \w|are you ready)",                               "coercive/hype button grammar. plain and honest instead."),
]
# SOFT tells: accumulate. More than two = not ready.
SOFT = [
    ("slop word",          r"(?i)\b(powerful|game-?changer|revolutionary|unlock|leverage|elevate|supercharge|seamless|robust|foster|delve|crucial|pivotal|showcase|tapestry|testament|vibrant|meticulous|intricate|future-?proof|realm|landscape)\b", "marketing autopilot. name the specific thing or cut."),
    ("empty intensifier",  r"(?i)\b(very|really|truly|simply|literally|actually)\b",                                    "deflate. the word adds nothing."),
    ("hedge/filler",       r"(?i)(it'?s worth noting|it'?s important to|in many ways|\barguably\b|that said|when it comes to|can help|may help)", "padding. state the plain claim."),
    ("rule-of-three",      r"(?i)\b\w+,\s+\w+,\s+and\s+\w+\b",                                                            "triplets are a machine fingerprint. vary the count."),
]

def audit(line):
    z = [(n, w) for n, rx, w in ZERO if re.search(rx, line)]
    h = [(n, w) for n, rx, w in HARD if re.search(rx, line)]
    s = [(n, w) for n, rx, w in SOFT if re.search(rx, line)]
    return z, h, s

def report(line):
    z, h, s = audit(line)
    ok = (not z) and (not h) and (len(s) <= 2)
    tag = "\033[32mPASS\033[0m" if ok else "\033[31mFAIL\033[0m"
    print(f"{tag}  {line}")
    for n, w in z: print(f"      \033[31m[ZERO] {n}\033[0m — {w}")
    for n, w in h: print(f"      \033[31m[HARD] {n}\033[0m — {w}")
    for n, w in s: print(f"      \033[33m[soft] {n}\033[0m — {w}")
    if len(s) > 2 and not z and not h: print(f"      \033[33m{len(s)} soft hits (>2 = not ready)\033[0m")
    return ok

def main():
    args = sys.argv[1:]
    if not args:
        print("usage: copy-audit.py \"line\"  |  --file lines.txt"); sys.exit(2)
    if args[0] == "--file":
        lines = [l.rstrip("\n") for l in open(args[1], encoding="utf-8") if l.strip()]
    else:
        lines = [" ".join(args)]
    allok = True
    for l in lines:
        if not report(l): allok = False
    sys.exit(0 if allok else 1)

if __name__ == "__main__":
    main()
