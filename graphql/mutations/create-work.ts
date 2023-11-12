import { gql } from "@apollo/client"

export default gql`
  mutation CreateWork($input: CreateWorkInput!) {
    createWork(input: $input) {
      title
    }
  }
`
