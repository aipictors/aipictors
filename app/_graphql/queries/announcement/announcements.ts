import { graphql } from "gql.tada"

export const announcementsQuery = graphql(
  `query Announcements {
    announcements(offset: 0, limit: 16) {
      id
      title
      body
      publishedAt
    }
  }`,
)
