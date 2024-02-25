// 後々使うかも

import AppRadiusProgress from "@/components/app/app-radius-progress"
import { useEffect, useState } from "react"

type Props = {
  remainingSeconds?: number
}

export const InProgressGenerationRadiusProgressBar = (props: Props) => {
  const [elapsedGenerationTime, setElapsedGenerationTime] = useState(0)
  const [maxProgress, setMaxProgress] = useState(0) // 最大進行状況を追跡

  useEffect(() => {
    const time = setInterval(() => {
      setElapsedGenerationTime((prev) => prev + 1)
    }, 1000)
    return () => {
      clearInterval(time)
    }
  }, []) // 依存配列を追加して、エフェクトがマウント時にのみ実行されるように

  useEffect(() => {
    // 現在の進行状況を計算
    const currentProgress = props.remainingSeconds
      ? Math.min(100, (elapsedGenerationTime / props.remainingSeconds) * 100)
      : 0
    // 現在の進行状況がこれまでの最大値より大きい場合は更新
    setMaxProgress((prev) => Math.max(prev, currentProgress))
  }, [elapsedGenerationTime, props.remainingSeconds]) // 依存配列にelapsedGenerationTimeとprops.remainingSecondsを追加

  return (
    <AppRadiusProgress
      percent={maxProgress} // 現在の最大進行状況を使用
      size={120} // 円のサイズ
      strokeWidth={3} // 外周の線幅
    />
  )
}
