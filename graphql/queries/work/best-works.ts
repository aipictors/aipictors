import { gql } from "@apollo/client"

export const BEST_WORKS = gql`
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`
