"use client"

import { useGenerationContext } from "@/app/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/app/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { ScrollArea } from "@/components/ui/scroll-area"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/graphql/__generated__/graphql"

/**
 * 画像生成履歴の詳細
 * @returns
 */
export const GenerationTaskDetails = () => {
  const context = useGenerationContext()

  const imageGenerationTask = context.config.previewTask

  return (
    <>
      <ScrollArea className="absolute pb-64 md:pb-0">
        {imageGenerationTask && (
          <GenerationTaskSheetView
            task={{
              ...imageGenerationTask,
              status: imageGenerationTask.status as ImageGenerationStatus,
              sizeType: imageGenerationTask.sizeType as ImageGenerationSizeType,
              generationType:
                imageGenerationTask.generationType as ImageGenerationType,
            }}
          />
        )}
      </ScrollArea>
    </>
  )
}
