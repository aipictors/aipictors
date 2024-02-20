"use client"

import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { GenerationTaskViewButton } from "@/app/[lang]/generation/tasks/_components/generation-task-view-button"
import { config } from "@/config"
import { ImageGenerationTaskNode } from "@/graphql/__generated__/graphql"
import { ErrorBoundary } from "@sentry/nextjs"
import Link from "next/link"
import { Suspense } from "react"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  tasks: ImageGenerationTaskNode[]
  isEditMode: boolean
  selectedTaskIds: string[]
  pcViewType: string
  onRestore?: (taskId: string) => void
  onSelectTask(taskNanoid: string | null, status: string): void
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
            taskNanoid={task.nanoid}
            remainingSeconds={task.estimatedSeconds ?? 0}
            taskId={task.id}
            token={task.token}
            rating={task.rating ?? 0}
          />
        )}
        {!props.isEditMode && !isDesktop && (
          <Link href={`/generation/tasks/${task.nanoid}`}>
            <GenerationTaskCard
              taskNanoid={task.nanoid}
              remainingSeconds={task.estimatedSeconds ?? 0}
              taskId={task.id}
              token={task.token}
              rating={task.rating ?? 0}
            />
          </Link>
        )}
        {!props.isEditMode && isDesktop && (
          <GenerationTaskViewButton
            task={task}
            pcViewType={props.pcViewType}
            onRestore={props.onRestore}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  ))
}
