# Aipictors Web

Remix（Vite）+ Cloudflare Workers + GraphQL（gql.tada / Apollo）。パッケージ管理は bun。
人間向けの入口は README.md・CONTRIBUTING.md、Claude Code 向けの進め方は CLAUDE.md（このファイルを読み込んだうえで追記している）。

## コマンド

| 目的 | コマンド | 備考 |
| --- | --- | --- |
| 依存 | `bun i` | |
| 開発 | `bun run dev` | `../aipictors-system/.env` があれば読む |
| 型チェック | `bun run check` | `tsc --incremental`。初回 約 1.5 分、2 回目以降は変えたファイルだけで数秒 |
| 型チェック（全部） | `bun run check:full` | キャッシュを使わない |
| まとめて確認 | `bun run verify` | oxlint → `bun test` → `bun run check` |
| テスト | `bun test` | happy-dom。`*.test.ts(x)` は対象の隣か `__tests__/` |
| ビルド | `bun run build` | `remix vite:build` の後に `wrangler pages functions build` |
| GraphQL のスキーマ更新 | `bun run gql:generate` | 下記 |
| リント | `bun run lint`（Biome）| CI は oxlint（`bun run verify` と同じ設定） |

push の前に `bun run verify` を通す（最低限 `bun run check` と `bun test`）。

## ルート

- `app/routes.ts` の `flatRoutes()`。ルートになるのは `app/routes/<名前>/route.tsx`（または `route.ts`）だけで、同じディレクトリの他のファイルはルートにならない。
- 配信の入口は `functions/[[path]].ts`（Workers）。
- `($lang)` は省略できる言語の接頭辞（`/en/...`）。リンクと遷移は `~/lib/app/locale-router` を使う。文言は `useTranslation()` の `t("日本語", "English")`。
- R18 のページは `($lang).r.*`、`($lang)._main.r.*`。
- ページ専用のものはそのルートの `components/`、`hooks/`、`utils/`、`types/` に置く。ファイル名は小文字とハイフン。
- `app/components/ui/` は shadcn/ui の生成物なので基本的に編集しない。
- `($lang).app.*` と `($lang).flutter` はアプリから開くページで、審査に影響するため他の階層へ遷移しない（各 README）。
- ログインが必要な画像生成の取得は SSR で行わない（`app/routes/($lang).generation/README.md` の `skipToken`）。

## GraphQL

- `import { graphql } from "gql.tada"` で書く。結果の型はスキーマから付くので、`useQuery<...>` の型引数や `as` で手書きしない。
- 共通部分はフラグメントにして `graphql(query, [Fragment])` に渡す。読むときは `readFragment`、props の型は `FragmentOf<typeof Fragment>`。`@_unmask` 付きのフラグメントはそのまま読める。
- enum の型は `~/lib/introspection-enum` の `IntrospectionEnum<"Rating">`。
- サーバーの loader は `~/lib/loader-client` の `loaderClient`（未ログイン扱い）、ブラウザは `useQuery`。
- `schema.graphql` は git 管理。バックエンドのスキーマを変えたら `bun run gql:generate` を実行して、`schema.graphql` と `app/graphql-env.d.ts` の両方をコミットする。本番 API（https://api.aipictors.com/）から取得する。
- `app/graphql-env.d.ts` は生成物。手で書かない（SDL を入れると tsc が止まる。CI も生成結果との差で落ちる）。

## 書き方

- `any`、`as any`、`@ts-ignore` で型エラーを隠さない。API の値は nullable のことが多いので null を処理する。
- API ルートの JSON は `~/lib/server/json-response.server` の `toJsonResponse`。
- サーバー専用のコードは `*.server.ts`。
- テストで外の API に取りに行かない（`fetch` を差し替える）。

## デプロイ

- `main` への push がそのまま本番デプロイになる（`.github/workflows/deploy.yml`、約 1 分）。ビルドとリント・単体テストを同時に走らせ、テストが通ったら `wrangler deploy`。
- 型チェックは `test.yml` で並行して走り、**デプロイを止めない**。だから push の前に手元で `bun run check` を通す。
- `*.md`・`docs/**` だけの変更ではデプロイしない。続けて push すると古いデプロイは止まる。
- ビルドの環境変数はリポジトリの `.env` と CI の `VITE_MICRO_CMS_API_KEY`。Worker の実行時の変数は `wrangler.toml` と Cloudflare の設定。
- デプロイの確認は HTTP 200 で判定しない。ページの中身（変更した箇所の HTML やデータ）で確かめる。
- 詳細と戻し方は `docs/deploy.md`。
