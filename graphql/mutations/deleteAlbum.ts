import { gql } from "@apollo/client"

export const DELETE_ALBUM = gql`
  mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }
`
