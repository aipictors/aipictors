# ルール

## 関数名

以下の変数名のルールに従って変数を定義してます。

- onXxx - Props


```tsx
type Props = {
  onClick(): void
}

const MyButton: React.FC<Props> = (props) => {
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

