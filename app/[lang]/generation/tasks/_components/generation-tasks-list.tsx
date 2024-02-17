"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { useImageGenerationMachine } from "@/app/[lang]/generation/_hooks/use-image-generation-machine"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Separator } from "@/components/ui/separator"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useSuspenseQuery } from "@apollo/client"
import Link from "next/link"
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
  const [viewCount, setViewCount] = useState(50)

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
      <div className="flex items-center">
        <Link href="/generation">画像生成に戻る</Link>
      </div>
      <GenerationTasksOperationParts
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        editMode={editMode}
        showCountInput={true}
        viewCount={viewCount}
        onChangeRating={onChangeRating}
        setThumbnailSize={setThumbnailSize}
        setSelectedTaskIds={setSelectedTaskIds}
        setHidedTaskIds={setHidedTaskIds}
        setEditMode={setEditMode}
        onChangeViewCount={setViewCount}
      />
      <Separator />
      <Suspense fallback={<AppLoadingPage />}>
        <GenerationEditorResultContents
          pcViewType="dialog"
          sizeType="full"
          viewCount={viewCount}
          hidedTaskIds={hidedTaskIds}
          rating={rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onChangeModeId={machine.updateModelId}
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
