#!/bin/bash
# mksheet.sh <dir> <out.png> <n>
args=()
for a in Idle Run Jump Fall Hurt; do for ((i=0;i<$3;i++)); do [ -f "$1/${a}_$i.png" ] && args+=("$a $i=$1/${a}_$i.png"); done; done
python3 "$(dirname "$0")/sheet.py" "$2" "$3" "${args[@]}"
