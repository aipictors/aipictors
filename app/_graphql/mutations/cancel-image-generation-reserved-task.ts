import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

export const cancelImageGenerationReservedTaskMutation = graphql(
  `mutation CancelImageGenerationReservedTask($input: CancelImageGenerationReservedTaskInput!) {
    cancelImageGenerationReservedTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
