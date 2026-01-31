import { Card } from "~/components/ui/card"
import { AuthContext } from "~/contexts/auth-context"
import { useGenerationContext } from "~/routes/($lang).generation._index/hooks/use-generation-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { skipToken } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { cn } from "~/lib/utils"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

/**
 * タスク内容
 */
export function GenerationTaskContentPreview () {
  const context = useGenerationContext()

  const authContext = useContext(AuthContext)

  const previewTaskId = context.config.previewTaskId

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn && previewTaskId
      ? {
          variables: {
            id: previewTaskId,
          },
          fetchPolicy: "cache-first",
        }
      : skipToken,
  )

  if (previewTaskId === null) {
    return null
  }

  const imageGenerationTask = data?.imageGenerationTask

  const userToken = context.config.currentUserToken

  if (
    imageGenerationTask === null ||
    imageGenerationTask === undefined ||
    userToken === null
  ) {
    return null
  }

  return (
    <>
      <Card className="flex h-[100vh] w-auto flex-col">
        <div className="m-auto max-h-[100vh]">
          {imageGenerationTask.status === "DONE" &&
            imageGenerationTask.imageUrl &&
            imageGenerationTask.thumbnailUrl && (
              <img
                className={cn(
                  `generation-image-${imageGenerationTask.id}`,
                  "max-h-[72vh]",
                )}
                src={normalizeGenerativeFileUrl(imageGenerationTask.imageUrl)}
                data-generative-raw={imageGenerationTask.imageUrl}
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
                alt="-"
              />
            )}
          {imageGenerationTask.status === "RESERVED" && <p>{"予約生成中"}</p>}
          <div className="m-auto mb-1">
            <p className="mb-1 font-semibold">{"Model"}</p>
            <p>{imageGenerationTask.model?.name}</p>
          </div>
        </div>
      </Card>
    </>
  )
}

const imageGenerationTaskQuery = graphql(
  `query ImageGenerationTask($id: ID!) {
    imageGenerationTask(id: $id) {
      id
      status
      imageUrl
      thumbnailUrl
      model {
        id
        name
      }
    }
  }`,
)
