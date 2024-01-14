import { gql } from "@apollo/client"

export const deleteFolderMutation = gql`
  mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }
`
