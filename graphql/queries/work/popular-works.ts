import { gql } from "@apollo/client"

export default gql`
  query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`
