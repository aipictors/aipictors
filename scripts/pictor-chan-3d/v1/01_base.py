"""Tripo の GLB を読み、掃除・改名・向き/大きさの適用・動きのその場化をして base.blend に保存"""
import bpy, sys, math, os
import numpy as np
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = argv[0], argv[1]
HEIGHT = 1.2
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC, merge_vertices=True)   # UV の切れ目で割れている頂点をつなぐ
for o in list(bpy.data.objects):
    if o.name.startswith("Icosphere"):
        me = o.data; bpy.data.objects.remove(o); bpy.data.meshes.remove(me)
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
body = next(o for o in bpy.data.objects if o.type == "MESH")
rig.name = "PictorChan"; rig.data.name = "PictorChan"
body.name = "Body"; body.data.name = "Body"
mat = body.data.materials[0]; mat.name = "PictorChan_Body"
img = bpy.data.images[0]; img.name = "PictorChan_Body"
scene = bpy.context.scene
scene.render.fps = 30

# --- 同じ位置で割れている頂点をつなぐ (面・UV・法線はそのまま)
import bmesh
me = body.data
nl, npoly = len(me.loops), len(me.polygons)
normals = [c.vector.copy() for c in me.corner_normals]
bm = bmesh.new(); bm.from_mesh(me)
nv0 = len(bm.verts)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
if len(bm.faces) == npoly and sum(len(f.loops) for f in bm.faces) == nl:
    bm.to_mesh(me); me.update()
    me.normals_split_custom_set([tuple(n) for n in normals])
    print("WELD", nv0, "->", len(me.vertices), "boundary edges", sum(1 for e in bm.edges if e.is_boundary), "non-manifold", sum(1 for e in bm.edges if not e.is_manifold and not e.is_boundary))
else:
    print("WELD skipped (faces would change)", len(bm.faces), npoly)
bm.free()

# --- 時間を 30fps の整数コマに直す (0.8 刻み → 1 刻み、先頭を 0 に)
for act in bpy.data.actions:
    for fc in actions_fcurves(act):
        n = len(fc.keyframe_points)
        co = np.empty(n * 2, dtype=np.float32)
        fc.keyframe_points.foreach_get("co", co)
        co[0::2] = np.round(co[0::2] * 1.25 - 1.0)
        fc.keyframe_points.foreach_set("co", co)
        for a in ("handle_left", "handle_right"):
            fc.keyframe_points.foreach_set(a, co)
        fc.update()
    act.name = act.name.capitalize()
    for s in act.slots: s.name_display = "PictorChan"

# --- 向き・大きさ・位置
reset_pose(rig); set_action(rig, None)
h0 = max(v.co.z for v in body.data.vertices) - min(v.co.z for v in body.data.vertices)
zmin = min(v.co.z for v in body.data.vertices)
s = HEIGHT / h0
hip = rig.data.bones["Hip"].head_local.copy()
M = Matrix.Rotation(math.radians(-90), 4, "Z") @ Matrix.Scale(s, 4) @ Matrix.Translation((-hip.x, -hip.y, -zmin))
print("SCALE", s, "h0", h0, "zmin", zmin, "hip", tuple(hip))
body.parent = None
body.matrix_world = M; rig.matrix_world = M
bpy.context.view_layer.update()
for o in (rig, body):
    bpy.ops.object.select_all(action="DESELECT")
    o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
body.parent = rig
body.matrix_parent_inverse = Matrix.Identity(4)
for act in bpy.data.actions:
    for fc in actions_fcurves(act):
        if fc.data_path.endswith(".location"):
            for k in fc.keyframe_points:
                k.co[1] *= s; k.handle_left[1] *= s; k.handle_right[1] *= s
            fc.update()

# --- その場化: 腰の水平位置の基準を原点へ
root = rig.data.bones["BoneRoot"]
Rinv = root.matrix_local.to_3x3().inverted()
for act in bpy.data.actions:
    set_action(rig, act)
    a, b = (int(v) for v in act.frame_range)
    pts = []
    for f in range(a, b + 1):
        scene.frame_set(f)
        pts.append((rig.pose.bones["Hip"].head).copy())
    ref = pts[0] if act.name == "Fall" else sum(pts, Vector()) / len(pts)
    d = Rinv @ Vector((-ref.x, -ref.y, 0))
    fcs = actions_fcurves(act)
    for i in range(3):
        fc = fcs.find('pose.bones["BoneRoot"].location', index=i)
        for k in fc.keyframe_points:
            k.co[1] += d[i]; k.handle_left[1] += d[i]; k.handle_right[1] += d[i]
        fc.update()
    print("INPLACE", act.name, "frames", a, b, "ref", tuple(round(v, 4) for v in ref))
for act in bpy.data.actions:
    set_action(rig, act)
    a, b = (int(v) for v in act.frame_range)
    xs = []
    for f in range(a, b + 1):
        scene.frame_set(f); p = rig.pose.bones["Hip"].head; xs.append((p.x, p.y, p.z))
    xs = np.array(xs)
    print("CHECK", act.name, "hip min", xs.min(0).round(3), "max", xs.max(0).round(3), "dur", (b - a) / 30)
    act.use_fake_user = True
    act.use_frame_range = True; act.frame_start = a; act.frame_end = b
set_action(rig, None); reset_pose(rig); scene.frame_set(0)
vs = np.array([v.co for v in body.data.vertices])
print("BOUNDS", vs.min(0).round(4), vs.max(0).round(4))
bpy.ops.wm.save_as_mainfile(filepath=OUT)
