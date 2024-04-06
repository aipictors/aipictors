import { gql } from "@/_graphql/__generated__"

export const cancelImageGenerationReservedTaskMutation = gql(`
  mutation CancelImageGenerationReservedTask($input: CancelImageGenerationReservedTaskInput!) {
    cancelImageGenerationReservedTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
