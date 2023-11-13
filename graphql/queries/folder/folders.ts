import { gql } from "@apollo/client"

export default gql`
  query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      ...PartialFolderFields
      user {
        ...PartialUserFields
      }
    }
  }
`
