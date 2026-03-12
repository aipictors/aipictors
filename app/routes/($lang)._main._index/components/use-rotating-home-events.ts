import { useEffect, useState } from "react"

type Options = {
  intervalMs?: number
  fadeMs?: number
}

export function useRotatingHomeEvents<T>(
  items: T[],
  options: Options = {},
) {
  const { intervalMs = 2000, fadeMs = 240 } = options
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    setCurrentIndex(0)
    setIsVisible(true)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) {
      return
    }

    let fadeTimeoutId: number | undefined

    const intervalId = window.setInterval(() => {
      setIsVisible(false)

      fadeTimeoutId = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
        setIsVisible(true)
      }, fadeMs)
    }, intervalMs)

    return () => {
      window.clearInterval(intervalId)

      if (fadeTimeoutId !== undefined) {
        window.clearTimeout(fadeTimeoutId)
      }
    }
  }, [fadeMs, intervalMs, items.length])

  return {
    currentIndex,
    isVisible,
  }
}

export function getRotatingItems<T>(
  items: T[],
  currentIndex: number,
  visibleCount: number,
) {
  if (items.length <= visibleCount) {
    return items
  }

  const rotated = [...items.slice(currentIndex), ...items.slice(0, currentIndex)]

  return rotated.slice(0, visibleCount)
}