import { gql } from "@apollo/client"

export default gql`
  query Tags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }
`
