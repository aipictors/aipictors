"use client"

import { GenerationImageDownloadButton } from "@/app/[lang]/generation/_components/editor-task-view/generation-image-download-button"
import { GenerationImagePostButton } from "@/app/[lang]/generation/_components/editor-task-view/generation-image-upload-button"
import { GenerationTaskActionDropdownMenu } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-action-dropdown-menu"
import { GenerationTaskCountSelect } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-count-select"
import { GenerationTaskDeleteButton } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-delete-button"
import { GenerationTaskPreviewModeButton } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-preview-mode-button"
import { GenerationTaskRatingSelect } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-rating-select"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { Toggle } from "@/components/ui/toggle"
import { config } from "@/config"
import { deleteImageGenerationTaskMutation } from "@/graphql/mutations/delete-image-generation-task"
import { useMutation } from "@apollo/client"
import { MaximizeIcon, MinimizeIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "usehooks-ts"

type Props = {
  rating: number
  thumbnailSize: number
  taskContentPositionType: TaskContentPositionType
  selectedTaskIds: string[]
  hidedTaskIds: string[]
  isEditMode: boolean
  showCountInput?: boolean
  showHistoryExpandButton?: boolean
  viewCount?: number
  onChangeRating(rating: number): void
  onChangeViewCount(count: number): void
  setThumbnailSize(size: number): void
  onChangeTaskContentPositionType(size: TaskContentPositionType): void
  setSelectedTaskIds(selectedTaskIds: string[]): void
  setHidedTaskIds(selectedTaskIds: string[]): void
  onToggleEditMode(): void
  onTogglePreviewMode(): void
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

  const router = useRouter()

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
      <div className="flex items-center px-4 pb-2">
        <div className="flex w-full items-center space-x-2">
          {/* 履歴選択・キャンセルボタン */}
          <Toggle
            className="w-16"
            onClick={props.onToggleEditMode}
            variant="outline"
            size={"sm"}
          >
            {props.isEditMode ? "解除" : "選択"}
          </Toggle>
          {props.isEditMode && (
            <GenerationTaskDeleteButton
              disabled={isEmpty}
              onDelete={onTrashTasks}
            />
          )}
          {props.isEditMode && (
            <GenerationImageDownloadButton
              disabled={isEmpty}
              selectedTaskIds={props.selectedTaskIds}
            />
          )}
          {props.isEditMode && (
            <GenerationImagePostButton
              disabled={isEmpty}
              selectedTaskIds={props.selectedTaskIds}
            />
          )}
          {!props.isEditMode && (
            <GenerationTaskRatingSelect onChange={props.onChangeRating} />
          )}
          {isDesktop && (
            <GenerationTaskPreviewModeButton
              onTogglePreviewMode={props.onTogglePreviewMode}
            />
          )}
          {
            <GenerationTaskActionDropdownMenu
              thumbnailSize={props.thumbnailSize}
              onChange={props.setThumbnailSize}
              taskContentPositionType={props.taskContentPositionType}
              onChangeTaskContentPositionType={
                props.onChangeTaskContentPositionType
              }
            />
          }
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
          <Toggle
            onClick={openFullHistory}
            variant={"outline"}
            className="ml-auto w-16"
          >
            {state === "HISTORY_LIST_FULL" ? (
              <MinimizeIcon className="w-4" />
            ) : (
              <MaximizeIcon className="w-4" />
            )}
          </Toggle>
        )}
      </div>
    </>
  )
}
