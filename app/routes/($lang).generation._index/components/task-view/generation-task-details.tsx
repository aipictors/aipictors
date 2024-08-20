import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { GenerationTaskSheetView } from "~/routes/($lang).generation._index/components/generation-task-sheet-view"
import { Suspense, useContext } from "react"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"

/**
 * 画像生成履歴の詳細
 */
export function GenerationTaskDetails() {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  if (authContext === null || context.config.viewTaskId === null) {
    return null
  }

  const imageGenerationTask = useCachedImageGenerationTask(
    context.config.viewTaskId,
  )

  const imageGenerationResult = useCachedImageGenerationResult(
    context.config.viewTaskId,
  )

  return (
    <>
      <ScrollArea className="absolute pb-64 md:pb-8">
        <Suspense fallback={<AppLoadingPage />}>
          {imageGenerationTask && (
            <GenerationTaskSheetView task={imageGenerationTask} />
          )}
          {imageGenerationResult && (
            <GenerationTaskSheetView task={imageGenerationResult} />
          )}
        </Suspense>
      </ScrollArea>
    </>
  )
}
