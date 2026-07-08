#!/usr/bin/env python3
# Regenerate ALL spoken tool lines as calm British-male neural MP3s (edge-tts / en-GB-RyanNeural).
# Covers: beatRunner beats (Rewire + Stutz), meditation guides, mantra, relax, breath cues, tapping.
# Names each by a normalized djb2 hash matching TTS.vhash() in app.js. Run: python3 _dev/gen-voice.py
import re, json, asyncio, edge_tts, os
VOICE="en-GB-RyanNeural"; RATE="-14%"; PITCH="-4Hz"
src=open('app.js',encoding='utf-8').read()
def un(s): return s.replace('\\"','"').replace("\\'","'").replace('\\n',' ').replace('\\\\','\\')
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower())
def h32(s):
    h=5381
    for ch in s: h=((h*33)^ord(ch))&0xffffffff
    return format(h,'x')
STR=r'"((?:\\.|[^"\\])*)"'
lines=[]
def add(l):
    if len(norm(l))>=3: lines.append(l)
# 1) beatRunner beats: lab + ". " + sub
for lab,sub in re.findall(r'lab:\s*'+STR+r'\s*,\s*sub:\s*'+STR, src):
    lab,sub=un(lab),un(sub); add(lab+(". "+sub if sub.strip() else ""))
# 2) meditation guides: each seq item verbatim
for seq in re.findall(r'seq:\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, seq): add(un(s))
# 3) mantra LINES + meditationQuick seq: verbatim (B3 2026-07-02: `var seq = [...]` was never extracted — the quick meditation had NO clips)
for arr in re.findall(r'var (?:LINES|seq)\s*=\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, arr): add(un(s))
# 4) relaxMoment STEPS: a + ", " + b  (["a","b",num])
for a,b in re.findall(r'\[\s*'+STR+r'\s*,\s*'+STR+r'\s*,\s*\d+\s*\]', src):
    add(un(a)+", "+un(b))
# 5) breath cues (PH labels, hardcoded — spoken for non-rest phases)
for c in ["Breathe in","Hold","Breathe out"]: add(c)
# 6) tapping steps: pt + ". " + say  AND  say alone (covers setup) AND pt alone (B3: the runtime now schedules pt + say as separate clips)
for pt,say in re.findall(r'pt:\s*'+STR+r'\s*,\s*say:\s*'+STR, src):
    pt,say=un(pt),un(say); add(pt+". "+say); add(say); add(pt)
# 7) medEditor section pools: lines: [...]  (settle/breath/body/aware/rest/bliss/play)
for arr in re.findall(r'lines:\s*\[([^\]]*)\]', src):
    for s in re.findall(STR, arr): add(un(s))
# 8) THE RITUAL ENGINE (R2, 2026-07-02): RITUAL_POOLS strings + composed "Now tap X." point cues + stretchFloor/gratitudeBeat lines
m = re.search(r'var RITUAL_POOLS = \{(.*?)\n  \};', src, re.S)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
m = re.search(r'var RITUAL_POINTS = \[([^\]]*)\]', src)
if m:
    for p in re.findall(STR, m.group(1)): add("Now tap " + un(p) + ".")
# stretchFloor PH triples have a FLOAT third element (["a","b",0.3]) — extractor 4 only matches ints
for a,b in re.findall(r'\[\s*'+STR+r'\s*,\s*'+STR+r'\s*,\s*[\d.]+\s*\]', src):
    add(un(a)+", "+un(b))
m = re.search(r'var PR_ALL = \[([^\]]*)\]', src)
if m:
    for s in re.findall(STR, m.group(1)): add(un(s))
# 9) tapping() runtime combinations (B3 2026-07-02): the setup sentence per feeling + the quoted feeling phrase + each point name — the runtime schedules these PIECES (never the old un-bankable "pt. say" composites)
m = re.search(r'var FEELINGS = \[(.*?)\];', src, re.S)
if m:
    for a, b in re.findall(r'\[\s*' + STR + r'\s*,\s*' + STR + r'\s*\]', m.group(1)):
        bb = un(b); noun = bb[5:] if bb.startswith("this ") else bb
        add("Even though I feel " + un(a) + ", I deeply and completely accept myself."); add("“" + bb + "”")
        add("“this remaining " + noun + "”"); add("“what's left of this " + noun + "”")  # EFT reminder-phrase variation across re-rate rounds (2026-07-08)
m = re.search(r'var PTS = \[(.*?)\];', src, re.S)
if m:
    for a, b in re.findall(r'\[\s*' + STR + r'\s*,\s*' + STR + r'\s*\]', m.group(1)): add(un(a))
# 10) STACK carousel (day-one + daily, 2026-07-08): transition intros (intro: "...") + stretch/relax cue LABELS (q[0], spoken as the segment text). beatRunner intros are objects (intro: {...}) so they don't match the string form.
for s in re.findall(r'intro:\s*'+STR, src): add(un(s))
m = re.search(r'var STACK_CONTENT = \{(.*?)\n  \};', src, re.S)
if m:
    for cuesarr in re.findall(r'cues:\s*(\[\[.*?\]\])', m.group(1), re.S):
        for a,b in re.findall(r'\[\s*'+STR+r'\s*,\s*'+STR+r'\s*\]', cuesarr): add(un(a))
# breath sub-cues spoken in the carousel breath act
for c in ["fill up slowly","longer than the in-breath"]: add(c)
# de-dupe
uniq=[]; seen=set()
for l in lines:
    if l not in seen: seen.add(l); uniq.append(l)
print("total unique spoken lines:", len(uniq))
os.makedirs('assets/voice',exist_ok=True)
manifest=[]
async def run():
    for l in uniq:
        key=h32(norm(l)); manifest.append(key); p=f"assets/voice/{key}.mp3"
        if os.path.exists(p): continue
        try: await edge_tts.Communicate(l,VOICE,rate=RATE,pitch=PITCH).save(p)
        except Exception as e: print("FAIL:",l[:40],e)
asyncio.run(run())
json.dump(sorted(set(manifest)),open('assets/voice/manifest.json','w'))
print("manifest keys:",len(set(manifest)),"| files:",len([f for f in os.listdir('assets/voice') if f.endswith('.mp3')]))
