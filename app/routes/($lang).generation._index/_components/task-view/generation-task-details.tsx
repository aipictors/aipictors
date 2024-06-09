import { AppLoadingPage } from "@/_components/app/app-loading-page"
import { ScrollArea } from "@/_components/ui/scroll-area"
import { AuthContext } from "@/_contexts/auth-context"
import { useCachedImageGenerationTask } from "@/routes/($lang).generation._index/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { GenerationTaskSheetView } from "@/routes/($lang).generation._index/_components/generation-task-sheet-view"
import { Suspense, useContext } from "react"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

/**
 * 画像生成履歴の詳細
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
                status:
                  imageGenerationTask.status as IntrospectionEnum<"ImageGenerationStatus">,
                sizeType:
                  imageGenerationTask.sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
                generationType:
                  imageGenerationTask.generationType as IntrospectionEnum<"ImageGenerationType">,
              }}
            />
          )}
        </Suspense>
      </ScrollArea>
    </>
  )
}
