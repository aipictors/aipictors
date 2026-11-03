# 表示速度と配布物の大きさ

## 予算の確認

```sh
bun remix vite:build
bun run check:bundle            # scripts/bundle-budget.json と比べる。超えたら exit 1
bun run check:bundle --top 20   # 主要ページで読む JS を大きい順に出す
bun run check:bundle --update   # 意図した増加のときに予算を更新する（今の値 + 5%）
```

ページの JS は、そのページのルート（親を含む）と entry から静的 import をたどった全ファイルの gzip 合計。lazy の先は含めない。

## 計測の結果（2026-11-04）

変更前は 37596af9。ローカルの本番ビルド（wrangler pages dev）を、モバイル相当で 3 回測った中央値。

| ページ | JS gzip KB | JS ファイル数 | LCP ms | TBT ms | 表示後の GraphQL |
|---|---|---|---|---|---|
| ホーム | 462 → 446 | 127 → 124 | 1648 → 1357 | 0 → 0 | 1 → 1 |
| 作品 | 519 → 495 | 150 → 147 | 956 → 932 | 0 → 0 | 9 → 2 |
| 生成 | 574 → 515 | 125 → 118 | 959 → 988 | 104 → 36 | 6 → 2 |
| タグ | 407 → 395 | 105 → 102 | 1070 → 1050 | 0 → 0 | 1 → 1 |
| ランキング | 402 → 390 | 105 → 102 | 1202 → 1069 | 0 → 0 | 1 → 1 |
| 検索 | 388 → 375 | 95 → 92 | 1468 → 1433 | 0 → 0 | 1 → 1 |
| ユーザー | 476 → 441 | 139 → 126 | 2472 → 2473 | 0 → 0 | 3 → 3 |

配布物: build/client 302MB → 65MB、7,282 → 2,382 ファイル。build/server 88MB → 6.6MB。

読み方の注意:

- LCP・TBT は Lighthouse（`--only-categories=performance`、既定のモバイル設定）。ローカルには画像の縮小（`/_w/`）がないので、本番の値とは比べられない。
- 読むのが中心のページは、操作されるまで JS を読まない（app/lib/defer-hydration.ts）。Lighthouse はそのページの JS を 1 本も読まないので、JS を減らしても LCP・TBT は動かない。この差は誤差で、効くのは操作してから動くまでの時間。
- 表示後の GraphQL はログインしていない人を、Android の UA・幅 412px で数えたもの。

## 再現

```sh
bun run build
rm -rf /tmp/aipictors-client
cp -R build/client /tmp/aipictors-client
cp build/worker/index.js /tmp/aipictors-client/_worker.js
node_modules/.bin/wrangler pages dev /tmp/aipictors-client --ip 127.0.0.1 --port 8788 \
  --compatibility-date=2024-11-11 --compatibility-flags=nodejs_compat --kv PAGE_CACHE \
  --binding VITE_GRAPHQL_ENDPOINT=https://api.aipictors.com/ \
  --binding VITE_GRAPHQL_ENDPOINT_REMIX=https://api.aipictors.com/ \
  --binding AIPICTORS_API_BASE_URL=https://backend.aipictors.com
npx lighthouse http://127.0.0.1:8788/ --only-categories=performance --chrome-flags="--headless=new"
```

本番の API を読みに行く。`works` などは query でも閲覧数と閲覧履歴を書き込むので、開いたページの分だけ本番のデータが増える。繰り返しの計測は最小限にする。`/api/coins/*` はローカルでは 500 になる（変更前も同じ。秘密情報がないためとみられる）。`bun wrangler pages dev` は起動しても応答しないので、wrangler を直接実行する。

## 試して、入れなかったもの

| 内容 | 結果 |
|---|---|
| `experimentalMinChunkSize` の変更 | 20KB 以上は 120KB まで結果がほぼ同じ。1 にすると 12KB 減るが、ファイルが約 50 本増える |
| Apollo の `globalThis.__DEV__` を false にする | 3KB しか減らない |
| Tailwind の走査を `app/` に絞る | 400B しか減らない（gzip） |
| CPU プロファイルからの修正 | hydration は 4〜6 倍の低速化で 0.5〜0.7 秒で、目立つ処理がない |
