import { gql } from "@apollo/client"

export const USERS = gql`
  query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }
`
