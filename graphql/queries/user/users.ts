import { gql } from "@apollo/client"

export default gql`
  query Users($offset: Int!, $limit: Int!, $where: UsersWhereInput) {
    users(offset: $offset, limit: $limit, where: $where) {
      ...PartialUserFields
    }
  }
`
