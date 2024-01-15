import { gql } from "@apollo/client"

export const createWorkMutation = gql`
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      title
    }
  }
`
