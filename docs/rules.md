# ルール

いくつか開発時のルールのメモを残します。

## コンポーネント

基本的に以下のようなコードを書いてます。

- 分割代入引数を使用しない
- export defaultを使用しない
- Propsの型を定義する

これはサンプルのコードです。

```tsx
type Props = {
  onClick(): void
}

export function MyButton (props: Props) {
  const onClick = () => {
    props.onClick()
  }

  return (
    <Box>
      <Button onClick={onClick}>{"Click"}</button>
    </Box>
  )
}
```

## Appディレクトリ

パスにならないディレクトリはアンダースコアを使用します。

- _components
- _hooks

ファイル名は小文字とハイフンを使用します。

- my-component.tsx
- my-component.test.tsx

pageやlayoutのようなルールのあるファイル以外は_utilsなどのディレクトリにまとめます。

```
├── page.tsx
├── _utils
│   └── my-util.ts
└── _hooks
    └── use-my-hook.ts
```