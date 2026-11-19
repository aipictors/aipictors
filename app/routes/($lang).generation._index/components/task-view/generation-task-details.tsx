import { Suspense, useContext } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AuthContext } from "~/contexts/auth-context"
import { GenerationTaskSheetView } from "~/routes/($lang).generation._index/components/generation-task-sheet-view"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"

type Props = {
  onReroll?: () => void
}

/**
 * 画像生成履歴の詳細
 */
export function GenerationTaskDetails(props: Props) {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  const viewTaskId = context.config.viewTaskId

  const imageGenerationTask = useCachedImageGenerationTask(viewTaskId ?? "")

  const imageGenerationResult = useCachedImageGenerationResult(viewTaskId ?? "")

  if (authContext === null || viewTaskId === null) {
    return null
  }

  return (
    <>
      <ScrollArea className="absolute pb-64 md:pb-8">
        <Suspense fallback={<AppLoadingPage />}>
          {imageGenerationTask && (
            <GenerationTaskSheetView
              task={imageGenerationTask}
              onReroll={props.onReroll}
            />
          )}
          {imageGenerationResult && (
            <GenerationTaskSheetView
              task={imageGenerationResult}
              onReroll={props.onReroll}
            />
          )}
        </Suspense>
      </ScrollArea>
    </>
  )
}
