"use client"

import { GenerationEditorTaskList } from "@/app/[lang]/generation/_components/editor-task-list-view-view/generation-editor-result-list"
import { InProgressGenerationCard } from "@/app/[lang]/generation/tasks/_components/in-progress-generation-card"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { ScrollArea } from "@/components/ui/scroll-area"
import { config } from "@/config"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useQuery } from "@apollo/client"
import { toast } from "sonner"

type Props = {
  sizeType?: string
  isCreatingTasks: boolean
  rating: number
  isEditMode: boolean
  selectedTaskIds: string[]
  thumbnailSize: string
  hidedTaskIds: string[]
  pcViewType?: string
  viewCount?: number
  passType: string | null
  onUpdateSettings(
    modelId: string,
    modelType: string,
    sampler: string,
    scale: number,
    vae: string,
    promptText: string,
    negativePromptText: string,
    seed: number,
    sizeType: string,
  ): void
  setSelectedTaskIds: (selectedTaskIds: string[]) => void
  onCancel?(): void
}

/**
 * 画像生成履歴の一覧
 * @param props
 * @returns
 */
export const GenerationEditorTaskListArea = (props: Props) => {
  const isTimeout = useFocusTimeout()

  const { data: tasks } = useQuery(viewerImageGenerationTasksQuery, {
    variables: {
      limit: 64,
      offset: 0,
      where: {},
    },
    pollInterval: isTimeout ? 16000 : 2000,
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
    return task.nanoid && !props.hidedTaskIds.includes(task.nanoid)
  })

  /**
   * フィルターしたレーティング済みタスク
   */
  const currentRatingTasks = imageGenerationTasks.filter((task) => {
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
    props.onUpdateSettings(
      task.model.id,
      task.model.type,
      task.sampler,
      task.scale,
      task.vae ?? "",
      task.prompt,
      task.negativePrompt,
      task.seed,
      task.sizeType,
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
      props.setSelectedTaskIds(
        props.selectedTaskIds.filter((id) => {
          return id !== taskId
        }),
      )
      return
    }

    props.setSelectedTaskIds([...props.selectedTaskIds, taskId])
  }

  const getGridClasses = (size: string): string => {
    if (props.sizeType === "full") {
      switch (size) {
        case "small":
          return "p-2 grid grid-cols-3 gap-2 p-4 sm:pl-4 md:grid-cols-7 2xl:grid-cols-12 lg:grid-cols-10 xl:grid-cols-11"
        case "middle":
          return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-6 2xl:grid-cols-10 lg:grid-cols-8 xl:grid-cols-9"
        case "big":
          return "p-2 grid grid-cols-1 gap-2 p-4 sm:pl-4 md:grid-cols-4 2xl:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5"
        default:
          return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-8 lg:grid-cols-5 xl:grid-cols-6"
      }
    }
    switch (size) {
      case "small":
        return "p-2 grid grid-cols-3 gap-2 p-4 sm:pl-4 md:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-4 xl:grid-cols-3"
      case "middle":
        return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
      case "big":
        return "p-2 grid grid-cols-1 gap-2 p-4 sm:pl-4 md:grid-cols-1 2xl:grid-cols-2 lg:grid-cols-1 xl:grid-cols-1"
      default:
        return "p-2 grid grid-cols-2 gap-2 p-4 sm:pl-4 md:grid-cols-2 2xl:grid-cols-4 lg:grid-cols-3 xl:grid-cols-2"
    }
  }

  return (
    <ScrollArea>
      <div className={getGridClasses(props.thumbnailSize)}>
        {props.isCreatingTasks && (
          <InProgressGenerationCard isCreatingTasks={true} />
        )}
        <GenerationEditorTaskList
          tasks={props.rating === -1 ? activeTasks : activeRatingTasks}
          isEditMode={props.isEditMode}
          selectedTaskIds={props.selectedTaskIds}
          pcViewType={pcViewType}
          onRestore={onRestore}
          onSelectTask={onSelectTask}
          onCancel={props.onCancel}
        />
      </div>
    </ScrollArea>
  )
}
