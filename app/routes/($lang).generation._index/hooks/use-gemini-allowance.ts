import { useCallback, useEffect, useState } from "react"
import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

export type GeminiAllowance = {
  planType: string
  /** 1 週間に毎日のフリーコインから Gemini に使える量（コイン） */
  weeklyLimit: number
  used: number
  remaining: number
  /** 枠を適用しているか（適用前は案内だけ出す） */
  isEnforced: boolean
  /** 適用を始める時刻（UNIX 秒） */
  enforcedFrom: number
  /** 枠が戻る時刻（UNIX 秒） */
  resetsAt: number
}

/**
 * 今週の Gemini の枠（Gemini を選んでいるときだけ読む）
 */
export function useGeminiAllowance(props: { isEnabled: boolean }) {
  const [allowance, setAllowance] = useState<GeminiAllowance | null>(null)

  const refetch = useCallback(async () => {
    try {
      const headers = await getViewerRequestHeaders({
        includeJsonContentType: true,
      })
      const response = await fetch("/api/coins/gemini-allowance", { headers })
      const json = (await response.json()) as { data?: GeminiAllowance | null }
      if (response.ok && json.data) {
        setAllowance(json.data)
      }
    } catch {
      // 読めなくても生成はできる（サーバーが枠を確認する）
    }
  }, [])

  useEffect(() => {
    if (props.isEnabled) {
      refetch()
    }
  }, [props.isEnabled, refetch])

  return { allowance, refetch }
}
