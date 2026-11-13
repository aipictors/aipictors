# ぴくたーちゃんの 3D モデル

404 ページの隠しゲーム（`app/components/pictor-run`）で使う `public/images/pictor-chan/pictor-chan-3d-v2.glb` の作り方。
Tripo（<https://developers.tripo3d.ai>、`npm install -g tripo-cli`、`tripo login --region ov`）で公式絵から作っている。1 クレジット = $0.01。

| 手順 | コマンド | クレジット |
| --- | --- | --- |
| 公式絵 → 3D 風の T ポーズの絵 | `tripo generate image-to-image official.png style.png --model chat_image_2 --prompt "…" -p size=1024x1536 -p quality=medium` | 10 |
| 4 方向の絵 | `tripo generate image-to-multiview generated_image.png` | 10 |
| 3D モデル | `tripo make front.jpeg left.jpeg back.jpeg right.jpeg --model tripo-p2 -p face_limit=24000 -p texture_quality=detailed` | 120 |
| 骨を入れる | `tripo anim check <モデルのtask>` → `tripo anim rig <モデルのtask> --model v3.0-20260909 --rig-type biped --spec tripo --out-format glb` | 25 |
| 動きを付ける | `tripo anim retarget <リグのtask> --animation preset:idle preset:run preset:jump preset:fall --animate-in-place -p out_format=glb` | 10 × 本数 |

できた `model.glb`（約 6MB）を軽くする:

```sh
npm i @gltf-transform/core@4
node strip.mjs model.glb stripped.glb          # 使わない動きと目印の球を外す
npx @gltf-transform/cli@4 optimize stripped.glb pictor-chan-3d-v2.glb \
  --compress meshopt --texture-compress webp --texture-size 2048 \
  --simplify false --join false --palette false --flatten false --instance false
```

- `/images/*` は 1 日キャッシュされるので、中身を変えたらファイル名の `v2` を上げる
- モデルは +X を向いて出てくる。ゲーム側で向きと大きさ（身長 1・足元 0）をそろえている
- 動きごとに立ち位置が違う（run だけ前にずれている）ので、ゲーム側で腰の水平位置を固定している
- 確認用: `blender -b -P inspect_glb.py -- in.glb out_dir`（中身の一覧と 4 方向の絵）、`blender -b -P anim_sheet.py -- in.glb out_dir`（動きごとのコマ）
