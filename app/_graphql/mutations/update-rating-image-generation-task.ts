import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { graphql } from "gql.tada"

export const updateRatingImageGenerationResultMutation = graphql(
  `mutation updateRatingImageGenerationResult($input: UpdateRatingImageGenerationResultInput!) {
    updateRatingImageGenerationResult(input: $input) {
      ...ImageGenerationResultFields
    }
  }`,
  [imageGenerationResultFieldsFragment],
)
