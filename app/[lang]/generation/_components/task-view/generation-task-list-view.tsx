"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationTaskList } from "@/app/[lang]/generation/_components/task-view/generation-task-list"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/task-view/generation-task-list-actions"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { useGenerationQuery } from "@/app/[lang]/generation/_hooks/use-generation-query"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/app/[lang]/generation/_types/task-list-thumbnail-type"
import { useFocusTimeout } from "@/app/_hooks/use-focus-timeout"
import { config } from "@/config"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useQuery } from "@apollo/client"
import { useEffect, useState } from "react"

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationTaskListView = () => {
  const context = useGenerationContext()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const [rating, setRating] = useState(-1)

  const [protect, setProtect] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [showTaskPositionType, changeShowTaskPositionType] =
    useState<TaskContentPositionType>("right")

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const page = context.config.page

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
          protect !== 1 && (rating === 0 || rating === -1)
            ? 32
            : config.query.maxLimit,
        offset: page * 32,
        where: {
          ...(rating !== -1 && {
            rating: rating,
          }),
          ...(protect !== -1 && {
            isProtected: protect === 1 ? true : false,
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
        ...(rating !== -1 && {
          rating: rating,
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
    setRating(rating)

    // ページングもリセットする
    setPage(0)
  }

  /**
   * 保護を変更する
   * @param rating レーティング
   */
  const onChangeProtect = (protect: number) => {
    setProtect(protect)

    // ページングもリセットする
    setPage(0)
  }

  /**
   * 編集モードを切り替える
   */
  const onToggleEditMode = () => {
    if (isEditMode) {
      setSelectedTaskIds([])
    }
    toggleEditMode((value) => !value)
  }

  /**
   * プレビューモードを切り替える
   */
  const onTogglePreviewMode = () => {
    togglePreviewMode((value) => !value)
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
    if (!isEditMode) {
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
    <GenerationViewCard
    // title={"生成履歴"}
    // tooltip={
    //   "履歴は3日間、スタンダードの場合は2週間まで保存されます。🔏をすることで永久保存できます。プランによって保存できる上限が変わります。"
    // }
    // tooltipDetailLink={"/plus"}
    >
      <GenerationTaskListActions
        showHistoryExpandButton={true}
        rating={rating}
        thumbnailSize={thumbnailSize()}
        thumbnailType={
          context.config.taskListThumbnailType as TaskListThumbnailType
        }
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        isEditMode={isEditMode}
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
        rating={rating}
        protect={protect}
        isEditMode={isEditMode}
        isPreviewMode={isPreviewMode}
        selectedTaskIds={selectedTaskIds}
        tasks={tasks}
        protectedTasks={protectedTasks}
        taskContentPositionType={showTaskPositionType}
        onCancel={undefined}
        setCurrentPage={setPage}
        setSelectedTaskIds={setSelectedTaskIds}
        thumbnailSize={thumbnailSize()}
      />
      {/* </Suspense> */}
    </GenerationViewCard>
  )
}
