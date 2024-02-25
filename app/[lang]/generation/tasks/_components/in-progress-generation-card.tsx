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
          <div className="flex relative">
            <div className="p-4 flex flex-col gap-y-2 m-auto">
              <Loader2Icon className="h-6 w-6 animate-spin m-auto" />
              <span className="text-sm ta-c m-auto mb-4">
                {"generating..."}
              </span>
              <span className="text-sm ta-c m-auto">{`予想時間: ${waitSecondsLabel()}`}</span>
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
