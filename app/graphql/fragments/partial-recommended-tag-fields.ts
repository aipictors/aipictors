import { graphql } from "gql.tada"

export const partialRecommendedTagFieldsFragment = graphql(
  `fragment PartialRecommendedTagFields on RecommendedTagNode @_unmask {
    tagName
    thumbnailUrl
  }`,
)
