import { gql } from "@/_graphql/__generated__"

export const cancelImageGenerationTaskMutation = gql(`
  mutation CancelImageGenerationTask($input: CancelImageGenerationTaskInput!) {
    cancelImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
