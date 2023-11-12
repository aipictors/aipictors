import { gql } from "@apollo/client"

export default gql`
  mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`
