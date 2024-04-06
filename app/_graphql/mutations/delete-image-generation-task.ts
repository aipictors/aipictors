import { gql } from "@/_graphql/__generated__"

export const deleteImageGenerationTaskMutation = gql(`
  mutation DeleteImageGenerationTask($input: DeleteImageGenerationTaskInput!) {
    deleteImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`)
