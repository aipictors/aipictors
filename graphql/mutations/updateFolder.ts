import { gql } from "@apollo/client"

export const UPDATE_FOLDER = gql`
  mutation UpdateFolder($input: UpdateFolderInput!) {
    updateFolder(input: $input) {
      id
      title
      description
    }
  }
`
