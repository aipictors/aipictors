"use client"

import { GenerationEditorTaskListArea } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-editor-task-list-area"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-view-view/generation-task-list-actions"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationEditorTaskView = () => {
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
    <GenerationEditorCard title={"生成履歴"}>
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

      <GenerationEditorTaskListArea
        hidedTaskIds={hidedTaskIds}
        rating={rating}
        isEditMode={isEditMode}
        selectedTaskIds={selectedTaskIds}
        thumbnailSize={thumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        onCancel={undefined}
      />
    </GenerationEditorCard>
  )
}