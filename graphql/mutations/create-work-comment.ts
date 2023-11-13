import { gql } from "@apollo/client"

export default gql`
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }
`
