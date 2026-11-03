import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"

export function useCachedImageGenerationResult(id: string) {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationResultNode:${id}`,
    fragment: graphql(
      `fragment ImageGenerationTaskFields on ImageGenerationResultNode @_unmask {
        id
        model {
          id
          type
        }
        nanoid
        prompt
        promptsText
        negativePrompt
        upscaleSize
        seed
        steps
        scale
        sampler
        scheduler
        clipSkip
        imageUrl
        sizeType
        width
        height
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
        clipSkip
        rating
        isProtected
      }`,
    ),
  })

  return data
}
