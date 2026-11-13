"""glb を読み込んで、中身の一覧と 4 方向の確認用の絵を出す

    blender -b -P inspect_glb.py -- <in.glb> <preview_dir>
"""
import math
import sys

import bpy
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1 :]
SRC, OUT = argv[0], argv[1]

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

lo = Vector((1e9, 1e9, 1e9))
hi = Vector((-1e9, -1e9, -1e9))
for obj in bpy.data.objects:
    print("OBJ", obj.type, obj.name, "parent=", obj.parent.name if obj.parent else None)
    if obj.type == "MESH":
        print("  verts", len(obj.data.vertices), "tris", sum(len(p.vertices) - 2 for p in obj.data.polygons), "mats", [m.name for m in obj.data.materials], "groups", len(obj.vertex_groups))
        for corner in obj.bound_box:
            p = obj.matrix_world @ Vector(corner)
            lo = Vector((min(lo.x, p.x), min(lo.y, p.y), min(lo.z, p.z)))
            hi = Vector((max(hi.x, p.x), max(hi.y, p.y), max(hi.z, p.z)))
    if obj.type == "ARMATURE":
        print("  bones", [b.name for b in obj.data.bones])
for image in bpy.data.images:
    print("IMG", image.name, tuple(image.size))
print("BOUNDS", tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))
print("ACTIONS", [a.name for a in bpy.data.actions])

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 700
scene.render.resolution_y = 900
scene.view_settings.view_transform = "Standard"
world = bpy.data.worlds.new("W")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.8, 0.84, 0.92, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.0
scene.world = world
sun = bpy.data.objects.new("Sun", bpy.data.lights.new("Sun", "SUN"))
sun.data.energy = 1.5
sun.rotation_euler = (math.radians(50), 0, math.radians(-30))
scene.collection.objects.link(sun)
cam_data = bpy.data.cameras.new("Cam")
cam_data.lens = 70
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
center = (lo + hi) / 2
size = max((hi - lo).z, (hi - lo).x) * 2.7
for name, angle in (("front", 0), ("quarter", -35), ("side", 90), ("back", 180)):
    a = math.radians(angle)
    pos = center + Vector((math.sin(a) * size, -math.cos(a) * size, size * 0.12))
    cam.location = pos
    cam.rotation_euler = (center - pos).to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = f"{OUT}/{name}.png"
    bpy.ops.render.render(write_still=True)
