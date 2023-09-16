import { gql } from "@apollo/client"

export const CREATE_RESPONSE_COMMENT = gql`
  mutation CreateResponseComment($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }
`
