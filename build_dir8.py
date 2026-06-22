import imageio_ffmpeg, numpy as np
from PIL import Image, ImageDraw

VID = "/Users/Dmekibel/Downloads/IMG_2918.MP4"
COLS, ROWS = 4, 2            # wide sheet layout: 4 across, 2 down = 8 cells
NFRAMES = 20                 # packed animation frames per direction
OUTW, OUTH = 216, 243        # downscaled cell size in the game sheet

reader = imageio_ffmpeg.read_frames(VID)
meta = next(reader)
W, H = meta["size"]
cw, ch = W // COLS, H // ROWS
frames = []
for fb in reader:
    frames.append(np.frombuffer(fb, dtype=np.uint8).reshape(H, W, 3).copy())
N = len(frames)
print("video", W, "x", H, "frames", N, "cell", cw, "x", ch)
idxs = [round(i * (N - 1) / (NFRAMES - 1)) for i in range(NFRAMES)]

def cut(arr):
    im = Image.fromarray(arr).convert("RGB")
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(im, c, (255, 0, 255), thresh=46)
    a = np.array(im.convert("RGBA"))
    m = (a[:, :, 0] == 255) & (a[:, :, 1] == 0) & (a[:, :, 2] == 255)
    a[m] = [0, 0, 0, 0]
    return Image.fromarray(a).resize((OUTW, OUTH), Image.LANCZOS)

# packed sheet: 8 rows (reading order c0..c7), NFRAMES cols
sheet = Image.new("RGBA", (OUTW * NFRAMES, OUTH * 8), (0, 0, 0, 0))
montage = Image.new("RGBA", (OUTW * 4, OUTH * 2 + 30), (32, 16, 40, 255))
md = ImageDraw.Draw(montage)
for cell in range(8):
    r, c = cell // COLS, cell % COLS
    for fi, src in enumerate(idxs):
        sub = frames[src][r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
        sheet.paste(cut(sub), (fi * OUTW, cell * OUTH))
    # montage of first frame, labeled by reading-order index
    fc = cut(frames[idxs[0]][r * ch:(r + 1) * ch, c * cw:(c + 1) * cw])
    montage.paste(fc, ((cell % 4) * OUTW, (cell // 4) * OUTH + 30), fc)
    md.text(((cell % 4) * OUTW + 6, (cell // 4) * OUTH + 8 if cell < 4 else (cell // 4) * OUTH + 6), "c" + str(cell), fill=(95, 255, 160, 255))

sheet.save("assets/spr-dir8.png")
montage.save("/tmp/dir8-montage.png")
print("cellW", OUTW, "cellH", OUTH, "cols", NFRAMES, "rows 8")
print("saved assets/spr-dir8.png", sheet.size)
