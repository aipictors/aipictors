import { gql } from "@apollo/client"

export const PARTIAL_PROMOTION_FIELDS = gql`
  fragment PartialPromotionFields on PromotionNode {
    id
    title
    description
    imageURL
    pageURL
    startDateTime
    endDateTime
  }
`
