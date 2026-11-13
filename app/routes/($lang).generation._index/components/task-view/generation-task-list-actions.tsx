import { Button } from "~/components/ui/button"
import { Slider } from "~/components/ui/slider"
import { GenerationTasksDeleteButton } from "~/routes/($lang).generation._index/components/generation-tasks-delete-button"
import { GenerationImageDownloadButton } from "~/routes/($lang).generation._index/components/task-view/generation-image-download-button"
import { GenerationImagePostButton } from "~/routes/($lang).generation._index/components/task-view/generation-image-upload-button"
import { GenerationTaskActionDropdownMenu } from "~/routes/($lang).generation._index/components/task-view/generation-task-action-dropdown-menu"
import { GenerationTaskCountSelect } from "~/routes/($lang).generation._index/components/task-view/generation-task-count-select"
import { GenerationTaskRatingSelect } from "~/routes/($lang).generation._index/components/task-view/generation-task-rating-select"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import type { TaskListThumbnailType } from "~/routes/($lang).generation._index/types/task-list-thumbnail-type"
import { useMutation } from "@apollo/client/index"
import { graphql } from "gql.tada"
import {
  MaximizeIcon,
  MinimizeIcon,
  RefreshCwIcon,
  SquareCheckIcon,
} from "lucide-react"
import { useState, useCallback } from "react"
import { useTranslation } from "~/hooks/use-translation"

type Props = {
  rating: number
  protect: number
  thumbnailSize: number
  thumbnailType: TaskListThumbnailType
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  isEditMode: boolean
  showCountInput?: boolean
  showHistoryExpandButton?: boolean
  viewCount?: number
  onChangeRating(rating: number): void
  onChangeProtect(protect: number): void
  onChangeViewCount(count: number): void
  onChangeThumbnailType(type: TaskListThumbnailType): void
  setThumbnailSize(size: number): void
  setSelectedTaskIds(selectedTaskIds: string[]): void
  setHidedTaskIds(selectedTaskIds: string[]): void
  onToggleEditMode(): void
  onSelectAll(): void
  onCancelAll(): void
  onRefresh?(): void
}

/**
 * 履歴の操作
 */
export function GenerationTaskListActions (props: Props) {
  const [deleteTask] = useMutation(deleteImageGenerationResultMutation)
  const t = useTranslation()

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

  const selectedCount = props.selectedTaskIds.length
  const isEmpty = selectedCount === 0

  // 選択中は「選んだものへの操作」だけ、ふだんは「絞り込みと表示」だけを出す（1 列に収める）
  if (props.isEditMode) {
    return (
      <div className="flex min-h-9 flex-wrap items-center gap-2 px-2 pb-2 md:px-4">
        <Button onClick={props.onToggleEditMode} variant="secondary" size="sm">
          {t("完了", "Done")}
        </Button>
        <Button
          onClick={isEmpty ? props.onSelectAll : props.onCancelAll}
          variant="outline"
          size="sm"
        >
          {isEmpty ? t("すべて選択", "Select all") : t("選択を解除", "Clear")}
        </Button>
        <span className="text-muted-foreground text-xs">
          {isEmpty
            ? t("画像をタップして選択", "Tap images to select")
            : t(`${selectedCount}件選択中`, `${selectedCount} selected`)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {/* ダウンロード */}
          <GenerationImageDownloadButton
            disabled={false}
            selectedTaskIds={props.selectedTaskIds}
            title={t(
              "選んだ画像をまとめてダウンロード",
              "Download the selected images",
            )}
            isEnable={isEmpty}
          />
          {/* 投稿 */}
          <GenerationImagePostButton
            disabled={false}
            selectedTaskIds={props.selectedTaskIds}
            title={t("選んだ画像をまとめて投稿", "Post the selected images")}
            isEnable={isEmpty}
          />
          {/* 削除 */}
          <GenerationTasksDeleteButton
            disabled={false}
            onDelete={onTrashTasks}
            isDeletedLoading={isDeletedLoading}
            title={t("選んだ画像をまとめて削除", "Delete the selected images")}
            isEnable={isEmpty}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-2 px-2 pb-2 md:px-4">
      <Button
        title={t(
          "複数選んで、まとめてダウンロード・投稿・削除できます",
          "Select several to download, post or delete them together",
        )}
        onClick={props.onToggleEditMode}
        variant="outline"
        size="sm"
        className="gap-1"
      >
        <SquareCheckIcon className="size-4" />
        {t("選択", "Select")}
      </Button>
      <GenerationTaskRatingSelect
        defaultValue={props.rating}
        onChange={props.onChangeRating}
      />
      {props.showCountInput && props.viewCount && (
        <GenerationTaskCountSelect
          value={props.viewCount}
          onChange={(value) => {
            props.onChangeViewCount(value)
          }}
        />
      )}
      <div className="ml-auto flex items-center gap-1">
        {/* サムネイルサイズ */}
        <Slider
          className="color-pink mr-1 w-20 shrink-0 md:w-28"
          aria-label={t("サムネイルサイズ", "Thumbnail size")}
          title={t("サムネイルサイズ", "Thumbnail size")}
          min={1}
          max={9}
          step={1}
          value={[props.thumbnailSize]}
          onValueChange={(value) => props.setThumbnailSize(value[0])}
        />
        <GenerationTaskActionDropdownMenu
          thumbnailType={props.thumbnailType}
          onChangeThumbnailType={props.onChangeThumbnailType}
        />
        {/* 履歴全画面表示 */}
        {props.showHistoryExpandButton && (
          <Button
            onClick={openFullHistory}
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
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
          </Button>
        )}
        {/* 更新ボタン */}
        {props.onRefresh && (
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="icon"
            disabled={isRefreshDisabled}
            title={t("履歴一覧を更新", "Refresh history list")}
          >
            <RefreshCwIcon
              className={`w-4 ${isRefreshDisabled ? "animate-spin" : ""}`}
            />
          </Button>
        )}
      </div>
    </div>
  )
}

const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      id
    }
  }`,
)
