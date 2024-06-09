import { graphql } from "gql.tada"

export const reportUserMutation = graphql(
  `mutation ReportUser($input: ReportUserInput!) {
    reportUser(input: $input)
  }`,
)
