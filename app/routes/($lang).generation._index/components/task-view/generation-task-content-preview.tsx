import { Card } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { useCachedImageGenerationResult } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-result"
import { useCachedImageGenerationTask } from "~/routes/($lang).generation._index/hooks/use-cached-image-generation-task"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useContext } from "react"
import { cn } from "~/lib/utils"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

/**
 * タスクプレビュー内容
 */
export function GenerationTaskContentPreview() {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  const previewTaskId = context.config.previewTaskId ?? ""

  const imageGenerationTask = useCachedImageGenerationTask(previewTaskId)

  const imageGenerationResult = useCachedImageGenerationResult(previewTaskId)

  if (authContext === null || !context.config.previewTaskId) {
    return null
  }

  const userToken = context.config.currentUserToken

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        {imageGenerationTask?.imageUrl &&
        imageGenerationTask?.thumbnailUrl &&
        userToken ? (
          <div className="m-auto max-h-[100vh]">
            <img
              className={cn(
                `generation-image-${imageGenerationTask.id}`,
                "max-h-[64vh]",
              )}
              src={
                context.config.taskListThumbnailType === "light"
                  ? normalizeGenerativeFileUrl(imageGenerationTask.thumbnailUrl)
                  : normalizeGenerativeFileUrl(imageGenerationTask.imageUrl)
              }
              data-original={normalizeGenerativeFileUrl(
                imageGenerationTask.imageUrl,
              )}
              data-generative-raw={
                context.config.taskListThumbnailType === "light"
                  ? imageGenerationTask.thumbnailUrl
                  : imageGenerationTask.imageUrl
              }
              onError={(event) => {
                const img = event.currentTarget
                const raw = img.dataset.generativeRaw
                if (!raw) return
                if (img.dataset.generativeFallback === "true") {
                  return
                }
                img.dataset.generativeFallback = "true"
                img.src = raw
              }}
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
        imageGenerationResult?.thumbnailUrl &&
        userToken ? (
          <div className="m-auto max-h-[100vh]">
            <img
              className={cn(
                `generation-image-${imageGenerationResult.id}`,
                "max-h-[64vh]",
              )}
              src={
                context.config.taskListThumbnailType === "light"
                  ? normalizeGenerativeFileUrl(
                      imageGenerationResult.thumbnailUrl,
                    )
                  : normalizeGenerativeFileUrl(imageGenerationResult.imageUrl)
              }
              data-original={normalizeGenerativeFileUrl(
                imageGenerationResult.imageUrl,
              )}
              data-generative-raw={
                context.config.taskListThumbnailType === "light"
                  ? imageGenerationResult.thumbnailUrl
                  : imageGenerationResult.imageUrl
              }
              onError={(event) => {
                const img = event.currentTarget
                const raw = img.dataset.generativeRaw
                if (!raw) return
                if (img.dataset.generativeFallback === "true") {
                  return
                }
                img.dataset.generativeFallback = "true"
                img.src = raw
              }}
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
