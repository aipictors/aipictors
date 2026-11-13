#!/bin/bash
# mkexpr.sh <dir> <out.png> [cols]
args=()
for a in Neutral Blink Blink_L Blink_R Joy Fun Sorrow Surprised MouthClosed MouthOpen; do [ -f "$1/$a.png" ] && args+=("$a=$1/$a.png"); done
python3 "$(dirname "$0")/sheet.py" "$2" "${3:-5}" "${args[@]}"
