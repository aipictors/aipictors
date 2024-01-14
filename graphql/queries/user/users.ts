import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const usersQuery = gql`
  query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
  ${partialUserFieldsFragment}
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }
`
