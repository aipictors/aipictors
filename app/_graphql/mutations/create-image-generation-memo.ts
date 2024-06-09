import { imageGenerationMemoFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-memo-field"
import { graphql } from "gql.tada"

export const createImageGenerationMemoMutation = graphql(
  `mutation CreateImageGenerationMemo($input: CreateImageGenerationMemoInput!) {
    createImageGenerationMemo(input: $input) {
      ...ImageGenerationMemoFields
    }
  }`,
  [imageGenerationMemoFieldsFragment],
)
