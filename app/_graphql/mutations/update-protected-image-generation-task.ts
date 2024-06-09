import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

export const updateProtectedImageGenerationTaskMutation = graphql(
  `mutation UpdateProtectedImageGenerationTask($input: UpdateProtectedImageGenerationTaskInput!) {
    updateProtectedImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
