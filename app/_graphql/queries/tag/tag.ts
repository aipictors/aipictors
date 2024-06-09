import { graphql } from "gql.tada"

export const tagQuery = graphql(
  `query Tag($name: String!) {
    tag(name: $name) {
      id
      name
      isLiked
      isWatched
      isMuted
    }
  }`,
)
