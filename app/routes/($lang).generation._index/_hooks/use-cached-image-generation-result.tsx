import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { useApolloClient } from "@apollo/client/index"

export const useCachedImageGenerationResult = (id: string) => {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationResultNode:${id}`,
    fragment: imageGenerationResultFieldsFragment,
  })

  return data
}
