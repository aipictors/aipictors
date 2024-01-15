import { gql } from "@/graphql/__generated__"

export const createResponseCommentMutation = gql(`
  mutation CreateResponseComment($input: CreateResponseCommentInput!) {
    createResponseComment(input: $input) {
      id
    }
  }
`)
