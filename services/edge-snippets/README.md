# Cloudflare の配信ルール

- `image-variants.js`: Snippet。`www` の `/_w/*` を R2 の縮小版（variants.aipictors.com）から返す。
- Transform Rules（http_request_late_transform）: `www` のリクエストに `x-aip-locale`・`x-aip-layout`・`x-aip-grid`・`x-aip-fresh` を付ける。
  Workers のキャッシュはこの 4 つの `Vary` でページを分ける（app/lib/edge-page-cache.ts）。Worker 側の判定と一致したときだけ保存する。
