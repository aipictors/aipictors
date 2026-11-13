"""全身の 4 方向: blender -b file.blend -P render_turn.py -- <out_dir> [w h] [action frame]"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
OUT = argv[0]; W = int(argv[1]) if len(argv) > 1 else 600; H = int(argv[2]) if len(argv) > 2 else 800
scene = bpy.context.scene
rig = bpy.data.objects["PictorChan"]
if len(argv) > 3:
    set_action(rig, bpy.data.actions[argv[3]]); scene.frame_set(int(argv[4]))
cam = setup_render(scene, W, H)
for name, ang in (("front", 0), ("quarter", -35), ("side", -90), ("back", 180)):
    aim(cam, (0, 0.03, 0.6), ang, ortho_scale=1.32)
    scene.render.filepath = f"{OUT}/{name}.png"
    bpy.ops.render.render(write_still=True)
