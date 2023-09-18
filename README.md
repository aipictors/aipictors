## 概要

NextJSで構築されたAipictorsのリポジトリです。
現在、PHPで構築されているAipictorsをNextJS版に移行いたします。

フロントエンドをNextJS、
バックエンドはGraphQLのクエリを使ってAPI経由でデータの取得を行います。
クエリは下記に定義されています。
https://github.com/aipictors/aipictors/tree/main/graphql/queries

## 環境構築方法

必要なモジュールを取得する。

```bash
$ yarn install
```

GraphQLのコードをビルドする。

```bash
$ yarn build:graphql
```

開発サーバーを起動する。

```bash
$ yarn dev
```

## コーディング時の諸注意

* ESLintを設定して var などの危険なコードを未然に防いでください。
* 自動整形ツール「Prettier」をインストールして整形を行ってください。
