import os
import numpy as np
from PIL import Image, ImageDraw

SRC = "360frames"
files = sorted([f for f in os.listdir(SRC) if f.endswith(".png")])
FPS = len(files) / 5.042  # 121 frames over 5.042s ~= 24fps

# David's timestamps per compass direction (S,SW,W,NW,N,NE,E,SE). front = 0.0s.
TS = [0.0, 1.43, 1.86, 2.29, 2.91, 3.43, 3.68, 3.96]
PICK = [min(len(files) - 1, round(t * FPS)) for t in TS]
OUTH = 300
print("FPS", round(FPS, 2), "frames picked", [p + 1 for p in PICK])

def prep(idx):
    orig = Image.open(os.path.join(SRC, files[idx])).convert("RGB")
    W, H = orig.size
    bg = np.array(orig.getpixel((2, 2)), dtype=np.float32)  # cream background color
    # flood-fill ONLY to find the background-connected region (mask), don't destroy colors yet
    work = orig.copy()
    seeds = []
    for fx in (0, 0.25, 0.5, 0.75, 0.999):
        seeds += [(int(fx * (W - 1)), 0), (int(fx * (W - 1)), H - 1)]
    for fy in (0, 0.25, 0.5, 0.75, 0.999):
        seeds += [(0, int(fy * (H - 1))), (W - 1, int(fy * (H - 1)))]
    for s in seeds:
        ImageDraw.floodfill(work, s, (255, 0, 255), thresh=58)
    wk = np.array(work)
    mask = (wk[:, :, 0] == 255) & (wk[:, :, 1] == 0) & (wk[:, :, 2] == 255)
    arr = np.array(orig).astype(np.float32)
    # soft matte: inside the bg region, alpha = how far each pixel is from cream
    # → pure cream = transparent, translucent wing tint = semi-transparent (no hard clipping)
    dist = np.sqrt(((arr - bg) ** 2).sum(axis=2))
    soft = np.clip((dist - 14) / (62 - 14), 0, 1) * 255
    alpha = np.where(mask, soft, 255).astype(np.uint8)
    out = np.dstack([np.array(orig), alpha])
    return Image.fromarray(out, "RGBA")

imgs = [prep(p) for p in PICK]
gx0, gy0, gx1, gy1 = 1e9, 1e9, 0, 0
for im in imgs:
    bb = im.getbbox()
    if bb:
        gx0, gy0 = min(gx0, bb[0]), min(gy0, bb[1])
        gx1, gy1 = max(gx1, bb[2]), max(gy1, bb[3])
pad = 14
W0, H0 = imgs[0].size
gx0, gy0 = max(0, int(gx0 - pad)), max(0, int(gy0 - pad))
gx1, gy1 = min(W0, int(gx1 + pad)), min(H0, int(gy1 + pad))
bw, bh = gx1 - gx0, gy1 - gy0
OUTW = round(OUTH * bw / bh)
crops = [im.crop((gx0, gy0, gx1, gy1)).resize((OUTW, OUTH), Image.LANCZOS) for im in imgs]

sheet = Image.new("RGBA", (OUTW, OUTH * 8), (0, 0, 0, 0))
for i, im in enumerate(crops):
    sheet.paste(im, (0, i * OUTH))
sheet.save("assets/spr-dir.png")

labels = ["S/front", "SW", "W/left", "NW", "N/back", "NE", "E/right", "SE"]
M = Image.new("RGBA", (OUTW * 4 + 30, OUTH * 2 + 50), (32, 16, 44, 255))
d = ImageDraw.Draw(M)
for i, im in enumerate(crops):
    x = (i % 4) * (OUTW + 6) + 10
    y = (i // 4) * (OUTH + 24) + 24
    M.paste(im, (x, y), im)
    d.text((x + 4, y - 18), labels[i], fill=(150, 255, 190, 255))
M.convert("RGB").save("/tmp/ts-check.png")
print("cellW", OUTW, "cellH", OUTH, "saved assets/spr-dir.png", sheet.size)
