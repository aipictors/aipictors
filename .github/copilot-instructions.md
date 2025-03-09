この手順書にないパターンの実装があれば開発者に確認しなさい。

# Project

このリポジトリは「Aipictors」というWebサービスのフロントエンドの実装です。

## ルール

- ページでのみ使用されるコンポーネントはそのページのディレクトリに作成する

## ディレクトリ構成

- `app/assets/*.md` - 利用規約などマークダウンのテキスト
- `app/components/` - Reactのコンポーネント
- `app/components/app/` - Reactの固定のコンポーネント
- `app/components/button/` - ボタンに関するコンポーネント
- `app/components/drag/` - Dndに関するコンポーネント
- `app/components/page/` - 404など固定のページに関するコンポーネント
- `app/components/tag/` - タグに関するコンポーネント
- `app/components/ui/` - shadcn/uiのUIライブラリ（書き換え不可）
- `app/contexts/auth-context.ts` - ログイン認証に関する状態管理
- `app/errors/*-error.ts` - エラーのクラス
- `app/hooks/use-*.ts` - ReactのHooks
- `app/lib/` - 複数の箇所で使用される自作ライブラリ
- `app/routes/*` - ページ
- `app/routes/*/route.tsx` - ページ
- `app/routes/*.r.*/route.tsx` - R18のページ
- `app/types` - 複数の箇所で使用される型定義
- `app/utils` - 複数の箇所で使用される小さな関数
- `app/config.ts` - 全体で使用される設定
- `app/env.ts` - 環境変数
- `app/root.tsx` - 全体のレイアウト
- `vite.config.ts` - Viteの設定

## ライブラリ

- `hono` - API
- `yoga` - GraphQL
- `@pothos/core` - GraphQLのスキーマを定義する
- `@prisma/client` - データベースのORM

## 開発パターン

### ページを追加する

ディレクトリ「app/routes」の配下のファイル「route.tsx」がページになる。

- ページのパスはReactRouter「flat-routes」に従って作成しなさい。

以下のファイルを参考にしなさい。

- `app/routes/*/route.tsx`
- `app/routes/*/-components/*.tsx` - そのページでのみ使用されるコンポーネント
- `app/routes/*/-types/*.ts` - そのページでのみ使用される型

また、「_main」はレイアウトになっているので基本的に使用される。

# 開発

## ファイル

- 小文字でハイフンで繋ぐ
- 1つのファイルに関数/クラス/型を1つのみ定義する

## テスト

- 副作用のあるファイルではテストは作成しない
- `bun:test`の`test`と`expect`のみを使用する
- testのタイトルは日本語を使用する
- ファイル名は「.test」

以下のディレクトリではテストを作成する

- **/domain/*.entity.ts
- **/domain/*.value.ts
- **/lib/*.ts

# コード規約

- 説明的な命名規則の採用
- as型アサーションの使用禁止
- interfaceの代わりにtypeを使用
- for文ではfor-ofを使用してforEachを使用しない
- 関数の引数では分割代入を使用し
- if-elseを使用しない
- if文をネストせずに早期リターン
- 変数名を省略しない
- 引数が複数ある場合は変数名「props」のObjectにして型「Props」を定義
- 可能な限りconstを使用、letやvarを避ける
- コメントを適切に追加、コードの可読性を高める

## 関数

- 純粋関数を優先
- 不変データ構造を使用
- 副作用を分離
- 型安全性を確保

## クラス

- Staticのみのクラスを定義しない
- クラスの継承を使用しない
- イミュータブル

## TypeScript

- 関数の引数では変数propsを使用する
- any型を避ける

## React

- TailwindCSSを使用する
- shadcn/uiを使用する
- コンポーネントは export function ComponentName () {} の形式で記述する

# 会話

- 日本語
