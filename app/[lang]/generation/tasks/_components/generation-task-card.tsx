import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import { GenerationTaskResponsiveCard } from "@/app/[lang]/generation/tasks/_components/generation-task-responsive-card"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  isEditMode: boolean
  isSelected?: boolean
  estimatedSeconds?: number
  selectedTaskIds: string[]
  rating: number
  sizeType: ThumbnailImageSizeType
  taskContentPositionType?: TaskContentPositionType
  isDialog: boolean
  isPreviewByHover: boolean
  onClick?(): void
  onCancel?(): void
  onRestore?(taskId: string): void
  onSelectTask(taskNanoid: string, status: string): void
}

/**
 * 画像生成タスク
 * @returns
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
          token={props.task.token}
          optionButtonSize={props.sizeType}
          rating={props.task.rating ?? 0}
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
          onClick={props.onClick}
          onCancel={props.onCancel}
          onRestore={props.onRestore}
          onSelectTask={props.onSelectTask}
        />
      )}
    </>
  )
}
