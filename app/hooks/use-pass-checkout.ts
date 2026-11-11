import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useState } from "react"
import { toast } from "sonner"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

export type CheckoutPassType = "LITE" | "STANDARD" | "PREMIUM"

/**
 * プランの決済画面（Stripe）へ移る
 * 月払いは GraphQL の createPassCheckoutSession（初月半額の判定は aipictors-api）、年払いは /api/stripe/subscription-checkout
 * /plus を経由せず、生成画面のダイアログなどからそのまま決済に進めるようにするため
 */
export function usePassCheckout() {
  const [mutation] = useMutation(createPassCheckoutSessionMutation)

  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const startCheckout = async (
    passType: CheckoutPassType,
    interval: BillingInterval = "month",
  ) => {
    setLoadingKey(`${passType}:${interval}`)
    try {
      const url =
        interval === "year"
          ? await createYearlyCheckout(passType)
          : (await mutation({ variables: { input: { passType } } })).data
              ?.createPassCheckoutSession
      if (typeof url !== "string" || url.length === 0) {
        toast("決済画面を開けませんでした。時間をおいてもう一度お試しください。")
        return
      }
      window.location.assign(url)
    } catch (error) {
      toast(error instanceof Error ? error.message : "エラーが発生しました。")
    } finally {
      setLoadingKey(null)
    }
  }

  return {
    startCheckout,
    isLoading: loadingKey !== null,
    isLoadingFor: (passType: CheckoutPassType, interval: BillingInterval = "month") =>
      loadingKey === `${passType}:${interval}`,
  }
}

const createYearlyCheckout = async (passType: CheckoutPassType) => {
  const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  const response = await fetch("/api/stripe/subscription-checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ passType, interval: "year" }),
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
