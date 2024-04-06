import { gql } from "@/_graphql/__generated__"

export const deleteCommentMutation = gql(`
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
    }
  }
`)
