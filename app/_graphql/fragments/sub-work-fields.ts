import { graphql } from "gql.tada"

export const subWorkFieldsFragment = graphql(
  `fragment SubWorkFields on SubWorkNode @_unmask {
    id
    image {
      id
      downloadURL
    }
    thumbnailImage {
      id
      downloadURL
    }
  }`,
)
