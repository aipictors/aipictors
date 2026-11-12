import { Link } from "~/lib/app/locale-router"
import { getAuth, getIdToken } from "firebase/auth"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { cn } from "~/lib/utils"
import { toDateText } from "~/utils/to-date-text"
import { PassBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-benefit-list"
import { PassImageGenerationBenefitList } from "~/routes/($lang)._main.plus._index/components/pass-image-generation-benefit-list"
import { planCtaClassName } from "~/routes/($lang)._main.plus._index/components/pass-plan-description"
import { PlusAbout } from "~/routes/($lang)._main.plus._index/components/plus-about"
import { TrialStatusBanner } from "~/routes/($lang)._main.plus._index/components/trial-status-banner"
import { useLiteOffer } from "~/hooks/use-lite-offer"
import { useTranslation } from "~/hooks/use-translation"
import { toTrialDateText } from "~/utils/to-trial-date-text"
import { toPassName } from "~/routes/($lang)._main.plus._index/utils/to-pass-name"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { trackGrowthEvent } from "~/utils/track-growth-event"
import type { SubscriptionPause } from "~/routes/api.stripe.subscription-pause/route"
import { usePrepaidPass } from "~/hooks/use-prepaid-pass"
import { PrepaidPassPanel } from "~/routes/($lang)._main.plus._index/components/prepaid-pass-panel"

/**
 * Remix v3_singleFetch モードでは、action が Response を返しても
 * 通常の fetch() には HTML ページが返ることがある。
 * この関数はその両方を透過的にハンドリングし、JSON を取り出す。
 */
async function parseActionResponse<T>(response: Response): Promise<{
  ok: boolean
  json: T | null
  isHtmlWrapped: boolean
  statusHint: string | null
}> {
  const responseText = await response.text()
  const isHtmlWrapped =
    responseText.trim().startsWith("<!DOCTYPE") ||
    responseText.trim().startsWith("<html")

  if (isHtmlWrapped) {
    const statusMatch = responseText.match(/"status","([^"]+)"/)
    // Remix SSR ラップされた場合: streamController の enqueue 内に JSON が埋め込まれている
    // 例: "\"error\",\"data\",{...},\"status\",\"cancellation_requested\""
    // action が成功していれば "\"error\"" の次に null が来る
    // ここでは response.ok + HTML = action 成功とみなす
    return {
      ok: response.ok,
      json: null,
      isHtmlWrapped: true,
      statusHint: statusMatch?.[1] ?? null,
    }
  }

  const json = (() => {
    if (!responseText) return null
    try {
      return JSON.parse(responseText) as T
    } catch {
      return null
    }
  })()

  return { ok: response.ok, json, isHtmlWrapped: false, statusHint: null }
}

export function PlusForm () {
  const t = useTranslation()
  // 英語の画面では、日付とプラン名を英語にする
  const toDate = (time: number) => toTrialDateText(time, t.isEnglish)
  const toName = (type: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS") =>
    t.isEnglish ? (PASS_EN_NAME[type] ?? type) : toPassName(type)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelScheduled, setIsCancelScheduled] = useState(false)
  // 更新の支払いに失敗して未払いのままの契約（プリペイドカードの残高不足など）
  const [unpaidInvoice, setUnpaidInvoice] = useState<{
    passType: string
    amount: number
    hostedInvoiceUrl: string
  } | null>(null)
  const [cancelCompletionMode, setCancelCompletionMode] = useState<null | "requested" | "already_canceled">(null)
  const [isPlanChangeDialogOpen, setIsPlanChangeDialogOpen] = useState(false)
  // 解約の前に、安いプランへの変更を案内する（解約は加入 1 か月以内がいちばん多い）
  const [isRetentionOpen, setIsRetentionOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState<CancelReason | null>(null)
  const [cancelReasonNote, setCancelReasonNote] = useState("")
  // 1 か月休止の予約・休止中（解約の代わり）
  const [pause, setPause] = useState<SubscriptionPause>(null)
  // 未払い・休止がないと確かめられたか（ログイン前に選んだプランの決済を自動で続けてよいかの判定に使う）
  const [resumeChecks, setResumeChecks] = useState({ unpaid: false, pause: false })
  // 自動更新なしのパス（PayPay などの 1 回払い）
  const prepaid = usePrepaidPass()
  // 無料お試し中かどうか（お試し中は、終了日とその後の料金・解約の場所を出す）
  const { latestTrial } = useLiteOffer()
  const [isPlanChangePreviewLoading, setIsPlanChangePreviewLoading] = useState(false)
  const [planChangeRequest, setPlanChangeRequest] = useState<{
    passType: "LITE" | "STANDARD" | "PREMIUM"
    currentPassType: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS"
  } | null>(null)
  const [planChangePreview, setPlanChangePreview] = useState<{
    passType: string
    renewalAmountJpy: number | null
    interval?: "month" | "year"
    chargedNowAmountJpy: number
    prorationDate: number | null
  } | null>(null)
  const { data } = useSuspenseQuery<{
    viewer: {
      id: string
      currentPass: {
        id: string
        type: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS"
        price: number
        periodEnd: number
        paymentProvider: string
      } | null
    } | null
  }>(viewerCurrentPassQuery, {})

  const withAuthHeader = async () => {
    const currentUser = getAuth().currentUser
    if (!currentUser) {
      throw new Error(t("ログインが必要です", "Please log in."))
    }

    const idToken = await getIdToken(currentUser)

    return {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    }
  }

  const onOpenBillingPortal = async () => {
    setIsSubmitting(true)
    try {
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/billing-portal", {
        method: "POST",
        headers,
      })
      const { ok, json } = await parseActionResponse<{
        error: string | null
        data: { url: string } | null
      }>(response)
      if (ok && !json?.error && json?.data?.url) {
        window.location.href = json.data.url
        return
      }
      toast(t(json?.error ?? "お支払い方法の変更画面を開けませんでした。", "We couldn't open the page to change your payment method."))
    } catch {
      toast(t("お支払い方法の変更画面を開けませんでした。", "We couldn't open the page to change your payment method."))
    }
    setIsSubmitting(false)
  }

  const onCancelCurrentSubscription = async (reason?: CancelReason) => {
    if (isCancelScheduled) {
      toast(t("すでに解約手続き済みです。次回更新日までは利用できます。", "You've already cancelled. You can keep using your plan until the renewal date."))
      return
    }

    // 理由を選んだ画面から来たときは、その画面を確認とする
    if (!reason && !window.confirm(t("現在のサブスクを解約します。よろしいですか？", "Cancel your current plan?"))) {
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-cancel", {
        method: "POST",
        headers,
        body: JSON.stringify({
          reason: reason ?? null,
          reasonNote: reason === "other" ? cancelReasonNote : null,
        }),
      })

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: { status: string } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast(t("解約に失敗しました。", "We couldn't cancel your plan."))
          return
        }
        // Remix が HTML を返したが action は成功済み
        setIsCancelScheduled(true)
        setCancelCompletionMode("requested")
        toast(t("解約手続きが完了しました。メールが届かない場合でも、この画面に解約予定日が表示されていれば完了しています。", "Your plan is cancelled. Even if you don't get an email, the cancellation is complete as long as this page shows an end date."))
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(t(json?.error ?? "解約に失敗しました。", "We couldn't cancel your plan."))
        return
      }

      setIsCancelScheduled(true)
      setCancelCompletionMode(
        json.data.status === "already_canceled" ? "already_canceled" : "requested",
      )
      toast(
        json.data.status === "already_canceled"
          ? t("すでに解約手続きは完了しています。キャンセルボタンが表示される場合でも、表示キャッシュの可能性があるためご安心ください。", "Your plan is already cancelled. If you still see a cancel button, it may just be a cached page.")
          : t("解約手続きが完了しました。メールが届かない場合でも、この画面に解約予定日が表示されていれば完了しています。", "Your plan is cancelled. Even if you don't get an email, the cancellation is complete as long as this page shows an end date."),
      )
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadPause = async () => {
    try {
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-pause", { headers })
      const { ok, json } = await parseActionResponse<{
        error: string | null
        data: SubscriptionPause
      }>(response)
      setPause(json?.data ?? null)
      if (ok && json && !json.error) {
        setResumeChecks((prev) => ({ ...prev, pause: true }))
      }
    } catch {
      // 休止の表示が出ないだけ
    }
  }

  useEffect(() => {
    if (data.viewer) void loadPause()
  }, [data.viewer?.id])

  const onPauseSubscription = async (reason: CancelReason | null) => {
    setIsSubmitting(true)
    try {
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-pause", {
        method: "POST",
        headers,
        body: JSON.stringify({ reason }),
      })
      const { ok, json } = await parseActionResponse<{
        error: string | null
        data: SubscriptionPause
      }>(response)
      if (!ok || json?.error || !json?.data) {
        toast(t(json?.error ?? "休止の手続きに失敗しました。時間をおいてもう一度お試しください。", "We couldn't pause your plan. Please try again in a moment."))
        return
      }
      setPause(json.data)
      setIsRetentionOpen(false)
      toast(
        t(
          `${toDateText(json.data.pausedFrom)} から1か月休止します。${toDateText(json.data.nextBillingAt)} に自動で再開します。`,
          `Your plan pauses for one month from ${toDate(json.data.pausedFrom)} and resumes automatically on ${toDate(json.data.nextBillingAt)}.`,
        ),
      )
    } catch (error) {
      toast(t(error instanceof Error ? error.message : "休止の手続きに失敗しました。", "We couldn't pause your plan."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUnpauseSubscription = async () => {
    setIsSubmitting(true)
    try {
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-pause", {
        method: "DELETE",
        headers,
      })
      const { ok, json } = await parseActionResponse<{ error: string | null }>(response)
      if (!ok || json?.error) {
        toast(t(json?.error ?? "休止の取り消しに失敗しました。", "We couldn't undo the pause."))
        return
      }
      trackGrowthEvent("pause_undo", "")
      setPause(null)
      toast(t("休止を取り消しました。これまでどおり続きます。", "Pause cancelled. Your plan continues as before."))
    } catch (error) {
      toast(t(error instanceof Error ? error.message : "休止の取り消しに失敗しました。", "We couldn't undo the pause."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const onResumeSubscription = async () => {
    if (!window.confirm(t("解約を取り消して、サブスクを継続しますか？", "Undo the cancellation and keep your plan?"))) {
      return
    }

    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-resume", {
        method: "POST",
        headers,
      })

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: { status: string } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast(t("解約取り消しに失敗しました。", "We couldn't undo the cancellation."))
          return
        }
        setIsCancelScheduled(false)
        setCancelCompletionMode(null)
        toast(t("解約を取り消しました。引き続きご利用いただけます。", "Cancellation undone. Your plan continues."))
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(t(json?.error ?? "解約取り消しに失敗しました。", "We couldn't undo the cancellation."))
        return
      }

      setIsCancelScheduled(false)
  setCancelCompletionMode(null)
      toast(t("解約を取り消しました。引き続きご利用いただけます。", "Cancellation undone. Your plan continues."))
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChangeCurrentPlan = async (
    passType: "LITE" | "STANDARD" | "PREMIUM",
    currentPassType: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS",
    prorationDate: number | null = null,
  ) => {
    try {
      setIsSubmitting(true)
      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-change-plan", {
        method: "POST",
        headers,
        body: JSON.stringify({
          passType,
          currentPassType,
          prorationDate: prorationDate === null ? null : String(prorationDate),
        }),
      })

      const { ok, json, isHtmlWrapped } = await parseActionResponse<{
        error: string | null
        data: {
          passType: string
          renewalAmountJpy: number | null
          chargedNowAmountJpy: number
          requiresAction?: boolean
          paymentPageUrl?: string | null
          paymentIntentStatus?: string | null
        } | null
      }>(response)

      if (isHtmlWrapped) {
        if (!ok) {
          toast(t("プラン変更に失敗しました。", "We couldn't change your plan."))
          return
        }
        toast(t("プラン変更を受け付けました。", "Your plan change has been received."))
        setTimeout(() => { window.location.reload() }, 1200)
        return
      }

      if (!ok || json?.error || !json?.data) {
        toast(t(json?.error ?? "プラン変更に失敗しました。", "We couldn't change your plan."))
        return
      }

      if (json.data.requiresAction) {
        if (json.data.paymentPageUrl) {
          toast(t("追加のカード認証が必要です。Stripe の決済画面へ移動します。", "Your card needs extra verification. Taking you to Stripe."))
          window.location.href = json.data.paymentPageUrl
          return
        }

        toast(t("追加のカード認証が必要ですが、決済画面を開けませんでした。時間をおいて再度お試しください。", "Your card needs extra verification, but we couldn't open the payment page. Please try again in a moment."))
        return
      }

      const nextPassName = toName(
        (json.data.passType as "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS") ?? passType,
      )
      const chargedNowAmountJpy = json.data.chargedNowAmountJpy ?? 0
      const renewalAmountJpy = json.data.renewalAmountJpy ?? null

      if (chargedNowAmountJpy > 0) {
        toast(
          t(
            `プラン変更が完了しました。${nextPassName}に即時変更し、今回 ${chargedNowAmountJpy}円を決済しました。次回以降は月額${renewalAmountJpy}円です。`,
            `Plan changed. You're now on ${nextPassName} and were charged ¥${chargedNowAmountJpy}. From the next renewal it's ¥${renewalAmountJpy} a month.`,
          ),
        )
      } else {
        toast(
          t(
            `プラン変更が完了しました。${nextPassName}に変更しました。今回の即時請求はなく、次回以降は月額${renewalAmountJpy}円です。`,
            `Plan changed to ${nextPassName}. Nothing was charged now; from the next renewal it's ¥${renewalAmountJpy} a month.`,
          ),
        )
      }
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openPlanChangeDialog = async (
    passType: "LITE" | "STANDARD" | "PREMIUM",
    currentPassType: "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS",
  ) => {
    try {
      setIsPlanChangePreviewLoading(true)
      setPlanChangeRequest({ passType, currentPassType })
      setPlanChangePreview(null)
      setIsPlanChangeDialogOpen(true)

      const headers = await withAuthHeader()
      const response = await fetch("/api/stripe/subscription-change-plan-preview", {
        method: "POST",
        headers,
        body: JSON.stringify({
          passType,
          currentPassType,
        }),
      })

      const { ok, json } = await parseActionResponse<{
        error: string | null
        data: {
          passType: string
          renewalAmountJpy: number | null
          interval?: "month" | "year"
          chargedNowAmountJpy: number
          prorationDate: number | null
        } | null
      }>(response)

      if (!ok || json?.error || !json?.data) {
        setIsPlanChangeDialogOpen(false)
        toast(t(json?.error ?? "プラン変更内容の確認に失敗しました。", "We couldn't load the details of the plan change."))
        return
      }

      setPlanChangePreview(json.data)
    } catch (error) {
      setIsPlanChangeDialogOpen(false)
      if (error instanceof Error) {
        toast(error.message)
      }
    } finally {
      setIsPlanChangePreviewLoading(false)
    }
  }

  if (data.viewer === null) {
    return <PlusAbout showUpgradePlansOnly={true} showFreePlan={true} />
  }

  const currentPass = data.viewer.currentPass

  const nextDateText = currentPass ? toDate(currentPass.periodEnd) : ""

  const currentPassName = currentPass ? toName(currentPass.type) : ""

  // 更新のたびに付く継続ボーナス（プレミアムコイン）
  const loyaltyCoins =
    currentPass?.type === "PREMIUM"
      ? 600
      : currentPass?.type === "STANDARD"
        ? 300
        : 100

  // iOS アプリ（App Store）・Android アプリ（Google Play）で買ったプランはウェブ（Stripe）では変更・解約できない
  const isGooglePlayPass = currentPass?.paymentProvider === "GOOGLE_PLAY"
  const isAppStorePass =
    currentPass?.paymentProvider === "APP_STORE" || isGooglePlayPass
  // 自動更新なしのパスは解約・変更・カードの変更がない（期限が来ると終わる）
  const isPrepaidPass =
    currentPass !== null &&
    prepaid.status?.pass?.passType === currentPass?.type
  const isManagedElsewhere = isAppStorePass || isPrepaidPass
  const nextPassName = planChangePreview
    ? toName(
      (planChangePreview.passType as "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS"),
    )
    : ""

  useEffect(() => {
    const loadUnpaidInvoice = async () => {
      try {
        const headers = await withAuthHeader()
        const response = await fetch("/api/stripe/subscription-unpaid", {
          method: "POST",
          headers,
        })
        const { ok, json } = await parseActionResponse<{
          error: string | null
          data: { passType: string; amount: number; hostedInvoiceUrl: string } | null
        }>(response)
        if (ok && !json?.error && json?.data?.hostedInvoiceUrl) {
          setUnpaidInvoice(json.data)
        } else if (ok && json && !json.error) {
          setResumeChecks((prev) => ({ ...prev, unpaid: true }))
        }
      } catch {
        // 取得できなくても通常の表示を続ける
      }
    }

    loadUnpaidInvoice()
  }, [])

  useEffect(() => {
    const loadCancellationStatus = async () => {
      if (!currentPass || isAppStorePass || isPrepaidPass) {
        return
      }

      try {
        const headers = await withAuthHeader()
        const response = await fetch("/api/stripe/subscription-status", {
          method: "POST",
          headers,
        })

        const { ok, json, isHtmlWrapped, statusHint } = await parseActionResponse<{
          error: string | null
          data: { status: string | null } | null
        }>(response)

        if (isHtmlWrapped) {
          setIsCancelScheduled(
            statusHint === "cancellation_requested" ||
              statusHint === "canceled" ||
              statusHint === "already_canceled",
          )
          return
        }

        if (!ok || json?.error || !json?.data) {
          return
        }

        setIsCancelScheduled(
          json.data.status === "cancellation_requested" ||
            json.data.status === "canceled" ||
            json.data.status === "already_canceled",
        )
      } catch {
        // no-op: fallback to optimistic local state
      }
    }

    loadCancellationStatus()
  }, [currentPass])

  return (
    <>
      <AlertDialog open={isRetentionOpen} onOpenChange={setIsRetentionOpen}>
        <AlertDialogContent className="max-h-[90dvh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("解約する前に、理由を教えてください", "Before you go, could you tell us why?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {
                t("これからの改善に使わせていただきます。解約しても、今の期間の終わりまではそのまま使えます。", "It helps us improve. If you cancel, you keep your plan until the end of the current period.")
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-1.5">
            {CANCEL_REASON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                  cancelReason === option.value
                    ? "border-sky-500 bg-sky-500/10"
                    : "hover:bg-muted",
                )}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  value={option.value}
                  checked={cancelReason === option.value}
                  onChange={() => {
                    setCancelReason(option.value)
                    trackGrowthEvent("cancel_reason", option.value)
                  }}
                />
                {t(option.label, option.enLabel)}
              </label>
            ))}
            {cancelReason === "other" && (
              <textarea
                value={cancelReasonNote}
                onChange={(event) => setCancelReasonNote(event.target.value)}
                maxLength={500}
                rows={3}
                placeholder={t("よければ詳しく教えてください（任意）", "Tell us more if you like (optional)")}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            )}
          </div>
          {cancelReason && currentPass && (
            <RetentionSuggestion
              reason={cancelReason}
              passType={currentPass.type}
              canPause={!isManagedElsewhere && !isCancelScheduled}
              isSubmitting={isSubmitting}
              onPause={() => {
                trackGrowthEvent("retention_pause", currentPass.type)
                void onPauseSubscription(cancelReason)
              }}
              onDowngrade={() => {
                trackGrowthEvent("retention_lite", currentPass.type)
                setIsRetentionOpen(false)
                openPlanChangeDialog("LITE", currentPass.type)
              }}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                trackGrowthEvent("retention_keep", currentPass?.type ?? "")
              }}
            >
              {t("続ける", "Keep my plan")}
            </AlertDialogAction>
            <AlertDialogCancel
              disabled={cancelReason === null || isSubmitting}
              onClick={() => {
                if (!cancelReason) return
                trackGrowthEvent("retention_cancel", currentPass?.type ?? "")
                onCancelCurrentSubscription(cancelReason)
              }}
            >
              {t("解約する", "Cancel plan")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isPlanChangeDialogOpen}
        onOpenChange={(open) => {
          if (isSubmitting) {
            return
          }
          setIsPlanChangeDialogOpen(open)
          if (!open) {
            setPlanChangeRequest(null)
            setPlanChangePreview(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("プラン変更の確認", "Confirm plan change")}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {isPlanChangePreviewLoading || !planChangeRequest ? (
                <p>{t("Stripe の請求内容を確認しています...", "Checking the charge with Stripe…")}</p>
              ) : (
                <>
                  <p>
                    {t(
                      `現在の${currentPassName}から${nextPassName}へ、すぐに切り替えます。`,
                      `You'll switch from ${currentPassName} to ${nextPassName} right away.`,
                    )}
                  </p>
                  <p>
                    {planChangePreview?.chargedNowAmountJpy && planChangePreview.chargedNowAmountJpy > 0
                      ? t(
                          `今回の即時決済額は ${planChangePreview.chargedNowAmountJpy}円 です。未使用期間分の調整を反映した日割り差額として Stripe で決済します。`,
                          `You'll be charged ¥${planChangePreview.chargedNowAmountJpy} now through Stripe — the prorated difference after crediting your unused time.`,
                        )
                      : t("今回は即時請求は発生しません。", "Nothing is charged right now.")}
                  </p>
                  <p>
                    {t(
                      `次回更新日 ${nextDateText} 以降は、${planChangePreview?.interval === "year" ? "年額" : "月額"} ${planChangePreview?.renewalAmountJpy ?? 0}円 で継続されます。`,
                      `From your next renewal on ${nextDateText}, it continues at ¥${planChangePreview?.renewalAmountJpy ?? 0} a ${planChangePreview?.interval === "year" ? "year" : "month"}.`,
                    )}
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting || isPlanChangePreviewLoading}>
              {t("キャンセル", "Go back")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                isSubmitting ||
                isPlanChangePreviewLoading ||
                !planChangeRequest ||
                !planChangePreview
              }
              onClick={(event) => {
                event.preventDefault()
                if (!planChangeRequest || !planChangePreview) {
                  return
                }
                void onChangeCurrentPlan(
                  planChangeRequest.passType,
                  planChangeRequest.currentPassType,
                  planChangePreview.prorationDate,
                )
              }}
            >
              {planChangePreview?.chargedNowAmountJpy && planChangePreview.chargedNowAmountJpy > 0
                ? t(
                    `${planChangePreview.chargedNowAmountJpy}円 を決済して変更する`,
                    `Pay ¥${planChangePreview.chargedNowAmountJpy} and change plan`,
                  )
                : t("この内容で変更する", "Change plan")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {currentPass ? (
        <>
          {pause && (
            <PauseBanner
              pause={pause}
              isSubmitting={isSubmitting}
              onUnpause={onUnpauseSubscription}
            />
          )}
          {/* 解約予約中バナー */}
          {isCancelScheduled && (
            <div className="mb-4 rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 dark:border-orange-700 dark:bg-orange-950/40">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-orange-800 text-sm dark:text-orange-300">
                    {cancelCompletionMode === "already_canceled"
                      ? t("すでに解約手続きは完了しています", "Your plan is already cancelled")
                      : t("解約予約中", "Cancellation scheduled")}
                  </p>
                  <p className="mt-0.5 text-orange-700 text-sm dark:text-orange-400">
                    {t(
                      `${nextDateText} に解約されます。それまでは引き続きご利用いただけます。`,
                      `Your plan ends on ${nextDateText}. You can keep using it until then.`,
                    )}
                  </p>
                  <p className="mt-1 text-orange-600 text-xs dark:text-orange-500">
                    {t("メールが届かない場合でも、この表示と解約予定日が見えていれば解約手続きは完了しています。", "Even if you don't get an email, the cancellation is complete as long as you see this notice and the end date.")}
                  </p>
                  <p className="mt-1 text-orange-600 text-xs dark:text-orange-500">
                    {t("キャンセルボタンが表示される場合でも、画面表示のキャッシュが残っているだけのことがあります。時間をおいて再表示してください。", "If you still see a cancel button, it may just be a cached page. Reload after a moment.")}
                  </p>
                  <p className="mt-1 text-orange-600 text-xs dark:text-orange-500">
                    {t("解約を取り消したい場合は「解約を取り消す」ボタンを押してください。", "To keep your plan after all, press \"Undo cancellation\".")}
                  </p>
                </div>
              </div>
            </div>
          )}
          {latestTrial?.status === "trialing" &&
            currentPass.type === "LITE" &&
            !isManagedElsewhere && (
              <TrialStatusBanner
                trialEnd={latestTrial.trialEnd}
                isCancelScheduled={isCancelScheduled}
                cancelAnchorId="plan-cancel"
              />
            )}
          <div
            className={cn(
              "justify-between gap-x-6 space-y-4 rounded-3xl border bg-gradient-to-br from-violet-500/10 via-transparent to-sky-500/10 p-5 md:space-y-0 md:p-6",
              currentPass && "flex flex-col md:flex-row",
            )}
          >
            <div className="flex-1 space-y-4">
              <p className="inline-flex rounded-full bg-gradient-to-r from-violet-600 to-sky-500 px-3 py-1 font-bold text-white text-xs">
                {t("ご利用中のプラン", "Your plan")}
              </p>
              <p className="font-bold text-lg">{t(
                  `現在、あなたは「${currentPassName}」をご利用中です。`,
                  `You're on ${currentPassName}.`,
                )}</p>
              <div>
                <div className="flex">
                  <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm dark:bg-gray-700 dark:text-gray-200">
                    {isPrepaidPass
                      ? t("パスの期限", "Pass ends")
                      : isCancelScheduled
                      ? t("解約予定日", "Ends on")
                      : isAppStorePass
                        ? t("次回の更新日", "Next renewal")
                        : t("次回の請求日", "Next payment")}
                  </span>
                  <p>{nextDateText}</p>
                </div>
                {!isCancelScheduled && !isManagedElsewhere && (
                  <div className="flex">
                    <span className="mr-2 mb-2 rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-700 text-sm dark:bg-gray-700 dark:text-gray-200">
                      {t("次回の請求額", "Next charge")}
                    </span>
                    <p>
                      {t(
                        `${currentPass.price}円（税込）`,
                        `¥${currentPass.price.toLocaleString()} (tax included)`,
                      )}
                    </p>
                  </div>
                )}
                {!isCancelScheduled && !isManagedElsewhere && (
                  <div className="flex">
                    <span className="mr-2 mb-2 rounded-full bg-fuchsia-100 px-3 py-1 font-semibold text-fuchsia-800 text-sm dark:bg-fuchsia-900/40 dark:text-fuchsia-200">
                      {t("継続ボーナス", "Loyalty bonus")}
                    </span>
                    <p className="text-sm">
                      {t(
                        `更新のたびに${loyaltyCoins}プレミアムコイン（期限なし）`,
                        `${loyaltyCoins} premium coins at every renewal (never expire)`,
                      )}
                    </p>
                  </div>
                )}
              </div>
              {isPrepaidPass ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900 text-sm dark:border-red-900 dark:bg-red-950/30 dark:text-red-100">
                  <p className="font-bold">
                    {t("自動更新なしのパスをご利用中です", "You're using a one-time pass (no auto-renewal)")}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {t(
                      `${nextDateText} に自動で終わります。解約の手続きは要りません。続けて使うときは、下からパスを延長してください（期限から1か月・1年延びます）。`,
                      `It ends automatically on ${nextDateText}, so there's nothing to cancel. To keep going, extend your pass below (adds 1 month or 1 year to the end date).`,
                    )}
                  </p>
                </div>
              ) : isAppStorePass ? (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 text-sm dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
                  <p className="font-bold">
                    {isGooglePlayPass
                      ? t("このプランは Android アプリ（Google Play）でご購入いただいたものです", "This plan was purchased in the Android app (Google Play)")
                      : t("このプランは iPhone アプリ（App Store）でご購入いただいたものです", "This plan was purchased in the iPhone app (App Store)")}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {isGooglePlayPass
                      ? t("プランの変更・解約は、Google Play ストアアプリの［プロフィール］→［お支払いと定期購入］→［定期購入］から行えます。お支払いは Google が管理しているため、この画面からは変更・解約できません。", "To change or cancel, open the Google Play Store app and go to Profile → Payments & subscriptions → Subscriptions. Billing is handled by Google, so it can't be changed or cancelled from this page.")
                      : t("プランの変更・解約は、iPhone の［設定］→［Apple ID］→［サブスクリプション］から行えます。お支払いは Apple が管理しているため、この画面からは変更・解約できません。", "To change or cancel, open Settings on your iPhone and go to Apple ID → Subscriptions. Billing is handled by Apple, so it can't be changed or cancelled from this page.")}
                  </p>
                </div>
              ) : (
                <p>
                  {
                    t("この画面からサブスクのキャンセル・プラン変更・お支払いカードの変更を行えます。", "You can cancel, change your plan, or change your payment card from this page.")
                  }
                </p>
              )}
              {!isCancelScheduled && !isManagedElsewhere && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sky-900 text-sm dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
                  <p className="font-bold">
                    {t("解約後の確認について", "After you cancel")}
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {
                      t(
                      "解約完了メールが届かない場合でも、この画面に『解約予定日』と解約予約中の案内が表示されていれば手続きは完了しています。キャンセルボタンが一時的に見える場合でも、表示キャッシュの可能性があるためご安心ください。",
                      "Even if you don't get a cancellation email, you're done as long as this page shows an end date and the cancellation notice. If a cancel button still appears for a while, it may just be a cached page.",
                    )
                    }
                  </p>
                </div>
              )}
              {!isManagedElsewhere && (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {isCancelScheduled ? (
                  /* 解約予約中 → 取り消しボタンを目立たせる */
                  <Button
                    className="w-full bg-green-600 font-bold text-white hover:bg-green-700 dark:bg-green-600 dark:text-white dark:hover:bg-green-700"
                    onClick={onResumeSubscription}
                    disabled={isSubmitting}
                  >
                    {t("解約を取り消す（継続する）", "Undo cancellation (keep my plan)")}
                  </Button>
                ) : (
                  /* 通常時 → 解約ボタン */
                  <Button
                    id="plan-cancel"
                    className="w-full scroll-mt-24 border-black text-black hover:bg-black/5 dark:border-white dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                    onClick={() => {
                      trackGrowthEvent("retention_view", currentPass.type)
                      setCancelReason(null)
                      setCancelReasonNote("")
                      setIsRetentionOpen(true)
                    }}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {t("サブスクをキャンセルする", "Cancel plan")}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "LITE" && (
                  <Button
                    className={planCtaClassName}
                    onClick={() => openPlanChangeDialog("STANDARD", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {t("スタンダードに変更する", "Switch to Standard")}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "LITE" && (
                  <Button
                    className={planCtaClassName}
                    onClick={() => openPlanChangeDialog("PREMIUM", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {t("プレミアムに変更する", "Switch to Premium")}
                  </Button>
                )}
                {!isCancelScheduled && currentPass.type === "STANDARD" && (
                  <Button
                    className={planCtaClassName}
                    onClick={() => openPlanChangeDialog("PREMIUM", currentPass.type)}
                    disabled={isSubmitting}
                  >
                    {t("プレミアムに変更する", "Switch to Premium")}
                  </Button>
                )}
              </div>
              )}
              {!isManagedElsewhere && (
                <div className="space-y-1">
                  <Button
                    className="w-full"
                    onClick={onOpenBillingPortal}
                    disabled={isSubmitting}
                    variant="secondary"
                  >
                    {t("お支払いカードを変更する", "Change payment card")}
                  </Button>
                  <p className="text-xs opacity-70">
                    {t("カードの有効期限が切れるときや、別のカードに変えたいときはこちら（Stripe の画面に移動します）。次回の請求から新しいカードが使われます。", "Use this when your card is expiring or you want to switch cards (opens Stripe). The new card is used from your next payment.")}
                  </p>
                </div>
              )}
            </div>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>
                  {t(`${currentPassName}の特典`, `What ${currentPassName} includes`)}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Separator />
                <PassBenefitList passType={currentPass.type} />
                <Separator />
                <p className="font-bold text-sm opacity-60">
                  {t("画像生成の特典", "Generation benefits")}
                </p>
                <PassImageGenerationBenefitList passType={currentPass.type} />
                <Separator />
                <p className="text-xs">
                  {
                    t("本プランは何らかの理由により内容を追加、又は廃止する場合があります。", "Plan contents may be added to or discontinued.")
                  }
                </p>
              </CardContent>
            </Card>
          </div>
          {!isManagedElsewhere &&
            (isCancelScheduled || currentPass.type !== "PREMIUM") && (
            <p className="mt-8 mb-1 font-bold">
              {isCancelScheduled
                ? t("プランを選び直す", "Choose a plan again")
                : t("上位のプランにすると、もっと生成できます", "Upgrade to generate more")}
            </p>
          )}
          {!isManagedElsewhere &&
            (isCancelScheduled || currentPass.type !== "PREMIUM") && (
            <PlusAbout
              showUpgradePlansOnly={!isCancelScheduled}
              treatAsNoCurrentPass={isCancelScheduled}
            />
          )}
          {isPrepaidPass && currentPass && (
            <PrepaidPassPanel onlyPassType={currentPass.type === "TWO_DAYS" ? undefined : currentPass.type} />
          )}
        </>
      ) : unpaidInvoice ? (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle>{t("プランの更新のお支払いが完了していません", "Your renewal payment didn't go through")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <p>
              {t(
                `${toPassName(unpaidInvoice.passType as "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS")}（${unpaidInvoice.amount.toLocaleString()}円）の更新のお支払いができなかったため、プランが一時停止しています。`,
                `We couldn't take the renewal payment for ${toName(unpaidInvoice.passType as "LITE" | "STANDARD" | "PREMIUM" | "TWO_DAYS")} (¥${unpaidInvoice.amount.toLocaleString()}), so your plan is on hold.`,
              )}
            </p>
            <p>
              {t("下のボタンからお支払いいただくと、すぐにプランが再開されます。カードの残高不足の場合は、別のカードを入力してお支払いいただけます。", "Pay with the button below and your plan resumes right away. If your card was declined, you can enter a different one.")}
            </p>
            <p className="text-xs opacity-70">
              {t("新しくプランに申し込むと二重の契約になってしまうため、先にこちらからお支払いください。", "Please pay here first — signing up for a new plan would create a second subscription.")}
            </p>
            <Button
              className="w-full font-bold"
              onClick={() => {
                window.location.href = unpaidInvoice.hostedInvoiceUrl
              }}
            >
              {t("お支払いを完了する", "Complete payment")}
            </Button>
            <Button
              className="w-full"
              onClick={onOpenBillingPortal}
              disabled={isSubmitting}
              variant="outline"
            >
              {t("今後のお支払いカードを変更する", "Change the card for future payments")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {pause && (
            <PauseBanner
              pause={pause}
              isSubmitting={isSubmitting}
              onUnpause={onUnpauseSubscription}
              isPausedNow={true}
            />
          )}
          <PlusAbout
            showUpgradePlansOnly={true}
            showFreePlan={true}
            showStickyCta={true}
            canResumeCheckout={
              resumeChecks.unpaid && resumeChecks.pause && pause === null
            }
          />
          <PrepaidPassPanel />
        </>
      )}
    </>
  )
}

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
        price
        periodEnd
        paymentProvider
      }
    }
  }`,
)

type CancelReason =
  | "not_using"
  | "coins"
  | "price"
  | "quality"
  | "slow"
  | "one_month"
  | "other_service"
  | "other"

const PASS_EN_NAME: Record<string, string> = {
  LITE: "Lite",
  STANDARD: "Standard",
  PREMIUM: "Premium",
  TWO_DAYS: "2-day pass",
}

/** aipictors-api の lib/retention.ts の CANCEL_REASONS と同じ */
const CANCEL_REASON_OPTIONS: {
  value: CancelReason
  label: string
  enLabel: string
}[] = [
  { value: "not_using", label: "あまり使わなかった", enLabel: "I didn't use it much" },
  { value: "coins", label: "コインが足りなかった", enLabel: "I ran out of coins" },
  { value: "price", label: "料金が高い", enLabel: "It's too expensive" },
  { value: "quality", label: "生成の品質・不具合が気になった", enLabel: "Quality problems or bugs" },
  { value: "slow", label: "生成が遅い・待ち時間が長い", enLabel: "Generation is slow or the wait is long" },
  { value: "one_month", label: "1か月だけ使うつもりだった", enLabel: "I only planned to use it for a month" },
  { value: "other_service", label: "ほかのサービスに移る", enLabel: "I'm moving to another service" },
  { value: "other", label: "その他", enLabel: "Something else" },
]

/**
 * 解約の理由に合わせた提案
 */
function RetentionSuggestion(props: {
  reason: CancelReason
  passType: string
  canPause: boolean
  isSubmitting: boolean
  onPause: () => void
  onDowngrade: () => void
}) {
  const t = useTranslation()
  const canDowngrade = props.passType === "STANDARD" || props.passType === "PREMIUM"

  // 使わない月がある・1か月だけのつもりだった・料金が気になる人には、解約の代わりに 1 か月休止を出す
  const pauseCard =
    props.canPause &&
    (props.reason === "not_using" || props.reason === "one_month" || props.reason === "price") ? (
      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
        <p className="font-bold">{t("解約せずに、来月だけお休みしませんか？", "Rather than cancelling, how about taking next month off?")}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {t("今の期間の終わりから1か月、請求もプランも止まります（その間は無料プランと同じです）。1か月後に自動で再開し、生成履歴や設定はそのまま残ります。休止はこの画面からいつでも取り消せます。", "Billing and benefits stop for one month after your current period ends (you're on Free during that time). Your plan resumes automatically a month later, and your history and settings stay as they are. You can undo the pause from this page anytime.")}
        </p>
        <Button size="sm" variant="outline" className="mt-2" disabled={props.isSubmitting} onClick={props.onPause}>
          {t("1か月休止する", "Pause for 1 month")}
        </Button>
      </div>
    ) : null

  if ((props.reason === "price" || props.reason === "not_using") && canDowngrade) {
    return (
      <div className="space-y-2">
      {pauseCard}
      <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-sm">
        <p className="font-bold">{t("ライト（月額480円）に変えるのはいかがですか？", "How about switching to Lite (¥480/mo)?")}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {t("毎日500コイン（1日50枚）・1回4枚の生成・広告なしを、料金を抑えたまま続けられます。変更前に請求の内容を確認できます。", "Keep 500 coins a day (50 images), 4 images per click and no ads, for less. You'll see the charge before you confirm.")}
        </p>
        <Button size="sm" className="mt-2" onClick={props.onDowngrade}>
          {t("ライトに変更する", "Switch to Lite")}
        </Button>
      </div>
      </div>
    )
  }

  if (props.reason === "coins") {
    return (
      <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-sm">
        <p className="font-bold">{t("コインは上のプランにすると毎日の量が増えます", "A higher plan gives you more coins every day")}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {t("スタンダードは毎日1,000、プレミアムは毎日2,000コインです。続けると更新のたびに継続ボーナス（期限なし）も付きます。プランの変更はこのページの下からできます。", "Standard gives 1,000 coins a day and Premium 2,000. You also get a loyalty bonus (never expires) at every renewal. You can change plans further down this page.")}
        </p>
      </div>
    )
  }

  if (props.reason === "quality" || props.reason === "slow") {
    return (
      <div className="rounded-lg border border-sky-500/40 bg-sky-500/5 p-3 text-sm">
        <p className="font-bold">{t("よければ状況を教えてください", "Tell us what happened, if you like")}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {t("失敗した生成はコインを使わずにやり直せます。直らないときは、お問い合わせから送っていただくとスタッフが確認します。", "Failed generations can be retried without spending coins. If the problem continues, contact us and our staff will take a look.")}
        </p>
        <Link to="/support/chat" className="mt-2 inline-block text-sky-600 text-xs underline dark:text-sky-300">
          {t("お問い合わせを開く", "Contact us")}
        </Link>
      </div>
    )
  }

  if (props.reason === "one_month") {
    return (
      <div className="space-y-2">
        {pauseCard}
        <div className="rounded-lg bg-muted p-3 text-muted-foreground text-xs">
          {t("解約しても期間の終わりまでは使えます。終わる少し前にメールでお知らせするので、続けたくなったらそこから取り消せます。", "If you cancel, you keep your plan until the period ends. We'll email you shortly before, so you can undo the cancellation if you change your mind.")}
        </div>
      </div>
    )
  }

  return pauseCard
}

/**
 * 1 か月休止の予約中・休止中の案内
 */
function PauseBanner(props: {
  pause: NonNullable<SubscriptionPause>
  isSubmitting: boolean
  isPausedNow?: boolean
  onUnpause: () => void
}) {
  const t = useTranslation()
  const pausedFrom = toTrialDateText(props.pause.pausedFrom, t.isEnglish)
  const nextBilling = toTrialDateText(props.pause.nextBillingAt, t.isEnglish)
  return (
    <div className="mb-4 rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-3 dark:border-emerald-700 dark:bg-emerald-950/40">
      <p className="font-bold text-emerald-800 text-sm dark:text-emerald-300">
        {props.isPausedNow ? t("プランを休止中です", "Your plan is paused") : t("1か月休止の予約中", "One-month pause scheduled")}
      </p>
      <p className="mt-0.5 text-emerald-700 text-sm dark:text-emerald-400">
        {props.isPausedNow
          ? t(
              `${nextBilling} に自動で再開し、そのときに請求します。すぐに戻りたいときは下からプランを選んでください（休止中の契約は自動で止まり、二重には請求されません）。`,
              `Your plan resumes automatically on ${nextBilling}, and that's when you're charged. To come back sooner, choose a plan below (the paused subscription stops automatically, so you won't be charged twice).`,
            )
          : t(
              `${pausedFrom} から1か月お休みし、${nextBilling} に自動で再開します。それまではこれまでどおり使えます。`,
              `Your plan pauses for one month from ${pausedFrom} and resumes automatically on ${nextBilling}. Until then, everything works as usual.`,
            )}
      </p>
      {!props.isPausedNow && (
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          disabled={props.isSubmitting}
          onClick={props.onUnpause}
        >
          {t("休止を取り消す（このまま続ける）", "Undo pause (keep my plan)")}
        </Button>
      )}
    </div>
  )
}
