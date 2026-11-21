import { PREMIUM_COIN_PACKAGES } from "~/lib/premium-coins"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * プレミアムコインの決済画面（Stripe）の URL を作る。
 * 決まった枚数（100 / 1,000 / 10,000）ならそのパック、それ以外は好きな枚数で買う。
 * おまけ（はじめての購入・プラン加入中・まとめ買い）はサーバーで付く
 */
export const createPremiumCoinCheckoutUrl = async (props: {
  coins: number
  successPath?: string
  cancelPath?: string
}) => {
  const matched = Object.values(PREMIUM_COIN_PACKAGES).find(
    (pkg) => pkg.coins === props.coins,
  )
  const body: Record<string, unknown> = {
    packageId: matched?.id ?? "PREMIUM_COINS_CUSTOM",
  }
  if (!matched) body.customCoins = props.coins
  if (props.successPath) body.successPath = props.successPath
  if (props.cancelPath) body.cancelPath = props.cancelPath

  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  const response = await fetch("/api/stripe/premium-coins-checkout", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as {
    error: string | null
    data?: { checkoutUrl?: string }
  }
  if (!response.ok || json.error || !json.data?.checkoutUrl) {
    throw new Error(json.error ?? "購入セッションの作成に失敗しました")
  }
  return json.data.checkoutUrl
}
