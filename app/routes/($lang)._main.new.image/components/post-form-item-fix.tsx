import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"

type Props = {
  onChange: (value: string) => void
  value: string
}

/**
 * 運営への修正完了の報告に添えるひとこと（任意。書かなくても、何を直したかは自動で届く）
 */
export function PostFormItemFix(props: Props) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">運営へのひとこと（任意）</p>
        <p className="text-muted-foreground text-xs">
          「更新する」を押すと修正完了が自動で届きます。補足があれば書いてください
        </p>
        <Input
          onChange={(e) => {
            props.onChange(e.target.value)
          }}
          value={props.value}
          placeholder="例: 3枚目の画像を差し替えました"
          maxLength={500}
        />
      </CardContent>
    </Card>
  )
}
