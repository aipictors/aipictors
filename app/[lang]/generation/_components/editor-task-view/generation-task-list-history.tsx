"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { ResponsivePagination } from "@/app/_components/responsive-pagination"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { cn } from "@/lib/utils"
import { useQuery } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense, useState } from "react"
import { toast } from "sonner"

type Props = {
  isCreatingTasks: boolean
  rating: number
  isEditMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: ThumbnailImageSizeType
  hidedTaskIds: string[]
  viewCount?: number
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationTaskListHistory = (props: Props) => {
  const context = useGenerationContext()

  const [currentPage, setCurrentPage] = useState(1)

  const isTimeout = useFocusTimeout()

  const { data: tasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: props.viewCount ?? 64,
      offset: (currentPage - 1) * (props.viewCount ?? 0),
      where: { minRating: 0 },
    },
    pollInterval: isTimeout ? undefined : 2000,
  })

  const { data: ratingTasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: config.query.maxLimit,
      offset: (currentPage - 1) * (props.viewCount ?? 0),
      where: { minRating: 1 },
    },
  })

  if (tasks === undefined || ratingTasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks.viewer?.imageGenerationTasks ?? []
  const imageGenerationRatingTasks =
    ratingTasks.viewer?.imageGenerationTasks ?? []

  /**
   * 非表示指定のタスクを除外
   */
  const currentTasks = imageGenerationTasks.filter((task) => {
    return task.nanoid && !props.hidedTaskIds.includes(task.nanoid)
  })

  /**
   * フィルターしたレーティング済みタスク
   */
  const currentRatingTasks = imageGenerationRatingTasks.filter((task) => {
    return (
      task.rating === props.rating &&
      task.nanoid &&
      !props.hidedTaskIds.includes(task.nanoid)
    )
  })

  const onRestore = (taskId: string) => {
    const task = tasks.viewer?.imageGenerationTasks.find(
      (task) => task.nanoid === taskId,
    )
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
    return task.status === "IN_PROGRESS" || task.status === "DONE"
  })

  const activeRatingTasks = currentRatingTasks.filter((task) => {
    if (!task || task.isDeleted || (!task.token && task.status === "DONE"))
      return false
    return task.status === "IN_PROGRESS" || task.status === "DONE"
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
      props.setSelectedTaskIds(
        props.selectedTaskIds.filter((id) => {
          return id !== taskId
        }),
      )
      return
    }

    props.setSelectedTaskIds([...props.selectedTaskIds, taskId])
  }

  const componentTasks = props.rating === -1 ? activeTasks : activeRatingTasks

  // 左右の作品へ遷移するときに使用するnanoidのリスト
  const taskNanoidList = componentTasks.map((task) => task.nanoid ?? "")

  context.updateViewTaskIds(taskNanoidList)

  const sizeType = props.thumbnailSize ?? "small"

  return (
    <>
      <ScrollArea>
        <div
          className={cn("grid gap-2 p-2 pt-0 sm:pl-4", {
            "grid-cols-0":
              props.thumbnailSize === (0 as ThumbnailImageSizeType),
            "grid-cols-1":
              props.thumbnailSize === (1 as ThumbnailImageSizeType),
            "grid-cols-2":
              props.thumbnailSize === (2 as ThumbnailImageSizeType),
            "grid-cols-3":
              props.thumbnailSize === (3 as ThumbnailImageSizeType),
            "grid-cols-4":
              props.thumbnailSize === (4 as ThumbnailImageSizeType),
            "grid-cols-5":
              props.thumbnailSize === (5 as ThumbnailImageSizeType),
            "grid-cols-6":
              props.thumbnailSize === (6 as ThumbnailImageSizeType),
            "grid-cols-7":
              props.thumbnailSize === (7 as ThumbnailImageSizeType),
            "grid-cols-8":
              props.thumbnailSize === (8 as ThumbnailImageSizeType),
            "grid-cols-9":
              props.thumbnailSize === (9 as ThumbnailImageSizeType),
            "grid-cols-10":
              props.thumbnailSize === (10 as ThumbnailImageSizeType),
          })}
        >
          {componentTasks.map((task) => (
            <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
              <Suspense fallback={<FallbackTaskCard />}>
                <GenerationTaskCard
                  task={task}
                  isEditMode={props.isEditMode}
                  isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
                  estimatedSeconds={task.estimatedSeconds ?? 0}
                  isPreviewByHover={false}
                  rating={task.rating ?? 0}
                  selectedTaskIds={props.selectedTaskIds}
                  sizeType={sizeType}
                  isDialog={true}
                  onClick={() => onSelectTask(task.nanoid, task.status)}
                  onCancel={() => onSelectTask(task.nanoid, task.status)}
                  onRestore={onRestore}
                  onSelectTask={onSelectTask}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
      </ScrollArea>
      {props.viewCount &&
        tasks.viewer &&
        tasks.viewer.remainingImageGenerationTasksTotalCount && (
          <ResponsivePagination
            perPage={props.viewCount}
            maxCount={tasks.viewer.remainingImageGenerationTasksTotalCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
    </>
  )
}
