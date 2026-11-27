# ルール

コードを書くときの決まりごとです。迷ったら近くの既存コードに合わせてください。

## コンポーネント

- props は分割代入せず `props: Props` で受ける
- `export default` は使わない（Remix のルートモジュール `route.tsx` だけは default export が必要）
- props の型は `type Props = {...}` で定義する（`interface` より `type`）

```tsx
type Props = {
  onClick(): void
}

export function MyButton(props: Props) {
  return <Button onClick={props.onClick}>{"Click"}</Button>
}
```

## ディレクトリ

ルーティングは `flatRoutes()`（`app/routes.ts`）。ルートになるのは `app/routes/<名前>/route.tsx` だけで、同じディレクトリの他のファイルはルートになりません。

```text
app/routes/($lang)._main.posts.$post._index/
├── route.tsx          ← ページ（loader / meta / default export）
├── components/        ← このページだけで使うコンポーネント
├── hooks/
├── utils/
└── types/
```

- 複数のページで使うものは `app/components/`・`app/hooks/`・`app/lib/`・`app/utils/`。
- ファイル名は小文字とハイフン（`my-component.tsx`、`my-component.test.tsx`）。
- サーバー専用のコードは `*.server.ts`、ブラウザ専用は `*.client.ts`。

## GraphQL

- `import { graphql } from "gql.tada"`。結果の型を手で書かない。
- 共通部分はフラグメントにして `graphql(query, [Fragment])` に渡し、`readFragment` で読む（`@_unmask` 付きはそのまま読める）。

詳しくは [AGENTS.md](../AGENTS.md)。
