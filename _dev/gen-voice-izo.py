#!/usr/bin/env python3
# IZO Russian voice bank — gender-aware, delivery-profile-aware ElevenLabs generator.
# Source of truth = _specs/ru-voice-izo-lines.json (audited + gendered 2026-07-22), NOT a raw app.js
# scrape — so the copy fixes AND the male/female split are authoritative.
#
# HASH LANDMINE: keys are hash-of-RUSSIAN-text with norm = [^a-z0-9а-яё]. The EN-only norm from
# gen-voice-11labs.py strips ALL Cyrillic -> every line collapses to ONE key -> one file overwritten
# 501x. This MUST match app.js vhash(): lowercase, replace /[^a-z0-9а-яё]/g, djb2.
#
# GENDER: NEUTRAL/VOICE lines synth once (ru). USER lines synth BOTH ru (male) and ru_f (female) ->
# two hashes -> two files; app picks by S.profile.gender before hashing. 431 neutral + 70 + 70 = 571.
#
# DELIVERY: each line gets a profile -> voice_settings (v2) or audio-tags (v3). Profiles are the
# floor; David picks flat|v2-profiles|v3-hybrid (RU-VOICE-IZO-2026-07-22.md) — set MODE below.
#
# Usage:  python3 _dev/gen-voice-izo.py sample     # curated ~12-line taster, overwrites
#         python3 _dev/gen-voice-izo.py all        # full 571, only missing files
#         python3 _dev/gen-voice-izo.py all --force # re-synth everything (burns credits)
import json, os, sys, time, re, urllib.request, urllib.error

VOICE_NAME = os.environ.get("VOICE_NAME", "izo")               # RU voice folder: izo (default) | aida | ...
VOICE_ID   = os.environ.get("VOICE_ID", "anctA7r7S5Wnb0Ztqlos") # izo (ru) default
OUTDIR     = "assets/voice/" + VOICE_NAME
LINES    = "_specs/ru-voice-izo-lines.json"
# DELIVERY MODE (David's pick): "flat" | "v2" (per-profile settings) | "v3" (v3 + audio tags on CHARGE/hero lines)
MODE     = os.environ.get("IZO_MODE", "v2")

def load_key():
    for line in open("_dev/.env", encoding="utf-8"):
        if line.startswith("ELEVENLABS_API_KEY="): return line.split("=", 1)[1].strip()
    sys.exit("no ELEVENLABS_API_KEY in _dev/.env")
KEY = load_key()

# ---- hash: MUST equal app.js vhash() on the RU text ----
def norm(s): return re.sub(r"[^a-z0-9а-яё]", "", s.lower())
def h32(s):
    h = 5381
    for ch in norm(s): h = ((h * 33) ^ ord(ch)) & 0xffffffff
    return format(h, "x")

# ---- delivery profiles -> (v2 voice_settings, v3 audio-tag wrapper) ----
V2 = {
    "calm":   {"stability": 0.80, "similarity_boost": 0.85, "style": 0.05, "use_speaker_boost": True, "speed": 0.90},
    "charge": {"stability": 0.35, "similarity_boost": 0.80, "style": 0.45, "use_speaker_boost": True, "speed": 1.05},
    "warm":   {"stability": 0.62, "similarity_boost": 0.85, "style": 0.18, "use_speaker_boost": True, "speed": 0.96},
    "plain":  {"stability": 0.55, "similarity_boost": 0.80, "style": 0.15, "use_speaker_boost": True},
}
V3TAG = {"calm": "[calmly, softly] ", "charge": "[determined, energetic] ", "warm": "[warm, gentle] ", "plain": ""}
FLAT = {"stability": 0.55, "similarity_boost": 0.80, "style": 0.15, "use_speaker_boost": True}

def delivery_for(r):
    # prefer an explicit tag on the line; else heuristic by content. (Finalize when David picks the strategy.)
    d = r.get("delivery")
    if d in V2: return d
    en = (r.get("en") or "").lower()
    if any(k in en for k in ["bring it on", "i love pain", "sets me free", "forward motion", "vote", "finishes", "stack evidence"]): return "charge"
    if any(k in en for k in ["breathe", "step down", "deeper", "relax", "soften", "let go", "sink", "heavy", "settle"]): return "calm"
    if any(k in en for k in ["grateful", "proud", "day is behind", "close the day", "you showed up", "kindly"]): return "warm"
    return "plain"

def settings_and_text(r, ru_text):
    prof = delivery_for(r)
    if MODE == "flat": return FLAT, ru_text, "eleven_multilingual_v2"
    if MODE == "v3" and prof == "charge":  # v3 tags ONLY on the hero/charge lines; rest ride tuned-v2
        return {"stability": 0.5, "similarity_boost": 0.75}, V3TAG[prof] + ru_text, "eleven_v3"
    return V2[prof], ru_text, "eleven_multilingual_v2"

def synth(text, model, vs, path):
    body = json.dumps({"text": text, "model_id": model, "voice_settings": vs}).encode("utf-8")
    for attempt in range(6):  # retry transient 429 / system_busy with backoff instead of aborting the whole run
        req = urllib.request.Request("https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID,
            data=body, method="POST",
            headers={"xi-api-key": KEY, "Content-Type": "application/json", "Accept": "audio/mpeg"})
        try:
            with urllib.request.urlopen(req, timeout=90) as rsp: data = rsp.read()
            open(path, "wb").write(data); return len(data)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 5: time.sleep(5 + attempt * 5); continue
            raise

# ---- build the (ru_text, line) work list: USER lines contribute BOTH forms ----
rows = json.load(open(LINES, encoding="utf-8"))
GEN_FEMALE = os.environ.get("IZO_FEMALE", "0") == "1"  # female variants only matter once the gender resolver ships; skip by default to save credits
work = []  # (ru_text, row)
for r in rows:
    work.append((r["ru"], r))
    if GEN_FEMALE and r.get("gender") == "USER" and r.get("ru_f"): work.append((r["ru_f"], r))
manifest = sorted(set(h32(t) for t, _ in work))

mode  = sys.argv[1] if len(sys.argv) > 1 else "all"
force = "--force" in sys.argv
os.makedirs(OUTDIR, exist_ok=True)

if mode == "sample":
    want = ["Устройся", "Вдох", "Выдох", "Десять", "Один.", "Почувствуй движение", "готов", "Запечатай",
            "Мой день позади", "благодар", "Сведи лопатки", "до самого дна"]
    targets = [(t, r) for (t, r) in work if any(w.lower() in t.lower() for w in want)][:12]
    force = True
else:
    targets = work

made = 0
for ru_text, r in targets:
    key = h32(ru_text); p = f"{OUTDIR}/{key}.mp3"
    if os.path.exists(p) and not force: continue
    vs, text, model = settings_and_text(r, ru_text)
    try:
        n = synth(text, model, vs, p); made += 1
        print(f"  ok {key} {delivery_for(r):6} {model.split('_')[-1]:4} {n:>6}b  {ru_text[:44]}")
        time.sleep(0.30)
    except urllib.error.HTTPError as e:
        print("  FAIL", key, e.code, ru_text[:40], e.read()[:120]); continue  # skip this line, keep going (don't abort the whole bank)
    except Exception as e:
        print("  FAIL", key, ru_text[:40], e); continue

if mode != "sample":
    json.dump(manifest, open(f"{OUTDIR}/manifest.json", "w"))
    print("manifest keys:", len(manifest))
print(f"synthesized this run: {made} | MODE={MODE} | files: {len([f for f in os.listdir(OUTDIR) if f.endswith('.mp3')])}")
