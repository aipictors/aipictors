import { gql } from "@apollo/client"

export const REPORT_WORK = gql`
  mutation ReportWork($input: ReportWorkInput!) {
    reportWork(input: $input)
  }
`
