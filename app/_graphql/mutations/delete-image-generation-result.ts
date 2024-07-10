import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { graphql } from "gql.tada"

export const deleteImageGenerationResultMutation = graphql(
  `mutation deleteImageGenerationResult($input: DeleteImageGenerationResultInput!) {
    deleteImageGenerationResult(input: $input) {
      ...ImageGenerationResultFields
    }
  }`,
  [imageGenerationResultFieldsFragment],
)
