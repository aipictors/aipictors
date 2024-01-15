import { gql } from "@/graphql/__generated__"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const usersQuery = gql(`
  query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }
`)
