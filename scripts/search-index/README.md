# 作品のタイトル・説明の検索用データ（Cloudflare D1: aipictors-search）

- 検索: `app/lib/server/work-text-search.server.ts`（FTS5 trigram。2 文字以下はタイトルの LIKE）
- テーブル定義: `schema.sql`
- 同期: aipic サーバーの cron で `sync_works.py` を動かす（`/root/aipictors-search/sync_works.py`）
  - `*/10 * * * * python3 /root/aipictors-search/sync_works.py recent`
  - `40 4 * * * python3 /root/aipictors-search/sync_works.py days 30`（いいね数の更新）
  - 設定は `/root/.config/aipictors-search.env`（CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN / D1_DATABASE_ID）
- 全件を入れ直すときは MySQL から TSV を出して `INSERT OR REPLACE` の SQL に分け、`wrangler d1 execute aipictors-search --remote --file` で流す（約 70 万件で数分）
