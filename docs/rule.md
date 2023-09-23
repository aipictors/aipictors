# ルール

## 関数名

以下の変数名のルールに従って変数を定義してます。

- handleXxx - 関数の内部
- onXxx - Props


```tsx
type Props = {
  onClick(): void
}

const MyButton: React.FC<Props> = (props) => {
  const handleClick = () => {
    props.onClick()
  }

  return (
    <Box>
      <Button onClick={handleClick}>{"Click"}</button>
    </Box>
  )
}
```

