import { graphql } from "gql.tada"

export const partialPromotionFieldsFragment = graphql(
  `fragment PartialPromotionFields on PromotionNode @_unmask {
    id
    title
    description
    imageURL
    pageURL
    startDateTime
    endDateTime
  }`,
)
