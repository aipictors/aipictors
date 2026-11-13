"""コマを並べて見出し付きの一覧にする: python3 sheet.py out.png cols label1=path1 ... [--title T]"""
import sys
from PIL import Image, ImageDraw, ImageFont
out, cols = sys.argv[1], int(sys.argv[2])
items = [a.split("=", 1) for a in sys.argv[3:]]
def font(sz):
    for p in ("/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try: return ImageFont.truetype(p, sz)
        except Exception: pass
    return ImageFont.load_default()
ims = [(l, Image.open(p).convert("RGB")) for l, p in items]
w, h = ims[0][1].size
lab = max(22, h // 12)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w, rows * (h + lab)), (255, 255, 255))
d = ImageDraw.Draw(sheet); f = font(int(lab * 0.7))
for i, (l, im) in enumerate(ims):
    x, y = (i % cols) * w, (i // cols) * (h + lab)
    sheet.paste(im, (x, y + lab))
    d.text((x + 8, y + lab * 0.12), l, fill=(40, 50, 80), font=f)
sheet.save(out)
print(out, sheet.size)
