"use client"

import { GenerationTaskListActions } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-actions"
import { GenerationTaskListHistory } from "@/app/[lang]/generation/_components/editor-task-view/generation-task-list-history"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Suspense, useState } from "react"

export const todayText = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * 画像生成の履歴
 * @returns
 */
export function GenerationTaskHistory() {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [isEditMode, toggleEditMode] = useState(false)

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")

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

  return (
    <div className="space-y-4 pb-4 w-full">
      <div className="flex items-center ml-4">
        <Link href="/generation">画像生成に戻る</Link>
      </div>
      <GenerationTaskListActions
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        isEditMode={isEditMode}
        showCountInput={true}
        viewCount={viewCount}
        onChangeRating={onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        onToggleEditMode={onToggleEditMode}
        onChangeViewCount={setViewCount}
      />
      <Separator />
      <Suspense fallback={<AppLoadingPage />}>
        <GenerationTaskListHistory
          pcViewType="dialog"
          sizeType="full"
          viewCount={viewCount}
          hidedTaskIds={hidedTaskIds}
          rating={rating}
          isEditMode={isEditMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          isCreatingTasks={false}
          setSelectedTaskIds={setSelectedTaskIds}
        />
      </Suspense>
    </div>
  )
}
