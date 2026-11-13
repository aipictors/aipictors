import { useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"

type Props = Readonly<{
  children: React.ReactNode
  className?: string
  /** 出てくるのを遅らせる時間（ミリ秒。横に並んだものを順に出す） */
  delay?: number
  as?: "div" | "section" | "li"
  id?: string
}>

/**
 * 画面に入ったときに、下からふわっと出す
 */
export function PictorChanReveal(props: Props): React.ReactNode {
  const ref = useRef<HTMLElement>(null)
  const [isShown, setIsShown] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === "undefined") {
      setIsShown(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsShown(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const Tag = props.as ?? "div"
  return (
    <Tag
      ref={ref as any}
      id={props.id}
      data-shown={isShown}
      className={cn("pkc-reveal", props.className)}
      style={props.delay ? { transitionDelay: `${props.delay}ms` } : undefined}
    >
      {props.children}
    </Tag>
  )
}
