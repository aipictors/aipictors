import { Card } from "@/_components/ui/card"
import { AuthContext } from "@/_contexts/auth-context"
import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { useGenerationContext } from "@/routes/($lang).generation._index/_hooks/use-generation-context"
import { useSuspenseQuery } from "@apollo/client/index"
import { skipToken } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

/**
 * タスク内容
 */
export const GenerationTaskContentPreview = () => {
  const context = useGenerationContext()

  if (context.config.previewTaskId === null) {
    return null
  }

  const authContext = useContext(AuthContext)

  const { data } = useSuspenseQuery(
    imageGenerationTaskQuery,
    authContext.isLoggedIn
      ? {
          variables: {
            id: context.config.previewTaskId,
          },
          fetchPolicy: "cache-first",
        }
      : skipToken,
  )

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
                // biome-ignore lint/nursery/useSortedClasses: <explanation>
                className={`max-h-[72vh] generation-image-${imageGenerationTask.id}`}
                src={imageGenerationTask.imageUrl}
                alt={"-"}
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

export const imageGenerationTaskQuery = graphql(
  `query ImageGenerationTask($id: ID!) {
    imageGenerationTask(id: $id) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
