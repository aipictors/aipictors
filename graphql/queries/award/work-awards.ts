import { feedWorkFieldsFragment } from "@/graphql/fragments/feed-work"
import { gql } from "@apollo/client"

export const workAwardsQuery = gql`
  ${feedWorkFieldsFragment}
  query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      id
      index
      dateText
      work {
        ...FeedWorkFields
      }
    }
  }
`
