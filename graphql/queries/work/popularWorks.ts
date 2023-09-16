import { gql } from "@apollo/client"

export const POPULAR_WORKS = gql`
  query PopularWorks {
    popularWorks(where: { rating: G }) {
      ...PartialWorkFields
    }
  }
`
