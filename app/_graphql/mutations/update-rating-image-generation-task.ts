import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

export const updateRatingImageGenerationTaskMutation = graphql(
  `mutation UpdateRatingImageGenerationTask($input: UpdateRatingImageGenerationTaskInput!) {
    updateRatingImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
