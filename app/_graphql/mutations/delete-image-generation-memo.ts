import { imageGenerationMemoFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-memo-field"
import { graphql } from "gql.tada"

export const deleteImageGenerationMemoMutation = graphql(
  `mutation DeleteImageGenerationMemo($input: DeleteImageGenerationMemoInput!) {
    deleteImageGenerationMemo(input: $input) {
      ...ImageGenerationMemoFields
    }
  }`,
  [imageGenerationMemoFieldsFragment],
)
