# テスト

単体テストは **bun test**（`bun:test`）と happy-dom、Testing Library で書きます。

## 実行

```bash
bun test                       # 全部（約 10 秒）
bun test app/utils             # ディレクトリを指定
bun test format-date           # ファイル名の一部で絞る
bun test --watch               # 保存のたびに実行
```

`bunfig.toml` の `preload` で happy-dom（`scripts/test/happydom.ts`）と Testing Library（`scripts/test/testing-library.ts`）を読み込んでいます。

## 置き場所

テストするファイルの隣に置くか、同じディレクトリの `__tests__/` に置きます。

```text
format-date.ts
format-date.test.ts
# または
__tests__/format-date.test.ts
```

## 書き方の決まり

- `import { describe, expect, test } from "bun:test"`。
- 外の API やサイトには取りに行かない。`fetch` は `spyOn(globalThis, "fetch")` などで差し替え、テストの後で戻す。
- 日時に依存するときは時刻を引数で渡せるようにして、固定の値で試す。
- CI（`deploy.yml`）では単体テストが落ちるとデプロイしません。
