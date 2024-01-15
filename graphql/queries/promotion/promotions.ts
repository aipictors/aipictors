import { gql } from "@/graphql/__generated__"
import { partialPromotionFieldsFragment } from "@/graphql/fragments/partial-promotion-fields"

export const promotionsQuery = gql(`
  query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }
`)
