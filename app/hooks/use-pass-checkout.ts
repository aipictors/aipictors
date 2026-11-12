import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"
import { useTranslation } from "~/hooks/use-translation"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { createTrialCheckout } from "~/lib/trial-api"
import { getCheckoutLocale, rememberCheckoutLocale } from "~/utils/checkout-locale"
import { trackGrowthEvent } from "~/utils/track-growth-event"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

export type CheckoutPassType = "LITE" | "STANDARD" | "PREMIUM"

/**
 * プランの決済画面（Stripe）へ移る
 * 月払いは GraphQL の createPassCheckoutSession（初月半額の判定は aipictors-api）、年払いと英語のページからの月払いは /api/stripe/subscription-checkout
 * /plus を経由せず、生成画面のダイアログなどからそのまま決済に進めるようにするため
 */
export function usePassCheckout() {
  const t = useTranslation()

  const [mutation] = useMutation(createPassCheckoutSessionMutation)

  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const startCheckout = async (
    passType: CheckoutPassType,
    interval: BillingInterval = "month",
  ) => {
    setLoadingKey(`${passType}:${interval}`)
    try {
      // GraphQL には表示言語を渡せないので、英語のページからの月払いは年払いと同じ口で作る（Stripe の決済画面を英語で出すため）
      const locale = getCheckoutLocale()
      const url =
        interval === "year" || locale === "en"
          ? await createCheckout(passType, interval, locale)
          : (await mutation({ variables: { input: { passType } } })).data
              ?.createPassCheckoutSession
      if (typeof url !== "string" || url.length === 0) {
        toast(
          t(
            "決済画面を開けませんでした。時間をおいてもう一度お試しください。",
            "We couldn't open checkout. Please try again in a moment.",
          ),
        )
        return
      }
      rememberCheckoutLocale()
      window.location.assign(url)
    } catch (error) {
      toast(
        t(
          error instanceof Error ? error.message : "エラーが発生しました。",
          "Something went wrong. Please try again.",
        ),
      )
    } finally {
      setLoadingKey(null)
    }
  }

  /**
   * ライトの 7 日間無料お試しの決済画面へ移る（対象かどうかは最後にサーバーが決める。
   * 対象外だった場合は、初月半額の通常の決済へ進む）
   */
  const startTrialCheckout = async () => {
    setLoadingKey("LITE:month")
    try {
      const result = await createTrialCheckout()
      if (result.kind === "ineligible") {
        toast(
          t(
            "無料お試しの対象外のため、初月半額の決済画面へ進みます。",
            "You're not eligible for the free trial, so we're taking you to checkout with 50% off your first month.",
          ),
        )
        trackGrowthEvent("trial_ineligible", "checkout")
        await startCheckout("LITE", "month")
        return
      }
      if (result.kind === "error") {
        toast(
          t(
            "決済画面を開けませんでした。時間をおいてもう一度お試しください。",
            "We couldn't open checkout. Please try again in a moment.",
          ),
        )
        return
      }
      rememberCheckoutLocale()
      window.location.assign(result.url)
    } catch (_error) {
      toast(
        t(
          "決済画面を開けませんでした。時間をおいてもう一度お試しください。",
          "We couldn't open checkout. Please try again in a moment.",
        ),
      )
    } finally {
      setLoadingKey(null)
    }
  }

  return {
    startCheckout,
    startTrialCheckout,
    isLoading: loadingKey !== null,
    isLoadingFor: (passType: CheckoutPassType, interval: BillingInterval = "month") =>
      loadingKey === `${passType}:${interval}`,
  }
}

const createCheckout = async (
  passType: CheckoutPassType,
  interval: BillingInterval,
  locale: "ja" | "en",
) => {
  const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  const response = await fetch("/api/stripe/subscription-checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ passType, interval, locale }),
  })
  const json = (await response.json().catch(() => null)) as {
    error: string | null
    data: { url: string } | null
  } | null
  if (!response.ok || !json?.data?.url) {
    throw new Error(json?.error ?? "決済画面を開けませんでした。")
  }
  return json.data.url
}

const createPassCheckoutSessionMutation = graphql(
  `mutation CreatePassCheckoutSessionForHook($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }`,
)
