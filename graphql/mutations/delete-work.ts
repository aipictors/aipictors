import { gql } from "@apollo/client"

export const deleteWorkMutation = gql`
  mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }
`
