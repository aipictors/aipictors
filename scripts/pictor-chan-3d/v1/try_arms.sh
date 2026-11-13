#!/bin/bash
# try_arms.sh <開く角度> <後ろへ引く角度>: Idle の腕を試して絵を出す
cd "$(dirname "$0")"
blender -b work/base.blend -P 01d_idle_arms.py -- $1 $2 work/arm_$1_$2.blend 2>&1 | grep -E "IDLE ARMS|Error|Traceback|line [0-9]"
mkdir -p work/hand_$1_$2
blender -b work/arm_$1_$2.blend -P hand_view.py -- work/hand_$1_$2 2>&1 | grep -E "Error|Traceback"
python3 crop4.py ~/.openclaw/workspace/tmp-pk/v1/hand_$1_$2.png 0,0,500,500 0.8 5 work/hand_$1_$2/0_{front,q,side,back,under}.png work/hand_$1_$2/230_{front,q,side,back,under}.png
