import {
  calcBonusCoins,
  calcCustomPriceYen,
  MIN_CUSTOM_COINS,
  PREMIUM_COIN_PACKAGES,
} from "~/lib/premium-coins"

export type GachaCoinOption = {
  coins: number
  /** まとめ買いのおまけ（はじめての購入・プランのおまけは決済のときにサーバーで足す） */
  bonusCoins: number
  priceYen: number
}

const toOption = (coins: number): GachaCoinOption => {
  const pkg = Object.values(PREMIUM_COIN_PACKAGES).find(
    (item) => item.coins === coins,
  )
  return {
    coins,
    bonusCoins: pkg?.bonusCoins ?? calcBonusCoins(coins),
    priceYen: pkg?.priceYen ?? calcCustomPriceYen(coins),
  }
}

/**
 * ガチャを引くのにコインが足りないときの、買う枚数の候補。
 * いちばん上は足りない分だけ（100 枚単位で切り上げ）。あとはその上のまとめ買い（おまけ付き）
 */
export const toGachaCoinShortage = (props: {
  balance: number
  cost: number
  /** 10 連 1 回分など、まとめて買う目安 */
  bundleCost?: number
}) => {
  const shortage = Math.max(0, Math.ceil(props.cost - props.balance))
  if (shortage === 0) return null
  const exact = Math.max(
    MIN_CUSTOM_COINS,
    Math.ceil(shortage / MIN_CUSTOM_COINS) * MIN_CUSTOM_COINS,
  )
  const candidates = [exact, 1000, props.bundleCost ?? 0, 10000]
    .filter((coins) => coins >= exact)
    .filter((coins, index, list) => list.indexOf(coins) === index)
    .sort((a, b) => a - b)
    .slice(0, 3)
  return {
    shortage,
    exact: toOption(exact),
    options: candidates.map(toOption),
  }
}
