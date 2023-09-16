import { gql } from "@apollo/client"

export const FOLDERS = gql`
  query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      ...PartialFolderFields
      user {
        ...PartialUserFields
      }
    }
  }
`
