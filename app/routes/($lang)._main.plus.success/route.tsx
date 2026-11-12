import { Button } from "~/components/ui/button"
import { Link } from "~/lib/app/locale-router"
import { useNavigate, useSearchParams } from "@remix-run/react"
import { CheckIcon, InfoIcon, Loader2 } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { useTranslation } from "~/hooks/use-translation"
import { InviteLinkRow } from "~/components/invite-link-row"
import { clearTrialStatusCache } from "~/hooks/use-lite-offer"
import { fetchTrialStatus } from "~/lib/trial-api"
import { takeEnglishReturnPath } from "~/utils/checkout-locale"
import { toApproxUsdText } from "~/utils/to-approx-usd-text"
import { toTrialDateText } from "~/utils/to-trial-date-text"
import { trackGrowthEventOnce } from "~/utils/track-growth-event"
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

  // 無料お試し（?trial=1）: お試しが始まったか、カードの重複などで取り消されたかを確かめる
  const isTrial = searchParams.get("trial") === "1"

  const [trialState, setTrialState] = useState<
    | { kind: "loading" }
    | { kind: "trialing"; trialEnd: number }
    | { kind: "duplicate_card" }
    | { kind: "repeat" }
    | { kind: "pending" }
  >({ kind: "loading" })

  useEffect(() => {
    if (!isTrial || authContext.isLoading || authContext.isNotLoggedIn) return
    let isCancelled = false
    // 始めた直後より前のお試しの記録（以前のもの）は、今回の結果として扱わない
    const startedAfter = Date.now() / 1000 - 30 * 60
    const confirm = async (attempt: number) => {
      clearTrialStatusCache()
      const status = await fetchTrialStatus()
      if (isCancelled) return
      const latest = status?.latestTrial ?? null
      if (latest !== null && latest.createdAt >= startedAfter) {
        if (latest.status === "trialing") {
          setTrialState({ kind: "trialing", trialEnd: latest.trialEnd })
          trackGrowthEventOnce("trial_started", "success")
          return
        }
        if (latest.status === "rejected_duplicate_card") {
          setTrialState({ kind: "duplicate_card" })
          trackGrowthEventOnce("trial_rejected", "duplicate_card")
          return
        }
        if (latest.status === "rejected_repeat") {
          setTrialState({ kind: "repeat" })
          trackGrowthEventOnce("trial_rejected", "repeat")
          return
        }
      }
      // 反映（Stripe からの通知）はふつう数秒で届く
      if (attempt < 5) {
        setTimeout(() => confirm(attempt + 1), 2000)
      } else {
        setTrialState({ kind: "pending" })
      }
    }
    confirm(0)
    return () => {
      isCancelled = true
    }
  }, [isTrial, authContext.isLoading, authContext.isNotLoggedIn])

  if (isTrial) {
    const isRejected =
      trialState.kind === "duplicate_card" || trialState.kind === "repeat"
    const date =
      trialState.kind === "trialing"
        ? toTrialDateText(trialState.trialEnd, t.isEnglish)
        : ""
    return (
      <div className="mx-auto w-full max-w-md space-y-6 px-6 pt-12 text-center">
        <div className="flex w-full justify-center">
          {trialState.kind === "loading" ? (
            <Loader2 className="size-10 animate-spin text-violet-500" />
          ) : isRejected || trialState.kind === "pending" ? (
            <span className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <InfoIcon className="size-8" />
            </span>
          ) : (
            <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-lg shadow-violet-500/25">
              <CheckIcon className="size-8" />
            </span>
          )}
        </div>
        {trialState.kind === "loading" && (
          <p className="text-sm">
            {t("お試しの開始を確認しています…", "Confirming your free trial…")}
          </p>
        )}
        {trialState.kind === "trialing" && (
          <div className="space-y-4">
            <p className="text-balance font-bold text-xl">
              {t(
                "7日間の無料お試しを開始しました",
                "Your 7-day free trial has started",
              )}
            </p>
            <dl className="grid gap-2 text-left text-sm sm:grid-cols-2">
              <div className="rounded-xl border bg-card px-3 py-2">
                <dt className="text-muted-foreground text-xs">
                  {t("無料の期間", "Free until")}
                </dt>
                <dd className="font-bold">{t(`${date} まで`, date)}</dd>
              </div>
              <div className="rounded-xl border bg-card px-3 py-2">
                <dt className="text-muted-foreground text-xs">
                  {t("その後の料金", "After that")}
                </dt>
                <dd className="font-bold">
                  {t(
                    `${date} から ¥480/月（税込）`,
                    `¥480/mo from ${date} (${toApproxUsdText(480)})`,
                  )}
                </dd>
              </div>
            </dl>
            <p className="text-left text-sm leading-relaxed">
              {t(
                "お試し中に解約すれば料金はかかりません（解約しても、お試しの終わりまで使えます）。解約はプランのページからいつでもできます。終了の3日前にメールでお知らせします。",
                "Cancel during the trial and you won't be charged — you keep access until the trial ends. You can cancel anytime from the plans page. We'll email you 3 days before the trial ends.",
              )}
            </p>
          </div>
        )}
        {trialState.kind === "duplicate_card" && (
          <div className="space-y-3">
            <p className="text-balance font-bold text-xl">
              {t(
                "無料お試しを開始できませんでした",
                "We couldn't start your free trial",
              )}
            </p>
            <p className="text-left text-sm leading-relaxed">
              {t(
                "このカードは別のアカウントの無料お試しで使われているため、今回の申込みは取り消しました。料金は請求されていません。別のカードでもう一度お試しいただくか、初月半額でプランを始められます。",
                "This card has already been used for a free trial on another account, so we cancelled this sign-up. You haven't been charged. You can try again with a different card, or start a plan with 50% off the first month.",
              )}
            </p>
          </div>
        )}
        {trialState.kind === "repeat" && (
          <div className="space-y-3">
            <p className="text-balance font-bold text-xl">
              {t(
                "無料お試しは1回だけご利用いただけます",
                "The free trial can only be used once",
              )}
            </p>
            <p className="text-left text-sm leading-relaxed">
              {t(
                "すでにお試しをご利用のため、今回の申込みは取り消しました。料金は請求されていません。",
                "You've already used your free trial, so we cancelled this sign-up. You haven't been charged.",
              )}
            </p>
          </div>
        )}
        {trialState.kind === "pending" && (
          <div className="space-y-3">
            <p className="text-balance font-bold text-xl">
              {t("反映まで少しお待ちください", "Almost there")}
            </p>
            <p className="text-left text-sm leading-relaxed">
              {t(
                "お申込みは受け付けました。お試しの反映に少し時間がかかっています。数分たってからプランのページをご確認ください。反映されないときは、お問い合わせからご連絡ください。",
                "We've received your sign-up, but it's taking a little longer than usual to show up. Check the plans page in a few minutes, and contact us if it still isn't there.",
              )}
            </p>
          </div>
        )}
        {trialState.kind !== "loading" && (
          <div className="flex flex-col items-center gap-2">
            {isRejected ? (
              <Button asChild className="h-11 w-full rounded-xl">
                <Link to="/plus#plans" replace>
                  {t("プランのページに戻る", "Back to plans")}
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="h-11 w-full rounded-xl">
                  <Link to="/generation">
                    {t("さっそく生成する", "Start generating")}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-11 w-full rounded-xl"
                >
                  <Link to="/plus" replace>
                    {t(
                      "プランの管理（解約はこちら）",
                      "Manage plan (cancel here)",
                    )}
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
        {trialState.kind === "trialing" && <InviteLinkRow source="success" />}
      </div>
    )
  }

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
