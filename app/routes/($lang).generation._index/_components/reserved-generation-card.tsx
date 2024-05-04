import { cn } from "@/_lib/utils"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { GenerationTaskCancelButton } from "@/routes/($lang).generation._index/_components/generation-cancel-button"
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
    <div className="relative h-full w-full">
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
        <div className="h-full">
          <div className="relative flex">
            <div className="m-auto flex flex-col gap-y-2 p-4">
              <Loader2Icon className="mr-auto h-6 w-6 animate-spin" />
              <span className="ta-c mb-4 text-sm">{"reserved..."}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}
