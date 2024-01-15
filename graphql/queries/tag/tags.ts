import { partialTagFieldsFragment } from "@/graphql/fragments/partial-tag-fields"
import { gql } from "@apollo/client"

export const tagsQuery = gql`
  ${partialTagFieldsFragment}
  query Tags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }
`
