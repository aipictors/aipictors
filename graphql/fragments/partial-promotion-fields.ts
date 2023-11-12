import { gql } from "@apollo/client"

export default gql`
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
