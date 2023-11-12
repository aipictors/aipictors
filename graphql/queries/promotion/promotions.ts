import { gql } from "@apollo/client"

export default gql`
  query Promotions($offset: Int!, $limit: Int!) {
    promotions(offset: $offset, limit: $limit) {
      ...PartialPromotionFields
    }
  }
`
