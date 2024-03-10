import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  sizeType: ThumbnailImageSizeType
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
    if (props.taskIds?.length) {
      context.updateViewTaskIds(props.taskIds)
    }
    setTimeout(() => {
      context.updateViewTaskId(props.task.id)
      setTimeout(() => {
        if (props.taskContentPositionType === "right") {
          send({ type: "OPEN_FULL_HISTORY_ON_ASIDE" })
        } else {
          send({ type: "OPEN_FULL_HISTORY_ON_MAIN_AND_HEADER" })
        }
      }, 100)
    }, 500)
  }

  return (
    <>
      <GenerationTaskEditableCard
        taskNanoid={props.task.nanoid}
        taskId={props.task.id}
        isPreviewByHover={props.isPreviewByHover}
        estimatedSeconds={props.task.estimatedSeconds ?? 0}
        token={props.task.token}
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
