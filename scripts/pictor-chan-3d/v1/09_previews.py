"""紹介用の絵の材料を描く: blender -b dist/PictorChan_v1.0.blend -P 09_previews.py -- <work_dir>"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
OUT = sys.argv[sys.argv.index("--") + 1]
scene = bpy.context.scene
rig = bpy.data.objects["PictorChan"]; face = bpy.data.objects["Face"]
kb = face.data.shape_keys.key_blocks
BG = (0.955, 0.965, 0.985)
def keys(name=None):
    for k in kb: k.value = 1.0 if k.name == name else 0.0
# 1) 4 方向 (Idle の最初の姿勢)
cam = setup_render(scene, 640, 900, bg=BG)
set_action(rig, bpy.data.actions["Idle"]); scene.frame_set(0); keys()
for name, ang in (("front", 0), ("quarter", -35), ("side", -90), ("back", 180)):
    aim(cam, (0, 0.05, 0.61), ang, elev=0.04, ortho_scale=1.36)
    scene.render.filepath = f"{OUT}/turn_{name}.png"; bpy.ops.render.render(write_still=True)
# 2) web 用の 1 枚 (透明の背景)
cam = setup_render(scene, 720, 900, bg=BG, transparent=True)
aim(cam, (0.0, 0.05, 0.61), -28, elev=0.06, ortho_scale=1.30)
scene.render.image_settings.color_mode = "RGBA"
scene.render.filepath = f"{OUT}/web_preview.png"; bpy.ops.render.render(write_still=True)
# 3) 表情 (T ポーズの顔のアップ)
set_action(rig, None); reset_pose(rig); scene.frame_set(0)
cam = setup_render(scene, 520, 520, bg=BG)
aim(cam, (0, 0, 0.85), 0, ortho_scale=0.56)
for name in ["Neutral"] + [k.name for k in kb[1:]]:
    keys(name)
    scene.render.filepath = f"{OUT}/expr_{name}.png"; bpy.ops.render.render(write_still=True)
keys()
# 4) 動き
cam = setup_render(scene, 340, 400, bg=BG)
aim(cam, (0, 0, 0.60), -30, elev=0.10, ortho_scale=1.72)
N = 6
for name in ["Idle", "Run", "Jump", "Fall", "Hurt"]:
    act = bpy.data.actions[name]; set_action(rig, act)
    a, b = act.frame_range
    for i in range(N):
        f = round(a + (b - a) * i / N) if name in ("Idle", "Run") else round(a + (b - a) * i / (N - 1))
        scene.frame_set(f)
        scene.render.filepath = f"{OUT}/anim_{name}_{i}.png"; bpy.ops.render.render(write_still=True)
