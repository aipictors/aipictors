import { gql } from "@/_graphql/__generated__"

export const tagsQuery = gql(`
  query Tags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }
`)
