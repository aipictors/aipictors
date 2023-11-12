import { gql } from "@apollo/client"

export default gql`
  query UserFolders($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      folders(offset: $offset, limit: $limit) {
        ...PartialFolderFields
      }
    }
  }
`
