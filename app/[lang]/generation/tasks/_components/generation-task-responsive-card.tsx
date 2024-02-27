import { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { GenerationTaskDialogButton } from "@/app/[lang]/generation/tasks/_components/generation-task-dialog-button"
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
  isDialog: boolean
  onClick?(): void
  onCancel?(): void
  onRestore?(taskId: string): void
  onSelectTask(taskNanoid: string, status: string): void
}

/**
 * レスポンシブ対応の画像生成の履歴
 * @returns
 */
export const GenerationTaskResponsiveCard = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {!isDesktop && (
        <GenerationTaskLinkCard
          taskId={props.task.id}
          taskNanoid={props.task.nanoid}
          token={props.task.token}
          isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
          estimatedSeconds={props.task.estimatedSeconds ?? 0}
          isSelectDisabled={true}
        />
      )}
      {props.isDialog && isDesktop && (
        <GenerationTaskDialogButton
          task={props.task}
          sizeType={props.sizeType}
          onRestore={props.onRestore}
        />
      )}
      {!props.isDialog && isDesktop && (
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
