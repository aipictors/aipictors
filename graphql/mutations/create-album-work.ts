import { gql } from "@apollo/client"

export default gql`
  mutation CreateAlbumWork($input: CreateAlbumWorkInput!) {
    createAlbumWork(input: $input) {
      id
    }
  }
`
