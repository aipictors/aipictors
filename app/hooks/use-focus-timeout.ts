import { useEffect, useRef, useState } from "react"

/** フォーカスが無いままこの時間が過ぎたらタイムアウト */
const FOCUS_TIMEOUT_MS = 10 * 60 * 1000

/**
 * 10分間フォーカスがなかったらタイムアウトとする
 *
 * 最後にフォーカスがあった時刻は ref に持ち、タイムアウトの有無が変わったときだけ state を変える。
 * 前は 1 秒ごとに時刻の state を更新していて、使っている画面（生成画面の全体・履歴一覧）が
 * フォーカス中ずっと毎秒描き直されていた
 */
export function useFocusTimeout() {
  const lastFocusTimeRef = useRef(Date.now())
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    const time = setInterval(() => {
      if (document.hasFocus()) {
        lastFocusTimeRef.current = Date.now()
      }
      const next = FOCUS_TIMEOUT_MS < Date.now() - lastFocusTimeRef.current
      setIsTimeout((prev) => (prev === next ? prev : next))
    }, 1000)

    return () => {
      clearInterval(time)
    }
  }, [])

  return isTimeout
}
