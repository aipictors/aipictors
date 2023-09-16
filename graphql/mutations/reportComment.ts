import { gql } from "@apollo/client"

export const REPORT_COMMENT = gql`
  mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`
