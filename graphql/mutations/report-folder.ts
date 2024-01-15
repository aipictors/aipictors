import { gql } from "@/graphql/__generated__"

export const reportFolderMutation = gql(`
  mutation ReportFolder($input: ReportFolderInput!) {
    reportFolder(input: $input)
  }
`)
