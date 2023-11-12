import { gql } from "@apollo/client"

export default gql`
  mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input)
  }
`
