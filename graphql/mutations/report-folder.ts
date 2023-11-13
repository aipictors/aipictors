import { gql } from "@apollo/client"

export default gql`
  mutation ReportFolder($input: ReportFolderInput!) {
    reportFolder(input: $input)
  }
`
