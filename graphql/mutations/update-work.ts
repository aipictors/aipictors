import { gql } from "@apollo/client"

export const updateWorkMutation = gql`
  mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
    }
  }
`
