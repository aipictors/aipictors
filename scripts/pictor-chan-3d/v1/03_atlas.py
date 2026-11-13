"""顔の上にかぶせる板 (まぶた・口) の形と絵を作る
blender -b -P 03_atlas.py -- work/face_maps.npz work/atlas.png work/patches.npz <preview.png>"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
from facelib import *
argv = sys.argv[sys.argv.index("--") + 1 :]
D = np.load(argv[0])
rgb, depth, snor = D["rgb"].astype(np.float64), D["depth"].astype(np.float64), D["nor"].astype(np.float64)
X0, X1, Z0, Z1, PX = D["win"]
H, W = depth.shape
ATLAS, CELL, SS = 1024, 256, 3
GRID = 10            # 板の格子の刻み (px = 0.5mm)
CLEAR = 0.0005       # 肌からの浮き (m)
LIFT_MAX = 0.035     # まつ毛など、板でおおう出っぱりの上限 (m)
LASH = np.array([0.125, 0.10, 0.12])
yy, xx = np.mgrid[0:H, 0:W].astype(np.float64)

REGIONS = {
    "eyeR": dict(rect=(140, 150, 360, 370), ell=(255, 260, 100, 100)),   # キャラの右目 (絵では左)
    "eyeL": dict(rect=(508, 150, 728, 370), ell=(618, 260, 107, 100)),
    "mouth": dict(rect=(325, 368, 545, 533), ell=(435, 446, 80, 46)),
}
EYES = {"eyeR": dict(cx=255, cy=268, hw=90, o=-1), "eyeL": dict(cx=618, cy=268, hw=97, o=1)}
MX = 435

skin, hairc = classify(rgb)
clean = erode(skin, 3) & ~np.isnan(depth)

# ---------- 絵を描く道具 (距離で描く)
def seg_dist(px, py, pts, radii):
    """折れ線までの距離 - 太さ (負なら中)"""
    best = np.full(px.shape, 1e9)
    for (a, b, ra, rb) in zip(pts[:-1], pts[1:], radii[:-1], radii[1:]):
        ab = b - a; l2 = ab @ ab
        t = np.clip(((px - a[0]) * ab[0] + (py - a[1]) * ab[1]) / max(l2, 1e-9), 0, 1)
        d = np.hypot(px - (a[0] + t * ab[0]), py - (a[1] + t * ab[1])) - (ra + t * (rb - ra))
        best = np.minimum(best, d)
    return best

def bez(p0, p1, p2, n=24):
    t = np.linspace(0, 1, n)[:, None]
    return (1 - t) ** 2 * np.array(p0) + 2 * (1 - t) * t * np.array(p1) + t ** 2 * np.array(p2)

def taper(n, r_mid, r0, r1, peak=0.5):
    t = np.linspace(0, 1, n)
    return np.where(t < peak, r0 + (r_mid - r0) * np.sin(t / peak * np.pi / 2), r1 + (r_mid - r1) * np.sin((1 - t) / (1 - peak) * np.pi / 2))

class Canvas:
    def __init__(self, rect, cell_h):
        self.x0, self.y0, self.x1, self.y1 = rect
        self.s = CELL / (self.x1 - self.x0)
        self.w = CELL * SS; self.h = cell_h * SS
        gy, gx = np.mgrid[0:self.h, 0:self.w].astype(np.float64)
        self.px = self.x0 + (gx + 0.5) / (self.s * SS); self.py = self.y0 + (gy + 0.5) / (self.s * SS)
        self.col = np.zeros((self.h, self.w, 3)); self.a = np.zeros((self.h, self.w))
        self.aa = 0.6 / (self.s * SS) * 1.5
    def paint(self, d, color):
        cov = 1 - smoothstep(-self.aa, self.aa, d)
        color = np.broadcast_to(np.asarray(color, dtype=np.float64), self.col.shape) if np.ndim(color) == 1 else color
        self.col = self.col * (1 - cov[..., None]) + color * cov[..., None]
        self.a = self.a + cov * (1 - self.a)
    def stroke(self, pts, radii, color=LASH):
        self.paint(seg_dist(self.px, self.py, np.asarray(pts, dtype=np.float64), radii), color)
    def down(self):
        c = (self.col * self.a[..., None]).reshape(self.h // SS, SS, self.w // SS, SS, 3).mean((1, 3))
        a = self.a.reshape(self.h // SS, SS, self.w // SS, SS).mean((1, 3))
        return np.where(a[..., None] > 1e-6, c / np.maximum(a, 1e-6)[..., None], 0), a

def draw_eye(style, cv, e):
    cx, cy, hw, o = e["cx"], e["cy"], e["hw"], e["o"]
    P = lambda u, dy: (cx + o * u * hw, cy + dy)       # u: -1 内側(鼻) … +1 外側
    if style == "Blink":
        pts = bez(P(-0.80, 12), P(0.02, 50), P(0.90, 10)); cv.stroke(pts, taper(len(pts), 4.6, 1.6, 3.2, 0.55))
        for u, dy, du, ddy, r in ((0.90, 10, 0.16, 9, 2.8), (0.62, 26, 0.13, 13, 2.4), (0.30, 33, 0.07, 12, 2.0)):
            cv.stroke([P(u, dy), P(u + du, dy + ddy)], [r, 0.5])
    elif style == "Joy":
        pts = bez(P(-0.80, 34), P(0.0, -44), P(0.86, 36)); cv.stroke(pts, taper(len(pts), 5.4, 2.0, 2.4, 0.5))
    elif style == "Fun":
        v = P(-0.50, 10)
        for dy in (-0.52, 0.52):
            pts = np.linspace(v, P(0.72, 10 + dy * hw), 8); cv.stroke(pts, np.linspace(4.6, 2.6, 8))
    elif style == "Sorrow":
        pts = bez(P(-0.78, 4), P(0.15, 40), P(0.88, 38)); cv.stroke(pts, taper(len(pts), 4.4, 1.6, 2.6, 0.6))
        cv.stroke([P(0.88, 38), P(1.02, 47)], [2.4, 0.5])

def ellipse_d(px, py, cx, cy, rx, ry):
    k = np.hypot((px - cx) / rx, (py - cy) / ry)
    return (k - 1) * min(rx, ry)

def draw_mouth(style, cv):
    line = np.array([0.60, 0.25, 0.22])
    if style == "MouthClosed":
        pts = bez((MX - 30, 437), (MX, 458), (MX + 30, 437)); cv.stroke(pts, taper(len(pts), 2.5, 1.2, 1.2), line)
    elif style == "Sorrow":
        pts = bez((MX - 14, 453), (MX, 439), (MX + 14, 453)); cv.stroke(pts, taper(len(pts), 2.3, 1.2, 1.2), line)
    elif style == "Surprised":
        d = ellipse_d(cv.px, cv.py, MX, 449, 10.5, 13.5)
        cv.paint(d, np.array([0.50, 0.19, 0.17])); cv.paint(d + 1.7, np.array([0.74, 0.31, 0.27]))
    elif style == "MouthOpen":
        top = 413 + 5 * (1 - ((cv.px - MX) / 66) ** 2)          # 上の線は少しだけたわむ
        d = np.maximum(ellipse_d(cv.px, cv.py, MX, 414, 66, 73), (top - cv.py))
        d = d - 2.0                                               # 角を少し丸く
        cv.paint(d, np.array([0.56, 0.21, 0.19]))
        t = np.clip((cv.py - 414) / 70, 0, 1)[..., None]
        inner = np.array([0.70, 0.27, 0.24]) * (1 - t) + np.array([0.84, 0.39, 0.33]) * t
        cv.paint(d + 1.8, inner)
        dt = np.maximum(ellipse_d(cv.px, cv.py, MX, 492, 40, 30), d + 1.8)
        cv.paint(dt, np.array([0.95, 0.56, 0.50]))

# ---------- 領域ごとの下ごしらえ: なめらかな肌の面・肌色・髪
def prep(name):
    R = REGIONS[name]; x0, y0, x1, y1 = R["rect"]; m = 50
    wx0, wy0, wx1, wy1 = max(0, x0 - m), max(0, y0 - m), min(W, x1 + m), min(H, y1 + m)
    sl = np.s_[wy0:wy1, wx0:wx1]
    d, c, k, hc = depth[sl], rgb[sl], clean[sl], hairc[sl]
    gx, gy = xx[sl], yy[sl]
    ex, ey, erx, ery = R["ell"]
    ell = ((gx - ex) / erx) ** 2 + ((gy - ey) / ery) ** 2 < 1
    # 肌の面: 2次式 + 残りをなめらかに埋める
    u = (gx - gx.mean()) / 100; v = (gy - gy.mean()) / 100
    A = np.stack([np.ones_like(u), u, v, u * u, u * v, v * v], -1)
    kk = k & ~ell
    for _ in range(5):                                      # 耳や首など、顔の面でない肌色を外しながら合わせる
        coef, *_ = np.linalg.lstsq(A[kk], d[kk], rcond=None)
        poly = A @ coef
        kk = kk & (np.abs(np.nan_to_num(d - poly, nan=1.0)) < 0.004)
    res = inpaint(np.where(kk, d - poly, 0), kk, 150)
    surf = poly + res
    elev = np.nan_to_num(surf - d, nan=-1.0)             # + = 肌の面より手前
    hair = hc & (elev > -0.002)
    # まつ毛の青みがかった暗い所は髪ではない: 目の中の暗い所から、暗い画素づたいに広げて外す
    darkpix = (c.max(-1) < 0.30) & ~np.isnan(d)
    lash = darkpix & ~hc & ell
    for _ in range(80):
        lash = dilate(lash, 1) & darkpix
    print("  lash px taken back from hair", int((hair & lash).sum()))
    hair = hair & ~lash
    hair = dilate(erode(hair, 1), 1)
    # 肌色: 肌だけを残して埋める
    known = k & ~ell & ~dilate(hair, 2)
    fill = inpaint(c, known, 200)
    fill = np.where(known[..., None], fill, blur(fill, 3.0))   # 埋めた所はさらになだらかに
    nfield = blur(inpaint(snor[sl], known, 200), 2.0)
    # 顔のうち板で隠したい所 (目・口そのもの)
    feat = ~skin[sl] & ~hair & ~np.isnan(d)
    inner = np.zeros_like(feat); inner[y0 - wy0 + 6:y1 - wy0 - 6, x0 - wx0 + 6:x1 - wx0 - 6] = True
    core = ell | (dilate(ell, 14) & feat)
    F = dilate(core, 7)
    off = (elev < -0.004) & ~dilate(core, 10)             # あごの下など、顔の面でない所
    dk = (c.max(-1) < 0.3) & ~hair & ~np.isnan(d)
    if dk.any(): print("  dark elev mm pct 5/50/90/99", (np.percentile(elev[dk], [5, 50, 90, 99]) * 1000).round(2))
    print("PREP", name, "fit rms mm", round(float(np.sqrt(((d - poly)[kk] ** 2).mean()) * 1000), 3), "hair px", int(hair.sum()), "core px", int(core.sum()), "off px", int(off.sum()))
    return dict(sl=(wx0, wy0, wx1, wy1), nfield=nfield, surf=surf, fill=fill, hair=hair, F=F, off=off, d=d, elev=elev)

PREP = {n: prep(n) for n in REGIONS}

def crop(P, arr, rect):
    wx0, wy0, _, _ = P["sl"]; x0, y0, x1, y1 = rect
    return arr[y0 - wy0:y1 - wy0, x0 - wx0:x1 - wx0]

def resize(a, h, w):
    """双一次で拡大"""
    sh, sw = a.shape[:2]
    fy = (np.arange(h) + 0.5) * sh / h - 0.5; fx = (np.arange(w) + 0.5) * sw / w - 0.5
    y0 = np.clip(np.floor(fy).astype(int), 0, sh - 1); y1 = np.clip(y0 + 1, 0, sh - 1); ay = np.clip(fy - y0, 0, 1)
    x0 = np.clip(np.floor(fx).astype(int), 0, sw - 1); x1 = np.clip(x0 + 1, 0, sw - 1); ax = np.clip(fx - x0, 0, 1)
    if a.ndim == 3: ay = ay[:, None, None]; ax = ax[None, :, None]
    else: ay = ay[:, None]; ax = ax[None, :]
    return (a[y0][:, x0] * (1 - ax) + a[y0][:, x1] * ax) * (1 - ay) + (a[y1][:, x0] * (1 - ax) + a[y1][:, x1] * ax) * ay

# 板の一覧: (形の名前, 領域, 絵の種類, マス目, 重ね順)
CELLS = [("Blink", "eyeR"), ("Blink", "eyeL"), ("Joy", "eyeR"), ("Joy", "eyeL"),
         ("Fun", "eyeR"), ("Fun", "eyeL"), ("Sorrow", "eyeR"), ("Sorrow", "eyeL"),
         ("Sorrow", "mouth"), ("Surprised", "mouth"), ("MouthClosed", "mouth"), ("MouthOpen", "mouth")]
PATCHES = [("Blink", 0, 0), ("Blink", 1, 0), ("Blink_R", 0, 1), ("Blink_L", 1, 1), ("Joy", 2, 3), ("Joy", 3, 3),
           ("Fun", 4, 4), ("Fun", 5, 4), ("Sorrow", 6, 2), ("Sorrow", 7, 2), ("Sorrow", 8, 1),
           ("Surprised", 9, 2), ("MouthClosed", 10, 0), ("MouthOpen", 11, 3)]

atlas = np.zeros((ATLAS, ATLAS, 4))
cell_alpha = {}; cell_rgb = {}; cell_anoh = {}; cell_col = {}
for ci, (style, reg) in enumerate(CELLS):
    P = PREP[reg]; rect = REGIONS[reg]["rect"]; x0, y0, x1, y1 = rect
    ch = int(round(CELL * (y1 - y0) / (x1 - x0)))
    cv = Canvas(rect, ch)
    if reg == "mouth": draw_mouth(style, cv)
    else: draw_eye(style, cv, EYES[reg])
    fcol, fa = cv.down()
    F = crop(P, P["F"], rect); hair = crop(P, P["hair"], rect); off = crop(P, P["off"], rect)
    # 描いた線の下は必ず板がある
    fa_map = resize(fa, y1 - y0, x1 - x0) > 0.02
    F2 = F | dilate(fa_map, 5)
    a = 1 - smoothstep(0, 11, dist_to_mask(F2, 14))
    a *= 1 - np.clip(blur(dilate(off, 2).astype(float), 1.5) * 2, 0, 1)
    edge = np.ones_like(a); edge[:2] = 0; edge[-2:] = 0; edge[:, :2] = 0; edge[:, -2:] = 0
    cell_anoh[ci] = a * edge
    base = resize(crop(P, P["fill"], rect), ch, CELL)
    cell_col[ci] = (base * (1 - fa[..., None]) + fcol * fa[..., None], ch)
# ---------- 板の形
out = {}
for pi, (key, ci, layer) in enumerate(PATCHES):
    style, reg = CELLS[ci]; P = PREP[reg]; rect = REGIONS[reg]["rect"]; x0, y0, x1, y1 = rect
    surf = crop(P, P["surf"], rect); d = crop(P, P["d"], rect); hair = crop(P, P["hair"], rect)
    valid = ~dilate(hair, 3) & ~np.isnan(d) & (surf - d < LIFT_MAX)   # 髪など大きく出ている物は別扱い (板はその下にもぐる)
    env = np.where(valid, np.minimum(surf, d), surf)
    lift = surf - env
    for _ in range(8):
        u, dn, l, r = shift_stack(lift); lift = np.maximum.reduce([lift, u, dn, l, r])
    lid = surf - blur(lift, 8.0)
    nx, ny = (x1 - x0) // GRID + 1, (y1 - y0) // GRID + 1
    gxs = np.minimum(np.arange(nx) * GRID, x1 - x0 - 1); gys = np.minimum(np.arange(ny) * GRID, y1 - y0 - 1)
    node = lid[np.ix_(gys, gxs)] - CLEAR
    need = (cell_anoh[ci] > 0.003)
    for it in range(6):
        # 格子を双一次で戻して、実際の面より手前にあるか確かめる
        fy = np.clip(np.arange(y1 - y0) / GRID, 0, ny - 1 - 1e-6); fx = np.clip(np.arange(x1 - x0) / GRID, 0, nx - 1 - 1e-6)
        iy = fy.astype(int); ix = fx.astype(int); ty = (fy - iy)[:, None]; tx = (fx - ix)[None, :]
        rec = (node[np.ix_(iy, ix)] * (1 - tx) + node[np.ix_(iy, ix + 1)] * tx) * (1 - ty) + (node[np.ix_(iy + 1, ix)] * (1 - tx) + node[np.ix_(iy + 1, ix + 1)] * tx) * ty
        viol = np.where(need, rec - (env - CLEAR * 0.8), -1)
        worst = viol.max()
        if worst <= 0: break
        vmax = np.zeros_like(node)
        for j in range(ny):
            for i in range(nx):
                blk = viol[max(0, gys[j] - GRID):gys[j] + GRID + 1, max(0, gxs[i] - GRID):gxs[i] + GRID + 1]
                vmax[j, i] = max(0, blk.max()) if blk.size else 0
        node -= blur(vmax, 0.8) * 1.3 + (vmax > 0) * 0.00005
    if ci not in cell_alpha:
        # 髪が板より手前に十分出ていない所だけ透明にする (十分出ている所は髪が自然に隠す)
        P_d = np.where(np.isnan(d), 1e9, d)
        cut = hair & (P_d > rec - 0.0011)
        cut = blur(cut.astype(float), 1.2) > 0.35
        a = cell_anoh[ci] * (1 - np.clip(blur(cut.astype(float), 0.6) * 1.6, 0, 1))
        cell_alpha[ci] = a
        col, ch = cell_col[ci]
        A = np.clip(resize(a, ch, CELL), 0, 1)
        ax, ay = (ci % 4) * CELL, (ci // 4) * CELL
        atlas[ay:ay + ch, ax:ax + CELL, :3] = col; atlas[ay:ay + ch, ax:ax + CELL, 3] = A
        cell_rgb[ci] = (col, A, ch)
    a = cell_alpha[ci]
    node -= layer * 0.00012
    quads = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            blk = a[max(0, gys[j] - 1):gys[j + 1] + 2, max(0, gxs[i] - 1):gxs[i + 1] + 2]
            if blk.max() > 0.003: quads.append((j * nx + i, j * nx + i + 1, (j + 1) * nx + i + 1, (j + 1) * nx + i))
    used = sorted({v for q in quads for v in q}); remap = {v: n for n, v in enumerate(used)}
    jj, ii = np.divmod(np.array(used), nx)
    px = x0 + gxs[ii] + 0.5; py = y0 + gys[jj] + 0.5
    pos = np.stack([X0 + px * PX, node[jj, ii], Z1 - py * PX], 1)
    s = CELL / (x1 - x0)
    uv = np.stack([((ci % 4) * CELL + (px - x0) * s) / ATLAS, 1 - ((ci // 4) * CELL + (py - y0) * s) / ATLAS], 1)
    nrm = crop(P, P["nfield"], rect)[gys[jj], gxs[ii]]     # まわりの肌の法線をなめらかに延ばしたもの (光の当たり方を肌に合わせる)
    out[f"nrm{pi}"] = nrm / np.linalg.norm(nrm, axis=1, keepdims=True)
    out[f"pos{pi}"] = pos; out[f"uv{pi}"] = uv; out[f"quads{pi}"] = np.array([[remap[v] for v in q] for q in quads])
    print("PATCH", pi, key, style, reg, "verts", len(used), "quads", len(quads), "worst viol mm", round(float(worst) * 1000, 3), "max lift mm", round(float((lid[np.ix_(gys, gxs)] - node).max() * 1000), 2))
# 透明な所にも近い色を入れておく (にじみ対策)
known = atlas[..., 3] > 0.02
atlas[..., :3] = inpaint(atlas[..., :3], known, 30)
save_png(atlas, argv[1])

out["keys"] = np.array([p[0] for p in PATCHES]); out["cells"] = np.array([p[1] for p in PATCHES])
np.savez_compressed(argv[2], **out)

# ---------- 正面からの見え方の下見
def compose(cells):
    im = rgb.copy()
    for ci in cells:
        style, reg = CELLS[ci]; x0, y0, x1, y1 = REGIONS[reg]["rect"]; col, A, ch = cell_rgb[ci]
        # アトラスの解像度から戻す
        sh = y1 - y0; sw = x1 - x0
        c2 = resize(col, sh, sw); a2 = resize(A, sh, sw)[..., None]
        im[y0:y1, x0:x1] = im[y0:y1, x0:x1] * (1 - a2) + c2 * a2
    return im[110:560, 90:790]
EXP = {"Neutral": [], "Blink": [0, 1], "Blink_L": [1], "Blink_R": [0], "Joy": [2, 3], "Fun": [4, 5], "Sorrow": [6, 7, 8], "Surprised": [9], "MouthClosed": [10], "MouthOpen": [11]}
tiles = [compose(c) for c in EXP.values()]
h, w = tiles[0].shape[:2]
for n in range(3):
    sheet = np.ones((h * 2 + 6, w * 2 + 6, 3))
    for i, t in enumerate(tiles[n * 4:n * 4 + 4]):
        y = (i // 2) * (h + 6); x = (i % 2) * (w + 6); sheet[y:y + h, x:x + w] = t
    save_png(sheet, argv[3].replace(".png", f"{n}.png"))
print("SHEET order", list(EXP))
