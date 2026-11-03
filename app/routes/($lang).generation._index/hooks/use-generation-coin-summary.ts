import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  getViewerRequestHeaders,
  hasViewerRequestSession,
} from "~/lib/viewer-request-headers"
import { logWarn } from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"
import {
  type CoinSummaryResponse,
  normalizeCoinSummary,
} from "~/routes/($lang).generation._index/utils/generation-submit-coin"

/**
 * コインの残高を読む（本日の付与があればトーストで伝える）
 */
export function useGenerationCoinSummary(props: { isLoggedIn: boolean }) {
  const [coinSummary, setCoinSummary] =
    useState<CoinSummaryResponse["data"]>(null)

  const initialGrantToastShownRef = useRef(false)

  const loadCoinSummary = async () => {
    if (!props.isLoggedIn && !hasViewerRequestSession()) {
      setCoinSummary(null)
      return
    }

    const response = await fetch("/api/coins/summary", {
      headers: await getViewerRequestHeaders(),
    })

    const json = (await response.json()) as CoinSummaryResponse
    if (!response.ok || json.error || json.data === null) {
      throw new Error(json.error ?? "Failed to load coins")
    }

    setCoinSummary(normalizeCoinSummary(json.data))

    if (json.data.granted && !initialGrantToastShownRef.current) {
      initialGrantToastShownRef.current = true
      toast(
        `本日の付与コインとして${json.data.grantedFreeCoins + json.data.grantedPremiumCoins}コインが付与されました。本日24:00まで有効です。`,
        { position: "top-center" },
      )
    }
  }

  return { coinSummary, loadCoinSummary }
}

/**
 * 画面を開いたとき・生成を頼んだとき・結果が届いたときに残高を読み直す
 */
export function useGenerationCoinSummaryRefresh(props: {
  isLoggedIn: boolean
  loadCoinSummary: () => Promise<void>
}) {
  const { isLoggedIn, loadCoinSummary } = props

  useEffect(() => {
    loadCoinSummary().catch((error) => {
      if (error instanceof Error) {
        logWarn({
          source: "GenerationSubmit",
          message: "Failed to load coin summary",
          details: { message: error.message },
        })
      }
    })
  }, [isLoggedIn])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const onTaskRequested = () => {
      loadCoinSummary().catch((error) => {
        if (error instanceof Error) {
          logWarn({
            source: "GenerationSubmit",
            message: "Failed to refresh coin summary after task update",
            details: { message: error.message },
          })
        }
      })
    }

    window.addEventListener("generation:task-requested", onTaskRequested)
    return () => {
      window.removeEventListener("generation:task-requested", onTaskRequested)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const onResultArrived = () => {
      loadCoinSummary().catch((error) => {
        if (error instanceof Error) {
          logWarn({
            source: "GenerationSubmit",
            message: "Failed to refresh coin summary after result update",
            details: { message: error.message },
          })
        }
      })
    }

    window.addEventListener("generation:result-arrived", onResultArrived)
    return () => {
      window.removeEventListener("generation:result-arrived", onResultArrived)
    }
  }, [isLoggedIn])
}
