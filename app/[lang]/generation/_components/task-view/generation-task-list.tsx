"use client"

import { GenerationTaskListViewPlaceholder } from "@/app/[lang]/generation/_components/task-view/generation-task-list-view-placeholder"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useGenerationQuery } from "@/app/[lang]/generation/_hooks/use-generation-query"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { ErrorResultCard } from "@/app/[lang]/generation/tasks/_components/error-result-card"
import { FallbackTaskCard } from "@/app/[lang]/generation/tasks/_components/fallback-task-card"
import { GenerationTaskCard } from "@/app/[lang]/generation/tasks/_components/generation-task-card"
import { ResponsivePagination } from "@/app/_components/responsive-pagination"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { cn } from "@/lib/utils"
import { useMutation, useQuery } from "@apollo/client"
import { ErrorBoundary } from "@sentry/nextjs"
import { Suspense, startTransition, useEffect } from "react"
import { toast } from "sonner"
import { useInterval } from "usehooks-ts"

type Props = {
  rating: number
  protect: number
  isEditMode: boolean
  isPreviewMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: number
  taskContentPositionType: TaskContentPositionType
  hidedTaskIds: string[]
  viewCount?: number
  currentPage: number
  setCurrentPage: (currentPage: number) => void
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
  onCancel?(): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationTaskList = (props: Props) => {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const isTimeout = useFocusTimeout()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const {
    data: tasks,
    startPolling,
    stopPolling,
    loading: normalLoading,
  } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: props.protect !== 1 ? 32 : config.query.maxLimit,
      offset: props.currentPage * 32,
      where: {
        ...(props.rating !== -1 && {
          rating: props.rating,
        }),
        ...(props.protect !== -1 && {
          isProtected: props.protect === 1 ? true : false,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  const {
    data: protectedTasks,
    startPolling: protectStartPolling,
    loading: protectedLoading,
  } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: config.query.maxLimit,
      offset: 0,
      where: {
        isProtected: true,
        ...(props.rating !== -1 && {
          rating: props.rating,
        }),
      },
    },
    fetchPolicy: "cache-first",
  })

  useEffect(() => {
    if (context.config.isCreatingTask) {
      startPolling(isTimeout ? 3000 : 2000)
      return
    }
    startPolling(600000)
  }, [context.config.isCreatingTask, isTimeout])

  if (tasks === undefined || protectedTasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks.viewer?.imageGenerationTasks ?? []

  console.log("imageGenerationTasks", imageGenerationTasks)

  /**
   * 非表示指定のタスクを除外
   */
  const currentTasks = imageGenerationTasks.filter((task) => {
    return (
      task.status === "RESERVED" ||
      (task.nanoid && !props.hidedTaskIds.includes(task.nanoid))
    )
  })

  const imageGenerationProtectedTasks =
    protectedTasks.viewer?.imageGenerationTasks ?? []

  /**
   * フィルターしたレーティングが０のタスク（一部）
   */
  const currentRatingZeroTasks =
    props.rating === 0
      ? imageGenerationTasks.filter((task) => {
          return (
            task.rating === 0 &&
            task.nanoid &&
            !props.hidedTaskIds.includes(task.nanoid)
          )
        })
      : []

  /**
   * 保護済みタスク
   */
  const currentProtectedTasks = imageGenerationProtectedTasks.filter((task) => {
    return (
      task.isProtected === (props.protect === 1 ? true : false) &&
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

  const inProgressTasks = currentTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
    return task.status === "IN_PROGRESS" || task.status === "RESERVED"
  })

  const activeTasks = currentTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
    return (
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS" ||
      task.status === "DONE" ||
      task.status === "RESERVED"
    )
  })

  const activeRatingZeroTasks = currentRatingZeroTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
    return task.status === "DONE"
  })

  const activeProtectedTasks = currentProtectedTasks.filter((task) => {
    if (task.isDeleted || (!task.token && task.status === "DONE")) return false
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
      props.setSelectedTaskIds(
        props.selectedTaskIds.filter((id) => {
          return id !== taskId
        }),
      )
      return
    }

    props.setSelectedTaskIds([...props.selectedTaskIds, taskId])
  }

  const combineDisplayProtectedTasks = [
    ...inProgressTasks,
    ...activeProtectedTasks,
    ...activeRatingZeroTasks,
  ]

  const componentTasks =
    props.protect === -1 || props.protect === 0
      ? activeTasks
      : combineDisplayProtectedTasks

  // 左右の作品へ遷移するときに使用するnanoidのリスト
  const taskIdList = componentTasks.map((task) => task.id)

  if (normalLoading) {
    return <GenerationTaskListViewPlaceholder />
  }

  return (
    <>
      <ScrollArea>
        {/* <Suspense fallback={<AppLoadingPage />}> */}
        <div
          className={cn("grid gap-2 p-2 pt-0 pr-4 sm:pl-4", {
            "grid-cols-0": props.thumbnailSize === 10,
            "grid-cols-1": props.thumbnailSize === 9,
            "grid-cols-2": props.thumbnailSize === 8,
            "grid-cols-3": props.thumbnailSize === 7,
            "grid-cols-4": props.thumbnailSize === 6,
            "grid-cols-5": props.thumbnailSize === 5,
            "grid-cols-6": props.thumbnailSize === 4,
            "grid-cols-7": props.thumbnailSize === 3,
            "grid-cols-8": props.thumbnailSize === 2,
            "grid-cols-9": props.thumbnailSize === 1,
            "grid-cols-10": props.thumbnailSize === 10,
          })}
        >
          {componentTasks.map((task) => (
            <ErrorBoundary key={task.id} fallback={ErrorResultCard}>
              <Suspense fallback={<FallbackTaskCard />}>
                <GenerationTaskCard
                  task={task}
                  taskIds={taskIdList}
                  taskContentPositionType={props.taskContentPositionType}
                  isEditMode={props.isEditMode}
                  isPreviewByHover={props.isPreviewMode}
                  isSelected={props.selectedTaskIds.includes(task.nanoid ?? "")}
                  sizeType={props.thumbnailSize}
                  isDialog={state === "HISTORY_LIST_FULL"}
                  rating={props.rating}
                  selectedTaskIds={props.selectedTaskIds}
                  onClick={() => onSelectTask(task.nanoid, task.status)}
                  onCancel={props.onCancel}
                  onRestore={onRestore}
                  onSelectTask={onSelectTask}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
        {/* </Suspense> */}
      </ScrollArea>
      <div className="p-2 pb-64 md:pb-2">
        {props.protect !== 1 && (
          <ResponsivePagination
            perPage={32}
            maxCount={
              (props.protect === 0 || props.protect === -1) &&
              (props.rating === 0 || props.rating === -1)
                ? queryData.viewer.remainingImageGenerationTasksTotalCount
                : componentTasks.length
            }
            currentPage={props.currentPage}
            onPageChange={props.setCurrentPage}
          />
        )}
      </div>
    </>
  )
}
