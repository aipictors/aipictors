# CLAUDE.md

Claude Code がこのリポジトリで作業するときの手引き。共通の決まりは AGENTS.md（下で読み込む）にあり、ここには Claude 向けの進め方だけを書く。

@AGENTS.md

## 作業の進め方

1. `git fetch && git switch -c <作業名> origin/main`（別の作業と並ぶときは `git worktree add`）。ブランチは `main` だけを残す運用。
2. 変更する画面のルートを探す: URL `/posts/123` → `app/routes/($lang)._main.posts.$post._index/route.tsx`。ディレクトリ名の `.` が URL の `/`、`$x` がパラメータ、`_main` はレイアウト（URL に出ない）。
3. 書く。近くの既存コードの書き方（props の受け方、`t()`、フラグメント）に合わせる。
4. 確かめる（速い順）:
   - `bun test <関係するファイル>` … 数秒
   - `bun run check` … 差分だけなので 2 回目以降は数秒。初回は約 1.5 分かかるのでバックグラウンドで走らせてよい
   - 見た目の変更は `bun run dev` で開いて確かめる
5. push の前に `bun run verify`。`main` への push は約 1 分で本番に出る。型チェックはデプロイを止めないので、ここで必ず通す。
6. デプロイ後は、変えた箇所の HTML やデータを https://www.aipictors.com で確かめる（200 が返るだけでは確認にならない）。

## 探し方

| 探すもの | 場所 |
| --- | --- |
| 画面 | `app/routes/**/route.tsx`（URL から上の規則で） |
| GraphQL の型・フィールド | `schema.graphql`（`grep -n "type WorkNode" schema.graphql`） |
| 文言 | `t("日本語"` で grep |
| 共通コンポーネント | `app/components/`（`ui/` は shadcn/ui） |
| 配信・キャッシュ・ヘッダー | `functions/[[path]].ts`、`worker-entry.ts`、`public/_headers` |
| ページ固有の注意 | そのルートの `README.md` |

## やらないこと

- `app/graphql-env.d.ts` を手で書く（`bun run gql:generate` の生成物）。
- `any` / `@ts-ignore` / `as` で型エラーを消す。
- `app/components/ui/` を書き換える（必要なら包むコンポーネントを作る）。
- `($lang).app.*` / `($lang).flutter` から他の階層へリンクする。
- テストで外の API に取りに行く。
- 必要もなく `bun run build` を何度も走らせる（約 40 秒。型と単体テストで足りることが多い）。
- メイン画面の配置を大きく変える変更を、運営の確認なしに出す。

## コミット

日本語で、1 行目に「どこを・どうして・なぜ」。例:

```text
作品ページの「XXさんの作品」: 最初は一覧で表示する（横スクロールに気づかれず、下まで見られていなかった）
```

## 関連リポジトリ

| リポジトリ | 役割 |
| --- | --- |
| `aipictors/aipictors-system`（非公開） | GraphQL API（api.aipictors.com）。スキーマを変えたらここで `bun run gql:generate` |
| `nakatsuka-k/aipictors-api` | Cloudflare Workers + D1 の API（backend.aipictors.com）。決済・生成など |
| `aipictors/app` | Flutter のアプリ。`($lang).app.*` / `($lang).flutter` のページを開く |
