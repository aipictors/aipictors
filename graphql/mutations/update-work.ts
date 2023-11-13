import { gql } from "@apollo/client"

export default gql`
  mutation UpdateWork($input: UpdateWorkInput!) {
    updateWork(input: $input) {
      id
      title
      description
    }
  }
`
