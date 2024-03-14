import { gql } from "@/graphql/__generated__"

export const createImageGenerationMemoMutation = gql(`
  mutation CreateImageGenerationMemo($input: CreateImageGenerationMemoInput!) {
    createImageGenerationMemo(input: $input) {
      ...ImageGenerationMemoFields
    }
  }
`)
