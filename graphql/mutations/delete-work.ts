import { gql } from "@apollo/client"

export default gql`
  mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }
`
