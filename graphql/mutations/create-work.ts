import { gql } from "@/graphql/__generated__"

export const createWorkMutation = gql(`
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      title
    }
  }
`)
