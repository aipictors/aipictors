import { graphql } from "gql.tada"

export const promotionQuery = graphql(
  `query Promotion($id: ID!) {
    promotion(id: $id) {
      id
      title
      description
      imageURL
      pageURL
      startDateTime
      endDateTime
    }
  }`,
)
