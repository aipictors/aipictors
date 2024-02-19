"use client"

import { GenerationEditorResultContents } from "@/app/[lang]/generation/_components/generation-editor-result-contents"
import { GenerationTasksOperationParts } from "@/app/[lang]/generation/_components/generation-tasks-operation-parts"
import { AppLoadingPage } from "@/components/app/app-loading-page"
import { Separator } from "@/components/ui/separator"
import { cancelImageGenerationTaskMutation } from "@/graphql/mutations/cancel-image-generation-task"
import { viewerImageGenerationTasksQuery } from "@/graphql/queries/viewer/viewer-image-generation-tasks"
import { useMutation } from "@apollo/client"
import { Suspense, useState } from "react"
import { toast } from "sonner"

type Props = {
  isCreatingTasks: boolean
  userNanoid: string | null
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
  const [rating, setRating] = useState(-1)

  const [editMode, setEditMode] = useState("")

  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])

  const [hidedTaskIds, setHidedTaskIds] = useState<string[]>([])

  const [thumbnailSize, setThumbnailSize] = useState<string>("middle")

  const [cancelTask, { loading: isCanceling }] = useMutation(
    cancelImageGenerationTaskMutation,
    {
      refetchQueries: [viewerImageGenerationTasksQuery],
      awaitRefetchQueries: true,
    },
  )

  /**
   * レーティングを変更する
   * @param rating レーティング
   */
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
    <>
      {/* 操作一覧 */}
      <GenerationTasksOperationParts
        showHistoryAllButton={true}
        rating={rating}
        thumbnailSize={thumbnailSize}
        selectedTaskIds={selectedTaskIds}
        hidedTaskIds={hidedTaskIds}
        editMode={editMode}
        onChangeRating={onChangeRating}
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
          rating={rating}
          editMode={editMode}
          selectedTaskIds={selectedTaskIds}
          thumbnailSize={thumbnailSize}
          setSelectedTaskIds={setSelectedTaskIds}
          onCancelTask={onCancelTask}
          onUpdateSettings={props.onUpdateSettings}
        />
      </Suspense>
    </>
  )
}
