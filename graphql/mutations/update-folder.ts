import { gql } from "@apollo/client"

export const updateFolderMutation = gql`
  mutation UpdateFolder($input: UpdateFolderInput!) {
    updateFolder(input: $input) {
      id
      title
      description
    }
  }
`
