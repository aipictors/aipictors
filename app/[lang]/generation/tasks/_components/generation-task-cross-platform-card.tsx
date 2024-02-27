import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskDialogButton } from "@/app/[lang]/generation/tasks/_components/generation-task-dialog-button"
import { GenerationTaskHoverableCard } from "@/app/[lang]/generation/tasks/_components/generation-task-hoverable-card"
import { GenerationTaskLinkCard } from "@/app/[lang]/generation/tasks/_components/generation-task-link-card"
import { GenerationTaskSheetButton } from "@/app/[lang]/generation/tasks/_components/generation-task-sheet-button"
import { config } from "@/config"
import { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  estimatedSeconds?: number
  selectedTaskIds: string[]
  sizeType: ThumbnailImageSizeType
  isEditMode?: boolean
  showTypeForDesktop: "sheet" | "dialog"
  onClick?(): void
  onCancel?(): void
  onRestore?(taskId: string): void
  onSelectTask(taskNanoid: string, status: string): void
}

/**
 * マルチプラットフォーム対応画像生成の履歴
 * @returns
 */
export const GenerationTaskCrossPlatformCard = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {props.isEditMode && (
        <GenerationTaskHoverableCard
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
      {!props.isEditMode && !isDesktop && (
        <GenerationTaskLinkCard
          taskId={props.task.id}
          taskNanoid={props.task.nanoid}
          token={props.task.token}
          isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          isSelectDisabled={true}
        />
      )}
      {props.showTypeForDesktop === "dialog" &&
        !props.isEditMode &&
        isDesktop && (
          <GenerationTaskDialogButton
            task={props.task}
            sizeType={props.sizeType}
            onRestore={props.onRestore}
          />
        )}
      {props.showTypeForDesktop === "sheet" &&
        !props.isEditMode &&
        isDesktop && (
          <GenerationTaskSheetButton
            task={props.task}
            sizeType={props.sizeType}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
          />
        )}
    </>
  )
}
