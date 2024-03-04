"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { PrivateImage } from "@/app/_components/private-image"
import { Card } from "@/components/ui/card"

/**
 * タスク内容
 * @param props
 * @returns
 */
export const GenerationTaskContentView = () => {
  const context = useGenerationContext()

  const imageGenerationTask = context.config.previewTask

  if (imageGenerationTask === null || imageGenerationTask === undefined) {
    return null
  }

  return (
    <>
      <Card className="flex flex-col h-[100vh] w-auto">
        <div className="m-auto max-h-[100vh]">
          <PrivateImage
            className={` max-h-[72vh] generation-image-${imageGenerationTask.id}`}
            taskId={imageGenerationTask.id}
            token={imageGenerationTask.token ?? ""}
            alt={"-"}
          />
          <div className="m-auto mb-1">
            <p className="mb-1 font-semibold">{"Model"}</p>
            <p>{imageGenerationTask.model?.name}</p>
          </div>
        </div>
      </Card>
    </>
  )
}
