import { useEffect, useState } from "react"
import { usePlusStatus } from "~/hooks/use-plus-status"
import {
  getViewerRequestHeaders,
  getViewerRequestSessionId,
} from "~/lib/viewer-request-headers"

/**
 * 加入中のプランの状態（解約予定か・いつ入ったか・いつ終わるか）。時刻は UNIX 秒
 */
export type SubscriptionSummary = {
  status: string | null
  type: string | null
  createdAt: number | null
  currentPeriodEnd: number | null
  trialEnd: number | null
}

const STORAGE_KEY = "aipictors-subscription-summary"

// どのページにも出る案内で使うので、ページごとには聞かない
const REMEMBER_MS = 10 * 60 * 1000

const read = (sessionId: string): SubscriptionSummary | null => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const value = JSON.parse(raw) as {
      sessionId?: unknown
      at?: unknown
      summary?: SubscriptionSummary
    }
    if (value.sessionId !== sessionId || typeof value.at !== "number")
      return null
    if (Date.now() - value.at > REMEMBER_MS || !value.summary) return null
    return value.summary
  } catch (_error) {
    return null
  }
}

/** 解約の取り消しなど、状態を変えたあとに呼ぶ */
export function clearSubscriptionSummaryCache() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch (_error) {
    // 何もしない
  }
}

let pending: Promise<SubscriptionSummary | null> | null = null

const load = async (sessionId: string): Promise<SubscriptionSummary | null> => {
  const cached = read(sessionId)
  if (cached !== null) return cached
  pending ??= (async () => {
    try {
      const headers = await getViewerRequestHeaders()
      const response = await fetch("/api/stripe/subscription-status", {
        headers,
        cache: "no-store",
      })
      if (!response.ok) return null
      const json = (await response.json().catch(() => null)) as {
        error: string | null
        data: SubscriptionSummary | null
      } | null
      if (!json || json.error || !json.data) return null
      try {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionId, at: Date.now(), summary: json.data }),
        )
      } catch (_error) {
        // 覚えておけなくても表示はする
      }
      return json.data
    } catch (_error) {
      return null
    } finally {
      pending = null
    }
  })()
  return pending
}

/**
 * 加入中の人のプランの状態を取る（加入していない人・未ログインの人は聞かずに null）
 */
export function useSubscriptionSummary(isEnabled = true) {
  const status = usePlusStatus()
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null)

  useEffect(() => {
    if (!isEnabled || status !== "member") {
      setSummary(null)
      return
    }
    const sessionId = getViewerRequestSessionId()
    if (sessionId === null) return
    let isCancelled = false
    void load(sessionId).then((value) => {
      if (!isCancelled) setSummary(value)
    })
    return () => {
      isCancelled = true
    }
  }, [isEnabled, status])

  return summary
}
