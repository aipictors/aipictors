import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { graphql } from "gql.tada"

export const updateProtectedImageGenerationResultMutation = graphql(
  `mutation updateProtectedImageGenerationResult($input: UpdateProtectedImageGenerationResultInput!) {
    updateProtectedImageGenerationResult(input: $input) {
      ...ImageGenerationResultFields
    }
  }`,
  [imageGenerationResultFieldsFragment],
)
