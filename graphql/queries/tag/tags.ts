import { gql } from "@/graphql/__generated__"
import { partialTagFieldsFragment } from "@/graphql/fragments/partial-tag-fields"

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
