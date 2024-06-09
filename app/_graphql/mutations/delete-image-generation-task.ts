import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

export const deleteImageGenerationTaskMutation = graphql(
  `mutation DeleteImageGenerationTask($input: DeleteImageGenerationTaskInput!) {
    deleteImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
