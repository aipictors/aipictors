import { imageGenerationMemoFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-memo-field"
import { graphql } from "gql.tada"

export const updateImageGenerationMemoMutation = graphql(
  `mutation UpdateImageGenerationTask($input: UpdateImageGenerationMemoInput!) {
    updateImageGenerationMemo(input: $input) {
      ...ImageGenerationMemoFields
    }
  }`,
  [imageGenerationMemoFieldsFragment],
)
