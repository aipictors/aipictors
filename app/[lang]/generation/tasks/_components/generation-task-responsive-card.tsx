import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { GenerationTaskButton } from "@/app/[lang]/generation/tasks/_components/generation-task-button"
import { GenerationTaskDialogButton } from "@/app/[lang]/generation/tasks/_components/generation-task-dialog-button"
import { GenerationTaskLinkCard } from "@/app/[lang]/generation/tasks/_components/generation-task-link-card"
import { ReservedGenerationLinkCard } from "@/app/[lang]/generation/tasks/_components/reserved-generation-link-card"
import { config } from "@/config"
import type { ImageGenerationTaskFieldsFragment } from "@/graphql/__generated__/graphql"
import { ErrorBoundary } from "@sentry/nextjs"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  task: ImageGenerationTaskFieldsFragment
  taskIds?: string[]
  estimatedSeconds?: number
  selectedTaskIds: string[]
  sizeType: number
  taskContentPositionType?: TaskContentPositionType
  isDialog: boolean
  isPreviewByHover: boolean
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

  if (props.task.status === "RESERVED") {
    console.log("GenerationTaskResponsiveCard", props.task.status)
  }

  return (
    <>
      <ErrorBoundary key={props.task.id} fallback={ErrorResultCard}>
        {!isDesktop && props.task.status === "RESERVED" && (
          <ReservedGenerationLinkCard taskNanoid={props.task.nanoid ?? ""} />
        )}
        {!isDesktop && props.task.status !== "RESERVED" && (
          <GenerationTaskLinkCard
            taskId={props.task.id}
            taskNanoid={props.task.nanoid}
            token={props.task.token}
            thumbnailToken={props.task.thumbnailToken}
            isSelected={props.selectedTaskIds.includes(props.task.nanoid ?? "")}
            estimatedSeconds={props.task.estimatedSeconds ?? 0}
            isSelectDisabled={true}
          />
        )}
        {props.isDialog && isDesktop && (
          <GenerationTaskDialogButton
            task={props.task}
            taskIds={props.taskIds}
            sizeType={props.sizeType}
            onRestore={props.onRestore}
          />
        )}
        {!props.isDialog && isDesktop && (
          <GenerationTaskButton
            task={props.task}
            taskIds={props.taskIds}
            isPreviewByHover={props.isPreviewByHover}
            sizeType={props.sizeType}
            taskContentPositionType={props.taskContentPositionType}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
          />
        )}
      </ErrorBoundary>
    </>
  )
}
