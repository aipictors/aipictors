import { Checkbox } from "@/components/ui/checkbox"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
  isSubscribed?: boolean
}

/**
 * 宣伝作品かどうか入力
 */
export const PostFormItemAdvertising = (props: Props) => {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">宣伝作品</p>
        <div className="items-center text-sm opacity-65">
          <p>
            広告枠を使って自身のサービスやプランを宣伝できます。スタンダード、プレミアムプランの場合、1週間に1作品可能です。
          </p>
          <p>広告枠以外の宣伝は規約違反となります。</p>
          <p>一度設定した広告枠は取り消せません。</p>
        </div>
        {props.isSubscribed ? (
          <div className="items-center space-x-2">
            <Checkbox
              onCheckedChange={(value: boolean) => {
                props.onChange(value)
              }}
              id="ad-editable"
              checked={props.isChecked}
            />
            <label className="text-sm" htmlFor="ad-editable">
              {"宣伝作品に設定する"}
            </label>
          </div>
        ) : (
          <Link target="_blank" to="/plus" className="block">
            <Button variant={"secondary"} className="w-full">
              {"推薦機能など特典を得れるAipictors+はこちら"}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
