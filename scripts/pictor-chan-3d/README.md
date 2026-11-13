# ぴくたーちゃんの 3D モデル

404 ページの隠しゲーム（`app/components/pictor-run`）で使う `public/images/pictor-chan/pictor-chan-3d-v1.glb` の作り方。
モデルは Blender の Python で組み立てている（手作業の .blend はない）。

```sh
cd scripts/pictor-chan-3d
python3 make_face.py face.png                      # 顔のテクスチャ（Pillow が必要）
mkdir -p preview
blender -b -P build_model.py -- "$PWD/face.png" "$PWD/pictor-chan.glb" "$PWD/preview"
npx @gltf-transform/cli@4 optimize pictor-chan.glb pictor-chan.opt.glb \
  --compress quantize --texture-compress webp --texture-size 1024 \
  --simplify false --join false --palette false --flatten false --instance false
```

できた `pictor-chan.opt.glb` を `public/images/pictor-chan/` に置く。
中身を変えたらファイル名の `v1` を上げる（`/images/*` は 1 日キャッシュされる）。

骨はすべて真上向きにそろえてあり、動きはゲーム側（`pictor-run-game.client.ts`）で骨を直接回して付けている。
