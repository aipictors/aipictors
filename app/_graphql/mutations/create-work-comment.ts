import { gql } from "@/_graphql/__generated__"

export const createWorkCommentMutation = gql(`
  mutation CreateWorkComment($input: CreateWorkCommentInput!) {
    createWorkComment(input: $input) {
      id
    }
  }
`)
