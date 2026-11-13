"""アニメーションごとに、等間隔のコマを並べた確認用の絵と、腰の高さの変化を出す

    blender -b -P anim_sheet.py -- <in.glb> <out_dir>
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
for obj in list(bpy.data.objects):
    if obj.name.startswith("Icosphere"):
        bpy.data.objects.remove(obj)
rig = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mesh = next(o for o in bpy.data.objects if o.type == "MESH")
print("RIG scale", tuple(rig.scale), "rot", tuple(rig.rotation_euler), "loc", tuple(rig.location))
print("MESH dims", tuple(round(v, 3) for v in mesh.dimensions))

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 300
scene.render.resolution_y = 380
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.8, 0.84, 0.92, 1)
scene.world = world
cam_data = bpy.data.cameras.new("Cam")
cam_data.type = "ORTHO"
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam

# 休めの姿勢での大きさ
deps = bpy.context.evaluated_depsgraph_get()
bb = [mesh.matrix_world @ Vector(c) for c in mesh.bound_box]
lo = Vector((min(p.x for p in bb), min(p.y for p in bb), min(p.z for p in bb)))
hi = Vector((max(p.x for p in bb), max(p.y for p in bb), max(p.z for p in bb)))
print("REST lo", tuple(round(v, 3) for v in lo), "hi", tuple(round(v, 3) for v in hi))
height = hi.z - lo.z
center = (lo + hi) / 2
cam_data.ortho_scale = height * 1.9
# 斜め前から
front = Vector((1, 0, 0))
side = Vector((0, -1, 0))
direction = (front * 0.8 + side * 0.6).normalized()
pos = center + direction * height * 4 + Vector((0, 0, height * 0.2))
cam.location = pos
cam.rotation_euler = (center - pos).to_track_quat("-Z", "Y").to_euler()

rig.animation_data_create()
for action in bpy.data.actions:
    rig.animation_data.action = action
    slots = getattr(action, "slots", None)
    if slots and len(slots):
        rig.animation_data.action_slot = slots[0]
    start, end = action.frame_range
    print("ACTION", action.name, "frames", start, end, "fps", scene.render.fps)
    heights = []
    n = 8
    for i in range(n):
        frame = start + (end - start) * i / (n - 1)
        scene.frame_set(int(round(frame)))
        hip = rig.matrix_world @ rig.pose.bones["Hip"].head
        root = rig.matrix_world @ rig.pose.bones["BoneRoot"].head
        heights.append((int(round(frame)), round(hip.z, 3), round(hip.x, 3), round(root.z, 3)))
        scene.render.filepath = f"{OUT}/{action.name}_{i}.png"
        bpy.ops.render.render(write_still=True)
    print("  hip(frame,z,x,rootz)", heights)
