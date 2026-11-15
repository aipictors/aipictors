import { useSyncExternalStore } from "react"
import type { CoinSummaryResponse } from "~/routes/($lang).generation._index/utils/generation-submit-coin"

type CoinSummary = CoinSummaryResponse["data"]

let current: CoinSummary = null

const listeners = new Set<() => void>()

/**
 * 生成ボタンの部品が読んだ残高を、スマホの見出しにも見せる（/api/coins/summary を 2 回読まない）
 */
export const publishGenerationCoinSummary = (summary: CoinSummary) => {
  if (current === summary) return
  current = summary
  for (const listener of listeners) listener()
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useGenerationCoinSummaryValue() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )
}
