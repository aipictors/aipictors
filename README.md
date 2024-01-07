このリポジトリはWebサイトを構成します。

> **NOTE**
> 現在、PHPで構築されているAipictorsをNext.jsに移行します。
> また、バックエンドには、GraphQL（Apollo Federation）が用意されています。

## 環境構築

必要なモジュールを取得する。

```bash
$ pnpm install
```

GraphQLのコードをビルドする。

```bash
$ pnpm run prebuild
```

開発サーバーを起動する。

```bash
$ pnpm run dev
```

## その他

- [Biomeについて](/docs/biome.md)
- [単体テストについて](/docs/testing.md)
