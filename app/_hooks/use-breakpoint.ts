import { getBreakpoint } from "@/_utils/get-breakpoints"
import { throttle } from "../_lib/throttle"
import { useEffect, useState } from "react"

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState(getBreakpoint(window.innerWidth))

  useEffect(() => {
    if (typeof window === "undefined") return
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
