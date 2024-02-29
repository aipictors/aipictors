import { gql } from "@/graphql/__generated__"

export const deleteImageGenerationMemoMutation = gql(`
  mutation DeleteImageGenerationMemo($input: DeleteImageGenerationMemoInput!) {
    deleteImageGenerationMemo(input: $input) {
      ...ImageGenerationMemoFields
    }
  }
`)
