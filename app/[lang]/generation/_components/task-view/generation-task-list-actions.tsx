"use client"

import { GenerationImageDownloadButton } from "@/[lang]/generation/_components/task-view/generation-image-download-button"
import { GenerationImagePostButton } from "@/[lang]/generation/_components/task-view/generation-image-upload-button"
import { GenerationTaskActionDropdownMenu } from "@/[lang]/generation/_components/task-view/generation-task-action-dropdown-menu"
import { GenerationTaskCountSelect } from "@/[lang]/generation/_components/task-view/generation-task-count-select"
import { GenerationTaskDeleteButton } from "@/[lang]/generation/_components/task-view/generation-task-delete-button"
import { GenerationTaskPreviewModeButton } from "@/[lang]/generation/_components/task-view/generation-task-preview-mode-button"
import { GenerationTaskProtectedSelect } from "@/[lang]/generation/_components/task-view/generation-task-protected-select"
import { GenerationTaskRatingSelect } from "@/[lang]/generation/_components/task-view/generation-task-rating-select"
import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import type { TaskContentPositionType } from "@/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/[lang]/generation/_types/task-list-thumbnail-type"
import { Toggle } from "@/_components/ui/toggle"
import { deleteImageGenerationTaskMutation } from "@/_graphql/mutations/delete-image-generation-task"
import { config } from "@/config"
import { useMutation } from "@apollo/client"
import { MaximizeIcon, MinimizeIcon } from "lucide-react"
import { useMediaQuery } from "usehooks-ts"

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
}

/**
 * 履歴の操作
 * @param props
 * @returns
 */
export const GenerationTaskListActions = (props: Props) => {
  const [deleteTask] = useMutation(deleteImageGenerationTaskMutation)

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const onTrashTasks = async () => {
    try {
      const promises = props.selectedTaskIds.map((taskId) =>
        deleteTask({
          variables: {
            input: {
              // props.taskId ではなく、ループ内の taskId を使用
              nanoid: taskId,
            },
          },
        }),
      )
      await Promise.all(promises)
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

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  return (
    <>
      {/* 操作一覧 */}
      <div className="flex items-center px-2 pb-2 md:px-4 xl:px-4">
        <div className="flex w-full items-center space-x-2">
          <Toggle
            title="履歴を複数選択してダウンロード、一括削除などを行えます"
            onClick={props.onToggleEditMode}
            variant="outline"
          >
            {props.isEditMode ? "解除" : "選択"}
          </Toggle>
          {!props.isEditMode && (
            <GenerationTaskRatingSelect
              defaultValue={props.rating}
              onChange={props.onChangeRating}
            />
          )}
          {!props.isEditMode && (
            <GenerationTaskProtectedSelect
              defaultValue={props.protect}
              onChange={props.onChangeProtect}
            />
          )}
          {isDesktop && state !== "HISTORY_LIST_FULL" && (
            <GenerationTaskPreviewModeButton
              onTogglePreviewMode={props.onTogglePreviewMode}
              defaultChecked={props.previewMode}
            />
          )}
          <GenerationTaskActionDropdownMenu
            thumbnailSize={props.thumbnailSize}
            thumbnailType={props.thumbnailType}
            onChange={props.setThumbnailSize}
            taskContentPositionType={props.taskContentPositionType}
            onChangeThumbnailType={props.onChangeThumbnailType}
            onChangeTaskContentPositionType={
              props.onChangeTaskContentPositionType
            }
            onSelectAll={props.onSelectAll}
            onCancelAll={props.onCancelAll}
          />
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
        {isDesktop && props.showHistoryExpandButton && (
          <Toggle
            onClick={openFullHistory}
            variant={"outline"}
            title="履歴一覧の全画面モード切替"
          >
            {state === "HISTORY_LIST_FULL" ? (
              <MinimizeIcon className="w-4" />
            ) : (
              <MaximizeIcon className="w-4" />
            )}
          </Toggle>
        )}
      </div>
      <div className="flex items-center px-2 pb-2 md:px-4 xl:px-4">
        {/* 削除 */}
        <GenerationTaskDeleteButton
          disabled={false}
          onDelete={onTrashTasks}
          title="複数選択して一括削除できます。"
          isEnable={isEmpty}
        />
        {/* ダウンロード */}
        <GenerationImageDownloadButton
          disabled={false}
          selectedTaskIds={props.selectedTaskIds}
          title="複数選択して一括ダウンロードできます。"
          isEnable={isEmpty}
        />
        {/* 投稿 */}
        <GenerationImagePostButton
          disabled={false}
          selectedTaskIds={props.selectedTaskIds}
          title="複数選択して一括投稿できます。"
          isEnable={isEmpty}
        />
      </div>
    </>
  )
}
