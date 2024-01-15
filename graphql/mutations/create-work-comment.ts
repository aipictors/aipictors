import { gql } from "@apollo/client"

export const createWorkCommentMutation = gql`
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }
`
