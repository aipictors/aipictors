"use client"

import { GenerationTaskListGrid } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-task-list-grid"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { GenerationTaskViewButton } from "@/app/[lang]/generation/tasks/_components/generation-task-view-button"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useQuery } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense } from "react"
import { toast } from "sonner"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  sizeType?: string
  rating: number
  isEditMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: string
  deletedTaskIds: string[]
  viewCount?: number
  selectTaskIds(selectedTaskIds: string[]): void
  onCancel?(): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationTaskList = (props: Props) => {
  const context = useGenerationContext()

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const isTimeout = useFocusTimeout()

  const { data: tasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {},
    },
    pollInterval: isTimeout ? 8000 : 2000,
  })

  const { data: ratingTasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: config.query.maxLimit,
      offset: 0,
      where: { minRating: 1 },
    },
  })

  if (tasks === undefined || ratingTasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks.viewer?.imageGenerationTasks ?? []

  /**
   * 非表示指定のタスクを除外
   */
  const currentTasks = imageGenerationTasks.filter((task) => {
    return task.nanoid && !props.deletedTaskIds.includes(task.nanoid)
  })

  /**
   * フィルターしたレーティング済みタスク
   */
  const currentRatingTasks = imageGenerationTasks.filter((task) => {
    return (
      task.rating === props.rating &&
      task.nanoid &&
      !props.deletedTaskIds.includes(task.nanoid)
    )
  })

  const onRestore = (taskId: string) => {
    const task = tasks.viewer?.imageGenerationTasks.find((task) => {
      return task.nanoid === taskId
    })
    if (typeof task === "undefined") return
    context.updateSettings(
      task.model.id,
      task.steps,
      task.model.type,
      task.sampler,
      task.scale,
      task.vae ?? "",
      task.prompt,
      task.negativePrompt,
      task.seed,
      task.sizeType,
      task.clipSkip,
    )
    toast("設定を復元しました")
  }

  const activeTasks = currentTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
    return (
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS" ||
      task.status === "DONE"
    )
  })

  const activeRatingTasks = currentRatingTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
    // return task.status === "IN_PROGRESS" || task.status === "DONE"
    return task.status === "DONE"
  })

  const onSelectTask = (taskId: string | null, status: string) => {
    if (status !== "DONE") {
      toast("選択できない履歴です")
      return
    }
    if (!taskId) {
      toast("存在しない履歴です")
      return
    }
    const isAlreadySelected = props.selectedTaskIds.includes(taskId)
    if (isAlreadySelected) {
      props.selectTaskIds(
        props.selectedTaskIds.filter((id) => {
          return id !== taskId
        }),
      )
      return
    }
    props.selectTaskIds([...props.selectedTaskIds, taskId])
  }

  const componentTasks = props.rating === -1 ? activeTasks : activeRatingTasks

  return (
    <ScrollArea className="pb-64 md:pb-0">
      <GenerationTaskListGrid thumbnailSize={props.thumbnailSize}>
        {componentTasks.map((task) => (
          <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
            <Suspense fallback={<FallbackTaskCard />}>
              {props.isEditMode && (
                <GenerationTaskCard
                  onClick={() => onSelectTask(task.nanoid, task.status)}
                  isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
                  isSelectDisabled={false}
                  taskNanoid={task.nanoid}
                  estimatedSeconds={task.estimatedSeconds ?? 0}
                  taskId={task.id}
                  token={task.token}
                  optionButtonSize={props.thumbnailSize ?? "small"}
                  rating={task.rating ?? 0}
                  onCancel={props.onCancel}
                />
              )}
              {!props.isEditMode && !isDesktop && (
                <GenerationTaskCard
                  taskNanoid={task.nanoid}
                  estimatedSeconds={task.estimatedSeconds ?? 0}
                  isSelectDisabled={true}
                  taskId={task.id}
                  token={task.token}
                  optionButtonSize={props.thumbnailSize ?? "small"}
                  rating={task.rating ?? 0}
                  onCancel={props.onCancel}
                />
              )}
              {!props.isEditMode && isDesktop && (
                <GenerationTaskViewButton
                  task={task}
                  sizeType={props.thumbnailSize ?? "small"}
                  onRestore={onRestore}
                  onCancel={props.onCancel}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        ))}
      </GenerationTaskListGrid>
    </ScrollArea>
  )
}
