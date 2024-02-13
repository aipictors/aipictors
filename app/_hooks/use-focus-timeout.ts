import { useEffect, useState } from "react"

/**
 * 10分間フォーカスがなかったらタイムアウトとする
 */
export const useFocusTimeout = () => {
  const [lastFocusTime, setLastFocusTime] = useState(Date.now())
  const [isTimeout, setIsTimeout] = useState(false)

  useEffect(() => {
    // フォーカスイベントハンドラ
    const handleFocus = () => {
      setLastFocusTime(Date.now())
      setIsTimeout(false) // フォーカスされた時点でタイムアウトをリセット
    }

    // 1秒ごとにチェック
    const time = setInterval(() => {
      if (document.hasFocus()) {
        handleFocus()
      }
      // 10分を経過したらタイムアウト
      const isTimeout = 10 * 60 * 1000 < Date.now() - lastFocusTime
      setIsTimeout(isTimeout)
    }, 1000)

    // クリーンアップ関数
    return () => {
      clearInterval(time)
    }
  }, [lastFocusTime])

  return isTimeout
}
