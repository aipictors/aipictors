"use client"

import { useCachedImageGenerationTask } from "@/[lang]/generation/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/[lang]/generation/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/[lang]/generation/tasks/[task]/_components/generation-task-sheet-view"
import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AuthContext } from "@/_contexts/auth-context"
import type {
  ImageGenerationSizeType,
  ImageGenerationStatus,
  ImageGenerationType,
} from "@/_graphql/__generated__/graphql"
import { Suspense, useContext } from "react"

/**
 * 画像生成履歴の詳細
 * @returns
 */
export const GenerationTaskDetails = () => {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  if (authContext === null || context.config.viewTaskId === null) {
    return null
  }

  const imageGenerationTask = useCachedImageGenerationTask(
    context.config.viewTaskId,
  )

  return (
    <>
      <ScrollArea className="absolute pb-64 md:pb-8">
        <Suspense fallback={<AppLoadingPage />}>
          {imageGenerationTask && (
            <GenerationTaskSheetView
              task={{
                ...imageGenerationTask,
                status: imageGenerationTask.status as ImageGenerationStatus,
                sizeType:
                  imageGenerationTask.sizeType as ImageGenerationSizeType,
                generationType:
                  imageGenerationTask.generationType as ImageGenerationType,
              }}
            />
          )}
        </Suspense>
      </ScrollArea>
    </>
  )
}
