import { getBreakpoint } from "@/app/_utils/get-breakpoints"
import { throttle } from "lodash"
import { useEffect, useState } from "react"

type Props<T> = {
  base: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

export const useBreakpointValue = <T>(props: Props<T>) => {
  const [breakpoint, setBreakpoint] = useState("base")

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

  if (breakpoint === "xl" && props.xl !== undefined) {
    return props.xl
  }

  if (breakpoint === "lg" && props.lg !== undefined) {
    return props.lg
  }

  if (breakpoint === "md" && props.md !== undefined) {
    return props.md
  }

  if (breakpoint === "sm" && props.sm !== undefined) {
    return props.sm
  }

  return props.base
}
