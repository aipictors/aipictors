import { gql } from "@apollo/client"

export const deleteAlbumWorkMutation = gql`
  mutation DeleteAlbumWork($input: DeleteAlbumWorkInput!) {
    deleteAlbumWork(input: $input) {
      id
    }
  }
`
