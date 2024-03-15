"use client"

import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-actions"
import { GenerationTaskListHistory } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-history"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import type { TaskContentPositionType } from "@/app/[lang]/generation/_types/task-content-position-type"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useState } from "react"

export const todayText = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskHistory() {
  const context = useGenerationContext()

  const state = GenerationConfigContext.useSelector((snap) => {
    return snap.value
  })

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [isEditMode, toggleEditMode] = useState(false)

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const [showTaskPositionType, changeShowTaskPositionType] =
    useState<TaskContentPositionType>("right")

  const [rating, setRating] = useState(-1)

  const [viewCount, setViewCount] = useState(50)

  const onChangeRating = (rating: number) => {
    setRating(rating)
  }

  const onToggleEditMode = () => {
    if (isEditMode) {
      setSelectedTaskIds([])
    }
    toggleEditMode((value) => !value)
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

  return (
    <div className="w-full space-y-4 pb-4">
      <div className="ml-4 flex items-center">
        <Link href="/generation">画像生成に戻る</Link>
      </div>
      <GenerationTaskListActions
        rating={rating}
        thumbnailSize={thumbnailSize()}
        taskContentPositionType={showTaskPositionType}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        isEditMode={isEditMode}
        showCountInput={true}
        viewCount={viewCount}
        onChangeTaskContentPositionType={changeShowTaskPositionType}
        onChangeRating={onChangeRating}
        setThumbnailSize={updateThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        onToggleEditMode={onToggleEditMode}
        onChangeViewCount={setViewCount}
        onTogglePreviewMode={() => {}}
      />
      <Separator />
      <GenerationTaskListHistory
        viewCount={viewCount}
        hidedTaskIds={hidedTaskIds}
        rating={rating}
        isEditMode={isEditMode}
        selectedTaskIds={selectedTaskIds}
        thumbnailSize={thumbnailSize()}
        isCreatingTasks={false}
        setSelectedTaskIds={setSelectedTaskIds}
      />
    </div>
  )
}
