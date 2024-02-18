import { toGenerationTime } from "@/app/[lang]/generation/_utils/to-generation-time"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

type Props = {
  maxTasksCount: number
  remainingImageGenerationTasksCount: number
  inProgress: boolean
  elapsedGenerationTime: number
  normalPredictionGenerationSeconds: number
  normalTasksCount: number
  standardPredictionGenerationSeconds: number
  standardTasksCount: number
  passType: string | null
}

export function GenerationEditorProgress(props: Props) {
  const isPriorityAccount = () => {
    if (props.passType === "STANDARD" || props.passType === "PREMIUM") {
      return true
    }
    return false
  }

  /**
   * 生成完了までの進捗（パーセンテージ）
   */
  const generationProgress = () => {
    if (props.elapsedGenerationTime === 0) {
      return 0
    }
    const waitSeconds = isPriorityAccount()
      ? props.standardPredictionGenerationSeconds
      : props.normalPredictionGenerationSeconds
    // 0徐算防止
    if (!waitSeconds) return 0
    return (props.elapsedGenerationTime / waitSeconds) * 100
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
   * 残り秒数（s/m/h単位)
   */
  const secondsRemaining = () => {
    if (props.elapsedGenerationTime === 0) {
      return 0
    }
    const waitSeconds = isPriorityAccount()
      ? props.standardPredictionGenerationSeconds
      : props.normalPredictionGenerationSeconds
    if (!waitSeconds) return 0
    const remainingSeconds = waitSeconds - props.elapsedGenerationTime
    if (remainingSeconds < 0) {
      return "まもなく"
    }
    return toGenerationTime(remainingSeconds)
  }

  return (
    <div className="space-y-2">
      <Progress className="w-full" value={generationProgress()} />
      <div className="flex">
        <Badge className="mr-2" variant={"secondary"}>
          {"生成枚数 "} {props.remainingImageGenerationTasksCount}/
          {props.maxTasksCount}
        </Badge>
        {isPriorityAccount() ? (
          <Badge className="mr-2" variant={"secondary"}>
            {"優先状態 "}
            {generateStatus(prioritySpeed)}
          </Badge>
        ) : (
          <></>
        )}
        <Badge
          variant={"secondary"}
          className={`mr-2 ${isPriorityAccount() ? "opacity-50" : ""}`}
        >
          {isPriorityAccount() ? "一般状態" : "状態"} {generateStatus(speed)}
        </Badge>
        <Badge variant={"secondary"} className={"mr-2"}>
          {"予測"} {props.inProgress ? secondsRemaining() : "-"}
        </Badge>
      </div>
    </div>
  )
}
