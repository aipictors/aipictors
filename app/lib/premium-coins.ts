export type PremiumCoinPackageId =
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

export const COIN_PRICE_YEN = 0.8
export const BONUS_THRESHOLD = 1000
export const BONUS_RATE = 0.1
export const MIN_CUSTOM_COINS = 100
export const PREMIUM_COIN_PT_MULTIPLIER = 10
export const AMAZON_POINT_RATE_YEN = 0.3

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