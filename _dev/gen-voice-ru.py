#!/usr/bin/env python3
# RUSSIAN voice bank (David 2026-07-02): for every spoken EN line that has a translation
# in the I18N.ru display dict, synthesize the RUSSIAN line with ru-RU-DmitryNeural (calm male,
# same free edge-tts pipeline) and key it by the hash of the RUSSIAN text — matching app.js
# vhash(), which maps EN→RU через the dict before hashing when the app language is ru.
# Lines with no translation stay silent in RU (honest silence, never sudden English).
# Run AFTER gen-voice.py (it reads+extends the same manifest). Usage: python3 _dev/gen-voice-ru.py
import re, json, asyncio, edge_tts, os
VOICE = "ru-RU-DmitryNeural"; RATE = "-14%"; PITCH = "-4Hz"
src = open('app.js', encoding='utf-8').read()
def un(s): return s.replace('\\"', '"').replace("\\'", "'").replace('\\n', ' ').replace('\\\\', '\\')
def norm(s): return re.sub(r'[^a-z0-9а-яё]', '', s.lower())  # MUST match app.js vhash charset
def h32(s):
    h = 5381
    for ch in s: h = ((h * 33) ^ ord(ch)) & 0xffffffff
    return format(h, 'x')
STR = r'"((?:\\.|[^"\\])*)"'

# ---- 1) the same spoken-line extraction as gen-voice.py ----
lines = []
def add(l):
    if len(norm(l)) >= 3: lines.append(l)
for lab, sub in re.findall(r'lab:\s*' + STR + r'\s*,\s*sub:\s*' + STR, src):
    lab, sub = un(lab), un(sub); add(lab + (". " + sub if sub.strip() else ""))
for seq in re.findall(r'seq:\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, seq): add(un(s))
for arr in re.findall(r'var LINES\s*=\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, arr): add(un(s))
for a, b in re.findall(r'\[\s*' + STR + r'\s*,\s*' + STR + r'\s*,\s*[\d.]+\s*\]', src):
    add(un(a) + ", " + un(b))
for c in ["Breathe in", "Hold", "Breathe out"]: add(c)
for pt, say in re.findall(r'pt:\s*' + STR + r'\s*,\s*say:\s*' + STR, src):
    pt, say = un(pt), un(say); add(pt + ". " + say); add(say)
for arr in re.findall(r'lines:\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, arr): add(un(s))
m = re.search(r'var RITUAL_POOLS = \{(.*?)\n  \};', src, re.S)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
m = re.search(r'var RITUAL_POINTS = \[([^\]]*)\]', src)
if m:
    for p in re.findall(STR, m.group(1)): add("Now tap " + un(p) + ".")
m = re.search(r'var PR_ALL = \[([^\]]*)\]', src)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
uniq = []; seen = set()
for l in lines:
    if l not in seen: seen.add(l); uniq.append(l)

# ---- 2) EN→RU map from every quoted "key": "value" pair (the I18N.ru dict blocks) ----
ru = {}
for k, v in re.findall(STR + r'\s*:\s*' + STR, src):
    k, v = un(k), un(v)
    if k != v and re.search(r'[а-яА-ЯёЁ]', v): ru[k] = v
def resolve(l):
    if l in ru: return ru[l]
    for sep in [", ", ". "]:  # composed a+sep+b (stretchFloor/relax use ", "; beatRunner lab+sub uses ". ") — translate the halves
        if sep in l:
            a, b = l.split(sep, 1)
            if a in ru and b in ru: return ru[a] + sep + ru[b]
    return None

# ---- 3) synthesize the RU lines, extend the shared manifest ----
os.makedirs('assets/voice', exist_ok=True)
mpath = 'assets/voice/manifest.json'
manifest = set(json.load(open(mpath))) if os.path.exists(mpath) else set()
todo = [(l, resolve(l)) for l in uniq]
hits = [(l, r) for l, r in todo if r]
print("spoken lines: %d | with RU translation: %d | silent in RU: %d" % (len(uniq), len(hits), len(uniq) - len(hits)))
async def run():
    for l, r in hits:
        key = h32(norm(r)); manifest.add(key); p = "assets/voice/%s.mp3" % key
        if os.path.exists(p): continue
        try: await edge_tts.Communicate(r, VOICE, rate=RATE, pitch=PITCH).save(p)
        except Exception as e: print("FAIL:", r[:40], e)
asyncio.run(run())
json.dump(sorted(manifest), open(mpath, 'w'), ensure_ascii=False)
print("manifest keys:", len(manifest), "| files:", len([f for f in os.listdir('assets/voice') if f.endswith('.mp3')]))
