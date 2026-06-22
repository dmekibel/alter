import os
import numpy as np
from PIL import Image, ImageDraw

SRC = "360frames"
files = sorted([f for f in os.listdir(SRC) if f.endswith(".png")])
N = len(files)
COUNT = 16
PICK = [round(i * (N - 1) / COUNT) for i in range(COUNT)]  # evenly around the spin
OUTH = 270

def cut(img):
    im = img.convert("RGB")
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(im, c, (255, 0, 255), thresh=46)
    a = np.array(im.convert("RGBA"))
    m = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    a[m] = [0, 0, 0, 0]
    return Image.fromarray(a)

cells = [cut(Image.open(os.path.join(SRC, files[p]))) for p in PICK]
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

sheet = Image.new("RGBA", (OUTW, OUTH * COUNT), (0, 0, 0, 0))
for i, im in enumerate(crops):
    sheet.paste(im, (0, i * OUTH))
sheet.save("assets/spr-spin.png")

# labeled montage (2 rows of 8) to find FRONT and LEFT frame indices
M = Image.new("RGBA", (OUTW * 8 + 16, OUTH * 2 + 60), (32, 16, 44, 255))
d = ImageDraw.Draw(M)
for i, im in enumerate(crops):
    col, row = i % 8, i // 8
    M.paste(im, (col * OUTW + 8, row * (OUTH + 24) + 26), im)
    d.text((col * OUTW + 10, row * (OUTH + 24) + 6), "i" + str(i), fill=(150, 255, 190, 255))
M.convert("RGB").save("/tmp/spin-idx.png")
print("COUNT", COUNT, "cellW", OUTW, "cellH", OUTH, "saved assets/spr-spin.png", sheet.size)
