import imageio_ffmpeg, numpy as np
from PIL import Image, ImageDraw

VID = "/Users/Dmekibel/Downloads/IMG_2918.MP4"
COLS, ROWS = 4, 2
NFRAMES = 20
OUTH = 270  # final cell height; width follows the tight-crop aspect

reader = imageio_ffmpeg.read_frames(VID)
meta = next(reader)
W, H = meta["size"]
cw, ch = W // COLS, H // ROWS
frames = [np.frombuffer(fb, dtype=np.uint8).reshape(H, W, 3).copy() for fb in reader]
N = len(frames)
idxs = [round(i * (N - 1) / (NFRAMES - 1)) for i in range(NFRAMES)]
print("video", W, "x", H, "frames", N, "cell", cw, "x", ch)

def cut(arr):
    im = Image.fromarray(arr).convert("RGB")
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(im, c, (255, 0, 255), thresh=46)
    a = np.array(im.convert("RGBA"))
    m = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    a[m] = [0, 0, 0, 0]
    return Image.fromarray(a)

# pass 1: cut every cell/frame, find the GLOBAL alpha bbox (so all directions share one tight, consistent crop)
cells = {}  # (cellIndex, frameIndex) -> RGBA Image
gx0, gy0, gx1, gy1 = cw, ch, 0, 0
for cell in range(8):
    r, c = cell // COLS, cell % COLS
    for fi, src in enumerate(idxs):
        img = cut(frames[src][r * ch:(r + 1) * ch, c * cw:(c + 1) * cw])
        cells[(cell, fi)] = img
        bb = img.getbbox()
        if bb:
            gx0, gy0 = min(gx0, bb[0]), min(gy0, bb[1])
            gx1, gy1 = max(gx1, bb[2]), max(gy1, bb[3])
pad = 8
gx0, gy0 = max(0, gx0 - pad), max(0, gy0 - pad)
gx1, gy1 = min(cw, gx1 + pad), min(ch, gy1 + pad)
bw, bh = gx1 - gx0, gy1 - gy0
OUTW = round(OUTH * bw / bh)
print("global bbox", gx0, gy0, gx1, gy1, "->", bw, "x", bh, "out", OUTW, "x", OUTH)

sheet = Image.new("RGBA", (OUTW * NFRAMES, OUTH * 8), (0, 0, 0, 0))
for cell in range(8):
    for fi in range(NFRAMES):
        crop = cells[(cell, fi)].crop((gx0, gy0, gx1, gy1)).resize((OUTW, OUTH), Image.LANCZOS)
        sheet.paste(crop, (fi * OUTW, cell * OUTH))
sheet.save("assets/spr-dir8.png")
print("cellW", OUTW, "cellH", OUTH, "cols", NFRAMES, "rows 8 -> saved", sheet.size)
