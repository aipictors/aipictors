#!/bin/bash
# verify.sh <file> <tag>
cd "$(dirname "$0")"
mkdir -p work/verify_$2
blender -b -P 07_verify.py -- "$1" work/verify_$2 2>&1 | grep -E "^(RIG|MESH|IMAGE|ACTION|HEIGHT|NO ACTION)|Error|Traceback|line [0-9]"
args=(); for a in Idle Run Jump Fall; do [ -f work/verify_$2/$a.png ] && args+=("$2 $a=work/verify_$2/$a.png"); done
python3 sheet.py ~/.openclaw/workspace/tmp-pk/v1/verify_$2.png 4 "${args[@]}"
