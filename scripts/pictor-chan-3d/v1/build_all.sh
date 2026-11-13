#!/bin/bash
# 元の GLB から配布用の .blend までを作り直す
set -e
cd "$(dirname "$0")"
SRC=../tripo/anim1/tripo-out/pk-anim1-d2cc7ecd/model.glb
F='^(WEIGHTS|WELD|SCALE|INPLACE|CHECK|BOUNDS|DONE|SMEAR|TEXELS|STORE|FACE|SAVED|ACTIONS|IMG|KEYS)|Error|Traceback|line [0-9]'
blender -b -P 01_base.py -- $SRC work/base.blend 2>&1 | grep -E "$F"
blender -b work/base.blend -P 01c_weights.py -- head 2>&1 | grep -E "$F"
blender -b work/base.blend -P 02_face_maps.py -- work/face_maps.npz work/face_rgb0.png 2>&1 | grep -E "$F"
blender -b work/base.blend -P 01b_texfix.py -- work/face_maps.npz 2>&1 | grep -E "$F"
blender -b work/base.blend -P 02_face_maps.py -- work/face_maps.npz work/face_rgb.png 2>&1 | grep -E "$F"
blender -b -P 03_atlas.py -- work/face_maps.npz work/atlas.png work/patches.npz work/sim.png 2>&1 | grep -E "$F|PATCH"
blender -b work/base.blend -P 04_build_face.py -- work/patches.npz work/atlas.png work/model.blend 2>&1 | grep -E "$F"
blender -b work/model.blend -P 05_finalize.py -- ../dist-v1.0 2>&1 | grep -E "$F"
