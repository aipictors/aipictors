"use client"

import { useCachedImageGenerationTask } from "@/app/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/app/_components/private-image"
import { AuthContext } from "@/app/_contexts/auth-context"
import { Card } from "@/components/ui/card"
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
