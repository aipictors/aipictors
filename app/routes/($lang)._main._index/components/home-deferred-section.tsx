import { Skeleton } from "~/components/ui/skeleton"
import { useEffect, useRef, useState } from "react"

type HomeDeferredSectionProps = {
  children: React.ReactNode
  fallback: React.ReactNode
  rootMargin?: string
  threshold?: number
}

export function HomeDeferredSection(props: HomeDeferredSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible) {
      return
    }

    if (typeof window === "undefined") {
      return
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true)
      return
    }

    const target = ref.current

    if (!target) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: props.rootMargin ?? "240px 0px",
        threshold: props.threshold ?? 0,
      },
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [isVisible, props.rootMargin, props.threshold])

  return <div ref={ref}>{isVisible ? props.children : props.fallback}</div>
}

type HomeWorkSectionPlaceholderProps = {
  title: string
  variant?: "album" | "cropped"
  itemCount?: number
}

export function HomeWorkSectionPlaceholder (
  props: HomeWorkSectionPlaceholderProps,
) {
  const items = Array.from({
    length:
      props.itemCount ?? (props.variant === "cropped" ? 8 : 6),
  })

  return (
    <section className="space-y-4">
      <h2 className="text-left font-bold text-xl">{props.title}</h2>
      <div
        className={
          props.variant === "cropped"
            ? "grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-4 2xl:grid-cols-5"
            : "grid grid-cols-2 gap-3 md:grid-cols-3"
        }
      >
        {items.map((_, index) => (
          <div key={index.toString()} className="space-y-2">
            <Skeleton
              className={
                props.variant === "cropped"
                  ? "aspect-square w-full rounded-md"
                  : "aspect-[4/3] w-full rounded-md"
              }
            />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        ))}
      </div>
    </section>
  )
}