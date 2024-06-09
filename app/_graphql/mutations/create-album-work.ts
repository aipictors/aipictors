import { graphql } from "gql.tada"

export const createAlbumWorkMutation = graphql(
  `mutation CreateAlbumWork($input: CreateAlbumWorkInput!) {
    createAlbumWork(input: $input) {
      id
    }
  }`,
)
