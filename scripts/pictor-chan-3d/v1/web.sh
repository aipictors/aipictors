#!/bin/bash
# web 用の GLB を作る (06_export.py の後)
set -e
cd "$(dirname "$0")"
OUT=$(cd ../dist-v1.0 && pwd)/web/pictor-chan-3d-v3.glb
mkdir -p ../dist-v1.0/web
SRC=$(pwd)/work/web_src.glb
(cd ../tripo && npx -y @gltf-transform/cli@4 optimize "$SRC" "$OUT" --compress meshopt --texture-compress webp --texture-size 2048 --simplify false --join false --palette false --flatten false --instance false 2>&1 | tail -1)
python3 glbinfo.py "$OUT"
