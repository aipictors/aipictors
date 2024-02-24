import { useEffect, useState } from "react"

// ローディング制御関数の型を定義
interface FakeLoadingActions {
  startFakeLoading: () => void
  stopFakeLoading: () => void
}

/**
 * 人工的なローディング状態を制御するフック
 * @param {number} duration - ローディング状態を維持する時間（ミリ秒）
 * @returns {[boolean, FakeLoadingActions]} - ローディング状態と、制御関数のオブジェクト
 */
export const useFakeLoading = (
  duration: number,
): [boolean, FakeLoadingActions] => {
  const [isFakeLoading, setIsFakeLoading] = useState(false)
  // NodeJS.Timeoutからnumberに変更
  const [timer, setTimer] = useState<number | null>(null)

  const startFakeLoading = () => {
    if (timer !== null) clearTimeout(timer)
    setIsFakeLoading(true)
    // setTimeoutの戻り値を直接numberとして扱う
    const newTimer = window.setTimeout(() => {
      setIsFakeLoading(false)
    }, duration)
    setTimer(newTimer)
  }

  const stopFakeLoading = () => {
    if (timer !== null) clearTimeout(timer)
    setIsFakeLoading(false)
  }

  useEffect(() => {
    return () => {
      if (timer !== null) clearTimeout(timer)
    }
  }, [timer])

  return [isFakeLoading, { startFakeLoading, stopFakeLoading }]
}
