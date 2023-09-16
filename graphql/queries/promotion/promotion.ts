import { gql } from "@apollo/client"

export const PROMOTION = gql`
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
