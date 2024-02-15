"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { AppLoading } from "@/components/app/app-loading"
import { Separator } from "@/components/ui/separator"
import { ImageGenerationTaskNode } from "@/graphql/__generated__/graphql"

import { Suspense, useState } from "react"

type Props = {
  additionalTask: ImageGenerationTaskNode | null
  userNanoid: string | null
  rating: number
  onChangeRating(rating: number): void
  onChangeSampler(sampler: string): void
  onChangeScale(scale: number): void
  onChangeSeed(seed: number): void
  onChangeSize(size: string): void
  onChangeVae(vae: string | null): void
  onChangePromptText(prompt: string): void
  onChangeNegativePromptText(prompt: string): void
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
      />
      <Separator />
      {/* 履歴一覧 */}
      <Suspense fallback={<AppLoading />}>
        <GenerationEditorResultContents
          additionalTask={props.additionalTask}
          hidedTaskIds={hidedTaskIds}
          rating={props.rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onChangeSampler={props.onChangeSampler}
          onChangeScale={props.onChangeScale}
          onChangeSeed={props.onChangeSeed}
          onChangeVae={props.onChangeVae}
          onChangePromptText={props.onChangePromptText}
          onChangeNegativePromptText={props.onChangeNegativePromptText}
        />
      </Suspense>
    </>
  )
}
