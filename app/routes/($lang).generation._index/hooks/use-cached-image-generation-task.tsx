import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"

export function useCachedImageGenerationTask(id: string) {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationTaskNode:${id}`,
    fragment: graphql(
      `fragment ImageGenerationTaskFields on ImageGenerationTaskNode @_unmask {
        id
        model {
          id
          type
        }
        nanoid
        prompt
        negativePrompt
        upscaleSize
        seed
        steps
        scale
        sampler
        clipSkip
        imageUrl
        sizeType
        vae
        controlNetModule
        controlNetWeight
        thumbnailUrl
        status
        completedAt
        model {
          id
          name
        }
      }`,
    ),
  })

  return data
}
