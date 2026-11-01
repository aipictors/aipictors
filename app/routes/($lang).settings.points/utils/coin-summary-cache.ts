import type { CoinType } from "~/routes/($lang).settings.points/utils/coin-ledger"
import { getJstDateKey } from "~/routes/($lang).settings.points/utils/coin-ledger"

/**
 * 前回の残高を端末に覚えておき、開いた瞬間に出す（最新の値が届いたら置き換える）。
 * フリーコインは日付が変わると失効するので、別の日の値は使わない。履歴やギフト券コードは保存しない
 */
const STORAGE_KEY = "aipictors.coinSummaryCache"

export type ExpiringCoinLot = {
  coinType: CoinType
  amount: number
  expiresAt: number
}

export type CachedCoinSummary = {
  freeBalance: number
  premiumBalance: number
  exchangeablePremiumBalance: number
  lockedExchangePremiumBalance: number
  expiringLots: ExpiringCoinLot[]
}

type CacheEntry = CachedCoinSummary & {
  viewerId: string
  dateKey: string
}

export const readCoinSummaryCache = (
  viewerId: string,
  nowSeconds: number,
): CachedCoinSummary | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const entry = JSON.parse(raw) as Partial<CacheEntry>
    if (
      entry.viewerId !== viewerId ||
      entry.dateKey !== getJstDateKey(nowSeconds) ||
      typeof entry.freeBalance !== "number" ||
      typeof entry.premiumBalance !== "number"
    ) {
      return null
    }

    return {
      freeBalance: entry.freeBalance,
      premiumBalance: entry.premiumBalance,
      exchangeablePremiumBalance: entry.exchangeablePremiumBalance ?? 0,
      lockedExchangePremiumBalance: entry.lockedExchangePremiumBalance ?? 0,
      expiringLots: Array.isArray(entry.expiringLots) ? entry.expiringLots : [],
    }
  } catch {
    return null
  }
}

export const writeCoinSummaryCache = (
  viewerId: string,
  nowSeconds: number,
  summary: CachedCoinSummary,
) => {
  try {
    const entry: CacheEntry = {
      viewerId,
      dateKey: getJstDateKey(nowSeconds),
      freeBalance: summary.freeBalance,
      premiumBalance: summary.premiumBalance,
      exchangeablePremiumBalance: summary.exchangeablePremiumBalance,
      lockedExchangePremiumBalance: summary.lockedExchangePremiumBalance,
      expiringLots: summary.expiringLots,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // 保存できなくても表示には影響しない
  }
}
