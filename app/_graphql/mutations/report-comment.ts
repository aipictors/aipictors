import { gql } from "@/_graphql/__generated__"

export const reportCommentMutation = gql(`
  mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`)
