import { graphql } from "gql.tada"

export const aiModelFieldsFragment = graphql(
  `fragment AiModelFields on AiModelNode @_unmask  {
    id
    name
    type
    generationModelId
    workModelId
    thumbnailImageURL
  }`,
)
