"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Separator } from "@/components/ui/separator"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import Link from "next/link"
import { Suspense, useState } from "react"
import { toast } from "sonner"

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

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  const onChangeRating = (rating: number) => {
    setRating(rating)
  }

  /**
   * 生成タスクをキャンセルする
   * @param taskNanoid
   * @returns
   */
  const onCancelTask = async (taskNanoid: string | null) => {
    if (taskNanoid === null) return
    try {
      await cancelTask({ variables: { input: { nanoid: taskNanoid } } })
      toast("タスクをキャンセルしました")
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message)
      }
    }
  }

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
          isCreatingTasks={false}
          setSelectedTaskIds={setSelectedTaskIds}
        />
      </Suspense>
    </div>
  )
}
