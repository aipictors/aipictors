import { useEffect, useRef } from "react"

export function AppCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current === null || typeof window === "undefined") return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    )

    if (prefersReducedMotion.matches) {
      return
    }

    let isDisposed = false
    let cleanup: (() => void) | undefined

    void import("~/routes/($lang).app._index/utils/run-animation").then(
      ({ runAnimation }) => {
        if (isDisposed || ref.current === null) {
          return
        }

        cleanup = runAnimation(ref.current)
      },
    )

    return () => {
      isDisposed = true
      cleanup?.()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
        touchAction: "none",
      }}
    />
  )
}
