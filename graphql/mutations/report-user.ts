import { gql } from "@apollo/client"

export const reportUserMutation = gql`
  mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input)
  }
`
