import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/routes/($lang).generation._index/_types/task-content-position-type"
import { GenerationTaskEditableCard } from "@/routes/($lang).generation._index/_components/generation-task-editable-card"
import type { FragmentOf } from "gql.tada"
import type { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"

type Props = {
  task: FragmentOf<typeof imageGenerationTaskFieldsFragment>
  taskIds?: string[]
  sizeType: number
  taskContentPositionType?: TaskContentPositionType
  isPreviewByHover: boolean
  userToken: string
  onRestore?(taskId: string): void
  onCancel?(): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成の履歴
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
        userToken={props.userToken}
        optionButtonSize={props.sizeType}
        task={props.task}
        isSelectDisabled={true}
        isProtected={props.task.isProtected ?? false}
        rating={props.task.rating ?? 0}
        onClick={() => {
          onClickTask()
        }}
        onCancel={props.onCancel}
        onDelete={props.onDelete}
      />
    </>
  )
}
