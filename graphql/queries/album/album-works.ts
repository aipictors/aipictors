import { gql } from "@/graphql/__generated__"

export const albumWorksQuery = gql(`
  query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
