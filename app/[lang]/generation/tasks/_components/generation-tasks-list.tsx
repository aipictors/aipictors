"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import { AppLoading } from "@/components/app/app-loading"
import { Separator } from "@/components/ui/separator"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useSuspenseQuery } from "@apollo/client"
import { Suspense, useState } from "react"

export const todayText = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

/**
 * use Dynamic Import
 * 画像生成の履歴
 * @returns
 */
export function GenerationTasksList() {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [editMode, setEditMode] = useState("")
  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])
  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")
  const [rating, setRating] = useState(-1)
  const [dateText, setDateText] = useState(todayText())

  const onChangeRating = (rating: number) => {
    setRating(rating)
  }

  const { data: viewer, refetch: refetchViewer } = useSuspenseQuery(
    viewerCurrentPassQuery,
    {},
  )

  const machine = useImageGenerationMachine({
    passType: viewer.viewer?.currentPass?.type ?? null,
  })

  return (
    <div className="space-y-4 pb-4 w-full">
      <p>{"画像生成の履歴"}</p>
      <GenerationTasksOperationParts
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        editMode={editMode}
        showDateInput={true}
        dateText={dateText}
        onChangeRating={onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        setEditMode={setEditMode}
        onChangeDateText={setDateText}
      />
      <Separator />
      <Suspense fallback={<AppLoading />}>
        <GenerationEditorResultContents
          pcViewType="dialog"
          sizeType="full"
          hidedTaskIds={hidedTaskIds}
          rating={rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onChangeSampler={machine.updateSampler}
          onChangeScale={machine.updateScale}
          onChangeSeed={machine.updateSeed}
          onChangeVae={machine.updateVae}
          onChangePromptText={machine.updatePrompt}
          onChangeNegativePromptText={machine.updateNegativePrompt}
          additionalTask={null}
        />
      </Suspense>
    </div>
  )
}
