import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskCancelButton } from "@/app/[lang]/generation/tasks/_components/generation-cancel-button"
import { cn } from "@/lib/utils"
import { Loader2Icon } from "lucide-react"

type Props = {
  onCancel?(): void
  onClick?(): void
  isCanceling?: boolean
  isPreviewByHover?: boolean
  taskId: string
  setIsHovered: (isHovered: boolean) => void
}

/**
 * 生成予約の履歴
 * @returns
 */
export const ReservedGenerationCard = (props: Props) => {
  const context = useGenerationContext()
  const { send } = GenerationConfigContext.useActorRef()

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => {
        if (props.isPreviewByHover) {
          context.updatePreviewTaskId(props.taskId)
          send({ type: "OPEN_HISTORY_PREVIEW" })
        }
        props.setIsHovered(true)
      }}
      onMouseLeave={() => {
        context.updatePreviewTaskId(null)
        send({ type: "CLOSE" })
        props.setIsHovered(false)
      }}
    >
      <GenerationTaskCancelButton
        onCancel={props.onCancel}
        isCanceling={props.isCanceling}
      />

      <button
        type={"button"}
        onClick={props.onClick}
        className={cn(
          "relative",
          "h-full w-full overflow-hidden rounded bg-card p-0",
          "border-2 border-input",
        )}
      >
        <div>
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="m-auto h-6 w-6 animate-spin" />
              <span className="ta-c m-auto mb-4 text-sm">{"reserved..."}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
