"""Idle の腕が胴とスカートの中に沈んでいるのを直す: 肩を支点に、腕を外へ開く（体の前後の軸まわり）・少し後ろへ引く
blender -b work/base.blend -P 01d_idle_arms.py -- [開く角度] [後ろへ引く角度] [出力]   (出力を省くと上書き保存)"""
import bpy, sys, os, math
from mathutils import Matrix, Quaternion
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
OPEN = math.radians(float(argv[0])) if len(argv) > 0 else math.radians(30)
BACK = math.radians(float(argv[1])) if len(argv) > 1 else 0.0
OUT = argv[2] if len(argv) > 2 else None
scene = bpy.context.scene; rig = bpy.data.objects["PictorChan"]
act = bpy.data.actions["Idle"]; set_action(rig, act)
a, b = (int(v) for v in act.frame_range)
fcs = actions_fcurves(act)
quats = {"L_Upperarm": [], "R_Upperarm": []}
for f in range(a, b + 1):
    scene.frame_set(f)
    for name, side in (("L_Upperarm", 1), ("R_Upperarm", -1)):
        pb = rig.pose.bones[name]
        M = pb.matrix.copy(); B = pb.matrix_basis.copy()
        h = Matrix.Translation(M.to_translation())
        # 左 (+X) は Y 軸まわりに負の向きで外へ開く。X 軸まわりに負の向きで後ろ (+Y) へ引く
        R = Matrix.Rotation(-side * OPEN, 4, "Y") @ Matrix.Rotation(-BACK, 4, "X")
        A = h @ R @ h.inverted()
        q = (B @ M.inverted() @ A @ M).to_quaternion()
        if quats[name] and quats[name][-1].dot(q) < 0: q.negate()
        quats[name].append(q)
for name, qs in quats.items():
    for i in range(4):
        fc = fcs.find(f'pose.bones["{name}"].rotation_quaternion', index=i)
        assert len(fc.keyframe_points) == len(qs), (len(fc.keyframe_points), len(qs))
        for k, q in zip(fc.keyframe_points, qs):
            k.co[1] = q[i]; k.handle_left[1] = q[i]; k.handle_right[1] = q[i]
        fc.update()
scene.frame_set(0)
print("IDLE ARMS open", round(math.degrees(OPEN), 1), "back", round(math.degrees(BACK), 1), "L_Hand", [round(v, 3) for v in rig.pose.bones["L_Hand"].head], "R_Hand", [round(v, 3) for v in rig.pose.bones["R_Hand"].head])
set_action(rig, None); reset_pose(rig); scene.frame_set(0)
if OUT: bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(OUT))
else: bpy.ops.wm.save_mainfile()
