import { gql } from "@apollo/client"

export const TAGS = gql`
  query Tags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }
`
