import { graphql } from "gql.tada"

export const deleteAlbumWorkMutation = graphql(
  `mutation DeleteAlbumWork($input: DeleteAlbumWorkInput!) {
    deleteAlbumWork(input: $input) {
      id
    }
  }`,
)
