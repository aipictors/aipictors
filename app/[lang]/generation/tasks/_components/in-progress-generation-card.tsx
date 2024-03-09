import { GenerationTaskCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-cancel-button"
import { Card } from "@/components/ui/card"
import { Loader2Icon } from "lucide-react"

type Props = {
  onCancel?(): void
  estimatedSeconds?: number
  isCreatingTasks?: boolean
  isCanceling?: boolean
}

/**
 * 読み込み中の履歴
 * @returns
 */
export const InProgressGenerationCard = (props: Props) => {
  const waitSecondsLabel = () => {
    if (props.estimatedSeconds === undefined) {
      return "計算中"
    }
    if (props.estimatedSeconds > 120) {
      return "数分"
    }
    if (props.estimatedSeconds > 60) {
      return "1分"
    }
    if (props.estimatedSeconds > 15) {
      return "十数秒"
    }
    if (props.estimatedSeconds > 0) {
      return "数秒"
    }
    return "数秒"
  }

  return (
    <>
      <Card>
        <div>
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="m-auto h-6 w-6 animate-spin" />
              <span className="ta-c m-auto mb-4 text-sm">
                {"generating..."}
              </span>
              <span className="ta-c m-auto text-sm">{`予想時間: ${waitSecondsLabel()}`}</span>
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
