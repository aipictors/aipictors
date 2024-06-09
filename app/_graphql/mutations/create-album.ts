import { graphql } from "gql.tada"

export const createAlbumMutation = graphql(
  `mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
    }
  }`,
)
