import numpy as np
from PIL import Image, ImageDraw

D = "/Users/Dmekibel/Downloads/"
# compass order rows: S, SW, W, NW, N, NE, E, SE  (SW reuses front since it wasn't captured)
ROW_FILES = ["IMG_2921", "IMG_2921", "IMG_2922", "IMG_2923", "IMG_2924", "IMG_2925", "IMG_2927", "IMG_2928"]
OUTH = 300

def prep(name):
    im = Image.open(D + name + ".PNG").convert("RGB")
    w, h = im.size
    im = im.crop((0, 0, w, int(h * 0.80)))  # drop the black scrubber bar at the bottom
    W, H = im.size
    seeds = []
    for fx in (0, 0.25, 0.5, 0.75, 0.999):
        seeds += [(int(fx * (W - 1)), 0), (int(fx * (W - 1)), H - 1)]
    for fy in (0, 0.25, 0.5, 0.75, 0.999):
        seeds += [(0, int(fy * (H - 1))), (W - 1, int(fy * (H - 1)))]
    for s in seeds:
        ImageDraw.floodfill(im, s, (255, 0, 255), thresh=58)
    a = np.array(im.convert("RGBA"))
    m = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    a[m] = [0, 0, 0, 0]
    return Image.fromarray(a)

imgs = [prep(n) for n in ROW_FILES]
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
print("cellW", OUTW, "cellH", OUTH, "n 8 -> saved assets/spr-dir.png", sheet.size)
