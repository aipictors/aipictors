import { useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"

type Props = {
  children: React.ReactNode
  /** 中身が出るまで取っておく高さ（出たときにページが動かないように） */
  minHeightClassName?: string
  rootMargin?: string
}

/**
 * 画面に近づいてから中身を描画する（作品ページの下の方の読み込みを後回しにする）
 */
export function WorkLazySection(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || !("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: props.rootMargin ?? "600px" },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [props.rootMargin])

  return (
    <div ref={ref} className={cn(!isVisible && props.minHeightClassName)}>
      {isVisible ? props.children : null}
    </div>
  )
}
