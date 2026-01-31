import { Checkbox } from "~/components/ui/checkbox"
import { Link } from "@remix-run/react"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
  isSubscribed?: boolean
}

/**
 * 宣伝作品かどうか入力
 */
export function PostFormItemAdvertising (props: Props) {
  const t = useTranslation()

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="font-bold text-sm">{t("宣伝作品", "Advertising Work")}</p>
        <div className="items-center text-sm opacity-65">
          <p>
            {t(
              "広告枠を使って自身のサービスやプランを宣伝できます。スタンダード、プレミアムプランの場合、1週間に1作品可能です。",
              "You can promote your service or plan using the ad space. For Standard and Premium plans, one work can be promoted per week.",
            )}
          </p>
          <p>
            {t(
              "広告枠以外の宣伝は規約違反となります。",
              "Promotions outside of ad space are against the terms.",
            )}
          </p>
          <p>
            {t(
              "一度設定した広告枠は取り消せません。",
              "Once set, the ad space cannot be canceled.",
            )}
          </p>
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
              {t("宣伝作品に設定する", "Set as Advertising Work")}
            </label>
          </div>
        ) : (
          <Link target="_blank" to="/plus" className="block">
            <Button variant={"secondary"} className="w-full">
              {t(
                "推薦機能など特典を得れるAipictors+はこちら",
                "Get Aipictors+ for promotional features and more",
              )}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
