import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { Toggle } from "~/components/ui/toggle"
import { GenerationTasksDeleteButton } from "~/routes/($lang).generation._index/components/generation-tasks-delete-button"
import { GenerationImageDownloadButton } from "~/routes/($lang).generation._index/components/task-view/generation-image-download-button"
import { GenerationTaskActionDropdownMenu } from "~/routes/($lang).generation._index/components/task-view/generation-task-action-dropdown-menu"
import { GenerationTaskCountSelect } from "~/routes/($lang).generation._index/components/task-view/generation-task-count-select"
import { GenerationTaskPreviewModeButton } from "~/routes/($lang).generation._index/components/task-view/generation-task-preview-mode-button"
import { GenerationTaskRatingSelect } from "~/routes/($lang).generation._index/components/task-view/generation-task-rating-select"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import type { TaskContentPositionType } from "~/routes/($lang).generation._index/types/task-content-position-type"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { MaximizeIcon, MinimizeIcon, RefreshCwIcon } from "lucide-react"
import { useState, useCallback } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  rating: number
  protect: number
  thumbnailSize: number
  thumbnailType: TaskListThumbnailType
  taskContentPositionType: TaskContentPositionType
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  isEditMode: boolean
  showCountInput?: boolean
  previewMode?: boolean
  showHistoryExpandButton?: boolean
  viewCount?: number
  onChangeRating(rating: number): void
  onChangeProtect(protect: number): void
  onChangeViewCount(count: number): void
  onChangeThumbnailType(type: TaskListThumbnailType): void
  setThumbnailSize(size: number): void
  onChangeTaskContentPositionType(size: TaskContentPositionType): void
  setSelectedTaskIds(selectedTaskIds: string[]): void
  setHidedTaskIds(selectedTaskIds: string[]): void
  onToggleEditMode(): void
  onTogglePreviewMode(): void
  onSelectAll(): void
  onCancelAll(): void
  onRefresh?(): void
}

/**
 * 履歴の操作
 */
export function GenerationDemoTaskListActions (props: Props) {
  const [deleteTask] = useMutation(deleteImageGenerationResultMutation)
  const t = useTranslation()

  const [isAllSelected, setIsAllSelected] = useState(false)
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const [isDeletedLoading, setIsDeletedLoading] = useState(false)

  /**
   * 更新ボタンクリック時の処理（連打防止機能付き）
   */
  const handleRefresh = useCallback(async () => {
    if (isRefreshDisabled || !props.onRefresh) return

    // 連打防止のため3秒間ボタンを無効化
    setIsRefreshDisabled(true)

    try {
      await props.onRefresh()
    } finally {
      // 3秒後にボタンを再有効化
      setTimeout(() => {
        setIsRefreshDisabled(false)
      }, 3000)
    }
  }, [props.onRefresh, isRefreshDisabled])

  const onTrashTasks = async () => {
    try {
      setIsDeletedLoading(true)
      const promises = props.selectedTaskIds.map((taskId) =>
        deleteTask({
          variables: {
            input: {
              nanoid: taskId,
            },
          },
        }),
      )
      await Promise.all(promises)
      setIsDeletedLoading(false)
      props.setHidedTaskIds([...props.hidedTaskIds, ...props.selectedTaskIds])
      props.setSelectedTaskIds([])
    } catch (error) {
      console.error("Error in task deletion:", error)
    }
  }

  const { send } = GenerationConfigContext.useActorRef()

  const openFullHistory = () => {
    send({ type: "OPEN_FULL_HISTORY_LIST" })
  }

  const isEmpty = props.selectedTaskIds.length === 0

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex items-center px-2 pb-2 md:px-4 xl:px-4">
        <div className="flex w-full items-center space-x-4">
          <Toggle
            title={t(
              "履歴を複数選択してダウンロード、一括削除などを行えます",
              "Select multiple history items for bulk download, deletion, etc.",
            )}
            onClick={props.onToggleEditMode}
            variant="outline"
          >
            {props.isEditMode ? t("解除", "Deselect") : t("選択", "Select")}
          </Toggle>
          {props.isEditMode && (
            <Button
              title={t("一括選択、解除できます", "Bulk select or deselect")}
              onClick={() => {
                setIsAllSelected(!isAllSelected)
                if (isAllSelected) {
                  props.onCancelAll()
                } else {
                  props.onSelectAll()
                }
              }}
              variant="outline"
            >
              {isAllSelected
                ? t("一括解除", "Deselect All")
                : t("一括選択", "Select All")}
            </Button>
          )}
          {!props.isEditMode && (
            <GenerationTaskRatingSelect
              defaultValue={props.rating}
              onChange={props.onChangeRating}
            />
          )}
          {state !== "HISTORY_LIST_FULL" && (
            <div className="hidden md:block">
              <GenerationTaskPreviewModeButton
                onTogglePreviewMode={props.onTogglePreviewMode}
                defaultChecked={props.previewMode}
              />
            </div>
          )}
          {props.showCountInput && props.viewCount && (
            <GenerationTaskCountSelect
              value={props.viewCount}
              onChange={(value) => {
                props.onChangeViewCount(value)
              }}
            />
          )}
        </div>
        {/* 履歴全画面表示 */}
        {props.showHistoryExpandButton && (
          <div className="hidden md:block">
            <Toggle
              onClick={openFullHistory}
              variant={"outline"}
              title={t(
                "履歴一覧の全画面モード切替",
                "Toggle full-screen mode for history list",
              )}
            >
              {state === "HISTORY_LIST_FULL" ? (
                <MinimizeIcon className="w-4" />
              ) : (
                <MaximizeIcon className="w-4" />
              )}
            </Toggle>
          </div>
        )}
        {/* 更新ボタン */}
        {props.onRefresh && (
          <Button
            onClick={handleRefresh}
            variant={"outline"}
            size={"icon"}
            disabled={isRefreshDisabled}
            title={t("履歴一覧を更新", "Refresh history list")}
          >
            <RefreshCwIcon
              className={`w-4 ${isRefreshDisabled ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2 px-2 pb-2 md:px-4 xl:px-4">
        {/* 削除 */}
        <GenerationTasksDeleteButton
          disabled={false}
          onDelete={onTrashTasks}
          isDeletedLoading={isDeletedLoading}
          title={t(
            "複数選択して一括削除できます。",
            "You can bulk delete selected items.",
          )}
          isEnable={isEmpty}
        />
        {/* ダウンロード */}
        <GenerationImageDownloadButton
          disabled={false}
          selectedTaskIds={props.selectedTaskIds}
          title={t(
            "複数選択して一括ダウンロードできます。",
            "You can bulk download selected items.",
          )}
          isEnable={isEmpty}
        />
        <GenerationTaskActionDropdownMenu
          thumbnailType={props.thumbnailType}
          taskContentPositionType={props.taskContentPositionType}
          onChangeThumbnailType={props.onChangeThumbnailType}
          onChangeTaskContentPositionType={
            props.onChangeTaskContentPositionType
          }
          onSelectAll={props.onSelectAll}
          onCancelAll={props.onCancelAll}
        />
      </div>
      <Slider
        className="color-pink ml-2 w-32 px-2 pb-4"
        aria-label="slider-ex-2"
        min={1}
        max={9}
        step={1}
        value={[props.thumbnailSize]}
        onValueChange={(value) => props.setThumbnailSize(value[0])}
      />
    </>
  )
}

const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      id
    }
  }`,
)
