import { graphql } from "gql.tada"

export const reportWorkMutation = graphql(
  `mutation ReportWork($input: ReportWorkInput!) {
    reportWork(input: $input)
  }`,
)
