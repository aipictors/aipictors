"use client"

import { runAnimation } from "@/[lang]/app/_utils/run-animation"
import { useEffect, useRef } from "react"

export const AppCanvas = () => {
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
