import { Button } from "~/components/ui/button"
import { Link } from "~/lib/app/locale-router"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { CheckIcon, Loader2 } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { useTranslation } from "~/hooks/use-translation"
import { takeEnglishReturnPath } from "~/utils/checkout-locale"
import { toDateText } from "~/utils/to-date-text"

/**
 * サブスクの決済を完了した場合のページ
 * 自動更新なしのパス（?prepaid=1&session_id=）のときは、ここで反映を確かめる（webhook でも反映される）
 */
export default function PlusSuccess () {
  const [searchParams] = useSearchParams()

  const t = useTranslation()

  const navigate = useNavigate()

  // 英語のページから決済へ進んだ人は、英語のページに戻す（Stripe から戻る URL は日本語のページに決まっている）
  useEffect(() => {
    const path = takeEnglishReturnPath()
    if (path !== null) navigate(path, { replace: true })
  }, [])

  const authContext = useContext(AuthContext)

  const sessionId = searchParams.get("session_id")

  const isPrepaid = searchParams.get("prepaid") === "1" && sessionId !== null

  const [prepaidState, setPrepaidState] = useState<
    | { kind: "loading" }
    | { kind: "done"; periodEnd: number | null }
    | { kind: "pending" }
    | { kind: "unpaid" }
  >({ kind: "loading" })

  useEffect(() => {
    if (!isPrepaid || authContext.isLoading || authContext.isNotLoggedIn) return
    let isCancelled = false
    const confirm = async (attempt: number) => {
      try {
        const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
        const response = await fetch("/api/stripe/prepaid-pass-confirm", {
          method: "POST",
          headers,
          body: JSON.stringify({ sessionId }),
        })
        const json = (await response.json().catch(() => null)) as {
          data: { reflected: boolean; periodEnd?: number; paymentStatus?: string | null } | null
        } | null
        if (isCancelled) return
        if (json?.data?.reflected) {
          setPrepaidState({ kind: "done", periodEnd: json.data.periodEnd ?? null })
          return
        }
        // コンビニ払いなど後から支払う方法では、まだ払われていない。お支払いの確認後に webhook で反映する
        if (json?.data?.paymentStatus === "unpaid") {
          setPrepaidState({ kind: "unpaid" })
          return
        }
      } catch {
        // 下で再試行する
      }
      if (attempt < 5) {
        setTimeout(() => confirm(attempt + 1), 2000)
      } else if (!isCancelled) {
        setPrepaidState({ kind: "pending" })
      }
    }
    confirm(0)
    return () => {
      isCancelled = true
    }
  }, [isPrepaid, authContext.isLoading, authContext.isNotLoggedIn])

  return (
    <>
      <div className="mx-auto w-full max-w-sm space-y-16 px-6 pt-16">
        <div className="space-y-4">
          <div className="flex w-full justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/25">
              <CheckIcon className="size-8" />
            </span>
          </div>
          <div className="space-y-2">
            <p className="text-balance text-center font-bold text-xl">
              {isPrepaid && prepaidState.kind === "unpaid"
                ? t("お支払いをお待ちしています", "Waiting for your payment")
                : t("決済に成功しました", "You're all set")}
            </p>
            {isPrepaid ? (
              prepaidState.kind === "loading" ? (
                <p className="flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  {t("プランを反映しています...", "Activating your plan…")}
                </p>
              ) : prepaidState.kind === "unpaid" ? (
                <p className="text-sm">
                  {t(
                    "お支払い番号は決済画面とメールでお知らせしています。期限までにコンビニでお支払いください。お支払いが確認されると、プランが使えるようになります。",
                    "Your payment number is shown at checkout and in your email. Your plan starts once the payment is confirmed.",
                  )}
                </p>
              ) : prepaidState.kind === "done" ? (
                <p>
                  {prepaidState.periodEnd
                    ? t(
                        `ご購入ありがとうございます。${toDateText(prepaidState.periodEnd)} までプランをご利用いただけます（自動更新はありません）。`,
                        `Thank you! Your pass is active until ${new Date(prepaidState.periodEnd * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tokyo" })} and won't renew.`,
                      )
                    : t(
                        "ご購入ありがとうございます。プランをご利用いただけます（自動更新はありません）。",
                        "Thank you! Your pass is active and won't renew.",
                      )}
                </p>
              ) : (
                <p className="text-sm">
                  {t(
                    "お支払いは完了しています。プランの反映に少し時間がかかっています。数分たっても反映されないときは、お問い合わせからご連絡ください。",
                    "Your payment went through, but activating your plan is taking a little longer than usual. If it isn't active in a few minutes, please contact us.",
                  )}
                </p>
              )
            ) : (
              <p>
                {t(
                  "この度はAipictors+にご登録ありがとうございます。これからもよろしくお願いします。",
                  "Thanks for joining Aipictors+. Your plan is active — every click now makes 4 images.",
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button asChild className="h-11 w-full rounded-xl">
              <Link to="/generation">
                {t("さっそく生成する", "Start generating")}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 w-full rounded-xl">
              <Link to="/plus" replace>
                {t("プランのページに戻る", "Back to plans")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
