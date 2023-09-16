import { gql } from "@apollo/client"

export const DELETE_ALBUM_WORK = gql`
  mutation DeleteAlbumWork($input: DeleteAlbumWorkInput!) {
    deleteAlbumWork(input: $input) {
      id
    }
  }
`
