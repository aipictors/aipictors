import { gql } from "@apollo/client"

export const createAlbumMutation = gql`
  mutation CreateAlbum($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
