"""表情ごとの顔のアップ: blender -b model.blend -P render_expr.py -- <out_dir> [angle] [size]"""
import bpy, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *
argv = sys.argv[sys.argv.index("--") + 1 :]
OUT = argv[0]; ANG = float(argv[1]) if len(argv) > 1 else 0; SZ = int(argv[2]) if len(argv) > 2 else 600
ELEV = float(argv[3]) if len(argv) > 3 else 0.0
ONLY = argv[4].split(',') if len(argv) > 4 else None
CEN = tuple(float(v) for v in argv[5].split(',')) if len(argv) > 5 else (0, 0, 0.86)
OS = float(argv[6]) if len(argv) > 6 else 0.60
scene = bpy.context.scene
face = bpy.data.objects["Face"]
cam = setup_render(scene, SZ, SZ)
aim(cam, CEN, ANG, elev=ELEV, ortho_scale=OS)
kb = face.data.shape_keys.key_blocks
for name in ["Neutral"] + [k.name for k in kb[1:]]:
    if ONLY and name not in ONLY: continue
    for k in kb: k.value = 1.0 if k.name == name else 0.0
    scene.render.filepath = f"{OUT}/{name}.png"
    bpy.ops.render.render(write_still=True)
for k in kb: k.value = 0
