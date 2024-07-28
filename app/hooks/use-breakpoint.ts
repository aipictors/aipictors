import { getBreakpoint } from "@/utils/get-breakpoints"
import { throttle } from "../lib/throttle"
import { useEffect, useState } from "react"

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint(window.innerWidth))

  useEffect(() => {
    if (typeof document === "undefined") return
    const calcInnerWidth = throttle(() => {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }, 128)
    window.addEventListener("resize", calcInnerWidth)
    return () => {
      window.removeEventListener("resize", calcInnerWidth)
    }
  }, [])

  return breakpoint
}
