import { imageGenerationReservedTaskFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-task-field"
import { graphql } from "gql.tada"

export const createImageGenerationTaskReservedMutation = graphql(
  `mutation CreateReservedImageGenerationTask($input: CreateReservedImageGenerationTaskInput!) {
    createReservedImageGenerationTask(input: $input) {
      ...ImageGenerationReservedTaskFields
    }
  }`,
  [imageGenerationReservedTaskFieldsFragment],
)
