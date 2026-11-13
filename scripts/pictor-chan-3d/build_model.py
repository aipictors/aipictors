"""ぴくたーちゃんの 3D モデルを組み立てて glb に書き出す（Blender の中で実行する）

    blender -b -P build_model.py -- <face.png> <out.glb> [preview_dir]

向き: +X が本人の左、-Y が正面、+Z が上。足元が原点、身長は約 1。
骨はすべて真上向きにそろえてあるので、書き出した後の骨の回転は
x = 前後に振る、z = 左右に開く、y = ひねる、でそのまま動かせる。
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :]
FACE_PNG, OUT_GLB = argv[0], argv[1]
PREVIEW_DIR = argv[2] if len(argv) > 2 else None


def srgb(hex_color):
    h = hex_color.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i : i + 2], 16) / 255
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return Vector(out)


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return a * (1 - t) + b * t


def smooth(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


SKIN = srgb("#ffe4d2")
NAVY = srgb("#1d2f8f")
NAVY_DARK = srgb("#162466")
ORANGE = srgb("#ff8a1f")
TEAL = srgb("#19b5d8")
WHITE = srgb("#ffffff")
SHIRT_SHADE = srgb("#eef2fb")
SKIRT = srgb("#1c2a5e")
SHOE = srgb("#27357a")
RIBBON = srgb("#18b7b0")
YELLOW = srgb("#ffd23f")

# ---- 形を溜めていく入れ物 -------------------------------------------------
verts = []  # Vector
colors = []  # Vector(rgb)
weights = []  # {bone: weight}
uvs = []  # (u, v)
faces = []  # (indices, material)
MAT_BODY, MAT_FACE = 0, 1


def add_vert(p, color, weight, uv=(0.02, 0.98)):
    verts.append(Vector(p))
    colors.append(color)
    weights.append(weight if isinstance(weight, dict) else {weight: 1.0})
    uvs.append(uv)
    return len(verts) - 1


def tube(rings, segs=12, mod=None, mat=MAT_BODY, flip=False):
    """輪を順につないだ管。ring = (中心, 横の向き, 外の向き, 横半径, 外半径, 色, 重み)。
    半径 0 の輪は 1 点にまとめる（端を閉じる）"""
    rows = []
    for ri, (center, side, out, w, th, color, weight) in enumerate(rings):
        center = Vector(center)
        if w <= 1e-6 and th <= 1e-6:
            rows.append([add_vert(center, color(0.0) if callable(color) else color, weight)])
            continue
        row = []
        for s in range(segs):
            a = 2 * math.pi * s / segs
            k = mod(a, ri) if mod else 1.0
            p = center + side * (math.cos(a) * w * k) + out * (math.sin(a) * th * k)
            c = color(a) if callable(color) else color
            row.append(add_vert(p, c, weight))
        rows.append(row)
    for a, b in zip(rows, rows[1:]):
        for s in range(segs):
            s2 = (s + 1) % segs
            if len(a) == 1 and len(b) == 1:
                continue
            if len(a) == 1:
                f = (a[0], b[s], b[s2])
            elif len(b) == 1:
                f = (a[s], b[0], a[s2])
            else:
                f = (a[s], b[s], b[s2], a[s2])
            faces.append((f[::-1] if flip else f, mat))


X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))


def frame(points, outs):
    """道すじの各点に、横と外の向きを付ける"""
    result = []
    n = len(points)
    for i in range(n):
        a = points[max(0, i - 1)]
        b = points[min(n - 1, i + 1)]
        tangent = (b - a).normalized()
        side = tangent.cross(outs[i])
        if side.length < 1e-6:
            side = X.copy()
        side.normalize()
        out = side.cross(tangent).normalized()
        result.append((side, out))
    return result


def strand(points, outs, width, thick, color, weight, segs=8):
    """毛束。width(t)・thick(t)・color(t)・weight(t) は根元 0 → 毛先 1"""
    frames = frame(points, outs)
    n = len(points)
    rings = []
    for i, p in enumerate(points):
        t = i / (n - 1)
        side, out = frames[i]
        w, th = width(t), thick(t)
        if i in (0, n - 1):
            w = th = 0.0
        rings.append((p, side, out, w, th, color(t), weight(t)))
    tube(rings, segs=segs, flip=True)


def limb(p0, p1, r0, r1, color, weight, segs=12, cap0=True, cap1=True, squash=1.0, out=None):
    """2 点を結ぶ丸い棒（両端は半球）"""
    p0, p1 = Vector(p0), Vector(p1)
    axis = (p1 - p0).normalized()
    out = out or (Y if abs(axis.dot(Y)) < 0.9 else X)
    side = axis.cross(out).normalized()
    out = side.cross(axis).normalized()
    length = (p1 - p0).length
    rings = []
    steps = 4

    def col(d):
        return color(d) if callable(color) else color

    if cap0:
        for i in range(steps):
            a = math.pi / 2 * i / steps
            d = -r0 * math.cos(a)
            r = r0 * math.sin(a)
            rings.append((p0 + axis * d, side, out, r, r * squash, col(d / length), weight))
    for i in range(5):
        t = i / 4
        r = r0 + (r1 - r0) * t
        rings.append((p0 + axis * (length * t), side, out, r, r * squash, col(t), weight))
    if cap1:
        for i in range(1, steps + 1):
            a = math.pi / 2 * i / steps
            d = length + r1 * math.sin(a)
            r = r1 * math.cos(a)
            rings.append((p0 + axis * d, side, out, r if i < steps else 0.0, (r if i < steps else 0.0) * squash, col(d / length), weight))
    tube(rings, segs=segs, flip=True)


def ellipsoid(center, radii, color, weight, segs=16, rings_n=10):
    center = Vector(center)
    rings = []
    for i in range(rings_n + 1):
        a = math.pi * i / rings_n
        z = -math.cos(a)
        r = math.sin(a) if 0 < i < rings_n else 0.0
        p = center + Z * (z * radii[2])
        c = color(p) if callable(color) else color
        rings.append((p, X, Y, r * radii[0], r * radii[1], c, weight))
    tube(rings, segs=segs)


# ---- 頭 ---------------------------------------------------------------------
HEAD_C = Vector((0, 0, 0.725))
HEAD_R = Vector((0.212, 0.2, 0.198))


def head_point(lon, lat, rad=1.0):
    """頭の表面の点。lon 0 = 正面、+ は本人の左。lat 90 = てっぺん（度）"""
    lo, la = math.radians(lon), math.radians(lat)
    return HEAD_C + Vector(
        (
            HEAD_R.x * rad * math.cos(la) * math.sin(lo),
            -HEAD_R.y * rad * math.cos(la) * math.cos(lo),
            HEAD_R.z * rad * math.sin(la),
        )
    )


def head_out(lon, lat):
    return (head_point(lon, lat, 1.0) - HEAD_C).normalized()


def build_head():
    segs, rings_n = 40, 24
    rows = []
    for i in range(rings_n + 1):
        lat = 90 - 180 * i / rings_n
        if i in (0, rings_n):
            p = head_point(0, lat)
            rows.append([add_vert(p, SKIN, "head", (0.5, 0.5 + lat / 180))])
            continue
        row = []
        for s in range(segs):
            lon = -180 + 360 * s / segs
            p = head_point(lon, lat)
            # あごに向けて少しすぼめる
            d = max(0.0, -math.sin(math.radians(lat)))
            k = 1 - 0.16 * d * d
            p.x = HEAD_C.x + (p.x - HEAD_C.x) * k
            p.y = HEAD_C.y + (p.y - HEAD_C.y) * k
            u = min(1.0, max(0.0, 0.5 + lon / 180))
            row.append(add_vert(p, SKIN, "head", (u, 0.5 + lat / 180)))
        rows.append(row)
    for a, b in zip(rows, rows[1:]):
        for s in range(segs):
            s2 = (s + 1) % segs
            if len(a) == 1:
                faces.append(((a[0], b[s], b[s2]), MAT_FACE))
            elif len(b) == 1:
                faces.append(((a[s], b[0], a[s2]), MAT_FACE))
            else:
                faces.append(((a[s], b[s], b[s2], a[s2]), MAT_FACE))


def hair_color(t, tip, start=0.5, end=0.95):
    return mix(NAVY, tip, smooth(start, end, t))


def build_hair():
    # 頭をおおう髪（顔の前だけ開ける）
    segs, rings_n = 40, 20
    rows = []
    for i in range(rings_n + 1):
        lat = 90 - 180 * i / rings_n
        if i in (0, rings_n):
            rows.append([add_vert(head_point(0, lat, 1.085) + Y * 0.012, NAVY, "head")])
            continue
        row = []
        for s in range(segs):
            lon = -180 + 360 * s / segs
            p = head_point(lon, lat, 1.085) + Y * 0.012
            shade = mix(NAVY_DARK, NAVY, smooth(-60, 40, lat))
            row.append(add_vert(p, shade, "head"))
        rows.append(row)

    def keep(lon, lat):
        a = abs(lon)
        if a < 62:
            limit = 34
        elif a < 105:
            limit = 34 + (-80 - 34) * smooth(62, 105, a)
        else:
            limit = -80
        return lat > limit

    for i, (a, b) in enumerate(zip(rows, rows[1:])):
        lat = 90 - 180 * (i + 0.5) / rings_n
        for s in range(segs):
            s2 = (s + 1) % segs
            lon = -180 + 360 * (s + 0.5) / segs
            if not keep(lon, lat):
                continue
            if len(a) == 1:
                faces.append(((a[0], b[s], b[s2]), MAT_BODY))
            elif len(b) == 1:
                faces.append(((a[s], b[0], a[s2]), MAT_BODY))
            else:
                faces.append(((a[s], b[s], b[s2], a[s2]), MAT_BODY))

    # 前髪（lon, 毛先の lat, 流れ, 幅, 色）
    bangs = [
        (-58, -6, -10, 0.07, NAVY),
        (-40, 9, -6, 0.066, NAVY),
        (-23, 4, -4, 0.062, NAVY),
        (-6, -3, 3, 0.058, NAVY),
        (12, 6, 5, 0.064, ORANGE),
        (28, 2, 6, 0.06, ORANGE),
        (43, 10, 8, 0.064, NAVY),
        (60, -6, 10, 0.07, NAVY),
    ]
    for lon0, tip_lat, sweep, width, color in bangs:
        n = 9
        points, outs = [], []
        for i in range(n):
            t = i / (n - 1)
            lat = 80 + (tip_lat - 80) * t
            lon = lon0 * (0.35 + 0.65 * min(1.0, t * 1.6)) + sweep * t * t
            rad = 1.12 - 0.035 * t * t
            points.append(head_point(lon, lat, rad))
            outs.append(head_out(lon, lat))
        strand(
            points,
            outs,
            lambda t, w=width: w * (1 - t**2.6) * (0.35 + 0.65 * min(1.0, t * 2.2)),
            lambda t: 0.02 * (1 - t**3) + 0.004,
            lambda t, c=color: mix(c, c * 0.82, t) if c is NAVY else c,
            lambda t: "head",
        )

    # 横の髪（顔の横に下がる毛束）
    for sign in (-1, 1):
        for lon0, length, tip, width in ((78, 0.27, ORANGE, 0.06), (96, 0.33, TEAL, 0.065)):
            lon0 *= sign
            n = 12
            points, outs = [], []
            leave = head_point(lon0, -22, 1.1)
            for i in range(n):
                t = i / (n - 1)
                if t < 0.45:
                    k = t / 0.45
                    lat = 62 + (-22 - 62) * k
                    points.append(head_point(lon0, lat, 1.1))
                    outs.append(head_out(lon0, lat))
                else:
                    k = (t - 0.45) / 0.55
                    drop = leave - Z * (length * k)
                    drop.x += sign * 0.035 * math.sin(k * math.pi * 0.9)
                    drop.y += -0.02 * k
                    points.append(drop)
                    outs.append(Vector((sign * 0.9, -0.3, 0)).normalized())
            strand(
                points,
                outs,
                lambda t, w=width: w * (0.5 + 0.5 * min(1.0, t * 3)) * (1 - t**4),
                lambda t: 0.024 * (1 - t**4) + 0.004,
                lambda t, c=tip: hair_color(t, c, 0.55, 0.92),
                lambda t: {"head": 1 - 0.8 * smooth(0.45, 1, t), "hairSide": 0.8 * smooth(0.45, 1, t)},
            )

    # 後ろ髪（背中まで）
    back = [100, 118, 136, 154, 172, 190, 208, 226, 244, 262]
    tips = [TEAL, ORANGE, TEAL, ORANGE, TEAL, ORANGE, TEAL, ORANGE, TEAL, ORANGE]
    for lon0, tip in zip(back, tips):
        n = 14
        lo = math.radians(lon0)
        leave = head_point(lon0, -30, 1.1)
        spread = 1.0 + 0.25 * abs(math.sin(lo))
        end = Vector((math.sin(lo) * 0.25 * spread, 0.085 - math.cos(lo) * 0.17, 0.36 + 0.03 * abs(math.sin(lo * 2))))
        points, outs = [], []
        for i in range(n):
            t = i / (n - 1)
            if t < 0.4:
                k = t / 0.4
                lat = 48 + (-30 - 48) * k
                points.append(head_point(lon0, lat, 1.1))
                outs.append(head_out(lon0, lat))
            else:
                k = (t - 0.4) / 0.6
                ctrl = leave - Z * 0.14
                p = leave * (1 - k) ** 2 + ctrl * 2 * k * (1 - k) + end * k * k
                # 毛先を外へはねさせる
                p += Vector((math.sin(lo), -math.cos(lo), 0)) * (0.035 * k**3)
                points.append(p)
                outs.append(Vector((math.sin(lo), -math.cos(lo), 0.15)).normalized())
        strand(
            points,
            outs,
            lambda t: 0.078 * (0.45 + 0.55 * min(1.0, t * 3)) * (1 - t**5),
            lambda t: 0.03 * (1 - t**4) + 0.004,
            lambda t, c=tip: hair_color(t, c, 0.55, 0.9),
            lambda t: {"head": 1 - 0.85 * smooth(0.35, 1, t), "hairBack": 0.85 * smooth(0.35, 1, t)},
            segs=8,
        )

    # 内側の髪（すき間を埋める。色付きのインナーカラー）
    def inner_color(p):
        return mix(TEAL, NAVY_DARK, smooth(0.42, 0.62, p.z))

    ellipsoid((0, 0.09, 0.53), (0.19, 0.075, 0.17), inner_color, {"head": 0.5, "hairBack": 0.5}, segs=16, rings_n=8)

    # あほ毛
    n = 10
    points, outs = [], []
    base = head_point(0, 90, 1.07)
    for i in range(n):
        t = i / (n - 1)
        a = t * math.pi * 1.15
        p = base + Vector((0.075 * (1 - math.cos(a)) * 0.9, -0.01 * t, 0.085 * math.sin(a) + 0.045 * t))
        points.append(p)
        outs.append(Vector((0, -1, 0)))
    strand(
        points,
        outs,
        lambda t: 0.017 * (1 - t**2) + 0.002,
        lambda t: 0.012 * (1 - t**2) + 0.002,
        lambda t: NAVY,
        lambda t: {"head": 1 - smooth(0.0, 0.5, t), "ahoge": smooth(0.0, 0.5, t)},
        segs=6,
    )

    # 花の髪かざり（本人の左）
    center = head_point(72, 30, 1.16)
    out = head_out(72, 30)
    side = out.cross(Z).normalized()
    up = side.cross(out).normalized()
    for k in range(5):
        a = 2 * math.pi * k / 5
        petal = center + (side * math.cos(a) + up * math.sin(a)) * 0.022
        petal_rings = []
        for j in range(5):
            b = math.pi * j / 4
            r = 0.016 * math.sin(b)
            petal_rings.append((petal + out * (-0.008 * math.cos(b)), side, up, r, r, WHITE, "head"))
        tube(petal_rings, segs=8, flip=True)
    core = []
    for j in range(5):
        b = math.pi * j / 4
        r = 0.012 * math.sin(b)
        core.append((center + out * (0.004 - 0.01 * math.cos(b)), side, up, r, r, ORANGE, "head"))
    tube(core, segs=8, flip=True)


# ---- 体 ---------------------------------------------------------------------
def build_body():
    # 首
    limb((0, 0, 0.515), (0, 0, 0.575), 0.03, 0.03, SKIN, {"spine": 0.5, "head": 0.5}, cap0=False, cap1=False)

    # シャツ
    shirt = [
        (0.338, 0.104, "hips"),
        (0.37, 0.096, {"hips": 0.5, "spine": 0.5}),
        (0.42, 0.09, "spine"),
        (0.47, 0.088, "spine"),
        (0.505, 0.082, "spine"),
        (0.528, 0.064, "spine"),
        (0.54, 0.04, "spine"),
        (0.545, 0.0, "spine"),
    ]
    rings = []
    for z, r, w in shirt:
        shade = mix(SHIRT_SHADE, WHITE, smooth(0.34, 0.44, z))
        rings.append((Vector((0, 0, z)), X, Y, r, r * 0.8, shade, w))
    tube(rings, segs=20)

    # えり
    for sign in (-1, 1):
        collar = []
        for j in range(5):
            b = math.pi * j / 4
            r = math.sin(b)
            c = Vector((sign * 0.03, -0.05, 0.535)) + Vector((sign * 0.012, -0.004, -0.012)) * (-math.cos(b))
            collar.append((c, Vector((sign * 0.8, -0.6, 0)).normalized() * 1.0, Z, r * 0.026, r * 0.012, WHITE, "spine"))
        tube(collar, segs=8)

    # リボン（青緑のちょう結び + オレンジのたれ）
    knot = Vector((0, -0.07, 0.508))
    for sign in (-1, 1):
        bow = []
        for j in range(6):
            b = math.pi * j / 5
            r = math.sin(b) ** 0.7 if 0 < j < 5 else 0.0
            c = knot + Vector((sign * (0.004 + 0.026 * (1 - math.cos(b)) / 2 * 1.6), -0.004, 0.004 * math.sin(b)))
            bow.append((c, Y, Z, r * 0.01, r * (0.012 + 0.012 * j / 5), RIBBON, "spine"))
        tube(bow, segs=8, flip=sign > 0)
        tail = []
        for j in range(6):
            t = j / 5
            c = knot + Vector((sign * (0.006 + 0.012 * t), -0.006 + 0.004 * t, -0.012 - 0.07 * t))
            r = 0.0 if j in (0, 5) else 0.008
            tail.append((c, X, Y, r, r * 0.45, ORANGE, "spine"))
        tube(tail, segs=6, flip=True)
    ellipsoid(knot, (0.012, 0.01, 0.012), RIBBON, "spine", segs=8, rings_n=6)

    # ボタン
    for z in (0.47, 0.435, 0.4):
        ellipsoid((0, -0.0735 - (0.47 - z) * 0.02, z), (0.006, 0.004, 0.006), RIBBON, "spine", segs=6, rings_n=4)

    # スカート（ひだ付き）
    pleats = 14
    seg = pleats * 4

    def pleat(a, ri):
        k = (a / (2 * math.pi) * pleats) % 1.0
        wave = 1.0 if k < 0.5 else 0.9
        return 1 + (wave - 1) * min(1.0, ri / 3)

    def skirt_color(a):
        k = (a / (2 * math.pi) * pleats) % 1.0
        return SKIRT if k < 0.5 else SKIRT * 0.72

    skirt = [(0.392, 0.086), (0.37, 0.108), (0.34, 0.135), (0.305, 0.16), (0.268, 0.182)]
    rings = [(Vector((0, 0, z)), X, Y, r, r * 0.86, skirt_color, "hips") for z, r in skirt]
    tube(rings, segs=seg, mod=pleat)
    # スカートの内側（下からのぞいたときの底）
    rings = [
        (Vector((0, 0, 0.3)), X, Y, 0.158, 0.136, SKIRT * 0.5, "hips"),
        (Vector((0, 0, 0.3)), X, Y, 0.0, 0.0, SKIRT * 0.5, "hips"),
    ]
    tube(rings, segs=20, flip=True)

    for sign, side in ((1, "L"), (-1, "R")):
        # 腕
        shoulder = Vector((sign * 0.088, 0, 0.5))
        d = Vector((sign * math.sin(math.radians(24)), 0, -math.cos(math.radians(24))))
        elbow = shoulder + d * 0.105
        wrist = shoulder + d * 0.195
        limb(shoulder + d * 0.02, elbow, 0.027, 0.025, SKIN, f"armU.{side}")
        limb(elbow, wrist, 0.025, 0.022, SKIN, f"armL.{side}")
        ellipsoid(wrist + d * 0.022, (0.031, 0.031, 0.034), SKIN, f"armL.{side}", segs=10, rings_n=8)
        # そで
        side_v = d.cross(Y).normalized()
        sleeve = [
            (shoulder - d * 0.03, side_v, Y, 0.0, 0.0, WHITE, {"spine": 0.6, f"armU.{side}": 0.4}),
            (shoulder - d * 0.022, side_v, Y, 0.026, 0.026, WHITE, {"spine": 0.6, f"armU.{side}": 0.4}),
            (shoulder, side_v, Y, 0.04, 0.04, WHITE, f"armU.{side}"),
            (shoulder + d * 0.04, side_v, Y, 0.044, 0.044, WHITE, f"armU.{side}"),
            (shoulder + d * 0.078, side_v, Y, 0.047, 0.047, SHIRT_SHADE, f"armU.{side}"),
            (shoulder + d * 0.074, side_v, Y, 0.03, 0.03, SHIRT_SHADE * 0.8, f"armU.{side}"),
        ]
        tube(sleeve, segs=12, flip=sign < 0)

        # 足
        hip = Vector((sign * 0.05, 0, 0.3))
        knee = Vector((sign * 0.05, 0, 0.175))
        ankle = Vector((sign * 0.05, 0, 0.06))
        limb(hip, knee, 0.047, 0.04, SKIN, f"legU.{side}")

        def shin_color(t):
            return WHITE if t > 0.52 else SKIN

        limb(knee, ankle, 0.04, 0.036, shin_color, f"legL.{side}", cap1=False)
        # くつ下の折り返し
        cuff = [
            (Vector((sign * 0.05, 0, 0.122)), X, Y, 0.0405, 0.0405, WHITE, f"legL.{side}"),
            (Vector((sign * 0.05, 0, 0.118)), X, Y, 0.043, 0.043, WHITE, f"legL.{side}"),
            (Vector((sign * 0.05, 0, 0.1)), X, Y, 0.042, 0.042, WHITE, f"legL.{side}"),
            (Vector((sign * 0.05, 0, 0.096)), X, Y, 0.039, 0.039, WHITE, f"legL.{side}"),
        ]
        tube(cuff, segs=12)

        # くつ（白い底とつま先のスニーカー）
        shoe = [
            (0.0, -0.022, 0.0, 0.0),
            (0.0, -0.022, 0.04, 0.068),
            (0.014, -0.022, 0.047, 0.076),
            (0.03, -0.02, 0.046, 0.072),
            (0.048, -0.012, 0.042, 0.058),
            (0.064, -0.004, 0.04, 0.046),
            (0.074, 0.0, 0.039, 0.04),
            (0.07, 0.0, 0.03, 0.03),
        ]
        rings = []
        for z, y, w, th in shoe:
            def shoe_color(a, z=z):
                if z < 0.02:
                    return WHITE
                if math.sin(a) < -0.72 and z < 0.05:
                    return WHITE
                return SHOE

            rings.append((Vector((sign * 0.05, y, z)), X, Y, w, th, shoe_color, f"foot.{side}"))
        tube(rings, segs=14)


build_head()
build_hair()
build_body()

# ---- Blender のデータにする ---------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)

mesh = bpy.data.meshes.new("PictorChan")
mesh.from_pydata([tuple(v) for v in verts], [], [f for f, _ in faces])
mesh.update()
for poly, (_, mat) in zip(mesh.polygons, faces):
    poly.material_index = mat
    poly.use_smooth = True

uv_layer = mesh.uv_layers.new(name="UVMap")
color_layer = mesh.color_attributes.new(name="Color", type="FLOAT_COLOR", domain="CORNER")
for loop in mesh.loops:
    uv_layer.data[loop.index].uv = uvs[loop.vertex_index]
    c = colors[loop.vertex_index]
    color_layer.data[loop.index].color = (c.x, c.y, c.z, 1.0)
mesh.color_attributes.active_color = color_layer
mesh.color_attributes.render_color_index = 0

body_mat = bpy.data.materials.new("Body")
body_mat.use_nodes = True
body_mat.use_backface_culling = False
nodes, links = body_mat.node_tree.nodes, body_mat.node_tree.links
bsdf = nodes["Principled BSDF"]
attr = nodes.new("ShaderNodeVertexColor")
attr.layer_name = "Color"
links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 1.0

face_mat = bpy.data.materials.new("Face")
face_mat.use_nodes = True
nodes, links = face_mat.node_tree.nodes, face_mat.node_tree.links
bsdf = nodes["Principled BSDF"]
tex = nodes.new("ShaderNodeTexImage")
tex.image = bpy.data.images.load(FACE_PNG)
tex.extension = "EXTEND"
links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
bsdf.inputs["Roughness"].default_value = 1.0

mesh.materials.append(body_mat)
mesh.materials.append(face_mat)

obj = bpy.data.objects.new("PictorChan", mesh)
bpy.context.scene.collection.objects.link(obj)

# 向きがそろっていない面を直す
bpy.context.view_layer.objects.active = obj
obj.select_set(True)
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode="OBJECT")

# 骨（すべて真上向き）
BONES = {
    "root": ((0, 0, 0), None),
    "hips": ((0, 0, 0.31), "root"),
    "spine": ((0, 0, 0.39), "hips"),
    "head": ((0, 0, 0.55), "spine"),
    "hairBack": ((0, 0.09, 0.66), "head"),
    "hairSide": ((0, 0, 0.7), "head"),
    "ahoge": ((0, 0, 0.94), "head"),
    "armU.L": ((0.088, 0, 0.5), "spine"),
    "armL.L": ((0.088 + math.sin(math.radians(24)) * 0.105, 0, 0.5 - math.cos(math.radians(24)) * 0.105), "armU.L"),
    "armU.R": ((-0.088, 0, 0.5), "spine"),
    "armL.R": ((-0.088 - math.sin(math.radians(24)) * 0.105, 0, 0.5 - math.cos(math.radians(24)) * 0.105), "armU.R"),
    "legU.L": ((0.05, 0, 0.3), "hips"),
    "legL.L": ((0.05, 0, 0.175), "legU.L"),
    "foot.L": ((0.05, 0, 0.06), "legL.L"),
    "legU.R": ((-0.05, 0, 0.3), "hips"),
    "legL.R": ((-0.05, 0, 0.175), "legU.R"),
    "foot.R": ((-0.05, 0, 0.06), "legL.R"),
}
arm_data = bpy.data.armatures.new("Rig")
rig = bpy.data.objects.new("Rig", arm_data)
bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
for name, (head, parent) in BONES.items():
    bone = arm_data.edit_bones.new(name)
    bone.head = head
    bone.tail = (head[0], head[1], head[2] + 0.05)
    bone.roll = 0
    if parent:
        bone.parent = arm_data.edit_bones[parent]
bpy.ops.object.mode_set(mode="OBJECT")

groups = {name: obj.vertex_groups.new(name=name) for name in BONES}
for i, w in enumerate(weights):
    total = sum(w.values())
    for bone, value in w.items():
        if value > 0:
            groups[bone].add([i], value / total, "REPLACE")
obj.parent = rig
mod = obj.modifiers.new("Armature", "ARMATURE")
mod.object = rig

print("verts", len(verts), "faces", len(faces))

# ---- 確認用の絵 ---------------------------------------------------------------
if PREVIEW_DIR:
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 800
    scene.render.resolution_y = 1000
    scene.view_settings.view_transform = "Standard"
    world = bpy.data.worlds.new("W")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (0.75, 0.8, 0.9, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.9
    scene.world = world
    sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
    sun.data.energy = 2.0
    sun.rotation_euler = (math.radians(50), 0, math.radians(-30))
    scene.collection.objects.link(sun)
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 70
    cam = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    target = Vector((0, 0, 0.53))
    for name, angle, height in (("front", 0, 0.1), ("quarter", -35, 0.2), ("side", 90, 0.1), ("back", 150, 0.2)):
        a = math.radians(angle)
        pos = target + Vector((math.sin(a) * 2.6, -math.cos(a) * 2.6, height * 2.6))
        cam.location = pos
        cam.rotation_euler = (target - pos).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = f"{PREVIEW_DIR}/{name}.png"
        bpy.ops.render.render(write_still=True)

# ---- 書き出し -----------------------------------------------------------------
bpy.ops.object.select_all(action="DESELECT")
obj.select_set(True)
rig.select_set(True)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_skins=True,
    export_animations=False,
    export_vertex_color="ACTIVE",
    export_all_vertex_colors=False,
    export_apply=False,
    export_image_format="AUTO",
)
print("exported", OUT_GLB)
