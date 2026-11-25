import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import {
  getViewerRequestHeaders,
  postAsViewer,
} from "~/lib/viewer-request-headers"
import type { StandardUpgradeOffer } from "~/routes/api.stripe.upgrade-offer/route"
import { trackGrowthEvent } from "~/utils/track-growth-event"

export type MemberPassType = "LITE" | "STANDARD" | "PREMIUM"

export type PlanChangePreview = {
  passType: MemberPassType
  renewalAmountJpy: number | null
  chargedNowAmountJpy: number
  prorationDate: number | null
  interval: "month" | "year"
  upgradeOffer: {
    offer: string
    firstMonthYen: number
    regularYen: number
  } | null
}

const PLAN_NAMES: Record<MemberPassType, [string, string]> = {
  LITE: ["ライト", "Lite"],
  STANDARD: ["スタンダード", "Standard"],
  PREMIUM: ["プレミアム", "Premium"],
}

/**
 * 加入中の人のプラン変更（Stripe の契約をその場で変える。差額はその日に精算）
 * 生成画面のダイアログから上のプランを選んだとき、以前は新しく契約する決済画面へ進んでいて、元の契約が残って二重に請求されるおそれがあった。
 * 今日の請求額を先に見せてから変える（/plus のプラン変更と同じ /api/stripe/subscription-change-plan）
 */
export function useMemberPlanChange(currentPassType: string | null) {
  const t = useTranslation()

  const [preview, setPreview] = useState<PlanChangePreview | null>(null)
  const [loading, setLoading] = useState<"preview" | "commit" | null>(null)

  const loadPreview = async (passType: MemberPassType, source: string) => {
    if (currentPassType === null) return
    setLoading("preview")
    setPreview(null)
    try {
      const response = await postAsViewer(
        "/api/stripe/subscription-change-plan-preview",
        { passType, currentPassType },
      )
      const json = (await response.json().catch(() => null)) as {
        error: string | null
        data: PlanChangePreview | null
      } | null
      if (!response.ok || !json?.data) {
        toast(
          t(
            json?.error ?? "プラン変更の内容を確かめられませんでした。",
            "We couldn't load the details of the plan change.",
          ),
        )
        return
      }
      trackGrowthEvent(`member_change_preview_${passType}`, source)
      setPreview({ ...json.data, passType })
    } catch (_error) {
      toast(
        t(
          "プラン変更の内容を確かめられませんでした。",
          "We couldn't load the details of the plan change.",
        ),
      )
    } finally {
      setLoading(null)
    }
  }

  const commit = async (source: string) => {
    if (currentPassType === null || preview === null) return
    setLoading("commit")
    try {
      const response = await postAsViewer(
        "/api/stripe/subscription-change-plan",
        {
          passType: preview.passType,
          currentPassType,
          prorationDate:
            preview.prorationDate === null
              ? null
              : String(preview.prorationDate),
        },
      )
      const json = (await response.json().catch(() => null)) as {
        error: string | null
        data: {
          passType: string
          renewalAmountJpy: number | null
          chargedNowAmountJpy: number
          requiresAction?: boolean
          paymentPageUrl?: string | null
        } | null
      } | null
      if (!response.ok || !json?.data) {
        toast(
          t(
            json?.error ?? "プラン変更に失敗しました。",
            "We couldn't change your plan.",
          ),
        )
        return
      }
      trackGrowthEvent(`member_change_done_${preview.passType}`, source)
      if (json.data.requiresAction) {
        if (json.data.paymentPageUrl) {
          toast(
            t(
              "カードの追加認証が必要です。決済画面へ移動します。",
              "Your card needs extra verification. Taking you to the payment page.",
            ),
          )
          window.location.href = json.data.paymentPageUrl
          return
        }
        toast(
          t(
            "カードの追加認証が必要ですが、決済画面を開けませんでした。プランのページからもう一度お試しください。",
            "Your card needs extra verification, but we couldn't open the payment page. Please try again from the plans page.",
          ),
        )
        return
      }
      const [ja, en] = PLAN_NAMES[preview.passType]
      toast(
        t(
          `${ja}プランになりました。今日のコインも差額分が増えます。`,
          `You're now on ${en}. Today's coins go up by the difference.`,
        ),
      )
      setTimeout(() => window.location.reload(), 1200)
    } catch (_error) {
      toast(t("プラン変更に失敗しました。", "We couldn't change your plan."))
    } finally {
      setLoading(null)
    }
  }

  return {
    preview,
    loading,
    loadPreview,
    commit,
    reset: () => setPreview(null),
  }
}

/**
 * ライトからスタンダードへ上げる人の初月割引（初月 ¥980）の対象か。enabled のときだけ聞く
 * 確認中・対象外・聞けなかったときは null
 */
export function useStandardUpgradeOffer(enabled: boolean) {
  const authContext = useContext(AuthContext)
  const [offer, setOffer] = useState<StandardUpgradeOffer | null>(null)

  useEffect(() => {
    if (!enabled || authContext.isLoading || authContext.isNotLoggedIn) return
    let cancelled = false
    void (async () => {
      try {
        const response = await fetch("/api/stripe/upgrade-offer", {
          headers: await getViewerRequestHeaders(),
        })
        const json = (await response.json().catch(() => null)) as {
          data: StandardUpgradeOffer | null
        } | null
        if (!cancelled) setOffer(json?.data?.eligible ? json.data : null)
      } catch (_error) {
        if (!cancelled) setOffer(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, authContext.isLoading, authContext.isNotLoggedIn])

  return offer
}
