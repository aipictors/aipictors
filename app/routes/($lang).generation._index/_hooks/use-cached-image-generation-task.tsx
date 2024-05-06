import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { useApolloClient } from "@apollo/client/index"

export const useCachedImageGenerationTask = (id: string) => {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationTaskNode:${id}`,
    fragment: imageGenerationTaskFieldsFragment,
  })

  return data
}
