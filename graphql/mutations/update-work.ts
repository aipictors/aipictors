import { gql } from "@/graphql/__generated__"

export const updateWorkMutation = gql(`
  mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
    }
  }
`)
