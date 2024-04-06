import { gql } from "@/_graphql/__generated__"

export const promotionsQuery = gql(`
  query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }
`)
