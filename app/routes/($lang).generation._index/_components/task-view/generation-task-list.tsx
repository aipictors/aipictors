import { ResponsivePagination } from "@/_components/responsive-pagination"
import { ScrollArea } from "@/_components/ui/scroll-area"
import type { viewerImageGenerationResultsQuery } from "@/_graphql/queries/viewer/viewer-image-generation-results"
import type { viewerImageGenerationTasksQuery } from "@/_graphql/queries/viewer/viewer-image-generation-tasks"

import { useFocusTimeout } from "@/_hooks/use-focus-timeout"
import { cn } from "@/_lib/cn"
import { ErrorResultCard } from "@/routes/($lang).generation._index/_components/error-result-card"
import { FallbackTaskCard } from "@/routes/($lang).generation._index/_components/fallback-task-card"
import { GenerationTaskCard } from "@/routes/($lang).generation._index/_components/generation-task-card"
import { GenerationConfigContext } from "@/routes/($lang).generation._index/_contexts/generation-config-context"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { useGenerationQuery } from "@/routes/($lang).generation._index/_hooks/use-generation-query"
import type { TaskContentPositionType } from "@/routes/($lang).generation._index/_types/task-content-position-type"
import type { ResultOf } from "gql.tada"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"

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
  results: ResultOf<typeof viewerImageGenerationResultsQuery>
  tasks: ResultOf<typeof viewerImageGenerationTasksQuery>
  userToken: string
  setCurrentPage: (currentPage: number) => void
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
  onCancel?(): void
  setHidedTaskIds: (hidedTaskIds: string[]) => void
}

/**
 * 画像生成履歴の一覧
 */
export const GenerationTaskList = (props: Props) => {
  const context = useGenerationContext()

  const queryData = useGenerationQuery()

  const isTimeout = useFocusTimeout()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const tasks = props.tasks

  if (tasks === undefined) {
    return null
  }

  const imageGenerationTasks = tasks.viewer?.imageGenerationTasks ?? []

  /**
   * 非表示指定のタスクを除外
   */
  const currentTasks = imageGenerationTasks.filter((task) => {
    return (
      task.status === "RESERVED" ||
      (task.nanoid && !props.hidedTaskIds.includes(task.nanoid))
    )
  })

  const currentResults = props.results.viewer?.imageGenerationResults ?? []

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

  const onDelete = (taskId: string) => {
    props.setHidedTaskIds([...props.hidedTaskIds, ...taskId.split(",")])
  }

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
      null,
      null,
      null,
      null,
    )
    toast("設定を復元しました")
  }

  const activeTasks = currentTasks.filter((task) => {
    if (task.isDeleted || (!task.imageUrl && task.status === "DONE"))
      return false
    return (
      task.status === "PENDING" ||
      task.status === "IN_PROGRESS" ||
      task.status === "DONE" ||
      task.status === "RESERVED"
    )
  })

  const activeResults = currentResults.filter((result) => {
    if (!result.imageUrl && result.status === "DONE") return false
    return (
      result.status === "PENDING" ||
      result.status === "IN_PROGRESS" ||
      result.status === "DONE" ||
      result.status === "RESERVED"
    )
  })

  const onSelectTask = (taskId: string | null, status?: string) => {
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

  const componentTasks = activeTasks

  const combinedTasks = [...componentTasks, ...activeResults]

  // 左右の作品へ遷移するときに使用するnanoidのリスト
  const taskIdList = combinedTasks
    .filter((task) => task.status === "DONE" && task.nanoid)
    .map((task) => task.id)

  return (
    <>
      <ScrollArea type="always">
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
          {combinedTasks.map((task) => (
            <ErrorBoundary key={task.id} fallback={<ErrorResultCard />}>
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
                  userToken={props.userToken}
                  onClick={() => onSelectTask(task.nanoid, task.status)}
                  onCancel={props.onCancel}
                  onRestore={onRestore}
                  onSelectTask={onSelectTask}
                  onDelete={onDelete}
                />
              </Suspense>
            </ErrorBoundary>
          ))}
        </div>
        {/* </Suspense> */}
      </ScrollArea>
      <div className="p-2 pb-32 md:pb-4">
        {props.protect !== 1 && (
          <ResponsivePagination
            perPage={props.rating === 0 || props.rating === -1 ? 56 : 800}
            maxCount={
              (props.protect === 0 || props.protect === -1) &&
              (props.rating === 0 || props.rating === -1)
                ? queryData.viewer.remainingImageGenerationTasksTotalCount
                : componentTasks.length
            }
            currentPage={props.currentPage}
            onPageChange={(page: number) => {
              props.setCurrentPage(page)
            }}
            isActiveButtonStyle={true}
          />
        )}
      </div>
    </>
  )
}
