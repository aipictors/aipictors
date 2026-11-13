"""書き出した物を読み直して確かめる: blender -b -P 07_verify.py -- <file.glb|fbx|vrm> <out_dir>"""
import bpy, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = os.path.abspath(argv[0]), argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
ext = SRC.rsplit(".", 1)[1].lower()
if ext == "glb": bpy.ops.import_scene.gltf(filepath=SRC, disable_bone_shape=True)
elif ext == "fbx": bpy.ops.import_scene.fbx(filepath=SRC)
elif ext == "vrm":
    bpy.ops.preferences.addon_enable(module="bl_ext.blender_org.vrm")
    bpy.ops.import_scene.vrm(filepath=SRC, extract_textures_into_folder=False)
scene = bpy.context.scene
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
print("RIG", rig.name, "bones", len(rig.data.bones), "scale", tuple(round(v, 4) for v in rig.scale), "rot", tuple(round(v, 3) for v in rig.rotation_euler))
face = None
dg = bpy.context.evaluated_depsgraph_get()
for o in bpy.data.objects:
    if o.type != "MESH": continue
    ev = o.evaluated_get(dg); vs = np.array([o.matrix_world @ v.co for v in ev.data.vertices])
    keys = [k.name for k in o.data.shape_keys.key_blocks] if o.data.shape_keys else []
    print("MESH", o.name, "verts", len(o.data.vertices), "tris", sum(len(p.vertices) - 2 for p in o.data.polygons), "bounds", vs.min(0).round(3), vs.max(0).round(3), "mats", [m.name for m in o.data.materials], "keys", keys)
    if keys: face = o
for im in bpy.data.images: print("IMAGE", im.name, tuple(im.size), im.filepath)
for a in bpy.data.actions: print("ACTION", a.name, tuple(round(v, 1) for v in a.frame_range), "fps", scene.render.fps)
if face and face.data.shape_keys.animation_data:
    print("KEY ANIM", face.data.shape_keys.animation_data.action)
    face.data.shape_keys.animation_data_clear()   # FBX には値 0 のキーの動きが入るので、確認の時は外す
# 髪の先が体から離れていないかなど、形の確認用に: 1 コマずつ
cam = setup_render(scene, 420, 520)
zs = [ (o.matrix_world @ v.co).z for o in bpy.data.objects if o.type == "MESH" for v in o.data.vertices]
h = max(zs) - min(zs)
print("HEIGHT", round(h, 4))
def pick(name):
    for a in bpy.data.actions:
        if a.name.startswith("Key|"): continue
        if a.name.lower().split("|")[-1] == name.lower() or a.name.lower().endswith(name.lower()): return a
shots = [("Idle", 0.3, None), ("Run", 0.4, "Joy"), ("Jump", 0.35, "Blink"), ("Fall", 0.2, "Surprised")]
for name, t, key in shots:
    a = pick(name)
    if a is None: print("NO ACTION", name)
    else:
        set_action(rig, a)
        s, e = a.frame_range; scene.frame_set(int(s + (e - s) * t))
    if face:
        for k in face.data.shape_keys.key_blocks: k.value = 1.0 if k.name == key else 0.0
    aim(cam, (0, 0, h * 0.5), float(argv[2]) if len(argv) > 2 else -25, elev=0.08, ortho_scale=h * 1.35)
    scene.render.filepath = f"{OUT}/{name}.png"; bpy.ops.render.render(write_still=True)
