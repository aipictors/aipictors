# 画像生成機能

## 生成情報を取得するときの注意点

生成情報を取得する際にはログイン情報を参照するため、
サーバサイドで実行しないように注意が必要。
imageGenerationTaskQueryを使用する際には下記のようにすること。
Node.jsでは必ず未ログインになるので、skipTokenを使ってブラウザ側で実行する。

```
  const { data, error } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            id: props.taskId,
          },
        }
      : skipToken,
  )
```
