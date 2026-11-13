#!/bin/bash
# 全部を作り直す: 元の GLB → dist-v1.0/
set -e
cd "$(dirname "$0")"
D=../dist-v1.0
./build_all.sh
blender -b $D/PictorChan_v1.0.blend -P 06_export.py -- $D work/web_src.glb 2>&1 | grep -E "^(GLB|FBX|WEBSRC)|Error|Traceback|line [0-9]"
blender -b $D/PictorChan_v1.0.blend -P 08_vrm.py -- $D/PictorChan_v1.0.vrm 2>&1 | grep -E "VRM RESULT|Error|Traceback|line [0-9]"
./web.sh
mkdir -p work/prev
blender -b $D/PictorChan_v1.0.blend -P 09_previews.py -- work/prev 2>&1 | grep -E "Error|Traceback|line [0-9]" || true
python3 10_assemble.py work/prev $D
rm -f $D/*.blend1
