import { gql } from "@apollo/client"

export const CREATE_IMAGE_GENERATION_TASK = gql`
  mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`
