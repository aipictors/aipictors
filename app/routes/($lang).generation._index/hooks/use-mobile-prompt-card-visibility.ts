import { useEffect, useSyncExternalStore } from "react"

let isVisible = false

const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const setVisible = (value: boolean) => {
  if (isVisible === value) return
  isVisible = value
  for (const listener of listeners) {
    listener()
  }
}

/**
 * スマホのプロンプト入力欄が画面に見えているか
 * （見えている間は下の固定バーのプロンプト欄を出さない）
 */
export function useIsMobilePromptCardVisible() {
  return useSyncExternalStore(
    subscribe,
    () => isVisible,
    () => false,
  )
}

/**
 * プロンプト入力欄が画面に見えているかを記録する
 */
export function useObserveMobilePromptCard(
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const element = ref.current
    if (element === null) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting)
      },
      // 下の固定バーに隠れている分は見えていない扱いにする
      { rootMargin: "0px 0px -180px 0px" },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      setVisible(false)
    }
  }, [ref])
}
