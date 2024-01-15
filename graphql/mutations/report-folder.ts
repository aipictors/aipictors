import { gql } from "@apollo/client"

export const reportFolderMutation = gql`
  mutation ReportFolder($input: ReportFolderInput!) {
    reportFolder(input: $input)
  }
`
