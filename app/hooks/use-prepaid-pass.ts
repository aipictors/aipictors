import { useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { AuthContext } from "~/contexts/auth-context"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"
import { getCheckoutLocale, rememberCheckoutLocale } from "~/utils/checkout-locale"
import type { PrepaidPassStatus } from "~/routes/api.stripe.prepaid-pass/route"
import type { CheckoutPassType } from "~/hooks/use-pass-checkout"
import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

// 同じ画面の複数の場所で使うので、1 回取った結果を使い回す
let cachedStatus: PrepaidPassStatus | null = null
let pendingStatus: Promise<PrepaidPassStatus | null> | null = null

const fetchStatus = async () => {
  const headers = await getViewerRequestHeaders()
  const response = await fetch("/api/stripe/prepaid-pass", { headers })
  const json = (await response.json().catch(() => null)) as {
    data: PrepaidPassStatus | null
  } | null
  return json?.data ?? null
}

/**
 * 自動更新なしのプラン（PayPay などの 1 回払いで買う 1 か月・1 年のパス）
 * Stripe の PayPay は自動更新の支払いに使えないため、プランの期間を 1 回払いで買えるようにしている
 */
export function usePrepaidPass() {
  const authContext = useContext(AuthContext)

  const [status, setStatus] = useState<PrepaidPassStatus | null>(cachedStatus)

  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  useEffect(() => {
    if (authContext.isLoading || authContext.isNotLoggedIn) return
    if (cachedStatus) return
    pendingStatus = pendingStatus ?? fetchStatus().catch(() => null)
    pendingStatus.then((value) => {
      cachedStatus = value
      setStatus(value)
    })
  }, [authContext.isLoading, authContext.isNotLoggedIn])

  const startCheckout = async (passType: CheckoutPassType, interval: BillingInterval) => {
    setLoadingKey(`${passType}:${interval}`)
    try {
      const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
      const response = await fetch("/api/stripe/prepaid-pass", {
        method: "POST",
        headers,
        body: JSON.stringify({ passType, interval, locale: getCheckoutLocale() }),
      })
      const json = (await response.json().catch(() => null)) as {
        error: string | null
        data: { url: string } | null
      } | null
      if (!response.ok || !json?.data?.url) {
        toast(json?.error ?? "決済画面を開けませんでした。")
        return
      }
      rememberCheckoutLocale()
      window.location.assign(json.data.url)
    } catch (error) {
      toast(error instanceof Error ? error.message : "エラーが発生しました。")
    } finally {
      setLoadingKey(null)
    }
  }

  return {
    status,
    isLoggedIn: authContext.isLoggedIn,
    startCheckout,
    isLoading: loadingKey !== null,
    isLoadingFor: (passType: CheckoutPassType, interval: BillingInterval) =>
      loadingKey === `${passType}:${interval}`,
  }
}
