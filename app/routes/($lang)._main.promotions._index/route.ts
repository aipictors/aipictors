import { graphql } from "gql.tada"

export default function Route() {
  return null
}

const promotionsQuery = graphql(
  `query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
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

const promotionQuery = graphql(
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
