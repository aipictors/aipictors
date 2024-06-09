import { partialPromotionFieldsFragment } from "@/_graphql/fragments/partial-promotion-fields"
import { graphql } from "gql.tada"

export const promotionsQuery = graphql(
  `query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }`,
  [partialPromotionFieldsFragment],
)
