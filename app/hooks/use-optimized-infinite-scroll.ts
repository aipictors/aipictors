import { useCallback, useEffect, useRef, useState } from "react"
import { throttle } from "~/utils/mobile-performance"

type UseOptimizedInfiniteScrollOptions = {
  hasNext: boolean
  loading: boolean
  threshold?: number
  rootMargin?: string
  // モバイル最適化: バッテリー状況を考慮
  respectsBatteryLevel?: boolean
}

/**
 * モバイルパフォーマンス最適化された無限スクロールフック
 * - throttled scroll events
 * - battery-aware loading
 * - optimized intersection observer
 */
export function useOptimizedInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: UseOptimizedInfiniteScrollOptions,
) {
  const {
    hasNext,
    loading,
    threshold = 0.1,
    rootMargin = "100px",
    respectsBatteryLevel = true,
  } = options

  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isLowBattery, setIsLowBattery] = useState(false)

  // バッテリー状況の監視
  useEffect(() => {
    if (!respectsBatteryLevel || typeof navigator === "undefined") return

    const checkBattery = async () => {
      try {
        // @ts-ignore - Battery API
        const battery = await navigator.getBattery?.()
        if (battery) {
          const updateBatteryStatus = () => {
            setIsLowBattery(battery.level < 0.2 && !battery.charging)
          }

          updateBatteryStatus()
          battery.addEventListener("levelchange", updateBatteryStatus)
          battery.addEventListener("chargingchange", updateBatteryStatus)

          return () => {
            battery.removeEventListener("levelchange", updateBatteryStatus)
            battery.removeEventListener("chargingchange", updateBatteryStatus)
          }
        }
      } catch (error) {
        console.debug("Battery API not supported:", error)
      }
    }

    checkBattery()
  }, [respectsBatteryLevel])

  // throttled load more function
  const throttledLoadMore = useCallback(
    throttle(
      async () => {
        if (!hasNext || loading) return

        // 低バッテリー時は読み込み頻度を下げる
        if (isLowBattery) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }

        await onLoadMore()
      },
      isLowBattery ? 2000 : 500,
    ),
    [onLoadMore, hasNext, loading, isLowBattery],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // Intersection Observer の設定
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasNext && !loading) {
          throttledLoadMore()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.unobserve(sentinel)
    }
  }, [throttledLoadMore, hasNext, loading, threshold, rootMargin])

  return sentinelRef
}

/**
 * 簡易版 - 既存コードとの互換性のため
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: { hasNext: boolean; loading: boolean },
) {
  return useOptimizedInfiniteScroll(onLoadMore, options)
}
