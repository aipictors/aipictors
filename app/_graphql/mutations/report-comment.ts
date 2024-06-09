import { graphql } from "gql.tada"

export const reportCommentMutation = graphql(
  `mutation ReportComment($input: ReportCommentInput!) {
    reportComment(input: $input)
  }`,
)
