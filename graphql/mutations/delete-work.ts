import { gql } from "@/graphql/__generated__"

export const deleteWorkMutation = gql(`
  mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }
`)
