import { gql } from "@apollo/client"

export default gql`
  query DailyTheme($id: ID!, $offset: Int!, $limit: Int!) {
    dailyTheme(id: $id) {
      id
      title
      dateText
      year
      month
      day
      worksCount
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
