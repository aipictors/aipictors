import { graphql } from "gql.tada"

export const appEventQuery = graphql(
  `query AppEvent($slug: String!) {
    appEvent(slug: $slug) {
      id
      description
      title
      slug
      thumbnailImageUrl
      headerImageUrl
      startAt
      endAt
      tag
    }
  }`,
)
