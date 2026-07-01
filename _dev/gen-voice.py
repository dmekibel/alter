#!/usr/bin/env python3
# Regenerate the pre-recorded tool-voice MP3s (TTS #2). Run: python3 _dev/gen-voice.py
# Extracts the FIXED beatRunner lines from app.js, generates a calm British-male neural
# MP3 per line (edge-tts / en-GB-RyanNeural), names each by a normalized djb2 hash that
# matches TTS.vhash() in app.js, and writes assets/voice/manifest.json. Web Speech is the
# runtime fallback for anything not pre-recorded (custom lines, dynamic counts).
import re, json, asyncio, edge_tts, os
VOICE = "en-GB-RyanNeural"; RATE = "-14%"; PITCH = "-4Hz"
src = open('app.js', encoding='utf-8').read()
def unescape(s): return s.replace('\\"','"').replace("\\'","'").replace('\\n',' ').replace('\\\\','\\')
def norm(s): return re.sub(r'[^a-z0-9]','', s.lower())
def h32(s):
    h=5381
    for ch in s: h=((h*33) ^ ord(ch)) & 0xffffffff
    return format(h,'x')
pairs = re.findall(r'lab:\s*"((?:\\.|[^"\\])*)"\s*,\s*sub:\s*"((?:\\.|[^"\\])*)"', src)
lines=[]; seen=set()
for lab, sub in pairs:
    lab=unescape(lab); sub=unescape(sub)
    line = lab + (". " + sub if sub.strip() else "")
    if len(norm(line)) < 6 or line in seen: continue
    seen.add(line); lines.append(line)
os.makedirs('assets/voice', exist_ok=True)
manifest=[]
async def run():
    for line in lines:
        key=h32(norm(line)); manifest.append(key); path=f"assets/voice/{key}.mp3"
        if os.path.exists(path): continue
        try: await edge_tts.Communicate(line, VOICE, rate=RATE, pitch=PITCH).save(path)
        except Exception as e: print("FAIL:", line[:40], e)
asyncio.run(run())
json.dump(sorted(set(manifest)), open('assets/voice/manifest.json','w'))
print(f"{len(lines)} lines · {len(set(manifest))} manifest keys")
