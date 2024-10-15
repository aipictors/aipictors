import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

type Props = {
  onChange: (value: string) => void
  value: string
}

/**
 * 修正内容入力
 */
export function PostFormItemFix(props: Props) {
  const isFilled = props.value.trim() !== ""

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">修正内容（必須）</p>
        <div className="items-center text-sm opacity-65">
          <p>{"すでに修正済みの場合は修正内容をご記入ください。"}</p>
        </div>
        <Input
          onChange={(e) => {
            props.onChange(e.target.value)
          }}
          value={props.value}
          placeholder="修正内容を入力"
          className={cn({
            "border-green-500": isFilled,
            "border-gray-300": !isFilled,
          })}
        />
      </CardContent>
    </Card>
  )
}
