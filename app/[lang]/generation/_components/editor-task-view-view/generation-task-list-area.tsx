"use client"

import { GenerationEditorTaskList } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-task-list"
import { GenerationTaskListGrid } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-task-list-grid"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useQuery } from "@apollo/client"
import { toast } from "sonner"

type Props = {
  sizeType?: string
  rating: number
  isEditMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: string
  deletedTaskIds: string[]
  pcViewType?: string
  viewCount?: number
  selectTaskIds(selectedTaskIds: string[]): void
  onCancel?(): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationTaskListArea = (props: Props) => {
  const context = useGenerationContext()

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

  const pcViewType = props.pcViewType ? props.pcViewType : ""

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

  return (
    <ScrollArea className="pb-64 md:pb-0">
      <GenerationTaskListGrid thumbnailSize={props.thumbnailSize}>
        <GenerationEditorTaskList
          tasks={props.rating === -1 ? activeTasks : activeRatingTasks}
          isEditMode={props.isEditMode}
          selectedTaskIds={props.selectedTaskIds}
          pcViewType={pcViewType}
          sizeType={props.thumbnailSize ?? "small"}
          onRestore={onRestore}
          onSelectTask={onSelectTask}
          onCancel={props.onCancel}
        />
      </GenerationTaskListGrid>
    </ScrollArea>
  )
}
