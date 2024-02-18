import { gql } from "@/graphql/__generated__"

export const updateRatingImageGenerationTaskMutation = gql(`
  mutation UpdateRatingImageGenerationTask($input: UpdateRatingImageGenerationTaskInput!) {
    updateRatingImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
