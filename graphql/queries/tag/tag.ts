import { gql } from "@apollo/client"

export const tagQuery = gql`
  query Tag($name: String!) {
    tag(name: $name) {
      id
      name
      isLiked
      isWatched
      isMuted
    }
  }
`
