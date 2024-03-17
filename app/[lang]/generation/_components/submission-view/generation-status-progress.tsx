import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

type Props = {
  maxTasksCount: number
  remainingImageGenerationTasksCount: number
  inProgress: boolean
  isOnlyStatusForSubscriberDisplay?: boolean // 生成機の状態についてサブスクユーザの場合一般と優先どちらも表示するかどうか
  normalPredictionGenerationSeconds: number
  normalTasksCount: number
  standardPredictionGenerationSeconds: number
  standardTasksCount: number
  passType: string | null
}

export function GenerationEditorProgress(props: Props) {
  const isTimeout = useFocusTimeout()

  // 生成経過時間
  const [elapsedGenerationTime, setElapsedGenerationTime] = useState(0)

  useEffect(() => {
    const time = setInterval(() => {
      if (isTimeout || !props.inProgress) {
        setElapsedGenerationTime(0)
        return
      }
      if (props.inProgress) {
        setElapsedGenerationTime((prev) => prev + 1)
      } else {
        setElapsedGenerationTime(0)
      }
    }, 1000)
    return () => {
      clearInterval(time)
    }
  }, [props.inProgress])

  const isPriorityAccount = () => {
    if (props.passType === "STANDARD" || props.passType === "PREMIUM") {
      return true
    }
    return false
  }

  const generateSpeed = (waitTasks: number | undefined) => {
    if (waitTasks === undefined) return -1
    if (waitTasks < 5) {
      return 0
    }
    if (waitTasks < 10) {
      return 1
    }
    return 2
  }

  const speed = props.inProgress ? generateSpeed(props.normalTasksCount) : -1

  const prioritySpeed = props.inProgress
    ? generateSpeed(props.standardTasksCount)
    : -1

  /**
   * TODO: 移動
   * @param speed
   * @returns
   */
  const generateStatus = (speed: number) => {
    if (speed === -1) {
      return "-"
    }
    if (speed === 0) {
      return "快適"
    }
    if (speed === 1) {
      return "通常"
    }
    return "混雑"
  }

  /**
   * TODO: 移動
   * 残り秒数（s/m/h単位)
   */
  // const secondsRemaining = () => {
  //   if (elapsedGenerationTime === 0) {
  //     return 0
  //   }
  //   const waitSeconds = isPriorityAccount()
  //     ? props.standardPredictionGenerationSeconds
  //     : props.normalPredictionGenerationSeconds
  //   if (!waitSeconds) return 0
  //   const remainingSeconds = waitSeconds - elapsedGenerationTime
  //   if (remainingSeconds < 0) {
  //     return "まもなく"
  //   }
  //   return toGenerationTime(remainingSeconds)
  // }

  return (
    <div className="space-y-2">
      <div className="flex">
        <Badge className="mr-2" variant={"secondary"}>
          {"生成枚数 "} {props.remainingImageGenerationTasksCount}/
          {props.maxTasksCount}
        </Badge>

        {props.isOnlyStatusForSubscriberDisplay ? (
          <>
            {isPriorityAccount() ? (
              <Badge className="mr-2" variant={"secondary"}>
                {"優先状態 "}
                {generateStatus(prioritySpeed)}
              </Badge>
            ) : (
              <Badge
                variant={"secondary"}
                className={`mr-2${isPriorityAccount() ? "opacity-50" : ""}`}
              >
                {"状態"} {generateStatus(speed)}
              </Badge>
            )}
          </>
        ) : (
          <>
            {isPriorityAccount() && (
              <Badge className="mr-2" variant={"secondary"}>
                {"優先状態 "}
                {generateStatus(prioritySpeed)}
              </Badge>
            )}
            <Badge
              variant={"secondary"}
              className={`mr-2${isPriorityAccount() ? "opacity-50" : ""}`}
            >
              {isPriorityAccount() ? "一般状態" : "状態"}{" "}
              {generateStatus(speed)}
            </Badge>
          </>
        )}
        {/* <Badge variant={"secondary"} className={"mr-2"}>
          {"予測"} {props.inProgress ? secondsRemaining() : "-"}
        </Badge> */}
      </div>
    </div>
  )
}
