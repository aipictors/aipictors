import { graphql } from "gql.tada"

export const updateAlbumMutation = graphql(
  `mutation UpdateAlbum($input: UpdateAlbumInput!) {
    updateAlbum(input: $input) {
      id
      title
    }
  }`,
)
