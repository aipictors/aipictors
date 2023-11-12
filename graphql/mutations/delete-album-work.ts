import { gql } from "@apollo/client"

export default gql`
  mutation DeleteAlbumWork($input: DeleteAlbumWorkInput!) {
    deleteAlbumWork(input: $input) {
      id
    }
  }
`
