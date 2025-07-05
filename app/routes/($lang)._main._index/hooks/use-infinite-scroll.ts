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

  useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && hasNext && !loading) {
            onReachEnd()
          }
        })
      },
      { rootMargin: "300px" },
    )

    ob.observe(el)

    return () => {
      ob.disconnect()
    }
  }, [onReachEnd, hasNext, loading])

  return ref
}
