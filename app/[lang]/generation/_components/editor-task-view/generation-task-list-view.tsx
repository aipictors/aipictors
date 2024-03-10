"use client"

import { GenerationTaskList } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-actions"
import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import type { ThumbnailImageSizeType } from "@/app/[lang]/generation/_types/thumbnail-image-size-type"
import { config } from "@/config"
import { useState } from "react"
import { useMediaQuery } from "usehooks-ts"

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationTaskListView = () => {
  const [rating, setRating] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [isPreviewMode, togglePreviewMode] = useState(false)

  const [showTaskPositionType, changeShowTaskPositionType] =
    useState<TaskContentPositionType>("right")

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [thumbnailSize, setThumbnailSize] = useState<ThumbnailImageSizeType>(7)

  /**
   * レーティングを変更する
   * @param rating レーティング
   */
  const onChangeRating = (rating: number) => {
    setRating(rating)
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

  return (
    <GenerationViewCard
      title={"生成履歴"}
      tooltip={
        "履歴は1週間、スタンダードの場合は2週間まで保存されます。★を付与することで永久保存できます。プランによって保存できる上限が変わります。"
      }
      tooltipDetailLink={"/plus"}
    >
      <GenerationTaskListActions
        showHistoryAllButton={true}
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        isEditMode={isEditMode}
        taskContentPositionType={showTaskPositionType}
        onChangeRating={onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        onToggleEditMode={onToggleEditMode}
        onTogglePreviewMode={onTogglePreviewMode}
        onChangeViewCount={() => {}}
        onChangeTaskContentPositionType={changeShowTaskPositionType}
      />
      <GenerationTaskList
        hidedTaskIds={hidedTaskIds}
        rating={rating}
        isEditMode={isEditMode}
        isPreviewMode={isPreviewMode}
        selectedTaskIds={selectedTaskIds}
        thumbnailSize={thumbnailSize}
        taskContentPositionType={showTaskPositionType}
        setSelectedTaskIds={setSelectedTaskIds}
        onCancel={undefined}
      />
    </GenerationViewCard>
  )
}
