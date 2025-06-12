import { useEffect, useRef, type RefObject } from "react"

type Opts = { hasNext: boolean; loading: boolean }

export function useInfiniteScroll(
  onReachEnd: () => void,
  { hasNext, loading }: Opts,
): RefObject<HTMLDivElement> {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && hasNext && !loading) onReachEnd()
      },
      { rootMargin: "300px" },
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [onReachEnd, hasNext, loading])

  return ref
}
