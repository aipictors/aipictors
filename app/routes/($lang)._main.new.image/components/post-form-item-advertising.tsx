import { Checkbox } from "~/components/ui/checkbox"
import { Link } from "~/lib/app/locale-router"
import { Card, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
  isSubscribed?: boolean
  hasLink?: boolean
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
        <p className="text-sm">
          {t(
            "自分のサービスや作品集を、より多くの人に見てもらえる枠です。スタンダード・プレミアムプランで週に1作品使えます。",
            "Show your service or portfolio to more people. Available once a week on the Standard and Premium plans.",
          )}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            {t(
              "公開から7日間、ホームの「クリエイターの宣伝」に大きく表示されます",
              "Featured prominently in “From our creators” on the home page for 7 days after publishing",
            )}
          </li>
          <li>
            {t(
              "作品ページに宣伝の帯と、関連リンクへのボタンが出ます",
              "Your work page gets a promotion banner with a button to your related link",
            )}
          </li>
          <li>
            {t(
              "一覧のサムネイルに PR のしるしが付きます",
              "Thumbnails in lists get a PR mark",
            )}
          </li>
        </ul>
        <div className="space-y-0.5 text-muted-foreground text-xs">
          <p>
            {t(
              "広告枠以外での宣伝は規約違反です。",
              "Promotions outside of this ad space are against the terms.",
            )}
          </p>
          <p>
            {t(
              "一度設定すると取り消せません。",
              "Once set, this cannot be canceled.",
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
            {props.isChecked && !props.hasLink && (
              <p className="mt-2 text-amber-600 text-xs dark:text-amber-400">
                {t(
                  "関連リンクに宣伝したいページの URL を入れると、作品ページとホームにボタンが出ます。",
                  "Add the page you want to promote as your related link to show a button on your work page and the home page.",
                )}
              </p>
            )}
          </div>
        ) : (
          <Link target="_blank" to="/plus" className="block">
            <Button variant={"secondary"} className="w-full">
              {t(
                "スタンダードプラン以上で使えます",
                "Available on the Standard plan and above",
              )}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
