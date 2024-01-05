import { gql } from "@apollo/client"

export default gql`
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`
