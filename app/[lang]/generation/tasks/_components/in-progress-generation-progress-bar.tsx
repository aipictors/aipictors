import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

type Props = {
  remainingSeconds?: number
}

/**
 * 読み込み中の履歴の進捗バー
 * @returns
 */
export const InProgressGenerationProgressBar = (props: Props) => {
  const [elapsedGenerationTime, setElapsedGenerationTime] = useState(0)

  useEffect(() => {
    const time = setInterval(() => {
      setElapsedGenerationTime((prev) => prev + 1)
    }, 1000)
    return () => {
      clearInterval(time)
    }
  })

  /**
   * 残り秒数からの生成進捗（パーセンテージ）
   */
  const generationProgress = () => {
    if (elapsedGenerationTime === 0) {
      return 100
    }
    if (!props.remainingSeconds) return 0
    return (elapsedGenerationTime / props.remainingSeconds) * 100
  }

  return (
    <>
      <Progress className="w-full" value={generationProgress()} />
    </>
  )
}
