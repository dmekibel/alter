import os
import numpy as np
from PIL import Image, ImageDraw

SRC = "360frames"
files = sorted([f for f in os.listdir(SRC) if f.endswith(".png")])
# 8 frames at ~45 deg around the spin: front, front-diag, profile, back-diag, back, ...
PICK = [1, 17, 33, 49, 65, 79, 93, 107]  # 1-based frame numbers
OUTH = 270

def cut(img):
    im = img.convert("RGB")
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(im, c, (255, 0, 255), thresh=46)
    a = np.array(im.convert("RGBA"))
    m = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    a[m] = [0, 0, 0, 0]
    return Image.fromarray(a)

cells = [cut(Image.open(os.path.join(SRC, files[p - 1]))) for p in PICK]
# global bbox so all 8 share one tight, consistent crop
gx0, gy0, gx1, gy1 = 1e9, 1e9, 0, 0
for im in cells:
    bb = im.getbbox()
    if bb:
        gx0, gy0 = min(gx0, bb[0]), min(gy0, bb[1])
        gx1, gy1 = max(gx1, bb[2]), max(gy1, bb[3])
pad = 12
W0, H0 = cells[0].size
gx0, gy0 = max(0, int(gx0 - pad)), max(0, int(gy0 - pad))
gx1, gy1 = min(W0, int(gx1 + pad)), min(H0, int(gy1 + pad))
bw, bh = gx1 - gx0, gy1 - gy0
OUTW = round(OUTH * bw / bh)
crops = [im.crop((gx0, gy0, gx1, gy1)).resize((OUTW, OUTH), Image.LANCZOS) for im in cells]

# sheet: 8 rows (rotation order), 1 col (static per direction)
sheet = Image.new("RGBA", (OUTW, OUTH * 8), (0, 0, 0, 0))
for i, im in enumerate(crops):
    sheet.paste(im, (0, i * OUTH))
sheet.save("assets/spr-spin8.png")

# labeled check montage (my best compass guess per rotation slot)
labels = ["r0 f%d front" % PICK[0], "r1 f%d f-diag" % PICK[1], "r2 f%d PROFILE?" % PICK[2],
          "r3 f%d b-diag" % PICK[3], "r4 f%d back" % PICK[4], "r5 f%d b-diag" % PICK[5],
          "r6 f%d PROFILE?" % PICK[6], "r7 f%d f-diag" % PICK[7]]
M = Image.new("RGBA", (OUTW * 8 + 16, OUTH + 40), (32, 16, 44, 255))
d = ImageDraw.Draw(M)
for i, im in enumerate(crops):
    M.paste(im, (i * OUTW + 8, 32), im)
    d.text((i * OUTW + 10, 8), labels[i], fill=(150, 255, 190, 255))
M.convert("RGB").save("/tmp/spin8-check.png")
print("cellW", OUTW, "cellH", OUTH, "saved assets/spr-spin8.png", sheet.size)
