import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { graphql } from "gql.tada"

export const whiteListTagsQuery = graphql(
  `query WhiteListTags($where: WhiteListTagsInput!) {
    whiteListTags(where: $where) {
      ...PartialTagFields
    }
  }`,
  [partialTagFieldsFragment],
)
