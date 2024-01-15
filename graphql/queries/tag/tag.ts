import { gql } from "@/graphql/__generated__"

export const tagQuery = gql(`
  query Tag($name: String!) {
    tag(name: $name) {
      id
      name
      isLiked
      isWatched
      isMuted
    }
  }
`)
