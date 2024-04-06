import { gql } from "@/_graphql/__generated__"

export const createAlbumWorkMutation = gql(`
  mutation CreateAlbumWork($input: CreateAlbumWorkInput!) {
    createAlbumWork(input: $input) {
      id
    }
  }
`)
