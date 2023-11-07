# Lang

多言語化に対応するためにDynamic Routesを使用しています。この`[lang]`の箇所には「en」などの言語コードが入ります。

```
/app/[lang]/xxx
```

例えば、このようなURLになります。URLでは「ja」は省略されます。

- /works
- /en/works

現在は日本語と英語のみ対応しています。

# Server Components

サーバーでは、このようにして言語コードを取得できます。

```ts
type Props = {
  params: {
    lang: string
  }
}
```

この値を用いて、タイトルを変更したり、コンテンツを取得したりすることができます。
