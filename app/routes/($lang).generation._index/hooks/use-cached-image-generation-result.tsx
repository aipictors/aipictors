import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { GenerationImageResultSheetFragment } from "~/routes/($lang).generation._index/components/generation-task-sheet-view"

export function useCachedImageGenerationResult(id: string) {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationResultNode:${id}`,
    fragment: graphql(
      `fragment ImageGenerationTaskFields on ImageGenerationResultNode @_unmask {
        ...GenerationImageResultSheet
      }`,
      [GenerationImageResultSheetFragment],
    ),
  })

  return data
}
