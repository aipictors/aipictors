"""顔の肌に付いている紺色の汚れ (右目の内側、オレンジの前髪のすぐ横) を肌色で塗り直す
blender -b work/base.blend -P 01b_texfix.py -- work/face_maps.npz   (02 を先に一度走らせておく。上書き保存)"""
import bpy, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
from facelib import *
argv = sys.argv[sys.argv.index("--") + 1 :]
D = np.load(argv[0])
rgb, depth, tri = D["rgb"].astype(np.float64), D["depth"].astype(np.float64), D["tri"]
X0, X1, Z0, Z1, PX = D["win"]
RECT = (340, 178, 392, 232)       # 汚れのある範囲 (投影図の画素)
x0, y0, x1, y1 = RECT; m = 30
sl = np.s_[y0 - m:y1 + m, x0 - m:x1 + m]
c, d, t = rgb[sl], depth[sl], tri[sl]
skin, hairc = classify(c)
# 肌の面 (まわりの肌の奥行きを埋めたもの) と同じ高さにある紺色 = 汚れ
surf = inpaint(d, erode(skin, 2), 200)
flush = np.abs(surf - d) < 0.0015
inner = np.zeros_like(skin); inner[m:-m, m:-m] = True
r, g, b = c[..., 0], c[..., 1], c[..., 2]
smear = inner & flush & ~skin & (b > r - 0.05) & (c.max(-1) < 0.75)
smear = dilate(smear, 3) & flush & inner & ~((r > 0.7) & (r - b > 0.45))
fill = inpaint(c, erode(skin, 2) & ~dilate(smear, 2), 200)
print("SMEAR px", int(smear.sum()))
body = bpy.data.objects["Body"]; me = body.data
me.calc_loop_triangles()
verts = np.array([v.co for v in me.vertices])
uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers[0].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
img = bpy.data.images["PictorChan_Body"]; tw, th = img.size
tex = np.empty(tw * th * 4, dtype=np.float32); img.pixels.foreach_get(tex); tex = tex.reshape(th, tw, 4)
n = 0; S = 4
ys, xs = np.nonzero(smear)
for j, i in zip(ys, xs):
    lt = me.loop_triangles[int(t[j, i])]
    a, bb, cc = verts[list(lt.vertices)]
    # 画素の中を細かく刻んで、テクスチャに抜けが出ないようにする
    for sy in range(S):
        for sx in range(S):
            px = x0 - m + i + (sx + 0.5) / S; py = y0 - m + j + (sy + 0.5) / S
            p = np.array([X0 + px * PX, 0, Z1 - py * PX])
            # 正面からの投影なので x,z だけで重心座標を出す
            v0 = (bb - a)[[0, 2]]; v1 = (cc - a)[[0, 2]]; v2 = (p - a)[[0, 2]]
            den = v0[0] * v1[1] - v1[0] * v0[1]
            if abs(den) < 1e-14: continue
            bv = (v2[0] * v1[1] - v1[0] * v2[1]) / den; bw = (v0[0] * v2[1] - v2[0] * v0[1]) / den; bu = 1 - bv - bw
            l = lt.loops
            u = uv[l[0]] * bu + uv[l[1]] * bv + uv[l[2]] * bw
            tx = int(u[0] * tw); ty = int(u[1] * th)
            for oy in (-1, 0, 1):
                for ox in (-1, 0, 1):
                    xx_, yy_ = tx + ox, ty + oy
                    if 0 <= xx_ < tw and 0 <= yy_ < th:
                        tex[yy_, xx_, :3] = fill[j, i]; n += 1
print("TEXELS written", n)
img.pixels.foreach_set(tex.ravel())
img.update()
img.pack()
bpy.ops.wm.save_mainfile()
