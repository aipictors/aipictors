import { gql } from "@apollo/client"

export const createResponseCommentMutation = gql`
  mutation CreateResponseComment($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }
`
