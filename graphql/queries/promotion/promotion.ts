import { gql } from "@/graphql/__generated__"

export const promotionQuery = gql(`
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
`)
