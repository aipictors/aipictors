import { gql } from "@/_graphql/__generated__"

export const aiModelFieldsFragment = gql(`
  fragment AiModelFields on AiModelNode {
    id
    name
    type
    generationModelId
    workModelId
    thumbnailImageURL
  }
`)
