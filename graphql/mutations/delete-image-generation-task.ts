import { gql } from "@/graphql/__generated__"

export const deleteImageGenerationTaskMutation = gql(`
  mutation DeleteImageGenerationTask($input: DeleteImageGenerationTask!) {
    deleteImageGenerationTask(input: $input)
  }
`)
