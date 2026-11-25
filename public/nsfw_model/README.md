# Models List

## [Quantized MobileNet(v2) 1.1](./Quantized_MobileNet_v2_1.1/)
- [GantMan/nsfw_model/releases/tag/1.1.0](https://github.com/GantMan/nsfw_model/releases/tag/1.1.0)

## [Quantized InceptionNet(v3) 1.0](./Quantized_InceptionNet_v3_1.0/)
- [GantMan/nsfw_model](https://s3.amazonaws.com/ir_public/ai/nsfw_models/min_nsfwjs.zip)

## [anime-nsfw-seg-yolo26n-v1.onnx](./anime-nsfw-seg-yolo26n-v1.onnx)
- 投稿画面の「自動モザイク（ベータ）」で使う（`app/utils/auto-mosaic.ts`、ブラウザの中で動かす）
- [01miku/anime-nsfw-segm-yolo26](https://huggingface.co/01miku/anime-nsfw-segm-yolo26) の `nsfw-anime-nano-x640.onnx`（モデルカードは MIT。ONNX のメタデータには Ultralytics の既定の AGPL-3.0 表記がある）
- 入力 640×640、分類: anus, nipple, penis, vagina, female face, male face, pubic hair
- 中身を差し替えるときはファイル名の版を上げる（`/nsfw_model/*` は 7 日キャッシュ）
