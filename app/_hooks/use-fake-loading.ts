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
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const startFakeLoading = () => {
    if (timer) clearTimeout(timer)
    setIsFakeLoading(true)
    const newTimer = setTimeout(() => {
      setIsFakeLoading(false)
    }, duration)
    setTimer(newTimer)
  }

  const stopFakeLoading = () => {
    if (timer) clearTimeout(timer)
    setIsFakeLoading(false)
  }

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timer])

  return [isFakeLoading, { startFakeLoading, stopFakeLoading }]
}
