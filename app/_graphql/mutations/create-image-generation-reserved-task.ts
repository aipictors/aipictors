import { gql } from "@/_graphql/__generated__"

export const createImageGenerationTaskReservedMutation = gql(`
  mutation CreateReservedImageGenerationTask($input: CreateReservedImageGenerationTaskInput!) {
    createReservedImageGenerationTask(input: $input) {
      ...ImageGenerationReservedTaskFields
    }
  }
`)
