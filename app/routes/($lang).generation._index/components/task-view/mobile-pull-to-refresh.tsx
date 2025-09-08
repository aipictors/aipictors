import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2Icon } from "lucide-react"
import { cn } from "~/lib/utils"
import { logInfo } from "~/routes/($lang).generation._index/utils/client-diagnostics-logger"

// モバイル専用: 子要素のスクロール領域にプル・トゥ・リフレッシュを付与する
// 注意: このコンポーネントは高さ制約を持つスクロール領域を内包します。
// 親側で高さを制御したい場合は scrollContainerClassName を渡してください。

type Props = {
  children: React.ReactNode
  onRefresh?: () => Promise<void> | void
  thresholdPx?: number
  maxPullPx?: number
  scrollContainerClassName?: string
}

export function MobilePullToRefresh(props: Props) {
  const thresholdPx = props.thresholdPx ?? 64
  const maxPullPx = props.maxPullPx ?? 96

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const startYRef = useRef<number | null>(null)
  const isPullingRef = useRef(false)

  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // スクロールがトップかどうか
  const canStartPull = useCallback(() => {
    const el = scrollRef.current
    if (!el) return false
    if (isRefreshing) return false
    return el.scrollTop <= 0
  }, [isRefreshing])

  const reset = useCallback(() => {
    setPullDistance(0)
    isPullingRef.current = false
    startYRef.current = null
  }, [])

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!canStartPull()) return
      const touch = event.touches[0]
      if (!touch) return
      startYRef.current = touch.clientY
      isPullingRef.current = true
    },
    [canStartPull],
  )

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!isPullingRef.current) return
      const touch = event.touches[0]
      if (!touch) return
      const startY = startYRef.current
      if (startY === null) return

      const delta = touch.clientY - startY
      if (delta <= 0) {
        setPullDistance(0)
        return
      }

      // 過度のバウンスを抑制
      const distance = Math.min(maxPullPx, delta)
      setPullDistance(distance)
    },
    [maxPullPx],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return

    // リフレッシュ判定
    if (pullDistance >= thresholdPx && props.onRefresh) {
      setIsRefreshing(true)
      logInfo({ source: "history:pull-to-refresh", message: "start" })
      // スピナーエリアを確保
      setPullDistance(Math.max(thresholdPx, 40))
      try {
        const result = props.onRefresh()
        if (result instanceof Promise) {
          await result
        }
        logInfo({ source: "history:pull-to-refresh", message: "done" })
      } finally {
        setIsRefreshing(false)
        // 少し待ってから戻すと自然
        setTimeout(() => {
          reset()
        }, 200)
      }
      return
    }

    // しきい値未満は即リセット
    logInfo({ source: "history:pull-to-refresh", message: "cancel" })
    reset()
  }, [props, pullDistance, thresholdPx, reset])

  // ナビゲーション等で中断された場合の保険
  useEffect(() => {
    return () => {
      isPullingRef.current = false
    }
  }, [])

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          // モバイルでの独立スクロールを優先、バウンスを抑える
          "overflow-y-auto overscroll-y-contain",
          // 親からの高さ/パディング調整
          props.scrollContainerClassName,
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="transition-transform duration-150 ease-out will-change-transform"
          style={{
            transform: `translateY(${isRefreshing ? Math.max(pullDistance, 40) : pullDistance}px)`,
          }}
        >
          {props.children}
        </div>
      </div>

      {/* インジケータ */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex h-10 items-center justify-center"
        style={{
          opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
          transition: "opacity 150ms ease-out",
        }}
      >
        <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 shadow-sm ring-1 ring-border backdrop-blur">
          <Loader2Icon
            className={cn("h-4 w-4", isRefreshing ? "animate-spin" : "")}
          />
          <span className="text-muted-foreground text-xs">
            {isRefreshing
              ? "更新中..."
              : pullDistance >= thresholdPx
                ? "離して更新"
                : "下に引いて更新"}
          </span>
        </div>
      </div>
    </div>
  )
}
