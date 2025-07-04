import { useEffect, useRef, type RefObject } from "react"

type Opts = { hasNext: boolean; loading: boolean }

/**
 * ✅ デバッグ用ログを埋め込んだ版
 *   - 生成／解放タイミング
 *   - IntersectionObserver の各エントリ
 *   - `hasNext` / `loading` 依存の変更
 */
export function useInfiniteScroll(
  onReachEnd: () => void,
  { hasNext, loading }: Opts,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)

  // 依存が変わるたびにログ
  useEffect(() => {
    console.debug("[useInfiniteScroll] deps", { hasNext, loading })
  }, [hasNext, loading])

  useEffect(() => {
    const el = ref.current
    if (!el) {
      console.debug("[useInfiniteScroll] sentinel is null → skip observe")
      return
    }

    console.debug("[useInfiniteScroll] create observer", {
      rootMargin: "300px",
    })

    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          console.debug("[useInfiniteScroll] entry", {
            isIntersecting: e.isIntersecting,
            intersectionRatio: e.intersectionRatio.toFixed(2),
            hasNext,
            loading,
          })

          if (e.isIntersecting && hasNext && !loading) {
            console.debug("[useInfiniteScroll] → onReachEnd fired")
            onReachEnd()
          }
        })
      },
      { rootMargin: "300px" },
    )

    ob.observe(el)

    return () => {
      console.debug("[useInfiniteScroll] disconnect observer")
      ob.disconnect()
    }
  }, [onReachEnd, hasNext, loading])

  return ref
}
