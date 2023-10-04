import { gql } from "@apollo/client"

export const WORK_AWARDS = gql`
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
