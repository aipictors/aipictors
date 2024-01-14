import { gql } from "@apollo/client"

export const reportWorkMutation = gql`
  mutation ReportWork($input: ReportWorkInput!) {
    reportWork(input: $input)
  }
`
