import { gql } from "@/graphql/__generated__"

export const cancelImageGenerationReservedTaskMutation = gql(`
  mutation CancelImageGenerationReservedTask($input: CancelImageGenerationReservedTaskInput!) {
    cancelImageGenerationReservedTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
