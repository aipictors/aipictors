"""ミニゲームのページの OGP 画像（1200x630）: python3 12_ogp.py <out.jpg>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
OUT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1200, 630
bg = Image.open("/Users/dev/Documents/GitHub/aipictors/_worktrees/aipictors-404-game/public/images/pictor-chan/run/bg/stage-01.webp").convert("RGB")
s = W / bg.width * 1.12
bg = bg.resize((int(bg.width * s), int(bg.height * s)), Image.LANCZOS)
x0 = (bg.width - W) // 2; y0 = bg.height - H - 10
im = bg.crop((x0, y0, x0 + W, y0 + H)).convert("RGBA")
# 左がわを少し暗くして、文字を読みやすく
shade = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(shade)
for x in range(W):
    a = int(150 * max(0, 1 - x / 820) ** 1.3)
    d.line([(x, 0), (x, H)], fill=(12, 20, 70, a))
im.alpha_composite(shade)
# 地面の道
road = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(road)
d.rectangle([0, 548, W, H], fill=(226, 226, 232, 255)); d.rectangle([0, 540, W, 550], fill=(250, 250, 252, 255))
for i in range(-1, 14):
    d.line([(i * 100 + 30, 550), (i * 100, H)], fill=(196, 198, 208, 255), width=3)
d.line([(0, 590), (W, 590)], fill=(196, 198, 208, 255), width=3)
im.alpha_composite(road)
# コイン
coin = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(coin)
for cx, cy, r in ((1010, 330, 30), (1085, 285, 30), (1150, 330, 30)):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 196, 40, 255), outline=(214, 140, 0, 255), width=5)
    d.ellipse([cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10], outline=(255, 232, 140, 255), width=4)
im.alpha_composite(coin)
# ぴくたーちゃん（影つき）
ch = Image.open(os.path.join(HERE, "work/ogp_run.png")).convert("RGBA")
ch = ch.crop(ch.getbbox()); hh = 500; ch = ch.resize((int(ch.width * hh / ch.height), hh), Image.LANCZOS)
cx, cy = 690, 78
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([cx + 40, 548, cx + ch.width - 30, 586], fill=(20, 30, 60, 110))
im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(6)))
im.alpha_composite(ch, (cx, cy))
d = ImageDraw.Draw(im)
def font(w, size): return ImageFont.truetype(f"/System/Library/Fonts/ヒラギノ角ゴシック W{w}.ttc", size)
def text(xy, s, f, fill, stroke=0, stroke_fill=None): d.text(xy, s, font=f, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
# 上の札
d.rounded_rectangle([60, 64, 60 + 470, 64 + 52], radius=26, fill=(255, 138, 31, 255))
text((84, 74), "無料ブラウザゲーム・登録なしで遊べる", font(7, 24), (255, 255, 255))
# 題
text((54, 140), "ぴくたーちゃん", font(9, 92), (255, 255, 255), 8, (20, 30, 90))
text((54, 250), "ラン", font(9, 150), (255, 214, 64), 10, (20, 30, 90))
text((372, 318), "PICTOR-CHAN RUN", font(8, 30), (255, 255, 255), 5, (20, 30, 90))
# 特長
x = 60
for label in ("全15ステージ", "ランキング", "みんなのロビー", "きせかえ"):
    f = font(7, 26); w = d.textlength(label, font=f) + 36
    d.rounded_rectangle([x, 438, x + w, 438 + 50], radius=25, fill=(255, 255, 255, 235))
    text((x + 18, 448), label, f, (28, 35, 64)); x += w + 12
text((62, 498), "Aipictors", font(8, 30), (255, 255, 255), 4, (20, 30, 90))
text((236, 503), "公式マスコットのミニゲーム", font(6, 24), (255, 255, 255), 4, (20, 30, 90))
im.convert("RGB").save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
print(OUT, os.path.getsize(OUT))
