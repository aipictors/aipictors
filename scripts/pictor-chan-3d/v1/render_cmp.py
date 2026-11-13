import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
OUT = sys.argv[sys.argv.index("--") + 1]
scene = bpy.context.scene; rig = bpy.data.objects["PictorChan"]
cam = setup_render(scene, 400, 500)
i = 0
for name, fr, ang in (("Idle", 0, 0), ("Idle", 0, 180), ("Idle", 200, -60), ("Run", 10, 30), ("Run", 25, 150), ("Jump", 20, -30), ("Fall", 18, -30), ("Hurt", 100, 30)):
    set_action(rig, bpy.data.actions[name]); scene.frame_set(fr)
    aim(cam, (0, 0, 0.6), ang, elev=0.08, ortho_scale=1.6)
    scene.render.filepath = f"{OUT}/{i}.png"; bpy.ops.render.render(write_still=True); i += 1
