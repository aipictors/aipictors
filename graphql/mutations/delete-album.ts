import { gql } from "@apollo/client"

export const deleteAlbumMutation = gql`
  mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }
`
