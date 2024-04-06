import { gql } from "@/_graphql/__generated__"

export const updateProtectedImageGenerationTaskMutation = gql(`
  mutation UpdateProtectedImageGenerationTask($input: UpdateProtectedImageGenerationTaskInput!) {
    updateProtectedImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
