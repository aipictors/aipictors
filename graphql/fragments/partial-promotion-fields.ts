import { gql } from "@apollo/client"

export const partialPromotionFieldsFragment = gql`
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
