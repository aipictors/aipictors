"use client"

import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { GenerationTaskList } from "@/app/[lang]/generation/_components/task-view/generation-task-list"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/task-view/generation-task-list-actions"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { TaskListThumbnailType } from "@/app/[lang]/generation/_types/task-list-thumbnail-type"
import { useState } from "react"

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

  const [page, setPage] = useState(0)

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

  const changeThumbnailType = (value: TaskListThumbnailType) => {
    context.changeTaskListThumbnailType(value)
  }

  return (
    <GenerationViewCard
      title={"生成履歴"}
      tooltip={
        "履歴は3日間、スタンダードの場合は2週間まで保存されます。🔏をすることで永久保存できます。プランによって保存できる上限が変わります。"
      }
      tooltipDetailLink={"/plus"}
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
        thumbnailSize={thumbnailSize()}
        taskContentPositionType={showTaskPositionType}
        onCancel={undefined}
        setCurrentPage={setPage}
        setSelectedTaskIds={setSelectedTaskIds}
      />
      {/* </Suspense> */}
    </GenerationViewCard>
  )
}
