#!/bin/bash
# 顔の板を作り直して確認用の絵まで出す
set -e
cd "$(dirname "$0")"
T=~/.openclaw/workspace/tmp-pk/v1
blender -b -P 03_atlas.py -- work/face_maps.npz work/atlas.png work/patches.npz $T/sim.png 2>&1 | grep -E "PREP|dark|PATCH|Error|Traceback|line " | cut -c1-200
cp work/atlas.png $T/atlas.png
blender -b work/base.blend -P 04_build_face.py -- work/patches.npz work/atlas.png work/model.blend 2>&1 | grep -E "^(STORE|FACE|SAVED)|Error|Traceback|line "
rm -rf work/ex0 work/ex35; mkdir -p work/ex0 work/ex35
blender -b work/model.blend -P render_expr.py -- work/ex0 0 2>&1 | grep -E "Error|Traceback" || true
blender -b work/model.blend -P render_expr.py -- work/ex35 ${1:--40} 2>&1 | grep -E "Error|Traceback" || true
python3 crop4.py $T/z1.png 100,250,500,520 1.5 2 work/ex0/Blink.png work/ex0/Joy.png work/ex0/Fun.png work/ex0/Sorrow.png
python3 crop4.py $T/z2.png 100,250,500,520 1.5 2 work/ex0/Surprised.png work/ex0/MouthClosed.png work/ex0/MouthOpen.png work/ex0/Blink_L.png
python3 crop4.py $T/z3.png 150,250,550,520 1.5 2 work/ex35/Blink.png work/ex35/Joy.png work/ex35/Sorrow.png work/ex35/MouthOpen.png
python3 crop4.py $T/z4.png 150,250,550,520 1.5 2 work/ex35/Fun.png work/ex35/Surprised.png work/ex35/MouthClosed.png work/ex35/Neutral.png
rm -rf work/ex80; mkdir -p work/ex80
blender -b work/model.blend -P render_expr.py -- work/ex80 -75 2>&1 | grep -E "Error|Traceback" || true
python3 crop4.py $T/z5.png 150,250,550,520 1.5 2 work/ex80/Blink.png work/ex80/Joy.png work/ex80/Sorrow.png work/ex80/Neutral.png
