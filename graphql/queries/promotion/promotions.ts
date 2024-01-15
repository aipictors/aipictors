import { partialPromotionFieldsFragment } from "@/graphql/fragments/partial-promotion-fields"
import { gql } from "@apollo/client"

export const promotionsQuery = gql`
  ${partialPromotionFieldsFragment}
  query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }
`
