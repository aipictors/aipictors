import { gql } from "@/_graphql/__generated__"

export const createAlbumMutation = gql(`
  mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
    }
  }
`)
