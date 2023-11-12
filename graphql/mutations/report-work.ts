import { gql } from "@apollo/client"

export default gql`
  mutation ReportWork($input: ReportWorkInput!) {
    reportWork(input: $input)
  }
`
