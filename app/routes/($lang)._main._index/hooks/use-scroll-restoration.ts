// hooks/use-scroll-restoration.ts
import { useEffect, useLayoutEffect } from "react"

// SSR対応のuseIsomorphicLayoutEffect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export function useScrollRestoration(key: string, ready: boolean) {
  useIsomorphicLayoutEffect(() => {
    if (!ready || typeof window === "undefined") return

    const scrollKey = `scroll-${key}`
    const savedScrollY = sessionStorage.getItem(scrollKey)

    if (savedScrollY) {
      window.scrollTo(0, Number.parseInt(savedScrollY, 10))
    }

    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, window.scrollY.toString())
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [key, ready])
}
