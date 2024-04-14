import { GenerationViewCard } from "@/[lang]/generation/_components/generation-view-card"
import { GenerationTaskList } from "@/[lang]/generation/_components/task-view/generation-task-list"
import { GenerationTaskListActions } from "@/[lang]/generation/_components/task-view/generation-task-list-actions"
import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { useGenerationQuery } from "@/[lang]/generation/_hooks/use-generation-query"
import type { TaskContentPositionType } from "@/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/[lang]/generation/_types/task-list-thumbnail-type"
import { viewerImageGenerationTasksQuery } from "@/_graphql/queries/viewer/viewer-image-generation-tasks"
import { useFocusTimeout } from "@/_hooks/use-focus-timeout"
import { config } from "@/config"
import { useQuery } from "@apollo/client/index.js"
import { useEffect, useState } from "react"

type Props = {
  rating: number
  protect: number
  isEditMode: boolean
  isPreviewMode: boolean
  setRating: (rating: number) => void
  setProtect: (protect: number) => void
  toggleEditMode: (value: boolean) => void
  togglePreviewMode: (value: boolean) => void
}

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationTaskListView = (props: Props) => {
  const context = useGenerationContext()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const [showTaskPositionType, changeShowTaskPositionType] =
    useState<TaskContentPositionType>("right")

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const page = context.config.page ?? 0

  const setPage = (page: number) => {
    context.changePage(page)
  }

  const queryData = useGenerationQuery()

  const isTimeout = useFocusTimeout()

  const { data: tasks, startPolling } = useQuery(
    viewerImageGenerationTasksQuery,
    {
      variables: {
        limit:
          props.protect !== 1 && (props.rating === 0 || props.rating === -1)
            ? 32
            : config.query.maxLimit,
        offset: page * 32,
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
    },
  )

  const { data: protectedTasks } = useQuery(viewerImageGenerationTasksQuery, {
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

  const hasActiveTasks =
    queryData.viewer.inProgressImageGenerationTasksCount > 0 ||
    queryData.viewer.inProgressImageGenerationReservedTasksCount > 0

  useEffect(() => {
    if (hasActiveTasks) {
      startPolling(isTimeout ? 3000 : 2000)
      return
    }
    startPolling(600000)
  }, [hasActiveTasks, isTimeout])

  /**
   * レーティングを変更する
   * @param rating レーティング
   */
  const onChangeRating = (rating: number) => {
    props.setRating(rating)

    // ページングもリセットする
    setPage(0)
  }

  /**
   * 保護を変更する
   * @param rating レーティング
   */
  const onChangeProtect = (protect: number) => {
    props.setProtect(protect)

    // ページングもリセットする
    setPage(0)
  }

  /**
   * 編集モードを切り替える
   */
  const onToggleEditMode = () => {
    if (props.isEditMode) {
      setSelectedTaskIds([])
    }
    props.toggleEditMode(!props.isEditMode)
  }

  /**
   * プレビューモードを切り替える
   */
  const onTogglePreviewMode = () => {
    props.togglePreviewMode(!props.isPreviewMode)
  }

  /**
   * サムネイルサイズ
   */
  const thumbnailSize = () => {
    if (state === "HISTORY_LIST_FULL") {
      return context.config.thumbnailSizeInHistoryListFull
    }
    return context.config.thumbnailSizeInPromptView
  }

  /**
   * サムネイルサイズを変更する
   * @param value
   * @returns
   */
  const updateThumbnailSize = (value: number) => {
    if (state === "HISTORY_LIST_FULL") {
      return context.updateThumbnailSizeInHistoryListFull(value)
    }
    return context.updateThumbnailSizeInPromptView(value)
  }

  /**
   * 全てのタスクを選択する
   */
  const onSelectAllTasks = () => {
    setSelectedTaskIds(
      tasks?.viewer?.imageGenerationTasks.map((task) => task.nanoid) ?? [],
    )
    if (!props.isEditMode) {
      onToggleEditMode()
    }
  }

  /**
   * 全てのタスクをキャンセルする
   */
  const onCancelAllTasks = () => {
    setSelectedTaskIds([])
  }

  const changeThumbnailType = (value: TaskListThumbnailType) => {
    context.changeTaskListThumbnailType(value)
  }

  return (
    <GenerationViewCard>
      <GenerationTaskListActions
        showHistoryExpandButton={true}
        rating={props.rating}
        protect={props.protect}
        thumbnailSize={thumbnailSize()}
        thumbnailType={
          context.config.taskListThumbnailType as TaskListThumbnailType
        }
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        previewMode={props.isPreviewMode}
        isEditMode={props.isEditMode}
        taskContentPositionType={showTaskPositionType}
        onChangeThumbnailType={changeThumbnailType}
        onChangeRating={onChangeRating}
        onChangeProtect={onChangeProtect}
        setThumbnailSize={updateThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        onToggleEditMode={onToggleEditMode}
        onTogglePreviewMode={onTogglePreviewMode}
        onChangeViewCount={() => {}}
        onChangeTaskContentPositionType={changeShowTaskPositionType}
        onSelectAll={onSelectAllTasks}
        onCancelAll={onCancelAllTasks}
      />
      {/* <Suspense fallback={<AppLoadingPage />}> */}
      <GenerationTaskList
        currentPage={page}
        hidedTaskIds={hidedTaskIds}
        rating={props.rating}
        protect={props.protect}
        isEditMode={props.isEditMode}
        isPreviewMode={props.isPreviewMode}
        selectedTaskIds={selectedTaskIds}
        tasks={tasks}
        protectedTasks={protectedTasks}
        taskContentPositionType={showTaskPositionType}
        onCancel={undefined}
        setCurrentPage={setPage}
        setHidedTaskIds={setHidedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        thumbnailSize={thumbnailSize()}
      />
      {/* </Suspense> */}
    </GenerationViewCard>
  )
}
