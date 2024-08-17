import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import { ErrorResultCard } from "~/routes/($lang).generation._index/components/error-result-card"
import { GenerationTaskButton } from "~/routes/($lang).generation._index/components/generation-task-button"
import { GenerationTaskDialogButton } from "~/routes/($lang).generation._index/components/generation-task-dialog-button"
import { ReservedGenerationLinkCard } from "~/routes/($lang).generation._index/components/reserved-generation-link-card"
import { ErrorBoundary } from "react-error-boundary"
import type { imageGenerationTaskFieldsFragment } from "~/graphql/fragments/image-generation-task-field"
import type { imageGenerationResultFieldsFragment } from "~/graphql/fragments/image-generation-result-field"
import type { FragmentOf } from "gql.tada"

type Props = {
  task:
    | FragmentOf<typeof imageGenerationTaskFieldsFragment>
    | FragmentOf<typeof imageGenerationResultFieldsFragment>
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
export function GenerationTaskResponsiveCard(props: Props) {
  return (
    <>
      <ErrorBoundary key={props.task.id} fallback={<ErrorResultCard />}>
        {props.task.status === "RESERVED" && (
          <div className="block md:hidden">
            <ReservedGenerationLinkCard taskNanoid={props.task.nanoid ?? ""} />
          </div>
        )}
        {props.task.status !== "RESERVED" && (
          <div className="block md:hidden">
            <GenerationTaskDialogButton
              task={props.task}
              taskIds={props.taskIds}
              sizeType={props.sizeType}
              userToken={props.userToken}
              onRestore={props.onRestore}
              onCancel={props.onCancel}
              onDelete={props.onDelete}
            />
          </div>
        )}
        {props.isDialog && (
          <div className="hidden md:block">
            <GenerationTaskDialogButton
              task={props.task}
              taskIds={props.taskIds}
              sizeType={props.sizeType}
              userToken={props.userToken}
              onRestore={props.onRestore}
              onCancel={props.onCancel}
              onDelete={props.onDelete}
            />
          </div>
        )}
        {!props.isDialog && (
          <div className="hidden md:block">
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
          </div>
        )}
      </ErrorBoundary>
    </>
  )
}
