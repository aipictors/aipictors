この手順書にないパターンの実装があれば開発者に確認しなさい。

# Aipictors（Remix + Cloudflare Pages）

## Big Picture（重要な境界）
- フロントはRemix（Vite）で、Cloudflare Pages Functionsで配信する（エントリは `functions/[[path]].ts`）。
- ルーティングはファイルベースの `flatRoutes()`（定義: `app/routes.ts`、実体: `app/routes/**/route.tsx`）。
- GraphQLは `gql.tada` + `@apollo/client` を使用（例: `app/routes/($lang)._main.posts.$post._index/route.tsx`）。
- GraphQL endpointはSSR/ブラウザで切り替わる（`app/config.ts` の `graphql.endpoint`、envは `app/env.ts`）。
- 画像生成系は「ログイン情報参照のためSSRで取得しない」注意あり（`app/routes/($lang).generation/README.md` の `skipToken` 参照）。
- App/Flutter階層は審査に影響するため“他階層へ遷移禁止”（`app/routes/($lang).app._index/README.md` と `app/routes/($lang).flutter/README.md`）。

## 開発ワークフロー（bun）
- 依存関係: `bun i`
- 開発: `bun run dev`（Remix `vite:dev`。`vite.config.ts` で `cloudflareDevProxyVitePlugin()` を使用）
- ビルド/ローカル起動: `bun run build` / `bun run start`（`wrangler pages dev`）
- 型チェック: `bun run check`
- フォーマット/リント: `bun run format`（Biome）/ `bun run lint`（app配下のみ）
- テスト: `bun test`
- `bun run dev` 実行前に `predev` で本ファイルが `.clinerules` にコピーされる（AIルールのソースはここ）。

## 実装ルール（このリポジトリの配置/慣習）
- ページ専用コンポーネントは同ページ配下の `components/`、ページ専用型は `types/` に置く（例: `app/routes/*/components`）。
- ファイル名は小文字+ハイフン。UIはTailwind + shadcn/ui。`app/components/ui/` は生成物なので基本的に編集しない。
- コンポーネントのpropsは `props: Props` で受ける形式が多い（例: `HomeBanners`）。Remixのrouteモジュールは `default export` が必要。
- TypeScriptは `type` を優先し、`any` は避ける（既存コードに合わせる）。

## 会話
- 日本語
