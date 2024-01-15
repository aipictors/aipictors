import { gql } from "@/graphql/__generated__"

export const deleteAlbumWorkMutation = gql(`
  mutation DeleteAlbumWork($input: DeleteAlbumWorkInput!) {
    deleteAlbumWork(input: $input) {
      id
    }
  }
`)
