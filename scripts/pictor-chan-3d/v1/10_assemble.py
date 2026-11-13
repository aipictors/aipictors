"""紹介用の絵を組む: python3 10_assemble.py <work_dir> <dist_dir>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
W, D = sys.argv[1], sys.argv[2]
os.makedirs(f"{D}/previews", exist_ok=True); os.makedirs(f"{D}/web", exist_ok=True)
BG = (244, 246, 251); INK = (38, 52, 92); SUB = (110, 122, 150)
def font(sz, bold=False):
    for p, idx in (("/System/Library/Fonts/Helvetica.ttc", 1 if bold else 0), ("/System/Library/Fonts/Supplemental/Arial.ttf", 0)):
        try: return ImageFont.truetype(p, sz, index=idx)
        except Exception: pass
    return ImageFont.load_default()
def op(n): return Image.open(f"{W}/{n}.png").convert("RGB")
# turnaround
names = [("front", "Front"), ("quarter", "3/4"), ("side", "Side"), ("back", "Back")]
ims = [op(f"turn_{n}") for n, _ in names]
w, h = ims[0].size; top = 70
sh = Image.new("RGB", (w * 4, h + top), BG); d = ImageDraw.Draw(sh)
for i, (im, (_, lab)) in enumerate(zip(ims, names)):
    sh.paste(im, (i * w, top)); tw = d.textlength(lab, font=font(30, True)); d.text((i * w + (w - tw) / 2, 24), lab, fill=INK, font=font(30, True))
sh.save(f"{D}/previews/turnaround.png", optimize=True); print("turnaround", sh.size)
# expressions
ex = ["Neutral", "Blink", "Blink_L", "Blink_R", "Joy", "Fun", "Sorrow", "Surprised", "MouthClosed", "MouthOpen"]
ims = [op(f"expr_{n}") for n in ex]; w, h = ims[0].size; lab = 54; gap = 10; cols = 5
sh = Image.new("RGB", (cols * w + (cols + 1) * gap, 2 * (h + lab) + 3 * gap), BG); d = ImageDraw.Draw(sh)
for i, (n, im) in enumerate(zip(ex, ims)):
    x = gap + (i % cols) * (w + gap); y = gap + (i // cols) * (h + lab + gap)
    sh.paste(im, (x, y)); t = n if n != "Neutral" else "(neutral)"; tw = d.textlength(t, font=font(28, True))
    d.text((x + (w - tw) / 2, y + h + 10), t, fill=INK if n != "Neutral" else SUB, font=font(28, True))
sh.save(f"{D}/previews/expressions.png", optimize=True); print("expressions", sh.size)
# animations
acts = [("Idle", "15.3 s, loop"), ("Run", "1.2 s, loop"), ("Jump", "2.2 s"), ("Fall", "3.0 s"), ("Hurt", "13.8 s")]
N = 6; im0 = op("anim_Idle_0"); w, h = im0.size; left = 150
sh = Image.new("RGB", (left + N * w, len(acts) * h), BG); d = ImageDraw.Draw(sh)
for r, (a, note) in enumerate(acts):
    for i in range(N): sh.paste(op(f"anim_{a}_{i}"), (left + i * w, r * h))
    d.text((24, r * h + h / 2 - 30), a, fill=INK, font=font(34, True)); d.text((24, r * h + h / 2 + 12), note, fill=SUB, font=font(18))
sh.save(f"{D}/previews/animations.png", optimize=True); print("animations", sh.size)
# web preview: 透明のまま余白を切って 900px の高さに
im = Image.open(f"{W}/web_preview.png").convert("RGBA")
bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
pad = 6; bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))
im = im.crop(bb); im = im.resize((round(im.width * 900 / im.height), 900), Image.LANCZOS)
for q in (90, 85, 80, 75, 70, 60):
    p = f"{D}/web/preview.webp"; im.save(p, "WEBP", quality=q, method=6)
    if os.path.getsize(p) <= 120_000: break
print("preview.webp", im.size, os.path.getsize(p), "quality", q)
