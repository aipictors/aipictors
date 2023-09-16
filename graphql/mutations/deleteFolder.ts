import { gql } from "@apollo/client"

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }
`
