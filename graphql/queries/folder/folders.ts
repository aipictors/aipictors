import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const foldersQuery = gql`
  ${partialFolderFieldsFragment}
  ${partialUserFieldsFragment}
  query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      ...PartialFolderFields
      user {
        ...PartialUserFields
      }
    }
  }
`
