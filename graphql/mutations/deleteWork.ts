import { gql } from "@apollo/client"

export const DELETE_WORK = gql`
  mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }
`
