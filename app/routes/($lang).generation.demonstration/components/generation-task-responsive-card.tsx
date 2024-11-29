import type { TaskContentPositionType } from "~/routes/($lang).generation.demonstration/types/task-content-position-type"
import { ErrorResultCard } from "~/routes/($lang).generation.demonstration/components/error-result-card"
import {
  GenerationResultButtonFragment,
  GenerationResultButtonTaskFragment,
  GenerationTaskButton,
} from "~/routes/($lang).generation.demonstration/components/generation-task-button"
import {
  GenerationResultDialogButtonFragment,
  GenerationResultDialogButtonTaskFragment,
  GenerationTaskDialogButton,
} from "~/routes/($lang).generation.demonstration/components/generation-task-dialog-button"
import { ReservedGenerationLinkCard } from "~/routes/($lang).generation.demonstration/components/reserved-generation-link-card"
import { ErrorBoundary } from "react-error-boundary"
import { graphql, type FragmentOf } from "gql.tada"

type Props = {
  task:
    | FragmentOf<typeof ReadOnlyGenerationResultCardFragment>
    | FragmentOf<typeof ReadOnlyGenerationResultCardTaskFragment>
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

export const ReadOnlyGenerationResultCardFragment = graphql(
  `fragment ReadOnlyGenerationResultCard on ImageGenerationResultNode @_unmask {
    ...GenerationResultDialogButton
    ...GenerationResultButton
  }`,
  [GenerationResultDialogButtonFragment, GenerationResultButtonFragment],
)

export const ReadOnlyGenerationResultCardTaskFragment = graphql(
  `fragment ReadOnlyGenerationResultCardTask on ImageGenerationTaskNode @_unmask {
    ...GenerationResultDialogButtonTask
    ...GenerationResultButtonTask
  }`,
  [
    GenerationResultDialogButtonTaskFragment,
    GenerationResultButtonTaskFragment,
  ],
)
