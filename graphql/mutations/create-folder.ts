import { gql } from "@apollo/client"

export const createFolderMutation = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
