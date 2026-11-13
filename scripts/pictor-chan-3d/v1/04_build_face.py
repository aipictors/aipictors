"""表情用の板 (Face) を作り、シェイプキーを付ける
blender -b work/base.blend -P 04_build_face.py -- work/patches.npz work/atlas.png work/model.blend"""
import bpy, sys, os
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
P = np.load(argv[0]); ATLAS = os.path.abspath(argv[1]); OUT = argv[2]
KEYS = ["Blink", "Blink_L", "Blink_R", "Joy", "Fun", "Sorrow", "Surprised", "MouthClosed", "MouthOpen"]
rig = bpy.data.objects["PictorChan"]; body = bpy.data.objects["Body"]
bm = body.data
bvh = BVHTree.FromObject(body, bpy.context.evaluated_depsgraph_get())

# --- しまっておく場所: 頭の中で、表面からいちばん遠い点
def inside(p):
    for d in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0.3, 0.2, 0.93)):
        n = 0; o = Vector(p); d = Vector(d).normalized()
        while True:
            loc, _, _, _ = bvh.ray_cast(o, d)
            if loc is None: break
            n += 1; o = loc + d * 1e-5
        if n % 2 == 0: return False
    return True
best = None
for x in np.linspace(-0.06, 0.06, 5):
    for y in np.linspace(-0.02, 0.2, 12):
        for z in np.linspace(0.74, 1.02, 15):
            p = Vector((x, y, z)); dist = bvh.find_nearest(p)[3]
            if (best is None or dist > best[0]) and inside(p): best = (dist, p)
clear, store = best
print("STORE", tuple(round(v, 3) for v in store), "clearance", round(clear, 4))

pos, uvs, quads, owner, nrms = [], [], [], [], []
for pi, key in enumerate(P["keys"]):
    off = len(pos)
    pos += [Vector(p) for p in P[f"pos{pi}"]]; uvs += list(P[f"uv{pi}"]); owner += [pi] * len(P[f"pos{pi}"])
    nrms += [tuple(n) for n in P[f"nrm{pi}"]]
    quads += [tuple(int(v) + off for v in q) for q in P[f"quads{pi}"]]
owner = np.array(owner)
shown = np.array(pos)
basis = shown.copy()
for pi in range(len(P["keys"])):
    m = owner == pi; c = shown[m].mean(0); r = np.linalg.norm(shown[m] - c, axis=1).max()
    k = min(0.3, clear * 0.55 / r)
    basis[m] = np.array(store) + (shown[m] - c) * k
    print("PATCH", pi, P["keys"][pi], "radius", round(r, 4), "k", round(k, 3))
# 板の向きを表向き (-Y 側から見て表) にそろえる
me = bpy.data.meshes.new("Face")
me.from_pydata([tuple(p) for p in basis], [], [q[::-1] for q in quads])
me.update()
if sum(p.normal.y for p in me.polygons) > 0:
    me.clear_geometry(); me.from_pydata([tuple(p) for p in basis], [], quads); me.update()
print("FACE normal y avg", sum(p.normal.y for p in me.polygons) / len(me.polygons), "verts", len(me.vertices), "quads", len(me.polygons))
uvl = me.uv_layers.new(name="UVMap")
for l in me.loops: uvl.data[l.index].uv = uvs[l.vertex_index]
for p in me.polygons: p.use_smooth = True
me.normals_split_custom_set_from_vertices(nrms)
face = bpy.data.objects.new("Face", me)
bpy.context.scene.collection.objects.link(face)
for c in body.users_collection:
    if face.name not in c.objects: c.objects.link(face)
if face.name in bpy.context.scene.collection.objects and len(face.users_collection) > 1:
    bpy.context.scene.collection.objects.unlink(face)

# --- 重み: 近くの体の頂点から写す
kd = KDTree(len(bm.vertices))
for v in bm.vertices: kd.insert(v.co, v.index)
kd.balance()
used = {}
for i, p in enumerate(shown):
    _, bi, _ = kd.find(Vector(p))
    for g in bm.vertices[bi].groups:
        used.setdefault(body.vertex_groups[g.group].name, []).append((i, g.weight))
print("WEIGHT GROUPS", {k: (len(v), round(min(w for _, w in v), 3), round(max(w for _, w in v), 3)) for k, v in used.items()})
vg = face.vertex_groups.new(name="Head")
vg.add(list(range(len(shown))), 1.0, "REPLACE")
face.parent = rig
mod = face.modifiers.new("Armature", "ARMATURE"); mod.object = rig

# --- シェイプキー
face.shape_key_add(name="Basis")
for key in KEYS:
    sk = face.shape_key_add(name=key)
    co = basis.copy()
    for pi, k in enumerate(P["keys"]):
        if k == key: co[owner == pi] = shown[owner == pi]
    sk.data.foreach_set("co", co.ravel()); sk.value = 0
me.shape_keys.name = "FaceKeys"

# --- 材質
import shutil
NAMED = os.path.join(os.path.dirname(ATLAS), "PictorChan_Face.png"); shutil.copyfile(ATLAS, NAMED)
img = bpy.data.images.load(NAMED); img.name = "PictorChan_Face"
img.pack()
mat = bpy.data.materials.new("PictorChan_Face"); mat.use_nodes = True
nt = mat.node_tree; bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img; tex.location = (-400, 300)
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"]); nt.links.new(tex.outputs["Alpha"], bsdf.inputs["Alpha"])
bb = next(n for n in body.data.materials[0].node_tree.nodes if n.type == "BSDF_PRINCIPLED")
for nme in ("Metallic", "Roughness", "Specular IOR Level", "IOR"):
    bsdf.inputs[nme].default_value = bb.inputs[nme].default_value
mat.surface_render_method = "BLENDED"
mat.use_backface_culling = True
if hasattr(mat, "use_transparency_overlap"): mat.use_transparency_overlap = True
me.materials.append(mat)
for im in bpy.data.images:
    if im.type == "IMAGE" and not im.packed_file and im.has_data: im.pack()
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("SAVED", OUT, "body mat", [ (n, bb.inputs[n].default_value) for n in ("Metallic", "Roughness", "Specular IOR Level")])
