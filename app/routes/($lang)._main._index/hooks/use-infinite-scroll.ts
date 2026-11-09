import { useEffect, useRef, type RefObject } from "react"

type Opts = { hasNext: boolean; loading: boolean }

/** 読み足しても一覧が伸びなかったとき、同じ位置でもう一度読むまでの間隔 */
export const NO_PROGRESS_RETRY_MS = 5000

/**
 * もう一度読み足してよいか。
 * 読み足すたびに監視を作り直すので、一覧が伸びないと（失敗・最後のページ）画面に入ったままの目印がすぐ反応し、
 * 同じ要求を連続で送ってしまう。目印が動いていない間は間隔を空ける
 */
export function shouldLoadMore(props: {
  sentinelTop: number
  lastSentinelTop: number | null
  now: number
  lastLoadedAt: number
}) {
  if (props.lastSentinelTop === null) return true
  if (Math.abs(props.sentinelTop - props.lastSentinelTop) > 1) return true
  return props.now - props.lastLoadedAt >= NO_PROGRESS_RETRY_MS
}

/**
 * 一覧の終わりの目印が見えたら読み足す
 */
export function useInfiniteScroll(
  onReachEnd: () => unknown,
  { hasNext, loading }: Opts,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)
  const lastRef = useRef<{ top: number | null; at: number }>({
    top: null,
    at: 0,
  })

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || !hasNext || loading) return
          const top = e.boundingClientRect.top + window.scrollY
          const now = Date.now()
          if (
            !shouldLoadMore({
              sentinelTop: top,
              lastSentinelTop: lastRef.current.top,
              now,
              lastLoadedAt: lastRef.current.at,
            })
          ) {
            return
          }
          lastRef.current = { top, at: now }
          Promise.resolve(onReachEnd()).catch(() => {})
        })
      },
      // 画面の下に来る少し前（約 2 画面分）から読み始める。
      // 末尾に着いてから読み込むと、フッターが見えている状態で一覧が足されてページがずれる（CLS）
      { rootMargin: "0px 0px 2000px 0px" },
    )

    ob.observe(el)

    return () => {
      ob.disconnect()
    }
  }, [onReachEnd, hasNext, loading])

  return ref
}
