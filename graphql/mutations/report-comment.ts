import { gql } from "@/graphql/__generated__"

export const reportCommentMutation = gql(`
  mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`)
