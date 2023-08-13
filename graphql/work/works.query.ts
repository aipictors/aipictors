import { gql } from "@apollo/client"

export const WorkFields = gql`
  query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...FeedWorkFields
    }
  }
`
