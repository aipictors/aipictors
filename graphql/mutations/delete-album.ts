import { gql } from "@apollo/client"

export default gql`
  mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }
`
