import { type RefObject, useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"

type Props = {
  children: React.ReactNode
  /** 中身が出るまで取っておく高さ（出たときにページが動かないように） */
  minHeightClassName?: string
  rootMargin?: string
}

/**
 * 要素が画面に近づいたら true（一度 true になったら戻さない）
 */
export function useIsNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "600px",
) {
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !("IntersectionObserver" in window)) {
      setIsNear(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return isNear
}

/**
 * 画面に近づいてから中身を描画する（作品ページの下の方の読み込みを後回しにする）
 */
export function WorkLazySection(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIsNearViewport(ref, props.rootMargin)

  return (
    <div ref={ref} className={cn(!isVisible && props.minHeightClassName)}>
      {isVisible ? props.children : null}
    </div>
  )
}
