現在、PHPで構築されているAipictorsをNext.jsに移行いたします。
また、バックエンドはGraphQL（Apollo Federation）で構築されています。

ディレクトリ|↓
:--|:--
[app](/app)|Webサイトを構成するコンポーネントなど
[graphql](/graphql)|クエリなど
[public](/public)|画像など
[.vscode](/.vscode)|VSCodeの設定
[docs](/docs)|開発でのルールなど

## 環境構築

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
