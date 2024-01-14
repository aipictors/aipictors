import { gql } from "@apollo/client"

export const deleteCommentMutation = gql`
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }
`
