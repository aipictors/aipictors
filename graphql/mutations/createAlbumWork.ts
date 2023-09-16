import { gql } from "@apollo/client"

export const CREATE_ALBUM_WORK = gql`
  mutation CreateAlbumWork($input: CreateAlbumWorkInput!) {
    createAlbumWork(input: $input) {
      id
    }
  }
`
