import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  sizeType: number
  taskContentPositionType?: TaskContentPositionType
  isPreviewByHover: boolean
  onRestore?(taskId: string): void
  onCancel?(): void
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskButton(props: Props) {
  const { send } = GenerationConfigContext.useActorRef()

  const context = useGenerationContext()

  const onClickTask = () => {
    setTimeout(() => {
      if (props.taskIds?.length) {
        context.updateViewTask(props.task.id, props.taskIds)
      }
      setTimeout(() => {
        if (props.taskContentPositionType === "right") {
          send({ type: "OPEN_FULL_HISTORY_ON_ASIDE" })
        } else {
          send({ type: "OPEN_FULL_HISTORY_ON_MAIN_AND_HEADER" })
        }
      }, 100)
    }, 100)
  }

  return (
    <>
      <GenerationTaskEditableCard
        taskNanoid={props.task.nanoid}
        taskId={props.task.id}
        isPreviewByHover={props.isPreviewByHover}
        estimatedSeconds={props.task.estimatedSeconds ?? 0}
        token={props.task.token}
        thumbnailToken={props.task.thumbnailToken}
        optionButtonSize={props.sizeType}
        task={props.task}
        isSelectDisabled={true}
        rating={props.task.rating ?? 0}
        onClick={() => {
          onClickTask()
        }}
        onCancel={props.onCancel}
      />
    </>
  )
}
