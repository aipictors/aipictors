"""各アクションのコマを描く: blender -b file.blend -P render_anim.py -- <out_dir> [n]"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
OUT = argv[0]; N = int(argv[1]) if len(argv) > 1 else 6
scene = bpy.context.scene
rig = bpy.data.objects["PictorChan"]
cam = setup_render(scene, 320, 400)
aim(cam, (0, 0, 0.62), 30, elev=0.12, ortho_scale=1.75)
for name in ["Idle", "Run", "Jump", "Fall", "Hurt"]:
    act = bpy.data.actions[name]
    set_action(rig, act)
    a, b = act.frame_range
    for i in range(N):
        f = round(a + (b - a) * i / N) if name in ("Idle", "Run") else round(a + (b - a) * i / (N - 1))
        scene.frame_set(f)
        scene.render.filepath = f"{OUT}/{name}_{i}.png"
        bpy.ops.render.render(write_still=True)
        print("FRAME", name, i, f)
