import { gql } from "@/_graphql/__generated__"

export const deleteFolderMutation = gql(`
  mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }
`)
