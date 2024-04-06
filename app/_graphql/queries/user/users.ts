import { gql } from "@/_graphql/__generated__"

export const usersQuery = gql(`
  query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }
`)
