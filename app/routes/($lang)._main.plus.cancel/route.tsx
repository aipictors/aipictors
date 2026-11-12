import { useNavigate } from "@remix-run/react"
import { useEffect } from "react"
import { Button } from "~/components/ui/button"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { takeEnglishReturnPath } from "~/utils/checkout-locale"

/**
 * サブスクの決済をキャンセルした場合のページ（決済画面で「戻る」を押したとき）
 */
export default function PlusCancel () {
  const t = useTranslation()

  const navigate = useNavigate()

  // 英語のページから決済へ進んだ人は、英語のページに戻す（Stripe から戻る URL は日本語のページに決まっている）
  useEffect(() => {
    const path = takeEnglishReturnPath()
    if (path !== null) navigate(path, { replace: true })
  }, [])

  return (
    <div className="mx-auto w-full max-w-sm space-y-6 px-6 pt-16 text-center">
      <div className="space-y-2">
        <p className="text-balance font-bold text-xl">
          {t("お支払いは行われていません", "No payment was made")}
        </p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t(
            "決済画面から戻りました。料金は請求されていません。プランはいつでも選び直せます。",
            "You left checkout before paying, so you haven't been charged. You can pick a plan again whenever you're ready.",
          )}
        </p>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Button asChild className="h-11 w-full rounded-xl">
          <Link to="/plus#plans" replace>
            {t("プランを選び直す", "Back to plans")}
          </Link>
        </Button>
        <Button asChild variant="ghost" className="h-11 w-full rounded-xl">
          <Link to="/generation">
            {t("無料のまま生成を続ける", "Keep generating for free")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
