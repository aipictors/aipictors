import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
  isSubscribed?: boolean
}

/**
 * 修正内容入力
 */
export function PostFormItemFix(props: Props) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">修正内容</p>
        <div className="items-center text-sm opacity-65">
          <p>{"すでに修正済みの場合は修正内容をご記入ください。"}</p>
        </div>
        <Input placeholder="修正内容を入力" />
      </CardContent>
    </Card>
  )
}
