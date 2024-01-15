import { gql } from "@apollo/client"

export const reportCommentMutation = gql`
  mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`
