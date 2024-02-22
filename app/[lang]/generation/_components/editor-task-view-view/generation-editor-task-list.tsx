"use client"

import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { GenerationTaskViewButton } from "@/app/[lang]/generation/tasks/_components/generation-task-view-button"
import { config } from "@/config"
import { ViewerImageGenerationTasksQuery } from "@/graphql/__generated__/graphql"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  tasks: NonNullable<
    ViewerImageGenerationTasksQuery["viewer"]
  >["imageGenerationTasks"]
  isEditMode: boolean
  selectedTaskIds: string[]
  pcViewType: string
  sizeType: string
  onRestore?: (taskId: string) => void
  onSelectTask(taskNanoid: string | null, status: string): void
  onCancel?(): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationEditorTaskList = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return props.tasks.map((task) => (
    <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
      <Suspense fallback={<FallbackTaskCard />}>
        {props.isEditMode && (
          <GenerationTaskCard
            onClick={() => props.onSelectTask(task.nanoid, task.status)}
            isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
            isSelectDisabled={false}
            taskNanoid={task.nanoid}
            remainingSeconds={task.estimatedSeconds ?? 0}
            taskId={task.id}
            token={task.token}
            optionButtonSize={props.sizeType}
            rating={task.rating ?? 0}
            onCancel={props.onCancel}
          />
        )}
        {!props.isEditMode && !isDesktop && (
          <GenerationTaskCard
            taskNanoid={task.nanoid}
            remainingSeconds={task.estimatedSeconds ?? 0}
            isSelectDisabled={true}
            taskId={task.id}
            token={task.token}
            optionButtonSize={props.sizeType}
            rating={task.rating ?? 0}
            onCancel={props.onCancel}
            isLink={true}
          />
        )}
        {!props.isEditMode && isDesktop && (
          <GenerationTaskViewButton
            task={task}
            pcViewType={props.pcViewType}
            sizeType={props.sizeType}
            onRestore={props.onRestore}
            onCancel={props.onCancel}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  ))
}
