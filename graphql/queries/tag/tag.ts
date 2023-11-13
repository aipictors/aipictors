import { gql } from "@apollo/client"

export default gql`
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
