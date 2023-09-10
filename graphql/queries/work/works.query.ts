import { gql } from "@apollo/client"

export const Works = gql`
  query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...FeedWorkFields
    }
  }
`
