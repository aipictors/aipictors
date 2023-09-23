現在、PHPで構築されているAipictorsをNext.jsに移行いたします。
また、バックエンドはGraphQL（Apollo Federation）で構築されています。

- [.vscode](/.vscode) - VSCodeの設定
- [app](/app) - Webサイトを構成するコンポーネントなど
- [graphql](/graphql) - クエリなど
- [docs](/docs) - ルールなど
- [public](/public) - 画像など

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
