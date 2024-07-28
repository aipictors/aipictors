import { getBreakpoint } from "~/utils/get-breakpoints"
import { throttle } from "../lib/throttle"
import { useEffect, useState } from "react"

type Props<T> = {
  base: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

export const useBreakpointValue = <T>(props: Props<T>) => {
  const [breakpoint, setBreakpoint] = useState<ReturnType<
    typeof getBreakpoint
  > | null>(null)

  useEffect(() => {
    if (typeof document === "undefined") return
    setBreakpoint(getBreakpoint(window.innerWidth))
    const calcInnerWidth = throttle(() => {
      setBreakpoint(getBreakpoint(window.innerWidth))
    }, 128)
    window.addEventListener("resize", calcInnerWidth)
    return () => {
      window.removeEventListener("resize", calcInnerWidth)
    }
  }, [])

  if (breakpoint === null) {
    return null
  }

  if (breakpoint === "xl") {
    return props.xl ?? props.lg ?? props.md ?? props.sm ?? props.base ?? null
  }

  if (breakpoint === "lg") {
    return props.lg ?? props.md ?? props.sm ?? props.base ?? null
  }

  if (breakpoint === "md") {
    return props.md ?? props.sm ?? props.base ?? null
  }

  if (breakpoint === "sm") {
    return props.sm ?? props.base ?? null
  }

  if (breakpoint === "base") {
    return props.base ?? null
  }

  return null
}
