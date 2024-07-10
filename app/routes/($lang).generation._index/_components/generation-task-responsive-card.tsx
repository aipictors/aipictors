import { config } from "@/config"
import type { TaskContentPositionType } from "@/routes/($lang).generation._index/_types/task-content-position-type"
import { ErrorResultCard } from "@/routes/($lang).generation._index/_components/error-result-card"
import { GenerationTaskButton } from "@/routes/($lang).generation._index/_components/generation-task-button"
import { GenerationTaskDialogButton } from "@/routes/($lang).generation._index/_components/generation-task-dialog-button"
import { ReservedGenerationLinkCard } from "@/routes/($lang).generation._index/_components/reserved-generation-link-card"
import { ErrorBoundary } from "react-error-boundary"
import { useMediaQuery } from "usehooks-ts"
import type { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import type { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import type { ResultOf } from "gql.tada"

type Props = {
  task:
    | ResultOf<typeof imageGenerationTaskFieldsFragment>
    | ResultOf<typeof imageGenerationResultFieldsFragment>
  taskIds?: string[]
  estimatedSeconds?: number
  selectedTaskIds: string[]
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
 * レスポンシブ対応の画像生成の履歴
 */
export const GenerationTaskResponsiveCard = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      <ErrorBoundary key={props.task.id} fallback={<ErrorResultCard />}>
        {!isDesktop && props.task.status === "RESERVED" && (
          <ReservedGenerationLinkCard taskNanoid={props.task.nanoid ?? ""} />
        )}
        {!isDesktop && props.task.status !== "RESERVED" && (
          <GenerationTaskDialogButton
            task={props.task}
            taskIds={props.taskIds}
            sizeType={props.sizeType}
            userToken={props.userToken}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
            onDelete={props.onDelete}
          />
        )}
        {props.isDialog && isDesktop && (
          <GenerationTaskDialogButton
            task={props.task}
            taskIds={props.taskIds}
            sizeType={props.sizeType}
            userToken={props.userToken}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
            onDelete={props.onDelete}
          />
        )}
        {!props.isDialog && isDesktop && (
          <GenerationTaskButton
            task={props.task}
            userToken={props.userToken}
            taskIds={props.taskIds}
            isPreviewByHover={props.isPreviewByHover}
            sizeType={props.sizeType}
            taskContentPositionType={props.taskContentPositionType}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
            onDelete={props.onDelete}
          />
        )}
      </ErrorBoundary>
    </>
  )
}
