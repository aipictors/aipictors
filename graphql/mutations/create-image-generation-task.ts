import { imageGenerationTaskFieldsFragment } from "@/graphql/fragments/image-generation-task-field"
import { gql } from "@apollo/client"

export const createImageGenerationTaskMutation = gql`
  ${imageGenerationTaskFieldsFragment}
  mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`
