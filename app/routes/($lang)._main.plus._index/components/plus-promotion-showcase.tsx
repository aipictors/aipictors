import { MegaphoneIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { PromotionWorkCard } from "~/components/work/work-promotion"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"

/**
 * プランのページの宣伝枠の紹介（比較表の折りたたみの中だけだと見つからないので、見本つきで出す）
 */
export function PlusPromotionShowcase() {
  const t = useTranslation()
  return (
    <section className="grid items-center gap-5 rounded-3xl border bg-gradient-to-br from-amber-50 via-pink-50 to-violet-50 p-5 md:grid-cols-[1fr_220px] md:p-7 dark:from-amber-950/30 dark:via-pink-950/30 dark:to-violet-950/30">
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-bold text-pink-600 text-sm dark:text-pink-400">
          <MegaphoneIcon className="size-4" />
          {t("スタンダード・プレミアムの特典", "Standard & Premium perk")}
        </p>
        <h2 className="font-bold text-xl md:text-2xl">
          {t(
            "毎週1作品、ホームのいちばん目立つ場所で宣伝",
            "Promote one work a week at the top of the home page",
          )}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(
            "投稿のときに「宣伝作品に設定する」にチェックすると、7日間ホームの「クリエイターの宣伝」に大きく表示され、関連リンクへのボタンも付きます。プランがなくても、プレミアムコイン500枚で出せます。",
            "Check “Set as Advertising Work” when posting to feature it in “From our creators” for 7 days, with a button to your link. No plan? Use 500 premium coins instead.",
          )}
        </p>
        <Button asChild variant="secondary">
          <Link to="/promotion">
            {t("宣伝枠について詳しく", "Learn about promotions")}
          </Link>
        </Button>
      </div>
      <div className="mx-auto w-full max-w-[220px]">
        <PromotionWorkCard
          title={t("あなたの作品のタイトル", "Your work's title")}
          userName={t("あなた", "You")}
          relatedUrl="https://example.com"
        />
      </div>
    </section>
  )
}
