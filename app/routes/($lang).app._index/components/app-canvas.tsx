import { runAnimation } from "~/routes/($lang).app._index/utils/run-animation"
import { useEffect, useRef } from "react"

export function AppCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (ref.current === null) return
    runAnimation(ref.current)
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
