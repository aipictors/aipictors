"""顔の正面からの投影図 (色・奥行き・法線・三角形番号) を作る
blender -b base.blend -P 02_face_maps.py -- <out.npz> <preview.png>"""
import bpy, sys, os
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
X0, X1, Z0, Z1, PX = -0.22, 0.22, 0.60, 0.92, 0.0005
body = bpy.data.objects["Body"]; me = body.data
me.calc_loop_triangles()
verts = np.array([v.co for v in me.vertices])
tris = np.array([t.vertices[:] for t in me.loop_triangles])
tloops = np.array([t.loops[:] for t in me.loop_triangles])
cn = np.array([c.vector[:] for c in me.corner_normals])
uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers[0].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
bvh = BVHTree.FromPolygons([Vector(v) for v in verts], [tuple(t) for t in tris])
img = bpy.data.images["PictorChan_Body"]; tw, th = img.size
tex = np.empty(tw * th * 4, dtype=np.float32); img.pixels.foreach_get(tex); tex = tex.reshape(th, tw, 4)
W = int(round((X1 - X0) / PX)); H = int(round((Z1 - Z0) / PX))
rgb = np.zeros((H, W, 3), np.float32); depth = np.full((H, W), np.nan, np.float32); tri = np.full((H, W), -1, np.int32); nor = np.zeros((H, W, 3), np.float32)
d = Vector((0, 1, 0))
for j in range(H):
    z = Z1 - (j + 0.5) * PX
    for i in range(W):
        x = X0 + (i + 0.5) * PX
        loc, n, idx, dist = bvh.ray_cast(Vector((x, -2, z)), d)
        if loc is None: continue
        a, b, c = verts[tris[idx]]
        v0, v1, v2 = b - a, c - a, np.array(loc) - a
        d00, d01, d11, d20, d21 = v0 @ v0, v0 @ v1, v1 @ v1, v2 @ v0, v2 @ v1
        den = d00 * d11 - d01 * d01
        if abs(den) < 1e-20: continue
        bv = (d11 * d20 - d01 * d21) / den; bw = (d00 * d21 - d01 * d20) / den; bu = 1 - bv - bw
        l = tloops[idx]
        u = uv[l[0]] * bu + uv[l[1]] * bv + uv[l[2]] * bw
        # bilinear
        fx = u[0] * tw - 0.5; fy = u[1] * th - 0.5
        x0 = int(np.floor(fx)); y0 = int(np.floor(fy)); ax = fx - x0; ay = fy - y0
        x0c, x1c = np.clip([x0, x0 + 1], 0, tw - 1); y0c, y1c = np.clip([y0, y0 + 1], 0, th - 1)
        col = (tex[y0c, x0c, :3] * (1 - ax) + tex[y0c, x1c, :3] * ax) * (1 - ay) + (tex[y1c, x0c, :3] * (1 - ax) + tex[y1c, x1c, :3] * ax) * ay
        rgb[j, i] = col; depth[j, i] = loc.y; tri[j, i] = idx; nor[j, i] = cn[l[0]] * bu + cn[l[1]] * bv + cn[l[2]] * bw
np.savez_compressed(argv[0], rgb=rgb, depth=depth, tri=tri, nor=nor, win=np.array([X0, X1, Z0, Z1, PX]))
save_png(rgb, argv[1])
dm = np.nan_to_num(depth, nan=np.nanmax(depth)); dn = (dm - dm.min()) / (dm.max() - dm.min())
save_png(np.stack([1 - dn] * 3, axis=2) ** 3, argv[1].replace(".png", "_depth.png"))
print("DONE", W, H, "depth range", np.nanmin(depth), np.nanmax(depth))
