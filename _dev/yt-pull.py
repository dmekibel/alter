import sys, warnings, json
warnings.filterwarnings("ignore")
from youtube_transcript_api import YouTubeTranscriptApi
api = YouTubeTranscriptApi()
out = {}
for vid, slug in [l.split() for l in open(sys.argv[1]) if l.strip()]:
    try:
        tl = api.list(vid)
        t = None; kind = ""
        for cand in tl:
            if cand.language_code.startswith("en") and not cand.is_generated: t = cand; kind="manual"; break
        if t is None:
            for cand in tl:
                if cand.language_code.startswith("en"): t = cand; kind="auto"; break
        if t is None:
            for cand in tl:
                t = cand.translate("en"); kind="translated-from-"+cand.language_code; break
        f = t.fetch()
        words = sum(len(s.text.split()) for s in f)
        dur = f[-1].start + f[-1].duration
        # text with timestamps every ~30s
        lines=[]; last=-999
        for s in f:
            if s.start-last>=30: lines.append(f"\n[{int(s.start)//60:02d}:{int(s.start)%60:02d}]"); last=s.start
            lines.append(s.text.replace("\n"," "))
        path=f"meditation-scripts/_roots/{slug}.txt"
        open(path,"w").write(f"# {slug} — YouTube {vid} — captions: {kind} — {words} words — {int(dur)//60} min\n"+" ".join(lines))
        out[vid]=(slug,kind,words,int(dur)//60)
        print(f"OK {slug:45s} {kind:12s} {words:5d}w {int(dur)//60:3d}min")
    except Exception as e:
        print(f"FAIL {slug:45s} {vid} {type(e).__name__}: {str(e)[:80]}")
