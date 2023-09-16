import { gql } from "@apollo/client"

export const REPORT_FOLDER = gql`
  mutation ReportFolder($input: ReportFolderInput!) {
    reportFolder(input: $input)
  }
`
