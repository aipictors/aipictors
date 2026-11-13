"""Idle の手まわりを確かめる: blender -b file.blend -P hand_view.py -- <out_dir>"""
import bpy, sys, os
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
OUT = sys.argv[sys.argv.index("--") + 1]
scene = bpy.context.scene; rig = bpy.data.objects["PictorChan"]; body = bpy.data.objects["Body"]
set_action(rig, bpy.data.actions["Idle"])
cam = setup_render(scene, 500, 500)
for fr in (0, 230):
    scene.frame_set(fr)
    for name, ang, el in (("front", 0, 0.0), ("q", -35, 0.05), ("side", -90, 0.0), ("back", 180, 0.0), ("under", 180, -0.6)):
        aim(cam, (0, 0.05, 0.55), ang, elev=el, ortho_scale=0.9)
        scene.render.filepath = f"{OUT}/{fr}_{name}.png"; bpy.ops.render.render(write_still=True)
    for n in ("L_Hand", "R_Hand", "L_Forearm", "L_Upperarm", "Hip", "Spine01"):
        pb = rig.pose.bones[n]; print("POSE", fr, n, [round(v, 3) for v in pb.head], [round(v, 3) for v in pb.tail])
