import { gql } from "@apollo/client"

export const CREATE_ALBUM = gql`
  mutation CreateAlbum($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
