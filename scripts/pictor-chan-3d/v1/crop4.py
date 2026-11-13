"""python3 crop4.py out.png box(x0,y0,x1,y1) scale img1 img2 ..."""
import sys
from PIL import Image
out = sys.argv[1]; box = tuple(int(v) for v in sys.argv[2].split(",")); sc = float(sys.argv[3]); cols = int(sys.argv[4])
ims = [Image.open(p).convert("RGB").crop(box) for p in sys.argv[5:]]
w, h = int(ims[0].width * sc), int(ims[0].height * sc)
rows = (len(ims) + cols - 1) // cols
sh = Image.new("RGB", (w * cols, h * rows), "white")
for i, im in enumerate(ims): sh.paste(im.resize((w, h), Image.LANCZOS), ((i % cols) * w, (i // cols) * h))
sh.save(out); print(sh.size)
