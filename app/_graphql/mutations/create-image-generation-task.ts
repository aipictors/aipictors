import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

export const createImageGenerationTaskMutation = graphql(
  `mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
