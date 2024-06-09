import { graphql } from "gql.tada"

export const reportFolderMutation = graphql(
  `mutation ReportFolder($input: ReportFolderInput!) {
    reportFolder(input: $input)
  }`,
)
