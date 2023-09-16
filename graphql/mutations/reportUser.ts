import { gql } from "@apollo/client"

export const REPORT_USER = gql`
  mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input)
  }
`
