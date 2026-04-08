import { useEffect, useState } from "react"

type Props = {
  messages: string[]
}

export function HomeLoginNoticeMarquee(props: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (props.messages.length <= 1) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReducedMotion) {
      return
    }

    const intervalId = window.setInterval(() => {
      setIsFading(true)

      window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % props.messages.length)
        setIsFading(false)
      }, 900)
    }, 4600)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [props.messages])

  if (props.messages.length === 0) {
    return null
  }

  return (
    <div className="-mx-4 border-border/40 border-b bg-muted/10 px-4 py-1.5">
      <div className="flex min-h-5 items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
        <span className="shrink-0 uppercase tracking-[0.18em] opacity-60">
          New
        </span>
        <p
          className={`truncate transition-opacity duration-900 ease-out ${
            isFading ? "opacity-0" : "opacity-80"
          }`}
        >
          {props.messages[currentIndex]}
        </p>
      </div>
    </div>
  )
}
