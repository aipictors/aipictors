import { gql } from "@apollo/client"

export const PROMOTIONS = gql`
  query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }
`
