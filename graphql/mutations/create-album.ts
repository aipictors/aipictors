import { gql } from "@apollo/client"

export default gql`
  mutation CreateAlbum($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
