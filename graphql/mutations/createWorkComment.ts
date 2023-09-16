import { gql } from "@apollo/client"

export const CREATE_WORK_COMMENT = gql`
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }
`
