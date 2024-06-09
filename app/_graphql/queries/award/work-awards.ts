import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      id
      index
      dateText
      work {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
