import re,sys
STOP=set("a an the and or but so to of in on at for with from this that these those it its is are was were be been being you your yours i we our us they them he she as if then than there here what which who whom when where why how all any each few more most other some such no nor not only own same too very can will just don don't now okay".split())
def words(s): return re.findall(r"[a-z']+",s.lower())
def content(s): return set(w for w in words(s) if w not in STOP and len(w)>2)
def norm(s): return re.sub(r'[^a-z0-9]','',s.lower())
def load(p):
    out=[]
    for l in open(p,encoding='utf-8'):
        l=l.rstrip('\n')
        if not l.strip(): continue
        m=re.match(r'^([DSBU])\|\s?(.*)$',l); out.append(m.group(2) if m else l)
    return out
relax=load('_design-sync/audio-content-2026-09-09/graph/relax-v1-lines.txt')
srcs={}
srcs['med-foundation-draft']=load('_design-sync/audio-content-2026-09-09/graph/med-foundation-lines.txt')
srcs['med-advanced-draft']=load('_design-sync/audio-content-2026-09-09/graph/med-advanced-lines.txt')
src=open('app.js',encoding='utf-8').read(); STR=r'"((?:\\.|[^"\\])*)"'
live=[]
for m in re.findall(r'entry:\s*'+STR,src): live.append(m)
for arr in re.findall(r'pool:\s*\[([^\]]*)\]',src): live+=re.findall(STR,arr)
srcs['app.js MED_BLOCKS (live)']=[x for x in live if x.strip()]
extra=[]
for arr in re.findall(r'lines:\s*\[([^\]]*)\]',src): extra+=re.findall(STR,arr)
srcs['app.js MED_EXTRA/STACK lines: [] (live, incl. the retiring arrival block)']=[x for x in extra if x.strip()]
tot=0
for name,med in srcs.items():
    ex=[];nr=[]
    for r in relax:
        cr=content(r)
        for m in med:
            if norm(m)==norm(r): ex.append((r,m))
            if len(cr)>=3:
                cm=content(m)
                if len(cm)>=3:
                    ov=len(cr&cm)/max(1,min(len(cr),len(cm)))
                    if ov>=0.6: nr.append((round(100*ov),r,m))
    print("\n== %s  (%d lines) =="%(name,len(med)))
    print("   exact: %d   near>=60%%: %d"%(len(ex),len(nr)))
    for r,m in ex: print("   EXACT  %s"%r)
    for o,r,m in sorted(nr,reverse=True): print("   NEAR %d%%  %-60s || %s"%(o,r[:60],m[:66]))
    tot+=len(ex)+len(nr)
print("\nlongest relax line: %d chars (cap 90)"%max(len(r) for r in relax))
