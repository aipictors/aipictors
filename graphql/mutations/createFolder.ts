import { gql } from "@apollo/client"

export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
