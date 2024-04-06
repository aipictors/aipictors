"use client"

import { useCachedImageGenerationTask } from "@/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/_components/private-image"
import { Card } from "@/_components/ui/card"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"

/**
 * タスクプレビュー内容
 * @param props
 * @returns
 */
export const GenerationTaskContentPreview = () => {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  if (
    authContext === null ||
    context.config.previewTaskId === null ||
    context.config.previewTaskId === undefined
  ) {
    return null
  }

  const imageGenerationTask = useCachedImageGenerationTask(
    context.config.previewTaskId,
  )

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        {imageGenerationTask && (
          <div className="m-auto max-h-[100vh]">
            <PrivateImage
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
              className={`max-h-[64vh] generation-image-${imageGenerationTask.id}`}
              taskId={imageGenerationTask.id}
              token={imageGenerationTask.token ?? ""}
              isThumbnail={context.config.taskListThumbnailType === "light"}
              alt={"-"}
            />
            <div className="m-auto mb-1">
              <p className="mb-1 font-semibold">{"Model"}</p>
              <p>{imageGenerationTask.model?.name}</p>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}
