import { GenerationTaskCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-cancel-button"
import { InProgressGenerationProgressBar } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-progress-bar"
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
  if (props.estimatedSeconds !== 0) {
    console.log("props.estimatedSeconds", props.estimatedSeconds)
  }

  return (
    <Card>
      <div>
        <div className="flex">
          <div className="p-4 flex flex-col gap-y-2">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span className="text-sm">{"生成中"}</span>
          </div>
          <GenerationTaskCancelButton
            onCancel={props.onCancel}
            isDisabled={props.isCreatingTasks}
            isCanceling={props.isCanceling}
          />
        </div>
        <div className="mt-[100%]" />
        <InProgressGenerationProgressBar
          remainingSeconds={props.estimatedSeconds}
        />
      </div>
    </Card>
  )
}
