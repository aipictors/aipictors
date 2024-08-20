import { useApolloClient } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { GenerationImageResultSheetTaskFragment } from "~/routes/($lang).generation._index/components/generation-task-sheet-view"

export function useCachedImageGenerationTask(id: string) {
  const client = useApolloClient()

  const data = client.cache.readFragment({
    id: `ImageGenerationTaskNode:${id}`,
    fragment: graphql(
      `fragment ImageGenerationTaskFields on ImageGenerationTaskNode @_unmask {
        ...GenerationImageResultSheetTask
      }`,
      [GenerationImageResultSheetTaskFragment],
    ),
  })

  return data
}
