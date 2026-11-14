"""OGP 用: 走っているぴくたーちゃん（透明の背景）: blender -b dist/PictorChan_v1.0.blend -P 11_ogp_pose.py -- <out.png>"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
OUT = os.path.abspath(sys.argv[sys.argv.index("--") + 1])
scene = bpy.context.scene
rig = bpy.data.objects["PictorChan"]; face = bpy.data.objects["Face"]
set_action(rig, bpy.data.actions["Run"]); scene.frame_set(int(sys.argv[-1]) if sys.argv[-1].isdigit() else 8)
for k in face.data.shape_keys.key_blocks: k.value = 0.0
cam = setup_render(scene, 1000, 1000, transparent=True)
aim(cam, (0, 0.0, 0.6), -28, elev=0.05, ortho_scale=1.5)
scene.render.image_settings.color_mode = "RGBA"
scene.render.filepath = OUT; bpy.ops.render.render(write_still=True)
