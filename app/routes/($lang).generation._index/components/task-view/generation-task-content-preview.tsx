import { Card } from "@/components/ui/card"
import { AuthContext } from "@/contexts/auth-context"
import { useCachedImageGenerationResult } from "@/routes/($lang).generation._index/hooks/use-cached-image-generation-result"
import { useCachedImageGenerationTask } from "@/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/routes/($lang).generation._index/hooks/use-generation-context"
import { useContext } from "react"

/**
 * タスクプレビュー内容
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

  const imageGenerationResult = useCachedImageGenerationResult(
    context.config.previewTaskId,
  )

  const userToken = context.config.currentUserToken

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        {imageGenerationTask?.imageUrl &&
        imageGenerationTask.thumbnailUrl &&
        userToken ? (
          <div className="m-auto max-h-[100vh]">
            <img
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
              className={`max-h-[64vh] generation-image-${imageGenerationTask.id}`}
              src={
                context.config.taskListThumbnailType === "light"
                  ? imageGenerationTask.thumbnailUrl
                  : imageGenerationTask.imageUrl
              }
              data-original={imageGenerationTask.imageUrl}
              alt={"-"}
            />
            <div className="m-auto mb-1">
              <p className="mb-1 font-semibold">{"Model"}</p>
              <p>{imageGenerationTask.model?.name}</p>
            </div>
          </div>
        ) : (
          <></>
        )}

        {imageGenerationResult?.imageUrl &&
        imageGenerationResult.thumbnailUrl &&
        userToken ? (
          <div className="m-auto max-h-[100vh]">
            <img
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
              className={`max-h-[64vh] generation-image-${imageGenerationResult.id}`}
              src={
                context.config.taskListThumbnailType === "light"
                  ? imageGenerationResult.thumbnailUrl
                  : imageGenerationResult.imageUrl
              }
              data-original={imageGenerationResult.imageUrl}
              alt={"-"}
            />
            <div className="m-auto mb-1">
              <p className="mb-1 font-semibold">{"Model"}</p>
              <p>{imageGenerationResult.model?.name}</p>
            </div>
          </div>
        ) : (
          <></>
        )}
      </Card>
    </>
  )
}
