import { useEffect, useState } from "react"

type Options = {
  intervalMs?: number
  fadeMs?: number
  /**
   * 画面を操作する（スクロール・タップ・キー入力）まで切り替えを始めない。
   * 開いた直後から表示が切り替わり続けると、読み込みが終わってもページが落ち着かない
   * （PageSpeed の Speed Index も、最後に切り替わった時点まで表示が終わっていない扱いになる）
   */
  startAfterInteraction?: boolean
}

export function useRotatingHomeEvents<T>(
  items: T[],
  options: Options = {},
) {
  const {
    intervalMs = 2000,
    fadeMs = 240,
    startAfterInteraction = false,
  } = options
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [isStarted, setIsStarted] = useState(!startAfterInteraction)

  useEffect(() => {
    if (isStarted) {
      return
    }

    const events = ["pointerdown", "keydown", "scroll", "wheel"] as const
    const start = () => {
      setIsStarted(true)
    }
    for (const event of events) {
      window.addEventListener(event, start, { once: true, passive: true })
    }

    return () => {
      for (const event of events) {
        window.removeEventListener(event, start)
      }
    }
  }, [isStarted])

  useEffect(() => {
    setCurrentIndex(0)
    setIsVisible(true)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1 || !isStarted) {
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
  }, [fadeMs, intervalMs, isStarted, items.length])

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