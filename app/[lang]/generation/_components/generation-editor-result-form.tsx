"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Separator } from "@/components/ui/separator"
import { Suspense, useState } from "react"

type Props = {
  isCreatingTasks: boolean
  userNanoid: string | null
  rating: number
  onChangeRating(rating: number): void
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
}

export const GenerationEditorResultForm = (props: Props) => {
  const [editMode, setEditMode] = useState("")

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")

  return (
    <>
      {/* 操作一覧 */}
      <GenerationTasksOperationParts
        showHistoryAllButton={true}
        rating={props.rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        editMode={editMode}
        onChangeRating={props.onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        setEditMode={setEditMode}
        onChangeViewCount={() => {}}
      />
      <Separator />
      {/* 履歴一覧 */}
      <Suspense fallback={<AppLoadingPage />}>
        <GenerationEditorResultContents
          isCreatingTasks={props.isCreatingTasks}
          hidedTaskIds={hidedTaskIds}
          rating={props.rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onUpdateSettings={props.onUpdateSettings}
        />
      </Suspense>
    </>
  )
}
