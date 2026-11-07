# メンテナンス表示（KV フラグ）

再デプロイなしで、Worker `aipictors` のメンテナンス表示を切り替える。
値は KV（binding `PAGE_CACHE`、namespace `8d789ec6fbe94540a435a7936fa2e4bb`）に JSON で置く。

| キー | 範囲 | 表示 |
| --- | --- | --- |
| `maintenance:site` | サイト全体 | ページは HTTP 503 のメンテナンス画面（`メンテナンス中`、終了予定・本文、`Retry-After`、noindex）。`/api/*`・ページのデータ（`.data`）・POST などは 503 の JSON `{"error":"MAINTENANCE","message":…,"endsAt":…}` |
| `maintenance:generation` | 画像生成だけ | `/generation` 以下の上に「画像生成はメンテナンス中です（終了予定 …）」の帯を出し、生成ボタン（再生成を含む）を押せなくする。ほかのページはふだんどおり |

- 静的ファイル（`build/client` の JS・CSS・画像、`/favicon.ico` など）は Worker より前に返るので、メンテナンス中も読める。画像の縮小版 `/_w/…` もそのまま返す
- 値は Worker のメモリに 20 秒置き、KV 自体も拠点ごとに最大 60 秒ほど古い値を返すことがある。**切り替えてから反映まで 1〜2 分**見ておく
- KV が読めないときは前回の値、それもなければ「メンテナンスなし」として扱う
- API の `maintenanceStatus`（GraphQL）による従来のメンテナンス表示はそのまま残る。KV の `maintenance:site` はそれより先に見るので、API が止まっていても出せる
- 実装: `app/lib/maintenance-mode.ts`、`functions/[[path]].ts`、`app/routes/($lang).generation/route.tsx`、`app/routes/api.generation.notice/route.ts`

## 値

```json
{
  "enabled": true,
  "endsAt": "2026-11-15T03:00:00+09:00",
  "message": "データベースを移行しています。",
  "bypassToken": "長いランダムな文字列"
}
```

- `enabled`: `true` のときだけ有効（それ以外・キーなしは無効）
- `endsAt`: 終了予定（ISO 8601）。画面には日本時間で出す（例: `11/15(日) 03:00`）。省略すると「未定」。過ぎても自動では終わらない
- `message`: 任意。画面に追加で出す本文
- `bypassToken`: `maintenance:site` のみ。運営の確認用（下記）。画面・JSON には出さない
- `Retry-After` は終了予定までの秒数（60 秒〜1 日）、終了予定がなければ 600 秒

## 切り替えのコマンド

リポジトリの直下で実行する（`wrangler.toml` の binding 名を使う）。認証は `wrangler login` か、`CLOUDFLARE_API_TOKEN`・`CLOUDFLARE_ACCOUNT_ID` を環境変数に入れる（運営の Mac では `set -a; . ~/.config/aipictors/cloudflare.env; set +a`）。
**`--remote` を付けないとローカルの KV に書くだけで本番は変わらない。**

### サイト全体

```bash
# 確認用のトークンを作る（控えておく）
TOKEN=$(openssl rand -hex 24)

# 開始
bunx wrangler kv key put --binding PAGE_CACHE --remote "maintenance:site" \
  "{\"enabled\":true,\"endsAt\":\"2026-11-15T03:00:00+09:00\",\"message\":\"データベースを移行しています。\",\"bypassToken\":\"$TOKEN\"}"

# 今の値を見る
bunx wrangler kv key get --binding PAGE_CACHE --remote "maintenance:site"

# 終了（キーを消す。{"enabled":false} を置いてもよい）
bunx wrangler kv key delete --binding PAGE_CACHE --remote "maintenance:site"
```

### 画像生成だけ

```bash
# 開始
bunx wrangler kv key put --binding PAGE_CACHE --remote "maintenance:generation" \
  '{"enabled":true,"endsAt":"2026-11-15T03:00:00+09:00"}'

# 終了
bunx wrangler kv key delete --binding PAGE_CACHE --remote "maintenance:generation"
```

生成画面を開いたままの人にも、1 分ごとの取り直し（`/api/generation/notice` の `maintenance`）で帯とボタンの状態が切り替わる。
これは画面側の表示だけなので、生成の API（バックエンド）は別に止めること。

### 確認

```bash
curl -sI https://www.aipictors.com/ | grep -iE '^HTTP|retry-after|x-robots-tag'
curl -s https://www.aipictors.com/api/generation/notice
```

## 運営の確認（バイパス）

サイト全体のメンテナンス中でも、`bypassToken` を知っている人はふだんのサイトを見られる。再開前の確認に使う。

1. `https://www.aipictors.com/?maintenance_bypass=<bypassToken>` を開く
2. cookie `aip_maintenance_bypass`（HttpOnly・Secure・1 日）が付き、引数を外した URL へ転送される
3. 以降、そのブラウザではメンテナンス画面が出ない（API の `maintenanceStatus` によるメンテナンス表示も出ない）

- 確認中に描画したページは、移行途中の内容が再開後に残らないよう拠点のキャッシュに置かない
- トークンを変えると（KV の値を置き直すと）古い cookie は効かなくなる
- 確認をやめるときは cookie を消す（シークレットウィンドウで開くと楽）

## ローカルでの確認

```bash
bun run build
bunx wrangler kv key put --binding PAGE_CACHE --local "maintenance:site" \
  '{"enabled":true,"endsAt":"2026-11-15T03:00:00+09:00","bypassToken":"local"}'
bunx wrangler dev --local --port 8799
# http://127.0.0.1:8799/ → 503、http://127.0.0.1:8799/?maintenance_bypass=local → ふだんの画面
```
