import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { graphql } from "gql.tada"

export const tagsQuery = graphql(
  `query Tags($offset: Int!, $limit: Int!, $where: TagsWhereInput) {
    tags(offset: $offset, limit: $limit, where: $where) {
      ...PartialTagFields
      isLiked
      isWatched
      isMuted
    }
  }`,
  [partialTagFieldsFragment],
)
