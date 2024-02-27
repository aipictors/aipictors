import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskEditableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-editable-card"
import { GenerationTaskResponsiveCard } from "@/app/[lang]/generation/tasks/_components/generation-task-responsive-card"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  isEditMode: boolean
  isSelected?: boolean
  estimatedSeconds?: number
  selectedTaskIds: string[]
  rating: number
  sizeType: ThumbnailImageSizeType
  isDialog: boolean
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
          isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
          isSelectDisabled={false}
          taskNanoid={props.task.nanoid}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          taskId={props.task.id}
          token={props.task.token}
          optionButtonSize={props.sizeType}
          rating={props.task.rating ?? 0}
        />
      )}
      {!props.isEditMode && (
        <GenerationTaskResponsiveCard
          task={props.task}
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
