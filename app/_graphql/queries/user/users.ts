import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const usersQuery = graphql(
  `query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }`,
  [partialUserFieldsFragment],
)
