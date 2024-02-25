"use client"

import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-actions"
import { GenerationTaskListArea } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-area"
import { GenerationViewCard } from "@/app/[lang]/generation/_components/generation-view-card"
import { useState } from "react"

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationTaskView = () => {
  const [rating, setRating] = useState(-1)

  const [isEditMode, toggleEditMode] = useState(false)

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")

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

  return (
    <GenerationViewCard title={"生成履歴"}>
      <GenerationTaskListActions
        showHistoryAllButton={true}
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        isEditMode={isEditMode}
        onChangeRating={onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        onToggleEditMode={onToggleEditMode}
        onChangeViewCount={() => {}}
      />

      <GenerationTaskListArea
        hidedTaskIds={hidedTaskIds}
        rating={rating}
        isEditMode={isEditMode}
        selectedTaskIds={selectedTaskIds}
        thumbnailSize={thumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        onCancel={undefined}
      />
    </GenerationViewCard>
  )
}
