import { gql } from "@/graphql/__generated__"

export const workAwardsQuery = gql(`
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
`)
