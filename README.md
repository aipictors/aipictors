現在、PHPで構築されているAipictorsをNext.jsに移行します。
また、バックエンドには、GraphQL（Apollo Federation）が用意されています。

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
$ npm install
```

GraphQLのコードをビルドする。

```bash
$ npm run prebuild
```

開発サーバーを起動する。

```bash
$ npm run dev
```
