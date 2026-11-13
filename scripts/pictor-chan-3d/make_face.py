"""ぴくたーちゃんの顔テクスチャを描く（頭の前半球に貼る。横 = 経度 -90〜90 度、縦 = 緯度 90〜-90 度）"""
import sys
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else "face.png"
SIZE = 1024
SS = 2  # 縮小してなめらかにする
S = SIZE * SS
SKIN = (255, 228, 210)


def px(lon, lat):
    return ((0.5 + lon / 180) * S, (0.5 - lat / 180) * S)


def deg(d):
    return d / 180 * S


def ellipse(draw, lon, lat, w, h, **kw):
    x, y = px(lon, lat)
    draw.ellipse([x - deg(w) / 2, y - deg(h) / 2, x + deg(w) / 2, y + deg(h) / 2], **kw)


img = Image.new("RGB", (S, S), SKIN)

# ほお
blush = Image.new("RGBA", (S, S), (255, 120, 130, 0))
bd = ImageDraw.Draw(blush)
for side in (-1, 1):
    ellipse(bd, side * 40, -33, 20, 10, fill=(255, 120, 130, 150))
blush = blush.filter(ImageFilter.GaussianBlur(deg(2.6)))
img.paste(blush, (0, 0), blush)

draw = ImageDraw.Draw(img)

EYE_LON, EYE_LAT, EYE_W, EYE_H = 27, -13, 27, 35
LASH = (28, 26, 60)

for side in (-1, 1):
    cx, cy = px(side * EYE_LON, EYE_LAT)
    w, h = deg(EYE_W), deg(EYE_H)

    # 白目
    draw.ellipse([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=(255, 255, 255))

    # ひとみ（上が濃く、下が明るい）
    iw, ih = w * 0.86, h * 0.92
    grad = Image.new("RGB", (int(iw), int(ih)))
    gd = ImageDraw.Draw(grad)
    top, mid, bottom = (22, 52, 150), (44, 126, 232), (120, 222, 255)
    for y in range(int(ih)):
        t = y / ih
        if t < 0.55:
            k = t / 0.55
            c = tuple(int(top[i] + (mid[i] - top[i]) * k) for i in range(3))
        else:
            k = (t - 0.55) / 0.45
            c = tuple(int(mid[i] + (bottom[i] - mid[i]) * k) for i in range(3))
        gd.line([(0, y), (iw, y)], fill=c)
    mask = Image.new("L", grad.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, grad.size[0] - 1, grad.size[1] - 1], fill=255)
    ix, iy = int(cx - iw / 2), int(cy - ih / 2 + h * 0.04)
    img.paste(grad, (ix, iy), mask)

    # どう孔
    draw.ellipse(
        [cx - iw * 0.2, cy - ih * 0.2, cx + iw * 0.2, cy + ih * 0.16],
        fill=(14, 30, 96),
    )
    # 下の明るい三日月
    draw.chord(
        [cx - iw * 0.36, cy + ih * 0.05, cx + iw * 0.36, cy + ih * 0.46],
        20, 160, fill=(170, 240, 255),
    )
    # ひとみのふち
    draw.ellipse([ix, iy, ix + iw, iy + ih], outline=(18, 36, 110), width=int(deg(0.7)))

    # 上まつげ（太い弧）
    lw = int(deg(3.4))
    draw.arc(
        [cx - w * 0.6, cy - h * 0.56, cx + w * 0.6, cy + h * 0.5],
        196, 344, fill=LASH, width=lw,
    )
    # 目じりのはね
    ox = cx + side * w * 0.56
    draw.polygon(
        [
            (ox - side * deg(3), cy - h * 0.2),
            (ox + side * deg(3.2), cy - h * 0.34),
            (ox + side * deg(0.6), cy - h * 0.02),
        ],
        fill=LASH,
    )
    # 下まつげ（細く）
    draw.arc(
        [cx - w * 0.42, cy - h * 0.4, cx + w * 0.42, cy + h * 0.54],
        60, 120, fill=(90, 70, 90), width=int(deg(0.7)),
    )

    # ハイライト
    hx, hy = cx - w * 0.17, cy - h * 0.2
    draw.ellipse([hx - w * 0.15, hy - h * 0.13, hx + w * 0.15, hy + h * 0.13], fill=(255, 255, 255))
    hx, hy = cx + w * 0.2, cy + h * 0.2
    draw.ellipse([hx - w * 0.07, hy - h * 0.055, hx + w * 0.07, hy + h * 0.055], fill=(255, 255, 255))

    # まゆ
    bx, by = px(side * (EYE_LON + 1), EYE_LAT + 27)
    draw.arc(
        [bx - deg(11), by - deg(4), bx + deg(11), by + deg(9)],
        205, 335, fill=(40, 48, 110), width=int(deg(1.3)),
    )

# 口（にっこり開けた口）
mx, my = px(0, -40)
mw, mh = deg(15), deg(15)
draw.chord([mx - mw / 2, my - mh, mx + mw / 2, my + mh * 0.62], 0, 180, fill=(196, 74, 84), outline=(120, 50, 60), width=int(deg(0.7)))
draw.chord([mx - mw * 0.3, my + mh * 0.12, mx + mw * 0.3, my + mh * 0.6], 0, 180, fill=(250, 150, 150))
draw.line([(mx - mw / 2, my - mh * 0.19), (mx + mw / 2, my - mh * 0.19)], fill=(120, 50, 60), width=int(deg(0.8)))

img = img.resize((SIZE, SIZE), Image.LANCZOS)
img.save(OUT)
print("saved", OUT)
