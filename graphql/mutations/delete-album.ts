import { gql } from "@/graphql/__generated__"

export const deleteAlbumMutation = gql(`
  mutation DeleteAlbum($input: DeleteAlbumInput!) {
    deleteAlbum(input: $input) {
      id
    }
  }
`)
