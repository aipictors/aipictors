import { createContext, useEffect, useState } from "react"
import type {
  CreatorRewardEarning,
  CreatorRewardSummary,
} from "~/lib/creator-rewards"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

export type CreatorRewardEarningsState =
  | { status: "idle" | "loading" | "error" | "disabled" }
  | { status: "notJoined" }
  | { status: "joined"; earnings: CreatorRewardEarning[] }

/** 同じページで何度呼んでも /api/creator-rewards は 1 回（5 分は使い回す） */
let cache: {
  at: number
  promise: Promise<CreatorRewardSummary | null>
} | null = null
const CACHE_MS = 5 * 60 * 1000

const loadSummary = () => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.promise
  const promise = (async () => {
    const headers = await getViewerRequestHeaders({
      includeJsonContentType: true,
    })
    const res = await fetch("/api/creator-rewards", { headers })
    const body = (await res.json()) as {
      error: string | null
      data: CreatorRewardSummary | null
    }
    if (!res.ok || body.error || !body.data) return null
    return body.data
  })().catch(() => null)
  cache = { at: Date.now(), promise }
  return promise
}

/**
 * 受け取った推しの報酬（クリエイター側の画面で「報酬 〇〇円（保留中）」を出す）
 * 新しい API は使わず、換金の画面と同じ /api/creator-rewards のまとめを読む。enabled のときだけ読む
 */
export const useCreatorRewardEarnings = (
  enabled: boolean,
): CreatorRewardEarningsState => {
  const [state, setState] = useState<CreatorRewardEarningsState>({
    status: "idle",
  })

  useEffect(() => {
    if (!enabled) return
    let isActive = true
    setState({ status: "loading" })
    void loadSummary().then((summary) => {
      if (!isActive) return
      if (summary === null) {
        cache = null
        setState({ status: "error" })
        return
      }
      if (!summary.config.enabled) {
        setState({ status: "disabled" })
        return
      }
      setState(
        summary.joined || summary.earnings.length > 0
          ? { status: "joined", earnings: summary.earnings }
          : { status: "notJoined" },
      )
    })
    return () => {
      isActive = false
    }
  }, [enabled])

  return state
}

/**
 * 推し（通知・受け取り履歴・コメント）に対応する報酬の行を探す
 * 報酬の行は推しと同じ処理（同じ時刻）で書かれるので、時刻が近く・作品が同じものを選ぶ
 */
export const findCreatorRewardEarning = (
  earnings: readonly CreatorRewardEarning[],
  target: { createdAt: number; workId?: string | null },
  toleranceSeconds = 180,
): CreatorRewardEarning | null => {
  let best: CreatorRewardEarning | null = null
  let bestDiff = Number.POSITIVE_INFINITY
  for (const earning of earnings) {
    if (earning.kind !== "SUPPORT") continue
    if (target.workId && earning.workId && earning.workId !== target.workId) {
      continue
    }
    const diff = Math.abs(earning.createdAt - target.createdAt)
    if (diff <= toleranceSeconds && diff < bestDiff) {
      best = earning
      bestDiff = diff
    }
  }
  return best
}

/** 通知の行など、深いところで報酬の行を探すための入れ物（読み込めていなければ null） */
export const CreatorRewardEarningsContext = createContext<
  readonly CreatorRewardEarning[] | null
>(null)
