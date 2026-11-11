type PremiumCoinPackageId =
  | "PREMIUM_COINS_100"
  | "PREMIUM_COINS_1000"
  | "PREMIUM_COINS_10000"
  | "PREMIUM_COINS_CUSTOM"

export const PREMIUM_COIN_PACKAGES = {
  PREMIUM_COINS_100: {
    id: "PREMIUM_COINS_100" as const,
    coins: 100,
    bonusCoins: 0,
    totalCoins: 100,
    priceYen: 80,
  },
  PREMIUM_COINS_1000: {
    id: "PREMIUM_COINS_1000" as const,
    coins: 1000,
    bonusCoins: 100,
    totalCoins: 1100,
    priceYen: 800,
  },
  PREMIUM_COINS_10000: {
    id: "PREMIUM_COINS_10000" as const,
    coins: 10000,
    bonusCoins: 1000,
    totalCoins: 11000,
    priceYen: 8000,
  },
} as const

const COIN_PRICE_YEN = 0.8
export const BONUS_THRESHOLD = 1000
export const BONUS_RATE = 0.1
export const MIN_CUSTOM_COINS = 100

export const calcBonusCoins = (coins: number): number => {
  if (coins < BONUS_THRESHOLD) return 0
  return Math.floor(coins * BONUS_RATE)
}

export const calcCustomPriceYen = (coins: number): number => {
  return Math.ceil(coins * COIN_PRICE_YEN)
}

export const parsePremiumCoinPackageId = (
  value: string,
): PremiumCoinPackageId | null => {
  const valid: PremiumCoinPackageId[] = [
    "PREMIUM_COINS_100",
    "PREMIUM_COINS_1000",
    "PREMIUM_COINS_10000",
    "PREMIUM_COINS_CUSTOM",
  ]
  return valid.includes(value as PremiumCoinPackageId)
    ? (value as PremiumCoinPackageId)
    : null
}
/**
 * コイン購入の上乗せ（aipictors-api の /stripe/checkout/premium-coins/offer で判定）
 * - はじめての購入: 買った枚数と同じだけおまけ（最大 1,000 枚）。1 回買ってもらうと 2 回目以降も買われやすいため
 * - プラン加入中: 買った枚数の 20% をおまけ。会員の特典を増やして解約を減らすため
 */
export type PremiumCoinOffer = {
  isFirstPurchase: boolean
  passType: string | null
}

export const FIRST_PURCHASE_BONUS_MAX = 1000
export const MEMBER_BONUS_RATE = 0.2

export const calcOfferBonusCoins = (
  coins: number,
  offer: PremiumCoinOffer | null,
) => {
  if (!offer) return { firstPurchase: 0, member: 0 }
  return {
    firstPurchase: offer.isFirstPurchase
      ? Math.min(Math.max(0, Math.floor(coins)), FIRST_PURCHASE_BONUS_MAX)
      : 0,
    member: offer.passType ? Math.floor(coins * MEMBER_BONUS_RATE) : 0,
  }
}
