import { PrivateImage } from "@/_components/private-image"
import { Card } from "@/_components/ui/card"
import { AuthContext } from "@/_contexts/auth-context"
import { useCachedImageGenerationTask } from "@/routes/($lang).generation._index/_hooks/use-cached-image-generation-task"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
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

  const userToken = context.config.currentUserToken

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        {imageGenerationTask?.imageFileName &&
        imageGenerationTask.thumbnailImageFileName &&
        userToken ? (
          <div className="m-auto max-h-[100vh]">
            <PrivateImage
              // biome-ignore lint/nursery/useSortedClasses: <explanation>
              className={`max-h-[64vh] generation-image-${imageGenerationTask.id}`}
              taskId={imageGenerationTask.id}
              token={userToken}
              isThumbnail={context.config.taskListThumbnailType === "light"}
              fileName={imageGenerationTask.imageFileName}
              thumbnailFileName={imageGenerationTask.thumbnailImageFileName}
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
      </Card>
    </>
  )
}
