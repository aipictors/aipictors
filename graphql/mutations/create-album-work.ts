import { gql } from "@apollo/client"

export const createAlbumWorkMutation = gql`
  mutation CreateAlbumWork($input: CreateAlbumWorkInput!) {
    createAlbumWork(input: $input) {
      id
    }
  }
`
