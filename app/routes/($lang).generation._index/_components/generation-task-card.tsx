import type { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { GenerationTaskEditableCard } from "@/routes/($lang).generation._index/_components/generation-task-editable-card"
import { GenerationTaskResponsiveCard } from "@/routes/($lang).generation._index/_components/generation-task-responsive-card"
import type { TaskContentPositionType } from "@/routes/($lang).generation._index/_types/task-content-position-type"
import type { ResultOf } from "gql.tada"

type Props = {
  task: ResultOf<typeof imageGenerationTaskFieldsFragment>
  taskIds?: string[]
  isEditMode: boolean
  isSelected?: boolean
  estimatedSeconds?: number
  selectedTaskIds: string[]
  rating: number
  sizeType: number
  taskContentPositionType?: TaskContentPositionType
  isDialog: boolean
  isPreviewByHover: boolean
  userToken: string
  onClick?(): void
  onCancel?(): void
  onRestore?(taskId: string): void
  onSelectTask(taskNanoid: string, status: string): void
  onDelete?(taskId: string): void
}

/**
 * 画像生成タスク
 */
export const GenerationTaskCard = (props: Props) => {
  return (
    <>
      {props.isEditMode && (
        <GenerationTaskEditableCard
          onClick={() =>
            props.onSelectTask(props.task.nanoid ?? "", props.task.status)
          }
          isPreviewByHover={props.isPreviewByHover}
          taskId={props.task.id}
          isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
          isSelectDisabled={false}
          taskNanoid={props.task.nanoid}
          task={props.task}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          userToken={props.userToken}
          optionButtonSize={props.sizeType}
          rating={props.task.rating ?? 0}
          isProtected={props.task.isProtected ?? false}
          onDelete={props.onDelete}
        />
      )}
      {!props.isEditMode && (
        <GenerationTaskResponsiveCard
          task={props.task}
          taskIds={props.taskIds}
          taskContentPositionType={props.taskContentPositionType}
          isPreviewByHover={props.isPreviewByHover}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          selectedTaskIds={props.selectedTaskIds}
          sizeType={props.sizeType}
          isDialog={props.isDialog}
          userToken={props.userToken}
          onClick={props.onClick}
          onCancel={props.onCancel}
          onRestore={props.onRestore}
          onSelectTask={props.onSelectTask}
          onDelete={props.onDelete}
        />
      )}
    </>
  )
}
