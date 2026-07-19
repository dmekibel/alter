#!/usr/bin/env python3
# ElevenLabs voice generator for ALTER. Same extraction + djb2 hash naming as gen-voice.py
# (so filenames/manifest keys are identical and TTS.vhash() in app.js finds them) — but synthesizes
# with an ElevenLabs voice (default: Dave) instead of edge-tts.
#
# Reads ELEVENLABS_API_KEY from _dev/.env (gitignored). Usage:
#   python3 _dev/gen-voice-11labs.py sample            # curated ~10-line taster, overwrites those hashes
#   python3 _dev/gen-voice-11labs.py all               # full bank, ONLY lines missing an mp3
#   python3 _dev/gen-voice-11labs.py all --force        # full bank, re-synth every line (burns credits)
#   VOICE_ID=<id> python3 _dev/gen-voice-11labs.py ...  # override voice (default Dave)
import re, json, os, sys, time, urllib.request, urllib.error

VOICES = {"dave": "fFuZg4Dt9LbhpYrB9FUK", "millie": "X1haHuvIvfCqolpCbj5P"}
VOICE_NAME = os.environ.get("VOICE_NAME", "dave").lower()  # dave | millie -> own subfolder + manifest
VOICE_ID = os.environ.get("VOICE_ID", VOICES.get(VOICE_NAME, VOICES["dave"]))
OUTDIR = f"assets/voice/{VOICE_NAME}"
MODEL = os.environ.get("ELEVEN_MODEL", "eleven_multilingual_v2")
# calm guardian delivery — slow, steady, a touch of expressiveness
VS = {"stability": 0.55, "similarity_boost": 0.80, "style": 0.15, "use_speaker_boost": True}

def load_key():
    for line in open("_dev/.env", encoding="utf-8"):
        if line.startswith("ELEVENLABS_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("no ELEVENLABS_API_KEY in _dev/.env")
KEY = load_key()

# ---- extraction: VERBATIM from gen-voice.py so hashes match exactly ----
src = open("app.js", encoding="utf-8").read()
def un(s): return s.replace('\\"', '"').replace("\\'", "'").replace("\\n", " ").replace("\\\\", "\\")
def norm(s): return re.sub(r"[^a-z0-9]", "", s.lower())
def h32(s):
    h = 5381
    for ch in s: h = ((h * 33) ^ ord(ch)) & 0xffffffff
    return format(h, "x")
STR = r'"((?:\\.|[^"\\])*)"'
lines = []
def add(l):
    if len(norm(l)) >= 3: lines.append(l)
for lab, sub in re.findall(r"lab:\s*" + STR + r"\s*,\s*sub:\s*" + STR, src):
    lab, sub = un(lab), un(sub); add(lab + (". " + sub if sub.strip() else ""))
for seq in re.findall(r"seq:\s*\[([^\]]*)\]", src):
    for s in re.findall(STR, seq): add(un(s))
for arr in re.findall(r"var (?:LINES|seq)\s*=\s*\[([^\]]*)\]", src):
    for s in re.findall(STR, arr): add(un(s))
for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*,\s*\d+\s*\]", src):
    add(un(a) + ", " + un(b))
m = re.search(r"var STRETCH_MOVES\s*=\s*\[(.*?)\n  \];", src, re.S)
if m:
    for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*\]", m.group(1)):
        add(un(a) + ", " + un(b))
for c in ["Breathe in", "Hold", "Breathe out"]: add(c)
for pt, say in re.findall(r"pt:\s*" + STR + r"\s*,\s*say:\s*" + STR, src):
    pt, say = un(pt), un(say); add(pt + ". " + say); add(say); add(pt)
for arr in re.findall(r"lines:\s*\[([^\]]*)\]", src):
    for s in re.findall(STR, arr): add(un(s))
for m2 in re.findall(r"entry:\s*" + STR, src): add(un(m2))
for arr in re.findall(r"pool:\s*\[([^\]]*)\]", src):
    for s in re.findall(STR, arr): add(un(s))
m = re.search(r"var MED_RETURN\s*=\s*\[([^\]]*)\]", src)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
m = re.search(r"var RITUAL_POOLS = \{(.*?)\n  \};", src, re.S)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
m = re.search(r"var RITUAL_POINTS = \[([^\]]*)\]", src)
if m:
    for p in re.findall(STR, m.group(1)): add("Now tap " + un(p) + ".")
for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*,\s*[\d.]+\s*\]", src):
    add(un(a) + ", " + un(b))
m = re.search(r"var PR_ALL = \[([^\]]*)\]", src)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
m = re.search(r"var FEELINGS = \[(.*?)\];", src, re.S)
if m:
    for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*\]", m.group(1)):
        bb = un(b); noun = bb[5:] if bb.startswith("this ") else bb
        add("Even though I feel " + un(a) + ", I deeply and completely accept myself."); add("“" + bb + "”")
        add("“this remaining " + noun + "”"); add("“what's left of this " + noun + "”")
m = re.search(r"var PTS = \[(.*?)\];", src, re.S)
if m:
    for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*\]", m.group(1)): add(un(a))
for s in re.findall(r"intro:\s*" + STR, src): add(un(s))
m = re.search(r"var STACK_CONTENT = \{(.*?)\n  \};", src, re.S)
if m:
    for cuesarr in re.findall(r"cues:\s*(\[\[.*?\]\])", m.group(1), re.S):
        for a, b in re.findall(r"\[\s*" + STR + r"\s*,\s*" + STR + r"\s*\]", cuesarr): add(un(a))
for c in ["fill up slowly", "longer than the in-breath"]: add(c)
m = re.search(r"var DAY1_LESSONS = \{(.*?)\n  \};", src, re.S)
if m:
    for k in ("t", "q", "reply", "line"):
        for s in re.findall(k + r":\s*" + STR, m.group(1)): add(un(s))
m = re.search(r"var GRAT_FLOW = \{(.*?)\n  \};", src, re.S)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))

# de-dupe (order-preserving)
uniq, seen = [], set()
for l in lines:
    if l not in seen: seen.add(l); uniq.append(l)
print("total unique spoken lines:", len(uniq))

# ---- mode ----
mode = sys.argv[1] if len(sys.argv) > 1 else "all"
force = "--force" in sys.argv
SAMPLE = [
    "Breathe in", "Hold", "Breathe out",
    "Settle in", "Let your eyes soften",
    "Notice the weight of your body",
    "There's nowhere to be but here",
    "Follow the breath, in and out",
    "When the mind wanders, gently come back",
    "Rest here a moment longer",
]
if mode == "sample":
    targets = [l for l in SAMPLE]
    force = True  # sample always overwrites so you hear the voice
else:
    targets = uniq

os.makedirs(OUTDIR, exist_ok=True)

def synth(text, path):
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": VS}).encode("utf-8")
    req = urllib.request.Request(
        "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID,
        data=body, method="POST",
        headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)

made = 0
manifest = [h32(norm(l)) for l in uniq]  # full manifest keys regardless of what we synth this run
for l in targets:
    key = h32(norm(l)); p = f"{OUTDIR}/{key}.mp3"
    if os.path.exists(p) and not force:
        continue
    try:
        n = synth(l, p); made += 1
        print(f"  ok {key} {n:>6}b  {l[:48]}")
        time.sleep(0.30)  # gentle on rate limits
    except urllib.error.HTTPError as e:
        print("  FAIL", key, e.code, l[:40], e.read()[:120]); break
    except Exception as e:
        print("  FAIL", key, l[:40], e); break

# only (re)write the per-voice manifest on a full run — a sample run must not drop keys
if mode != "sample":
    json.dump(sorted(set(manifest)), open(f"{OUTDIR}/manifest.json", "w"))
    print("manifest keys:", len(set(manifest)))
print(f"synthesized this run: {made} | voice: {VOICE_NAME}/{VOICE_ID} | files: {len([f for f in os.listdir(OUTDIR) if f.endswith('.mp3')])}")
