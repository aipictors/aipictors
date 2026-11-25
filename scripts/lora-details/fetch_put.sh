#!/bin/zsh
# fetch_put.sh <aipictors name> <civitai url> <sha256> : Civitai から落として sha256 を照合し、Volume の Lora フォルダへ上げる
set -e
name=$1; url=$2; want=$3
key="stable-diffusion-webui-reForge/models/Lora/$name.safetensors"
cd ~/Documents/aipictors-lora-1125/dl
set -a; . ~/.config/civitai/token.env; . ~/.config/aipictors/runpod-s3.env; set +a
export AWS_ACCESS_KEY_ID=$RUNPOD_S3_ACCESS_KEY AWS_SECRET_ACCESS_KEY=$RUNPOD_S3_SECRET_KEY AWS_DEFAULT_REGION=EU-RO-1
EP=https://s3api-eu-ro-1.runpod.io
aws() { uvx --from awscli aws "$@" --endpoint-url $EP; }
f="$name.safetensors"
if [ ! -f "$f.done" ]; then
  curl -sSL --fail --retry 5 -C - -A Mozilla/5.0 -H "Authorization: Bearer $CIVITAI_API_TOKEN" -o "$f" "$url"
  touch "$f.done"
fi
size=$(stat -f %z "$f")
sha=$(shasum -a 256 "$f" | cut -d' ' -f1)
if [ -n "$want" ] && [ "${sha:u}" != "${want:u}" ]; then echo "$name SHA MISMATCH"; rm -f "$f" "$f.done"; exit 1; fi
python3 -I -c 'import json,struct,sys;f=open(sys.argv[1],"rb");n=struct.unpack("<Q",f.read(8))[0];h=json.loads(f.read(n));print("header ok", len(h), "tensors")' "$f"
if aws s3 ls "s3://12zcpzz0e7/$key" >/dev/null 2>&1; then echo "$name: already on volume, skip upload"; exit 0; fi
aws s3 cp "$f" "s3://12zcpzz0e7/$key" --only-show-errors
remote=$(aws s3 ls "s3://12zcpzz0e7/$key" | awk '{print $3}')
[ "$remote" = "$size" ] && echo "$name uploaded ok ($remote) sha=$sha" || { echo "$name SIZE MISMATCH remote=$remote local=$size"; exit 1; }
