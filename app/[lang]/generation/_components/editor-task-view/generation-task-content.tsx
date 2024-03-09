"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"

/**
 * タスク詳細内容
 * @param props
 * @returns
 */
export const GenerationTaskContent = () => {
  const context = useGenerationContext()

  const imageGenerationTask = context.config.previewTask

  if (imageGenerationTask === null || imageGenerationTask === undefined) {
    return null
  }

  return (
    <>
      <GenerationTaskSheetView
        task={{
          ...imageGenerationTask,
          status: imageGenerationTask.status as ImageGenerationStatus,
          sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
          generationType:
            imageGenerationTask.generationType as ImageGenerationType,
        }}
      />
    </>
  )
}
