import { gql } from "@/graphql/__generated__"

export const cancelImageGenerationTaskMutation = gql(`
  mutation ChangeImageGenerationTask($input: CancelImageGenerationTaskInput!) {
    cancelImageGenerationTask(input: $input)
  }
`)
