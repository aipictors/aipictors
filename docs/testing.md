# Testing

単体テストのライブラリとしてVitestが使用されています。

## CLI

こちらのマンドでテストを実行します。

```
$ pnpm run test
```

継続してテストを実行する場合はこちらのコマンドを使用します。

```
$ pnpm run test:watch
```

## ディレクトリ

テストのファイルは、テストするファイルと同じディレクトリにの`__tests__`を作成します。

```
foo.ts
__tests__/foo.test.ts
```
