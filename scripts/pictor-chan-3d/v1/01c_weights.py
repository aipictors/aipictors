"""頭と髪に付いている腕・手・指の骨の重みを外す (髪が手に引っぱられて伸びるのを直す)
blender -b work/base.blend -P 01c_weights.py -- [head|hair]   (上書き保存)"""
import bpy, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from facelib import classify
MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv and len(sys.argv) > sys.argv.index("--") + 1 else "hair"
body = bpy.data.objects["Body"]; me = body.data
img = bpy.data.images["PictorChan_Body"]; tw, th = img.size
tex = np.empty(tw * th * 4, dtype=np.float32); img.pixels.foreach_get(tex); tex = tex.reshape(th, tw, 4)
uv = np.empty(len(me.loops) * 2, dtype=np.float32); me.uv_layers[0].data.foreach_get("uv", uv); uv = uv.reshape(-1, 2)
lv = np.array([l.vertex_index for l in me.loops])
col = tex[np.clip((uv[:, 1] * th).astype(int), 0, th - 1), np.clip((uv[:, 0] * tw).astype(int), 0, tw - 1), :3]
skin, hairc = classify(col.astype(np.float64))
nv = len(me.vertices)
votes = np.zeros(nv); tot = np.zeros(nv)
np.add.at(votes, lv, hairc); np.add.at(tot, lv, 1)
is_hair = votes / np.maximum(tot, 1) > 0.5
names = [g.name for g in body.vertex_groups]
ARM = {i for i, n in enumerate(names) if any(k in n for k in ("Upperarm", "Forearm", "Hand", "Pinky", "Ring", "Mid", "Index", "Thumb", "Elbow"))}
head = body.vertex_groups["Head"]
n_fix = n_only = 0; moved = 0.0
def sstep(a, b, x):
    t = min(1.0, max(0.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
for v in me.vertices:
    z = v.co.z; ax = abs(v.co.x)
    # 頭 (あごより上) では腕の重みを 0 に。境目はなだらかに。hair の時は腕の横の髪も
    f = sstep(0.70, 0.78, z)
    if MODE == "hair" and is_hair[v.index] and z > 0.47 and ax > 0.09: f = 1.0
    if f <= 0: continue
    arm = [(g.group, g.weight) for g in v.groups if g.group in ARM and g.weight > 0]
    if not arm: continue
    rest = [(g.group, g.weight) for g in v.groups if g.group not in ARM and g.weight > 0]
    new = [(gi, w * (1 - f)) for gi, w in arm] + rest
    s_ = sum(w for _, w in new)
    if s_ < 1e-4:
        for gi, _ in arm: body.vertex_groups[gi].remove([v.index])
        head.add([v.index], 1.0, "REPLACE"); n_only += 1
    else:
        for gi, w in new:
            if w / s_ < 1e-5: body.vertex_groups[gi].remove([v.index])
            else: body.vertex_groups[gi].add([v.index], w / s_, "REPLACE")
    n_fix += 1; moved += sum(w for _, w in arm) * f
print("WEIGHTS fixed verts", n_fix, "of which had only arm weights", n_only, "avg removed weight", round(moved / max(n_fix, 1), 3), "mode", MODE)
bpy.ops.wm.save_mainfile()
