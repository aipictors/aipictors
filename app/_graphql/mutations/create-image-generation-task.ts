import { gql } from "@/_graphql/__generated__"

export const createImageGenerationTaskMutation = gql(`
  mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
