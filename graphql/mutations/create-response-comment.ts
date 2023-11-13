import { gql } from "@apollo/client"

export default gql`
  mutation CreateResponseComment($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }
`
