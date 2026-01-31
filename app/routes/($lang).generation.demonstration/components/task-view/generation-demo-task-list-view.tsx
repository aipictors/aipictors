import { config } from "~/config"
import { GenerationViewCard } from "~/routes/($lang).generation._index/components/generation-view-card"
import {
  GenerationTaskList,
  GenerationTaskListItemFragment,
  GenerationTaskListItemTaskFragment,
} from "~/routes/($lang).generation._index/components/task-view/generation-task-list"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useGenerationQuery } from "~/routes/($lang).generation._index/hooks/use-generation-query"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useEffect, useState } from "react"
import { GenerationDemoTaskListActions } from "~/routes/($lang).generation.demonstration/components/task-view/generation-demo-task-list-actions"

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
export function GenerationDemoTaskListView (props: Props) {
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

  useEffect(() => {
    taskRefetch()
    resultRefetch()
  }, [
    queryData.userStatus?.inProgressImageGenerationTasksCount ||
      queryData.userStatus?.inProgressImageGenerationReservedTasksCount,
  ])

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

  return (
    <GenerationViewCard>
      <GenerationDemoTaskListActions
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
