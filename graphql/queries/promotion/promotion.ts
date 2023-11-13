import { gql } from "@apollo/client"

export default gql`
  query Promotion($id: ID!) {
    promotion(id: $id) {
      id
      title
      description
      imageURL
      pageURL
      startDateTime
      endDateTime
    }
  }
`
