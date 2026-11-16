import { MegaphoneIcon } from "lucide-react"
import { useContext } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { Checkbox } from "~/components/ui/checkbox"
import { PromotionWorkCard } from "~/components/work/work-promotion"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

type Props = {
  isChecked?: boolean
  onChange: (value: boolean) => void
  isSubscribed?: boolean
  hasLink?: boolean
  /** ホームでの見え方のプレビューに使う（入力中のタイトル・サムネイル・関連リンク） */
  previewTitle?: string
  previewImageUrl?: string | null
  previewLink?: string | null
}

/**
 * 宣伝作品かどうか入力。ホームの「クリエイターの宣伝」でどう見えるかを入力中の内容でプレビューする
 */
export function PostFormItemAdvertising(props: Props) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const title = props.previewTitle?.trim() ?? ""

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 font-bold text-sm">
            <MegaphoneIcon className="size-4 text-pink-500" />
            {t("宣伝作品", "Advertising Work")}
          </p>
          <Link
            to="/promotion"
            target="_blank"
            className="shrink-0 text-muted-foreground text-xs underline underline-offset-2 hover:text-foreground"
          >
            {t("宣伝枠とは", "About promotions")}
          </Link>
        </div>
        <p className="text-sm leading-relaxed">
          {t(
            "チェックすると、公開から7日間ホームの「クリエイターの宣伝」に大きく表示されます。作品ページには宣伝の帯と関連リンクへのボタン、一覧のサムネイルには PR のしるしが付きます。",
            "When checked, your work is featured in “From our creators” on the home page for 7 days after publishing. Your work page gets a promotion banner and a button to your related link, and thumbnails get a PR mark.",
          )}
        </p>
        <div className="grid items-start gap-3 sm:grid-cols-[180px_1fr]">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs">
              {t("ホームでの見え方（プレビュー）", "Preview on the home page")}
            </p>
            <PromotionWorkCard
              title={title || t("作品のタイトル", "Your title")}
              imageUrl={props.previewImageUrl}
              userName={authContext.displayName ?? t("あなた", "You")}
              userIconUrl={authContext.avatarPhotoURL}
              relatedUrl={props.previewLink}
            />
          </div>
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground text-xs leading-relaxed">
            <li>
              {t(
                "スタンダード・プレミアムプランで週に1作品使えます",
                "Available once a week on the Standard and Premium plans",
              )}
            </li>
            <li>
              {t(
                "プランがなくても、公開した作品のページの「宣伝する」からプレミアムコイン500枚で7日間出せます",
                "Without a plan, use “Promote” on a published work's page (500 premium coins for 7 days)",
              )}
            </li>
            <li>
              {t(
                "宣伝できるのは全年齢と R18 でそれぞれ1作品ずつです",
                "One work each for all-ages and R18 at a time",
              )}
            </li>
            <li>
              {t(
                "一度設定すると取り消せません。宣伝枠以外での宣伝は規約違反です",
                "Once set, it can't be canceled. Promoting outside this slot is against the terms",
              )}
            </li>
          </ul>
        </div>
        {props.isSubscribed ? (
          <div className="space-y-2">
            <label
              htmlFor="ad-editable"
              className="flex w-fit cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                onCheckedChange={(value: boolean) => {
                  props.onChange(value)
                }}
                id="ad-editable"
                checked={props.isChecked}
              />
              {t("宣伝作品に設定する", "Set as Advertising Work")}
            </label>
            {props.isChecked && !props.hasLink && (
              <p className="text-amber-600 text-xs dark:text-amber-400">
                {t(
                  "関連リンクに宣伝したいページの URL を入れると、作品ページとホームに「詳しく見る」ボタンが出ます。",
                  "Add the page you want to promote as your related link to show a “Learn more” button on your work page and the home page.",
                )}
              </p>
            )}
          </div>
        ) : (
          <Button asChild variant={"secondary"} className="w-full">
            <Link target="_blank" to="/plus">
              {t(
                "スタンダードプラン以上で使えます（プランを見る）",
                "Available on the Standard plan and above (see plans)",
              )}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
