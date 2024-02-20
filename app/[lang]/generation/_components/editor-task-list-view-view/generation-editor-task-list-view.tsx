"use client"

import { GenerationEditorTaskListArea } from "@/app/[lang]/generation/_components/editor-task-list-view-view/generation-editor-task-list-area"
import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-list-view-view/generation-task-list-actions"
import { GenerationEditorCard } from "@/app/[lang]/generation/_components/generation-editor-card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"

type Props = {
  isCreatingTasks: boolean
  userNanoid: string | null
  passType: string | null
  onUpdateSettings(
    modelId: string,
    modelType: string,
    sampler: string,
    scale: number,
    vae: string,
    promptText: string,
    negativePromptText: string,
    seed: number,
    sizeType: string,
  ): void
  onCancel?(): void
}

/**
 * タスク関連
 * @param props
 * @returns
 */
export const GenerationEditorTaskListView = (props: Props) => {
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
      <Separator />
      <GenerationEditorTaskListArea
        isCreatingTasks={props.isCreatingTasks}
        hidedTaskIds={hidedTaskIds}
        rating={rating}
        isEditMode={isEditMode}
        selectedTaskIds={selectedTaskIds}
        thumbnailSize={thumbnailSize}
        passType={props.passType}
        setSelectedTaskIds={setSelectedTaskIds}
        onUpdateSettings={props.onUpdateSettings}
        onCancel={props.onCancel}
      />
    </GenerationEditorCard>
  )
}
