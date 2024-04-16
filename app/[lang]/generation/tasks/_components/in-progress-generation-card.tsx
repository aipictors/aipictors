import { GenerationQueryContext } from "@/[lang]/generation/_contexts/generation-query-context"
import { GenerationTaskCancelButton } from "@/[lang]/generation/tasks/_components/generation-cancel-button"
import { InProgressGenerationProgressBar } from "@/[lang]/generation/tasks/_components/in-progress-generation-progress-bar"
import { Card } from "@/_components/ui/card"
import { Loader2Icon } from "lucide-react"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"

type Props = {
  onCancel?(): void
  isCreatingTasks?: boolean
  isCanceling?: boolean
  inProgressNormalCount: number
  initImageGenerationWaitCount: number
  imageGenerationWaitCount: number
}

/**
 * 読み込み中の履歴
 * @returns
 */
export const InProgressGenerationCard = (props: Props) => {
  const [initWaitCount, setInitWaitCount] = useState(-1)

  const [initNormalWaitCount, setInitNormalWaitCount] = useState(-1)

  useEffect(() => {
    if (initWaitCount === -1) {
      setInitWaitCount(props.initImageGenerationWaitCount)
    }
    if (initNormalWaitCount === -1) {
      setInitNormalWaitCount(props.inProgressNormalCount)
    }
  }, [])

  const dataContext = useContext(GenerationQueryContext)

  const isStandardOrPremium =
    dataContext.currentPass?.type === "STANDARD" ||
    dataContext.currentPass?.type === "PREMIUM"

  // const waitSecondsLabel = () => {
  //   const waitSecondsOnOneTask = 15
  //   if (initWaitCount * waitSecondsOnOneTask > 120) {
  //     return "数分"
  //   }
  //   if (initWaitCount * waitSecondsOnOneTask > 60) {
  //     return "1分"
  //   }
  //   if (initWaitCount * waitSecondsOnOneTask > 20) {
  //     return "数十秒"
  //   }
  //   if (initWaitCount * waitSecondsOnOneTask > 0) {
  //     return "十数秒"
  //   }
  //   return "十数秒"
  // }

  return (
    <>
      <Card>
        <div>
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="mr-auto h-6 w-6 animate-spin" />
              <span className="ta-c m-auto mb-4 text-sm">
                {"generating..."}
              </span>
              {initWaitCount !== 0 && (
                <p className="text-sm">
                  待ち: {props.imageGenerationWaitCount}/{initWaitCount}
                </p>
              )}
              {!isStandardOrPremium && (
                <Link
                  href="/plus"
                  className="text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex flex-col text-cyan-400 text-sm">
                    <div>{"優先生成で"}</div>
                    <div>{"速度向上する"}</div>
                  </div>
                </Link>
              )}
              {isStandardOrPremium && initNormalWaitCount !== 0 && (
                <div className="flex flex-col text-cyan-400 text-sm">
                  <div>{`優先生成：${initNormalWaitCount}人をスキップ`}</div>
                </div>
              )}
              {/* <span className="ta-c m-auto text-sm">{`予想時間: ${waitSecondsLabel()}`}</span>
               */}
              <InProgressGenerationProgressBar
                per={
                  initWaitCount === 0
                    ? 0
                    : (1 - props.imageGenerationWaitCount / initWaitCount) * 100
                }
              />
            </div>
            <GenerationTaskCancelButton
              onCancel={props.onCancel}
              isDisabled={props.isCreatingTasks}
              isCanceling={props.isCanceling}
            />
          </div>
          {/* <InProgressGenerationProgressBar
          remainingSeconds={props.estimatedSeconds}
        /> */}
        </div>
      </Card>
    </>
  )
}
