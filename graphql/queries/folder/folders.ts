import { gql } from "@/graphql/__generated__"
import { partialFolderFieldsFragment } from "@/graphql/fragments/partial-folder-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const foldersQuery = gql(`
  query Folders($offset: Int!, $limit: Int!, $where: FoldersWhereInput) {
    folders(offset: $offset, limit: $limit, where: $where) {
      ...PartialFolderFields
      user {
        ...PartialUserFields
      }
    }
  }
`)
