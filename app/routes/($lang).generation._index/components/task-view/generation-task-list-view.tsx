import { config } from "~/config"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import {
  GenerationTaskList,
  GenerationTaskListItemFragment,
  GenerationTaskListItemTaskFragment,
} from "~/routes/($lang).generation._index/components/task-view/generation-task-list"
import { GenerationTaskListActions } from "~/routes/($lang).generation._index/components/task-view/generation-task-list-actions"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  rating: number
  protect: number
  isEditMode: boolean
  isPreviewMode: boolean
  currentUserToken: string
  setRating: (rating: number) => void
  setProtect: (protect: number) => void
  toggleEditMode: (value: boolean) => void
  togglePreviewMode: (value: boolean) => void
}

/**
 * タスク関連
 */
export function GenerationTaskListView(props: Props) {
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

  const { data: tasks, refetch: taskRefetch } = useQuery(
    viewerImageGenerationTasksQuery,
    {
      variables: {
        limit:
          props.protect !== 1 && (props.rating === 0 || props.rating === -1)
            ? 56
            : config.query.maxLimit,
        offset: page * 56,
        where: {
          ...(props.rating !== -1 && {
            rating: props.rating,
          }),
          ...(props.protect !== -1 && {
            isProtected: props.protect === 1,
          }),
        },
      },
      fetchPolicy: "cache-first",
    },
  )

  const { data: results, refetch: resultRefetch } = useQuery(
    viewerImageGenerationResultsQuery,
    {
      variables: {
        limit:
          props.protect !== 1 && (props.rating === 0 || props.rating === -1)
            ? 56
            : config.query.maxLimit,
        offset: Math.max(
          0,
          page * 56 - (tasks?.viewer?.imageGenerationTasks?.length ?? 0),
        ),
        where: {
          ...(props.rating !== -1 && {
            rating: props.rating,
          }),
          ...(props.protect !== -1 && {
            isProtected: props.protect === 1,
          }),
        },
      },
    },
  )

  const queryData = useGenerationQuery()

  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  )
  const autoRefreshInitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const autoRefreshRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const autoRefreshBaselineTasksCountRef = useRef<number>(0)
  const isAutoRefreshingRef = useRef(false)

  useEffect(() => {
    taskRefetch()
    resultRefetch()
  }, [
    queryData.userStatus?.inProgressImageGenerationTasksCount ||
      queryData.userStatus?.inProgressImageGenerationReservedTasksCount,
  ])

  const stopAutoRefresh = useCallback(() => {
    isAutoRefreshingRef.current = false
    if (autoRefreshInitTimerRef.current) {
      clearTimeout(autoRefreshInitTimerRef.current)
      autoRefreshInitTimerRef.current = null
    }
    if (autoRefreshRetryTimerRef.current) {
      clearTimeout(autoRefreshRetryTimerRef.current)
      autoRefreshRetryTimerRef.current = null
    }
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current)
      autoRefreshTimerRef.current = null
    }
  }, [])

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
      (results?.viewer?.imageGenerationResults
        .filter((result) => result.nanoid !== null)
        .map((result) => result.nanoid)
        .filter((id) => id !== null) as string[]) ?? [],
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

  /**
   * 履歴一覧を更新する
   */
  const onRefresh = async () => {
    await taskRefetch()
    await resultRefetch()
  }

  const refreshAndMaybeStop = useCallback(async () => {
    const taskResult = await taskRefetch()
    await resultRefetch()

    const latestTasksCount =
      taskResult.data?.viewer?.imageGenerationTasks?.length ?? 0
    const inProgressCount =
      queryData.userStatus?.inProgressImageGenerationTasksCount ?? 0
    const reservedCount =
      queryData.userStatus?.inProgressImageGenerationReservedTasksCount ?? 0

    if (
      latestTasksCount === 0 &&
      inProgressCount === 0 &&
      reservedCount === 0
    ) {
      stopAutoRefresh()
    }
    return latestTasksCount
  }, [queryData.userStatus, resultRefetch, stopAutoRefresh, taskRefetch])

  const startAutoRefresh = useCallback(() => {
    stopAutoRefresh()
    isAutoRefreshingRef.current = true
    autoRefreshBaselineTasksCountRef.current =
      tasks?.viewer?.imageGenerationTasks?.length ?? 0

    // 1秒後くらいに更新（生成タスクが反映されるまで少し待つ）
    autoRefreshInitTimerRef.current = setTimeout(async () => {
      if (!isAutoRefreshingRef.current) return
      const firstCount = await refreshAndMaybeStop()
      if (!isAutoRefreshingRef.current) return

      // その1秒後増えてなかったらもう一回
      let secondCount = firstCount
      if (firstCount <= autoRefreshBaselineTasksCountRef.current) {
        secondCount = await refreshAndMaybeStop()
      }
      if (!isAutoRefreshingRef.current) return

      // さらに増えてなかったら2秒後に再度取得
      if (secondCount <= autoRefreshBaselineTasksCountRef.current) {
        autoRefreshRetryTimerRef.current = setTimeout(async () => {
          if (!isAutoRefreshingRef.current) return
          await refreshAndMaybeStop()
        }, 2000)
      }

      // 以降は5秒間隔で最新一覧を追い続ける（生成中/予約中がなくなったら停止）
      autoRefreshTimerRef.current = setInterval(() => {
        if (!isAutoRefreshingRef.current) return
        refreshAndMaybeStop()
      }, 5000)
    }, 1000)
  }, [
    refreshAndMaybeStop,
    stopAutoRefresh,
    tasks?.viewer?.imageGenerationTasks,
  ])

  useEffect(() => {
    const onRequested = () => {
      startAutoRefresh()
    }
    if (typeof window === "undefined") return
    window.addEventListener("generation:task-requested", onRequested)
    return () => {
      window.removeEventListener("generation:task-requested", onRequested)
    }
  }, [startAutoRefresh])

  useEffect(() => {
    return () => {
      stopAutoRefresh()
    }
  }, [stopAutoRefresh])

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
        onRefresh={onRefresh}
      />
      {tasks !== undefined && results !== undefined && (
        <GenerationTaskList
          currentPage={page}
          hidedTaskIds={hidedTaskIds}
          rating={props.rating}
          protect={props.protect}
          isEditMode={props.isEditMode}
          isPreviewMode={props.isPreviewMode}
          selectedTaskIds={selectedTaskIds}
          results={results.viewer?.imageGenerationResults ?? []}
          tasks={tasks.viewer?.imageGenerationTasks ?? []}
          userToken={props.currentUserToken}
          taskContentPositionType={showTaskPositionType}
          onCancel={undefined}
          setCurrentPage={setPage}
          setHidedTaskIds={setHidedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          thumbnailSize={thumbnailSize()}
          onRefresh={onRefresh}
        />
      )}
      {/* </Suspense> */}
    </GenerationViewCard>
  )
}

const viewerImageGenerationResultsQuery = graphql(
  `query ViewerImageGenerationResults($offset: Int!, $limit: Int!, $where: ImageGenerationResultsWhereInput) {
    viewer {
      id
      imageGenerationResults(offset: $offset, limit: $limit, where: $where) {
        ...GenerationTaskListItem
      }
    }
  }`,
  [GenerationTaskListItemFragment],
)

const viewerImageGenerationTasksQuery = graphql(
  `query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $where: ImageGenerationTasksWhereInput) {
    viewer {
      id
      imageGenerationTasks(offset: $offset, limit: $limit, where: $where) {
        ...GenerationTaskListItemTask
      }
    }
  }`,
  [GenerationTaskListItemTaskFragment],
)
